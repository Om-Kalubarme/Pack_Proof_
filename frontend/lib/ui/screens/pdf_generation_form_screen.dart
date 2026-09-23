import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/inspection_report.dart';
import 'form_selection_screen.dart';
import '../widgets/consumer_affairs_logo.dart';

/// Screen: Dedicated Statutory Memo & PDF Generation Form
/// Allows field officers to customize statutory notice types, officer designations,
/// directives, and hearing requirements, preview the live PDF, and generate/save the document.
class PdfGenerationFormScreen extends StatefulWidget {
  final InspectionReport report;

  const PdfGenerationFormScreen({
    super.key,
    required this.report,
  });

  @override
  State<PdfGenerationFormScreen> createState() => _PdfGenerationFormScreenState();
}

class _PdfGenerationFormScreenState extends State<PdfGenerationFormScreen> {

  late TextEditingController _officerNameCtrl;
  late TextEditingController _designationCtrl;
  late TextEditingController _jurisdictionCtrl;
  late TextEditingController _businessNameCtrl;
  late TextEditingController _remarksCtrl;
  late TextEditingController _rectificationCtrl;

  String _selectedNoticeType = 'Form II: Inspection & Compliance Memo';
  final List<String> _noticeOptions = [
    'Form II: Inspection & Compliance Memo',
    'Form III: Notice of Statutory Violation (Rule 6/9 PCR)',
    'Form IV: Seizure Memo & Panchnama (Sec 15 LM Act)',
    'Certificate of Verified Compliance',
  ];


  @override
  void initState() {
    super.initState();
    final r = widget.report;
    _officerNameCtrl = TextEditingController(text: r.officerName);
    _designationCtrl = TextEditingController(text: 'Senior Inspector of Legal Metrology');
    _jurisdictionCtrl = TextEditingController(text: 'District Commercial Enforcement Zone');
    _businessNameCtrl = TextEditingController(text: r.businessName);

    // Initial default remarks based on violation status
    final violations = r.complianceChecks.where((c) => !c.isCompliant).toList();
    if (violations.isNotEmpty) {
      _selectedNoticeType = 'Form III: Notice of Statutory Violation (Rule 6/9 PCR)';
      _remarksCtrl = TextEditingController(
        text: 'Non-compliance detected in package declarations: '
            '${violations.map((v) => "${v.title} (${v.ruleReference})").join(", ")}. '
            'Trader/Manufacturer directed to explain discrepancy.',
      );
      _rectificationCtrl = TextEditingController(text: 'Rectify within 15 days or appear before District Controller.');
    } else {
      _selectedNoticeType = 'Form II: Inspection & Compliance Memo';
      _remarksCtrl = TextEditingController(
        text: 'All statutory declarations under PCR 2011 verified as compliant with Legal Metrology Standards.',
      );
      _rectificationCtrl = TextEditingController(text: 'Standard Routine Verification — Lot Cleared.');
    }
  }

  @override
  void dispose() {
    _officerNameCtrl.dispose();
    _designationCtrl.dispose();
    _jurisdictionCtrl.dispose();
    _businessNameCtrl.dispose();
    _remarksCtrl.dispose();
    _rectificationCtrl.dispose();
    super.dispose();
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      appBar: AppBar(
        title: const Text('Generate Statutory Memo'),
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Top Header
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryNavy,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const ConsumerAffairsLogo(size: 50),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('GOVERNMENT OF INDIA', style: TextStyle(color: AppTheme.accentGold, fontSize: 10, fontWeight: FontWeight.bold)),
                        Text('Statutory Memo & Notice Generator', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        Text('Configure legal parameters before generating official PDF record', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // Form Config
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildNoticeFormCard(),
            ),
            const SizedBox(height: 16),

            // Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildActionButtons(),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildNoticeFormCard() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppTheme.neutralBorder, width: 2),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Statutory Notice / Document Type', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _selectedNoticeType,
              isExpanded: true,
              items: _noticeOptions.map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontSize: 14), overflow: TextOverflow.ellipsis))).toList(),
              onChanged: (val) => setState(() => _selectedNoticeType = val!),
              decoration: InputDecoration(
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildTextField('Inspecting Officer', _officerNameCtrl)),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField('Designation', _designationCtrl)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildTextField('Establishment / Trader', _businessNameCtrl)),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField('Jurisdiction Zone', _jurisdictionCtrl)),
              ],
            ),
            const SizedBox(height: 12),
            _buildTextField('Compliance / Rectification Deadline', _rectificationCtrl),
            const SizedBox(height: 12),
            _buildTextField('Form III Statutory Remarks & Directives', _remarksCtrl, maxLines: 3),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, {int maxLines = 1}) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
    );
  }



  String _determineFormType() {
    final netQty = widget.report.productDetails.declaredNetQuantity.toLowerCase();
    if (RegExp(r'ml').hasMatch(netQty) || RegExp(r'l').hasMatch(netQty)) {
      return 'Form B (Volume/Length - Seventh Schedule)';
    } else if (RegExp(r'kg').hasMatch(netQty) || RegExp(r'g').hasMatch(netQty)) {
      return 'Form A (Weight - Seventh Schedule)';
    }
    return 'Form A (Seventh Schedule)';
  }

  Widget _buildActionButtons() {
    final formType = _determineFormType();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.primaryNavy.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              'Selected Form: ' + formType,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryNavy,
              ),
            ),
          ),
        ),
        SizedBox(
          height: 52,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => FormSelectionScreen(
                    report: widget.report,
                    officerName: _officerNameCtrl.text,
                    designation: _designationCtrl.text,
                    jurisdiction: _jurisdictionCtrl.text,
                    businessName: _businessNameCtrl.text,
                  ),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryNavy,
              foregroundColor: Colors.white,
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            icon: const Icon(Icons.arrow_forward_rounded, size: 20),
            label: const Text(
              'Proceed to Form Generation',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ],
    );
  }
}
