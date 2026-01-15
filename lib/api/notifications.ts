import { supabase } from '@/lib/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'friend_accepted' | 'friend_catch' | 'competition_update' | 'comment' | 'achievement';
  title: string;
  body: string;
  data: Record<string, any> | null;
  read: boolean;
  sent_at: string;
  read_at: string | null;
}

export interface NotificationPreferences {
  user_id: string;
  friend_requests: boolean;
  friend_catches: boolean;
  competition_updates: boolean;
  comments: boolean;
}

export async function registerPushToken(
  userId: string,
  token: string,
  platform: 'ios' | 'android' | 'web',
  deviceName?: string
) {
  const { data, error } = await supabase
    .from('push_tokens')
    .upsert(
      {
        user_id: userId,
        token,
        platform,
        device_name: deviceName,
      },
      { onConflict: 'token' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removePushToken(token: string) {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('token', token);

  if (error) throw error;
}

export async function getNotifications(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Notification[];
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, 'user_id'>>
) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(
      {
        user_id: userId,
        ...preferences,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function sendNotificationToFriends(
  userId: string,
  title: string,
  body: string,
  type: Notification['type'],
  data?: Record<string, any>
) {
  // Call edge function to send push notifications
  const { error } = await supabase.functions.invoke('send-notification', {
    body: {
      user_id: userId,
      title,
      body,
      type,
      data,
      target: 'friends',
    },
  });

  if (error) throw error;
}
