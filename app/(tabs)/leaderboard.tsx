import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LeaderboardCard } from '@/components/leaderboard/LeaderboardCard';
import { useAuth } from '@/hooks/use-auth';
import { useLeaderboard, useFriendsLeaderboard } from '@/hooks/use-leaderboard';

type Metric = 'points' | 'catches' | 'weight' | 'length';
type ViewType = 'state' | 'friends';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<ViewType>('state');
  const [metric, setMetric] = useState<Metric>('points');

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

  const metrics: { label: string; value: Metric }[] = [
    { label: 'Points', value: 'points' },
    { label: 'Catches', value: 'catches' },
    { label: 'Weight', value: 'weight' },
    { label: 'Length', value: 'length' },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Leaderboard</ThemedText>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewType === 'state' && styles.toggleButtonActive]}
            onPress={() => setViewType('state')}
          >
            <ThemedText style={viewType === 'state' ? styles.toggleTextActive : styles.toggleText}>
              State
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewType === 'friends' && styles.toggleButtonActive]}
            onPress={() => setViewType('friends')}
          >
            <ThemedText style={viewType === 'friends' ? styles.toggleTextActive : styles.toggleText}>
              Friends
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metrics}>
        {metrics.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.metricButton, metric === m.value && styles.metricButtonActive]}
            onPress={() => setMetric(m.value)}
          >
            <ThemedText
              style={metric === m.value ? styles.metricTextActive : styles.metricText}
            >
              {m.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ThemedView style={styles.center}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      ) : entries.length === 0 ? (
        <ThemedView style={styles.center}>
          <ThemedText>No entries yet</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={entries}
          renderItem={({ item, index }) => (
            <LeaderboardCard entry={item} rank={index + 1} metric={metric} />
          )}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.list}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    gap: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  toggleText: {
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  metrics: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  metricButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  metricButtonActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  metricText: {
    fontSize: 12,
  },
  metricTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
