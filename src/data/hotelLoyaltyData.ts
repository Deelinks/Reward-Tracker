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

