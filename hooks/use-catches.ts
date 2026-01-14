import { useState, useEffect } from 'react';
import * as catchesApi from '@/lib/api/catches';

export function useCatches(filters?: {
  userId?: string;
  locationId?: string;
  fishSpeciesId?: string;
}) {
  const [catches, setCatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadCatches();
  }, [filters?.userId, filters?.locationId, filters?.fishSpeciesId]);

  const loadCatches = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentOffset = reset ? 0 : offset;
      const data = await catchesApi.getCatches({
        ...filters,
        limit,
        offset: currentOffset,
      });
      
      if (reset) {
        setCatches(data || []);
        setOffset(limit);
      } else {
        setCatches((prev) => [...prev, ...(data || [])]);
        setOffset((prev) => prev + limit);
      }
      
      setHasMore((data?.length || 0) === limit);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addCatch = async (catchData: Parameters<typeof catchesApi.createCatch>[0]) => {
    try {
      const newCatch = await catchesApi.createCatch(catchData);
      setCatches((prev) => [newCatch, ...prev]);
      return newCatch;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateCatch = async (id: string, updates: Parameters<typeof catchesApi.updateCatch>[1]) => {
    try {
      const updated = await catchesApi.updateCatch(id, updates);
      setCatches((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteCatch = async (id: string) => {
    try {
      await catchesApi.deleteCatch(id);
      setCatches((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadCatches(false);
    }
  };

  const refresh = () => {
    setOffset(0);
    loadCatches(true);
  };

  return {
    catches,
    loading,
    error,
    hasMore,
    addCatch,
    updateCatch,
    deleteCatch,
    loadMore,
    refresh,
  };
}

export function useFriendCatches(userId: string | null) {
  const [catches, setCatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadCatches();
  }, [userId]);

  const loadCatches = async (reset = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const currentOffset = reset ? 0 : offset;
      const data = await catchesApi.getFriendCatches(userId, limit, currentOffset);
      
      if (reset) {
        setCatches(data || []);
        setOffset(limit);
      } else {
        setCatches((prev) => [...prev, ...(data || [])]);
        setOffset((prev) => prev + limit);
      }
      
      setHasMore((data?.length || 0) === limit);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && userId) {
      loadCatches(false);
    }
  };

  const refresh = () => {
    setOffset(0);
    loadCatches(true);
  };

  return {
    catches,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
