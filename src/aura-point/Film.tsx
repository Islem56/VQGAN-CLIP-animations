// Aura Luna — « Le point » · Remotion. One Éclipse-orange dot connects every scene: the « Limit Imagination »
// toggle, the i of « Imagination », a spring graph (6 pôles d'expertise), the violet light, a square → pill → night,
// the six poles in orbit, a halftone field, the end card (it is the full stop), and back into the toggle (loops).
// Every value is a pure function of the frame; every beat comes from timeline.json.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Grain, measure, MotionBlur, typeStyle, useFont } from "../shared/motion";
import G from "./data/glyphs.json";
import MONO from "./data/monogram.json";
import WM from "./data/wordmark.json";
import { C, clamp, ease, expIn, FPS, FRAMES, LAYOUT, Layout, lerp, lin, prog, sp, SPRING, springF, TL } from "./lib";

/* ───────── shapes ───────── */
type Pt = [number, number];
const f1 = (n: number) => Math.round(n * 10) / 10;
const pairs = (fl: number[]): Pt[] => { const o: Pt[] = []; for (let i = 0; i < fl.length; i += 2) o.push([fl[i], fl[i + 1]]); return o; };
const ptsD = (pts: Pt[], map: (p: Pt) => Pt) => "M" + pts.map((p) => { const q = map(p); return f1(q[0]) + " " + f1(q[1]); }).join("L") + "Z";
const arc = (a: Pt, b: Pt, p: number, h: number): Pt => [lerp(a[0], b[0], p), lerp(a[1], b[1], p) - h * Math.sin(Math.PI * p)];
const ring2 = (cx: number, cy: number, R: number) => { const a = `a${R} ${R} 0 1 1 ${2 * R} 0a${R} ${R} 0 1 1 ${-2 * R} 0`; return `M${cx - R} ${cy}${a}${a}`; };   // twice round: words can cross the seam

/* « Limit Imagination »: Montserrat outlines at wght 600 (label) → 800 (hero), interpolated per letter */
type Glyph = { adv: number; loops: number[][] };
const GL = G as unknown as { upm: number; capH: number; tittle: number; label: Record<string, Glyph>; hero: Record<string, Glyph> };
const UPM = GL.upm, CAPH = GL.capH, LABEL = "Limit Imagination", HERO0 = 6, DOT_I = HERO0 + 4;
const gAdv = (ch: string, k: number) => lerp(GL.label[ch].adv, GL.hero[ch].adv, k);
const gD = (ch: string, k: number, size: number, noTittle: boolean) => {
  const a = GL.label[ch].loops, b = GL.hero[ch].loops, s = size / UPM; let d = "";
  for (let i = 0; i < a.length; i++) {
    if (noTittle && i === GL.tittle) continue;
    const la = a[i], lb = b[i]; d += "M";
    for (let j = 0; j < la.length; j += 2) d += (j ? "L" : "") + f1(lerp(la[j], lb[j], k) * s) + " " + f1(-lerp(la[j + 1], lb[j + 1], k) * s);
    d += "Z";
  }
  return d;
};

