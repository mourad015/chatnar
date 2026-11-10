---
name: mourad-ghalbi-brand
description: Brand system for Mourad Ghalbi and his agency Novary (navy #090D32, bolt red #DB3445, white, Poppins) with the official 5-second video outro and a motion-graphics engine. Use whenever making anything for Mourad Ghalbi, his personal brand, or Novary — videos, motion graphics, promos, reels, intros/outros, thumbnails, social posts, carousels, slides, web pages, brand sheets, ads — or when the user says "my brand", "my outro", "my logo", "my colors" or "brand style".
---

# Mourad Ghalbi / Novary brand

Everything made for Mourad Ghalbi or Novary follows this system. The user's own words always win over these rules.

## Core identity
- **Owner:** Mourad Ghalbi (personal brand, ™). Logo: red bolt + stacked white wordmark "Mourad / Ghalbi".
- **Agency:** Novary, a creative studio run in collaboration with Mourad Ghalbi. Services: graphic design, video editing, AI generative content, digital marketing.
- **Novary logo status:** the red four-point "nova" star + spaced "NOVARY" wordmark is a placeholder Claude designed. If the user supplies an official Novary logo, use theirs and update this skill.
- **Personality:** elegant, minimalist, professional, direct, energetic. Lots of navy space, one red spark per frame.

## Colors (exact — never approximate)
| Token | HEX | RGB | CMYK | Role |
|---|---|---|---|---|
| Midnight Navy | `#090D32` | 9 13 50 | 82 74 0 80 | Backgrounds, dark text |
| Bolt Red | `#DB3445` | 219 52 69 | 0 76 68 14 | Bolt, accents, CTAs, highlights |
| Pure White | `#FFFFFF` | 255 255 255 | 0 0 0 0 | Wordmark, text on navy |

Supporting tints (UI surfaces in motion work only): navy-2 `#10154A`, card `#131A52`, line `#2A3172`, muted text `#9BA0C8`, lilac `#8A8FB8`.
- Proportion: navy 70%, white 20%, red 10%.
- Contrast: white on navy 18.8:1 (any size), white on red 4.6:1 (any size), red on navy 4.1:1 (large text only).
- No gradients on the logo. Backgrounds may carry a very soft radial lift or edge vignette around navy.

## Typography
Poppins only. SemiBold 600 for headlines and the wordmark, Medium 500 for labels, Regular 400 for body. Font files: `assets/templates/fonts/`.
Video type scale at 1080p: title 96–150, heading 64, subtitle 40, caption 28–32. Headlines tight (letter-spacing −1 to −3 px), small caps labels tracked wide (+4 to +10 px).

## Logo rules
- Files in `assets/logo/`: `mourad-ghalbi-logo-on-navy.svg` (default), `-transparent-light.svg` (white wordmark), `-transparent-dark.svg` (navy wordmark for light backgrounds), `mourad-ghalbi-icon.svg` (bolt only). Text is outlined; never retype the name.
- Clear space = height of the capital "M" on every side. Minimum width 140 px screen / 35 mm print; icon 24 px.
- In video: ~70% of frame width in 16:9, ~90% in 9:16.
- Never stretch, rotate, recolor, add shadows/glows, or put it on busy backgrounds (use a navy plate over photos). All-white on red is allowed.
- Bolt geometry (source px): `38,70 134,14 136,32 188,14 188,70 176,70 172,53 121,73 116,51`.

## Official outro
Every personal-brand video ends with the official outro (5 s, 60 fps) from `assets/outro/`:
- `MouradGhalbi_Official_Outro_16x9.mp4` (1920×1080) for YouTube/landscape
- `MouradGhalbi_Official_Outro_9x16.mp4` (1080×1920) for Reels/TikTok/Shorts
- `_silent` variants when the video has its own music.
Append with ffmpeg (match resolution/fps first) — see `references/video-pipeline.md`. Re-render only if asked to change it (`assets/templates/outro.html`).

## Motion language
Read `references/motion.md` before any animation work. In short: ease-out-expo entries, text rising out of invisible masks, tracking that tightens into place, red diagonal panel wipes and red iris transitions, a single glint, cuts on the downbeat of a 120 BPM bar, a held final frame, fade to black.

## Copy voice
Short, confident, direct. Examples in use: "Your brand deserves attention." · "All in one creative studio." · "Let's create together". Never invent stats, client names, prices or contact details — leave a clear slot and ask the user.

## Ready-made templates (`assets/templates/`)
| File | What it is |
|---|---|
| `outro.html` + `render-outro.js` + `sound.py` | The official outro (SVG). `?w=&h=` for any size |
| `promo.html` + `render-promo.js` + `music.py` | 40 s Novary promo engine (Canvas 2D): hook, logo reveal, 4 service scenes, recap, end card; 120 BPM soundtrack synthesizer |
| `sheet.js` | Contact-sheet preview of chosen timestamps (check frames before rendering) |
| `brand-sheet.html` | Full brand sheet page (logo, colors, type, do/don't, outro) |
Copy templates into a work folder before editing; keep `fonts/` next to the HTML.

## Workflow for a new piece
1. Confirm format(s): 9:16 and/or 16:9 (default: make both), duration, and any copy/contact info the user wants.
2. Storyboard to the beat (1 bar = 2 s at 120 BPM) and write it out briefly.
3. Build from the templates, check key frames with `sheet.js` (look at mid-transition frames too), fix, then render.
4. Deliver MP4 with sound + silent, H.264 yuv420p, 60 fps, and append the official outro for personal-brand videos when asked.
