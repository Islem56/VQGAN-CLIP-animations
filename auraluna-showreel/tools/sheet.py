#!/usr/bin/env python3
"""Contact sheet of a folder of frames:  python3 tools/sheet.py <dir> <out.png> [cols=3] [tile_width=640]"""
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont

d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 640
files = sorted(glob.glob(os.path.join(d, "*.png")))
th = round(tw * 9 / 16)
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * th), (40, 40, 40))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
except Exception:
    font = ImageFont.load_default()
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * th
    sheet.paste(im, (x, y))
    label = os.path.basename(f)[1:-4]
    draw.rectangle([x, y, x + 120, y + 30], fill=(0, 0, 0))
    draw.text((x + 6, y + 3), "t=" + label.lstrip("0") if label.strip("0.") else "t=0", fill=(255, 255, 255), font=font)
    draw.rectangle([x, y, x + tw - 1, y + th - 1], outline=(90, 90, 90))
sheet.save(out)
print(out, sheet.size)
