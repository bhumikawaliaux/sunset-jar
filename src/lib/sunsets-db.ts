import { TABLE, supabase } from './supabase';
import type { Sunset } from '../SunsetContext';

interface SunsetRow {
  id: string;
  user_id: string;
  image_url: string;
  place: string;
  time: string | null;
  note: string | null;
  created_at: string;
}

function rowToSunset(row: SunsetRow): Sunset {
  return {
    id: row.id,
    imageUrl: row.image_url,
    place: row.place,
    time: row.time ?? undefined,
    note: row.note ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function fetchSunsets(userId: string): Promise<Sunset[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as SunsetRow[] | null)?.map(rowToSunset) ?? [];
}

export async function insertSunset(
  userId: string,
  sunset: Sunset,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(TABLE).insert({
    id: sunset.id,
    user_id: userId,
    image_url: sunset.imageUrl,
    place: sunset.place,
    time: sunset.time ?? null,
    note: sunset.note ?? null,
    created_at: new Date(sunset.createdAt).toISOString(),
  });
  if (error) throw error;
}

export async function updateSunsetRow(
  id: string,
  patch: Partial<Pick<Sunset, 'place' | 'time' | 'note' | 'imageUrl'>>,
): Promise<void> {
  if (!supabase) return;
  const dbPatch: Record<string, string | null> = {};
  if (patch.place !== undefined) dbPatch.place = patch.place;
  if (patch.time !== undefined) dbPatch.time = patch.time ?? null;
  if (patch.note !== undefined) dbPatch.note = patch.note ?? null;
  if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl;
  if (Object.keys(dbPatch).length === 0) return;
  const { error } = await supabase.from(TABLE).update(dbPatch).eq('id', id);
  if (error) throw error;
}

export async function deleteSunsetRow(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from(TABLE).delete().eq('id', id);
}
