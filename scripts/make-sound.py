#!/usr/bin/env python3
"""Synthesizes public/sound.wav, the sound track of the ChatIA video (numpy only, no samples).

Two sound styles, chosen by `effet` in src/content.ts (it also picks the word animation in src/Chat.tsx):
  "impact" – punchy, made to grab attention in a feed: a sub boom on the first frame, crisp rising keys,
a riser into every key moment, "AI thinking" bleeps, a four-on-the-floor pulse + hats that build during the
answer, one bright note per word (rising scale), an accent on every bold word, and a big impact + chime at the end.

It follows the film timings of src/Chat.tsx (the T_* constants, ANIM and the speed x1.4) and reads the question and
  "cine"   – cinematic and elegant: a soft swell + bells on the first frame, a heartbeat, a swish per word, a marker
             sweep on every bold word, and a long impact finished by a double "message sent" ding.
It reads the question and the answer (incl. which words are bold) from src/content.ts, so everything stays in sync with the text.
Run from the repo root after changing content.ts or the timings:  python3 scripts/make-sound.py
"""
import re, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
rng = np.random.default_rng(11)

# ─── Timings mirrored from src/Chat.tsx (film time T, in seconds) ───
T0, VITESSE, T_REP_FIN = 4.7, 1.4, 18.0
T_FRAPPE, T_FRAPPE_FIN = 5.2, 6.9
T_CLIC, T_ENVOI = 7.6, 7.7
T_PRECISION, T_OUTIL, T_PANNEAU = 8.6, 9.5, 9.9
T_CHOIX, T_RESUME = 12.0, 12.1
T_REP = 13.5
ANIM = 4  # same as ANIM in src/Chat.tsx (a word takes ANIM "word slots" to settle)
DUREE = (T_REP_FIN + 1.3 - T0) / VITESSE
vt = lambda T: (T - T0) / VITESSE  # film time -> video time (s)

src = (ROOT / "src" / "content.ts").read_text(encoding="utf-8")
question = re.search(r'question:\s*"((?:[^"\\]|\\.)*)"', src).group(1)
CINE = re.search(r'effet:\s*"(\w+)",', src).group(1) == "cine"  # the value (with a comma), not the type
bold = []  # one flag per word of the answer, same rule as Reponse in Chat.tsx
gras = False
for texte in re.findall(r'texte:\s*"((?:[^"\\]|\\.)*)"', src):
    for m in texte.split(" "):
        ouvre, ferme = m.startswith("**"), re.sub(r"[.,:;!?]+$", "", m).endswith("**")
        if ouvre: gras = True
        bold.append(gras)
        if ferme: gras = False
W = len(bold)
# the instant (video time) the i-th word is at fraction f of its pop-in
t_mot = lambda i, f=0.2: vt(T_REP + (T_REP_FIN - T_REP) * (i + f * ANIM) / (W + ANIM))
T_DERNIER = vt(T_REP + (T_REP_FIN - T_REP) * (W - 1 + ANIM) / (W + ANIM))  # the last word has landed

N = int(np.ceil(DUREE * SR))
L, R = np.zeros(N), np.zeros(N)
tt = lambda d: np.arange(int(d * SR)) / SR


def put(sig, t, gain=1.0, pan=0.0):
    """Mix a mono signal at time t (s), equal-power panned (-1 left … +1 right)."""
    i = int(round(t * SR))
    if i < 0: sig, i = sig[-i:], 0
    if i >= N: return
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    L[i:i + len(sig)] += sig * gain * np.cos(a)
    R[i:i + len(sig)] += sig * gain * np.sin(a)


