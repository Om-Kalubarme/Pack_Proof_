import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class VisionApiConfig {
  VisionApiConfig._();

  static const String _override = String.fromEnvironment('VISION_API_URL');

  static String get baseUrl {
    if (_override.isNotEmpty) return _override;
    if (defaultTargetPlatform == TargetPlatform.macOS) return 'http://127.0.0.1:5001';
    return 'http://192.168.43.110:5001';
  }

  static Uri get inspectUri => Uri.parse('$baseUrl/api/inspect');
}
