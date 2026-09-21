"""Universal Packaging Detection, Barcode Decoding & Multi-Box Text Extraction.

Generalized for ANY packaging format:
  - Bottles, Jars, Cans, Boxes, Cartons, Pouches, Tubes, Sachets.
  - Adheres to global packaging standards (FSSAI, FDA, Legal Metrology, EU).

Color Palette:
  - 🟩 NEON GREEN   : Barcode (1D/2D Symbologies & Numerical Digits)
  - 🟪 VIVID MAGENTA: MRP, Price, Batch/Lot No, Mfg Date, Expiry / Best Before
  - 🟦 SKY BLUE     : Marketer, Importer, Distributor, Brand Office, Customer Care
  - 💠 CYAN / TEAL  : Manufacturer, Packer, Factory Plant & FSSAI Licenses
  - 🟧 WARM AMBER   : Nutrition Facts, Ingredients List, USP & Net Quantity
  - 🟥 CORAL RED    : Warnings, Cautions, Storage Conditions & Usage Directions
  - 🟨 GOLD / OCHRE : General Product Identity & Packaging Labels

Usage:
  python scripts/predict_yolo.py --image "path/to/any_image.jpg"
"""

import argparse
import json
from pathlib import Path
import re
import cv2
import numpy as np
import torch

_OCR_READER = None

PALETTE = {
    "BARCODE": {
        "color": (0, 255, 70),       # Vibrant Green
        "bg_color": (0, 180, 50),
        "label": "BARCODE"
    },
    "MRP_BATCH": {
        "color": (210, 50, 220),     # Vivid Magenta / Purple
        "bg_color": (160, 20, 170),
        "label": "MRP / BATCH / EXP"
    },
    "MARKETER": {
        "color": (245, 175, 40),     # Bright Sky Blue
        "bg_color": (190, 130, 20),
        "label": "MARKETED BY"
    },
    "MANUFACTURER": {
        "color": (220, 210, 0),      # Cyan / Teal
        "bg_color": (170, 160, 0),
        "label": "MANUFACTURED AT"
    },
    "NUTRITION_USP": {
        "color": (0, 165, 255),      # Warm Amber / Gold
        "bg_color": (0, 120, 200),
        "label": "NUTRITION / USP"
    },
    "WARNINGS": {
        "color": (60, 60, 235),      # Coral Red
        "bg_color": (30, 30, 180),
        "label": "WARNING / USAGE"
    },
    "GENERAL_INFO": {
        "color": (50, 200, 240),     # Soft Yellow/Ochre
        "bg_color": (30, 150, 180),
        "label": "PACKAGING INFO"
    }
}

# Universal Keyword & Regex Matchers (FSSAI, FDA, Legal Metrology)
REGEX_DATE = re.compile(r'\b(\d{1,2}[/-]\d{2,4}|\d{2,4}[/-]\d{1,2}|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{2,4})\b', re.IGNORECASE)
REGEX_PRICE = re.compile(r'(₹|rs\.?|inr|\$|€|£)\s*\d+([.,]\d{1,2})?|\b\d+([.,]\d{2})\s*(₹|rs|inr)', re.IGNORECASE)
REGEX_BATCH = re.compile(r'\b(batch|lot|b\.?no|b\.?code)\b', re.IGNORECASE)
REGEX_FSSAI = re.compile(r'\b(1\d{13}|fssai|lic\.?\s*no)\b', re.IGNORECASE)

KEYWORDS_MRP_BATCH = [
    "mrp", "price", "retail price", "taxes", "incl. of", "inclusive",
    "batch", "lot", "b.no", "bno", "bn.",
    "mfg", "mfd", "pkd", "packed", "date of", "manufacture",
    "exp", "expiry", "best before", "use by", "use before", "months from", "years from"
]

KEYWORDS_MARKETER = [
    "marketed by", "marketed & distributed", "mktd by", "marketer",
    "customer care", "consumer care", "feedback", "suggestions",
    "toll free", "helpline", "email:", "website:", "regd off", "corporate office"
]

KEYWORDS_MANUFACTURER = [
    "manufactured by", "manufactured at", "mfg by", "mfd by", "produced by",
    "packed by", "pkd by", "imported by", "factory", "plant", "unit-", "unit -",
    "industrial area", "plot no", "village", "distt", "district", "fssai lic"
]

