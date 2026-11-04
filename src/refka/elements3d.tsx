// The 3D elements that float behind the speaker: gold vitamins with embossed letters, amber softgels, two-tone capsules,
// a molecule, a DNA strand, mineral tiles, PRP tubes. One orthographic stage in pixel units, so every element is placed
// with the same pixel coordinates as the type.
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { random } from "remotion";
import { FONT } from "../shared/motion";
import { H, px, R, W } from "./theme";

type V3 = [number, number, number];
type At = [number, number];

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping; gl.toneMappingExposure = 1.05;
    const pm = new THREE.PMREMGenerator(gl), env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { env.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return null;
};

/** a full-frame transparent (or opaque, with background) orthographic stage, 1 unit = 1 px */
export const Scene: React.FC<{ children: React.ReactNode; background?: string; style?: React.CSSProperties }> = ({ children, background, style }) => (
  <ThreeCanvas width={W} height={H} dpr={1} orthographic camera={{ position: [0, 0, 2000], near: 1, far: 5000, zoom: 1 }}
    gl={{ antialias: true, alpha: !background, premultipliedAlpha: true }} style={{ position: "absolute", inset: 0, ...style }}>
    {background ? <color attach="background" args={[background]} /> : null}
    <Env />
    <directionalLight position={[-700, 900, 1400]} intensity={2.4} color="#FFF3DF" />
    <directionalLight position={[800, 300, -900]} intensity={1.6} color="#FFD8A0" />
    <ambientLight intensity={0.3} color="#FFF1E2" />
    {children}
  </ThreeCanvas>
);

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")!] as const;
};
const tex = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

