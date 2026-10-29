#!/usr/bin/env python3
"""Vectorises the Aura Luna monogram (assets/monogram.png, white on transparent, 640 x 300) into polygons.

The mark is built from circle modules on a 150 px grid, so it is traced twice:
  "union"   — the whole mark as drawn (the first and the last frame use it: no seams anywhere);
  "modules" — the six modules it is built from, each traced inside its own cell, so the film can take the mark apart:
              At / Ab (the two quarter discs of the left leaf), S (the half disc), B / C (the quarter discs under it),
              D (the right leaf). Neighbouring modules share their cut edges exactly.
Contours are the alpha = 0.5 iso-line (marching squares, linear interpolation), simplified to 0.05 px.

usage: python3 tools/trace-logo.py assets/monogram.png > assets/monogram.json
"""
import json, sys
import numpy as np
from PIL import Image

CELLS = {"At": (0, 0, 152, 150), "Ab": (0, 150, 152, 300), "S": (152, 0, 455, 150),
         "B": (152, 150, 300.5, 300), "C": (300.5, 150, 455, 300), "D": (455, 0, 640, 300)}


def contours(a, iso=0.5):
    """marching squares on pixel centres (i + 0.5, j + 0.5); returns closed loops [(x, y), …]"""
    a = np.pad(a, 1)                                   # zero border: every contour closes
    H, W = a.shape
    pt = lambda i, j: (i - 0.5, j - 0.5)               # padded index → pixel-centre coordinate
    def cross(p, q, vp, vq):
        k = (iso - vp) / (vq - vp)
        return (round(p[0] + (q[0] - p[0]) * k, 4), round(p[1] + (q[1] - p[1]) * k, 4))
    segs = []
    for j in range(H - 1):
        for i in range(W - 1):
            v = [a[j, i], a[j, i + 1], a[j + 1, i + 1], a[j + 1, i]]   # tl tr br bl
            c = sum(1 << k for k in range(4) if v[k] > iso)
            if c in (0, 15): continue
            P = [pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1)]
            e = [cross(P[k], P[(k + 1) % 4], v[k], v[(k + 1) % 4]) if (v[k] > iso) != (v[(k + 1) % 4] > iso) else None for k in range(4)]
            ed = [k for k in range(4) if e[k] is not None]
            if len(ed) == 2: segs.append((e[ed[0]], e[ed[1]]))
            else:                                       # saddle: decide with the centre value
                centre = sum(v) / 4 > iso
                if (c == 5) == centre: segs += [(e[0], e[1]), (e[2], e[3])]
                else: segs += [(e[3], e[0]), (e[1], e[2])]
    adj = {}
    for s in segs:
        for p, q in (s, s[::-1]): adj.setdefault(p, []).append(q)
    loops, used = [], set()
    for s in segs:
        if (s[0], s[1]) in used: continue
        loop, prev, cur = [s[0]], s[0], s[1]; used.add((s[0], s[1])); used.add((s[1], s[0]))
        while cur != loop[0]:
            loop.append(cur)
            nxt = [q for q in adj[cur] if (cur, q) not in used]
            if not nxt: break
            used.add((cur, nxt[0])); used.add((nxt[0], cur)); prev, cur = cur, nxt[0]
        if len(loop) > 8: loops.append(loop)
    return loops


def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = np.array(pts[0]), np.array(pts[-1]); d = b - a; n = np.hypot(*d) or 1.0
    dist = [abs(d[0] * (p[1] - a[1]) - d[1] * (p[0] - a[0])) / n for p in pts]
    k = int(np.argmax(dist))
    if dist[k] <= eps: return [pts[0], pts[-1]]
    return rdp(pts[:k + 1], eps)[:-1] + rdp(pts[k:], eps)


def simplify(loop, eps=0.05):
    """closed loop: split it at the point farthest from its first point, simplify both halves"""
    p0 = loop[0]; k = max(range(len(loop)), key=lambda i: (loop[i][0] - p0[0]) ** 2 + (loop[i][1] - p0[1]) ** 2)
    return rdp(loop[:k + 1], eps)[:-1] + rdp(loop[k:] + [p0], eps)[:-1]


def area(l): return sum(l[i][0] * l[(i + 1) % len(l)][1] - l[(i + 1) % len(l)][0] * l[i][1] for i in range(len(l))) / 2
def flat(l): return [round(c, 2) for p in l for c in p]


alpha = np.asarray(Image.open(sys.argv[1]).convert("RGBA"))[..., 3].astype(float) / 255
H, W = alpha.shape
xs, ys = np.meshgrid(np.arange(W) + 0.5, np.arange(H) + 0.5)
out = {"w": W, "h": H, "union": [flat(simplify(l)) for l in contours(alpha)], "modules": {}}
for k, (x0, y0, x1, y1) in CELLS.items():
    m = alpha * ((xs >= x0) & (xs < x1) & (ys >= y0) & (ys < y1))
    ls = sorted((simplify(l) for l in contours(m)), key=lambda l: -abs(area(l)))
    big = ls[0]
    cx = sum(p[0] for p in big) / len(big); cy = sum(p[1] for p in big) / len(big)
    out["modules"][k] = {"loop": flat(big), "c": [round(cx, 2), round(cy, 2)], "area": round(abs(area(big)), 1)}
    print(k, "points", len(big), "area", round(abs(area(big))), "dropped loops", len(ls) - 1, file=sys.stderr)
print("union loops", [len(l) // 2 for l in out["union"]], file=sys.stderr)
print(json.dumps(out, separators=(",", ":")))
