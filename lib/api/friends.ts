import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Friendship = Database['public']['Tables']['friendships']['Row'];
type FriendshipInsert = Database['public']['Tables']['friendships']['Insert'];
type FriendshipUpdate = Database['public']['Tables']['friendships']['Update'];

export async function getFriendships(userId: string, status?: 'pending' | 'accepted' | 'blocked') {
  let query = supabase
    .from('friendships')
    .select(`
      *,
      friend:friend_id (
        id,
        username,
        display_name,
        avatar_url
      ),
      user:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      friend:friend_id (
        id,
        username,
        display_name,
        avatar_url,
        state
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted');

  if (error) throw error;
  return data;
}

export async function sendFriendRequest(userId: string, friendId: string) {
  // Check if friendship already exists
  const { data: existing } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .single();

  if (existing) {
    throw new Error('Friendship already exists');
  }

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      user_id: userId,
      friend_id: friendId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acceptFriendRequest(friendshipId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rejectFriendRequest(friendshipId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) throw error;
}

export async function removeFriend(friendshipId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) throw error;
}

export async function searchUsers(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, display_name, avatar_url, state')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit);

  if (error) throw error;
  return data;
}