const gold = (o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  new THREE.MeshPhysicalMaterial({ color: "#EABF66", metalness: 1, roughness: 0.24, clearcoat: 0.45, clearcoatRoughness: 0.18, envMapIntensity: 1.25, ...o });
const pearl = (o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  new THREE.MeshPhysicalMaterial({ color: R.PERLE, metalness: 0, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: new THREE.Color("#FFF6E8"), ...o });
const rose = () => new THREE.MeshPhysicalMaterial({ color: R.ROSE, metalness: 0, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });

/** a gold vitamin bead with its letter embossed on the face turned to camera (u = 0.25 is +z on a three.js sphere) */
export const Vitamin: React.FC<{ at: At; z?: number; r: number; label: string; turn?: number; tilt?: number }> = ({ at, z = 0, r, label, turn = 0, tilt = 0 }) => {
  const mat = useMemo(() => {
    const size = label.length > 1 ? 118 : 168, font = `800 ${size}px ${FONT}`;
    const [c, g] = canvas(1024, 512);
    g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, 1024, 512);
    g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#8C7550"; g.fillText(label, 256, 262);
    const [b, h] = canvas(1024, 512);
    h.fillStyle = "#000"; h.fillRect(0, 0, 1024, 512); h.filter = "blur(5px)";
    h.font = font; h.textAlign = "center"; h.textBaseline = "middle"; h.fillStyle = "#FFF"; h.fillText(label, 256, 262);
    return gold({ map: tex(c), bumpMap: tex(b, false), bumpScale: 4 });
  }, [label]);
  return (
    <mesh position={[...px(...at), z]} rotation={[tilt, turn, 0]} material={mat}>
      <sphereGeometry args={[r, 96, 64]} />
    </mesh>
  );
};

/** an amber softgel: a glossy translucent shell with a warm core */
export const Softgel: React.FC<{ at: At; z?: number; r: number; rot?: V3 }> = ({ at, z = 0, r, rot = [0, 0, 0] }) => (
  <group position={[...px(...at), z]} rotation={rot}>
    <mesh scale={[0.96, 0.58, 0.58]} renderOrder={0}>
      <sphereGeometry args={[r * 1.6, 48, 32]} />
      <meshBasicMaterial color="#FFC75A" transparent opacity={0.6} depthWrite={false} />
    </mesh>
    <mesh scale={[1.6, 1, 1]} renderOrder={1}>
      <sphereGeometry args={[r, 64, 48]} />
      <meshPhysicalMaterial color={R.AMBRE} roughness={0.02} clearcoat={1} clearcoatRoughness={0.02} transparent opacity={0.74} emissive="#9A5200" emissiveIntensity={0.22} envMapIntensity={2.4} specularIntensity={1} ior={1.5} />
    </mesh>
  </group>
);

/** a two-tone capsule: pearl cap over a gold body */
export const Capsule: React.FC<{ at: At; z?: number; r: number; len: number; rot?: V3 }> = ({ at, z = 0, r, len, rot = [0, 0, 0] }) => {
  const [top, body] = useMemo(() => [pearl(), gold({ roughness: 0.2, metalness: 0.85 })], []);
  return (
    <group position={[...px(...at), z]} rotation={rot}>
      <mesh position={[0, len / 4 + 2, 0]} material={top}><cylinderGeometry args={[r * 1.04, r * 1.04, len / 2 + 4, 64, 1, true]} /></mesh>
      <mesh position={[0, len / 2 + 4, 0]} material={top}><sphereGeometry args={[r * 1.04, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      <mesh position={[0, -len / 4 + 6, 0]} material={body}><cylinderGeometry args={[r, r, len / 2 + 12, 64, 1, true]} /></mesh>
      <mesh position={[0, -len / 2, 0]} material={body}><sphereGeometry args={[r, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /></mesh>
    </group>
  );
};

const Bond: React.FC<{ a: V3; b: V3; r: number; mat: THREE.Material }> = ({ a, b, r, mat }) => {
  const { mid, len, q } = useMemo(() => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va);
    return { mid: va.clone().add(vb).multiplyScalar(0.5), len: d.length(), q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()) };
  }, [a, b]);
  return <mesh position={mid} quaternion={q} material={mat}><cylinderGeometry args={[r, r, len, 20]} /></mesh>;
};

/** a ball-and-stick molecule: a ring of gold carbons, rose oxygens, pearl hydrogens */
export const Molecule: React.FC<{ at: At; z?: number; s?: number; rot?: V3 }> = ({ at, z = 0, s = 1, rot = [0.3, 0.5, 0] }) => {
  const { atoms, bonds, mats } = useMemo(() => {
    const ring: V3[] = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + (i * Math.PI) / 3; return [62 * Math.cos(a), 62 * Math.sin(a), i % 2 ? 12 : -12]; });
    const out = (i: number, k: number, dz = 0): V3 => [ring[i][0] * k, ring[i][1] * k, ring[i][2] + dz];
    const o1 = out(0, 1.95), h1 = out(3, 1.8), o2 = out(2, 1.95, 26), h2: V3 = [o2[0] - 46, o2[1] + 34, o2[2] + 10], h3 = out(5, 1.8, -10), h4 = out(4, 1.8, 14);
    const atoms: { p: V3; k: "c" | "o" | "h" }[] = [...ring.map((p) => ({ p, k: "c" as const })), { p: o1, k: "o" }, { p: h1, k: "h" }, { p: o2, k: "o" }, { p: h2, k: "h" }, { p: h3, k: "h" }, { p: h4, k: "h" }];
    const bonds: [V3, V3][] = [...ring.map((p, i) => [p, ring[(i + 1) % 6]] as [V3, V3]), [ring[0], o1], [ring[3], h1], [ring[2], o2], [o2, h2], [ring[5], h3], [ring[4], h4]];
    return { atoms, bonds, mats: { c: gold(), o: rose(), h: pearl(), bond: pearl({ color: "#E9E2D6", roughness: 0.35 }) } };
  }, []);
  const rad = { c: 23, o: 26, h: 15 };
  return (
    <group position={[...px(...at), z]} rotation={rot} scale={s}>
      {bonds.map(([a, b], i) => <Bond key={i} a={a} b={b} r={6} mat={mats.bond} />)}
      {atoms.map(({ p, k }, i) => <mesh key={i} position={p} material={mats[k]}><sphereGeometry args={[rad[k], 48, 32]} /></mesh>)}
    </group>
  );
};

