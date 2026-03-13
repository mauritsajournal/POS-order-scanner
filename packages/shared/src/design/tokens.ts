/**
 * ScanOrder Design System Tokens
 *
 * Centralized design tokens for consistent styling across mobile (NativeWind)
 * and web (Tailwind CSS). Optimized for trade show floor visibility with
 * high-contrast color options.
 *
 * Usage:
 *   import { colors, typography, spacing } from '@scanorder/shared';
 */

// ─── Colors ──────────────────────────────────────────────────────────

/** Brand colors — A-Journal inspired, professional blue-based palette */
export const colors = {
  brand: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // primary brand
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  /** Semantic: success (green) */
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },

  /** Semantic: warning (amber) */
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },

  /** Semantic: error (red) */
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  /** Semantic: info (blue) */
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },

  /** Neutral (gray) */
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  /** High-contrast overrides for bright trade show environments */
  highContrast: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#000000',
    textSecondary: '#374151',
    border: '#9CA3AF',
    primary: '#3730A3',
    success: '#15803D',
    warning: '#92400E',
    error: '#991B1B',
  },
} as const;

// ─── Typography ──────────────────────────────────────────────────────

export const typography = {
  /** Font families */
  fontFamily: {
    /** System font stack for cross-platform consistency */
    sans: 'System',
    /** Monospace for barcodes, order numbers */
    mono: 'Courier',
  },

  /** Font size scale (px) */
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  /** Line height multipliers */
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  /** Font weight */
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────

/** Spacing scale in logical pixels (consistent between web and mobile) */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────

/** Shadow presets (React Native compatible) */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ─── Tailwind Config Extension ───────────────────────────────────────

/**
 * Tailwind CSS theme extension.
 * Use in tailwind.config.ts:
 *   import { tailwindExtend } from '@scanorder/shared';
 *   theme: { extend: tailwindExtend }
 */
export const tailwindExtend = {
  colors: {
    brand: colors.brand,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  },
  fontSize: {
    xs: [`${typography.fontSize.xs}px`, { lineHeight: `${Math.round(typography.fontSize.xs * typography.lineHeight.normal)}px` }],
    sm: [`${typography.fontSize.sm}px`, { lineHeight: `${Math.round(typography.fontSize.sm * typography.lineHeight.normal)}px` }],
    base: [`${typography.fontSize.base}px`, { lineHeight: `${Math.round(typography.fontSize.base * typography.lineHeight.normal)}px` }],
    lg: [`${typography.fontSize.lg}px`, { lineHeight: `${Math.round(typography.fontSize.lg * typography.lineHeight.normal)}px` }],
    xl: [`${typography.fontSize.xl}px`, { lineHeight: `${Math.round(typography.fontSize.xl * typography.lineHeight.tight)}px` }],
    '2xl': [`${typography.fontSize['2xl']}px`, { lineHeight: `${Math.round(typography.fontSize['2xl'] * typography.lineHeight.tight)}px` }],
    '3xl': [`${typography.fontSize['3xl']}px`, { lineHeight: `${Math.round(typography.fontSize['3xl'] * typography.lineHeight.tight)}px` }],
  },
  borderRadius: {
    sm: `${borderRadius.sm}px`,
    DEFAULT: `${borderRadius.base}px`,
    md: `${borderRadius.md}px`,
    lg: `${borderRadius.lg}px`,
    xl: `${borderRadius.xl}px`,
    '2xl': `${borderRadius['2xl']}px`,
  },
} as const;
