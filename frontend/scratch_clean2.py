# 1. capture_screen.dart
path = 'lib/ui/screens/capture_screen.dart'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("  String _shapeResult = '';\n", "")
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. pdf_generation_form_screen.dart
path = 'lib/ui/screens/pdf_generation_form_screen.dart'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("import '../../data/services/mock_inspection_service.dart';\n", "")
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
