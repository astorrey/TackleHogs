import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  user_id: string;
  latitude?: number;
  longitude?: number;
  target_fish?: string;
  location_name?: string;
}

interface TackleItem {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    const {
      message,
      user_id,
      latitude,
      longitude,
      target_fish,
      location_name,
    }: ChatRequest = await req.json();

    if (!message || !user_id) {
      return new Response(
        JSON.stringify({ error: 'message and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's tackle box
    const { data: tackleItems, error: tackleError } = await supabaseClient
      .from('tackle_items')
      .select('id, name, type, brand, model, description')
      .eq('user_id', user_id);

    if (tackleError) throw tackleError;

    // Get weather data if location provided
    let weatherInfo = '';
    if (latitude && longitude) {
      const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
      if (weatherApiKey) {
        try {
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=imperial`
          );
          const weatherData = await weatherResponse.json();
          weatherInfo = `Current weather: ${weatherData.main?.temp}°F, ${weatherData.weather?.[0]?.description}, wind ${weatherData.wind?.speed} mph`;
        } catch (e) {
          console.error('Weather fetch error:', e);
        }
      }
    }

    // Get location info if available
    let locationInfo = '';
    if (location_name) {
      locationInfo = `Location: ${location_name}`;
    } else if (latitude && longitude) {
      // Find nearest location
      const { data: nearbyLocations } = await supabaseClient
        .from('locations')
        .select('name, type, fish_species')
        .limit(1);
      
      if (nearbyLocations?.[0]) {
        locationInfo = `Nearby: ${nearbyLocations[0].name} (${nearbyLocations[0].type})`;
      }
    }

    // Get fish species info if targeting specific fish
    let fishInfo = '';
    if (target_fish) {
      const { data: fishData } = await supabaseClient
        .from('fish_species')
        .select('common_name, description, average_weight')
        .ilike('common_name', `%${target_fish}%`)
        .limit(1);
      
      if (fishData?.[0]) {
        fishInfo = `Target fish info: ${fishData[0].common_name} - ${fishData[0].description || 'No description'}`;
      }
    }

    // Build tackle box summary
    const tackleBoxSummary = (tackleItems || [])
      .map((item: TackleItem) => `- ${item.name} (${item.type})${item.brand ? ` by ${item.brand}` : ''}`)
      .join('\n');

    // Build the prompt
    const systemPrompt = `You are a friendly and knowledgeable fishing assistant for the TackleHogs app. 
Your job is to help anglers choose the right tackle from their tackle box based on their fishing conditions.

Be concise but helpful. Use a casual, friendly tone like you're talking to a fishing buddy.
When recommending tackle, explain WHY each item would be good for the situation.
Consider weather conditions, target species, and location type when making recommendations.

If the user doesn't have appropriate tackle for their situation, kindly let them know and suggest what they might want to add.`;

    const userContext = `
USER'S TACKLE BOX:
${tackleBoxSummary || 'No tackle items added yet'}

CURRENT CONDITIONS:
${weatherInfo || 'Weather unknown'}
${locationInfo || 'Location unknown'}
${fishInfo || ''}

USER'S MESSAGE: ${message}`;

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContext },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiMessage = openaiData.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that request.';

    // Extract recommended tackle items from response (simple matching)
    const recommendedItems: TackleItem[] = [];
    if (tackleItems) {
      for (const item of tackleItems) {
        if (aiMessage.toLowerCase().includes(item.name.toLowerCase())) {
          recommendedItems.push(item);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        recommended_items: recommendedItems,
        weather: weatherInfo || null,
        location: locationInfo || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
