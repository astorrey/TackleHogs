import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPoints, formatWeight, formatLength } from '@/lib/utils/formatting';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';
import type { LeaderboardEntry } from '@/lib/api/leaderboard';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  rank: number;
  metric: 'points' | 'catches' | 'weight' | 'length';
}

export function LeaderboardCard({ entry, rank, metric }: LeaderboardCardProps) {
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const warningColor = useThemeColor({}, 'warning');
  const surfaceSecondaryColor = useThemeColor({}, 'surfaceSecondary');

  const getMetricValue = () => {
    switch (metric) {
      case 'points':
        return formatPoints(entry.total_points);
      case 'catches':
        return entry.total_catches.toString();
      case 'weight':
        return entry.biggest_fish_weight ? formatWeight(entry.biggest_fish_weight) : 'N/A';
      case 'length':
        return entry.biggest_fish_length ? formatLength(entry.biggest_fish_length) : 'N/A';
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'points':
        return 'Points';
      case 'catches':
        return 'Catches';
      case 'weight':
        return 'Biggest Fish';
      case 'length':
        return 'Longest Fish';
    }
  };

  const getRankDisplay = () => {
    if (rank === 1) return { emoji: '🥇', color: '#FFD700' };
    if (rank === 2) return { emoji: '🥈', color: '#C0C0C0' };
    if (rank === 3) return { emoji: '🥉', color: '#CD7F32' };
    return { emoji: null, color: accentColor };
  };

  const rankInfo = getRankDisplay();
  const isTopThree = rank <= 3;

  return (
    <ThemedView
      variant="card"
      shadow={isTopThree ? 'lg' : 'md'}
      style={[
        styles.card,
        { borderColor },
        isTopThree && styles.topThreeCard,
      ]}
    >
      <View style={[styles.rankContainer, isTopThree && { backgroundColor: surfaceSecondaryColor }]}>
        {rankInfo.emoji ? (
          <ThemedText style={styles.rankEmoji}>{rankInfo.emoji}</ThemedText>
        ) : (
          <ThemedText type="defaultSemiBold" style={[styles.rank, { color: accentColor }]}>
            #{rank}
          </ThemedText>
        )}
      </View>

      {entry.avatar_url ? (
        <Image source={{ uri: entry.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: accentColor }]}>
          <ThemedText style={styles.avatarText}>
            {(entry.display_name || entry.username || 'U')[0].toUpperCase()}
          </ThemedText>
        </View>
      )}

      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
          {entry.display_name || entry.username}
        </ThemedText>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <ThemedText type="caption" style={styles.metricLabel}>
              {getMetricLabel()}
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.metricValue}>
              {getMetricValue()}
            </ThemedText>
          </View>
          {metric !== 'catches' && (
            <View style={styles.metric}>
              <ThemedText type="caption" style={styles.metricLabel}>
                Catches
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.metricValue}>
                {entry.total_catches}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1.5,
  },
  topThreeCard: {
    borderWidth: 1.5,
  },
  rankContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 24,
  },
  rank: {
    fontSize: Typography.fontSize.md,
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
    fontWeight: '600',
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    fontSize: Typography.fontSize.base,
  },
  metrics: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  metric: {
    gap: 2,
  },
  metricLabel: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: Typography.fontSize.sm,
  },
});
