import cv2
import easyocr
import numpy as np

img = cv2.imread('Inhance_image/enhanced_img1bottle.jpeg')
reader = easyocr.Reader(['en'], gpu=False)

# Rotate 90 degrees clockwise
img_90 = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

results = reader.readtext(img_90)
print(f"Found {len(results)} texts on rotated image.")
for res in results:
    print(res[1], res[2])
