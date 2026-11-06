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

# ---- v2 sound design: risers into every transition, impacts on landings ----
def riser(end_t, d=0.45, gain=0.5):
    t = tt(d)
    n = rng.standard_normal(len(t))
    y = np.zeros_like(n); acc = 0.0
    for k in range(len(n)):
        a = 0.01 + 0.5 * (k / len(n)) ** 2
        acc += a * (n[k] - acc); y[k] = acc
    tone_up = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / d) ** 2) / SR) * 0.25
    place((y * 1.8 + tone_up) * (t / d) ** 2, end_t - d, gain)

def impact(t0, gain=0.8):
    t = tt(0.9)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-t * 18)) / SR) * np.exp(-t * 4.5)
    n = rng.standard_normal(len(t)); hit = np.convolve(n, np.ones(3) / 3, mode="same") * np.exp(-t * 30)
    place(boom + hit * 0.6, t0, gain)

def suck(t0, d=0.4):
    t = tt(d)
    n = rng.standard_normal(len(t)); y = np.zeros_like(n); acc = 0.0
    for k in range(len(n)):
        a = 0.45 * (1 - k / len(n)) ** 2 + 0.01
        acc += a * (n[k] - acc); y[k] = acc
    place(y * 1.6 * (1 - t / d) ** 0.5 * (t / d) ** 0.3, t0, 0.5)

impact(0.5, 0.9); place(blip(500, 1300), 0.5, 0.25)
riser(1.95); impact(2.0, 0.6)
whoosh(4.0, 0.2)
whoosh(6.0, 0.25)
place(blip(1500, 2400, 0.05), 7.52, 0.3)
riser(8.05, 0.35); impact(8.08, 0.55)
whoosh(10.0, 0.22)
whoosh(10.7, 0.2)
riser(12.1, 0.5); impact(12.12, 0.7)
impact(13.0, 0.85); place(blip(400, 1100, 0.2), 13.0, 0.3)
suck(14.42)

# arpeggio plucks on 8ths once the groove starts (music drives the motion)
for k in range(int(2.0 / 0.25), int(14.4 / 0.25)):
    t0 = k * 0.25
    ch = CHORDS[int(t0 // 2) % 4]
    f = note(ch[k % 3]) * 2
    t = tt(0.22)
    pl = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 18)
    place(pl, t0, 0.07)

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
