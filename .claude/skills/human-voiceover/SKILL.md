---
name: human-voiceover
description: Produce natural, human-sounding AI voiceovers (offline Kokoro TTS) and mix them for short-form video — line-by-line generation, pacing, pauses, emphasis, room tone, music ducking, and word timings for captions. Use when a video needs narration or a voiceover.
---

# Human-sounding voiceover

Most "robotic" AI voiceover is a script problem and a pacing problem, not a voice problem.

## 1. Prepare the script

- Write for the ear (see the `story-scripts` skill): short lines, contractions, one idea per line.
- Don't use ALL CAPS for emphasis (it may be read letter by letter). Emphasise by giving a word its own sentence or putting it at the end of a line.
- Spell numbers and symbols the way they're said ("three A M", not "3AM").

## 2. Generate line by line

- Generate **each line separately**, never the whole script at once. This gives control over pace and pauses and lets you redo one line.
- Engine: **Kokoro-82M** (Apache-2.0, runs on CPU). `pip install kokoro-onnx soundfile`; model + voices from Hugging Face (`onnx-community/Kokoro-82M-v1.0-ONNX` or the kokoro-onnx release files).
- Voice: `af_heart` is the most natural English voice; try a 50/50 blend with another voice for a unique timbre.
- **Speed per line:** base 1.0. Hook and reveals 0.92–0.97 (slower = weight). Lists and fast beats 1.05–1.1. Never the same speed for every line.

## 3. Pacing and pauses (the biggest win)

| Spot | Silence after |
|---|---|
| Between sentences in a beat | 0.15–0.3 s |
| Before a reveal / after a question | 0.5–0.8 s |
| After a one-word beat ("Wow.") | 0.6–0.9 s |
| Between story sections | 0.4–0.6 s |

- Add tiny random variation (±40 ms) so pauses never feel metronomic.
- Trim TTS leading/trailing silence first, then add your own pauses.

## 4. Make it sit in a room

- Add very low room tone/noise under the voice (−60 dB) so silences aren't digital black.
- Light EQ: high-pass at 80 Hz, gentle presence lift at ~3 kHz.
- Light compression so quiet words are still clear on phone speakers.
- Tiny reverb (short room, 5–10% wet) — enough to feel recorded, not echoey.
- Peak around −1 dB, voice ~−16 LUFS for social.

## 5. Mix with music

- Music under voice at roughly −18 to −22 dB relative to the voice; **duck** it further while the voice speaks, swell it in the pauses and at section changes.
- Hit SFX on visual moments, not on words, so they don't mask speech.

## 6. Word timings for captions

- Keep each line's start time and duration from generation.
- If the engine has no word timestamps, spread words across the line by character length (weights = letters + 2) — close enough for 1–3-word kinetic captions.

## Checklist

- [ ] Every line generated separately with its own speed.
- [ ] Pauses vary; longest pauses sit before reveals.
- [ ] No digital-silence gaps (room tone present).
- [ ] Voice is clear on a phone speaker with music playing.
- [ ] Captions match the voice to within ~2 frames.
