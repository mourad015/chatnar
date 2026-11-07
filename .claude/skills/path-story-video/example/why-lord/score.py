# ليه يا رب؟ — the score, section by section, following the story (see STYLE.md "Sound").
# Runs inside tools/mix.py: put, piano, pad, arp, bass, chordpad, CH, mus, padb, SR are in scope.

# A · hope (0 – 5.35)
for t0, t1, ch in [(0.15, 1.75, 'Fmaj7'), (1.75, 3.45, 'C'), (3.45, 4.45, 'Am'), (4.45, 5.35, 'G')]:
    bass(t0, ch, 0.35); arp(t0, t1, ch, 0.28, 0.24); chordpad(t0, t1, ch, 0.07, 1200)
for t, m in [(0.5, 76), (1.8, 79), (2.9, 76), (3.5, 74), (4.5, 72)]: put(mus, t, piano(m, 0.3, 3))
# routine (5.35 – 6.33): muted, mechanical, same two notes
t = 5.35
while t < 6.3: put(mus, t, piano(60, 0.22, 0.4, True)); put(mus, t + 0.14, piano(67, 0.16, 0.4, True)); t += 0.28
# SUDDENLY (6.35): nothing. The boom lives in the sfx.
# B · confusion (7.1 – 11.6): low drone + heartbeat-tempo pulse, dissonant accents
put(padb, 7.0, pad([33, 40, 45], 4.8, 0.16, 500, att=1.2), 1.0)
t = 7.15
while t < 11.55: put(mus, t, piano(33, 0.28, 1.2)); t += 0.86
for t, m in [(7.4, 70), (9.3, 71), (10.7, 70), (10.97, 66)]: put(mus, t, piano(m, 0.22, 2.5))
# C · despair (11.6 – 16.4): solo piano melody over soft strings, in the rain
for t0, t1, ch in [(11.6, 13.4, 'Am'), (13.4, 14.65, 'F'), (14.65, 15.15, 'E'), (15.15, 16.45, 'Am')]: chordpad(t0, t1, ch, 0.06, 900); bass(t0, ch, 0.3, 3)
for t, m, v in [(11.75, 76, 0.32), (12.45, 72, 0.26), (12.95, 74, 0.26), (13.45, 69, 0.3), (13.8, 77, 0.3), (14.42, 76, 0.24), (14.66, 83, 0.36), (15.2, 72, 0.28), (15.55, 74, 0.28), (15.95, 76, 0.32)]:
    put(mus, t, piano(m, v, 3.2))
# D · walking on (16.4 – 18.6): arpeggios return and build
for t0, t1, ch in [(16.4, 17.0, 'Am'), (17.0, 17.6, 'F'), (17.6, 18.1, 'C'), (18.1, 18.62, 'G')]:
    arp(t0, t1, ch, 0.15, 0.18 + (t0 - 16.4) * 0.05); chordpad(t0, t1, ch, 0.05 + (t0 - 16.4) * 0.025, 1200)
bass(16.4, 'Am', 0.3); bass(17.6, 'C', 0.35)
# E · the look back / glory (18.65 – 21.95): full major, strings, melody up high
for t0, t1, ch in [(18.65, 19.4, 'C'), (19.4, 20.1, 'G'), (20.1, 20.7, 'Am'), (20.7, 21.95, 'F')]:
    bass(t0, ch, 0.5, 3); arp(t0, t1, ch, 0.14, 0.3); chordpad(t0, t1, ch, 0.13, 2200); chordpad(t0, t1, ch, 0.06, 2600, 12)
for t, m, v in [(18.66, 79, 0.42), (19.4, 76, 0.4), (19.75, 79, 0.36), (20.05, 81, 0.4), (20.71, 84, 0.5), (21.3, 83, 0.38), (21.6, 81, 0.36)]: put(mus, t, piano(m, v, 3.5)); put(mus, t, piano(m - 12, v * 0.5, 3.5))
# F · resolve (21.95 – 26)
for t0, t1, ch in [(21.95, 23.45, 'Fmaj7'), (23.45, 24.68, 'C')]:
    bass(t0, ch, 0.4, 3.5); arp(t0, t1, ch, 0.28, 0.22); chordpad(t0, t1, ch, 0.09, 1600)
for t, m in [(22.3, 77), (22.9, 76), (23.5, 74), (23.95, 72)]: put(mus, t, piano(m, 0.32, 3.2))
put(padb, 24.68, pad(CH['Cadd9'], 1.6, 0.1, 1500, rel=1.2)); bass(24.68, 'C', 0.45, 2.5)
for m in CH['Cadd9']: put(mus, 24.7, piano(m + 12, 0.22, 2.5))


def post(score):
    # hard stop into silence for "وفجأة!" (the boom is a sound effect)
    score[int(6.33 * SR):int(6.36 * SR)] *= np.linspace(1, 0, int(6.36 * SR) - int(6.33 * SR))   # hard stop for "suddenly"
    score[int(6.36 * SR):int(7.0 * SR)] *= 0.04
    return score
