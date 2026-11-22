import { CONFIG } from './config.js';
import * as db from './db.js';
import { getTemplate } from './templates.js';
import { buildGLB } from './scene.js';
import { T, longDate, weekday } from './i18n.js';

const $ = id => document.getElementById(id);
const show = (id, on = true) => $(id).classList.toggle('hidden', !on);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICON = {
  check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-13.4 7.9L3 21l1.2-4.4A9 9 0 1 1 21 12z"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
};

(async function main() {
  let data = null;
  try { data = await db.loadInvite(); } catch (e) { console.error(e); }
  if (!data || !data.inv) { $('loadTxt').textContent = T.en.notFound; $('loading').querySelector('.spin').remove(); return; }
  const { inv, guest, token } = data, lang = inv.lang || 'en', t = T[lang] || T.en, tpl = getTemplate(inv.template), c = tpl.colors;
  const guestName = guest && guest.name ? guest.name : '';
  document.documentElement.lang = lang;
  const root = document.documentElement.style;
  root.setProperty('--bg', c.bg); root.setProperty('--ink', c.ink); root.setProperty('--accent', c.accent); root.setProperty('--accent2', c.accent2);
  root.setProperty('--card', c.card); root.setProperty('--rib', c.ribbonDark);
  if (tpl.dark) { document.documentElement.classList.add('dark'); root.setProperty('--rib', '#0b1026'); }
  $('loadTxt').textContent = t.loading;
  const names = `${inv.groom} & ${inv.bride}`;
  document.title = `${names} · ${t.invited}`;

  // envelope
  const initial = s => (s || '?').trim().charAt(0).toUpperCase();
  $('seal').textContent = `${initial(inv.groom)}&${initial(inv.bride)}`;
  $('eDear').textContent = guestName ? t.dear(guestName) : t.invited;
  $('eNames').textContent = names; $('eTo').textContent = t.toOurWedding; $('openBtn').textContent = t.open;

  // header + texts
  $('hInv').textContent = guestName ? t.dear(guestName) : t.invited;
  $('hNames').textContent = names;
  $('hDate').textContent = inv.date ? `${weekday(inv.date, lang)} · ${longDate(inv.date, lang)}` : '';
  $('arTxt').textContent = t.seeAR; $('dragTxt').textContent = t.drag; $('hint').textContent = t.arHint; $('noar').textContent = t.noAR;
  if (inv.message) { $('msg').textContent = inv.message; show('msg'); }

  // events
  const ev = (inv.events || []).filter(e => e.time || e.label);
  if (ev.length) { $('evH').textContent = t.events; $('evList').innerHTML = ev.map(e => `<li><b>${esc(e.time)}</b><span>${esc(e.label)}</span></li>`).join(''); show('evSec'); }
  if (inv.venue || inv.address) { $('vName').textContent = inv.venue || ''; $('vAddr').textContent = inv.address || ''; show('vSec'); }

  // countdown
  const target = inv.date ? new Date(inv.date + 'T00:00:00').getTime() : 0;
  const tick = () => {
    if (!target) { $('count').classList.add('hidden'); return; }
    const d = target - Date.now();
    if (d <= -864e5) { $('count').innerHTML = `<div style="grid-column:1/-1"><b>${esc(t.married2)}</b></div>`; return; }
    const dd = Math.max(0, Math.floor(d / 864e5)), hh = Math.max(0, Math.floor(d / 36e5) % 24);
    $('count').innerHTML = `<div><b>${dd}</b><span>${esc(t.days)}</span></div><div><b>${hh}</b><span>${esc(t.hours)} ${esc(t.togo)}</span></div>`;
  };
  tick(); setInterval(tick, 60000);

  // action buttons
  const acts = [`<a class="main" href="#rsvp">${ICON.check}${esc(t.rsvp)}</a>`];
  if (inv.mapUrl) acts.push(`<a href="${esc(inv.mapUrl)}" target="_blank" rel="noopener">${ICON.pin}${esc(t.location)}</a>`);
  if (inv.whatsapp) acts.push(`<a href="https://wa.me/${esc(inv.whatsapp)}" target="_blank" rel="noopener">${ICON.wa}${esc(t.whatsapp)}</a>`);
  if (inv.date) {
    const d0 = inv.date.replace(/-/g, ''), nx = new Date(inv.date + 'T12:00:00'); nx.setDate(nx.getDate() + 1);
    const d1 = nx.toISOString().slice(0, 10).replace(/-/g, '');
    const details = ev.map(e => `${e.time} ${e.label}`).join('\n');
    const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(names + ' wedding')}&dates=${d0}/${d1}&location=${encodeURIComponent([inv.venue, inv.address].filter(Boolean).join(', '))}&details=${encodeURIComponent(details)}`;
    acts.push(`<a href="${cal}" target="_blank" rel="noopener">${ICON.cal}${esc(t.calendar)}</a>`);
  }
  $('acts').innerHTML = acts.join('');

  // RSVP form
  $('rH').textContent = t.rsvpTitle; $('lName').textContent = t.yourName; $('lYes').textContent = t.attending; $('lNo').textContent = t.notAttending;
  $('lCount').textContent = t.guests; $('lMsg').textContent = t.wishes; $('rSend').textContent = t.send; $('rEdit').textContent = t.edit;
  if (inv.rsvpBy) { $('rBy').textContent = t.replyBy(longDate(inv.rsvpBy, lang)); show('rBy'); }
  const seats = Math.max(1, Math.min(10, (guest && guest.seats) || 6));
  $('rCount').innerHTML = [...Array(seats)].map((_, i) => `<option${i + 1 === Math.min(2, seats) ? ' selected' : ''}>${i + 1}</option>`).join('');
  if (guestName) $('rName').value = guestName;
  document.querySelectorAll('input[name=c]').forEach(r => r.onchange = () => show('cntRow', $('cY').checked));
  const key = 'rsvp_' + (token || (inv.groom + inv.bride + (guestName || '')));
  const showDone = r => { $('dH').textContent = r.rsvp === 'yes' ? '♥' : ''; $('dP').textContent = (r.rsvp === 'yes' ? t.thanksYes : t.thanksNo)(r.name) + (r.viaWa ? ' ' + t.sentWa : ''); show('rForm', false); show('rDone'); $('dH').classList.toggle('hidden', r.rsvp !== 'yes'); };
  try { const prev = JSON.parse(localStorage.getItem(key) || 'null'); if (prev) showDone(prev); else if (guest && guest.rsvp) showDone({ rsvp: guest.rsvp, name: guestName }); } catch (e) {}
  $('rEdit').onclick = () => { show('rDone', false); show('rForm'); };
  $('rForm').addEventListener('submit', async e => {
    e.preventDefault(); $('rErr').textContent = '';
    const r = { name: $('rName').value.trim(), rsvp: $('cY').checked ? 'yes' : 'no', count: +$('rCount').value, message: $('rMsg').value.trim() };
    if (!r.name) { $('rErr').textContent = t.nameNeeded; $('rName').focus(); return; }
    $('rSend').disabled = true;
    let saved = false;
    try { saved = await db.submitRsvp(token, r); } catch (err) { console.error(err); }
    if (!saved && inv.whatsapp) {
      const txt = `RSVP · ${names}\n${r.name}: ${r.rsvp === 'yes' ? `Coming (${r.count})` : 'Not coming'}${r.message ? `\n"${r.message}"` : ''}`;
      window.open(`https://wa.me/${inv.whatsapp}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
      r.viaWa = true;
    }
    $('rSend').disabled = false;
    try { localStorage.setItem(key, JSON.stringify(r)); } catch (err) {}
    showDone(r);
  });

  if (inv.hideBrand) $('foot').remove(); else $('foot').innerHTML = `Made with ♥ by ${CONFIG.BUSINESS_WHATSAPP ? `<a href="https://wa.me/${esc(CONFIG.BUSINESS_WHATSAPP)}" target="_blank" rel="noopener">${esc(CONFIG.BRAND)}</a>` : esc(CONFIG.BRAND)}`;

  // build the AR scene, then show the envelope
  const mv = $('mv');
  try {
    const url = await buildGLB(inv, guestName);
    if (inv.style === '3d' && tpl.has3d) { mv.setAttribute('camera-orbit', '0deg 80deg 4.4m'); mv.setAttribute('camera-target', '0m 0.9m 0m'); mv.setAttribute('min-camera-orbit', '-70deg 50deg auto'); mv.setAttribute('max-camera-orbit', '70deg 92deg auto'); }
    mv.src = url;
  } catch (e) { console.error(e); }
  show('loading', false); show('main'); show('env');
  $('openBtn').onclick = () => { $('env').classList.add('gone'); };
  mv.addEventListener('load', () => {
    mv.play({ repetitions: Infinity });
    setTimeout(() => { if (!mv.canActivateAR) { show('noar'); show('hint', false); } }, 800);
  });
  mv.addEventListener('ar-status', e => { if (e.detail.status === 'failed') { $('hint').textContent = t.noAR; show('hint'); } });
})();
