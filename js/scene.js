// Builds the animated AR scene in the browser from a template + invitation data,
// and exports it as a GLB blob URL for <model-viewer>.
import * as THREE from 'three';
import { GLTFExporter } from '../lib/GLTFExporter.js';
import { getTemplate, templateArt, svgDoc, O } from './templates.js';
import { T, longDate, weekday } from './i18n.js';

const SYS = '"PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Noto Sans Devanagari", "Kohinoor Devanagari", sans-serif';
const FONT_TEXT = 'Jost, "Noto Sans Sinhala", "Noto Sans Tamil", ' + SYS;
const FONT_NAMES = '"Great Vibes", "Noto Sans Sinhala", "Noto Sans Tamil", ' + SYS;

let fontsReady = null;
export function loadFonts(base = '') {
  if (fontsReady) return fontsReady;
  const list = [['Jost', 'jost-400', '400'], ['Jost', 'jost-500', '500'], ['Jost', 'jost-600', '600'], ['Great Vibes', 'greatvibes', '400'],
    ['Noto Sans Sinhala', 'sinhala-400', '400'], ['Noto Sans Sinhala', 'sinhala-600', '600'], ['Noto Sans Tamil', 'tamil-400', '400'], ['Noto Sans Tamil', 'tamil-600', '600']];
  fontsReady = Promise.all(list.map(([fam, file, w]) => {
    const f = new FontFace(fam, `url(${base}fonts/${file}.woff2)`, { weight: w });
    return f.load().then(ff => document.fonts.add(ff)).catch(() => {});
  }));
  return fontsReady;
}

/* ---------- raster helpers ---------- */
export function svgToCanvas(svg) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); res(c); };
    img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
function fitFont(ctx, text, maxW, size, weight, family, min = 26) {
  let s = size;
  do { ctx.font = `${weight} ${s}px ${family}`; if (ctx.measureText(text).width <= maxW) return s; s -= 2; } while (s > min);
  return s;
}
function clipText(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0, -1);
  return text + '…';
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

