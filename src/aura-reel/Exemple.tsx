// « Pourquoi l'art, le design et la technologie ensemble » — the example (animatic) of the founder's Reel: a silhouette
// stands where she will be, the projection behind her follows the script (point → line → circle, square, triangle →
// monogram → AURA LUNA → the point), with the on-screen titles, the subtitles and the cuts between the two framings.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, clamp, ease, lerp, lin, prog, sp, SPRING } from "../aura-point/lib";
import { typeStyle, useFont } from "../shared/motion";
import { MODULES, monoPath, wordmarkLetters } from "../aura-charte/pages/brand";

export const REEL_FPS = 30, REEL_SECONDS = 55;
const W = 1080, H = 1920;

/** the subtitles: [from, to, line]; *word* is a key word, set in Halo */
const SUBS: [number, number, string][] = [
  [0, 1.8, "On m'a souvent demandé de choisir :"], [1.8, 3.6, "*artiste*, *designer*… ou *technicienne*."], [3.8, 5, "J'ai choisi *les trois*."],
  [5, 7.2, "Je suis diplômée en *Arts Médiatiques*."], [7.2, 9.6, "Un nom un peu mystérieux, pour une idée simple :"], [9.6, 11.4, "créer avec les *outils de son époque*."],
  [11.4, 13.2, "La vidéo, la lumière, le son, la 3D."], [13.2, 15, "Ici, la caméra et l'ordinateur sont des *pinceaux*."],
  [15, 16.6, "L'*art*, c'est le regard :"], [16.6, 19, "une émotion, une idée qu'on n'a jamais vue."], [19, 20.6, "Le *design*, c'est la structure :"],
  [20.6, 22.6, "il rend cette idée claire et juste."], [22.6, 24.4, "La *technologie*, c'est le mouvement :"], [24.4, 28, "elle l'anime et la projette en grand."],
  [32, 34.4, "En 1923, le *Bauhaus* l'avait déjà écrit :"], [34.4, 36.6, "art et technique, une nouvelle unité."], [36.6, 39.6, "Cent ans plus tard, c'est toujours ma façon de travailler."],
  [39.6, 42, "*Aura Luna* est né de là."], [42, 45.4, "Une identité de marque, un film, une projection sur une façade :"], [45.4, 47.8, "je pars d'une idée, je lui donne une *forme*,"],
  [47.8, 50, "puis je lui donne *vie*."], [50, 52.6, "Et vous : plutôt art, design ou technologie ?"], [52.6, 55, "Dites-le-moi en commentaire."],
];
/** the framing of each moment: true = close-up */
const CLOSE: [number, number][] = [[0, 3.6], [19, 22.6], [28, 32], [50, 55]];
const isClose = (t: number) => CLOSE.some(([a, b]) => t >= a && t < b);

/** a subtitle on one or two lines (never wider than the frame), key words lit */
const Sub: React.FC<{ text: string }> = ({ text }) => {
  const words: { w: string; key: boolean }[] = [];
  text.split(/(\*[^*]+\*)/).forEach((seg) => { const key = seg.startsWith("*"); (key ? seg.slice(1, -1) : seg).split(" ").filter(Boolean).forEach((w) => words.push({ w, key })); });
  const total = words.reduce((n, x) => n + x.w.length + 1, 0);
  let lines = [words];
  if (total > 32) {               // break at the word closest to the middle
    let n = 0, cut = 1;
    for (let i = 0; i < words.length; i++) { n += words[i].w.length + 1; if (n >= total / 2) { cut = i + 1; break; } }
    lines = [words.slice(0, cut), words.slice(cut)];
  }
  const y0 = 1330 - (lines.length - 1) * 30;
  return <>{lines.map((ln, j) => (
    <text key={j} x={W / 2} y={y0 + j * 60} textAnchor="middle" style={{ ...typeStyle(600, 46), paintOrder: "stroke" }} stroke={C.COSMOS} strokeWidth={10} strokeOpacity={0.55} fill={C.BLANC}>
      {ln.map((x, i) => <tspan key={i} fill={x.key ? C.BRUME : C.BLANC}>{(i ? " " : "") + x.w}</tspan>)}
    </text>
  ))}</>;
};

/** a title block at the top, fading in and out */
const Title: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  const o = prog(t, a, 0.25) * (1 - prog(t, b - 0.2, 0.2));
  return o > 0 ? <g opacity={o} transform={`translate(0 ${(12 * (1 - prog(t, a, 0.4))).toFixed(1)})`}>{children}</g> : null;
};

