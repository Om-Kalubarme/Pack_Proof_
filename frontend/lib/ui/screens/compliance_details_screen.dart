import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/compliance_check.dart';
import '../../data/models/inspection_report.dart';
import '../widgets/consumer_affairs_logo.dart';
import 'pdf_generation_form_screen.dart';

class ComplianceDetailsScreen extends StatefulWidget {
  final InspectionReport report;

  const ComplianceDetailsScreen({super.key, required this.report});

  @override
  State<ComplianceDetailsScreen> createState() => _ComplianceDetailsScreenState();
}

class _ComplianceDetailsScreenState extends State<ComplianceDetailsScreen> {
  late InspectionReport _report;
  late List<ComplianceCheck> _complianceChecks;

  @override
  void initState() {
    super.initState();
    _report = widget.report;
    _complianceChecks = List.from(widget.report.complianceChecks);
  }

  Future<void> _openPdfGenerationScreen() async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PdfGenerationFormScreen(report: _report),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      appBar: AppBar(
        title: const Row(
          children: [
            ConsumerAffairsLogo(size: 26, isBadge: false),
            SizedBox(width: 8),
            Expanded(
              child: Text(
                'Compliance Details & Checklist',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 580),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildExtractedProductDetailsCard(),
                const SizedBox(height: 14),
                _buildComplianceChecklistCard(),
                const SizedBox(height: 20),
                _buildActionButtons(),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildExtractedProductDetailsCard() {
    final p = _report.productDetails;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppTheme.neutralBorder,
          width: 2.0,
        ),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.text_snippet_rounded, color: AppTheme.primaryNavy, size: 20),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Extracted Product Declarations',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.primaryInk),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Rule 6 PCR 2011 • Edge AI OCR Stream Analysis',
            style: TextStyle(fontSize: 12, color: AppTheme.secondaryText),
          ),
          if (p.detectedViews.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text('Detected Views:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: p.detectedViews.map((view) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryNavy.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.primaryNavy.withOpacity(0.3)),
                  ),
                  child: Text(
                    view.replaceAll('_', ' ').toUpperCase(),
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                );
              }).toList(),
            ),
          ],
          const SizedBox(height: 12),
          const Divider(height: 1, color: AppTheme.neutralBorder),
          const SizedBox(height: 10),
          _buildOcrFieldTile('Brand / Commodity', p.brandName, Icons.shopping_bag_outlined),
          _buildOcrFieldTile('Declared Net Quantity', p.declaredNetQuantity, Icons.straighten_rounded),
          _buildOcrFieldTile('Declared MRP (Incl. Taxes)', p.declaredMrp, Icons.currency_rupee_rounded),
          _buildOcrFieldTile('Unit Sale Price (USP)', p.unitSalePrice, Icons.calculate_outlined),
          _buildOcrFieldTile('Batch / Mfg Date', p.batchMfgDate, Icons.calendar_today_outlined),
          _buildOcrFieldTile('Manufacturer Address', p.manufacturerAddress, Icons.business_outlined),
          _buildOcrFieldTile('Consumer Care Details', p.consumerCareDetails, Icons.support_agent_outlined),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8.0),
            child: Divider(height: 1, color: AppTheme.neutralBorder),
          ),
          _buildOcrFieldTile('Barcode / EAN', p.barcode, Icons.qr_code_2_rounded),
          _buildOcrFieldTile('Dietary Logo', p.dietaryLogo, p.dietaryLogo.contains('NON') ? Icons.set_meal_rounded : Icons.eco_rounded),
          _buildOcrFieldTile('Ingredients', p.ingredients, Icons.receipt_long_rounded),
          _buildOcrFieldTile('Nutrition Facts', p.nutritionFacts, Icons.monitor_weight_outlined),
          if (p.allergens.isNotEmpty)
            _buildOcrFieldTile('Allergens', p.allergens.join(', '), Icons.sick_outlined),
          _buildOcrFieldTile('Warnings / Cautions', p.warnings, Icons.warning_amber_rounded),

          if (p.declarations.isNotEmpty || p.unableToVerify.isNotEmpty || p.ambiguousDetails.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(height: 1, color: AppTheme.neutralBorder),
            const SizedBox(height: 12),
            const Text(
              'Strict AI Validation Logs',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
            ),
            const SizedBox(height: 10),

            if (p.declarations.isNotEmpty) ...[
              const Text('Verified Declarations:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green)),
              ...p.declarations.map((d) => Padding(
                padding: const EdgeInsets.only(top: 4, left: 8),
                child: Text('• ${d['text']} (${d['location']})', style: const TextStyle(fontSize: 11, color: AppTheme.primaryInk)),
              )).toList(),
              const SizedBox(height: 8),
            ],

            if (p.ambiguousDetails.isNotEmpty) ...[
              const Text('Ambiguous / Conflicting Info:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.orange)),
              ...p.ambiguousDetails.map((a) => Padding(
                padding: const EdgeInsets.only(top: 4, left: 8),
                child: Text('• $a', style: const TextStyle(fontSize: 11, color: AppTheme.primaryInk)),
              )).toList(),
              const SizedBox(height: 8),
            ],

            if (p.unableToVerify.isNotEmpty) ...[
              const Text('Unable to Verify (Missing/Obstructed):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.violationRed)),
              Padding(
                padding: const EdgeInsets.only(top: 4, left: 8),
                child: Text(p.unableToVerify.join(', '), style: const TextStyle(fontSize: 11, color: AppTheme.secondaryText)),
              ),
            ],
          ]
        ],
      ),
    );
  }

  Widget _buildOcrFieldTile(String label, String value, IconData icon) {
    if (value.trim().isEmpty || value == 'N/A') return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 15, color: AppTheme.secondaryText),
          const SizedBox(width: 8),
          Expanded(
            flex: 4,
            child: Text(
              label,
              style: const TextStyle(fontSize: 12, color: AppTheme.secondaryText, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            flex: 5,
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.primaryInk),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComplianceChecklistCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppTheme.neutralBorder,
          width: 2.0,
        ),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.checklist_rounded, color: AppTheme.primaryNavy, size: 20),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Compliance Checklist (PCR, 2011)',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.primaryInk),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Column(
            children: _complianceChecks.map((c) {
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: c.isCompliant ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      c.isCompliant ? Icons.check_circle_rounded : Icons.cancel_rounded,
                      size: 18,
                      color: c.isCompliant ? AppTheme.passGreen : AppTheme.violationRed,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(c.title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          Text(
                            c.flaggedDetail ?? c.description,
                            style: TextStyle(
                              fontSize: 10.5,
                              color: c.isCompliant ? AppTheme.textSecondary : AppTheme.violationRed,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: c.isCompliant ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        c.isCompliant ? 'PASS' : 'VIOLATION',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          color: c.isCompliant ? const Color(0xFF15803D) : AppTheme.violationRed,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return SizedBox(
      height: 52,
      child: ElevatedButton.icon(
        onPressed: _openPdfGenerationScreen,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.violationRed,
          foregroundColor: Colors.white,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        icon: const Icon(Icons.picture_as_pdf_rounded, color: Colors.white, size: 20),
        label: const Text(
          'Generate Notice (PDF)',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, letterSpacing: 0.3),
        ),
      ),
    );
  }
}
