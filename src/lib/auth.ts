import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface AppUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export function sessionToUser(session: Session | null): AppUser | null {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email ?? undefined,
    name:
      (u.user_metadata?.full_name as string | undefined) ||
      (u.user_metadata?.name as string | undefined) ||
      (u.email ? u.email.split('@')[0] : undefined),
    avatarUrl: (u.user_metadata?.avatar_url as string | undefined) ?? undefined,
  };
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function subscribeToAuthChanges(
  callback: (session: Session | null) => void,
): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}
