import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/fraud_detection_models.dart';
import '../../data/services/fraud_detection_service.dart';

/// Screen: Pillar 3 - Cross-Registry Statutory Fraud & Counterfeit Detection
/// Validates GS1 Barcodes, FSSAI / Model Approvals, and Dual MRP / Physical Relabeling.
class FraudDetectionScreen extends StatefulWidget {
  final FraudDetectionSummary? initialSummary;

  const FraudDetectionScreen({
    super.key,
    this.initialSummary,
  });

  @override
  State<FraudDetectionScreen> createState() => _FraudDetectionScreenState();
}

class _FraudDetectionScreenState extends State<FraudDetectionScreen> {
  late FraudDetectionSummary _summary;
  bool _simulateMismatch = false;
  bool _simulateDualMrp = true;

  @override
  void initState() {
    super.initState();
    _summary = widget.initialSummary ?? FraudDetectionSummary.sample();
  }

  Future<void> _recalculateAudit({bool? mismatch, bool? dualMrp}) async {
    final newMismatch = mismatch ?? _simulateMismatch;
    final newDualMrp = dualMrp ?? _simulateDualMrp;

    final updated = await FraudDetectionService.runCompleteFraudAudit(
      simulateMismatch: newMismatch,
      simulateDualMrp: newDualMrp,
    );

    setState(() {
      _simulateMismatch = newMismatch;
      _simulateDualMrp = newDualMrp;
      _summary = updated;
    });

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          newMismatch
              ? 'Class-1 Identity Fraud simulated: GS1 registry mismatch flagged.'
              : 'Cross-registry audit updated.',
        ),
        duration: const Duration(milliseconds: 400),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Statutory Fraud & Counterfeit Audit',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
            ),
            Text(
              'Pillar 3: GS1 Registry, FSSAI & Dual MRP Edge Analysis',
              style: TextStyle(fontSize: 10.5, color: Color(0xFFCBD5E1)),
            ),
          ],
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
            children: [
              // Top Statutory Pillar Banner
              _buildPillarHeader(),
              const SizedBox(height: 16),

              // 1. GS1 Barcode Validation Card
              _buildGs1BarcodeCard(),
              const SizedBox(height: 16),

              // 2. Model Approval & License Cross-Check Card
              _buildLicenseCrossCheckCard(),
              const SizedBox(height: 16),

              // 3. Dual MRP & Relabeling Detector Card
              _buildDualMrpDetectorCard(),
              const SizedBox(height: 16),

              // Bottom Protection Banner
              _buildBottomBanner(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPillarHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF064E3B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF10B981), width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: const BoxDecoration(
              color: Color(0xFF10B981),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: const Text(
              '3',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20),
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Cross-Registry Statutory Fraud & Counterfeit Detection',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                ),
                SizedBox(height: 2),
                Text(
                  'Verifies text against government and global registries',
                  style: TextStyle(color: Color(0xFFA7F3D0), fontWeight: FontWeight.w700, fontSize: 13),
                ),
                SizedBox(height: 6),
                Text(
                  'Doesn’t just read text — it verifies the authenticity of every critical detail.',
                  style: TextStyle(color: Color(0xFFD1FAE5), fontSize: 11.5, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGs1BarcodeCard() {
    final gs1 = _summary.gs1Verification;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: gs1.isMatch ? const Color(0xFF16A34A) : AppTheme.violationRed,
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: Color(0xFF047857),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Text('1', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'GS1 Barcode Validation',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              // Toggle simulation button
              TextButton(
                onPressed: () => _recalculateAudit(mismatch: !_simulateMismatch),
                child: Text(
                  _simulateMismatch ? 'Simulate Match' : 'Simulate Fraud',
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.bold,
                    color: _simulateMismatch ? const Color(0xFF16A34A) : AppTheme.violationRed,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Barcode Scan Readout Box
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFCBD5E1)),
            ),
            child: Row(
              children: [
                const Icon(Icons.qr_code_scanner_rounded, size: 36, color: AppTheme.primaryNavy),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Barcode: ${gs1.scannedBarcode}',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'GS1 Global Registry: Registered to ${gs1.gs1RegisteredEntity}',
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569)),
                      ),
                      Text(
                        'Label Declared Entity: ${gs1.labelDeclaredEntity}',
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: gs1.isMatch ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: gs1.isMatch ? const Color(0xFF16A34A) : AppTheme.violationRed),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        gs1.isMatch ? Icons.check_circle_rounded : Icons.cancel_rounded,
                        color: gs1.isMatch ? const Color(0xFF15803D) : AppTheme.violationRed,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        gs1.isMatch ? 'MATCH' : 'MISMATCH',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 11,
                          color: gs1.isMatch ? const Color(0xFF15803D) : AppTheme.violationRed,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          if (!gs1.isMatch) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFEF4444)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.error_outline_rounded, color: AppTheme.violationRed, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      gs1.fraudAlertMessage ??
                          'Mismatch? Triggers Class-1 Identity Fraud Alert (e.g., barcode registered to Company A but label claims Company B)',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF991B1B),
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLicenseCrossCheckCard() {
    final lic = _summary.licenseCrossCheck;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF16A34A), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: Color(0xFF047857),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Text('2', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Model Approval & License Cross-Check',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFCBD5E1)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'FSSAI Lic. No: ${lic.fssaiLicNo}',
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12.5),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Model Approval No: ${lic.modelApprovalNo}',
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12.5),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Registry: ${lic.registrySource}',
                        style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.account_balance_rounded, size: 28, color: Color(0xFF475569)),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFF16A34A)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_circle_rounded, color: Color(0xFF15803D), size: 12),
                          SizedBox(width: 4),
                          Text('FSSAI: Valid', style: TextStyle(color: Color(0xFF15803D), fontSize: 10.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFF16A34A)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified_rounded, color: Color(0xFF15803D), size: 12),
                          SizedBox(width: 4),
                          Text('VERIFIED', style: TextStyle(color: Color(0xFF15803D), fontSize: 10.5, fontWeight: FontWeight.w900)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDualMrpDetectorCard() {
    final dual = _summary.dualMrpDetection;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: dual.hasRelabeling ? AppTheme.violationRed : const Color(0xFF16A34A),
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: Color(0xFF047857),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Text('3', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Dual MRP & Relabeling Detector',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              TextButton(
                onPressed: () => _recalculateAudit(dualMrp: !_simulateDualMrp),
                child: Text(
                  _simulateDualMrp ? 'Clear Sticker' : 'Simulate Dual MRP',
                  style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Side-by-side Visual Representation from Infographic
          Row(
            children: [
              // Left: Physical Re-Sticker Visual
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF9C3),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFFACC15)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'PHYSICAL OVERLAY',
                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF854D0E)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Sticker: ${dual.detectedStickerPrice}',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppTheme.violationRed),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Original: ${dual.detectedOriginalPrice}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF64748B),
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Right: Edge-Line Detection Matrix
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFEF4444)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'EDGE-LINE ANALYSIS',
                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF38BDF8)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${dual.detectedStickerPrice} (LAYER 2)',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFFF87171), fontFamily: 'monospace'),
                      ),
                      Text(
                        '${dual.detectedOriginalPrice} (LAYER 1)',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),
          Text(
            'Detects physical re-sticker overlays, scratched-out prices, or double-printed tags using edge-line analysis.',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
          ),
          const SizedBox(height: 4),
          Text(
            'Advanced image analysis detects depth inconsistencies (Anomaly Score: ${dual.edgeLineInconsistencyScore}%).',
            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),

          if (dual.hasRelabeling) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFEF4444)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.gavel_rounded, color: AppTheme.violationRed, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      dual.statutoryViolation,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF991B1B)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBottomBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFD1FAE5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF059669), width: 1.5),
      ),
      child: const Row(
        children: [
          Icon(Icons.verified_user_rounded, color: Color(0xFF047857), size: 20),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Stops counterfeits. Ensures only genuine, compliant products pass the check.',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: Color(0xFF065F46)),
            ),
          ),
        ],
      ),
    );
  }
}
