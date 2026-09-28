from datetime import datetime
import json
from .mpe_calculator import calculate_mpe

class LegalRuleEngine:
    def __init__(self, ocr_data, vision_data, user_inputs=None):
        self.ocr_data = ocr_data
        self.vision_data = vision_data
        self.user_inputs = user_inputs or {}
        self.findings = []
        self.finding_counter = 1
        
    def add_result(self, status, rule, sub_rule, title, issue, expected, actual, evidence, confidence, verification_type):
        res = {
            "finding_id": f"F-{self.finding_counter:03d}",
            "rule": rule,
            "sub_rule": sub_rule,
            "status": status,
            "title": title,
            "detected_issue": issue,
            "requirement": expected,
            "actual": actual,
            "evidence": {
                "image_id": "IMG-01",
                "crop": [],
                "ocr": evidence,
                "confidence": confidence
            },
            "verification_type": verification_type,
            "next_action": "Requires Physical Check" if status == "REQUIRES_PHYSICAL_TEST" or status == "UNABLE_TO_VERIFY" else None,
            "source_reference": "Legal Metrology (Packaged Commodities) Rules, 2011"
        }
        self.findings.append(res)
        self.finding_counter += 1

    def evaluate(self):
        self._check_applicability()
        self._check_rule_6_and_mrp()
        self._check_rule_7()
        self._check_rule_8()
        self._check_rule_11()
        self._check_rule_19_21()
        
        # Calculate overall status based on findings
        has_violations = any(f["status"] == "FAIL" for f in self.findings)
        has_unknown = any(f["status"] == "UNABLE_TO_VERIFY" for f in self.findings)
        has_tests = any(f["status"] == "REQUIRES_PHYSICAL_TEST" for f in self.findings)
        
        overall_status = "COMPLIANT ON VERIFIED VISUAL CHECKS"
        if has_violations:
            overall_status = "VIOLATION DETECTED"
        elif has_tests:
            overall_status = "PHYSICAL TEST REQUIRED"
        elif has_unknown:
            overall_status = "INCOMPLETE — UNABLE TO VERIFY"
            
        mfg_details = self.ocr_data.get("manufacturer_details", {})
            
        return {
            "inspection_id": f"INS-{int(datetime.now().timestamp())}",
            "overall_status": overall_status,
            "package": {
                "package_id": "PKG-0001",
                "images": [],
                "surfaces": self.ocr_data.get("detected_packaging_views", []),
                "product": {
                    "brand": self.ocr_data.get("brand_name"),
                    "name": self.ocr_data.get("product_name")
                },
                "declared_quantity": {
                    "value": self.ocr_data.get("net_quantity"),
                    "unit": self.ocr_data.get("net_quantity_unit", "")
                },
                "mrp": {
                    "raw": self.ocr_data.get("mrp_price")
                },
                "responsible_entities": {
                    "manufacturer": mfg_details.get("manufactured_at") or mfg_details.get("marketed_by"),
                    "consumer_care": mfg_details.get("customer_care")
                },
                "dates": {
                    "manufacturing": self.ocr_data.get("manufacturing_date")
                }
            },
            "legal_context": {
                "jurisdiction": "India",
                "rule_set": "Legal Metrology (Packaged Commodities) Rules, 2011",
                "version_id": "effective-version-2011",
                "effective_date": "2011-04-01"
            },
            "findings": self.findings,
            "physical_tests": [f for f in self.findings if f["status"] == "REQUIRES_PHYSICAL_TEST"],
            "audit": {
                "created_at": datetime.now().isoformat(),
                "engine_version": "1.0.0",
                "model_versions": ["qwen2.5:7b", "yolov8_package_v1"]
            }
        }

    def _check_applicability(self):
        # Applicability Gate
        # Assumes retail package for now, if not provided
        self.is_retail = self.user_inputs.get("is_retail", True)

    def _check_rule_6_and_mrp(self):
        if not self.is_retail:
            return
            
        required_fields = [
            ("manufacturer_name", "Manufacturer"),
            ("packer_name", "Packer"),
            ("net_quantity_value", "Net Quantity"),
            ("manufacture_month", "Month/Year of Manufacture")
        ]
        
        mfg_details = self.ocr_data.get("manufacturer_details", {})
        mapped_data = {
            "manufacturer_name": mfg_details.get("manufactured_at"),
            "packer_name": mfg_details.get("marketed_by") or self.ocr_data.get("packer_name"),
            "net_quantity_value": self.ocr_data.get("net_quantity"),
            "manufacture_month": self.ocr_data.get("manufacturing_date"),
        }
        
        for field, name in required_fields:
            val = mapped_data.get(field)
            if not val or (isinstance(val, str) and val.lower() == "null"):
                self.add_result("UNABLE_TO_VERIFY", "Rule 6", "6(1)", f"{name} Declaration", f"Declared {name} not established.", f"Package must declare {name}", "Not detected on visible panels", f"No qualifying {name} declaration detected.", 0.0, "OCR")
            else:
                self.add_result("PASS", "Rule 6", "6(1)", f"{name} Declaration", "None", f"Package must declare {name}", f"Found: {val}", "Extracted from package", 0.95, "OCR")

        # --- NEW MRP FLOWCHART LOGIC (Rule 2(m), Rule 6, Rule 18(3)) ---
        mrp_str = self.ocr_data.get("mrp_price")
        if not mrp_str or str(mrp_str).lower() == "null":
            self.add_result("UNABLE_TO_VERIFY", "Rule 6", "6(1)(e)", "MRP Declaration", "Retail Sale Price (MRP) not established.", "Must declare MRP", "Not seen on visible panels", "OCR", 0.0, "OCR")
        else:
            self.add_result("PASS", "Rule 6", "6(1)(e)", "MRP Declaration", "None", "Must declare MRP", f"Found: {mrp_str}", "OCR", 0.95, "OCR")
            
            # Rule 2(m): Inclusive of all taxes
            if "incl" not in str(mrp_str).lower() and "tax" not in str(mrp_str).lower():
                self.add_result("UNABLE_TO_VERIFY", "Rule 2", "2(m)", "'Inclusive of all taxes' formatting", "MRP does not state 'Inclusive of all taxes', potential violation.", "Must declare 'Inclusive of all taxes'", "Not seen -> potential/verify", "OCR", 0.0, "OCR")
            else:
                self.add_result("PASS", "Rule 2", "2(m)", "'Inclusive of all taxes' formatting", "None", "Must declare 'Inclusive of all taxes'", "Taxes text found", "OCR", 0.95, "OCR")

        # Rule 18(3) and Stickers
        stickers = self.ocr_data.get("stickers_detected", [])
        if stickers and len(stickers) > 0:
            sticker_type = self.user_inputs.get("sticker_type", "UNKNOWN")
            
            if sticker_type == "REDUCED_PRICE":
                self.add_result("PASS", "Rule 18", "18(3)", "Sticker Usage", "None", "Reduced price sticker permitted", "Reduced sticker detected", "Vision", 0.90, "COMPUTER_VISION")
            elif sticker_type == "REVISED_TAX":
                self.add_result("UNABLE_TO_VERIFY", "Rule 18", "18(3)", "Sticker Usage", "Requires manual validation of tax revision and communication notice", "Difference limited to tax change", "Tax sticker detected", "Manual Check", 0.0, "USER_INPUT")
            else:
                self.add_result("UNABLE_TO_VERIFY", "Rule 6", "6(1)", "Sticker Usage", "Possible sticker detected, but legality not established", "Cannot use stickers for declarations without exception", "Sticker detected", "Vision", 0.0, "COMPUTER_VISION")

        # Consumer Care Phone & Email split
        consumer_contact = mfg_details.get("customer_care", "")
        phone_visible = any(char.isdigit() for char in str(consumer_contact))
        email_visible = "@" in str(consumer_contact)

        if not phone_visible:
             self.add_result("UNABLE_TO_VERIFY", "Rule 6", "6(2)", "Consumer-care phone", "Phone not established.", "Must declare consumer care phone", "Not detected", "No contact details detected.", 0.0, "OCR")
        else:
             self.add_result("PASS", "Rule 6", "6(2)", "Consumer-care phone", "None", "Must declare consumer care phone", f"Visible: {consumer_contact}", "Extracted from package", 0.95, "OCR")
             
        if not email_visible:
             self.add_result("UNABLE_TO_VERIFY", "Rule 6", "6(2)", "Consumer-care address/email", "Email/Address not sufficiently established.", "Must declare consumer care email", "Not sufficiently established", "No email detected.", 0.0, "OCR")
        else:
             self.add_result("PASS", "Rule 6", "6(2)", "Consumer-care address/email", "None", "Must declare consumer care email", f"Visible", "Extracted from package", 0.95, "OCR")
    def _check_rule_7(self):
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

    def _check_rule_19_21(self):
        qty = self.ocr_data.get("net_quantity")
        unit = self.ocr_data.get("net_quantity_unit", "g")
        actual_qty = self.user_inputs.get("measured_net_quantity")
        
        self.add_result("UNABLE_TO_VERIFY", "Rule 11", "11", "Actual net quantity", "Cannot be determined from image", "Physical quantity must match declared", "Not determined", "Requires Physical Test", 0.0, "PHYSICAL_TEST")
        
        if not qty or not actual_qty:
            self.add_result("REQUIRES_PHYSICAL_TEST", "Rule 19", "19", "Rule 19 testing", "Physical inspection/test required", "Net quantity >= declared (within MPE)", "No physical data", "Requires Physical Test", 0.0, "PHYSICAL_TEST")
            self.add_result("REQUIRES_PHYSICAL_TEST", "Rule 21", "21", "Rule 21 testing", "Inspection context + physical test required", "Dealer inspection", "No physical data", "Requires Physical Test", 0.0, "PHYSICAL_TEST")
            return

        try:
            qty_float = float(qty)
            actual_float = float(actual_qty)
        except:
            return

        deficiency = qty_float - actual_float
        if deficiency <= 0:
            self.add_result("PASS", "Rule 19", "19", "Rule 19 testing", "None", "Deficiency <= MPE", f"Deficiency: {deficiency}", "Physical Test", 1.0, "PHYSICAL_TEST")
            return

        from .mpe_calculator import calculate_mpe
        mpe = calculate_mpe(qty_float, unit)
        if deficiency > mpe:
            self.add_result("FAIL", "Rule 19", "19", "Rule 19 testing", "Actual quantity is below declared quantity and deficiency exceeds applicable MPE.", f"Deficiency <= {mpe} {unit}", f"Deficiency = {deficiency} {unit}", "Physical Test", 1.0, "PHYSICAL_TEST")
        else:
            self.add_result("PASS", "Rule 19", "19", "Rule 19 testing", "None", f"Deficiency <= {mpe} {unit}", f"Deficiency = {deficiency} {unit}", "Physical Test", 1.0, "PHYSICAL_TEST")