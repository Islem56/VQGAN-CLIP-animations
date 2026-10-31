// The monogram's construction, drawn like a logo construction sheet: the module grid (top, middle and base lines,
// the module divisions) and three guide circles of the same radius, centred on the middle line and spaced one module
// apart. Fitted to the traced logo: the left one follows the left L's curve, the middle one the A's dome and its left
// leg, the right one the A's right leg — within 2.5 units (under 3 px).
import React from "react";
import { lerp } from "../lib";

/** [cx, cy, r] in monogram units (640 × 300, y down) */
const CIRCLES: [number, number, number][] = [[152.5, 150, 152], [302.5, 150, 152], [452.5, 150, 152]];
const LINES_Y = [0, 150, 300], LINES_X = [0, 152, 300, 455, 640];

export const Construction: React.FC<{ x0: number; y0: number; w: number; color: string; opacity: number; strokeWidth: number; progress?: number }> = ({ x0, y0, w, color, opacity, strokeWidth, progress = 1 }) => {
  const k = w / 640, X = (u: number) => x0 + u * k, Y = (v: number) => y0 + v * k;
  return (
    <g fill="none" stroke={color} strokeWidth={strokeWidth} opacity={opacity}>
      {LINES_Y.map((v) => <line key={`h${v}`} x1={X(-30)} x2={lerp(X(-30), X(670), progress)} y1={Y(v)} y2={Y(v)} strokeDasharray="6 6" />)}
      {LINES_X.map((u) => <line key={`v${u}`} y1={Y(-28)} y2={lerp(Y(-28), Y(328), progress)} x1={X(u)} x2={X(u)} strokeDasharray="6 6" />)}
      {CIRCLES.map(([cx, cy, r], i) => (
        <circle key={i} cx={X(cx)} cy={Y(cy)} r={r * k} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progress} transform={`rotate(-90 ${X(cx)} ${Y(cy)})`} />
      ))}
    </g>
  );
};
