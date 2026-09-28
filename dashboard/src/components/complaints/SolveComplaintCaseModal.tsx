import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Scale, 
  FileText, 
  AlertTriangle, 
  DollarSign, 
  Sparkles,
  Award,
  Send
} from 'lucide-react';
import { CitizenComplaint } from '../../types/compliance';

interface SolveComplaintCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: CitizenComplaint | null;
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
}

export const SolveComplaintCaseModal: React.FC<SolveComplaintCaseModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onSolveCase
}) => {
  const [actionTaken, setActionTaken] = useState<'COMPOUNDED' | 'NOTICE_ISSUED' | 'MERCHANT_COMPLIED' | 'DISMISSED'>('COMPOUNDED');
  const [compoundingAmount, setCompoundingAmount] = useState<number>(25000);
  const [seizureMemoNo, setSeizureMemoNo] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [inspectionResult, setInspectionResult] = useState<string>('Violation Confirmed on Physical Inspection');
  const [complianceStatus, setComplianceStatus] = useState<'PASS' | 'FAIL' | 'NOTICE_ISSUED' | 'COMPOUNDED'>('COMPOUNDED');
  const [violation, setViolation] = useState<string>('Overcharging above MRP');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'COMPLIANT'>('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!complaint) return;
    const randomMemo = Math.floor(1000 + Math.random() * 9000);
    setSeizureMemoNo(`SZR-2026-${randomMemo}`);
    setViolation(complaint.complaintType || 'Overcharging above MRP');

    if (complaint.complaintType === 'Overcharging above MRP') {
      setActionTaken('COMPOUNDED');
      setComplianceStatus('COMPOUNDED');
      setSeverity('HIGH');
      setInspectionResult('Violation Confirmed on Physical Audit');
      setCompoundingAmount(25000);
      setResolutionNotes(
        `Inspector conducted physical spot audit at ${complaint.shopName}. Confirmed billing override exceeding printed MRP. Offence compounded on-site under Section 48 of Legal Metrology Act, 2009. Fine deposited and billing software rectified.`
      );
    } else if (complaint.complaintType === 'Dual MRP Sticker') {
      setActionTaken('NOTICE_ISSUED');
      setComplianceStatus('NOTICE_ISSUED');
      setSeverity('CRITICAL');
      setInspectionResult('Physical Inspection Verified Tampered Price Stickers');
      setResolutionNotes(
        `Inspector verified physical stock at ${complaint.shopName}. Seized non-conforming packages with adhesive overlay stickers. Form VI Statutory Seizure Notice issued to retailer and packer under Section 15(2) and Section 36.`
      );
    } else {
      setActionTaken('MERCHANT_COMPLIED');
      setComplianceStatus('PASS');
      setSeverity('MEDIUM');
      setInspectionResult('Inspector Audited Stock - Merchant Complied On-Site');
      setResolutionNotes(
        `Inspector audited pre-packaged goods at ${complaint.shopName}. Merchant instructed to affix compliant Unit Sale Price declarations under Rule 6(11). Re-inspection verified full compliance.`
      );
    }
  }, [complaint]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Play pleasant resolution success chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // AudioContext unavailable
    }

    setTimeout(() => {
      onSolveCase({
        complaintId: complaint.id,
        actionTaken: actionTaken,
        compoundingAmount: actionTaken === 'COMPOUNDED' ? compoundingAmount : undefined,
        seizureMemoNo: actionTaken === 'NOTICE_ISSUED' ? seizureMemoNo : undefined,
        resolutionNotes: resolutionNotes,
        inspectionResult: inspectionResult,
        complianceStatus: complianceStatus,
        violation: actionTaken === 'DISMISSED' ? 'None' : violation,
        severity: actionTaken === 'DISMISSED' ? 'COMPLIANT' : severity
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 sm:p-5 flex items-start justify-between relative overflow-hidden">
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-white/20 text-emerald-100 font-mono">
                  Inspector Field Report
                </span>
                <span className="text-xs text-emerald-100/80 font-mono">
                  Order: {complaint.noticeDirectiveNo || `DIR-${complaint.id.slice(-4)}`}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 leading-tight">
                Complete Field Inspection &amp; Solve Case
              </h2>
              <p className="text-xs text-emerald-100/70 mt-0.5">
                Record official enforcement action taken by Area Inspector
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Target Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Case ID:</span>
              <span className="font-mono font-bold text-emerald-800 text-xs">{complaint.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Business / Retailer:</span>
              <strong className="text-slate-900 font-bold text-xs">{complaint.shopName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Commodity / Product:</span>
              <span className="text-slate-800 font-semibold">{complaint.reportedProduct || complaint.commodity || 'Pre-Packaged Goods'} {complaint.brand ? `(${complaint.brand})` : ''}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Location:</span>
              <span className="text-slate-700">{complaint.address}, {complaint.district}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Assigned Area Inspector:</span>
              <span className="font-semibold text-slate-800">
                {complaint.assignedInspectorName || 'Designated Area Inspector'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Original Grievance:</span>
              <span className="font-bold text-rose-700">{complaint.complaintType}</span>
            </div>
          </div>

          {/* Section: Inspector Physical Inspection Findings */}
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg space-y-3">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Inspector Physical Inspection Record</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Inspection Result */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Inspection Result <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={inspectionResult}
                  onChange={(e) => setInspectionResult(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Violation Confirmed on Physical Audit"
                  required
                />
              </div>

              {/* Compliance Status */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Compliance Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={complianceStatus}
                  onChange={(e) => setComplianceStatus(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="COMPOUNDED">COMPOUNDED (Compounding Fee Paid)</option>
                  <option value="NOTICE_ISSUED">NOTICE_ISSUED (Form VI Seizure Issued)</option>
                  <option value="PASS">PASS (Complied / Rectified)</option>
                  <option value="FAIL">FAIL (Non-Compliant)</option>
                </select>
              </div>

              {/* Violation, if any */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Violation (If Any)
                </label>
                <input
                  type="text"
                  value={violation}
                  onChange={(e) => setViolation(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Overcharging above MRP or None"
                />
              </div>

              {/* Severity, if applicable */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                  <option value="COMPLIANT">COMPLIANT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Taken Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">
              Official Enforcement Action Taken <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionTaken('COMPOUNDED');
                  setComplianceStatus('COMPOUNDED');
                }}
                className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                  actionTaken === 'COMPOUNDED'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">⚖️ Compounded Offence</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-800 px-1 rounded">Sec. 48</span>
                </div>
                <span className="text-[10px] text-slate-600">Compounding penalty paid by retailer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionTaken('NOTICE_ISSUED');
                  setComplianceStatus('NOTICE_ISSUED');
                }}
                className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                  actionTaken === 'NOTICE_ISSUED'
                    ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">📋 Seizure &amp; Form VI</span>
                  <span className="text-[10px] font-mono font-bold bg-rose-200 text-rose-800 px-1 rounded">Sec. 15(2)</span>
                </div>
                <span className="text-[10px] text-slate-600">Offending stock seized &amp; notice served</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionTaken('MERCHANT_COMPLIED');
                  setComplianceStatus('PASS');
                }}
                className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                  actionTaken === 'MERCHANT_COMPLIED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">✅ Rectified &amp; Complied</span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-800 px-1 rounded">Rule 6</span>
                </div>
                <span className="text-[10px] text-slate-600">Discrepancy rectified on-site</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionTaken('DISMISSED');
                  setComplianceStatus('PASS');
                  setViolation('None');
                  setSeverity('COMPLIANT');
                }}
                className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                  actionTaken === 'DISMISSED'
                    ? 'bg-slate-100 border-slate-500 text-slate-950 ring-2 ring-slate-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">🔍 Unfounded / Dismissed</span>
                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-1 rounded">Closed</span>
                </div>
                <span className="text-[10px] text-slate-600">Verification showed no violation</span>
              </button>
            </div>
          </div>

          {/* Conditional Input: Compounding Fee */}
          {actionTaken === 'COMPOUNDED' && (
            <div className="space-y-1.5 p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
              <label className="text-xs font-bold text-amber-900 flex items-center justify-between">
                <span>Compounding Fee Amount (₹ INR):</span>
                <span className="text-[10px] text-amber-700 font-mono">Sec. 48 LMA 2009</span>
              </label>
              <input
                type="number"
                value={compoundingAmount}
                onChange={(e) => setCompoundingAmount(Number(e.target.value))}
                step={5000}
                min={5000}
                className="w-full p-2 bg-white border border-amber-300 rounded text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Conditional Input: Seizure Memo */}
          {actionTaken === 'NOTICE_ISSUED' && (
            <div className="space-y-1.5 p-3 bg-rose-50/50 border border-rose-200 rounded-lg">
              <label className="text-xs font-bold text-rose-900 flex items-center justify-between">
                <span>Official Seizure Memo Number:</span>
                <span className="text-[10px] text-rose-700 font-mono">Form VI Schedule</span>
              </label>
              <input
                type="text"
                value={seizureMemoNo}
                onChange={(e) => setSeizureMemoNo(e.target.value)}
                className="w-full p-2 bg-white border border-rose-300 rounded text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* Inspector Findings & Resolution Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 block">
              Inspection / Report Details &amp; Resolution Memo <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
              placeholder="Detail the physical inspection findings, merchant response, and resolution outcome..."
              required
            />
          </div>

          {/* Requirement 7: Citizen Notification Dispatch Preview */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
            <Send className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <span className="font-bold block">Automated Citizen Resolution Notification</span>
              <p className="text-[11px] text-emerald-800/90 mt-0.5">
                Upon submitting, a formal resolution SMS / notification will be sent to complainant <strong>{complaint.complainantName || 'Citizen'}</strong> ({complaint.complainantPhone || '+91 98200 XXXXX'}) confirming that Case <strong>#{complaint.id}</strong> has been resolved with action taken ({actionTaken}).
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-200/70 font-medium text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving Resolution...' : 'Submit Resolution & Solve Case'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
