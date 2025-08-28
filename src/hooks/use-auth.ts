import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Fetch user profile if authenticated
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              setAuthState(prev => ({
                ...prev,
                profile,
                loading: false,
              }));
            } catch (error) {
              console.error('Failed to fetch user profile:', error);
              setAuthState(prev => ({
                ...prev,
                loading: false,
              }));
            }
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            loading: false,
          }));
        }
      }
    );

    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
        }
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));
      } catch (error) {
        console.error('Failed to get session:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkSession();

    // Add focus listener to refresh session when user returns from OAuth
    const handleFocus = () => {
      console.log('Window focused, checking session...');
      checkSession();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) => {
    if (!authState.user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authState.user.id)
      .select()
      .single();

    if (error) throw error;

    setAuthState(prev => ({
      ...prev,
      profile: data,
    }));

    return data;
  };

  return {
    ...authState,
    signOut,
    updateProfile,
    isAuthenticated: !!authState.user,
  };
};