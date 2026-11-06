---
name: reels-motion-graphics
description: Plan, build, and review motion graphics for vertical short-form video (Instagram Reels, TikTok, YouTube Shorts) at 1080x1920. Use when making or critiquing reel animations, kinetic captions, text hooks, transitions, lower thirds, or any animated overlay on our content — in After Effects, CapCut, Premiere, Remotion, or code.
---

# Reels motion graphics

Motion in a reel has one job: keep people watching. Every animation should either hook, explain, or move the eye to the next thing. If it does none of those, cut it.

## 1. Canvas and safe zones

- Canvas: **1080x1920, 9:16, 30 fps** (use 60 fps only if the whole edit is 60).
- The app UI covers parts of the frame. Keep text, faces, and key graphics inside this box:
  - **Top:** leave ~250 px clear (account name, search bar).
  - **Bottom:** leave ~380 px clear (caption text, audio, buttons).
  - **Right:** leave ~140 px clear (like/comment/share rail).
  - **Left:** leave ~60 px clear.
- That gives a working area of roughly x 60–940, y 250–1540. Captions sit in the lower-middle of it (around y 1150–1450), never in the bottom band.
- Safe-zone numbers vary by app, device, and update. These are a conservative mix of third-party guides, not an official spec. Always check in the app's preview before posting.

## 2. The hook (0–3 s)

- **Frame 1 must already be moving.** No fade from black, no logo intro, no slow build.
- Put a text hook on screen at 0.0 s. Assume sound is off.
- Aim for 2–3 visual changes in the first 3 s (new word, zoom, cut, graphic pop).
- By 3–5 s, the viewer should know what they'll get from watching.
- After the hook, add a pattern interrupt every **2–4 s** (cut, zoom punch, graphic, color shift) so nothing sits still too long.

## 3. Timing (at 30 fps)

Most beginner motion is too slow. Use these as defaults and break them on purpose:

| Move | Frames | Seconds |
|---|---|---|
| Small pop / scale / icon | 6–10 | 0.2–0.33 |
| Text in or out | 8–12 | 0.27–0.4 |
| Element moving across screen | 12–18 | 0.4–0.6 |
| Full-screen transition | 10–16 | 0.33–0.53 |
| Anything over | 20 | needs a reason |

- **Stagger** related elements by **2–4 frames** (words, list items, icons). Everything landing at once looks cheap.
- **Bigger things move slower** than small things. Don't give every layer the same duration.
- **Hold** text long enough to read: about 0.3 s per word, minimum ~0.6 s for a full phrase.

## 4. Easing

Linear motion is the #1 reason motion looks cheap. Only use linear for constant motion (a slow background drift, a ticker).

| Use | Feel | CSS / Remotion bezier |
|---|---|---|
| Entrances (things arriving) | Fast start, soft landing (ease-out) | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Exits (things leaving) | Soft start, fast leave (ease-in) | `cubic-bezier(0.7, 0, 0.84, 0)` |
| Moves on screen (A → B) | Ease in and out | `cubic-bezier(0.65, 0, 0.35, 1)` |
| Playful pop | Small overshoot | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

- In After Effects: select keyframes → F9 (Easy Ease), then open the **Graph Editor** and pull the handles. A steep start with a long tail is the "premium" ease-out look.
- When unsure, ease **out** into rest. A slow ending looks more polished than a slow start.
- Use overshoot/bounce on 1–2 accent moments per reel, not on everything.

## 5. Principles that make motion feel alive

- **Anticipation:** a tiny pull-back (2–3 frames, 3–5% scale down) before a big pop.
- **Follow-through and overlap:** the parts of a group shouldn't all stop on the same frame; let secondary parts settle 2–4 frames later.
- **Arcs:** curve motion paths slightly; straight lines look robotic.
- **Motion blur** on fast moves (on in After Effects; shutter 180°).
- **Rotate on Z only** for 2D graphics. Flipping 2D layers on X/Y looks flashy and cheap.
- **One focal point at a time.** If two things move at once, one of them should be clearly secondary (smaller, slower, lower contrast).

## 6. Kinetic captions

