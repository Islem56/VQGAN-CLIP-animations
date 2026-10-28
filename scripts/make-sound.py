#!/usr/bin/env python3
"""Synthesizes public/sound.wav, the sound track of the ChatIA video (numpy only, no samples).

It follows the film timings of src/Chat.tsx (the T_* constants and the speed x1.4) and reads the question
and the answer from src/content.ts, so the typing ticks and the word-by-word notes stay in sync with the text.
Run from the repo root after changing content.ts or the timings:  python3 scripts/make-sound.py
"""
import re, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
rng = np.random.default_rng(7)

# ─── Timings mirrored from src/Chat.tsx (film time T, in seconds) ───
T0, VITESSE, T_REP_FIN = 4.7, 1.4, 18.0
T_FRAPPE, T_FRAPPE_FIN = 5.2, 6.9
T_CLIC, T_ENVOI = 7.6, 7.7
T_PRECISION, T_OUTIL, T_PANNEAU = 8.6, 9.5, 9.9
T_CHOIX, T_RESUME = 12.0, 12.1
T_REP = 13.5
DUREE = (T_REP_FIN + 1.3 - T0) / VITESSE
vt = lambda T: (T - T0) / VITESSE  # film time -> video time (s)

src = (ROOT / "src" / "content.ts").read_text(encoding="utf-8")
question = re.search(r'question:\s*"((?:[^"\\]|\\.)*)"', src).group(1)
mots = sum(len(t.split(" ")) for t in re.findall(r'texte:\s*"((?:[^"\\]|\\.)*)"', src))

N = int(np.ceil(DUREE * SR))
L, R = np.zeros(N), np.zeros(N)


def put(sig, t, gain=1.0, pan=0.0):
    """Mix a mono signal at time t (s), equal-power panned (-1 left … +1 right)."""
    i = int(round(t * SR))
    if i >= N: return
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    L[i:i + len(sig)] += sig * gain * np.cos(a)
    R[i:i + len(sig)] += sig * gain * np.sin(a)


def tt(d): return np.arange(int(d * SR)) / SR


def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + np.exp(-(f - lo) / (lo * 0.15 + 1))) * (1 - 1 / (1 + np.exp(-(f - hi) / (hi * 0.15 + 1))))
    return np.fft.irfft(X * m, len(x))


# ─── Sound bricks ───
def key(space=False, soft=1.0):
    """A soft keyboard tick: a short filtered noise + a low wooden 'thock'."""
    t = tt(0.06)
    nz = bandpass(rng.standard_normal(len(t)), 1800, 6500) * np.exp(-t / 0.004)
    f = (130 if space else rng.uniform(170, 230))
    thock = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.014)
    return (0.55 * nz + 0.7 * thock) * soft


def click(down=True):
    """A mouse click: crisp noise + a small tonal 'tick'."""
    t = tt(0.05)
    nz = bandpass(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t / 0.0035)
    f = 1500 if down else 1900
    return (0.7 * nz + 0.5 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.008)) * (1.0 if down else 0.55)


def whoosh(dur, f0, f1, peak=0.5):
    """Air sweep: noise through a sweeping low-pass (f0 → f1), smooth in and out. peak = where the swell tops (0-1)."""
    n = int(dur * SR); x = rng.standard_normal(n)
    a = 1 - np.exp(-2 * np.pi * np.geomspace(f0, f1, n) / SR)
    y = np.empty(n); s1 = s2 = 0.0
    for i in range(n):
        s1 += a[i] * (x[i] - s1); s2 += a[i] * (s1 - s2); y[i] = s2
    u = np.linspace(0, 1, n)
    env = np.where(u < peak, np.sin(np.pi / 2 * u / peak), np.cos(np.pi / 2 * (u - peak) / (1 - peak))) ** 2
    y *= env
    return y / (np.abs(y).max() + 1e-9)


def bell(f, dur=1.6, bright=1.0):
    """A glassy chime: inharmonic partials with different decays, soft attack."""
    t = tt(dur)
    parts = [(1, 1.0, 1.1), (2.76, 0.35 * bright, 0.6), (5.4, 0.12 * bright, 0.3), (8.9, 0.05 * bright, 0.18)]
    y = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / d) for k, a, d in parts)
    return y * np.minimum(1, t / 0.006) / 1.3


def pluck(f):
    """A tiny marimba / kalimba note, one per word of the answer."""
    t = tt(0.5)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.13) + 0.3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.035)
    return y * np.minimum(1, t / 0.003)


def blip(f0, f1, dur=0.12):
    t = tt(dur); f = np.geomspace(f0, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (dur * 0.35)) * np.minimum(1, t / 0.004)


# D major pentatonic over two octaves (D5 E5 F#5 A5 B5 D6 E6 F#6 A6)
PENTA = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66, 1318.51, 1479.98, 1760.0]

