import { BoundingBox } from './compliance';

export type MarketplacePlatform = 'Amazon' | 'Flipkart' | 'Blinkit' | 'Zepto' | 'Instamart';

export interface MarketplaceCrawlerStatus {
  id: string;
  platform: MarketplacePlatform;
  crawlerStatus: 'ACTIVE' | 'IDLE' | 'DEGRADED';
  lastScanTime: string;
  productsScanned: number;
  potentialIssues: number;
  activeWorkers: number;
  avgScanLatencyMs: number;
  apiHealth: 'HEALTHY' | 'WARNING';
}

export interface CooComplianceRecord {
  id: string;
  platform: MarketplacePlatform;
  cooAvailable: boolean;
  searchable: boolean;
  sortable: boolean;
  status: 'COMPLIANT' | 'REVIEW' | 'ISSUE';
  notes: string;
  ruleClause: string;
  lastAuditedDate: string;
}

export type EcommerceViolationType = 
  | 'DUAL_MRP' 
  | 'COO_MISSING' 
  | 'NET_QTY_MISMATCH' 
  | 'MANUFACTURER_MISMATCH' 
  | 'USP_MISSING';

export type ReviewStatus = 'FLAGGED' | 'UNDER_REVIEW' | 'NOTICE_ISSUED' | 'DISMISSED';

export interface OnlineListingMetadata {
  productName: string;
  brand: string;
  mrp: number;
  onlinePrice: number;
  netQuantity: string;
  manufacturer: string;
  manufacturerAddress: string;
  countryOfOrigin: string;
  seller: string;
  unitSalePrice?: string;
  listingUrl?: string;
  asinOrFsn?: string;
}

export interface PackageOcrData {
  productName: string;
  brand: string;
  printedMrp: number;
  netQuantity: string;
  manufacturer: string;
  manufacturerAddress: string;
  countryOfOrigin: string;
  packageImageUrl: string;
  boundingBoxes: BoundingBox[];
  ocrConfidence: number;
  verifiedTimestamp: string;
}

export interface EcommerceAuditItem {
  id: string; // e.g. ECOM-AZ-2026-401
  caseId: string; // Connected to regulatory case e.g. CASE-MH-2026-881
  marketplace: MarketplacePlatform;
  productName: string;
  category: string;
  sellerName: string;
  sellerLocation: string;
  auditDate: string;
  reviewStatus: ReviewStatus;
  violationType: EcommerceViolationType;
  violationTitle: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  applicableRule: string;
  statutoryPenalty: string;
  
  // Dual MRP specific metrics
  printedMrp: number;
  onlinePrice: number;
  priceDifference: number;
  percentDifference: number;

  // Comparison data
  onlineMetadata: OnlineListingMetadata;
  packageOcr: PackageOcrData;
  mismatchFields: ('mrp' | 'netQuantity' | 'manufacturer' | 'manufacturerAddress' | 'countryOfOrigin' | 'usp')[];
  overallResult: 'MATCHED' | 'MISMATCH DETECTED';
  
  officerNotes?: string;
  noticeIssuedDate?: string;
}

export interface EcommerceFilterState {
  marketplace: string; // 'ALL' or specific
  violationType: string; // 'ALL' or specific
  reviewStatus: string; // 'ALL' or specific
  searchQuery: string;
}
