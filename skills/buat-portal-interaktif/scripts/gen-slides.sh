#!/usr/bin/env bash
# Buat gambar slide dari brief di <portal>/source-art/slide-briefs/ lewat /claude-imagegen, satu per satu.
# Pakai: gen-slides.sh <folder-portal> <gambar-rujukan-gaya> [pola, default slide-m*]
#
# - Slide yang PNG-nya sudah ada di source-art/ dilewati, jadi aman dijalankan ulang setelah gagal.
# - Hasil WebP lebar 1600 px dipindah ke assets/, lalu images.js diperbarui.
# - Setiap gambar memakai kuota ChatGPT pengguna dan brief-nya terkirim ke OpenAI. Mintalah izin dulu.
# - Selalu periksa hasilnya secara visual (lihat references/visual.md) sebelum dianggap selesai.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
dir="$(cd "${1:?pakai: gen-slides.sh <folder-portal> <rujukan> [pola]}" && pwd)"
ref="${2:?gambar rujukan gaya wajib, misalnya source-art/hero.png}"
pat="${3:-slide-m*}"
gen="${CLAUDE_IMAGEGEN:-$HOME/.claude/skills/claude-imagegen/scripts/gen.sh}"
[ -x "$gen" ] || { echo "Tidak menemukan $gen. Pasang skill /claude-imagegen dulu." >&2; exit 1; }
shopt -s nullglob
for f in "$dir"/source-art/slide-briefs/$pat.txt; do
  n="$(basename "$f" .txt)"
  if [ -f "$dir/source-art/$n.png" ]; then echo "lewati $n"; continue; fi
  if "$gen" --out "$dir/source-art/$n.png" --brief "$f" --ref "$ref" --webp 1600 > "$dir/source-art/slide-briefs/$n.log" 2>&1; then
    mv "$dir/source-art/$n.webp" "$dir/assets/$n.webp" && echo "selesai $n"
  else
    echo "GAGAL $n, lihat source-art/slide-briefs/$n.log"
  fi
done
node "$here/image-sizes.cjs" "$dir"
