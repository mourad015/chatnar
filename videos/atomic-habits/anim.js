// Atomic Habits — motion summary.
// Every frame is a pure function of time T (seconds), so rendering is deterministic.
// Open index.html to preview in a browser; render.js captures frames for the MP4.

const W = 1080, H = 1920, FPS = 30;
const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const FONT = 'Inter, "Inter Display", sans-serif';

const C = {
  bg: '#0D0E12', bg2: '#1A1C25', text: '#F4EEE4', dim: 'rgba(244,238,228,0.55)',
  acc: '#FF7A3D', acc2: '#38D6C4', red: '#FF4D6A', gold: '#FFC857',
};

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function mixC(a, b, m) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const ch = s => Math.round(lerp((x >> s) & 255, (y >> s) & 255, m));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- drawing helpers ----------
function setFont(o) { ctx.font = `${o.w || 700} ${o.s || 60}px ${FONT}`; ctx.letterSpacing = (o.ls || 0) + 'px'; }
function txt(s, x, y, o = {}) {
  ctx.save();
  ctx.globalAlpha *= (o.a ?? 1);
  setFont(o);
  ctx.fillStyle = o.c || C.text;
  ctx.textAlign = o.al || 'center';
  ctx.textBaseline = 'middle';
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.gb || 30; }
  ctx.fillText(s, x, y);
  ctx.restore();
}
function measure(s, o) { ctx.save(); setFont(o); const w = ctx.measureText(s).width; ctx.restore(); return w; }
function rise(t, d, dur = 0.6, dist = 40) { const p = E.out(P(t, d, d + dur)); return { a: p, dy: (1 - p) * dist }; }
function riseTxt(s, x, y, t, d, o = {}) { const r = rise(t, d, o.dur || 0.6); txt(s, x, y + r.dy, { ...o, a: (o.a ?? 1) * r.a }); }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); }

// Word-by-word reveal; hl = indexes of highlighted words.
function words(line, cx, y, t, start, step, o = {}, hl = []) {
  const parts = line.split(' ');
  const ws = parts.map(p => measure(p, o));
  const sp = measure(' ', o);
  let x = cx - (ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1)) / 2;
  parts.forEach((w, i) => {
    const r = rise(t, start + i * step, 0.5, 30);
    txt(w, x, y + r.dy, { ...o, al: 'left', a: r.a, c: hl.includes(i) ? (o.hc || C.acc) : (o.c || C.text) });
    x += ws[i] + sp;
  });
}
// Letter-by-letter pop.
function letters(str, cx, y, t, start, step, o = {}) {
  const chars = [...str];
  const ws = chars.map(ch => measure(ch, o));
  let x = cx - (ws.reduce((a, b) => a + b, 0) - (o.ls || 0)) / 2;
  chars.forEach((ch, i) => {
    const q = P(t, start + i * step, start + i * step + 0.55);
    txt(ch, x, y + (1 - E.back(q)) * 70, { ...o, al: 'left', a: clamp(q * 2.5) });
    x += ws[i];
  });
}
// Mixed-color single line: parts = [[text, color], ...]
function segs(parts, cx, y, o = {}) {
  const ws = parts.map(p => measure(p[0], o));
  let x = cx - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, i) => { txt(p[0], x, y, { ...o, al: 'left', c: p[1] }); x += ws[i]; });
}
function segsRise(parts, cx, y, t, d, o = {}) { const r = rise(t, d); ctx.save(); ctx.globalAlpha *= r.a; segs(parts, cx, y + r.dy, o); ctx.restore(); }

