import React from "react";
import { Composition } from "remotion";
import { ChatVideo, DUREE_S } from "./Chat";

export const RemotionRoot: React.FC = () => (
  <Composition id="ChatIA" component={ChatVideo} durationInFrames={Math.round(DUREE_S * 30)} fps={30} width={1080} height={1920} />
);
