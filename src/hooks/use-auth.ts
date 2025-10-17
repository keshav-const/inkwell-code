import { useState, useEffect, useRef } from 'react';
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
  
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    console.log('🔐 Initializing authentication...');
    
    // Set a maximum loading timeout to prevent infinite loading
    loadingTimeoutRef.current = setTimeout(() => {
      console.log('⚠️ Auth loading timeout reached, forcing loading to false');
      setAuthState(prev => ({ ...prev, loading: false }));
    }, 10000); // 10 second timeout

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        });
        
        // Clear loading timeout since we got a response
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        
        // Update session and user synchronously
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Handle profile fetching with timeout to avoid blocking
        if (session?.user) {
          setTimeout(async () => {
            try {
              console.log('📝 Fetching user profile for:', session.user.id);
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('❌ Profile fetch error:', error);
                // Profile doesn't exist, create one
                if (error.code === 'PGRST116') {
                  console.log('🆕 Creating new profile for user');
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                      id: session.user.id,
                      email: session.user.email || '',
                      display_name: session.user.user_metadata?.full_name || 
                                   session.user.user_metadata?.name || 
                                   'User'
                    })
                    .select()
                    .single();
                  
                  if (createError) {
                    console.error('❌ Failed to create profile:', createError);
                  } else {
                    console.log('✅ Profile created successfully');
                    setAuthState(prev => ({
                      ...prev,
                      profile: newProfile,
                      loading: false,
                    }));
                    return;
                  }
                }
              } else {
                console.log('✅ Profile fetched successfully');
                setAuthState(prev => ({
                  ...prev,
                  profile,
                  loading: false,
                }));
                return;
              }
            } catch (error) {
              console.error('❌ Failed to fetch user profile:', error);
            }
            
            // Always set loading to false, even on error
            setAuthState(prev => ({
              ...prev,
              loading: false,
            }));
          }, 0);
        } else {
          console.log('👤 No user session, setting loading to false');
          setAuthState(prev => ({
            ...prev,
            profile: null,
            loading: false,
          }));
        }
        
        initializedRef.current = true;
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        console.log('📋 Session check result:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        });
        
        // Only update state if the auth listener hasn't initialized yet
        if (!initializedRef.current) {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
          }));
          
          // If no session, stop loading immediately
          if (!session) {
            console.log('❌ No session found, stopping loading');
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        }
      } catch (error) {
        console.error('❌ Failed to get session:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkSession();

    // Add focus listener to refresh session when user returns from OAuth
    const handleFocus = () => {
      console.log('👁️ Window focused, checking session...');
      checkSession();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      console.log('🧹 Cleaning up auth hook');
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
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