// The chat animation: the welcome screen → the question is typed → sent → the assistant thinks → asks one quick choice
// → the answer is written word by word, the camera always close to the gesture. All the CONTENT comes from src/content.ts.
// Copy this file EXACTLY: every time (seconds), position and camera key is tested. Identifiers are French
// (accueil = welcome, saisi = typed, bulle = bubble, reflexion = thinking, panneau = choice panel, reponse = answer, souris = mouse).
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BlocColle, PAL, POLICE_UI, POLICE_TITRE, Champ, Etoile, Fenetre, Rangee, Salutation } from "./ui";
import { Camera3D, EASE80, type Mouvement, type Pose } from "./camera";
import { CONTENT, type Bloc, type Preset } from "./content";

// The macOS mouse pointer
const CursorMac: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 40, style }) => (
  <svg width={size} height={size * 1.45} viewBox="0 0 20 29" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))", ...style }}>
    <path d="M1.5 1.5v21.2l5.3-5.1 3.4 8.1 3.6-1.5-3.4-7.9h7.3z" fill="#000" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

// ─── Time of the chat film (seconds) ───
const T_FRAPPE = 5.2, T_FRAPPE_FIN = 6.9;
const T_CLIC = 7.6, T_ENVOI = 7.7;
const T_PRECISION = 8.6, T_OUTIL = 9.5, T_PANNEAU = 9.9;
const T_CHOIX = 12.0, T_RESUME = 12.1;
const T_REP = 13.5, T_REP_FIN = 18.0;

