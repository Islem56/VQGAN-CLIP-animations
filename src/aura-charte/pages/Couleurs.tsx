// Chapter 04 · Couleurs. Light page (p.18): six glass capsules fill from the night to the halo, one per half-beat;
// they shrink to a row, the neutrals slide in, the accent is the point itself, the proportions draw. Then the Cosmos
// capsule stretches over the whole frame: the page turns dark (p.19), « La couleur comme une source »: the two
// gradients as glass bars, then the Halo and Éclipse samples, a lens of glass crossing the halo.
import React from "react";
import { B, C, clamp, ease, lerp, lin, sp, SPRING, TL } from "../lib";
import { Format, LAYOUT } from "../layout";
import { typeStyle } from "../../shared/motion";
import { Glass2D } from "../glass2d";

const CL = {
  v: { capX: 120, capW: 120, capGap: 24, capY: 640, capH: 340, labelY: 1022, rowH: 110, neuX: 110, neuY: 800, neuW: 200, neuH: 84, neuGap: 20, neuLabelY: 922,
    accY: 1010, barX: 80, barW: 920, barY: 1130, barH: 28, gradX: 80, gradW: 920, gradY: [660, 900], gradH: 120, cards: [[80, 640], [560, 640]], cardW: 440, cardH: 560, name: 22, hex: 18 },
  h: { capX: 700, capW: 150, capGap: 36, capY: 330, capH: 420, labelY: 802, rowH: 120, neuX: 700, neuY: 500, neuW: 252, neuH: 90, neuGap: 24, neuLabelY: 625,
    accY: 690, barX: 700, barW: 1080, barY: 790, barH: 26, gradX: 700, gradW: 1080, gradY: [340, 560], gradH: 110, cards: [[700, 330], [1260, 330]], cardW: 520, cardH: 400, name: 20, hex: 16 },
};
const PALETTE: [string, string][] = [["COSMOS", C.COSMOS], ["NUIT", C.NUIT], ["ORBITE", C.ORBITE], ["AURA", C.AURA], ["LUNA", C.LUNA], ["HALO", C.HALO]];
const NEUTRALS: [string, string][] = [["BLANC", C.BLANC], ["LUNAIRE", C.LUNAIRE], ["BRUME", C.BRUME], ["ARDOISE", C.ARDOISE]];

