// Render index.html frame by frame, then mux with the soundtrack.
// Usage: node render.js <outDir>
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30, SECONDS = 15;
const out = path.resolve(process.argv[2] || 'out');
const frames = path.join(out, 'frames');
fs.mkdirSync(frames, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  const total = FPS * SECONDS;
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.render(t), i / FPS);
    await page.screenshot({ path: path.join(frames, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 94 });
  }
  await browser.close();

  const wav = path.join(out, 'audio.wav');
  execFileSync('python3', [path.join(__dirname, 'audio.py'), wav], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
    '-shortest', '-movflags', '+faststart', path.join(out, 'what-i-can-do.mp4')], { stdio: 'inherit' });
  console.log('done', path.join(out, 'what-i-can-do.mp4'));
})();
