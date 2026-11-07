// Style kit for our military news videos: "Sat-Map" (B) + "Paper Desk" (A).
// Everything is driven by one paused GSAP timeline so any frame can be rendered by seek(t).
(function () {
  const W = 1080, H = 1920;
  const master = gsap.timeline({ paused: true });
  const SFX = [];
  const mapItems = []; // screen-space items that follow the map camera
  const cam = { x: 0, y: 0, z: 1 };
  let MAP = null; // {img, w, h, base}

  const $ = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const layer = (id) => (typeof id === 'string' ? document.getElementById(id) : id);
  const at = (t) => Math.max(0, t);

  // ---------- tween helpers (always explicit, never immediateRender) ----------
  function ft(el, t, dur, from, to, ease = 'power2.out') {
    gsap.set(el, 'autoAlpha' in from ? { ...from, autoAlpha: 0 } : from);
    master.fromTo(el, from, { ...to, duration: dur, ease, immediateRender: false }, at(t));
  }
  function to(el, t, dur, vars, ease = 'power2.inOut') {
    master.to(el, { ...vars, duration: dur, ease }, at(t));
  }
  function set(el, t, vars) { master.set(el, vars, at(t)); }
  function show(el, t, dur = 0.35, kind = 'pop') {
    if (kind === 'pop') ft(el, t, dur, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1 }, 'back.out(2.2)');
    else if (kind === 'drop') ft(el, t, dur + 0.15, { autoAlpha: 0, y: 90, scale: 1.08 }, { autoAlpha: 1, y: 0, scale: 1 }, 'back.out(1.4)');
    else if (kind === 'slideR') ft(el, t, dur + 0.15, { autoAlpha: 1, xPercent: 140 }, { xPercent: 0 }, 'power3.out');
    else if (kind === 'slideL') ft(el, t, dur + 0.15, { autoAlpha: 1, xPercent: -140 }, { xPercent: 0 }, 'power3.out');
    else ft(el, t, dur, { autoAlpha: 0 }, { autoAlpha: 1 }, 'none');
  }
  function hide(el, t, dur = 0.25) { to(el, t, dur, { autoAlpha: 0 }, 'power1.in'); }
  function sfx(t, type, gain = 1) { SFX.push({ t: at(t), type, gain }); }

  // draw an SVG stroke on (path/line/ellipse)
  function draw(el, t, dur = 0.5, ease = 'power1.inOut') {
    const len = el.getTotalLength ? el.getTotalLength() : 2000;
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 });
    master.set(el, { autoAlpha: 1 }, at(t));
    master.fromTo(el, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease, immediateRender: false }, at(t));
  }

  // ---------- MAP (style B) ----------
  function initMap(src, w, h) {
    const base = H / h; // scale where image height fills the frame
    const world = $(`<div class="world" style="width:${w}px;height:${h}px"><img src="${src}" width="${w}" height="${h}"><svg class="mapsvg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"></svg></div>`);
    layer('map').appendChild(world);
    MAP = { world, svg: world.querySelector('svg'), w, h, base };
    return MAP;
  }
  function applyCam() {
    if (!MAP) return;
    const s = MAP.base * cam.z;
    const tx = W / 2 - cam.x * s, ty = H / 2 - cam.y * s;
    MAP.world.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
    for (const it of mapItems) {
      const sx = tx + it.x * s, sy = ty + it.y * s;
      it.el.style.left = sx + 'px'; it.el.style.top = sy + 'px';
    }
  }
  function camSet(t, x, y, z) { master.set(cam, { x, y, z }, at(t)); }
  function camTo(t, dur, x, y, z, ease = 'power2.inOut') { master.to(cam, { x, y, z, duration: dur, ease }, at(t)); }
  function project(x, y) { const s = MAP.base * cam.z; return [W / 2 + (x - cam.x) * s, H / 2 + (y - cam.y) * s]; }

  // screen-space map marker that follows the camera
  function mapItem(html, x, y, cls = '') {
    const el = $(`<div class="mapitem ${cls}">${html}</div>`);
    layer('mapitems').appendChild(el);
    gsap.set(el, { autoAlpha: 0 });
    const m = { el, x, y }; el._m = m; mapItems.push(m);
    return el;
  }
  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    (parent || MAP.svg).appendChild(el);
    gsap.set(el, { autoAlpha: 0 });
    return el;
  }
  // polyline path in map coords
  function mapPath(pts, style = {}) {
    const d = smooth(pts);
    return svgEl('path', { d, fill: 'none', stroke: style.stroke || '#f3e3b6', 'stroke-width': style.width || 3, 'stroke-linecap': 'round', ...(style.dash ? { 'data-dash': style.dash } : {}) });
  }
  function smooth(p) {
    if (p.length < 3) return `M${p[0][0]},${p[0][1]} L${p[1][0]},${p[1][1]}`;
    let d = `M${p[0][0]},${p[0][1]}`;
    for (let i = 1; i < p.length - 1; i++) {
      const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
      d += ` Q${p[i][0]},${p[i][1]} ${mx},${my}`;
    }
    const l = p[p.length - 1];
    return d + ` L${l[0]},${l[1]}`;
  }
  // dotted path: draw by revealing with a mask-like trick (animate dashoffset of a solid copy used as mask)
  function dottedPath(pts, color = '#fff', width = 3, gap = 10) {
    const id = 'm' + Math.random().toString(36).slice(2);
    const mask = svgEl('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: MAP.w, height: MAP.h });
    gsap.set(mask, { autoAlpha: 1 });
    const reveal = svgEl('path', { d: smooth(pts), fill: 'none', stroke: '#fff', 'stroke-width': 40 }, mask);
    const p = svgEl('path', { d: smooth(pts), fill: 'none', stroke: color, 'stroke-width': width, 'stroke-dasharray': `1 ${gap}`, 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke', mask: `url(#${id})` });
    p._reveal = reveal;
    return p;
  }
  function drawDotted(p, t, dur) { master.set(p, { autoAlpha: 1 }, at(t)); draw(p._reveal, t, dur); }
  function zone(x, y, r, color = 'rgba(246,205,64,.33)', stroke = 'rgba(246,205,64,.8)') {
    return svgEl('circle', { cx: x, cy: y, r, fill: color, stroke, 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' });
  }

  // ---------- icons (flat, white-outlined) ----------
  const ICON = {
    tanker: `<svg viewBox="0 0 120 40" width="120" height="40"><path d="M6 20 L22 4 H112 a4 4 0 0 1 4 4 V32 a4 4 0 0 1 -4 4 H22 Z" fill="#7a1f1f" stroke="#fff" stroke-width="3"/><rect x="90" y="9" width="16" height="22" rx="2" fill="#f2efe6"/><g fill="#c44">${[30, 44, 58, 72].map(x => `<circle cx="${x}" cy="20" r="5"/>`).join('')}</g><line x1="28" y1="20" x2="86" y2="20" stroke="#e8d9b0" stroke-width="2"/></svg>`,
    warship: `<svg viewBox="0 0 130 36" width="130" height="36"><path d="M4 18 L26 3 H118 L126 18 L118 33 H26 Z" fill="#5d6b78" stroke="#fff" stroke-width="3"/><rect x="58" y="10" width="26" height="16" rx="2" fill="#8c9aa6"/><rect x="88" y="13" width="12" height="10" fill="#8c9aa6"/><circle cx="40" cy="18" r="5" fill="#3b444c"/></svg>`,
    mine: `<svg viewBox="0 0 60 60" width="46" height="46"><g stroke="#fff" stroke-width="4">${[0, 45, 90, 135].map(a => `<line x1="30" y1="4" x2="30" y2="56" transform="rotate(${a} 30 30)"/>`).join('')}</g><circle cx="30" cy="30" r="17" fill="#1d1f22" stroke="#fff" stroke-width="3"/><g fill="#d33">${[0, 45, 90, 135].map(a => `<rect x="27" y="1" width="6" height="7" rx="2" transform="rotate(${a} 30 30)"/><rect x="27" y="52" width="6" height="7" rx="2" transform="rotate(${a} 30 30)"/>`).join('')}</g><circle cx="24" cy="24" r="4" fill="#666"/></svg>`,
    drone: `<svg viewBox="0 0 120 80" width="110" height="74"><path d="M60 6 C64 6 66 14 66 24 L66 34 L114 40 L114 46 L66 46 L64 62 L76 70 L76 74 L44 74 L44 70 L56 62 L54 46 L6 46 L6 40 L54 34 L54 24 C54 14 56 6 60 6 Z" fill="#c9cfd4" stroke="#fff" stroke-width="3"/><path d="M60 6 C64 6 66 14 66 24 L54 24 C54 14 56 6 60 6Z" fill="#7f8a93"/></svg>`,
    missile: `<svg viewBox="0 0 30 120" width="22" height="88"><path d="M15 2 C22 10 22 20 22 30 V96 L28 112 H2 L8 96 V30 C8 20 8 10 15 2Z" fill="#6b7a3a" stroke="#fff" stroke-width="3"/><rect x="8" y="40" width="14" height="6" fill="#e5c33d"/></svg>`,
    fire: `<svg viewBox="0 0 60 80" width="54" height="72"><path d="M30 4 C36 20 52 28 52 50 C52 66 42 76 30 76 C18 76 8 66 8 50 C8 38 16 32 20 22 C22 32 26 34 30 34 C28 22 26 14 30 4Z" fill="#ff6a1a" stroke="#fff" stroke-width="3"/><path d="M30 40 C34 48 42 52 42 60 C42 68 36 72 30 72 C24 72 18 68 18 60 C18 52 26 50 30 40Z" fill="#ffd23a"/></svg>`,
    smoke: `<svg viewBox="0 0 80 80" width="80" height="80"><g fill="rgba(40,40,40,.55)"><circle cx="40" cy="50" r="18"/><circle cx="26" cy="36" r="14"/><circle cx="50" cy="28" r="16"/><circle cx="38" cy="14" r="10"/></g></svg>`,
    pin: `<svg viewBox="0 0 40 52" width="34" height="44"><path d="M20 50 C20 50 4 30 4 18 A16 16 0 0 1 36 18 C36 30 20 50 20 50Z" fill="#e23b3b" stroke="#fff" stroke-width="3"/><circle cx="20" cy="18" r="6" fill="#fff"/></svg>`,
    signal: `<svg viewBox="0 0 60 50" width="56" height="46"><g fill="none" stroke="#7CFFB2" stroke-width="5" stroke-linecap="round"><path d="M8 20 A30 30 0 0 1 52 20"/><path d="M16 29 A19 19 0 0 1 44 29"/><path d="M24 38 A8 8 0 0 1 36 38"/></g><circle cx="30" cy="44" r="4" fill="#7CFFB2"/></svg>`,
    cross: `<svg viewBox="0 0 60 60" width="56" height="56"><g stroke="#ff3b3b" stroke-width="9" stroke-linecap="round"><line x1="10" y1="10" x2="50" y2="50"/><line x1="50" y1="10" x2="10" y2="50"/></g></svg>`,
    burst: `<svg viewBox="0 0 120 120" width="150" height="150"><path d="M60 4 L70 40 L104 18 L84 52 L118 62 L82 72 L100 106 L66 86 L56 118 L48 84 L14 100 L34 68 L2 56 L36 46 L18 14 L50 36 Z" fill="#ffb21e" stroke="#fff" stroke-width="3"/><circle cx="60" cy="60" r="18" fill="#fff3b0"/></svg>`,
    sam: `<svg viewBox="0 0 80 50" width="80" height="50"><rect x="6" y="30" width="68" height="14" rx="3" fill="#6b7a3a" stroke="#fff" stroke-width="3"/><g transform="rotate(-30 30 30)"><rect x="20" y="12" width="44" height="10" rx="3" fill="#8b9a4a" stroke="#fff" stroke-width="2"/><rect x="20" y="24" width="44" height="10" rx="3" fill="#8b9a4a" stroke="#fff" stroke-width="2"/></g><circle cx="20" cy="46" r="4" fill="#222"/><circle cx="60" cy="46" r="4" fill="#222"/></svg>`,
  };

  function icon(name, x, y, opts = {}) {
    const rot = opts.rot || 0, sc = (opts.scale || 1) * 1.5;
    return mapItem(`<div class="ic" style="transform:translate(-50%,-50%) rotate(${rot}deg) scale(${sc})">${ICON[name]}</div>`, x, y, opts.cls || '');
  }
  function mapLabel(text, x, y, opts = {}) {
    return mapItem(`<div class="maplabel ${opts.big ? 'big' : ''}" style="transform:translate(${opts.dx || -50}%,-50%)">${text}</div>`, x, y);
  }
  function mapTag(text, x, y, opts = {}) { // paper-style tag on the map
    return mapItem(`<div class="tag ${opts.cls || ''}" style="transform:translate(${opts.dx ?? -50}%,${opts.dy ?? -50}%)">${text}</div>`, x, y);
  }
  function target(x, y, size = 260) {
    return mapItem(`<div class="target" style="width:${size}px;height:${size}px"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="rgba(226,59,59,.15)" stroke="#ff4b4b" stroke-width="2.4" stroke-dasharray="7 5"/><circle cx="50" cy="50" r="22" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="4 4"/><g stroke="#ff4b4b" stroke-width="2"><line x1="50" y1="0" x2="50" y2="34"/><line x1="50" y1="66" x2="50" y2="100"/><line x1="0" y1="50" x2="34" y2="50"/><line x1="66" y1="50" x2="100" y2="50"/></g></svg></div>`, x, y);
  }
  function strike(x, y, t, opts = {}) { // target lock -> bomb drops -> shockwave
    const tg = target(x, y, opts.size || 260);
    ft(tg, t, 0.45, { autoAlpha: 0, scale: 2.2, rotation: -40 }, { autoAlpha: 1, scale: 1, rotation: 0 }, 'power3.out');
    to(tg.querySelector('svg'), t + 0.45, 1.6, { rotation: 90 }, 'none');
    sfx(t, 'lock');
    const bomb = mapItem(`<div class="ic c">${ICON.missile}</div>`, x, y);
    ft(bomb, t + 0.55, 0.45, { autoAlpha: 1, y: -700 }, { y: -40 }, 'power2.in');
    hide(bomb, t + 1.0, 0.05);
    const b = burst(x, y, t + 1.0);
    hide(tg, t + 1.9, 0.3);
    return { tg, b };
  }
  function burst(x, y, t, big = 1) {
    const b = mapItem(`<div class="ic c">${ICON.burst}</div>`, x, y);
    ft(b, t, 0.35, { autoAlpha: 1, scale: 0.2 * big }, { scale: 1.1 * big }, 'back.out(3)');
    to(b, t + 0.35, 0.5, { autoAlpha: 0, scale: 1.4 * big }, 'power1.in');
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const r = mapItem(`<div class="ring"></div>`, x, y);
      ft(r, t + i * 0.12, 0.9, { autoAlpha: 0.9, scale: 0.1 }, { autoAlpha: 0, scale: 1.6 * big }, 'power2.out');
      rings.push(r);
    }
    sfx(t, 'boom');
    return b;
  }
  function pulse(el, t, times = 2) {
    for (let i = 0; i < times; i++) {
      to(el, t + i * 0.7, 0.35, { scale: 1.18 }, 'sine.inOut');
      to(el, t + i * 0.7 + 0.35, 0.35, { scale: 1 }, 'sine.inOut');
    }
  }
  function pulseDot(x, y, color = '#ff3b3b') {
    return mapItem(`<div class="pdot" style="--c:${color}"><i></i><b></b><b class="b2"></b></div>`, x, y);
  }

  // ---------- DESK (style A) ----------
  function wipeIn(id, t, dur = 0.7) { // slanted page wipe from the right, with yellow edge line
    const el = layer(id), line = layer('wipeline');
    gsap.set(el, { autoAlpha: 1, clipPath: 'polygon(120% 0%, 140% 0%, 140% 100%, 110% 100%)' });
    master.fromTo(el, { autoAlpha: 1, clipPath: 'polygon(120% 0%, 140% 0%, 140% 100%, 110% 100%)' },
      { clipPath: 'polygon(-10% 0%, 140% 0%, 140% 100%, -20% 100%)', duration: dur, ease: 'power2.inOut', immediateRender: false }, at(t));
    master.fromTo(line, { autoAlpha: 1, x: 1250 }, { x: -260, duration: dur, ease: 'power2.inOut', immediateRender: false }, at(t));
    set(line, t + dur, { autoAlpha: 0 });
    sfx(t, 'whoosh');
  }
  function wipeOut(id, t, dur = 0.7) { // desk leaves to the left, revealing what is under it
    const el = layer(id), line = layer('wipeline');
    master.fromTo(el, { clipPath: 'polygon(-40% 0%, 120% 0%, 110% 100%, -40% 100%)' },
      { clipPath: 'polygon(-40% 0%, -10% 0%, -20% 100%, -40% 100%)', duration: dur, ease: 'power2.inOut', immediateRender: false }, at(t));
    master.fromTo(line, { autoAlpha: 1, x: 1250 }, { x: -260, duration: dur, ease: 'power2.inOut', immediateRender: false }, at(t));
    set(line, t + dur, { autoAlpha: 0 });
    set(el, t + dur, { autoAlpha: 0 });
    sfx(t, 'whoosh');
  }
  function deskEl(html, parent = 'desk') { const el = $(html); layer(parent).appendChild(el); gsap.set(el, { autoAlpha: 0 }); return el; }
  function card(src, { x, y, w, h, rot = 0, bw = false, label: label0 = '', parent = 'desk', fit = 'cover', pos = 'center' }) {
    let label = label0; if (src && window.ASSETS && !window.ASSETS.includes(src.split('/').pop())) { label = label || 'صورة'; src = null; }
    const img = src ? `<img src="${src}" style="object-fit:${fit};object-position:${pos};${bw ? 'filter:grayscale(1) contrast(1.1)' : ''}">` : `<div class="ph">${label}</div>`;
    return deskEl(`<div class="card" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg)">${img}</div>`, parent);
  }
  function sheets(x, y, w, h, n = 2, parent = 'desk') {
    let s = '';
    for (let i = n - 1; i >= 0; i--) s += `<div class="sheet" style="left:${x + i * 14 - 6}px;top:${y + i * 10}px;width:${w}px;height:${h}px;transform:rotate(${(i - 0.5) * 2.2}deg)"></div>`;
    return deskEl(`<div class="sheets">${s}</div>`, parent);
  }
  function title(text, { x, y, size = 92, parent = 'desk', align = 'center', color = '#111' }) {
    // yellow marker grows right-to-left behind the words
    return deskEl(`<div class="title" style="left:${x}px;top:${y}px;font-size:${size}px;color:${color};transform:translate(${align === 'center' ? '-50%' : '0'},0)"><span class="hl"></span><span class="tx">${text}</span></div>`, parent);
  }
  function titleIn(el, t, mark = true) {
    show(el, t, 0.3, 'fade');
    if (mark) ft(el.querySelector('.hl'), t + 0.15, 0.45, { scaleX: 0 }, { scaleX: 1 }, 'power2.out');
    else gsap.set(el.querySelector('.hl'), { scaleX: 0 });
    sfx(t + 0.15, 'marker', 0.6);
  }
  function tag(text, { x, y, parent = 'desk', cls = '', rot = 0 }) {
    return deskEl(`<div class="tag ${cls}" style="left:${x}px;top:${y}px;transform:translate(-50%,-50%) rotate(${rot}deg)">${text}</div>`, parent);
  }
  // hand-drawn shapes in a full-frame svg of a layer
  function ink(parent = 'desk') {
    const host = layer(parent);
    let svg = host.querySelector(':scope > svg.ink');
    if (!svg) { svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'ink'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); host.appendChild(svg); }
    return svg;
  }
  function inkPath(d, { parent = 'desk', stroke = '#f2c230', width = 7, dash = null } = {}) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', stroke); p.setAttribute('stroke-width', width); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    ink(parent).appendChild(p); gsap.set(p, { autoAlpha: 0 });
    if (dash) p.dataset.dash = dash;
    return p;
  }
  function ellipse(cx, cy, rx, ry, t, opts = {}) { // slightly open, hand-drawn loop
    const k = 0.55, a = (opts.tilt || -8) * Math.PI / 180;
    const pts = [];
    for (let i = 0; i <= 64; i++) { const th = -Math.PI / 2 + i / 64 * Math.PI * 2.12; const r = 1 + 0.04 * Math.sin(i * 0.7); pts.push([rx * r * Math.cos(th), ry * r * Math.sin(th)]); }
    const d = pts.map(([px, py], i) => { const X = cx + px * Math.cos(a) - py * Math.sin(a), Y = cy + px * Math.sin(a) + py * Math.cos(a); return (i ? 'L' : 'M') + X.toFixed(1) + ',' + Y.toFixed(1); }).join(' ');
    const p = inkPath(d, { parent: opts.parent, stroke: opts.color || '#f2c230', width: opts.width || 7 });
    draw(p, t, opts.dur || 0.5);
    sfx(t, 'marker', 0.5);
    return p;
  }
  function underline(x1, x2, y, t, opts = {}) {
    const d = `M${x1},${y} C${(x1 * 2 + x2) / 3},${y + 6} ${(x1 + x2 * 2) / 3},${y - 5} ${x2},${y + 2}`;
    const p = inkPath(d, { parent: opts.parent, stroke: opts.color || '#d63b3b', width: opts.width || 6 });
    draw(p, t, opts.dur || 0.35);
    return p;
  }
  function counter(el, t, dur, from, toV, fmt = (v) => Math.round(v)) {
    const o = { v: from };
    el.textContent = fmt(from);
    master.fromTo(o, { v: from }, { v: toV, duration: dur, ease: 'power2.out', immediateRender: false, onUpdate: () => { el.textContent = fmt(o.v); } }, at(t));
    sfx(t, 'tick', 0.5);
  }
  function waffle({ x, y, cell = 46, cols = 10, rows = 10, parent = 'desk' }) {
    let s = '';
    for (let i = 0; i < cols * rows; i++) s += `<i style="width:${cell - 8}px;height:${cell - 8}px"></i>`;
    return deskEl(`<div class="waffle" style="left:${x}px;top:${y}px;width:${cols * cell}px">${s}</div>`, parent);
  }
  function waffleFill(el, t, n, dur = 0.8) {
    const cells = [...el.querySelectorAll('i')].slice(0, n);
    cells.forEach((c, i) => master.set(c, { backgroundColor: '#151515' }, at(t + i / Math.max(1, n) * dur)));
  }
  function calendar(text, { x, y, parent = 'ui' }) {
    return deskEl(`<div class="cal" style="left:${x}px;top:${y}px"><div class="rings"><i></i><i></i></div><div class="cal-body">${text}</div></div>`, parent);
  }

  function seg(tin, tout, parent = 'desk') {
    const el = deskEl(`<div class="seg"><div class="paperbg"></div></div>`, parent);
    set(el, tin, { autoAlpha: 1 }); set(el, tout, { autoAlpha: 0 });
    return el;
  }
  const FLAG_US = `<svg viewBox="0 0 38 20" width="54" height="28" style="vertical-align:middle;margin-left:10px"><rect width="38" height="20" fill="#b22234"/>${[1, 3, 5, 7, 9, 11].map(i => `<rect y="${i * 20 / 13}" width="38" height="${20 / 13}" fill="#fff"/>`).join('')}<rect width="16" height="11" fill="#3c3b6e"/></svg>`;
  function moveAlong(el, t, dur, pts, ease = 'none') {
    const m = el._m; m.x = pts[0][0]; m.y = pts[0][1];
    master.to(m, { keyframes: pts.slice(1).map(([x, y]) => ({ x, y })), duration: dur, ease }, at(t));
  }
  function fall(el, t) { // shot-down: drop, spin, fade
    const ic = el.firstElementChild;
    master.fromTo(ic, { y: 0, rotation: 0, autoAlpha: 1 }, { y: 160, rotation: 70, autoAlpha: 0, duration: 0.9, ease: 'power2.in', immediateRender: false }, at(t));
  }

  // ---------- DARK title card ----------
  function darkTitle(text, sub, t, dur, opts = {}) {
    const el = layer('dark');
    const box = deskEl(`<div class="darktitle"><div class="title dk" style="font-size:${opts.size || 104}px"><span class="hl"></span><span class="tx">${text}</span></div>${sub ? `<div class="darksub">${sub}</div>` : ''}</div>`, 'dark');
    ft(el, t, 0.35, { autoAlpha: 0 }, { autoAlpha: 1 }, 'none');
    show(box, t + 0.05, 0.4, 'fade');
    ft(box, t, dur, { scale: 1.0 }, { scale: 1.06 }, 'none');
    const hl = box.querySelector('.hl');
    if (opts.mark !== false) ft(hl, t + 0.35, 0.5, { scaleX: 0 }, { scaleX: 1 }, 'power2.out'); else gsap.set(hl, { scaleX: 0 });
    const ul = deskEl(`<div class="dk-ul"></div>`, 'dark');
    ft(ul, t + 0.7, 0.35, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1 }, 'power2.out');
    hide(el, t + dur, 0.35); hide(box, t + dur + 0.35, 0.01); hide(ul, t + dur + 0.35, 0.01);
    sfx(t, 'hit');
    return box;
  }

  // ---------- captions ----------
  function captions(rows) {
    for (const r of rows) {
      const el = deskEl(`<div class="cap"><span>${r.text}</span></div>`, 'captions');
      ft(el, r.start, 0.14, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1 }, 'power2.out');
      set(el, r.end, { autoAlpha: 0 });
    }
  }

  // slow push-in on whatever is active
  function drift(el, t, dur, s0 = 1, s1 = 1.04) { master.fromTo(el, { scale: s0 }, { scale: s1, duration: dur, ease: 'none', immediateRender: false }, at(t)); }

  window.K = { seg, FLAG_US, moveAlong, fall, W, H, master, SFX, cam, ICON, $, layer, ft, to, set, show, hide, sfx, draw, initMap, applyCam, camSet, camTo, project, mapItem, svgEl, mapPath, dottedPath, drawDotted, zone, icon, mapLabel, mapTag, target, strike, burst, pulse, pulseDot, wipeIn, wipeOut, deskEl, card, sheets, title, titleIn, tag, inkPath, ellipse, underline, counter, waffle, waffleFill, calendar, darkTitle, captions, drift };
  window.seek = (t) => { master.seek(t, false); applyCam(); };
})();
