import React from 'react';
import { 
  LayoutDashboard, 
  FileCheck2, 
  MapPin, 
  ShieldAlert, 
  AlertTriangle, 
  UserPlus, 
  X,
  Globe,
  LogOut,
  Megaphone
} from 'lucide-react';

import { OfficerProfile } from '../../types/compliance';

export type NavigationTarget = 
  | 'overview'
  | 'inspections'
  | 'citizen-complaints'
  | 'map'
  | 'ecommerce'
  | 'compliance'
  | 'alerts'
  | 'inspector-registration'
  | 'violations'
  | 'reports'
  | 'history';

interface SidebarProps {
  activeSection: NavigationTarget;
  onNavigate: (target: NavigationTarget) => void;
  onOpenLiveScan?: () => void;
  onOpenRulesReference?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalAlertsCount?: number;
  totalRecordsCount?: number;
  pendingComplaintsCount?: number;
  onLogout?: () => void;
  officer?: OfficerProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  totalAlertsCount = 4,
  totalRecordsCount = 18,
  pendingComplaintsCount = 0,
  onLogout,
  officer
}) => {
  const handleItemClick = (target: NavigationTarget) => {
    onNavigate(target);
    onCloseMobile();
  };

  const navItemClass = (target: NavigationTarget) => {
    const isActive = activeSection === target;
    return `w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-bold transition-colors text-left cursor-pointer ${
      isActive
        ? 'bg-white/15 text-white font-bold shadow-xs border-l-2 border-sky-400 pl-2.5'
        : 'text-blue-100/90 hover:text-white hover:bg-white/10'
    }`;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container - Connected under the Navbar on desktop */}
      <aside
        className={`fixed z-40 w-64 bg-[#001F3F] text-white border-r border-[#001428] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 font-bold ${
          isOpenMobile 
            ? 'inset-y-0 left-0 shadow-2xl translate-x-0' 
            : '-translate-x-full lg:translate-x-0 lg:top-[72px] lg:bottom-0 lg:left-0'
        }`}
      >
        {/* Mobile Close Bar (only visible on mobile drawer) */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between lg:hidden">
          <span className="text-xs font-bold text-blue-200 tracking-wider uppercase">Menu</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Navigation Header */}
        <div className="hidden lg:block px-4 pt-4 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200/90">Navigation</span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-xs">
          
          {/* 1. Overview */}
          <button
            onClick={() => handleItemClick('overview')}
            className={navItemClass('overview')}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${activeSection === 'overview' ? 'text-white' : 'text-blue-200'}`} />
              <span className="font-bold">Overview</span>
            </div>
          </button>

          {/* 2. Inspection Cases */}
          <button
            onClick={() => handleItemClick('inspections')}
            className={navItemClass('inspections')}
          >
            <div className="flex items-center gap-2.5">
              <FileCheck2 className={`w-4 h-4 ${activeSection === 'inspections' ? 'text-white' : 'text-blue-200'}`} />
              <span className="font-bold">Inspection Cases</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-white/20 text-white font-bold">
              {totalRecordsCount}
            </span>
          </button>

          {/* 3. Citizen Complaints */}
          <button
            onClick={() => handleItemClick('citizen-complaints')}
            className={navItemClass('citizen-complaints')}
          >
            <div className="flex items-center gap-2.5">
              <Megaphone className={`w-4 h-4 ${activeSection === 'citizen-complaints' ? 'text-white' : 'text-rose-300'}`} />
              <span className="font-bold">Citizen Complaints</span>
            </div>
            {pendingComplaintsCount > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-rose-500 text-white shadow-2xs animate-pulse">
                {pendingComplaintsCount} Action
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-white/15 text-blue-200 font-bold">
                0
              </span>
            )}
          </button>

          {/* 3. Inspection Map */}
          <button
            onClick={() => handleItemClick('map')}
            className={navItemClass('map')}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className={`w-4 h-4 ${activeSection === 'map' ? 'text-white' : 'text-blue-200'}`} />
              <span className="font-bold">Inspection Map</span>
            </div>
          </button>

          {/* 4. E-Commerce Audit */}
          <button
            onClick={() => handleItemClick('ecommerce')}
            className={navItemClass('ecommerce')}
          >
            <div className="flex items-center gap-2.5">
              <Globe className={`w-4 h-4 ${activeSection === 'ecommerce' ? 'text-white' : 'text-blue-200'}`} />
              <span className="font-bold">E-Commerce Audit</span>
            </div>
          </button>

          {/* 5. Compliance Analysis */}
          <button
            onClick={() => handleItemClick('compliance')}
            className={navItemClass('compliance')}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className={`w-4 h-4 ${activeSection === 'compliance' ? 'text-white' : 'text-blue-200/60'}`} />
              <span className="font-bold">Compliance Analysis</span>
            </div>
          </button>

          {/* 6. Violation Alerts */}
          <button
            onClick={() => handleItemClick('alerts')}
            className={navItemClass('alerts')}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className={`w-4 h-4 ${activeSection === 'alerts' ? 'text-white' : 'text-amber-200/60'}`} />
              <span className="font-bold">Violation Alerts</span>
            </div>
            {totalAlertsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-400/15 text-amber-200 border border-amber-300/20">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="pt-2 pb-1 border-b border-white/10"></div>

          {/* 7. Inspector Registration */}
          <button
            onClick={() => handleItemClick('inspector-registration')}
            className={navItemClass('inspector-registration')}
          >
            <div className="flex items-center gap-2.5">
              <UserPlus className={`w-4 h-4 ${activeSection === 'inspector-registration' ? 'text-white' : 'text-blue-200'}`} />
              <span className="font-bold">Inspector Registration</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30">
              New
            </span>
          </button>

        </div>

        {/* Official Officer Terminal Footer */}
        <div className="p-3 border-t border-white/10 bg-[#001428]/80 text-[11px] text-blue-200 font-bold">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-white font-bold">{officer?.id || 'LMO-OFFICIAL'}</span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>
          <div className="mt-1 text-[10px] text-blue-200/90 font-bold truncate">
            {officer?.zone?.split(' - ')[0] || 'Division 04'} • Western Regulatory Division
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-white/10 hover:bg-rose-600/30 hover:text-white text-blue-100 text-[11px] font-bold transition cursor-pointer border border-white/15 hover:border-rose-400/40 shadow-2xs"
            >
              <LogOut className="w-3 h-3" />
              <span className="font-bold">Sign Out of Terminal</span>
            </button>
          )}
        </div>

      </aside>
    </>
  );
};
