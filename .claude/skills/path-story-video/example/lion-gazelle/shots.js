// قاعدة الغزالة والأسد : "God gives the worm to the bird, but doesn't drop it in her lap" → the lion and the gazelle
// → every morning, whoever you are: RUN.
// One world: a savanna under a rising sun. The proverb plays out with a bird, a lion and gazelles; then our hero wakes
// up, his shadow is a gazelle, then a lion; he runs, grows, passes a grey, defeated crowd, and runs into that same sunrise.
// Colour script: red-gold proverb dawn → warm gift of light → neutral waiting → bright effort → hot chase → red shock
// → grey hunger → soft bedroom dawn → gold run → grey-blue city crowd → gold sunrise ending.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './lib.js';
import { L, Wt } from './timing.js';
import { hero, bigFace, POSE, INK } from './fig.js';
import * as Wd from './world.js';
const { mix, rgba, grad, glow, sun, ridge, haze, cloud, rays, rain, motes, flare, goldPath, polyLen } = Wd;

const cam = (cx, cy, z = 1, rot = 0, sx = W / 2, sy = H / 2) => { ctx.translate(sx, sy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy); };
const blink = (t, k = 0) => (((t + k) % 3.4) < 0.11 ? 1 : 0);
const GOLDC = '#F6C453', MANE = '#C8873A', MANE_D = '#9E6326', WORM = '#F2A08A';
const rad = (d) => d * Math.PI / 180;

