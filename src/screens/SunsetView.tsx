import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useSunset } from '../SunsetContext';

export function SunsetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById } = useSunset();

  const sunset = id ? getById(id) : undefined;

  if (!sunset) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-8"
      >
        <p className="text-[20px] font-semibold text-ghost text-center">
          This jar is empty
        </p>
        <p className="text-fog text-[14px] mt-1 text-center">
          maybe the sunset slipped out
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 text-amber text-[15px] font-semibold underline"
        >
          Back to my jars
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-8"
    >
      <header className="pt-safe pt-5 px-4 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('/')}
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
        <span className="text-[16px] font-semibold text-ghost truncate max-w-[200px]">
          {sunset.place}
        </span>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate(`/sunset/${sunset.id}/edit`)}
          className="w-10 h-10 flex items-center justify-center text-amber"
          aria-label="Edit"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 20l4.3-1L18 9.3l-3.3-3.3L5 15.7 4 20z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path d="M14.5 6.5l3 3" stroke="currentColor" strokeWidth="1.7" />
          </svg>
        </motion.button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mx-4 mt-3 rounded-3xl overflow-hidden shadow-xl"
        style={{
          border: '3px solid #2EC4B6',
          boxShadow: '0 14px 36px rgba(46,196,182,0.25)',
          background: '#FFF',
        }}
      >
        <img
          src={sunset.imageUrl}
          alt={sunset.place}
          className="block w-full h-auto"
          style={{ maxWidth: '100%' }}
        />
      </motion.div>

      <div className="px-5 mt-5">
        {sunset.time && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-[14px]"
          >
            <span className="text-amber font-semibold uppercase tracking-wider text-[11px] mr-2">
              When
            </span>
            <span className="text-ink font-medium">{sunset.time}</span>
          </motion.p>
        )}

        {sunset.note ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="mt-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.7)]"
            style={{ border: '1.2px solid rgba(46,196,182,0.25)' }}
          >
            <p className="text-amber font-semibold uppercase tracking-wider text-[11px] mb-1.5">
              A memory
            </p>
            <p className="text-[15px] text-ink leading-snug">{sunset.note}</p>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => navigate(`/sunset/${sunset.id}/edit`)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="mt-5 w-full p-4 rounded-2xl text-left"
            style={{
              border: '1.2px dashed rgba(46,196,182,0.35)',
              background: 'rgba(255,255,255,0.4)',
            }}
          >
            <p className="text-fog text-[13px] italic">
              No memory written yet — tap to add one
            </p>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default SunsetView;
