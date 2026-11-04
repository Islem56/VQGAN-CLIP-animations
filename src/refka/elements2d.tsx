// The flat elements of the Reel: subtitles, hook, big keyword, Instagram tag, the B-roll window and its hair-follicle
// illustration, the end card. Same type and gold everywhere, so every frame reads as one hand.
import React from "react";
import { FONT } from "../shared/motion";
import { CAIRO, goldText, HANDLE, R, whiteText } from "./theme";

export type Part = { t: string; gold?: boolean };

/** one line of Arabic, centred on y; gold words carry the point */
export const Line: React.FC<{ parts: Part[]; y: number; size: number; weight?: number; gap?: number; style?: React.CSSProperties }> = ({ parts, y, size, weight = 800, gap = 0.28, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.95, height: size * 1.9, display: "flex", justifyContent: "center", alignItems: "center", direction: "rtl", gap: size * gap, fontFamily: CAIRO, fontWeight: weight, fontSize: size, lineHeight: 1.6, ...style }}>
    {parts.map((p, i) => <span key={i} style={p.gold ? goldText : whiteText}>{p.t}</span>)}
  </div>
);

/** the Instagram glyph, drawn (outline square, lens, flash) */
export const IGGlyph: React.FC<{ size: number; color?: string; stroke?: number }> = ({ size, color = R.BLANC, stroke = 3.4 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block", overflow: "visible" }}>
    <rect x={3} y={3} width={42} height={42} rx={12.5} fill="none" stroke={color} strokeWidth={stroke} />
    <circle cx={24} cy={24} r={9.6} fill="none" stroke={color} strokeWidth={stroke} />
    <circle cx={35.4} cy={12.6} r={2.6} fill={color} />
  </svg>
);

/** the account, small and quiet (as in the reference): glyph above, handle under, right-aligned */
export const IGTag: React.FC<{ x: number; y: number; align?: "right" | "left" }> = ({ x, y, align = "right" }) => (
  <div style={{ position: "absolute", top: y, ...(align === "right" ? { right: 1080 - x } : { left: x }), display: "flex", flexDirection: "column", alignItems: align === "right" ? "flex-end" : "flex-start", gap: 10, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>
    <IGGlyph size={40} />
    <div style={{ fontFamily: FONT, fontWeight: 600, fontVariationSettings: "'wght' 600", fontSize: 19, letterSpacing: "0.07em", color: R.BLANC }}>{HANDLE}</div>
  </div>
);

/** small label telling the viewer this is a mock-up on a reference frame */
export const ApercuTag: React.FC<{ n: number; title: string; reference?: boolean }> = ({ n, title, reference = true }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, display: "flex", justifyContent: "center" }}>
    <div style={{ fontFamily: FONT, fontWeight: 600, fontVariationSettings: "'wght' 600", fontSize: 20, letterSpacing: "0.16em", color: "rgba(255,255,255,0.85)", background: "rgba(10,9,8,0.55)", padding: "12px 24px", borderRadius: 999, textTransform: "uppercase" }}>
      Aperçu {n} · {title}{reference ? <span style={{ color: "rgba(255,255,255,0.5)" }}> · image de la vidéo référence</span> : null}
    </div>
  </div>
);

/** the B-roll window: a rounded pane with a thin champagne edge, a soft gold halo and a glass sheen */
export const Window: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 36, padding: 4,
    background: `linear-gradient(160deg, ${R.OR_CLAIR}, ${R.OR} 45%, ${R.OR_PROFOND})`,
    boxShadow: "0 0 34px rgba(227,188,99,0.42), 0 24px 60px rgba(0,0,0,0.5)" }}>
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 32, overflow: "hidden", background: R.NUIT }}>
      {children}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg, rgba(255,255,255,0.20), rgba(255,255,255,0) 38%)", pointerEvents: "none" }} />
    </div>
  </div>
);

/* ───────── the hair follicle, in section (skin, follicle, bulb, papilla, gland, vessels, nutrients) ───────── */
const wave = (y: number, a = 6) => `M-10,${y} C120,${y - a * 1.6} 220,${y + a} 340,${y} S560,${y - a * 1.4} 680,${y + a * 0.6} S820,${y - a} 820,${y}`;

