import { InspectionRecord, EnforcementZone, EnforcementAlert, InspectionStatus, CitizenComplaint } from '../types/compliance';

// Helper to create SVG data URIs for realistic package visuals
export const createPackageSvg = (
  bgGradient: [string, string],
  brandName: string,
  productTitle: string,
  netQty: string,
  mrpText: string,
  batchText: string,
  barcode: string,
  extraNotes: string,
  isViolation = true
) => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
      <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#000" flood-opacity="0.35"/>
      </filter>
    </defs>

    <!-- Package Outer Body -->
    <rect x="50" y="30" width="500" height="690" rx="24" fill="url(#bgGrad)" filter="url(#dropShadow)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <rect x="50" y="30" width="500" height="690" rx="24" fill="url(#grid)" />

    <!-- Top Metallic Seal / Pack Ribbon -->
    <path d="M 50 54 Q 300 80 550 54 L 550 30 L 50 30 Z" fill="rgba(255,255,255,0.15)"/>
    <circle cx="300" cy="50" r="12" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>

    <!-- Brand Emblem -->
    <rect x="200" y="85" width="200" height="36" rx="18" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
    <text x="300" y="108" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#f8fafc" letter-spacing="3" text-anchor="middle">
      ${brandName.toUpperCase()}
    </text>

    <!-- Product Title & Graphic Area -->
    <text x="300" y="165" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">
      ${productTitle}
    </text>

    <!-- Center Product Illustration / Seal Area -->
    <rect x="150" y="195" width="300" height="150" rx="16" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-dasharray="4 4"/>
    <circle cx="300" cy="270" r="45" fill="rgba(255,255,255,0.2)"/>
    <text x="300" y="276" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#ffffff" text-anchor="middle">
      PRE-PACKAGED COMMODITY
    </text>

    <!-- Legal Metrology Mandatory Declaration Panel (Back/Front bottom) -->
    <rect x="75" y="370" width="450" height="320" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>

    <!-- Panel Header -->
    <rect x="75" y="370" width="450" height="32" rx="12" fill="#0f172a"/>
    <text x="90" y="391" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#94a3b8" letter-spacing="1">
      MANDATORY DECLARATIONS (LMPC RULES, 2011)
    </text>

    <!-- Net Quantity Declaration Area (Rule 6(1)(c) & Rule 7) -->
    <rect x="90" y="415" width="200" height="60" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="100" y="433" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#64748b">NET QUANTITY / WEIGHT:</text>
    <text x="100" y="460" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#0f172a">${netQty}</text>

    <!-- MRP Declaration Area (Rule 6(1)(e)) -->
    <rect x="300" y="415" width="210" height="60" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="310" y="433" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#64748b">MAX. RETAIL PRICE (MRP):</text>
    <text x="310" y="460" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="${isViolation ? '#dc2626' : '#0f172a'}">${mrpText}</text>

    <!-- Mfg & Batch Declaration (Rule 6(1)(d)) -->
    <rect x="90" y="485" width="420" height="45" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="100" y="503" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#64748b">MFG. DATE &amp; BATCH DETAILS:</text>
    <text x="100" y="520" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#1e293b">${batchText}</text>

    <!-- Consumer Care Cell Details (Rule 6(1)(n)) -->
    <rect x="90" y="540" width="420" height="50" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="100" y="556" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#64748b">CONSUMER GRIEVANCE / CARE CELL:</text>
    <text x="100" y="575" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#334155">${extraNotes}</text>

    <!-- Barcode & Importer/Manufacturer Area -->
    <rect x="90" y="600" width="220" height="75" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <!-- Mock Barcode lines -->
    <line x1="105" y1="615" x2="105" y2="655" stroke="#0f172a" stroke-width="2.5"/>
    <line x1="112" y1="615" x2="112" y2="655" stroke="#0f172a" stroke-width="1"/>
    <line x1="118" y1="615" x2="118" y2="655" stroke="#0f172a" stroke-width="3"/>
    <line x1="126" y1="615" x2="126" y2="655" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="134" y1="615" x2="134" y2="655" stroke="#0f172a" stroke-width="4"/>
    <line x1="145" y1="615" x2="145" y2="655" stroke="#0f172a" stroke-width="2"/>
    <line x1="154" y1="615" x2="154" y2="655" stroke="#0f172a" stroke-width="1"/>
    <line x1="162" y1="615" x2="162" y2="655" stroke="#0f172a" stroke-width="3"/>
    <line x1="172" y1="615" x2="172" y2="655" stroke="#0f172a" stroke-width="2"/>
    <line x1="184" y1="615" x2="184" y2="655" stroke="#0f172a" stroke-width="3.5"/>
    <text x="105" y="668" font-family="monospace" font-size="9" fill="#64748b">${barcode}</text>

    <rect x="320" y="600" width="190" height="75" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="330" y="618" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#64748b">MFR / PACKER DETAILS:</text>
    <text x="330" y="634" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="#334155">Mfg by: Bharat Foods Ltd.</text>
    <text x="330" y="648" font-family="system-ui, sans-serif" font-size="8" font-weight="500" fill="#64748b">Sector 14, Industrial Area</text>
    <text x="330" y="662" font-family="system-ui, sans-serif" font-size="8" font-weight="500" fill="#64748b">Reg No: MH-LMR-50124</text>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const BASE_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'LMR-2026-0941',
    timestamp: '2026-09-16T11:45:00Z',
    productName: 'SunGold Pure Refined Sunflower Oil (1 Litre)',
    brand: 'SunGold Agro',
    manufacturer: 'SunGold Agro Oils Pvt Ltd, Plot 42, GIDC, Gujarat',
    batchNo: 'SG-2026-08B',
    category: 'Food & Beverages',
    zone: 'Zone A - Wholesale Mandi',
    retailerName: 'Vashi APMC Wholesale Traders',
    retailerLocation: 'Gala 104, Sector 19, Vashi, Navi Mumbai',
    netQuantity: '1 Litre',
    mrpDeclared: '₹ 175.00',
    status: 'FAIL',
    severity: 'CRITICAL',
    confidenceScore: 0.98,
    inspectorName: 'Inspector Rajesh Sharma',
    inspectorId: 'LMO-MH-4019',
    noticeDate: '2026-09-16',
    notes: 'Unit Sale Price (USP) completely omitted. Font height on net quantity is 2.1mm against mandatory 4.0mm requirement for 1L packaging.',
    imageSrc: createPackageSvg(
      ['#eab308', '#ca8a04'],
      'SunGold Agro',
      'Refined Sunflower Oil',
      '1 Litre (Font: 2.1mm)',
      '₹ 175.00 (No USP)',
      'Mfg: 08/2026 • Exp: 05/2027 • B: SG-08B',
      '8901030948215',
      'Helpline: 1800-425-9988 | Email: care@sungold.in',
      true
    ),
    violations: [
      {
        code: 'RULE_6_11_USP',
        rule: 'Rule 6(11)',
        title: 'Missing Unit Sale Price (USP)',
        severity: 'CRITICAL',
        description: 'Mandatory Unit Sale Price per ml/litre is completely omitted on the principal display panel.',
        statutoryClause: 'Legal Metrology (Packaged Commodities) Amendment Rules, Rule 6(11)',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009 - Fine up to ₹25,000/-',
        measuredValue: 'Absent',
        requiredValue: '₹ 0.175 per 1ml or ₹ 175.00 per 1L'
      },
      {
        code: 'RULE_7_FONT_SIZE',
        rule: 'Rule 7, Table-I',
        title: 'Numeral Font Height Below Minimum Statutory Standard',
        severity: 'HIGH',
        description: 'Height of numerals for Net Quantity measured at 2.1mm. Required minimum is 4.0mm for packages > 500ml and <= 1L.',
        statutoryClause: 'Rule 7, Table I (Minimum height of numerals and letters for net quantity)',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: '2.1 mm',
        requiredValue: '>= 4.0 mm'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-1',
        label: 'Missing USP Violation',
        x: 50,
        y: 55,
        width: 35,
        height: 8.5,
        rule: 'Rule 6(11)',
        status: 'FAIL',
        detectedText: 'MRP ₹ 175.00 (incl. of all taxes)',
        requiredStandard: 'Must declare Unit Sale Price (e.g. ₹0.18/ml)',
        description: 'Unit Sale Price not declared on retail face'
      },
      {
        id: 'box-2',
        label: 'Font Size Under-Specification',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 7, Table I',
        status: 'FAIL',
        detectedText: '1 Litre (Height: 2.1mm)',
        requiredStandard: 'Minimum numeral height >= 4.0mm',
        description: 'Font height is 47.5% below statutory minimum'
      },
      {
        id: 'box-3',
        label: 'Mfg & Batch Declaration',
        x: 15,
        y: 64.5,
        width: 70,
        height: 6.5,
        rule: 'Rule 6(1)(d)',
        status: 'PASS',
        detectedText: 'Mfg: 08/2026 • Exp: 05/2027 • B: SG-08B',
        requiredStandard: 'Month and Year clearly legible',
        description: 'Compliant with Rule 6(1)(d)'
      },
      {
        id: 'box-4',
        label: 'Consumer Care Cell',
        x: 15,
        y: 72,
        width: 70,
        height: 7,
        rule: 'Rule 6(1)(n)',
        status: 'PASS',
        detectedText: '1800-425-9988 | care@sungold.in',
        requiredStandard: 'Name, address, tel no, email',
        description: 'Customer grievance cell verified'
      }
    ]
  },
  {
    id: 'LMR-2026-0940',
    timestamp: '2026-09-16T10:30:00Z',
    productName: 'GlowRadiance SPF 50+ Sun Defense Cream (50g)',
    brand: 'GlowRadiance Cosmetics',
    manufacturer: 'Imported by Radiant Cosmeceuticals Ltd, Mumbai',
    batchNo: 'GR-SPF-441',
    category: 'Cosmetics & Personal Care',
    zone: 'Zone B - Central Metro Hypermarkets',
    retailerName: 'Luxe Beauty Mart, Palladium Mall',
    retailerLocation: 'Lower Parel, Mumbai, Maharashtra',
    netQuantity: '50 g',
    mrpDeclared: '₹ 899.00',
    status: 'FAIL',
    severity: 'HIGH',
    confidenceScore: 0.95,
    inspectorName: 'Inspector Priya Nair',
    inspectorId: 'LMO-MH-4022',
    noticeDate: '2026-09-16',
    notes: 'Imported cosmetic packaging lacks Country of Origin declaration. Consumer grievance email address missing.',
    imageSrc: createPackageSvg(
      ['#ec4899', '#be185d'],
      'GlowRadiance',
      'SPF 50+ Sun Cream',
      '50 g',
      '₹ 899.00 (incl. taxes)',
      'Mfg: 06/2026 • Batch: GR-441',
      '8906041230194',
      'Helpline: +91-22-68994000 (No Email Provided)',
      true
    ),
    violations: [
      {
        code: 'RULE_6_10_ORIGIN',
        rule: 'Rule 6(10)',
        title: 'Country of Origin Missing on Imported Commodity',
        severity: 'HIGH',
        description: 'Imported cosmetic packaging does not state the country of manufacture or assembly on the exterior carton.',
        statutoryClause: 'Rule 6(10) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'Omitted',
        requiredValue: 'Country of Origin: [Name of Country]'
      },
      {
        code: 'RULE_6_1_N_CONSUMER_CARE',
        rule: 'Rule 6(1)(n)',
        title: 'Incomplete Consumer Grievance Contact Information',
        severity: 'MEDIUM',
        description: 'Phone number provided but mandatory email address of consumer grievance officer is absent.',
        statutoryClause: 'Rule 6(1)(n) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'Phone only',
        requiredValue: 'Name, Address, Tel, and Email ID'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-cos-1',
        label: 'Missing Country of Origin',
        x: 53,
        y: 80,
        width: 32,
        height: 10,
        rule: 'Rule 6(10)',
        status: 'FAIL',
        detectedText: 'Imported by Radiant Cosmeceuticals Ltd',
        requiredStandard: 'Country of origin must be stated explicitly',
        description: 'Origin country absent from importer panel'
      },
      {
        id: 'box-cos-2',
        label: 'Missing Consumer Email',
        x: 15,
        y: 72,
        width: 70,
        height: 7,
        rule: 'Rule 6(1)(n)',
        status: 'FAIL',
        detectedText: '+91-22-68994000 (No Email)',
        requiredStandard: 'Valid email address must be printed',
        description: 'Consumer redressal email absent'
      },
      {
        id: 'box-cos-3',
        label: 'Net Quantity',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 6(1)(c)',
        status: 'PASS',
        detectedText: '50 g (Font height 2.2mm)',
        requiredStandard: '>= 1.5mm for 50g package',
        description: 'Compliant font height and units'
      }
    ]
  },
  {
    id: 'LMR-2026-0938',
    timestamp: '2026-09-16T09:15:00Z',
    productName: 'Krunchy Munchy Masala Potato Wafers (90g)',
    brand: 'Krunchy Snacks',
    manufacturer: 'Krunchy Food Products Pvt Ltd, Pune, MH',
    batchNo: 'KM-260901',
    category: 'Snacks & Confectionery',
    zone: 'Zone E - Suburban Retail & Kirana Clusters',
    retailerName: 'Shree Ganesh Supermarket',
    retailerLocation: 'Naupada, Thane West, Maharashtra',
    netQuantity: '90 g',
    mrpDeclared: '₹ 45.00 (Altered)',
    status: 'FAIL',
    severity: 'CRITICAL',
    confidenceScore: 0.99,
    inspectorName: 'Inspector Vikram Salunkhe',
    inspectorId: 'LMO-MH-4035',
    noticeDate: '2026-09-16',
    notes: 'Severe violation: Adhesive sticker with inflated price of ₹45 placed directly over pre-printed manufacturer MRP of ₹30.',
    imageSrc: createPackageSvg(
      ['#ef4444', '#b91c1c'],
      'Krunchy Snacks',
      'Masala Potato Wafers',
      '90 g',
      '₹ 45.00 [OVER-STICKERED]',
      'Mfg: 09/2026 • Batch: KM-0901',
      '8901239841029',
      'Helpline: 020-25441999 | help@krunchy.co.in',
      true
    ),
    violations: [
      {
        code: 'RULE_6_1_E_MRP',
        rule: 'Rule 6(1)(e) & Rule 18(2)',
        title: 'Tampered / Over-Stickered Maximum Retail Price (MRP)',
        severity: 'CRITICAL',
        description: 'Manufacturer printed MRP ₹30.00 has been illegally covered with a retail barcode sticker declaring inflated MRP of ₹45.00.',
        statutoryClause: 'Rule 18(2) of Legal Metrology (Packaged Commodities) Rules, 2011',
        penaltyClause: 'Section 36(1) & Section 39 of Legal Metrology Act, 2009 (Compounding / Court Prosecution)',
        measuredValue: 'Stickered: ₹45.00 (Base: ₹30.00)',
        requiredValue: 'Original un-tampered printed MRP'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-snack-1',
        label: 'Tampered MRP Overlay',
        x: 50,
        y: 55,
        width: 35,
        height: 8.5,
        rule: 'Rule 18(2)',
        status: 'FAIL',
        detectedText: '₹ 45.00 (Adhesive Sticker detected over ₹30.00)',
        requiredStandard: 'Alteration of MRP strictly prohibited',
        description: 'Illegal price inflation sticker detected by OCR'
      }
    ]
  },
  {
    id: 'LMR-2026-0935',
    timestamp: '2026-09-15T16:20:00Z',
    productName: 'PureHimalaya Organic Raw Multi-Flora Honey (500g)',
    brand: 'PureHimalaya Naturals',
    manufacturer: 'Himalayan Organic Bio Farms, Dehradun, UK',
    batchNo: 'PH-HNY-190',
    category: 'Food & Beverages',
    zone: 'Zone B - Central Metro Hypermarkets',
    retailerName: 'GreenEarth Organics Store',
    retailerLocation: 'Bandra West, Mumbai',
    netQuantity: '500 g',
    mrpDeclared: '₹ 420.00 (incl. of all taxes)',
    status: 'FAIL',
    severity: 'MEDIUM',
    confidenceScore: 0.94,
    inspectorName: 'Inspector Meera Nair',
    inspectorId: 'LMO-MH-3890',
    notes: 'Font height of net quantity numerals measured at 2.4mm, failing the 4.0mm threshold required for 500g packs.',
    imageSrc: createPackageSvg(
      ['#d97706', '#92400e'],
      'PureHimalaya',
      'Organic Multi-Flora Honey',
      '500 g (Font: 2.4mm)',
      '₹ 420.00 (incl. of all taxes)',
      'Packed: 07/2026 • Batch: PH-190',
      '8904019234851',
      'Care: 1800-889-1002 | info@purehimalaya.org',
      true
    ),
    violations: [
      {
        code: 'RULE_7_FONT_SIZE',
        rule: 'Rule 7, Table I',
        title: 'Font Size Below Prescribed Minimum for 500g Packaging',
        severity: 'MEDIUM',
        description: 'Numerals for Net Quantity 500g printed at 2.4mm height. Statutory requirement is minimum 4.0mm.',
        statutoryClause: 'Rule 7, Table I of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: '2.4 mm',
        requiredValue: '>= 4.0 mm'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-honey-1',
        label: 'Font Size Defect',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 7',
        status: 'FAIL',
        detectedText: '500 g (Height: 2.4mm)',
        requiredStandard: 'Minimum height 4.0mm',
        description: 'Numeral height 40% below rule requirement'
      }
    ]
  },
  {
    id: 'LMR-2026-0932',
    timestamp: '2026-09-15T14:10:00Z',
    productName: 'NutriBites Almond Crunch Digestive Cookies (150g)',
    brand: 'NutriBites Bakery',
    manufacturer: 'NutriBites Confectionery Ltd, Peenya, Bengaluru',
    batchNo: 'NB-ALM-808',
    category: 'Snacks & Confectionery',
    zone: 'Zone A - Wholesale Mandi',
    retailerName: 'Metro Cash & Carry Wholesale',
    retailerLocation: 'Borivali East, Mumbai',
    netQuantity: '150 g',
    mrpDeclared: '₹ 60.00 (incl. of all taxes)',
    status: 'PASS',
    severity: 'COMPLIANT',
    confidenceScore: 0.99,
    inspectorName: 'Inspector Amit Patil',
    inspectorId: 'LMO-MH-4105',
    notes: 'All mandatory declarations under Rule 6 and Rule 7 verified. Compliant packaging.',
    imageSrc: createPackageSvg(
      ['#10b981', '#047857'],
      'NutriBites',
      'Almond Digestive Cookies',
      '150 g (Font: 3.2mm)',
      '₹ 60.00 (USP: ₹0.40/g)',
      'Mfg: 08/2026 • Exp: 02/2027 • B: 808',
      '8901238912340',
      'Care: 1800-200-5544 | feedback@nutribites.com',
      false
    ),
    violations: [],
    boundingBoxes: [
      {
        id: 'box-nb-1',
        label: 'Net Quantity',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 6(1)(c)',
        status: 'PASS',
        detectedText: '150 g (3.2mm)',
        requiredStandard: '>= 2.0mm',
        description: 'Compliant font height and metric unit'
      },
      {
        id: 'box-nb-2',
        label: 'MRP & USP',
        x: 50,
        y: 55,
        width: 35,
        height: 8.5,
        rule: 'Rule 6(1)(e) & 6(11)',
        status: 'PASS',
        detectedText: '₹ 60.00 (incl. of all taxes) | USP ₹0.40/g',
        requiredStandard: 'Correct tax format and USP',
        description: 'Fully compliant retail price & unit price'
      }
    ]
  },
  {
    id: 'LMR-2026-0929',
    timestamp: '2026-09-15T11:00:00Z',
    productName: 'SoundPro ANC Wireless Bluetooth Earbuds Gen-3',
    brand: 'SoundPro Audio',
    manufacturer: 'Imported & Marketed by SoundPro India Tech Ltd, Gurugram',
    batchNo: 'SP-BT3-9092',
    category: 'Electronics & Devices',
    zone: 'Zone D - Regional E-Commerce Logistics Hub',
    retailerName: 'QuickKart Fulfillment Center 2',
    retailerLocation: 'Bhiwandi Logistics Park, Thane, MH',
    netQuantity: '1 Piece',
    mrpDeclared: '₹ 2,499.00',
    status: 'FAIL',
    severity: 'HIGH',
    confidenceScore: 0.96,
    inspectorName: 'Inspector Meera Nair',
    inspectorId: 'LMO-MH-3890',
    noticeDate: '2026-09-15',
    notes: 'Missing dimensions of the commodity. Net quantity declared only as 1 piece without mandatory metric dimensions (Rule 6(1)(c)). Missing tax qualifier on MRP.',
    imageSrc: createPackageSvg(
      ['#6366f1', '#4338ca'],
      'SoundPro',
      'ANC Wireless Earbuds',
      '1 Piece (No Dimensions)',
      '₹ 2,499.00 (Missing Tax Text)',
      'Imported: 08/2026 • Batch: SP-9092',
      '8908001928371',
      'Support: support@soundpro.in | Tel: 0124-4902100',
      true
    ),
    violations: [
      {
        code: 'RULE_6_1_C_NET_QTY',
        rule: 'Rule 6(1)(c)',
        title: 'Net Quantity Lacks Mandatory Metric Dimensions',
        severity: 'HIGH',
        description: 'Electronic devices package declares "1 Piece" but fails to specify the physical dimensions (length, width, height) of the unit as prescribed under Rule 6(1)(c).',
        statutoryClause: 'Rule 6(1)(c) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: '1 Piece (No size)',
        requiredValue: '1 Unit / Dimensions: 62mm x 48mm x 25mm'
      },
      {
        code: 'RULE_6_1_E_MRP',
        rule: 'Rule 6(1)(e)',
        title: 'Missing Mandatory "(inclusive of all taxes)" Qualifier on MRP',
        severity: 'MEDIUM',
        description: 'MRP is printed simply as ₹ 2,499.00 without the legally required declaration "inclusive of all taxes".',
        statutoryClause: 'Rule 6(1)(e) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: '₹ 2,499.00',
        requiredValue: '₹ 2,499.00 (inclusive of all taxes)'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-el-1',
        label: 'Net Quantity Defect',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 6(1)(c)',
        status: 'FAIL',
        detectedText: '1 Piece',
        requiredStandard: 'Dimensions must accompany piece count',
        description: 'Metric dimensions absent'
      },
      {
        id: 'box-el-2',
        label: 'MRP Tax Qualifier Absent',
        x: 50,
        y: 55,
        width: 35,
        height: 8.5,
        rule: 'Rule 6(1)(e)',
        status: 'FAIL',
        detectedText: '₹ 2,499.00',
        requiredStandard: 'MRP ₹ 2499 (incl. of all taxes)',
        description: 'Mandatory tax wording omitted'
      }
    ]
  },
  {
    id: 'LMR-2026-0925',
    timestamp: '2026-09-14T17:40:00Z',
    productName: 'SuperClean Oxy Action Laundry Detergent (2kg)',
    brand: 'SuperClean Chemicals',
    manufacturer: 'SuperClean Consumer Products Ltd, Silvassa, D&NH',
    batchNo: 'SC-OXY-202',
    category: 'Household & Detergents',
    zone: 'Zone E - Suburban Retail & Kirana Clusters',
    retailerName: 'Apna Bazar Cooperative Store',
    retailerLocation: 'Dadar West, Mumbai',
    netQuantity: '2 kg',
    mrpDeclared: '₹ 280.00 (incl. of all taxes)',
    status: 'FAIL',
    severity: 'HIGH',
    confidenceScore: 0.97,
    inspectorName: 'Inspector Rajesh Sharma',
    inspectorId: 'LMO-MH-4019',
    noticeDate: '2026-09-15',
    notes: 'Month and Year of packing completely illegible/smeared during printing. Consumer cannot determine packing vintage.',
    imageSrc: createPackageSvg(
      ['#0284c7', '#0369a1'],
      'SuperClean',
      'Oxy Action Detergent 2kg',
      '2 kg',
      '₹ 280.00 (incl. of all taxes)',
      'Batch: SC-202 • Mfg Date: [ILLEGIBLE/SMEARED]',
      '8901004928172',
      'Toll-Free: 1800-11-2244 | care@superclean.co.in',
      true
    ),
    violations: [
      {
        code: 'RULE_6_1_D_DATE',
        rule: 'Rule 6(1)(d)',
        title: 'Month and Year of Manufacture / Packing Illegible',
        severity: 'HIGH',
        description: 'Ink smearing renders the month and year of manufacture completely unreadable on the back panel.',
        statutoryClause: 'Rule 6(1)(d) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'Unreadable ink blob',
        requiredValue: 'MM/YYYY format with min height 2mm'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-det-1',
        label: 'Illegible Packing Date',
        x: 15,
        y: 64.5,
        width: 70,
        height: 6.5,
        rule: 'Rule 6(1)(d)',
        status: 'FAIL',
        detectedText: 'Mfg Date: [Smeared / Indecipherable]',
        requiredStandard: 'Clear MM/YYYY declaration',
        description: 'Defective inkjet printing'
      }
    ]
  },
  {
    id: 'LMR-2026-0922',
    timestamp: '2026-09-14T12:30:00Z',
    productName: 'Arogya Ayurvedic Classical Chyawanprash (1kg)',
    brand: 'Arogya Ayurveda',
    manufacturer: 'Arogya Pharmacy Ltd, Haridwar, Uttarakhand',
    batchNo: 'AR-CHY-99',
    category: 'Pharma & Health Supplements',
    zone: 'Zone B - Central Metro Hypermarkets',
    retailerName: 'Apollo Pharmacy Retail Outlet',
    retailerLocation: 'Andheri West, Mumbai',
    netQuantity: '1 kg',
    mrpDeclared: '₹ 395.00 (incl. of all taxes)',
    status: 'PASS',
    severity: 'COMPLIANT',
    confidenceScore: 0.98,
    inspectorName: 'Inspector Sunita Deshmukh',
    inspectorId: 'LMO-MH-3920',
    notes: 'All mandatory declarations in conformity with Legal Metrology Rules and Drugs & Cosmetics Act standards.',
    imageSrc: createPackageSvg(
      ['#059669', '#047857'],
      'Arogya Ayurveda',
      'Classical Chyawanprash 1kg',
      '1 kg (Font: 4.5mm)',
      '₹ 395.00 (USP: ₹0.40/g)',
      'Mfg: 08/2026 • Exp: 07/2029 • B: AR-99',
      '8901237728190',
      'Care: 1800-180-2211 | helpline@arogyaayur.in',
      false
    ),
    violations: [],
    boundingBoxes: [
      {
        id: 'box-ar-1',
        label: 'Net Quantity',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 6(1)(c)',
        status: 'PASS',
        detectedText: '1 kg (Height: 4.5mm)',
        requiredStandard: '>= 4.0mm',
        description: 'Meets Table-I minimum standards'
      }
    ]
  },
  {
    id: 'LMR-2026-0919',
    timestamp: '2026-09-13T15:50:00Z',
    productName: 'AquaPure Electrolyte Hydration Drink (750ml)',
    brand: 'AquaPure Beverages',
    manufacturer: 'AquaPure Bottling Works, Pune Industrial Area',
    batchNo: 'AP-HYD-502',
    category: 'Food & Beverages',
    zone: 'Zone F - Industrial Packaging & Bottling Zone',
    retailerName: 'Express Highway Pitstop',
    retailerLocation: 'Mumbai-Pune Expressway, Khalapur',
    netQuantity: '750 ml',
    mrpDeclared: '₹ 65.00 (incl. of all taxes)',
    status: 'FAIL',
    severity: 'MEDIUM',
    confidenceScore: 0.93,
    inspectorName: 'Inspector Meera Nair',
    inspectorId: 'LMO-MH-3890',
    notes: 'Consumer care contact number omitted. Only website contact form provided.',
    imageSrc: createPackageSvg(
      ['#06b6d4', '#0891b2'],
      'AquaPure',
      'Electrolyte Hydration Drink',
      '750 ml',
      '₹ 65.00 (incl. of all taxes)',
      'Mfg: 09/2026 • Exp: 03/2027 • B: 502',
      '8904001928374',
      'Website only: www.aquapure.co/contact (No Phone or Email)',
      true
    ),
    violations: [
      {
        code: 'RULE_6_1_N_CONSUMER_CARE',
        rule: 'Rule 6(1)(n)',
        title: 'Telephone Number and Email Missing on Consumer Care Panel',
        severity: 'MEDIUM',
        description: 'Manufacturer provides only a website URL; statutory mandate requires telephone number and email address of grievance cell.',
        statutoryClause: 'Rule 6(1)(n) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'Website URL only',
        requiredValue: 'Telephone number, address and email'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-aq-1',
        label: 'Consumer Care Incomplete',
        x: 15,
        y: 72,
        width: 70,
        height: 7,
        rule: 'Rule 6(1)(n)',
        status: 'FAIL',
        detectedText: 'www.aquapure.co/contact',
        requiredStandard: 'Phone & email required',
        description: 'Statutory contact channels omitted'
      }
    ]
  },
  {
    id: 'LMR-2026-0915',
    timestamp: '2026-09-13T10:15:00Z',
    productName: 'GoldenHarvest Traditional Basmati Rice (5kg Bag)',
    brand: 'GoldenHarvest Agro',
    manufacturer: 'GoldenHarvest Mills Ltd, Karnal, Haryana',
    batchNo: 'GH-BAS-331',
    category: 'Food & Beverages',
    zone: 'Zone A - Wholesale Mandi',
    retailerName: 'Karnal Grains & Spices Syndicate',
    retailerLocation: 'APMC Market Yard, Navi Mumbai',
    netQuantity: '5 kg',
    mrpDeclared: '₹ 540.00 (incl. of all taxes)',
    status: 'FAIL',
    severity: 'HIGH',
    confidenceScore: 0.95,
    inspectorName: 'Inspector Priya Nair',
    inspectorId: 'LMO-MH-4022',
    noticeDate: '2026-09-14',
    notes: 'Font height of net quantity 5kg printed at 2.8mm instead of mandatory 6.0mm for packages exceeding 1kg and up to 5kg.',
    imageSrc: createPackageSvg(
      ['#f59e0b', '#b45309'],
      'GoldenHarvest',
      'Traditional Basmati Rice 5kg',
      '5 kg (Font: 2.8mm)',
      '₹ 540.00 (USP: ₹108/kg)',
      'Pack Date: 08/2026 • Batch: GH-331',
      '8901239912803',
      'Care: 1800-445-1234 | contact@goldenharvest.in',
      true
    ),
    violations: [
      {
        code: 'RULE_7_FONT_SIZE',
        rule: 'Rule 7, Table I',
        title: 'Gross Under-Specification of Net Quantity Font Height',
        severity: 'HIGH',
        description: 'For packages between 1kg and 5kg, minimum height of numerals is 6.0mm. Found only 2.8mm.',
        statutoryClause: 'Rule 7, Table I of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: '2.8 mm',
        requiredValue: '>= 6.0 mm'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-gh-1',
        label: 'Font Size Defect (5kg Bag)',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 7',
        status: 'FAIL',
        detectedText: '5 kg (2.8mm)',
        requiredStandard: '>= 6.0mm for 5kg pack',
        description: 'Height is 53% below statutory requirement'
      }
    ]
  },
  {
    id: 'LMR-2026-0911',
    timestamp: '2026-09-12T16:00:00Z',
    productName: 'PowerBolt 65W GaN Fast Charger & Type-C Cable',
    brand: 'PowerBolt Technologies',
    manufacturer: 'Imported by PowerBolt India Electronics, Andheri East',
    batchNo: 'PB-GAN-65',
    category: 'Electronics & Devices',
    zone: 'Zone C - Seaport Customs & Air Cargo Terminal',
    retailerName: 'Sahar Air Cargo Customs Terminal',
    retailerLocation: 'Air Cargo Complex, Sahar, Mumbai Airport',
    netQuantity: '1 Set (1 Adapter, 1 Cable)',
    mrpDeclared: '₹ 1,899.00 (incl. of all taxes)',
    status: 'FAIL',
    severity: 'CRITICAL',
    confidenceScore: 0.98,
    inspectorName: 'Inspector Vikram Salunkhe',
    inspectorId: 'LMO-MH-4035',
    noticeDate: '2026-09-13',
    notes: 'Imported electronic consignee failed to mention country of manufacture and month/year of import on outer packaging.',
    imageSrc: createPackageSvg(
      ['#3b82f6', '#1d4ed8'],
      'PowerBolt',
      '65W GaN Fast Charger',
      '1 Set (Adapter + Cable)',
      '₹ 1,899.00 (incl. of all taxes)',
      'Batch: PB-GAN-65 • Import Date: [MISSING]',
      '8906001239841',
      'Support: care@powerbolt.in | 1800-890-4433',
      true
    ),
    violations: [
      {
        code: 'RULE_6_10_ORIGIN',
        rule: 'Rule 6(10)',
        title: 'Country of Origin Omitted on Commercial Importation',
        severity: 'CRITICAL',
        description: 'Commodity originated outside India; failure to declare Country of Origin on customs clearance packaging.',
        statutoryClause: 'Rule 6(10) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'Missing',
        requiredValue: 'Country of Origin declaration required'
      },
      {
        code: 'RULE_6_1_D_DATE',
        rule: 'Rule 6(1)(d)',
        title: 'Month and Year of Importation Omitted',
        severity: 'HIGH',
        description: 'Mandatory declaration of Month and Year of import not marked on outer box.',
        statutoryClause: 'Rule 6(1)(d) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'Missing',
        requiredValue: 'MM/YYYY of Import'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-pb-1',
        label: 'Origin Omitted',
        x: 53,
        y: 80,
        width: 32,
        height: 10,
        rule: 'Rule 6(10)',
        status: 'FAIL',
        detectedText: 'Imported by PowerBolt India Electronics',
        requiredStandard: 'Country of origin must be stated',
        description: 'Origin absent'
      },
      {
        id: 'box-pb-2',
        label: 'Missing Import Date',
        x: 15,
        y: 64.5,
        width: 70,
        height: 6.5,
        rule: 'Rule 6(1)(d)',
        status: 'FAIL',
        detectedText: 'Batch: PB-GAN-65 (No Date)',
        requiredStandard: 'Month and Year of import required',
        description: 'Import date omitted'
      }
    ]
  },
  {
    id: 'LMR-2026-0908',
    timestamp: '2026-09-12T11:20:00Z',
    productName: 'SilkTouch Ultra Soft Moisture Bath Soap (4 x 125g)',
    brand: 'SilkTouch Personal Care',
    manufacturer: 'SilkTouch Care Products Ltd, Haridwar',
    batchNo: 'ST-SOAP-990',
    category: 'Cosmetics & Personal Care',
    zone: 'Zone E - Suburban Retail & Kirana Clusters',
    retailerName: 'DMart Hypermarket',
    retailerLocation: 'Kalyan West, Maharashtra',
    netQuantity: '500 g (When Packed)',
    mrpDeclared: '₹ 190.00 (incl. of all taxes)',
    status: 'PASS',
    severity: 'COMPLIANT',
    confidenceScore: 0.97,
    inspectorName: 'Inspector Meera Nair',
    inspectorId: 'LMO-MH-3890',
    notes: 'Multi-piece pack clearly states individual piece weight (125g) and total net quantity (500g). Compliant.',
    imageSrc: createPackageSvg(
      ['#8b5cf6', '#6d28d9'],
      'SilkTouch',
      'Ultra Soft Moisture Soap (4x125g)',
      '500 g (4 Units x 125g)',
      '₹ 190.00 (USP: ₹0.38/g)',
      'Mfg: 07/2026 • Exp: 06/2028 • B: 990',
      '8901030554129',
      'Helpline: 1800-22-9900 | care@silktouch.com',
      false
    ),
    violations: [],
    boundingBoxes: [
      {
        id: 'box-st-1',
        label: 'Net Quantity',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 6(1)(c)',
        status: 'PASS',
        detectedText: '500 g (4 x 125g)',
        requiredStandard: 'Multipack declaration compliant',
        description: 'Individual and aggregate weight declared'
      }
    ]
  },
  {
    id: 'LMR-2026-0905',
    timestamp: '2026-09-11T14:45:00Z',
    productName: 'ChefChoice Rich Tomato Ketchup (1kg Bottle)',
    brand: 'ChefChoice Foods',
    manufacturer: 'ChefChoice Food Products, Baramati, Maharashtra',
    batchNo: 'CC-KET-81',
    category: 'Food & Beverages',
    zone: 'Zone B - Central Metro Hypermarkets',
    retailerName: 'Reliance Smart Superstore',
    retailerLocation: 'Goregaon East, Mumbai',
    netQuantity: '1 kg',
    mrpDeclared: '₹ 145.00',
    status: 'FAIL',
    severity: 'MEDIUM',
    confidenceScore: 0.95,
    inspectorName: 'Inspector Amit Patil',
    inspectorId: 'LMO-MH-4105',
    noticeDate: '2026-09-12',
    notes: 'Retail sale price printed as "MRP Rs 145" without mandatory "(inclusive of all taxes)" statement.',
    imageSrc: createPackageSvg(
      ['#dc2626', '#991b1b'],
      'ChefChoice',
      'Rich Tomato Ketchup 1kg',
      '1 kg',
      'MRP Rs 145 (No Tax Disclaimer)',
      'Mfg: 08/2026 • Exp: 05/2027 • B: 81',
      '8901050293817',
      'Feedback: 02112-224410 | info@chefchoice.co.in',
      true
    ),
    violations: [
      {
        code: 'RULE_6_1_E_MRP',
        rule: 'Rule 6(1)(e)',
        title: 'Absence of "(inclusive of all taxes)" on MRP declaration',
        severity: 'MEDIUM',
        description: 'The letters "incl. of all taxes" must be clearly printed along with the MRP.',
        statutoryClause: 'Rule 6(1)(e) of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'MRP Rs 145',
        requiredValue: 'MRP ₹ 145.00 (inclusive of all taxes)'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-cc-1',
        label: 'Missing Tax Text',
        x: 50,
        y: 55,
        width: 35,
        height: 8.5,
        rule: 'Rule 6(1)(e)',
        status: 'FAIL',
        detectedText: 'MRP Rs 145',
        requiredStandard: 'Must include "(incl. of all taxes)"',
        description: 'Mandatory tax phrasing missing'
      }
    ]
  },
  {
    id: 'LMR-2026-0902',
    timestamp: '2026-09-10T16:15:00Z',
    productName: 'QuickShip E-Commerce Multi-Item Polymailer Bag',
    brand: 'QuickKart Logistics',
    manufacturer: 'Packed by QuickKart Logistics Hub 4, Bhiwandi',
    batchNo: 'QK-LOG-9014',
    category: 'E-Commerce Logistics',
    zone: 'Zone D - Regional E-Commerce Logistics Hub',
    retailerName: 'QuickKart E-Commerce Sortation Hub',
    retailerLocation: 'Bhiwandi-Nashik Highway, MH',
    netQuantity: '2 Units',
    mrpDeclared: '₹ 1,199.00 (incl. of all taxes)',
    status: 'FAIL',
    severity: 'HIGH',
    confidenceScore: 0.94,
    inspectorName: 'Inspector Sunita Deshmukh',
    inspectorId: 'LMO-MH-3920',
    noticeDate: '2026-09-11',
    notes: 'Secondary e-commerce polymailer obscuring primary packaged commodity declarations without carrying outer manifest declarations.',
    imageSrc: createPackageSvg(
      ['#475569', '#334155'],
      'QuickKart',
      'E-Commerce Shipping Outer',
      '2 Units (No Content Detail)',
      '₹ 1,199.00 (incl. of all taxes)',
      'Packed: 10/09/2026 • AWBM: QK99281',
      '8909876543210',
      'Consumer Cell: grievance@quickkart.com | 022-69001122',
      true
    ),
    violations: [
      {
        code: 'RULE_6_1_A_MANUFACTURER',
        rule: 'Rule 6(1)(a) & Rule 26',
        title: 'Secondary Packaging Obscures Mandatory Declarations',
        severity: 'HIGH',
        description: 'Opaque secondary plastic packaging conceals the mandatory declarations of individual pre-packaged commodities without duplicating them on the outer wrapper.',
        statutoryClause: 'Rule 26 of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'Outer wrap opaque without declarations',
        requiredValue: 'Outer wrapper must carry all mandatory declarations or remain transparent'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-qk-1',
        label: 'Opaque Secondary Wrap Defect',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
        rule: 'Rule 26',
        status: 'FAIL',
        detectedText: 'Opaque Polybag Wrap',
        requiredStandard: 'Mandatory declarations must be visible',
        description: 'Primary label obscured by outer bag'
      }
    ]
  },
  {
    id: 'LMR-2026-0899',
    timestamp: '2026-09-10T11:00:00Z',
    productName: 'GreenValley Darjeeling Single Estate Tea (100 Tea Bags)',
    brand: 'GreenValley Estate',
    manufacturer: 'GreenValley Tea Estates Ltd, Kurseong, West Bengal',
    batchNo: 'GV-DJ-402',
    category: 'Food & Beverages',
    zone: 'Zone B - Central Metro Hypermarkets',
    retailerName: 'Nature’s Basket Gourmet',
    retailerLocation: 'Juhu Tara Road, Mumbai',
    netQuantity: '200 g (100 Tea Bags x 2g)',
    mrpDeclared: '₹ 450.00 (incl. of all taxes)',
    status: 'PASS',
    severity: 'COMPLIANT',
    confidenceScore: 0.99,
    inspectorName: 'Inspector Meera Nair',
    inspectorId: 'LMO-MH-3890',
    notes: 'Packaging meets all Legal Metrology standards including Unit Sale Price (₹2.25/g) and individual bag count.',
    imageSrc: createPackageSvg(
      ['#15803d', '#166534'],
      'GreenValley',
      'Darjeeling Single Estate Tea',
      '200 g (100 Bags x 2g)',
      '₹ 450.00 (USP: ₹2.25/g)',
      'Packed: 08/2026 • Best Before: 08/2028',
      '8901234908125',
      'Helpline: 1800-333-8822 | estates@greenvalley.in',
      false
    ),
    violations: [],
    boundingBoxes: [
      {
        id: 'box-gv-1',
        label: 'Full Compliance Area',
        x: 15,
        y: 55,
        width: 70,
        height: 25,
        rule: 'Rules 6 & 7',
        status: 'PASS',
        detectedText: 'All declarations present & verified',
        requiredStandard: 'LMPC 2011 Standards',
        description: 'Fully compliant packaging'
      }
    ]
  },
  {
    id: 'LMR-2026-0895',
    timestamp: '2026-09-09T14:15:00Z',
    productName: 'BioFresh Anti-Bacterial Hand Sanitizer (500ml)',
    brand: 'BioFresh Healthcare',
    manufacturer: 'BioFresh Laboratories Ltd, Daman',
    batchNo: 'BF-SAN-110',
    category: 'Pharma & Health Supplements',
    zone: 'Zone E - Suburban Retail & Kirana Clusters',
    retailerName: 'Wellness Forever 24x7 Chemist',
    retailerLocation: 'Vile Parle East, Mumbai',
    netQuantity: '500 ml',
    mrpDeclared: '₹ 250.00 (incl. of all taxes)',
    status: 'FAIL',
    severity: 'MEDIUM',
    confidenceScore: 0.93,
    inspectorName: 'Inspector Priya Nair',
    inspectorId: 'LMO-MH-4022',
    notes: 'Font height of net quantity 500ml is 2.2mm against mandatory minimum 4.0mm.',
    imageSrc: createPackageSvg(
      ['#0284c7', '#075985'],
      'BioFresh',
      'Hand Sanitizer 500ml',
      '500 ml (Font: 2.2mm)',
      '₹ 250.00 (incl. of all taxes)',
      'Mfg: 08/2026 • Exp: 07/2028 • B: 110',
      '8906029381720',
      'Helpline: 1800-44-1234 | care@biofreshlab.com',
      true
    ),
    violations: [
      {
        code: 'RULE_7_FONT_SIZE',
        rule: 'Rule 7, Table I',
        title: 'Font Height Below Minimum Standard on 500ml Pack',
        severity: 'MEDIUM',
        description: 'Numerals for Net Quantity printed at 2.2mm instead of mandatory 4.0mm.',
        statutoryClause: 'Rule 7 of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: '2.2 mm',
        requiredValue: '>= 4.0 mm'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-bf-1',
        label: 'Font Size Defect',
        x: 15,
        y: 55,
        width: 33,
        height: 8.5,
        rule: 'Rule 7',
        status: 'FAIL',
        detectedText: '500 ml (2.2mm)',
        requiredStandard: '>= 4.0mm',
        description: 'Font height deficiency'
      }
    ]
  },
  {
    id: 'LMR-2026-0891',
    timestamp: '2026-09-08T15:00:00Z',
    productName: 'FreshBake 100% Whole Wheat Brown Bread (400g)',
    brand: 'FreshBake Foods',
    manufacturer: 'FreshBake Artisanal Bakers, Navi Mumbai',
    batchNo: 'FB-BRD-08',
    category: 'Food & Beverages',
    zone: 'Zone E - Suburban Retail & Kirana Clusters',
    retailerName: 'Foodland Supermarket',
    retailerLocation: 'Khar West, Mumbai',
    netQuantity: '400 g',
    mrpDeclared: '₹ 55.00 (incl. of all taxes)',
    status: 'FAIL',
    severity: 'HIGH',
    confidenceScore: 0.96,
    inspectorName: 'Inspector Vikram Salunkhe',
    inspectorId: 'LMO-MH-4035',
    noticeDate: '2026-09-09',
    notes: 'Perishable commodity with shelf life under 7 days missing hour/time of manufacture as prescribed under amended food packaging rules.',
    imageSrc: createPackageSvg(
      ['#78350f', '#451a03'],
      'FreshBake',
      'Whole Wheat Brown Bread',
      '400 g',
      '₹ 55.00 (incl. of all taxes)',
      'Date: 08/09/2026 (No Time/Hour Marked)',
      '8901237890123',
      'Customer Care: 022-27781000 | order@freshbake.in',
      true
    ),
    violations: [
      {
        code: 'RULE_6_1_D_DATE',
        rule: 'Rule 6(1)(d), Proviso',
        title: 'Time / Hour of Packing Omitted on Perishable Bakery Item',
        severity: 'HIGH',
        description: 'For packages having shelf life less than seven days, the time of manufacture or packaging must be stated alongside the date.',
        statutoryClause: 'Rule 6(1)(d), Second Proviso of LMPC Rules, 2011',
        penaltyClause: 'Section 36(1) of Legal Metrology Act, 2009',
        measuredValue: 'Date only',
        requiredValue: 'Date and hour of packaging'
      }
    ],
    boundingBoxes: [
      {
        id: 'box-fb-1',
        label: 'Missing Time of Packaging',
        x: 15,
        y: 64.5,
        width: 70,
        height: 6.5,
        rule: 'Rule 6(1)(d)',
        status: 'FAIL',
        detectedText: '08/09/2026',
        requiredStandard: 'Date & hour of baking required',
        description: 'Time stamp omitted'
      }
    ]
  },
  {
    id: 'LMR-2026-0888',
    timestamp: '2026-09-07T12:00:00Z',
    productName: 'EverLast Heavy Duty Alkaline AA Batteries (4 Pack)',
    brand: 'EverLast Power',
    manufacturer: 'Imported by EverLast Energy India Pvt Ltd, Chennai',
    batchNo: 'EL-AA-401',
    category: 'Electronics & Devices',
    zone: 'Zone C - Seaport Customs & Air Cargo Terminal',
    retailerName: 'Customs Container Freight Station',
    retailerLocation: 'JNPT Port Area, Nhava Sheva, Maharashtra',
    netQuantity: '4 Numbers (AA Cells)',
    mrpDeclared: '₹ 160.00 (incl. of all taxes)',
    status: 'PASS',
    severity: 'COMPLIANT',
    confidenceScore: 0.98,
    inspectorName: 'Inspector Amit Patil',
    inspectorId: 'LMO-MH-4105',
    notes: 'Imported battery pack fully marked with country of origin, importer address, month/year of import, and unit sale price (₹40.00 per unit).',
    imageSrc: createPackageSvg(
      ['#475569', '#1e293b'],
      'EverLast',
      'Heavy Duty Alkaline AA (4-Pack)',
      '4 Numbers (AA Cells)',
      '₹ 160.00 (USP: ₹40.00/N)',
      'Imported: 08/2026 • Origin: Singapore',
      '8908876123456',
      'Care: 1800-22-1144 | service@everlastpower.in',
      false
    ),
    violations: [],
    boundingBoxes: [
      {
        id: 'box-el-batt-1',
        label: 'Verified Compliance',
        x: 15,
        y: 55,
        width: 70,
        height: 25,
        rule: 'Rules 6 & 7',
        status: 'PASS',
        detectedText: 'All declarations present & verified',
        requiredStandard: 'LMPC 2011 Import Standards',
        description: 'Fully compliant'
      }
    ]
  }
];

