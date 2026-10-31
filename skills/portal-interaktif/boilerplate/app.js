// Portal belajar interaktif, boilerplate skill /portal-interaktif.
// Semua isi dibaca dari content.js (window.CONTENT) dan images.js (window.IMAGE_SIZES).
// Kode ini tidak memuat isi topik apa pun; ganti content.js untuk membuat portal baru.
(() => {
'use strict';
const C = window.CONTENT;
const T = C.topic, COURSE = C.course;
// Bentuk internal yang dipakai kode di bawah, dibangun dari content.js.
const P = {
  modules: C.modules,
  termDefinitions: C.glossary || {},
  diagrams: C.diagrams || [],
  imageSizes: window.IMAGE_SIZES || {},
  canonicalTopics: C.modules.map(m => m.terms || []),
};
const REF = C.modules.map(m => ({ inti: m.inti, sections: m.sections }));
// Kuis: lima soal per modul, lima opsi per soal.
const QS = C.modules.map(m => m.quiz || []);
// Urutan opsi diacak tetap per soal, supaya posisi kunci tersebar dan tidak berubah saat halaman dibuka ulang.
function optionOrder(i, k, n) {
  let seed = (i + 1) * 7919 + (k + 1) * 104729 + (C.quizSeed || 60);
  const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const order = [...Array(n).keys()];
  for (let j = n - 1; j > 0; j--) { const r = Math.floor(rnd() * (j + 1)); [order[j], order[r]] = [order[r], order[j]]; }
  return order;
}
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])).replace(/–/g, '-');
const pad = n => String(n).padStart(2, '0');

// Bab atau kelompok modul. Warna tiap kelompok diambil dari token --ch1 sampai --ch4 di style.css.
const BAB = C.chapters.map((c, idx) => ({ ...c, idx, cls: `ch-${idx + 1}`, mods: C.modules.map((m, i) => (m.chapter === idx ? i : -1)).filter(i => i >= 0) }));
const babOf = i => BAB[C.modules[i].chapter];
// Gaya bahasa: 'formal' atau 'santai'. Saat santai, field di objek informal menimpa field biasa
// (modul, unit, persiapan). Definisi, rumus, dan kuis tetap sama di kedua gaya.
const voice = () => (C.voices && state.voice === 'santai' ? 'santai' : 'formal');
const vx = o => (o && voice() === 'santai' && o.informal ? { ...o, ...o.informal } : o);
const mod = i => ({ ...vx(C.modules[i]), i, num: i + 1, bab: babOf(i) });
// Judul pendek untuk menu dan peta pokok bahasan, misalnya "Residual & Loss".
const shortOf = m => m.short || m.title;
const NMOD = C.modules.length;

// Identitas halaman diisi dari content.js.
document.title = `${T.short} · ${T.title}`;
$('#brandMark').textContent = T.mark || T.num || '';
$('#brandTitle').textContent = T.short;
$('#brandSub').textContent = COURSE ? COURSE.name : '';
$('#footSource').innerHTML = C.source || '';
if (C.footNote) $('#footNote').innerHTML = C.footNote;

// Gambar selalu memakai ukuran aslinya, supaya rasio tidak berubah.
function img(name, alt, extra = '') {
  const [w, h] = P.imageSizes[name] || [1400, 934];
  return `<img src="assets/${name}.webp" alt="${esc(alt)}" width="${w}" height="${h}" ${extra}>`;
}

