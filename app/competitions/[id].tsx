import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { format, formatDistanceToNow } from 'date-fns';

import { CompetitionLeaderboard } from '@/components/competitions';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import {
  getCompetition,
  getUserCompetitionRank,
  joinCompetition,
  leaveCompetition,
  getMetricLabel,
  formatScore,
  type Competition,
  type CompetitionParticipant,
} from '@/lib/api/competitions';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [userParticipation, setUserParticipation] = useState<CompetitionParticipant | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const headerBackground = useThemeColor({}, 'headerBackground');
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const loadData = useCallback(async () => {
    if (!id || !user?.id) return;

    try {
      const [comp, participation] = await Promise.all([
        getCompetition(id),
        getUserCompetitionRank(id, user.id).catch(() => null),
      ]);

      setCompetition(comp);
      setUserParticipation(participation);
    } catch (error) {
      console.error('Error loading competition:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoin = useCallback(async () => {
    if (!id || !user?.id) return;

    setActionLoading(true);
    try {
      await joinCompetition(id, user.id);
      await loadData();
    } catch (error) {
      console.error('Error joining competition:', error);
      Alert.alert('Error', 'Failed to join competition');
    } finally {
      setActionLoading(false);
    }
  }, [id, user?.id, loadData]);

  const handleLeave = useCallback(async () => {
    if (!id || !user?.id) return;

    Alert.alert(
      'Leave Competition',
      'Are you sure you want to leave this competition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await leaveCompetition(id, user.id);
              await loadData();
            } catch (error) {
              console.error('Error leaving competition:', error);
              Alert.alert('Error', 'Failed to leave competition');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  }, [id, user?.id, loadData]);

  const getStatusConfig = () => {
    if (!competition) return { label: '', color: secondaryText, icon: '' };

    switch (competition.status) {
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

  if (loading || !competition) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Competition',
            headerStyle: { backgroundColor: headerBackground },
            headerShadowVisible: false,
          }}
        />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </ThemedView>
      </>
    );
  }

  const statusConfig = getStatusConfig();
  const isParticipating = !!userParticipation;
  const canJoin = !isParticipating && competition.status === 'pending';
  const canLeave = isParticipating && competition.status === 'pending';

  return (
    <>
      <Stack.Screen
        options={{
          title: competition.name,
          headerStyle: { backgroundColor: headerBackground },
          headerShadowVisible: false,
        }}
      />

      <ThemedView style={styles.container}>
        <ScrollView>
          {/* Header Info */}
          <View style={styles.header}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <IconSymbol name={statusConfig.icon as any} size={14} color={statusConfig.color} />
              <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </ThemedText>
            </View>

            {competition.description && (
              <ThemedText style={[styles.description, { color: secondaryText }]}>
                {competition.description}
              </ThemedText>
            )}

            {/* Stats */}
            <View style={[styles.statsRow, { backgroundColor: surfaceSecondary }]}>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>Type</ThemedText>
                <ThemedText style={styles.statValue}>
                  {competition.type.charAt(0).toUpperCase() + competition.type.slice(1)}
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>Scoring</ThemedText>
                <ThemedText style={styles.statValue}>
                  {getMetricLabel(competition.metric)}
                </ThemedText>
              </View>
            </View>

            {/* Dates */}
            <View style={[styles.datesRow, { borderColor }]}>
              <View style={styles.dateItem}>
                <IconSymbol name="calendar" size={16} color={secondaryText} />
                <View>
                  <ThemedText style={[styles.dateLabel, { color: secondaryText }]}>Start</ThemedText>
                  <ThemedText style={styles.dateValue}>
                    {format(new Date(competition.start_date), 'MMM d, yyyy h:mm a')}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.dateItem}>
                <IconSymbol name="flag.checkered" size={16} color={secondaryText} />
                <View>
                  <ThemedText style={[styles.dateLabel, { color: secondaryText }]}>End</ThemedText>
                  <ThemedText style={styles.dateValue}>
                    {format(new Date(competition.end_date), 'MMM d, yyyy h:mm a')}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* User's Position (if participating) */}
            {userParticipation && (
              <View style={[styles.userPosition, { backgroundColor: accentColor + '10', borderColor: accentColor }]}>
                <View style={styles.positionInfo}>
                  <ThemedText style={[styles.positionLabel, { color: accentColor }]}>
                    Your Position
                  </ThemedText>
                  <ThemedText style={styles.positionRank}>
                    #{userParticipation.rank || '-'}
                  </ThemedText>
                </View>
                <View style={styles.positionStats}>
                  <View style={styles.positionStat}>
                    <ThemedText style={[styles.positionStatLabel, { color: secondaryText }]}>
                      Score
                    </ThemedText>
                    <ThemedText style={styles.positionStatValue}>
                      {formatScore(userParticipation.score, competition.metric)}
                    </ThemedText>
                  </View>
                  <View style={styles.positionStat}>
                    <ThemedText style={[styles.positionStatLabel, { color: secondaryText }]}>
                      Catches
                    </ThemedText>
                    <ThemedText style={styles.positionStatValue}>
                      {userParticipation.catch_count}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              {canJoin && (
                <Button
                  variant="primary"
                  onPress={handleJoin}
                  loading={actionLoading}
                  fullWidth
                >
                  Join Competition
                </Button>
              )}
              {canLeave && (
                <Button
                  variant="outline"
                  onPress={handleLeave}
                  loading={actionLoading}
                  fullWidth
                >
                  Leave Competition
                </Button>
              )}
              {isParticipating && competition.status === 'active' && (
                <Button
                  variant="primary"
                  icon="fish"
                  onPress={() => router.push('/(tabs)/catch')}
                  fullWidth
                >
                  Log a Catch
                </Button>
              )}
            </View>
          </View>

          {/* Leaderboard */}
          <View style={styles.leaderboardContainer}>
            <CompetitionLeaderboard
              competitionId={competition.id}
              metric={competition.metric}
              currentUserId={user?.id}
            />
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  description: {
    fontSize: Typography.fontSize.base,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: Spacing.md,
  },
  datesRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateLabel: {
    fontSize: Typography.fontSize.xs,
  },
  dateValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  userPosition: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  positionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  positionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  positionRank: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  positionStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  positionStat: {
    gap: Spacing.xxs,
  },
  positionStatLabel: {
    fontSize: Typography.fontSize.xs,
  },
  positionStatValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  actions: {
    gap: Spacing.sm,
  },
  leaderboardContainer: {
    minHeight: 300,
  },
});
