---
name: mourad-ghalbi-brand
description: Brand systems for Mourad Ghalbi (navy #090D32, bolt red #DB3445, white, Poppins) and his agency Novary (black, crimson #BF010C, white, Cinzel serif, ribbon "N" monogram), with the official 5-second outro, an Arabic voice-synced promo engine and motion-graphics templates. Use whenever making anything for Mourad Ghalbi, his personal brand, or Novary — videos, motion graphics, promos, reels, intros/outros, thumbnails, social posts, carousels, slides, web pages, brand sheets, ads — or when the user says "my brand", "my outro", "my logo", "my colors" or "brand style".
---

# Mourad Ghalbi / Novary brand

Everything made for Mourad Ghalbi or Novary follows this system. The user's own words always win over these rules.

## Core identity
- **Owner:** Mourad Ghalbi (personal brand, ™). Logo: red bolt + stacked white wordmark "Mourad / Ghalbi".
- **Agency:** Novary Agency, owned by Mourad Ghalbi. Tagline (as written in the logo): "OF PRODUCTION FOR ADVERTISING". Services: graphic design, video editing, AI generative content, digital marketing, personal branding.
- **Two brands, two worlds:** Mourad's personal brand lives on navy with bolt red; Novary lives on black with crimson. In shared pieces, keep each logo in its own colors (e.g. Mourad logo on a navy plate inside a Novary frame) and use "Founded by Mourad Ghalbi" / "Mourad Ghalbi × Novary".

## Novary brand (official, from the agency logo)
| Token | HEX | Role |
|---|---|---|
| Novary Black | `#000000` | Backgrounds |
| Crimson | `#BF010C` | Primary brand red, buttons, accents |
| Bright Red | `#F40404` | Highlights, top of gradients, glows |
| Deep Red | `#880000` | Shadow end of gradients |
| White | `#FFFFFF` | Wordmark, text |
| Grey | `#9A9A9E` | Tagline, secondary text |
- **Logo (official file):** `assets/logo/novary/novary-logo-original.jpg` (2000×2000, on black). Glossy red ribbon "N", "NOVARY" in a classic serif with a red "Λ" for the A, "AGENCY" between two thin crimson lines, tagline in grey. Always use the real artwork, never redraw or retype it.
- Transparent cut-outs for animation: `assets/logo/novary/n.png` (monogram), `agency.png`, `tag.png`, plus per-letter pieces and positions in `assets/voice-promo/assets/` (`l0…l5.png`, `logo.json`). They are cut from a black background, so dark shading is semi-transparent: use them on black/very dark backgrounds only. Animation recipe: `novaN()` (diagonal wipe + glint) and `novaryLogo()` in `assets/voice-promo/promo.html`.
- When Mourad's logo appears inside a Novary (black) frame, use it reversed: all white (white bolt + white wordmark), no plate — e.g. "FOUNDED BY" + white logo on the end card.
- Gradients and glows are part of Novary's look (unlike Mourad's flat logo). Keep backgrounds black with soft crimson light.
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
Poppins for Latin (SemiBold 600 headlines, Medium 500 labels, Regular 400 body). Arabic / Tunisian Derja text: Alexandria (700 headlines, 800 for accent words) — bold, modern, made for marketing. Novary wordmark: Cinzel 500. Font files: `assets/templates/fonts/`.
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
| `promo.html` + `render-promo.js` + `music.py` | 40 s services promo engine (Canvas 2D): hook, logo reveal, 4 service scenes, recap, end card; 120 BPM soundtrack synthesizer. Still uses the old placeholder Novary star: swap in `novaryLogo()` from `assets/voice-promo/promo.html` |
| `sheet.js` | Contact-sheet preview of chosen timestamps (check frames before rendering) |
| `brand-sheet.html` | Full brand sheet page (logo, colors, type, do/don't, outro) |
| `../voice-promo/promo.html` + `soundtrack.py` + `render.js` | Apple-style promo synced to a Tunisian voice-over (personal branding services): Arabic words blur in on the voice, floating iPhone profile mockup (before → after), service cards, 3-step process, iMessage CTA, real Novary logo end card founded by Mourad. `soundtrack.py voice.wav mix.wav sfx.wav` mixes the voice with sound design only (no music — the user prefers voice + SFX) |
Copy templates into a work folder before editing; keep `fonts/` next to the HTML.

## Preferences learned
- No background music under voice-overs; rich, polished sound effects instead.
- Premium "high-quality ad" finish: real logos, bold Arabic type, glossy light, depth.
- Encode: static (not per-frame) grain, `hqdn3d` + crf 18 keeps a 45 s 1080p60 file near 15 MB.

## Voice-over sync (Arabic / Derja)
No speech-recognition model can be downloaded in cloud sessions (Hugging Face is blocked). Sync with pauses instead: `ffmpeg -i voice.wav -af silencedetect=n=-32dB:d=0.12 -f null -` splits the take into phrases; map them to the script lines, then spread word times inside each phrase by character count (see `hero()` in the voice-promo). Ask the user to record with clear pauses between lines.

## Workflow for a new piece
1. Confirm format(s): 9:16 and/or 16:9 (default: make both), duration, and any copy/contact info the user wants.
2. Storyboard to the beat (1 bar = 2 s at 120 BPM) and write it out briefly.
3. Build from the templates, check key frames with `sheet.js` (look at mid-transition frames too), fix, then render.
4. Deliver MP4 with sound + silent, H.264 yuv420p, 60 fps, and append the official outro for personal-brand videos when asked.
