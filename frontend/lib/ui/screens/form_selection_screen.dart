import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:open_file/open_file.dart';
import 'package:uuid/uuid.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/inspection_report.dart';
import '../../data/services/pdf_form_service.dart';
import '../../data/services/case_service.dart';

class FormSelectionScreen extends StatefulWidget {
  final InspectionReport report;
  final String officerName;
  final String designation;
  final String jurisdiction;
  final String businessName;

  const FormSelectionScreen({
    Key? key,
    required this.report,
    required this.officerName,
    required this.designation,
    required this.jurisdiction,
    required this.businessName,
  }) : super(key: key);

  @override
  State<FormSelectionScreen> createState() => _FormSelectionScreenState();
}

class _FormSelectionScreenState extends State<FormSelectionScreen> {

  String _selectedForm = 'Form A';
  String? _autoSelectedUnit;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final netQty = widget.report.productDetails.declaredNetQuantity.toLowerCase();
    
    if (RegExp(r'ml').hasMatch(netQty)) {
      _selectedForm = 'Form B';
      _autoSelectedUnit = 'ml';
    } else if (RegExp(r'l').hasMatch(netQty)) {
      _selectedForm = 'Form B';
      _autoSelectedUnit = 'l';
    } else if (RegExp(r'kg').hasMatch(netQty)) {
      _selectedForm = 'Form A';
      _autoSelectedUnit = 'kg';
    } else if (RegExp(r'g').hasMatch(netQty)) {
      _selectedForm = 'Form A';
      _autoSelectedUnit = 'g';
    }
  }

  void _generatePdf() async {
    setState(() => _isSaving = true);
    
    try {
      final path = await PdfFormService.savePdfToFile(
        widget.report,
        formType: _selectedForm,
        officerName: widget.officerName,
        businessName: widget.businessName,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('PDF Generated & Saved Successfully!\n$path'),
            backgroundColor: AppTheme.passGreen,
            duration: const Duration(seconds: 4),
          ),
        );
        OpenFile.open(path);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error generating PDF: $e'),
            backgroundColor: AppTheme.violationRed,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _sendToAuthority() async {
    setState(() => _isSaving = true);
    final caseId = const Uuid().v4().substring(0, 8);
    
    // 1. Assign the case first so the DB foreign key constraint passes
    await CaseService().assignCase({
      "case_id": caseId,
      "business_name": widget.businessName,
      "address": "123 Main St, New Delhi, 110001", // Mocked for demo
      "gps_location": "28.6139, 77.2090",
      "inspection_type": "Retail Store",
      "assigned_inspector_id": widget.officerName,
      "deadline_timestamp": DateTime.now().add(const Duration(days: 7)).toIso8601String(),
      "priority": "HIGH"
    });

    // 2. Submit the Form A/B report
    final p = widget.report.productDetails;
    final declaredQty = double.tryParse(p.declaredNetQuantity.replaceAll(RegExp(r'[^0-9.]'), '')) ?? 500.0;
    
    String? base64Image;
    if (widget.report.imageBytes != null) {
      base64Image = base64Encode(widget.report.imageBytes!);
    }
    
    final payload = {
      "case_id": caseId,
      "declared_quantity": declaredQty,
      "image_base64": base64Image,
      "ocr_text": {
        "address": p.manufacturerAddress.isNotEmpty ? p.manufacturerAddress : "${widget.businessName}, 123 Industrial Area, Mumbai",
        "net_quantity_text": "Net Wt: ${p.declaredNetQuantity.isNotEmpty ? p.declaredNetQuantity : '500 gms'}", 
        "mrp_text": "MRP: ${p.declaredMrp.isNotEmpty ? p.declaredMrp : '50.00'}",
        "brandName": p.brandName,
        "batchMfgDate": p.batchMfgDate
      },
      "spatial_measurements": [
        {"height_mm": 1.8, "width_mm": 1.0, "pdp_area_cm2": 145}
      ],
      "physical_samples": [
        widget.report.measuredNetWeight ?? 495.0,
        495.0, 480.0, 498.2 
      ]
    };
    
    final result = await CaseService().submitInspection(payload);
    setState(() => _isSaving = false);
    
    if (result != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Report successfully sent to Higher Authority Dashboard!'),
          backgroundColor: AppTheme.primaryNavy,
          duration: Duration(seconds: 4),
        ),
      );
    } else if (mounted) {
       ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to connect to HQ server.'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  void _saveToCaseLogs() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Report successfully saved to Case Logs.'),
        backgroundColor: AppTheme.primaryNavy,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      appBar: AppBar(
        title: const Text('Select Statutory Form'),
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Select the appropriate statutory data sheet for generating the official document.',
              style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 24),
            
            // Form Selection
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    RadioListTile<String>(
                      title: const Text('Form A (Weight Checking - Data Sheet)'),
                      subtitle: const Text('THE SEVENTH SCHEDULE'),
                      value: 'Form A',
                      groupValue: _selectedForm,
                      activeColor: AppTheme.primaryNavy,
                      onChanged: (val) => setState(() => _selectedForm = val!),
                    ),
                    const Divider(),
                    RadioListTile<String>(
                      title: const Text('Form B (Volume/Length Checking - Data Sheet)'),
                      subtitle: const Text('THE SEVENTH SCHEDULE'),
                      value: 'Form B',
                      groupValue: _selectedForm,
                      activeColor: AppTheme.primaryNavy,
                      onChanged: (val) => setState(() => _selectedForm = val!),
                    ),
                  ],
                ),
              ),
            ),
            if (_autoSelectedUnit != null)
              Padding(
                padding: const EdgeInsets.only(top: 8.0, bottom: 8.0, left: 4.0),
                child: Text(
                  '*(Auto-selected based on commodity unit: $_autoSelectedUnit)*',
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, fontStyle: FontStyle.italic),
                ),
              ),
            
            const SizedBox(height: 24),

            // Generate Button
            SizedBox(
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _generatePdf,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryNavy,
                  foregroundColor: Colors.white,
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: _isSaving
                    ? const SizedBox(
                        width: 20, height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Icons.picture_as_pdf_rounded, size: 20),
                label: Text(
                  _isSaving ? 'Generating $_selectedForm...' : 'Generate & Preview $_selectedForm PDF',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Send to Higher Authority
            SizedBox(
              height: 52,
              child: OutlinedButton.icon(
                onPressed: _isSaving ? null : _sendToAuthority,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.primaryNavy,
                  side: const BorderSide(color: AppTheme.primaryNavy, width: 2),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: _isSaving
                    ? const SizedBox(
                        width: 20, height: 20,
                        child: CircularProgressIndicator(color: AppTheme.primaryNavy, strokeWidth: 2),
                      )
                    : const Icon(Icons.send_rounded, size: 20),
                label: Text(
                  _isSaving ? 'Sending...' : 'Send to Higher Authority',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Save to Case Logs
            SizedBox(
              height: 52,
              child: OutlinedButton.icon(
                onPressed: _saveToCaseLogs,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.primaryNavy,
                  side: const BorderSide(color: AppTheme.primaryNavy, width: 2),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.save_outlined, size: 20),
                label: const Text(
                  'Save to Case Logs',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
