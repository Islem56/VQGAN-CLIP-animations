# AURA LUNA — "L'INSTANT" · 17.5-second brand film (the brief, written from the brand guidelines)

**AURA LUNA · Digital · Design · Production** — *Where human imagination meets digital creation.*
Concept (guidelines, 02 · ADN & direction artistique): **« L'instant où une idée devient image. »** A human hand, a
digital hand and, between them, a violet spark: Aura Luna stands exactly there, in the space between intuition and
technique.

<direction>
A brand film that proves world-class craft and uses nothing that is not in the guidelines.
**Story.** The film opens on the lock-up, which falls back into the spark between the two hands of the key visual: the
image returns to the idea. The spark breathes, the hands come in, the concept line writes itself one beat at a time,
an Éclipse ring opens, the fingers close in on « IMAGE » and the spark floods the frame. Then the idea becomes images:
the three crafts (DIGITAL in steps, DESIGN drawn then filled, PRODUCTION through a viewfinder with REC and timecode);
a grid of moon phases that spells the mark's own modules, coloured from Nuit to Halo; the last moon lit as a sphere in
the six violets, through an eclipse to a full moon; the guidelines' colour page building itself; and the Cosmos swatch
becoming the night in which the mark is rebuilt. The last frame is the first frame.
**Brand system.** Palette: Cosmos `#02060E`, Nuit `#1F0533`, Orbite `#3C0557`, Aura `#59047C`, Luna `#7604A0`,
Halo `#9303C5`; neutrals Blanc, Lunaire `#F4F1F7`, Brume `#E2D3EC`, Ardoise `#6E6A75`; Éclipse `#D53207` only as a
signal (< 5 %: the descriptor's dots, REC, the page markers). Light: Halo (radial, 70 % → 0 %), Éclipse (Cosmos disc,
Halo ring, diffuse halo). Type: the Asik wordmark (traced from the official lock-up), Montserrat for everything else.
A lunar calendar runs in the corners like the guidelines' footers (Nouvelle lune → Lune gibbeuse décroissante).
**Restraint.** No lightning, no lens flares, no particle bursts, no camera shake, no crossfades, no bouncy easing:
light is a source (« le violet ne se pose pas : il éclaire »), every transition is a shape that becomes the next ground.
</direction>

<structure>
96 BPM, something happens on every beat (28 beats, 2.5 s per bar).

| bar | s | what |
|---|---|---|
| 1 | 0–2.5 | **01 · Concept.** The lock-up falls into the spark; the spark ignites; the human hand comes in from the left, the digital hand from the right |
| 2 | 2.5–5 | **02 · L'instant.** « L'INSTANT / OÙ UNE IDÉE / DEVIENT / IMAGE. », one group per beat; an Éclipse ring opens; the fingers close in; the spark floods the frame (Luna) |
| 3 | 5–7.5 | **03 · Savoir-faire.** DIGITAL (stepped reveal, stepped weight) · DESIGN (outlines drawn, then filled and weighted) · PRODUCTION (viewfinder, REC, timecode) · the descriptor line; an Éclipse closes over the frame |
| 4 | 7.5–10 | **04 · Formes.** 48 quarter-disc tiles, Nuit at the edges to Halo at the centre, turn on every beat: arches → leaves → stars → moons; the outer moons collapse |
| 5 | 10–12.5 | **05 · Lumière (the drop).** The Halo moon becomes a sphere shaded in the six violets with exact band edges, a 3D ring around it; the light orbits, goes behind (the Éclipse), comes back (full moon); the camera dives into the light |
| 6 | 12.5–15 | **06 · Couleurs.** The guidelines page « De la nuit au halo » builds itself: header, title, six pills rising, hex codes decoding, the proportions bar; the Cosmos pill floods the frame |
| 7 | 15–17.5 | **07 · Signature.** The six modules fly in and lock, the Halo blooms, AURA LUNA rises, the descriptor and the signature arrive. **The final frame is the first frame** |
</structure>

<build>
1. One HTML file at 1920×1080 (`auraluna-instant.html`); every style is computed from time inside `window.seek(t)`.
2. Brand assets are taken from the brand's own files: the hands are cut out of the key visual (two layers composited
   with `screen`), the wordmark and the monogram are vectorised from the logo files.
3. Springs (critically damped) and exponential easing as functions of time; blur follows speed and direction.
4. Soundtrack written with the Web Audio API (`OfflineAudioContext`), rendered to WAV.
5. Playwright at 60 fps, 3 subframes per frame blended with ffmpeg `tmix`, audio muxed.
6. One frame per beat is rendered and reviewed before the full render (`node snap.cjs out/beats beats`).
</build>
