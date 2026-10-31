// Aura Luna — « La charte en mouvement » (31.7 s, 16 bars at 121 BPM). The film is assembled here, chapter by chapter.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, chapterAt, FPS } from "./lib";

export const AuraCharte: React.FC<{ format: "h" | "v" }> = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: C.COSMOS, color: C.LUNAIRE, alignItems: "center", justifyContent: "center", fontSize: 48 }}>
      {chapterAt(t)}
    </AbsoluteFill>
  );
};
