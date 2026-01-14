import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CommentsSection } from './CommentsSection';
import { formatDateTime, formatWeight, formatLength } from '@/lib/utils/formatting';
import * as catchesApi from '@/lib/api/catches';
import { useAuth } from '@/hooks/use-auth';

interface CatchDetailProps {
  catchId: string;
}

export function CatchDetail({ catchId }: CatchDetailProps) {
  const { user } = useAuth();
  const [catchData, setCatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatch();
  }, [catchId]);

  const loadCatch = async () => {
    try {
      setLoading(true);
      const data = await catchesApi.getCatch(catchId);
      setCatchData(data);
    } catch (error) {
      console.error('Error loading catch:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!catchData) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Catch not found</ThemedText>
      </ThemedView>
    );
  }

  const fishSpecies = catchData.fish_species;
  const location = catchData.location;
  const tackleItem = catchData.tackle_item;
  const userData = catchData.user;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {catchData.photo_url && (
          <Image source={{ uri: catchData.photo_url }} style={styles.image} contentFit="cover" />
        )}

        <View style={styles.header}>
          <ThemedText type="title">{fishSpecies?.common_name || 'Unknown Fish'}</ThemedText>
          {fishSpecies?.scientific_name && (
            <ThemedText type="subtitle" style={styles.scientificName}>
              {fishSpecies.scientific_name}
            </ThemedText>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Details
          </ThemedText>
          <View style={styles.details}>
            {catchData.weight && (
              <View style={styles.detailRow}>
                <ThemedText type="subtitle">Weight:</ThemedText>
                <ThemedText>{formatWeight(catchData.weight)}</ThemedText>
              </View>
            )}
            {catchData.length && (
              <View style={styles.detailRow}>
                <ThemedText type="subtitle">Length:</ThemedText>
                <ThemedText>{formatLength(catchData.length)}</ThemedText>
              </View>
            )}
            <View style={styles.detailRow}>
              <ThemedText type="subtitle">Caught:</ThemedText>
              <ThemedText>{formatDateTime(catchData.caught_at)}</ThemedText>
            </View>
            {catchData.points > 0 && (
              <View style={styles.detailRow}>
                <ThemedText type="subtitle">Points:</ThemedText>
                <ThemedText>{catchData.points}</ThemedText>
              </View>
            )}
          </View>
        </View>

        {location && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Location
            </ThemedText>
            <ThemedText>{location.name}</ThemedText>
            <ThemedText type="caption" style={styles.locationType}>
              {location.type}
            </ThemedText>
          </View>
        )}

        {tackleItem && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Tackle Used
            </ThemedText>
            <ThemedText>{tackleItem.name}</ThemedText>
            {tackleItem.brand && (
              <ThemedText type="caption" style={styles.tackleBrand}>
                {tackleItem.brand} {tackleItem.model || ''}
              </ThemedText>
            )}
          </View>
        )}

        {catchData.notes && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Notes
            </ThemedText>
            <ThemedText>{catchData.notes}</ThemedText>
          </View>
        )}

        {user && (
          <CommentsSection catchId={catchId} userId={user.id} />
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  header: {
    gap: 4,
  },
  scientificName: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationType: {
    textTransform: 'capitalize',
    opacity: 0.7,
  },
  tackleBrand: {
    opacity: 0.7,
  },
});
