/// Result of GS1 Barcode verification against global registry
class Gs1BarcodeVerification {
  final String scannedBarcode;
  final String gs1RegisteredEntity;
  final String labelDeclaredEntity;
  final bool isMatch;
  final String? fraudAlertMessage;

  const Gs1BarcodeVerification({
    required this.scannedBarcode,
    required this.gs1RegisteredEntity,
    required this.labelDeclaredEntity,
    required this.isMatch,
    this.fraudAlertMessage,
  });

  bool get isClass1IdentityFraud => !isMatch;
}

/// Verification of statutory licenses against official Government Registries
class LicenseRegistryCrossCheck {
  final String fssaiLicNo;
  final bool isFssaiValid;
  final String fssaiRegistrationStatus;
  final String modelApprovalNo;
  final bool isModelApprovalValid;
  final String modelApprovalStatus;
  final String registrySource;

  const LicenseRegistryCrossCheck({
    required this.fssaiLicNo,
    required this.isFssaiValid,
    required this.fssaiRegistrationStatus,
    required this.modelApprovalNo,
    required this.isModelApprovalValid,
    required this.modelApprovalStatus,
    this.registrySource = 'Central Govt / LM Directorate Registry',
  });
}

/// Optical edge-line analysis detecting physical sticker overlays or altered MRP tags
class DualMrpDetection {
  final bool hasRelabeling;
  final String detectedOriginalPrice;
  final String detectedStickerPrice;
  final double edgeLineInconsistencyScore; // 0.0 - 100.0%
  final String detectionMethod;
  final String statutoryViolation;

  const DualMrpDetection({
    required this.hasRelabeling,
    required this.detectedOriginalPrice,
    required this.detectedStickerPrice,
    required this.edgeLineInconsistencyScore,
    this.detectionMethod = 'Edge-line gradient & physical re-sticker depth analysis',
    this.statutoryViolation = 'Rule 18(2) & Section 18 LM Act (Illegal Relabeling / Overcharging beyond original MRP)',
  });
}

/// Consolidated Statutory Fraud & Counterfeit Detection Record
class FraudDetectionSummary {
  final Gs1BarcodeVerification gs1Verification;
  final LicenseRegistryCrossCheck licenseCrossCheck;
  final DualMrpDetection dualMrpDetection;
  final DateTime timestamp;

  const FraudDetectionSummary({
    required this.gs1Verification,
    required this.licenseCrossCheck,
    required this.dualMrpDetection,
    required this.timestamp,
  });

  bool get hasFraudOrCounterfeit =>
      gs1Verification.isClass1IdentityFraud ||
      !licenseCrossCheck.isFssaiValid ||
      !licenseCrossCheck.isModelApprovalValid ||
      dualMrpDetection.hasRelabeling;

  /// Sample mock matching the design infographic
  factory FraudDetectionSummary.sample({bool triggerMismatch = false, bool triggerDualMrp = true}) {
    return FraudDetectionSummary(
      gs1Verification: Gs1BarcodeVerification(
        scannedBarcode: '8906123456789',
        gs1RegisteredEntity: 'ABC Foods Pvt. Ltd.',
        labelDeclaredEntity: triggerMismatch ? 'Apex Consumer Goods' : 'ABC Foods Pvt. Ltd.',
        isMatch: !triggerMismatch,
        fraudAlertMessage: triggerMismatch
            ? 'Class-1 Identity Fraud Alert: Barcode registered to ABC Foods Pvt. Ltd. but label claims Apex Consumer Goods'
            : null,
      ),
      licenseCrossCheck: const LicenseRegistryCrossCheck(
        fssaiLicNo: '10012022000123',
        isFssaiValid: true,
        fssaiRegistrationStatus: 'FSSAI: Valid (Active Manufacturer)',
        modelApprovalNo: 'IND/09/1234',
        isModelApprovalValid: true,
        modelApprovalStatus: 'Model Approval: Valid / VERIFIED',
      ),
      dualMrpDetection: DualMrpDetection(
        hasRelabeling: triggerDualMrp,
        detectedOriginalPrice: '₹45.00',
        detectedStickerPrice: '₹50.00',
        edgeLineInconsistencyScore: 94.8,
      ),
      timestamp: DateTime.now(),
    );
  }
}
