import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TackleItemCard } from './TackleItemCard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

type TackleItem = Database['public']['Tables']['tackle_items']['Row'];

interface TackleBoxProps {
  items: TackleItem[];
  onItemPress?: (item: TackleItem) => void;
  loading?: boolean;
}

export function TackleBox({ items, onItemPress, loading }: TackleBoxProps) {
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'accent');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText type="caption">Loading tackle items...</ThemedText>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: `${accentColor}15` }]}>
          <ThemedText style={styles.emptyIcon}>🎣</ThemedText>
        </View>
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          No tackle items yet
        </ThemedText>
        <ThemedText type="caption" style={styles.emptySubtext}>
          Add your first item to get started.{'\n'}Build your digital tackle box!
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <TackleItemCard item={item} onPress={() => onItemPress?.(item)} />
      )}
      keyExtractor={(item) => item.id}
      style={styles.flatList}
      contentContainerStyle={[
        styles.list,
        { paddingBottom: insets.bottom + 100 }
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.lg,
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