/** a short DNA strand: two pearl backbones, gold and rose base pairs */
export const DNA: React.FC<{ at: At; z?: number; s?: number; rot?: V3; n?: number; spin?: number }> = ({ at, z = 0, s = 1, rot = [0, 0, 0.5], n = 16, spin = 0 }) => {
  const { tubes, rungs, mats } = useMemo(() => {
    const R0 = 52, step = 24, tw = 0.6, pt = (t: number, ph: number): V3 => [R0 * Math.cos(t * tw + ph), (t - (n - 1) / 2) * step, R0 * Math.sin(t * tw + ph)];
    const strand = (ph: number) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: (n - 1) * 4 + 1 }, (_, i) => new THREE.Vector3(...pt(i / 4, ph)))), 240, 8, 16, false);
    const rungs = Array.from({ length: n }, (_, i) => { const a = pt(i, 0), b = pt(i, Math.PI); return { a, b, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2] as V3 }; });
    return { tubes: [strand(0), strand(Math.PI)], rungs, mats: { back: pearl(), g: gold(), r: rose() } };
  }, [n]);
  return (
    <group position={[...px(...at), z]} rotation={rot} scale={s}>
      <group rotation={[0, spin, 0]}>
      {tubes.map((g, i) => <mesh key={i} geometry={g} material={mats.back} />)}
      {rungs.map(({ a, b, m }, i) => (
        <React.Fragment key={i}>
          <Bond a={a} b={m} r={4.5} mat={i % 2 ? mats.g : mats.r} />
          <Bond a={m} b={b} r={4.5} mat={i % 2 ? mats.r : mats.g} />
        </React.Fragment>
      ))}
      </group>
    </group>
  );
};

/** a mineral tile: a hexagonal pearl face with its symbol, gold edges */
export const Mineral: React.FC<{ at: At; z?: number; r: number; label: string; name: string; rot?: V3 }> = ({ at, z = 0, r, label, name, rot = [0, 0, 0] }) => {
  const mats = useMemo(() => {
    const [c, g] = canvas(512, 512);
    const bg = g.createRadialGradient(220, 200, 20, 256, 256, 300); bg.addColorStop(0, "#FFFDF8"); bg.addColorStop(1, "#E9E0D0");
    g.fillStyle = bg; g.fillRect(0, 0, 512, 512);
    // three.js maps the top cap a quarter turn round: draw the text turned back so it reads upright once the tile faces camera
    g.translate(256, 256); g.rotate(-Math.PI / 2);
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#A57A33";
    g.font = `800 180px ${FONT}`; g.fillText(label, 0, -18);
    g.font = `600 40px ${FONT}`; g.fillStyle = "#8E7556"; g.fillText(name.split("").join(String.fromCharCode(8202)), 0, 104);
    const face = new THREE.MeshPhysicalMaterial({ map: tex(c), roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 });
    const edge = gold({ roughness: 0.2 });
    return [edge, face, edge];
  }, [label, name]);
  return (
    <group position={[...px(...at), z]} rotation={rot}>
      <mesh rotation={[Math.PI / 2 - 0.42, 0, 0]} material={mats}>
        <cylinderGeometry args={[r, r, r * 0.4, 6]} />
      </mesh>
    </group>
  );
};

/** a centrifuged PRP tube: red cells, the thin white layer, golden plasma, inside glass, under a ribbed gold cap.
    The liquids are opaque on purpose: three.js transmission only bends opaque things. */
