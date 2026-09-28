import React, { useState } from 'react';
import { 
  Flame, 
  MapPin, 
  Grid, 
  Users, 
  ArrowRight
} from 'lucide-react';
import { EnforcementZone } from '../../types/compliance';
import { MOCK_ENFORCEMENT_ZONES, CATEGORY_RULE_MATRIX } from '../../data/mockInspections';

interface EnforcementHeatmapProps {
  zones?: EnforcementZone[];
  onSelectZoneFilter?: (zoneName: string) => void;
  onSelectCategoryFilter?: (category: string) => void;
}

export const EnforcementHeatmap: React.FC<EnforcementHeatmapProps> = ({
  zones = MOCK_ENFORCEMENT_ZONES,
  onSelectZoneFilter,
  onSelectCategoryFilter
}) => {
  const [viewMode, setViewMode] = useState<'zones' | 'matrix'>('zones');
  const [selectedZone, setSelectedZone] = useState<EnforcementZone | null>(zones[0] || null);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-300/40';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-300/40';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300/40';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300/40';
    }
  };

  const getRiskBg = (rate: number) => {
    if (rate < 75) return 'bg-gradient-to-br from-red-500/10 to-rose-500/20 border-red-300 text-red-950';
    if (rate < 80) return 'bg-gradient-to-br from-amber-500/10 to-orange-500/20 border-amber-300 text-amber-950';
    if (rate < 88) return 'bg-gradient-to-br from-yellow-500/10 to-amber-500/20 border-yellow-300 text-yellow-950';
    return 'bg-gradient-to-br from-emerald-500/10 to-teal-500/20 border-emerald-300 text-emerald-950';
  };

  const getMatrixIntensity = (count: number) => {
    if (count >= 20) return 'bg-rose-600 text-white font-bold';
    if (count >= 15) return 'bg-rose-500 text-white font-semibold';
    if (count >= 10) return 'bg-amber-500 text-white font-semibold';
    if (count >= 5) return 'bg-amber-200 text-amber-950 font-medium';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col h-full">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              High-Risk Enforcement Heat Map &amp; Vulnerability Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geographic retail clusters &amp; product categories displaying elevated LMPC non-compliance
          </p>
        </div>

        {/* View Switcher: Regional Zones vs Category Matrix */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/70 self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('zones')}
            className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'zones'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Enforcement Zones</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'matrix'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Category Failure Matrix</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Enforcement Zones Thermal Grid */}
      {viewMode === 'zones' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
          
          {/* Left 2 Cols: Zones Grid Map */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {zones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden group ${getRiskBg(
                    zone.complianceRate
                  )} ${isSelected ? 'ring-2 ring-indigo-600 shadow-md scale-[1.01]' : 'hover:shadow-sm'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        {zone.code}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-indigo-700 transition-colors">
                        {zone.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{zone.district}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(zone.riskLevel)}`}>
                      {zone.riskLevel} RISK
                    </span>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Scans</span>
                      <strong className="font-bold text-slate-800">{zone.scansCount}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Violations</span>
                      <strong className="font-bold text-rose-600">{zone.violationsCount}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Compliance</span>
                      <strong className={`font-bold ${zone.complianceRate >= 80 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {zone.complianceRate}%
                      </strong>
                    </div>
                  </div>

                  {/* Primary violation highlight */}
                  <div className="mt-2 text-[10px] text-slate-600 truncate flex items-center gap-1">
                    <span className="font-semibold text-slate-700">Top Issue:</span>
                    <span className="truncate text-rose-700 font-medium">{zone.primaryViolation}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Col: Selected Zone Drilldown Panel */}
          {selectedZone && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Zone Intelligence Brief</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(selectedZone.riskLevel)}`}>
                    {selectedZone.riskLevel}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{selectedZone.name}</h3>
                    <p className="text-slate-500 text-[11px]">{selectedZone.district}</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Field Inspectors:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        {selectedZone.activeInspectors} Officers Deployed
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Non-Compliance Rate:</span>
                      <span className="font-bold text-rose-600">
                        {(100 - selectedZone.complianceRate).toFixed(1)}% Failure
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Primary Rule Infraction:</span>
                      <span className="font-bold text-slate-800 text-right">{selectedZone.primaryViolation}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 text-[11px] leading-relaxed">
                    <strong>Enforcement Recommendation:</strong> Deploy dedicated inspection squads under Rule 32 for surprise retail package audits across this sector.
                  </div>
                </div>
              </div>

              {onSelectZoneFilter && (
                <button
                  onClick={() => onSelectZoneFilter(selectedZone.name)}
                  className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <span>Filter Inspection Logs to this Zone</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* Mode 2: Category x Violation Matrix Heatmap */}
      {viewMode === 'matrix' && (
        <div className="pt-4 overflow-x-auto">
          <div className="min-w-[620px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Product Category</th>
                  <th className="py-2.5 px-2 text-center">MRP Format<br/><span className="text-[10px] font-normal text-slate-500">Rule 6(1)(e)</span></th>
                  <th className="py-2.5 px-2 text-center">Font Height<br/><span className="text-[10px] font-normal text-slate-500">Rule 7</span></th>
                  <th className="py-2.5 px-2 text-center">Net Quantity<br/><span className="text-[10px] font-normal text-slate-500">Rule 6(1)(c)</span></th>
                  <th className="py-2.5 px-2 text-center">Packing Date<br/><span className="text-[10px] font-normal text-slate-500">Rule 6(1)(d)</span></th>
                  <th className="py-2.5 px-2 text-center">Consumer Care<br/><span className="text-[10px] font-normal text-slate-500">Rule 6(1)(n)</span></th>
                  <th className="py-2.5 px-2 text-center">Origin / USP<br/><span className="text-[10px] font-normal text-slate-500">Rule 6(10/11)</span></th>
                  <th className="py-2.5 px-3 text-right">Total Failures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CATEGORY_RULE_MATRIX.map((row) => (
                  <tr 
                    key={row.category} 
                    onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(row.category)}
                    className="hover:bg-indigo-50/60 cursor-pointer transition-colors group"
                    title={`Click to filter inspection logs by ${row.category}`}
                  >
                    <td className="py-2 px-3 font-semibold text-slate-900 group-hover:text-indigo-600">
                      {row.category}
                    </td>
                    <td className="p-1.5 text-center">
                      <span className={`inline-block w-9 py-1 rounded text-center ${getMatrixIntensity(row.mrp)}`}>
                        {row.mrp}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className={`inline-block w-9 py-1 rounded text-center ${getMatrixIntensity(row.fontSize)}`}>
                        {row.fontSize}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className={`inline-block w-9 py-1 rounded text-center ${getMatrixIntensity(row.netQty)}`}>
                        {row.netQty}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className={`inline-block w-9 py-1 rounded text-center ${getMatrixIntensity(row.date)}`}>
                        {row.date}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className={`inline-block w-9 py-1 rounded text-center ${getMatrixIntensity(row.consumerCare)}`}>
                        {row.consumerCare}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className={`inline-block w-9 py-1 rounded text-center ${getMatrixIntensity(row.origin)}`}>
                        {row.origin}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-black text-slate-900 font-mono">
                      {row.totalFailures}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Matrix Color Scale Legend */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Failure Density Scale:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-3 bg-slate-100 border border-slate-200 rounded-xs"></span>
                <span>&lt; 5 (Low)</span>
                <span className="w-4 h-3 bg-amber-200 rounded-xs ml-2"></span>
                <span>5-9</span>
                <span className="w-4 h-3 bg-amber-500 rounded-xs ml-2"></span>
                <span>10-14</span>
                <span className="w-4 h-3 bg-rose-500 rounded-xs ml-2"></span>
                <span>15-19</span>
                <span className="w-4 h-3 bg-rose-600 rounded-xs ml-2"></span>
                <span>20+ (Critical)</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
