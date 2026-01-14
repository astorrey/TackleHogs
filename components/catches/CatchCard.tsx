import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatRelativeTime, formatWeight, formatLength } from '@/lib/utils/formatting';

interface CatchCardProps {
  catchData: any;
  onPress?: () => void;
}

export function CatchCard({ catchData, onPress }: CatchCardProps) {
  const fishSpecies = catchData.fish_species;
  const location = catchData.location;
  const tackleItem = catchData.tackle_item;
  const user = catchData.user;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        {catchData.photo_url ? (
          <Image source={{ uri: catchData.photo_url }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>🐟</ThemedText>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              {user?.avatar_url && (
                <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
              )}
              <ThemedText type="defaultSemiBold">
                {user?.display_name || user?.username || 'Unknown'}
              </ThemedText>
            </View>
            <ThemedText type="caption" style={styles.time}>
              {formatRelativeTime(catchData.caught_at)}
            </ThemedText>
          </View>

          <ThemedText type="title" style={styles.fishName}>
            {fishSpecies?.common_name || 'Unknown Fish'}
          </ThemedText>

          <View style={styles.details}>
            {catchData.weight && (
              <ThemedText type="subtitle" style={styles.detail}>
                Weight: {formatWeight(catchData.weight)}
              </ThemedText>
            )}
            {catchData.length && (
              <ThemedText type="subtitle" style={styles.detail}>
                Length: {formatLength(catchData.length)}
              </ThemedText>
            )}
          </View>

          {location && (
            <ThemedText type="caption" style={styles.location}>
              📍 {location.name}
            </ThemedText>
          )}

          {tackleItem && (
            <ThemedText type="caption" style={styles.tackle}>
              🎣 {tackleItem.name}
            </ThemedText>
          )}

          {catchData.points > 0 && (
            <View style={styles.points}>
              <ThemedText type="defaultSemiBold" style={styles.pointsText}>
                +{catchData.points} points
              </ThemedText>
            </View>
          )}
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
    marginBottom: 12,
    gap: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  time: {
    opacity: 0.6,
  },
  fishName: {
    marginTop: 4,
  },
  details: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  detail: {
    opacity: 0.8,
  },
  location: {
    opacity: 0.7,
    marginTop: 4,
  },
  tackle: {
    opacity: 0.7,
  },
  points: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    color: '#fff',
    fontSize: 12,
  },
});
