"""Command-line runner for packaging image enhancement.

Usage:
  # Enhance a single packaging image:
  python Inhance_image/run_enhance.py --input "path/to/my_packaging.jpg"

  # Enhance and set custom scale multiplier (e.g. 2.5x for very small text):
  python Inhance_image/run_enhance.py --input "path/to/my_packaging.jpg" --scale 2.5

  # Enhance all images in a folder:
  python Inhance_image/run_enhance.py --folder "path/to/folder"
"""

import argparse
from pathlib import Path
import sys

# Ensure Inhance_image directory is on sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.append(str(CURRENT_DIR))

from enhancer import PackagingEnhancer

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

def enhance_single_file(input_file: str, scale: float = 2.0, output_file: str = None):
    p = Path(input_file)
    if not p.is_file():
        print(f"[-] File not found: {input_file}")
        return None

    out_dir = Path("Inhance_image")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    if output_file is None:
        target_path = out_dir / f"enhanced_{p.name}"
    else:
        target_path = Path(output_file)

    print(f"\n[+] Enhancing packaging image: {p.name} (Scale: {scale}x)...")
    enhancer = PackagingEnhancer(target_dpi_scale=scale)
    saved_path = enhancer.enhance_and_save(str(p), str(target_path))
    return saved_path

def enhance_folder(folder_path: str, scale: float = 2.0):
    f_path = Path(folder_path)
    if not f_path.is_dir():
        print(f"[-] Folder not found: {folder_path}")
        return

    out_dir = Path("Inhance_image")
    out_dir.mkdir(parents=True, exist_ok=True)

    enhancer = PackagingEnhancer(target_dpi_scale=scale)
    count = 0
    for img_p in f_path.iterdir():
        if img_p.suffix.lower() in SUPPORTED_EXTENSIONS and not img_p.name.startswith("enhanced_"):
            target_path = out_dir / f"enhanced_{img_p.name}"
            enhancer.enhance_and_save(str(img_p), str(target_path))
            count += 1

    print(f"\n[+] Successfully enhanced {count} images in {out_dir.resolve()}")

def main():
    parser = argparse.ArgumentParser(description="Packaging Image Enhancer (Brightness, Sharpening, Contrast)")
    parser.add_argument("--input", type=str, help="Path to single packaging image")
    parser.add_argument("--folder", type=str, help="Path to folder containing multiple images")
    parser.add_argument("--scale", type=float, default=2.0, help="Resolution scale factor (default: 2.0)")
    parser.add_argument("--output", type=str, default=None, help="Custom output image path")

    args = parser.parse_args()

    if args.input:
        enhance_single_file(args.input, args.scale, args.output)
    elif args.folder:
        enhance_folder(args.folder, args.scale)
    else:
        print("[-] Please specify --input <image_path> or --folder <folder_path>")
        print("    Example: python Inhance_image/run_enhance.py --input C:\\path\\to\\packaging.jpg")

if __name__ == "__main__":
    main()
