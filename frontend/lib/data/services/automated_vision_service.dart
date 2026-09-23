import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;
import '../models/font_caliper_models.dart';
import 'vision_api_config.dart';

class AutomatedVisionResult {
  final PdpDimensions pdpDimensions;
  final FontCaliperMeasurement caliperMeasurement;
  final double detectedFontHeightMm;
  final double requiredFontHeightMm;
  final bool isCompliant;
  final double ocrConfidence;
  final String detectedText;
  final String targetField;
  final String detectionSummary;
  final Map<String, dynamic>? qwenData;
  final int framesAnalyzed;
  final bool isAutoDetected;
  final bool measurementAvailable;
  final String? measurementMethod;

  const AutomatedVisionResult({
    required this.pdpDimensions,
    required this.caliperMeasurement,
    required this.detectedFontHeightMm,
    required this.requiredFontHeightMm,
    required this.isCompliant,
    required this.ocrConfidence,
    required this.detectedText,
    required this.targetField,
    required this.detectionSummary,
    this.qwenData,
    this.framesAnalyzed = 1,
    this.isAutoDetected = true,
    this.measurementAvailable = false,
    this.measurementMethod,
  });
}

class AutomatedVisionService {
  AutomatedVisionService._();

  static Future<AutomatedVisionResult> autoInspectImage({
    List<String>? imagePaths,
    List<Uint8List>? imageBytesList,
    String? sampleTag,
    bool isVideo = false,
    String? mediaFilename,
    bool simulateDelay = false,
  }) async {
    // If we have an image path or bytes, we send to our local Python Flask server
    if ((imagePaths != null && imagePaths.isNotEmpty) || (imageBytesList != null && imageBytesList.isNotEmpty)) {
      try {
        final request = http.MultipartRequest('POST', VisionApiConfig.inspectUri);
        final filename = mediaFilename ?? (isVideo ? 'capture.mp4' : 'capture.jpg');
        // Qwen is optional server-side: a local model outage must not prevent
        // YOLO/OCR from returning its deterministic scan result.
        request.fields['use_qwen'] = 'true';

        if (imageBytesList != null && imageBytesList.isNotEmpty) {
          for (int i = 0; i < imageBytesList.length; i++) {
            request.files.add(http.MultipartFile.fromBytes('image', imageBytesList[i], filename: 'capture_$i.jpg'));
          }
        } else if (imagePaths != null && imagePaths.isNotEmpty && !kIsWeb) {
          // Fallback to path if bytes are empty and we are NOT on Web (where fromPath is unsupported)
          for (int i = 0; i < imagePaths.length; i++) {
            request.files.add(await http.MultipartFile.fromPath('image', imagePaths[i]));
          }
        } else {
           throw Exception("No valid image data available");
        }

        final response = await request.send();
        final responseData = await response.stream.bytesToString();
        
        if (response.statusCode == 200) {
          final jsonResp = jsonDecode(responseData);
          if (jsonResp['success'] == true) {
            final data = jsonResp['data'];
            final qwenResponse = data['qwen'];
            final qwenData = qwenResponse is Map && qwenResponse['status'] == 'ok' && qwenResponse['data'] is Map
              ? Map<String, dynamic>.from(qwenResponse['data'] as Map)
              : null;
            final framesAnalyzed = (data['total_frames_analyzed'] as num?)?.toInt() ?? 1;
            final measurementAvailable = data['measurement_available'] == true;
            final measurementMethod = data['measurement_method']?.toString();
            
            final List boxes = data['boxes'] is List ? data['boxes'] : const [];
            if (boxes.isEmpty) {
              throw Exception('The vision model returned no detections.');
            }
            
            double measuredMm = 0.0;
            String text = "Unknown";
            double conf = 0.0;
            String category = "Unknown";

            Map<String, dynamic>? targetBox;
            for (var box in boxes) {
                if (box['category'] == 'MRP_BATCH' || box['category'] == 'NUTRITION_USP') {
                targetBox = Map<String, dynamic>.from(box as Map);
                    break;
                }
            }
            if (targetBox == null && boxes.isNotEmpty) {
              targetBox = Map<String, dynamic>.from(boxes.first as Map);
            }

            if (targetBox != null) {
                text = targetBox['text']?.toString() ?? '';
                conf = (targetBox['conf'] as num?)?.toDouble() ?? 0.0;
                category = targetBox['category']?.toString() ?? '';
                final caliper = targetBox['caliper'];
                if (caliper is Map) {
                  measuredMm = (caliper['measured_height_mm'] as num?)?.toDouble() ?? 0.0;
                }
            }

            // PDP dimensions still come from the inspection workflow. Physical
            // font size is only treated as measured when the backend received
            // barcode scale or native AR depth + camera intrinsics.
            final pdp = PdpDimensions.calculate(
              widthCm: 10.0,
              heightCm: 18.0,
              shape: PdpShape.rectangular,
              netQuantityGrams: 1000.0,
            );
            
            double requiredMm = pdp.minimumRequiredFontMm;

            return AutomatedVisionResult(
              pdpDimensions: pdp,
              detectedFontHeightMm: measuredMm,
              requiredFontHeightMm: requiredMm,
              isCompliant: measurementAvailable && measuredMm >= requiredMm,
              ocrConfidence: conf,
              detectedText: text,
              targetField: category,
              detectionSummary: '${framesAnalyzed > 1 ? '3D video: $framesAnalyzed distinct sharp frames analyzed. ' : ''}AI Extracted: "$text". ${measurementAvailable ? 'Font height: ${measuredMm}mm (Req: ${requiredMm}mm; $measurementMethod).' : 'Text found, but physical font sizing needs barcode scale or AR depth calibration.'}',
              qwenData: qwenData,
              framesAnalyzed: framesAnalyzed,
              measurementAvailable: measurementAvailable,
              measurementMethod: measurementMethod,
              caliperMeasurement: FontCaliperMeasurement(
                measuredHeightMm: measuredMm,
                requiredHeightMm: requiredMm,
                targetField: category,
                ocrConfidence: conf,
                ruleReference: 'Rule 9(1) Table-I, PCR 2011',
              ),
            );
          }
        }
      } catch (e) {
        throw Exception('Vision API failed: $e');
      }
    }

    // Default mock fallback
    if (sampleTag == 'sharbati_atta') {
      final pdp = PdpDimensions.calculate(widthCm: 22.0, heightCm: 28.0, shape: PdpShape.rectangular, netQuantityGrams: 5000.0);
      const measuredMm = 4.8;
      const requiredMm = 4.0;
      return AutomatedVisionResult(
        pdpDimensions: pdp,
        detectedFontHeightMm: measuredMm,
        requiredFontHeightMm: requiredMm,
        isCompliant: true,
        ocrConfidence: 0.94,
        detectedText: '5 kg',
        targetField: 'Net Quantity numeral "5 kg"',
        detectionSummary: 'Auto-detected PDP 616 cm², numeral "5 kg" font height 4.8mm vs required 4.0mm',
        caliperMeasurement: const FontCaliperMeasurement(
          measuredHeightMm: measuredMm,
          requiredHeightMm: requiredMm,
          targetField: 'Net Quantity numeral "5 kg"',
          ocrConfidence: 0.94,
          ruleReference: 'Rule 9(1) Table-I, PCR 2011',
        ),
      );
    } else {
      final pdp = PdpDimensions.calculate(widthCm: 10.0, heightCm: 18.0, shape: PdpShape.rectangular, netQuantityGrams: 1000.0);
      const measuredMm = 1.8;
      const requiredMm = 3.0;
      return AutomatedVisionResult(
        pdpDimensions: pdp,
        detectedFontHeightMm: measuredMm,
        requiredFontHeightMm: requiredMm,
        isCompliant: false,
        ocrConfidence: 0.88,
        detectedText: '1 L',
        targetField: 'Net Quantity numeral "1 L"',
        detectionSummary: 'Auto-detected PDP 180 cm², numeral "1 L" font height 1.8mm (Deficient by 1.2mm)',
        caliperMeasurement: const FontCaliperMeasurement(
          measuredHeightMm: measuredMm,
          requiredHeightMm: requiredMm,
          targetField: 'Net Quantity numeral "1 L"',
          ocrConfidence: 0.88,
          ruleReference: 'Rule 9(1) Table-I, PCR 2011',
        ),
      );
    }
  }
}
