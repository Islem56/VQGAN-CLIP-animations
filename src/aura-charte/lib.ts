// Aura Luna — « La charte en mouvement ». Time lives in timeline.json as [bar, beat] on the music's grid.
import TIMELINE from "./timeline.json";

export { C, clamp, ease, lerp, lin, prog, rand, sp, SPRING, springF } from "../aura-point/lib";

export const FPS = TIMELINE.fps;
export const BPM = TIMELINE.bpm;
/** one beat, in seconds */
export const B = 60 / BPM;
/** the start of a bar (1-based) and beat (1-based), in seconds */
export const bar = (n: number, beat = 1) => ((n - 1) * 4 + (beat - 1)) * B;
export const FRAMES = Math.round(bar(TIMELINE.bars + 1) * FPS);

type Pos = [number, number];
type Beats = typeof TIMELINE.beats;
const at = (p: Pos) => bar(p[0], p[1]);
/** every named beat in seconds: a single [bar, beat] becomes a number, a list becomes a list */
export const TL = Object.fromEntries(
  Object.entries(TIMELINE.beats).map(([k, v]) => [k, Array.isArray(v[0]) ? (v as Pos[]).map(at) : at(v as Pos)]),
) as { [K in keyof Beats]: Beats[K] extends number[][] ? number[] : number };

export type ChapterId = "adn" | "logo" | "couleurs" | "typo" | "signature";
export const CHAPTERS: { id: ChapterId; from: number; to: number }[] = [
  { id: "adn", from: bar(1), to: bar(5) },
  { id: "logo", from: bar(5), to: bar(9) },
  { id: "couleurs", from: bar(9), to: bar(13) },
  { id: "typo", from: bar(13), to: bar(15) },
  { id: "signature", from: bar(15), to: bar(17) },
];
export const chapterAt = (t: number): ChapterId => (CHAPTERS.find((c) => t >= c.from && t < c.to) ?? CHAPTERS[CHAPTERS.length - 1]).id;
