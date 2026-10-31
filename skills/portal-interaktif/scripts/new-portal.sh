#!/usr/bin/env bash
# Salin boilerplate portal ke folder tujuan baru.
# Pakai: new-portal.sh <folder-tujuan>
# Folder tujuan tidak boleh sudah berisi index.html, supaya portal yang ada tidak tertimpa.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
dest="${1:?pakai: new-portal.sh <folder-tujuan>}"
if [ -e "$dest/index.html" ]; then
  echo "Berhenti: $dest/index.html sudah ada. Pilih folder lain atau hapus dulu secara sadar." >&2
  exit 1
fi
mkdir -p "$dest/assets" "$dest/lib" "$dest/source-art"
cp "$here/boilerplate/index.html" "$here/boilerplate/app.js" "$here/boilerplate/style.css" "$dest/"
cp "$here/boilerplate/lib/mindmap.js" "$here/boilerplate/lib/mindmap.css" "$dest/lib/"
cp -R "$here/boilerplate/lib/katex" "$dest/lib/"
# Isi awal: templat content.js, images.js kosong, dan sims.js tanpa simulasi.
cp "$here/templates/content.template.js" "$dest/content.js"
printf '%s\n' '// Ukuran asli tiap gambar di assets/. Dihasilkan scripts/image-sizes.cjs, jangan disunting tangan.' 'window.IMAGE_SIZES = {};' > "$dest/images.js"
printf '%s\n' '// Simulasi khusus topik. Kosong sampai topik ini membutuhkannya. Lihat references/simulasi.md.' 'window.PORTAL_SIMS = {};' > "$dest/sims.js"
echo "Portal baru siap di $dest. Isi content.js, lalu jalankan scripts/image-sizes.cjs dan scripts/qa.py."
