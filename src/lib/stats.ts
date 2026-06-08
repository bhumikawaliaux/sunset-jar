import type { Sunset } from '../SunsetContext';

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Sunsets sealed since the first day of the current calendar month. */
export function countThisMonth(sunsets: Sunset[]): number {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return sunsets.filter((s) => s.createdAt >= start.getTime()).length;
}

/**
 * Longest run of consecutive calendar days with at least one sunset,
 * ending today (or yesterday if nothing was sealed today).
 */
export function computeStreak(sunsets: Sunset[]): number {
  if (sunsets.length === 0) return 0;

  const days = new Set(sunsets.map((s) => dayKey(s.createdAt)));

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const todayKey = dayKey(cursor.getTime());
  if (!days.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(dayKey(cursor.getTime()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
