# Digital Vernier Caliper (Optical Font Caliper Engine)

The **Digital Vernier Caliper** (also known as the **Optical Font Caliper Engine**) is the core computer vision component of our mobile inspection system. It replaces physical Vernier calipers used by Legal Metrology Officers during field raids, eliminating manual measurement errors and instantly verifying statutory **Table-I font height and geometry rules** under the Legal Metrology (Packaged Commodities) Rules, 2011.

## 🧰 1. Required Tools, Libraries & Technology Stack

To build the Digital Vernier Caliper across Android and iOS platforms, you need the following specialized frameworks:

| Component | Recommended Tool / Library | Key Function |
| :--- | :--- | :--- |
| **AR Spatial Depth Sensing** | **ARKit** (iOS) / **ARCore Depth API** (Android) | Measures the exact physical camera-to-label distance ($Z_{\text{mm}}$) using LiDAR or Depth-from-Motion. |
| **Container Surface Bounding** | **YOLOv11-OBB** (Oriented Bounding Box) | Detects package boundaries and calculates Principal Display Panel surface area ($A_{\text{PDP}}$). |
| **OCR & Glyph Bounding** | **Apple Vision Framework** (`VNRecognizeTextRequest`) (iOS)<br>**PaddleOCR v4 Lite** / **Google ML Kit** (Android) | Extracts individual character bounding box coordinates and pixel heights ($H_{\text{pixel}}$) on the neural hardware engine. |
| **Computer Vision & Unwarping** | **OpenCV C++ / Python** | Performs **CLAHE** glare reduction, perspective homography, and cylindrical unrolling on curved bottles/cans. |
| **Hardware Bridge** | **Flutter JSI** / **React Native TurboModules** | Passes camera frame arrays between background native threads at 60 FPS without UI stutter. |

## 📐 2. The Optical Caliper Transformation Formula

The engine converts raw image pixel heights ($H_{\text{pixel}}$) into exact physical millimeters ($H_{\text{mm}}$) using a **Pinhole Camera Optical Transformation Model**:

$$H_{\text{mm}} = \frac{H_{\text{pixel}} \times Z_{\text{mm}}}{f_y}$$

Where:
* $H_{\text{pixel}}$ = Bounding box pixel height extracted by the OCR engine.
* $Z_{\text{mm}}$ = Spatial depth distance from camera lens to label surface (from ARKit/ARCore).
* $f_y$ = Vertical focal length in pixels (read directly from the device's intrinsic camera matrix $K$).

### Physical Invariant Calibration Anchor (Barcode Scaling)
To eliminate camera depth sensor drift on reflective plastic or glass, the system cross-checks depth against the product's **EAN-13 barcode**:
$$\text{Scale Factor (px/mm)} = \frac{W_{\text{barcode\_px}}}{37.29\text{ mm}}$$
*(Standard EAN-13 physical barcode width is an international constant of $37.29\text{ mm}$)*.

## 📊 3. Table-I Statutory Rule Matrix

Once $H_{\text{mm}}$ is computed, the engine validates it against statutory **Table-I minimum height thresholds** based on calculated PDP surface area ($A_{\text{PDP}}$):

| PDP Surface Area ($A_{\text{PDP}}$) | Standard Printed Text | Molded / Blown / Embossed Text | Rule Check Logic |
| :--- | :--- | :--- | :--- |
| **$A < 50\text{ cm}^2$** | $\ge 1.0\text{ mm}$ | $\ge 1.5\text{ mm}$ | If $H_{\text{mm}} < 1.0\text{ mm} \rightarrow$ **FAIL** |
| **$50 \le A < 100\text{ cm}^2$** | $\ge 1.5\text{ mm}$ | $\ge 3.0\text{ mm}$ | If $H_{\text{mm}} < 1.5\text{ mm} \rightarrow$ **FAIL** |
| **$100 \le A < 500\text{ cm}^2$** | $\ge 2.5\text{ mm}$ | $\ge 4.0\text{ mm}$ | If $H_{\text{mm}} < 2.5\text{ mm} \rightarrow$ **FAIL** |
| **$500 \le A < 2500\text{ cm}^2$** | $\ge 4.0\text{ mm}$ | $\ge 6.0\text{ mm}$ | If $H_{\text{mm}} < 4.0\text{ mm} \rightarrow$ **FAIL** |
| **$A \ge 2500\text{ cm}^2$** | $\ge 6.0\text{ mm}$ | $\ge 6.0\text{ mm}$ | If $H_{\text{mm}} < 6.0\text{ mm} \rightarrow$ **FAIL** |

### Additional Geometry Checks:
1. **Width-to-Height Ratio**: Character width must be $\ge \frac{1}{3} H_{\text{mm}}$ (except for numerals `'1'` and letters `'i'`, `'I'`, `'l'`).
2. **Spatial Clearance Buffer**: Free space around Net Quantity declarations must be $\ge 1 \times H_{\text{mm}}$ above/below and $\ge 2 \times H_{\text{mm}}$ left/right.

## 🔄 4. Developer Implementation Protocol (6 Pipeline Phases)

1. **Pose Lock & Frame Capture**: Enforce camera stability (shake threshold $< 0.05g$) and perpendicular angle ($\text{tilt} < \pm 5^\circ$) before locking exposure.
2. **OpenCV Preprocessing**: Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) and unroll cylindrical labels using homography matrices.
3. **Glyph Extraction**: Run PP-OCRv4 / Apple Vision to locate text bounding boxes.
4. **Distance Conversion**: Compute $H_{\text{mm}}$ using AR depth readings ($Z_{\text{mm}}$) and focal length.
5. **Rule Verification**: Pass $H_{\text{mm}}$ to the statutory rule engine alongside PDP surface area ($A_{\text{PDP}}$).
6. **Live AR Rendering**: Render real-time color-coded HUD overlays on the camera preview:
   * 🟩 **Green Box**: `Net Qty: 2.8mm | PASS (Min Required: 2.5mm)`
   * 🟥 **Red Box**: `MRP Font: 1.2mm | FAIL (Min Required: 1.5mm)`

