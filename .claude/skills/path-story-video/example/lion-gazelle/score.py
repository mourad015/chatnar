# قاعدة الغزالة والأسد — the score. Runs inside tools/mix.py (put, piano, pad, arp, bass, chordpad, kick, tom, shaker, CH, SR in scope).
CH.update({ 'Em': [40, 55, 59, 64], 'Dm': [38, 53, 57, 62], 'Asus': [45, 57, 62, 64] })
PENTA = [69, 72, 74, 76, 79, 81, 84]

# A · the proverb (0 – 3.4): pentatonic plucks over a soft A drone, like a zither
put(padb, 0.0, pad([45, 52, 57], 3.8, 0.08, 900, att=0.8))
for k, (t, i) in enumerate([(0.15, 0), (0.45, 2), (0.75, 4), (1.05, 3), (1.6, 5), (1.9, 4), (2.35, 2), (2.8, 3), (3.1, 1)]):
    put(mus, t, piano(PENTA[i], 0.3, 1.6, False)); put(mus, t + 0.05, piano(PENTA[i] + 12, 0.08, 0.8, True))

# B · the gift (3.4 – 8.1): warm, open, pentatonic arpeggios
for t0, t1, ch in [(3.4, 5.15, 'C'), (5.15, 6.85, 'Am'), (6.85, 8.1, 'F')]:
    bass(t0, ch, 0.32); arp(t0, t1, ch, 0.29, 0.2); chordpad(t0, t1, ch, 0.07, 1300)
for t, m in [(3.82, 76), (5.62, 79), (6.9, 81), (7.4, 79)]: put(mus, t, piano(m, 0.3, 3))

# C · waiting, "not in her lap" (8.1 – 11.6): suspended, sparse
chordpad(8.1, 11.6, 'Asus', 0.07, 900)
for t, m in [(8.62, 74), (9.27, 76), (10.67, 74), (11.23, 72)]: put(mus, t, piano(m, 0.26, 2.5))

# D · the bird works (11.6 – 17.9): drive — arpeggios, kick, shaker, building
seq = [(11.6, 'Am'), (13.0, 'F'), (14.2, 'C'), (15.15, 'G'), (16.45, 'C'), (17.0, 'F')]
for k, (t0, ch) in enumerate(seq):
    t1 = seq[k + 1][0] if k + 1 < len(seq) else 17.95
    bass(t0, ch, 0.42); arp(t0, t1, ch, 0.16, 0.16 + k * 0.025); chordpad(t0, t1, ch, 0.06 + k * 0.012, 1600)
t = 11.65
while t < 17.9:
    kick(t, 0.5 + 0.3 * (t - 11.6) / 6); shaker(t + 0.21, 0.2); t += 0.43
put(mus, 16.49, piano(84, 0.45, 3)); put(mus, 16.49, piano(88, 0.3, 3)); put(mus, 16.49, piano(91, 0.25, 3))

# E · the lion and the gazelle (18.0 – 27.25): tribal chase — toms, low strings, minor
put(padb, 18.0, pad([33, 40, 45], 9.4, 0.14, 700, att=0.4))
seq = [(18.0, 'Am'), (19.75, 'F'), (21.95, 'G'), (24.15, 'Em'), (25.5, 'F'), (26.7, 'G')]
for k, (t0, ch) in enumerate(seq):
    t1 = seq[k + 1][0] if k + 1 < len(seq) else 27.25
    chordpad(t0, t1, ch, 0.07, 1100); arp(t0, t1, ch, 0.215, 0.13, up=0, pat=(0, 1, 2, 1))
t, k = 18.0, 0
while t < 27.2:
    tom(t, 45 if k % 4 == 0 else 50 if k % 4 == 2 else 57, 0.55 if k % 2 == 0 else 0.3)
    if k % 2 == 0: kick(t, 0.6)
    shaker(t + 0.107, 0.18); t += 0.215; k += 1
for t, m in [(18.0, 69), (20.5, 76), (22.5, 72), (25.14, 77), (25.93, 79)]: put(mus, t, piano(m, 0.35, 2.2))

# F · eaten / starves (27.25 – 30.0): near silence, then a hungry, sparse lament
for t, m in [(28.55, 64), (29.0, 60), (29.5, 57)]: put(mus, t, piano(m, 0.25, 3))
chordpad(28.5, 30.0, 'Am', 0.05, 700)

# G · morning (30.0 – 33.25): soft dawn, rising
for t0, t1, ch in [(30.0, 31.5, 'C'), (31.5, 32.6, 'Am'), (32.6, 33.25, 'G')]:
    bass(t0, ch, 0.3); arp(t0, t1, ch, 0.18, 0.16 + (t0 - 30) * 0.03); chordpad(t0, t1, ch, 0.06 + (t0 - 30) * 0.015, 1500)

# H · RUN! (33.25 – 37.2): full energy
seq = [(33.25, 'C'), (34.2, 'G'), (35.15, 'Am'), (36.1, 'F')]
for k, (t0, ch) in enumerate(seq):
    t1 = seq[k + 1][0] if k + 1 < len(seq) else 37.15
    bass(t0, ch, 0.5); arp(t0, t1, ch, 0.12, 0.26); chordpad(t0, t1, ch, 0.13, 2300); chordpad(t0, t1, ch, 0.05, 2600, 12)
t = 33.25
while t < 37.1: kick(t, 0.85); tom(t + 0.215, 50, 0.3); shaker(t + 0.107, 0.25); shaker(t + 0.32, 0.2); t += 0.43
for t, m in [(33.27, 84), (34.2, 83), (34.7, 81), (35.15, 79), (35.7, 84), (36.1, 86), (36.5, 88)]: put(mus, t, piano(m, 0.45, 2.5)); put(mus, t, piano(m - 12, 0.22, 2.5))

# I · the world's competition, frustration (37.2 – 40.7): thin, grey, minor
chordpad(37.2, 40.7, 'Am', 0.06, 650); chordpad(39.2, 40.7, 'Dm', 0.05, 600)
for t, m in [(37.7, 69), (38.46, 67), (39.62, 64), (39.9, 63)]: put(mus, t, piano(m, 0.24, 2.6))
t = 37.2
while t < 40.6: put(mus, t, piano(45, 0.18, 0.5, True)); t += 0.43

# J · he turns to the light → end (40.7 – 44.2)
for k, m in enumerate([67, 69, 71, 72]): put(mus, 40.75 + k * 0.17, piano(m, 0.3, 2))
bass(41.45, 'C', 0.55, 3); chordpad(41.45, 43.6, 'Cadd9', 0.14, 2400); chordpad(41.45, 43.6, 'C', 0.06, 2600, 12)
for t, m in [(41.45, 84), (41.9, 86), (42.35, 88), (42.8, 91)]: put(mus, t, piano(m, 0.42, 3)); put(mus, t, piano(m - 12, 0.2, 3))
kick(41.45, 0.9)

def post(score):
    # "or she gets eaten": the music drops out under the heartbeat
    a, b = int(27.28 * SR), int(28.5 * SR)
    score[a:a + int(0.04 * SR)] *= np.linspace(1, 0.05, int(0.04 * SR)); score[a + int(0.04 * SR):b] *= 0.05
    score[b - int(0.2 * SR):b] *= np.linspace(1, 3, int(0.2 * SR))
    return score
