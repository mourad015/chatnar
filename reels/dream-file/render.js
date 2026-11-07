// Parallel render: W workers each take a slice of frames (2 sub-frames each for motion blur), then ffmpeg blends + muxes the voiceover mix.
// Usage: node render.js <outDir> <voiceover.mp3> [workers]
const { chromium } = require('playwright'); const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30, SUB = 2; const out = path.resolve(process.argv[2]), vo = process.argv[3], WK = +(process.argv[4] || 3);
const dir = path.join(out, 'sub'); fs.mkdirSync(dir, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const probe = await b.newPage(); await probe.goto('file://' + path.join(__dirname, 'index.html')); await probe.evaluate(() => window.ready);
  const total = await probe.evaluate(() => window.TOTAL); await probe.close();
  const frames = Math.round(total * FPS);
  await Promise.all(Array.from({ length: WK }, async (_, w) => {
    const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    pg.on('pageerror', e => console.log('ERR', e.message));
    await pg.goto('file://' + path.join(__dirname, 'index.html')); await pg.evaluate(() => window.ready);
    for (let i = w; i < frames; i += WK) for (let k = 0; k < SUB; k++) {
      const f = path.join(dir, String(i * SUB + k).padStart(6, '0') + '.jpg'); if (fs.existsSync(f)) continue;
      await pg.evaluate(t => render(t), i / FPS + (k - (SUB - 1) / 2) * (0.5 / FPS) / SUB);
      await pg.screenshot({ path: f, type: 'jpeg', quality: 92 });
    }
  }));
  await b.close();
  const wav = path.join(out, 'mix.wav');
  execFileSync('python3', [path.join(__dirname, 'audio.py'), vo, wav], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS * SUB), '-i', path.join(dir, '%06d.jpg'), '-i', wav,
    '-vf', `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`, '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    path.join(out, 'dream-file.mp4')], { stdio: 'inherit' });
  console.log('done');
})();
