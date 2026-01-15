import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { format, addDays, addWeeks, addMonths, addYears, startOfDay, endOfDay } from 'date-fns';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { FishSpeciesSearch } from '@/components/fish';
import {
  createCompetition,
  type CompetitionType,
  type CompetitionMetric,
  type CreateCompetitionInput,
} from '@/lib/api/competitions';
import { useAuth } from '@/hooks/use-auth';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

type FishSpecies = Database['public']['Tables']['fish_species']['Row'];

interface CreateCompetitionFormProps {
  onSuccess: (competitionId: string) => void;
  onCancel: () => void;
}

const COMPETITION_TYPES: { value: CompetitionType; label: string; icon: string }[] = [
  { value: 'daily', label: 'Daily', icon: 'sun.max' },
  { value: 'weekly', label: 'Weekly', icon: 'calendar.badge.clock' },
  { value: 'monthly', label: 'Monthly', icon: 'calendar' },
  { value: 'yearly', label: 'Yearly', icon: 'star.circle' },
];

const COMPETITION_METRICS: { value: CompetitionMetric; label: string; description: string }[] = [
  { value: 'points', label: 'Total Points', description: 'Most points wins' },
  { value: 'catches', label: 'Most Catches', description: 'Highest catch count wins' },
  { value: 'weight', label: 'Biggest Fish (Weight)', description: 'Heaviest single catch wins' },
  { value: 'length', label: 'Biggest Fish (Length)', description: 'Longest single catch wins' },
];

export function CreateCompetitionForm({ onSuccess, onCancel }: CreateCompetitionFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CompetitionType>('weekly');
  const [metric, setMetric] = useState<CompetitionMetric>('points');
  const [targetSpecies, setTargetSpecies] = useState<FishSpecies | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const placeholderColor = useThemeColor({}, 'textTertiary');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const getDates = useCallback(() => {
    const now = new Date();
    const start = startOfDay(now);
    let end: Date;

    switch (type) {
      case 'daily':
        end = endOfDay(now);
        break;
      case 'weekly':
        end = endOfDay(addDays(now, 7));
        break;
      case 'monthly':
        end = endOfDay(addMonths(now, 1));
        break;
      case 'yearly':
        end = endOfDay(addYears(now, 1));
        break;
    }

    return { start, end };
  }, [type]);

  const handleSubmit = useCallback(async () => {
    if (!user?.id) return;
    if (!name.trim()) {
      setError('Please enter a competition name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { start, end } = getDates();
      
      const input: CreateCompetitionInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        metric,
        target_species_id: targetSpecies?.id,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        is_public: isPublic,
      };

      const competition = await createCompetition(user.id, input);
      onSuccess(competition.id);
    } catch (err) {
      console.error('Error creating competition:', err);
      setError('Failed to create competition. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, name, description, type, metric, targetSpecies, isPublic, getDates, onSuccess]);

  const { start, end } = getDates();

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Name Input */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Competition Name *</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="e.g., Weekend Bass Challenge"
            placeholderTextColor={placeholderColor}
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { color: textColor, borderColor }]}
            placeholder="What's this competition about?"
            placeholderTextColor={placeholderColor}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />
        </View>

        {/* Competition Type */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Duration</ThemedText>
          <View style={styles.optionsRow}>
            {COMPETITION_TYPES.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  { borderColor },
                  type === option.value && [styles.optionSelected, { borderColor: accentColor, backgroundColor: accentColor + '10' }],
                ]}
                onPress={() => setType(option.value)}
              >
                <IconSymbol
                  name={option.icon as any}
                  size={20}
                  color={type === option.value ? accentColor : secondaryText}
                />
                <ThemedText
                  style={[
                    styles.optionLabel,
                    type === option.value && { color: accentColor },
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <ThemedText style={[styles.dateInfo, { color: secondaryText }]}>
            {format(start, 'MMM d, yyyy')} - {format(end, 'MMM d, yyyy')}
          </ThemedText>
        </View>

        {/* Metric */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Scoring Method</ThemedText>
          <View style={styles.metricOptions}>
            {COMPETITION_METRICS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.metricOption,
                  { borderColor, backgroundColor: surfaceSecondary },
                  metric === option.value && [styles.optionSelected, { borderColor: accentColor, backgroundColor: accentColor + '10' }],
                ]}
                onPress={() => setMetric(option.value)}
              >
                <View style={styles.metricContent}>
                  <ThemedText
                    style={[
                      styles.metricLabel,
                      metric === option.value && { color: accentColor },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  <ThemedText style={[styles.metricDescription, { color: secondaryText }]}>
                    {option.description}
                  </ThemedText>
                </View>
                {metric === option.value && (
                  <IconSymbol name="checkmark.circle.fill" size={20} color={accentColor} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Target Species (Optional) */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Target Species (Optional)</ThemedText>
          <ThemedText style={[styles.hint, { color: secondaryText }]}>
            Leave empty for any species, or select one to focus the competition
          </ThemedText>
          <FishSpeciesSearch
            onSelect={setTargetSpecies}
            selectedSpecies={targetSpecies}
            placeholder="Search for a target species..."
          />
        </View>

        {/* Public Toggle */}
        <Pressable
          style={[styles.toggleRow, { borderColor }]}
          onPress={() => setIsPublic(!isPublic)}
        >
          <View style={styles.toggleInfo}>
            <IconSymbol
              name={isPublic ? 'globe' : 'lock.fill'}
              size={20}
              color={accentColor}
            />
            <View>
              <ThemedText style={styles.toggleLabel}>
                {isPublic ? 'Public Competition' : 'Private Competition'}
              </ThemedText>
              <ThemedText style={[styles.toggleHint, { color: secondaryText }]}>
                {isPublic
                  ? 'Anyone can join this competition'
                  : 'Only invited friends can join'}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.toggle, isPublic && { backgroundColor: accentColor }]}>
            <View style={[styles.toggleKnob, isPublic && styles.toggleKnobActive]} />
          </View>
        </Pressable>

        {/* Error */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#FEF2F2' }]}>
            <IconSymbol name="exclamationmark.circle.fill" size={16} color="#DC2626" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="outline" onPress={onCancel} style={styles.button}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            loading={loading}
            disabled={!name.trim() || loading}
            style={styles.button}
          >
            Create Competition
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.xs,
  },
  optionSelected: {
    borderWidth: 2,
  },
  optionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  dateInfo: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  metricOptions: {
    gap: Spacing.sm,
  },
  metricOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  metricContent: {
    flex: 1,
    gap: Spacing.xxs,
  },
  metricLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  metricDescription: {
    fontSize: Typography.fontSize.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  toggleLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  toggleHint: {
    fontSize: Typography.fontSize.sm,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: BorderRadius.full,
    backgroundColor: '#D1D5DB',
    padding: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.full,
    backgroundColor: '#fff',
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  errorText: {
    color: '#DC2626',
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
});