const RECORD_GEO_METADATA: Record<string, {
  lat: number;
  lng: number;
  district: string;
  state: string;
  pincode: string;
  complianceResult: 'Compliant' | 'Violation Detected' | 'Under Investigation' | 'Pending Verification' | 'Notice Issued';
  applicableRule: string;
  recommendedAction: string;
  statusOverride?: InspectionStatus;
  seventhScheduleForm?: {
    formType: 'FORM_A' | 'FORM_B';
    formNumber: string;
    registrationRef?: string;
    verificationDate?: string;
    remarks?: string;
  };
  isRepeatOffender?: boolean;
  previousViolationsCount?: number;
}> = {
  'LMR-2026-0941': {
    lat: 19.0760,
    lng: 73.0033,
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '400703',
    complianceResult: 'Violation Detected',
    applicableRule: 'Rule 6(11) (Missing USP) & Rule 7 (Font Size 2.1mm vs 4.0mm)',
    recommendedAction: 'Issue Form VI Statutory Notice under Sec. 36(1)'
  },
  'LMR-2026-0940': {
    lat: 18.9953,
    lng: 72.8258,
    district: 'Mumbai City',
    state: 'Maharashtra',
    pincode: '400013',
    complianceResult: 'Violation Detected',
    applicableRule: 'Rule 6(10) (Country of Origin) & Rule 6(1)(n) (Consumer Care)',
    recommendedAction: 'Issue Compounding Show-Cause Notice'
  },
  'LMR-2026-0938': {
    lat: 19.1910,
    lng: 72.9660,
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '400602',
    complianceResult: 'Violation Detected',
    applicableRule: 'Rule 18(2) (Tampered / Over-stickered MRP)',
    recommendedAction: 'Immediate Seizure Order & Prosecution Filing',
    isRepeatOffender: true,
    previousViolationsCount: 2
  },
  'LMR-2026-0935': {
    lat: 19.0596,
    lng: 72.8295,
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400050',
    complianceResult: 'Violation Detected',
    applicableRule: 'Rule 7, Table-I (Font Height 2.4mm vs 4.0mm)',
    recommendedAction: 'Issue Rectification Warning Notice'
  },
  'LMR-2026-0932': {
    lat: 19.2288,
    lng: 72.8541,
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400092',
    complianceResult: 'Compliant',
    applicableRule: 'Rules 6, 7 & 8 (All Declarations Verified)',
    recommendedAction: 'Grant Statutory Compliance Certificate',
    seventhScheduleForm: {
      formType: 'FORM_B',
      formNumber: 'SCH-7/B-2026/0491',
      registrationRef: 'REG-MH-LMR-1104',
      verificationDate: '2026-09-15',
      remarks: 'Compliant verification certificate issued under Seventh Schedule'
    }
  },
  'LMR-2026-0929': {
    lat: 19.0860,
    lng: 72.8890,
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '421302',
    complianceResult: 'Violation Detected',
    applicableRule: 'Rule 26 (Secondary E-Commerce Polybag Packaging)',
    recommendedAction: 'Issue Notice to E-Commerce Fulfillment Center',
    isRepeatOffender: true,
    previousViolationsCount: 3
  },
  'LMR-2026-0925': {
    lat: 18.9474,
    lng: 72.8344,
    district: 'Mumbai City',
    state: 'Maharashtra',
    pincode: '400001',
    complianceResult: 'Compliant',
    applicableRule: 'Rule 6(1) & Rule 12 (Net Quantity & Lot Standards)',
    recommendedAction: 'Verification Stamping Approved',
    seventhScheduleForm: {
      formType: 'FORM_A',
      formNumber: 'SCH-7/A-2026/0812',
      registrationRef: 'REG-MH-LMR-0982',
      verificationDate: '2026-09-14',
      remarks: 'Manufacturer packaging inspection verified under Seventh Schedule'
    }
  },
  'LMR-2026-0922': {
    lat: 19.0178,
    lng: 72.8478,
    district: 'Mumbai City',
    state: 'Maharashtra',
    pincode: '400028',
    complianceResult: 'Under Investigation',
    applicableRule: 'Section 15 (On-site Sample Mass Calibration)',
    recommendedAction: 'Physical Tare Weight Measurement in Progress',
    statusOverride: 'IN_PROGRESS'
  },
  'LMR-2026-0919': {
    lat: 19.2967,
    lng: 73.0631,
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '421201',
    complianceResult: 'Violation Detected',
    applicableRule: 'Rule 6(1)(d) (Missing Manufacturing / Packing Month)',
    recommendedAction: 'Issue Form VI Notice with 15-day Compliance Window'
  },
  'LMR-2026-0915': {
    lat: 19.0657,
    lng: 72.8687,
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400051',
    complianceResult: 'Compliant',
    applicableRule: 'LMPC Amendment Rules 2021 (Dual Unit & USP Verified)',
    recommendedAction: 'Inspection Closed - Compliant',
    seventhScheduleForm: {
      formType: 'FORM_B',
      formNumber: 'SCH-7/B-2026/0388',
      registrationRef: 'REG-MH-LMR-0551',
      verificationDate: '2026-09-13',
      remarks: 'Standard verification stamping certificate registered'
    }
  },
  'LMR-2026-0911': {
    lat: 18.9500,
    lng: 72.9500,
    district: 'Raigad',
    state: 'Maharashtra',
    pincode: '400707',
    complianceResult: 'Violation Detected',
    applicableRule: 'Rule 6(10) (Missing Importer & Origin Details)',
    recommendedAction: 'Detention of Consignment under Section 15'
  },
  'LMR-2026-0908': {
    lat: 19.0864,
    lng: 72.9081,
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400077',
    complianceResult: 'Compliant',
    applicableRule: 'Rule 6(1) & Rule 7 (Table-I Font Standards Verified)',
    recommendedAction: 'Annual Verification Clearance'
  },
  'LMR-2026-0905': {
    lat: 19.0820,
    lng: 73.0200,
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '400705',
    complianceResult: 'Pending Verification',
    applicableRule: 'Section 15 (Scheduled Bulk Mandi Grain Audit)',
    recommendedAction: 'Awaiting Inspector Squad Field Arrival',
    statusOverride: 'PENDING'
  },
  'LMR-2026-0902': {
    lat: 19.1415,
    lng: 72.8285,
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400053',
    complianceResult: 'Violation Detected',
    applicableRule: 'Rule 6(1)(n) (Helpline / Consumer Care Phone Inactive)',
    recommendedAction: 'Issue Show Cause Notice to Brand Manufacturer'
  },
  'LMR-2026-0899': {
    lat: 19.1726,
    lng: 72.9425,
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400080',
    complianceResult: 'Compliant',
    applicableRule: 'Rules 6, 7 & 18 (Standard Unit Pricing Compliant)',
    recommendedAction: 'Routine Inspection Completed'
  },
  'LMR-2026-0895': {
    lat: 19.0600,
    lng: 73.1300,
    district: 'Raigad',
    state: 'Maharashtra',
    pincode: '410206',
    complianceResult: 'Under Investigation',
    applicableRule: 'Rule 24 (Maximum Permissible Error in Net Weight)',
    recommendedAction: 'Volumetric Gravimetric Test Underway',
    statusOverride: 'IN_PROGRESS'
  },
  'LMR-2026-0891': {
    lat: 18.9000,
    lng: 73.1700,
    district: 'Raigad',
    state: 'Maharashtra',
    pincode: '410207',
    complianceResult: 'Violation Detected',
    applicableRule: 'Rule 6(1)(c) (Non-standard Metric Symbols used)',
    recommendedAction: 'Issue Statutory Caution & Form VI Order'
  },
  'LMR-2026-0888': {
    lat: 19.0980,
    lng: 72.8680,
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400099',
    complianceResult: 'Compliant',
    applicableRule: 'Rules 6 & 7 (Electronics Importer Standards)',
    recommendedAction: 'Customs Cargo Clearance Stamped',
    seventhScheduleForm: {
      formType: 'FORM_A',
      formNumber: 'SCH-7/A-2026/0219',
      registrationRef: 'REG-MH-LMR-0104',
      verificationDate: '2026-09-08',
      remarks: 'Customs Cargo Importer Seventh Schedule Declaration verified'
    }
  }
};