const FollicleUnit: React.FC<{ x: number; top: number; depth: number; tilt: number; s?: number; detail?: boolean; id: string; t?: number }> = ({ x, top, depth, tilt, s = 1, detail = true, id, t }) => {
  const bw = 23 * s, bulbY = top + depth, sh = 8.5 * s;
  return (
    <g transform={`rotate(${tilt} ${x} ${top})`}>
      {/* outer root sheath */}
      <path d={`M${x - bw},${top - 4} L${x - bw * 0.92},${bulbY - 18 * s} Q${x},${bulbY + 6 * s} ${x + bw * 0.92},${bulbY - 18 * s} L${x + bw},${top - 4} Z`} fill="url(#sheath)" opacity={0.95} />
      <path d={`M${x - bw * 0.52},${top} L${x - bw * 0.5},${bulbY - 16 * s} L${x + bw * 0.5},${bulbY - 16 * s} L${x + bw * 0.52},${top} Z`} fill="#F8DCCB" opacity={0.75} />
      {detail && (
        <>
          {/* sebaceous gland and its duct */}
          <path d={`M${x + bw * 0.9},${top + 52 * s} q16,4 22,14`} stroke="#D9A867" strokeWidth={5 * s} fill="none" strokeLinecap="round" />
          <g filter="url(#soft)">
            <circle cx={x + bw + 26 * s} cy={top + 66 * s} r={15 * s} fill="url(#gland)" stroke="#D3A15C" strokeWidth={1.4} />
            <circle cx={x + bw + 40 * s} cy={top + 84 * s} r={13 * s} fill="url(#gland)" stroke="#D3A15C" strokeWidth={1.4} />
            <circle cx={x + bw + 22 * s} cy={top + 92 * s} r={12 * s} fill="url(#gland)" stroke="#D3A15C" strokeWidth={1.4} />
          </g>
          {/* arrector pili */}
          <path d={`M${x + bw * 0.8},${top + 120 * s} C${x + 60 * s},${top + 96 * s} ${x + 88 * s},${top + 60 * s} ${x + 104 * s},${top + 12 * s}`} stroke="#C7847A" strokeWidth={7 * s} fill="none" strokeLinecap="round" opacity={0.55} />
        </>
      )}
      {/* bulb (melanin) and papilla, with its capillary loop */}
      <ellipse cx={x} cy={bulbY - 4 * s} rx={30 * s} ry={25 * s} fill={`url(#bulb)`} />
      <path d={`M${x - 13 * s},${bulbY + 18 * s} Q${x - 15 * s},${bulbY - 14 * s} ${x},${bulbY - 16 * s} Q${x + 15 * s},${bulbY - 14 * s} ${x + 13 * s},${bulbY + 18 * s} Z`} fill="url(#papilla)" />
      {detail && <path d={`M${x - 5 * s},${bulbY + 60 * s} C${x - 8 * s},${bulbY + 20 * s} ${x - 6 * s},${bulbY - 4 * s} ${x},${bulbY - 6 * s} C${x + 6 * s},${bulbY - 4 * s} ${x + 8 * s},${bulbY + 20 * s} ${x + 5 * s},${bulbY + 60 * s}`} stroke="#C2393A" strokeWidth={3 * s} fill="none" />}
      {/* animated: nutrients climbing the capillary into the papilla, which glows as they arrive */}
      {detail && t !== undefined && (
        <g filter="url(#glow)">
          <ellipse cx={x} cy={bulbY + 2 * s} rx={15 * s} ry={13 * s} fill={R.OR} opacity={0.18 + 0.14 * Math.sin(t * 5)} />
          {Array.from({ length: 6 }, (_, k) => {
            const ph = (t * 0.85 + k / 6) % 1, o = ph < 0.12 ? ph / 0.12 : ph > 0.82 ? (1 - ph) / 0.18 : 1;
            return <circle key={k} cx={x + Math.sin(ph * 7 + k) * 3 * s} cy={bulbY + 66 * s - ph * 74 * s} r={3.6 * s} fill="url(#dot)" opacity={o} />;
          })}
        </g>
      )}
      {/* the hair shaft, out through the skin and up out of the frame */}
      <path d={`M${x - sh},${bulbY - 22 * s} L${x - sh * 0.9},${top - 420} L${x + sh * 0.9},${top - 420} L${x + sh},${bulbY - 22 * s} Z`} fill={`url(#shaft-${id})`} />
    </g>
  );
};

