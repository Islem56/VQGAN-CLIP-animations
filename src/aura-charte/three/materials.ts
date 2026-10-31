// The glass: physically based transmission (it really refracts what is behind it). Frosted at the start of the
// film, clearer and clearer until the alignment: the idea gets sharper.
import { Color, MeshPhysicalMaterial } from "three";
import { C, clamp, lerp, TL } from "../lib";

export const glassParams = (t: number) => ({
  roughness: lerp(0.38, 0.16, clamp(t / TL.align)),
  transmission: 1, ior: 1.45, thickness: 0.6, dispersion: 0.25,
  attenuationColor: C.LUNA, attenuationDistance: 2.5, clearcoat: 0.6, clearcoatRoughness: 0.1,
  specularIntensity: 1, envMapIntensity: 0.8,
});

let shared: MeshPhysicalMaterial | null = null;
/** one glass material for the whole scene, updated to time t */
export const glassMaterial = (t: number): MeshPhysicalMaterial => {
  const p = glassParams(t);
  shared ??= new MeshPhysicalMaterial({ color: new Color(C.BLANC) });
  shared.roughness = p.roughness; shared.transmission = p.transmission; shared.ior = p.ior; shared.thickness = p.thickness;
  shared.dispersion = p.dispersion; shared.attenuationColor.set(p.attenuationColor); shared.attenuationDistance = p.attenuationDistance;
  shared.clearcoat = p.clearcoat; shared.clearcoatRoughness = p.clearcoatRoughness; shared.specularIntensity = p.specularIntensity;
  shared.envMapIntensity = p.envMapIntensity;
  return shared;
};

let pane: MeshPhysicalMaterial | null = null;
/** the architecture's panes: thin, clear glass that catches little of the room, so it reads as glass, not stone */
export const paneMaterial = (): MeshPhysicalMaterial => (pane ??= new MeshPhysicalMaterial({
  color: new Color(C.BLANC), transmission: 1, roughness: 0.08, ior: 1.45, thickness: 0.15, envMapIntensity: 0.12,
  specularIntensity: 0.6, attenuationColor: new Color(C.LUNA), attenuationDistance: 6,
}));

/** a palette colour dimmed towards Cosmos (for opaque things the glass must be able to refract: no transparency) */
export const dim = (hex: string, k: number) => new Color(C.COSMOS).lerp(new Color(hex), k);