/* ───────── everything that depends on the format, computed once ───────── */
const geometry = (L: Layout) => {
  const { W, H, LS, HS, TW, TH, TGAP, LB } = L;
  const labelX: number[] = []; { let x = 0; for (const ch of LABEL) { labelX.push(x); x += (gAdv(ch, 0) * LS) / UPM; } labelX.push(x); }
  const LW = labelX[LABEL.length];
  const heroX: number[] = []; { let x = 0; for (let i = HERO0; i < LABEL.length; i++) { heroX.push(x); x += (gAdv(LABEL[i], 1) * HS) / UPM; } heroX.push(x); }
  const HW = heroX[heroX.length - 1], HX0 = (W - HW) / 2, HB = H / 2 + (CAPH * HS) / UPM / 2;
  const ROWW = LW + TGAP + TW, RX0 = (W - ROWW) / 2, TDY = 0.36 * LS;
  const TOG = { x: RX0 + LW + TGAP, y: LB - TDY - TH / 2 }, TCX = RX0 + LW + TGAP + TW / 2, TCY = LB - TDY;
  const KON = TOG.x + TW - TH / 2, KOFF = TOG.x + TH / 2;
  const TIT = (() => { const l = GL.hero.i.loops[GL.tittle], xs = l.filter((_, j) => j % 2 === 0), ys = l.filter((_, j) => j % 2 === 1), s = HS / UPM;
    return { x: HX0 + heroX[DOT_I - HERO0] + ((Math.min(...xs) + Math.max(...xs)) / 2) * s, y: HB - ((Math.min(...ys) + Math.max(...ys)) / 2) * s, r: ((Math.max(...xs) - Math.min(...xs)) / 2) * s }; })();
  const { GO, GW, VS } = L, TAU = 1.25;
  const gPt = (tau: number): Pt => [GO[0] + (GW * tau) / TAU, GO[1] - VS * 6 * springF(tau, SPRING.graph)];   // the dot moves along the spring it draws
  const GEND = gPt(TAU), C3: Pt = [GEND[0] + L.shoot, GO[1] - VS * 6], CEN: Pt = [W / 2, H / 2];
  // the end card's signature: measured, centred, the dot is its full stop
  const pr = L.signSize * 0.135;
  const signs = L.sign.map(([s, y], i) => { const w = measure(s, 400, L.signSize, -0.2), last = i === L.sign.length - 1; return { s, y, w, x0: W / 2 - (w + (last ? 2 * pr + 6 : 0)) / 2 }; });
  const lastSign = signs[signs.length - 1], PERIOD = { x: lastSign.x0 + lastSign.w + pr + 4, y: lastSign.y - pr, r: pr };
  const studioW = measure("STUDIO DE PRODUCTION VISUELLE", 600, L.studio[1], L.studio[2]);
  // the six poles, spaced evenly on the ring by their measured lengths
  const POLES = ["BRANDING", "AUDIOVISUEL", "PHOTOGRAPHIE", "DESIGN 2D · 3D", "MAPPING", "DIGITAL"];
  const Lc = 2 * Math.PI * L.RR, lens = POLES.map((p) => measure(p, 700, L.RF, 5)), gap = (Lc - lens.reduce((a, b) => a + b, 0)) / POLES.length;
  let o = 0; const slots = lens.map((l) => { const s = o / Lc; o += l + gap; return s; });
  // the halftone grid
  const dots: { x: number; y: number; d: number }[] = [];
  for (let y = -L.spacing / 2; y < H + L.spacing; y += L.spacing) for (let x = -L.spacing / 2; x < W + L.spacing; x += L.spacing) dots.push({ x, y, d: Math.hypot(x - CEN[0], y - CEN[1]) });
  // the monogram (as on the logo: one gradient per piece) and the Asik wordmark
  const MS = L.MW / MONO.w, MX = (W - L.MW) / 2, MY = L.MY, mm = (p: Pt): Pt => [MX + p[0] * MS, MY + p[1] * MS];
  const MODS = (["At", "Ab", "S", "B", "C", "D"] as const).map((k) => { const m = (MONO.modules as Record<string, { loop: number[]; c: number[] }>)[k]; return { k, d: ptsD(pairs(m.loop), mm), c: mm(m.c as Pt), g: k === "D" ? "gR" : k === "At" || k === "Ab" ? "gL" : "gA" }; });
  const grads = { gL: [MX, MY, MX + 152 * MS, MY + 300 * MS], gA: [MX + 152 * MS, MY, MX + 455 * MS, MY + 300 * MS], gR: [MX + 640 * MS, MY + 300 * MS, MX + 455 * MS, MY + 150 * MS] };
  const WMX = (W - 766 * L.WMS) / 2 - 167 * L.WMS, wmMap = (p: Pt): Pt => [WMX + p[0] * L.WMS, L.WMB - (679 - p[1]) * L.WMS];
  const WMD = WM.letters.map((l) => l.loops.map((lp) => ptsD(pairs(lp), wmMap)).join(""));
  return { labelX, LW, heroX, HX0, HB, RX0, ROWW, TOG, TCX, TCY, KON, KOFF, TIT, gPt, TAU, GEND, C3, CEN, signs, PERIOD, studioW, POLES, slots, dots, MODS, grads, WMD };
};
type Geo = ReturnType<typeof geometry>;