// ---------- background ----------
const rnd = mulberry32(7);
const dots = Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), r: 1 + rnd() * 2.5, v: 0.004 + rnd() * 0.012, ph: rnd() * 6.28 }));
function blob(x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function background(T, tint, prevTint, mixIn) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const bx = 540 + Math.sin(T * 0.3) * 200, by = 650 + Math.cos(T * 0.23) * 150;
  if (prevTint && mixIn < 1) blob(bx, by, 750, prevTint, 0.2 * (1 - mixIn));
  blob(bx, by, 750, tint, 0.2 * mixIn);
  blob(540 + Math.cos(T * 0.2) * 250, 1450 + Math.sin(T * 0.27) * 200, 650, C.acc2, 0.07);
  for (const d of dots) {
    const y = (((d.y - T * d.v) % 1) + 1) % 1 * H;
    const x = d.x * W + Math.sin(T * 0.5 + d.ph) * 20;
    ctx.fillStyle = hexA(C.text, 0.08 + 0.18 * (0.5 + 0.5 * Math.sin(T * 1.3 + d.ph)));
    circle(x, y, d.r); ctx.fill();
  }
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ---------- scenes ----------
function sIntro(t) {
  const cx = 540, cy = 690;
  for (let k = 0; k < 3; k++) {
    const p = E.inOut(P(t, 0.2 + k * 0.15, 1.4 + k * 0.15));
    const rot = k * Math.PI / 3 + t * 0.15;
    ctx.save();
    ctx.strokeStyle = hexA(C.text, 0.55); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(cx, cy, 210, 74, rot, 0, Math.PI * 2 * p); ctx.stroke();
    const a = t * 2.2 + k * 2.1, ex = 210 * Math.cos(a), ey = 74 * Math.sin(a);
    ctx.globalAlpha = P(t, 1.2, 1.6);
    ctx.fillStyle = C.acc2; ctx.shadowColor = C.acc2; ctx.shadowBlur = 25;
    circle(cx + ex * Math.cos(rot) - ey * Math.sin(rot), cy + ex * Math.sin(rot) + ey * Math.cos(rot), 11); ctx.fill();
    ctx.restore();
  }
  const np = E.back(P(t, 0.5, 1.1));
  ctx.save(); ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 50;
  circle(cx, cy, 32 * np); ctx.fill(); ctx.restore();
  const pr = ((t - 1) % 1.6) / 1.6;
  if (t > 1) { ctx.strokeStyle = hexA(C.acc, 0.5 * (1 - pr)); ctx.lineWidth = 3; circle(cx, cy, 32 + pr * 90); ctx.stroke(); }

  letters('ATOMIC', 540, 1010, t, 1.0, 0.07, { s: 150, w: 900, ls: 14 });
  letters('HABITS', 540, 1165, t, 1.35, 0.07, { s: 150, w: 900, ls: 14, c: C.acc });
  const lp = E.inOut(P(t, 2.0, 2.8));
  ctx.fillStyle = C.acc2; ctx.fillRect(540 - 260 * lp, 1268, 520 * lp, 4);
  riseTxt('Tiny changes. Remarkable results.', 540, 1350, t, 2.3, { s: 46, w: 500 });
  riseTxt('THE BOOK BY JAMES CLEAR · IN 90 SECONDS', 540, 1440, t, 2.8, { s: 26, w: 600, c: C.dim, ls: 4 });
}

function sPercent(t) {
  riseTxt('Get 1% better', 540, 330, t, 0.3, { s: 96, w: 900 });
  riseTxt('every day.', 540, 435, t, 0.45, { s: 96, w: 900, c: C.acc });
  const x0 = 150, x1 = 930, yc = 1010, up = 380, dn = 300, MAX = Math.pow(1.01, 365);
  const ap = E.out(P(t, 0.8, 1.4));
  ctx.save(); ctx.globalAlpha = ap;
  ctx.strokeStyle = hexA(C.text, 0.3); ctx.lineWidth = 3; ctx.setLineDash([14, 12]);
  ctx.beginPath(); ctx.moveTo(x0, yc); ctx.lineTo(x1, yc); ctx.stroke(); ctx.setLineDash([]);
  txt('START', x0, yc - 30, { s: 22, w: 700, ls: 4, c: C.dim, al: 'left' });
  ctx.restore();

  const dd = 365 * E.inOut(P(t, 1.4, 6.4));
  riseTxt(`DAY ${Math.round(dd)}`, 540, 600, t, 1.0, { s: 34, w: 800, ls: 6, c: C.dim });
  const fx = d => x0 + (x1 - x0) * d / 365;
  const fu = v => yc - up * (v - 1) / (MAX - 1);
  const fd = v => yc + dn * (1 - v);
  const curve = (f, col) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.beginPath();
    for (let d = 0; d <= dd; d += 2) { d === 0 ? ctx.moveTo(fx(0), f(d)) : ctx.lineTo(fx(d), f(d)); }
    ctx.lineTo(fx(dd), f(dd)); ctx.stroke(); ctx.restore();
  };
  if (dd > 0.5) {
    const vu = Math.pow(1.01, dd), vd = Math.pow(0.99, dd);
    curve(d => fu(Math.pow(1.01, d)), C.acc);
    curve(d => fd(Math.pow(0.99, d)), C.red);
    const lx = clamp(fx(dd), 230, 850);
    ctx.fillStyle = C.acc; circle(fx(dd), fu(vu), 13); ctx.fill();
    ctx.fillStyle = C.red; circle(fx(dd), fd(vd), 13); ctx.fill();
    txt(vu.toFixed(2) + '×', lx, fu(vu) - 52, { s: 56, w: 900, c: C.acc });
    txt(vd.toFixed(2) + '×', lx, fd(vd) + 55, { s: 56, w: 900, c: C.red });
    const la = P(t, 1.8, 2.4);
    txt('1% BETTER', lx, fu(vu) - 105, { s: 22, w: 800, ls: 4, c: C.acc, a: la * 0.8 });
    txt('1% WORSE', lx, fd(vd) + 105, { s: 22, w: 800, ls: 4, c: C.red, a: la * 0.8 });
  }
  riseTxt('Habits are the compound interest', 540, 1530, t, 6.6, { s: 44, w: 600 });
  riseTxt('of self-improvement.', 540, 1590, t, 6.75, { s: 44, w: 700, c: C.acc2 });
}