export const ReelExemple: React.FC = () => {
  const ready = useFont(), t = useCurrentFrame() / REEL_FPS;
  if (!ready) return <AbsoluteFill style={{ backgroundColor: C.COSMOS }} />;
  const close = isClose(t);
  // the projection: point → line → shapes → monogram → wordmark → the point
  const lineP = ease.inOut(lin(t, 5.2, 2.4)), L0 = [170, 930], L1 = [910, 500];
  const head: [number, number] = [lerp(L0[0], L1[0], lineP), lerp(L0[1], L1[1], lineP)];
  const shapesOut = 1 - ease.in(lin(t, 32, 1.2)), monoIn = ease.out(lin(t, 32.6, 1.4)), endOut = 1 - ease.in(lin(t, 49.6, 0.6));
  const shape = (t0: number) => clamp(sp(t, t0, SPRING.heavy)) * shapesOut;
  const mono = { x: 240, y: 520, w: 600 }, wm = ease.out(lin(t, 42.2, 0.8));
  const pointAt: [number, number] = t < 5.2 ? [540, 720] : t < 32 ? head : [540, 720];
  const pointOn = t < 32 ? 1 : t >= 50 ? prog(t, 50, 0.5) : 0;
  const lineOn = t >= 5.2 && t < 32 ? (1 - ease.in(lin(t, 31.4, 0.6))) : 0;
  // the silhouette: plan taille or gros plan (hard cuts, like the edit)
  const s = close ? 1.45 : 1, hx = 540, hy = close ? 1170 : 1190;
  return (
    <AbsoluteFill style={{ backgroundColor: C.COSMOS }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="wall" cx="50%" cy="38%" r="65%"><stop offset="0" stopColor={C.LUNA} stopOpacity={0.55} /><stop offset="0.5" stopColor={C.NUIT} stopOpacity={0.6} /><stop offset="1" stopColor={C.COSMOS} stopOpacity={0} /></radialGradient>
          <linearGradient id="beam" gradientUnits="userSpaceOnUse" x1={L0[0]} y1={L0[1]} x2={L1[0]} y2={L1[1]}><stop offset="0" stopColor={C.ORBITE} /><stop offset="0.6" stopColor={C.HALO} /><stop offset="1" stopColor={C.ECLIPSE} /></linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
          <radialGradient id="dotG"><stop offset="0" stopColor={C.ECLIPSE} stopOpacity={0.8} /><stop offset="1" stopColor={C.ECLIPSE} stopOpacity={0} /></radialGradient>
          <linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.ARDOISE} stopOpacity={0.55} /><stop offset="1" stopColor={C.NUIT} /></linearGradient>
          <linearGradient id="rim" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor={C.ECLIPSE} /><stop offset="0.35" stopColor={C.ECLIPSE} stopOpacity={0} /></linearGradient>
        </defs>
        {/* the wall: the violet light of the set */}
        <rect width={W} height={H} fill="url(#wall)" />
        {/* the projection */}
        <g opacity={endOut}>
          {lineOn > 0 && <g opacity={lineOn}>
            <line x1={L0[0]} y1={L0[1]} x2={head[0]} y2={head[1]} stroke="url(#beam)" strokeWidth={22} opacity={0.35} filter="url(#glow)" />
            <line x1={L0[0]} y1={L0[1]} x2={head[0]} y2={head[1]} stroke="url(#beam)" strokeWidth={6} strokeLinecap="round" />
          </g>}
          {[[15, "circle"], [19, "square"], [22.6, "triangle"]].map(([t0, k]) => {
            const q = shape(t0 as number); if (q <= 0) return null;
            const common = { fill: C.LUNAIRE, fillOpacity: 0.1, stroke: C.LUNAIRE, strokeOpacity: 0.85, strokeWidth: 3 };
            const el = k === "circle" ? <circle cx={800} cy={700} r={115} {...common} />
              : k === "square" ? <rect x={190} y={600} width={210} height={210} {...common} />
              : <path d="M540 470L660 678L420 678Z" {...common} />;
            const [cx, cy] = k === "circle" ? [800, 700] : k === "square" ? [295, 705] : [540, 610];
            return <g key={k as string} transform={`translate(${cx} ${cy}) scale(${q.toFixed(3)}) translate(${-cx} ${-cy})`}><g filter="url(#glow)" opacity={0.6}>{el}</g>{el}</g>;
          })}
          {monoIn > 0 && <g opacity={monoIn}>
            <g filter="url(#glow)" opacity={0.7}>{MODULES.map((id) => <path key={id} d={monoPath(id, mono.x, mono.y, mono.w)} fill={C.HALO} />)}</g>
            {MODULES.map((id, i) => <path key={id} d={monoPath(id, mono.x, mono.y, mono.w)} fill={C.LUNAIRE} opacity={0.92 * ease.out(lin(t, 32.6 + 0.08 * i, 0.6))} />)}
            {wm > 0 && <g fill={C.LUNAIRE} opacity={wm}>{wordmarkLetters(540, 950, 0.7).map((d, i) => <path key={i} d={d} />)}</g>}
          </g>}
        </g>
        {pointOn > 0 && <g opacity={pointOn}><circle cx={pointAt[0]} cy={pointAt[1]} r={70} fill="url(#dotG)" /><circle cx={pointAt[0]} cy={pointAt[1]} r={13} fill={C.ECLIPSE} /></g>}
        {/* the founder (silhouette): rim light in Éclipse on one side, as on set */}
        <g transform={`translate(${hx} ${hy}) scale(${s}) translate(${-hx} ${-hy})`}>
          <path d={`M${hx - 400} ${H + 300}C${hx - 380} 1520 ${hx - 250} 1430 ${hx - 120} 1405L${hx - 70} 1330C${hx - 135} 1290 ${hx - 150} 1215 ${hx - 140} 1150C${hx - 125} 1060 ${hx - 70} 1020 ${hx} 1020C${hx + 70} 1020 ${hx + 125} 1060 ${hx + 140} 1150C${hx + 150} 1215 ${hx + 135} 1290 ${hx + 70} 1330L${hx + 120} 1405C${hx + 250} 1430 ${hx + 380} 1520 ${hx + 400} ${H + 300}Z`} fill="url(#body)" />
          <path d={`M${hx - 400} ${H + 300}C${hx - 380} 1520 ${hx - 250} 1430 ${hx - 120} 1405L${hx - 70} 1330C${hx - 135} 1290 ${hx - 150} 1215 ${hx - 140} 1150C${hx - 125} 1060 ${hx - 70} 1020 ${hx} 1020C${hx + 70} 1020 ${hx + 125} 1060 ${hx + 140} 1150C${hx + 150} 1215 ${hx + 135} 1290 ${hx + 70} 1330L${hx + 120} 1405C${hx + 250} 1430 ${hx + 380} 1520 ${hx + 400} ${H + 300}Z`} fill="none" stroke="url(#rim)" strokeWidth={5} />
        </g>
        {/* titles on screen */}
        <Title t={t} a={0.3} b={3.7}><text x={W / 2} y={360} textAnchor="middle" fill={C.LUNAIRE} style={typeStyle(400, 54)}>Artiste ? Designer ? Technicienne ?</text></Title>
        <Title t={t} a={3.8} b={5.1}><text x={W / 2} y={380} textAnchor="middle" fill={C.LUNAIRE} style={typeStyle(600, 92)}>Les trois.</text></Title>
        <Title t={t} a={5.3} b={15}>
          <text x={W / 2} y={330} textAnchor="middle" fill={C.BRUME} style={typeStyle(600, 30, 9)}>ARTS MÉDIATIQUES</text>
          <text x={W / 2} y={392} textAnchor="middle" fill={C.LUNAIRE} style={typeStyle(400, 46)}>créer avec les outils de son époque</text>
        </Title>
        {[[15, "ART", "le sens"], [19, "DESIGN", "la forme"], [22.6, "TECHNOLOGIE", "la vie"]].map(([a, w, m], i) => (
          <Title key={i} t={t} a={a as number} b={28}><text x={W / 2} y={340 + i * 62} textAnchor="middle" style={typeStyle(600, 40, 4)}>
            <tspan fill={C.LUNAIRE}>{w}</tspan><tspan fill={C.BRUME} style={typeStyle(400, 40)}>{`  →  ${m}`}</tspan></text></Title>
        ))}
        <Title t={t} a={28.1} b={32}>
          {["L'art donne le sens.", "Le design donne la forme.", "La technologie donne la vie."].map((l, i) =>
            <text key={i} x={W / 2} y={350 + i * 70} textAnchor="middle" fill={C.LUNAIRE} opacity={prog(t, 28.1 + i * 1.25, 0.3)} style={typeStyle(i === 2 ? 600 : 400, 54)}>{l}</text>)}
        </Title>
        <Title t={t} a={32.3} b={39.5}>
          <text x={W / 2} y={330} textAnchor="middle" fill={C.BRUME} style={typeStyle(600, 30, 9)}>1923 · BAUHAUS</text>
          <text x={W / 2} y={392} textAnchor="middle" fill={C.LUNAIRE} style={typeStyle(400, 44)}>« Art et technique, une nouvelle unité »</text>
        </Title>
        <Title t={t} a={42.3} b={49.8}><text x={W / 2} y={370} textAnchor="middle" fill={C.LUNAIRE} style={typeStyle(500, 50, 3)}>Branding · Film · Mapping</text></Title>
        <Title t={t} a={50.3} b={55.5}><text x={W / 2} y={370} textAnchor="middle" fill={C.LUNAIRE} style={typeStyle(500, 52)}>Art, design ou technologie ? ↓</text></Title>
        {/* subtitles (none while the triad line is the title) */}
        {SUBS.filter(([a, b]) => t >= a && t < b).map(([, , s]) => <Sub key={s} text={s} />)}
        {/* what this is, and the framing to shoot */}
        <text x={80} y={262} fill={C.BRUME} opacity={0.7} style={typeStyle(600, 22, 5)}>EXEMPLE · ANIMATIC</text>
        <g transform="translate(540 1478)">
          <rect x={-170} y={-30} width={340} height={46} rx={23} fill={C.COSMOS} fillOpacity={0.55} stroke={C.BRUME} strokeOpacity={0.35} />
          <text x={0} y={2} textAnchor="middle" fill={C.BRUME} style={typeStyle(600, 20, 4)}>{close ? "TOI · GROS PLAN" : "TOI · PLAN TAILLE"}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
