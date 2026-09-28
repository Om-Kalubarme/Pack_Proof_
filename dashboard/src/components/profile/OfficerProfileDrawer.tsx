import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Scale, 
  FileText, 
  Download, 
  Edit3, 
  Check, 
  Lock, 
  LogOut, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  QrCode, 
  ExternalLink,
  User,
  Sliders,
  Sparkles,
  Fingerprint,
  RefreshCw,
  Zap
} from 'lucide-react';
import { OfficerProfile } from '../../types/compliance';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OfficerProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  officer: OfficerProfile | null;
  onUpdateOfficer: (updated: OfficerProfile) => void;
  onLogout?: () => void;
  totalInspectionsCount?: number;
  totalNoticesCount?: number;
}

type ProfileTab = 'credentials' | 'powers' | 'standards' | 'edit';

export const OfficerProfileDrawer: React.FC<OfficerProfileDrawerProps> = ({
  isOpen,
  onClose,
  officer,
  onUpdateOfficer,
  onLogout,
  totalInspectionsCount = 0,
  totalNoticesCount = 0
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('credentials');
  
  // Officer duty status
  const [dutyStatus, setDutyStatus] = useState<'ON_DUTY' | 'IN_TRANSIT' | 'OFF_DUTY'>(
    officer?.dutyStatus || 'ON_DUTY'
  );

  // Edit form state
  const [editName, setEditName] = useState(officer?.name || '');
  const [editId, setEditId] = useState(officer?.id || '');
  const [editDesignation, setEditDesignation] = useState(officer?.designation || 'Senior Legal Metrology Inspector');
  const [editZone, setEditZone] = useState(officer?.zone || 'Division 04 - Mumbai Metropolitan Region (MMR)');
  const [editEmail, setEditEmail] = useState(officer?.email || '');
  const [editPhone, setEditPhone] = useState(officer?.phone || '');
  const [editKitId, setEditKitId] = useState(officer?.calibratedKitId || 'CAL-DIG-2026-M401');
  const [editStationHq, setEditStationHq] = useState(officer?.stationHq || 'Old Customs House, Fort, Mumbai');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync edit form with officer prop when drawer opens
  useEffect(() => {
    if (officer) {
      setEditName(officer.name || '');
      setEditId(officer.id || '');
      setEditDesignation(officer.designation || 'Senior Legal Metrology Inspector');
      setEditZone(officer.zone || 'Division 04 - Mumbai Metropolitan Region (MMR)');
      setEditEmail(officer.email || '');
      setEditPhone(officer.phone || '');
      setEditKitId(officer.calibratedKitId || 'CAL-DIG-2026-M401');
      setEditStationHq(officer.stationHq || 'Old Customs House, Fort, Mumbai');
      setDutyStatus(officer.dutyStatus || 'ON_DUTY');
    }
  }, [officer, isOpen]);

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OfficerProfile = {
      id: editId.trim().toUpperCase() || 'LMO-OFFICIAL',
      name: editName.trim() || 'Authorized Officer',
      designation: editDesignation.trim() || 'Legal Metrology Officer',
      zone: editZone.trim() || 'Enforcement Division',
      email: editEmail.trim(),
      phone: editPhone.trim(),
      calibratedKitId: editKitId.trim(),
      stationHq: editStationHq.trim(),
      dutyStatus: dutyStatus,
      registeredAt: officer?.registeredAt || new Date().toISOString().split('T')[0],
      warrantNo: officer?.warrantNo || `GSR-584(E)/${editId.trim() || '4019'}`
    };

    onUpdateOfficer(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('credentials');
    }, 1200);
  };

  const handleDownloadIdCard = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98] // Standard CR80 ID Card dimensions (approx 85.6mm x 54mm)
    });

    // Outer Card Border & Navy Gradient
    doc.setFillColor(12, 35, 64); // Navy Blue
    doc.rect(0, 0, 85.6, 14, 'F');

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 14, 85.6, 39.98, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('GOVERNMENT OF INDIA', 42.8, 5, { align: 'center' });

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('DEPARTMENT OF CONSUMER AFFAIRS • LEGAL METROLOGY DIVISION', 42.8, 8.5, { align: 'center' });
    doc.setFontSize(4.5);
    doc.text('STATUTORY ENFORCEMENT OFFICER IDENTITY CREDENTIAL', 42.8, 11.5, { align: 'center' });

    // Photo Box Placeholder
    doc.setFillColor(226, 232, 240);
    doc.setDrawColor(148, 163, 184);
    doc.roundedRect(6, 17, 18, 22, 1, 1, 'FD');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(5);
    doc.text('OFFICER', 15, 27, { align: 'center' });
    doc.text('PHOTO', 15, 30, { align: 'center' });

    // Officer Info
    const offName = officer?.name || 'Authorized Officer';
    const offId = officer?.id || 'LMO-OFFICIAL';
    const offDesig = officer?.designation || 'Legal Metrology Inspector';
    const offZone = officer?.zone || 'Division 04 (MMR)';

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(offName, 28, 20);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cadre: ${offDesig}`, 28, 24);
    doc.text(`Badge / Warrant ID: ${offId}`, 28, 27.5);
    doc.text(`Territorial Zone: ${offZone}`, 28, 31);
    doc.text(`Calibrated Kit: ${officer?.calibratedKitId || 'CAL-DIG-2026-M401'}`, 28, 34.5);

    // Authority Watermark
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');
    doc.text('WARRANT: SEC 13(1) & 15 LEGAL METROLOGY ACT, 2009', 28, 38.5);

    // Bottom Gold Bar
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 51.5, 85.6, 2.48, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(4.5);
    doc.text('AUTHORIZED REGULATORY INSPECTION & SEARCH WARRANT ACTIVE', 42.8, 53.2, { align: 'center' });

    doc.save(`Officer_ID_Card_${offId}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
        aria-hidden="true"
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside 
          className="w-screen max-w-md sm:max-w-lg md:max-w-xl bg-slate-50 shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-in slide-in-from-right duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-drawer-title"
        >
          
          {/* Top Drawer Header */}
          <div className="bg-[#0c2340] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-200 shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h2 id="profile-drawer-title" className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
                  Officer Regulatory Dossier
                </h2>
                <p className="text-[11px] text-blue-200/80 mt-1">
                  Department of Consumer Affairs • Legal Metrology Division
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close profile drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Officer Warrant Visual Badge Card */}
          <div className="p-4 sm:p-5 pb-3 bg-white border-b border-slate-200">
            <div className="rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#16335a] to-[#001f3f] p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
              {/* Background watermark badge */}
              <Scale className="w-40 h-40 absolute -right-6 -bottom-8 text-white/5 pointer-events-none" />

              {/* Top Card Row */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-2xl bg-white/15 border-2 border-white/25 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
                    <User className="w-7 h-7 text-sky-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-wider font-semibold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30">
                      Official Warrant ID
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1 leading-snug">
                      {officer?.name || 'Authorized Official'}
                    </h3>
                    <div className="text-xs text-blue-200/90 font-medium">
                      {officer?.designation || 'Senior Legal Metrology Inspector'}
                    </div>
                  </div>
                </div>

                {/* Duty Status Badge */}
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    dutyStatus === 'ON_DUTY' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : dutyStatus === 'IN_TRANSIT'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      : 'bg-slate-500/20 text-slate-300 border-slate-400/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      dutyStatus === 'ON_DUTY' ? 'bg-emerald-400 animate-pulse' : dutyStatus === 'IN_TRANSIT' ? 'bg-amber-400' : 'bg-slate-400'
                    }`}></span>
                    <span>{dutyStatus === 'ON_DUTY' ? 'ON FIELD DUTY' : dutyStatus === 'IN_TRANSIT' ? 'IN TRANSIT' : 'OFF DUTY'}</span>
                  </span>
                </div>
              </div>

              {/* Bottom Card Row / Warrant Identifiers */}
              <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] relative z-10">
                <div>
                  <span className="text-blue-200/70 text-[10px] block">Badge Number:</span>
                  <span className="font-mono font-bold text-white">{officer?.id || 'LMO-OFFICIAL'}</span>
                </div>
                <div>
                  <span className="text-blue-200/70 text-[10px] block">Statutory Mandate:</span>
                  <span className="font-semibold text-white">Section 15, LMA 2009</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-blue-200/70 text-[10px] block">Calibrated Standards:</span>
                  <span className="font-mono font-semibold text-sky-200">{officer?.calibratedKitId || 'CAL-DIG-2026-M401'}</span>
                </div>
              </div>
            </div>

            {/* Duty Status Quick Toggle */}
            <div className="mt-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs">
              <span className="text-[11px] font-semibold text-slate-600 pl-1 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-700" />
                <span>Duty Status:</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDutyStatus('ON_DUTY')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    dutyStatus === 'ON_DUTY'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  On Duty
                </button>
                <button
                  type="button"
                  onClick={() => setDutyStatus('IN_TRANSIT')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    dutyStatus === 'IN_TRANSIT'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  In Transit
                </button>
                <button
                  type="button"
                  onClick={() => setDutyStatus('OFF_DUTY')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    dutyStatus === 'OFF_DUTY'
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  Off Duty
                </button>
              </div>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="px-4 sm:px-5 bg-white border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => setActiveTab('credentials')}
              className={`py-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'credentials'
                  ? 'border-[#0c2340] text-[#0c2340]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Identity &amp; Circle</span>
            </button>

            <button
              onClick={() => setActiveTab('powers')}
              className={`py-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'powers'
                  ? 'border-[#0c2340] text-[#0c2340]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Statutory Powers</span>
            </button>

            <button
              onClick={() => setActiveTab('standards')}
              className={`py-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'standards'
                  ? 'border-[#0c2340] text-[#0c2340]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Standards &amp; Kit</span>
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'edit'
                  ? 'border-[#0c2340] text-[#0c2340]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>

          {/* Drawer Body Scroll Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

            {/* TAB 1: Credentials & Jurisdiction */}
            {activeTab === 'credentials' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Official Particulars Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-[#0c2340]" />
                    <span>Official Gazette &amp; Service Particulars</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block font-medium">Cadre Classification:</span>
                      <span className="font-bold text-slate-800">Gazetted Officer (Group B)</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block font-medium">Warrant Notification:</span>
                      <span className="font-bold text-slate-800 font-mono">GSR-584(E) / Sec 13(1)</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block font-medium">Official Contact Number:</span>
                      <span className="font-bold text-slate-800 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{officer?.phone || '+91 98200 12345'}</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block font-medium">Official Email:</span>
                      <span className="font-bold text-slate-800 truncate block mt-0.5" title={officer?.email || 'officer@legalmetrology.gov.in'}>
                        {officer?.email || 'officer@legalmetrology.gov.in'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Jurisdiction & Posting Authority */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0c2340]" />
                    <span>Territorial Jurisdiction &amp; Posting Authority</span>
                  </h4>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Assigned Territorial Division</span>
                        <span className="text-slate-600">{officer?.zone || 'Division 04 - Mumbai Metropolitan Region (MMR)'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Station Headquarters</span>
                        <span className="text-slate-600">{officer?.stationHq || 'Old Customs House, Fort, Mumbai - 400001'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Controlling State Directorate</span>
                        <span className="text-slate-600">Controller of Legal Metrology, Maharashtra State</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Division Cases Logged</span>
                    <div className="text-2xl font-bold text-[#0c2340] font-mono mt-1">
                      {totalInspectionsCount}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Pre-packaged commodity files</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Form VI Notices Issued</span>
                    <div className="text-2xl font-bold text-rose-700 font-mono mt-1">
                      {totalNoticesCount}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Statutory show-cause actions</span>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: Statutory Powers */}
            {activeTab === 'powers' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl text-xs text-blue-900">
                  <strong>Statutory Warrant:</strong> Field officers exercise regulatory authority delegated under the Legal Metrology Act, 2009 and Legal Metrology (Packaged Commodities) Rules, 2011.
                </div>

                {/* Statutory Clause 1 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Section 15(1) — Power of Inspection &amp; Entry</span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Authority to enter wholesale mandis, packaging factories, and quick-commerce fulfillment centers at all reasonable times to inspect pre-packaged commodities and verifying weighing instruments.
                  </p>
                </div>

                {/* Statutory Clause 2 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Section 15(2) — Search &amp; Seizure Orders</span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">FORM V</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Empowered to seize non-standard packages, tampered MRP cartons, or obliterated batch declarations under official Form V seizure memos with cryptographic digital chain of custody.
                  </p>
                </div>

                {/* Statutory Clause 3 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Section 18 &amp; 36 — Mandatory Package Declarations</span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">PENAL</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mandatory verification of printed MRP, Unit Sale Price (USP), Net Quantity, Country of Origin, and Consumer Care helpline declarations under Rule 6 of the LMPC Rules, 2011.
                  </p>
                </div>

                {/* Statutory Clause 4 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Section 48 — Compounding of Offenses</span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">COMPOUND</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Authority to issue compounding summons and realize statutory compounding penalties up to ₹50,000 for first-time contraventions without mandatory magistrate court proceedings.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Calibrated Field Standards Kit */}
            {activeTab === 'standards' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#0c2340]" />
                      <span>Calibrated Field Measurement Kit</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                      CALIBRATED
                    </span>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-slate-600">Assigned Kit Badge No:</span>
                      <span className="font-mono font-bold text-slate-900">{officer?.calibratedKitId || 'CAL-DIG-2026-M401'}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-slate-600">Working Standard Electronic Balance:</span>
                      <span className="font-semibold text-slate-800">WSB-0.001g (Class II Precision)</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-slate-600">Standard Working Weights Set:</span>
                      <span className="font-semibold text-slate-800">Class F1 (1mg to 10kg) Brass</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-slate-600">Optical Font Height Comparator:</span>
                      <span className="font-semibold text-slate-800">Digital Micrometer (0.01mm)</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-slate-600">NPL Traceability Certificate:</span>
                      <span className="font-mono font-bold text-blue-700">NPL-IND-CERT-8842</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-slate-600">Annual Calibration Validity:</span>
                      <span className="font-semibold text-emerald-700">Valid until 15-Oct-2027</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-slate-600">Official Seizure Memo Receipt Book:</span>
                      <span className="font-semibold text-slate-800">Form V Book #089 (Sl. 4401–4500)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rule 24 Calibration Protocol:</strong> Working standards must be recalibrated every 12 months at the State Metrology Laboratory in accordance with Seventh Schedule protocols.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 4: Edit Officer Details */}
            {activeTab === 'edit' && (
              <form onSubmit={handleSaveProfile} className="space-y-3.5 animate-in fade-in duration-200">
                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Officer Credentials Successfully Updated &amp; Saved!</span>
                  </div>
                )}

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-[#0c2340]" />
                    <span>Edit Officer Profile Details</span>
                  </h4>

                  {/* Officer Full Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Officer Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Inspector Full Name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0c2340]/20 focus:outline-hidden font-medium"
                      required
                    />
                  </div>

                  {/* Officer ID / Badge No */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Officer ID / Badge No <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editId}
                      onChange={(e) => setEditId(e.target.value)}
                      placeholder="e.g. LMO-MH-4019"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-[#0c2340]/20 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Official Designation */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Official Designation / Cadre <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      placeholder="e.g. Senior Legal Metrology Inspector"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0c2340]/20 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Assigned Zone */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Assigned Territorial Zone / Division <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editZone}
                      onChange={(e) => setEditZone(e.target.value)}
                      placeholder="e.g. Division 04 - Mumbai Metropolitan Region (MMR)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0c2340]/20 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Official Email */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="e.g. officer@legalmetrology.gov.in"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0c2340]/20 focus:outline-hidden"
                    />
                  </div>

                  {/* Official Phone */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Official Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +91 98200 12345"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#0c2340]/20 focus:outline-hidden"
                    />
                  </div>

                  {/* Calibrated Kit ID */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Assigned Calibrated Standards Kit ID
                    </label>
                    <input
                      type="text"
                      value={editKitId}
                      onChange={(e) => setEditKitId(e.target.value)}
                      placeholder="e.g. CAL-DIG-2026-M401"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-[#0c2340]/20 focus:outline-hidden"
                    />
                  </div>

                  {/* Station Headquarters */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Station Headquarters Address
                    </label>
                    <input
                      type="text"
                      value={editStationHq}
                      onChange={(e) => setEditStationHq(e.target.value)}
                      placeholder="e.g. Old Customs House, Fort, Mumbai"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0c2340]/20 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0c2340] hover:bg-[#16335a] text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Official Profile Changes</span>
                  </button>

                </div>
              </form>
            )}

          </div>

          {/* Drawer Footer Actions */}
          <div className="bg-white border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              onClick={handleDownloadIdCard}
              className="w-full sm:w-auto py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Digital ID Card</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full sm:w-auto py-2 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Sign Out of Terminal</span>
              </button>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
};
