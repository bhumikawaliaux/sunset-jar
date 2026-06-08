import { BUCKET, supabase } from './supabase';

/**
 * Uploads a data: URL (FileReader output) into the sunsets bucket and
 * returns the public URL. Path is scoped per user.
 */
export async function uploadSunsetImage(
  dataUrl: string,
  userId: string,
  sunsetId: string,
): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured');

  // data: URL → Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const path = `${userId}/${sunsetId}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type,
    upsert: true,
    cacheControl: '31536000',
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Deletes a sunset image from storage, given its public URL.
 * Best-effort — silently ignores if the URL is local or path can't be parsed.
 */
export async function deleteSunsetImage(imageUrl: string): Promise<void> {
  if (!supabase) return;
  if (!imageUrl.startsWith('http')) return;
  try {
    const u = new URL(imageUrl);
    const marker = `/${BUCKET}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx < 0) return;
    const path = u.pathname.substring(idx + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // ignore
  }
}
