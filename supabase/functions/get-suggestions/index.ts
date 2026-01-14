import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Suggestion {
  tackle_item_id: string;
  name: string;
  type: string;
  brand: string | null;
  score: number;
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { latitude, longitude, user_id } = await req.json();

    if (!latitude || !longitude || !user_id) {
      return new Response(
        JSON.stringify({ error: 'latitude, longitude, and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find nearest location
    const { data: locations, error: locError } = await supabaseClient
      .from('locations')
      .select('id, name, fish_species')
      .order('distance', { ascending: true })
      .limit(1);

    if (locError) throw locError;

    const location = locations?.[0];
    if (!location || !location.fish_species || location.fish_species.length === 0) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          message: 'No fish species found for this location' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get weather data
    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    let weatherData = null;
    
    if (weatherApiKey) {
      try {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=imperial`
        );
        weatherData = await weatherResponse.json();
      } catch (error) {
        console.error('Weather API error:', error);
      }
    }

    // Get user's tackle items tagged for these fish species
    const { data: tackleItems, error: tackleError } = await supabaseClient
      .from('tackle_items')
      .select(`
        id,
        name,
        type,
        brand,
        tackle_item_tags (
          fish_species_id,
          effectiveness
        )
      `)
      .eq('user_id', user_id)
      .in('tackle_item_tags.fish_species_id', location.fish_species);

    if (tackleError) throw tackleError;

    // Calculate suggestion scores
    const suggestions: Suggestion[] = [];

    for (const item of tackleItems || []) {
      let score = 0;
      const reasoning: string[] = [];

      // Base score from effectiveness ratings
      const tags = item.tackle_item_tags || [];
      const avgEffectiveness = tags.length > 0
        ? tags.reduce((sum: number, tag: any) => sum + (tag.effectiveness || 3), 0) / tags.length
        : 3;
      score += avgEffectiveness * 20;
      reasoning.push(`Effectiveness rating: ${avgEffectiveness.toFixed(1)}/5`);

      // Weather-based adjustments
      if (weatherData) {
        const temp = weatherData.main?.temp;
        const pressure = weatherData.main?.pressure;
        const windSpeed = weatherData.wind?.speed || 0;

        // Temperature adjustments (simplified logic)
        if (temp >= 60 && temp <= 80) {
          score += 10;
          reasoning.push('Optimal temperature conditions');
        }

        // Pressure adjustments
        if (pressure >= 30.0 && pressure <= 30.2) {
          score += 5;
          reasoning.push('Stable barometric pressure');
        }

        // Wind adjustments
        if (windSpeed < 10) {
          score += 5;
          reasoning.push('Calm wind conditions');
        }
      }

      suggestions.push({
        tackle_item_id: item.id,
        name: item.name,
        type: item.type,
        brand: item.brand,
        score: Math.round(score),
        reasoning: reasoning.join('; '),
      });
    }

    // Sort by score descending
    suggestions.sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify({
        suggestions: suggestions.slice(0, 10), // Top 10
        location: location.name,
        weather: weatherData ? {
          temperature: weatherData.main?.temp,
          pressure: weatherData.main?.pressure,
          conditions: weatherData.weather?.[0]?.description,
        } : null,
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
