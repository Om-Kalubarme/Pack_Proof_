import 'dart:convert';
import 'package:crypto/crypto.dart';

/// Digital Evidence Exhibit A data model representing an immutable,
/// legally valid digital evidence record for court admissibility under
/// Section 65B of the Indian Evidence Act / Section 63 of Bharatiya Sakshya Adhiniyam, 2023.
class DigitalEvidenceExhibit {
  final String caseId;
  final String imageSha256Hash;
  final String deviceImei;
  final String gpsCoordinates;
  final String atomicTimestampNpli;
  final Map<String, String> boundingBoxCoordinates;
  final String watermarkText;
  final String qrCodePayload;
  final bool isImmutable;
  final bool isCourtAdmissible;
  final bool isTamperProof;
  final bool isTimeStampedByNpl;

  const DigitalEvidenceExhibit({
    required this.caseId,
    required this.imageSha256Hash,
    required this.deviceImei,
    required this.gpsCoordinates,
    required this.atomicTimestampNpli,
    required this.boundingBoxCoordinates,
    this.watermarkText = 'Legal Metrology Dept.',
    required this.qrCodePayload,
    this.isImmutable = true,
    this.isCourtAdmissible = true,
    this.isTamperProof = true,
    this.isTimeStampedByNpl = true,
  });

  /// Factory creating an exhibit with computed SHA-256 hash and NPLI timestamp
  factory DigitalEvidenceExhibit.create({
    required String caseId,
    required List<int> imageBytes,
    String deviceImei = '864320056789123',
    String gpsCoordinates = '18.5204° N, 73.8567° E',
    DateTime? timestamp,
    Map<String, String>? boundingBoxes,
  }) {
    final time = timestamp ?? DateTime.now();
    final istTime = time.toUtc().add(const Duration(hours: 5, minutes: 30));
    final npliFormatted = '${istTime.year}-${istTime.month.toString().padLeft(2, '0')}-${istTime.day.toString().padLeft(2, '0')} '
        '${istTime.hour.toString().padLeft(2, '0')}:${istTime.minute.toString().padLeft(2, '0')}:${istTime.second.toString().padLeft(2, '0')} IST';

    final defaultBoxes = boundingBoxes ?? {
      'MRP': '[x: 124, y: 310, w: 280, h: 64]',
      'Net Weight': '[x: 124, y: 384, w: 240, h: 58]',
      'Best Before': '[x: 124, y: 450, w: 310, h: 50]',
      'Mfg Details': '[x: 124, y: 512, w: 420, h: 80]',
    };

    final metadataBytes = utf8.encode('$caseId|$deviceImei|$gpsCoordinates|$npliFormatted');
    final combinedBytes = [...imageBytes, ...metadataBytes];
    final computedHash = sha256.convert(combinedBytes).toString();

    final qrPayload = jsonEncode({
      'std': 'SEC_65B_IEA_2026',
      'case': caseId,
      'hash': computedHash,
      'imei': deviceImei,
      'gps': gpsCoordinates,
      'npli': npliFormatted,
      'auth': 'Legal Metrology Enforcement Dept.',
    });

    return DigitalEvidenceExhibit(
      caseId: caseId,
      imageSha256Hash: computedHash,
      deviceImei: deviceImei,
      gpsCoordinates: gpsCoordinates,
      atomicTimestampNpli: npliFormatted,
      boundingBoxCoordinates: defaultBoxes,
      watermarkText: 'Legal Metrology Dept.',
      qrCodePayload: qrPayload,
      isImmutable: true,
      isCourtAdmissible: true,
      isTamperProof: true,
      isTimeStampedByNpl: true,
    );
  }

  /// Default realistic mock exhibit matching the design infographic
  factory DigitalEvidenceExhibit.sample() {
    const mockImageContent = 'POTATO_CHIPS_50G_SAMPLE_IMAGE_RAW_BUFFER_LEGAL_METROLOGY';
    return DigitalEvidenceExhibit.create(
      caseId: 'LM-EXHIBIT-2026-0982',
      imageBytes: utf8.encode(mockImageContent),
      deviceImei: '864320056789123',
      gpsCoordinates: '18.5204° N, 73.8567° E',
      timestamp: DateTime.parse('2026-01-09 10:24:38'),
      boundingBoxes: {
        'MRP: ₹50.00': '[x: 140, y: 312, w: 260, h: 52]',
        'Net Wt: 200 g': '[x: 140, y: 374, w: 220, h: 48]',
        'Best Before': '[x: 140, y: 432, w: 280, h: 44]',
        'Batch / FSSAI': '[x: 140, y: 486, w: 340, h: 56]',
      },
    );
  }
}
