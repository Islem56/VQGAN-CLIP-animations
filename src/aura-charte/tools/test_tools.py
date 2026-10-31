# python3 src/aura-charte/tools/test_tools.py — checks the two video checks on synthetic clips
import os, subprocess, sys, tempfile
here = os.path.dirname(os.path.abspath(__file__))
def clip(path, colour, seconds=2):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=c={colour}:s=320x180:r=60:d={seconds}", "-pix_fmt", "yuv420p", path], check=True)
def code(script, *args): return subprocess.run([sys.executable, os.path.join(here, script), *args], capture_output=True, text=True).returncode
with tempfile.TemporaryDirectory() as d:
    orange, night, black = (os.path.join(d, n) for n in ("orange.mp4", "night.mp4", "black.mp4"))
    clip(orange, "0xD53207"); clip(night, "0x1F0533"); clip(black, "0x000000")
    assert code("orange-share.py", orange) == 1, "a full orange clip must fail the orange budget"
    assert code("orange-share.py", night) == 0, "a Nuit clip has no orange"
    assert code("blank-frames.py", black, "0", "1.5") == 1, "a black clip must fail"
    assert code("blank-frames.py", night, "0", "1.5") == 0, "a Nuit clip is not blank"
print("tools: 4/4 checks pass")
