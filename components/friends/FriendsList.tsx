import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Pressable,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FriendCard } from './FriendCard';
import {
  getFriends,
  getFriendships,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  sendFriendRequest,
} from '@/lib/api/friends';
import { useAuth } from '@/hooks/use-auth';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

type TabType = 'friends' | 'requests' | 'search';

interface FriendUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  state?: string | null;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  friend?: FriendUser;
  user?: FriendUser;
}

export function FriendsList() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const placeholderColor = useThemeColor({}, 'textTertiary');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        getFriends(user.id),
        getFriendships(user.id, 'pending'),
      ]);
      
      setFriends(friendsData || []);
      // Filter requests where current user is the friend (incoming requests)
      setRequests(
        (requestsData || []).filter((r: Friendship) => r.friend_id === user.id)
      );
    } catch (error) {
      console.error('Error loading friends:', error);
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

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchUsers(query, 20);
      // Filter out current user and existing friends
      const friendIds = friends.map(f => f.friend?.id);
      const filtered = results.filter(
        (u: FriendUser) => u.id !== user?.id && !friendIds.includes(u.id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }, [friends, user?.id]);

  const handleAcceptRequest = useCallback(async (friendshipId: string) => {
    setActionLoading(friendshipId);
    try {
      await acceptFriendRequest(friendshipId);
      await loadData();
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setActionLoading(null);
    }
  }, [loadData]);

  const handleRejectRequest = useCallback(async (friendshipId: string) => {
    setActionLoading(friendshipId);
    try {
      await rejectFriendRequest(friendshipId);
      await loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setActionLoading(null);
    }
  }, [loadData]);

  const handleRemoveFriend = useCallback(async (friendshipId: string) => {
    setActionLoading(friendshipId);
    try {
      await removeFriend(friendshipId);
      await loadData();
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setActionLoading(null);
    }
  }, [loadData]);

  const handleAddFriend = useCallback(async (friendId: string) => {
    if (!user?.id) return;
    
    setActionLoading(friendId);
    try {
      await sendFriendRequest(user.id, friendId);
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== friendId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setActionLoading(null);
    }
  }, [user?.id]);

  const renderEmptyState = (type: TabType) => {
    const configs = {
      friends: {
        icon: 'person.2',
        title: 'No friends yet',
        subtitle: 'Search for users to add them as friends',
      },
      requests: {
        icon: 'person.badge.clock',
        title: 'No pending requests',
        subtitle: 'Friend requests will appear here',
      },
      search: {
        icon: 'magnifyingglass',
        title: searchQuery.length < 2 ? 'Search for users' : 'No users found',
        subtitle: searchQuery.length < 2 
          ? 'Enter at least 2 characters to search' 
          : 'Try a different search term',
      },
    };

    const config = configs[type];

    return (
      <View style={styles.emptyState}>
        <IconSymbol name={config.icon as any} size={48} color={secondaryText} />
        <ThemedText style={styles.emptyTitle}>{config.title}</ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: secondaryText }]}>
          {config.subtitle}
        </ThemedText>
      </View>
    );
  };

  const tabs: { key: TabType; label: string; badge?: number }[] = [
    { key: 'friends', label: 'Friends', badge: friends.length },
    { key: 'requests', label: 'Requests', badge: requests.length },
    { key: 'search', label: 'Search' },
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Tabs */}
      <View style={[styles.tabBar, { borderColor }]}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && [styles.activeTab, { borderColor: accentColor }],
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? accentColor : secondaryText },
              ]}
            >
              {tab.label}
            </ThemedText>
            {tab.badge !== undefined && tab.badge > 0 && (
              <View style={[styles.badge, { backgroundColor: accentColor }]}>
                <ThemedText style={styles.badgeText}>{tab.badge}</ThemedText>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Search Input (only visible on search tab) */}
      {activeTab === 'search' && (
        <View style={[styles.searchContainer, { borderColor }]}>
          <IconSymbol name="magnifyingglass" size={18} color={placeholderColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search by username..."
            placeholderTextColor={placeholderColor}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={18} color={secondaryText} />
            </Pressable>
          )}
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : (
        <>
          {activeTab === 'friends' && (
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FriendCard
                  user={item.friend as FriendUser}
                  variant="friend"
                  onRemove={() => handleRemoveFriend(item.id)}
                  loading={actionLoading === item.id}
                />
              )}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={renderEmptyState('friends')}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={accentColor}
                />
              }
            />
          )}

          {activeTab === 'requests' && (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FriendCard
                  user={item.user as FriendUser}
                  variant="request"
                  onAccept={() => handleAcceptRequest(item.id)}
                  onReject={() => handleRejectRequest(item.id)}
                  loading={actionLoading === item.id}
                />
              )}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={renderEmptyState('requests')}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={accentColor}
                />
              }
            />
          )}

          {activeTab === 'search' && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FriendCard
                  user={item}
                  variant="search"
                  onAdd={() => handleAddFriend(item.id)}
                  loading={actionLoading === item.id}
                />
              )}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={renderEmptyState('search')}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  badgeText: {
    color: '#fff',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
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
});
