#!/usr/bin/env python3
"""Outlines of the opening label « Limit Imagination » in Montserrat (variable), at two weights that interpolate:
"label" = wght 600 (the settings row) and "hero" = wght 800 (the hero word). For "i", "tittle" is the index of its dot
loop: the hero word's orange dot replaces it.

usage: python3 tools/make-glyphs.py assets/montserrat-variable.woff2 > assets/glyphs.json
"""
import json, math, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.basePen import BasePen

LETTERS = "LimtIagno"
N = 10


class Flatten(BasePen):
    def __init__(self, glyphSet):
        super().__init__(glyphSet); self.loops, self.cur = [], None
    def _moveTo(self, p): self.cur = [p]
    def _lineTo(self, p): self.cur.append(p)
    def _curveToOne(self, p1, p2, p3):
        p0 = self._getCurrentPoint()
        for i in range(1, N + 1):
            t = i / N; u = 1 - t
            self.cur.append((u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0], u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]))
    def _qCurveToOne(self, p1, p2):
        p0 = self._getCurrentPoint()
        for i in range(1, N + 1):
            t = i / N; u = 1 - t
            self.cur.append((u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]))
    def _closePath(self):
        if self.cur and len(self.cur) > 2:
            if math.dist(self.cur[0], self.cur[-1]) < 1e-6: self.cur.pop()
            self.loops.append(self.cur)
        self.cur = None
    _endPath = _closePath


def extract(src, wght):
    font = instancer.instantiateVariableFont(TTFont(src), {"wght": wght})
    gs, cmap = font.getGlyphSet(), font.getBestCmap(); out = {}
    for ch in LETTERS:
        g = gs[cmap[ord(ch)]]; fl = Flatten(gs); g.draw(fl)
        out[ch] = {"adv": g.width, "loops": [[round(c, 2) for p in l for c in p] for l in fl.loops]}
    out[" "] = {"adv": gs[cmap[32]].width, "loops": []}
    return out


src = sys.argv[1]
a, b = extract(src, 600), extract(src, 800)
for ch in LETTERS: assert [len(l) for l in a[ch]["loops"]] == [len(l) for l in b[ch]["loops"]], ch
tit = max(range(len(b["i"]["loops"])), key=lambda k: max(b["i"]["loops"][k][1::2]))
cap = max(max(l[1::2]) for l in b["L"]["loops"])
print(json.dumps({"upm": 1000, "capH": cap, "tittle": tit, "label": a, "hero": b}, separators=(",", ":")))
print("cap", cap, "tittle loop", tit, file=sys.stderr)
