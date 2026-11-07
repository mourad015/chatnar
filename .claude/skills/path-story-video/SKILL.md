---
name: path-story-video
description: Turn a short talking clip (motivational / spiritual speech, usually Arabic) into a cinematic vertical stick-figure explainer in the user's saved "Path Story" style, keeping the speaker's own voice. Use whenever the user sends a video or audio clip and asks for an explainer, motion graphic, stickman animation, or "the same style as before / the template".
---

# Path Story: cinematic stick-figure explainers (the user's house style)

The user approved this style ("I liked the style and everything") on the video **ليه يا رب؟ / Why, Lord?**. Every new
video should look and feel like that one: same character, same colour logic, same typography, same sound design,
same level of polish. **Read `STYLE.md` in full before planning.** Two complete reference projects render as-is:
- `example/why-lord/` — ليه يا رب؟ (26 s): life as a path, map reveal, rain/night/sunrise worlds.
- `example/lion-gazelle/` — قاعدة الغزالة والأسد (44 s): a fable told with animals, then the hero's own life. Its shots.js
  holds reusable characters and sets: `birdie` (bird, flap/worm/sweat), `worm`, `nest`, `lion` (run/roar/lying/thin),
  `gazelle` (run), `reticle`, `speedLines`, `wallShadow` (gazelle/lion shadow), `savanna` (red-sun dawn → bright
  day → grey), `acacia`, `bedroom` + `bed` + `blanket` + `clock`, `city` + `billboard`, `miniCloud` (rain over a head).
  To start from it: `cp example/lion-gazelle/{shots.js} <project>/src/` and its script/score.

## The series: «قاعدة في الحياة» (A Rule in Life)
The user publishes these as a series named **قاعدة في الحياة**. Every episode MUST carry the series branding:
- `script.json`: `"lead": 1.8`, `"series": {"ar": "قاعدة في الحياة", "en": "A RULE IN LIFE"}`, `"episode": {"ar": <the clip's
  title or the question it answers>, "en": ...}`, `"endline": {"ar": <one-line takeaway>, "en": ...}`. The speaker's voice
  starts after the lead; all `L()` / `Wt()` times include it automatically (score.py times are absolute: add the lead).
- Shot 0 = `seriesIntro` (gold seal + episode title, from `src/series.js`); the first story shot enters with
  `tin: { type: 'zoom' }`. The badge at the top is drawn automatically during the episode. The last shot calls
  `seriesEnd(...)` ~0.4 s after the final line, holding ~2.5 s. score.py opens with the same gold sting
  (see `example/triangle/score.py`).
- Newest reference episode: `example/triangle/` — أين تجد الراحة النفسية؟ (triangle explainer on a blueprint, valley that
  blooms, gloom creatures, shield, sprout, sun emblem, medallions). Start new episodes from it.
- If the source has its own room noise / faint music, set `"voice_gate": -34` (quiets the pauses by up to 10 dB).

Everything is code: canvas drawing in headless Chrome, ffmpeg, numpy/scipy audio. No AI images, no stock assets.
Output: 1080×1920, 30 fps, H.264 + AAC, the speaker's original voice, original synthesized score.

`SKILL` = this folder. Work in the session scratchpad (or a folder the user names), never inside the app's `src/`.

## 0. Setup (each fresh cloud session)
- `pip install scipy` (numpy comes with it). ffmpeg and Node 22 are preinstalled.
- Chrome: `export CHROME=/opt/pw-browsers/chromium-*/chrome-linux64/chrome` (resolve the glob; `capture.mjs` needs a path).
- Speech-to-text models (Hugging Face, OpenAI CDN) are usually **blocked** by the network policy. Don't fight it:
  most clips have burned-in subtitles → read them (step 2). Only if there are none, ask the user for the text.
- Fonts are bundled (`engine/fonts`: Inter for English, Cairo for Arabic). Extra npm fonts: `npm pack @fontsource/<name>`.

## 1. Start the project
`bash SKILL/scripts/new_video.sh <clip.mp4> <project-dir>` → engine + example files + `data/narration.wav`.
Look at a few frames of the clip (`ffmpeg -ss 5 -i clip -frames:v 1 f.jpg`) to see the speaker and the subtitle band.

