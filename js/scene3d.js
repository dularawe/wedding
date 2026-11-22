// 3D "cute toy figure" version of the AR scene.
// Characters and backdrops are built from rounded shapes in three.js, then animated and exported as GLB.
import * as THREE from 'three';
import { getTemplate } from './templates.js';
import { T } from './i18n.js';
import { loadFonts, drawBubble, drawBanner, plane, bubbleTexts, BUBBLE_TIPS } from './scene.js';

/* ---------------- shared geometry & materials ---------------- */
const G = {};
const geo = (key, make) => G[key] || (G[key] = make());
const SPH = () => geo('sph', () => new THREE.SphereGeometry(1, 28, 20));
const SPL = () => geo('spl', () => new THREE.SphereGeometry(1, 12, 9));            // low-poly for flowers/beads
const CYL = () => geo('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 28));
const BOX = () => geo('box', () => new THREE.BoxGeometry(1, 1, 1));
const MATS = {};
function M(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (MATS[key]) return MATS[key];
  const m = new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.6, metalness: o.metal ?? 0, side: o.double ? THREE.DoubleSide : THREE.FrontSide });
  if (o.glow) { m.emissive = new THREE.Color(o.glow); m.emissiveIntensity = o.gi ?? 0.8; }
  if (o.map) { m.map = o.map; }
  return (MATS[key] = m);
}
const GOLD = () => M('#e2b34a', { metal: 0.55, rough: 0.32 });
function mesh(g, m, p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0], name) {
  const x = new THREE.Mesh(g, m); x.position.set(...p); x.scale.set(...(typeof s === 'number' ? [s, s, s] : s)); x.rotation.set(...r); if (name) x.name = name; return x;
}
const sph = (m, p, s, r) => mesh(SPH(), m, p, s, r);
const bead = (m, p, s) => mesh(SPL(), m, p, s);
const cyl = (m, p, rad, h, r = [0, 0, 0]) => mesh(CYL(), m, p, [rad, h, rad], r);
const box = (m, p, s, r) => mesh(BOX(), m, p, s, r);
const torus = (m, p, R, t, arc = Math.PI * 2, r = [0, 0, 0]) => mesh(geo(`tor${R}_${t}_${arc.toFixed(2)}`, () => new THREE.TorusGeometry(R, t, 12, 40, arc)), m, p, 1, r);
function lathe(m, pts, p = [0, 0, 0], key) { return mesh(geo('lathe' + key, () => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 40)), m, p); }
function dotsTexture(bg, dot, w = 512, h = 256, step = 22, r = 4) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = dot;
  for (let yy = step / 2, row = 0; yy < h; yy += step, row++) for (let xx = (row % 2 ? step / 2 : 0) + step / 4; xx < w; xx += step) { x.beginPath(); x.arc(xx, yy, r, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function heartShape() {
  const s = new THREE.Shape(); s.moveTo(0, -0.9);
  s.bezierCurveTo(-0.2, -0.65, -1, -0.25, -1, 0.3); s.bezierCurveTo(-1, 0.8, -0.4, 1.05, 0, 0.6);
  s.bezierCurveTo(0.4, 1.05, 1, 0.8, 1, 0.3); s.bezierCurveTo(1, -0.25, 0.2, -0.65, 0, -0.9); return s;
}
function starShape() { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.45 : 1; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); return s; }
const WRAP = () => geo('wrap', () => new THREE.CylinderGeometry(1, 1.15, 1, 28));
const VNECK = () => geo('vneck', () => new THREE.ConeGeometry(1, 1, 3));
const BOW = () => geo('bow', () => new THREE.ConeGeometry(1, 1, 16));
const HEART = () => geo('heart', () => new THREE.ExtrudeGeometry(heartShape(), { depth: 0.35, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.15, bevelSegments: 4, curveSegments: 16 }).center());
const STAR = () => geo('star', () => new THREE.ExtrudeGeometry(starShape(), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3 }).center());
function flower(petal, centre, r = 0.03, n = 5) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.add(bead(petal, [Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75, 0], [r * 0.55, r * 0.55, r * 0.35])); }
  g.add(bead(centre, [0, 0, r * 0.2], r * 0.38)); return g;
}

/* ---------------- character ---------------- */
const SK = { light: '#f7d4bd', medium: '#eab894', tan: '#d39a74' };
const INK = M('#2b1a14', { rough: 0.25 });
const WHITE = M('#ffffff', { rough: 0.2 });
const BLUSH = M('#ff9aa6', { rough: 0.8 });
const MOUTH = M('#8c2433', { rough: 0.5 });
const HR = 0.2, HEAD_Y = 0.225;                    // head radius, head centre above neck pivot
const SH_X = 0.135, SH_Y = 0.45, NECK_Y = 0.5;

function onHead(x, y, lift = 0) { return [x, y, Math.sqrt(Math.max(0, HR * HR - x * x - y * y)) + lift]; }

