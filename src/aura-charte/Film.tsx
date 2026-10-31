// Aura Luna — « La charte en mouvement » (31.7 s, 16 bars at 121 BPM). The film is assembled here, chapter by chapter.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FPS, TL } from "./lib";
import { Backdrop, Stage } from "./three/Stage";
import { BACKDROP_SIZE, backdropAt, ChapterLogo, warmAt } from "./three/ChapterLogo";
import { LogoOverlay } from "./LogoOverlay";
import { LogoPage } from "./pages/LogoPage";
import { Couleurs } from "./pages/Couleurs";
import { Typo } from "./pages/Typo";
import { Signature } from "./pages/Signature";
import { ChapterADN } from "./three/ChapterADN";
import { cameraAt } from "./three/anamorph";
import { pageAt } from "./layout";
import { Page } from "./Page";
import { useFont } from "../shared/motion";
export const AuraCharte: React.FC<{ format: "h" | "v" }> = ({ format }) => {
  const ready = useFont(), t = useCurrentFrame() / FPS;
  if (!ready) return <AbsoluteFill style={{ backgroundColor: C.COSMOS }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: pageAt(t).dark || t >= TL.sign ? C.COSMOS : C.LUNAIRE }}>
      {t < TL.flash + 0.2 && (
        <Stage format={format} camera={cameraAt(t, format)}>
          <Backdrop at={backdropAt(t, format)} size={BACKDROP_SIZE[format]} warm={warmAt(t, format)} />
          <ChapterADN t={t} format={format} warmSpot={warmAt(t, format)} />
          <ChapterLogo t={t} format={format} />
        </Stage>
      )}
      <LogoPage t={t} format={format} />
      <Couleurs t={t} format={format} />
      <Typo t={t} format={format} />
      <Signature t={t} format={format} />
      <LogoOverlay t={t} format={format} />
      <Page format={format} t={t} />
    </AbsoluteFill>
  );
};
