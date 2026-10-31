---
name: portal-interaktif
description: Ubah bahan belajar apa pun (slide PDF atau PPTX, transkrip, video, gambar, catatan, buku, attachment lain) menjadi portal belajar interaktif statis berbahasa Indonesia. Portalnya punya beranda topik, mindmap tiga lapis yang bisa dilipat, modul berpola mikro (Inti, Pendalaman, Cek pemahaman), slide infografis per sub-modul dari /claude-imagegen, kamus istilah, kuis 5 soal x 5 opsi, syarat selesai modul, pencarian, dan mode gelap. Semua berjalan dari file:// tanpa server. Pakai saat pengguna meminta "buat portal belajar", "portal interaktif", "/portal-interaktif", atau ingin materi kuliah, pelatihan, atau workshop dijadikan halaman belajar mandiri.
---

# portal-interaktif

Skill ini membuat portal belajar dari bahan mentah. Kodenya sudah jadi di `boilerplate/`. Tugas agent adalah **menulis isinya**, yaitu satu berkas `content.js`, lalu membuat gambarnya dan memeriksa hasilnya.

Analogi sederhananya begini. `boilerplate/` adalah gedung sekolah yang sudah lengkap: ruang kelas, papan tulis, perpustakaan, dan ruang ujian. Agent tidak membangun gedung. Agent menyusun kurikulum, menulis bahan ajar, dan menyiapkan soal ujiannya. Karena gedungnya sama, setiap portal baru otomatis mewarisi semua perbaikan tata letak yang pernah dibuat.

## Patokan mutu: Standar A

Siapa pun yang mengikuti portal sampai selesai harus bisa **mendapat nilai A di mata kuliah aslinya, apa pun latar belakang, skill, atau pengalamannya**. Untuk materi kuliah universitas, patokannya nilai A di mata kuliah setara di Fasilkom UI. Artinya dua hal sekaligus: prasyarat yang bolong ditambal, dan materi tidak diencerkan. Daftar periksanya di `references/standar-a.md`, dan ia mengikat di langkah 2, 4, dan 7.

## Kapan dipakai

- Pengguna menyerahkan bahan belajar dan ingin halaman belajar mandiri yang interaktif.
- Pengguna ingin portal "persis seperti" portal yang sudah ada, untuk topik lain.
- **Jangan dipakai** untuk deck presentasi (pakai skill slide), mindmap tunggal (pakai `/buat-mindmap`), atau catatan kuliah biasa (pakai `/tulis-catatan`).

## Yang dihasilkan

Satu folder portal yang bisa dibuka dengan klik ganda `index.html`:

```
<portal>/
  index.html  app.js  style.css   salinan boilerplate, jangan disunting per topik
  lib/mindmap.js  lib/mindmap.css library mindmap-html
  content.js                      SELURUH isi topik (ditulis agent)
  images.js                       ukuran asli gambar, dihasilkan scripts/image-sizes.cjs
  sims.js                         simulasi khusus topik, boleh kosong
  assets/*.webp                   ilustrasi, slide, diagram
  source-art/                     brief dan PNG asli dari /claude-imagegen, untuk revisi
```

## Prosedur

Kerjakan berurutan. Langkah bertanda **[tanya]** butuh persetujuan pengguna sebelum lanjut. Ajukan keputusan dengan ID bila konvensi pengguna memintanya, dan paling banyak satu keputusan baru per balasan.

### 1. Terima bahan dan tetapkan batas

Baca `references/intake.md`. Ringkasnya:

1. Inventaris semua bahan: jenis, jumlah halaman atau durasi, dan bahasanya.
2. Baca **seluruh** isi bahan, jangan hanya judulnya. Video tanpa transkrip diubah jadi transkrip dulu.
3. Tetapkan sumber utama. Bila ada buku teks, buku itu jadi rujukan definisi. Transkrip dan slide memberi contoh dan penekanan.
4. **[tanya]** Konfirmasi tiga hal sekaligus: folder tujuan, pembaca sasaran, dan izin memakai kuota imagegen beserta perkiraan jumlah gambarnya.

### 2. Rancang peta modul **[tanya]**

