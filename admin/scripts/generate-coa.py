#!/usr/bin/env python3
"""
Generate a product COA PDF from the BPC157 template by swapping
product name, quantity, identifiers, and vial image.

Usage:
  python3 admin/scripts/generate-coa.py reta
  python3 admin/scripts/generate-coa.py bpc157
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE_PDF = ROOT / "BPC157_COA.pdf"

PRODUCTS = {
    "reta": {
        "output": ROOT / "RETA_COA.pdf",
        "display_name": "Retatrutide",
        "short_name": "Retatrutide",
        "quantity": "10 mg",
        "compound": "Retatrutide",
        "cas": "2381089-83-2",
        "pubchem": "171390338",
        "lot": "PP-2026-001",
        "purity": "99.78%",
        "image": ROOT / "reta-10mg.png",
        "page2_title": "Retatrutide 10mg",
    },
    "bpc157": {
        "output": ROOT / "BPC157_COA.pdf",
        "display_name": "BPC 157",
        "short_name": "BPC 157",
        "quantity": "10 mg",
        "compound": "BPC 157",
        "cas": "137525-51-0",
        "pubchem": "9941957",
        "lot": "2026-08-23",
        "purity": "99.78%",
        "image": ROOT / "bpc-157-10mg-transparent.png",
        "page2_title": "BPC 157 10mg",
    },
}


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size=size)
    return ImageFont.load_default()


def cover(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], color=(252, 252, 252)) -> None:
    draw.rectangle(box, fill=color)


def center_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    width: int,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    fill=(0, 0, 0),
) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (width - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)


def left_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    fill=(0, 0, 0),
) -> None:
    draw.text((x, y), text, font=font, fill=fill)


def label_value(
    draw: ImageDraw.ImageDraw,
    label: str,
    value: str,
    y: int,
    label_x: int,
    value_x: int,
    font_label,
    font_value,
    value_fill=(0, 0, 0),
) -> None:
    left_text(draw, label, label_x, y, font_label)
    left_text(draw, value, value_x, y, font_value, fill=value_fill)


def paste_vial(page: Image.Image, vial_path: Path) -> None:
    vial = Image.open(vial_path).convert("RGBA")
    target_h = 248
    scale = target_h / vial.height
    target_w = int(vial.width * scale)
    vial = vial.resize((target_w, target_h), Image.Resampling.LANCZOS)
    page.paste(vial, (748, 262), vial)


def edit_page1(page: Image.Image, cfg: dict) -> Image.Image:
    page = page.copy().convert("RGB")
    draw = ImageDraw.Draw(page)
    w, _ = page.size

    title_font = load_font(30, bold=True)
    qty_font = load_font(22)
    body_font = load_font(16)
    body_bold = load_font(16, bold=True)
    small_font = load_font(15)
    green = (34, 139, 34)

    cover(draw, (250, 145, 810, 235))
    center_text(draw, cfg["display_name"], 152, w, title_font)
    center_text(draw, cfg["quantity"], 195, w, qty_font)

    cover(draw, (48, 255, 435, 450))
    label_value(draw, "Compound:", cfg["compound"], 270, 58, 175, body_bold, body_font)
    label_value(draw, "Lot number:", cfg["lot"], 300, 58, 175, body_bold, body_font)
    label_value(draw, "Analysis date:", "2026-08-16", 330, 58, 175, body_bold, body_font)
    label_value(draw, "Purity %:", cfg["purity"], 360, 58, 175, body_bold, body_font, green)
    label_value(draw, "Quantity:", cfg["quantity"], 390, 58, 175, body_bold, body_font, green)
    label_value(draw, "Method:", "HPLC-UV-MS", 420, 58, 175, body_bold, body_font)

    cover(draw, (440, 255, 690, 380))
    label_value(draw, "Client:", "Primalpeps", 270, 450, 545, body_bold, body_font)
    label_value(draw, "CAS number:", cfg["cas"], 300, 450, 545, body_bold, body_font)
    label_value(draw, "PubChem CID:", cfg["pubchem"], 330, 450, 545, body_bold, body_font)

    cover(draw, (700, 245, 1015, 525))
    if cfg["image"].exists():
        paste_vial(page, cfg["image"])

    cover(draw, (500, 665, 640, 695))
    left_text(draw, cfg["short_name"], 505, 670, small_font)

    cover(draw, (650, 965, 900, 1012))
    left_text(draw, cfg["short_name"], 695, 978, small_font, fill=green)

    cover(draw, (48, 1038, 430, 1070))
    left_text(draw, f"Measured quantity: {cfg['quantity']}/vial", 58, 1042, body_font)

    return page


def edit_page2(page: Image.Image, cfg: dict) -> Image.Image:
    page = page.copy().convert("RGB")
    draw = ImageDraw.Draw(page)
    w, _ = page.size

    title_font = load_font(30, bold=True)
    body_font = load_font(16)
    body_bold = load_font(16, bold=True)
    small_font = load_font(16)
    green = (34, 139, 34)

    # Title + ghost text from template
    cover(draw, (180, 125, 880, 250))
    center_text(draw, cfg["page2_title"], 145, w, title_font)
    label_value(draw, "PubChem CID:", cfg["pubchem"], 188, 58, 190, body_bold, body_font)
    label_value(draw, "CAS Number:", cfg["cas"], 218, 58, 190, body_bold, body_font)

    # Detection assignment above mass spectrum graph
    cover(draw, (35, 500, 430, 545))
    left_text(draw, "Detection Assignment:", 58, 518, body_bold)
    left_text(draw, cfg["short_name"], 265, 518, small_font, fill=green)

    return page


def extract_pages(pdf_path: Path, tmp: Path) -> list[Path]:
    prefix = tmp / "page"
    subprocess.run(
        ["pdfimages", "-png", str(pdf_path), str(prefix)],
        check=True,
        capture_output=True,
    )
    pages = sorted(tmp.glob("page-*.png"))
    if len(pages) < 2:
        raise RuntimeError(f"Expected 2 page images from {pdf_path}, got {len(pages)}")
    return pages[:2]


def images_to_pdf(image_paths: list[Path], out_pdf: Path) -> None:
    pages = [Image.open(p).convert("RGB") for p in image_paths]
    first, rest = pages[0], pages[1:]
    first.save(out_pdf, "PDF", resolution=150.0, save_all=True, append_images=rest)


def generate(product_key: str) -> Path:
    if product_key not in PRODUCTS:
        raise SystemExit(f"Unknown product '{product_key}'. Choose from: {', '.join(PRODUCTS)}")
    if not TEMPLATE_PDF.exists():
        raise SystemExit(f"Template not found: {TEMPLATE_PDF}")

    cfg = PRODUCTS[product_key]
    if not cfg["image"].exists():
        raise SystemExit(f"Product image not found: {cfg['image']}")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        pages = extract_pages(TEMPLATE_PDF, tmp)
        edited = [
            edit_page1(Image.open(pages[0]), cfg),
            edit_page2(Image.open(pages[1]), cfg),
        ]
        edited_paths = []
        for i, img in enumerate(edited, start=1):
            path = tmp / f"edited-{i}.png"
            img.save(path, "PNG")
            edited_paths.append(path)
        images_to_pdf(edited_paths, cfg["output"])

    return cfg["output"]


def main() -> None:
    key = sys.argv[1] if len(sys.argv) > 1 else "reta"
    out = generate(key)
    print(f"Created {out}")


if __name__ == "__main__":
    main()
