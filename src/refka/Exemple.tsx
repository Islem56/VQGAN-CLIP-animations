// Dr Refka Abderrahim — the example Reel in motion (16.4 s, 33 beats at 121 BPM), on the reference's beats: hook, B-roll
// window, 3D elements behind her, keyword punch-in, full-screen PRP scene, end card. The speaker is a stand-in: the one
// clean span of the reference (22.5–26.3 s), cut out frame by frame, played forward and back across the jump cuts.
import React from "react";
import { AbsoluteFill, Easing, Img, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, useFont } from "../shared/motion";
import { CAIRO, goldText, HANDLE, R, whiteText } from "./theme";
import { Follicle, IGGlyph, IGTag, Part, Window } from "./elements2d";
import { Backdrop, Capsule, DNA, Droplets, Mineral, Molecule, Scene, Softgel, Tube, Vitamin } from "./elements3d";

import TL from "./timeline.json";

export const FPS = 30, BPM = TL.bpm, BEAT = 60 / BPM;
/** the cuts, in beats (timeline.json, read by the sound pass too): every change of shot lands on the music */
export const SEG = TL.seg;
export const at = (beats: number) => beats * BEAT;
export const FRAMES = Math.ceil(at(SEG.out) * FPS);
const F = (beats: number) => Math.round(at(beats) * FPS);

const out = Easing.bezier(0.16, 1, 0.3, 1), inOut = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const prog = (t: number, t0: number, d: number, e = out) => e(clamp((t - t0) / d));
/** every jump cut lands with a small push that settles in 0.28 s */
const punch = (u: number) => 1 + 0.04 * (1 - prog(u, 0, 0.28));

/* ───────── the speaker: which source frame each output frame shows ───────── */
const S0 = 675, S1 = 788;
const srcAt = (f: number) => {
  const i = (b: number) => f - F(b);
  let n: number;
  if (f < F(SEG.window)) n = S0 + i(SEG.hook);
  else if (f < F(SEG.elements)) n = S1 - i(SEG.window);
  else if (f < F(SEG.keyword)) n = 690 + i(SEG.elements);
  else if (f < F(SEG.full)) n = 765 - i(SEG.keyword);
  else n = S0 + Math.floor(i(SEG.full) * 0.94);
  return Math.min(S1, Math.max(S0, n));
};
const full: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920 };
const framing = (zoom: number, cy = 700): React.CSSProperties => ({ transform: `scale(${zoom})`, transformOrigin: `540px ${cy}px` });
const Plate: React.FC<{ n: number; zoom?: number; cy?: number; dim?: number }> = ({ n, zoom = 1, cy, dim = 0.9 }) =>
  <Img src={staticFile(`refka/seq/plate-${n}.jpg`)} style={{ ...full, ...framing(zoom, cy), filter: `brightness(${dim})` }} />;
const Person: React.FC<{ n: number; zoom?: number; cy?: number }> = ({ n, zoom = 1, cy }) =>
  <Img src={staticFile(`refka/seq/person-${n}.webp`)} style={{ ...full, ...framing(zoom, cy) }} />;

/* ───────── type, word by word: each word rises 22 % of its size, sharpens and settles (type never bounces) ───────── */
const goldFilter = (flash: number) => `drop-shadow(0 0 ${16 + 26 * flash}px rgba(227,188,99,${0.55 + 0.35 * flash})) drop-shadow(0 3px 5px rgba(0,0,0,0.45))`;
const AnimLine: React.FC<{ parts: Part[]; y: number; size: number; t: number; t0: number; stagger?: number; weight?: number; dur?: number; lift?: number }> = ({ parts, y, size, t, t0, stagger = 0.12, weight = 800, dur = 0.34, lift = 0.22 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.95, height: size * 1.9, display: "flex", justifyContent: "center", alignItems: "center", direction: "rtl", gap: size * 0.28, fontFamily: CAIRO, fontWeight: weight, fontSize: size, lineHeight: 1.6 }}>
    {parts.map((p, i) => {
      const k = prog(t, t0 + i * stagger, dur), flash = p.gold ? 1 - prog(t, t0 + i * stagger + dur * 0.4, 0.6) : 0;
      const blur = (1 - k) * 7;
      const base = p.gold ? { ...goldText, filter: `blur(${blur}px) ${goldFilter(flash * k)}` } : { ...whiteText, filter: `blur(${blur}px)` };
      return <span key={i} style={{ ...base, display: "inline-block", opacity: k, transform: `translateY(${(1 - k) * lift * size}px) scale(${1.08 - 0.08 * k})` }}>{p.t}</span>;
    })}
  </div>
);

