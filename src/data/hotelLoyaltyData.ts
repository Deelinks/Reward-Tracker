export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface RewardNumberEntry {
  entryId: string;
  reservationNumber: string; // Guest Reservation Number e.g. 'RES-904821'
  rewardsNumber: string; // 16-digit Rewards Number e.g. '6015995107986345'
  dateIso: string; // YYYY-MM-DD (e.g. '2026-10-08')
  timestamp: string; // HH:MM:SS
  status: ApprovalStatus;
  reviewedBy?: string;
}

export interface StaffMemberRecord {
  id: string;
  staffLoginId: string; // Unique ID created/reset by the Manager for logging in (e.g. 'AUR-101')
  staffName: string;
  role: string;
  avatarColor: string;
  avatarId?: string; // Selected custom 3D avatar identifier
  monthlyGoal: number;
  dailyGoal: number;
  entries: RewardNumberEntry[];
}

export const MANAGER_EMAIL = 'deelinkitsolution@gmail.com';
export const INITIAL_MANAGER_PASSWORD = 'Deelink#2026';
// Salted SHA-256 hash of 'kimono-frontdesk-v1::Deelink#2026'
export const INITIAL_MANAGER_PASSWORD_HASH =
  '25be940b6ef81f1a0649e6b974999b5ff87a6a871b242c5c636120dc05194688';

export const STAFF_NAMES = [
  'Busola',
  'Atiku',
  'Shola',
  'Adeyemi',
  'Tunde',
  'Ifeanyi',
  'Aolat',
  'Sekinat',
  'Demola',
  'Andy',
  'Emmanuel'
] as const;

// Clean initial staff roster with 0 entries (cleared for fresh multi-workstation tracking)
export const INITIAL_STAFF_RECORDS: StaffMemberRecord[] = [
  {
    id: 'STF-01',
    staffLoginId: 'AUR-101',
    staffName: 'Busola',
    role: 'Senior Front Desk Associate',
    avatarColor: '#d97706',
    avatarId: 'lion-king',
    monthlyGoal: 45,
    dailyGoal: 5,
    entries: []
  },
  {
    id: 'STF-02',
    staffLoginId: 'AUR-102',
    staffName: 'Atiku',
    role: 'Lead Guest Relations',
    avatarColor: '#4f46e5',
    avatarId: 'concierge-pro',
    monthlyGoal: 45,
    dailyGoal: 5,
    entries: []
  },
  {
    id: 'STF-03',
    staffLoginId: 'AUR-103',
    staffName: 'Shola',
    role: 'Loyalty Desk Specialist',
    avatarColor: '#0d9488',
    avatarId: 'reception-lead',
    monthlyGoal: 40,
    dailyGoal: 4,
    entries: []
  },
  {
    id: 'STF-04',
    staffLoginId: 'AUR-104',
    staffName: 'Adeyemi',
    role: 'VIP Arrival Coordinator',
    avatarColor: '#0284c7',
    avatarId: 'panda-chef',
    monthlyGoal: 40,
    dailyGoal: 4,
    entries: []
  },
  {
    id: 'STF-05',
    staffLoginId: 'AUR-105',
    staffName: 'Tunde',
    role: 'Front Office Executive',
    avatarColor: '#7c3aed',
    avatarId: 'fox-clever',
    monthlyGoal: 38,
    dailyGoal: 4,
    entries: []
  },
  {
    id: 'STF-06',
    staffLoginId: 'AUR-106',
    staffName: 'Ifeanyi',
    role: 'Express Check-In Associate',
    avatarColor: '#e11d48',
    avatarId: 'bellhop-kai',
    monthlyGoal: 36,
    dailyGoal: 4,
    entries: []
  },
  {
    id: 'STF-07',
    staffLoginId: 'AUR-107',
    staffName: 'Aolat',
    role: 'Concierge & Loyalty Rep',
    avatarColor: '#059669',
    avatarId: 'specialist-zara',
    monthlyGoal: 35,
    dailyGoal: 4,
    entries: []
  },
  {
    id: 'STF-08',
    staffLoginId: 'AUR-108',
    staffName: 'Sekinat',
    role: 'Guest Services Associate',
    avatarColor: '#db2777',
    avatarId: 'arrival-maya',
    monthlyGoal: 35,
    dailyGoal: 4,
    entries: []
  },
  {
    id: 'STF-09',
    staffLoginId: 'AUR-109',
    staffName: 'Demola',
    role: 'Group Arrival Coordinator',
    avatarColor: '#ea580c',
    avatarId: 'dog-golden',
    monthlyGoal: 32,
    dailyGoal: 3,
    entries: []
  },
  {
    id: 'STF-10',
    staffLoginId: 'AUR-110',
    staffName: 'Andy',
    role: 'Night Shift Loyalty Lead',
    avatarColor: '#2563eb',
    avatarId: 'owl-wise',
    monthlyGoal: 30,
    dailyGoal: 3,
    entries: []
  },
  {
    id: 'STF-11',
    staffLoginId: 'AUR-111',
    staffName: 'Emmanuel',
    role: 'Night Audit Associate',
    avatarColor: '#475569',
    avatarId: 'auditor-elena',
    monthlyGoal: 30,
    dailyGoal: 3,
    entries: []
  }
];

