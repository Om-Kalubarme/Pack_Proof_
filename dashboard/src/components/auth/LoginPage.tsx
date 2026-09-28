import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  IdCard,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { OfficerProfile } from '../../types/compliance';

interface LoginPageProps {
  onLoginSuccess: (officer: OfficerProfile) => void;
  onNavigateToRegister?: () => void;
  registrationSuccessMessage?: string;
  initialUsername?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess,
  onNavigateToRegister,
  registrationSuccessMessage,
  initialUsername
}) => {
  // Pre-filled with dummy officer credentials for testing, or newly registered officer
  const [username, setUsername] = useState(initialUsername || 'LMO-MH-2024');
  const [password, setPassword] = useState('Officer@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Please enter your Officer ID or Email');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your Password');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const cleanUsername = username.trim();
    let officerData: OfficerProfile = {
      id: cleanUsername.toUpperCase(),
      name: cleanUsername.includes('@') ? cleanUsername.split('@')[0] : cleanUsername,
      designation: 'Legal Metrology Officer',
      zone: 'Division 04 - Mumbai Central Zone'
    };

    // Pre-configured rich dummy officer profile
    if (cleanUsername.toUpperCase() === 'LMO-MH-2024' || cleanUsername.toLowerCase() === 'officer@gov.in') {
      officerData = {
        id: 'LMO-MH-2024',
        name: 'Officer Rajesh V. Sharma',
        designation: 'Senior Legal Metrology Officer',
        zone: 'Division 04 - Mumbai Central Zone',
        email: 'r.sharma@legalmetrology.gov.in',
        phone: '+91 98201 55432',
        warrantNo: 'W-LMO/MH/2024/7741',
        cadre: 'Gazetted Group-A Legal Metrology Service',
        stationHq: 'Enforcement Directorate, Fort, Mumbai',
        dutyStatus: 'ON_DUTY',
        nplCertNo: 'NPL/LMA/2025/C-9082',
        standardWeightKit: 'NPL-F1-KIT-4019'
      };
    }

    try {
      const storedOfficers: OfficerProfile[] = JSON.parse(localStorage.getItem('registered_officers') || '[]');
      const storedActive = localStorage.getItem('officer_profile');
      if (storedActive) {
        const parsedActive = JSON.parse(storedActive);
        if (parsedActive.id?.toLowerCase() === cleanUsername.toLowerCase() || parsedActive.email?.toLowerCase() === cleanUsername.toLowerCase()) {
          officerData = parsedActive;
        }
      }
      const match = storedOfficers.find(o => 
        o.id.toLowerCase() === cleanUsername.toLowerCase() || 
        o.email?.toLowerCase() === cleanUsername.toLowerCase()
      );
      if (match) {
        officerData = match;
      }
    } catch {
      // fallback to default
    }

    // Simulate authentication transition
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(officerData);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Top Department Brand & Emblem */}
      <div className="mb-6 text-center z-10 animate-in fade-in duration-300">
        
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

      {/* Main Form Login Card */}
      <div className="w-full max-w-[390px] sm:max-w-[420px] bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/80 border border-slate-200/90 p-6 sm:p-7 z-10 text-left transition-all">
        
        {/* Registration Success Notification */}
        {registrationSuccessMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{registrationSuccessMessage}</span>
          </div>
        )}

        {/* Error Message Box */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          
          {/* Hidden inputs to absorb browser autofill behavior */}
          <input type="text" name="fake_user" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />
          <input type="password" name="fake_pass" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />

          {/* Field 1: Officer ID / Email */}
          <div>
            <label 
              htmlFor="officer-identity" 
              className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
            >
              Officer ID / Email
            </label>
            
            <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3.5 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
              <IdCard className="w-5 h-5 text-[#1e3a5f] shrink-0 mr-3" />
              <input
                id="officer-identity"
                name="officer_field_identity"
                type="text"
                autoComplete="off"
                data-lpignore="true"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter your Officer ID or Email"
                className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                required
              />
            </div>
          </div>

          {/* Field 2: Password */}
          <div>
            <label 
              htmlFor="officer-security-pin" 
              className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
            >
              Password
            </label>
            
            <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3.5 py-2.5 focus-within:border-[#0c2340] focus-within:ring-2 focus-within:ring-[#0c2340]/10 transition-all shadow-2xs">
              <Lock className="w-5 h-5 text-[#1e3a5f] shrink-0 mr-3" />
              <input
                id="officer-security-pin"
                name="officer_field_passcode"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                data-lpignore="true"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pl-2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Pill */}
          <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-sky-950 flex items-center justify-between gap-2 shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-700 block">
                Demo Officer Credentials
              </span>
              <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                <span>LMO-MH-2024</span> • <span className="text-slate-600">Officer@2026</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('LMO-MH-2024');
                setPassword('Officer@2026');
                if (errorMessage) setErrorMessage('');
              }}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer shrink-0 active:scale-95"
            >
              Fill Demo
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white bg-[#0c2340] hover:bg-[#16335a] active:scale-[0.99] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Navigation to Officer Registration */}
          {onNavigateToRegister && (
            <div className="pt-3 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0c2340] transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#1e3a5f]" />
                <span>New Officer? <strong className="text-[#0c2340] underline underline-offset-2">Register for Credential Access</strong></span>
              </button>
            </div>
          )}

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
