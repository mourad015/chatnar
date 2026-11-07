"""Score: ominous drone + clock ticks that speed up, hits on slams, heartbeat for 'I love you', rumble to zero, hard silence, alarm + warm sunrise piano."""
import json, sys, wave
import numpy as np
SR = 44100; DUR = 51.0; N = int(SR * DUR); out = np.zeros(N); rng = np.random.default_rng(24)
sfx = json.load(open(sys.argv[2]))
def tt(d): return np.arange(int(d * SR)) / SR
def place(sig, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); out[i:j] += sig[: j - i] * g
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
def note(m): return 440 * 2 ** ((m - 69) / 12)
# drone: minor, darkening, swelling toward zero
t = tt(40.0); env = np.minimum(1, t / 2) * (0.5 + 0.9 * (t / 40) ** 2)
x = sum(np.sin(2 * np.pi * note(m) * t * (1 + .002 * np.sin(t * .4 + k))) / (1 + k * .5) for k, m in enumerate([33, 40, 45, 48]))
place(x * env * np.minimum(1, (40 - t) / .05), 0, .07)
# clock ticks: once a second, faster in the last hour
tk = 2.2
while tk < 40:
    d = tt(.03); place(rng.standard_normal(len(d)) * np.exp(-d * 250), tk, .10 if int(tk) % 2 else .07)
    tk += 1.0 if tk < 30.8 else max(.12, 1.0 - (tk - 30.8) * .18)
def hit(t0, g=.6):
    d = tt(1.0); place(np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-d * 15)) / SR) * np.exp(-d * 4) + lp(rng.standard_normal(len(d)), .3) * np.exp(-d * 25) * .5, t0, g)
def pop(t0):
    d = tt(.12); place(np.sin(2 * np.pi * np.cumsum(500 + 900 * np.minimum(1, d / .05)) / SR) * np.exp(-d * 30), t0, .2)
def ding(t0):
    d = tt(.6); place((np.sin(2 * np.pi * 1568 * d) + .5 * np.sin(2 * np.pi * 2349 * d)) * np.exp(-d * 7), t0, .15)
for t0, k in sfx:
    if t0 > 40: continue
    {'hit': hit, 'pop': pop, 'ding': ding}.get(k, lambda a: None)(t0)
# heartbeat in the last hour
hb = 31.0
while hb < 36.2:
    for o, g in ((0, .45), (.17, .3)): d = tt(.25); place(np.sin(2 * np.pi * 50 * d) * np.exp(-d * 16), hb + o, g)
    hb += .8
# 3-2-1 booms + rising rumble
for i in range(3): hit(36.4 + i * 1.2, .6)
d = tt(4.0); n = lp(rng.standard_normal(len(d)), .02) * 3 * (d / 4) ** 2; place(n, 36.0, .6)
d = tt(.6); place(lp(rng.standard_normal(len(d)), .5) * np.exp(-d * 8) * 2, 39.95, .7)
out[int(40.2 * SR):int(41.6 * SR)] = 0          # silence
# alarm clock + sunrise
for i in range(8):
    d = tt(.09); place(np.sign(np.sin(2 * np.pi * 2000 * d)) * .3 * np.exp(-d * 5), 41.7 + i * .2 + (i // 2) * .1, .25)
def piano(t0, m, g=.15):
    f = note(m); d = tt(3.0); place(sum(a * np.sin(2 * np.pi * f * h * d) * np.exp(-d * (1.2 + h)) for h, a in [(1, 1), (2, .4), (3, .15)]) * (1 - np.exp(-d * 300)), t0, g)
for t0, ch in [(43.3, [60, 64, 67, 72]), (45.7, [57, 60, 64, 69]), (47.6, [53, 57, 60, 65, 69]), (49.2, [55, 59, 62, 67, 71])]:
    for k, m in enumerate(ch): piano(t0 + k * .09, m, .12)
for i in range(10): d = tt(.12); place(np.sin(2 * np.pi * np.cumsum(3000 + 1500 * np.sin(np.linspace(0, 9, len(d)))) / SR) * np.exp(-d * 20), 42.5 + i * .6 + rng.random() * .3, .03)
k = int(.4 * SR); out[-k:] *= np.linspace(1, 0, k)
out = np.tanh(out * 1.2); out = out / np.max(np.abs(out)) * .89
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.repeat(pcm[:, None], 2, 1).tobytes())