function sPlateau(t) {
  riseTxt('The Plateau of', 540, 330, t, 0.3, { s: 88, w: 900 });
  riseTxt('Latent Potential', 540, 430, t, 0.45, { s: 88, w: 900, c: C.acc2 });
  const x0 = 150, x1 = 930, y0 = 1250, y1 = 640, ymax = 2.1;
  const X = u => x0 + (x1 - x0) * u, Y = v => y0 - (y0 - y1) * v / ymax;
  const act = u => u * u * u / 0.49;
  ctx.save(); ctx.globalAlpha = P(t, 0.6, 1.1);
  ctx.strokeStyle = hexA(C.text, 0.45); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x0, y1 - 20); ctx.lineTo(x0, y0); ctx.lineTo(x1 + 20, y0); ctx.stroke();
  txt('RESULTS', x0, y1 - 50, { s: 22, w: 800, ls: 4, c: C.dim, al: 'left' });
  txt('TIME', x1 + 20, y0 + 42, { s: 22, w: 800, ls: 4, c: C.dim, al: 'right' });
  ctx.restore();

  const pv = P(t, 3.9, 4.6);
  if (pv > 0) {
    ctx.save(); ctx.fillStyle = hexA(C.red, 0.28 * pv); ctx.beginPath();
    for (let u = 0; u <= 0.7; u += 0.01) ctx.lineTo(X(u), Y(u));
    for (let u = 0.7; u >= 0; u -= 0.01) ctx.lineTo(X(u), Y(act(u)));
    ctx.fill(); ctx.restore();
    txt('Valley of', X(0.4), 1040, { s: 30, w: 800, c: C.red, a: pv });
    txt('Disappointment', X(0.4), 1078, { s: 30, w: 800, c: C.red, a: pv });
  }
  const pe = E.inOut(P(t, 1.0, 2.6));
  if (pe > 0) {
    ctx.save(); ctx.strokeStyle = hexA(C.text, 0.6); ctx.lineWidth = 5; ctx.setLineDash([18, 14]);
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(pe), Y(pe)); ctx.stroke(); ctx.restore();
    txt('Expected', 930, 1005, { s: 30, w: 700, c: C.dim, al: 'right', a: P(t, 2.4, 2.9) });
  }
  const pa = E.inOut(P(t, 1.6, 3.8));
  if (pa > 0) {
    ctx.save(); ctx.strokeStyle = C.acc2; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.shadowColor = C.acc2; ctx.shadowBlur = 20; ctx.beginPath();
    for (let u = 0; u <= pa; u += 0.01) ctx.lineTo(X(u), Y(act(u)));
    ctx.lineTo(X(pa), Y(act(pa))); ctx.stroke(); ctx.restore();
    txt('Actual results', 895, 640, { s: 30, w: 800, c: C.acc2, al: 'right', a: P(t, 3.6, 4.1) });
  }
  const pb = E.back(P(t, 4.6, 5.1));
  if (pb > 0) {
    const bx = X(0.7), by = Y(0.7);
    const pr = ((t - 4.6) % 1.2) / 1.2;
    ctx.strokeStyle = hexA(C.acc, 0.6 * (1 - pr)); ctx.lineWidth = 3; circle(bx, by, 16 + pr * 50); ctx.stroke();
    ctx.save(); ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 30; circle(bx, by, 16 * pb); ctx.fill(); ctx.restore();
    txt('Breakthrough', 730, 1085, { s: 30, w: 800, c: C.acc, al: 'left', a: clamp(pb) });
  }
  riseTxt('Results lag behind effort.', 540, 1450, t, 5.4, { s: 48, w: 700 });
  riseTxt('Keep going.', 540, 1520, t, 5.7, { s: 48, w: 800, c: C.acc });
}

function card(x, y, w, h, col, title, l1, l2, t, d) {
  const r = rise(t, d, 0.6, 50);
  ctx.save(); ctx.globalAlpha *= r.a; ctx.translate(0, r.dy);
  rr(x, y, w, h, 28); ctx.fillStyle = C.bg2; ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  txt(title, x + w / 2, y + 70, { s: 46, w: 900, c: col, ls: 4 });
  txt(l1, x + w / 2, y + 138, { s: 32, w: 500, c: C.dim });
  txt(l2, x + w / 2, y + 182, { s: 32, w: 500, c: C.dim });
  ctx.restore();
}

function sSystems(t) {
  txt('“', 150, 520, { s: 260, w: 900, c: C.acc, a: 0.25 * P(t, 0.1, 0.6) });
  const o = { s: 68, w: 800 };
  words('You do not rise to', 540, 620, t, 0.3, 0.1, o);
  words('the level of your goals.', 540, 710, t, 0.75, 0.1, { ...o, hc: C.red }, [4]);
  words('You fall to the level', 540, 900, t, 2.0, 0.1, o);
  words('of your systems.', 540, 990, t, 2.5, 0.1, { ...o, hc: C.acc }, [2]);
  riseTxt('— James Clear', 540, 1100, t, 3.4, { s: 32, w: 500, c: C.dim });
  card(100, 1230, 420, 230, C.red, 'GOALS', 'the results', 'you want', t, 4.3);
  card(560, 1230, 420, 230, C.acc, 'SYSTEMS', 'the process that', 'gets you there', t, 4.6);
  riseTxt('Fix the inputs and the outputs fix themselves.', 540, 1580, t, 5.4, { s: 34, w: 500, c: C.text });
}

