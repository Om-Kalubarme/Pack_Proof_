import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Award,
  LogIn,
  IdCard
} from 'lucide-react';
import { OfficerProfile } from '../../types/compliance';

interface RegisterPageProps {
  onRegisterSuccess: (officer: OfficerProfile) => void;
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin
}) => {
  // Form State prefilled with realistic dummy data for instant testing
  const [name, setName] = useState('Officer Rajesh V. Sharma');
  const [officerId, setOfficerId] = useState('LMO-MH-2026');
  const [designation, setDesignation] = useState('Senior Legal Metrology Officer');
  const [zone, setZone] = useState('Division 04 - Mumbai Metropolitan Region');
  const [email, setEmail] = useState('officer.sharma@legalmetrology.gov.in');
  const [phone, setPhone] = useState('+91 98201 55432');
  const [password, setPassword] = useState('Officer@2026');
  const [confirmPassword, setConfirmPassword] = useState('Officer@2026');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Please enter the Officer Full Name.');
      return;
    }
    if (!officerId.trim()) {
      setErrorMessage('Please enter a valid Officer ID.');
      return;
    }
    if (!designation.trim()) {
      setErrorMessage('Please enter your Cadre / Designation.');
      return;
    }
    if (!zone.trim()) {
      setErrorMessage('Please enter your Territorial Division / Zone.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid official email.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile contact number.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Security password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const formattedOfficerId = officerId.trim().toUpperCase();
    const formattedName = name.trim();

    const newOfficer: OfficerProfile = {
      id: formattedOfficerId,
      name: formattedName,
      designation: designation.trim(),
      zone: zone.trim(),
      email: email.trim(),
      phone: phone.trim(),
      registeredAt: new Date().toISOString()
    };

    // Save registered officer to localStorage
    try {
      localStorage.setItem('officer_profile', JSON.stringify(newOfficer));
      const existingList = JSON.parse(localStorage.getItem('registered_officers') || '[]');
      existingList.unshift(newOfficer);
      localStorage.setItem('registered_officers', JSON.stringify(existingList.slice(0, 10)));
    } catch {
      // ignore storage quota errors
    }

    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess(newOfficer);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col items-center justify-center p-3 sm:p-6 font-sans">
      
      {/* Top Department Brand & Emblem */}
      <div className="mb-5 text-center z-10 animate-in fade-in duration-300">
        
        <div className="max-w-[340px] sm:max-w-[380px] bg-white rounded-2xl shadow-md p-3 sm:p-4 flex items-center justify-center mx-auto mb-3.5 border border-slate-200/80">
          <img 
            src="/packproof_logo.png" 
            alt="Packproof Logo"
            className="w-full h-auto max-h-20 sm:max-h-24 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-[#0c2340] tracking-tight">
          Legal Metrology Division
        </h1>

        {/* Tagline Pill */}
        <div className="inline-block mt-2 px-3.5 py-1 rounded-full bg-[#f3ede4] text-[#1e3a5f] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
          ENFORCEMENT &amp; PACKAGE INSPECTION
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-[580px] bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/80 border border-slate-200/90 p-6 sm:p-8 z-10 text-left transition-all my-2">
        
        {/* Card Header */}
        <div className="mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Officer Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter your official details to register for field verification access.
          </p>
        </div>

        {/* Error Message Box */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Demo Officer Pill */}
        <div className="mb-4 p-3 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-sky-950 flex items-center justify-between gap-2 shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-700 block">
              Sample Officer Profile (All Fields Pre-filled)
            </span>
            <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
              <span>Rajesh Sharma</span> • <span>LMO-MH-2026</span> • <span className="text-slate-600">Officer@2026</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setName('Officer Rajesh V. Sharma');
              setOfficerId('LMO-MH-2026');
              setDesignation('Senior Legal Metrology Officer');
              setZone('Division 04 - Mumbai Metropolitan Region');
              setEmail('officer.sharma@legalmetrology.gov.in');
              setPhone('+91 98201 55432');
              setPassword('Officer@2026');
              setConfirmPassword('Officer@2026');
              setErrorMessage('');
            }}
            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer shrink-0 active:scale-95"
          >
            Reset Demo
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          
          {/* Hidden traps to prevent browser autofill */}
          <input type="text" name="fake_reg_user" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />
          <input type="password" name="fake_reg_pass" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />
          
          {/* Row 1: Full Name & Officer ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Field: Full Name */}
            <div>
              <label 
                htmlFor="reg-name" 
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Officer Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
                <User className="w-4 h-4 text-[#1e3a5f] mr-2.5 shrink-0" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. Officer Full Name"
                  className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            {/* Field: Officer ID */}
            <div>
              <label 
                htmlFor="reg-officer-id" 
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Officer ID <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
                <IdCard className="w-4 h-4 text-[#1e3a5f] mr-2.5 shrink-0" />
                <input
                  id="reg-officer-id"
                  name="officerId"
                  type="text"
                  autoComplete="off"
                  value={officerId}
                  onChange={(e) => {
                    setOfficerId(e.target.value.toUpperCase());
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. INSP-DL-4082"
                  className="w-full text-xs sm:text-sm font-mono font-bold text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 2: Cadre/Designation & Jurisdiction Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Field: Designation */}
            <div>
              <label 
                htmlFor="reg-designation" 
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Official Cadre / Designation <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
                <Award className="w-4 h-4 text-[#1e3a5f] mr-2.5 shrink-0" />
                <input
                  id="reg-designation"
                  name="designation"
                  type="text"
                  autoComplete="off"
                  value={designation}
                  onChange={(e) => {
                    setDesignation(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. Senior Legal Metrology Inspector"
                  className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            {/* Field: Zone */}
            <div>
              <label 
                htmlFor="reg-zone" 
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Territorial Division / Zone <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
                <MapPin className="w-4 h-4 text-[#1e3a5f] mr-2.5 shrink-0" />
                <input
                  id="reg-zone"
                  name="zone"
                  type="text"
                  autoComplete="off"
                  value={zone}
                  onChange={(e) => {
                    setZone(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. Division 04 - Mumbai Metropolitan Region"
                  className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 3: Official Email & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Field: Email */}
            <div>
              <label 
                htmlFor="reg-email" 
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Government Email <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
                <Mail className="w-4 h-4 text-[#1e3a5f] mr-2.5 shrink-0" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="officer@legalmetrology.gov.in"
                  className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            {/* Field: Phone */}
            <div>
              <label 
                htmlFor="reg-phone" 
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Official Mobile No. <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
                <Phone className="w-4 h-4 text-[#1e3a5f] mr-2.5 shrink-0" />
                <input
                  id="reg-phone"
                  name="tel"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
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
            {/* Field: Password */}
            <div>
              <label 
                htmlFor="reg-new-password" 
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
                <Lock className="w-4 h-4 text-[#1e3a5f] mr-2.5 shrink-0" />
                <input
                  id="reg-new-password"
                  name="new-password"
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

            {/* Field: Confirm Password */}
            <div>
              <label 
                htmlFor="reg-confirm-password" 
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
                <Lock className="w-4 h-4 text-[#1e3a5f] mr-2.5 shrink-0" />
                <input
                  id="reg-confirm-password"
                  name="confirm-password"
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
                <span className="text-[10px] text-rose-600 font-medium block mt-1">
                  Passwords do not match
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white bg-[#0c2340] hover:bg-[#16335a] active:scale-[0.99] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Enrolling Officer...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Switch to Login Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0c2340] transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#1e3a5f]" />
                <span>Already have an account? <strong className="text-[#0c2340] underline underline-offset-2">Sign In</strong></span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Official Legal & Security Footer */}
      <div className="mt-6 text-center text-xs text-slate-500 space-y-1 z-10">
        <p>
          The Legal Metrology Act, 2009 &amp; PCR, 2011
        </p>
        <p className="text-[11px] text-slate-400">
          Authorized Field Inspector Mobile Portal
        </p>
      </div>

    </div>
  );
};
