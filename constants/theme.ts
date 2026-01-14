/**
 * Enhanced theme system with iOS-style design tokens.
 * Includes shadows, elevations, spacing, and typography scales.
 */

import { Platform } from 'react-native';

// Moss green accent colors
const accentLight = '#6B7A4E';
const accentDark = '#8B9862';

export const Colors = {
  light: {
    // Text colors
    text: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9BA1A6',

    // Background colors - warmer tones
    background: '#F8F7F5',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F4F2',
    surfaceTertiary: '#EDECE9',
    surfacePressed: '#EEEDEB',
    headerBackground: '#FAFAF8',

    // Brand colors
    tint: accentLight,
    accent: accentLight,
    accentLight: '#8B9D6E',
    accentGradientStart: '#6B7A4E',
    accentGradientEnd: '#8B9D6E',

    // Border colors - slightly stronger
    border: '#D8DBE0',
    borderLight: '#E8E9EC',
    borderMedium: '#C5C9CF',
    separator: '#E5E4E2',

    // Icon colors
    icon: '#687076',
    iconSecondary: '#9BA1A6',
    tabIconDefault: '#687076',
    tabIconSelected: accentLight,

    // Utility colors
    placeholder: '#EDECE9',
    error: '#DC2626',
    errorLight: '#FEF2F2',
    success: '#16A34A',
    successLight: '#F0FDF4',
    warning: '#CA8A04',
    warningLight: '#FEFCE8',
    info: '#0284C7',
    infoLight: '#F0F9FF',

    // Shadow colors
    shadow: '#000000',
    shadowLight: 'rgba(0, 0, 0, 0.04)',
    shadowMedium: 'rgba(0, 0, 0, 0.08)',
  },
  dark: {
    // Text colors
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#687076',

    // Background colors
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceSecondary: '#222222',
    surfaceTertiary: '#2A2A2A',
    surfacePressed: '#2E2E2E',
    headerBackground: '#141414',

    // Brand colors
    tint: accentDark,
    accent: accentDark,
    accentLight: '#A1B278',
    accentGradientStart: '#8B9862',
    accentGradientEnd: '#A1B278',

    // Border colors - more visible
    border: '#3A3A3A',
    borderLight: '#2E2E2E',
    borderMedium: '#454545',
    separator: '#2A2A2A',

    // Icon colors
    icon: '#9BA1A6',
    iconSecondary: '#687076',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: accentDark,

    // Utility colors
    placeholder: '#2A2A2A',
    error: '#EF4444',
    errorLight: '#1F1215',
    success: '#22C55E',
    successLight: '#0F1F15',
    warning: '#EAB308',
    warningLight: '#1F1C0F',
    info: '#0EA5E9',
    infoLight: '#0F1A1F',

    // Shadow colors
    shadow: '#000000',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    shadowMedium: 'rgba(0, 0, 0, 0.4)',
  },
};

// Spacing scale (4px base)
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Border radius scale
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Shadow presets (iOS-style) - Enhanced for better depth
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Typography scale
export const Typography = {
  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
  },
  // Line heights
  lineHeight: {
    xs: 14,
    sm: 18,
    base: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
  },
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
