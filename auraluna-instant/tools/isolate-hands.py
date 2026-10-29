#!/usr/bin/env python3
"""Cuts the two hands of the brand key visual out of a frame, as two layers on pure black (composited with `screen`).

  1. a seed mask (luminance > 40), its largest blob left of the gap (the human hand) and right of it (the robot hand);
  2. holes filled, grown by 18 px and feathered, so the dark parts of each hand stay inside its matte;
  3. the frame's black point lifted (14/255) so the band behind the hands and its faint light columns go to black.
The fingertip glows are kept (they belong to the photograph); the stars and the spark are redrawn by the film.

usage: python3 tools/isolate-hands.py assets/hands-source.png assets/hand-human.jpg assets/hand-robot.jpg
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out_l, out_r = sys.argv[1:4]
img = Image.open(src).convert("RGB"); a = np.asarray(img).astype(float); H, W = a.shape[:2]
lum = a.mean(axis=2)
S = 4                                                       # label at quarter resolution
small = np.asarray(Image.fromarray((lum > 40).astype(np.uint8) * 255).resize((W // S, H // S), Image.BOX)) > 60


def blobs(m):
    lab = np.zeros(m.shape, int); n = 0; sizes = {}
    for y, x in zip(*np.nonzero(m)):
        if lab[y, x]: continue
        n += 1; st = [(y, x)]; lab[y, x] = n; c = 0
        while st:
            cy, cx = st.pop(); c += 1
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < m.shape[0] and 0 <= xx < m.shape[1] and m[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; st.append((yy, xx))
        sizes[n] = c
    return lab, sizes


def fill_holes(m):
    """everything not reachable from the border through background is inside"""
    h, w = m.shape; seen = np.zeros_like(m); st = [(y, x) for y in range(h) for x in (0, w - 1)] + [(y, x) for x in range(w) for y in (0, h - 1)]
    for p in st: seen[p] = not m[p]
    st = [p for p in st if seen[p]]
    while st:
        y, x = st.pop()
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < h and 0 <= xx < w and not seen[yy, xx] and not m[yy, xx]: seen[yy, xx] = True; st.append((yy, xx))
    return ~seen


lab, sizes = blobs(small)
gap = (760 // S, 1150 // S)


def hand_mask(side):
    ids = [k for k in sizes if ((np.nonzero(lab == k)[1].max() < gap[0] + 4) if side == "L" else (np.nonzero(lab == k)[1].min() > gap[1] - 4))]
    k = max(ids, key=lambda k: sizes[k]); m = lab == k
    # pull in the smaller blobs that touch the hand once it is grown a little (fingers split by shadow)
    grown = np.asarray(Image.fromarray(m.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(7))) > 0
    for j in ids:
        if j != k and (grown & (lab == j)).any(): m |= lab == j
    m = np.asarray(Image.fromarray(m.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(5))) > 0
    m = fill_holes(m)
    big = Image.fromarray(m.astype(np.uint8) * 255).resize((W, H), Image.BILINEAR).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(9))
    return np.asarray(big).astype(float) / 255


lifted = np.clip((a - 14) * 255 / (255 - 14), 0, 255)
for side, path in (("L", out_l), ("R", out_r)):
    m = hand_mask(side)
    ys, xs = np.nonzero(m > 0.01); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    layer = (lifted * m[..., None])[y0:y1, x0:x1].astype(np.uint8)
    Image.fromarray(layer).save(path, quality=92, subsampling=0)
    print(side, "box", x0, y0, x1, y1, file=sys.stderr)
