import React from 'react';
import { 
  Scan, 
  AlertTriangle, 
  ShieldCheck, 
  ClockAlert, 
  TrendingUp, 
  FileWarning
} from 'lucide-react';
import { KpiMetrics, TimeFilter } from '../../types/compliance';

interface KpiSummaryBarProps {
  metrics: KpiMetrics;
  activeFilter: TimeFilter;
}

export const KpiSummaryBar: React.FC<KpiSummaryBarProps> = ({ metrics, activeFilter }) => {
  const getFilterPeriodLabel = () => {
    switch (activeFilter) {
      case 'today':
        return 'vs. yesterday';
      case 'weekly':
        return 'vs. last 7 days';
      case 'monthly':
        return 'vs. prior month';
      case 'custom':
        return 'vs. preceding period';
    }
  };

  const periodText = getFilterPeriodLabel();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Scans */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Packages Scanned
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-sans tracking-tight">
              {metrics.totalScans.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Scan className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{metrics.scansDeltaPct}%</span>
          </div>
          <span className="text-slate-400">{periodText}</span>
        </div>
      </div>

      {/* KPI 2: Total Violations Found */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500"></div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Violations Detected
            </span>
            <div className="text-3xl font-extrabold text-rose-600 mt-2 font-sans tracking-tight">
              {metrics.totalViolations.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-semibold text-rose-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{metrics.violationsDeltaPct}% non-compliant</span>
          </div>
          <span className="text-slate-400">
            {(metrics.totalViolations / (metrics.totalScans || 1) * 100).toFixed(1)}% fail rate
          </span>
        </div>
      </div>

      {/* KPI 3: Compliance Rate */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Overall Compliance Rate
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-extrabold font-sans tracking-tight ${
                metrics.complianceRate >= 80 ? 'text-emerald-600' : metrics.complianceRate >= 65 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {metrics.complianceRate.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-medium">LMPC Standard</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mt-3.5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-400"
            style={{ width: `${Math.min(100, Math.max(0, metrics.complianceRate))}%` }}
          ></div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{metrics.complianceDeltaPct}%</span>
          </div>
          <span className="text-slate-400">{periodText}</span>
        </div>
      </div>

      {/* KPI 4: Critical Pending Violations */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-red-600"></div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Critical Pending Actions
            </span>
            <div className="text-3xl font-extrabold text-amber-600 mt-2 font-sans tracking-tight">
              {metrics.criticalPending}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ClockAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-700 font-medium">
            <FileWarning className="w-3.5 h-3.5 text-amber-500" />
            <span>Form VI Notice Required</span>
          </div>
          <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[10px]">
            Immediate
          </span>
        </div>
      </div>
    </div>
  );
};
