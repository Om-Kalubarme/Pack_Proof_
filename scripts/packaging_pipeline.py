"""End-to-End Packaging Detection & OCR Pipeline for Qwen-7B.

Features:
  1. YOLOv11 Detection: Detects Barcode & Principal Display Panel (PDP).
  2. Barcode Decoding: Decodes 1D/2D barcode digits using OpenCV BarcodeDetector.
  3. Multi-Box Text Area Detection: Draws distinct bounding boxes around every text block in the PDP.
  4. OCR Text Extraction: Extracts text, spatial coordinates, and confidence using EasyOCR.
  5. Qwen 7B Ready Payload: Formats structured prompts and JSON schema ready for Qwen2.5-7B or Qwen2-VL.

Usage:
  python scripts/packaging_pipeline.py --image path/to/packaging.jpg
"""

import argparse
import json
from pathlib import Path
import cv2
import numpy as np
import torch

# Global EasyOCR reader cache
_EASYOCR_READER = None

def get_ocr_reader():
    global _EASYOCR_READER
    if _EASYOCR_READER is None:
        import easyocr
        use_gpu = torch.cuda.is_available()
        print(f"[+] Initializing EasyOCR Reader (GPU={use_gpu})...")
        _EASYOCR_READER = easyocr.Reader(['en'], gpu=use_gpu, verbose=False)
    return _EASYOCR_READER

def decode_barcode(image_bgr, bbox=None):
    """Attempts to decode barcode digits using OpenCV BarcodeDetector."""
    try:
        detector = cv2.barcode.BarcodeDetector()
        if bbox is not None:
            x1, y1, x2, y2 = bbox
            h, w = image_bgr.shape[:2]
            # Add small margin
            pad_x = int((x2 - x1) * 0.1)
            pad_y = int((y2 - y1) * 0.1)
            crop_x1 = max(0, x1 - pad_x)
            crop_y1 = max(0, y1 - pad_y)
            crop_x2 = min(w, x2 + pad_x)
            crop_y2 = min(h, y2 + pad_y)
            sub_img = image_bgr[crop_y1:crop_y2, crop_x1:crop_x2]
            ok, decoded_info, decoded_type, _ = detector.detectAndDecode(sub_img)
            if ok and decoded_info and len(decoded_info[0]) > 0:
                return decoded_info[0], decoded_type[0]

        # Full image fallback
        ok, decoded_info, decoded_type, _ = detector.detectAndDecode(image_bgr)
        if ok and decoded_info and len(decoded_info[0]) > 0:
            return decoded_info[0], decoded_type[0]
    except Exception:
        pass
    return None, None

def generate_qwen_prompt(extracted_text: str, barcode_val: str = None) -> str:
    """Creates a ready-to-use prompt formatted for Qwen-7B (Qwen2.5-7B-Instruct / Qwen2-VL)."""
    barcode_note = f"Barcode Value: {barcode_val}" if barcode_val else "Barcode Value: Not detected / unreadable"
    prompt = f"""You are an expert AI for product packaging and regulatory compliance data extraction.
Extract all key packaging fields from the OCR text below taken from the Principal Display Panel (PDP).

{barcode_note}

Raw OCR Text from PDP Area:
\"\"\"
{extracted_text}
\"\"\"

Task:
Analyze the text and output a strictly valid JSON object with the following fields (use null if not found):
{{
  "brand_name": "Brand or manufacturer trademark",
  "product_name": "Full product title and variant",
  "net_quantity": "Weight, volume, or count (e.g. 500g, 1L, 10 pcs)",
  "mrp_price": "Maximum Retail Price / Currency",
  "manufacturing_date": "MFG date if present",
  "expiry_date": "Expiry / Best Before date if present",
  "batch_lot_no": "Batch or Lot number",
  "ingredients": ["list of ingredients if found"],
  "nutritional_info": {{
    "serving_size": "serving size if stated",
    "energy_kcal": "calories / energy",
    "protein": "protein per serving or 100g",
    "total_fat": "fat content",
    "carbohydrates": "carbs content",
    "sugar": "sugar content",
    "sodium": "sodium content"
  }},
  "manufacturer_details": "Name and address of manufacturer or importer",
  "fssai_or_reg_license": "FSSAI or license number",
  "barcode": "{barcode_val or 'null'}"
}}

Output ONLY the JSON object, with no conversational preamble or markdown backticks."""
    return prompt

