import React from 'react';
import { 
  FileDown, 
  X, 
  FileText,
  Printer
} from 'lucide-react';
import { InspectionRecord } from '../../types/compliance';

interface BulkActionBarProps {
  selectedRecords: InspectionRecord[];
  onClearSelection: () => void;
  onBatchExportCSV: () => void;
  onBatchExportPDF?: () => void;
  onBatchIssueNotices: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedRecords,
  onClearSelection,
  onBatchExportCSV,
  onBatchIssueNotices
}) => {
  if (selectedRecords.length === 0) return null;

  const failureCount = selectedRecords.filter(r => r.status === 'FAIL').length;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 px-5 py-3 flex flex-wrap items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
      
      {/* Selected Indicator */}
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700 text-xs">
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
          {selectedRecords.length}
        </span>
        <span className="font-semibold text-slate-200">
          Selected
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 text-xs">
        <button
          onClick={onBatchExportCSV}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition flex items-center gap-1.5"
        >
          <FileDown className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export CSV</span>
        </button>

        {failureCount > 0 && (
          <button
            onClick={onBatchIssueNotices}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Issue Batch Notices ({failureCount})</span>
          </button>
        )}
      </div>

      {/* Clear Button */}
      <button
        onClick={onClearSelection}
        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ml-2"
        title="Deselect all"
      >
        <X className="w-4 h-4" />
      </button>

    </div>
  );
};
