/// Model representing an official Legal Metrology Act or Rule provision.
class LegalRuleModel {
  final String ruleNumber;
  final String title;
  final String category;
  final String actOrRule;
  final String summary;
  final String statutoryClause;
  final String fieldOfficerNotes;
  final String? penaltyClause;
  final List<String> tags;
  final Map<String, dynamic>? extraData; // For tables like Font Size specifications

  const LegalRuleModel({
    required this.ruleNumber,
    required this.title,
    required this.category,
    required this.actOrRule,
    required this.summary,
    required this.statutoryClause,
    required this.fieldOfficerNotes,
    this.penaltyClause,
    required this.tags,
    this.extraData,
  });
}