export const SEED_INSPECTIONS: InspectionRecord[] = BASE_INSPECTIONS.map(rec => {
  const meta = RECORD_GEO_METADATA[rec.id];
  if (!meta) {
    return {
      ...rec,
      inspectorName: rec.inspectorName || 'Inspector Rajesh Sharma',
      inspectorId: rec.inspectorId || 'LMO-MH-4019',
      district: 'Thane',
      state: 'Maharashtra',
      pincode: '400703'
    };
  }
  const isCompliant = meta.complianceResult === 'Compliant';
  return {
    ...rec,
    inspectorName: rec.inspectorName || 'Inspector Rajesh Sharma',
    inspectorId: rec.inspectorId || 'LMO-MH-4019',
    coordinates: { lat: meta.lat, lng: meta.lng },
    district: meta.district,
    state: meta.state || 'Maharashtra',
    pincode: meta.pincode,
    seventhScheduleForm: meta.seventhScheduleForm,
    isRepeatOffender: meta.isRepeatOffender || false,
    previousViolationsCount: meta.previousViolationsCount || 0,
    complianceResult: meta.complianceResult,
    applicableRule: meta.applicableRule,
    recommendedAction: meta.recommendedAction,
    status: meta.statusOverride || (isCompliant ? 'PASS' : rec.status),
    severity: isCompliant ? 'COMPLIANT' : rec.severity,
    violations: isCompliant ? [] : rec.violations
  };
});

