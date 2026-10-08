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

export const AVAILABLE_MONTHS = [
  { key: '2026-10', label: 'October 2026', daysInMonth: 31 },
  { key: '2026-09', label: 'September 2026', daysInMonth: 30 }
] as const;
