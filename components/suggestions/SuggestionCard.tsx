import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Suggestion } from '@/lib/services/suggestions';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onPress?: () => void;
}

export function SuggestionCard({ suggestion, onPress }: SuggestionCardProps) {
  const accentColor = useThemeColor({}, 'accent');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        <View style={styles.header}>
          <View style={styles.content}>
            <ThemedText type="defaultSemiBold" numberOfLines={1}>
              {suggestion.name}
            </ThemedText>
            {suggestion.brand && (
              <ThemedText type="subtitle" style={styles.brand}>
                {suggestion.brand}
              </ThemedText>
            )}
            <ThemedText type="caption" style={styles.type}>
              {suggestion.type}
            </ThemedText>
          </View>
          <View style={[styles.scoreContainer, { backgroundColor: accentColor }]}>
            <ThemedText type="title" style={styles.score}>
              {suggestion.score}
            </ThemedText>
            <ThemedText type="caption" style={styles.scoreLabel}>
              Score
            </ThemedText>
          </View>
        </View>
        {suggestion.reasoning && (
          <ThemedText type="caption" style={styles.reasoning}>
            {suggestion.reasoning}
          </ThemedText>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  brand: {
    opacity: 0.7,
  },
  type: {
    textTransform: 'capitalize',
    opacity: 0.6,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  score: {
    color: '#fff',
    fontSize: 24,
  },
  scoreLabel: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 10,
  },
  reasoning: {
    opacity: 0.7,
    marginTop: 4,
  },
});
