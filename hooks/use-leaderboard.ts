import { useState, useEffect } from 'react';
import * as leaderboardApi from '@/lib/api/leaderboard';
import type { LeaderboardEntry } from '@/lib/api/leaderboard';

export function useLeaderboard(state?: string, metric: 'points' | 'catches' | 'weight' | 'length' = 'points') {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [state, metric]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaderboardApi.getLeaderboard(state, metric);
      setEntries(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    entries,
    loading,
    error,
    refresh: loadLeaderboard,
  };
}

export function useFriendsLeaderboard(userId: string | null, metric: 'points' | 'catches' | 'weight' | 'length' = 'points') {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadLeaderboard();
  }, [userId, metric]);

  const loadLeaderboard = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await leaderboardApi.getFriendsLeaderboard(userId, metric);
      setEntries(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    entries,
    loading,
    error,
    refresh: loadLeaderboard,
  };
}

export function useUserRank(userId: string | null, state?: string) {
  const [rank, setRank] = useState<{ rank_state: number | null; total_points: number; total_catches: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !state) {
      setLoading(false);
      return;
    }
    loadRank();
  }, [userId, state]);

  const loadRank = async () => {
    if (!userId || !state) return;

    try {
      setLoading(true);
      setError(null);
      const data = await leaderboardApi.getUserRank(userId, state);
      setRank(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    rank,
    loading,
    error,
    refresh: loadRank,
  };
}
