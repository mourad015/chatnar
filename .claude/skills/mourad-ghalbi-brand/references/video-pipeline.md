# Video pipeline

Tools: Playwright Chromium (preinstalled in cloud sessions), ffmpeg, Python 3 with numpy + scipy (`pip install scipy` if missing).

## Render frames
- Outro: `node render-outro.js <frames-dir> 60 <w> <h>` → PNG frames `f0000.png…`
- Promo: `node render-promo.js <frames-dir> <w> <h> [fps=60] [workers=4] [from] [to]` → JPEG frames `f00000.jpg…`
  Use `from`/`to` to re-render only a broken range.
- Speed: run one browser per worker and export straight from the canvas (`toDataURL('image/jpeg',.97)`); page screenshots from several tabs of one browser are ~50× slower.
- Launch Chromium with `--allow-file-access-from-files` so local fonts load. Wait for `window.ready` before drawing.

## Audio
`python3 sound.py out.wav` (outro, 5 s) · `python3 music.py out.wav` (promo, 40 s).

## Encode
```bash
ffmpeg -framerate 60 -i frames/f%05d.jpg -i music.wav -c:v libx264 -preset slow -crf 16 \
  -pix_fmt yuv420p -tune animation -c:a aac -b:a 256k -shortest -movflags +faststart out.mp4
```
Drop `-i music.wav` and the audio flags for the `_silent` version.

## Append the official outro to a video
```bash
# match the outro to the main video (example: 1080x1920, 60fps), then concat
ffmpeg -i main.mp4 -i MouradGhalbi_Official_Outro_9x16.mp4 -filter_complex \
 "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=#090D32,fps=60,setsar=1[v0];\
  [1:v]fps=60,setsar=1[v1];[0:a]aresample=48000[a0];[1:a]aresample=48000[a1];\
  [v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac with_outro.mp4
```
If the main video has no audio track, add `-f lavfi -t <dur> -i anullsrc=r=48000:cl=stereo` and use it as `[a0]`.

## Quality checks before delivering
- Contact-sheet key moments and mid-transition frames (`node sheet.js out.png <w> <h> t1 t2 …`).
- Canvas gotcha: when cutting a circular hole with `rect()` + `arc(..., true)`, call `moveTo(cx + r, cy)` before `arc`, or a stray line appears.
- `ffprobe` the result: right size, 60 fps, exact duration.
