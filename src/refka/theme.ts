// Dr Refka Abderrahim — Reel mock-ups. Placeholder palette (a warm champagne gold, as in the reference) until the
// doctor's own brand colours arrive. Every position is in pixels on the 1080×1920 frame.
import { loadFont } from "@remotion/google-fonts/Cairo";
import type React from "react";

export const W = 1080, H = 1920;
export const R = {
  OR_CLAIR: "#F8E9BC",
  OR: "#E3BC63",
  OR_PROFOND: "#A97A2C",
  BLANC: "#FFFFFF",
  NOIR: "#0B0A09",
  NUIT: "#16120F",
  PERLE: "#F3EFE8",
  ROSE: "#D99A97",
  AMBRE: "#EFA733",
  SANG: "#6E0B14",
} as const;

/** Arabic display and subtitles */
export const { fontFamily: CAIRO } = loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["arabic", "latin"] });

/** to replace with the doctor's real handle */
export const HANDLE = "@DR.REFKA.ABDERRAHIM";

/** pixel position on the frame → orthographic world position (origin at the centre, y up) */
export const px = (x: number, y: number): [number, number] => [x - W / 2, H / 2 - y];

/** the gold used on type: a vertical champagne gradient with a soft glow (drop-shadow keeps the gradient clean) */
export const goldText: React.CSSProperties = {
  backgroundImage: `linear-gradient(180deg, ${R.OR_CLAIR} 8%, ${R.OR} 52%, ${R.OR_PROFOND} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: "drop-shadow(0 0 16px rgba(227,188,99,0.55)) drop-shadow(0 3px 5px rgba(0,0,0,0.45))",
};
export const whiteText: React.CSSProperties = {
  color: R.BLANC,
  textShadow: "0 3px 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.35)",
};
