import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class CaseDetailsScreen extends StatelessWidget {
  final String caseId;
  final String officer;
  final String establishment;
  final String directive;
  final String date;
  final String location;
  final List<String> evidence;
  final String status;

  const CaseDetailsScreen({
    super.key,
    required this.caseId,
    required this.officer,
    required this.establishment,
    required this.directive,
    required this.date,
    required this.location,
    required this.evidence,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      appBar: AppBar(
        title: Text('Case Details $caseId'),
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildInfoCard(
              title: 'Case Information',
              icon: Icons.info_outline_rounded,
              children: [
                _buildRow('Status', status, isStatus: true),
                _buildRow('Assigned Officer', officer),
                _buildRow('Establishment', establishment),
                _buildRow('Date Assigned', date),
                _buildRow('Location', location),
              ],
            ),
            const SizedBox(height: 16),
            _buildInfoCard(
              title: 'Directives',
              icon: Icons.gavel_rounded,
              children: [
                Text(
                  directive,
                  style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary, height: 1.5),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (evidence.isNotEmpty)
              _buildInfoCard(
                title: 'Evidence & Attachments',
                icon: Icons.attachment_rounded,
                children: evidence.map((e) => Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Row(
                    children: [
                      const Icon(Icons.insert_drive_file_rounded, color: AppTheme.primaryBlue, size: 20),
                      const SizedBox(width: 8),
                      Expanded(child: Text(e, style: const TextStyle(fontSize: 14))),
                    ],
                  ),
                )).toList(),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({required String title, required IconData icon, required List<Widget> children}) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: AppTheme.primaryNavy, size: 24),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryNavy,
                  ),
                ),
              ],
            ),
            const Divider(height: 24, thickness: 1),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isStatus = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppTheme.metadataLabel,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: isStatus
                ? Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: value.toLowerCase().contains('closed') ? AppTheme.passBackground : AppTheme.warningBackground,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      value,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: value.toLowerCase().contains('closed') ? AppTheme.passGreen : AppTheme.warningAmber,
                      ),
                    ),
                  )
                : Text(
                    value,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.textPrimary,
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
