// Shared by the Aura Luna films: the typeface (loaded before the first frame), film grain, true motion blur.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Freeze, staticFile, useCurrentFrame } from "remotion";
import { rand } from "../aura-point/lib";

/* ───────── Montserrat (variable), loaded before the first frame ───────── */
export const FONT = "AuraMontserrat";
let fontPromise: Promise<unknown> | null = null;
export const loadFont = () => (fontPromise ??= new FontFace(FONT, `url(${staticFile("aura-point/montserrat-variable.woff2")}) format("woff2")`, { weight: "100 900" })
  .load().then((f) => { document.fonts.add(f); }).catch((e) => console.error(e)));
/** true once Montserrat is in: every width is measured with the real font, never a fallback */
export const useFont = () => {
  const [ready, setReady] = useState(false), [wait] = useState(() => delayRender("Montserrat"));
  useEffect(() => { loadFont().then(() => setReady(true)); }, []);
  useEffect(() => { if (ready) continueRender(wait); }, [ready, wait]);
  return ready;
};
export const typeStyle = (w: number, size: number, ls = 0): React.CSSProperties => ({ fontFamily: FONT, fontWeight: w, fontVariationSettings: `'wght' ${w}`, fontSize: size, letterSpacing: ls });
let measureCtx: CanvasRenderingContext2D | null = null;
export const measure = (s: string, w: number, size: number, ls = 0) => {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  measureCtx!.font = `${w} ${size}px ${FONT}`;
  return measureCtx!.measureText(s).width + ls * s.length;
};

/* film grain, reseeded on twos (subliminal: nothing in the frame is ever dead-still).
   It sits above the motion blur, which would otherwise average it away. */
export const Grain: React.FC<{ W: number; H: number; opacity?: number }> = ({ W, H, opacity = 0.1 }) => {
  const seed = Math.floor(useCurrentFrame() / 2);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={Math.round(rand(seed) * 1000)} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
  );
};

/* true motion blur: sub-frames over a 180° shutter. Each layer is laid over the previous ones at 1/(k+1) opacity,
   so all of them weigh the same and a still frame stays exactly on palette (an additive blend brightens it). */
export const MotionBlur: React.FC<{ children: React.ReactNode; samples?: number; shutter?: number }> = ({ children, samples = 6, shutter = 0.5 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: samples }, (_, k) => (
        <AbsoluteFill key={k} style={{ opacity: 1 / (k + 1) }}>
          <Freeze frame={frame - (shutter * (samples - 1 - k)) / samples}>{children}</Freeze>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
