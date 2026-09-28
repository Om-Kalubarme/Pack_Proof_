import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { TimeFilter } from '../../types/compliance';

interface ComplianceTrendChartProps {
  timeFilter: TimeFilter;
}

export const ComplianceTrendChart: React.FC<ComplianceTrendChartProps> = ({ timeFilter }) => {
  // Dynamic time-series datasets based on selected time filter
  const getTrendData = () => {
    switch (timeFilter) {
      case 'today':
        return [
          { time: '08:00', scans: 14, violations: 3, complianceRate: 78.6 },
          { time: '09:00', scans: 28, violations: 5, complianceRate: 82.1 },
          { time: '10:00', scans: 45, violations: 12, complianceRate: 73.3 },
          { time: '11:00', scans: 62, violations: 14, complianceRate: 77.4 },
          { time: '12:00', scans: 38, violations: 6, complianceRate: 84.2 },
          { time: '13:00', scans: 22, violations: 4, complianceRate: 81.8 },
          { time: '14:00', scans: 50, violations: 9, complianceRate: 82.0 },
          { time: '15:00', scans: 74, violations: 18, complianceRate: 75.7 },
          { time: '16:00', scans: 58, violations: 8, complianceRate: 86.2 },
          { time: '17:00', scans: 42, violations: 7, complianceRate: 83.3 }
        ];
      case 'weekly':
        return [
          { time: '10 Sep (Wed)', scans: 280, violations: 64, complianceRate: 77.1 },
          { time: '11 Sep (Thu)', scans: 340, violations: 82, complianceRate: 75.9 },
          { time: '12 Sep (Fri)', scans: 410, violations: 78, complianceRate: 81.0 },
          { time: '13 Sep (Sat)', scans: 390, violations: 91, complianceRate: 76.7 },
          { time: '14 Sep (Sun)', scans: 180, violations: 32, complianceRate: 82.2 },
          { time: '15 Sep (Mon)', scans: 460, violations: 88, complianceRate: 80.9 },
          { time: '16 Sep (Tue)', scans: 433, violations: 86, complianceRate: 80.1 }
        ];
      case 'monthly':
      default:
        return [
          { time: 'Week 1 (Aug 18-24)', scans: 1840, violations: 420, complianceRate: 77.2 },
          { time: 'Week 2 (Aug 25-31)', scans: 2150, violations: 460, complianceRate: 78.6 },
          { time: 'Week 3 (Sep 01-07)', scans: 2420, violations: 490, complianceRate: 79.8 },
          { time: 'Week 4 (Sep 08-16)', scans: 2493, violations: 476, complianceRate: 80.9 }
        ];
    }
  };

  const trendData = getTrendData();

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              Compliance Rate &amp; Enforcement Volume Trend
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Correlation between optical scan volume and percentage compliance
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/30 border border-indigo-500"></span>
            <span className="text-[11px]">Scans Volume</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-1 bg-emerald-500 rounded-full"></span>
            <span className="text-[11px] font-semibold text-emerald-700">Compliance %</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-0.5 bg-rose-400 border-b border-dashed"></span>
            <span className="text-[10px]">Statutory Benchmark (90%)</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[260px] my-2 pt-2">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            {/* Left Y Axis: Scans Volume */}
            <YAxis 
              yAxisId="left" 
              orientation="left"
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
            />
            {/* Right Y Axis: Compliance % */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[60, 100]} 
              tick={{ fontSize: 11, fill: '#10b981' }} 
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 space-y-1">
                      <div className="font-bold text-slate-200">{label}</div>
                      <div className="pt-1.5 border-t border-slate-800 space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Total Scanned:</span>
                          <span className="font-bold text-indigo-300">{payload[0]?.value} units</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Violations:</span>
                          <span className="font-bold text-rose-400">{payload[0]?.payload.violations} units</span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                          <span className="text-emerald-400 font-semibold">Compliance Rate:</span>
                          <span className="font-black text-emerald-400">{payload[1]?.value}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              yAxisId="right" 
              y={90} 
              stroke="#f43f5e" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="scans"
              name="Scans Volume"
              fill="url(#scansGradient)"
              stroke="#6366f1"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="complianceRate"
              name="Compliance Rate (%)"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#047857' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Target Statutory Compliance: <strong className="text-slate-700 font-bold">&gt;= 90%</strong></span>
        <span className="text-emerald-600 font-semibold flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+3.7% compliance uplift in current period</span>
        </span>
      </div>
    </div>
  );
};
