// The signature: the last page brightens to Lunaire, no page frame. The official lockup — monogram, AURA LUNA,
// DIGITAL · DESIGN · PRODUCTION, the signature — builds in a second and then holds, with a 2 % push-in.
import React from "react";
import { C, ease, lerp, lin, TL } from "../lib";
import { Format, LAYOUT } from "../layout";
import { typeStyle } from "../../shared/motion";
import { MODULES, MonoBase, MonoGradients, MonoPiece, wordmarkLetters } from "./brand";

const SG = {
  v: { mono: { x: 260, y: 640, w: 560 }, wm: { cx: 540, base: 1030, s: 0.86 }, desc: [1100, 26], sig: [[1160, "WHERE HUMAN IMAGINATION"], [1198, "MEETS DIGITAL CREATION"]] as [number, string][], sigSize: 20 },
  h: { mono: { x: 750, y: 300, w: 420 }, wm: { cx: 960, base: 612, s: 0.7 }, desc: [668, 22], sig: [[714, "WHERE HUMAN IMAGINATION MEETS DIGITAL CREATION"]] as [number, string][], sigSize: 17 },
};
/** the page brightens from the dark typography page to Lunaire: the light opens from the centre (a uniform fade went through grey) */
export const signatureLight = (t: number) => ease.inOut(lin(t, TL.sign, 0.6));

export const Signature: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  if (t < TL.sign) return null;
  const L = LAYOUT[format], { W, H } = L, c = SG[format], s0 = TL.sign;
  const push = lerp(1, 1.02, ease.inOut(lin(t, s0 + 0.6, TL.end - s0 - 0.6))), cx = W / 2, cy = (c.mono.y + c.sig[c.sig.length - 1][0]) / 2;
  const wm = wordmarkLetters(c.wm.cx, c.wm.base, c.wm.s), desc = ease.out(lin(t, s0 + 0.9, 0.5)), sig = ease.out(lin(t, s0 + 1.1, 0.5));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs><MonoGradients id="sg" x0={c.mono.x} y0={c.mono.y} w={c.mono.w} /></defs>
      <radialGradient id="sgLight" cx={W / 2} cy={H / 2} r={Math.hypot(W, H) * 0.95 * signatureLight(t) + 1} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={C.LUNAIRE} /><stop offset="0.5" stopColor={C.LUNAIRE} /><stop offset="0.8" stopColor={C.LUNAIRE} stopOpacity={0.45} /><stop offset="1" stopColor={C.LUNAIRE} stopOpacity={0} />
      </radialGradient>
      <rect width={W} height={H} fill={signatureLight(t) >= 1 ? C.LUNAIRE : "url(#sgLight)"} />
      <g transform={`translate(${cx} ${cy}) scale(${push.toFixed(5)}) translate(${-cx} ${-cy})`}>
        <MonoBase gid="sg" x0={c.mono.x} y0={c.mono.y} w={c.mono.w} opacity={ease.out(lin(t, s0 + 0.3 + 0.045 * 5, 0.45))} />
        {MODULES.map((id, i) => {
          const e = ease.out(lin(t, s0 + 0.3 + 0.045 * i, 0.45));
          return <g key={id} transform={`translate(0 ${(20 * (1 - e)).toFixed(1)})`}><MonoPiece gid="sg" piece={id} x0={c.mono.x} y0={c.mono.y} w={c.mono.w} opacity={e} /></g>;
        })}
        <g fill={C.COSMOS}>{wm.map((d, i) => { const e = ease.out(lin(t, s0 + 0.6 + 0.03 * i, 0.5)); return <path key={i} d={d} opacity={e} transform={`translate(0 ${(30 * (1 - e)).toFixed(1)})`} />; })}</g>
        <text x={cx} y={c.desc[0]} textAnchor="middle" fill={C.COSMOS} opacity={desc} style={typeStyle(600, c.desc[1], c.desc[1] * lerp(0.42, 0.3, desc))}>DIGITAL · DESIGN · PRODUCTION</text>
        {c.sig.map(([y, s], i) => <text key={i} x={cx} y={y} textAnchor="middle" fill={C.COSMOS} opacity={sig} style={typeStyle(500, c.sigSize, c.sigSize * 0.28)}>{s}</text>)}
      </g>
    </svg>
  );
};
