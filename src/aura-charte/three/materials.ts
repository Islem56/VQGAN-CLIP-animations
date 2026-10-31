// The glass: physically based transmission (it really refracts what is behind it). Frosted at the start of the
// film, clearer and clearer until the alignment: the idea gets sharper.
import { Color, MeshPhysicalMaterial } from "three";
import { C, clamp, lerp, TL } from "../lib";

export const glassParams = (t: number) => ({
  roughness: lerp(0.38, 0.06, clamp(t / TL.align)),
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

/** a palette colour dimmed towards Cosmos (for opaque things the glass must be able to refract: no transparency) */
export const dim = (hex: string, k: number) => new Color(C.COSMOS).lerp(new Color(hex), k);
