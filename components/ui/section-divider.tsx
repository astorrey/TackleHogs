import { StyleSheet, View, type ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SectionDividerProps {
  label?: string;
  style?: ViewStyle;
  variant?: 'default' | 'accent' | 'subtle';
}

export function SectionDivider({ 
  label, 
  style,
  variant = 'default' 
}: SectionDividerProps) {
  const borderColor = useThemeColor({}, 'border');
  const separatorColor = useThemeColor({}, 'separator');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceSecondaryColor = useThemeColor({}, 'surfaceSecondary');

  const getLineColor = () => {
    switch (variant) {
      case 'accent':
        return accentColor;
      case 'subtle':
        return separatorColor;
      default:
        return borderColor;
    }
  };

  const lineColor = getLineColor();

  if (label) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.line, { backgroundColor: lineColor }]} />
        <View style={[styles.labelContainer, { backgroundColor: surfaceSecondaryColor }]}>
          <ThemedText type="label" style={styles.label}>
            {label}
          </ThemedText>
        </View>
        <View style={[styles.line, { backgroundColor: lineColor }]} />
      </View>
    );
  }

  return (
    <View style={[styles.simpleLine, { backgroundColor: lineColor }, style]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
  },
  simpleLine: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  labelContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  label: {
    textAlign: 'center',
  },
});
