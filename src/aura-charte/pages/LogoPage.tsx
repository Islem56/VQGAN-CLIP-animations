// The light logo page (03, p.15): right after the flash the glass pieces turn into the official gradient one by one,
// over their construction circles; AURA LUNA settles underneath. It leaves, fast, just before the colour chapter.
import React from "react";
import { C, ease, lin, TL } from "../lib";
import { Format, LAYOUT } from "../layout";
import { MODULES, MonoGradients, MonoPiece, monoPath, wordmarkLetters } from "./brand";

const CIRCLES = [[303.5, 150, 151.5], [0, 150, 152], [152, 150, 152], [300, 150, 148], [455, 150, 155]];

export const LogoPage: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  if (t < TL.flash || t >= TL.palette) return null;
  const L = LAYOUT[format], { x, y, w } = L.mono, k = w / 640, X = (u: number) => x + u * k, Y = (v: number) => y + v * k;
  const exit = ease.in(lin(t, TL.palette - 0.3, 0.3)), sw = format === "v" ? 2 : 1.6;
  const wm = ease.out(lin(t, TL.flash + 0.5, 0.5)), { cx, baseline, scale } = L.wordmark;
  return (
    <svg width={L.W} height={L.H} viewBox={`0 0 ${L.W} ${L.H}`} style={{ position: "absolute", inset: 0 }}>
      <defs><MonoGradients id="lp" x0={x} y0={y} w={w} /></defs>
      <g opacity={1 - exit} transform={`translate(0 ${(-30 * exit).toFixed(1)})`}>
        <g fill="none" stroke={C.HALO} strokeWidth={sw} opacity={0.35}>
          {CIRCLES.map(([u, v, r], i) => <circle key={i} cx={X(u)} cy={Y(v)} r={r * k} />)}
          {[0, 150, 300].map((v) => <line key={`h${v}`} x1={X(-30)} x2={X(670)} y1={Y(v)} y2={Y(v)} strokeDasharray="6 6" />)}
          {[0, 152, 300, 455, 640].map((u) => <line key={`v${u}`} y1={Y(-28)} y2={Y(328)} x1={X(u)} x2={X(u)} strokeDasharray="6 6" />)}
        </g>
        {MODULES.map((id, i) => {
          const e = ease.out(lin(t, TL.flash + 0.05 + 0.045 * i, 0.3));
          return (
            <g key={id}>
              {e < 1 && <path d={monoPath(id, x, y, w)} fill={C.BLANC} fillOpacity={0.35 * (1 - e)} stroke={C.BRUME} strokeWidth={sw} opacity={1 - e} />}
              <MonoPiece gid="lp" piece={id} x0={x} y0={y} w={w} opacity={e} />
            </g>
          );
        })}
        <g fill={C.COSMOS} opacity={wm} transform={`translate(0 ${(40 * (1 - wm)).toFixed(1)})`}>
          {wordmarkLetters(cx, baseline, scale).map((d, i) => <path key={i} d={d} />)}
        </g>
      </g>
    </svg>
  );
};
