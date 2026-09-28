import { 
  MarketplaceCrawlerStatus, 
  CooComplianceRecord, 
  EcommerceAuditItem 
} from '../types/ecommerce';
import { createPackageSvg } from './mockInspections';

export const SEED_CRAWLER_STATUS: MarketplaceCrawlerStatus[] = [
  {
    id: 'crawl-az',
    platform: 'Amazon',
    crawlerStatus: 'ACTIVE',
    lastScanTime: '2 minutes ago',
    productsScanned: 12450,
    potentialIssues: 34,
    activeWorkers: 8,
    avgScanLatencyMs: 320,
    apiHealth: 'HEALTHY'
  },
  {
    id: 'crawl-fk',
    platform: 'Flipkart',
    crawlerStatus: 'ACTIVE',
    lastScanTime: '4 minutes ago',
    productsScanned: 9820,
    potentialIssues: 21,
    activeWorkers: 6,
    avgScanLatencyMs: 410,
    apiHealth: 'HEALTHY'
  },
  {
    id: 'crawl-bl',
    platform: 'Blinkit',
    crawlerStatus: 'ACTIVE',
    lastScanTime: '1 minute ago',
    productsScanned: 4320,
    potentialIssues: 46,
    activeWorkers: 4,
    avgScanLatencyMs: 190,
    apiHealth: 'HEALTHY'
  },
  {
    id: 'crawl-zp',
    platform: 'Zepto',
    crawlerStatus: 'ACTIVE',
    lastScanTime: '3 minutes ago',
    productsScanned: 3890,
    potentialIssues: 18,
    activeWorkers: 4,
    avgScanLatencyMs: 220,
    apiHealth: 'HEALTHY'
  },
  {
    id: 'crawl-im',
    platform: 'Instamart',
    crawlerStatus: 'ACTIVE',
    lastScanTime: '5 minutes ago',
    productsScanned: 4150,
    potentialIssues: 29,
    activeWorkers: 5,
    avgScanLatencyMs: 260,
    apiHealth: 'HEALTHY'
  }
];

// Active marketplace crawlers with clean metrics (zero dummy numbers)
export const MOCK_CRAWLER_STATUS: MarketplaceCrawlerStatus[] = [
  {
    id: 'crawl-az',
    platform: 'Amazon',
    crawlerStatus: 'ACTIVE',
    lastScanTime: 'Continuous Sync',
    productsScanned: 0,
    potentialIssues: 0,
    activeWorkers: 8,
    avgScanLatencyMs: 320,
    apiHealth: 'HEALTHY'
  },
  {
    id: 'crawl-fk',
    platform: 'Flipkart',
    crawlerStatus: 'ACTIVE',
    lastScanTime: 'Continuous Sync',
    productsScanned: 0,
    potentialIssues: 0,
    activeWorkers: 6,
    avgScanLatencyMs: 410,
    apiHealth: 'HEALTHY'
  },
  {
    id: 'crawl-bl',
    platform: 'Blinkit',
    crawlerStatus: 'ACTIVE',
    lastScanTime: 'Continuous Sync',
    productsScanned: 0,
    potentialIssues: 0,
    activeWorkers: 4,
    avgScanLatencyMs: 190,
    apiHealth: 'HEALTHY'
  },
  {
    id: 'crawl-zp',
    platform: 'Zepto',
    crawlerStatus: 'ACTIVE',
    lastScanTime: 'Continuous Sync',
    productsScanned: 0,
    potentialIssues: 0,
    activeWorkers: 4,
    avgScanLatencyMs: 220,
    apiHealth: 'HEALTHY'
  },
  {
    id: 'crawl-im',
    platform: 'Instamart',
    crawlerStatus: 'ACTIVE',
    lastScanTime: 'Continuous Sync',
    productsScanned: 0,
    potentialIssues: 0,
    activeWorkers: 5,
    avgScanLatencyMs: 260,
    apiHealth: 'HEALTHY'
  }
];

