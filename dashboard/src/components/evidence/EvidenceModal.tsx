import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Scale, 
  Printer, 
  CheckCircle2, 
  AlertOctagon, 
  Building2, 
  Calendar, 
  ScanLine
} from 'lucide-react';
import { InspectionRecord } from '../../types/compliance';
import { BoundingBoxViewer } from './BoundingBoxViewer';
import { generateFormVINoticePDF } from '../../utils/exportUtils';

interface EvidenceModalProps {
  record: InspectionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenNoticeGenerator: (record: InspectionRecord) => void;
  onStatusUpdate?: (recordId: string, newStatus: any) => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  record,
  isOpen,
  onClose,
  onOpenNoticeGenerator,
  onStatusUpdate
}) => {
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [officerNote, setOfficerNote] = useState(record?.notes || '');

  if (!isOpen || !record) return null;

  const selectedBox = record.boundingBoxes.find(b => b.id === selectedBoxId) || null;

  const handleDownloadNotice = () => {
    generateFormVINoticePDF(record);
  };

  const handleMarkResolved = () => {
    if (onStatusUpdate) {
      onStatusUpdate(record.id, 'PASS');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      
      {/* Centered Modal Container */}
      <div 
        className="bg-slate-50 w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-[#001F3F] text-white px-6 py-4 flex items-center justify-between border-b border-[#001428] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-none">
                  Package Inspection &amp; Forensic Evidence Analysis
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/15 text-blue-100 border border-white/20">
                  {record.id}
                </span>
              </div>
              <p className="text-xs text-blue-100/80 mt-1">
                Automated LMPC Rules 2011 Verification • Department of Consumer Affairs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              aria-label="Close inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body - Split into Left Canvas & Right Evidence Inspector */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          
          {/* Left Column: Interactive Package Image & Bounding Box Overlays (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    High-Resolution Optical Scan &amp; Bounding Boxes
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  AI Confidence: {(record.confidenceScore * 100).toFixed(1)}%
                </span>
              </div>

              {/* Bounding Box Component */}
              <div className="flex-1 min-h-[460px]">
                <BoundingBoxViewer
                  imageSrc={record.imageSrc}
                  boundingBoxes={record.boundingBoxes}
                  selectedBoxId={selectedBoxId}
                  onSelectBox={setSelectedBoxId}
                  productName={record.productName}
                />
              </div>
            </div>

            {/* Product & Retail Premise Specs */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold text-slate-800">{record.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Batch / Lot</span>
                <span className="font-mono font-semibold text-slate-800">{record.batchNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Net Quantity</span>
                <span className="font-semibold text-slate-800">{record.netQuantity}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Declared MRP</span>
                <span className="font-bold text-slate-900">{record.mrpDeclared}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Violation Details, Statutory Citations & Action Console (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Status & Severity Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              record.status === 'PASS'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : record.severity === 'CRITICAL'
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-3">
                {record.status === 'PASS' ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                ) : (
                  <AlertOctagon className="w-8 h-8 text-rose-600" />
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    Audit Status: <span className="underline">{record.status}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Severity: <strong>{record.severity}</strong> • {record.violations.length} statutory violation(s)
                  </div>
                </div>
              </div>

              {record.status !== 'PASS' && (
                <button
                  onClick={() => onOpenNoticeGenerator(record)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Issue Notice</span>
                </button>
              )}
            </div>

            {/* Selected Bounding Box Detail Card (if clicked) */}
            {selectedBox && (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase">
                    Focused Optical Analysis: {selectedBox.label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedBox.status === 'FAIL' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedBox.status}
                  </span>
                </div>
                <div className="mt-2.5 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Detected OCR Text:</span>
                    <p className="font-mono font-bold text-slate-900 bg-white p-2 rounded border border-indigo-100 mt-0.5">
                      "{selectedBox.detectedText}"
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Statutory Mandate:</span>
                    <p className="text-slate-700 font-medium text-[11px] mt-0.5">
                      {selectedBox.requiredStandard}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Violations Checklist */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs space-y-3 flex-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Statutory Infractions Under LMPC Rules 2011</span>
                <span className="font-mono text-slate-500">{record.violations.length} items</span>
              </h3>

              {record.violations.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No Violations Detected</p>
                  <p className="text-[11px] text-slate-400 mt-1">All packaging declarations adhere to Legal Metrology standards.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {record.violations.map((v, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          {v.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold shrink-0">
                          {v.rule}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {v.description}
                      </p>
                      <div className="pt-1.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                        <span>Section: <strong className="text-slate-700">{v.statutoryClause}</strong></span>
                        <span className="text-rose-700 font-semibold">{v.penaltyClause}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Officer Field Notes & Disposition Action Bar */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Officer Remarks &amp; Audit Trail Notes:
                </label>
                <textarea
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="Record officer observations, retailer statement, or seizure receipt numbers..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                {record.status !== 'PASS' ? (
                  <>
                    <button
                      onClick={() => onOpenNoticeGenerator(record)}
                      className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Form VI Notice</span>
                    </button>
                    <button
                      onClick={handleDownloadNotice}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                      title="Direct PDF Notice Download"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PDF Notice</span>
                    </button>
                    <button
                      onClick={handleMarkResolved}
                      className="py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                      title="Mark as verified compliant / false positive"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Cleared</span>
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Compliant Packaging Certified</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Drawer Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {record.retailerName} ({record.retailerLocation})
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(record.timestamp).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 transition"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
