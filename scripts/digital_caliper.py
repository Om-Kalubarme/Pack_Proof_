import cv2
import numpy as np
import math
from enum import Enum
from typing import Dict, Tuple

class TableITypographyCaliper:
    """
    Optical Digital Caliper Engine for Legal Metrology Table-I Compliance.
    Converts 2D OCR character bounding boxes into physical millimeters.
    """
    def __init__(self, focal_length_y_px: float):
        # Camera intrinsic focal length in vertical pixels (e.g., ~1450.0 px for standard 1080p mobile sensors)
        self.f_y = focal_length_y_px

    def pixel_to_mm(self, height_px: float, width_px: float, distance_mm: float) -> Tuple[float, float]:
        """Converts pixel bounding box dimensions to physical millimeters."""
        height_mm = (height_px * distance_mm) / self.f_y
        width_mm = (width_px * distance_mm) / self.f_y
        return round(height_mm, 2), round(width_mm, 2)

    def evaluate_table_1_compliance(
        self, 
        pdp_surface_area_cm2: float, 
        height_mm: float, 
        width_mm: float,
        is_molded_or_blown: bool = False
    ) -> Dict[str, any]:
        """Evaluates measured font dimensions against statutory Table-I rules."""
        
        # 1. Determine statutory minimum font height threshold based on PDP surface area (cm²)
        if pdp_surface_area_cm2 < 50:
            min_height_mm = 1.5 if is_molded_or_blown else 1.0
        elif 50 <= pdp_surface_area_cm2 < 100:
            min_height_mm = 3.0 if is_molded_or_blown else 1.5
        elif 100 <= pdp_surface_area_cm2 < 500:
            min_height_mm = 4.0 if is_molded_or_blown else 2.5
        elif 500 <= pdp_surface_area_cm2 < 2500:
            min_height_mm = 6.0 if is_molded_or_blown else 4.0
        else: # >= 2500 cm²
            min_height_mm = 6.0

        # 2. Height Compliance Check
        height_pass = height_mm >= min_height_mm

        # 3. Rule 7(3) Aspect Ratio Check: Width must be >= 1/3 of Height
        min_width_mm = height_mm / 3.0
        aspect_ratio_pass = width_mm >= round(min_width_mm, 2)

        return {
            "pdp_surface_area_cm2": pdp_surface_area_cm2,
            "measured_height_mm": height_mm,
            "statutory_min_height_mm": min_height_mm,
            "height_compliance": "PASS" if height_pass else "FAIL",
            "measured_width_mm": width_mm,
            "min_required_width_mm": round(min_width_mm, 2),
            "aspect_ratio_compliance": "PASS" if aspect_ratio_pass else "FAIL",
            "overall_status": "PASS" if (height_pass and aspect_ratio_pass) else "FAIL"
        }


class PackageGeometry(Enum):
    RECTANGULAR = "rectangular"
    CYLINDRICAL = "cylindrical"
    IRREGULAR_POUCH = "irregular_pouch"


class PDPSurfaceAreaCalculator:
    """
    Computes Principal Display Panel (PDP) Surface Area (cm²)
    strictly adhering to Rule 7(4) of the Legal Metrology (Packaged Commodities) Rules.
    """
    
    @staticmethod
    def calculate_pdp_area(
        geometry: PackageGeometry, 
        height_cm: float, 
        width_or_diameter_cm: float, 
        depth_cm: float = 0.0
    ) -> float:
        """
        Calculates PDP Area in cm² based on statutory shape rules.
        """
        if geometry == PackageGeometry.RECTANGULAR:
            # Rule 7(4)(a): Height x Width of main display panel
            pdp_area = height_cm * width_or_diameter_cm

        elif geometry == PackageGeometry.CYLINDRICAL:
            # Rule 7(4)(b): 40% of (Height x Circumference), excluding neck and flanges
            circumference_cm = math.pi * width_or_diameter_cm  # C = π * d
            pdp_area = 0.40 * (height_cm * circumference_cm)

        elif geometry == PackageGeometry.IRREGULAR_POUCH:
            # Rule 7(4)(c): 40% of total surface area
            if depth_cm > 0:
                # 3D pouch / cuboid approximation
                total_surface = 2 * (
                    (height_cm * width_or_diameter_cm) + 
                    (height_cm * depth_cm) + 
                    (width_or_diameter_cm * depth_cm)
                )
            else:
                # Flat 2D pouch (front + back)
                total_surface = 2 * (height_cm * width_or_diameter_cm)
            
            pdp_area = 0.40 * total_surface

        else:
            raise ValueError("Unsupported package geometry")

        return round(pdp_area, 2)


# --- Example Usage ---
if __name__ == "__main__":
    # Initialize caliper with calibrated mobile camera focal length (e.g., 1420.5 pixels)
    caliper = TableITypographyCaliper(focal_length_y_px=1420.5)

    # Inputs from Vision Pipeline & AR Depth Sensor:
    ocr_bbox_height_px = 24.0      # OCR bounding box height in pixels
    ocr_bbox_width_px = 12.0       # OCR bounding box width in pixels
    ar_surface_distance_mm = 180.0 # Depth distance from camera lens = 180 mm (18 cm)
    pdp_area_cm2 = 120.0           # Calculated PDP Surface Area = 120 cm²

    # Calculate Physical Dimensions
    h_mm, w_mm = caliper.pixel_to_mm(ocr_bbox_height_px, ocr_bbox_width_px, ar_surface_distance_mm)
    
    # Evaluate Against Table-I
    result = caliper.evaluate_table_1_compliance(pdp_area_cm2, h_mm, w_mm)

    print("--- Caliper Example ---")
    print(f"Measured Dimensions: {h_mm} mm (H) x {w_mm} mm (W)")
    print(f"Compliance Evaluation: {result}\n")

    print("--- PDP Surface Area Calculator Example ---")
    calc = PDPSurfaceAreaCalculator()

    # Case A: Cereal Box (Rectangular: 20cm H x 15cm W)
    box_pdp = calc.calculate_pdp_area(PackageGeometry.RECTANGULAR, height_cm=20.0, width_or_diameter_cm=15.0)
    print(f"Rectangular Box PDP Area: {box_pdp} cm²")  # 300.0 cm² -> Table-I Min Font = 2.5 mm

    # Case B: Beverage Can / Soda Bottle (Cylindrical: 12cm H x 6.5cm Diameter)
    can_pdp = calc.calculate_pdp_area(PackageGeometry.CYLINDRICAL, height_cm=12.0, width_or_diameter_cm=6.5)
    print(f"Cylindrical Bottle PDP Area: {can_pdp} cm²") # 97.97 cm² -> Table-I Min Font = 1.5 mm

    # Case C: Stand-up Snack Pouch (Irregular Pouch: 18cm H x 12cm W x 4cm Depth)
    pouch_pdp = calc.calculate_pdp_area(PackageGeometry.IRREGULAR_POUCH, height_cm=18.0, width_or_diameter_cm=12.0, depth_cm=4.0)
    print(f"Pouch PDP Area: {pouch_pdp} cm²")           # 268.8 cm² -> Table-I Min Font = 2.5 mm
