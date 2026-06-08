import { useId } from 'react';

interface DripPhotoProps {
  src: string;
  width?: number;
  height?: number;
  /** 0 = drips fully retracted (round blob), 1 = drips fully extended */
  dripExtension?: number;
}

/**
 * The photo clipped to a "liquid drip" silhouette — a rounded blob on top
 * with three teardrop-style drips hanging from underneath. Used as the
 * intermediate shape between the rectangular photo and the jar's interior:
 * the photo "liquefies" before pouring into the jar.
 */
export function DripPhoto({
  src,
  width = 240,
  height = 336,
  dripExtension = 1,
}: DripPhotoProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `dripClip-${uid}`;

  // Drip lengths (max). Extension scales these.
  const leftDripH = 40 * dripExtension;
  const midDripH = 64 * dripExtension;
  const rightDripH = 32 * dripExtension;

  return (
    <svg
      viewBox="0 0 200 280"
      width={width}
      height={height}
      style={{ display: 'block', pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        <clipPath id={clipId}>
          {/* Main blob — slightly squashed ellipse */}
          <ellipse cx="100" cy="62" rx="58" ry="34" />
          {/* Drips hanging from the bottom edge */}
          <rect
            x="64"
            y="80"
            width="16"
            height={leftDripH}
            rx="8"
          />
          <rect
            x="90"
            y="80"
            width="20"
            height={midDripH}
            rx="10"
          />
          <rect
            x="120"
            y="80"
            width="14"
            height={rightDripH}
            rx="7"
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="200" height="280" fill="#1A0A35" />
        <image
          href={src}
          x="20"
          y="20"
          width="160"
          height="200"
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    </svg>
  );
}

export default DripPhoto;
