export const T = { dur: 0, lines: [] };
export async function loadTiming() {
  const s = await (await fetch('script.json', { cache: 'no-store' })).json();
  T.lines = s.lines.map((l, i) => ({ i, start: l.s, end: l.e, ...l })); T.dur = s.duration; return T;
}
export const L = (i) => T.lines[i].start;
export const Le = (i) => T.lines[i].end;
/** time word k of line i is spoken */
export const Wt = (i, k) => T.lines[i].wt[k];
