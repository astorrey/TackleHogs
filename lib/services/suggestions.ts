import { supabase } from '@/lib/supabase/client';

export interface Suggestion {
  tackle_item_id: string;
  name: string;
  type: string;
  brand: string | null;
  score: number;
  reasoning: string;
}

export interface SuggestionResponse {
  suggestions: Suggestion[];
  location: string;
  weather: {
    temperature: number;
    pressure: number;
    conditions: string;
  } | null;
}

export async function getSuggestions(
  latitude: number,
  longitude: number,
  userId: string
): Promise<SuggestionResponse> {
  const { data, error } = await supabase.functions.invoke('get-suggestions', {
    body: { latitude, longitude, user_id: userId },
  });

  if (error) throw error;
  return data;
}
