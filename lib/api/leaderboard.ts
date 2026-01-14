import { supabase } from '@/lib/supabase/client';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_catches: number;
  biggest_fish_weight: number | null;
  biggest_fish_length: number | null;
  total_points: number;
  rank: number | null;
}

export async function getLeaderboard(
  state?: string,
  metric: 'points' | 'catches' | 'weight' | 'length' = 'points',
  limit = 100
) {
  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_state: state || null,
    p_metric: metric,
    p_limit: limit,
  });

  if (error) throw error;
  return data as LeaderboardEntry[];
}

export async function getFriendsLeaderboard(userId: string, metric: 'points' | 'catches' | 'weight' | 'length' = 'points') {
  // Get user's friends
  const { data: friendships } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'accepted');

  const friendIds = friendships?.map(f => f.friend_id) || [];
  const userIds = [userId, ...friendIds];

  if (userIds.length === 0) {
    return [];
  }

  // Get leaderboard entries for friends
  const { data: leaderboard } = await supabase
    .from('leaderboard_cache')
    .select(`
      *,
      user:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .in('user_id', userIds)
    .order(metric === 'catches' ? 'total_catches' : 'total_points', { ascending: false });

  if (!leaderboard) return [];

  return leaderboard.map((entry, index) => ({
    user_id: entry.user_id,
    username: (entry.user as any)?.username || '',
    display_name: (entry.user as any)?.display_name || null,
    avatar_url: (entry.user as any)?.avatar_url || null,
    total_catches: entry.total_catches,
    biggest_fish_weight: entry.biggest_fish_weight,
    biggest_fish_length: entry.biggest_fish_length,
    total_points: entry.total_points,
    rank: index + 1,
  })) as LeaderboardEntry[];
}

export async function getUserRank(userId: string, state?: string) {
  const { data, error } = await supabase
    .from('leaderboard_cache')
    .select('rank_state, total_points, total_catches')
    .eq('user_id', userId)
    .eq('state', state || '')
    .single();

  if (error) throw error;
  return data;
}
