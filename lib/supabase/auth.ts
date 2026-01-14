import { supabase } from './client';
import type { AuthError, Session, User } from '@supabase/supabase-js';

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithProvider(provider: 'google' | 'apple'): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.EXPO_PUBLIC_APP_URL || 'tacklehogs://'}`,
    },
  });

  return { data: { user: null, session: null }, error };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
