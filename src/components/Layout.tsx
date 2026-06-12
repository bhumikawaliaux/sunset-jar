import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div
      className="relative w-full overflow-hidden flex flex-col"
      style={{ height: '100svh' }}
    >
      {/* Soft sun-warmth in the corner */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-80px',
          right: '-80px',
          width: '260px',
          height: '260px',
          background: 'rgba(255,191,105,0.3)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />
      {/* Mint glow — center left */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '-90px',
          transform: 'translateY(-50%)',
          width: '260px',
          height: '260px',
          background: 'rgba(203,243,240,0.4)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />
      {/* Deep green glow — bottom right (smaller) */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-60px',
          right: '-60px',
          width: '180px',
          height: '180px',
          background: 'rgba(91,180,80,0.4)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />
      <div className="relative z-10 flex-1 min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}

export default Layout;
