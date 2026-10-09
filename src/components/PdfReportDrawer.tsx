import React, { useState } from 'react';
import { FileDown, Printer, X } from 'lucide-react';
import { StaffMemberRecord } from '../data/hotelLoyaltyData';
import { generateManagementPdfReport } from '../utils/pdfReportExporter';

interface PdfReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  monthKey: string;
  monthLabel: string;
  selectedDateIso: string;
  staffRecords: StaffMemberRecord[];
  includeStaffIds?: boolean;
  onExportComplete: (filename: string) => void;
}

export const PdfReportDrawer: React.FC<PdfReportDrawerProps> = ({
  isOpen,
  onClose,
  monthKey,
  monthLabel,
  selectedDateIso,
  staffRecords,
  includeStaffIds = false,
  onExportComplete
}) => {
  const [reportTitle, setReportTitle] = useState(
    `Front Desk Staff Daily Rewards Leaderboard & Monthly Audit (${monthLabel})`
  );
  const [preparedBy, setPreparedBy] = useState('Front Office Manager');
  const [executiveNotes, setExecutiveNotes] = useState(
    'Official monthly audit of verified 16-digit guest rewards numbers recorded across the front desk.'
  );

  if (!isOpen) return null;

  const handleGeneratePdf = (e: React.FormEvent) => {
    e.preventDefault();
    const savedFilename = generateManagementPdfReport({
      reportTitle,
      monthKey,
      monthLabel,
      selectedDateIso,
      preparedBy,
      executiveNotes,
      staffRecords,
      includeStaffIds
    });
    onExportComplete(savedFilename);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-xl h-full overflow-y-auto border-l border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs text-slate-500">Management Audit &amp; PDF Export</div>
              <h2 className="text-lg font-semibold text-slate-900">
                Export Staff Leaderboard &amp; Monthly Rewards PDF
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
              aria-label="Close report drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form id="pdf-export-form" onSubmit={handleGeneratePdf} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-800 mb-1">Report Document Title</label>
              <input
                type="text"
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-800 mb-1">Prepared By</label>
              <input
                type="text"
                required
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-800 mb-1">
                Management Review Notes
              </label>
              <textarea
                rows={4}
                value={executiveNotes}
                onChange={(e) => setExecutiveNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900 leading-relaxed"
              />
            </div>
          </form>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              setTimeout(() => window.print(), 150);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Leaderboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="pdf-export-form"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
