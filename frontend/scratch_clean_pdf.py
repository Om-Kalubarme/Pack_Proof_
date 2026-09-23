import re
with open('lib/ui/screens/pdf_generation_form_screen.dart', 'r', encoding='utf-8') as f:
    content = f.read()

new_method = '''  String _determineFormType() {
    final netQty = widget.report.productDetails.declaredNetQuantity.toLowerCase();
    if (RegExp(r'\\bml\\b').hasMatch(netQty) || RegExp(r'\\bl\\b').hasMatch(netQty)) {
      return 'Form B (Volume/Length - Seventh Schedule)';
    } else if (RegExp(r'\\bkg\\b').hasMatch(netQty) || RegExp(r'\\bg\\b').hasMatch(netQty)) {
      return 'Form A (Weight - Seventh Schedule)';
    }
    return 'Form A (Seventh Schedule)';
  }'''

content = re.sub(r'  String _determineFormType\(\) \{.*?\n  \}', new_method, content, flags=re.DOTALL)

with open('lib/ui/screens/pdf_generation_form_screen.dart', 'w', encoding='utf-8') as f:
    f.write(content)
