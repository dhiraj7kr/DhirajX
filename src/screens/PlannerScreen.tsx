import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, {
  DateTimePickerEvent
} from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { theme } from '../theme/theme';

type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
type TaskType = 'task' | 'event';
type ReminderMode = 'silent' | 'vibrate' | 'tone';
type ViewMode = 'day' | 'week' | 'month';

interface Task {
  id: string;
  title: string;
  date: string; // base date: 'YYYY-MM-DD'
  startTime?: string; // 'HH:mm'
  endTime?: string;   // 'HH:mm'
  notes?: string;     // description
  link?: string;
  associatedWith?: string;
  isCompleted: boolean;
  repeat: RepeatRule;
  type: TaskType;
  reminderMinutesBefore?: number; // 0 | 5 | 30
  reminderMode?: ReminderMode;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'plannerTasks_v1';

// --- Helpers ---
const toDate = (isoDate: string) => new Date(isoDate + 'T00:00:00');

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const occursOnDate = (task: Task, dateStr: string): boolean => {
  const base = toDate(task.date);
  const current = toDate(dateStr);

  if (task.repeat === 'none') {
    return isSameDay(base, current);
  }

  if (current.getTime() < base.getTime()) return false;

  switch (task.repeat) {
    case 'daily':
      return true;
    case 'weekly':
      return base.getDay() === current.getDay();
    case 'monthly':
      return base.getDate() === current.getDate();
    case 'yearly':
      return (
        base.getDate() === current.getDate() &&
        base.getMonth() === current.getMonth()
      );
    default:
      return false;
  }
};

const formatDateLabel = (d: Date) =>
  d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

const formatShortDate = (d: Date) =>
  d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

const ymdFromDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

const formatTimeFromDate = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0'
  )}`;

const PlannerScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // view mode
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  // modal & form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('task');
  const [taskDate, setTaskDate] = useState<Date>(new Date()); // for picker
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [associatedWith, setAssociatedWith] = useState('');
  const [repeat, setRepeat] = useState<RepeatRule>('none');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(0);
  const [reminderMode, setReminderMode] = useState<ReminderMode>('silent');

  // pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // --- Load & save from AsyncStorage ---
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Task[] = JSON.parse(stored);
          setTasks(parsed);
        }
      } catch (e) {
        console.log('Failed to load tasks', e);
      }
    })();
  }, []);

  const saveTasks = async (next: Task[]) => {
    try {
      setTasks(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.log('Failed to save tasks', e);
    }
  };

  // --- Calendar setup ---
  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric'
      }),
    [currentMonth]
  );

  const daysInMonth = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    return new Date(y, m + 1, 0).getDate();
  }, [currentMonth]);

  const firstDayOfMonth = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    return new Date(y, m, 1).getDay(); // 0 = Sunday
  }, [currentMonth]);

  const selectedDateStr = useMemo(() => ymdFromDate(selectedDate), [selectedDate]);

  const tasksForSelectedDate = useMemo(
    () => tasks.filter((t) => occursOnDate(t, selectedDateStr)),
    [tasks, selectedDateStr]
  );

  const hasTasksOnDate = (dateStr: string) =>
    tasks.some((t) => occursOnDate(t, dateStr));

  // weekly & monthly aggregations for view mode
  const tasksForWeek = useMemo(() => {
    const start = new Date(selectedDate);
    const day = start.getDay(); // 0..6
    start.setDate(start.getDate() - day); // start of week (Sunday)
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(ymdFromDate(d));
    }
    const unique: Task[] = [];
    tasks.forEach((task) => {
      if (dates.some((ds) => occursOnDate(task, ds))) {
        unique.push(task);
      }
    });
    return unique;
  }, [tasks, selectedDate]);

  const tasksForMonth = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const dates: string[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(
        `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      );
    }
    const unique: Task[] = [];
    tasks.forEach((task) => {
      if (dates.some((ds) => occursOnDate(task, ds))) {
        unique.push(task);
      }
    });
    return unique;
  }, [tasks, currentMonth, daysInMonth]);

  const tasksToRender = useMemo(() => {
    switch (viewMode) {
      case 'week':
        return tasksForWeek;
      case 'month':
        return tasksForMonth;
      case 'day':
      default:
        return tasksForSelectedDate;
    }
  }, [viewMode, tasksForSelectedDate, tasksForWeek, tasksForMonth]);

  const tasksHeaderLabel = useMemo(() => {
    if (viewMode === 'day') return formatDateLabel(selectedDate);

    if (viewMode === 'week') {
      const start = new Date(selectedDate);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${formatShortDate(start)} – ${formatShortDate(end)}`;
    }

    // month
    return monthLabel;
  }, [viewMode, selectedDate, monthLabel]);

  // --- Calendar navigation ---
  const changeMonth = (direction: 'prev' | 'next') => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const newDate =
      direction === 'prev' ? new Date(y, m - 1, 1) : new Date(y, m + 1, 1);
    setCurrentMonth(newDate);
  };

  const onSelectDay = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const d = new Date(y, m, day);
    setSelectedDate(d);
    // also update taskDate default for new tasks
    setTaskDate(d);
  };

  // --- Task CRUD ---
  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setType('task');
    setTaskDate(selectedDate);
    setStartTime('');
    setEndTime('');
    setNotes('');
    setLink('');
    setAssociatedWith('');
    setRepeat('none');
    setReminderMinutesBefore(0);
    setReminderMode('silent');
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setType(task.type);
    setTaskDate(toDate(task.date));
    setStartTime(task.startTime || '');
    setEndTime(task.endTime || '');
    setNotes(task.notes || '');
    setLink(task.link || '');
    setAssociatedWith(task.associatedWith || '');
    setRepeat(task.repeat);
    setReminderMinutesBefore(task.reminderMinutesBefore ?? 0);
    setReminderMode(task.reminderMode ?? 'silent');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const baseDateStr = ymdFromDate(taskDate);
    const now = new Date().toISOString();

    if (editingTask) {
      const updated: Task = {
        ...editingTask,
        title: title.trim(),
        date: baseDateStr,
        type,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        notes: notes || undefined,
        link: link || undefined,
        associatedWith: associatedWith || undefined,
        repeat,
        reminderMinutesBefore:
          reminderMinutesBefore > 0 ? reminderMinutesBefore : undefined,
        reminderMode,
        updatedAt: now
      };
      const next = tasks.map((t) => (t.id === editingTask.id ? updated : t));
      saveTasks(next);
    } else {
      const newTask: Task = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: title.trim(),
        date: baseDateStr,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        notes: notes || undefined,
        link: link || undefined,
        associatedWith: associatedWith || undefined,
        isCompleted: false,
        repeat,
        type,
        reminderMinutesBefore:
          reminderMinutesBefore > 0 ? reminderMinutesBefore : undefined,
        reminderMode,
        createdAt: now,
        updatedAt: now
      };
      saveTasks([...tasks, newTask]);
    }

    setModalVisible(false);
  };

  const toggleComplete = (task: Task) => {
    const next = tasks.map((t) =>
      t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    saveTasks(next);
  };

  const deleteTask = (taskId: string) => {
    const next = tasks.filter((t) => t.id !== taskId);
    saveTasks(next);
  };

  // --- Picker handlers ---
  const onDateChange = (e: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) setTaskDate(date);
  };

  const onStartTimeChange = (e: DateTimePickerEvent, date?: Date) => {
    setShowStartTimePicker(false);
    if (date) setStartTime(formatTimeFromDate(date));
  };

  const onEndTimeChange = (e: DateTimePickerEvent, date?: Date) => {
    setShowEndTimePicker(false);
    if (date) setEndTime(formatTimeFromDate(date));
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Planner</Text>
          <Text style={styles.headerSub}>
            Calendar & tasks, connected to your day.
          </Text>
        </View>

        {/* Month selector */}
        <View style={styles.monthRow}>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={() => changeMonth('prev')}
          >
            <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={() => changeMonth('next')}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Weekday labels */}
        <View style={styles.weekDaysRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
            <Text key={`${d}-${index}`} style={styles.weekDay}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {/* Empty cells before 1st */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <View key={`empty-${idx}`} style={styles.calendarCell} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const y = currentMonth.getFullYear();
            const m = currentMonth.getMonth();
            const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(
              day
            ).padStart(2, '0')}`;
            const cellDate = new Date(y, m, day);

            const selected = isSameDay(cellDate, selectedDate);
            const today = isSameDay(cellDate, new Date());
            const has = hasTasksOnDate(dateStr);

            return (
              <TouchableOpacity
                key={day}
                style={styles.calendarCell}
                onPress={() => onSelectDay(day)}
              >
                <View
                  style={[
                    styles.dayBubble,
                    selected && styles.dayBubbleSelected
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      selected && styles.calendarDayTextSelected
                    ]}
                  >
                    {day}
                  </Text>
                </View>
                {today && !selected && <View style={styles.todayDot} />}
                {has && (
                  <View
                    style={[
                      styles.taskDot,
                      selected && styles.taskDotSelected
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tasks list */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeaderRow}>
            <View>
              <Text style={styles.tasksTitle}>Tasks & events</Text>
              <Text style={styles.tasksDateLabel}>{tasksHeaderLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={openCreateModal}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addTaskButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* View mode chips */}
          <View style={styles.viewModeRow}>
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.viewModeChip,
                  viewMode === mode && styles.viewModeChipSelected
                ]}
                onPress={() => setViewMode(mode)}
              >
                <Text
                  style={[
                    styles.viewModeChipText,
                    viewMode === mode && styles.viewModeChipTextSelected
                  ]}
                >
                  {mode === 'day'
                    ? 'Daily'
                    : mode === 'week'
                      ? 'Weekly'
                      : 'Monthly'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tasksToRender.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptySubtitle}>
                Add a task or event to get started.
              </Text>
            </View>
          ) : (
            tasksToRender.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => openEditModal(task)}
              >
                <View style={styles.taskLeft}>
                  <TouchableOpacity
                    onPress={() => toggleComplete(task)}
                    style={[
                      styles.checkbox,
                      task.isCompleted && styles.checkboxChecked
                    ]}
                  >
                    {task.isCompleted && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <View style={styles.taskTextBlock}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.isCompleted && styles.taskTitleCompleted
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskMetaRow}>
                      {(task.startTime || task.endTime) && (
                        <Text style={styles.taskMeta}>
                          {task.startTime}
                          {task.endTime ? `–${task.endTime}` : ''}
                        </Text>
                      )}
                      {task.repeat !== 'none' && (
                        <Text style={styles.taskMeta}>
                          ·{' '}
                          {task.repeat.charAt(0).toUpperCase() +
                            task.repeat.slice(1)}
                        </Text>
                      )}
                      <Text style={styles.taskMeta}>
                        · {task.type === 'task' ? 'Task' : 'Event'}
                      </Text>
                    </View>
                    {task.notes ? (
                      <Text style={styles.taskNotes} numberOfLines={2}>
                        {task.notes}
                      </Text>
                    ) : null}
                    {task.link ? (
                      <Text style={styles.taskNotes} numberOfLines={1}>
                        🔗 {task.link}
                      </Text>
                    ) : null}
                    {task.associatedWith ? (
                      <Text style={styles.taskNotes} numberOfLines={1}>
                        👥 {task.associatedWith}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTask(task.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal: Add / Edit Task */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {editingTask ? 'Edit task' : 'New task'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.modalLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What do you want to do?"
              placeholderTextColor={theme.colors.textSecondary}
            />

            {/* Type */}
            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.chipRow}>
              {(['task', 'event'] as TaskType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, type === t && styles.chipSelected]}
                  onPress={() => setType(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      type === t && styles.chipTextSelected
                    ]}
                  >
                    {t === 'task' ? 'Task' : 'Event'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date */}
            <Text style={styles.modalLabel}>Date</Text>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputButtonText}>
                {formatShortDate(taskDate)}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Start / End time */}
            <View style={styles.row}>
              <View style={[styles.rowItem, { marginRight: 8 }]}>
                <Text style={styles.modalLabel}>Start time</Text>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={styles.inputButtonText}>
                    {startTime || 'Select time'}
                  </Text>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <View style={[styles.rowItem, { marginLeft: 8 }]}>
                <Text style={styles.modalLabel}>End time</Text>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={styles.inputButtonText}>
                    {endTime || 'Select time'}
                  </Text>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Repeat */}
            <Text style={styles.modalLabel}>Repeat</Text>
            <View style={styles.chipRow}>
              {(['none', 'daily', 'weekly', 'monthly', 'yearly'] as RepeatRule[]).map(
                (r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.chip, repeat === r && styles.chipSelected]}
                    onPress={() => setRepeat(r)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        repeat === r && styles.chipTextSelected
                      ]}
                    >
                      {r === 'none'
                        ? 'No repeat'
                        : r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Reminder */}
            <Text style={styles.modalLabel}>Reminder</Text>
            <View style={styles.chipRow}>
              {[0, 5, 30].map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.chip,
                    reminderMinutesBefore === min && styles.chipSelected
                  ]}
                  onPress={() => setReminderMinutesBefore(min)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      reminderMinutesBefore === min && styles.chipTextSelected
                    ]}
                  >
                    {min === 0 ? 'No reminder' : `${min} min before`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.chipRow}>
              {(['silent', 'vibrate', 'tone'] as ReminderMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.chip,
                    reminderMode === mode && styles.chipSelected
                  ]}
                  onPress={() => setReminderMode(mode)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      reminderMode === mode && styles.chipTextSelected
                    ]}
                  >
                    {mode === 'silent'
                      ? 'Silent'
                      : mode === 'vibrate'
                        ? 'Vibrate'
                        : 'Tone'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description / Link / Associated */}
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Details, links, context..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
            />

            <Text style={styles.modalLabel}>Link</Text>
            <TextInput
              style={styles.input}
              value={link}
              onChangeText={setLink}
              placeholder="https://..."
              placeholderTextColor={theme.colors.textSecondary}
            />

            <Text style={styles.modalLabel}>Associated with</Text>
            <TextInput
              style={styles.input}
              value={associatedWith}
              onChangeText={setAssociatedWith}
              placeholder="Person, project, client..."
              placeholderTextColor={theme.colors.textSecondary}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {editingTask ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Native pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={taskDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {showStartTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={onStartTimeChange}
        />
      )}
      {showEndTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={onEndTimeChange}
        />
      )}
    </View>
  );
};