export const Tube: React.FC<{ at: At; z?: number; r: number; len: number; tilt?: number; turn?: number }> = ({ at, z = 0, r, len, tilt = 0, turn = 0 }) => {
  const m = useMemo(() => ({
    glass: new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", transmission: 1, roughness: 0.03, thickness: 8, ior: 1.5, metalness: 0, specularIntensity: 1, envMapIntensity: 1.6, side: THREE.DoubleSide }),
    rbc: new THREE.MeshPhysicalMaterial({ color: R.SANG, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
    buffy: new THREE.MeshPhysicalMaterial({ color: "#F2EBDD", roughness: 0.5 }),
    plasma: new THREE.MeshPhysicalMaterial({ color: "#EDB948", roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, emissive: "#C98418", emissiveIntensity: 0.26 }),
    cap: gold({ roughness: 0.32 }),
  }), []);
  const y0 = -len / 2, ri = r * 0.86, rbcH = len * 0.42, buffy = 9, plasmaH = len * 0.34;
  return (
    <group position={[...px(...at), z]} rotation={[0.1, turn, tilt]}>
      <mesh position={[0, y0 + rbcH / 2, 0]} material={m.rbc}><cylinderGeometry args={[ri, ri, rbcH, 48]} /></mesh>
      <mesh position={[0, y0, 0]} material={m.rbc}><sphereGeometry args={[ri, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /></mesh>
      <mesh position={[0, y0 + rbcH + buffy / 2, 0]} material={m.buffy}><cylinderGeometry args={[ri, ri, buffy, 48]} /></mesh>
      <mesh position={[0, y0 + rbcH + buffy + plasmaH / 2, 0]} material={m.plasma}><cylinderGeometry args={[ri, ri, plasmaH, 48]} /></mesh>
      <mesh material={m.glass}><cylinderGeometry args={[r, r, len, 72, 1, true]} /></mesh>
      <mesh position={[0, y0, 0]} material={m.glass}><sphereGeometry args={[r, 72, 36, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /></mesh>
      <mesh position={[0, len / 2 + 46, 0]} material={m.cap}><cylinderGeometry args={[r * 1.17, r * 1.17, 112, 72]} /></mesh>
      {Array.from({ length: 6 }, (_, k) => (
        <mesh key={k} position={[0, len / 2 + 6 + k * 17, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.cap}><torusGeometry args={[r * 1.17, 3.2, 12, 72]} /></mesh>
      ))}
    </group>
  );
};

/** small glowing platelets drifting in the plasma light */
export const Droplets: React.FC<{ n: number; box: [number, number, number, number]; rMin: number; rMax: number; seed: string; z?: number; t?: number }> = ({ n, box, rMin, rMax, seed, z = 0, t = 0 }) => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#F6D37A", roughness: 0.1, clearcoat: 1, emissive: "#E3A83A", emissiveIntensity: 0.6 }), []);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const span = box[3] - box[1], rise = t * (24 + 40 * random(`${seed}v${i}`));
        const x = box[0] + random(`${seed}x${i}`) * (box[2] - box[0]) + Math.sin(t * 1.3 + i) * 6;
        const y = box[1] + ((((random(`${seed}y${i}`) * span - rise) % span) + span) % span);
        const r = rMin + random(`${seed}r${i}`) ** 2 * (rMax - rMin);
        return <mesh key={i} position={[...px(x, y), z]} material={mat}><sphereGeometry args={[r, 32, 24]} /></mesh>;
      })}
    </>
  );
};

/** the opaque ground of the full-screen scene: a warm night with a soft champagne light and bokeh */
export const Backdrop: React.FC = () => {
  const map = useMemo(() => {
    const [c, g] = canvas(540, 960);
    const l = g.createLinearGradient(0, 0, 0, 960); l.addColorStop(0, "#211712"); l.addColorStop(1, "#0B0807");
    g.fillStyle = l; g.fillRect(0, 0, 540, 960);
    const glow = (x: number, y: number, rad: number, col: string) => { const r = g.createRadialGradient(x, y, 0, x, y, rad); r.addColorStop(0, col); r.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = r; g.fillRect(0, 0, 540, 960); };
    glow(270, 170, 330, "rgba(233,190,99,0.42)"); glow(40, 620, 260, "rgba(169,122,44,0.22)"); glow(520, 520, 240, "rgba(239,167,51,0.18)");
    g.filter = "blur(5px)";
    for (let i = 0; i < 16; i++) {
      g.fillStyle = `rgba(248,233,188,${0.05 + random(`b${i}`) * 0.12})`;
      g.beginPath(); g.arc(random(`bx${i}`) * 540, random(`by${i}`) * 520, 10 + random(`br${i}`) * 34, 0, Math.PI * 2); g.fill();
    }
    return tex(c);
  }, []);
  return (
    <mesh position={[0, 0, -1600]}>
      <planeGeometry args={[W * 1.02, H * 1.02]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
};