// ---------- state lokal ----------
const KEY = C.storageKey || `portal-${T.short.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
let state = { visited: {}, notes: {}, quiz: {}, fold: {}, last: null, theme: null, sidebar: 'open', xp: 0, awards: {}, badges: {}, derive: {}, prep: {}, exam: {}, calc: 0 };
try { Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { /* penyimpanan tidak tersedia */ }
delete state.done; // format lama v2 awal, kini dihitung dari kuis dan catatan
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* abaikan */ } };

// Syarat selesai: kelima soal dijawab dengan minimal 4 benar, dan penjelasan ulang sudah ditulis.
const PASS = 4, RECALL_MIN = 40;
function progress(i) {
  const ans = state.quiz[i] || {}, qs = QS[i];
  const answered = Object.keys(ans).length;
  const correct = Object.entries(ans).filter(([k, v]) => qs[k] && qs[k].key === v).length;
  const recall = (state.notes[i] || '').trim().length >= RECALL_MIN;
  const quizOk = answered === qs.length && correct >= PASS;
  return { answered, correct, total: qs.length, recall, quizOk, done: quizOk && recall };
}
const doneCount = () => P.modules.filter((_, i) => progress(i).done).length;
function statusOf(i) {
  const p = progress(i);
  if (p.done) return { cls: 'done', label: 'Selesai', icon: 'check-circle' };
  if (p.answered || state.notes[i]) return { cls: 'busy', label: `Berlatih ${p.correct}/${p.total}`, icon: 'circle-half' };
  if (state.visited[i]) return { cls: 'seen', label: 'Dibuka', icon: 'circle-dashed' };
  return { cls: '', label: '', icon: '' };
}

// ---------- gamifikasi: XP, level, dan lencana ----------
// XP hanya diberikan untuk tanda paham (jawaban benar, penurunan, modul selesai), bukan untuk membuka halaman.
// Setiap hadiah punya id, jadi mengulang kuis atau simulasi tidak memberi XP dua kali.
const GAME = C.game || {};
const LEVELS = GAME.levels || [[0, 'Pemula'], [100, 'Pelajar'], [300, 'Penalar'], [600, 'Analis'], [1000, 'Ahli']];
const BADGES = [
  { id: 'siap', icon: 'compass', title: 'Siap berangkat', desc: 'Menjawab benar semua cek bekal di Persiapan.' },
  { id: 'langkah-pertama', icon: 'flag', title: 'Langkah pertama', desc: 'Menyelesaikan satu modul.' },
  { id: 'tuntas', icon: 'trophy', title: 'Tuntas', desc: 'Menyelesaikan semua modul.' },
  { id: 'penurun', icon: 'stairs', title: 'Penurun rumus', desc: 'Menyelesaikan satu penurunan tanpa membuka langkah.' },
  { id: 'tanpa-contekan', icon: 'medal', title: 'Tanpa contekan', desc: 'Menyelesaikan semua penurunan tanpa membuka langkah.' },
  { id: 'penghitung', icon: 'calculator', title: 'Penghitung', desc: 'Menjawab benar lima set latihan hitung acak.' },
  { id: 'siap-ujian', icon: 'exam', title: 'Siap ujian', desc: 'Mendapat minimal 80% di Mode Ujian.' },
  { id: 'sempurna', icon: 'star', title: 'Sempurna', desc: 'Mendapat 100% di paket ujian berisi minimal 12 soal.' },
  ...(GAME.badges || []),
];
const levelOf = xp => {
  let k = 0; LEVELS.forEach(([t], j) => { if (xp >= t) k = j; });
  return { k, name: LEVELS[k][1], floor: LEVELS[k][0], next: LEVELS[k + 1] ? LEVELS[k + 1][0] : null };
};
const toastEl = document.createElement('div');
toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.hidden = true;
document.body.append(toastEl);
let toastTimer;
function toast(html) { toastEl.innerHTML = html; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2800); }
function award(id, xp, label) {
  if (state.awards[id]) return false;
  state.awards[id] = Date.now(); state.xp += xp; save();
  toast(`<b>+${xp} XP</b> ${esc(label || '')}`);
  checkBadges(); renderXp();
  return true;
}
function badge(id) {
  const b = BADGES.find(x => x.id === id);
  if (!b || state.badges[id]) return;
  state.badges[id] = Date.now(); save();
  setTimeout(() => toast(`<i class="ph ph-${b.icon}" aria-hidden="true"></i> Lencana baru: <b>${esc(b.title)}</b>`), 1200);
}
// Daftar penurunan di seluruh portal, untuk lencana "Tanpa contekan".
const DERIVES = C.modules.flatMap((m, i) => m.sections.map((u, k) => (u.derive ? `${i}-${k}` : null)).filter(Boolean));
function checkBadges() {
  const done = C.modules.filter((_, i) => progress(i).done).length;
  if (done >= 1) badge('langkah-pertama');
  if (done === C.modules.length) badge('tuntas');
  if (DERIVES.some(d => state.derive[d] === 'clean')) badge('penurun');
  if (DERIVES.length && DERIVES.every(d => state.derive[d] === 'clean')) badge('tanpa-contekan');
  if (state.calc >= 5) badge('penghitung');
}
function renderXp() {
  const el = document.getElementById('xpBox');
  if (!el) return;
  const L = levelOf(state.xp), pct = L.next ? Math.round((state.xp - L.floor) / (L.next - L.floor) * 100) : 100;
  el.innerHTML = `<div class="xp-head"><strong><i class="ph ph-lightning" aria-hidden="true"></i>${esc(L.name)}</strong><span>${state.xp} XP</span></div>
    <div class="xp-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Kemajuan ke level berikutnya"><span style="width:${pct}%"></span></div>
    <small>${L.next ? `${L.next - state.xp} XP lagi ke ${esc(LEVELS[L.k + 1][1])} · ${Object.keys(state.badges).length}/${BADGES.length} lencana` : `Level tertinggi · ${Object.keys(state.badges).length}/${BADGES.length} lencana`}</small>`;
}
function badgeList() {
  return `<ul class="badges">${BADGES.map(b => `<li class="${state.badges[b.id] ? 'got' : ''}"><i class="ph ph-${b.icon}" aria-hidden="true"></i><div><strong>${esc(b.title)}</strong><small>${esc(b.desc)}</small></div>${state.badges[b.id] ? '<span class="sr">sudah didapat</span>' : ''}</li>`).join('')}</ul>`;
}

if (state.theme) document.documentElement.dataset.theme = state.theme;
$('#themeToggle').onclick = () => {
  const dark = state.theme ? state.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  state.theme = dark ? 'light' : 'dark';
  document.documentElement.dataset.theme = state.theme;
  save();
};
// Tombol gaya bahasa, hanya bila content.js menyediakan voices.
if (C.voices) {
  const vb = document.createElement('button');
  vb.className = 'icon-btn voice-btn'; vb.type = 'button'; vb.id = 'voiceToggle'; vb.dataset.tipPos = 'bottom';
  const label = () => {
    const s = voice() === 'santai';
    vb.innerHTML = `<i class="ph ph-chat-circle-text" aria-hidden="true"></i><span>${s ? 'Santai' : 'Formal'}</span>`;
    vb.setAttribute('aria-label', `Gaya bahasa ${s ? 'santai' : 'formal'}. Klik untuk mengganti.`);
    vb.dataset.tip = s ? (C.voices.formal || 'Ganti ke gaya formal') : (C.voices.santai || 'Ganti ke gaya santai');
  };
  label();
  vb.onclick = () => { state.voice = voice() === 'santai' ? 'formal' : 'santai'; save(); label(); route(); };
  $('#themeToggle').before(vb);
}

// ---------- sidebar: lipat penuh dan lipat per bab ----------
function applySidebar() {
  const closed = state.sidebar === 'closed';
  $('.app').classList.toggle('sidebar-closed', closed);
  const t = $('#edgeToggle'), tip = closed ? 'Tampilkan sidebar  [' : 'Sembunyikan sidebar  [';
  t.setAttribute('aria-expanded', String(!closed));
  t.setAttribute('aria-label', closed ? 'Tampilkan sidebar' : 'Sembunyikan sidebar');
  t.dataset.tip = tip;
  t.innerHTML = `<i class="ph ph-caret-${closed ? 'right' : 'left'}" aria-hidden="true"></i>`;
}
const setSidebar = open => { state.sidebar = open ? 'open' : 'closed'; save(); applySidebar(); hideTip(); };
$('#edgeToggle').onclick = () => setSidebar(state.sidebar === 'closed');
// Pintasan papan ketik: tombol [ melipat atau membuka sidebar, kecuali saat mengetik.
document.addEventListener('keydown', e => { if (e.key === '[' && !e.target.closest('input, textarea, select')) setSidebar(state.sidebar === 'closed'); });

// Tooltip ringan untuk tombol ikon dan rail. Atribut data-tip berisi keterangan, data-tip-pos menentukan arah.
const tipEl = document.createElement('div');
tipEl.className = 'tip-float'; tipEl.setAttribute('role', 'tooltip'); tipEl.hidden = true;
document.body.append(tipEl);
function showTip(el) {
  tipEl.textContent = el.dataset.tip; tipEl.hidden = false;
  const r = el.getBoundingClientRect(), pos = el.dataset.tipPos || 'right';
  const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
  let x = pos === 'right' ? r.right + 10 : r.left + r.width / 2 - tw / 2;
  let y = pos === 'right' ? r.top + r.height / 2 - th / 2 : r.bottom + 8;
  x = Math.max(8, Math.min(x, innerWidth - tw - 8));
  tipEl.style.left = `${x}px`; tipEl.style.top = `${y}px`;
}
function hideTip() { tipEl.hidden = true; }
document.addEventListener('mouseover', e => { const t = e.target.closest('[data-tip]'); if (t) showTip(t); else hideTip(); });
document.addEventListener('focusin', e => { const t = e.target.closest('[data-tip]'); if (t) showTip(t); });
document.addEventListener('focusout', hideTip);
addEventListener('scroll', hideTip, { passive: true });
applySidebar();

// ---------- pemilih topik ----------
function topicMenu() {
  return `<a class="tm-all" href="#/kursus"><i class="ph ph-squares-four" aria-hidden="true"></i><span>Semua topik ${esc(COURSE.short || COURSE.name)}</span></a>` + COURSE.halves.map(h => `<div class="tm-group"><small>${h.title}</small>${h.topics.map(n => {
    const t = COURSE.topics[n], cur = n === COURSE.current;
    const inner = `<span class="n">${pad(n)}</span><span class="t">${esc(t.title)}</span>${t.status === 'portal' ? '' : '<span class="tag">segera</span>'}`;
    return t.href ? `<a href="${t.href}" ${cur ? 'aria-current="true"' : ''}>${inner}</a>` : `<span class="off">${inner}</span>`;
  }).join('')}</div>`).join('');
}
$('#topicMenu').innerHTML = topicMenu();
$('#topicButton').onclick = e => {
  e.stopPropagation();
  const open = $('#topicMenu').hidden;
  // Menu melayang di atas lapisan sidebar, ditempatkan tepat di bawah tombol topik.
  const r = $('#topicButton').getBoundingClientRect();
  $('#topicMenu').style.left = `${r.left}px`;
  $('#topicMenu').style.top = `${r.bottom + 6}px`;
  $('#topicMenu').hidden = !open;
  $('#topicButton').setAttribute('aria-expanded', String(open));
};
document.addEventListener('click', e => {
  if (!$('#topicMenu').hidden && !e.target.closest('#topicMenu')) { $('#topicMenu').hidden = true; $('#topicButton').setAttribute('aria-expanded', 'false'); }
});

// ---------- kerangka ----------
const NAV = [['/', 'Beranda topik', 'house'], ...(C.prep ? [['/persiapan', 'Persiapan', 'compass']] : []), ['/latihan', 'Latihan', 'target'], ['/ujian', 'Mode Ujian', 'exam'], ['/tanya', 'Tanya AI', 'sparkle']];
const TABS = [['/', 'Beranda', 'house'], ...(C.prep ? [['/persiapan', 'Persiapan', 'compass']] : []), ['/latihan', 'Latihan', 'target'], ['/ujian', 'Ujian', 'exam'], ['/kursus', 'Topik', 'squares-four']];
function frame(section, crumbs, currentModule) {
  const link = ([href, label, icon]) => `<a href="#${href}" ${section === href ? 'aria-current="page"' : ''}><i class="ph ph-${icon}" aria-hidden="true"></i><span>${label}</span></a>`;
  $('#primaryNav').innerHTML = NAV.map(link).join('');
  $('#tabbar').innerHTML = TABS.map(link).join('');
  $('#moduleTree').innerHTML = BAB.map(b => `<details class="${b.cls}" data-bab="${b.idx}" ${state.fold[b.idx] ? '' : 'open'}><summary><i class="ph ph-caret-right" aria-hidden="true"></i><span>${esc(b.label)}. ${esc(b.title)}</span></summary><ol>${b.mods.map(i => {
    const m = mod(i), st = statusOf(i);
    return `<li><a href="#/modul/${m.num}" ${i === currentModule ? 'aria-current="page"' : ''} title="${esc(m.title)}"><span class="n">${pad(m.num)}</span><span class="t">${esc(shortOf(m))}</span>${st.cls === 'done' ? '<i class="ph ph-check-circle" aria-label="selesai"></i>' : ''}</a></li>`;
  }).join('')}</ol></details>`).join('');
  // Rail ikon: tetap bisa bernavigasi saat sidebar disembunyikan.
  $('#rail').innerHTML = `${NAV.map(([href, label, icon]) => `<a class="rail-btn" href="#${href}" ${section === href ? 'aria-current="page"' : ''} data-tip="${label}" aria-label="${label}"><i class="ph ph-${icon}" aria-hidden="true"></i></a>`).join('')}
    <span class="rail-sep" aria-hidden="true"></span>
    ${P.modules.map((_, j) => { const mm = mod(j); return `<a class="rail-mod ${mm.bab.cls} ${progress(j).done ? 'done' : ''}" href="#/modul/${mm.num}" ${j === currentModule ? 'aria-current="page"' : ''} data-tip="${pad(mm.num)} ${esc(shortOf(mm))}${progress(j).done ? ' (selesai)' : ''}" aria-label="Modul ${pad(mm.num)} ${esc(mm.title)}">${pad(mm.num)}</a>`; }).join('')}`;
  $$('#moduleTree details').forEach(d => d.ontoggle = () => { state.fold[d.dataset.bab] = !d.open; save(); });
  $('#sidebarProgress').innerHTML = `<div class="xp" id="xpBox"></div><strong>${doneCount()} / ${NMOD}</strong> modul selesai<div class="meter">${P.modules.map((_, i) => `<span class="${progress(i).done ? 'on' : ''}"></span>`).join('')}</div>`;
  renderXp();
  const trail = COURSE ? [[COURSE.short || COURSE.name, '/kursus'], ...crumbs] : crumbs;
  $('#crumbs').innerHTML = trail.map((c, k) => k === trail.length - 1 ? `<span class="here">${esc(c[0])}</span>` : `<a href="#${c[1]}">${esc(c[0])}</a><span class="sep">/</span>`).join('');
  document.body.className = currentModule != null ? babOf(currentModule).cls : '';
}
function show(html) {
  const main = $('#main');
  main.innerHTML = `<div class="page">${html}</div>`;
  mountMindmaps();
  main.focus({ preventScroll: true });
}

function chapterLists() {
  return `<div class="chapters">${BAB.map(b => `<section class="chapter ${b.cls}"><header><small>${esc(b.label)}</small><h3>${esc(b.title)}</h3><p>${esc(b.sub || '')}</p></header><ol>${b.mods.map(i => {
    const m = mod(i), st = statusOf(i);
    return `<li><a class="mod-row" href="#/modul/${m.num}"><span class="n">${pad(m.num)}</span><span><strong>${esc(shortOf(m))}</strong><span class="h">${esc(m.short ? m.title : m.hook)}</span></span><span class="st ${st.cls}">${st.icon ? `<i class="ph ph-${st.icon}" aria-hidden="true"></i>` : ''}${st.label}</span></a></li>`;
  }).join('')}</ol></section>`).join('')}</div>`;
}

// ---------- mindmap ----------
// Digambar oleh library mindmap-html (lib/mindmap.js), salinan dari Business/InnovationKit/Products/mindmap-html.
// Portal hanya menyusun data pohon: node bisa berupa tautan (href), lompatan ke bagian halaman (goto), atau istilah (term).
const MM = new Map();
let mmSeq = 0;
function mindmap(spec, key) {
  const id = `mm${++mmSeq}`;
  MM.set(id, { spec, key });
  return `<div class="mm-mount" id="${id}"></div>`;
}
// Ubah node portal ke bentuk data library.
function toLib(n) {
  const out = { label: n.label, note: n.note, num: n.num, href: n.href, color: n.color, id: n.id, open: n.open };
  if (n.goto) out.attrs = { 'data-goto': n.goto };
  if (n.term) out.attrs = { 'data-term': n.term, 'data-label': n.label };
  if (n.kids && n.kids.length) out.kids = n.kids.map(toLib);
  return out;
}
function mountMindmaps() {
  MM.forEach(({ spec, key }, id) => {
    const host = document.getElementById(id);
    if (!host) { MM.delete(id); return; }
    MindmapHTML.render(host, toLib(spec), {
      layout: spec.layout || 'auto',
      storageKey: `${KEY}:mm:${key}`,
      tipAttr: 'data-tip',
      palette: MM_COLORS,
      labels: { expandAll: 'Buka semua cabang', collapseAll: 'Lipat semua cabang', expand: c => `Buka ${c} cabang`, collapse: 'Lipat cabang' },
      icons: { expandAll: '<i class="ph ph-arrows-out-line-vertical" aria-hidden="true"></i>', collapseAll: '<i class="ph ph-arrows-in-line-vertical" aria-hidden="true"></i>' },
      onRender: () => bindPageActions(),
    });
    MM.delete(id);
  });
}
function termKey(t) {
  const d = P.termDefinitions, k = t.toLowerCase();
  if (d[k]) return k;
  const short = k.replace(/\s*\(.*\)$/, '');
  if (d[short]) return short;
  const abbr = (k.match(/\(([^)]+)\)/) || [])[1];
  return abbr && d[abbr] ? abbr : null;
}
// Warna cabang memakai palet kategori yang sama dengan grafik, diambil berurutan tanpa diputar ulang.
const MM_COLORS = ['var(--mm1)', 'var(--mm2)', 'var(--mm3)', 'var(--mm4)', 'var(--mm5)', 'var(--mm6)', 'var(--mm7)', 'var(--mm8)'];
const shortTerm = t => t.length <= 26;
const firstSentence = t => { const f = (String(t).match(/^.+?\.(\s|$)/) || [t])[0].trim(); return f.length > 120 ? f.slice(0, 117).trimEnd() + '…' : f; };
function topicMindmap() {
  return mindmap({
    label: T.short, note: T.title,
    kids: BAB.map(b => ({
      label: b.title, num: b.label, color: `var(--ch${b.idx + 1})`, id: `bab${b.idx}`, open: true,
      kids: b.mods.map(i => {
        const m = mod(i);
        // Tingkat 3: sub-modul. Keterangannya ringkasan satu baris (brief) di lessons.js; modul yang belum dirapikan tampil tanpa keterangan.
        const units = REF[i].sections.map(u => ({ label: u.title, note: u.brief || firstSentence(plain(u.define)) }));
        return { label: m.title, num: pad(m.num), href: `#/modul/${m.num}`, id: `modul${m.num}`,
          kids: units.map((u, k) => ({ ...u, href: `#/modul/${m.num}/p-${k}` })) };
      }),
    })),
  }, 'topik');
}
// Daun sebuah unit: kalau unit berisi daftar (grid slide atau kartu), daftar itu yang dipakai lengkap;
// kalau tidak, istilah yang ditebalkan di definisinya.
function unitLeaves(u) {
  const list = (u.slide && u.slide.grid) ? u.slide.grid.map(([, name, desc]) => [name, desc]) : Array.isArray(u.tiles) ? u.tiles : null;
  if (list) return list.map(([name, desc]) => ({ label: name, note: desc, term: termKey(name) || undefined }));
  return [...new Set(boldTerms(u.define))].filter(t => t.toLowerCase() !== u.title.toLowerCase()).map(t => ({ label: t, term: termKey(t) || undefined }));
}
// Peta modul tiga lapis mengikuti halaman: bagian (Inti, Pendalaman, Cek pemahaman), lalu isinya, lalu istilah.
// Lapis pertama terbuka di awal; sub-modul terlipat sampai dibuka.
function moduleMindmap(i) {
  const m = mod(i), R = REF[i];
  const units = R.sections.map((u, k) => ({ label: u.title, note: u.brief, goto: `p-${k}`, id: `p${k}`, kids: unitLeaves(u) }));
  return mindmap({
    label: m.title, note: m.hook, layout: 'right',
    kids: [
      { label: 'Inti', id: 'inti', open: true, color: MM_COLORS[0], kids: [{ label: 'Cerita', goto: 'inti-cerita' }, { label: 'Konsep', goto: 'inti-konsep' }] },
      { label: 'Pendalaman', id: 'pendalaman', open: true, color: MM_COLORS[1], kids: units },
      { label: 'Cek pemahaman', id: 'cek', open: true, color: MM_COLORS[2], kids: [{ label: 'Penjelasan dengan bahasamu', goto: 'cek-ingat' }, { label: 'Kuis', goto: 'cek-soal' }] },
    ],
  }, `modul${i + 1}`);
}