const Fade: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => <div style={{ ...full, opacity: o }}>{children}</div>;

/* ───────── 3D: an element springs out from behind her to its place, then floats ───────── */
type At = [number, number];
const Pop: React.FC<{ to: At; u: number; d: number; ph: number; z?: number; amp?: number; children: React.ReactNode }> = ({ to, u, d, ph, z = 0, amp = 8, children }) => {
  const p = spring({ frame: Math.max(0, (u - d) * FPS), fps: FPS, config: { damping: 12, stiffness: 170, mass: 0.7 } });
  const cx = 540, cy = 820, k = 1 - Math.min(1, p);
  const x = to[0] + (cx - to[0]) * k * 0.4, y = to[1] + (cy - to[1]) * k * 0.4 + Math.sin(u * 1.3 + ph) * amp;
  return <group position={[x - 540, 960 - y, z]} scale={Math.max(0.001, p)}>{children}</group>;
};
const O: At = [540, 960]; // elements are drawn at the group's origin

const Hook: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const rise = prog(t, 0.36, 0.55);
  return (
    <>
      <Plate n={srcAt(f)} zoom={1 + 0.03 * prog(t, 0, at(SEG.window), inOut)} />
      <div style={{ ...full, background: "linear-gradient(180deg, rgba(8,6,5,0.62) 0%, rgba(8,6,5,0.38) 20%, rgba(8,6,5,0) 34%)" }} />
      <AnimLine parts={[{ t: "علاش" }, { t: "يطيـــح" }]} y={262} size={100} t={t} t0={0.1} />
      <div style={{ ...full, opacity: rise, transform: `translateY(${(1 - rise) * 140}px)` }}>
        <AnimLine parts={[{ t: "الشعر؟", gold: true }]} y={396} size={158} weight={900} t={t} t0={0.36} lift={0} />
      </div>
      <Person n={srcAt(f)} zoom={1 + 0.03 * prog(t, 0, at(SEG.window), inOut)} />
    </>
  );
};

const WindowShot: React.FC<{ f: number; u: number }> = ({ f, u }) => {
  const k = prog(u, 0.04, 0.5), zoom = punch(u);
  return (
    <>
      <Plate n={srcAt(f)} zoom={zoom} />
      <div style={{ ...full, opacity: k, transform: `translateY(${(1 - k) * -36}px) scale(${0.86 + 0.14 * k})`, transformOrigin: "540px 416px" }}>
        <Window x={120} y={196} w={840} h={440}>
          <div style={{ transform: `scale(${1 + 0.05 * prog(u, 0, 3, inOut)})`, transformOrigin: "20% 70%" }}><Follicle w={832} h={432} t={u} /></div>
        </Window>
      </div>
      <Person n={srcAt(f)} zoom={zoom} />
      <AnimLine parts={[{ t: "خليني" }, { t: "نقولك" }, { t: "السبب", gold: true }]} y={1236} size={66} t={u} t0={0.42} />
    </>
  );
};

