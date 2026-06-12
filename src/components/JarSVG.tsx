import { useId } from 'react';
import { motion } from 'framer-motion';
import type { Palette } from '../palettes';
import { DEFAULT_PALETTE } from '../palettes';

type Size = 'sm' | 'md' | 'lg';

interface JarSVGProps {
  size?: Size;
  imageSrc?: string;
  palette?: Palette;
  glow?: number;
  /** Vertical offset of the lid in SVG units (negative = up). 0 = closed. */
  lidOffsetY?: number;
  /** Rotation of the lid in degrees, pivot around its top-right corner. */
  lidRotation?: number;
  /** 0 = empty jar, 1 = fully filled. Defaults to 1. */
  fillProgress?: number;
  /** Animation duration for fill mask, in seconds. */
  fillDuration?: number;
  /** Renders a + icon at the center of the jar body. */
  showPlusIcon?: boolean;
  /** Skip rendering inside content entirely (used for showing only the empty jar). */
  hideContents?: boolean;
}

const SIZE_MAP: Record<Size, { w: number; h: number }> = {
  sm: { w: 110, h: 154 },
  md: { w: 180, h: 252 },
  lg: { w: 240, h: 336 },
};

// Jar body geometry (used in many places — exported so other components can mirror the shape)
export const BODY_RECT = { x: 22, y: 64, width: 156, height: 198, rx: 18 };
export const LID_RECT = { x: 48, y: 22, width: 104, height: 42, rx: 6 };

// Mason-jar silhouette in SVG viewBox units (200×280). Starts right below the
// lid at y=64 and extends to y=280. Same shape as LiquifyJar, fit into the
// remaining 200×216 area under the lid.
const SILHOUETTE_PATH =
  'M 64 64 L 136 64 Q 140 64 142 68.9 C 144 86.9, 186 96.7, 200 119.6 L 200 234 C 200 263.5, 178 280, 138 280 L 62 280 C 22 280, 0 263.5, 0 234 L 0 119.6 C 14 96.7, 56 86.9, 58 68.9 Q 60 64 64 64 Z';

// Build the same path for the HTML photo overlay, scaled to its pixel box
// (overlay is `dims.w × (216/280)*dims.h` pixels, so paths scale uniformly).
function silhouetteCssClip(width: number, height: number): string {
  const sx = width / 200;
  const sy = height / 216;
  const p = (x: number, y: number) =>
    `${(x * sx).toFixed(2)} ${((y - 64) * sy).toFixed(2)}`;
  return `path("M ${p(64,64)} L ${p(136,64)} Q ${p(140,64)} ${p(142,68.9)} ` +
    `C ${p(144,86.9)}, ${p(186,96.7)}, ${p(200,119.6)} ` +
    `L ${p(200,234)} C ${p(200,263.5)}, ${p(178,280)}, ${p(138,280)} ` +
    `L ${p(62,280)} C ${p(22,280)}, ${p(0,263.5)}, ${p(0,234)} ` +
    `L ${p(0,119.6)} C ${p(14,96.7)}, ${p(56,86.9)}, ${p(58,68.9)} ` +
    `Q ${p(60,64)} ${p(64,64)} Z")`;
}

