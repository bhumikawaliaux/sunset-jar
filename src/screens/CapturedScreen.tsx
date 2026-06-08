import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import LiquifyJar from '../components/LiquifyJar';
import Particles from '../components/Particles';
import { useSunset } from '../SunsetContext';

export function CapturedScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getById, sunsets } = useSunset();

  const navState = location.state as { id?: string; animatePour?: boolean } | null;
  const id = navState?.id;
  const sunset = id ? getById(id) : sunsets[0];
  const animatePour = navState?.animatePour ?? false;

  const [done, setDone] = useState<boolean>(!animatePour);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Centered animation area. The wrapping div reserves headroom above
          the jar so the floating pre-pour image (at top: -130) has space to
          show without getting clipped. */}
      <div className="flex-1 flex items-center justify-center overflow-visible">
        <div
          style={{
            position: 'relative',
            paddingTop: 130,
            paddingLeft: 30,    // symmetric headroom so the jar sits centred
            paddingRight: 30,   // (lid sweep extends visibly via overflow:visible)
          }}
        >
          <LiquifyJar
            imageUrl={sunset?.imageUrl ?? null}
            autoStart={animatePour}
            showCaption={!done}
            showCTA={false}
            onComplete={() => setDone(true)}
          />

          {/* Particles overlay — only after the pour completes */}
          {done && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: 0,
                top: 130,
                width: 240,
                height: 310,
                zIndex: 6,
              }}
            >
              <Particles count={28} />
            </div>
          )}
        </div>
      </div>

      {/* Reveal section — only appears once the animation finishes */}
      <AnimatePresence>
        {done && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="shrink-0 flex flex-col items-center px-6 pb-8"
          >
            <h2 className="text-[26px] font-bold text-ghost text-center leading-tight tracking-tight">
              Sunset captured
            </h2>

            {sunset?.place && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.18 }}
                className="text-amber text-[14px] font-semibold mt-1 text-center"
              >
                {sunset.place}
                {sunset.time ? ` · ${sunset.time}` : ''}
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.28 }}
              className="text-fog text-[14px] mt-3 text-center"
            >
              Your golden hour is safe in the jar
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="w-full max-w-[280px] mt-7 flex flex-col gap-3 mx-auto"
            >
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(sunset ? `/sunset/${sunset.id}` : '/')}
                className="w-full h-12 rounded-full bg-amber text-white text-[15px] font-semibold tracking-tight"
                style={{ boxShadow: '0 4px 4px rgba(37,40,43,0.15)' }}
              >
                View my jar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/')}
                className="w-full h-12 rounded-full border border-amber text-amber text-[15px] font-semibold bg-transparent tracking-tight"
              >
                Back to my jars
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CapturedScreen;
