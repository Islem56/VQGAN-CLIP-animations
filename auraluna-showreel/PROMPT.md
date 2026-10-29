# AURA LUNA — 15-second motion design showreel (the brief, written for the brand)

**AURA LUNA · Creative Studio · Brand Identity · Visual Production** — a multidisciplinary creative studio where
imagination, design and technology meet: branding & visual identity, graphic design & advertising, photography &
videography, 3D & motion design, art direction, digital communication, audiovisual production. An elegant, minimalist
aesthetic with a contemporary, artistic and technological approach, built on the balance of geometry, light, form,
contrast and emotion, in the spirit of the Bauhaus. *Des visions créatives. Des univers singuliers.*

<direction>
A 15-second motion design showreel that proves world-class craft.
**Concept: "LUNAISON"** (one lunar cycle). The monogram is built from quarter discs and half discs, and those are
moon phases. The film is one cycle of them: the mark comes apart and its half disc and two quarters close into a full
moon; the moon wanes into a crescent and the camera dives into its light; the light reveals the words; a quarter disc
sweeps the frame and multiplies into a grid of phases that spell the monogram's own figures (arches, leaves, stars,
moons); the last moon lights up as a sphere; its light becomes the paper of a brand board; the board's ink becomes the
night in which the mark is rebuilt. The last frame is the first frame.
One typeface (Jost, variable: the geometric, Bauhaus-born sans), three colours (NUIT `#171A33`, LUNE `#F2EDE5`,
AURA `#E3A58F`) plus a deeper black for the moon's shadow side, one camera language ("push-through": every transition
is a shape that scales until it *is* the next scene's ground).
Show range: kinetic type, shape morphing, a 2D-to-3D moment, a data / UI moment, an end title.
Banned: particle bursts, glows, lens flares, camera shake, RGB split, crossfades, generic gradients, bouncy easing,
holds longer than half a second, anything that looks like a template.
</direction>

<structure>
96 BPM, something happens on every beat (24 beats, 2.5 s per bar).

| bar | s | what |
|---|---|---|
| 1 | 0–2.5 | **Hook.** The lock-up comes apart: the leaves leave the frame, the half disc and two quarters close into a moon (an aura ring opens). The moon wanes into a crescent, the ring tilts, the camera dives into the crescent's light |
| 2 | 2.5–5 | **Kinetic type** (lune). IDENTITÉ lit by a terminator · IMAGE through a camera shutter · MOTION flipped in letter by letter · UNIVERS pushes in from wide tracking; a quarter disc pivots on the corner and sweeps the frame |
| 3 | 5–7.5 | **Shape** (nuit). 48 quarter-disc tiles turn on every beat: arches (the monogram's half disc) → leaves (its side modules) → stars → moons. The outer moons collapse; the one in the middle stays |
| 4 | 7.5–10 | **2D → 3D, the drop.** The flat moon becomes a sphere: a light orbits it, shading posterised into three tones with exact band edges, an aura ring turns around it in 3D. The camera dives into its brightest point |
| 5 | 10–12.5 | **Data / UI** (lune). The brand board draws itself: the mark's construction grid and circles, its modules filling in; the palette swatches rise and their hex codes decode; "Aa" rides the weight axis 100 → 900 → 300 on a slider. The NUIT swatch floods the frame |
| 6 | 12.5–15 | **End title.** The six modules fly in and lock into the mark, AURA LUNA rises out of its baseline, the signature opens from its centre. **The final frame is the first frame**, so it loops |
</structure>

<build>
1. One HTML file at 1920×1080 (`auraluna-showreel.html`). Every style is computed from time inside `window.seek(t)`:
   no CSS animations, no timers, no state carried between frames.
2. The logo is vectorised from the source PNG (marching squares on its alpha, simplified to 0.05 px): the whole mark for
   the lock-up, and its six modules for the animation.
3. Springs (critically damped, no overshoot) and exponential easing written as functions of time. Blur follows speed and
   direction on fast moves (an SVG blur whose x / y deviations come from the velocity).
4. Soundtrack written with the Web Audio API (`OfflineAudioContext`): a felt kick, FM glass bells, a pad that changes
   chord every bar, wood clicks on the grid, a camera shutter on IMAGE, a riser into the drop, UI ticks and a slider
   glide on the board, a lock per module, a last bell. Rendered to WAV.
5. Playwright at 60 fps, 3 subframes per frame blended with ffmpeg `tmix` for motion blur, then the audio is muxed.
6. Before the full render, one frame per beat is rendered and reviewed (`node snap.cjs out/beats beats`).
</build>