export const Follicle: React.FC<{ w: number; h: number; t?: number }> = ({ w, h, t }) => (
  <svg width={w} height={h} viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E2522" /><stop offset="1" stopColor="#7B6156" /></linearGradient>
      <linearGradient id="epi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F7DCCB" /><stop offset="0.5" stopColor="#EEC0A7" /><stop offset="1" stopColor="#E5AC93" /></linearGradient>
      <linearGradient id="derm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EBB7A0" /><stop offset="0.55" stopColor="#DD9C86" /><stop offset="1" stopColor="#B86C5F" /></linearGradient>
      <linearGradient id="sheath" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#CF8E78" /><stop offset="0.5" stopColor="#F6D6C3" /><stop offset="1" stopColor="#CF8E78" /></linearGradient>
      <radialGradient id="bulb" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stopColor="#8A5642" /><stop offset="1" stopColor="#35201A" /></radialGradient>
      <radialGradient id="papilla" cx="0.5" cy="0.3" r="0.8"><stop offset="0" stopColor="#EE8E99" /><stop offset="1" stopColor="#B1435A" /></radialGradient>
      <radialGradient id="gland" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor="#FFF0C8" /><stop offset="1" stopColor="#E8BE79" /></radialGradient>
      <radialGradient id="dot" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#FFF6D6" /><stop offset="1" stopColor={R.OR} /></radialGradient>
      <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
      {["a", "b", "c"].map((id) => (
        <linearGradient key={id} id={`shaft-${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#140D0A" /><stop offset="0.42" stopColor="#5A3D30" /><stop offset="1" stopColor="#140D0A" /></linearGradient>
      ))}
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.6" /></filter>
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="far" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2" /></filter>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0.55 0" /></filter>
    </defs>
    <rect width={800} height={450} fill="url(#sky)" />
    {/* epidermis, dermis */}
    <path d={`${wave(150)} L820,460 L-10,460 Z`} fill="url(#epi)" />
    <path d={`${wave(196, 5)} L820,460 L-10,460 Z`} fill="url(#derm)" />
    <path d={wave(150)} stroke="#FCEDE3" strokeWidth={4} fill="none" opacity={0.9} />
    <path d={wave(196, 5)} stroke="#D2917A" strokeWidth={3} fill="none" opacity={0.55} />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={-6 + i * 21} cy={193 + Math.sin(i * 1.7) * 3} r={5.5} fill="#E7AE95" opacity={0.7} />)}
    {/* collagen */}
    {[248, 290, 336].map((y, i) => <path key={i} d={wave(y, 9 + i * 3)} stroke="#F6D9C9" strokeWidth={2.4} fill="none" opacity={0.28} />)}
    {/* vessels */}
    <path d="M-10,418 C140,398 260,436 420,414 S700,400 820,424" stroke="#5F65A2" strokeWidth={11} fill="none" />
    <path d="M-10,404 C150,384 270,424 430,400 S700,388 820,408" stroke="#C0453F" strokeWidth={10} fill="none" />
    <path d="M-10,401 C150,381 270,421 430,397 S700,385 820,405" stroke="#EE8C80" strokeWidth={2.6} fill="none" opacity={0.75} />
    {/* the far follicles first (softer), then the hero follicle on the left, clear of the speaker's head */}
    <g filter="url(#far)" opacity={0.9}>
      <FollicleUnit id="b" x={500} top={150} depth={190} tilt={-14} s={0.82} detail={false} />
      <FollicleUnit id="c" x={700} top={150} depth={175} tilt={-10} s={0.78} detail={false} />
    </g>
    <FollicleUnit id="a" x={118} top={150} depth={212} tilt={-9} t={t} />
    {/* stray hairs from follicles out of view */}
    {[[40, -16], [330, -10], [610, -14], [770, -8]].map(([x, a], i) => (
      <path key={i} d={`M${x - 6},152 L${x - 5},-30 L${x + 5},-30 L${x + 6},152 Z`} fill="url(#shaft-a)" transform={`rotate(${a} ${x} 150)`} opacity={0.95} />
    ))}
    {/* nutrients: gold particles carried by the capillary to the papilla */}
    <g filter="url(#glow)">
      {[[118, 398, 5], [150, 392, 4], [186, 396, 5.5], [221, 384, 4.5], [236, 360, 5], [212, 336, 3.5], [262, 318, 3], [168, 300, 3.2], [300, 404, 4]].map(([x, y, r], i) => (
        <circle key={i} cx={t === undefined ? x : ((x + t * 46) % 830) - 15} cy={y} r={r} fill="url(#dot)" />
      ))}
    </g>
    <rect width={800} height={450} filter="url(#grain)" opacity={0.18} style={{ mixBlendMode: "multiply" }} />
    <rect width={800} height={450} fill="url(#vig)" />
  </svg>
);

/** last card: black, the doctor's name, the account */
export const EndCard: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 45% at 50% 46%, #1A1511 0%, ${R.NOIR} 70%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: CAIRO, fontWeight: 700, fontSize: 64, direction: "rtl", ...whiteText }}>د. رفقة عبد الرحيم</div>
    <div style={{ fontFamily: FONT, fontWeight: 500, fontVariationSettings: "'wght' 500", fontSize: 24, letterSpacing: "0.34em", color: R.OR, marginTop: 14, marginRight: "-0.34em" }}>DR REFKA ABDERRAHIM</div>
    <div style={{ width: 64, height: 2, background: R.OR, opacity: 0.6, margin: "64px 0 70px" }} />
    <div style={{ filter: "drop-shadow(0 0 22px rgba(227,188,99,0.45))" }}><IGGlyph size={124} color={R.OR} stroke={3} /></div>
    <div style={{ fontFamily: FONT, fontWeight: 600, fontVariationSettings: "'wght' 600", fontSize: 30, letterSpacing: "0.1em", color: R.BLANC, marginTop: 34 }}>{HANDLE}</div>
  </div>
);
