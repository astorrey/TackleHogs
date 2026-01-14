import { FlatList, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TackleItemCard } from './TackleItemCard';
import type { Database } from '@/lib/supabase/types';

type TackleItem = Database['public']['Tables']['tackle_items']['Row'];

interface TackleBoxProps {
  items: TackleItem[];
  onItemPress?: (item: TackleItem) => void;
  loading?: boolean;
}

export function TackleBox({ items, onItemPress, loading }: TackleBoxProps) {
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (items.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.emptyText}>No tackle items yet</ThemedText>
        <ThemedText type="subtitle" style={styles.emptySubtext}>
          Add your first item to get started
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <TackleItemCard item={item} onPress={() => onItemPress?.(item)} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.6,
  },
});
