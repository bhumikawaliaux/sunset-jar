import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw } from 'lucide-react';

type Phase =
  | 'idle'
  | 'opening'
  | 'liquifying'
  | 'pouring'
  | 'settling'
  | 'closing'
  | 'done';

// Jar geometry (px)
// Slim brown neck sits below the lid; body's rounded top corners flare out
// from under the neck to form the shoulders.
// Body container's full silhouette is drawn with a CSS clip-path (mason-jar shape).
// Geometry is in the body container's own px coordinates (200 × 264).
const bX = 20, bY = 26, bW = 200, bH = 264;
// Lid overhangs the neck on each side; matches reference photo's silver lid.
const lX = 60, lY = 0, lW = 120, lH = 26;

// Mason-jar silhouette: narrow neck (x=60-140) at top, smooth shoulder curve
// flaring out to body width (x=0-200), straight sides, slightly rounded base.
const JAR_CLIP_PATH =
  'path("M 64 0 L 136 0 Q 140 0 142 6 C 144 28, 186 40, 200 68 L 200 208 C 200 244, 178 264, 138 264 L 62 264 C 22 264, 0 244, 0 208 L 0 68 C 14 40, 56 28, 58 6 Q 60 0 64 0 Z")';

interface LiquifyJarProps {
  /** When non-null, the sequence runs end-to-end on mount. */
  imageUrl: string | null;
  /** Fired once the jar reaches the `done` phase. */
  onComplete?: () => void;
  /** Optional: tap the +/reset CTA — defaults to a no-op. */
  onAdd?: () => void;
  onReset?: () => void;
  /** Background color used to mask the shoulder gap between neck and body. */
  background?: string;
  /** When true and `imageUrl` is set, the sequence auto-starts on mount. */
  autoStart?: boolean;
  /** Show the status caption under the jar. */
  showCaption?: boolean;
  /** Show the +/reset CTA inside the jar. Default true (standalone demo); pass false to hide. */
  showCTA?: boolean;
}