export const Couleurs: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  if (t < TL.palette - 0.05 || t >= TL.asik) return null;
  const L = LAYOUT[format], { W, H } = L, c = CL[format];
  const cover = ease.inOut(lin(t, TL.dark - 0.45, 0.45)), light = t < TL.dark, shrink = ease.inOut(lin(t, TL.neutrals, 0.45));
  const capH = lerp(c.capH, c.rowH, shrink), lightOut = 1 - cover;
  const name = (s: string, x: number, y: number, fill: string = C.COSMOS, anchor: "start" | "end" | "middle" = "start") =>
    <text x={x} y={y} fill={fill} textAnchor={anchor} style={typeStyle(600, c.name, c.name * 0.14)}>{s}</text>;
  const note = (s: string, x: number, y: number, fill: string = C.ARDOISE, anchor: "start" | "end" | "middle" = "start") =>
    <text x={x} y={y} fill={fill} textAnchor={anchor} style={typeStyle(400, c.hex)}>{s}</text>;
  const capX = (i: number) => c.capX + i * (c.capW + c.capGap);

  // the dark half: two gradient bars, then the samples and the lens
  const barsOut = ease.in(lin(t, TL.lens - 0.3, 0.3)), cardsIn = ease.out(lin(t, TL.lens, 0.5)), darkOut = 1 - ease.in(lin(t, TL.asik - 0.3, 0.3));
  const lensP = ease.inOut(lin(t, TL.lens + 0.3, 1.5)), [hx, hy] = c.cards[0], lr = 0.09 * W;
  const lx = lerp(hx + c.cardW * 0.18, hx + c.cardW * 0.82, lensP), ly = hy + c.cardH * 0.45;   // it crosses the halo's centre
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="clMain" x1="0" x2="1"><stop offset="0" stopColor={C.COSMOS} /><stop offset="0.35" stopColor={C.NUIT} /><stop offset="0.7" stopColor={C.LUNA} /><stop offset="1" stopColor={C.HALO} /></linearGradient>
        <linearGradient id="clEcl" x1="0" x2="1"><stop offset="0" stopColor={C.ORBITE} /><stop offset="0.55" stopColor={C.LUNA} /><stop offset="1" stopColor={C.ECLIPSE} /></linearGradient>
        <radialGradient id="clHalo"><stop offset="0" stopColor={C.HALO} stopOpacity={0.7} /><stop offset="1" stopColor={C.HALO} stopOpacity={0} /></radialGradient>
        <pattern id="clGrid" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke={C.BRUME} strokeWidth={1} /></pattern>
      </defs>
      {light && <g opacity={lightOut}>
        <g id="cl-grid"><rect x={c.capX - 40} y={c.capY - 40} width={c.capW * 6 + c.capGap * 5 + 80} height={c.capH + 80} fill="url(#clGrid)" opacity={0.8} /></g>
        {/* six capsules of glass, the colour rising inside like a liquid that settles */}
        {PALETTE.map(([n, col], i) => {
          const x = capX(i), lvl = clamp(sp(t, TL.palette + (i * B) / 2, SPRING.settle), 0, 1.04), lab = 1 - shrink;
          const shape = <rect x={x} y={c.capY} width={c.capW} height={capH} rx={c.capW / 2} />;
          return (
            <g key={n}>
              <Glass2D shape={shape} backdrop="cl-grid" light refract={[0, 6]} frost={2} tint={0.3} rimWidth={2} />
              <clipPath id={`clc${i}`}>{shape}</clipPath>
              <rect clipPath={`url(#clc${i})`} x={x} y={c.capY + capH * (1 - lvl)} width={c.capW} height={capH * lvl + 2} fill={col} />
              <rect x={x} y={c.capY} width={c.capW} height={capH} rx={c.capW / 2} fill="none" stroke={C.BLANC} strokeOpacity={0.55} strokeWidth={2} />
              <g opacity={lab * clamp(lvl)}>{name(n, x, c.labelY)}{note(col, x, c.labelY + c.hex * 1.6)}</g>
            </g>
          );
        })}
        {/* neutrals, the accent (the point), the proportions */}
        {NEUTRALS.map(([n, col], i) => {
          const e = ease.out(lin(t, TL.neutrals + 0.15 + 0.06 * i, 0.5)), x = c.neuX + i * (c.neuW + c.neuGap);
          return <g key={n} opacity={e} transform={`translate(${(-60 * (1 - e)).toFixed(1)} 0)`}>
            <rect x={x} y={c.neuY} width={c.neuW} height={c.neuH} rx={c.neuH / 2} fill={col} stroke={C.BRUME} strokeWidth={2} />
            {name(n, x, c.neuLabelY)}
          </g>;
        })}
        {(() => {
          const q = sp(t, TL.neutrals + 0.5, SPRING.pop), r = format === "v" ? 18 : 16; if (q <= 0) return null;
          const dy = -120 * (1 - q), x = c.barX + r;
          return <g>
            <circle cx={x} cy={c.accY + dy} r={r} fill={C.ECLIPSE} />
            <g opacity={clamp(q)}>{name("ÉCLIPSE", x + r * 2.2, c.accY - 4)}{note("Moins de 5 % : un point, un mot, un signal.", x + r * 2.2, c.accY + c.hex * 1.3)}</g>
          </g>;
        })()}
        {(() => {
          const p = ease.inOut(lin(t, TL.neutrals + 0.8, 0.5)); if (p <= 0) return null;
          const segs: [string, number][] = [[C.COSMOS, 0.5], [C.LUNA, 0.2], [C.BLANC, 0.25], [C.ECLIPSE, 0.05]]; let x = c.barX;
          return <g>
            <clipPath id="clProp"><rect x={c.barX} y={c.barY - 2} width={c.barW * p} height={c.barH + 4} /></clipPath>
            {name("PROPORTIONS", c.barX, c.barY - 16)}
            <g clipPath="url(#clProp)">{segs.map(([col, k], i) => { const r = <rect key={i} x={x} y={c.barY} width={c.barW * k} height={c.barH} fill={col} stroke={C.BRUME} strokeWidth={1} />; x += c.barW * k; return r; })}</g>
            <g opacity={p}>{note("COSMOS & NUIT 50 %", c.barX, c.barY + c.barH + c.hex * 1.6)}{note("VIOLETS 20 %", c.barX + c.barW * 0.5, c.barY + c.barH + c.hex * 1.6)}{note("NEUTRES 25 % · ÉCLIPSE 5 %", c.barX + c.barW, c.barY + c.barH + c.hex * 1.6, C.ARDOISE, "end")}</g>
          </g>;
        })()}
      </g>}
      {/* the Cosmos capsule becomes the page */}
      {cover > 0 && light && <rect x={lerp(c.capX, 0, cover)} y={lerp(c.capY, 0, cover)} width={lerp(c.capW, W, cover)} height={lerp(c.rowH, H, cover)} rx={lerp(c.capW / 2, 0, cover)} fill={C.COSMOS} />}
      {!light && <g opacity={darkOut}>
        <g opacity={1 - barsOut} transform={`translate(0 ${(-40 * barsOut).toFixed(1)})`}>
          {[["clMain", "DÉGRADÉ PRINCIPAL", "Cosmos → Nuit → Luna → Halo"], ["clEcl", "DÉGRADÉ ÉCLIPSE", "Temps forts uniquement"]].map(([g, n, d], i) => {
            const p = ease.inOut(lin(t, TL.dark + 0.15 + i * B, 0.6)), y = c.gradY[i], shape = <rect x={c.gradX} y={y} width={c.gradW} height={c.gradH} rx={c.gradH / 2} />;
            return <g key={g}>
              <clipPath id={`clb${i}`}><rect x={c.gradX} y={y} width={c.gradW * p} height={c.gradH} /></clipPath>
              <g id={`cl-bar${i}`}><rect clipPath={`url(#clb${i})`} x={c.gradX} y={y} width={c.gradW} height={c.gradH} rx={c.gradH / 2} fill={`url(#${g})`} /></g>
              <Glass2D shape={shape} backdrop={`cl-bar${i}`} refract={[0, 0]} frost={3} tint={0.04} rimWidth={2} />
              <g opacity={p}>{name(n, c.gradX, y + c.gradH + c.name * 1.8, C.BRUME)}{note(d, c.gradX, y + c.gradH + c.name * 1.8 + c.hex * 1.6, C.BRUME)}</g>
            </g>;
          })}
        </g>
        {cardsIn > 0 && <g opacity={cardsIn} transform={`translate(0 ${(30 * (1 - cardsIn)).toFixed(1)})`}>
          {c.cards.map(([x, y], i) => <rect key={i} x={x} y={y} width={c.cardW} height={c.cardH} rx={8} fill={C.COSMOS} stroke={C.BRUME} strokeOpacity={0.15} strokeWidth={2} />)}
          <g id="cl-halo">
            <circle cx={hx + c.cardW / 2} cy={hy + c.cardH * 0.45} r={c.cardW * 0.42} fill="url(#clHalo)" />
            <circle cx={hx + c.cardW / 2} cy={hy + c.cardH * 0.45} r={4} fill={C.BLANC} />
          </g>
          {(() => { const [x, y] = c.cards[1], cx = x + c.cardW / 2, cy = y + c.cardH * 0.45; return <g>
            <circle cx={cx} cy={cy} r={c.cardW * 0.4} fill="url(#clHalo)" opacity={0.45} />
            <circle cx={cx} cy={cy} r={c.cardW * 0.25} fill={C.COSMOS} stroke={C.HALO} strokeWidth={4} />
          </g>; })()}
          {name("HALO", hx + 24, hy + c.cardH - 52, C.BRUME)}{note("Halo 70 % → 0 %, dégradé radial", hx + 24, hy + c.cardH - 52 + c.hex * 1.6, C.BRUME)}
          {name("ÉCLIPSE", c.cards[1][0] + 24, hy + c.cardH - 52, C.BRUME)}{note("Disque Cosmos, anneau Halo, halo diffus", c.cards[1][0] + 24, hy + c.cardH - 52 + c.hex * 1.6, C.BRUME)}
          {t >= TL.lens + 0.3 && <Glass2D shape={<circle cx={lx} cy={ly} r={lr} />} backdrop="cl-halo" refract={[0, 0]} frost={0.01} tint={0.015} rimWidth={2.5} magnify={{ cx: lx, cy: ly, k: 1.4 }} />}
        </g>}
      </g>}
    </svg>
  );
};
