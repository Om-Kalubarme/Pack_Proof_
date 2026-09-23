import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class VisionApiConfig {
  VisionApiConfig._();

  static const String _override = String.fromEnvironment('VISION_API_URL');

  static String get baseUrl {
    if (_override.isNotEmpty) return _override;
    if (kIsWeb) return 'http://127.0.0.1:5001';
    if (defaultTargetPlatform == TargetPlatform.android) return 'http://10.0.2.2:5001';
    return 'http://127.0.0.1:5001';
  }

  static Uri get inspectUri => Uri.parse('$baseUrl/api/inspect');
}
