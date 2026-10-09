/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import {
  AVAILABLE_MONTHS,
  INITIAL_MANAGER_PASSWORD,
  INITIAL_STAFF_RECORDS,
  RewardNumberEntry,
  StaffMemberRecord
} from './data/hotelLoyaltyData';
import {
  approveAllPendingEntriesInDb,
  clearAllRewardEntriesInDb,
  createRewardEntryInDb,
  createStaffMemberInDb,
  db,
  ensureOfficeSeeded,
  FirestoreActiveSessionDoc,
  FirestoreOfficeConfigDoc,
  FirestoreRewardEntryDoc,
  FirestoreStaffDoc,
  formatAurStaffId,
  handleFirestoreError,
  OperationType,
  registerActiveSessionInDb,
  removeActiveSessionInDb,
  updateActiveSessionIdentifierInDb,
  updateAllStaffMonthlyGoalsInDb,
  updateManagerPasswordInDb,
  updateRewardEntryStatusInDb,
  updateStaffLoginIdInDb,
  updateStaffMonthlyGoalInDb,
  updateStaffRoleInDb,
  WORKSPACE_ID
} from './services/firebaseClient';
import { AuthGatePage } from './components/AuthGatePage';
import { CustomizableTelemetryChart } from './components/CustomizableTelemetryChart';
import { AuthenticatedSession, EnrollerLeaderboard } from './components/EnrollerLeaderboard';
import { PdfReportDrawer } from './components/PdfReportDrawer';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileDown,
  LogOut,
  TrendingUp,
  Trophy
} from 'lucide-react';

