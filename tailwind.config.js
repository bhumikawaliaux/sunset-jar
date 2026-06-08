/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light mode — warm paper / dawn palette
        night: '#FFFFFF',   // page background — warm cream
        void: '#FFFFFF',    // card / surface background
        dusk: '#F0E2C8',    // soft tan border / elevated surface
        amber: '#2EC4B6',
        gold: '#E8960A',
        sun: '#FFE000',
        blush: '#FF6347',
        fog: '#8C7A6B',     // secondary text — warm muted brown
        ghost: '#2A1810',   // primary text — dark warm brown
        upload: '#2563EB',
        ink: '#3D2817',
      },
      fontFamily: {
        serif: ['"Figtree"', 'system-ui', 'sans-serif'],
        sans: ['"Figtree"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
