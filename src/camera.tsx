// ─── Caméra 3D du studio (« fausse caméra ») ───
// Source : analyse LBDavinci « 3 mouvements de caméra » (08/10/2026), adaptée à Remotion.
// 3 outils :
//   1. Camera3D   — mouvements EMPILÉS qui se chevauchent (chaque mouvement s'additionne aux autres).
//                    Règle d'or : le mouvement suivant démarre 5-10 images AVANT la fin du précédent
//                    → jamais « lent + lent » = jamais de temps mort.
//   2. MultiCam   — plusieurs caméras sur la même scène, on coupe de l'une à l'autre PENDANT leur mouvement.
//   3. Raccord    — micro-transition « 2 + 2 » : 2 images avant / 2 après une coupe → flou + désaturation + flash.
// Le temps est en SECONDES (T), comme dans presentation-v3.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useVideoConfig } from "remotion";

// Courbe « ease 80 % » de Fusion (départ et arrivée très doux, milieu rapide). Notre courbe signature reste dispo.
export const EASE80 = Easing.bezier(0.8, 0, 0.2, 1);
export const EASE_SIGNATURE = Easing.bezier(0.95, 0.03, 0.17, 0.97);

// Un mouvement = une variation (delta) entre 2 instants. Toutes les valeurs s'ADDITIONNENT.
// x, y : glisser (px, la caméra va à droite / en bas)   z : avancer (px, > 0 = on se rapproche)
// rx : inclinaison (°, > 0 = le haut part au fond)       ry : tourner autour (°)    rz : pencher (°)
export type Mouvement = {
  de: number; a: number;
  x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number;
  ease?: (t: number) => number;
};
export type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number };
const AXES = ["x", "y", "z", "rx", "ry", "rz"] as const;
const ZERO: Pose = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };

export const poseCamera = (T: number, mvts: Mouvement[], base: Partial<Pose> = {}): Pose => {
  const p: Pose = { ...ZERO, ...base };
  for (const m of mvts) {
    const k = interpolate(T, [m.de, m.a], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: m.ease ?? EASE80 });
    for (const ax of AXES) p[ax] += (m[ax] ?? 0) * k;
  }
  return p;
};

// Vitesse « vue à l'écran » (px/s approx.) : sert au flou de mouvement proportionnel à la vitesse.
export const vitesseCamera = (T: number, mvts: Mouvement[], base: Partial<Pose> = {}, dt = 1 / 60) => {
  const a = poseCamera(T - dt, mvts, base), b = poseCamera(T + dt, mvts, base);
  const d = (ax: keyof Pose) => (b[ax] - a[ax]) / (2 * dt);
  return Math.hypot(d("x"), d("y"), d("z") * 0.5, d("rx") * 12, d("ry") * 12, d("rz") * 12);
};

// Contrôle de la règle d'or : chaque mouvement doit démarrer 5-10 images avant la fin du précédent.
export const verifierChevauchement = (mvts: Mouvement[], fps = 30, min = 5, max = 12): string[] => {
  const s = [...mvts].sort((p, q) => p.de - q.de);
  const msg: string[] = [];
  for (let i = 1; i < s.length; i++) {
    const avance = Math.round((s[i - 1].a - s[i].de) * fps);
    if (avance < min) msg.push(`Mouvement ${i + 1} (${s[i].de}s) : démarre ${avance < 0 ? `${-avance} img APRÈS` : `${avance} img avant`} la fin du précédent → temps mort (viser ${min}-${max}).`);
    else if (avance > max * 3) msg.push(`Mouvement ${i + 1} (${s[i].de}s) : chevauche de ${avance} img (voulu ?).`);
  }
  return msg;
};

const transformDe = (p: Pose) =>
  `translateZ(${p.z}px) rotateX(${p.rx}deg) rotateY(${-p.ry}deg) rotateZ(${-p.rz}deg) translate3d(${-p.x}px, ${-p.y}px, 0)`;

// ─── 1. Caméra à mouvements empilés ───
// La scène (children) est posée dans l'espace 3D ; la caméra se déplace devant elle en vraie perspective.
// Les enfants peuvent avoir leur propre profondeur : style={{ transform: "translateZ(-600px)" }}.
export const Camera3D: React.FC<{
  T: number; mvts: Mouvement[]; base?: Partial<Pose>;
  focale?: number; flouMax?: number; flouParVitesse?: number; children: React.ReactNode;
}> = ({ T, mvts, base, focale = 1800, flouMax = 12, flouParVitesse = 0.004, children }) => {
  const p = poseCamera(T, mvts, base);
  const flou = Math.min(flouMax, vitesseCamera(T, mvts, base) * flouParVitesse);
  return (
    // ⚠️ Le flou va sur une couche EXTÉRIEURE : un `filter` posé sur l'élément preserve-3d aplatit la 3D
    // (les objets perdent leur profondeur dès que le flou s'allume → saccade).
    <AbsoluteFill style={{ filter: `blur(${flou.toFixed(2)}px)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: focale }}>
        {/* position:absolute + inset:0 obligatoire (piège Remotion : sinon les enfants absolute se recentrent sur 0,0) */}
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: transformDe(p) }}>
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── 3. Micro-transition « 2 + 2 » autour d'une coupe ───
// Pic à la coupe : flou + saturation 0 + flash ; retour à la normale en `images` images de chaque côté.
export const filtreRaccord = (T: number, coupes: number[], fps: number, o: { images?: number; flou?: number; flash?: number } = {}) => {
  const { images = 2, flou = 10, flash = 0.35 } = o;
  let p = 0;
  for (const c of coupes) p = Math.max(p, 1 - Math.abs(T - c) * fps / (images + 0.5));
  if (p <= 0) return undefined;
  return `blur(${(flou * p).toFixed(2)}px) saturate(${(1 - p).toFixed(3)}) brightness(${(1 + flash * p).toFixed(3)})`;
};

export const Raccord: React.FC<{ T: number; coupes: number[]; images?: number; flou?: number; flash?: number; children: React.ReactNode }> = ({ T, coupes, children, ...o }) => {
  const { fps } = useVideoConfig();
  return <AbsoluteFill style={{ filter: filtreRaccord(T, coupes, fps, o) }}>{children}</AbsoluteFill>;
};

// ─── 2. Multi-caméras sur la même scène (cas « image plate en 3D ») ───
// Chaque caméra a ses mouvements ; on passe à la caméra suivante à `jusqua`.
// Règle : la caméra suivante doit déjà bouger au moment de la coupe (son `de` < jusqua de la précédente).
// Le raccord 2 + 2 est posé automatiquement sur chaque coupe.
export type Cam = { jusqua: number; mvts: Mouvement[]; base?: Partial<Pose> };
export const camActive = (T: number, cams: Cam[]) => {
  const i = cams.findIndex((c) => T < c.jusqua);
  return i === -1 ? cams.length - 1 : i;
};

export const MultiCam: React.FC<{ T: number; cams: Cam[]; focale?: number; raccord?: boolean; children: React.ReactNode }> = ({ T, cams, focale, raccord = true, children }) => {
  const c = cams[camActive(T, cams)];
  const coupes = cams.slice(0, -1).map((k) => k.jusqua);
  const scene = <Camera3D T={T} mvts={c.mvts} base={c.base} focale={focale}>{children}</Camera3D>;
  return raccord ? <Raccord T={T} coupes={coupes}>{scene}</Raccord> : scene;
};
