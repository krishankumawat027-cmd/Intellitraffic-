'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  user_id?: string;
  email: string;
  name: string;
  role: 'admin' | 'traffic_officer' | 'citizen';
  avatar_url?: string;
  created_at: string;
}

interface AuthState {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      checkSession: async () => {
        try {
          set({ isLoading: true });

          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session) {
            set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
            return;
          }

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          const profile: Profile = {
            id: profileData?.id || session.user.id,
            user_id: profileData?.user_id || session.user.id,
            email: profileData?.email || session.user.email || '',
            name: profileData?.full_name || '',
            role: profileData?.role || 'citizen',
            avatar_url: profileData?.avatar_url,
            created_at: profileData?.created_at || '',
          };

          set({
            user: session.user,
            profile,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            const message = error.message.toLowerCase();
            if (message.includes('confirm') || message.includes('not confirmed')) {
              throw new Error('Please confirm your email before signing in. Check your inbox or request a new confirmation email.');
            }
            throw new Error(error.message);
          }

          if (!data.user) {
            throw new Error('No user returned');
          }

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (profileError) {
            throw new Error('Failed to fetch profile');
          }

          const profile: Profile = {
            id: profileData?.id || data.user.id,
            user_id: profileData?.user_id || data.user.id,
            email: profileData?.email || data.user.email || '',
            name: profileData?.full_name || '',
            role: profileData?.role || 'citizen',
            avatar_url: profileData?.avatar_url,
            created_at: profileData?.created_at || '',
          };

          set({
            user: data.user,
            profile,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            error: err.message || 'Failed to sign in',
            isLoading: false,
            isAuthenticated: false,
          });
          throw err;
        }
      },

      signUp: async (email: string, password: string, name: string, role: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                role,
              },
            },
          });

          if (error) {
            throw new Error(error.message);
          }

          if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
              user_id: data.user.id,
              email,
              full_name: name,
              role,
              created_at: new Date().toISOString(),
            });

            if (profileError) {
              console.error('Failed to create profile:', profileError);
            }
          }

          set({
            user: data.user,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            error: err.message || 'Failed to sign up',
            isLoading: false,
          });
          throw err;
        }
      },

      resendConfirmation: async (email: string) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
          });

          if (error) {
            throw new Error(error.message);
          }

          set({ isLoading: false });
        } catch (err: any) {
          set({
            error: err.message || 'Failed to resend confirmation email',
            isLoading: false,
          });
          throw err;
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
          });
        } catch (err: any) {
          console.error('Sign out error:', err);
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.resetPasswordForEmail(email);

          if (error) {
            throw new Error(error.message);
          }

          set({ isLoading: false });
        } catch (err: any) {
          set({
            error: err.message || 'Failed to send reset email',
            isLoading: false,
          });
          throw err;
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const { profile } = get();
        if (!profile) return;

        try {
          const updateData: any = { ...updates };
          if (updates.name !== undefined) {
            updateData.full_name = updates.name;
            delete updateData.name;
          }

          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', profile.user_id || profile.id);

          if (error) {
            throw new Error(error.message);
          }

          set({ profile: { ...profile, ...updates } });
        } catch (err: any) {
          set({ error: err.message || 'Failed to update profile' });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