## 🛡️ 5. Handling Edge Cases & Accuracy Locks

* **Hand Tremors**: Apply an **Exponential Moving Average (EMA)** filter across a rolling 15-frame buffer to smooth measurement fluctuations.
* **Surface Reflection**: Bilateral filtering and overexposure mask inpainting prevent glare from distorting character edges.
* **Determinism**: Lock greedy decoding (`temperature = 0.0`) and fixed interpolation algorithms to ensure 100% reproducible results on repeated scans.

## 📏 6. Principal Display Panel (PDP) Surface Area Calculation

Under Rule 7(4) of the Legal Metrology (Packaged Commodities) Rules, 2011 (as amended by G.S.R. 629(E)), the Principal Display Panel (PDP) Surface Area ($A_{\text{PDP}}$) calculation specifically excludes the top, bottom, top/bottom flanges of cans, and the neck/shoulders of bottles or jars.

The statutory geometry formulas depend on the 3D container shape:

| Container Geometry | Statutory Exclusions | Legal Metrology Surface Area Formula |
| :--- | :--- | :--- |
| **Rectangular / Box** | Top & Bottom caps/flaps | $A_{\text{PDP}} = \text{Height} \times \text{Width}$ (Product of height and width of the main display side) |
| **Cylindrical / Bottle** | Neck, shoulder, top/bottom rims/flanges | $A_{\text{PDP}} = 0.40 \times (\text{Height} \times \text{Circumference})$ |
| **Irregular / Pouch** | Crimped seals, top/bottom seams | $A_{\text{PDP}} = 0.40 \times A_{\text{total}}$ (40% of total outer package surface area) |

**How the Computer Vision & AR Engine Computes PDP Surface Area:**
1. **YOLOv11 Bounding & AR Mesh Capture**: The camera estimates the physical height ($H$), width ($W$), diameter ($d$), or circumference ($C = \pi \cdot d$) in centimeters using spatial depth odometry (ARCore/ARKit).
2. **Formula Execution**: The measured parameters are passed into the statutory shape engine to compute $A_{\text{PDP}}$ in $\text{cm}^2$.
3. **Threshold Lookup (Table-I)**: The resulting $A_{\text{PDP}}$ determines the minimum statutory font height threshold for the digital optical caliper.

---

## Running the integrated Flutter + AI scan

The Flutter app sends an image or camera video to the local API at
`http://127.0.0.1:5001/api/inspect` (Android emulator: `10.0.2.2:5001`). The
backend runs the supplied YOLO model, EasyOCR, barcode scaling, and Qwen
extraction. Video scans select up to eight distinct sharp frames, OCR every
selected frame, deduplicate the text, and give Qwen-VL the best six raw frames
along with the OCR evidence.

```bash
cd /Users/om_k/Downloads/ML_Project
python3 -m pip install -r requirements.txt

# One-time local Qwen vision setup. Keep Ollama running afterwards.
ollama pull qwen2.5vl:7b
ollama serve

# In a second terminal
python3 scripts/api_server.py

# In a third terminal
cd frontend
flutter pub get
flutter run
```

For a physical Android device, pass the development computer's LAN address:

```bash
flutter run --dart-define=VISION_API_URL=http://192.168.x.x:5001
```

The API still returns YOLO/OCR data when Qwen is offline; the response reports
`qwen.status: unavailable` rather than failing the scan. A physical font-size
result is reported only with barcode scaling or with both `distance_mm` and
`focal_length_px`, so an uncalibrated photo is never presented as a legal
millimetre measurement.
