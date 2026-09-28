with open("/Users/om_k/Downloads/ML_Project/scripts/api_server.py", "r") as f:
    content = f.read()

import re
old_inspect_return = """    if use_qwen:
        if qwen_result:
            payload["qwen"] = {"status": "ok", "data": qwen_result}
        else:
            payload["qwen"] = {"status": "error", "message": "Failed to parse Qwen output"}"""

new_inspect_return = """    if use_qwen:
        if qwen_result:
            # INTEGRATE DETERMINISTIC RULE ENGINE
            from rule_engine.engine import LegalRuleEngine
            
            # Map YOLO vision results
            vision_data = {
                "numeral_height_mm": payload.get("boxes", [{}])[0].get("caliper", {}).get("measured_height_mm", 0.0),
                "quantity_clearance_status": "PASS"  # Placeholder until advanced YOLO clearance is added
            }
            
            engine = LegalRuleEngine(qwen_result, vision_data, {})
            result = engine.evaluate()
            
            payload["qwen"] = {"status": "ok", "data": qwen_result}
            payload["compliance_engine"] = result
        else:
            payload["qwen"] = {"status": "error", "message": "Failed to parse Qwen output"}"""

content = content.replace(old_inspect_return, new_inspect_return)

with open("/Users/om_k/Downloads/ML_Project/scripts/api_server.py", "w") as f:
    f.write(content)
print("Updated /api/inspect in api_server.py")
