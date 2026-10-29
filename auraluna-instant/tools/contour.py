"""Shared contour tools: marching squares on a coverage image, Ramer–Douglas–Peucker simplification."""
import numpy as np


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
