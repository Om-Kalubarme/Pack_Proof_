import requests
import json
import uuid

API_BASE = "http://localhost:5001/api/v1"

def test_full_workflow():
    print("--- 1. DASHBOARD: ASSIGN CASE ---")
    case_payload = {
        "business_name": "Acme Supermart",
        "address": "123 Main St, New Delhi, 110001",
        "gps_location": "28.6139, 77.2090",
        "inspection_type": "Retail Store",
        "assigned_inspector_id": "INS-402",
        "deadline_timestamp": "2026-10-01T12:00:00Z",
        "priority": "HIGH"
    }
    r = requests.post(f"{API_BASE}/cases/assign", json=case_payload)
    print("Assign Response:", r.json())
    case_id = r.json()["case"]["case_id"]

    print("\n--- 2. MOBILE APP: FETCH ASSIGNMENTS ---")
    r = requests.get(f"{API_BASE}/cases/my-assignments?inspector_id=INS-402")
    print("Assignments:", r.json())

    print("\n--- 3. MOBILE APP: SUBMIT FORM A/B REPORT ---")
    # Mocking the payload from the mobile app (OCR + Physical + Models)
    report_payload = {
        "case_id": case_id,
        "declared_quantity": 500.0,
        "ocr_text": {
            "address": "Acme Corp, 123 Industrial Area, Mumbai", # Missing PIN
            "net_quantity_text": "Net Wt: 500 gms", # Illegal unit 'gms'
            "mrp_text": "MRP Rs. 50.00" # Missing 'inclusive of all taxes'
        },
        "spatial_measurements": [
            {"height_mm": 1.8, "width_mm": 1.0, "pdp_area_cm2": 145} # Fails min height 2.5mm
        ],
        "physical_samples": [492.3, 495.0, 480.0, 498.2] # Fails Sixth Schedule Corrected Average
    }
    r = requests.post(f"{API_BASE}/inspections/submit", json=report_payload)
    print("Submit Response:", json.dumps(r.json(), indent=2))
    
    print("\n--- 4. DASHBOARD: REVIEW PACKAGE ---")
    r = requests.get(f"{API_BASE}/cases/{case_id}/review-package")
    print("Review Package Response:", json.dumps(r.json(), indent=2))

if __name__ == "__main__":
    try:
        test_full_workflow()
    except Exception as e:
        print("Failed to run workflow:", e)
