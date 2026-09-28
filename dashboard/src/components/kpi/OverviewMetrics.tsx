import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight
} from 'lucide-react';
import { InspectionRecord, CitizenComplaint } from '../../types/compliance';

interface OverviewMetricsProps {
  records: InspectionRecord[];
  complaints?: CitizenComplaint[];
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ 
  records,
  complaints = []
}) => {
  // 1. Total Inspection Cases
  const total = records.length;

  // 2. Resolved Cases (Completed inspection cases and resolved citizen complaints)
  const resolved = records.filter(r => 
    r.status === 'PASS' || 
    r.status === 'COMPOUNDED' || 
    r.complianceResult === 'Compliant'
  ).length + complaints.filter(c => c.status === 'RESOLVED').length;

  // 3. Pending Verification (Cases pending field audit/verification)
  const pending = records.filter(r => 
    r.status === 'PENDING' || 
    r.status === 'IN_PROGRESS' ||
    r.complianceResult === 'Under Investigation' ||
    r.complianceResult === 'Pending Verification'
  ).length + complaints.filter(c => c.status === 'PENDING_DISPATCH' || c.status === 'INSPECTION_ORDERED' || c.status === 'IN_PROGRESS').length;

  // 4. Violation Flagged (Infractions detected, non-compliance & Form VI notices)
  const violations = records.filter(r => 
    r.status === 'FAIL' || 
    r.status === 'NOTICE_ISSUED' ||
    r.severity === 'CRITICAL'
  ).length;

  return (
    <section aria-label="Overview Summary Statistics">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Inspection Cases */}
        <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Inspection Cases
            </span>
            <div className="w-7 h-7 rounded bg-slate-100/80 text-slate-600 flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
              {total}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <span className="inline-flex items-center text-emerald-700 font-medium">
                <ArrowUpRight className="w-3 h-3" /> Active
              </span>
              <span>across division</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Resolved Cases */}
        <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Resolved Cases
            </span>
            <div className="w-7 h-7 rounded bg-emerald-50/70 text-emerald-800 flex items-center justify-center border border-emerald-200/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
              {resolved}
            </div>
            <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
              Inspected &amp; resolved
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Verification */}
        <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pending Verification
            </span>
            <div className="w-7 h-7 rounded bg-amber-50/70 text-amber-800 flex items-center justify-center border border-amber-200/50">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
              {pending}
            </div>
            <div className="text-[11px] text-amber-800 font-medium mt-0.5">
              Awaiting verification
            </div>
          </div>
        </div>

        {/* Metric 4: Violation Flagged */}
        <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Violation Flagged
            </span>
            <div className="w-7 h-7 rounded bg-rose-50/70 text-rose-800 flex items-center justify-center border border-rose-200/50">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
              {violations}
            </div>
            <div className="text-[11px] text-rose-700 font-medium mt-0.5">
              Non-compliance flagged
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
