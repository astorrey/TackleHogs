import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type TackleItem = Database['public']['Tables']['tackle_items']['Row'];
type TackleItemInsert = Database['public']['Tables']['tackle_items']['Insert'];
type TackleItemUpdate = Database['public']['Tables']['tackle_items']['Update'];

export async function getTackleItems(userId: string) {
  const { data, error } = await supabase
    .from('tackle_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTackleItem(id: string) {
  const { data, error } = await supabase
    .from('tackle_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTackleItem(item: TackleItemInsert) {
  const { data, error } = await supabase
    .from('tackle_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTackleItem(id: string, updates: TackleItemUpdate) {
  const { data, error } = await supabase
    .from('tackle_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTackleItem(id: string) {
  const { error } = await supabase
    .from('tackle_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function addTackleItemTag(tackleItemId: string, fishSpeciesId: string, effectiveness?: number) {
  const { data, error } = await supabase
    .from('tackle_item_tags')
    .insert({
      tackle_item_id: tackleItemId,
      fish_species_id: fishSpeciesId,
      effectiveness: effectiveness || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeTackleItemTag(tackleItemId: string, fishSpeciesId: string) {
  const { error } = await supabase
    .from('tackle_item_tags')
    .delete()
    .eq('tackle_item_id', tackleItemId)
    .eq('fish_species_id', fishSpeciesId);

  if (error) throw error;
}

export async function getTackleItemTags(tackleItemId: string) {
  const { data, error } = await supabase
    .from('tackle_item_tags')
    .select(`
      *,
      fish_species:fish_species_id (
        id,
        common_name,
        scientific_name
      )
    `)
    .eq('tackle_item_id', tackleItemId);

  if (error) throw error;
  return data;
}
