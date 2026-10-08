import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StaffMemberRecord } from '../data/hotelLoyaltyData';

interface CustomizableTelemetryChartProps {
  staffRecords: StaffMemberRecord[];
  monthKey: string;
  monthLabel: string;
  daysInMonth: number;
  selectedDateIso: string;
}

export const CustomizableTelemetryChart: React.FC<CustomizableTelemetryChartProps> = ({
  staffRecords,
  monthKey,
  monthLabel,
  daysInMonth,
  selectedDateIso
}) => {
  const [chartType, setChartType] = useState<'staffBar' | 'dailyTrend'>('staffBar');
  const [focusedStaffId, setFocusedStaffId] = useState<string | 'ALL'>('ALL');

  // Rank staff by Manager-Approved monthly count for the bar chart
  const staffTotals = [...staffRecords]
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
      return {
        ...s,
        monthCount: approvedMonthCount,
        pendingCount: pendingMonthCount,
        dayCount: approvedDayCount
      };
    })
    .sort((a, b) => b.monthCount - a.monthCount);

  const maxStaffCount = Math.max(
    ...staffTotals.map((s) => Math.max(s.monthCount + s.pendingCount, s.monthlyGoal)),
    10
  );

  // Daily trend data across days of the month (Approved rewards)
  const activeDayRange = monthKey === '2026-10' ? 10 : daysInMonth;
  const dailySeries = Array.from({ length: activeDayRange }, (_, idx) => {
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

  const maxDailyCount = Math.max(...dailySeries.map((d) => d.count), 8);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold mb-1">
            <span>Approved Rewards Visual Chart</span>
            <span aria-hidden="true">·</span>
            <span>{monthLabel}</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Staff Monthly Approved Rewards &amp; Daily Trend
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setChartType('staffBar')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                chartType === 'staffBar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Ranking Bars
            </button>
            <button
              type="button"
              onClick={() => setChartType('dailyTrend')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                chartType === 'dailyTrend'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Trend Curve
            </button>
          </div>

          {chartType === 'dailyTrend' && (
            <select
              value={focusedStaffId}
              onChange={(e) => setFocusedStaffId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900"
            >
              <option value="ALL">All 11 Staff Combined</option>
              {staffRecords.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.staffName} ({s.staffLoginId})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {chartType === 'staffBar' ? (
        <div className="mt-6 space-y-3.5">
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
                  <span className="text-xs font-mono-tabular text-slate-400 hidden sm:inline">
                    ({staff.staffLoginId})
                  </span>
                </div>

                <div className="col-span-5 sm:col-span-7 bg-slate-100 h-7 rounded-lg overflow-hidden relative flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.45, delay: idx * 0.03 }}
                    className="h-full rounded-lg flex items-center justify-end pr-2.5 text-xs font-mono-tabular font-bold text-white"
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
      ) : (
        <div className="mt-6">
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
