// Ep.01 "هرمز يشعل" — scenes keyed to caption rows (TL.rows[n-1].start)
(function () {
  const { ft, to, set, show, hide, sfx, draw, initMap, camSet, camTo, mapItem, mapPath, dottedPath, drawDotted, zone, icon, mapLabel, mapTag,
    strike, burst, pulse, pulseDot, wipeIn, wipeOut, deskEl, card, sheets, title, titleIn, tag, inkPath, ellipse, underline, counter,
    waffle, waffleFill, calendar, darkTitle, captions, drift, seg, FLAG_US, moveAlong, fall, ICON, svgEl, layer, master } = K;
  const rows = TL.rows;
  const R = (n) => rows[n - 1].start;
  const A = 'assets/';

  // ---------- map base ----------
  const M = initMap(A + 'hormuz.jpg', 1920, 1496);
  const night = deskEl('<div class="night"></div>', 'map');
  deskEl('<div class="attrib">NASA Worldview / MODIS</div>', 'map'); set(document.querySelector('.attrib'), 0, { autoAlpha: 1 });
  // key places (image px)
  const P = { strait: [1262, 470], qeshm: [960, 405], suza: [1062, 418], sam: [985, 420], larak: [1195, 375], musandam: [1200, 565], abbas: [1150, 262] };
  const laneIn = [[1360, 1000], [1330, 760], [1290, 600], [1240, 520], [1130, 505], [980, 535], [780, 585], [520, 640], [180, 720]];
  const laneOut = laneIn.map(([x, y]) => [x + 22, y - 22]);
  const lane1 = mapPath(laneIn, { stroke: '#f3e3b6', width: 3 });
  const lane2 = mapPath(laneOut, { stroke: '#f3e3b6', width: 3 });
  const lblHormuz = mapLabel('مضيق هرمز', 1330, 440, { big: true, dx: 0 });
  const lblIran = mapLabel('إيران', 1300, 200, { big: true });
  const lblOman = mapLabel('عُمان', 1120, 760, { big: true });
  const lblGoO = mapLabel('خليج عُمان', 1560, 880);
  const lblQeshm = mapLabel('قشم', 900, 345, { big: true });
  const strDot = pulseDot(...P.strait);

  // ================= HOOK (rows 1-7) =================
  camSet(0, 1150, 760, 1.0);
  camTo(0, 1.7, 1250, 520, 1.6, 'power3.inOut');
  show(strDot, 0.3); pulse(strDot.firstElementChild, 0.6, 2);
  show(lblHormuz, 0.8, 0.35, 'fade');
  const tk1 = icon('tanker', 1300, 600, { rot: -60, scale: 0.75 }), tk2 = icon('tanker', 1235, 485, { rot: -20, scale: 0.75 });
  show(tk1, R(2)); show(tk2, R(2) + 0.15); sfx(R(2), 'pop');
  const mn1 = icon('mine', 1320, 625, { scale: 0.8 }), mn2 = icon('mine', 1255, 505, { scale: 0.8 });
  show(mn1, R(2) + 0.7); show(mn2, R(2) + 0.85);
  burst(1305, 605, R(2) + 1.4, 0.55); burst(1240, 488, R(2) + 1.6, 0.55);
  const f1 = icon('fire', 1300, 585, { scale: 0.8 }), f2 = icon('fire', 1235, 470, { scale: 0.8 });
  const s1 = icon('smoke', 1290, 545), s2 = icon('smoke', 1225, 430);
  [f1, f2, s1, s2].forEach((e, i) => show(e, R(3) + i * 0.08)); hide(mn1, R(3)); hide(mn2, R(3));
  // drone over Qeshm
  camTo(R(4), 1.1, 1010, 380, 2.0);
  hide(lblHormuz, R(4)); hide(strDot, R(4));
  const dr = icon('drone', 1070, 300, { scale: 0.9 });
  show(dr, R(4) + 0.4);
  const dx = icon('cross', 1070, 300);
  show(dx, R(4) + 1.2); sfx(R(4) + 1.2, 'hit', 0.6);
  fall(dr, R(4) + 1.45); hide(dx, R(4) + 1.9);
  const qRing = mapPath([[760, 470], [830, 425], [960, 372], [1100, 330], [1165, 330], [1150, 372], [1020, 425], [880, 470], [790, 490], [760, 470]], { stroke: '#ffffff', width: 4 });
  draw(qRing, R(5), 0.7); show(lblQeshm, R(5) + 0.2, 0.3, 'fade');
  strike(...P.sam, R(6) + 0.1);
  const calJune = calendar('أوّل مرّة من جوان', { x: 540, y: 330 });
  show(calJune, R(7), 0.35); hide(calJune, R(8) - 0.2);
  [tk1, tk2, f1, f2, s1, s2].forEach((e) => hide(e, R(8) - 0.3)); hide(qRing, R(8) - 0.3); hide(lblQeshm, R(8) - 0.3);

  // ================= STAKES (rows 8-12) — Paper Desk =================
  const d1 = seg(R(8) - 0.25, R(13) + 0.6);
  wipeIn('desk', R(8) - 0.25);
  const oil = card(A + 'oil.jpg', { x: 90, y: 300, w: 900, h: 560, rot: -1.5, parent: d1, label: 'برميل بترول' });
  show(oil, R(8) + 0.1, 0.4, 'drop'); drift(oil, R(8), 8.5);
  const t1 = title('سوم البترول', { x: 540, y: 150, parent: d1 }); titleIn(t1, R(8) + 0.3);
  const sh = sheets(110, 900, 860, 460, 1, d1); show(sh, R(9) - 0.2, 0.3, 'fade');
  const down = inkPath('M180,990 C300,1010 360,1080 430,1150 C470,1190 520,1225 580,1240', { parent: d1, stroke: '#d63b3b', width: 9 });
  draw(down, R(9) + 0.1, 0.9);
  const m9 = tag('-9%', { x: 640, y: 1250, parent: d1, cls: 'red big' }); show(m9, R(9) + 0.9); sfx(R(9) + 0.9, 'pop');
  const up = inkPath('M580,1240 C680,1220 760,1120 820,1030 C850,990 880,960 920,930', { parent: d1, stroke: '#011732', width: 9 });
  draw(up, R(10) + 0.05, 0.9);
  const head = inkPath('M880,925 L925,928 L912,970', { parent: d1, stroke: '#011732', width: 9 }); draw(head, R(10) + 0.9, 0.2);
  const n100 = deskEl('<div class="num" style="left:600px;top:930px;font-size:120px">0$</div>', d1);
  show(n100, R(10) + 0.4, 0.2, 'fade'); counter(n100, R(10) + 0.4, 1.2, 0, 100, (v) => Math.round(v) + '$');
  const ul100 = underline(600, 840, 1060, R(10) + 1.6, { parent: d1, color: '#f7b52c', width: 10 });
  const pocket = card(A + 'fuel.jpg', { x: 70, y: 520, w: 470, h: 600, rot: 4, parent: d1, label: 'جيبك' });
  show(pocket, R(11), 0.3, 'slideL'); sfx(R(11), 'whoosh', 0.6);
  ellipse(305, 820, 230, 300, R(12) + 0.1, { parent: d1 });
  const jt = tag('جيبك', { x: 305, y: 1180, parent: d1, cls: 'y big' }); show(jt, R(12) + 0.3);

  // ================= PIVOT (rows 13-14) =================
  darkTitle('شنوّة قاعد يصير؟', '', R(13), R(15) - R(13) - 0.35);
  set(layer('desk'), R(13) + 0.5, { autoAlpha: 0 });

  // ================= BACKSTORY (rows 15-20) — map =================
  camSet(R(13) + 0.4, 1240, 560, 1.6);
  camTo(R(15), 2.6, 1240, 600, 1.25);
  show(lblHormuz, R(15) + 0.3, 0.3, 'fade');
  show(lblIran, R(16)); show(lblOman, R(16) + 0.2); show(lblGoO, R(16) + 0.4, 0.3, 'fade');
  const width = mapPath([[1203, 560], [1196, 380]], { stroke: '#fff', width: 4 }); draw(width, R(16) + 0.5, 0.5);
  const wtag = mapTag('39 كم', 1200, 470, { dx: 10, cls: 'y' }); show(wtag, R(16) + 1.0);
  hide(wtag, R(17) + 0.3); hide(width, R(17) + 0.3);
  draw(lane1, R(17), 1.6); draw(lane2, R(17) + 0.2, 1.6); sfx(R(17), 'whoosh', 0.5);
  const fleet = [];
  for (let i = 0; i < 6; i++) {
    const s = icon('tanker', 0, 0, { rot: -40, scale: 0.42 });
    show(s, R(17) + 0.3 + i * 0.35, 0.25, 'fade');
    moveAlong(s, R(17) + 0.3 + i * 0.35, 6.5, (i % 2 ? laneOut : laneIn).slice(0, 7), 'none');
    hide(s, R(21) - 0.4); fleet.push(s);
  }
  const box1 = deskEl('<div class="box" style="left:140px;top:240px;width:800px;height:230px"></div>', 'ui');
  const n130 = deskEl('<div class="num" style="left:560px;top:265px;font-size:150px">0</div>', 'ui');
  const n130l = deskEl('<div class="numlabel" style="left:200px;top:320px">بابور في النهار</div>', 'ui');
  show(box1, R(18), 0.3, 'drop'); show(n130, R(18) + 0.1, 0.2, 'fade'); show(n130l, R(18) + 0.3, 0.2, 'fade');
  counter(n130, R(18) + 0.1, 1.3, 0, 130, (v) => '+' + Math.round(v));
  [box1, n130, n130l].forEach((e) => hide(e, R(19) - 0.1));
  const box2 = deskEl('<div class="box" style="left:140px;top:230px;width:800px;height:560px"></div>', 'ui');
  const wf = waffle({ x: 520, y: 300, cell: 40, parent: 'ui' });
  const n20 = deskEl('<div class="num" style="left:200px;top:330px;font-size:150px">20%</div>', 'ui');
  const n20l = deskEl('<div class="numlabel" style="left:200px;top:520px;font-size:48px">من بترول<br>العالم</div>', 'ui');
  show(box2, R(19), 0.3, 'drop'); show(wf, R(19) + 0.1, 0.2, 'fade'); waffleFill(wf, R(19) + 0.4, 20, 1.0);
  show(n20, R(19) + 1.2, 0.3); show(n20l, R(20), 0.2, 'fade'); sfx(R(19) + 1.2, 'pop');
  [box2, wf, n20, n20l].forEach((e) => hide(e, R(21) - 0.2));

  // ================= WAR START (rows 21-24) =================
  const d2 = seg(R(21) - 0.2, R(23) + 0.7);
  wipeIn('desk', R(21) - 0.2);
  const war = card(A + 'destroyer.jpg', { x: 90, y: 330, w: 900, h: 640, rot: 2, parent: d2, label: 'الحرب' });
  show(war, R(21), 0.4, 'drop'); drift(war, R(21), 3);
  const t2 = title('الحرب', { x: 540, y: 170, parent: d2 }); titleIn(t2, R(21) + 0.2);
  const cFeb = calendar('فيفري 2026', { x: 760, y: 1090, parent: d2 }); show(cFeb, R(22));
  wipeOut('desk', R(23) - 0.1);
  camSet(R(23) - 0.1, 1235, 500, 1.65);
  const barrier = mapPath([[1205, 585], [1215, 470], [1240, 330]], { stroke: '#ff3b3b', width: 9 });
  draw(barrier, R(23) + 0.4, 0.6); sfx(R(23) + 0.4, 'hit', 0.5);
  const mines = [[1270, 590], [1300, 640], [1230, 520], [1160, 510], [1100, 525], [1320, 700], [1250, 455], [1040, 540]].map(([x, y], i) => { const m = icon('mine', x, y, { scale: 0.65 }); show(m, R(24) + i * 0.12); return m; });
  sfx(R(24), 'pop'); sfx(R(24) + 0.5, 'pop');

  // ================= IRGC (rows 25-28) =================
  const d3 = seg(R(25) - 0.15, R(29) + 0.6);
  wipeIn('desk', R(25) - 0.15);
  const irgc = card(A + 'irgc.jpg', { x: 90, y: 270, w: 900, h: 560, rot: -2, parent: d3, label: 'الحرس الثوري' });
  show(irgc, R(25) + 0.1, 0.4, 'drop'); drift(irgc, R(25), 7);
  const tg = tag('الحرس الثوري', { x: 760, y: 280, parent: d3, cls: 'big', rot: -2 }); show(tg, R(25) + 0.6);
  const t3 = title('مسكّر', { x: 540, y: 120, parent: d3 }); titleIn(t3, R(26) + 0.2);
  const panel = deskEl('<div class="box" style="left:110px;top:900px;width:860px;height:400px"></div>', d3);
  show(panel, R(27), 0.3, 'drop');
  const n7 = deskEl('<div class="num" style="left:470px;top:925px;font-size:120px">7</div>', d3);
  const n7l = deskEl('<div class="numlabel" style="left:340px;top:960px">شروط</div>', d3);
  show(n7, R(28)); show(n7l, R(28) + 0.15, 0.2, 'fade');
  for (let i = 0; i < 7; i++) { const c = deskEl(`<div class="chk" style="left:${150 + i * 112}px;top:1130px"></div>`, d3); show(c, R(28) + 0.3 + i * 0.1, 0.25); }
  sfx(R(28) + 0.3, 'tick'); sfx(R(28) + 0.7, 'tick');

  // ================= BLOCKADE (rows 29-33) =================
  mines.forEach((m) => hide(m, R(29))); hide(barrier, R(29));
  wipeOut('desk', R(29) - 0.1);
  camSet(R(29) - 0.1, 1500, 860, 1.25);
  const ring = mapPath([[1250, 1150], [1420, 1010], [1580, 900], [1730, 780], [1880, 640]], { stroke: '#5ec8ff', width: 5 });
  draw(ring, R(29) + 0.3, 1.0);
  const wsh = [[1290, 1110], [1450, 990], [1610, 880], [1760, 760], [1880, 650]].map(([x, y], i) => { const w = icon('warship', x, y, { rot: -38, scale: 0.6 }); show(w, R(29) + 0.2 + i * 0.15); return w; });
  sfx(R(29) + 0.2, 'pop');
  const usTag = mapTag(`${FLAG_US}حصار بحري`, 1560, 1120, { cls: 'big' }); show(usTag, R(29) + 0.9);
  camTo(R(30), 1.2, 1460, 700, 1.0);
  hide(usTag, R(30));
  const abbas = pulseDot(...P.abbas, '#5ec8ff'); const lblAbbas = mapLabel('بندر عباس', 1150, 215);
  show(abbas, R(30) + 0.5); show(lblAbbas, R(30) + 0.6, 0.3, 'fade');
  const cJul = calendar('من جويلية', { x: 540, y: 330 }); show(cJul, R(31)); hide(cJul, R(32));
  const box3 = deskEl('<div class="box" style="left:190px;top:240px;width:700px;height:220px"></div>', 'ui');
  const n144 = deskEl('<div class="num" style="left:520px;top:262px;font-size:150px">0</div>', 'ui');
  const n144l = deskEl('<div class="numlabel" style="left:250px;top:320px">بابور رجع</div>', 'ui');
  show(box3, R(32), 0.3, 'drop'); show(n144, R(32) + 0.1, 0.2, 'fade'); show(n144l, R(32) + 0.3, 0.2, 'fade');
  counter(n144, R(32) + 0.1, 1.2, 0, 144);
  const tr1 = dottedPath([[1850, 1400], [1700, 1150], [1600, 1010], [1640, 1080], [1760, 1260]], '#fff', 4, 12);
  const tr2 = dottedPath([[1700, 1460], [1520, 1230], [1440, 1080], [1500, 1160], [1580, 1340]], '#fff', 4, 12);
  drawDotted(tr1, R(33), 1.4); drawDotted(tr2, R(33) + 0.2, 1.4);
  const endT = R(34) - 0.05;
  [box3, n144, n144l, abbas, lblAbbas, ring, tr1, tr2, ...wsh].forEach((e) => hide(e, endT));

  // ================= TURN (rows 34-35) =================
  darkTitle('فجأة... كل شي تبدّل', '', R(34), R(36) - R(34) - 0.3, { size: 92 });

  // ================= MONDAY: drone + strike on Qeshm (rows 36-46) =================
  camSet(R(34) + 0.6, 1010, 380, 2.0);
  [lblIran, lblOman, lblGoO, lblHormuz].forEach((e) => hide(e, R(34) + 0.4, 0.01));
  const cMon = calendar('الاثنين 2 نوفمبر', { x: 540, y: 330 }); show(cMon, R(36)); hide(cMon, R(38));
  const sam = icon('sam', ...P.sam, { scale: 0.9 }); show(sam, R(37));
  const dr2 = icon('drone', 1100, 285, { scale: 0.8 }); show(dr2, R(37) + 0.15);
  const arc = mapPath([[985, 410], [1010, 330], [1060, 295], [1095, 288]], { stroke: '#ff5a3c', width: 5 });
  draw(arc, R(37) + 0.6, 0.55); sfx(R(37) + 0.6, 'whoosh', 0.7);
  burst(1100, 285, R(37) + 1.15, 0.5); fall(dr2, R(37) + 1.3); hide(arc, R(37) + 1.6);
  strike(...P.sam, R(38) + 0.3);
  hide(sam, R(38) + 1.4);
  const lnTag = mapTag('منصّة صواريخ', 985, 500, { cls: 'red' }); show(lnTag, R(39)); hide(lnTag, R(41));
  const pinQ = icon('pin', 985, 395); show(pinQ, R(40));
  show(lblQeshm, R(40) + 0.1, 0.3, 'fade');
  camTo(R(41), 1.3, 1080, 470, 1.45);
  const qRing2 = mapPath([[760, 470], [830, 425], [960, 372], [1100, 330], [1165, 330], [1150, 372], [1020, 425], [880, 470], [790, 490], [760, 470]], { stroke: '#f7b52c', width: 6 });
  draw(qRing2, R(42), 0.8); sfx(R(42), 'marker', 0.6);
  const qFill = svgEl('path', { d: 'M760,470 Q830,425 895,398 Q960,372 1030,351 Q1100,330 1132,330 Q1165,330 1157,351 Q1150,372 1085,398 Q1020,425 950,447 Q880,470 835,480 Q790,490 760,470Z', fill: 'rgba(247,181,44,.35)' });
  show(qFill, R(43), 0.4, 'fade');
  const bigTag = mapTag('أكبر جزيرة في الخليج', 960, 560, { cls: 'y big' }); show(bigTag, R(43) + 0.2); hide(bigTag, R(44) + 0.6);
  const ar1 = mapPath([[1120, 400], [1180, 440], [1230, 500]], { stroke: '#fff', width: 5 });
  const ar2 = mapPath([[1110, 380], [1140, 360], [1190, 370]], { stroke: '#fff', width: 5 });
  draw(ar1, R(44) + 0.1, 0.5); draw(ar2, R(44) + 0.3, 0.5);
  show(strDot, R(44) + 0.5); pulse(strDot.firstElementChild, R(44) + 0.8, 2);
  const cone = mapItem(`<div class="cone" style="width:720px;height:420px;margin-top:-210px"><svg viewBox="0 0 720 420" width="720" height="420"><defs><radialGradient id="rg" cx="0" cy="0.5" r="1"><stop offset="0" stop-color="rgba(90,255,150,.55)"/><stop offset="1" stop-color="rgba(90,255,150,0)"/></radialGradient></defs><path d="M0,210 L720,0 A760,760 0 0 1 720,420 Z" fill="url(#rg)" stroke="rgba(120,255,170,.7)" stroke-width="2"/></svg></div>`, 1090, 400);
  ft(cone, R(45), 0.4, { autoAlpha: 0 }, { autoAlpha: 1 }, 'none');
  master.fromTo(cone.firstElementChild, { rotation: -25 }, { rotation: 35, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: 1, immediateRender: false }, R(45));
  const qEnd = R(47) - 0.1;
  [cone, ar1, ar2, qFill, qRing2, pinQ, lblQeshm, strDot].forEach((e) => hide(e, qEnd));

  // ================= TUESDAY: 4 tankers (rows 47-51) =================
  camTo(R(47) - 0.1, 1.0, 1340, 700, 1.55);
  const cTue = calendar('الثلاثاء', { x: 540, y: 330 }); show(cTue, R(47)); hide(cTue, R(52) - 0.1);
  const claim = tag('ادعاء إيراني', { x: 540, y: 470, parent: 'ui', cls: 'red big' }); show(claim, R(48) + 0.1);
  const four = [[1310, 700], [1385, 790], [1280, 840], [1410, 640]].map(([x, y], i) => { const t = icon('tanker', x, y, { rot: -55, scale: 0.6 }); show(t, R(49) + i * 0.15); return t; });
  sfx(R(49), 'pop');
  [[1310, 700], [1385, 790], [1280, 840], [1410, 640]].forEach(([x, y], i) => burst(x, y, R(50) + i * 0.18, 0.5));
  const fires4 = [[1310, 680], [1385, 770], [1280, 820], [1410, 620]].map(([x, y], i) => { const f = icon('fire', x, y, { scale: 0.65 }); show(f, R(50) + 0.3 + i * 0.18); return f; });
  const southTag = mapTag('جنوب المضيق', 1350, 940, { cls: 'big' }); show(southTag, R(51));
  [...four, ...fires4, southTag].forEach((e) => hide(e, R(52) - 0.1));

  // ================= TWO MORE (rows 52-59) =================
  camTo(R(52), 1.0, 1300, 540, 1.6);
  const cTwo = calendar('بعد يومين', { x: 540, y: 330 }); show(cTwo, R(52)); hide(cTwo, R(55));
  const tA = icon('tanker', 1420, 590, { rot: -50, scale: 0.7 }), tB = icon('tanker', 1250, 475, { rot: -15, scale: 0.7 });
  show(tA, R(53)); show(tB, R(53) + 0.2);
  const mA = icon('mine', 1440, 615, { scale: 0.7 }), mB = icon('mine', 1270, 495, { scale: 0.7 });
  show(mA, R(54)); show(mB, R(54) + 0.15);
  burst(1420, 590, R(54) + 0.6, 0.55); burst(1250, 475, R(54) + 0.8, 0.55); hide(mA, R(54) + 0.7); hide(mB, R(54) + 0.9);
  const fA = icon('fire', 1420, 570, { scale: 0.75 }), fB = icon('fire', 1250, 455, { scale: 0.75 });
  show(fA, R(54) + 0.9); show(fB, R(54) + 1.05);
  const sgA = icon('signal', 1420, 510), sgB = icon('signal', 1250, 395);
  show(sgA, R(55) + 0.1); show(sgB, R(55) + 0.25); sfx(R(55) + 0.1, 'tick'); sfx(R(55) + 0.3, 'tick');
  const xA = icon('cross', 1420, 510), xB = icon('cross', 1250, 395);
  show(xA, R(56) + 0.2); show(xB, R(56) + 0.35); sfx(R(56) + 0.2, 'hit', 0.4);
  [sgA, sgB, xA, xB].forEach((e) => hide(e, R(57)));
  to(tA, R(57), 0.4, { autoAlpha: 0.45 }); to(tB, R(57), 0.4, { autoAlpha: 0.45 });
  const route = dottedPath([[1120, 495], [1230, 500], [1300, 560], [1360, 680], [1420, 860]], '#ffffff', 5, 13);
  drawDotted(route, R(57) + 0.1, 1.4);
  set(route, R(58), { attr: { stroke: '#ff3b3b' } });
  const noTag = mapTag('موش مسموح', 1350, 760, { cls: 'red big', dx: -100 }); show(noTag, R(58));
  const usTag2 = mapTag(`${FLAG_US}بدعم أمريكي؟`, 1350, 860, { cls: 'big', dx: -100 }); show(usTag2, R(59) + 0.1);
  const twoEnd = R(60) - 0.15;
  [tA, tB, fA, fB, route, noTag, usTag2, claim].forEach((e) => hide(e, twoEnd));

  // ================= US SIDE + UKMTO (rows 60-66) =================
  const d4 = seg(R(60) - 0.15, R(67) + 0.6);
  wipeIn('desk', R(60) - 0.15);
  const mcm = card(A + 'mcm.jpg', { x: 90, y: 280, w: 900, h: 560, rot: 1.5, parent: d4, label: 'البحرية الأمريكية' });
  show(mcm, R(60) + 0.05, 0.4, 'drop'); drift(mcm, R(60), 4);
  const t4 = title('أمريكا تقول', { x: 540, y: 140, parent: d4 }); titleIn(t4, R(60) + 0.2);
  const mrow = deskEl(`<div class="minis" style="left:250px;top:930px">${[0, 1, 2].map(() => `<div style="transform:scale(1.8);margin:0 40px">${ICON.mine}</div>`).join('')}</div>`, d4);
  show(mrow, R(61), 0.3);
  const x1 = inkPath('M230,900 L850,1080', { parent: d4, stroke: '#d63b3b', width: 12 }), x2 = inkPath('M850,900 L230,1080', { parent: d4, stroke: '#d63b3b', width: 12 });
  draw(x1, R(61) + 0.6, 0.3); draw(x2, R(61) + 0.9, 0.3);
  const cAug = calendar('أوت 2026', { x: 540, y: 1220, parent: d4 }); show(cAug, R(62));
  [mcm, t4, mrow, x1, x2, cAug].forEach((e) => hide(e, R(63) + 0.35, 0.05));
  const pg = deskEl('<div class="box" style="left:100px;top:230px;width:880px;height:1100px;transform:rotate(-1.5deg)"></div>', d4);
  show(pg, R(63) - 0.05, 0.3, 'slideR'); sfx(R(63), 'whoosh', 0.6);
  const uk = tag('UKMTO', { x: 540, y: 340, parent: d4, cls: 'big dark' }); show(uk, R(63) + 0.3);
  const ukl = deskEl('<div class="numlabel" style="left:190px;top:410px;font-size:46px">الهيئة البحرية البريطانية</div>', d4); show(ukl, R(63) + 0.5, 0.2, 'fade');
  const cNov = calendar('من 1 نوفمبر ← توّا', { x: 540, y: 600, parent: d4 }); show(cNov, R(64));
  const ships5 = deskEl(`<div class="minis" style="left:135px;top:800px;gap:10px">${[0, 1, 2, 3, 4].map(() => `<div style="transform:scale(1.25);width:150px;height:60px;display:flex;align-items:center;justify-content:center">${ICON.tanker}</div>`).join('')}</div>`, d4);
  show(ships5, R(65), 0.3);
  const n5 = deskEl('<div class="num" style="left:480px;top:960px;font-size:170px">0</div>', d4); show(n5, R(65), 0.2, 'fade'); counter(n5, R(65), 0.8, 0, 5);
  const ul5 = underline(430, 650, 1170, R(65) + 0.9, { parent: d4, color: '#f7b52c', width: 12 });
  for (let i = 0; i < 5; i++) { const b = deskEl(`<div style="position:absolute;left:${150 + i * 160}px;top:745px;transform:scale(.6)">${ICON.burst}</div>`, d4); ft(b, R(66) + i * 0.15, 0.3, { autoAlpha: 0, scale: 0.1 }, { autoAlpha: 1, scale: 0.6 }, 'back.out(3)'); }
  sfx(R(66), 'boom', 0.5);

  // ================= FRIDAY (rows 67-74) =================
  wipeOut('desk', R(67) - 0.1);
  camSet(R(67) - 0.1, 1030, 420, 1.9);
  const cFri = calendar('الجمعة 6 نوفمبر', { x: 540, y: 330 }); show(cFri, R(67)); hide(cFri, R(68));
  const trc = card(A + 'trump.jpg', { x: 560, y: 200, w: 440, h: 540, rot: 3, parent: 'ui', label: 'ترامب', pos: 'center 20%' });
  show(trc, R(68), 0.35, 'slideR'); sfx(R(68), 'whoosh', 0.6);
  ellipse(780, 400, 170, 200, R(68) + 0.8, { parent: 'ui' });
  strike(...P.suza, R(69) + 0.1, { size: 230 });
  const suza = mapTag('سوزا', 1062, 490, { cls: 'red' }); show(suza, R(69) + 1.2);
  const minor = tag('«ضربات صغيرة»', { x: 540, y: 880, parent: 'ui', cls: 'y big' }); show(minor, R(70) + 0.1); sfx(R(70) + 0.1, 'pop');
  [trc, minor, suza].forEach((e) => hide(e, R(71)));
  hide(document.querySelector('#ui > svg.ink'), R(71));
  ft(night, R(71), 0.6, { autoAlpha: 0 }, { autoAlpha: 1 }, 'none');
  const claim2 = tag('ادعاء إيراني', { x: 540, y: 330, parent: 'ui', cls: 'red big' }); show(claim2, R(72));
  const sam2 = icon('sam', ...P.sam, { scale: 0.9 }); show(sam2, R(72) + 0.1);
  const dr3 = icon('drone', 1100, 290, { scale: 0.85 }); show(dr3, R(73));
  const mq = mapLabel('MQ-9', 1100, 225, { big: true }); show(mq, R(73) + 0.2, 0.3, 'fade');
  const arc2 = mapPath([[985, 410], [1010, 330], [1060, 300], [1095, 292]], { stroke: '#ff5a3c', width: 5 });
  draw(arc2, R(73) + 0.6, 0.5); sfx(R(73) + 0.6, 'whoosh', 0.7);
  burst(1100, 290, R(73) + 1.1, 0.5); fall(dr3, R(73) + 1.25); hide(arc2, R(73) + 1.4); hide(mq, R(74) + 0.2);
  const qRing3 = mapPath([[760, 470], [830, 425], [960, 372], [1100, 330], [1165, 330], [1150, 372], [1020, 425], [880, 470], [790, 490], [760, 470]], { stroke: '#f7b52c', width: 6 });
  draw(qRing3, R(74), 0.6);
  [sam2, qRing3, claim2].forEach((e) => hide(e, R(75) - 0.15)); hide(night, R(75) + 0.5);

  // ================= COUNTER-POINT (rows 75-81) =================
  const d5 = seg(R(75) - 0.15, R(83) - 0.1);
  wipeIn('desk', R(75) - 0.15);
  const trBig = card(A + 'trump.jpg', { x: 120, y: 230, w: 840, h: 680, rot: -1.5, parent: d5, label: 'ترامب', pos: 'center 20%' });
  show(trBig, R(75) + 0.05, 0.4, 'drop'); drift(trBig, R(75), 10);
  const prog = tag('«تقدّم كبير»', { x: 700, y: 1000, parent: d5, cls: 'y big' }); show(prog, R(76) + 0.1);
  const upA = inkPath('M420,1060 L470,980 L520,1060 M470,980 L470,1130', { parent: d5, stroke: '#1d8f4e', width: 12 }); draw(upA, R(76) + 0.4, 0.4);
  [prog, upA].forEach((e) => hide(e, R(77)));
  const hs = card(A + 'handshake.jpg', { x: 70, y: 560, w: 560, h: 420, rot: -4, parent: d5, label: 'وساطة' });
  show(hs, R(77), 0.3, 'slideL');
  const tW = tag('واشنطن', { x: 210, y: 1100, parent: d5, cls: 'big' }), tD = tag('الدوحة', { x: 540, y: 1100, parent: d5, cls: 'y big' }), tT = tag('طهران', { x: 870, y: 1100, parent: d5, cls: 'big' });
  show(tD, R(77) + 0.3); show(tW, R(78)); show(tT, R(78) + 0.15);
  const l1 = inkPath('M440,1100 L320,1100', { parent: d5, stroke: '#f7b52c', width: 6 }), l2 = inkPath('M640,1100 L760,1100', { parent: d5, stroke: '#f7b52c', width: 6 });
  draw(l1, R(78) + 0.3, 0.3); draw(l2, R(78) + 0.45, 0.3);
  [hs, tW, tD, tT, l1, l2].forEach((e) => hide(e, R(79)));
  const trBW = card(A + 'trump.jpg', { x: 120, y: 230, w: 840, h: 680, rot: -1.5, parent: d5, label: 'ترامب', bw: true, pos: 'center 20%' });
  show(trBW, R(79), 0.5, 'fade'); drift(trBW, R(79), 4, 1.01, 1.04);
  underline(200, 880, 960, R(80) + 0.2, { parent: d5, width: 9 });
  const thr = tag('«يدمّر اللي بقى من إيران»', { x: 540, y: 1120, parent: d5, cls: 'red big' }); show(thr, R(81) + 0.1); sfx(R(81) + 0.1, 'hit', 0.5);

  // ================= PAYOFF (rows 82-87) =================
  darkTitle('الأيام الجاية', '', R(82), R(83) - R(82) - 0.1, { size: 104 });
  const d6 = seg(R(83) - 0.1, R(86) + 0.8);
  set(layer('desk'), R(83) - 0.1, { autoAlpha: 1, clipPath: 'polygon(-40% 0%, 120% 0%, 110% 100%, -40% 100%)' });
  const deal = card(A + 'handshake.jpg', { x: 60, y: 330, w: 460, h: 560, rot: -3, parent: d6, label: 'اتفاق' });
  const warc = card(A + 'destroyer.jpg', { x: 560, y: 330, w: 460, h: 560, rot: 3, parent: d6, label: 'حرب' });
  show(deal, R(83), 0.35, 'drop'); show(warc, R(84), 0.35, 'drop'); sfx(R(84), 'whoosh', 0.5);
  const tDeal = tag('اتفاق', { x: 290, y: 960, parent: d6, cls: 'big' }), tWar = tag('حرب', { x: 790, y: 960, parent: d6, cls: 'big red' });
  show(tDeal, R(83) + 0.3); show(tWar, R(84) + 0.3);
  const ck1 = deskEl('<div class="chk" style="left:253px;top:1040px"></div>', d6), ck2 = deskEl('<div class="chk" style="left:753px;top:1040px"></div>', d6);
  show(ck1, R(83) + 0.5); show(ck2, R(84) + 0.5);
  const q = title('؟', { x: 540, y: 1030, parent: d6, size: 150 }); titleIn(q, R(85) + 0.1);
  wipeOut('desk', R(86) - 0.1);
  camSet(R(86) - 0.1, 1240, 600, 1.1);
  camTo(R(86) - 0.1, 2.9, 1262, 480, 1.7, 'power2.inOut');
  show(strDot, R(86) + 0.2); pulse(strDot.firstElementChild, R(86) + 0.5, 3);
  show(lblHormuz, R(87), 0.3, 'fade');

  // ================= CTA (rows 88-92) =================
  const d7 = seg(R(88) - 0.15, 999);
  wipeIn('desk', R(88) - 0.15);
  const mapCard = card(A + 'hormuz.jpg', { x: 120, y: 420, w: 840, h: 760, rot: -1.5, parent: d7, pos: '62% 35%' });
  show(mapCard, R(88), 0.4, 'drop'); drift(mapCard, R(88), 6);
  [[540, 400, 540, 200], [540, 400, 300, 230], [540, 400, 780, 230], [540, 400, 160, 340], [540, 400, 920, 340]].forEach(([x1, y1, x2, y2], i) => {
    const p = inkPath(`M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 60} ${x2},${y2}`, { parent: d7, stroke: '#f7b52c', width: 6 });
    p.setAttribute('stroke-dasharray', '2 12'); gsap.set(p, { autoAlpha: 0 }); show(p, R(88) + 0.3 + i * 0.12, 0.2, 'fade');
  });
  ellipse(540, 800, 300, 330, R(90), { parent: d7 });
  const nxt = tag('الحلقة الجاية', { x: 540, y: 1270, parent: d7, cls: 'y big' }); show(nxt, R(91));
  const trS = card(A + 'trump.jpg', { x: 650, y: 980, w: 330, h: 330, rot: 5, parent: d7, label: 'ترامب', pos: 'center 20%' });
  show(trS, R(92), 0.3, 'slideR');
  const qq = title('؟', { x: 560, y: 1050, parent: d7, size: 150 }); titleIn(qq, R(92) + 0.4);
  const fadeOut = deskEl('<div style="position:absolute;inset:0;background:#000"></div>', 'captions');
  ft(fadeOut, TL.duration + 0.1, 0.6, { autoAlpha: 0 }, { autoAlpha: 1 }, 'none');

  const endc = deskEl(`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:50px"><img src="../../engine/logo.jpg" style="width:640px;border-radius:40px;border:6px solid #fff;box-shadow:0 20px 60px rgba(247,181,44,.25)"><div class="tag y big" style="position:static;font-size:64px">تابعنا</div></div>`, 'captions');
  ft(endc, TL.duration + 0.6, 0.6, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1 }, 'back.out(1.6)');
  sfx(TL.duration + 0.6, 'whoosh', 0.7);
  captions(rows);
  gsap.set([layer('desk'), layer('dark')], { autoAlpha: 0 });
  window.DURATION = TL.duration + 3.2;
  window.ready = Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))]).then(() => { window.seek(0); return true; });
})();
