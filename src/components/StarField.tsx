import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  phase: number;
  speed: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      const w = clientWidth;
      const h = clientHeight;
      starsRef.current = Array.from({ length: 80 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.3 + Math.random() * 1.2,
        baseOpacity: 0.05 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0008 + Math.random() * 0.0015,
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const s of starsRef.current) {
        const pulse = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const opacity = s.baseOpacity * (0.4 + pulse * 0.6);
        ctx.beginPath();
        ctx.fillStyle = `rgba(245,240,255,${opacity})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

export default StarField;
