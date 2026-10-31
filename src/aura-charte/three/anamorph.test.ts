import { describe, expect, it } from "vitest";
import { Box2, PerspectiveCamera, Vector3 } from "three";
import { cameraAt, HERO_CAMERA, PIECE_DEPTHS, placePiece, screenToWorld, worldOf } from "./anamorph";
import { MODULE_IDS, moduleCentre, moduleShape } from "./shapes";
import { LAYOUT } from "../layout";
import { bar, FPS } from "../lib";

const makeCam = (format: "h" | "v", c = HERO_CAMERA[format]) => {
  const { W, H } = LAYOUT[format], cam = new PerspectiveCamera(c.fov, W / H, 0.1, 500);
  cam.position.set(...c.position); cam.lookAt(...c.target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  return cam;
};
const toScreen = (p: Vector3, cam: PerspectiveCamera, format: "h" | "v") => {
  const { W, H } = LAYOUT[format], n = p.clone().project(cam);
  return [((n.x + 1) / 2) * W, ((1 - n.y) / 2) * H];
};

describe("the anamorphic monogram", () => {
  for (const format of ["h", "v"] as const) {
    it(`lines the six pieces up into the official monogram from the hero camera (${format})`, () => {
      const cam = makeCam(format), L = LAYOUT[format], k2d = L.mono.w / 640;
      for (const id of MODULE_IDS) {
        const b = new Box2().setFromPoints(moduleShape(id).getPoints()), c = moduleCentre(id);
        const { position, scale } = placePiece(id, PIECE_DEPTHS[id], format);
        for (const [x, y] of [[b.min.x, b.min.y], [b.max.x, b.min.y], [b.min.x, b.max.y], [b.max.x, b.max.y]]) {
          const local = worldOf(x, y).sub(worldOf(c[0], c[1])).multiplyScalar(scale);
          const [sx, sy] = toScreen(new Vector3(...position).add(local), cam, format);
          expect(Math.abs(sx - (L.mono.x + x * k2d))).toBeLessThan(0.5);
          expect(Math.abs(sy - (L.mono.y + (300 - y) * k2d))).toBeLessThan(0.5);
        }
      }
    });
  }
  it("puts the pieces at different depths", () => expect(new Set(Object.values(PIECE_DEPTHS)).size).toBe(6));
});

describe("the camera path", () => {
  for (const format of ["h", "v"] as const) {
    it(`lands exactly on the hero camera at the alignment and stays (${format})`, () => {
      expect(cameraAt(bar(7), format)).toEqual(HERO_CAMERA[format]);
      expect(cameraAt(bar(7) + 1, format)).toEqual(HERO_CAMERA[format]);
      expect(cameraAt(0, format)).toEqual(HERO_CAMERA[format]);
    });
    it(`moves without jumps (${format})`, () => {
      const D = HERO_CAMERA[format].position[2];
      let prev = new Vector3(...cameraAt(0, format).position), max = 0;
      for (let f = 1; f <= Math.round(bar(8) * FPS); f++) {
        const p = new Vector3(...cameraAt(f / FPS, format).position);
        max = Math.max(max, p.distanceTo(prev)); prev = p;
      }
      expect(max).toBeLessThan(0.015 * D);
    });
  }
});

describe("screen to world", () => {
  for (const format of ["h", "v"] as const) {
    it(`finds the monogram's top-left corner under its pixel (${format})`, () => {
      const L = LAYOUT[format], p = screenToWorld(L.mono.x, L.mono.y, HERO_CAMERA[format], format);
      expect(p.distanceTo(worldOf(0, 300))).toBeLessThan(1e-6);
    });
  }
});
