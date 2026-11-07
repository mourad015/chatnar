// ليه يا رب؟ : one journey, told as a path.
// Colour script: warm dawn (hope) → grey routine → red shock → cold confusion → blue night (despair)
// → dawn in the forest (hope returns) → gold sunrise and the reveal: the zigzags were the switchbacks up the mountain.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './lib.js';
import { L, Wt } from './timing.js';
import { hero, bigFace, POSE, INK } from './fig.js';
import * as Wd from './world.js';
const { mix, rgba, grad, glow, sun, ridge, haze, pine, roundTree, cloud, rays, rain, splashes, motes, flare, lightning, goldPath, polyLen, pointAt, smooth, bird } = Wd;

const cam = (cx, cy, z = 1, rot = 0, sx = W / 2, sy = H / 2) => { ctx.translate(sx, sy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy); };
const blink = (t, k = 0) => (((t + k) % 3.4) < 0.11 ? 1 : 0);
const GOLDC = '#F6C453';

// ───────────── the day landscape (opening + routine + shock) ─────────────
const GR = 1440;
function dayLand(camX, up, tod, grey, t) {
  const P = (a, b) => mix(mix(a, b, tod), '#8F98A6', grey * 0.85);
  const L = (f, fn) => { ctx.save(); ctx.translate(0, up * f); fn(); ctx.restore(); };
  L(0.12, () => grad([[0, P('#232650', '#6FAEDB')], [0.5, P('#B0647A', '#A8D2EA')], [0.8, P('#F29B6C', '#DDEEF3')], [1, P('#FFD9A0', '#F2F6F2')]], -1900, 1250));
  L(0.12, () => sun(lerp(760, 830, tod) - camX * 0.04, lerp(1080, 420, eio(tod)), 70, '#FFF6DE', P('#FFB066', '#FFE7A8'), 1 - grey * 0.8));
  L(0.2, () => { for (let i = 0; i < 4; i++) cloud(((i * 520 - camX * 0.1 - t * 12) % 2200 + 2200) % 2200 - 500, 260 + i * 140, 0.7 + rnd(i) * 0.4, P('#E7A3A0', '#FFFFFF'), P('#FFD2B0', '#FFFFFF'), 0.8); });
  if (grey > 0) L(0.2, () => { ctx.globalAlpha = grey * 0.7; for (let i = 0; i < 6; i++) cloud(((i * 380 - camX * 0.12) % 2200 + 2200) % 2200 - 500, 200 + (i % 3) * 120, 1.1, '#9AA2AE', '#B4BBC4'); ctx.globalAlpha = 1; });
  L(0.3, () => { ridge(1170, 320, 1, P('#8A6E96', '#A9C7D3'), camX * 0.2, 0.4); haze(1100, 160, P('#F2A07A', '#E8F3F5'), 0.45); });
  L(0.55, () => ridge(1290, 200, 3, P('#5F5584', '#8DB487'), camX * 0.45));
  L(0.8, () => {
    ridge(1370, 90, 5, P('#43476E', '#6F9E62'), camX * 0.75);
    for (let i = Math.floor(camX * 0.75 / 380) - 3; i < Math.floor(camX * 0.75 / 380) + 5; i++) { const x = i * 380 + rnd(i) * 160 - camX * 0.75 + 540; roundTree(x, 1345 + rnd(i + 3) * 20, 0.42 + rnd(i + 1) * 0.15, P('#2D2840', '#7A5A45'), P('#3D4468', '#5E9455'), P('#4C5684', '#78B067')); }
  });
  ctx.save(); ctx.translate(0, up); ctx.fillStyle = P('#384062', '#7FA86A'); ctx.fillRect(-500, 1390, W + 1000, 1200);
  ctx.fillStyle = P('#6D6A86', '#D8C49B'); ctx.fillRect(-500, 1418, W + 1000, 50); ctx.fillStyle = P('#585672', '#BFA982'); ctx.fillRect(-500, 1462, W + 1000, 8);
  for (let i = Math.floor(camX / 90) - 8; i < Math.floor(camX / 90) + 16; i++) { const x = i * 90 + rnd(i) * 60 - camX + 540, y = 1500 + rnd(i + 2) * 300; ctx.strokeStyle = P('#2E3552', '#5E8C52'); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y - 26); ctx.moveTo(x, y); ctx.lineTo(x + 9, y - 22); ctx.stroke(); }
  ctx.restore();
}
// the hero's walk in the opening shot: stands until 3.62, then walks right; slows into routine
const WALK0 = 3.62;
const heroX = (t) => (t < WALK0 ? 0 : 240 * (t - WALK0) - 60 * Math.max(0, t - 5.6) ** 2);