def process_packaging_image(
    image_path: str,
    model_path: str = "models/yolo11_packaging.pt",
    conf: float = 0.4,
    output_dir: str = "runs/predict"
):
    img_path = Path(image_path)
    if not img_path.is_file():
        print(f"[-] Image not found: {image_path}")
        return None

    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Load Image
    image_bgr = cv2.imread(str(img_path))
    if image_bgr is None:
        print(f"[-] Failed to read image: {image_path}")
        return None
    h_img, w_img = image_bgr.shape[:2]
    annotated_img = image_bgr.copy()

    # 2. YOLO Detection for Barcode & PDP
    from ultralytics import YOLO
    print(f"\n[1/4] Running YOLOv11 packaging detection on {img_path.name}...")
    model = YOLO(model_path)
    yolo_results = model.predict(source=image_bgr, conf=conf, verbose=False)[0]

    barcodes = []
    pdp_panels = []

    for box in yolo_results.boxes:
        cls_id = int(box.cls[0].item())
        cls_name = model.names.get(cls_id, f"class_{cls_id}").lower()
        score = float(box.conf[0].item())
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

        if "barcode" in cls_name:
            barcodes.append({"box": [x1, y1, x2, y2], "conf": score})
        elif "pdp" in cls_name or "panel" in cls_name:
            pdp_panels.append({"box": [x1, y1, x2, y2], "conf": score})

    # Sort PDP panels by area (largest first)
    pdp_panels.sort(key=lambda p: (p["box"][2] - p["box"][0]) * (p["box"][3] - p["box"][1]), reverse=True)

    # 3. Barcode Decoding & Visual Annotation
    print(f"[2/4] Processing barcodes ({len(barcodes)} detected)...")
    decoded_barcode_value = None
    for i, bc in enumerate(barcodes):
        x1, y1, x2, y2 = bc["box"]
        code, code_type = decode_barcode(image_bgr, (x1, y1, x2, y2))
        if code and not decoded_barcode_value:
            decoded_barcode_value = code
        bc["decoded_val"] = code
        bc["type"] = code_type

        # Draw Neon Green Box for Barcode
        cv2.rectangle(annotated_img, (x1, y1), (x2, y2), (0, 255, 0), 3)
        label = f"BARCODE ({bc['conf']:.2f})"
        if code:
            label += f" [{code}]"
        
        (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
        cv2.rectangle(annotated_img, (x1, max(0, y1 - lh - 8)), (x1 + lw + 6, max(0, y1)), (0, 255, 0), -1)
        cv2.putText(annotated_img, label, (x1 + 3, max(0, y1 - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 2)

    # 4. PDP Panel Region Extraction
    if pdp_panels:
        pdp_box = pdp_panels[0]["box"]
        pdp_x1, pdp_y1, pdp_x2, pdp_y2 = pdp_box
        print(f"[3/4] PDP Area located at ({pdp_x1}, {pdp_y1}, {pdp_x2}, {pdp_y2})")
    else:
        # Fallback to entire packaging image if no distinct PDP box detected
        print("[!] No distinct PDP panel box found by YOLO. Using full packaging area.")
        pdp_box = [0, 0, w_img, h_img]
        pdp_x1, pdp_y1, pdp_x2, pdp_y2 = pdp_box

    # Draw Cyan / Electric Blue Box for PDP Area
    cv2.rectangle(annotated_img, (pdp_x1, pdp_y1), (pdp_x2, pdp_y2), (255, 200, 0), 3)
    pdp_label = f"PDP PANEL ({pdp_panels[0]['conf']:.2f})" if pdp_panels else "PACKAGING REGION"
    (pw, ph), _ = cv2.getTextSize(pdp_label, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
    cv2.rectangle(annotated_img, (pdp_x1, max(0, pdp_y1 - ph - 8)), (pdp_x1 + pw + 6, max(0, pdp_y1)), (255, 200, 0), -1)
    cv2.putText(annotated_img, pdp_label, (pdp_x1 + 3, max(0, pdp_y1 - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 0, 0), 2)

    # Save cropped PDP image
    pdp_crop = image_bgr[pdp_y1:pdp_y2, pdp_x1:pdp_x2]
    pdp_crop_path = out_dir / f"pdp_crop_{img_path.name}"
    cv2.imwrite(str(pdp_crop_path), pdp_crop)

    # 5. Multi-Box Text Area Detection & OCR Extraction
    print("[4/4] Detecting multiple text areas & performing OCR...")
    reader = get_ocr_reader()
    ocr_results = reader.readtext(pdp_crop)

    text_blocks = []
    full_text_lines = []

    # Sort text blocks by reading order (top-to-bottom, left-to-right)
    # Each item: (polygon, text, confidence)
    ocr_results.sort(key=lambda item: (item[0][0][1], item[0][0][0]))

    for idx, (polygon, text, conf_score) in enumerate(ocr_results):
        text_clean = text.strip()
        if not text_clean or conf_score < 0.2:
            continue

        # Polygon points relative to PDP crop
        poly_pts = np.array(polygon, dtype=np.int32)
        tx1 = int(np.min(poly_pts[:, 0]))
        ty1 = int(np.min(poly_pts[:, 1]))
        tx2 = int(np.max(poly_pts[:, 0]))
        ty2 = int(np.max(poly_pts[:, 1]))

        # Translate coordinates back to full image
        global_tx1 = pdp_x1 + tx1
        global_ty1 = pdp_y1 + ty1
        global_tx2 = pdp_x1 + tx2
        global_ty2 = pdp_y1 + ty2

        text_blocks.append({
            "id": idx + 1,
            "text": text_clean,
            "confidence": round(float(conf_score), 3),
            "bbox_global": [global_tx1, global_ty1, global_tx2, global_ty2],
            "bbox_pdp_crop": [tx1, ty1, tx2, ty2]
        })
        full_text_lines.append(text_clean)

        # Draw Orange/Amber bounding boxes around each text block
        cv2.rectangle(annotated_img, (global_tx1, global_ty1), (global_tx2, global_ty2), (0, 140, 255), 2)
        tag = f"T{idx+1}"
        cv2.putText(annotated_img, tag, (global_tx1, max(12, global_ty1 - 3)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 140, 255), 1)

    # Save full annotated image
    annotated_path = out_dir / f"annotated_{img_path.name}"
    cv2.imwrite(str(annotated_path), annotated_img)

    raw_combined_text = "\n".join(full_text_lines)
    qwen_prompt = generate_qwen_prompt(raw_combined_text, decoded_barcode_value)

    # 6. Save Structured Output JSON
    payload = {
        "source_image": str(img_path.resolve()),
        "annotated_image": str(annotated_path.resolve()),
        "pdp_crop_image": str(pdp_crop_path.resolve()),
        "summary": {
            "barcodes_detected": len(barcodes),
            "barcode_decoded": decoded_barcode_value,
            "pdp_panel_detected": len(pdp_panels) > 0,
            "text_blocks_count": len(text_blocks)
        },
        "barcode_details": barcodes,
        "pdp_panel_box": pdp_box,
        "text_blocks": text_blocks,
        "extracted_ocr_text": raw_combined_text,
        "qwen_7b_prompt": qwen_prompt
    }

    json_path = out_dir / f"qwen_payload_{img_path.stem}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print("\n" + "="*60)
    print("PACKAGING ANALYSIS & OCR COMPLETE")
    print("="*60)
    print(f"[+] Barcodes Detected   : {len(barcodes)} (Decoded: {decoded_barcode_value or 'N/A'})")
    print(f"[+] PDP Panel Area      : ({pdp_x1}, {pdp_y1}, {pdp_x2}, {pdp_y2})")
    print(f"[+] Text Blocks Found   : {len(text_blocks)} distinct text areas")
    print(f"[+] Annotated Image     : {annotated_path.resolve()}")
    print(f"[+] High-Res PDP Crop   : {pdp_crop_path.resolve()}")
    print(f"[+] Qwen Payload JSON   : {json_path.resolve()}")
    print("="*60)

    # Sample of extracted text
    print("\n[Preview of Extracted Text]:")
    for b in text_blocks[:8]:
        print(f"  - [{b['id']:02d}] {b['text']} (conf: {b['confidence']})")
    if len(text_blocks) > 8:
        print(f"  ... and {len(text_blocks) - 8} more text blocks.")

    return payload

def main():
    parser = argparse.ArgumentParser(description="Packaging Barcode & PDP Multi-Box Text Extraction for Qwen 7B")
    parser.add_argument("--image", type=str, required=True, help="Path to input packaging photo")
    parser.add_argument("--model", type=str, default="models/yolo11_packaging.pt", help="Path to fine-tuned YOLO model")
    parser.add_argument("--conf", type=float, default=0.35, help="YOLO confidence threshold")
    parser.add_argument("--output", type=str, default="runs/predict", help="Output directory")

    args = parser.parse_args()
    process_packaging_image(args.image, args.model, args.conf, args.output)

if __name__ == "__main__":
    main()
