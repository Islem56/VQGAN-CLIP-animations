# python3 orange-share.py film.mp4 — the brand rule, measured: Éclipse orange stays under 5 % of the image on average
# and under 20 % in any frame. Samples every 6th frame at quarter resolution. Exit 1 when the rule is broken.
import subprocess, sys
import numpy as np
video = sys.argv[1]
w, h = (int(v) for v in subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip().split(","))
w, h = w // 4, h // 4
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"select='not(mod(n\\,6))',scale={w}:{h}", "-vsync", "vfr", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3).astype(np.float32) / 255
mx, mn = frames.max(-1), frames.min(-1); d = np.maximum(mx - mn, 1e-6); r, g, b = frames[..., 0], frames[..., 1], frames[..., 2]
hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
orange = (hue >= 5) & (hue <= 25) & ((mx - mn) / np.maximum(mx, 1e-6) > 0.6) & (mx > 0.45)
share = orange.mean(axis=(1, 2))
worst = int(share.argmax()) * 6
print(f"orange share: mean {share.mean() * 100:.2f} %, max {share.max() * 100:.2f} % (frame {worst}, {worst / 60:.2f} s) over {len(share)} sampled frames")
sys.exit(1 if share.mean() >= 0.05 or share.max() >= 0.20 else 0)