// ---------- semua topik ----------
function kursus() {
  frame('/kursus', [['Semua topik']]);
  const badge = { portal: ['ok', 'Portal tersedia'], slide: ['', 'Belum ada portal'], none: ['', 'Belum ada materi'] };
  show(`<div class="page-head"><h1>${esc(COURSE.name)}</h1><p>${esc([COURSE.code, COURSE.term].filter(Boolean).join(' · '))}</p></div>
  ${COURSE.halves.map(h => `<section class="half"><header><h2>${h.title}</h2><p>${esc(h.exam)}</p></header><ol class="topic-list">${h.topics.map(n => {
    const t = COURSE.topics[n], [cls, label] = badge[t.status];
    const prog = n === COURSE.current ? `<span class="tp">${doneCount()}/${NMOD} modul selesai</span>` : '';
    const inner = `<span class="n">${pad(n)}</span><span class="tt"><strong>${esc(t.title)}</strong><small>${esc(t.chapter)}</small></span>${prog}<span class="badge ${cls}">${label}</span>`;
    return `<li>${t.href ? `<a class="topic-row" href="${t.href}">${inner}</a>` : `<div class="topic-row off">${inner}</div>`}</li>`;
  }).join('')}</ol></section>`).join('')}`);
}

// ---------- beranda topik ----------
function home() {
  frame('/', [[T.short]]);
  const next = state.last != null ? mod(state.last) : mod(0);
  show(`
  <section class="hero">
    <div>
      <h1>${T.titleHtml || esc(T.title)}</h1>
      <p class="lead">${esc(T.lead)}</p>
      <div class="actions">
        ${C.prep && state.last == null ? `<a class="btn" href="#/persiapan">Mulai dari Persiapan<i class="ph ph-arrow-right" aria-hidden="true"></i></a><a class="btn ghost" href="#/modul/1">Langsung ke Modul 01</a>` : `<a class="btn" href="#/modul/${next.num}">${state.last != null ? 'Lanjutkan' : 'Mulai belajar'}<i class="ph ph-arrow-right" aria-hidden="true"></i></a>${C.prep ? '<a class="btn ghost" href="#/persiapan">Persiapan</a>' : ''}`}
        <a class="btn ghost" href="#/ujian"><i class="ph ph-exam" aria-hidden="true"></i>Mode Ujian</a>
      </div>
      <div class="status-line">
        <span><strong>${doneCount()}/${NMOD}</strong> modul selesai</span>
        <span>Berikutnya: <a href="#/modul/${next.num}">${pad(next.num)} ${esc(next.title)}</a></span>
      </div>
    </div>
    ${T.heroArt ? `<figure>${img(T.heroArt, T.heroAlt || T.title, 'fetchpriority="high"')}</figure>` : ''}
  </section>

  ${(T.gains || []).length ? `<section class="gains" aria-labelledby="gainsTitle">
    <h2 id="gainsTitle">Setelah menguasai topik ini</h2>
    <ul>${T.gains.map(g => `<li><i class="ph ph-${g.icon}" aria-hidden="true"></i><div><strong>${esc(g.title)}</strong><p>${esc(g.text)}</p></div></li>`).join('')}</ul>
  </section>` : ''}

  <div class="section-head"><h2>Yang harus kamu kuasai</h2></div>
  ${skimBlock()}

  <div class="section-head"><h2>Mindmap topik</h2></div>
  ${topicMindmap()}

  <div class="section-head"><h2>Daftar modul</h2></div>
  ${chapterLists()}

  <div class="section-head"><h2>Latihan</h2></div>
  ${practiceBlock()}`);
}
// Ringkasan latihan: kuis tiap modul dengan statusnya.
function practiceBlock() {
  return `<div class="practice-grid">${C.modules.map((_, i) => {
    const m = mod(i), p = progress(i);
    return `<a class="practice-mod ${p.done ? 'done' : ''}" href="#/modul/${m.num}/cek-soal"><span class="n">${pad(m.num)}</span><span><strong>${esc(m.title)}</strong><small>${p.answered ? `Kuis ${p.correct}/${p.total} benar` : 'Kuis belum dikerjakan'}</small></span>${p.done ? '<i class="ph ph-check-circle" aria-hidden="true"></i>' : ''}</a>`;
  }).join('')}</div>`;
}

function latihan() {
  frame('/latihan', [[T.short, '/'], ['Latihan']]);
  show(`<div class="page-head"><h1>Latihan</h1><p>Kuis tiap modul. Modul selesai setelah kuis lulus dan penjelasan dengan bahasamu ditulis. Untuk latihan bersyarat waktu, buka <a href="#/ujian">Mode Ujian</a>.</p></div><div style="height:28px"></div>${practiceBlock()}<div class="section-head"><h2>Lencana</h2></div>${badgeList()}`);
}

