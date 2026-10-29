# AURA LUNA brand film — "L'INSTANT"

17.5 s · 1920×1080 · 60 fps · 96 BPM. The brief is in [`PROMPT.md`](PROMPT.md).

```
auraluna-instant.html       the whole film in one self-contained file (font, outlines, logo, hands, soundtrack code inlined)
src/film.template.html      the film: window.seek(t) draws any moment; 7 chapters + the lunar calendar
src/audio.js                the soundtrack (Web Audio API, OfflineAudioContext → WAV)
assets/logo-lockup.jpg      the official lock-up (source of the wordmark and of the lock-up's proportions)
assets/wordmark.json        AURA LUNA (Asik), traced from it                    (tools/trace-wordmark.py)
assets/monogram.json        the mark and its six modules (from the showreel)    (../auraluna-showreel/tools/trace-logo.py)
assets/hands-source.png     a frame of the key visual
assets/hand-human.jpg …     the two hands cut out of it, on black (screen)       (tools/isolate-hands.py)
assets/glyphs.json          Montserrat → outlines at wght 200 / 800              (tools/make-glyphs.py)
build.cjs · snap.cjs · render.cjs     build the HTML · screenshot moments · render the MP4
```

```bash
node build.cjs                       # rebuild the HTML after editing src/
node snap.cjs out/s 2.9 6.6 11.6     # look at any moment
node render.cjs                      # → out/auraluna-instant.mp4   (about 2.5 minutes on 4 cores)
```

Needs Node 20+ with Playwright (Chromium) and ffmpeg; the Python tools need `fonttools`, `brotli`, `numpy`, `Pillow`.

Asik itself is not installed: only the wordmark uses it, traced from the lock-up. With the font file (OTF/TTF) in
`assets/`, the kinetic titles could be set in Asik too (the guidelines allow it for impact titles).
