export const colors = {
  canvas: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#CBD5E1',
  text: '#0F172A',
  textMuted: '#475569',
  primary: '#5B21B6',
  primaryPressed: '#4C1D95',
  primarySoft: '#EDE9FE',
  success: '#166534',
  successSoft: '#DCFCE7',
  warning: '#92400E',
  warningSoft: '#FEF3C7',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  control: 8,
  panel: 12,
  card: 10,
} as const;

export const layout = {
  compactMaxWidth: 699,
  splitMinWidth: 860,
  maxContentWidth: 1440,
  minTapTarget: 44,
} as const;
