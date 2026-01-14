import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CatchCard } from '@/components/catches/CatchCard';
import { useAuth } from '@/hooks/use-auth';
import { useFriendCatches } from '@/hooks/use-catches';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const { catches, loading, refresh, loadMore, hasMore } = useFriendCatches(user?.id || null);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Feed</ThemedText>
      </View>
      {loading && catches.length === 0 ? (
        <ThemedView style={styles.center}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      ) : catches.length === 0 ? (
        <ThemedView style={styles.center}>
          <ThemedText>No catches yet</ThemedText>
          <ThemedText type="subtitle" style={styles.emptySubtext}>
            Start logging catches to see them here
          </ThemedText>
        </ThemedView>
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
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          onEndReached={() => {
            if (hasMore && !loading) {
              loadMore();
            }
          }}
          onEndReachedThreshold={0.5}
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
  },
  list: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptySubtext: {
    marginTop: 8,
    opacity: 0.6,
  },
});
