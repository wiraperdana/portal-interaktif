# Skema content.js

`content.js` mengisi satu objek global, `window.CONTENT`. Semua yang tampil di portal berasal dari sini, kecuali simulasi (`sims.js`) dan ukuran gambar (`images.js`).

Kenapa satu berkas: agent cukup menulis satu tempat, dan `app.js` bisa dipakai ulang tanpa diubah. Bayangkan formulir isian. Kolomnya tetap, isinya yang berganti.

Titik awalnya `templates/content.template.js`. Field bertanda *opsional* boleh dihapus.

## Markup di dalam teks

| Markup | Hasil | Berlaku di |
|---|---|---|
| `**istilah**` | Teks tebal. Bila istilahnya ada di `glossary`, ia jadi tombol yang membuka kamus. | `concept`, `define`, dan teks lain yang dirender kaya |
| `$...$`, `$$...$$` | Rumus LaTeX sebaris dan blok, dirender KaTeX. Garis miring terbalik digandakan. | Semua teks kecuali judul, brief, hook, goal, trap, istilah tebal, dan field `slide`. Lihat `notasi-matematika.md`. |
| `Awalan: isi` | Awalan pendek (2 sampai 28 huruf) tampil tebal sebagai penanda waktu, misalnya "Sebelum:", "Hari 4:" | `steps` |

Teks lain di-escape, jadi HTML mentah tidak dirender, kecuali di `source`, `footNote`, dan `topic.titleHtml`.

## Tingkat atas

| Field | Tipe | Isi |
|---|---|---|
| `storageKey` | string | Kunci localStorage. **Unik per portal**, supaya progres dua portal tidak tercampur. |
| `quizSeed` | angka | Pengacak urutan opsi. Ubah bila kunci jawaban menumpuk di satu huruf. Default 60. |
| `course` | objek | Mata kuliah atau program, lihat di bawah |
| `topic` | objek | Beranda topik, lihat di bawah |
| `chapters` | larik | Kelompok modul, maksimal 4: `{ label, title, sub }`. `label` tampil di kicker modul, misalnya "Bab 9". |
| `source` | HTML | Rujukan utama di kaki halaman |
| `footNote` | HTML, opsional | Catatan kecil di kaki halaman |
| `visual` | objek, opsional | Gaya slide: `{ accent, second, setting, style }`, dibaca `slide-briefs.cjs`. `style` menyebut gaya gambar hero, misalnya "Flat modern illustration with soft grain", supaya slide tidak bergeser gaya. |
| `glossary` | objek | Kamus. Kunci huruf kecil, nilai definisi satu sampai dua kalimat. |
| `diagrams` | larik | Diagram dari sumber, lihat di bawah |
| `simulations` | objek | Teks per simulasi, diteruskan ke `sims.js` sebagai `kit.text` |
| `prep` | objek, opsional | Halaman Persiapan, lihat di bawah. Bila ada, menu Persiapan muncul. |
| `traps`, `trapsIntro` | larik, opsional | Jebakan di bahan sumber: `[{ where, written, correct, confidence: 'Tinggi' \| 'Sedang' }]`, tampil di Persiapan |
| `essays` | larik, opsional | Soal esai Mode Ujian: `[{ module, prompt, rubric: [..], answer }]` |
| `examFormat` | objek, opsional | Format Simulasi ujian penuh: `{ pg, isian, essay, minutes }`, default 15, 10, 5, 150 |
| `voices` | objek, opsional | Mengaktifkan tombol gaya bahasa Dosen (formal) dan Asdos (santai): `{ formal, santai }` berisi teks tooltip |
| `game` | objek, opsional | `{ levels, badges }`. `badges` menambah lencana khusus topik yang diberikan simulasi lewat `kit.badge(id)` |
| `gradeRubric` | larik, opsional | Rubrik penilaian AI untuk penjelasan pembaca: `[[kriteria, keterangan], ...]` |
| `modules` | larik | Isi utama, lihat di bawah |