// ═════════════════ the savanna ═════════════════
const GR = 1440;
/** o: tod 0 = red dawn → 1 = bright morning, sunX, sunY, redSun (big Chinese-red disc), grey (desaturate to dusk) */
function savanna(camX, t, o = {}) {
  const tod = o.tod ?? 0.3, grey = o.grey ?? 0;
  const P = (a, b) => mix(mix(a, b, tod), '#7E7A86', grey);
  grad([[0, P('#2C2766', '#5FA6D6')], [0.42, P('#B4507A', '#9ED0E8')], [0.7, P('#F2844C', '#F4E2B8')], [1, P('#FFD08A', '#FFF1CF')]], -700, 1280);
  const sx = (o.sunX ?? 560) - camX * 0.03, sy = o.sunY ?? 1050;
  if (o.redSun) { glow(sx, sy, 900, '#FF7A4A', 0.45 * (1 - grey)); ctx.beginPath(); ctx.arc(sx, sy, o.redSun, 0, TAU); ctx.fillStyle = P('#E8452E', '#FFD27A'); ctx.fill(); }
  else sun(sx, sy, o.sunR ?? 95, '#FFF6DE', P('#FF9A50', '#FFE2A0'), 1 - grey * 0.7);
  ridge(1180, 170, 31, P('#B0627E', '#C6B79A'), camX * 0.12, 0.2); haze(1150, 140, P('#FFB080', '#FFF2D8'), 0.5);
  ridge(1260, 90, 33, P('#7E4A6A', '#B49A6E'), camX * 0.3);
  // acacia silhouettes (mid layer)
  for (let i = Math.floor(camX * 0.5 / 520) - 2; i < Math.floor(camX * 0.5 / 520) + 4; i++) acacia(i * 520 + rnd(i + 9) * 200 - camX * 0.5 + 540, 1300, 0.55 + rnd(i) * 0.35, P('#4A2A44', '#6B5A3A'));
  ctx.fillStyle = P('#8E4E3E', '#D3A05A'); ctx.fillRect(-1500, 1290, W + 3000, 2000);
  ctx.fillStyle = P('#A35E44', '#DDB06A'); ctx.fillRect(-1500, 1380, W + 3000, 2000);
  ctx.strokeStyle = P('#6E3A34', '#B07E3E'); ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = Math.floor(camX / 70) - 12; i < Math.floor(camX / 70) + 22; i++) { const x = i * 70 + rnd(i) * 50 - camX + 540, y = 1400 + rnd(i + 2) * 420, hh = 20 + rnd(i + 4) * 26; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 9, y - hh); ctx.moveTo(x, y); ctx.lineTo(x + 3, y - hh * 1.2); ctx.moveTo(x, y); ctx.lineTo(x + 11, y - hh * 0.9); ctx.stroke(); }
}
function acacia(x, y, s, c) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = c; ctx.lineCap = 'round';
  ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -170); ctx.stroke();
  ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-10, -160); ctx.lineTo(-110, -250); ctx.moveTo(-8, -170); ctx.lineTo(90, -260); ctx.moveTo(-10, -175); ctx.lineTo(-20, -270); ctx.stroke();
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(-10, -285, 260, 52, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-120, -265, 120, 38, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(110, -270, 130, 40, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

// ═════════════════ characters (ink bodies, white eyes that act) ═════════════════
function eye(x, y, r, o = {}) {
  const m = o.mood || 'calm', lk = o.look || [0.3, 0];
  if (m === 'happy') { ctx.beginPath(); ctx.arc(x, y + r * 0.3, r * 0.75, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.35; ctx.lineCap = 'round'; ctx.stroke(); return; }
  const big = m === 'awe' || m === 'scared' ? 1.25 : 1, ry = r * 1.15 * big * (1 - (o.blink || 0) * 0.92);
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, r * big, Math.max(0.5, ry), 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.clip();
  const pr = r * (m === 'scared' ? 0.32 : 0.5), px = x + lk[0] * r * 0.45, py = y + lk[1] * r * 0.45;
  ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fillStyle = INK; ctx.fill(); ctx.beginPath(); ctx.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.3, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.fillStyle = INK;
  if (m === 'determined') { ctx.beginPath(); ctx.moveTo(x - r * 1.5, y - ry * 1.4); ctx.lineTo(x + r * 1.5, y - ry * 1.4); ctx.lineTo(x + r * 1.5, y - ry * 0.25); ctx.closePath(); ctx.fill(); }
  if (m === 'sad' || m === 'tired') ctx.fillRect(x - r * 1.5, y - ry * 1.4, r * 3, ry * (m === 'tired' ? 1.25 : 0.9));
  ctx.restore();
}
/** the little bird. o: t, dir, flap (phase, null = folded), mood, look, beakOpen 0..1, worm (bool), sweat 0..1, perch (legs) */
function birdie(x, y, s, o = {}) {
  const d = o.dir || 1, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * d, s); if (o.glow) ctx.filter = `drop-shadow(0 0 10px ${o.glow})`;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-60, -10); ctx.lineTo(-125, -35); ctx.lineTo(-118, 5); ctx.closePath(); ctx.fill();   // tail
  if (o.perch) { ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-10, 40); ctx.lineTo(-14, 72); ctx.moveTo(14, 40); ctx.lineTo(12, 72); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, 0, 72, 56, -0.12, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(52, -42, 44, 0, TAU); ctx.fill();
  // beak
  const bo = o.beakOpen || 0; ctx.fillStyle = GOLDC;
  ctx.beginPath(); ctx.moveTo(86, -50); ctx.lineTo(132, -42 - bo * 6); ctx.lineTo(88, -34); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(88, -34); ctx.lineTo(124, -34 + bo * 22); ctx.lineTo(84, -26); ctx.closePath(); ctx.fillStyle = '#D9A136'; ctx.fill();
  if (o.worm) { ctx.strokeStyle = WORM; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(118, -38); for (let i = 1; i <= 6; i++) ctx.lineTo(118 + i * 4, -38 + i * 12 + Math.sin(t * 12 + i) * 6); ctx.stroke(); }
  // wing
  ctx.save(); ctx.translate(-5, -18); const a = o.flap == null ? 0.15 : Math.sin(o.flap) * 1.1 - 0.2; ctx.rotate(-a);
  ctx.beginPath(); ctx.ellipse(-30, 0, 62, 26, -0.25, 0, TAU); ctx.fillStyle = '#2A2A36'; ctx.fill(); ctx.restore();
  ctx.filter = 'none';
  eye(62, -50, 15, o);
  if (o.sweat > 0) { ctx.globalAlpha = o.sweat; ctx.fillStyle = '#BFE3FF'; ctx.beginPath(); ctx.moveTo(20, -100); ctx.quadraticCurveTo(32, -78, 20, -70); ctx.quadraticCurveTo(8, -78, 20, -100); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.restore();
}
function worm(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.glow) { ctx.shadowColor = 'rgba(255,200,90,0.95)'; ctx.shadowBlur = 40; }
  const up = o.up ?? 1;
  for (let i = 6; i >= 0; i--) { const k = i / 6, px = Math.sin(t * 5 + i * 0.8) * 10 * k, py = -i * 22 * up; ctx.beginPath(); ctx.arc(px, py, 22 - i * 0.6, 0, TAU); ctx.fillStyle = i % 2 ? WORM : '#E68A74'; ctx.fill(); }
  ctx.shadowBlur = 0; const hx = Math.sin(t * 5 + 4.8) * 10, hy = -6 * 22 * up;
  for (const sx of [-8, 8]) { ctx.beginPath(); ctx.arc(hx + sx, hy - 4, 7, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(hx + sx + 2, hy - 3, 3.5, 0, TAU); ctx.fillStyle = INK; ctx.fill(); }
  ctx.beginPath(); ctx.arc(hx, hy + 6, 7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}
function nest(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 130, 46, 0, 0, Math.PI); ctx.fillStyle = '#6B4A30'; ctx.fill();
  ctx.strokeStyle = '#8E6640'; ctx.lineWidth = 7; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(0, 4 + i * 3, 128 - i * 6, 30 + i * 2, 0, 0.05 * Math.PI, 0.95 * Math.PI); ctx.stroke(); }
  ctx.restore();
}
function leg(x, y, l1, a1, l2, a2, w) { const k = [x + Math.sin(rad(a1)) * l1, y + Math.cos(rad(a1)) * l1], e = [k[0] + Math.sin(rad(a1 + a2)) * l2, k[1] + Math.cos(rad(a1 + a2)) * l2]; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(...k); ctx.lineTo(...e); ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
/** lion (faces right when dir 1). o: t, run (phase), mood, look, roar 0..1, thin, lying, glow */
function lion(x, y, s, o = {}) {
  const d = o.dir || 1, r = o.run, bob = r != null ? -Math.abs(Math.sin(r)) * 16 : 0, thin = o.thin ? 0.72 : 1;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s * d, s); if (o.glow) ctx.filter = `drop-shadow(0 0 12px ${o.glow})`;
  const by = o.lying ? -70 : -150;
  // tail
  ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-140, by - 10); ctx.quadraticCurveTo(-230, by - 60 + Math.sin((o.t || 0) * 3) * 20, -220, by - 120); ctx.stroke(); ctx.beginPath(); ctx.arc(-220, by - 128, 16, 0, TAU); ctx.fillStyle = MANE_D; ctx.fill();
  // legs
  const g = (ph) => (r != null ? Math.sin(r + ph) : 0);
  if (!o.lying) for (const [lx, ph, far] of [[110, 0, 1], [-105, Math.PI, 1], [95, 0.6, 0], [-120, Math.PI + 0.6, 0]]) { const a = g(ph), rest = r == null ? (lx > 0 ? 6 : -8) : 0; leg(lx, by + 30, 80, a * 42 + rest, 75, (r != null ? Math.max(0, -a) * 60 : (lx > 0 ? -10 : 12)) * (lx > 0 ? -1 : 1), far ? 24 : 28); }
  else { leg(100, by + 30, 60, 80, 70, 10, 22); leg(-110, by + 30, 50, 80, 60, 10, 22); }
  ctx.beginPath(); ctx.ellipse(0, by, 160, 62 * thin, 0, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  if (o.thin) { ctx.strokeStyle = '#2C2C36'; ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-10 + i * 26, by - 5, 30, 0.3 * Math.PI, 0.7 * Math.PI); ctx.stroke(); } }
  // mane + head
  const hx = 160, hy = by - 60;
  ctx.beginPath(); for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, rr = i % 2 ? 78 : 102; ctx.lineTo(hx - 12 + Math.cos(a) * rr, hy + Math.sin(a) * rr * 0.95); } ctx.closePath(); ctx.fillStyle = MANE; ctx.fill();
  ctx.beginPath(); ctx.arc(hx - 10, hy, 74, 0, TAU); ctx.fillStyle = MANE_D; ctx.fill();
  ctx.beginPath(); ctx.arc(hx + 4, hy + 4, 58, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + 50, hy + 16, 26, 22, 0, 0, TAU); ctx.fill();   // muzzle
  ctx.filter = 'none';
  if (o.roar > 0) { ctx.beginPath(); ctx.ellipse(hx + 52, hy + 38, 22, 26 * o.roar, 0, 0, TAU); ctx.fillStyle = '#7A1E22'; ctx.fill(); ctx.fillStyle = '#fff'; for (const tx of [hx + 40, hx + 62]) { ctx.beginPath(); ctx.moveTo(tx - 5, hy + 38 - 22 * o.roar); ctx.lineTo(tx + 5, hy + 38 - 22 * o.roar); ctx.lineTo(tx, hy + 38 - 8 * o.roar); ctx.fill(); } }
  ctx.beginPath(); ctx.arc(hx + 70, hy + 6, 7, 0, TAU); ctx.fillStyle = '#3A3A44'; ctx.fill();
  eye(hx + 24, hy - 18, 13, o);
  ctx.restore();
}
/** gazelle (faces right when dir 1). o: t, run (phase, pronking bound), mood, look, glow */
function gazelle(x, y, s, o = {}) {
  const d = o.dir || 1, r = o.run, b = r != null ? Math.sin(r) : 0, lift = r != null ? Math.max(0, b) * 50 : 0;
  ctx.save(); ctx.translate(x, y - lift); ctx.scale(s * d, s); if (o.glow) ctx.filter = `drop-shadow(0 0 12px ${o.glow})`;
  const by = -175;
  const sp = r != null ? b * 38 : 0;
  leg(70, by + 20, 85, 20 + sp, 80, r != null ? -30 - sp * 0.5 : 0, 11); leg(-70, by + 20, 85, -20 - sp, 80, r != null ? 30 + sp * 0.5 : 0, 11);
  leg(82, by + 20, 85, 10 + sp, 80, r != null ? -20 : 0, 12); leg(-58, by + 20, 85, -10 - sp, 80, r != null ? 20 : 0, 12);
  ctx.beginPath(); ctx.ellipse(0, by, 108, 40, -0.05, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-5, by + 16, 80, 12, -0.05, 0, TAU); ctx.fillStyle = '#E9DCC6'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-108, by - 8); ctx.lineTo(-128, by - 30); ctx.lineTo(-118, by + 2); ctx.fillStyle = INK; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(80, by - 12); ctx.lineTo(118, by - 78); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(140, by - 90, 40, 24, 0.35, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(118, by - 108); ctx.quadraticCurveTo(100, by - 170, 70, by - 180); ctx.moveTo(130, by - 110); ctx.quadraticCurveTo(118, by - 172, 88, by - 186); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(108, by - 108, 18, 8, -0.8, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.filter = 'none';
  eye(144, by - 98, 11, o);
  ctx.restore();
}
function reticle(x, y, r, color, t, sc = 1) {
  if (sc <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(t * 0.8); ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.setLineDash([24, 16]); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.rotate(-t * 0.8); ctx.lineWidth = 10; for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(r + 14, 0); ctx.lineTo(r + 46, 0); ctx.stroke(); }
  ctx.shadowColor = color; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}
function speedLines(t, a, dir = 1, color = '#FFF2D6') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = 0.4 * a; ctx.strokeStyle = color; ctx.lineCap = 'round'; for (let i = 0; i < 26; i++) { const y = rnd(i) * H, len = 160 + rnd(i + 1) * 260, x = ((rnd(i + 2) * 1600 - t * 2600 * dir) % 1600 + 1600) % 1600 - 260; ctx.lineWidth = 3 + rnd(i + 3) * 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * dir, y); ctx.stroke(); } ctx.restore(); }
function miniCloud(x, y, s, t, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; cloud(x, y, s, '#5C6474', '#6E7686'); ctx.strokeStyle = '#9FB3D9'; ctx.lineWidth = 4; for (let i = 0; i < 5; i++) { const k = (t * 1.6 + i * 0.21) % 1; ctx.beginPath(); ctx.moveTo(x - 60 + i * 30, y + 40 * s + k * 120 * s); ctx.lineTo(x - 64 + i * 30, y + 64 * s + k * 120 * s); ctx.stroke(); } ctx.restore(); }
function wallShadow(kind, x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.filter = 'blur(3px)'; const c = 'rgba(40,20,30,0.55)';
  ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineCap = 'round';
  if (kind === 'gazelle') { ctx.beginPath(); ctx.ellipse(0, -175, 108, 40, 0, 0, TAU); ctx.fill(); ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(80, -187); ctx.lineTo(118, -253); ctx.stroke(); ctx.beginPath(); ctx.ellipse(140, -265, 40, 24, 0.35, 0, TAU); ctx.fill(); ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(118, -283); ctx.quadraticCurveTo(100, -345, 70, -355); ctx.stroke(); ctx.lineWidth = 12; for (const lx of [70, -70, 82, -58]) { ctx.beginPath(); ctx.moveTo(lx, -160); ctx.lineTo(lx + 5, 0); ctx.stroke(); } }
  else { ctx.beginPath(); ctx.ellipse(0, -150, 160, 62, 0, 0, TAU); ctx.fill(); ctx.beginPath(); for (let i = 0; i < 22; i++) { const an = i / 22 * TAU, rr = i % 2 ? 78 : 102; ctx.lineTo(148 + Math.cos(an) * rr, -210 + Math.sin(an) * rr); } ctx.fill(); ctx.lineWidth = 22; for (const lx of [110, -105, 95, -120]) { ctx.beginPath(); ctx.moveTo(lx, -120); ctx.lineTo(lx, 0); ctx.stroke(); } ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-140, -160); ctx.quadraticCurveTo(-230, -210, -220, -270); ctx.stroke(); }
  ctx.restore(); }

