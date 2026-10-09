import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StaffMemberRecord } from '../data/hotelLoyaltyData';

export interface PdfExportOptions {
  reportTitle: string;
  monthKey: string;
  monthLabel: string;
  selectedDateIso: string;
  preparedBy: string;
  executiveNotes: string;
  staffRecords: StaffMemberRecord[];
  includeStaffIds?: boolean;
}

export function generateManagementPdfReport(options: PdfExportOptions): string {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 44;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 82, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(
    options.reportTitle || `Approved Staff Rewards Leaderboard & Monthly Report (${options.monthLabel})`,
    40,
    36
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  const timestampStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  doc.text(
    `Month: ${options.monthLabel}   |   Target Day: ${options.selectedDateIso}   |   Approved by: ${options.preparedBy}   |   Generated: ${timestampStr}`,
    40,
    58
  );

  cursorY = 106;

  // Rank staff strictly by Manager-Approved monthly total
  const rankedStaff = [...options.staffRecords]
    .map((staff) => {
      const approvedMonthEntries = staff.entries.filter(
        (e) => e.dateIso.startsWith(options.monthKey) && e.status === 'approved'
      );
      const pendingMonthEntries = staff.entries.filter(
        (e) => e.dateIso.startsWith(options.monthKey) && e.status === 'pending'
      );
      const approvedDayEntries = staff.entries.filter(
        (e) => e.dateIso === options.selectedDateIso && e.status === 'approved'
      );

      return {
        ...staff,
        monthCount: approvedMonthEntries.length,
        pendingCount: pendingMonthEntries.length,
        dayCount: approvedDayEntries.length,
        approvedMonthEntries
      };
    })
    .sort((a, b) =>
      b.monthCount !== a.monthCount ? b.monthCount - a.monthCount : b.dayCount - a.dayCount
    );

  const totalMonthRewards = rankedStaff.reduce((acc, s) => acc + s.monthCount, 0);
  const totalDayRewards = rankedStaff.reduce((acc, s) => acc + s.dayCount, 0);
  const totalPendingRewards = rankedStaff.reduce((acc, s) => acc + s.pendingCount, 0);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`1. Official Manager-Approved Staff Leaderboard (${options.monthLabel})`, 40, cursorY);
  cursorY += 12;

  autoTable(doc, {
    startY: cursorY,
    head: [
      [
        'Rank',
        'Staff ID',
        'Staff Name',
        `Approved on ${options.selectedDateIso}`,
        `${options.monthLabel} Approved Total`,
        'Pending Approval',
        'Monthly Goal',
        'Latest Approved 16-Digit Rewards Numbers'
      ]
    ],
    body: rankedStaff.map((s, idx) => [
      `#${idx + 1}`,
      options.includeStaffIds ? s.staffLoginId : 'Protected',
      s.staffName,
      s.dayCount.toString(),
      s.monthCount.toString(),
      s.pendingCount.toString(),
      s.monthlyGoal.toString(),
      s.approvedMonthEntries
        .slice(0, 2)
        .map((e) => `${e.rewardsNumber} (${e.reservationNumber})`)
        .join(', ') || 'None'
    ]),
    foot: [
      [
        'TOTAL',
        '-',
        `${rankedStaff.length} Staff Members`,
        totalDayRewards.toString(),
        totalMonthRewards.toString(),
        totalPendingRewards.toString(),
        '-',
        'Manager Verified & Audited'
      ]
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [180, 83, 9],
      textColor: [255, 255, 255],
      fontSize: 8.5
    },
    footStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    margin: { left: 40, right: 40 }
  });

  // @ts-expect-error jspdf-autotable attaches lastAutoTable
  cursorY = doc.lastAutoTable.finalY + 22;

  if (options.executiveNotes.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Manager Audit Notes:', 40, cursorY);
    cursorY += 13;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitNotes = doc.splitTextToSize(options.executiveNotes.trim(), pageWidth - 80);
    doc.text(splitNotes, 40, cursorY);
  }

  const filename = `approved-staff-rewards-leaderboard-${options.monthKey}.pdf`;
  doc.save(filename);
  return filename;
}
