import re
with open('lib/ui/screens/form_selection_screen.dart', 'r', encoding='utf-8') as f:
    content = f.read()

new_init_state = '''  @override
  void initState() {
    super.initState();
    final netQty = widget.report.productDetails.declaredNetQuantity.toLowerCase();
    
    if (RegExp(r'\\bml\\b').hasMatch(netQty)) {
      _selectedForm = 'Form B';
      _autoSelectedUnit = 'ml';
    } else if (RegExp(r'\\bl\\b').hasMatch(netQty)) {
      _selectedForm = 'Form B';
      _autoSelectedUnit = 'l';
    } else if (RegExp(r'\\bkg\\b').hasMatch(netQty)) {
      _selectedForm = 'Form A';
      _autoSelectedUnit = 'kg';
    } else if (RegExp(r'\\bg\\b').hasMatch(netQty)) {
      _selectedForm = 'Form A';
      _autoSelectedUnit = 'g';
    }
  }'''

content = re.sub(r'  @override\n  void initState\(\) \{.*?\n  \}', new_init_state, content, flags=re.DOTALL)

# Now fix the hint text
content = content.replace("'*(Auto-selected based on commodity unit: )*'", "'*(Auto-selected based on commodity unit: $_autoSelectedUnit)*'")

with open('lib/ui/screens/form_selection_screen.dart', 'w', encoding='utf-8') as f:
    f.write(content)
