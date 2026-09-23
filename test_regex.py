import re

texts = [
    '8 1901491"001168"',
    '8 1901491\\"001168\\"',
    "8 1901491\"001168\"",
    "N1 - PepsiCo India Holdings Pvt. Ltd., Village Channo"
]

for text in texts:
    t = text.lower()
    t_digits = re.sub(r'\D', '', t)
    clean_t = t.replace(" ", "").replace('"', '').replace("'", "")
    
    match = any(k in t for k in ["barcode", "ean", "upc", "ivm-", "389-"]) or (
        8 <= len(t_digits) <= 14 and len(t_digits) >= len(clean_t) - 2)
        
    print(f"TEXT: {repr(t)}")
    print(f"  t_digits: {repr(t_digits)} (len {len(t_digits)})")
    print(f"  clean_t: {repr(clean_t)} (len {len(clean_t)})")
    print(f"  MATCH BARCODE: {match}")
