# Mourad Ghalbi — Brand Kit

Official brand assets for all Mourad Ghalbi personal-brand content.

## Official outro (use at the end of every video)
| Format | File | Use for |
|---|---|---|
| 16:9 · 1920×1080 · 60fps | `outro/MouradGhalbi_Official_Outro_16x9.mp4` | YouTube, landscape |
| 9:16 · 1080×1920 · 60fps | `outro/MouradGhalbi_Official_Outro_9x16.mp4` | Reels, TikTok, Shorts |

Each has a `_silent` version for videos with their own music. Length: 5 seconds.
To re-render: `node outro/render.js <frames-dir> 60 <width> <height>`, then encode with ffmpeg (see git history).

## Colors
| Name | HEX | RGB | CMYK | Role |
|---|---|---|---|---|
| Midnight Navy | `#090D32` | 9 13 50 | 82 74 0 80 | Backgrounds |
| Bolt Red | `#DB3445` | 219 52 69 | 0 76 68 14 | Bolt, accents |
| Pure White | `#FFFFFF` | 255 255 255 | 0 0 0 0 | Wordmark, text on navy |

Proportion: navy 70%, white 20%, red 10%.

## Type
Poppins SemiBold (600) for headlines, Poppins Regular (400) for body.

## Files
- `logo/` — SVG + PNG: on navy, transparent (white text), transparent (navy text), icon
- `sheet/brand-sheet.html` — full brand sheet (logo rules, colors, type, do/don't, outro specs)
