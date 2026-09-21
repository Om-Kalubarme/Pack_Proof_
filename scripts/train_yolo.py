"""YOLOv11 Fine-Tuning Script for Packaging PDP & Barcode Detection.

Usage:
  python scripts/train_yolo.py --epochs 100 --batch 16 --imgsz 640
"""

import argparse
from pathlib import Path
import shutil

def setup_dataset_structure(dataset_dir: Path):
    """Ensures dataset directory structure exists."""
    dirs = [
        dataset_dir / "images" / "train",
        dataset_dir / "images" / "val",
        dataset_dir / "labels" / "train",
        dataset_dir / "labels" / "val"
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
    print(f"[+] Dataset directory structure verified at: {dataset_dir}")

def train_yolo(data_yaml: str, epochs: int = 100, imgsz: int = 640, batch: int = 16, base_model: str = "yolo11n.pt"):
    """Fine-tunes YOLOv11 model on custom packaging dataset."""
    try:
        from ultralytics import YOLO
        print(f"\n[+] Initializing YOLOv11 base model: {base_model}...")
        model = YOLO(base_model)

        print(f"[+] Starting fine-tuning for {epochs} epochs (Batch size: {batch}, Image size: {imgsz})...")
        results = model.train(
            data=data_yaml,
            epochs=epochs,
            imgsz=imgsz,
            batch=batch,
            name="yolo11_packaging_run",
            exist_ok=True
        )

        # Save best fine-tuned weights to models/yolo11_packaging.pt
        models_dir = Path("models")
        models_dir.mkdir(exist_ok=True)

        best_weights = Path(results.save_dir) / "weights" / "best.pt"
        target_path = models_dir / "yolo11_packaging.pt"

        if best_weights.is_file():
            shutil.copy(best_weights, target_path)
            print(f"\n[SUCCESS] Fine-tuned weights saved to: '{target_path.resolve()}'")
        else:
            print(f"\n[!] Training finished. Check output runs at: {results.save_dir}")

    except Exception as e:
        print(f"\n[-] Training error: {e}")
        print("    Ensure 'ultralytics' is installed: pip install ultralytics")

def main():
    parser = argparse.ArgumentParser(description="Fine-tune YOLOv11 for PDP & Barcode Detection")
    parser.add_argument("--data", type=str, default="dataset/packaging_dataset.yaml", help="Path to dataset YAML config")
    parser.add_argument("--epochs", type=int, default=100, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size (e.g. 640)")
    parser.add_argument("--model", type=str, default="yolo11n.pt", help="Base YOLO11 model weights (yolo11n.pt, yolo11s.pt, yolo11m.pt)")

    args = parser.parse_args()

    dataset_dir = Path("dataset")
    setup_dataset_structure(dataset_dir)
    train_yolo(
        data_yaml=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        base_model=args.model
    )

if __name__ == "__main__":
    main()
