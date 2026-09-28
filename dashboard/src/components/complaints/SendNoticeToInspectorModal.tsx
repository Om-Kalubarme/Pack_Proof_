import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Send, 
  ShieldAlert, 
  UserCheck, 
  MapPin, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Scale, 
  Phone, 
  Mail,
  Zap,
  Sparkles
} from 'lucide-react';
import { CitizenComplaint, OfficerProfile, InspectorProfile } from '../../types/compliance';

interface SendNoticeToInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: CitizenComplaint | null;
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
}

// Built-in Circle Roster for jurisdictions
const DEFAULT_CIRCLE_ROSTER = [
  {
    name: 'Inspector Meera Nair',
    id: 'INSP-MH-3890',
    designation: 'Legal Metrology Inspector',
    circle: 'South Mumbai Circle (Fort / Colaba)',
    districts: ['Mumbai City', 'Mumbai', 'Fort', 'Colaba'],
    phone: '+91 98201 44521',
    email: 'insp.m.nair@legalmetrology.gov.in'
  },
  {
    name: 'Inspector Priya Nair',
    id: 'INSP-MH-4022',
    designation: 'Legal Metrology Inspector',
    circle: 'Western Suburbs Circle (Bandra / Andheri)',
    districts: ['Mumbai Suburban', 'Bandra', 'Andheri'],
    phone: '+91 98211 77209',
    email: 'insp.p.nair@legalmetrology.gov.in'
  },
  {
    name: 'Inspector Sunita Deshmukh',
    id: 'INSP-MH-3920',
    designation: 'Legal Metrology Inspector',
    circle: 'Thane Municipal Circle (Naupada / Ghodbunder)',
    districts: ['Thane', 'Naupada', 'Kalyan'],
    phone: '+91 98190 33812',
    email: 'insp.s.deshmukh@legalmetrology.gov.in'
  },
  {
    name: 'Inspector Vikram Salunkhe',
    id: 'INSP-MH-4035',
    designation: 'Legal Metrology Inspector',
    circle: 'Navi Mumbai Circle (Vashi / Belapur)',
    districts: ['Navi Mumbai', 'Raigad', 'Vashi'],
    phone: '+91 98234 11980',
    email: 'insp.v.salunkhe@legalmetrology.gov.in'
  },
  {
    name: 'Inspector Amit Patil',
    id: 'INSP-MH-4105',
    designation: 'Legal Metrology Inspector',
    circle: 'Pune Central Circle (Shivajinagar)',
    districts: ['Pune', 'Haveli', 'Pimpri'],
    phone: '+91 98220 55198',
    email: 'insp.a.patil@legalmetrology.gov.in'
  }
];

