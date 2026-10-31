// Chapter 03 · Logo (2D, screen space) — valid because, from the hero camera, the glass monogram projects exactly
// onto LAYOUT.mono: the construction circles draw around it, the light reads the letters (A, then each L), and the
// flash: the point becomes light and floods the frame to Lunaire.
import React from "react";
import MONO from "../aura-point/data/monogram.json";
import { C, clamp, ease, lerp, lin, prog, TL } from "./lib";
import { Format, LAYOUT } from "./layout";
import { ModuleId } from "./three/shapes";

const LETTERS: ModuleId[][] = [["S", "B", "C"], ["At", "Ab", "B"], ["C", "D"]];   // A, the left L, the right L (the A's legs are shared)
const CIRCLES = [[303.5, 150, 151.5], [0, 150, 152], [152, 150, 152], [300, 150, 148], [455, 150, 155]];

export const modulePath = (id: ModuleId, x0: number, y0: number, k: number) => {
  const l = (MONO.modules as Record<ModuleId, { loop: number[] }>)[id].loop; let d = "";
  for (let i = 0; i < l.length; i += 2) d += (i ? "L" : "M") + (x0 + l[i] * k).toFixed(1) + " " + (y0 + l[i + 1] * k).toFixed(1);
  return d + "Z";
};
/** the flash envelope: up to its peak 0.2 s after the beat, gone 0.4 s later */
export const flashAt = (t: number) => (t < TL.flash - 0.05 ? 0 : t < TL.flash + 0.2 ? ease.in(lin(t, TL.flash - 0.05, 0.25)) : 1 - ease.out(lin(t, TL.flash + 0.2, 0.4)));

export const LogoOverlay: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  if (t < TL.align || t > TL.flash + 0.7) return null;
  const L = LAYOUT[format], { W, H } = L, k = L.mono.w / 640, X = (x: number) => L.mono.x + x * k, Y = (y: number) => L.mono.y + y * k;
  const out = 1 - prog(t, TL.flash, 0.15), draw = prog(t, TL.align + 0.1, 0.4), sw = format === "v" ? 2 : 1.6;
  const cx = X(320), cy = Y(150), fl = flashAt(t);
  const env = (t0: number) => (t < t0 ? 0 : t < t0 + 0.12 ? lin(t, t0, 0.12) : lerp(1, 0.18, ease.out(lin(t, t0 + 0.12, 0.35))));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="flashW" cx={cx} cy={cy} r={Math.hypot(W, H) * 0.55} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.BLANC} /><stop offset="0.35" stopColor={C.LUNAIRE} /><stop offset="0.75" stopColor={C.BRUME} stopOpacity={0.5} /><stop offset="1" stopColor={C.HALO} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="flashO" cx={cx} cy={cy} r={W * 0.09} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.ECLIPSE} stopOpacity={0.55} /><stop offset="1" stopColor={C.ECLIPSE} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g opacity={out}>
        <g fill="none" stroke={C.BRUME} strokeWidth={sw} opacity={0.45}>
          {CIRCLES.map(([x, y, r], i) => { const c = 2 * Math.PI * r * k; return <circle key={i} cx={X(x)} cy={Y(y)} r={r * k} strokeDasharray={c} strokeDashoffset={c * (1 - draw)} transform={`rotate(-90 ${X(x)} ${Y(y)})`} />; })}
          {[0, 150, 300].map((y) => <line key={`h${y}`} x1={X(-30)} x2={lerp(X(-30), X(670), draw)} y1={Y(y)} y2={Y(y)} strokeDasharray="6 6" />)}
          {[0, 152, 300, 455, 640].map((x) => <line key={`v${x}`} y1={Y(-28)} y2={lerp(Y(-28), Y(328), draw)} x1={X(x)} x2={X(x)} strokeDasharray="6 6" />)}
        </g>
        {LETTERS.map((ids, i) => {
          const e = env(TL.letters[i]); if (e <= 0) return null;
          return <g key={i}>{ids.map((id) => <path key={id} d={modulePath(id, L.mono.x, L.mono.y, k)} fill={C.HALO} fillOpacity={0.45 * e} stroke={C.LUNAIRE} strokeWidth={sw * 1.2} strokeOpacity={clamp(e)} strokeLinejoin="round" />)}</g>;
        })}
      </g>
      {fl > 0 && <g>
        <rect width={W} height={H} fill="url(#flashW)" opacity={fl} />
        <rect width={W} height={H} fill={C.LUNAIRE} opacity={fl ** 2} />
        <rect width={W} height={H} fill="url(#flashO)" opacity={fl * (1 - fl) * 4} />
      </g>}
    </svg>
  );
};
