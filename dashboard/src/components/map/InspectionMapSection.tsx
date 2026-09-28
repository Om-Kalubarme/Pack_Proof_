import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  User, 
  Scale, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  AlertTriangle,
  Send,
  Flag,
  Globe,
  Building2,
  Calendar,
  Compass,
  Check,
  X,
  FileCheck2,
  Package,
  Scan,
  Factory,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Download,
  Clock,
  Layers,
  Info,
  Sparkles
} from 'lucide-react';
import { InspectionRecord, CitizenComplaint } from '../../types/compliance';

declare global {
  interface Window {
    __openInspectionModal?: (id: string) => void;
    __openComplaintModal?: (id: string) => void;
  }
}

interface InspectionMapSectionProps {
  records: InspectionRecord[];
  complaints?: CitizenComplaint[];
  selectedRecord: InspectionRecord | null;
  selectedComplaint?: CitizenComplaint | null;
  onSelectRecord: (record: InspectionRecord) => void;
  onSelectComplaint?: (complaint: CitizenComplaint) => void;
  onOpenEvidence: (record: InspectionRecord) => void;
  onOpenNotice: (record: InspectionRecord) => void;
  onDispatchInspector?: (complaint: CitizenComplaint) => void;
}

type LayerCategory = 'ALL' | 'CITIZEN_CASES' | 'RESOLVED_CASES' | 'PENDING_CASES';
type InspectionModalTab = 'all' | 'product' | 'scanning' | 'manufacturing' | 'violations';

const getCalculatedUSP = (netQty: string, mrp: string): string => {
  const cleanQty = parseFloat(netQty.replace(/[^0-9.]/g, ''));
  const cleanMrp = parseFloat(mrp.replace(/[^0-9.]/g, ''));
  if (isNaN(cleanQty) || isNaN(cleanMrp) || cleanQty <= 0) return 'N/A';
  return `₹ ${(cleanMrp / cleanQty).toFixed(2)} / unit`;
};

