# AURA LUNA — « Le point » (Remotion)

16.9 s · 60 fps · 121 BPM · loops (the last frame leads into the first). Cut to the beat of
« Hazy After Hours » (Alejandro Magaña, Mixkit #132; downloaded at runtime, never committed). The Remotion rebuild of
`auraluna-point/`: one written motion language, review sheets at every beat, true motion blur and a
measured sound pass.

| Composition | Size | Use |
|---|---|---|
| `AuraLunaPoint` | 1920×1080 | YouTube, website, LinkedIn |
| `AuraLunaPointVertical` | 1080×1920 | Reels, TikTok, Shorts (recomposed, key content inside y 220–1500) |

## Motion language

| Property | Choice |
|---|---|
| Cell | kinetic-soft for objects, calm-sharp for type |
| Eases | `out` (0.16, 1, 0.3, 1) arrivals · `in` (0.6, 0, 0.9, 0.35) exits · `inOut` (0.65, 0, 0.35, 1) moves between states |
| Springs | closed form, exactly 1 once settled (the loop closes): settle, knob, pop, heavy, **elastic once** (the Nuit square: the hero moment) |
| Overshoot | only on physical things (the dot, the knob, the square, the poles); type never bounces |
| Stagger | letters 0.025–0.035 s, monogram pieces 0.045 s, poles one per beat |
| Holds | « Imagination » 0.6 s, « 6 pôles d'expertise » 1 s, the end card 2.5 s after the signature |
| Colour | Éclipse orange is only ever the dot; the light is a Halo → Luna → Aura gradient, the night is Nuit |
| Texture | film grain on twos (above the blur), a drifting dot grid on cream, a vignette on the night |
| Blur | 6 sub-frames over a 180° shutter, equal weights, wrapped in time so frame 0 blurs into the loop's end |
| Velocity | the dot stretches along its own velocity (up to 1.5×) whenever it is round |

## Files

```
timeline.json   every beat, in seconds (picture and sound read the same file)
lib.ts          palette, eases, springs, both layouts
Film.tsx        the film
make-cues.mjs   timeline.json → cues.json for the sound pass
data/           « Limit Imagination » outlines (Montserrat 600 → 800), the traced monogram and Asik wordmark
```

## Commands

```bash
CHROME="--browser-executable=/opt/pw-browsers/chromium --chrome-mode=chrome-for-testing"   # only in the cloud sandbox
npx remotion still AuraLunaPoint out/f.png --frame=720 $CHROME
npx remotion render AuraLunaPoint out/aura-point/silent-16x9.mp4 --crf=16 --pixel-format=yuv420p --color-space=bt709 $CHROME
npx remotion render AuraLunaPointVertical out/aura-point/silent-9x16.mp4 --crf=16 --pixel-format=yuv420p --color-space=bt709 $CHROME

# sound (sound-effects skill): real CC0 effects + a Mixkit track downloaded at runtime (never committed)
node src/aura-point/make-cues.mjs
.sound-effects/bin/python .claude/skills/sound-effects/scripts/sound_pass.py --video out/aura-point/silent-16x9.mp4 \
  --cues src/aura-point/cues.json --music .sound-cache/track.mp3 --manifest .claude/skills/sound-effects/sfx/manifest.json \
  --out out/aura-point/sound-16x9 --music-source "…" --music-license "Mixkit Stock Music Free License" --use-case "Instagram, TikTok, YouTube"
```