# ─── Ambient bed: a slow, low D major pad (D2 A2 F#3 A3 E4), very quiet, in and out ───
t = np.arange(N) / SR
pad = np.zeros(N)
for f, a in [(73.42, 1.0), (110.0, 0.8), (185.0, 0.5), (220.0, 0.45), (329.63, 0.3)]:
    for det in (-0.6, 0.0, 0.7):
        pad += a * np.sin(2 * np.pi * (f + det) * t + rng.uniform(0, 6.28)) * (0.8 + 0.2 * np.sin(2 * np.pi * rng.uniform(0.08, 0.2) * t + rng.uniform(0, 6.28)))
pad = bandpass(pad, 60, 1200) / np.abs(pad).max()
pad *= np.minimum(1, t / 1.4) * np.minimum(1, (DUREE - t) / 1.6)
L += pad * 0.04; R += pad * 0.04

# ─── 1. The question is typed, key by key ───
for c, ch in enumerate(question, start=1):
    T = T_FRAPPE + (c - 0.5) / len(question) * (T_FRAPPE_FIN - T_FRAPPE)
    put(key(space=(ch == " "), soft=rng.uniform(0.75, 1.0)), vt(T), 0.30, rng.uniform(-0.15, 0.15))

# ─── 2. The send button appears, the mouse glides to it, clicks, the question flies up ───
put(blip(700, 1050, 0.1), vt(T_FRAPPE + 0.12), 0.07, 0.3)
put(whoosh(0.55, 500, 2600, 0.6), vt(6.75), 0.05, 0.2)
put(click(True), vt(T_CLIC), 0.34)
put(click(False), vt(T_CLIC) + 0.075, 0.22)
put(whoosh(0.55, 350, 3800, 0.45), vt(T_ENVOI), 0.17, 0.0)
put(blip(520, 780, 0.16), vt(T_ENVOI), 0.10)
put(bell(880.0, 1.2, 0.6), vt(T_ENVOI) + 0.05, 0.06, 0.2)

# ─── 3. The assistant thinks, writes the precision line, a tool pill, the choice panel rises ───
put(bell(1174.66, 1.4, 0.7), vt(8.1), 0.045, -0.2)
put(whoosh(0.5, 2500, 5500, 0.5), vt(T_PRECISION), 0.045, -0.3)
put(blip(880, 1320, 0.12), vt(T_OUTIL), 0.07, 0.25)
put(whoosh(0.5, 280, 2400, 0.55), vt(T_PANNEAU) - 0.04, 0.15, 0.0)
put(bell(659.25, 1.8), vt(T_PANNEAU) + 0.28, 0.12, -0.1)
put(bell(987.77, 1.8), vt(T_PANNEAU) + 0.40, 0.09, 0.15)

# ─── 4. Hover, click on the choice, the panel folds into the summary ───
put(key(soft=0.5), vt(11.4), 0.18, 0.1)
put(click(True), vt(T_CHOIX), 0.34)
put(click(False), vt(T_CHOIX) + 0.075, 0.22)
put(whoosh(0.5, 2600, 300, 0.4), vt(T_RESUME), 0.14, 0.0)
put(bell(880.0, 1.4), vt(T_RESUME) + 0.18, 0.10, 0.1)

# ─── 5. The answer, word by word: one soft note per word, then a closing chime ───
cur = 3
for i in range(mots):
    cur = int(np.clip(cur + rng.choice([-2, -1, 1, 1, 2]), 0, len(PENTA) - 1))
    T = T_REP + (T_REP_FIN - T_REP) * (i + 0.3) / (mots + 1)
    put(pluck(PENTA[cur]), vt(T), rng.uniform(0.050, 0.075), rng.uniform(-0.4, 0.4))
fin = vt(T_REP_FIN)
for f, dt, g in [(587.33, 0.0, 0.11), (880.0, 0.05, 0.09), (1174.66, 0.10, 0.08), (1479.98, 0.15, 0.06)]:
    put(bell(f, 2.0), fin + dt, g, 0.0)

# ─── Space: a light reverb on everything, then master ───
def impulse():
    n = int(1.1 * SR); tt_ = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-tt_ / 0.30)
    F = np.fft.rfft(ir); f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(F / (1 + (f / 4500) ** 2), n)

def wet(x):
    ir = impulse(); m = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)] / 18

L, R = L + 0.30 * wet(L), R + 0.30 * wet(R)
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak * 0.85, R / peak * 0.85
fade = np.minimum(1, (DUREE - t) / 0.5) * np.minimum(1, t / 0.01)
L, R = L * fade, R * fade

out = ROOT / "public" / "sound.wav"
out.parent.mkdir(exist_ok=True)
pcm = (np.stack([L, R], axis=1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"{out.relative_to(ROOT)}: {DUREE:.2f}s, {len(question)} keys, {mots} words")