// Clean Dashboard: zero mock data loaded initially
export const MOCK_INSPECTIONS: InspectionRecord[] = [];

// Citizen Complaints (Red Hotspots Layer) strictly focused on:
// 1. Overcharging above MRP
// 2. Missing Unit Sale Price (USP)
export const SEED_CITIZEN_COMPLAINTS: CitizenComplaint[] = [
  {
    id: 'CMP-MH-2026-0042',
    source: 'National Consumer Helpline',
    complainantType: 'Citizen',
    complainantName: 'Kavita Deshpande',
    complainantPhone: '+91 98201 77312',
    shopName: 'Metro Mart & Provisions',
    complaintType: 'Overcharging above MRP',
    commodity: 'Packaged Dairy & Beverages',
    brand: 'PureDesi',
    description: 'Packaged 1L A2 Cow Milk with printed MRP ₹72.00 sold at ₹85.00 with manual billing override. Merchant claimed cooling charges.',
    address: 'Shop 4, Chhatrapati Shivaji Terminus Road, Fort, Mumbai',
    district: 'Mumbai City',
    state: 'Maharashtra',
    pincode: '400001',
    coordinates: { lat: 18.9388, lng: 72.8354 },
    complaintDate: '2026-09-16T08:20:00Z',
    status: 'PENDING_DISPATCH',
    reportedProduct: 'PureDesi A2 Cow Milk (1 Litre)',
    photoEvidence: createPackageSvg(
      ['#0284c7', '#0369a1'],
      'PureDesi',
      'A2 Cow Milk 1L',
      '1 Litre',
      '₹ 72.00 (Sold at ₹85)',
      'Mfg: 15/09/2026',
      '8901234567890',
      'Helpline: 1800-111-222',
      true
    ),
    previousViolationsFound: 2
  },
  {
    id: 'CMP-MH-2026-0039',
    source: 'INGRAM Portal',
    complainantType: 'Citizen',
    complainantName: 'Rahul M. Shah',
    complainantPhone: '+91 98214 55901',
    shopName: 'Shree Krishna Daily Superstore',
    complaintType: 'Missing Unit Sale Price (USP)',
    commodity: 'Packaged Cereals & Pulses',
    brand: 'CrispyOats',
    description: 'Imported breakfast cereals and large 5kg detergent packs displayed without statutory Unit Sale Price per gram/kg on the shelf and package.',
    address: 'Near Station Road, Sector 17, Vashi, Navi Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '400703',
    coordinates: { lat: 19.0735, lng: 72.9985 },
    complaintDate: '2026-09-15T14:45:00Z',
    status: 'PENDING_DISPATCH',
    reportedProduct: 'CrispyOats Jumbo Cereal Pack (1.2kg)',
    photoEvidence: createPackageSvg(
      ['#f59e0b', '#b45309'],
      'CrispyOats',
      'Jumbo Honey Almond Cereal',
      '1.2 kg',
      '₹ 499.00 (No USP)',
      'Mfg: 08/2026',
      '8909876543210',
      'Care: feedback@crispyoats.com',
      true
    ),
    previousViolationsFound: 1
  },
  {
    id: 'CMP-MH-2026-0035',
    source: 'e-Daakhil',
    complainantType: 'NIC Member',
    complainantName: 'Ajay Sharma (NIC Member)',
    complainantPhone: '+91 98199 66341',
    shopName: 'Apex Electronics & Accessories Hub',
    complaintType: 'Dual MRP Sticker',
    commodity: 'Electronics & Hardware',
    brand: 'TurboCharge',
    description: 'Adhesive price label of ₹1,499 stuck directly covering original manufacturer printed MRP of ₹999 on fast charger adapter boxes.',
    address: 'Lamington Road, Grant Road East, Mumbai',
    district: 'Mumbai City',
    state: 'Maharashtra',
    pincode: '400007',
    coordinates: { lat: 18.9634, lng: 72.8164 },
    complaintDate: '2026-09-14T11:10:00Z',
    status: 'PENDING_DISPATCH',
    reportedProduct: 'TurboCharge 65W GaN Adapter',
    photoEvidence: createPackageSvg(
      ['#475569', '#1e293b'],
      'TurboCharge',
      '65W GaN Fast Adapter',
      '1 Unit',
      '₹ 1,499 [STICKER OVER ₹999]',
      'Imported: 07/2026',
      '8904561237890',
      'Support: support@turbocharge.in',
      true
    ),
    previousViolationsFound: 3
  },
  {
    id: 'CMP-MH-2026-0028',
    source: 'Direct Consumer Cell',
    complainantType: 'Citizen',
    complainantName: 'Sunil R. Patil',
    complainantPhone: '+91 98205 33190',
    shopName: 'Sai Samarth Cold Storage & Dairy',
    complaintType: 'Overcharging above MRP',
    commodity: 'Packaged Beverages & Dairy',
    brand: 'Himalayan Spring',
    description: 'Packaged mineral water and ice cream tubs sold at ₹10-₹15 above printed Maximum Retail Price citing refrigeration surcharge.',
    address: 'Naupada, Gokhale Road, Thane West',
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '400602',
    coordinates: { lat: 19.1870, lng: 72.9720 },
    complaintDate: '2026-09-13T17:30:00Z',
    status: 'INSPECTION_ORDERED',
    reportedProduct: 'Himalayan Spring Mineral Water (1 Litre)',
    assignedInspectorName: 'Inspector Sunita Deshmukh',
    assignedInspectorId: 'INSP-MH-3920',
    assignedAreaCircle: 'Thane Municipal Circle (Naupada / Ghodbunder)',
    noticeDirectiveNo: 'DIR-LMA-2026-8812',
    noticeDispatchedAt: '2026-09-14T09:15:00Z',
    directivePriority: 'URGENT',
    specialInstructions: 'Verify physical refrigeration cooling charge overrides on mineral water and ice cream tubs. Seize non-conforming packaging and issue notice.',
    previousViolationsFound: 0
  },
  {
    id: 'CMP-MH-2026-0015',
    source: 'NIC Member',
    complainantType: 'NIC Member',
    complainantName: 'Dr. S. Ramanathan (NIC Technical Auditor)',
    complainantPhone: '+91 98110 44290',
    shopName: 'Colaba Grand Supermarket',
    complaintType: 'Overcharging above MRP',
    commodity: 'Pre-Packaged Edible Oils',
    brand: 'GoldDrop',
    description: 'NIC audit detected POS billing override charging ₹185 on packages with printed MRP of ₹160.',
    address: 'Colaba Causeway, Near Regal Cinema, Mumbai',
    district: 'Mumbai City',
    state: 'Maharashtra',
    pincode: '400005',
    coordinates: { lat: 18.9220, lng: 72.8315 },
    complaintDate: '2026-09-11T10:00:00Z',
    status: 'RESOLVED',
    reportedProduct: 'GoldDrop Refined Sunflower Oil (1 Litre)',
    assignedInspectorName: 'Inspector Meera Nair',
    assignedInspectorId: 'INSP-MH-3890',
    assignedAreaCircle: 'South Mumbai Circle (Fort / Colaba)',
    noticeDirectiveNo: 'DIR-LMA-2026-9042',
    noticeDispatchedAt: '2026-09-11T12:00:00Z',
    actionTaken: 'COMPOUNDED',
    compoundingAmount: 25000,
    seizureMemoNo: 'SZR-2026-4412',
    inspectionResult: 'Violation Confirmed on Physical Spot Audit',
    complianceStatus: 'COMPOUNDED',
    violation: 'Overcharging above MRP (Section 18)',
    severity: 'HIGH',
    resolutionNotes: 'Inspector conducted physical spot audit at Colaba Grand Supermarket. Confirmed billing override exceeding printed MRP. Offence compounded on-site with ₹25,000 compounding penalty under Section 48 of Legal Metrology Act, 2009. Fine deposited and billing software rectified.',
    resolvedAt: '2026-09-12T16:30:00Z',
    citizenNotificationSent: true,
    citizenNotificationMessage: 'Dear Dr. S. Ramanathan, your complaint Case #CMP-MH-2026-0015 regarding Colaba Grand Supermarket has been investigated by the Legal Metrology Area Inspector and resolved. Action taken: COMPOUNDED (₹25,000 fine collected). Official inspection report filed.',
    citizenNotificationSentAt: '2026-09-12T16:35:00Z',
    previousViolationsFound: 1
  },
  {
    id: 'CMP-MH-2026-0021',
    source: 'Citizen',
    complainantType: 'Citizen',
    complainantName: 'Neha Sen',
    complainantPhone: '+91 98200 44122',
    shopName: 'Bandra Organic Grocers',
    complaintType: 'Missing Unit Sale Price (USP)',
    commodity: 'Packaged Organic Grains',
    brand: 'OrganicValley',
    description: 'Pre-packaged pulses, quinoa, and specialty cold-pressed oils sold without mandatory Unit Sale Price declaration under Rule 6(11).',
    address: 'Hill Road, Near Mehboob Studio, Bandra West, Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400050',
    coordinates: { lat: 19.0544, lng: 72.8280 },
    complaintDate: '2026-09-12T10:15:00Z',
    status: 'PENDING_DISPATCH',
    reportedProduct: 'Organic Black Rice (500g)',
    previousViolationsFound: 1
  }
];

