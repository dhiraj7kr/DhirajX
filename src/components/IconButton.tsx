import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

const IconButton: React.FC<Props> = ({ label, onPress, style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(2),
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default IconButton;
