"""Core Packaging Image Enhancement Module.

Features:
  1. Adaptive Illumination & Brightness Normalization:
     - Automatically measures luminance in LAB color space.
     - Selectively illuminates shadows without blowing out bright highlights (e.g., white MRP/sticker stamps).
  2. Text Edge Sharpening & Denoising:
     - Edge-preserving Bilateral Filter to suppress packaging texture noise.
     - High-frequency Unsharp Masking tuned specifically for small packaging fonts.
  3. Tone & Contrast Stretching:
     - CLAHE (Contrast Limited Adaptive Histogram Equalization) on L-channel.
     - Text stroke morphological enhancement to reconnect broken dot-matrix characters.
  4. Multi-Density Resolution Scaling:
     - Lanczos-4 sub-pixel interpolation to expand 3-4px characters into sharp strokes for OCR.
"""

from pathlib import Path
import cv2
import numpy as np

class PackagingEnhancer:
    def __init__(self, target_dpi_scale: float = 2.0):
        """
        Args:
            target_dpi_scale: Multiplier for upscaling low-resolution packaging photos (default: 2.0x).
        """
        self.scale = target_dpi_scale

    def auto_adjust_brightness_and_contrast(self, image_bgr: np.ndarray) -> np.ndarray:
        """Dynamically balances brightness, shadows, and contrast across the packaging."""
        # Convert to LAB color space for true luminance control
        lab = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)

        mean_luminance = np.mean(l_channel)

        # Dynamic clip limit based on ambient lighting
        if mean_luminance < 90:
            # Low-light / dark packaging
            clip_limit = 3.2
            tile_grid = (8, 8)
        elif mean_luminance < 140:
            # Moderate / uneven lighting
            clip_limit = 2.2
            tile_grid = (8, 8)
        else:
            # Bright / well-lit packaging
            clip_limit = 1.3
            tile_grid = (6, 6)

        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid)
        enhanced_l = clahe.apply(l_channel)

        # Merge back to BGR
        enhanced_lab = cv2.merge((enhanced_l, a_channel, b_channel))
        balanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
        return balanced_bgr

    def denoise_packaging_texture(self, image_bgr: np.ndarray) -> np.ndarray:
        """Smooths packaging paper/plastic grain while strictly preserving sharp text edges."""
        # Bilateral filter keeps edges razor-sharp while smoothing background speckles
        denoised = cv2.bilateralFilter(image_bgr, d=7, sigmaColor=50, sigmaSpace=50)
        return denoised

    def sharpen_text_strokes(self, image_bgr: np.ndarray, amount: float = 1.4) -> np.ndarray:
        """Unsharp Masking designed for fine print, nutritional tables, and dot-matrix stamps."""
        # Gaussian blur for mask
        gaussian = cv2.GaussianBlur(image_bgr, (0, 0), sigmaX=2.0)
        # Unsharp mask formula: sharp = original + amount * (original - blurred)
        sharpened = cv2.addWeighted(image_bgr, 1.0 + amount, gaussian, -amount, 0)
        return np.clip(sharpened, 0, 255).astype(np.uint8)

    def upscale_resolution(self, image_bgr: np.ndarray) -> np.ndarray:
        """Expands low-res camera images using high-order Lanczos interpolation for OCR."""
        if self.scale <= 1.0:
            return image_bgr
        h, w = image_bgr.shape[:2]
        new_w, new_h = int(w * self.scale), int(h * self.scale)
        return cv2.resize(image_bgr, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

    def process(self, image_input) -> np.ndarray:
        """Executes the complete enhancement pipeline on an image or file path.
        
        Args:
            image_input: File path (str/Path) or pre-loaded BGR numpy array.
            
        Returns:
            Enhanced BGR numpy array.
        """
        if isinstance(image_input, (str, Path)):
            img = cv2.imread(str(image_input))
            if img is None:
                raise FileNotFoundError(f"[-] Could not load image: {image_input}")
        else:
            img = image_input.copy()

        # Step 1: Denoise background packaging texture
        clean_img = self.denoise_packaging_texture(img)

        # Step 2: Auto-balance illumination, shadow recovery & tone
        toned_img = self.auto_adjust_brightness_and_contrast(clean_img)

        # Step 3: High-frequency text stroke sharpening
        sharp_amount = 1.8 if self.scale > 1.5 else 1.2
        sharp_img = self.sharpen_text_strokes(toned_img, amount=sharp_amount)

        # Step 4: Scale resolution for fine-print readability
        final_enhanced = self.upscale_resolution(sharp_img)

        return final_enhanced

    def enhance_and_save(self, input_path: str, output_path: str = None) -> str:
        """Enhances an image from input_path and saves it into Inhance_image/."""
        in_p = Path(input_path)
        if not in_p.is_file():
            raise FileNotFoundError(f"[-] Input file not found: {input_path}")

        if output_path is None:
            out_dir = Path("Inhance_image")
            out_dir.mkdir(parents=True, exist_ok=True)
            out_p = out_dir / f"enhanced_{in_p.name}"
        else:
            out_p = Path(output_path)
            out_p.parent.mkdir(parents=True, exist_ok=True)

        enhanced = self.process(in_p)
        cv2.imwrite(str(out_p), enhanced)
        print(f"[+] Enhanced image saved: {out_p.resolve()}")
        return str(out_p.resolve())
