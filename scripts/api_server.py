"""HTTP API for package image and video inspection.

Flutter uploads media; YOLO locates packaging regions/barcodes, EasyOCR reads
them, and Qwen-VL reconciles fields across selected video frames. A failed
optional Qwen call never discards the deterministic YOLO/OCR result.
"""

import json
import os
import sys
import traceback
import uuid
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from predict_yolo import process_packaging_image
from predict_video import process_video
from qwen_extract import call_ollama
from digital_caliper import TableITypographyCaliper


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 250 * 1024 * 1024
CORS(app, resources={r"/api/*": {"origins": "*"}})

PROJECT_ROOT = Path(__file__).resolve().parent.parent
UPLOAD_FOLDER = PROJECT_ROOT / "scratch" / "uploads"
OUTPUT_FOLDER = PROJECT_ROOT / "runs" / "api"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)
VIDEO_SUFFIXES = {".mp4", ".mov", ".m4v", ".avi", ".webm"}


def _parse_json_response(response_text):
    """Accept model JSON even when it is accidentally enclosed in a fence."""
    cleaned = (response_text or "").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())


def _run_qwen(payload, use_vision=True):
    prompt = payload.get("qwen_7b_prompt")
    if not prompt:
        return {"status": "not_available", "data": None}

    endpoint = os.environ.get("QWEN_ENDPOINT", "http://127.0.0.1:11434/api/generate")
    text_model = os.environ.get("QWEN_MODEL", "qwen2.5:7b")
    vision_model = os.environ.get("QWEN_VL_MODEL", "qwen2.5vl:7b")
    image_paths = payload.get("qwen_frame_images", []) if use_vision else []
    model = vision_model if image_paths else text_model
    try:
        response = call_ollama(prompt, model=model, endpoint=endpoint, image_paths=image_paths)
        if response.startswith("[-]"):
            return {"status": "unavailable", "data": None, "model": model, "error": response}
        result_dict = {
            "status": "ok",
            "data": _parse_json_response(response),
            "model": model,
            "used_video_frames": len(image_paths),
        }
        print(f"[QWEN RESULT]: {json.dumps(result_dict['data'], indent=2)}")
        return result_dict
    except Exception as exc:
        print(f"[-] QWEN FAILED: {exc}")
        import traceback
        traceback.print_exc()
        return {"status": "unavailable", "data": None, "model": model, "error": str(exc)}


def _optional_float(name):
    value = request.form.get(name)
    if value is None or value == "":
        return None
    try:
        parsed = float(value)
        return parsed if parsed > 0 else None
    except ValueError:
        return None


def _add_caliper_measurements(payload):
    """Add physical measurements only when a real scale is available."""
    barcode_scale = payload.get("scale_px_per_mm")
    depth_mm = _optional_float("distance_mm")
    focal_length_px = _optional_float("focal_length_px")
    pdp_area_cm2 = _optional_float("pdp_area_cm2")

    method = None
    if depth_mm and focal_length_px:
        caliper = TableITypographyCaliper(focal_length_px)
        method = "camera_intrinsics_and_depth"
    elif barcode_scale and barcode_scale > 0:
        caliper = None
        method = "barcode_reference_estimate"
    else:
        payload["measurement_available"] = False
        payload["measurement_note"] = "Provide AR depth + focal length or detect a barcode to calculate millimetres."
        return

    payload["measurement_available"] = True
    payload["measurement_method"] = method
    for box in payload.get("boxes", []):
        x1, y1, x2, y2 = box["box"]
        height_px, width_px = y2 - y1, x2 - x1
        if caliper:
            height_mm, width_mm = caliper.pixel_to_mm(height_px, width_px, depth_mm)
        else:
            height_mm = round(height_px / barcode_scale, 2)
            width_mm = round(width_px / barcode_scale, 2)

        measurement = {"measured_height_mm": height_mm, "measured_width_mm": width_mm}
        if pdp_area_cm2 and caliper:
            measurement["table_i"] = caliper.evaluate_table_1_compliance(
                pdp_area_cm2, height_mm, width_mm
            )
        box["caliper"] = measurement


@app.get("/api/health")
def health():
    return jsonify({
        "ok": True,
        "model_path": str(PROJECT_ROOT / "models" / "yolo11_packaging.pt"),
        "qwen_vl_model": os.environ.get("QWEN_VL_MODEL", "qwen2.5vl:7b"),
    })


@app.post("/api/inspect")
def inspect_media():
    if "image" not in request.files:
        return jsonify({"success": False, "error": "Upload an image or video in the 'image' form field."}), 400

    uploads = request.files.getlist("image")
    if not uploads or not uploads[0].filename:
        return jsonify({"success": False, "error": "No media file selected."}), 400

    job_id = uuid.uuid4().hex
    job_output = OUTPUT_FOLDER / job_id
    job_output.mkdir(parents=True, exist_ok=True)
    model_path = str(PROJECT_ROOT / "models" / "yolo11_packaging.pt")

    try:
        # Check if it's a single video file
        upload = uploads[0]
        original_name = secure_filename(upload.filename)
        suffix = Path(original_name).suffix.lower()
        if not suffix:
            suffix = ".mp4" if (upload.mimetype or "").startswith("video/") else ".jpg"
        is_video = (upload.mimetype or "").startswith("video/") or suffix in VIDEO_SUFFIXES

        if is_video and len(uploads) == 1:
            media_path = UPLOAD_FOLDER / f"{job_id}{suffix}"
            upload.save(media_path)
            payload = process_video(str(media_path), model_path, 0.20, str(job_output), max_frames=8)
            media_type = "video"
        else:
            # Handle one or multiple images
            image_paths = []
            for i, up in enumerate(uploads):
                if up.filename:
                    up_suffix = Path(secure_filename(up.filename)).suffix.lower() or ".jpg"
                    ipath = UPLOAD_FOLDER / f"{job_id}_{i}{up_suffix}"
                    up.save(ipath)
                    image_paths.append(str(ipath))
            
            if len(image_paths) == 1:
                payload = process_packaging_image(image_paths[0], model_path, 0.20, str(job_output))
            elif len(image_paths) > 1:
                from predict_video import process_images
                payload = process_images(image_paths, model_path, 0.20, str(job_output))
            else:
                return jsonify({"success": False, "error": "No valid images saved."}), 400
                
            media_type = "image" if len(image_paths) == 1 else "multi_image"

        if not payload:
            return jsonify({"success": False, "error": "The vision pipeline returned no result."}), 500

        _add_caliper_measurements(payload)
        qwen_enabled = request.form.get("use_qwen", "true").lower() not in {"0", "false", "no"}
        payload["qwen"] = _run_qwen(payload, use_vision=qwen_enabled) if qwen_enabled else {
            "status": "disabled", "data": None
        }
        payload["job_id"] = job_id
        payload["media_type"] = media_type
        return jsonify({"success": True, "data": payload})
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(exc), "job_id": job_id}), 500


@app.errorhandler(413)
def upload_too_large(_error):
    return jsonify({"success": False, "error": "Media is larger than the 250 MB upload limit."}), 413


if __name__ == "__main__":
    # Exposed for Android emulator/device development, not a public deployment.
    app.run(host="0.0.0.0", port=5001, debug=False)
