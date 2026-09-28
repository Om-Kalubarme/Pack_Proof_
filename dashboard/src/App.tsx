import React, { useState, useMemo, useEffect } from 'react';
import { fetchAssignments, assignCase } from './api';
import { 
  InspectionRecord, 
  FilterState, 
  SeverityLevel,
  EnforcementAlert,
  CitizenComplaint,
  OfficerProfile,
  InspectorProfile
} from './types/compliance';
import { 
  MOCK_INSPECTIONS, 
  MOCK_ENFORCEMENT_ALERTS,
  MOCK_CITIZEN_COMPLAINTS,
  SEED_CITIZEN_COMPLAINTS
} from './data/mockInspections';
import { Sidebar, NavigationTarget } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewMetrics } from './components/kpi/OverviewMetrics';
import { InspectionMapSection } from './components/map/InspectionMapSection';
import { FilterToolbar } from './components/filters/FilterToolbar';
import { InspectionTable } from './components/table/InspectionTable';
import { ComplianceBreakdown } from './components/compliance/ComplianceBreakdown';
import { EcommerceAuditPortal } from './components/ecommerce/EcommerceAuditPortal';
import { BulkActionBar } from './components/table/BulkActionBar';
import { EvidenceModal } from './components/evidence/EvidenceModal';
import { NoticeGeneratorModal } from './components/evidence/NoticeGeneratorModal';
import { LiveScanModal } from './components/scanner/LiveScanModal';
import { RulesReferenceModal } from './components/reference/RulesReferenceModal';
import { OfficerProfileDrawer } from './components/profile/OfficerProfileDrawer';
import { CitizenComplaintsPortal } from './components/complaints/CitizenComplaintsPortal';
import { SendNoticeToInspectorModal } from './components/complaints/SendNoticeToInspectorModal';
import { SolveComplaintCaseModal } from './components/complaints/SolveComplaintCaseModal';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { InspectorRegisterPage } from './components/auth/InspectorRegisterPage';
import { exportInspectionsToCSV } from './utils/exportUtils';
import { Megaphone, CheckCircle2, Send, Bell, X } from 'lucide-react';

const DEFAULT_OFFICER: OfficerProfile = {
  id: '',
  name: '',
  designation: 'Legal Metrology Officer',
  zone: 'Enforcement Division'
};

