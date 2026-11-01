// Dr Refka Abderrahim — eight stills that show the Reel before it is cut: one per beat of the reference (hook, B-roll
// window, 3D elements behind her, big keyword, full-screen scene, end card) plus two boards of the graphic elements.
// The speaker is a stand-in (a frame of the reference, cut out); the real footage replaces her.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { FONT, useFont } from "../shared/motion";
import { ApercuTag, EndCard, Follicle, IGTag, Line, Window } from "./elements2d";
import { Backdrop, Capsule, DNA, Droplets, Mineral, Molecule, Scene, Softgel, Tube, Vitamin } from "./elements3d";
import { CAIRO, goldText, R } from "./theme";

const full: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920 };
type Shot = { t: string; zoom?: number; cx?: number; cy?: number };
const framing = ({ zoom = 1, cx = 540, cy = 760 }: Shot): React.CSSProperties => ({ transform: `scale(${zoom})`, transformOrigin: `${cx}px ${cy}px` });
/** the background plate (Instagram tag removed), a touch darker so the type and the gold carry */
const Plate: React.FC<Shot & { dim?: number }> = ({ dim = 0.9, ...s }) => <Img src={staticFile(`refka/plate-${s.t}.jpg`)} style={{ ...full, ...framing(s), filter: `brightness(${dim})` }} />;
/** the speaker, cut out: everything placed before her goes behind her */
const Person: React.FC<Shot> = (s) => <Img src={staticFile(`refka/person-${s.t}.png`)} style={{ ...full, ...framing(s) }} />;

/* 1 · hook: the question at the top, its gold word tucked behind her head */
const Accroche = () => (
  <>
    <Plate t="23.0" />
    <div style={{ ...full, background: "linear-gradient(180deg, rgba(8,6,5,0.62) 0%, rgba(8,6,5,0.38) 20%, rgba(8,6,5,0) 34%)" }} />
    <Line parts={[{ t: "علاش" }, { t: "يطيـــح" }]} y={262} size={100} />
    <Line parts={[{ t: "الشعر؟", gold: true }]} y={396} size={158} weight={900} />
    <Person t="23.0" />
    <IGTag x={1012} y={430} />
    <ApercuTag n={1} title="Accroche" />
  </>
);

/* 2 · the B-roll window above her, behind her head */
const Fenetre = () => (
  <>
    <Plate t="24.2" />
    <Window x={120} y={196} w={840} h={440}><Follicle w={832} h={432} /></Window>
    <Person t="24.2" />
    <Line parts={[{ t: "خليني" }, { t: "نقولك" }, { t: "السبب", gold: true }]} y={1236} size={66} />
    <IGTag x={64} y={1318} align="left" />
    <ApercuTag n={2} title="Fenêtre B-roll" />
  </>
);

/* 3 · vitamins, minerals, a molecule and DNA floating behind her, with depth: far (soft), mid (sharp), near (blurred) */
const Elements = () => (
  <>
    <Plate t="25.2" dim={0.74} />
    <Scene style={{ filter: "blur(5px)" }}>
      <Vitamin at={[250, 372]} r={30} label="D" turn={0.3} z={-200} />
      <Vitamin at={[690, 250]} r={27} label="E" turn={-0.4} z={-200} />
      <Softgel at={[420, 196]} r={22} rot={[0.3, 0.2, -0.5]} z={-200} />
      <DNA at={[150, 720]} s={0.5} rot={[0.2, 0.3, 0.35]} n={12} z={-300} />
      <Molecule at={[960, 1030]} s={0.55} rot={[0.6, 0.2, 0.4]} z={-300} />
      <Mineral at={[600, 330]} r={30} label="Mg" name="MAGNÉSIUM" rot={[0, 0.3, 0.2]} z={-300} />
    </Scene>
    <Scene>
      <Vitamin at={[170, 520]} r={64} label="C" turn={0.35} tilt={-0.1} />
      <Vitamin at={[930, 650]} r={56} label="B12" turn={-0.3} tilt={0.08} />
      <Softgel at={[290, 290]} r={44} rot={[0.4, 0.3, 0.55]} />
      <Molecule at={[830, 262]} s={0.92} rot={[0.4, -0.5, 0.2]} />
      <Mineral at={[122, 868]} r={62} label="Zn" name="ZINC" rot={[0, 0.25, -0.18]} />
      <Capsule at={[968, 868]} r={30} len={118} rot={[0.2, 0.3, -0.9]} />
      <Mineral at={[88, 1150]} r={46} label="Fe" name="FER" rot={[0.1, -0.2, 0.25]} />
    </Scene>
    <Person t="25.2" />
    <Scene style={{ filter: "blur(13px)" }}>
      <Vitamin at={[40, 1560]} r={128} label="A" turn={0.6} z={300} />
      <Softgel at={[1060, 1380]} r={78} rot={[0.2, 0.1, 0.9]} z={300} />
    </Scene>
    <Line parts={[{ t: "نقص" }, { t: "الفيتامينات", gold: true }]} y={1236} size={68} />
    <IGTag x={1012} y={430} />
    <ApercuTag n={3} title="Éléments 3D" />
  </>
);

