import React from 'react';
import { X, BookOpen, Scale } from 'lucide-react';

interface RulesReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesReferenceModal: React.FC<RulesReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">
                Legal Metrology (Packaged Commodities) Rules, 2011
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Statutory Guidelines &amp; Enforcement Officer Cheatsheet
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          
          {/* Rule 6 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Scale className="w-4 h-4" />
              <span>Rule 6: Mandatory Declarations on Pre-Packaged Goods</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Every package shall bear thereon or on label securely affixed thereto, the following definite and conspicuous declarations:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Rule 6(1)(a): Manufacturer &amp; Packer Details</strong>
                <span className="text-slate-500 text-[11px]">Name and complete physical address of the manufacturer, packer or importer.</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Rule 6(1)(b): Generic Commodity Name</strong>
                <span className="text-slate-500 text-[11px]">Common or generic name of commodity contained in the package.</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Rule 6(1)(c): Net Quantity in Metric Units</strong>
                <span className="text-slate-500 text-[11px]">Net quantity in standard unit of weight (g, kg), measure (ml, L) or number.</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Rule 6(1)(d): Month &amp; Year of Packing</strong>
                <span className="text-slate-500 text-[11px]">Month and Year in which the commodity is manufactured or pre-packed.</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Rule 6(1)(e): Maximum Retail Price (MRP)</strong>
                <span className="text-slate-500 text-[11px]">Retail sale price: "MRP ₹ xx.xx (incl. of all taxes)" format mandatory.</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Rule 6(1)(n): Consumer Care Redressal</strong>
                <span className="text-slate-500 text-[11px]">Name, address, telephone number and email ID of grievance officer.</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Rule 6(10): Country of Origin</strong>
                <span className="text-slate-500 text-[11px]">Mandatory country of origin marking on all imported pre-packaged goods.</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Rule 6(11): Unit Sale Price (USP)</strong>
                <span className="text-slate-500 text-[11px]">Price per gram/milliliter or per piece for packages &gt; 1 unit/100g.</span>
              </div>
            </div>
          </div>

          {/* Rule 7 Table I */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Scale className="w-4 h-4" />
              <span>Rule 7 &amp; Table-I: Minimum Height of Numerals &amp; Letters</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Minimum height required for net quantity declarations based on weight/volume:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse bg-white rounded-lg border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-2.5">Net Quantity Range</th>
                    <th className="p-2.5">Normal Pack (mm)</th>
                    <th className="p-2.5">Blown/Formed Pack (mm)</th>
                    <th className="p-2.5">Statutory Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium">Up to 50 g / ml</td>
                    <td className="p-2.5 font-bold text-indigo-700">1.0 mm</td>
                    <td className="p-2.5 font-bold text-indigo-700">1.5 mm</td>
                    <td className="p-2.5 text-slate-500">Notice under Rule 32</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">50 g/ml to 200 g/ml</td>
                    <td className="p-2.5 font-bold text-indigo-700">2.0 mm</td>
                    <td className="p-2.5 font-bold text-indigo-700">3.0 mm</td>
                    <td className="p-2.5 text-slate-500">Notice under Rule 32</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">200 g/ml to 1 kg / Litre</td>
                    <td className="p-2.5 font-bold text-indigo-700">4.0 mm</td>
                    <td className="p-2.5 font-bold text-indigo-700">6.0 mm</td>
                    <td className="p-2.5 text-slate-500">Notice under Rule 32</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Exceeding 1 kg / Litre up to 5 kg</td>
                    <td className="p-2.5 font-bold text-indigo-700">6.0 mm</td>
                    <td className="p-2.5 font-bold text-indigo-700">9.0 mm</td>
                    <td className="p-2.5 text-slate-500">Seizure / Compound</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Penalties & Compounding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
              <strong className="text-rose-900 font-bold text-sm block mb-1">Section 36(1) Penalty</strong>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                Whoever manufactures, packs, imports, sells or distributes any non-standard pre-packaged commodity shall be punished with fine up to <strong>₹25,000/-</strong> (first offence), up to <strong>₹50,000/-</strong> (second offence), and up to <strong>₹1,00,000/- or imprisonment</strong> for subsequent offences.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
              <strong className="text-indigo-900 font-bold text-sm block mb-1">Section 48 Compounding</strong>
              <p className="text-indigo-800 text-[11px] leading-relaxed">
                Any offence punishable under Section 36 may be compounded by the Legal Metrology Controller before or after the institution of prosecution on payment of such sum not exceeding the maximum fine prescribed for the offence.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            Close Reference
          </button>
        </div>

      </div>
    </div>
  );
};