export function JarSVG({
  size = 'md',
  imageSrc,
  palette = DEFAULT_PALETTE,
  glow = 0.15,
  lidOffsetY = 0,
  lidRotation = 0,
  fillProgress = 1,
  fillDuration = 0,
  showPlusIcon = false,
  hideContents = false,
}: JarSVGProps) {
  const uid = useId().replace(/:/g, '');
  const dims = SIZE_MAP[size];
  const clipId = `jarClip-${uid}`;
  const fillMaskId = `fillMask-${uid}`;
  const skyId = `sky-${uid}`;
  const sunId = `sun-${uid}`;
  const horizonId = `horizon-${uid}`;
  const waterId = `water-${uid}`;
  const blurId = `blur-${uid}`;

  const isEmpty = hideContents || (!imageSrc && showPlusIcon);
  const showInside = !isEmpty && fillProgress > 0;

  // Centers
  const cx = BODY_RECT.x + BODY_RECT.width / 2;       // 100
  const cy = BODY_RECT.y + BODY_RECT.height / 2;      // 163

  return (
    <div
      className="relative"
      style={{ width: dims.w, height: dims.h }}
      aria-hidden="true"
    >
      {/* Ambient glow behind jar */}
      <svg
        viewBox="0 0 200 280"
        className="absolute inset-0"
        width={dims.w}
        height={dims.h}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
        </defs>
        <ellipse
          cx={cx}
          cy={cy}
          rx={80}
          ry={60}
          fill="#2EC4B6"
          opacity={glow}
          filter={`url(#${blurId})`}
        />
      </svg>

      {/* HTML photo overlay — rendered as a regular <img>, clipped to the
          mason-jar silhouette so it matches the captured-screen jar. */}
      {imageSrc && !hideContents && fillProgress > 0 && (() => {
        const overlayW = dims.w;
        const overlayH = (216 / 280) * dims.h;
        const clip = silhouetteCssClip(overlayW, overlayH);
        return (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: (64 / 280) * dims.h,
              width: overlayW,
              height: overlayH,
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 1,
              clipPath: clip,
              WebkitClipPath: clip,
            }}
          >
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        );
      })()}

      {/* The jar itself */}
      <svg
        viewBox="0 0 200 280"
        className="absolute inset-0"
        width={dims.w}
        height={dims.h}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={SILHOUETTE_PATH} />
          </clipPath>

          <mask id={fillMaskId}>
            <rect x="0" y="0" width="200" height="280" fill="black" />
            <motion.rect
              x="0"
              width="200"
              fill="white"
              initial={false}
              animate={{
                y: 280 - 280 * fillProgress,
                height: 280 * fillProgress,
              }}
              transition={{ duration: fillDuration, ease: 'easeOut' }}
            />
          </mask>

          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.skyTop} />
            <stop offset="55%" stopColor={palette.mid} />
            <stop offset="80%" stopColor={palette.horizon} />
            <stop offset="100%" stopColor={palette.sun} />
          </linearGradient>

          <radialGradient id={sunId} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFFCE0" stopOpacity="1" />
            <stop offset="35%" stopColor={palette.sun} stopOpacity="0.95" />
            <stop offset="70%" stopColor={palette.horizon} stopOpacity="0.4" />
            <stop offset="100%" stopColor={palette.horizon} stopOpacity="0" />
          </radialGradient>

          <linearGradient id={horizonId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.sun} stopOpacity="0.9" />
            <stop offset="100%" stopColor={palette.sun} stopOpacity="0" />
          </linearGradient>

          <linearGradient id={waterId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.horizon} stopOpacity="0.55" />
            <stop offset="60%" stopColor="#1A0830" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#08021E" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Glass body wash — uses the mason-jar silhouette */}
        <path d={SILHOUETTE_PATH} fill="rgba(255,255,255,0.55)" />

        {/* Inside content, clipped to body, masked by fill */}
        {showInside && (
          <g clipPath={`url(#${clipId})`}>
            <g mask={`url(#${fillMaskId})`}>
              {imageSrc ? (
                <rect
                  x={BODY_RECT.x}
                  y={BODY_RECT.y}
                  width={BODY_RECT.width}
                  height={BODY_RECT.height}
                  fill="transparent"
                />
              ) : (
                <>
                  <rect
                    x={BODY_RECT.x}
                    y={BODY_RECT.y}
                    width={BODY_RECT.width}
                    height={BODY_RECT.height}
                    fill={`url(#${skyId})`}
                  />
                  <rect x="0" y="216" width="200" height="60" fill={`url(#${waterId})`} />
                  <ellipse cx="100" cy="240" rx="14" ry="22" fill={palette.sun} opacity="0.45" />
                  <ellipse cx="100" cy="250" rx="6" ry="10" fill={palette.sun} opacity="0.55" />
                  <ellipse cx="100" cy="216" rx="80" ry="3" fill={`url(#${horizonId})`} />
                  <circle cx="100" cy="200" r="34" fill={`url(#${sunId})`} />
                  <circle cx="100" cy="200" r="12" fill="#FFFBE6" opacity="0.95" />
                </>
              )}
            </g>
          </g>
        )}

        {/* Plus icon in the center of the empty jar */}
        {showPlusIcon && (
          <g>
            <circle cx={cx} cy={cy} r="18" fill="#2EC4B6" />
            <path
              d={`M${cx},${cy - 9} L${cx},${cy + 9} M${cx - 9},${cy} L${cx + 9},${cy}`}
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Glass highlights — left edge */}
        <g clipPath={`url(#${clipId})`}>
          <rect
            x={BODY_RECT.x + 6}
            y={BODY_RECT.y + 12}
            width="6"
            height={BODY_RECT.height - 36}
            rx="3"
            fill="#FFFFFF"
            opacity="0.45"
          />
          <rect
            x={BODY_RECT.x + 16}
            y={BODY_RECT.y + 14}
            width="2"
            height={BODY_RECT.height - 60}
            rx="1"
            fill="#FFFFFF"
            opacity="0.25"
          />
        </g>

        {/* Body outline — mason-jar silhouette */}
        <path
          d={SILHOUETTE_PATH}
          fill="none"
          stroke="rgba(61,40,23,0.45)"
          strokeWidth="1.6"
        />

        {/* Lid — animatable group, pivots around its bottom-left corner */}
        <motion.g
          initial={false}
          animate={{ y: lidOffsetY, rotate: lidRotation }}
          transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.6 }}
          style={{
            transformOrigin: `${LID_RECT.x}px ${LID_RECT.y + LID_RECT.height}px`,
            transformBox: 'view-box' as const,
          }}
        >
          <rect
            x={LID_RECT.x}
            y={LID_RECT.y}
            width={LID_RECT.width}
            height={LID_RECT.height}
            rx={LID_RECT.rx}
            fill="#7A3F12"
          />
          {/* lid top sheen */}
          <rect
            x={LID_RECT.x + 4}
            y={LID_RECT.y + 3}
            width={LID_RECT.width - 8}
            height="4"
            rx="2"
            fill="#C68043"
            opacity="0.65"
          />
          {/* lid threads */}
          <line
            x1={LID_RECT.x + 6}
            y1={LID_RECT.y + LID_RECT.height - 12}
            x2={LID_RECT.x + LID_RECT.width - 6}
            y2={LID_RECT.y + LID_RECT.height - 12}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="0.8"
          />
          {/* lid outline */}
          <rect
            x={LID_RECT.x}
            y={LID_RECT.y}
            width={LID_RECT.width}
            height={LID_RECT.height}
            rx={LID_RECT.rx}
            fill="none"
            stroke="rgba(61,40,23,0.55)"
            strokeWidth="1.4"
          />
        </motion.g>
      </svg>
    </div>
  );
}

export default JarSVG;
