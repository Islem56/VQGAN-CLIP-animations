# DAR.COM — 15-second motion design showreel (the prompt, adapted to the brand)

**DAR.COM · Maison de communication** — a multidisciplinary creative concept where communication, design, commerce and
lifestyle meet: branding & graphic design, photography & video, digital communication, 3D & creative production,
a boutique and a café. *More than a service. A place where ideas take shape.* Modern, creative, design-driven; premium
yet approachable; clean compositions, thoughtful details, refined typography.

<direction>
A 15-second motion design showreel that proves you are a world-class motion designer.
**Concept: "THE DOOR"** — the period of DAR.COM is a circle; it is the door. The dot floods the frame, the flood becomes
ink, ink becomes type, type becomes shapes, shapes become a house (*dar* = house), the house's door opens onto an
interface, the interface stretches into a wall of type, the wall becomes a city of letters, and the city folds back into
the wordmark. Every shot is made out of the previous one: shapes, type and colour transform into the next scene instead
of cutting or fading.
One typeface (Montserrat, variable — the Google Font closest to the DAR.COM logo), a palette of three colours
(vermilion `#FF4A1C`, cobalt `#2236FF`, cream `#F1E9DB`) plus black and white, one camera language ("push-through":
every transition is a shape that scales until it *is* the next scene's ground).
Show range: kinetic type, shape morphing, a 2D-to-3D moment, a data / UI moment, and an end title.
Banned: particle bursts, glows, lens flares, camera shake, RGB split, crossfades, generic gradients, bouncy easing,
holds longer than half a second, anything that looks like a template.
</direction>

<structure>
120 BPM, something happens on every beat (30 beats, 2 s per bar).

| bar | s | what |
|---|---|---|
| 1 | 0–2 | **Hook.** DAR.COM → the letters leave, the dot turns vermilion and floods the frame → a black ring ripples, an ink dot floods black |
| 2 | 2–4 | **Kinetic type** (black). BRAND · SHOOT · POST · BUILD, each with its own move (mask rise with a hairline → black weight morph, split, zoom-through, drop); the cobalt **I** of BUILD stretches into the next ground |
| 3 | 4–6 | **Shape morph** (cobalt). Three discs → square / triangle / arch → cycled → they lock into a house elevation |
| 4 | 6–8 | **2D → 3D.** The elevation extrudes, the camera orbits, a wing rises, the camera pushes through the black door |
| 5 | 8–10 | **Data / UI** (black). The services card, toggles flip on the cursor's clicks, bars grow; the bars stretch into stripes |
| 6 | 10–12 | **The riser.** Six stripes of vertical type scroll in opposite directions, faster every beat; a vermilion disc pushes through |
| 7 | 12–14 | **The strongest moment.** DAR.COM stands up as extruded architecture, the camera whips around it |
| ½ | 14–15 | **End title.** The ground shrinks back into the dot, the letters flatten, the tagline slides in. **The final frame is the first frame**, so it loops |
</structure>

<build>
1. One HTML file at 1920×1080 (`darcom-showreel.html`). Every style is computed from time inside `window.seek(t)`: no CSS
   animations, no timers, no state carried between frames.
2. Springs (critically damped, no overshoot) and exponential easing written as functions of time. Blur follows speed and
   direction on fast moves (an SVG blur whose x / y deviations come from the velocity).
3. Soundtrack written with the Web Audio API (`OfflineAudioContext`): a kick on every beat, a whoosh and a hit on every
   scene change, a riser through bar 6 into the drop, UI ticks on the toggles, a stab per word, a rising "whoomp" per
   extruded letter, a closing bell. Rendered to WAV.
4. Playwright at 60 fps, 3 subframes per frame blended with ffmpeg `tmix` for motion blur, then the audio is muxed.
5. Before the full render, one frame per beat is rendered and reviewed (`node snap.cjs out/beats beats`).
</build>
