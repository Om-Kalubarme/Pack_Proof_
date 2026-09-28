import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  FileText, 
  ArrowRight, 
  MapPin, 
  Building2
} from 'lucide-react';
import { EnforcementAlert } from '../../types/compliance';

interface EnforcementAlertsProps {
  alerts: EnforcementAlert[];
  onOpenNotice: (recordId: string) => void;
  onSelectAlertRecord: (recordId: string) => void;
}

export const EnforcementAlerts: React.FC<EnforcementAlertsProps> = ({
  alerts,
  onOpenNotice,
  onSelectAlertRecord
}) => {
  return (
    <section className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-5">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-slate-200/80 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              My Urgent Action Alerts
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Time-sensitive statutory enforcement actions assigned under Legal Metrology Act, 2009
          </p>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50/80 text-amber-800 border border-amber-200/60 font-medium self-start sm:self-auto">
          {alerts.length} Pending Actions
        </span>
      </div>

      {/* Alerts Grid */}
      {alerts.length === 0 ? (
        <div className="py-10 text-center text-slate-400 bg-white rounded-lg border border-slate-200 mt-4 text-xs font-medium">
          No pending urgent action alerts. All statutory enforcement actions are up to date.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4">
          {alerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          return (
            <div 
              key={alert.id}
              className={`p-3.5 sm:p-4 rounded-lg border border-slate-200 transition-all text-xs flex flex-col justify-between bg-white ${
                isCritical 
                  ? 'border-l-3 border-l-rose-600 hover:border-slate-300' 
                  : 'border-l-3 border-l-amber-600 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Alert Top Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                      isCritical 
                        ? 'bg-rose-100 text-rose-800 border-rose-300' 
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="font-mono text-[11px] text-blue-700 font-bold">
                      {alert.inspectionId}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{alert.deadline}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-xs leading-snug">
                  {alert.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {alert.description}
                </p>

                {/* Retailer & Premise */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{alert.retailerName}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate text-slate-400">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{alert.location}</span>
                  </div>
                </div>

                {/* Statutory Clause */}
                <div className="mt-1.5 text-[10px] text-slate-500">
                  <strong>Statute:</strong> {alert.statutoryClause}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <button
                  onClick={() => onSelectAlertRecord(alert.inspectionId)}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                >
                  <span>View Inspection</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onOpenNotice(alert.inspectionId)}
                  className={`py-1 px-2.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                    isCritical
                      ? 'bg-rose-800 hover:bg-rose-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>{alert.actionLabel}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
      )}

    </section>
  );
};