// ═════════════════ bedroom + city ═════════════════
function bedroom(t, light) {
  grad([[0, mix('#2A2440', '#6E4E62', light)], [1, mix('#3A2E48', '#C88A70', light)]], 0, 1500);
  // window with sunrise
  ctx.save(); ctx.beginPath(); ctx.roundRect(600, 360, 380, 520, 16); ctx.clip();
  grad([[0, mix('#1E2250', '#5E6FB8', light)], [0.6, mix('#4A3A6A', '#F2946A', light)], [1, mix('#6A4A6A', '#FFD49A', light)]], 360, 880);
  sun(800, lerp(930, 760, light), 60, '#FFF5DC', '#FFB06A', light); ridge(860, 70, 41, mix('#2A2240', '#8C5A7A', light), 0, 0, 560, 1020);
  ctx.restore(); ctx.strokeStyle = '#3A2A30'; ctx.lineWidth = 22; ctx.beginPath(); ctx.roundRect(600, 360, 380, 520, 16); ctx.stroke(); ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(790, 360); ctx.lineTo(790, 880); ctx.moveTo(600, 620); ctx.lineTo(980, 620); ctx.stroke();
  // sunlight patch through the window
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.5 * light; ctx.fillStyle = '#FFC890'; ctx.beginPath(); ctx.moveTo(600, 880); ctx.lineTo(980, 880); ctx.lineTo(560, 1500); ctx.lineTo(80, 1500); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = mix('#1E1828', '#5A3E44', light); ctx.fillRect(-300, 1450, W + 600, 700);
}
function bed(x, y) { ctx.fillStyle = '#3A2A2E'; ctx.fillRect(x - 330, y - 40, 20, 160); ctx.fillRect(x + 310, y - 10, 20, 130); ctx.beginPath(); ctx.roundRect(x - 330, y - 260, 40, 300, 12); ctx.fill(); ctx.beginPath(); ctx.roundRect(x - 320, y - 60, 650, 90, 20); ctx.fillStyle = '#E8DCCB'; ctx.fill(); }
function blanket(x, y) { ctx.beginPath(); ctx.roundRect(x - 140, y - 92, 470, 110, 40); ctx.fillStyle = '#4C6A8C'; ctx.fill(); ctx.beginPath(); ctx.roundRect(x - 140, y - 92, 470, 30, 20); ctx.fillStyle = '#5E80A6'; ctx.fill(); }
function clock(x, y, ring, t) {
  const sh = ring ? Math.sin(t * 80) * 6 : 0; ctx.save(); ctx.translate(x + sh, y); ctx.rotate(ring ? Math.sin(t * 60) * 0.06 : 0);
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 40, -62, 22, 0, TAU); ctx.fillStyle = '#C9A23E'; ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, 0, 66, 0, TAU); ctx.fillStyle = '#E2574C'; ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 52, 0, TAU); ctx.fillStyle = '#FFF6E6'; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -36); ctx.moveTo(0, 0); ctx.lineTo(24, 10); ctx.stroke(); ctx.restore();
  if (ring) { ctx.save(); ctx.strokeStyle = '#FFE7A8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x, y - 20, 95 + k * 26, s > 0 ? -0.5 : Math.PI - 0.4, s > 0 ? 0.4 : Math.PI + 0.5); ctx.globalAlpha = 0.8 - k * 0.22; ctx.stroke(); } ctx.restore(); }
}
function city(t, grey, camX = 0) {
  const P = (a, b) => mix(a, b, grey);
  grad([[0, P('#5B6FA8', '#3E4656')], [0.7, P('#E6A27C', '#6C7480')], [1, P('#FFD59A', '#8A909A')]], -400, 1300);
  for (let layer = 0; layer < 3; layer++) { const f = 0.15 + layer * 0.25, c = P(['#8C7A9C', '#5E5478', '#3A3450'][layer], ['#596070', '#474D5C', '#343946'][layer]);
    for (let i = -3; i < 14; i++) { const w = 120 + rnd(i * 3 + layer) * 120, hh = 300 + rnd(i * 7 + layer) * (420 + layer * 200), x = i * 170 + rnd(i + layer * 9) * 60 - camX * f - (layer * 50);
      ctx.fillStyle = c; ctx.fillRect(x, 1300 - hh + layer * 60, w, hh + 300);
      if (layer === 2) { ctx.fillStyle = P('#FFD58A', '#9AA0AA'); for (let wy = 1300 - hh + 100; wy < 1300; wy += 70) for (let wx = x + 20; wx < x + w - 30; wx += 46) if (rnd(wx * 0.3 + wy) > 0.45) ctx.fillRect(wx, wy, 22, 32); } } }
  ctx.fillStyle = P('#3A3346', '#2C303A'); ctx.fillRect(-500, 1360, W + 1000, 900);
  ctx.fillStyle = P('#5C5466', '#414652'); ctx.fillRect(-500, 1420, W + 1000, 60);
}
function billboard(x, y, s, up, t, grey) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = mix('#23202E', '#20232C', grey); ctx.fillRect(-12, 0, 24, 260); ctx.beginPath(); ctx.roundRect(-180, -230, 360, 230, 16); ctx.fill(); ctx.beginPath(); ctx.roundRect(-160, -210, 320, 190, 10); ctx.fillStyle = mix('#2E3E62', '#3A404C', grey); ctx.fill();
  const pts = []; for (let i = 0; i <= 8; i++) pts.push([-140 + i * 35, -60 - (up ? i * 14 : (8 - i) * 14) + Math.sin(i * 2 + t * 3) * 12]);
  ctx.strokeStyle = up ? '#6DDB8A' : '#FF5A5A'; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); ctx.restore(); }