### course

```js
{ code, name, short, term, current,
  halves: [{ title, exam, topics: [nomor, ...] }],
  topics: { nomor: { title, chapter, status, href } } }
```

`status` bernilai `portal` (portal sudah ada), `slide` (baru ada bahan), atau `none`. Hanya topik ber-`href` yang bisa diklik. `current` adalah nomor topik portal ini.

### topic

| Field | Isi |
|---|---|
| `num`, `mark`, `short` | Nomor, karakter di kotak merek, nama pendek ("Topik 8") |
| `title`, `titleHtml` | Judul. `titleHtml` opsional, `<span>` di dalamnya tampil lebih redup. |
| `lead` | Dua kalimat: topik ini tentang apa, dan apa manfaatnya |
| `heroArt`, `heroAlt` | Opsional. Nama gambar hero dan teks alternatifnya. |
| `gains` | Tiga manfaat `{ icon, title, text }`. Ikon dari Phosphor Icons tanpa awalan `ph-`. |
| `askSuggestions` | Contoh pertanyaan di Tanya AI saat tidak di halaman modul |

### diagrams[j]

```js
{ title, ref, image, why, steps: [..], question, criteria: [..] }
```

`image` adalah nama berkas di `assets/` tanpa `.webp`. `ref` menyebut asalnya, misalnya "Figure 9.1". Diagram ditempatkan oleh unit, lewat `unit.diagrams: [j]`.

## modules[i]

| Field | Isi |
|---|---|
| `title` | Istilah kunci modul. Boleh Inggris bila itu bentuk yang umum. |
| `short` | Judul pendek untuk menu dan peta pokok bahasan, 1 sampai 3 kata, misalnya "Residual & Loss". Pembaca memindai daftar ini untuk tahu apa yang harus dikuasai. |
| `poster` | Disarankan. Infografis modul lengkap `{ heading?, blocks: [[label, penjelasan, adegan], ...], formula?, takeaway }`, 4 sampai 8 blok. Penjelasan 12 sampai 25 kata per blok dan merangkum isi unit, bukan judulnya saja. Teks Unicode, tanpa LaTeX. Gambarnya `assets/poster-mNN.webp`, tampil di bawah tujuan modul sebelum Inti. |
| `informal` | Opsional. Versi gaya Asdos: `{ hook, trap, inti: { beats } }`. Definisi tetap gaya Dosen. Lihat `bahasa.md`. |
| `hook` | Satu kalimat cerita yang memancing rasa ingin tahu |
| `goal` | Satu tujuan belajar yang bisa diuji |
| `trap` | Batas atau salah kaprah, tampil sebagai "Batas yang perlu diingat" |
| `chapter` | Indeks di `chapters` |
| `terms` | Istilah untuk chip di bagian Inti. Hanya yang ada di `glossary` yang tampil. |
| `inti` | Bagian 1, lihat di bawah |
| `sections` | Bagian 2, larik unit Pendalaman |
| `quiz` | Bagian 3, tepat lima soal |

### inti

| Field | Isi |
|---|---|
| `art` | Opsional. Ilustrasi cerita, tampil utuh selebar kolom di atas teks cerita. Buat landscape 3:2 dan jangan taruh hal penting di tepi. Tanpa gambar, teks cerita tetap memakai lebar penuh. |
| `beats` | Tiga ketukan cerita `[[label, teks], ...]`, misalnya Situasi, Yang terjadi, Mengapa penting |
| `concept` | Definisi konsep yang memakai cerita tadi. Boleh `**istilah**`. |
| `mapping` | Tabel "Dari cerita ke istilah": `[[unsur cerita, istilah], ...]` |
| `recall` | Pertanyaan untuk "Penjelasan dengan bahasamu" |
| `answer` | Contoh penjelasan yang baik, dua sampai tiga kalimat |

### sections[k], satu unit Pendalaman

