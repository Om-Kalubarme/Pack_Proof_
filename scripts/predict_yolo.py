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
import sys
import random
import os

def enforce_strict_determinism(seed=42):
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
    
    # Force ONNX Runtime / Math single-threaded execution
    os.environ["OMP_NUM_THREADS"] = "1"
    os.environ["MKL_NUM_THREADS"] = "1"

enforce_strict_determinism(42)

sys.path.append(str(Path(__file__).parent.parent))
try:
    from Inhance_image.enhancer import PackagingEnhancer
except ImportError:
    print("[-] Warning: Inhance_image.enhancer not found. Enhancer will be disabled.")
    PackagingEnhancer = None

_OCR_READER = None

PALETTE = {
    "BARCODE": {
        "color": (255, 255, 255),       # White (distinct from Veg Green)
        "bg_color": (150, 150, 150),
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
    "toll free", "helpline", "email:", "website:", "regd off", "corporate office",
    "pepsico", "trademark", "visit ", "partnership", "www.", "pvt", "ltd", "holdings"
]

KEYWORDS_MANUFACTURER = [
    "manufactured by", "manufactured at", "mfg by", "mfd by", "produced by",
    "packed by", "pkd by", "imported by", "factory", "plant", "unit-", "unit -",
    "industrial area", "plot no", "village", "distt", "district", "fssai lic"
]

KEYWORDS_NUTRITION_USP = [
    "nutrition", "nutritional", "supplement facts", "serving size", "servings per",
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

def detect_dietary_logo(image_bgr):
    """Detect Indian Veg/Non-Veg Logo using OpenCV color & shape analysis."""
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    
    # Veg Logo (Green)
    lower_green = np.array([35, 50, 50])
    upper_green = np.array([85, 255, 255])
    mask_green = cv2.inRange(hsv, lower_green, upper_green)
    
    # Non-Veg Logo (Red/Brown)
    lower_red1 = np.array([0, 50, 50])
    upper_red1 = np.array([20, 255, 255])
    lower_red2 = np.array([160, 50, 50])
    upper_red2 = np.array([180, 255, 255])
    mask_nonveg = cv2.bitwise_or(cv2.inRange(hsv, lower_red1, upper_red1), cv2.inRange(hsv, lower_red2, upper_red2))
    
    def find_logo(mask, label):
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        contours, hierarchy = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        if hierarchy is None:
            return None
            
        for i, cnt in enumerate(contours):
            area = cv2.contourArea(cnt)
            if 400 < area < 25000:
                x, y, w, h = cv2.boundingRect(cnt)
                aspect_ratio = float(w)/h
                
                # Check for square shape AND has a child contour (the inner dot)
                has_child = hierarchy[0][i][2] != -1
                if 0.85 <= aspect_ratio <= 1.15 and has_child:
                    # Double check the child is roughly a circle (solid area)
                    child_idx = hierarchy[0][i][2]
                    child_area = cv2.contourArea(contours[child_idx])
                    if child_area > area * 0.1: # Dot should be at least 10% of the box
                        return {"type": label, "box": [x, y, x+w, y+h]}
        return None

    veg = find_logo(mask_green, "VEG")
    if veg: return veg
    
    nonveg = find_logo(mask_nonveg, "NON_VEG")
    if nonveg: return nonveg
    
    return None

def classify_universal_semantics(text: str, bbox: list, img_w: int, img_h: int) -> str:
    """Universal rule-based semantic classifier that works on ANY product packaging."""
    t = text.lower()

    # 1. Barcode explicitly stated or purely digits (EAN/UPC-like, ignoring spaces/quotes)
    t_digits = re.sub(r'\D', '', t)
    clean_t = t.replace(" ", "").replace('"', '').replace("'", "")
    if any(k in t for k in ["barcode", "ean", "upc", "ivm-", "389-"]) or (
        8 <= len(t_digits) <= 14 and len(t_digits) >= len(clean_t) - 2):
        return "BARCODE"

    # 2. Warnings, Usage Directions & Storage
    if any(k in t for k in KEYWORDS_WARNINGS) or "shak" in t or "direction" in t or re.search(r'\buse\b', t) or re.search(r'\buso\b', t):
        return "WARNINGS"

    # 3. Price / Batch / Dates (highest priority for legal compliance)
    if any(k in t for k in KEYWORDS_MRP_BATCH) or REGEX_PRICE.search(t) or REGEX_BATCH.search(t) or REGEX_DATE.search(t):
        return "MRP_BATCH"

    # 4. Marketer & Customer Care
    if any(k in t for k in KEYWORDS_MARKETER) or "marketed" in t or "feedback" in t or "customer care" in t:
        return "MARKETER"

    # 5. Manufacturer & Plant Sites
    if any(k in t for k in KEYWORDS_MANUFACTURER) or "manufactured" in t or REGEX_FSSAI.search(t):
        return "MANUFACTURER"

    # 6. Nutrition, Ingredients & USP
    if any(k in t for k in KEYWORDS_NUTRITION_USP) or "nutri" in t or "wnforhauon" in t:
        return "NUTRITION_USP"

    # Removed arbitrary spatial context heuristics!
    return "GENERAL_INFO"

def merge_overlapping_boxes(boxes_with_data, iou_threshold=0.35):
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
                is_line_adjacent = (abs(by1 - cy2) < 6 or abs(cy1 - by2) < 6) and x_overlap > 25

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
    conf: float = 0.20,
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

    # Shrink massive phone images to speed up OCR and LLM processing
    MAX_DIM = 1536
    h_init, w_init = image_bgr.shape[:2]
    if max(h_init, w_init) > MAX_DIM:
        scale = MAX_DIM / max(h_init, w_init)
        image_bgr = cv2.resize(image_bgr, (int(w_init * scale), int(h_init * scale)), interpolation=cv2.INTER_AREA)

    # 0. Enhance Full Image First
    if PackagingEnhancer:
        print("[+] Enhancing full image before YOLO and OCR...")
        h_orig, w_orig = image_bgr.shape[:2]
        if max(h_orig, w_orig) <= 1280:
            target_scale = 3.0
            print(f"[*] Low resolution detected ({w_orig}x{h_orig}). Applying {target_scale}x Lanczos-4 upscaling for fine print...")
        else:
            target_scale = 1.0
            
        enhancer = PackagingEnhancer(target_dpi_scale=target_scale)
        enhanced_image_bgr = enhancer.process(image_bgr)
    else:
        enhanced_image_bgr = image_bgr

    h_img, w_img = enhanced_image_bgr.shape[:2]
    annotated_img = enhanced_image_bgr.copy()

    # 1. Barcode Detection via fine-tuned YOLO & OpenCV
    from ultralytics import YOLO
    m_path = Path(model_path)
    if not m_path.is_file():
        model_path = "yolo11n.pt"

    print(f"\n[1/4] Running YOLO barcode & packaging detection on: {img_path.name}")
    model = YOLO(model_path)
    yolo_res = model.predict(source=enhanced_image_bgr, conf=conf, verbose=False)[0]

    raw_barcodes = []
    pdp_panels = []
    for box in yolo_res.boxes:
        cls_id = int(box.cls[0].item())
        cls_name = model.names.get(cls_id, f"class_{cls_id}").lower()
        score = float(box.conf[0].item())
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        
        if "barcode" in cls_name:
            if (x2 - x1) < w_img * 0.65 and (y2 - y1) < h_img * 0.65:
                raw_barcodes.append({"box": [x1, y1, x2, y2], "conf": score})
        elif "pdp" in cls_name or "panel" in cls_name:
            if (x2 - x1) > (w_img * 0.1) and (y2 - y1) > (h_img * 0.1):
                pdp_panels.append({"box": [x1, y1, x2, y2], "conf": score})
            
    # Sort PDP panels by area (largest first)
    pdp_panels.sort(key=lambda p: (p["box"][2] - p["box"][0]) * (p["box"][3] - p["box"][1]), reverse=True)

    # OpenCV barcode detector fallback
    det = cv2.barcode.BarcodeDetector()
    ok, corners = det.detect(enhanced_image_bgr)
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
        code, ctype = decode_barcode_digits(enhanced_image_bgr, (bx1, by1, bx2, by2))
        if code and not primary_barcode_val:
            primary_barcode_val = code
        barcode_boxes.append({
            "category": "BARCODE",
            "box": [bx1, by1, bx2, by2],
            "text": code or "Barcode",
            "conf": bc["conf"]
        })

    # Global Fallback if YOLO & Corner Detection failed entirely
    if not barcode_boxes:
        code, ctype = decode_barcode_digits(enhanced_image_bgr)
        if code:
            h, w = enhanced_image_bgr.shape[:2]
            primary_barcode_val = code
            barcode_boxes.append({
                "category": "BARCODE",
                "box": [10, h - 200, 300, h - 10], # Synthetic box for visualization
                "text": str(code),
                "conf": 1.0
            })

    # 1.5 Extract PDP Crop Regions
    total_pdp_area = sum((p["box"][2] - p["box"][0]) * (p["box"][3] - p["box"][1]) for p in pdp_panels) if pdp_panels else 0
    img_area = w_img * h_img
    
    if pdp_panels and total_pdp_area > img_area * 0.25:
        panels_to_process = pdp_panels
    else:
        print("[!] YOLO PDP panels are missing or too small. Using full packaging area for OCR fallback.")
        panels_to_process = [{"box": [0, 0, w_img, h_img], "conf": 1.0, "is_fallback": True}]

    print("[2/4] Running universal multi-scale OCR across packaging surface...")
    reader = get_ocr_reader()
    detected_items = []
    first_pdp_crop = None

    for idx, panel in enumerate(panels_to_process):
        pdp_x1, pdp_y1, pdp_x2, pdp_y2 = panel["box"]
        is_fallback = panel.get("is_fallback", False)
        
        if not is_fallback:
            print(f"[*] Processing PDP Area {idx+1}/{len(panels_to_process)} located at ({pdp_x1}, {pdp_y1}, {pdp_x2}, {pdp_y2})")

        # Draw Cyan / Electric Blue Box for PDP Area
        cv2.rectangle(annotated_img, (pdp_x1, pdp_y1), (pdp_x2, pdp_y2), (255, 200, 0), 3)
        pdp_label = f"PDP PANEL ({panel['conf']:.2f})" if not is_fallback else "PACKAGING REGION"
        (pw, ph), _ = cv2.getTextSize(pdp_label, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
        cv2.rectangle(annotated_img, (pdp_x1, max(0, pdp_y1 - ph - 8)), (pdp_x1 + pw + 6, max(0, pdp_y1)), (255, 200, 0), -1)
        cv2.putText(annotated_img, pdp_label, (pdp_x1 + 3, max(0, pdp_y1 - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 0, 0), 2)

        pdp_crop = enhanced_image_bgr[pdp_y1:pdp_y2, pdp_x1:pdp_x2]
        if idx == 0:
            first_pdp_crop = pdp_crop.copy()
            
        crop_h, crop_w = pdp_crop.shape[:2]
        if crop_h == 0 or crop_w == 0:
            continue
            
        # Avoid double-scaling: PackagingEnhancer already handles upscaling if needed.
        # Excessive scaling makes text too large/soft for EasyOCR's CNN.
        scale_factor = 1.0
        scaled = cv2.resize(pdp_crop, (0, 0), fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_LANCZOS4) if scale_factor != 1.0 else pdp_crop

        ocr_raw = reader.readtext(
            scaled,
            text_threshold=0.45,
            low_text=0.35,
            link_threshold=0.30,
            min_size=15
        )

        for polygon, text_val, text_conf in ocr_raw:
            clean_text = text_val.strip()
            if not clean_text:
                continue

            poly_arr = np.array(polygon, dtype=np.float32) / scale_factor
            
            # Local coordinates in crop
            lx1 = max(0, int(np.min(poly_arr[:, 0])))
            ly1 = max(0, int(np.min(poly_arr[:, 1])))
            lx2 = min(crop_w, int(np.max(poly_arr[:, 0])))
            ly2 = min(crop_h, int(np.max(poly_arr[:, 1])))
            
            # Global coordinates mapped back to full image
            gx1 = pdp_x1 + lx1
            gy1 = pdp_y1 + ly1
            gx2 = pdp_x1 + lx2
            gy2 = pdp_y1 + ly2

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
    if first_pdp_crop is not None:
        cv2.imwrite(str(crop_filename), first_pdp_crop)

    mrp_crop_y1, mrp_crop_y2 = int(h_img * 0.60), h_img
    mrp_crop_x1, mrp_crop_x2 = int(w_img * 0.35), w_img
    mrp_crop_img = enhanced_image_bgr[mrp_crop_y1:mrp_crop_y2, mrp_crop_x1:mrp_crop_x2]
    mrp_crop_filename = out_dir / f"mrp_crop_{img_path.name}"
    cv2.imwrite(str(mrp_crop_filename), mrp_crop_img)

    logo_info = detect_dietary_logo(enhanced_image_bgr)
    if logo_info:
        lx1, ly1, lx2, ly2 = logo_info["box"]
        # Use Forest Green (34, 139, 34) in BGR -> (34, 139, 34) so it doesn't clash with Barcode (0, 255, 0)
        l_color = (34, 139, 34) if logo_info["type"] == "VEG" else (0, 0, 255)
        cv2.rectangle(annotated_img, (lx1, ly1), (lx2, ly2), l_color, 4)
        cv2.putText(annotated_img, logo_info["type"] + " LOGO", (lx1, max(0, ly1-10)), cv2.FONT_HERSHEY_SIMPLEX, 0.9, l_color, 3)

    enhanced_save_path = out_dir / f"enhanced_{img_path.name}"
    cv2.imwrite(str(enhanced_save_path), enhanced_image_bgr)

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

    qwen_prompt = f"""# Role: Strict Packet Scanner & Declaration Generator

You are a high-accuracy packet/packaging analysis model. Your primary responsibility is to inspect the provided packet/package image and extract every visible and relevant detail accurately.

## 1. Scan Everything Before Responding
Systematically inspect the entire packet. Scan specifically for small, partially hidden, or easily overlooked details.

## 2. Accuracy Rules
1. Never guess or invent information.
2. Do not fill missing information using assumptions or general product knowledge.
3. Preserve the text exactly where practical.
4. Distinguish clearly between visible and unreadable.
5. If an image is blurry or too low-resolution to verify a detail, explicitly mark that detail as "Unable to verify from image" in the `unable_to_verify` array.
6. Never infer a declaration merely because it is common for similar products.
7. If two visible pieces of information conflict, report the conflict in the `ambiguous_details` array.

## 3. Do Not Hallucinate
The following are prohibited: Inventing missing text, Guessing obscured characters, Assuming ingredients/allergens/certifications/values.

## 4. Required Output Format
You MUST output ONLY a valid JSON object. Do not output markdown text outside the JSON. Use the following schema:
{{
  "brand_name": "string or null",
  "product_name": "string or null",
  "net_quantity": "string or null",
  "mrp_price": "string or null (e.g. 'Rs 50 incl. of all taxes'. MUST include any tax text if present)",
  "manufacturing_date": "string or null",
  "expiry_best_before": "string or null",
  "batch_lot_number": "string or null",
  "ingredients_list": ["ingredient 1", "ingredient 2"],
  "nutritional_facts": {{
    "serving_size": "string or null",
    "energy_kcal": "string or null",
    "protein": "string or null",
    "carbohydrates": "string or null"
  }},
  "allergens": ["allergen 1"],
  "storage_usage": "string or null",
  "warnings_cautions": "string or null",
  "certifications_symbols": ["symbol 1"],
  "manufacturer_details": {{
    "marketed_by": "string or null",
    "manufactured_at": "string or null",
    "fssai_license": "string or null",
    "customer_care": "string or null"
  }},
  "barcode": "{primary_barcode_val or 'null'}",
  "dietary_logo": "VEG or NON_VEG or null",
  "detected_packaging_views": ["front_view", "back_view"],
  "declarations": [
    {{"text": "declaration text", "location": "front/back", "confidence": "High/Medium/Low"}}
  ],
  "unable_to_verify": ["list of details that could not be reliably read"],
  "ambiguous_details": ["list of conflicting text"]
}}

[OCR TEXT HINTS (Use as reference, but trust your own vision)]:
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

Output ONLY the raw JSON without markdown backticks or commentary."""

    scale_px_per_mm = None
    if barcode_boxes:
        bc = barcode_boxes[0]["box"]
        bc_width_px = bc[2] - bc[0]
        scale_px_per_mm = round(bc_width_px / 37.29, 3)

    payload = {
        "source_image": str(img_path.resolve()),
        "enhanced_image": str(enhanced_save_path.resolve()),
        "annotated_image": str(annotated_save_path.resolve()),
        "pdp_crop_image": str(crop_filename.resolve()),
        "mrp_zone_crop_image": str(mrp_crop_filename.resolve()),
        "scale_px_per_mm": scale_px_per_mm,
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
        "dietary_logo_detected": logo_info["type"] if logo_info else None,
        "boxes": all_final_boxes,
        "categorized_zones": categorized_text,
        "qwen_frame_images": [str(enhanced_save_path.resolve())],
        "qwen_7b_prompt": qwen_prompt
    }

    json_path = out_dir / f"qwen_payload_{img_path.stem}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    num_barcodes = sum(1 for b in all_final_boxes if b["category"] == "BARCODE")
    num_mrp = sum(1 for b in all_final_boxes if b["category"] == "MRP_BATCH")
    num_marketer = sum(1 for b in all_final_boxes if b["category"] == "MARKETER")
    num_mfg = sum(1 for b in all_final_boxes if b["category"] == "MANUFACTURER")
    num_nutri = sum(1 for b in all_final_boxes if b["category"] == "NUTRITION_USP")
    num_warn = sum(1 for b in all_final_boxes if b["category"] == "WARNINGS")
    num_gen = sum(1 for b in all_final_boxes if b["category"] == "GENERAL_INFO")

    print("\n" + "="*70)
    print("UNIVERSAL PACKAGING ANALYSIS & COLOR ANNOTATION COMPLETE")
    print("="*70)
    print(f" ⬜ [WHITE]         Barcodes             : {num_barcodes} boxes")
    print(f" 🟪 [VIVID MAGENTA] MRP, Price & Dates   : {num_mrp} boxes")
    print(f" 🟦 [SKY BLUE]      Marketer & FSSAI     : {num_marketer} boxes")
    print(f" 💠 [CYAN / TEAL]   Manufacturer & Plant : {num_mfg} boxes")
    print(f" 🟧 [WARM AMBER]    Nutrition & USP      : {num_nutri} boxes")
    print(f" 🟥 [CORAL RED]     Warnings & Cautions  : {num_warn} boxes")
    print(f" 🟨 [OCHRE YELLOW]  General Product Info : {num_gen} boxes")
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
