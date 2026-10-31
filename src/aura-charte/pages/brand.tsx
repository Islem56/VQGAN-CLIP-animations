// The official marks as SVG: the gradient monogram (one gradient per piece, as on the logo file) and the Asik wordmark.
import React from "react";
import MONO from "../../aura-point/data/monogram.json";
import WM from "../../aura-point/data/wordmark.json";
import { C } from "../lib";
import { ModuleId } from "../three/shapes";

export const MODULES: ModuleId[] = ["At", "Ab", "S", "B", "C", "D"];
const f1 = (n: number) => n.toFixed(1);
const loopD = (l: number[], map: (x: number, y: number) => [number, number]) => {
  let d = ""; for (let i = 0; i < l.length; i += 2) { const [x, y] = map(l[i], l[i + 1]); d += (i ? "L" : "M") + f1(x) + " " + f1(y); } return d + "Z";
};
export const monoPath = (id: ModuleId, x0: number, y0: number, w: number) => {
  const k = w / 640; return loopD((MONO.modules as Record<ModuleId, { loop: number[] }>)[id].loop, (x, y) => [x0 + x * k, y0 + y * k]);
};
const gradOf = (id: ModuleId) => (id === "D" ? "R" : id === "At" || id === "Ab" ? "L" : "A");

/** the gradients of the official monogram, in user space for a monogram drawn at (x0, y0) and width w */
export const MonoGradients: React.FC<{ id: string; x0: number; y0: number; w: number }> = ({ id, x0, y0, w }) => {
  const k = w / 640, g = { L: [x0, y0, x0 + 152 * k, y0 + 300 * k], A: [x0 + 152 * k, y0, x0 + 455 * k, y0 + 300 * k], R: [x0 + 640 * k, y0 + 300 * k, x0 + 455 * k, y0 + 150 * k] };
  return <>{Object.entries(g).map(([n, [x1, y1, x2, y2]]) => (
    <linearGradient key={n} id={`${id}${n}`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}><stop offset={0} stopColor={C.LOGO_A} /><stop offset={1} stopColor={C.LOGO_B} /></linearGradient>
  ))}</>;
};
/** one piece of the official monogram (its gradient defined by MonoGradients with the same id); `fill` overrides it */
export const MonoPiece: React.FC<{ gid: string; piece: ModuleId; x0: number; y0: number; w: number; opacity?: number; fill?: string }> = ({ gid, piece, x0, y0, w, opacity = 1, fill }) => {
  const paint = fill ?? `url(#${gid}${gradOf(piece)})`;
  return <path d={monoPath(piece, x0, y0, w)} fill={paint} stroke={paint} strokeWidth={1.6} strokeLinejoin="round" opacity={opacity} />;
};

/** the monogram's whole outline in the central gradient: laid under the pieces, it closes the hairline seams between them */
export const MonoBase: React.FC<{ gid: string; x0: number; y0: number; w: number; opacity?: number }> = ({ gid, x0, y0, w, opacity = 1 }) => {
  const k = w / 640;
  return <path d={(MONO.union as number[][]).map((l) => loopD(l, (x, y) => [x0 + x * k, y0 + y * k])).join("")} fill={`url(#${gid}A)`} opacity={opacity} />;
};

/** the Asik wordmark, one path per letter, centred on cx with its baseline at `baseline` */
export const wordmarkLetters = (cx: number, baseline: number, s: number) => {
  const x0 = cx - (766 * s) / 2 - 167 * s;
  return WM.letters.map((l) => l.loops.map((lp) => loopD(lp, (x, y) => [x0 + x * s, baseline - (679 - y) * s])).join(""));
};