// Helper to get local date ISO string YYYY-MM-DD synced to system clock
export function getSystemDateIso(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper to get month key YYYY-MM synced to system clock
export function getSystemMonthKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export interface MonthMeta {
  key: string; // YYYY-MM
  label: string; // e.g. November 2026
  daysInMonth: number;
  year: number;
  monthNum: number;
}

export function getMonthMeta(monthKey: string): MonthMeta {
  const [yearStr, monthStr] = monthKey.split('-');
  const now = new Date();
  const year = parseInt(yearStr, 10) || now.getFullYear();
  const monthNum = parseInt(monthStr, 10) || now.getMonth() + 1;
  const dateObj = new Date(year, monthNum - 1, 1);
  const label = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  return { key: monthKey, label, daysInMonth, year, monthNum };
}

// Dynamically generate available months covering current year, system month, and any months with recorded entries
export function generateAvailableMonths(extraMonthKeys: string[] = []): MonthMeta[] {
  const current = new Date();
  const currentYear = current.getFullYear();
  const currentMonthKey = getSystemMonthKey(current);
  const monthKeysSet = new Set<string>();

  // Include current system month
  monthKeysSet.add(currentMonthKey);

  // Include all 12 months for the current year
  for (let m = 1; m <= 12; m++) {
    const mStr = String(m).padStart(2, '0');
    monthKeysSet.add(`${currentYear}-${mStr}`);
  }

  // Also include 2026-10 and 2026-09 historical months
  monthKeysSet.add('2026-09');
  monthKeysSet.add('2026-10');
  monthKeysSet.add('2026-11');

  // Include any extra month keys from database entries
  extraMonthKeys.forEach((k) => {
    if (/^\d{4}-\d{2}$/.test(k)) {
      monthKeysSet.add(k);
    }
  });

  // Sort latest months first
  const sortedKeys = Array.from(monthKeysSet).sort((a, b) => b.localeCompare(a));
  return sortedKeys.map(getMonthMeta);
}

export const AVAILABLE_MONTHS: readonly MonthMeta[] = generateAvailableMonths();

export type AvatarCategory = 'animal' | 'human';

export interface StaffAvatarPreset {
  id: string;
  name: string;
  title: string;
  category: AvatarCategory;
  description: string;
  badgeEmoji: string;
  defaultGradient: string;
}

export const AVATAR_PRESETS: StaffAvatarPreset[] = [
  // --- 8 3D CARTOON ANIMALS ---
  {
    id: 'lion-king',
    name: 'Leo the Royal Lion',
    title: 'King of Front Desk',
    category: 'animal',
    description: 'Regal 3D lion with golden mane, warm confident gaze, and front desk gold badge',
    badgeEmoji: '🦁',
    defaultGradient: 'from-amber-400 via-amber-500 to-amber-700'
  },
  {
    id: 'owl-wise',
    name: 'Barnaby the Wise Owl',
    title: 'Audit & Night Sage',
    category: 'animal',
    description: 'Wise 3D feathered scholar with golden circular glasses and concierge tie',
    badgeEmoji: '🦉',
    defaultGradient: 'from-indigo-600 via-blue-700 to-slate-900'
  },
  {
    id: 'panda-chef',
    name: 'Bella the Cheerful Panda',
    title: 'Hospitality Ambassador',
    category: 'animal',
    description: 'Adorable 3D panda with blushing cheeks, fluffy ears, and crimson bow tie',
    badgeEmoji: '🐼',
    defaultGradient: 'from-slate-800 via-slate-700 to-emerald-600'
  },
  {
    id: 'fox-clever',
    name: 'Felix the Swift Fox',
    title: 'Rapid Rewards Dynamo',
    category: 'animal',
    description: 'Clever 3D red fox with perky white-lined ears and charismatic grin',
    badgeEmoji: '🦊',
    defaultGradient: 'from-orange-500 via-amber-600 to-red-600'
  },
  {
    id: 'dog-golden',
    name: 'Cooper the Golden Pup',
    title: 'VIP Guest Welcome',
    category: 'animal',
    description: 'Friendly 3D golden retriever with floppy ears, happy eyes, and red bandana',
    badgeEmoji: '🐶',
    defaultGradient: 'from-amber-300 via-amber-400 to-yellow-600'
  },
  {
    id: 'tiger-bold',
    name: 'Tigress Maya',
    title: 'Pace-Setter Champion',
    category: 'animal',
    description: 'Bold 3D golden tiger with stylish stripes, emerald eyes, and radiant energy',
    badgeEmoji: '🐯',
    defaultGradient: 'from-amber-500 via-orange-600 to-rose-700'
  },
  {
    id: 'bear-gentle',
    name: 'Barny the Friendly Bear',
    title: 'Concierge Anchor',
    category: 'animal',
    description: 'Warm 3D brown bear with soft round ears, gentle smile, and executive necktie',
    badgeEmoji: '🐻',
    defaultGradient: 'from-amber-700 via-amber-800 to-stone-900'
  },
  {
    id: 'cat-siamese',
    name: 'Cleo the Luxury Cat',
    title: 'Elite Loyalty Specialist',
    category: 'animal',
    description: 'Sleek 3D feline with sapphire blue eyes, delicate whiskers, and gold bell collar',
    badgeEmoji: '🐱',
    defaultGradient: 'from-sky-400 via-indigo-500 to-purple-700'
  },

  // --- 8 3D CARTOON HUMANS ---
  {
    id: 'concierge-pro',
    name: 'Arthur the Master Concierge',
    title: 'Chief Concierge',
    category: 'human',
    description: 'Distinguished 3D gentleman with styled mustache, golden keys, and bow tie',
    badgeEmoji: '🤵',
    defaultGradient: 'from-rose-800 via-amber-700 to-slate-900'
  },
  {
    id: 'reception-lead',
    name: 'Sophie the Front Desk Lead',
    title: 'Arrival Coordinator',
    category: 'human',
    description: 'Charming 3D receptionist with styled auburn hair and front desk headset',
    badgeEmoji: '👩‍💼',
    defaultGradient: 'from-teal-500 via-emerald-600 to-cyan-800'
  },
  {
    id: 'bellhop-kai',
    name: 'Kai the Bellhop Champion',
    title: 'VIP Bellhop Star',
    category: 'human',
    description: 'High-energy 3D young man in crimson pillbox cap with gold buttons',
    badgeEmoji: '🛎️',
    defaultGradient: 'from-rose-600 via-red-700 to-amber-500'
  },
  {
    id: 'manager-david',
    name: 'David the General Manager',
    title: 'Executive Leader',
    category: 'human',
    description: 'Distinguished 3D manager with silver-trimmed hair and tailored charcoal suit',
    badgeEmoji: '👨‍💼',
    defaultGradient: 'from-slate-700 via-slate-800 to-indigo-950'
  },
  {
    id: 'arrival-maya',
    name: 'Maya the VIP Host',
    title: 'Guest Relations Pro',
    category: 'human',
    description: 'Stylish 3D woman with high ponytail, glowing eyes, and silk neck scarf',
    badgeEmoji: '👱‍♀️',
    defaultGradient: 'from-purple-500 via-violet-600 to-indigo-800'
  },
  {
    id: 'auditor-elena',
    name: 'Elena the Night Auditor',
    title: 'Precision Auditor',
    category: 'human',
    description: 'Smart 3D professional with modern glasses, chic dark bob, and emerald blazer',
    badgeEmoji: '👩‍🏫',
    defaultGradient: 'from-emerald-600 via-teal-700 to-slate-900'
  },
  {
    id: 'host-sam',
    name: 'Sam the Cheerful Host',
    title: 'Loyalty Guide',
    category: 'human',
    description: 'Friendly 3D young host with tousled hair, warm open grin, and star lapel pin',
    badgeEmoji: '🧑',
    defaultGradient: 'from-amber-400 via-orange-500 to-rose-600'
  },
  {
    id: 'specialist-zara',
    name: 'Zara the Experience Star',
    title: 'Guest Experience Lead',
    category: 'human',
    description: 'Radiant 3D woman with beautiful high curly crown, golden studs, and sunny smile',
    badgeEmoji: '✨',
    defaultGradient: 'from-fuchsia-500 via-rose-500 to-amber-400'
  }
];

// Helper to seamlessly normalize old legacy IDs to the new 3D cartoon avatars
export function normalizeAvatarId(avatarId?: string): string {
  if (!avatarId) return 'lion-king';
  const legacyMap: Record<string, string> = {
    'royal-crown': 'lion-king',
    'vip-sparkle': 'concierge-pro',
    'diamond-gem': 'reception-lead',
    'shield-master': 'panda-chef',
    'flame-achiever': 'fox-clever',
    'key-executive': 'bellhop-kai',
    'trophy-elite': 'specialist-zara',
    'medal-award': 'arrival-maya',
    'compass-navigator': 'dog-golden',
    'moon-guardian': 'owl-wise',
    'check-master': 'auditor-elena',
    'heart-warmth': 'panda-chef',
    'sun-luminary': 'host-sam',
    'globe-welcome': 'arrival-maya',
    'briefcase-pro': 'manager-david',
    'star-shining': 'cat-siamese'
  };
  return legacyMap[avatarId] || avatarId;
}

export const AVATAR_COLOR_PALETTES = [
  { name: 'Amber Gold', hex: '#d97706', ring: 'ring-amber-400', bg: 'bg-amber-600' },
  { name: 'Royal Indigo', hex: '#4f46e5', ring: 'ring-indigo-400', bg: 'bg-indigo-600' },
  { name: 'Emerald Forest', hex: '#059669', ring: 'ring-emerald-400', bg: 'bg-emerald-600' },
  { name: 'Sapphire Blue', hex: '#0284c7', ring: 'ring-sky-400', bg: 'bg-sky-600' },
  { name: 'Ruby Rose', hex: '#e11d48', ring: 'ring-rose-400', bg: 'bg-rose-600' },
  { name: 'Amethyst Purple', hex: '#7c3aed', ring: 'ring-purple-400', bg: 'bg-purple-600' },
  { name: 'Deep Teal', hex: '#0d9488', ring: 'ring-teal-400', bg: 'bg-teal-600' },
  { name: 'Midnight Slate', hex: '#334155', ring: 'ring-slate-400', bg: 'bg-slate-700' }
];

export interface WeekRangeMeta {
  startIso: string; // YYYY-MM-DD (Monday)
  endIso: string; // YYYY-MM-DD (Sunday)
  label: string; // e.g. "Nov 2 – Nov 8, 2026"
  shortLabel: string; // e.g. "Week 45"
  days: string[]; // 7 ISO date strings [Mon ... Sun]
  weekNumber: number;
}

export function getWeekRangeMeta(referenceDateIso: string): WeekRangeMeta {
  const [y, m, d] = referenceDateIso.split('-').map(Number);
  const ref = new Date(y, m - 1, d);

  // ISO day: 0 is Sun, 1 is Mon ... 6 is Sat -> shift so Monday is 0, Sunday is 6
  const dayOfWeek = (ref.getDay() + 6) % 7;

  const monday = new Date(ref);
  monday.setDate(ref.getDate() - dayOfWeek);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    days.push(getSystemDateIso(cur));
  }

  const startIso = days[0];
  const endIso = days[6];

  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const startObj = new Date(sy, sm - 1, sd);
  const endObj = new Date(ey, em - 1, ed);

  const startMonth = startObj.toLocaleString('en-US', { month: 'short' });
  const endMonth = endObj.toLocaleString('en-US', { month: 'short' });

  const label =
    startMonth === endMonth
      ? `${startMonth} ${sd} – ${ed}, ${sy}`
      : `${startMonth} ${sd} – ${endMonth} ${ed}, ${sy}`;

  // Approximate week number of the year
  const firstJan = new Date(ref.getFullYear(), 0, 1);
  const daysDiff = Math.floor((ref.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.max(1, Math.ceil((daysDiff + firstJan.getDay() + 1) / 7));

  return {
    startIso,
    endIso,
    label,
    shortLabel: `Week ${weekNumber}`,
    days,
    weekNumber
  };
}