1. Susun daftar istilah kanonik dari sumber. Satu konsep, satu nama. Bila sumber memakai dua nama untuk konsep yang sama, berhenti dan tanya.
2. Kelompokkan jadi paling banyak empat bab (`chapters`), lalu modul. Sepuluh modul per topik sudah terbukti nyaman.
3. Tiap modul berisi tiga sampai delapan unit Pendalaman. Satu unit membawa satu gagasan.
4. Beri setiap modul judul pendek (`short`) yang langsung menyebut pokok bahasannya, misalnya "Residual & Loss". Rancang data mini, peta cerita Persiapan, dan satu simulasi untuk tiap modul yang membutuhkannya.
5. Terapkan `references/standar-a.md` bagian 1 dan 2: petakan setiap butir sumber ke unit, lalu tambahkan unit **Kilas prasyarat** untuk pengetahuan awal yang melampaui SMA.
6. Tunjukkan peta itu ke pengguna sebagai tabel: bab, modul, judul unit, dan istilah kunci. Tunggu persetujuan.

### 3. Pasang boilerplate

```bash
scripts/new-portal.sh <folder-tujuan>
```

Skrip menolak menimpa folder yang sudah berisi `index.html`.

### 4. Tulis content.js

Ikuti `references/content-schema.md` untuk bentuk datanya. Ikuti `references/pola-mikro.md` dan `references/bahasa.md` untuk isinya. Keduanya mengikat. Poin terpenting:

- **Satu cerita per modul.** Bagian Inti memakai satu situasi sehari-hari. Unit Pendalaman boleh punya contoh sendiri, tetapi tetap di dunia yang sama.
- **Pembaca universal.** Lulusan SMA harus bisa paham tanpa pernah ikut kelasnya. Jangan merujuk ke kuliah, dosen, atau pertemuan.
- **Bahasa sehari-hari.** Pakai kata yang diucapkan orang saat ngobrol: online, HP, ngobrol. Istilah teknis tetap Inggris bila itu bentuk yang umum, dan wajib didefinisikan saat pertama muncul.
- **Kuis lima soal, lima opsi** per modul. Soal berupa kasus singkat, bukan hafalan definisi. Untuk topik kuantitatif, minimal dua soal hitungan.
- **Notasi matematika** ditulis LaTeX di antara `$...$` atau `$$...$$`, dirender KaTeX yang sudah dibundel. Judul, brief, dan slide tetap Unicode. Aturannya di `references/notasi-matematika.md`.
- **Setiap rumus diturunkan langkah demi langkah dan punya contoh angka**, yang hasilnya dicek ulang dengan skrip, bukan dihitung di kepala.
- Untuk topik besar, tulis isinya lewat skrip generator per bab (Python atau Node) yang mengeluarkan potongan `content.js`. Cara ini memudahkan revisi massal.

### 5. Siapkan gambar **[tanya bila belum diizinkan]**

Baca `references/visual.md`. Ringkasnya:

1. **Diagram dari sumber** (figure buku, bagan slide) dipotong dari PDF jadi WebP, lalu didaftarkan di `diagrams`. Diagram tidak dibuat ulang dengan imagegen.
2. **Ilustrasi** (hero beranda, cerita Inti, art di unit) dibuat lewat `/claude-imagegen`. Ilustrasi pertama menjadi rujukan gaya untuk semua gambar sesudahnya.
3. **Infografis modul** (gambar terpenting): isi `module.poster`, lalu
   ```bash
   node scripts/poster-briefs.cjs <portal> [--module N]
   scripts/gen-slides.sh <portal> <portal>/source-art/<rujukan>.png 'poster-m*'
   ```
4. **Slide infografis per unit**: isi `slide.scenes`, lalu
   ```bash
   node scripts/slide-briefs.cjs <portal> [--module N]
   scripts/gen-slides.sh <portal> <portal>/source-art/<rujukan>.png
   ```
5. **Periksa setiap gambar secara visual.** Ejaan label, arah panah, jumlah panel, dan teks liar wajib dicek. Perbaiki dengan revisi sempit (gambar lama sebagai `--ref`), bukan generate ulang dari nol.
6. Jalankan `node scripts/image-sizes.cjs <portal>` setiap kali gambar berubah.

### 6. Simulasi, Mode Ujian, dan gamifikasi

1. Tulis satu simulasi untuk setiap modul yang punya konsep yang bisa dimanipulasi, di `sims.js` mengikuti `references/simulasi.md`, lalu pasang di unit lewat `sim: 'nama'`. Bungkus seluruh berkas dalam IIFE.
2. Tulis generator soal isian `window.PORTAL_EXAM` untuk setiap jenis hitungan, dan `essays` untuk penurunan besar. Isi `examFormat` sesuai format ujian asli.
3. Daftarkan lencana khusus topik di `game.badges` dan berikan lewat `kit.badge` saat tantangan simulasi berhasil.
4. Bila pengguna menginginkan, isi `voices` dan field `informal` untuk gaya santai.