/* 4 · the keyword, on a punch-in */
const MotCle = () => (
  <>
    <Plate t="26.1" zoom={1.22} cy={640} />
    <Person t="26.1" zoom={1.22} cy={640} />
    <Line parts={[{ t: "تحاليـــل" }]} y={1150} size={124} />
    <Line parts={[{ t: "كاملة", gold: true }]} y={1318} size={178} weight={900} />
    <IGTag x={1012} y={430} />
    <ApercuTag n={4} title="Mot-clé · zoom" />
  </>
);

/* 5 · full screen: the background becomes the scene (PRP tubes, plasma light), she stays in front */
const PleinEcran = () => (
  <>
    <Scene background={R.NUIT}>
      <Backdrop />
      <Tube at={[560, 470]} r={46} len={560} tilt={0.06} z={-600} />
      <Tube at={[176, 1010]} r={86} len={1040} tilt={-0.17} turn={0.3} />
      <Tube at={[928, 900]} r={78} len={960} tilt={0.15} turn={-0.3} />
      <Droplets n={22} box={[60, 140, 1020, 640]} rMin={4} rMax={15} seed="prp" z={200} />
    </Scene>
    <Person t="23.0" />
    <Line parts={[{ t: "جلسات" }, { t: "البلازما", gold: true }]} y={1240} size={96} weight={900} />
    <IGTag x={1012} y={430} />
    <ApercuTag n={5} title="Plein écran" />
  </>
);

/* 6 · end card */
const Fin = () => (<><EndCard /><ApercuTag n={6} title="Carte de fin" reference={false} /></>);

/* ───────── boards ───────── */
const mont = (w: number, size: number, ls = 0): React.CSSProperties => ({ fontFamily: FONT, fontWeight: w, fontVariationSettings: `'wght' ${w}`, fontSize: size, letterSpacing: `${ls}em` });
const Kicker: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top: y, display: "flex", alignItems: "center", gap: 22 }}>
    <div style={{ ...mont(600, 21, 0.26), color: R.OR, textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</div>
    <div style={{ flex: 1, height: 1, background: "rgba(227,188,99,0.35)" }} />
  </div>
);
const Caption: React.FC<{ x: number; y: number; children: React.ReactNode; w?: number }> = ({ x, y, children, w = 320 }) => (
  <div style={{ position: "absolute", left: x - w / 2, width: w, top: y, textAlign: "center", ...mont(600, 19, 0.16), color: "rgba(243,239,232,0.78)", textTransform: "uppercase" }}>{children}</div>
);
const Header: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top: 110 }}>
    <div style={{ ...mont(600, 21, 0.32), color: R.OR }}>DR REFKA ABDERRAHIM · REEL</div>
    <div style={{ ...mont(600, 66, -0.01), color: R.BLANC, marginTop: 18 }}>{title}</div>
    <div style={{ ...mont(400, 27), color: "rgba(243,239,232,0.62)", marginTop: 12 }}>{sub}</div>
  </div>
);

