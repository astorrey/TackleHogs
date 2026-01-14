import {
    getSession,
    onAuthStateChange,
    resendConfirmationEmail as resendConfirmation,
    signInWithEmail as signInWithEmailAuth,
    signInWithProvider,
    signOut,
    signUpWithEmail as signUpWithEmailAuth
} from '@/lib/supabase/auth';
import { Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (provider: 'google' | 'apple') => {
    const { error } = await signInWithProvider(provider);
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await signInWithEmailAuth(email, password);
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    const { data, error } = await signUpWithEmailAuth(email, password, username);
    if (error) throw error;
    // Return whether email confirmation is needed (user exists but no session)
    return { needsEmailConfirmation: !!data.user && !data.session };
  };

  const resendConfirmationEmail = async (email: string) => {
    const { error } = await resendConfirmation(email);
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    loading,
    signIn,
    signInWithEmail,
    signUpWithEmail,
    resendConfirmationEmail,
    logout,
    isAuthenticated: !!user,
  };
}