export default PlannerScreen;

const styles = StyleSheet.create({
  // full-screen container with nice padding from top
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  container: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(8), // TOP PADDING FIXED HERE
    paddingBottom: theme.spacing(4)
  },

  header: {
    marginBottom: theme.spacing(2)
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text
  },
  headerSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2
  },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1)
  },
  monthLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text
  },
  monthNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },

  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(2)
  },
  calendarCell: {
    width: `${100 / 7}%`,
    height: 40, // fixed height instead of aspectRatio -> fixes any clipping
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2
  },
  dayBubble: {
    minWidth: 30,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dayBubbleSelected: {
    backgroundColor: '#E0ECFF'
  },
  calendarDayText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text
  },
  calendarDayTextSelected: {
    fontWeight: '700',
    color: theme.colors.primary
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 2
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginTop: 2
  },
  taskDotSelected: {
    backgroundColor: theme.colors.primaryDark
  },

  tasksSection: {
    marginTop: theme.spacing(1)
  },
  tasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1)
  },
  tasksTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text
  },
  tasksDateLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  addTaskButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: theme.fontSize.xs,
    fontWeight: '600'
  },

  viewModeRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing(1)
  },
  viewModeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 6
  },
  viewModeChipSelected: {
    backgroundColor: '#E0ECFF',
    borderColor: theme.colors.primary
  },
  viewModeChipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary
  },
  viewModeChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600'
  },

  emptyState: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  emptyTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text
  },
  emptySubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    padding: theme.spacing(1.5),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing(1)
  },
  taskLeft: {
    flexDirection: 'row',
    flex: 1
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(1)
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  taskTextBlock: {
    flex: 1
  },
  taskTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary
  },
  taskMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2
  },
  taskMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary
  },
  taskNotes: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  deleteButton: {
    paddingHorizontal: 4,
    paddingVertical: 2
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'center',
    padding: theme.spacing(2)
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text
  },
  modalLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing(1)
  },
  input: {
    marginTop: 4,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.background
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top'
  },

  inputButton: {
    marginTop: 4,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background
  },
  inputButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 6,
    marginBottom: 6
  },
  chipSelected: {
    backgroundColor: '#E0ECFF',
    borderColor: theme.colors.primary
  },
  chipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary
  },
  chipTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600'
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1)
  },
  rowItem: {
    flex: 1
  },

  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing(2)
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    alignItems: 'center'
  },
  modalButtonSecondary: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8
  },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary
  },
  modalButtonSecondaryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text
  },
  modalButtonPrimaryText: {
    fontSize: theme.fontSize.sm,
    color: '#fff',
    fontWeight: '600'
  }
});
