"""Mix: the voiceover on top, a low military drone + slow pulse under it, a sub hit + radio blip at each new file, stamp thumps. Bed ducks under the voice."""
import sys, wave, subprocess
import numpy as np
SR = 48000; vo_path, out_path = sys.argv[1], sys.argv[2]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
vo = np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float32) / 32768
N = len(vo); DUR = N / SR; bed = np.zeros(N); rng = np.random.default_rng(1)
def tt(d): return np.arange(int(d * SR)) / SR
def place(sig, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); bed[i:j] += sig[: j - i] * g
t = tt(DUR)
drone = (np.sin(2 * np.pi * 41.2 * t) + .6 * np.sin(2 * np.pi * 61.7 * t) + .3 * np.sin(2 * np.pi * 82.4 * t * (1 + .002 * np.sin(t * .2))))
drone *= .55 + .45 * np.sin(2 * np.pi * t / 23) ** 2
bed += drone * .05
# slow pulse every 1.6 s
for k in np.arange(0, DUR, 1.6):
    d = tt(.5); place(np.sin(2 * np.pi * np.cumsum(48 + 30 * np.exp(-d * 20)) / SR) * np.exp(-d * 9), k, .09)
def hit(t0, g=.5):
    d = tt(1.4); place(np.sin(2 * np.pi * np.cumsum(32 + 60 * np.exp(-d * 12)) / SR) * np.exp(-d * 3), t0, g)
def blip(t0):
    for i in range(3):
        d = tt(.06); place(np.sin(2 * np.pi * (1800 + i * 300) * d) * np.exp(-d * 30), t0 + i * .08, .07)
def thump(t0):
    d = tt(.3); n = rng.standard_normal(len(d)); place((np.sin(2 * np.pi * 80 * d) + .4 * n) * np.exp(-d * 22), t0, .25)
for c in [59.8, 115, 222, 270, 349.7, 419.7, 482.3]: hit(c, .45); blip(c + .05)
for s in [37.6, 57.2, 77.4, 258.8, 259.05, 259.3, 268.2, 308.9, 328.5]: thump(s)
# duck the bed under the voice
env = np.abs(vo).mean(1); k = int(.25 * SR); env = np.convolve(env, np.ones(k) / k, mode='same'); duck = 1 - .55 * np.clip(env / (env.max() * .25), 0, 1)
mix = vo * 1.0 + (bed * duck)[:, None]
mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
mix = mix / max(1e-9, np.abs(mix).max()) * .95
with wave.open(out_path, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