function sIdentity(t) {
  riseTxt('Identity-Based', 540, 320, t, 0.3, { s: 90, w: 900 });
  riseTxt('Habits', 540, 420, t, 0.45, { s: 90, w: 900, c: C.acc });
  const cx = 540, cy = 850;
  const rings = [
    { r: 300, n: 'OUTCOMES', s: 'what you get', fill: hexA(C.text, 0.05), st: hexA(C.text, 0.35), ny: -268, sy: -232 },
    { r: 205, n: 'PROCESSES', s: 'what you do', fill: hexA(C.acc2, 0.12), st: C.acc2, ny: -172, sy: -138 },
    { r: 110, n: 'IDENTITY', s: 'what you believe', fill: C.acc, st: C.acc, ny: -14, sy: 24 },
  ];
  rings.forEach((g, k) => {
    const p = E.back(P(t, 0.6 + k * 0.35, 1.2 + k * 0.35));
    if (p <= 0) return;
    ctx.save();
    if (k === 2) { ctx.shadowColor = C.acc; ctx.shadowBlur = 40 + 20 * Math.sin(t * 4); }
    circle(cx, cy, g.r * p); ctx.fillStyle = g.fill; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = g.st; ctx.stroke(); ctx.restore();
    const la = P(t, 1.3 + k * 0.3, 1.8 + k * 0.3);
    const dark = k === 2;
    txt(g.n, cx, cy + g.ny, { s: k === 2 ? 32 : 28, w: 900, ls: 4, c: dark ? C.bg : (k === 1 ? C.acc2 : C.text), a: la });
    txt(g.s, cx, cy + g.sy, { s: k === 2 ? 22 : 24, w: 500, c: dark ? 'rgba(13,14,18,0.75)' : C.dim, a: la });
  });
  if (t > 3) {
    const pr = ((t - 3) % 1.4) / 1.4;
    ctx.strokeStyle = hexA(C.acc, 0.7 * (1 - pr)); ctx.lineWidth = 4; circle(cx, cy, 110 + pr * 60); ctx.stroke();
  }
  riseTxt('Focus on who you wish to become,', 540, 1225, t, 3.0, { s: 38, w: 600 });
  riseTxt('not what you want to achieve.', 540, 1275, t, 3.2, { s: 38, w: 600, c: C.dim });
  riseTxt('“I want to run a marathon.”', 540, 1375, t, 4.4, { s: 40, w: 500, c: C.dim });
  const sp = E.inOut(P(t, 5.0, 5.5));
  if (sp > 0) {
    const w = measure('“I want to run a marathon.”', { s: 40, w: 500 });
    ctx.fillStyle = C.red; ctx.fillRect(540 - w / 2 - 10, 1373, (w + 20) * sp, 4);
  }
  riseTxt('“I am a runner.”', 540, 1455, t, 5.5, { s: 56, w: 900, c: C.acc });
  riseTxt('Every action is a vote for', 540, 1585, t, 6.4, { s: 36, w: 600, c: C.acc2 });
  riseTxt('the person you want to become.', 540, 1632, t, 6.55, { s: 36, w: 600, c: C.acc2 });
}

