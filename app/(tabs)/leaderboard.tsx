import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LeaderboardCard } from '@/components/leaderboard/LeaderboardCard';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/hooks/use-auth';
import { useLeaderboard, useFriendsLeaderboard } from '@/hooks/use-leaderboard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';

type Metric = 'points' | 'catches' | 'weight' | 'length';
type ViewType = 'state' | 'friends';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<ViewType>('state');
  const [metric, setMetric] = useState<Metric>('points');
  const insets = useSafeAreaInsets();

  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const borderMediumColor = useThemeColor({}, 'borderMedium');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceSecondaryColor = useThemeColor({}, 'surfaceSecondary');
  const surfaceTertiaryColor = useThemeColor({}, 'surfaceTertiary');

  const { entries: stateEntries, loading: stateLoading } = useLeaderboard(
    user?.user_metadata?.state || undefined,
    metric
  );
  const { entries: friendsEntries, loading: friendsLoading } = useFriendsLeaderboard(
    user?.id || null,
    metric
  );

  const entries = viewType === 'state' ? stateEntries : friendsEntries;
  const loading = viewType === 'state' ? stateLoading : friendsLoading;

  const metrics: { label: string; value: Metric; emoji: string }[] = [
    { label: 'Points', value: 'points', emoji: '⭐' },
    { label: 'Catches', value: 'catches', emoji: '🐟' },
    { label: 'Weight', value: 'weight', emoji: '⚖️' },
    { label: 'Length', value: 'length', emoji: '📏' },
  ];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${accentColor}15` }]}>
        <ThemedText style={styles.emptyIcon}>🏆</ThemedText>
      </View>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No entries yet
      </ThemedText>
      <ThemedText type="caption" style={styles.emptySubtext}>
        {viewType === 'friends' 
          ? 'Add friends to compete on the leaderboard!'
          : 'Be the first to log a catch in your state!'
        }
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <PageHeader 
        title="Leaderboard" 
        icon="trophy.fill"
      />
      
      {/* View Toggle - iOS Segmented Control Style */}
      <View style={styles.controlsContainer}>
        <View style={[styles.segmentedControl, { backgroundColor: surfaceTertiaryColor, borderColor: borderMediumColor }]}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              viewType === 'state' && [styles.segmentButtonActive, { backgroundColor: surfaceColor }],
            ]}
            onPress={() => setViewType('state')}
            activeOpacity={0.7}
          >
            <ThemedText 
              style={[
                styles.segmentText, 
                viewType === 'state' && [styles.segmentTextActive, { color: accentColor }]
              ]}
            >
              State
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              viewType === 'friends' && [styles.segmentButtonActive, { backgroundColor: surfaceColor }],
            ]}
            onPress={() => setViewType('friends')}
            activeOpacity={0.7}
          >
            <ThemedText 
              style={[
                styles.segmentText, 
                viewType === 'friends' && [styles.segmentTextActive, { color: accentColor }]
              ]}
            >
              Friends
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metric Pills */}
      <View style={styles.metricsContainer}>
        {metrics.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[
              styles.metricPill,
              { 
                borderColor: borderMediumColor, 
                backgroundColor: surfaceColor 
              },
              metric === m.value && [
                styles.metricPillActive, 
                { backgroundColor: accentColor, borderColor: accentColor }
              ],
            ]}
            onPress={() => setMetric(m.value)}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.metricEmoji}>{m.emoji}</ThemedText>
            <ThemedText
              style={[
                styles.metricText,
                metric === m.value && styles.metricTextActive,
              ]}
            >
              {m.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ThemedText type="caption">Loading leaderboard...</ThemedText>
        </View>
      ) : entries.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={entries}
          renderItem={({ item, index }) => (
            <LeaderboardCard entry={item} rank={index + 1} metric={metric} />
          )}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlsContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  segmentButtonActive: {
    ...Shadows.sm,
  },
  segmentText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  segmentTextActive: {
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  metricPillActive: {
    ...Shadows.sm,
  },
  metricEmoji: {
    fontSize: 12,
  },
  metricText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  metricTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['3xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
