import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticlesProps {
  count?: number;
  className?: string;
}

const COLORS = ['#FFE000', '#2EC4B6', '#FF6347', '#FFFFFF', '#E8960A'];

export function Particles({ count = 20, className = '' }: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);

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
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (p?: Particle): Particle => {
      const w = canvas.clientWidth;
      const maxLife = 2000 + Math.random() * 2000;
      const base = {
        x: w / 2 + (Math.random() - 0.5) * 30,
        y: canvas.clientHeight * 0.18 + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.25 - Math.random() * 0.4,
        size: 1 + Math.random() * 2.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife,
      };
      if (p) {
        Object.assign(p, base);
        return p;
      }
      return base;
    };

    particlesRef.current = Array.from({ length: count }, () => {
      const p = spawn();
      p.life = Math.random() * p.maxLife;
      return p;
    });

    const drawStar = (x: number, y: number, size: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 3;
      if (size > 2) {
        // Draw 4-point star cross
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.6);
        ctx.lineTo(size * 0.4, -size * 0.4);
        ctx.lineTo(size * 1.6, 0);
        ctx.lineTo(size * 0.4, size * 0.4);
        ctx.lineTo(0, size * 1.6);
        ctx.lineTo(-size * 0.4, size * 0.4);
        ctx.lineTo(-size * 1.6, 0);
        ctx.lineTo(-size * 0.4, -size * 0.4);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const render = (t: number) => {
      const dt = lastTimeRef.current === 0 ? 16 : t - lastTimeRef.current;
      lastTimeRef.current = t;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.life += dt;
        if (p.life >= p.maxLife) {
          spawn(p);
          continue;
        }
        // gentle horizontal wobble
        p.vx += (Math.random() - 0.5) * 0.01;
        p.vx *= 0.99;
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;

        const lifeRatio = p.life / p.maxLife;
        // fade in then out
        const alpha =
          lifeRatio < 0.2
            ? lifeRatio / 0.2
            : 1 - (lifeRatio - 0.2) / 0.8;
        drawStar(p.x, p.y, p.size, p.color, Math.max(0, alpha));
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}

export default Particles;
