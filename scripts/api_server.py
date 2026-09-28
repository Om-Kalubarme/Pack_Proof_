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
from legal_rule_engine import LegalRuleEngine
import database
import json

# Try to initialize DB
database.init_db()

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
        qwen_result = _run_qwen(payload, use_vision=qwen_enabled) if qwen_enabled else {
            "status": "disabled", "data": None
        }
        payload["qwen"] = qwen_result
        
        # --- Inject LegalRuleEngine ---
        if qwen_result.get("data"):
            from rule_engine.engine import LegalRuleEngine
            ocr_data = qwen_result["data"]
            vision_data = {} # Map caliper/heights if needed
            engine = LegalRuleEngine(ocr_data, vision_data, {})
            payload["compliance_engine"] = engine.evaluate()
        else:
            payload["compliance_engine"] = None

        payload["job_id"] = job_id
        payload["media_type"] = media_type
        return jsonify({"success": True, "data": payload})
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(exc), "job_id": job_id}), 500


@app.post("/api/v1/cases/assign")
def assign_case():
    data = request.json or {}
    case_id = data.get("case_id", str(uuid.uuid4())[:8])
    case_record = {
        "case_id": case_id,
        "business_name": data.get("business_name"),
        "address": data.get("address"),
        "gps_location": data.get("gps_location"),
        "inspection_type": data.get("inspection_type"),
        "assigned_inspector_id": data.get("assigned_inspector_id"),
        "deadline_timestamp": data.get("deadline_timestamp"),
        "priority": data.get("priority", "NORMAL"),
        "special_instructions": data.get("special_instructions", ""),
        "status": "ASSIGNED"
    }
    
    try:
        with database.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO inspection_cases (case_id, business_name, address, gps_location, inspection_type, assigned_inspector_id, deadline_timestamp, priority, special_instructions, status)
                    VALUES (%(case_id)s, %(business_name)s, %(address)s, %(gps_location)s, %(inspection_type)s, %(assigned_inspector_id)s, %(deadline_timestamp)s, %(priority)s, %(special_instructions)s, %(status)s)
                """, case_record)
            conn.commit()
    except Exception as e:
        print("DB Error:", e)
        # fallback for demo if PG not running
        pass
        
    return jsonify({"success": True, "message": "Case Assigned", "case": case_record})


@app.get("/api/v1/cases/my-assignments")
def get_my_assignments():
    inspector_id = request.args.get("inspector_id")
    cases = []
    try:
        with database.get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT c.*, r.raw_data, r.evaluation, r.report_id, r.created_at
                    FROM inspection_cases c
                    LEFT JOIN inspection_reports r ON c.case_id = r.case_id
                """
                if inspector_id:
                    query += " WHERE c.assigned_inspector_id = %s"
                    query += " ORDER BY r.created_at DESC NULLS LAST"
                    cur.execute(query, (inspector_id,))
                else:
                    query += " ORDER BY r.created_at DESC NULLS LAST"
                    cur.execute(query)
                cases = cur.fetchall()
                # Convert datetime to string for json serialization
                for c in cases:
                    if c.get("deadline_timestamp"):
                        c["deadline_timestamp"] = c["deadline_timestamp"].isoformat()
    except Exception as e:
        print("DB Error:", e)
        
    return jsonify({"success": True, "cases": cases})


@app.post("/api/v1/inspections/submit")
def submit_inspection():
    # In a real scenario, this would be a multipart/form-data upload handling images
    data = request.json or {}
    case_id = data.get("case_id")
    
    engine = LegalRuleEngine()
    evaluation = engine.evaluate_all(data)
    
    new_status = "VIOLATION_FLAGGED" if evaluation.get("overall_status") == "FAIL" else "COMPLETED"
    
    report_id = str(uuid.uuid4())
    report = {
        "report_id": report_id,
        "case_id": case_id,
        "evaluation": evaluation,
        "raw_data": data
    }
    
    try:
        with database.get_connection() as conn:
            with conn.cursor() as cur:
                if case_id:
                    cur.execute("UPDATE inspection_cases SET status = %s WHERE case_id = %s", (new_status, case_id))
                
                cur.execute("""
                    INSERT INTO inspection_reports (report_id, case_id, evaluation, raw_data)
                    VALUES (%s, %s, %s, %s)
                """, (report_id, case_id, json.dumps(evaluation), json.dumps(data)))
            conn.commit()
    except Exception as e:
        print("DB Error:", e)
        
    return jsonify({"success": True, "report": report})


@app.get("/api/v1/inspections/all")
def get_all_inspections():
    cases = []
    try:
        with database.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT r.report_id, r.created_at, r.raw_data, r.evaluation, c.business_name, c.address, c.gps_location, c.status as case_status
                    FROM inspection_reports r
                    LEFT JOIN inspection_cases c ON r.case_id = c.case_id
                    ORDER BY r.created_at DESC
                """)
                cases = cur.fetchall()
                for c in cases:
                    if c.get("created_at"):
                        c["created_at"] = c["created_at"].isoformat()
    except Exception as e:
        print("DB Error:", e)
    return jsonify({"success": True, "cases": cases})

@app.get("/api/v1/cases/<case_id>/review-package")
def review_package(case_id):
    report = None
    case_status = None
    try:
        with database.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM inspection_reports WHERE case_id = %s ORDER BY created_at DESC LIMIT 1", (case_id,))
                report = cur.fetchone()
                cur.execute("SELECT status FROM inspection_cases WHERE case_id = %s", (case_id,))
                case_row = cur.fetchone()
                if case_row:
                    case_status = case_row["status"]
    except Exception as e:
        print("DB Error:", e)

    if not report:
        return jsonify({"success": False, "error": "Report not found"}), 404
        
    return jsonify({
        "success": True,
        "case_id": case_id,
        "status": case_status,
        "report": report,
        "pdf_download_url": f"/api/v1/reports/download/{report['report_id']}",
        "violation_summary": report["evaluation"].get("all_violations", [])
    })



from rule_engine.engine import LegalRuleEngine as NewLegalRuleEngine
import uuid

@app.post("/api/scan-package")
def scan_package():
    # Simulated integration for scan-package which delegates to the new Rule Engine
    try:
        data = request.json or {}
        ocr_data = data.get("ocr_data", {})
        vision_data = data.get("vision_data", {})
        user_inputs = data.get("user_inputs", {})
        
        # In a real run, you would first call YOLO and Qwen here, map their output
        # to ocr_data and vision_data, and then pass it to the LegalRuleEngine.
        
        engine = NewLegalRuleEngine(ocr_data, vision_data, user_inputs)
        result = engine.evaluate()
        
        # result is now the exact Generic Machine-Readable Data Structure from the DOCX
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.errorhandler(413)
def upload_too_large(_error):
    return jsonify({"success": False, "error": "Media is larger than the 250 MB upload limit."}), 413


if __name__ == "__main__":
    # Exposed for Android emulator/device development, not a public deployment.
    app.run(host="0.0.0.0", port=5001, debug=False)