KEYWORDS_NUTRITION_USP = [
    "nutrition", "supplement facts", "serving size", "servings per",
    "amount per", "energy", "calorie", "protein", "carbohydrate", "carb",
    "sugar", "added sugar", "fat", "saturated fat", "trans fat", "sodium",
    "cholesterol", "fiber", "vitamin", "mineral", "calcium", "iron", "creatine",
    "monohydrate", "ingredients", "composition", "other ingredients", "flavor", "flavour",
    "net qty", "net weight", "net wt", "net volume", "net content"
]

KEYWORDS_WARNINGS = [
    "warning", "caution", "not for medicinal", "medicinal use", "not recommended",
    "children", "pregnant", "lactating", "consult", "doctor", "physician",
    "keep out of reach", "store in", "cool dry place", "protect from", "shake well",
    "do not exceed", "recommended usage", "daily usage", "disclaimer", "diagnose"
]

def get_ocr_reader():
    global _OCR_READER
    if _OCR_READER is None:
        import easyocr
        use_gpu = torch.cuda.is_available()
        print(f"[+] Initializing OCR Engine (CUDA={use_gpu})...")
        _OCR_READER = easyocr.Reader(['en'], gpu=use_gpu, verbose=False)
    return _OCR_READER

def decode_barcode_digits(image_bgr, bbox=None):
    try:
        detector = cv2.barcode.BarcodeDetector()
        h, w = image_bgr.shape[:2]
        if bbox is not None:
            x1, y1, x2, y2 = bbox
            sub = image_bgr[max(0, y1-15):min(h, y2+15), max(0, x1-15):min(w, x2+15)]
            ok, info, btype, _ = detector.detectAndDecode(sub)
            if ok and info and len(info[0]) > 0:
                return info[0], btype[0]
        ok, info, btype, _ = detector.detectAndDecode(image_bgr)
        if ok and info and len(info[0]) > 0:
            return info[0], btype[0]
    except Exception:
        pass
    return None, None

def classify_universal_semantics(text: str, bbox: list, img_w: int, img_h: int) -> str:
    """Universal rule-based semantic classifier that works on ANY product packaging."""
    t = text.lower()

    # 1. Barcode text
    if any(k in t for k in ["barcode", "ean", "upc", "ivm-", "389-"]) or re.search(r'^\d{8,14}$', t):
        return "BARCODE"

    # 2. Warnings, Usage Directions & Storage (checked before dates so 'shake well before use' is categorized correctly)
    if any(k in t for k in KEYWORDS_WARNINGS) or "shak" in t or "direction" in t or "uso" in t or "use" in t:
        return "WARNINGS"

    # 3. Price / Batch / Dates (highest priority for legal compliance)
    if any(k in t for k in KEYWORDS_MRP_BATCH) or REGEX_PRICE.search(t) or REGEX_BATCH.search(t) or REGEX_DATE.search(t):
        return "MRP_BATCH"

    # 4. Marketer & Customer Care (check before general FSSAI)
    if any(k in t for k in KEYWORDS_MARKETER) or "marketed" in t or "feedback" in t or "customer care" in t:
        return "MARKETER"

    # 5. Manufacturer & Plant Sites
    if any(k in t for k in KEYWORDS_MANUFACTURER) or "manufactured" in t or REGEX_FSSAI.search(t):
        return "MANUFACTURER"

    # 6. Nutrition, Ingredients & USP
    if any(k in t for k in KEYWORDS_NUTRITION_USP):
        return "NUTRITION_USP"

    # Spatial Context Heuristic (require at least a digit or short matrix for MRP)
    cx, cy = (bbox[0] + bbox[2]) / 2.0, (bbox[1] + bbox[3]) / 2.0
    has_digit = any(c.isdigit() for c in t)
    if cy > img_h * 0.70 and cx > img_w * 0.40 and has_digit and (bbox[2] - bbox[0]) < img_w * 0.40:
        return "MRP_BATCH"
    elif cy > img_h * 0.40 and cx <= img_w * 0.45:
        return "WARNINGS"
    elif cy <= img_h * 0.40 and cx <= img_w * 0.45:
        return "NUTRITION_USP"
    elif cx > img_w * 0.45 and cy < img_h * 0.38:
        return "MARKETER"
    elif cx > img_w * 0.45:
        return "MANUFACTURER"

    return "GENERAL_INFO"

