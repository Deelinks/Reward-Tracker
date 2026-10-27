import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Target,
  Calendar,
  Award,
  Zap,
  RotateCcw,
  CheckCircle2,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUpRight,
  Flame,
  Clock
} from 'lucide-react';
import { StaffMemberRecord } from '../data/hotelLoyaltyData';

interface CustomizableTelemetryChartProps {
  staffRecords: StaffMemberRecord[];
  monthKey: string;
  monthLabel: string;
  daysInMonth: number;
  selectedDateIso: string;
}

type MainChartTab = 'overallProgress' | 'yearTrajectory' | 'staffBar' | 'dailyTrend';
type ScopeFilter = 'both' | 'monthOnly' | 'yearOnly';

export const CustomizableTelemetryChart: React.FC<CustomizableTelemetryChartProps> = ({
  staffRecords,
  monthKey,
  monthLabel,
  daysInMonth,
  selectedDateIso
}) => {
  const [activeTab, setActiveTab] = useState<MainChartTab>('overallProgress');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('both');
  const [focusedStaffId, setFocusedStaffId] = useState<string | 'ALL'>('ALL');
  const [animationCycle, setAnimationCycle] = useState<number>(0);

  // Extract year and month index
  const yearStr = monthKey.split('-')[0] || '2026';
  const currentMonthNum = parseInt(monthKey.split('-')[1] || '10', 10);
  const currentDayNum = Math.max(1, parseInt(selectedDateIso.split('-')[2] || '1', 10));

  // Team Quota Targets
  const teamMonthlyGoal = useMemo(() => {
    const sum = staffRecords.reduce((acc, s) => acc + (s.monthlyGoal || 35), 0);
    return sum > 0 ? sum : 385; // Fallback standard team quota (~35 x 11 staff)
  }, [staffRecords]);

  const teamAnnualGoal = teamMonthlyGoal * 12;

  // Month Metrics Calculation
  const { monthApprovedCount, monthPendingCount, monthPct, daysRemaining, dailyActualVelocity, dailyRequiredRunRate, projectedMonthEnd } = useMemo(() => {
    let approved = 0;
    let pending = 0;

    for (const staff of staffRecords) {
      for (const entry of staff.entries) {
        if (entry.dateIso.startsWith(monthKey)) {
          if (entry.status === 'approved') approved++;
          else if (entry.status === 'pending') pending++;
        }
      }
    }

    const pct = teamMonthlyGoal > 0 ? Math.round((approved / teamMonthlyGoal) * 100) : 0;
    const remainingDays = Math.max(0, daysInMonth - currentDayNum);
    const actualVel = currentDayNum > 0 ? (approved / currentDayNum).toFixed(1) : '0.0';
    const needed = teamMonthlyGoal - approved;
    const reqRunRate = remainingDays > 0 && needed > 0 ? (needed / remainingDays).toFixed(1) : '0.0';
    const projected = Math.round(approved + (parseFloat(actualVel) * remainingDays));

    return {
      monthApprovedCount: approved,
      monthPendingCount: pending,
      monthPct: pct,
      daysRemaining: remainingDays,
      dailyActualVelocity: actualVel,
      dailyRequiredRunRate: reqRunRate,
      projectedMonthEnd: projected
    };
  }, [staffRecords, monthKey, teamMonthlyGoal, daysInMonth, currentDayNum]);

  // Year Metrics Calculation
  const { yearApprovedCount, yearPendingCount, yearPct, projectedYearEnd } = useMemo(() => {
    let approved = 0;
    let pending = 0;

    for (const staff of staffRecords) {
      for (const entry of staff.entries) {
        if (entry.dateIso.startsWith(yearStr)) {
          if (entry.status === 'approved') approved++;
          else if (entry.status === 'pending') pending++;
        }
      }
    }

    const pct = teamAnnualGoal > 0 ? Math.round((approved / teamAnnualGoal) * 100) : 0;
    // Projection based on months elapsed so far
    const elapsedMonths = Math.max(1, currentMonthNum);
    const avgPerMonth = approved / elapsedMonths;
    const projectedYear = Math.round(avgPerMonth * 12);

    return {
      yearApprovedCount: approved,
      yearPendingCount: pending,
      yearPct: pct,
      projectedYearEnd: projectedYear
    };
  }, [staffRecords, yearStr, teamAnnualGoal, currentMonthNum]);

  // 12-Month Annual Breakdown Data
  const monthNames = [
    { key: `${yearStr}-01`, short: 'Jan', full: 'January', days: 31, quarter: 'Q1' },
    { key: `${yearStr}-02`, short: 'Feb', full: 'February', days: 28, quarter: 'Q1' },
    { key: `${yearStr}-03`, short: 'Mar', full: 'March', days: 31, quarter: 'Q1' },
    { key: `${yearStr}-04`, short: 'Apr', full: 'April', days: 30, quarter: 'Q2' },
    { key: `${yearStr}-05`, short: 'May', full: 'May', days: 31, quarter: 'Q2' },
    { key: `${yearStr}-06`, short: 'Jun', full: 'June', days: 30, quarter: 'Q2' },
    { key: `${yearStr}-07`, short: 'Jul', full: 'July', days: 31, quarter: 'Q3' },
    { key: `${yearStr}-08`, short: 'Aug', full: 'August', days: 31, quarter: 'Q3' },
    { key: `${yearStr}-09`, short: 'Sep', full: 'September', days: 30, quarter: 'Q3' },
    { key: `${yearStr}-10`, short: 'Oct', full: 'October', days: 31, quarter: 'Q4' },
    { key: `${yearStr}-11`, short: 'Nov', full: 'November', days: 30, quarter: 'Q4' },
    { key: `${yearStr}-12`, short: 'Dec', full: 'December', days: 31, quarter: 'Q4' }
  ];

  const annualMonthlySeries = useMemo(() => {
    let runningCumulative = 0;
    return monthNames.map((m, idx) => {
      let approved = 0;
      let pending = 0;
      for (const s of staffRecords) {
        for (const e of s.entries) {
          if (e.dateIso.startsWith(m.key)) {
            if (e.status === 'approved') approved++;
            else if (e.status === 'pending') pending++;
          }
        }
      }
      runningCumulative += approved;
      const isSelectedMonth = m.key === monthKey;
      const isPastOrCurrent = idx + 1 <= currentMonthNum;
      const pctOfMonthlyGoal = teamMonthlyGoal > 0 ? Math.round((approved / teamMonthlyGoal) * 100) : 0;

      return {
        ...m,
        approved,
        pending,
        cumulativeApproved: runningCumulative,
        isSelectedMonth,
        isPastOrCurrent,
        pctOfMonthlyGoal
      };
    });
  }, [staffRecords, monthKey, currentMonthNum, teamMonthlyGoal, yearStr]);

  const maxAnnualMonthCount = useMemo(() => {
    const counts = annualMonthlySeries.map((m) => m.approved);
    return Math.max(...counts, teamMonthlyGoal, 50);
  }, [annualMonthlySeries, teamMonthlyGoal]);

  // Staff Rankings Data for Staff Bar Tab
  const staffTotals = useMemo(() => {
    return [...staffRecords]
      .map((s) => {
        const approvedMonthCount = s.entries.filter(
          (e) => e.dateIso.startsWith(monthKey) && e.status === 'approved'
        ).length;
        const pendingMonthCount = s.entries.filter(
          (e) => e.dateIso.startsWith(monthKey) && e.status === 'pending'
        ).length;
        const approvedDayCount = s.entries.filter(
          (e) => e.dateIso === selectedDateIso && e.status === 'approved'
        ).length;
        const approvedYearCount = s.entries.filter(
          (e) => e.dateIso.startsWith(yearStr) && e.status === 'approved'
        ).length;

        return {
          ...s,
          monthCount: approvedMonthCount,
          pendingCount: pendingMonthCount,
          dayCount: approvedDayCount,
          yearCount: approvedYearCount
        };
      })
      .sort((a, b) => b.monthCount - a.monthCount);
  }, [staffRecords, monthKey, selectedDateIso, yearStr]);

  const maxStaffCount = useMemo(() => {
    return Math.max(
      ...staffTotals.map((s) => Math.max(s.monthCount + s.pendingCount, s.monthlyGoal)),
      10
    );
  }, [staffTotals]);

  // Daily Trend Data for Selected Month
  const activeDayRange = monthKey === '2026-10' ? 10 : daysInMonth;
  const dailySeries = useMemo(() => {
    return Array.from({ length: activeDayRange }, (_, idx) => {
      const dayNum = idx + 1;
      const dayStr = String(dayNum).padStart(2, '0');
      const dateIso = `${monthKey}-${dayStr}`;
      const count = staffRecords.reduce((sum, s) => {
        if (focusedStaffId !== 'ALL' && s.id !== focusedStaffId) return sum;
        return (
          sum +
          s.entries.filter((e) => e.dateIso === dateIso && e.status === 'approved').length
        );
      }, 0);
      return { dayNum, dateIso, label: `${monthLabel.slice(0, 3)} ${dayNum}`, count };
    });
  }, [activeDayRange, monthKey, staffRecords, focusedStaffId, monthLabel]);

  const maxDailyCount = useMemo(() => {
    return Math.max(...dailySeries.map((d) => d.count), 8);
  }, [dailySeries]);

  // SVG Circular Gauge Constants
  const circleRadius = 56;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const monthStrokeDashoffset = circleCircumference - (Math.min(monthPct, 100) / 100) * circleCircumference;
  const yearStrokeDashoffset = circleCircumference - (Math.min(yearPct, 100) / 100) * circleCircumference;

  const triggerReplay = () => {
    setAnimationCycle((prev) => prev + 1);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      {/* Top Header & Navigation Segmented Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold mb-1">
            <span>Overall Loyalty Progress Analytics</span>
            <span aria-hidden="true">·</span>
            <span>{monthLabel} &amp; Year {yearStr}</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Performance Telemetry &amp; Animated Quota Tracker
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          {/* Main View Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('overallProgress')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'overallProgress'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Month &amp; Year Progress</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('yearTrajectory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'yearTrajectory'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Annual 12-Mo Trajectory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('staffBar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'staffBar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Rankings
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dailyTrend')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'dailyTrend'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Daily Velocity</span>
            </button>
          </div>

          {/* Quick Replay Animation Button */}
          <button
            type="button"
            onClick={triggerReplay}
            title="Replay visual animation"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Replay</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERALL MONTH & YEAR PROGRESS */}
      {activeTab === 'overallProgress' && (
        <div key={`overall-${animationCycle}`} className="mt-6 space-y-6">
          {/* Sub-view filter: Month / Year / Both */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span>View Mode:</span>
              <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
                <button
                  type="button"
                  onClick={() => setScopeFilter('both')}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                    scopeFilter === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Side-by-Side Dual View
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('monthOnly')}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                    scopeFilter === 'monthOnly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Month Focus
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('yearOnly')}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                    scopeFilter === 'yearOnly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Year Focus
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-tabular">
              <span>Team Quota: <strong className="text-slate-900">{teamMonthlyGoal}</strong> / mo</span>
              <span aria-hidden="true">·</span>
              <span>Annual Quota: <strong className="text-slate-900">{teamAnnualGoal}</strong> / yr</span>
            </div>
          </div>

          {/* DUAL GAUGES: MONTH & YEAR */}
          <div className={`grid gap-6 ${scopeFilter === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* MONTH CARD */}
            {(scopeFilter === 'both' || scopeFilter === 'monthOnly') && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/60 border border-indigo-100 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {monthLabel} Performance
                      </h3>
                      <p className="text-xs text-slate-500">
                        Day {currentDayNum} of {daysInMonth} · {daysRemaining} days remaining
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wider font-semibold text-indigo-700">
                      Monthly Quota
                    </span>
                    <div className="text-lg font-bold font-mono-tabular text-slate-900">
                      {monthApprovedCount} / {teamMonthlyGoal}
                    </div>
                  </div>
                </div>

                {/* Animated Radial Dial & Core KPIs */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
                  {/* SVG Animated Circular Ring */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r={circleRadius}
                        stroke="#e2e8f0"
                        strokeWidth="11"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="70"
                        cy="70"
                        r={circleRadius}
                        stroke="#4f46e5"
                        strokeWidth="11"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={circleCircumference}
                        strokeLinecap="round"
                        fill="transparent"
                        initial={{ strokeDashoffset: circleCircumference }}
                        animate={{ strokeDashoffset: monthStrokeDashoffset }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="text-3xl font-extrabold font-mono-tabular text-indigo-900"
                      >
                        {monthPct}%
                      </motion.span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Month Pacing & Breakdown Cards */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block mb-0.5">Approved Rewards</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-base font-bold font-mono-tabular text-slate-900">
                            {monthApprovedCount}
                          </strong>
                          {monthPendingCount > 0 && (
                            <span className="text-amber-700 font-semibold font-mono-tabular">
                              (+{monthPendingCount} pending)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block mb-0.5">Current Velocity</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-base font-bold font-mono-tabular text-indigo-600">
                            {dailyActualVelocity}
                          </strong>
                          <span className="text-[11px] text-slate-500">/ day avg</span>
                        </div>
                      </div>

                      <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block mb-0.5">Target Run-Rate</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-base font-bold font-mono-tabular text-slate-900">
                            {dailyRequiredRunRate}
                          </strong>
                          <span className="text-[11px] text-slate-500">/ day needed</span>
                        </div>
                      </div>

                      <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block mb-0.5">Projected Finish</span>
                        <div className="flex items-baseline gap-1">
                          <strong className={`text-base font-bold font-mono-tabular ${projectedMonthEnd >= teamMonthlyGoal ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {projectedMonthEnd}
                          </strong>
                          <span className="text-[11px] text-slate-500">rewards</span>
                        </div>
                      </div>
                    </div>

                    {/* Animated Progress Bar with Milestone Checkpoints */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                        <span className="font-semibold">Milestone Progression</span>
                        <span className="font-mono-tabular">{monthApprovedCount} of {teamMonthlyGoal} target</span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(monthPct, 100)}%` }}
                          transition={{ duration: 1.0, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono-tabular text-slate-600 mt-1">
                        <span>0%</span>
                        <span className={monthPct >= 25 ? 'font-bold text-indigo-600' : ''}>25%</span>
                        <span className={monthPct >= 50 ? 'font-bold text-indigo-600' : ''}>50%</span>
                        <span className={monthPct >= 75 ? 'font-bold text-indigo-600' : ''}>75%</span>
                        <span className={monthPct >= 100 ? 'font-bold text-emerald-600' : ''}>100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Callout Banner */}
                <div className="mt-5 pt-4 border-t border-indigo-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-4 h-4 ${monthPct >= 75 ? 'text-amber-500' : 'text-indigo-500'}`} />
                    <span className="text-slate-700">
                      {monthPct >= 100
                        ? '🎉 Monthly team quota achieved! Outstanding front desk performance.'
                        : monthPct >= 60
                        ? '⚡ Excellent momentum: Front desk on track to reach monthly target.'
                        : 'Action required: Boost guest loyalty enrollment at check-in.'}
                    </span>
                  </div>
                  <span className="font-mono-tabular font-bold text-indigo-900">
                    {teamMonthlyGoal - monthApprovedCount > 0
                      ? `${teamMonthlyGoal - monthApprovedCount} needed`
                      : 'Target exceeded'}
                  </span>
                </div>
              </motion.div>
            )}

            {/* YEAR CARD */}
            {(scopeFilter === 'both' || scopeFilter === 'yearOnly') && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-amber-50/40 via-white to-slate-50/60 border border-amber-200 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Year {yearStr} Annual Performance
                      </h3>
                      <p className="text-xs text-slate-500">
                        Cumulative YTD · Jan through Dec {yearStr}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wider font-semibold text-amber-800">
                      Annual Quota
                    </span>
                    <div className="text-lg font-bold font-mono-tabular text-slate-900">
                      {yearApprovedCount} / {teamAnnualGoal}
                    </div>
                  </div>
                </div>

                {/* Animated Radial Dial & Core KPIs */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
                  {/* SVG Animated Circular Ring */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r={circleRadius}
                        stroke="#e2e8f0"
                        strokeWidth="11"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="70"
                        cy="70"
                        r={circleRadius}
                        stroke="#d97706"
                        strokeWidth="11"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={circleCircumference}
                        strokeLinecap="round"
                        fill="transparent"
                        initial={{ strokeDashoffset: circleCircumference }}
                        animate={{ strokeDashoffset: yearStrokeDashoffset }}
                        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="text-3xl font-extrabold font-mono-tabular text-amber-950"
                      >
                        {yearPct}%
                      </motion.span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                        YTD Goal
                      </span>
                    </div>
                  </div>

                  {/* Year Pacing & Breakdown Cards */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block mb-0.5">YTD Verified</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-base font-bold font-mono-tabular text-slate-900">
                            {yearApprovedCount}
                          </strong>
                          {yearPendingCount > 0 && (
                            <span className="text-amber-700 font-semibold font-mono-tabular">
                              (+{yearPendingCount})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block mb-0.5">Active Months</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-base font-bold font-mono-tabular text-amber-700">
                            {currentMonthNum}
                          </strong>
                          <span className="text-[11px] text-slate-500">of 12 in {yearStr}</span>
                        </div>
                      </div>

                      <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block mb-0.5">Year-End Run-Rate</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-base font-bold font-mono-tabular text-slate-900">
                            {projectedYearEnd}
                          </strong>
                          <span className="text-[11px] text-slate-500">projected</span>
                        </div>
                      </div>

                      <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block mb-0.5">Remaining for Year</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-base font-bold font-mono-tabular text-slate-900">
                            {Math.max(0, teamAnnualGoal - yearApprovedCount)}
                          </strong>
                          <span className="text-[11px] text-slate-500">rewards</span>
                        </div>
                      </div>
                    </div>

                    {/* Animated Annual Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                        <span className="font-semibold">Full Year Progression</span>
                        <span className="font-mono-tabular">{yearApprovedCount} of {teamAnnualGoal} target</span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(yearPct, 100)}%` }}
                          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }}
                          className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-400 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono-tabular text-slate-600 mt-1">
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                        <span>Q4 Target</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Callout Banner */}
                <div className="mt-5 pt-4 border-t border-amber-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span className="text-slate-700">
                      Annual Hotel Guest Loyalty Velocity: {Math.round(yearApprovedCount / Math.max(1, currentMonthNum))} rewards/month
                    </span>
                  </div>
                  <span className="font-mono-tabular font-bold text-amber-950">
                    {yearPct}% of Annual Target
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* QUICK 12-MONTH PREVIEW IN OVERALL VIEW */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-slate-900">
                  {yearStr} Month-by-Month Loyalty Progression
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-mono-tabular">
                Baseline Monthly Target: {teamMonthlyGoal}
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-36 pt-4 px-1">
              {annualMonthlySeries.map((m, idx) => {
                const heightPct = Math.max(6, Math.min(100, Math.round((m.approved / maxAnnualMonthCount) * 100)));

                return (
                  <div key={m.key} className="h-full flex flex-col items-center justify-end group">
                    <span className="text-[10px] font-mono-tabular font-bold text-slate-700 mb-1">
                      {m.approved}
                    </span>
                    <div className="w-full max-w-[32px] bg-white h-24 rounded-t-md flex items-end overflow-hidden border border-slate-200">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.45, delay: idx * 0.04 }}
                        className={`w-full rounded-t-sm transition-all ${
                          m.isSelectedMonth
                            ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-xs'
                            : m.isPastOrCurrent
                            ? 'bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600'
                            : 'bg-slate-200'
                        }`}
                      />
                    </div>
                    <span
                      className={`mt-1.5 text-[10px] font-mono-tabular ${
                        m.isSelectedMonth
                          ? 'font-bold text-amber-700'
                          : m.isPastOrCurrent
                          ? 'font-semibold text-slate-800'
                          : 'text-slate-600'
                      }`}
                    >
                      {m.short}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED 12-MONTH ANNUAL TRAJECTORY */}
      {activeTab === 'yearTrajectory' && (
        <div key={`annual-${animationCycle}`} className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
            <span className="text-slate-600">
              Annual Month-by-Month Enrollment Progress for Year <strong>{yearStr}</strong>
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" /> Selected Month ({monthLabel})
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block" /> Approved Months
              </span>
            </div>
          </div>

          {/* Full-size 12-Month Bar & Target Visualization */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-3 items-end h-64 pt-8 pb-2 px-2 border-b border-slate-200 relative">
              {/* Target Quota Line Overlay */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-indigo-400 z-10 pointer-events-none flex items-center justify-end pr-2"
                style={{
                  bottom: `${Math.min(90, Math.round((teamMonthlyGoal / maxAnnualMonthCount) * 100))}%`
                }}
              >
                <span className="bg-indigo-600 text-white text-[9px] font-mono-tabular px-1.5 py-0.5 rounded font-bold shadow-xs">
                  Monthly Quota: {teamMonthlyGoal}
                </span>
              </div>

              {annualMonthlySeries.map((m, idx) => {
                const heightPct = Math.max(6, Math.min(100, Math.round((m.approved / maxAnnualMonthCount) * 100)));

                return (
                  <div key={m.key} className="h-full flex flex-col items-center justify-end group relative">
                    {/* Hover detail tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                      {m.full}: {m.approved} approved ({m.pctOfMonthlyGoal}%)
                    </div>

                    <div className="text-xs font-mono-tabular font-bold text-slate-800 mb-1.5">
                      {m.approved}
                    </div>

                    <div className="w-full max-w-[48px] bg-white h-44 rounded-t-lg flex items-end overflow-hidden border border-slate-200 shadow-xs">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.04 }}
                        className={`w-full rounded-t-lg transition-all ${
                          m.isSelectedMonth
                            ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                            : m.isPastOrCurrent
                            ? 'bg-gradient-to-t from-indigo-700 via-indigo-600 to-sky-500 group-hover:from-indigo-600'
                            : 'bg-slate-200'
                        }`}
                      />
                    </div>

                    <div className="mt-2 text-center">
                      <div
                        className={`text-xs font-mono-tabular ${
                          m.isSelectedMonth
                            ? 'font-bold text-amber-700'
                            : m.isPastOrCurrent
                            ? 'font-semibold text-slate-800'
                            : 'text-slate-600'
                        }`}
                      >
                        {m.short}
                      </div>
                      <div className="text-[10px] font-mono-tabular text-slate-600">
                        {m.quarter}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quarterly Aggregations Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-2">
              {['Q1', 'Q2', 'Q3', 'Q4'].map((qName) => {
                const qMonths = annualMonthlySeries.filter((m) => m.quarter === qName);
                const qApproved = qMonths.reduce((sum, m) => sum + m.approved, 0);
                const qTarget = teamMonthlyGoal * 3;
                const qPct = qTarget > 0 ? Math.round((qApproved / qTarget) * 100) : 0;

                return (
                  <div key={qName} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                      <span>{qName} Performance</span>
                      <span className="font-mono-tabular font-bold text-slate-900">{qPct}%</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold font-mono-tabular text-slate-900">
                        {qApproved}
                      </span>
                      <span className="text-xs text-slate-500 font-mono-tabular">
                        / {qTarget} target
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(qPct, 100)}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${
                          qPct >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF RANKINGS BARS */}
      {activeTab === 'staffBar' && (
        <div key={`staff-${animationCycle}`} className="mt-6 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Staff Ranked by Approved Rewards in {monthLabel}</span>
            <span className="font-mono-tabular">Total Staff: {staffTotals.length}</span>
          </div>

          {staffTotals.map((staff, idx) => {
            const widthPct = Math.round((staff.monthCount / maxStaffCount) * 100);

            return (
              <div key={staff.id} className="grid grid-cols-12 items-center gap-3 text-sm">
                <div className="col-span-4 sm:col-span-3 flex items-center gap-2 truncate">
                  <span className="font-mono-tabular font-bold text-slate-400 w-6">
                    #{idx + 1}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: staff.avatarColor }}
                  />
                  <span className="font-semibold text-slate-900 truncate">{staff.staffName}</span>
                </div>

                <div className="col-span-5 sm:col-span-7 bg-slate-100 h-7 rounded-lg overflow-hidden relative flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.45, delay: idx * 0.03 }}
                    className="h-full rounded-lg flex items-center justify-end pr-2.5 text-xs font-mono-tabular font-bold text-white shadow-xs"
                    style={{ backgroundColor: staff.avatarColor }}
                  >
                    {staff.monthCount}
                  </motion.div>
                </div>

                <div className="col-span-3 sm:col-span-2 text-right font-mono-tabular text-xs text-slate-600">
                  <strong className="text-slate-900">{staff.monthCount}</strong> approved
                  {staff.pendingCount > 0 && (
                    <span className="text-amber-700 font-semibold">
                      {' '}
                      (+{staff.pendingCount} pending)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: DAILY VELOCITY TREND CURVE */}
      {activeTab === 'dailyTrend' && (
        <div key={`daily-${animationCycle}`} className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 text-xs">
            <span className="text-slate-600">
              Day-by-Day Approved Rewards Distribution for <strong>{monthLabel}</strong>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Filter Staff:</span>
              <select
                value={focusedStaffId}
                onChange={(e) => setFocusedStaffId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="ALL">All {staffRecords.length} Staff Combined</option>
                {staffRecords.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.staffName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 items-end h-56 pt-8 pb-2 px-2 border-b border-slate-200">
            {dailySeries.map((dayObj, idx) => {
              const heightPct = Math.max(8, Math.round((dayObj.count / maxDailyCount) * 100));
              const isSelectedDay = dayObj.dateIso === selectedDateIso;

              return (
                <div
                  key={dayObj.dateIso}
                  className="h-full flex flex-col items-center justify-end group"
                >
                  <div className="text-xs font-mono-tabular font-bold text-slate-800 mb-1">
                    {dayObj.count}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-100 h-36 rounded-t-lg flex items-end overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.35, delay: idx * 0.03 }}
                      className={`w-full rounded-t-lg transition-colors ${
                        isSelectedDay
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                          : 'bg-gradient-to-t from-indigo-700 to-sky-500 group-hover:from-indigo-600 group-hover:to-sky-400'
                      }`}
                    />
                  </div>
                  <div
                    className={`mt-2 text-xs font-mono-tabular ${
                      isSelectedDay ? 'font-bold text-amber-800' : 'text-slate-600'
                    }`}
                  >
                    {dayObj.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
