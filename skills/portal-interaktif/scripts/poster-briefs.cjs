#!/usr/bin/env node
// Susun brief infografis modul (poster-mNN) dari content.js, untuk dibuat gambarnya oleh /claude-imagegen.
// Pakai: node poster-briefs.cjs <folder-portal> [--module N] [--force]
// Lalu:  scripts/gen-slides.sh <portal> <rujukan.png> 'poster-m*'
//
// Infografis modul merangkum SELURUH penjelasan modul dalam satu gambar portrait 2:3, tampil di bawah tujuan modul.
// Isinya penjelasan singkat tiap gagasan, bukan daftar judul. Ditulis penulis di field module.poster:
//   heading:  judul di gambar (opsional, default module.short atau judul modul)
//   blocks:   [[label, penjelasan, adegan], ...]  4 sampai 8 blok, satu per gagasan penting modul.
//             label maksimal 5 kata, penjelasan 12 sampai 25 kata dan bisa berdiri sendiri,
//             adegan dalam Bahasa Inggris untuk ikon atau ilustrasi kecil blok itu.
//   formula:  satu rumus kunci dalam Unicode (opsional), misalnya 'w = (XᵀX)⁻¹ Xᵀy'
//   takeaway: satu kalimat penutup
// Semua teks wajib Unicode, tanpa LaTeX, karena imagegen menggambar teks apa adanya.
const fs = require('fs'), path = require('path'), vm = require('vm');
const args = process.argv.slice(2);
const dir = args[0];
if (!dir) { console.error('pakai: node poster-briefs.cjs <folder-portal> [--module N] [--force]'); process.exit(1); }
const only = args.includes('--module') ? +args[args.indexOf('--module') + 1] : null;
const force = args.includes('--force');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'content.js'), 'utf8'), ctx);
const C = ctx.CONTENT, V = C.visual || {};
const accent = V.accent || 'burnt orange', second = V.second || 'muted teal';
const setting = V.setting || 'Indonesian characters and setting, soft natural light';
const plain = t => String(t || '').replace(/\*\*/g, '').trim();
const pad = n => String(n).padStart(2, '0');
const out = path.join(dir, 'source-art', 'slide-briefs');
fs.mkdirSync(out, { recursive: true });
let made = 0, skipped = 0;
C.modules.forEach((m, i) => {
  if (only && only !== i + 1) return;
  const name = `poster-m${pad(i + 1)}`, file = path.join(out, `${name}.txt`), P = m.poster;
  if (!P) { console.warn(`LEWATI ${name}: modul belum punya field poster`); skipped++; return; }
  if (fs.existsSync(file) && !force) { skipped++; return; }
  const blocks = P.blocks || [];
  if (blocks.length < 4 || blocks.length > 8 || blocks.some(b => b.length < 3)) { console.warn(`LEWATI ${name}: poster.blocks harus 4 sampai 8 blok [label, penjelasan, adegan]`); skipped++; return; }
  const title = plain(P.heading || m.short || m.title), take = plain(P.takeaway), formula = plain(P.formula);
  const texts = [title, take, formula, ...blocks.flatMap(b => [b[0], b[1]])];
  if (texts.some(t => /[$\\]/.test(t))) { console.warn(`LEWATI ${name}: teks poster memuat LaTeX. Tulis dengan Unicode.`); skipped++; return; }
  const long = blocks.filter(b => b[1].split(/\s+/).length > 28);
  if (long.length) console.warn(`PERINGATAN ${name}: ${long.length} penjelasan lebih dari 28 kata, risiko salah eja naik`);
  const body = blocks.map((b, j) => `Block ${j + 1}: a small illustration of ${b[2].replace(/\.\s*$/, '')}. Label (bold): '${plain(b[0])}'. Explanation text under it: '${plain(b[1])}'.`).join('\n');
  const allowed = [title, ...blocks.flatMap(b => [plain(b[0]), plain(b[1])]), ...(formula ? [formula] : []), take].map(t => `'${t}'`).join(', ');
  fs.writeFileSync(file, `Style: a complete educational summary infographic poster, portrait 2:3. ${V.style || 'Warm semi-realistic digital illustration'} that matches the attached reference image (${setting}). Any recurring character must look identical to the reference image. Clean off-white background, ${accent} as the main accent color with ${second} as the second color. Typography: clean modern sans-serif. Labels large and bold, explanation text smaller but clearly legible.
Layout: the title at the top. Below it, ${blocks.length} numbered blocks in reading order (two columns, top to bottom), each block with one small illustration, a bold label, and a short explanation paragraph under the label. Connect the blocks with thin arrows to show the learning order.${formula ? ' Between the blocks and the bottom, one highlighted formula strip.' : ''} At the bottom, one rounded highlighted box containing the takeaway sentence.

Content:
${body}
${formula ? `Formula strip text: '${formula}'.\n` : ''}
Title text: '${title}'.
Takeaway box text: '${take}'.

Text allowed in the image, exactly: ${allowed}.
No other text anywhere, no watermark, no logos, no page numbers. Spell every text exactly as given, including capitalization and mathematical symbols.
`);
  made++;
});
console.log(`${made} brief infografis ditulis ke ${out}, ${skipped} dilewati.`);
