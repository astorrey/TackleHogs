import { supabase } from '@/lib/supabase/client';

export interface PointsCalculation {
  points: number;
  bonuses: string[];
}

export async function calculatePoints(
  weight?: number,
  length?: number,
  speciesId?: string,
  caughtAt?: string
): Promise<PointsCalculation> {
  const { data, error } = await supabase.functions.invoke('calculate-points', {
    body: {
      weight,
      length,
      species_id: speciesId,
      caught_at: caughtAt,
    },
  });

  if (error) throw error;
  return data;
}

export function calculatePointsLocal(
  weight?: number,
  length?: number,
  caughtAt?: string
): PointsCalculation {
  let points = 10; // Base points
  const bonuses: string[] = [];

  // Size bonus
  if (weight) {
    const sizeBonus = Math.min(Math.floor(weight * 5), 50);
    points += sizeBonus;
    if (sizeBonus > 0) {
      bonuses.push(`Size bonus: +${sizeBonus}`);
    }
  } else if (length) {
    const sizeBonus = Math.min(Math.floor(length * 2), 50);
    points += sizeBonus;
    if (sizeBonus > 0) {
      bonuses.push(`Length bonus: +${sizeBonus}`);
    }
  }

  // Time bonus (early morning/evening)
  if (caughtAt) {
    const catchDate = new Date(caughtAt);
    const hour = catchDate.getHours();

    if ((hour >= 5 && hour <= 8) || (hour >= 18 && hour <= 21)) {
      points += 5;
      bonuses.push('Time bonus: +5');
    }
  }

  return { points, bonuses };
}
