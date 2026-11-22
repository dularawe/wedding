import { CONFIG } from './config.js';
import * as db from './db.js';
import { TEMPLATES, getTemplate, thumbnailSVG, SKIN_TONES } from './templates.js';
const thumbCache = {};
const thumb = t => thumbCache[t.id] || (thumbCache[t.id] = thumbnailSVG(t));
import { buildGLB } from './scene.js';
import { longDate } from './i18n.js';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICON = {
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-13.4 7.9L3 21l1.2-4.4A9 9 0 1 1 21 12z"/></svg>',
  open: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
  del: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'
};
const DEFAULT_SHARE = 'Dear {name}, you are warmly invited to the wedding of {groom} & {bride} on {date}. Open your invitation (with AR!) here: {link}';
const blankInv = () => ({ template: 'kandyan', style: '2d', plan: 'standard', groomSkin: '', brideSkin: '', art: null, hideBrand: false, lang: 'en', groom: '', bride: '', date: '', events: [{ time: '', label: '' }, { time: '', label: '' }],
  venue: '', address: '', mapUrl: '', whatsapp: '', rsvpBy: '', message: '', shareText: DEFAULT_SHARE });

let inv = null, guests = [], dirty = false;

/* ---------- ui helpers ---------- */
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); }
function show(view) { for (const v of ['vLogin', 'vList', 'vEdit']) $(v).hidden = v !== view; }
async function confirmDel(text) { $('dlgText').textContent = text; $('dlg').showModal(); return new Promise(r => $('dlg').addEventListener('close', () => r($('dlg').returnValue === 'yes'), { once: true })); }
async function copy(text) { try { await navigator.clipboard.writeText(text); toast('Link copied'); } catch (e) { prompt('Copy this link:', text); } }
const normPhone = p => { let d = String(p || '').replace(/[^\d]/g, ''); if (d.startsWith('0')) d = '94' + d.slice(1); return d; };
const fill = (tpl, g, link) => (tpl || DEFAULT_SHARE).replace(/\{name\}/g, g ? g.name : '').replace(/\{groom\}/g, inv.groom || '').replace(/\{bride\}/g, inv.bride || '')
  .replace(/\{date\}/g, longDate(inv.date, 'en')).replace(/\{link\}/g, link).replace(/^Dear ,\s*/, '');

/* ---------- boot ---------- */
for (const id of ['fGroomSkin', 'fBrideSkin']) $(id).insertAdjacentHTML('beforeend', Object.entries(SKIN_TONES).map(([k, v]) => `<option value="${k}">${v}</option>`).join(''));
const PLANS = CONFIG.PLANS || [];
const planOf = id => PLANS.find(p => p.id === id) || PLANS[PLANS.length - 1] || { guests: 0, name: '' };
$('fPlan').innerHTML = PLANS.map(p => `<option value="${p.id}">${esc(p.name)} · ${p.guests ? p.guests + ' invitations' : 'unlimited'} · ${p.price ? CONFIG.CURRENCY + p.price : 'free'}</option>`).join('');
const artPreview = {};   // local uploads shown in the preview before you put them online
$('brandName').textContent = CONFIG.BRAND; document.title = 'Admin · ' + CONFIG.BRAND;
$('modeBadge').textContent = db.MODE === 'cloud' ? 'Cloud · RSVP tracking on' : 'No database · replies by WhatsApp';
if (db.MODE === 'local') { $('emailRow').hidden = true; $('pwLabel').textContent = 'Admin PIN'; $('loginHint').textContent = 'Enter the PIN from js/config.js (default 1234; change it).'; $('lPass').autocomplete = 'off'; $('backupBtn').hidden = false; }
else $('loginHint').textContent = 'Use the admin email and password you created in Supabase.';

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault(); $('lErr').textContent = '';
  try { await db.signIn($('lEmail').value.trim(), $('lPass').value); route(); } catch (err) { $('lErr').textContent = err.message || 'Could not sign in'; }
});
$('signOut').onclick = async () => { await db.signOut(); location.hash = ''; route(); };
window.addEventListener('hashchange', route);
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

async function route() {
  const user = await db.currentUser();
  $('signOut').hidden = !user;
  if (!user) { show('vLogin'); return; }
  const h = location.hash.slice(1);
  if (h === 'new') return openEditor(null);
  if (h.startsWith('edit-')) return openEditor(h.slice(5));
  return renderList();
}

