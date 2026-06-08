import type { ReactElement } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { countThisMonth, computeStreak } from '../lib/stats';
import { useSunset } from '../SunsetContext';

interface SettingsRow {
  label: string;
  icon: ReactElement;
  hint?: string;
  destructive?: boolean;
  onClick?: () => void;
}

const baseSettings = (): SettingsRow[] => [
  {
    label: 'Edit profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 20l4.3-1L18 9.3l-3.3-3.3L5 15.7 4 20z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M14.5 6.5l3 3" stroke="currentColor" strokeWidth="1.7"/>
      </svg>
    ),
  },
  {
    label: 'Notifications',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.7"/>
      </svg>
    ),
    hint: 'Sunset alerts on',
  },
  {
    label: 'Saved jars',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 4h12v17l-6-4-6 4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Privacy',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Help & feedback',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/>
        <path d="M10 9c.5-1.5 3-2 4 0s-2 2.5-2 4M12 17v.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const GoogleGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      d="M21.6 12.227c0-.7-.06-1.37-.18-2.014H12v3.81h5.39c-.23 1.24-.94 2.29-2 3v2.49h3.23c1.89-1.74 2.98-4.3 2.98-7.286z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.23-2.49c-.9.6-2.04.95-3.39.95-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0012 22z"
      fill="#34A853"
    />
    <path
      d="M6.4 13.92c-.2-.6-.31-1.24-.31-1.92s.11-1.32.31-1.92V7.49H3.06A10 10 0 002 12c0 1.62.39 3.15 1.06 4.51l3.34-2.59z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.96c1.47 0 2.78.5 3.81 1.5l2.86-2.86C16.96 2.99 14.7 2 12 2A10 10 0 003.06 7.49l3.34 2.59c.79-2.36 3-4.12 5.6-4.12z"
      fill="#EA4335"
    />
  </svg>
);

