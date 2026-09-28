import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Award,
  IdCard,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Users,
  Search
} from 'lucide-react';
import { InspectorProfile } from '../../types/compliance';

interface InspectorRegisterPageProps {
  onBackToDashboard: () => void;
  onRegistrationComplete?: (inspector: InspectorProfile) => void;
}

const INITIAL_INSPECTORS: InspectorProfile[] = [];

export const InspectorRegisterPage: React.FC<InspectorRegisterPageProps> = ({
  onBackToDashboard,
  onRegistrationComplete
}) => {
  // Form State prefilled with realistic dummy data for instant testing
  const [name, setName] = useState('Inspector Amit S. Patil');
  const [inspectorId, setInspectorId] = useState('INSP-MH-4105');
  const [designation, setDesignation] = useState('Legal Metrology Inspector');
  const [zone, setZone] = useState('Division 04 - Mumbai Central Zone');
  const [email, setEmail] = useState('insp.patil@legalmetrology.gov.in');
  const [phone, setPhone] = useState('+91 98220 55198');
  const [password, setPassword] = useState('Inspector@2026');
  const [confirmPassword, setConfirmPassword] = useState('Inspector@2026');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInspector, setSuccessInspector] = useState<InspectorProfile | null>(null);

  // Inspector List State - starts clean with zero dummy officers
  const [enrolledInspectors, setEnrolledInspectors] = useState<InspectorProfile[]>(() => {
    try {
      const saved = localStorage.getItem('registered_inspectors');
      if (saved) {
        const parsed: InspectorProfile[] = JSON.parse(saved);
        // Filter out any legacy dummy inspectors
        const cleaned = parsed.filter(i => 
          !['INSP-MH-4019', 'INSP-MH-4022', 'INSP-MH-4035'].includes(i.id) &&
          !['Rajesh Sharma', 'Priya Nair', 'Vikram Salunkhe'].includes(i.name)
        );
        return cleaned;
      }
    } catch {
      // fallback
    }
    return INITIAL_INSPECTORS;
  });

  const [registrySearch, setRegistrySearch] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('registered_inspectors', JSON.stringify(enrolledInspectors));
    } catch {
      // ignore
    }
  }, [enrolledInspectors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Please enter the Inspector Full Name.');
      return;
    }
    if (!inspectorId.trim()) {
      setErrorMessage('Please enter a valid Inspector ID / Badge No.');
      return;
    }
    if (!designation.trim()) {
      setErrorMessage('Please enter the Official Cadre / Designation.');
      return;
    }
    if (!zone.trim()) {
      setErrorMessage('Please enter the Assigned Territorial Division / Circle.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid official government email.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile contact number.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Security access password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const formattedId = inspectorId.trim().toUpperCase();
    const formattedName = name.trim();

    const newInspector: InspectorProfile = {
      id: formattedId,
      name: formattedName,
      designation: designation.trim(),
      zone: zone.trim(),
      email: email.trim(),
      phone: phone.trim(),
      registeredAt: new Date().toISOString().split('T')[0]
    };

    setTimeout(() => {
      setIsLoading(false);
      setSuccessInspector(newInspector);
      setEnrolledInspectors(prev => [newInspector, ...prev]);

      // Reset form
      setName('');
      setInspectorId('');
      setDesignation('');
      setZone('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');

      if (onRegistrationComplete) {
        onRegistrationComplete(newInspector);
      }
    }, 450);
  };

  const filteredInspectors = enrolledInspectors.filter(ins => {
    const q = registrySearch.toLowerCase();
    return (
      ins.name.toLowerCase().includes(q) ||
      ins.id.toLowerCase().includes(q) ||
      ins.designation.toLowerCase().includes(q) ||
      ins.zone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
            title="Return to Dashboard Overview"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                Department Administrative Service
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active Enrolment
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Field Inspector Registration &amp; Enrolment Portal
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Users className="w-4 h-4 text-sky-600" />
            <span>{enrolledInspectors.length} Registered Inspectors</span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successInspector && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in zoom-in-98">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                Inspector Registration Successfully Completed
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                <strong>{successInspector.name}</strong> has been enrolled as <strong>{successInspector.designation}</strong> under ID <strong className="font-mono">{successInspector.id}</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSuccessInspector(null)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition cursor-pointer shadow-2xs"
            >
              Enrol Another
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7">
          
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                New Inspector Registration Form
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All 8 mandatory credentials required for statutory field inspection authentication
              </p>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Inspector Pill */}
          <div className="mb-4 p-3 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-sky-950 flex items-center justify-between gap-2 shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-700 block">
                Sample Inspector Profile (All Fields Pre-filled)
              </span>
              <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                <span>Amit Patil</span> • <span>INSP-MH-4105</span> • <span className="text-slate-600">Inspector@2026</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setName('Inspector Amit S. Patil');
                setInspectorId('INSP-MH-4105');
                setDesignation('Legal Metrology Inspector');
                setZone('Division 04 - Mumbai Central Zone');
                setEmail('insp.patil@legalmetrology.gov.in');
                setPhone('+91 98220 55198');
                setPassword('Inspector@2026');
                setConfirmPassword('Inspector@2026');
                setErrorMessage('');
              }}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer shrink-0 active:scale-95"
            >
              Reset Demo
            </button>
          </div>

          {/* Inspector Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            
            {/* Row 1: Inspector Full Name & Inspector ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 1: Inspector Full Name */}
              <div>
                <label 
                  htmlFor="insp-name" 
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Inspector Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#001F3F] focus-within:ring-2 focus-within:ring-[#001F3F]/10 transition-all shadow-2xs">
                  <User className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    id="insp-name"
                    name="name"
                    type="text"
                    autoComplete="off"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. Suresh K. Patil"
                    className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Inspector ID / Badge No. */}
              <div>
                <label 
                  htmlFor="insp-id" 
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Inspector ID / Badge No. <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#001F3F] focus-within:ring-2 focus-within:ring-[#001F3F]/10 transition-all shadow-2xs">
                  <IdCard className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    id="insp-id"
                    name="inspectorId"
                    type="text"
                    autoComplete="off"
                    value={inspectorId}
                    onChange={(e) => {
                      setInspectorId(e.target.value.toUpperCase());
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. INSP-MH-4050"
                    className="w-full text-xs sm:text-sm font-mono font-bold text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Official Cadre/Designation & Territorial Division/Zone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 3: Official Designation */}
              <div>
                <label 
                  htmlFor="insp-designation" 
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Official Cadre / Designation <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#001F3F] focus-within:ring-2 focus-within:ring-[#001F3F]/10 transition-all shadow-2xs">
                  <Award className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    id="insp-designation"
                    name="designation"
                    type="text"
                    autoComplete="off"
                    value={designation}
                    onChange={(e) => {
                      setDesignation(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. Legal Metrology Field Inspector"
                    className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              {/* Field 4: Territorial Division / Zone */}
              <div>
                <label 
                  htmlFor="insp-zone" 
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Territorial Division / Zone <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#001F3F] focus-within:ring-2 focus-within:ring-[#001F3F]/10 transition-all shadow-2xs">
                  <MapPin className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    id="insp-zone"
                    name="zone"
                    type="text"
                    autoComplete="off"
                    value={zone}
                    onChange={(e) => {
                      setZone(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. Division 04 - MMR Jurisdiction"
                    className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Government Email & Official Mobile No. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 5: Government Email */}
              <div>
                <label 
                  htmlFor="insp-email" 
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Government Email <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#001F3F] focus-within:ring-2 focus-within:ring-[#001F3F]/10 transition-all shadow-2xs">
                  <Mail className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    id="insp-email"
                    name="email"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="inspector@legalmetrology.gov.in"
                    className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              {/* Field 6: Official Mobile */}
              <div>
                <label 
                  htmlFor="insp-phone" 
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Official Mobile No. <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#001F3F] focus-within:ring-2 focus-within:ring-[#001F3F]/10 transition-all shadow-2xs">
                  <Phone className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    id="insp-phone"
                    name="phone"
                    type="tel"
                    autoComplete="off"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="+91 98200 XXXXX"
                    className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 7: Password */}
              <div>
                <label 
                  htmlFor="insp-password" 
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#001F3F] focus-within:ring-2 focus-within:ring-[#001F3F]/10 transition-all shadow-2xs">
                  <Lock className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    id="insp-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Min. 6 characters"
                    className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pl-2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 8: Confirm Password */}
              <div>
                <label 
                  htmlFor="insp-confirm-password" 
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#001F3F] focus-within:ring-2 focus-within:ring-[#001F3F]/10 transition-all shadow-2xs">
                  <Lock className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    id="insp-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Repeat password"
                    className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="pl-2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span className="text-[10px] text-rose-600 font-bold block mt-1">
                    Passwords do not match
                  </span>
                )}
              </div>
            </div>

            {/* Action Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white bg-[#001F3F] hover:bg-[#002b59] active:scale-[0.99] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Enrolling Inspector to Registry...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register &amp; Enrol Field Inspector</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Right Column: Statutory Guidelines & Verification Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Statutory Enforcement Authority Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Statutory Authorization
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Under <strong>Section 13 &amp; 14 of the Legal Metrology Act, 2009</strong>, field metrology inspectors are appointed by the State Government to conduct package sampling, verify commodity declarations, and issue statutory notices under Form VI.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Building2 className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span className="text-slate-700">Enrolled inspectors receive digital login for live package OCR scans and field seizures.</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Award className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span className="text-slate-700">Unique Inspector ID is permanently cryptographically bound to issued compounding notices.</span>
              </div>
            </div>
          </div>

          {/* Verification Protocol Checklist */}
          <div className="bg-gradient-to-br from-slate-900 to-[#001F3F] text-white rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
              <IdCard className="w-4 h-4 text-sky-400" />
              Inspector Enrolment Protocol
            </h4>
            <ul className="text-xs space-y-2 text-slate-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Valid Government Service ID Verification</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Designated MMR Circle / Territorial Jurisdiction</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Calibrated Field Measurement Kit Assigned</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Division Inspector Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Division 04 Field Inspector Registry
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {filteredInspectors.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Roster of authorized inspectors registered for inspection and enforcement duty
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={registrySearch}
              onChange={(e) => setRegistrySearch(e.target.value)}
              placeholder="Search by name, ID or circle..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Registry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Inspector ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Cadre / Designation</th>
                <th className="py-2.5 px-3">Assigned Zone</th>
                <th className="py-2.5 px-3">Email &amp; Mobile</th>
                <th className="py-2.5 px-3">Enrolment Date</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInspectors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No registered inspectors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredInspectors.map((inspector) => (
                  <tr key={inspector.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {inspector.id}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {inspector.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {inspector.designation}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {inspector.zone}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <div>{inspector.email}</div>
                      <div className="font-mono text-[10px] text-slate-400">{inspector.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {inspector.registeredAt}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
