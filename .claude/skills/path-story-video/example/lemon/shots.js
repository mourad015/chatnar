// قاعدة في الحياة · اللي جواك… هيطلع — Dr. Ibrahim El-Fiky's lemon lesson.
// The speaker himself (cartoon likeness: LOOK.fiky) on a lecture stage: squeeze a lemon → only lemon; then squeeze a person
// → only what's inside: love, forgiveness… or the insult that ends up stamped on the insulter's own face.
// Colour: warm amber stage → yellow juice accents → cool x-ray teal (what's inside) → pink-gold love → dark red insult
// → bright comic punchline → warm stage ending + series end card.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './lib.js';
import { L, Wt, T } from './timing.js';
import { hero, bigFace, POSE, INK, LOOK } from './fig.js';
import * as Wd from './world.js';
import { seriesIntro, seriesEnd } from './series.js';
const { mix, rgba, grad, glow, rays, motes } = Wd;

const cam = (cx, cy, z = 1, rot = 0, sx = W / 2, sy = H / 2) => { ctx.translate(sx, sy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy); };
const blink = (t, k = 0) => (((t + k) % 3.4) < 0.11 ? 1 : 0);
const GOLDC = '#F6C453', LEMON = '#F7D23E', LEMON_D = '#D9A91C', FIKY = LOOK.fiky;
const DOC = (o) => hero({ ...FIKY, ...o });            // the speaker
const MEAN = { outfit: { jacket: '#6B2E2E', pants: '#3A2A2A', shirt: '#2A1A1A', tie: false } };