// Clean Dashboard: zero mock complaints loaded initially
export const MOCK_CITIZEN_COMPLAINTS: CitizenComplaint[] = [];

export const SEED_ENFORCEMENT_ALERTS: EnforcementAlert[] = [
  {
    id: 'ALT-2026-101',
    inspectionId: 'LMR-2026-0941',
    retailerName: 'Vashi APMC Wholesale Traders',
    location: 'Sector 19, Vashi, Navi Mumbai',
    alertType: 'CRITICAL_NOTICE',
    title: 'Form VI Statutory Notice Pending Dispatch',
    description: 'Critical infraction: Missing Unit Sale Price & Sub-standard font size on 1L Edible Oil. 48-hour statutory dispatch deadline.',
    deadline: 'Due Today by 17:30 IST',
    statutoryClause: 'Section 36(1) of Legal Metrology Act, 2009',
    actionLabel: 'Dispatch Form VI Notice',
    severity: 'CRITICAL'
  },
  {
    id: 'ALT-2026-102',
    inspectionId: 'LMR-2026-0938',
    retailerName: 'Shree Ganesh Supermarket',
    location: 'Naupada, Thane West',
    alertType: 'REPEAT_OFFENDER',
    title: 'Adhesive Over-Sticker on MRP Detected',
    description: 'Adhesive price sticker inflating retail price from ₹30 to ₹45. Second offense recorded in this fiscal quarter.',
    deadline: 'Seizure Report Due in 24h',
    statutoryClause: 'Rule 18(2) of LMPC Rules, 2011',
    actionLabel: 'Issue Seizure Order',
    severity: 'CRITICAL'
  },
  {
    id: 'ALT-2026-103',
    inspectionId: 'LMR-2026-0940',
    retailerName: 'Luxe Beauty Mart, Palladium Mall',
    location: 'Lower Parel, Mumbai',
    alertType: 'COMPOUNDING_EXPIRY',
    title: 'Compounding Window Expiring (Day 6 of 7)',
    description: 'Imported cosmetic pack lacking Country of Origin. Compounding fee of ₹25,000 pending settlement before prosecution.',
    deadline: 'Expires Tomorrow at 15:00 IST',
    statutoryClause: 'Section 48 (Compounding of Offences)',
    actionLabel: 'Check Compounding Status',
    severity: 'HIGH'
  },
  {
    id: 'ALT-2026-104',
    inspectionId: 'LMR-2026-0929',
    retailerName: 'Bhiwandi Regional Logistics Hub',
    location: 'Bhiwandi, Thane District',
    alertType: 'CRITICAL_NOTICE',
    title: 'Secondary E-Commerce Polybag Non-Compliance',
    description: 'Opaque secondary courier polybags obscuring mandatory inner declarations under Rule 26. Batch audit ordered.',
    deadline: 'Action Due within 48h',
    statutoryClause: 'Rule 26 & Rule 6(1) of LMPC Rules',
    actionLabel: 'Schedule Depot Inspection',
    severity: 'HIGH'
  }
];

