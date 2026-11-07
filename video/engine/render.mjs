// Render an episode page to MP4.
// node engine/render.mjs --ep episodes/ep01 [--from 0] [--to 999] [--scale 1] [--workers 4] [--stills 1.2,5,9]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? a.concat([[v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]]) : a), []));
const root = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const ep = path.resolve(root, args.ep || 'episodes/ep01');
const fps = +(args.fps || 30), scale = +(args.scale || 1), workers = +(args.workers || 4);
const outDir = path.join(ep, 'out'); fs.mkdirSync(outDir, { recursive: true });
const pageUrl = url.pathToFileURL(path.join(ep, 'index.html')).href;

async function openPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
  await page.goto(pageUrl);
  await page.evaluate(() => window.ready);
  return page;
}

const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
const probe = await openPage(browser);
const meta = await probe.evaluate(() => ({ duration: window.DURATION, sfx: window.K.SFX }));

if (args.stills) {
  for (const t of String(args.stills).split(',').map(Number)) {
    await probe.evaluate((t) => window.seek(t), t);
    await probe.screenshot({ path: path.join(outDir, `still_${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 85 });
  }
  console.log('stills done'); await browser.close(); process.exit(0);
}

const t0 = +(args.from || 0), t1 = Math.min(+(args.to || 1e9), meta.duration);
const nFrames = Math.ceil((t1 - t0) * fps);
const per = Math.ceil(nFrames / workers);
console.log(`render ${t0}-${t1.toFixed(2)}s, ${nFrames} frames, ${workers} workers, scale ${scale}`);
const started = Date.now();

async function renderRange(w) {
  const a = w * per, b = Math.min(nFrames, a + per);
  if (a >= b) return null;
  const page = w === 0 ? probe : await openPage(browser);
  const seg = path.join(outDir, `seg${w}.mp4`);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  await page.evaluate(() => window.seek(0));
  for (let f = a; f < b; f++) {
    await page.evaluate((t) => window.seek(t), t0 + f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (w === 0 && (f - a) % 150 === 0) console.log(`  ${Math.round((f - a) / (b - a) * 100)}%  ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  return seg;
}
const segs = (await Promise.all([...Array(workers).keys()].map(renderRange))).filter(Boolean);
await browser.close();

// concat video segments
const list = path.join(outDir, 'segs.txt');
fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
const silent = path.join(outDir, 'video_silent.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
segs.forEach((s) => fs.unlinkSync(s)); fs.unlinkSync(list);

// audio: voice-over + sound effects
const sfxFile = path.join(outDir, 'sfx.json');
fs.writeFileSync(sfxFile, JSON.stringify(meta.sfx));
const mix = path.join(outDir, 'mix.wav');
execFileSync('python3', ['-I', path.join(root, 'engine', 'mix.py'), path.join(ep, 'assets', 'vo.wav'), sfxFile, path.join(root, 'engine', 'sfx'), mix, String(t0), String(t1)], { stdio: 'inherit' });
const out = path.join(outDir, args.out || (t0 === 0 && t1 === meta.duration ? 'final.mp4' : `preview_${t0}-${t1.toFixed(0)}.mp4`));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', silent, '-i', mix, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
fs.unlinkSync(silent);
console.log(`done -> ${out} in ${((Date.now() - started) / 1000).toFixed(0)}s`);
