with open("/Users/om_k/Downloads/ML_Project/frontend/lib/data/services/mock_inspection_service.dart", "r") as f:
    content = f.read()

# Update parsing logic for the new format
old_ce_parse = """      // Parse Qwen Rule Engine Violations
      if (ceData != null) {
        final violations = ceData['violations'] as List?;
        final passed = ceData['passed_checks'] as List?;
        final unknown = ceData['unknown_checks'] as List?;
        final pt = ceData['physical_tests_required'] as List?;

        void addCheck(dynamic v) {
          if (v is Map) {
            checks.add(ComplianceCheck(
              title: v['title']?.toString() ?? 'AI Rule Engine Flag',
              isCompliant: v['status'] == 'PASS',
              statusText: v['status']?.toString() ?? 'Violation Detected',
              ruleReference: (v['rule']?.toString() ?? 'Unknown Rule'),
              description: (v['detected_issue']?.toString() ?? 'Violation flagged by AI'),
            ));
          }
        }
        
        violations?.forEach(addCheck);
        passed?.forEach(addCheck);
        unknown?.forEach(addCheck);
        pt?.forEach(addCheck);
      }"""

new_ce_parse = """      // Parse Universal Compliance Findings (DOCX Format)
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
      }"""

content = content.replace(old_ce_parse, new_ce_parse)

old_status = """      final isEngineCompliant = ceData != null && ceData['status'] == 'COMPLIANT';"""
new_status = """      final isEngineCompliant = ceData != null && ceData['overall_status'] == 'COMPLIANT ON VERIFIED VISUAL CHECKS';"""
content = content.replace(old_status, new_status)

# The overall summary text can also match the new status
content = content.replace("isEngineCompliant ? 'COMPLIANT (AI)' : 'VIOLATION DETECTED (AI)',", "ceData != null ? (ceData['overall_status'] ?? 'UNKNOWN') : (isEngineCompliant ? 'COMPLIANT (AI)' : 'VIOLATION DETECTED (AI)'),")

with open("/Users/om_k/Downloads/ML_Project/frontend/lib/data/services/mock_inspection_service.dart", "w") as f:
    f.write(content)
print("Updated frontend parsing for findings structure")