export const SEED_COO_COMPLIANCE: CooComplianceRecord[] = [
  {
    id: 'coo-az',
    platform: 'Amazon',
    cooAvailable: true,
    searchable: true,
    sortable: true,
    status: 'COMPLIANT',
    notes: 'Dedicated Country of Origin filter available in sidebar and search refinements across all major consumer packaged goods categories.',
    ruleClause: 'Rule 6(10A) of Legal Metrology (Packaged Commodities) Rules, 2011',
    lastAuditedDate: '2026-09-16'
  },
  {
    id: 'coo-fk',
    platform: 'Flipkart',
    cooAvailable: true,
    searchable: true,
    sortable: false,
    status: 'REVIEW',
    notes: 'Country of Origin is declared on product specification tables, but category browse pages lack a sortable origin facet under search.',
    ruleClause: 'Rule 6(10A) & Rule 6(11)',
    lastAuditedDate: '2026-09-16'
  },
  {
    id: 'coo-bl',
    platform: 'Blinkit',
    cooAvailable: false,
    searchable: false,
    sortable: false,
    status: 'ISSUE',
    notes: 'Quick-commerce catalog displays no searchable or sortable Country of Origin filter. Imported commodities omit origin on instant order view.',
    ruleClause: 'Rule 6(10A) of LMPC Rules, 2011',
    lastAuditedDate: '2026-09-15'
  },
  {
    id: 'coo-zp',
    platform: 'Zepto',
    cooAvailable: true,
    searchable: true,
    sortable: true,
    status: 'COMPLIANT',
    notes: 'Compliant Country of Origin badges displayed prominently in product specifications with filterable origin options in grocery categories.',
    ruleClause: 'Rule 6(10A) of LMPC Rules, 2011',
    lastAuditedDate: '2026-09-16'
  },
  {
    id: 'coo-im',
    platform: 'Instamart',
    cooAvailable: true,
    searchable: true,
    sortable: false,
    status: 'REVIEW',
    notes: 'Origin declared in text descriptions but not indexed as a primary searchable filter on mobile consumer application.',
    ruleClause: 'Rule 6(10A) of LMPC Rules, 2011',
    lastAuditedDate: '2026-09-14'
  }
];

// Rule 6(10A) Statutory Marketplace Facet Compliance Table
export const MOCK_COO_COMPLIANCE: CooComplianceRecord[] = SEED_COO_COMPLIANCE;

