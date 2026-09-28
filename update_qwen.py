with open("/Users/om_k/Downloads/ML_Project/scripts/predict_video.py", "r") as f:
    content = f.read()

import re
pattern = re.compile(r"## 4\. Format Requirements(.*?)## 5\. PCR 2011", re.DOTALL)
replacement = """## 4. Format Requirements
You must output a strictly valid JSON object exactly matching the following schema.
Do NOT attempt to evaluate the legal rules yourself. Simply extract the exact text found.

{
  "brand_name": "string or null",
  "product_name": "string or null",
  "manufacturer_name": "string or null",
  "manufacturer_address": "string or null",
  "packer_name": "string or null",
  "packer_address": "string or null",
  "importer_name": "string or null",
  "importer_address": "string or null",
  "marketed_by": "string or null",
  "net_quantity_value": float or null,
  "net_quantity_unit": "string or null",
  "mrp": float or null,
  "currency": "INR",
  "manufacture_month": "string or null",
  "manufacture_year": "string or null",
  "prepack_month": "string or null",
  "prepack_year": "string or null",
  "import_month": "string or null",
  "import_year": "string or null",
  "dimensions": ["list of strings"],
  "consumer_contact": {
      "name": "string or null",
      "address": "string or null",
      "phone": "string or null",
      "email": "string or null"
  },
  "when_packed": boolean,
  "batch_number": "string or null",
  "lot_number": "string or null",
  "expiry_date": "string or null",
  "best_before": "string or null",
  "use_before": "string or null",
  "languages_detected": ["list"],
  "stickers_detected": ["list of strings"],
  "text_blocks": ["list of raw text"],
  "dietary_logo": "VEG or NON_VEG or null",
  "barcode": "string or null"
}

"""

new_content = re.sub(r"## 4\. Format Requirements.*?\]\n\}", replacement, content, flags=re.DOTALL)

# Remove the Rule Engine section from Qwen prompt since Python does it now
new_content = re.sub(r"## 5\. PCR 2011 Legal Metrology Rule Engine.*?\(e\.g\., dual MRP, missing PDP declarations\)\.", "", new_content, flags=re.DOTALL)

with open("/Users/om_k/Downloads/ML_Project/scripts/predict_video.py", "w") as f:
    f.write(new_content)
print("Updated predict_video.py")
