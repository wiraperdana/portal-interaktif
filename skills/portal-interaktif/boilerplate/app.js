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
const mod = i => ({ ...C.modules[i], i, num: i + 1, bab: babOf(i) });
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
let state = { visited: {}, notes: {}, quiz: {}, fold: {}, last: null, theme: null, sidebar: 'open' };
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

if (state.theme) document.documentElement.dataset.theme = state.theme;
$('#themeToggle').onclick = () => {
  const dark = state.theme ? state.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  state.theme = dark ? 'light' : 'dark';
  document.documentElement.dataset.theme = state.theme;
  save();
};

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
const NAV = [['/', 'Beranda topik', 'house'], ['/latihan', 'Latihan', 'target'], ['/tanya', 'Tanya AI', 'sparkle']];
const TABS = [['/', 'Beranda', 'house'], ['/latihan', 'Latihan', 'target'], ['/tanya', 'Tanya AI', 'sparkle'], ['/kursus', 'Topik', 'squares-four']];
function frame(section, crumbs, currentModule) {
  const link = ([href, label, icon]) => `<a href="#${href}" ${section === href ? 'aria-current="page"' : ''}><i class="ph ph-${icon}" aria-hidden="true"></i><span>${label}</span></a>`;
  $('#primaryNav').innerHTML = NAV.map(link).join('');
  $('#tabbar').innerHTML = TABS.map(link).join('');
  $('#moduleTree').innerHTML = BAB.map(b => `<details class="${b.cls}" data-bab="${b.idx}" ${state.fold[b.idx] ? '' : 'open'}><summary><i class="ph ph-caret-right" aria-hidden="true"></i><span>${esc(b.label)}. ${esc(b.title)}</span></summary><ol>${b.mods.map(i => {
    const m = mod(i), st = statusOf(i);
    return `<li><a href="#/modul/${m.num}" ${i === currentModule ? 'aria-current="page"' : ''} title="${esc(m.title)}"><span class="n">${pad(m.num)}</span><span class="t">${esc(m.title)}</span>${st.cls === 'done' ? '<i class="ph ph-check-circle" aria-label="selesai"></i>' : ''}</a></li>`;
  }).join('')}</ol></details>`).join('');
  // Rail ikon: tetap bisa bernavigasi saat sidebar disembunyikan.
  $('#rail').innerHTML = `${NAV.map(([href, label, icon]) => `<a class="rail-btn" href="#${href}" ${section === href ? 'aria-current="page"' : ''} data-tip="${label}" aria-label="${label}"><i class="ph ph-${icon}" aria-hidden="true"></i></a>`).join('')}
    <span class="rail-sep" aria-hidden="true"></span>
    ${P.modules.map((_, j) => { const mm = mod(j); return `<a class="rail-mod ${mm.bab.cls} ${progress(j).done ? 'done' : ''}" href="#/modul/${mm.num}" ${j === currentModule ? 'aria-current="page"' : ''} data-tip="${pad(mm.num)} ${esc(mm.title)}${progress(j).done ? ' (selesai)' : ''}" aria-label="Modul ${pad(mm.num)} ${esc(mm.title)}">${pad(mm.num)}</a>`; }).join('')}`;
  $$('#moduleTree details').forEach(d => d.ontoggle = () => { state.fold[d.dataset.bab] = !d.open; save(); });
  $('#sidebarProgress').innerHTML = `<strong>${doneCount()} / ${NMOD}</strong> modul selesai<div class="meter">${P.modules.map((_, i) => `<span class="${progress(i).done ? 'on' : ''}"></span>`).join('')}</div>`;
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
    return `<li><a class="mod-row" href="#/modul/${m.num}"><span class="n">${pad(m.num)}</span><span><strong>${esc(m.title)}</strong><span class="h">${esc(m.hook)}</span></span><span class="st ${st.cls}">${st.icon ? `<i class="ph ph-${st.icon}" aria-hidden="true"></i>` : ''}${st.label}</span></a></li>`;
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
        <a class="btn" href="#/modul/${next.num}">${state.last != null ? 'Lanjutkan' : 'Mulai belajar'}<i class="ph ph-arrow-right" aria-hidden="true"></i></a>
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
  show(`<div class="page-head"><h1>Latihan</h1><p>Kuis tiap modul. Modul selesai setelah kuis lulus dan penjelasan dengan bahasamu ditulis.</p></div><div style="height:28px"></div>${practiceBlock()}`);
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
      ${u.note ? `<p class="unit-note"><i class="ph ph-info" aria-hidden="true"></i>${esc(u.note)}</p>` : ''}
    </div>
    <div class="unit-define">${label('book-open', 'Definisi')}<p>${richTerms(u.define)}</p></div>
    ${tiles}
    ${u.contrast ? `<div class="unit-contrast">${label('scales', 'Yang sering tertukar')}<p>${rich(u.contrast)}</p></div>` : ''}
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

  const R = REF[i], I = R && R.inti;
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
const simKit = name => ({ $, $$, esc, text: (C.simulations && C.simulations[name]) || {} });

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
  else if (parts[0] === 'cari') search(new URLSearchParams(query || '').get('q') || '');
  else home();
  if (parts[0] !== 'modul') { bindPageActions(); window.scrollTo(0, 0); }
}
window.addEventListener('hashchange', route);
route();
})();
