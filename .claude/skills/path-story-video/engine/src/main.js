// Engine: shots render into an offscreen buffer, transitions composite two shots, then the frame is graded
// (saturation/contrast/tint), bloomed, vignetted, letterboxed, typed and grained. draw(t) is a pure function of t.
import { W, H, setCtx, clamp, lerp, eo, eio, rnd } from './lib.js';
import { T, loadTiming } from './timing.js';
import { buildType, drawType, typeList } from './type.js';
import { buildShots } from './shots.js';

const cv = document.getElementById('cv'), M = cv.getContext('2d');
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const [bufA, A] = mk(), [bufB, B] = mk(), [bufC, C] = mk(), [small, SM] = mk(270, 480);
const grains = [0, 1, 2].map((s) => { const [c, g] = mk(540, 960); const im = g.createImageData(540, 960); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (Math.random() - 0.5) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); return c; });
const OP = (window.OP = { ready: false });

function render(sh, lt, t, g) {
  setCtx(g); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.save(); sh.draw(Math.max(0, lt), sh.d, t); g.restore();
}
function blurCopies(g, img, dx, dy, n, sc = 0) { // directional motion blur by stacking offset copies
  for (let k = 0; k < n; k++) { const f = k / (n - 1) - 0.5; g.globalAlpha = k === 0 ? 1 : 0.32; g.save(); g.translate(W / 2 + dx * f, H / 2 + dy * f); g.scale(1 + sc * f, 1 + sc * f); g.drawImage(img, -W / 2, -H / 2); g.restore(); }
  g.globalAlpha = 1;
}
function composite(t) {
  const S = OP._shots; let i = S.length - 1; while (i > 0 && S[i].at > t) i--;
  const sh = S[i], lt = t - sh.at, tin = sh.tin;
  render(sh, lt, t, B);
  if (!tin || i === 0 || lt >= tin.d) return [bufB, sh, lt];
  const prev = S[i - 1], p = clamp(lt / tin.d);
  render(prev, t - prev.at, t, A);
  C.setTransform(1, 0, 0, 1, 0, 0); C.globalAlpha = 1; C.globalCompositeOperation = 'source-over'; C.fillStyle = '#000'; C.fillRect(0, 0, W, H);
  const ty = tin.type;
  if (ty === 'fade') { C.drawImage(bufA, 0, 0); C.globalAlpha = eio(p); C.drawImage(bufB, 0, 0); }
  else if (ty === 'dip') { if (p < 0.5) { C.globalAlpha = 1 - eio(p * 2); C.drawImage(bufA, 0, 0); } else { C.globalAlpha = eio((p - 0.5) * 2); C.drawImage(bufB, 0, 0); } }
  else if (ty === 'flash') { C.drawImage(bufB, 0, 0); C.globalAlpha = Math.pow(1 - p, 1.6); C.fillStyle = tin.color || '#FFFFFF'; C.fillRect(0, 0, W, H); }
  else if (ty === 'whip') {
    const d = tin.dir || 1, e = eio(p), sp = Math.sin(p * Math.PI) * 420;
    C.save(); C.translate(-d * W * e, 0); blurCopies(C, bufA, d * sp, 0, 6); C.restore();
    C.save(); C.translate(d * W * (1 - e), 0); blurCopies(C, bufB, d * sp, 0, 6); C.restore();
  } else if (ty === 'zoom') {
    const e = eio(p);
    if (p < 0.55) { C.globalAlpha = 1; C.save(); C.translate(W / 2, H / 2); C.scale(1 + e * 2.2, 1 + e * 2.2); C.translate(-W / 2, -H / 2); blurCopies(C, bufA, 0, 0, 5, 0.18 * Math.sin(p * Math.PI)); C.restore(); }
    C.globalAlpha = clamp((p - 0.3) / 0.45); C.save(); C.translate(W / 2, H / 2); const s = lerp(1.6, 1, e); C.scale(s, s); C.translate(-W / 2, -H / 2); blurCopies(C, bufB, 0, 0, 5, 0.12 * (1 - p)); C.restore();
  } else C.drawImage(bufB, 0, 0);
  C.globalAlpha = 1;
  return [bufC, sh, lt];
}

