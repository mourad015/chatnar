# Motion language

## Principles (applied in every piece)
- **Restraint:** one idea per scene, one red accent at a time, generous navy space.
- **Staging:** introduce elements in a clear order (mark → name → detail); stagger 60–120 ms per item.
- **Overlap:** next element starts before the previous one settles.
- **Hold:** give the final lockup at least 1.5 s of stillness before ending.
- **Secondary motion:** slow camera push-in (scale ~0.965 → 1.0 across the shot), subtle breathing/float on idle shapes.

## Easing (from the templates)
- Entries: `outExpo` (1 − 2^(−10x)) or `outQuart`.
- Pops (icons, buttons, pills): `outBack` with overshoot 1.3–1.8.
- Transitions and wipes: `inOutExpo` / `inOutCubic`.
- Fades: `outCubic` in, `inOutSine` out.
- Never linear except for playheads and timecodes.

## Signature moves
| Move | Recipe |
|---|---|
| Mask rise | Text clipped to its own line box, enters from 1.25× its size below, 0.8–0.9 s outExpo |
| Tracking settle | Letter-spacing from +0.14 em to 0 over ~1.6 s outCubic, alongside the rise |
| Bolt wipe | Forward-leaning (skewX −18°) clip reveals the bolt left→right, 0.9 s inOutCubic, plus 14-unit slide settle |
| Light streak | Thin red→white line runs along the bolt angle (~30°) just before the wipe |
| Glint | One soft white band (55% peak) skewed −30° passes once across the mark, 0.8 s |
| Panel wipe | Two skewed full-height panels (navy-2 trailing, red leading) sweep across in 0.8 s; scene swaps under full cover |
| Iris | Red circle closes to full screen then opens as a hole into the next scene, 0.9 s |
| Star spin-in | Novary star scales with outBack and rotates from −135° to 0, plus one expanding red ring |
| Pixel resolve | Generated images go from noise to sharp by shrinking pixel block size 40 → 1 |

## Timing grid
- 120 BPM: beat 0.5 s, bar 2 s. Scene changes on bar lines; transition midpoint exactly on the downbeat.
- Outro (5 s): fade up 0–0.45 · streak 0.2–0.8 · bolt 0.45–1.35 · name 1.0–2.05 · ™ 2.0–2.6 · glint 2.15–2.95 · hold to 4.45 · fade 4.45–5.0.
- Promo (40 s): hook 0–4 · logo 4–8 · services 8–32 (6 s each) · recap 32–36 · end card 36–40.

## Sound design
Every visual hit has a sound: whoosh before wipes, low impact on logo landings, soft chime on the glint, pad chord under holds. Music in A minor (Am–F–C–G), kick sidechain-ducking the pad and bass. Master peak around −1 dBFS; always also export a silent version.
