import React from 'react';
import { 
  Menu, 
  User
} from 'lucide-react';
import { EnforcementAlert, OfficerProfile } from '../../types/compliance';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenLiveScan?: () => void;
  onExportBulkCSV?: () => void;
  onOpenRulesReference?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  alerts?: EnforcementAlert[];
  onSelectAlert?: (alert: EnforcementAlert) => void;
  onLogout?: () => void;
  officer?: OfficerProfile;
  onOpenProfileDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  officer,
  onOpenProfileDrawer
}) => {
  return (
    <header className="bg-[#001F3F] text-white border-b border-[#001428] sticky top-0 z-30 shadow-sm">
      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Officer Dashboard Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 lg:hidden border border-white/15 transition cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2">
              <div className="h-11 sm:h-12 bg-white rounded-lg px-2.5 py-1 border border-white/20 shrink-0 flex items-center justify-center shadow-xs overflow-hidden">
                <img 
                  src="/packproof_logo.png" 
                  alt="Packproof Logo" 
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight leading-none">
                Officer Inspection Dashboard
              </h1>
              <p className="text-xs text-blue-100/80 mt-1.5 hidden sm:block">
                Legal Metrology Central Enforcement Portal{officer?.name ? ` • ${officer.name} (${officer.id || 'LMO-OFFICIAL'})` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Inspector Officer Profile Chip (Clickable to open profile drawer) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenProfileDrawer}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all cursor-pointer group text-left shadow-2xs hover:shadow-xs active:scale-95"
            title="Open Officer Regulatory Profile &amp; Credentials"
            aria-label="Open Officer Regulatory Profile"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block leading-tight text-left">
              <div className="text-xs font-semibold text-white truncate max-w-[160px] group-hover:text-sky-200 transition-colors">
                {officer?.name || 'Authorized Officer'}
              </div>
              <div className="text-[10px] text-blue-200/80 font-mono truncate max-w-[160px]">
                {officer?.id ? `${officer.id} • ${officer?.zone?.split(' - ')[0] || 'Enforcement'}` : 'Enforcement Division'}
              </div>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};
