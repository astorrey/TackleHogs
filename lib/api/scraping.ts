import { supabase } from '@/lib/supabase/client';

export interface ScrapedTackleData {
  name?: string;
  brand?: string;
  model?: string;
  description?: string;
  price?: string;
  image?: string;
  specifications?: Record<string, string>;
  source?: string;
}

export interface ScrapeResult {
  success: boolean;
  data: ScrapedTackleData;
  url: string;
}

export async function scrapeTackleUrl(url: string): Promise<ScrapedTackleData> {
  const { data, error } = await supabase.functions.invoke('scrape-tackle', {
    body: { url },
  });

  if (error) throw error;
  return data?.data || {};
}

export async function scrapeTackleUrlWithMeta(url: string): Promise<ScrapeResult> {
  const { data, error } = await supabase.functions.invoke('scrape-tackle', {
    body: { url },
  });

  if (error) throw error;
  return {
    success: data?.success || false,
    data: data?.data || {},
    url: data?.url || url,
  };
}

// Helper to determine tackle type from scraped data
export function inferTackleType(data: ScrapedTackleData): 'rod' | 'reel' | 'lure' | 'line' | 'hook' | 'other' {
  const searchText = `${data.name || ''} ${data.description || ''} ${data.brand || ''}`.toLowerCase();
  
  if (searchText.includes('rod') || searchText.includes('pole')) {
    return 'rod';
  }
  if (searchText.includes('reel') || searchText.includes('spinning')) {
    return 'reel';
  }
  if (searchText.includes('lure') || searchText.includes('bait') || searchText.includes('crankbait') || 
      searchText.includes('jig') || searchText.includes('swimbait') || searchText.includes('spinnerbait')) {
    return 'lure';
  }
  if (searchText.includes('line') || searchText.includes('mono') || searchText.includes('braid') ||
      searchText.includes('fluoro')) {
    return 'line';
  }
  if (searchText.includes('hook')) {
    return 'hook';
  }
  
  return 'other';
}