function draw(t) {
  t = clamp(t, 0, T.dur - 1e-4);
  const [img, sh, lt] = composite(t);
  const g = Object.assign({ sat: 1, con: 1.05, bri: 1, vig: 0.45, bloom: 0.25, bars: 0, tint: null, tintA: 0, mode: 'soft-light', shake: 0 }, sh.grade ? sh.grade(lt) : {});
  setCtx(M); M.setTransform(1, 0, 0, 1, 0, 0); M.globalAlpha = 1; M.globalCompositeOperation = 'source-over';
  M.fillStyle = '#000'; M.fillRect(0, 0, W, H);
  M.save(); if (g.shake) M.translate(Math.sin(t * 83) * g.shake, Math.cos(t * 71) * g.shake);
  M.filter = `saturate(${g.sat}) contrast(${g.con}) brightness(${g.bri})`; M.drawImage(img, 0, 0); M.filter = 'none'; M.restore();
  if (g.tint && g.tintA > 0) { M.globalCompositeOperation = g.mode; M.globalAlpha = g.tintA; M.fillStyle = g.tint; M.fillRect(0, 0, W, H); M.globalCompositeOperation = 'source-over'; M.globalAlpha = 1; }
  if (g.bloom > 0) {
    SM.globalCompositeOperation = 'copy'; SM.filter = 'brightness(0.9) contrast(2.2) blur(7px)'; SM.drawImage(cv, 0, 0, 270, 480); SM.filter = 'none';
    M.globalCompositeOperation = 'screen'; M.globalAlpha = g.bloom; M.drawImage(small, 0, 0, W, H); M.globalCompositeOperation = 'source-over'; M.globalAlpha = 1;
  }
  const vg = M.createRadialGradient(W / 2, H * 0.48, H * 0.25, W / 2, H * 0.5, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${g.vig})`); M.fillStyle = vg; M.fillRect(0, 0, W, H);
  const sc = M.createLinearGradient(0, 1200, 0, H); sc.addColorStop(0, 'rgba(0,0,0,0)'); sc.addColorStop(1, 'rgba(0,0,0,0.62)'); M.fillStyle = sc; M.fillRect(0, 1200, W, H - 1200);
  if (g.bars > 0) { M.fillStyle = '#000'; const bh = 150 * g.bars; M.fillRect(0, 0, W, bh); M.fillRect(0, H - bh, W, bh); }
  setCtx(M); drawType(t);
  M.globalCompositeOperation = 'overlay'; M.globalAlpha = 0.09; const gi = Math.floor(t * 24) % 3; M.drawImage(grains[gi], -((t * 997) % 60), -((t * 613) % 60), W + 120, H + 120); M.globalCompositeOperation = 'source-over'; M.globalAlpha = 1;
  const fade = Math.min(clamp(t / 0.35), clamp((T.dur - t) / 0.6)); if (fade < 1) { M.fillStyle = '#000'; M.globalAlpha = 1 - fade; M.fillRect(0, 0, W, H); M.globalAlpha = 1; }
}

(async () => {
  try {
    await document.fonts.load('900 100px Inter'); await document.fonts.load('800 100px Inter');
    await document.fonts.load('900 100px Cairo', 'ليه يا رب'); await document.fonts.load('800 100px Cairo', 'ليه يا رب');
    const script = await (await fetch('script.json', { cache: 'no-store' })).json();
    await loadTiming(); buildType();
    const { shots, cues } = buildShots(); shots.sort((a, b) => a.at - b.at);
    shots.forEach((s, i) => (s.d = (i < shots.length - 1 ? shots[i + 1].at : T.dur) - s.at));
    OP._shots = shots; OP.script = script; OP.duration = () => T.dur; OP.draw = draw;
    OP.frame = (t, q = 0.92) => { draw(t); return cv.toDataURL('image/jpeg', q); };
    OP.shots = () => shots.map((s) => ({ id: s.id, at: +s.at.toFixed(3), end: +(s.at + s.d).toFixed(3), note: s.note || '' }));
    OP.captions = () => typeList().map((c) => ({ s: +c.show.toFixed(3), e: +c.hide.toFixed(3), text: c.ar }));
    OP.cues = () => cues.slice().sort((a, b) => a.t - b.t);
    OP.ready = true;
    const q = new URLSearchParams(location.search);
    if (!q.has('capture')) { if (q.has('t')) draw(+q.get('t')); else { const au = new Audio('data/mix.wav'); let t0 = null; const btn = document.getElementById('play'); btn.hidden = false; btn.onclick = () => { btn.hidden = true; t0 = performance.now(); au.currentTime = 0; au.play().catch(() => {}); }; const loop = (now) => { const tt = t0 == null ? 0 : (now - t0) / 1000; draw(tt); if (t0 != null && tt > T.dur) { t0 = null; btn.hidden = false; } requestAnimationFrame(loop); }; requestAnimationFrame(loop); } }
  } catch (e) { OP.bootError = String(e && e.stack || e); console.error(e); }
})();