| Field | Wajib | Tampil sebagai |
|---|---|---|
| `title` | ya | Judul unit, juga cabang mindmap |
| `brief` | ya | Satu kalimat di bawah judul, juga catatan di mindmap |
| `slide` | tidak | Gambar `slide-m<MM>-<KK>.webp` di bawah brief. Field `points` atau `grid`, `takeaway`, dan `scenes` dipakai untuk brief imagegen dan teks alternatif. |
| `question` | ya | Pertanyaan pemantik |
| `example`, `steps`, `note` | example ya | Kotak "Contoh" dengan linimasa langkah dan catatan kecil |
| `define` | ya | Kotak "Definisi" |
| `tiles` | tidak | Kartu ciri `[[nama, keterangan], ...]` |
| `contrast` | tidak | "Yang sering tertukar" |
| `lecturer` | tidak | "Poin penting". Nama field-nya warisan, isinya tidak boleh menyebut dosen. |
| `check` | ya | "Cek cepat" `{ q, a }` yang bisa dibuka |
| `diagrams` | tidak | Indeks diagram yang tampil setelah unit ini |
| `art` | tidak | Ilustrasi `{ name, alt, caption }` setelah unit ini |
| `sim` | tidak | Nama simulasi di `sims.js` yang tampil setelah unit ini |
| `symbols` | tidak | "Simbol dan cara bacanya": `[[simbol, arti], ...]` |
| `derive` | tidak | "Turunkan sendiri": `{ intro, steps: [{ prompt, options, key, show, why, hint }] }`. Langkah berikutnya terbuka setelah pilihan benar. |
| `mistakes` | tidak | "Sering salah": daftar kesalahan nyata di ujian |
| `informal` | tidak | Versi gaya Asdos: `{ brief, question, example, note, lecturer, contrast, mistakes }`. Tanpa `define`, `check`, `steps` |

**Daun mindmap** diambil otomatis: dari `slide.grid` atau `tiles` bila ada, kalau tidak dari istilah tebal di `define`. Unit berisi daftar delapan ciri akan menampilkan delapan daun.

### quiz[n]

```js
{ text, options: [5 opsi], key: indeks opsi benar, why }
```

Opsi diacak tetap per soal saat tampil, jadi tulis jawaban benar di posisi mana saja. Setelah ditulis, periksa sebaran kunci dengan QA. Bila menumpuk, ubah `quizSeed`.

### prep, halaman Persiapan

```js
{ title, intro, informal: { intro },
  usage: [{ icon, title, text }],          // cara memakai portal
  story: [{ q, a, module }],                // peta cerita: satu pertanyaan per modul, saling menyambung
  oneLine,                                  // seluruh materi dalam satu kalimat
  mini: { title, intro, headers, rows, note },  // data mini yang dipakai di semua modul
  kitIntro, kit: [{ title, body }],         // bekal pengetahuan
  checks: [{ text, options, key, why }] }   // cek bekal, memberi XP dan lencana Siap berangkat
```

## sims.js dan Mode Ujian

`sims.js` mengisi dua objek global, dan seluruh berkas wajib dibungkus `(() => { ... })();` supaya nama pembantunya tidak bentrok dengan skrip lain.

- `window.PORTAL_SIMS = { nama: { mount(wadah, kit) } }`. Lihat `simulasi.md`.
- `window.PORTAL_EXAM = { generators: [{ title, module, make(rand) }] }`. `make` mengembalikan `{ text, fields: [{ label, answer, tol? }], solution }`. Satu soal isian boleh punya beberapa kolom, seperti soal ujian yang berisi sekitar lima isian. Toleransi default 0,01 atau 0,5% dari jawaban.

Mode Ujian menyusun paket dari kuis semua modul, generator ini, dan `essays`, lalu menjalankan timer: 1, 2, atau 3 menit per soal, 15 menit, 30 menit, atau durasi `examFormat.minutes`.
