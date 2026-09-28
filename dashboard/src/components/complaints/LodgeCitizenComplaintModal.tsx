import React, { useState } from 'react';
import { 
  X, 
  Megaphone, 
  Store, 
  MapPin, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  Send,
  Building2,
  Package,
  User,
  Phone
} from 'lucide-react';
import { CitizenComplaint } from '../../types/compliance';

interface LodgeCitizenComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLodgeComplaint: (complaint: CitizenComplaint) => void;
}

export const LodgeCitizenComplaintModal: React.FC<LodgeCitizenComplaintModalProps> = ({
  isOpen,
  onClose,
  onLodgeComplaint
}) => {
  const [complainantType, setComplainantType] = useState<'Citizen' | 'NIC Member'>('Citizen');
  const [complainantName, setComplainantName] = useState('Anil K. Verma');
  const [complainantPhone, setComplainantPhone] = useState('+91 98201 88412');
  const [source, setSource] = useState<CitizenComplaint['source']>('Citizen');
  const [shopName, setShopName] = useState('Empire Daily Needs & Supermarket');
  const [commodity, setCommodity] = useState('Packaged Dairy & Provisions');
  const [brand, setBrand] = useState('PureDesi');
  const [complaintType, setComplaintType] = useState<CitizenComplaint['complaintType']>('Overcharging above MRP');
  const [reportedProduct, setReportedProduct] = useState('A2 Full Cream Milk 1L Pouch');
  const [address, setAddress] = useState('Shop 12, P.M. Road, Fort, Mumbai');
  const [district, setDistrict] = useState('Mumbai City');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');
  const [description, setDescription] = useState('Merchant charged ₹88 against printed MRP of ₹75 for 1L pouch milk, claiming extra refrigeration cooling charges.');
  const [lat, setLat] = useState<number>(18.9320);
  const [lng, setLng] = useState<number>(72.8335);

  if (!isOpen) return null;

  const handleApplyPreset = (presetType: 'fort' | 'vashi' | 'thane' | 'nic') => {
    if (presetType === 'fort') {
      setComplainantType('Citizen');
      setComplainantName('Kavita Deshpande');
      setComplainantPhone('+91 98201 77312');
      setSource('Citizen');
      setShopName('Empire Daily Needs & Supermarket');
      setCommodity('Packaged Dairy & Beverages');
      setBrand('PureDesi');
      setComplaintType('Overcharging above MRP');
      setReportedProduct('A2 Full Cream Milk 1L');
      setAddress('Shop 12, P.M. Road, Fort, Mumbai');
      setDistrict('Mumbai City');
      setState('Maharashtra');
      setPincode('400001');
      setLat(18.9320);
      setLng(72.8335);
      setDescription('Merchant charged ₹88 against printed MRP of ₹75 for 1L pouch milk, claiming cooling charges.');
    } else if (presetType === 'vashi') {
      setComplainantType('Citizen');
      setComplainantName('Rahul M. Shah');
      setComplainantPhone('+91 98214 55901');
      setSource('INGRAM Portal');
      setShopName('Shree Balaji Provision & Spice Mart');
      setCommodity('Packaged Cereals & Pulses');
      setBrand('CrispyOats');
      setComplaintType('Missing Unit Sale Price (USP)');
      setReportedProduct('Imported Almonds & Cashew Value Packs 1kg');
      setAddress('Sector 19A, Near APMC Market, Vashi, Navi Mumbai');
      setDistrict('Thane');
      setState('Maharashtra');
      setPincode('400705');
      setLat(19.0772);
      setLng(73.0035);
      setDescription('No Unit Sale Price per gram declared on bulk packs of dry fruits and breakfast cereals under Rule 6(11).');
    } else if (presetType === 'nic') {
      setComplainantType('NIC Member');
      setComplainantName('Dr. S. Ramanathan (NIC Technical Auditor)');
      setComplainantPhone('+91 98110 44290');
      setSource('NIC Member');
      setShopName('Metro Central Superstore');
      setCommodity('Pre-Packaged Edible Oils');
      setBrand('GoldDrop');
      setComplaintType('Overcharging above MRP');
      setReportedProduct('Refined Sunflower Oil 1 Litre Pack');
      setAddress('Colaba Causeway, Near Regal Cinema, Mumbai');
      setDistrict('Mumbai City');
      setState('Maharashtra');
      setPincode('400005');
      setLat(18.9220);
      setLng(72.8315);
      setDescription('NIC field inspection audit detected POS barcode scanner charging ₹185 on packages with printed MRP of ₹160.');
    } else {
      setComplainantType('Citizen');
      setComplainantName('Vikramaditya Rao');
      setComplainantPhone('+91 98230 11984');
      setSource('Citizen');
      setShopName('Thane Tech & Mobile Accessories Hub');
      setCommodity('Electronics & Devices');
      setBrand('TurboCharge');
      setComplaintType('Dual MRP Sticker');
      setReportedProduct('65W Fast USB-C Power Adapter');
      setAddress('Naupada, Gokhale Road, Thane West');
      setDistrict('Thane');
      setState('Maharashtra');
      setPincode('400602');
      setLat(19.1865);
      setLng(72.9754);
      setDescription('Retailer pasted ₹1,299 adhesive price sticker directly covering original manufacturer MRP of ₹899.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !address.trim()) return;

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newComplaint: CitizenComplaint = {
      id: `CASE-2026-${randomSuffix}`,
      source: complainantType === 'NIC Member' ? 'NIC Member' : source,
      complainantType: complainantType,
      complainantName: complainantName.trim() || (complainantType === 'NIC Member' ? 'NIC Officer' : 'Concerned Citizen'),
      complainantPhone: complainantPhone.trim(),
      shopName: shopName.trim(),
      commodity: commodity.trim(),
      brand: brand.trim(),
      complaintType: complaintType,
      description: description.trim() || 'Citizen reported non-compliance with Legal Metrology packaging rules.',
      address: address.trim(),
      district: district,
      state: state,
      pincode: pincode.trim() || '400001',
      coordinates: { lat, lng },
      complaintDate: new Date().toISOString(),
      status: 'PENDING_DISPATCH',
      reportedProduct: reportedProduct.trim() || `${brand} ${commodity}`,
      previousViolationsFound: 0
    };

    onLodgeComplaint(newComplaint);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#001F3F] text-white p-4 sm:p-5 flex items-start justify-between relative overflow-hidden">
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 font-mono">
                  Grievance Intake Flow
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 leading-tight">
                Raise Complaint (Citizen / NIC Member)
              </h2>
              <p className="text-xs text-blue-100/70 mt-0.5">
                Record a packaging or MRP discrepancy for Legal Metrology Officer review
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Quick Preset Buttons */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Presets:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyPreset('fort')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                Citizen (Fort)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('nic')}
                className="px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[10px] font-bold text-sky-900 cursor-pointer shadow-2xs"
              >
                NIC Member Report
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('vashi')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                Vashi (No USP)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('thane')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                Thane (Dual MRP)
              </button>
            </div>
          </div>

          {/* Complainant Type & Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">Complainant Category</label>
              <select
                value={complainantType}
                onChange={(e) => {
                  const val = e.target.value as 'Citizen' | 'NIC Member';
                  setComplainantType(val);
                  setSource(val === 'NIC Member' ? 'NIC Member' : 'Citizen');
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="Citizen">Citizen</option>
                <option value="NIC Member">NIC Member</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Complainant Name</span>
              </label>
              <input
                type="text"
                required
                value={complainantName}
                onChange={(e) => setComplainantName(e.target.value)}
                placeholder="Full Name"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Mobile (for notification)</span>
              </label>
              <input
                type="text"
                required
                value={complainantPhone}
                onChange={(e) => setComplainantPhone(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Grievance Source & Alleged Offense */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">Intake Channel / Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="Citizen">Direct Citizen Submission</option>
                <option value="NIC Member">National Informatics Centre (NIC) Portal</option>
                <option value="National Consumer Helpline">National Consumer Helpline (1915)</option>
                <option value="INGRAM Portal">INGRAM Portal (consumerhelpline.gov.in)</option>
                <option value="e-Daakhil">e-Daakhil Commission Portal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">Alleged Offense Category</label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-rose-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="Overcharging above MRP">Overcharging above MRP</option>
                <option value="Dual MRP Sticker">Dual MRP Sticker Overlay</option>
                <option value="Missing Unit Sale Price (USP)">Missing Unit Sale Price (USP)</option>
              </select>
            </div>
          </div>

          {/* Business / Retailer & Commodity & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-slate-600" />
                <span>Business / Retailer</span>
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Metro Mart Provisions"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-slate-600" />
                <span>Commodity &amp; Item</span>
              </label>
              <input
                type="text"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                placeholder="e.g. Packaged Milk 1L"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. PureDesi"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Location / Address of Establishment</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop No, Landmark, Area"
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Grievance Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 block">
              Complaint / Infraction Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 leading-relaxed"
              placeholder="Describe the complaint, billing override, or packaging discrepancy..."
            />
          </div>

          {/* Submit Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-200/70 font-medium text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:shadow-md transition cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Complaint &amp; Create Case</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