const SIG = Easing.bezier(0.95, 0.03, 0.17, 0.97);
const ip = (T: number, a: number, b: number, e: (t: number) => number = EASE80) => interpolate(T, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ─── La fenêtre (repère interne 1200 × 1650, posée à l'échelle 0,7333 dans le monde 1080 × 1920) ───
const WI = 1200, HI = 1450, ECH = 880 / WI, WX = 60, WY = 225;
const COL = 720; // largeur de la colonne de texte (reste dans la zone sûre quand la caméra est proche)
const CHAMP_ACCUEIL = { x: 100, y: 720, w: 1000, h: 230 }, CHAMP_BAS = { x: 100, y: 1130, w: 1000, h: 230 };
const PANNEAU = { x: 100, y: 670, w: 780, h: 438 }, RESUME = { x: 100, y: 420, w: COL, h: 132 };

const Logo: React.FC<{ p: Preset; x: number; y: number; taille: number; rot?: number; pouls?: number }> = ({ p, x, y, taille, rot = 0, pouls = 1 }) =>
  p.logo === "marque" ? <Etoile x={x} y={y} taille={taille} rot={rot} pouls={pouls} /> : (
    <div style={{ position: "absolute", left: x - taille / 2, top: y - taille / 2, width: taille, height: taille, borderRadius: "50%", background: p.accent, color: "#111", fontFamily: POLICE_UI, fontWeight: 700, fontSize: taille * 0.56, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pouls.toFixed(3)})` }}>{p.logo}</div>
  );

// Le texte qui s'écrit mot après mot. n = nombre de mots visibles (décimal : le dernier mot arrive en fondu).
const mots = (blocs: Bloc[]) => blocs.reduce((s, b) => s + b.texte.split(" ").length, 0);
const Reponse: React.FC<{ p: Preset; n: number }> = ({ p, n }) => {
  let i = 0, gras = false;
  return (
    <div style={{ width: COL, fontFamily: POLICE_TITRE, fontSize: 35, lineHeight: "52px", color: PAL.texte, display: "flex", flexDirection: "column", gap: 14 }}>
      {p.reponse.map((b, k) => (
        <div key={k} style={{ display: "flex", gap: 16, fontWeight: b.type === "h" ? 600 : 400, marginTop: b.type === "h" ? 14 : 0, paddingLeft: b.type === "li" ? 8 : 0 }}>
          {b.type === "li" && <div style={{ width: 10, height: 10, borderRadius: 5, background: p.accent, marginTop: 22, flexShrink: 0, opacity: Math.max(0, Math.min(1, n - i)) }} />}
          <div>
            {b.texte.split(" ").map((m, j) => {
              const ouvre = m.startsWith("**"), ferme = m.replace(/[.,:;!?]+$/, "").endsWith("**");
              if (ouvre) gras = true;
              const g = gras; if (ferme) gras = false;
              const o = Math.max(0, Math.min(1, n - i)); i++;
              return <span key={j} style={{ opacity: o, fontWeight: g ? 600 : undefined }}>{m.replace(/\*\*/g, "")} </span>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// La conversation à un instant t (t = temps local : 0 = l'envoi de la question).
// Sert au film principal ET aux exemples (qu'on montre à t tardif, réponse écrite).
type Etat = { accueil: number; saisi: string; envoyer: number; appui: number; champ: typeof CHAMP_BAS; bulle: number; reflexion: number; precision: number; outil: number; panneau: number; survol: number; resume: number; reflexion2: number; n: number; colle?: number; souris?: { x: number; y: number; o: number; appui: number } };

const Conversation: React.FC<{ p: Preset; e: Etat; T: number }> = ({ p, e, T }) => {
  const rP = { x: mix(PANNEAU.x, RESUME.x, e.resume), y: mix(PANNEAU.y, RESUME.y, e.resume), w: mix(PANNEAU.w, RESUME.w, e.resume), h: mix(PANNEAU.h, RESUME.h, e.resume) };
  const opt = p.panneau.options[p.panneau.choix];
  return (
    <div style={{ position: "absolute", left: WX, top: WY, width: WI, height: HI, transform: `scale(${ECH})`, transformOrigin: "0 0" }}>
      <Fenetre w={WI} h={HI}>
        {e.accueil > 0 && <Salutation cx={WI / 2} y={mix(560, 640, e.accueil)} nom={p.nom} o={e.accueil} />}
        {/* la question : d'abord dans le champ, puis elle DEVIENT la bulle en haut à droite */}
        {e.bulle > 0 && (
          <div style={{ position: "absolute", right: mix(WI - 132 - 17 * p.question.length - 60, WI - 100 - COL, e.bulle), top: mix(e.champ.y + 30, 150, e.bulle), padding: "18px 30px", borderRadius: 26, background: `rgba(33,33,37,${e.bulle.toFixed(2)})`, fontFamily: POLICE_UI, fontSize: 34, lineHeight: "44px", color: PAL.texte, whiteSpace: "nowrap" }}>{p.question}</div>
        )}
        {(e.reflexion > 0 || e.n > 0) && (
          <div style={{ position: "absolute", left: 100, top: 262, height: 44, opacity: Math.max(e.reflexion, Math.min(1, e.n)) }}>
            <Logo p={p} x={22} y={22} taille={42} rot={e.n > 0 ? 0 : T * 140} pouls={e.n > 0 ? 1 : 1 + 0.12 * Math.sin(T * 9)} />
            <div style={{ position: "absolute", left: 60, top: 2, fontFamily: POLICE_UI, fontSize: 32, lineHeight: "40px", color: e.n > 0 ? PAL.texte2 : PAL.texte2, whiteSpace: "nowrap" }}>{e.n > 0 ? p.nom : "Réflexion…"}</div>
          </div>
        )}
        {e.precision > 0 && <div style={{ position: "absolute", left: 100, top: 330, width: COL, fontFamily: POLICE_TITRE, fontSize: 35, lineHeight: "52px", color: PAL.texte, whiteSpace: "nowrap", overflow: "hidden", clipPath: `inset(0 ${(100 - 100 * e.precision).toFixed(1)}% 0 0)` }}>{p.precision}</div>}
        {e.outil > 0 && e.resume < 1 && (
          <div style={{ position: "absolute", left: 100, top: 412, height: 44, display: "flex", alignItems: "center", gap: 16, opacity: e.outil * (1 - e.resume), transform: `translateY(${(1 - e.outil) * 14}px)` }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, border: `4px solid ${p.accent}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 8, height: 8, borderRadius: 4, background: p.accent, transform: `scale(${1 + 0.3 * Math.sin(T * 8)})` }} /></div>
            <div style={{ fontFamily: POLICE_UI, fontSize: 25, color: p.accent, background: "rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: 8 }}>{p.outil}</div>
          </div>
        )}
        {/* le panneau de choix : il monte au-dessus du champ ; après le clic, il se replie et DEVIENT la carte « résumé » */}
        {e.panneau > 0 && (
          <div style={{ position: "absolute", left: rP.x, top: rP.y + (1 - e.panneau) * 90, width: rP.w, height: rP.h, opacity: e.panneau, borderRadius: 22, background: PAL.champ, border: `2px solid ${PAL.bord}`, boxSizing: "border-box", overflow: "hidden", fontFamily: POLICE_UI }}>
            <div style={{ opacity: 1 - e.resume }}>
              <div style={{ position: "absolute", left: 30, top: 22, fontSize: 28, fontWeight: 500, color: PAL.texte }}>{p.panneau.titre}</div>
              <div style={{ position: "absolute", right: 30, top: 24, fontSize: 24, color: PAL.texte3 }}>‹ 1 sur 1 ›  ✕</div>
              {p.panneau.options.map((o, k) => (
                <div key={k} style={{ position: "absolute", left: 14, top: 76 + k * 96, width: PANNEAU.w - 32, height: 90, borderRadius: 14, background: k === p.panneau.choix ? `rgba(255,255,255,${(0.07 * e.survol).toFixed(3)})` : "transparent" }}>
                  <div style={{ position: "absolute", left: 14, top: 22, width: 46, height: 46, borderRadius: 12, background: PAL.bulle, border: `1.5px solid ${PAL.bord}`, color: PAL.texte2, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</div>
                  <div style={{ position: "absolute", left: 80, top: 10, fontSize: 29, color: PAL.texte }}>{o.t}</div>
                  <div style={{ position: "absolute", left: 80, top: 50, fontSize: 23, color: PAL.texte3 }}>{o.d}</div>
                  {k === p.panneau.choix && <div style={{ position: "absolute", right: 22, top: 26, fontSize: 28, color: PAL.texte2, opacity: e.survol }}>→</div>}
                </div>
              ))}
              <div style={{ position: "absolute", left: 34, bottom: 22, fontSize: 26, color: PAL.texte3 }}>✎  Autre chose</div>
              <div style={{ position: "absolute", right: 24, bottom: 16, fontSize: 24, color: PAL.texte, background: PAL.bulle, border: `1.5px solid ${PAL.bord}`, borderRadius: 10, padding: "6px 16px" }}>Passer</div>
            </div>
            <div style={{ position: "absolute", left: 28, top: 20, opacity: e.resume, whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 25, color: PAL.texte3 }}>{p.panneau.titre}</div>
              <div style={{ fontSize: 30, color: PAL.texte, marginTop: 8 }}>{opt.t}</div>
            </div>
          </div>
        )}
        {e.reflexion2 > 0 && <Logo p={p} x={118} y={612} taille={34} rot={T * 140} pouls={1 + 0.12 * Math.sin(T * 9)} />}
        {e.n > 0 && <div style={{ position: "absolute", left: 100, top: mix(650, 590, Math.min(1, e.n / 3)) }}><Reponse p={p} n={e.n} /></div>}
        <Champ r={e.champ} texte={e.colle ? " " : e.accueil > 0.5 ? undefined : e.panneau > 0.5 && e.resume < 0.5 ? "Ou répondre directement…" : "Répondre"} saisi={e.bulle > 0 ? undefined : e.saisi || undefined} envoyer={e.envoyer} appui={e.appui}>{e.colle ? <BlocColle r={{ x: 24, y: 22, w: 150, h: 150 }} o={Math.min(1, e.colle * 2)} ech={0.7 + 0.3 * e.colle} apercu={`# AI chat animation\n(9:16)\n\nQUESTION: "..."\nANSWER: "..."\nACCENT: "#F3F2EF"`} /> : null}</Champ>
        {e.accueil > 0 && <Rangee r={e.champ} o={e.accueil} />}
        {e.souris && e.souris.o > 0 && <CursorMac size={46} style={{ position: "absolute", left: e.souris.x, top: e.souris.y, opacity: e.souris.o, transform: `scale(${1 - 0.14 * e.souris.appui})`, transformOrigin: "0 0", zIndex: 50 }} />}
      </Fenetre>
    </div>
  );
};

// L'état du film principal à l'instant T
const BOUTON = { x: CHAMP_ACCUEIL.x + CHAMP_ACCUEIL.w - 56, y: CHAMP_ACCUEIL.y + CHAMP_ACCUEIL.h - 51 };
const option = (p: Preset) => ({ x: 640, y: PANNEAU.y + 76 + 96 * p.panneau.choix + 44 }); // la souris va sur LE choix demandé (CLICK)
const etatFilm = (p: Preset, T: number): Etat => {
  const q = p.question;
  const car = Math.round(ip(T, T_FRAPPE, T_FRAPPE_FIN, (t) => t) * q.length);
  const bulle = ip(T, T_ENVOI, T_ENVOI + 0.45, SIG), bas = ip(T, T_ENVOI, T_ENVOI + 0.55, SIG);
  const versBouton = ip(T, 6.75, 7.5), versOption = ip(T, 10.7, 11.6), sort = ip(T, 12.2, 13.0);
  const OPT = option(p);
  const sx = mix(mix(mix(760, BOUTON.x - 6, versBouton), OPT.x, versOption), 880, sort);
  const sy = mix(mix(mix(1100, BOUTON.y - 4, versBouton), OPT.y, versOption), 1010, sort);
  const tape = (c: number) => Math.max(0, 1 - Math.abs(T - c) / 0.12);
  return {
    accueil: 1 - ip(T, T_ENVOI, T_ENVOI + 0.3), saisi: q.slice(0, car) + (car > 0 && car < q.length ? "" : ""), envoyer: T < T_ENVOI ? ip(T, T_FRAPPE, T_FRAPPE + 0.25) : 1 - ip(T, T_ENVOI, T_ENVOI + 0.15), appui: tape(T_CLIC),
    champ: { ...CHAMP_ACCUEIL, y: mix(CHAMP_ACCUEIL.y, CHAMP_BAS.y, bas) }, bulle,
    reflexion: ip(T, T_ENVOI + 0.35, T_ENVOI + 0.6) * (1 - ip(T, T_RESUME + 0.2, T_RESUME + 0.5)), precision: ip(T, T_PRECISION, T_PRECISION + 0.7, (t) => t), outil: ip(T, T_OUTIL, T_OUTIL + 0.3),
    panneau: ip(T, T_PANNEAU, T_PANNEAU + 0.45, SIG), survol: ip(T, 11.3, 11.6), resume: ip(T, T_RESUME, T_RESUME + 0.55, SIG),
    reflexion2: ip(T, T_RESUME + 0.5, T_RESUME + 0.7) * (1 - ip(T, T_REP - 0.1, T_REP + 0.2)),
    n: ip(T, T_REP, T_REP_FIN, (t) => t) * (mots(p.reponse) + 1),
    souris: { x: sx, y: sy, o: ip(T, 6.6, 6.9) * (1 - ip(T, 12.8, 13.1)), appui: Math.max(tape(T_CLIC), tape(T_CHOIX)) },
  };
};
// Une conversation déjà avancée : la réponse s'écrit depuis n0 mots (accroche, exemples, rappel)

// ─── La caméra : toujours proche du geste, mouvements empilés qui se chevauchent ───
// vue(cx, cy, zoom) : le point (cx, cy) de la fenêtre arrive au point d'ancrage de l'écran (500, 900 = centre de la zone sûre, sous la carte).
const F = 1800, AX = 500, AY = 900;
const vue = (cx: number, cy: number, s: number, r: Partial<Pose> = {}): Pose => ({ x: WX + cx * ECH - 540 - (AX - 540) / s, y: WY + cy * ECH - 960 - (AY - 960) / s, z: F * (1 - 1 / s), rx: 0, ry: 0, rz: 0, ...r });
type Cle = { a: number; d: number; v: Pose; ease?: (t: number) => number };
const chemin = (base: Pose, cles: Cle[]): Mouvement[] => {
  let avant = base; const m: Mouvement[] = [];
  for (const c of cles) { m.push({ de: c.a - c.d, a: c.a, x: c.v.x - avant.x, y: c.v.y - avant.y, z: c.v.z - avant.z, rx: c.v.rx - avant.rx, ry: c.v.ry - avant.ry, rz: c.v.rz - avant.rz, ease: c.ease }); avant = c.v; }
  return m;
};
const lin = (t: number) => t;

// ─── The camera: one continuous shot, stacked moves that overlap ───
const CAM_BASE = vue(600, 760, 0.9, { ry: -9, rx: 4 });
const T0 = 4.7, VITESSE = 1.4, T_FIN = T_REP_FIN + 1.3; // the film is played from the welcome screen, × 1.4
export const DUREE_S = (T_FIN - T0) / VITESSE;          // 10.43 s
const CAM = chemin(CAM_BASE, [
  { a: 4.9, d: 2.2, v: vue(600, 780, 1.22, { ry: 2, rx: 0 }), ease: lin },  // the whole welcome screen, moving in
  { a: 5.7, d: 1.1, v: vue(430, 800, 1.5, { ry: 5 }) },                    // close on the input (typing starts)
  { a: 7.0, d: 1.6, v: vue(440, 820, 1.9, { ry: -3 }), ease: lin },         // follows the text being typed
  { a: 7.55, d: 0.8, v: vue(860, 880, 1.95, { ry: -4 }) },                  // follows the mouse to the send button
  { a: 8.6, d: 1.15, v: vue(400, 320, 1.7, { ry: 2, rx: -2 }) },            // goes up with the bubble, close on "thinking"
  { a: 9.9, d: 1.5, v: vue(470, 380, 1.5, { ry: -2 }) },                    // the "precision" line
  { a: 10.7, d: 1.0, v: vue(490, 900, 1.42, { ry: 0, rx: 2 }) },            // the whole choice panel
  { a: 11.8, d: 1.3, v: vue(450, 810, 1.72, { ry: 4 }) },                   // close on the choice
  { a: 13.3, d: 1.3, v: vue(460, 520, 1.5, { ry: -3, rx: 0 }) },            // the summary, the answer is coming
  { a: T_FIN, d: T_FIN - 13.2, v: vue(460, 860, 1.62, { ry: 3 }), ease: lin }, // goes down with the answer
]);

export const ChatVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const T = T0 + (useCurrentFrame() / fps) * VITESSE;
  const p = CONTENT;
  return (
    <AbsoluteFill style={{ background: "#0A0A0B" }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 700px at 50% 46%, ${p.accent}1F, rgba(10,10,11,0) 70%)` }} />
      <Camera3D T={T} mvts={CAM} base={CAM_BASE} focale={F}><Conversation p={p} e={etatFilm(p, T)} T={T} /></Camera3D>
      <Audio src={staticFile("sound.wav")} />{/* generated by scripts/make-sound.py, in sync with the film timings */}
    </AbsoluteFill>
  );
};
