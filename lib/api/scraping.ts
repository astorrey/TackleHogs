import { supabase } from '@/lib/supabase/client';

export interface ScrapedTackleData {
  name?: string;
  brand?: string;
  model?: string;
  description?: string;
  image?: string;
}

export async function scrapeTackleUrl(url: string): Promise<ScrapedTackleData> {
  const { data, error } = await supabase.functions.invoke('scrape-tackle', {
    body: { url },
  });

  if (error) throw error;
  return data?.data || {};
}
