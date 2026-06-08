import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { getCommunityById } from '../community';
import { useSunset } from '../SunsetContext';

function timeAgo(days: number) {
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function CommunitySunsetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sunset = id ? getCommunityById(id) : undefined;
  const { isFollowing, toggleFollow, isSaved, toggleSaved } = useSunset();

  if (!sunset) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-8"
      >
        <p className="text-[18px] font-bold text-ghost text-center">
          We couldn't find that sunset
        </p>
        <button
          onClick={() => navigate('/community')}
          className="mt-4 text-amber text-[15px] font-semibold underline"
        >
          Back to community
        </button>
      </motion.div>
    );
  }

  const followingThem = isFollowing(sunset.user);
  const postSaved = isSaved(sunset.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-6"
    >
      <header className="pt-safe pt-5 px-4 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('/community')}
          className="w-10 h-10 flex items-center justify-center text-ghost"
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => toggleSaved(sunset.id)}
          className="w-10 h-10 flex items-center justify-center"
          aria-label="Save"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={postSaved ? '#2EC4B6' : 'none'}
            stroke={postSaved ? '#2EC4B6' : '#2A1810'}
            strokeWidth="1.7"
          >
            <path d="M6 4h12v17l-6-4-6 4z" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </header>

      {/* User strip */}
      <div className="px-5 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full bg-amber/10 border border-amber flex items-center justify-center text-amber text-[12px] font-semibold">
          {sunset.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-ghost leading-none truncate">
            {sunset.displayName}
            <span className="ml-1.5 text-fog font-normal">@{sunset.user}</span>
          </p>
          <p className="text-[11px] text-fog mt-1 leading-none truncate">
            {sunset.place} · {timeAgo(sunset.daysAgo)} · {sunset.time}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => toggleFollow(sunset.user)}
          className="px-3.5 h-8 rounded-full text-[12px] font-semibold tracking-tight"
          style={{
            background: followingThem ? 'transparent' : '#2EC4B6',
            color: followingThem ? '#2EC4B6' : 'white',
            border: '1px solid #2EC4B6',
          }}
        >
          {followingThem ? 'Following' : 'Follow'}
        </motion.button>
      </div>

      {/* Full image at original aspect ratio */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mx-4 mt-4 rounded-3xl overflow-hidden shadow-xl"
        style={{
          border: '3px solid #2EC4B6',
          boxShadow: '0 14px 36px rgba(46,196,182,0.25)',
          background: '#FFF',
        }}
      >
        <img
          src={sunset.imageUrl.replace(/w=\d+/, 'w=1200')}
          alt={sunset.place}
          className="block w-full h-auto"
          style={{ maxWidth: '100%' }}
        />
      </motion.div>

      {/* Memory */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mx-5 mt-5 p-4 rounded-2xl bg-[rgba(255,255,255,0.7)]"
        style={{ border: '1.2px solid rgba(46,196,182,0.25)' }}
      >
        <p className="text-amber font-semibold uppercase tracking-wider text-[11px] mb-1.5">
          A memory
        </p>
        <p className="text-[15px] text-ink leading-snug">{sunset.note}</p>
      </motion.div>

      {/* Likes count */}
      <p className="px-5 mt-4 text-fog text-[12px] font-medium">
        {sunset.likes} people kept this in their jar
      </p>
    </motion.div>
  );
}

export default CommunitySunsetView;
