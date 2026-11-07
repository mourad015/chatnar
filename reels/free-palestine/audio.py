"""Score: dark drone → ironic elevator muzak under the press statements → tape-stop → heartbeat under the toll → Hijaz oud melody for 'still here' → key click."""
import sys, wave
import numpy as np
SR = 44100; DUR = 53.0; N = int(SR * DUR); out = np.zeros(N); rng = np.random.default_rng(48)
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
def drone(t0, d, root, g):
    t = tt(d); env = np.minimum(1, t / 1.5) * np.minimum(1, np.maximum(0, (d - t) / 1.2))
    x = sum(np.sin(2 * np.pi * note(root + iv) * (1 + .0015 * np.sin(t * .3 + iv)) * t) / (1 + k) for k, iv in enumerate([0, 7, 12, 15]))
    place(x * env, t0, g)
def hit(t0, g=.6):
    t = tt(1.2); place(np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-t * 14)) / SR) * np.exp(-t * 4) + lp(rng.standard_normal(len(t)), .3) * np.exp(-t * 20) * .6, t0, g)
def chime(t0, f, g=.12):
    t = tt(2.5); place((np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 2), t0, g)
# 1) the key: low drone + glint chimes
drone(0, 17.5, 38, .07); chime(0.7, note(74)); chime(2.5, note(77), .08)
hit(5.62, .7)
# keys leaving: soft metallic jingles
for i in range(40): chime(6.2 + i * 0.09 + rng.random() * .05, note(88 + int(rng.random() * 8)), .02)
chime(9.0, note(69), .1); chime(10.2, note(68), .1)
# 2) muzak: cheerful bossa e-piano, 17.0 → 26.0
CH = [[60, 64, 67, 71, 74], [57, 60, 64, 67, 71], [62, 65, 69, 72, 76], [55, 59, 62, 65, 69]]
beat = 0.5; t0 = 17.0; step = 0
while t0 < 26.0:
    ch = CH[(step // 8) % 4]
    if step % 8 in (0, 3, 6):
        for m in ch[1:]:
            d = tt(.45); place((np.sin(2 * np.pi * note(m) * d) + .2 * np.sin(2 * np.pi * note(m) * 2 * d)) * np.exp(-d * 5), t0, .035)
    if step % 4 in (0, 3): d = tt(.35); place(np.sin(2 * np.pi * note(ch[0] - 24) * d) * np.exp(-d * 6), t0, .2)
    d = tt(.05); place(lp(rng.standard_normal(len(d)), .6) * np.exp(-d * 90), t0, .06)   # shaker
    if step % 8 == 0: chime(t0, note(ch[-1] + 12), .05)
    step += 1; t0 += beat / 2
# typewriter + stamp for statements
for tc in [17.6, 19.2, 20.8]:
    for i in range(10): d = tt(.03); place(rng.standard_normal(len(d)) * np.exp(-d * 200), tc - .45 + i * .045, .12)
    hit(tc + .15, .25)
for tc in [22.4, 22.9]: chime(tc, note(84), .06)
hit(23.62, .35)
# tape stop at 26.0: slow the last muzak bar down to nothing
seg = out[int(23.6 * SR):int(26.0 * SR)].copy()
out[int(23.6 * SR):int(26.0 * SR)] *= np.linspace(1, 1, len(seg))
d = 0.7; n = int(d * SR); idx = np.cumsum(np.linspace(1, 0, n)); idx = (idx / idx[-1] * (len(seg) * .35)).astype(int)
place(seg[np.clip(len(seg) - int(len(seg) * .35) + idx, 0, len(seg) - 1)] * np.linspace(1, 0, n), 26.0, 1.0)
out[int(26.0 * SR) + n:int(26.2 * SR) + n] *= 0
# 3) the toll: heartbeat + low drone, one muted pulse per red dot
drone(26.3, 15.5, 33, .08)
for i in range(16):
    tb = 26.4 + i * 0.95
    for o, g in ((0, .5), (.18, .35)): d = tt(.25); place(np.sin(2 * np.pi * 50 * d) * np.exp(-d * 18), tb + o, g)
for k in range(75): d = tt(.4); place(np.sin(2 * np.pi * note(45) * d) * np.exp(-d * 9), 26.5 + k / 75 * 4.0, .03)
hit(34.22, .6); hit(38.62, .5)
# 4) still here: oud-like Hijaz melody (D Eb F# G A Bb C)
H = [62, 63, 66, 67, 69, 70, 72, 74]
MEL = [0, 1, 2, 3, 4, 3, 2, 1, 2, 4, 5, 4, 3, 2, 1, 0, 3, 4, 5, 7, 6, 5, 4, 3]
drone(41.0, 12.0, 38, .09)
def oud(f):
    t = tt(.9); x = sum(a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (3 + h * 2.5)) for h, a in [(1, 1), (2, .6), (3, .35), (4, .2), (5, .1)])
    return x * (1 - np.exp(-t * 600))
for i, m in enumerate(MEL):
    tn = 41.2 + i * 0.42
    if tn > 52.3: break
    place(oud(note(H[m])), tn, .16)
    if i % 2 == 0: d = tt(.3); place(np.sin(2 * np.pi * np.cumsum(70 + 50 * np.exp(-d * 25)) / SR) * np.exp(-d * 9), tn, .25)  # soft doum
hit(46.0, .45)
# key unlock click
d = tt(.12); place(rng.standard_normal(len(d)) * np.exp(-d * 120), 51.25, .4); place(rng.standard_normal(len(d)) * np.exp(-d * 90), 51.42, .55)
k = int(.3 * SR); out[-k:] *= np.linspace(1, 0, k)
out = np.tanh(out * 1.2); out = out / np.max(np.abs(out)) * .89
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.repeat(pcm[:, None], 2, 1).tobytes())
