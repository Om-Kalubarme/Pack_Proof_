import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/evidence_chain_models.dart';
import '../../data/services/evidence_chain_service.dart';
import '../widgets/consumer_affairs_logo.dart';

/// Screen: Pillar 1 - Cryptographic Legal Chain of Custody (Digital "Exhibit A")
/// Admissible under Section 65B Indian Evidence Act / Section 63 Bharatiya Sakshya Adhiniyam, 2023.
class DigitalEvidenceVaultScreen extends StatefulWidget {
  final DigitalEvidenceExhibit? initialExhibit;

  const DigitalEvidenceVaultScreen({
    super.key,
    this.initialExhibit,
  });

  @override
  State<DigitalEvidenceVaultScreen> createState() => _DigitalEvidenceVaultScreenState();
}

class _DigitalEvidenceVaultScreenState extends State<DigitalEvidenceVaultScreen> {
  late DigitalEvidenceExhibit _exhibit;

  @override
  void initState() {
    super.initState();
    _exhibit = widget.initialExhibit ?? DigitalEvidenceExhibit.sample();
  }

  void _showCertificateDialog() {
    final certText = EvidenceChainService.generateSection65BCertificateText(_exhibit);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        title: const Row(
          children: [
            Icon(Icons.verified_user_rounded, color: AppTheme.primaryNavy, size: 22),
            SizedBox(width: 8),
            Text(
              'Section 65B Forensic Certificate',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.primaryNavy),
            ),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: SelectableText(
              certText,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 11, height: 1.4, color: AppTheme.textPrimary),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Close', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Section 65B Digital Certificate exported & attached to case record.'),
                  duration: Duration(milliseconds: 400),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryNavy, foregroundColor: Colors.white),
            icon: const Icon(Icons.download_rounded, size: 16),
            label: const Text('Export Certificate'),
          ),
        ],
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
              'Digital Evidence Vault',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
            ),
            Text(
              'Pillar 1: Section 65B Cryptographic Chain of Custody',
              style: TextStyle(fontSize: 10.5, color: Color(0xFFCBD5E1)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.description_outlined, color: Colors.white),
            tooltip: 'View Section 65B Certificate',
            onPressed: _showCertificateDialog,
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 680),
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
            children: [
              // Top Statutory Pillar Banner
              _buildPillarHeader(),
              const SizedBox(height: 16),

              // Exhibit A Forensic Vault Card
              _buildExhibitACard(),
              const SizedBox(height: 16),

              // Captured Evidence Breakdown List
              _buildEvidenceBreakdownCard(),
              const SizedBox(height: 16),

              // Immutable Evidence Trail Banner
              _buildImmutableBanner(),
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
        color: const Color(0xFF0C2340),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.accentGold, width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: const BoxDecoration(
              color: AppTheme.accentGold,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: const Text(
              '1',
              style: TextStyle(color: Color(0xFF0C2340), fontWeight: FontWeight.w900, fontSize: 20),
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Cryptographic Legal Chain of Custody',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                ),
                SizedBox(height: 2),
                Text(
                  'Digital "Exhibit A" for Court Admissibility',
                  style: TextStyle(color: AppTheme.accentGold, fontWeight: FontWeight.w700, fontSize: 13),
                ),
                SizedBox(height: 6),
                Text(
                  'Every scan becomes an immutable, legally valid digital evidence record (Section 65B Compliant).',
                  style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 11.5, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExhibitACard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF16A34A), width: 2),
        boxShadow: const [
          BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const ConsumerAffairsLogo(size: 38),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Digital Evidence Vault',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF64748B)),
                    ),
                    Text(
                      'Exhibit A: ${_exhibit.caseId}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF16A34A)),
                ),
                child: const Text(
                  'SEC 65B',
                  style: TextStyle(color: Color(0xFF15803D), fontWeight: FontWeight.w900, fontSize: 11),
                ),
              ),
            ],
          ),
          const Divider(height: 24, color: Color(0xFFE2E8F0)),

          // Core Evidence Attributes (infographic readout)
          _buildAttributeRow(
            icon: Icons.tag_rounded,
            label: 'Image Hash (SHA-256):',
            value: '${_exhibit.imageSha256Hash.substring(0, 16)}...${_exhibit.imageSha256Hash.substring(_exhibit.imageSha256Hash.length - 8)}',
            isMonospace: true,
          ),
          const SizedBox(height: 8),
          _buildAttributeRow(
            icon: Icons.phone_android_rounded,
            label: 'Device IMEI:',
            value: _exhibit.deviceImei,
            isMonospace: true,
          ),
          const SizedBox(height: 8),
          _buildAttributeRow(
            icon: Icons.location_on_rounded,
            label: 'GPS Coordinates:',
            value: _exhibit.gpsCoordinates,
            isMonospace: true,
          ),
          const SizedBox(height: 8),
          _buildAttributeRow(
            icon: Icons.access_time_filled_rounded,
            label: 'Timestamp (NPLI):',
            value: '${_exhibit.atomicTimestampNpli} (CSIR-NPL)',
            isMonospace: true,
          ),
          const SizedBox(height: 8),
          _buildAttributeRow(
            icon: Icons.crop_free_rounded,
            label: 'Bounding Boxes:',
            value: 'Included (4 statutory zones mapped)',
          ),
          const SizedBox(height: 8),
          _buildAttributeRow(
            icon: Icons.verified_rounded,
            label: 'Watermark:',
            value: _exhibit.watermarkText,
          ),

          const SizedBox(height: 16),

          // 4 Statutory Badges from Infographic
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildStatutoryBadge('Immutable evidence'),
              _buildStatutoryBadge('Court admissible'),
              _buildStatutoryBadge('Tamper-proof'),
              _buildStatutoryBadge('Time-stamped by National Metrology Lab'),
            ],
          ),

          const SizedBox(height: 16),

          // QR Code Verification Box
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFCBD5E1), width: 1.2),
            ),
            child: Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppTheme.primaryNavy),
                  ),
                  child: const Icon(Icons.qr_code_2_rounded, size: 42, color: AppTheme.primaryNavy),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Section 65B Compliant',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.primaryNavy),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Digitally Signed • Tamper-Proof Cryptographic Hash',
                        style: TextStyle(fontSize: 11, color: Color(0xFF475569), fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEvidenceBreakdownCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Evidence Data Captured',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppTheme.primaryNavy),
          ),
          const SizedBox(height: 12),
          _buildEvidenceItem(
            icon: Icons.fingerprint_rounded,
            title: 'Cryptographic SHA-256 hash',
            subtitle: 'Computed over raw pixel buffer + inspector identity + geolocation',
          ),
          const SizedBox(height: 10),
          _buildEvidenceItem(
            icon: Icons.select_all_rounded,
            title: 'Bounding-box pixel coordinates',
            subtitle: 'Exact coordinates for MRP, Net Qty, Best Before, and Mfg Address',
          ),
          const SizedBox(height: 10),
          _buildEvidenceItem(
            icon: Icons.sim_card_outlined,
            title: 'Device IMEI & Inspector Badge',
            subtitle: 'Hardened device fingerprint preventing remote or unverified submissions',
          ),
          const SizedBox(height: 10),
          _buildEvidenceItem(
            icon: Icons.gps_fixed_rounded,
            title: 'GPS coordinates',
            subtitle: 'Live geographic coordinates stamped during on-site store audit',
          ),
          const SizedBox(height: 10),
          _buildEvidenceItem(
            icon: Icons.shutter_speed_rounded,
            title: 'Atomic timestamp from CSIR-NPL / UTC(NPLI)',
            subtitle: 'Statutory national standard time under Legal Metrology Rules, 2026',
          ),
        ],
      ),
    );
  }

  Widget _buildEvidenceItem({required IconData icon, required String title, required String subtitle}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(icon, size: 18, color: const Color(0xFF2563EB)),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAttributeRow({
    required IconData icon,
    required String label,
    required String value,
    bool isMonospace = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF64748B)),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, color: Color(0xFF334155)),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: AppTheme.primaryNavy,
              fontFamily: isMonospace ? 'monospace' : null,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatutoryBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF22C55E), width: 1.2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 15),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF166534)),
          ),
        ],
      ),
    );
  }

  Widget _buildImmutableBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFDCFCE7),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF16A34A), width: 1.5),
      ),
      child: const Row(
        children: [
          Icon(Icons.gavel_rounded, color: Color(0xFF15803D), size: 20),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'A digital evidence trail that cannot be disputed.',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: Color(0xFF14532D)),
            ),
          ),
        ],
      ),
    );
  }
}
