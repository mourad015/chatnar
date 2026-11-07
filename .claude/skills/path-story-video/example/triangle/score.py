# قاعدة في الحياة · أين تجد الراحة النفسية؟ — the score. All times are absolute (the series intro is LEAD seconds long).
O = SCRIPT_LEAD = 1.8   # same as script.json "lead"
CH.update({ 'Em': [40, 55, 59, 64], 'Dm': [38, 53, 57, 62], 'Asus': [45, 57, 62, 64] })

# Series sting (0 – 1.8): a warm gold chord + rising notes — the same opening every episode
put(padb, 0.0, pad([48, 55, 60, 64, 67], 2.4, 0.11, 2000, att=0.3, rel=0.9))
for k, m in enumerate([72, 76, 79, 84]): put(mus, 0.12 + k * 0.16, piano(m, 0.32, 2.2))
kick(0.05, 0.7)

# A · burdens (1.8 – 5.5): heavy, slow minor piano in the drizzle
for t0, t1, ch in [(O + 0.3, O + 1.5, 'Am'), (O + 1.5, O + 3.0, 'F'), (O + 3.0, O + 3.75, 'E')]:
    bass(t0, ch, 0.36, 3); chordpad(t0, t1, ch, 0.06, 700)
for t, m in [(O + 0.64, 64), (O + 1.81, 65), (O + 3.25, 59)]: put(mus, t, piano(m, 0.3, 3)); put(mus, t + 0.4, piano(m - 5, 0.2, 2.5))
# B · three things → one (5.5 – 7.3): suspension that opens into light
chordpad(O + 3.75, O + 4.75, 'Asus', 0.07, 900)
for k, m in enumerate([69, 72, 76]): put(mus, O + 3.8 + k * 0.3, piano(m, 0.26, 2))
# C · closer to God (7.3 – 9.3): warm major opens
for t0, t1, ch in [(O + 4.75, O + 6.2, 'C'), (O + 6.2, O + 7.45, 'F')]: bass(t0, ch, 0.35); arp(t0, t1, ch, 0.24, 0.18); chordpad(t0, t1, ch, 0.08, 1500)
# D · pain → يا رب (9.3 – 11.9): a held note, then a glowing chord on "O Lord"
chordpad(O + 7.45, O + 8.5, 'Am', 0.05, 700); put(mus, O + 7.87, piano(57, 0.3, 2))
chordpad(O + 8.5, O + 10.2, 'Fmaj7', 0.11, 2000); bass(O + 8.5, 'Fmaj7', 0.4)
for k, m in enumerate([77, 81, 84]): put(mus, O + 8.86 + k * 0.12, piano(m, 0.32, 3))
# E · the three things (12.0 – 20.5): gentle, purposeful explainer pulse
seq = [(O + 10.2, 'C'), (O + 11.7, 'Am'), (O + 13.75, 'F'), (O + 14.5, 'G'), (O + 16.45, 'C'), (O + 17.75, 'F')]
for k, (t0, ch) in enumerate(seq):
    t1 = seq[k + 1][0] if k + 1 < len(seq) else O + 18.75
    bass(t0, ch, 0.34); arp(t0, t1, ch, 0.2, 0.15); chordpad(t0, t1, ch, 0.06, 1400)
t = O + 10.2
while t < O + 18.7: kick(t, 0.35); shaker(t + 0.2, 0.14); t += 0.8
# F · the triangle (20.5 – 33.0): wonder, building corner by corner
seq = [(O + 18.75, 'Am'), (O + 20.0, 'F'), (O + 22.2, 'C'), (O + 25.0, 'G'), (O + 27.2, 'Am'), (O + 28.75, 'F'), (O + 29.75, 'G')]
for k, (t0, ch) in enumerate(seq):
    t1 = seq[k + 1][0] if k + 1 < len(seq) else O + 31.2
    bass(t0, ch, 0.38); arp(t0, t1, ch, 0.18, 0.17 + k * 0.01); chordpad(t0, t1, ch, 0.07 + k * 0.008, 1700)
for t, m in [(O + 20.7, 84), (O + 23.75, 79), (O + 27.61, 81), (O + 30.0, 83)]: put(mus, t, piano(m, 0.36, 3))
t = O + 18.75
while t < O + 31.1: kick(t, 0.45); shaker(t + 0.2, 0.16); t += 0.4
# G · the wheel turns (33.0 – 35.8): accelerating build
for t0, t1, ch in [(O + 31.2, O + 32.7, 'Am'), (O + 32.7, O + 33.5, 'F'), (O + 33.5, O + 34.0, 'G')]:
    bass(t0, ch, 0.45); arp(t0, t1, ch, 0.12, 0.22, cres=0.6); chordpad(t0, t1, ch, 0.1, 2300)
t, step = O + 31.2, 0.4
while t < O + 33.95: kick(t, 0.6); tom(t + step / 2, 50, 0.3); t += step; step = max(0.18, step * 0.9)
# H · abundance (35.8 – end): full major, open, then the series chord
for t0, t1, ch in [(O + 34.0, O + 35.5, 'C'), (O + 35.5, O + 37.0, 'G'), (O + 37.0, O + 38.6, 'Fmaj7')]:
    bass(t0, ch, 0.5, 3); arp(t0, t1, ch, 0.15, 0.26); chordpad(t0, t1, ch, 0.13, 2400); chordpad(t0, t1, ch, 0.05, 2600, 12)
for t, m in [(O + 34.0, 84), (O + 34.39, 88), (O + 34.9, 91), (O + 35.6, 88), (O + 36.3, 86), (O + 37.0, 84)]: put(mus, t, piano(m, 0.42, 3)); put(mus, t, piano(m - 12, 0.2, 3))
kick(O + 34.0, 0.9)
put(padb, O + 38.4, pad(CH['Cadd9'], 2.0, 0.1, 1800, rel=1.4)); bass(O + 38.4, 'C', 0.45, 2.5)
for m in CH['Cadd9']: put(mus, O + 38.45, piano(m + 12, 0.22, 2.5))
