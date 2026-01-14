import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatRelativeTime, formatWeight, formatLength } from '@/lib/utils/formatting';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

interface CatchCardProps {
  catchData: any;
  onPress?: () => void;
}

export function CatchCard({ catchData, onPress }: CatchCardProps) {
  const fishSpecies = catchData.fish_species;
  const location = catchData.location;
  const tackleItem = catchData.tackle_item;
  const user = catchData.user;

  const placeholderColor = useThemeColor({}, 'placeholder');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <ThemedView
        variant="card"
        shadow="lg"
        style={[styles.card, { borderColor }]}
      >
        {catchData.photo_url ? (
          <Image source={{ uri: catchData.photo_url }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
            <ThemedText style={styles.placeholderText}>🐟</ThemedText>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: accentColor }]}>
                  <ThemedText style={styles.avatarInitial}>
                    {(user?.display_name || user?.username || 'U')[0].toUpperCase()}
                  </ThemedText>
                </View>
              )}
              <ThemedText type="defaultSemiBold" style={styles.username}>
                {user?.display_name || user?.username || 'Unknown'}
              </ThemedText>
            </View>
            <ThemedText type="caption" style={[styles.time, { color: textSecondaryColor }]}>
              {formatRelativeTime(catchData.caught_at)}
            </ThemedText>
          </View>

          <ThemedText type="subtitle" style={styles.fishName}>
            {fishSpecies?.common_name || 'Unknown Fish'}
          </ThemedText>

          <View style={styles.details}>
            {catchData.weight && (
              <View style={styles.detailItem}>
                <ThemedText type="caption" style={styles.detailLabel}>Weight</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                  {formatWeight(catchData.weight)}
                </ThemedText>
              </View>
            )}
            {catchData.length && (
              <View style={styles.detailItem}>
                <ThemedText type="caption" style={styles.detailLabel}>Length</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                  {formatLength(catchData.length)}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.metadata}>
            {location && (
              <View style={styles.metaItem}>
                <ThemedText style={styles.metaIcon}>📍</ThemedText>
                <ThemedText type="caption" numberOfLines={1} style={styles.metaText}>
                  {location.name}
                </ThemedText>
              </View>
            )}

            {tackleItem && (
              <View style={styles.metaItem}>
                <ThemedText style={styles.metaIcon}>🎣</ThemedText>
                <ThemedText type="caption" numberOfLines={1} style={styles.metaText}>
                  {tackleItem.name}
                </ThemedText>
              </View>
            )}
          </View>

          {catchData.points > 0 && (
            <View style={[styles.points, { backgroundColor: accentColor }]}>
              <ThemedText type="defaultSemiBold" style={styles.pointsText}>
                +{catchData.points} pts
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
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.lg,
    borderWidth: 1.5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
  },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36,
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  username: {
    fontSize: Typography.fontSize.sm,
  },
  time: {},
  fishName: {
    marginTop: Spacing.xs,
  },
  details: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.xs,
  },
  detailItem: {
    gap: 2,
  },
  detailLabel: {
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    maxWidth: 100,
  },
  points: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  pointsText: {
    color: '#fff',
    fontSize: Typography.fontSize.xs,
  },
});
