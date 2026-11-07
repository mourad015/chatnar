// Kinetic Arabic typography: each word arrives as it is spoken (rise + de-blur + settle), one gold glowing keyword,
// English subtitle beneath. Styles: default (lower third), hero (big, placed in the frame), impact (slam + RGB split),
// glow (gold with a travelling light sweep).
import { ctx, W, H, clamp, lerp, seg, eo, eob } from './lib.js';
import { T } from './timing.js';
const GOLD = '#F6C453';
let lines = [];
export function buildType() {
  lines = T.lines.map((l, i) => ({ ...l, show: l.start - 0.06, hide: T.lines[i + 1] ? T.lines[i + 1].start - 0.06 : l.end + 0.35,
    words: l.ar.split(/\s+/).filter(Boolean).map((w, k) => ({ txt: w.replace('*', ''), hi: w.startsWith('*'), t: l.wt[k] })) }));
}
export const typeList = () => lines;

function layout(words, size, maxW) {
  ctx.font = `900 ${size}px Cairo`; ctx.direction = 'rtl';
  const sp = size * 0.26; words.forEach((w) => (w.w = ctx.measureText(w.txt).width));
  const total = words.reduce((s, w) => s + w.w, 0) + sp * (words.length - 1);
  let rows = [words];
  if (total > maxW && words.length > 1) { let best = 1, bd = 1e9; for (let k = 1; k < words.length; k++) { const a = words.slice(0, k).reduce((s, w) => s + w.w + sp, -sp), b = words.slice(k).reduce((s, w) => s + w.w + sp, -sp), dd = Math.max(a, b); if (dd < bd) { bd = dd; best = k; } } rows = [words.slice(0, best), words.slice(best)]; }
  const fit = Math.min(1, maxW / Math.max(...rows.map((r) => r.reduce((s, w) => s + w.w + sp, -sp))));
  return { rows, sp, fit };
}

export function drawType(t) {
  const l = lines.find((l) => t >= l.show && t < l.hide); if (!l) return;
  const style = l.style || 'default', out = clamp((l.hide - t) / 0.16);
  const size = style === 'impact' ? 270 : style === 'hero' || style === 'glow' ? 140 : 80;
  const y0 = l.y ?? 1520, lh = size * 1.25;
  const { rows, sp, fit } = layout(l.words, size, style === 'default' ? 990 : 1000);
  ctx.save(); ctx.translate(W / 2, y0); ctx.scale(fit, fit);
  if (style === 'impact') { const k = 1 - eo(seg(t, l.show, l.show + 0.14)); ctx.translate(Math.sin(t * 95) * 22 * (1 - seg(t, l.show, l.show + 0.4)), 0); ctx.scale(1 + k * 1.4, 1 + k * 1.4); }
  ctx.translate(0, -(rows.length - 1) * lh / 2 - (1 - out) * 26);
  ctx.globalAlpha = out; ctx.textBaseline = 'middle'; ctx.textAlign = 'right'; ctx.direction = 'rtl'; ctx.font = `900 ${size}px Cairo`;
  rows.forEach((row, ri) => {
    const rw = row.reduce((s, w) => s + w.w + sp, -sp); let x = rw / 2; const y = ri * lh;
    row.forEach((w) => {
      const p = style === 'impact' ? 1 : seg(t, w.t - 0.05, w.t + 0.25);
      if (p > 0) {
        ctx.save(); const a = eo(p); ctx.globalAlpha = out * a;
        const cx = x - w.w / 2; ctx.translate(cx, y + (1 - a) * size * 0.45); const s = lerp(style === 'default' ? 1.12 : 1.3, 1, eob(p)); ctx.scale(s, s); ctx.translate(-cx, 0);
        if (p < 1) ctx.filter = `blur(${((1 - p) * size * 0.08).toFixed(1)}px)`;
        if (style === 'impact') {
          ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = '#FF2E3E'; ctx.fillText(w.txt, x - 9, 0); ctx.fillStyle = '#2EE6FF'; ctx.fillText(w.txt, x + 9, 0); ctx.globalCompositeOperation = 'source-over';
          ctx.shadowColor = 'rgba(255,40,40,0.9)'; ctx.shadowBlur = 50; ctx.fillStyle = '#FFFFFF'; ctx.fillText(w.txt, x, 0);
        } else {
          ctx.shadowColor = style === 'glow' ? 'rgba(60,20,30,0.85)' : 'rgba(0,0,0,0.65)'; ctx.shadowBlur = size * (style === 'glow' ? 0.35 : 0.25); ctx.shadowOffsetY = size * 0.05;
          ctx.fillStyle = w.hi || style === 'glow' ? GOLD : '#FFFFFF'; ctx.fillText(w.txt, x, 0);
          if (w.hi || style === 'glow') { ctx.shadowColor = 'rgba(255,196,80,0.85)'; ctx.shadowBlur = size * 0.4; ctx.shadowOffsetY = 0; ctx.fillText(w.txt, x, 0); }
          if (style === 'glow') { const sw = ((t - l.show) * 900) % 2200 - 600; const g = ctx.createLinearGradient(sw - 160, 0, sw + 160, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,240,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.shadowBlur = 0; ctx.fillStyle = g; ctx.save(); ctx.setTransform(ctx.getTransform().translate(-W / 2 + 0, 0)); ctx.restore(); ctx.fillText(w.txt, x, 0); }
        }
        ctx.restore();
      }
      x -= w.w + sp;
    });
  });
  ctx.restore();
  // English line
  if (l.en) {
    const ea = clamp((t - l.show - 0.12) / 0.3) * out, ey = y0 + (rows.length * lh) / 2 * fit + (style === 'default' ? 30 : 36);
    ctx.save(); ctx.globalAlpha = ea * 0.9; ctx.direction = 'ltr'; ctx.font = `800 ${style === 'default' ? 38 : 42}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '1px';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 14; ctx.fillStyle = '#EDE6D6'; ctx.fillText(l.en, W / 2, ey + (1 - ea) * 10, 960); ctx.restore();
  }
}
