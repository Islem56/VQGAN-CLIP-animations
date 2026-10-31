// node src/aura-point/make-cues.mjs → cues.json for the sound-effects pass. Every cue is read from timeline.json,
// so retiming the film moves the sound with it. One real sound per meaningful event; the six poles share a beat grid.
import { readFileSync, writeFileSync } from "node:fs";
const T = JSON.parse(readFileSync(new URL("./timeline.json", import.meta.url)));
const { s1, s2, s3, s4, s5, s6, s7 } = T;
const c = (t, type, desc, extra = {}) => ({ t: Math.round(t * 1000) / 1000, type, desc, ...extra });
const cues = [
  c(s1.click, "click", "the cursor turns the toggle off"),
  c(s1.letGo, "movement", "« Limit » and the settings row fall away"),
  c(s1.jump, "movement", "the dot jumps off the toggle"),
  c(s1.land, "appear", "the dot lands as the i's tittle"),
  c(s2.leave, "movement", "the dot leaves, « Imagination » falls"),
  c(s2.peak, "success", "the spring peaks"),
  c(s2.callout, "hover_or_small_ui", "6 pôles d'expertise counts in"),
  c(s3.shoot, "movement", "the dot shoots along the target line"),
  c(s3.shoot + 0.1, "build_up", "riser into the violet light", { dur: s3.light - s3.shoot - 0.1 }),
  c(s3.light, "scene_cut", "violet light fills the frame"),
  c(s3.square, "appear", "the Nuit square springs open (hero spring)"),
  c(s3.pill, "movement", "square stretches into a pill"),
  c(s3.dot, "scene_cut", "the night fills the frame (the pill's last rush)"),
  ...s4.poles.map((t, i) => c(t, "hover_or_small_ui", `pole ${i + 1} drops into orbit`)),
  c(s4.open + 0.02, "build_up", "the ring opens into the halftone", { dur: s5.cream - s4.open - 0.02 }),
  c(s6.card, "reveal", "the end card: monogram (the loudest hit)"),
  c(s6.wordmark, "appear", "AURA LUNA rises"),
  c(s6.studio, "hover_or_small_ui", "Studio de production visuelle"),
  c(s6.sign + 0.5, "success", "the signature lands on its full stop"),
  c(s6.out, "scene_cut", "the card falls away"),
  c(s7.graph, "movement", "back along the graph"),
  c(s7.toggle, "movement", "back into the toggle"),
  c(s7.refill, "click", "the toggle turns on: the loop closes"),
];
writeFileSync(new URL("./cues.json", import.meta.url), JSON.stringify(cues, null, 1) + "\n");
console.log(`${cues.length} cues`);
