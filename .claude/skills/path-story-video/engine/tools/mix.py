"""Path Story soundtrack: the speaker's voice + an original score + sound design, all synthesized here with numpy.
  python3 tools/mix.py [project=.]  → data/mix.wav (48 kHz stereo)
Score arc (follows the story): warm piano (hope) → muted, mechanical (routine) → SILENCE + boom (suddenly)
→ low drone + pulse (confusion) → sad solo piano in the rain (despair) → arpeggios build (walking on)
→ full major chords, strings and melody (the look back / glory) → gentle resolve.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from scipy import signal

P = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
SR = 48000
rng = np.random.default_rng(7)
cj = json.loads((P / 'data/cues.json').read_text())
DUR = float(cj['duration']); N = int((DUR + 0.2) * SR)

def lp(x, f, o=2): b, a = signal.butter(o, min(f, SR / 2 - 100) / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f0, f1, o=2): b, a = signal.butter(o, [f0 / (SR / 2), f1 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def db(x): return 10 ** (x / 20)
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def env(n, a=0.005, r=5):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na); rest = n - na
    if rest > 0: e[na:] = np.exp(-np.linspace(0, r, rest))
    return e
def m2f(m): return 440 * 2 ** ((m - 69) / 12)
def put(buf, t, x, g=1.0):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += x[:n] * g

# ───────── instruments ─────────
def piano(m, vel=0.5, dur=3.0, mute=False):
    f = m2f(m); t = tt(dur); B = 0.00035; x = np.zeros(len(t))
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 9000: break
        dec = (0.9 + k * 0.55) * (f / 262) ** 0.35 * (4 if mute else 1)
        x += np.sin(2 * np.pi * fk * t + rng.uniform(0, 6)) * np.exp(-t * dec) / k ** 1.25
    x += lp(noise(dur), 2500) * np.exp(-t * 90) * 0.15
    a = int(0.004 * SR); x[:a] *= np.linspace(0, 1, a)
    x *= np.minimum(1, (dur - t) / 0.3)
    return lp(x, 1800 + vel * 4500) * vel
def pad(ms, d, gain=0.1, bright=1400, att=0.9, rel=1.0):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-0.004, 0, 0.0045):
            x += signal.sawtooth(2 * np.pi * m2f(m) * (1 + det) * t + rng.uniform(0, 6)) * 0.33
    x = lp(lp(x, bright), bright)
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t)) / rel)
    x *= e * (1 + 0.08 * np.sin(2 * np.pi * 4.5 * t))
    return x * gain / max(1, len(ms))

def reverb(x, secs=3.2, wet=0.35, damp=3500, seed=1):
    r = np.random.default_rng(seed); n = int(secs * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 6.9 / secs); ir = lp(ir, damp); ir[: int(0.012 * SR)] = 0; ir /= np.sqrt(np.sum(ir ** 2))
    y = signal.fftconvolve(x, ir)[: len(x)]
    return x * (1 - wet) + y * wet * 0.9

# ───────── the score: composed per video in <project>/score.py ─────────
# score.py runs with everything above in scope. It must fill mus (piano) and padb (pads) using put / piano / pad /
# arp / bass / chordpad (+ drums into dry with kick / tom / shaker), and may define post(score) to carve silences (e.g. a hard stop before an impact).
mus = np.zeros(N); padb = np.zeros(N); dry = np.zeros(N)   # dry = drums / percussion (no reverb)
CH = { 'Fmaj7': [53, 57, 60, 64], 'C': [48, 55, 60, 64], 'Am': [45, 57, 60, 64], 'G': [43, 55, 59, 62], 'E': [40, 56, 59, 64], 'F': [41, 57, 60, 65], 'Cadd9': [48, 55, 62, 64, 67] }
def arp(t0, t1, ch, step, vel, up=12, pat=(0, 1, 2, 3, 2, 1), mute=False, cres=0):
    notes = CH[ch]; t = t0; k = 0
    while t < t1 - 0.02:
        m = notes[pat[k % len(pat)] % len(notes)] + up
        v = vel * (1 + cres * (t - t0) / max(0.1, t1 - t0)) * (0.85 + 0.15 * (k % 2 == 0))
        put(mus, t, piano(m, v, 2.2 if not mute else 0.5, mute)); t += step; k += 1
def bass(t, ch, vel=0.45, dur=3.5): put(mus, t, piano(CH[ch][0] - 12 if CH[ch][0] > 44 else CH[ch][0], vel, dur))
def chordpad(t0, t1, ch, gain, bright=1400, oct=0): put(padb, t0, pad([m + oct for m in CH[ch]], t1 - t0 + 0.8, gain, bright, rel=0.8))

def kick(t, vel=0.8):
    d = 0.45; x = tt(d); put(dry, t, np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-x * 28)) / SR) * env(len(x), 0.002, 7) * vel)
def tom(t, m=45, vel=0.6):
    d = 0.6; x = tt(d); f = m2f(m); put(dry, t, (np.sin(2 * np.pi * np.cumsum(f * (1 + 0.5 * np.exp(-x * 20))) / SR) + lp(noise(d), 900) * 0.25 * np.exp(-x * 30)) * env(len(x), 0.002, 6) * vel)
def shaker(t, vel=0.25):
    d = 0.09; put(dry, t, bp(noise(d), 2500, 4800) * env(int(d * SR), 0.01, 6) * vel)
post = None
exec(compile((P / 'score.py').read_text(), str(P / 'score.py'), 'exec'))
score = reverb(mus, 3.4, 0.42) + reverb(padb, 3.4, 0.5, seed=2) + reverb(dry, 1.2, 0.12, seed=4)
if post: score = post(score)
fo = int(1.2 * SR); score[N - fo:] *= np.linspace(1, 0, fo)

# ───────── sound design ─────────
def whoosh(d=0.45, **_):
    n = noise(d); k = np.sin(np.pi * np.linspace(0, 1, len(n))); x = lp(n, 600) * (1 - k) + lp(n, 2600) * k; return x * k ** 1.6
def whip(**_): return whoosh(0.28)
def thump(**_): t = tt(0.4); return np.sin(2 * np.pi * (55 + 50 * np.exp(-t * 30)) * t) * env(len(t), 0.002, 8)
def swell(d=2.0, **_):
    t = tt(d); nz = noise(d); k = t / d; n = lp(nz, 900) * (1 - k) + lp(nz, 3400) * k; return n * k ** 2.2 * np.minimum(1, (d - t) / 0.08)
def riser(d=0.4, **_):
    t = tt(d); s = np.sin(2 * np.pi * np.cumsum(220 * (6 ** (t / d))) / SR) * 0.4; return (lp(noise(d), 3500) * 0.6 + s) * (t / d) ** 2
def boom(**_):
    d = 2.2; t = tt(d); sub = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 1.6) + 28) / SR) * env(len(t), 0.002, 3.2)
    return np.tanh(2 * (sub + lp(noise(d), 300) * env(len(t), 0.001, 9) * 0.8))
def crack(**_):
    d = 0.6; x = np.zeros(int(d * SR))
    for i in range(14): st = int(rng.uniform(0, 0.4) * SR); b = bp(noise(0.03), 600, 3800) * env(int(0.03 * SR), 0.001, 6); x[st:st + len(b)] += b * rng.uniform(0.4, 1)
    return x
def cut(**_): return np.zeros(10)
def drone(d=2.2, **_): t = tt(d); return (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 55.6 * t) + 0.3 * np.sin(2 * np.pi * 82.4 * t)) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.6)
def rain_(d=5.0, fade_out=False, **_):
    n = lp(bp(noise(d), 500, 6000), 4800); drops = lp((rng.random(len(n)) < 0.003).astype(float), 1800) * 5
    t = tt(d); e = np.minimum(1, t / 0.5) * (np.exp(-t * 2.6) if fade_out else np.minimum(1, (d - t) / 0.8))
    return (n * 0.6 + drops) * e
def rain_out(d=1.2, **_): return rain_(d + 0.4, True)
def heart(**_):
    one = lambda d, f: np.sin(2 * np.pi * f * tt(d)) * env(int(d * SR), 0.004, 7)
    return lp(np.concatenate([one(0.16, 56), np.zeros(int(0.1 * SR)), one(0.2, 50) * 0.75]), 260)
def thunder(**_):
    d = 3.0; t = tt(d); x = lp(noise(d), 380) * (np.exp(-t * 1.4) * (1 + 0.6 * np.sin(t * 9))) + bp(noise(d), 400, 2500) * np.exp(-t * 18) * 0.6
    return np.tanh(x * 1.5)
def tear(**_): t = tt(2.0); return (np.sin(2 * np.pi * 1568 * t) + 0.4 * np.sin(2 * np.pi * 2349 * t)) * env(len(t), 0.003, 4)
def chime(n=0, **_):
    m = [72, 74, 76, 79, 81, 84, 86][n % 7]; return piano(m + 12, 0.5, 2.5) + piano(m + 24, 0.2, 2.5)
def shimmer(d=1.4, **_):
    x = np.zeros(int((d + 2) * SR))
    for k, m in enumerate([84, 88, 91, 96, 91, 88, 93, 96]): put(x, k * d / 8, piano(m, 0.25, 1.8))
    return x
def birds(d=2.5, **_):
    x = np.zeros(int(d * SR))
    for i in range(7):
        st = rng.uniform(0, d - 0.3); f0 = rng.uniform(2400, 3400); dd = rng.uniform(0.06, 0.12); t = tt(dd)
        put(x, st, np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.3 * np.sin(t / dd * np.pi * 2))) / SR) * np.sin(np.pi * t / dd) ** 2)
    return x
def reveal(d=1.6, **_):
    t = tt(d + 1.5); x = pad([60, 64, 67, 72], d + 1.5, 1.0, 2600, att=0.25, rel=1.2); return x + lp(noise(d + 1.5), 2000) * np.exp(-t * 2.5) * 0.15
def tick(d=1.0, **_):
    x = np.zeros(int(d * SR) + SR // 4); k = 0
    for st in np.arange(0, d, 0.14): put(x, st, (np.sin(2 * np.pi * 900 * tt(0.05)) * env(int(0.05 * SR), 0.001, 12)) * (0.6 if k % 2 else 1)); k += 1
    return lp(x, 2500)

def alarm(d=1.2, **_):
    x = np.zeros(int(d * SR) + SR // 4)
    for st in np.arange(0, d, 0.3):
        for k in range(2): put(x, st + k * 0.1, np.sin(2 * np.pi * 1320 * tt(0.07)) * env(int(0.07 * SR), 0.004, 4))
    return lp(x, 2600)
def roar(d=1.4, **_):
    t = tt(d); n = lp(noise(d), 700) * (1 + 0.8 * np.sin(2 * np.pi * 28 * t)); g = signal.sawtooth(2 * np.pi * (95 - 25 * t / d) * t) * 0.5
    e = np.minimum(1, t / 0.15) * np.exp(-np.maximum(0, t - 0.5) * 3); return np.tanh(lp(n + g, 1200) * e * 1.6)
def gallop(d=2.0, rate=0.11, **_):
    x = np.zeros(int(d * SR) + SR // 4); k = 0
    for st in np.arange(0, d, rate): put(x, st, lp(noise(0.05), 400) * env(int(0.05 * SR), 0.001, 9) * (1 if k % 4 < 2 else 0.6)); k += 1
    return x
def flap(d=1.0, **_):
    x = np.zeros(int(d * SR) + SR // 4)
    for st in np.arange(0, d, 0.16): put(x, st, bp(noise(0.1), 300, 1800) * np.sin(np.pi * np.linspace(0, 1, int(0.1 * SR))) ** 2)
    return x
def growl(**_):
    d = 1.1; t = tt(d); return lp(noise(d), 180) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / d)
def pop(**_): t = tt(0.12); return lp(np.sin(2 * np.pi * np.cumsum(600 * np.exp(-t * 18) + 220) / SR) * env(len(t), 0.002, 6), 3000)

def tock(**_): t = tt(0.12); return lp((np.sin(2 * np.pi * 520 * t) + 0.4 * np.sin(2 * np.pi * 1040 * t)) * env(len(t), 0.001, 10), 2500)

def boing(**_):
    d = 0.42; t = tt(d); f = 200 * (1 + 0.6 * t / d) * (1 + 0.08 * np.sin(2 * np.pi * 18 * t))
    return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 4), 2000)
def zip_(**_):
    d = 0.32; n = bp(noise(d), 400, 3000); k = np.linspace(0, 1, len(n)); s_ = np.sin(2 * np.pi * np.cumsum(300 * (3.6 ** (k))) / SR)
    return (n / (np.abs(n).max() + 1e-9) * 0.35 + s_ * 0.12) * np.sin(np.pi * k) ** 1.2

FX = dict(boing=boing, zip=zip_, tock=tock, alarm=alarm, roar=roar, gallop=gallop, flap=flap, growl=growl, pop=pop, whoosh=whoosh, whip=whip, thump=thump, swell=swell, riser=riser, boom=boom, crack=crack, cut=cut, drone=drone, rain=rain_, rain_out=rain_out,
          heart=heart, thunder=thunder, tear=tear, chime=chime, shimmer=shimmer, birds=birds, reveal=reveal, tick=tick)
LEVEL = dict(boing=-18, zip=-17, tock=-20, alarm=-24, roar=-12, gallop=-17, flap=-22, growl=-16, pop=-18, whoosh=-20, whip=-17, thump=-16, swell=-22, riser=-19, boom=-6, crack=-15, cut=-99, drone=-20, rain=-25, rain_out=-25, heart=-9, thunder=-10,
             tear=-26, chime=-19, shimmer=-23, birds=-28, reveal=-21, tick=-28)
REVERB_SEND = {'chime', 'shimmer', 'tear', 'reveal', 'whip', 'thump'}

sfx = np.zeros(N); send = np.zeros(N)
for c in cj['cues']:
    fn = FX.get(c['type'])
    if not fn: print('unknown cue', c['type']); continue
    kw = {}
    if c.get('dur'): kw['d'] = c['dur']
    if 'n' in c: kw['n'] = c['n']
    if 'rate' in c: kw['rate'] = c['rate']
    x = fn(**kw); x = x / (np.abs(x).max() + 1e-9) * db(LEVEL[c['type']]) * c.get('gain', 1.0)
    put(sfx, c['t'], x);
    if c['type'] in REVERB_SEND: put(send, c['t'], x * 0.8)
sfx = sfx + reverb(send, 2.6, 1.0, seed=3) * 0.6

# ───────── voice ─────────
def load(f):
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(f), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(np.float64)
SCRIPT = json.loads((P / 'script.json').read_text()); LEAD = int(SCRIPT.get('lead', 0) * SR)
v = load(P / 'data/narration.wav'); voice = np.zeros(N); n_ = max(0, min(N - LEAD, len(v))); voice[LEAD:LEAD + n_] = v[:n_]
if SCRIPT.get('voice_gate'):   # downward expander: pauses (room noise / faint music in the source) drop by up to 10 dB
    thr = db(SCRIPT['voice_gate']); lv_ = signal.lfilter([1 - 0.998], [1, -0.998], np.abs(voice)); g_ = np.clip(lv_ / thr, db(-10), 1) ** 1.0
    voice *= signal.lfilter([1 - 0.999], [1, -0.999], g_)
voice = hp(voice, 85)
# gentle compression for presence
lev = signal.lfilter([1 - 0.995], [1, -0.995], np.abs(voice)); gr = np.minimum(1, (db(-26) / (lev + 1e-6)) ** 0.35); voice *= gr
vv = voice[np.abs(voice) > 1e-6]; voice *= (db(-17) / (np.sqrt(np.mean(vv ** 2)) + 1e-9)) if len(vv) else 0

# music ducks under the voice
vl = signal.lfilter([1 - 0.9993], [1, -0.9993], np.abs(voice)); vl /= vl.max() + 1e-9
MUSIC_DB = -21   # music peak level; the user asked for the music well under the voice (was -13)
score_n = score / (np.abs(score).max() + 1e-9) * db(MUSIC_DB)
score_n *= (1 - 0.6 * np.clip(vl * 3.5, 0, 1))

mix = voice + score_n + sfx
L = mix + np.concatenate([np.zeros(int(0.011 * SR)), score_n[:-int(0.011 * SR)]]) * 0.12   # a touch of stereo width on the music
R = mix + np.concatenate([np.zeros(int(0.017 * SR)), score_n[:-int(0.017 * SR)]]) * 0.12
st = np.stack([L, R], 1)
st = np.tanh(st * 1.1) / 1.1; st *= db(-1) / (np.abs(st).max() + 1e-9)
from scipy.io import wavfile
wavfile.write(P / 'data/mix.wav', SR, (st[: int(DUR * SR)] * 32767).astype(np.int16))
print(f"data/mix.wav {DUR:.2f}s · {len(cj['cues'])} cues")
