import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Location = Database['public']['Tables']['locations']['Row'];
type LocationInsert = Database['public']['Tables']['locations']['Insert'];
type LocationUpdate = Database['public']['Tables']['locations']['Update'];

export async function getLocations(filters?: {
  state?: string;
  type?: string;
  limit?: number;
}) {
  let query = supabase
    .from('locations')
    .select('*')
    .order('name', { ascending: true });

  if (filters?.state) {
    query = query.eq('state', filters.state);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getLocation(id: string) {
  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      fish_species:fish_species (
        id,
        common_name,
        scientific_name
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function findNearestLocation(latitude: number, longitude: number, radiusKm = 10) {
  // Using PostGIS distance calculation (simplified - would need PostGIS extension)
  // For now, using a bounding box approach
  const latDelta = radiusKm / 111; // roughly 111 km per degree latitude
  const lonDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .gte('latitude', latitude - latDelta)
    .lte('latitude', latitude + latDelta)
    .gte('longitude', longitude - lonDelta)
    .lte('longitude', longitude + lonDelta)
    .limit(1);

  if (error) throw error;
  return data?.[0] || null;
}

export async function createLocation(location: LocationInsert) {
  const { data, error } = await supabase
    .from('locations')
    .insert(location)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLocation(id: string, updates: LocationUpdate) {
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
