export type Palette = {
  id: string;
  skyTop: string;
  mid: string;
  horizon: string;
  sun: string;
  label: string;
};

export const PALETTES: Palette[] = [
  { id: 'goa',       skyTop: '#14033A', mid: '#6B1F6B', horizon: '#CC2900', sun: '#FFE000', label: 'Goa · 6:42 PM' },
  { id: 'mumbai',    skyTop: '#0A0520', mid: '#3D1A5C', horizon: '#FF4500', sun: '#FFD700', label: 'Mumbai · 7:01 PM' },
  { id: 'kerala',    skyTop: '#0D0830', mid: '#5C2266', horizon: '#CC4400', sun: '#FFE500', label: 'Kerala · 6:18 PM' },
  { id: 'rajasthan', skyTop: '#1A0530', mid: '#8B2200', horizon: '#FF6347', sun: '#FFEC00', label: 'Rajasthan · 6:55 PM' },
  { id: 'bali',      skyTop: '#08021E', mid: '#4B0082', horizon: '#DC6900', sun: '#FFE000', label: 'Bali · 5:58 PM' },
];

export const DEFAULT_PALETTE: Palette = {
  id: 'default',
  skyTop: '#14033A',
  mid: '#6B1F6B',
  horizon: '#CC2900',
  sun: '#FFE000',
  label: '',
};
