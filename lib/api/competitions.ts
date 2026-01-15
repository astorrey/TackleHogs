import { supabase } from '@/lib/supabase/client';

export type CompetitionType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type CompetitionStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type CompetitionMetric = 'points' | 'catches' | 'weight' | 'length';

export interface Competition {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  type: CompetitionType;
  metric: CompetitionMetric;
  target_species_id: string | null;
  start_date: string;
  end_date: string;
  status: CompetitionStatus;
  is_public: boolean;
  max_participants: number | null;
  created_at: string;
  creator?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  target_species?: {
    id: string;
    common_name: string;
    image_url: string | null;
  };
  participants_count?: number;
}

export interface CompetitionParticipant {
  id: string;
  competition_id: string;
  user_id: string;
  score: number;
  catch_count: number;
  best_catch_id: string | null;
  rank: number | null;
  joined_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface CompetitionInvitation {
  id: string;
  competition_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  competition?: Competition;
  inviter?: {
    id: string;
    username: string;
    display_name: string | null;
  };
}

export interface CreateCompetitionInput {
  name: string;
  description?: string;
  type: CompetitionType;
  metric: CompetitionMetric;
  target_species_id?: string;
  start_date: string;
  end_date: string;
  is_public?: boolean;
  max_participants?: number;
}

// Get all competitions user is part of or public competitions
export async function getCompetitions(userId: string, filter?: {
  status?: CompetitionStatus;
  type?: CompetitionType;
  participating?: boolean;
}) {
  let query = supabase
    .from('competitions')
    .select(`
      *,
      creator:creator_id (id, username, display_name, avatar_url),
      target_species:target_species_id (id, common_name, image_url),
      participants:competition_participants (count)
    `)
    .order('start_date', { ascending: false });

  if (filter?.status) {
    query = query.eq('status', filter.status);
  }

  if (filter?.type) {
    query = query.eq('type', filter.type);
  }

  if (filter?.participating) {
    // Get competitions user is participating in
    const { data: participations } = await supabase
      .from('competition_participants')
      .select('competition_id')
      .eq('user_id', userId);
    
    const competitionIds = participations?.map(p => p.competition_id) || [];
    if (competitionIds.length > 0) {
      query = query.in('id', competitionIds);
    } else {
      return [];
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  // Transform participants count
  return (data || []).map(comp => ({
    ...comp,
    participants_count: comp.participants?.[0]?.count || 0,
    participants: undefined,
  }));
}

export async function getCompetition(competitionId: string) {
  const { data, error } = await supabase
    .from('competitions')
    .select(`
      *,
      creator:creator_id (id, username, display_name, avatar_url),
      target_species:target_species_id (id, common_name, image_url)
    `)
    .eq('id', competitionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getCompetitionLeaderboard(competitionId: string, limit = 50) {
  const { data, error } = await supabase
    .from('competition_participants')
    .select(`
      *,
      user:user_id (id, username, display_name, avatar_url)
    `)
    .eq('competition_id', competitionId)
    .order('rank', { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return data as CompetitionParticipant[];
}

export async function getUserCompetitionRank(competitionId: string, userId: string) {
  const { data, error } = await supabase
    .from('competition_participants')
    .select('*')
    .eq('competition_id', competitionId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createCompetition(userId: string, input: CreateCompetitionInput) {
  const { data, error } = await supabase
    .from('competitions')
    .insert({
      creator_id: userId,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-join creator as participant
  await joinCompetition(data.id, userId);

  return data;
}

export async function updateCompetition(competitionId: string, updates: Partial<CreateCompetitionInput>) {
  const { data, error } = await supabase
    .from('competitions')
    .update(updates)
    .eq('id', competitionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelCompetition(competitionId: string) {
  const { error } = await supabase
    .from('competitions')
    .update({ status: 'cancelled' })
    .eq('id', competitionId);

  if (error) throw error;
}

export async function joinCompetition(competitionId: string, userId: string) {
  const { data, error } = await supabase
    .from('competition_participants')
    .insert({
      competition_id: competitionId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function leaveCompetition(competitionId: string, userId: string) {
  const { error } = await supabase
    .from('competition_participants')
    .delete()
    .eq('competition_id', competitionId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function inviteToCompetition(
  competitionId: string,
  inviterId: string,
  inviteeId: string
) {
  const { data, error } = await supabase
    .from('competition_invitations')
    .insert({
      competition_id: competitionId,
      inviter_id: inviterId,
      invitee_id: inviteeId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCompetitionInvitations(userId: string) {
  const { data, error } = await supabase
    .from('competition_invitations')
    .select(`
      *,
      competition:competition_id (*),
      inviter:inviter_id (id, username, display_name)
    `)
    .eq('invitee_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CompetitionInvitation[];
}

export async function respondToInvitation(invitationId: string, accept: boolean, userId: string) {
  const { data: invitation, error: fetchError } = await supabase
    .from('competition_invitations')
    .select('competition_id')
    .eq('id', invitationId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('competition_invitations')
    .update({
      status: accept ? 'accepted' : 'declined',
      responded_at: new Date().toISOString(),
    })
    .eq('id', invitationId);

  if (error) throw error;

  // If accepted, join the competition
  if (accept && invitation) {
    await joinCompetition(invitation.competition_id, userId);
  }
}

// Helper functions
export function getCompetitionDuration(type: CompetitionType): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (type) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

export function getMetricLabel(metric: CompetitionMetric): string {
  switch (metric) {
    case 'points': return 'Total Points';
    case 'catches': return 'Most Catches';
    case 'weight': return 'Biggest Fish (Weight)';
    case 'length': return 'Biggest Fish (Length)';
  }
}

export function formatScore(score: number, metric: CompetitionMetric): string {
  switch (metric) {
    case 'points':
      return `${Math.round(score)} pts`;
    case 'catches':
      return `${Math.round(score)} catches`;
    case 'weight':
      return `${score.toFixed(2)} lbs`;
    case 'length':
      return `${score.toFixed(1)} in`;
  }
}
