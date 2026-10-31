// node src/aura-charte/make-cues.mjs → cues.json + swaps.json for the sound pass. Every cue comes from timeline.json
// (beats as [bar, beat] at 121 BPM), so retiming the film moves the sound with it. Glass taps use the two recorded
// glass sounds of the library (CC0), alternately.
import { readFileSync, writeFileSync } from "node:fs";
const T = JSON.parse(readFileSync(new URL("./timeline.json", import.meta.url)));
const B = 60 / T.bpm, at = ([bar, beat]) => ((bar - 1) * 4 + (beat - 1)) * B, b = Object.fromEntries(Object.entries(T.beats).map(([k, v]) => [k, Array.isArray(v[0]) ? v.map(at) : at(v)]));
const r = (x) => Math.round(x * 1000) / 1000;
const cues = [];
const cue = (t, type, desc, extra = {}) => cues.push({ t: r(t), type, desc, ...extra });
const tap = (t, desc) => cue(t, "appear", desc, { glass: true });

tap(0.1, "the page opens: a glass tap");
cue(b.point, "appear", "the point leaves the page number");
cue(b.line, "movement", "the line of light (LIGNE)");
b.plans.forEach((t, i) => tap(t, `glass plane ${i + 1} (${["circle", "square", "triangle"][i]})`));
cue(b.volume, "movement", "the planes take volume, the camera starts to orbit");
b.cut.forEach((t, i) => tap(t, `the compass cut ${i + 1}`));
cue(b.space, "scene_cut", "page 03 · Logo: into the space");
cue(b.riser, "build_up", "riser into the alignment", { dur: r(b.align - b.riser) });
cue(b.align, "reveal", "the alignment: the monogram exists (the loudest hit)");
b.letters.forEach((t, i) => tap(t, `the light reads ${["A", "the left L", "the right L"][i]}`));
cue(b.flash, "scene_cut", "the flash: the point becomes light");
cue(b.flash + 0.3, "appear", "the pieces take the official gradient");
cue(b.palette, "scene_cut", "page 04 · Couleurs");
for (let i = 0; i < 6; i++) tap(b.palette + (i * B) / 2, `capsule ${i + 1} fills`);
cue(b.neutrals + 0.5, "appear", "the accent: the point lands");
cue(b.dark, "scene_cut", "the Cosmos capsule becomes the page");
cue(b.lens + 0.3, "movement", "the lens crosses the halo");
for (let i = 0; i < 8; i += 2) cue(b.asik + 0.06 * i, "hover_or_small_ui", `AURA LUNA, letter ${i + 1}`);
tap(b.asik + 0.6, "Asik Regular");
[b.aa, b.aa + B, b.aa + 2 * B, b.aa + 3 * B, b.aa + 3.5 * B].forEach((t, i) => cue(t, "hover_or_small_ui", `weight ${["Light", "Regular", "Medium", "SemiBold", "Bold"][i]}`));
cue(b.sign, "movement", "the light opens onto the signature");
cue(b.sign + 0.3, "appear", "the monogram");
tap(b.sign + 0.9, "DIGITAL · DESIGN · PRODUCTION");

cues.sort((a, c) => a.t - c.t);
const swaps = {};
cues.forEach((c, i) => { if (c.glass) swaps[i] = `ding/kenney-interface-glass-00${(Object.keys(swaps).length % 2) + 1}.ogg`; });
writeFileSync(new URL("./cues.json", import.meta.url), JSON.stringify(cues, null, 1) + "\n");
writeFileSync(new URL("./swaps.json", import.meta.url), JSON.stringify(swaps, null, 1) + "\n");
console.log(`${cues.length} cues, ${Object.keys(swaps).length} glass taps`);
