#!/usr/bin/env node
// Susun brief slide infografis per unit dari content.js, untuk dibuat gambarnya oleh /claude-imagegen.
// Pakai: node slide-briefs.cjs <folder-portal> [--module N] [--force]
//
// Tiap unit yang punya field slide menghasilkan source-art/slide-briefs/slide-m<MM>-<KK>.txt.
// Bagian baku (gaya, tata letak, daftar teks yang boleh muncul) disusun dari content.js.
// Adegan tiap panel atau kartu WAJIB ditulis di slide.scenes, karena hanya penulis isi yang tahu
// adegan apa yang menjelaskan konsepnya. Unit tanpa scenes yang lengkap dilewati dengan peringatan.
//
// Field slide yang dibaca:
//   points: [[ikon, teks], ...]        tiga panel berurutan kiri ke kanan, atau
//   grid:   [[ikon, nama, ket], ...]   kartu berjajar, label kartu = nama
//   takeaway: kalimat penutup (markup **tebal** dibuang)
//   scenes:   [adegan panel 1, ...]    wajib, satu per panel atau kartu, dalam Bahasa Inggris
//   captions: [teks pendek, ...]       opsional, mengganti teks points bila terlalu panjang untuk gambar
//   heading:  judul di slide           opsional, default judul unit
// Gaya visual diambil dari content.js visual { accent, second, setting }.
const fs = require('fs'), path = require('path'), vm = require('vm');
const args = process.argv.slice(2);
const dir = args[0];
if (!dir) { console.error('pakai: node slide-briefs.cjs <folder-portal> [--module N] [--force]'); process.exit(1); }
const only = args.includes('--module') ? +args[args.indexOf('--module') + 1] : null;
const force = args.includes('--force');

const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'content.js'), 'utf8'), ctx);
const C = ctx.CONTENT, V = C.visual || {};
const accent = V.accent || 'burnt orange', second = V.second || 'muted teal';
const setting = V.setting || 'Indonesian characters and setting, soft natural light';
const plain = t => String(t || '').replace(/\*\*/g, '').replace(/\.\s*$/, '');
const pad = n => String(n).padStart(2, '0');
const out = path.join(dir, 'source-art', 'slide-briefs');
fs.mkdirSync(out, { recursive: true });

let made = 0, skipped = 0;
C.modules.forEach((m, i) => {
  if (only && only !== i + 1) return;
  m.sections.forEach((u, k) => {
    const sl = u.slide; if (!sl) return;
    const name = `slide-m${pad(i + 1)}-${pad(k + 1)}`, file = path.join(out, `${name}.txt`);
    if (fs.existsSync(file) && !force) { skipped++; return; }
    const grid = Array.isArray(sl.grid);
    const items = grid ? sl.grid.map(g => g[1]) : (sl.captions || (sl.points || []).map(p => plain(p[1])));
    const scenes = sl.scenes || [];
    if (scenes.length !== items.length) { console.warn(`LEWATI ${name}: slide.scenes ${scenes.length}, butuh ${items.length}`); skipped++; return; }
    const title = sl.heading || u.title, take = plain(sl.takeaway);
    const n = items.length, rows = n > 4 ? 2 : 1, cols = Math.ceil(n / rows);
    const layout = grid
      ? `a grid of ${n} cards in ${rows} row${rows > 1 ? 's' : ''} of ${cols}. Each card has one small illustrated icon scene and one label under it.`
      : `${n} illustrated panels from left to right connected by simple arrows, each panel with one small illustrated scene and a short caption directly under it.`;
    const body = items.map((t, j) => `${grid ? 'Card' : 'Panel'} ${j + 1}: ${scenes[j].replace(/\.\s*$/, '')}. ${grid ? 'Label' : 'Caption'}: '${t}'.`).join('\n');
    const allowed = [title, ...items, take].map(t => `'${t}'`).join(', ');
    fs.writeFileSync(file, `Style: a polished educational infographic slide, landscape 16:9. Warm semi-realistic digital illustration that matches the attached reference image (${setting}). Clean off-white background, generous whitespace, ${accent} as the main accent color with a ${second} as the second color. Typography: clean modern sans-serif, large and highly legible.
Layout: the title at the top left. Below it, ${layout} At the bottom, one rounded highlighted box containing the takeaway sentence.

Content:
${body}

Title text: '${title}'.
Takeaway box text: '${take}'.

Text allowed in the image, exactly: ${allowed}.
No other text anywhere, no watermark, no logos, no brand names, no page numbers. Spell every text exactly as given, including capitalization.
`);
    made++;
  });
});
console.log(`${made} brief ditulis ke ${out}, ${skipped} dilewati.`);
