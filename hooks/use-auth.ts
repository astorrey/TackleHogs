import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getCurrentUser, getSession, onAuthStateChange, signInWithProvider, signOut } from '@/lib/supabase/auth';

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
    logout,
    isAuthenticated: !!user,
  };
}
