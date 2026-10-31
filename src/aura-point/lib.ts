// Aura Luna — « Le point » (Remotion). The motion language lives here; time lives in timeline.json.
import { Easing } from "remotion";
import TL from "./timeline.json";

export { TL };
export const FPS = TL.fps;
export const DURATION = TL.duration;
export const FRAMES = Math.round(TL.duration * TL.fps);

/* The brand palette (guidelines, 04 · Couleurs). Éclipse is only ever the dot. */
export const C = {
  COSMOS: "#02060E", NUIT: "#1F0533", AURA: "#59047C", LUNA: "#7604A0", HALO: "#9303C5",
  BLANC: "#FFFFFF", LUNAIRE: "#F4F1F7", BRUME: "#E2D3EC", ARDOISE: "#6E6A75", ECLIPSE: "#D53207",
  LOGO_A: "#750BB5", LOGO_B: "#130F20", // the monogram's gradient, sampled from the logo file
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/* Motion language (Premium personality): one ease for arrivals, one for exits, one for moves between states. */
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.6, 0, 0.9, 0.35),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};
/** progress of a tween that starts at t0 and lasts d seconds */
export const prog = (t: number, t0: number, d: number, e: (x: number) => number = ease.out) => e(clamp((t - t0) / d));
export const lin = (t: number, t0: number, d: number) => clamp((t - t0) / d);
/** exponential-in: a push that accelerates into the cut */
export const expIn = (p: number, k = 5) => (Math.exp(k * p) - 1) / (Math.exp(k) - 1);

/* Closed-form springs (step response of a damped oscillator). The presets are the motion-design skill's
   damping / stiffness / mass feels, converted to damping ratio z and natural frequency w:
   settle 14/140/0.8 · knob 12/190/0.75 · pop 10/220/0.7 · heavy 18/180/0.8 · elastic 8/200/1 (one hero moment). */
export type Spring = { z: number; w: number };
export const SPRING = {
  settle: { z: 0.66, w: 13.2 },
  knob: { z: 0.5, w: 15.9 },
  pop: { z: 0.4, w: 17.7 },
  heavy: { z: 0.75, w: 15 },
  elastic: { z: 0.28, w: 14.1 },
  graph: { z: 0.45, w: 7.04 }, // the spring the dot draws: peaks half a second after it starts, settles in ≈ 1.2 s
} satisfies Record<string, Spring>;
export const springF = (tau: number, s: Spring) => {
  if (tau <= 0) return 0;
  const { z, w } = s, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * tau));
};
/** a spring that starts at t0 and is exactly 1 once its envelope has decayed below 0.3 % (so loops close exactly) */
export const sp = (t: number, t0: number, s: Spring) => {
  const tau = t - t0, end = Math.log(1 / 0.003) / (s.z * s.w);
  return tau <= 0 ? 0 : tau >= end ? 1 : springF(tau, s);
};

/** deterministic pseudo-random in [0, 1) */
export const rand = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* Two compositions of the same film, recomposed rather than cropped. 'v' keeps the key content inside the
   Reels safe zone (top ≈ 220 px and bottom ≈ 420 px are covered by the app's UI). */
export type Layout = typeof LAYOUT.h;
export const LAYOUT = {
  h: {
    W: 1920, H: 1080, LS: 98, HS: 236, TW: 172, TH: 92, TGAP: 72, LB: 574, uiHead: -170, uiLine1: -134, uiDesc: 62, uiLine2: 116, uiHeadSize: 19, uiDescSize: 29,
    GO: [420, 830] as [number, number], GW: 860, VS: 80, shoot: 470, grid6: 520,
    call: { n: [1344, 324, 190], l1: [1476, 260, 48], l2: [1476, 318, 48] },
    square: 360, pill: [1000, 220], cover: [2700, 1700], violet: 2400,
    RR: 430, RF: 46, open: 1300, falloff: 420, spacing: 32,
    MW: 500, MY: 236, WMS: 0.86, WMB: 600, studio: [664, 21, 8.8], sign: [["Des visions créatives. Des univers singuliers", 752]] as [string, number][], signSize: 34,
    home: [1480, 870], away: [2080, 1240],
  },
  v: {
    W: 1080, H: 1920, LS: 80, HS: 152, TW: 150, TH: 82, TGAP: 48, LB: 900, uiHead: -160, uiLine1: -124, uiDesc: 58, uiLine2: 112, uiHeadSize: 18, uiDescSize: 27,
    GO: [130, 1450] as [number, number], GW: 660, VS: 95, shoot: 180, grid6: 250,
    call: { n: [124, 590, 236], l1: [330, 492, 62], l2: [330, 566, 62] },
    square: 380, pill: [230, 1040], cover: [1800, 2800], violet: 2600,
    RR: 380, RF: 42, open: 1500, falloff: 560, spacing: 32,
    MW: 620, MY: 600, WMS: 0.95, WMB: 1040, studio: [1112, 24, 9.5], sign: [["Des visions créatives.", 1214], ["Des univers singuliers", 1268]] as [string, number][], signSize: 40,
    home: [860, 1360], away: [1200, 2140],
  },
};
