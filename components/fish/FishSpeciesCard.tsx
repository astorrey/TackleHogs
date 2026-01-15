import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getFishImageUrl } from '@/lib/api/fish-species';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

type FishSpecies = Database['public']['Tables']['fish_species']['Row'];

interface FishSpeciesCardProps {
  species: FishSpecies;
  variant?: 'compact' | 'full';
  onPress?: () => void;
}

export function FishSpeciesCard({
  species,
  variant = 'compact',
  onPress,
}: FishSpeciesCardProps) {
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const getRarityLabel = (rarity: number) => {
    switch (rarity) {
      case 1: return 'Very Common';
      case 2: return 'Common';
      case 3: return 'Moderate';
      case 4: return 'Uncommon';
      case 5: return 'Rare';
      default: return 'Unknown';
    }
  };

  const getRarityColor = (rarity: number) => {
    switch (rarity) {
      case 1: return '#6B7280';
      case 2: return '#10B981';
      case 3: return '#3B82F6';
      case 4: return '#8B5CF6';
      case 5: return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (variant === 'compact') {
    const content = (
      <View style={styles.compactContainer}>
        <Image
          source={{ uri: getFishImageUrl(species.image_url) }}
          style={styles.compactImage}
          contentFit="cover"
          placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
          transition={200}
        />
        <View style={styles.compactInfo}>
          <ThemedText style={styles.compactName}>{species.common_name}</ThemedText>
        </View>
      </View>
    );

    if (onPress) {
      return (
        <Pressable onPress={onPress}>
          {content}
        </Pressable>
      );
    }
    return content;
  }

  // Full variant
  const content = (
    <ThemedView style={[styles.fullContainer, Shadows.md, { borderColor }]}>
      <Image
        source={{ uri: getFishImageUrl(species.image_url) }}
        style={styles.fullImage}
        contentFit="cover"
        placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
        transition={200}
      />
      <View style={styles.fullContent}>
        <View style={styles.fullHeader}>
          <View style={styles.fullTitleRow}>
            <ThemedText style={styles.fullName}>{species.common_name}</ThemedText>
            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(species.rarity) + '20' }]}>
              <ThemedText style={[styles.rarityText, { color: getRarityColor(species.rarity) }]}>
                {getRarityLabel(species.rarity)}
              </ThemedText>
            </View>
          </View>
          {species.scientific_name && (
            <ThemedText style={[styles.scientificName, { color: secondaryText }]}>
              {species.scientific_name}
            </ThemedText>
          )}
        </View>

        {species.description && (
          <ThemedText style={[styles.description, { color: secondaryText }]} numberOfLines={3}>
            {species.description}
          </ThemedText>
        )}

        <View style={[styles.statsRow, { backgroundColor: surfaceSecondary }]}>
          {species.average_weight && (
            <View style={styles.statItem}>
              <IconSymbol name="scalemass" size={14} color={secondaryText} />
              <ThemedText style={[styles.statText, { color: secondaryText }]}>
                Avg: {species.average_weight} lbs
              </ThemedText>
            </View>
          )}
          <View style={styles.statItem}>
            <IconSymbol name="star.fill" size={14} color={getRarityColor(species.rarity)} />
            <ThemedText style={[styles.statText, { color: secondaryText }]}>
              Rarity: {species.rarity}/5
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compactImage: {
    width: 40,
    height: 30,
    borderRadius: BorderRadius.xs,
    backgroundColor: '#E5E7EB',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  // Full variant
  fullContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fullImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  fullContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  fullHeader: {
    gap: Spacing.xxs,
  },
  fullTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  fullName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
  },
  scientificName: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
  description: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.md,
  },
  rarityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.xs,
  },
  rarityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.fontSize.sm,
  },
});
