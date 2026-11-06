import React, { useMemo, useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  X
} from 'lucide-react';
import {
  getWeekRangeMeta,
  StaffMemberRecord,
  WeekRangeMeta
} from '../data/hotelLoyaltyData';
import { Staff3DAvatar } from './Staff3DAvatar';

interface RankingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffRecords: StaffMemberRecord[];
  selectedDateIso: string;
  selectedMonthKey: string;
  selectedMonthLabel: string;
}

export const RankingReportModal: React.FC<RankingReportModalProps> = ({
  isOpen,
  onClose,
  staffRecords,
  selectedDateIso,
  selectedMonthKey,
  selectedMonthLabel
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const weekRange: WeekRangeMeta = useMemo(() => {
    return getWeekRangeMeta(selectedDateIso);
  }, [selectedDateIso]);

  // Compute daily stats for each staff member
  const dailyRanking = useMemo(() => {
    return staffRecords
      .map((staff) => {
        const approvedToday = staff.entries.filter(
          (e) => e.dateIso === selectedDateIso && e.status === 'approved'
        );
        const pendingToday = staff.entries.filter(
          (e) => e.dateIso === selectedDateIso && e.status === 'pending'
        );
        const goal = staff.dailyGoal || 2;
        const attainmentPct = Math.round((approvedToday.length / goal) * 100);

        return {
          ...staff,
          dayApprovedCount: approvedToday.length,
          dayPendingCount: pendingToday.length,
          dailyGoal: goal,
          attainmentPct,
          lastEntryTime: approvedToday[approvedToday.length - 1]?.timestamp || '—'
        };
      })
      .sort((a, b) => {
        if (b.dayApprovedCount !== a.dayApprovedCount) {
          return b.dayApprovedCount - a.dayApprovedCount;
        }
        return b.attainmentPct - a.attainmentPct;
      });
  }, [staffRecords, selectedDateIso]);

  // Compute weekly stats for each staff member
  const weeklyRanking = useMemo(() => {
    return staffRecords
      .map((staff) => {
        const approvedInWeek = staff.entries.filter(
          (e) => weekRange.days.includes(e.dateIso) && e.status === 'approved'
        );
        const pendingInWeek = staff.entries.filter(
          (e) => weekRange.days.includes(e.dateIso) && e.status === 'pending'
        );

        // Daily breakdown across the 7 days of the week
        const dayCounts: Record<string, number> = {};
        weekRange.days.forEach((dayIso) => {
          dayCounts[dayIso] = staff.entries.filter(
            (e) => e.dateIso === dayIso && e.status === 'approved'
          ).length;
        });

        // Weekly target: 6 days * dailyGoal or ~1/4 of monthlyGoal
        const weeklyTarget = Math.max(
          1,
          Math.round(staff.monthlyGoal / 4) || (staff.dailyGoal || 2) * 6
        );
        const attainmentPct = Math.round((approvedInWeek.length / weeklyTarget) * 100);

        return {
          ...staff,
          weekApprovedCount: approvedInWeek.length,
          weekPendingCount: pendingInWeek.length,
          weeklyTarget,
          attainmentPct,
          dayCounts
        };
      })
      .sort((a, b) => {
        if (b.weekApprovedCount !== a.weekApprovedCount) {
          return b.weekApprovedCount - a.weekApprovedCount;
        }
        return b.attainmentPct - a.attainmentPct;
      });
  }, [staffRecords, weekRange]);

  // Aggregates
  const totalDailyApproved = dailyRanking.reduce((sum, s) => sum + s.dayApprovedCount, 0);
  const totalDailyTarget = dailyRanking.reduce((sum, s) => sum + s.dailyGoal, 0);
  const topDailyPerformer = dailyRanking[0];

  const totalWeeklyApproved = weeklyRanking.reduce((sum, s) => sum + s.weekApprovedCount, 0);
  const totalWeeklyTarget = weeklyRanking.reduce((sum, s) => sum + s.weeklyTarget, 0);
  const topWeeklyPerformer = weeklyRanking[0];

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Official Staff Ranking Report
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Kimono Front Desk Loyalty Program
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-950 mt-1 tracking-tight">
              Front Desk Staff Ranking & Performance Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified daily and weekly front desk guest reward enrollments for shift audits and team briefings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Daily vs Weekly Report */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Ranking Report ({selectedDateIso})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'weekly'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Weekly Ranking Report ({weekRange.shortLabel})</span>
          </button>
        </div>

        {/* TAB 1: DAILY RANKING REPORT */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            {/* Daily Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-4 rounded-xl border border-indigo-900 shadow-xs">
                <div className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                  Today&apos;s Verified Rewards
                </div>
                <div className="text-3xl font-extrabold font-mono-tabular text-amber-400 mt-1">
                  {totalDailyApproved}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Date: {selectedDateIso}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Team Daily Goal
                </div>
                <div className="text-3xl font-extrabold font-mono-tabular text-slate-900 mt-1">
                  {totalDailyTarget}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Pace:{' '}
                  <strong className="text-emerald-700">
                    {Math.round((totalDailyApproved / (totalDailyTarget || 1)) * 100)}%
                  </strong>{' '}
                  attainment
                </div>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-xs sm:col-span-2 flex items-center gap-4">
                <Staff3DAvatar
                  avatarId={topDailyPerformer?.avatarId}
                  avatarColor={topDailyPerformer?.avatarColor}
                  staffName={topDailyPerformer?.staffName}
                  size="lg"
                  withRing={true}
                  ringTier="gold"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                      Top Daily Champion
                    </span>
                    <span className="text-xs text-amber-800 font-semibold font-mono-tabular">
                      {topDailyPerformer?.dayApprovedCount || 0} approved
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-950 mt-0.5">
                    {topDailyPerformer?.staffName || '—'}
                  </div>
                  <div className="text-xs text-slate-600">
                    {topDailyPerformer?.role} · Goal: {topDailyPerformer?.dailyGoal}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Ranking Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Daily Staff Rankings for {selectedDateIso}
                </div>
                <span className="text-xs text-slate-300">
                  All {staffRecords.length} Staff Members Listed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-3">Avatar & Staff</th>
                      <th className="py-3 px-3">Role & ID</th>
                      <th className="py-3 px-3 text-right">Today Approved</th>
                      <th className="py-3 px-3 text-right">Daily Goal</th>
                      <th className="py-3 px-3 text-right">Attainment %</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyRanking.map((staff, idx) => {
                      const rank = idx + 1;
                      const isTop3 = rank <= 3;
                      const ringTier =
                        rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'none';

                      return (
                        <tr
                          key={staff.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            rank === 1 ? 'bg-amber-50/30 font-medium' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shadow-xs ${
                                rank === 1
                                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                                  : rank === 2
                                  ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200'
                                  : rank === 3
                                  ? 'bg-orange-300 text-orange-950 ring-2 ring-orange-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {rank}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <Staff3DAvatar
                                avatarId={staff.avatarId}
                                avatarColor={staff.avatarColor}
                                staffName={staff.staffName}
                                size="sm"
                                withRing={isTop3}
                                ringTier={ringTier}
                              />
                              <div>
                                <span className="font-bold text-slate-900 text-sm">
                                  {staff.staffName}
                                </span>
                                {rank === 1 && (
                                  <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                    Day Leader
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-slate-600">{staff.role}</div>
                            <div className="font-mono-tabular text-[11px] text-slate-400">
                              {staff.staffLoginId}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-base font-bold font-mono-tabular text-slate-900">
                              {staff.dayApprovedCount}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono-tabular text-slate-500">
                            {staff.dailyGoal}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    staff.attainmentPct >= 100
                                      ? 'bg-emerald-500'
                                      : staff.attainmentPct >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-indigo-400'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, staff.attainmentPct)}%`
                                  }}
                                />
                              </div>
                              <span className="font-mono-tabular font-bold text-slate-700">
                                {staff.attainmentPct}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {staff.dayApprovedCount >= staff.dailyGoal ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Goal Met</span>
                              </span>
                            ) : staff.dayApprovedCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>In Progress</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                <span>Pending</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEEKLY RANKING REPORT */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            {/* Weekly Header Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-4 rounded-xl border border-indigo-900 shadow-xs">
                <div className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                  Weekly Verified Rewards
                </div>
                <div className="text-3xl font-extrabold font-mono-tabular text-amber-400 mt-1">
                  {totalWeeklyApproved}
                </div>
                <div className="text-[11px] text-slate-300 mt-1 truncate">
                  {weekRange.label}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Team Weekly Target
                </div>
                <div className="text-3xl font-extrabold font-mono-tabular text-slate-900 mt-1">
                  {totalWeeklyTarget}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Attainment:{' '}
                  <strong className="text-emerald-700">
                    {Math.round((totalWeeklyApproved / (totalWeeklyTarget || 1)) * 100)}%
                  </strong>
                </div>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-xs sm:col-span-2 flex items-center gap-4">
                <Staff3DAvatar
                  avatarId={topWeeklyPerformer?.avatarId}
                  avatarColor={topWeeklyPerformer?.avatarColor}
                  staffName={topWeeklyPerformer?.staffName}
                  size="lg"
                  withRing={true}
                  ringTier="gold"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                      Weekly Champion ({weekRange.shortLabel})
                    </span>
                    <span className="text-xs text-amber-800 font-semibold font-mono-tabular">
                      {topWeeklyPerformer?.weekApprovedCount || 0} verified
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-950 mt-0.5">
                    {topWeeklyPerformer?.staffName || '—'}
                  </div>
                  <div className="text-xs text-slate-600">
                    {topWeeklyPerformer?.role} · Target: {topWeeklyPerformer?.weeklyTarget}
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Detailed Table with 7-Day Matrix */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Weekly Staff Rankings & 7-Day Activity Matrix
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {weekRange.label} ({weekRange.shortLabel})
                  </div>
                </div>
                <span className="text-xs text-slate-300">
                  Daily Columns: Mon through Sun
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-3 text-center">Rank</th>
                      <th className="py-3 px-3">Avatar & Staff</th>
                      {weekRange.days.map((dayIso) => {
                        const dayNum = parseInt(dayIso.slice(8, 10), 10);
                        const [y, m, d] = dayIso.split('-').map(Number);
                        const dt = new Date(y, m - 1, d);
                        const dayShort = dt.toLocaleString('en-US', { weekday: 'short' });
                        const isSelected = dayIso === selectedDateIso;

                        return (
                          <th
                            key={dayIso}
                            className={`py-2 px-2 text-center font-mono-tabular ${
                              isSelected
                                ? 'bg-amber-100 text-amber-950 font-bold'
                                : 'text-slate-600'
                            }`}
                          >
                            <div className="text-[10px] text-slate-400 uppercase">{dayShort}</div>
                            <div>{dayNum}</div>
                          </th>
                        );
                      })}
                      <th className="py-3 px-3 text-right">Week Total</th>
                      <th className="py-3 px-3 text-right">Target</th>
                      <th className="py-3 px-3 text-right">Attainment %</th>
                      <th className="py-3 px-3 text-center">Pace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weeklyRanking.map((staff, idx) => {
                      const rank = idx + 1;
                      const isTop3 = rank <= 3;
                      const ringTier =
                        rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'none';

                      return (
                        <tr
                          key={staff.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            rank === 1 ? 'bg-amber-50/30 font-medium' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                rank === 1
                                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                                  : rank === 2
                                  ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200'
                                  : rank === 3
                                  ? 'bg-orange-300 text-orange-950 ring-2 ring-orange-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {rank}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <Staff3DAvatar
                                avatarId={staff.avatarId}
                                avatarColor={staff.avatarColor}
                                staffName={staff.staffName}
                                size="sm"
                                withRing={isTop3}
                                ringTier={ringTier}
                              />
                              <div>
                                <span className="font-bold text-slate-900">{staff.staffName}</span>
                                <div className="text-[10px] text-slate-500 font-mono-tabular">
                                  {staff.staffLoginId}
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* 7 Day Breakdown Columns */}
                          {weekRange.days.map((dayIso) => {
                            const count = staff.dayCounts[dayIso] || 0;
                            const isSelected = dayIso === selectedDateIso;
                            return (
                              <td
                                key={dayIso}
                                className={`py-3 px-2 text-center font-mono-tabular ${
                                  isSelected ? 'bg-amber-50/60 font-bold' : ''
                                }`}
                              >
                                {count > 0 ? (
                                  <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                                    {count}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">0</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-3 px-3 text-right">
                            <span className="text-base font-bold font-mono-tabular text-slate-900">
                              {staff.weekApprovedCount}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono-tabular text-slate-500">
                            {staff.weeklyTarget}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="font-mono-tabular font-bold text-slate-800">
                              {staff.attainmentPct}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {staff.attainmentPct >= 100 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Exceeded
                              </span>
                            ) : staff.attainmentPct >= 60 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                On Track
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                In Progress
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Month Reference: <strong>{selectedMonthLabel}</strong> · Kimono Loyalty System
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
