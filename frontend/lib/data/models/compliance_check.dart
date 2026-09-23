/// Represents a legal compliance rule validation against Packaged Commodities Rules.
class ComplianceCheck {
  final String title;
  final bool isCompliant;
  final String statusText;
  final String? flaggedDetail;
  final String ruleReference;
  final String description;

  const ComplianceCheck({
    required this.title,
    required this.isCompliant,
    required this.statusText,
    this.flaggedDetail,
    required this.ruleReference,
    required this.description,
  });

  Map<String, dynamic> toJson() => {
    'title': title,
    'isCompliant': isCompliant,
    'statusText': statusText,
    'flaggedDetail': flaggedDetail,
    'ruleReference': ruleReference,
    'description': description,
  };

  factory ComplianceCheck.fromJson(Map<String, dynamic> json) {
    return ComplianceCheck(
      title: json['title'] as String,
      isCompliant: json['isCompliant'] as bool,
      statusText: json['statusText'] as String,
      flaggedDetail: json['flaggedDetail'] as String?,
      ruleReference: json['ruleReference'] as String? ?? 'PCR 2011',
      description: json['description'] as String? ?? '',
    );
  }
}