const PlancheElements = () => (
  <>
    <Scene background="#0F0C0A">
      <Vitamin at={[176, 560]} r={88} label="C" turn={0.3} tilt={-0.1} />
      <Vitamin at={[272, 650]} r={42} label="D" turn={-0.3} z={-200} />
      <Softgel at={[540, 575]} r={60} rot={[0.4, 0.3, 0.5]} />
      <Capsule at={[900, 575]} r={40} len={150} rot={[0.25, 0.3, -0.85]} />
      <Molecule at={[190, 930]} s={0.95} rot={[0.4, -0.5, 0.2]} />
      <DNA at={[540, 930]} s={0.75} rot={[0.15, 0.35, 0.55]} n={13} />
      <Mineral at={[862, 912]} r={72} label="Zn" name="ZINC" rot={[0, 0.25, -0.15]} />
      <Mineral at={[976, 1000]} r={44} label="Fe" name="FER" rot={[0.1, -0.2, 0.2]} z={-150} />
      <Tube at={[818, 1468]} r={36} len={250} tilt={0.14} turn={0.2} />
      <Tube at={[940, 1450]} r={36} len={250} tilt={-0.1} turn={-0.2} />
    </Scene>
    <Header title="Éléments graphiques" sub="Créés sur mesure en 3D, aux couleurs de la Dr" />
    <Kicker y={392}>3D · ils flottent derrière elle</Kicker>
    <Caption x={196} y={712}>Vitamines</Caption>
    <Caption x={540} y={712}>Gélule</Caption>
    <Caption x={900} y={712}>Capsule</Caption>
    <Caption x={190} y={1064}>Molécule</Caption>
    <Caption x={540} y={1064}>ADN</Caption>
    <Caption x={900} y={1064}>Minéraux</Caption>
    <Kicker y={1150}>Illustrations · fenêtre et plein écran</Kicker>
    <Window x={80} y={1222} w={560} h={300}><Follicle w={552} h={292} /></Window>
    <Caption x={360} y={1560} w={480}>Fenêtre · follicule</Caption>
    <Caption x={880} y={1662} w={300}>Tubes PRP</Caption>
    <div style={{ position: "absolute", left: 80, right: 80, top: 1736, ...mont(400, 24), lineHeight: 1.55, color: "rgba(243,239,232,0.6)" }}>
      Tout est modélisé en 3D : aucune image de banque. Couleurs provisoires, à caler sur la charte de la Dr.
    </div>
  </>
);

const Swatch: React.FC<{ x: number; c: string; name: string }> = ({ x, c, name }) => (
  <div style={{ position: "absolute", left: x, top: 1480, width: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
    <div style={{ width: 104, height: 104, borderRadius: 52, background: c, boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.3)" }} />
    <div style={{ ...mont(600, 18, 0.12), color: R.PERLE, textTransform: "uppercase" }}>{name}</div>
    <div style={{ ...mont(400, 18, 0.06), color: "rgba(243,239,232,0.55)" }}>{c}</div>
  </div>
);

const PlancheTexte = () => (
  <AbsoluteFill style={{ background: "#0F0C0A" }}>
    <Header title="Texte & couleurs" sub="Le texte arabe est un exemple, à remplacer par le sien" />
    <Kicker y={376}>Accroche · 1re seconde</Kicker>
    <Line parts={[{ t: "علاش" }, { t: "يطيـــح" }]} y={490} size={84} />
    <Line parts={[{ t: "الشعر؟", gold: true }]} y={610} size={128} weight={900} />
    <Kicker y={724}>Sous-titres · un mot-clé en or</Kicker>
    <Line parts={[{ t: "خليني" }, { t: "نقولك" }, { t: "السبب", gold: true }]} y={826} size={64} />
    <Kicker y={918}>Mot-clé · gros plan</Kicker>
    <Line parts={[{ t: "تحاليـــل" }]} y={1030} size={100} />
    <Line parts={[{ t: "كاملة", gold: true }]} y={1160} size={140} weight={900} />
    <Kicker y={1262}>Compte Instagram</Kicker>
    <IGTag x={80} y={1318} align="left" />
    <div style={{ position: "absolute", left: 420, top: 1316, ...mont(400, 22), lineHeight: 1.5, color: "rgba(243,239,232,0.6)", width: 580 }}>Petit, en haut à droite. Il descend près des sous-titres quand une fenêtre occupe le haut.</div>
    <Kicker y={1430}>Couleurs</Kicker>
    <Swatch x={60} c={R.OR_CLAIR} name="Or clair" />
    <Swatch x={250} c={R.OR} name="Or" />
    <Swatch x={440} c={R.OR_PROFOND} name="Or profond" />
    <Swatch x={630} c={R.BLANC} name="Blanc" />
    <Swatch x={820} c={R.NOIR} name="Noir" />
    <Kicker y={1700}>Typographie</Kicker>
    <div style={{ position: "absolute", left: 80, right: 80, top: 1752, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div style={{ ...mont(600, 26), color: R.PERLE }}>Montserrat SemiBold</div>
      <div style={{ fontFamily: CAIRO, fontWeight: 800, fontSize: 34, color: R.PERLE }}>Cairo ExtraBold <span style={{ ...goldText, filter: "none" }}>عربي</span></div>
    </div>
  </AbsoluteFill>
);

const FRAMES = [Accroche, Fenetre, Elements, MotCle, PleinEcran, Fin, PlancheElements, PlancheTexte];
export const APERCUS = FRAMES.length;

export const RefkaApercus: React.FC = () => {
  const ready = useFont(), F = FRAMES[useCurrentFrame()];
  return <AbsoluteFill style={{ backgroundColor: R.NOIR, overflow: "hidden" }}>{ready && F ? <F /> : null}</AbsoluteFill>;
};
