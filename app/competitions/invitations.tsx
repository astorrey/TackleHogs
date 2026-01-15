import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import {
  getCompetitionInvitations,
  respondToInvitation,
  type CompetitionInvitation,
} from '@/lib/api/competitions';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

export default function CompetitionInvitationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<CompetitionInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const headerBackground = useThemeColor({}, 'headerBackground');
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await getCompetitionInvitations(user.id);
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleRespond = useCallback(async (invitationId: string, accept: boolean) => {
    if (!user?.id) return;

    setActionLoading(invitationId);
    try {
      await respondToInvitation(invitationId, accept, user.id);
      
      if (accept) {
        // Find the competition and navigate to it
        const invitation = invitations.find(i => i.id === invitationId);
        if (invitation?.competition_id) {
          router.push(`/competitions/${invitation.competition_id}`);
        }
      }
      
      await loadData();
    } catch (error) {
      console.error('Error responding to invitation:', error);
    } finally {
      setActionLoading(null);
    }
  }, [user?.id, invitations, router, loadData]);

  const renderItem = useCallback(({ item }: { item: CompetitionInvitation }) => (
    <ThemedView style={[styles.invitationCard, Shadows.md, { borderColor }]}>
      <View style={styles.invitationHeader}>
        <IconSymbol name="trophy.fill" size={24} color={accentColor} />
        <View style={styles.invitationInfo}>
          <ThemedText style={styles.competitionName}>
            {item.competition?.name || 'Unknown Competition'}
          </ThemedText>
          <ThemedText style={[styles.inviterText, { color: secondaryText }]}>
            Invited by {item.inviter?.display_name || item.inviter?.username}
          </ThemedText>
          <ThemedText style={[styles.timeText, { color: secondaryText }]}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </ThemedText>
        </View>
      </View>

      <View style={styles.invitationActions}>
        <Button
          size="sm"
          variant="outline"
          onPress={() => handleRespond(item.id, false)}
          disabled={actionLoading === item.id}
        >
          Decline
        </Button>
        <Button
          size="sm"
          variant="primary"
          onPress={() => handleRespond(item.id, true)}
          loading={actionLoading === item.id}
        >
          Accept
        </Button>
      </View>
    </ThemedView>
  ), [borderColor, accentColor, secondaryText, actionLoading, handleRespond]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Invitations',
          headerStyle: { backgroundColor: headerBackground },
          headerShadowVisible: false,
        }}
      />

      <ThemedView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
          </View>
        ) : (
          <FlatList
            data={invitations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              invitations.length === 0 && styles.emptyListContent,
            ]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={accentColor}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <IconSymbol name="envelope.open" size={64} color={secondaryText} />
                <ThemedText style={styles.emptyTitle}>No invitations</ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: secondaryText }]}>
                  When friends invite you to competitions, they'll appear here
                </ThemedText>
              </View>
            }
          />
        )}
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
  listContent: {
    padding: Spacing.lg,
  },
  emptyListContent: {
    flex: 1,
  },
  separator: {
    height: Spacing.md,
  },
  invitationCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  invitationHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  invitationInfo: {
    flex: 1,
    gap: Spacing.xxs,
  },
  competitionName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  inviterText: {
    fontSize: Typography.fontSize.sm,
  },
  timeText: {
    fontSize: Typography.fontSize.xs,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
