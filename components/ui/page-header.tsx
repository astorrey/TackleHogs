import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';

interface PageHeaderProps {
  title: string;
  icon?: IconSymbolName;
  rightContent?: React.ReactNode;
  subtitle?: string;
  style?: ViewStyle;
}

export function PageHeader({ 
  title, 
  icon, 
  rightContent,
  subtitle,
  style 
}: PageHeaderProps) {
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const headerBgColor = useThemeColor({}, 'headerBackground');

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top + Spacing.md,
          backgroundColor: headerBgColor,
          borderBottomColor: borderColor,
        },
        style
      ]}
    >
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: `${accentColor}18` }]}>
                <IconSymbol name={icon} size={22} color={accentColor} />
              </View>
            )}
            <View style={styles.textContainer}>
              <ThemedText style={styles.title}>{title}</ThemedText>
              {subtitle && (
                <ThemedText type="caption" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              )}
            </View>
          </View>
          {/* Accent underline bar */}
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        </View>
        
        {rightContent && (
          <View style={styles.rightContent}>
            {rightContent}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
  },
  titleContainer: {
    flex: 1,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xxs,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    marginTop: -2,
  },
  accentBar: {
    height: 3,
    width: 40,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
