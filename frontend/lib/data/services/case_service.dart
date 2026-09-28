import 'dart:convert';
import 'package:http/http.dart' as http;
import 'vision_api_config.dart';

class CaseService {
  Future<List<dynamic>> fetchAssignments(String inspectorId) async {
    final baseUrl = VisionApiConfig.baseUrl;
    final url = Uri.parse('$baseUrl/api/v1/cases/my-assignments?inspector_id=$inspectorId');
    
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['cases'] ?? [];
      } else {
        print('Error fetching assignments: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('Exception fetching assignments: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> assignCase(Map<String, dynamic> payload) async {
    final baseUrl = VisionApiConfig.baseUrl;
    final url = Uri.parse('$baseUrl/api/v1/cases/assign');
    
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (e) {
      print('Exception assigning case: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> submitInspection(Map<String, dynamic> payload) async {
    final baseUrl = VisionApiConfig.baseUrl;
    final url = Uri.parse('$baseUrl/api/v1/inspections/submit');
    
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        print('Error submitting inspection: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Exception submitting inspection: $e');
      return null;
    }
  }
}
