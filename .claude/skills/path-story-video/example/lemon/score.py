# قاعدة في الحياة · اللي جواك… هيطلع — score. Times are absolute (series intro = O seconds).
O = 1.8
CH.update({ 'Em': [40, 55, 59, 64], 'Dm': [38, 53, 57, 62], 'Asus': [45, 57, 62, 64], 'D7': [38, 54, 57, 60] })

# Series sting
put(padb, 0.0, pad([48, 55, 60, 64, 67], 2.4, 0.11, 2000, att=0.3, rel=0.9))
for k, m in enumerate([72, 76, 79, 84]): put(mus, 0.12 + k * 0.16, piano(m, 0.32, 2.2))
kick(0.05, 0.7)

# A · the lemon story (0.45 – 13.7 raw): bouncy, playful — muted "pizzicato" piano on a light kick
seq = [(O + 0.3, 'C'), (O + 2.0, 'F'), (O + 3.9, 'G'), (O + 5.75, 'C'), (O + 7.4, 'F'), (O + 8.75, 'G'), (O + 10.45, 'Am'), (O + 12.5, 'D7')]
for k, (t0, ch) in enumerate(seq):
    t1 = seq[k + 1][0] if k + 1 < len(seq) else O + 13.7
    bass(t0, ch, 0.34, 1.2); arp(t0, t1, ch, 0.21, 0.2, pat=(0, 2, 1, 3), mute=True); chordpad(t0, t1, ch, 0.04, 1200)
t = O + 0.3
while t < O + 13.6: kick(t, 0.32); shaker(t + 0.21, 0.14); t += 0.42
for t, m in [(O + 1.19, 79), (O + 7.83, 76), (O + 8.32, 79)]: put(mus, t, piano(m, 0.32, 1.5))
for t, m in [(O + 9.57, 66), (O + 11.51, 65)]: put(mus, t, piano(m, 0.26, 1.0, True))   # wrong-note "nope" plinks
for k in range(6): put(mus, O + 12.63 + k * 0.17, piano(64 + k * 2, 0.24, 0.6, True))   # straining run up
# B · "impossible" (13.75 – 14.45): a beat of near-silence. C · "lemon!" (14.5): a bright hit
for m in [60, 64, 67, 72, 76]: put(mus, O + 15.29, piano(m, 0.32, 2.5))
kick(O + 15.29, 0.8)
# D · what's inside you (16.0 – 21.7): reflective, a little mysterious
for t0, t1, ch in [(O + 16.0, O + 17.75, 'Am'), (O + 17.75, O + 19.25, 'F'), (O + 19.25, O + 20.5, 'Dm'), (O + 20.5, O + 21.75, 'E')]:
    bass(t0, ch, 0.34, 3); arp(t0, t1, ch, 0.24, 0.16); chordpad(t0, t1, ch, 0.07, 1300)
for t, m in [(O + 17.02, 76), (O + 18.63, 72), (O + 20.03, 74), (O + 21.42, 71)]: put(mus, t, piano(m, 0.3, 3))
# E · love + forgiveness (21.75 – 25.15): warm, major, open
for t0, t1, ch in [(O + 21.75, O + 22.5, 'F'), (O + 22.5, O + 23.75, 'C'), (O + 23.75, O + 24.25, 'F'), (O + 24.25, O + 25.2, 'C')]:
    bass(t0, ch, 0.42, 2.5); arp(t0, t1, ch, 0.15, 0.24); chordpad(t0, t1, ch, 0.11, 2200); chordpad(t0, t1, ch, 0.04, 2600, 12)
for t, m in [(O + 23.22, 84), (O + 23.5, 88), (O + 24.67, 86), (O + 24.9, 91)]: put(mus, t, piano(m, 0.4, 3))
# F · the insult (25.25 – 31.45): tense low stabs
put(padb, O + 25.25, pad([33, 40, 45, 46], 6.3, 0.13, 700, att=0.6))
t = O + 25.3
while t < O + 31.3: put(mus, t, piano(33, 0.34, 0.6, True)); put(mus, t + 0.02, piano(45, 0.22, 0.5, True)); t += 0.43
for t, m in [(O + 27.45, 63), (O + 29.32, 62), (O + 30.71, 61)]: put(mus, t, piano(m, 0.3, 2))
# G · punchline (31.5 – 34.0): comic "wah-wah" descending, then a cheeky resolve
for k, m in enumerate([67, 66, 65, 64]): put(mus, O + 33.0 + k * 0.22, piano(m, 0.34, 0.9 if k < 3 else 2.0))
for k, m in enumerate([55, 54, 53, 52]): put(mus, O + 33.0 + k * 0.22, piano(m, 0.24, 0.9 if k < 3 else 2.0))
# H · end (34.0 – end): warm return to the opening groove, series chord
for t0, t1, ch in [(O + 34.1, O + 35.4, 'F'), (O + 35.4, O + 36.6, 'C')]:
    bass(t0, ch, 0.4); arp(t0, t1, ch, 0.21, 0.22, pat=(0, 2, 1, 3)); chordpad(t0, t1, ch, 0.1, 2000)
put(padb, O + 36.2, pad(CH['Cadd9'], 2.0, 0.1, 1800, rel=1.4)); bass(O + 36.2, 'C', 0.45, 2.5)
for m in CH['Cadd9']: put(mus, O + 36.25, piano(m + 12, 0.22, 2.5))

def post(score):
    a, b = int((O + 13.72) * SR), int((O + 14.48) * SR)          # the "impossible" beat
    score[a:b] *= 0.12
    return score
