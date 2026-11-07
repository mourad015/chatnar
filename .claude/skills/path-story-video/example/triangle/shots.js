// قاعدة في الحياة · أين تجد الراحة النفسية؟ — the triangle of inner peace.
// One world: a valley. Grey drizzle + burdens (problems, pain, illness) → the burdens become one point of light (closer to God)
// → the three things God wants, acted out → the speaker's triangle, drawn on a night-blue blueprint, corner by corner
// → the arrows run, the triangle turns like a wheel → the same valley in full bloom at sunrise. Series intro + end card.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './lib.js';
import { L, Wt, T } from './timing.js';
import { hero, bigFace, POSE, INK } from './fig.js';
import * as Wd from './world.js';
import { seriesIntro, seriesEnd } from './series.js';
const { mix, rgba, grad, glow, sun, ridge, haze, cloud, rays, rain, motes, flare, goldPath, polyLen, pointAt } = Wd;

const cam = (cx, cy, z = 1, rot = 0, sx = W / 2, sy = H / 2) => { ctx.translate(sx, sy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy); };
const blink = (t, k = 0) => (((t + k) % 3.4) < 0.11 ? 1 : 0);
const GOLDC = '#F6C453', NAVY = '#141A2E';

// ═════════════ the valley: bloom 0 = grey drizzle, 1 = lush sunrise ═════════════
const GR = 1460;
function valley(t, bloom, camX = 0, o = {}) {
  const P = (a, b) => mix(a, b, bloom);
  grad([[0, P('#3E4658', '#3F5FB0')], [0.5, P('#6E7686', '#E8957A')], [0.8, P('#8C929C', '#FFC98E')], [1, P('#9EA2A8', '#FFE7B6')]], -600, 1300);
  if (bloom > 0.05) sun(620 - camX * 0.03, lerp(1250, 900, bloom), 100, '#FFF6DE', '#FFB870', bloom);
  if (bloom < 0.9) { ctx.save(); ctx.globalAlpha = 1 - bloom; for (let i = 0; i < 6; i++) cloud(((i * 360 - camX * 0.1 + t * 10) % 2100 + 2100) % 2100 - 500, 230 + (i % 3) * 130, 1.2, '#5C6474', '#6C7484'); ctx.restore(); }
  ridge(1170, 240, 61, P('#5E6676', '#C58FA0'), camX * 0.12, 0.4); haze(1130, 140, P('#8C929C', '#FFC7A0'), 0.5);
  ridge(1270, 150, 63, P('#4E5664', '#8E6E98'), camX * 0.3);
  ridge(1360, 90, 65, P('#424A56', '#5E9455'), camX * 0.55);
  ctx.fillStyle = P('#3C434E', '#6FA35E'); ctx.fillRect(-1500, 1390, W + 3000, 2000);
  // the river
  ctx.save(); ctx.beginPath(); ctx.moveTo(-200, 1700); ctx.bezierCurveTo(300, 1560, 500, 1500, 1300, 1440); ctx.lineWidth = 60; ctx.strokeStyle = P('#59606C', '#7FC6E4'); ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 12; ctx.strokeStyle = P('#6A717C', '#E4F6FF'); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3); ctx.stroke(); ctx.restore();
  // grass + flowers
  for (let i = Math.floor(camX / 70) - 12; i < Math.floor(camX / 70) + 22; i++) {
    const x = i * 70 + rnd(i) * 50 - camX + 540, y = 1420 + rnd(i + 2) * 440, hh = 18 + rnd(i + 4) * 24;
    ctx.strokeStyle = P('#2E343E', '#4E8A48'); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y - hh); ctx.moveTo(x, y); ctx.lineTo(x + 8, y - hh * 0.9); ctx.stroke();
    const fb = seg(bloom, 0.55 + rnd(i + 7) * 0.3, 0.75 + rnd(i + 7) * 0.3); if (fb > 0) { ctx.beginPath(); ctx.arc(x, y - hh, 9 * fb, 0, TAU); ctx.fillStyle = ['#FFD45A', '#FF8FA3', '#FFFFFF', '#C99BFF'][i & 3 & 3]; ctx.fill(); }
  }
}
// ═════════════ burdens + symbols ═════════════
function knot(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(t * 0.6); ctx.strokeStyle = '#1E222C'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 80; i++) { const a = i * 0.47, r = 48 + Math.sin(i * 1.3) * 18; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke(); ctx.restore(); }
function crackedHeart(x, y, s, c = '#8E2A34') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 50); ctx.bezierCurveTo(-110, -20, -60, -100, 0, -50); ctx.bezierCurveTo(60, -100, 110, -20, 0, 50); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = '#1B0E12'; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-4, -48); ctx.lineTo(12, -18); ctx.lineTo(-10, 4); ctx.lineTo(8, 30); ctx.stroke(); ctx.restore(); }
function pill(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.5); ctx.beginPath(); ctx.roundRect(-70, -28, 70, 56, [28, 0, 0, 28]); ctx.fillStyle = '#B9474A'; ctx.fill(); ctx.beginPath(); ctx.roundRect(0, -28, 70, 56, [0, 28, 28, 0]); ctx.fillStyle = '#D9D4CC'; ctx.fill(); ctx.restore(); }
function gloom(x, y, r, t, a = 1, seed = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath();
  for (let i = 0; i <= 24; i++) { const an = i / 24 * TAU, rr = r * (1 + 0.16 * Math.sin(an * 5 + t * 6 + seed) + 0.08 * Math.sin(an * 9 - t * 4)); i ? ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.9) : ctx.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.9); }
  ctx.closePath(); ctx.fillStyle = '#16121C'; ctx.shadowColor = 'rgba(120,20,40,0.6)'; ctx.shadowBlur = r * 0.5; ctx.fill(); ctx.shadowBlur = 0;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sx * r * 0.42 - r * 0.16, y - r * 0.18 - (sx > 0 ? 0 : r * 0.08)); ctx.lineTo(x + sx * r * 0.42 + r * 0.16, y - r * 0.18 - (sx > 0 ? r * 0.08 : 0)); ctx.lineTo(x + sx * r * 0.36, y - r * 0.02); ctx.closePath(); ctx.fillStyle = '#FF4A4A'; ctx.fill(); }
  ctx.restore();
}
function shield(x, y, s, glowA = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (glowA) { ctx.shadowColor = `rgba(255,200,90,${glowA})`; ctx.shadowBlur = 50; } ctx.beginPath(); ctx.moveTo(0, -110); ctx.quadraticCurveTo(70, -80, 95, -90); ctx.quadraticCurveTo(100, 40, 0, 115); ctx.quadraticCurveTo(-100, 40, -95, -90); ctx.quadraticCurveTo(-70, -80, 0, -110); ctx.fillStyle = GOLDC; ctx.fill(); ctx.shadowBlur = 0; ctx.beginPath(); ctx.moveTo(0, -78); ctx.quadraticCurveTo(48, -58, 66, -64); ctx.quadraticCurveTo(68, 26, 0, 80); ctx.quadraticCurveTo(-68, 26, -66, -64); ctx.quadraticCurveTo(-48, -58, 0, -78); ctx.fillStyle = NAVY; ctx.fill(); ctx.strokeStyle = GOLDC; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-6, 24); ctx.lineTo(32, -22); ctx.stroke(); ctx.restore(); }
function sprout(x, y, s, p, t) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const h = 40 + p * 230; ctx.strokeStyle = '#5E9455'; ctx.lineWidth = 12 + p * 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(14 * Math.sin(t), -h * 0.5, 0, -h); ctx.stroke();
  const leaves = Math.floor(2 + p * 6); for (let i = 0; i < leaves; i++) { const k = (i + 1) / (leaves + 1), side = i % 2 ? 1 : -1, ls = (0.4 + p * 0.8) * seg(p, i / leaves * 0.8, i / leaves * 0.8 + 0.25); ctx.save(); ctx.translate(0, -h * k); ctx.rotate(side * (0.9 + Math.sin(t * 2 + i) * 0.05)); ctx.beginPath(); ctx.ellipse(0, -36 * ls, 20 * ls, 40 * ls, 0, 0, TAU); ctx.fillStyle = i % 3 ? '#78B067' : '#8FC77A'; ctx.fill(); ctx.restore(); }
  if (p > 0.7) { const fa = seg(p, 0.7, 1); ctx.save(); ctx.translate(0, -h - 20); ctx.beginPath(); ctx.arc(0, 0, 34 * fa, 0, TAU); ctx.fillStyle = '#78B067'; ctx.fill(); ctx.shadowColor = 'rgba(255,200,90,0.9)'; ctx.shadowBlur = 20; for (const [fx, fy] of [[-20, 6], [18, -10], [4, 18]]) { ctx.beginPath(); ctx.arc(fx, fy, 9 * fa, 0, TAU); ctx.fillStyle = GOLDC; ctx.fill(); } ctx.restore(); }
  ctx.restore();
}
function sunEmblem(x, y, s, t, a = 1) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a; glow(0, 0, 260, '#FFD98A', 0.6); ctx.rotate(t * 0.4); ctx.fillStyle = GOLDC; for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); ctx.beginPath(); ctx.moveTo(-12, -78); ctx.lineTo(0, -128); ctx.lineTo(12, -78); ctx.fill(); } ctx.beginPath(); ctx.arc(0, 0, 64, 0, TAU); ctx.fillStyle = '#FFF2C8'; ctx.fill(); ctx.restore(); }
function medallion(x, y, r, n, fill, t, icon) {
  ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = `rgba(20,26,46,${0.45 + 0.4 * fill})`; ctx.fill();
  ctx.setLineDash(fill > 0.99 ? [] : [16, 12]); ctx.lineWidth = 8; ctx.strokeStyle = GOLDC; ctx.shadowColor = 'rgba(255,200,90,0.8)'; ctx.shadowBlur = 20 * (0.3 + fill); ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
  if (fill > 0 && icon) { ctx.save(); ctx.globalAlpha = fill; icon(); ctx.restore(); }
  else { ctx.font = '900 90px Cairo'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(246,196,83,0.85)'; ctx.fillText(n, 0, 6); }
  ctx.restore();
}
// ═════════════ the blueprint + the triangle ═════════════
const TA = [540, 640], TL = [190, 1250], TR = [890, 1250];
function blueprint(t) {
  const g = ctx.createRadialGradient(540, 900, 50, 540, 960, 1400); g.addColorStop(0, '#22305A'); g.addColorStop(1, '#0A0E1C'); ctx.fillStyle = g; ctx.fillRect(-2000, -2000, W + 4000, H + 4000);
  ctx.strokeStyle = 'rgba(140,170,230,0.08)'; ctx.lineWidth = 2; for (let x = -1000; x < 2100; x += 90) { ctx.beginPath(); ctx.moveTo(x, -1000); ctx.lineTo(x, 3000); ctx.stroke(); } for (let y = -1000; y < 3000; y += 90) { ctx.beginPath(); ctx.moveTo(-1000, y); ctx.lineTo(2100, y); ctx.stroke(); }
  motes(t, 0.6, 26, '#FFE2A0', [-200, -200, W + 400, H + 400], 12);
}
function triangle(p, w = 18, glowPx = 36, a = 1) { goldPath([TL, TA, TR, TL, TA], polyLen([TL, TA, TR, TL]) * p, w, glowPx, GOLDC, a); }
function comet(pts, k, r = 26) { const L_ = polyLen(pts), q = pointAt(pts, (k % 1) * L_); glow(q[0], q[1], r * 5, '#FFF2C8', 0.9); ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, TAU); ctx.fillStyle = '#FFFBEA'; ctx.fill(); }
function cornerIcons(t, a, b, c) { sunEmblem(TA[0], TA[1], 0.75 * a, t, a); if (b > 0) shield(TL[0], TL[1], 0.8 * b, 0.8); if (c > 0) sprout(TR[0], TR[1] + 60, 0.55, c, t); }

