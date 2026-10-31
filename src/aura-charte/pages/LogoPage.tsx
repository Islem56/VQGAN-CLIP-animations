// The light logo page (03, p.15): right after the flash the glass pieces turn into the official gradient one by one,
// over their construction circles; AURA LUNA settles underneath. It leaves, fast, just before the colour chapter.
import React from "react";
import { C, ease, lin, TL } from "../lib";
import { Format, LAYOUT } from "../layout";
import { Construction } from "./construction";
import { MODULES, MonoBase, MonoGradients, MonoPiece, monoPath, wordmarkLetters } from "./brand";


export const LogoPage: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  if (t < TL.flash || t >= TL.palette) return null;
  const L = LAYOUT[format], { x, y, w } = L.mono;
  const exit = ease.in(lin(t, TL.palette - 0.3, 0.3)), sw = format === "v" ? 2 : 1.6;
  const wm = ease.out(lin(t, TL.flash + 0.5, 0.5)), { cx, baseline, scale } = L.wordmark;
  return (
    <svg width={L.W} height={L.H} viewBox={`0 0 ${L.W} ${L.H}`} style={{ position: "absolute", inset: 0 }}>
      <defs><MonoGradients id="lp" x0={x} y0={y} w={w} /></defs>
      <g opacity={1 - exit} transform={`translate(0 ${(-30 * exit).toFixed(1)})`}>
        <Construction x0={x} y0={y} w={w} color={C.HALO} opacity={0.4} strokeWidth={sw} />
        <MonoBase gid="lp" x0={x} y0={y} w={w} opacity={ease.out(lin(t, TL.flash + 0.05 + 0.045 * 5, 0.3))} />
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
