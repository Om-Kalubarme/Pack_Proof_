import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CheckCircle, 
  Scale,
  Send
} from 'lucide-react';
import { InspectionRecord } from '../../types/compliance';
import { generateFormVINoticePDF } from '../../utils/exportUtils';

interface NoticeGeneratorModalProps {
  record: InspectionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onNoticeDispatched: (recordId: string) => void;
}

export const NoticeGeneratorModal: React.FC<NoticeGeneratorModalProps> = ({
  record,
  isOpen,
  onClose,
  onNoticeDispatched
}) => {
  const [responseDays, setResponseDays] = useState(15);
  const [compoundingOption, setCompoundingOption] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !record) return null;

  const handleDispatch = () => {
    setIsSubmitted(true);
    onNoticeDispatched(record.id);
  };

  const handleDownload = () => {
    generateFormVINoticePDF(record);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">
                Statutory Notice Drafting Engine (Form VI)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Rule 32 • Legal Metrology (Packaged Commodities) Rules, 2011
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Preview Document */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="bg-white rounded-xl p-8 border border-slate-300 shadow-md font-serif text-slate-800 space-y-5 relative">
            
            {/* Watermark / Seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 font-sans font-black text-6xl uppercase pointer-events-none select-none opacity-40 rotate-[-25deg]">
              LEGAL METROLOGY
            </div>

            {/* Official Header */}
            <div className="text-center border-b border-slate-300 pb-4 font-sans">
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase block">
                Government of India • Department of Consumer Affairs
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
                OFFICE OF THE LEGAL METROLOGY CONTROLLER &amp; ENFORCEMENT WING
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Division of Packaged Commodities Regulatory Oversight • New Delhi / Mumbai
              </p>
            </div>

            {/* Reference Header */}
            <div className="flex justify-between items-start font-sans text-xs text-slate-600">
              <div>
                <div><strong>Ref No:</strong> SCN/{record.id}/LMPC/2026</div>
                <div><strong>Enforcement Sector:</strong> {record.zone}</div>
              </div>
              <div className="text-right">
                <div><strong>Date of Issue:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                <div><strong>Issuing Officer:</strong> {record.inspectorName} ({record.inspectorId})</div>
              </div>
            </div>

            {/* Addressee */}
            <div className="font-sans text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong className="block text-slate-700">TO:</strong>
              <div className="font-semibold text-slate-900">{record.manufacturer}</div>
              <div className="text-slate-600">Brand / Marketing Entity: {record.brand}</div>
              <div className="text-slate-500 mt-1">Inspected at Premise: {record.retailerName}, {record.retailerLocation}</div>
            </div>

            {/* Formal Notice text */}
            <div className="text-xs leading-relaxed space-y-3">
              <p>
                <strong>SUBJECT: NOTICE TO SHOW CAUSE UNDER RULE 32 OF THE LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011 READ WITH SECTION 36 OF THE LEGAL METROLOGY ACT, 2009.</strong>
              </p>
              <p>
                WHEREAS, an official inspection of pre-packaged commodities was carried out at the premises named above. During automated optical verification and physical inspection, samples of the pre-packaged commodity <strong>"{record.productName}" (Batch: {record.batchNo})</strong> were examined and found to be in contravention of the mandatory statutory provisions:
              </p>

              {/* Violations List in Notice */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3 font-sans space-y-2">
                {record.violations.map((v, i) => (
                  <div key={i} className="text-xs flex items-start gap-2">
                    <span className="font-bold text-rose-700">{i + 1}.</span>
                    <div>
                      <strong className="text-slate-900">{v.rule} — {v.title}:</strong>
                      <span className="text-slate-600 ml-1">{v.description}</span>
                      <div className="text-[11px] text-rose-800 font-medium mt-0.5">
                        Statutory Clause: {v.statutoryClause}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p>
                NOW THEREFORE, in exercise of the powers vested in the undersigned, you are hereby called upon to <strong>SHOW CAUSE within {responseDays} days</strong> of receipt of this notice as to why penal proceedings under Section 36(1) of the Legal Metrology Act, 2009 should not be initiated against your establishment.
              </p>

              {compoundingOption && (
                <p className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px] font-sans">
                  <strong>Notice of Compounding Option (Section 48):</strong> The establishment may submit an application for compounding of the aforesaid offence under Section 48 upon payment of prescribed compounding penalty within the notice window.
                </p>
              )}
            </div>

            {/* Officer Sign Off block */}
            <div className="pt-6 font-sans flex justify-between items-end text-xs">
              <div className="text-[11px] text-slate-400">
                Seal of the Legal Metrology Authority
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{record.inspectorName}</div>
                <div className="text-slate-600">Legal Metrology Inspector</div>
                <div className="text-[10px] font-mono text-slate-400">Digital Signature Hash: 7F8E-LMO-2026</div>
              </div>
            </div>

          </div>
        </div>

        {/* Configuration Bar & Controls */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 mr-2">
                Response Window:
              </label>
              <select
                value={responseDays}
                onChange={(e) => setResponseDays(Number(e.target.value))}
                className="p-1 border border-slate-300 rounded font-semibold text-slate-800 text-xs"
              >
                <option value={7}>7 Days (Urgent)</option>
                <option value={15}>15 Days (Standard)</option>
                <option value={30}>30 Days (Extended)</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={compoundingOption}
                onChange={(e) => setCompoundingOption(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span>Include Section 48 Compounding Clause</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Form VI (PDF)</span>
            </button>

            <button
              onClick={handleDispatch}
              disabled={isSubmitted}
              className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition flex items-center gap-1.5 shadow-sm ${
                isSubmitted ? 'bg-emerald-600 cursor-default' : 'bg-rose-600 hover:bg-rose-500 active:scale-95'
              }`}
            >
              {isSubmitted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Notice Registered &amp; Dispatched</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Statutory Show-Cause Notice</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
