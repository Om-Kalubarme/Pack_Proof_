import React, { useState, useMemo } from 'react';
import { 
  Megaphone, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Store, 
  AlertCircle, 
  Scale, 
  UserCheck, 
  FileText, 
  Eye, 
  ShieldCheck, 
  DollarSign,
  Building2,
  Phone,
  AlertTriangle,
  Info,
  User,
  Download,
  BellRing
} from 'lucide-react';
import { CitizenComplaint, OfficerProfile, InspectorProfile, InspectionRecord } from '../../types/compliance';
import { SendNoticeToInspectorModal } from './SendNoticeToInspectorModal';
import { SolveComplaintCaseModal } from './SolveComplaintCaseModal';
import { LodgeCitizenComplaintModal } from './LodgeCitizenComplaintModal';
import { generateInspectionReportPDF } from '../../utils/exportUtils';

interface CitizenComplaintsPortalProps {
  complaints: CitizenComplaint[];
  officer: OfficerProfile | null;
  registeredInspectors?: InspectorProfile[];
  onDispatchNotice: (directive: {
    complaintId: string;
    inspectorName: string;
    inspectorId: string;
    areaCircle: string;
    directiveNo: string;
    priority: 'URGENT' | 'HIGH' | 'ROUTINE';
    specialInstructions: string;
    officerName: string;
    officerDesignation: string;
    targetMerchant: string;
    targetAddress: string;
  }) => void;
  onSolveCase: (resolution: {
    complaintId: string;
    actionTaken: 'COMPOUNDED' | 'NOTICE_ISSUED' | 'MERCHANT_COMPLIED' | 'DISMISSED';
    compoundingAmount?: number;
    seizureMemoNo?: string;
    resolutionNotes: string;
    inspectionResult?: string;
    complianceStatus?: 'PASS' | 'FAIL' | 'NOTICE_ISSUED' | 'COMPOUNDED';
    violation?: string;
    severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'COMPLIANT';
  }) => void;
  onLodgeComplaint: (complaint: CitizenComplaint) => void;
  onViewOnMap?: (complaint: CitizenComplaint) => void;
}