/* ───────── the dot: one continuous path through the film → a pill (w ≠ h) or a circle ───────── */
const SNAP = { z: 0.7, w: 22 };                                   // the last moves settle before the loop closes
const dotAt = (t: number, L: Layout, g: Geo) => {
  const { TCX, TCY, KON, TIT, GO } = { ...g, GO: L.GO }, { TW, TH } = L, s1 = TL.s1, s2 = TL.s2, s3 = TL.s3, s6 = TL.s6, s7 = TL.s7;
  const c = (x: number, y: number, r: number) => ({ x, y, w: 2 * r, h: 2 * r });
  if (t < s1.click) return { x: TCX, y: TCY, w: TW, h: TH };                                                         // the toggle's orange track (on)
  if (t < s1.click + 0.3) { const q = sp(t, s1.click, SNAP); return { x: lerp(TCX, KON, q), y: TCY, w: lerp(TW, 32, q), h: lerp(TH, 32, q) }; }   // off: it drains into a dot
  if (t < s1.jump) return c(KON, TCY, 16);
  if (t < s1.land) { const p = prog(t, s1.jump, s1.land - s1.jump, ease.inOut), q = arc([KON, TCY], [TIT.x, TIT.y], p, 300); return c(q[0], q[1], lerp(16, TIT.r + 2, p)); }   // onto the i
  if (t < s2.leave) { const s = sp(t, s1.land, SPRING.pop) - 1; return { x: TIT.x, y: TIT.y, w: 2 * (TIT.r + 2) * (1 - 0.3 * s), h: 2 * (TIT.r + 2) * (1 + 0.3 * s) }; }   // squash on landing
  if (t < s2.draw) { const p = prog(t, s2.leave, s2.draw - s2.leave, ease.inOut), q = arc([TIT.x, TIT.y], GO, p, 360); return c(q[0], q[1], lerp(TIT.r + 2, 15, p)); }
  if (t < s2.draw + g.TAU) { const q = g.gPt(t - s2.draw); return c(q[0], q[1], 15); }                                  // it draws the spring
  if (t < s3.shoot) return c(g.GEND[0], g.GEND[1], 15);
  if (t < s3.square) { const p = prog(t, s3.shoot, 0.4); return c(lerp(g.GEND[0], g.C3[0], p), lerp(g.GEND[1], g.C3[1], p), 15); }   // it shoots along the target line
  if (t < s3.dot) { const q = sp(t, s3.square, SPRING.elastic); return c(lerp(g.C3[0], g.CEN[0], q), lerp(g.C3[1], g.CEN[1], q), 15); }   // it rides the square
  if (t < s6.card) { const kick = TL.s4.poles.reduce((a, t0) => a + (t >= t0 ? Math.exp(-(t - t0) * 9) : 0), 0); return c(g.CEN[0], g.CEN[1], 26 + 6 * kick - 11 * (1 - sp(t, s3.dot, SPRING.pop))); }
  if (t < s6.out) { const p = prog(t, s6.card, 0.45, ease.inOut), q = arc(g.CEN, [g.PERIOD.x, g.PERIOD.y], p, 120); return c(q[0], q[1], lerp(26, g.PERIOD.r, p)); }   // it becomes the full stop
  if (t < s7.graph) { const p = prog(t, s6.out, s7.graph - s6.out, ease.inOut), q = arc([g.PERIOD.x, g.PERIOD.y], g.CEN, p, 160); return c(q[0], q[1], lerp(g.PERIOD.r, 18, p)); }   // the way back
  if (t < s7.toggle) { const q = g.gPt(g.TAU * (1 - expIn(lin(t, s7.graph, s7.toggle - s7.graph), 2))); return c(q[0], q[1], 15); }
  if (t < s7.refill) { const p = prog(t, s7.toggle, s7.refill - s7.toggle, ease.inOut), q = arc(GO, [KON, TCY], p, 260); return c(q[0], q[1], lerp(15, 16, p)); }
  { const q = sp(t, s7.refill, SNAP); return { x: lerp(KON, TCX, q), y: TCY, w: lerp(32, TW, q), h: lerp(32, TH, q) }; }   // it fills the track again (on)
};

