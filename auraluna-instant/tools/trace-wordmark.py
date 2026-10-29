#!/usr/bin/env python3
"""Vectorises the AURA LUNA wordmark (set in Asik) from the official lock-up, so the film uses the real letters.

The lock-up (assets/logo-lockup.jpg, 1100 × 1100, black on white) is a JPEG: its ink is softened a little (blur 0.8 px)
before the 0.5 iso-line is traced (marching squares, tools/contour.py), and the contours are simplified to 0.2 px.
Output: the letters' loops, left to right, in the lock-up's own pixel coordinates (the film places the whole lock-up).

usage: python3 tools/trace-wordmark.py assets/logo-lockup.jpg > assets/wordmark.json
"""
import json, sys
import numpy as np
from PIL import Image, ImageFilter
from contour import contours, simplify, area, flat

X0, Y0, X1, Y1 = 150, 596, 950, 690                      # the wordmark's band in the lock-up (ink: x 167–933, y 607–679)
img = Image.open(sys.argv[1]).convert("L").crop((X0, Y0, X1, Y1)).filter(ImageFilter.GaussianBlur(0.8))
ink = 1 - np.asarray(img).astype(float) / 255
loops = [simplify(l, 0.2) for l in contours(ink)]
loops = [[(p[0] + X0, p[1] + Y0) for p in l] for l in loops if abs(area(l)) > 20]
# group into letters: a loop belongs to the letter whose outer loop contains its first point
outer = sorted([l for l in loops if area(l) != 0], key=lambda l: min(p[0] for p in l))
letters = []
for l in outer:
    x0, x1 = min(p[0] for p in l), max(p[0] for p in l)
    if letters and x0 > letters[-1]["x0"] and x1 < letters[-1]["x1"]: letters[-1]["loops"].append(flat(l)); continue   # a counter
    letters.append({"x0": round(x0, 1), "x1": round(x1, 1), "loops": [flat(l)]})
print(json.dumps({"box": [167, 607, 933, 679], "letters": letters}, separators=(",", ":")))
print("letters", len(letters), [(L["x0"], L["x1"], len(L["loops"])) for L in letters], file=sys.stderr)
