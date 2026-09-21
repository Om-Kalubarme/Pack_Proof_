import cv2
import easyocr
import numpy as np

reader = easyocr.Reader(['en'], gpu=True)
img = cv2.imread(r'd:\ML_Project\runs\predict\debug_gray.jpg')
scaled = cv2.resize(img, (0, 0), fx=3.0, fy=3.0, interpolation=cv2.INTER_LANCZOS4)
results = reader.readtext(scaled, text_threshold=0.15, low_text=0.08, link_threshold=0.15, min_size=5)

print(f"Total detected: {len(results)}")
for b, t, c in results:
    poly = np.array(b) / 3.0
    x1, y1 = int(np.min(poly[:, 0])), int(np.min(poly[:, 1]))
    x2, y2 = int(np.max(poly[:, 0])), int(np.max(poly[:, 1]))
    print(f"Box ({x1},{y1})-({x2},{y2}): '{t}' (conf: {c:.2f})")
