import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { weight, length, species_id, caught_at } = await req.json();

    let points = 10; // Base points
    const bonuses: string[] = [];

    // Size bonus
    if (weight) {
      const sizeBonus = Math.min(Math.floor(weight * 5), 50);
      points += sizeBonus;
      if (sizeBonus > 0) bonuses.push(`Size bonus: +${sizeBonus}`);
    } else if (length) {
      const sizeBonus = Math.min(Math.floor(length * 2), 50);
      points += sizeBonus;
      if (sizeBonus > 0) bonuses.push(`Length bonus: +${sizeBonus}`);
    }

    // Time bonus (early morning/evening)
    if (caught_at) {
      const catchDate = new Date(caught_at);
      const hour = catchDate.getHours();
      
      if ((hour >= 5 && hour <= 8) || (hour >= 18 && hour <= 21)) {
        points += 5;
        bonuses.push('Time bonus: +5');
      }
    }

    // Rarity bonus (would need species data - placeholder)
    // points += rarityBonus;

    return new Response(
      JSON.stringify({
        points,
        bonuses,
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
