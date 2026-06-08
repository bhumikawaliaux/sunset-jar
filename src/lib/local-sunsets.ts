import type { Sunset } from '../SunsetContext';

const STORAGE_KEY = 'sunset-jar:sunsets';

/** Strip transient sync flags before persisting. */
function toPersisted(s: Sunset): Sunset {
  const { syncing, syncError, ...rest } = s;
  return rest;
}

export function loadLocalSunsets(): Sunset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Sunset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSunsets(sunsets: Sunset[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sunsets.map(toPersisted)),
    );
  } catch (err) {
    console.warn('[sunsets] localStorage save failed', err);
  }
}
