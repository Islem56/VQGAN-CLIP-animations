# python3 blank-frames.py film.mp4 t0 t1 — no frame between t0 and t1 may be (near) black: a lost WebGL context or a
# 3D frame that never rendered shows up as one. Exit 1 on the first blank frame.
import subprocess, sys
import numpy as np
video, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t0), "-to", str(t1), "-i", video, "-vf", "scale=96:-2", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip().split(",")
fh = round(96 * int(probe[1]) / int(probe[0]) / 2) * 2
frames = np.frombuffer(raw, np.uint8).reshape(-1, fh, 96).astype(np.float32)
means = frames.mean(axis=(1, 2))
blank = np.where(means < 2)[0]
print(f"{len(means)} frames from {t0} s to {t1} s, darkest mean {means.min():.1f}/255" + (f", BLANK at {t0 + blank[0] / 60:.3f} s" if len(blank) else ""))
sys.exit(1 if len(blank) else 0)
