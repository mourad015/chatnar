// The hero: an expressive stick figure. Ink body, glossy eyes with lids and brows, a red scarf that reacts to wind,
// breathing idle, a walk cycle with body bob, ground shadow and an optional rim glow.
import { ctx, lerp, clamp, TAU } from './lib.js';

export const INK = '#15151B', SCARF = '#E0483E', SCARF_D = '#B5322B';
const rad = (d) => d * Math.PI / 180;

function limb(x, y, l1, a1, l2, a2, dir, w) {
  const k = [x + Math.sin(rad(a1)) * l1 * dir, y + Math.cos(rad(a1)) * l1];
  const e = [k[0] + Math.sin(rad(a1 + a2)) * l2 * dir, k[1] + Math.cos(rad(a1 + a2)) * l2];
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(k[0], k[1]); ctx.lineTo(e[0], e[1]);
  ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  return e;
}

/** a face on a head of radius r centred at (x, y). o: mood, look [-1..1, -1..1], blink 0..1, tear 0..1, dir */
export function face(x, y, r, o = {}) {
  const m = o.mood || 'calm', lk = o.look || [0, 0], bl = o.blink || 0, d = o.dir || 1;
  const fx = x + d * r * 0.18, ey = y - r * 0.04, ex = r * 0.3;
  const wide = m === 'scared' || m === 'awe' ? 1.2 : 1;
  ctx.save(); ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    const cx = fx + s * ex, cy = ey;
    if (m === 'happy' || m === 'bliss') {   // closed smiling eyes
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.08, r * 0.16, Math.PI * 1.12, Math.PI * 1.88); ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.085; ctx.stroke(); continue;
    }
    const rx = r * 0.21 * wide, ry = r * 0.28 * wide * (1 - bl * 0.94);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, Math.max(0.5, ry), 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
    if (bl < 0.7) {
      const px = cx + lk[0] * rx * 0.45, py = cy + lk[1] * ry * 0.45, pr = r * (m === 'scared' ? 0.075 : 0.115);
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, Math.max(0.5, ry), 0, 0, TAU); ctx.clip();
      ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fillStyle = INK; ctx.fill();
      ctx.beginPath(); ctx.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.32, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();   // glint
      if (o.wet) { ctx.beginPath(); ctx.ellipse(cx, cy + ry * 0.75, rx, ry * 0.32, 0, 0, TAU); ctx.fillStyle = 'rgba(160,210,255,0.55)'; ctx.fill(); }
      // eyelids: sad = outer corner droops, bored = flat half lid
      ctx.fillStyle = INK;
      if (m === 'sad' || m === 'hurt') { ctx.beginPath(); ctx.moveTo(cx - rx * 1.3, cy - ry * (s > 0 ? 0.15 : 1.3)); ctx.lineTo(cx + rx * 1.3, cy - ry * (s > 0 ? 1.3 : 0.15)); ctx.lineTo(cx + rx * 1.3, cy - ry * 1.6); ctx.lineTo(cx - rx * 1.3, cy - ry * 1.6); ctx.closePath(); ctx.fill(); }
      if (m === 'bored') ctx.fillRect(cx - rx * 1.2, cy - ry * 1.2, rx * 2.4, ry * 1.15);
      if (m === 'determined') { ctx.beginPath(); ctx.moveTo(cx - rx * 1.3, cy - ry * (s > 0 ? 1.3 : 0.35)); ctx.lineTo(cx + rx * 1.3, cy - ry * (s > 0 ? 0.35 : 1.3)); ctx.lineTo(cx + rx * 1.3, cy - ry * 1.6); ctx.lineTo(cx - rx * 1.3, cy - ry * 1.6); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
  }
  // brows
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.07;
  if (m === 'sad' || m === 'hurt' || m === 'scared') for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(fx + s * ex - s * r * 0.2, ey - r * 0.44 - r * 0.02); ctx.lineTo(fx + s * ex + s * r * 0.18, ey - r * 0.36 + (m === 'scared' ? -r * 0.08 : r * 0.06)); ctx.stroke(); }
  // mouth
  ctx.lineWidth = r * 0.075; ctx.beginPath(); const my = y + r * 0.46;
  if (m === 'happy' || m === 'bliss') { ctx.arc(fx, my - r * 0.1, r * 0.2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  else if (m === 'scared' || m === 'awe') { ctx.beginPath(); ctx.ellipse(fx, my, r * 0.08, r * (m === 'awe' ? 0.1 : 0.13), 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); }
  else if (m === 'sad' || m === 'hurt') { ctx.moveTo(fx - r * 0.15, my + r * 0.04); ctx.quadraticCurveTo(fx, my - r * 0.08, fx + r * 0.15, my + r * 0.04); ctx.stroke(); }
  else if (m === 'smile') { ctx.arc(fx, my - r * 0.12, r * 0.16, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  else { ctx.moveTo(fx - r * 0.1, my); ctx.lineTo(fx + r * 0.1, my); ctx.stroke(); }
  // tear: forms under the eye and rolls down the cheek
  if (o.tear > 0) {
    const tx = fx + ex * 0.9 + r * 0.05, k = clamp((o.tear - 0.25) / 0.75), ty = ey + r * 0.3 + k * r * 0.55, ts = r * 0.07 * clamp(o.tear * 4);
    ctx.beginPath(); ctx.moveTo(tx, ty - ts * 1.8); ctx.quadraticCurveTo(tx + ts, ty, tx, ty + ts); ctx.quadraticCurveTo(tx - ts, ty, tx, ty - ts * 1.8); ctx.fillStyle = '#BFE3FF'; ctx.fill();
    if (k > 0) { ctx.globalAlpha = 0.35; ctx.strokeStyle = '#BFE3FF'; ctx.lineWidth = ts * 0.6; ctx.beginPath(); ctx.moveTo(tx, ey + r * 0.3); ctx.lineTo(tx, ty - ts); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  ctx.restore();
}

function scarf(nx, ny, h, dir, t, wind) {
  const n = 7, L = h * 0.05, pts = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n, sag = (1 - wind) * k * k * h * 0.11;
    pts.push([nx - dir * i * L * (0.35 + wind * 0.75), ny + i * h * 0.006 + sag + Math.sin(t * (6 + wind * 6) - i * 0.9) * h * 0.012 * (0.3 + wind) * k]);
  }
  ctx.beginPath();
  pts.forEach(([x, y], i) => { const w = h * 0.022 * (1 - i / n * 0.5); i ? ctx.lineTo(x, y - w) : ctx.moveTo(x, y - w); });
  for (let i = n; i >= 0; i--) { const w = h * 0.022 * (1 - i / n * 0.5); ctx.lineTo(pts[i][0], pts[i][1] + w); }
  ctx.closePath(); ctx.fillStyle = SCARF; ctx.fill();
  ctx.beginPath(); ctx.ellipse(nx, ny, h * 0.04, h * 0.024, 0, 0, TAU); ctx.fillStyle = SCARF_D; ctx.fill();
}

/**
 * hero({ x, y (ground), h, dir, t, walk (phase rad), pose: { arms: {L, R}, legs: {L, R} } (deg, 0 = down, + = forward),
 *   lean, headTilt, mood, look, blink, tear, wet, wind 0..1, glow ('rgba(..)'), shadow (true), hipY (override for sitting),
 *   breathe (default true), scale squash })
 */
export function hero(o) {
  const h = o.h || 500, d = o.dir || 1, w = h * 0.036, t = o.t || 0;
  const wk = o.walk, sw = wk != null ? Math.sin(wk) : 0;
  const bob = wk != null ? -Math.abs(Math.cos(wk)) * h * 0.022 : (o.breathe === false ? 0 : Math.sin(t * 2.2) * h * 0.004);
  const hipY = (o.hipY ?? o.y - h * 0.46) + bob, shY = hipY - h * 0.31, r = h * 0.105;
  if (o.shadow !== false && o.hipY == null) { ctx.save(); ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.ellipse(o.x, o.y + h * 0.01, h * 0.16, h * 0.025, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore(); }
  ctx.save();
  if (o.glow) ctx.filter = `drop-shadow(0 0 ${Math.max(2, Math.round(h * 0.016))}px ${o.glow})`;
  ctx.translate(o.x, hipY); ctx.rotate(rad((o.lean || 0) * d)); ctx.translate(-o.x, -hipY);
  const P = o.pose || {};
  const legs = P.legs || { L: [wk != null ? sw * 30 : 5, wk != null ? Math.max(0, -sw) * 45 + 6 : 4], R: [wk != null ? -sw * 30 : -5, wk != null ? Math.max(0, sw) * 45 + 6 : 4] };
  const arms = P.arms || { L: [wk != null ? -sw * 28 : -8 + Math.sin(t * 2.2) * 2, 14], R: [wk != null ? sw * 28 : 8 - Math.sin(t * 2.2) * 2, 16] };
  limb(o.x, hipY, h * 0.25, legs.L[0], h * 0.23, -legs.L[1], d, w);
  limb(o.x, shY + h * 0.02, h * 0.17, arms.L[0], h * 0.16, arms.L[1], d, w);
  ctx.beginPath(); ctx.moveTo(o.x, hipY); ctx.lineTo(o.x, shY); ctx.strokeStyle = INK; ctx.lineWidth = w * 1.2; ctx.lineCap = 'round'; ctx.stroke();
  limb(o.x, hipY, h * 0.25, legs.R[0], h * 0.23, -legs.R[1], d, w);
  // head (tilts around the neck)
  const tilt = rad((o.headTilt || 0) * d);
  const hx = o.x + Math.sin(tilt) * r * 1.12 + d * r * 0.05, hy = shY - Math.cos(tilt) * r * 1.12;
  ctx.filter = 'none';
  if (o.scarf !== false) scarf(o.x, shY + h * 0.01, h, d, t, o.wind ?? 0.4);
  if (o.glow) ctx.filter = `drop-shadow(0 0 ${Math.max(2, Math.round(h * 0.016))}px ${o.glow})`;
  ctx.beginPath(); ctx.arc(hx, hy, r, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  const hand = limb(o.x, shY + h * 0.02, h * 0.17, arms.R[0], h * 0.16, arms.R[1], d, w);
  ctx.beginPath(); ctx.arc(hand[0], hand[1], w * 0.85, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.filter = 'none';
  face(hx, hy, r, { ...o, dir: d });
  ctx.restore();
  return { hand, head: [hx, hy, r] };
}

/** a big head for close-ups */
export function bigFace(x, y, r, o = {}) {
  ctx.save(); if (o.glow) ctx.filter = `drop-shadow(0 0 ${Math.round(r * 0.06)}px ${o.glow})`;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
  face(x - (o.dir || 1) * r * 0.18, y, r, o);
}

/** pose presets (deg) */
export const POSE = {
  armsUp: { arms: { L: [-165, 8], R: [165, -8] } },
  openPalms: { arms: { L: [-40, -70], R: [40, 70] } },
  handChest: { arms: { L: [-6, 14], R: [30, 145] } },
  reach: { arms: { L: [-20, 20], R: [95, -5] } },
  flinch: { arms: { L: [-60, 60], R: [-50, 70] }, legs: { L: [30, 60], R: [-20, 10] } },
};
