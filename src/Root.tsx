import React from "react";
import { Composition } from "remotion";
import { ChatVideo, DUREE_S } from "./Chat";
import { AuraPoint } from "./aura-point/Film";
import { DURATION, FPS, LAYOUT } from "./aura-point/lib";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ChatIA" component={ChatVideo} durationInFrames={Math.round(DUREE_S * 30)} fps={30} width={1080} height={1920} />
    <Composition id="AuraLunaPoint" component={AuraPoint} defaultProps={{ format: "h" as const }} durationInFrames={DURATION * FPS} fps={FPS} width={LAYOUT.h.W} height={LAYOUT.h.H} />
    <Composition id="AuraLunaPointVertical" component={AuraPoint} defaultProps={{ format: "v" as const }} durationInFrames={DURATION * FPS} fps={FPS} width={LAYOUT.v.W} height={LAYOUT.v.H} />
  </>
);
