/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Moss green accent colors
const accentLight = '#6B7A4E';
const accentDark = '#8B9862';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#666666',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    tint: accentLight,
    accent: accentLight,
    border: '#E0E0E0',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: accentLight,
    placeholder: '#E8E8E8',
    error: '#D32F2F',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#1A1A1A',
    surface: '#252525',
    tint: accentDark,
    accent: accentDark,
    border: '#3A3A3A',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: accentDark,
    placeholder: '#3A3A3A',
    error: '#EF5350',
  },
};

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