// returns { group, head, arm, lids:[], mouth }
function character(spec, who) {
  const skin = M(spec.skin), g = new THREE.Group(); g.name = who + '_char';
  const body = new THREE.Group(); g.add(body);
  spec.outfit(body, skin);
  // neck
  body.add(cyl(skin, [0, NECK_Y - 0.01, 0], 0.05, 0.08));
  // head group (pivot at neck)
  const head = new THREE.Group(); head.name = who + '_head'; head.position.set(0, NECK_Y, 0); g.add(head);
  const hc = new THREE.Group(); hc.position.set(0, HEAD_Y, 0); head.add(hc);
  hc.add(sph(skin, [0, 0, 0], [HR, HR * 0.96, HR * 0.97]));
  if (!spec.noEars) { hc.add(sph(skin, [-HR * 0.98, -0.01, 0], [0.045, 0.05, 0.035])); hc.add(sph(skin, [HR * 0.98, -0.01, 0], [0.045, 0.05, 0.035])); }
  const lids = [];
  for (const sx of [-1, 1]) {
    const ex = 0.078 * sx, ey = -0.005, p = onHead(ex, ey, -0.012);
    hc.add(sph(INK, p, [0.034, 0.046, 0.022]));
    hc.add(sph(WHITE, [p[0] + 0.011, p[1] + 0.018, p[2] + 0.018], 0.012));
    hc.add(sph(WHITE, [p[0] - 0.01, p[1] - 0.014, p[2] + 0.017], 0.006));
    const bp = onHead(ex * 1.05, 0.072, 0.002);
    hc.add(mesh(CYL(), INK, bp, [0.006, 0.04, 0.006], [0, 0, Math.PI / 2 + sx * 0.18]));
    if (spec.lashes) hc.add(mesh(CYL(), INK, [p[0] + sx * 0.036, p[1] + 0.028, p[2] - 0.004], [0.005, 0.022, 0.005], [0, 0, -sx * 0.9]));
    const bl = onHead(0.128 * sx, -0.06, -0.004); hc.add(sph(BLUSH, bl, [0.03, 0.017, 0.01]));
    // eyelid: pivot at top of the eye, scaled in y to blink
    const lid = new THREE.Group(); lid.name = `${who}_lid${sx > 0 ? 'R' : 'L'}`; lid.position.set(p[0], p[1] + 0.05, p[2] + 0.002); hc.add(lid);
    lid.add(sph(skin, [0, -0.05, 0], [0.04, 0.052, 0.026])); lid.scale.set(1, 0.0001, 1); lids.push(lid);
  }
  hc.add(sph(M(spec.skin, { rough: 0.5 }), onHead(0, -0.032, -0.006), [0.016, 0.012, 0.014]));
  const mp = onHead(0, -0.082, -0.004);
  hc.add(torus(INK, [mp[0], mp[1] + 0.012, mp[2]], 0.026, 0.0055, Math.PI, [0.25, 0, Math.PI]));
  const mouth = new THREE.Group(); mouth.name = who + '_mouth'; mouth.position.set(mp[0], mp[1] - 0.004, mp[2] + 0.002); mouth.add(sph(MOUTH, [0, 0, 0], [0.026, 0.022, 0.012])); mouth.scale.set(0.0001, 0.0001, 0.0001); hc.add(mouth);
  if (spec.bindi) hc.add(sph(M('#c8102e'), onHead(0, 0.098, 0), [0.011, 0.011, 0.005]));
  spec.hair(hc, skin);
  // arms
  const arms = {};
  for (const side of ['L', 'R']) {
    const sx = side === 'L' ? -1 : 1, a = new THREE.Group(); a.position.set(sx * SH_X, SH_Y, 0); g.add(a);
    const o = spec.arm, sleeve = M(o.sleeve), len = o.rolled ? 0.11 : 0.2;
    a.add(sph(sleeve, [0, 0, 0], 0.052));
    a.add(cyl(sleeve, [0, -len / 2, 0], 0.043, len));
    if (o.rolled) a.add(cyl(skin, [0, -0.165, 0], 0.033, 0.11));
    if (o.cuff) a.add(cyl(M(o.cuff, o.cuffMetal ? { metal: .5, rough: .3 } : {}), [0, -0.205, 0], 0.041, 0.022));
    if (o.bangles) { a.add(torus(GOLD(), [0, -0.2, 0], 0.036, 0.008, Math.PI * 2, [Math.PI / 2, 0, 0])); a.add(torus(GOLD(), [0, -0.214, 0], 0.035, 0.008, Math.PI * 2, [Math.PI / 2, 0, 0])); }
    a.add(sph(skin, [0, -0.245, 0], [0.043, 0.047, 0.04]));
    a.add(sph(skin, [sx * -0.03, -0.235, 0.022], [0.016, 0.022, 0.014]));
    arms[side] = a;
  }
  // waving arm is the outer one; the other hangs down (and may hold a bouquet)
  const waveSide = who === 'G' ? 'L' : 'R', hangSide = waveSide === 'L' ? 'R' : 'L';
  const wave = arms[waveSide], hang = arms[hangSide];
  wave.name = who + '_arm'; hang.name = who + '_arm2';
  const ws = waveSide === 'L' ? -1 : 1;
  wave.rotation.z = ws * 2.35; hang.rotation.z = -ws * 0.12;
  if (spec.bouquet) { const b = spec.bouquet(); b.position.set(0, -0.27, 0.05); hang.add(b); }
  return { group: g, head, wave, hang, lids, mouth, waveSign: ws };
}

/* ---------------- hair & headwear ---------------- */
const capGeo = () => geo('cap', () => new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.44));
function shortHair(color) { return hc => {
  const m = M(color, { rough: 0.45 });
  hc.add(mesh(capGeo(), m, [0, 0.012, -0.01], [HR * 1.07, HR * 1.07, HR * 1.07], [-0.32, 0, 0]));
  for (const [x, y, s, r] of [[-0.1, 0.13, 0.07, 0.5], [-0.03, 0.15, 0.075, 0.2], [0.05, 0.15, 0.072, -0.2], [0.115, 0.12, 0.062, -0.6]]) hc.add(sph(m, [x, y, 0.13], [s, s * 0.6, s * 0.8], [0, 0, r]));
  hc.add(sph(m, [0, -0.02, -0.07], [HR * 1.02, HR * 0.9, HR * 0.95]));
}; }
function longHair(color, { bun = false, braid = null, bangs = true } = {}) { return hc => {
  const m = M(color, { rough: 0.45 });
  hc.add(mesh(capGeo(), m, [0, 0.01, -0.005], [HR * 1.07, HR * 1.07, HR * 1.07], [-0.22, 0, 0]));
  if (bangs) { hc.add(sph(m, [-0.07, 0.13, 0.135], [0.1, 0.06, 0.07], [0, 0, 0.35])); hc.add(sph(m, [0.07, 0.13, 0.135], [0.1, 0.06, 0.07], [0, 0, -0.35])); }
  else hc.add(mesh(CYL(), INK, onHead(0, 0.16, 0.012), [0.004, 0.06, 0.004], [-0.5, 0, 0]));
  if (bun) hc.add(sph(m, [0, 0.14, -0.17], 0.1));
  else if (!braid) hc.add(sph(m, [0, -0.16, -0.08], [0.22, 0.3, 0.13]));
  if (braid) { for (let i = 0; i < 7; i++) hc.add(sph(m, [0, -0.08 - i * 0.065, -0.2 - i * 0.01], [0.045, 0.04, 0.04]));
    for (let i = 0; i < 9; i++) hc.add(bead(M('#fffaf0'), [(i % 2 ? 0.04 : -0.04), -0.06 - i * 0.05, -0.215 - i * 0.01], 0.017)); }
}; }
function kandyanHat(hc) {
  shortHair('#1d1412')(hc);
  const maroon = M('#6b1028', { rough: 0.5 }), gold = GOLD(), H = new THREE.Group(); H.position.set(0, 0.16, -0.01); H.rotation.x = -0.15; hc.add(H);
  H.add(mesh(geo('hat', () => new THREE.CylinderGeometry(1.25, 1, 1, 4, 1)), maroon, [0, 0.05, 0], [0.2, 0.16, 0.2], [0, Math.PI / 4, 0]));
  H.add(mesh(geo('hatrim', () => new THREE.CylinderGeometry(1.03, 1.03, 1, 4, 1, true)), gold, [0, -0.02, 0], [0.205, 0.03, 0.205], [0, Math.PI / 4, 0]));
  H.add(mesh(geo('hattop', () => new THREE.CylinderGeometry(1.26, 1.26, 1, 4, 1, true)), gold, [0, 0.125, 0], [0.2, 0.016, 0.2], [0, Math.PI / 4, 0]));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; H.add(flower(gold, M('#c8102e'), 0.026).translateX(Math.sin(a) * 0.17).translateY(0.05).translateZ(Math.cos(a) * 0.17)); }
  H.add(flower(gold, M('#c8102e'), 0.03).translateY(0.05).translateZ(0.235));
  H.add(bead(gold, [0, 0.135, 0], [0.08, 0.018, 0.08])); H.add(cyl(gold, [0, 0.19, 0], 0.012, 0.1));
  for (const [x, y] of [[0, 0.26], [-0.04, 0.23], [0.04, 0.23]]) H.add(bead(gold, [x, y, 0], 0.022));
}
function hijab(color) { return (hc) => {
  const m = M(color, { rough: 0.7 });
  hc.add(sph(m, [0, 0.015, -0.035], [HR * 1.13, HR * 1.12, HR * 1.08]));
  hc.add(torus(GOLD(), [0, 0.03, 0.02], HR * 1.06, 0.009, Math.PI, [-0.2, 0, 0]));
  hc.add(flower(WHITE, GOLD(), 0.024).translateX(0).translateY(0.17).translateZ(0.17));
}; }

