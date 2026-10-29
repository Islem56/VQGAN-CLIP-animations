# AURA LUNA showreel — "LUNAISON"

15 s · 1920×1080 · 60 fps · 96 BPM. The brief is in [`PROMPT.md`](PROMPT.md).

```
auraluna-showreel.html      the whole film in one self-contained file (font, outlines, monogram, soundtrack code inlined)
src/showreel.template.html  the film: window.seek(t) draws any moment; 6 scenes, exact moon-phase and sphere-shading geometry
src/audio.js                the soundtrack (Web Audio API, OfflineAudioContext → WAV)
assets/monogram.png         the logo as supplied (white on transparent, 640 × 300)
assets/monogram.json        …vectorised: the whole mark + its six modules        (tools/trace-logo.py)
assets/glyphs.json          Jost → flattened outlines at wght 100 / 500 / 300     (tools/make-glyphs.py)
tools/sheet.py              contact sheets (to review a film beat by beat)
build.cjs                   template + font + outlines + monogram + audio → auraluna-showreel.html
snap.cjs                    screenshots of moments:   node snap.cjs out/beats beats     (one frame per beat)
render.cjs                  audio + 60 fps × 3 subframes + ffmpeg tmix + mux:   node render.cjs
```

```bash
node build.cjs                      # rebuild the HTML after editing src/
node snap.cjs out/s 2.6 7.9 11.4    # look at any moment
node render.cjs                     # → out/auraluna-showreel.mp4   (about 2 minutes on 4 cores)
```

Needs Node 20+ with Playwright (Chromium) and ffmpeg. The two Python tools need `fonttools`, `brotli`, `numpy`, `Pillow`.

The palette lives in one place (`PAL` at the top of the template): NUIT, LUNE, AURA and the moon's shadow side (OMBRE).
For a sharper logo, put an SVG export of the mark in `assets/` and trace from a large PNG of it (≥ 2000 px):
the current trace comes from the 640 × 300 PNG, which is plenty at the size the mark is shown.
