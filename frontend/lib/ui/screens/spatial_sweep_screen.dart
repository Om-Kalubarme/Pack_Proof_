import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/spatial_unwrapping_models.dart';
import '../../data/services/spatial_unwrapping_service.dart';

/// Screen: Pillar 2 - 3D Spatial Package Unwrapping & Topology Stitching
/// Multi-Panel Panorama Engine with 6-Second Spatial Sweep & Holistic Rule Evaluation.
class SpatialSweepScreen extends StatefulWidget {
  const SpatialSweepScreen({super.key});

  @override
  State<SpatialSweepScreen> createState() => _SpatialSweepScreenState();
}

class _SpatialSweepScreenState extends State<SpatialSweepScreen> with SingleTickerProviderStateMixin {
  bool _isSweeping = false;
  double _sweepProgress = 1.0; // 0.0 -> 1.0
  Timer? _sweepTimer;
  UnwrappedTextureMap _unwrappedMap = UnwrappedTextureMap.sample();
  late AnimationController _rotationAnimCtrl;

  @override
  void initState() {
    super.initState();
    _rotationAnimCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    );
  }

  @override
  void dispose() {
    _sweepTimer?.cancel();
    _rotationAnimCtrl.dispose();
    super.dispose();
  }

  void _start6SecondSpatialSweep() {
    setState(() {
      _isSweeping = true;
      _sweepProgress = 0.0;
    });
    _rotationAnimCtrl.forward(from: 0.0);

    const tickMs = 50;
    const totalMs = 6000;
    int elapsed = 0;

    _sweepTimer?.cancel();
    _sweepTimer = Timer.periodic(const Duration(milliseconds: tickMs), (timer) async {
      elapsed += tickMs;
      if (mounted) {
        setState(() {
          _sweepProgress = (elapsed / totalMs).clamp(0.0, 1.0);
        });
      }

      if (elapsed >= totalMs) {
        timer.cancel();
        final resultMap = await SpatialUnwrappingService.processSpatialSweep(
          packageId: 'PKG-3D-${DateTime.now().millisecondsSinceEpoch % 10000}',
          sweepDuration: 6.0,
        );
        if (mounted) {
          setState(() {
            _isSweeping = false;
            _sweepProgress = 1.0;
            _unwrappedMap = resultMap;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('6-Second 3D Spatial Sweep complete! 2D texture map reconstructed across all faces.'),
              duration: Duration(milliseconds: 400),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    });
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
              '3D Spatial Package Unwrapping',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
            ),
            Text(
              'Pillar 2: Multi-Panel Panorama Engine & 6s Sweep',
              style: TextStyle(fontSize: 10.5, color: Color(0xFFCBD5E1)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: 'Re-run 6-Second Sweep',
            onPressed: _isSweeping ? null : _start6SecondSpatialSweep,
          ),
        ],
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

              // 6-Second Spatial Sweep Simulator Card
              _buildSpatialSweepCard(),
              const SizedBox(height: 16),

              // Reconstructed 2D Unwrapped View
              _buildReconstructedPanoramaCard(),
              const SizedBox(height: 16),

              // Holistic Rule Engine Evaluation
              _buildHolisticRuleEngineCard(),
              const SizedBox(height: 16),

              // Bottom Completion Banner
              _buildBottomSummaryBanner(),
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
        color: const Color(0xFF3B0764),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFA855F7), width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: const BoxDecoration(
              color: Color(0xFFA855F7),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: const Text(
              '2',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20),
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '3D Spatial Package Unwrapping & Topology Stitching',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                ),
                SizedBox(height: 2),
                Text(
                  'Multi-Panel Panorama Engine',
                  style: TextStyle(color: Color(0xFFE9D5FF), fontWeight: FontWeight.w700, fontSize: 13),
                ),
                SizedBox(height: 6),
                Text(
                  'Captures the entire 3D package in a 6-second sweep and reconstructs a complete 2D texture map.',
                  style: TextStyle(color: Color(0xFFF3E8FF), fontSize: 11.5, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpatialSweepCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Row(
                  children: [
                    Icon(Icons.screen_rotation_rounded, color: Color(0xFF7C3AED), size: 20),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '6-second spatial sweep',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3E8FF),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'gyroscope + visual tracking',
                  style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF7C3AED)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Sweep Visualizer HUD
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 80,
                          height: 80,
                          child: CircularProgressIndicator(
                            value: _sweepProgress,
                            strokeWidth: 6,
                            backgroundColor: Colors.white24,
                            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFA855F7)),
                          ),
                        ),
                        Icon(
                          _isSweeping ? Icons.autorenew_rounded : Icons.view_in_ar_rounded,
                          size: 34,
                          color: Colors.white,
                        ),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isSweeping
                                ? 'SWEEPING: ${(6.0 * (1.0 - _sweepProgress)).toStringAsFixed(1)}s'
                                : '360° TOPOLOGY LOCKED',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: _isSweeping ? const Color(0xFF38BDF8) : const Color(0xFF4ADE80),
                              fontFamily: 'monospace',
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Front • Right • Back • Left • Top • Bottom',
                            style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _isSweeping ? 'Rotate around package...' : 'All 6 facets unified in texture buffer',
                            style: const TextStyle(fontSize: 11, color: Colors.white70),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Panel Badges
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  alignment: WrapAlignment.center,
                  children: SpatialSweepPanelType.values.map((p) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Text(
                        p.label,
                        style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          ElevatedButton.icon(
            onPressed: _isSweeping ? null : _start6SecondSpatialSweep,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C3AED),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            icon: const Icon(Icons.play_arrow_rounded, size: 18),
            label: Text(
              _isSweeping ? 'Performing 6-Second Sweep...' : 'Trigger 6-Second Spatial Sweep',
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReconstructedPanoramaCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Row(
            children: [
              Icon(Icons.panorama_horizontal_rounded, color: AppTheme.primaryNavy, size: 20),
              SizedBox(width: 8),
              Text(
                'Reconstructed 2D Unwrapped View',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // High contrast visual panoramic texture map representation
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF08A),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFEAB308), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFCA8A04),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'STITCHED PANORAMA TEXTURE MAP (CYLINDRICAL UNROLL)',
                    style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w900),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    // Panel 1: Front (Brand, MRP, Net Qty)
                    Expanded(
                      flex: 4,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFDE047),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFA16207)),
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('FRONT PANEL', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 9, color: Color(0xFF854D0E))),
                            SizedBox(height: 4),
                            Text('Potato Chips', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF713F12))),
                            Text('MRP: ₹50.00', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 10, color: AppTheme.violationRed)),
                            Text('Net Wt: 200 g', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 10, color: Color(0xFF15803D))),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),

                    // Panel 2: Nutritional Facts
                    Expanded(
                      flex: 3,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFCBD5E1)),
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('NUTRITION', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 9, color: Color(0xFF475569))),
                            SizedBox(height: 4),
                            Text('Energy: 540 kcal\nFat: 32g\nCarb: 54g', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),

                    // Panel 3: Back (Barcode & Mfg)
                    Expanded(
                      flex: 4,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFCBD5E1)),
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('BARCODE / MFG', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 9, color: Color(0xFF475569))),
                            SizedBox(height: 2),
                            Icon(Icons.view_column_rounded, size: 16, color: Colors.black87),
                            Text('8906123456789', style: TextStyle(fontSize: 8, fontFamily: 'monospace', fontWeight: FontWeight.bold)),
                            Text('FSSAI: 10012022000123', style: TextStyle(fontSize: 7.5, fontWeight: FontWeight.bold, color: Color(0xFF15803D))),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),

                    // Panel 4: Consumer Care
                    Expanded(
                      flex: 3,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFDE047),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFA16207)),
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('CARE CELL', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 9, color: Color(0xFF854D0E))),
                            SizedBox(height: 4),
                            Text('care@abcfoods.in\n1800-4082\nIndia', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w700, color: Color(0xFF713F12))),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Texture stitching resolution: 1920x840 px • Cylindrical unroll error margin: <0.4 mm',
            style: TextStyle(fontSize: 10.5, color: Color(0xFF64748B), fontStyle: FontStyle.italic),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildHolisticRuleEngineCard() {
    final eval = _unwrappedMap.evaluation;

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
          Row(
            children: [
              const Icon(Icons.rule_folder_rounded, color: AppTheme.primaryNavy, size: 20),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Rule Engine Evaluation (Holistic)',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 4 Grid/List items from design infographic
          _buildHolisticCheckItem(
            icon: Icons.checklist_rounded,
            title: 'Verifies all mandatory declarations across panels',
            description: '${eval.verifiedDeclarations.length} of 7 mandatory declarations matched across multi-panel topology.',
            isPass: eval.allMandatoryDeclarationsFound,
          ),
          const SizedBox(height: 10),
          _buildHolisticCheckItem(
            icon: Icons.text_fields_rounded,
            title: 'Validates font heights and readability',
            description: 'Min detected: ${eval.minDetectedFontHeightMm} mm (Statutory min required: ${eval.requiredFontHeightMm} mm under Table-I).',
            isPass: eval.fontHeightsCompliant,
          ),
          const SizedBox(height: 10),
          _buildHolisticCheckItem(
            icon: Icons.aspect_ratio_rounded,
            title: 'Checks Principal Display Panel (PDP) surface area ratios',
            description: 'Computed PDP ratio: ${eval.pdpSurfaceRatioPercent.toStringAsFixed(1)}% of front face (Statutory rule requires ≥40%).',
            isPass: eval.isPdpRatioCompliant,
          ),
          const SizedBox(height: 10),
          _buildHolisticCheckItem(
            icon: Icons.grid_view_rounded,
            title: 'Ensures compliance even across panel boundaries',
            description: 'Continuity & seam line optical OCR checks confirmed zero truncated or obscured statutory numerals.',
            isPass: eval.crossPanelBoundaryValid,
          ),
        ],
      ),
    );
  }

  Widget _buildHolisticCheckItem({
    required IconData icon,
    required String title,
    required String description,
    required bool isPass,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isPass ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isPass ? Icons.check_circle_rounded : Icons.cancel_rounded,
            color: isPass ? const Color(0xFF16A34A) : AppTheme.violationRed,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.textPrimary),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569), height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomSummaryBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF3E8FF),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFA855F7), width: 1.5),
      ),
      child: const Row(
        children: [
          Icon(Icons.check_circle_outline_rounded, color: Color(0xFF7C3AED), size: 20),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'No panel is missed. The entire 3D package is analyzed.',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: Color(0xFF581C87)),
            ),
          ),
        ],
      ),
    );
  }
}