/* ---------------- outfits ---------------- */
function legs(body, pants, shoes, { bare = false, skin } = {}) {
  for (const sx of [-1, 1]) {
    body.add(cyl(pants, [sx * 0.055, 0.14, 0], 0.052, 0.24));
    body.add(sph(bare ? skin : shoes, [sx * 0.06, 0.025, 0.025], [0.058, 0.032, 0.085]));
  }
}
function torsoGroom(body, m, { len = 0.3, flare = 1.15 } = {}) {
  body.add(mesh(geo('torso' + flare, () => new THREE.CylinderGeometry(1, flare, 1, 28)), m, [0, SH_Y - len / 2 + 0.02, 0], [0.125, len, 0.105]));
  body.add(sph(m, [0, SH_Y + 0.005, 0], [0.135, 0.06, 0.108]));
}
function skirt(body, m, { hem = 0.27, waist = 0.105, top = 0.32, key = 'a', curve = 0.5 } = {}) {
  const pts = [[0.001, 0], [hem, 0.0], [hem * 0.98, 0.02]];
  for (let i = 1; i <= 8; i++) { const t = i / 8; pts.push([hem + (waist - hem) * Math.pow(t, curve), 0.02 + (top - 0.02) * t]); }
  pts.push([0.001, top]); body.add(lathe(m, pts, [0, 0, 0], key));
}
function bodice(body, m) {
  body.add(mesh(geo('bodice', () => new THREE.CylinderGeometry(1, 0.85, 1, 28)), m, [0, 0.385, 0], [0.12, 0.16, 0.1]));
  body.add(sph(m, [0, SH_Y + 0.005, 0], [0.13, 0.055, 0.1]));
}
function garland(body) {
  const cols = ['#e2264d', '#ff9f1c', '#fffaf0'].map(c => M(c, { rough: .7 }));
  for (let i = 0; i <= 16; i++) { const t = i / 16, a = Math.PI * t; body.add(bead(cols[i % 3], [-0.1 * Math.cos(a), SH_Y + 0.02 - 0.17 * Math.sin(a), 0.1 + 0.03 * Math.sin(a)], 0.022)); }
}
function bouquet(cols) { return () => { const g = new THREE.Group();
  [[0, 0.03, 0], [-0.035, 0, 0.01], [0.035, 0, 0.01], [0, -0.01, 0.03], [-0.02, 0.04, -0.02], [0.022, 0.04, -0.015]].forEach((p, i) => { const f = flower(M(cols[i % cols.length], { rough: .7 }), M('#ffc94d'), 0.028); f.position.set(...p); f.lookAt(p[0] * 4, p[1] * 2 + 0.2, 1); g.add(f); });
  g.add(cyl(M('#4caf50'), [0, -0.05, 0], 0.012, 0.07)); g.add(torus(M('#f47c86'), [0, -0.035, 0], 0.016, 0.007, Math.PI * 2, [Math.PI / 2, 0, 0])); return g; }; }

