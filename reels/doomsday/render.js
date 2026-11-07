// Render with motion blur (4 sub-frames) and mux with the score (which reads the page's cue list).
const { chromium } = require('playwright'); const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30, SUB = 4; const out = path.resolve(process.argv[2] || 'out'), dir = path.join(out, 'sub');
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file://' + path.join(__dirname, 'index.html')); await pg.evaluate(() => window.ready);
  const meta = await pg.evaluate(() => ({ total: window.TOTAL, sfx: window.SFX })); fs.writeFileSync(path.join(out, 'sfx.json'), JSON.stringify(meta.sfx));
  let n = 0;
  for (let i = 0; i < meta.total * FPS; i++) for (let k = 0; k < SUB; k++) {
    await pg.evaluate(t => render(t), i / FPS + (k - (SUB - 1) / 2) * (0.5 / FPS) / SUB);
    await pg.screenshot({ path: path.join(dir, String(n++).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 93 });
  }
  await b.close();
  const wav = path.join(out, 'audio.wav');
  execFileSync('python3', [path.join(__dirname, 'audio.py'), wav, path.join(out, 'sfx.json')], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS * SUB), '-i', path.join(dir, '%05d.jpg'), '-i', wav,
    '-vf', `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`, '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    path.join(out, 'doomsday.mp4')], { stdio: 'inherit' });
  console.log('done');
})();
