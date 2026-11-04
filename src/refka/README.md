# Dr Refka Abderrahim — Reel (mock-ups and example)

Client Reel built on the beats of a reference video: hook, B-roll window, 3D elements behind the speaker, keyword
punch-in, full-screen scene, end card. Until the doctor's own footage arrives, the speaker is a stand-in taken from the
reference (cut out frame by frame); those frames live in `public/refka/` and are never committed.

| Composition | Size | What |
|---|---|---|
| `RefkaApercus` | 1080×1920, 8 frames | six stills on the reference beats + two boards (3D elements, type and colours) |
| `RefkaExemple` | 1080×1920, 16.4 s | the example in motion, 33 beats at 121 BPM, every cut on the music |

## Files

```
theme.ts        placeholder palette (champagne gold), Cairo for Arabic, the handle, gold/white type styles
elements2d.tsx  subtitles, Instagram tag, B-roll window, hair-follicle illustration, end card
elements3d.tsx  orthographic 3D stage in pixel units; vitamins, softgels, capsule, molecule, DNA, minerals, PRP tubes
Apercus.tsx     the stills
Exemple.tsx     the example in motion
timeline.json   the cuts, in beats (picture and sound read the same file)
make-cues.mjs   timeline.json → cues.json + swaps.json for the sound pass
```

## Cut-out

Robust Video Matting (MobileNetV3, ONNX, from the project's GitHub releases) runs on the source frames with its
recurrent state warmed on the 40 frames before the span; plates get the burned-in Instagram tag inpainted; both are
upscaled to 1080×1920 (Lanczos + light unsharp). With the real footage: same script on the whole clip, at its native size.

## Commands

```bash
CHROME="--browser-executable=/opt/pw-browsers/chromium --chrome-mode=chrome-for-testing"   # only in the cloud sandbox
npx remotion render RefkaApercus out/refka/v2 --sequence --image-format=png --gl=swangle --timeout=240000 $CHROME
npx remotion render RefkaExemple out/refka/exemple-silent.mp4 --crf=16 --pixel-format=yuv420p --color-space=bt709 --gl=swangle --timeout=240000 $CHROME
node src/refka/make-cues.mjs
```

To replace: the doctor's text (the Arabic here is an example), her handle, her brand colours, the spelling of her name in
Arabic.
