# Skema content.js

`content.js` mengisi satu objek global, `window.CONTENT`. Semua yang tampil di portal berasal dari sini, kecuali simulasi (`sims.js`) dan ukuran gambar (`images.js`).

Kenapa satu berkas: agent cukup menulis satu tempat, dan `app.js` bisa dipakai ulang tanpa diubah. Bayangkan formulir isian. Kolomnya tetap, isinya yang berganti.

Titik awalnya `templates/content.template.js`. Field bertanda *opsional* boleh dihapus.

## Markup di dalam teks

| Markup | Hasil | Berlaku di |
|---|---|---|
| `**istilah**` | Teks tebal. Bila istilahnya ada di `glossary`, ia jadi tombol yang membuka kamus. | `concept`, `define`, dan teks lain yang dirender kaya |
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
| `visual` | objek, opsional | Gaya slide: `{ accent, second, setting }`, dibaca `slide-briefs.cjs` |
| `glossary` | objek | Kamus. Kunci huruf kecil, nilai definisi satu sampai dua kalimat. |
| `diagrams` | larik | Diagram dari sumber, lihat di bawah |
| `simulations` | objek | Teks per simulasi, diteruskan ke `sims.js` sebagai `kit.text` |
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
| `art` | Opsional. Ilustrasi cerita. Tanpa gambar, teks cerita memakai lebar penuh. |
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

**Daun mindmap** diambil otomatis: dari `slide.grid` atau `tiles` bila ada, kalau tidak dari istilah tebal di `define`. Unit berisi daftar delapan ciri akan menampilkan delapan daun.

### quiz[n]

```js
{ text, options: [5 opsi], key: indeks opsi benar, why }
```

Opsi diacak tetap per soal saat tampil, jadi tulis jawaban benar di posisi mana saja. Setelah ditulis, periksa sebaran kunci dengan QA. Bila menumpuk, ubah `quizSeed`.
