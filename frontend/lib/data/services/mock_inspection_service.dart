import 'dart:typed_data';
import '../models/inspection_item.dart';
import '../models/inspection_report.dart';
import '../models/compliance_check.dart';
import '../models/product_details.dart';
import 'inspection_service_interface.dart';
import 'automated_vision_service.dart';

/// Mock implementation of [InspectionServiceInterface].
///
/// Ready for backend integration:
/// To connect to your real REST API:
/// 1. Replace the mock delay with an `http.MultipartRequest('POST', Uri.parse('$baseUrl/api/v1/analyze'))`
/// 2. Stream the image bytes or file to your ML model endpoint
/// 3. Parse JSON response into [InspectionReport.fromJson]
class MockInspectionService implements InspectionServiceInterface {
  // Singleton pattern for consistent in-memory state during the session
  static final MockInspectionService _instance = MockInspectionService._internal();
  factory MockInspectionService() => _instance;

  final List<InspectionItem> _recentInspections = [];

  MockInspectionService._internal() {
    _seedInitialMockData();
  }

  void _seedInitialMockData() {
    final oilReport = InspectionReport.mockOilViolation();
    final attaReport = InspectionReport.mockAttaCompliant();

    final saltReport = InspectionReport(
      caseId: 'LMD-2026-0910-028',
      officerName: 'Inspector R. Sharma',
      officerId: 'INSP-DL-4082',
      timestamp: DateTime.now().subtract(const Duration(days: 1, hours: 3)),
      businessName: 'Nature Basket Store, Aisle 3',
      location: 'Ring Road, Sector 5',
      overallStatus: InspectionStatus.pass,
      statusSummary: 'COMPLIANT / PASS',
      sampleImageTag: 'himalayan_salt',
      statutoryCategory: 'Compliant Packages',
      productDetails: const ProductDetails(
        brandName: 'Puro Himalayan Pink Salt',
        declaredNetQuantity: '1 kg',
        declaredMrp: '₹120.00',
        unitSalePrice: '₹0.12 / g',
        batchMfgDate: 'H-91 / 07/2026',
        manufacturerAddress: 'Pure Salts India Ltd, Kutch, Gujarat',
        consumerCareDetails: 'support@purosalts.com | 1800-455-888',
      ),
      complianceChecks: const [
        ComplianceCheck(
          title: 'Mandatory Declarations',
          isCompliant: true,
          statusText: 'Found & Verified',
          ruleReference: 'Rule 6, PCR 2011',
          description: 'Net quantity, FSSAI lic no, manufacturer info verified.',
        ),
        ComplianceCheck(
          title: 'MRP & Unit Sale Price',
          isCompliant: true,
          statusText: 'Compliant',
          ruleReference: 'Rule 6(11)',
          description: 'Accurate unit pricing per gram displayed prominently.',
        ),
        ComplianceCheck(
          title: 'Principal Display Font Size',
          isCompliant: true,
          statusText: 'Compliant',
          ruleReference: 'Rule 9(1)',
          description: 'Font height 4.2mm meets minimum standard of 3.0mm.',
        ),
      ],
    );

    final waterReport = InspectionReport(
      caseId: 'LMD-2026-0910-019',
      officerName: 'Inspector R. Sharma',
      officerId: 'INSP-DL-4082',
      timestamp: DateTime.now().subtract(const Duration(days: 1, hours: 6)),
      businessName: 'Highway Express Dhaba',
      location: 'NH-44 Toll Bypass',
      overallStatus: InspectionStatus.violation,
      statusSummary: 'VIOLATION DETECTED',
      sampleImageTag: 'packaged_water',
      statutoryCategory: 'MRP Violations (Rule 18)',
      productDetails: const ProductDetails(
        brandName: 'Aquasure Sparkling Water',
        declaredNetQuantity: '500 ml',
        declaredMrp: '₹35.00',
        unitSalePrice: '₹0.07 / ml',
        batchMfgDate: 'W-04 / 06/2026',
        manufacturerAddress: 'Aqua Beverage Bottlers, Sonepat',
        consumerCareDetails: 'care@aquasure.in',
      ),
      complianceChecks: const [
        ComplianceCheck(
          title: 'Dual MRP Tampering',
          isCompliant: false,
          statusText: 'Violation Detected',
          flaggedDetail: 'Original MRP ₹20 altered to ₹35 with sticker',
          ruleReference: 'Rule 18(2), PCR 2011',
          description: 'No person shall alter, obliterate or smudge the MRP originally declared.',
        ),
        ComplianceCheck(
          title: 'Unit Sale Price',
          isCompliant: true,
          statusText: 'Compliant',
          ruleReference: 'Rule 6(11)',
          description: 'Declared per ml as required.',
        ),
      ],
    );

    final teaReport = InspectionReport(
      caseId: 'LMD-2026-0909-012',
      officerName: 'Inspector R. Sharma',
      officerId: 'INSP-DL-4082',
      timestamp: DateTime.now().subtract(const Duration(days: 2, hours: 1)),
      businessName: 'Royal Tea Traders & Packaging Unit',
      location: 'Industrial Area Phase I',
      overallStatus: InspectionStatus.violation,
      statusSummary: 'VIOLATION DETECTED',
      statutoryCategory: 'Weight Shortage (Fifth Schedule)',
      measuredNetWeight: 476.0,
      weightVariancePercent: -4.8,
      isWeightCompliant: false,
      mpeLimit: 15.0,
      productDetails: const ProductDetails(
        brandName: 'Assam Gold Premium CTC Tea',
        declaredNetQuantity: '500 g',
        declaredMrp: '₹220.00',
        unitSalePrice: '₹0.44 / g',
        batchMfgDate: 'T-88 / 05/2026',
        manufacturerAddress: 'Assam Gold Blenders Ltd, Guwahati',
        consumerCareDetails: 'care@assamgold.in',
      ),
      complianceChecks: const [
        ComplianceCheck(
          title: 'Net Weight Deficiency',
          isCompliant: false,
          statusText: 'Shortage Detected',
          flaggedDetail: 'Net weight 476.0g vs declared 500g (Deficiency -24.0g exceeds MPE of 15.0g)',
          ruleReference: 'Fifth Schedule, Rule 11 & 24',
          description: 'Net quantity deficiency exceeds Maximum Permissible Error (MPE) under Fifth Schedule.',
        ),
        ComplianceCheck(
          title: 'Mandatory Declarations',
          isCompliant: true,
          statusText: 'Compliant',
          ruleReference: 'Rule 6(1)',
          description: 'Packer, brand, batch and dates properly specified.',
        ),
      ],
    );

    _recentInspections.addAll([
      InspectionItem.fromReport(oilReport),
      InspectionItem.fromReport(attaReport),
      InspectionItem.fromReport(saltReport),
      InspectionItem.fromReport(waterReport),
      InspectionItem.fromReport(teaReport),
    ]);
  }

