import { Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppDataProvider, useAppData } from '../src/context/AppDataContext';
import { theme } from '../src/theme/theme';

function InnerLayout() {
  const { loading } = useAppData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{
              color,
              fontSize: theme.fontSize.xs,
              fontWeight: focused ? '600' : '400'
            }}
          >
            {children}
          </Text>
        )
      }}
    >
      {/* Home: app/index.tsx */}
      <Tabs.Screen name="index" options={{ title: 'Home' }} />

      {/* Projects: folder with stack (_layout.tsx inside projects/) */}
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />

      {/* About: app/about.tsx */}
      <Tabs.Screen name="about" options={{ title: 'About' }} />

      {/* Contact: app/contact.tsx */}
      <Tabs.Screen name="contact" options={{ title: 'Contact' }} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <AppDataProvider>
      <InnerLayout />
    </AppDataProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