## 2. Transcript + timing
1. `bash SKILL/scripts/subs_sheet.sh <clip> <dir> [band_y] [band_h]` → time-stamped contact sheets of the subtitle band
   (4 frames/s). Read them; each subtitle change = one line with start/end.
2. Write `script.json` lines: `{ "s", "e", "ar": "… *keyword …", "en": "English translation" }` (`*` marks the ONE gold
   word). Correct the subtitle spelling to clean Egyptian/MSA Arabic. Set `"duration"` = audio length + ~1.4 s for the
   end title.
3. `python3 tools/wordtimes.py .` → adds `wt` (per-word start times) from the voice's energy. Spot-check a few.
4. Big moments get a type style: `"style": "impact" | "hero" | "glow", "y": <px>` (see STYLE.md → Typography).

## 3. Plan (show the user ONE screen, then build)
- What the speaker says (2-3 sentence summary) and the **visual metaphor** carrying the whole video (Why, Lord? = life
  is a path; the zigzags were switchbacks up a mountain). One metaphor, one hero, one world, start to finish.
- The colour script: which emotion each section is (STYLE.md → Colour script).
- Shot list: one line per shot — time range, what we see, the camera move, the transition in, the beat it lands on.
- The score arc (which section is hope / routine / shock / confusion / despair / build / revelation / resolve).
If the user said "just do it" or asked for the same style, build without waiting.

## 4. Build
- `src/shots.js`: rewrite the shots for the new story. Reuse the kit: `fig.js` (hero, faces, poses), `world.js`
  (skies, ridges, pines, weather, light, golden path, flare, birds), and the helpers at the top of the example's
  shots.js (dayLand, mountainMap, nightSky, sunriseLand, pinHere, star…). Add new set pieces in the same flat look.
  Place every beat on the voice: `L(i)` line start, `Wt(i, k)` word k of line i.
- `score.py`: rewrite the score for the new emotional arc with `arp / bass / chordpad / piano / put` (see example).
- Sound cues in shots.js with `cue(t, type, {gain, dur, n, rate})`; types listed in `tools/mix.py` FX (incl. roar, gallop,
  flap, alarm, growl, pop, tock). Drums go in score.py with `kick / tom / shaker` (dry bus, no reverb).
- Wordless stretches (the speaker gestures, no subtitle) still get a shot; captions hide 0.7 s after a line ends.
- Commands (from the project dir):
  `node tools/capture.mjs check` (must say CHECK OK) → `node tools/capture.mjs cues` → `python3 tools/mix.py .`
  → QA (step 5) → `node tools/capture.mjs video renders/<name>.mp4` (~7 min for 26 s on the cloud CPU: run it in the
  background and tell the user the wait up front).

## 5. QA — never ship a frame you haven't looked at
`node tools/capture.mjs sheet review/all.jpg 0.5 9` and read the whole sheet; key frames full size with
`node tools/capture.mjs frames review/k "6.7,9.3,20.4"`. Check:
- Does each picture say exactly what the voice says at that moment? Reveals land on their word.
- Text readable on a phone: never gold-on-bright-sky (put it on the dark part of the frame or give it the dark halo).
- No frame edges showing in transitions, no black empty areas, nothing colliding with the text zone (y 1380-1700).
- Characters keep their look (ink body, red scarf), props move with the hand that holds them.
- Audio: measure it (you can't listen). Voice RMS ≈ -17 dBFS on top, music 8-10 dB under, the silence before an impact
  really silent, the swell at the revelation the loudest music. A no-voice stem: copy the project, replace
  narration.wav with silence, run mix.py, print RMS per 0.5 s.
Fix, re-render the sheet, re-check. Tell the user what you caught and fixed.

## 6. Deliver
Send the MP4 (SendUserFile, display render). Then: a one-paragraph summary of what the speaker says, how the video tells
it, what you checked, and posting kit (title, caption, 5-8 hashtags). Offer precise changes per moment.
Keep finished projects out of git unless the user asks (renders are 50+ MB); the skill itself is what's committed.
