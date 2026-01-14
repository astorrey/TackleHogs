import { View, type ViewProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Shadows, BorderRadius, Spacing } from '@/constants/theme';

type ShadowLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type RadiusSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
type PaddingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'surface' | 'card' | 'transparent';
  shadow?: ShadowLevel;
  radius?: RadiusSize;
  padding?: PaddingSize;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  shadow = 'none',
  radius,
  padding,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceSecondaryColor = useThemeColor({}, 'surfaceSecondary');

  const getBackgroundColor = () => {
    if (lightColor || darkColor) return backgroundColor;
    switch (variant) {
      case 'surface':
        return surfaceColor;
      case 'card':
        return surfaceColor;
      case 'transparent':
        return 'transparent';
      default:
        return backgroundColor;
    }
  };

  const getShadowStyle = () => {
    if (variant === 'card' && shadow === 'none') {
      return Shadows.md;
    }
    return Shadows[shadow];
  };

  const getPaddingValue = () => {
    if (!padding || padding === 'none') return undefined;
    const paddingMap: Record<Exclude<PaddingSize, 'none'>, number> = {
      xs: Spacing.xs,
      sm: Spacing.sm,
      md: Spacing.md,
      lg: Spacing.lg,
      xl: Spacing.xl,
      '2xl': Spacing['2xl'],
    };
    return paddingMap[padding];
  };

  return (
    <View
      style={[
        { backgroundColor: getBackgroundColor() },
        getShadowStyle(),
        radius && { borderRadius: BorderRadius[radius] },
        padding && { padding: getPaddingValue() },
        style,
      ]}
      {...otherProps}
    />
  );
}
