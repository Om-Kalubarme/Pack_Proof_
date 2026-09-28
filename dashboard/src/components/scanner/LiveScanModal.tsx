import React, { useState } from 'react';
import { 
  X, 
  ScanLine, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw
} from 'lucide-react';
import { InspectionRecord, CommodityCategory } from '../../types/compliance';
import { createPackageSvg } from '../../data/mockInspections';

interface LiveScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewScanCompleted: (newRecord: InspectionRecord) => void;
}

interface ScanPreset {
  title: string;
  category: CommodityCategory;
  description: string;
  expectedStatus: 'PASS' | 'FAIL';
  previewColor: [string, string];
  productName: string;
  brand: string;
  netQty: string;
  mrp: string;
  batch: string;
  violations: any[];
  boundingBoxes: any[];
}

const PRESET_PACKAGES: ScanPreset[] = [
  {
    title: 'Snack Pouch - Tampered Price Sticker',
    category: 'Snacks & Confectionery',
    description: 'Adhesive retail sticker covering original printed MRP with inflated price.',
    expectedStatus: 'FAIL',
    previewColor: ['#ef4444', '#b91c1c'],
    productName: 'Chilli Crunch Potato Crisps 85g',
    brand: 'ChilliCrunch Agro',
    netQty: '85 g',
    mrp: '₹ 40.00 [STICKERED]',
    batch: 'Mfg: 09/2026 • CC-99',
    violations: [
      {
        code: 'RULE_6_1_E_MRP',
        rule: 'Rule 6(1)(e) & 18(2)',
        title: 'Tampered / Over-Stickered Maximum Retail Price',
        severity: 'CRITICAL',
        description: 'Original printed price of ₹25.00 covered by ₹40.00 sticker.',
        statutoryClause: 'Rule 18(2) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: '₹ 40.00 (Stickered)',
        requiredValue: 'Original un-altered MRP'
      }
    ],
    boundingBoxes: [
      {
        id: 'live-box-1',
        label: 'Tampered MRP Overlay',
        x: 50,
        y: 55,
        width: 35,
        height: 8.5,
        rule: 'Rule 18(2)',
        status: 'FAIL',
        detectedText: '₹ 40.00 (Adhesive Sticker detected over ₹25.00)',
        requiredStandard: 'Alteration of MRP strictly prohibited',
        description: 'Illegal price inflation sticker detected by OCR'
      }
    ]
  },
  {
    title: 'Edible Oil Pouch - Missing Unit Sale Price',
    category: 'Food & Beverages',
    description: 'Mandatory Unit Sale Price (USP) per 100ml / 1L missing from declaration.',
    expectedStatus: 'FAIL',
    previewColor: ['#f59e0b', '#d97706'],
    productName: 'PurityGold Mustard Oil (1 Litre)',
    brand: 'PurityGold Oils',
    netQty: '1 Litre',
    mrp: '₹ 165.00 (No USP)',
    batch: 'Mfg: 08/2026 • PG-12',
    violations: [
      {
        code: 'RULE_6_11_USP',
        rule: 'Rule 6(11)',
        title: 'Missing Unit Sale Price (USP)',
        severity: 'CRITICAL',
        description: 'Commodity fails to declare price per standard unit (ml/L).',
        statutoryClause: 'Rule 6(11) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'Missing',
        requiredValue: '₹ 0.165 per 1ml or ₹ 165.00 per 1L'
      }
    ],
    boundingBoxes: [
      {
        id: 'live-box-2',
        label: 'Missing USP',
        x: 50,
        y: 55,
        width: 35,
        height: 8.5,
        rule: 'Rule 6(11)',
        status: 'FAIL',
        detectedText: 'MRP ₹ 165.00 (incl. of all taxes)',
        requiredStandard: 'Unit Sale Price mandatory',
        description: 'USP omitted'
      }
    ]
  },
  {
    title: 'Organic Green Tea - Fully Compliant',
    category: 'Food & Beverages',
    description: 'Packaging strictly complies with Rules 6, 7 and all mandatory declarations.',
    expectedStatus: 'PASS',
    previewColor: ['#10b981', '#059669'],
    productName: 'EcoHerb Pure Himalayan Green Tea (100g)',
    brand: 'EcoHerb Organics',
    netQty: '100 g',
    mrp: '₹ 180.00 (USP: ₹1.80/g)',
    batch: 'Mfg: 09/2026 • EH-88',
    violations: [],
    boundingBoxes: [
      {
        id: 'live-box-3',
        label: 'Net Quantity',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 6(1)(c)',
        status: 'PASS',
        detectedText: '100 g (Font: 2.8mm)',
        requiredStandard: '>= 2.0mm',
        description: 'Meets minimum font specification'
      },
      {
        id: 'live-box-4',
        label: 'MRP & USP',
        x: 50,
        y: 55,
        width: 35,
        height: 8.5,
        rule: 'Rule 6(1)(e) & 6(11)',
        status: 'PASS',
        detectedText: 'MRP ₹ 180.00 (incl. of all taxes) | USP ₹1.80/g',
        requiredStandard: 'Compliant tax & USP format',
        description: 'Correct format'
      }
    ]
  }
];