/* ───────── the frame ───────── */
const Scene: React.FC<{ L: Layout }> = ({ L }) => {
  const ready = useFont();
  if (!ready) return <AbsoluteFill style={{ backgroundColor: C.LUNAIRE }} />;
  return <Frame L={L} />;
};
const N = FRAMES;
const Frame: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = ((useCurrentFrame() % N) + N) % N, t = frame / FPS;          // wraps: the blur of frame 0 is the end of the loop
  const g = useMemo(() => geometry(L), [L]);
  const { W, H, TW, TH, LS, HS, LB } = L, s1 = TL.s1, s2 = TL.s2, s3 = TL.s3, s4 = TL.s4, s5 = TL.s5, s6 = TL.s6, s7 = TL.s7;
  const back = t >= s7.toggle;                                                      // the last stretch of the loop: the settings row again
  const dark = (t >= s3.dot && t < s5.cream) || (t >= s6.out && t < s7.graph);

  // 1 · the settings row and the letters
  const fall = (t0: number, i: number) => { const p = prog(t, t0, 0.42, ease.in); return { y: 0.92 * H * p, r: (i % 2 ? 1 : -1) * 38 * p }; };
  const uiItems = [["head", 0], ["line1", 1], ["desc", 2], ["line2", 3]] as const;
  const uiOn = t < s1.letGo + 0.4 || back, togOn = t < s1.jump || back;
  const letters = [...LABEL].map((ch, i) => {
    if (ch === " " || !(t < s2.draw || back)) return null;
    const hero = i >= HERO0; let x = g.RX0 + g.labelX[i], y = LB, size = LS, k = 0, rot = 0;
    if (!back && !hero) { const f = fall(s1.letGo + 0.03 * i, i); y += f.y; rot = f.r; x += (i - 2.5) * 30 * lin(t, s1.letGo, 0.42); }
    if (!back && hero) {
      // the word grows as one (one spring: the spacing stays true, no letter runs into its neighbour);
      // the stagger lives only in a wave that lifts and bends each letter on its way
      const q = sp(t, s1.heroIn, SPRING.settle), w = Math.sin(Math.PI * clamp(sp(t, s1.heroIn + 0.03 * (i - HERO0), SPRING.settle)));
      x = lerp(x, g.HX0 + g.heroX[i - HERO0], q); y = lerp(y, g.HB, q) - 46 * w; size = lerp(LS, HS, q); k = clamp(q); rot = 9 * w * (i % 2 ? 1 : -1);
      if (t >= s2.leave) { const f = fall(s2.leave + 0.022 * (i - HERO0), i); y += f.y; rot += f.r; }             // and let go when the dot leaves
    }
    const cx = (gAdv(ch, k) * size) / UPM / 2;
    return <path key={i} fill={C.COSMOS} d={gD(ch, k, size, hero && i === DOT_I && t >= s1.land - 0.06 && !back)} transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)} ${f1(cx)} ${f1((-CAPH * size) / UPM / 2)})`} />;
  });
  const knobX = t < s1.click ? g.KON : t < s7.refill ? lerp(g.KON, g.KOFF, sp(t, s1.click, SPRING.knob)) : lerp(g.KOFF, g.KON, sp(t, s7.refill + 0.05, SNAP));
  const togFall = back ? { y: 0, r: 0 } : fall(s1.letGo + 0.12, 1);
  // the knob sits on the orange track while the toggle is on; once it is off, the growing word passes over it
  const knob = <circle cx={knobX} cy={g.TCY + togFall.y} r={TH / 2 - 7} fill={C.BLANC} />, knobOnTop = t < s1.click + 0.3 || back;

  // the cursor (and its click)
  const home = L.home, away = L.away, onTog: Pt = [g.TCX + 18, g.TCY + 14];
  let cur: Pt = [home[0], home[1]], press = 1;
  if (t < s1.click) { const q = sp(t, s1.cursorIn, { z: 0.75, w: 9 }); cur = [lerp(home[0], onTog[0], q), lerp(home[1], onTog[1], q)]; press = t > s1.click - 0.08 ? 0.86 : 1; }
  else if (t < s1.click + 0.1) { cur = onTog; press = 0.86 + 0.14 * lin(t, s1.click, 0.1); }
  else if (t < s7.toggle + 0.05) { const q = prog(t, s1.click + 0.25, 0.55, ease.in); cur = [lerp(onTog[0], away[0], q), lerp(onTog[1], away[1], q)]; }
  else { const q = prog(t, s7.toggle + 0.05, 0.62); cur = [lerp(away[0], home[0], q), lerp(away[1], home[1], q)]; }
  const ripple = lin(t, s1.click, 0.4);

  // 2 · the graph
  const grOn = (t >= s2.leave && t < s3.square) || (t >= s7.graph && t < s7.toggle), gBack = t >= s7.graph;
  const ga = gBack ? 1 : prog(t, s2.axes, 0.4);
  const tau = gBack ? g.TAU * (1 - expIn(lin(t, s7.graph, s7.toggle - s7.graph), 2)) : clamp(t - s2.draw, 0, g.TAU);
  let curve = ""; for (let i = 0; i <= 120; i++) { const q = g.gPt((tau * i) / 120); curve += (i ? "L" : "M") + f1(q[0]) + " " + f1(q[1]); }
  const callQ = sp(t, s2.callout, SPRING.pop), callN = Math.min(6, Math.floor(6 * lin(t, s2.callout, 0.32)) + 1);

  // 3 · the light, then one shape: a square that turns, stretches into a pill and becomes the night
  const vR = 15 + L.violet * prog(t, s3.light, 0.42, ease.out);
  const q1 = sp(t, s3.square, SPRING.elastic), q2 = sp(t, s3.pill, SPRING.knob), q3 = expIn(lin(t, s3.night, s3.dot - s3.night), 3);
  const shCx = lerp(g.C3[0], g.CEN[0], q1), shCy = lerp(g.C3[1], g.CEN[1], q1);
  let shW = L.square * q1, shH = L.square * q1; shW = lerp(shW, L.pill[0], q2); shH = lerp(shH, L.pill[1], q2); shW = lerp(shW, L.cover[0], q3); shH = lerp(shH, L.cover[1], q3);
  const shRx = lerp(0.24 * Math.min(shW, shH), Math.min(shW, shH) / 2, q2), shRot = lerp(135 * q1, 180, q2);

  // 4 · the poles drop into orbit, then the ring opens
  const open = L.open * expIn(lin(t, s4.open, 0.5), 3);
  const spin = 0.05 * (t - s3.dot) + 0.04 * s4.poles.reduce((a, t0) => a + sp(t, t0, SPRING.pop), 0);

  // 5 · the halftone (and its way back)
  const htOn = (t >= s4.open && t < s5.cream) || (t >= s6.out && t < s7.graph), htBack = t >= s6.out;
  const ringR = htBack ? 4000 : L.RR + open, base = htBack ? lerp(70, 0, prog(t, s6.out, 0.33, ease.in)) : lerp(3, 70, expIn(lin(t, s5.halftone, s5.cream - s5.halftone - 0.02), 2.4));

  // 6 · the end card (it falls away with the cream on the way back)
  const cardOn = t >= s6.card && t < s7.graph, cardFall = H * prog(t, s6.out, 0.32, ease.in);
  const studioHalf = (g.studioW / 2 + 12) * prog(t, s6.studio, 0.5);

  // the dot, stretched along its own velocity when it is round
  const d = dotAt(t, L, g), d0 = dotAt(t - 1 / FPS, L, g), vx = (d.x - d0.x) * FPS, vy = (d.y - d0.y) * FPS, speed = Math.hypot(vx, vy);
  const round = Math.abs(d.w - d.h) < 0.5, st = round ? Math.min(0.5, speed / 4200) : 0;

  // texture: a drifting halftone grid on the cream, a vignette on the night, grain everywhere (on twos)
  const drift = (t * 7) % 40;
  return (
    <AbsoluteFill style={{ backgroundColor: dark ? C.NUIT : C.LUNAIRE }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse" patternTransform={`translate(${f1(drift)} ${f1(drift * 0.6)})`}>
            <circle cx={20} cy={20} r={1.5} fill={C.BRUME} />
          </pattern>
          <radialGradient id="light" gradientUnits="userSpaceOnUse" cx={g.C3[0]} cy={g.C3[1]} r={Math.hypot(W, H)}><stop offset={0} stopColor={C.HALO} /><stop offset={0.42} stopColor={C.LUNA} /><stop offset={1} stopColor={C.AURA} /></radialGradient>
          <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="55%" stopColor={C.COSMOS} stopOpacity={0} /><stop offset="100%" stopColor={C.COSMOS} stopOpacity={0.45} /></radialGradient>
          {Object.entries(g.grads).map(([id, [x1, y1, x2, y2]]) => (
            <linearGradient key={id} id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}><stop offset={0} stopColor={C.LOGO_A} /><stop offset={1} stopColor={C.LOGO_B} /></linearGradient>
          ))}
          {g.POLES.map((_, i) => <path key={i} id={`ring${i}`} d={ring2(g.CEN[0], g.CEN[1], L.RR + 220 * (1 - sp(t, s4.poles[i], SPRING.pop)) + open)} fill="none" />)}
          <clipPath id="wClip"><rect x={0} y={0} width={W} height={L.WMB + 1} /></clipPath>
          <clipPath id="sClip"><rect x={W / 2 - studioHalf} y={L.studio[0] - 34} width={2 * studioHalf} height={50} /></clipPath>
          {g.signs.map((s, i) => { const n = g.signs.length, q = prog(t, s6.sign + 0.14 * i, 0.5 - 0.12 * (n - 1)), end = i === n - 1 ? g.PERIOD.x : s.x0 + s.w; return <clipPath key={i} id={`gClip${i}`}><rect x={s.x0 - 4} y={s.y - 52} width={(end - s.x0) * q + 4} height={70} /></clipPath>; })}
        </defs>
        {!dark && <rect width={W} height={H} fill="url(#grid)" />}

        {/* 1 · the settings row */}
        {uiOn && uiItems.map(([key, i]) => {
          const f = back ? { y: 0, r: 0 } : fall(s1.letGo + 0.04 * i, i), tr = `translate(0 ${f1(f.y)}) rotate(${f1(f.r)} ${W / 2} ${LB})`, UIX = Math.min(64, g.RX0 - 24);
          if (key === "head") return <text key={key} x={g.RX0} y={LB + L.uiHead} fill={C.ARDOISE} style={typeStyle(600, L.uiHeadSize, 5.5)} transform={tr}>SETTINGS  ·  CREATIVE STUDIO</text>;
          if (key === "desc") return <text key={key} x={g.RX0} y={LB + L.uiDesc} fill={C.ARDOISE} style={typeStyle(500, L.uiDescSize, 0.3)} transform={tr}>Keep every idea inside the frame.</text>;
          const y = LB + (key === "line1" ? L.uiLine1 : L.uiLine2);
          return <line key={key} x1={g.RX0 - UIX} x2={g.RX0 + g.ROWW + UIX} y1={y} y2={y} stroke={C.BRUME} strokeWidth={2} transform={tr} />;
        })}
        {togOn && <g transform={`translate(0 ${f1(togFall.y)}) rotate(${f1(togFall.r)} ${g.TCX} ${g.TCY})`}><rect x={g.TOG.x} y={g.TOG.y} width={TW} height={TH} rx={TH / 2} fill={C.BRUME} /></g>}
        {togOn && !knobOnTop && knob}
        {letters}

        {/* 2 · the graph */}
        {grOn && (
          <g>
            {[2, 4, 6].map((v, i) => <line key={v} x1={L.GO[0]} y1={L.GO[1] - L.VS * v} y2={L.GO[1] - L.VS * v} x2={L.GO[0] + (i === 2 ? L.GW + L.grid6 : L.GW + 60) * (gBack ? 1 : prog(t, s2.axes + 0.1 + 0.05 * i, 0.4))} stroke={v === 6 ? C.ARDOISE : C.BRUME} strokeWidth={2} strokeDasharray={v === 6 ? "10 12" : undefined} />)}
            {(gBack || t >= s2.axes + 0.25) && [2, 4, 6].map((v) => <text key={v} x={L.GO[0] - 26} y={L.GO[1] - L.VS * v + 8} textAnchor="end" fill={C.ARDOISE} style={typeStyle(600, 22)}>{v}</text>)}
            {(gBack || t >= s2.axes + 0.25) && <text x={L.GO[0] + L.GW + 40} y={L.GO[1] + 44} textAnchor="end" fill={C.ARDOISE} style={typeStyle(600, 17, 5)}>TEMPS</text>}
            {(gBack || t >= s2.axes + 0.25) && <text x={L.GO[0]} y={L.GO[1] - L.VS * 7.9 - 26} fill={C.ARDOISE} style={typeStyle(600, 17, 5)}>PÔLES</text>}
            <line x1={L.GO[0]} y1={L.GO[1]} x2={L.GO[0] + (L.GW + 60) * ga} y2={L.GO[1]} stroke={C.COSMOS} strokeWidth={3} />
            <line x1={L.GO[0]} y1={L.GO[1]} x2={L.GO[0]} y2={L.GO[1] - L.VS * 8 * ga} stroke={C.COSMOS} strokeWidth={3} />
            {tau > 0.001 && <path d={curve} fill="none" stroke={C.COSMOS} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
            {!gBack && t >= s2.callout && (
              <g transform={`translate(${f1(-40 * (1 - callQ))} 0)`}>
                <text x={L.call.n[0]} y={L.call.n[1]} fill={C.COSMOS} style={typeStyle(800, L.call.n[2], -4)}>{callN}</text>
                <text x={L.call.l1[0]} y={L.call.l1[1]} fill={C.COSMOS} style={typeStyle(700, L.call.l1[2], -0.5)}>pôles</text>
                <text x={L.call.l2[0]} y={L.call.l2[1]} fill={C.COSMOS} style={typeStyle(500, L.call.l2[2], -0.5)}>d'expertise</text>
              </g>
            )}
          </g>
        )}

        {/* 3 · the light and the shape */}
        {t >= s3.light && t < s3.dot && <circle cx={g.C3[0]} cy={g.C3[1]} r={vR} fill="url(#light)" />}
        {t >= s3.square && t < s3.dot && <rect x={shCx - shW / 2} y={shCy - shH / 2} width={shW} height={shH} rx={shRx} fill={C.NUIT} transform={`rotate(${f1(shRot)} ${f1(shCx)} ${f1(shCy)})`} />}
        {dark && <rect width={W} height={H} fill="url(#vig)" />}

        {/* 4 · the poles */}
        {t >= s4.poles[0] - 0.1 && t < s5.cream - 0.5 && g.POLES.map((p, i) => {
          if (t < s4.poles[i]) return null;
          const q = sp(t, s4.poles[i], SPRING.pop), off = g.slots[i] + spin;
          return <text key={p} fill={C.LUNAIRE} style={typeStyle(700, L.RF, lerp(9, 5, clamp(q)))}><textPath href={`#ring${i}`} startOffset={`${(50 * (((off % 1) + 1) % 1)).toFixed(2)}%`}>{p}</textPath></text>;
        })}

        {/* 5 · the halftone */}
        {htOn && g.dots.map((p, i) => (p.d < ringR - 24 ? <circle key={i} cx={p.x} cy={p.y} r={f1(base * (0.35 + 0.65 * Math.exp(-p.d / L.falloff)))} fill={C.LUNAIRE} /> : null))}

        {/* 6 · the end card */}
        {cardOn && (
          <g transform={`translate(0 ${f1(cardFall)})`}>
            {g.MODS.map((m, i) => { const q = sp(t, s6.card + 0.045 * i, SPRING.pop); return <path key={m.k} d={m.d} fill={`url(#${m.g})`} stroke={`url(#${m.g})`} strokeWidth={1} strokeLinejoin="round" transform={`translate(${f1(m.c[0])} ${f1(m.c[1])}) scale(${Math.max(0.001, q).toFixed(4)}) translate(${f1(-m.c[0])} ${f1(-m.c[1])})`} />; })}
            <g clipPath="url(#wClip)">{g.WMD.map((dd, i) => <path key={i} d={dd} fill={C.COSMOS} transform={`translate(0 ${f1(80 * (1 - sp(t, s6.wordmark + 0.035 * i, SPRING.settle)))})`} />)}</g>
            {t >= s6.studio && <text x={W / 2} y={L.studio[0]} textAnchor="middle" fill={C.ARDOISE} style={typeStyle(600, L.studio[1], L.studio[2])} clipPath="url(#sClip)">STUDIO DE PRODUCTION VISUELLE</text>}
            {t >= s6.sign && g.signs.map((s, i) => <text key={i} x={s.x0} y={s.y} fill={C.COSMOS} style={typeStyle(400, L.signSize, -0.2)} clipPath={`url(#gClip${i})`}>{s.s}</text>)}
          </g>
        )}

        {/* the click's ripple, the dot, the knob, the cursor */}
        {ripple > 0 && ripple < 1 && <circle cx={onTog[0] - 18} cy={onTog[1] - 14} r={f1(18 + 70 * ease.out(ripple))} fill="none" stroke={C.COSMOS} strokeWidth={2.5 * (1 - ripple)} opacity={0.35 * (1 - ripple)} />}
        {round ? (
          <ellipse cx={d.x} cy={d.y} rx={(d.w / 2) * (1 + st)} ry={d.w / 2 / (1 + st)} fill={C.ECLIPSE} transform={`rotate(${f1((Math.atan2(vy, vx) * 180) / Math.PI)} ${f1(d.x)} ${f1(d.y)})`} />
        ) : (
          <rect x={d.x - d.w / 2} y={d.y - d.h / 2} width={d.w} height={d.h} rx={Math.min(d.w, d.h) / 2} fill={C.ECLIPSE} />
        )}
        {togOn && knobOnTop && knob}
        {cur[0] < W + 40 && cur[1] < H + 40 && <path d="M0 0L0 50L12 38L21 59L30 55L21 34L38 34Z" fill={C.COSMOS} stroke={C.BLANC} strokeWidth={3} strokeLinejoin="round" transform={`translate(${f1(cur[0])} ${f1(cur[1])}) scale(${(1.35 * press).toFixed(3)})`} />}
      </svg>
    </AbsoluteFill>
  );
};

export const AuraPoint: React.FC<{ format: "h" | "v" }> = ({ format }) => (
  <AbsoluteFill>
    <MotionBlur><Scene L={LAYOUT[format]} /></MotionBlur>
    <Grain W={LAYOUT[format].W} H={LAYOUT[format].H} />
  </AbsoluteFill>
);