export function buildShots() {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  const cut = (i) => L(i) - 0.06;

  // ═══ A · "There's a Chinese proverb…" — a huge red sun over the savanna, crane down; seal title
  add({ id: 'A', at: 0, note: 'red-sun proverb opening, crane down, seal stamp', grade: (lt) => ({ sat: 1.08, con: 1.08, bloom: 0.4, vig: 0.55, bars: 0.5 }),
    draw(lt, d, t) {
      const up = (1 - eio(seg(lt, 0, 3.2))) * 900;
      ctx.save(); ctx.translate(0, up * 0.3); savanna(0, t, { tod: 0, redSun: 300, sunY: 1000 }); ctx.restore();
      ctx.save(); ctx.translate(0, up * 0.15); for (let i = 0; i < 4; i++) Wd.bird(300 + i * 90 + lt * 40, 560 + Math.sin(i * 1.7) * 50, 0.8, t + i, '#3A1E30'); ctx.restore();
      // seal stamp
      const s = eob(seg(lt, 0.1, 0.45)), out = 1 - seg(lt, 2.6, 3.2);
      if (s > 0 && out > 0) { ctx.save(); ctx.globalAlpha = out; ctx.translate(540, 420); ctx.rotate(-0.06); ctx.scale(s, s);
        ctx.beginPath(); ctx.roundRect(-170, -170, 340, 340, 30); ctx.fillStyle = '#C8352A'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#F6D9A8'; ctx.beginPath(); ctx.roundRect(-145, -145, 290, 290, 20); ctx.stroke();
        ctx.font = '900 120px Cairo'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#F6D9A8'; ctx.fillText('قاعدة', 0, -10); ctx.font = '800 34px Inter'; ctx.direction = 'ltr'; ctx.letterSpacing = '8px'; ctx.fillText('A RULE', 4, 95); ctx.restore(); }
    } });
  cue(0.1, 'thump', { gain: 0.7 }); cue(0.15, 'shimmer', { dur: 1.4, gain: 0.7 });

  // ═══ B · "God Almighty…" — light pours down onto a lone acacia
  { const st = cut(1);
    add({ id: 'B', at: st, tin: { type: 'fade', d: 0.5 }, note: 'light rays from heaven onto the acacia, motes', grade: () => ({ sat: 1.1, bloom: 0.5, vig: 0.5, bars: 0.4, tint: '#FFA040', tintA: 0.1 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, lerp(960, 1040, eio(seg(lt, 0, d))), lerp(1, 1.12, eio(seg(lt, 0, d))));
        savanna(200, t, { tod: 0.25, sunY: 1040 });
        rays(540, -300, t, eo(seg(lt, 0, 0.8)) * 1.6, 13, 2200, 0.32, '#FFE9B8');
        acacia(540, 1395, 1.5, '#3A2234');
        motes(t, 1, 30, '#FFE2A0', [200, 400, 680, 1000], 30);
        ctx.restore();
      } });
    cue(st, 'swell', { dur: 1.3, gain: 0.6 }); }

  // ═══ C · "…gives the worm" — close on the earth: a glowing worm pops up into the light
  { const st = cut(2), pop = Wt(2, 1) - st;
    add({ id: 'C', at: st, note: 'close-up soil, worm pops up glowing on الدودة', grade: () => ({ sat: 1.1, bloom: 0.5, vig: 0.6, bars: 0.4 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1100, lerp(1.0, 1.08, eio(seg(lt, 0, d))));
        grad([[0, '#F2A070'], [1, '#FFD9A0']], 0, 1000); ridge(1000, 120, 51, '#C27A6A', 0, 0); haze(980, 120, '#FFD0A0', 0.6);
        ctx.fillStyle = '#7A4632'; ctx.fillRect(-500, 1050, W + 1000, 1200); ctx.fillStyle = '#8E5640'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.ellipse(rnd(i) * W, 1100 + rnd(i + 2) * 700, 20 + rnd(i + 4) * 30, 8, 0, 0, TAU); ctx.fill(); }
        ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, 0, 0, 1150); g.addColorStop(0, rgba('#FFE7A8', 0)); g.addColorStop(1, rgba('#FFE7A8', 0.6)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(460, 0); ctx.lineTo(620, 0); ctx.lineTo(760, 1150); ctx.lineTo(320, 1150); ctx.closePath(); ctx.fill(); ctx.restore();
        const p = eob(seg(lt, pop - 0.15, pop + 0.25));
        ctx.beginPath(); ctx.ellipse(540, 1150, 90, 22, 0, 0, TAU); ctx.fillStyle = '#4A2A20'; ctx.fill();
        if (p > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1152); ctx.clip(); worm(540, 1150 + (1 - p) * 160, 2.2, t, { glow: true }); ctx.restore(); }
        glow(540, 1000, 360, '#FFD98A', 0.4 * p);
        motes(t, p, 16, '#FFE2A0', [300, 700, 480, 500], 50);
        ctx.restore();
      } });
    cue(st + pop - 0.1, 'pop', { gain: 0.8 }); cue(st + pop, 'chime', { n: 2, gain: 0.6 }); }

  // ═══ D · "…to the bird" — up in the acacia: the little bird in her nest
  { const st = cut(3);
    add({ id: 'D', at: st, tin: { type: 'whip', d: 0.3, dir: -1 }, note: 'bird in nest on branch, eyes light up', grade: () => ({ sat: 1.1, bloom: 0.4, vig: 0.5, bars: 0.4 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1000, lerp(1.05, 1.0, eio(seg(lt, 0, d))));
        savanna(500, t, { tod: 0.4, sunY: 1000 });
        ctx.strokeStyle = '#3A2234'; ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-200, 1180); ctx.quadraticCurveTo(400, 1120, 1300, 1000); ctx.stroke();
        ctx.fillStyle = '#3A2234'; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(-100 + i * 95, 330 + Math.sin(i * 1.9) * 40 + Math.sin(t * 1.2 + i) * 4, 120, 70, 0, 0, TAU); ctx.fill(); }
        nest(560, 1120, 1.3);
        birdie(560, 1060, 1.5, { t, mood: lt > 0.35 ? 'awe' : 'calm', look: [0.4, 0.8], blink: blink(t) });
        nest(560, 1120, 1.3);
        ctx.restore();
      } });
    cue(st, 'whip', { gain: 0.6 }); cue(st + 0.35, 'chime', { n: 4, gain: 0.5 }); }

  // ═══ E · "but He doesn't drop it in her lap" — she waits, beak open; nothing falls from the sky
  { const st = cut(4), no = Wt(4, 2) - st;
    add({ id: 'E', at: st, note: 'bird waiting beak open; dotted arrow from sky crossed out', grade: () => ({ sat: 0.92, bloom: 0.3, vig: 0.6, bars: 0.45 }),
      draw(lt, d, t) {
        ctx.save(); cam(560, 1000, lerp(1.0, 1.1, eio(seg(lt, 0, d + 1.2))));
        savanna(500, t, { tod: 0.45, sunY: 980 });
        ctx.strokeStyle = '#3A2234'; ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-200, 1180); ctx.quadraticCurveTo(400, 1120, 1300, 1000); ctx.stroke();
        nest(560, 1120, 1.3); birdie(560, 1060, 1.5, { t, mood: 'calm', look: [0.2, -1], beakOpen: 0.6 + 0.4 * Math.sin(t * 6), blink: blink(t) }); nest(560, 1120, 1.3);
        // the expected delivery from the sky… crossed out
        const a = eo(seg(lt, 0.1, 0.6)); ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([26, 22]); ctx.strokeStyle = '#FFF2D6'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(560, 200); ctx.lineTo(560, 820); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(530, 790); ctx.lineTo(560, 840); ctx.lineTo(590, 790); ctx.stroke(); worm(560, 300 + seg(lt, 0.2, 1.0) * 120, 1, t); ctx.restore();
        const x = eob(seg(lt, no, no + 0.3)); if (x > 0) { ctx.save(); ctx.translate(560, 560); ctx.scale(x, x); ctx.beginPath(); ctx.arc(0, 0, 90, 0, TAU); ctx.fillStyle = '#E2574C'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-36, -36); ctx.lineTo(36, 36); ctx.moveTo(36, -36); ctx.lineTo(-36, 36); ctx.stroke(); ctx.restore(); }
        ctx.restore();
      } });
    cue(Wt(4, 2), 'thump', { gain: 0.8 }); }

  // ═══ F · "He doesn't drop it in her lap!" — close on her: she gets it, and her eyes turn determined
  { const st = cut(5);
    add({ id: 'F', at: st, tin: { type: 'dip', d: 0.24 }, note: 'close-up bird, empty nest, realizes, determined', grade: () => ({ sat: 1.0, bloom: 0.3, vig: 0.7, bars: 0.55 }),
      draw(lt, d, t) {
        ctx.save(); cam(560, 1000, lerp(1.0, 1.1, eio(seg(lt, 0, d))));
        savanna(500, t, { tod: 0.5, sunY: 900 });
        ctx.save(); ctx.translate(560, 1180); ctx.scale(2.6, 2.6); ctx.translate(-560, -1180); nest(560, 1180, 1.3); birdie(560, 1120, 1.5, { t, mood: lt > 0.6 ? 'determined' : 'sad', look: lt > 0.6 ? [1, 0] : [0, 0.8], blink: 0 }); nest(560, 1180, 1.3); ctx.restore();
        ctx.restore();
      } });
    cue(st + 0.6, 'tock', { gain: 0.6 }); }

  // ═══ G · (no words) — she takes off and searches the savanna, flying hard
  { const st = 11.62;
    add({ id: 'G', at: st, tin: { type: 'whip', d: 0.32, dir: 1 }, note: 'bird flies across the savanna searching, speed lines, sweat', grade: () => ({ sat: 1.12, bloom: 0.35, vig: 0.5, bars: 0.35 }),
      draw(lt, d, t) {
        const camX = 600 + lt * 520;
        ctx.save(); cam(540, 1000, 1.0, Math.sin(lt * 1.3) * 0.03);
        savanna(camX, t, { tod: lerp(0.55, 0.8, seg(lt, 0, d)), sunY: lerp(860, 700, seg(lt, 0, d)) });
        const y = 820 + Math.sin(lt * 2.2) * 120 + seg(lt, 2.2, d) * 300;
        birdie(470, y, 1.25, { t, flap: t * 22, mood: 'determined', look: [1, 0.6], sweat: seg(lt, 1.6, 2.2) });
        speedLines(t, 0.6, -1);
        ctx.restore();
      } });
    cue(st, 'flap', { dur: 3.3, gain: 0.9 }); cue(st, 'whoosh', { gain: 0.7 }); cue(st + 1.5, 'whoosh', { gain: 0.5 }); }

  // ═══ H · "In the end… her share" — the dive, the catch: gold burst on حقها
  { const st = cut(6), got = Wt(6, 2) - st;
    add({ id: 'H', at: st, tin: { type: 'cut' }, note: 'bird dives to the grass, catches the worm, gold burst', grade: (lt) => ({ sat: 1.12, bloom: lt > got ? 0.6 : 0.35, vig: 0.5, bars: 0.35 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1150, lerp(1.0, 1.25, eio(seg(lt, 0, got))));
        savanna(1800, t, { tod: 0.8, sunY: 700 });
        const k = eio(seg(lt, 0, got)), bx = lerp(260, 560, k), by = lerp(700, 1300, k);
        if (lt < got) worm(600, 1400, 1.2, t, { glow: true });
        birdie(bx, by, 1.2, { t, flap: lt < got ? t * 14 : null, mood: lt > got ? 'happy' : 'determined', look: [0.6, 1], worm: lt > got, glow: lt > got ? 'rgba(255,210,120,0.9)' : null });
        if (lt > got) { const p = seg(lt, got, got + 0.6); rays(560, 1280, t, (1 - p) * 2.4, 16, 700, Math.PI, '#FFE7A8', -Math.PI / 2); glow(560, 1280, 400, '#FFD98A', 0.6 * (1 - p)); motes(t, 1, 20, '#FFE2A0', [300, 900, 500, 500], 80); }
        ctx.restore();
      } });
    cue(st + got - 0.25, 'whoosh', { gain: 0.6 }); cue(st + got, 'reveal', { dur: 1.0, gain: 0.7 }); cue(st + got, 'shimmer', { dur: 0.9 }); }

  // ═══ I · "but first she has to work for it" — back at the nest: exhausted, proud, worm in beak
  { const st = cut(7);
    add({ id: 'I', at: st, note: 'back in the nest, tired but proud with the worm, sweat', grade: () => ({ sat: 1.1, bloom: 0.4, vig: 0.55, bars: 0.4 }),
      draw(lt, d, t) {
        ctx.save(); cam(560, 1050, 1.15);
        savanna(500, t, { tod: 0.85, sunY: 650 });
        ctx.strokeStyle = '#4A3A30'; ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-200, 1180); ctx.quadraticCurveTo(400, 1120, 1300, 1000); ctx.stroke();
        nest(560, 1120, 1.3); birdie(560, 1062 + Math.sin(t * 9) * 4, 1.5, { t, mood: 'tired', look: [1, 0], worm: true, sweat: 1, blink: blink(t) }); nest(560, 1120, 1.3);
        ctx.restore();
      } });
    cue(st, 'tock', { gain: 0.5 }); }

  // ═══ J · "The lion…" — low angle on a rock, red sun, a roar
  { const st = cut(8);
    add({ id: 'J', at: st, tin: { type: 'whip', d: 0.28, dir: 1 }, note: 'low-angle lion on a rock against a huge red sun, roar', grade: () => ({ sat: 1.05, con: 1.15, bloom: 0.4, vig: 0.75, bars: 0.7 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1000, lerp(1.1, 1.0, eo(seg(lt, 0, d))));
        savanna(0, t, { tod: 0.05, redSun: 360, sunY: 900 });
        ctx.fillStyle = '#2A1424'; ctx.beginPath(); ctx.moveTo(-200, 2000); ctx.lineTo(-200, 1330); ctx.lineTo(250, 1260); ctx.lineTo(820, 1300); ctx.lineTo(1300, 1420); ctx.lineTo(1300, 2000); ctx.closePath(); ctx.fill();
        lion(450, 1275, 1.6, { t, mood: 'determined', look: [1, 0], roar: Math.sin(clamp(seg(lt, 0.1, 0.7)) * Math.PI), glow: 'rgba(255,140,90,0.8)' });
        ctx.restore();
      } });
    cue(st + 0.05, 'roar', { gain: 0.9 }); }

  // ═══ K · "every single morning" — time-lapse: the sun races up; the lion wakes
  { const st = cut(9);
    add({ id: 'K', at: st, note: 'time-lapse sunrise, lion wakes and stands', grade: () => ({ sat: 1.1, bloom: 0.45, vig: 0.55, bars: 0.4 }),
      draw(lt, d, t) {
        const k = eio(seg(lt, 0, d));
        savanna(300, t, { tod: lerp(0, 0.7, k), sunY: lerp(1250, 700, k), sunR: 110 });
        lion(420, 1500, 1.2, { t, lying: lt < 0.55, mood: lt < 0.35 ? 'tired' : 'calm', look: [1, -0.3], blink: lt < 0.35 ? 1 : 0 });
        for (let i = 0; i < 3; i++) Wd.bird(700 + i * 80 + lt * 200, 500 + i * 30, 0.7, t + i, '#3A2A30');
      } });
    cue(st, 'swell', { dur: 0.9, gain: 0.5 }); cue(st + 0.1, 'birds', { dur: 1.0, gain: 0.6 }); }

  // ═══ L · "has to run… faster" — the lion runs; on "أسرع" he explodes forward
  { const st = cut(10), fast = Wt(11, 0) - st;
    add({ id: 'L', at: st, note: 'tracking the running lion, speed lines, kicks into top speed', grade: (lt) => ({ sat: 1.12, con: 1.08, bloom: 0.35, vig: 0.55, bars: 0.4, shake: lt > fast ? 6 : 0 }),
      draw(lt, d, t) {
        const sp = lt < fast ? 700 : 700 + (lt - fast) * 900, camX = lt * sp;
        ctx.save(); cam(540, 1100, lt > fast ? lerp(1, 1.12, eo(seg(lt, fast, fast + 0.4))) : 1);
        savanna(camX, t, { tod: 0.75, sunY: 680 });
        lion(430, 1560, 1.2, { t, run: t * (lt < fast ? 13 : 20), mood: 'determined', look: [1, 0] });
        ctx.restore(); speedLines(t, lt > fast ? 1 : 0.4, -1);
      } });
    cue(st, 'gallop', { dur: 2.2, rate: 0.12 }); cue(st + fast, 'whoosh'); cue(st + fast, 'thump', { gain: 0.7 }); }

  // ═══ M · "than the slowest gazelle" — the herd; the slowest one is locked in a gold reticle
  { const st = cut(12), lock = Wt(13, 0) - st;
    add({ id: 'M', at: st, tin: { type: 'whip', d: 0.28, dir: 1 }, note: 'wide herd running; reticle locks on the slowest', grade: () => ({ sat: 1.12, bloom: 0.35, vig: 0.55, bars: 0.4, tint: '#FF9A40', tintA: 0.12 }),
      draw(lt, d, t) {
        const camX = lt * 600;
        ctx.save(); cam(540, 1120, 0.9);
        savanna(camX, t, { tod: 0.8, sunY: 660 });
        const herd = [[820, 1480, 0], [700, 1520, 1.3], [930, 1530, 2.1], [600, 1470, 0.6], [330, 1540, 2.8]];
        herd.forEach(([x, y, ph], i) => gazelle(x + Math.sin(t * 2 + i) * 10 - (i === 4 ? lt * 25 : 0), y, 0.9, { t, run: t * (i === 4 ? 11 : 13) + ph, mood: i === 4 ? 'tired' : 'calm', look: [1, 0] }));
        lion(-120 + lt * 60, 1600, 1.0, { t, run: t * 20, mood: 'determined', look: [1, 0] });
        reticle(330 - lt * 25 + 60, 1340, 150, GOLDC, t, eob(seg(lt, lock - 0.1, lock + 0.25)));
        ctx.restore();
      } });
    cue(st, 'gallop', { dur: 2.2, rate: 0.1, gain: 0.8 }); cue(Wt(13, 0), 'tock', { gain: 0.8 }); cue(Wt(13, 0), 'chime', { n: 0, gain: 0.4 }); }

  // ═══ N · "And the gazelle has to run faster" — tracking close on the gazelle, determined
  { const st = cut(14);
    add({ id: 'N', at: st, note: 'close tracking gazelle bounding, determined eyes', grade: () => ({ sat: 1.12, con: 1.06, bloom: 0.35, vig: 0.55, bars: 0.45 }),
      draw(lt, d, t) {
        const camX = lt * 1500;
        ctx.save(); cam(560, 1180, 1.25, -0.03);
        savanna(camX, t, { tod: 0.82, sunY: 640 });
        gazelle(560, 1520, 1.2, { t, run: t * 15, mood: 'determined', look: [1, 0] });
        ctx.restore(); speedLines(t, 0.7, -1);
      } });
    cue(st, 'gallop', { dur: 1.4, rate: 0.09 }); }

  // ═══ O · "than the fastest lion" — behind her: three lions; the fastest is locked in red
  { const st = cut(15), lock = Wt(16, 0) - st;
    add({ id: 'O', at: st, tin: { type: 'whip', d: 0.26, dir: -1 }, note: 'three lions chasing; red reticle on the fastest', grade: () => ({ sat: 1.1, con: 1.1, bloom: 0.3, vig: 0.65, bars: 0.5, tint: '#FF6A30', tintA: 0.14 }),
      draw(lt, d, t) {
        const camX = lt * 900;
        ctx.save(); cam(540, 1150, 0.95);
        savanna(camX, t, { tod: 0.7, sunY: 700 });
        gazelle(980, 1480, 0.8, { t, run: t * 15, mood: 'scared', look: [-1, 0] });
        [[420, 1540, 0], [180, 1590, 1.7], [620, 1600, 0.9]].forEach(([x, y, ph], i) => lion(x + (i === 2 ? lt * 60 : 0), y, 0.95, { t, run: t * (i === 2 ? 21 : 18) + ph, mood: 'determined', look: [1, 0] }));
        reticle(680 + lt * 60 + 90, 1360, 170, '#FF4A3A', t, eob(seg(lt, lock - 0.1, lock + 0.25)));
        ctx.restore();
      } });
    cue(st, 'gallop', { dur: 1.8, rate: 0.08 }); cue(Wt(16, 0), 'roar', { gain: 0.6 }); }

  // ═══ P · "or she gets eaten…" — red flash: the lion's shadow swallows her
  { const st = cut(17);
    add({ id: 'P', at: st, tin: { type: 'flash', d: 0.25, color: '#FF3A2A' }, note: 'shadow of the lion falls over the scared gazelle; red', grade: (lt) => ({ sat: 0.8, con: 1.3, tint: '#FF2020', tintA: 0.3, mode: 'overlay', vig: 0.85, bars: 1, shake: 10 * (1 - seg(lt, 0, 0.4)) }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1150, lerp(1.2, 1.4, eio(seg(lt, 0, d))));
        savanna(2000, t, { tod: 0.5, sunY: 760 });
        gazelle(560, 1500, 1.1, { t, mood: 'scared', look: [-1, -0.4] });
        const k = eo(seg(lt, 0.0, 0.8)); ctx.save(); ctx.globalAlpha = 0.85 * k; ctx.filter = 'blur(6px)'; ctx.fillStyle = '#12060A'; ctx.translate(lerp(-500, 330, k), 1560); ctx.scale(2.3, 2.3); ctx.beginPath(); ctx.ellipse(0, -150, 160, 62, 0, 0, TAU); ctx.fill(); ctx.beginPath(); for (let i = 0; i < 22; i++) { const an = i / 22 * TAU, rr = i % 2 ? 78 : 102; ctx.lineTo(150 + Math.cos(an) * rr, -210 + Math.sin(an) * rr); } ctx.fill(); ctx.strokeStyle = '#12060A'; ctx.lineWidth = 26; ctx.lineCap = 'round'; for (const lx of [110, -105]) { ctx.beginPath(); ctx.moveTo(lx, -120); ctx.lineTo(lx + 40, -20); ctx.stroke(); } ctx.restore();
        ctx.restore();
      } });
    cue(st, 'boom', { gain: 0.55 }); cue(st + 0.4, 'heart'); cue(st + 1.0, 'heart', { gain: 0.8 }); }

  // ═══ Q · "and he starves." — grey dusk; a thin lion lying alone, belly growling
  { const st = cut(18);
    add({ id: 'Q', at: st, tin: { type: 'dip', d: 0.3 }, note: 'grey dusk, thin lion lies alone, hungry', grade: () => ({ sat: 0.35, con: 1.05, tint: '#4A5A80', tintA: 0.25, vig: 0.8, bars: 0.7 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1250, lerp(1.0, 1.1, eio(seg(lt, 0, d))));
        savanna(900, t, { tod: 0.3, grey: 0.7, sunY: 1240, sunR: 80 });
        lion(420, 1520, 1.15, { t, lying: true, thin: true, mood: 'sad', look: [0.5, 0.6], blink: blink(t) });
        ctx.restore();
      } });
    cue(Wt(18, 3) - 0.1, 'growl'); }

  // ═══ R · "Which means: when you wake up in the morning," — our hero, asleep at dawn; the alarm rings
  { const st = cut(19), ring = Wt(20, 4) - st;
    add({ id: 'R', at: st, tin: { type: 'dip', d: 0.32 }, note: 'bedroom at dawn, hero asleep, alarm rings, sun through window', grade: (lt) => ({ sat: 1.0, bloom: 0.4, vig: 0.6, bars: 0.45, tint: '#FFA060', tintA: 0.08 }),
      draw(lt, d, t) {
        const light = eio(seg(lt, 0, d + 0.6));
        ctx.save(); cam(lerp(520, 560, eio(seg(lt, 0, d))), lerp(1230, 1150, eio(seg(lt, 0, d))), lerp(1.55, 1.25, eio(seg(lt, 0, d))));
        bedroom(t, light); bed(420, 1330); ctx.beginPath(); ctx.ellipse(205, 1250, 95, 38, -0.05, 0, TAU); ctx.fillStyle = '#F4EEE2'; ctx.fill();
        ctx.save(); ctx.translate(310, 1262); ctx.rotate(-Math.PI / 2); hero({ x: 0, y: 330, h: 470, t, mood: lt < ring + 0.15 ? 'calm' : 'awe', blink: lt < ring + 0.15 ? 1 : 0, look: [0.6, -0.4], shadow: false, wind: 0, breathe: true, pose: { arms: { L: [-6, 6], R: [6, 6] }, legs: { L: [2, 0], R: [-2, 0] } } }); ctx.restore();
        blanket(420, 1330);
        ctx.fillStyle = '#3A2A2E'; ctx.fillRect(820, 1210, 180, 240); clock(910, 1140, lt > ring && lt < ring + 1.3, t);
        ctx.restore();
      } });
    cue(Wt(20, 4), 'alarm', { dur: 1.1 }); }

  // ═══ S · "it doesn't matter if you're a gazelle or a lion" — he stands in the sunrise; his shadow becomes each
  { const st = cut(21), gz = Wt(22, 2) - st, li = Wt(22, 4) - st;
    add({ id: 'S', at: st, note: 'hero at the window, his wall shadow becomes a gazelle, then a lion', grade: () => ({ sat: 1.05, bloom: 0.45, vig: 0.55, bars: 0.45, tint: '#FFA060', tintA: 0.1 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1050, lerp(1.0, 1.06, eio(seg(lt, 0, d))));
        bedroom(t, 1);
        const sg = seg(lt, gz - 0.1, gz + 0.25) * (1 - seg(lt, li - 0.15, li + 0.05)), sl = seg(lt, li - 0.05, li + 0.25);
        ctx.save(); ctx.globalAlpha = 1 - Math.max(sg, sl); ctx.filter = 'blur(3px)'; ctx.fillStyle = 'rgba(40,20,30,0.5)'; ctx.translate(-260, 0); ctx.beginPath(); ctx.arc(540, 820, 60, 0, TAU); ctx.fill(); ctx.fillRect(522, 880, 36, 330); ctx.fillRect(480, 1200, 120, 30); ctx.restore();
        wallShadow('gazelle', 260, 1300, 1.6, sg); wallShadow('lion', 230, 1340, 1.25, sl);
        hero({ x: 640, y: 1500, h: 640, t, dir: -1, mood: lt < 0.4 ? 'calm' : 'determined', look: [-0.6, -0.1], blink: blink(t), wind: 0.25, glow: 'rgba(255,200,130,0.85)' });
        ctx.restore();
      } });
    cue(Wt(22, 2), 'chime', { n: 1, gain: 0.6 }); cue(Wt(22, 4), 'roar', { gain: 0.45 }); }

  // ═══ T · "RUN!" — flash; he bursts out into the sunrise road
  { const st = cut(23);
    add({ id: 'T', at: st, tin: { type: 'flash', d: 0.3, color: '#FFF1D0' }, note: 'RUN! he sprints out into the sunrise, speed lines', grade: (lt) => ({ sat: 1.15, con: 1.1, bloom: 0.5, vig: 0.5, bars: 0.4, shake: 14 * (1 - seg(lt, 0, 0.5)) }),
      draw(lt, d, t) {
        const camX = lt * 1400;
        ctx.save(); cam(540, 1120, lerp(1.25, 1.05, eo(seg(lt, 0, 0.6))), -0.03);
        city(t, 0, camX * 0.3);
        hero({ x: 470, y: 1560, h: 780, t, walk: t * 16, lean: 14, mood: 'determined', look: [1, 0], wind: 1, glow: 'rgba(255,200,130,0.9)' });
        ctx.restore(); speedLines(t, 1, -1);
      } });
    cue(st - 0.3, 'riser', { dur: 0.32, gain: 0.7 }); cue(st, 'boom', { gain: 0.6 }); cue(st, 'whoosh'); }

  // ═══ U · "so you can fight for your life and grow yourself" — up the golden steps; he grows with every step
  { const st = cut(24), grow = Wt(25, 0) - st;
    add({ id: 'U', at: st, tin: { type: 'whip', d: 0.3, dir: 1 }, note: 'hero runs up golden steps, grows taller with each step', grade: () => ({ sat: 1.12, bloom: 0.5, vig: 0.5, bars: 0.4, tint: '#FFA040', tintA: 0.1 }),
      draw(lt, d, t) {
        const k = seg(lt, 0, d), stepN = Math.min(6, Math.floor(lt / 0.36));
        ctx.save(); cam(lerp(420, 760, eio(k)), lerp(1250, 880, eio(k)), lerp(1.05, 0.85, eio(k)));
        savanna(200, t, { tod: 0.75, sunY: 560, sunX: 820 });
        for (let i = 0; i < 7; i++) { const x = 150 + i * 150, top = 1500 - i * 105; ctx.save(); ctx.shadowColor = 'rgba(255,200,90,0.8)'; ctx.shadowBlur = i <= stepN ? 30 : 0; ctx.beginPath(); ctx.roundRect(x, top, 150, 900, 10); ctx.fillStyle = i <= stepN ? GOLDC : '#C9A86A'; ctx.fill(); ctx.restore(); ctx.fillStyle = '#C98A1C'; ctx.fillRect(x, top, 150, 18); }
        const pos = clamp(lt / 0.36, 0, 6.2), i0 = Math.floor(pos), f = pos - i0, hx = 225 + pos * 150, hy = 1500 - Math.min(6, i0) * 105 - (f > 0.5 && i0 < 6 ? (f - 0.5) * 2 * 105 : 0);
        const h = lerp(300, 520, eio(seg(lt, grow - 0.3, d)));
        hero({ x: hx, y: hy, h, t, walk: t * 13, lean: 10, mood: lt > grow ? 'smile' : 'determined', look: [1, -0.3], wind: 0.9, glow: 'rgba(255,210,140,0.9)' });
        if (lt > grow) motes(t, 1, 20, '#FFE2A0', [hx - 300, hy - 700, 600, 700], 60);
        ctx.restore();
      } });
    for (let i = 0; i < 6; i++) cue(st + 0.05 + i * 0.36, 'chime', { n: i, gain: 0.45 }); cue(Wt(25, 0), 'shimmer', { dur: 1.2 }); }

  // ═══ V · "And look: the competition in the world today" — a grey city rat race; he is the only one in colour
  { const st = cut(26);
    add({ id: 'V', at: st, tin: { type: 'zoom', d: 0.4 }, note: 'grey city crowd racing on a road, charts up and down, hero in colour', grade: () => ({ sat: 0.6, con: 1.06, bloom: 0.2, vig: 0.65, bars: 0.5, tint: '#3A5A88', tintA: 0.15 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1100, lerp(1.0, 0.92, eio(seg(lt, 0, d))));
        city(t, 0.85, lt * 120);
        billboard(250, 900, 1.0, true, t, 0.8); billboard(820, 820, 0.9, false, t, 0.8);
        for (let i = 0; i < 9; i++) { const x = 60 + i * 120 + Math.sin(t * 3 + i) * 10, y = 1470 + (i % 3) * 40; ctx.save(); ctx.globalAlpha = 0.5; hero({ x, y, h: 300, t: t + i, walk: t * 14 + i, lean: 12, mood: 'bored', look: [1, 0], scarf: false, shadow: false }); ctx.restore(); }
        hero({ x: 560, y: 1560, h: 340, t, walk: t * 14, lean: 12, mood: 'determined', look: [1, 0], wind: 0.8, glow: 'rgba(255,200,130,0.9)' });
        ctx.restore();
      } });
    cue(st, 'whoosh'); cue(st + 0.3, 'tick', { dur: 1.7 }); }

  // ═══ W · "has brought people frustration, and depression, and all of that." — the crowd slumps under rain clouds
  { const st = cut(28), fr = Wt(28, 2) - st, dep = Wt(29, 0) - st, look = Wt(30, 0) - st;
    add({ id: 'W', at: st, note: 'crowd stops and slumps, rain clouds pop over heads; hero looks to camera, then to the light', grade: (lt) => ({ sat: lerp(0.6, 0.4, seg(lt, dep, dep + 0.5)), con: 1.06, bloom: 0.25, vig: 0.75, bars: 0.6, tint: '#2A4A88', tintA: 0.2 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1180, lerp(1.0, 1.1, eio(seg(lt, 0, d))));
        city(t, 0.92, 0);
        const people = [[110, 1480], [250, 1520], [390, 1470], [720, 1480], [860, 1520], [990, 1470], [180, 1610], [930, 1620]];
        people.forEach(([x, y], i) => { const slump = eo(seg(lt, fr - 0.2 + i * 0.05, fr + 0.4 + i * 0.05)); ctx.save(); ctx.globalAlpha = 0.55; hero({ x, y, h: 300, t: t + i, lean: slump * 28, headTilt: slump * 34, mood: slump > 0.5 ? 'sad' : 'bored', look: [0, 1], scarf: false, shadow: false, pose: { arms: { L: [-4, 4], R: [4, 4] } } }); ctx.restore(); miniCloud(x + slump * 20, y - 360, 0.42, t + i, eob(seg(lt, fr + i * 0.07, fr + 0.3 + i * 0.07)) * (i % 2 || lt > dep ? 1 : 0.6)); });
        const lit = seg(lt, look + 0.4, d);
        if (lit > 0) { rays(1100, 300, t, lit * 1.2, 7, 1800, 0.25, '#FFD9A0', Math.PI * 0.75); glow(560, 1300, 420, '#FFC870', 0.3 * lit); }
        hero({ x: 560, y: 1560, h: 380, t, dir: lt > look + 0.5 ? 1 : -1, mood: lt < look ? 'calm' : lt < look + 0.5 ? 'determined' : 'smile', look: lt < look ? [0.5, 0] : lt < look + 0.5 ? [-0.2, 0.1] : [1, -0.6], blink: 0, wind: 0.4 + lit * 0.5, glow: 'rgba(255,200,130,0.9)' });
        ctx.restore();
      } });
    cue(st, 'rain', { dur: 2.6, gain: 0.7 }); cue(Wt(29, 0), 'heart', { gain: 0.7 }); }

  // ═══ X · end — he runs into the same sunrise, a gazelle and a lion running beside him. "قوم… واجري"
  { const st = 41.45;
    add({ id: 'X', at: st, tin: { type: 'flash', d: 0.45, color: '#FFE9C0' }, note: 'END: hero runs into the sunrise with gazelle + lion silhouettes, title', grade: () => ({ sat: 1.12, bloom: 0.5, vig: 0.5, bars: 0.4, tint: '#FFA040', tintA: 0.12 }),
      draw(lt, d, t) {
        const camX = lt * 500;
        ctx.save(); cam(540, 1150, lerp(1.1, 0.95, eio(seg(lt, 0, d))));
        savanna(camX, t, { tod: 0.15, redSun: 260, sunY: 1080, sunX: 600 });
        gazelle(280, 1470, 0.75, { t, run: t * 14, mood: 'determined', look: [1, 0] });
        lion(720, 1500, 0.8, { t, run: t * 18 + 1, mood: 'determined', look: [1, 0] });
        hero({ x: 520, y: 1520, h: 440, t, walk: t * 15, lean: 12, mood: 'smile', look: [1, -0.2], wind: 1, glow: 'rgba(255,200,130,0.95)' });
        ctx.restore();
        const a = eo(seg(lt, 0.35, 0.9)); ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 540 - (1 - a) * 30);
        ctx.font = '900 160px Cairo'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(50,15,40,0.85)'; ctx.shadowBlur = 40; ctx.fillStyle = GOLDC; ctx.fillText('قوم… واجري', 0, 0); ctx.shadowColor = 'rgba(255,190,80,0.8)'; ctx.shadowBlur = 50; ctx.fillText('قوم… واجري', 0, 0);
        ctx.shadowBlur = 0; const sw = (lt - 0.4) * 900 - 500, g = ctx.createLinearGradient(sw - 150, 0, sw + 150, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,245,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillText('قوم… واجري', 0, 0);
        ctx.direction = 'ltr'; ctx.font = '800 42px Inter'; ctx.letterSpacing = '14px'; ctx.shadowColor = 'rgba(50,15,40,0.9)'; ctx.shadowBlur = 20; ctx.fillStyle = 'rgba(255,240,215,0.95)'; ctx.fillText('WAKE UP. RUN.', 8, 140); ctx.restore();
      } });
    cue(st, 'reveal', { dur: 1.8, gain: 0.8 }); cue(st, 'gallop', { dur: 2.4, rate: 0.12, gain: 0.6 }); cue(st + 0.5, 'shimmer', { dur: 1.4 }); }

  return { shots: S, cues: CUES };
}
