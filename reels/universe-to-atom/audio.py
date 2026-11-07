"""Ambient score: big-bang boom, evolving drone per scale, a sparkle that sweeps left→right as each word writes itself, risers into every dive."""
import sys, wave
import numpy as np
SR = 44100; LEN = 5.0; NL = 8; DUR = LEN * NL; N = int(SR * DUR)
L = np.zeros(N); Rt = np.zeros(N); rng = np.random.default_rng(11)
def tt(d): return np.arange(int(d * SR)) / SR
def place(sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g
    L[i:j] += s * np.sqrt((1 - pan) / 2); Rt[i:j] += s * np.sqrt((1 + pan) / 2)
def lp(x, a):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
def note(m): return 440 * 2 ** ((m - 69) / 12)
# chord per scale (descending into the small): Dm9 → Bb → F → C → Gm → Dm → Bb → A (resolves to D at loop)
CH = [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [41, 53, 57, 60, 64], [48, 55, 60, 64, 67], [43, 55, 58, 62, 65], [50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [45, 52, 57, 61, 64]]
for li, ch in enumerate(CH):
    t = tt(LEN + 1.0); env = np.minimum(1, t / 0.8) * np.minimum(1, np.maximum(0, (LEN + 1.0 - t) / 1.0))
    sig = np.zeros(len(t))
    for k, m in enumerate(ch):
        f = note(m); vib = 1 + 0.002 * np.sin(2 * np.pi * (0.2 + k * .07) * t)
        sig += (np.sin(2 * np.pi * f * vib * t) + .4 * np.sin(2 * np.pi * f * 2.003 * t)) / (1 + k * .3)
    place(sig * env, li * LEN - 0.3 if li else 0, 0.05, pan=(-1) ** li * .2)
    # sparkle: bell plucks sweep left→right with the word being written
    for k in range(14):
        tk = li * LEN + 2.0 + k * 0.09; f = note(ch[k % 5] + 24 + 12 * (k // 10)); d = tt(1.2)
        b = (np.sin(2 * np.pi * f * d) + .3 * np.sin(2 * np.pi * f * 2.76 * d)) * np.exp(-d * 4.5)
        place(b, tk, 0.045, pan=-0.8 + 1.6 * k / 13)
    # riser into the dive + whoosh through
    if li < NL - 1:
        d = tt(0.85); n = rng.standard_normal(len(d)); y = np.zeros_like(n); acc = 0.0
        for k in range(len(n)): a = 0.01 + 0.45 * (k / len(n)) ** 2; acc += a * (n[k] - acc); y[k] = acc
        place(y * (d / .85) ** 2.2 * 1.6, li * LEN + 4.2, 0.35)
        place(np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-tt(1.2) * 6)) / SR) * np.exp(-tt(1.2) * 3), li * LEN + 5.0, 0.35)
# big bang
d = tt(3.0); place(np.sin(2 * np.pi * np.cumsum(25 + 120 * np.exp(-d * 8)) / SR) * np.exp(-d * 1.2), 0, 0.8)
place(lp(rng.standard_normal(len(d)), 0.2) * np.exp(-d * 2) * 1.5, 0, 0.5)
# final collapse: reverse swell into silence
d = tt(0.9); n = lp(rng.standard_normal(len(d)), 0.1) * (d / .9) ** 3 * 1.5; place(n, DUR - 0.95, 0.4)
out = np.stack([L, Rt], 1); k = int(.25 * SR); out[-k:] *= np.linspace(1, 0, k)[:, None]
out = np.tanh(out * 1.3); out = out / np.max(np.abs(out)) * 0.89
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