export const SendNoticeToInspectorModal: React.FC<SendNoticeToInspectorModalProps> = ({
  isOpen,
  onClose,
  complaint,
  officer,
  registeredInspectors = [],
  onDispatchNotice
}) => {
  // Combine registered inspectors with circle roster
  const allInspectors = useMemo(() => {
    const list = [...DEFAULT_CIRCLE_ROSTER];
    registeredInspectors.forEach(reg => {
      if (!list.some(i => i.id === reg.id || i.name.toLowerCase() === reg.name.toLowerCase())) {
        list.push({
          name: reg.name,
          id: reg.id,
          designation: reg.designation || 'Legal Metrology Inspector',
          circle: `${reg.zone || 'Enforcement Circle'} (Enrolled)`,
          districts: [reg.zone || 'All'],
          phone: reg.phone || '+91 98000 00000',
          email: reg.email || `${reg.id.toLowerCase()}@legalmetrology.gov.in`
        });
      }
    });
    return list;
  }, [registeredInspectors]);

  // Selected Inspector
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('');
  const [priority, setPriority] = useState<'URGENT' | 'HIGH' | 'ROUTINE'>('URGENT');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [directiveNo, setDirectiveNo] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  // Match best inspector when complaint opens
  useEffect(() => {
    if (!complaint) return;

    // Generate unique directive number
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setDirectiveNo(`DIR-LMA-2026-${randomCode}`);

    // Set default special instructions based on complaint type
    if (complaint.complaintType === 'Overcharging above MRP') {
      setSpecialInstructions(
        'Verify physical packaging printed MRP vs electronic billing system override. Check store manager billing override logs and seize sample packaging if price gouging is confirmed.'
      );
    } else if (complaint.complaintType === 'Dual MRP Sticker') {
      setSpecialInstructions(
        'Inspect stock for adhesive price stickers covering original manufacturer declarations. Seize non-conforming packages under Section 15(2) and issue Form VI Statutory Notice.'
      );
    } else {
      setSpecialInstructions(
        'Audit pre-packaged commodities for mandatory Unit Sale Price (USP) per gram/kg under Rule 6(11). Verify shelf labels and package print legibility.'
      );
    }

    // Auto-match inspector by district or address
    const compText = `${complaint.district} ${complaint.address} ${complaint.state}`.toLowerCase();
    const matched = allInspectors.find(insp => 
      insp.districts.some(d => compText.includes(d.toLowerCase()))
    );

    if (matched) {
      setSelectedInspectorId(matched.id);
    } else if (allInspectors.length > 0) {
      setSelectedInspectorId(allInspectors[0].id);
    }
  }, [complaint, allInspectors]);

  if (!isOpen || !complaint) return null;

  const currentInspector = allInspectors.find(i => i.id === selectedInspectorId) || allInspectors[0];

  const handleConfirmDispatch = () => {
    if (!currentInspector) return;

    setIsSending(true);

    // Synthesize gentle notification sound using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext unavailable, silent fallback
    }

    setTimeout(() => {
      onDispatchNotice({
        complaintId: complaint.id,
        inspectorName: currentInspector.name,
        inspectorId: currentInspector.id,
        areaCircle: currentInspector.circle,
        directiveNo: directiveNo,
        priority: priority,
        specialInstructions: specialInstructions,
        officerName: officer?.name || 'Authorized Officer',
        officerDesignation: officer?.designation || 'Legal Metrology Officer',
        targetMerchant: complaint.shopName,
        targetAddress: complaint.address
      });
      setIsSending(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Navy Blue Legal Metrology Banner */}
        <div className="bg-[#001F3F] text-white p-4 sm:p-5 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Send className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono">
                  Form V-A Statutory Directive
                </span>
                <span className="text-xs text-blue-200/80 font-mono">
                  Ref: {directiveNo}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 leading-tight">
                Statutory Notice &amp; Inspection Directive to Area Inspector
              </h2>
              <p className="text-xs text-blue-100/70 mt-0.5">
                Legal Metrology Act, 2009 • Section 15(1) &amp; Section 18 Enforcement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer relative z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Grievance Summary Box */}
          <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Citizen Grievance #{complaint.id}</span>
              </div>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded border border-rose-300">
                Source: {complaint.source}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-slate-800">
              <div>
                <span className="text-[11px] text-slate-500 block">Target Merchant / Establishment:</span>
                <strong className="text-slate-900 text-sm">{complaint.shopName}</strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Reported Offense Category:</span>
                <span className="font-bold text-rose-700">{complaint.complaintType}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-500 block">Premises Location &amp; Jurisdiction:</span>
                <div className="flex items-center gap-1 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{complaint.address}, {complaint.district}, {complaint.state} - {complaint.pincode}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-200/80 text-[11px] text-slate-700 leading-relaxed italic">
              "{complaint.description}"
            </div>
          </div>

          {/* Area Inspector Assignment Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-700" />
                <span>Designated Area Inspector (Target Circle)</span>
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                Auto-matched by Jurisdiction Circle
              </span>
            </label>

            <select
              value={selectedInspectorId}
              onChange={(e) => setSelectedInspectorId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition"
            >
              {allInspectors.map((insp) => (
                <option key={insp.id} value={insp.id}>
                  {insp.name} ({insp.id}) — {insp.circle}
                </option>
              ))}
            </select>

            {/* Selected Inspector Profile Card */}
            {currentInspector && (
              <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center text-sm shrink-0 border border-sky-300">
                    {currentInspector.name.split(' ').slice(-1)[0][0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>{currentInspector.name}</span>
                      <span className="font-mono text-[10px] text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded border border-sky-200">
                        {currentInspector.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {currentInspector.circle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-600 shrink-0">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-sky-700" />
                    <span>{currentInspector.phone}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Priority of Directive */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Execution Timeframe &amp; Priority Level</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('URGENT')}
                className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                  priority === 'URGENT'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">🔴 Urgent Raid</span>
                  <span className="text-[10px] font-mono font-bold bg-rose-200/80 text-rose-800 px-1 rounded">24h</span>
                </div>
                <span className="text-[10px] text-slate-600">Immediate spot inspection within 24 hours</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('HIGH')}
                className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                  priority === 'HIGH'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">🟡 Priority Check</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-800 px-1 rounded">48h</span>
                </div>
                <span className="text-[10px] text-slate-600">Verification within 48 hours</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('ROUTINE')}
                className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                  priority === 'ROUTINE'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">🟢 Routine Audit</span>
                  <span className="text-[10px] font-mono font-bold bg-blue-200/80 text-blue-800 px-1 rounded">72h</span>
                </div>
                <span className="text-[10px] text-slate-600">Scheduled standard inspection</span>
              </button>
            </div>
          </div>

          {/* Statutory Directive Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-700" />
                <span>Officer's Statutory Mandate &amp; Special Instructions</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Sec. 15(1) &amp; Sec. 15(2)</span>
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-sans leading-relaxed"
              placeholder="Enter special instructions or evidence collection mandates for the inspector..."
            />
          </div>

          {/* Legal Mandate Preview Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-700" />
              <span>Statutory Directive Legal Mandate:</span>
            </div>
            <p className="leading-relaxed">
              Upon authorization, an official Form V-A Notice will be digitally stamped and transmitted to <strong>{currentInspector?.name}</strong>. The Inspector is empowered under Section 15(1) to enter the target premises, inspect packaged goods, examine electronic registers, and seize non-conforming items under Section 15(2).
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Issuing Officer: <strong className="text-slate-800">{officer?.name || 'Authorized Officer'}</strong> ({officer?.id || 'LMO-OFFICIAL'})
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-200/70 font-medium text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDispatch}
              disabled={isSending || !currentInspector}
              className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Transmitting Notice...' : 'Send Notice to Area Inspector'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
