# Notasi matematika

Portal merender rumus dengan KaTeX, library penulis rumus bergaya LaTeX. KaTeX sudah dibundel di `lib/katex/`, jadi rumus tetap tampil walau portal dibuka dari `file://` tanpa internet.

Kenapa ini penting: rumus yang ditulis dengan huruf biasa, misalnya `w = (X^T X)^-1 X^T y`, sulit dibaca dan mudah salah baca. Pembaca yang belajar untuk ujian butuh notasi yang persis sama dengan yang akan ia temui di soal, di buku, dan di papan tulis.

## Cara menulis

| Markup | Hasil | Contoh di `content.js` |
|---|---|---|
| `$...$` | Rumus sebaris, di tengah kalimat | `'Bobot $w_1$ adalah kemiringan garis.'` |
| `$$...$$` | Rumus blok, di baris sendiri dan di tengah | `'$$\\mathbf{w}^{\\ast} = (\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top\\mathbf{y}$$'` |

**Garis miring terbalik wajib digandakan** di string JavaScript. Tulis `\\frac`, bukan `\frac`. Satu garis miring akan dimakan JavaScript sebelum sampai ke KaTeX.

## Di mana boleh, di mana tidak

| Boleh LaTeX | Wajib Unicode atau teks biasa |
|---|---|
| `concept`, `define`, `example`, `steps`, `note`, `contrast`, `lecturer`, `check`, `beats`, `mapping`, `recall`, `answer`, kuis (`text`, `options`, `why`), `glossary`, `diagrams` (`why`, `steps`, `question`, `criteria`), `simulations` | `title`, `brief`, `hook`, `goal`, `trap`, `chapters`, `terms`, `tiles` (nama), istilah di dalam `**...**`, dan **semua field `slide`** |

Alasannya:
- **Mindmap** mengukur lebar node sebelum KaTeX bekerja, jadi rumus di judul atau brief membuat node bertumpuk.
- **Slide** digambar imagegen, yang mencetak `$` dan `\` apa adanya. `scripts/slide-briefs.cjs` menolak slide yang memuat LaTeX.
- **Judul** juga dipakai di navigasi, tab browser, dan hasil pencarian, yang semuanya teks biasa.

Di tempat yang wajib Unicode, pakai karakter Unicode: w₀, x², wᵀx, ŷ, ε, σ², Σ, ∂, ≈, ×, −.

## Konvensi notasi

Ikuti notasi sumber utama lebih dulu. Bila sumber tidak konsisten, pakai konvensi berikut dan catat perbedaannya di `note`.

| Jenis | Konvensi | LaTeX |
|---|---|---|
| Skalar | huruf kecil miring | `$x$`, `$w_0$`, `$\\sigma^2$` |
| Vektor | huruf kecil tebal, vektor kolom | `$\\mathbf{x}$`, `$\\mathbf{w}$` |
| Matriks | huruf besar tebal | `$\\mathbf{X}$` |
| Transpos | `^\\top` | `$\\mathbf{w}^\\top\\mathbf{x}$` |
| Contoh ke-i | superskrip dalam kurung | `$x^{(i)}$`, `$y^{(i)}$` |
| Himpunan data | huruf kaligrafi | `$\\mathcal{D}$` |
| Nilai optimal | bintang lewat `\\ast` | `$\\mathbf{w}^{\\ast}$` |
| Tebakan model | topi | `$\\hat{y}$` |
| Argmin | operator | `$\\arg\\min_{\\mathbf{w}}$` |
| Fungsi bernama | tegak | `$\\operatorname{SSE}$`, `$\\log$`, `$\\exp$` |
| Satuan | teks tegak | `$150\\,\\text{m}^2$`, atau tulis m² di luar rumus |

**Hindari `**` di dalam rumus.** Penanda tebal portal memakai `**`. Tulis `\\ast`, bukan `^*`.

## Angka

- Desimal memakai koma, seperti di prosa. Di dalam rumus tulis `66{,}67`. Kurung kurawal mencegah KaTeX memberi spasi setelah koma.
- Ribuan memakai titik di prosa (35.000). Di dalam rumus tulis `35.000` juga, supaya prosa dan rumus konsisten.
- Angka yang panjang boleh ditulis di prosa, bukan di rumus.

## Rumus yang baik untuk pembaca

1. **Setiap simbol didefinisikan saat pertama muncul.** Rumus blok diikuti kalimat "dengan ...", misalnya "dengan $\\mathbf{X}$ design matrix dan $\\mathbf{y}$ vektor target".
2. **Penurunan ditulis satu langkah per baris** dengan `aligned`, dan setiap langkah punya alasan:
   ```
   '$$\\begin{aligned} \\nabla L &= (\\mathbf{Xw}-\\mathbf{y})^\\top\\mathbf{X} && \\text{chain rule} \\\\ &= \\mathbf{0}^\\top && \\text{syarat minimum} \\end{aligned}$$'
   ```
3. **Setiap rumus punya contoh angka** yang bisa dicek dengan tangan, di unit yang sama.
4. **Rumus blok tidak lebih lebar dari layar HP.** Pecah jadi beberapa baris `aligned` bila lebih dari sekitar 40 karakter. Yang terlalu lebar akan digulir ke samping, dan itu masih lebih baik daripada terpotong.
5. Langkah di `steps` boleh memuat rumus sebaris. Bila rumusnya panjang, taruh rumus blok di `define` atau `note`.

## Pemeriksaan

`scripts/qa.py` melaporkan rumus yang gagal dirender (`.katex-error`) dan pasangan `$...$` yang tertinggal mentah. Periksa juga secara manual: buka satu unit berumus di lebar 390 px dan pastikan rumus blok terbaca.
