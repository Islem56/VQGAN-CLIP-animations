// Aura Luna — « La charte en mouvement » (31.7 s, 16 bars at 121 BPM). The film is assembled here, layer by layer:
// the 3D glass (chapters 02–03, until just after the flash), the flat pages (from the flash on, with true motion blur),
// the flash, the guidelines page frame, the grain.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FPS, TL } from "./lib";
import { Format, LAYOUT, pageAt } from "./layout";
import { Page } from "./Page";
import { LogoOverlay } from "./LogoOverlay";
import { LogoPage } from "./pages/LogoPage";
import { Couleurs } from "./pages/Couleurs";
import { Typo } from "./pages/Typo";
import { Signature } from "./pages/Signature";
import { Backdrop, Stage } from "./three/Stage";
import { ChapterADN } from "./three/ChapterADN";
import { BACKDROP_SIZE, backdropAt, ChapterLogo, warmAt } from "./three/ChapterLogo";
import { cameraAt } from "./three/anamorph";
import { Grain, MotionBlur, useFont } from "../shared/motion";

/** when the 3D stage hands over to the flat pages (under the flash's peak) */
export const HANDOVER = TL.flash + 0.2;
/** the page ground: dark or Lunaire; it stays dark while the signature opens its light over it */
const ground = (t: number) => (pageAt(t).dark || t >= TL.sign ? C.COSMOS : C.LUNAIRE);

/** the flat pages, each reading its own frame (so the motion blur's sub-frames see their own time), on an opaque ground */
const Pages: React.FC<{ format: Format }> = ({ format }) => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: ground(t) }}>
      <LogoPage t={t} format={format} />
      <Couleurs t={t} format={format} />
      <Typo t={t} format={format} />
      <Signature t={t} format={format} />
    </AbsoluteFill>
  );
};

export const AuraCharte: React.FC<{ format: Format }> = ({ format }) => {
  const ready = useFont(), t = useCurrentFrame() / FPS, { W, H } = LAYOUT[format];
  if (!ready) return <AbsoluteFill style={{ backgroundColor: C.COSMOS }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: ground(t) }}>
      {t < HANDOVER ? (
        <Stage format={format} camera={cameraAt(t, format)}>
          <Backdrop at={backdropAt(t, format)} size={BACKDROP_SIZE[format]} warm={warmAt(t, format)} />
          <ChapterADN t={t} format={format} warmSpot={warmAt(t, format)} />
          <ChapterLogo t={t} format={format} />
        </Stage>
      ) : (
        <MotionBlur><Pages format={format} /></MotionBlur>
      )}
      <LogoOverlay t={t} format={format} />
      <Page format={format} t={t} />
      <Grain W={W} H={H} opacity={0.08} />
    </AbsoluteFill>
  );
};
