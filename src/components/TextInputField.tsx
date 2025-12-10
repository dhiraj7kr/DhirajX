import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '../theme/theme';

type Props = TextInputProps & {
  label: string;
  multiline?: boolean;
};

const TextInputField: React.FC<Props> = ({ label, multiline, ...rest }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      {...rest}
      multiline={multiline}
      style={[
        styles.input,
        multiline && { height: 100, textAlignVertical: 'top' }
      ]}
      placeholderTextColor={theme.colors.textSecondary}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing(1)
  },
  label: {
    marginBottom: 4,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm
  },
  input: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(1),
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
    fontSize: theme.fontSize.base
  }
});

export default TextInputField;
