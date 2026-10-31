# Gambar: diagram, ilustrasi, dan slide

Portal memakai tiga jenis gambar dengan asal yang berbeda. Membedakannya penting, karena tiap jenis punya risiko salah yang berbeda.

| Jenis | Asal | Nama berkas | Risiko utama |
|---|---|---|---|
| Diagram | Dipotong dari sumber (figure buku, bagan slide) | `diagram-<nama>.webp` | Teks terlalu kecil, potongan terpotong |
| Ilustrasi | `/claude-imagegen` | `<nama>.webp` | Gaya tidak seragam, teks liar di gambar |
| Infografis modul | `/claude-imagegen` dari brief `poster-briefs.cjs` | `poster-m<MM>.webp`, portrait 2:3 | Salah eja penjelasan, blok hilang, rumus keliru |
| Slide infografis | `/claude-imagegen` dari brief `slide-briefs.cjs` | `slide-m<MM>-<KK>.webp` | Salah eja label, jumlah panel salah, isi keliru |

Semua gambar WebP, dan ukurannya didaftarkan ulang lewat `node scripts/image-sizes.cjs <portal>`.

## Diagram dari sumber

1. Render halaman: `pdftoppm -r 200 -png -f N -l N sumber.pdf halaman`.
2. Potong area figure, lalu ubah ke WebP: `cwebp -q 88 potongan.png -o assets/diagram-nama.webp`.
3. Daftarkan di `content.js` `diagrams` dengan `why`, `steps` cara membaca, `question`, dan `criteria`.
4. **Jangan membuat ulang diagram sumber dengan imagegen.** Diagram buku punya makna presisi, dan imagegen cenderung mengubah label atau panah.

## Ilustrasi

1. Buat **hero beranda lebih dulu**. Setujui gayanya dengan pengguna. Hero ini jadi rujukan gaya (`--ref`) untuk semua gambar berikutnya.
2. Brief ilustrasi menyebut: adegan, tokoh, latar Indonesia, cahaya, dan "No readable text anywhere, no watermark, no logos".
3. Ilustrasi tidak boleh memuat teks yang bisa dibaca. Teks tempatnya di HTML, supaya bisa dicari dan dibaca pembaca layar.
4. Simpan brief di `source-art/<nama>.brief.txt` dan PNG aslinya di `source-art/`.

## Slide infografis per unit

Tempatnya di bawah judul unit dan brief, sebelum pertanyaan pemantik. Ia ringkasan visual satu unit.

1. Isi `slide` di unit: `points` (tiga panel berurutan) atau `grid` (kartu ciri), `takeaway`, dan **`scenes`**.
2. `scenes` ditulis dalam Bahasa Inggris, satu adegan konkret per panel. Contoh yang baik: "a shopper comparing many shops on a phone screen grid". Contoh yang buruk: "information asymmetry concept".
3. Bila teks `points` terlalu panjang untuk gambar, isi `captions` yang lebih pendek. Batas aman sekitar 40 karakter per caption.
4. Jalankan `node scripts/slide-briefs.cjs <portal> --module N`, baca brief yang dihasilkan, lalu `scripts/gen-slides.sh <portal> <rujukan.png>`.
5. Kerjakan per modul, bukan sekaligus. Periksa satu modul dulu sebelum lanjut.

## Pemeriksaan visual, wajib untuk setiap gambar

Buka setiap gambar dan periksa:

- [ ] Semua teks dieja persis seperti di brief, termasuk huruf besar.
- [ ] Tidak ada teks tambahan, watermark, logo, merek, atau nomor halaman.
- [ ] Jumlah panel atau kartu sesuai.
- [ ] Isi adegan cocok dengan caption-nya. Panel "pembayaran" harus menunjukkan pembayaran.
- [ ] Arah panah dan urutan benar.
- [ ] Tidak ada glyph rusak atau huruf bertumpuk.
- [ ] Gaya seragam dengan rujukan.

## Revisi sempit

Bila hanya satu bagian salah, **jangan generate ulang dari nol**. Pakai gambar lama sebagai rujukan dan tulis brief revisi yang hanya menyebut perubahannya:

```bash
gen.sh --out source-art/slide-m06-04-rev1.png --brief source-art/slide-briefs/slide-m06-04-rev1.txt \
       --ref source-art/slide-m06-04.png --webp 1600
```

Brief revisi berbunyi seperti: "Edit the attached image. Keep everything identical except: panel 2 must show a person paying with a QR code on a phone instead of a credit card." Setelah lolos periksa, simpan versi lama dengan akhiran `-v0`, lalu pindahkan WebP hasil revisi ke `assets/`.

## Biaya

Setiap gambar memakai kuota ChatGPT pengguna, dan brief serta gambar rujukannya terkirim ke OpenAI. Sebutkan jumlah gambar sebelum mulai, dan jangan generate tanpa izin.

## Infografis modul (poster)

Gambar terpenting di setiap modul. Ia merangkum **seluruh penjelasan** modul dalam satu gambar, jadi pembaca bisa memahami modul dengan sekali lihat, lalu memakai unit Pendalaman untuk detailnya. Tempatnya di bawah tujuan modul, sebelum bagian Inti. Portal memasangnya otomatis bila `assets/poster-mNN.webp` ada.

1. Tulis `module.poster` di `content.js`: 4 sampai 8 blok, satu per gagasan penting. Tiap blok berisi label pendek dan penjelasan 12 sampai 25 kata yang benar-benar menjelaskan, misalnya "Residual adalah selisih nilai asli dan prediksi. Positif berarti model menebak terlalu rendah." Judul unit saja tidak cukup.
2. `node scripts/poster-briefs.cjs <portal> [--module N]`, baca briefnya.
3. `scripts/gen-slides.sh <portal> <rujukan.png> 'poster-m*'`.
4. Periksa ejaan **setiap kalimat** penjelasan dan rumusnya. Teks panjang lebih rawan salah eja daripada label slide, jadi revisi sempit sering perlu.

## Ilustrasi cerita Inti

Ilustrasi cerita tampil utuh selebar kolom, di atas teks cerita, dengan rasio aslinya. Tidak ada pemotongan. Buat landscape 3:2 dan isi seluruh bidang dengan adegan, karena tidak ada lagi bagian yang tersembunyi.
