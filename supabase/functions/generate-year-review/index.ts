import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration. SUPABASE_URL and SUPABASE_ANON_KEY must be set.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { user_id, year } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetYear = year || new Date().getFullYear();
    const yearStart = new Date(`${targetYear}-01-01T00:00:00Z`);
    const yearEnd = new Date(`${targetYear}-12-31T23:59:59Z`);

    // Get all catches for the year
    const { data: catches, error: catchesError } = await supabaseClient
      .from('catches')
      .select(`
        *,
        fish_species:fish_species_id (
          common_name,
          scientific_name
        ),
        location:location_id (
          name,
          type
        ),
        tackle_item:tackle_item_id (
          name,
          type,
          brand
        )
      `)
      .eq('user_id', user_id)
      .gte('caught_at', yearStart.toISOString())
      .lte('caught_at', yearEnd.toISOString())
      .order('caught_at', { ascending: false });

    if (catchesError) throw catchesError;

    // Calculate statistics
    const totalCatches = catches?.length || 0;
    const totalPoints = catches?.reduce((sum, c) => sum + (c.points || 0), 0) || 0;
    
    // Biggest fish
    const catchesWithWeight = catches?.filter(c => c.weight) || [];
    const catchesWithLength = catches?.filter(c => c.length) || [];
    const biggestByWeight = catchesWithWeight.length > 0
      ? catchesWithWeight.reduce((max, c) => (c.weight > max.weight ? c : max), catchesWithWeight[0])
      : null;
    const biggestByLength = catchesWithLength.length > 0
      ? catchesWithLength.reduce((max, c) => (c.length > max.length ? c : max), catchesWithLength[0])
      : null;

    // Species count
    const speciesSet = new Set(catches?.map(c => c.fish_species_id) || []);
    const speciesCount = speciesSet.size;

    // Most caught species
    const speciesCounts: Record<string, number> = {};
    catches?.forEach(c => {
      const speciesId = c.fish_species_id;
      speciesCounts[speciesId] = (speciesCounts[speciesId] || 0) + 1;
    });
    const mostCaughtSpeciesId = Object.keys(speciesCounts).reduce((a, b) =>
      speciesCounts[a] > speciesCounts[b] ? a : b, Object.keys(speciesCounts)[0] || ''
    );
    const mostCaughtSpecies = catches?.find(c => c.fish_species_id === mostCaughtSpeciesId)?.fish_species;

    // Favorite location
    const locationCounts: Record<string, number> = {};
    catches?.forEach(c => {
      if (c.location_id) {
        locationCounts[c.location_id] = (locationCounts[c.location_id] || 0) + 1;
      }
    });
    const favoriteLocationId = Object.keys(locationCounts).reduce((a, b) =>
      locationCounts[a] > locationCounts[b] ? a : b, Object.keys(locationCounts)[0] || ''
    );
    const favoriteLocation = catches?.find(c => c.location_id === favoriteLocationId)?.location;

    // Most used tackle
    const tackleCounts: Record<string, number> = {};
    catches?.forEach(c => {
      if (c.tackle_item_id) {
        tackleCounts[c.tackle_item_id] = (tackleCounts[c.tackle_item_id] || 0) + 1;
      }
    });
    const mostUsedTackleId = Object.keys(tackleCounts).reduce((a, b) =>
      tackleCounts[a] > tackleCounts[b] ? a : b, Object.keys(tackleCounts)[0] || ''
    );
    const mostUsedTackle = catches?.find(c => c.tackle_item_id === mostUsedTackleId)?.tackle_item;

    // Best month
    const monthCounts: Record<number, number> = {};
    catches?.forEach(c => {
      const month = new Date(c.caught_at).getMonth();
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    const bestMonth = Object.keys(monthCounts).reduce((a, b) =>
      monthCounts[parseInt(a)] > monthCounts[parseInt(b)] ? a : b, '0'
    );
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return new Response(
      JSON.stringify({
        year: targetYear,
        totalCatches,
        totalPoints,
        speciesCount,
        biggestFish: {
          byWeight: biggestByWeight ? {
            weight: biggestByWeight.weight,
            species: biggestByWeight.fish_species,
            caughtAt: biggestByWeight.caught_at,
          } : null,
          byLength: biggestByLength ? {
            length: biggestByLength.length,
            species: biggestByLength.fish_species,
            caughtAt: biggestByLength.caught_at,
          } : null,
        },
        mostCaughtSpecies: mostCaughtSpecies ? {
          name: mostCaughtSpecies.common_name,
          count: speciesCounts[mostCaughtSpeciesId],
        } : null,
        favoriteLocation: favoriteLocation ? {
          name: favoriteLocation.name,
          type: favoriteLocation.type,
          visits: locationCounts[favoriteLocationId],
        } : null,
        mostUsedTackle: mostUsedTackle ? {
          name: mostUsedTackle.name,
          brand: mostUsedTackle.brand,
          type: mostUsedTackle.type,
          uses: tackleCounts[mostUsedTackleId],
        } : null,
        bestMonth: monthNames[parseInt(bestMonth)],
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