const SPECS = {
  groom: {
    classic: { skin: SK.light, arm: { sleeve: '#2b1d1a', cuff: '#ffffff' }, hair: shortHair('#7a4a2e'),
      outfit(b, skin) { const blk = M('#2b1d1a', { rough: .5 }); legs(b, blk, M('#16100e', { rough: .3 }));
        torsoGroom(b, blk); b.add(box(WHITE, [0, 0.4, 0.1], [0.07, 0.12, 0.02]));
        b.add(mesh(BOW(), INK, [-0.022, 0.455, 0.11], [0.018, 0.04, 0.012], [0, 0, Math.PI / 2])); b.add(mesh(BOW(), INK, [0.022, 0.455, 0.11], [0.018, 0.04, 0.012], [0, 0, -Math.PI / 2]));
        for (const y of [0.34, 0.28]) b.add(bead(WHITE, [0, y, 0.12], 0.009));
        const f = flower(WHITE, M('#ffc94d'), 0.022); f.position.set(0.07, 0.41, 0.115); b.add(f); } },
    kandyan: { skin: SK.medium, arm: { sleeve: '#6b1028', cuff: '#e2b34a', cuffMetal: 1 }, hair: kandyanHat,
      outfit(b, skin) { const cream = M('#f6ecd3'), maroon = M('#6b1028', { rough: .5 });
        b.add(mesh(WRAP(), cream, [0, 0.12, 0], [0.12, 0.22, 0.11]));
        for (const y of [0.04, 0.065]) b.add(torus(GOLD(), [0, y, 0], 0.133, 0.006, Math.PI * 2, [Math.PI / 2, 0, 0]));
        for (const sx of [-1, 1]) b.add(sph(M('#5a2a1a', { rough: .3 }), [sx * 0.06, 0.02, 0.03], [0.055, 0.028, 0.08]));
        torsoGroom(b, maroon, { len: 0.22 });
        b.add(cyl(WHITE, [0, 0.25, 0], 0.143, 0.04)); b.add(cyl(M('#c8102e'), [0, 0.25, 0], 0.145, 0.014));
        for (const sx of [-1, 1]) { b.add(box(GOLD(), [sx * 0.03, 0.36, 0.104], [0.01, 0.17, 0.01])); b.add(sph(maroon, [sx * 0.15, SH_Y - 0.005, 0], [0.07, 0.065, 0.07])); b.add(torus(GOLD(), [sx * 0.15, SH_Y, 0.06], 0.03, 0.006)); }
        for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) b.add(bead(GOLD(), [sx * 0.06, 0.42 - i * 0.04, 0.1], 0.01)); } },
    tamil: { skin: SK.tan, arm: { sleeve: '#fff4dc', cuff: '#e0b040', cuffMetal: 1 }, hair: hc => { shortHair('#141010')(hc); for (const y of [0.115, 0.13, 0.145]) hc.add(mesh(CYL(), WHITE, onHead(0, y, 0.002), [0.003, 0.05, 0.003], [-0.5, 0, Math.PI / 2])); hc.add(sph(M('#c8102e'), onHead(0, 0.13, 0.004), 0.008)); },
      outfit(b, skin) { const vesti = M('#fffaf0'), shirt = M('#fff4dc');
        b.add(mesh(WRAP(), vesti, [0, 0.12, 0], [0.12, 0.22, 0.11])); b.add(torus(GOLD(), [0, 0.035, 0], 0.134, 0.01, Math.PI * 2, [Math.PI / 2, 0, 0]));
        for (const sx of [-1, 1]) { b.add(sph(skin, [sx * 0.06, 0.018, 0.03], [0.05, 0.022, 0.075])); b.add(box(M('#8a5a2a'), [sx * 0.06, 0.008, 0.03], [0.09, 0.008, 0.14])); }
        torsoGroom(b, shirt, { len: 0.22 }); b.add(box(GOLD(), [0, 0.38, 0.105], [0.012, 0.13, 0.01]));
        b.add(mesh(BOX(), M('#fffaf0'), [0, 0.36, 0.06], [0.06, 0.32, 0.1], [0, 0, 0.7])); b.add(mesh(BOX(), GOLD(), [0.006, 0.36, 0.112], [0.012, 0.3, 0.004], [0, 0, 0.7]));
        garland(b); } },
    muslim: { skin: SK.medium, arm: { sleeve: '#f3e3c0', cuff: '#d4a548', cuffMetal: 1 },
      hair: hc => { shortHair('#1d1412')(hc); const cream = M('#f3e3c0'); hc.add(mesh(CYL(), cream, [0, 0.165, -0.02], [0.17, 0.08, 0.17], [-0.2, 0, 0])); hc.add(torus(GOLD(), [0, 0.135, -0.005], 0.17, 0.008, Math.PI * 2, [Math.PI / 2 - 0.2, 0, 0])); },
      outfit(b, skin) { const cream = M('#f3e3c0'), white = M('#fffdf6');
        legs(b, white, M('#d4a548', { metal: .5, rough: .3 }));
        b.add(mesh(geo('coat', () => new THREE.CylinderGeometry(1, 1.35, 1, 28)), cream, [0, 0.29, 0], [0.125, 0.33, 0.105])); b.add(sph(cream, [0, SH_Y + 0.005, 0], [0.135, 0.06, 0.108]));
        b.add(torus(GOLD(), [0, 0.135, 0], 0.165, 0.01, Math.PI * 2, [Math.PI / 2, 0, 0]));
        for (let i = 0; i < 6; i++) b.add(bead(GOLD(), [0, 0.43 - i * 0.05, 0.11 + i * 0.006], 0.011));
        b.add(cyl(GOLD(), [0, 0.475, 0], 0.055, 0.03));
        b.add(mesh(BOX(), M('#7a1f3d'), [0.08, 0.3, 0.1], [0.045, 0.32, 0.02], [0.05, 0, -0.08])); } },
    beach: { skin: SK.medium, arm: { sleeve: '#fdfdf6', rolled: true }, hair: shortHair('#6b3f26'),
      outfit(b, skin) { const sand = M('#e8d5b0'), shirt = M('#fdfdf6');
        legs(b, sand, null, { bare: true, skin }); for (const sx of [-1, 1]) b.add(cyl(M('#f1e2c3'), [sx * 0.055, 0.05, 0], 0.056, 0.03));
        torsoGroom(b, shirt); b.add(mesh(VNECK(), skin, [0, 0.43, 0.102], [0.035, 0.07, 0.01], [0, 0, Math.PI]));
        b.add(cyl(M('#8a5a3a'), [0, 0.18, 0], 0.142, 0.02)); for (const y of [0.36, 0.3, 0.24]) b.add(bead(M('#cccccc'), [0, y, 0.113], 0.007));
        const f = flower(M('#ff6f61'), M('#ffd166'), 0.026); f.position.set(0.075, 0.4, 0.108); b.add(f); } }
  },
  bride: {
    classic: { skin: SK.light, lashes: true, arm: { sleeve: '#ffffff' }, bouquet: bouquet(['#ffffff', '#f7c6cf', '#ffd1d6']),
      hair: hc => { longHair('#7a4a2e')(hc); const veil = M('#ffffff', { rough: .9, double: true });
        hc.add(mesh(geo('veil', () => new THREE.CylinderGeometry(0.6, 1, 1, 28, 1, true, Math.PI * 0.55, Math.PI * 0.9)), veil, [0, -0.25, -0.05], [0.2, 0.62, 0.17]));
        for (let i = 0; i < 9; i++) { const a = Math.PI * (0.1 + 0.8 * i / 8); const f = flower(M(i % 2 ? '#ffffff' : '#f7c6cf', { rough: .7 }), M('#ffc94d'), 0.022); f.position.set(-Math.cos(a) * 0.19, 0.12 + Math.sin(a) * 0.06, 0.03 + Math.sin(a) * 0.05); f.rotation.x = -0.6; hc.add(f); } },
      outfit(b, skin) { const w = M('#ffffff', { rough: .45 });
        skirt(b, w, { key: 'gown', hem: 0.29, curve: 0.45 });
        for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; b.add(bead(M('#f7e3e6'), [Math.sin(a) * 0.288, 0.03, Math.cos(a) * 0.288], [0.025, 0.02, 0.012])); }
        bodice(b, w); b.add(cyl(M('#f7c6cf'), [0, 0.315, 0], 0.112, 0.03)); const f = flower(WHITE, M('#f7c6cf'), 0.024); f.position.set(0, 0.315, 0.118); b.add(f);
        b.add(sph(skin, [0, SH_Y + 0.01, 0.01], [0.11, 0.04, 0.085])); } },
    kandyan: { skin: SK.medium, lashes: true, arm: { sleeve: '#f6b82e', bangles: true },
      hair: hc => { longHair('#1d1412', { bun: true, bangs: false })(hc); const gold = GOLD();
        hc.add(torus(gold, [0, 0.07, 0.01], HR * 1.04, 0.008, Math.PI, [-0.35, 0, 0]));
        for (let i = 0; i < 3; i++) hc.add(flower(gold, M('#e8743b'), 0.022 - i * 0.002).translateY(0.21 - i * 0.045).translateZ(0.11 + i * 0.03));
        for (const sx of [-1, 1]) { hc.add(bead(gold, [sx * 0.22, -0.06, 0.01], 0.014)); hc.add(mesh(geo('jh', () => new THREE.ConeGeometry(1, 1.2, 12)), gold, [sx * 0.22, -0.1, 0.01], [0.022, 0.035, 0.022])); } },
      outfit(b, skin) { const sar = M('#fffaf0', { map: dotsTexture('#fffaf0', '#e8a92c', 512, 256, 20, 4) });
        skirt(b, sar, { key: 'osari', hem: 0.18, waist: 0.11, top: 0.3, curve: 1.2 });
        b.add(torus(M('#fffaf0'), [0, 0.3, 0], 0.13, 0.03, Math.PI * 2, [Math.PI / 2, 0, 0])); b.add(torus(GOLD(), [0, 0.28, 0], 0.15, 0.008, Math.PI * 2, [Math.PI / 2, 0, 0]));
        bodice(b, M('#f6b82e', { rough: .5 }));
        for (const sx of [-1, 1]) b.add(sph(M('#f6b82e', { rough: .5 }), [sx * 0.15, SH_Y - 0.005, 0], [0.065, 0.06, 0.065]));
        b.add(mesh(BOX(), sar, [-0.035, 0.37, 0.09], [0.07, 0.2, 0.02], [0, 0, -0.35]));
        for (let k = 0; k < 3; k++) b.add(torus(k === 1 ? M('#e8743b') : GOLD(), [0, SH_Y + 0.01 - k * 0.025, 0.02], 0.085 + k * 0.012, 0.007, Math.PI, [0.25, 0, Math.PI]));
        b.add(sph(M('#e8743b'), [0, 0.37, 0.115], [0.022, 0.022, 0.01])); b.add(bead(M('#c8102e'), [0, 0.37, 0.124], 0.009));
        for (const sx of [-1, 1]) b.add(sph(M('#e8a92c', { metal: .5, rough: .3 }), [sx * 0.05, 0.02, 0.04], [0.045, 0.022, 0.065])); } },
    tamil: { skin: SK.tan, lashes: true, bindi: true, arm: { sleeve: '#7a0d22', cuff: '#e7b53c', cuffMetal: 1, bangles: true },
      hair: hc => { longHair('#141010', { braid: true, bangs: false })(hc); const gold = GOLD();
        hc.add(cyl(gold, onHead(0, 0.16, 0.012), 0.004, 0.08, [-0.6, 0, 0])); hc.add(bead(gold, onHead(0, 0.125, 0.01), 0.016)); hc.add(bead(M('#c8102e'), onHead(0, 0.125, 0.022), 0.007));
        for (const sx of [-1, 1]) hc.add(mesh(geo('jh', () => new THREE.ConeGeometry(1, 1.2, 12)), gold, [sx * 0.22, -0.1, 0.01], [0.022, 0.035, 0.022])); },
      outfit(b, skin) { const red = M('#b3122e', { rough: .45 });
        skirt(b, red, { key: 'saree', hem: 0.17, waist: 0.11, top: 0.31, curve: 1.2 });
        b.add(torus(GOLD(), [0, 0.03, 0], 0.168, 0.016, Math.PI * 2, [Math.PI / 2, 0, 0]));
        bodice(b, M('#7a0d22', { rough: .5 }));
        b.add(mesh(BOX(), red, [0.02, 0.36, 0.085], [0.08, 0.3, 0.025], [0, 0, 0.55])); b.add(mesh(BOX(), GOLD(), [0.045, 0.36, 0.1], [0.015, 0.3, 0.004], [0, 0, 0.55]));
        for (const sx of [-1, 1]) b.add(sph(skin, [sx * 0.05, 0.02, 0.04], [0.042, 0.02, 0.062]));
        garland(b); } },
    muslim: { skin: SK.light, lashes: true, noEars: true, arm: { sleeve: '#fff6f4', cuff: '#d4a548', cuffMetal: 1 }, bouquet: bouquet(['#ffffff', '#f7d6dc']),
      hair: hijab('#f7d6dc'),
      outfit(b, skin) { const w = M('#fff6f4', { rough: .5 });
        skirt(b, w, { key: 'abaya', hem: 0.23, curve: 0.7 }); b.add(torus(GOLD(), [0, 0.03, 0], 0.228, 0.012, Math.PI * 2, [Math.PI / 2, 0, 0]));
        bodice(b, w); b.add(cyl(GOLD(), [0, 0.315, 0], 0.113, 0.025));
        b.add(mesh(geo('drape', () => new THREE.CylinderGeometry(0.6, 1, 1, 28)), M('#f7d6dc', { rough: .7 }), [0, 0.43, 0], [0.16, 0.13, 0.13])); b.add(torus(GOLD(), [0, 0.37, 0], 0.158, 0.007, Math.PI * 2, [Math.PI / 2, 0, 0])); } },
    beach: { skin: SK.medium, lashes: true, arm: { sleeve: '#eab894', rolled: true }, bouquet: bouquet(['#ff6f61', '#ffd166', '#ff9e80']),
      hair: hc => { longHair('#4a2c1d')(hc); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; hc.add(sph(M('#ff6f61', { rough: .6 }), [0.17 + Math.cos(a) * 0.035, 0.1 + Math.sin(a) * 0.035, 0.1], [0.032, 0.032, 0.015])); } hc.add(bead(M('#ffd166'), [0.17, 0.1, 0.11], 0.013)); },
      outfit(b, skin) { const w = M('#fffdf8', { rough: .6 });
        skirt(b, w, { key: 'boho', hem: 0.24, waist: 0.1, top: 0.33, curve: 0.8 });
        for (const y of [0.08, 0.16]) b.add(torus(M('#efe8dc'), [0, y, 0], 0.2 - y * 0.35, 0.006, Math.PI * 2, [Math.PI / 2, 0, 0]));
        bodice(b, w); b.add(cyl(M('#9fd8cb'), [0, 0.33, 0], 0.108, 0.025));
        b.add(mesh(VNECK(), skin, [0, 0.43, 0.1], [0.04, 0.08, 0.01], [0, 0, Math.PI]));
        for (const sx of [-1, 1]) b.add(sph(skin, [sx * 0.05, 0.02, 0.04], [0.042, 0.02, 0.062])); } }
  }
};

