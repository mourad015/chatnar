// Renders outro.html to PNG frames: node render.js <outdir> [fps]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2] || 'frames', fps = +(process.argv[3] || 60), dur = 5;
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, 'outro.html'));
  console.log('font loaded:', await p.evaluate(() => window.ready));
  for (let i = 0; i < fps * dur; i++) {
    await p.evaluate(t => render(t), i / fps);
    await p.screenshot({ path: `${out}/f${String(i).padStart(4, '0')}.png` });
  }
  await b.close();
})();
