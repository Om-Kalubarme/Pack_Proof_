import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { VIOLATION_DISTRIBUTION_DATA } from '../../data/mockInspections';

interface ViolationDonutChartProps {
  data?: typeof VIOLATION_DISTRIBUTION_DATA;
}

export const ViolationDonutChart: React.FC<ViolationDonutChartProps> = ({ 
  data = VIOLATION_DISTRIBUTION_DATA 
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [popupSide, setPopupSide] = useState<'left' | 'right'>('right');

  const totalViolations = data.reduce((acc, curr) => acc + curr.count, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupSide(e.clientX - rect.left > rect.width / 2 ? 'left' : 'right');
  };

  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col h-full">
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              Violation Distribution by Legal Metrology Rule
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Breakdown of statutory infractions flagged across current inspection cycle
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
          Total: {totalViolations} infractions
        </span>
      </div>

      <div 
        className="relative flex-1 min-h-[260px] flex items-center justify-center my-2"
        onMouseMove={handleMouseMove}
      >
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="count"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-opacity duration-200 cursor-pointer hover:opacity-85"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Side Hover Popup (Positioned at side, not covering pie chart) */}
        {activeItem && (
          <div 
            className={`absolute top-2 ${popupSide === 'left' ? 'left-2' : 'right-2'} z-30 pointer-events-none transition-all duration-150`}
          >
            <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700 max-w-[210px] animate-in fade-in zoom-in-95">
              <div className="font-bold flex items-center gap-1.5 text-slate-100">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeItem.color }} />
                <span className="truncate">{activeItem.name}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{activeItem.rule}</div>
              <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex justify-between gap-3 font-mono text-[11px]">
                <span className="text-slate-300">Infractions:</span>
                <span className="font-bold text-emerald-400">{activeItem.count} ({activeItem.percentage}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Center overlay in Donut */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          {activeItem ? (
            <div className="animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                {activeItem.rule}
              </span>
              <span className="text-2xl font-black text-slate-900 leading-tight block">
                {activeItem.percentage}%
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">
                {activeItem.count} Cases
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Leading Infraction
              </span>
              <span className="text-xl font-black text-rose-600 leading-tight block">
                27%
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">
                MRP Non-Compliance
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Rule Pill list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-slate-600">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: item.color }} 
            />
            <span className="truncate font-medium">{item.name}</span>
            <span className="font-mono text-slate-400 ml-auto">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