function sLoop(t) {
  riseTxt('The Habit Loop', 540, 330, t, 0.3, { s: 96, w: 900 });
  riseTxt('Every habit runs on four steps', 540, 425, t, 0.5, { s: 36, w: 500, c: C.dim });
  const cx = 540, cy = 880, R = 290, TAU = Math.PI * 2, top = -Math.PI / 2;
  const p = E.inOut(P(t, 0.6, 1.8));
  ctx.strokeStyle = hexA(C.text, 0.22); ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(cx, cy, R, top, top + TAU * p); ctx.stroke();
  const aa = P(t, 1.6, 2.0);
  for (let k = 0; k < 4; k++) {
    const a = top + Math.PI / 4 + k * Math.PI / 2;
    ctx.save(); ctx.translate(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.rotate(a + Math.PI / 2);
    ctx.globalAlpha = aa; ctx.strokeStyle = C.acc; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-12, -14); ctx.lineTo(4, 0); ctx.lineTo(-12, 14); ctx.stroke(); ctx.restore();
  }
  let dotA = null;
  if (t > 2.0) {
    dotA = top + (t - 2.0) * TAU / 2.6;
    for (let i = 8; i >= 0; i--) {
      const a = dotA - i * 0.06;
      ctx.fillStyle = hexA(C.gold, (1 - i / 9) * 0.9);
      circle(cx + R * Math.cos(a), cy + R * Math.sin(a), 14 - i); ctx.fill();
    }
  }
  const names = ['CUE', 'CRAVING', 'RESPONSE', 'REWARD'], subs = ['notice', 'want', 'do', 'enjoy'];
  const lits = [];
  names.forEach((n, k) => {
    const a = top + k * Math.PI / 2;
    let lit = 0;
    if (dotA !== null) {
      let da = Math.abs(((dotA - a) % TAU + TAU) % TAU);
      da = Math.min(da, TAU - da);
      lit = clamp(1 - da / 0.7);
    }
    lits.push(lit);
    const pop = E.back(P(t, 0.8 + k * 0.25, 1.3 + k * 0.25));
    if (pop <= 0) return;
    const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    ctx.save();
    if (lit > 0) { ctx.shadowColor = C.acc; ctx.shadowBlur = 50 * lit; }
    circle(x, y, (108 + 8 * lit) * pop); ctx.fillStyle = mixC(C.bg2, C.acc, lit); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = hexA(C.acc, 0.8); ctx.stroke(); ctx.restore();
    const dark = lit > 0.5;
    txt(n, x, y - 12, { s: 30, w: 900, ls: 2, c: dark ? C.bg : C.text, a: clamp(pop) });
    txt(subs[k], x, y + 26, { s: 24, w: 500, c: dark ? 'rgba(13,14,18,0.75)' : C.dim, a: clamp(pop) });
  });
  riseTxt('REPEAT', cx, cy - 18, t, 2.4, { s: 40, w: 900, ls: 8, c: C.acc });
  riseTxt('until it’s automatic', cx, cy + 30, t, 2.6, { s: 28, w: 500, c: C.dim });
  const ex = ['Phone buzzes', 'Want to know who', 'Check the phone', 'Curiosity satisfied'];
  riseTxt('EXAMPLE', 540, 1330, t, 4.0, { s: 22, w: 800, ls: 6, c: C.dim });
  ex.forEach((v, k) => {
    const r = rise(t, 4.2 + k * 0.35, 0.5, 30);
    const y = 1395 + k * 68 + r.dy;
    txt(names[k], 450, y, { s: 28, w: 800, ls: 3, c: C.acc, al: 'right', a: r.a });
    txt(v, 490, y, { s: 40, w: 600, c: lits[k] > 0.5 ? C.gold : C.text, al: 'left', a: r.a });
  });
}

function sLaws(t) {
  riseTxt('The 4 Laws of', 540, 300, t, 0.3, { s: 86, w: 900 });
  riseTxt('Behavior Change', 540, 400, t, 0.45, { s: 86, w: 900, c: C.acc });
  const good = ['OBVIOUS', 'ATTRACTIVE', 'EASY', 'SATISFYING'];
  const bad = ['INVISIBLE', 'UNATTRACTIVE', 'DIFFICULT', 'UNSATISFYING'];
  const tags = ['CUE', 'CRAVING', 'RESPONSE', 'REWARD'];
  for (let i = 0; i < 4; i++) {
    const y = 600 + i * 210;
    const p = E.out(P(t, 0.7 + i * 0.4, 1.4 + i * 0.4));
    if (p <= 0) continue;
    const off = (1 - p) * 700;
    const m = E.inOut(P(t, 7.0 + i * 0.45, 7.6 + i * 0.45));
    const col = mixC(C.acc, C.red, m);
    ctx.save(); ctx.globalAlpha = p;
    rr(90 + off, y - 90, 900, 180, 28); ctx.fillStyle = C.bg2; ctx.fill();
    rr(90 + off, y - 90, 14, 180, [28, 0, 0, 28]); ctx.fillStyle = col; ctx.fill();
    txt(String(i + 1), 165 + off, y + 4, { s: 96, w: 900, c: col });
    txt('MAKE IT', 252 + off, y - 40, { s: 26, w: 700, ls: 5, c: C.dim, al: 'left' });
    txt(tags[i], 962 + off, y - 50, { s: 22, w: 800, ls: 4, c: C.dim, al: 'right' });
    ctx.save(); rr(90 + off, y - 70, 900, 160, 28); ctx.clip();
    txt(good[i], 250 + off, y + 28 - m * 90, { s: 64, w: 900, al: 'left', a: 1 - m });
    txt(bad[i], 250 + off, y + 28 + (1 - m) * 90, { s: 64, w: 900, al: 'left', c: C.red, a: m });
    ctx.restore(); ctx.restore();
  }
  const g = rise(t, 3.2);
  txt('To build a good habit,', 540, 1480 + g.dy, { s: 46, w: 800, a: g.a * (1 - P(t, 5.8, 6.1)) });
  txt('use all four.', 540, 1545 + g.dy, { s: 46, w: 800, c: C.acc, a: g.a * (1 - P(t, 5.8, 6.1)) });
  riseTxt('To break a bad habit,', 540, 1480, t, 6.2, { s: 46, w: 800 });
  riseTxt('invert them.', 540, 1545, t, 6.4, { s: 46, w: 800, c: C.red });
}

