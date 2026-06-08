import type { ReactElement } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type TabId = 'home' | 'community' | 'profile';

interface BottomNavProps {
  active: TabId;
}

const TABS: { id: TabId; label: string; path: string; icon: (active: boolean) => ReactElement }[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 11.5L12 4.5L20 11.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"
          stroke={active ? '#2EC4B6' : '#8C7A6B'}
          strokeWidth="1.7"
          strokeLinejoin="round"
          fill={active ? 'rgba(46,196,182,0.15)' : 'none'}
        />
      </svg>
    ),
  },
  {
    id: 'community',
    label: 'Community',
    path: '/community',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke={active ? '#2EC4B6' : '#8C7A6B'} strokeWidth="1.7" />
        <path
          d="M3.5 12h17M12 3.5c2.5 2.7 3.8 5.6 3.8 8.5s-1.3 5.8-3.8 8.5C9.5 17.8 8.2 14.9 8.2 12S9.5 6.2 12 3.5z"
          stroke={active ? '#2EC4B6' : '#8C7A6B'}
          strokeWidth="1.7"
        />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.5" r="3.8" stroke={active ? '#2EC4B6' : '#8C7A6B'} strokeWidth="1.7" />
        <path
          d="M4.5 20c1.2-3.5 4.2-5.5 7.5-5.5s6.3 2 7.5 5.5"
          stroke={active ? '#2EC4B6' : '#8C7A6B'}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate();

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 h-16 bg-void border-t border-dusk flex items-stretch pb-safe z-20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate(tab.path)}
            className="flex-1 relative flex flex-col items-center justify-center gap-1"
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute top-1 w-1.5 h-1.5 rounded-full bg-amber"
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              />
            )}
            {tab.icon(isActive)}
            <span
              className="text-[10px] leading-none font-semibold tracking-wide"
              style={{ color: isActive ? '#2EC4B6' : '#8C7A6B' }}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
