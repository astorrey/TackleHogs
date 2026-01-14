import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'label' | 'heading' | 'body';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const tertiaryColor = useThemeColor({}, 'textTertiary');

  const getColor = () => {
    if (type === 'link') return accentColor;
    if (type === 'caption' || type === 'label') return secondaryColor;
    return color;
  };

  return (
    <Text
      style={[
        { color: getColor() },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'label' ? styles.label : undefined,
        type === 'heading' ? styles.heading : undefined,
        type === 'body' ? styles.body : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.md,
    letterSpacing: Typography.letterSpacing.normal,
  },
  defaultSemiBold: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.md,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.normal,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight['3xl'],
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.lg,
    letterSpacing: Typography.letterSpacing.normal,
  },
  heading: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.xl,
    letterSpacing: Typography.letterSpacing.tight,
  },
  body: {
    fontSize: Typography.fontSize.md,
    lineHeight: Typography.lineHeight.md,
    letterSpacing: Typography.letterSpacing.normal,
  },
  link: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.md,
    fontWeight: Typography.fontWeight.medium,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
    letterSpacing: Typography.letterSpacing.normal,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.lineHeight.xs,
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: Typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
});
