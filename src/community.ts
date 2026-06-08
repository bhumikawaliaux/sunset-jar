export interface CommunitySunset {
  id: string;
  user: string;          // handle
  displayName: string;
  initials: string;
  place: string;
  time: string;
  daysAgo: number;
  note: string;
  imageUrl: string;
  likes: number;
  isNearby?: boolean;    // for the Nearby filter
}

// A mix of real Unsplash sunset photos (CDN-hosted, no key required).
export const COMMUNITY_SUNSETS: CommunitySunset[] = [
  {
    id: 'c1',
    user: 'maya_d',
    displayName: 'Maya D',
    initials: 'MD',
    place: 'Anjuna Beach, Goa',
    time: '6:41 PM',
    daysAgo: 1,
    note: 'tiny dance party broke out as the sun touched the water. nobody planned it.',
    imageUrl: '/pexels-mlkbnl-31128376.jpg',
    likes: 142,
    isNearby: true,
  },
  {
    id: 'c2',
    user: 'arjun.k',
    displayName: 'Arjun K',
    initials: 'AK',
    place: 'Rooftop, Bangalore',
    time: '6:08 PM',
    daysAgo: 2,
    note: 'caught it between two buildings. felt like the city was holding its breath.',
    imageUrl: '/pexels-vinicius-quaresma-511530024-33057232.jpg',
    likes: 89,
  },
  {
    id: 'c3',
    user: 'nila_w',
    displayName: 'Nila Walia',
    initials: 'NW',
    place: 'Marari Beach, Kerala',
    time: '6:19 PM',
    daysAgo: 3,
    note: 'fishermen pulled in their boats. sky did this entire color show for them.',
    imageUrl: '/pexels-akos-solymar-706203895-33926926.jpg',
    likes: 312,
  },
  {
    id: 'c4',
    user: 'tarun.s',
    displayName: 'Tarun S',
    initials: 'TS',
    place: 'Pushkar Lake, Rajasthan',
    time: '6:52 PM',
    daysAgo: 5,
    note: 'temple bells started ringing exactly when the sun dropped. cinematic.',
    imageUrl: '/pexels-daniel-2983489.jpg',
    likes: 56,
  },
  {
    id: 'c5',
    user: 'aanya.r',
    displayName: 'Aanya R',
    initials: 'AR',
    place: 'Versova Pier, Mumbai',
    time: '6:47 PM',
    daysAgo: 6,
    note: 'shared a vada pav with a stranger who said this was her last sunset in the city.',
    imageUrl: '/pexels-ervin-fon-trichev-102943620-20877578.jpg',
    likes: 201,
    isNearby: true,
  },
  {
    id: 'c6',
    user: 'devan_p',
    displayName: 'Devan P',
    initials: 'DP',
    place: 'Wayanad, Kerala',
    time: '6:23 PM',
    daysAgo: 8,
    note: 'mist rolling down the hills like cold tea steam. perfect.',
    imageUrl: '/photo-1647962431451-d0fdaf1cf21c.avif',
    likes: 78,
  },
  {
    id: 'c7',
    user: 'isha.m',
    displayName: 'Isha M',
    initials: 'IM',
    place: 'Carter Road, Mumbai',
    time: '6:36 PM',
    daysAgo: 4,
    note: 'walked the promenade. found a stray dog who watched the whole thing with me.',
    imageUrl: '/pexels-mlkbnl-31128376.jpg',
    likes: 167,
    isNearby: true,
  },
  {
    id: 'c8',
    user: 'kabir.j',
    displayName: 'Kabir J',
    initials: 'KJ',
    place: 'Manali, Himachal',
    time: '6:01 PM',
    daysAgo: 11,
    note: 'snowline glowed pink for exactly three minutes. blink and you miss.',
    imageUrl: '/pexels-akos-solymar-706203895-33926926.jpg',
    likes: 421,
  },
];

export function getCommunityById(id: string): CommunitySunset | undefined {
  return COMMUNITY_SUNSETS.find((s) => s.id === id);
}