/* ---------------- 3D backdrops (about 1.5 m wide, ground at y = 0) ---------------- */
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
function flowerCluster(g, p, cols, R, n = 3, size = 0.035) {
  for (let k = 0; k < n; k++) { const f = flower(M(cols[Math.floor(R() * cols.length)], { rough: .7 }), M('#ffc94d'), size * (0.8 + R() * 0.5));
    f.position.set(p[0] + (R() - .5) * 0.06, p[1] + (R() - .5) * 0.06, p[2] + 0.03 + R() * 0.03); f.rotation.set((R() - .5) * 0.8, (R() - .5) * 0.8, R() * 6); g.add(f); }
}
const LEAF = () => geo('leaf', () => new THREE.SphereGeometry(1, 10, 6));
const BACK = {
  arch(g) {
    const R = rng(5), green = M('#7dbb6b', { rough: .7 }), leaf = [M('#5fa35a', { rough: .7 }), M('#7dbb6b', { rough: .7 })];
    const rad = 0.62, top = 0.75;
    g.add(torus(green, [0, top, -0.15], rad, 0.035, Math.PI));
    for (const sx of [-1, 1]) g.add(cyl(green, [sx * rad, top / 2, -0.15], 0.035, top));
    const pts = []; for (let y = 0.05; y < top; y += 0.08) { pts.push([-rad, y]); pts.push([rad, y]); }
    for (let i = 0; i <= 18; i++) { const a = Math.PI * i / 18; pts.push([Math.cos(a) * rad, top + Math.sin(a) * rad]); }
    for (const [x, y] of pts) { for (let k = 0; k < 2; k++) g.add(mesh(LEAF(), leaf[k], [x + (R() - .5) * 0.06, y + (R() - .5) * 0.06, -0.13], [0.045, 0.02, 0.012], [0, 0, R() * 6]));
      flowerCluster(g, [x, y, -0.15], ['#ffffff', '#ffd1d6', '#f79aa3', '#ffe9c2'], R, 1); }
    for (const dx of [-0.22, 0, 0.22]) { const yTop = top + Math.sqrt(rad * rad - dx * dx); g.add(cyl(INK, [dx, yTop - 0.09, -0.12], 0.003, 0.16));
      g.add(mesh(HEART(), M('#f47c86', { rough: .4 }), [dx, yTop - 0.19, -0.12], 0.045)); }
  },
  poruwa(g) {
    const white = M('#fffaf0', { rough: .5 }), maroon = M('#8a1538', { rough: .5 }), gold = GOLD();
    g.add(box(white, [0, 0.03, -0.05], [1.25, 0.06, 0.62])); g.add(box(gold, [0, 0.065, -0.05], [1.2, 0.012, 0.58]));
    for (let i = 0; i < 12; i++) g.add(flower(white, gold, 0.022).translateX(-0.55 + i * 0.1).translateY(0.03).translateZ(0.265));
    const px = 0.56, pz = [-0.32, 0.2];
    for (const sx of [-1, 1]) for (const z of pz) { g.add(cyl(white, [sx * px, 0.62, z], 0.035, 1.12)); for (let y = 0.2; y < 1.15; y += 0.22) g.add(torus(gold, [sx * px, y, z], 0.037, 0.008, Math.PI * 2, [Math.PI / 2, 0, 0]));
      for (let y = 0.15; y < 1.1; y += 0.07) g.add(bead(WHITE, [sx * px + Math.sin(y * 20) * 0.04, y, z + Math.cos(y * 20) * 0.04], 0.013)); }
    g.add(box(gold, [0, 1.19, -0.06], [1.24, 0.04, 0.66]));
    g.add(mesh(geo('roof', () => new THREE.ConeGeometry(1, 1, 4, 1)), maroon, [0, 1.38, -0.06], [0.95, 0.36, 0.55], [0, Math.PI / 4, 0]));
    g.add(cyl(gold, [0, 1.6, -0.06], 0.014, 0.12)); g.add(bead(gold, [0, 1.67, -0.06], 0.04));
    for (let x = -0.55; x <= 0.55; x += 0.1) { const len = 0.08 + (Math.round(x * 10) % 2 ? 0.06 : 0); for (let y = 0; y < len; y += 0.03) g.add(bead(WHITE, [x, 1.15 - y, 0.27], 0.012)); }
    // brass oil lamp
    const lamp = new THREE.Group(); lamp.position.set(-0.78, 0, 0.05); g.add(lamp);
    lamp.add(cyl(gold, [0, 0.02, 0], 0.09, 0.04)); lamp.add(cyl(gold, [0, 0.4, 0], 0.016, 0.76));
    for (const y of [0.18, 0.36, 0.54]) lamp.add(sph(gold, [0, y, 0], [0.04, 0.015, 0.04]));
    lamp.add(lathe(gold, [[0.001, 0], [0.04, 0.0], [0.11, 0.05], [0.12, 0.07], [0.001, 0.07]], [0, 0.78, 0], 'lampbowl'));
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; lamp.add(mesh(geo('flame', () => new THREE.ConeGeometry(1, 1, 12)), M('#ffb627', { glow: '#ff9f1c', gi: 1.2 }), [Math.cos(a) * 0.09, 0.9, Math.sin(a) * 0.09], [0.018, 0.06, 0.018])); }
  },
  mandap(g) {
    const red = M('#c62828', { rough: .5 }), mari = [M('#ff9f1c', { rough: .7 }), M('#ffd23f', { rough: .7 })], gold = GOLD();
    for (const sx of [-1, 1]) for (const z of [-0.3, 0.18]) { g.add(cyl(red, [sx * 0.56, 0.6, z], 0.04, 1.2));
      for (let y = 0.05; y < 1.2; y += 0.045) g.add(bead(mari[Math.round(y / 0.045) % 2], [sx * 0.56 + Math.cos(y * 18) * 0.045, y, z + Math.sin(y * 18) * 0.045], 0.02)); }
    g.add(box(red, [0, 1.24, -0.06], [1.3, 0.08, 0.6]));
    for (let x = -0.62; x <= 0.62; x += 0.06) g.add(sph(gold, [x, 1.19, 0.24], [0.03, 0.025, 0.012]));
    for (let x = -0.5; x <= 0.5; x += 0.1) { const len = 0.15 + (Math.round(x * 10) % 2 ? 0.1 : 0); for (let y = 0; y < len; y += 0.035) g.add(bead(mari[Math.round(y / 0.035) % 2], [x, 1.16 - y, 0.24], 0.017)); }
    g.add(mesh(geo('dome', () => new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2)), red, [0, 1.28, -0.06], [0.3, 0.16, 0.22]));
    g.add(bead(gold, [0, 1.47, -0.06], 0.04));
    for (const sx of [-1, 1]) { const x = sx * 0.85; g.add(cyl(M('#8bc34a'), [x, 0.35, -0.1], 0.04, 0.7));
      for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; g.add(mesh(LEAF(), M('#4caf50', { rough: .6 }), [x + Math.sin(a) * 0.17, 0.72 + Math.cos(a) * 0.12, -0.1], [0.2, 0.06, 0.015], [0, 0, Math.PI / 2 - a])); } }
  },
  lantern(g) {
    const em = M('#0f6b55', { rough: .45 }), gold = GOLD();
    const curve = new THREE.CatmullRomCurve3([[-0.62, 0], [-0.62, 0.7], [-0.55, 1.05], [-0.3, 1.32], [0, 1.52], [0.3, 1.32], [0.55, 1.05], [0.62, 0.7], [0.62, 0]].map(([x, y]) => new THREE.Vector3(x, y, -0.15)));
    g.add(mesh(geo('mugh', () => new THREE.TubeGeometry(curve, 80, 0.06, 14, false)), em));
    for (let i = 0; i <= 40; i++) { const p = curve.getPoint(i / 40); g.add(bead(gold, [p.x, p.y, p.z + 0.06], 0.012)); }
    g.add(bead(gold, [0, 1.6, -0.15], 0.05)); g.add(cyl(gold, [0, 1.7, -0.15], 0.01, 0.12));
    for (const [x, y, s] of [[-0.3, 1.0, 1], [0, 1.08, 1.2], [0.3, 1.0, 1]]) {
      const L = new THREE.Group(); L.position.set(x, y, -0.05); L.scale.setScalar(s); g.add(L);
      L.add(cyl(INK, [0, 0.16, 0], 0.003, 0.2)); L.add(cyl(gold, [0, 0.06, 0], 0.045, 0.03));
      L.add(lathe(M('#ffe08a', { glow: '#ffcf4a', gi: 0.7 }), [[0.001, -0.12], [0.04, -0.11], [0.06, -0.05], [0.055, 0.02], [0.035, 0.05], [0.001, 0.05]], [0, 0, 0], 'lant'));
      L.add(cyl(gold, [0, -0.125, 0], 0.035, 0.02));
    }
    for (const [x, y] of [[-0.45, 1.42], [0.45, 1.42], [-0.72, 1.15], [0.72, 1.15]]) g.add(mesh(STAR(), M('#f6d77a', { metal: .3, rough: .4 }), [x, y, -0.1], 0.04));
  },
  beach(g) {
    g.add(mesh(geo('sun', () => new THREE.CircleGeometry(1, 48)), M('#ffb36b', { glow: '#ff9a4a', gi: 0.5 }), [0, 0.95, -0.45], 0.55));
    g.add(box(M('#4fc3c7', { rough: .4 }), [0, 0.12, -0.42], [1.6, 0.24, 0.05]));
    for (const y of [0.2, 0.12]) g.add(box(WHITE, [0, y, -0.39], [1.4, 0.012, 0.01]));
    for (const sx of [-1, 1]) {
      const pts = [[0, 0], [sx * 0.04, 0.4], [sx * 0.12, 0.8], [sx * 0.24, 1.15]].map(([x, y]) => new THREE.Vector3(sx * 0.72 + x, y, -0.2));
      const c = new THREE.CatmullRomCurve3(pts);
      g.add(mesh(geo('trunk' + sx, () => new THREE.TubeGeometry(c, 30, 0.045, 10, false)), M('#a1683a', { rough: .8 })));
      for (let i = 1; i < 10; i++) { const p = c.getPoint(i / 10); g.add(torus(M('#8a5530', { rough: .8 }), [p.x, p.y, p.z], 0.046, 0.008, Math.PI * 2, [Math.PI / 2, 0, 0])); }
      const top = c.getPoint(1);
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const L = new THREE.Group(); L.position.copy(top); L.rotation.set(0, a, -0.5); g.add(L);
        L.add(mesh(LEAF(), M('#3e9a4a', { rough: .6 }), [0.17, -0.02, 0], [0.2, 0.025, 0.06])); }
      for (const [dx, dz] of [[0.03, 0.03], [-0.03, 0.02], [0, -0.03]]) g.add(sph(M('#7a4a2e', { rough: .6 }), [top.x + dx, top.y - 0.05, top.z + dz], 0.032));
    }
  }
};
const STAGE = { arch: '#ffd6dc', poruwa: '#f3d9a4', mandap: '#ffd9a8', lantern: '#cfe9df', beach: '#f6dfb0' };
const PARTICLE = { heart: ['heart', '#f47c86'], jasmine: ['flower', '#fffaf0'], marigold: ['flower', '#ff9f1c'], star: ['star', '#f6d77a'], hibiscus: ['flower', '#ff6f61'] };

