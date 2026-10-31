// The monogram's construction, drawn like a logo construction sheet: the module grid (top, middle and base lines,
// the module divisions) and one compass arc per curve of the logo — fitted to the traced outline (within 2 units)
// and drawn once, slightly past each end. No full circles: they crossed the letters and doubled near-identical curves.
import React from "react";
import { lerp } from "../lib";

/** [cx, cy, r, from°, to°] in monogram units (640 × 300, y down), angles clockwise from +x */
const ARCS: [number, number, number, number, number][] = [
  [11.2, 142.6, 140.6, -97.8, 4.6],      // At — the left L, top
  [141.3, 157.2, 140.4, 84.0, 183.7],    // Ab — the left L, bottom
  [303.4, 152.1, 153.2, -182.7, 2.7],    // S — the dome of the A
  [294.9, 156.0, 142.2, 84.6, 185.7],    // B — the A's left leg
  [442.1, 156.0, 142.1, 84.7, 182.9],    // C — the A's right leg
  [584.9, 261.3, 126.3, -194.3, -103.5], // D — the right L, left edge
  [503.9, 182.0, 132.4, -15.2, 74.7],    // D — the right L, right edge
];
const LINES_Y = [0, 150, 300], LINES_X = [0, 152, 300, 455, 640];

export const Construction: React.FC<{ x0: number; y0: number; w: number; color: string; opacity: number; strokeWidth: number; progress?: number }> = ({ x0, y0, w, color, opacity, strokeWidth, progress = 1 }) => {
  const k = w / 640, X = (u: number) => x0 + u * k, Y = (v: number) => y0 + v * k;
  const pt = (cx: number, cy: number, r: number, a: number) => { const t = (a * Math.PI) / 180; return [X(cx + r * Math.cos(t)), Y(cy + r * Math.sin(t))].map((n) => n.toFixed(1)).join(" "); };
  return (
    <g fill="none" stroke={color} strokeWidth={strokeWidth} opacity={opacity}>
      {LINES_Y.map((v) => <line key={`h${v}`} x1={X(-30)} x2={lerp(X(-30), X(670), progress)} y1={Y(v)} y2={Y(v)} strokeDasharray="6 6" />)}
      {LINES_X.map((u) => <line key={`v${u}`} y1={Y(-28)} y2={lerp(Y(-28), Y(328), progress)} x1={X(u)} x2={X(u)} strokeDasharray="6 6" />)}
      {ARCS.map(([cx, cy, r, a0, a1], i) => (
        <path key={i} d={`M${pt(cx, cy, r, a0)}A${(r * k).toFixed(1)} ${(r * k).toFixed(1)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(cx, cy, r, a1)}`}
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progress} strokeLinecap="round" />
      ))}
    </g>
  );
};
