# DAR.COM showreel — "THE DOOR"

15 s · 1920×1080 · 60 fps · 120 BPM. The brief is in [`PROMPT.md`](PROMPT.md).

```
darcom-showreel.html        the whole film in one self-contained file (font, outlines, soundtrack code inlined)
src/showreel.template.html  the film: window.seek(t) draws any moment, a tiny 3D engine, 8 scenes
src/audio.js                the soundtrack (Web Audio API, OfflineAudioContext → WAV)
tools/make-glyphs.py        Montserrat → flattened outlines (3 weights), so type can be morphed, masked and extruded
tools/sheet.py              contact sheets (to review a film beat by beat)
build.cjs                   template + font + outlines + audio → darcom-showreel.html
snap.cjs                    screenshots of moments:   node snap.cjs out/beats beats     (one frame per beat)
render.cjs                  audio + 60 fps × 3 subframes + ffmpeg tmix + mux:   node render.cjs
```

## Palettes

Four palettes, picked with the URL hash (`darcom-showreel.html#yaqout`) or `--theme` when rendering: **sunshine**, **sunnynight**, **dune**, **yaqout**.
They are tonal (rust / brown / cream / black), so each scene has a role table (which colour is the ground, the arches, the stripes…)
chosen for contrast: see `THEMES` in `src/showreel.template.html`.

```bash
node build.cjs            # rebuild the HTML after editing src/
node snap.cjs out/s 2.5 7.8 12.3      # look at any moment
node render.cjs --theme yaqout           # → out/darcom-showreel.mp4   (about 2 minutes on 4 cores)
THEME=dune node snap.cjs out/s 2.5 7.8    # look at any moment in another palette
```

Needs Node 20+ with Playwright (Chromium) and ffmpeg. `python3 tools/make-glyphs.py assets/montserrat-variable.woff2 > assets/glyphs.json`
needs `fonttools` and `brotli`.

## The logo

The wordmark is set in Montserrat (the Google Font closest to the DAR.COM logo's geometric sans) and the end title uses the
brand's own tagline, *MAISON DE COMMUNICATION*. The line-art emblem of the logo is **not** in the film yet: the logo only
reached the session as an inline preview, with no file to read. To add it, put the vector (SVG) in `assets/` and it can
replace the typeset wordmark in the hook and the end title (frame 0 = last frame stays true).
