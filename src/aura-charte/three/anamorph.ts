// The optical illusion: six glass pieces at different depths that line up into the monogram from one viewpoint,
// and the camera path that ends exactly there. World units: 1 unit = 100 monogram units, monogram centred on 0.
import { PerspectiveCamera, Vector3 } from "three";
import { ease, lerp, lin, TL } from "../lib";
import { Format, LAYOUT } from "../layout";
import { ModuleId, moduleCentre } from "./shapes";
import type { Cam } from "./Stage";

/** a monogram point (640 × 300 units, y up) in world space, on the plane z = 0 */
export const worldOf = (x: number, y: number) => new Vector3((x - 320) / 100, (y - 150) / 100, 0);

const FOV = 30;
/** looking straight down −z, framing the monogram exactly where the light logo page draws it */
const hero = (format: Format): Cam => {
  const { H, W, mono } = LAYOUT[format], tan = Math.tan((FOV * Math.PI) / 360);
  const D = (6.4 * H) / (mono.w * 2 * tan), ppu = mono.w / 6.4;
  const cx = (W / 2 - (mono.x + mono.w / 2)) / ppu, cy = (mono.y + (mono.w * 150) / 640 - H / 2) / ppu;
  return { position: [cx, cy, D], target: [cx, cy, 0], fov: FOV };
};
export const HERO_CAMERA: Record<Format, Cam> = { h: hero("h"), v: hero("v") };

/** how far each piece floats in front of (+) or behind (−) the monogram plane */
export const PIECE_DEPTHS: Record<ModuleId, number> = { At: -2.4, Ab: 1.1, S: -3.6, B: 0.6, C: -1.2, D: 2.0 };

/** the piece's centre on the ray from the hero camera through its place in the monogram, scaled so it projects the same */
export const placePiece = (id: ModuleId, depth: number, format: Format) => {
  const C = new Vector3(...HERO_CAMERA[format].position), [x, y] = moduleCentre(id), P = worldOf(x, y);
  const k = (C.z - depth) / C.z;
  const Q = C.clone().add(P.clone().sub(C).multiplyScalar(k));
  return { position: [Q.x, Q.y, Q.z] as [number, number, number], scale: k };
};

/** the camera: still and frontal (02), a slow orbit (volume), a dolly into the space (03), an arc that settles on the hero viewpoint */
export const cameraAt = (t: number, format: Format): Cam => {
  const H = HERO_CAMERA[format];
  if (t < TL.volume || t >= TL.align) return H;
  const [tx, ty] = H.target, D = H.position[2];
  let angle: number, radius: number, lift: number;
  if (t < TL.space) { const e = ease.inOut(lin(t, TL.volume, TL.space - TL.volume)); angle = 22 * e; radius = 1; lift = 0.08 * e; }
  else if (t < TL.riser) { const e = ease.inOut(lin(t, TL.space, TL.riser - TL.space)); angle = lerp(22, -8, e); radius = lerp(1, 0.72, e); lift = lerp(0.08, 0.04, e); }
  else { const e = ease.inOut(lin(t, TL.riser, TL.align - TL.riser)); angle = lerp(-8, 0, e); radius = lerp(0.72, 1, e); lift = lerp(0.04, 0, e); }
  const a = (angle * Math.PI) / 180, r = D * radius;
  return { position: [tx + r * Math.sin(a), ty + D * lift, r * Math.cos(a)], target: [tx, ty, 0], fov: H.fov };
};

/** the point on the plane z = 0 seen under a pixel of the frame, through camera `cam` */
export const screenToWorld = (px: number, py: number, cam: Cam, format: Format) => {
  const { W, H } = LAYOUT[format], c = new PerspectiveCamera(cam.fov, W / H, 0.1, 500);
  c.position.set(...cam.position); c.lookAt(...cam.target); c.updateMatrixWorld(); c.updateProjectionMatrix();
  const p = new Vector3((px / W) * 2 - 1, 1 - (py / H) * 2, 0.5).unproject(c), dir = p.sub(c.position).normalize();
  return c.position.clone().add(dir.multiplyScalar(-c.position.z / dir.z));
};