function sStack(t) {
  riseTxt('Habit Stacking', 540, 330, t, 0.25, { s: 96, w: 900 });
  riseTxt('Link a new habit to a current one', 540, 425, t, 0.4, { s: 36, w: 500, c: C.dim });
  const bricks = [
    { y: 1080, s: 'After I pour my coffee', bg: C.bg2, fg: C.text, d: 0.5 },
    { y: 910, s: 'I meditate for 1 minute', bg: C.acc, fg: C.bg, d: 1.1 },
    { y: 740, s: 'Then I write my to-do list', bg: C.acc2, fg: C.bg, d: 1.7 },
  ];
  bricks.forEach(b => {
    const q = P(t, b.d, b.d + 0.55);
    if (q <= 0) return;
    const yy = b.y - (1 - E.back(q)) * 500;
    ctx.save(); ctx.globalAlpha = clamp(q * 3);
    rr(130, yy - 70, 820, 140, 26); ctx.fillStyle = b.bg; ctx.fill();
    ctx.strokeStyle = hexA(C.text, 0.2); ctx.lineWidth = 2; ctx.stroke();
    txt(b.s, 540, yy, { s: 46, w: 800, c: b.fg });
    ctx.restore();
  });
  const o = { s: 46, w: 700 };
  segsRise([['After I ', C.text], ['[CURRENT HABIT]', C.acc], [',', C.text]], 540, 1300, t, 2.6, o);
  segsRise([['I will ', C.text], ['[NEW HABIT]', C.acc2], ['.', C.text]], 540, 1370, t, 2.8, o);
  riseTxt('Stack them and a routine builds itself.', 540, 1500, t, 3.3, { s: 34, w: 500, c: C.dim });
}

function icon(kind, x, y, col) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (kind === 'book') {
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(0, -28); ctx.quadraticCurveTo(22 * s, -40, 46 * s, -32);
      ctx.lineTo(46 * s, 30); ctx.quadraticCurveTo(22 * s, 22, 0, 32); ctx.closePath(); ctx.stroke();
    }
  } else if (kind === 'bottle') {
    rr(-18, -26, 36, 66, 10); ctx.stroke(); rr(-10, -42, 20, 14, 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-18, 4); ctx.lineTo(18, 4); ctx.stroke();
  } else if (kind === 'guitar') {
    ctx.rotate(0.6);
    circle(0, 20, 22); ctx.stroke(); circle(0, -6, 15); ctx.stroke();
    ctx.fillRect(-4, -52, 8, 32); circle(0, 18, 5); ctx.fill();
  } else if (kind === 'phone') {
    rr(-24, -40, 48, 80, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, 30); ctx.lineTo(6, 30); ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-40, 40); ctx.lineTo(40, -40); ctx.stroke();
  }
  ctx.restore();
}

function sEnv(t) {
  riseTxt('Environment', 540, 320, t, 0.25, { s: 96, w: 900 });
  riseTxt('beats motivation', 540, 425, t, 0.4, { s: 84, w: 900, c: C.acc });
  const items = [
    { ic: 'book', s: 'Book on your pillow' },
    { ic: 'bottle', s: 'Water bottle on your desk' },
    { ic: 'guitar', s: 'Guitar out of its case' },
    { ic: 'phone', s: 'Phone in another room', bad: true },
  ];
  items.forEach((it, i) => {
    const y = 650 + i * 200;
    const p = E.out(P(t, 0.6 + i * 0.35, 1.2 + i * 0.35));
    if (p <= 0) return;
    const off = -(1 - p) * 600;
    const col = it.bad ? C.red : C.acc2;
    ctx.save(); ctx.globalAlpha = p;
    rr(110 + off, y - 80, 860, 160, 26); ctx.fillStyle = C.bg2; ctx.fill();
    ctx.strokeStyle = it.bad ? hexA(C.red, 0.6) : hexA(C.text, 0.12); ctx.lineWidth = 3; ctx.stroke();
    if (!it.bad) blob(215 + off, y, 90, C.acc2, 0.25 + 0.1 * Math.sin(t * 4 + i));
    icon(it.ic, 215 + off, y, col);
    txt(it.s, 300 + off, y, { s: 42, w: 700, al: 'left' });
    ctx.restore();
  });
  riseTxt('Make good cues obvious.', 540, 1500, t, 2.4, { s: 46, w: 800, c: C.acc2 });
  riseTxt('Make bad cues invisible.', 540, 1570, t, 2.7, { s: 46, w: 800, c: C.red });
}

