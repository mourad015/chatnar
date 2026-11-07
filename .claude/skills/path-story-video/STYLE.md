# Path Story — the style bible

Emotional, cinematic, hand-made motion graphics. A stick-figure hero lives through the speaker's words in one continuous
world. The camera is always moving, colour carries the emotion, words land as they're spoken, and the music tells the
same story as the pictures. Reference: `example/why-lord/` (ليه يا رب؟, 26 s, 14 shots).

## 1. Story rules
- **One metaphor for the whole talk**, visual and literal (a path, a seed, a storm, a door, a bridge…). Every shot is a
  moment of that metaphor, never a random illustration. The ending reframes the beginning (the obstacle was the gift,
  the zigzag was the way up).
- **One hero** in **one world**: the same landscape seen at different times and from different angles (side view,
  bird's-eye map, close-up). Revisit earlier places in the reveal.
- **An emotional arc**, even in 20 seconds: comfort → disruption → struggle → lowest point → turn → revelation → peace.
- Show feelings through the body: scale (tiny and alone in a vast frame = loneliness), weather, light, eyes, a tear.
- Religious content: show light, sky, gratitude, prayer-like gestures; never depict God or prophets.

## 2. The hero (`src/fig.js`)
- Ink-black stick figure (`#15151B`) with a **red scarf** (`#E0483E`) that reacts to wind (`wind` 0 = drooping/sad,
  0.9 = flying/joy). The scarf is his signature: keep it in every shot, even on the map (`mapHero`).
- Big white eyes do the acting, with glints, lids and brows. Moods: calm, smile, happy, bliss, awe, sad, hurt, scared,
  bored, determined. `wet: true` + `tear: 0..1` for crying close-ups.
- Breathing idle, walk cycle with body bob, ground shadow. On dark backgrounds always give him a rim `glow`
  (cold `rgba(150,180,240,.9)` at night, warm `rgba(255,200,130,.9)` at sunrise).
- Size tells the feeling: h 260-400 in wide/lonely shots, 560-700 mid shots, 980-1250 low-angle/hero shots,
  `bigFace` r 500+ for the emotional close-up.
- Poses: `POSE.openPalms` (asking), `handChest` (sincerity), `armsUp` (gratitude), `reach`, `flinch`, sitting via
  `hipY` + leg angles (hug knees: legs [128,150], lean 22, headTilt 26).

## 3. Colour script (`grade` per shot: sat, con, tint, tintA, vig, bloom, bars, shake)
| emotion | look | grade |
|---|---|---|
| hope / blessing | warm dawn, light beam from above, golden motes | sat 1.08, bloom .4 |
| routine / numbness | daylight draining to grey, overcast | sat → .28, blue tint .25 |
| shock | white flash, red overlay, dutch angle, slow motion, shake | tint #FF2020 overlay .32, con 1.35, bars 1 |
| confusion | cold overcast, foggy, desaturated map | sat .6-.8, tint #2C5C9E soft-light .3 |
| despair | deep blue night, rain, one cold light shaft | tint #2A56A8 .3, vig .8, bars .7 |
| hope returns | night → dawn inside the shot, rain stops, god rays | tint fades to 0, bloom rises |
| revelation / gratitude | gold sunrise, sun burst rays, flare, birds | tint #FFA040 .14, bloom .45-.55 |
| peace | golden hour, slow pull-back, the golden path visible | bloom .5 |
Palette anchors: gold `#F6C453` (the path, keywords, stars), ink `#15151B`, scarf red `#E0483E`; skies are gradients.

## 4. Camera + transitions (`src/main.js`)
- The camera never stops: crane, push-in, pull-back reveal, orbit (fast parallax pan), whip-tilt. Use `cam(x, y, z, rot)`.
- Parallax: 4-6 layers (sky .12, far ridge .3, mid .55, near .8, ground 1, blurred foreground 1.6).
- Transitions (`tin: { type, d }`): `flash` for shock and for glory (warm white), `zoom` into a bird's-eye map,
  `dip` (short black breath, .24-.32 s) before a new emotional chapter, `fade` for time passing, `whip` for energy,
  hard cuts for the rhythm of short phrases. Continuous shots across several lines are better than many cuts.
- Post on every frame: grade → bloom → vignette → bottom scrim → typography → letterbox → film grain → fades.

## 5. Typography (`src/type.js`)
- Arabic in **Cairo 900**, right-to-left, each word arrives **as it is spoken** (rise + de-blur + settle),
  ONE gold glowing keyword per line (`*` in script.json). English translation below in Inter 800, smaller, softer.
- Default: 80 px at y ≈ 1520 over a soft dark bottom scrim (no boxes).
- `hero`: 140 px placed in the frame (e.g. "طريقك!" over the map, "وليه؟ واشمعنى يا رب؟" in the stormy sky).
- `impact`: 270 px slam with RGB split + shake, for the one shock word ("وفجأة!").
- `glow`: gold with a travelling light sweep and a dark halo, for the gratitude line ("سبحانك يا رب!").
- End title: gold Cairo 150 px + spaced English kicker (e.g. "ثِق في الطريق / TRUST THE PATH"), light sweep.
- Gold text never sits on a bright sky without the dark halo; move it onto the darker part of the frame.

## 6. Sound (`tools/mix.py` + per-video `score.py`)
- Voice on top (high-passed, gently compressed, ≈ -17 dBFS RMS); music ducks 45% under it.
- Original score, synthesized: soft piano (with reverb) + string pads. It follows the arc: warm arpeggios (hope) →
  muted mechanical notes (routine) → **hard stop to silence + boom** (shock) → low drone + slow pulse (confusion) →
  sparse sad piano melody over soft strings (despair) → arpeggios building (walking on) → full major chords + strings
  + high melody (revelation, loudest) → gentle resolve and a final ringing chord under the end title.
- Sound design, soft and rounded: swell, shimmer, chimes (rising pentatonic, one per revealed item), riser→boom→crack
  for the shock, whip/thump on map lurches, rain bed, heartbeat in the lowest moment, thunder with the lightning, a glassy
  "tear" ping, birds at dawn, a warm "reveal" chord bloom.

## 7. Fables and animals
- When the speaker tells a parable, act it out with animal characters in the same ink style (ink body, big white acting
  eyes, ONE accent colour: gold beak, gold-brown mane, cream belly), then bring it home to the hero's own life
  (match the beat: "when you wake up" → the hero in bed at dawn) and end with the hero AND the animals together.
- Chase scenes: tracking camera, speed lines, galloping sound, tribal toms; lock targets with a reticle (gold = prey,
  red = danger). Violence is implied only (a shadow falls, the music drops out under a heartbeat).
- Opening hook: a seal/stamp title for the rule or proverb (e.g. "قاعدة / A RULE") over a huge red sun.

## 8. Pitfalls already hit (don't repeat)
- Nested colour mixing: `mix()` returns `rgb()`; `hex()` accepts both forms now — keep it that way.
- Zoom transition must push the incoming shot in from >1 scale, or the frame edge shows.
- Debris must be dark angular rocks, not round coloured dots (reads as confetti).
- Bright scenes + bloom wash out gold text → dark halo / lower bloom (≤ .45 where text sits on sky).
- Every helper that animates needs `t` passed in explicitly (closures inside buildShots don't have it).
- Gold hero/glow titles on bright sky: they now get a dark outline + halo automatically; keep it.
- A dark flat ellipse reads as a blob: canopies are rows of overlapping leaf ellipses; shadows take the caster's shape.
- Standing quadrupeds need slightly angled, thick legs or they look like tables.
- Long Arabic lines wrap at 80 px; keep lines short or let them wrap into two balanced rows (automatic).