export function App() {
  // Authentication State (defaults to false so the user can see and test the Login page)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('officer_authenticated') === 'true';
  });

  // Auth View State: 'login' or 'register'
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [registrationNotice, setRegistrationNotice] = useState<string>('');
  const [initialLoginUser, setInitialLoginUser] = useState<string>('LMO-MH-2024');

  // Active Officer Profile
  const [currentOfficer, setCurrentOfficer] = useState<OfficerProfile>(() => {
    try {
      const saved = localStorage.getItem('officer_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Purge legacy dummy officer profile
        if (parsed.id === 'LMO-MH-4019' || parsed.name?.includes('Rajesh Sharma')) {
          return DEFAULT_OFFICER;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_OFFICER;
  });

  // Primary Records & Alerts State
  const [records, setRecords] = useState<InspectionRecord[]>(MOCK_INSPECTIONS);
  const [alerts, setAlerts] = useState<EnforcementAlert[]>(MOCK_ENFORCEMENT_ALERTS);

  // Poll backend for real cases
  useEffect(() => {
    const fetchBackendCases = async () => {
      try {
        const response = await fetchAssignments();
        if (response?.success && response.cases) {
          const apiRecords = response.cases.map((c: any) => ({
            id: c.case_id,
            timestamp: c.deadline_timestamp,
            productName: c.business_name,
            brand: c.raw_data?.ocr_text?.brandName || 'TBD',
            manufacturer: c.raw_data?.ocr_text?.address || 'TBD',
            batchNo: c.raw_data?.ocr_text?.batchMfgDate || 'N/A',
            category: 'Food & Beverages' as any,
            zone: 'Central',
            retailerName: c.business_name,
            retailerLocation: c.address,
            netQuantity: c.raw_data?.ocr_text?.net_quantity_text || c.raw_data?.declared_quantity || 'TBD',
            mrpDeclared: c.raw_data?.ocr_text?.mrp_text || 'TBD',
            status: c.status === 'VIOLATION_FLAGGED' ? 'FAIL' : (c.status === 'ASSIGNED' ? 'PENDING' : 'PASS'),
            severity: 'HIGH' as any,
            violations: (c.evaluation?.all_violations || []).map((v: string, i: number) => ({
              code: `V${i+1}`,
              rule: v.split(':')[0] || 'Unknown Rule',
              title: 'Statutory Violation',
              severity: 'HIGH',
              description: v,
              statutoryClause: v.split(':')[0] || 'Unknown',
              penaltyClause: 'Under LMPC Rules 2011'
            })),
            imageSrc: c.raw_data?.image_base64 ? `data:image/jpeg;base64,${c.raw_data.image_base64.replace(/\\s/g, '')}` : 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80',
            boundingBoxes: c.raw_data?.boxes ? c.raw_data.boxes.map((b: any, i: number) => ({
              id: `box-${i}`,
              label: b.label || 'Detection',
              x: (b.box[0] / 640) * 100, // Assuming 640x640 YOLO model size for percentage
              y: (b.box[1] / 640) * 100,
              width: ((b.box[2] - b.box[0]) / 640) * 100,
              height: ((b.box[3] - b.box[1]) / 640) * 100,
              rule: 'Scanned',
              status: 'PASS',
              detectedText: b.text || 'N/A',
              requiredStandard: 'N/A',
              description: 'OCR Detection'
            })) : [],
            confidenceScore: 0.95,
            inspectorName: c.assigned_inspector_id,
            inspectorId: c.assigned_inspector_id,
            isOnlineAudit: false
          }));
          
          if (apiRecords.length > 0) {
            setRecords(prev => {
              const prevIds = new Set(prev.map(p => p.id));
              const newRecords = apiRecords.filter(r => !prevIds.has(r.id));
              return [...newRecords, ...prev];
            });
          }
        }
      } catch (err) {
        console.error("Backend integration error:", err);
      }
    };
    fetchBackendCases();
    const interval = setInterval(fetchBackendCases, 5000);
    return () => clearInterval(interval);
  }, []);

  // Layout & Navigation State
  const [activeSection, setActiveSection] = useState<NavigationTarget>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Selected Record on Map
  const [selectedRecordForMap, setSelectedRecordForMap] = useState<InspectionRecord | null>(null);
  // Citizen Complaints State & Selected Complaint on Map
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(() => {
    try {
      const saved = localStorage.getItem('officer_citizen_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some(c => c.status === 'RESOLVED') && parsed[0]?.complainantName) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return SEED_CITIZEN_COMPLAINTS;
  });
  const [selectedComplaintForMap, setSelectedComplaintForMap] = useState<CitizenComplaint | null>(null);

  // Registered Inspectors from Local Storage
  const [registeredInspectors, setRegisteredInspectors] = useState<InspectorProfile[]>(() => {
    try {
      const saved = localStorage.getItem('registered_inspectors');
      if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'INSP-MH-4105',
        name: 'Inspector Amit S. Patil',
        designation: 'Legal Metrology Inspector',
        zone: 'Division 04 - Mumbai Central Zone',
        email: 'insp.patil@legalmetrology.gov.in',
        phone: '+91 98220 55198',
        registeredAt: '2026-09-10T10:00:00Z'
      }
    ];
  });

  // Filter & Search State
  const [filterState, setFilterState] = useState<FilterState>({
    timeFilter: 'monthly',
    category: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    inspector: 'ALL',
    searchQuery: '',
    sortBy: 'date_desc'
  });

  // Modal States
  const [selectedRecordForEvidence, setSelectedRecordForEvidence] = useState<InspectionRecord | null>(null);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  const [selectedRecordForNotice, setSelectedRecordForNotice] = useState<InspectionRecord | null>(null);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  const [liveScanModalOpen, setLiveScanModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Citizen Complaint Statutory Directive & Case Resolution Modals
  const [selectedComplaintForNotice, setSelectedComplaintForNotice] = useState<CitizenComplaint | null>(null);
  const [selectedComplaintForSolve, setSelectedComplaintForSolve] = useState<CitizenComplaint | null>(null);

  // Real-Time Notification Banner State
  const [activeNotification, setActiveNotification] = useState<{
    title: string;
    message: string;
    type: 'DISPATCH' | 'SOLVED' | 'INFO';
  } | null>(null);

  // Multi-Selection State for Bulk Actions
  const [selectedRecords, setSelectedRecords] = useState<InspectionRecord[]>([]);

  // Unique categories list
  const categories = useMemo(() => {
    return Array.from(new Set(records.map(r => r.category)));
  }, [records]);

  // Unique officers / inspectors list
  const inspectors = useMemo(() => {
    return Array.from(new Set(records.map(r => r.inspectorName)));
  }, [records]);

  // Filtering & Sorting Engine
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    // 1. Time-Based Filtering
    const now = new Date('2026-09-16T13:30:00Z').getTime();
    result = result.filter(r => {
      const recordTime = new Date(r.timestamp).getTime();
      const diffHours = (now - recordTime) / (1000 * 60 * 60);

      switch (filterState.timeFilter) {
        case 'today':
          return diffHours <= 24;
        case 'weekly':
          return diffHours <= 168;
        case 'monthly':
          return diffHours <= 720;
        case 'custom':
          if (filterState.startDate && filterState.endDate) {
            const start = new Date(filterState.startDate).getTime();
            const end = new Date(filterState.endDate).getTime() + 86400000;
            return recordTime >= start && recordTime <= end;
          }
          return true;
        default:
          return true;
      }
    });

    // 2. Category Filter
    if (filterState.category !== 'ALL') {
      result = result.filter(r => r.category === filterState.category);
    }

    // 3. Severity Filter
    if (filterState.severity !== 'ALL') {
      result = result.filter(r => r.severity === filterState.severity);
    }

    // 4. Status Filter
    if (filterState.status !== 'ALL') {
      result = result.filter(r => r.status === filterState.status);
    }

    // 5. Officer / Inspector Filter
    if (filterState.inspector && filterState.inspector !== 'ALL') {
      result = result.filter(r => r.inspectorName === filterState.inspector || r.inspectorId === filterState.inspector);
    }

    // 5. Search Query
    if (filterState.searchQuery.trim() !== '') {
      const q = filterState.searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.productName.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.retailerName.toLowerCase().includes(q) ||
        r.retailerLocation.toLowerCase().includes(q) ||
        r.inspectorName.toLowerCase().includes(q) ||
        r.batchNo.toLowerCase().includes(q) ||
        r.violations.some(v => v.title.toLowerCase().includes(q) || v.rule.toLowerCase().includes(q))
      );
    }

    // 6. Sorting Engine
    const severityWeight: Record<SeverityLevel, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
      COMPLIANT: 0
    };

    result.sort((a, b) => {
      switch (filterState.sortBy) {
        case 'date_desc':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'date_asc':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'severity_desc':
          return severityWeight[b.severity] - severityWeight[a.severity];
        case 'violations_desc':
          return b.violations.length - a.violations.length;
        case 'product_asc':
          return a.productName.localeCompare(b.productName);
        default:
          return 0;
      }
    });

    return result;
  }, [records, filterState]);

  // Handlers
  const handleNavigate = (target: NavigationTarget) => {
    if (target === 'violations') {
      setFilterState(prev => ({ ...prev, status: 'FAIL' }));
      setActiveSection('inspections');
    } else if (target === 'history') {
      setActiveSection('inspections');
    } else if (target === 'reports') {
      handleBatchExportCSV();
    } else {
      setActiveSection(target);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilterState({
      timeFilter: 'monthly',
      category: 'ALL',
      severity: 'ALL',
      status: 'ALL',
      inspector: 'ALL',
      searchQuery: '',
      sortBy: 'date_desc'
    });
  };

  const handleSelectRecordOnMap = (record: InspectionRecord) => {
    setSelectedRecordForMap(record);
    setSelectedComplaintForMap(null);
    if (activeSection !== 'overview' && activeSection !== 'map') {
      setActiveSection('overview');
    }
    setTimeout(() => {
      const mapSection = document.getElementById('section-map');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const handleSelectComplaintOnMap = (complaint: CitizenComplaint | null) => {
    setSelectedComplaintForMap(complaint);
    if (complaint) {
      setSelectedRecordForMap(null);
    }
    if (activeSection !== 'overview' && activeSection !== 'map') {
      setActiveSection('overview');
    }
    setTimeout(() => {
      const mapSection = document.getElementById('section-map');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const handleDispatchInspector = (complaint: CitizenComplaint) => {
    setSelectedComplaintForNotice(complaint);
  };

  const handleConfirmDispatchNotice = (directive: {
    complaintId: string;
    inspectorName: string;
    inspectorId: string;
    areaCircle: string;
    directiveNo: string;
    priority: 'URGENT' | 'HIGH' | 'ROUTINE';
    specialInstructions: string;
    officerName: string;
    officerDesignation: string;
    targetMerchant: string;
    targetAddress: string;
  }) => {
    const timestamp = new Date().toISOString();

    // 1. Update Citizen Complaint in state & local storage
    setComplaints(prev => {
      const updated = prev.map(c => {
        if (c.id === directive.complaintId) {
          return {
            ...c,
            status: 'INSPECTION_ORDERED' as const,
            assignedInspectorName: directive.inspectorName,
            assignedInspectorId: directive.inspectorId,
            assignedAreaCircle: directive.areaCircle,
            noticeDirectiveNo: directive.directiveNo,
            noticeDispatchedAt: timestamp,
            directivePriority: directive.priority,
            specialInstructions: directive.specialInstructions
          };
        }
        return c;
      });
      try {
        localStorage.setItem('officer_citizen_complaints', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (selectedComplaintForMap?.id === directive.complaintId) {
      setSelectedComplaintForMap(prev => prev ? { 
        ...prev, 
        status: 'INSPECTION_ORDERED',
        assignedInspectorName: directive.inspectorName,
        assignedInspectorId: directive.inspectorId,
        noticeDirectiveNo: directive.directiveNo
      } : null);
    }

    // 2. Automatically register an official Inspection Case in records assigned to the Inspector
    const targetComp = complaints.find(c => c.id === directive.complaintId);
    const newCaseId = `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInspectionRecord: InspectionRecord = {
      id: newCaseId,
      timestamp: timestamp,
      productName: targetComp?.reportedProduct || 'Pre-Packaged Goods under Verification',
      brand: 'Under Field Audit',
      manufacturer: targetComp?.shopName || directive.targetMerchant,
      batchNo: `BATCH-${Math.floor(100 + Math.random() * 900)}`,
      category: targetComp?.complaintType === 'Overcharging above MRP' ? 'Food & Beverages' : 'Electronics & Devices',
      zone: directive.areaCircle,
      retailerName: directive.targetMerchant,
      retailerLocation: directive.targetAddress,
      netQuantity: 'Under Verification',
      mrpDeclared: 'Under Verification',
      status: 'IN_PROGRESS',
      severity: directive.priority === 'URGENT' ? 'CRITICAL' : 'HIGH',
      violations: [
        {
          code: targetComp?.complaintType === 'Overcharging above MRP' ? 'OVERCHARGE_MRP' : 'DUAL_MRP_01',
          rule: 'Section 18 / Rule 6(10A)',
          title: targetComp?.complaintType || 'Packaging Infraction',
          severity: directive.priority === 'URGENT' ? 'CRITICAL' : 'HIGH',
          description: targetComp?.description || directive.specialInstructions,
          statutoryClause: 'Section 15(1) & 18, Legal Metrology Act, 2009',
          penaltyClause: 'Section 36 & 48, Legal Metrology Act, 2009'
        }
      ],
      boundingBoxes: [],
      imageSrc: targetComp?.photoEvidence || '/placeholder_evidence.svg',
      inspectorName: directive.inspectorName,
      inspectorId: directive.inspectorId,
      confidenceScore: 0.95,
      complianceResult: 'Under Investigation',
      district: targetComp?.district,
      state: targetComp?.state,
      pincode: targetComp?.pincode,
      coordinates: targetComp?.coordinates,
      originComplaintId: directive.complaintId
    };

    setRecords(prev => [newInspectionRecord, ...prev]);

    // 3. Add to Enforcement Alerts
    const newAlert: EnforcementAlert = {
      id: `ALT-DIR-${Math.floor(1000 + Math.random() * 9000)}`,
      inspectionId: newCaseId,
      retailerName: directive.targetMerchant,
      location: directive.targetAddress,
      alertType: 'CRITICAL_NOTICE',
      title: `Directive Dispatched: ${directive.directiveNo}`,
      description: `Statutory notice dispatched to ${directive.inspectorName} (${directive.areaCircle}) for spot inspection.`,
      deadline: directive.priority === 'URGENT' ? '24 Hours' : directive.priority === 'HIGH' ? '48 Hours' : '72 Hours',
      statutoryClause: 'Section 15(1) & Section 18, LMA 2009',
      actionLabel: 'Track Field Squad',
      severity: 'CRITICAL'
    };
    setAlerts(prev => [newAlert, ...prev]);

    // 4. Show Live Notification Banner
    setActiveNotification({
      title: 'Statutory Notice Dispatched!',
      message: `Directive ${directive.directiveNo} transmitted to ${directive.inspectorName} (${directive.areaCircle}). Spot inspection ordered.`,
      type: 'DISPATCH'
    });
    setTimeout(() => {
      setActiveNotification(null);
    }, 5500);
  };

  const handleConfirmSolveCase = (resolution: {
    complaintId: string;
    actionTaken: 'COMPOUNDED' | 'NOTICE_ISSUED' | 'MERCHANT_COMPLIED' | 'DISMISSED';
    compoundingAmount?: number;
    seizureMemoNo?: string;
    resolutionNotes: string;
    inspectionResult?: string;
    complianceStatus?: 'PASS' | 'FAIL' | 'NOTICE_ISSUED' | 'COMPOUNDED';
    violation?: string;
    severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'COMPLIANT';
  }) => {
    const timestamp = new Date().toISOString();

    const targetComplaint = complaints.find(c => c.id === resolution.complaintId);
    const complainantName = targetComplaint?.complainantName || 'Citizen';
    const complainantPhone = targetComplaint?.complainantPhone || '+91 98200 XXXXX';
    const notificationMsg = `Dear ${complainantName}, your complaint #${resolution.complaintId} regarding ${targetComplaint?.shopName || 'retailer'} has been investigated by the Legal Metrology Area Inspector and resolved. Action taken: ${resolution.actionTaken}. Inspection report filed.`;

    setComplaints(prev => {
      const updated = prev.map(c => {
        if (c.id === resolution.complaintId) {
          return {
            ...c,
            status: 'RESOLVED' as const,
            actionTaken: resolution.actionTaken,
            compoundingAmount: resolution.compoundingAmount,
            seizureMemoNo: resolution.seizureMemoNo,
            resolutionNotes: resolution.resolutionNotes,
            inspectionResult: resolution.inspectionResult,
            complianceStatus: resolution.complianceStatus,
            violation: resolution.violation,
            severity: resolution.severity,
            resolvedAt: timestamp,
            citizenNotificationSent: true,
            citizenNotificationMessage: notificationMsg,
            citizenNotificationSentAt: timestamp
          };
        }
        return c;
      });
      try {
        localStorage.setItem('officer_citizen_complaints', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setRecords(prev => prev.map(r => {
      if (r.originComplaintId === resolution.complaintId || r.id === targetComplaint?.inspectionCaseId) {
        return {
          ...r,
          status: resolution.actionTaken === 'COMPOUNDED' ? 'COMPOUNDED' : resolution.actionTaken === 'NOTICE_ISSUED' ? 'NOTICE_ISSUED' : 'PASS',
          complianceResult: resolution.actionTaken === 'COMPOUNDED' ? 'Notice Issued' : resolution.actionTaken === 'NOTICE_ISSUED' ? 'Notice Issued' : 'Compliant',
          notes: resolution.resolutionNotes,
          severity: resolution.severity || r.severity
        };
      }
      return r;
    }));

    // Requirement 7: Citizen Notification Confirmation Banner
    setActiveNotification({
      title: 'Case Resolved & Citizen Notified',
      message: `Case #${resolution.complaintId} resolved by Area Inspector (${resolution.actionTaken}). Resolution SMS notification sent to ${complainantName} (${complainantPhone}).`,
      type: 'SOLVED'
    });
    setTimeout(() => {
      setActiveNotification(null);
    }, 6000);
  };

  const handleLodgeComplaint = (newComplaint: CitizenComplaint) => {
    setComplaints(prev => {
      const updated = [newComplaint, ...prev];
      try {
        localStorage.setItem('officer_citizen_complaints', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActiveNotification({
      title: 'New Citizen Grievance Received',
      message: `Ticket #${newComplaint.id} logged for ${newComplaint.shopName} (${newComplaint.district}). Notice dispatch pending.`,
      type: 'INFO'
    });
    setTimeout(() => {
      setActiveNotification(null);
    }, 5000);
  };

  const handleOpenEvidence = (record: InspectionRecord) => {
    setSelectedRecordForEvidence(record);
    setEvidenceModalOpen(true);
  };

  const handleOpenNotice = (record: InspectionRecord) => {
    setSelectedRecordForNotice(record);
    setNoticeModalOpen(true);
  };

  const handleOpenNoticeById = (recordId: string) => {
    const rec = records.find(r => r.id === recordId);
    if (rec) {
      handleOpenNotice(rec);
    }
  };

  const handleSelectAlertRecord = (recordId: string) => {
    const rec = records.find(r => r.id === recordId);
    if (rec) {
      handleSelectRecordOnMap(rec);
    }
  };

  const handleNoticeDispatched = (recordId: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          status: 'NOTICE_ISSUED',
          complianceResult: 'Notice Issued',
          noticeDate: new Date().toISOString().slice(0, 10)
        };
      }
      return r;
    }));

    // Dismiss corresponding alert
    setAlerts(prev => prev.filter(a => a.inspectionId !== recordId));
  };

  const handleStatusUpdate = (recordId: string, newStatus: any) => {
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          status: newStatus,
          severity: newStatus === 'PASS' ? 'COMPLIANT' : r.severity,
          complianceResult: newStatus === 'PASS' ? 'Compliant' : 'Violation Detected',
          violations: newStatus === 'PASS' ? [] : r.violations
        };
      }
      return r;
    }));
  };

  const handleNewScanCompleted = (newRecord: InspectionRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    setSelectedRecordForMap(newRecord);
  };

  const handleToggleSelectRecord = (record: InspectionRecord) => {
    setSelectedRecords(prev => {
      const exists = prev.some(r => r.id === record.id);
      if (exists) {
        return prev.filter(r => r.id !== record.id);
      } else {
        return [...prev, record];
      }
    });
  };

  const handleSelectAllVisible = (visibleRecords: InspectionRecord[]) => {
    setSelectedRecords(visibleRecords);
  };

  const handleBatchExportCSV = () => {
    const listToExport = selectedRecords.length > 0 ? selectedRecords : filteredAndSortedRecords;
    exportInspectionsToCSV(listToExport, `legal_metrology_inspections_${filterState.timeFilter}.csv`);
  };

  const handleBatchIssueNotices = () => {
    const failingRecords = selectedRecords.filter(r => r.status === 'FAIL');
    failingRecords.forEach(rec => {
      handleNoticeDispatched(rec.id);
    });
    setSelectedRecords([]);
  };

  const compliantCount = records.filter(r => r.status === 'PASS').length;
  const violationCount = records.filter(r => r.status === 'FAIL' || r.status === 'NOTICE_ISSUED').length;

  const handleLoginSuccess = (officer: OfficerProfile) => {
    setCurrentOfficer(officer);
    setIsAuthenticated(true);
    localStorage.setItem('officer_authenticated', 'true');
    localStorage.setItem('officer_profile', JSON.stringify(officer));
    setActiveSection('overview');
  };

  const handleRegisterSuccess = (officer: OfficerProfile) => {
    setCurrentOfficer(officer);
    // Requirement 1: Officer registers -> then logs in -> after login, redirected to Homepage / Overview
    setRegistrationNotice(`Registration successful for ${officer.name} (${officer.id}). Please enter your credentials to log in.`);
    setInitialLoginUser(officer.id);
    setAuthView('login');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('officer_authenticated');
    setAuthView('login');
    setActiveSection('overview');
  };

  // Render Login or Registration Page if officer is not authenticated
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        onNavigateToRegister={() => setAuthView('register')}
        registrationSuccessMessage={registrationNotice}
        initialUsername={initialLoginUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Top Official Header - Connected across the entire top */}
      <Header
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        onOpenLiveScan={() => setLiveScanModalOpen(true)}
        onExportBulkCSV={handleBatchExportCSV}
        onOpenRulesReference={() => setRulesModalOpen(true)}
        searchQuery={filterState.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
        alerts={alerts}
        onSelectAlert={(alert) => handleSelectAlertRecord(alert.inspectionId)}
        onLogout={handleLogout}
        officer={currentOfficer}
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
      />

      {/* Main Connected Body (Sidebar + Content) */}
      <div className="flex-1 flex min-w-0">
        
        {/* Left Sidebar Navigation - Connected below navbar */}
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onOpenLiveScan={() => setLiveScanModalOpen(true)}
          onOpenRulesReference={() => setRulesModalOpen(true)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          totalAlertsCount={alerts.length}
          totalRecordsCount={records.length}
          pendingComplaintsCount={complaints.filter(c => c.status === 'PENDING_DISPATCH').length}
          onLogout={handleLogout}
          officer={currentOfficer}
        />

        {/* Dashboard Main Content Column */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
          
          {/* 1. HOME PAGE: ONLY Overview Metrics + Inspection Map */}
          {activeSection === 'overview' && (
            <div className="space-y-7">
              {/* Citizen Grievance Pending Action Alert Banner */}
              {complaints.filter(c => c.status === 'PENDING_DISPATCH').length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{complaints.filter(c => c.status === 'PENDING_DISPATCH').length} Citizen Complaints Awaiting Area Inspector Notice</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[10px] uppercase font-bold tracking-wider">
                          Action Required
                        </span>
                      </div>
                      <p className="text-xs text-rose-100 mt-0.5">
                        Consumer grievances received from National Consumer Helpline (1915) requiring statutory spot inspection directives under Section 15(1).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate('citizen-complaints')}
                    className="px-4 py-2 rounded-lg bg-white text-rose-800 hover:bg-rose-50 font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                  >
                    Review &amp; Dispatch Notices &rarr;
                  </button>
                </div>
              )}

              <div id="section-overview">
                <OverviewMetrics records={records} />
              </div>

              <div id="section-map">
                <InspectionMapSection
                  records={records}
                  complaints={complaints}
                  selectedRecord={selectedRecordForMap}
                  selectedComplaint={selectedComplaintForMap}
                  onSelectRecord={handleSelectRecordOnMap}
                  onSelectComplaint={handleSelectComplaintOnMap}
                  onOpenEvidence={handleOpenEvidence}
                  onOpenNotice={handleOpenNotice}
                  onDispatchInspector={handleDispatchInspector}
                />
              </div>
            </div>
          )}

          {/* 2. INSPECTION CASES PAGE */}
          {activeSection === 'inspections' && (
            <div id="section-inspections" className="space-y-4">
              <FilterToolbar
                filterState={filterState}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                categories={categories}
                inspectors={inspectors}
                totalFilteredCount={filteredAndSortedRecords.length}
                totalAllCount={records.length}
              />

              <InspectionTable
                records={filteredAndSortedRecords}
                onOpenEvidence={handleOpenEvidence}
                onOpenNotice={handleOpenNotice}
                selectedRecords={selectedRecords}
                onToggleSelectRecord={handleToggleSelectRecord}
                onSelectAllVisible={handleSelectAllVisible}
                onSelectRecord={handleSelectRecordOnMap}
                activeRecordId={selectedRecordForMap?.id}
              />
            </div>
          )}

          {/* 3. INSPECTION MAP STANDALONE PAGE */}
          {activeSection === 'map' && (
            <div id="section-map">
              <InspectionMapSection
                records={records}
                complaints={complaints}
                selectedRecord={selectedRecordForMap}
                selectedComplaint={selectedComplaintForMap}
                onSelectRecord={handleSelectRecordOnMap}
                onSelectComplaint={handleSelectComplaintOnMap}
                onOpenEvidence={handleOpenEvidence}
                onOpenNotice={handleOpenNotice}
                onDispatchInspector={handleDispatchInspector}
              />
            </div>
          )}

          {/* 3. CITIZEN COMPLAINTS & AREA INSPECTOR DISPATCH PORTAL */}
          {activeSection === 'citizen-complaints' && (
            <div id="section-citizen-complaints">
              <CitizenComplaintsPortal
                complaints={complaints}
                officer={currentOfficer}
                registeredInspectors={registeredInspectors}
                onDispatchNotice={handleConfirmDispatchNotice}
                onSolveCase={handleConfirmSolveCase}
                onLodgeComplaint={handleLodgeComplaint}
                onViewOnMap={(c) => {
                  setSelectedComplaintForMap(c);
                  setActiveSection('map');
                }}
              />
            </div>
          )}

          {/* 4. E-COMMERCE AUDIT PAGE */}
          {activeSection === 'ecommerce' && (
            <div id="section-ecommerce">
              <EcommerceAuditPortal />
            </div>
          )}

          {/* 5. COMPLIANCE ANALYSIS PAGE */}
          {activeSection === 'compliance' && (
            <div id="section-compliance">
              <ComplianceBreakdown
                totalInspections={records.length}
                compliantCount={compliantCount}
                violationCount={violationCount}
                alerts={alerts}
                activeTab="compliance"
                onTabChange={(tab) => handleNavigate(tab)}
                onOpenNotice={handleOpenNoticeById}
                onSelectAlertRecord={handleSelectAlertRecord}
                onSelectCategoryFilter={(category) => {
                  handleFilterChange({ category });
                  handleNavigate('inspections');
                }}
                onViewMoreCompliance={() => handleNavigate('inspections')}
                onViewMoreViolations={() => {
                  handleFilterChange({ status: 'FAIL' });
                  handleNavigate('inspections');
                }}
              />
            </div>
          )}

          {/* 6. VIOLATION ALERTS PAGE */}
          {activeSection === 'alerts' && (
            <div id="section-alerts">
              <ComplianceBreakdown
                totalInspections={records.length}
                compliantCount={compliantCount}
                violationCount={violationCount}
                alerts={alerts}
                activeTab="alerts"
                onTabChange={(tab) => handleNavigate(tab)}
                onOpenNotice={handleOpenNoticeById}
                onSelectAlertRecord={handleSelectAlertRecord}
                onSelectCategoryFilter={(category) => {
                  handleFilterChange({ category });
                  handleNavigate('inspections');
                }}
                onViewMoreCompliance={() => handleNavigate('inspections')}
                onViewMoreViolations={() => {
                  handleFilterChange({ status: 'FAIL' });
                  handleNavigate('inspections');
                }}
              />
            </div>
          )}

          {/* 7. INSPECTOR REGISTRATION PAGE */}
          {activeSection === 'inspector-registration' && (
            <div id="section-inspector-registration">
              <InspectorRegisterPage 
                onBackToDashboard={() => handleNavigate('overview')}
              />
            </div>
          )}

        </main>

        {/* Floating Multi-Row Bulk Action Bar */}
        <BulkActionBar
          selectedRecords={selectedRecords}
          onClearSelection={() => setSelectedRecords([])}
          onBatchExportCSV={handleBatchExportCSV}
          onBatchIssueNotices={handleBatchIssueNotices}
        />

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              Legal Metrology (Packaged Commodities) Rules, 2011 Enforcement Platform
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Department of Consumer Affairs • Govt. of India • Western Division Terminal
            </div>
          </div>
        </footer>

      </div>
    </div>

      {/* Modals and Drawers (All preserved) */}

      {/* Forensic Evidence Drawer */}
      <EvidenceModal
        record={selectedRecordForEvidence}
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        onOpenNoticeGenerator={(record) => {
          setEvidenceModalOpen(false);
          setSelectedRecordForNotice(record);
          setNoticeModalOpen(true);
        }}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Form VI Statutory Notice Generator Modal */}
      <NoticeGeneratorModal
        record={selectedRecordForNotice}
        isOpen={noticeModalOpen}
        onClose={() => setNoticeModalOpen(false)}
        onNoticeDispatched={handleNoticeDispatched}
      />

      {/* Live Field Optical Scan Simulation Modal */}
      <LiveScanModal
        isOpen={liveScanModalOpen}
        onClose={() => setLiveScanModalOpen(false)}
        onNewScanCompleted={handleNewScanCompleted}
      />

      {/* LMPC Rules 2011 Reference Modal */}
      <RulesReferenceModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />

      {/* Officer Regulatory Dossier / Right Profile Sidebar Drawer */}
      <OfficerProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        officer={currentOfficer}
        onUpdateOfficer={(updated) => {
          setCurrentOfficer(updated);
          try {
            localStorage.setItem('officer_profile', JSON.stringify(updated));
          } catch {
            // ignore
          }
        }}
        onLogout={handleLogout}
        totalInspectionsCount={records.length}
        totalNoticesCount={records.filter(r => r.status === 'NOTICE_ISSUED').length}
      />

      {/* Citizen Complaint Statutory Directive Modal (Form V-A) */}
      <SendNoticeToInspectorModal
        isOpen={!!selectedComplaintForNotice}
        onClose={() => setSelectedComplaintForNotice(null)}
        complaint={selectedComplaintForNotice}
        officer={currentOfficer}
        registeredInspectors={registeredInspectors}
        onDispatchNotice={handleConfirmDispatchNotice}
      />

      {/* Inspector Solves Case & Records Outcome Modal */}
      <SolveComplaintCaseModal
        isOpen={!!selectedComplaintForSolve}
        onClose={() => setSelectedComplaintForSolve(null)}
        complaint={selectedComplaintForSolve}
        onSolveCase={handleConfirmSolveCase}
      />

      {/* Live Toast Notification Banner */}
      {activeNotification && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-200">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 ${
            activeNotification.type === 'DISPATCH'
              ? 'bg-[#001F3F] text-white border-sky-400/40'
              : activeNotification.type === 'SOLVED'
              ? 'bg-emerald-900 text-white border-emerald-400/40'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <div className="p-2 rounded-lg bg-white/10 shrink-0">
              {activeNotification.type === 'DISPATCH' ? (
                <Send className="w-5 h-5 text-sky-400" />
              ) : activeNotification.type === 'SOLVED' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Bell className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <h4 className="font-bold text-sm text-white">{activeNotification.title}</h4>
              <p className="text-white/80 mt-1 leading-relaxed">{activeNotification.message}</p>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
