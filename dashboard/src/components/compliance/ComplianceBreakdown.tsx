import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle,
  FileText,
  ArrowRight,
  Clock,
  Building2,
  MapPin,
  Sparkles,
  Filter,
  CheckCircle2,
  Layers,
  Scale,
  FileWarning,
  PieChart as PieChartIcon,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { 
  VIOLATION_DISTRIBUTION_DATA, 
  CATEGORY_RULE_MATRIX,
  MOCK_ENFORCEMENT_ALERTS
} from '../../data/mockInspections';
import { EnforcementAlert } from '../../types/compliance';

interface ComplianceBreakdownProps {
  totalInspections: number;
  compliantCount: number;
  violationCount: number;
  alerts?: EnforcementAlert[];
  activeTab?: 'all' | 'compliance' | 'alerts';
  onTabChange?: (tab: 'compliance' | 'alerts') => void;
  onOpenNotice?: (recordId: string) => void;
  onSelectAlertRecord?: (recordId: string) => void;
  onSelectCategoryFilter?: (category: string) => void;
  onViewMoreCompliance?: () => void;
  onViewMoreViolations?: () => void;
}

// Curated faint/pastel colors for categories
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Beverages': '#7dd3fc', // Soft sky
  'Cosmetics & Personal Care': '#f472b6', // Soft pink
  'Snacks & Confectionery': '#fcd34d', // Soft amber
  'Electronics & Devices': '#c4b5fd', // Soft violet
  'Household & Detergents': '#6ee7b7', // Soft emerald
  'E-Commerce Logistics': '#a5b4fc', // Soft indigo
};

// Detailed statutory data for the 6 core rules
const STATUTORY_RULE_DETAILS: Record<string, {
  rule: string;
  title: string;
  section: string;
  standard: string;
  penalty: string;
  severity: string;
}> = {
  'Rule 6(1)(e)': {
    rule: 'Rule 6(1)(e)',
    title: 'Maximum Retail Price (MRP) & Dual Pricing',
    section: 'Section 18 & Section 36(1) of Legal Metrology Act, 2009',
    standard: 'MRP must be stated in format ₹ XX.XX (inclusive of all taxes). No alteration or secondary sticker allowed.',
    penalty: 'Compounding fine up to ₹25,000 for first offence; seizure of entire batch under Section 15.',
    severity: 'CRITICAL'
  },
  'Rule 7': {
    rule: 'Rule 7',
    title: 'Minimum Numeral Height (Font Specification)',
    section: 'Rule 7, Table I of LMPC Rules, 2011',
    standard: 'Numeral height for net quantity declaration must satisfy statutory minimums (e.g. >= 4.0mm for > 200g up to 1kg).',
    penalty: 'Notice under Form VI; rectification or compounding fine up to ₹20,000.',
    severity: 'HIGH'
  },
  'Rule 6(1)(n)': {
    rule: 'Rule 6(1)(n)',
    title: 'Consumer Care Cell & Grievance Contact',
    section: 'Rule 6(1)(n) of LMPC Rules, 2011',
    standard: 'Mandatory declaration of Consumer Care Cell with Name, Address, Working Telephone, and Valid Email ID.',
    penalty: 'Compounding fine up to ₹15,000 per violation.',
    severity: 'MEDIUM'
  },
  'Rule 6(1)(d)': {
    rule: 'Rule 6(1)(d)',
    title: 'Month & Year of Manufacture / Pre-packing',
    section: 'Rule 6(1)(d) of LMPC Rules, 2011',
    standard: 'Clear declaration of month and year (e.g. MM/YYYY or Month Year) on principal display panel.',
    penalty: 'Notice of contravention; fine up to ₹15,000 under Section 36(1).',
    severity: 'MEDIUM'
  },
  'Rule 6(10)': {
    rule: 'Rule 6(10)',
    title: 'Country of Origin on Imported Commodities',
    section: 'Rule 6(10) of LMPC Rules, 2011 read with Customs Act',
    standard: 'Country of Origin or manufacturing assembly must be conspicuously stated on exterior packaging face.',
    penalty: 'Seizure order under Form V; compounding penalty up to ₹25,000.',
    severity: 'HIGH'
  },
  'Rule 6(11)': {
    rule: 'Rule 6(11)',
    title: 'Unit Sale Price (USP) Declaration',
    section: 'Rule 6(11) of LMPC Rules, 2011',
    standard: 'Mandatory Unit Sale Price (e.g. ₹ per g, ml, or piece) where package quantity exceeds 1 standard unit.',
    penalty: 'Compounding notice; statutory fine up to ₹20,000.',
    severity: 'HIGH'
  }
};

