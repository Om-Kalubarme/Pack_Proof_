/// Individual 3D package panel captured during the 6-second spatial sweep.
enum SpatialSweepPanelType {
  front('Front PDP', 'Principal Display Panel (Brand, Net Wt, MRP)'),
  right('Right Panel', 'Nutritional Facts & Dietary Claims'),
  back('Back Panel', 'Barcode, FSSAI, Mfg Details, Ingredients'),
  left('Left Panel', 'Consumer Care & Best Before Data'),
  top('Top Seal', 'Top Seal & Batch Number'),
  bottom('Bottom Fold', 'Bottom Gusset & Tare Seal');

  final String label;
  final String description;

  const SpatialSweepPanelType(this.label, this.description);
}

/// A panel captured during spatial sweeping.
class SpatialSweepPanel {
  final SpatialSweepPanelType panelType;
  final bool isCaptured;
  final double surfaceAreaRatio; // Fraction of total surface
  final List<String> detectedDeclarations;
  final double fontHeightMm;
  final double requiredFontHeightMm;
  final bool isFontCompliant;
  final int opticalLegibilityPercent;
  final Map<String, String> structuredDeclarations;
  final List<String> applicableRules;
  final String sideStatus;
  final String statusNotes;

  const SpatialSweepPanel({
    required this.panelType,
    required this.isCaptured,
    required this.surfaceAreaRatio,
    required this.detectedDeclarations,
    this.fontHeightMm = 4.0,
    this.requiredFontHeightMm = 4.0,
    this.isFontCompliant = true,
    this.opticalLegibilityPercent = 95,
    this.structuredDeclarations = const {},
    this.applicableRules = const [],
    this.sideStatus = 'COMPLIANT',
    this.statusNotes = 'Optimal contrast and legible declarations',
  });
}

/// Holistic Rule Engine Evaluation for the unwrapped 3D package
class HolisticRuleEvaluation {
  final bool allMandatoryDeclarationsFound;
  final List<String> verifiedDeclarations;
  final List<String> missingDeclarations;
  final bool fontHeightsCompliant;
  final double minDetectedFontHeightMm;
  final double requiredFontHeightMm;
  final double pdpSurfaceRatioPercent; // e.g. 42.0%
  final bool isPdpRatioCompliant; // Rule 9(1) requirement: >= 40% of front face
  final bool crossPanelBoundaryValid; // Text crossing fold/seam is compliant
  final String holisticVerdictSummary;

  const HolisticRuleEvaluation({
    required this.allMandatoryDeclarationsFound,
    required this.verifiedDeclarations,
    required this.missingDeclarations,
    required this.fontHeightsCompliant,
    required this.minDetectedFontHeightMm,
    required this.requiredFontHeightMm,
    required this.pdpSurfaceRatioPercent,
    required this.isPdpRatioCompliant,
    required this.crossPanelBoundaryValid,
    required this.holisticVerdictSummary,
  });

  bool get isOverallCompliant =>
      allMandatoryDeclarationsFound &&
      fontHeightsCompliant &&
      isPdpRatioCompliant &&
      crossPanelBoundaryValid;
}

/// Complete 2D unwrapped panorama texture map reconstructed from 3D sweep
class UnwrappedTextureMap {
  final String packageId;
  final double sweepDurationSeconds;
  final List<SpatialSweepPanel> panels;
  final HolisticRuleEvaluation evaluation;
  final String textureReconstructionStatus;
  final DateTime timestamp;

  const UnwrappedTextureMap({
    required this.packageId,
    required this.sweepDurationSeconds,
    required this.panels,
    required this.evaluation,
    required this.textureReconstructionStatus,
    required this.timestamp,
  });

