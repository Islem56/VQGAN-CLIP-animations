# AURA LUNA — "LE POINT"

15 s · 60 fps · 120 BPM · loops (the last frame is the first frame). Two compositions of the same film, built from one
source: **16:9** (1920×1080) and **9:16** (1080×1920, recomposed for Reels rather than cropped: a phone-sized settings
row, the callout above the graph, a vertical pill, a stacked end card). Every position comes from the layout table `LY`.

One orange dot (Éclipse, the brand's signal) connects every scene:

| beat | s | what |
|---|---|---|
| 1–2 | 0–1 | The settings row « Limit Imagination », its toggle on (orange); the cursor glides in |
| 3 | 1.0 | The click: the toggle turns off, its orange drains into the dot |
| 4–5 | 1.5–2.36 | « Limit » falls; « Imagination » bends into the hero word; the dot lands on its i |
| 7–10 | 3.0–4.75 | The dot jumps onto a graph and draws a spring (peak on beat 9) that settles on « 6 pôles d'expertise » |
| 12–15 | 5.5–7.5 | It shoots along the target line, lights the frame in Halo violet, seeds a Nuit square that turns, stretches into a pill and becomes the night |
| 17–21 | 8.0–10.25 | The six poles drop into orbit around it, one per beat |
| 22–23 | 10.5–11.5 | The ring opens into a halftone field that grows into the cream of the end card |
| 24–27 | 11.5–13.0 | The gradient monogram, AURA LUNA (Asik), « Studio de production visuelle », the signature — the dot is its full stop |
| 28–30 | 13.5–15 | The return through the halftone, the graph and back into the toggle |

Brand rules kept: Éclipse orange is only ever the dot (never a fill), the frame is lit in Halo violet instead;
Lunaire canvas, Nuit grounds, Montserrat, the Asik wordmark and gradient monogram traced from the official logo.
The spring is closed-form: the same function moves the dot, draws the curve and sets the pitch of its tone.

```
auraluna-point.html         the 16:9 film in one self-contained file
auraluna-point-vertical.html  the 9:16 film
src/film.template.html      the film: window.seek(t)
src/audio.js                the score (Web Audio API, OfflineAudioContext → WAV)
assets/glyphs.json          « Limit Imagination » in Montserrat, wght 600 → 800   (tools/make-glyphs.py)
assets/monogram.json · wordmark.json · logo-lockup.jpg     the logo (traced in ../auraluna-showreel, ../auraluna-instant)
out/stills/                 the four stills approved before the render
```

```bash
node build.cjs && node snap.cjs out/beats beats     # one frame per beat   (FORMAT=v node snap.cjs … for 9:16)
node render.cjs                                     # → out/auraluna-point.mp4
node render.cjs --format v --out out/auraluna-point-vertical.mp4
```
