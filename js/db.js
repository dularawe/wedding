// Data layer. Two modes:
//  • cloud: Supabase (central RSVP tracking, short links)            – when CONFIG.SUPABASE_URL is set
//  • local: browser storage for the admin, invitation data inside the link – no setup needed
import { CONFIG } from './config.js';

export const MODE = CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY ? 'cloud' : 'local';
let sb = null;
if (MODE === 'cloud') {
  if (!window.supabase) throw new Error('Supabase library missing');
  sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
}

/* ---------- helpers ---------- */
const rid = (n = 10) => { const a = 'abcdefghjkmnpqrstuvwxyz23456789'; const r = crypto.getRandomValues(new Uint8Array(n)); return [...r].map(x => a[x % a.length]).join(''); };
export function b64urlEncode(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj)); let s = '';
  for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function b64urlDecode(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(b));
}
const store = {
  get() { try { return JSON.parse(localStorage.getItem('arinv_db') || '{"invitations":[],"guests":[]}'); } catch (e) { return { invitations: [], guests: [] }; } },
  set(d) { localStorage.setItem('arinv_db', JSON.stringify(d)); }
};
// the fields copied into a link / shown to guests
export const PUBLIC_FIELDS = ['template', 'style', 'groomSkin', 'brideSkin', 'art', 'plan', 'hideBrand', 'lang', 'groom', 'bride', 'date', 'events', 'venue', 'address', 'mapUrl', 'whatsapp', 'rsvpBy', 'message'];
const pick = inv => Object.fromEntries(PUBLIC_FIELDS.filter(k => inv[k] !== undefined && inv[k] !== '').map(k => [k, inv[k]]));

/* ---------- auth ---------- */
export async function currentUser() {
  if (MODE === 'cloud') { const { data } = await sb.auth.getSession(); return data.session ? data.session.user : null; }
  return sessionStorage.getItem('arinv_admin') === '1' ? { email: 'admin' } : null;
}
export async function signIn(email, password) {
  if (MODE === 'cloud') { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; return; }
  if (password !== String(CONFIG.ADMIN_PIN)) throw new Error('Wrong PIN');
  sessionStorage.setItem('arinv_admin', '1');
}
export async function signOut() { if (MODE === 'cloud') await sb.auth.signOut(); sessionStorage.removeItem('arinv_admin'); }

/* ---------- invitations ---------- */
export async function listInvitations() {
  if (MODE === 'cloud') {
    const { data, error } = await sb.from('invitations').select('id, code, data, created_at, guests(rsvp, rsvp_count, opened_at)').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(r => ({ ...r.data, id: r.id, code: r.code, created_at: r.created_at, _guests: r.guests }));
  }
  const d = store.get();
  return d.invitations.slice().sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).map(i => ({ ...i, _guests: d.guests.filter(g => g.invitation_id === i.id) }));
}
export async function getInvitation(id) {
  if (MODE === 'cloud') { const { data, error } = await sb.from('invitations').select('id, code, data').eq('id', id).single(); if (error) throw error; return { ...data.data, id: data.id, code: data.code }; }
  return store.get().invitations.find(i => i.id === id) || null;
}
export async function saveInvitation(inv) {
  const clean = { ...inv }; delete clean._guests; delete clean.id; delete clean.code; delete clean.created_at;
  if (MODE === 'cloud') {
    if (inv.id) { const { error } = await sb.from('invitations').update({ data: clean, updated_at: new Date().toISOString() }).eq('id', inv.id); if (error) throw error; return inv.id; }
    const { data, error } = await sb.from('invitations').insert({ data: clean }).select('id').single(); if (error) throw error; return data.id;
  }
  const d = store.get();
  if (inv.id) { const i = d.invitations.findIndex(x => x.id === inv.id); d.invitations[i] = { ...d.invitations[i], ...clean }; store.set(d); return inv.id; }
  const id = rid(12); d.invitations.push({ ...clean, id, code: rid(8), created_at: new Date().toISOString() }); store.set(d); return id;
}
export async function deleteInvitation(id) {
  if (MODE === 'cloud') { const { error } = await sb.from('invitations').delete().eq('id', id); if (error) throw error; return; }
  const d = store.get(); d.invitations = d.invitations.filter(i => i.id !== id); d.guests = d.guests.filter(g => g.invitation_id !== id); store.set(d);
}

