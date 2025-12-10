import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

type Props = {
  title: string;
  subtitle?: string;
};

const SectionHeader: React.FC<Props> = ({ title, subtitle }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing(1)
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text
  },
  subtitle: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary
  }
});

export default SectionHeader;
