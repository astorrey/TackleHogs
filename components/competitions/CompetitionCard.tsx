import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getMetricLabel, type Competition, type CompetitionStatus } from '@/lib/api/competitions';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

interface CompetitionCardProps {
  competition: Competition;
  onPress?: () => void;
  showCreator?: boolean;
}

export function CompetitionCard({ competition, onPress, showCreator = true }: CompetitionCardProps) {
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');

  const getStatusConfig = (status: CompetitionStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Upcoming', color: warningColor, icon: 'clock' };
      case 'active':
        return { label: 'Active', color: successColor, icon: 'flame.fill' };
      case 'completed':
        return { label: 'Completed', color: secondaryText, icon: 'checkmark.circle.fill' };
      case 'cancelled':
        return { label: 'Cancelled', color: errorColor, icon: 'xmark.circle.fill' };
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const statusConfig = getStatusConfig(competition.status);
  const startDate = new Date(competition.start_date);
  const endDate = new Date(competition.end_date);

  const getTimeInfo = () => {
    if (competition.status === 'pending') {
      return `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`;
    }
    if (competition.status === 'active') {
      return `Ends ${formatDistanceToNow(endDate, { addSuffix: true })}`;
    }
    return `Ended ${format(endDate, 'MMM d, yyyy')}`;
  };

  const content = (
    <ThemedView style={[styles.container, Shadows.md, { borderColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {competition.name}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <IconSymbol name={statusConfig.icon as any} size={12} color={statusConfig.color} />
            <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </ThemedText>
          </View>
        </View>

        {competition.description && (
          <ThemedText style={[styles.description, { color: secondaryText }]} numberOfLines={2}>
            {competition.description}
          </ThemedText>
        )}
      </View>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <IconSymbol name="calendar" size={14} color={secondaryText} />
          <ThemedText style={[styles.infoText, { color: secondaryText }]}>
            {getTypeLabel(competition.type)}
          </ThemedText>
        </View>

        <View style={styles.infoItem}>
          <IconSymbol name="chart.bar.fill" size={14} color={secondaryText} />
          <ThemedText style={[styles.infoText, { color: secondaryText }]}>
            {getMetricLabel(competition.metric)}
          </ThemedText>
        </View>

        <View style={styles.infoItem}>
          <IconSymbol name="person.2.fill" size={14} color={secondaryText} />
          <ThemedText style={[styles.infoText, { color: secondaryText }]}>
            {competition.participants_count || 0} joined
          </ThemedText>
        </View>
      </View>

      {/* Target species if specified */}
      {competition.target_species && (
        <View style={[styles.targetSpecies, { backgroundColor: accentColor + '10' }]}>
          <IconSymbol name="scope" size={14} color={accentColor} />
          <ThemedText style={[styles.targetText, { color: accentColor }]}>
            Target: {competition.target_species.common_name}
          </ThemedText>
        </View>
      )}

      {/* Footer */}
      <View style={[styles.footer, { borderColor }]}>
        <ThemedText style={[styles.timeInfo, { color: secondaryText }]}>
          {getTimeInfo()}
        </ThemedText>

        {showCreator && competition.creator && (
          <View style={styles.creatorInfo}>
            {competition.creator.avatar_url ? (
              <Image
                source={{ uri: competition.creator.avatar_url }}
                style={styles.creatorAvatar}
              />
            ) : (
              <View style={[styles.creatorAvatarPlaceholder, { backgroundColor: accentColor }]}>
                <ThemedText style={styles.creatorInitial}>
                  {(competition.creator.display_name || competition.creator.username)[0].toUpperCase()}
                </ThemedText>
              </View>
            )}
            <ThemedText style={[styles.creatorName, { color: secondaryText }]} numberOfLines={1}>
              {competition.creator.display_name || competition.creator.username}
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xxs,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  description: {
    fontSize: Typography.fontSize.sm,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
  },
  targetSpecies: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  targetText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  timeInfo: {
    fontSize: Typography.fontSize.sm,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
  },
  creatorAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorInitial: {
    color: '#fff',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  creatorName: {
    fontSize: Typography.fontSize.sm,
    maxWidth: 100,
  },
});