// Clean Dashboard: zero mock alerts loaded initially
export const MOCK_ENFORCEMENT_ALERTS: EnforcementAlert[] = [];

export const MOCK_ENFORCEMENT_ZONES: EnforcementZone[] = [
  {
    id: 'zone-a',
    name: 'Zone A - Wholesale Mandi & APMC Hub',
    code: 'ZONE-A-WHS',
    district: 'Navi Mumbai & Thane',
    riskLevel: 'CRITICAL',
    scansCount: 420,
    violationsCount: 118,
    complianceRate: 71.9,
    primaryViolation: 'Font Size Defect (Rule 7)',
    activeInspectors: 4,
    coordinates: { x: 30, y: 40 }
  },
  {
    id: 'zone-b',
    name: 'Zone B - Central Metro Hypermarkets & Malls',
    code: 'ZONE-B-MTR',
    district: 'Mumbai South & Central',
    riskLevel: 'MEDIUM',
    scansCount: 580,
    violationsCount: 72,
    complianceRate: 87.6,
    primaryViolation: 'Consumer Care Incomplete (Rule 6(1)(n))',
    activeInspectors: 5,
    coordinates: { x: 45, y: 55 }
  },
  {
    id: 'zone-c',
    name: 'Zone C - Seaport Customs & Air Cargo Terminal',
    code: 'ZONE-C-CST',
    district: 'JNPT Port & Sahar Freight Hub',
    riskLevel: 'HIGH',
    scansCount: 310,
    violationsCount: 84,
    complianceRate: 72.9,
    primaryViolation: 'Country of Origin Missing (Rule 6(10))',
    activeInspectors: 3,
    coordinates: { x: 20, y: 70 }
  },
  {
    id: 'zone-d',
    name: 'Zone D - Regional E-Commerce Logistics Hub',
    code: 'ZONE-D-ECM',
    district: 'Bhiwandi & Kurla Hubs',
    riskLevel: 'CRITICAL',
    scansCount: 650,
    violationsCount: 175,
    complianceRate: 73.1,
    primaryViolation: 'Secondary Packaging Violation (Rule 26)',
    activeInspectors: 6,
    coordinates: { x: 60, y: 30 }
  },
  {
    id: 'zone-e',
    name: 'Zone E - Suburban Retail & Kirana Clusters',
    code: 'ZONE-E-SUB',
    district: 'Thane & Western Suburbs',
    riskLevel: 'HIGH',
    scansCount: 490,
    violationsCount: 105,
    complianceRate: 78.6,
    primaryViolation: 'Tampered / Stickered MRP (Rule 18(2))',
    activeInspectors: 4,
    coordinates: { x: 50, y: 80 }
  },
  {
    id: 'zone-f',
    name: 'Zone F - Industrial Packaging & Bottling Zone',
    code: 'ZONE-F-IND',
    district: 'Rasayani & Taloja MIDC',
    riskLevel: 'LOW',
    scansCount: 280,
    violationsCount: 22,
    complianceRate: 92.1,
    primaryViolation: 'Date Format Margin (Rule 6(1)(d))',
    activeInspectors: 2,
    coordinates: { x: 75, y: 60 }
  }
];

