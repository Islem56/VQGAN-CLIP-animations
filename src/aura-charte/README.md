# AURA LUNA — « La charte en mouvement »

31.7 s · 60 fps · 121 BPM (16 bars of « Hazy After Hours », Alejandro Magaña, Mixkit #132 — downloaded at runtime,
never committed). The brand guidelines, paged through in glass: every chapter is laid out as a page of the charter
(header, section number, moon phase, page number).

| Bars | Page | What happens |
|---|---|---|
| 1–4 | 02 · ADN & direction artistique (p.10) | The orange point leaves the page number and draws a line of light (the dégradé Éclipse, hot at its head). A circle, a square and a triangle of glass enter on the beats, take volume while the camera orbits, and are cut along compass circles into the six pieces of the monogram. FORME · VOLUME · ESPACE. |
| 5–8 | 03 · Logo (p.14 → 15) | The camera enters an architecture of glass panes. Seen from one viewpoint only, the six pieces — floating at different depths — line up into the monogram; the point burns orange behind it like an eclipse. Construction circles; the light reads A, then L, then L. The point crosses the glass: flash to the light page, the official monogram over its construction, AURA LUNA. |
| 9–12 | 04 · Couleurs (p.18 → 19) | Six glass capsules fill from the night to the halo; neutrals, the accent (the point), the proportions. The Cosmos capsule becomes the page: the two gradients in glass, Halo and Éclipse, a lens. |
| 13–14 | 05 · Typographie (p.22) | AURA LUNA in backlit glass; « Aa » in Montserrat, Light to Bold, one weight per beat. |
| 15–16 | Signature | The light opens onto the official lockup, which holds. |

Motion language: Premium (no bounce on type, heavy springs on glass), three curves (arrivals, exits, moves between
states), every chapter on a downbeat, one hero moment (the alignment, bar 7). Éclipse orange is only the point and
light (beam head, edges, the eclipse, the flash core) plus the charter's own samples — measured under 5 % on average.

## Build

```
timeline.json        every beat as [bar, beat]
lib.ts · layout.ts   tempo map, the page layout of both formats, what each page says and when
Page.tsx             the guidelines page frame
three/               the 3D glass: stage, materials, monogram pieces, the anamorphic placement, chapters 02–03
LogoOverlay.tsx      construction, the reading of the letters, the flash
pages/               the flat pages: logo, colours, typography, signature (drawn glass in glass2d.tsx)
make-cues.mjs        timeline.json → cues.json + swaps.json for the sound pass
tools/               orange-share.py (brand rule), blank-frames.py (lost 3D frames)
```

```bash
npm test                                             # tempo map, layout, monogram shapes, anamorphic alignment
CHROME="--browser-executable=/opt/pw-browsers/chromium --chrome-mode=chrome-for-testing"   # only in the cloud sandbox
npx remotion still AuraLunaCharteVertical out/f.png --frame=714 --gl=swangle $CHROME
npx remotion render AuraLunaCharteVertical out/aura-charte/silent-9x16.mp4 --gl=swangle --crf=16 --pixel-format=yuv420p --color-space=bt709 $CHROME
npx remotion render AuraLunaCharte out/aura-charte/silent-16x9.mp4 --gl=swangle --crf=16 --pixel-format=yuv420p --color-space=bt709 $CHROME
python3 src/aura-charte/tools/orange-share.py out/aura-charte/silent-9x16.mp4
python3 src/aura-charte/tools/blank-frames.py out/aura-charte/silent-9x16.mp4 0 13.9
node src/aura-charte/make-cues.mjs                   # then the sound pass with .sound-cache/132-hazy-after-hours.mp3
```
