// The guidelines page frame: header, eyebrow, title, body, the Bauhaus sequence (POINT · LIGNE · PLAN · VOLUME · ESPACE) and the footer
// (moon phase, the orange dot, the page number). It cross-fades whenever the page changes.
import React from "react";
import { C, clamp, prog, TL } from "./lib";
import { Format, LAYOUT, PAGE_CHANGES, PageMeta, pageIndexAt } from "./layout";
import { measure, typeStyle } from "../shared/motion";

const ink = (dark: boolean) => ({ muted: dark ? C.BRUME : C.ARDOISE, mutedOpacity: dark ? 0.7 : 1, title: dark ? C.LUNAIRE : C.COSMOS, eyebrow: dark ? C.BRUME : C.HALO });

export const Moon: React.FC<{ cx: number; cy: number; r: number; f: number; color: string }> = ({ cx, cy, r, f, color }) => {
  const rx = Math.abs(1 - 2 * f) * r;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1.4} opacity={0.7} />
      {f >= 0.999 ? <circle cx={cx} cy={cy} r={r} fill={color} />
        : <path d={`M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx} ${cy + r}A${rx} ${r} 0 0 ${f > 0.5 ? 1 : 0} ${cx} ${cy - r}Z`} fill={color} />}
    </g>
  );
};

type Part = "header" | "section" | "eyebrow" | "title" | "body" | "footer";
const PARTS: Part[] = ["header", "section", "eyebrow", "title", "body", "footer"];
const same = (a: PageMeta, b: PageMeta, part: Part) => a.dark === b.dark && ({
  header: true, section: a.section === b.section, eyebrow: a.eyebrow === b.eyebrow, title: String(a.title) === String(b.title),
  body: String(a.body) === String(b.body), footer: a.phase === b.phase && a.pageNo === b.pageNo,
} as Record<Part, boolean>)[part];

const Frame: React.FC<{ format: Format; p: PageMeta; t: number; parts?: Part[] }> = ({ format, p, t, parts = PARTS }) => {
  const has = (part: Part) => parts.includes(part);
  const L = LAYOUT[format], k = ink(p.dark), hs = L.headerSize, track = hs * 0.2;
  const lift = 12 * (1 - prog(t, 0.1, 0.6));
  const numW = measure(p.pageNo, 600, hs, track);
  return (
    <g>
      {has("header") && <text x={L.margin} y={L.headerY} fill={k.muted} opacity={k.mutedOpacity} style={typeStyle(600, hs, track)}>AURA LUNA — BRAND GUIDELINES</text>}
      {has("section") && <text x={L.W - L.margin} y={L.sectionY} textAnchor="end" fill={k.muted} opacity={k.mutedOpacity} style={typeStyle(600, hs, track)}>{p.section}</text>}
      <g transform={`translate(0 ${lift.toFixed(2)})`}>
        {has("eyebrow") && p.eyebrow && <text x={L.margin} y={L.eyebrowY} fill={k.eyebrow} style={typeStyle(600, L.eyebrowSize, L.eyebrowSize * 0.26)}>{p.eyebrow}</text>}
        {has("title") && p.title?.map((line, i) => <text key={i} x={L.margin} y={L.titleY + i * L.titleLeading} fill={k.title} style={typeStyle(400, L.titleSize, -L.titleSize * 0.01)}>{line}</text>)}
        {has("body") && p.body?.map((line, i) => <text key={i} x={L.margin} y={L.bodyY + i * L.bodySize * 1.5} fill={k.muted} opacity={k.mutedOpacity} style={typeStyle(400, L.bodySize)}>{line}</text>)}
      </g>
      {has("footer") && <g>
      <Moon cx={L.margin + hs * 0.5} cy={L.footerY - hs * 0.36} r={hs * 0.5} f={p.phaseFraction} color={k.title} />
      <text x={L.margin + hs * 1.6} y={L.footerY} fill={k.muted} opacity={k.mutedOpacity} style={typeStyle(600, hs, track)}>{p.phase}</text>
      {!(t >= TL.point && t < TL.space) && <circle cx={L.W - L.margin - numW - hs * 0.55} cy={L.footerY - hs * 0.36} r={hs * 0.22} fill={C.ECLIPSE} />}
      <text x={L.W - L.margin} y={L.footerY} textAnchor="end" fill={k.muted} opacity={k.mutedOpacity} style={typeStyle(600, hs, track)}>{p.pageNo}</text>
      </g>}
    </g>
  );
};

/** the Bauhaus sequence under the chapter title (Kandinsky: the point becomes a line, lines become planes…):
    POINT · LIGNE · PLAN · VOLUME · ESPACE, each word lit on the beat of its action */
const STEPS = ["POINT", "LIGNE", "PLAN", "VOLUME", "ESPACE"] as const;
export const stepAt = (t: number) => (t >= TL.space ? 4 : t >= TL.volume ? 3 : t >= TL.plans[0] ? 2 : t >= TL.line ? 1 : 0);
export const Triad: React.FC<{ format: Format; t: number }> = ({ format, t }) => {
  const L = LAYOUT[format], o = prog(t, TL.point + 0.15, 0.2) * (1 - prog(t, TL.align - 0.3, 0.3));   // as the intro line fades
  if (o <= 0) return null;
  const active = STEPS[stepAt(t)], k = ink(true);
  return (
    <text x={L.margin} y={L.triadY} opacity={o} style={typeStyle(600, L.eyebrowSize, L.eyebrowSize * 0.26)}>
      {STEPS.map((w, i) => (
        <tspan key={w} fill={w === active ? k.title : k.muted} opacity={w === active ? 1 : 0.5}>{(i ? "  ·  " : "") + w}</tspan>
      ))}
    </text>
  );
};

/** the page frame at time t, cross-fading for 0.3 s after each change */
export const Page: React.FC<{ format: Format; t: number }> = ({ format, t }) => {
  const L = LAYOUT[format], i = pageIndexAt(t), [t0, cur] = PAGE_CHANGES[i];
  const prev = i > 0 ? PAGE_CHANGES[i - 1][1] : null, enter = 1;   // the page is there from frame 0: the first frame is the thumbnail
  const out = prev ? 1 - clamp((t - t0) / 0.15) : 0, inn = prev ? clamp((t - t0 - 0.15) / 0.15) : 1;
  const kept = prev ? PARTS.filter((part) => same(prev, cur, part)) : PARTS, changed = PARTS.filter((part) => !kept.includes(part));
  return (
    <svg width={L.W} height={L.H} viewBox={`0 0 ${L.W} ${L.H}`} style={{ position: "absolute", inset: 0 }}>
      <g opacity={enter}>
        {cur.frame && prev?.frame && <Frame format={format} p={cur} t={t} parts={kept} />}
        {prev && prev.frame && out > 0 && <g opacity={out}><Frame format={format} p={prev} t={t} parts={changed} /></g>}
        {cur.frame && <g opacity={inn}><Frame format={format} p={cur} t={t} parts={prev?.frame ? changed : PARTS} /></g>}
      </g>
      <Triad format={format} t={t} />
    </svg>
  );
};
