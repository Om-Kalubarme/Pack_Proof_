import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// PACKPROOF App Logo Widget
class PackproofLogo extends StatelessWidget {
  final double size;
  final bool isBadge;
  final Color? borderColor;
  final double borderWidth;
  final BoxFit fit;

  const PackproofLogo({
    super.key,
    this.size = 120,
    this.isBadge = false,
    this.borderColor,
    this.borderWidth = 2.0,
    this.fit = BoxFit.contain,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveBorderColor = borderColor ?? Colors.transparent;

    Widget imageContent = Image.asset(
      'assets/images/packproof_logo.png',
      width: size,
      height: size,
      fit: fit,
    );

    if (!isBadge) {
      return SizedBox(
        width: size,
        height: size,
        child: imageContent,
      );
    }

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: effectiveBorderColor != Colors.transparent
            ? Border.all(color: effectiveBorderColor, width: borderWidth)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(25),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Center(child: imageContent),
    );
  }
}