def merge_overlapping_boxes(boxes_with_data, iou_threshold=0.25):
    """Merges close / overlapping bounding boxes belonging to the same category."""
    if not boxes_with_data:
        return []

    categorized = {}
    for item in boxes_with_data:
        cat = item["category"]
        categorized.setdefault(cat, []).append(item)

    merged_results = []

    for cat, items in categorized.items():
        items.sort(key=lambda it: (it["box"][1], it["box"][0]))
        used = [False] * len(items)

        for i in range(len(items)):
            if used[i]:
                continue
            cur_box = list(items[i]["box"])
            cur_texts = [items[i]["text"]]
            cur_conf = items[i]["conf"]
            used[i] = True

            for j in range(i + 1, len(items)):
                if used[j]:
                    continue
                bx1, by1, bx2, by2 = items[j]["box"]
                cx1, cy1, cx2, cy2 = cur_box

                x_overlap = max(0, min(cx2, bx2) - max(cx1, bx1))
                y_overlap = max(0, min(cy2, by2) - max(cy1, by1))
                area_overlap = x_overlap * y_overlap
                min_area = min((cx2 - cx1) * (cy2 - cy1), (bx2 - bx1) * (by2 - by1))

                is_overlap = (area_overlap / float(min_area + 1e-5)) > iou_threshold
                is_line_adjacent = (abs(by1 - cy2) < 12 or abs(cy1 - by2) < 12) and x_overlap > 15

                if is_overlap or is_line_adjacent:
                    cur_box = [min(cx1, bx1), min(cy1, by1), max(cx2, bx2), max(cy2, by2)]
                    cur_texts.append(items[j]["text"])
                    cur_conf = max(cur_conf, items[j]["conf"])
                    used[j] = True

            merged_results.append({
                "category": cat,
                "box": cur_box,
                "text": " ".join(cur_texts),
                "conf": cur_conf
            })

    merged_results.sort(key=lambda it: (it["box"][1], it["box"][0]))
    return merged_results

def draw_pill_badge(img, text, pt, bg_color, text_color=(255, 255, 255), font_scale=0.38):
    x, y = pt
    font = cv2.FONT_HERSHEY_SIMPLEX
    (tw, th), _ = cv2.getTextSize(text, font, font_scale, 1)
    pad_x, pad_y = 5, 3

    bx1, by1 = x, max(0, y - th - pad_y * 2)
    bx2, by2 = x + tw + pad_x * 2, max(th + pad_y * 2, y)

    cv2.rectangle(img, (bx1, by1), (bx2, by2), bg_color, -1, cv2.LINE_AA)
    cv2.putText(img, text, (bx1 + pad_x, by2 - pad_y - 1), font, font_scale, text_color, 1, cv2.LINE_AA)

def draw_legend_header(img):
    h, w = img.shape[:2]
    header_h = 36
    overlay = img.copy()
    cv2.rectangle(overlay, (0, 0), (w, header_h), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.85, img, 0.15, 0, img)

    items = [
        ("Barcode", (0, 255, 70)),
        ("MRP & Batch", (210, 50, 220)),
        ("Marketer", (245, 175, 40)),
        ("Manufacturer", (220, 210, 0)),
        ("Nutrition", (0, 165, 255)),
        ("Warnings", (60, 60, 235))
    ]

    cur_x = 8
    font = cv2.FONT_HERSHEY_SIMPLEX
    for label, col in items:
        cv2.circle(img, (cur_x + 5, 18), 4, col, -1, cv2.LINE_AA)
        cv2.putText(img, label, (cur_x + 13, 22), font, 0.34, (240, 240, 240), 1, cv2.LINE_AA)
        cur_x += 13 + int(len(label) * 6.2) + 6

