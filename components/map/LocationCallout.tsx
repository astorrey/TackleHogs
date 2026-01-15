import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import {
  getRecentCatchesAtLocation,
  getCatchCountAtLocation,
  getLocationTypeIcon,
  getLocationTypeColor,
} from '@/lib/api/locations';
import { getFishImageUrl } from '@/lib/api/fish-species';
import { formatDistanceToNow } from 'date-fns';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

type Location = Database['public']['Tables']['locations']['Row'];

interface RecentCatch {
  id: string;
  weight: number | null;
  length: number | null;
  photo_url: string | null;
  caught_at: string;
  user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  fish_species: {
    id: string;
    common_name: string;
    image_url: string | null;
  } | null;
}

interface LocationCalloutProps {
  location: Location;
  onClose: () => void;
  onViewDetails: () => void;
}

export function LocationCallout({
  location,
  onClose,
  onViewDetails,
}: LocationCalloutProps) {
  const [recentCatches, setRecentCatches] = useState<RecentCatch[]>([]);
  const [catchCount, setCatchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const typeColor = getLocationTypeColor(location.type);
  const typeIcon = getLocationTypeIcon(location.type);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catches, count] = await Promise.all([
          getRecentCatchesAtLocation(location.id, 3),
          getCatchCountAtLocation(location.id),
        ]);
        setRecentCatches(catches as RecentCatch[]);
        setCatchCount(count);
      } catch (error) {
        console.error('Error loading location data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [location.id]);

  return (
    <ThemedView style={[styles.container, Shadows.xl, { borderColor }]}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <IconSymbol name={typeIcon as any} size={14} color={typeColor} />
            <ThemedText style={[styles.typeText, { color: typeColor }]}>
              {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
            </ThemedText>
          </View>
          <ThemedText style={styles.locationName}>{location.name}</ThemedText>
          <ThemedText style={[styles.locationState, { color: secondaryText }]}>
            {location.state}
          </ThemedText>
        </View>
        <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
          <IconSymbol name="xmark.circle.fill" size={24} color={secondaryText} />
        </Pressable>
      </View>

      <View style={[styles.statsRow, { backgroundColor: surfaceSecondary }]}>
        <View style={styles.statItem}>
          <IconSymbol name="fish" size={16} color={secondaryText} />
          <ThemedText style={styles.statValue}>{catchCount}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: secondaryText }]}>Catches</ThemedText>
        </View>
        <View style={styles.statItem}>
          <IconSymbol name="list.bullet" size={16} color={secondaryText} />
          <ThemedText style={styles.statValue}>{location.fish_species?.length || 0}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: secondaryText }]}>Species</ThemedText>
        </View>
      </View>

      <View style={styles.recentSection}>
        <ThemedText style={styles.sectionTitle}>Recent Catches</ThemedText>
        
        {loading ? (
          <ActivityIndicator size="small" style={styles.loader} />
        ) : recentCatches.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.catchesRow}>
              {recentCatches.map((catchItem) => (
                <View key={catchItem.id} style={[styles.catchCard, { borderColor }]}>
                  {catchItem.fish_species?.image_url && (
                    <Image
                      source={{ uri: getFishImageUrl(catchItem.fish_species.image_url) }}
                      style={styles.catchImage}
                      contentFit="cover"
                    />
                  )}
                  <View style={styles.catchInfo}>
                    <ThemedText style={styles.catchSpecies} numberOfLines={1}>
                      {catchItem.fish_species?.common_name || 'Unknown'}
                    </ThemedText>
                    <ThemedText style={[styles.catchUser, { color: secondaryText }]} numberOfLines={1}>
                      {catchItem.user?.display_name || catchItem.user?.username || 'Anonymous'}
                    </ThemedText>
                    <ThemedText style={[styles.catchTime, { color: secondaryText }]}>
                      {formatDistanceToNow(new Date(catchItem.caught_at), { addSuffix: true })}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ThemedText style={[styles.noCatches, { color: secondaryText }]}>
            No recent catches at this location
          </ThemedText>
        )}
      </View>

      <Button onPress={onViewDetails} variant="primary" fullWidth>
        View Location Details
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  typeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  locationName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  locationState: {
    fontSize: Typography.fontSize.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
  },
  recentSection: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  catchesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  catchCard: {
    width: 120,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  catchImage: {
    width: '100%',
    height: 60,
    backgroundColor: '#E5E7EB',
  },
  catchInfo: {
    padding: Spacing.sm,
    gap: Spacing.xxs,
  },
  catchSpecies: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  catchUser: {
    fontSize: Typography.fontSize.xs,
  },
  catchTime: {
    fontSize: Typography.fontSize.xs,
  },
  loader: {
    padding: Spacing.lg,
  },
  noCatches: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    padding: Spacing.lg,
  },
});
