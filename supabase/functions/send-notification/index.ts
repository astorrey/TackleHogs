import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id: string;
  title: string;
  body: string;
  type: 'friend_request' | 'friend_accepted' | 'friend_catch' | 'competition_update' | 'comment' | 'achievement';
  data?: Record<string, any>;
  target: 'friends' | 'user';
  target_user_id?: string;
}

interface ExpoPushMessage {
  to: string;
  sound: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

async function sendExpoPushNotifications(messages: ExpoPushMessage[]) {
  if (messages.length === 0) return;

  const chunks: ExpoPushMessage[][] = [];
  const chunkSize = 100;

  for (let i = 0; i < messages.length; i += chunkSize) {
    chunks.push(messages.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      const result = await response.json();
      console.log('Expo push response:', result);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      user_id,
      title,
      body,
      type,
      data,
      target,
      target_user_id,
    }: NotificationRequest = await req.json();

    if (!user_id || !title || !body || !type || !target) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let targetUserIds: string[] = [];

    if (target === 'friends') {
      // Get all accepted friendships for this user
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${user_id},friend_id.eq.${user_id}`)
        .eq('status', 'accepted');

      if (friendshipsError) throw friendshipsError;

      // Extract friend user IDs
      targetUserIds = (friendships || []).map((f: any) =>
        f.user_id === user_id ? f.friend_id : f.user_id
      );
    } else if (target === 'user' && target_user_id) {
      targetUserIds = [target_user_id];
    }

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No targets to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Check notification preferences and get push tokens
    const { data: preferences, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('user_id, friend_requests, friend_catches, competition_updates, comments')
      .in('user_id', targetUserIds);

    if (prefsError) throw prefsError;

    // Map preferences by user_id
    const prefsMap = new Map(
      (preferences || []).map((p: any) => [p.user_id, p])
    );

    // Filter users based on their notification preferences
    const notificationTypeToPreference: Record<string, string> = {
      friend_request: 'friend_requests',
      friend_accepted: 'friend_requests',
      friend_catch: 'friend_catches',
      competition_update: 'competition_updates',
      comment: 'comments',
      achievement: 'friend_catches', // Default to friend_catches
    };

    const prefKey = notificationTypeToPreference[type];
    const eligibleUserIds = targetUserIds.filter((userId) => {
      const userPrefs = prefsMap.get(userId);
      // If no preferences exist, default to enabled
      if (!userPrefs) return true;
      return userPrefs[prefKey] !== false;
    });

    if (eligibleUserIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All targets have disabled this notification type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get push tokens for eligible users
    const { data: pushTokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token, user_id')
      .in('user_id', eligibleUserIds);

    if (tokensError) throw tokensError;

    if (!pushTokens || pushTokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No push tokens found for targets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Create notification records in the database
    const notificationRecords = eligibleUserIds.map((targetUserId) => ({
      user_id: targetUserId,
      type,
      title,
      body,
      data: data || null,
      read: false,
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notificationRecords);

    if (insertError) {
      console.error('Error inserting notifications:', insertError);
    }

    // Build Expo push messages
    const messages: ExpoPushMessage[] = pushTokens.map((pt: any) => ({
      to: pt.token,
      sound: 'default',
      title,
      body,
      data: {
        ...data,
        type,
        sender_id: user_id,
      },
    }));

    // Send push notifications
    await sendExpoPushNotifications(messages);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${messages.length} notifications`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