const ElementsShot: React.FC<{ f: number; u: number }> = ({ f, u }) => {
  const zoom = (1 + 0.03 * prog(u, 0, 3, inOut)) * punch(u), s = (x: number) => Math.sin(u * 0.9 + x);
  return (
    <>
      <Plate n={srcAt(f)} zoom={zoom} dim={0.9 - 0.16 * prog(u, 0, 0.35)} />
      <Scene style={{ filter: "blur(5px)" }}>
        <Pop to={[250, 372]} u={u} d={0.2} ph={1}><Vitamin at={O} r={30} label="D" turn={0.3 + 0.3 * s(1)} /></Pop>
        <Pop to={[690, 250]} u={u} d={0.24} ph={2}><Vitamin at={O} r={27} label="E" turn={-0.4 + 0.3 * s(2)} /></Pop>
        <Pop to={[420, 196]} u={u} d={0.28} ph={3}><Softgel at={O} r={22} rot={[0.3, 0.2 + u * 0.4, -0.5]} /></Pop>
        <Pop to={[150, 720]} u={u} d={0.22} ph={4}><DNA at={O} s={0.5} rot={[0.2, 0.3, 0.35]} n={12} spin={u * 1.2} /></Pop>
        <Pop to={[960, 1030]} u={u} d={0.3} ph={5}><Molecule at={O} s={0.55} rot={[0.6, 0.2 + u * 0.5, 0.4]} /></Pop>
        <Pop to={[600, 330]} u={u} d={0.26} ph={6}><Mineral at={O} r={30} label="Mg" name="MAGNÉSIUM" rot={[0, 0.3 + 0.2 * s(6), 0.2]} /></Pop>
      </Scene>
      <Scene>
        <Pop to={[170, 520]} u={u} d={0.06} ph={0.5}><Vitamin at={O} r={64} label="C" turn={0.35 + 0.35 * s(0.5)} tilt={-0.1} /></Pop>
        <Pop to={[930, 650]} u={u} d={0.1} ph={1.5}><Vitamin at={O} r={56} label="B12" turn={-0.3 + 0.3 * s(1.5)} tilt={0.08} /></Pop>
        <Pop to={[290, 290]} u={u} d={0.14} ph={2.5}><Softgel at={O} r={44} rot={[0.4, 0.3 + u * 0.35, 0.55]} /></Pop>
        <Pop to={[830, 262]} u={u} d={0.12} ph={3.5}><Molecule at={O} s={0.92} rot={[0.4, -0.5 + u * 0.45, 0.2]} /></Pop>
        <Pop to={[122, 868]} u={u} d={0.08} ph={4.5}><Mineral at={O} r={62} label="Zn" name="ZINC" rot={[0, 0.25 + 0.25 * s(4.5), -0.18]} /></Pop>
        <Pop to={[968, 868]} u={u} d={0.16} ph={5.5}><Capsule at={O} r={30} len={118} rot={[0.2, 0.3 + u * 0.5, -0.9]} /></Pop>
        <Pop to={[88, 1150]} u={u} d={0.18} ph={6.5}><Mineral at={O} r={46} label="Fe" name="FER" rot={[0.1, -0.2 + 0.25 * s(6.5), 0.25]} /></Pop>
      </Scene>
      <Person n={srcAt(f)} zoom={zoom} />
      <Scene style={{ filter: "blur(13px)" }}>
        <Pop to={[40, 1560 - u * 30]} u={u} d={0.3} ph={0} amp={14} z={300}><Vitamin at={O} r={128} label="A" turn={0.6 + u * 0.2} /></Pop>
        <Pop to={[1060, 1380 - u * 26]} u={u} d={0.34} ph={1} amp={14} z={300}><Softgel at={O} r={78} rot={[0.2, 0.1 + u * 0.3, 0.9]} /></Pop>
      </Scene>
      <AnimLine parts={[{ t: "نقص" }, { t: "الفيتامينات", gold: true }]} y={1236} size={68} t={u} t0={0.5} />
    </>
  );
};

const KeywordShot: React.FC<{ f: number; u: number }> = ({ f, u }) => {
  const zoom = 1.22 + 0.035 * prog(u, 0, 2, inOut);
  return (
    <>
      <Plate n={srcAt(f)} zoom={zoom} cy={640} />
      <Person n={srcAt(f)} zoom={zoom} cy={640} />
      <AnimLine parts={[{ t: "تحاليـــل" }]} y={1150} size={124} t={u} t0={0.06} />
      <AnimLine parts={[{ t: "كاملة", gold: true }]} y={1318} size={178} weight={900} t={u} t0={0.3} lift={0.12} />
    </>
  );
};

