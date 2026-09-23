import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/spatial_unwrapping_models.dart';

/// PackageCanvasWidget displays captured package photos cleanly without restrictive frames,
/// or renders a high-fidelity simulated package label or specific side panel.
class PackageCanvasWidget extends StatelessWidget {
  final String? imagePath;
  final Uint8List? imageBytes;
  final String? sampleTag;
  final double? height;
  final double? width;
  final BoxFit fit;
  final SpatialSweepPanelType? activePanelType;
  final SpatialSweepPanel? panelData;
  final bool isVideo;

  const PackageCanvasWidget({
    super.key,
    this.imagePath,
    this.imageBytes,
    this.sampleTag,
    this.height,
    this.width,
    this.fit = BoxFit.contain,
    this.activePanelType,
    this.panelData,
    this.isVideo = false,
    // Kept for backwards compatibility if passed, but framing overlay is avoided as requested
    bool showBoundingBoxes = false,
  });

  @override
  Widget build(BuildContext context) {
    // Miniature thumbnail mode (for lists/cards)
    if (height != null && height! <= 120 && (imageBytes == null || imageBytes!.isEmpty) && (imagePath == null || imagePath!.isEmpty)) {
      return Container(
        height: height,
        width: width ?? double.infinity,
        decoration: BoxDecoration(
          color: const Color(0xFFFEF3C7),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.inventory_2_rounded, size: 26, color: Color(0xFFD97706)),
              SizedBox(height: 2),
              Text(
                'OIL 1L',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF78350F)),
              ),
            ],
          ),
        ),
      );
    }

    Widget content;

    if (!isVideo && imageBytes != null && imageBytes!.isNotEmpty) {
      content = Image.memory(
        imageBytes!,
        fit: fit,
        width: double.infinity,
      );
    } else if (!isVideo && imagePath != null && imagePath!.isNotEmpty && !kIsWeb) {
      final file = File(imagePath!);
      if (file.existsSync()) {
        content = Image.file(
          file,
          fit: fit,
          width: double.infinity,
        );
      } else {
        content = _buildSimulatedPackage();
      }
    } else if (activePanelType != null) {
      content = _buildFacetPanel(activePanelType!);
    } else {
      content = _buildSimulatedPackage();
    }

    return Container(
      height: height ?? 360,
      width: width ?? double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderLight, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Center(child: content),
    );
  }

  Widget _buildSimulatedPackage() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          width: constraints.maxWidth,
          height: constraints.maxHeight,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFFFFBEB), Color(0xFFFEF3C7)],
            ),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            physics: const NeverScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Product Brand Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD97706),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    '★ PREMIUM QUALITY ★',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'GoodLife',
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF78350F),
                  ),
                ),
                const Text(
                  'REFINED SUNFLOWER OIL',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.1,
                    color: Color(0xFF92400E),
                  ),
                ),
                const SizedBox(height: 12),

                // Simulated Legal Metrology Declarations Panel
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFD1D5DB)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'MANDATORY DECLARATIONS (RULE 6, PCR 2011)',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Net Quantity
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'NET QUANTITY:',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.violationBackground,
                              border: Border.all(color: AppTheme.violationRed, width: 0.8),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              '1 L (Font: 1.8mm ⚠️)',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.violationText,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),

                      // MRP & USP
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('MAX. RETAIL PRICE (MRP):', style: TextStyle(fontSize: 11)),
                          Text('₹145.00', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const Text(
                        '(Incl. of all taxes)',
                        style: TextStyle(fontSize: 9, color: Colors.black54),
                      ),
                      const SizedBox(height: 4),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('UNIT SALE PRICE (USP):', style: TextStyle(fontSize: 11)),
                          Text('₹0.145 / ml', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('BATCH / PKD:', style: TextStyle(fontSize: 10)),
                          Text('B-204 | 08/2026', style: TextStyle(fontSize: 10)),
                        ],
                      ),
                      const Divider(height: 10, thickness: 0.5),
                      const Text(
                        'Mfg By: GoodLife Agrotech Ltd, Plot 42, GIDC, Gujarat - 390010\n'
                        'Consumer Care: care@goodlife.com | 1800-200-333',
                        style: TextStyle(fontSize: 8.5, color: Colors.black87),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFacetPanel(SpatialSweepPanelType type) {
    switch (type) {
      case SpatialSweepPanelType.front:
        return _buildSimulatedPackage();
      case SpatialSweepPanelType.back:
        return _buildBackAddressBarcodePanel();
      case SpatialSweepPanelType.right:
        return _buildRightNutritionPanel();
      case SpatialSweepPanelType.left:
        return _buildLeftConsumerCarePanel();
      case SpatialSweepPanelType.top:
        return _buildTopSealBatchPanel();
      case SpatialSweepPanelType.bottom:
        return _buildBottomTareEprPanel();
    }
  }

  Widget _buildBackAddressBarcodePanel() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          width: constraints.maxWidth,
          height: constraints.maxHeight,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFF8FAFC), Color(0xFFE2E8F0)],
            ),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Panel Header Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryNavy,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'FACET: BACK PANEL',
                        style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFF86EFAC)),
                      ),
                      child: const Text(
                        'GS1 & FSSAI VERIFIED',
                        style: TextStyle(color: Color(0xFF15803D), fontSize: 9.5, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Simulated Barcode Graphic
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          36,
                          (i) => Container(
                            margin: EdgeInsets.only(right: (i % 3 == 0) ? 3.0 : 1.5),
                            width: (i % 4 == 0) ? 3.0 : ((i % 2 == 0) ? 1.8 : 1.0),
                            height: 38,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        '8 906123 456789',
                        style: TextStyle(fontFamily: 'monospace', fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 2.0),
                      ),
                      const Text(
                        'EAN-13 Barcode (Verified GS1 India Registry)',
                        style: TextStyle(fontSize: 8.5, color: Color(0xFF047857), fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),

                // FSSAI & Licensing Box
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                            decoration: BoxDecoration(color: const Color(0xFF0284C7), borderRadius: BorderRadius.circular(3)),
                            child: const Text('fssai', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11)),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Lic. No. 10012022000123',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Manufactured & Packed By:\n'
                        'GoodLife Foods Pvt. Ltd., Plot 42-44, Sector 9,\n'
                        'Industrial Area, Solan (H.P.) - 173212',
                        style: TextStyle(fontSize: 9.5, color: AppTheme.textPrimary, height: 1.3),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Ingredients: Refined Sunflower Oil, Permitted Antioxidant (TBHQ - INS 319), Vitamin A & Vitamin D2.',
                        style: TextStyle(fontSize: 9, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRightNutritionPanel() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          width: constraints.maxWidth,
          height: constraints.maxHeight,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFF0FDF4), Color(0xFFDCFCE7)],
            ),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: const Color(0xFF15803D), borderRadius: BorderRadius.circular(4)),
                      child: const Text('FACET: RIGHT PANEL', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                    // Veg Dot Icon
                    Container(
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFF15803D), width: 1.5),
                        borderRadius: BorderRadius.circular(3),
                        color: Colors.white,
                      ),
                      child: Center(
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF15803D)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF86EFAC)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'NUTRITIONAL INFORMATION (Per 100g Approx.)',
                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF15803D)),
                      ),
                      const Divider(height: 8, thickness: 0.5),
                      _buildNutritionRow('Energy', '540 kcal'),
                      _buildNutritionRow('Protein', '0.0 g'),
                      _buildNutritionRow('Total Carbohydrate', '0.0 g'),
                      _buildNutritionRow('Total Fat', '60.0 g'),
                      _buildNutritionRow(' - Saturated Fatty Acids', '6.8 g'),
                      _buildNutritionRow(' - Trans Fatty Acids', '0.0 g'),
                      _buildNutritionRow('Cholesterol', '0.0 mg'),
                      _buildNutritionRow('Sodium', '12.0 mg'),
                      const Divider(height: 8, thickness: 0.5),
                      const Text(
                        'Rule 2.2.2 FSSAI: Green Dot Icon Present & Legible',
                        style: TextStyle(fontSize: 8.5, color: Color(0xFF15803D), fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  static Widget _buildNutritionRow(String title, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 9, color: AppTheme.textPrimary)),
          Text(val, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildLeftConsumerCarePanel() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          width: constraints.maxWidth,
          height: constraints.maxHeight,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFF1F5F9), Color(0xFFE2E8F0)],
            ),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: const Color(0xFF0369A1), borderRadius: BorderRadius.circular(4)),
                      child: const Text('FACET: LEFT PANEL', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                    const Text('RULE 6(1)(f) COMPLIANT', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF0369A1))),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFBAE6FD)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'FOR CONSUMER COMPLAINTS / QUERIES:',
                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF0369A1)),
                      ),
                      const SizedBox(height: 6),
                      const Row(
                        children: [
                          Icon(Icons.phone_in_talk_rounded, size: 14, color: Color(0xFF0284C7)),
                          SizedBox(width: 6),
                          Text('Toll-Free: 1800-11-4082', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Row(
                        children: [
                          Icon(Icons.email_outlined, size: 14, color: Color(0xFF0284C7)),
                          SizedBox(width: 6),
                          Text('care@goodlife.in | grievance@goodlife.in', style: TextStyle(fontSize: 9.5)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF0284C7)),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Grievance Officer, GoodLife Customer Cell, Connaught Place, New Delhi - 110001',
                              style: TextStyle(fontSize: 9, color: AppTheme.textSecondary),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 12, thickness: 0.5),
                      const Text(
                        'BEST BEFORE 9 MONTHS FROM DATE OF PACKAGING',
                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF9A3412)),
                      ),
                      const Text(
                        'Storage: Keep in cool, dry and hygienic conditions.',
                        style: TextStyle(fontSize: 8.5, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTopSealBatchPanel() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          width: constraints.maxWidth,
          height: constraints.maxHeight,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFFEF3C7), Color(0xFFFDE68A)],
            ),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: const Color(0xFFD97706), borderRadius: BorderRadius.circular(4)),
                      child: const Text('FACET: TOP SEAL', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                    const Text('RULE 6(1)(c) / PKD', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF92400E))),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFFCD34D)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.verified_user_rounded, size: 16, color: Color(0xFFD97706)),
                          const SizedBox(width: 6),
                          Text(
                            'HEAT INDUCTION TAMPER SEAL INTACT',
                            style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Colors.amber.shade900),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Column(
                          children: [
                            Text(
                              'BATCH: B7-402',
                              style: TextStyle(fontFamily: 'monospace', fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8)),
                            ),
                            Text(
                              'PKD: 08/2026   EXP: 05/2027',
                              style: TextStyle(fontFamily: 'monospace', fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF86EFAC)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Indelible Laser Inkjet Printing: Zero Smudging Detected',
                        style: TextStyle(fontSize: 8.5, color: Color(0xFF047857), fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBottomTareEprPanel() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          width: constraints.maxWidth,
          height: constraints.maxHeight,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFFAF5FF), Color(0xFFF3E8FF)],
            ),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: const Color(0xFF7C3AED), borderRadius: BorderRadius.circular(4)),
                      child: const Text('FACET: BOTTOM FOLD', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                    const Text('FIFTH SCHEDULE TARE & EPR', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF7C3AED))),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFD8B4FE)),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('CONTAINER TARE WEIGHT:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                          Text('4.2 g (Compliant)', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900, color: Color(0xFF15803D))),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Evaluated under Rule 11 & Fifth Schedule allowances for rigid/semi-rigid packaging.',
                        style: TextStyle(fontSize: 8.5, color: AppTheme.textSecondary),
                      ),
                      Divider(height: 10, thickness: 0.5),
                      Row(
                        children: [
                          Icon(Icons.recycling_rounded, size: 16, color: Color(0xFF7C3AED)),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Material: 05 PP (Polypropylene) • 100% Recyclable Food Grade',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Color(0xFF7C3AED)),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text(
                        'EPR Reg: CPCB-EPR-2026-DEL-0941',
                        style: TextStyle(fontSize: 8.5, fontFamily: 'monospace', color: AppTheme.textPrimary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
