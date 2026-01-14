import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

type TackleItem = Database['public']['Tables']['tackle_items']['Row'];

interface TackleItemCardProps {
  item: TackleItem;
  onPress?: () => void;
}

export function TackleItemCard({ item, onPress }: TackleItemCardProps) {
  const placeholderColor = useThemeColor({}, 'placeholder');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'accent');
  const iconColor = useThemeColor({}, 'iconSecondary');

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'rod': return '🎣';
      case 'reel': return '🔄';
      case 'lure': return '🪱';
      case 'line': return '🧵';
      case 'hook': return '🪝';
      default: return '📦';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <ThemedView
        variant="card"
        shadow="md"
        style={[styles.card, { borderColor }]}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
            <ThemedText style={styles.typeEmoji}>{getTypeIcon(item.type)}</ThemedText>
          </View>
        )}
        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
            {item.name}
          </ThemedText>
          {item.brand && (
            <ThemedText type="caption" numberOfLines={1} style={styles.brand}>
              {item.brand} {item.model || ''}
            </ThemedText>
          )}
          <View style={[styles.typeBadge, { backgroundColor: `${accentColor}15` }]}>
            <ThemedText style={[styles.typeText, { color: accentColor }]}>
              {item.type}
            </ThemedText>
          </View>
        </View>
        <IconSymbol
          name="chevron.right"
          size={16}
          color={iconColor}
          style={styles.chevron}
        />
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1.5,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
  },
  placeholder: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    fontSize: Typography.fontSize.base,
  },
  brand: {
    marginTop: -2,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  typeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  chevron: {
    marginLeft: Spacing.xs,
  },
});