/* ---------- guests ---------- */
export async function listGuests(invId) {
  if (MODE === 'cloud') { const { data, error } = await sb.from('guests').select('*').eq('invitation_id', invId).order('created_at'); if (error) throw error; return data; }
  return store.get().guests.filter(g => g.invitation_id === invId);
}
export async function addGuests(invId, rows) {
  const clean = rows.map(r => ({ name: r.name.trim().slice(0, 80), phone: (r.phone || '').replace(/[^\d]/g, '').slice(0, 15) || null, seats: r.seats || 2 })).filter(r => r.name);
  if (!clean.length) return;
  if (MODE === 'cloud') { const { error } = await sb.from('guests').insert(clean.map(r => ({ ...r, invitation_id: invId }))); if (error) throw error; return; }
  const d = store.get(); const now = Date.now();
  clean.forEach((r, i) => d.guests.push({ ...r, id: rid(12), token: rid(10), invitation_id: invId, created_at: new Date(now + i).toISOString() }));
  store.set(d);
}
export async function updateGuest(id, patch) {
  if (MODE === 'cloud') { const { error } = await sb.from('guests').update(patch).eq('id', id); if (error) throw error; return; }
  const d = store.get(); const g = d.guests.find(x => x.id === id); Object.assign(g, patch); store.set(d);
}
export async function deleteGuest(id) {
  if (MODE === 'cloud') { const { error } = await sb.from('guests').delete().eq('id', id); if (error) throw error; return; }
  const d = store.get(); d.guests = d.guests.filter(g => g.id !== id); store.set(d);
}

/* ---------- links ---------- */
const baseUrl = () => location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
export function guestLink(inv, guest) {
  if (MODE === 'cloud') return `${baseUrl()}i.html?g=${guest ? guest.token : inv.code}`;
  const payload = { i: pick(inv) }; if (guest) payload.n = guest.name; if (guest && guest.seats) payload.s = guest.seats;
  return `${baseUrl()}i.html#d=${b64urlEncode(payload)}`;
}

/* ---------- guest side ---------- */
export async function loadInvite() {
  const qs = new URLSearchParams(location.search), hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get('d')) { const p = b64urlDecode(hash.get('d')); return { inv: p.i, guest: p.n ? { name: p.n, seats: p.s || 2 } : null, token: null }; }
  const token = qs.get('g');
  if (token && MODE === 'cloud') {
    const { data, error } = await sb.rpc('get_invite', { p_token: token });
    if (error || !data) return null;
    sb.rpc('mark_opened', { p_token: token }).then(() => {}, () => {});
    return { inv: data.inv, guest: data.guest, token };
  }
  return null;
}
export async function submitRsvp(token, { name, rsvp, count, message }) {
  if (MODE !== 'cloud' || !token) return false;
  const { error } = await sb.rpc('submit_rsvp', { p_token: token, p_name: name || '', p_rsvp: rsvp, p_count: count, p_message: message || '' });
  if (error) throw error; return true;
}

/* ---------- custom couple art upload ---------- */
// cloud: stored in Supabase Storage (bucket "art"); local: you place the file in the site's custom/ folder
export async function uploadArt(file) {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
  const name = `${Date.now().toString(36)}-${safe}`;
  if (MODE === 'cloud') {
    const { data: u } = await sb.auth.getUser();
    const path = `${u.user.id}/${name}`;
    const { error } = await sb.storage.from('art').upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return { url: sb.storage.from('art').getPublicUrl(path).data.publicUrl, local: false };
  }
  return { url: `custom/${name}`, local: true, name };
}

/* ---------- local-mode backup ---------- */
export const exportLocal = () => JSON.stringify(store.get(), null, 2);
export function importLocal(json) { const d = JSON.parse(json); if (!Array.isArray(d.invitations) || !Array.isArray(d.guests)) throw new Error('Not a backup file'); store.set(d); }