function sTwoMin(t) {
  riseTxt('The Two-Minute', 540, 320, t, 0.25, { s: 92, w: 900 });
  riseTxt('Rule', 540, 420, t, 0.4, { s: 92, w: 900, c: C.acc });
  const cx = 540, cy = 760, r = 190;
  const sc = E.back(P(t, 0.3, 0.9));
  const rem = 1 - P(t, 0.8, 3.8);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  ctx.lineWidth = 18; ctx.strokeStyle = hexA(C.text, 0.12); circle(0, 0, r); ctx.stroke();
  ctx.lineCap = 'round'; ctx.strokeStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 25;
  ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rem); ctx.stroke(); ctx.shadowBlur = 0;
  const secs = Math.ceil(120 * rem);
  txt(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, 0, -10, { s: 110, w: 900 });
  txt('JUST START', 0, 75, { s: 24, w: 800, ls: 6, c: C.dim });
  ctx.restore();
  const pairs = [['Read 30 books', 'Read one page'], ['Run a marathon', 'Put on your shoes'], ['Do yoga daily', 'Unroll the mat']];
  pairs.forEach((pr, i) => {
    const d = 0.9 + i * 0.4, r2 = rise(t, d, 0.5, 30), y = 1080 + i * 90 + r2.dy;
    ctx.save(); ctx.globalAlpha *= r2.a;
    txt(pr[0], 470, y, { s: 38, w: 500, c: C.dim, al: 'right' });
    const sp = E.inOut(P(t, d + 0.4, d + 0.8));
    const w = measure(pr[0], { s: 38, w: 500 });
    ctx.fillStyle = C.red; ctx.fillRect(470 - w - 6, y - 2, (w + 12) * sp, 4);
    txt('→', 540, y, { s: 40, w: 800, c: C.acc });
    txt(pr[1], 610, y, { s: 38, w: 800, c: C.acc2, al: 'left', a: P(t, d + 0.5, d + 0.9) });
    ctx.restore();
  });
  riseTxt('Master the habit of showing up.', 540, 1440, t, 2.6, { s: 50, w: 800 });
  riseTxt('A habit must be established', 540, 1515, t, 3.0, { s: 34, w: 500, c: C.dim });
  riseTxt('before it can be improved.', 540, 1560, t, 3.1, { s: 34, w: 500, c: C.dim });
}

function sMiss(t) {
  riseTxt('Never Miss', 540, 320, t, 0.25, { s: 96, w: 900 });
  riseTxt('Twice', 540, 420, t, 0.4, { s: 96, w: 900, c: C.acc });
  const cell = 100, gap = 18, gx = (W - (7 * cell + 6 * gap)) / 2, gy = 620, miss = 11, filled = 24;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  days.forEach((d, i) => txt(d, gx + i * (cell + gap) + cell / 2, 578, { s: 26, w: 800, c: C.dim, a: P(t, 0.3, 0.7) }));
  for (let i = 0; i < 28; i++) {
    const x = gx + (i % 7) * (cell + gap), y = gy + Math.floor(i / 7) * (cell + gap);
    ctx.save(); ctx.globalAlpha = P(t, 0.2, 0.6);
    rr(x, y, cell, cell, 18); ctx.fillStyle = hexA(C.text, 0.04); ctx.fill();
    ctx.strokeStyle = hexA(C.text, 0.15); ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    if (i >= filled) continue;
    const dt = 0.5 + i * 0.075, q = E.back(P(t, dt, dt + 0.3));
    if (q <= 0) continue;
    const mx = x + cell / 2, my = y + cell / 2;
    ctx.save(); ctx.translate(mx, my); ctx.scale(q, q);
    if (i === miss) {
      rr(-cell / 2, -cell / 2, cell, cell, 18); ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.stroke();
      ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-20, -20); ctx.lineTo(20, 20); ctx.moveTo(20, -20); ctx.lineTo(-20, 20); ctx.stroke();
    } else {
      rr(-cell / 2, -cell / 2, cell, cell, 18); ctx.fillStyle = i === miss + 1 ? C.acc2 : C.acc; ctx.fill();
      ctx.strokeStyle = C.bg; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-22, 2); ctx.lineTo(-6, 18); ctx.lineTo(24, -16); ctx.stroke();
    }
    ctx.restore();
    if (i === miss + 1 && t > dt + 0.3) {
      const pr = ((t - dt - 0.3) % 1.2) / 1.2;
      rr(x - pr * 24, y - pr * 24, cell + pr * 48, cell + pr * 48, 18 + pr * 10);
      ctx.strokeStyle = hexA(C.acc2, 0.8 * (1 - pr)); ctx.lineWidth = 4; ctx.stroke();
    }
  }
  riseTxt('Missing once is an accident.', 540, 1200, t, 2.4, { s: 46, w: 700 });
  riseTxt('Missing twice is the start', 540, 1275, t, 2.8, { s: 46, w: 700 });
  segsRise([['of a ', C.text], ['new habit.', C.red]], 540, 1340, t, 2.95, { s: 46, w: 700 });
  riseTxt('Don’t break the chain.', 540, 1480, t, 3.4, { s: 38, w: 700, c: C.acc2 });
}

