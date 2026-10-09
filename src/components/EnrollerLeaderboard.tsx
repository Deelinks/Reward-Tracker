import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  StaffMemberRecord
} from '../data/hotelLoyaltyData';
import { FirestoreActiveSessionDoc } from '../services/firebaseClient';
import {
  ArrowUpDown,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  X
} from 'lucide-react';

export type AuthenticatedSession =
  | { role: 'staff'; staffId: string; staffName: string; staffLoginId: string }
  | { role: 'manager'; email: string };

interface EnrollerLeaderboardProps {
  staffRecords: StaffMemberRecord[];
  session: AuthenticatedSession;
  onLogout: () => void;
  selectedMonthKey: string;
  selectedMonthLabel: string;
  daysInMonth: number;
  selectedDateIso: string;
  onSelectDateIso: (dateIso: string) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onSubmitStaffRewardNumber: (
    staffId: string,
    reservationNumber: string,
    rewardsNumber: string,
    dateIso: string
  ) => void;
  onManagerDecision: (
    staffId: string,
    entryId: string,
    decision: 'approved' | 'rejected'
  ) => void;
  onManagerApproveAll: () => void;
  onCreateStaffMember: (
    staffName: string,
    staffLoginId: string,
    role: string,
    monthlyGoal: number
  ) => void;
  onUpdateStaffLoginId: (staffId: string, newLoginId: string) => void;
  onUpdateStaffRole: (staffId: string, newRole: string) => void;
  onUpdateStaffMonthlyGoal: (staffId: string, newMonthlyGoal: number) => void;
  onUpdateAllStaffMonthlyGoals: (newMonthlyGoal: number) => void;
  managerPassword: string;
  onChangeManagerPassword: (newPassword: string) => void;
  onClearAllEntries: () => void;
  activeSessions: FirestoreActiveSessionDoc[];
}

type SortMode = 'monthTotal' | 'dayTotal' | 'pendingCount';