  @override
  Future<List<InspectionItem>> getRecentInspections() async {
    // Simulate brief local/network latency
    await Future.delayed(const Duration(milliseconds: 150));
    return List.unmodifiable(_recentInspections);
  }

  @override
  Future<InspectionReport> analyzePackageLabel({
    List<String>? imagePaths,
    List<Uint8List>? imageBytesList,
    String? sampleTag,
    bool isVideo = false,
    String? mediaFilename,
  }) async {
    try {
      final visionResult = await AutomatedVisionService.autoInspectImage(
        imagePaths: imagePaths,
        imageBytesList: imageBytesList,
        sampleTag: sampleTag,
        isVideo: isVideo,
        mediaFilename: mediaFilename,
      );

      // A missing physical scale is not evidence of a statutory violation. The
      // backend deliberately reports it as a calibration requirement instead
      // of fabricating a millimetre conversion.
      final fontCheckCompliant = !visionResult.measurementAvailable || visionResult.isCompliant;

      final checks = [
        ComplianceCheck(
          title: 'Mandatory Declarations (ML AI)',
          isCompliant: visionResult.detectedText.isNotEmpty && visionResult.detectedText != 'Unknown',
          statusText: visionResult.detectedText.isNotEmpty ? 'Detected: ${visionResult.detectedText}' : 'Not Detected',
          ruleReference: 'Rule 6(1)',
          description: 'OCR extracted text: ${visionResult.detectedText} (Conf: ${(visionResult.ocrConfidence * 100).toStringAsFixed(1)}%)',
        ),
        ComplianceCheck(
          title: 'Principal Display Font Size (ML Caliper)',
          isCompliant: fontCheckCompliant,
          statusText: !visionResult.measurementAvailable
              ? 'Calibration required'
              : (visionResult.isCompliant ? 'Compliant' : 'Non-compliant'),
          flaggedDetail: visionResult.measurementAvailable
              ? 'Found ${visionResult.detectedFontHeightMm}mm, Required ${visionResult.requiredFontHeightMm}mm'
              : 'Font text detected, but no barcode scale or AR depth calibration was available.',
          ruleReference: 'Rule 9(1) Table-I',
          description: visionResult.detectionSummary,
        ),
      ];

      final qwen = visionResult.qwenData;
      final ceData = visionResult.complianceEngineData;
      
      // Parse Universal Compliance Findings (DOCX Format)
      if (ceData != null && ceData['findings'] != null) {
        final findings = ceData['findings'] as List;

        for (var f in findings) {
          if (f is Map) {
            checks.add(ComplianceCheck(
              title: f['title']?.toString() ?? 'AI Rule Engine Flag',
              isCompliant: f['status'] == 'PASS',
              statusText: f['status']?.toString() ?? 'Violation Detected',
              ruleReference: (f['rule']?.toString() ?? 'Unknown Rule'),
              description: (f['detected_issue']?.toString() ?? 'Violation flagged by AI'),
            ));
          }
        }
      }

      final manufacturerDetails = qwen?['manufacturer_details'] as Map?;
      final manufacturerText = manufacturerDetails?['manufactured_at'] ?? manufacturerDetails?['marketed_by'] ?? 'N/A';
      final customerCareText = manufacturerDetails?['customer_care'] ?? 'N/A';
          
      final qwenValue = (String key, String fallback) {
        final value = qwen?[key];
        if (value == null || value.toString().trim().isEmpty || value.toString().toLowerCase() == 'null') {
          return fallback;
        }
        return value.toString();
      };

      String parseIngredients() {
        final ingredients = qwen?['ingredients_list'];
        if (ingredients is List && ingredients.isNotEmpty) {
          return ingredients.map((e) => e.toString()).join(', ');
        }
        return 'N/A';
      }

      String parseNutrition() {
        final nutrition = qwen?['nutritional_facts'];
        if (nutrition is Map) {
          final entries = nutrition.entries
              .where((e) => e.value != null && e.value.toString().toLowerCase() != 'null' && e.value.toString().trim().isNotEmpty)
              .map((e) => '${e.key.replaceAll('_', ' ').toUpperCase()}: ${e.value}')
              .toList();
          return entries.isNotEmpty ? entries.join(' | ') : 'N/A';
        }
        return 'N/A';
      }

      List<String> parseViews() {
        final views = qwen?['detected_packaging_views'];
        if (views is List && views.isNotEmpty) {
          return views.map((e) => e.toString()).toList();
        }
        return const [];
      }

      final isEngineCompliant = ceData != null && ceData['overall_status'] == 'COMPLIANT ON VERIFIED VISUAL CHECKS';

      return InspectionReport(
        caseId: 'LMD-AI-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
        officerName: 'AI Metrology Officer',
        officerId: 'AI-SYS-001',
        timestamp: DateTime.now(),
        businessName: 'Field Inspection (AI Scan)',
        location: 'Current Location',
        overallStatus: isEngineCompliant ? InspectionStatus.pass : InspectionStatus.violation,
        statusSummary: ceData != null ? (ceData['overall_status'] ?? 'UNKNOWN') : (isEngineCompliant ? 'COMPLIANT (AI)' : 'VIOLATION DETECTED (AI)'),
        imagePath: imagePaths?.isNotEmpty == true ? imagePaths!.first : null,
        imageBytes: imageBytesList?.isNotEmpty == true ? imageBytesList!.first : null,
        sampleImageTag: sampleTag ?? 'ai_scanned',
        statutoryCategory: isEngineCompliant ? 'Compliant Packages' : 'Violations',
        productDetails: ProductDetails(
          brandName: qwenValue('brand_name', 'Scanned AI Product'),
          declaredNetQuantity: qwenValue('net_quantity', 'N/A'),
          declaredMrp: qwenValue('mrp_price', 'N/A'),
          unitSalePrice: 'N/A',
          batchMfgDate: qwenValue('manufacturing_date', 'N/A'),
          manufacturerAddress: manufacturerText.toString(),
          consumerCareDetails: customerCareText.isEmpty ? 'N/A' : customerCareText,
          barcode: qwenValue('barcode', 'N/A'),
          dietaryLogo: qwenValue('dietary_logo', 'N/A'),
          warnings: qwenValue('warnings_cautions', 'N/A'),
          ingredients: parseIngredients(),
          nutritionFacts: parseNutrition(),
          detectedViews: parseViews(),
          unableToVerify: (qwen?['unable_to_verify'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
          ambiguousDetails: (qwen?['ambiguous_details'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
          declarations: (qwen?['declarations'] as List<dynamic>?)?.map((e) => e as Map<String, dynamic>).toList() ?? [],
          allergens: (qwen?['allergens'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
        ),
        complianceChecks: checks,
      );
    } catch (e) {
      print("Real API Failed, falling back to mock: $e");
      return InspectionReport.mockOilViolation(
        imagePath: imagePaths?.isNotEmpty == true ? imagePaths!.first : null,
        imageBytes: imageBytesList?.isNotEmpty == true ? imageBytesList!.first : null,
        sampleTag: sampleTag,
      );
    }
  }

  @override
  Future<void> saveInspectionToLogs(InspectionReport report) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final newItem = InspectionItem.fromReport(report);
    // Remove if already exists with same case ID
    _recentInspections.removeWhere((i) => i.id == newItem.id);
    // Add to top of recent inspections list
    _recentInspections.insert(0, newItem);
  }
}
