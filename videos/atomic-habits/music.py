"""Synthesizes the soundtrack (pad, bass, arp, drums, whooshes, impacts) -> music.wav.
Scene durations must match S in anim.js."""
import numpy as np, wave

SR = 44100
SCENES = [6, 10, 8, 8, 9, 9, 12, 5, 5, 5, 5, 8]
TOTAL = sum(SCENES)
bounds = np.cumsum([0] + SCENES)[1:-1]
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(3)
BPM = 100; beat = 60 / BPM; bar = beat * 4

def midi(n): return 440 * 2 ** ((n - 69) / 12)
def env_ad(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(x / a, 1) * np.exp(-x / d)
def add(buf, start, sig, gain=1.0):
    i = int(start * SR)
    if i >= len(buf): return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += sig * gain
def onepole_lp(x, cut):  # cut: array of cutoff Hz per sample
    a = np.exp(-2 * np.pi * cut / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y

# chords Am F C G, 2 bars each
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
roots = [45, 41, 36, 43]
pad = np.zeros(N); bass = np.zeros(N); arp = np.zeros(N); drums = np.zeros(N)
clen = bar * 2
k = 0
while k * clen < TOTAL:
    st = k * clen; ch = chords[k % 4]; n = int((clen + 1.2) * SR)
    x = np.arange(n) / SR
    e = np.minimum(x / 0.8, 1) * np.clip((clen + 1.2 - x) / 1.2, 0, 1)
    sig = np.zeros(n)
    for note in ch:
        for det in (-0.0015, 0.0015):
            f = midi(note + 12) * (1 + det)
            for h in range(1, 6):
                sig += np.sin(2 * np.pi * f * h * x + h) / h ** 1.6
    add(pad, st, sig * e, 0.018)
    # bass on beats 1 and 3, plus pickup
    for b in range(8):
        if b % 4 in (0, 2) or b == 7:
            bn = int(beat * 1.6 * SR); bx = np.arange(bn) / SR
            f = midi(roots[k % 4])
            add(bass, st + b * beat, (np.sin(2*np.pi*f*bx) + 0.3*np.sin(4*np.pi*f*bx)) * env_ad(bn, 0.01, 0.35), 0.22)
    # 8th-note arp
    pattern = [0, 1, 2, 1, 2, 0, 1, 2]
    for s8 in range(16):
        f = midi(ch[pattern[s8 % 8]] + 24 + (12 if s8 % 8 == 7 else 0))
        an = int(0.6 * SR); ax = np.arange(an) / SR
        add(arp, st + s8 * beat / 2, (np.sin(2*np.pi*f*ax) + 0.25*np.sin(6*np.pi*f*ax)) * env_ad(an, 0.003, 0.16), 0.05)
    k += 1

# drums from scene 1 until the outro settles
groove_on, groove_off = SCENES[0] - 0.2, TOTAL - 4
kn = int(0.5 * SR); kx = np.arange(kn) / SR
kick = np.sin(2 * np.pi * (45 * kx + 90 / 18 * (1 - np.exp(-18 * kx)))) * np.exp(-kx / 0.18)
hn = int(0.08 * SR); hat = np.diff(rng.standard_normal(hn + 1)) * env_ad(hn, 0.001, 0.02)
bt = 0.0
while bt < TOTAL:
    if groove_on <= bt < groove_off:
        add(drums, bt, kick, 0.55)
        add(drums, bt + beat / 2, hat, 0.06)
        if int(round(bt / beat)) % 2 == 1:  # soft clap on 2 & 4
            cn = int(0.2 * SR); add(drums, bt, rng.standard_normal(cn) * env_ad(cn, 0.002, 0.05), 0.07)
    bt += beat

# sidechain duck on beats
duck = np.ones(N)
phase = (t % beat) / beat
mask = (t >= groove_on) & (t < groove_off)
duck[mask] = 1 - 0.35 * np.exp(-phase[mask] * 7)
music = (pad + arp) * duck + bass * duck ** 0.5 + drums
# intro: only pad + arp until groove
music[t < groove_on] = (pad + arp)[t < groove_on] + bass[t < groove_on] * 0.0

sfx = np.zeros(N)
for b in bounds:  # whoosh synced to the wipe
    n = int(0.9 * SR); x = np.arange(n) / SR
    cut = 300 + 5000 * np.sin(np.pi * x / 0.9) ** 2
    w = onepole_lp(rng.standard_normal(n), cut) * np.sin(np.pi * x / 0.9) ** 2
    add(sfx, b - 0.45, w, 0.35)
def impact(at, g):
    n = int(1.6 * SR); x = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 * x + 60 / 8 * (1 - np.exp(-8 * x)))) * np.exp(-x / 0.5)
    add(sfx, at, boom, g)
    add(sfx, at, onepole_lp(rng.standard_normal(n), np.full(n, 2500.0)) * np.exp(-x / 0.12), g * 0.5)
impact(1.0, 0.7)
impact(TOTAL - SCENES[-1] + 0.3, 0.8)
# soft ticks for the habit-tracker cells (scene 10)
miss_t0 = sum(SCENES[:10])
for i in range(24):
    n = int(0.08 * SR); x = np.arange(n) / SR
    f = 1600 if i != 11 else 300
    add(sfx, miss_t0 + 0.5 + i * 0.075, np.sin(2 * np.pi * f * x) * np.exp(-x / 0.02), 0.12 if i != 11 else 0.3)

mix = music + sfx
fade = np.clip(t / 0.8, 0, 1) * np.clip((TOTAL - t) / 2.5, 0, 1)
mix = np.tanh(mix * fade * 1.3)
mix /= np.max(np.abs(mix)) / 0.89
stereo = np.stack([mix, np.roll(mix, 220) * 0.98], 1)  # tiny width
with wave.open('music.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((stereo * 32767).astype('<i2').tobytes())
print('ok', TOTAL)
