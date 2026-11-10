// Ep.02 "العرب وجائزة نوبل" — satirical monologue (original voice), Paper Desk only, navy/gold brand
(function () {
  const { ft, to, set, show, hide, sfx, wipeIn, wipeOut, deskEl, title, titleIn, tag, inkPath, ellipse, underline, counter, waffle, waffleFill, calendar, darkTitle, captions, drift, draw, layer, master } = K;
  const rows = TL.rows, R = (n) => rows[n - 1].start;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // centred element helper
  function P(html, x, y, parent, extra = '') {
    const el = deskEl(`<div class="pos" style="left:${x}px;top:${y}px;${extra}">${html}</div>`, parent);
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    return el;
  }
  function stamp(text, x, y, t, parent, rot = -10) {
    const el = deskEl(`<div class="stamp" style="left:${x}px;top:${y}px">${text}</div>`, parent);
    gsap.set(el, { xPercent: -50, yPercent: -50, rotation: rot });
    ft(el, t, 0.28, { autoAlpha: 0, scale: 2.4 }, { autoAlpha: 1, scale: 1 }, 'power4.in');
    sfx(t + 0.25, 'hit', 0.8);
    return el;
  }
  function num(text, x, y, size, parent, color = '#fbdb9a') {
    const el = deskEl(`<div class="num" style="left:${x}px;top:${y}px;font-size:${size}px;color:${color}">${text}</div>`, parent);
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    return el;
  }
  // ---- segment manager: alternate desk / desk2 with the gold page wipe ----
  let curLayer = 'desk', curSeg = null;
  function newSeg(t, mode = 'wipe') {
    const target = mode === 'cut' ? curLayer === 'desk' ? 'desk2' : 'desk' : curLayer === 'desk' ? 'desk2' : 'desk';
    const s = deskEl('<div class="seg"><div class="paperbg"></div></div>', target);
    set(s, t, { autoAlpha: 1 });
    if (mode === 'wipe') {
      if (target === 'desk2') wipeIn('desk2', t); else wipeOut('desk2', t);
    } else if (mode === 'cut') {
      if (target === 'desk2') set(layer('desk2'), t, { autoAlpha: 1, clipPath: 'polygon(-40% 0%, 120% 0%, 110% 100%, -40% 100%)' });
      else set(layer('desk2'), t, { autoAlpha: 0 });
    }
    if (curSeg) set(curSeg, t + 0.75, { autoAlpha: 0 });
    curLayer = target; curSeg = s;
    return s;
  }
  // first segment on the base desk
  curSeg = deskEl('<div class="seg"><div class="paperbg"></div></div>', 'desk');
  gsap.set(curSeg, { autoAlpha: 1 });
  let S = curSeg;

  // ===== 1-4: 12 Nobel prizes in 125 years =====
  const t1 = title('جائزة نوبل', { x: 540, y: 170, parent: S, size: 100 }); titleIn(t1, R(1) + 0.1);
  const medal = P(IC.medal(300), 380, 580, S); show(medal, R(2), 0.4, 'drop'); drift(medal, R(2), 5, 1, 1.05);
  const cal125 = calendar('125 سنة', { x: 800, y: 560, parent: S }); show(cal125, R(4) + 0.2);
  const n12 = num('0', 540, 930, 190, S); show(n12, R(3), 0.2, 'fade'); counter(n12, R(3), 0.9, 0, 12);
  const minis = P(`<div style="display:flex;gap:12px">${Array(12).fill(IC.medalMini(60)).join('')}</div>`, 540, 1170, S);
  show(minis, R(3) + 0.4, 0.3, 'fade');
  [...minis.firstElementChild.children].forEach((m, i) => ft(m, R(3) + 0.4 + i * 0.06, 0.25, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1 }, 'back.out(3)'));
  sfx(R(3) + 0.4, 'tick'); sfx(R(3) + 0.8, 'tick');

  // ===== 5-8: half a billion people -> 12 =====
  S = newSeg(R(5) - 0.2);
  const n500 = num('0', 540, 300, 118, S); show(n500, R(5) + 0.2, 0.2, 'fade'); counter(n500, R(5) + 0.2, 2.6, 0, 500000000, fmt);
  const half = tag('نص مليار بني آدم', { x: 540, y: 430, parent: S, cls: 'y big' }); show(half, R(6) + 0.2);
  const crowd = P(`<div style="display:grid;grid-template-columns:repeat(12,58px);gap:14px 12px">${Array(60).fill(IC.person(44)).join('')}</div>`, 540, 760, S);
  show(crowd, R(5) + 0.3, 0.1, 'fade');
  [...crowd.firstElementChild.children].forEach((p, i) => ft(p, R(5) + 0.3 + i * 0.035, 0.2, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0 }));
  const box = deskEl('<div class="box" style="left:150px;top:1040px;width:780px;height:230px"></div>', S); show(box, R(8), 0.3, 'drop');
  const n12b = deskEl(`<div class="num" style="left:600px;top:1060px;font-size:150px">12</div>`, S); show(n12b, R(8) + 0.2);
  const m12 = P(`<div style="display:grid;grid-template-columns:repeat(6,56px);gap:8px">${Array(12).fill(IC.medalMini(52)).join('')}</div>`, 380, 1155, S); show(m12, R(8) + 0.3, 0.3);
  const arr = inkPath('M540,960 C540,990 540,1010 540,1030', { parent: S, stroke: '#f7b52c', width: 10 }); draw(arr, R(8) - 0.1, 0.3);
  ellipse(540, 1155, 420, 150, R(8) + 1.2, { parent: S });

  // ===== 9-12: the Netherlands =====
  S = newSeg(R(9) - 0.2);
  const nl = P(IC.flag('nl', 300), 540, 320, S); show(nl, R(9), 0.4);
  const tnl = title('هولندا', { x: 540, y: 470, parent: S, size: 84 }); titleIn(tnl, R(9) + 0.2);
  const n18 = num('0', 540, 660, 104, S); show(n18, R(10), 0.2, 'fade'); counter(n18, R(10), 1.2, 0, 18000000, fmt);
  const n18l = tag('نسمة', { x: 540, y: 760, parent: S }); show(n18l, R(10) + 0.6);
  // bar chart: Arabs 12 vs NL 21
  const chart = deskEl('<div class="pos" style="left:140px;top:820px;width:800px;height:470px"></div>', S); show(chart, R(11) - 0.1, 0.1, 'fade');
  const barA = deskEl('<div class="bar" style="left:120px;height:230px;background:#f7b52c"></div>', chart);
  const barN = deskEl('<div class="bar" style="left:460px;height:400px;background:#ff8a1f"></div>', chart);
  ft(barA, R(11), 0.7, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1 }, 'power3.out');
  ft(barN, R(11) + 0.3, 0.9, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1 }, 'power3.out');
  const lA = num('12', 370, 1005, 90, S); const lN = num('21', 710, 835, 90, S);
  show(lA, R(11) + 0.6); show(lN, R(11) + 1.1); sfx(R(11) + 1.1, 'pop');
  const capA = tag('العرب · 500 مليون', { x: 370, y: 1330, parent: S, cls: 'big' }), capN = tag('هولندا · 18 مليون', { x: 710, y: 1330, parent: S, cls: 'big' });
  gsap.set([capA, capN], { fontSize: 34 }); capA.style.fontSize = capN.style.fontSize = '34px';
  show(capA, R(11) + 0.2); show(capN, R(11) + 0.5);
  ellipse(710, 1010, 170, 250, R(12) + 0.1, { parent: S });

  // ===== 13-18: half of "our" prizes = foreign passports, foreign labs =====
  S = newSeg(R(13) - 0.2);
  const t4 = title('الجوايز «العربية»', { x: 540, y: 170, parent: S, size: 86 }); titleIn(t4, R(13));
  const grid = P(`<div style="display:grid;grid-template-columns:repeat(6,110px);gap:24px">${Array(12).fill(IC.medalMini(100)).join('')}</div>`, 540, 480, S);
  show(grid, R(14), 0.2, 'fade');
  const gm = [...grid.firstElementChild.children];
  gm.forEach((m, i) => ft(m, R(14) + i * 0.05, 0.25, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1 }, 'back.out(3)'));
  gm.forEach((m, i) => { if ([1, 3, 5, 6, 8, 10].includes(i)) to(m, R(15) + 0.2, 0.3, { opacity: 0.25 }); });
  const nusf = tag('نصها تقريبًا', { x: 540, y: 700, parent: S, cls: 'y big' }); show(nusf, R(15) + 0.1);
  const pUS = P(`<div style="position:relative">${IC.passport(220, '#1b3d8f')}<div style="position:absolute;right:-30px;top:-20px">${IC.flag('us', 120)}</div></div>`, 320, 1040, S);
  const pEU = P(`<div style="position:relative">${IC.passport(220, '#7a1f3d')}<div style="position:absolute;right:-30px;top:-20px">${IC.flag('eu', 120)}</div></div>`, 760, 1040, S);
  show(pUS, R(16) + 0.2, 0.35, 'drop'); show(pEU, R(16) + 0.9, 0.35, 'drop'); sfx(R(16) + 0.2, 'pop'); sfx(R(16) + 0.9, 'pop');
  [pUS, pEU, nusf].forEach((e) => hide(e, R(17) + 0.1));
  const flask = P(IC.flask(250), 540, 1030, S); show(flask, R(17) + 0.3, 0.35, 'drop');
  const fl = [['us', 270, 900], ['de', 820, 900], ['fr', 280, 1180], ['nl', 810, 1180]].map(([c, x, y], i) => { const f = P(IC.flag(c, 120), x, y, S); show(f, R(18) + 0.2 + i * 0.15); return f; });
  const lab = tag('مختبرات أجنبية', { x: 540, y: 1300, parent: S, cls: 'big' }); show(lab, R(18) + 0.6);

  // ===== 19-24: Arab by origin, the credit goes to those who opened the doors =====
  S = newSeg(R(19) - 0.2);
  const dna = P(IC.dna(200), 280, 560, S); show(dna, R(19), 0.4, 'drop');
  const ta = tag('عربي ✓', { x: 280, y: 330, parent: S, cls: 'y big' }); show(ta, R(19) + 0.6);
  const tg = tag('بالأصل والجينات', { x: 280, y: 810, parent: S, cls: 'big' }); show(tg, R(20) + 0.1);
  const items = [['التعليم', R(21)], ['البحث', R(21) + 0.7], ['تطوير الذكاء', R(22) + 0.2]];
  items.forEach(([txt, t], i) => {
    const it = deskEl(`<div class="tag big" style="left:760px;top:${390 + i * 150}px;display:flex;align-items:center;gap:14px">${txt}${IC.flag(i === 1 ? 'eu' : 'us', 70)}</div>`, S);
    gsap.set(it, { xPercent: -50, yPercent: -50 }); show(it, t);
  });
  sfx(R(21), 'pop'); sfx(R(21) + 0.7, 'pop'); sfx(R(22) + 0.2, 'pop');
  const door = P(IC.door(260), 600, 1060, S); show(door, R(23), 0.4, 'drop'); sfx(R(23), 'whoosh', 0.5);
  const fadl = tag('الفضل', { x: 600, y: 860, parent: S, cls: 'y big' }); show(fadl, R(23) + 0.4);
  ellipse(600, 1060, 230, 260, R(24) + 0.6, { parent: S });

  // ===== 25-26: dark card =====
  darkTitle('وقتنا ضيق للعلم', '', R(25), R(27) - R(25) - 0.3, { size: 96 });

  // ===== 27-31: busy with civil wars =====
  S = newSeg(R(27) - 0.4, 'cut');
  const calD = calendar('هاليومين', { x: 540, y: 260, parent: S }); show(calD, R(27));
  stamp('حروب أهلية', 540, 520, R(28) + 0.1, S, -8);
  [[220, 430], [860, 470], [300, 640]].forEach(([x, y], i) => { const b = P(IC.burst(110), x, y, S); ft(b, R(28) + 0.3 + i * 0.15, 0.3, { autoAlpha: 0, scale: 0.2 }, { autoAlpha: 1, scale: 1 }, 'back.out(3)'); });
  sfx(R(28) + 0.4, 'boom', 0.5);
  stamp('معارك داخلية', 560, 760, R(29) + 0.1, S, 6);
  const fk = P(IC.flask(170), 360, 1090, S), bl = P(IC.bulb(150), 720, 1090, S);
  show(fk, R(30) + 0.3, 0.35, 'drop'); show(bl, R(30) + 0.5, 0.35, 'drop');
  const xx1 = inkPath('M220,950 L880,1240', { parent: S, stroke: '#e23b3b', width: 14 }), xx2 = inkPath('M880,950 L220,1240', { parent: S, stroke: '#e23b3b', width: 14 });
  draw(xx1, R(31) + 0.5, 0.3); draw(xx2, R(31) + 0.8, 0.3); sfx(R(31) + 0.5, 'marker');

  // ===== 32-35: the real agenda =====
  S = newSeg(R(32) - 0.2);
  const tb = title('الأجندة', { x: 540, y: 170, parent: S, size: 100 }); titleIn(tb, R(32));
  const notes = [['موالد', 300, 430, -6, R(32) + 0.3], ['مجالس عزاء', 740, 560, 5, R(33)], ['مسيرات تأييد', 360, 720, -4, R(34)], ['فزعات', 760, 880, 7, R(35)], ['قَسَمات', 300, 1030, -5, R(35) + 0.6], ['ثارات', 720, 1180, 4, R(35) + 1.2]];
  notes.forEach(([txt, x, y, r, t]) => { const n = tag(txt, { x, y, parent: S, cls: 'big', rot: r }); n.style.fontSize = '64px'; n.style.padding = '6px 36px 14px'; show(n, t, 0.3); sfx(t, 'pop'); });

  // ===== 36-38: no time for Nobel nonsense =====
  S = newSeg(R(36) - 0.2);
  const nt = tag('ما عنا وقت', { x: 540, y: 220, parent: S, cls: 'y big' }); show(nt, R(36));
  const md2 = P(IC.medal(300), 540, 580, S); show(md2, R(36) + 0.4, 0.4, 'drop');
  stamp('خزعبلات', 540, 640, R(37) + 0.3, S, -14);
  const inv = P(`<div style="display:flex;gap:60px;align-items:center">${IC.bulb(120)}${IC.phone(80)}${IC.plane(130)}</div>`, 540, 1130, S);
  show(inv, R(38) + 0.1, 0.35, 'drop');
  const st = inkPath('M170,1130 L910,1130', { parent: S, stroke: '#e23b3b', width: 14 }); draw(st, R(38) + 1.2, 0.4);

  // ===== 39-42: the sheikh's quote =====
  S = newSeg(R(39) - 0.2);
  const qm = P(IC.quote(200), 540, 300, S); show(qm, R(39), 0.3);
  const who = tag('أحد الشيوخ الباحثين', { x: 540, y: 470, parent: S, cls: 'dark big' }); show(who, R(40));
  const qbox = deskEl('<div class="box" style="left:90px;top:580px;width:900px;height:620px"></div>', S); show(qbox, R(41) - 0.2, 0.3, 'drop');
  const ql1 = deskEl('<div class="numlabel" style="left:0;right:0;top:680px;text-align:center;font-size:66px;font-weight:900;line-height:1.5">«نحنا اصطفانا الله<br>عن خلقه</div>', S); show(ql1, R(41), 0.4, 'fade');
  const ql2 = title('بالإيمان السليم»', { x: 540, y: 1000, parent: S, size: 74 }); titleIn(ql2, R(42));

  // ===== 43-47: the nations of the earth =====
  S = newSeg(R(43) - 0.2);
  const globe = P(IC.globe(380), 540, 640, S); show(globe, R(43), 0.4, 'drop'); drift(globe, R(43), 6, 1, 1.06);
  const tshu = tag('شعوب الأرض', { x: 540, y: 270, parent: S, cls: 'y big' }); show(tshu, R(43) + 0.3);
  [['jp', 230, 450, R(44)], ['cn', 850, 450, R(44) + 0.7], ['us', 180, 760, R(45)], ['fr', 900, 760, R(46)], ['de', 540, 960, R(46) + 0.6]].forEach(([c, x, y, t]) => { const f = P(IC.flag(c, 170), x, y, S); show(f, t); sfx(t, 'pop'); });
  const facs = P(`<div style="display:flex;gap:30px">${IC.factory(200)}${IC.factory(200)}${IC.factory(200)}</div>`, 540, 1180, S); show(facs, R(47), 0.35, 'drop');

  // ===== 48-52: they make, we use =====
  S = newSeg(R(48) - 0.2);
  const fac = P(IC.factory(300), 300, 420, S); show(fac, R(48), 0.35, 'drop');
  const sakh = tag('مسخّرين', { x: 300, y: 250, parent: S, cls: 'y big' }); show(sakh, R(48) + 0.5);
  const bulb2 = P(IC.bulb(120), 640, 380, S); show(bulb2, R(49) + 0.2); sfx(R(49) + 0.2, 'pop');
  const me = P(IC.person(160, '#f7b52c'), 800, 1080, S); show(me, R(50), 0.35, 'drop');
  const nahna = tag('نحنا نستخدم', { x: 800, y: 1290, parent: S, cls: 'big' }); show(nahna, R(50) + 0.4);
  const belt = inkPath('M360,560 C420,760 560,820 700,960', { parent: S, stroke: '#fbdb9a', width: 6 }); belt.setAttribute('stroke-dasharray', '4 14'); show(belt, R(50) + 0.2, 0.3, 'fade');
  [[IC.plane(130), 330, 760, R(51)], [IC.car(150), 520, 700, R(51) + 0.7], [IC.ship(160), 260, 1000, R(52)], [IC.pill(120), 480, 950, R(52) + 0.5], [IC.phone(70), 620, 1150, R(52) + 1.0]].forEach(([h, x, y, t]) => { const o = P(h, x, y, S); show(o, t); sfx(t, 'pop'); });

  // ===== 53-56: "and they all go to hell" (his satire) =====
  S = newSeg(R(53) - 0.2);
  const glow = deskEl('<div style="position:absolute;left:0;right:0;bottom:0;height:900px;background:radial-gradient(ellipse at 50% 100%, rgba(255,90,30,.7), rgba(255,90,30,0) 70%)"></div>', S);
  const flags = [['jp', 180], ['cn', 360], ['us', 540], ['fr', 720], ['de', 900]].map(([c, x], i) => { const f = P(IC.flag(c, 150), x, 520, S); show(f, R(53) + i * 0.1); return f; });
  const hasab = tag('حسب «الشيخ»', { x: 540, y: 300, parent: S, cls: 'dark big' }); show(hasab, R(53) + 0.4);
  show(glow, R(54) + 0.2, 0.8, 'fade');
  flags.forEach((f, i) => ft(f, R(54) + 0.6 + i * 0.12, 1.1, { y: 0, rotation: 0 }, { y: 700, rotation: (i % 2 ? 40 : -40), autoAlpha: 0 }, 'power2.in'));
  [200, 420, 640, 860].forEach((x, i) => { const fi = P(IC.fire(110), x, 1200, S); show(fi, R(54) + 0.8 + i * 0.1); });
  sfx(R(54) + 0.6, 'whoosh');
  const huda = tag('«على غير طريق الهدى القويم»', { x: 540, y: 760, parent: S, cls: 'red big' }); show(huda, R(56));

  // ===== 57-59: our green road to paradise =====
  S = newSeg(R(57) - 0.2);
  const road = deskEl(`<svg class="pos" style="left:0;top:0" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><radialGradient id="gate" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d6"/><stop offset=".5" stop-color="#f7b52c"/><stop offset="1" stop-color="rgba(247,181,44,0)"/></radialGradient></defs><circle cx="540" cy="420" r="300" fill="url(#gate)" opacity=".8"/><path d="M440 1340 L640 1340 L560 520 L520 520Z" fill="#2fa86a" stroke="#c9ffe2" stroke-width="4"/><path d="M540 1330 L540 530" stroke="#fff" stroke-width="6" stroke-dasharray="30 30"/><path d="M430 520 L430 380 Q540 250 650 380 L650 520" fill="none" stroke="#fff" stroke-width="10"/></svg>`, S);
  show(road, R(57) + 0.2, 0.6, 'fade');
  const walker = P(IC.person(90, '#f6ecd9'), 540, 1200, S); show(walker, R(57) + 0.6);
  to(walker, R(58), 3, { y: -560, scale: 0.4 }, 'power1.inOut');
  const tkh = tag('طريقنا خضراء', { x: 820, y: 1050, parent: S, cls: 'big' }); show(tkh, R(58));
  const jan = title('جنات النعيم', { x: 540, y: 200, parent: S, size: 90 }); titleIn(jan, R(59));

  // ===== 60-63: 75% agree =====
  S = newSeg(R(60) - 0.2);
  const n75 = num('0%', 540, 260, 170, S); show(n75, R(60), 0.2, 'fade'); counter(n75, R(60), 1.2, 0, 75, (v) => Math.round(v) + '%');
  const wf = waffle({ x: 290, y: 400, cell: 50, parent: S }); show(wf, R(60) + 0.1, 0.2, 'fade'); waffleFill(wf, R(60) + 0.3, 75, 1.4);
  wf.querySelectorAll('i').forEach((c) => (c.style.borderColor = '#fbdb9a'));
  const ok1 = tag('صحيح ✓', { x: 330, y: 1000, parent: S, cls: 'big' }), ok2 = tag('دقيق ✓', { x: 750, y: 1000, parent: S, cls: 'big' });
  show(ok1, R(62)); show(ok2, R(62) + 0.4); sfx(R(62), 'pop'); sfx(R(62) + 0.4, 'pop');
  stamp('غير قابل للنقاش', 540, 1200, R(63) + 0.3, S, -6);

  // ===== 64-66: closing line =====
  const dt = darkTitle('تنعّموا بالديباج', '', R(64), TL.duration - R(64) + 0.2, { size: 100 });
  const vic = deskEl('<div class="tag y big" style="left:540px;top:1040px;font-size:64px">في رحاب الانتصار</div>', 'dark');
  gsap.set(vic, { xPercent: -50, yPercent: -50 }); show(vic, R(66)); hide(vic, TL.duration + 0.5, 0.2);

  // ===== end card =====
  const fadeOut = deskEl('<div style="position:absolute;inset:0;background:#010b1a"></div>', 'captions');
  ft(fadeOut, TL.duration + 0.3, 0.5, { autoAlpha: 0 }, { autoAlpha: 1 }, 'none');
  const endc = deskEl(`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:50px"><img src="../../engine/logo.jpg" style="width:640px;border-radius:40px;border:6px solid #fff;box-shadow:0 20px 60px rgba(247,181,44,.25)"><div class="tag y big" style="position:static;font-size:64px">تابعنا</div></div>`, 'captions');
  ft(endc, TL.duration + 0.6, 0.6, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1 }, 'back.out(1.6)');
  sfx(TL.duration + 0.6, 'whoosh', 0.7);

  captions(rows);
  gsap.set(layer('desk'), { autoAlpha: 1, clipPath: 'none' });
  gsap.set([layer('desk2'), layer('dark'), layer('map')], { autoAlpha: 0 });
  window.DURATION = TL.duration + 3.0;
  window.ready = Promise.all([document.fonts.ready, ...[...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))]).then(() => { window.seek(0); return true; });
})();
