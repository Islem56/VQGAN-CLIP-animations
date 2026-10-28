// ─── L'interface de chat Aura Luna (bureau, thème sombre), reconstruite en code ───
// Une fenêtre minimaliste et monochrome : fond presque noir, blanc cassé, aucun accent de couleur.
// Typographie : Jost (géométrique, inspirée Bauhaus) pour la salutation et les réponses, Inter pour l'interface.
// 1 px de la maquette = 2 px du monde 1080 × 1920 : tailles des feux, du champ, des icônes, des textes.
// La fenêtre est plus étroite que sur un grand écran (comme une fenêtre redimensionnée) : le champ garde ses hauteurs.
// La marque (monogramme Aura Luna) n'est jamais déformée : seulement mise à l'échelle (pouls).
import React from "react";
import { Img, staticFile } from "remotion";
import { loadFont as loadTitre } from "@remotion/google-fonts/Jost";
import { loadFont as loadUI } from "@remotion/google-fonts/Inter";

const { fontFamily: TITRE } = loadTitre("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const { fontFamily: UI } = loadUI("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
export const POLICE_TITRE = TITRE, POLICE_UI = UI;

// Palette : noirs neutres, blancs cassés, une seule teinte d'accent (blanc cassé) pour le bouton, les puces et le voyant
export const PAL = {
  fond: "#0F0F11", champ: "#17171A", bord: "#2C2C31", texte: "#F3F2EF", texte2: "#B9B8B4", texte3: "#7C7B78", fantome: "#5C5B58",
  accent: "#F3F2EF", bulle: "#212125", feux: ["#FF5058", "#FCC02F", "#13BF56"],
};

type R = { x: number; y: number; w: number; h: number };
const box = (r: R): React.CSSProperties => ({ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h });

// La marque Aura Luna (public/logo-aura-luna.png : monogramme blanc rogné du logo complet).
// Elle est horizontale : pas de rotation, seulement le pouls (échelle) pour « l'assistant travaille ».
const MARQUE = staticFile("logo-aura-luna.png");
const MARQUE_RATIO = 1004 / 470; // largeur / hauteur du monogramme

// Le monogramme, centré sur (x, y). taille = hauteur d'une icône carrée équivalente ; pouls = échelle ; rot est ignoré.
export const Etoile: React.FC<{ x: number; y: number; taille: number; rot?: number; pouls?: number; o?: number }> = ({ x, y, taille, pouls = 1, o = 1 }) => (
  <Img src={MARQUE} style={{ position: "absolute", left: x - taille * 0.65, top: y - taille * 0.65 / MARQUE_RATIO, width: taille * 1.3, height: taille * 1.3 / MARQUE_RATIO, opacity: o, transform: `scale(${pouls.toFixed(3)})` }} />
);

const trait = (c: string, w = 2.4) => ({ fill: "none", stroke: c, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
const Ico: React.FC<{ x: number; y: number; t: number; o?: number; children: React.ReactNode }> = ({ x, y, t, o = 1, children }) => (
  <svg viewBox="0 0 24 24" width={t} height={t} style={{ position: "absolute", left: x - t / 2, top: y - t / 2, opacity: o }}>{children}</svg>
);

// La fenêtre : fond presque noir, feux macOS, icônes de barre (panneau, retour, suivant), menu à droite.
// Elle doit se VOIR sur le fond sombre de la vidéo : filet clair + ombre + léger halo blanc.
export const Fenetre: React.FC<{ w: number; h: number; children?: React.ReactNode; dessus?: React.ReactNode }> = ({ w, h, children, dessus }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, borderRadius: 24, overflow: "hidden", background: PAL.fond, boxShadow: "0 0 0 2px rgba(255,255,255,0.26), 0 40px 110px rgba(0,0,0,0.7), 0 0 150px rgba(255,255,255,0.07)", fontFamily: POLICE_UI }}>
    {children}
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: 96, background: `linear-gradient(${PAL.fond} 84px, rgba(15,15,17,0))` }} />
    {PAL.feux.map((c, i) => <div key={c} style={{ position: "absolute", left: 33 + i * 46, top: 33, width: 28, height: 28, borderRadius: 14, background: c }} />)}
    <Ico x={191} y={47} t={30}><rect x="3.5" y="4" width="17" height="16" rx="2.5" {...trait(PAL.texte2, 1.7)} /><path d="M9.5 4v16" {...trait(PAL.texte2, 1.7)} /></Ico>
    <Ico x={239} y={47} t={28}><path d="M19 12H5M11 6l-6 6 6 6" {...trait(PAL.texte2, 1.9)} /></Ico>
    <Ico x={287} y={47} t={28}><path d="M5 12h14M13 6l6 6-6 6" {...trait(PAL.fantome, 1.9)} /></Ico>
    <Ico x={w - 49} y={47} t={34}>{[5, 12, 19].map((cx) => <circle key={cx} cx={cx} cy="12" r="1.6" fill={PAL.texte2} />)}</Ico>
    {dessus}
  </div>
);

// « ▰ Salut, Aura Luna » : monogramme + salutation en police géométrique, centrés.
export const Salutation: React.FC<{ cx: number; y: number; nom?: string; o?: number }> = ({ cx, y, nom = "Aura Luna", o = 1 }) => (
  <div style={{ position: "absolute", left: cx - 500, top: y - 50, width: 1000, height: 100, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, opacity: o }}>
    <Img src={MARQUE} style={{ width: 92, height: 92 / MARQUE_RATIO, flexShrink: 0 }} />
    <div style={{ fontFamily: POLICE_TITRE, fontWeight: 400, fontSize: 68, letterSpacing: -1.2, color: PAL.texte, whiteSpace: "nowrap", lineHeight: "100px", paddingTop: 6 }}>Salut, {nom}</div>
  </div>
);

