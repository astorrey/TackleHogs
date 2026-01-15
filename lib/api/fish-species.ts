import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type FishSpecies = Database['public']['Tables']['fish_species']['Row'];

export async function searchFishSpecies(query: string, limit = 20): Promise<FishSpecies[]> {
  const { data, error } = await supabase
    .from('fish_species')
    .select('*')
    .or(`common_name.ilike.%${query}%,scientific_name.ilike.%${query}%`)
    .order('common_name')
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getAllFishSpecies(): Promise<FishSpecies[]> {
  const { data, error } = await supabase
    .from('fish_species')
    .select('*')
    .order('common_name');

  if (error) throw error;
  return data || [];
}

export async function getFishSpeciesById(id: string): Promise<FishSpecies | null> {
  const { data, error } = await supabase
    .from('fish_species')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getFishSpeciesByName(commonName: string): Promise<FishSpecies | null> {
  const { data, error } = await supabase
    .from('fish_species')
    .select('*')
    .eq('common_name', commonName)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export function getFishImageUrl(imageUrl: string | null): string {
  if (!imageUrl) {
    return 'https://placehold.co/200x150/0891b2/white?text=Fish';
  }
  
  // If it's a relative path to our storage bucket, construct the full URL
  if (imageUrl.startsWith('fish-images/')) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${imageUrl}`;
  }
  
  // Otherwise return as-is (external URL)
  return imageUrl;
}