// ═════════════ the lecture stage ═════════════
const GR = 1420;
function stage(t, spot = 1, warm = 1) {
  grad([[0, mix('#1A1218', '#2A1A20', warm)], [1, mix('#2A2028', '#4A2E28', warm)]], 0, 1400);
  for (let i = 0; i < 9; i++) { const x = i * 130 - 40; ctx.fillStyle = i % 2 ? '#6E1E26' : '#7E2630'; ctx.beginPath(); ctx.moveTo(x, -100); ctx.quadraticCurveTo(x + 65 + Math.sin(t + i) * 4, 700, x + 10, 1300); ctx.lineTo(x + 140, 1300); ctx.quadraticCurveTo(x + 75, 700, x + 130, -100); ctx.fill(); }
  ctx.fillStyle = 'rgba(10,6,10,0.55)'; ctx.fillRect(-200, -200, W + 400, 1500);
  ctx.fillStyle = '#5A3A2A'; ctx.fillRect(-200, 1300, W + 400, 140); ctx.fillStyle = '#7A4E34'; ctx.fillRect(-200, 1300, W + 400, 16);
  ctx.fillStyle = '#2A1C18'; ctx.fillRect(-200, 1440, W + 400, 800);
  if (spot > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, -100, 0, GR); g.addColorStop(0, rgba('#FFE2A8', 0)); g.addColorStop(1, rgba('#FFE2A8', 0.4 * spot)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(470, -100); ctx.lineTo(610, -100); ctx.lineTo(820, GR); ctx.lineTo(260, GR); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.save(); ctx.globalAlpha = 0.5 * spot; ctx.beginPath(); ctx.ellipse(540, GR - 10, 290, 46, 0, 0, TAU); ctx.fillStyle = 'rgba(255,220,160,0.5)'; ctx.fill(); ctx.restore(); }
}
/** rows of audience heads from behind, at the bottom of the frame. react: 0..1 bob/turn */
function audience(t, y0 = 1650, react = 0, marks = 0) {
  for (let row = 0; row < 2; row++) for (let i = -1; i < 8; i++) {
    const x = i * 150 + (row ? 75 : 0) + 20, y = y0 + row * 150 + Math.sin(t * 6 + i * 2) * 8 * react, r = 62 + row * 10;
    ctx.fillStyle = row ? '#0C080C' : '#18121A'; ctx.beginPath(); ctx.ellipse(x, y + r * 1.6, r * 1.5, r * 0.9, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (marks > 0 && row === 0 && i % 2 === 0) { const s = eob(clamp(marks * 1.5 - i * 0.08)); if (s > 0) { ctx.save(); ctx.translate(x + 20, y - 120); ctx.scale(s, s); ctx.font = '900 110px Cairo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 14; ctx.strokeStyle = '#1A1218'; ctx.strokeText('؟', 0, 0); ctx.fillStyle = GOLDC; ctx.fillText('؟', 0, 0); ctx.restore(); } }
  }
}
// ═════════════ props ═════════════
function lemon(x, y, s, sq = 0, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (1 + sq * 0.25), s * (1 - sq * 0.3));
  ctx.beginPath(); ctx.moveTo(-95, 0); ctx.quadraticCurveTo(-90, -62, 0, -64); ctx.quadraticCurveTo(90, -62, 95, 0); ctx.quadraticCurveTo(90, 62, 0, 64); ctx.quadraticCurveTo(-90, 62, -95, 0); ctx.closePath(); ctx.fillStyle = LEMON; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-100, 0, 14, 10, 0, 0, TAU); ctx.ellipse(100, 0, 14, 10, 0, 0, TAU); ctx.fillStyle = LEMON_D; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-25, -28, 38, 14, -0.2, 0, TAU); ctx.fillStyle = 'rgba(255,255,230,0.55)'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-60, -66, 34, 13, -0.5, 0, TAU); ctx.fillStyle = '#5E9455'; ctx.fill();
  ctx.restore();
}
function glass(x, y, s, fill, color = LEMON) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-70, -200); ctx.lineTo(-55, 0); ctx.lineTo(55, 0); ctx.lineTo(70, -200); ctx.closePath(); ctx.fillStyle = 'rgba(220,240,255,0.18)'; ctx.fill();
  if (fill > 0) { const fy = -190 * fill; ctx.beginPath(); ctx.moveTo(-55 - 15 * fill, fy); ctx.lineTo(-55, 0); ctx.lineTo(55, 0); ctx.lineTo(55 + 15 * fill, fy); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-44, fy + 8, 10, -fy - 16); }
  ctx.strokeStyle = 'rgba(235,245,255,0.85)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-70, -200); ctx.lineTo(-55, 0); ctx.lineTo(55, 0); ctx.lineTo(70, -200); ctx.stroke();
  ctx.restore();
}
function drops(x, y0, y1, t, a = 1, color = LEMON) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; for (let i = 0; i < 4; i++) { const k = (t * 2.4 + i / 4) % 1, y = lerp(y0, y1, k * k); ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.quadraticCurveTo(x + 11, y, x, y + 10); ctx.quadraticCurveTo(x - 11, y, x, y - 18); ctx.fill(); } ctx.restore(); }
function apple(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.arc(-26, 6, 52, 0, TAU); ctx.arc(26, 6, 52, 0, TAU); ctx.fillStyle = '#E2453C'; ctx.fill(); ctx.strokeStyle = '#5A3A2A'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(6, -72); ctx.stroke(); ctx.beginPath(); ctx.ellipse(28, -62, 24, 11, -0.4, 0, TAU); ctx.fillStyle = '#5E9455'; ctx.fill(); ctx.restore(); }
function melon(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.arc(0, -20, 100, 0, Math.PI); ctx.fillStyle = '#2E7A3A'; ctx.fill(); ctx.beginPath(); ctx.arc(0, -20, 84, 0, Math.PI); ctx.fillStyle = '#F2EED8'; ctx.fill(); ctx.beginPath(); ctx.arc(0, -20, 76, 0, Math.PI); ctx.fillStyle = '#E8485A'; ctx.fill(); ctx.fillStyle = '#1A1218'; for (const [sx, sy] of [[-30, 10], [0, 30], [30, 10], [-10, 50], [20, 45]]) { ctx.beginPath(); ctx.ellipse(sx, sy, 5, 9, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
function bubble(x, y, r, a, inner, tx, ty) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#FFF8EC'; ctx.beginPath(); ctx.arc(tx, ty, 14, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(lerp(tx, x, 0.45), lerp(ty, y, 0.45) + 20, 24, 0, TAU); ctx.fill(); for (const [dx, dy, rr] of [[-0.55, 0.1, 0.62], [0, -0.25, 0.75], [0.55, 0.05, 0.64], [0, 0.32, 0.7]]) { ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr * r, 0, TAU); ctx.fill(); } inner(); ctx.restore(); }
function crossX(x, y, s) { if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fillStyle = '#E2453C'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-32, -32); ctx.lineTo(32, 32); ctx.moveTo(32, -32); ctx.lineTo(-32, 32); ctx.stroke(); ctx.restore(); }
function check(x, y, s) { if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.arc(0, 0, 70, 0, TAU); ctx.fillStyle = '#5EAE5A'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-30, 2); ctx.lineTo(-6, 26); ctx.lineTo(34, -24); ctx.stroke(); ctx.restore(); }
function heart(x, y, s, c = '#FF6B8A') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-70, -20, -40, -75, 0, -40); ctx.bezierCurveTo(40, -75, 70, -20, 0, 30); ctx.fillStyle = c; ctx.shadowColor = 'rgba(255,120,150,0.8)'; ctx.shadowBlur = 20; ctx.fill(); ctx.restore(); }
function dove(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const f = Math.sin(t * 12) * 0.5; ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.ellipse(0, 0, 46, 22, -0.1, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(38, -14, 16, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-10, -6); ctx.quadraticCurveTo(-20, -70 * (0.6 + f), -60, -60 * (0.6 + f)); ctx.quadraticCurveTo(-30, -20, -10, -6); ctx.fill(); ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-78, -14); ctx.lineTo(-74, 14); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#F2B23E'; ctx.beginPath(); ctx.moveTo(52, -16); ctx.lineTo(66, -12); ctx.lineTo(52, -8); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(42, -18, 3.5, 0, TAU); ctx.fill(); ctx.restore(); }
function smoke(x, y, r, t, a = 1, seed = 0) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); for (let i = 0; i <= 24; i++) { const an = i / 24 * TAU, rr = r * (1 + 0.18 * Math.sin(an * 5 + t * 6 + seed) + 0.08 * Math.sin(an * 9 - t * 4)); i ? ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.9) : ctx.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.9); } ctx.closePath(); ctx.fillStyle = '#16121C'; ctx.shadowColor = 'rgba(160,30,50,0.6)'; ctx.shadowBlur = r * 0.5; ctx.fill(); ctx.shadowBlur = 0; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sx * r * 0.42 - r * 0.16, y - r * 0.18 - (sx > 0 ? 0 : r * 0.08)); ctx.lineTo(x + sx * r * 0.42 + r * 0.16, y - r * 0.18 - (sx > 0 ? r * 0.08 : 0)); ctx.lineTo(x + sx * r * 0.36, y - r * 0.02); ctx.closePath(); ctx.fillStyle = '#FF4A4A'; ctx.fill(); } ctx.restore(); }
function pressure(cx, cy, w, k, t, color = '#FF6A5A') { if (k <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.5); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const x = cx + s * (w + 120 - k * 70 + Math.sin(t * 20) * 4), y = cy - 160 + i * 160; ctx.save(); ctx.translate(x, y); ctx.scale(-s, 1); ctx.beginPath(); ctx.moveTo(-70, -22); ctx.lineTo(10, -22); ctx.lineTo(10, -48); ctx.lineTo(70, 0); ctx.lineTo(10, 48); ctx.lineTo(10, 22); ctx.lineTo(-70, 22); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.restore(); } ctx.restore(); }
/** x-ray person: a translucent figure with a glowing core at the chest */
function xray(x, y, h, t, core, coreA = 1, o = {}) {
  ctx.save(); ctx.globalAlpha = 0.85; ctx.filter = 'drop-shadow(0 0 10px rgba(110,230,255,0.9))'; ctx.save(); ctx.globalAlpha = 0.35; hero({ x, y, h, t, shadow: false, scarf: false, ...o }); ctx.restore(); ctx.filter = 'none'; ctx.restore();
  const cy = y - h * 0.62; glow(x, cy, h * 0.28, core === 'smoke' ? '#5A2030' : core === 'dove' ? '#FFFFFF' : '#FFC0CC', 0.6 * coreA);
  if (core === 'heart') heart(x, cy, h / 520 * (0.9 + 0.08 * Math.sin(t * 6)) * coreA);
  if (core === 'dove') dove(x, cy, h / 700 * coreA, t);
  if (core === 'smoke') smoke(x, cy, h * 0.1 * coreA, t, coreA);
}
function jagged(x, y, w, h, s, text) { if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); const n = 18; for (let i = 0; i <= n; i++) { const a = i / n * TAU, rr = i % 2 ? 0.82 : 1.08; ctx.lineTo(Math.cos(a) * w * rr, Math.sin(a) * h * rr); } ctx.closePath(); ctx.fillStyle = '#E2453C'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#1A1218'; ctx.stroke(); if (text) { ctx.font = '900 120px Cairo'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(text, 0, 8); } ctx.restore(); }

