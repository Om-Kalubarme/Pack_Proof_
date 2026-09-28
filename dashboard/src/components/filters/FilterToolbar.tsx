import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  ArrowUpDown, 
  X, 
  Filter, 
  RotateCcw 
} from 'lucide-react';
import { FilterState, TimeFilter } from '../../types/compliance';

interface FilterToolbarProps {
  filterState: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categories: string[];
  inspectors?: string[];
  totalFilteredCount: number;
  totalAllCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filterState,
  onFilterChange,
  onResetFilters,
  categories,
  inspectors = [],
  totalFilteredCount,
  totalAllCount
}) => {
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customStart, setCustomStart] = useState(filterState.startDate || '2026-09-01');
  const [customEnd, setCustomEnd] = useState(filterState.endDate || '2026-09-16');

  const timeOptions: { id: TimeFilter; label: string; badge: string }[] = [
    { id: 'today', label: 'Today', badge: '16 Sep' },
    { id: 'weekly', label: 'Weekly', badge: 'Last 7d' },
    { id: 'monthly', label: 'Monthly', badge: 'Last 30d' },
    { id: 'custom', label: 'Custom Range', badge: 'Select' }
  ];

  const handleApplyCustomDates = () => {
    onFilterChange({
      timeFilter: 'custom',
      startDate: customStart,
      endDate: customEnd
    });
    setShowCustomDateModal(false);
  };

  const hasActiveFilters = 
    filterState.timeFilter !== 'monthly' ||
    filterState.category !== 'ALL' ||
    filterState.severity !== 'ALL' ||
    filterState.status !== 'ALL' ||
    (filterState.inspector && filterState.inspector !== 'ALL') ||
    filterState.searchQuery !== '';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 space-y-4">
      
      {/* Top row: Time Filter Pills & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        
        {/* Time Toggles */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80 self-start">
          {timeOptions.map((opt) => {
            const isActive = filterState.timeFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  if (opt.id === 'custom') {
                    setShowCustomDateModal(true);
                  } else {
                    onFilterChange({ timeFilter: opt.id });
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-400'
                }`}>
                  {opt.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by product name, brand, case ID, retailer..."
            className="block w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Granular Filters and Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          {/* Product Category Filter */}
          <select
            value={filterState.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Product Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Compliance Status Filter */}
          <select
            value={filterState.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Inspection Statuses</option>
            <option value="FAIL">Violations Only (Fail)</option>
            <option value="PASS">Compliant Only (Pass)</option>
            <option value="UNDER_REVIEW">Under Secondary Review</option>
            <option value="NOTICE_ISSUED">Form VI Notice Issued</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filterState.severity}
            onChange={(e) => onFilterChange({ severity: e.target.value })}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="COMPLIANT">Pass / Compliant</option>
          </select>

          {/* Officer / Inspector Filter */}
          <select
            value={filterState.inspector || 'ALL'}
            onChange={(e) => onFilterChange({ inspector: e.target.value })}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Officers ({totalAllCount} Cases)</option>
            {inspectors.map((ins) => (
              <option key={ins} value={ins}>
                {ins}
              </option>
            ))}
          </select>

          {/* Reset button if filters active */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-md font-medium transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort by:</span>
          </div>
          <select
            value={filterState.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="date_desc">Date (Newest First)</option>
            <option value="date_asc">Date (Oldest First)</option>
            <option value="severity_desc">Severity (Critical First)</option>
            <option value="violations_desc">Violation Count</option>
            <option value="product_asc">Product Name (A-Z)</option>
          </select>

          {/* Results Counter */}
          <div className="pl-2 border-l border-slate-200 text-slate-500 text-xs font-mono">
            Showing <strong className="text-slate-800 font-bold">{totalFilteredCount}</strong> of {totalAllCount}
          </div>
        </div>

      </div>

      {/* Custom Date Range Modal Dialog */}
      {showCustomDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Select Custom Inspection Range</h3>
              </div>
              <button 
                onClick={() => setShowCustomDateModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Date:
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowCustomDateModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomDates}
                className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-sm"
              >
                Apply Date Filter
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