// ---------- halaman modul ----------
function diagramBlock(j) {
  const d = P.diagrams[j], name = d.image;
  return `<figure class="figure" id="diagram-${j}">
    <header><h3>${esc(d.title)}</h3><small>${esc(d.ref || '')}</small></header>
    <div class="img-wrap">${img(name, `Diagram ${d.title}`, 'loading="lazy"')}</div>
    <div class="read">
      <p class="why">${esc(d.why)}</p>
      <ol class="read-steps">${d.steps.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol>
      <details class="reveal"><summary><i class="ph ph-caret-right" aria-hidden="true"></i>Pertanyaan analisis</summary><div class="inner"><p>${esc(d.question)}</p><p><strong>Jawaban yang baik:</strong></p><ul>${d.criteria.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div></details>
    </div>
  </figure>`;
}
// ---------- konten pola mikro ----------
const boldTerms = t => [...String(t || '').matchAll(/\*\*(.+?)\*\*/g)].map(m => m[1]);
const plain = t => String(t || '').replace(/\*\*/g, '');
const rich = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
// Istilah tebal yang punya definisi menjadi tombol yang membuka kamus.
const richTerms = t => esc(t).replace(/\*\*(.+?)\*\*/g, (_, x) => { const k = termKey(x); return k ? `<button type="button" class="term-inline" data-term="${esc(k)}" data-label="${esc(x)}">${x}</button>` : `<strong>${x}</strong>`; });
const unitText = u => [u.question, u.example, ...(u.steps || []), u.define, u.contrast, u.lecturer, u.check.q, u.check.a].filter(Boolean).map(plain).join(' ');
// Satu langkah cerita. Awalan pendek sebelum titik dua (misalnya "Sebelum:") ditebalkan sebagai penanda waktu.
function stepItem(x) {
  const m = x.match(/^([^:]{2,28}):\s(.+)$/);
  return `<li>${m ? `<b>${esc(m[1])}</b> ${rich(m[2])}` : rich(x)}</li>`;
}
// Slide infografis per sub-modul: gambar dari /claude-imagegen (source-art/slide-briefs/).
// Nama berkas mengikuti pola slide-m<modul>-<urutan>. Unit tanpa gambar tampil tanpa slide.
const slideName = (i, k) => `slide-m${pad(i + 1)}-${pad(k + 1)}`;
const hasSlide = (i, k) => !!P.imageSizes[slideName(i, k)];
// Teks alternatif diambil dari poin slide di lessons.js, supaya isinya tetap terbaca oleh pembaca layar.
function slideAlt(u) {
  const sl = u.slide || {};
  const parts = sl.grid ? sl.grid.map(g => g[1]) : (sl.points || []).map(p => plain(p[1]));
  return `Slide infografis ${u.title}: ${parts.join('; ')}. ${plain(sl.takeaway || '')}`;
}
let slideCtx = null;
// Mode layar penuh hanya melewati unit yang sudah punya gambar slide.
function slideList(i) { return REF[i].sections.map((u, k) => k).filter(k => hasSlide(i, k)); }
function renderSlide() {
  const { i, k } = slideCtx, list = slideList(i), pos = list.indexOf(k);
  $('#slideStage').innerHTML = img(slideName(i, k), slideAlt(REF[i].sections[k]));
  $('#slideCount').textContent = `${pos + 1} / ${list.length}`;
  $('#slidePrev').disabled = pos <= 0;
  $('#slideNext').disabled = pos >= list.length - 1;
}
function openSlide(i, k) { slideCtx = { i, k }; renderSlide(); $('#slideDialog').showModal(); }
const stepSlide = d => { if (!slideCtx) return; const list = slideList(slideCtx.i), pos = list.indexOf(slideCtx.k) + d; if (pos >= 0 && pos < list.length) { slideCtx.k = list[pos]; renderSlide(); } };
$('#slidePrev').onclick = () => stepSlide(-1);
$('#slideNext').onclick = () => stepSlide(1);
$('#slideDialog').addEventListener('keydown', e => { if (e.key === 'ArrowRight') $('#slideNext').click(); if (e.key === 'ArrowLeft') $('#slidePrev').click(); });
function unitBlock(u, k, i) {
  u = vx(u);
  const label = (icon, text) => `<span class="unit-label"><i class="ph ph-${icon}" aria-hidden="true"></i>${text}</span>`;
  const tileData = Array.isArray(u.tiles) ? u.tiles : u.tiles ? P.conceptTiles[i] : null;
  const tiles = tileData ? `<div class="tiles">${tileData.map(([t, d]) => `<div class="tile"><strong>${esc(t)}</strong><p>${esc(d)}</p></div>`).join('')}</div>` : '';
  return `<section class="unit" id="p-${k}">
    <h3>${esc(u.title)}</h3>
    ${u.brief ? `<p class="unit-brief">${esc(u.brief)}</p>` : ''}
    ${hasSlide(i, k) ? `<figure class="unit-slide"><button type="button" class="slide-open" data-slide="${k}" aria-label="Buka slide ${esc(u.title)} layar penuh">${img(slideName(i, k), slideAlt(u), 'loading="lazy"')}<span><i class="ph ph-arrows-out-simple" aria-hidden="true"></i>Layar penuh</span></button></figure>` : ''}
    <p class="unit-q">${esc(u.question)}</p>
    <div class="unit-example">${label('lightbulb', 'Contoh')}<p>${rich(u.example)}</p>
      ${u.steps ? `<ol class="unit-steps">${u.steps.map(stepItem).join('')}</ol>` : ''}
      ${u.note ? `<p class="unit-note"><i class="ph ph-info" aria-hidden="true"></i><span>${esc(u.note)}</span></p>` : ''}
    </div>
    <div class="unit-define">${label('book-open', 'Definisi')}<p>${richTerms(u.define)}</p></div>
    ${u.symbols ? `<div class="unit-symbols">${label('function', 'Simbol dan cara bacanya')}<dl>${u.symbols.map(([a, b]) => `<div><dt>${rich(a)}</dt><dd>${rich(b)}</dd></div>`).join('')}</dl></div>` : ''}
    ${tiles}
    ${u.derive ? `<div class="unit-derive" data-derive="${i}-${k}"></div>` : ''}
    ${u.contrast ? `<div class="unit-contrast">${label('scales', 'Yang sering tertukar')}<p>${rich(u.contrast)}</p></div>` : ''}
    ${u.mistakes ? `<div class="unit-mistakes">${label('warning-circle', 'Sering salah')}<ul>${u.mistakes.map(x => `<li>${rich(x)}</li>`).join('')}</ul></div>` : ''}
    ${u.lecturer ? `<div class="unit-lecturer">${label('star', 'Poin penting')}<p>${rich(u.lecturer)}</p></div>` : ''}
    <details class="unit-check"><summary><i class="ph ph-question" aria-hidden="true"></i><span><b>Cek cepat.</b> ${esc(u.check.q)}</span></summary><p>${rich(u.check.a)}</p></details>
  </section>`;
}
function artBlock(a) {
  return `<figure class="art">${img(a.name, a.alt, 'loading="lazy"')}<figcaption>${esc(a.caption)}</figcaption></figure>`;
}
// Rubrik penilaian AI untuk "Penjelasan dengan bahasamu", sama untuk semua modul.
const GRADE_RUBRIC = C.gradeRubric || [
  ['Konsep inti tepat', 'Gagasan utamanya sesuai dengan contoh penjelasan, meski kata-katanya berbeda.'],
  ['Sebab dan akibat runtut', 'Urutan kejadiannya jelas: apa yang terjadi, lalu mengapa hasilnya begitu.'],
  ['Istilah dipakai dengan benar', 'Istilah teknis di modul ini dipakai sesuai artinya.'],
];
function completionPanel(i) {
  const p = progress(i);
  const row = (ok, text, sub) => `<li class="${ok ? 'ok' : ''}"><i class="ph ${ok ? 'ph-check-circle' : 'ph-circle'}" aria-hidden="true"></i><span><strong>${text}</strong><small>${sub}</small></span></li>`;
  return `<div class="complete ${p.done ? 'is-done' : ''}" id="completePanel">
    <div class="complete-head"><strong>${p.done ? 'Modul ini selesai' : 'Syarat modul selesai'}</strong><span>${p.done ? 'Tanda centang muncul di sidebar dan daftar modul.' : 'Dua syarat di bawah menentukan status selesai. Status tersimpan di browser ini.'}</span></div>
    <ul>
      ${row(p.recall, 'Penjelasan dengan bahasamu', p.recall ? 'Sudah ditulis.' : `Tulis minimal ${RECALL_MIN} karakter di kotak di bawah.`)}
      ${row(p.quizOk, `Kuis: minimal ${PASS} dari ${p.total} benar`, `Sekarang ${p.answered}/${p.total} dijawab, ${p.correct} benar.`)}
    </ul>
  </div>`;
}
// Kuis satu soal per layar. Nomor soal di atas bisa diklik, ada tombol Sebelumnya dan Berikutnya,
// dan layar Hasil terbuka setelah semua soal dijawab.
const quizPos = {};
function quizView(i) {
  const qs = QS[i], n = qs.length, ans = state.quiz[i] || {};
  const allDone = Object.keys(ans).length === n;
  if (quizPos[i] == null) { const first = qs.findIndex((_, j) => ans[j] == null); quizPos[i] = first < 0 ? 'hasil' : first; }
  const k = quizPos[i];
  const dots = qs.map((q, j) => {
    const d = ans[j] != null, cls = d ? (ans[j] === q.key ? 'right' : 'wrong') : '';
    return `<button type="button" class="qdot ${cls}" data-go="${j}" ${k === j ? 'aria-current="step"' : ''} aria-label="Soal ${j + 1}${d ? (cls === 'right' ? ', benar' : ', salah') : ', belum dijawab'}">${j + 1}</button>`;
  }).join('') + `<button type="button" class="qdot qsum" data-go="hasil" ${allDone ? '' : 'disabled'} ${k === 'hasil' ? 'aria-current="step"' : ''}>Hasil</button>`;
  let body;
  if (k === 'hasil') {
    const p = progress(i);
    body = `<div class="qresult"><strong class="qscore">${p.correct}<small> / ${n}</small></strong>
      <p>${p.quizOk ? 'Kuis lulus. Syarat kuis untuk menyelesaikan modul sudah terpenuhi.' : `Butuh minimal ${PASS} jawaban benar. Buka lagi soal yang salah lewat nomornya di atas, lalu ulangi kuis.`}</p>
      <button class="btn ghost small" type="button" id="quizReset">Ulangi kuis</button></div>`;
  } else {
    const q = qs[k], done = ans[k] != null, ok = done && ans[k] === q.key;
    body = `<p class="qcount">Soal ${k + 1} dari ${n}</p><p class="q">${esc(q.text)}</p>
      <div class="options" role="group" aria-label="Pilihan jawaban soal ${k + 1}">${optionOrder(i, k, q.options.length).map((j, pos) => {
        const cls = done ? (j === q.key ? 'right' : j === ans[k] ? 'wrong' : '') : '';
        return `<button class="option ${cls}" type="button" data-k="${j}" ${done ? 'disabled' : ''} aria-pressed="${done && j === ans[k]}"><span class="k">${'ABCDE'[pos]}</span>${esc(q.options[j])}</button>`;
      }).join('')}</div>
      ${done ? `<div class="feedback"><strong class="${ok ? 'ok' : 'no'}">${ok ? 'Tepat.' : 'Belum tepat.'}</strong><p>${esc(q.why)}</p></div>` : ''}`;
  }
  const prev = k === 'hasil' ? n - 1 : k - 1;
  const next = k === 'hasil' ? null : k < n - 1 ? k + 1 : allDone ? 'hasil' : null;
  const foot = k === 'hasil' ? '' : `<div class="qfoot">
    <button class="btn ghost small" type="button" data-go="${prev}" ${prev < 0 ? 'disabled' : ''}><i class="ph ph-arrow-left" aria-hidden="true"></i>Sebelumnya</button>
    <button class="btn small" type="button" data-go="${next}" ${next == null ? 'disabled' : ''}>${k === n - 1 ? 'Lihat hasil' : 'Berikutnya'}<i class="ph ph-arrow-right" aria-hidden="true"></i></button></div>`;
  return `<div class="qnav" role="navigation" aria-label="Nomor soal">${dots}</div><div class="qbody" aria-live="polite">${body}</div>${foot}`;
}

