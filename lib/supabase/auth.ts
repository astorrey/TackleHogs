import { supabase } from './client';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Required for web OAuth redirect
WebBrowser.maybeCompleteAuthSession();

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

// Google OAuth configuration
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';

/**
 * Get the appropriate Google Client ID for the current platform
 */
function getGoogleClientId(): string {
  switch (Platform.OS) {
    case 'ios':
      return GOOGLE_CLIENT_ID_IOS || GOOGLE_CLIENT_ID_WEB;
    case 'android':
      return GOOGLE_CLIENT_ID_ANDROID || GOOGLE_CLIENT_ID_WEB;
    default:
      return GOOGLE_CLIENT_ID_WEB;
  }
}

/**
 * Sign in with Google using expo-auth-session
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const clientId = getGoogleClientId();
    
    if (!clientId) {
      return {
        data: { user: null, session: null },
        error: { message: 'Google Client ID not configured', name: 'ConfigError' } as AuthError,
      };
    }

    // For web, use Supabase's built-in OAuth flow
    if (Platform.OS === 'web') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { data: { user: null, session: null }, error };
    }

    // For mobile, use expo-auth-session
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'tacklehogs',
      path: 'auth/callback',
    });

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
    });

    const result = await request.promptAsync(discovery);

    if (result.type === 'success' && result.authentication?.accessToken) {
      // Exchange Google token with Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.authentication.idToken || result.authentication.accessToken,
        access_token: result.authentication.accessToken,
      });

      return {
        data: { user: data?.user ?? null, session: data?.session ?? null },
        error,
      };
    } else if (result.type === 'cancel') {
      return {
        data: { user: null, session: null },
        error: { message: 'Sign in was cancelled', name: 'CancelError' } as AuthError,
      };
    } else {
      return {
        data: { user: null, session: null },
        error: { message: 'Sign in failed', name: 'AuthError' } as AuthError,
      };
    }
  } catch (error: any) {
    return {
      data: { user: null, session: null },
      error: { message: error.message || 'Unknown error', name: 'AuthError' } as AuthError,
    };
  }
}

/**
 * Sign in with OAuth provider (legacy wrapper)
 */
export async function signInWithProvider(provider: 'google' | 'apple'): Promise<AuthResponse> {
  if (provider === 'google') {
    return signInWithGoogle();
  }
  
  // Apple sign-in placeholder - to be implemented
  return {
    data: { user: null, session: null },
    error: { message: 'Apple sign-in not yet implemented', name: 'NotImplemented' } as AuthError,
  };
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
