import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import 'case_details_screen.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      appBar: AppBar(
        title: const Text('Case Notifications'),
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        children: [
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppTheme.warningBackground,
                child: Icon(Icons.assignment_late_rounded, color: AppTheme.warningAmber),
              ),
              title: const Text('New Case Assigned: #LM-2026-904', style: TextStyle(fontWeight: FontWeight.w600)),
              subtitle: const Text('Officer: Joint Controller, Metro Region\nEstablishment: Metro Mart, Counters\nDirective: Inspect package declarations under Rule 6/9 PCR.'),
              isThreeLine: true,
              trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const CaseDetailsScreen(
                      caseId: '#LM-2026-904',
                      officer: 'Joint Controller, Metro Region',
                      establishment: 'Metro Mart, Counters',
                      directive: 'Inspect package declarations under Rule 6/9 PCR. Verify structural integrity of product labels.',
                      date: 'Sept 22, 2026',
                      location: 'South District Commercial Hub, Sector 4',
                      evidence: ['Initial_Complaint_Document.pdf', 'Photographic_Evidence_01.jpg'],
                      status: 'Assigned',
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppTheme.passBackground,
                child: Icon(Icons.check_circle_outline_rounded, color: AppTheme.passGreen),
              ),
              title: const Text('Case Closed: #LM-2026-881', style: TextStyle(fontWeight: FontWeight.w600)),
              subtitle: const Text('Approved by Higher Authority.\nNo further action required.'),
              trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const CaseDetailsScreen(
                      caseId: '#LM-2026-881',
                      officer: 'Regional Director',
                      establishment: 'Apex Industries Ltd.',
                      directive: 'Case Closed. Approved by Higher Authority. No further action required.',
                      date: 'Sept 15, 2026',
                      location: 'Industrial Estate, Phase II',
                      evidence: ['Final_Audit_Report.pdf', 'Notice_Response_Signed.pdf'],
                      status: 'Closed',
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