def process_packaging_image(
    image_path: str,
    model_path: str = "models/yolo11_packaging.pt",
    conf: float = 0.35,
    output_dir: str = "runs/predict"
):
    img_path = Path(image_path)
    if not img_path.is_file():
        print(f"[-] Image not found: {image_path}")
        return None

    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    image_bgr = cv2.imread(str(img_path))
    if image_bgr is None:
        print(f"[-] Failed to read image: {image_path}")
        return None

    h_img, w_img = image_bgr.shape[:2]
    annotated_img = image_bgr.copy()

    # 1. Barcode Detection via fine-tuned YOLO & OpenCV
    from ultralytics import YOLO
    m_path = Path(model_path)
    if not m_path.is_file():
        model_path = "yolo11n.pt"

    print(f"\n[1/4] Running YOLO barcode & packaging detection on: {img_path.name}")
    model = YOLO(model_path)
    yolo_res = model.predict(source=image_bgr, conf=conf, verbose=False)[0]

    raw_barcodes = []
    for box in yolo_res.boxes:
        score = float(box.conf[0].item())
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        # Filter out unrealistic full-frame boxes
        if (x2 - x1) < w_img * 0.65 and (y2 - y1) < h_img * 0.65:
            raw_barcodes.append({"box": [x1, y1, x2, y2], "conf": score})

    # OpenCV barcode detector fallback
    det = cv2.barcode.BarcodeDetector()
    ok, corners = det.detect(image_bgr)
    if ok and corners is not None and len(corners) > 0:
        for pts in corners:
            pts = pts.astype(int)
            bx1, by1 = int(np.min(pts[:, 0])), int(np.min(pts[:, 1]))
            bx2, by2 = int(np.max(pts[:, 0])), int(np.max(pts[:, 1]))
            if not any(abs(b["box"][0] - bx1) < 25 and abs(b["box"][1] - by1) < 25 for b in raw_barcodes):
                raw_barcodes.append({"box": [bx1, by1, bx2, by2], "conf": 0.90})

    primary_barcode_val = None
    barcode_boxes = []
    for bc in raw_barcodes:
        bx1, by1, bx2, by2 = bc["box"]
        code, ctype = decode_barcode_digits(image_bgr, (bx1, by1, bx2, by2))
        if code and not primary_barcode_val:
            primary_barcode_val = code
        barcode_boxes.append({
            "category": "BARCODE",
            "box": [bx1, by1, bx2, by2],
            "text": code or "Barcode",
            "conf": bc["conf"]
        })

    # 2. Multi-Scale Universal OCR Extraction
    print("[2/4] Running universal multi-scale OCR across packaging surface...")
    reader = get_ocr_reader()
    
    # Adaptive scaling: small images (<1200px) scaled up so 4px text becomes clear
    scale_factor = 2.5 if max(h_img, w_img) < 1200 else 1.5
    scaled = cv2.resize(image_bgr, (0, 0), fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_LANCZOS4)

    ocr_raw = reader.readtext(
        scaled,
        text_threshold=0.15,
        low_text=0.08,
        link_threshold=0.15,
        min_size=5
    )

    detected_items = []
    for polygon, text_val, text_conf in ocr_raw:
        clean_text = text_val.strip()
        if not clean_text:
            continue

        poly_arr = np.array(polygon, dtype=np.float32) / scale_factor
        gx1 = max(0, int(np.min(poly_arr[:, 0])))
        gy1 = max(0, int(np.min(poly_arr[:, 1])))
        gx2 = min(w_img, int(np.max(poly_arr[:, 0])))
        gy2 = min(h_img, int(np.max(poly_arr[:, 1])))

        # Avoid drawing text boxes over barcode bars
        in_barcode = False
        for bc in barcode_boxes:
            bx1, by1, bx2, by2 = bc["box"]
            if gx1 >= bx1-5 and gy1 >= by1-5 and gx2 <= bx2+5 and gy2 <= by2+5:
                in_barcode = True
                break
        if in_barcode:
            continue

        cat = classify_universal_semantics(clean_text, [gx1, gy1, gx2, gy2], w_img, h_img)
        detected_items.append({
            "category": cat,
            "box": [gx1, gy1, gx2, gy2],
            "text": clean_text,
            "conf": round(float(text_conf), 3)
        })

    # 3. Clean Box Merging
    print("[3/4] Merging text lines and applying color-accurate packaging annotations...")
    clean_boxes = merge_overlapping_boxes(detected_items, iou_threshold=0.25)
    all_final_boxes = barcode_boxes + clean_boxes

    # Draw Boxes on Image
    for item in all_final_boxes:
        cat = item["category"]
        color_info = PALETTE.get(cat, PALETTE["GENERAL_INFO"])
        x1, y1, x2, y2 = item["box"]
        color = color_info["color"]
        bg_color = color_info["bg_color"]
        badge_lbl = color_info["label"]

        cv2.rectangle(annotated_img, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)
        draw_pill_badge(annotated_img, badge_lbl, (x1, y1), bg_color)

    # Add Legend Header
    draw_legend_header(annotated_img)

    # 4. Save Vision-Language Crops (Qwen2-VL)
    crop_filename = out_dir / f"pdp_crop_{img_path.name}"
    cv2.imwrite(str(crop_filename), image_bgr)

    mrp_crop_y1, mrp_crop_y2 = int(h_img * 0.60), h_img
    mrp_crop_x1, mrp_crop_x2 = int(w_img * 0.35), w_img
    mrp_crop_img = image_bgr[mrp_crop_y1:mrp_crop_y2, mrp_crop_x1:mrp_crop_x2]
    mrp_crop_filename = out_dir / f"mrp_crop_{img_path.name}"
    cv2.imwrite(str(mrp_crop_filename), mrp_crop_img)

    annotated_save_path = out_dir / f"result_{img_path.name}"
    cv2.imwrite(str(annotated_save_path), annotated_img)

    # 5. Build Universal Categorized Payload for Qwen-7B
    categorized_text = {
        "BARCODES": [bc["text"] for bc in barcode_boxes],
        "MRP_BATCH_EXP_DETAILS": [it["text"] for it in clean_boxes if it["category"] == "MRP_BATCH"],
        "MARKETER_AND_FSSAI": [it["text"] for it in clean_boxes if it["category"] == "MARKETER"],
        "MANUFACTURER_DETAILS": [it["text"] for it in clean_boxes if it["category"] == "MANUFACTURER"],
        "NUTRITION_FACTS_AND_USP": [it["text"] for it in clean_boxes if it["category"] == "NUTRITION_USP"],
        "WARNINGS_AND_DIRECTIONS": [it["text"] for it in clean_boxes if it["category"] == "WARNINGS"],
        "OTHER_LABELS": [it["text"] for it in clean_boxes if it["category"] == "GENERAL_INFO"]
    }

    qwen_prompt = f"""<|im_start|>system
You are an expert packaging intelligence system specialized in regulatory compliance, FSSAI, FDA, and FMCG packaging standards.
Extract structured product metadata strictly from the provided packaging OCR text and return a valid JSON object.
<|im_end|>
<|im_start|>user
Extract all mandatory and optional packaging fields from this product packaging label.

[DETECTED BARCODE]: {primary_barcode_val or 'Inspect from image / text'}

[PACKAGING TEXT BY CATEGORY]:
• MRP, PRICE, BATCH & DATES:
  {chr(10).join('  - ' + t for t in categorized_text['MRP_BATCH_EXP_DETAILS'])}

• MARKETER & CORPORATE DETAILS:
  {chr(10).join('  - ' + t for t in categorized_text['MARKETER_AND_FSSAI'])}

• MANUFACTURER & PACKER DETAILS:
  {chr(10).join('  - ' + t for t in categorized_text['MANUFACTURER_DETAILS'])}

• NUTRITION FACTS, INGREDIENTS & USP:
  {chr(10).join('  - ' + t for t in categorized_text['NUTRITION_FACTS_AND_USP'])}

• STATUTORY WARNINGS & USAGE DIRECTIONS:
  {chr(10).join('  - ' + t for t in categorized_text['WARNINGS_AND_DIRECTIONS'])}

• GENERAL PACKAGING LABELS:
  {chr(10).join('  - ' + t for t in categorized_text['OTHER_LABELS'])}

Format your output STRICTLY as a valid JSON object adhering to this schema (fill every found field, use null if absent):
{{
  "brand_name": "string or null",
  "product_name": "string or null",
  "variant_flavor": "string or null",
  "net_quantity": "string or null (e.g. 500g, 1L, 100 tablets)",
  "serving_size": "string or null",
  "mrp_price": "string or null (e.g. Rs. 549.00)",
  "unit_sale_price_usp": "string or null",
  "manufacturing_date": "string or null (MFG date)",
  "expiry_best_before": "string or null (EXP / Best Before)",
  "batch_lot_number": "string or null",
  "ingredients_list": ["ingredient 1", "ingredient 2"],
  "nutritional_facts": {{
    "serving_size": "string or null",
    "energy_kcal": "string or null",
    "protein": "string or null",
    "carbohydrates": "string or null",
    "sugar": "string or null",
    "fat": "string or null",
    "key_active_compound": "string or null"
  }},
  "manufacturer_details": {{
    "marketed_by": "string or null",
    "manufactured_at": "string or null",
    "fssai_license": "string or null",
    "customer_care": "string or null"
  }},
  "warnings_cautions": "string or null",
  "barcode": "{primary_barcode_val or 'null'}"
}}

Output ONLY the raw JSON without markdown backticks or commentary.
<|im_end|>
<|im_start|>assistant
"""

    payload = {
        "source_image": str(img_path.resolve()),
        "annotated_image": str(annotated_save_path.resolve()),
        "pdp_crop_image": str(crop_filename.resolve()),
        "mrp_zone_crop_image": str(mrp_crop_filename.resolve()),
        "color_palette_legend": {k: v["label"] for k, v in PALETTE.items()},
        "detections_summary": {
            "total_clean_boxes": len(all_final_boxes),
            "barcode_boxes": len(barcode_boxes),
            "mrp_batch_boxes": len([b for b in clean_boxes if b["category"] == "MRP_BATCH"]),
            "marketer_boxes": len([b for b in clean_boxes if b["category"] == "MARKETER"]),
            "manufacturer_boxes": len([b for b in clean_boxes if b["category"] == "MANUFACTURER"]),
            "nutrition_boxes": len([b for b in clean_boxes if b["category"] == "NUTRITION_USP"]),
            "warnings_boxes": len([b for b in clean_boxes if b["category"] == "WARNINGS"]),
            "general_boxes": len([b for b in clean_boxes if b["category"] == "GENERAL_INFO"])
        },
        "boxes": all_final_boxes,
        "categorized_zones": categorized_text,
        "qwen_7b_prompt": qwen_prompt
    }

    json_path = out_dir / f"qwen_payload_{img_path.stem}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print("\n" + "="*70)
    print("UNIVERSAL PACKAGING ANALYSIS & COLOR ANNOTATION COMPLETE")
    print("="*70)
    print(f" 🟩 [EMERALD GREEN] Barcodes             : {len(barcode_boxes)} boxes")
    print(f" 🟪 [VIVID MAGENTA] MRP, Price & Dates   : {payload['detections_summary']['mrp_batch_boxes']} boxes")
    print(f" 🟦 [SKY BLUE]      Marketer & FSSAI     : {payload['detections_summary']['marketer_boxes']} boxes")
    print(f" 💠 [CYAN / TEAL]   Manufacturer & Plant : {payload['detections_summary']['manufacturer_boxes']} boxes")
    print(f" 🟧 [WARM AMBER]    Nutrition & USP      : {payload['detections_summary']['nutrition_boxes']} boxes")
    print(f" 🟥 [CORAL RED]     Warnings & Cautions  : {payload['detections_summary']['warnings_boxes']} boxes")
    print(f" 🟨 [OCHRE YELLOW]  General Product Info : {payload['detections_summary']['general_boxes']} boxes")
    print(f"\n[+] Saved Universal Output : {annotated_save_path.resolve()}")
    print(f"[+] Saved Qwen Payload JSON: {json_path.resolve()}")
    print("="*70)

    return payload

def main():
    parser = argparse.ArgumentParser(description="Universal Packaging Detection & Extraction Pipeline")
    parser.add_argument("--image", type=str, required=True, help="Path to packaging photo")
    parser.add_argument("--model", type=str, default="models/yolo11_packaging.pt", help="YOLO model path")
    parser.add_argument("--conf", type=float, default=0.35, help="Confidence threshold")
    parser.add_argument("--output", type=str, default="runs/predict", help="Output directory")

    args = parser.parse_args()
    process_packaging_image(args.image, args.model, args.conf, args.output)

if __name__ == "__main__":
    main()