const FullShot: React.FC<{ f: number; u: number }> = ({ f, u }) => {
  const r = 1500 * prog(u, 0, 0.6, inOut);
  const rise = (d: number) => 1 - spring({ frame: Math.max(0, (u - d) * FPS), fps: FPS, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  return (
    <>
      <Plate n={srcAt(f)} />
      <div style={{ ...full, clipPath: `circle(${r}px at 540px 720px)` }}>
        <Scene background={R.NUIT}>
          <Backdrop />
          <group position={[0, -rise(0.12) * 520, 0]}><Tube at={[560, 470]} r={46} len={560} tilt={0.06} turn={u * 0.2} z={-600} /></group>
          <group position={[0, -rise(0.2) * 900, 0]}><Tube at={[176, 1010]} r={86} len={1040} tilt={-0.17} turn={0.3 + u * 0.15} /></group>
          <group position={[0, -rise(0.28) * 900, 0]}><Tube at={[928, 900]} r={78} len={960} tilt={0.15} turn={-0.3 - u * 0.15} /></group>
          <Droplets n={22} box={[60, 140, 1020, 640]} rMin={4} rMax={15} seed="prp" z={200} t={u} />
        </Scene>
      </div>
      <Person n={srcAt(f)} />
      <AnimLine parts={[{ t: "جلسات" }, { t: "البلازما", gold: true }]} y={1240} size={96} weight={900} t={u} t0={0.55} stagger={0.16} />
    </>
  );
};

const mont = (w: number, size: number, ls = 0): React.CSSProperties => ({ fontFamily: FONT, fontWeight: w, fontVariationSettings: `'wght' ${w}`, fontSize: size, letterSpacing: `${ls}em` });
const EndShot: React.FC<{ u: number }> = ({ u }) => {
  const a = prog(u, 0.08, 0.5), b = prog(u, 0.22, 0.5), line = prog(u, 0.36, 0.5, inOut), g = prog(u, 0.48, 0.55), h = prog(u, 0.66, 0.5);
  const up = (k: number): React.CSSProperties => ({ opacity: k, transform: `translateY(${(1 - k) * 18}px)` });
  return (
    <div style={{ ...full, background: `radial-gradient(70% 45% at 50% 46%, #1A1511 0%, ${R.NOIR} 70%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: CAIRO, fontWeight: 700, fontSize: 64, direction: "rtl", ...whiteText, ...up(a) }}>د. رفقة عبد الرحيم</div>
      <div style={{ ...mont(500, 24, 0.34), color: R.OR, marginTop: 14, marginRight: "-0.34em", ...up(b) }}>DR REFKA ABDERRAHIM</div>
      <div style={{ width: 64, height: 2, background: R.OR, opacity: 0.6, margin: "64px 0 70px", transform: `scaleX(${line})` }} />
      <div style={{ opacity: g, transform: `scale(${0.86 + 0.14 * g})`, filter: `drop-shadow(0 0 ${22 + 20 * (1 - prog(u, 0.6, 0.8))}px rgba(227,188,99,0.5))` }}><IGGlyph size={124} color={R.OR} stroke={3} /></div>
      <div style={{ ...mont(600, 30, 0.1), color: R.BLANC, marginTop: 34, ...up(h) }}>{HANDLE}</div>
    </div>
  );
};

/** the account tag: top right, down by the subtitles while the window holds the top */
const Tag: React.FC<{ t: number }> = ({ t }) => {
  const inWin = t >= at(SEG.window) && t < at(SEG.elements);
  const k = t < at(SEG.window) ? prog(t, 0.3, 0.3) : inWin ? prog(t, at(SEG.window) + 0.3, 0.3) : 1;
  return <Fade o={k}>{inWin ? <IGTag x={64} y={1318} align="left" /> : <IGTag x={1012} y={430} />}</Fade>;
};

const Label: React.FC<{ end: boolean }> = ({ end }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, display: "flex", justifyContent: "center" }}>
    <div style={{ ...mont(600, 20, 0.16), color: "rgba(255,255,255,0.85)", background: "rgba(10,9,8,0.55)", padding: "12px 24px", borderRadius: 999, textTransform: "uppercase" }}>
      Exemple{end ? null : <span style={{ color: "rgba(255,255,255,0.5)" }}> · image de la vidéo référence</span>}
    </div>
  </div>
);

export const RefkaExemple: React.FC = () => {
  const ready = useFont(), f = useCurrentFrame(), t = f / FPS;
  if (!ready) return <AbsoluteFill style={{ backgroundColor: R.NOIR }} />;
  const u = (b: number) => t - at(b);
  const shot =
    f < F(SEG.window) ? <Hook f={f} t={t} /> :
    f < F(SEG.elements) ? <WindowShot f={f} u={u(SEG.window)} /> :
    f < F(SEG.keyword) ? <ElementsShot f={f} u={u(SEG.elements)} /> :
    f < F(SEG.full) ? <KeywordShot f={f} u={u(SEG.keyword)} /> :
    f < F(SEG.end) ? <FullShot f={f} u={u(SEG.full)} /> : <EndShot u={u(SEG.end)} />;
  const end = f >= F(SEG.end);
  return (
    <AbsoluteFill style={{ backgroundColor: R.NOIR, overflow: "hidden" }}>
      {shot}
      {end ? null : <Tag t={t} />}
      <Label end={end} />
    </AbsoluteFill>
  );
};