// ───────────── the mountain map (top-down), shared by the confusion shot and the reveal ─────────────
const SUM = [1200, 820];
const RAW = [[1200, 3150], [1200, 2600], [1640, 2420], [760, 2190], [1660, 1960], [800, 1720], [1580, 1480], [900, 1250], [1350, 1060], [1200, 860]];
const ROUTE = smooth(RAW, 2), RLEN = polyLen(ROUTE);
const lenToRaw = (k) => { const p = RAW[k]; let best = 0, bd = 1e9; for (let l = 0; l <= RLEN; l += 6) { const q = pointAt(ROUTE, l), d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = l; } } return best; };
const RK = RAW.map((_, k) => lenToRaw(k));
function mountainMap(t, dark) {
  const c = (a, b) => mix(a, b, dark);
  ctx.fillStyle = c('#7FA86A', '#2C4234'); ctx.fillRect(-3000, -3000, 9000, 9000);
  for (let i = 0; i < 160; i++) { const a = rnd(i) * TAU, r = 1300 + rnd(i + 3) * 1400, x = SUM[0] + Math.cos(a) * r, y = SUM[1] + 800 + Math.sin(a) * r * 1.1; ctx.beginPath(); ctx.arc(x, y, 40 + rnd(i + 5) * 30, 0, TAU); ctx.fillStyle = c('#5E9455', '#1F3327'); ctx.fill(); ctx.beginPath(); ctx.arc(x - 10, y - 10, 24, 0, TAU); ctx.fillStyle = c('#78B067', '#2A4433'); ctx.fill(); }
  const ring = ['#86AE72', '#93B57B', '#A5B985', '#B7B98E', '#C5B796', '#CFBFA3', '#D9CDB8', '#E6DED0', '#F2EEE6', '#FFFFFF'];
  for (let k = 0; k < 10; k++) {
    const R = 1350 - k * 128; ctx.beginPath();
    for (let a = 0; a <= TAU + 0.01; a += 0.05) { const rr = R * (1 + 0.07 * Math.sin(a * 3 + k * 0.7) + 0.04 * Math.sin(a * 7 + k)), x = SUM[0] + Math.cos(a) * rr * 0.92, y = SUM[1] + 900 * (1 - k / 10) + Math.sin(a) * rr * 1.05; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.fillStyle = c(ring[k], mix('#20352A', '#55606A', k / 9)); ctx.fill(); ctx.strokeStyle = c('rgba(90,70,50,0.25)', 'rgba(0,0,0,0.25)'); ctx.lineWidth = 5; ctx.stroke();
  }
  // the canyon the straight road ran into
  ctx.save(); ctx.translate(1200, 2480); ctx.rotate(-0.08); ctx.beginPath(); ctx.moveTo(-700, -40); for (let x = -700; x <= 700; x += 50) ctx.lineTo(x, -40 + Math.sin(x * 0.03) * 18); for (let x = 700; x >= -700; x -= 50) ctx.lineTo(x, 50 + Math.sin(x * 0.027 + 2) * 18); ctx.closePath(); ctx.fillStyle = c('#2A2230', '#0B0D14'); ctx.fill(); ctx.restore();
}
function mapHero(x, y, ang, s, t, mood = 'calm') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); for (let i = 1; i <= 6; i++) ctx.lineTo(-Math.cos(ang) * i * 14 + Math.sin(t * 9 - i) * 4, -Math.sin(ang) * i * 14 + Math.cos(t * 9 - i) * 4); ctx.strokeStyle = '#E0483E'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.stroke();
  ctx.filter = 'drop-shadow(0 0 8px rgba(255,226,170,0.95))'; bigFace(0, 0, 36, { mood, look: [Math.cos(ang), Math.sin(ang)] }); ctx.filter = 'none';
  ctx.restore();
}
function pinHere(x, y, sc, label) {
  if (sc <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-60, -70, -60, -140, 0, -140); ctx.bezierCurveTo(60, -140, 60, -70, 0, 0); ctx.fillStyle = '#E2574C'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -92, 20, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.font = '900 84px Cairo'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.strokeText(label, 0, -210); ctx.fillStyle = '#fff'; ctx.fillText(label, 0, -210);
  ctx.restore();
}
function star(x, y, r, sc, c = GOLDC) { if (sc <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.shadowColor = 'rgba(255,200,90,0.9)'; ctx.shadowBlur = r; ctx.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.restore(); }

// ───────────── night + forest + sunrise pieces ─────────────
function nightSky(t, lift = 0) {
  grad([[0, mix('#05081A', '#1A2550', lift)], [0.7, mix('#121A38', '#4A4E7E', lift)], [1, mix('#1E2A52', '#E89A7A', lift)]], -600, 1300);
}
function stormClouds(t, a, y = 300, speed = 20) { for (let i = 0; i < 7; i++) cloud(((i * 330 + t * speed * (1 + i % 3 * 0.3)) % 1900) - 400, y + (i % 3) * 110 + Math.sin(t + i) * 8, 1.3 + rnd(i) * 0.5, '#1B2240', '#273158', a); }
function sunriseLand(t, camX = 0, sunY = 980) {
  grad([[0, '#2F3E86'], [0.38, '#8D6AA8'], [0.62, '#F08E6E'], [0.82, '#FFC98E'], [1, '#FFE9B8']], -500, 1260);
  sun(560 - camX * 0.03, sunY, 95, '#FFF7E2', '#FFB86A');
  rays(560 - camX * 0.03, sunY, t, 0.7, 14, 2600, Math.PI, '#FFD9A0', -Math.PI / 2);
  ridge(1150, 260, 2, '#C98F9C', camX * 0.15, 0.5); haze(1080, 150, '#FFC7A0', 0.55);
  ridge(1250, 220, 4, '#9A6F97', camX * 0.3, 0.3); haze(1200, 120, '#F5A98A', 0.35);
  ridge(1360, 160, 6, '#6A5486', camX * 0.5);
}

export function buildShots() {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  const cut = (i) => L(i) - 0.06;

  // ═══ 1 · OPEN: crane down from a dawn sky onto him; a beam of light; golden stepping stones; he starts walking; routine greys it all
  add({ id: 'S01', at: 0, note: 'crane down at dawn → light beam → golden steps → walk → routine (desaturates, day counter)', grade: (lt) => ({ sat: lerp(1.08, 0.28, eio(seg(lt, 5.3, 6.2))), con: 1.06, bloom: lerp(0.4, 0.12, seg(lt, 3, 6)), vig: lerp(0.5, 0.6, seg(lt, 5.3, 6.2)), tint: '#3E5A88', tintA: 0.25 * seg(lt, 5.3, 6.2) }),
    draw(lt, d, t) {
      const up = (1 - eio(seg(lt, 0, 2.1))) * 1700, tod = eio(seg(lt, 0.8, 4.6)), grey = eio(seg(lt, 5.35, 6.2));
      const hx = heroX(lt), camX = lt < WALK0 ? 280 * eio(seg(lt, 2.15, 3.5)) : 280 + hx;
      dayLand(camX, up, tod, grey, t);
      ctx.save(); ctx.translate(0, up);
      // golden stepping stones appear ahead as "the steps to come" are named
      for (let i = 0; i < 6; i++) { const at = 2.25 + i * 0.2, p = eob(seg(lt, at, at + 0.3)); if (p <= 0) continue; const x = 150 + i * 150 - camX + 540; ctx.save(); ctx.translate(x, GR + 4); ctx.scale(p, p); ctx.shadowColor = `rgba(255,200,90,${0.9 * (1 - grey)})`; ctx.shadowBlur = 30; ctx.beginPath(); ctx.ellipse(0, 0, 52, 15, 0, 0, TAU); ctx.fillStyle = mix(GOLDC, '#9C9C9C', grey); ctx.fill(); ctx.restore(); }
      const sx = 540 + hx - camX, walking = lt >= WALK0;
      // the beam: light from above lands on him
      const beam = seg(lt, 0.5, 1.4) * (1 - seg(lt, 2.6, 3.6));
      if (beam > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, -700, 0, GR); g.addColorStop(0, rgba('#FFE7A8', 0)); g.addColorStop(1, rgba('#FFE7A8', 0.55 * beam)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - 70, -700); ctx.lineTo(sx + 70, -700); ctx.lineTo(sx + 190, GR); ctx.lineTo(sx - 190, GR); ctx.closePath(); ctx.fill(); ctx.restore(); glow(sx, GR - 200, 360, '#FFD98A', 0.45 * beam); }
      const mood = lt < 0.9 ? 'calm' : lt < 2.2 ? 'awe' : lt < 5.35 ? 'smile' : 'bored';
      hero({ x: sx, y: GR, h: 400, t, walk: walking ? hx / 400 * 5.2 : null, mood, look: lt < 0.9 ? [0.2, 0.3] : lt < 2.2 ? [0, -1] : [1, lt < 5.35 ? 0 : 0.5], blink: blink(t), glow: beam > 0.1 ? 'rgba(255,220,150,0.9)' : null, wind: 0.5 - grey * 0.4, headTilt: lt > 5.35 ? 12 : 0, pose: lt > 0.9 && lt < 2.2 ? POSE.openPalms : undefined });
      motes(t, beam * 1.2 + (1 - grey) * 0.3, 22, '#FFE2A0', [sx - 300, GR - 900, 600, 900], 40);
      ctx.restore();
      // routine: the days blur together
      if (lt > 5.35) { const k = seg(lt, 5.35, 6.25), day = Math.max(1, Math.round(Math.pow(k, 2) * 365)); const a = eo(seg(lt, 5.35, 5.6));
        ctx.save(); ctx.globalAlpha = a; ctx.font = '900 64px Cairo'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const txt = 'اليوم ' + day.toLocaleString('ar-EG');
        const w = ctx.measureText(txt).width + 80; ctx.fillStyle = 'rgba(20,22,30,0.75)'; ctx.beginPath(); ctx.roundRect(540 - w / 2, 330, w, 110, 55); ctx.fill(); ctx.fillStyle = '#E8E8E8'; ctx.fillText(txt, 540, 388); ctx.restore(); }
    } });
  cue(0.2, 'swell', { dur: 2.2, gain: 0.7 }); cue(0.55, 'shimmer', { dur: 1.6 }); for (let i = 0; i < 6; i++) cue(2.25 + i * 0.2, 'chime', { n: i, gain: 0.55 }); cue(5.35, 'tick', { dur: 0.95 });

  // ═══ 2 · SUDDENLY: flash; slow motion; the ground splits open in front of him and the golden path snaps
  { const st = cut(4), hx = heroX(st);
    add({ id: 'S02', at: st, tin: { type: 'flash', d: 0.3 }, note: 'slow-mo: ground cracks, path snaps, dutch angle, red grade', grade: (lt) => ({ sat: 0.75, con: 1.35, tint: '#FF2020', tintA: 0.32, mode: 'overlay', vig: 0.85, bars: eo(seg(lt, 0, 0.2)), bloom: 0.2, shake: 22 * (1 - seg(lt, 0, 0.45)) }),
      draw(lt, d, t) {
        const sl = lt * 0.22, camX = 280 + hx, sx = 540 + hx - camX;
        ctx.save(); cam(sx + 160, GR - 260, lerp(1.25, 1.45, eo(seg(lt, 0, d))), -0.12);
        dayLand(camX, 0, 1, 0.6, st + sl);
        const open = eo(seg(lt, 0.02, 0.5)), cx = sx + 330;
        // the chasm
        ctx.beginPath(); ctx.moveTo(cx - 10, 1390); for (let y = 1390; y <= 2400; y += 40) ctx.lineTo(cx - 20 - open * (130 + (y - 1390) * 0.06) + Math.sin(y * 0.05) * 22, y); for (let y = 2400; y >= 1390; y -= 40) ctx.lineTo(cx + 20 + open * (150 + (y - 1390) * 0.08) + Math.sin(y * 0.043 + 1) * 22, y); ctx.closePath();
        const ab = ctx.createLinearGradient(0, 1390, 0, 2200); ab.addColorStop(0, '#0B0A10'); ab.addColorStop(1, '#000'); ctx.fillStyle = ab; ctx.fill();
        // the golden path: snapped, burning ends
        goldPath([[sx - 700, GR + 6], [cx - 30 - open * 120, GR + 6]], 2000, 14, 30); goldPath([[cx + 30 + open * 140, GR + 6], [cx + 900, GR + 6]], 2000, 14, 30, '#F6C453', 0.6);
        for (let i = 0; i < 12; i++) { const k = clamp(lt / 0.75 + rnd(i) * 0.3), x = cx + (rnd(i + 3) - 0.5) * 300 * open, y = GR + 10 + k * k * 600 * (0.4 + rnd(i + 1)), r = 10 + rnd(i) * 22; ctx.save(); ctx.translate(x, y); ctx.rotate(k * 4 + i); ctx.beginPath(); ctx.moveTo(-r, -r * 0.6); ctx.lineTo(r * 0.8, -r); ctx.lineTo(r, r * 0.5); ctx.lineTo(-r * 0.4, r); ctx.closePath(); ctx.fillStyle = i % 2 ? '#3C3A40' : '#55525A'; ctx.fill(); ctx.restore(); }
        for (let i = 0; i < 8; i++) { const k = (lt * 1.2 + rnd(i + 9)) % 1; glow(cx + (rnd(i + 5) - 0.5) * 200 * open, GR - k * 220, 12, '#FFB45A', 0.9 * (1 - k)); }
        hero({ x: sx, y: GR, h: 400, t: st + sl, mood: 'scared', look: [1, 0.6], lean: -14, pose: { arms: { L: [-70, 50], R: [-55, 70] }, legs: { L: [32, 70], R: [-18, 8] } }, wind: 0.9 });
        ctx.restore();
      } });
    cue(st - 0.35, 'riser', { dur: 0.38, gain: 0.7 }); cue(st, 'boom'); cue(st + 0.02, 'crack'); cue(st, 'cut'); }

  // ═══ 3 · CHANGED: on the edge of the chasm; the old road is gone; a thin new trail appears off to the side
  { const st = cut(5);
    const trail = [[300, 1352], [235, 1310], [200, 1262], [250, 1222], [345, 1196], [300, 1168], [240, 1150]];
    add({ id: 'S03', at: st, tin: { type: 'dip', d: 0.24 }, note: 'cold overcast; he stares into the gap, turns to a thin new trail', grade: (lt) => ({ sat: 0.62, con: 1.08, tint: '#2C5C9E', tintA: 0.3, vig: 0.62, bars: 0.55 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1050, lerp(1.0, 1.1, eio(seg(lt, 0, d))), lerp(0.05, -0.01, eio(seg(lt, 0, d))));
        grad([[0, '#45536E'], [0.75, '#8C98AA'], [1, '#B9C1CC']], -600, 1250);
        cloud(250 + lt * 20, 420, 1.3, '#7A8599', '#8E99AB'); cloud(820 - lt * 15, 330, 1.1, '#6F7A8E', '#838EA2');
        ridge(1160, 260, 8, '#6D7A92', 0, 0.5); haze(1120, 120, '#AEB8C6', 0.5); ridge(1250, 150, 9, '#56637C');
        // near cliff (left) and far cliff (right) with the void between
        ctx.fillStyle = '#4A5A4C'; ctx.beginPath(); ctx.moveTo(-300, 1340); ctx.lineTo(470, 1350); ctx.lineTo(430, 1500); ctx.lineTo(480, 1700); ctx.lineTo(420, 2400); ctx.lineTo(-300, 2400); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3E4C42'; ctx.beginPath(); ctx.moveTo(1400, 1300); ctx.lineTo(880, 1310); ctx.lineTo(930, 1480); ctx.lineTo(860, 1700); ctx.lineTo(940, 2400); ctx.lineTo(1400, 2400); ctx.closePath(); ctx.fill();
        const vg = ctx.createLinearGradient(0, 1340, 0, 2000); vg.addColorStop(0, '#2A3140'); vg.addColorStop(1, '#07080C'); ctx.fillStyle = vg; ctx.beginPath(); ctx.moveTo(470, 1350); ctx.lineTo(880, 1310); ctx.lineTo(930, 1480); ctx.lineTo(860, 1700); ctx.lineTo(940, 2400); ctx.lineTo(420, 2400); ctx.lineTo(480, 1700); ctx.lineTo(430, 1500); ctx.closePath(); ctx.fill();
        haze(1520, 140, '#C9D2DE', 0.25);
        // broken golden road: ends at the edge, still smouldering; continues uselessly on the far side
        goldPath([[-200, 1352], [460, 1352]], 2000, 12, 18, '#E8B64A', 0.85); goldPath([[890, 1312], [1500, 1306]], 2000, 12, 12, '#E8B64A', 0.45);
        for (let i = 0; i < 6; i++) { const k = (t * 0.7 + rnd(i)) % 1; glow(460 + Math.sin(i + t) * 10, 1350 - k * 120, 16, '#FFB45A', 0.7 * (1 - k)); }
        // the new trail, drawn as it appears
        const tp = eio(seg(lt, 0.55, 1.5)); ctx.save(); ctx.setLineDash([18, 16]); goldPath(trail, polyLen(trail) * tp, 9, 14, '#F6D27A', 0.9); ctx.restore();
        const turned = lt > 1.0, walkT = seg(lt, 1.55, d + 0.3);
        hero({ x: 330 - walkT * 40, y: 1352, h: 330, t, dir: turned ? -1 : 1, walk: walkT > 0 ? walkT * 4 : null, mood: 'sad', look: turned ? [-0.6, -0.5] : [1, 0.9], headTilt: turned ? 0 : 22, blink: blink(t), wind: 0.25 });
        ctx.restore();
      } });
    cue(st, 'drone', { dur: 2.2, gain: 0.8 }); cue(st + 0.55, 'shimmer', { dur: 0.9, gain: 0.5 }); }

  // ═══ 4 · YOUR PATH! HERE! AND HERE…: top-down, the camera chases the route as it lurches side to side
  { const st = cut(6);
    const keys = [[0, RK[1] - 120], [0.5, RK[1] + 60], [1.0, RK[2]], [Wt(7, 2) - st + 0.05, RK[3]], [Wt(8, 0) - st + 0.25, RK[4]], [2.6, RK[4] + 160]];
    const prog = (lt) => { for (let i = 0; i < keys.length - 1; i++) if (lt <= keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], eio(seg(lt, keys[i][0], keys[i + 1][0]))); return keys[keys.length - 1][1]; };
    add({ id: 'S04', at: st, tin: { type: 'zoom', d: 0.4 }, note: 'MAP: route bends and zigzags, whip-tilts on HERE / HERE, foggy and dark', grade: (lt) => ({ sat: 0.8, con: 1.1, tint: '#2A4F8A', tintA: 0.22, vig: 0.75, bloom: 0.3 }),
      draw(lt, d, t) {
        const len = prog(lt), [ax, ay, ang] = pointAt(ROUTE, len);
        const w1 = Wt(7, 2) - st, w2 = Wt(8, 0) - st;
        const rot = 0.22 * eob(seg(lt, w1 - 0.1, w1 + 0.2)) - 0.44 * eob(seg(lt, w2 - 0.05, w2 + 0.25)) + 0.06 * Math.sin(t * 1.3);
        const lag = pointAt(ROUTE, Math.max(0, len - 160));
        ctx.save(); cam(lerp(lag[0], ax, 0.6), lerp(lag[1], ay, 0.6) - 120, 0.62 + 0.04 * Math.sin(t), rot);
        mountainMap(t, 0.85);
        ctx.save(); ctx.setLineDash([30, 30]); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(1200, 3300); ctx.lineTo(1200, 2440); ctx.stroke(); ctx.restore();
        goldPath(ROUTE, len, 26, 34);
        pinHere(RAW[3][0], RAW[3][1], eob(seg(lt, w1 - 0.05, w1 + 0.25)), 'هنا!'); pinHere(RAW[4][0], RAW[4][1], eob(seg(lt, w2 - 0.02, w2 + 0.28)), 'وهنا!');
        mapHero(ax, ay, ang, 1.15, t, lt > w1 ? 'sad' : 'calm');
        for (let i = 0; i < 5; i++) { ctx.save(); ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.ellipse(ax + ((i * 520 + t * 160) % 2600) - 1300, ay - 900 + i * 420, 360, 170, 0.3, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore(); }
        ctx.restore();
        // fog veil + speed streaks during the lurches
        const whip = Math.max(Math.sin(clamp((lt - w1 + 0.1) / 0.35) * Math.PI), Math.sin(clamp((lt - w2 + 0.05) / 0.35) * Math.PI));
        if (whip > 0) { ctx.save(); ctx.globalAlpha = 0.35 * whip; ctx.strokeStyle = '#DDE6F2'; ctx.lineWidth = 6; for (let i = 0; i < 26; i++) { const y = rnd(i) * H, x = rnd(i + 4) * W; ctx.beginPath(); ctx.moveTo(x - 160, y); ctx.lineTo(x + 160, y + 30); ctx.stroke(); } ctx.restore(); }
        glow(540, 960, 1100, '#AFC2D8', 0.12);
      } });
    cue(st, 'whoosh'); cue(Wt(7, 2) - 0.1, 'whip', { gain: 0.8 }); cue(Wt(7, 2), 'thump', { gain: 0.6 }); cue(Wt(8, 0) - 0.05, 'whip', { gain: 0.8 }); cue(Wt(8, 0) + 0.05, 'thump', { gain: 0.6 }); }

  // ═══ 5 · UPSET AND EXHAUSTED: night, rain, tiny and alone on a rock under a cold shaft of light
  { const st = cut(9);
    add({ id: 'S05', at: st, tin: { type: 'dip', d: 0.32 }, note: 'vast rainy night, small figure hugging knees, cold light shaft', grade: (lt) => ({ sat: 0.85, con: 1.1, tint: '#2A56A8', tintA: 0.3, vig: 0.8, bars: 0.7, bloom: 0.3 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1180, lerp(1.0, 1.16, eio(seg(lt, 0, d + 0.4))));
        nightSky(t); stormClouds(t, 1, 180, 12);
        ridge(1160, 240, 11, '#0F1630', 0, 0.4); haze(1140, 120, '#3A4E86', 0.35); ridge(1250, 120, 12, '#0B1124');
        ctx.fillStyle = '#0C1222'; ctx.fillRect(-500, 1260, W + 1000, 1200);
        // cold light shaft
        ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, -200, 0, 1330); g.addColorStop(0, rgba('#9FB8E8', 0)); g.addColorStop(1, rgba('#9FB8E8', 0.32)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(470, -200); ctx.lineTo(610, -200); ctx.lineTo(720, 1330); ctx.lineTo(360, 1330); ctx.closePath(); ctx.fill(); ctx.restore();
        glow(540, 1320, 260, '#7E9BD6', 0.35);
        // rock + puddle reflection
        ctx.beginPath(); ctx.ellipse(540, 1330, 230, 26, 0, 0, TAU); ctx.fillStyle = 'rgba(126,155,214,0.25)'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(430, 1330); ctx.lineTo(450, 1250); ctx.lineTo(520, 1215); ctx.lineTo(600, 1225); ctx.lineTo(650, 1270); ctx.lineTo(660, 1330); ctx.closePath(); ctx.fillStyle = '#2A3352'; ctx.fill();
        const h = 300; hero({ x: 545, y: 0, hipY: 1215 - 4, h, t, dir: 1, mood: 'sad', look: [0.2, 1], blink: 0, lean: 22, headTilt: 26, wind: 0, breathe: false, glow: 'rgba(150,180,240,0.9)', pose: { legs: { L: [128, 150], R: [122, 146] }, arms: { L: [62, 62], R: [56, 66] } } });
        splashes(t, 0.8, 1300, 1420, 18);
        ctx.restore();
        rain(t, 1, 150, -10);
      } });
    cue(st, 'rain', { dur: 5.4, gain: 0.9 }); cue(st + 0.5, 'heart'); cue(st + 1.35, 'heart', { gain: 0.8 }); }

  // ═══ 6 · WHY, LORD?: low angle; he stands and looks up into the storm; lightning on "يا رب"
  { const st = cut(10), lt0 = Wt(10, 2) - st;
    add({ id: 'S06', at: st, note: 'low angle, looking up into the storm, lightning', grade: (lt) => ({ sat: 0.8, con: 1.15, tint: '#2A56A8', tintA: 0.28, vig: 0.75, bars: 0.7, bri: 1 + 0.9 * Math.max(0, 1 - Math.abs(lt - lt0 - 0.05) / 0.12) }),
      draw(lt, d, t) {
        ctx.save(); cam(540, lerp(1050, 950, eio(seg(lt, 0, d))), 1.0);
        nightSky(t); stormClouds(t, 1, 60, 30); stormClouds(t + 7, 0.8, 360, 45);
        lightning(760, -100, 900, 7, Math.max(0, 1 - Math.abs(lt - lt0) / 0.1)); glow(760, 300, 900, '#BFD8FF', 0.6 * Math.max(0, 1 - Math.abs(lt - lt0) / 0.15));
        hero({ x: 540, y: 2150, h: 1250, t, mood: 'sad', look: [0.1, -1], headTilt: -14, blink: 0, wet: true, wind: 0.15, shadow: false, glow: 'rgba(150,180,240,0.8)', pose: POSE.openPalms });
        ctx.restore(); rain(t, 1.1, 170, -6, '#B8CBEA', 90);
      } });
    cue(Wt(10, 2) - 0.02, 'thunder'); }

  // ═══ 7 · WHY ME?: extreme close-up; the eyes fill, one tear rolls down
  { const st = cut(11);
    add({ id: 'S07', at: st, note: 'ECU: wet eyes, a tear rolls, rain on the lens', grade: (lt) => ({ sat: 0.8, con: 1.1, tint: '#2A56A8', tintA: 0.26, vig: 0.9, bars: 0.7, bloom: 0.25 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 960, lerp(1.0, 1.1, eo(seg(lt, 0, d + 0.2))));
        nightSky(t); glow(540, 900, 900, '#3E5AA0', 0.5);
        bigFace(560, 1010, 560, { mood: 'hurt', look: [-0.35, -0.75], wet: true, tear: clamp(lt / 0.55), glow: 'rgba(150,180,240,0.6)' });
        ctx.restore();
        for (let i = 0; i < 9; i++) { const x = rnd(i + 30) * W, y = rnd(i + 40) * H, r = 20 + rnd(i) * 40; ctx.save(); ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = '#CFE0FF'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
      } });
    cue(st, 'tear', { gain: 0.8 }); }

  // ═══ 8 · I'M A GOOD PERSON: hand on heart; memories of kindness rise around him and warm him
  { const st = cut(12);
    const memo = (k, x, y, r, sc, t) => {
      if (sc <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
      glow(0, 0, r * 1.9, '#FFC870', 0.35); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); const g = ctx.createRadialGradient(0, -r * 0.3, 10, 0, 0, r); g.addColorStop(0, '#FFF0CF'); g.addColorStop(1, '#F2B868'); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = GOLDC; ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 6, 0, TAU); ctx.clip(); ctx.fillStyle = '#E3A65A'; ctx.fillRect(-r, r * 0.45, r * 2, r);
      if (k === 0) { hero({ x: -40, y: r * 0.5, h: 170, t, mood: 'smile', look: [1, 0.5], lean: 20, pose: POSE.reach, scarf: true, shadow: false }); hero({ x: 50, y: r * 0.5, h: 120, dir: -1, t, mood: 'sad', look: [-1, -0.5], pose: { legs: { L: [90, 90], R: [85, 85] }, arms: { L: [-20, 10], R: [80, -10] } }, scarf: false, shadow: false, hipY: r * 0.5 - 20 }); }
      if (k === 1) { hero({ x: -45, y: r * 0.5, h: 170, t, mood: 'smile', look: [1, 0], pose: { arms: { L: [-10, 15], R: [70, 20] } }, shadow: false }); ctx.fillStyle = '#9A6A3E'; ctx.beginPath(); ctx.roundRect(10, -25, 46, 50, 8); ctx.fill(); hero({ x: 75, y: r * 0.5, h: 150, dir: -1, t, mood: 'happy', scarf: false, shadow: false, pose: { arms: { L: [-10, 15], R: [70, 30] } } }); }
      if (k === 2) { hero({ x: -25, y: r * 0.5, h: 170, t, mood: 'happy', lean: 8, pose: { arms: { L: [80, 60], R: [85, 70] } }, shadow: false }); hero({ x: 40, y: r * 0.5, h: 140, dir: -1, t, mood: 'happy', lean: 18, scarf: false, shadow: false, pose: { arms: { L: [80, 60], R: [40, -30] } } }); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(85, r * 0.5); ctx.lineTo(80, -10); ctx.stroke(); }
      ctx.restore(); ctx.restore();
    };
    add({ id: 'S08', at: st, note: 'hand on heart, three warm memory bubbles rise (helping, giving, hugging)', grade: (lt) => ({ sat: 0.9, con: 1.05, tint: '#3A4FA0', tintA: 0.18, vig: 0.7, bars: 0.5, bloom: 0.35 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, 1000, lerp(1.08, 1.0, eio(seg(lt, 0, d))));
        nightSky(t, 0.1); stormClouds(t, 0.6, 120, 10); ridge(1250, 160, 13, '#121A36');
        ctx.fillStyle = '#0E1428'; ctx.fillRect(-500, 1380, W + 1000, 1200);
        const ws = [Wt(12, 0), Wt(12, 1), Wt(12, 2)].map((w) => w - st);
        const warm = seg(lt, ws[0], ws[2] + 0.4);
        glow(540, 1000, 700, '#FFB860', 0.25 * warm);
        [[230, 560, 150], [540, 400, 150], [850, 560, 150]].forEach(([x, y, r], k) => memo(k, x, y + Math.sin(t * 1.6 + k) * 10 - eo(seg(lt, ws[k], ws[k] + 0.5)) * 30, r, eob(seg(lt, ws[k] - 0.05, ws[k] + 0.3)), t));
        hero({ x: 540, y: 1400, h: 640, t, mood: lt < ws[2] ? 'sad' : 'determined', look: [0, -0.5], blink: blink(t), wet: true, wind: 0.2, glow: `rgba(255,200,120,${0.4 + 0.5 * warm})`, pose: POSE.handChest });
        ctx.restore(); rain(t, 0.6 * (1 - warm * 0.5), 90, -6);
      } });
    [0, 1, 2].forEach((k) => cue(Wt(12, k) - 0.03, 'chime', { n: k + 2, gain: 0.6 })); }

  // ═══ 9 · THEN YOU KEEP WALKING: through the forest; rain stops; light comes through the trees
  { const st = cut(13);
    add({ id: 'S09', at: st, tin: { type: 'fade', d: 0.45 }, note: 'forest walk, night → dawn, rain fades, god rays', grade: (lt) => ({ sat: lerp(0.85, 1.05, seg(lt, 0, 1.5)), con: 1.06, tint: '#2A56A8', tintA: lerp(0.25, 0.0, seg(lt, 0, 1.5)), vig: 0.6, bars: 0.4, bloom: lerp(0.2, 0.45, seg(lt, 0, 1.5)) }),
      draw(lt, d, t) {
        const k = eio(seg(lt, 0, d)), camX = lt * 230;
        grad([[0, mix('#0E1430', '#5C6FB0', k)], [0.7, mix('#1E2850', '#E79B84', k)], [1, mix('#2A3560', '#FFD6A0', k)]], -400, 1300);
        sun(900, lerp(1300, 1040, k), 80, '#FFF4DA', '#FFB870', k);
        ctx.save(); ctx.globalAlpha = 1; for (let i = -2; i < 12; i++) { const x = i * 150 - (camX * 0.3) % 150, hh = 520 + rnd(i + 50) * 200; pine(x, 1300, hh, mix('#1B2240', '#7B6E99', k)); } ctx.restore();
        haze(1200, 160, mix('#3A4880', '#FFC9A0', k), 0.4);
        rays(1000, 700, t, k * 1.3, 8, 1800, 0.35, '#FFE0A8', Math.PI * 0.82);
        for (let i = -2; i < 10; i++) { const x = i * 210 - (camX * 0.6) % 210 + 40, hh = 760 + rnd(i + 70) * 260; pine(x, 1420, hh, mix('#10152A', '#4A3E62', k)); }
        ctx.fillStyle = mix('#0D1226', '#3A3050', k); ctx.fillRect(-500, 1420, W + 1000, 1000);
        goldPath([[-400, 1440], [1500, 1440]], 3000, 8, 12, '#F6D27A', 0.4 + k * 0.4);
        hero({ x: 430, y: 1440, h: 560, t, walk: lt * 7.4, mood: lt < 0.8 ? 'sad' : 'calm', look: [1, lt < 0.8 ? 0.4 : -0.2], blink: blink(t), wind: 0.3 + k * 0.3, glow: `rgba(255,${200 + k * 30},${150 + k * 30},${0.5 + k * 0.4})` });
        ctx.save(); ctx.filter = 'blur(10px)'; for (let i = -1; i < 5; i++) { const x = i * 520 - (camX * 1.6) % 520; pine(x, 2050, 1400, '#06070E'); } ctx.restore();
        motes(t, k, 20, '#FFE2A0', [0, 300, W, 1200], 20);
        rain(t, 1 - seg(lt, 0.1, 0.9), 110, -8);
      } });
    cue(st, 'rain_out', { dur: 1.2 }); cue(st + 0.6, 'birds', { dur: 2.5, gain: 0.5 }); }

  // ═══ 10 · AND YOU FIND…: he steps out onto a cliff; camera pulls back to a vast sunrise valley
  { const st = cut(14);
    add({ id: 'S10', at: st, note: 'pull back from him to a huge sunrise valley, birds, flare', grade: (lt) => ({ sat: 1.12, con: 1.06, tint: '#FF9A4A', tintA: 0.12, vig: 0.5, bars: 0.4, bloom: 0.55 }),
      draw(lt, d, t) {
        ctx.save(); cam(lerp(330, 540, eio(seg(lt, 0, d + 0.1))), lerp(1180, 960, eio(seg(lt, 0, d + 0.1))), lerp(2.2, 1.0, eio(seg(lt, 0, d + 0.1))));
        sunriseLand(t, 0, lerp(1060, 980, seg(lt, 0, d)));
        for (let i = 0; i < 5; i++) bird(620 + i * 70 + lt * 120, 700 + Math.sin(i * 2) * 60 - lt * 30, 0.7, t + i, '#5A3E5E');
        ctx.fillStyle = '#2E2440'; ctx.beginPath(); ctx.moveTo(-400, 1320); ctx.lineTo(420, 1335); ctx.lineTo(470, 1420); ctx.lineTo(440, 2400); ctx.lineTo(-400, 2400); ctx.closePath(); ctx.fill();
        hero({ x: 330, y: 1333, h: 300, t, mood: 'awe', look: [1, -0.3], blink: 0, wind: 0.8, glow: 'rgba(255,200,130,0.95)' });
        ctx.restore(); flare(560, 980, 0.8);
      } });
    cue(st, 'swell', { dur: 1.6, gain: 0.8 }); }

  // ═══ 11 · WHEN YOU LOOK BACK: he turns around; the world orbits; a slow smile
  { const st = cut(15);
    add({ id: 'S11', at: st, note: 'medium shot, he turns to look back; background orbits', grade: (lt) => ({ sat: 1.1, con: 1.05, tint: '#FF9A4A', tintA: 0.12, vig: 0.55, bars: 0.4, bloom: 0.5 }),
      draw(lt, d, t) {
        const orbit = eio(seg(lt, 0.1, 0.75)) * 900;
        ctx.save(); cam(540, 1000, 1.0);
        sunriseLand(t, orbit, 900);
        ctx.fillStyle = '#2E2440'; ctx.fillRect(-500, 1660, W + 1000, 800);
        const turned = lt > 0.32;
        hero({ x: 540, y: 1700, h: 980, t, dir: turned ? -1 : 1, mood: lt < 0.55 ? 'awe' : 'smile', look: turned ? [-1, -0.2] : [1, 0], blink: 0, wind: 0.8, shadow: false, glow: 'rgba(255,190,120,0.9)', lean: turned ? -4 : 0, headTilt: turned ? -6 : 0 });
        ctx.restore(); flare(560 - orbit * 0.03, 900, 0.6);
      } });
    cue(st + 0.1, 'whoosh', { gain: 0.6 }); }

  // ═══ 12 · YOU SAY: YOU KNOW!: bird's-eye reveal — the zigzags were the switchbacks up the mountain
  { const st = cut(16);
    add({ id: 'S12', at: st, tin: { type: 'zoom', d: 0.4 }, note: 'REVEAL: map pulls out, the zigzag is a switchback road to the summit; straight road ends in the canyon', grade: (lt) => ({ sat: 1.1, con: 1.05, tint: '#FFB050', tintA: 0.12, vig: 0.5, bloom: 0.45 }),
      draw(lt, d, t) {
        const k = eio(seg(lt, 0, 1.15));
        ctx.save(); cam(lerp(SUM[0], 1200, k), lerp(SUM[1] + 40, 2000, k), lerp(1.7, 0.47, k));
        mountainMap(t, 0);
        // the straight road you wanted… leads into the canyon
        ctx.save(); ctx.setLineDash([34, 30]); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(1200, 3300); ctx.lineTo(1200, 2470); ctx.stroke(); ctx.restore();
        const xs = eob(seg(lt, 0.7, 0.95)); if (xs > 0) { ctx.save(); ctx.translate(1200, 2380); ctx.scale(xs, xs); ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fillStyle = '#E2574C'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-34, -34); ctx.lineTo(34, 34); ctx.moveTo(34, -34); ctx.lineTo(-34, 34); ctx.stroke(); ctx.restore(); }
        goldPath(ROUTE, RLEN, 30, 50);
        // a pulse of light runs up the whole route
        const pl = seg(lt, 0.3, 1.25) * RLEN; if (pl > 0 && pl < RLEN) { const q = pointAt(ROUTE, pl); glow(q[0], q[1], 200, '#FFF2C8', 0.9); }
        [RAW[2], RAW[3], RAW[4], RAW[5], RAW[6]].forEach((p, i) => star(p[0], p[1], 70, eob(seg(lt, 0.55 + i * 0.1, 0.8 + i * 0.1))));
        sun(SUM[0], SUM[1] - 40, 70, '#FFF7E2', '#FFC870', 0.9);
        ctx.save(); ctx.translate(SUM[0] + 10, SUM[1] - 30); ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -170); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -170); ctx.lineTo(100, -140); ctx.lineTo(0, -110); ctx.fillStyle = '#E0483E'; ctx.fill(); ctx.restore();
        mapHero(SUM[0] - 60, SUM[1] + 20, -Math.PI / 2, 1.2, t, 'happy');
        ctx.restore();
      } });
    cue(st, 'whoosh'); cue(st + 0.3, 'reveal', { dur: 1.6 }); cue(st + 0.55, 'shimmer', { dur: 1.2 }); }

  // ═══ 13 · GLORY BE TO YOU, LORD!: on the summit, arms raised into the sunrise
  { const st = cut(17);
    add({ id: 'S13', at: st, tin: { type: 'flash', d: 0.35, color: '#FFF1D0' }, note: 'summit, arms raised, sun burst, rising light particles', grade: (lt) => ({ sat: 1.12, con: 1.05, tint: '#FFA040', tintA: 0.14, vig: 0.5, bloom: 0.42 }),
      draw(lt, d, t) {
        ctx.save(); cam(540, lerp(1100, 980, eio(seg(lt, 0, d))), lerp(1.12, 1.0, eio(seg(lt, 0, d))));
        grad([[0, '#3A4C9A'], [0.5, '#E8907A'], [0.8, '#FFD39A'], [1, '#FFF0C8']], -400, 1350);
        sun(540, 1040, 170, '#FFFBEA', '#FFC870'); rays(540, 1040, t, 1.6, 22, 2600, Math.PI, '#FFE6B0', -Math.PI / 2);
        ridge(1270, 160, 3, '#C88E9B', 0, 0.4); haze(1250, 120, '#FFD0A8', 0.5); ridge(1380, 120, 5, '#8E6890');
        ctx.fillStyle = '#3A2E4C'; ctx.beginPath(); ctx.moveTo(-500, 2400); ctx.lineTo(-500, 1700); ctx.lineTo(540, 1380); ctx.lineTo(1580, 1700); ctx.lineTo(1580, 2400); ctx.closePath(); ctx.fill();
        const up = eob(seg(lt, 0.0, 0.4));
        hero({ x: 540, y: 1392, h: 560, t, mood: 'bliss', blink: 0, wind: 0.9, glow: 'rgba(255,214,150,1)', pose: { arms: { L: [lerp(-40, -160, up), lerp(60, 8, up)], R: [lerp(40, 160, up), lerp(-60, -8, up)] } }, headTilt: -10 });
        motes(t, 1.2, 34, '#FFE7B0', [0, 300, W, 1300], 90);
        ctx.restore();
      } });
    cue(st, 'reveal', { dur: 1.4, gain: 0.8 }); }

  // ═══ 14 · THE BEST THING THAT EVER HAPPENED TO ME: golden hour, he sits on the summit; the gold switchback road below
  { const st = cut(18);
    const road = smooth([[1300, 2300], [700, 2120], [980, 1940], [560, 1790], [800, 1650], [520, 1520], [640, 1400], [455, 1260]], 3);
    add({ id: 'S14', at: st, tin: { type: 'fade', d: 0.55 }, note: 'golden hour on the summit, gold switchbacks below, he turns and smiles; end title', grade: (lt) => ({ sat: 1.1, con: 1.04, tint: '#FF9A40', tintA: 0.16, vig: 0.55, bloom: 0.5, bars: seg(lt, 2.7, 3.4) * 0.6 }),
      draw(lt, d, t) {
        const k = eio(seg(lt, 0, 3.8));
        ctx.save(); cam(lerp(470, 560, k), lerp(1150, 1080, k), lerp(1.65, 0.9, k));
        grad([[0, '#2E3C86'], [0.45, '#C27A98'], [0.72, '#F6A070'], [1, '#FFE0A8']], -700, 1500);
        sun(880, 1260, 110, '#FFF6DE', '#FF9E5A');
        ridge(1330, 230, 21, '#B47A92', 0, 0.5, -1500, 2600); haze(1280, 160, '#FFB890', 0.5);
        ridge(1480, 200, 23, '#7E5A86', 0, 0.3, -1500, 2600); haze(1450, 120, '#F59A80', 0.3);
        // the mountain he climbed, with the road he took
        ctx.fillStyle = '#3A2C4A'; ctx.beginPath(); ctx.moveTo(-1500, 2800); ctx.lineTo(-1500, 2000); ctx.lineTo(455, 1262); ctx.lineTo(2600, 2300); ctx.lineTo(2600, 2800); ctx.closePath(); ctx.fill();
        goldPath(road, polyLen(road), 12, 24, '#F6C453', 0.95);
        glow(455, 1240, 300, '#FFC870', 0.35);
        const turn = lt > Wt(19, 2) - st;
        hero({ x: 455, y: 0, hipY: 1255, h: 260, t, dir: turn ? -1 : 1, mood: turn ? 'happy' : 'smile', look: turn ? [-0.4, 0.2] : [1, 0], blink: blink(t), wind: 0.6, glow: 'rgba(255,200,130,0.9)', breathe: true, pose: { legs: { L: [78, 55], R: [70, 45] }, arms: { L: [-35, -10], R: [-28, -10] } }, lean: -6 });
        // a small bird lands beside him
        const bl = seg(lt, 0.8, 1.6); bird(lerp(900, 520, eio(bl)), lerp(900, 1238, eio(bl)), 0.45, bl < 1 ? t : 0, '#2A2230');
        motes(t, 0.8, 26, '#FFE2A0', [-200, 600, 1500, 1000], 20);
        ctx.restore();
        // end title
        const et = lt - (24.7 - st);
        if (et > 0) { const a = eo(seg(et, 0, 0.5)); ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 560 - (1 - a) * 30);
          ctx.font = '900 150px Cairo'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(50,15,40,0.85)'; ctx.shadowBlur = 40; ctx.fillStyle = GOLDC; ctx.fillText('ثِق في الطريق', 0, 0); ctx.shadowColor = 'rgba(255,190,80,0.8)'; ctx.shadowBlur = 50; ctx.fillText('ثِق في الطريق', 0, 0);
          ctx.shadowBlur = 0; const sw = et * 900 - 500, g = ctx.createLinearGradient(sw - 150, 0, sw + 150, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,245,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillText('ثِق في الطريق', 0, 0);
          ctx.direction = 'ltr'; ctx.font = '800 40px Inter'; ctx.letterSpacing = '14px'; ctx.shadowColor = 'rgba(50,15,40,0.9)'; ctx.shadowBlur = 20; ctx.fillStyle = 'rgba(255,240,215,0.95)'; ctx.fillText('TRUST THE PATH', 8, 130); ctx.restore(); }
      } });
    cue(Wt(19, 2), 'shimmer', { dur: 1.4 }); cue(24.7, 'chime', { n: 5, gain: 0.7 }); }

  return { shots: S, cues: CUES };
}
