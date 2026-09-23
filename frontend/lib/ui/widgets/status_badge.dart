import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/inspection_report.dart';

/// StatusBadge renders a high-contrast, accessible status indicator for field officers.
class StatusBadge extends StatelessWidget {
  final InspectionStatus status;
  final bool isLargeBanner;
  final String? customLabel;

  const StatusBadge({
    super.key,
    required this.status,
    this.isLargeBanner = false,
    this.customLabel,
  });

  @override
  Widget build(BuildContext context) {
    final isViolation = status == InspectionStatus.violation;

    final bgColor = isViolation
        ? (isLargeBanner ? AppTheme.violationRed : AppTheme.violationBackground)
        : (isLargeBanner ? AppTheme.passGreen : AppTheme.passBackground);

    final textColor = isViolation
        ? (isLargeBanner ? Colors.white : AppTheme.violationText)
        : (isLargeBanner ? Colors.white : AppTheme.passText);

    final iconColor = textColor;
    final defaultLabel = isViolation ? 'VIOLATION DETECTED' : 'PASS';
    final label = customLabel ?? (isLargeBanner && !isViolation ? 'COMPLIANT / PASS' : defaultLabel);

    if (isLargeBanner) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: bgColor.withAlpha(70),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isViolation ? Icons.warning_amber_rounded : Icons.check_circle_rounded,
              color: iconColor,
              size: 24,
            ),
            const SizedBox(width: 10),
            Text(
              label,
              style: TextStyle(
                color: textColor,
                fontSize: 16,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
              ),
            ),
          ],
        ),
      );
    }

    // Compact Chip / Badge for cards and lists
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: isViolation ? AppTheme.violationRed.withAlpha(60) : AppTheme.passGreen.withAlpha(60),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isViolation ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded,
            color: iconColor,
            size: 14,
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              color: textColor,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }
}
