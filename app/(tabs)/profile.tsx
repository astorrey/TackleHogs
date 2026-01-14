import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SectionDivider } from '@/components/ui/section-divider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const borderMediumColor = useThemeColor({}, 'borderMedium');
  const surfaceColor = useThemeColor({}, 'surface');
  const headerBgColor = useThemeColor({}, 'headerBackground');
  const errorColor = useThemeColor({}, 'error');
  const iconColor = useThemeColor({}, 'iconSecondary');

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const menuItems = [
    { 
      icon: 'gearshape' as const,
      label: 'Settings',
      onPress: () => {},
    },
    { 
      icon: 'star' as const,
      label: 'Year-End Review',
      onPress: () => {},
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.headerBackground, { backgroundColor: headerBgColor, paddingTop: insets.top + Spacing.xl }]}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user?.user_metadata?.avatar_url ? (
            <Image 
              source={{ uri: user.user_metadata.avatar_url }} 
              style={[styles.avatar, { borderColor: surfaceColor }]}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: accentColor }]}>
              <ThemedText style={styles.avatarText}>
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </ThemedText>
            </View>
          )}
          <View style={[styles.avatarBadge, { backgroundColor: accentColor }]}>
            <IconSymbol name="checkmark" size={12} color="#fff" />
          </View>
        </View>

        {/* User Info */}
        <ThemedText type="title" style={styles.name}>
          {user?.user_metadata?.full_name || user?.email || 'User'}
        </ThemedText>
        {user?.user_metadata?.state && (
          <View style={[styles.locationBadge, { backgroundColor: `${accentColor}12` }]}>
            <IconSymbol name="mappin" size={12} color={accentColor} />
            <ThemedText type="caption" style={[styles.state, { color: accentColor }]}>
              {user.user_metadata.state}
            </ThemedText>
          </View>
        )}
        
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <ThemedView 
          variant="card" 
          shadow="md"
          style={[styles.menuCard, { borderColor: borderMediumColor }]}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && [styles.menuItemBorder, { borderBottomColor: borderColor }],
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: `${accentColor}15` }]}>
                  <IconSymbol name={item.icon} size={18} color={accentColor} />
                </View>
                <ThemedText style={styles.menuItemLabel}>{item.label}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={iconColor} />
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: `${errorColor}08`, borderColor: `${errorColor}30` }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color={errorColor} />
          <ThemedText style={[styles.signOutText, { color: errorColor }]}>
            Sign Out
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '600',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...Shadows.sm,
  },
  name: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  state: {
    fontWeight: '500',
  },
  accentBar: {
    height: 3,
    width: 50,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  menu: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  menuCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
  },
  signOutText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});
