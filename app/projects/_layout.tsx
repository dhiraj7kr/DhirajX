import { Stack } from 'expo-router';
import React from 'react';
import { theme } from '../../src/theme/theme';

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Projects' }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Project Detail' }}
      />
    </Stack>
  );
}