/* ---------------- build ---------------- */
export async function buildScene3D(inv, guestName = '', { base = '', thumb = false } = {}) {
  await loadFonts(base);
  const tpl = getTemplate(inv.template), lang = inv.lang || 'en', col = tpl.colors;
  const root = new THREE.Group(); root.name = 'WeddingScene3D';
  const L = 16, FPS = 24, N = L * FPS + 1, times = [...Array(N)].map((_, i) => i / FPS), TAU = Math.PI * 2, tiny = 0.0001;
  const tracks = [], rest = [], q = new THREE.Quaternion(), e = new THREE.Euler();
  const add = (o, fp, fs, fr) => {
    rest.push([o, fp, fs, fr]);
    if (fp) tracks.push(new THREE.VectorKeyframeTrack(o.name + '.position', times, times.flatMap(fp)));
    if (fs) tracks.push(new THREE.VectorKeyframeTrack(o.name + '.scale', times, times.flatMap(fs)));
    if (fr) tracks.push(new THREE.QuaternionKeyframeTrack(o.name + '.quaternion', times, times.flatMap(t => { const r = fr(t); e.set(r[0], r[1], r[2]); q.setFromEuler(e); return [q.x, q.y, q.z, q.w]; })));
  };

  // stage + backdrop
  const stage = new THREE.Group(); stage.name = 'stage'; root.add(stage);
  stage.add(cyl(M(STAGE[tpl.backdrop], { rough: .7 }), [0, 0.02, 0], 0.78, 0.04));
  stage.add(torus(M(col.accent, { rough: .5 }), [0, 0.04, 0], 0.78, 0.012, Math.PI * 2, [Math.PI / 2, 0, 0]));
  const back = new THREE.Group(); back.name = 'backdrop'; back.position.y = 0.04; root.add(back); BACK[tpl.backdrop](back);

  // characters
  const SLOT = 3.2, speakers = ['G', 'B', 'G', 'B', 'GB'];
  const slotOf = t => Math.min(4, Math.floor(t / SLOT)), speaking = (w, t) => speakers[slotOf(t)].includes(w);
  const env = t => { const k = t % SLOT; return Math.min(1, k / 0.4) * Math.min(1, Math.max(0, (SLOT - k) / 0.4)); };
  const hop = t => { const k = t % SLOT; return k < 0.45 ? Math.sin(Math.PI * k / 0.45) : 0; };
  const baseY = tpl.backdrop === 'poruwa' ? 0.11 : 0.04;
  for (const [who, kind, x] of [['G', tpl.groom, -0.25], ['B', tpl.bride, 0.25]]) {
    const c = character(SPECS[who === 'G' ? 'groom' : 'bride'][kind], who); root.add(c.group);
    const ph = who === 'G' ? 0 : 1.3, blinkAt = who === 'G' ? 1.1 : 2.9, turn = who === 'G' ? 0.18 : -0.18, ws = c.waveSign;
    add(c.group, t => [x, baseY + 0.008 * Math.abs(Math.sin(TAU * t / 2 + ph)) + (speaking(who, t) ? 0.05 * hop(t) : 0), 0], null,
      t => [0, turn + (speaking(who, t) ? -turn * 0.6 * env(t) : 0), 0]);
    add(c.head, null, null, t => [speaking(who, t) ? 0.06 * env(t) * Math.sin(TAU * 2.2 * t) : 0.02 * Math.sin(TAU * t / 4), 0.12 * Math.sin(TAU * t / 8 + ph), 0.06 * Math.sin(TAU * t / 4 + ph)]);
    add(c.wave, null, null, t => [0, 0, ws * 2.35 + ws * (0.06 * Math.sin(TAU * t / 3 + ph) + (speaking(who, t) ? 0.38 * env(t) * Math.sin(TAU * 1.5 * t) : 0))]);
    add(c.hang, null, null, t => [0.06 * Math.sin(TAU * t / 2 + ph), 0, -ws * 0.12]);
    for (const lid of c.lids) add(lid, null, t => { const k = (t % 4) - blinkAt; const s = k >= 0 && k <= 0.16 ? Math.max(tiny, Math.sin(Math.PI * k / 0.16)) : tiny; return [1, s, 1]; }, null);
    add(c.mouth, null, t => { if (!speaking(who, t) || env(t) < 0.5) return [tiny, tiny, tiny]; const o = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(TAU * 4.2 * t + ph)); return [1, o, 1]; }, null);
  }

  // banner + bubbles (flat cards floating in front)
  const names = `${inv.groom || ''} & ${inv.bride || ''}`;
  const d = inv.date ? new Date(inv.date + 'T12:00:00') : null;
  const dateLine = d ? `${String(d.getDate()).padStart(2, '0')} · ${String(d.getMonth() + 1).padStart(2, '0')} · ${d.getFullYear()}` : '';
  const banner = plane(drawBanner(names, dateLine, col), 1.15, 1.15 * 330 / 1200, 'banner'); if (!thumb) root.add(banner);
  const bannerY = tpl.backdrop === 'poruwa' ? 1.88 : tpl.backdrop === 'lantern' ? 1.86 : 1.62;
  add(banner, t => [0, bannerY + 0.025 * Math.sin(TAU * t / 4), 0.1], null, t => [0, 0, 0.022 * Math.sin(TAU * t / 4 + 1)]);
  const texts = bubbleTexts(inv, guestName, lang), icons = ['ring', 'cal', 'clock', 'pin', 'heart'];
  const hatLift = tpl.groom === 'kandyan' ? 0.14 : 0;
  const anchor = { L: [-0.16, 1.12 + hatLift], R: [0.18, 1.1], C: [0, 1.2 + hatLift] };
  texts.forEach((b, i) => {
    const cv = drawBubble({ ...b, icon: icons[i], colors: col, day: d ? String(d.getDate()) : '' });
    const w = 0.66, h = w * cv.height / cv.width, m = plane(cv, w, h, 'bubble' + (i + 1));
    const [px, py] = BUBBLE_TIPS[b.side]; m.geometry.translate(-(px / cv.width - .5) * w, -(.5 - py / cv.height) * h, 0);
    m.position.set(anchor[b.side][0], anchor[b.side][1] + baseY, 0.32 + i * 0.004); if (!thumb) root.add(m);
    const t0 = i * SLOT, t1 = t0 + SLOT;
    add(m, null, tt => { let s = 0; if (tt >= t0 && tt <= t1) { const a = tt - t0, z = t1 - tt;
      if (a < 0.4) { const x = a / 0.4; s = Math.max(0, Math.min(1.15, 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2)); } else s = 1;
      if (z < 0.25) s *= z / 0.25; } s = Math.max(s, tiny); return [s, s, s]; }, null);
  });

  // floating 3D hearts / flowers / stars
  const [ptype, pcol] = PARTICLE[tpl.particle] || PARTICLE.heart;
  for (let i = 0; i < 9; i++) {
    const p = new THREE.Group(); p.name = 'float' + i; root.add(p);
    if (ptype === 'heart') p.add(mesh(HEART(), M(pcol, { rough: .35 }), [0, 0, 0], 0.045));
    else if (ptype === 'star') p.add(mesh(STAR(), M(pcol, { metal: .3, rough: .4 }), [0, 0, 0], 0.04));
    else p.add(flower(M(pcol, { rough: .6 }), M('#ffc94d'), 0.04));
    const ph = i / 9, x0 = (i % 2 ? 1 : -1) * (0.3 + ((i * 37) % 5) * 0.085), z0 = 0.05 + ((i * 13) % 4) * 0.08, sz = 0.7 + ((i * 7) % 4) * 0.15;
    add(p, t => { const u = (t / 4 + ph) % 1; return [x0 + 0.07 * Math.sin(TAU * (2 * u + ph)), 0.25 + 1.45 * u, z0]; },
      t => { const u = (t / 4 + ph) % 1, s = sz * Math.sin(Math.PI * u) + tiny; return [s, s, s]; },
      t => { const u = (t / 4 + ph) % 1; return [0.3 * Math.sin(TAU * u), TAU * u, 0.3 * Math.sin(TAU * u * 2)]; });
  }
  // sparkles (gold stars that twinkle)
  [[-0.74, 1.3], [0.76, 1.15], [-0.62, 0.5], [0.66, 0.6], [-0.45, 1.75], [0.5, 1.72], [0.85, 1.55], [-0.86, 1.6]].forEach(([x, y], i) => {
    const s = new THREE.Group(); s.name = 'spark' + i; s.position.set(x, y, 0.1); root.add(s); s.add(mesh(STAR(), M('#ffd66b', { glow: '#ffcf4a', gi: 0.5 }), [0, 0, 0], 0.03));
    const ph = i * 0.37; add(s, null, t => { const v = Math.pow(Math.max(0, Math.sin(TAU * (t / 2 + ph))), 2) * 1.1 + tiny; return [v, v, v]; }, t => [0, 0, (Math.PI / 2.5) * (t / 4) * 2]);
  });

  // resting pose for viewers without animation (iPhone Quick Look)
  const RT = 1.6;
  for (const [o, fp, fs, fr] of rest) { if (fp) o.position.fromArray(fp(RT)); if (fs) o.scale.fromArray(fs(RT)); if (fr) o.rotation.set(...fr(RT)); }
  root.traverse(o => { if (/_mouth$/.test(o.name)) o.scale.set(tiny, tiny, tiny); });
  const b2 = root.getObjectByName('bubble2'); if (b2) b2.scale.set(1, 1, 1);
  return { root, clip: new THREE.AnimationClip('Celebrate', L, tracks) };
}
