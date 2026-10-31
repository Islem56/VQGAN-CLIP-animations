// Chapter 05 · Typographie (p.22) — « Deux voix, deux rôles ». On a Nuit plate, AURA LUNA (Asik) rises letter by
// letter in backlit glass with a warm reflection at its foot; then a frosted Lunaire card: « Aa » in Montserrat,
// one weight per beat, from Light to Bold — the letter does not move, only its matter thickens.
import React from "react";
import { B, C, clamp, ease, lerp, lin, TL } from "../lib";
import { Format, LAYOUT } from "../layout";
import { typeStyle } from "../../shared/motion";
import { wordmarkLetters } from "./brand";

const TY = {
  v: { x: 80, y: 720, w: 920, plateH: 400, cardH: 520, wmS: 1.0, wmCx: 540, wmBase: 940, aaSize: 300, aaY: 1090, name: 34, note: 20, lab: 22 },
  h: { x: 700, y: 330, w: 1080, plateH: 380, cardH: 440, wmS: 1.1, wmCx: 1240, wmBase: 540, aaSize: 260, aaY: 600, name: 30, note: 18, lab: 20 },
};
const WEIGHTS: [number, string][] = [[300, "Light"], [400, "Regular"], [500, "Medium"], [600, "SemiBold"], [700, "Bold"]];

export const Typo: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  if (t < TL.asik - 0.05 || t >= TL.sign + 0.6) return null;
  const L = LAYOUT[format], { W, H } = L, c = TY[format];
  const out = 1 - ease.in(lin(t, TL.sign, 0.3)), plateOut = ease.in(lin(t, TL.aa - 0.3, 0.3)), cardIn = ease.out(lin(t, TL.aa, 0.5));
  const letters = wordmarkLetters(c.wmCx, c.wmBase, c.wmS);
  // one weight per beat: 300 on the downbeat, then 400, 500, 600, and 700 half a beat later; 0.12 s to change
  const steps = [TL.aa, TL.aa + B, TL.aa + 2 * B, TL.aa + 3 * B, TL.aa + 3.5 * B];
  let w = 300; steps.forEach((s, i) => { if (i) w = lerp(w, WEIGHTS[i][0], ease.inOut(lin(t, s, 0.12))); });
  const active = clamp(Math.round((w - 300) / 100), 0, 4);
  const lab = (s: string, x: number, y: number, fill: string) => <text x={x} y={y} fill={fill} style={typeStyle(600, c.lab, c.lab * 0.26)}>{s}</text>;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="tyHalo"><stop offset="0" stopColor={C.HALO} stopOpacity={0.45} /><stop offset="1" stopColor={C.HALO} stopOpacity={0} /></radialGradient>
        <filter id="tyGlow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={14} /></filter>
        <filter id="tyWarm" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={9} /></filter>
        <linearGradient id="tyRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={C.BLANC} stopOpacity={0.9} /><stop offset="0.5" stopColor={C.BRUME} stopOpacity={0.3} /><stop offset="1" stopColor={C.HALO} stopOpacity={0.6} /></linearGradient>
      </defs>
      <g opacity={out}>
        <ellipse cx={c.x + c.w / 2} cy={c.y + c.plateH / 2} rx={c.w * 0.6} ry={c.plateH * 0.9} fill="url(#tyHalo)" />
        {plateOut < 1 && <g opacity={1 - plateOut} transform={`translate(0 ${(-40 * plateOut).toFixed(1)})`}>
          <rect x={c.x} y={c.y} width={c.w} height={c.plateH} rx={16} fill={C.NUIT} />
          {lab("POLICE DE MARQUE", c.x + 40, c.y + 64, C.BRUME)}
          {letters.map((d, i) => {
            const e = ease.out(lin(t, TL.asik + 0.06 * i, 0.5)), dy = (30 * (1 - e)).toFixed(1);
            return <g key={i} opacity={e} transform={`translate(0 ${dy})`}>
              <path d={d} fill={C.ECLIPSE} opacity={0.35} filter="url(#tyWarm)" transform="translate(0 8)" />
              <path d={d} fill={C.HALO} opacity={0.6} filter="url(#tyGlow)" />
              <path d={d} fill={C.LUNAIRE} fillOpacity={0.9} stroke={C.BLANC} strokeWidth={1.2} />
            </g>;
          })}
          <g opacity={ease.out(lin(t, TL.asik + 0.6, 0.4))}>
            <text x={c.x + 40} y={c.wmBase + 80} fill={C.LUNAIRE} style={typeStyle(600, c.name)}>Asik Regular</text>
            <text x={c.x + 40} y={c.wmBase + 80 + c.note * 1.8} fill={C.BRUME} opacity={0.8} style={typeStyle(400, c.note)}>Logotype et titres d'impact. Toujours en capitales,</text>
            <text x={c.x + 40} y={c.wmBase + 80 + c.note * 3.3} fill={C.BRUME} opacity={0.8} style={typeStyle(400, c.note)}>jamais sous 18 pt, jamais en paragraphe.</text>
          </g>
        </g>}
        {cardIn > 0 && <g opacity={cardIn} transform={`translate(0 ${(30 * (1 - cardIn)).toFixed(1)})`}>
          <rect x={c.x} y={c.y} width={c.w} height={c.cardH} rx={16} fill={C.LUNAIRE} fillOpacity={0.94} />
          <rect x={c.x} y={c.y} width={c.w} height={c.cardH} rx={16} fill="none" stroke="url(#tyRim)" strokeWidth={2} />
          {lab("POLICE DE TEXTE", c.x + 40, c.y + 64, C.HALO)}
          <text x={c.x + 28} y={c.aaY} fill={C.COSMOS} style={typeStyle(Math.round(w), c.aaSize, -c.aaSize * 0.02)}>Aa</text>
          <text x={c.x + 40} y={c.y + c.cardH - 92} fill={C.COSMOS} style={typeStyle(600, c.name)}>Montserrat</text>
          <text x={c.x + 40} y={c.y + c.cardH - 48} style={typeStyle(500, c.note)}>
            {WEIGHTS.map(([wt, n], i) => <tspan key={n} fill={i === active ? C.HALO : C.COSMOS} style={{ fontVariationSettings: `'wght' ${wt}`, fontWeight: wt }}>{(i ? "   " : "") + n}</tspan>)}
          </text>
          {["Tout le reste : titres,", "sous-titres, texte courant,", "légendes, interfaces,", "sous-titres vidéo."].map((s, i) =>
            <text key={i} x={c.x + c.w - 40} y={c.y + 150 + i * c.note * 1.6} textAnchor="end" fill={C.ARDOISE} style={typeStyle(400, c.note)}>{s}</text>)}
        </g>}
      </g>
    </svg>
  );
};
