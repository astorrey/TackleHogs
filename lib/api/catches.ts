import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Catch = Database['public']['Tables']['catches']['Row'];
type CatchInsert = Database['public']['Tables']['catches']['Insert'];
type CatchUpdate = Database['public']['Tables']['catches']['Update'];

export async function getCatches(filters?: {
  userId?: string;
  locationId?: string;
  fishSpeciesId?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('catches')
    .select(`
      *,
      fish_species:fish_species_id (
        id,
        common_name,
        scientific_name,
        image_url
      ),
      location:location_id (
        id,
        name,
        type
      ),
      tackle_item:tackle_item_id (
        id,
        name,
        type,
        brand
      ),
      user:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .order('caught_at', { ascending: false });

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.locationId) {
    query = query.eq('location_id', filters.locationId);
  }
  if (filters?.fishSpeciesId) {
    query = query.eq('fish_species_id', filters.fishSpeciesId);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getCatch(id: string) {
  const { data, error } = await supabase
    .from('catches')
    .select(`
      *,
      fish_species:fish_species_id (
        id,
        common_name,
        scientific_name,
        image_url
      ),
      location:location_id (
        id,
        name,
        type,
        latitude,
        longitude
      ),
      tackle_item:tackle_item_id (
        id,
        name,
        type,
        brand,
        model
      ),
      user:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCatch(catchData: CatchInsert) {
  const { data, error } = await supabase
    .from('catches')
    .insert(catchData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCatch(id: string, updates: CatchUpdate) {
  const { data, error } = await supabase
    .from('catches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCatch(id: string) {
  const { error } = await supabase
    .from('catches')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getFriendCatches(userId: string, limit = 20, offset = 0) {
  // Get user's friends
  const { data: friendships } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'accepted');

  const friendIds = friendships?.map(f => f.friend_id) || [];
  const userIds = [userId, ...friendIds];

  const { data, error } = await supabase
    .from('catches')
    .select(`
      *,
      fish_species:fish_species_id (
        id,
        common_name,
        scientific_name,
        image_url
      ),
      location:location_id (
        id,
        name,
        type
      ),
      tackle_item:tackle_item_id (
        id,
        name,
        type,
        brand
      ),
      user:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .in('user_id', userIds)
    .order('caught_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}
