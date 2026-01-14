import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Database } from '@/lib/supabase/types';

type TackleItem = Database['public']['Tables']['tackle_items']['Row'];

interface TackleItemCardProps {
  item: TackleItem;
  onPress?: () => void;
}

export function TackleItemCard({ item, onPress }: TackleItemCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <IconSymbol name="tray.fill" size={32} />
          </View>
        )}
        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {item.name}
          </ThemedText>
          {item.brand && (
            <ThemedText type="subtitle" style={styles.brand}>
              {item.brand} {item.model || ''}
            </ThemedText>
          )}
          <ThemedText type="caption" style={styles.type}>
            {item.type}
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  brand: {
    opacity: 0.7,
  },
  type: {
    textTransform: 'capitalize',
    opacity: 0.6,
  },
});
