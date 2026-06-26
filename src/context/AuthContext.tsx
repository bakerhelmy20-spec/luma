import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface UserProfile {
  id: string;
  role_id: number;
  role_name: 'customer' | 'editor' | 'admin';
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  signInWithSocial: (provider: 'google' | 'facebook') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      // Get profile
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*, roles(name)')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create it (handles case when user signs up but profile trigger isn't ready)
        if (error.code === 'PGRST116') {
          const { data: newProf, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: email,
              role_id: 1, // Default to customer
              full_name: email.split('@')[0],
            })
            .select('*, roles(name)')
            .single();

          if (!insertError && newProf) {
            const roleName = (newProf as any).roles?.name || 'customer';
            setProfile({
              id: newProf.id,
              role_id: newProf.role_id,
              role_name: roleName,
              full_name: newProf.full_name,
              email: newProf.email,
              phone: newProf.phone,
              avatar_url: newProf.avatar_url,
            });
            return;
          }
        }
        console.error('Error fetching profile:', error.message);
        setProfile(null);
        return;
      }

      if (prof) {
        const roleName = (prof as any).roles?.name || 'customer';
        setProfile({
          id: prof.id,
          role_id: prof.role_id,
          role_name: roleName,
          full_name: prof.full_name,
          email: prof.email,
          phone: prof.phone,
          avatar_url: prof.avatar_url,
        });
      }
    } catch (err) {
      console.error('Auth Profile Fetch Crash:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '');
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email ?? '');
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update loading state once profile is loaded or user is null
  useEffect(() => {
    if (user && profile) {
      setLoading(false);
    } else if (!user) {
      setLoading(false);
    }
  }, [user, profile]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  const signInWithSocial = async (provider: 'google' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email ?? '');
    }
  };

  const isAdmin = profile?.role_name === 'admin' || profile?.role_name === 'editor';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        signOut,
        signInWithSocial,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
