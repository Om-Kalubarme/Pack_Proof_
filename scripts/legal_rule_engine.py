import json
import math

class LegalRuleEngine:
    def __init__(self):
        pass
    
    def evaluate_all(self, raw_data):
        """
        raw_data should contain:
        - ocr_text: dict of extracted fields
        - spatial_measurements: list of dicts with height_mm, width_mm, pdp_area_cm2
        - physical_samples: list of net quantities (in g or ml)
        - declared_quantity: float
        """
        results = {
            "module_a": self.evaluate_module_a(raw_data.get("ocr_text", {})),
            "module_b": self.evaluate_module_b(raw_data.get("spatial_measurements", [])),
            "module_c": self.evaluate_module_c(
                raw_data.get("physical_samples", []),
                raw_data.get("declared_quantity", 0)
            )
        }
        
        # Determine overall status
        violations = []
        violations.extend(results["module_a"]["violations"])
        violations.extend(results["module_b"]["violations"])
        violations.extend(results["module_c"]["violations"])
        
        results["overall_status"] = "FAIL" if violations else "PASS"
        results["all_violations"] = violations
        
        # Form A/B general comments
        comments = "Package evaluated. "
        if violations:
            comments += "Identified violations: " + "; ".join(violations)
        else:
            comments += "Fully compliant."
            
        results["form_ab_comments"] = comments
        return results
        
    def evaluate_module_a(self, ocr_text):
        """Module A: Mandatory Declarations & Syntax Checker"""
        violations = []
        
        # Rule 10: Manufacturer details
        address = ocr_text.get("address", "")
        if not address or len(address) < 10:
            violations.append("Rule 10 Violation: Missing or incomplete manufacturer postal address/PIN code.")
            
        # Rule 6(1)(c): Net Quantity Units
        net_qty = ocr_text.get("net_quantity_text", "").lower()
        if "gms" in net_qty or "kilo" in net_qty or "cc" in net_qty:
            violations.append("Rule 6(1)(c) Violation: Non-standard units detected (e.g. gms, cc). Must use standard SI units.")
            
        # Rule 6(1)(e): MRP Syntax
        mrp_text = ocr_text.get("mrp_text", "").lower()
        if mrp_text and "inclusive of all taxes" not in mrp_text.replace("  ", " "):
            violations.append("Rule 6(1)(e) Violation: MRP syntax lacks 'inclusive of all taxes' declaration.")
            
        return {"status": "FAIL" if violations else "PASS", "violations": violations}

    def evaluate_module_b(self, spatial_measurements):
        """Module B: Optical Typography & PDP Surface Area Engine"""
        violations = []
        
        for idx, ms in enumerate(spatial_measurements):
            h = ms.get("height_mm", 0)
            w = ms.get("width_mm", 0)
            pdp = ms.get("pdp_area_cm2", 0)
            
            if pdp <= 0:
                continue
                
            # Font Height Threshold Check
            min_h = 1.0
            if 50 <= pdp < 100: min_h = 1.5
            elif 100 <= pdp < 500: min_h = 2.5
            elif 500 <= pdp < 2500: min_h = 4.0
            elif pdp >= 2500: min_h = 6.0
            
            if h < min_h:
                violations.append(f"Rule 7(1) Table-I Violation: Measured font height {h}mm against required statutory minimum {min_h}mm for PDP area {pdp} cm².")
                
            # Aspect Ratio Check
            if w < (h / 3):
                violations.append(f"Rule 7(3) Violation: Character width {w}mm is less than 1/3 of its height {h}mm.")
                
        return {"status": "FAIL" if violations else "PASS", "violations": violations}

    def evaluate_module_c(self, samples, declared_qty):
        """Module C: Fifth & Sixth Schedule Statistical Net Quantity Engine"""
        violations = []
        if not samples or declared_qty <= 0:
            return {"status": "NOT_TESTED", "violations": []}
            
        n = len(samples)
        mean_x = sum(samples) / n
        variance = sum((x - mean_x) ** 2 for x in samples) / (n - 1) if n > 1 else 0
        sigma = math.sqrt(variance)
        
        # Simplified Sixth Schedule Constant (C) based on sample size
        # n=32->C=0.67, n=50->C=0.47, etc. For demo, we use a rough approximation
        C = 0.5
        Xc = mean_x + (sigma * C)
        
        if Xc < declared_qty:
            violations.append(f"Sixth Schedule Violation: Corrected Average Xc ({Xc:.2f}) < Declared Net Quantity ({declared_qty}). LOT FAILED.")
            
        # Simplified MPE (Max Permissible Error) check. E.g. 5% of declared
        mpe = declared_qty * 0.05
        
        for val in samples:
            if (declared_qty - val) > (2 * mpe):
                violations.append("Catastrophic Breach: Package deficiency exceeds twice the MPE limit. LOT IMMEDIATELY REJECTED.")
                break
                
        return {
            "status": "FAIL" if violations else "PASS",
            "violations": violations,
            "mean": mean_x,
            "corrected_average": Xc
        }