export default function App() {
  const [staffDocs, setStaffDocs] = useState<FirestoreStaffDoc[]>(
    INITIAL_STAFF_RECORDS.map((s) => ({
      id: s.id,
      staffLoginId: s.staffLoginId,
      staffName: s.staffName,
      role: s.role,
      avatarColor: s.avatarColor,
      monthlyGoal: s.monthlyGoal,
      dailyGoal: s.dailyGoal,
      workspaceId: WORKSPACE_ID
    }))
  );
  const [rewardEntries, setRewardEntries] = useState<FirestoreRewardEntryDoc[]>([]);
  const [activeSessions, setActiveSessions] = useState<FirestoreActiveSessionDoc[]>([]);
  const [managerPassword, setManagerPassword] = useState<string>(INITIAL_MANAGER_PASSWORD);
  const [session, setSession] = useState<AuthenticatedSession | null>(null);
  const [workstationSessionId] = useState<string>(
    () => `SESS-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  );

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-10');
  const [selectedDateIso, setSelectedDateIso] = useState<string>('2026-10-08');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPdfDrawerOpen, setIsPdfDrawerOpen] = useState<boolean>(false);
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null);

  // Connect to shared Cloud Firestore backend for real-time multi-workstation sync
  useEffect(() => {
    let unsubConfig: (() => void) | undefined;
    let unsubStaff: (() => void) | undefined;
    let unsubEntries: (() => void) | undefined;
    let unsubSessions: (() => void) | undefined;

    ensureOfficeSeeded()
      .then(() => {
        // 1. Listen to Office Config (Manager Password)
        const configRef = doc(db, 'office_config', 'main');
        unsubConfig = onSnapshot(
          configRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as FirestoreOfficeConfigDoc;
              if (data.managerPassword) {
                setManagerPassword(data.managerPassword);
              }
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'office_config/main');
          }
        );

        // 2. Listen to Staff Roster across workstations
        const staffQuery = query(
          collection(db, 'staff_members'),
          where('workspaceId', '==', WORKSPACE_ID)
        );
        unsubStaff = onSnapshot(
          staffQuery,
          (snap) => {
            const loadedStaff: FirestoreStaffDoc[] = [];
            snap.forEach((d) => loadedStaff.push(d.data() as FirestoreStaffDoc));
            loadedStaff.sort((a, b) => a.id.localeCompare(b.id));
            if (loadedStaff.length > 0) {
              setStaffDocs(loadedStaff);
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, 'staff_members');
          }
        );

        // 3. Listen to Reward Entries across workstations
        const entriesQuery = query(
          collection(db, 'reward_entries'),
          where('workspaceId', '==', WORKSPACE_ID)
        );
        unsubEntries = onSnapshot(
          entriesQuery,
          (snap) => {
            const loadedEntries: FirestoreRewardEntryDoc[] = [];
            snap.forEach((d) => loadedEntries.push(d.data() as FirestoreRewardEntryDoc));
            loadedEntries.sort((a, b) => {
              if (b.dateIso !== a.dateIso) return b.dateIso.localeCompare(a.dateIso);
              return b.timestamp.localeCompare(a.timestamp);
            });
            setRewardEntries(loadedEntries);
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, 'reward_entries');
          }
        );

        // 4. Listen to Currently Signed-In Users across workstations
        const sessionsQuery = query(
          collection(db, 'active_sessions'),
          where('workspaceId', '==', WORKSPACE_ID)
        );
        unsubSessions = onSnapshot(
          sessionsQuery,
          (snap) => {
            const loadedSessions: FirestoreActiveSessionDoc[] = [];
            snap.forEach((d) => loadedSessions.push(d.data() as FirestoreActiveSessionDoc));
            setActiveSessions(loadedSessions);
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, 'active_sessions');
          }
        );
      })
      .catch((err) => {
        console.error('Initialization error:', err);
      });

    const handleBeforeUnload = () => {
      removeActiveSessionInDb(workstationSessionId).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (unsubConfig) unsubConfig();
      if (unsubStaff) unsubStaff();
      if (unsubEntries) unsubEntries();
      if (unsubSessions) unsubSessions();
    };
  }, [workstationSessionId]);

  // Combine staff documents + reward entry documents into StaffMemberRecord[]
  const staffRecords: StaffMemberRecord[] = staffDocs.map((s) => {
    const entriesForStaff: RewardNumberEntry[] = rewardEntries
      .filter((e) => e.staffId === s.id)
      .map((e) => ({
        entryId: e.entryId,
        reservationNumber: e.reservationNumber,
        rewardsNumber: e.rewardsNumber,
        dateIso: e.dateIso,
        timestamp: e.timestamp,
        status: e.status,
        reviewedBy: e.reviewedBy
      }));

    return {
      id: s.id,
      staffLoginId: s.staffLoginId,
      staffName: s.staffName,
      role: s.role,
      avatarColor: s.avatarColor,
      monthlyGoal: s.monthlyGoal,
      dailyGoal: s.dailyGoal,
      entries: entriesForStaff
    };
  });

  const handleSignOut = async () => {
    setSession(null);
    await removeActiveSessionInDb(workstationSessionId);
  };

  // Automatically return to the Auth page if the app is idle for 15 minutes
  useEffect(() => {
    if (!session) return;

    const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setSession(null);
        removeActiveSessionInDb(workstationSessionId).catch(() => {});
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click'
    ];
    activityEvents.forEach((evt) =>
      window.addEventListener(evt, resetIdleTimer, { passive: true })
    );
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [session, workstationSessionId]);

  // Full-Screen Auth Gate: No user can access the app until authenticated
  if (!session) {
    return (
      <AuthGatePage
        staffRecords={staffRecords}
        managerPassword={managerPassword}
        onAuthenticatedStaff={async (staff) => {
          setSession({
            role: 'staff',
            staffId: staff.id,
            staffName: staff.staffName,
            staffLoginId: staff.staffLoginId
          });
          await registerActiveSessionInDb(
            workstationSessionId,
            'staff',
            staff.id,
            staff.staffName,
            staff.staffLoginId
          );
        }}
        onAuthenticatedManager={async (email) => {
          setSession({ role: 'manager', email });
          await registerActiveSessionInDb(
            workstationSessionId,
            'manager',
            'MANAGER',
            'Manager',
            'MANAGER'
          );
        }}
      />
    );
  }

  const currentMonthMeta =
    AVAILABLE_MONTHS.find((m) => m.key === selectedMonthKey) || AVAILABLE_MONTHS[0];

  const handleMonthChange = (newMonthKey: string) => {
    setSelectedMonthKey(newMonthKey);
    if (newMonthKey === '2026-10') {
      setSelectedDateIso('2026-10-08');
    } else {
      setSelectedDateIso(`${newMonthKey}-28`);
    }
  };

  // Staff submits a new 16-digit Rewards Number with Reservation Number -> saved as 'pending' in Firestore
  const handleSubmitStaffRewardNumber = async (
    staffId: string,
    reservationNumber: string,
    rewardsNumber: string,
    dateIso: string
  ) => {
    const cleanNumber = rewardsNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cleanNumber)) return;

    // Global uniqueness safeguard across all non-rejected entries
    const alreadyExists = staffRecords.some((s) =>
      s.entries.some(
        (e) =>
          e.status !== 'rejected' &&
          e.rewardsNumber.replace(/\s+/g, '') === cleanNumber
      )
    );
    if (alreadyExists) return;

    const targetStaff = staffRecords.find((s) => s.id === staffId) || staffRecords[0];

    await createRewardEntryInDb(targetStaff.id, reservationNumber, cleanNumber, dateIso);

    if (dateIso.slice(0, 7) !== selectedMonthKey) {
      setSelectedMonthKey(dateIso.slice(0, 7));
    }

    setNoticeBanner(
      `Submitted Rewards # ${cleanNumber} (Reservation # ${reservationNumber}) under ${targetStaff.staffName}. Synced to all workstations — Pending Manager Approval.`
    );
    setTimeout(() => setNoticeBanner(null), 5000);
  };

  // Manager Approves or Rejects a single entry in Firestore
  const handleManagerDecision = async (
    _staffId: string,
    entryId: string,
    decision: 'approved' | 'rejected'
  ) => {
    await updateRewardEntryStatusInDb(entryId, decision);

    setNoticeBanner(
      decision === 'approved'
        ? 'Entry approved! Official leaderboard total updated across all workstations.'
        : 'Entry rejected by Manager and excluded from the leaderboard.'
    );
    setTimeout(() => setNoticeBanner(null), 4000);
  };

  // Manager Approves All Pending Entries in Firestore
  const handleManagerApproveAll = async () => {
    await approveAllPendingEntriesInDb(staffRecords);
    setNoticeBanner(
      'All pending staff rewards numbers have been approved by Manager across all workstations.'
    );
    setTimeout(() => setNoticeBanner(null), 4000);
  };

  // Manager Creates a New Staff Member & Assigns a Unique Login ID in Firestore
  const handleCreateStaffMember = async (
    staffName: string,
    staffLoginId: string,
    role: string,
    monthlyGoal: number
  ) => {
    await createStaffMemberInDb(
      staffName,
      staffLoginId,
      role,
      monthlyGoal,
      staffRecords.length
    );
    setNoticeBanner(
      `Created new staff member "${staffName}" with Login ID "${staffLoginId.toUpperCase()}". Synced to all workstations.`
    );
    setTimeout(() => setNoticeBanner(null), 5000);
  };

  // Manager or Staff Resets/Updates an Existing Staff Member's Login ID (with AUR- prefix) in Firestore
  const handleUpdateStaffLoginId = async (staffId: string, newLoginId: string) => {
    const cleanId = formatAurStaffId(newLoginId);
    const target = staffRecords.find((s) => s.id === staffId);
    await updateStaffLoginIdInDb(staffId, cleanId);

    if (session.role === 'staff' && session.staffId === staffId) {
      setSession({
        ...session,
        staffLoginId: cleanId
      });
      await updateActiveSessionIdentifierInDb(workstationSessionId, cleanId);
    }

    setNoticeBanner(
      `Staff Login ID for ${target?.staffName || 'staff member'} has been updated to "${cleanId}" across all workstations.`
    );
    setTimeout(() => setNoticeBanner(null), 5000);
  };

  // Manager Updates Role / Title for a Staff Member in Firestore
  const handleUpdateStaffRole = async (staffId: string, newRole: string) => {
    const target = staffRecords.find((s) => s.id === staffId);
    await updateStaffRoleInDb(staffId, newRole);
    setNoticeBanner(
      `Updated role for ${target?.staffName || 'staff member'} to "${newRole}" across all workstations.`
    );
    setTimeout(() => setNoticeBanner(null), 4000);
  };

  // Manager Updates Monthly Goal for a Single Staff Member in Firestore
  const handleUpdateStaffMonthlyGoal = async (staffId: string, newMonthlyGoal: number) => {
    const target = staffRecords.find((s) => s.id === staffId);
    await updateStaffMonthlyGoalInDb(staffId, newMonthlyGoal);
    setNoticeBanner(
      `Updated Monthly Goal for ${target?.staffName || 'staff member'} to ${newMonthlyGoal} across all workstations.`
    );
    setTimeout(() => setNoticeBanner(null), 4000);
  };

  // Manager Updates Monthly Goal for ALL Staff Members at Once in Firestore
  const handleUpdateAllStaffMonthlyGoals = async (newMonthlyGoal: number) => {
    await updateAllStaffMonthlyGoalsInDb(staffRecords, newMonthlyGoal);
    setNoticeBanner(
      `Updated Monthly Goal for all ${staffRecords.length} staff members to ${newMonthlyGoal} across all workstations.`
    );
    setTimeout(() => setNoticeBanner(null), 4000);
  };

  // Manager Updates Their Unique Password in Firestore
  const handleChangeManagerPassword = async (newPassword: string) => {
    await updateManagerPasswordInDb(newPassword);
    setNoticeBanner(
      'Manager password updated across all workstations! Use your new password next time you sign in.'
    );
    setTimeout(() => setNoticeBanner(null), 5000);
  };

  // Manager Clears All Reward Entries in Firestore
  const handleClearAllEntries = async () => {
    await clearAllRewardEntriesInDb();
    setNoticeBanner(
      'All recorded reward entries have been cleared across all workstations. Every staff member is now at 0.'
    );
    setTimeout(() => setNoticeBanner(null), 5000);
  };

  // Summary Metrics (Strictly Approved vs Pending)
  const totalMonthApproved = staffRecords.reduce(
    (sum, s) =>
      sum +
      s.entries.filter(
        (e) => e.dateIso.startsWith(selectedMonthKey) && e.status === 'approved'
      ).length,
    0
  );

  const totalDayApproved = staffRecords.reduce(
    (sum, s) =>
      sum +
      s.entries.filter(
        (e) => e.dateIso === selectedDateIso && e.status === 'approved'
      ).length,
    0
  );

  const totalPendingCount = staffRecords.reduce(
    (sum, s) => sum + s.entries.filter((e) => e.status === 'pending').length,
    0
  );

  const rankedByMonth = [...staffRecords]
    .map((s) => ({
      ...s,
      monthCount: s.entries.filter(
        (e) => e.dateIso.startsWith(selectedMonthKey) && e.status === 'approved'
      ).length,
      dayCount: s.entries.filter(
        (e) => e.dateIso === selectedDateIso && e.status === 'approved'
      ).length
    }))
    .sort((a, b) =>
      b.monthCount !== a.monthCount ? b.monthCount - a.monthCount : b.dayCount - a.dayCount
    );

  const topLeader = rankedByMonth[0] || {
    staffName: '—',
    staffLoginId: '—',
    monthCount: 0,
    dayCount: 0
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      {/* Clean Top Bar Contract */}
      <header className="bg-slate-950 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 no-print">
        <a
          href="#top"
          onClick={(e) => e.preventDefault()}
          className="text-xl font-semibold tracking-tight text-amber-400 font-display whitespace-nowrap"
        >
          Kimono
        </a>

        <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
          <span>
            Signed In:{' '}
            <strong className="text-white">
              {session.role === 'staff' ? session.staffName : 'Manager'}
            </strong>
          </span>
          <span>·</span>
          <span>
            Pending Manager Approval:{' '}
            <strong className="text-amber-400 font-mono-tabular">
              {totalPendingCount}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonthKey}
            onChange={(e) => handleMonthChange(e.target.value)}
            aria-label="Select Month"
            className="px-3 py-2 text-xs font-semibold bg-slate-800 text-amber-300 border border-slate-700 rounded-lg focus:outline-none cursor-pointer"
          >
            {AVAILABLE_MONTHS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsPdfDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock / Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-6 py-8 space-y-8">
        <AnimatePresence>
          {noticeBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-950 text-white px-5 py-3.5 rounded-xl flex items-center justify-between text-xs border border-emerald-700 shadow-xs no-print"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{noticeBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setNoticeBanner(null)}
                className="text-emerald-200 hover:text-white underline ml-4 cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simple, Easy-to-Read 4-Card Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>#1 Approved Monthly Leader</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {totalMonthApproved > 0 ? topLeader.staffName : 'No Approved Entries Yet'}
              </span>
              <span className="text-lg font-mono-tabular font-bold text-amber-700">
                {topLeader.monthCount}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500 font-mono-tabular">
              {totalMonthApproved > 0
                ? session.role === 'manager'
                  ? `ID: ${topLeader.staffLoginId} · +${topLeader.dayCount} on ${selectedDateIso}`
                  : `+${topLeader.dayCount} approved on ${selectedDateIso}`
                : 'Cleared to 0 · Ready for new entries'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Approved in {currentMonthMeta.label}</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono-tabular">
                {totalMonthApproved}
              </span>
              <span className="text-xs text-slate-500">verified rewards</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Across all {staffRecords.length} front desk staff
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Approved on {selectedDateIso}</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono-tabular">
                {totalDayApproved}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">daily approved</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Verified for selected date
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-amber-300 shadow-xs">
            <div className="flex items-center justify-between text-xs text-amber-900 font-semibold">
              <span>Awaiting Manager Approval</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-800 font-mono-tabular">
                {totalPendingCount}
              </span>
              <span className="text-xs text-amber-800 font-medium">
                Pending Review
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Must be approved to count on leaderboard
            </div>
          </div>
        </section>

        {/* Workspace + Leaderboard */}
        <EnrollerLeaderboard
          staffRecords={staffRecords}
          session={session}
          onLogout={handleSignOut}
          selectedMonthKey={selectedMonthKey}
          selectedMonthLabel={currentMonthMeta.label}
          daysInMonth={currentMonthMeta.daysInMonth}
          selectedDateIso={selectedDateIso}
          onSelectDateIso={setSelectedDateIso}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSubmitStaffRewardNumber={handleSubmitStaffRewardNumber}
          onManagerDecision={handleManagerDecision}
          onManagerApproveAll={handleManagerApproveAll}
          onCreateStaffMember={handleCreateStaffMember}
          onUpdateStaffLoginId={handleUpdateStaffLoginId}
          onUpdateStaffRole={handleUpdateStaffRole}
          onUpdateStaffMonthlyGoal={handleUpdateStaffMonthlyGoal}
          onUpdateAllStaffMonthlyGoals={handleUpdateAllStaffMonthlyGoals}
          managerPassword={managerPassword}
          onChangeManagerPassword={handleChangeManagerPassword}
          onClearAllEntries={handleClearAllEntries}
          activeSessions={activeSessions}
        />

        {/* Visual Bar & Daily Trend Chart */}
        <CustomizableTelemetryChart
          staffRecords={staffRecords}
          monthKey={selectedMonthKey}
          monthLabel={currentMonthMeta.label}
          daysInMonth={currentMonthMeta.daysInMonth}
          selectedDateIso={selectedDateIso}
        />
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-12 text-xs text-slate-500">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Kimono · Manager Approval Required for All Entries
          </span>
          <button
            type="button"
            onClick={() => setIsPdfDrawerOpen(true)}
            className="hover:text-slate-900 underline no-print cursor-pointer"
          >
            Download Approved PDF Report
          </button>
        </div>
      </footer>

      <PdfReportDrawer
        isOpen={isPdfDrawerOpen}
        onClose={() => setIsPdfDrawerOpen(false)}
        monthKey={selectedMonthKey}
        monthLabel={currentMonthMeta.label}
        selectedDateIso={selectedDateIso}
        staffRecords={staffRecords}
        onExportComplete={(filename) => {
          setNoticeBanner(`Downloaded Approved Leaderboard PDF (${filename}).`);
          setTimeout(() => setNoticeBanner(null), 5000);
        }}
      />
    </div>
  );
}
