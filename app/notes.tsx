import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../src/theme/theme';

export default function NotesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notes Feature Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
  text: { color: theme.colors.textSecondary, fontSize: 16 }
});