export default function LiquifyJar({
  imageUrl: incomingImage,
  onComplete,
  onAdd,
  onReset,
  background: _background = '#FFFFFF',
  autoStart = true,
  showCaption = true,
  showCTA = true,
}: LiquifyJarProps) {
  const [phase, setPhase] = useState<Phase>(incomingImage && autoStart ? 'opening' : 'idle');
  const [imageUrl, setImageUrl] = useState<string | null>(incomingImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** Keep the latest onComplete reachable from inside the (stable) sequence. */
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const filterId = useRef(`jar-lq-${Math.random().toString(36).slice(2, 8)}`);
  const turbId = useRef(`jar-turb-${Math.random().toString(36).slice(2, 8)}`);
  const dispId = useRef(`jar-disp-${Math.random().toString(36).slice(2, 8)}`);

  const animateTurbulence = useCallback((mode: 'liquifying' | 'pouring') => {
    cancelAnimationFrame(rafRef.current);
    const dur = mode === 'liquifying' ? 1100 : 1100;
    let t0: number | null = null;
    const tick = (now: number) => {
      if (t0 === null) t0 = now;
      const p = Math.min((now - t0) / dur, 1);
      const scale =
        mode === 'liquifying'
          ? p * 78
          : (1 - Math.max(0, (p - 0.6) / 0.4)) * 78;

      // Animate baseFrequency every frame for flowing liquid motion
      const t = now * 0.001;
      const fX = 0.009 + Math.sin(t * 1.4) * 0.0025;
      const fY = 0.007 + Math.sin(t * 1.1 + 0.8) * 0.002;
      document.getElementById(turbId.current)?.setAttribute('baseFrequency', `${fX} ${fY}`);
      document.getElementById(dispId.current)?.setAttribute('scale', String(scale));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startSequence = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    cancelAnimationFrame(rafRef.current);
    document.getElementById(dispId.current)?.setAttribute('scale', '0');

    const after = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    setPhase('opening');
    after(() => { setPhase('liquifying'); animateTurbulence('liquifying'); }, 500);
    after(() => { setPhase('pouring'); animateTurbulence('pouring'); }, 1600);
    after(() => setPhase('settling'), 2700);
    after(() => setPhase('closing'), 3200);
    after(() => {
      setPhase('done');
      onCompleteRef.current?.();
    }, 4000);
  }, [animateTurbulence]);

  // Auto-run when an image is provided. Deps are stable across parent
  // re-renders (we don't include `onComplete` here — see `onCompleteRef`).
  // The cleanup cancels any pending timers + RAF, so:
  //   • React StrictMode's dev-mode "cleanup-then-resetup" works naturally —
  //     the second setup just schedules a fresh sequence.
  //   • A real unmount cancels everything.
  //   • Parent re-renders (e.g. onComplete changing) don't re-fire this
  //     effect because its deps haven't changed.
  useEffect(() => {
    setImageUrl(incomingImage);
    if (incomingImage && autoStart) {
      startSequence();
    }
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingImage, autoStart]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    startSequence();
    e.target.value = '';
  };

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    cancelAnimationFrame(rafRef.current);
    document.getElementById(dispId.current)?.setAttribute('scale', '0');
    setPhase('idle');
    setImageUrl(null);
    onReset?.();
  };

  const lidUp = ['opening', 'liquifying', 'pouring', 'settling'].includes(phase);
  const showFloat = phase === 'liquifying' || phase === 'pouring';
  const jarFilled = ['pouring', 'settling', 'closing', 'done'].includes(phase);

  const label =
    phase === 'idle'       ? 'add an image'   :
    phase === 'liquifying' ? 'liquifying...'  :
    phase === 'pouring'    ? 'pouring...'     :
    phase === 'settling'   ? 'settling...'    :
    phase === 'closing'    ? 'sealing...'     :
    phase === 'done'       ? 'bottled  ✦'     : ' ';

  return (
    <div className="size-full flex flex-col items-center justify-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* SVG turbulence filter */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <filter id={filterId.current} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feTurbulence
              id={turbId.current}
              type="fractalNoise"
              baseFrequency="0.009 0.007"
              numOctaves={4}
              seed={11}
              result="turb"
            />
            <feDisplacementMap
              id={dispId.current}
              in="SourceGraphic"
              in2="turb"
              scale={0}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Jar assembly */}
      <div style={{ position: 'relative', width: 240, height: 310, overflow: 'visible' }}>

        {/* ── Floating pre-pour image ── */}
        <AnimatePresence>
          {imageUrl && showFloat && (
            <motion.div
              key="float"
              style={{
                position: 'absolute',
                left: bX,
                top: -130,
                width: bW,
                height: 120,
                borderRadius: 16,
                overflow: 'hidden',
                filter: `url(#${filterId.current})`,
                transformOrigin: 'top center',
                zIndex: 5,
              }}
              initial={{ opacity: 0, y: 0, scaleX: 1 }}
              animate={{
                opacity: phase === 'pouring' ? 0 : 1,
                y:      phase === 'pouring' ? 130 : 0,
                scaleX: phase === 'pouring' ? 0.4 : 1,
              }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{
                opacity: { duration: 0.7,  ease: 'easeIn' },
                y:       { duration: 1.1,  ease: [0.4, 0.14, 0.3, 1] },
                scaleX:  { duration: 1.1,  ease: [0.4, 0.14, 0.3, 1] },
              }}
            >
              <img
                src={imageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Lid ── */}
        <motion.div
          style={{
            position: 'absolute',
            left: lX, top: lY, width: lW, height: lH,
            zIndex: 30,
            borderRadius: '7px 7px 3px 3px',
            background: 'linear-gradient(118deg, #9C6316 0%, #4F2D07 100%)',
            boxShadow: '0 3px 12px rgba(0,0,0,0.32), inset 0 1.5px 0 rgba(255,200,110,0.2)',
          }}
          animate={{
            x:      lidUp ? 118 : 0,
            y:      lidUp ? -16 : 0,
            rotate: lidUp ?  22 : 0,
          }}
          transition={{
            x:      { duration: lidUp ? 0.52 : 0.78, ease: lidUp ? [0.34, 1.56, 0.64, 1] : [0.22, 1, 0.36, 1] },
            y:      { duration: lidUp ? 0.52 : 0.78, ease: lidUp ? [0.34, 1.56, 0.64, 1] : [0.22, 1, 0.36, 1] },
            rotate: { duration: lidUp ? 0.52 : 0.78, ease: 'easeInOut' },
          }}
        />

        {/* ── Jar body silhouette (mason-jar shape via clip-path) ── */}
        <div
          style={{
            position: 'absolute',
            left: bX, top: bY, width: bW, height: bH,
            zIndex: 10,
            clipPath: JAR_CLIP_PATH,
            WebkitClipPath: JAR_CLIP_PATH,
          }}
        >
          {/* Image layer — clipped to body shape, reveals top→bottom */}
          <div
            style={{
              position: 'absolute', inset: 0,
              overflow: 'hidden',
            }}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Image inside jar"
                draggable={false}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  clipPath: jarFilled
                    ? 'inset(0% 0% 0% 0%)'
                    : 'inset(0% 0% 100% 0%)',
                  transition: 'clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                  WebkitTransition:
                    '-webkit-clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1), clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                  WebkitClipPath: jarFilled
                    ? 'inset(0% 0% 0% 0%)'
                    : 'inset(0% 0% 100% 0%)',
                }}
              />
            )}
          </div>

          {/* Glass overlay — subtle wash so the photo stays readable */}
          <div
            style={{
              position: 'absolute', inset: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.08) 100%)',
            }}
          />

          {/* Outline (just inside the silhouette edge) */}
          <div
            style={{
              position: 'absolute', inset: 0,
              pointerEvents: 'none',
              border: '1.5px solid rgba(255,255,255,0.72)',
              clipPath: JAR_CLIP_PATH,
              WebkitClipPath: JAR_CLIP_PATH,
            }}
          />

          {/* Specular highlight — left edge */}
          <div
            style={{
              position: 'absolute', left: 14, top: 22,
              width: 5, height: '46%',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.55)',
              filter: 'blur(2.5px)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Bottom inner shadow */}
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 50,
              background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.05))',
              pointerEvents: 'none',
            }}
          />

          {/* CTA button */}
          <AnimatePresence mode="wait">
            {showCTA && (phase === 'idle' || phase === 'done') && (
              <motion.button
                key={phase}
                style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  marginLeft: -24, marginTop: -24,
                  width: 48, height: 48,
                  borderRadius: '50%',
                  background: '#D4904C',
                  boxShadow: '0 5px 18px rgba(212,144,76,0.45)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 20,
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                onClick={
                  phase === 'idle'
                    ? () => (onAdd ? onAdd() : fileInputRef.current?.click())
                    : reset
                }
              >
                {phase === 'idle'
                  ? <Plus size={22} color="white" strokeWidth={2.5} />
                  : <RotateCcw size={18} color="white" strokeWidth={2.5} />
                }
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status label */}
      {showCaption && (
        <p
          style={{
            marginTop: 32,
            fontFamily: "'Figtree', system-ui, sans-serif",
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#a08870',
            minHeight: 18,
            userSelect: 'none',
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
