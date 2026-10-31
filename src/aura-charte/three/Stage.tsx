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

/** the Halo light as an opaque plane: Halo at the centre (70 %) falling off into Cosmos */
const haloTexture = () => {
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const g = c.getContext("2d")!, r = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  r.addColorStop(0, C.HALO); r.addColorStop(0.18, C.LUNA); r.addColorStop(0.5, C.NUIT); r.addColorStop(1, C.COSMOS);
  g.fillStyle = r; g.fillRect(0, 0, 512, 512);
  const tex = new CanvasTexture(c); tex.colorSpace = SRGBColorSpace; return tex;
};

export const Backdrop: React.FC<{ z?: number; size?: number; strength?: number }> = ({ z = -8, size = 34 }) => {
  const tex = useMemo(haloTexture, []);
  return (
    <mesh position={[0, 0, z]}>
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
