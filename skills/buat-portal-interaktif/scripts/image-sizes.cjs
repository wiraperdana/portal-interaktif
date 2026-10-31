#!/usr/bin/env node
// Baca ukuran asli semua gambar WebP di <portal>/assets, lalu tulis <portal>/images.js.
// Pakai: node image-sizes.cjs <folder-portal>
// Rasio gambar di portal selalu diambil dari sini, jadi jalankan ulang setiap kali gambar ditambah atau diganti.
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('pakai: node image-sizes.cjs <folder-portal>'); process.exit(1); }
function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  if (kind === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
  return null;
}
const sizes = {};
for (const f of fs.readdirSync(path.join(dir, 'assets')).sort()) {
  if (!f.endsWith('.webp')) continue;
  const s = webpSize(fs.readFileSync(path.join(dir, 'assets', f)));
  if (s) sizes[f.replace(/\.webp$/, '')] = s; else console.warn('lewati, bukan WebP sah:', f);
}
fs.writeFileSync(path.join(dir, 'images.js'),
  '// Ukuran asli tiap gambar di assets/. Dihasilkan scripts/image-sizes.cjs, jangan disunting tangan.\n' +
  `window.IMAGE_SIZES = ${JSON.stringify(sizes, null, 0).replace(/\],/g, '],\n  ').replace(/^\{/, '{\n  ').replace(/\}$/, '\n}')};\n`);
console.log(`${Object.keys(sizes).length} gambar ditulis ke images.js`);