function modulePage(num, anchor) {
  const i = num - 1;
  if (!P.modules[i]) { location.hash = '#/'; return; }
  const m = mod(i), b = m.bab;
  state.visited[i] = true; state.last = i; save();
  const crumbs = [[T.short, '/'], [b.label, '/'], [`${pad(m.num)} ${m.title}`]];
  frame('', crumbs, i);

  const R = REF[i], informal = voice() === 'santai' && C.modules[i].informal && C.modules[i].informal.inti;
  const I = informal ? { ...R.inti, ...informal } : R.inti;
  const sections = R.sections.map(u => [u.title, unitText(u)]);
  const after = {};
  const put = (k, html) => { (after[k] = after[k] || []).push(html); };
  // Setiap unit menentukan letak diagram, ilustrasi, dan simulasinya sendiri.
  R.sections.forEach((u, k) => {
    (u.diagrams || []).forEach(j => put(k, diagramBlock(j)));
    if (u.art) put(k, artBlock(u.art));
    if (u.sim && SIMS[u.sim]) put(k, `<div class="sim-mount" data-sim="${u.sim}"></div>`);
  });
  const terms = P.canonicalTopics[i].map(t => [t, termKey(t)]).filter(([, k]) => k);
  const tiles = null; // kartu daftar tinggal di dalam unitnya

  const toc = [
    ['inti', 'Inti', 1], ['inti-cerita', 'Cerita'], ['inti-konsep', 'Konsep'],
    ['pendalaman', 'Pendalaman', 1], ['p-peta', 'Mindmap modul'], ...sections.map((s, k) => [`p-${k}`, s[0]]), 
    ['cek', 'Cek pemahaman', 1], ['cek-ingat', 'Penjelasan ulang'], ['cek-soal', 'Kuis'],
  ];

  show(`<div class="mod-page">
  <article>
    <header class="mod-head">
      <div class="mod-kicker">${esc(b.label)} · Modul ${pad(m.num)}</div>
      <h1>${esc(m.title)}</h1>
      <p class="hook">${esc(m.hook)}</p>
      <div class="mod-meta"><span><i class="ph ph-target" aria-hidden="true"></i>${esc(m.goal)}</span><span id="modStatus"></span></div>
    </header>

    <section class="part" id="inti">
      <div class="part-label"><span class="part-icon"><i class="ph ph-lightbulb" aria-hidden="true"></i></span><div><small>Bagian 1 dari 3</small><h2>Inti</h2></div></div>
      <div class="story" id="inti-cerita">
        ${I.art ? img(I.art, `Ilustrasi cerita ${m.title}`, 'loading="lazy"') : ''}
        <div class="story-text">
          ${I.beats.map(([l, t]) => `<div class="beat"><small>${esc(l)}</small><p>${esc(t)}</p></div>`).join('')}
        </div>
      </div>
      <div class="define" id="inti-konsep"><small>Konsep</small><p>${richTerms(I.concept)}</p></div>
      ${I.mapping ? `<div class="mapping-table"><strong>Dari cerita ke istilah</strong><ul>${I.mapping.map(([a, b]) => `<li><span>${esc(a)}</span><i class="ph ph-arrow-right" aria-hidden="true"></i><b>${esc(b)}</b></li>`).join('')}</ul></div>`
        : `<div class="mapping"><i class="ph ph-arrows-left-right" aria-hidden="true"></i><strong>Dari cerita ke istilah</strong><p>${esc(m.mapping)}</p></div>`}
      ${terms.length ? `<div class="chips"><span>Istilah di modul ini</span>${terms.map(([t, k]) => `<button class="chip" type="button" data-term="${esc(k)}" data-label="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
    </section>

    <section class="part" id="pendalaman">
      <div class="part-label"><span class="part-icon"><i class="ph ph-stack" aria-hidden="true"></i></span><div><small>Bagian 2 dari 3</small><h2>Pendalaman</h2></div></div>
      <p class="skip-link"><a href="#/modul/${num}/cek-soal" data-goto="cek-soal"><i class="ph ph-arrow-down" aria-hidden="true"></i>Sudah paham? Langsung ke kuis</a></p>
      <div class="sub" id="p-peta"><h3>Mindmap modul</h3></div>
      ${moduleMindmap(i)}
      ${tiles ? `<div class="tiles">${tiles.map(([t, d]) => `<div class="tile"><strong>${esc(t)}</strong><p>${esc(d)}</p></div>`).join('')}</div>` : ''}
      ${sections.map((s, k) => `${unitBlock(R.sections[k], k, i)}${(after[k] || []).join('')}`).join('')}
      <div class="note warn"><strong>Batas yang perlu diingat</strong><p>${esc(m.trap)}</p></div>
    </section>

    <section class="part" id="cek">
      <div class="part-label"><span class="part-icon"><i class="ph ph-check-square" aria-hidden="true"></i></span><div><small>Bagian 3 dari 3</small><h2>Cek pemahaman</h2></div></div>
      <div class="check">
        <div id="completeMount"></div>
        <div class="card" id="cek-ingat">
          <h3>Penjelasan dengan bahasamu</h3>
          <p class="q">${esc(I.recall)}</p>
          <label class="sr" for="recall">Jawabanmu</label>
          <textarea id="recall" placeholder="Tulis sebab, akibat, dan istilah yang terkait">${esc(state.notes[i] || '')}</textarea>
          <span class="saved" id="recallCount"></span>
          <div class="ai-grade">
            <button class="btn ghost small" type="button" id="gradeBtn"><i class="ph ph-sparkle" aria-hidden="true"></i>Minta penilaian AI</button>
            <div id="gradeOut" aria-live="polite"></div>
          </div>
          <details class="reveal"><summary><i class="ph ph-caret-right" aria-hidden="true"></i>Lihat contoh penjelasan</summary><div class="inner"><p>${esc(I.answer)}</p><p class="muted">Periksa alasanmu, bukan kemiripan kata.</p></div></details>
        </div>
        <div class="card" id="cek-soal">
          <div class="quiz-head"><h3>Kuis</h3></div>
          <p class="muted">${QS[i].length} soal pilihan ganda. Jawaban langsung diperiksa beserta alasannya.</p>
          <div class="quiz" id="quiz"></div>
        </div>
      </div>
    </section>

    <nav class="pager" aria-label="Modul sebelum dan sesudah">
      ${i > 0 ? `<a href="#/modul/${num - 1}"><small>Sebelumnya</small><strong>${pad(num - 1)} ${esc(mod(i - 1).title)}</strong></a>` : ''}
      ${i < NMOD - 1 ? `<a class="next" href="#/modul/${num + 1}"><small>Berikutnya</small><strong>${pad(num + 1)} ${esc(mod(i + 1).title)}</strong></a>` : `<a class="next" href="#/latihan"><small>Berikutnya</small><strong>Latihan lintas modul</strong></a>`}
    </nav>
  </article>
  <aside class="toc" aria-label="Di halaman ini"><strong>Di halaman ini</strong><ol>${toc.map(([id, label, top]) => `<li class="${top ? 'lvl1' : ''}"><a href="#/modul/${num}/${id}" data-target="${id}">${esc(label)}</a></li>`).join('')}</ol></aside>
  </div>`);

  // status selesai diperbarui setiap ada jawaban atau catatan
  const refresh = () => {
    $('#completeMount').innerHTML = completionPanel(i);
    const st = statusOf(i);
    $('#modStatus').innerHTML = st.label ? `<i class="ph ph-${st.icon}" aria-hidden="true"></i>${st.label}` : '';
    $('#modStatus').className = `mod-status ${st.cls}`;
    const n = (state.notes[i] || '').trim().length;
    if (progress(i).recall) award(`recall-${i}`, 10, 'Penjelasan ditulis');
    if (progress(i).done) award(`done-${i}`, 50, `Modul ${pad(num)} selesai`);
    $('#recallCount').textContent = n >= RECALL_MIN ? 'Tersimpan otomatis di browser ini.' : `${n}/${RECALL_MIN} karakter minimal. Tersimpan otomatis.`;
    frame('', crumbs, i);
  };
  const renderQuiz = () => {
    $('#quiz').innerHTML = quizView(i);
    $$('#quiz .option').forEach(el => el.onclick = () => {
      const k = quizPos[i];
      state.quiz[i] = state.quiz[i] || {};
      if (state.quiz[i][k] != null) return;
      state.quiz[i][k] = +el.dataset.k;
      if (state.quiz[i][k] === QS[i][k].key) award(`q-${i}-${k}`, 10, 'Jawaban kuis benar');
      save(); renderQuiz(); refresh();
    });
    $$('#quiz [data-go]').forEach(el => el.onclick = () => {
      const g = el.dataset.go;
      quizPos[i] = g === 'hasil' ? 'hasil' : +g;
      renderQuiz();
    });
    const reset = $('#quizReset');
    if (reset) reset.onclick = () => { delete state.quiz[i]; quizPos[i] = 0; save(); renderQuiz(); refresh(); };
  };
  renderQuiz();
  $('#recall').oninput = e => { state.notes[i] = e.target.value; save(); refresh(); };
  // Penilaian AI atas penjelasan bebas. Mockup: rubrik dan data yang akan dikirim sudah ditampilkan, backend menyusul.
  $('#gradeBtn').onclick = () => {
    const n = (state.notes[i] || '').trim().length;
    if (n < RECALL_MIN) { $('#gradeOut').innerHTML = `<p class="grade-note">Tulis minimal ${RECALL_MIN} karakter dulu, supaya ada yang bisa dinilai.</p>`; return; }
    $('#gradeOut').innerHTML = `<div class="grade-card">
      <strong>AI akan menilai dengan tiga kriteria</strong>
      <ol>${GRADE_RUBRIC.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ol>
      <p class="grade-scale">Setiap kriteria diberi nilai Belum, Cukup, atau Kuat, lalu satu saran perbaikan yang paling berdampak.</p>
      <p class="grade-note"><i class="ph ph-info" aria-hidden="true"></i>Mockup: penilaian belum tersambung. Setelah migrasi, pertanyaan, jawabanmu, dan contoh penjelasan dikirim ke server portal untuk dinilai. Penilaian AI membantu belajar dan tidak mengubah status selesai modul.</p>
    </div>`;
  };
  refresh();

  bindPageActions();
  $$('[data-slide]').forEach(btn => btn.onclick = () => openSlide(i, +btn.dataset.slide));
  // daftar isi: gulir tanpa mengganti rute, lalu sorot bagian yang sedang dibaca
  $$('.toc a[data-target]').forEach(a => a.onclick = e => { e.preventDefault(); scrollToId(a.dataset.target); });
  const links = new Map($$('.toc a[data-target]').map(a => [a.dataset.target, a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { links.forEach(a => a.classList.remove('active')); links.get(en.target.id)?.classList.add('active'); } });
  }, { rootMargin: '-80px 0px -70% 0px' });
  links.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });

  $$('.sim-mount').forEach(el => SIMS[el.dataset.sim].mount(el, simKit(el.dataset.sim)));
  $$('[data-derive]').forEach(el => { const [a, b] = el.dataset.derive.split('-').map(Number); mountDerive(el, C.modules[a].sections[b].derive, el.dataset.derive); });
  if (anchor) requestAnimationFrame(() => scrollToId(anchor));
  else window.scrollTo(0, 0);
}
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}
// Tombol istilah dan tombol lompat dipakai di chip, mindmap, dan umpan balik.
function bindPageActions() {
  $$('#main [data-term]').forEach(el => el.onclick = () => openTerm(el.dataset.label, P.termDefinitions[el.dataset.term]));
  $$('#main [data-goto]').forEach(el => el.onclick = e => { e.preventDefault(); scrollToId(el.dataset.goto); });
}

// ---------- simulasi ----------
// Simulasi interaktif bersifat khusus topik, jadi kodenya tinggal di sims.js (window.PORTAL_SIMS).
// Unit dengan sim: 'nama' mendapat wadah; fungsi mount(wadah, kit) dari sims.js mengisinya.
const SIMS = window.PORTAL_SIMS || {};
// kit.award dan kit.badge membuat simulasi bisa memberi XP dan lencana khusus topik (C.game.badges).
const simKit = name => ({ $, $$, esc, text: (C.simulations && C.simulations[name]) || {}, award: (id, xp, label) => award(`sim-${name}-${id}`, xp, label), badge });

