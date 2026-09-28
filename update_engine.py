with open("/Users/om_k/Downloads/ML_Project/scripts/rule_engine/engine.py", "r") as f:
    lines = f.readlines()

out = []
skip = False
for i, line in enumerate(lines):
    if "def _check_rule_7(self):" in line:
        skip = True
    if "def _check_rule_19_21(self):" in line:
        skip = False
    
    if not skip:
        out.append(line)

rules = """    def _check_rule_7(self):
        qty = self.ocr_data.get("net_quantity")
        unit = self.ocr_data.get("net_quantity_unit", "g")
        measured_height = self.vision_data.get("numeral_height_mm")
        
        if not qty or not measured_height:
            self.add_result("UNABLE_TO_VERIFY", "Rule 7", "7(3)", "Rule 7 dimensions", "Cannot verify without calibration", "Minimum numeral height based on qty", "Uncalibrated or missing qty", "Requires physical measurement or higher res", 0.0, "COMPUTER_VISION")
            return
            
        try:
            qty_float = float(qty)
        except:
            return

        min_h = 1.0
        if qty_float > 200 and qty_float <= 500:
            min_h = 2.0
        elif qty_float > 500:
            min_h = 4.0

        if measured_height < min_h:
            self.add_result("FAIL", "Rule 7", "7(3)", "Rule 7 dimensions", "Net quantity numeral height appears below the applicable minimum.", f"Minimum = {min_h} mm", f"{measured_height} mm", "COMPUTER_VISION measurement", 0.85, "COMPUTER_VISION")
        else:
            self.add_result("PASS", "Rule 7", "7(3)", "Rule 7 dimensions", "None", f"Minimum = {min_h} mm", f"{measured_height} mm", "COMPUTER_VISION measurement", 0.85, "COMPUTER_VISION")

    def _check_rule_8(self):
        clearance = self.vision_data.get("quantity_clearance_status")
        if clearance == "VIOLATION":
            self.add_result("FAIL", "Rule 8", "8(1)", "Rule 8 exact spacing", "Quantity declaration does not have the required clear surrounding area.", "Required clearance around quantity declaration", "Text detected within prohibited clearance zone", "COMPUTER_VISION geometry check", 0.90, "COMPUTER_VISION")
        elif clearance == "PASS":
            self.add_result("PASS", "Rule 8", "8(1)", "Rule 8 exact spacing", "None", "Required clearance", "Clearance satisfied", "COMPUTER_VISION", 0.90, "COMPUTER_VISION")
        else:
            self.add_result("UNABLE_TO_VERIFY", "Rule 8", "8(1)", "Rule 8 exact spacing", "Cannot verify accurately from image alone", "Required clearance", "Not detected", "Requires physical measurement", 0.0, "COMPUTER_VISION")

    def _check_rule_11(self):
        when_packed = False
        env_variation = self.user_inputs.get("environmental_variation", "NO_SIGNIFICANT_ENVIRONMENTAL_VARIATION")
        if when_packed:
            if env_variation == "NO_SIGNIFICANT_ENVIRONMENTAL_VARIATION":
                self.add_result("FAIL", "Rule 11", "11(2)", "'When packed' detected", "'When packed' detected where the commodity classification does not establish significant environmental variation.", "'When packed' must not be used", "Detected 'When packed'", "OCR", 0.95, "OCR")
            else:
                self.add_result("UNABLE_TO_VERIFY", "Rule 11", "11(2)", "'When packed' detected", "Requires verification against Third Schedule", "Permitted only if in Third Schedule", "Detected 'When packed'", "Requires Rule-Schedule Verification", 0.0, "USER_INPUT")

"""

# Insert rules back
for i, line in enumerate(out):
    if "def _check_rule_19_21(self):" in line:
        out.insert(i, rules)
        break

# fix the trailing broken else from earlier mistake too
final_out = []
for i, line in enumerate(out):
    if "            else:" in line and "UNABLE_TO_VERIFY" in out[i+1]:
        # skip this and next 7 lines which are the broken _check_rule_11 fragments
        continue
    if "UNABLE_TO_VERIFY" in line and "11(2)" in line and "Requires verification" in out[i+1]:
        continue
    if "Requires verification" in line and "Permitted only if" in out[i+1]:
        continue
    if "Permitted only if" in line and "Detected 'When packed'" in out[i+1]:
        continue
    if "Detected 'When packed'" in line and "Requires Rule-Schedule" in out[i+1]:
        continue
    if "Requires Rule-Schedule" in line and "                )" in out[i+1]:
        continue
    if "                )" in line and "    def _check_rule_19_21(self):" in out[i+1]:
        continue
    final_out.append(line)


with open("/Users/om_k/Downloads/ML_Project/scripts/rule_engine/engine.py", "w") as f:
    f.writelines(out)
