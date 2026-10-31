// Aura Luna — « La charte en mouvement » (31.7 s, 16 bars at 121 BPM). The film is assembled here, chapter by chapter.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FPS, TL } from "./lib";
import { Backdrop, Stage } from "./three/Stage";
import { BACKDROP_SIZE, backdropAt, ChapterLogo, warmAt } from "./three/ChapterLogo";
import { LogoOverlay } from "./LogoOverlay";
import { ChapterADN } from "./three/ChapterADN";
import { cameraAt } from "./three/anamorph";
import { pageAt } from "./layout";
import { Page } from "./Page";
import { useFont } from "../shared/motion";
export const AuraCharte: React.FC<{ format: "h" | "v" }> = ({ format }) => {
  const ready = useFont(), t = useCurrentFrame() / FPS;
  if (!ready) return <AbsoluteFill style={{ backgroundColor: C.COSMOS }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: pageAt(t).dark ? C.COSMOS : C.LUNAIRE }}>
      {t < TL.flash + 0.2 && (
        <Stage format={format} camera={cameraAt(t, format)}>
          <Backdrop at={backdropAt(t, format)} size={BACKDROP_SIZE[format]} warm={warmAt(t, format)} />
          <ChapterADN t={t} format={format} warmSpot={warmAt(t, format)} />
          <ChapterLogo t={t} format={format} />
        </Stage>
      )}
      <LogoOverlay t={t} format={format} />
      <Page format={format} t={t} />
    </AbsoluteFill>
  );
};