/* ---------- speech bubble ---------- */
const ICONS = {
  ring: (c, a) => { c.lineWidth = 9; c.strokeStyle = O; c.beginPath(); c.arc(0, 12, 26, 0, 7); c.stroke(); c.lineWidth = 4; c.strokeStyle = '#ffd66b'; c.stroke();
    c.beginPath(); c.moveTo(-16, -16); c.lineTo(0, -34); c.lineTo(16, -16); c.lineTo(0, -6); c.closePath(); c.fillStyle = '#bfe8ff'; c.fill(); c.lineWidth = 5; c.strokeStyle = O; c.stroke(); },
  cal: (c, a, day) => { rr(c, -30, -26, 60, 56, 9); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 6; c.strokeStyle = O; c.stroke(); rr(c, -30, -26, 60, 18, 7); c.fillStyle = a; c.fill(); c.stroke();
    c.fillStyle = O; c.font = `600 24px ${FONT_TEXT}`; c.textAlign = 'center'; c.fillText(day || '', 0, 22); c.textAlign = 'left'; },
  clock: (c, a) => { c.beginPath(); c.arc(0, 0, 32, 0, 7); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 6; c.strokeStyle = O; c.stroke();
    c.beginPath(); c.moveTo(0, -18); c.lineTo(0, 0); c.lineTo(13, 9); c.strokeStyle = a; c.lineCap = 'round'; c.stroke(); },
  pin: (c, a) => { const p = new Path2D('M0 36 C-18 14 -28 2 -28 -10 a28 28 0 0 1 56 0 c0 12 -10 24 -28 46Z'); c.fillStyle = a; c.fill(p); c.lineWidth = 6; c.strokeStyle = O; c.stroke(p);
    c.beginPath(); c.arc(0, -10, 10, 0, 7); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 5; c.stroke(); },
  heart: (c, a) => { c.save(); c.translate(-34, -32); c.scale(.27, .27); const p = new Path2D('M128 222 C40 160 10 112 14 72 C18 30 52 10 86 12 C108 14 122 28 128 44 C134 28 148 14 170 12 C204 10 238 30 242 72 C246 112 216 160 128 222Z');
    c.fillStyle = a; c.fill(p); c.lineWidth = 22; c.strokeStyle = O; c.stroke(p); c.restore(); }
};
export const BUBBLE_TIPS = { L: [740, 425], R: [160, 425], C: [450, 428] };
export function drawBubble({ side, icon, l1, big, l2, colors, day }) {
  const W = 900, H = 440, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const x0 = 20, y0 = 20, w = 860, h = 320, tx = side === 'L' ? 640 : side === 'R' ? 260 : 450, tip = BUBBLE_TIPS[side];
  const shape = () => { x.beginPath(); x.roundRect(x0, y0, w, h, 60); x.moveTo(tx - 55, y0 + h - 4); x.lineTo(tip[0], tip[1]); x.lineTo(tx + 55, y0 + h - 4); };
  x.save(); x.translate(8, 10); x.globalAlpha = .22; x.fillStyle = O; rr(x, x0, y0, w, h, 60); x.fill(); x.beginPath(); x.moveTo(tx - 55, y0 + h - 4); x.lineTo(tip[0], tip[1]); x.lineTo(tx + 55, y0 + h - 4); x.fill(); x.restore();
  x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = O; x.fillStyle = '#fff';
  rr(x, x0, y0, w, h, 60); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(tx - 55, y0 + h - 4); x.lineTo(tip[0], tip[1]); x.lineTo(tx + 55, y0 + h - 4); x.fill(); x.stroke();
  x.fillRect(tx - 50, y0 + h - 18, 100, 16);
  x.beginPath(); x.arc(120, y0 + h / 2, 62, 0, 7); x.fillStyle = colors.accent2 + '44'; x.fill();
  x.save(); x.translate(120, y0 + h / 2); ICONS[icon](x, colors.accent, day); x.restore();
  const tx0 = 208, maxW = 860 - 188 - 46;
  x.textBaseline = 'alphabetic';
  // lay out: small line, big text (1 or 2 lines), small line - centred vertically in the bubble
  const rows = [];
  if (l1) { const sz = fitFont(x, l1, maxW, 46, 500, FONT_TEXT, 28); rows.push({ text: l1, sz, w: 500, col: '#6f5a52', gap: 14 }); }
  let bsz = fitFont(x, big, maxW, 78, 600, FONT_TEXT, 30);
  if (bsz < 64 && big.includes(' ')) {           // wrap into two lines
    const words = big.split(' '); let best = null;
    for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
      x.font = `600 70px ${FONT_TEXT}`; const m = Math.max(x.measureText(a).width, x.measureText(b).width); if (!best || m < best.m) best = { a, b, m }; }
    const sz = Math.min(fitFont(x, best.a, maxW, 66, 600, FONT_TEXT, 30), fitFont(x, best.b, maxW, 66, 600, FONT_TEXT, 30));
    rows.push({ text: best.a, sz, w: 600, col: colors.accent, gap: 6 }, { text: best.b, sz, w: 600, col: colors.accent, gap: 12 });
  } else rows.push({ text: big, sz: bsz, w: 600, col: colors.accent, gap: 12 });
  if (l2) { const sz = fitFont(x, l2, maxW, 40, 500, FONT_TEXT, 24); rows.push({ text: l2, sz, w: 500, col: O, gap: 0 }); }
  const total = rows.reduce((a, r, i) => a + r.sz * 1.0 + (i < rows.length - 1 ? r.gap : 0), 0);
  let y = y0 + h / 2 - total / 2;
  for (const r of rows) { y += r.sz * 0.86; x.font = `${r.w} ${r.sz}px ${FONT_TEXT}`; x.fillStyle = r.col; x.fillText(clipText(x, r.text, maxW), tx0, y); y += r.sz * 0.14 + r.gap; }
  return c;
}

