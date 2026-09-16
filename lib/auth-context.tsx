'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function fetchProfile(userId: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('id, name, created_at')
    .eq('id', userId)
    .maybeSingle();

  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const sync = async (userId: string | undefined) => {
      const profile = userId ? await fetchProfile(userId) : null;
      if (!active) return;
      setUser(profile);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => sync(data.session?.user.id));

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        sync(session?.user.id);
      }
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