export function buildShots() {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  const cut = (i) => L(i) - 0.06;
  const SC = () => window.OP.script;

  // ═══ 0 · series intro
  add({ id: 'INTRO', at: 0, note: 'series sting: قاعدة في الحياة + episode title', grade: () => ({ sat: 1.05, bloom: 0.45, vig: 0.6 }),
    draw(lt, d, t) { seriesIntro(lt, d, t, SC()); } });
  cue(0.05, 'thump', { gain: 0.7 }); cue(0.1, 'shimmer', { dur: 1.2, gain: 0.8 }); cue(0.6, 'chime', { n: 4, gain: 0.5 });

  // ═══ 1 · all our problems, pain, illnesses — burdens land on his back in the grey drizzle
  { const st = T.lead - 0.15, b = [Wt(0, 1), Wt(1, 1), Wt(2, 1)].map((w) => w - st);
    add({ id: 'S01', at: st, tin: { type: 'zoom', d: 0.4 }, note: 'grey drizzle valley; knot, cracked heart, pill land on his back; he bends', grade: () => ({ sat: 0.55, con: 1.05, tint: '#3A5A88', tintA: 0.22, vig: 0.7, bars: 0.5 }),
      draw(lt, d, t) {
        const camX = lt * 70; ctx.save(); cam(540, 1150, lerp(1.0, 1.08, eio(seg(lt, 0, d))));
        valley(t, 0, camX);
        const n = b.filter((x) => lt > x).length, lean = [4, 12, 20, 28][n];
        const hx = 500, top = GR - 330;
        hero({ x: hx, y: GR, h: 420, t, walk: t * 4.2, lean, headTilt: n * 6, mood: n ? 'sad' : 'calm', look: [1, 0.6], blink: blink(t), wind: 0.05 });
        const drop = (k) => { const p = seg(lt, b[k] - 0.3, b[k]); return [lerp(-600, 0, eio(p)), p]; };
        if (lt > b[0] - 0.3) { const [dy] = drop(0); knot(hx - 60, top - 20 + dy, 1.0, t); }
        if (lt > b[1] - 0.3) { const [dy] = drop(1); crackedHeart(hx - 70, top - 120 + dy, 0.9); }
        if (lt > b[2] - 0.3) { const [dy] = drop(2); pill(hx - 50, top - 205 + dy, 0.85); }
        ctx.restore(); rain(t, 0.6, 100, -8);
      } });
    b.forEach((x) => cue(st + x, 'thump', { gain: 0.8 })); cue(st, 'rain', { dur: 5.5, gain: 0.6 }); }

  // ═══ 2 · for three things… or one thing — the burdens lift into a triangle of 3 points, then merge into ONE light
  { const st = cut(3), one = Wt(4, 1) - st;
    add({ id: 'S02', at: st, note: 'burdens rise into 3 points, then merge into one gold light on حاجة', grade: () => ({ sat: 0.65, con: 1.05, tint: '#3A5A88', tintA: 0.18, vig: 0.65, bars: 0.5, bloom: 0.35 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1050, 1.0); valley(t, 0.05, 260);
        const up = eio(seg(lt, 0.0, 0.6)), m = eio(seg(lt, one - 0.25, one + 0.15));
        const pts = [[540, 520], [330, 860], [750, 860]];
        const items = [(x, y) => knot(x, y, 0.9, t), (x, y) => crackedHeart(x, y, 0.8), (x, y) => pill(x, y, 0.8)];
        pts.forEach(([x, y], k) => { const sx = lerp(470, x, up), sy = lerp(1150 - k * 90, y, up), fx = lerp(sx, 540, m), fy = lerp(sy, 640, m); ctx.save(); ctx.globalAlpha = 1 - m; items[k](fx, fy); ctx.restore(); glow(fx, fy, 120, '#FFD98A', 0.5 * up * (1 - m)); });
        if (up > 0.9 && m < 1) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - m); ctx.setLineDash([16, 14]); ctx.strokeStyle = GOLDC; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); ctx.lineTo(...pts[2]); ctx.closePath(); ctx.stroke(); ctx.restore(); }
        if (m > 0) { glow(540, 640, 300 * m, '#FFE7A8', 0.9 * m); ctx.beginPath(); ctx.arc(540, 640, 40 * eob(m), 0, TAU); ctx.fillStyle = '#FFFBEA'; ctx.fill(); }
        hero({ x: 470, y: GR, h: 420, t, lean: lerp(20, 4, up), mood: m > 0.5 ? 'awe' : 'sad', look: [0.3, -1], blink: 0, wind: 0.1 });
        ctx.restore(); rain(t, 0.4 * (1 - m), 80, -8);
      } });
    cue(st + 0.05, 'swell', { dur: 0.6, gain: 0.6 }); cue(st + one, 'reveal', { dur: 1.0, gain: 0.7 }); cue(st + one, 'chime', { n: 5, gain: 0.6 }); }

  // ═══ 3 · to bring us closer to God — the light becomes a shaft from above; he lifts his face
  { const st = cut(5);
    add({ id: 'S03', at: st, note: 'light shaft descends onto him, rain stops inside it, warmth begins', grade: (lt) => ({ sat: lerp(0.65, 0.9, seg(lt, 0, 2)), con: 1.05, tint: '#FFA040', tintA: 0.12 * seg(lt, 0, 2), vig: 0.6, bars: 0.45, bloom: 0.45 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, lerp(1050, 1120, eio(seg(lt, 0, d))), lerp(1.0, 1.1, eio(seg(lt, 0, d))));
        valley(t, 0.18 * seg(lt, 0, d), 300);
        const k = eo(seg(lt, 0.1, 1.0));
        ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, -300, 0, GR); g.addColorStop(0, rgba('#FFE7A8', 0)); g.addColorStop(1, rgba('#FFE7A8', 0.55 * k)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(470, -300); ctx.lineTo(610, -300); ctx.lineTo(760, GR); ctx.lineTo(300, GR); ctx.closePath(); ctx.fill(); ctx.restore();
        glow(540, GR - 220, 420, '#FFD98A', 0.45 * k); motes(t, k, 24, '#FFE2A0', [300, 300, 480, 1100], 40);
        hero({ x: 540, y: GR, h: 520, t, lean: 0, headTilt: -10, mood: 'awe', look: [0, -1], blink: blink(t), wind: 0.25, glow: `rgba(255,214,150,${0.5 + 0.5 * k})`, pose: POSE.openPalms });
        ctx.restore(); rain(t, 0.35 * (1 - k), 80, -8);
      } });
    cue(st, 'swell', { dur: 1.6, gain: 0.7 }); }

  // ═══ 4 · the moment it hurts, you say "O Lord" — hand on chest, a red sting; then he looks up and warm light floods
  { const st = cut(6), hurt = Wt(6, 1) - st, rab = Wt(7, 1) - st;
    add({ id: 'S04', at: st, tin: { type: 'cut' }, note: 'close: pain sting on chest, flinch; يا رب → looks up, warm flood', grade: (lt) => ({ sat: 0.95, con: 1.08, tint: lt < rab ? '#FF3030' : '#FFA040', tintA: lt < rab ? 0.18 * Math.max(0, 1 - Math.abs(lt - hurt) / 0.4) : 0.16, mode: lt < rab ? 'overlay' : 'soft-light', vig: 0.75, bars: 0.6, bloom: lt > rab ? 0.6 : 0.3, shake: 8 * Math.max(0, 1 - Math.abs(lt - hurt) / 0.25) }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 900, lerp(1.0, 1.08, eio(seg(lt, 0, d))));
        const warm = seg(lt, rab - 0.1, rab + 0.5);
        grad([[0, mix('#2A3150', '#E8907A', warm)], [1, mix('#4A5068', '#FFE0A8', warm)]], -300, 2000);
        glow(540, 300, 1000, '#FFD98A', 0.7 * warm); rays(540, -200, t, warm * 1.4, 12, 2400, 0.4, '#FFE7B0');
        const r = hero({ x: 540, y: 2050, h: 1300, t, mood: lt < rab ? 'hurt' : 'awe', look: lt < rab ? [0.2, 0.6] : [0, -1], headTilt: lt < rab ? 14 : -12, wet: true, blink: 0, wind: 0.2, shadow: false, lean: lt < rab && lt > hurt ? 6 : 0, glow: `rgba(255,214,150,${0.3 + 0.6 * warm})`, pose: POSE.handChest });
        const sting = Math.max(0, 1 - Math.abs(lt - hurt - 0.05) / 0.35);
        if (sting > 0) { glow(560, 1300, 260, '#FF3A3A', 0.8 * sting); ctx.save(); ctx.globalAlpha = sting; ctx.strokeStyle = '#FF5A5A'; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(520, 1220); ctx.lineTo(560, 1290); ctx.lineTo(530, 1330); ctx.lineTo(575, 1400); ctx.stroke(); ctx.restore(); }
        motes(t, warm, 24, '#FFE2A0', [0, 0, W, H], 40);
        ctx.restore();
      } });
    cue(st + hurt, 'thump', { gain: 0.9 }); cue(st + hurt, 'heart', { gain: 0.7 }); cue(st + rab, 'reveal', { dur: 1.4, gain: 0.8 }); cue(st + rab, 'shimmer', { dur: 1.2 }); }

  // ═══ 5 · (quiet) he kneels in the light; the rain is gone
  { const st = L(7) + 0.75;
    add({ id: 'S05', at: st, tin: { type: 'fade', d: 0.4 }, note: 'wordless: he kneels in the light, valley warming', grade: () => ({ sat: 0.95, tint: '#FFA040', tintA: 0.12, vig: 0.6, bars: 0.5, bloom: 0.45 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1160, lerp(1.05, 1.0, eio(seg(lt, 0, d))));
        valley(t, 0.3, 300);
        ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, -300, 0, GR); g.addColorStop(0, rgba('#FFE7A8', 0)); g.addColorStop(1, rgba('#FFE7A8', 0.45)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(470, -300); ctx.lineTo(610, -300); ctx.lineTo(760, GR); ctx.lineTo(300, GR); ctx.closePath(); ctx.fill(); ctx.restore();
        hero({ x: 540, y: GR, hipY: GR - 150, h: 460, t, mood: 'bliss', blink: 0, headTilt: 18, wind: 0.2, glow: 'rgba(255,214,150,0.9)', pose: { legs: { L: [90, 95], R: [85, 90] }, arms: { L: [-10, 40], R: [30, 140] } }, shadow: false });
        motes(t, 1, 22, '#FFE2A0', [300, 500, 480, 900], 35);
        ctx.restore();
      } });
    cue(st, 'chime', { n: 2, gain: 0.4 }); }

  // ═══ 6 · and God wants this from you — three empty medallions appear in a triangle above him
  { const st = cut(8);
    add({ id: 'S06', at: st, tin: { type: 'cut' }, note: 'three empty numbered medallions pop in (triangle formation)', grade: () => ({ sat: 1.0, tint: '#FFA040', tintA: 0.1, vig: 0.6, bars: 0.45, bloom: 0.4 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1000, 1.0);
        valley(t, 0.35, 300);
        [[540, 520, '١'], [300, 860, '٢'], [780, 860, '٣']].forEach(([x, y, n], k) => { const s = eob(seg(lt, 0.25 + k * 0.25, 0.55 + k * 0.25)); if (s > 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); medallion(x, y + Math.sin(t * 1.5 + k) * 8, 105, n, 0, t); ctx.restore(); } });
        hero({ x: 540, y: GR, h: 440, t, mood: 'calm', look: [0, -1], blink: blink(t), wind: 0.3, glow: 'rgba(255,214,150,0.6)' });
        ctx.restore();
      } });
    [0, 1, 2].forEach((k) => cue(st + 0.25 + k * 0.25, 'pop', { gain: 0.7 })); }

  // ═══ 7 · one — avoid, keep away from negative behaviour: gloom creatures swarm; a gold shield; they bounce off and fade
  { const st = cut(9), up = Wt(9, 2) - st, neg = Wt(10, 2) - st;
    add({ id: 'S07', at: st, tin: { type: 'whip', d: 0.3, dir: 1 }, note: 'dark smoke creatures with red eyes close in; shield raised on تتفادى; they bounce off', grade: (lt) => ({ sat: 0.85, con: 1.08, vig: 0.7, bars: 0.5, bloom: 0.35, tint: '#4A3A88', tintA: 0.14 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1150, lerp(1.0, 1.06, eio(seg(lt, 0, d))));
        valley(t, 0.35, 600);
        const sh = eob(seg(lt, up - 0.15, up + 0.25));
        for (let i = 0; i < 6; i++) { const a0 = rnd(i + 2) * TAU, dist = lerp(700, 260, eio(seg(lt, 0, up))) + (lt > up ? eo(seg(lt, up, up + 0.6)) * 380 : 0); const x = 540 + Math.cos(a0) * dist * 0.9, y = 1150 + Math.sin(a0) * dist * 0.55 - 100; gloom(x, y, 60 + rnd(i) * 30, t, lt > neg + 0.2 ? 1 - seg(lt, neg + 0.2, neg + 0.7) : 1, i); }
        if (sh > 0) { ctx.save(); ctx.globalAlpha = 0.5 * sh; ctx.beginPath(); ctx.arc(540, 1150, 330 * sh, 0, TAU); ctx.strokeStyle = GOLDC; ctx.lineWidth = 10; ctx.shadowColor = 'rgba(255,200,90,0.9)'; ctx.shadowBlur = 40; ctx.stroke(); ctx.restore(); }
        hero({ x: 520, y: GR, h: 460, t, mood: lt > up ? 'determined' : 'scared', look: [lt > up ? 1 : -0.6, -0.2], blink: 0, wind: 0.5, pose: lt > up ? { arms: { L: [-10, 20], R: [100, -10] } } : POSE.flinch, glow: 'rgba(255,214,150,0.6)' });
        if (sh > 0) shield(640, 1060, 0.9 * sh, 0.9);
        medallion(950, 330, 70, '٢', seg(lt, neg, neg + 0.4), t, () => shield(0, 0, 0.42));
        ctx.restore();
      } });
    cue(st + up, 'whip', { gain: 0.7 }); cue(st + up + 0.05, 'thump', { gain: 0.8 }); cue(st + neg, 'pop', { gain: 0.6 }); }

  // ═══ 8 · and the third — improve yourself and do positive things: he waters a sprout; it grows into a fruiting tree
  { const st = cut(11), imp = Wt(12, 1) - st, pos = Wt(13, 2) - st;
    add({ id: 'S08', at: st, tin: { type: 'fade', d: 0.35 }, note: 'he waters a sprout; it grows to a small tree with gold fruit; hearts/sparkles', grade: () => ({ sat: 1.05, vig: 0.6, bars: 0.45, bloom: 0.45, tint: '#FFA040', tintA: 0.1 }),
      draw(lt, d, t) {
        ctx.save(); cam(560, 1180, lerp(1.12, 1.02, eio(seg(lt, 0, d))));
        valley(t, lerp(0.4, 0.6, seg(lt, 0, d)), 900);
        const g = eio(seg(lt, imp - 0.4, pos + 0.4));
        sprout(700, GR + 10, 1.25, 0.08 + g * 0.92, t);
        hero({ x: 470, y: GR, h: 460, t, lean: 14, mood: 'smile', look: [1, 0.6], blink: blink(t), wind: 0.4, pose: { arms: { L: [-6, 14], R: [80, 30] } }, glow: 'rgba(255,214,150,0.5)' });
        // watering can in his hand
        ctx.save(); ctx.translate(585, 1135); ctx.rotate(0.5 + Math.sin(t * 3) * 0.05); ctx.fillStyle = '#5E7FA3'; ctx.beginPath(); ctx.roundRect(-50, -40, 100, 80, 14); ctx.fill(); ctx.strokeStyle = '#5E7FA3'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(45, -10); ctx.lineTo(110, -50); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.strokeStyle = 'rgba(160,210,255,0.8)'; ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { const k = (t * 2 + i / 8) % 1; ctx.beginPath(); ctx.moveTo(680 + i * 4 + k * 20, 1090 + k * 300); ctx.lineTo(684 + i * 4 + k * 20, 1110 + k * 300); ctx.stroke(); } ctx.restore();
        if (lt > pos) motes(t, 1, 18, '#FFE2A0', [500, 700, 400, 700], 60);
        medallion(950, 330, 70, '٣', seg(lt, pos - 0.1, pos + 0.3), t, () => sprout(0, 40, 0.28, 1, t));
        ctx.restore();
      } });
    cue(st + imp, 'chime', { n: 3, gain: 0.6 }); cue(st + pos, 'shimmer', { dur: 1.0 }); }

  // ═══ 9 · I call it a triangle — the triangle draws itself on a night-blue blueprint
  { const st = cut(14);
    add({ id: 'S09', at: st, tin: { type: 'zoom', d: 0.4 }, note: 'blueprint; gold triangle draws itself; hero small below', grade: () => ({ sat: 1.05, con: 1.05, vig: 0.6, bloom: 0.5 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 980, lerp(1.08, 1.0, eio(seg(lt, 0, d))));
        blueprint(t); triangle(eio(seg(lt, 0.1, 1.1)));
        hero({ x: 540, y: 1540, h: 300, t, mood: 'awe', look: [0, -1], blink: 0, wind: 0.3, glow: 'rgba(255,214,150,0.9)' });
        ctx.restore();
      } });
    cue(st + 0.1, 'swell', { dur: 1.0, gain: 0.6 }); cue(st + 1.1, 'chime', { n: 4, gain: 0.6 }); }

  // ═══ 10 · at the top: closeness to God — push to the apex; the sun emblem ignites
  { const st = cut(15), lit = Wt(16, 0) - st;
    add({ id: 'S10', at: st, tin: { type: 'cut' }, note: 'push to apex; sun emblem ignites on التقرّب', grade: () => ({ sat: 1.08, vig: 0.6, bloom: 0.6 }),
      draw(lt, d, t) {
        const k = eio(seg(lt, 0, 0.6)); ctx.save(); cam(lerp(540, TA[0], k), lerp(980, TA[1] + 120, k), lerp(1.0, 1.55, k));
        blueprint(t); triangle(1);
        const a = eob(seg(lt, lit - 0.15, lit + 0.3)); sunEmblem(TA[0], TA[1], 0.9 * a, t, clamp(a)); if (a > 0) rays(TA[0], TA[1], t, a, 16, 900, Math.PI, '#FFE7B0', -Math.PI / 2);
        ctx.restore();
      } });
    cue(Wt(16, 0), 'reveal', { dur: 1.2, gain: 0.7 }); }

  // ═══ 11 · bottom left: staying away from the negative — the shield; gloom creatures bounce off it
  { const st = cut(17), lit = Wt(18, 0) - st;
    add({ id: 'S11', at: st, tin: { type: 'whip', d: 0.3, dir: -1 }, note: 'bottom-left corner: shield; gloom creatures bounce off and dissolve', grade: () => ({ sat: 1.05, vig: 0.6, bloom: 0.5 }),
      draw(lt, d, t) {
        ctx.save(); cam(TL[0] + 120, TL[1] - 100, 1.5);
        blueprint(t); triangle(1); sunEmblem(TA[0], TA[1], 0.75, t, 1);
        const a = eob(seg(lt, 0.2, 0.55)); shield(TL[0], TL[1], 0.85 * a, 0.9);
        for (let i = 0; i < 4; i++) { const ph = seg(lt, lit - 0.3 + i * 0.25, lit + 0.4 + i * 0.25), an = -0.6 - i * 0.5; const dist = 330 - Math.sin(ph * Math.PI) * 160; gloom(TL[0] + Math.cos(an) * dist, TL[1] + Math.sin(an) * dist, 46, t, ph < 1 ? 1 - seg(ph, 0.6, 1) * 0.9 : 0.1, i); }
        ctx.restore();
      } });
    cue(st + 0.2, 'pop', { gain: 0.8 }); for (let i = 0; i < 4; i++) cue(Wt(18, 0) + i * 0.25 + 0.05, 'tock', { gain: 0.5 }); }

  // ═══ 12 · and on the right: you improve yourself — the sprout grows into the corner tree
  { const st = cut(19), lit = Wt(20, 0) - st;
    add({ id: 'S12', at: st, tin: { type: 'whip', d: 0.3, dir: 1 }, note: 'bottom-right corner: sprout grows to a fruiting tree', grade: () => ({ sat: 1.08, vig: 0.6, bloom: 0.5 }),
      draw(lt, d, t) {
        ctx.save(); cam(TR[0] - 120, TR[1] - 140, 1.5);
        blueprint(t); triangle(1); sunEmblem(TA[0], TA[1], 0.75, t, 1); shield(TL[0], TL[1], 0.85, 0.6);
        sprout(TR[0], TR[1] + 60, 0.8, 0.1 + 0.9 * eio(seg(lt, 0.4, lit + 0.6)), t);
        if (lt > lit) motes(t, 1, 14, '#FFE2A0', [TR[0] - 250, TR[1] - 400, 500, 450], 50);
        ctx.restore();
      } });
    cue(Wt(19, 1), 'chime', { n: 1, gain: 0.5 }); cue(Wt(20, 0), 'shimmer', { dur: 1.0 }); }

  // ═══ 13 · and to improve yourself you must return to God — a comet runs from the tree up the right edge to the apex
  { const st = cut(21), ret = Wt(22, 1) - st;
    add({ id: 'S13', at: st, tin: { type: 'zoom', d: 0.35 }, note: 'whole triangle; comet climbs right edge to apex on ترجع; apex flares', grade: () => ({ sat: 1.08, vig: 0.55, bloom: 0.55 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 980, 1.0);
        blueprint(t); triangle(1); cornerIcons(t, 1, 1, 1);
        const k = eio(seg(lt, ret - 0.3, ret + 0.8)); if (k > 0 && k < 1) comet([TR, TA], k * 0.999);
        goldPath([TR, TA], polyLen([TR, TA]) * k, 30, 60, '#FFF0B8', 0.9);
        const fl = seg(lt, ret + 0.7, ret + 1.3); if (fl > 0) { glow(TA[0], TA[1], 500, '#FFF2C8', 0.8 * Math.sin(fl * Math.PI)); }
        hero({ x: 540, y: 1560, h: 260, t, mood: 'smile', look: [0.3, -1], blink: 0, wind: 0.3, glow: 'rgba(255,214,150,0.9)' });
        ctx.restore();
      } });
    cue(Wt(22, 1) - 0.3, 'riser', { dur: 0.6, gain: 0.6 }); cue(Wt(22, 1) + 0.7, 'chime', { n: 5, gain: 0.6 }); }

  // ═══ 14 · you'll see the triangle go like this… and the moment you do this — comets loop, the triangle turns like a wheel, then bursts
  { const st = cut(23), burst = Wt(24, 3) - st;
    add({ id: 'S14', at: st, note: 'comets loop all three edges; triangle spins faster; burst of light on كده', grade: (lt) => ({ sat: 1.1, vig: 0.5, bloom: lerp(0.55, 0.8, seg(lt, 0, burst)) }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 980, lerp(1.0, 1.12, eio(seg(lt, 0, burst))));
        blueprint(t);
        const spin = Math.pow(seg(lt, 0.3, burst), 2) * 7, cx = 540, cy = (TA[1] + TL[1] * 2) / 3;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(spin); ctx.translate(-cx, -cy);
        triangle(1, 18 + seg(lt, 0, burst) * 10, 40 + seg(lt, 0, burst) * 40); cornerIcons(t, 1, 1, 1);
        for (let c = 0; c < 3; c++) comet([TL, TA, TR, TL], (lt * (0.6 + seg(lt, 0, burst) * 1.2) + c / 3) % 1, 20);
        ctx.restore();
        const b = seg(lt, burst - 0.1, burst + 0.6); if (b > 0) { glow(cx, cy, 1400 * eo(b), '#FFF4D6', 1 - b * 0.6); }
        ctx.restore();
      } });
    cue(cut(23) + 0.3, 'swell', { dur: 2.2, gain: 0.7 }); cue(L(24) + (Wt(24, 3) - L(24)), 'reveal', { dur: 1.6, gain: 0.8 }); }

  // ═══ 15 · you find life's abundance working with you — the same valley, in full bloom at sunrise; end card
  { const st = cut(25);
    add({ id: 'S15', at: st, tin: { type: 'flash', d: 0.45, color: '#FFF4D6' }, note: 'valley in full bloom, he opens his arms; triangle emblem in the sky; series end card', grade: () => ({ sat: 1.12, vig: 0.5, bloom: 0.5, tint: '#FFA040', tintA: 0.12, bars: 0.35 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, lerp(1200, 1080, eio(seg(lt, 0, 3))), lerp(1.25, 0.95, eio(seg(lt, 0, 3.5))));
        valley(t, 1, lt * 40);
        ctx.save(); ctx.globalAlpha = 0.55; ctx.translate(540, 560); ctx.scale(0.38, 0.38); ctx.translate(-540, -980); triangle(1, 14, 30, 1); ctx.restore();
        for (let i = 0; i < 5; i++) Wd.bird(620 + i * 70 + lt * 90, 700 + Math.sin(i * 2) * 50, 0.7, t + i, '#4A2E40');
        hero({ x: 540, y: GR, h: 470, t, mood: 'bliss', blink: 0, wind: 0.8, glow: 'rgba(255,214,150,0.95)', pose: { arms: { L: [-125, 10], R: [125, -10] } }, headTilt: -8 });
        motes(t, 1, 26, '#FFE2A0', [0, 300, W, 1300], 40);
        ctx.restore();
        seriesEnd(lt - (T.lines[25].end + 0.45 - st), t, SC(), 620);
      } });
    cue(st, 'birds', { dur: 2.0, gain: 0.5 }); cue(T.lines[25].end + 0.45, 'chime', { n: 5, gain: 0.7 }); cue(T.lines[25].end + 0.5, 'shimmer', { dur: 1.5 }); }

  return { shots: S, cues: CUES };
}
