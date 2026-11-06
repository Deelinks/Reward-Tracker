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
  Clock,
  Crown,
  Sparkles,
  Trophy,
  Medal,
  ChevronRight
} from 'lucide-react';
import { StaffMemberRecord } from '../data/hotelLoyaltyData';
import { Staff3DAvatar } from './Staff3DAvatar';

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
  const currentSystemMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = monthKey === currentSystemMonth;
  const activeDayRange = isCurrentMonth
    ? Math.min(daysInMonth, Math.max(currentDayNum + 2, 10))
    : daysInMonth;
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
    <section className="bg-gradient-to-b from-white via-slate-50/40 to-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] border-t-2 border-t-white relative overflow-hidden">
      {/* Subtle 3D background ambient grid & specular gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.025] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Navigation Segmented Controls */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50/80 border border-indigo-200/70 text-xs text-indigo-700 font-semibold mb-1.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Overall Loyalty Progress Analytics</span>
            <span aria-hidden="true">·</span>
            <span>{monthLabel} &amp; Year {yearStr}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Performance Telemetry &amp; Animated Quota Tracker</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_2px_4px_rgba(245,158,11,0.25)] border-t border-amber-200">
              3D Live
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          {/* Main View Tabs with tactile 3D physical depth */}
          <div className="flex items-center bg-slate-200/70 p-1.5 rounded-xl border border-slate-300/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => setActiveTab('overallProgress')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overallProgress'
                  ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_3px_6px_rgba(79,70,229,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border-b-2 border-indigo-700 -translate-y-0.5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Month &amp; Year Progress</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('yearTrajectory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'yearTrajectory'
                  ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_3px_6px_rgba(79,70,229,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border-b-2 border-indigo-700 -translate-y-0.5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Annual 12-Mo Trajectory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('staffBar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'staffBar'
                  ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_3px_6px_rgba(79,70,229,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border-b-2 border-indigo-700 -translate-y-0.5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Staff Rankings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dailyTrend')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dailyTrend'
                  ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_3px_6px_rgba(79,70,229,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border-b-2 border-indigo-700 -translate-y-0.5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Daily Velocity</span>
            </button>
          </div>

          {/* Quick Replay Animation Button with 3D tactile press */}
          <button
            type="button"
            onClick={triggerReplay}
            title="Replay visual animation"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-gradient-to-b from-white to-slate-100 hover:to-slate-200 border border-slate-300/80 rounded-xl shadow-[0_2px_0_0_#cbd5e1,0_4px_6px_rgba(0,0,0,0.04)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Replay 3D</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERALL MONTH & YEAR PROGRESS */}
      {activeTab === 'overallProgress' && (
        <div key={`overall-${animationCycle}`} className="mt-6 space-y-6 relative z-10">
          {/* Sub-view filter: Month / Year / Both */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 pb-3 border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">View Mode:</span>
              <div className="inline-flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
                <button
                  type="button"
                  onClick={() => setScopeFilter('both')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    scopeFilter === 'both'
                      ? 'bg-white text-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.08)] border-b border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Side-by-Side Dual View
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('monthOnly')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    scopeFilter === 'monthOnly'
                      ? 'bg-white text-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.08)] border-b border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Month Focus
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('yearOnly')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    scopeFilter === 'yearOnly'
                      ? 'bg-white text-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.08)] border-b border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
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

          {/* DUAL GAUGES: MONTH & YEAR WITH 3D DEPTH */}
          <div className={`grid gap-6 ${scopeFilter === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* MONTH CARD WITH 3D EMBOSSED DEPTH */}
            {(scopeFilter === 'both' || scopeFilter === 'monthOnly') && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50/90 border border-indigo-200/90 rounded-2xl p-6 relative overflow-hidden shadow-[0_12px_28px_-8px_rgba(79,70,229,0.15),0_4px_8px_rgba(0,0,0,0.04)] border-t-2 border-t-white hover:shadow-[0_16px_32px_-8px_rgba(79,70,229,0.2)] transition-shadow"
              >
                {/* 3D ambient glow */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-[0_4px_10px_rgba(79,70,229,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] border-t border-indigo-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {monthLabel} Performance
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Day {currentDayNum} of {daysInMonth} · {daysRemaining} days remaining
                      </p>
                    </div>
                  </div>

                  <div className="text-right bg-white/90 px-3.5 py-1.5 rounded-xl border border-indigo-100 shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-700 block">
                      Monthly Quota
                    </span>
                    <div className="text-lg font-black font-mono-tabular text-slate-900">
                      {monthApprovedCount} <span className="text-xs font-semibold text-slate-400">/ {teamMonthlyGoal}</span>
                    </div>
                  </div>
                </div>

                {/* Animated 3D Radial Dial & Core KPIs */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 relative z-10">
                  {/* SVG 3D Animated Circular Ring Pod */}
                  <div className="relative w-40 h-40 shrink-0 flex items-center justify-center p-2 rounded-full bg-gradient-to-b from-white to-slate-100/90 shadow-[inset_0_3px_8px_rgba(0,0,0,0.08),0_8px_20px_rgba(79,70,229,0.15)] border border-indigo-100">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                      <defs>
                        <linearGradient id="monthGradient3D" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="50%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                        <filter id="glow3DMonth" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4f46e5" floodOpacity="0.4" />
                        </filter>
                      </defs>
                      <circle
                        cx="70"
                        cy="70"
                        r={circleRadius}
                        stroke="#e2e8f0"
                        strokeWidth="11"
                        fill="transparent"
                        className="opacity-70"
                      />
                      <motion.circle
                        cx="70"
                        cy="70"
                        r={circleRadius}
                        stroke="url(#monthGradient3D)"
                        strokeWidth="11"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={circleCircumference}
                        strokeLinecap="round"
                        fill="transparent"
                        filter="url(#glow3DMonth)"
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
                        className="text-3xl font-black font-mono-tabular text-indigo-950 tracking-tight"
                      >
                        {monthPct}%
                      </motion.span>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 mt-0.5">
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Month Pacing & 3D Extruded Breakdown Cards */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/95 p-3.5 rounded-xl border border-slate-200/80 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 transition-all">
                        <span className="text-slate-500 font-semibold block mb-0.5">Approved Rewards</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-lg font-black font-mono-tabular text-slate-900">
                            {monthApprovedCount}
                          </strong>
                          {monthPendingCount > 0 && (
                            <span className="text-amber-700 font-bold font-mono-tabular text-[11px]">
                              (+{monthPendingCount})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/95 p-3.5 rounded-xl border border-slate-200/80 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 transition-all">
                        <span className="text-slate-500 font-semibold block mb-0.5">Current Velocity</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-lg font-black font-mono-tabular text-indigo-600">
                            {dailyActualVelocity}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-medium">/ day avg</span>
                        </div>
                      </div>

                      <div className="bg-white/95 p-3.5 rounded-xl border border-slate-200/80 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 transition-all">
                        <span className="text-slate-500 font-semibold block mb-0.5">Target Run-Rate</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-lg font-black font-mono-tabular text-slate-900">
                            {dailyRequiredRunRate}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-medium">/ day needed</span>
                        </div>
                      </div>

                      <div className="bg-white/95 p-3.5 rounded-xl border border-slate-200/80 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 transition-all">
                        <span className="text-slate-500 font-semibold block mb-0.5">Projected Finish</span>
                        <div className="flex items-baseline gap-1">
                          <strong className={`text-lg font-black font-mono-tabular ${projectedMonthEnd >= teamMonthlyGoal ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {projectedMonthEnd}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-medium">rewards</span>
                        </div>
                      </div>
                    </div>

                    {/* Animated 3D Progress Capsule with Specular Highlight */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1.5 font-semibold">
                        <span>Milestone Progression</span>
                        <span className="font-mono-tabular font-bold text-slate-900">{monthApprovedCount} of {teamMonthlyGoal} target</span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)] border border-slate-300/60 p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(monthPct, 100)}%` }}
                          transition={{ duration: 1.0, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-400 rounded-full shadow-[0_2px_6px_rgba(79,70,229,0.35)] relative overflow-hidden"
                        >
                          {/* Specular sheen */}
                          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-full" />
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono-tabular font-bold text-slate-500 mt-1.5">
                        <span>0%</span>
                        <span className={monthPct >= 25 ? 'text-indigo-600 font-black' : ''}>25%</span>
                        <span className={monthPct >= 50 ? 'text-indigo-600 font-black' : ''}>50%</span>
                        <span className={monthPct >= 75 ? 'text-indigo-600 font-black' : ''}>75%</span>
                        <span className={monthPct >= 100 ? 'text-emerald-600 font-black' : ''}>100% Target</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Callout Banner */}
                <div className="mt-5 pt-4 border-t border-indigo-100 flex items-center justify-between text-xs relative z-10">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-4 h-4 ${monthPct >= 75 ? 'text-amber-500' : 'text-indigo-500'}`} />
                    <span className="text-slate-700 font-medium">
                      {monthPct >= 100
                        ? '🎉 Monthly team quota achieved! Outstanding front desk performance.'
                        : monthPct >= 60
                        ? '⚡ Excellent momentum: Front desk on track to reach monthly target.'
                        : 'Action required: Boost guest loyalty enrollment at check-in.'}
                    </span>
                  </div>
                  <span className="font-mono-tabular font-black text-indigo-900 bg-white/80 px-2 py-0.5 rounded-md border border-indigo-100 shadow-xs">
                    {teamMonthlyGoal - monthApprovedCount > 0
                      ? `${teamMonthlyGoal - monthApprovedCount} needed`
                      : 'Target exceeded'}
                  </span>
                </div>
              </motion.div>
            )}

            {/* YEAR CARD WITH 3D EMBOSSED DEPTH */}
            {(scopeFilter === 'both' || scopeFilter === 'yearOnly') && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-amber-50/70 via-white to-slate-50/90 border border-amber-200/90 rounded-2xl p-6 relative overflow-hidden shadow-[0_12px_28px_-8px_rgba(217,119,6,0.15),0_4px_8px_rgba(0,0,0,0.04)] border-t-2 border-t-white hover:shadow-[0_16px_32px_-8px_rgba(217,119,6,0.2)] transition-shadow"
              >
                {/* 3D ambient amber glow */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-[0_4px_10px_rgba(245,158,11,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] border-t border-amber-300">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Year {yearStr} Annual Performance
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Cumulative YTD · Jan through Dec {yearStr}
                      </p>
                    </div>
                  </div>

                  <div className="text-right bg-white/90 px-3.5 py-1.5 rounded-xl border border-amber-200 shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 block">
                      Annual Quota
                    </span>
                    <div className="text-lg font-black font-mono-tabular text-slate-900">
                      {yearApprovedCount} <span className="text-xs font-semibold text-slate-400">/ {teamAnnualGoal}</span>
                    </div>
                  </div>
                </div>

                {/* Animated 3D Radial Dial & Core KPIs */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 relative z-10">
                  {/* SVG 3D Animated Circular Ring Pod */}
                  <div className="relative w-40 h-40 shrink-0 flex items-center justify-center p-2 rounded-full bg-gradient-to-b from-white to-amber-50/90 shadow-[inset_0_3px_8px_rgba(0,0,0,0.08),0_8px_20px_rgba(217,119,6,0.15)] border border-amber-200">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                      <defs>
                        <linearGradient id="yearGradient3D" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                        <filter id="glow3DYear" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#d97706" floodOpacity="0.4" />
                        </filter>
                      </defs>
                      <circle
                        cx="70"
                        cy="70"
                        r={circleRadius}
                        stroke="#e2e8f0"
                        strokeWidth="11"
                        fill="transparent"
                        className="opacity-70"
                      />
                      <motion.circle
                        cx="70"
                        cy="70"
                        r={circleRadius}
                        stroke="url(#yearGradient3D)"
                        strokeWidth="11"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={circleCircumference}
                        strokeLinecap="round"
                        fill="transparent"
                        filter="url(#glow3DYear)"
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
                        className="text-3xl font-black font-mono-tabular text-amber-950 tracking-tight"
                      >
                        {yearPct}%
                      </motion.span>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200 mt-0.5">
                        YTD Goal
                      </span>
                    </div>
                  </div>

                  {/* Year Pacing & 3D Extruded Breakdown Cards */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/95 p-3.5 rounded-xl border border-slate-200/80 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 transition-all">
                        <span className="text-slate-500 font-semibold block mb-0.5">YTD Verified</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-lg font-black font-mono-tabular text-slate-900">
                            {yearApprovedCount}
                          </strong>
                          {yearPendingCount > 0 && (
                            <span className="text-amber-700 font-bold font-mono-tabular text-[11px]">
                              (+{yearPendingCount})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/95 p-3.5 rounded-xl border border-slate-200/80 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 transition-all">
                        <span className="text-slate-500 font-semibold block mb-0.5">Active Months</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-lg font-black font-mono-tabular text-amber-700">
                            {currentMonthNum}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-medium">of 12 in {yearStr}</span>
                        </div>
                      </div>

                      <div className="bg-white/95 p-3.5 rounded-xl border border-slate-200/80 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 transition-all">
                        <span className="text-slate-500 font-semibold block mb-0.5">Year-End Run-Rate</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-lg font-black font-mono-tabular text-slate-900">
                            {projectedYearEnd}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-medium">projected</span>
                        </div>
                      </div>

                      <div className="bg-white/95 p-3.5 rounded-xl border border-slate-200/80 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 transition-all">
                        <span className="text-slate-500 font-semibold block mb-0.5">Remaining for Year</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-lg font-black font-mono-tabular text-slate-900">
                            {Math.max(0, teamAnnualGoal - yearApprovedCount)}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-medium">rewards</span>
                        </div>
                      </div>
                    </div>

                    {/* Animated 3D Annual Bar with Specular Highlight */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1.5 font-semibold">
                        <span>Full Year Progression</span>
                        <span className="font-mono-tabular font-bold text-slate-900">{yearApprovedCount} of {teamAnnualGoal} target</span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)] border border-slate-300/60 p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(yearPct, 100)}%` }}
                          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }}
                          className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-400 rounded-full shadow-[0_2px_6px_rgba(217,119,6,0.35)] relative overflow-hidden"
                        >
                          {/* Specular sheen */}
                          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-full" />
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono-tabular font-bold text-slate-500 mt-1.5">
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                        <span>Q4 Target</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Callout Banner */}
                <div className="mt-5 pt-4 border-t border-amber-200 flex items-center justify-between text-xs relative z-10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span className="text-slate-700 font-medium">
                      Annual Hotel Guest Loyalty Velocity: {Math.round(yearApprovedCount / Math.max(1, currentMonthNum))} rewards/month
                    </span>
                  </div>
                  <span className="font-mono-tabular font-black text-amber-950 bg-white/80 px-2 py-0.5 rounded-md border border-amber-200 shadow-xs">
                    {yearPct}% of Annual Target
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* 3D TOP STAFF AVATAR SHOWCASE & PODIUM */}
          <div className="bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] border-t-2 border-t-white relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-[0_3px_8px_rgba(245,158,11,0.35)] border-t border-amber-300">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Front Desk Quota Champions</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      3D Avatars
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Leading hotel staff recognized by guest enrollment performance in {monthLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('staffBar')}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer self-start sm:self-auto"
              >
                <span>View Full Staff Ranking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top 3 Staff 3D Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {staffTotals.slice(0, 3).map((staff, idx) => {
                const ringTier = idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze';
                const medalBadge = idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place';
                const medalBg = idx === 0
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_2px_4px_rgba(245,158,11,0.3)]'
                  : idx === 1
                  ? 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-[0_2px_4px_rgba(100,116,139,0.3)]'
                  : 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-[0_2px_4px_rgba(180,83,9,0.3)]';
                const pctOfGoal = staff.monthlyGoal > 0 ? Math.round((staff.monthCount / staff.monthlyGoal) * 100) : 0;

                return (
                  <motion.div
                    key={staff.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="bg-white/95 rounded-xl p-4 border border-slate-200/90 shadow-[0_4px_0_0_#e2e8f0,0_8px_16px_rgba(0,0,0,0.04)] border-t border-t-white hover:-translate-y-1 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${medalBg}`}>
                          {medalBadge}
                        </span>
                        <span className="text-[11px] font-bold font-mono-tabular text-slate-500">
                          Goal: {staff.monthlyGoal}/mo
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <Staff3DAvatar
                          avatarId={staff.avatarId}
                          avatarColor={staff.avatarColor}
                          staffName={staff.staffName}
                          size="md"
                          withRing
                          ringTier={ringTier}
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-bold text-slate-900 truncate">
                            {staff.staffName}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-medium truncate capitalize">
                            {staff.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-500 font-medium">Monthly Verified</span>
                        <div className="flex items-baseline gap-1 font-mono-tabular">
                          <span className="text-base font-black text-slate-900">{staff.monthCount}</span>
                          <span className="text-[10px] text-slate-400 font-medium">rewards</span>
                          {staff.pendingCount > 0 && (
                            <span className="text-[10px] font-bold text-amber-700">
                              (+{staff.pendingCount})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(pctOfGoal, 100)}%`,
                            backgroundColor: staff.avatarColor
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono-tabular">
                        <span>Pacing: <strong>{pctOfGoal}%</strong></span>
                        <span>Year: <strong>{staff.yearCount}</strong> total</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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

      {/* TAB 2: DETAILED 12-MONTH ANNUAL TRAJECTORY WITH 3D PILLARS */}
      {activeTab === 'yearTrajectory' && (
        <div key={`annual-${animationCycle}`} className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 text-xs">
            <span className="text-slate-700 font-semibold">
              Annual Month-by-Month Enrollment Trajectory for Year <strong>{yearStr}</strong>
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-3 h-3 rounded-xs bg-amber-500 shadow-xs inline-block" /> Selected Month ({monthLabel})
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 shadow-xs inline-block" /> Completed Months
              </span>
            </div>
          </div>

          {/* Annual Top Staff Avatar Strip */}
          <div className="bg-gradient-to-r from-amber-50/60 via-white to-indigo-50/60 p-3.5 rounded-xl border border-slate-200/90 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                Annual YTD Leaders ({yearStr}):
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[...staffTotals].sort((a, b) => b.yearCount - a.yearCount).slice(0, 4).map((topYearStaff, idx) => (
                <div
                  key={topYearStaff.id}
                  className="flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs text-xs"
                >
                  <Staff3DAvatar
                    avatarId={topYearStaff.avatarId}
                    avatarColor={topYearStaff.avatarColor}
                    staffName={topYearStaff.staffName}
                    size="xs"
                    withRing={idx < 3}
                    ringTier={idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'none'}
                  />
                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[90px]">
                    {topYearStaff.staffName}
                  </span>
                  <span className="font-mono-tabular font-black text-amber-700 text-[11px]">
                    {topYearStaff.yearCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Full-size 12-Month 3D Extruded Bar & Target Visualization */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-6 shadow-[inset_0_2px_6px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-3 items-end h-64 pt-8 pb-3 px-2 border-b border-slate-200 relative">
              {/* Target Quota Line Overlay */}
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-indigo-400/80 z-10 pointer-events-none flex items-center justify-end pr-2"
                style={{
                  bottom: `${Math.min(90, Math.round((teamMonthlyGoal / maxAnnualMonthCount) * 100))}%`
                }}
              >
                <span className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[9px] font-mono-tabular px-2 py-0.5 rounded-full font-black shadow-[0_2px_4px_rgba(79,70,229,0.3)]">
                  Monthly Quota: {teamMonthlyGoal}
                </span>
              </div>

              {annualMonthlySeries.map((m, idx) => {
                const heightPct = Math.max(8, Math.min(100, Math.round((m.approved / maxAnnualMonthCount) * 100)));

                return (
                  <div key={m.key} className="h-full flex flex-col items-center justify-end group relative">
                    {/* Hover detail tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-20 font-bold">
                      {m.full}: {m.approved} approved ({m.pctOfMonthlyGoal}%)
                    </div>

                    <div className="text-xs font-mono-tabular font-extrabold text-slate-800 mb-1.5">
                      {m.approved}
                    </div>

                    <div className="w-full max-w-[48px] bg-slate-200/80 h-44 rounded-t-xl flex items-end overflow-hidden border border-slate-300/70 p-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.04 }}
                        className={`w-full rounded-t-lg transition-all relative overflow-hidden ${
                          m.isSelectedMonth
                            ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                            : m.isPastOrCurrent
                            ? 'bg-gradient-to-t from-indigo-700 via-indigo-600 to-sky-400 shadow-[0_2px_8px_rgba(79,70,229,0.3)] group-hover:from-indigo-600'
                            : 'bg-slate-300/70'
                        }`}
                      >
                        {/* Specular sheen */}
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-lg" />
                      </motion.div>
                    </div>

                    <div className="mt-2 text-center">
                      <div
                        className={`text-xs font-mono-tabular ${
                          m.isSelectedMonth
                            ? 'font-black text-amber-800'
                            : m.isPastOrCurrent
                            ? 'font-bold text-slate-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {m.short}
                      </div>
                      <div className="text-[10px] font-mono-tabular text-slate-500">
                        {m.quarter}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quarterly Aggregations Footer with 3D Tactile Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-2">
              {['Q1', 'Q2', 'Q3', 'Q4'].map((qName) => {
                const qMonths = annualMonthlySeries.filter((m) => m.quarter === qName);
                const qApproved = qMonths.reduce((sum, m) => sum + m.approved, 0);
                const qTarget = teamMonthlyGoal * 3;
                const qPct = qTarget > 0 ? Math.round((qApproved / qTarget) * 100) : 0;

                return (
                  <div key={qName} className="bg-white/95 p-3.5 rounded-xl border border-slate-200/90 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                      <span>{qName} Performance</span>
                      <span className="font-mono-tabular font-black text-slate-900">{qPct}%</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black font-mono-tabular text-slate-900">
                        {qApproved}
                      </span>
                      <span className="text-xs text-slate-500 font-mono-tabular font-medium">
                        / {qTarget} target
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(qPct, 100)}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${
                          qPct >= 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-indigo-500 to-sky-400'
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

      {/* TAB 3: STAFF RANKINGS BARS WITH 3D CARDS & AVATARS */}
      {activeTab === 'staffBar' && (
        <div key={`staff-${animationCycle}`} className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-800">
                Staff Ranked by Approved Rewards in {monthLabel}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono-tabular text-slate-500">
              <span>Total Active Staff: <strong className="text-slate-900">{staffTotals.length}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Max Quota Bench: <strong className="text-slate-900">{maxStaffCount}</strong></span>
            </div>
          </div>

          <div className="space-y-2.5">
            {staffTotals.map((staff, idx) => {
              const widthPct = Math.max(4, Math.round((staff.monthCount / maxStaffCount) * 100));
              const ringTier = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'none';
              const rankColor = idx === 0
                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-[0_2px_4px_rgba(245,158,11,0.35)] border-t border-amber-200 font-black'
                : idx === 1
                ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 shadow-[0_2px_4px_rgba(100,116,139,0.3)] border-t border-white font-black'
                : idx === 2
                ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white shadow-[0_2px_4px_rgba(180,83,9,0.3)] border-t border-amber-500 font-black'
                : 'bg-slate-100 text-slate-600 border border-slate-200/90 font-bold';
              const pctOfGoal = staff.monthlyGoal > 0 ? Math.round((staff.monthCount / staff.monthlyGoal) * 100) : 0;

              return (
                <div
                  key={staff.id}
                  className="bg-white/95 rounded-xl p-3 sm:p-3.5 border border-slate-200/90 shadow-[0_3px_0_0_#e2e8f0,0_6px_12px_rgba(0,0,0,0.03)] border-t border-t-white hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_#cbd5e1,0_10px_20px_rgba(0,0,0,0.06)] transition-all grid grid-cols-12 items-center gap-3"
                >
                  {/* Rank & 3D Avatar & Name */}
                  <div className="col-span-12 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-mono-tabular ${rankColor}`}
                    >
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>

                    <Staff3DAvatar
                      avatarId={staff.avatarId}
                      avatarColor={staff.avatarColor}
                      staffName={staff.staffName}
                      size="sm"
                      withRing={idx < 3}
                      ringTier={ringTier}
                    />

                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {staff.staffName}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            Lead
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block capitalize">
                        {staff.role}
                      </span>
                    </div>
                  </div>

                  {/* 3D Extruded Progress Bar */}
                  <div className="col-span-8 sm:col-span-5 bg-slate-200/70 h-8 rounded-xl p-1 overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] border border-slate-300/60 flex items-center">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.03 }}
                      className="h-full rounded-lg flex items-center justify-end pr-2.5 text-xs font-mono-tabular font-extrabold text-white shadow-[0_2px_5px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.45)] relative overflow-hidden"
                      style={{ backgroundColor: staff.avatarColor }}
                    >
                      {/* Specular sheen */}
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-white/25 rounded-t-lg pointer-events-none" />
                      <span className="relative z-10 drop-shadow-xs">{staff.monthCount}</span>
                    </motion.div>
                  </div>

                  {/* Stats & Quota Telemetry */}
                  <div className="col-span-4 sm:col-span-3 text-right font-mono-tabular text-xs flex flex-col items-end justify-center">
                    <div className="flex items-baseline gap-1">
                      <strong className="text-sm font-black text-slate-900">{staff.monthCount}</strong>
                      <span className="text-[11px] text-slate-500 font-medium">approved</span>
                      {staff.pendingCount > 0 && (
                        <span className="text-amber-700 font-bold text-[11px]">
                          (+{staff.pendingCount})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>Goal: <strong>{staff.monthlyGoal}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span className={pctOfGoal >= 100 ? 'text-emerald-600 font-bold' : 'text-indigo-600 font-bold'}>
                        {pctOfGoal}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DAILY VELOCITY TREND CURVE WITH 3D PILLARS */}
      {activeTab === 'dailyTrend' && (
        <div key={`daily-${animationCycle}`} className="mt-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 text-xs">
            <div>
              <span className="font-bold text-slate-800 block text-sm">
                Day-by-Day Approved Rewards Distribution
              </span>
              <span className="text-slate-500">
                Pacing activity for <strong>{monthLabel}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
              {focusedStaffId !== 'ALL' && (
                (() => {
                  const focusedMember = staffRecords.find((s) => s.id === focusedStaffId);
                  return focusedMember ? (
                    <Staff3DAvatar
                      avatarId={focusedMember.avatarId}
                      avatarColor={focusedMember.avatarColor}
                      staffName={focusedMember.staffName}
                      size="xs"
                    />
                  ) : null;
                })()
              )}
              <span className="text-slate-600 font-semibold text-[11px]">Filter Staff:</span>
              <select
                value={focusedStaffId}
                onChange={(e) => setFocusedStaffId(e.target.value)}
                className="px-3 py-1 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900 shadow-xs cursor-pointer focus:outline-indigo-500"
              >
                <option value="ALL">All {staffRecords.length} Staff Combined</option>
                {staffRecords.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.staffName} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3D Extruded Daily Columns */}
          <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 items-end h-60 pt-8 pb-3 px-2 border-b border-slate-200">
              {dailySeries.map((dayObj, idx) => {
                const heightPct = Math.max(10, Math.round((dayObj.count / maxDailyCount) * 100));
                const isSelectedDay = dayObj.dateIso === selectedDateIso;

                return (
                  <div
                    key={dayObj.dateIso}
                    className="h-full flex flex-col items-center justify-end group relative"
                  >
                    <div className="text-xs font-mono-tabular font-extrabold text-slate-800 mb-1.5 group-hover:scale-110 transition-transform">
                      {dayObj.count}
                    </div>

                    <div className="w-full max-w-[42px] bg-slate-200/80 h-40 rounded-t-xl flex items-end overflow-hidden p-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] border border-slate-300/60">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.35, delay: idx * 0.03 }}
                        className={`w-full rounded-t-lg transition-all relative overflow-hidden ${
                          isSelectedDay
                            ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 shadow-[0_2px_6px_rgba(245,158,11,0.4)]'
                            : 'bg-gradient-to-t from-indigo-700 via-indigo-600 to-sky-400 shadow-[0_2px_6px_rgba(79,70,229,0.3)] group-hover:from-indigo-600 group-hover:to-sky-300'
                        }`}
                      >
                        {/* Specular sheen on pillar */}
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-lg" />
                      </motion.div>
                    </div>

                    <div
                      className={`mt-2 text-xs font-mono-tabular text-center ${
                        isSelectedDay
                          ? 'font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-300'
                          : 'font-semibold text-slate-600'
                      }`}
                    >
                      {dayObj.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
