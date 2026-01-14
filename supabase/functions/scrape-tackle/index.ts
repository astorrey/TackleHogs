import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the webpage
    const response = await fetch(url);
    const html = await response.text();

    // Basic scraping logic (simplified - would need more sophisticated parsing)
    // This is a placeholder that extracts basic info from common patterns
    const scrapedData: {
      name?: string;
      brand?: string;
      model?: string;
      description?: string;
      image?: string;
    } = {};

    // Try to extract title/name (common patterns)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      scrapedData.name = titleMatch[1].trim();
    }

    // Try to extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) {
      scrapedData.description = descMatch[1].trim();
    }

    // Try to extract Open Graph image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImageMatch) {
      scrapedData.image = ogImageMatch[1].trim();
    }

    // Try to extract product name from common e-commerce patterns
    const productNameMatch = html.match(/<h1[^>]*class=["'][^"']*product[^"']*["'][^>]*>([^<]+)<\/h1>/i) ||
                             html.match(/<h1[^>]*class=["'][^"']*title[^"']*["'][^>]*>([^<]+)<\/h1>/i);
    if (productNameMatch && !scrapedData.name) {
      scrapedData.name = productNameMatch[1].trim();
    }

    // Try to extract brand/model from name if it contains common patterns
    if (scrapedData.name) {
      const brandModelMatch = scrapedData.name.match(/^([A-Z][a-zA-Z\s]+?)\s+(.+)$/);
      if (brandModelMatch) {
        scrapedData.brand = brandModelMatch[1].trim();
        scrapedData.model = brandModelMatch[2].trim();
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: scrapedData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
