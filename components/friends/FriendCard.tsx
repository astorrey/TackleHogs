import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

interface FriendUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  state?: string | null;
}

interface FriendCardProps {
  user: FriendUser;
  variant?: 'friend' | 'request' | 'search';
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  loading?: boolean;
}

export function FriendCard({
  user,
  variant = 'friend',
  onPress,
  onAccept,
  onReject,
  onAdd,
  onRemove,
  loading = false,
}: FriendCardProps) {
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const displayName = user.display_name || user.username;
  const initials = displayName.charAt(0).toUpperCase();

  const content = (
    <ThemedView style={[styles.container, Shadows.sm, { borderColor }]}>
      <View style={styles.userInfo}>
        {user.avatar_url ? (
          <Image
            source={{ uri: user.avatar_url }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: accentColor }]}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </View>
        )}
        
        <View style={styles.textInfo}>
          <ThemedText style={styles.displayName}>{displayName}</ThemedText>
          <ThemedText style={[styles.username, { color: secondaryText }]}>
            @{user.username}
          </ThemedText>
          {user.state && (
            <View style={styles.locationRow}>
              <IconSymbol name="mappin" size={10} color={secondaryText} />
              <ThemedText style={[styles.state, { color: secondaryText }]}>
                {user.state}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {variant === 'friend' && onRemove && (
        <Pressable
          onPress={onRemove}
          style={[styles.iconButton, { backgroundColor: surfaceSecondary }]}
          hitSlop={8}
        >
          <IconSymbol name="person.badge.minus" size={18} color={secondaryText} />
        </Pressable>
      )}

      {variant === 'request' && (
        <View style={styles.requestActions}>
          <Button
            size="sm"
            variant="primary"
            onPress={onAccept}
            disabled={loading}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={onReject}
            disabled={loading}
          >
            Decline
          </Button>
        </View>
      )}

      {variant === 'search' && onAdd && (
        <Button
          size="sm"
          variant="primary"
          icon="person.badge.plus"
          onPress={onAdd}
          disabled={loading}
        >
          Add
        </Button>
      )}
    </ThemedView>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  textInfo: {
    flex: 1,
    gap: Spacing.xxs,
  },
  displayName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  username: {
    fontSize: Typography.fontSize.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  state: {
    fontSize: Typography.fontSize.xs,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  requestActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
