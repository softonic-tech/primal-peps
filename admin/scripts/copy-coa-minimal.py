#!/usr/bin/env python3
"""
Copy an existing COA PDF and change ONLY the vial image, product name,
and quantity. Everything else stays identical.

Usage:
  python3 admin/scripts/copy-coa-minimal.py klow
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]

# Copy from the cleaned GHK-Cu COA — same layout, same lab data throughout.
TEMPLATE_PDF = ROOT / "GHK-Cu_50MG_COA.pdf"

JOBS = {
    "klow": {
        "output": ROOT / "KLOW_80MG_COA.pdf",
        "product_name": "KLOW",
        "page_title": "KLOW 80MG",
        "quantity": "80MG",
        "image": ROOT / "klow-80mg-transparent.png",
        # strings baked into the template to cover
        "template_product": "GHK-Cu",
        "template_quantity": "50MG",
    },
}


def load_font(size: int, bold: bool = False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in paths:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def cover(draw, box, color=(252, 252, 252)):
    draw.rectangle(box, fill=color)


def center_text(draw, text, y, width, font, fill=(0, 0, 0)):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, y), text, font=font, fill=fill)


def left_text(draw, text, x, y, font, fill=(0, 0, 0)):
    draw.text((x, y), text, font=font, fill=fill)


def paste_vial(page: Image.Image, vial_path: Path) -> None:
    vial = Image.open(vial_path).convert("RGBA")
    target_h = 300
    scale = target_h / vial.height
    target_w = int(vial.width * scale)
    vial = vial.resize((target_w, target_h), Image.Resampling.LANCZOS)
    page.paste(vial, (900, 318), vial)


def edit_page1(page: Image.Image, cfg: dict) -> Image.Image:
    page = page.copy().convert("RGB")
    draw = ImageDraw.Draw(page)
    w, _ = page.size

    title_font = load_font(34, bold=True)
    body_font = load_font(18)
    small_font = load_font(17)
    green = (34, 139, 34)

    # Product title (replaces "GHK-Cu 50MG")
    cover(draw, (420, 220, 860, 282))
    center_text(draw, cfg["page_title"], 236, w, title_font)

    # Spec table — compound + quantity rows only
    cover(draw, (195, 383, 395, 412))
    left_text(draw, cfg["product_name"], 230, 390, body_font)

    cover(draw, (195, 423, 315, 452))
    left_text(draw, cfg["quantity"], 230, 430, body_font, fill=green)

    # Vial photo
    cover(draw, (855, 298, 1248, 625))
    if cfg["image"].exists():
        paste_vial(page, cfg["image"])

    # HPLC peak label
    cover(draw, (635, 706, 770, 730))
    left_text(draw, cfg["product_name"], 648, 710, small_font)

    # Peak list compound name
    cover(draw, (820, 1108, 970, 1128))
    left_text(draw, cfg["product_name"], 848, 1112, small_font, fill=green)

    # Measured quantity (quantification block)
    cover(draw, (50, 1152, 500, 1178))
    left_text(draw, f"Measured quantity {cfg['quantity']}/vial", 65, 1158, body_font)

    return page


def edit_page2(page: Image.Image, cfg: dict) -> Image.Image:
    page = page.copy().convert("RGB")
    draw = ImageDraw.Draw(page)
    w, _ = page.size

    title_font = load_font(34, bold=True)
    small_font = load_font(17)
    green = (34, 139, 34)

    cover(draw, (395, 204, 875, 248))
    center_text(draw, cfg["page_title"], 212, w, title_font)

    # Replace only the green/black product name after "Detection Assignment:"
    cover(draw, (418, 646, 518, 670))
    left_text(draw, cfg["product_name"], 425, 652, small_font, fill=green)

    return page


def render_pages(pdf_path: Path, tmp: Path) -> list[Path]:
    prefix = tmp / "page"
    subprocess.run(
        ["pdftoppm", "-png", "-r", "150", str(pdf_path), str(prefix)],
        check=True,
        capture_output=True,
    )
    pages = sorted(tmp.glob("page-*.png"))
    if len(pages) < 2:
        raise RuntimeError(f"Expected 2 pages in {pdf_path}")
    return pages[:2]


def save_pdf(pages: list[Image.Image], out_pdf: Path) -> None:
    rgb = [p.convert("RGB") for p in pages]
    rgb[0].save(out_pdf, "PDF", resolution=150.0, save_all=True, append_images=rgb[1:])


def generate(key: str) -> Path:
    if key not in JOBS:
        raise SystemExit(f"Unknown product '{key}'. Options: {', '.join(JOBS)}")
    if not TEMPLATE_PDF.exists():
        raise SystemExit(f"Template missing: {TEMPLATE_PDF}")

    cfg = JOBS[key]
    if not cfg["image"].exists():
        raise SystemExit(f"Vial image missing: {cfg['image']}")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        pages = render_pages(TEMPLATE_PDF, tmp)
        edited = [
            edit_page1(Image.open(pages[0]), cfg),
            edit_page2(Image.open(pages[1]), cfg),
        ]
        save_pdf(edited, cfg["output"])

    return cfg["output"]


def main() -> None:
    key = sys.argv[1] if len(sys.argv) > 1 else "klow"
    out = generate(key)
    print(f"Created {out}")


if __name__ == "__main__":
    main()
