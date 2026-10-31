// Aura Luna — « La charte en mouvement » (31.7 s, 16 bars at 121 BPM). The film is assembled here, chapter by chapter.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FPS } from "./lib";
import { pageAt } from "./layout";
import { Page } from "./Page";
import { useFont } from "../shared/motion";

export const AuraCharte: React.FC<{ format: "h" | "v" }> = ({ format }) => {
  const ready = useFont(), t = useCurrentFrame() / FPS;
  if (!ready) return <AbsoluteFill style={{ backgroundColor: C.COSMOS }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: pageAt(t).dark ? C.COSMOS : C.LUNAIRE }}>
      <Page format={format} t={t} />
    </AbsoluteFill>
  );
};
