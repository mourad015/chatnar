"""Generate the 15 s soundtrack: 120 bpm beat, pad, and SFX synced to the visuals."""
import sys
import wave

import numpy as np

SR = 44100
DUR = 15.0
N = int(SR * DUR)
out = np.zeros(N)
rng = np.random.default_rng(7)


def place(sig, t, gain=1.0):
    i = int(t * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    out[i:j] += sig[: j - i] * gain


def tt(d):
    return np.arange(int(d * SR)) / SR


def kick():
    t = tt(0.4)
    freq = 45 + 90 * np.exp(-t * 32)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(phase) * np.exp(-t * 8)


def hat():
    t = tt(0.06)
    n = rng.standard_normal(len(t))
    n = np.diff(n, prepend=0)  # crude high-pass
    return n * np.exp(-t * 70) * 0.5


def clap():
    t = tt(0.25)
    n = rng.standard_normal(len(t))
    lp = np.convolve(n, np.ones(6) / 6, mode="same")
    band = lp - np.convolve(lp, np.ones(40) / 40, mode="same")
    env = np.exp(-t * 22) * (1 + 0.6 * (t < 0.012))
    return band * env * 2.2


def tone(f, d, decay, harm=0.25):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + harm * np.sin(4 * np.pi * f * t)) * np.exp(-t * decay)


def blip(f0, f1, d=0.12):
    t = tt(d)
    freq = f0 + (f1 - f0) * np.minimum(1, t / 0.05)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 28)


def whoosh(center, width=0.28):
    t = tt(width * 2)
    n = rng.standard_normal(len(t))
    y = np.zeros_like(n)
    acc = 0.0
    for k in range(len(n)):
        x = k / len(n)
        a = 0.02 + 0.35 * np.exp(-((x - 0.5) / 0.18) ** 2)  # filter opens toward the cut
        acc += a * (n[k] - acc)
        y[k] = acc
    env = np.exp(-((t - width) / (width * 0.45)) ** 2)
    place(y * env * 1.6, center - width)


def note(name):
    names = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
    return 440 * 2 ** ((names[name[0]] + 12 * (int(name[1]) - 4)) / 12)


BEAT = 0.5
CHORDS = [["A3", "C4", "E4"], ["F3", "A3", "C4"], ["C4", "E4", "G4"], ["G3", "B3", "D4"]]
ROOTS = ["A1", "F1", "C2", "G1"]

# pad: one chord per bar (2 s), soft attack, ducked by the kick
pad = np.zeros(N)
for bar in range(8):
    t0 = bar * 2.0
    t = tt(2.3)
    env = np.minimum(1, t / 0.25) * np.minimum(1, np.maximum(0, (2.3 - t) / 0.3))
    sig = np.zeros(len(t))
    for nm in CHORDS[bar % 4]:
        f = note(nm)
        sig += np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.003 * t) + 0.15 * np.sin(4 * np.pi * f * t)
    i = int(t0 * SR)
    j = min(N, i + len(t))
    pad[i:j] += (sig * env)[: j - i]
duck = np.ones(N)
for b in range(30):
    i = int(b * BEAT * SR)
    t = tt(0.35)
    j = min(N, i + len(t))
    duck[i:j] = np.minimum(duck[i:j], (1 - 0.65 * np.exp(-t * 9))[: j - i])
out += pad * duck * 0.045

# drums: kick every beat; hats + claps join after the hook; drop out at the end for the loop
for b in range(30):
    t0 = b * BEAT
    if t0 >= 14.5:
        break
    place(kick(), t0, 0.9)
    place(tone(note(ROOTS[int(t0 // 2) % 4]), 0.45, 6, 0.6), t0, 0.22)
    if t0 >= 2.0:
        place(hat(), t0 + 0.25, 0.35)
        if b % 2 == 1:
            place(clap(), t0, 0.35)

# transitions
for c in [2, 4, 6, 8, 10, 12]:
    whoosh(c)

# hook pop on "DO?" and outro pop on "Claude"
place(blip(500, 1300), 0.5, 0.35)
place(blip(400, 1100, 0.2), 13.0, 0.4)
place(tone(55, 0.6, 5, 0.3), 13.0, 0.5)

# typing clicks (code scene)
t = 2.3
while t < 3.55:
    c = rng.standard_normal(int(0.006 * SR)) * np.exp(-np.arange(int(0.006 * SR)) / 60)
    place(c, t, 0.12)
    t += 0.042 + rng.random() * 0.02

# error buzz, then success chime (bug scene)
buzz = np.sign(np.sin(2 * np.pi * 110 * tt(0.14))) * np.exp(-tt(0.14) * 14)
place(buzz, 4.27, 0.07)
place(buzz, 4.8, 0.06)
place(tone(1318.5, 0.5, 7, 0.1), 5.05, 0.16)
place(tone(1975.5, 0.6, 6, 0.1), 5.13, 0.16)

# app pieces landing
for i in range(6):
    place(blip(900 + i * 60, 700 + i * 60, 0.07), 6.24 + i * 0.1 + 0.1, 0.09)

# rising notes as the bars grow
for i, nm in enumerate(["A4", "C5", "D5", "E5", "G5", "A5", "C6"]):
    place(tone(note(nm), 0.25, 14, 0.05), 8.2 + i * 0.1 + 0.08, 0.1)

# shape morph
whoosh(10.75, 0.2)

# master: fade the tail for a clean loop, soft clip, normalize
fade = np.ones(N)
k = int(0.35 * SR)
fade[-k:] = np.linspace(1, 0, k)
out *= fade
out = np.tanh(out * 1.1)
out = out / np.max(np.abs(out)) * 0.89
pcm = (out * 32767).astype(np.int16)
stereo = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(stereo.tobytes())
