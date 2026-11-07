// Usage: node render.js <startFrame> <endFrame> <out.mp4>   (no args: render stills listed via --stills t1,t2,...)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'index.html') + '?render=1');
  await page.waitForFunction(() => window.renderFrame);
  await page.evaluate(() => document.fonts.ready);
  const args = process.argv.slice(2);
  if (args[0] === '--stills') {
    const outDir = args[2];
    for (const t of args[1].split(',')) {
      const d = await page.evaluate(i => window.renderFrame(i), Math.round(+t * 30));
      fs.writeFileSync(path.join(outDir, `still_${t}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
    }
  } else {
    const [start, end, out] = [+args[0], +args[1], args[2]];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = start; i < end; i++) {
      const d = await page.evaluate(i => window.renderFrame(i), i);
      if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
