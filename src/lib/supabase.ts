import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

export const isSupabaseConfigured =
  url.startsWith('https://') && anonKey.length > 20;

/**
 * Singleton Supabase client. `null` if env vars are missing — the app then
 * runs in local-only mode (no sync, no auth).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Storage bucket name for sunset photos. */
export const BUCKET = 'sunsets';

/** Database table name for sunset metadata. */
export const TABLE = 'sunsets';
