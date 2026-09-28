import argparse
import cv2
import json
import math
import numpy as np
from pathlib import Path
from difflib import SequenceMatcher
from predict_yolo import process_packaging_image


def frame_quality(frame):
    """Return a stable quality score that favors legible, well-exposed frames."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    exposure = float(gray.mean())
    # Penalize near-black and clipped frames without discarding useful labels.
    exposure_score = max(0.0, 1.0 - abs(exposure - 128.0) / 128.0)
    return sharpness * (0.60 + 0.40 * exposure_score), sharpness, exposure


def perceptual_signature(frame):
    """Small luminance signature used to avoid scanning the same video view twice."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    small = cv2.resize(gray, (16, 16), interpolation=cv2.INTER_AREA)
    return (small > small.mean()).astype(np.uint8)


def is_visual_duplicate(frame, signatures, threshold=0.94):
    signature = perceptual_signature(frame)
    for previous in signatures:
        similarity = float((signature == previous).mean())
        if similarity >= threshold:
            return True
    signatures.append(signature)
    return False

def crop_to_bottle(img):
    """Dynamically crops the frame to just the physical bottle/tin, ignoring the 3D scene background."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return img
        
    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)
    
    # If the bounding box is reasonable (at least 30% of image height)
    if h > img.shape[0] * 0.3:
        # Add a tiny 5% padding
        pad = int(w * 0.05)
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img.shape[1], x + w + pad)
        y2 = min(img.shape[0], y + h + pad)
        return img[y1:y2, x1:x2]
    return img

def unroll_cylinder(img):
    """Mathematically unrolls a cylindrical object into a flat 2D projection."""
    h, w = img.shape[:2]
    # Assume the bottle takes up 90% of the image width after cropping padding
    center_x = w / 2
    bottle_w = w * 0.9
    R = bottle_w / 2
    
    # Map angles from -pi/3 to pi/3 to avoid extreme edge distortion
    max_theta = np.pi / 3
    
    unwrapped_w = int(2 * R * max_theta)
    unwrapped_h = h
    
    unwrapped_img = np.zeros((unwrapped_h, unwrapped_w, 3), dtype=np.uint8)
    
    for ux in range(unwrapped_w):
        theta = (ux / unwrapped_w - 0.5) * 2 * max_theta
        orig_x = int(center_x + R * np.sin(theta))
        
        if 0 <= orig_x < w:
            unwrapped_img[:, ux] = img[:, orig_x]
            
    return unwrapped_img

def is_fuzzy_duplicate(new_text, seen_texts, threshold=0.8):
    """Uses Levenshtein distance (fuzzy matching) to deduplicate OCR spam."""
    new_lower = new_text.lower().strip()
    for seen in seen_texts:
        if SequenceMatcher(None, new_lower, seen).ratio() > threshold:
            return True
    return False

def create_image_grid(image_paths, output_path, cols=3):
    images = []
    for p in image_paths:
        img = cv2.imread(str(p))
        if img is not None:
            h, w = img.shape[:2]
            scale = 640 / max(h, w)
            img = cv2.resize(img, (0,0), fx=scale, fy=scale)
            images.append(img)
            
    if not images:
        return
        
    max_h = max(img.shape[0] for img in images)
    max_w = max(img.shape[1] for img in images)
    
    padded = []
    for img in images:
        h, w = img.shape[:2]
        pad_img = np.zeros((max_h, max_w, 3), dtype=np.uint8)
        pad_img[:h, :w] = img
        padded.append(pad_img)
        
    rows = math.ceil(len(padded) / cols)
    
    while len(padded) < rows * cols:
        padded.append(np.zeros((max_h, max_w, 3), dtype=np.uint8))
        
    grid_rows = []
    for r in range(rows):
        row_imgs = padded[r*cols : (r+1)*cols]
        grid_rows.append(np.hstack(row_imgs))
        
    grid = np.vstack(grid_rows)
    cv2.imwrite(str(output_path), grid)
    print(f"[+] Saved Flattened Image Grid Summary to {output_path}")

def process_images(image_paths, model_path="models/yolo11_packaging.pt", conf=0.35, output_dir="runs/predict"):
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    frames_dir = out_dir / f"multi_image_{Path(image_paths[0]).stem}"
    frames_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"[+] Processing {len(image_paths)} uploaded images as a combined batch...")
    
    master_payload = {
        "source_images": [str(p) for p in image_paths],
        "total_frames_analyzed": len(image_paths),
        "detections_summary": {
            "total_clean_boxes": 0,
            "barcode_boxes": 0,
            "mrp_batch_boxes": 0,
            "marketer_boxes": 0,
            "manufacturer_boxes": 0,
            "nutrition_boxes": 0,
            "warnings_boxes": 0,
            "general_boxes": 0
        },
        "dietary_logo_detected": None,
        "boxes": [],
        "frame_quality": [],
    }
    
    annotated_frame_paths = []
    enhanced_frame_paths = []
    seen_texts = set()
    barcode_scales = []
    
    for i, f_path_str in enumerate(image_paths):
        f_path = Path(f_path_str)
        print(f"\n{'='*50}")
        print(f"Processing Image {i+1}/{len(image_paths)}: {f_path.name}")
        print(f"{'='*50}")
        
        try:
            payload = process_packaging_image(str(f_path), model_path, conf, str(frames_dir))
            if payload.get("scale_px_per_mm"):
                barcode_scales.append(float(payload["scale_px_per_mm"]))
            
            annotated_path = frames_dir / f"result_{f_path.name}"
            if annotated_path.exists():
                annotated_frame_paths.append(annotated_path)
            
            if payload.get("enhanced_image"):
                enhanced_frame_paths.append(Path(payload["enhanced_image"]))
                
            if payload.get("dietary_logo_detected") and master_payload["dietary_logo_detected"] is None:
                master_payload["dietary_logo_detected"] = payload["dietary_logo_detected"]
                
            for box in payload.get("boxes", []):
                text_val = str(box.get("text", "")).strip()
                if not text_val or len(text_val) < 2:
                    continue
                    
                if not is_fuzzy_duplicate(text_val, seen_texts):
                    seen_texts.add(text_val.lower())
                    box_with_source = dict(box)
                    box_with_source["frame_index"] = i
                    master_payload["boxes"].append(box_with_source)
                    
                    cat = box.get("category")
                    master_payload["detections_summary"]["total_clean_boxes"] += 1
                    if cat == "BARCODE": master_payload["detections_summary"]["barcode_boxes"] += 1
                    elif cat == "MRP_BATCH": master_payload["detections_summary"]["mrp_batch_boxes"] += 1
                    elif cat == "MARKETER": master_payload["detections_summary"]["marketer_boxes"] += 1
                    elif cat == "MANUFACTURER": master_payload["detections_summary"]["manufacturer_boxes"] += 1
                    elif cat == "NUTRITION_USP": master_payload["detections_summary"]["nutrition_boxes"] += 1
                    elif cat == "WARNINGS": master_payload["detections_summary"]["warnings_boxes"] += 1
                    elif cat == "GENERAL_INFO": master_payload["detections_summary"]["general_boxes"] += 1
                    
        except Exception as e:
            print(f"[-] Error processing image {f_path.name}: {e}")
            
    print("\n" + "="*70)
    print("MULTI-IMAGE PACKAGING ANALYSIS COMPLETE")
    print("="*70)
    
    if annotated_frame_paths:
        grid_path = out_dir / f"result_multi_{Path(image_paths[0]).stem}_summary.jpeg"
        create_image_grid(annotated_frame_paths, grid_path, cols=4 if len(annotated_frame_paths) > 6 else 3)
        master_payload["annotated_summary_image"] = str(grid_path.resolve())
    
    master_payload["frame_images"] = [str(path.resolve()) for path in annotated_frame_paths]
    if barcode_scales:
        master_payload["scale_px_per_mm"] = round(float(np.median(barcode_scales)), 3)
        master_payload["barcode_scale_samples"] = len(barcode_scales)
        
    qwen_paths = []
    for path in (enhanced_frame_paths[:8] if enhanced_frame_paths else image_paths[:8]):
        # Downsize for Qwen to prevent OOM / timeouts
        img = cv2.imread(str(path))
        if img is not None:
            h, w = img.shape[:2]
            MAX_QWEN_DIM = 768
            if max(h, w) > MAX_QWEN_DIM:
                scale = MAX_QWEN_DIM / max(h, w)
                img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
            q_path = out_dir / f"qwen_opt_{Path(path).name}"
            cv2.imwrite(str(q_path), img)
            qwen_paths.append(str(q_path.resolve()))
            
    master_payload["qwen_frame_images"] = qwen_paths
    master_payload["qwen_7b_prompt"] = build_qwen_prompt(master_payload)
    master_json_path = out_dir / f"qwen_payload_multi_{Path(image_paths[0]).stem}.json"
    with open(master_json_path, "w", encoding="utf-8") as f:
        json.dump(master_payload, f, indent=2, ensure_ascii=False)
    print(f"\n[+] Saved Master JSON Payload: {master_json_path.resolve()}")
    return master_payload

def process_video(video_path, model_path="models/yolo11_packaging.pt", conf=0.35, output_dir="runs/predict", max_frames=8):
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    # Each request gets an isolated directory so concurrent app scans cannot
    # overwrite each other's frames or Qwen payload.
    frames_dir = out_dir / f"video_frames_{Path(video_path).stem}"
    frames_dir.mkdir(parents=True, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[-] Error opening video {video_path}")
        return
        
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    if total_frames <= 0 or fps <= 0:
        cap.release()
        return None

    num_target_frames = min(max_frames, total_frames)
    interval = max(1, total_frames // num_target_frames)
    
    print(f"[*] Processing Video: {Path(video_path).name} ({total_frames} frames @ {fps} fps)")
    print(f"[*] Smart Extracting {num_target_frames} sharpest frames using Blur Rejection...")
    
    extracted_paths = []
    frame_metadata = []
    signatures = []
    
    for chunk_idx in range(num_target_frames):
        best_frame = None
        best_sharpness = -1
        
        # Scan the chunk for the sharpest frame
        for _ in range(interval):
            ret, frame = cap.read()
            if not ret:
                break
                
            quality, sharpness, exposure = frame_quality(frame)
            
            if quality > best_sharpness:
                best_sharpness = quality
                best_frame = frame
                best_frame_sharpness = sharpness
                best_frame_exposure = exposure
                
        if best_frame is not None and not is_visual_duplicate(best_frame, signatures):
            # Bypassing naive 3D cylinder unroll and crop as it aggressively distorts text
            # from handheld video scans, causing OCR to return garbage strings.
            # Using the raw sharp frame preserves text legibility for EasyOCR.
            f_path = frames_dir / f"frame_{len(extracted_paths)}.jpeg"
            cv2.imwrite(str(f_path), best_frame)
            extracted_paths.append(f_path)
            frame_metadata.append({
                "frame_index": len(extracted_paths) - 1,
                "source_segment": chunk_idx,
                "sharpness": round(best_frame_sharpness, 2),
                "mean_brightness": round(best_frame_exposure, 2),
                "path": str(f_path.resolve()),
            })
            
    cap.release()
    
    print(f"[+] Extracted & Unrolled {len(extracted_paths)} keyframes. Starting Pipeline...")
    
    master_payload = {
        "source_video": video_path,
        "total_frames_analyzed": len(extracted_paths),
        "detections_summary": {
            "total_clean_boxes": 0,
            "barcode_boxes": 0,
            "mrp_batch_boxes": 0,
            "marketer_boxes": 0,
            "manufacturer_boxes": 0,
            "nutrition_boxes": 0,
            "warnings_boxes": 0,
            "general_boxes": 0
        },
        "dietary_logo_detected": None,
        "boxes": [],
        "frame_quality": frame_metadata,
    }
    
    annotated_frame_paths = []
    enhanced_frame_paths = []
    seen_texts = set()
    barcode_scales = []
    
    for i, f_path in enumerate(extracted_paths):
        print(f"\n{'='*50}")
        print(f"Processing Unrolled Angle {i+1}/{len(extracted_paths)}")
        print(f"{'='*50}")
        
        try:
            payload = process_packaging_image(str(f_path), model_path, conf, str(frames_dir))
            if payload.get("scale_px_per_mm"):
                barcode_scales.append(float(payload["scale_px_per_mm"]))
            
            annotated_path = frames_dir / f"result_{f_path.name}"
            if annotated_path.exists():
                annotated_frame_paths.append(annotated_path)
            
            if payload.get("enhanced_image"):
                enhanced_frame_paths.append(Path(payload["enhanced_image"]))
                
            if payload.get("dietary_logo_detected") and master_payload["dietary_logo_detected"] is None:
                master_payload["dietary_logo_detected"] = payload["dietary_logo_detected"]
                
            for box in payload.get("boxes", []):
                text_val = str(box.get("text", "")).strip()
                if not text_val or len(text_val) < 2:
                    continue
                    
                # FUZZY DEDUPLICATION
                if not is_fuzzy_duplicate(text_val, seen_texts):
                    seen_texts.add(text_val.lower())
                    box_with_source = dict(box)
                    box_with_source["frame_index"] = i
                    master_payload["boxes"].append(box_with_source)
                    
                    cat = box.get("category")
                    master_payload["detections_summary"]["total_clean_boxes"] += 1
                    if cat == "BARCODE": master_payload["detections_summary"]["barcode_boxes"] += 1
                    elif cat == "MRP_BATCH": master_payload["detections_summary"]["mrp_batch_boxes"] += 1
                    elif cat == "MARKETER": master_payload["detections_summary"]["marketer_boxes"] += 1
                    elif cat == "MANUFACTURER": master_payload["detections_summary"]["manufacturer_boxes"] += 1
                    elif cat == "NUTRITION_USP": master_payload["detections_summary"]["nutrition_boxes"] += 1
                    elif cat == "WARNINGS": master_payload["detections_summary"]["warnings_boxes"] += 1
                    elif cat == "GENERAL_INFO": master_payload["detections_summary"]["general_boxes"] += 1
                    
        except Exception as e:
            print(f"[-] Error processing frame {f_path.name}: {e}")
            
    print("\n" + "="*70)
    print("3D VIDEO PACKAGING ANALYSIS COMPLETE")
    print("="*70)
    print(f" ⬜ [WHITE]         Barcodes             : {master_payload['detections_summary']['barcode_boxes']} unique")
    print(f" 🟪 [VIVID MAGENTA] MRP, Price & Dates   : {master_payload['detections_summary']['mrp_batch_boxes']} unique")
    print(f" 🟦 [SKY BLUE]      Marketer & FSSAI     : {master_payload['detections_summary']['marketer_boxes']} unique")
    print(f" 💠 [CYAN / TEAL]   Manufacturer & Plant : {master_payload['detections_summary']['manufacturer_boxes']} unique")
    print(f" 🟧 [WARM AMBER]    Nutrition & USP      : {master_payload['detections_summary']['nutrition_boxes']} unique")
    print(f" 🟥 [CORAL RED]     Warnings & Cautions  : {master_payload['detections_summary']['warnings_boxes']} unique")
    print(f" 🟨 [OCHRE YELLOW]  General Product Info : {master_payload['detections_summary']['general_boxes']} unique")
    if master_payload['dietary_logo_detected']:
        print(f" 🟩/🟥 Dietary Logo Detected             : {master_payload['dietary_logo_detected']}")
    
    grid_path = out_dir / f"result_{Path(video_path).stem}_summary.jpeg"
    create_image_grid(annotated_frame_paths, grid_path, cols=4 if len(annotated_frame_paths) > 6 else 3)
    master_payload["annotated_summary_image"] = str(grid_path.resolve())
    master_payload["frame_images"] = [str(path.resolve()) for path in annotated_frame_paths]
    if barcode_scales:
        # A robust median across views is less sensitive to one partial barcode.
        master_payload["scale_px_per_mm"] = round(float(np.median(barcode_scales)), 3)
        master_payload["barcode_scale_samples"] = len(barcode_scales)
    # These unannotated frames are sent to Qwen-VL; keep the list bounded to
    # control latency and vision-model context usage.
    master_payload["qwen_frame_images"] = [str(path.resolve()) for path in enhanced_frame_paths[:6]] if enhanced_frame_paths else [str(path.resolve()) for path in extracted_paths[:6]]
    master_payload["qwen_7b_prompt"] = build_qwen_prompt(master_payload)
    master_json_path = out_dir / f"qwen_payload_{Path(video_path).stem}.json"
    with open(master_json_path, "w", encoding="utf-8") as f:
        json.dump(master_payload, f, indent=2, ensure_ascii=False)
    print(f"\n[+] Saved Master JSON Payload: {master_json_path.resolve()}")
    return master_payload

def build_qwen_prompt(payload):
    """Build one structured Qwen prompt from all unique video-frame detections."""
    grouped = {}
    for box in payload.get("boxes", []):
        grouped.setdefault(box.get("category", "OTHER"), []).append(str(box.get("text", "")))

    sections = "\n".join(
        f"{category}:\n" + "\n".join(f"- {text}" for text in texts)
        for category, texts in grouped.items()
    )
    return f"""# Role: Strict Packet Scanner & Declaration Generator

