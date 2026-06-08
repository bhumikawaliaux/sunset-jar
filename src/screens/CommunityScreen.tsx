import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import JarSVG from '../components/JarSVG';
import BottomNav from '../components/BottomNav';
import { COMMUNITY_SUNSETS } from '../community';
import type { CommunitySunset } from '../community';
import { DEFAULT_PALETTE } from '../palettes';
import { useSunset } from '../SunsetContext';

const FILTERS = ['Recent', 'Nearby', 'Following'] as const;
type Filter = (typeof FILTERS)[number];

function timeAgo(days: number) {
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function CommunityScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('Recent');
  const { isFollowing, toggleFollow, isSaved, toggleSaved, isLiked, toggleLike, following } =
    useSunset();

  const visible = useMemo<CommunitySunset[]>(() => {
    if (filter === 'Recent') {
      return [...COMMUNITY_SUNSETS].sort((a, b) => a.daysAgo - b.daysAgo);
    }
    if (filter === 'Nearby') {
      return COMMUNITY_SUNSETS.filter((s) => s.isNearby);
    }
    // Following
    return COMMUNITY_SUNSETS.filter((s) => isFollowing(s.user));
  }, [filter, isFollowing, following]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0 relative"
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <header className="px-5 pt-safe pt-5 pb-2">
          <h1 className="text-[22px] font-bold text-amber leading-none tracking-tight">
            Community
          </h1>
          <p className="text-fog text-[13px] mt-1">
            365 sunsets sealed this week
          </p>
        </header>

        {/* Filter pills */}
        <div className="px-5 mt-3 flex gap-2 sticky top-0 z-10 py-2 bg-gradient-to-b from-[#FFFFFF] to-transparent">
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold tracking-tight transition-colors"
                style={{
                  background: active ? '#2EC4B6' : 'rgba(255,255,255,0.78)',
                  color: active ? 'white' : '#8C7A6B',
                  border: active
                    ? '1px solid #2EC4B6'
                    : '1px solid rgba(46,196,182,0.22)',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Feed (or empty state) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 mt-3 flex flex-col gap-4"
          >
            {visible.length === 0 ? (
              <EmptyState filter={filter} onDiscover={() => setFilter('Recent')} />
            ) : (
              visible.map((s) => {
                const followingThem = isFollowing(s.user);
                const isPostLiked = isLiked(s.id);
                const isPostSaved = isSaved(s.id);
                return (
                  <article
                    key={s.id}
                    className="rounded-2xl bg-white p-3"
                    style={{
                      border: '1.5px solid rgba(46,196,182,0.16)',
                      boxShadow: '0 6px 16px rgba(46,196,182,0.06)',
                    }}
                  >
                    {/* Header row */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-amber/10 border border-amber flex items-center justify-center text-amber text-[11px] font-semibold">
                        {s.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-ghost leading-none truncate">
                          {s.displayName}
                          <span className="ml-1.5 text-fog font-normal">
                            @{s.user}
                          </span>
                        </p>
                        <p className="text-[11px] text-fog mt-1 leading-none truncate">
                          {s.place} · {timeAgo(s.daysAgo)}
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => toggleFollow(s.user)}
                        className="px-3 h-7 rounded-full text-[11px] font-semibold tracking-tight transition-colors"
                        style={{
                          background: followingThem ? 'transparent' : '#2EC4B6',
                          color: followingThem ? '#2EC4B6' : 'white',
                          border: '1px solid #2EC4B6',
                        }}
                      >
                        {followingThem ? 'Following' : 'Follow'}
                      </motion.button>
                    </div>

                    {/* Jar — tappable to view full image */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/community/${s.id}`)}
                      className="flex justify-center w-full my-2 bg-transparent border-none"
                      aria-label={`View ${s.displayName}'s sunset`}
                    >
                      <JarSVG
                        size="sm"
                        imageSrc={s.imageUrl}
                        palette={DEFAULT_PALETTE}
                      />
                    </motion.button>

                    {/* Memory snippet */}
                    <p className="text-[13px] text-ink leading-snug mt-1 px-1">
                      <span className="font-semibold text-amber mr-1.5 text-[11px] uppercase tracking-wider">
                        Memory
                      </span>
                      {s.note}
                    </p>

                    {/* Action row — like + save only */}
                    <div className="flex items-center gap-5 mt-3 px-1">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => toggleLike(s.id)}
                        className="flex items-center gap-1.5"
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill={isPostLiked ? '#2EC4B6' : 'none'}
                          stroke={isPostLiked ? '#2EC4B6' : '#8C7A6B'}
                          strokeWidth="1.7"
                        >
                          <path
                            d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1.2 4.5 2.5C12 6.2 13.5 5 15.5 5 19.5 5 21 9 19.5 12c-2.5 4.5-9.5 9-9.5 9z"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          className="text-[12px] font-semibold"
                          style={{ color: isPostLiked ? '#2EC4B6' : '#8C7A6B' }}
                        >
                          {s.likes + (isPostLiked ? 1 : 0)}
                        </span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => toggleSaved(s.id)}
                        className="ml-auto flex items-center"
                        aria-label="Save"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={isPostSaved ? '#2EC4B6' : 'none'}
                          stroke={isPostSaved ? '#2EC4B6' : '#8C7A6B'}
                          strokeWidth="1.7"
                        >
                          <path d="M6 4h12v17l-6-4-6 4z" strokeLinejoin="round" />
                        </svg>
                      </motion.button>
                    </div>
                  </article>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav active="community" />
    </motion.div>
  );
}

function EmptyState({
  filter,
  onDiscover,
}: {
  filter: Filter;
  onDiscover: () => void;
}) {
  if (filter === 'Following') {
    return (
      <div
        className="rounded-2xl bg-white p-6 text-center mt-2"
        style={{
          border: '1.5px dashed rgba(46,196,182,0.35)',
          background: 'rgba(255,255,255,0.55)',
        }}
      >
        <p className="text-[16px] font-bold text-ghost tracking-tight">
          Your following feed is empty
        </p>
        <p className="text-fog text-[13px] mt-1.5 max-w-[260px] mx-auto">
          Follow other sunset collectors to see their golden hours here.
        </p>
        <button
          onClick={onDiscover}
          className="mt-4 h-10 px-5 rounded-full bg-amber text-white text-[13px] font-semibold"
          style={{ boxShadow: '0 4px 4px rgba(37,40,43,0.15)' }}
        >
          Discover people
        </button>
      </div>
    );
  }
  if (filter === 'Nearby') {
    return (
      <div
        className="rounded-2xl bg-white p-6 text-center mt-2"
        style={{ border: '1.5px dashed rgba(46,196,182,0.35)' }}
      >
        <p className="text-[16px] font-bold text-ghost tracking-tight">
          No sunsets near you yet
        </p>
        <p className="text-fog text-[13px] mt-1.5 max-w-[260px] mx-auto">
          Be the first to seal a sunset in your area.
        </p>
      </div>
    );
  }
  return null;
}

export default CommunityScreen;
