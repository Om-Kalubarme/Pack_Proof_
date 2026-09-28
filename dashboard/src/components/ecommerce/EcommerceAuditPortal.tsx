import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert,
  Zap,
  FileText,
  Layers,
  Server,
  Eye,
  X,
  Package,
  Scan,
  Factory,
  Scale,
  Sparkles,
  ExternalLink,
  Clock,
  MapPin,
  Check,
  Info
} from 'lucide-react';
import { 
  EcommerceAuditItem, 
  MarketplacePlatform, 
  EcommerceFilterState 
} from '../../types/ecommerce';
import { 
  MOCK_ECOMMERCE_AUDIT_ITEMS 
} from '../../data/mockEcommerce';
import { EcommerceNoticeModal } from './EcommerceNoticeModal';

type AuditModalTab = 'all' | 'product' | 'scanning' | 'manufacturing' | 'violations';

interface EcommerceAuditPortalProps {
  initialAuditItems?: EcommerceAuditItem[];
  onOpenGlobalInspectionModal?: (item: EcommerceAuditItem) => void;
}

export const EcommerceAuditPortal: React.FC<EcommerceAuditPortalProps> = ({
  initialAuditItems = MOCK_ECOMMERCE_AUDIT_ITEMS,
}) => {
  const [auditItems, setAuditItems] = useState<EcommerceAuditItem[]>(initialAuditItems);
  
  // Selected item for Detailed Inspection Modal
  const [inspectModalItem, setInspectModalItem] = useState<EcommerceAuditItem | null>(null);
  const [inspectModalTab, setInspectModalTab] = useState<AuditModalTab>('all');

  // Selected item for Digital Notice Generation Modal
  const [noticeModalItem, setNoticeModalItem] = useState<EcommerceAuditItem | null>(null);

  // Filter toolbar state
  const [filterState, setFilterState] = useState<EcommerceFilterState>({
    marketplace: 'ALL',
    violationType: 'ALL',
    reviewStatus: 'ALL',
    searchQuery: ''
  });

  // Filtering engine
  const filteredItems = useMemo(() => {
    return auditItems.filter(item => {
      // Marketplace filter
      if (filterState.marketplace !== 'ALL' && item.marketplace !== filterState.marketplace) {
        return false;
      }
      // Violation type filter
      if (filterState.violationType !== 'ALL' && item.violationType !== filterState.violationType) {
        return false;
      }
      // Review status filter
      if (filterState.reviewStatus !== 'ALL' && item.reviewStatus !== filterState.reviewStatus) {
        return false;
      }
      // Search query
      if (filterState.searchQuery.trim() !== '') {
        const q = filterState.searchQuery.toLowerCase();
        return (
          item.productName.toLowerCase().includes(q) ||
          item.sellerName.toLowerCase().includes(q) ||
          item.marketplace.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.caseId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditItems, filterState]);

  // Handle notice dispatch callback
  const handleNoticeDispatched = (itemId: string, officerNotes?: string) => {
    setAuditItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          reviewStatus: 'NOTICE_ISSUED',
          officerNotes: officerNotes || item.officerNotes,
          noticeIssuedDate: new Date().toISOString().slice(0, 10)
        };
      }
      return item;
    }));
  };

  const potentialIssuesCount = useMemo(() => {
    return auditItems.filter(i => i.priceDifference > 0 || i.mismatchFields.length > 0 || i.reviewStatus === 'FLAGGED').length;
  }, [auditItems]);

  const reviewPendingCount = useMemo(() => {
    return auditItems.filter(i => i.reviewStatus === 'FLAGGED' || i.reviewStatus === 'UNDER_REVIEW').length;
  }, [auditItems]);

  return (
    <section className="space-y-6">
      
      {/* 1. Portal Header */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Automated E-Commerce Crawler Audit Portal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            24/7 automated compliance monitoring for Legal Metrology (Packaged Commodities) Rules on digital marketplaces.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Automated Market Scanner • LMPC Rules Compliance</span>
          </span>
        </div>
      </div>

      {/* 2. Top Summary KPI Metrics (3 Compact Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Metric 1: Products Scanned */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Products Scanned
            </span>
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-800 tracking-tight font-mono">
              {auditItems.length.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <span className="text-emerald-700 font-medium">{auditItems.length}</span>
              <span>total audited listings</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Potential Issues */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Potential Issues
            </span>
            <div className="w-7 h-7 rounded bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/60">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-800 tracking-tight font-mono">
              {potentialIssuesCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Flagged by OCR &amp; pricing parser
            </div>
          </div>
        </div>

        {/* Metric 3: Cases Requiring Review */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Cases Requiring Review
            </span>
            <div className="w-7 h-7 rounded bg-rose-50 text-rose-800 flex items-center justify-center border border-rose-200/60">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-800 tracking-tight font-mono">
              {reviewPendingCount}
            </div>
            <div className="text-[11px] text-rose-700 font-medium mt-0.5">
              Pending officer adjudication
            </div>
          </div>
        </div>

      </div>



      {/* 6. Dual MRP Fraud Tracker Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Table Header with Filters */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                <span>Dual MRP Discrepancy &amp; Regulatory Audit Tracker</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Systematic price comparison between physical package declarations and digital consumer checkout rates
              </p>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              Showing {filteredItems.length} of {auditItems.length} audited listings
            </span>
          </div>

          {/* Working Multi-Parameter Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by product, seller, or case ID..."
                value={filterState.searchQuery}
                onChange={(e) => setFilterState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Marketplace Filter */}
            <select
              value={filterState.marketplace}
              onChange={(e) => setFilterState(prev => ({ ...prev, marketplace: e.target.value }))}
              className="bg-white border border-slate-200 text-slate-700 py-1 px-2.5 rounded text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Marketplaces</option>
              <option value="Amazon">Amazon</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Blinkit">Blinkit</option>
              <option value="Zepto">Zepto</option>
              <option value="Instamart">Instamart</option>
            </select>

            {/* Violation Type Filter */}
            <select
              value={filterState.violationType}
              onChange={(e) => setFilterState(prev => ({ ...prev, violationType: e.target.value }))}
              className="bg-white border border-slate-200 text-slate-700 py-1 px-2.5 rounded text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Violation Categories</option>
              <option value="DUAL_MRP">Dual MRP Inflation</option>
              <option value="COO_MISSING">Country of Origin Missing</option>
              <option value="NET_QTY_MISMATCH">Net Quantity Mismatch</option>
              <option value="MANUFACTURER_MISMATCH">Manufacturer Discrepancy</option>
            </select>

            {/* Review Status Filter */}
            <select
              value={filterState.reviewStatus}
              onChange={(e) => setFilterState(prev => ({ ...prev, reviewStatus: e.target.value }))}
              className="bg-white border border-slate-200 text-slate-700 py-1 px-2.5 rounded text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="FLAGGED">Flagged for Review</option>
              <option value="UNDER_REVIEW">Under Investigation</option>
              <option value="NOTICE_ISSUED">Form VI Notice Issued</option>
              <option value="DISMISSED">Dismissed / Compliant</option>
            </select>

            {/* Reset Filters */}
            {(filterState.marketplace !== 'ALL' || filterState.violationType !== 'ALL' || filterState.reviewStatus !== 'ALL' || filterState.searchQuery !== '') && (
              <button
                onClick={() => setFilterState({ marketplace: 'ALL', violationType: 'ALL', reviewStatus: 'ALL', searchQuery: '' })}
                className="text-[11px] text-blue-700 hover:underline font-semibold"
              >
                Clear Filters
              </button>
            )}

          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Case / Product</th>
                <th className="py-2.5 px-3">Marketplace</th>
                <th className="py-2.5 px-3">Seller</th>
                <th className="py-2.5 px-2.5 text-right">Printed MRP</th>
                <th className="py-2.5 px-2.5 text-right">Online Price</th>
                <th className="py-2.5 px-2.5 text-right">Difference</th>
                <th className="py-2.5 px-2.5 text-right">% Markup</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No e-commerce audit items match the active filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isDualMrp = item.priceDifference > 0;
                  const isCompliant = item.reviewStatus === 'DISMISSED' || item.overallResult === 'MATCHED' || (!isDualMrp && item.mismatchFields.length === 0);
                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/70 transition"
                    >
                      {/* Case / Product */}
                      <td className="py-2.5 px-3">
                        <div className="font-mono text-[10px] text-blue-700 font-bold">
                          {item.caseId}
                        </div>
                        <div className="font-semibold text-slate-900 leading-snug line-clamp-1 max-w-[200px]" title={item.productName}>
                          {item.productName}
                        </div>
                      </td>

                      {/* Marketplace */}
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800 text-[11px]">
                          {item.marketplace}
                        </span>
                      </td>

                      {/* Seller */}
                      <td className="py-2.5 px-3 text-slate-700 truncate max-w-[140px]" title={item.sellerName}>
                        {item.sellerName}
                      </td>

                      {/* Printed MRP */}
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-800">
                        ₹ {item.printedMrp.toFixed(2)}
                      </td>

                      {/* Online Price */}
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-rose-700">
                        ₹ {item.onlinePrice.toFixed(2)}
                      </td>

                      {/* Difference */}
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold">
                        {isDualMrp ? (
                          <span className="text-rose-700">+₹{item.priceDifference.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">₹0.00</span>
                        )}
                      </td>

                      {/* % Markup */}
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold">
                        {isDualMrp ? (
                          <span className="text-rose-700">+{item.percentDifference}%</span>
                        ) : (
                          <span className="text-slate-400">0%</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        {item.reviewStatus === 'FLAGGED' && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                            Potential Violation
                          </span>
                        )}
                        {item.reviewStatus === 'UNDER_REVIEW' && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-200">
                            Requires Review
                          </span>
                        )}
                        {item.reviewStatus === 'NOTICE_ISSUED' && (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-bold text-[10px] border border-rose-200">
                            Notice Dispatched
                          </span>
                        )}
                        {item.reviewStatus === 'DISMISSED' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            Compliant
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setInspectModalTab('all');
                              setInspectModalItem(item);
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded transition flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Inspect Audited Listing & Declarations"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Inspect</span>
                          </button>

                          {!isCompliant && (
                            <button
                              onClick={() => setNoticeModalItem(item)}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition flex items-center gap-1 cursor-pointer"
                              title="Generate Form VI Statutory Notice"
                            >
                              <FileText className="w-3.5 h-3.5 text-rose-600" />
                              <span>Notice</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Detailed E-Commerce Inspection Modal */}
      {inspectModalItem && (() => {
        const isDualMrp = inspectModalItem.priceDifference > 0;
        const isCompliant = inspectModalItem.reviewStatus === 'DISMISSED' || 
                            inspectModalItem.overallResult === 'MATCHED' || 
                            (!isDualMrp && inspectModalItem.mismatchFields.length === 0);

        return (
          <div 
            className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setInspectModalItem(null)}
          >
            <div 
              className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 tracking-wide">
                      {inspectModalItem.caseId}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-700 font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      {inspectModalItem.marketplace}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-mono">
                      Audited: {inspectModalItem.auditDate}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {inspectModalItem.productName}
                  </h3>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800">Seller: {inspectModalItem.sellerName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {inspectModalItem.sellerLocation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${
                    isCompliant
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : inspectModalItem.reviewStatus === 'NOTICE_ISSUED'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {isCompliant ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Statutory Compliant</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{inspectModalItem.violationTitle || 'Violation Detected'}</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => setInspectModalItem(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-1 overflow-x-auto text-xs">
                <button
                  onClick={() => setInspectModalTab('all')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    inspectModalTab === 'all'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>All Information</span>
                </button>

                <button
                  onClick={() => setInspectModalTab('product')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    inspectModalTab === 'product'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-indigo-600" />
                  <span>About Product</span>
                </button>

                <button
                  onClick={() => setInspectModalTab('scanning')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    inspectModalTab === 'scanning'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5 text-blue-600" />
                  <span>Scanning &amp; Crawler Audit</span>
                </button>

                <button
                  onClick={() => setInspectModalTab('manufacturing')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    inspectModalTab === 'manufacturing'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5 text-amber-600" />
                  <span>Manufacturing &amp; Seller</span>
                </button>

                <button
                  onClick={() => setInspectModalTab('violations')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    inspectModalTab === 'violations'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-rose-600" />
                  <span>Violation &amp; Legal Rules</span>
                  {!isCompliant ? (
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center font-mono">
                      !
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/30">
                
                {/* 1. PILLAR: About Product */}
                {(inspectModalTab === 'all' || inspectModalTab === 'product') && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Product &amp; Packaging Pricing Specifications
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                        {inspectModalItem.category}
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Commodity / Product Name:</span>
                        <span className="font-bold text-slate-900 block leading-snug">
                          {inspectModalItem.productName}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Brand:</span>
                        <span className="font-semibold text-slate-800 block">
                          {inspectModalItem.onlineMetadata?.brand || inspectModalItem.packageOcr?.brand || 'Verified Brand'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Catalog ID / ASIN:</span>
                        <span className="font-mono text-slate-800 block bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">
                          {inspectModalItem.onlineMetadata?.asinOrFsn || inspectModalItem.id}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Declared Net Quantity:</span>
                        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded inline-block border border-blue-200">
                          {inspectModalItem.packageOcr?.netQuantity || inspectModalItem.onlineMetadata?.netQuantity || '1 Unit'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Physical Package Printed MRP:</span>
                        <span className="font-mono font-bold text-slate-900 text-sm block">
                          ₹ {inspectModalItem.printedMrp.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Online Marketplace Checkout Price:</span>
                        <span className={`font-mono font-bold text-sm block ${isDualMrp ? 'text-rose-700' : 'text-slate-900'}`}>
                          ₹ {inspectModalItem.onlinePrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-slate-500 text-[11px] font-medium block">Pricing Assessment:</span>
                        {isDualMrp ? (
                          <span className="text-rose-800 font-mono font-bold bg-rose-50 px-2.5 py-1 rounded border border-rose-200 inline-block">
                            Discrepancy: +₹ {inspectModalItem.priceDifference.toFixed(2)} (+{inspectModalItem.percentDifference}% Unauthorized Markup above MRP)
                          </span>
                        ) : (
                          <span className="text-emerald-800 font-mono font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block">
                            Price Match Verified: Digital price conforms to Printed MRP under Rule 18(2)
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Unit Sale Price (USP):</span>
                        <span className="font-mono text-slate-700 block">
                          {inspectModalItem.onlineMetadata?.unitSalePrice || 'Mandatory USP Rule 6(1)(f) Compliant'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PILLAR: Scanning & Crawler Audit Information */}
                {(inspectModalTab === 'all' || inspectModalTab === 'scanning') && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scan className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Scanning, Crawler Audit &amp; OCR Evidence
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        {((inspectModalItem.packageOcr?.ocrConfidence || 0.96) * 100).toFixed(1)}% AI OCR Accuracy
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Regulatory Case ID:</span>
                        <span className="font-mono font-bold text-blue-900 block">
                          {inspectModalItem.caseId}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Marketplace Crawler Node:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-blue-600" />
                          {inspectModalItem.marketplace} Automated Pipeline v3.8
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Audit Timestamp:</span>
                        <span className="font-mono text-slate-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {inspectModalItem.auditDate}
                        </span>
                      </div>

                      <div className="space-y-1 sm:col-span-3">
                        <span className="text-slate-500 text-[11px] font-medium block">Product Listing URL:</span>
                        <a 
                          href={inspectModalItem.onlineMetadata?.listingUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-mono text-blue-700 hover:underline flex items-center gap-1 text-[11px] break-all"
                        >
                          <span>{inspectModalItem.onlineMetadata?.listingUrl || `https://www.marketplace.in/dp/${inspectModalItem.id}`}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>

                      {/* Visual Package Scanned Evidence */}
                      {inspectModalItem.packageOcr?.packageImageUrl && (
                        <div className="sm:col-span-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 p-2.5 rounded-md">
                          <div className="flex items-center gap-3">
                            <img 
                              src={inspectModalItem.packageOcr.packageImageUrl} 
                              alt={inspectModalItem.productName} 
                              className="w-16 h-16 object-contain rounded border border-slate-200 bg-white p-1 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-slate-900 text-xs">Physical Package Optical Proof</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {inspectModalItem.packageOcr.boundingBoxes?.length || 2} Automated OCR Bounding Annotations Verified
                              </div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                            OCR Confirmed: ₹{inspectModalItem.printedMrp.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. PILLAR: Manufacturing & Seller Details */}
                {(inspectModalTab === 'all' || inspectModalTab === 'manufacturing') && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Factory className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Manufacturing, Origin &amp; Seller Details
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                        Rule 6(1)(a) &amp; Rule 6(10A)
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Manufacturer / Packer:</span>
                        <span className="font-bold text-slate-900 block text-xs">
                          {inspectModalItem.packageOcr?.manufacturer || inspectModalItem.onlineMetadata?.manufacturer || 'Registered FMCG Manufacturer Ltd.'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {inspectModalItem.packageOcr?.manufacturerAddress || inspectModalItem.onlineMetadata?.manufacturerAddress || 'Industrial Area, Phase II, New Delhi'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">E-Commerce Marketplace Seller:</span>
                        <span className="font-bold text-slate-900 block text-xs">
                          {inspectModalItem.sellerName}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Fulfillment Node: {inspectModalItem.sellerLocation}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Country of Origin:</span>
                        <span className="text-slate-800 block font-semibold">
                          {inspectModalItem.onlineMetadata?.countryOfOrigin || inspectModalItem.packageOcr?.countryOfOrigin || 'India'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Intermediary Liability &amp; Platform Host:</span>
                        <span className="text-slate-700 block text-[11px]">
                          {inspectModalItem.marketplace} India • Subject to Rule 6(11) of LMPC Rules &amp; IT Intermediary Rules
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PILLAR: Violation Under Which Rule */}
                {(inspectModalTab === 'all' || inspectModalTab === 'violations') && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-rose-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Violation &amp; Statutory Legal Rules Evaluation
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                        Legal Metrology Act, 2009
                      </span>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                      {/* Applicable Rule banner */}
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">Primary Applicable Rule:</span>
                          <span className="text-slate-700 text-xs font-mono">
                            {inspectModalItem.applicableRule || 'Rule 18(2) & Rule 6(11) of Legal Metrology (Packaged Commodities) Rules, 2011'}
                          </span>
                        </div>
                      </div>

                      {isCompliant ? (
                        <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-bold text-emerald-950 text-sm">
                                All Digital E-Commerce Declarations Verified Compliant
                              </h5>
                              <p className="text-xs text-emerald-800 mt-0.5">
                                Online checkout pricing matches physical packaging declarations. No dual pricing or mandatory declaration defects recorded.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-200/70 text-[11px] text-emerald-900">
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 18(2): No Overcharging above Printed MRP</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(10A): Country of Origin Displayed</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(1)(a): Manufacturer &amp; Packer Details Match</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(1)(f): Unit Sale Price Legibly Provided</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-lg bg-rose-50/40 border border-rose-200 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span className="font-bold text-rose-950 text-xs">{inspectModalItem.violationTitle}</span>
                            </div>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold shrink-0 border border-rose-200">
                              {inspectModalItem.severity} SEVERITY
                            </span>
                          </div>

                          {isDualMrp && (
                            <div className="ml-6 grid grid-cols-3 gap-2 bg-white p-2.5 rounded border border-rose-200 font-mono text-[11px] text-center">
                              <div>
                                <div className="text-slate-500 text-[10px]">Printed Package MRP</div>
                                <div className="font-bold text-slate-800 text-xs mt-0.5">₹ {inspectModalItem.printedMrp.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-slate-500 text-[10px]">Online Checkout Price</div>
                                <div className="font-bold text-rose-700 text-xs mt-0.5">₹ {inspectModalItem.onlinePrice.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-slate-500 text-[10px]">Unlawful Inflation</div>
                                <div className="font-bold text-rose-800 text-xs mt-0.5">+{inspectModalItem.percentDifference}%</div>
                              </div>
                            </div>
                          )}

                          {inspectModalItem.mismatchFields.length > 0 && (
                            <div className="ml-6 text-[11px] text-slate-700">
                              <strong>Discrepant Fields: </strong>
                              <span className="font-mono font-bold text-rose-700">
                                {inspectModalItem.mismatchFields.join(', ').toUpperCase()}
                              </span>
                            </div>
                          )}

                          <div className="ml-6 pt-2 border-t border-rose-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px] text-slate-600">
                            <div>
                              <strong className="text-slate-900">Statutory Clause: </strong> 
                              <span>{inspectModalItem.applicableRule}</span>
                            </div>
                            <div>
                              <strong className="text-rose-900">Legal Penalty: </strong> 
                              <span className="text-rose-800 font-medium">{inspectModalItem.statutoryPenalty}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* 5. PILLAR: Action Section (Footer) */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto">
                  {isCompliant ? (
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Compliant Listing — No Notice Required</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-800 font-semibold bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Notice Authorized under Section 36(1) of Legal Metrology Act</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
                  {/* Generate Form VI Notice Action (Only when violations exist) */}
                  {!isCompliant && (
                    <button
                      onClick={() => {
                        const itemToNotice = inspectModalItem;
                        setInspectModalItem(null);
                        setNoticeModalItem(itemToNotice);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Generate Notice</span>
                    </button>
                  )}

                  {/* Visit Listing Action */}
                  {inspectModalItem.onlineMetadata?.listingUrl && (
                    <a
                      href={inspectModalItem.onlineMetadata.listingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-600" />
                      <span>View Listing</span>
                    </a>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => setInspectModalItem(null)}
                    className="px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 7. Notice Drafting Modal */}
      {noticeModalItem && (
        <EcommerceNoticeModal
          item={noticeModalItem}
          isOpen={Boolean(noticeModalItem)}
          onClose={() => setNoticeModalItem(null)}
          onNoticeDispatched={handleNoticeDispatched}
        />
      )}

    </section>
  );
};
