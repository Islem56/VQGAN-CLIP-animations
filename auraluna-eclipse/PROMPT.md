# AURA LUNA — "ÉCLIPSE" · 13.5-second cinematic logo reveal (essay 2)

The second essay answers the first ("L'Instant", a brand film that shows the whole system) with the opposite choice:
**one continuous shot, one idea, light doing all the work.** Built only from the brand guidelines: the key visual
(the human hand, the digital hand, the violet spark), the light effects (Halo; Éclipse = Cosmos disc, Halo ring,
diffuse halo), the palette (Cosmos → Halo, Brume, Ardoise, Éclipse as a signal), Montserrat and the Asik wordmark.

<direction>
**Concept: « L'instant où une idée devient image », filmed as an eclipse.** Darkness, three heartbeats of violet
light; in extreme close-up and out of focus, two fingertips come in; the spark ignites and its light runs out along the
horizon. The camera pulls back to the whole key visual; the concept line types itself. A Cosmos moon glides along the
light, behind the digital fingers, and eclipses the spark: the corona, totality, the diamond ring; the camera dives into
the eclipse. The corona breaks free and travels out of the frame as a ring of light; the moon opens into the monogram
(its half disc and two quarters ARE the moon; the two leaves fly in), backlit. Light sweeps the mark from shadow to the
brand's violet gradient to white, then reveals AURA LUNA, the descriptor (Éclipse dots) and the signature.
Restraint: no lightning, no lens flares, no particles, no shake, no crossfades; the cuts are invisible (the corona that
leaves the moon is the same gradient, the same size, at the same frame).
</direction>

<structure>
80 BPM (0.75 s per beat), 18 beats.

| beats | s | what |
|---|---|---|
| 0–2 | 0–2.25 | **The dark.** Three heartbeats of light; macro, depth of field: the fingertips come in |
| 3 | 2.25 | **The spark** ignites; its streak runs out to the frame's edges |
| 4–7 | 3.0–6.0 | **The pull-back** to the whole key visual; « L'INSTANT OÙ UNE IDÉE DEVIENT IMAGE. » types itself |
| 8–11 | 6.0–9.0 | **The eclipse.** The moon glides in behind the fingers; corona; totality (7.5); diamond ring (8.25); the camera dives in |
| 12–13 | 9.0–10.5 | **The ring of light** leaves; the moon opens into the mark, backlit; violet light (9.75) |
| 14–17 | 10.5–13.5 | **White light**: the mark, AURA LUNA (a band of light), the descriptor (11.25), the signature (12.0); the halo breathes |
</structure>

<build>
Same pipeline as the other films: one HTML file driven by `window.seek(t)`, springs and exponential easing, velocity
blur (plus depth of field on the hands), a Web Audio score rendered to WAV, Playwright 60 fps × 3 subframes + ffmpeg
`tmix`, audio muxed.
</build>
