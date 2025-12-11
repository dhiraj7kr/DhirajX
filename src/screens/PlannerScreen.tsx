import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { theme } from '../theme/theme';
import {
  AlarmLeadMinutes,
  AlarmMode,
  cancelReminderById,
  initTaskAlarms,
  scheduleTaskReminder
} from '../utils/alarmManager';

type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
type TaskType = 'task' | 'event';

interface Task {
  id: string;
  title: string;
  date: string; // base date: 'YYYY-MM-DD'
  startTime?: string;
  endTime?: string;
  notes?: string; // description / details
  link?: string;
  associated?: string;
  isCompleted: boolean;
  repeat: RepeatRule;
  type: TaskType;
  createdAt: string;
  updatedAt: string;

  // Alarm-related fields
  reminderLeadMinutes?: AlarmLeadMinutes;
  alarmMode?: AlarmMode;
  notificationId?: string | null;
}

const STORAGE_KEY = 'plannerTasks_v2';

// --- Date helpers ---
const toDate = (isoDate: string) => new Date(isoDate + 'T00:00:00');

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

const formatShortDate = (d: Date) =>
  d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

const formatDateLabel = (d: Date) =>
  d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

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

// --- Planner screen ---
const PlannerScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // view mode: day / week / month
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  // modal & form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('task');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [associated, setAssociated] = useState('');
  const [repeat, setRepeat] = useState<RepeatRule>('none');

  // date & time picker state for the form
  const [formDate, setFormDate] = useState<Date>(selectedDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // alarm form state
  const [alarmLead, setAlarmLead] = useState<AlarmLeadMinutes>(0);
  const [alarmMode, setAlarmMode] = useState<AlarmMode>('sound');

  // --- Init alarms once ---
  useEffect(() => {
    initTaskAlarms();
  }, []);

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

  const selectedDateStr = useMemo(
    () => formatYMD(selectedDate),
    [selectedDate]
  );

  // --- Tasks filtering for selected date (daily view) ---
  const tasksForSelectedDate = useMemo(
    () => tasks.filter((t) => occursOnDate(t, selectedDateStr)),
    [tasks, selectedDateStr]
  );

  const hasTasksOnDate = (dateStr: string) =>
    tasks.some((t) => occursOnDate(t, dateStr));

  // --- View-mode filtering (day/week/month) ---
  const tasksForView = useMemo(() => {
    if (viewMode === 'day') {
      return tasksForSelectedDate;
    }

    const resultMap = new Map<string, Task>();

    if (viewMode === 'week') {
      // week starting Sunday
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // go back to Sunday
      for (let i = 0; i < 7; i++) {
        const d = new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate() + i
        );
        const dStr = formatYMD(d);
        tasks.forEach((t) => {
          if (occursOnDate(t, dStr)) {
            resultMap.set(t.id, t);
          }
        });
      }
    } else if (viewMode === 'month') {
      const y = selectedDate.getFullYear();
      const m = selectedDate.getMonth();
      const totalDays = new Date(y, m + 1, 0).getDate();
      for (let day = 1; day <= totalDays; day++) {
        const d = new Date(y, m, day);
        const dStr = formatYMD(d);
        tasks.forEach((t) => {
          if (occursOnDate(t, dStr)) {
            resultMap.set(t.id, t);
          }
        });
      }
    }

    return Array.from(resultMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [tasks, tasksForSelectedDate, selectedDate, viewMode]);

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
  };

  // --- Task CRUD ---
  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setType('task');
    setStartTime('');
    setEndTime('');
    setNotes('');
    setLink('');
    setAssociated('');
    setRepeat('none');
    setFormDate(selectedDate);
    setAlarmLead(0);
    setAlarmMode('sound');
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setType(task.type);
    setStartTime(task.startTime || '');
    setEndTime(task.endTime || '');
    setNotes(task.notes || '');
    setLink(task.link || '');
    setAssociated(task.associated || '');
    setRepeat(task.repeat);
    setFormDate(toDate(task.date));
    setAlarmLead(task.reminderLeadMinutes ?? 0);
    setAlarmMode(task.alarmMode ?? 'sound');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    const nowIso = new Date().toISOString();
    const baseDateStr = formatYMD(formDate);

    if (editingTask) {
      const updated: Task = {
        ...editingTask,
        title: title.trim(),
        type,
        date: baseDateStr,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        notes: notes || undefined,
        link: link || undefined,
        associated: associated || undefined,
        repeat,
        reminderLeadMinutes: alarmLead,
        alarmMode,
        updatedAt: nowIso
      };

      // cancel previous reminder if any
      if (editingTask.notificationId) {
        await cancelReminderById(editingTask.notificationId);
        updated.notificationId = null;
      }

      // schedule new reminder if configured
      if (alarmLead > 0 && updated.startTime) {
        const reminderId = await scheduleTaskReminder(
          {
            id: updated.id,
            title: updated.title,
            date: updated.date,
            startTime: updated.startTime
          },
          {
            leadMinutes: alarmLead,
            mode: alarmMode
          }
        );
        updated.notificationId = reminderId;
      }

      const next = tasks.map((t) => (t.id === editingTask.id ? updated : t));
      await saveTasks(next);
    } else {
      const newTaskId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const newTaskBase: Task = {
        id: newTaskId,
        title: title.trim(),
        date: baseDateStr,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        notes: notes || undefined,
        link: link || undefined,
        associated: associated || undefined,
        isCompleted: false,
        repeat,
        type,
        createdAt: nowIso,
        updatedAt: nowIso,
        reminderLeadMinutes: alarmLead,
        alarmMode,
        notificationId: null
      };

      let notificationId: string | null = null;
      if (alarmLead > 0 && newTaskBase.startTime) {
        notificationId = await scheduleTaskReminder(
          {
            id: newTaskBase.id,
            title: newTaskBase.title,
            date: newTaskBase.date,
            startTime: newTaskBase.startTime
          },
          {
            leadMinutes: alarmLead,
            mode: alarmMode
          }
        );
      }

      const newTask: Task = {
        ...newTaskBase,
        notificationId
      };

      await saveTasks([...tasks, newTask]);
    }

    setModalVisible(false);
  };

  const toggleComplete = (task: Task) => {
    const next = tasks.map((t) =>
      t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    saveTasks(next);
  };

  const deleteTask = async (task: Task) => {
    if (task.notificationId) {
      await cancelReminderById(task.notificationId);
    }
    const next = tasks.filter((t) => t.id !== task.id);
    saveTasks(next);
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
                key={`day-${day}`}
                style={[
                  styles.calendarCell,
                  selected && styles.calendarCellSelected
                ]}
                onPress={() => onSelectDay(day)}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    selected && styles.calendarDayTextSelected
                  ]}
                >
                  {day}
                </Text>
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

        {/* View mode chips */}
        <View style={styles.viewModeRow}>
          {(['day', 'week', 'month'] as const).map((mode) => (
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

        {/* Tasks list */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeaderRow}>
            <View>
              <Text style={styles.tasksTitle}>Tasks & events</Text>
              <Text style={styles.tasksDateLabel}>
                {viewMode === 'day'
                  ? formatDateLabel(selectedDate)
                  : viewMode === 'week'
                  ? 'This week'
                  : 'This month'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={openCreateModal}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addTaskButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {tasksForView.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptySubtitle}>
                Add a task or event to get started.
              </Text>
            </View>
          ) : (
            tasksForView.map((task) => (
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
                      <Text style={styles.taskMeta}>
                        {task.date}
                        {task.startTime ? ` · ${task.startTime}` : ''}
                      </Text>
                      <Text style={styles.taskMeta}>
                        {'  · '}{task.type === 'task' ? 'Task' : 'Event'}
                      </Text>
                      {task.repeat !== 'none' && (
                        <Text style={styles.taskMeta}>
                          {'  · '}
                          {task.repeat.charAt(0).toUpperCase() +
                            task.repeat.slice(1)}
                        </Text>
                      )}
                    </View>
                    {task.notes ? (
                      <Text style={styles.taskNotes} numberOfLines={2}>
                        {task.notes}
                      </Text>
                    ) : null}
                    {task.link ? (
                      <Text style={styles.taskMeta} numberOfLines={1}>
                        🔗 {task.link}
                      </Text>
                    ) : null}
                    {task.associated ? (
                      <Text style={styles.taskMeta} numberOfLines={1}>
                        👤 {task.associated}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTask(task)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal */}
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

            <Text style={styles.modalLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What do you want to do?"
              placeholderTextColor={theme.colors.textSecondary}
            />

            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.chipRow}>
              {(['task', 'event'] as TaskType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.chip,
                    type === t && styles.chipSelected
                  ]}
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

            {/* Date & Time */}
            <Text style={styles.modalLabel}>Date</Text>
            <TouchableOpacity
              style={styles.inputLikeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputLikeButtonText}>
                {formatShortDate(formDate)}
              </Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.modalLabel}>Start time</Text>
                <TouchableOpacity
                  style={styles.inputLikeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.inputLikeButtonText}>
                    {startTime || 'Select time'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.modalLabel}>End time</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:30"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* Repeat */}
            <Text style={styles.modalLabel}>Repeat</Text>
            <View style={styles.chipRow}>
              {(['none', 'daily', 'weekly', 'monthly', 'yearly'] as RepeatRule[]).map(
                (r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.chip,
                      repeat === r && styles.chipSelected
                    ]}
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

            {/* Reminder lead time */}
            <Text style={styles.modalLabel}>Reminder</Text>
            <View style={styles.chipRow}>
              {[0, 5, 30].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.chip,
                    alarmLead === (m as AlarmLeadMinutes) && styles.chipSelected
                  ]}
                  onPress={() => setAlarmLead(m as AlarmLeadMinutes)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      alarmLead === (m as AlarmLeadMinutes) &&
                        styles.chipTextSelected
                    ]}
                  >
                    {m === 0 ? 'None' : `${m} min before`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Alarm mode */}
            <Text style={styles.modalLabel}>Alarm mode</Text>
            <View style={styles.chipRow}>
              {(['silent', 'vibrate', 'sound'] as AlarmMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.chip,
                    alarmMode === mode && styles.chipSelected
                  ]}
                  onPress={() => setAlarmMode(mode)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      alarmMode === mode && styles.chipTextSelected
                    ]}
                  >
                    {mode === 'silent'
                      ? 'Silent'
                      : mode === 'vibrate'
                      ? 'Vibrate'
                      : 'Sound'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description, link, associated */}
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

            <Text style={styles.modalLabel}>Associated (person / project)</Text>
            <TextInput
              style={styles.input}
              value={associated}
              onChangeText={setAssociated}
              placeholder="e.g. Client name, project name"
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

        {/* Date picker */}
        {showDatePicker && (
          <DateTimePicker
            value={formDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event: any, date?: Date) => {
              setShowDatePicker(false);
              if (date) {
                setFormDate(date);
              }
            }}
          />
        )}

        {/* Time picker */}
        {showTimePicker && (
          <DateTimePicker
            value={formDate}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event: any, date?: Date) => {
              setShowTimePicker(false);
              if (date) {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                setStartTime(`${hours}:${minutes}`);
              }
            }}
          />
        )}
      </Modal>
    </View>
  );
};

export default PlannerScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  container: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(14), // nice distance from top like Home
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
    aspectRatio: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2
  },
  calendarCellSelected: {
    backgroundColor: '#E0ECFF',
    borderRadius: 999
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
    marginRight: 8
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
    justifyContent: 'space-between'
  },
  rowItem: {
    flex: 1
  },
  inputLikeButton: {
    marginTop: 4,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center'
  },
  inputLikeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text
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
