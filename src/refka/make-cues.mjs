// node src/refka/make-cues.mjs → cues.json + swaps.json for the sound pass of the example Reel. Every cue comes from
// timeline.json (cuts in beats at 121 BPM), so retiming the edit moves the sound with it.
import { readFileSync, writeFileSync } from "node:fs";
const T = JSON.parse(readFileSync(new URL("./timeline.json", import.meta.url)));
const B = 60 / T.bpm, s = Object.fromEntries(Object.entries(T.seg).map(([k, v]) => [k, v * B]));
const r = (x) => Math.round(x * 1000) / 1000, cues = [];
const cue = (t, type, desc, extra = {}) => cues.push({ t: r(t), type, desc, ...extra });

cue(0.1, "appear", "hook: the first words");
cue(0.36, "movement", "the gold word rises from behind her head");
cue(s.window, "scene_cut", "jump cut: the B-roll window");
cue(s.window + 0.06, "appear", "the window opens", { glass: true });
cue(s.elements, "scene_cut", "jump cut: the 3D elements");
[0.06, 0.12, 0.18, 0.26].forEach((d, i) => cue(s.elements + d, "appear", `elements spring out from behind her (${i + 1})`));
cue(s.keyword, "scene_cut", "punch-in: the keyword");
cue(s.keyword + 0.3, "appear", "the gold keyword lands");
cue(s.keyword + 0.95, "build_up", "riser into the full-screen scene", { dur: r(s.full - s.keyword - 0.95) });
cue(s.full, "reveal", "the PRP scene opens behind her (the loudest hit)");
cue(s.full + 0.15, "movement", "the tubes rise");
cue(s.end, "scene_cut", "the end card");
cue(s.end + 0.5, "appear", "the Instagram glyph", { glass: true });

cues.sort((a, c) => a.t - c.t);
const swaps = {};
cues.forEach((c, i) => { if (c.glass) swaps[i] = `ding/kenney-interface-glass-00${(Object.keys(swaps).length % 2) + 1}.ogg`; });
writeFileSync(new URL("./cues.json", import.meta.url), JSON.stringify(cues, null, 1) + "\n");
writeFileSync(new URL("./swaps.json", import.meta.url), JSON.stringify(swaps, null, 1) + "\n");
console.log(`${cues.length} cues, ${Object.keys(swaps).length} glass taps`);