### 7. Periksa

```bash
python3 scripts/qa.py <portal>
```

Skrip memeriksa error JavaScript, rumus yang gagal dirender, rasio gambar, scroll horizontal di lebar HP, node mindmap yang bertumpuk, alur selesai modul, dan kelengkapan isi. Setelah lolos, lanjutkan pemeriksaan manual di `references/qa.md` dan daftar periksa `references/standar-a.md`: tangkapan layar desktop dan HP, baca ulang satu modul utuh, dan cek ejaan di slide.

### 8. Laporkan

Laporkan ke pengguna: jumlah modul, unit, soal, gambar, hasil QA, dan apa yang belum selesai. Sebut gambar yang masih perlu revisi dengan jujur.

## Aturan tetap

- **Jangan menyunting `app.js`, `style.css`, atau `index.html` di folder portal.** Perbaikan tampilan dilakukan di `boilerplate/`, lalu disalin ke semua portal. Isi khusus topik hanya boleh di `content.js`, `sims.js`, dan `assets/`.
- **Rasio gambar tidak boleh berubah.** Lebar dan tinggi selalu diambil dari `images.js`.
- **Label bagian sudah baku**: Inti, Pendalaman, Cek pemahaman, Dari cerita ke istilah, Yang sering tertukar, Poin penting, Cek cepat, Penjelasan dengan bahasamu, Kuis, Mindmap modul. Jangan diganti tanpa persetujuan pengguna.
- **Syarat selesai modul**: kelima soal dijawab dengan minimal empat benar, dan penjelasan dengan bahasamu minimal 40 karakter.
- **Sitasi dan angka** di isi portal mengikuti aturan sitasi pengguna. Angka pasar dari ucapan lisan tidak dipakai sebelum diverifikasi ke sumber resmi.
- **Kuota imagegen milik pengguna.** Brief dan gambar rujukan terkirim ke OpenAI. Jangan generate tanpa izin, dan sebut jumlah gambarnya sebelum mulai.
- **Setiap kelebihan fitur dipakai penuh**: Persiapan, data mini, judul pendek, simulasi per modul, penurunan interaktif, Mode Ujian dengan timer, dan gamifikasi. Jangan melewatkan satu pun hanya karena butuh kerja lebih.
- **Standar A tidak boleh ditawar.** Bagian sumber yang sulit diberi unit sendiri, bukan diringkas jadi satu kalimat.
- Jangan pernah memakai em dash di isi portal.

## Berkas skill

| Berkas | Isi |
|---|---|
| `boilerplate/` | Kode portal yang tidak memuat isi topik apa pun, termasuk KaTeX di `lib/katex/` |
| `templates/content.template.js` | Titik awal `content.js` dengan komentar per field |
| `scripts/new-portal.sh` | Salin boilerplate ke folder baru |
| `scripts/image-sizes.cjs` | Tulis `images.js` dari isi `assets/` |
| `scripts/poster-briefs.cjs` | Susun brief infografis modul dari `module.poster` |
| `scripts/slide-briefs.cjs` | Susun brief slide per unit dari `content.js` |
| `scripts/gen-slides.sh` | Jalankan `/claude-imagegen` untuk semua brief slide |
| `scripts/qa.py` | QA otomatis dengan Playwright, plus mode banding dua portal |
| `references/intake.md` | Cara membaca slide, transkrip, video, gambar, dan attachment |
| `references/content-schema.md` | Skema `content.js` lengkap |
| `references/pola-mikro.md` | Struktur halaman modul dan pola mikro tiap unit |
| `references/bahasa.md` | Pembaca sasaran, pilihan kata, dan label |
| `references/visual.md` | Diagram, ilustrasi, slide, dan pemeriksaan visual |
| `references/simulasi.md` | Kontrak `sims.js` |
| `references/standar-a.md` | Patokan mutu: cakupan penuh, Kilas prasyarat, kedalaman ujian, latihan setara ujian |
| `references/notasi-matematika.md` | Menulis rumus dengan LaTeX dan KaTeX, konvensi notasi, angka |
| `references/qa.md` | Daftar periksa manual sebelum diserahkan |