def band(x, lo, hi):
    """Smooth FFT band-pass (lo = 0 → low-pass, hi = 20000 → high-pass)."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + np.exp(-(f - lo) / (lo * 0.15 + 1))) * (1 - 1 / (1 + np.exp(-(f - hi) / (hi * 0.15 + 1))))
    return np.fft.irfft(X * m, len(x))


# ─── Sound bricks ───
def key(space=False, soft=1.0, pitch=1.0):
    """A crisp keyboard tick: bright noise + a wooden 'thock' + a tiny high click."""
    t = tt(0.06)
    nz = band(rng.standard_normal(len(t)), 2200, 8500) * np.exp(-t / 0.0035)
    thock = np.sin(2 * np.pi * (130 if space else rng.uniform(190, 250)) * pitch * t) * np.exp(-t / 0.013)
    hi = np.sin(2 * np.pi * 3300 * pitch * t) * np.exp(-t / 0.0018)
    return (0.7 * nz + 0.7 * thock + 0.3 * hi) * soft


def click(down=True):
    t = tt(0.05)
    nz = band(rng.standard_normal(len(t)), 2500, 9500) * np.exp(-t / 0.0035)
    return (0.8 * nz + 0.5 * np.sin(2 * np.pi * (1500 if down else 1900) * t) * np.exp(-t / 0.008)) * (1.0 if down else 0.5)


def thump(f0=140, f1=50, dur=0.32):
    """A kick-like punch: a sine that drops in pitch, with a little drive so it also reads on phone speakers."""
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t / 0.035)
    y = np.tanh(1.8 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 0.10)
    return y * np.minimum(1, t / 0.002)


def boom(dur=1.5):
    """A deep cinematic impact: sub drop + body + a dark noise tail."""
    t = tt(dur)
    f = 34 + 56 * np.exp(-t / 0.12)
    sub = np.tanh(2.0 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 0.55)
    body = np.sin(2 * np.pi * 150 * t) * np.exp(-t / 0.09) * 0.5
    tail = band(rng.standard_normal(len(t)), 0, 700) * np.exp(-t / 0.35) * 0.5
    return (sub + body + tail) * np.minimum(1, t / 0.002)


def crack(dur=0.16):
    t = tt(dur)
    return band(rng.standard_normal(len(t)), 1500, 12000) * np.exp(-t / 0.03)


def sweep(dur, f0, f1, peak=0.5):
    """Air sweep: noise through a sweeping low-pass (f0 → f1), swell topping at `peak` (0-1)."""
    n = int(dur * SR); x = rng.standard_normal(n)
    a = 1 - np.exp(-2 * np.pi * np.geomspace(f0, f1, n) / SR)
    y = np.empty(n); s1 = s2 = 0.0
    for i in range(n):
        s1 += a[i] * (x[i] - s1); s2 += a[i] * (s1 - s2); y[i] = s2
    u = np.linspace(0, 1, n)
    env = np.where(u < peak, np.sin(np.pi / 2 * u / peak), np.cos(np.pi / 2 * (u - peak) / (1 - peak))) ** 2
    y *= env
    return y / (np.abs(y).max() + 1e-9)


def riser(dur, f0=250, f1=9000, tone=True):
    """Tension: a noise swell that brightens and swells to the very end, plus a rising tone with a speeding tremolo."""
    n = int(dur * SR); u = np.linspace(0, 1, n)
    nz = sweep(dur, f0, f1, 0.985)
    nz *= u ** 1.6
    y = nz
    if tone:
        f = np.geomspace(220, 1760, n)
        trem = 0.7 + 0.3 * np.sin(2 * np.pi * np.cumsum(6 + 26 * u) / SR)
        y = y + 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * u ** 2 * trem
    y *= np.minimum(1, (n - np.arange(n)) / (0.006 * SR))
    return y / (np.abs(y).max() + 1e-9)


def zip_up(dur=0.3, f0=350, f1=3200):
    t = tt(dur); f = np.geomspace(f0, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 2


def bell(f, dur=1.8, bright=1.0):
    """A glassy chime: inharmonic partials with different decays, soft attack."""
    t = tt(dur)
    parts = [(1, 1.0, 1.1), (2.76, 0.35 * bright, 0.6), (5.4, 0.14 * bright, 0.3), (8.9, 0.06 * bright, 0.18)]
    y = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / d) for k, a, d in parts)
    return y * np.minimum(1, t / 0.005) / 1.3


def pluck(f):
    """A bright kalimba / marimba note, one per word."""
    t = tt(0.45)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.12) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.03) + 0.15 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.08)
    return y * np.minimum(1, t / 0.002)


def bleep(f, dur=0.09):
    """An 'AI thinking' bleep: a short bright tone."""
    t = tt(dur)
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return y * np.exp(-t / (dur * 0.3)) * np.minimum(1, t / 0.003)


def slide(f0, f1, dur=0.12):
    t = tt(dur); f = np.geomspace(f0, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (dur * 0.4)) * np.minimum(1, t / 0.004)


def hat(open_=False):
    t = tt(0.09 if open_ else 0.03)
    return band(rng.standard_normal(len(t)), 7000, 16000) * np.exp(-t / (0.035 if open_ else 0.009))


# D major pentatonic over three octaves (D5 … A7): the answer climbs it, word after word
PENTA = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66, 1318.51, 1479.98, 1760.0, 1975.5, 2349.3, 2959.96, 3520.0]

# ─── Bed: a low D major pad that pumps on every beat (120 bpm), and opens up (brighter) as the answer comes ───
t = np.arange(N) / SR
pad = np.zeros(N)
for f, a in [(73.42, 1.0), (110.0, 0.8), (185.0, 0.5), (220.0, 0.45), (329.63, 0.3)]:
    for det in (-0.6, 0.0, 0.7):
        pad += a * np.sin(2 * np.pi * (f + det) * t + rng.uniform(0, 6.28)) * (0.8 + 0.2 * np.sin(2 * np.pi * rng.uniform(0.08, 0.2) * t + rng.uniform(0, 6.28)))
pad = band(pad, 60, 1200) / np.abs(pad).max()
glow = np.zeros(N)
for f, a in [(293.66, 1.0), (440.0, 0.7), (739.99, 0.5), (1174.66, 0.3)]:
    glow += a * np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * 5.5 * t))
glow = band(glow, 250, 3000) / np.abs(glow).max() * np.clip((t - 5.0) / 4.2, 0, 1) ** 1.5
pump = 1 - (0.3 if CINE else 0.6) * np.exp(-np.mod(t, 1.0 if CINE else 0.5) / (0.25 if CINE else 0.13))
env = np.minimum(1, t / 0.8) * np.minimum(1, (DUREE - t) / 1.2)
L += (pad * 0.07 + glow * 0.035) * pump * env
R += (pad * 0.07 + glow * 0.035) * pump * env

# ─── 0. The hook: a deep impact on the very first frame ───
if CINE:
    put(boom(1.5), 0.0, 0.55)
    put(sweep(0.9, 6000, 250, 0.1), 0.0, 0.16)
    put(bell(1174.66, 2.6, 0.8), 0.03, 0.10, -0.2)
    put(bell(880.0, 2.6, 0.8), 0.10, 0.08, 0.2)
else:
    put(boom(1.5), 0.0, 0.85)
    put(crack(0.18), 0.0, 0.30)
    put(sweep(0.7, 7000, 300, 0.08), 0.0, 0.20)

# ─── 1. The question is typed: crisp keys that climb in pitch, then a riser into the click ───
for c, ch in enumerate(question, start=1):
    T = T_FRAPPE + (c - 0.5) / len(question) * (T_FRAPPE_FIN - T_FRAPPE)
    put(key(space=(ch == " "), soft=rng.uniform(0.8, 1.0), pitch=1 + (0 if CINE else 0.45) * c / len(question)), vt(T), 0.34 if CINE else 0.42, rng.uniform(-0.2, 0.2))
put(slide(700, 1100, 0.1), vt(T_FRAPPE + 0.12), 0.10, 0.3)
put(riser(0.5, 300, 8000), vt(T_CLIC) - 0.5, 0.15)

# ─── 2. Click, send: a punch, a whoosh, a zip and a bright ping ───
put(click(True), vt(T_CLIC), 0.45)
put(thump(160, 60, 0.25), vt(T_CLIC), 0.35)
put(click(False), vt(T_CLIC) + 0.075, 0.25)
t_env = vt(T_ENVOI)
put(thump(150, 45, 0.4), t_env, 0.50)
put(sweep(0.6, 400, 5500, 0.4), t_env, 0.26)
put(zip_up(0.32, 350, 3000), t_env, 0.12, 0.2)
put(crack(0.14), t_env, 0.14)
put(bell(880.0, 1.4, 0.8), t_env + 0.04, 0.12, -0.2)
put(bell(1318.5, 1.4, 0.8), t_env + 0.11, 0.10, 0.2)

# ─── 3. The assistant thinks: climbing bleeps (16ths), a tool pill, then the choice panel rises ───
put(sweep(0.5, 2500, 6000, 0.5), vt(T_PRECISION), 0.05, -0.3)
b0, b1 = vt(8.1), vt(T_OUTIL) - 0.05
step, k = 0.125, 0
tb = b0
while tb < b1:
    f = PENTA[min(len(PENTA) - 1, 2 + (k % 6) + (k // 6))]
    put(bleep(f), tb, 0.10, -0.4 if k % 2 else 0.4)
    tb += step; k += 1
put(slide(880, 1500, 0.1), vt(T_OUTIL), 0.10, 0.25)
t_pan = vt(T_PANNEAU)
put(riser(0.42, 300, 8500), t_pan - 0.42, 0.17)
put(thump(150, 50, 0.4), t_pan, 0.48)
put(sweep(0.5, 280, 4500, 0.5), t_pan - 0.04, 0.22)
put(crack(0.12), t_pan, 0.14)
for f, dt, g, p in [(659.25, 0.02, 0.15, -0.2), (987.77, 0.06, 0.12, 0.15), (1318.5, 0.10, 0.08, 0.0)]:
    put(bell(f, 1.8), t_pan + dt, g, p)

# ─── 4. Hover, click on the choice, the panel folds into the summary ───
put(slide(1000, 1500, 0.07), vt(11.4), 0.09, 0.1)
put(click(True), vt(T_CHOIX), 0.45)
put(thump(160, 60, 0.25), vt(T_CHOIX), 0.35)
put(click(False), vt(T_CHOIX) + 0.075, 0.25)
t_res = vt(T_RESUME)
put(sweep(0.5, 4000, 250, 0.35), t_res, 0.22)
put(thump(110, 42, 0.45), t_res, 0.40)
put(bell(880.0, 1.4), t_res + 0.16, 0.13, -0.15)
put(bell(1174.66, 1.4), t_res + 0.26, 0.11, 0.15)

# ─── 5. Build: a riser into the answer, then a pulse (kick on the beat, hats on the 8ths) that stays until the end ───
t_rep = vt(T_REP)
put(riser(t_rep - (t_res + 0.62), 300, 9500), t_res + 0.62, 0.18)
put(thump(150, 48, 0.4), t_rep, 0.50)
put(crack(0.14), t_rep, 0.14)
for f, g in [(587.33, 0.13), (880.0, 0.10), (1174.66, 0.09)]:
    put(bell(f, 1.8), t_rep + 0.02, g)
if CINE:  # a heartbeat ("dub-dub") every second, no drums
    tk = t_rep + 0.3
    while tk < T_DERNIER - 0.3:
        put(thump(100, 42, 0.36), tk, 0.30)
        put(thump(100, 42, 0.30), tk + 0.22, 0.20)
        tk += 1.0
else:
    th = t_env + 0.3
    while th < T_DERNIER:
        off = round((th - t_env) / 0.25) % 2 == 1
        put(hat(open_=off and rng.random() < 0.25), th, (0.06 if off else 0.035) * (1.5 if th > t_rep else 1.0), 0.3 if off else -0.3)
        th += 0.25
    tk = t_rep + 0.5
    while tk < T_DERNIER - 0.25:
        put(thump(125, 46, 0.3), tk, 0.34)
        tk += 0.5

# ─── 6. The answer, word by word ───
for i in range(W):
    idx = int(np.clip(round(i / max(1, W - 1) * (len(PENTA) - 1)) + rng.choice([-1, 0, 0, 1]), 0, len(PENTA) - 1))
    f, pan = PENTA[idx], (-0.4 if i % 2 else 0.4)
    if CINE:  # a swish as each word slides out of its mask; bold words: a marker sweep, then a soft knock and a bell
        put(sweep(0.14, 1200, 7500, 0.5), t_mot(i, 0.0), 0.07, pan)
        put(key(soft=0.25, pitch=1.4), t_mot(i, 0.5), 0.08, pan)
        if bold[i]:
            put(sweep(0.32, 500, 6500, 0.35), t_mot(i, 0.1) - 0.04, 0.13, -pan)
            put(thump(230, 110, 0.14), t_mot(i, 0.6), 0.20)
            put(bell(f * 2, 1.1, 1.2), t_mot(i, 0.6), 0.09, -pan)
    else:  # a bright note per word climbing the scale, an accent on every bold word
        tw = t_mot(i)
        put(pluck(f), tw, 0.085, pan)
        put(key(soft=0.35, pitch=1.6), tw, 0.12, pan)
        if bold[i]:
            put(bell(f * 2, 1.0, 1.2), tw, 0.10, -pan)
            put(bell(PENTA[-1] * 1.5, 0.5, 1.5), tw + 0.02, 0.035, pan)
            put(thump(150, 70, 0.22), tw, 0.22)

# ─── 7. The finale: a riser, a big impact and a chord; "cine" ends on a "message sent" swoosh and a double ding ───
put(riser(0.5 if CINE else 0.4, 400, 10000), T_DERNIER - (0.5 if CINE else 0.4), 0.17)
put(boom(1.6), T_DERNIER, 0.75 if CINE else 0.90)
put(crack(0.2), T_DERNIER, 0.25 if CINE else 0.35)
put(sweep(0.7, 8000, 300, 0.08), T_DERNIER, 0.22)
for f, dt, g in [(587.33, 0.0, 0.14), (880.0, 0.03, 0.12), (1174.66, 0.06, 0.11), (1479.98, 0.09, 0.09), (1760.0, 0.12, 0.08)]:
    put(bell(f, 2.2), T_DERNIER + dt, g, rng.uniform(-0.3, 0.3))
if CINE:
    put(sweep(0.3, 500, 7000, 0.5), T_DERNIER + 0.16, 0.14, 0.2)
    put(bell(1318.5, 1.6, 1.3), T_DERNIER + 0.36, 0.17, -0.1)
    put(bell(1760.0, 1.6, 1.3), T_DERNIER + 0.48, 0.17, 0.1)
else:
    for j, f in enumerate([3520.0, 2959.96, 2349.3, 1975.5, 1760.0, 1479.98]):
        put(bell(f, 0.9, 1.4), T_DERNIER + 0.15 + 0.06 * j, 0.045, 0.5 - 0.2 * j)

# ─── Space: a reverb on everything, then master (soft saturation for punch, peak 0.9, fade-out) ───
def impulse():
    n = int(1.1 * SR); tt_ = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-tt_ / 0.30)
    F = np.fft.rfft(ir); f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(F / (1 + (f / 4500) ** 2), n)

def wet(x):
    ir = impulse(); m = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)] / 18

L, R = L + 0.25 * wet(L), R + 0.25 * wet(R)
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak, R / peak
L, R = np.tanh(1.7 * L) / np.tanh(1.7), np.tanh(1.7 * R) / np.tanh(1.7)
peak = max(np.abs(L).max(), np.abs(R).max())
fade = np.minimum(1, (DUREE - t) / 0.45) * np.minimum(1, t / 0.004)
L, R = L / peak * 0.9 * fade, R / peak * 0.9 * fade

out = ROOT / "public" / "sound.wav"
out.parent.mkdir(exist_ok=True)
pcm = (np.stack([L, R], axis=1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"{out.relative_to(ROOT)} [{'cine' if CINE else 'impact'}]: {DUREE:.2f}s, {len(question)} keys, {W} words ({sum(bold)} bold), finale at {T_DERNIER:.2f}s")