export const ComplianceBreakdown: React.FC<ComplianceBreakdownProps> = ({
  totalInspections,
  compliantCount,
  violationCount,
  alerts = MOCK_ENFORCEMENT_ALERTS,
  activeTab = 'all',
  onTabChange,
  onOpenNotice,
  onSelectAlertRecord,
  onSelectCategoryFilter,
  onViewMoreCompliance,
  onViewMoreViolations
}) => {
  // State for interactive visualizations
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryViewMode, setCategoryViewMode] = useState<'pie' | 'meters'>('pie');
  
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(null);
  const [selectedRuleKey, setSelectedRuleKey] = useState<string>('Rule 6(1)(e)');

  const [activeAlertIndex, setActiveAlertIndex] = useState<number | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || 'ALT-2026-101');

  // Hover and side popup states for pie charts
  const [hoveredComplianceIndex, setHoveredComplianceIndex] = useState<number | null>(null);
  const [compliancePopupSide, setCompliancePopupSide] = useState<'left' | 'right'>('right');

  const [categoryPopupSide, setCategoryPopupSide] = useState<'left' | 'right'>('right');
  const [rulePopupSide, setRulePopupSide] = useState<'left' | 'right'>('right');

  const [hoveredAlertSeverityIndex, setHoveredAlertSeverityIndex] = useState<number | null>(null);
  const [alertSeverityPopupSide, setAlertSeverityPopupSide] = useState<'left' | 'right'>('right');

  const handleComplianceMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCompliancePopupSide(e.clientX - rect.left > rect.width / 2 ? 'left' : 'right');
  };

  const handleCategoryMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCategoryPopupSide(e.clientX - rect.left > rect.width / 2 ? 'left' : 'right');
  };

  const handleRuleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRulePopupSide(e.clientX - rect.left > rect.width / 2 ? 'left' : 'right');
  };

  const handleAlertSeverityMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAlertSeverityPopupSide(e.clientX - rect.left > rect.width / 2 ? 'left' : 'right');
  };

  // Rates
  const complianceRate = totalInspections > 0 
    ? Math.round((compliantCount / totalInspections) * 100) 
    : 100;
  const violationRate = 100 - complianceRate;

  // 1. Overall Compliance Ratio Donut Data (faint pastel tones)
  const overallComplianceData = useMemo(() => [
    { 
      name: 'Compliant Units', 
      value: compliantCount, 
      color: '#6ee7b7', 
      label: 'Passed Statutory Rules',
      rate: complianceRate 
    },
    { 
      name: 'Infractions Flagged', 
      value: violationCount, 
      color: '#fca5a5', 
      label: 'Contravention Identified',
      rate: violationRate 
    }
  ], [compliantCount, violationCount, complianceRate, violationRate]);

  // 2. Commodity Group Distribution Data (Derived from CATEGORY_RULE_MATRIX)
  const categoryChartData = useMemo(() => {
    const totalFailuresAll = CATEGORY_RULE_MATRIX.reduce((sum, r) => sum + r.totalFailures, 0);
    return CATEGORY_RULE_MATRIX.map(item => {
      // Find top failure rule for this category
      const ruleCounts = [
        { rule: 'Rule 6(1)(e) MRP', count: item.mrp },
        { rule: 'Rule 7 Font Size', count: item.fontSize },
        { rule: 'Rule 6(1)(c) Net Qty', count: item.netQty },
        { rule: 'Rule 6(1)(d) Date', count: item.date },
        { rule: 'Rule 6(1)(n) Consumer Care', count: item.consumerCare },
        { rule: 'Rule 6(10) Origin', count: item.origin }
      ];
      ruleCounts.sort((a, b) => b.count - a.count);
      const topRule = ruleCounts[0];

      const pct = totalFailuresAll > 0 ? Math.round((item.totalFailures / totalFailuresAll) * 100) : 0;
      // Category compliance health estimate based on total cases vs failures
      const healthPct = Math.max(68, Math.min(96, 100 - Math.round((item.totalFailures / 90) * 30)));

      return {
        name: item.category,
        value: item.totalFailures,
        percentage: pct,
        color: CATEGORY_COLORS[item.category] || '#64748b',
        topRule: `${topRule.rule} (${topRule.count} cases)`,
        healthPct,
        raw: item
      };
    });
  }, []);

  // 3. Statutory Violations Donut Data
  const violationRulesData = useMemo(() => {
    return VIOLATION_DISTRIBUTION_DATA.map(item => ({
      ...item,
      value: item.count
    }));
  }, []);

  // 4. Urgent Violation Alerts by Severity Data (faint pastel tones)
  const alertsSeverityData = useMemo(() => {
    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
    const highCount = alerts.filter(a => a.severity === 'HIGH').length;
    const mediumCount = alerts.filter(a => a.severity === 'MEDIUM').length;

    return [
      { name: 'Critical Notice / Seizure', value: criticalCount, color: '#f87171', severity: 'CRITICAL', deadline: 'Immediate 24h' },
      { name: 'High Urgency / Compounding', value: highCount, color: '#fcd34d', severity: 'HIGH', deadline: 'Due in 48h' },
      ...(mediumCount > 0 ? [{ name: 'Routine Audit Action', value: mediumCount, color: '#a5b4fc', severity: 'MEDIUM', deadline: 'Within 7d' }] : [])
    ].filter(item => item.value > 0);
  }, [alerts]);

  const activeCategoryItem = activeCategoryIndex !== null ? categoryChartData[activeCategoryIndex] : null;
  const activeRuleItem = activeRuleIndex !== null ? violationRulesData[activeRuleIndex] : null;
  const currentStatutoryRule = STATUTORY_RULE_DETAILS[selectedRuleKey] || STATUTORY_RULE_DETAILS['Rule 6(1)(e)'];
  const activeAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

  return (
    <div className="space-y-7">
      
      {/* Visual Navigation Pill Switcher when specifically in Compliance or Alerts tab */}
      {activeTab !== 'all' && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => onTabChange?.('compliance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600/70" />
            <span>Compliance Analysis</span>
          </button>
          <button
            onClick={() => onTabChange?.('alerts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600/70" />
            <span>Violation Alerts &amp; Infractions</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-amber-500/15 text-amber-700/80 border border-amber-500/25">
              {alerts.length}
            </span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: COMPLIANCE ANALYSIS (VISUALIZATION FORM — ZERO TABLES)        */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'compliance') && (
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 transition-all">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/80 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50/60 text-emerald-600/80 flex items-center justify-center border border-emerald-200/50">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Compliance Analysis &amp; Commodity Performance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual breakdown of verified inspection outcomes &amp; commodity infraction shares (No tabular representation)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">My Division Clearance:</span>
            <span className="font-semibold text-emerald-700/80 font-mono text-xs px-2.5 py-1 bg-emerald-50/60 rounded-full border border-emerald-200/60 shadow-2xs">
              {complianceRate}% Compliant
            </span>
          </div>
        </div>

        {/* Visual Charts Layout: 2 Pillars (Overall Ratio Donut + Commodity Group Share Pie) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
          
          {/* Pillar 1: Overall Legal Metrology Compliance Donut (4 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50/70 to-slate-50/30 p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                Case Outcome Ratio
              </span>
              <span className="font-mono text-xs text-slate-500 font-medium">
                {totalInspections} Verified Units
              </span>
            </div>

            {/* Donut Chart with Centered Live Metric */}
            <div 
              className="relative h-56 w-full flex items-center justify-center my-1"
              onMouseMove={handleComplianceMouseMove}
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={overallComplianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(_, idx) => setHoveredComplianceIndex(idx)}
                    onMouseLeave={() => setHoveredComplianceIndex(null)}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {overallComplianceData.map((entry, index) => (
                      <Cell 
                        key={`cell-compliance-${index}`} 
                        fill={entry.color}
                        className="transition-all duration-200 cursor-pointer hover:opacity-85"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Side Hover Popup (Positioned at side, not covering pie chart) */}
              {hoveredComplianceIndex !== null && overallComplianceData[hoveredComplianceIndex] && (
                <div 
                  className={`absolute top-2 ${compliancePopupSide === 'left' ? 'left-2' : 'right-2'} z-30 pointer-events-none transition-all duration-150`}
                >
                  <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700 max-w-[200px] animate-in fade-in zoom-in-95">
                    <div className="font-bold flex items-center gap-1.5 text-slate-100">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: overallComplianceData[hoveredComplianceIndex].color }} 
                      />
                      <span className="truncate">{overallComplianceData[hoveredComplianceIndex].name}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 leading-snug">
                      {overallComplianceData[hoveredComplianceIndex].label}
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex justify-between gap-3 font-mono text-[11px]">
                      <span className="text-slate-400">Total Cases:</span>
                      <span className="font-bold text-white">
                        {overallComplianceData[hoveredComplianceIndex].value} ({overallComplianceData[hoveredComplianceIndex].rate}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Centered KPI in Donut Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Compliance
                </span>
                <span className="text-3xl font-black text-slate-900 tracking-tight block leading-tight">
                  {complianceRate}%
                </span>
                <span className="text-[10px] font-semibold text-emerald-600/80 block">
                  Statutory Clearance
                </span>
              </div>
            </div>

            {/* Visual Metric Outcome Pills */}
            <div className="space-y-2 pt-2 border-t border-slate-200/70 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-200/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 shrink-0"></span>
                  <span className="font-medium text-slate-700">Fully Compliant Packages</span>
                </div>
                <span className="font-mono font-bold text-emerald-700/80">
                  {compliantCount} ({complianceRate}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 border border-rose-200/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 shrink-0"></span>
                  <span className="font-medium text-slate-700">Infractions Identified</span>
                </div>
                <span className="font-mono font-bold text-rose-700/80">
                  {violationCount} ({violationRate}%)
                </span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Standard: LMPC Rules 6 &amp; 7</span>
              <span>Division 04 Verified</span>
            </div>
          </div>

          {/* Pillar 2: Commodity Group Visual Pie & Drill-Down Intelligence (7 cols) */}
          <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            
            {/* Sub-header with View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Commodity Group Infraction Share
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click any commodity slice to inspect primary failure patterns
                </p>
              </div>

              {/* View Mode Toggle: Pie vs Performance Gauges */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] self-start sm:self-auto">
                <button
                  onClick={() => setCategoryViewMode('pie')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition ${
                    categoryViewMode === 'pie' 
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View as Pie Chart"
                >
                  <PieChartIcon className="w-3 h-3" />
                  <span>Pie View</span>
                </button>
                <button
                  onClick={() => setCategoryViewMode('meters')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition ${
                    categoryViewMode === 'meters' 
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View as Compliance Meter Gauges"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Health Gauges</span>
                </button>
              </div>
            </div>

            {/* View 1: Commodity Donut/Pie Chart */}
            {categoryViewMode === 'pie' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-2">
                
                {/* Pie Chart Canvas */}
                <div 
                  className="md:col-span-6 relative h-60 flex items-center justify-center"
                  onMouseMove={handleCategoryMouseMove}
                >
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        onMouseEnter={(_, idx) => setActiveCategoryIndex(idx)}
                        onMouseLeave={() => setActiveCategoryIndex(null)}
                        onClick={(entry: any) => {
                          const catName = entry?.name || entry?.payload?.name;
                          if (catName) {
                            setSelectedCategory(catName === selectedCategory ? null : catName);
                          }
                        }}
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-cat-${index}`} 
                            fill={entry.color}
                            className="transition-all duration-200 cursor-pointer hover:opacity-85"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Side Hover Popup (Positioned at side, not covering pie chart) */}
                  {activeCategoryIndex !== null && categoryChartData[activeCategoryIndex] && (
                    <div 
                      className={`absolute top-2 ${categoryPopupSide === 'left' ? 'left-2' : 'right-2'} z-30 pointer-events-none transition-all duration-150`}
                    >
                      <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700 max-w-[210px] animate-in fade-in zoom-in-95">
                        <div className="font-bold flex items-center gap-1.5 text-slate-100">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: categoryChartData[activeCategoryIndex].color }} 
                          />
                          <span className="truncate">{categoryChartData[activeCategoryIndex].name}</span>
                        </div>
                        <div className="text-[11px] text-amber-300 mt-1 leading-snug">
                          Top: {categoryChartData[activeCategoryIndex].topRule}
                        </div>
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex justify-between gap-3 font-mono text-[11px]">
                          <span className="text-slate-400">Total Cases:</span>
                          <span className="font-bold text-white">
                            {categoryChartData[activeCategoryIndex].value} ({categoryChartData[activeCategoryIndex].percentage}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Centered Overlay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    {activeCategoryItem ? (
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block truncate max-w-[90px]">
                          {activeCategoryItem.name.split(' ')[0]}
                        </span>
                        <span className="text-xl font-black text-slate-900 leading-tight block">
                          {activeCategoryItem.percentage}%
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold block">
                          {activeCategoryItem.value} Cases
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                          Sectors
                        </span>
                        <span className="text-xl font-black text-blue-700 leading-tight block">
                          6 Groups
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold block">
                          410 Infractions
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Category Cards (Replacing boring tabular rows) */}
                <div className="md:col-span-6 space-y-1.5">
                  {categoryChartData.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <div
                        key={cat.name}
                        onClick={() => {
                          setSelectedCategory(isSelected ? null : cat.name);
                          if (onSelectCategoryFilter) {
                            onSelectCategoryFilter(cat.name);
                          }
                        }}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-blue-50/80 border-blue-400 shadow-2xs' 
                            : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200/80'
                        }`}
                        title={`Click to filter recent inspections by ${cat.name}`}
                      >
                        <div className="flex items-center gap-2 truncate mr-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: cat.color }} 
                          />
                          <div className="truncate">
                            <div className="font-semibold text-slate-800 text-[11px] truncate">
                              {cat.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              Leading: <span className="font-medium text-slate-700">{cat.topRule}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-slate-900 text-xs block">
                            {cat.value}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              /* View 2: Compliance Health Gauge Meters */
              <div className="space-y-3 my-2">
                {categoryChartData.map((cat) => (
                  <div 
                    key={cat.name}
                    onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(cat.name)}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="font-semibold text-slate-800">{cat.name}</span>
                        <span className="text-[10px] text-slate-500">• {cat.topRule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-[11px]">
                          {cat.healthPct}% Compliant
                        </span>
                        <span className="text-[10px] font-mono text-rose-700/80 bg-rose-50/60 px-1.5 py-0.2 rounded border border-rose-200/50">
                          {cat.value} Cases
                        </span>
                      </div>
                    </div>
                    {/* Visual Meter Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${cat.healthPct}%`,
                          backgroundColor: cat.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Insight & 1-Click Filter Action */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Select any commodity to instantly filter inspections on the map &amp; ledger
              </span>
              <button
                onClick={onViewMoreCompliance}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Activity</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>

        </div>

      </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: VIOLATION ALERTS & ANALYSIS (VISUALIZATION FORM — ZERO TABLES)  */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'alerts') && (
      <section 
        id="section-alerts" 
        className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 transition-all"
      >
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/80 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50/60 text-rose-600/80 flex items-center justify-center border border-rose-200/50">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Violation Alerts &amp; Statutory Infractions Visualisation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory infraction distribution by Legal Metrology rule alongside urgent pending enforcement actions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-rose-50/60 text-rose-700/80 border border-rose-200/60">
              {violationCount} Infractions Flagged
            </span>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-amber-50/60 text-amber-700/80 border border-amber-200/60">
              {alerts.length} Urgent Action Alerts
            </span>
          </div>
        </div>

        {/* 2 Interactive Chart Pillars: Statutory Rule Donut + Urgent Alerts Visual Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
          
          {/* Pillar A: Statutory Violations by Rule Donut Chart (6 cols) */}
          <div className="lg:col-span-6 bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5 text-rose-500/70" />
                Infraction Share by Legal Metrology Rule
              </span>
              <span className="font-mono text-xs text-slate-500 font-semibold">
                6 Core Rules
              </span>
            </div>

            {/* Donut Chart */}
            <div 
              className="relative h-56 w-full flex items-center justify-center my-1"
              onMouseMove={handleRuleMouseMove}
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={violationRulesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    onMouseEnter={(_, idx) => setActiveRuleIndex(idx)}
                    onMouseLeave={() => setActiveRuleIndex(null)}
                    onClick={(entry: any) => {
                      const r = entry?.rule || entry?.payload?.rule;
                      if (r) {
                        setSelectedRuleKey(r);
                      }
                    }}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {violationRulesData.map((entry, index) => (
                      <Cell 
                        key={`cell-rule-${index}`} 
                        fill={entry.color}
                        className="transition-all duration-200 cursor-pointer hover:opacity-85"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Side Hover Popup (Positioned at side, not covering pie chart) */}
              {activeRuleItem && (
                <div 
                  className={`absolute top-2 ${rulePopupSide === 'left' ? 'left-2' : 'right-2'} z-30 pointer-events-none transition-all duration-150`}
                >
                  <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700 max-w-[210px] animate-in fade-in zoom-in-95">
                    <div className="font-bold flex items-center gap-1.5 text-slate-100">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: activeRuleItem.color }} 
                      />
                      <span className="truncate">{activeRuleItem.name}</span>
                    </div>
                    <div className="text-[11px] text-blue-300 font-mono mt-0.5 truncate">{activeRuleItem.rule}</div>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex justify-between gap-3 font-mono text-[11px]">
                      <span className="text-slate-400">Cases:</span>
                      <span className="font-bold text-rose-400">
                        {activeRuleItem.count} ({activeRuleItem.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Centered Metric in Donut */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                {activeRuleItem ? (
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      {activeRuleItem.rule}
                    </span>
                    <span className="text-2xl font-black text-rose-500/80 leading-tight block">
                      {activeRuleItem.percentage}%
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold block">
                      {activeRuleItem.count} Violations
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Leading Rule
                    </span>
                    <span className="text-2xl font-black text-rose-500/80 leading-tight block">
                      27%
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold block">
                      Rule 6(1)(e) MRP
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Clickable Rule Selector Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-slate-200/70 text-[11px]">
              {violationRulesData.map((item) => {
                const isSelected = selectedRuleKey === item.rule;
                return (
                  <button
                    key={item.rule}
                    onClick={() => setSelectedRuleKey(item.rule)}
                    className={`px-2 py-1.5 rounded-md text-left transition flex items-center justify-between border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate mr-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-[10px]">{item.rule}</span>
                    </div>
                    <span className="font-mono text-[10px] shrink-0">{item.percentage}%</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Statutory Advisory Dossier Card for Selected Rule */}
            <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50/80 text-rose-700/80 border border-rose-200/60">
                    {currentStatutoryRule.rule}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {currentStatutoryRule.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                  {currentStatutoryRule.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Standard:</strong> {currentStatutoryRule.standard}
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span className="truncate mr-2"><strong>Statute:</strong> {currentStatutoryRule.section}</span>
                <span className="text-rose-600/80 font-semibold shrink-0">Form V/VI Action</span>
              </div>
            </div>

          </div>

          {/* Pillar B: Urgent Violation Alerts Visual Intelligence Queue (6 cols) */}
          <div className="lg:col-span-6 bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500/70" />
                Urgent Action Alerts Queue
              </span>
              <span className="font-mono text-xs text-amber-700/80 font-semibold bg-amber-50/60 px-2 py-0.5 rounded-full border border-amber-200/60">
                {alerts.length} Actions Assigned
              </span>
            </div>

            {/* Severity Distribution Donut + Live Alert Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center my-2">
              
              {/* Alert Severity Donut */}
              <div 
                className="sm:col-span-5 relative h-44 flex items-center justify-center"
                onMouseMove={handleAlertSeverityMouseMove}
              >
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={alertsSeverityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={(_, idx) => setHoveredAlertSeverityIndex(idx)}
                      onMouseLeave={() => setHoveredAlertSeverityIndex(null)}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {alertsSeverityData.map((entry, index) => (
                        <Cell 
                          key={`cell-alert-${index}`} 
                          fill={entry.color}
                          className="cursor-pointer hover:opacity-85"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Side Hover Popup (Positioned at side, not covering pie chart) */}
                {hoveredAlertSeverityIndex !== null && alertsSeverityData[hoveredAlertSeverityIndex] && (
                  <div 
                    className={`absolute top-1 ${alertSeverityPopupSide === 'left' ? 'left-1' : 'right-1'} z-30 pointer-events-none transition-all duration-150`}
                  >
                    <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2 rounded-lg shadow-xl border border-slate-700 max-w-[180px] animate-in fade-in zoom-in-95">
                      <div className="font-bold flex items-center gap-1.5 text-slate-100">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: alertsSeverityData[hoveredAlertSeverityIndex].color }} 
                        />
                        <span className="truncate">{alertsSeverityData[hoveredAlertSeverityIndex].name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {alertsSeverityData[hoveredAlertSeverityIndex].deadline}
                      </div>
                      <div className="mt-1 pt-1 border-t border-slate-800 font-mono font-bold text-amber-400 text-[11px]">
                        {alertsSeverityData[hoveredAlertSeverityIndex].value} Pending Alerts
                      </div>
                    </div>
                  </div>
                )}

                {/* Centered Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Urgent
                  </span>
                  <span className="text-xl font-black text-slate-900 leading-tight block">
                    {alerts.length}
                  </span>
                  <span className="text-[8px] font-semibold text-rose-600 block">
                    Action Due
                  </span>
                </div>
              </div>

              {/* Alert List Selector Items */}
              <div className="sm:col-span-7 space-y-2">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-lg border border-slate-200">
                    No urgent violation alerts currently registered.
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const isSelected = selectedAlertId === alert.id;
                    const isCritical = alert.severity === 'CRITICAL';
                    return (
                      <div
                        key={alert.id}
                        onClick={() => setSelectedAlertId(alert.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-slate-400 shadow-xs'
                            : 'bg-white/80 hover:bg-white border-slate-200'
                        } ${isCritical ? 'border-l-3 border-l-rose-300' : 'border-l-3 border-l-amber-300'}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            isCritical ? 'bg-rose-50 text-rose-700/80 border border-rose-200/60' : 'bg-amber-50 text-amber-700/80 border border-amber-200/60'
                          }`}>
                            {alert.severity}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            <span className="font-semibold text-slate-700">{alert.deadline}</span>
                          </div>
                        </div>

                        <div className="font-bold text-slate-900 text-[11px] leading-tight truncate">
                          {alert.title}
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                          <span className="truncate">{alert.retailerName}</span>
                          <span className="font-mono text-blue-700 font-semibold">{alert.inspectionId}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Active Selected Alert Action Box */}
            {activeAlert && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {activeAlert.retailerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                    <MapPin className="w-2.5 h-2.5" />
                    <span className="truncate">{activeAlert.location}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {activeAlert.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectAlertRecord && onSelectAlertRecord(activeAlert.inspectionId)}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Inspection</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onOpenNotice && onOpenNotice(activeAlert.inspectionId)}
                    className={`py-1 px-3 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                      activeAlert.severity === 'CRITICAL'
                        ? 'bg-rose-600/80 hover:bg-rose-700/80 text-white'
                        : 'bg-slate-700/80 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <FileWarning className="w-3 h-3" />
                    <span>{activeAlert.actionLabel}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Legal Metrology Enforcement Advisory Note at Bottom */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Statutory Officer Enforcement Directive:</strong> Under Sections 15, 18, and 36 of the Legal Metrology Act, 2009, field officers are empowered to issue Form VI show cause notices and execute seizure memos under Form V for altered MRP declarations, non-standard font sizes, and missing unit sale pricing.
          </div>
        </div>

        {/* View More at bottom */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Legal Metrology Division 04 Enforcement Jurisdiction
          </span>
          <button
            onClick={onViewMoreViolations}
            className="text-xs font-semibold text-rose-700/80 hover:text-rose-800 transition flex items-center gap-1 cursor-pointer"
          >
            <span>View All Infractions in Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </section>
      )}

    </div>
  );
};
