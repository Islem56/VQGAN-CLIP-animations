// The monogram's six traced modules as three.js shapes, in monogram units (640 × 300), y up.
import { ExtrudeGeometry, Shape, Vector2 } from "three";
import MONO from "../../aura-point/data/monogram.json";

export const MODULE_IDS = ["At", "Ab", "S", "B", "C", "D"] as const;
export type ModuleId = (typeof MODULE_IDS)[number];
type Module = { loop: number[]; c: number[] };
const modules = MONO.modules as Record<ModuleId, Module>;

/** the module's outline; y is flipped (300 − y) so the shape is upright in three.js */
export const moduleShape = (id: ModuleId): Shape => {
  const l = modules[id].loop, pts: Vector2[] = [];
  for (let i = 0; i < l.length; i += 2) pts.push(new Vector2(l[i], MONO.h - l[i + 1]));
  return new Shape(pts);
};
/** the module's centre in the same units (y up) */
export const moduleCentre = (id: ModuleId): [number, number] => [modules[id].c[0], MONO.h - modules[id].c[1]];
export const MONO_SIZE: [number, number] = [MONO.w, MONO.h];

/** a slab of glass: the shape extruded towards +z, with a small rounded bevel */
export const extrude = (shape: Shape, depth: number, bevel = 2) =>
  new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 3, curveSegments: 24 });   // the bevel rounds inwards: the outline never grows
