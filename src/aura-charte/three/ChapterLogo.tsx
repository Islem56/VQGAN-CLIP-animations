// Chapter 03 · Logo (3D) — the camera enters an architecture of glass panes (the grid now standing in space); the
// six pieces float at their depths; light shafts; the orange point comes back behind the monogram and burns there
// like an eclipse, then crosses the glass towards the camera on the flash.
import React, { useMemo } from "react";
import { AdditiveBlending, BoxGeometry, PlaneGeometry } from "three";
import { C, ease, lerp, lin, TL } from "../lib";
import { Format } from "../layout";
import { ADN } from "./ChapterADN";
import { HERO_CAMERA } from "./anamorph";
import { paneMaterial } from "./materials";
import type { Warm } from "./Stage";

const PANES: Record<Format, [number, number][]> = {   // [x, z] of each pane on one side (mirrored on the other)
  v: [[4.0, -2], [4.9, -4], [5.8, -6]],
  h: [[4.4, -2], [5.9, -3.5], [7.4, -5], [8.9, -6.5]],
};
export const BACKDROP_SIZE: Record<Format, number> = { v: 17, h: 21 };

/** the backdrop drifts from the ADN composition to the monogram's centre while the camera enters the space */
export const backdropAt = (t: number, format: Format): [number, number] => {
  const e = ease.inOut(lin(t, TL.space, TL.align - TL.space)), a = ADN[format].a;
  return [lerp(a[0], 0, e), lerp(a[1], 0, e)];
};
/** the Éclipse spot burning behind the monogram (backdrop texture coordinates and strength) */
export const warmAt = (t: number, format: Format): Warm | null => {
  if (t < TL.riser || t > TL.flash + 0.3) return null;
  const [cx, cy, D] = HERO_CAMERA[format].position, sx = (-8 * cx) / D, sy = (-8 * cy) / D, [bx, by] = backdropAt(t, format), size = BACKDROP_SIZE[format];
  let k = 0.5 * ease.inOut(lin(t, TL.riser, TL.align - 0.2 - TL.riser));
  k = lerp(k, 0.85, ease.inOut(lin(t, TL.align - 0.2, 0.2)));
  k = lerp(k, 0.6, ease.inOut(lin(t, TL.letters[2] + 0.2, 0.4)));
  k = lerp(k, 1, ease.in(lin(t, TL.flash - 0.2, 0.2)));
  return { u: (sx - bx) / size + 0.5, v: (sy - by) / size + 0.5, k };
};

export const ChapterLogo: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  const geo = useMemo(() => ({ pane: new BoxGeometry(0.9, 34, 0.06), shaft: new PlaneGeometry(1.4, 30) }), []);
  if (t < TL.space) return null;
  const glass = paneMaterial(), [cx, cy, D] = HERO_CAMERA[format].position;
  // the point behind the monogram (on the hero ray through its centre, 6 units behind), then through the glass
  const behind: [number, number, number] = [(-6 * cx) / D, (-6 * cy) / D, -6];
  const cross = ease.in(lin(t, TL.flash - 0.15, 0.25)), pt: [number, number, number] = [lerp(behind[0], 0, cross), lerp(behind[1], 0, cross), lerp(-6, 2, cross)];   // it crosses the glass; the 2D flash does the rest
  const pIn = ease.out(lin(t, TL.riser, 0.6)), shafts = 1 - ease.in(lin(t, TL.align - 0.4, 0.4));
  return (
    <group>
      {PANES[format].flatMap(([x, z], i) => [-1, 1].map((side) => {
        const rise = ease.out(lin(t, TL.space + 0.08 * i + (side > 0 ? 0.04 : 0), 0.9));
        return <mesh key={`${i}${side}`} geometry={geo.pane} material={glass} position={[side * x, -36 * (1 - rise), z]} rotation={[0, side * -0.32, 0]} />;
      }))}
      {shafts > 0 && [[-1.2, 0.35], [2.2, 0.22]].map(([x, r], i) => (
        <mesh key={i} geometry={geo.shaft} position={[x, 0, -1]} rotation={[0, 0, r]}>
          <meshBasicMaterial color={C.HALO} transparent opacity={0.07 * shafts * ease.out(lin(t, TL.space + 0.3, 0.8))} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {t >= TL.riser && t < TL.flash + 0.2 && (
        <mesh position={pt} scale={pIn * (1 + 0.6 * cross)}><sphereGeometry args={[0.12, 24, 16]} /><meshBasicMaterial color={C.ECLIPSE} toneMapped={false} /></mesh>
      )}
    </group>
  );
};