You are a high-accuracy packet/packaging analysis model. Your primary responsibility is to inspect the provided packet/package video frames and extract every visible and relevant detail accurately.

## 1. Scan Everything Before Responding
Systematically inspect the entire packet across all provided frames (front, back, left, right, top, bottom).
Do not stop after identifying the major information. Scan again specifically for small, partially hidden, or easily overlooked details.

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
  "barcode": "string or null",
  "dietary_logo": "VEG or NON_VEG or null",
  "detected_packaging_views": ["front_view", "back_view"],
  "declarations": [
    {{"text": "declaration text", "location": "front/back", "confidence": "High/Medium/Low"}}
  ],
  "unable_to_verify": ["list of details that could not be reliably read"],
  "ambiguous_details": ["list of conflicting text"]
}}

MULTI-FRAME OCR HINTS (Use as reference, but trust your own vision):
({payload.get('total_frames_analyzed', 0)} frames):
{sections}
"""
    
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="3D Video Packaging Detection Pipeline")
    parser.add_argument("--video", type=str, required=True, help="Path to packaging video")
    parser.add_argument("--model", type=str, default="models/yolo11_packaging.pt", help="YOLO model path")
    parser.add_argument("--conf", type=float, default=0.35, help="Confidence threshold")
    parser.add_argument("--output", type=str, default="runs/predict", help="Output directory")
    parser.add_argument("--max-frames", type=int, default=8, help="Maximum distinct sharp frames to inspect")
    
    args = parser.parse_args()
    process_video(args.video, args.model, args.conf, args.output, args.max_frames)
