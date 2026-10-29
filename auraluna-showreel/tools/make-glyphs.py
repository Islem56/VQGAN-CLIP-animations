#!/usr/bin/env python3
"""Extracts the letters of the showreel from Jost (variable, wght 100-900) as flattened outlines.

  "thin" = wght 100 and "med" = wght 500: the kinetic words interpolate between them (a hairline that gains weight
           as it lands). Every instance of one letter has the same structure (variable font), so JS can interpolate.
  "mark" = wght 300: the AURA LUNA wordmark (the first frame and the last frame).

usage: python3 tools/make-glyphs.py <jost-variable.woff2> > assets/glyphs.json
"""
import json, math, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.basePen import BasePen

KINETIC = "IDENTÉMAGOUVRS"    # IDENTITÉ · IMAGE · MOTION · UNIVERS
WORDMARK = "AURLN"            # AURA LUNA
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
thin, med, mark = extract(src, 100, KINETIC), extract(src, 500, KINETIC), extract(src, 300, WORDMARK)
for ch in KINETIC:  # both instances must have exactly the same structure, or they cannot be interpolated
    assert [len(l) for l in thin[ch]["loops"]] == [len(l) for l in med[ch]["loops"]], ch
cap = max(max(l[1::2]) for l in med["I"]["loops"])
print(json.dumps({"upm": 1000, "capH": cap, "thin": thin, "med": med, "mark": mark}, separators=(",", ":")))
print(f"cap height {cap}; wordmark advances { {c: mark[c]['adv'] for c in WORDMARK} }", file=sys.stderr)
