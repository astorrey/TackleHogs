import { useState, useEffect } from 'react';
import * as tackleApi from '@/lib/api/tackle';
import type { Database } from '@/lib/supabase/types';

type TackleItem = Database['public']['Tables']['tackle_items']['Row'];

export function useTackle(userId: string | null) {
  const [items, setItems] = useState<TackleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadTackleItems();
  }, [userId]);

  const loadTackleItems = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await tackleApi.getTackleItems(userId);
      setItems(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Parameters<typeof tackleApi.createTackleItem>[0]) => {
    try {
      const newItem = await tackleApi.createTackleItem(item);
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Parameters<typeof tackleApi.updateTackleItem>[1]) => {
    try {
      const updated = await tackleApi.updateTackleItem(id, updates);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await tackleApi.deleteTackleItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refresh: loadTackleItems,
  };
}
