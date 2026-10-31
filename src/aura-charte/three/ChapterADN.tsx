// Chapter 02 · ADN — the Bauhaus, from the point to the volume. The orange point leaves the page number and draws a
// line of light (hot at its head, cooling to violet behind it); a circle, a square and a triangle of glass enter on the
// beats, take thickness while the camera starts to orbit, and are cut along compass circles into the six pieces of the
// monogram, which drift to their places in space.
import React, { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry, ExtrudeGeometry, Float32BufferAttribute, RingGeometry, Shape, SRGBColorSpace } from "three";
import { C, clamp, ease, lerp, lin, prog, sp, SPRING, TL } from "../lib";
import { Format, LAYOUT, pageAt } from "../layout";
import { measure } from "../../shared/motion";
import { cameraAt, PIECE_DEPTHS, placePiece, screenToWorld } from "./anamorph";
import { dim, glassMaterial } from "./materials";
import { extrude, ModuleId, moduleCentre, moduleShape } from "./shapes";

type V3 = [number, number, number];
const v3 = (a: number[]): V3 => [a[0], a[1], a[2] ?? 0];
const mix = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** the ADN composition per format: an anchor in world units (the hero camera's plane z = 0) and a scale */
export const ADN = {
  v: { a: [0, -1.2] as [number, number], s: 1.12 },
  h: { a: [1.5, -1.6] as [number, number], s: 0.85 },
};
const at = (format: Format, x: number, y: number, z = 0): V3 => [ADN[format].a[0] + x * ADN[format].s, ADN[format].a[1] + y * ADN[format].s, z];

/* ───────── textures and geometries, built once ───────── */
const glowTexture = () => {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d")!, r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,0.45)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
};
/** a unit tube along +x (0 → 1) coloured Orbite → Luna → Halo → Éclipse: the dégradé Éclipse, hot at the head */
const beamGeometry = (radius: number) => {
  const g = new CylinderGeometry(radius, radius, 1, 12, 48, true); g.rotateZ(-Math.PI / 2); g.translate(0.5, 0, 0);
  const stops: [number, string][] = [[0, C.ORBITE], [0.5, C.LUNA], [0.85, C.HALO], [1, C.ECLIPSE]];
  const pos = g.getAttribute("position"), col: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const u = clamp(pos.getX(i)); let k = 0; while (k < stops.length - 2 && u > stops[k + 1][0]) k++;
    const [u0, c0] = stops[k], [u1, c1] = stops[k + 1], c = new Color(c0).lerp(new Color(c1), (u - u0) / (u1 - u0));
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new Float32BufferAttribute(col, 3)); return g;
};
const plate = (shape: Shape) => { const g = new ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 48 }); g.translate(0, 0, -0.5); return g; };
const circleShape = () => { const s = new Shape(); s.absarc(0, 0, 1.25, 0, Math.PI * 2, false); return s; };
const squareShape = () => { const s = new Shape(); s.moveTo(-1.1, -1.1); s.lineTo(1.1, -1.1); s.lineTo(1.1, 1.1); s.lineTo(-1.1, 1.1); s.closePath(); return s; };
const triangleShape = () => { const r = 2.6 / Math.sqrt(3), s = new Shape(); for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + (i * 2 * Math.PI) / 3; i ? s.lineTo(r * Math.cos(a), r * Math.sin(a)) : s.moveTo(r * Math.cos(a), r * Math.sin(a)); } s.closePath(); return s; };
/** a monogram piece: front face on z = 0, centred on its module centre, in monogram units (the mesh scales by 1/100) */
export const pieceGeometry = (id: ModuleId) => { const [cx, cy] = moduleCentre(id), g = extrude(moduleShape(id), 40, 4); g.translate(-cx, -cy, -44); return g; };

/** the lit edge of a plate: its outline on the front face, Lunaire, turning Éclipse on the side that faces the point */
const edgeGeometry = (shape: Shape) => {
  const pts = shape.getPoints(96), g = new BufferGeometry(), pos: number[] = [];
  for (const p of pts) pos.push(p.x, p.y, 0);
  g.setAttribute("position", new Float32BufferAttribute(pos, 3)); g.setAttribute("color", new Float32BufferAttribute(new Array(pos.length).fill(1), 3));
  return g;
};
const tintEdge = (g: BufferGeometry, centre: V3, scale: number, point: V3, warmth: number) => {
  const pos = g.getAttribute("position"), col = g.getAttribute("color") as BufferAttribute, cool = new Color(C.LUNAIRE).multiplyScalar(0.8), hot = new Color(C.ECLIPSE);
  const d = [point[0] - centre[0], point[1] - centre[1]], dl = Math.hypot(d[0], d[1]) || 1;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), l = Math.hypot(x, y) || 1, k = Math.max(0, (x * d[0] + y * d[1]) / (l * dl)) ** 2 * warmth;
    const c = cool.clone().lerp(hot, k); col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true; void scale;
};

