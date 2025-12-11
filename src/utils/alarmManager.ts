// src/notifications/alarmManager.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * HOW TO USE (summary)
 * --------------------
 * 1. Call `initTaskAlarms()` once in your app (e.g. in RootLayout or PlannerScreen useEffect).
 * 2. When you create / update a task, call `scheduleTaskReminder(...)`.
 * 3. If you delete a task, you can call `cancelReminderById(id)` with the returned id.
 */

// ---------------- TYPES ----------------

export type AlarmLeadMinutes = 0 | 5 | 30;
export type AlarmMode = 'silent' | 'sound' | 'vibrate';

export interface TaskForAlarm {
  id: string;
  title: string;
  date: string;      // "YYYY-MM-DD"
  startTime?: string; // "HH:mm" (24h) e.g. "09:30"
}

export interface AlarmSettings {
  leadMinutes: AlarmLeadMinutes; // how many minutes BEFORE the task
  mode: AlarmMode;               // sound / silent / vibrate
}

// ---------------- CONSTANTS ----------------

const ANDROID_CHANNEL_ID = 'task-reminders';

// ---------------- INIT (call once) ----------------

export async function initTaskAlarms() {
  // Android: create channel for reminders
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Task reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB'
      });
    } catch (e) {
      console.warn('Failed to set Android notification channel', e);
    }
  }

  // Ask permissions once
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  } catch (e) {
    console.warn('Failed to get notification permissions', e);
  }
}

// ---------------- HELPER: build task Date ----------------

/**
 * Convert task.date ("YYYY-MM-DD") and optional startTime ("HH:mm")
 * into a JS Date (local time).
 */
export function getTaskStartDateTime(task: TaskForAlarm): Date {
  const [year, month, day] = task.date.split('-').map((p) => parseInt(p, 10));

  let hour = 9;
  let minute = 0;

  if (task.startTime) {
    const [h, m] = task.startTime.split(':').map((p) => parseInt(p, 10));
    if (!isNaN(h)) hour = h;
    if (!isNaN(m)) minute = m;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

// ---------------- MAIN: schedule reminder ----------------

/**
 * Schedules a notification BEFORE the task start time.
 * - Returns the notification id (string) or null if nothing was scheduled
 *   (e.g. time already passed).
 */
export async function scheduleTaskReminder(
  task: TaskForAlarm,
  settings: AlarmSettings
): Promise<string | null> {
  const { leadMinutes, mode } = settings;

  // If no reminder wanted (lead 0), don't schedule
  if (leadMinutes <= 0) {
    return null;
  }

  const taskDateTime = getTaskStartDateTime(task);

  // time when reminder should fire
  const triggerTime = new Date(taskDateTime.getTime() - leadMinutes * 60 * 1000);
  const now = new Date();

  // If the reminder time is in the past, skip scheduling
  if (triggerTime.getTime() <= now.getTime()) {
    return null;
  }

  // Notification content (use loose typing to avoid version conflicts)
  const content: any = {
    title: `Upcoming: ${task.title}`,
    body:
      leadMinutes === 5
        ? 'Starts in 5 minutes'
        : leadMinutes === 30
        ? 'Starts in 30 minutes'
        : 'Task reminder',
    data: {
      taskId: task.id,
      taskTitle: task.title,
      taskDate: task.date,
      taskStartTime: task.startTime ?? null
    }
  };

  // Sound handling (mode)
  if (mode === 'sound') {
    // default sound on both platforms
    content.sound = 'default';
  } else if (mode === 'silent') {
    content.sound = undefined;
  } else if (mode === 'vibrate') {
    // On Android, vibration comes from the channel.
    // On iOS there's no direct "vibrate only" without sound,
    // so we keep sound undefined and accept default vibration behavior.
    content.sound = undefined;
  }

  // Trigger 5 or 30 min before using DATE trigger
  const trigger: any = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: triggerTime
  };

  if (Platform.OS === 'android') {
    trigger.channelId = ANDROID_CHANNEL_ID;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger
    });
    return id;
  } catch (e) {
    console.warn('Failed to schedule task reminder', e);
    return null;
  }
}

// ---------------- CANCEL ----------------

export async function cancelReminderById(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn('Failed to cancel reminder', e);
  }
}
