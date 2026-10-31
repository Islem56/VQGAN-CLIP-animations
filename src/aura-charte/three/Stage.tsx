// The 3D stage: a ThreeCanvas the size of the format, a camera driven by the frame, an opaque backdrop the glass
// can refract (the Halo light falling off into Cosmos, the construction grid), a cool key light and a soft studio
// environment for the reflections.
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, PerspectiveCamera, PMREMGenerator, SRGBColorSpace } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { C } from "../lib";
import { Format, LAYOUT } from "../layout";

export type Cam = { position: [number, number, number]; target: [number, number, number]; fov: number };

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...cam.position); camera.fov = cam.fov; camera.near = 0.1; camera.far = 200;
    camera.lookAt(...cam.target); camera.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

const Environment: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new PMREMGenerator(gl), env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { env.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return null;
};

/** the Halo light as an opaque plane: Halo at the centre falling off into Cosmos, with an optional Éclipse spot
    (the point burning behind the glass). Opaque on purpose: three.js transmission only bends opaque things. */
export type Warm = { u: number; v: number; k: number };
const drawBackdrop = (ctx: CanvasRenderingContext2D, warm: Warm | null) => {
  const r = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  r.addColorStop(0, C.HALO); r.addColorStop(0.18, C.LUNA); r.addColorStop(0.5, C.NUIT); r.addColorStop(1, C.COSMOS);
  ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = r; ctx.fillRect(0, 0, 512, 512);
  if (warm && warm.k > 0) {
    const x = warm.u * 512, y = (1 - warm.v) * 512, w = ctx.createRadialGradient(x, y, 0, x, y, 46);
    w.addColorStop(0, C.ECLIPSE); w.addColorStop(0.3, C.ECLIPSE + "AA"); w.addColorStop(1, C.ECLIPSE + "00");
    ctx.globalAlpha = warm.k; ctx.fillStyle = w; ctx.fillRect(0, 0, 512, 512); ctx.globalAlpha = 1;
  }
};

export const Backdrop: React.FC<{ at?: [number, number]; z?: number; size?: number; warm?: Warm | null }> = ({ at = [0, 0], z = -8, size = 34, warm = null }) => {
  const [ctx, tex] = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return [c.getContext("2d")!, t] as const;
  }, []);
  drawBackdrop(ctx, warm); tex.needsUpdate = true;
  return (
    <mesh position={[at[0], at[1], z]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

export const Stage: React.FC<{ format: Format; camera: Cam; children: React.ReactNode }> = ({ format, camera, children }) => {
  const { W, H } = LAYOUT[format];
  return (
    <ThreeCanvas width={W} height={H} dpr={1} gl={{ antialias: true }} style={{ position: "absolute", inset: 0 }}>
      <color attach="background" args={[C.COSMOS]} />
      <CameraRig cam={camera} />
      <Environment />
      <directionalLight position={[-4, 6, 8]} intensity={1.6} color={C.LUNAIRE} />
      <ambientLight intensity={0.15} color={C.BRUME} />
      {children}
    </ThreeCanvas>
  );
};
