import React, { useState } from 'react';
import { 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertOctagon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  MapPin, 
  Clock,
  User
} from 'lucide-react';
import { InspectionRecord } from '../../types/compliance';
import { generateInspectionReportPDF } from '../../utils/exportUtils';

interface InspectionTableProps {
  records: InspectionRecord[];
  onOpenEvidence: (record: InspectionRecord) => void;
  onOpenNotice: (record: InspectionRecord) => void;
  selectedRecords?: InspectionRecord[];
  onToggleSelectRecord?: (record: InspectionRecord) => void;
  onSelectAllVisible?: (records: InspectionRecord[]) => void;
  onSelectRecord?: (record: InspectionRecord) => void;
  activeRecordId?: string;
}

export const InspectionTable: React.FC<InspectionTableProps> = ({
  records,
  onOpenEvidence,
  onOpenNotice,
  selectedRecords = [],
  onToggleSelectRecord,
  onSelectAllVisible,
  onSelectRecord,
  activeRecordId
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(records.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + rowsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50/80 text-emerald-800 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Compliant</span>
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50/80 text-rose-800 border border-rose-200/60">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            <span>Violation</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50/80 text-blue-800 border border-blue-200/60">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>In Progress</span>
          </span>
        );
      case 'PENDING':
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50/80 text-amber-800 border border-amber-200/60">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'NOTICE_ISSUED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50/80 text-purple-800 border border-purple-200/60">
            <FileText className="w-3 h-3 text-purple-600" />
            <span>Form VI Issued</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 border border-rose-200/60 uppercase tracking-wider">Critical</span>;
      case 'HIGH':
        return <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-orange-50 text-orange-800 border border-orange-200/60 uppercase tracking-wider">High</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60 uppercase tracking-wider">Medium</span>;
      case 'COMPLIANT':
      default:
        return <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 uppercase tracking-wider">Clear</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden">
      
      {/* Table Header / Action Info */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Inspection Cases &amp; Enforcement Records
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {records.length} Cases
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Central register of pre-packaged commodity enforcement verifications across all designated officers &amp; field inspectors
          </p>
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Display per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded py-1 px-2 text-xs text-slate-700 bg-white font-medium cursor-pointer focus:outline-none focus:border-blue-600"
          >
            <option value={5}>5 records</option>
            <option value={10}>10 records</option>
            <option value={20}>20 records</option>
            <option value={50}>50 records</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <th className="py-2.5 px-3">Case ID &amp; Date</th>
              <th className="py-2.5 px-3">Business / Retailer</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Commodity &amp; Brand</th>
              <th className="py-2.5 px-3">Inspector</th>
              <th className="py-2.5 px-3">Compliance Status</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No inspection records match the active filter criteria.
                </td>
              </tr>
            ) : (
              currentRecords.map((record) => {
                const isSelected = selectedRecords.some(r => r.id === record.id);
                const isActive = activeRecordId === record.id;
                return (
                  <tr 
                    key={record.id}
                    onClick={() => onSelectRecord && onSelectRecord(record)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isActive ? 'bg-blue-50/40 border-l-2 border-blue-600' : isSelected ? 'bg-slate-50' : ''
                    }`}
                  >
                    {/* Case ID & Date */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-700 text-xs">
                        {record.id}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(record.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Business Name */}
                    <td className="py-3 px-3 max-w-[180px]">
                      <div className="font-semibold text-slate-900 truncate" title={record.retailerName}>
                        {record.retailerName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {record.zone}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 max-w-[160px]">
                      <div className="text-slate-600 truncate flex items-center gap-1" title={record.retailerLocation}>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{record.retailerLocation}</span>
                      </div>
                    </td>

                    {/* Product & Brand */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-medium text-slate-900 truncate" title={record.productName}>
                        {record.productName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        Brand: <span className="font-medium text-slate-700">{record.brand}</span>
                      </div>
                    </td>

                    {/* Inspector */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-800 font-medium flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{record.inspectorName.replace('Inspector ', '')}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {record.inspectorId}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>

                    {/* Severity Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getSeverityBadge(record.severity)}
                    </td>

                    {/* Actions */}
                    <td 
                      className="py-3 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => onOpenEvidence(record)}
                          className="px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded transition flex items-center gap-1 shadow-2xs whitespace-nowrap"
                          title="Inspect Evidence & Declarations"
                        >
                          <Eye className="w-3 h-3 text-slate-600" />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => generateInspectionReportPDF(record)}
                          className="px-2 py-0.5 text-[11px] font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition flex items-center gap-1 shadow-2xs whitespace-nowrap"
                          title={`Download Inspection Report PDF for ${record.id}`}
                        >
                          <FileText className="w-3 h-3 text-sky-700" />
                          <span>Report PDF</span>
                        </button>

                        {(record.status === 'FAIL' || record.status === 'NOTICE_ISSUED') && (
                          <button
                            onClick={() => onOpenNotice(record)}
                            className="px-2 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition flex items-center gap-1 whitespace-nowrap"
                            title="Generate Form VI Statutory Notice"
                          >
                            <FileText className="w-3 h-3 text-rose-600" />
                            <span>Notice</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
        <div>
          Showing <span className="font-semibold text-slate-900">{records.length > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-900">{Math.min(startIndex + rowsPerPage, records.length)}</span> of{' '}
          <span className="font-semibold text-slate-900">{records.length}</span> inspections
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2.5 py-0.5 text-slate-700 font-medium font-mono">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