export const LiveScanModal: React.FC<LiveScanModalProps> = ({
  isOpen,
  onClose,
  onNewScanCompleted
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [completedRecord, setCompletedRecord] = useState<InspectionRecord | null>(null);

  if (!isOpen) return null;

  const currentPreset = PRESET_PACKAGES[selectedPresetIndex];

  const stages = [
    'Normalizing package illumination & distortion...',
    'Extracting high-resolution OCR text tokens...',
    'Parsing LMPC Rule 6 mandatory declarations (MRP, Batch, Qty)...',
    'Gauging numeral font height against Rule 7 Table-I...',
    'Verifying against Legal Metrology Standards database...'
  ];

  const handleStartScan = () => {
    setIsScanning(true);
    setScanStage(0);
    setCompletedRecord(null);

    // Multi-stage scan simulation
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < stages.length) {
        setScanStage(current);
      } else {
        clearInterval(interval);
        setIsScanning(false);

        // Build new inspection record
        const newRecord: InspectionRecord = {
          id: `LMR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          productName: currentPreset.productName,
          brand: currentPreset.brand,
          manufacturer: `${currentPreset.brand} Mills Ltd, Industrial Zone`,
          batchNo: `LIVE-${Math.floor(100 + Math.random() * 900)}`,
          category: currentPreset.category,
          zone: 'Zone A - Wholesale Mandi',
          retailerName: 'Central Logistics Field Inspection Point',
          retailerLocation: 'Sector 19, Vashi, Navi Mumbai',
          netQuantity: currentPreset.netQty,
          mrpDeclared: currentPreset.mrp,
          status: currentPreset.expectedStatus === 'PASS' ? 'PASS' : 'FAIL',
          severity: currentPreset.expectedStatus === 'PASS' ? 'COMPLIANT' : 'CRITICAL',
          violations: currentPreset.violations,
          boundingBoxes: currentPreset.boundingBoxes,
          confidenceScore: 0.98,
          inspectorName: (() => {
            try {
              const s = localStorage.getItem('officer_profile');
              if (s) {
                const p = JSON.parse(s);
                if (p.name && !p.name.includes('Rajesh Sharma')) return p.name;
              }
            } catch {}
            return 'Authorized Inspector';
          })(),
          inspectorId: (() => {
            try {
              const s = localStorage.getItem('officer_profile');
              if (s) {
                const p = JSON.parse(s);
                if (p.id && p.id !== 'LMO-MH-4019') return p.id;
              }
            } catch {}
            return 'LMO-AUTH';
          })(),
          notes: currentPreset.expectedStatus === 'PASS' 
            ? 'Live field scan: fully compliant.' 
            : 'Live field scan: non-compliance detected.',
          imageSrc: createPackageSvg(
            currentPreset.previewColor,
            currentPreset.brand,
            currentPreset.productName,
            currentPreset.netQty,
            currentPreset.mrp,
            currentPreset.batch,
            '8909988776655',
            'Care: 1800-44-9911 | care@compliance.gov.in',
            currentPreset.expectedStatus !== 'PASS'
          )
        };

        setCompletedRecord(newRecord);
      }
    }, 450);
  };

  const handleRegister = () => {
    if (completedRecord) {
      onNewScanCompleted(completedRecord);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">
                Simulated AI Optical Compliance Scanner
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time LMPC Rules 2011 computer vision verification module
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Package Inspection Sample:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_PACKAGES.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (!isScanning) {
                      setSelectedPresetIndex(idx);
                      setCompletedRecord(null);
                    }
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    selectedPresetIndex === idx
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{preset.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      preset.expectedStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {preset.expectedStatus}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scanner Viewport / HUD */}
          <div className="relative bg-slate-950 rounded-xl p-6 min-h-[220px] flex flex-col items-center justify-center border border-slate-800 overflow-hidden">
            
            {/* Grid background lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

            {isScanning ? (
              <div className="relative z-10 text-center space-y-4 max-w-md">
                {/* Animated Scanner Laser Bar */}
                <div className="w-48 h-1 bg-indigo-500 shadow-[0_0_15px_#6366f1] mx-auto animate-bounce"></div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-indigo-400 font-mono text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Optical Analyzer Engine Active</span>
                  </div>
                  <p className="text-slate-200 text-xs font-semibold animate-pulse">
                    {stages[scanStage]}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${((scanStage + 1) / stages.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : completedRecord ? (
              <div className="relative z-10 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-slate-900 border border-slate-700 shadow-inner">
                  {completedRecord.status === 'PASS' ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  )}
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm">
                    {completedRecord.status === 'PASS' ? 'Full Statutory Compliance Confirmed' : 'Violations Detected'}
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Case Ref: <span className="font-mono text-indigo-400">{completedRecord.id}</span> • Confidence: 98%
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleStartScan}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-Scan</span>
                  </button>
                  <button
                    onClick={handleRegister}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Commit to Dashboard Audit Trail</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-slate-200 font-bold text-xs">Ready for High-Res Inspection</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 max-w-sm">
                    Initiate camera scanner to automatically parse MRP format, net quantity font height, and mandatory packaging declarations.
                  </p>
                </div>
                <button
                  onClick={handleStartScan}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Optical AI Inspection</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Standards: Legal Metrology (Packaged Commodities) Rules, 2011</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
