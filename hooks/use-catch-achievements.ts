import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CelebrationVariant } from '@/components/animations/CatchCelebration';

interface CatchData {
  fish_species_id: string;
  weight?: number | null;
  length?: number | null;
}

interface Achievement {
  variant: CelebrationVariant;
  speciesName?: string;
  recordType?: 'weight' | 'length';
  recordValue?: number;
}

export function useCatchAchievements(userId: string | undefined) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const checkAchievements = useCallback(async (catchData: CatchData): Promise<Achievement[]> => {
    if (!userId) return [];

    const foundAchievements: Achievement[] = [];

    try {
      // Check if this is a new species for the user
      const { data: existingCatches, error: catchesError } = await supabase
        .from('catches')
        .select('id')
        .eq('user_id', userId)
        .eq('fish_species_id', catchData.fish_species_id)
        .limit(1);

      if (catchesError) throw catchesError;

      const isNewSpecies = !existingCatches || existingCatches.length === 0;

      if (isNewSpecies) {
        // Get species name for the celebration
        const { data: species } = await supabase
          .from('fish_species')
          .select('common_name')
          .eq('id', catchData.fish_species_id)
          .single();

        foundAchievements.push({
          variant: 'new_species',
          speciesName: species?.common_name,
        });
      }

      // Check for personal records
      if (catchData.weight || catchData.length) {
        const { data: personalBests, error: pbError } = await supabase
          .from('catches')
          .select('weight, length')
          .eq('user_id', userId)
          .eq('fish_species_id', catchData.fish_species_id);

        if (pbError) throw pbError;

        if (catchData.weight) {
          const maxWeight = Math.max(0, ...(personalBests || []).map(c => c.weight || 0));
          if (catchData.weight > maxWeight && maxWeight > 0) {
            foundAchievements.push({
              variant: 'personal_record',
              recordType: 'weight',
              recordValue: catchData.weight,
            });
          }
        }

        if (catchData.length) {
          const maxLength = Math.max(0, ...(personalBests || []).map(c => c.length || 0));
          if (catchData.length > maxLength && maxLength > 0) {
            foundAchievements.push({
              variant: 'personal_record',
              recordType: 'length',
              recordValue: catchData.length,
            });
          }
        }
      }

      // Always add base catch celebration if no special achievements
      if (foundAchievements.length === 0) {
        foundAchievements.push({ variant: 'catch' });
      }

      return foundAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [{ variant: 'catch' }];
    }
  }, [userId]);

  const triggerCelebration = useCallback(async (catchData: CatchData) => {
    const foundAchievements = await checkAchievements(catchData);
    
    if (foundAchievements.length > 0) {
      setAchievements(foundAchievements);
      setCurrentAchievementIndex(0);
      setShowCelebration(true);
    }
  }, [checkAchievements]);

  const dismissCelebration = useCallback(() => {
    // Check if there are more achievements to show
    if (currentAchievementIndex < achievements.length - 1) {
      setCurrentAchievementIndex(prev => prev + 1);
    } else {
      setShowCelebration(false);
      setAchievements([]);
      setCurrentAchievementIndex(0);
    }
  }, [currentAchievementIndex, achievements.length]);

  const currentAchievement = achievements[currentAchievementIndex];

  return {
    showCelebration,
    currentAchievement,
    triggerCelebration,
    dismissCelebration,
    hasMoreAchievements: currentAchievementIndex < achievements.length - 1,
  };
}
