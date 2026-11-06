"""Soundtrack: 100 bpm darbuka groove + oud-like plucks in Hijaz (a Maghrebi flavour) + SFX from the page's cue list."""
import json, sys, wave
import numpy as np

SR = 44100
sfx = json.load(open(sys.argv[2]))
beats = sfx["beats"]; DUR = beats[-1]
N = int(SR * DUR); out = np.zeros(N); rng = np.random.default_rng(3)
def tt(d): return np.arange(int(d * SR)) / SR
def place(sig, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); out[i:j] += sig[: j - i] * g
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y

BEAT = 0.6; E = BEAT / 2
# darbuka voices
def doum():
    t = tt(0.35); f = 70 + 60 * np.exp(-t * 25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
def tek():
    t = tt(0.08); n = rng.standard_normal(len(t)); n = n - lp(n, 0.25)
    return (n * 0.8 + np.sin(2 * np.pi * 900 * t) * 0.4) * np.exp(-t * 60)
def ka():
    t = tt(0.06); n = rng.standard_normal(len(t)); n = n - lp(n, 0.4)
    return n * np.exp(-t * 80) * 0.5
# maqsum-ish 8-step: D T . T D . T .
PAT = ["D", "T", None, "T", "D", None, "T", "k"]
# Hijaz on D: D Eb F# G A Bb C
H = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 523.25]
def pluck(f, d=0.28):
    t = tt(d); x = np.zeros(len(t))
    for h, a in [(1, 1), (2, .5), (3, .3), (4, .15), (5, .08)]: x += a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (7 + h * 4))
    return x * (1 - np.exp(-t * 400))
MEL = [0, 2, 1, 2, 3, 2, 1, 0, 4, 3, 2, 1, 2, 1, 0, None]
freeze = [(beats[5] + 3.0, beats[5] + 3.0 + 1.0)]  # record-scratch: music stops for the take
def frozen(t): return any(a <= t < b for a, b in freeze)
step = 0; t0 = 0.0
while t0 < DUR - 0.4:
    if not frozen(t0):
        v = PAT[step % 8]
        if v == "D": place(doum(), t0, 0.75)
        elif v == "T": place(tek(), t0, 0.32)
        elif v == "k": place(ka(), t0, 0.3)
        m = MEL[step % 16]
        if m is not None and t0 >= beats[1] - 0.05: place(pluck(H[m] if step % 32 < 16 else H[m] * 1.5), t0, 0.11)
        if step % 8 == 0:  # drone
            d = tt(E * 8); place(np.sin(2 * np.pi * 73.42 * d) * 0.5 * np.minimum(1, d / .1) * np.exp(-d * .6), t0, 0.12)
    step += 1; t0 += E

# SFX
def hit():
    t = tt(0.5); boom = np.sin(2 * np.pi * np.cumsum(45 + 80 * np.exp(-t * 20)) / SR) * np.exp(-t * 7)
    n = rng.standard_normal(len(t)) * np.exp(-t * 35); return boom + 0.5 * n
def pop():
    t = tt(0.12); f = 500 + 900 * np.minimum(1, t / .05); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)
def ding():
    t = tt(0.6); return (np.sin(2 * np.pi * 1568 * t) + .5 * np.sin(2 * np.pi * 2349 * t)) * np.exp(-t * 7)
def swish():
    t = tt(0.25); n = rng.standard_normal(len(t)); return lp(n, 0.2) * np.sin(np.pi * t / .25) ** 2 * 1.5
def tick():
    t = tt(0.3); n = rng.standard_normal(len(t)); w = lp(n, 0.3) * np.exp(-((t - .1) / .06) ** 2) * 1.6
    return w + np.sin(2 * np.pi * 2000 * t) * np.exp(-t * 90) * 0.4
def vacuum():
    t = tt(2.3); n = rng.standard_normal(len(t)); x = lp(n, 0.08) * 2 + np.sin(2 * np.pi * (180 + 6 * np.sin(2 * np.pi * 5 * t)) * t) * 0.25
    return x * np.minimum(1, t / .1) * np.minimum(1, (2.3 - t) / .1)
def scratch():
    t = tt(0.45); n = rng.standard_normal(len(t)); f = 0.05 + 0.3 * np.abs(np.sin(2 * np.pi * 7 * t))
    y = np.zeros_like(n); acc = 0.0
    for k in range(len(n)): acc += f[k] * (n[k] - acc); y[k] = acc
    return y * 2.2 * np.exp(-t * 3)
def send():
    t = tt(0.7); return lp(rng.standard_normal(len(t)), 0.15) * np.sin(np.pi * t / .7) * 1.4 + np.sin(2 * np.pi * np.cumsum(400 + 1200 * t) / SR) * np.exp(-t * 5) * .3
def clink():
    t = tt(0.4); return (np.sin(2 * np.pi * 2600 * t) + np.sin(2 * np.pi * 3900 * t)) * np.exp(-t * 18) * .5
FX = dict(hit=(hit, .6), pop=(pop, .25), ding=(ding, .2), swish=(swish, .35), tick=(tick, .4), vacuum=(vacuum, .35), scratch=(scratch, .7), send=(send, .35), clink=(clink, .3))
for t, k in sfx["sfx"]:
    fn, g = FX[k]; place(fn(), t, g)

fade = np.ones(N); k = int(.4 * SR); fade[-k:] = np.linspace(1, 0, k); out *= fade
out = np.tanh(out * 1.2); out = out / np.max(np.abs(out)) * 0.89
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())
