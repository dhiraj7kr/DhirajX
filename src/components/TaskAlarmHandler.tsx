// src/components/TaskAlarmHandler.tsx
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme/theme';

interface TaskAlarmHandlerProps {
  children: React.ReactNode;
}

interface ActiveAlarm {
  notificationId: string;
  title: string;
  body?: string;
  taskId?: string;
}

const TaskAlarmHandler: React.FC<TaskAlarmHandlerProps> = ({ children }) => {
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);

  useEffect(() => {
    // Foreground notification
    const receivedSub =
      Notifications.addNotificationReceivedListener((notification) => {
        const { title, body, data } = notification.request.content;
        const notificationId = notification.request.identifier;

        setActiveAlarm({
          notificationId,
          title: title ?? 'Task reminder',
          body: body ?? '',
          taskId: (data as any)?.taskId
        });
      });

    // When user taps a notification
    const responseSub =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const n = response.notification;
        const { title, body, data } = n.request.content;
        const notificationId = n.request.identifier;

        setActiveAlarm({
          notificationId,
          title: title ?? 'Task reminder',
          body: body ?? '',
          taskId: (data as any)?.taskId
        });
      });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  const handleClose = async () => {
    if (activeAlarm?.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          activeAlarm.notificationId
        );
      } catch (e) {
        console.warn('Failed to cancel scheduled notification from handler', e);
      }
    }
    setActiveAlarm(null);
  };

  const handleSnooze = async () => {
    if (!activeAlarm) return;

    // Cancel current alarm
    if (activeAlarm.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          activeAlarm.notificationId
        );
      } catch (e) {
        console.warn('Failed to cancel scheduled notification from snooze', e);
      }
    }

    // Schedule new one 5 minutes from now
    const triggerTime = new Date(Date.now() + 5 * 60 * 1000);
    const trigger: any = { date: triggerTime };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: activeAlarm.title,
          body: activeAlarm.body || 'Snoozed task reminder',
          data: activeAlarm.taskId ? { taskId: activeAlarm.taskId } : undefined
        },
        trigger
      });
    } catch (e) {
      console.warn('Failed to schedule snoozed notification', e);
    }

    setActiveAlarm(null);
  };

  const visible = !!activeAlarm;

  return (
    <>
      {children}

      {/* Small in-app alarm modal */}
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {activeAlarm?.title ?? 'Task reminder'}
            </Text>
            {activeAlarm?.body ? (
              <Text style={styles.body}>{activeAlarm.body}</Text>
            ) : null}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleClose}
              >
                <Text style={styles.secondaryText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSnooze}
              >
                <Text style={styles.primaryText}>Snooze 5 min</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TaskAlarmHandler;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2)
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text
  },
  body: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: theme.spacing(2)
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    alignItems: 'center'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8
  },
  primaryButton: {
    backgroundColor: theme.colors.primary
  },
  secondaryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text
  },
  primaryText: {
    fontSize: theme.fontSize.sm,
    color: '#fff',
    fontWeight: '600'
  }
});