/* ---------- names banner ---------- */
export function drawBanner(names, dateLine, colors) {
  const W = 1200, H = 330, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.lineJoin = 'round'; x.lineWidth = 9; x.strokeStyle = O;
  const poly = (pts, fill) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.fillStyle = fill; x.fill(); x.stroke(); };
  poly([[40, 120], [190, 120], [160, 185], [190, 250], [40, 250], [80, 185]], colors.ribbonDark);
  poly([[1160, 120], [1010, 120], [1040, 185], [1010, 250], [1160, 250], [1120, 185]], colors.ribbonDark);
  x.beginPath(); x.moveTo(150, 70); x.quadraticCurveTo(600, 20, 1050, 70); x.lineTo(1050, 240); x.quadraticCurveTo(600, 190, 150, 240); x.closePath(); x.fillStyle = colors.ribbon; x.fill(); x.stroke();
  x.setLineDash([4, 18]); x.lineCap = 'round'; x.lineWidth = 6; x.strokeStyle = '#ffffffaa'; x.beginPath(); x.moveTo(175, 95); x.quadraticCurveTo(600, 50, 1025, 95); x.stroke(); x.setLineDash([]);
  x.textAlign = 'center'; x.fillStyle = colors.ribbonText;
  fitFont(x, names, 820, 100, 400, FONT_NAMES, 40); x.fillText(names, 600, 160);
  fitFont(x, dateLine, 700, 30, 500, FONT_TEXT, 20); x.globalAlpha = .9; x.fillText(dateLine, 600, 210);
  return c;
}

/* ---------- material + sprite ---------- */
function texFrom(canvas) { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t; }
const mat = t => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: t, map: t, alphaTest: .5, side: THREE.DoubleSide, roughness: 1, metalness: 0 });
export function plane(canvas, w, h, name) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(texFrom(canvas))); m.name = name; return m; }

/* ---------- bubble content ---------- */
export function bubbleTexts(inv, guestName, lang) {
  const t = T[lang] || T.en, ev = (inv.events || []).filter(e => e && (e.label || e.time));
  const first = ev[0], rest = ev.slice(1).map(e => [e.label, e.time].filter(Boolean).join(' ')).join(' · ');
  return [
    { side: 'L', icon: 'ring', l1: guestName ? t.dear(guestName) : t.hi, big: t.married, l2: '' },
    { side: 'R', icon: 'cal', l1: t.joinOn, big: longDate(inv.date, lang) || t.tba, l2: inv.date ? weekday(inv.date, lang) : '' },
    { side: 'L', icon: 'clock', l1: first && first.label ? t.at(first.label) : t.ceremonyAt, big: (first && first.time) || inv.time || t.tba, l2: rest },
    { side: 'R', icon: 'pin', l1: t.venue, big: inv.venue || t.tba, l2: inv.address || '' },
    { side: 'C', icon: 'heart', l1: '', big: t.seeYou, l2: t.tapRsvp }
  ];
}

