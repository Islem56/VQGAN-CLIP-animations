// The guidelines page, for both formats, and what the page says at each moment of the film.
import { TL } from "./lib";

export type Format = "h" | "v";
export type PageLayout = {
  W: number; H: number; margin: number;
  headerY: number; headerSize: number; footerY: number;
  /** the section label sits on the header line in 16:9, on a second line in 9:16 (both would collide at 1080 px) */
  sectionY: number;
  eyebrowY: number; eyebrowSize: number; titleY: number; titleSize: number; titleLeading: number;
  bodyY: number; bodySize: number; triadY: number;
  content: { x: number; y: number; w: number; h: number };
  /** where the monogram sits on the light logo page; the 3D hero camera frames it exactly here */
  mono: { x: number; y: number; w: number };
  wordmark: { cx: number; baseline: number; scale: number };
};

export const LAYOUT: Record<Format, PageLayout> = {
  h: {
    W: 1920, H: 1080, margin: 96,
    headerY: 92, headerSize: 18, footerY: 1010, sectionY: 92,
    eyebrowY: 170, eyebrowSize: 20, titleY: 234, titleSize: 54, titleLeading: 64,
    bodyY: 352, bodySize: 21, triadY: 352,
    content: { x: 96, y: 300, w: 1728, h: 660 },
    mono: { x: 660, y: 330, w: 600 },
    wordmark: { cx: 960, baseline: 760, scale: 0.78 },
  },
  v: {
    W: 1080, H: 1920, margin: 80,
    headerY: 268, headerSize: 22, footerY: 1480, sectionY: 306,
    eyebrowY: 380, eyebrowSize: 24, titleY: 452, titleSize: 64, titleLeading: 76,
    bodyY: 574, bodySize: 24, triadY: 574,
    content: { x: 80, y: 600, w: 920, h: 840 },
    mono: { x: 180, y: 700, w: 720 },
    wordmark: { cx: 540, baseline: 1200, scale: 0.88 },
  },
};

export type PageMeta = {
  dark: boolean; frame: boolean; section: string; phase: string; phaseFraction: number; pageNo: string;
  eyebrow?: string; title?: string[]; body?: string[];
};

const ADN: PageMeta = { dark: true, frame: true, section: "02 · ADN & DIRECTION ARTISTIQUE", phase: "PREMIER CROISSANT", phaseFraction: 0.22, pageNo: "10",
  eyebrow: "INSPIRATION ARTISTIQUE", title: ["Bauhaus et", "géométrie moderne"] };
const LOGO: PageMeta = { dark: true, frame: true, section: "03 · LOGO", phase: "PREMIER QUARTIER", phaseFraction: 0.5, pageNo: "14",
  eyebrow: "MONOGRAMME", title: ["Une ligature,", "deux initiales"] };
const COUL: PageMeta = { dark: false, frame: true, section: "04 · COULEURS", phase: "LUNE GIBBEUSE CROISSANTE", phaseFraction: 0.78, pageNo: "18",
  eyebrow: "PALETTE", title: ["De la nuit", "au halo"] };
const TYPO: PageMeta = { dark: true, frame: true, section: "05 · TYPOGRAPHIE", phase: "PLEINE LUNE", phaseFraction: 1, pageNo: "22",
  eyebrow: "POLICES", title: ["Deux voix,", "deux rôles"] };

/** every moment the page changes, in order, with what it shows from then on */
export const PAGE_CHANGES: [number, PageMeta][] = [
  [0, { ...ADN, body: ["Géométrie, simplicité formelle, équilibre des compositions,", "dialogue entre l'art et la technologie."] }],
  [TL.point, ADN],
  [TL.space, LOGO],
  [TL.flash, { ...LOGO, dark: false, pageNo: "15", title: ["A au centre,", "L de chaque côté"] }],
  [TL.palette, COUL],
  [TL.neutrals, { ...COUL, eyebrow: "NEUTRES · ACCENT" }],
  [TL.dark, { ...COUL, dark: true, pageNo: "19", eyebrow: "LUMIÈRE", title: ["La couleur", "comme une source"], body: ["Chez Aura Luna, le violet ne se pose pas : il éclaire."] }],
  [TL.asik, TYPO],
  [TL.sign, { ...TYPO, dark: false, frame: false }],
];
export const pageIndexAt = (t: number) => { let i = 0; while (i + 1 < PAGE_CHANGES.length && t >= PAGE_CHANGES[i + 1][0]) i++; return i; };
export const pageAt = (t: number): PageMeta => PAGE_CHANGES[pageIndexAt(t)][1];
