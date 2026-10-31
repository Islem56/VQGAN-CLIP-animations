import React from "react";
import { Composition } from "remotion";
import { ChatVideo, DUREE_S } from "./Chat";
import { AuraPoint } from "./aura-point/Film";
import { FPS, FRAMES, LAYOUT } from "./aura-point/lib";
import { AuraCharte } from "./aura-charte/Film";
import * as Charte from "./aura-charte/lib";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ChatIA" component={ChatVideo} durationInFrames={Math.round(DUREE_S * 30)} fps={30} width={1080} height={1920} />
    <Composition id="AuraLunaPoint" component={AuraPoint} defaultProps={{ format: "h" as const }} durationInFrames={FRAMES} fps={FPS} width={LAYOUT.h.W} height={LAYOUT.h.H} />
    <Composition id="AuraLunaPointVertical" component={AuraPoint} defaultProps={{ format: "v" as const }} durationInFrames={FRAMES} fps={FPS} width={LAYOUT.v.W} height={LAYOUT.v.H} />
    <Composition id="AuraLunaCharte" component={AuraCharte} defaultProps={{ format: "h" as const }} durationInFrames={Charte.FRAMES} fps={Charte.FPS} width={1920} height={1080} />
    <Composition id="AuraLunaCharteVertical" component={AuraCharte} defaultProps={{ format: "v" as const }} durationInFrames={Charte.FRAMES} fps={Charte.FPS} width={1080} height={1920} />
  </>
);
