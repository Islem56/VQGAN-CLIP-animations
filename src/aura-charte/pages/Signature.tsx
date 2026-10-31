// The signature: the last page brightens to Lunaire, no page frame. The official lockup, built in the logo file's own
// units (the 1100 × 1100 artwork): monogram 258–841 × 276–548, AURA LUNA 167–932 × 607–679, the descriptor justified to
// the wordmark's width (170–929, cap height 24), the signature on two lines (593 and 524 wide, cap height 20). It builds
// in a second and then holds, perfectly still.
import React from "react";
import { C, ease, lin, TL } from "../lib";
import { Format, LAYOUT } from "../layout";
import { typeStyle } from "../../shared/motion";
import { MODULES, MonoBase, MonoGradients, MonoPiece, wordmarkLetters } from "./brand";

/** where the lockup sits: the scale of the logo file's units, and where its centre (549.5, 549.5) lands */
const SG: Record<Format, { s: number; cx: number; cy: number }> = { v: { s: 0.86, cx: 540, cy: 900 }, h: { s: 0.72, cx: 960, cy: 520 } };
/** the page brightens from the dark typography page to Lunaire: the light opens from the centre (a uniform fade went through grey) */
export const signatureLight = (t: number) => ease.inOut(lin(t, TL.sign, 0.6));

export const Signature: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  if (t < TL.sign) return null;
  const L = LAYOUT[format], { W, H } = L, { s, cx, cy } = SG[format], s0 = TL.sign;
  const X = (u: number) => cx + (u - 549.5) * s, Y = (v: number) => cy + (v - 549.5) * s;
  const mono = { x: X(258), y: Y(276), w: 584 * s }, wm = wordmarkLetters(cx, Y(679), s);
  const desc = ease.out(lin(t, s0 + 0.9, 0.5)), sig = ease.out(lin(t, s0 + 1.1, 0.5));
  const line = (y: number, width: number, size: number, text: string, o: number) => (
    <text x={cx} y={Y(y)} textAnchor="middle" textLength={width * s} lengthAdjust="spacing" fill={C.COSMOS} opacity={o} style={typeStyle(600, size * s)}>{text}</text>
  );
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs><MonoGradients id="sg" x0={mono.x} y0={mono.y} w={mono.w} /></defs>
      <radialGradient id="sgLight" cx={W / 2} cy={H / 2} r={Math.hypot(W, H) * 0.95 * signatureLight(t) + 1} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={C.LUNAIRE} /><stop offset="0.5" stopColor={C.LUNAIRE} /><stop offset="0.8" stopColor={C.LUNAIRE} stopOpacity={0.45} /><stop offset="1" stopColor={C.LUNAIRE} stopOpacity={0} />
      </radialGradient>
      <rect width={W} height={H} fill={signatureLight(t) >= 1 ? C.LUNAIRE : "url(#sgLight)"} />
      <g>
        <MonoBase gid="sg" x0={mono.x} y0={mono.y} w={mono.w} opacity={ease.out(lin(t, s0 + 0.3 + 0.045 * 5, 0.45))} />
        {MODULES.map((id, i) => {
          const e = ease.out(lin(t, s0 + 0.3 + 0.045 * i, 0.45));
          return <g key={id} transform={`translate(0 ${(20 * (1 - e)).toFixed(1)})`}><MonoPiece gid="sg" piece={id} x0={mono.x} y0={mono.y} w={mono.w} opacity={e} /></g>;
        })}
        <g fill={C.COSMOS}>{wm.map((d, i) => { const e = ease.out(lin(t, s0 + 0.6 + 0.03 * i, 0.5)); return <path key={i} d={d} opacity={e} transform={`translate(0 ${(30 * (1 - e)).toFixed(1)})`} />; })}</g>
        {line(737, 760, 34, "DIGITAL . DESIGN . PRODUCTION", desc)}
        {line(792, 593, 28.5, "WHERE HUMAN IMAGINATION", sig)}
        {line(823, 524, 27, "MEETS DIGITAL CREATION", sig)}
      </g>
    </svg>
  );
};