// Le champ de saisie : rectangle arrondi sombre, texte gris, « + » à gauche, micro + onde à droite.
// envoyer (0 → 1) : dès qu'il y a du contenu, le bouton d'envoi (carré arrondi blanc cassé, flèche sombre) remplace l'onde.
export const Champ: React.FC<{ r: R; texte?: string; saisi?: string; envoyer?: number; appui?: number; children?: React.ReactNode }> = ({ r, texte = "Que souhaitez-vous créer aujourd'hui ?", saisi, envoyer = 0, appui = 0, children }) => (
  <div style={{ ...box(r), borderRadius: 22, background: PAL.champ, border: `2px solid ${PAL.bord}`, boxSizing: "border-box", boxShadow: "0 8px 30px rgba(0,0,0,0.25)" }}>
    {children}
    <div style={{ position: "absolute", left: 32, bottom: 141, fontSize: 30, lineHeight: "40px", color: saisi ? PAL.texte : PAL.fantome, whiteSpace: "nowrap" }}>{saisi || texte}</div>
    <Ico x={45} y={r.h - 51} t={38}><path d="M12 4.5v15M4.5 12h15" {...trait(PAL.texte, 1.5)} /></Ico>
    <Ico x={r.w - 161} y={r.h - 51} t={36} o={1 - 0.6 * envoyer}><rect x="9" y="3" width="6" height="11.5" rx="3" {...trait(PAL.texte, 1.5)} /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" {...trait(PAL.texte, 1.5)} /></Ico>
    <Ico x={r.w - 89} y={r.h - 51} t={38} o={1 - envoyer}>{[[4, 4], [7, 8], [10, 14], [13, 9], [16, 13], [19, 6]].map(([x, h]) => <path key={x} d={`M${x} ${12 - h / 2}v${h}`} {...trait(PAL.texte, 1.4)} />)}</Ico>
    <Ico x={r.w - 47} y={r.h - 51} t={22} o={1 - envoyer}><path d="M6 9l6 6 6-6" {...trait(PAL.texte3, 2.2)} /></Ico>
    {envoyer > 0 && (
      <div style={{ position: "absolute", left: r.w - 56 - 32, top: r.h - 51 - 32, width: 64, height: 64, borderRadius: 18, background: PAL.accent, opacity: envoyer, transform: `scale(${(0.6 + 0.4 * envoyer - 0.12 * appui).toFixed(3)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="34" height="34" viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" {...trait(PAL.fond, 2.4)} /></svg>
      </div>
    )}
  </div>
);

// Sous le champ : « Nouveau projet ⌄ » à gauche, « Aura Studio · Créatif · Auto » à droite.
export const Rangee: React.FC<{ r: R; o?: number }> = ({ r, o = 1 }) => (
  <div style={{ position: "absolute", left: r.x, top: r.y + r.h + 20, width: r.w, height: 40, opacity: o, fontSize: 25.5, lineHeight: "40px", whiteSpace: "nowrap" }}>
    <div style={{ position: "absolute", left: 34, top: 0, color: PAL.texte2, display: "flex", alignItems: "center", gap: 10 }}>
      Nouveau projet
      <svg viewBox="0 0 24 24" width={20} height={20} style={{ marginTop: 2 }}><path d="M6 9l6 6 6-6" {...trait(PAL.texte3, 2.4)} /></svg>
    </div>
    <div style={{ position: "absolute", right: 34, top: 0, display: "flex", gap: 0 }}>
      <span style={{ color: PAL.texte }}>Aura Studio</span>
      <span style={{ color: PAL.texte3, marginLeft: 13 }}>Créatif</span>
      <span style={{ color: PAL.texte2, marginLeft: 28 }}>Auto</span>
    </div>
  </div>
);

// Le long texte collé : il devient un bloc carré avec un aperçu du texte et l'étiquette « PASTED ».
export const BlocColle: React.FC<{ r: R; o?: number; ech?: number; contenu?: number; apercu?: string }> = ({ r, o = 1, ech = 1, contenu = 1, apercu = `# Animated Social\nProfile (9:16)\n\nNETWORK: "tiktok"\n# The screenshot of\nthe profile is attached` }) => (
  <div style={{ ...box(r), borderRadius: 20, background: PAL.fond, border: `2px solid ${PAL.bord}`, boxSizing: "border-box", overflow: "hidden", opacity: o, transform: `scale(${ech.toFixed(3)})` }}>
    <div style={{ position: "absolute", left: 18, top: 16, right: 10, fontFamily: POLICE_UI, fontSize: 15.5, lineHeight: "21px", color: PAL.texte3, whiteSpace: "pre", opacity: contenu }}>{apercu}</div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: `linear-gradient(rgba(15,15,17,0), ${PAL.fond} 55%)`, opacity: contenu }} />
    <div style={{ position: "absolute", left: 14, bottom: 14, fontFamily: POLICE_UI, fontWeight: 700, fontSize: 25, letterSpacing: 0.8, color: PAL.texte, background: PAL.champ, border: `1.5px solid ${PAL.bord}`, borderRadius: 10, padding: "5px 12px", opacity: contenu }}>PASTED</div>
  </div>
);