export const EnrollerLeaderboard: React.FC<EnrollerLeaderboardProps> = ({
  staffRecords,
  session,
  onLogout,
  selectedMonthKey,
  selectedMonthLabel,
  selectedDateIso,
  onSelectDateIso,
  searchQuery,
  onSearchQueryChange,
  onSubmitStaffRewardNumber,
  onManagerDecision,
  onManagerApproveAll,
  onCreateStaffMember,
  onUpdateStaffLoginId,
  onUpdateStaffRole,
  onUpdateStaffMonthlyGoal,
  onUpdateAllStaffMonthlyGoals,
  managerPassword,
  onChangeManagerPassword,
  onClearAllEntries,
  activeSessions
}) => {
  // Manager Console Active Tab ('approvals' | 'manageStaff' | 'signedInUsers' | 'security')
  const [managerTab, setManagerTab] = useState<
    'approvals' | 'manageStaff' | 'signedInUsers' | 'security'
  >('approvals');

  // Create Staff & Goal Management State
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffLoginId, setNewStaffLoginId] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<string>('Front Desk Associate');
  const [newStaffGoal, setNewStaffGoal] = useState<number>(35);
  const [staffManageError, setStaffManageError] = useState<string | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editingLoginIdValue, setEditingLoginIdValue] = useState<string>('');
  const [editingRoleStaffId, setEditingRoleStaffId] = useState<string | null>(null);
  const [editingRoleValue, setEditingRoleValue] = useState<string>('');
  const [editingGoalStaffId, setEditingGoalStaffId] = useState<string | null>(null);
  const [editingGoalValue, setEditingGoalValue] = useState<number>(40);
  const [bulkMonthlyGoalInput, setBulkMonthlyGoalInput] = useState<number>(45);

  // Manager Password Change State
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [passwordFormError, setPasswordFormError] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);

  // Staff Self-Service Change Unique ID State (must use AUR- prefix)
  const [isStaffChangingOwnId, setIsStaffChangingOwnId] = useState<boolean>(false);
  const [staffCustomSuffixInput, setStaffCustomSuffixInput] = useState<string>('');
  const [staffOwnIdError, setStaffOwnIdError] = useState<string | null>(null);

  // Staff Rewards Number Entry State (Reservation Number + 16-digit Rewards Number)
  const [reservationNumberInput, setReservationNumberInput] = useState<string>('');
  const [rewardsNumberInput, setRewardsNumberInput] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Leaderboard Sorting & Expanded Row
  const [sortMode, setSortMode] = useState<SortMode>('monthTotal');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(
    session.role === 'staff' ? session.staffId : staffRecords[0]?.id || null
  );

  // Check if a rewards number is already recorded by ANY staff member at ANY time (unless rejected)
  const findExistingRewardsRecord = (rawNumber: string) => {
    const normalized = rawNumber.replace(/\s+/g, '');
    if (!normalized) return null;
    for (const staff of staffRecords) {
      for (const entry of staff.entries) {
        if (
          entry.status !== 'rejected' &&
          entry.rewardsNumber.replace(/\s+/g, '') === normalized
        ) {
          return { staff, entry };
        }
      }
    }
    return null;
  };

  const liveDuplicateMatch = findExistingRewardsRecord(rewardsNumberInput);

  // Handle Logged-in Staff Submitting a New Rewards Number + Reservation Number
  const handleStaffRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (session.role !== 'staff') return;

    const cleanReservation = reservationNumberInput.trim().toUpperCase();
    const normalizedRewards = rewardsNumberInput.replace(/\s+/g, '');

    if (!cleanReservation) {
      setFormError('Please enter the Reservation Number.');
      return;
    }
    if (!normalizedRewards) {
      setFormError('Please enter the 16-digit Rewards Number (e.g., 6015995107986345).');
      return;
    }
    if (!/^\d{16}$/.test(normalizedRewards)) {
      setFormError(
        `Rewards Number must be exactly 16 digits (currently ${normalizedRewards.length} digits).`
      );
      return;
    }

    const existing = findExistingRewardsRecord(normalizedRewards);
    if (existing) {
      setFormError(
        `Duplicate Blocked: Number ${normalizedRewards} was already recorded by ${existing.staff.staffName} (Reservation ${existing.entry.reservationNumber}) on ${existing.entry.dateIso}.`
      );
      return;
    }

    setFormError(null);
    onSubmitStaffRewardNumber(
      session.staffId,
      cleanReservation,
      normalizedRewards,
      selectedDateIso
    );
    setReservationNumberInput('');
    setRewardsNumberInput('');
    setExpandedStaffId(session.staffId);
  };

  // Handle Logged-in Staff Member Changing Their Own Unique ID (with mandatory AUR- prefix)
  const handleStaffSaveOwnId = (e: React.FormEvent) => {
    e.preventDefault();
    if (session.role !== 'staff') return;

    const cleanSuffix = staffCustomSuffixInput
      .trim()
      .toUpperCase()
      .replace(/^AUR-?/, '')
      .replace(/[^A-Z0-9_-]/g, '');

    if (!cleanSuffix) {
      setStaffOwnIdError('Please enter your new ID code after the AUR- prefix.');
      return;
    }

    const fullNewId = `AUR-${cleanSuffix}`;
    const duplicate = staffRecords.some(
      (s) => s.id !== session.staffId && s.staffLoginId.toUpperCase() === fullNewId
    );
    if (duplicate) {
      setStaffOwnIdError(
        `Staff ID "${fullNewId}" is already in use by another staff member. Please choose a different code.`
      );
      return;
    }

    setStaffOwnIdError(null);
    onUpdateStaffLoginId(session.staffId, fullNewId);
    setIsStaffChangingOwnId(false);
    setStaffCustomSuffixInput('');
  };

  // Handle Manager Creating a New Staff Member & Login ID
  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newStaffName.trim();
    const rawId = newStaffLoginId.trim().toUpperCase().replace(/^AUR-?/, '').replace(/[^A-Z0-9_-]/g, '');
    const cleanLoginId = rawId ? `AUR-${rawId}` : '';
    const cleanRole = newStaffRole.trim() || 'Front Desk Associate';

    if (!cleanName) {
      setStaffManageError('Please enter the new staff member’s name.');
      return;
    }
    if (!cleanLoginId) {
      setStaffManageError('Please enter a unique Login ID with the AUR- prefix.');
      return;
    }

    const nameExists = staffRecords.some(
      (s) => s.staffName.toLowerCase() === cleanName.toLowerCase()
    );
    if (nameExists) {
      setStaffManageError(`A staff member named "${cleanName}" already exists.`);
      return;
    }

    const idExists = staffRecords.some(
      (s) => s.staffLoginId.toUpperCase() === cleanLoginId
    );
    if (idExists) {
      setStaffManageError(
        `Staff Login ID "${cleanLoginId}" is already assigned to another staff member.`
      );
      return;
    }

    setStaffManageError(null);
    onCreateStaffMember(cleanName, cleanLoginId, cleanRole, Number(newStaffGoal) || 35);
    setNewStaffName('');
    setNewStaffLoginId('');
  };

  // Handle Manager Saving a Custom or Reset Staff Login ID
  const handleSaveEditedLoginId = (staffId: string) => {
    const rawSuffix = editingLoginIdValue
      .trim()
      .toUpperCase()
      .replace(/^AUR-?/, '')
      .replace(/[^A-Z0-9_-]/g, '');
    if (!rawSuffix) {
      setStaffManageError('Staff Login ID must have a valid code after AUR-.');
      return;
    }
    const cleanLoginId = `AUR-${rawSuffix}`;
    const duplicate = staffRecords.some(
      (s) => s.id !== staffId && s.staffLoginId.toUpperCase() === cleanLoginId
    );
    if (duplicate) {
      setStaffManageError(
        `Staff Login ID "${cleanLoginId}" is already in use by another staff member.`
      );
      return;
    }
    setStaffManageError(null);
    onUpdateStaffLoginId(staffId, cleanLoginId);
    setEditingStaffId(null);
    setEditingLoginIdValue('');
  };

  // Handle Manager One-Click Reset Staff ID (Generates a fresh unique ID immediately)
  const handleInstantResetStaffId = (staff: StaffMemberRecord) => {
    let candidate = '';
    do {
      const randDigits = Math.floor(200 + Math.random() * 799);
      candidate = `AUR-${randDigits}`;
    } while (staffRecords.some((s) => s.staffLoginId.toUpperCase() === candidate));

    setStaffManageError(null);
    onUpdateStaffLoginId(staff.id, candidate);
  };

  // Handle Manager Saving an Individual Staff Member's Monthly Goal
  const handleSaveStaffGoal = (staffId: string) => {
    const cleanGoal = Math.max(1, Math.round(Number(editingGoalValue) || 1));
    setStaffManageError(null);
    onUpdateStaffMonthlyGoal(staffId, cleanGoal);
    setEditingGoalStaffId(null);
  };

  // Handle Manager Applying a Monthly Goal to All Staff at Once
  const handleApplyBulkMonthlyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBulkGoal = Math.max(1, Math.round(Number(bulkMonthlyGoalInput) || 1));
    setStaffManageError(null);
    onUpdateAllStaffMonthlyGoals(cleanBulkGoal);
  };

  // Suggest next available Staff Login ID
  const suggestNextStaffId = () => {
    const nextNum = 101 + staffRecords.length;
    setNewStaffLoginId(`AUR-${nextNum}`);
    setStaffManageError(null);
  };

  // Handle Manager Changing Their Own Password
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPasswordInput !== managerPassword) {
      setPasswordFormError('Current password does not match your active Manager password.');
      return;
    }
    if (newPasswordInput.trim().length < 6) {
      setPasswordFormError('New Manager password must be at least 6 characters long.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordFormError('New password and confirmation do not match.');
      return;
    }

    setPasswordFormError(null);
    onChangeManagerPassword(newPasswordInput);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  // Gather all pending entries across all staff for the Manager Approval Queue
  const allPendingEntries = staffRecords.flatMap((staff) =>
    staff.entries
      .filter((e) => e.status === 'pending')
      .map((entry) => ({
        staffId: staff.id,
        staffName: staff.staffName,
        staffLoginId: staff.staffLoginId,
        avatarColor: staff.avatarColor,
        entry
      }))
  );

  // Compute daily and monthly APPROVED counts for each staff member
  const computedStaff = staffRecords.map((staff) => {
    const monthApproved = staff.entries.filter(
      (e) => e.dateIso.startsWith(selectedMonthKey) && e.status === 'approved'
    );
    const monthPending = staff.entries.filter(
      (e) => e.dateIso.startsWith(selectedMonthKey) && e.status === 'pending'
    );
    const dayApproved = staff.entries.filter(
      (e) => e.dateIso === selectedDateIso && e.status === 'approved'
    );

    const dailyApprovedMap: Record<number, number> = {};
    for (let d = 1; d <= 10; d++) {
      dailyApprovedMap[d] = 0;
    }
    monthApproved.forEach((entry) => {
      const dayNum = parseInt(entry.dateIso.slice(8, 10), 10);
      if (!isNaN(dayNum)) {
        dailyApprovedMap[dayNum] = (dailyApprovedMap[dayNum] || 0) + 1;
      }
    });

    return {
      ...staff,
      monthApprovedCount: monthApproved.length,
      monthPendingCount: monthPending.length,
      dayApprovedCount: dayApproved.length,
      dailyApprovedMap,
      monthEntries: staff.entries.filter((e) => e.dateIso.startsWith(selectedMonthKey))
    };
  });

  // Top 3 Leaderboard Champions
  const topThreeChampions = [...computedStaff]
    .sort((a, b) =>
      b.monthApprovedCount !== a.monthApprovedCount
        ? b.monthApprovedCount - a.monthApprovedCount
        : b.dayApprovedCount - a.dayApprovedCount
    )
    .slice(0, 3);

  const filteredStaff = computedStaff
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.staffName.toLowerCase().includes(q) ||
        s.staffLoginId.toLowerCase().includes(q) ||
        s.entries.some(
          (e) =>
            e.rewardsNumber.toLowerCase().includes(q) ||
            e.reservationNumber.toLowerCase().includes(q)
        )
      );
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortMode === 'monthTotal') diff = a.monthApprovedCount - b.monthApprovedCount;
      else if (sortMode === 'dayTotal') diff = a.dayApprovedCount - b.dayApprovedCount;
      else diff = a.monthPendingCount - b.monthPendingCount;
      return sortAsc ? diff : -diff;
    });

  const handleSortClick = (mode: SortMode) => {
    if (sortMode === mode) setSortAsc(!sortAsc);
    else {
      setSortMode(mode);
      setSortAsc(false);
    }
  };

  const visibleDays = [1, 2, 3, 4, 5, 6, 7, 8];
  const selectedDayNum = parseInt(selectedDateIso.slice(8, 10), 10);

  return (
    <div className="space-y-8">
      {/* SECTION 1: ACTIVE ROLE WORKSPACE (STAFF SUBMISSION OR MANAGER CONTROL CENTER) */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {session.role === 'staff' ? (
          /* LOGGED-IN STAFF WORKSPACE: SUBMIT RESERVATION NUMBER & REWARDS NUMBER + CHANGE OWN AUR- ID */
          <div>
            <div className="bg-indigo-950 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Welcome, {session.staffName} · Daily Rewards Number Entry
                </h2>
                <p className="text-xs text-indigo-200">
                  Enter the Reservation Number and 16-digit Guest Rewards Number below. Entries
                  require Manager approval.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsStaffChangingOwnId(!isStaffChangingOwnId);
                    setStaffCustomSuffixInput('');
                    setStaffOwnIdError(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg cursor-pointer transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isStaffChangingOwnId ? 'Close ID Editor' : 'Change My Staff ID'}</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {isStaffChangingOwnId && (
              <div className="bg-indigo-50/90 border-b border-indigo-200 px-6 py-4">
                <form
                  onSubmit={handleStaffSaveOwnId}
                  className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-indigo-700" />
                      <span>Change Your Unique Staff ID (Fixed AUR- Prefix)</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Your Staff ID always starts with <strong className="font-mono-tabular">AUR-</strong>. Enter your preferred characters or numbers after the prefix.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center rounded-lg border border-indigo-300 bg-white overflow-hidden">
                      <span className="px-3 py-2 bg-indigo-900 text-amber-300 font-mono-tabular text-sm font-bold select-none">
                        AUR-
                      </span>
                      <input
                        type="text"
                        maxLength={24}
                        value={staffCustomSuffixInput}
                        onChange={(e) => {
                          setStaffCustomSuffixInput(
                            e.target.value.toUpperCase().replace(/^AUR-?/, '').replace(/[^A-Z0-9_-]/g, '')
                          );
                          setStaffOwnIdError(null);
                        }}
                        placeholder="Enter new code"
                        className="w-36 px-3 py-2 text-sm font-mono-tabular font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
                    >
                      Save New ID
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsStaffChangingOwnId(false);
                        setStaffOwnIdError(null);
                      }}
                      className="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {staffOwnIdError && (
                  <p className="mt-2.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
                    {staffOwnIdError}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleStaffRewardSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    1. Date Received
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={selectedDateIso}
                      onChange={(e) => onSelectDateIso(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm font-mono-tabular font-semibold border border-slate-300 rounded-lg bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    2. Reservation Number
                  </label>
                  <input
                    type="text"
                    value={reservationNumberInput}
                    onChange={(e) => {
                      setReservationNumberInput(e.target.value.toUpperCase());
                      if (formError) setFormError(null);
                    }}
                    placeholder="e.g. RES-840105"
                    className="w-full px-3.5 py-2.5 text-sm font-mono-tabular font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    3. 16-Digit Guest Rewards Number
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="numeric"
                      minLength={16}
                      maxLength={16}
                      value={rewardsNumberInput}
                      onChange={(e) => {
                        setRewardsNumberInput(e.target.value.replace(/[^\d]/g, '').slice(0, 16));
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g. 6015995107986345"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm font-mono-tabular font-semibold border rounded-lg text-slate-900 focus:outline-none ${
                        liveDuplicateMatch
                          ? 'border-rose-500 bg-rose-50 text-rose-900'
                          : 'border-amber-400 bg-amber-50/40 focus:border-amber-600'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={Boolean(liveDuplicateMatch)}
                    className={`w-full py-2.5 px-5 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      liveDuplicateMatch
                        ? 'bg-rose-400 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {liveDuplicateMatch
                        ? 'Duplicate Blocked'
                        : 'Submit for Manager Approval'}
                    </span>
                  </button>
                </div>
              </div>

              {liveDuplicateMatch && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs font-medium text-rose-900">
                  Duplicate Blocked: Rewards Number{' '}
                  <strong className="font-mono-tabular">
                    {liveDuplicateMatch.entry.rewardsNumber}
                  </strong>{' '}
                  was already recorded by <strong>{liveDuplicateMatch.staff.staffName}</strong>{' '}
                  (Reservation <strong>{liveDuplicateMatch.entry.reservationNumber}</strong>) on{' '}
                  <span className="font-mono-tabular">{liveDuplicateMatch.entry.dateIso}</span>.
                  Staff cannot record the same number at any time.
                </div>
              )}

              {formError && !liveDuplicateMatch && (
                <p className="mt-3 text-xs font-semibold text-rose-700">{formError}</p>
              )}
            </form>
          </div>
        ) : (
          /* LOGGED-IN MANAGER WORKSPACE: APPROVE ENTRIES, CREATE/RESET STAFF IDS, CHANGE PASSWORD */
          <div>
            <div className="bg-emerald-950 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold">
                    Welcome, Manager · Control Center
                  </h2>
                  <p className="text-xs text-emerald-200">
                    Approve staff entries, create staff &amp; reset Staff IDs, or update your
                    Manager password.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center bg-emerald-900/80 p-1 rounded-lg border border-emerald-700">
                  <button
                    type="button"
                    onClick={() => setManagerTab('approvals')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                      managerTab === 'approvals'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    Approve Entries ({allPendingEntries.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManagerTab('manageStaff');
                      if (!newStaffLoginId) {
                        setNewStaffLoginId(`AUR-${101 + staffRecords.length}`);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                      managerTab === 'manageStaff'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    Staff IDs &amp; Monthly Goals ({staffRecords.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagerTab('signedInUsers')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                      managerTab === 'signedInUsers'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    Signed-In Users ({activeSessions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagerTab('security')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                      managerTab === 'security'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    Change Manager Password
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {managerTab === 'approvals' && (
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Pending Staff Entries Awaiting Your Approval ({allPendingEntries.length}):
                  </div>
                  {allPendingEntries.length > 0 && (
                    <button
                      type="button"
                      onClick={onManagerApproveAll}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve All ({allPendingEntries.length}) Pending</span>
                    </button>
                  )}
                </div>

                {allPendingEntries.length === 0 ? (
                  <div className="py-6 text-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                    All staff reward number submissions have been reviewed! There are 0 pending
                    entries right now.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {allPendingEntries.map(({ staffId, staffName, staffLoginId, entry }) => (
                      <div
                        key={entry.entryId}
                        className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-mono-tabular text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                            {staffLoginId}
                          </span>
                          <span className="font-semibold text-slate-900">{staffName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-xs font-semibold text-slate-700">
                            Reservation:{' '}
                            <strong className="font-mono-tabular text-slate-900">
                              {entry.reservationNumber}
                            </strong>
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono-tabular font-bold text-indigo-950 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                            {entry.rewardsNumber}
                          </span>
                          <span className="text-xs font-mono-tabular text-slate-600">
                            Date: {entry.dateIso} at {entry.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onManagerDecision(staffId, entry.entryId, 'approved')}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onManagerDecision(staffId, entry.entryId, 'rejected')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-md cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {managerTab === 'manageStaff' && (
              <div className="p-6 space-y-6">
                <form
                  onSubmit={handleCreateStaffSubmit}
                  className="p-5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div className="text-sm font-bold text-slate-900 mb-1">
                    Create New Staff Member &amp; Assign Login ID
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    All staff members must sign in on the Auth page using the Name and Staff ID you
                    create here.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        1. Staff Name
                      </label>
                      <input
                        type="text"
                        value={newStaffName}
                        onChange={(e) => {
                          setNewStaffName(e.target.value);
                          setStaffManageError(null);
                        }}
                        placeholder="e.g. Kehinde"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          2. Staff Login ID
                        </label>
                        <button
                          type="button"
                          onClick={suggestNextStaffId}
                          className="text-[11px] font-semibold text-indigo-700 hover:underline cursor-pointer"
                        >
                          Suggest ID
                        </button>
                      </div>
                      <input
                        type="text"
                        value={newStaffLoginId}
                        onChange={(e) => {
                          setNewStaffLoginId(e.target.value.toUpperCase());
                          setStaffManageError(null);
                        }}
                        placeholder="e.g. AUR-112"
                        className="w-full px-3 py-2 text-sm font-mono-tabular font-bold border border-amber-400 bg-amber-50/40 rounded-lg text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        3. Role / Title
                      </label>
                      <input
                        type="text"
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value)}
                        placeholder="Front Desk Associate"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        4. Monthly Goal
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={newStaffGoal}
                        onChange={(e) => setNewStaffGoal(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full py-2 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Staff</span>
                      </button>
                    </div>
                  </div>

                  {staffManageError && (
                    <p className="mt-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                      {staffManageError}
                    </p>
                  )}
                </form>

                {/* Set Monthly Goal for ALL Staff at Once */}
                <form
                  onSubmit={handleApplyBulkMonthlyGoal}
                  className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-bold text-indigo-950">
                      Set Monthly Goal for All {staffRecords.length} Staff Members
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Update the monthly target for the entire team at once, or edit each staff
                      member’s goal individually below.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                      All-Staff Goal:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={bulkMonthlyGoalInput}
                      onChange={(e) => setBulkMonthlyGoalInput(Number(e.target.value))}
                      className="w-24 px-3 py-2 text-sm font-mono-tabular font-bold border border-indigo-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="submit"
                      className="py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      Apply to All Staff
                    </button>
                  </div>
                </form>

                {/* Directory of All Staff with Instant Reset ID, Custom Edit ID, and Individual Monthly Goal Editor */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2.5">
                    Active Staff Roster · Edit Staff Roles, Individual Monthly Goals &amp; Reset Staff Login IDs (
                    {staffRecords.length} Staff):
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {staffRecords.map((s) => {
                      const isEditingId = editingStaffId === s.id;
                      const isEditingRole = editingRoleStaffId === s.id;
                      const isEditingGoal = editingGoalStaffId === s.id;
                      return (
                        <div
                          key={s.id}
                          className="p-3.5 border border-slate-200 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 text-sm truncate">
                              {s.staffName}
                            </div>
                            {isEditingRole ? (
                              <div className="mt-1 flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-300">
                                <input
                                  type="text"
                                  maxLength={80}
                                  value={editingRoleValue}
                                  onChange={(e) => setEditingRoleValue(e.target.value)}
                                  placeholder="Enter staff role..."
                                  className="w-40 px-2 py-0.5 text-xs font-medium border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:border-indigo-600"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cleanRole = editingRoleValue.trim();
                                    if (!cleanRole) {
                                      setStaffManageError('Staff role cannot be empty.');
                                      return;
                                    }
                                    setStaffManageError(null);
                                    onUpdateStaffRole(s.id, cleanRole);
                                    setEditingRoleStaffId(null);
                                    setEditingRoleValue('');
                                  }}
                                  className="px-2 py-0.5 text-xs font-semibold bg-emerald-600 text-white rounded cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRoleStaffId(null)}
                                  className="px-1.5 py-0.5 text-xs font-semibold text-slate-600 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-slate-500 truncate">{s.role}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRoleStaffId(s.id);
                                    setEditingRoleValue(s.role);
                                    setStaffManageError(null);
                                  }}
                                  title="Click to edit this staff member's Role"
                                  className="text-[11px] font-semibold text-indigo-700 hover:underline cursor-pointer shrink-0"
                                >
                                  Edit Role ✎
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* Monthly Goal Editor per Staff */}
                            {isEditingGoal ? (
                              <div className="flex items-center gap-1 bg-amber-50 p-1 rounded border border-amber-300">
                                <input
                                  type="number"
                                  min={1}
                                  max={1000}
                                  value={editingGoalValue}
                                  onChange={(e) => setEditingGoalValue(Number(e.target.value))}
                                  className="w-16 px-2 py-0.5 text-xs font-mono-tabular font-bold border border-amber-400 rounded bg-white text-slate-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveStaffGoal(s.id)}
                                  className="px-2 py-0.5 text-xs font-semibold bg-emerald-600 text-white rounded cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingGoalStaffId(null)}
                                  className="px-1.5 py-0.5 text-xs font-semibold text-slate-600 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingGoalStaffId(s.id);
                                  setEditingGoalValue(s.monthlyGoal);
                                }}
                                title="Click to edit this staff member's Monthly Goal"
                                className="px-2.5 py-1 text-xs font-mono-tabular font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 rounded cursor-pointer"
                              >
                                Goal: {s.monthlyGoal} ✎
                              </button>
                            )}

                            {/* Login ID Editor / Reset per Staff */}
                            {isEditingId ? (
                              <div className="flex items-center gap-1 bg-indigo-50 p-1 rounded border border-indigo-300">
                                <input
                                  type="text"
                                  value={editingLoginIdValue}
                                  onChange={(e) =>
                                    setEditingLoginIdValue(e.target.value.toUpperCase())
                                  }
                                  className="w-20 px-2 py-0.5 text-xs font-mono-tabular font-bold border border-indigo-400 rounded bg-white text-slate-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditedLoginId(s.id)}
                                  className="px-2 py-0.5 text-xs font-semibold bg-emerald-600 text-white rounded cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStaffId(null)}
                                  className="px-1.5 py-0.5 text-xs font-semibold text-slate-600 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="font-mono-tabular text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-indigo-900 border border-slate-200">
                                  {s.staffLoginId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleInstantResetStaffId(s)}
                                  title="Generate a new random Staff ID for this staff member"
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded cursor-pointer"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Reset ID</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStaffId(s.id);
                                    setEditingLoginIdValue(s.staffLoginId);
                                    setStaffManageError(null);
                                  }}
                                  className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
                                >
                                  Edit ID
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {managerTab === 'signedInUsers' && (
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Currently Signed-In Users Across Workstations ({activeSessions.length})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Live list of all Staff and Manager sessions currently signed in. Updates
                      automatically when a user signs in or signs out.
                    </p>
                  </div>
                </div>

                {activeSessions.length === 0 ? (
                  <div className="py-6 text-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                    No active user sessions detected right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeSessions.map((act) => (
                      <div
                        key={act.sessionId}
                        className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-bold text-slate-900 text-sm truncate">
                              {act.displayName}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                act.role === 'manager'
                                  ? 'bg-amber-200 text-amber-950'
                                  : 'bg-indigo-100 text-indigo-900'
                              }`}
                            >
                              {act.role}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-slate-600 font-mono-tabular">
                            {act.role === 'staff' ? (
                              <>
                                ID: <strong className="text-slate-900">{act.loginIdentifier}</strong> ·{' '}
                              </>
                            ) : null}
                            Signed in at {act.signedInAt}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {managerTab === 'security' && (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form
                  onSubmit={handleChangePasswordSubmit}
                  className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Change Manager Unique Password</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Update the password required for Manager sign-in across all
                      workstations.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Manager Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPasswordInput}
                      onChange={(e) => {
                        setCurrentPasswordInput(e.target.value);
                        setPasswordFormError(null);
                      }}
                      placeholder="Enter current password..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Manager Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPasswordInput}
                        onChange={(e) => {
                          setNewPasswordInput(e.target.value);
                          setPasswordFormError(null);
                        }}
                        placeholder="At least 6 characters"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPasswordInput}
                        onChange={(e) => {
                          setConfirmPasswordInput(e.target.value);
                          setPasswordFormError(null);
                        }}
                        placeholder="Re-enter new password"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  {passwordFormError && (
                    <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                      {passwordFormError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="py-2.5 px-5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg cursor-pointer"
                  >
                    Update Manager Password
                  </button>
                </form>

                {/* Clear All Reward Data Card */}
                <div className="p-5 bg-rose-50/60 border border-rose-200 rounded-xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-sm font-bold text-rose-950 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Clear All Recorded Reward Entries</span>
                    </div>
                    <p className="text-xs text-rose-800 mt-1">
                      Permanently deletes all recorded guest reward entries across all workstations
                      and resets every staff member’s count to 0 while keeping staff accounts, Login
                      IDs, and monthly goals intact.
                    </p>
                  </div>

                  {!confirmClearAll ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setConfirmClearAll(true)}
                        className="py-2.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All Entries Across Workstations</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-white border border-rose-300 rounded-lg space-y-2.5">
                      <div className="text-xs font-bold text-rose-900">
                        Are you sure you want to wipe all reward entries from the database?
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClearAllEntries();
                            setConfirmClearAll(false);
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md cursor-pointer"
                        >
                          Yes, Wipe All Entries Now
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClearAll(false)}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 2: SIMPLE-TO-READ LEADERBOARD & DAILY COUNT PER MONTH */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold mb-1">
              <span>Manager-Verified Standings</span>
              <span aria-hidden="true">·</span>
              <span>{selectedMonthLabel}</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Staff Leaderboard (Approved Rewards Per Day in {selectedMonthLabel})</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search staff, RES-#, or 601599..."
                className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 w-60"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleSortClick('monthTotal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  sortMode === 'monthTotal'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sort by Month Total
              </button>
              <button
                type="button"
                onClick={() => handleSortClick('dayTotal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  sortMode === 'dayTotal'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sort by Day ({selectedDateIso.slice(5)})
              </button>
            </div>
          </div>
        </div>

        {/* TOP 3 PODIUM CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {topThreeChampions.map((champ, idx) => {
            const rank = idx + 1;
            const theme =
              rank === 1
                ? 'border-amber-400 bg-amber-50/50'
                : rank === 2
                ? 'border-indigo-300 bg-indigo-50/40'
                : 'border-teal-300 bg-teal-50/40';

            return (
              <div
                key={champ.id}
                onClick={() => setExpandedStaffId(champ.id)}
                className={`border-2 ${theme} rounded-xl p-5 cursor-pointer hover:shadow-xs transition-all`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-3">
                  <span className="text-slate-900">
                    {rank === 1
                      ? '1st Place · Gold Leader'
                      : rank === 2
                      ? '2nd Place · Silver'
                      : '3rd Place · Bronze'}
                  </span>
                  {session.role === 'manager' && (
                    <span className="font-mono-tabular text-slate-500">ID: {champ.staffLoginId}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: champ.avatarColor }}
                    >
                      {champ.staffName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{champ.staffName}</div>
                      <div className="text-xs text-slate-500">{champ.role}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono-tabular text-slate-900">
                      {champ.monthApprovedCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Approved in Month</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span>
                    Today ({selectedDateIso.slice(5)}):{' '}
                    <strong className="font-mono-tabular text-emerald-700">
                      {champ.dayApprovedCount} approved
                    </strong>
                  </span>
                  {champ.monthPendingCount > 0 ? (
                    <span className="text-amber-700 font-semibold font-mono-tabular">
                      {champ.monthPendingCount} awaiting approval
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">All verified</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CLEAN LEADERBOARD TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs font-semibold text-slate-600 bg-slate-50">
                <th className="py-3 pl-3 pr-2">Rank</th>
                {session.role === 'manager' && <th className="py-3 px-2">Staff ID</th>}
                <th className="py-3 pr-4">Staff Name</th>
                {visibleDays.map((dayNum) => (
                  <th
                    key={dayNum}
                    className={`py-3 px-2 text-center font-mono-tabular ${
                      dayNum === selectedDayNum ? 'bg-amber-100/80 text-amber-950 font-bold' : ''
                    }`}
                  >
                    Oct {dayNum}
                  </th>
                ))}
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSortClick('dayTotal')}
                    className="inline-flex items-center gap-1 hover:text-indigo-700 cursor-pointer"
                  >
                    <span>Today ({selectedDateIso.slice(5)})</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSortClick('monthTotal')}
                    className="inline-flex items-center gap-1 hover:text-indigo-700 cursor-pointer"
                  >
                    <span>Approved Month Total</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-right">Monthly Goal</th>
                <th className="py-3 px-3 text-right">Pending</th>
                <th className="py-3 pl-3 pr-3 text-right no-print">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredStaff.map((staff, idx) => {
                const isExpanded = expandedStaffId === staff.id;
                const isCurrentStaff =
                  session.role === 'staff' && session.staffId === staff.id;
                const isEditingRowGoal = editingGoalStaffId === staff.id;

                return (
                  <React.Fragment key={staff.id}>
                    <tr
                      onClick={() => setExpandedStaffId(isExpanded ? null : staff.id)}
                      className={`transition-colors cursor-pointer ${
                        isCurrentStaff
                          ? 'bg-indigo-50/70'
                          : isExpanded
                          ? 'bg-slate-50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 pl-3 pr-2 font-mono-tabular font-bold text-slate-700">
                        #{idx + 1}
                      </td>
                      {session.role === 'manager' && (
                        <td className="py-3.5 px-2 font-mono-tabular text-xs font-semibold text-slate-500">
                          {staff.staffLoginId}
                        </td>
                      )}
                      <td className="py-3.5 pr-4 font-semibold text-slate-900">
                        {staff.staffName}
                        {isCurrentStaff && (
                          <span className="ml-2 text-xs font-semibold text-indigo-700">
                            (Signed In)
                          </span>
                        )}
                      </td>

                      {visibleDays.map((dayNum) => {
                        const count = staff.dailyApprovedMap[dayNum] || 0;
                        const isSelected = dayNum === selectedDayNum;
                        return (
                          <td
                            key={dayNum}
                            className={`py-3.5 px-2 text-center font-mono-tabular text-xs ${
                              isSelected ? 'bg-amber-50/70 font-bold text-amber-950' : ''
                            }`}
                          >
                            {count > 0 ? (
                              <span className="inline-block w-6 py-0.5 rounded bg-indigo-50 text-indigo-900 font-bold">
                                {count}
                              </span>
                            ) : (
                              <span className="text-slate-300">0</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3.5 px-3 text-right font-mono-tabular font-semibold text-emerald-700">
                        {staff.dayApprovedCount}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono-tabular font-bold text-slate-900 text-base">
                        {staff.monthApprovedCount}
                      </td>

                      <td
                        className="py-3.5 px-3 text-right font-mono-tabular text-xs"
                        onClick={(e) => {
                          if (session.role === 'manager') e.stopPropagation();
                        }}
                      >
                        {session.role === 'manager' && isEditingRowGoal ? (
                          <div className="inline-flex items-center gap-1 justify-end">
                            <input
                              type="number"
                              min={1}
                              max={1000}
                              value={editingGoalValue}
                              onChange={(e) => setEditingGoalValue(Number(e.target.value))}
                              className="w-16 px-1.5 py-0.5 text-xs font-mono-tabular font-bold border border-indigo-500 rounded bg-white text-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveStaffGoal(staff.id)}
                              className="px-2 py-0.5 text-xs font-semibold bg-emerald-600 text-white rounded cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <span className="font-semibold text-slate-700">
                              {staff.monthApprovedCount}/{staff.monthlyGoal}
                            </span>
                            {session.role === 'manager' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingGoalStaffId(staff.id);
                                  setEditingGoalValue(staff.monthlyGoal);
                                }}
                                className="text-[11px] font-semibold text-indigo-700 hover:underline cursor-pointer no-print"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono-tabular text-xs">
                        {staff.monthPendingCount > 0 ? (
                          <span className="text-amber-700 font-semibold">
                            {staff.monthPendingCount} pending
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      <td className="py-3.5 pl-3 pr-3 text-right no-print">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedStaffId(isExpanded ? null : staff.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md cursor-pointer"
                        >
                          <span>View Numbers</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED LIST OF REWARDS NUMBERS & RESERVATION NUMBERS */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-slate-50 border-b border-slate-200"
                        >
                          <td colSpan={15} className="p-4">
                            <div className="bg-white border border-slate-200 rounded-lg p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                                <div className="text-xs font-semibold text-slate-800">
                                  Rewards Numbers Logged by {staff.staffName}
                                  {session.role === 'manager' ? ` (ID: ${staff.staffLoginId})` : ''} in{' '}
                                  {selectedMonthLabel}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Only Manager-Approved numbers count toward leaderboard rank
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto">
                                {staff.monthEntries.map((entry) => (
                                  <div
                                    key={entry.entryId}
                                    className={`p-2.5 border rounded-lg flex items-center justify-between text-xs ${
                                      entry.status === 'approved'
                                        ? 'border-slate-200 bg-white'
                                        : entry.status === 'pending'
                                        ? 'border-amber-300 bg-amber-50/60'
                                        : 'border-rose-200 bg-rose-50/40 opacity-75'
                                    }`}
                                  >
                                    <div>
                                      <div className="font-mono-tabular font-bold text-slate-900">
                                        {entry.rewardsNumber}
                                      </div>
                                      <div className="text-xs font-mono-tabular font-medium text-slate-700 mt-0.5">
                                        Res #: {entry.reservationNumber}
                                      </div>
                                      <div className="text-[11px] font-mono-tabular text-slate-500">
                                        {entry.dateIso} · {entry.timestamp}
                                      </div>
                                    </div>

                                    {entry.status === 'approved' ? (
                                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                        <UserCheck className="w-3.5 h-3.5" /> Approved
                                      </span>
                                    ) : entry.status === 'pending' ? (
                                      session.role === 'manager' ? (
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onManagerDecision(
                                                staff.id,
                                                entry.entryId,
                                                'approved'
                                              )
                                            }
                                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold cursor-pointer"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onManagerDecision(
                                                staff.id,
                                                entry.entryId,
                                                'rejected'
                                              )
                                            }
                                            className="px-2 py-1 bg-rose-100 text-rose-800 rounded text-[11px] font-semibold cursor-pointer"
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                                          <Clock className="w-3.5 h-3.5" /> Pending
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-[11px] font-semibold text-rose-700">
                                        Rejected
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
