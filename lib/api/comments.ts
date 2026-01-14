import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Comment = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export async function getComments(catchId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('catch_id', catchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createComment(comment: CommentInsert) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select(`
      *,
      user:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateComment(id: string, updates: CommentUpdate) {
  const { data, error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(id: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