/* ---------- build the whole scene ---------- */
export async function buildScene(inv, guestName = '', { base = '', resolve = u => u } = {}) {
  await loadFonts(base);
  const tpl = getTemplate(inv.template), art = templateArt(tpl, inv), lang = inv.lang || 'en', col = tpl.colors;
  const root = new THREE.Group(); root.name = 'WeddingScene';
  const PX = 1.5, K = 1.05 / 760;            // texture px per unit, metres per character unit
  const tracks = [], L = 16, FPS = 24, N = L * FPS + 1, times = [...Array(N)].map((_, i) => i / FPS);
  const TAU = Math.PI * 2, q = new THREE.Quaternion(), e = new THREE.Euler();
  const rest = [];
  const add = (o, fp, fs, fr) => {
    rest.push([o, fp, fs, fr]);
    if (fp) tracks.push(new THREE.VectorKeyframeTrack(o.name + '.position', times, times.flatMap(fp)));
    if (fs) tracks.push(new THREE.VectorKeyframeTrack(o.name + '.scale', times, times.flatMap(fs)));
    if (fr) tracks.push(new THREE.QuaternionKeyframeTrack(o.name + '.quaternion', times, times.flatMap(t => { e.set(0, 0, fr(t)); q.setFromEuler(e); return [q.x, q.y, q.z, q.w]; })));
  };
  const tiny = 0.0001;

  // backdrop
  const bw = 1.5, bh = bw * 1150 / 1000;
  const back = plane(await svgToCanvas(svgDoc(art.backdrop, [0, 0, 1000, 1150], 0.9)), bw, bh, 'backdrop');
  back.position.set(0, bh / 2 - (20 / 1150) * bh, -0.16); root.add(back);

  // characters
  const SLOT = 3.2, speakers = ['G', 'B', 'G', 'B', 'GB'];
  const slotOf = t => Math.min(4, Math.floor(t / SLOT));
  const speaking = (who, t) => speakers[slotOf(t)].includes(who);
  const env = t => { const k = t % SLOT; return Math.min(1, k / 0.4) * Math.min(1, Math.max(0, (SLOT - k) / 0.4)); };
  const hop = t => { const k = t % SLOT; return k < 0.45 ? Math.sin(Math.PI * k / 0.45) : 0; };

  async function makeChar(c, who, cx) {
    const P = c.parts, g = new THREE.Group(); g.name = who + '_char'; g.position.x = cx; root.add(g);
    const toW = ([bx, by, bw2, bh2]) => ({ w: bw2 * K, h: bh2 * K, x: (bx + bw2 / 2 - 180) * K, y: (750 - (by + bh2 / 2)) * K });
    const mk = async (part, name) => { const b = toW(part.box); const m = plane(await svgToCanvas(svgDoc(part.svg, part.box, PX)), b.w, b.h, name); return { m, b }; };
    const body = await mk(P.body, who + '_body'); body.m.position.set(body.b.x, body.b.y, 0); g.add(body.m);
    const neck = [(c.neck[0] - 180) * K, (750 - c.neck[1]) * K];
    const head = new THREE.Group(); head.name = who + '_head'; head.position.set(neck[0], neck[1], 0.012); g.add(head);
    const hm = await mk(P.head, who + '_headart'); hm.m.position.set(hm.b.x - neck[0], hm.b.y - neck[1], 0); head.add(hm.m);
    if (P.hairBack) { const hb = await mk(P.hairBack, who + '_hairback'); hb.m.position.set(hb.b.x - neck[0], hb.b.y - neck[1], -0.03); head.add(hb.m); }
    const lb = toW(P.lids.box); const lids = plane(await svgToCanvas(svgDoc(P.lids.svg, P.lids.box, PX)), lb.w, lb.h, who + '_lids');
    lids.geometry.translate(0, -lb.h / 2, 0); lids.position.set(lb.x - neck[0], (750 - P.lids.box[1]) * K - neck[1], 0.006); head.add(lids);
    const mo = await mk(P.mouth, who + '_mouth'); mo.m.position.set(mo.b.x - neck[0], mo.b.y - neck[1], 0.006); head.add(mo.m);
    const sh = [(c.shoulder[0] - 180) * K, (750 - c.shoulder[1]) * K];
    const arm = new THREE.Group(); arm.name = who + '_arm'; arm.position.set(sh[0], sh[1], 0.022); g.add(arm);
    const am = await mk(P.arm, who + '_armart'); am.m.position.set(am.b.x - sh[0], am.b.y - sh[1], 0); arm.add(am.m);

    const ph = who === 'G' ? 0 : 1.3, blinkAt = who === 'G' ? 1.1 : 2.9;
    add(g, t => [cx, 0.01 * Math.abs(Math.sin(TAU * t / 2 + ph)) + (speaking(who, t) ? 0.055 * hop(t) : 0), 0], null, null);
    add(head, t => [neck[0], neck[1], 0.012], null, t => 0.045 * Math.sin(TAU * t / 4 + ph) + (speaking(who, t) ? 0.035 * env(t) * Math.sin(TAU * 2.2 * t) : 0));
    add(arm, null, null, t => (who === 'G' ? 1 : -1) * (0.06 * Math.sin(TAU * t / 3 + ph) + (speaking(who, t) ? 0.34 * env(t) * Math.sin(TAU * 1.5 * t) : 0)));
    add(lids, null, t => { const k = (t % 4) - blinkAt; const s = k >= 0 && k <= 0.16 ? Math.max(tiny, Math.sin(Math.PI * k / 0.16)) : tiny; return [1, s, 1]; }, null);
    add(mo.m, null, t => { if (!speaking(who, t) || env(t) < 0.5) return [tiny, tiny, tiny]; const o = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(TAU * 4.2 * t + ph)); return [1, o, 1]; }, null);
  }
  // custom couple art (your own images) or the template's drawn couple
  async function loadArt(url) {
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = resolve(url); await img.decode();
    const scale = Math.min(1, 1024 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c;
  }
  async function makeCustom(url, who, cx, H) {
    const cv = await loadArt(url), W = H * cv.width / cv.height;
    const g = new THREE.Group(); g.name = who + '_char'; g.position.x = cx; root.add(g);
    const m = plane(cv, W, H, who + '_art'); m.geometry.translate(0, H / 2, 0); g.add(m);
    const ph = who === 'B' ? 1.3 : 0, solo = who === 'GB';
    const talk = t => solo || speaking(who, t);
    add(g, t => [cx, 0.012 * Math.abs(Math.sin(TAU * t / 2 + ph)) + (talk(t) ? 0.06 * hop(t) : 0), 0],
      t => { const k = t % SLOT, land = talk(t) && k > 0.45 && k < 0.7 ? Math.sin(Math.PI * (k - 0.45) / 0.25) : 0; return [1 + 0.04 * land, 1 - 0.05 * land, 1]; },
      t => 0.035 * Math.sin(TAU * t / 4 + ph) + (talk(t) ? 0.03 * env(t) * Math.sin(TAU * 2 * t) : 0));
  }
  const customArt = inv.art && (inv.art.groom || inv.art.bride);
  if (customArt && inv.art.groom && inv.art.bride) { await makeCustom(inv.art.groom, 'G', -0.26, 1.02); await makeCustom(inv.art.bride, 'B', 0.26, 1.0); }
  else if (customArt) await makeCustom(inv.art.groom || inv.art.bride, 'GB', 0, 1.05);
  else {
    await makeChar(art.groom, 'G', -0.25);
    await makeChar(art.bride, 'B', 0.25);
  }

  // banner
  const t = T[lang] || T.en;
  const names = `${inv.groom || ''} & ${inv.bride || ''}`;
  const d = inv.date ? new Date(inv.date + 'T12:00:00') : null;
  const dateLine = d ? `${String(d.getDate()).padStart(2, '0')} · ${String(d.getMonth() + 1).padStart(2, '0')} · ${d.getFullYear()}` : '';
  const banner = plane(drawBanner(names, dateLine, col), 1.3, 1.3 * 330 / 1200, 'banner'); root.add(banner);
  add(banner, t2 => [0, 1.7 + 0.025 * Math.sin(TAU * t2 / 4), 0.04], null, t2 => 0.022 * Math.sin(TAU * t2 / 4 + 1));

  // speech bubbles
  const texts = bubbleTexts(inv, guestName, lang), anchor = { L: [-0.2, 1.05], R: [0.2, 1.02], C: [0, 1.1] };
  const icons = ['ring', 'cal', 'clock', 'pin', 'heart'];
  texts.forEach((b, i) => {
    const cv = drawBubble({ ...b, icon: icons[i], colors: col, day: d ? String(d.getDate()) : '' });
    const w = 0.72, h = w * cv.height / cv.width, m = plane(cv, w, h, 'bubble' + (i + 1));
    const [px, py] = BUBBLE_TIPS[b.side]; m.geometry.translate(-(px / cv.width - .5) * w, -(.5 - py / cv.height) * h, 0);
    m.position.set(anchor[b.side][0], anchor[b.side][1], 0.3 + i * 0.004); root.add(m);
    const t0 = i * SLOT, t1 = t0 + SLOT;
    add(m, null, tt => { let s = 0; if (tt >= t0 && tt <= t1) { const a = tt - t0, z = t1 - tt;
      if (a < 0.4) { const x = a / 0.4; s = Math.max(0, Math.min(1.15, 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2)); } else s = 1;
      if (z < 0.25) s *= z / 0.25; } s = Math.max(s, tiny); return [s, s, s]; }, null);
  });

  // floating particles + sparkles
  const pc = await svgToCanvas(svgDoc(art.particle, [0, 0, 256, 240], .5)), sc = await svgToCanvas(svgDoc(art.spark, [0, 0, 200, 200], .5));
  for (let i = 0; i < 8; i++) {
    const m = plane(pc, 0.12, 0.12 * 240 / 256, 'float' + i); root.add(m);
    const ph = i / 8, x0 = (i % 2 ? 1 : -1) * (0.3 + ((i * 37) % 5) * 0.09), z0 = 0.1 + ((i * 13) % 4) * 0.06, sz = 0.7 + ((i * 7) % 4) * 0.15;
    add(m, tt => { const u = (tt / 4 + ph) % 1; return [x0 + 0.07 * Math.sin(TAU * (2 * u + ph)), 0.3 + 1.5 * u, z0]; },
      tt => { const u = (tt / 4 + ph) % 1, s = sz * Math.sin(Math.PI * u) + tiny; return [s, s, s]; },
      tt => { const u = (tt / 4 + ph) % 1; return 0.35 * Math.sin(TAU * u); });
  }
  [[-0.74, 1.3], [0.76, 1.15], [-0.6, 0.5], [0.66, 0.6], [-0.45, 1.98], [0.55, 1.95], [0.85, 1.7], [-0.86, 1.75]].forEach(([x, y], i) => {
    const m = plane(sc, 0.11, 0.11, 'spark' + i); m.position.set(x, y, 0.12); root.add(m);
    const ph = i * 0.37;
    add(m, null, tt => { const s = Math.pow(Math.max(0, Math.sin(TAU * (tt / 2 + ph))), 2) * 1.1 + tiny; return [s, s, s]; }, tt => (Math.PI / 2) * (tt / 4));
  });

  // resting pose (used by viewers that can't play animation, e.g. iPhone Quick Look):
  // the moment the groom greets, with the bride's date bubble shown too
  const RT = 1.6;
  for (const [o, fp, fs, fr] of rest) {
    if (fp) o.position.fromArray(fp(RT));
    if (fs) o.scale.fromArray(fs(RT));
    if (fr) o.rotation.set(0, 0, fr(RT));
  }
  for (const m of root.children) if (/^G_|^B_/.test(m.name)) { /* chars handled above */ }
  root.traverse(o => { if (/_mouth$/.test(o.name)) o.scale.set(0.0001, 0.0001, 0.0001); });
  const b2 = root.getObjectByName('bubble2'); if (b2) b2.scale.set(1, 1, 1);
  const clip = new THREE.AnimationClip('Celebrate', L, tracks);
  return { root, clip };
}

export async function buildGLB(inv, guestName = '', opts = {}) {
  const use3d = inv.style === '3d' && getTemplate(inv.template).has3d && !(inv.art && (inv.art.groom || inv.art.bride));
  const { root, clip } = !use3d ? await buildScene(inv, guestName, opts)
    : await (await import('./scene3d.js')).buildScene3D(inv, guestName, opts);
  const buf = await new GLTFExporter().parseAsync(root, { binary: true, animations: [clip], maxTextureSize: 1024 });
  return URL.createObjectURL(new Blob([buf], { type: 'model/gltf-binary' }));
}
