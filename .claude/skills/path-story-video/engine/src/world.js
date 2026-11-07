// Environments: layered skies, ridges, forests, weather, light. All flat shapes + soft gradients, no images.
import { ctx, W, H, lerp, clamp, rnd, TAU } from './lib.js';

export const hex = (h) => h[0] === '#' ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : h.match(/[\d.]+/g).slice(0, 3).map(Number);
export const mix = (a, b, t) => { const A = hex(a), B = hex(b); t = clamp(t); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };
export const rgba = (h, a) => { const c = hex(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

/** vertical gradient fill; stops = [[pos, color], ...] between y0 and y1 */
export function grad(stops, y0 = 0, y1 = H) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([p, c]) => g.addColorStop(p, c));
  ctx.fillStyle = g; ctx.fillRect(-2000, -3000, W + 4000, H + 6000);
}
export function glow(x, y, r, color, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(color, a)); g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
export function sun(x, y, r, core = '#FFF4D6', halo = '#FFC870', a = 1) {
  ctx.save(); ctx.globalAlpha = a; glow(x, y, r * 7, halo, 0.45); glow(x, y, r * 2.4, halo, 0.7);
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = core; ctx.fill(); ctx.restore();
}
/** a ridge silhouette: base y, amplitude, seed, colour; off = horizontal scroll; sharp > 0 = pointier peaks */
export function ridge(base, amp, seed, color, off = 0, sharp = 0, x0 = -1200, x1 = W + 1200) {
  ctx.beginPath(); ctx.moveTo(x0, H + 3000);
  for (let x = x0; x <= x1; x += 18) {
    const u = x + off;
    let n = 0.55 * Math.sin(u * 0.0042 + seed) + 0.3 * Math.sin(u * 0.0107 + seed * 2.3) + 0.15 * Math.sin(u * 0.025 + seed * 4.1);
    if (sharp) n = lerp(n, 1 - Math.abs(Math.sin(u * 0.0035 + seed)) * 2, sharp);
    ctx.lineTo(x, base - amp * (0.5 + 0.5 * n));
  }
  ctx.lineTo(x1, H + 3000); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
export function haze(y, h, color, a) { const g = ctx.createLinearGradient(0, y - h, 0, y + h); g.addColorStop(0, rgba(color, 0)); g.addColorStop(0.5, rgba(color, a)); g.addColorStop(1, rgba(color, 0)); ctx.fillStyle = g; ctx.fillRect(-2000, y - h, W + 4000, h * 2); }

export function pine(x, y, h, c) {
  ctx.fillStyle = c; ctx.fillRect(x - h * 0.03, y - h * 0.15, h * 0.06, h * 0.16);
  for (let i = 0; i < 3; i++) { const yy = y - h * 0.12 - i * h * 0.26, ww = h * (0.33 - i * 0.07); ctx.beginPath(); ctx.moveTo(x - ww, yy); ctx.lineTo(x, yy - h * 0.42); ctx.lineTo(x + ww, yy); ctx.closePath(); ctx.fill(); }
}
export function roundTree(x, y, s, trunk, leaf, leafHi) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = trunk; ctx.fillRect(-12, -140, 24, 140);
  for (const [dx, dy, r] of [[0, -210, 95], [-58, -165, 64], [58, -165, 64]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, TAU); ctx.fillStyle = leaf; ctx.fill(); }
  ctx.beginPath(); ctx.arc(-24, -238, 46, 0, TAU); ctx.fillStyle = leafHi; ctx.fill(); ctx.restore();
}
export function cloud(x, y, s, c, hi, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  for (const [dx, dy, r] of [[-130, 20, 80], [-40, -30, 110], [80, -5, 95], [0, 35, 95], [170, 35, 62], [-200, 45, 55]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); }
  if (hi) for (const [dx, dy, r] of [[-40, -50, 80], [80, -25, 65], [-130, 5, 50]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, TAU); ctx.fillStyle = hi; ctx.fill(); }
  ctx.restore();
}
export function rays(x, y, t, a, n = 9, len = 2600, spread = 0.6, color = '#FFE3A1', dirA = Math.PI / 2) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const ang = dirA + (i / Math.max(1, n - 1) - 0.5) * spread * 2 + Math.sin(t * 0.5 + i * 1.7) * 0.025, wd = 0.03 + rnd(i) * 0.035;
    const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.addColorStop(0, rgba(color, 0.22 * a * (0.6 + rnd(i + 3) * 0.6))); g.addColorStop(1, rgba(color, 0));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang - wd) * len, y + Math.sin(ang - wd) * len); ctx.lineTo(x + Math.cos(ang + wd) * len, y + Math.sin(ang + wd) * len); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  }
  ctx.restore();
}
/** screen-space rain; slant in px per streak */
export function rain(t, a, n = 140, slant = -14, color = '#A9C3E8', len = 60) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = 0.5 * a; ctx.strokeStyle = color; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const depth = 0.4 + rnd(i + 2) * 0.9, sp = 1700 * depth, x = rnd(i) * (W + 200) - 100, y = ((rnd(i + 7) * 2300 + t * sp) % 2300) - 200;
    ctx.lineWidth = 2 + depth * 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + slant * depth, y + len * depth); ctx.stroke();
  }
  ctx.restore();
}
export function splashes(t, a, y0, y1, n = 26) {
  if (a <= 0) return; ctx.save(); ctx.strokeStyle = 'rgba(190,210,240,0.6)'; ctx.lineWidth = 3;
  for (let i = 0; i < n; i++) { const ph = (t * 2.2 + rnd(i)) % 1, x = rnd(i + 5) * W, y = lerp(y0, y1, rnd(i + 9)); ctx.globalAlpha = a * (1 - ph); ctx.beginPath(); ctx.ellipse(x, y, 6 + ph * 34, 2 + ph * 8, 0, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
/** soft floating light particles */
export function motes(t, a, n = 26, color = '#FFE2A0', area = [0, 0, W, H], rise = 30) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const r = 4 + rnd(i + 1) * 14, x = area[0] + (rnd(i) * area[2] + Math.sin(t * 0.6 + i) * 30), y = area[1] + ((rnd(i + 4) * area[3] - t * rise * (0.5 + rnd(i))) % area[3] + area[3]) % area[3];
    const tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 2.1);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4); g.addColorStop(0, rgba(color, 0.75 * a * tw)); g.addColorStop(1, rgba(color, 0)); ctx.fillStyle = g; ctx.fillRect(x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
  }
  ctx.restore();
}
/** lens flare: ghosts along the line from the light through the frame centre */
export function flare(x, y, a) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; const cx = W / 2, cy = H * 0.45;
  [[0.35, 40, '#FFD58A', 0.25], [0.7, 18, '#9FE3FF', 0.3], [1.15, 70, '#FFB37A', 0.12], [1.5, 28, '#C7A2FF', 0.2], [1.85, 110, '#FFE7B0', 0.08]].forEach(([k, r, c, al]) => {
    const fx = lerp(x, cx + (cx - x), k / 2), fy = lerp(y, cy + (cy - y), k / 2); glow(fx, fy, r * 2, c, al * a * 2); });
  ctx.restore();
}
export function lightning(x, y0, y1, seed, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#EAF2FF'; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.shadowColor = '#BFD8FF'; ctx.shadowBlur = 40;
  ctx.beginPath(); let px = x, py = y0; ctx.moveTo(px, py);
  for (let i = 1; i <= 9; i++) { px += (rnd(seed + i) - 0.5) * 140; py = lerp(y0, y1, i / 9); ctx.lineTo(px, py); }
  ctx.stroke(); ctx.restore();
}
/** a glowing golden path along points, drawn up to length len */
export function goldPath(pts, len, w, glowPx = 20, color = '#F6C453', a = 1) {
  if (len <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); let l = len;
  for (let i = 1; i < pts.length && l > 0; i++) { const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], s = Math.hypot(dx, dy), k = Math.min(1, l / s); ctx.lineTo(pts[i - 1][0] + dx * k, pts[i - 1][1] + dy * k); l -= s; }
  if (glowPx) { ctx.shadowColor = rgba('#FFC860', 0.95); ctx.shadowBlur = glowPx; }
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,248,220,0.8)'; ctx.lineWidth = w * 0.3; ctx.stroke();
  ctx.restore();
}
export const polyLen = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
export function pointAt(pts, len) { let l = len; for (let i = 1; i < pts.length; i++) { const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (l <= s) { const k = l / s; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; } l -= s; } const n = pts.length - 1; return [pts[n][0], pts[n][1], 0]; }
/** smooth a polyline with Chaikin corner cutting */
export function smooth(pts, it = 3) { let p = pts; for (let k = 0; k < it; k++) { const q = [p[0]]; for (let i = 0; i < p.length - 1; i++) { q.push([0.75 * p[i][0] + 0.25 * p[i + 1][0], 0.75 * p[i][1] + 0.25 * p[i + 1][1]], [0.25 * p[i][0] + 0.75 * p[i + 1][0], 0.25 * p[i][1] + 0.75 * p[i + 1][1]]); } q.push(p[p.length - 1]); p = q; } return p; }
export function bird(x, y, s, t, c = '#2A2230') { const f = Math.sin(t * 14) * 0.6; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-30, -f * 20); ctx.quadraticCurveTo(-12, -8, 0, 4); ctx.quadraticCurveTo(12, -8, 30, -f * 20); ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