export function buildShots() {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  const cut = (i) => L(i) - 0.06, rel = (i, k, st) => Wt(i, k) - st;
  const SC = () => window.OP.script;
  const stageGrade = (o = {}) => () => ({ sat: 1.05, con: 1.06, vig: 0.65, bars: 0.45, bloom: 0.35, tint: '#FFA040', tintA: 0.1, ...o });

  add({ id: 'INTRO', at: 0, note: 'series intro', grade: () => ({ sat: 1.05, bloom: 0.45, vig: 0.6 }), draw(lt, d, t) { seriesIntro(lt, d, t, SC()); } });
  cue(0.05, 'thump', { gain: 0.7 }); cue(0.1, 'shimmer', { dur: 1.2, gain: 0.8 }); cue(0.6, 'chime', { n: 4, gain: 0.5 });

  // ═══ A · "Once I brought a lemon to one of my lectures" — he strides onto the stage and lifts the lemon into the spotlight
  { const st = T.lead - 0.15, up = rel(0, 4, st);
    add({ id: 'A', at: st, tin: { type: 'zoom', d: 0.4 }, note: 'stage + audience; Dr. Fiky walks in, raises a glowing lemon', grade: stageGrade(),
      draw(lt, d, t) {
        ctx.save(); cam(540, lerp(1050, 1000, eio(seg(lt, 0, d))), lerp(1.0, 1.08, eio(seg(lt, 0, d))));
        stage(t, eo(seg(lt, 0, 0.6)));
        const x = lerp(160, 540, eio(seg(lt, 0, 1.1))), walking = lt < 1.1, raise = eob(seg(lt, up - 0.2, up + 0.25));
        const r = DOC({ x, y: GR, h: 620, t, walk: walking ? t * 7 : null, mood: 'grin', look: [lt > 1.2 ? 0 : 1, 0.1], blink: blink(t), glow: 'rgba(255,220,160,0.7)', pose: { arms: { L: [-10, 20], R: [lerp(20, 160, raise), lerp(20, 0, raise)] } } });
        lemon(r.hand[0] + 10, r.hand[1] - 40, 0.75 + 0.1 * raise); if (raise > 0) glow(r.hand[0], r.hand[1] - 40, 220, '#FFE27A', 0.6 * raise);
        audience(t, 1660, 0.2);
        ctx.restore();
      } });
    cue(st + up, 'chime', { n: 2, gain: 0.6 }); }

  // ═══ B · "I asked: if we squeeze this lemon, what will it give us?" — lemon over the glass; question marks rise from the audience
  { const st = cut(2), sq = rel(2, 3, st), q = rel(3, 1, st);
    add({ id: 'B', at: st, tin: { type: 'cut' }, note: 'mid shot: lemon held over a glass; ؟ marks pop over the audience', grade: stageGrade(),
      draw(lt, d, t) {
        ctx.save(); cam(560, 1020, 1.25);
        stage(t, 1);
        ctx.fillStyle = '#4A2E22'; ctx.fillRect(640, 1150, 260, 30); ctx.fillRect(760, 1180, 24, 260);
        glass(770, 1150, 0.8, 0);
        const r = DOC({ x: 470, y: GR, h: 620, t, mood: lt > q - 0.3 ? 'calm' : 'grin', look: lt > q - 0.3 ? [-0.3, 0.6] : [1, 0], blink: blink(t), glow: 'rgba(255,220,160,0.6)', pose: { arms: { L: [-10, 20], R: [95, -15] } } });
        const s = Math.max(0, Math.sin(clamp((lt - sq) / 0.5) * Math.PI)) * 0.5;
        lemon(r.hand[0] + 40, r.hand[1] - 20, 0.6, s);
        audience(t, 1660, 0.4, seg(lt, q - 0.1, q + 0.7));
        ctx.restore();
      } });
    cue(st + rel(3, 1, st), 'pop', { gain: 0.6 }); }

  // ═══ C · "Lemon juice… right?" — the squeeze; yellow juice fills the glass; a green check
  { const st = cut(4), ok = rel(5, 0, st);
    add({ id: 'C', at: st, tin: { type: 'whip', d: 0.26, dir: 1 }, note: 'close: lemon squashed, yellow juice pours into the glass, check on مظبوط', grade: stageGrade({ bloom: 0.45 }),
      draw(lt, d, t) {
        ctx.save(); cam(560, 900, 1.0);
        grad([[0, '#3A2420'], [1, '#6A3A28']], 0, H); glow(560, 700, 800, '#FFC870', 0.35);
        const sq = 0.4 + 0.4 * Math.sin(t * 7) ** 2;
        lemon(560, 560, 2.0, sq, 0.1);
        drops(560, 700, 1150, t, 1);
        glass(560, 1350, 1.4, 0.15 + 0.75 * eio(seg(lt, 0, d + 0.4)));
        for (const s of [-1, 1]) { ctx.strokeStyle = '#3A3D44'; ctx.lineWidth = 60; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(560 + s * 520, 900); ctx.lineTo(560 + s * (190 - sq * 30), 600); ctx.stroke(); ctx.beginPath(); ctx.arc(560 + s * (180 - sq * 30), 585, 56, 0, TAU); ctx.fillStyle = INK; ctx.fill(); }
        check(860, 380, eob(seg(lt, ok - 0.1, ok + 0.2)));
        ctx.restore();
      } });
    cue(st, 'crack', { gain: 0.4 }); cue(st + ok, 'pop', { gain: 0.8 }); }

  // ═══ D · "Could it give us apple juice?" — a thought bubble with an apple; red ✕; still lemon drips
  { const st = cut(6), no = rel(6, 3, st);
    add({ id: 'D', at: st, tin: { type: 'cut' }, note: 'apple in a bubble, red X on تفاح; glass still yellow', grade: stageGrade(),
      draw(lt, d, t) {
        ctx.save(); cam(540, 960, 1.0);
        stage(t, 0.8);
        glass(330, 1400, 1.2, 0.8);
        DOC({ x: 760, y: GR + 80, h: 760, dir: -1, t, mood: 'grin', look: [-0.6, -0.6], blink: blink(t), glow: 'rgba(255,220,160,0.6)', pose: { arms: { L: [-10, 20], R: [120, 30] } } });
        const b = eob(seg(lt, 0.1, 0.4)); bubble(400, 620, 190 * b, b, () => apple(400, 620, 1.3 * b), 600, 900);
        crossX(520, 520, eob(seg(lt, no, no + 0.25)));
        ctx.restore();
      } });
    cue(st + 0.1, 'pop', { gain: 0.5 }); cue(st + no, 'boing', { gain: 0.6 }); }

  // ═══ E · "Watermelon juice?" — watermelon in the bubble; another ✕
  { const st = cut(7), no = rel(7, 3, st);
    add({ id: 'E', at: st, tin: { type: 'whip', d: 0.24, dir: -1 }, note: 'watermelon bubble, red X', grade: stageGrade(),
      draw(lt, d, t) {
        ctx.save(); cam(540, 960, 1.0);
        stage(t, 0.8);
        glass(750, 1400, 1.2, 0.8);
        DOC({ x: 320, y: GR + 80, h: 760, t, mood: 'grin', look: [0.6, -0.6], blink: blink(t), glow: 'rgba(255,220,160,0.6)', pose: { arms: { L: [-10, 20], R: [120, 30] } } });
        const b = eob(seg(lt, 0.1, 0.4)); bubble(660, 620, 200 * b, b, () => melon(660, 640, 1.3 * b), 480, 900);
        crossX(780, 520, eob(seg(lt, no, no + 0.25)));
        ctx.restore();
      } });
    cue(st + 0.1, 'pop', { gain: 0.5 }); cue(st + no, 'boing', { gain: 0.6 }); }

  // ═══ F · "Come on, for my sake!" — he squeezes with everything he's got… still lemon
  { const st = cut(8);
    add({ id: 'F', at: st, tin: { type: 'cut' }, note: 'comic strain: both hands squeeze, shaking, sweat; one more yellow drop', grade: stageGrade({ shake: 7 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 900, 1.15);
        stage(t, 1);
        const r = DOC({ x: 540, y: GR + 240, h: 980, t, mood: 'hurt', look: [0, 0.6], blink: 0, lean: Math.sin(t * 30) * 2, glow: 'rgba(255,220,160,0.6)', pose: { arms: { L: [58, 34], R: [58, 34] } } });
        lemon(r.hand[0] - 70, r.hand[1] + 20, 1.0, 0.7 + 0.1 * Math.sin(t * 40));
        for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(255,240,200,0.8)'; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * (180 + i * 30), r.hand[1] - 60 + i * 40); ctx.lineTo(540 + s * (230 + i * 30), r.hand[1] - 80 + i * 40); ctx.stroke(); } }
        ctx.fillStyle = '#BFE3FF'; for (const [sx, sy] of [[-1, 0], [1, 0.5]]) { const k = (t * 1.5 + sy) % 1; ctx.beginPath(); ctx.arc(540 + sx * 150, 420 + k * 120, 16, 0, TAU); ctx.fill(); }
        drops(540, r.hand[1] + 60, r.hand[1] + 520, t * 0.6, 1);
        ctx.restore();
      } });
    cue(st, 'growl', { gain: 0.4 }); }

  // ═══ G · "Impossible." — a man with glasses in the audience shakes his head
  { const st = cut(9);
    add({ id: 'G', at: st, tin: { type: 'whip', d: 0.24, dir: 1 }, note: 'audience man with glasses shakes his head: مش ممكن', grade: stageGrade({ bars: 0.5 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1000, 1.0);
        grad([[0, '#1A1218'], [1, '#3A2428']], 0, H); for (let i = 0; i < 6; i++) { ctx.fillStyle = '#120C10'; ctx.beginPath(); ctx.arc(i * 220 - 40, 1500, 110, 0, TAU); ctx.fill(); }
        ctx.save(); ctx.translate(540, 1000); ctx.rotate(Math.sin(t * 16) * 0.12); ctx.translate(-540, -1000);
        hero({ x: 540, y: 1700, h: 900, t, mood: 'calm', glasses: true, scarf: false, outfit: { jacket: '#2E3036', shirt: '#E6E8EE', tie: '#2A2A30' }, look: [0, 0], blink: blink(t), shadow: false, glow: 'rgba(255,220,160,0.5)' });
        ctx.restore();
        ctx.restore();
      } });
    cue(st + 0.1, 'tock', { gain: 0.6 }); }

  // ═══ H · "It will give you lemon!" — the hero product shot: lemon + glass of juice, rays
  { const st = cut(10), hit = rel(10, 2, st);
    add({ id: 'H', at: st, tin: { type: 'flash', d: 0.25, color: '#FFF4C8' }, note: 'glowing lemon + glass, rays; ليمون!', grade: () => ({ sat: 1.15, con: 1.05, vig: 0.55, bloom: 0.55, tint: '#FFC040', tintA: 0.12 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1000, lerp(1.1, 1.0, eo(seg(lt, 0, d))));
        grad([[0, '#4A2E1E'], [1, '#8A5A2A']], 0, H); rays(540, 1050, t, 1.4, 16, 1600, Math.PI, '#FFE7A0', -Math.PI / 2);
        glow(540, 1050, 600, '#FFE07A', 0.5); lemon(400, 1180, 1.5, 0, -0.3); glass(700, 1400, 1.5, 0.92);
        motes(t, 1, 20, '#FFE2A0', [100, 700, 880, 900], 40);
        ctx.restore();
      } });
    cue(st + hit, 'reveal', { dur: 1.0, gain: 0.7 }); }

  // ═══ I · "Which means: if we squeeze YOU… only what's inside you comes out" — he points at us; then an x-ray of you
  { const st = cut(11), you = rel(12, 2, st), inside = rel(13, 3, st);
    add({ id: 'I', at: st, tin: { type: 'zoom', d: 0.35 }, note: 'Dr. Fiky points straight at the viewer; reveal x-ray of a person with a glowing core', grade: (lt) => lt < inside - 0.3 ? stageGrade({ bars: 0.6 })() : ({ sat: 1.0, con: 1.08, vig: 0.7, bars: 0.6, bloom: 0.5, tint: '#2A8AA8', tintA: 0.2 }),
      draw(lt, d, t) {
        if (lt < inside - 0.3) {
          ctx.save(); cam(540, 900, lerp(1.0, 1.15, eio(seg(lt, 0, inside))));
          stage(t, 1);
          DOC({ x: 540, y: 2150, h: 1500, t, mood: lt > you - 0.2 ? 'determined' : 'calm', look: [0, 0], blink: 0, shadow: false, glow: 'rgba(255,220,160,0.6)', pose: { arms: { L: [-10, 20], R: [lerp(30, 70, eo(seg(lt, you - 0.4, you))), lerp(20, -100, eo(seg(lt, you - 0.4, you)))] } } });
          ctx.restore();
        } else {
          const k = seg(lt, inside - 0.3, inside + 0.3);
          ctx.save(); cam(540, 1000, lerp(1.2, 1.0, eio(k)));
          grad([[0, '#06121C'], [1, '#0E2A38']], 0, H); ctx.strokeStyle = 'rgba(110,230,255,0.08)'; ctx.lineWidth = 2; for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
          xray(540, 1500, 1000, t, 'question', 1, { mood: 'calm', look: [0, 0] });
          glow(540, 880, 300, '#FFE7A0', 0.8 * k); ctx.save(); ctx.font = '900 220px Cairo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = k; ctx.fillStyle = GOLDC; ctx.shadowColor = 'rgba(255,200,90,0.9)'; ctx.shadowBlur = 40; ctx.fillText('؟', 540, 880); ctx.restore();
          ctx.restore();
        }
      } });
    cue(st + you - 0.2, 'whoosh', { gain: 0.6 }); cue(st + inside - 0.3, 'zip', {}); }

  // ═══ J · "Squeeze any human being… only what's inside comes out" — three x-ray people; pressure from both sides; cores flare
  { const st = cut(14), sq = rel(14, 1, st), out = rel(15, 3, st);
    add({ id: 'J', at: st, tin: { type: 'cut' }, note: 'three x-ray people (heart / dove / smoke cores); red pressure arrows squeeze; cores burst', grade: () => ({ sat: 1.0, con: 1.08, vig: 0.7, bars: 0.55, bloom: 0.5, tint: '#2A8AA8', tintA: 0.18 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1050, 1.0);
        grad([[0, '#06121C'], [1, '#0E2A38']], 0, H);
        const k = eo(seg(lt, sq - 0.2, sq + 0.4)), burst = eob(seg(lt, out - 0.1, out + 0.35));
        [[230, 'heart'], [540, 'dove'], [850, 'smoke']].forEach(([x, core], i) => { ctx.save(); ctx.translate(x, 1450); ctx.scale(1 - k * 0.12, 1 + k * 0.04); ctx.translate(-x, -1450); xray(x, 1450, 640, t + i, core, 0.7 + burst * 0.6, { mood: i === 2 ? 'angry' : 'calm', look: [0, 0] }); ctx.restore(); if (burst > 0) glow(x, 1050, 260 * burst, core === 'smoke' ? '#802030' : '#FFE7C0', 0.5 * burst); });
        pressure(540, 1100, 470, k, t);
        ctx.restore();
      } });
    cue(st + sq, 'thump', { gain: 0.8 }); cue(st + out, 'reveal', { dur: 0.8, gain: 0.5 }); }

  // ═══ K · "If there's love inside… love comes out!" — the red-scarf hero is squeezed; hearts burst out and land on everyone
  { const st = cut(16), out = rel(17, 1, st);
    add({ id: 'K', at: st, tin: { type: 'whip', d: 0.26, dir: 1 }, note: 'hero squeezed by pressure; hearts burst out to the people around, who smile', grade: () => ({ sat: 1.1, vig: 0.55, bars: 0.4, bloom: 0.55, tint: '#FF7090', tintA: 0.14 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1050, 1.0);
        grad([[0, '#4A2440'], [1, '#C86A70']], 0, H); glow(540, 1100, 700, '#FFB0C0', 0.35 + 0.3 * seg(lt, out, out + 0.5));
        const k = eo(seg(lt, 0.1, 0.6)) * (1 - seg(lt, out + 0.2, out + 0.6));
        pressure(540, 1150, 220, k, t, '#FF8AA0');
        const people = [[160, 1500], [920, 1500], [260, 1700], [820, 1720]];
        people.forEach(([x, y], i) => hero({ x, y, h: 380, t: t + i, scarf: false, dir: x < 540 ? 1 : -1, mood: lt > out + 0.4 + i * 0.1 ? 'happy' : 'calm', look: [x < 540 ? 1 : -1, -0.3], shadow: false }));
        hero({ x: 540, y: 1520, h: 560, t, mood: lt > out ? 'bliss' : 'calm', look: [0, 0], blink: blink(t), wind: 0.6, glow: 'rgba(255,190,210,0.95)', pose: lt > out ? { arms: { L: [-130, 10], R: [130, -10] } } : { arms: { L: [20, 60], R: [20, 60] } } });
        if (lt > out - 0.05) for (let i = 0; i < 14; i++) { const p = seg(lt, out + i * 0.03, out + 0.9 + i * 0.03), a = rnd(i) * TAU, tx = people[i % 4][0], ty = people[i % 4][1] - 420, sx = 540, sy = 1150; const x = lerp(sx, tx, eo(p)) + Math.sin(a) * 120 * Math.sin(p * Math.PI), y = lerp(sy, ty, eo(p)) - Math.sin(p * Math.PI) * 300; if (p > 0) heart(x, y, (0.5 + rnd(i + 3) * 0.4) * (p < 1 ? 1 : 0.8)); }
        ctx.restore();
      } });
    cue(st + out, 'shimmer', { dur: 1.2 }); cue(st + out, 'reveal', { dur: 1.0, gain: 0.6 }); }

  // ═══ L · "If there's forgiveness inside… forgiveness comes out!" — doves fly from him to the man who wronged him
  { const st = cut(18), out = rel(19, 1, st);
    add({ id: 'L', at: st, tin: { type: 'fade', d: 0.3 }, note: 'doves fly out of the hero to a grumpy man, who softens', grade: () => ({ sat: 1.05, vig: 0.55, bars: 0.4, bloom: 0.55, tint: '#A0C8FF', tintA: 0.12 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1050, 1.0);
        grad([[0, '#3A4E80'], [1, '#E8C8B0']], 0, H); glow(300, 1100, 600, '#FFFFFF', 0.3);
        hero({ x: 300, y: 1520, h: 560, t, mood: 'smile', look: [1, 0], blink: blink(t), wind: 0.5, glow: 'rgba(255,255,255,0.9)', pose: { arms: { L: [-10, 20], R: [80, -20] } } });
        hero({ x: 800, y: 1520, h: 560, t, dir: -1, mood: lt > out + 0.5 ? 'smile' : 'angry', look: [-1, 0], blink: blink(t, 1), scarf: false, ...MEAN, glow: lt > out + 0.5 ? 'rgba(255,255,255,0.8)' : null });
        for (let i = 0; i < 5; i++) { const p = seg(lt, out - 0.4 + i * 0.12, out + 0.7 + i * 0.12); if (p > 0 && p < 1) dove(lerp(380, 760, eo(p)), lerp(1150, 1000, p) - Math.sin(p * Math.PI) * (180 + i * 40), 1.1, t + i); }
        ctx.restore();
      } });
    cue(st + out - 0.4, 'flap', { dur: 1.2, gain: 0.7 }); cue(st + out, 'chime', { n: 4, gain: 0.5 }); }

  // ═══ M · "When someone doesn't know what he's doing and tramples on someone's dignity…" — a man yells down at a smaller person
  { const st = cut(20), hit = rel(21, 1, st);
    add({ id: 'M', at: st, tin: { type: 'dip', d: 0.3 }, note: 'dark red: mean man shouts, victim shrinks; dignity crown cracks', grade: () => ({ sat: 0.8, con: 1.12, vig: 0.8, bars: 0.6, bloom: 0.25, tint: '#C02020', tintA: 0.2, mode: 'overlay' }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1050, lerp(1.0, 1.08, eio(seg(lt, 0, d))));
        grad([[0, '#1A0C10'], [1, '#4A1C1C']], 0, H);
        const shrink = eo(seg(lt, hit - 0.2, hit + 0.5));
        hero({ x: 330, y: 1560, h: 760, t, mood: 'angry', look: [1, 0.3], lean: 10, scarf: false, ...MEAN, pose: { arms: { L: [-10, 30], R: [95, -10] } } });
        for (let i = 0; i < 4; i++) { const k = (t * 2 + i / 4) % 1; ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#FF5A4A'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(470, 940, 60 + k * 220, -0.5, 0.5); ctx.stroke(); ctx.restore(); }
        hero({ x: 790, y: 1560, h: lerp(560, 420, shrink), t, dir: -1, mood: 'scared', look: [-1, -0.3], lean: -8 * shrink, scarf: false, glasses: true, pose: POSE.flinch });
        // dignity: a small gold crown above the victim that cracks
        const cy = 1560 - lerp(560, 420, shrink) - 60; ctx.save(); ctx.translate(790, cy - shrink * 40); ctx.rotate(shrink * 0.6); ctx.globalAlpha = 1 - shrink * 0.6; ctx.fillStyle = GOLDC; ctx.beginPath(); ctx.moveTo(-50, 20); ctx.lineTo(-50, -20); ctx.lineTo(-25, 0); ctx.lineTo(0, -30); ctx.lineTo(25, 0); ctx.lineTo(50, -20); ctx.lineTo(50, 20); ctx.closePath(); ctx.fill(); if (shrink > 0.3) { ctx.strokeStyle = '#1A0C10'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-5, -25); ctx.lineTo(8, 0); ctx.lineTo(-6, 18); ctx.stroke(); } ctx.restore();
        ctx.restore();
      } });
    cue(st, 'drone', { dur: 2.6, gain: 0.6 }); cue(st + hit, 'crack', { gain: 0.6 }); }

  // ═══ N · "he's showing what's inside him" — x-ray of the yeller: dark smoke inside, pouring out of his mouth
  { const st = cut(22);
    add({ id: 'N', at: st, tin: { type: 'zoom', d: 0.3 }, note: 'x-ray: dark smoke creature inside the mean man, smoke spills from his mouth', grade: () => ({ sat: 0.85, con: 1.1, vig: 0.8, bars: 0.6, bloom: 0.35, tint: '#2A8AA8', tintA: 0.15 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1000, lerp(1.0, 1.1, eio(seg(lt, 0, d))));
        grad([[0, '#06121C'], [1, '#1A1A28']], 0, H);
        xray(540, 1600, 1150, t, 'smoke', 1.3, { mood: 'angry', look: [0, 0], ...MEAN });
        for (let i = 0; i < 7; i++) { const k = (lt * 0.9 + i / 7) % 1; smoke(560 + k * 380 + Math.sin(i) * 40, 470 - k * 260, 30 + k * 40, t, 0.8 * (1 - k), i); }
        ctx.restore();
      } });
    cue(st, 'zip', { gain: 0.6 }); }

  // ═══ O · "When someone tells a person: 'You're stupid!'" — he points and shouts; the word slams in
  { const st = cut(23), shout = rel(24, 1, st);
    add({ id: 'O', at: st, tin: { type: 'cut' }, note: 'mean man points at a person; جاهل bubble; impact غبي!', grade: (lt) => ({ sat: 0.9, con: 1.15, vig: 0.75, bars: 0.55, bloom: 0.25, tint: '#C02020', tintA: lt > shout ? 0.22 : 0.1, mode: 'overlay', shake: lt > shout ? 10 * (1 - seg(lt, shout, shout + 0.4)) : 0 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1050, 1.0);
        grad([[0, '#2A1418'], [1, '#5A2A22']], 0, H);
        hero({ x: 330, y: 1580, h: 760, t, mood: 'angry', look: [1, 0], lean: lt > shout ? 14 : 4, scarf: false, ...MEAN, pose: { arms: { L: [-10, 30], R: [92, 0] } } });
        hero({ x: 800, y: 1580, h: 520, t, dir: -1, mood: 'sad', look: [-1, 0], scarf: false, glasses: true });
        ctx.restore();
      } });
    cue(L(24), 'boom', { gain: 0.45 }); }

  // ═══ P · "…he's showing the stupidity inside himself — the stupidity is drawn on HIS face!" — the word boomerangs back and stamps his own face
  { const st = cut(25), stamp = rel(26, 3, st);
    add({ id: 'P', at: st, tin: { type: 'cut' }, note: 'the word flies back and stamps itself on the insulter’s own face; he goes cross-eyed', grade: (lt) => ({ sat: 1.05, con: 1.08, vig: 0.6, bars: 0.45, bloom: 0.35, shake: 9 * Math.max(0, 1 - Math.abs(lt - stamp) / 0.25) }),
      draw(lt, d, t) {
        const zoom = eio(seg(lt, stamp - 0.1, stamp + 0.5));
        ctx.save(); cam(lerp(540, 360, zoom), lerp(1050, 760, zoom), lerp(1.0, 1.9, zoom));
        grad([[0, '#3A2A30'], [1, '#8A5A44']], 0, H);
        const r = hero({ x: 360, y: 1580, h: 760, t, mood: lt > stamp ? 'scared' : 'angry', look: lt > stamp ? [0.6, -0.8] : [1, 0], scarf: false, ...MEAN, pose: lt > stamp ? POSE.flinch : { arms: { L: [-10, 30], R: [92, 0] } } });
        hero({ x: 820, y: 1580, h: 520, t, dir: -1, mood: lt > stamp ? 'grin' : 'calm', look: [-1, 0], scarf: false, glasses: true, blink: blink(t) });
        // the word: leaves his mouth, bounces off, comes back
        const [hx, hy, hr] = r.head, f = seg(lt, 0, stamp);
        if (lt < stamp) { const bx = lerp(hx + 120, 760, Math.sin(f * Math.PI)), by = hy - Math.sin(f * Math.PI) * 260; jagged(bx, by, 150, 95, 0.85, 'غبي'); }
        else { const s = eob(seg(lt, stamp, stamp + 0.2)); ctx.save(); ctx.translate(hx + hr * 0.12, hy - hr * 0.05); ctx.rotate(-0.18); ctx.scale(s, s); ctx.font = `900 ${Math.round(hr * 0.72)}px Cairo`; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = hr * 0.08; ctx.strokeStyle = '#FFFFFF'; ctx.strokeText('غبي', 0, 0); ctx.fillStyle = '#E2453C'; ctx.fillText('غبي', 0, 0); ctx.restore();
          ctx.fillStyle = '#BFE3FF'; ctx.beginPath(); ctx.arc(hx - hr * 0.7, hy - hr * 0.5 + seg(lt, stamp, stamp + 1) * 40, hr * 0.12, 0, TAU); ctx.fill(); }
        ctx.restore();
      } });
    cue(st + 0.1, 'whoosh', { gain: 0.6 }); cue(st + stamp, 'thump', { gain: 0.9 }); cue(st + stamp, 'boing', { gain: 0.6 }); }

  // ═══ Q · ending — back on stage: he raises the glass of lemon juice; the audience nods; series end card
  { const st = L(26) + (T.lines[26].end - L(26)) + 0.05;
    add({ id: 'Q', at: st, tin: { type: 'fade', d: 0.4 }, note: 'stage: Dr. Fiky raises the glass, audience nods; end card', grade: stageGrade({ bloom: 0.45 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1050, lerp(1.1, 1.0, eio(seg(lt, 0, 2))));
        stage(t, 1);
        const r = DOC({ x: 540, y: GR, h: 640, t, mood: 'grin', look: [0, 0], blink: blink(t), glow: 'rgba(255,220,160,0.75)', pose: { arms: { L: [-30, 20], R: [150, 10] } } });
        glass(r.hand[0], r.hand[1] + 40, 0.55, 0.85); glow(r.hand[0], r.hand[1], 200, '#FFE07A', 0.5);
        audience(t, 1660, 1);
        ctx.restore();
        seriesEnd(lt - 0.35, t, SC(), 620);
      } });
    cue(st + 0.35, 'chime', { n: 5, gain: 0.7 }); cue(st + 0.4, 'shimmer', { dur: 1.5 }); }

  return { shots: S, cues: CUES };
}