// Violation Distribution aggregated data
export const VIOLATION_DISTRIBUTION_DATA = [
  { name: 'Missing / Invalid MRP Format', rule: 'Rule 6(1)(e)', count: 68, percentage: 27, color: '#f87171' },
  { name: 'Font Size Below Minimum', rule: 'Rule 7', count: 62, percentage: 24, color: '#fb923c' },
  { name: 'Incomplete Consumer Helpline', rule: 'Rule 6(1)(n)', count: 38, percentage: 15, color: '#fcd34d' },
  { name: 'Missing Month / Year Packing', rule: 'Rule 6(1)(d)', count: 32, percentage: 13, color: '#c4b5fd' },
  { name: 'Country of Origin Omitted', rule: 'Rule 6(10)', count: 28, percentage: 11, color: '#f472b6' },
  { name: 'Missing Unit Sale Price (USP)', rule: 'Rule 6(11)', count: 25, percentage: 10, color: '#67e8f9' }
];

// Category vs Violation Matrix for Heatmap Matrix Mode
export const CATEGORY_RULE_MATRIX = [
  {
    category: 'Food & Beverages',
    mrp: 18,
    fontSize: 28,
    netQty: 14,
    date: 12,
    consumerCare: 8,
    origin: 4,
    totalFailures: 84
  },
  {
    category: 'Cosmetics & Personal Care',
    mrp: 12,
    fontSize: 16,
    netQty: 6,
    date: 5,
    consumerCare: 19,
    origin: 15,
    totalFailures: 73
  },
  {
    category: 'Snacks & Confectionery',
    mrp: 24,
    fontSize: 14,
    netQty: 5,
    date: 8,
    consumerCare: 4,
    origin: 2,
    totalFailures: 57
  },
  {
    category: 'Electronics & Devices',
    mrp: 9,
    fontSize: 4,
    netQty: 18,
    date: 14,
    consumerCare: 7,
    origin: 22,
    totalFailures: 74
  },
  {
    category: 'Household & Detergents',
    mrp: 10,
    fontSize: 11,
    netQty: 7,
    date: 15,
    consumerCare: 6,
    origin: 1,
    totalFailures: 50
  },
  {
    category: 'E-Commerce Logistics',
    mrp: 15,
    fontSize: 9,
    netQty: 12,
    date: 9,
    consumerCare: 11,
    origin: 16,
    totalFailures: 72
  }
];
