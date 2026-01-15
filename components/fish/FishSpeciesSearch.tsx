import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { searchFishSpecies, getFishImageUrl } from '@/lib/api/fish-species';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

type FishSpecies = Database['public']['Tables']['fish_species']['Row'];

interface FishSpeciesSearchProps {
  onSelect: (species: FishSpecies) => void;
  selectedSpecies?: FishSpecies | null;
  placeholder?: string;
}

export function FishSpeciesSearch({
  onSelect,
  selectedSpecies,
  placeholder = 'Search fish species...',
}: FishSpeciesSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FishSpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const placeholderColor = useThemeColor({}, 'textTertiary');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchFishSpecies(searchQuery, 10);
      setResults(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching fish species:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = useCallback((species: FishSpecies) => {
    onSelect(species);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    Keyboard.dismiss();
  }, [onSelect]);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  }, []);

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
      case 1: return '#6B7280'; // Gray
      case 2: return '#10B981'; // Green
      case 3: return '#3B82F6'; // Blue
      case 4: return '#8B5CF6'; // Purple
      case 5: return '#F59E0B'; // Gold
      default: return '#6B7280';
    }
  };

  const renderItem = useCallback(({ item }: { item: FishSpecies }) => (
    <Pressable
      style={({ pressed }) => [
        styles.resultItem,
        { backgroundColor: pressed ? surfaceSecondary : backgroundColor },
      ]}
      onPress={() => handleSelect(item)}
    >
      <Image
        source={{ uri: getFishImageUrl(item.image_url) }}
        style={styles.fishImage}
        contentFit="cover"
        placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
        transition={200}
      />
      <View style={styles.resultInfo}>
        <ThemedText style={styles.fishName}>{item.common_name}</ThemedText>
        {item.scientific_name && (
          <ThemedText style={[styles.scientificName, { color: secondaryText }]}>
            {item.scientific_name}
          </ThemedText>
        )}
        <View style={styles.metaRow}>
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) + '20' }]}>
            <ThemedText style={[styles.rarityText, { color: getRarityColor(item.rarity) }]}>
              {getRarityLabel(item.rarity)}
            </ThemedText>
          </View>
          {item.average_weight && (
            <ThemedText style={[styles.avgWeight, { color: secondaryText }]}>
              Avg: {item.average_weight} lbs
            </ThemedText>
          )}
        </View>
      </View>
      <IconSymbol name="chevron.right" size={16} color={secondaryText} />
    </Pressable>
  ), [backgroundColor, surfaceSecondary, secondaryText, handleSelect]);

  // If a species is selected, show it
  if (selectedSpecies && !showDropdown) {
    return (
      <View style={styles.container}>
        <Pressable
          style={[
            styles.selectedContainer,
            { backgroundColor, borderColor },
          ]}
          onPress={() => {
            setShowDropdown(true);
            setQuery(selectedSpecies.common_name);
          }}
        >
          <Image
            source={{ uri: getFishImageUrl(selectedSpecies.image_url) }}
            style={styles.selectedImage}
            contentFit="cover"
          />
          <View style={styles.selectedInfo}>
            <ThemedText style={styles.selectedName}>{selectedSpecies.common_name}</ThemedText>
            {selectedSpecies.scientific_name && (
              <ThemedText style={[styles.scientificName, { color: secondaryText }]}>
                {selectedSpecies.scientific_name}
              </ThemedText>
            )}
          </View>
          <Pressable onPress={handleClear} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={20} color={secondaryText} />
          </Pressable>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
        <IconSymbol name="magnifyingglass" size={18} color={placeholderColor} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={query}
          onChangeText={handleSearch}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {loading && <ActivityIndicator size="small" color={accentColor} />}
        {query.length > 0 && !loading && (
          <Pressable onPress={handleClear} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={18} color={secondaryText} />
          </Pressable>
        )}
      </View>

      {showDropdown && results.length > 0 && (
        <ThemedView style={[styles.dropdown, Shadows.lg, { borderColor }]}>
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: borderColor }]} />
            )}
          />
        </ThemedView>
      )}

      {showDropdown && query.length >= 2 && results.length === 0 && !loading && (
        <ThemedView style={[styles.dropdown, styles.noResults, Shadows.md, { borderColor }]}>
          <IconSymbol name="fish" size={32} color={placeholderColor} />
          <ThemedText style={[styles.noResultsText, { color: secondaryText }]}>
            No fish species found
          </ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.md,
  },
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    maxHeight: 300,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  fishImage: {
    width: 56,
    height: 42,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#E5E7EB',
  },
  resultInfo: {
    flex: 1,
    gap: Spacing.xxs,
  },
  fishName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  scientificName: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxs,
  },
  rarityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.xs,
  },
  rarityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  avgWeight: {
    fontSize: Typography.fontSize.xs,
  },
  separator: {
    height: 1,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  noResultsText: {
    fontSize: Typography.fontSize.base,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  selectedImage: {
    width: 48,
    height: 36,
    borderRadius: BorderRadius.sm,
  },
  selectedInfo: {
    flex: 1,
    gap: Spacing.xxs,
  },
  selectedName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
