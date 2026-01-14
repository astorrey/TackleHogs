import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPoints, formatWeight, formatLength } from '@/lib/utils/formatting';
import type { LeaderboardEntry } from '@/lib/api/leaderboard';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  rank: number;
  metric: 'points' | 'catches' | 'weight' | 'length';
}

export function LeaderboardCard({ entry, rank, metric }: LeaderboardCardProps) {
  const accentColor = useThemeColor({}, 'accent');
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

  return (
    <ThemedView style={styles.card}>
      <View style={styles.rankContainer}>
        <ThemedText type="title" style={styles.rank}>
          #{rank}
        </ThemedText>
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
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {entry.display_name || entry.username}
        </ThemedText>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <ThemedText type="caption" style={styles.metricLabel}>
              {getMetricLabel()}
            </ThemedText>
            <ThemedText type="defaultSemiBold">{getMetricValue()}</ThemedText>
          </View>
          {metric !== 'catches' && (
            <View style={styles.metric}>
              <ThemedText type="caption" style={styles.metricLabel}>
                Catches
              </ThemedText>
              <ThemedText type="defaultSemiBold">{entry.total_catches}</ThemedText>
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  metrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    gap: 2,
  },
  metricLabel: {
    opacity: 0.6,
    fontSize: 12,
  },
});