// ---------- peta pokok bahasan ----------
// Satu baris per modul: judul pendek, tujuan, dan istilah yang wajib dikuasai. Untuk memindai cepat.
function skimBlock() {
  return `<ol class="skim">${C.modules.map((_, i) => {
    const m = mod(i), st = statusOf(i);
    const terms = P.canonicalTopics[i].map(t => [t, termKey(t)]).filter(([, k]) => k);
    return `<li class="${m.bab.cls}"><a class="skim-n" href="#/modul/${m.num}">${pad(m.num)}</a><div>
      <a class="skim-t" href="#/modul/${m.num}"><strong>${esc(shortOf(m))}</strong>${st.icon ? `<i class="ph ph-${st.icon} ${st.cls}" aria-label="${st.label}"></i>` : ''}</a>
      <p>${esc(m.goal)}</p>
      ${terms.length ? `<div class="chips">${terms.map(([t, k]) => `<button class="chip" type="button" data-term="${esc(k)}" data-label="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
    </div></li>`;
  }).join('')}</ol>`;
}

// ---------- Persiapan ----------
function persiapan() {
  const Q = vx(C.prep || {});
  frame('/persiapan', [[T.short, '/'], ['Persiapan']]);
  show(`<div class="page-head"><h1>${esc(Q.title || 'Persiapan')}</h1><p>${rich(Q.intro || '')}</p></div>
  ${Q.usage ? `<section class="gains"><h2>Cara memakai portal ini</h2><ul>${Q.usage.map(g => `<li><i class="ph ph-${g.icon}" aria-hidden="true"></i><div><strong>${esc(g.title)}</strong><p>${rich(g.text)}</p></div></li>`).join('')}</ul></section>` : ''}
  <div class="section-head"><h2>Yang harus kamu kuasai</h2></div>${skimBlock()}
  ${Q.story ? `<div class="section-head"><h2>Alur ceritanya</h2></div><ol class="story-map">${Q.story.map((x, j) => `<li><span class="n">${j + 1}</span><div><strong>${rich(x.q)}</strong><p>${richTerms(x.a)}</p>${x.module ? `<a href="#/modul/${x.module}">Modul ${pad(x.module)} · ${esc(shortOf(mod(x.module - 1)))}</a>` : ''}</div></li>`).join('')}</ol>` : ''}
  ${Q.oneLine ? `<div class="one-line"><small>Seluruh materi dalam satu kalimat</small><p>${richTerms(Q.oneLine)}</p></div>` : ''}
  ${Q.mini ? `<div class="section-head"><h2>${esc(Q.mini.title || 'Data mini')}</h2></div><p>${rich(Q.mini.intro || '')}</p>
    <div class="table-wrap"><table class="mini-table"><thead><tr>${Q.mini.headers.map(h => `<th>${rich(h)}</th>`).join('')}</tr></thead><tbody>${Q.mini.rows.map(r => `<tr>${r.map(c => `<td>${rich(String(c))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    ${Q.mini.note ? `<p class="muted">${rich(Q.mini.note)}</p>` : ''}` : ''}
  ${Q.kit ? `<div class="section-head"><h2>Bekal pengetahuan</h2></div>${Q.kitIntro ? `<p>${rich(Q.kitIntro)}</p>` : ''}<div class="kit">${Q.kit.map(k => `<div class="kit-card"><strong>${rich(k.title)}</strong><p>${rich(k.body)}</p></div>`).join('')}</div>` : ''}
  ${Q.checks ? `<div class="section-head"><h2>Cek bekal</h2></div><div id="prepChecks"></div>` : ''}
  ${C.traps ? `<div class="section-head"><h2>Jebakan di bahan sumber</h2></div>${C.trapsIntro ? `<p>${rich(C.trapsIntro)}</p>` : ''}
    <div class="table-wrap"><table class="trap-table"><thead><tr><th>Bagian</th><th>Tertulis</th><th>Yang benar</th><th>Keyakinan</th></tr></thead><tbody>${C.traps.map(t => `<tr><td>${esc(t.where)}</td><td>${rich(t.written)}</td><td>${rich(t.correct)}</td><td><span class="conf ${t.confidence === 'Tinggi' ? 'hi' : 'mid'}">${esc(t.confidence)}</span></td></tr>`).join('')}</tbody></table></div>` : ''}
  <div class="actions prep-go"><a class="btn" href="#/modul/1">Mulai Modul 01<i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>`);
  if (Q.checks) mountPrepChecks(Q.checks);
}
function mountPrepChecks(list) {
  const el = $('#prepChecks');
  const draw = () => {
    el.innerHTML = list.map((q, j) => {
      const a = state.prep[j], done = a != null;
      return `<div class="card prep-q" data-j="${j}"><p class="q">${rich(q.text)}</p><div class="options">${optionOrder(800, j, q.options.length).map((o, pos) => {
        const cls = done ? (o === q.key ? 'right' : o === a ? 'wrong' : '') : '';
        return `<button class="option ${cls}" type="button" data-k="${o}" ${done ? 'disabled' : ''}><span class="k">${'ABCDE'[pos]}</span>${rich(q.options[o])}</button>`;
      }).join('')}</div>${done ? `<div class="feedback"><strong class="${a === q.key ? 'ok' : 'no'}">${a === q.key ? 'Tepat.' : 'Belum tepat.'}</strong><p>${rich(q.why)}</p></div>` : ''}</div>`;
    }).join('') + `<button class="btn ghost small" type="button" id="prepReset">Ulangi cek bekal</button>`;
    el.querySelectorAll('.option').forEach(b => b.onclick = () => {
      const j = +b.closest('.prep-q').dataset.j;
      state.prep[j] = +b.dataset.k; save();
      if (state.prep[j] === list[j].key) award(`prep-${j}`, 5, 'Cek bekal benar');
      if (list.every((q, x) => state.prep[x] === q.key)) badge('siap');
      draw();
    });
    $('#prepReset').onclick = () => { state.prep = {}; save(); draw(); };
  };
  draw();
}

// ---------- penurunan interaktif ----------
// unit.derive = { intro, steps: [{ prompt, options, key, show, why, hint }] }.
// Langkah berikutnya baru terbuka setelah pilihan yang benar dipilih. "Buka langkah" boleh, tetapi tanpa XP.
function mountDerive(el, d, id) {
  let s = 0, helped = false;
  const finish = () => {
    if (s < d.steps.length) return;
    if (!helped) { state.derive[id] = 'clean'; award(`dd-${id}`, 20, 'Penurunan tuntas tanpa bantuan'); }
    else if (state.derive[id] !== 'clean') state.derive[id] = 'helped';
    save(); checkBadges();
  };
  const draw = () => {
    const cur = d.steps[s];
    el.innerHTML = `<span class="unit-label"><i class="ph ph-stairs" aria-hidden="true"></i>Turunkan sendiri</span>
      ${d.intro ? `<p>${rich(d.intro)}</p>` : ''}
      ${s ? `<ol class="derive-done">${d.steps.slice(0, s).map(st => `<li><div>${rich(st.show)}</div>${st.why ? `<small>${rich(st.why)}</small>` : ''}</li>`).join('')}</ol>` : ''}
      ${cur ? `<div class="derive-ask"><p><b>Langkah ${s + 1} dari ${d.steps.length}.</b> ${rich(cur.prompt || 'Pilih langkah berikutnya.')}</p>
        <div class="options">${optionOrder(900 + id.length, s, cur.options.length).map((j, pos) => `<button class="option" type="button" data-k="${j}"><span class="k">${'ABCDE'[pos]}</span><span>${rich(cur.options[j])}</span></button>`).join('')}</div>
        <p class="derive-fb" aria-live="polite"></p>
        <button class="btn ghost small" type="button" data-reveal>Buka langkah ini</button></div>`
      : `<p class="derive-end"><i class="ph ph-check-circle" aria-hidden="true"></i>${helped ? 'Penurunan lengkap dengan bantuan. Ulangi tanpa membuka langkah untuk mendapat lencana.' : 'Penurunan lengkap tanpa membuka langkah.'} <button class="btn ghost small" type="button" data-restart>Ulangi</button></p>`}`;
    el.querySelectorAll('.option').forEach(b => b.onclick = () => {
      if (+b.dataset.k === cur.key) { if (!helped) award(`d-${id}-${s}`, 5, 'Langkah penurunan benar'); s++; finish(); draw(); }
      else { b.classList.add('wrong'); b.disabled = true; el.querySelector('.derive-fb').innerHTML = rich(cur.hint || 'Belum tepat. Periksa ukuran matriks atau tanda, lalu coba lagi.'); }
    });
    const rv = el.querySelector('[data-reveal]'); if (rv) rv.onclick = () => { helped = true; s++; finish(); draw(); };
    const rs = el.querySelector('[data-restart]'); if (rs) rs.onclick = () => { s = 0; helped = false; draw(); };
  };
  draw();
}

// ---------- Mode Ujian ----------
// Soal pilihan ganda diambil dari kuis semua modul. Soal isian dibuat generator di sims.js (window.PORTAL_EXAM),
// satu soal bisa berisi beberapa kolom angka. Soal esai dari content.js essays, dinilai sendiri dengan rubrik.
const GENS = (window.PORTAL_EXAM && window.PORTAL_EXAM.generators) || [];
const ESSAYS = C.essays || [];
const FORMAT = { pg: 15, isian: 10, essay: 5, minutes: 150, ...(C.examFormat || {}) };
const POOL = QS.flatMap((qs, i) => qs.map((q, k) => ({ type: 'pg', i, k, q })));
const shuffle = a => { a = a.slice(); for (let j = a.length - 1; j > 0; j--) { const r = Math.floor(Math.random() * (j + 1)); [a[j], a[r]] = [a[r], a[j]]; } return a; };
const readNum = v => { const x = parseFloat(String(v ?? '').trim().replace(/\s/g, '').replace(',', '.')); return Number.isFinite(x) ? x : null; };
const fmtNum = x => (Math.round(x * 10000) / 10000).toLocaleString('id-ID', { maximumFractionDigits: 4 });
const tolOf = f => (f.tol != null ? f.tol : Math.max(0.01, Math.abs(f.answer) * 0.005));
const makeCalc = g => ({ type: 'isian', module: g.module, title: g.title, ...g.make(Math.random) });
const fullCount = () => Math.min(FORMAT.pg, POOL.length) + (GENS.length ? FORMAT.isian : 0) + Math.min(FORMAT.essay, ESSAYS.length);
const PACKS = [
  { id: 'cepat', title: 'Paket cepat', desc: '12 soal pilihan ganda', build: () => shuffle(POOL).slice(0, 12) },
  { id: 'menengah', title: 'Paket menengah', desc: '24 soal pilihan ganda', build: () => shuffle(POOL).slice(0, 24) },
  { id: 'semua', title: 'Semua soal', desc: `${POOL.length} soal pilihan ganda`, build: () => shuffle(POOL) },
  ...((GENS.length || ESSAYS.length) ? [{
    id: 'penuh', title: 'Simulasi ujian penuh',
    desc: `${Math.min(FORMAT.pg, POOL.length)} pilihan ganda, ${GENS.length ? FORMAT.isian : 0} isian, ${Math.min(FORMAT.essay, ESSAYS.length)} esai`,
    build: () => [...shuffle(POOL).slice(0, FORMAT.pg), ...(GENS.length ? Array.from({ length: FORMAT.isian }, (_, j) => makeCalc(GENS[j % GENS.length])) : []), ...shuffle(ESSAYS).slice(0, FORMAT.essay).map(e => ({ type: 'essay', ...e }))],
  }] : []),
];
const TIMES = [['none', 'Tanpa batas waktu'], ['q1', '1 menit per soal'], ['q2', '2 menit per soal'], ['q3', '3 menit per soal'], ['m15', '15 menit'], ['m30', '30 menit'], ['format', `Format ujian, ${FORMAT.minutes} menit`]];
const timeMinutes = (t, n) => ({ none: 0, q1: n, q2: n * 2, q3: n * 3, m15: 15, m30: 30, format: FORMAT.minutes }[t] || 0);
let EXAM = null;
function ujian() {
  frame('/ujian', [[T.short, '/'], ['Mode Ujian']]);
  if (EXAM && !EXAM.result) examRun(); else if (EXAM && EXAM.result) examResult(); else examSetup();
}
function examSetup() {
  const best = id => (state.exam[id] != null ? `Skor terbaik ${state.exam[id]}%` : 'Belum dicoba');
  show(`<div class="page-head"><h1>Mode Ujian</h1><p>Kerjakan dalam batas waktu tanpa membuka materi. Setelah dikumpulkan, hasil menandai modul yang perlu diulang.</p></div>
  <div class="card exam-setup">
    <fieldset><legend>Paket soal</legend><div class="pack-grid">${PACKS.map((p, j) => `<label class="pack"><input type="radio" name="pack" value="${p.id}" ${j === 0 ? 'checked' : ''}><span><strong>${esc(p.title)}</strong><small>${esc(p.desc)}</small><small class="muted">${best(p.id)}</small></span></label>`).join('')}</div></fieldset>
    <fieldset><legend>Waktu</legend><div class="time-grid">${TIMES.map(([v, l], j) => `<label class="pill"><input type="radio" name="time" value="${v}" ${j === 2 ? 'checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div>
      <p class="muted" id="timeNote"></p></fieldset>
    <button class="btn" id="examStart" type="button"><i class="ph ph-play" aria-hidden="true"></i>Mulai ujian</button>
  </div>
  ${GENS.length ? `<div class="section-head"><h2>Latihan hitung acak</h2></div><p class="muted">Setiap set berisi angka baru. Kerjakan di kertas, isi semua kolom, lalu periksa. Desimal boleh memakai koma atau titik.</p><div id="calcMount"></div>` : ''}
  <div class="section-head"><h2>Lencana</h2></div>${badgeList()}`);
  const note = () => {
    const p = PACKS.find(x => x.id === $('input[name=pack]:checked').value);
    const n = p.id === 'penuh' ? fullCount() : p.id === 'semua' ? POOL.length : p.id === 'menengah' ? Math.min(24, POOL.length) : Math.min(12, POOL.length);
    const m = timeMinutes($('input[name=time]:checked').value, n);
    $('#timeNote').textContent = m ? `${n} soal, waktu ${m} menit. Jawaban dikumpulkan otomatis saat waktu habis.` : `${n} soal tanpa batas waktu.`;
  };
  $$('input[name=pack], input[name=time]').forEach(r => r.onchange = note); note();
  $('#examStart').onclick = () => {
    const pack = PACKS.find(x => x.id === $('input[name=pack]:checked').value);
    const items = pack.build(), mins = timeMinutes($('input[name=time]:checked').value, items.length);
    EXAM = { pack, items, answers: {}, start: Date.now(), ends: mins ? Date.now() + mins * 60000 : null, result: null };
    examRun();
  };
  if (GENS.length) mountCalcPractice();
}
function examItemHtml(it, idx) {
  const a = EXAM.answers[idx];
  if (it.type === 'pg') return `<p class="q">${esc(it.q.text)}</p><div class="options">${optionOrder(it.i, it.k, it.q.options.length).map((j, pos) => `<button class="option ${a === j ? 'picked' : ''}" type="button" data-k="${j}" aria-pressed="${a === j}"><span class="k">${'ABCDE'[pos]}</span>${esc(it.q.options[j])}</button>`).join('')}</div>`;
  if (it.type === 'isian') return `<p class="q">${rich(it.text)}</p><div class="calc-fields">${it.fields.map((f, j) => `<label class="field"><span>${rich(f.label)}</span><input inputmode="decimal" autocomplete="off" data-f="${j}" value="${esc((a || [])[j] || '')}"></label>`).join('')}</div>`;
  return `<p class="q">${rich(it.prompt)}</p><textarea data-essay placeholder="Tulis jawabanmu. Untuk penurunan, tulis langkahnya satu per satu.">${esc(a || '')}</textarea>`;
}
let examTick = null;
function examRun() {
  const E = EXAM;
  show(`<div class="exam-bar"><strong>${esc(E.pack.title)}</strong><span class="clock" id="examClock"></span><span class="muted" id="examCount"></span><button class="btn small" type="button" data-submit>Kumpulkan</button></div>
  <ol class="exam-list">${E.items.map((it, idx) => `<li class="exam-item" data-idx="${idx}"><div class="ex-meta">Soal ${idx + 1} · ${it.type === 'pg' ? 'Pilihan ganda' : it.type === 'isian' ? 'Isian' : 'Esai'}</div>${examItemHtml(it, idx)}</li>`).join('')}</ol>
  <div class="exam-foot"><button class="btn" type="button" data-submit>Kumpulkan jawaban</button></div>`);
  const count = () => { const n = E.items.filter((it, idx) => { const a = E.answers[idx]; return it.type === 'isian' ? (a || []).some(v => v) : a != null && a !== ''; }).length; $('#examCount').textContent = `${n}/${E.items.length} dijawab`; };
  $$('.exam-item').forEach(li => {
    const idx = +li.dataset.idx;
    li.querySelectorAll('.option').forEach(b => b.onclick = () => { E.answers[idx] = +b.dataset.k; li.querySelectorAll('.option').forEach(o => { o.classList.toggle('picked', o === b); o.setAttribute('aria-pressed', String(o === b)); }); count(); });
    li.querySelectorAll('[data-f]').forEach(inp => inp.oninput = () => { E.answers[idx] = E.answers[idx] || []; E.answers[idx][+inp.dataset.f] = inp.value; count(); });
    const ta = li.querySelector('[data-essay]'); if (ta) ta.oninput = () => { E.answers[idx] = ta.value; count(); };
  });
  $$('[data-submit]').forEach(b => b.onclick = () => { if (confirm('Kumpulkan jawaban sekarang?')) examSubmit(); });
  count();
  clearInterval(examTick);
  const tick = () => {
    if (!EXAM || EXAM.result) { clearInterval(examTick); return; }
    if (!E.ends) { const el = $('#examClock'); if (el) el.textContent = 'Tanpa batas waktu'; return; }
    const left = Math.max(0, E.ends - Date.now());
    const el = $('#examClock');
    if (el) { const mm = Math.floor(left / 60000), ss = Math.floor(left / 1000) % 60; el.textContent = `Sisa ${mm}:${String(ss).padStart(2, '0')}`; el.classList.toggle('low', left < 5 * 60000); }
    if (left <= 0) { examSubmit(true); }
  };
  tick(); examTick = setInterval(tick, 1000);
}
function examSubmit(auto) {
  const E = EXAM; clearInterval(examTick);
  let got = 0, max = 0; const weak = new Set();
  E.items.forEach((it, idx) => {
    const a = E.answers[idx];
    if (it.type === 'pg') { max++; if (a === it.q.key) got++; else weak.add(it.i); }
    else if (it.type === 'isian') {
      max++;
      const ok = it.fields.map((f, j) => { const v = readNum((a || [])[j]); return v != null && Math.abs(v - f.answer) <= tolOf(f); });
      it.ok = ok; got += ok.filter(Boolean).length / ok.length;
      if (ok.some(x => !x) && it.module) weak.add(it.module - 1);
    }
  });
  const score = max ? Math.round(got / max * 100) : 0;
  E.result = { score, got, max, weak: [...weak].sort((x, y) => x - y), auto: !!auto, used: Math.round((Date.now() - E.start) / 60000) };
  state.exam[E.pack.id] = Math.max(state.exam[E.pack.id] || 0, score); save();
  if (score >= 80) { award(`exam-${E.pack.id}`, 50, `Lulus ${E.pack.title}`); badge('siap-ujian'); }
  if (score === 100 && max >= 12) badge('sempurna');
  examResult();
}
function examResult() {
  const E = EXAM, R = E.result;
  frame('/ujian', [[T.short, '/'], ['Mode Ujian'], ['Hasil']]);
  show(`<div class="page-head"><h1>Hasil ${esc(E.pack.title)}</h1><p>${R.auto ? 'Waktu habis, jawaban dikumpulkan otomatis. ' : ''}Waktu terpakai sekitar ${R.used} menit.</p></div>
  <div class="card exam-score"><strong class="qscore">${R.score}<small>%</small></strong><p>Pilihan ganda dan isian: ${fmtNum(R.got)} dari ${R.max} poin. ${E.items.some(it => it.type === 'essay') ? 'Esai dinilai sendiri dengan rubrik di bawah.' : ''}</p>
    ${R.weak.length ? `<p><strong>Modul yang perlu diulang:</strong></p><div class="chips">${R.weak.map(i => `<a class="chip" href="#/modul/${i + 1}">${pad(i + 1)} ${esc(shortOf(mod(i)))}</a>`).join('')}</div>` : '<p>Tidak ada modul yang lemah di paket ini.</p>'}
    <div class="actions"><button class="btn" type="button" id="examAgain">Ujian baru</button></div></div>
  <ol class="exam-list review">${E.items.map((it, idx) => {
    const a = E.answers[idx];
    if (it.type === 'pg') {
      const ok = a === it.q.key;
      return `<li class="exam-item ${ok ? 'is-right' : 'is-wrong'}"><div class="ex-meta">Soal ${idx + 1} · Pilihan ganda · <a href="#/modul/${it.i + 1}">Modul ${pad(it.i + 1)}</a></div><p class="q">${esc(it.q.text)}</p>
        <p><b>${ok ? 'Benar' : 'Salah'}.</b> Jawabanmu: ${a != null ? esc(it.q.options[a]) : '<i>kosong</i>'}. Kunci: ${esc(it.q.options[it.q.key])}.</p><p class="muted">${esc(it.q.why)}</p></li>`;
    }
    if (it.type === 'isian') return `<li class="exam-item ${it.ok && it.ok.every(Boolean) ? 'is-right' : 'is-wrong'}"><div class="ex-meta">Soal ${idx + 1} · Isian${it.module ? ` · <a href="#/modul/${it.module}">Modul ${pad(it.module)}</a>` : ''}</div><p class="q">${rich(it.text)}</p>
      <ul class="calc-review">${it.fields.map((f, j) => `<li class="${it.ok && it.ok[j] ? 'ok' : 'no'}">${rich(f.label)}: jawabanmu <b>${esc((a || [])[j] || 'kosong')}</b>, kunci <b>${fmtNum(f.answer)}</b></li>`).join('')}</ul>
      ${it.solution ? `<details class="reveal"><summary><i class="ph ph-caret-right" aria-hidden="true"></i>Pembahasan</summary><div class="inner"><p>${rich(it.solution)}</p></div></details>` : ''}</li>`;
    return `<li class="exam-item"><div class="ex-meta">Soal ${idx + 1} · Esai${it.module ? ` · <a href="#/modul/${it.module}">Modul ${pad(it.module)}</a>` : ''}</div><p class="q">${rich(it.prompt)}</p>
      <p class="muted">Jawabanmu:</p><p class="essay-mine">${esc(a || 'kosong')}</p>
      <div class="rubric"><strong>Rubrik penilaian sendiri</strong><ul>${(it.rubric || []).map(r => `<li><label><input type="checkbox"> ${rich(r)}</label></li>`).join('')}</ul></div>
      <details class="reveal"><summary><i class="ph ph-caret-right" aria-hidden="true"></i>Contoh jawaban</summary><div class="inner"><p>${rich(it.answer)}</p></div></details></li>`;
  }).join('')}</ol>`);
  $('#examAgain').onclick = () => { EXAM = null; ujian(); window.scrollTo(0, 0); };
}
// Latihan hitung acak: satu generator per tab, set baru setiap kali diminta.
function mountCalcPractice() {
  let g = 0, set = makeCalc(GENS[0]), checked = false;
  const el = $('#calcMount');
  const draw = () => {
    el.innerHTML = `<div class="calc-tabs" role="tablist">${GENS.map((x, j) => `<button type="button" role="tab" class="pill-btn ${j === g ? 'on' : ''}" aria-selected="${j === g}" data-g="${j}">${esc(x.title)}</button>`).join('')}</div>
    <div class="card calc-card"><p class="q">${rich(set.text)}</p><div class="calc-fields">${set.fields.map((f, j) => `<label class="field"><span>${rich(f.label)}</span><input inputmode="decimal" autocomplete="off" data-f="${j}"></label>`).join('')}</div>
      <div class="actions"><button class="btn small" type="button" id="calcCheck">Periksa</button><button class="btn ghost small" type="button" id="calcNew">Soal baru</button></div>
      <div id="calcOut" aria-live="polite"></div></div>`;
    el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { g = +b.dataset.g; set = makeCalc(GENS[g]); checked = false; draw(); });
    $('#calcNew').onclick = () => { set = makeCalc(GENS[g]); checked = false; draw(); };
    $('#calcCheck').onclick = () => {
      const ok = set.fields.map((f, j) => { const inp = el.querySelector(`[data-f="${j}"]`), v = readNum(inp.value), r = v != null && Math.abs(v - f.answer) <= tolOf(f); inp.classList.toggle('right', r); inp.classList.toggle('wrong', !r); return r; });
      const all = ok.every(Boolean);
      if (all && !checked) { checked = true; state.calc = (state.calc || 0) + 1; save(); award(`calc-${state.calc}`, 20, 'Set hitungan benar'); checkBadges(); }
      $('#calcOut').innerHTML = `<p><b>${all ? 'Semua benar.' : `${ok.filter(Boolean).length} dari ${ok.length} kolom benar.`}</b></p>${set.solution ? `<details class="reveal"><summary><i class="ph ph-caret-right" aria-hidden="true"></i>Pembahasan</summary><div class="inner"><p>${rich(set.solution)}</p></div></details>` : ''}`;
    };
  };
  draw();
}

// ---------- cari ----------
let INDEX = null;
function buildIndex() {
  INDEX = [];
  P.modules.forEach((_, i) => {
    const m = mod(i);
    INDEX.push({ i, id: 'inti', title: m.title, text: `${m.hook} ${plain(m.inti.concept)} ${m.inti.beats.map(b => b[1]).join(' ')}` });
    REF[i].sections.forEach((u, k) => INDEX.push({ i, id: `p-${k}`, title: u.title, text: unitText(u) }));
  });
  Object.entries(P.termDefinitions).forEach(([k, d]) => {
    const i = P.canonicalTopics.findIndex(list => list.some(t => termKey(t) === k));
    if (i >= 0) INDEX.push({ i, id: 'inti-konsep', title: k, text: d, term: true });
  });
}
function search(qs) {
  frame('', [[T.short, '/'], ['Cari']]);
  if (!INDEX) buildIndex();
  const q = qs.trim(), words = q.toLowerCase().split(/\s+/).filter(Boolean);
  $('#searchInput').value = q;
  const hits = words.length ? INDEX.filter(e => words.every(w => (e.title + ' ' + e.text).toLowerCase().includes(w))).slice(0, 30) : [];
  const re = words.length ? new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi') : null;
  const snip = t => {
    const pos = Math.max(0, t.toLowerCase().indexOf(words[0]) - 60);
    const s = (pos ? '…' : '') + t.slice(pos, pos + 220) + (t.length > pos + 220 ? '…' : '');
    return esc(s).replace(re, '<mark>$1</mark>');
  };
  show(`<div class="page-head"><h1>Hasil pencarian</h1><p>${words.length ? `${hits.length} bagian cocok dengan “${esc(q)}”.` : 'Ketik konsep atau istilah di kolom cari.'}</p></div>
    <div class="results">${hits.map(h => `<a class="result" href="#/modul/${h.i + 1}/${h.id}"><small>Modul ${pad(h.i + 1)} · ${esc(mod(h.i).title)}${h.term ? ' · istilah' : ''}</small><strong>${esc(h.title)}</strong><p>${snip(h.text)}</p></a>`).join('') || (words.length ? '<p class="empty">Belum ada yang cocok. Coba kata yang lebih pendek, atau istilah Inggrisnya.</p>' : '')}</div>`);
}
$('#searchForm').onsubmit = e => { e.preventDefault(); location.hash = '#/cari?q=' + encodeURIComponent($('#searchInput').value); };

// ---------- Tanya AI layar penuh ----------
// Mockup tampilan. Pada tahap migrasi, halaman ini dan panel kecil memakai backend yang sama (server.mjs) dan riwayat yang sama.
const aiLog = [];
function tanya(qs) {
  const mnum = +new URLSearchParams(qs || '').get('m') || 0;
  frame('/tanya', [[T.short, '/'], ['Tanya AI']]);
  document.body.classList.add('on-ai');
  closeAI();
  const sugg = mnum && REF[mnum - 1] ? REF[mnum - 1].sections.slice(0, 3).map(u => u.question)
    : (T.askSuggestions || []);
  show(`<div class="ai-page">
    <div class="ai-main">
      <div class="page-head"><h1>Tanya AI</h1><p>Tanya apa saja tentang materi ${esc(T.short)}. Jawaban disusun dari materi portal dan menyertakan rujukan ke bagian modulnya.</p></div>
      <div class="ai-thread" id="aiThread" aria-live="polite"></div>
      <div class="ai-suggest">${sugg.map(t => `<button type="button" class="chip" data-ask="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <form class="ai-compose" id="aiCompose"><label class="sr" for="aiInput">Pertanyaan</label><textarea id="aiInput" rows="2" placeholder="Ketik pertanyaan tentang materi"></textarea><button class="btn" type="submit"><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>Kirim</button></form>
      <p class="ai-status"><i class="ph ph-info" aria-hidden="true"></i>Mockup: belum tersambung ke backend. Pada tahap migrasi, halaman ini dan panel kecil memakai server yang sama dengan portal lama, dengan riwayat obrolan yang sama.</p>
    </div>
    <aside class="ai-side">
      <div class="field"><label for="aiScope">Konteks</label><select id="aiScope"><option value="0">Semua modul ${esc(T.short)}</option>${P.modules.map((_, j) => `<option value="${j + 1}" ${mnum === j + 1 ? 'selected' : ''}>${pad(j + 1)} ${esc(mod(j).title)}</option>`).join('')}</select></div>
      <div class="ai-side-note"><strong>Cara jawaban disusun</strong><p>Server mencari bagian materi yang paling relevan. AI menjawab dari bagian itu saja, lalu menyebut rujukannya. Tetap periksa rujukannya sebelum dipakai.</p></div>
    </aside>
  </div>`);
  const draw = () => {
    $('#aiThread').innerHTML = `<div class="ai-msg"><i class="ph ph-sparkle" aria-hidden="true"></i><p>Halo. Pilih konteks di samping, lalu ketik pertanyaanmu. Contoh pertanyaan ada di bawah.</p></div>`
      + aiLog.map(x => `<div class="ai-msg ${x.who === 'user' ? 'ai-user' : ''}"><i class="ph ph-${x.who === 'user' ? 'user' : 'sparkle'}" aria-hidden="true"></i><p>${esc(x.text)}</p></div>`).join('');
  };
  draw();
  $$('[data-ask]').forEach(c => c.onclick = () => { $('#aiInput').value = c.dataset.ask; $('#aiInput').focus(); });
  $('#aiScope').onchange = e => { history.replaceState(null, '', `#/tanya${+e.target.value ? `?m=${e.target.value}` : ''}`); };
  $('#aiCompose').onsubmit = e => {
    e.preventDefault();
    const q = $('#aiInput').value.trim();
    if (!q) return;
    aiLog.push({ who: 'user', text: q }, { who: 'ai', text: 'Mockup: jawaban AI belum tersedia di sini. Setelah migrasi, jawaban muncul di tempat ini beserta tautan ke bagian modul yang dirujuk.' });
    $('#aiInput').value = '';
    draw();
  };
}

// ---------- dialog & AI ----------
function openTerm(label, def) {
  $('#termTitle').textContent = label;
  $('#termBody').textContent = (def || 'Definisi belum tersedia.').replace(/–/g, '-');
  $('#termDialog').showModal();
}
function openAI(m) {
  $('#aiPanel').hidden = false;
  $('#aiFab').setAttribute('aria-expanded', 'true');
  $('#aiContext').textContent = m ? `Konteks yang akan dikirim: Modul ${pad(m.num)} ${m.title}.` : '';
  $('#aiFull').href = `#/tanya${m ? `?m=${m.num}` : ''}`;
}
$('#aiFab').onclick = () => { if ($('#aiPanel').hidden) { const r = location.hash.match(/modul\/(\d+)/); openAI(r ? mod(+r[1] - 1) : null); } else closeAI(); };
function closeAI() { $('#aiPanel').hidden = true; $('#aiFab').setAttribute('aria-expanded', 'false'); }
$('#aiClose').onclick = closeAI;

// ---------- router ----------
function route() {
  $('#topicMenu').hidden = true; $('#topicButton').setAttribute('aria-expanded', 'false');
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, query] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'kursus') kursus();
  else if (parts[0] === 'tanya') tanya(query);
  else if (parts[0] === 'modul') modulePage(+parts[1], parts[2]);
  else if (parts[0] === 'latihan') latihan();
  else if (parts[0] === 'persiapan' && C.prep) persiapan();
  else if (parts[0] === 'ujian') ujian();
  else if (parts[0] === 'cari') search(new URLSearchParams(query || '').get('q') || '');
  else home();
  if (parts[0] !== 'modul') { bindPageActions(); window.scrollTo(0, 0); }
}
// Notasi matematika: $...$ (sebaris) dan $$...$$ (blok) di teks mana pun dirender KaTeX dari lib/katex.
// Satu pengamat DOM menangani semua tempat, termasuk kuis, kamus, dialog, dan simulasi.
// Tanpa KaTeX (berkas hilang), teks LaTeX tampil apa adanya dan portal tetap jalan.
const MATH_OPTS = {
  delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
  ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option', 'input'],
  throwOnError: false,
};
// Rumus sebaris yang lebih lebar dari kolomnya (misalnya matriks) tidak bisa dipatahkan dan akan melebarkan halaman.
// Rumus seperti itu diberi kelas katex-wide: tampil sebagai blok yang bisa digulir sendiri.
function fitWideMath(root) {
  const all = [...root.querySelectorAll('.katex:not(.katex-display .katex)')];
  all.forEach(k => k.classList.remove('katex-wide'));
  // Dua putaran: rumus lebar di kolom yang sama saling melebarkan, jadi putaran kedua mengukur ulang.
  for (let pass = 0; pass < 2; pass++) all.forEach(k => {
    if (k.classList.contains('katex-wide') || !k.getClientRects().length) return; // belum tampil, diukur saat dibuka
    const host = k.parentElement.closest('p, li, td, div');
    // Lebar kolom diukur tanpa rumus itu, karena rumus yang terlalu lebar ikut melebarkan kolomnya.
    const w = k.scrollWidth; k.style.display = 'none';
    const room = Math.min(host ? host.clientWidth : innerWidth, innerWidth - 32);
    k.style.display = '';
    if (w > room) k.classList.add('katex-wide');
  });
}
function renderMath(root) {
  if (!window.renderMathInElement || !root || root.nodeType !== 1) return;
  window.renderMathInElement(root, MATH_OPTS);
}
let fitQueued = false;
const refitSoon = () => { if (fitQueued) return; fitQueued = true; requestAnimationFrame(() => { fitQueued = false; fitWideMath(document.body); }); };
addEventListener('resize', refitSoon);
document.addEventListener('toggle', refitSoon, true); // <details> dan dialog yang baru dibuka
let mathBusy = false;
new MutationObserver(muts => {
  if (mathBusy || !window.renderMathInElement) return;
  mathBusy = true;
  for (const m of muts) for (const n of m.addedNodes) {
    if (n.nodeType === 1 && !n.closest('.katex')) renderMath(n);
    else if (n.nodeType === 3 && n.parentElement && !n.parentElement.closest('.katex') && n.data.includes('$')) renderMath(n.parentElement);
  }
  mathBusy = false;
  refitSoon();
}).observe(document.body, { childList: true, subtree: true });
renderMath(document.body);

window.addEventListener('hashchange', route);
route();
})();
