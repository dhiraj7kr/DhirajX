const palette = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  background: '#0F172A',
  card: '#111827',
  border: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  accent: '#FBBF24',
  danger: '#EF4444'
};

export const theme = {
  colors: palette,
  spacing: (factor: number) => factor * 8,
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    xxl: 26
  }
};

export type Theme = typeof theme;