  /// Sample reconstructed model matching the design infographic
  factory UnwrappedTextureMap.sample() {
    return UnwrappedTextureMap(
      packageId: 'PKG-3D-SWEEP-4091',
      sweepDurationSeconds: 6.0,
      panels: const [
        SpatialSweepPanel(
          panelType: SpatialSweepPanelType.front,
          isCaptured: true,
          surfaceAreaRatio: 0.38,
          detectedDeclarations: ['Brand Name: GoodLife / Potato Chips', 'Net Quantity (200 g / 1 L)', 'MRP (₹50.00 / ₹145.00)', 'Unit Sale Price (USP)'],
          fontHeightMm: 4.2,
          requiredFontHeightMm: 4.0,
          isFontCompliant: true,
          opticalLegibilityPercent: 97,
          structuredDeclarations: {
            'Brand Name': 'GoodLife Refined Oil',
            'Net Quantity': '1 L',
            'Max Retail Price (MRP)': '₹145.00 (Incl. of all taxes)',
            'Unit Sale Price (USP)': '₹0.145 / ml',
            'Country of Origin': 'India',
          },
          applicableRules: ['Rule 6(1)(a)', 'Rule 6(1)(e)', 'Rule 7(1)', 'Rule 9(1) Table-I'],
          sideStatus: 'COMPLIANT',
          statusNotes: 'Principal Display Panel satisfies surface ratio (≥40%) and numeral font height (≥4.0mm).',
        ),
        SpatialSweepPanel(
          panelType: SpatialSweepPanelType.back,
          isCaptured: true,
          surfaceAreaRatio: 0.38,
          detectedDeclarations: ['EAN-13 Barcode: 8906123456789', 'FSSAI Lic: 10012022000123', 'Manufacturer & Packer Address', 'Ingredients List'],
          fontHeightMm: 2.1,
          requiredFontHeightMm: 1.5,
          isFontCompliant: true,
          opticalLegibilityPercent: 96,
          structuredDeclarations: {
            'EAN-13 Barcode': '8906123456789 (GS1 Verified)',
            'FSSAI License': '10012022000123 (Active)',
            'Manufacturer': 'GoodLife Foods Pvt Ltd, Industrial Area, Solan (H.P.) - 173212',
            'Packer Details': 'Same as Manufacturer',
            'Ingredients': 'Refined Sunflower Oil, Permitted Antioxidant (TBHQ)',
          },
          applicableRules: ['Rule 6(1)(b)', 'Rule 6(1)(d)', 'FSSAI Act Sec. 23'],
          sideStatus: 'COMPLIANT',
          statusNotes: 'GS1 Barcode matched to registered brand entity. FSSAI License active.',
        ),
        SpatialSweepPanel(
          panelType: SpatialSweepPanelType.right,
          isCaptured: true,
          surfaceAreaRatio: 0.12,
          detectedDeclarations: ['Nutritional Information Table', 'Per 100g Energy (540 kcal)', 'Vegetarian Green Dot Logo'],
          fontHeightMm: 1.8,
          requiredFontHeightMm: 1.5,
          isFontCompliant: true,
          opticalLegibilityPercent: 94,
          structuredDeclarations: {
            'Nutritional Values': 'Energy: 540 kcal, Protein: 0g, Total Fat: 60g, Saturated Fat: 6.8g',
            'Added Sugars': '0 g',
            'Sodium': '12 mg',
            'Dietary Symbol': 'Vegetarian Green Dot inside Green Square (Rule 2.2.2 FSSAI)',
          },
          applicableRules: ['FSSAI Labelling & Display Regulations', 'Rule 6(1)'],
          sideStatus: 'COMPLIANT',
          statusNotes: 'Nutritional facts table legible with correct statutory green dot iconography.',
        ),
        SpatialSweepPanel(
          panelType: SpatialSweepPanelType.left,
          isCaptured: true,
          surfaceAreaRatio: 0.12,
          detectedDeclarations: ['Consumer Care Cell Toll-Free', 'Email: care@goodlife.in', 'Best Before 9 Months'],
          fontHeightMm: 1.9,
          requiredFontHeightMm: 1.5,
          isFontCompliant: true,
          opticalLegibilityPercent: 95,
          structuredDeclarations: {
            'Customer Care Toll-Free': '1800-11-4082',
            'Customer Care Email': 'grievance@goodlife.in',
            'Grievance Address': 'Officer In-Charge, GoodLife Customer Relations, New Delhi',
            'Best Before': 'Best Before 9 Months from date of packaging',
          },
          applicableRules: ['Rule 6(1)(f) Consumer Grievance', 'Rule 6(1)(d)'],
          sideStatus: 'COMPLIANT',
          statusNotes: 'Complete consumer grievance contact mechanism present and unambiguous.',
        ),
        SpatialSweepPanel(
          panelType: SpatialSweepPanelType.top,
          isCaptured: true,
          surfaceAreaRatio: 0.05,
          detectedDeclarations: ['Batch No: B7-402', 'Month & Year of Packaging: 08/2026', 'Tamper-Evident Top Seal'],
          fontHeightMm: 2.2,
          requiredFontHeightMm: 1.5,
          isFontCompliant: true,
          opticalLegibilityPercent: 98,
          structuredDeclarations: {
            'Batch Number': 'B7-402',
            'Date of Packaging': '08/2026',
            'Seal Integrity': 'Tamper-Evident Heat Induction Seal INTACT',
          },
          applicableRules: ['Rule 6(1)(c) Date of Manufacture/Packing', 'Rule 6(1)(g)'],
          sideStatus: 'COMPLIANT',
          statusNotes: 'High-contrast indelible inkjet printing. Zero smearing detected.',
        ),
        SpatialSweepPanel(
          panelType: SpatialSweepPanelType.bottom,
          isCaptured: true,
          surfaceAreaRatio: 0.05,
          detectedDeclarations: ['Tare Weight: 4.2g', 'Plastic Recycling Symbol (05 PP)', 'EPR Registration Number'],
          fontHeightMm: 1.6,
          requiredFontHeightMm: 1.2,
          isFontCompliant: true,
          opticalLegibilityPercent: 93,
          structuredDeclarations: {
            'Tare Weight': '4.2 g (Within Table Fifth Schedule allowance)',
            'Plastic Material': '05 Polypropylene (PP)',
            'EPR Registration': 'CPCB-EPR-2026-DEL-0941',
          },
          applicableRules: ['Rule 11 Fifth Schedule Tare Verification', 'Plastic Waste Mgmt 2024'],
          sideStatus: 'COMPLIANT',
          statusNotes: 'Standard tare indicator legible. Environmental EPR compliance verified.',
        ),
      ],
      evaluation: const HolisticRuleEvaluation(
        allMandatoryDeclarationsFound: true,
        verifiedDeclarations: [
          'Brand Name',
          'Net Quantity',
          'Retail Sale Price (MRP)',
          'Consumer Care Details',
          'Month & Year of Manufacture',
          'Name & Complete Address of Manufacturer',
          'Country of Origin: India',
        ],
        missingDeclarations: [],
        fontHeightsCompliant: true,
        minDetectedFontHeightMm: 4.2,
        requiredFontHeightMm: 4.0,
        pdpSurfaceRatioPercent: 42.5,
        isPdpRatioCompliant: true,
        crossPanelBoundaryValid: true,
        holisticVerdictSummary: 'All statutory declarations verified across unwrapped panels. No panel missed.',
      ),
      textureReconstructionStatus: 'Complete 2D Cylindrical/Cuboid Unwrapped Panorama',
      timestamp: DateTime.now(),
    );
  }
}
