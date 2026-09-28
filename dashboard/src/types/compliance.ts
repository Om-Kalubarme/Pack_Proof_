export type CommodityCategory =
  | 'Food & Beverages'
  | 'Cosmetics & Personal Care'
  | 'Snacks & Confectionery'
  | 'Electronics & Devices'
  | 'Household & Detergents'
  | 'Pharma & Health Supplements'
  | 'E-Commerce Logistics';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'COMPLIANT';

export type InspectionStatus = 
  | 'PASS'
  | 'FAIL'
  | 'UNDER_REVIEW'
  | 'NOTICE_ISSUED'
  | 'COMPOUNDED'
  | 'IN_PROGRESS'
  | 'PENDING';

export type TimeFilter = 'today' | 'weekly' | 'monthly' | 'custom';

export interface BoundingBox {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  rule: string;
  status: 'FAIL' | 'PASS' | 'WARNING';
  detectedText: string;
  requiredStandard: string;
  description: string;
}

export interface Violation {
  code: string;
  rule: string;
  title: string;
  severity: SeverityLevel;
  description: string;
  statutoryClause: string;
  penaltyClause: string;
  measuredValue?: string;
  requiredValue?: string;
}

export interface InspectionRecord {
  id: string; // e.g. LMR-2026-0842 or LM-MH-2026-0941
  timestamp: string; // ISO 8601
  productName: string;
  brand: string;
  manufacturer: string;
  batchNo: string;
  category: CommodityCategory;
  zone: string;
  retailerName: string;
  retailerLocation: string;
  netQuantity: string;
  mrpDeclared: string;
  status: InspectionStatus;
  severity: SeverityLevel;
  violations: Violation[];
  boundingBoxes: BoundingBox[];
  imageSrc: string;
  inspectorName: string;
  inspectorId: string;
  notes?: string;
  noticeDate?: string;
  confidenceScore: number;
  // Geolocation & field operational enhancements
  coordinates?: { lat: number; lng: number };
  district?: string;
  state?: string;
  pincode?: string;
  complianceResult?: 'Compliant' | 'Violation Detected' | 'Under Investigation' | 'Pending Verification' | 'Notice Issued';
  applicableRule?: string;
  recommendedAction?: string;
  // Seventh Schedule Form A/B Statutory Data
  seventhScheduleForm?: {
    formType: 'FORM_A' | 'FORM_B';
    formNumber: string;
    registrationRef?: string;
    verificationDate?: string;
    remarks?: string;
  };
  // Repeat packaging violation history
  isRepeatOffender?: boolean;
  previousViolationsCount?: number;
  originComplaintId?: string;
}

export interface CitizenComplaint {
  id: string; // e.g. CASE-2026-081 or CMP-MH-2026-081
  source: 'Citizen' | 'NIC Member' | 'National Consumer Helpline' | 'INGRAM Portal' | 'e-Daakhil' | 'Direct Consumer Cell';
  complainantType?: 'Citizen' | 'NIC Member';
  complainantName?: string;
  complainantPhone?: string;
  shopName: string;
  complaintType: 'Overcharging above MRP' | 'Missing Unit Sale Price (USP)' | 'Dual MRP Sticker';
  description: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  coordinates?: { lat: number; lng: number };
  complaintDate: string;
  status: 'PENDING_DISPATCH' | 'INSPECTION_ORDERED' | 'IN_PROGRESS' | 'RESOLVED';
  photoEvidence?: string;
  reportedProduct?: string;
  commodity?: string;
  brand?: string;
  previousViolationsFound?: number;
  // Field Dispatch & Inspector Directive
  assignedInspectorName?: string;
  assignedInspectorId?: string;
  assignedAreaCircle?: string;
  noticeDirectiveNo?: string;
  noticeDispatchedAt?: string;
  specialInstructions?: string;
  directivePriority?: 'URGENT' | 'HIGH' | 'ROUTINE';
  inspectionCaseId?: string;
  // Case Resolution & Inspector Findings
  resolutionNotes?: string;
  resolvedAt?: string;
  actionTaken?: 'COMPOUNDED' | 'NOTICE_ISSUED' | 'MERCHANT_COMPLIED' | 'DISMISSED';
  compoundingAmount?: number;
  seizureMemoNo?: string;
  inspectionResult?: string;
  complianceStatus?: 'PASS' | 'FAIL' | 'NOTICE_ISSUED' | 'COMPOUNDED';
  violation?: string;
  severity?: SeverityLevel;
  // Citizen Notification
  citizenNotificationSent?: boolean;
  citizenNotificationMessage?: string;
  citizenNotificationSentAt?: string;
}

export interface EnforcementAlert {
  id: string;
  inspectionId: string;
  retailerName: string;
  location: string;
  alertType: 'CRITICAL_NOTICE' | 'COMPOUNDING_EXPIRY' | 'REPEAT_OFFENDER' | 'SCALE_VERIFICATION';
  title: string;
  description: string;
  deadline: string;
  statutoryClause: string;
  actionLabel: string;
  severity: SeverityLevel;
}

export interface EnforcementZone {
  id: string;
  name: string;
  code: string;
  district: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  scansCount: number;
  violationsCount: number;
  complianceRate: number;
  primaryViolation: string;
  activeInspectors: number;
  coordinates?: { x: number; y: number };
}

export interface KpiMetrics {
  totalScans: number;
  totalViolations: number;
  complianceRate: number;
  criticalPending: number;
  scansDeltaPct: number;
  violationsDeltaPct: number;
  complianceDeltaPct: number;
  noticesIssuedCount: number;
}

export interface FilterState {
  timeFilter: TimeFilter;
  startDate?: string;
  endDate?: string;
  category: string; // 'ALL' or specific category
  severity: string; // 'ALL' or specific severity
  status: string;   // 'ALL' or specific status
  inspector?: string; // 'ALL' or specific inspector name/id
  searchQuery: string;
  sortBy: 'date_desc' | 'date_asc' | 'severity_desc' | 'violations_desc' | 'product_asc';
}

export interface OfficerProfile {
  id: string;
  name: string;
  designation: string;
  zone: string;
  email?: string;
  phone?: string;
  calibratedKitId?: string;
  registeredAt?: string;
  warrantNo?: string;
  cadre?: string;
  stationHq?: string;
  dutyStatus?: 'ON_DUTY' | 'IN_TRANSIT' | 'OFF_DUTY';
  nplCertNo?: string;
  standardWeightKit?: string;
}

export interface InspectorProfile {
  id: string;
  name: string;
  designation: string;
  zone: string;
  email: string;
  phone: string;
  calibratedKitId?: string;
  registeredAt: string;
}

