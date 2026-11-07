// Series branding for "قاعدة في الحياة" (A Rule in Life). Configured in script.json:
//   "lead": 1.8,                                   seconds of series intro before the speaker starts
//   "series":  { "ar": "قاعدة في الحياة", "en": "A RULE IN LIFE" },
//   "episode": { "ar": "<episode title>", "en": "<ENGLISH TITLE>" },
//   "endline": { "ar": "<one-line takeaway>", "en": "<ENGLISH>" }
// seriesIntro = shot 0 (full frame). seriesBadge = small top badge drawn by main.js during the episode.
// seriesEnd = end card overlay, called by the last shot.
import { ctx, W, H, clamp, lerp, seg, eo, eob, TAU, rnd } from './lib.js';
const GOLD = '#F6C453', NAVY = '#141A2E';

function seal(x, y, s, S, sweep) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.04);
  ctx.shadowColor = 'rgba(255,190,80,0.6)'; ctx.shadowBlur = 60;
  ctx.beginPath(); ctx.roundRect(-250, -190, 500, 380, 40); ctx.fillStyle = GOLD; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 10; ctx.strokeStyle = NAVY; ctx.beginPath(); ctx.roundRect(-222, -162, 444, 324, 26); ctx.stroke();
  ctx.fillStyle = NAVY; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 150px Cairo'; ctx.fillText('قاعدة', 0, -38); ctx.font = '900 76px Cairo'; ctx.fillText('في الحياة', 0, 82);
  if (sweep != null) { const g = ctx.createLinearGradient(sweep - 120, 0, sweep + 120, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = g; ctx.fillRect(-260, -200, 520, 400); }
  ctx.restore();
}
function rays(t, a) {
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 18; i++) { const an = i / 18 * TAU + t * 0.15, g = ctx.createLinearGradient(W / 2, 820, W / 2 + Math.cos(an) * 1400, 820 + Math.sin(an) * 1400); g.addColorStop(0, `rgba(255,214,140,${0.22 * a})`); g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.beginPath(); ctx.moveTo(W / 2, 820); ctx.lineTo(W / 2 + Math.cos(an - 0.05) * 1400, 820 + Math.sin(an - 0.05) * 1400); ctx.lineTo(W / 2 + Math.cos(an + 0.05) * 1400, 820 + Math.sin(an + 0.05) * 1400); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); }
  ctx.restore();
}
function motes(t, a) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 28; i++) { const x = rnd(i) * W, y = ((rnd(i + 3) * H - t * 40 * (0.5 + rnd(i + 1))) % H + H) % H, r = 3 + rnd(i + 5) * 9; const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5); g.addColorStop(0, `rgba(255,226,160,${0.7 * a})`); g.addColorStop(1, 'rgba(255,226,160,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); } ctx.restore(); }

/** full-frame series intro (shot 0). S = script */
export function seriesIntro(lt, d, t, S) {
  const g = ctx.createRadialGradient(W / 2, 820, 50, W / 2, 900, 1300); g.addColorStop(0, '#2A3156'); g.addColorStop(1, '#0B0F1E'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  rays(t, eo(seg(lt, 0, 0.6))); motes(t, 1);
  const s = eob(seg(lt, 0.05, 0.45)); if (s > 0) seal(W / 2, 820, s * lerp(1.0, 1.06, seg(lt, 0.4, d)), S, lt > 0.5 ? (lt - 0.5) * 900 - 300 : null);
  const ea = eo(seg(lt, 0.55, 0.95)); if (ea > 0 && S.episode) {
    ctx.save(); ctx.globalAlpha = ea; ctx.translate(W / 2, 1180 + (1 - ea) * 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.direction = 'rtl'; ctx.font = '900 88px Cairo'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 24; ctx.fillStyle = '#FFFFFF'; ctx.fillText(S.episode.ar, 0, 0, 980);
    if (S.episode.en) { ctx.direction = 'ltr'; ctx.font = '800 36px Inter'; ctx.letterSpacing = '8px'; ctx.fillStyle = GOLD; ctx.fillText(S.episode.en, 4, 96, 1000); }
    ctx.restore(); }
}
/** small series badge at the top of the frame (a = opacity) */
export function seriesBadge(a, S) {
  if (a <= 0 || !S.series) return; ctx.save(); ctx.globalAlpha = a * 0.92; ctx.font = '900 40px Cairo'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(S.series.ar).width + 70; ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, 175, w, 64, 32); ctx.fillStyle = 'rgba(14,18,34,0.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(246,196,83,0.85)'; ctx.stroke();
  ctx.fillStyle = GOLD; ctx.fillText(S.series.ar, W / 2, 209); ctx.restore();
}
/** end card overlay: seal + takeaway line. et = time since the end card started */
export function seriesEnd(et, t, S, y = 640) {
  if (et <= 0) return; const s = eob(seg(et, 0, 0.45)); ctx.save(); ctx.fillStyle = `rgba(8,10,20,${0.45 * eo(seg(et, 0, 0.5))})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  seal(W / 2, y, s * 0.72, S, et > 0.4 ? (et - 0.4) * 900 - 300 : null);
  const a = eo(seg(et, 0.4, 0.85)); if (a > 0 && S.endline) { ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, y + 250 + (1 - a) * 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.direction = 'rtl'; ctx.font = '900 92px Cairo'; ctx.shadowColor = 'rgba(30,10,20,0.9)'; ctx.shadowBlur = 30; ctx.fillStyle = GOLD; ctx.fillText(S.endline.ar, 0, 0, 1000);
    if (S.endline.en) { ctx.direction = 'ltr'; ctx.font = '800 38px Inter'; ctx.letterSpacing = '10px'; ctx.fillStyle = '#F4EBDA'; ctx.fillText(S.endline.en, 4, 100, 1000); } ctx.restore(); }
}
