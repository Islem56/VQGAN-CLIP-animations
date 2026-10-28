#!/usr/bin/env python3
"""Extracts the letters of the showreel from Montserrat (variable, wght 100-900) as flattened outlines.

Three instances of the weight axis:
  "w62"  = wght 200 (thin)   and  "w125" = wght 900 (black): the kinetic type interpolates between them, so a
           word can thicken from a hairline to a slab while it moves (the keys keep the names of the first version).
  "wK"   = wght 600: the DAR.COM wordmark (flat title AND extruded 3D letters, so the last frame is exactly the first).

All instances of one letter share the same structure (variable font), so JS can interpolate them.

usage: python3 tools/make-glyphs.py <montserrat-variable.woff2> > assets/glyphs.json
"""
import json, math, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.basePen import BasePen

KINETIC = "BRANDSHOTPUILCM"   # letters of the kinetic words (+ the I that floods)
WORDMARK = "DARCOM."          # the DAR.COM wordmark
N = 10                        # segments per curve (fixed, so every instance keeps the same point count)


class Flatten(BasePen):
    def __init__(self, glyphSet):
        super().__init__(glyphSet)
        self.loops, self.cur = [], None

    def _moveTo(self, p): self.cur = [p]
    def _lineTo(self, p): self.cur.append(p)

    def _curveToOne(self, p1, p2, p3):
        p0 = self._getCurrentPoint()
        for i in range(1, N + 1):
            t = i / N; u = 1 - t
            self.cur.append((u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
                             u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]))

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


def extract(src, wght, letters):
    font = instancer.instantiateVariableFont(TTFont(src), {"wght": wght})
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    out = {}
    for ch in letters:
        g = gs[cmap[ord(ch)]]
        fl = Flatten(gs); g.draw(fl)
        out[ch] = {"adv": g.width, "loops": [[round(c, 2) for p in l for c in p] for l in fl.loops]}
    return out


src = sys.argv[1]
thin, black, mid = extract(src, 200, KINETIC), extract(src, 900, KINETIC), extract(src, 600, WORDMARK)
for ch in KINETIC:  # both instances must have exactly the same structure, or they cannot be interpolated
    assert [len(l) for l in thin[ch]["loops"]] == [len(l) for l in black[ch]["loops"]], ch
cap = max(max(l[1::2]) for l in mid["D"]["loops"])
cap_black = max(max(l[1::2]) for l in black["B"]["loops"])
print(json.dumps({"upm": 1000, "capH": cap_black, "capK": cap, "w62": thin, "w125": black, "wK": mid}, separators=(",", ":")))
print(f"cap height: black {cap_black}, wordmark {cap}; wordmark advances: { {c: mid[c]['adv'] for c in WORDMARK} }", file=sys.stderr)