/* ---------- list ---------- */
async function renderList() {
  show('vList');
  let list = [];
  try { list = await db.listInvitations(); } catch (e) { toast('Could not load: ' + e.message); }
  $('emptyState').hidden = list.length > 0; $('invGrid').hidden = !list.length;
  $('listSub').textContent = list.length ? `${list.length} invitation${list.length > 1 ? 's' : ''}` : '';
  $('invGrid').innerHTML = list.map(i => {
    const g = i._guests || [], yes = g.filter(x => x.rsvp === 'yes'), no = g.filter(x => x.rsvp === 'no').length, ppl = yes.reduce((a, x) => a + (x.rsvp_count || 1), 0);
    const t = getTemplate(i.template);
    return `<article class="card inv" data-id="${esc(i.id)}" tabindex="0">
      <div class="th" style="background:${t.colors.bg}">${thumb(t)}</div>
      <div class="b"><h3>${esc(i.groom || '?')} &amp; ${esc(i.bride || '?')}</h3>
      <div class="muted small">${esc(longDate(i.date, 'en') || 'No date')} · ${esc(t.name)}</div>
      <div class="chips"><span class="chip">${esc(planOf(i.plan).name)}</span><span class="chip">${g.length}${planOf(i.plan).guests ? ' / ' + planOf(i.plan).guests : ''} guests</span>${db.MODE === 'cloud' ? `<span class="chip ok">${ppl} coming</span><span class="chip no">${no} declined</span>` : ''}</div></div></article>`;
  }).join('');
  $('invGrid').querySelectorAll('.inv').forEach(el => { const go = () => location.hash = 'edit-' + el.dataset.id; el.onclick = go; el.onkeydown = e => { if (e.key === 'Enter') go(); }; });
}
$('newBtn').onclick = $('newBtn2').onclick = () => location.hash = 'new';
$('backupBtn').onclick = () => { const blob = new Blob([db.exportLocal()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ar-invites-backup.json'; a.click(); toast('Backup downloaded. Keep it safe.'); };

/* ---------- editor ---------- */
async function openEditor(id) {
  show('vEdit'); dirty = false; $('savedNote').textContent = '';
  inv = id ? await db.getInvitation(id) : blankInv();
  if (!inv) { toast('Invitation not found'); location.hash = 'list'; return; }
  inv.shareText = inv.shareText || DEFAULT_SHARE; inv.events = inv.events && inv.events.length ? inv.events : [{ time: '', label: '' }];
  $('edTitle').textContent = id ? `${inv.groom || '?'} & ${inv.bride || '?'}` : 'New invitation';
  // template picker
  $('tplPick').innerHTML = TEMPLATES.map(t => `<button type="button" class="tpl" data-t="${t.id}" aria-pressed="${t.id === inv.template}" title="${esc(t.tagline)}"><div class="th" style="background:${t.colors.bg}">${thumb(t)}</div>${esc(t.name)}<small>${esc(t.region || '')}</small></button>`).join('');
  $('tplPick').querySelectorAll('.tpl').forEach(b => b.onclick = () => { inv.template = b.dataset.t; $('tplPick').querySelectorAll('.tpl').forEach(x => x.setAttribute('aria-pressed', x === b)); syncStyle(); markDirty(); preview(); });
  // fields
  const map = { fGroom: 'groom', fBride: 'bride', fDate: 'date', fLang: 'lang', fVenue: 'venue', fAddress: 'address', fMap: 'mapUrl', fWa: 'whatsapp', fRsvpBy: 'rsvpBy', fMsg: 'message', fShare: 'shareText' };
  for (const [el, k] of Object.entries(map)) { $(el).value = inv[k] || ''; $(el).oninput = () => { inv[k] = $(el).value; markDirty(); }; }
  $('fLang').onchange = () => { inv.lang = $('fLang').value; markDirty(); preview(); };
  $('fStyle').value = inv.style || '2d'; $('fStyle').onchange = () => { inv.style = $('fStyle').value; markDirty(); preview(); }; syncStyle();
  $('delInv').hidden = !inv.id;
  $('fGroomSkin').value = inv.groomSkin || ''; $('fBrideSkin').value = inv.brideSkin || '';
  $('fGroomSkin').onchange = () => { inv.groomSkin = $('fGroomSkin').value; markDirty(); preview(); };
  $('fBrideSkin').onchange = () => { inv.brideSkin = $('fBrideSkin').value; markDirty(); preview(); };
  $('fPlan').value = inv.plan || 'standard'; $('fPlan').onchange = () => { inv.plan = $('fPlan').value; markDirty(); renderGuests(); };
  $('fHideBrand').checked = !!inv.hideBrand; $('fHideBrand').onchange = () => { inv.hideBrand = $('fHideBrand').checked; markDirty(); };
  const custom = !!(inv.art && (inv.art.groom || inv.art.bride));
  document.querySelector(`input[name=artMode][value=${custom ? 'custom' : 'drawn'}]`).checked = true; showArtMode();
  $('fArtG').value = inv.art?.groom || ''; $('fArtB').value = inv.art?.bride || ''; $('artNote').hidden = true; artThumbs();
  renderEvents(); setTab('details');
  updateLinks(); preview();
  if (id) loadGuests();
}
/* ---------- couple art ---------- */
function showArtMode() {
  const custom = document.querySelector('input[name=artMode]:checked').value === 'custom';
  $('drawnBox').hidden = custom; $('customBox').hidden = !custom;
}
document.querySelectorAll('input[name=artMode]').forEach(r => r.onchange = () => {
  showArtMode();
  if (r.value === 'drawn') inv.art = null; else inv.art = { groom: $('fArtG').value.trim(), bride: $('fArtB').value.trim() };
  syncStyle(); markDirty(); preview();
});
function setArt() { inv.art = { groom: $('fArtG').value.trim(), bride: $('fArtB').value.trim() }; artThumbs(); syncStyle(); markDirty(); }
$('fArtG').onchange = () => { setArt(); preview(); }; $('fArtB').onchange = () => { setArt(); preview(); };
function artThumbs() { for (const [inp, pv] of [['fArtG', 'pvG'], ['fArtB', 'pvB']]) { const u = $(inp).value.trim(); $(pv).style.backgroundImage = u ? `url("${(artPreview[u] || u).replace(/"/g, '%22')}")` : ''; } }
for (const [up, inp] of [['upG', 'fArtG'], ['upB', 'fArtB']]) $(up).onchange = async () => {
  const f = $(up).files[0]; $(up).value = ''; if (!f) return;
  if (f.size > 3 * 1024 * 1024) { toast('Please use an image under 3 MB'); return; }
  try {
    const r = await db.uploadArt(f);
    if (r.local) {
      artPreview[r.url] = URL.createObjectURL(f);
      const a = document.createElement('a'); a.href = artPreview[r.url]; a.download = r.name; a.click();
      $('artNote').hidden = false;
      $('artNote').innerHTML = `Saved as <b>${esc(r.name)}</b> (check your Downloads). Put this file in the <b>custom</b> folder of your site, then upload the site to Netlify again. Until then, only you can see it in the preview.`;
    }
    $(inp).value = r.url; setArt(); preview(); toast('Image added');
  } catch (e) { toast('Upload failed: ' + e.message); }
};
function syncStyle() {
  const ok3d = !!getTemplate(inv.template).has3d && !(inv.art && (inv.art.groom || inv.art.bride));
  $('styleRow').hidden = !ok3d;
  if (!ok3d) { inv.style = '2d'; $('fStyle').value = '2d'; }
}
function markDirty() { dirty = true; $('savedNote').textContent = 'Unsaved changes'; }
function renderEvents() {
  $('evRows').innerHTML = inv.events.map((e, i) => `<div class="ev"><input data-i="${i}" data-k="time" value="${esc(e.time)}" placeholder="9.15 am" aria-label="Time"><input data-i="${i}" data-k="label" value="${esc(e.label)}" placeholder="Poruwa ceremony" aria-label="Event"><button class="ghost" type="button" data-del="${i}" aria-label="Remove event">×</button></div>`).join('');
  $('evRows').querySelectorAll('input').forEach(el => el.oninput = () => { inv.events[+el.dataset.i][el.dataset.k] = el.value; markDirty(); });
  $('evRows').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { inv.events.splice(+b.dataset.del, 1); if (!inv.events.length) inv.events.push({ time: '', label: '' }); renderEvents(); markDirty(); });
  $('addEv').hidden = inv.events.length >= 4;
}
$('addEv').onclick = () => { inv.events.push({ time: '', label: '' }); renderEvents(); markDirty(); };

function validate() {
  if (!inv.groom.trim() || !inv.bride.trim()) return 'Please enter both names.';
  if (inv.whatsapp && normPhone(inv.whatsapp).length < 10) return 'The WhatsApp number looks too short.';
  if (inv.art && !inv.art.groom && !inv.art.bride) inv.art = null;
  if (inv.mapUrl && !/^https?:\/\//.test(inv.mapUrl)) return 'The map link should start with https://';
  return '';
}
async function save() {
  const err = validate(); if (err) { toast(err); setTab('details'); return false; }
  inv.whatsapp = inv.whatsapp ? normPhone(inv.whatsapp) : '';
  inv.events = inv.events.filter(e => e.time || e.label);
  try {
    const id = await db.saveInvitation(inv); const isNew = !inv.id;
    inv = await db.getInvitation(id); inv.shareText = inv.shareText || DEFAULT_SHARE; if (!inv.events.length) inv.events = [{ time: '', label: '' }];
    dirty = false; $('savedNote').textContent = 'Saved'; $('edTitle').textContent = `${inv.groom} & ${inv.bride}`;
    if (isNew) history.replaceState(null, '', '#edit-' + id);
    renderEvents(); updateLinks(); $('delInv').hidden = false; toast('Saved'); preview(); return true;
  } catch (e) { toast('Save failed: ' + e.message); return false; }
}
$('saveBtn').onclick = save;
$('delInv').onclick = async () => {
  if (!inv.id || !(await confirmDel(`Delete the invitation for ${inv.groom} & ${inv.bride} and all its guests? This cannot be undone.`))) return;
  try { await db.deleteInvitation(inv.id); dirty = false; toast('Deleted'); location.hash = 'list'; } catch (e) { toast('Delete failed: ' + e.message); }
};

/* ---------- tabs ---------- */
document.querySelectorAll('.tab').forEach(b => b.onclick = async () => {
  if (b.dataset.tab === 'guests' && (!inv.id || dirty)) { if (!(await save())) return; }
  setTab(b.dataset.tab);
});
function setTab(t) {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  $('tDetails').hidden = t !== 'details'; $('tGuests').hidden = t !== 'guests';
  if (t === 'guests') loadGuests();
}

/* ---------- preview ---------- */
let pvToken = 0, lastUrl = null;
async function preview() {
  const my = ++pvToken; $('busy').classList.remove('off'); $('busy').textContent = 'Building…';
  document.querySelector('.mvwrap').style.setProperty('--pv', getTemplate(inv.template).colors.bg);
  try {
    const data = { ...inv, groom: inv.groom || 'Groom', bride: inv.bride || 'Bride' };
    const url = await buildGLB(data, $('pvGuest').value.trim(), { resolve: u => artPreview[u] || u });
    if (my !== pvToken) { URL.revokeObjectURL(url); return; }
    if (lastUrl) URL.revokeObjectURL(lastUrl); lastUrl = url; setCamera($('mv'), inv.style === '3d' && getTemplate(inv.template).has3d ? '3d' : '2d'); $('mv').src = url;
    $('mv').addEventListener('load', () => $('busy').classList.add('off'), { once: true });
  } catch (e) { $('busy').textContent = 'Preview failed: ' + e.message; console.error(e); }
}
$('refresh').onclick = preview;
function setCamera(mv, style) {
  const is2d = style === '2d';
  mv.setAttribute('camera-orbit', is2d ? '0deg 84deg 4.9m' : '0deg 80deg 4.4m');
  mv.setAttribute('camera-target', is2d ? '0m 0.98m 0m' : '0m 0.9m 0m');
  mv.setAttribute('min-camera-orbit', is2d ? '-35deg 60deg auto' : '-70deg 50deg auto');
  mv.setAttribute('max-camera-orbit', is2d ? '35deg 95deg auto' : '70deg 92deg auto');
}
$('pvGuest').onchange = preview;
function updateLinks() {
  const ok = !!inv.id || db.MODE === 'local';
  const pub = db.guestLink(inv, null);
  $('openGuest').href = db.MODE === 'local' ? db.guestLink(inv, { name: $('pvGuest').value.trim() || 'Guest' }) : (inv.id ? pub : '#');
  $('openPub').href = pub; $('copyPub').onclick = () => copy(pub);
  $('openGuest').style.pointerEvents = ok ? '' : 'none';
}

/* ---------- guests ---------- */
async function loadGuests() {
  if (!inv.id) return;
  try { guests = await db.listGuests(inv.id); } catch (e) { toast('Could not load guests: ' + e.message); guests = []; }
  renderGuests();
}
function renderGuests() {
  const q = $('gSearch').value.trim().toLowerCase(), cloud = db.MODE === 'cloud';
  const yes = guests.filter(g => g.rsvp === 'yes'), no = guests.filter(g => g.rsvp === 'no');
  const people = yes.reduce((a, g) => a + (g.rsvp_count || 1), 0), opened = guests.filter(g => g.opened_at).length;
  $('stats').innerHTML = cloud
    ? [[guests.length, 'Invited'], [opened, 'Opened'], [people, 'People coming'], [no.length, 'Declined'], [guests.length - yes.length - no.length, 'No reply']].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('')
    : [[guests.length, 'Invited'], [guests.reduce((a, g) => a + (g.seats || 0), 0), 'Seats offered']].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('') + `<div class="stat" style="grid-column:span 3;text-align:left"><span>Replies arrive on the couple's WhatsApp. Turn on the free database (README) to track them here.</span></div>`;
  $('thStatus').hidden = !cloud;
  const plan = planOf(inv.plan), lim = plan.guests || 0, used = guests.length;
  $('usage').className = 'usage' + (lim && used >= lim ? ' full' : '');
  $('usage').innerHTML = lim ? `<b>${used} of ${lim}</b> invitations used · ${esc(plan.name)} package${used >= lim ? ' · <b>limit reached</b>, choose a bigger package in Details' : ''}<div class="bar"><i style="width:${Math.min(100, used / lim * 100)}%"></i></div>` : `<b>${used}</b> invitations · ${esc(plan.name)} package (unlimited)`;
  const list = guests.filter(g => !q || g.name.toLowerCase().includes(q));
  $('gEmpty').hidden = guests.length > 0;
  $('gRows').innerHTML = list.map(g => {
    const st = g.rsvp === 'yes' ? `<span class="st yes">Coming · ${g.rsvp_count || 1}</span>` : g.rsvp === 'no' ? '<span class="st no">Declined</span>' : g.opened_at ? '<span class="st open">Opened</span>' : '<span class="st">Not opened</span>';
    return `<tr data-id="${esc(g.id)}"><td><div class="nm">${esc(g.name)}</div>${g.phone ? `<div class="ph">${esc(g.phone)}</div>` : ''}${g.rsvp_message ? `<div class="ph">“${esc(g.rsvp_message)}”</div>` : ''}</td>
      <td>${g.seats || ''}</td>${cloud ? `<td>${st}</td>` : ''}
      <td><div class="acts"><button class="ic wa" data-a="wa" title="Send on WhatsApp" aria-label="Send on WhatsApp">${ICON.wa}</button><button class="ic" data-a="copy" title="Copy link" aria-label="Copy link">${ICON.copy}</button><button class="ic" data-a="open" title="Open guest page" aria-label="Open">${ICON.open}</button></div></td>
      <td><button class="ic del" data-a="del" title="Remove" aria-label="Remove guest">${ICON.del}</button></td></tr>`;
  }).join('');
  $('gRows').querySelectorAll('button').forEach(b => b.onclick = async () => {
    const g = guests.find(x => x.id === b.closest('tr').dataset.id), link = db.guestLink(inv, g);
    if (b.dataset.a === 'copy') copy(link);
    if (b.dataset.a === 'open') window.open(link, '_blank', 'noopener');
    if (b.dataset.a === 'wa') { const txt = encodeURIComponent(fill(inv.shareText, g, link)); window.open(`https://wa.me/${g.phone ? normPhone(g.phone) : ''}?text=${txt}`, '_blank', 'noopener'); }
    if (b.dataset.a === 'del' && await confirmDel(`Remove ${g.name}? Their link will stop working${db.MODE === 'cloud' ? '' : ' in your list'}.`)) { await db.deleteGuest(g.id); loadGuests(); }
  });
}
$('gSearch').oninput = renderGuests;
$('gAdd').onclick = async () => {
  const rows = $('gBulk').value.split('\n').map(l => { const [name, phone] = l.split(','); return { name: (name || '').trim(), phone: (phone || '').trim(), seats: +$('gSeats').value }; }).filter(r => r.name);
  if (!rows.length) { toast('Type at least one name'); return; }
  const lim = planOf(inv.plan).guests || 0;
  if (lim && guests.length + rows.length > lim) { toast(`The ${planOf(inv.plan).name} package allows ${lim} invitations (${Math.max(0, lim - guests.length)} left). Choose a bigger package in Details.`); return; }
  try { await db.addGuests(inv.id, rows); $('gBulk').value = ''; toast(`${rows.length} guest${rows.length > 1 ? 's' : ''} added`); loadGuests(); } catch (e) { toast('Could not add: ' + e.message); }
};
$('gCsv').onclick = () => {
  const head = ['Name', 'Phone', 'Seats', 'Reply', 'People', 'Message', 'Opened', 'Link'];
  const rows = guests.map(g => [g.name, g.phone || '', g.seats || '', g.rsvp || '', g.rsvp_count || '', g.rsvp_message || '', g.opened_at ? 'yes' : '', db.guestLink(inv, g)]);
  const csv = [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = `${inv.groom}-${inv.bride}-guests.csv`; a.click();
};

route();
