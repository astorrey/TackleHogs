import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CatchCard } from '@/components/catches/CatchCard';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/hooks/use-auth';
import { useFriendCatches } from '@/hooks/use-catches';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { Spacing, BorderRadius } from '@/constants/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const { catches, loading, refresh, loadMore, hasMore } = useFriendCatches(user?.id || null);
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'accent');

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${accentColor}15` }]}>
        <ThemedText style={styles.emptyIcon}>🎣</ThemedText>
      </View>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No catches yet
      </ThemedText>
      <ThemedText type="caption" style={styles.emptySubtext}>
        Start logging your catches to see them here.{'\n'}Your friends' catches will also appear in this feed.
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <PageHeader 
        title="Feed" 
        icon="house.fill"
        subtitle="Recent catches from you and friends"
      />
      {loading && catches.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ThemedText type="caption">Loading catches...</ThemedText>
        </View>
      ) : catches.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={catches}
          renderItem={({ item }) => (
            <CatchCard
              catchData={item}
              onPress={() => router.push(`/modal?type=catch&id=${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={accentColor}
            />
          }
          onEndReached={() => {
            if (hasMore && !loading) {
              loadMore();
            }
          }}
          onEndReachedThreshold={0.5}
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
