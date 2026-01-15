import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/api/notifications';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

interface SettingItemProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function SettingItem({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: SettingItemProps) {
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');

  return (
    <View style={[styles.settingItem, { borderColor }]}>
      <View style={styles.settingInfo}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
          <IconSymbol name={icon as any} size={18} color={accentColor} />
        </View>
        <View style={styles.settingText}>
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
          <ThemedText style={[styles.settingDescription, { color: secondaryText }]}>
            {description}
          </ThemedText>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#767577', true: accentColor + '60' }}
        thumbColor={value ? accentColor : '#f4f3f4'}
      />
    </View>
  );
}

export function NotificationSettings() {
  const { user } = useAuth();
  const { permissionStatus, requestPermissions } = useNotifications();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const accentColor = useThemeColor({}, 'accent');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const warningColor = useThemeColor({}, 'warning');

  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      let prefs = await getNotificationPreferences(user.id);
      
      // If no preferences exist, create defaults
      if (!prefs) {
        prefs = {
          user_id: user.id,
          friend_requests: true,
          friend_catches: true,
          competition_updates: true,
          comments: true,
        };
        await updateNotificationPreferences(user.id, prefs);
      }
      
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleToggle = useCallback(async (key: keyof Omit<NotificationPreferences, 'user_id'>, value: boolean) => {
    if (!user?.id || !preferences) return;

    // Optimistic update
    setPreferences({ ...preferences, [key]: value });
    setSaving(true);

    try {
      await updateNotificationPreferences(user.id, { [key]: value });
    } catch (error) {
      console.error('Error updating notification preference:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  }, [user?.id, preferences]);

  const handleRequestPermission = useCallback(async () => {
    await requestPermissions();
  }, [requestPermissions]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  const notificationsEnabled = permissionStatus === 'granted';

  return (
    <ThemedView style={styles.container}>
      {/* Permission Banner */}
      {!notificationsEnabled && (
        <View style={[styles.permissionBanner, { backgroundColor: warningColor + '15', borderColor: warningColor + '30' }]}>
          <IconSymbol name="bell.slash" size={24} color={warningColor} />
          <View style={styles.permissionText}>
            <ThemedText style={[styles.permissionTitle, { color: warningColor }]}>
              Notifications Disabled
            </ThemedText>
            <ThemedText style={[styles.permissionDescription, { color: secondaryText }]}>
              Enable notifications to stay updated on catches and friend activity.
            </ThemedText>
          </View>
          <Button size="sm" variant="primary" onPress={handleRequestPermission}>
            Enable
          </Button>
        </View>
      )}

      {/* Settings List */}
      <View style={[styles.settingsGroup, Shadows.sm, { borderColor }]}>
        <SettingItem
          icon="person.badge.plus"
          title="Friend Requests"
          description="When someone sends you a friend request"
          value={preferences?.friend_requests ?? true}
          onValueChange={(value) => handleToggle('friend_requests', value)}
          disabled={!notificationsEnabled || saving}
        />

        <SettingItem
          icon="fish"
          title="Friend Catches"
          description="When a friend logs a new catch"
          value={preferences?.friend_catches ?? true}
          onValueChange={(value) => handleToggle('friend_catches', value)}
          disabled={!notificationsEnabled || saving}
        />

        <SettingItem
          icon="trophy"
          title="Competition Updates"
          description="Competition standings and results"
          value={preferences?.competition_updates ?? true}
          onValueChange={(value) => handleToggle('competition_updates', value)}
          disabled={!notificationsEnabled || saving}
        />

        <SettingItem
          icon="bubble.left"
          title="Comments"
          description="When someone comments on your catches"
          value={preferences?.comments ?? true}
          onValueChange={(value) => handleToggle('comments', value)}
          disabled={!notificationsEnabled || saving}
        />
      </View>

      <ThemedText style={[styles.footerText, { color: secondaryText }]}>
        You can change these settings at any time. Notifications help you stay connected with the fishing community.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  permissionText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  permissionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  permissionDescription: {
    fontSize: Typography.fontSize.sm,
  },
  settingsGroup: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  settingTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