export function ProfileScreen() {
  const {
    sunsets,
    following,
    saved,
    user,
    authConfigured,
    signInWithGoogle,
    signOut,
  } = useSunset();

  const total = sunsets.length;
  const earliest = sunsets.length
    ? new Date(Math.min(...sunsets.map((s) => s.createdAt)))
    : null;
  const memberSince = earliest
    ? earliest.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    : 'May 2026';

  const thisMonth = countThisMonth(sunsets);
  const longestStreak = computeStreak(sunsets);

  const followingCount = following.size;
  const savedCount = saved.size;

  const displayName = user?.name ?? 'Bhumika Walia';
  const handle = user?.email
    ? '@' + user.email.split('@')[0]
    : '@bhumika';
  const initials = (displayName || 'BW')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const onSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Sign-in failed: ' + String(err));
    }
  };

  // Build settings list — Sign out only shown when actually signed in
  const settings: SettingsRow[] = baseSettings().map((row) =>
    row.label === 'Saved jars' ? { ...row, hint: String(savedCount) } : row,
  );
  if (user) {
    settings.push({
      label: 'Sign out',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H5v14h4M15 8l4 4-4 4M9 12h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      destructive: true,
      onClick: () => signOut(),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0 relative"
    >
      <div className="flex-1 overflow-y-auto pb-20">
        <header className="px-5 pt-safe pt-5 pb-2 flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-amber leading-none tracking-tight">
            Profile
          </h1>
          <button className="text-fog" aria-label="Settings">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.7"/>
              <path d="M19 12a7 7 0 00-.1-1.2l2.1-1.6-2-3.4-2.5.8a7 7 0 00-2.1-1.2l-.4-2.6h-4l-.4 2.6a7 7 0 00-2.1 1.2l-2.5-.8-2 3.4 2.1 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2.1 1.6 2 3.4 2.5-.8a7 7 0 002.1 1.2l.4 2.6h4l.4-2.6a7 7 0 002.1-1.2l2.5.8 2-3.4-2.1-1.6c.1-.4.1-.8.1-1.2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>

        {/* User card */}
        <div className="px-5 mt-2 flex items-center gap-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border-[1.5px] border-amber"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white border-[1.5px] border-amber flex items-center justify-center text-amber text-[20px] font-bold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold text-ghost leading-tight truncate">
              {displayName}
            </p>
            <p className="text-fog text-[12px] leading-none mt-1 truncate">
              {handle} · golden hour collector
            </p>
            <p className="text-fog text-[11px] leading-none mt-1.5">
              {user ? `Member since ${memberSince}` : 'Local jars only'}
            </p>
          </div>
        </div>

        {/* Sign-in CTA (only if Supabase is configured + user not signed in) */}
        {authConfigured && !user && (
          <div className="px-4 mt-4">
            <div
              className="rounded-2xl bg-white p-4 flex items-center gap-3"
              style={{
                border: '1.5px solid rgba(46,196,182,0.18)',
                boxShadow: '0 6px 16px rgba(46,196,182,0.07)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-ghost tracking-tight">
                  Back up your jars
                </p>
                <p className="text-fog text-[12px] mt-0.5 leading-snug">
                  Sign in to keep your sunsets safe across devices.
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onSignIn}
                className="h-10 px-3.5 rounded-full bg-white flex items-center gap-2 text-[13px] font-semibold text-ghost shrink-0"
                style={{ border: '1px solid rgba(0,0,0,0.12)' }}
              >
                <GoogleGlyph />
                Google
              </motion.button>
            </div>
          </div>
        )}

        {!authConfigured && (
          <div className="px-4 mt-4">
            <div
              className="rounded-2xl p-3 text-[12px] text-fog"
              style={{
                border: '1.5px dashed rgba(46,196,182,0.32)',
                background: 'rgba(255,255,255,0.45)',
              }}
            >
              <span className="font-semibold text-ghost">Local mode.</span>{' '}
              Add Supabase env vars to enable cloud backup. See{' '}
              <code className="text-amber font-semibold">SUPABASE.md</code>.
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="px-4 mt-4 grid grid-cols-4 gap-2">
          <Stat label="Sunsets" value={total} />
          <Stat label="This month" value={thisMonth} />
          <Stat label="Following" value={followingCount} />
          <Stat label="Streak" value={`${longestStreak}d`} />
        </div>

        {/* Settings */}
        <section className="px-4 mt-6">
          <h2 className="text-[14px] font-bold text-ghost tracking-tight px-1 mb-2">
            Settings
          </h2>
          <div
            className="rounded-2xl bg-white overflow-hidden"
            style={{
              border: '1.5px solid rgba(46,196,182,0.14)',
              boxShadow: '0 4px 14px rgba(46,196,182,0.05)',
            }}
          >
            {settings.map((row, i) => (
              <button
                key={row.label}
                onClick={row.onClick}
                className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-[rgba(46,196,182,0.04)]"
                style={{
                  borderTop: i === 0 ? 'none' : '1px solid rgba(46,196,182,0.10)',
                  color: row.destructive ? '#2EC4B6' : '#2A1810',
                }}
              >
                <span
                  style={{
                    color: row.destructive ? '#2EC4B6' : '#8C7A6B',
                    display: 'inline-flex',
                  }}
                >
                  {row.icon}
                </span>
                <span className="text-[14px] font-medium flex-1">
                  {row.label}
                </span>
                {row.hint && (
                  <span className="text-fog text-[12px]">{row.hint}</span>
                )}
                {!row.destructive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="#A89485"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>

      <BottomNav active="profile" />
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-2xl bg-white p-2.5 text-center"
      style={{
        border: '1.5px solid rgba(46,196,182,0.14)',
        boxShadow: '0 4px 12px rgba(46,196,182,0.05)',
      }}
    >
      <p className="text-[18px] font-bold text-amber leading-none tracking-tight">
        {value}
      </p>
      <p className="text-fog text-[10px] mt-1 leading-none">{label}</p>
    </div>
  );
}

export default ProfileScreen;
