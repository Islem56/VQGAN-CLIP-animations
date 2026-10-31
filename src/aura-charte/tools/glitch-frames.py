# python3 glitch-frames.py film.mp4 — finds one-frame glitches: a frame that differs from both neighbours while the
# neighbours match each other (a renderer hiccup, like a ghost layer). Re-render those frames and patch them in.
import subprocess, sys
import numpy as np
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-vf", "scale=90:160", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 160, 90).astype(np.float32)
bad = [i for i in range(1, len(fr) - 1)
       if min(np.abs(fr[i] - fr[i - 1]).mean(), np.abs(fr[i] - fr[i + 1]).mean()) > 3 * np.abs(fr[i + 1] - fr[i - 1]).mean() + 1.0]
print(f"{len(fr)} frames; one-frame glitches: {bad if bad else 'none'}")
sys.exit(1 if bad else 0)
