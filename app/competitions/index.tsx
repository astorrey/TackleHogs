import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompetitionCard } from '@/components/competitions';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import {
  getCompetitions,
  getCompetitionInvitations,
  type Competition,
  type CompetitionStatus,
} from '@/lib/api/competitions';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

type FilterType = 'all' | 'active' | 'mine' | 'completed';

export default function CompetitionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const headerBackground = useThemeColor({}, 'headerBackground');
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      let filterParams: { status?: CompetitionStatus; participating?: boolean } = {};

      switch (filter) {
        case 'active':
          filterParams = { status: 'active' };
          break;
        case 'mine':
          filterParams = { participating: true };
          break;
        case 'completed':
          filterParams = { status: 'completed' };
          break;
      }

      const [comps, invitations] = await Promise.all([
        getCompetitions(user.id, filterParams),
        getCompetitionInvitations(user.id),
      ]);

      setCompetitions(comps);
      setInvitationsCount(invitations.length);
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleCompetitionPress = useCallback((competition: Competition) => {
    router.push(`/competitions/${competition.id}`);
  }, [router]);

  const handleCreatePress = useCallback(() => {
    router.push('/competitions/create');
  }, [router]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'mine', label: 'Joined' },
    { key: 'completed', label: 'Past' },
  ];

  const renderItem = useCallback(({ item }: { item: Competition }) => (
    <CompetitionCard
      competition={item}
      onPress={() => handleCompetitionPress(item)}
    />
  ), [handleCompetitionPress]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Competitions',
          headerStyle: { backgroundColor: headerBackground },
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/competitions/invitations')}
              style={styles.headerButton}
            >
              <IconSymbol name="envelope" size={22} color={accentColor} />
              {invitationsCount > 0 && (
                <View style={[styles.badge, { backgroundColor: accentColor }]}>
                  <ThemedText style={styles.badgeText}>{invitationsCount}</ThemedText>
                </View>
              )}
            </Pressable>
          ),
        }}
      />

      <ThemedView style={styles.container}>
        {/* Filter Tabs */}
        <View style={[styles.filterContainer, { borderColor }]}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.filterTab,
                filter === f.key && [styles.filterTabActive, { backgroundColor: accentColor + '15' }],
              ]}
              onPress={() => setFilter(f.key)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  { color: filter === f.key ? accentColor : secondaryText },
                ]}
              >
                {f.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
          </View>
        ) : (
          <FlatList
            data={competitions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              competitions.length === 0 && styles.emptyListContent,
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
                <IconSymbol name="trophy" size={64} color={secondaryText} />
                <ThemedText style={styles.emptyTitle}>No competitions</ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: secondaryText }]}>
                  {filter === 'mine'
                    ? "You haven't joined any competitions yet"
                    : 'Create a competition to challenge your friends!'}
                </ThemedText>
              </View>
            }
          />
        )}

        {/* Create FAB */}
        <View style={[styles.fabContainer, { bottom: insets.bottom + 16 }]}>
          <Button
            variant="primary"
            icon="plus"
            onPress={handleCreatePress}
          >
            Create Competition
          </Button>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginRight: Spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  filterTabActive: {},
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
  },
  separator: {
    height: Spacing.md,
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
  fabContainer: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
  },
});