/* ───────── the scene ───────── */
const A_PIECES: ModuleId[] = ["S", "B", "C"], L_PIECES: ModuleId[] = ["At", "Ab", "D"];
const groupCentre = (ids: ModuleId[]) => ids.map(moduleCentre).reduce(([x, y], [a, b]) => [x + a / ids.length, y + b / ids.length], [0, 0]);

/** where each piece is (and how big) at time t: born inside the prism or the cube at the cut, then drifting to its place in space */
export const pieceAt = (id: ModuleId, t: number, format: Format, from: { pos: V3; rot: V3; birth: number }) => {
  const group = A_PIECES.includes(id) ? A_PIECES : L_PIECES, [gx, gy] = groupCentre(group), [cx, cy] = moduleCentre(id), s0 = 0.62 * ADN[format].s;
  const start: V3 = [from.pos[0] + ((cx - gx) / 100) * s0, from.pos[1] + ((cy - gy) / 100) * s0, from.pos[2]];
  const end = placePiece(id, PIECE_DEPTHS[id], format), e = ease.inOut(lin(t, from.birth, TL.space - from.birth));
  return { position: mix(start, end.position, e), scale: lerp(s0, end.scale, e) / 100, rotation: mix(from.rot, [0, 0, 0], e) };
};

export const ChapterADN: React.FC<{ t: number; format: Format; warmSpot?: { k: number } | null }> = ({ t, format, warmSpot }) => {
  const L = LAYOUT[format];
  const geo = useMemo(() => ({
    beam: beamGeometry(0.035), beamGlow: beamGeometry(0.12), circle: plate(circleShape()), square: plate(squareShape()), triangle: plate(triangleShape()),
    edges: { circle: edgeGeometry(circleShape()), square: edgeGeometry(squareShape()), triangle: edgeGeometry(triangleShape()) } as Record<string, BufferGeometry>,
    pieceEdges: Object.fromEntries([...A_PIECES, ...L_PIECES].map((id) => { const [cx, cy] = moduleCentre(id), s = moduleShape(id); s.getPoints(); const g = edgeGeometry(s); g.translate(-cx, -cy, 0.5); return [id, g]; })) as unknown as Record<ModuleId, BufferGeometry>,
    glow: glowTexture(), pieces: Object.fromEntries([...A_PIECES, ...L_PIECES].map((id) => [id, pieceGeometry(id)])) as unknown as Record<ModuleId, BufferGeometry>,
  }), []);
  const glass = glassMaterial(t);

  // the construction grid draws on from the centre in 0.5 s
  const grid = useMemo(() => new BufferGeometry(), []);
  const g = prog(t, 0, 0.5), step = 0.8, [ox, oy] = ADN[format].a, half = format === "v" ? [7, 11] : [14, 8], pts: number[] = [];
  for (let x = -half[0]; x <= half[0] + 1e-6; x += step) pts.push(ox + x, oy - half[1] * g, -0.6, ox + x, oy + half[1] * g, -0.6);
  for (let y = -half[1]; y <= half[1] + 1e-6; y += step) pts.push(ox - half[0] * g, oy + y, -0.6, ox + half[0] * g, oy + y, -0.6);
  grid.setAttribute("position", new BufferAttribute(new Float32Array(pts), 3));

  // the point: from the page number, an arc into the page, then it draws the beam
  const p = pageAt(TL.point - 0.01), hs = L.headerSize;
  const dotPx: [number, number] = [L.W - L.margin - measure(p.pageNo, 600, hs, hs * 0.2) - hs * 0.55, L.footerY - hs * 0.36];
  const P0 = v3(screenToWorld(dotPx[0], dotPx[1], cameraAt(TL.point, format), format).toArray());
  const P1 = at(format, -2.7, -2.7), P2 = at(format, 2.5, 2.7);
  const jump = ease.inOut(lin(t, TL.point, 0.35)), draw = ease.inOut(lin(t, TL.point + 0.35, 0.5));
  let point: V3 = t < TL.point ? P0 : t < TL.point + 0.35 ? (() => { const q = mix(P0, P1, jump); q[1] += 1.6 * Math.sin(Math.PI * jump); return q; })() : mix(P1, P2, draw);
  const rest = at(format, 2.9, -0.6, 0.6);                                       // during the volume, the point lights the side of the volumes
  point = mix(point, rest, ease.inOut(lin(t, TL.volume, 0.8)));
  const len = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]), ang = Math.atan2(P2[1] - P1[1], P2[0] - P1[0]);
  const beamLen = t < TL.point + 0.35 ? 0 : len * draw, beamOn = beamLen > 0.01 && t < TL.space;

  // three plates of glass, one per beat, with a heavy spring; then thickness and their own turn
  const vol = ease.inOut(lin(t, TL.volume, 0.8)), turn: V3 = [0.32 * vol, -0.48 * vol, 0];
  const plates = [
    { key: "circle", g: geo.circle, end: at(format, 1.25, 1.2), from: [8, 0, 0], beat: TL.plans[0], depth: lerp(0.16, 0.9, vol) },
    { key: "square", g: geo.square, end: at(format, -1.55, -0.25), from: [-8, 0, 0], beat: TL.plans[1], depth: lerp(0.16, 2.2, vol) },
    { key: "triangle", g: geo.triangle, end: at(format, -0.1, -2.15), from: [0, -10, 0], beat: TL.plans[2], depth: lerp(0.16, 0.9, vol) },
  ];
  const cutA = TL.cut[0], cutL = TL.cut[1];
  const discGone = 1 - ease.in(lin(t, cutA, 0.25)), ring = prog(t, cutA, 0.25);
  const ringGeo = useMemo(() => new RingGeometry(1.44, 1.458, 96, 1, Math.PI / 2, Math.max(0.001, Math.PI * 2 * ring)), [ring]);
  const flash = (t0: number) => Math.max(0, 1 - Math.abs(t - t0 - 0.02) / 0.06);
  const warm = new Color(C.ECLIPSE);
  return (
    <group>
      <lineSegments geometry={grid}><lineBasicMaterial color={dim(C.ARDOISE, 0.35)} toneMapped={false} /></lineSegments>
      {/* the beam: the dégradé Éclipse in motion (opaque, so the glass can bend it), plus a soft glow */}
      {beamOn && <mesh geometry={geo.beam} position={P1} rotation={[0, 0, ang]} scale={[beamLen, 1, 1]}><meshBasicMaterial vertexColors toneMapped={false} /></mesh>}
      {beamOn && <mesh geometry={geo.beamGlow} position={P1} rotation={[0, 0, ang]} scale={[beamLen, 1, 1]}><meshBasicMaterial vertexColors transparent opacity={0.25} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>}
      {/* the point: a small sun that lights the glass edges facing it */}
      {t < TL.space + 0.3 && <group position={point}>
        <mesh><sphereGeometry args={[0.09, 24, 16]} /><meshBasicMaterial color={C.ECLIPSE} toneMapped={false} /></mesh>
        <sprite scale={[1.1, 1.1, 1]}><spriteMaterial map={geo.glow} color={warm} transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></sprite>
        <pointLight color={C.ECLIPSE} intensity={t < TL.point ? 0 : 60} distance={0} decay={2} />
      </group>}
      {plates.map((pl, i) => {
        const q = sp(t, pl.beat, SPRING.heavy); if (q <= 0) return null;
        const gone = (pl.key === "circle" && t >= cutA + 0.25) || (pl.key === "triangle" && t >= cutA) || (pl.key === "square" && t >= cutL);
        if (gone) return null;
        const pos = mix([pl.end[0] + pl.from[0], pl.end[1] + pl.from[1], 0], pl.end, q), sc = ADN[format].s * (pl.key === "circle" ? discGone : 1);
        const edge = geo.edges[pl.key]; tintEdge(edge, pos, sc, point, t < TL.point + 0.5 ? 0 : 1);
        return (
          <group key={i} position={pos} rotation={turn}>
            <mesh geometry={pl.g} material={glass} scale={[sc, sc, pl.depth * ADN[format].s]} />
            <lineLoop geometry={edge} position={[0, 0, (pl.depth * ADN[format].s) / 2 + 0.035]} scale={[sc, sc, 1]}><lineBasicMaterial vertexColors toneMapped={false} /></lineLoop>
          </group>
        );
      })}
      {/* the compass circle that cuts: it draws through the disc, the disc disappears into it */}
      {ring > 0 && t < TL.space + 0.4 && <mesh geometry={ringGeo} position={[plates[0].end[0], plates[0].end[1], 0.5]} scale={ADN[format].s}><meshBasicMaterial color={dim(C.BRUME, 0.6)} toneMapped={false} /></mesh>}
      {/* the six pieces: the prism gives the A, the cube the two L's */}
      {[...A_PIECES, ...L_PIECES].map((id) => {
        const isA = A_PIECES.includes(id), birth = isA ? cutA : cutL; if (t < birth) return null;
        const src = isA ? plates[2] : plates[1], s = pieceAt(id, t, format, { pos: src.end, rot: turn, birth });
        const towards: V3 = t >= TL.riser ? [0, 0, 0] : point, edge = geo.pieceEdges[id];
        tintEdge(edge, s.position, 1, towards, t >= TL.riser ? 0.35 + 0.65 * (warmSpot?.k ?? 0) : 0.6);
        return (
          <group key={id} position={s.position} rotation={s.rotation} scale={[s.scale, s.scale, s.scale]}>
            <mesh geometry={geo.pieces[id]} material={glass} />
            <lineLoop geometry={edge}><lineBasicMaterial vertexColors toneMapped={false} /></lineLoop>
          </group>
        );
      })}
      {/* a two-frame flash hides each swap */}
      {[[cutA, plates[2].end], [cutL, plates[1].end]].map(([t0, c], i) => flash(t0 as number) > 0 &&
        <sprite key={i} position={[(c as V3)[0], (c as V3)[1], 1.2]} scale={[4.5, 4.5, 1]}><spriteMaterial map={geo.glow} color={C.LUNAIRE} transparent opacity={0.9 * flash(t0 as number)} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></sprite>)}
    </group>
  );
};

