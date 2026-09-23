# legal_metrology_inspector

## Vision model

The app uses the Python server pipeline for YOLO packaging detection, OCR, barcode decoding, and caliper measurements. Start it from the repository root:

```bash
python3 scripts/api_server.py
```

The web build and Android emulator use the local defaults. For a physical phone, pass the computer's LAN address when building or running Flutter:

```bash
flutter run --dart-define=VISION_API_URL=http://<computer-lan-ip>:5001
```

The server-based path is intentional because the current model pipeline includes EasyOCR and post-processing in addition to YOLO; exporting only the detector to TFLite would not reproduce the complete inspection result.

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