function sOutro(t) {
  ctx.save(); ctx.globalAlpha = 0.25 * P(t, 0.5, 1.5);
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = C.text; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(540, 770, 380, 110, k * Math.PI / 3 + t * 0.2, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  const p = E.back(P(t, 0.3, 1.0));
  ctx.save(); ctx.translate(540, 770); ctx.scale(p, p);
  txt('1%', 0, 0, { s: 320, w: 900, c: C.acc, glow: C.acc, gb: 60 * (0.7 + 0.3 * Math.sin(t * 3)) });
  ctx.restore();
  riseTxt('better every day', 540, 975, t, 0.9, { s: 66, w: 800 });
  riseTxt('Small habits.', 540, 1150, t, 1.8, { s: 84, w: 900 });
  riseTxt('Big results.', 540, 1250, t, 2.2, { s: 84, w: 900, c: C.acc2 });
  riseTxt('SYSTEMS  ·  IDENTITY  ·  THE 4 LAWS', 540, 1400, t, 3.2, { s: 28, w: 700, c: C.dim, ls: 5 });
  riseTxt('Atomic Habits — James Clear', 540, 1560, t, 3.8, { s: 38, w: 600 });
}

// Durations must match SCENES in music.py.
const S = [
  { d: 6, tint: C.acc, draw: sIntro },
  { d: 10, tint: C.acc, label: '01 · THE 1% RULE', draw: sPercent },
  { d: 8, tint: C.acc2, label: '02 · THE PLATEAU', draw: sPlateau },
  { d: 8, tint: C.red, label: '03 · SYSTEMS > GOALS', draw: sSystems },
  { d: 9, tint: C.acc, label: '04 · IDENTITY', draw: sIdentity },
  { d: 9, tint: C.gold, label: '05 · THE HABIT LOOP', draw: sLoop },
  { d: 12, tint: C.acc, label: '06 · THE FOUR LAWS', draw: sLaws },
  { d: 5, tint: C.acc2, label: '07 · HABIT STACKING', draw: sStack },
  { d: 5, tint: C.acc2, label: '08 · ENVIRONMENT', draw: sEnv },
  { d: 5, tint: C.acc, label: '09 · TWO-MINUTE RULE', draw: sTwoMin },
  { d: 5, tint: C.red, label: '10 · NEVER MISS TWICE', draw: sMiss },
  { d: 8, tint: C.acc, draw: sOutro },
];
let acc = 0; for (const s of S) { s.t0 = acc; acc += s.d; }
const TOTAL = acc;

function chapter(label, t) {
  const r = rise(t, 0.15, 0.6, 20);
  const o = { s: 28, w: 700, ls: 6 };
  const w = measure(label, o);
  ctx.save(); ctx.globalAlpha *= r.a;
  txt(label, 540 + 3, 165 + r.dy, { ...o, c: C.dim });
  ctx.fillStyle = C.acc;
  ctx.fillRect(540 - w / 2 - 84, 164 + r.dy, 60, 3);
  ctx.fillRect(540 + w / 2 + 24, 164 + r.dy, 60, 3);
  ctx.restore();
}

function progress(T) {
  const x0 = 140, x1 = 940, y = 1830;
  ctx.save(); ctx.globalAlpha = P(T, 1, 2) * (1 - P(T, TOTAL - 2, TOTAL - 1));
  rr(x0, y, x1 - x0, 6, 3); ctx.fillStyle = hexA(C.text, 0.12); ctx.fill();
  rr(x0, y, (x1 - x0) * T / TOTAL, 6, 3); ctx.fillStyle = C.acc; ctx.fill();
  for (const s of S) { ctx.fillStyle = hexA(C.text, 0.35); ctx.fillRect(x0 + (x1 - x0) * s.t0 / TOTAL - 1, y - 5, 2, 16); }
  txt('ATOMIC HABITS · BOOK SUMMARY', 540, y - 38, { s: 20, w: 700, ls: 5, c: 'rgba(244,238,228,0.35)' });
  ctx.restore();
}

function wipe(T) {
  for (let i = 1; i < S.length; i++) {
    const q = P(T, S[i].t0 - 0.4, S[i].t0 + 0.4);
    if (q <= 0 || q >= 1) continue;
    const e = E.inOut(q), y = lerp(H + 800, -800, e);
    ctx.save(); ctx.translate(W / 2, y); ctx.rotate(-0.12);
    ctx.fillStyle = S[i].tint; ctx.fillRect(-W, -180, 2 * W, 360);
    ctx.fillStyle = C.text; ctx.fillRect(-W, 230, 2 * W, 26);
    ctx.fillStyle = hexA(C.text, 0.5); ctx.fillRect(-W, -260, 2 * W, 12);
    ctx.restore();
  }
}

function frame(T) {
  let i = S.findIndex(s => T < s.t0 + s.d); if (i < 0) i = S.length - 1;
  const s = S[i], t = T - s.t0;
  background(T, s.tint, i > 0 ? S[i - 1].tint : null, P(t, 0, 1.2));
  const out = i < S.length - 1 ? E.inOut(P(t, s.d - 0.45, s.d)) : 0;
  ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, -out * 80);
  s.draw(t, s.d);
  if (s.label) chapter(s.label, t);
  ctx.restore();
  progress(T);
  wipe(T);
  const black = Math.max(1 - P(T, 0, 0.6), P(T, TOTAL - 1.4, TOTAL - 0.2));
  if (black > 0) { ctx.fillStyle = `rgba(0,0,0,${black})`; ctx.fillRect(0, 0, W, H); }
}

window.TOTAL = TOTAL; window.FPS = FPS;
window.renderFrame = i => { frame(i / FPS); return cv.toDataURL('image/jpeg', 0.93); };

if (!location.search.includes('render')) {
  const t0 = performance.now();
  const loop = () => { frame(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); };
  loop();
}