- **1–3 words per caption**, timed to the speech, changing roughly every 0.3–0.6 s.
- Bold, heavy sans-serif. Size around **70–110 px** on the 1080 canvas.
- Always readable on any background: white text with a dark stroke (6–10 px) or soft shadow, or a solid pill behind it.
- **Highlight the key word** in each line with one accent color or a scale bump (105–115%).
- Caption entrance: 4–6 frames, quick scale from 80–90% → 100% with an ease-out or small overshoot. Don't animate every caption differently.
- Keep captions in the same spot for the whole reel so the eye knows where to look.

## 7. Style system (keep it consistent)

- **Palette:** 1 background tone, 1 text color, 1 accent. Add a second accent only if needed.
- **Fonts:** max 2 (one display, one caption). Same weights every reel so the content is recognizable.
- **Motion vocabulary:** pick 3–4 signature moves (e.g. "pop in", "slide-up word reveal", "zoom punch", "whip transition") and reuse them. Consistency reads as quality.
- **Sound:** sync pops, cuts, and transitions to beats or SFX (whoosh, click, pop). Motion that hits a sound feels twice as strong.
- **Loop the ending:** make the last frame flow back into the first so rewatches feel seamless.

## 8. Workflow

1. **Script the beats.** Write the hook line, then one line per 2–4 s beat.
2. **Storyboard.** One quick sketch or note per beat: what's on screen, what moves.
3. **Style frame.** Design one finished still (fonts, colors, layout in safe zones) before animating.
4. **Block the timing.** Rough in positions and cuts to the audio first. No easing yet.
5. **Polish.** Add easing, stagger, overshoot, motion blur, SFX.
6. **Review** with the checklist below, on a phone, with the app's UI preview.

## 9. Review checklist

Run this before calling any reel done. Fix anything that fails.

- [ ] Something moves on frame 1; text hook visible at 0.0 s.
- [ ] 2–3 visual changes in the first 3 s; an interrupt every 2–4 s after.
- [ ] All key text and faces inside the safe zones (checked in the app preview).
- [ ] No linear easing except on constant motion.
- [ ] No move over ~20 frames without a reason.
- [ ] Related elements are staggered, not all landing at once.
- [ ] Every caption is readable muted, on a phone, at arm's length.
- [ ] One focal point at a time.
- [ ] Max 2 fonts, 1–2 accent colors, same signature moves as our other reels.
- [ ] Big moves hit a beat or SFX.
- [ ] Ending loops cleanly into the start.

## Common "looks cheap" fixes

| Problem | Fix |
|---|---|
| Feels stiff or robotic | Replace linear with ease-out; curve the path; add 2–4 frames of overlap |
| Feels slow or boring | Cut durations by a third; add a pattern interrupt |
| Feels chaotic | One focal point; fewer simultaneous moves; consistent caption spot |
| Feels amateur | Fewer effects, fewer fonts, one accent color; reuse signature moves |
| Hard to read | Bigger, bolder text; stroke or pill; hold longer |
| Text gets covered | Move inside safe zones; check the app preview |

## Sources

This skill was written from articles and guides, not from watching videos. The numbers are starting defaults to test, not hard rules.

- Safe zones: [Hopper HQ](https://www.hopperhq.com/blog/instagram-reel-size/), [Argil](https://argil.ai/blog/instagram-reel-size-e350f), [TryMyPost](https://www.trymypost.com/blog/instagram-reels-safe-zones-text-placement-2026), [Wild & Free Tools](https://wildandfreetools.com/blog/vertical-video-safe-zones-guide-2026/)
- Easing and timing: [Tomasz Kaye's Seven Commandments of Motion Design](https://steemit.steemapps.com/design/@bitbutter/tomasz-kaye-s-seven-commandments-of-motion-design), [Graduate School: Animation Principles](https://www.graduateschool.edu/learn/premiere-pro/animation-principles-motion), [Cursa: Easing and the Graph Editor](https://cursa.app/en/page/after-effects-for-absolute-beginners-smooth-motion-with-easing-and-the-graph-editor), [Compass motion guide](https://www.compass.com/app/guides/Motion)
- Hooks and captions: [CapCut hook patterns](https://www.capcut.com/create/short-form-video-hooks-first-3-second-patterns), [AutoClip 3-second hook data](https://autoclip.dev/blog/viral-clip-anatomy-3-second-hook-data), [Metricool viral hooks](https://metricool.com/viral-video-hooks/)
