import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

type Props = {
  label: string;
  style?: ViewStyle;
};

const SkillTag: React.FC<Props> = ({ label, style }) => (
  <Text style={[styles.tag, style]}>{label}</Text>
);

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: theme.spacing(1),
    paddingVertical: 4,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs
  }
});

export default SkillTag;
