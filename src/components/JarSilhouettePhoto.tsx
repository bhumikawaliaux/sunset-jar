import { useId } from 'react';
import { BODY_RECT } from './JarSVG';

interface JarSilhouettePhotoProps {
  src: string;
  width?: number;
  height?: number;
}

/**
 * Renders a photo clipped to the jar's body silhouette only (no lid, no glass effects).
 * Used during the pour animation when the photo "morphs" into the jar's shape.
 */
export function JarSilhouettePhoto({
  src,
  width = 240,
  height = 336,
}: JarSilhouettePhotoProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `silhouetteClip-${uid}`;

  return (
    <svg
      viewBox="0 0 200 280"
      width={width}
      height={height}
      style={{ display: 'block', pointerEvents: 'none' }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={BODY_RECT.x}
            y={BODY_RECT.y}
            width={BODY_RECT.width}
            height={BODY_RECT.height}
            rx={BODY_RECT.rx}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={BODY_RECT.x}
          y={BODY_RECT.y}
          width={BODY_RECT.width}
          height={BODY_RECT.height}
          fill="#1A0A35"
        />
        <image
          href={src}
          x={BODY_RECT.x}
          y={BODY_RECT.y}
          width={BODY_RECT.width}
          height={BODY_RECT.height}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    </svg>
  );
}

export default JarSilhouettePhoto;
