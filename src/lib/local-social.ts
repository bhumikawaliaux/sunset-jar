const FOLLOWS_KEY = 'sunset-jar:following';
const SAVED_KEY = 'sunset-jar:saved';
const LIKED_KEY = 'sunset-jar:liked';

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch (err) {
    console.warn(`[social] localStorage save failed (${key})`, err);
  }
}

export function loadLocalFollowing(): Set<string> {
  return loadSet(FOLLOWS_KEY);
}

export function saveLocalFollowing(following: Set<string>): void {
  saveSet(FOLLOWS_KEY, following);
}

export function loadLocalSaved(): Set<string> {
  return loadSet(SAVED_KEY);
}

export function saveLocalSaved(saved: Set<string>): void {
  saveSet(SAVED_KEY, saved);
}

export function loadLocalLiked(): Set<string> {
  return loadSet(LIKED_KEY);
}

export function saveLocalLiked(liked: Set<string>): void {
  saveSet(LIKED_KEY, liked);
}
