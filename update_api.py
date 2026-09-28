with open("/Users/om_k/Downloads/ML_Project/scripts/api_server.py", "r") as f:
    content = f.read()

import re

old_inspect = """        payload["qwen"] = _run_qwen(payload, use_vision=qwen_enabled) if qwen_enabled else {
            "status": "disabled", "data": None
        }
        payload["job_id"] = job_id
        payload["media_type"] = media_type
        return jsonify({"success": True, "data": payload})"""

new_inspect = """        qwen_result = _run_qwen(payload, use_vision=qwen_enabled) if qwen_enabled else {
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
        return jsonify({"success": True, "data": payload})"""

content = content.replace(old_inspect, new_inspect)

with open("/Users/om_k/Downloads/ML_Project/scripts/api_server.py", "w") as f:
    f.write(content)
print("Updated api_server.py to trigger engine in /api/inspect")
