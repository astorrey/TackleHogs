import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getCompetitionLeaderboard,
  formatScore,
  type CompetitionParticipant,
  type CompetitionMetric,
} from '@/lib/api/competitions';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

interface CompetitionLeaderboardProps {
  competitionId: string;
  metric: CompetitionMetric;
  currentUserId?: string;
}

export function CompetitionLeaderboard({
  competitionId,
  metric,
  currentUserId,
}: CompetitionLeaderboardProps) {
  const [participants, setParticipants] = useState<CompetitionParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await getCompetitionLeaderboard(competitionId);
      setParticipants(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, [loadLeaderboard]);

  const getRankStyle = (rank: number | null) => {
    if (!rank) return { backgroundColor: surfaceSecondary, color: secondaryText };
    if (rank === 1) return { backgroundColor: '#FCD34D', color: '#78350F' }; // Gold
    if (rank === 2) return { backgroundColor: '#D1D5DB', color: '#374151' }; // Silver
    if (rank === 3) return { backgroundColor: '#FDBA74', color: '#7C2D12' }; // Bronze
    return { backgroundColor: surfaceSecondary, color: secondaryText };
  };

  const renderItem = useCallback(({ item }: { item: CompetitionParticipant }) => {
    const rankStyle = getRankStyle(item.rank);
    const isCurrentUser = item.user_id === currentUserId;
    const displayName = item.user?.display_name || item.user?.username || 'Unknown';

    return (
      <View
        style={[
          styles.participantRow,
          { borderColor },
          isCurrentUser && [styles.currentUserRow, { backgroundColor: accentColor + '10' }],
        ]}
      >
        {/* Rank */}
        <View style={[styles.rankBadge, { backgroundColor: rankStyle.backgroundColor }]}>
          {item.rank && item.rank <= 3 ? (
            <IconSymbol
              name={item.rank === 1 ? 'crown.fill' : 'medal.fill'}
              size={14}
              color={rankStyle.color}
            />
          ) : (
            <ThemedText style={[styles.rankText, { color: rankStyle.color }]}>
              {item.rank || '-'}
            </ThemedText>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          {item.user?.avatar_url ? (
            <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: accentColor }]}>
              <ThemedText style={styles.avatarText}>
                {displayName[0].toUpperCase()}
              </ThemedText>
            </View>
          )}
          <View style={styles.nameContainer}>
            <ThemedText style={styles.displayName} numberOfLines={1}>
              {displayName}
              {isCurrentUser && ' (You)'}
            </ThemedText>
            <ThemedText style={[styles.catchCount, { color: secondaryText }]}>
              {item.catch_count} {item.catch_count === 1 ? 'catch' : 'catches'}
            </ThemedText>
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <ThemedText style={styles.score}>
            {formatScore(item.score, metric)}
          </ThemedText>
        </View>
      </View>
    );
  }, [borderColor, accentColor, surfaceSecondary, secondaryText, metric, currentUserId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  if (participants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="trophy" size={48} color={secondaryText} />
        <ThemedText style={styles.emptyTitle}>No participants yet</ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: secondaryText }]}>
          Be the first to join this competition!
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={participants}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={accentColor}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Leaderboard</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: secondaryText }]}>
            {participants.length} participants
          </ThemedText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['4xl'],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['4xl'],
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  listContent: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  currentUserRow: {
    borderWidth: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  nameContainer: {
    flex: 1,
  },
  displayName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  catchCount: {
    fontSize: Typography.fontSize.sm,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
});