export const SEED_ECOMMERCE_AUDIT_ITEMS: EcommerceAuditItem[] = [
  {
    id: 'ECOM-AZ-2026-401',
    caseId: 'CASE-ECOM-2026-081',
    marketplace: 'Amazon',
    productName: 'Himalayan Harvest Sharbati Whole Wheat Atta (5kg)',
    category: 'Food & Beverages',
    sellerName: 'CloudRetail Logistics India Ltd',
    sellerLocation: 'Bhiwandi Mega Fulfillment Center, Maharashtra',
    auditDate: '2026-09-16T12:10:00Z',
    reviewStatus: 'FLAGGED',
    violationType: 'DUAL_MRP',
    violationTitle: 'Online Price Exceeds Physical Printed MRP by ₹80.00 (+30.8%)',
    severity: 'CRITICAL',
    applicableRule: 'Rule 18(2) of Legal Metrology (Packaged Commodities) Rules, 2011',
    statutoryPenalty: 'Section 36(1) & Section 39 of Legal Metrology Act, 2009',
    printedMrp: 260.00,
    onlinePrice: 340.00,
    priceDifference: 80.00,
    percentDifference: 30.8,
    onlineMetadata: {
      productName: 'Himalayan Harvest Sharbati Whole Wheat Atta (5kg)',
      brand: 'Himalayan Harvest',
      mrp: 340.00,
      onlinePrice: 340.00,
      netQuantity: '5 kg',
      manufacturer: 'Himalayan Agro Foods Ltd',
      manufacturerAddress: 'Plot 42, GIDC Agro Park, Gujarat - 382010',
      countryOfOrigin: 'India',
      seller: 'CloudRetail Logistics India Ltd',
      unitSalePrice: '₹ 68.00 per 1kg',
      listingUrl: 'https://amazon.in/dp/B09ABC1234',
      asinOrFsn: 'B09ABC1234'
    },
    packageOcr: {
      productName: 'Himalayan Harvest Sharbati Whole Wheat Atta',
      brand: 'Himalayan Harvest',
      printedMrp: 260.00,
      netQuantity: '5 kg',
      manufacturer: 'Himalayan Agro Foods Ltd',
      manufacturerAddress: 'Plot 42, GIDC Agro Park, Gujarat - 382010',
      countryOfOrigin: 'India',
      packageImageUrl: createPackageSvg(
        ['#eab308', '#a16207'],
        'Himalayan Harvest',
        'Sharbati Atta (5kg)',
        '5 kg (Net)',
        '₹ 260.00 (Printed MRP)',
        'Mfg: 08/2026 • Exp: 02/2027 • B: HH-5K',
        '8901234567812',
        'Helpline: 1800-220-4499 | care@himalayanagro.in',
        true
      ),
      boundingBoxes: [
        {
          id: 'box-ecom-1',
          label: 'Printed MRP Overlay',
          x: 50,
          y: 55,
          width: 35,
          height: 8.5,
          rule: 'Rule 18(2)',
          status: 'FAIL',
          detectedText: 'MRP ₹ 260.00 (incl. of all taxes)',
          requiredStandard: 'Online listed price must not exceed printed MRP',
          description: 'Package declares ₹260; online marketplace lists at ₹340'
        },
        {
          id: 'box-ecom-2',
          label: 'Net Quantity',
          x: 15,
          y: 55,
          width: 33,
          height: 8.5,
          rule: 'Rule 6(1)(c)',
          status: 'PASS',
          detectedText: '5 kg',
          requiredStandard: 'Metric units',
          description: 'Matches declared net weight'
        }
      ],
      ocrConfidence: 0.98,
      verifiedTimestamp: '2026-09-16T12:08:22Z'
    },
    mismatchFields: ['mrp'],
    overallResult: 'MISMATCH DETECTED'
  },
  {
    id: 'ECOM-FK-2026-388',
    caseId: 'CASE-ECOM-2026-082',
    marketplace: 'Flipkart',
    productName: 'GlowRadiance Vitamin C Face Serum (50ml)',
    category: 'Cosmetics & Personal Care',
    sellerName: 'SuperCom Retailers Hub',
    sellerLocation: 'Kurla West, Mumbai, Maharashtra',
    auditDate: '2026-09-16T11:40:00Z',
    reviewStatus: 'FLAGGED',
    violationType: 'NET_QTY_MISMATCH',
    violationTitle: 'Net Quantity Mismatch: Online Lists 100ml, Physical Package Declares 50ml',
    severity: 'CRITICAL',
    applicableRule: 'Rule 6(1)(c) & Rule 12 of LMPC Rules, 2011',
    statutoryPenalty: 'Section 36(1) of Legal Metrology Act, 2009',
    printedMrp: 699.00,
    onlinePrice: 899.00,
    priceDifference: 200.00,
    percentDifference: 28.6,
    onlineMetadata: {
      productName: 'GlowRadiance Vitamin C Face Serum (100ml Value Pack)',
      brand: 'GlowRadiance',
      mrp: 899.00,
      onlinePrice: 899.00,
      netQuantity: '100 ml',
      manufacturer: 'Radiant Derma Laboratories Ltd',
      manufacturerAddress: 'Industrial Area Phase 2, Baddi, HP',
      countryOfOrigin: 'India',
      seller: 'SuperCom Retailers Hub',
      unitSalePrice: '₹ 8.99 per 1ml',
      listingUrl: 'https://flipkart.com/p/itm12345678',
      asinOrFsn: 'FSN-GLOW-SERUM-99'
    },
    packageOcr: {
      productName: 'GlowRadiance Vitamin C Face Serum',
      brand: 'GlowRadiance',
      printedMrp: 699.00,
      netQuantity: '50 ml',
      manufacturer: 'Radiant Derma Laboratories Ltd',
      manufacturerAddress: 'Industrial Area Phase 2, Baddi, HP',
      countryOfOrigin: 'India',
      packageImageUrl: createPackageSvg(
        ['#ec4899', '#9d174d'],
        'GlowRadiance',
        'Vit C Face Serum (50ml)',
        '50 ml (Actual)',
        '₹ 699.00 (Printed)',
        'Mfg: 06/2026 • Batch: GR-50',
        '8904012345678',
        'Email: support@glowradiance.in',
        true
      ),
      boundingBoxes: [
        {
          id: 'box-ecom-fk-1',
          label: 'Quantity Discrepancy',
          x: 15,
          y: 55,
          width: 33,
          height: 8.5,
          rule: 'Rule 6(1)(c)',
          status: 'FAIL',
          detectedText: '50 ml',
          requiredStandard: 'Listing claims 100ml package volume',
          description: 'Package volume is 50% less than online listing claims'
        },
        {
          id: 'box-ecom-fk-2',
          label: 'MRP Difference',
          x: 50,
          y: 55,
          width: 35,
          height: 8.5,
          rule: 'Rule 18(2)',
          status: 'FAIL',
          detectedText: 'MRP ₹ 699.00',
          requiredStandard: 'Online listing declared ₹899',
          description: 'Package printed MRP is ₹200 lower than online listing'
        }
      ],
      ocrConfidence: 0.96,
      verifiedTimestamp: '2026-09-16T11:38:10Z'
    },
    mismatchFields: ['netQuantity', 'mrp'],
    overallResult: 'MISMATCH DETECTED'
  },
  {
    id: 'ECOM-BL-2026-342',
    caseId: 'CASE-ECOM-2026-083',
    marketplace: 'Blinkit',
    productName: 'NatureFresh Pure Cow Ghee (1 Litre)',
    category: 'Food & Beverages',
    sellerName: 'Blinkit QuickCommerce Store Sector 19',
    sellerLocation: 'Vashi, Navi Mumbai, Maharashtra',
    auditDate: '2026-09-16T10:15:00Z',
    reviewStatus: 'UNDER_REVIEW',
    violationType: 'COO_MISSING',
    violationTitle: 'Mandatory Country of Origin & Unit Sale Price Missing on Quick Commerce PDP',
    severity: 'HIGH',
    applicableRule: 'Rule 6(10A) & Rule 6(11) of LMPC Rules, 2011',
    statutoryPenalty: 'Section 36(1) of Legal Metrology Act, 2009',
    printedMrp: 620.00,
    onlinePrice: 620.00,
    priceDifference: 0.00,
    percentDifference: 0.0,
    onlineMetadata: {
      productName: 'NatureFresh Pure Cow Ghee (1 Litre)',
      brand: 'NatureFresh Dairy',
      mrp: 620.00,
      onlinePrice: 620.00,
      netQuantity: '1 Litre',
      manufacturer: 'NatureFresh Dairies Private Limited',
      manufacturerAddress: 'Plot 10, MIDC Baramati, Pune, MH',
      countryOfOrigin: 'Not Stated on Listing',
      seller: 'Blinkit QuickCommerce Store Sector 19',
      unitSalePrice: 'Missing',
      listingUrl: 'https://blinkit.com/prn/pure-cow-ghee/prid/9921',
      asinOrFsn: 'BLK-GHEE-1L'
    },
    packageOcr: {
      productName: 'NatureFresh Pure Cow Ghee',
      brand: 'NatureFresh Dairy',
      printedMrp: 620.00,
      netQuantity: '1 Litre',
      manufacturer: 'NatureFresh Dairies Private Limited',
      manufacturerAddress: 'Plot 10, MIDC Baramati, Pune, MH',
      countryOfOrigin: 'India',
      packageImageUrl: createPackageSvg(
        ['#ca8a04', '#854d0e'],
        'NatureFresh',
        'Pure Cow Ghee (1L)',
        '1 Litre',
        '₹ 620.00 (Printed)',
        'Mfg: 09/2026 • Lot: NF-09',
        '8901239876541',
        'Care: 1800-444-9911',
        false
      ),
      boundingBoxes: [
        {
          id: 'box-ecom-bl-1',
          label: 'Country of Origin on Pack',
          x: 53,
          y: 80,
          width: 32,
          height: 10,
          rule: 'Rule 6(10A)',
          status: 'PASS',
          detectedText: 'Country of Origin: India',
          requiredStandard: 'Must be reflected on online platform catalog',
          description: 'Package has origin; catalog listing omitted it completely'
        }
      ],
      ocrConfidence: 0.97,
      verifiedTimestamp: '2026-09-16T10:12:00Z'
    },
    mismatchFields: ['countryOfOrigin', 'usp'],
    overallResult: 'MISMATCH DETECTED'
  },
  {
    id: 'ECOM-ZP-2026-291',
    caseId: 'CASE-ECOM-2026-084',
    marketplace: 'Zepto',
    productName: 'ChocoDelight Hazelnut Cocoa Spread (350g)',
    category: 'Snacks & Confectionery',
    sellerName: 'Zepto DarkStore Bandra West Hub',
    sellerLocation: 'Bandra West, Mumbai, Maharashtra',
    auditDate: '2026-09-15T16:30:00Z',
    reviewStatus: 'FLAGGED',
    violationType: 'MANUFACTURER_MISMATCH',
    violationTitle: 'Manufacturer Address Discrepancy & Over-MRP Listing',
    severity: 'HIGH',
    applicableRule: 'Rule 6(1)(a) & Rule 18(2) of LMPC Rules, 2011',
    statutoryPenalty: 'Section 36(1) of Legal Metrology Act, 2009',
    printedMrp: 280.00,
    onlinePrice: 350.00,
    priceDifference: 70.00,
    percentDifference: 25.0,
    onlineMetadata: {
      productName: 'ChocoDelight Hazelnut Cocoa Spread (350g Jar)',
      brand: 'ChocoDelight',
      mrp: 350.00,
      onlinePrice: 350.00,
      netQuantity: '350 g',
      manufacturer: 'ChocoDelight Confectioneries India Pvt Ltd',
      manufacturerAddress: 'Warehouse 4, Bhiwandi Logistics Hub, Thane - 421302',
      countryOfOrigin: 'India',
      seller: 'Zepto DarkStore Bandra West Hub',
      unitSalePrice: '₹ 1.00 per 1g',
      listingUrl: 'https://zepto.com/p/chocodelight-spread-350g',
      asinOrFsn: 'ZPT-CHOCO-350'
    },
    packageOcr: {
      productName: 'ChocoDelight Hazelnut Cocoa Spread',
      brand: 'ChocoDelight',
      printedMrp: 280.00,
      netQuantity: '350 g',
      manufacturer: 'ChocoDelight Confectioneries India Pvt Ltd',
      manufacturerAddress: 'Plot 12, MIDC Industrial Area, Taloja, Raigad - 410208',
      countryOfOrigin: 'India',
      packageImageUrl: createPackageSvg(
        ['#78350f', '#451a03'],
        'ChocoDelight',
        'Hazelnut Spread (350g)',
        '350 g',
        '₹ 280.00 (Printed)',
        'Mfg: 07/2026 • CD-350',
        '8901009988776',
        'Grievance: care@chocodelight.in',
        true
      ),
      boundingBoxes: [
        {
          id: 'box-ecom-zp-1',
          label: 'Manufacturer Address',
          x: 15,
          y: 72,
          width: 70,
          height: 7,
          rule: 'Rule 6(1)(a)',
          status: 'FAIL',
          detectedText: 'Plot 12, MIDC Industrial Area, Taloja, Raigad',
          requiredStandard: 'Exact registered factory address must match',
          description: 'Listing points to distributor transit hub instead of registered factory'
        }
      ],
      ocrConfidence: 0.94,
      verifiedTimestamp: '2026-09-15T16:25:40Z'
    },
    mismatchFields: ['manufacturerAddress', 'mrp'],
    overallResult: 'MISMATCH DETECTED'
  },
  {
    id: 'ECOM-IM-2026-210',
    caseId: 'CASE-ECOM-2026-085',
    marketplace: 'Instamart',
    productName: 'SparkleClean Liquid Laundry Detergent (2 Litres)',
    category: 'Household & Detergents',
    sellerName: 'Swiggy Instamart DarkStore Andheri Hub',
    sellerLocation: 'Andheri East, Mumbai, Maharashtra',
    auditDate: '2026-09-15T14:10:00Z',
    reviewStatus: 'NOTICE_ISSUED',
    violationType: 'DUAL_MRP',
    violationTitle: 'Form VI Notice Dispatched: ₹70.00 Online Price Inflation over Package MRP',
    severity: 'CRITICAL',
    applicableRule: 'Rule 18(2) of LMPC Rules, 2011',
    statutoryPenalty: 'Section 36(1) of Legal Metrology Act, 2009',
    printedMrp: 380.00,
    onlinePrice: 450.00,
    priceDifference: 70.00,
    percentDifference: 18.4,
    onlineMetadata: {
      productName: 'SparkleClean Liquid Laundry Detergent (2 Litres)',
      brand: 'SparkleClean',
      mrp: 450.00,
      onlinePrice: 450.00,
      netQuantity: '2 Litres',
      manufacturer: 'Sparkle Consumer Products Ltd',
      manufacturerAddress: 'Sector 8, Industrial Estate, Vapi, Gujarat',
      countryOfOrigin: 'India',
      seller: 'Swiggy Instamart DarkStore Andheri Hub',
      unitSalePrice: 'Missing',
      listingUrl: 'https://swiggy.com/instamart/p/sparkleclean-2l',
      asinOrFsn: 'SWG-SPARK-2L'
    },
    packageOcr: {
      productName: 'SparkleClean Liquid Detergent',
      brand: 'SparkleClean',
      printedMrp: 380.00,
      netQuantity: '2 Litres',
      manufacturer: 'Sparkle Consumer Products Ltd',
      manufacturerAddress: 'Sector 8, Industrial Estate, Vapi, Gujarat',
      countryOfOrigin: 'India',
      packageImageUrl: createPackageSvg(
        ['#0284c7', '#0369a1'],
        'SparkleClean',
        'Liquid Detergent (2L)',
        '2 Litres',
        '₹ 380.00 (Printed)',
        'Mfg: 08/2026 • SC-2L',
        '8901112223334',
        'Helpline: 1800-333-1122',
        true
      ),
      boundingBoxes: [
        {
          id: 'box-ecom-im-1',
          label: 'Printed MRP',
          x: 50,
          y: 55,
          width: 35,
          height: 8.5,
          rule: 'Rule 18(2)',
          status: 'FAIL',
          detectedText: 'MRP ₹ 380.00',
          requiredStandard: 'Cannot charge above printed MRP',
          description: 'Selling price ₹450 vs printed MRP ₹380'
        }
      ],
      ocrConfidence: 0.99,
      verifiedTimestamp: '2026-09-15T14:05:00Z'
    },
    mismatchFields: ['mrp', 'usp'],
    overallResult: 'MISMATCH DETECTED',
    officerNotes: 'Notice Form VI generated & dispatched to platform compliance liaison.',
    noticeIssuedDate: '2026-09-15'
  },
  {
    id: 'ECOM-AZ-2026-195',
    caseId: 'CASE-ECOM-2026-086',
    marketplace: 'Amazon',
    productName: 'EverLast Heavy Duty AA Alkaline Batteries (Pack of 10)',
    category: 'Electronics & Devices',
    sellerName: 'EverLast Power Official Store',
    sellerLocation: 'Sahar Cargo Complex, Andheri East, Mumbai',
    auditDate: '2026-09-14T09:20:00Z',
    reviewStatus: 'DISMISSED',
    violationType: 'DUAL_MRP',
    violationTitle: 'Audit Passed: Full Alignment between Listing Metadata & Package Declarations',
    severity: 'MEDIUM',
    applicableRule: 'Rules 6, 7 & 18 of LMPC Rules, 2011',
    statutoryPenalty: 'None - Compliant',
    printedMrp: 299.00,
    onlinePrice: 299.00,
    priceDifference: 0.00,
    percentDifference: 0.0,
    onlineMetadata: {
      productName: 'EverLast Heavy Duty AA Alkaline Batteries (Pack of 10)',
      brand: 'EverLast',
      mrp: 299.00,
      onlinePrice: 299.00,
      netQuantity: '10 Units',
      manufacturer: 'EverLast Energy Tech India Pvt Ltd',
      manufacturerAddress: 'Industrial Zone Phase 3, Chennai, TN',
      countryOfOrigin: 'India',
      seller: 'EverLast Power Official Store',
      unitSalePrice: '₹ 29.90 per 1 Unit',
      listingUrl: 'https://amazon.in/dp/B08XYZ5678',
      asinOrFsn: 'B08XYZ5678'
    },
    packageOcr: {
      productName: 'EverLast Heavy Duty AA Alkaline Batteries',
      brand: 'EverLast',
      printedMrp: 299.00,
      netQuantity: '10 Units',
      manufacturer: 'EverLast Energy Tech India Pvt Ltd',
      manufacturerAddress: 'Industrial Zone Phase 3, Chennai, TN',
      countryOfOrigin: 'India',
      packageImageUrl: createPackageSvg(
        ['#334155', '#0f172a'],
        'EverLast',
        'AA Batteries (Pack of 10)',
        '10 Units',
        '₹ 299.00 (Compliant)',
        'Mfg: 08/2026 • EL-10',
        '8908876123456',
        'Support: service@everlastpower.in',
        false
      ),
      boundingBoxes: [
        {
          id: 'box-ecom-az-ok-1',
          label: 'Compliant Declarations',
          x: 15,
          y: 55,
          width: 70,
          height: 25,
          rule: 'Rules 6 & 7',
          status: 'PASS',
          detectedText: 'All declarations present & verified',
          requiredStandard: 'LMPC 2011 Standards',
          description: 'Package matches listing metadata fully'
        }
      ],
      ocrConfidence: 0.99,
      verifiedTimestamp: '2026-09-14T09:15:00Z'
    },
    mismatchFields: [],
    overallResult: 'MATCHED'
  }
];

// Clean Dashboard: zero mock ecommerce audit items loaded initially
export const MOCK_ECOMMERCE_AUDIT_ITEMS: EcommerceAuditItem[] = [];

