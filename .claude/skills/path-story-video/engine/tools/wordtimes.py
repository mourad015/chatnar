"""Per-word timing from the voice itself (no speech model needed).
  python3 tools/wordtimes.py [project=.]
Reads data/narration.wav and script.json lines ({s, e, ar}); inside each line it finds the voiced frames and spreads the
words over them by letter count, then writes each line's "wt" (start time of every word) back into script.json.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
P = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', str(P / 'data/narration.wav'), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout, dtype=np.float32)
hop = 160; n = len(a) // hop
db = 20 * np.log10(np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(n)]) + 1e-9)
db = np.convolve(db, np.ones(3) / 3, 'same')
s = json.loads((P / 'script.json').read_text())
for ln in s['lines']:
    i0, i1 = int(ln['s'] * 100), int(ln['e'] * 100); seg = db[i0:i1]; thr = max(seg.max() - 24, -45)
    mask = (seg > thr).astype(float); cum = np.cumsum(mask); tot = cum[-1] if cum[-1] > 0 else 1
    words = ln['ar'].split(); wts = [len(w.replace('*', '')) + 1.5 for w in words]; W = sum(wts); acc = 0; out = []
    for w, wt in zip(words, wts):
        k = int(np.searchsorted(cum, acc / W * tot + 0.5)); out.append(round((i0 + min(k, len(seg) - 1)) / 100, 3)); acc += wt
    ln['wt'] = out
    print(f"{ln['s']:6.2f}  " + '  '.join(f"{w.replace('*', '')}@{t:.2f}" for w, t in zip(words, out)))
(P / 'script.json').write_text(json.dumps(s, ensure_ascii=False, indent=1))
