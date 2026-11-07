"""Warm ambient score: pad + piano motif that builds with the story, bells for 'noticing', a heartbeat from 'action', a swell into 'who you are'."""
import sys, wave
import numpy as np
SR = 44100; DUR = 41.0; N = int(SR * DUR); L = np.zeros(N); Rr = np.zeros(N); rng = np.random.default_rng(9)
def tt(d): return np.arange(int(d * SR)) / SR
def place(sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g
    L[i:j] += s * np.sqrt((1 - pan) / 2); Rr[i:j] += s * np.sqrt((1 + pan) / 2)
def note(m): return 440 * 2 ** ((m - 69) / 12)
def pad(t0, d, chord, g):
    t = tt(d); env = np.minimum(1, t / 1.6) * np.minimum(1, np.maximum(0, (d - t) / 1.4))
    for k, m in enumerate(chord):
        f = note(m); x = np.sin(2 * np.pi * f * t + .3 * np.sin(2 * np.pi * .15 * t)) + .5 * np.sin(2 * np.pi * f * 1.004 * t) + .2 * np.sin(2 * np.pi * f * 2 * t)
        place(x * env / (1 + k * .25), t0, g, pan=(k / (len(chord) - 1) - .5) * .8)
def piano(t0, m, g=.14, pan=0):
    f = note(m); t = tt(3.0); x = sum(a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (1.2 + h * 1.1)) for h, a in [(1, 1), (2, .45), (3, .2), (4, .1)])
    place(x * (1 - np.exp(-t * 300)), t0, g, pan)
def bell(t0, m, g=.05, pan=0):
    f = note(m); t = tt(2.2); place((np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) + .15 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t * 2.4), t0, g, pan)
CMAJ7 = [48, 55, 59, 64, 67]; AM9 = [45, 52, 59, 60, 64]; FMAJ7 = [41, 48, 57, 60, 64]; G6 = [43, 50, 59, 62, 64]; CMAJ9 = [36, 48, 55, 62, 64, 71]
for t0, d, ch, g in [(0, 8.6, CMAJ7, .05), (8, 6.6, AM9, .05), (14, 5.6, FMAJ7, .055), (19, 6.6, G6, .06), (25, 6.6, CMAJ9, .065), (31, 3.6, AM9, .06), (34.2, 4.0, FMAJ7, .06), (37.6, 3.6, CMAJ7, .055)]:
    pad(t0, d, ch, g)
# piano motif on each line
for t0, ms in [(-.2, [76, 79]), (1.6, [74, 71]), (4.6, [72, 76, 79]), (8.2, [69, 72]), (9.7, [76]), (11.4, [79, 81]), (14.6, [77, 76]), (19.2, [74, 79]), (22.2, [81, 79]), (25.6, [76, 79, 84]), (30.9, [72, 71]), (34.2, [72, 76, 79, 84])]:
    for k, m in enumerate(ms): piano(max(0, t0) + k * .32, m, .13, pan=(k - 1) * .3)
# the spark: soft bloom tone
d = tt(3); place(np.sin(2 * np.pi * note(84) * d) * (1 - np.exp(-d * 8)) * np.exp(-d * 1.2), 4.3, .06)
# noticing: scattered bells everywhere
for i in range(26): bell(11.2 + rng.random() * 2.6, [72, 76, 79, 83, 84, 88][i % 6], .035, pan=rng.random() * 2 - 1)
# heartbeat pulse from 'action', building into 'momentum'
tb = 19.0
while tb < 31.0:
    g = .18 + .22 * min(1, (tb - 19) / 8)
    for o, gg in ((0, 1), (.16, .6)): d = tt(.3); place(np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-d * 30)) / SR) * np.exp(-d * 14), tb + o, g * gg)
    tb += .857 if tb < 25 else .6
# swell into 'who you are'
d = tt(2.4); n = rng.standard_normal(len(d)); y = np.zeros_like(n); acc = 0.0
for k in range(len(n)): a = .005 + .25 * (k / len(n)) ** 2; acc += a * (n[k] - acc); y[k] = acc
place(y * (d / 2.4) ** 2 * 1.2, 29.4, .25)
for k in range(12): bell(31.0 + k * .11, [72, 76, 79, 83, 84, 88][k % 6] + 12 * (k // 6), .045, pan=-.8 + 1.6 * k / 11)
d = tt(4); place(np.sin(2 * np.pi * note(36) * d) * np.exp(-d * .8), 31.8, .25)
# collapse back into the spark
for k in range(6): bell(37.6 + k * .14, 96 - k * 5, .03)
out = np.stack([L, Rr], 1); k = int(.4 * SR); out[-k:] *= np.linspace(1, 0, k)[:, None]
out = np.tanh(out * 1.3); out = out / np.max(np.abs(out)) * .89
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
