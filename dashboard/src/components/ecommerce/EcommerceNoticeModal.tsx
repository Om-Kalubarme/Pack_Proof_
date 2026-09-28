import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CheckCircle2, 
  Scale, 
  Send,
  Building2,
  Calendar,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { EcommerceAuditItem } from '../../types/ecommerce';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EcommerceNoticeModalProps {
  item: EcommerceAuditItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNoticeDispatched: (itemId: string, officerNotes?: string) => void;
}

export const EcommerceNoticeModal: React.FC<EcommerceNoticeModalProps> = ({
  item,
  isOpen,
  onClose,
  onNoticeDispatched
}) => {
  const [responseDays, setResponseDays] = useState(15);
  const [officerRemarks, setOfficerRemarks] = useState(
    'You are hereby directed to rectify the listed non-compliance, cease displaying inflated prices over printed MRP, and submit an explanation within the statutory response window.'
  );
  const [isDispatched, setIsDispatched] = useState(false);

  // Dynamic officer info
  const currentOfficer = (() => {
    try {
      const saved = localStorage.getItem('officer_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && !parsed.name.includes('Rajesh Sharma')) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  })();

  const officerDisplayName = currentOfficer?.name || 'Authorized Enforcement Officer';
  const officerDisplayId = currentOfficer?.id || 'LMO-OFFICIAL';
  const officerDesignation = currentOfficer?.designation || 'Legal Metrology Officer';

  if (!isOpen || !item) return null;

  const handleDispatch = () => {
    setIsDispatched(true);
    onNoticeDispatched(item.id, officerRemarks);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header Banner
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GOVERNMENT OF INDIA', 105, 12, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('DEPARTMENT OF CONSUMER AFFAIRS • LEGAL METROLOGY DIVISION', 105, 18, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text('E-COMMERCE MARKETPLACE ENFORCEMENT & REGULATORY COMPLIANCE CELL', 105, 24, { align: 'center' });

    // Notice Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('FORM VI: STATUTORY E-COMMERCE SHOW-CAUSE NOTICE', 105, 42, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('[Under Rule 32 of Legal Metrology (Packaged Commodities) Rules, 2011]', 105, 47, { align: 'center' });

    // Metadata Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 52, 180, 32, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Notice Reference:', 20, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(`SCN-ECOM/${item.caseId}/2026`, 55, 59);

    doc.setFont('helvetica', 'bold');
    doc.text('Audit Date:', 125, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(item.auditDate).toLocaleDateString('en-IN'), 155, 59);

    doc.setFont('helvetica', 'bold');
    doc.text('Marketplace Platform:', 20, 67);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.marketplace} Online Marketplace`, 60, 67);

    doc.setFont('helvetica', 'bold');
    doc.text('Inspecting Officer:', 125, 67);
    doc.setFont('helvetica', 'normal');
    doc.text(`${officerDisplayName} (${officerDisplayId})`, 155, 67);

    doc.setFont('helvetica', 'bold');
    doc.text('Target Seller / Entity:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.sellerName} (${item.sellerLocation})`, 60, 75);

    // Salutation
    let y = 92;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`To,\nThe Compliance Officer / Grievance Officer,\n${item.marketplace} India & M/s ${item.sellerName},`, 15, y);

    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('SUBJECT: NOTICE OF CONTRAVENTION OF LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011', 15, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const introText = `WHEREAS an automated crawler audit conducted by this Department under the Legal Metrology Act, 2009 has identified mandatory statutory packaging and pricing discrepancies on your digital marketplace listing for "${item.productName}".`;
    doc.text(doc.splitTextToSize(introText, 180), 15, y);

    y += 16;
    // Findings Table
    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      head: [['Inspection Parameter', 'Physical Package OCR Declaration', 'Digital Marketplace Listing', 'Statutory Evaluation']],
      body: [
        ['Product Commodity', item.packageOcr.productName, item.onlineMetadata.productName, 'Verified'],
        ['Maximum Retail Price (MRP)', `INR ${item.printedMrp.toFixed(2)}`, `INR ${item.onlinePrice.toFixed(2)}`, item.priceDifference > 0 ? `+INR ${item.priceDifference.toFixed(2)} (${item.percentDifference}% Overcharge)` : 'Aligned'],
        ['Declared Net Quantity', item.packageOcr.netQuantity, item.onlineMetadata.netQuantity, item.mismatchFields.includes('netQuantity') ? 'Discrepancy Detected' : 'Verified'],
        ['Country of Origin', item.packageOcr.countryOfOrigin, item.onlineMetadata.countryOfOrigin, item.mismatchFields.includes('countryOfOrigin') ? 'Rule 6(10A) Violation' : 'Verified'],
        ['Manufacturer Details', item.packageOcr.manufacturer, item.onlineMetadata.manufacturer, item.mismatchFields.includes('manufacturer') ? 'Mismatch' : 'Verified']
      ],
      headStyles: { fillColor: [15, 23, 42], fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // Statutory Provisions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('GOVERNING STATUTORY CLAUSES & PENAL PROVISIONS:', 15, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`1. Contravention: ${item.applicableRule}`, 15, finalY + 6);
    doc.text(`2. Penalty Clause: ${item.statutoryPenalty}`, 15, finalY + 11);
    doc.text(`3. Response Timeline: You are required to submit an explanation within ${responseDays} days from receipt of this notice.`, 15, finalY + 16);

    // Signatures
    const sigY = finalY + 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(officerDisplayName, 140, sigY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${officerDesignation} (${officerDisplayId})`, 140, sigY + 5);
    doc.text('Western Regulatory Division, Govt. of India', 140, sigY + 9);

    doc.save(`Form_VI_Notice_${item.caseId}_${item.marketplace}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                Generate Digital Statutory Notice (Form VI)
              </h2>
              <p className="text-[11px] text-slate-400">
                Rule 32 • E-Commerce Marketplace Enforcement Directive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Notice Document Preview */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
          
          {/* Official Document Sheet */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-xs font-sans text-slate-800 space-y-4 text-xs">
            
            {/* Header */}
            <div className="text-center border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Government of India • Department of Consumer Affairs
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                LEGAL METROLOGY E-COMMERCE ENFORCEMENT WING
              </h3>
              <p className="text-[11px] text-slate-600">
                Statutory Show-Cause Notice under Section 36 &amp; Rule 32 of LMPC Rules, 2011
              </p>
            </div>

            {/* Case Details Box */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-500">Case Identifier:</span>{' '}
                <strong className="font-mono text-blue-700">{item.caseId}</strong>
              </div>
              <div>
                <span className="text-slate-500">Audit Reference:</span>{' '}
                <strong className="font-mono text-slate-800">{item.id}</strong>
              </div>
              <div>
                <span className="text-slate-500">Marketplace Entity:</span>{' '}
                <strong className="text-slate-800">{item.marketplace}</strong>
              </div>
              <div>
                <span className="text-slate-500">Merchant / Seller:</span>{' '}
                <strong className="text-slate-800">{item.sellerName}</strong>
              </div>
            </div>

            {/* Infraction Summary Card */}
            <div className="p-3 rounded bg-rose-50 border border-rose-200 space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-rose-900">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Detected Non-Compliance</span>
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                  {item.violationType}
                </span>
              </div>
              <p className="text-[11px] text-rose-800 font-medium">
                {item.violationTitle}
              </p>
              <div className="text-[10px] text-slate-600 pt-1 border-t border-rose-200/60 flex justify-between">
                <span>Governing Rule: {item.applicableRule}</span>
                <span>Statutory Penalty: {item.statutoryPenalty}</span>
              </div>
            </div>

            {/* Split Comparison Summary Table */}
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-1.5 px-2.5">Field</th>
                    <th className="py-1.5 px-2.5">Package OCR Declaration</th>
                    <th className="py-1.5 px-2.5">Online Listing Value</th>
                    <th className="py-1.5 px-2.5 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-1.5 px-2.5 font-medium text-slate-600">Product Title</td>
                    <td className="py-1.5 px-2.5 text-slate-800">{item.packageOcr.productName}</td>
                    <td className="py-1.5 px-2.5 text-slate-800">{item.onlineMetadata.productName}</td>
                    <td className="py-1.5 px-2.5 text-right font-semibold text-emerald-700">✓ Aligned</td>
                  </tr>
                  <tr className={item.mismatchFields.includes('mrp') ? 'bg-rose-50/50' : ''}>
                    <td className="py-1.5 px-2.5 font-medium text-slate-600">MRP / Price</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900">₹ {item.printedMrp.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-rose-700">₹ {item.onlinePrice.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-rose-700">
                      {item.priceDifference > 0 ? `+₹${item.priceDifference.toFixed(2)} (${item.percentDifference}%)` : '✓ Matches'}
                    </td>
                  </tr>
                  <tr className={item.mismatchFields.includes('netQuantity') ? 'bg-rose-50/50' : ''}>
                    <td className="py-1.5 px-2.5 font-medium text-slate-600">Net Quantity</td>
                    <td className="py-1.5 px-2.5">{item.packageOcr.netQuantity}</td>
                    <td className="py-1.5 px-2.5">{item.onlineMetadata.netQuantity}</td>
                    <td className="py-1.5 px-2.5 text-right font-semibold">
                      {item.mismatchFields.includes('netQuantity') ? <span className="text-rose-700 font-bold">❌ Mismatch</span> : <span className="text-emerald-700">✓ Aligned</span>}
                    </td>
                  </tr>
                  <tr className={item.mismatchFields.includes('countryOfOrigin') ? 'bg-rose-50/50' : ''}>
                    <td className="py-1.5 px-2.5 font-medium text-slate-600">Country of Origin</td>
                    <td className="py-1.5 px-2.5">{item.packageOcr.countryOfOrigin}</td>
                    <td className="py-1.5 px-2.5">{item.onlineMetadata.countryOfOrigin}</td>
                    <td className="py-1.5 px-2.5 text-right font-semibold">
                      {item.mismatchFields.includes('countryOfOrigin') ? <span className="text-rose-700 font-bold">❌ Omitted</span> : <span className="text-emerald-700">✓ Aligned</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Officer Directive Inputs */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 text-xs">
                  Statutory Response Deadline:
                </label>
                <div className="flex items-center gap-2">
                  {[7, 15, 30].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setResponseDays(days)}
                      className={`px-2 py-0.5 rounded text-xs transition ${
                        responseDays === days 
                          ? 'bg-blue-600 text-white font-bold' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 text-xs block mb-1">
                  Regulatory Directive / Officer Remarks:
                </label>
                <textarea
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500">
            Signatory: <strong>{officerDisplayName} ({officerDisplayId})</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="py-1.5 px-3 rounded-md bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Notice PDF</span>
            </button>

            {isDispatched ? (
              <div className="py-1.5 px-3 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Notice Dispatched</span>
              </div>
            ) : (
              <button
                onClick={handleDispatch}
                className="py-1.5 px-4 rounded-md bg-rose-700 hover:bg-rose-600 text-white font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Notice to Marketplace</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