export const CitizenComplaintsPortal: React.FC<CitizenComplaintsPortalProps> = ({
  complaints,
  officer,
  registeredInspectors = [],
  onDispatchNotice,
  onSolveCase,
  onLodgeComplaint,
  onViewOnMap
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_DISPATCH' | 'INSPECTION_ORDERED' | 'RESOLVED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modals state
  const [selectedComplaintForNotice, setSelectedComplaintForNotice] = useState<CitizenComplaint | null>(null);
  const [selectedComplaintForSolve, setSelectedComplaintForSolve] = useState<CitizenComplaint | null>(null);
  const [selectedComplaintForView, setSelectedComplaintForView] = useState<CitizenComplaint | null>(null);
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSearch = 
          c.id.toLowerCase().includes(q) ||
          c.shopName.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          (c.reportedProduct && c.reportedProduct.toLowerCase().includes(q)) ||
          (c.assignedInspectorName && c.assignedInspectorName.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      // Status
      if (statusFilter !== 'ALL' && c.status !== statusFilter) {
        return false;
      }

      // Type
      if (typeFilter !== 'ALL' && c.complaintType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [complaints, searchQuery, statusFilter, typeFilter]);

  // Metric counts
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'PENDING_DISPATCH').length;
  const orderedCount = complaints.filter(c => c.status === 'INSPECTION_ORDERED' || c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  // Helper: Download Inspection Report PDF for a complaint
  const handleDownloadReportPDF = (complaint: CitizenComplaint) => {
    const record: InspectionRecord = {
      id: complaint.inspectionCaseId || complaint.id,
      timestamp: complaint.resolvedAt || complaint.complaintDate,
      productName: complaint.reportedProduct || complaint.commodity || 'Packaged Commodity under Verification',
      brand: complaint.brand || 'Verified Brand',
      manufacturer: complaint.shopName,
      batchNo: `BATCH-${complaint.id.slice(-4)}`,
      category: 'Food & Beverages',
      zone: complaint.assignedAreaCircle || complaint.district || 'District Enforcement Circle',
      retailerName: complaint.shopName,
      retailerLocation: `${complaint.address}, ${complaint.district}, ${complaint.state} - ${complaint.pincode}`,
      netQuantity: 'Standard As Declared',
      mrpDeclared: 'Standard As Declared',
      status: complaint.actionTaken === 'COMPOUNDED' ? 'COMPOUNDED' : complaint.actionTaken === 'NOTICE_ISSUED' ? 'NOTICE_ISSUED' : 'PASS',
      severity: (complaint.severity as any) || 'HIGH',
      violations: complaint.violation && complaint.violation !== 'None' ? [{
        code: 'CMP_VIOLATION',
        rule: 'Section 18 / Rule 6',
        title: complaint.violation,
        severity: (complaint.severity as any) || 'HIGH',
        description: complaint.resolutionNotes || complaint.description,
        statutoryClause: 'Legal Metrology Act, 2009',
        penaltyClause: 'Section 36 & 48, Legal Metrology Act, 2009'
      }] : [],
      boundingBoxes: [],
      imageSrc: complaint.photoEvidence || '/placeholder_evidence.svg',
      inspectorName: complaint.assignedInspectorName || 'Designated Area Inspector',
      inspectorId: complaint.assignedInspectorId || 'INSP-AR-2026',
      confidenceScore: 0.98,
      complianceResult: complaint.actionTaken === 'COMPOUNDED' ? 'Notice Issued' : complaint.actionTaken === 'NOTICE_ISSUED' ? 'Notice Issued' : 'Compliant',
      district: complaint.district,
      state: complaint.state,
      pincode: complaint.pincode,
      notes: complaint.resolutionNotes
    };
    generateInspectionReportPDF(record);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] tracking-wider uppercase font-mono border border-rose-200">
              Consumer Grievance Enforcement Cell
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Sec. 15 &amp; Sec. 18 LMA 2009
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Citizen Cases &amp; Area Inspector Assignment
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Review incoming complaints raised by Citizens &amp; NIC Members. Identify and assign cases to local area Inspectors to conduct physical inspection, record violations, resolve grievances, and dispatch automated citizen resolution notices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsLodgeModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-[#001F3F] hover:bg-[#002d5c] text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:shadow-md transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>+ Lodge Citizen Complaint</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Grievances */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Grievances</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Logged across portals</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        {/* Pending Notice Dispatch */}
        <div 
          onClick={() => setStatusFilter('PENDING_DISPATCH')}
          className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-400 transition"
        >
          <div>
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Pending Notice Dispatch</span>
            </span>
            <div className="text-2xl font-bold text-rose-700 mt-1">{pendingCount}</div>
            <span className="text-[11px] text-rose-600 mt-0.5 block font-medium">Requires Officer Directive</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <Send className="w-5 h-5 text-rose-700" />
          </div>
        </div>

        {/* Inspection Ordered */}
        <div 
          onClick={() => setStatusFilter('INSPECTION_ORDERED')}
          className="bg-white rounded-xl border border-sky-200 p-4 shadow-xs flex items-center justify-between cursor-pointer hover:border-sky-400 transition"
        >
          <div>
            <span className="text-xs font-semibold text-sky-800 block">Inspection In-Progress</span>
            <div className="text-2xl font-bold text-sky-800 mt-1">{orderedCount}</div>
            <span className="text-[11px] text-sky-600 mt-0.5 block">Squads on field audit</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <Clock className="w-5 h-5 text-sky-700" />
          </div>
        </div>

        {/* Cases Solved & Closed */}
        <div 
          onClick={() => setStatusFilter('RESOLVED')}
          className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition"
        >
          <div>
            <span className="text-xs font-semibold text-emerald-800 block">Cases Solved &amp; Closed</span>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{resolvedCount}</div>
            <span className="text-[11px] text-emerald-600 mt-0.5 block font-medium">Compounded / Rectified</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant, address, product, ticket ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          
          {/* Status filter buttons */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-[11px]">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Cases ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING_DISPATCH')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                statusFilter === 'PENDING_DISPATCH' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Pending Cases ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('INSPECTION_ORDERED')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                statusFilter === 'INSPECTION_ORDERED' ? 'bg-sky-700 text-white shadow-2xs' : 'text-sky-700 hover:text-sky-900'
              }`}
            >
              Assigned for Inspection ({orderedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                statusFilter === 'RESOLVED' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Resolved Cases ({resolvedCount})
            </button>
          </div>

          {/* Offense category dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Alleged Offenses</option>
            <option value="Overcharging above MRP">Overcharging above MRP</option>
            <option value="Dual MRP Sticker">Dual MRP Sticker</option>
            <option value="Missing Unit Sale Price (USP)">Missing Unit Sale Price (USP)</option>
          </select>

        </div>

      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Case ID &amp; Complainant</th>
                <th className="py-3 px-4">Target Merchant &amp; Location</th>
                <th className="py-3 px-4">Commodity &amp; Offense</th>
                <th className="py-3 px-4">Enforcement Status</th>
                <th className="py-3 px-4">Assigned Area Inspector</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Megaphone className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm">No citizen complaints found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the filters or click "+ Lodge Citizen Complaint" to simulate consumer complaints.</p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const isPending = c.status === 'PENDING_DISPATCH';
                  const isOrdered = c.status === 'INSPECTION_ORDERED' || c.status === 'IN_PROGRESS';
                  const isSolved = c.status === 'RESOLVED';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* 1. Case ID & Complainant */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{c.id}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>{c.complainantType || 'Citizen'}: {c.complainantName || c.source}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(c.complaintDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      {/* 2. Target Merchant & Location */}
                      <td className="py-3.5 px-4 align-top max-w-[220px]">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {c.shopName}
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-start gap-1 mt-0.5 line-clamp-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{c.address}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {c.district}, {c.state} • {c.pincode}
                        </div>
                      </td>

                      {/* 3. Commodity & Offense */}
                      <td className="py-3.5 px-4 align-top max-w-[220px]">
                        <span className={`inline-block font-bold text-xs px-2 py-0.5 rounded border ${
                          c.complaintType === 'Overcharging above MRP'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : c.complaintType === 'Dual MRP Sticker'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {c.complaintType}
                        </span>
                        <div className="text-[11px] font-medium text-slate-700 mt-1 truncate">
                          📦 {c.reportedProduct || c.commodity || 'Pre-Packaged Goods'} {c.brand ? `• ${c.brand}` : ''}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">
                          "{c.description}"
                        </p>
                      </td>

                      {/* 4. Enforcement Status */}
                      <td className="py-3.5 px-4 align-top space-y-1">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                            <span>Pending Notice</span>
                          </span>
                        )}
                        {isOrdered && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-sky-700" />
                              <span>Inspection Assigned</span>
                            </span>
                            {c.noticeDirectiveNo && (
                              <div className="text-[10px] font-mono text-sky-700">
                                {c.noticeDirectiveNo}
                              </div>
                            )}
                          </div>
                        )}
                        {isSolved && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Resolved Case</span>
                            </span>
                            {c.actionTaken && (
                              <div className="text-[10px] font-bold text-emerald-700">
                                {c.actionTaken === 'COMPOUNDED' ? `Compounded (₹${c.compoundingAmount?.toLocaleString('en-IN')})` : c.actionTaken}
                              </div>
                            )}
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <BellRing className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Citizen Notified</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 5. Assigned Area Inspector */}
                      <td className="py-3.5 px-4 align-top">
                        {c.assignedInspectorName ? (
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-sky-700" />
                              <span>{c.assignedInspectorName}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                              {c.assignedInspectorId}
                            </div>
                            {c.assignedAreaCircle && (
                              <div className="text-[10px] text-slate-600 line-clamp-1">
                                {c.assignedAreaCircle}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            Not yet assigned
                          </span>
                        )}
                      </td>

                      {/* 6. Officer Directive Action */}
                      <td className="py-3.5 px-4 align-top text-right space-y-1.5">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => setSelectedComplaintForNotice(c)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-xs hover:shadow-md transition cursor-pointer active:scale-95 animate-bounce-short"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Assign to Area Inspector</span>
                          </button>
                        )}

                        {isOrdered && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedComplaintForSolve(c)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Record Inspection &amp; Solve</span>
                            </button>
                          </div>
                        )}

                        {isSolved && (
                          <div className="flex flex-col items-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleDownloadReportPDF(c)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-[11px] border border-sky-200 transition cursor-pointer shadow-2xs"
                              title={`Download Inspection Report PDF for ${c.id}`}
                            >
                              <FileText className="w-3 h-3 text-sky-700" />
                              <span>Report PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedComplaintForView(c)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-slate-600" />
                              <span>View Resolution</span>
                            </button>
                          </div>
                        )}

                        {/* Quick View Details */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedComplaintForView(c)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
                          >
                            View Grievance Dossier
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Modal 1: Send Statutory Notice to Area Inspector */}
      <SendNoticeToInspectorModal
        isOpen={!!selectedComplaintForNotice}
        onClose={() => setSelectedComplaintForNotice(null)}
        complaint={selectedComplaintForNotice}
        officer={officer}
        registeredInspectors={registeredInspectors}
        onDispatchNotice={(directive) => {
          onDispatchNotice(directive);
          setSelectedComplaintForNotice(null);
        }}
      />

      {/* Modal 2: Inspector Solves Case */}
      <SolveComplaintCaseModal
        isOpen={!!selectedComplaintForSolve}
        onClose={() => setSelectedComplaintForSolve(null)}
        complaint={selectedComplaintForSolve}
        onSolveCase={(resolution) => {
          onSolveCase(resolution);
          setSelectedComplaintForSolve(null);
        }}
      />

      {/* Modal 3: Lodge New Citizen Grievance */}
      <LodgeCitizenComplaintModal
        isOpen={isLodgeModalOpen}
        onClose={() => setIsLodgeModalOpen(false)}
        onLodgeComplaint={(complaint) => {
          onLodgeComplaint(complaint);
          setIsLodgeModalOpen(false);
        }}
      />

      {/* Modal 4: View Grievance & Resolution Detail Modal */}
      {selectedComplaintForView && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Grievance Dossier #{selectedComplaintForView.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaintForView(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Case ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedComplaintForView.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Complainant:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedComplaintForView.complainantType || 'Citizen'}: {selectedComplaintForView.complainantName || selectedComplaintForView.source} {selectedComplaintForView.complainantPhone ? `(${selectedComplaintForView.complainantPhone})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant / Retailer:</span>
                  <strong className="text-slate-900">{selectedComplaintForView.shopName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Address &amp; Location:</span>
                  <span className="text-right text-slate-700 max-w-[240px]">{selectedComplaintForView.address}, {selectedComplaintForView.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Commodity &amp; Brand:</span>
                  <span className="text-slate-800 font-semibold">{selectedComplaintForView.reportedProduct || selectedComplaintForView.commodity || 'Pre-Packaged Goods'} {selectedComplaintForView.brand ? `(${selectedComplaintForView.brand})` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reported Offense:</span>
                  <span className="font-bold text-rose-700">{selectedComplaintForView.complaintType}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">Grievance Statement:</span>
                <p className="text-slate-700 italic leading-relaxed">
                  "{selectedComplaintForView.description}"
                </p>
              </div>

              {/* Notice Directive info if dispatched */}
              {selectedComplaintForView.noticeDirectiveNo && (
                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 space-y-1">
                  <span className="font-bold text-sky-900 block">Statutory Area Directive Transmitted:</span>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-sky-700">Directive Ref:</span>
                    <span className="font-mono font-bold text-sky-900">{selectedComplaintForView.noticeDirectiveNo}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-sky-700">Assigned Area Inspector:</span>
                    <span className="font-bold text-sky-900">{selectedComplaintForView.assignedInspectorName}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-sky-700">Jurisdiction Circle:</span>
                    <span className="text-sky-800">{selectedComplaintForView.assignedAreaCircle}</span>
                  </div>
                </div>
              )}

              {/* Resolution details if solved */}
              {selectedComplaintForView.status === 'RESOLVED' && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Case Solved &amp; Closed</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadReportPDF(selectedComplaintForView)}
                      className="px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Download Report PDF</span>
                    </button>
                  </div>
                  
                  {selectedComplaintForView.inspectionResult && (
                    <div className="text-[11px] text-emerald-900">
                      <strong>Inspection Result:</strong> {selectedComplaintForView.inspectionResult}
                    </div>
                  )}

                  {selectedComplaintForView.actionTaken && (
                    <div className="text-[11px] text-emerald-800 font-semibold">
                      Action Taken: {selectedComplaintForView.actionTaken}
                    </div>
                  )}
                  {selectedComplaintForView.compoundingAmount && (
                    <div className="text-[11px] text-emerald-800 font-semibold">
                      Compounding Fine Collected: ₹{selectedComplaintForView.compoundingAmount.toLocaleString('en-IN')}
                    </div>
                  )}
                  {selectedComplaintForView.seizureMemoNo && (
                    <div className="text-[11px] font-mono text-emerald-800">
                      Seizure Memo: {selectedComplaintForView.seizureMemoNo}
                    </div>
                  )}
                  {selectedComplaintForView.resolutionNotes && (
                    <p className="text-[11px] text-slate-700 italic border-t border-emerald-200 pt-1 mt-1">
                      "{selectedComplaintForView.resolutionNotes}"
                    </p>
                  )}

                  {/* Citizen Resolution Notification Record */}
                  <div className="mt-2 p-2 rounded bg-emerald-100/70 border border-emerald-300 text-[11px] text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-emerald-900">
                      <Send className="w-3 h-3 text-emerald-700" />
                      <span>Citizen Notification Dispatched</span>
                    </div>
                    <p className="text-[10px] text-emerald-800">
                      SMS sent to {selectedComplaintForView.complainantName || 'Citizen'} ({selectedComplaintForView.complainantPhone || '+91 98200 XXXXX'}):
                    </p>
                    <p className="text-[10px] font-mono bg-white/80 p-1.5 rounded border border-emerald-200 text-slate-800">
                      "Dear Citizen, your complaint Case #{selectedComplaintForView.id} regarding {selectedComplaintForView.shopName} has been investigated by the Legal Metrology Area Inspector and resolved. Action: {selectedComplaintForView.actionTaken}. Inspection report filed."
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 gap-2">
              {selectedComplaintForView.status === 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => handleDownloadReportPDF(selectedComplaintForView)}
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Report PDF</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedComplaintForView(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs transition"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
