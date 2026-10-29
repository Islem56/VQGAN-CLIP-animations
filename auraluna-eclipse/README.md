# AURA LUNA logo reveal — "ÉCLIPSE" (essay 2)

13.5 s · 1920×1080 · 60 fps · 80 BPM · one continuous shot. The brief is in [`PROMPT.md`](PROMPT.md).

```
auraluna-eclipse.html       the whole film in one self-contained file
src/film.template.html      the film: one camera, the key visual, the eclipse, the reveal (window.seek(t))
src/audio.js                the score (Web Audio API, OfflineAudioContext → WAV)
assets/                     Montserrat, the traced monogram and wordmark, the two hand layers
                            (all made by the tools of ../auraluna-instant and ../auraluna-showreel)
build.cjs · snap.cjs · render.cjs     build the HTML · screenshot moments · render the MP4
```

```bash
node build.cjs                      # rebuild the HTML after editing src/
node snap.cjs out/s 2.6 7.6 9.3     # look at any moment
node render.cjs                     # → out/auraluna-eclipse.mp4   (about 2 minutes on 4 cores)
```