export const InspectionMapSection: React.FC<InspectionMapSectionProps> = ({
  records,
  complaints = [],
  selectedRecord,
  selectedComplaint = null,
  onSelectRecord,
  onSelectComplaint,
  onOpenEvidence,
  onOpenNotice,
  onDispatchInspector
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Category Layer Filter
  const [activeCategory, setActiveCategory] = useState<LayerCategory>('ALL');

  // Geographic Filters backed by real data
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedPincode, setSelectedPincode] = useState<string>('ALL');

  // National vs Circle Viewport Mode
  const [mapScope, setMapScope] = useState<'CIRCLE' | 'NATIONAL'>('CIRCLE');

  // Active Tab in Inspection Modal
  const [modalActiveTab, setModalActiveTab] = useState<InspectionModalTab>('all');

  // Selected inspection record for popup modal
  const [inspectionModalRecord, setInspectionModalRecord] = useState<InspectionRecord | null>(null);

  // Selected complaint lead for popup modal
  const [complaintModalLead, setComplaintModalLead] = useState<CitizenComplaint | null>(null);

  // Dispatch Inspector confirmation dialog state
  const [dispatchModalComplaint, setDispatchModalComplaint] = useState<CitizenComplaint | null>(null);

  // Derive unique states from real data
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    records.forEach(r => { if (r.state) states.add(r.state); });
    complaints.forEach(c => { if (c.state) states.add(c.state); });
    return Array.from(states).sort();
  }, [records, complaints]);

  // Derive unique districts from real data (optionally filtered by selected state)
  const availableDistricts = useMemo(() => {
    const districts = new Set<string>();
    records.forEach(r => {
      if (selectedState === 'ALL' || r.state === selectedState) {
        if (r.district) districts.add(r.district);
      }
    });
    complaints.forEach(c => {
      if (selectedState === 'ALL' || c.state === selectedState) {
        if (c.district) districts.add(c.district);
      }
    });
    return Array.from(districts).sort();
  }, [records, complaints, selectedState]);

  // Derive unique PIN codes from real data (optionally filtered by state/district)
  const availablePincodes = useMemo(() => {
    const pins = new Set<string>();
    records.forEach(r => {
      const stateMatch = selectedState === 'ALL' || r.state === selectedState;
      const distMatch = selectedDistrict === 'ALL' || r.district === selectedDistrict;
      if (stateMatch && distMatch && r.pincode) pins.add(r.pincode);
    });
    complaints.forEach(c => {
      const stateMatch = selectedState === 'ALL' || c.state === selectedState;
      const distMatch = selectedDistrict === 'ALL' || c.district === selectedDistrict;
      if (stateMatch && distMatch && c.pincode) pins.add(c.pincode);
    });
    return Array.from(pins).sort();
  }, [records, complaints, selectedState, selectedDistrict]);

  // Filter inspections based on active filters
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Category filter
      if (activeCategory === 'CITIZEN_CASES') return false;
      if (activeCategory === 'RESOLVED_CASES') {
        const isResolved = r.status === 'PASS' || r.status === 'COMPOUNDED' || r.complianceResult === 'Compliant';
        if (!isResolved) return false;
      }
      if (activeCategory === 'PENDING_CASES') {
        const isPending = r.status === 'PENDING' || r.status === 'IN_PROGRESS' || r.complianceResult === 'Under Investigation' || r.complianceResult === 'Pending Verification';
        if (!isPending) return false;
      }

      // Geo filters
      if (selectedState !== 'ALL' && r.state !== selectedState) return false;
      if (selectedDistrict !== 'ALL' && r.district !== selectedDistrict) return false;
      if (selectedPincode !== 'ALL' && r.pincode !== selectedPincode) return false;

      return true;
    });
  }, [records, activeCategory, selectedState, selectedDistrict, selectedPincode]);

  // Filter complaints based on active filters
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // Category filter
      if (activeCategory === 'RESOLVED_CASES') {
        if (c.status !== 'RESOLVED') return false;
      }
      if (activeCategory === 'PENDING_CASES') {
        if (c.status === 'RESOLVED') return false;
      }

      // Geo filters
      if (selectedState !== 'ALL' && c.state !== selectedState) return false;
      if (selectedDistrict !== 'ALL' && c.district !== selectedDistrict) return false;
      if (selectedPincode !== 'ALL' && c.pincode !== selectedPincode) return false;

      return true;
    });
  }, [complaints, activeCategory, selectedState, selectedDistrict, selectedPincode]);

  // Counts for layer pills
  const counts = useMemo(() => {
    const resolvedRecords = records.filter(r => r.status === 'PASS' || r.status === 'COMPOUNDED' || r.complianceResult === 'Compliant').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED').length;
    const pendingRecords = records.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS' || r.complianceResult === 'Under Investigation' || r.complianceResult === 'Pending Verification').length;
    const pendingComplaints = complaints.filter(c => c.status !== 'RESOLVED').length;

    return {
      all: records.length + complaints.length,
      citizenCases: complaints.length,
      resolvedCases: resolvedRecords + resolvedComplaints,
      pendingCases: pendingRecords + pendingComplaints
    };
  }, [records, complaints]);

  // Reset geo filters
  const handleResetGeoFilters = () => {
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedPincode('ALL');
  };

  // Helper: Create 🔴 Red Complaint Hotspot Marker
  const getComplaintHotspotIcon = (isSelected: boolean) => {
    const scale = isSelected ? 'scale(1.22)' : 'scale(1)';
    const zIndex = isSelected ? 9999 : 600;

    const html = `
      <div class="custom-complaint-hotspot" style="transform: ${scale}; z-index: ${zIndex}; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: 30px; height: 30px;">
          <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(239, 68, 68, 0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 30px; height: 30px; background: #dc2626; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 14px; font-weight: 900; font-family: sans-serif;">
            !
          </div>
        </div>
        <div style="background: #991b1b; color: #ffffff; font-size: 8.5px; font-weight: 800; padding: 1px 4px; border-radius: 3px; margin-top: 2px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.25); letter-spacing: 0.3px;">
          HOTSPOT
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-complaint',
      iconSize: [36, 42],
      iconAnchor: [18, 20],
      popupAnchor: [0, -22]
    });
  };

  // Helper: Create 🔵 Blue Completed Inspection Pin
  const getInspectionMarkerIcon = (isSelected: boolean) => {
    const scale = isSelected ? 'scale(1.22)' : 'scale(1)';
    const zIndex = isSelected ? 9999 : 500;

    const html = `
      <div class="custom-inspection-pin" style="transform: ${scale}; z-index: ${zIndex}; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 30px; 
          height: 30px; 
          background-color: #2563eb; 
          border: 2.5px solid #ffffff; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          box-shadow: 0 0 0 2px #bfdbfe, 0 2px 6px rgba(15, 23, 42, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg); 
            color: #ffffff; 
            font-size: 9.5px; 
            font-weight: 800; 
            font-family: monospace;
          ">LMR</span>
        </div>
        <div style="width: 6px; height: 2px; background-color: rgba(15, 23, 42, 0.2); border-radius: 50%; margin-top: 2px;"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-inspection',
      iconSize: [32, 38],
      iconAnchor: [16, 36],
      popupAnchor: [0, -36]
    });
  };

  // Helper: Create 🟡 Amber Flag for Repeat Packaging Violations
  const getRepeatViolationIcon = (isSelected: boolean, count: number) => {
    const scale = isSelected ? 'scale(1.22)' : 'scale(1)';
    const zIndex = isSelected ? 9999 : 550;

    const html = `
      <div class="custom-repeat-pin" style="transform: ${scale}; z-index: ${zIndex}; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 30px; 
          height: 30px; 
          background-color: #d97706; 
          border: 2.5px solid #ffffff; 
          border-radius: 6px; 
          box-shadow: 0 0 0 2px #fef3c7, 0 2px 8px rgba(180, 83, 9, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
        ">
          ⚑
        </div>
        <div style="background: #92400e; color: #ffffff; font-size: 8px; font-weight: 800; padding: 1px 3.5px; border-radius: 3px; margin-top: 2px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.25);">
          REPEAT ${count > 0 ? `(${count}x)` : ''}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-repeat',
      iconSize: [34, 40],
      iconAnchor: [17, 30],
      popupAnchor: [0, -30]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Division 04 Circle (Mumbai MMR)
      const map = L.map(mapContainerRef.current, {
        center: [19.0760, 72.9500],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      // Standard clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Subtle attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: '<span class="text-[10px] text-slate-400 font-mono">OpenStreetMap • Legal Metrology GIS</span>'
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when filtered records, complaints, or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();
    markersMapRef.current.clear();

    // 1. Render Completed Inspection & Repeat Violation Markers
    filteredRecords.forEach(record => {
      const lat = record.coordinates?.lat || 19.0760;
      const lng = record.coordinates?.lng || 72.8777;
      const isSelected = selectedRecord?.id === record.id && !selectedComplaint;

      let markerIcon: L.DivIcon;
      const isResolved = record.status === 'PASS' || record.status === 'COMPOUNDED' || record.complianceResult === 'Compliant';
      const isPending = record.status === 'PENDING' || record.status === 'IN_PROGRESS';

      if (record.isRepeatOffender) {
        markerIcon = getRepeatViolationIcon(isSelected, record.previousViolationsCount || 2);
      } else {
        markerIcon = getInspectionMarkerIcon(isSelected);
      }

      const marker = L.marker([lat, lng], { icon: markerIcon });

      // Clean popup with clear category status
      const badgeText = isResolved 
        ? '🟢 Resolved Case' 
        : isPending 
        ? '🟡 Pending Case' 
        : record.isRepeatOffender 
        ? '⚠️ Repeat Offense' 
        : '🔵 Inspected Case';

      const badgeClass = isResolved 
        ? 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;' 
        : isPending 
        ? 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;' 
        : 'background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';

      const popupHtml = `
        <div style="font-family: inherit; width: 230px; padding: 12px; background: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #1e40af;">${record.id}</span>
            <span style="font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px; ${badgeClass}">
              ${badgeText}
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px; line-height: 1.3;">
            ${record.retailerName}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${record.retailerLocation}
          </div>
          <div style="font-size: 10px; color: #475569; border-top: 1px solid #f1f5f9; padding-top: 6px; line-height: 1.5;">
            <div><strong>Product:</strong> ${record.productName}</div>
            <div><strong>Result:</strong> ${record.complianceResult || record.status}</div>
            ${record.seventhScheduleForm ? `<div style="color: #1e40af; font-weight: 600;">Seventh Schedule: ${record.seventhScheduleForm.formType} (${record.seventhScheduleForm.formNumber})</div>` : ''}
          </div>
          <button 
            id="btn-popup-${record.id}" 
            data-inspection-id="${record.id}"
            onclick="window.__openInspectionModal && window.__openInspectionModal('${record.id}')"
            style="
              margin-top: 8px; 
              width: 100%; 
              padding: 6px 10px; 
              background: #0f172a; 
              color: #ffffff; 
              border: none; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: 700; 
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            "
          >
            <span>View Inspection</span>
            <span>&rarr;</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false });

      marker.on('click', () => {
        onSelectRecord(record);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${record.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            setModalActiveTab('all');
            setInspectionModalRecord(record);
            onSelectRecord(record);
          };
        }
      });

      marker.addTo(markersGroup);
      markersMapRef.current.set(record.id, marker);
    });

    // 2. Render 🔴 Red Complaint Hotspots
    filteredComplaints.forEach(complaint => {
      const lat = complaint.coordinates?.lat || 19.0760;
      const lng = complaint.coordinates?.lng || 72.8777;
      const isSelected = selectedComplaint?.id === complaint.id;

      const markerIcon = getComplaintHotspotIcon(isSelected);
      const marker = L.marker([lat, lng], { icon: markerIcon });

      const popupHtml = `
        <div style="font-family: inherit; width: 230px; padding: 12px; background: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #fecaca; padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #b91c1c;">${complaint.id}</span>
            <span style="font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #fee2e2; color: #991b1b;">
              🔴 Complaint Hotspot
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px; line-height: 1.3;">
            ${complaint.shopName}
          </div>
          <div style="font-size: 11px; color: #b91c1c; font-weight: 600; margin-bottom: 4px;">
            ${complaint.complaintType}
          </div>
          <div style="font-size: 10px; color: #475569; margin-bottom: 6px; line-height: 1.4;">
            ${complaint.description.slice(0, 75)}...
          </div>
          <div style="font-size: 9.5px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 4px;">
            <div><strong>Source:</strong> ${complaint.source}</div>
            <div><strong>Status:</strong> ${complaint.status === 'INSPECTION_ORDERED' ? 'Inspection Squad Ordered' : 'Pending Dispatch'}</div>
          </div>
          <button 
            id="btn-complaint-${complaint.id}" 
            data-complaint-id="${complaint.id}"
            onclick="window.__openComplaintModal && window.__openComplaintModal('${complaint.id}')"
            style="
              margin-top: 8px; 
              width: 100%; 
              padding: 6px 10px; 
              background: #b91c1c; 
              color: #ffffff; 
              border: none; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: 700; 
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            "
          >
            <span>View Complaint Lead Details</span>
            <span>&rarr;</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false });

      marker.on('click', () => {
        if (onSelectComplaint) {
          onSelectComplaint(complaint);
        }
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-complaint-${complaint.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            setComplaintModalLead(complaint);
            if (onSelectComplaint) {
              onSelectComplaint(complaint);
            }
          };
        }
      });

      marker.addTo(markersGroup);
      markersMapRef.current.set(complaint.id, marker);
    });

    // Pan to selected marker if present
    if (selectedComplaint && selectedComplaint.coordinates) {
      const selectedMarker = markersMapRef.current.get(selectedComplaint.id);
      if (selectedMarker) {
        selectedMarker.openPopup();
      }
    } else if (selectedRecord && selectedRecord.coordinates && !selectedComplaint) {
      const selectedMarker = markersMapRef.current.get(selectedRecord.id);
      if (selectedMarker) {
        selectedMarker.openPopup();
      }
    }
  }, [filteredRecords, filteredComplaints, selectedRecord, selectedComplaint, onSelectRecord, onSelectComplaint]);

  // Global window modal handlers to guarantee Leaflet popup button clicks always succeed
  useEffect(() => {
    window.__openInspectionModal = (id: string) => {
      const rec = records.find(r => r.id === id);
      if (rec) {
        setModalActiveTab('all');
        setInspectionModalRecord(rec);
        onSelectRecord(rec);
      }
    };

    window.__openComplaintModal = (id: string) => {
      const comp = complaints.find(c => c.id === id);
      if (comp) {
        setComplaintModalLead(comp);
        if (onSelectComplaint) {
          onSelectComplaint(comp);
        }
      }
    };

    return () => {
      delete window.__openInspectionModal;
      delete window.__openComplaintModal;
    };
  }, [records, complaints, onSelectRecord, onSelectComplaint]);

  // Capture-phase event delegation for map container to ensure 100% click reliability
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleContainerClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const inspectBtn = target.closest('[data-inspection-id]') as HTMLElement | null;
      if (inspectBtn) {
        const id = inspectBtn.getAttribute('data-inspection-id');
        if (id) {
          e.preventDefault();
          e.stopPropagation();
          const rec = records.find(r => r.id === id);
          if (rec) {
            setModalActiveTab('all');
            setInspectionModalRecord(rec);
            onSelectRecord(rec);
          }
          return;
        }
      }

      const complaintBtn = target.closest('[data-complaint-id]') as HTMLElement | null;
      if (complaintBtn) {
        const id = complaintBtn.getAttribute('data-complaint-id');
        if (id) {
          e.preventDefault();
          e.stopPropagation();
          const comp = complaints.find(c => c.id === id);
          if (comp) {
            setComplaintModalLead(comp);
            if (onSelectComplaint) {
              onSelectComplaint(comp);
            }
          }
          return;
        }
      }
    };

    container.addEventListener('click', handleContainerClick, true);
    return () => {
      container.removeEventListener('click', handleContainerClick, true);
    };
  }, [records, complaints, onSelectRecord, onSelectComplaint]);

  // Fit all visible markers
  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;

    const coords: [number, number][] = [];
    filteredRecords.forEach(r => {
      if (r.coordinates) coords.push([r.coordinates.lat, r.coordinates.lng]);
    });
    filteredComplaints.forEach(c => {
      if (c.coordinates) coords.push([c.coordinates.lat, c.coordinates.lng]);
    });

    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  // Scope Toggle: National Overview vs Officer Jurisdiction Circle
  const handleSwitchScope = (scope: 'CIRCLE' | 'NATIONAL') => {
    setMapScope(scope);
    if (!mapInstanceRef.current) return;

    if (scope === 'NATIONAL') {
      mapInstanceRef.current.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo([19.0760, 72.9500], 11, { duration: 1.2 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
      
      {/* Section Header: Official GIS Title, Viewport Toggle & Summary */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 flex flex-col gap-3 bg-slate-50/60">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                National GIS Enforcement &amp; Violation Heatmap
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time territorial intelligence &amp; regulatory complaint monitoring jurisdiction
            </p>
          </div>

          {/* National Overview vs Officer Jurisdiction Circle Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200 shadow-2xs self-start sm:self-auto text-xs">
            <button
              onClick={() => handleSwitchScope('CIRCLE')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                mapScope === 'CIRCLE'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Officer Circle (MMR)</span>
            </button>
            <button
              onClick={() => handleSwitchScope('NATIONAL')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                mapScope === 'NATIONAL'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span>National Overview (All-India)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row: Category Layer Pills + Geographic Dropdowns */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-2 border-t border-slate-200/60">
          
          {/* Layer Category Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* All Cases */}
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Cases ({counts.all})
            </button>

            {/* Citizen Cases */}
            <button
              onClick={() => setActiveCategory('CITIZEN_CASES')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'CITIZEN_CASES'
                  ? 'bg-rose-50 text-rose-800 font-bold border border-rose-300'
                  : 'bg-white text-rose-700 hover:bg-rose-50/50 border border-rose-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>🔴 Citizen Cases ({counts.citizenCases})</span>
            </button>

            {/* Resolved Cases */}
            <button
              onClick={() => setActiveCategory('RESOLVED_CASES')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'RESOLVED_CASES'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50/50 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>🟢 Resolved Cases ({counts.resolvedCases})</span>
            </button>

            {/* Pending Cases */}
            <button
              onClick={() => setActiveCategory('PENDING_CASES')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'PENDING_CASES'
                  ? 'bg-amber-50 text-amber-800 font-bold border border-amber-300'
                  : 'bg-white text-amber-700 hover:bg-amber-50/50 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>🟡 Pending Cases ({counts.pendingCases})</span>
            </button>
          </div>

          {/* Real Data Geographic Filters (State / District / PIN Code) */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            
            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('ALL');
                setSelectedPincode('ALL');
              }}
              className="bg-white border border-slate-200 text-slate-700 py-1 px-2 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              title="Filter by State"
            >
              <option value="ALL">All States ({availableStates.length})</option>
              {availableStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedPincode('ALL');
              }}
              className="bg-white border border-slate-200 text-slate-700 py-1 px-2 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              title="Filter by District"
            >
              <option value="ALL">All Districts ({availableDistricts.length})</option>
              {availableDistricts.map(dt => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>

            {/* PIN Code Filter */}
            <select
              value={selectedPincode}
              onChange={(e) => setSelectedPincode(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 py-1 px-2 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-mono"
              title="Filter by PIN Code"
            >
              <option value="ALL">All PIN Codes ({availablePincodes.length})</option>
              {availablePincodes.map(pin => (
                <option key={pin} value={pin}>{pin}</option>
              ))}
            </select>

            {/* Reset button if any filter active */}
            {(selectedState !== 'ALL' || selectedDistrict !== 'ALL' || selectedPincode !== 'ALL') && (
              <button
                onClick={handleResetGeoFilters}
                className="text-[11px] text-blue-700 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Main Interactive Map (Full Width) */}
      <div className="relative bg-slate-100 min-h-[480px] sm:min-h-[560px] w-full">
        
        {/* Map DOM Container */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[480px] sm:min-h-[560px] z-10" />

        {/* Map Controls Floating Overlay */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs rounded-md shadow-sm border border-slate-200 p-1">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200"></div>
          <button
            onClick={handleFitBounds}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition"
            title="Fit visible markers"
            aria-label="Fit visible markers"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Required Map Legend: Small, clean and professional */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs rounded-md shadow-xs border border-slate-200 px-3 py-2 text-[11px] hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span className="text-slate-800 font-medium">🔴 Complaint Hotspot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-slate-800 font-medium">🔵 Completed Inspection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span className="text-slate-800 font-medium">🟡 Repeat Packaging Violation</span>
          </div>
        </div>

      </div>

      {/* Detailed Inspection Information Popup Modal */}
      {inspectionModalRecord && (() => {
        const isCompliant = inspectionModalRecord.status === 'PASS' || 
                            inspectionModalRecord.complianceResult === 'Compliant' || 
                            inspectionModalRecord.violations.length === 0;

        return (
          <div 
            className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setInspectionModalRecord(null)}
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
                      {inspectionModalRecord.id}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {inspectionModalRecord.zone}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(inspectionModalRecord.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {inspectionModalRecord.productName}
                  </h3>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800">{inspectionModalRecord.retailerName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {inspectionModalRecord.retailerLocation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${
                    isCompliant
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : (inspectionModalRecord.status === 'FAIL' || inspectionModalRecord.status === 'NOTICE_ISSUED')
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : inspectionModalRecord.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
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
                        <span>{inspectionModalRecord.complianceResult || inspectionModalRecord.status}</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => setInspectionModalRecord(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    aria-label="Close Inspection Details"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-1 overflow-x-auto text-xs">
                <button
                  onClick={() => setModalActiveTab('all')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    modalActiveTab === 'all'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>All Information</span>
                </button>

                <button
                  onClick={() => setModalActiveTab('product')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    modalActiveTab === 'product'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-indigo-600" />
                  <span>About Product</span>
                </button>

                <button
                  onClick={() => setModalActiveTab('scanning')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    modalActiveTab === 'scanning'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5 text-blue-600" />
                  <span>Scanning &amp; Audit</span>
                </button>

                <button
                  onClick={() => setModalActiveTab('manufacturing')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    modalActiveTab === 'manufacturing'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5 text-amber-600" />
                  <span>Manufacturing &amp; Trade</span>
                </button>

                <button
                  onClick={() => setModalActiveTab('violations')}
                  className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    modalActiveTab === 'violations'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-md shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-rose-600" />
                  <span>Violation &amp; Legal Rules</span>
                  {inspectionModalRecord.violations.length > 0 ? (
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center font-mono">
                      {inspectionModalRecord.violations.length}
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
                {(modalActiveTab === 'all' || modalActiveTab === 'product') && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Product &amp; Packaging Specifications
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                        {inspectionModalRecord.category}
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Commodity / Product Name:</span>
                        <span className="font-bold text-slate-900 block leading-snug">
                          {inspectionModalRecord.productName}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Brand / Trade Mark:</span>
                        <span className="font-semibold text-slate-800 block">
                          {inspectionModalRecord.brand}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Declared Net Quantity:</span>
                        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded inline-block border border-blue-200">
                          {inspectionModalRecord.netQuantity}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Declared MRP (incl. of all taxes):</span>
                        <span className="font-mono font-bold text-slate-900 text-sm block">
                          {inspectionModalRecord.mrpDeclared}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Unit Sale Price (USP):</span>
                        <span className="font-mono font-semibold text-slate-800 block">
                          {getCalculatedUSP(inspectionModalRecord.netQuantity, inspectionModalRecord.mrpDeclared)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Batch / Lot Number:</span>
                        <span className="font-mono text-slate-800 block bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">
                          {inspectionModalRecord.batchNo || 'BATCH-STD-2026'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Packaging Format:</span>
                        <span className="text-slate-700 block">
                          Pre-Packaged Rigid/Flexible Container (Rules 5 &amp; 12)
                        </span>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-slate-500 text-[11px] font-medium block">Consumer Care Helpline &amp; Grievance Contact:</span>
                        <span className="text-slate-700 font-mono block">
                          Toll-Free: 1800-445-1234 • Email: grievance@{inspectionModalRecord.brand.toLowerCase().replace(/[^a-z0-9]/g, '') || 'agro'}.in (Rule 6(1)(n) Verified)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PILLAR: Scanning & Field Audit Information */}
                {(modalActiveTab === 'all' || modalActiveTab === 'scanning') && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scan className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Scanning, Field Audit &amp; Device Verification
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        {((inspectionModalRecord.confidenceScore || 0.95) * 100).toFixed(1)}% AI OCR Accuracy
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Inspection Docket ID:</span>
                        <span className="font-mono font-bold text-blue-900 block">
                          {inspectionModalRecord.id}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Auditing Field Officer:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          {inspectionModalRecord.inspectorName} ({inspectionModalRecord.inspectorId})
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Scan Timestamp:</span>
                        <span className="font-mono text-slate-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(inspectionModalRecord.timestamp).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} IST
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">GPS Coordinates:</span>
                        <span className="font-mono text-slate-800 block bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          {inspectionModalRecord.coordinates 
                            ? `${inspectionModalRecord.coordinates.lat.toFixed(5)}° N, ${inspectionModalRecord.coordinates.lng.toFixed(5)}° E` 
                            : '19.0657° N, 72.8687° E (GPS Verified)'}
                        </span>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-slate-500 text-[11px] font-medium block">Verification Hardware &amp; Audit Terminal:</span>
                        <span className="text-slate-700 block">
                          Handheld LMO Mobile OCR Terminal v4.2 • Geofence Locked at {inspectionModalRecord.retailerLocation}
                        </span>
                      </div>

                      {/* Visual Scanned Photo Preview */}
                      {inspectionModalRecord.imageSrc && (
                        <div className="sm:col-span-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 p-2.5 rounded-md">
                          <div className="flex items-center gap-3">
                            <img 
                              src={inspectionModalRecord.imageSrc} 
                              alt={inspectionModalRecord.productName} 
                              className="w-16 h-16 object-contain rounded border border-slate-200 bg-white p-1 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-slate-900 text-xs">Scanned Physical Package Evidence</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {inspectionModalRecord.boundingBoxes.length} Automated OCR Label Bounding Annotations Detected
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              onOpenEvidence(inspectionModalRecord);
                              setInspectionModalRecord(null);
                            }}
                            className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-blue-700 text-xs font-bold border border-blue-200 transition flex items-center gap-1.5 shadow-2xs shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Full Evidence Viewer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. PILLAR: Manufacturing & Trade Details */}
                {(modalActiveTab === 'all' || modalActiveTab === 'manufacturing') && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Factory className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Manufacturing &amp; Trade Details
                        </h4>
                      </div>
                      {inspectionModalRecord.isRepeatOffender ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Flag className="w-3 h-3 text-amber-700" />
                          Repeat Packaging Offender ({inspectionModalRecord.previousViolationsCount || 2} Prior Offenses)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Clean Compliance Track Record
                        </span>
                      )}
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Manufacturer / Packer:</span>
                        <span className="font-bold text-slate-900 block text-xs">
                          {inspectionModalRecord.manufacturer}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Registered under Rule 27 of Legal Metrology (Packaged Commodities) Rules, 2011
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Retail Establishment &amp; Point of Sale:</span>
                        <span className="font-bold text-slate-900 block text-xs">
                          {inspectionModalRecord.retailerName}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {inspectionModalRecord.retailerLocation}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Administrative Jurisdiction:</span>
                        <span className="text-slate-800 block font-mono">
                          District: {inspectionModalRecord.district || 'MMR'} • State: {inspectionModalRecord.state || 'Maharashtra'} • PIN: {inspectionModalRecord.pincode || '400051'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[11px] font-medium block">Seventh Schedule Statutory Verification:</span>
                        {inspectionModalRecord.seventhScheduleForm ? (
                          <div className="bg-blue-50/70 border border-blue-200 rounded p-2 text-[11px] text-blue-950 space-y-0.5">
                            <div className="font-bold flex items-center justify-between">
                              <span>{inspectionModalRecord.seventhScheduleForm.formType} Verification Certificate</span>
                              <span className="font-mono text-[10px] bg-blue-200/80 px-1.5 py-0.2 rounded font-bold">
                                {inspectionModalRecord.seventhScheduleForm.formNumber}
                              </span>
                            </div>
                            <div className="text-slate-600 font-mono text-[10px]">
                              Ref: {inspectionModalRecord.seventhScheduleForm.registrationRef || 'REG-MH-LMR-0551'} • Date: {inspectionModalRecord.seventhScheduleForm.verificationDate || '13 Sep 2026'}
                            </div>
                            <div className="text-slate-600 text-[10px]">
                              {inspectionModalRecord.seventhScheduleForm.remarks || 'Standard statutory verification approved'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-700 block bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                            Standard Trade Establishment Registration Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PILLAR: Violation Under Which Rule */}
                {(modalActiveTab === 'all' || modalActiveTab === 'violations') && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-rose-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Violation &amp; Statutory Legal Rules Evaluation
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                        LMPC Rules, 2011 &amp; Act 2009
                      </span>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                      {/* Applicable Rule banner */}
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">Primary Applicable Rule:</span>
                          <span className="text-slate-700 text-xs font-mono">
                            {inspectionModalRecord.applicableRule || 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rules 6, 7 & 8'}
                          </span>
                        </div>
                      </div>

                      {/* If Compliant: show comprehensive certificate of conformance */}
                      {isCompliant ? (
                        <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-bold text-emerald-950 text-sm">
                                All Mandatory Declarations Conforming to Statutory Standards
                              </h5>
                              <p className="text-xs text-emerald-800 mt-0.5">
                                This commodity packaging has passed optical, dimensional and metric verification. No infractions detected under the Legal Metrology Act, 2009.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-200/70 text-[11px] text-emerald-900">
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(1)(a): Manufacturer &amp; Packer Details Valid</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(1)(b): Generic Commodity Name Conforming</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(1)(c): Standard Metric Units (kg/L) Compliant</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(1)(d): Month &amp; Year of Packing Stated</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(1)(e): Maximum Retail Price Format Compliant</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(1)(f): Unit Sale Price (USP) Displayed</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 6(1)(n): Consumer Care Telephone &amp; Email Clear</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule 7 &amp; Table I: Font Height &amp; Contrast Approved</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* If Violations Detected: render infraction cards */
                        <div className="space-y-2.5">
                          {inspectionModalRecord.violations.map((violation, index) => (
                            <div 
                              key={index}
                              className="p-3.5 rounded-lg bg-rose-50/40 border border-rose-200 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                  <span className="font-bold text-rose-950 text-xs">{violation.title}</span>
                                </div>
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold shrink-0 border border-rose-200">
                                  {violation.rule}
                                </span>
                              </div>

                              <p className="text-[11.5px] text-slate-700 leading-relaxed pl-6">
                                {violation.description}
                              </p>

                              {(violation.measuredValue || violation.requiredValue) && (
                                <div className="ml-6 flex items-center gap-3 bg-white p-2 rounded border border-rose-100 text-[11px] font-mono">
                                  {violation.measuredValue && (
                                    <div>
                                      <span className="text-slate-500">Observed Value: </span>
                                      <span className="font-bold text-rose-700">{violation.measuredValue}</span>
                                    </div>
                                  )}
                                  {violation.requiredValue && (
                                    <div>
                                      <span className="text-slate-500">Mandatory Standard: </span>
                                      <span className="font-bold text-emerald-700">{violation.requiredValue}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="ml-6 pt-2 border-t border-rose-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px] text-slate-600">
                                <div>
                                  <strong className="text-slate-900">Statutory Clause: </strong> 
                                  <span>{violation.statutoryClause}</span>
                                </div>
                                <div>
                                  <strong className="text-rose-900">Legal Penalty: </strong> 
                                  <span className="text-rose-800 font-medium">{violation.penaltyClause}</span>
                                </div>
                              </div>
                            </div>
                          ))}
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
                      <span>Compliant Commodity — No Notice Required</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-800 font-semibold bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Infraction Notice Authorized under Section 36(1)</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
                  {/* Inspect Label Action */}
                  <button
                    onClick={() => {
                      onOpenEvidence(inspectionModalRecord);
                      setInspectionModalRecord(null);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>Inspect Label</span>
                  </button>

                  {/* Generate Form VI Notice Action (Only when violations exist) */}
                  {!isCompliant && (inspectionModalRecord.status === 'FAIL' || inspectionModalRecord.status === 'NOTICE_ISSUED' || inspectionModalRecord.violations.length > 0) && (
                    <button
                      onClick={() => {
                        onOpenNotice(inspectionModalRecord);
                        setInspectionModalRecord(null);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Generate Form VI Notice</span>
                    </button>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => setInspectionModalRecord(null)}
                    className="px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Citizen Complaint Lead Popup Modal */}
      {complaintModalLead && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setComplaintModalLead(null)}
        >
          <div 
            className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-rose-50/50 flex items-start justify-between">
              <div className="space-y-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                  <span className="font-bold text-rose-900 uppercase tracking-wider text-[10px]">
                    Citizen Complaint Lead
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    complaintModalLead.status === 'INSPECTION_ORDERED'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {complaintModalLead.status === 'INSPECTION_ORDERED' ? 'INSPECTION ORDERED' : 'PENDING DISPATCH'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {complaintModalLead.shopName}
                </h3>
                <div className="text-xs text-slate-600 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{complaintModalLead.address}</span>
                </div>
              </div>

              <button
                onClick={() => setComplaintModalLead(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
              <div className="bg-slate-50 rounded-md p-3 border border-slate-200/70 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Grievance Category:</span>
                  <span className="font-bold text-rose-700 text-right">{complaintModalLead.complaintType}</span>
                </div>
                {complaintModalLead.reportedProduct && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reported Commodity:</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                      {complaintModalLead.reportedProduct}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className="font-semibold text-slate-700">{complaintModalLead.source}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-md border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 block">Consumer Grievance Narrative:</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100 italic">
                  "{complaintModalLead.description}"
                </p>
              </div>

              {complaintModalLead.previousViolationsFound && complaintModalLead.previousViolationsFound > 0 ? (
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Prior Enforcement Warning:</strong> This location has {complaintModalLead.previousViolationsFound} previous packaging offenses logged. Priority Squad Alpha deployment recommended.
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50">
              {complaintModalLead.status === 'RESOLVED' ? (
                <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-center flex items-center justify-center gap-1.5 text-xs">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Case Solved &amp; Closed by Area Inspector</span>
                </div>
              ) : complaintModalLead.status === 'INSPECTION_ORDERED' || complaintModalLead.status === 'IN_PROGRESS' ? (
                <div className="p-2.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-center flex items-center justify-center gap-1.5 text-xs">
                  <Check className="w-4 h-4 text-blue-700" />
                  <span>Inspection Squad Dispatched (Field Order #{complaintModalLead.noticeDirectiveNo || `ORD-${complaintModalLead.id.slice(-4)}`})</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (onDispatchInspector) {
                      onDispatchInspector(complaintModalLead);
                    }
                    setComplaintModalLead(null);
                  }}
                  className="w-full py-2.5 px-3 rounded-md bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Statutory Notice to Area Inspector</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Raid / Inspection Dispatch Confirmation Modal */}
      {dispatchModalComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  1-Click Dispatch: Statutory Field Squad Order
                </h3>
              </div>
              <button
                onClick={() => setDispatchModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lead Brief Information */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Merchant:</span>
                  <strong className="text-slate-900">{dispatchModalComplaint.shopName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="text-right text-slate-700 max-w-[240px] truncate">{dispatchModalComplaint.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <span className="font-mono text-slate-700">
                    {dispatchModalComplaint.coordinates 
                      ? `${dispatchModalComplaint.coordinates.lat.toFixed(4)}° N, ${dispatchModalComplaint.coordinates.lng.toFixed(4)}° E` 
                      : 'No GPS coordinates available'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Complaint Lead:</span>
                  <span className="font-bold text-rose-700">{dispatchModalComplaint.complaintType}</span>
                </div>
              </div>

              {dispatchModalComplaint.previousViolationsFound && dispatchModalComplaint.previousViolationsFound > 0 ? (
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Prior Enforcement Warning:</strong> This location has {dispatchModalComplaint.previousViolationsFound} previous packaging offenses logged. Priority Squad Alpha deployment recommended.
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  No previous violations found. Routine lead verification squad will be assigned.
                </div>
              )}

              <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                Authorizing this dispatch will register an official inspection mission in the assigned officer's regulatory log and update the citizen grievance ticket to <strong>INSPECTION_ORDERED</strong>.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setDispatchModalComplaint(null)}
                className="py-1.5 px-3 rounded text-slate-600 hover:bg-slate-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDispatchInspector) {
                    onDispatchInspector(dispatchModalComplaint);
                  }
                  setDispatchModalComplaint(null);
                }}
                className="py-2 px-4 rounded bg-rose-700 hover:bg-rose-600 text-white font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Squad Dispatch</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
