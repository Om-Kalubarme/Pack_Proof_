/// Represents the authenticated Legal Metrology Inspector.
class Officer {
  final String id;
  final String name;
  final String badgeNumber;
  final String designation;
  final String zone;

  const Officer({
    required this.id,
    required this.name,
    required this.badgeNumber,
    required this.designation,
    required this.zone,
  });

  factory Officer.mockDefault() {
    return const Officer(
      id: 'INSP-DL-4082',
      name: 'Inspector R. Sharma',
      badgeNumber: 'LM-ENF-2026-99',
      designation: 'Legal Metrology Enforcement Officer',
      zone: 'North District, State Division',
    );
  }
}
