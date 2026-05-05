
export const colors = {
  // Brand
  primary: '#1b3a5c',
  primaryDark: '#5A3FD3',
  primaryLight: '#EEE9FD',
  accent: '#F97316',

  // Backgrounds
  bgPage: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgSubtle: '#F8FAFC',
  bgInput: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  successText: '#065F46',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningText: '#92400E',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerText: '#991B1B',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoText: '#1E40AF',
} as const

export type ColorKey = keyof typeof colors
