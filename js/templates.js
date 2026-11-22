// Original character & backdrop artwork for the 5 templates.
// Every character is drawn in a 360 x 760 box (feet on y = 750) and split into
// parts so the AR engine can animate them: hairBack, body, head, lids, mouth, arm.
export const O = '#3b2318';           // outline ink
const SW = 5;
const SK = { light: '#f6d2b8', medium: '#e9b48f', tan: '#d69a72', deep: '#a8714f' };
export const SKIN_TONES = { light: 'Light', medium: 'Medium', tan: 'Tan', deep: 'Deep' };

/* ---------- small helpers ---------- */
const tube = (pts, w, fill) => {
  const d = 'M' + pts.map(p => p.join(' ')).join(' L');
  return `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w + 10}" stroke-linecap="round" stroke-linejoin="round"/>` +
         `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
};
const hand = (x, y, skin, r = 18) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${skin}" stroke="${O}" stroke-width="${SW}"/>` +
  `<path d="M${x - 8} ${y - r + 4} q3 -10 7 0 M${x} ${y - r + 2} q3 -11 7 0" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`;
const flower = (x, y, r, c, centre = '#ffc94d', petals = 5) => {
  let s = `<g transform="translate(${x} ${y})">`;
  for (let i = 0; i < petals; i++) s += `<circle cx="0" cy="${-r * .72}" r="${r * .6}" fill="${c}" stroke="${O}" stroke-width="3.5" transform="rotate(${i * 360 / petals})"/>`;
  return s + `<circle r="${r * .38}" fill="${centre}" stroke="${O}" stroke-width="3.5"/></g>`;
};
const dots = (x0, y0, x1, y1, step, r, c, clip) => {
  let s = clip ? `<g clip-path="url(#${clip})">` : '<g>';
  for (let y = y0; y <= y1; y += step) for (let x = x0 + ((y / step) % 2 ? step / 2 : 0); x <= x1; x += step)
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  return s + '</g>';
};

/* ---------- face (shared) ---------- */
const EYES = [[135, 205], [225, 205]];
function face(skin, { ears = true, lashes = false, bindi = false, tilak = false } = {}) {
  let s = '';
  if (ears) s += `<circle cx="70" cy="208" r="20" fill="${skin}" stroke="${O}" stroke-width="${SW}"/><circle cx="290" cy="208" r="20" fill="${skin}" stroke="${O}" stroke-width="${SW}"/>`;
  s += `<ellipse cx="180" cy="192" rx="112" ry="106" fill="${skin}" stroke="${O}" stroke-width="${SW}"/>`;
  s += `<ellipse cx="110" cy="240" rx="19" ry="10" fill="#ff8f9a" opacity=".5"/><ellipse cx="250" cy="240" rx="19" ry="10" fill="#ff8f9a" opacity=".5"/>`;
  for (const [x, y] of EYES) s += `<ellipse cx="${x}" cy="${y}" rx="14" ry="19" fill="${O}"/><circle cx="${x + 5}" cy="${y - 7}" r="5.5" fill="#fff"/><circle cx="${x - 4}" cy="${y + 7}" r="2.6" fill="#fff"/>`;
  if (lashes) s += `<path d="M117 196 l-9 -6 M253 196 l9 -6 M120 189 l-7 -9 M250 189 l7 -9" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<path d="M118 172 Q135 163 152 170 M208 170 Q225 163 242 172" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="M176 229 Q180 233 184 229" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<path d="M160 250 Q180 267 200 250" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`;
  if (bindi) s += `<circle cx="180" cy="163" r="6" fill="#c8102e" stroke="${O}" stroke-width="2"/>`;
  if (tilak) s += `<path d="M162 140 H198 M164 148 H196 M166 156 H194" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="180" cy="150" r="5" fill="#c8102e"/>`;
  return s;
}
const lidsSvg = skin => EYES.map(([x, y]) => `<ellipse cx="${x}" cy="${y - 2}" rx="19" ry="24" fill="${skin}"/>`).join('') +
  `<path d="M118 206 Q135 216 152 206 M208 206 Q225 216 242 206" fill="none" stroke="${O}" stroke-width="4.5" stroke-linecap="round"/>`;
const mouthSvg = `<path d="M156 248 Q180 253 204 248 Q201 284 180 286 Q159 284 156 248Z" fill="#8c2433" stroke="${O}" stroke-width="4.5" stroke-linejoin="round"/><ellipse cx="180" cy="276" rx="11" ry="6" fill="#ff8f9a"/>`;

/* ---------- arms ---------- */
// waving arm (raised). side 'L' = screen-left arm, 'R' = screen-right arm
function wavingArm(side, sleeve, skin, { cuff = null, rolled = false, bangles = false, w = 30, stripes = null } = {}) {
  const m = side === 'L' ? 1 : -1, X = x => side === 'L' ? x : 360 - x;
  const sh = [X(102), 336], el = [X(40), 318], wr = [X(12), 262];
  let s = '';
  if (rolled) { s += tube([sh, el], 30, sleeve) + tube([el, wr], 24, skin); }
  else s += tube([sh, el, wr], w, sleeve);
  if (stripes) s += stripeBands(el, wr, stripes, w);
  if (cuff) s += `<circle cx="${wr[0]}" cy="${wr[1]}" r="16" fill="${cuff}" stroke="${O}" stroke-width="4"/>`;
  if (bangles) s += `<ellipse cx="${wr[0]}" cy="${wr[1] + 2}" rx="17" ry="7" fill="#f2c14e" stroke="${O}" stroke-width="3"/><ellipse cx="${wr[0]}" cy="${wr[1] + 10}" rx="16" ry="6" fill="#f2c14e" stroke="${O}" stroke-width="3"/>`;
  s += hand(X(6), 240, skin);
  const box = side === 'L' ? [-26, 208, 158, 156] : [228, 208, 158, 156];
  return { svg: s, box, pivot: sh, down: hangingArm(side, sleeve, skin, { cuff, rolled, bangles, w, stripes }) };
}
// coloured bands across a sleeve, between elbow and wrist
function stripeBands(el, wr, cols, w) {
  let s = ''; const n = cols.length;
  for (let i = 0; i < n; i++) { const t = 0.15 + 0.7 * i / n, t2 = 0.15 + 0.7 * (i + 1) / n;
    const a = [el[0] + (wr[0] - el[0]) * t, el[1] + (wr[1] - el[1]) * t], b = [el[0] + (wr[0] - el[0]) * t2, el[1] + (wr[1] - el[1]) * t2];
    s += `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="${cols[i]}" stroke-width="${w}" stroke-linecap="butt"/>`; }
  return s;
}
// hanging arm (inside body part)
function hangingArm(side, sleeve, skin, { cuff = null, rolled = false, bangles = false, len = 1, w = 30, stripes = null } = {}) {
  const X = x => side === 'L' ? x : 360 - x;
  const sh = [X(98), 340], el = [X(80), 430], wr = [X(74), 500];
  let s = rolled ? tube([sh, el], 30, sleeve) + tube([el, wr], 24, skin) : tube([sh, el, wr], w, sleeve);
  if (stripes) s += stripeBands(el, wr, stripes, w);
  if (cuff) s += `<circle cx="${wr[0]}" cy="${wr[1]}" r="16" fill="${cuff}" stroke="${O}" stroke-width="4"/>`;
  if (bangles) s += `<ellipse cx="${wr[0]}" cy="${wr[1] - 2}" rx="17" ry="7" fill="#f2c14e" stroke="${O}" stroke-width="3"/><ellipse cx="${wr[0]}" cy="${wr[1] + 6}" rx="16" ry="6" fill="#f2c14e" stroke="${O}" stroke-width="3"/>`;
  return s + hand(X(73), 520, skin);
}
const neck = skin => `<rect x="160" y="276" width="40" height="44" fill="${skin}" stroke="${O}" stroke-width="${SW}"/>`;
const garland = () => {
  let s = '';
  for (let i = 0; i <= 16; i++) { const t = i / 16, a = Math.PI * t, x = 180 - 72 * Math.cos(a), y = 330 + 150 * Math.sin(a);
    s += `<circle cx="${x}" cy="${y}" r="12" fill="${i % 3 === 1 ? '#e2264d' : i % 3 === 2 ? '#ff9f1c' : '#fffaf0'}" stroke="${O}" stroke-width="3"/>`; }
  return s;
};

/* =================== GROOMS =================== */
function groom(kind, sk) {
  const skin = sk || { kandyan: SK.medium, classic: SK.light, tamil: SK.tan, muslim: SK.medium, beach: SK.medium, chinese: SK.light, indian: SK.tan, korean: SK.light, rustic: SK.light, royal: SK.medium }[kind];
  let body = '', head = face(skin, { tilak: kind === 'tamil' }), hairBack = '', arm;
  const shortHair = (c, style = 0) => `<path d="M68 196 Q60 98 150 80 Q230 66 282 120 Q300 150 292 198 Q276 150 250 142 Q220 160 180 140 Q150 160 112 146 Q86 160 68 196Z" fill="${c}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>` +
    (style ? `<path d="M150 84 Q190 96 206 126 M118 96 Q140 110 146 134" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>` : `<path d="M170 82 Q200 100 210 128" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>`);
  if (kind === 'classic') {
    body += `<rect x="120" y="540" width="56" height="186" fill="#2b1d1a" stroke="${O}" stroke-width="${SW}"/><rect x="184" y="540" width="56" height="186" fill="#2b1d1a" stroke="${O}" stroke-width="${SW}"/>`;
    body += `<ellipse cx="146" cy="733" rx="36" ry="14" fill="#1b1210" stroke="${O}" stroke-width="4"/><ellipse cx="214" cy="733" rx="36" ry="14" fill="#1b1210" stroke="${O}" stroke-width="4"/>`;
    body += neck(skin) + `<path d="M98 332 Q180 304 262 332 L276 575 Q180 592 84 575Z" fill="#2b1d1a" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M150 318 L180 430 L210 318 Q180 310 150 318Z" fill="#fff" stroke="${O}" stroke-width="4"/>`;
    body += `<path d="M150 318 L180 430 L134 368Z M210 318 L180 430 L226 368Z" fill="#3d2a25" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`;
    body += `<path d="M160 322 L180 334 L160 346Z M200 322 L180 334 L200 346Z" fill="${O}"/><circle cx="180" cy="334" r="6" fill="${O}"/>`;
    body += `<circle cx="180" cy="465" r="6" fill="#fff" opacity=".5"/><circle cx="180" cy="505" r="6" fill="#fff" opacity=".5"/>` + flower(228, 372, 14, '#fff');
    body += hangingArm('R', '#2b1d1a', skin, { cuff: '#fff' });
    head += shortHair('#7a4a2e', 1);
    arm = wavingArm('L', '#2b1d1a', skin, { cuff: '#fff' });
  }
  if (kind === 'kandyan') {
    body += `<path d="M108 540 L252 540 L262 716 L98 716Z" fill="#f6ecd3" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M140 552 L134 712 M170 552 L168 712 M200 552 L204 712 M228 552 L236 712" stroke="#d9c79c" stroke-width="4"/><path d="M100 682 H260 M99 696 H261" stroke="#c9a24a" stroke-width="5"/>`;
    body += `<rect x="116" y="712" width="128" height="14" fill="#fff" stroke="${O}" stroke-width="4"/><ellipse cx="146" cy="735" rx="34" ry="13" fill="#5a2a1a" stroke="${O}" stroke-width="4"/><ellipse cx="214" cy="735" rx="34" ry="13" fill="#5a2a1a" stroke="${O}" stroke-width="4"/>`;
    body += neck(skin) + `<ellipse cx="96" cy="356" rx="42" ry="38" fill="#5e1224" stroke="${O}" stroke-width="${SW}"/><ellipse cx="264" cy="356" rx="42" ry="38" fill="#5e1224" stroke="${O}" stroke-width="${SW}"/>`;
    body += `<circle cx="96" cy="356" r="17" fill="none" stroke="#f2c14e" stroke-width="4"/><circle cx="96" cy="356" r="8" fill="#f2c14e"/><circle cx="264" cy="356" r="17" fill="none" stroke="#f2c14e" stroke-width="4"/><circle cx="264" cy="356" r="8" fill="#f2c14e"/>`;
    body += `<path d="M104 330 Q180 304 256 330 L266 560 L94 560Z" fill="#5e1224" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M166 318 V552 M194 318 V552 M98 548 H262" stroke="#f2c14e" stroke-width="5"/><rect x="164" y="306" width="32" height="20" rx="6" fill="#f2c14e" stroke="${O}" stroke-width="3"/>`;
    for (let y = 352; y < 530; y += 34) body += flower(144, y, 7, '#f2c14e', '#c8102e') + flower(216, y, 7, '#f2c14e', '#c8102e');
    body += `<rect x="92" y="514" width="176" height="28" fill="#fff" stroke="${O}" stroke-width="4"/><rect x="92" y="522" width="176" height="11" fill="#c8102e"/>`;
    body += hangingArm('R', '#5e1224', skin, { cuff: '#f2c14e' });
    // Kandyan-style four-cornered hat (original design)
    head += shortHair('#1d1412');
    head += `<path d="M58 150 Q180 112 302 150 L322 84 Q180 30 38 84Z" fill="#5e1224" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    head += `<path d="M66 140 Q180 106 294 140 L310 92 Q180 46 50 92Z" fill="none" stroke="#f29f2e" stroke-width="7" stroke-linejoin="round"/><path d="M180 46 V118" stroke="#f29f2e" stroke-width="6"/>`;
    for (const [x, y] of [[96, 104], [130, 92], [230, 92], [264, 104], [112, 128], [248, 128]]) head += flower(x, y, 9, '#f6c445', '#c8102e');
    head += `<path d="M180 46 V8 M180 22 Q166 22 162 10 M180 22 Q194 22 198 10" stroke="${O}" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M180 46 V8 M180 22 Q166 22 162 10 M180 22 Q194 22 198 10" stroke="#f6c445" stroke-width="6" stroke-linecap="round" fill="none"/>`;
    head += `<circle cx="180" cy="8" r="9" fill="#f6c445" stroke="${O}" stroke-width="3"/><circle cx="162" cy="9" r="7" fill="#f6c445" stroke="${O}" stroke-width="3"/><circle cx="198" cy="9" r="7" fill="#f6c445" stroke="${O}" stroke-width="3"/>`;
    arm = wavingArm('L', '#5e1224', skin, { cuff: '#f2c14e' });
  }
  if (kind === 'tamil') {
    body += `<path d="M110 540 L250 540 L258 724 L102 724Z" fill="#fffaf0" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><rect x="103" y="692" width="155" height="18" fill="#e0b040" stroke="${O}" stroke-width="3"/><path d="M180 545 L184 720" stroke="#e8dcc0" stroke-width="4"/>`;
    body += `<ellipse cx="148" cy="735" rx="30" ry="11" fill="${skin}" stroke="${O}" stroke-width="4"/><ellipse cx="212" cy="735" rx="30" ry="11" fill="${skin}" stroke="${O}" stroke-width="4"/><path d="M130 732 h36 M194 732 h36" stroke="#8a5a2a" stroke-width="5"/>`;
    body += neck(skin) + `<path d="M100 332 Q180 304 260 332 L266 560 L94 560Z" fill="#fff4dc" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M168 312 V430" stroke="#e0b040" stroke-width="6"/><circle cx="180" cy="350" r="4" fill="#e0b040"/><circle cx="180" cy="380" r="4" fill="#e0b040"/><circle cx="180" cy="410" r="4" fill="#e0b040"/>`;
    body += `<path d="M98 336 L140 328 L270 530 L238 552Z" fill="#fffaf0" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M108 340 L246 546 M132 330 L264 528" stroke="#e0b040" stroke-width="5"/>`;
    body += garland() + hangingArm('R', '#fff4dc', skin, { cuff: '#e0b040' });
    head += shortHair('#141010', 1);
    arm = wavingArm('L', '#fff4dc', skin, { cuff: '#e0b040' });
  }
  if (kind === 'muslim') {
    body += `<rect x="128" y="600" width="48" height="122" fill="#fffdf6" stroke="${O}" stroke-width="${SW}"/><rect x="184" y="600" width="48" height="122" fill="#fffdf6" stroke="${O}" stroke-width="${SW}"/>`;
    body += `<path d="M112 722 Q150 716 182 732 Q150 746 112 740Z M248 722 Q210 716 178 732 Q210 746 248 740Z" fill="#d4a548" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`;
    body += neck(skin) + `<path d="M98 332 Q180 304 262 332 L286 652 L74 652Z" fill="#f3e3c0" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<rect x="78" y="616" width="204" height="30" fill="#d4a548" stroke="${O}" stroke-width="3"/>` + dots(86, 624, 276, 640, 14, 3.5, '#fff6d8');
    body += `<rect x="160" y="304" width="40" height="22" rx="5" fill="#d4a548" stroke="${O}" stroke-width="3"/><path d="M180 326 V612" stroke="#d4a548" stroke-width="6"/>`;
    for (let y = 350; y < 600; y += 34) body += `<circle cx="180" cy="${y}" r="6" fill="#f6d77a" stroke="${O}" stroke-width="2.5"/>`;
    body += `<path d="M226 318 L258 332 L252 640 L222 640Z" fill="#7a1f3d" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>` + dots(228, 360, 250, 630, 22, 3, '#f6d77a');
    body += hangingArm('R', '#f3e3c0', skin, { cuff: '#d4a548' });
    head += shortHair('#1d1412');
    head += `<path d="M92 120 Q180 46 268 120 L264 140 Q180 112 96 140Z" fill="#f3e3c0" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>` + dots(110, 112, 250, 126, 16, 3.5, '#d4a548');
    arm = wavingArm('L', '#f3e3c0', skin, { cuff: '#d4a548' });
  }
  if (kind === 'beach') {
    body += `<rect x="122" y="540" width="54" height="166" fill="#e8d5b0" stroke="${O}" stroke-width="${SW}"/><rect x="184" y="540" width="54" height="166" fill="#e8d5b0" stroke="${O}" stroke-width="${SW}"/>`;
    body += `<rect x="120" y="694" width="58" height="16" fill="#f1e2c3" stroke="${O}" stroke-width="4"/><rect x="182" y="694" width="58" height="16" fill="#f1e2c3" stroke="${O}" stroke-width="4"/>`;
    body += `<ellipse cx="148" cy="730" rx="28" ry="12" fill="${skin}" stroke="${O}" stroke-width="4"/><ellipse cx="212" cy="730" rx="28" ry="12" fill="${skin}" stroke="${O}" stroke-width="4"/>`;
    body += neck(skin) + `<path d="M98 332 Q180 306 262 332 L270 562 L90 562Z" fill="#fdfdf6" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M156 314 L180 370 L204 314" fill="${skin}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M148 314 L170 352 L180 370 M212 314 L190 352" fill="none" stroke="${O}" stroke-width="4"/>`;
    body += `<path d="M180 370 V556" stroke="#d8d8cc" stroke-width="4"/><circle cx="180" cy="410" r="4" fill="#bbb"/><circle cx="180" cy="460" r="4" fill="#bbb"/><circle cx="180" cy="510" r="4" fill="#bbb"/>`;
    body += `<rect x="94" y="548" width="172" height="16" fill="#8a5a3a" stroke="${O}" stroke-width="3"/>` + flower(222, 380, 13, '#ff6f61', '#ffd166');
    body += hangingArm('R', '#fdfdf6', skin, { rolled: true });
    head += `<path d="M66 198 Q52 100 140 76 Q220 58 284 112 Q306 150 294 200 Q284 156 262 150 Q248 128 220 146 Q196 120 166 144 Q140 124 116 150 Q90 150 66 198Z" fill="#6b3f26" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    arm = wavingArm('L', '#fdfdf6', skin, { rolled: true });
  }
  if (EXTRA_G[kind]) ({ body, head, hairBack, arm } = EXTRA_G[kind](skin, head));
  return finish({ skin, body, head, hairBack, arm });
}

/* =================== BRIDES =================== */
function bride(kind, sk) {
  const skin = sk || { kandyan: SK.medium, classic: SK.light, tamil: SK.tan, muslim: SK.light, beach: SK.medium, chinese: SK.light, indian: SK.tan, korean: SK.light, rustic: SK.light, royal: SK.medium }[kind];
  const hijab = kind === 'muslim';
  let body = '', head = '', hairBack = '', arm;
  head += face(skin, { ears: !hijab, lashes: true, bindi: kind === 'tamil' });
  const centrePart = c => `<path d="M68 200 Q54 84 180 80 Q306 84 292 200 Q280 140 236 116 Q206 104 180 112 Q154 104 124 116 Q80 140 68 200Z" fill="${c}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M180 86 V112" stroke="${O}" stroke-width="4"/><path d="M110 104 Q140 92 168 96 M250 104 Q220 92 192 96" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>`;
  const earring = (c = '#f2c14e') => `<path d="M70 226 v14 M290 226 v14" stroke="${O}" stroke-width="3"/><path d="M58 240 h24 l-12 22Z M278 240 h24 l-12 22Z" fill="${c}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
  if (kind === 'classic') {
    hairBack += `<path d="M66 190 Q40 330 72 470 L288 470 Q320 330 294 190Z" fill="#7a4a2e" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    hairBack += `<path d="M120 110 Q30 300 40 640 L320 640 Q330 300 240 110Z" fill="#ffffff" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>` + dots(60, 560, 300, 630, 22, 4, '#e7dcd6');
    body += `<path d="M126 430 Q92 600 42 728 Q180 760 318 728 Q268 600 234 430Z" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    for (let x = 52; x < 312; x += 30) body += `<path d="M${x} 724 q15 16 30 2" fill="none" stroke="${O}" stroke-width="4"/>` + flower(x + 15, 700, 7, '#fff', '#f7c6cf');
    body += `<path d="M116 610 L112 700 M180 600 V716 M244 610 L248 700" stroke="#e6dcd6" stroke-width="4"/>`;
    body += neck(skin) + `<path d="M108 338 Q180 316 252 338 L240 448 Q180 462 120 448Z" fill="${skin}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M116 370 Q150 352 180 380 Q210 352 244 370 L236 448 Q180 462 124 448Z" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<rect x="122" y="430" width="116" height="20" rx="8" fill="#f7c6cf" stroke="${O}" stroke-width="4"/>` + flower(180, 440, 12, '#fff', '#f7c6cf');
    body += hangingArm('L', '#fff', skin);
    body += `<path d="M86 540 L76 600 M86 540 L98 602" stroke="#f47c86" stroke-width="8" stroke-linecap="round"/>`;
    for (const [x, y, c] of [[70, 512, '#fff'], [96, 506, '#f7c6cf'], [84, 488, '#fff'], [62, 488, '#f7c6cf'], [106, 486, '#fff']]) body += flower(x, y, 12, c);
    head += `<path d="M68 196 Q60 96 180 84 Q300 96 292 196 Q276 146 238 132 Q232 160 196 150 Q186 120 150 140 Q120 156 96 150 Q78 168 68 196Z" fill="#7a4a2e" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    for (let i = 0; i < 7; i++) head += flower(96 + i * 28, 104 - Math.sin(i / 6 * Math.PI) * 18, 11, i % 2 ? '#fff' : '#f7c6cf');
    arm = wavingArm('R', '#fff', skin);
  }
  if (kind === 'kandyan') {
    hairBack += `<ellipse cx="180" cy="96" rx="70" ry="44" fill="#1d1412" stroke="${O}" stroke-width="${SW}"/>`;
    body += `<defs><clipPath id="ksk"><path d="M118 470 L104 730 L256 730 L242 470Z"/></clipPath></defs>`;
    body += `<path d="M118 470 L104 730 L256 730 L242 470Z" fill="#fffaf0" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>` + dots(110, 560, 250, 724, 18, 4.5, '#f2b632', 'ksk');
    body += `<path d="M104 712 H256" stroke="#f2b632" stroke-width="8"/><ellipse cx="150" cy="738" rx="26" ry="10" fill="#f2b632" stroke="${O}" stroke-width="4"/><ellipse cx="210" cy="738" rx="26" ry="10" fill="#f2b632" stroke="${O}" stroke-width="4"/>`;
    body += neck(skin) + `<path d="M104 336 Q180 310 256 336 L246 480 L114 480Z" fill="#f6b82e" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>` + dots(118, 350, 244, 470, 14, 3.5, '#ffe08a');
    body += `<ellipse cx="102" cy="356" rx="34" ry="30" fill="#f6b82e" stroke="${O}" stroke-width="${SW}"/><ellipse cx="258" cy="356" rx="34" ry="30" fill="#f6b82e" stroke="${O}" stroke-width="${SW}"/>`;
    // osariya frill + drape
    body += `<path d="M106 470 Q124 492 142 470 Q160 492 178 470 Q196 492 214 470 Q232 492 250 470 L254 506 Q234 528 214 506 Q196 528 178 506 Q160 528 142 506 Q124 528 106 506Z" fill="#fffaf0" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>` + dots(112, 486, 248, 506, 16, 3.5, '#f2b632');
    body += `<path d="M150 330 L232 336 L212 470 L170 470Z" fill="#fffaf0" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>` + dots(170, 350, 222, 460, 14, 3.2, '#f2b632');
    for (let k = 0; k < 3; k++) body += `<path d="M${140 - k * 8} 322 Q180 ${396 + k * 34} ${220 + k * 8} 322" fill="none" stroke="${k === 1 ? '#e8743b' : '#f2b632'}" stroke-width="${6 - k}" stroke-dasharray="${k === 1 ? '7 5' : '0'}"/>`;
    body += `<circle cx="180" cy="398" r="15" fill="#e8743b" stroke="${O}" stroke-width="3"/><circle cx="180" cy="398" r="6" fill="#c8102e"/><circle cx="180" cy="436" r="10" fill="#f2b632" stroke="${O}" stroke-width="3"/>`;
    body += hangingArm('L', skin, skin, { bangles: true });
    head += centrePart('#1d1412');
    head += `<path d="M66 176 Q180 104 294 176" fill="none" stroke="#f2b632" stroke-width="7"/><path d="M70 182 Q180 112 290 182" fill="none" stroke="${O}" stroke-width="2"/>`;
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (0.08 + 0.84 * i / 12); head += `<circle cx="${180 - 116 * Math.cos(a)}" cy="${178 - 70 * Math.sin(a) + 6}" r="4" fill="#f2b632"/>`; }
    head += `<path d="M180 66 V140" stroke="#f2b632" stroke-width="6"/>` + flower(180, 78, 11, '#f6c445', '#e8743b') + flower(180, 110, 10, '#f6c445', '#e8743b') + flower(180, 142, 9, '#f6c445', '#c8102e') + earring();
    arm = wavingArm('R', skin, skin, { bangles: true });
  }
  if (kind === 'tamil') {
    hairBack += `<path d="M164 120 Q150 300 170 470 L190 470 Q210 300 196 120Z" fill="#141010" stroke="${O}" stroke-width="4"/>`;
    for (let y = 150; y < 470; y += 22) hairBack += `<circle cx="${180 + (y % 44 ? 14 : -14)}" cy="${y}" r="9" fill="#fff" stroke="${O}" stroke-width="2.5"/>`;
    body += `<path d="M120 470 L104 730 L256 730 L240 470Z" fill="#b3122e" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M104 700 H256" stroke="#e7b53c" stroke-width="18"/><path d="M104 712 H256" stroke="${O}" stroke-width="2"/>`;
    body += `<path d="M150 480 L144 700 M166 480 L164 700 M182 480 L184 700 M198 480 L204 700" stroke="#8c0d24" stroke-width="4"/>`;
    body += `<ellipse cx="150" cy="738" rx="26" ry="10" fill="${skin}" stroke="${O}" stroke-width="4"/><ellipse cx="210" cy="738" rx="26" ry="10" fill="${skin}" stroke="${O}" stroke-width="4"/>`;
    body += neck(skin) + `<path d="M104 336 Q180 310 256 336 L246 480 L114 480Z" fill="#7a0d22" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<ellipse cx="102" cy="356" rx="32" ry="28" fill="#7a0d22" stroke="${O}" stroke-width="${SW}"/><ellipse cx="258" cy="356" rx="32" ry="28" fill="#7a0d22" stroke="${O}" stroke-width="${SW}"/>`;
    body += `<path d="M232 330 L262 344 L130 560 L104 540Z" fill="#b3122e" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M246 336 L118 552" stroke="#e7b53c" stroke-width="10"/>`;
    body += `<path d="M140 322 Q180 380 220 322" fill="none" stroke="#e7b53c" stroke-width="10"/>` + `<circle cx="180" cy="372" r="12" fill="#e7b53c" stroke="${O}" stroke-width="3"/><circle cx="180" cy="372" r="5" fill="#2e7d32"/>`;
    body += garland() + hangingArm('L', '#7a0d22', skin, { bangles: true, cuff: '#e7b53c' });
    head += centrePart('#141010');
    head += `<path d="M180 84 V146" stroke="#e7b53c" stroke-width="5"/><circle cx="180" cy="150" r="9" fill="#e7b53c" stroke="${O}" stroke-width="3"/><circle cx="180" cy="150" r="4" fill="#c8102e"/>` + earring('#e7b53c');
    for (let i = 0; i < 6; i++) head += `<circle cx="${252 + i * 6}" cy="${112 + i * 14}" r="8" fill="#fff" stroke="${O}" stroke-width="2.5"/>`;
    arm = wavingArm('R', '#7a0d22', skin, { bangles: true, cuff: '#e7b53c' });
  }
  if (kind === 'muslim') {
    // hijab: outer shape drawn behind the face, front band on top
    head = `<path d="M56 220 Q44 70 180 60 Q316 70 304 220 Q300 300 250 312 L110 312 Q60 300 56 220Z" fill="#f7d6dc" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>` + face(skin, { ears: false, lashes: true });
    head += `<path d="M70 196 Q70 96 180 94 Q290 96 290 196 Q272 128 180 122 Q88 128 70 196Z" fill="#f7d6dc" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    head += `<path d="M84 150 Q180 92 276 150" fill="none" stroke="#d4a548" stroke-width="6"/>` + flower(180, 110, 11, '#fff', '#d4a548');
    body += `<path d="M118 470 Q100 620 70 730 Q180 752 290 730 Q260 620 242 470Z" fill="#fff6f4" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M72 712 Q180 734 288 712" fill="none" stroke="#d4a548" stroke-width="10"/>` + `<path d="M180 480 V700" stroke="#d4a548" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round"/>`;
    body += neck(skin) + `<path d="M104 336 Q180 310 256 336 L246 480 L114 480Z" fill="#fff6f4" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<rect x="112" y="462" width="136" height="20" rx="8" fill="#d4a548" stroke="${O}" stroke-width="3"/>`;
    body += `<path d="M106 300 Q180 330 254 300 L270 420 Q180 450 90 420Z" fill="#f7d6dc" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M96 410 Q180 440 264 410" fill="none" stroke="#d4a548" stroke-width="5"/>`;
    body += hangingArm('L', '#fff6f4', skin, { cuff: '#d4a548' });
    arm = wavingArm('R', '#fff6f4', skin, { cuff: '#d4a548' });
  }
  if (kind === 'beach') {
    hairBack += `<path d="M64 190 Q30 300 60 420 Q90 470 110 440 L250 440 Q270 470 300 420 Q330 300 296 190Z" fill="#4a2c1d" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M130 420 Q96 590 60 724 Q120 744 150 726 Q180 748 210 726 Q240 744 300 724 Q264 590 230 420Z" fill="#fffdf8" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M96 610 Q180 630 264 610 M80 670 Q180 692 280 670" fill="none" stroke="#e8e1d6" stroke-width="5"/>`;
    body += `<ellipse cx="150" cy="736" rx="24" ry="10" fill="${skin}" stroke="${O}" stroke-width="4"/><ellipse cx="210" cy="736" rx="24" ry="10" fill="${skin}" stroke="${O}" stroke-width="4"/><path d="M132 730 h30" stroke="#f2c14e" stroke-width="3"/>`;
    body += neck(skin) + `<path d="M108 338 Q180 318 252 338 L236 430 L124 430Z" fill="#fffdf8" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M150 322 L180 378 L210 322" fill="${skin}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`;
    body += `<rect x="122" y="420" width="116" height="16" rx="7" fill="#9fd8cb" stroke="${O}" stroke-width="3"/>`;
    body += hangingArm('L', skin, skin, { rolled: true });
    for (const [x, y, c] of [[70, 506, '#ff6f61'], [94, 498, '#ffd166'], [80, 482, '#ff9e80']]) body += flower(x, y, 12, c, '#fff3b0');
    body += `<path d="M58 520 l-14 22 M100 520 l14 20" stroke="#4caf50" stroke-width="8" stroke-linecap="round"/>`;
    head += `<path d="M66 198 Q48 90 180 82 Q312 90 294 198 Q284 140 250 120 Q220 150 180 126 Q150 148 116 130 Q82 150 66 198Z" fill="#4a2c1d" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    head += flower(270, 130, 22, '#ff6f61', '#ffd166', 5) + `<path d="M246 116 l-22 -12 M252 150 l-20 10" stroke="#4caf50" stroke-width="8" stroke-linecap="round"/>`;
    arm = wavingArm('R', skin, skin, { rolled: true });
  }
  if (EXTRA_B[kind]) ({ body, head, hairBack, arm } = EXTRA_B[kind](skin, head));
  return finish({ skin, body, head, hairBack, arm });
}

function finish({ skin, body, head, hairBack, arm }) {
  return {
    parts: {
      hairBack: hairBack ? { svg: hairBack, box: [20, 40, 320, 640] } : null,
      body: { svg: body, box: [20, 270, 320, 486] },
      head: { svg: head, box: [20, 0, 320, 330] },
      lids: { svg: lidsSvg(skin), box: [112, 178, 136, 56] },
      mouth: { svg: mouthSvg, box: [150, 242, 60, 50] },
      arm: { svg: arm.svg, box: arm.box }
    },
    armDown: arm.down,
    neck: [180, 300], shoulder: arm.pivot, lidTop: 178
  };
}

/* =================== BACKDROPS (1000 x 1150, ground at y = 1130) =================== */
const heartPath = 'M128 222 C40 160 10 112 14 72 C18 30 52 10 86 12 C108 14 122 28 128 44 C134 28 148 14 170 12 C204 10 238 30 242 72 C246 112 216 160 128 222Z';
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

function archFlowers(seed, flowerCols, leafCols, tube = '#9ccf8a') {
  const R = rng(seed), pts = [], cx = 500, cy = 520, rad = 400; let h = '';
  for (let y = 1120; y >= cy; y -= 34) pts.push([cx - rad, y]);
  for (let i = 0; i <= 40; i++) { const a = Math.PI + Math.PI * i / 40; pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); }
  for (let y = cy; y <= 1120; y += 34) pts.push([cx + rad, y]);
  const d = `M${cx - rad} 1130 V${cy} A${rad} ${rad} 0 0 1 ${cx + rad} ${cy} V1130`;
  h += `<path d="${d}" fill="none" stroke="${O}" stroke-width="58" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${tube}" stroke-width="44" stroke-linecap="round"/>`;
  pts.forEach(([x, y]) => { for (let k = 0; k < 2; k++) { const l = 34 + R() * 16;
    h += `<path d="M0 0 Q${l * .5} -${l * .42} ${l} 0 Q${l * .5} ${l * .42} 0 0Z" fill="${leafCols[k % leafCols.length]}" stroke="${O}" stroke-width="5" transform="translate(${x + (R() - .5) * 30} ${y + (R() - .5) * 30}) rotate(${R() * 360})"/>`; } });
  pts.forEach(([x, y], i) => { if (i % 2 && R() < .5) return; h += flower(x + (R() - .5) * 26, y + (R() - .5) * 26, 16 + R() * 14, flowerCols[Math.floor(R() * flowerCols.length)]); });
  return h;
}

const BACKDROPS = {
  arch() {
    let h = archFlowers(11, ['#ffffff', '#ffd1d6', '#f79aa3', '#ffe9c2'], ['#7dbb6b', '#5fa35a']);
    [-160, 0, 160].forEach((dx, k) => { const x = 500 + dx, top = 520 - Math.sqrt(400 * 400 - dx * dx) + 20, len = 110 + k % 2 * 50;
      h += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + len}" stroke="${O}" stroke-width="5"/><path transform="translate(${x - 26} ${top + len - 6}) scale(.2)" d="${heartPath}" fill="#f47c86" stroke="${O}" stroke-width="22"/>`; });
    return h;
  },
  poruwa() {
    let h = '';
    // oil lamp (left)
    h += `<path d="M60 1128 h120 l-20 -30 h-80Z" fill="#d9a227" stroke="${O}" stroke-width="5" stroke-linejoin="round"/><rect x="108" y="700" width="24" height="400" fill="#d9a227" stroke="${O}" stroke-width="5"/>`;
    for (const y of [760, 860, 960, 1040]) h += `<ellipse cx="120" cy="${y}" rx="30" ry="12" fill="#e9bd45" stroke="${O}" stroke-width="4"/>`;
    h += `<path d="M50 700 Q120 740 190 700 L170 680 H70Z" fill="#e9bd45" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>`;
    for (const x of [72, 120, 168]) h += `<path d="M${x} 678 q-12 -26 0 -46 q12 20 0 46Z" fill="#ffb627" stroke="${O}" stroke-width="3.5"/><path d="M${x} 672 q-5 -12 0 -22 q5 10 0 22Z" fill="#fff3b0"/>`;
    // platform
    h += `<path d="M200 1130 H900 L880 1080 H220Z" fill="#fffaf0" stroke="${O}" stroke-width="6" stroke-linejoin="round"/><path d="M230 1060 H870 L880 1080 H220Z" fill="#d9a227" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>`;
    for (let x = 240; x < 880; x += 40) h += flower(x, 1106, 9, '#fff', '#d9a227');
    // pillars
    for (const x of [260, 840]) { h += `<rect x="${x - 22}" y="420" width="44" height="640" fill="#fffaf0" stroke="${O}" stroke-width="6"/>`;
      for (let y = 460; y < 1060; y += 90) h += `<rect x="${x - 26}" y="${y}" width="52" height="16" fill="#d9a227" stroke="${O}" stroke-width="4"/>`;
      for (let y = 430; y < 1050; y += 30) h += `<circle cx="${x + (y % 60 ? 16 : -16)}" cy="${y}" r="8" fill="#fff" stroke="${O}" stroke-width="2.5"/>`; }
    // roof
    h += `<path d="M200 430 H900 L940 470 H160Z" fill="#d9a227" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>`;
    h += `<path d="M220 430 Q550 250 880 430Z" fill="#8a1538" stroke="${O}" stroke-width="6" stroke-linejoin="round"/><path d="M300 420 Q550 300 800 420" fill="none" stroke="#f2c14e" stroke-width="8"/>`;
    h += `<path d="M550 290 V200" stroke="${O}" stroke-width="16" stroke-linecap="round"/><path d="M550 290 V200" stroke="#f2c14e" stroke-width="9" stroke-linecap="round"/><circle cx="550" cy="190" r="22" fill="#f2c14e" stroke="${O}" stroke-width="5"/>`;
    for (let x = 230; x <= 870; x += 40) h += `<path d="M${x} 470 v${36 + (x % 80 ? 20 : 0)}" stroke="${O}" stroke-width="3"/><circle cx="${x}" cy="${510 + (x % 80 ? 20 : 0)}" r="9" fill="#fff" stroke="${O}" stroke-width="3"/>`;
    for (const x of [340, 450, 650, 760]) h += flower(x, 380 - (x === 450 || x === 650 ? 30 : 0), 16, '#f6c445', '#c8102e');
    return h;
  },
  mandap() {
    let h = '';
    for (const x of [90, 910]) { // banana plants
      h += `<rect x="${x - 16}" y="760" width="32" height="370" fill="#8bc34a" stroke="${O}" stroke-width="5"/>`;
      for (const [a, l] of [[-60, 200], [-20, 230], [25, 220], [60, 190]]) h += `<path d="M0 0 Q${l * .5} -60 ${l} 0 Q${l * .5} 40 0 0Z" fill="#4caf50" stroke="${O}" stroke-width="5" transform="translate(${x} 770) rotate(${a - 90 + (x > 500 ? 0 : 0)})"/>`;
    }
    for (const x of [230, 770]) { h += `<rect x="${x - 26}" y="380" width="52" height="750" fill="#c62828" stroke="${O}" stroke-width="6"/>`;
      for (let y = 400; y < 1120; y += 26) h += `<circle cx="${x + Math.sin(y / 30) * 20}" cy="${y}" r="11" fill="${(y / 26) % 2 < 1 ? '#ff9f1c' : '#ffd23f'}" stroke="${O}" stroke-width="3"/>`; }
    h += `<path d="M150 400 H850 L820 330 Q500 230 180 330Z" fill="#c62828" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>`;
    for (let x = 150; x < 850; x += 50) h += `<path d="M${x} 400 q25 34 50 0" fill="#e7b53c" stroke="${O}" stroke-width="4"/>`;
    for (let x = 190; x <= 810; x += 52) { const len = 90 + ((x / 52) % 2 ? 60 : 0); for (let y = 440; y < 440 + len; y += 20) h += `<circle cx="${x}" cy="${y}" r="9" fill="${(y / 20) % 2 < 1 ? '#ff9f1c' : '#ffd23f'}" stroke="${O}" stroke-width="2.5"/>`; }
    for (let x = 200; x < 820; x += 34) h += `<path d="M0 0 Q12 20 0 42 Q-12 20 0 0Z" fill="#2e7d32" stroke="${O}" stroke-width="3" transform="translate(${x} 336)"/>`;
    h += `<path d="M500 250 l20 30 h-40Z" fill="#e7b53c" stroke="${O}" stroke-width="4"/><circle cx="500" cy="240" r="14" fill="#e7b53c" stroke="${O}" stroke-width="4"/>`;
    return h;
  },
  lantern() {
    let h = '';
    const d = 'M170 1130 V600 Q170 380 500 170 Q830 380 830 600 V1130';
    h += `<path d="${d}" fill="none" stroke="${O}" stroke-width="80" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#0f6b55" stroke-width="66" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#d4a548" stroke-width="8" stroke-linejoin="round" stroke-dasharray="18 12"/>`;
    for (let i = 0; i < 26; i++) { const t = i / 25; const y = 1100 - t * 500; h += `<circle cx="170" cy="${y}" r="6" fill="#f6d77a"/><circle cx="830" cy="${y}" r="6" fill="#f6d77a"/>`; }
    h += `<circle cx="500" cy="150" r="30" fill="#d4a548" stroke="${O}" stroke-width="5"/><path d="M500 120 V70" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M500 120 V70" stroke="#d4a548" stroke-width="5" stroke-linecap="round"/>`;
    const lantern = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -120 V-60" stroke="${O}" stroke-width="5"/><path d="M-26 -60 h52 l10 16 h-72Z" fill="#d4a548" stroke="${O}" stroke-width="5" stroke-linejoin="round"/><path d="M-36 -44 Q-52 20 -26 64 H26 Q52 20 36 -44Z" fill="#ffe08a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/><path d="M-12 -40 V60 M12 -40 V60 M-34 10 H34" stroke="#d4a548" stroke-width="5"/><path d="M-30 64 h60 l-10 18 h-40Z" fill="#d4a548" stroke="${O}" stroke-width="5" stroke-linejoin="round"/></g>`;
    h += lantern(330, 470, 1) + lantern(500, 420, 1.2) + lantern(670, 470, 1);
    for (const [x, y] of [[250, 300], [750, 300], [400, 230], [600, 230]]) h += `<path d="M${x} ${y - 18} L${x + 5} ${y - 5} L${x + 18} ${y} L${x + 5} ${y + 5} L${x} ${y + 18} L${x - 5} ${y + 5} L${x - 18} ${y} L${x - 5} ${y - 5}Z" fill="#f6d77a" stroke="${O}" stroke-width="3"/>`;
    return h;
  },
  beach() {
    let h = '';
    h += `<circle cx="500" cy="560" r="290" fill="#ffb36b" stroke="${O}" stroke-width="6"/><circle cx="500" cy="560" r="230" fill="#ffcf7a"/>`;
    for (const [y, w] of [[600, 520], [660, 540], [720, 560]]) h += `<rect x="${500 - w / 2}" y="${y}" width="${w}" height="16" rx="8" fill="#fff3d6" opacity=".9"/>`;
    h += `<path d="M120 850 Q300 800 500 840 T880 830 V1130 H120Z" fill="#4fc3c7" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>`;
    h += `<path d="M140 900 q40 -24 80 0 t80 0 t80 0 M600 920 q40 -24 80 0 t80 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`;
    h += `<path d="M120 1020 Q500 980 880 1020 V1130 H120Z" fill="#f6dfb0" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>`;
    const palm = (x, flip) => { const f = flip ? -1 : 1; let s = `<path d="M${x} 1120 Q${x + 40 * f} 800 ${x + 120 * f} 470" fill="none" stroke="${O}" stroke-width="44" stroke-linecap="round"/><path d="M${x} 1120 Q${x + 40 * f} 800 ${x + 120 * f} 470" fill="none" stroke="#a1683a" stroke-width="32" stroke-linecap="round"/>`;
      for (let y = 1080; y > 520; y -= 50) s += `<path d="M${x - 14 + (1120 - y) / 650 * 110 * f} ${y} h28" stroke="${O}" stroke-width="4"/>`;
      for (const a of [-150, -110, -60, -20, 25]) s += `<path d="M0 0 Q90 -50 200 10 Q100 -10 0 0Z" fill="#3e9a4a" stroke="${O}" stroke-width="5" stroke-linejoin="round" transform="translate(${x + 120 * f} 470) rotate(${flip ? 180 - a : a})"/>`;
      return s + `<circle cx="${x + 110 * f}" cy="486" r="16" fill="#7a4a2e" stroke="${O}" stroke-width="4"/><circle cx="${x + 132 * f}" cy="494" r="16" fill="#7a4a2e" stroke="${O}" stroke-width="4"/>`; };
    h += palm(130, false) + palm(870, true);
    return h;
  }
};

/* particles that float up (drawn in a 256 x 240 box) */
const PARTICLES = {
  heart: `<path d="${heartPath}" fill="#f47c86" stroke="${O}" stroke-width="10" stroke-linejoin="round"/><ellipse cx="78" cy="62" rx="20" ry="13" fill="#fff" opacity=".85" transform="rotate(-30 78 62)"/>`,
  jasmine: `<g transform="translate(128 120)">${[0, 1, 2, 3, 4].map(i => `<ellipse cx="0" cy="-52" rx="30" ry="52" fill="#fffaf0" stroke="${O}" stroke-width="8" transform="rotate(${i * 72})"/>`).join('')}<circle r="22" fill="#f2c14e" stroke="${O}" stroke-width="7"/></g>`,
  marigold: `<g transform="translate(128 120)">${[...Array(12)].map((_, i) => `<circle cx="0" cy="-62" r="38" fill="${i % 2 ? '#ff9f1c' : '#ffb627'}" stroke="${O}" stroke-width="7" transform="rotate(${i * 30})"/>`).join('')}<circle r="40" fill="#ff8f00" stroke="${O}" stroke-width="7"/></g>`,
  star: `<path d="M128 8 L156 88 L240 92 L174 142 L198 226 L128 176 L58 226 L82 142 L16 92 L100 88Z" fill="#f6d77a" stroke="${O}" stroke-width="10" stroke-linejoin="round"/>`,
  hibiscus: `<g transform="translate(128 120)">${[0, 1, 2, 3, 4].map(i => `<path d="M0 0 Q-50 -40 -20 -100 Q0 -80 20 -100 Q50 -40 0 0Z" fill="#ff6f61" stroke="${O}" stroke-width="8" stroke-linejoin="round" transform="rotate(${i * 72})"/>`).join('')}<circle r="16" fill="#ffd166" stroke="${O}" stroke-width="6"/></g>`
};
const SPARK = `<path d="M100 8 Q112 88 192 100 Q112 112 100 192 Q88 112 8 100 Q88 88 100 8Z" fill="#ffd66b" stroke="${O}" stroke-width="7" stroke-linejoin="round"/>`;

/* =================== TEMPLATES =================== */
export const TEMPLATES = [
  { id: 'kandyan', name: 'Kandyan Traditional', tagline: 'Osariya & Kandyan dress on a golden Poruwa',
    colors: { bg: '#fff4e0', ink: '#3b1d14', accent: '#8a1538', accent2: '#d9a227', card: '#fffaf2', ribbon: '#8a1538', ribbonDark: '#5e0f26', ribbonText: '#f6d77a' },
    backdrop: 'poruwa', particle: 'jasmine', groom: 'kandyan', bride: 'kandyan' },
  { id: 'classic', name: 'Classic White', tagline: 'Gown & tuxedo under a flower arch',
    colors: { bg: '#ffe4e8', ink: '#3b2318', accent: '#e0606e', accent2: '#f7c6cf', card: '#fffaf8', ribbon: '#f79aa3', ribbonDark: '#e0606e', ribbonText: '#3b2318' },
    backdrop: 'arch', particle: 'heart', groom: 'classic', bride: 'classic' },
  { id: 'tamil', name: 'Tamil Hindu', tagline: 'Silk saree & veshti in a marigold mandap',
    colors: { bg: '#fff1e0', ink: '#3b1a10', accent: '#b3122e', accent2: '#ff9f1c', card: '#fffaf2', ribbon: '#b3122e', ribbonDark: '#7a0d22', ribbonText: '#ffd23f' },
    backdrop: 'mandap', particle: 'marigold', groom: 'tamil', bride: 'tamil' },
  { id: 'muslim', name: 'Muslim Elegance', tagline: 'Hijab bride & sherwani groom under lantern light',
    colors: { bg: '#eaf6f0', ink: '#14302a', accent: '#0f6b55', accent2: '#d4a548', card: '#fbfffd', ribbon: '#0f6b55', ribbonDark: '#0a4a3b', ribbonText: '#f6d77a' },
    backdrop: 'lantern', particle: 'star', groom: 'muslim', bride: 'muslim' },
  { id: 'beach', name: 'Tropical Beach', tagline: 'Boho dress & linen shirt at sunset',
    colors: { bg: '#e3f6f4', ink: '#163b3a', accent: '#ff6f61', accent2: '#1b998b', card: '#fbfffe', ribbon: '#ff8a65', ribbonDark: '#e2553f', ribbonText: '#fff8ef' },
    backdrop: 'beach', particle: 'hibiscus', groom: 'beach', bride: 'beach' }
];
export const getTemplate = id => TEMPLATES.find(t => t.id === id) || TEMPLATES[0];

export function templateArt(t, o = {}) {
  return { groom: groom(t.groom, SK[o.groomSkin]), bride: bride(t.bride, SK[o.brideSkin]), backdrop: BACKDROPS[t.backdrop](), particle: PARTICLES[t.particle], spark: SPARK };
}
export const svgDoc = (inner, [x, y, w, h], scale = 1) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w * scale)}" height="${Math.round(h * scale)}" viewBox="${x} ${y} ${w} ${h}">${inner}</svg>`;

/* small flat preview (SVG string) of a template: backdrop + couple */
export function thumbnailSVG(t, w = 300, o = {}) {
  const a = templateArt(t, o);
  const ch = (c, x) => { const p = c.parts; return `<svg x="${x}" y="${1150 - 760 * 1.25}" width="${360 * 1.25}" height="${760 * 1.25}" viewBox="-30 0 420 760" overflow="visible">${p.hairBack ? p.hairBack.svg : ''}${p.body.svg}${p.head.svg}${p.arm.svg}</svg>`; };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 60 1000 1090" width="${w}" role="img" aria-label="${t.name} wedding invitation: cartoon bride and groom" style="display:block;width:100%;height:auto">${a.backdrop}${ch(a.groom, 500 - 440)}${ch(a.bride, 500 - 30)}</svg>`;
}

/* =====================================================================
   NEW THEMES (2D): Chinese Red · Indian Royal · Korean Hanbok · Rustic Garden · Royal Night
   ===================================================================== */
const hairShort = (c, shine = true) => `<path d="M68 196 Q60 98 150 80 Q230 66 282 120 Q300 150 292 198 Q276 150 250 142 Q220 160 180 140 Q150 160 112 146 Q86 160 68 196Z" fill="${c}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>` +
  (shine ? `<path d="M170 82 Q200 100 210 128" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>` : '');
const hairSlick = c => `<path d="M68 196 Q58 92 170 78 Q262 70 290 130 Q300 160 292 196 Q282 150 258 132 Q200 108 120 128 Q90 140 68 196Z" fill="${c}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M120 108 Q180 90 240 104" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>`;
const hairPart = c => `<path d="M68 200 Q54 84 180 80 Q306 84 292 200 Q280 140 236 116 Q206 104 180 112 Q154 104 124 116 Q80 140 68 200Z" fill="${c}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M180 86 V112" stroke="${O}" stroke-width="4"/>`;
const hairWavy = c => `<path d="M66 198 Q48 90 180 82 Q312 90 294 198 Q284 140 250 120 Q220 150 180 126 Q150 148 116 130 Q82 150 66 198Z" fill="${c}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
const jhumka = c => `<path d="M70 226 v12 M290 226 v12" stroke="${O}" stroke-width="3"/><path d="M58 238 h24 l-12 22Z M278 238 h24 l-12 22Z" fill="${c}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><circle cx="70" cy="264" r="4" fill="${c}"/><circle cx="290" cy="264" r="4" fill="${c}"/>`;
const shoes = (c, y = 734) => `<ellipse cx="146" cy="${y}" rx="34" ry="13" fill="${c}" stroke="${O}" stroke-width="4"/><ellipse cx="214" cy="${y}" rx="34" ry="13" fill="${c}" stroke="${O}" stroke-width="4"/>`;
const frogs = (x, y0, n, step, c) => { let s = ''; for (let i = 0; i < n; i++) { const y = y0 + i * step; s += `<path d="M${x - 14} ${y} h28" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle cx="${x - 14}" cy="${y}" r="5" fill="${c}"/><circle cx="${x + 14}" cy="${y}" r="5" fill="${c}"/>`; } return s; };
const bouquet2d = (x, y, cols, leaf = '#4caf50') => {
  let s = `<path d="M${x} ${y + 20} l-10 40 M${x} ${y + 20} l10 40" stroke="${leaf}" stroke-width="7" stroke-linecap="round"/>`;
  for (const [dx, dy, i] of [[-16, 6, 0], [14, 4, 1], [0, -12, 2], [-24, -10, 1], [24, -12, 0]]) s += flower(x + dx, y + dy, 12, cols[i % cols.length]);
  return s;
};

const EXTRA_G = {
  chinese(skin, head) {
    let body = `<rect x="124" y="640" width="50" height="84" fill="#1f1a1a" stroke="${O}" stroke-width="${SW}"/><rect x="186" y="640" width="50" height="84" fill="#1f1a1a" stroke="${O}" stroke-width="${SW}"/>` + shoes('#141010');
    body += neck(skin) + `<path d="M100 332 Q180 306 260 332 L278 692 Q180 708 82 692Z" fill="#c8102e" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M86 668 Q180 684 274 668" fill="none" stroke="#f2c14e" stroke-width="8"/>` + flower(130, 620, 11, '#f2c14e', '#c8102e') + flower(230, 610, 11, '#f2c14e', '#c8102e');
    body += `<path d="M98 332 Q180 306 262 332 L270 482 Q180 496 90 482Z" fill="#2a1d1d" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>` + frogs(180, 360, 4, 30, '#f2c14e');
    body += `<rect x="158" y="298" width="44" height="22" rx="6" fill="#2a1d1d" stroke="#f2c14e" stroke-width="4"/>`;
    body += `<path d="M108 338 L180 402 L252 338" fill="none" stroke="${O}" stroke-width="22" stroke-linejoin="round"/><path d="M108 338 L180 402 L252 338" fill="none" stroke="#e0182f" stroke-width="14" stroke-linejoin="round"/>`;
    body += `<path d="M170 420 L156 480 M190 420 L204 480" stroke="${O}" stroke-width="16" stroke-linecap="round"/><path d="M170 420 L156 480 M190 420 L204 480" stroke="#e0182f" stroke-width="9" stroke-linecap="round"/>`;
    body += `<circle cx="180" cy="404" r="36" fill="#e0182f" stroke="${O}" stroke-width="${SW}"/>` + [0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="180" cy="386" rx="11" ry="17" fill="#ff4d5e" stroke="${O}" stroke-width="2.5" transform="rotate(${i * 60} 180 404)"/>`).join('') + `<circle cx="180" cy="404" r="10" fill="#f2c14e" stroke="${O}" stroke-width="3"/>`;
    body += hangingArm('R', '#2a1d1d', skin, { cuff: '#c8102e' });
    return { body, head: head + hairShort('#151111'), hairBack: '', arm: wavingArm('L', '#2a1d1d', skin, { cuff: '#c8102e' }) };
  },
  indian(skin, head) {
    let body = `<rect x="128" y="600" width="48" height="122" fill="#fffaf0" stroke="${O}" stroke-width="${SW}"/><rect x="184" y="600" width="48" height="122" fill="#fffaf0" stroke="${O}" stroke-width="${SW}"/>`;
    body += `<path d="M138 650 h28 M138 672 h28 M194 650 h28 M194 672 h28" stroke="#e6dcc4" stroke-width="4"/>`;
    body += `<path d="M112 722 Q150 716 182 732 Q150 746 104 742Z M248 722 Q210 716 178 732 Q210 746 256 742Z" fill="#d9a227" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`;
    body += neck(skin) + `<path d="M98 332 Q180 304 262 332 L286 652 L74 652Z" fill="#fbf1dc" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<rect x="78" y="618" width="204" height="30" fill="#d9a227" stroke="${O}" stroke-width="3"/>` + dots(86, 626, 276, 642, 14, 3.5, '#fff3c4');
    body += `<path d="M180 322 V614" stroke="#d9a227" stroke-width="9"/><rect x="160" y="302" width="40" height="22" rx="5" fill="#d9a227" stroke="${O}" stroke-width="3"/>`;
    for (let y = 350; y < 600; y += 34) body += `<circle cx="180" cy="${y}" r="6" fill="#fff" stroke="${O}" stroke-width="2.5"/>`;
    for (let i = 0; i <= 14; i++) { const t = i / 14, a = Math.PI * t; body += `<circle cx="${180 - 66 * Math.cos(a)}" cy="${330 + 120 * Math.sin(a)}" r="6" fill="#fff" stroke="${O}" stroke-width="2"/>`; }
    body += `<path d="M222 318 L256 330 L252 640 L218 640Z" fill="#8c1d40" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M226 330 L222 636 M250 334 L248 636" stroke="#d9a227" stroke-width="4"/>`;
    body += hangingArm('R', '#fbf1dc', skin, { cuff: '#d9a227' });
    let h = head + `<path d="M64 200 q6 -20 18 -26 M296 200 q-6 -20 -18 -26" stroke="#151111" stroke-width="10" stroke-linecap="round"/>`;
    h += `<path d="M58 182 Q50 64 180 54 Q310 64 302 182 Q278 120 180 114 Q82 120 58 182Z" fill="#f39c34" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    h += `<path d="M76 150 Q180 80 290 140 M70 126 Q190 66 284 112 M96 98 Q200 52 266 88" fill="none" stroke="#d9781c" stroke-width="6" stroke-linecap="round"/>`;
    h += `<path d="M196 92 Q236 30 272 22 Q240 50 214 94" fill="#fff" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>`;
    h += `<circle cx="196" cy="100" r="17" fill="#d9a227" stroke="${O}" stroke-width="4"/><circle cx="196" cy="100" r="7" fill="#c8102e"/>` + [0, 1, 2].map(i => `<circle cx="${184 + i * 12}" cy="${124 + (i % 2) * 4}" r="4" fill="#fff" stroke="${O}" stroke-width="1.5"/>`).join('');
    return { body, head: h, hairBack: '', arm: wavingArm('L', '#fbf1dc', skin, { cuff: '#d9a227' }) };
  },
  korean(skin, head) {
    let body = neck(skin) + shoes('#1c1c1c', 734) + `<path d="M98 332 Q180 304 262 332 L290 714 Q180 730 70 714Z" fill="#1f3f7a" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M180 470 V712" stroke="#163066" stroke-width="5"/>`;
    body += `<ellipse cx="180" cy="324" rx="40" ry="16" fill="#1f3f7a" stroke="${O}" stroke-width="4"/><path d="M146 322 Q180 342 214 322" fill="none" stroke="#fff" stroke-width="6"/>`;
    body += `<rect x="140" y="378" width="80" height="78" rx="6" fill="#e2b34a" stroke="${O}" stroke-width="4"/><rect x="148" y="386" width="64" height="62" rx="4" fill="none" stroke="#1f3f7a" stroke-width="3"/>`;
    body += `<ellipse cx="180" cy="420" rx="16" ry="10" fill="#fff" stroke="${O}" stroke-width="2.5"/><path d="M168 416 Q150 396 160 392 Q170 402 176 412 M192 416 Q210 396 200 392 Q190 402 184 412" fill="#fff" stroke="${O}" stroke-width="2.5"/><path d="M190 414 q10 -18 2 -26" fill="none" stroke="${O}" stroke-width="3"/><circle cx="192" cy="387" r="3" fill="#c8102e"/>`;
    body += `<path d="M90 500 Q180 524 270 500 L272 522 Q180 546 88 522Z" fill="#c8102e" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>` + [110, 145, 215, 250].map(x => `<rect x="${x - 7}" y="${x < 180 ? 506 + (x - 110) / 10 : 506 + (250 - x) / 10}" width="14" height="12" rx="3" fill="#a5d6a7" stroke="${O}" stroke-width="2"/>`).join('');
    body += hangingArm('R', '#1f3f7a', skin, { w: 40 });
    let h = head + `<path d="M66 204 q4 -22 16 -30 M294 204 q-4 -22 -16 -30" stroke="#151111" stroke-width="10" stroke-linecap="round"/>`;
    h += `<ellipse cx="58" cy="132" rx="42" ry="13" fill="#1c1c1c" stroke="${O}" stroke-width="4" transform="rotate(-8 58 132)"/><ellipse cx="302" cy="132" rx="42" ry="13" fill="#1c1c1c" stroke="${O}" stroke-width="4" transform="rotate(8 302 132)"/>`;
    h += `<path d="M96 158 Q94 72 180 64 Q266 72 264 158Z" fill="#1c1c1c" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><ellipse cx="180" cy="80" rx="54" ry="30" fill="#262626" stroke="${O}" stroke-width="4"/><rect x="94" y="142" width="172" height="18" rx="6" fill="#111" stroke="${O}" stroke-width="3"/>`;
    return { body, head: h, hairBack: '', arm: wavingArm('L', '#1f3f7a', skin, { w: 40 }) };
  },
  rustic(skin, head) {
    let body = `<rect x="122" y="540" width="54" height="180" fill="#b98b5e" stroke="${O}" stroke-width="${SW}"/><rect x="184" y="540" width="54" height="180" fill="#b98b5e" stroke="${O}" stroke-width="${SW}"/>` + shoes('#5d3a1f');
    body += neck(skin) + `<path d="M98 332 Q180 306 262 332 L270 556 L90 556Z" fill="#fdfdf6" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M180 340 V550" stroke="#dcdcd0" stroke-width="4"/>` + [380, 430, 480, 528].map(y => `<circle cx="180" cy="${y}" r="4" fill="#c9c2b0"/>`).join('');
    body += `<rect x="90" y="540" width="180" height="22" fill="#a77b50" stroke="${O}" stroke-width="4"/>`;
    body += `<path d="M138 330 L146 548 M222 330 L214 548" stroke="${O}" stroke-width="16"/><path d="M138 330 L146 548 M222 330 L214 548" stroke="#7a4f2a" stroke-width="10"/><rect x="138" y="532" width="16" height="12" fill="#cfcfcf" stroke="${O}" stroke-width="2"/><rect x="206" y="532" width="16" height="12" fill="#cfcfcf" stroke="${O}" stroke-width="2"/>`;
    body += `<path d="M160 322 L180 334 L160 346Z M200 322 L180 334 L200 346Z" fill="#7a4f2a" stroke="${O}" stroke-width="3"/><circle cx="180" cy="334" r="6" fill="#7a4f2a" stroke="${O}" stroke-width="2"/>`;
    body += `<path d="M232 392 q-14 -20 -6 -34 q12 12 6 34Z M240 394 q2 -24 16 -30 q2 18 -16 30Z" fill="#8fb07a" stroke="${O}" stroke-width="2.5"/>` + flower(234, 392, 9, '#fff', '#f2c14e');
    body += hangingArm('R', '#fdfdf6', skin, { rolled: true });
    return { body, head: head + hairWavy('#8a5a3a'), hairBack: '', arm: wavingArm('L', '#fdfdf6', skin, { rolled: true }) };
  },
  royal(skin, head) {
    let body = `<rect x="122" y="550" width="54" height="176" fill="#111" stroke="${O}" stroke-width="${SW}"/><rect x="184" y="550" width="54" height="176" fill="#111" stroke="${O}" stroke-width="${SW}"/>` + shoes('#050505');
    body += neck(skin) + `<path d="M98 332 Q180 304 262 332 L276 578 Q180 594 84 578Z" fill="#1f2a5a" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M150 318 L180 430 L210 318 Q180 310 150 318Z" fill="#fff" stroke="${O}" stroke-width="4"/>`;
    body += `<path d="M150 318 L180 430 L132 372Z M210 318 L180 430 L228 372Z" fill="#0c0c14" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`;
    body += `<path d="M160 322 L180 334 L160 346Z M200 322 L180 334 L200 346Z" fill="${O}"/><circle cx="180" cy="334" r="6" fill="${O}"/><circle cx="180" cy="470" r="7" fill="#d4a548" stroke="${O}" stroke-width="2"/>`;
    body += `<path d="M214 384 h34 l-6 -22 l-8 14 l-6 -18 l-6 18 l-8 -12Z" fill="#d4a548" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
    body += hangingArm('R', '#1f2a5a', skin, { cuff: '#fff' });
    return { body, head: head + hairSlick('#141018'), hairBack: '', arm: wavingArm('L', '#1f2a5a', skin, { cuff: '#fff' }) };
  }
};

const EXTRA_B = {
  chinese(skin, head) {
    const hairBack = `<ellipse cx="180" cy="98" rx="66" ry="42" fill="#151111" stroke="${O}" stroke-width="${SW}"/>`;
    let body = `<path d="M128 470 Q118 600 122 728 L238 728 Q242 600 232 470Z" fill="#c8102e" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M226 600 L236 726" stroke="${O}" stroke-width="3"/><path d="M122 722 H238" stroke="#f2c14e" stroke-width="6"/>`;
    body += flower(156, 560, 15, '#f2c14e', '#c8102e', 6) + flower(206, 640, 17, '#f2c14e', '#c8102e', 6) + flower(160, 690, 10, '#f2c14e', '#c8102e', 6);
    body += `<path d="M150 610 q20 -30 48 -14 q-24 6 -30 30" fill="none" stroke="#f2c14e" stroke-width="4" stroke-linecap="round"/>`;
    body += `<ellipse cx="152" cy="737" rx="22" ry="9" fill="#c8102e" stroke="${O}" stroke-width="4"/><ellipse cx="208" cy="737" rx="22" ry="9" fill="#c8102e" stroke="${O}" stroke-width="4"/>`;
    body += neck(skin) + `<path d="M106 336 Q180 312 254 336 L240 480 L120 480Z" fill="#c8102e" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<ellipse cx="102" cy="350" rx="26" ry="22" fill="#c8102e" stroke="${O}" stroke-width="${SW}"/><ellipse cx="258" cy="350" rx="26" ry="22" fill="#c8102e" stroke="${O}" stroke-width="${SW}"/>`;
    body += `<rect x="156" y="288" width="48" height="30" rx="8" fill="#c8102e" stroke="#f2c14e" stroke-width="4"/>`;
    body += `<path d="M180 322 Q214 336 248 352" fill="none" stroke="#f2c14e" stroke-width="5"/>` + [[196, 330], [214, 338], [232, 346]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#f2c14e"/>`).join('');
    body += flower(146, 410, 14, '#f2c14e', '#c8102e', 6) + `<path d="M120 470 Q180 486 240 470" fill="none" stroke="#f2c14e" stroke-width="5"/>`;
    body += hangingArm('L', skin, skin, { bangles: true });
    body += `<path d="M73 520 L66 470" stroke="#8a5a2a" stroke-width="6" stroke-linecap="round"/><circle cx="62" cy="438" r="40" fill="#c8102e" stroke="${O}" stroke-width="${SW}"/><circle cx="62" cy="438" r="32" fill="none" stroke="#f2c14e" stroke-width="4"/>` + flower(62, 438, 13, '#f8bbd0', '#f2c14e') + `<path d="M62 478 v40" stroke="#f2c14e" stroke-width="5"/>`;
    let h = head + hairPart('#151111');
    h += `<path d="M234 98 L282 70" stroke="#f2c14e" stroke-width="6" stroke-linecap="round"/><circle cx="284" cy="69" r="8" fill="#f2c14e" stroke="${O}" stroke-width="3"/>` + [0, 1, 2].map(i => `<path d="M${262 + i * 9} ${82 - i * 5} v${22 + i * 4}" stroke="#f2c14e" stroke-width="3"/><circle cx="${262 + i * 9}" cy="${106 - i * 1}" r="4" fill="#c8102e"/>`).join('');
    h += flower(110, 100, 18, '#e0182f', '#f2c14e', 6) + flower(140, 82, 12, '#ff4d5e', '#f2c14e', 6);
    h += `<path d="M70 226 v14 M290 226 v14" stroke="${O}" stroke-width="3"/><ellipse cx="70" cy="250" rx="8" ry="12" fill="#e0182f" stroke="${O}" stroke-width="3"/><ellipse cx="290" cy="250" rx="8" ry="12" fill="#e0182f" stroke="${O}" stroke-width="3"/>`;
    return { body, head: h, hairBack, arm: wavingArm('R', skin, skin, { bangles: true }) };
  },
  indian(skin, head) {
    const hairBack = `<path d="M92 110 Q20 330 46 610 L314 610 Q340 330 268 110Z" fill="#d81b60" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M58 600 Q180 620 302 600" fill="none" stroke="#f2c14e" stroke-width="12"/>` + dots(80, 300, 280, 580, 26, 4, '#f6c445');
    let body = `<path d="M124 450 Q84 600 40 728 Q180 758 320 728 Q276 600 236 450Z" fill="#b0124a" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M48 704 Q180 734 312 704 L320 728 Q180 758 40 728Z" fill="#f2c14e" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
    for (let y = 520; y < 690; y += 46) for (let x = 100 + (y % 92 ? 30 : 0); x < 280; x += 60) body += flower(x + (y - 520) * (x < 180 ? -0.15 : 0.15), y, 10, '#f2c14e', '#b0124a', 6);
    body += neck(skin) + `<path d="M106 336 Q180 312 254 336 L242 452 L118 452Z" fill="#7a0d2e" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>` + dots(118, 350, 242, 444, 16, 3, '#f6c445');
    body += `<path d="M100 336 L142 330 L264 560 L232 584Z" fill="#d81b60" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M108 340 L240 578 M138 332 L258 556" stroke="#f2c14e" stroke-width="5"/>`;
    body += `<path d="M148 316 Q180 336 212 316" fill="none" stroke="#f2c14e" stroke-width="12"/>` + [160, 172, 188, 200].map(x => `<circle cx="${x}" cy="${330 + (x > 170 && x < 190 ? 6 : 0)}" r="4.5" fill="#c8102e" stroke="${O}" stroke-width="1.5"/>`).join('');
    body += `<path d="M132 326 Q180 420 228 326" fill="none" stroke="#f2c14e" stroke-width="5"/><circle cx="180" cy="376" r="13" fill="#f2c14e" stroke="${O}" stroke-width="3"/><circle cx="180" cy="376" r="5" fill="#2e7d32"/>`;
    const chooda = ['#c62828', '#ffffff', '#c62828', '#ffffff', '#c62828'];
    body += hangingArm('L', '#7a0d2e', skin, { stripes: chooda, bangles: true });
    let h = head + hairPart('#151111');
    h += `<path d="M180 88 V140" stroke="#f2c14e" stroke-width="4"/><circle cx="180" cy="146" r="11" fill="#f2c14e" stroke="${O}" stroke-width="3"/><circle cx="180" cy="146" r="5" fill="#c8102e"/><circle cx="180" cy="162" r="4" fill="#fff" stroke="${O}" stroke-width="1.5"/>`;
    h += `<circle cx="198" cy="240" r="12" fill="none" stroke="#f2c14e" stroke-width="3.5"/><path d="M208 236 Q250 214 284 222" fill="none" stroke="#f2c14e" stroke-width="2" stroke-dasharray="3 4"/>`;
    h += `<path d="M56 206 Q46 66 180 56 Q314 66 304 206 Q294 120 180 100 Q66 120 56 206Z" fill="#d81b60" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M64 196 Q72 116 180 104 Q288 116 296 196" fill="none" stroke="#f2c14e" stroke-width="7"/>`;
    h += jhumka('#f2c14e') + `<circle cx="180" cy="168" r="0"/>`;
    return { body, head: h, hairBack, arm: wavingArm('R', '#7a0d2e', skin, { stripes: chooda, bangles: true }) };
  },
  korean(skin, head) {
    const hairBack = `<path d="M170 140 Q160 330 176 520 L196 520 Q206 330 194 140Z" fill="#c8102e" stroke="${O}" stroke-width="4"/><ellipse cx="180" cy="128" rx="58" ry="34" fill="#151111" stroke="${O}" stroke-width="${SW}"/><path d="M70 126 H290" stroke="${O}" stroke-width="13" stroke-linecap="round"/><path d="M70 126 H290" stroke="#e2b34a" stroke-width="7" stroke-linecap="round"/>`;
    const saek = ['#e53935', '#fdd835', '#1e88e5', '#ffffff', '#43a047'];
    let body = `<path d="M120 470 Q96 610 74 730 L286 730 Q264 610 240 470Z" fill="#d32f2f" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M80 694 H280 L284 718 H76Z" fill="#e2b34a" stroke="${O}" stroke-width="3"/>` + dots(90, 702, 270, 712, 18, 3, '#fff3c4');
    body += neck(skin) + `<path d="M100 332 Q180 306 260 332 L278 602 L210 614 L180 476 L150 614 L82 602Z" fill="#2e7d32" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += flower(124, 540, 12, '#e2b34a', '#d32f2f', 6) + flower(236, 540, 12, '#e2b34a', '#d32f2f', 6) + flower(130, 410, 10, '#e2b34a', '#d32f2f', 6) + flower(230, 410, 10, '#e2b34a', '#d32f2f', 6);
    body += `<path d="M150 318 L180 380 L210 318" fill="none" stroke="#fff" stroke-width="10" stroke-linejoin="round"/><path d="M150 318 L180 380 L210 318" fill="none" stroke="${O}" stroke-width="2.5"/>`;
    body += `<path d="M104 470 Q180 488 256 470 L258 492 Q180 510 102 492Z" fill="#c8102e" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>` + `<path d="M150 494 L144 600 M210 494 L216 600" stroke="#c8102e" stroke-width="12" stroke-linecap="round"/>`;
    body += hangingArm('L', '#2e7d32', skin, { w: 40, stripes: saek, cuff: '#ffffff' });
    let h = head + `<circle cx="110" cy="240" r="13" fill="#e53935"/><circle cx="250" cy="240" r="13" fill="#e53935"/><circle cx="180" cy="160" r="8" fill="#e53935"/>`;
    h += hairPart('#151111');
    h += `<path d="M146 82 L134 52 H226 L214 82Z" fill="#1c1c1c" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M134 52 H226" stroke="#e2b34a" stroke-width="5"/>`;
    h += [[146, 44, '#e53935'], [166, 36, '#1e88e5'], [180, 30, '#e2b34a'], [194, 36, '#43a047'], [214, 44, '#e53935']].map(([x, y, c]) => `<line x1="${x}" y1="52" x2="${x}" y2="${y}" stroke="#e2b34a" stroke-width="3"/><circle cx="${x}" cy="${y}" r="6" fill="${c}" stroke="${O}" stroke-width="2"/>`).join('');
    h += `<path d="M140 82 v16 M220 82 v16" stroke="#e2b34a" stroke-width="3"/><circle cx="140" cy="100" r="4" fill="#e2b34a"/><circle cx="220" cy="100" r="4" fill="#e2b34a"/>`;
    return { body, head: h, hairBack, arm: wavingArm('R', '#2e7d32', skin, { w: 40, stripes: saek, cuff: '#ffffff' }) };
  },
  rustic(skin, head) {
    const hairBack = `<path d="M64 190 Q28 300 58 450 Q90 500 112 470 L248 470 Q270 500 302 450 Q332 300 296 190Z" fill="#a0703d" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    let body = `<defs><clipPath id="rlace"><path d="M126 430 Q94 600 50 726 L310 726 Q266 600 234 430Z"/></clipPath></defs>`;
    body += `<path d="M126 430 Q94 600 50 726 Q180 750 310 726 Q266 600 234 430Z" fill="#fffaf2" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>` + dots(56, 520, 306, 724, 20, 4, '#efe2cc', 'rlace');
    for (let x = 58; x < 304; x += 26) body += `<path d="M${x} 722 q13 14 26 2" fill="none" stroke="${O}" stroke-width="3.5"/>`;
    body += neck(skin) + `<path d="M108 338 Q180 318 252 338 L238 440 L122 440Z" fill="#fffaf2" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M148 322 L180 378 L212 322" fill="${skin}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>` + dots(120, 390, 240, 432, 16, 3, '#efe2cc');
    body += `<rect x="120" y="428" width="120" height="16" rx="7" fill="#9cb58a" stroke="${O}" stroke-width="3"/><path d="M180 436 l-20 -12 v24Z M180 436 l20 -12 v24Z" fill="#9cb58a" stroke="${O}" stroke-width="2.5"/>`;
    body += hangingArm('L', '#fffaf2', skin);
    body += `<path d="M73 520 Q60 560 70 590 M73 520 Q86 560 82 590" stroke="#8fb07a" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    for (const [x, y, r] of [[48, 500, 1], [98, 496, -1], [60, 476, 1], [90, 470, -1]]) body += `<ellipse cx="${x}" cy="${y}" rx="18" ry="8" fill="#9cb58a" stroke="${O}" stroke-width="2.5" transform="rotate(${r * 30} ${x} ${y})"/>`;
    body += flower(64, 500, 12, '#fff', '#f2c14e') + flower(86, 494, 11, '#ffd6c2', '#f2c14e') + flower(74, 478, 10, '#f7c6cf', '#f2c14e');
    let h = head + hairWavy('#a0703d');
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.08 + 0.84 * i / 8), x = 180 - 120 * Math.cos(a), y = 132 - 46 * Math.sin(a);
      h += `<ellipse cx="${x}" cy="${y}" rx="14" ry="6" fill="#8fb07a" stroke="${O}" stroke-width="2" transform="rotate(${-Math.cos(a) * 60} ${x} ${y})"/>`;
      if (i % 2 === 0) h += flower(x, y - 4, 10, ['#fff', '#ffd6c2', '#f7c6cf'][i % 3]); }
    return { body, head: h, hairBack, arm: wavingArm('R', '#fffaf2', skin) };
  },
  royal(skin, head) {
    const hairBack = `<ellipse cx="180" cy="80" rx="62" ry="46" fill="#2a1a18" stroke="${O}" stroke-width="${SW}"/>`;
    let body = `<defs><clipPath id="mgown"><path d="M126 440 Q118 560 132 622 Q100 680 54 730 L306 730 Q260 680 228 622 Q242 560 234 440Z"/></clipPath></defs>`;
    body += `<path d="M126 440 Q118 560 132 622 Q100 680 54 730 Q180 752 306 730 Q260 680 228 622 Q242 560 234 440Z" fill="#e9d6b0" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    let R = rng(21); for (let i = 0; i < 70; i++) body += `<circle cx="${60 + R() * 240}" cy="${440 + R() * 290}" r="${1.5 + R() * 3}" fill="${R() < .5 ? '#fff' : '#d4a548'}" clip-path="url(#mgown)"/>`;
    body += `<path d="M132 622 Q180 640 228 622" fill="none" stroke="#c9b48a" stroke-width="4"/>`;
    body += neck(skin) + `<path d="M108 338 Q180 316 252 338 L240 448 Q180 462 120 448Z" fill="${skin}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    body += `<path d="M114 372 Q150 352 180 380 Q210 352 246 372 L238 448 Q180 462 122 448Z" fill="#e9d6b0" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><rect x="122" y="432" width="116" height="16" rx="7" fill="#d8dde6" stroke="${O}" stroke-width="3"/>`;
    body += `<path d="M150 322 Q180 350 210 322" fill="none" stroke="#e8edf5" stroke-width="5"/>` + [160, 180, 200].map(x => `<path d="M${x} ${332 + (x === 180 ? 8 : 0)} l-5 10 l5 8 l5 -8Z" fill="#e8f1ff" stroke="${O}" stroke-width="2"/>`).join('');
    body += hangingArm('L', '#f7f2ea', skin);
    body += bouquet2d(70, 504, ['#8b0f2a', '#b71c3c', '#a3122f'], '#2e7d32');
    let h = head + hairSlick('#2a1a18');
    h += `<path d="M110 112 Q180 70 250 112" fill="none" stroke="#d4a548" stroke-width="7"/>`;
    h += [[124, 98, 16], [152, 84, 22], [180, 76, 30], [208, 84, 22], [236, 98, 16]].map(([x, y, hh]) => `<path d="M${x - 9} ${y + 4} L${x} ${y - hh} L${x + 9} ${y + 4}Z" fill="#d4a548" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>`).join('');
    h += `<circle cx="180" cy="62" r="7" fill="#5c8dff" stroke="${O}" stroke-width="2"/><circle cx="152" cy="74" r="4.5" fill="#fff" stroke="${O}" stroke-width="1.5"/><circle cx="208" cy="74" r="4.5" fill="#fff" stroke="${O}" stroke-width="1.5"/>`;
    h += `<path d="M70 226 v10 M290 226 v10" stroke="${O}" stroke-width="2.5"/><path d="M70 236 l-6 12 l6 10 l6 -10Z M290 236 l-6 12 l6 10 l6 -10Z" fill="#e8f1ff" stroke="${O}" stroke-width="2.5"/>`;
    return { body, head: h, hairBack, arm: wavingArm('R', '#f7f2ea', skin) };
  }
};

/* ---------- new backdrops ---------- */
Object.assign(BACKDROPS, {
  moongate() {
    let h = '';
    const lantern = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -90 V-62" stroke="${O}" stroke-width="4"/><rect x="-22" y="-64" width="44" height="12" rx="3" fill="#e8b33c" stroke="${O}" stroke-width="4"/><ellipse cx="0" cy="0" rx="52" ry="58" fill="#e0182f" stroke="${O}" stroke-width="5"/><path d="M-26 -50 Q-36 0 -26 50 M0 -58 V58 M26 -50 Q36 0 26 50" fill="none" stroke="#b30f25" stroke-width="4"/><rect x="-22" y="52" width="44" height="12" rx="3" fill="#e8b33c" stroke="${O}" stroke-width="4"/><path d="M-10 64 v40 M0 64 v46 M10 64 v40" stroke="#e8b33c" stroke-width="4"/></g>`;
    // blossom branches
    for (const [x0, flip] of [[40, 1], [960, -1]]) { h += `<path d="M${x0} 1120 Q${x0 + 60 * flip} 900 ${x0 + 40 * flip} 760 Q${x0 + 20 * flip} 660 ${x0 + 90 * flip} 560 M${x0 + 44 * flip} 820 Q${x0 + 120 * flip} 780 ${x0 + 150 * flip} 700" fill="none" stroke="#4e342e" stroke-width="14" stroke-linecap="round"/>`;
      for (const [dx, dy] of [[90, 560], [70, 620], [150, 700], [120, 760], [40, 760], [60, 860], [130, 820]]) h += flower(x0 + dx * flip, dy, 18, '#f8bbd0', '#fff59d'); }
    h += `<rect x="190" y="1060" width="620" height="70" fill="#8e0b20" stroke="${O}" stroke-width="6"/>`;
    h += `<circle cx="500" cy="660" r="370" fill="none" stroke="${O}" stroke-width="92"/><circle cx="500" cy="660" r="370" fill="none" stroke="#c8102e" stroke-width="78"/><circle cx="500" cy="660" r="370" fill="none" stroke="#e8b33c" stroke-width="6" stroke-dasharray="20 14"/>`;
    h += `<path d="M90 310 Q500 230 910 310 L948 270 Q920 280 900 262 Q500 180 100 262 Q80 280 52 270Z" fill="#3b3f47" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>`;
    for (let x = 130; x < 880; x += 40) h += `<path d="M${x} ${300 - Math.sin((x - 90) / 820 * Math.PI) * 52} v-26" stroke="#2a2d33" stroke-width="5"/>`;
    h += `<g transform="translate(500 420)"><rect x="-70" y="-70" width="140" height="140" fill="#c8102e" stroke="#e8b33c" stroke-width="8" transform="rotate(45)"/><text x="0" y="36" text-anchor="middle" font-size="104" font-weight="700" fill="#ffd76a" font-family="'PingFang SC','Noto Sans CJK SC','Microsoft YaHei','Hiragino Sans GB','Noto Sans SC',sans-serif">囍</text></g>`;
    h += lantern(220, 400) + lantern(780, 400) + lantern(110, 960, .8) + lantern(890, 960, .8);
    return h;
  },
  palace() {
    let h = '';
    h += `<rect x="90" y="1070" width="820" height="60" fill="#fff8ec" stroke="${O}" stroke-width="6"/><rect x="90" y="1060" width="820" height="14" fill="#d9a227" stroke="${O}" stroke-width="4"/>`;
    for (const x of [200, 800]) { h += `<rect x="${x - 34}" y="460" width="68" height="600" fill="#fff8ec" stroke="${O}" stroke-width="6"/>`;
      for (const y of [500, 620, 900, 1010]) h += `<rect x="${x - 40}" y="${y}" width="80" height="18" fill="#d9a227" stroke="${O}" stroke-width="4"/>`;
      h += `<path d="M${x - 60} 460 H${x + 60} L${x + 44} 420 H${x - 44}Z" fill="#d9a227" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>`;
      h += `<path d="M${x - 50} 420 Q${x - 54} 330 ${x} 300 Q${x + 54} 330 ${x + 50} 420Z" fill="#fff8ec" stroke="${O}" stroke-width="5"/><path d="M${x} 300 V270" stroke="#d9a227" stroke-width="6"/><circle cx="${x}" cy="266" r="8" fill="#d9a227" stroke="${O}" stroke-width="3"/>`; }
    h += `<path d="M234 560 Q260 470 330 470 Q350 410 420 410 Q440 360 500 350 Q560 360 580 410 Q650 410 670 470 Q740 470 766 560" fill="none" stroke="${O}" stroke-width="34" stroke-linejoin="round"/><path d="M234 560 Q260 470 330 470 Q350 410 420 410 Q440 360 500 350 Q560 360 580 410 Q650 410 670 470 Q740 470 766 560" fill="none" stroke="#fff8ec" stroke-width="24" stroke-linejoin="round"/><path d="M250 548 Q275 482 334 484 Q356 426 422 426 Q444 378 500 368" fill="none" stroke="#d9a227" stroke-width="5"/><path d="M750 548 Q725 482 666 484 Q644 426 578 426 Q556 378 500 368" fill="none" stroke="#d9a227" stroke-width="5"/>`;
    h += `<path d="M380 350 Q370 190 500 140 Q630 190 620 350Z" fill="#fff8ec" stroke="${O}" stroke-width="6"/><path d="M400 300 Q500 270 600 300" fill="none" stroke="#d9a227" stroke-width="6"/><path d="M500 140 V96" stroke="${O}" stroke-width="12" stroke-linecap="round"/><path d="M500 140 V96" stroke="#d9a227" stroke-width="7" stroke-linecap="round"/><circle cx="500" cy="88" r="12" fill="#d9a227" stroke="${O}" stroke-width="4"/>`;
    h += `<path d="M240 520 Q370 640 500 560 Q630 640 760 520 L760 560 Q630 690 500 600 Q370 690 240 560Z" fill="#ec407a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/><path d="M240 560 Q370 700 500 620 Q630 700 760 560 L760 590 Q630 730 500 650 Q370 730 240 590Z" fill="#ff9800" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>`;
    for (const x of [200, 800]) h += `<path d="M${x - 50} 560 Q${x - 70} 800 ${x - 40} 1050 L${x + 40} 1050 Q${x + 70} 800 ${x + 50} 560Z" fill="#ec407a" stroke="${O}" stroke-width="5" stroke-linejoin="round" opacity=".95"/><path d="M${x - 46} 760 Q${x} 790 ${x + 46} 760" fill="none" stroke="#d9a227" stroke-width="10"/>`;
    for (let x = 300; x <= 700; x += 50) { const len = 80 + ((x / 50) % 2) * 60; for (let y = 600; y < 600 + len; y += 20) h += `<circle cx="${x}" cy="${y}" r="9" fill="${(y / 20) % 2 < 1 ? '#ff9f1c' : '#ffd23f'}" stroke="${O}" stroke-width="2.5"/>`; }
    for (const x of [110, 890]) h += `<path d="M${x - 40} 1050 Q${x} 1086 ${x + 40} 1050 Z" fill="#d1693a" stroke="${O}" stroke-width="5"/><path d="M${x} 1048 q-14 -30 0 -54 q14 24 0 54Z" fill="#ffb627" stroke="${O}" stroke-width="3.5"/>`;
    return h;
  },
  screen() {
    let h = '';
    const n = 6, x0 = 130, W = 740 / n;
    for (let i = 0; i < n; i++) { const x = x0 + i * W;
      h += `<rect x="${x}" y="380" width="${W}" height="720" fill="${i % 2 ? '#efe4cc' : '#f7efdc'}" stroke="#5d4037" stroke-width="12"/>`;
      h += `<path d="M${x + W / 2} 1090 Q${x + W / 2 + (i % 2 ? 20 : -20)} ${900 - i * 10} ${x + W / 2} ${700 - (i % 3) * 60}" fill="none" stroke="#5d7a3a" stroke-width="6"/>`;
      for (const [dx, dy, r] of [[0, 700 - (i % 3) * 60, 30], [(i % 2 ? -30 : 30), 820, 24], [(i % 2 ? 26 : -26), 940, 20]]) {
        h += `<ellipse cx="${x + W / 2 + dx - 24}" cy="${dy + 18}" rx="22" ry="10" fill="#6a9a4a" stroke="${O}" stroke-width="2.5" transform="rotate(-30 ${x + W / 2 + dx - 24} ${dy + 18})"/>`;
        h += flower(x + W / 2 + dx, dy, r, i % 3 === 1 ? '#e94e77' : '#f8a5c2', '#ffd54f', 7) + `<circle cx="${x + W / 2 + dx}" cy="${dy}" r="${r * .32}" fill="#f06292" stroke="${O}" stroke-width="2"/>`; } }
    h += `<rect x="124" y="370" width="752" height="20" fill="#3e2723"/><rect x="124" y="1092" width="752" height="20" fill="#3e2723"/>`;
    const duck = (x, flip) => { const f = flip ? -1 : 1; return `<g transform="translate(${x} 1060) scale(${f} 1)"><rect x="-56" y="20" width="112" height="22" rx="6" fill="${flip ? '#1e88e5' : '#e53935'}" stroke="${O}" stroke-width="4"/><ellipse cx="0" cy="0" rx="50" ry="30" fill="#a1683a" stroke="${O}" stroke-width="5"/><path d="M-30 -10 Q0 -26 34 -6" fill="none" stroke="#7a4a2e" stroke-width="5"/><circle cx="38" cy="-36" r="20" fill="#a1683a" stroke="${O}" stroke-width="5"/><path d="M56 -38 l22 6 l-22 6Z" fill="#f2a516" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><circle cx="42" cy="-40" r="4" fill="${O}"/><path d="M24 -24 Q30 -8 22 6" fill="none" stroke="${flip ? '#1e88e5' : '#e53935'}" stroke-width="10"/></g>`; };
    h += duck(110, false) + duck(890, true);
    return h;
  },
  rustic() {
    let h = '';
    for (const x of [190, 810]) h += `<rect x="${x - 22}" y="350" width="44" height="780" fill="#a1683a" stroke="${O}" stroke-width="6"/><path d="M${x - 8} 400 V1100 M${x + 10} 460 V1080" stroke="#7a4a2e" stroke-width="3"/>`;
    h += `<rect x="140" y="330" width="720" height="44" rx="6" fill="#a1683a" stroke="${O}" stroke-width="6"/><path d="M160 352 H840" stroke="#7a4a2e" stroke-width="3"/>`;
    h += `<path d="M210 430 Q500 560 790 430" fill="none" stroke="#3e3e3e" stroke-width="3"/>`;
    for (let i = 1; i < 12; i++) { const t = i / 12, x = 210 + 580 * t, y = 430 + 130 * 4 * t * (1 - t) * 0.5 * 2 * 0.5 * 2; h += `<circle cx="${x}" cy="${y + 12}" r="16" fill="#fff3b0" opacity=".45"/><circle cx="${x}" cy="${y + 12}" r="8" fill="#ffe082" stroke="${O}" stroke-width="2.5"/>`; }
    let R = rng(9);
    const leafy = (x, y) => { let s = ''; for (let k = 0; k < 3; k++) { const a = R() * 360; s += `<ellipse cx="${x + (R() - .5) * 40}" cy="${y + (R() - .5) * 30}" rx="${22 + R() * 10}" ry="9" fill="${R() < .5 ? '#8fb07a' : '#6f9460'}" stroke="${O}" stroke-width="2.5" transform="rotate(${a} ${x} ${y})"/>`; } return s; };
    for (let x = 140; x < 470; x += 26) h += leafy(x, 340 + Math.sin(x / 40) * 10);
    for (let y = 380; y < 820; y += 30) h += leafy(190 + Math.sin(y / 50) * 14, y);
    for (let x = 680; x < 860; x += 26) h += leafy(x, 340);
    for (const [x, y, c, r] of [[230, 330, '#fff', 26], [300, 346, '#ffd6c2', 22], [190, 420, '#f7c6cf', 24], [380, 330, '#fff', 20], [196, 560, '#fff', 22], [760, 336, '#ffd6c2', 24], [820, 350, '#fff', 20], [186, 680, '#ffd6c2', 18]]) h += flower(x, y, r, c, '#f2c14e', 6);
    h += `<path d="M720 380 L700 470 M800 380 L820 470" stroke="#8a6a45" stroke-width="4"/><rect x="670" y="466" width="180" height="70" rx="8" fill="#c49a6c" stroke="${O}" stroke-width="5"/><text x="760" y="514" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-style="italic" font-size="40" fill="#fffaf0">Love</text>`;
    return h;
  },
  gala() {
    let h = '';
    for (const flip of [false, true]) { const X = x => flip ? 1000 - x : x;
      h += `<path d="M${X(60)} 140 Q${X(220)} 160 ${X(250)} 260 Q${X(170)} 520 ${X(230)} 760 Q${X(140)} 980 ${X(170)} 1130 L${X(40)} 1130 Q${X(80)} 700 ${X(60)} 140Z" fill="#7b1530" stroke="${O}" stroke-width="6" stroke-linejoin="round"/><path d="M${X(80)} 240 Q${X(150)} 600 ${X(110)} 1110 M${X(130)} 220 Q${X(200)} 560 ${X(150)} 1110" fill="none" stroke="#5c0f23" stroke-width="5"/><path d="M${X(130)} 740 Q${X(190)} 770 ${X(232)} 744" fill="none" stroke="#d4a548" stroke-width="12" stroke-linecap="round"/>`; }
    const d = 'M200 1130 V540 Q200 220 500 180 Q800 220 800 540 V1130';
    h += `<path d="${d}Z" fill="#16204a"/>`;
    let R = rng(4); for (let i = 0; i < 70; i++) { const x = 220 + R() * 560, y = 200 + R() * 900; h += `<circle cx="${x}" cy="${y}" r="${1.5 + R() * 3.5}" fill="${R() < .7 ? '#fff' : '#f6d77a'}" opacity="${.5 + R() * .5}"/>`; }
    h += `<path d="M690 330 a50 50 0 1 0 22 70 a40 40 0 1 1 -22 -70Z" fill="#f6e7b0" stroke="${O}" stroke-width="3"/>`;
    h += `<path d="${d}" fill="none" stroke="${O}" stroke-width="40"/><path d="${d}" fill="none" stroke="#d4a548" stroke-width="28"/><path d="${d}" fill="none" stroke="#f6d77a" stroke-width="4" stroke-dasharray="14 12"/>`;
    h += `<path d="M500 180 V260" stroke="#d4a548" stroke-width="6"/><path d="M400 300 Q500 360 600 300" fill="none" stroke="#d4a548" stroke-width="10"/><path d="M430 330 Q500 400 570 330" fill="none" stroke="#d4a548" stroke-width="8"/><ellipse cx="500" cy="270" rx="26" ry="14" fill="#d4a548" stroke="${O}" stroke-width="4"/>`;
    for (const x of [400, 450, 500, 550, 600]) h += `<path d="M${x} ${x === 500 ? 330 : 312} v26" stroke="#d4a548" stroke-width="3"/><path d="M${x} ${x === 500 ? 356 : 338} l-7 12 l7 12 l7 -12Z" fill="#e8f1ff" stroke="${O}" stroke-width="2"/>`;
    for (const x of [400, 600, 430, 570]) h += `<rect x="${x - 5}" y="${x === 400 || x === 600 ? 280 : 310}" width="10" height="20" fill="#fff" stroke="${O}" stroke-width="2"/><path d="M${x} ${x === 400 || x === 600 ? 280 : 310} q-6 -12 0 -20 q6 8 0 20Z" fill="#ffd54f"/>`;
    return h;
  }
});

/* ---------- new particles ---------- */
Object.assign(PARTICLES, {
  blossom: `<g transform="translate(128 120)">${[0, 1, 2, 3, 4].map(i => `<path d="M0 0 Q-44 -50 -10 -96 Q0 -84 10 -96 Q44 -50 0 0Z" fill="#f8bbd0" stroke="${O}" stroke-width="8" stroke-linejoin="round" transform="rotate(${i * 72})"/>`).join('')}<circle r="18" fill="#fff59d" stroke="${O}" stroke-width="6"/></g>`,
  rose: `<g transform="translate(128 120)"><circle r="92" fill="#c2185b" stroke="${O}" stroke-width="9"/><path d="M-50 10 Q-40 -60 20 -50 Q60 -30 40 20 Q20 60 -20 40 Q-40 20 -10 0 Q10 -10 10 10" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round"/></g>`,
  peony: `<g transform="translate(128 120)">${[...Array(8)].map((_, i) => `<ellipse cx="0" cy="-58" rx="40" ry="52" fill="${i % 2 ? '#f48fb1' : '#f06292'}" stroke="${O}" stroke-width="7" transform="rotate(${i * 45})"/>`).join('')}<circle r="30" fill="#ffd54f" stroke="${O}" stroke-width="7"/></g>`,
  leaf: `<path d="M30 210 Q20 60 220 30 Q240 200 30 210Z" fill="#8fb07a" stroke="${O}" stroke-width="9" stroke-linejoin="round"/><path d="M40 200 Q120 110 210 40" fill="none" stroke="${O}" stroke-width="6"/>`
});

/* ---------- register new templates ---------- */
TEMPLATES.push(
  { id: 'chinese', name: 'Chinese Red', tagline: 'Qipao & changshan under a red moon gate', region: 'Chinese',
    colors: { bg: '#fff0ec', ink: '#3a1414', accent: '#c8102e', accent2: '#e8b33c', card: '#fffaf7', ribbon: '#c8102e', ribbonDark: '#8e0b20', ribbonText: '#ffd76a' },
    backdrop: 'moongate', particle: 'blossom', groom: 'chinese', bride: 'chinese' },
  { id: 'indian', name: 'Indian Royal', tagline: 'Lehenga & sherwani in a royal mandap', region: 'North Indian',
    colors: { bg: '#fff0f4', ink: '#3b1022', accent: '#b0124a', accent2: '#f2a516', card: '#fffafb', ribbon: '#d81b60', ribbonDark: '#8e0e3c', ribbonText: '#ffe08a' },
    backdrop: 'palace', particle: 'rose', groom: 'indian', bride: 'indian' },
  { id: 'korean', name: 'Korean Hanbok', tagline: 'Wonsam & gwanbok before a peony screen', region: 'Korean',
    colors: { bg: '#f1f5fc', ink: '#1b2340', accent: '#1f4e9e', accent2: '#e94e77', card: '#fbfdff', ribbon: '#1f4e9e', ribbonDark: '#163a78', ribbonText: '#ffe3ec' },
    backdrop: 'screen', particle: 'peony', groom: 'korean', bride: 'korean' },
  { id: 'rustic', name: 'Rustic Garden', tagline: 'Lace & suspenders under a wooden arch', region: 'Western',
    colors: { bg: '#eef3e8', ink: '#2e3a26', accent: '#5f7f52', accent2: '#d9a066', card: '#fbfdf8', ribbon: '#9cb58a', ribbonDark: '#5f7f52', ribbonText: '#2e3a26' },
    backdrop: 'rustic', particle: 'leaf', groom: 'rustic', bride: 'rustic' },
  { id: 'royal', name: 'Royal Night Gala', tagline: 'Sparkling gown & velvet tux under the stars', region: 'Glamour', dark: true,
    colors: { bg: '#111833', ink: '#f3e7c9', accent: '#d4a548', accent2: '#8fa3e8', card: '#1b2448', ribbon: '#d4a548', ribbonDark: '#9c7a2e', ribbonText: '#16204a' },
    backdrop: 'gala', particle: 'star', groom: 'royal', bride: 'royal' }
);
for (const [id, r] of [['kandyan', 'Sri Lankan'], ['classic', 'Western'], ['tamil', 'South Indian'], ['muslim', 'Islamic'], ['beach', 'Destination']]) { const t = TEMPLATES.find(x => x.id === id); t.region = r; t.has3d = true; }
