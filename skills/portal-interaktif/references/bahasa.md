# Bahasa dan pembaca

## Pembaca sasaran: universal

Tulis untuk orang yang tidak pernah ikut kelasnya. Patokannya: **siapa pun, apa pun latar belakang, skill, atau pengalamannya, harus bisa mendapat nilai A** di mata kuliah aslinya hanya dari portal ini. Untuk materi kuliah universitas, ukurannya nilai A di mata kuliah setara di Fasilkom UI. Rinciannya di `standar-a.md`.

Bahasa sederhana dan materi yang dalam berjalan bersama. Kalimat dibuat mudah, isinya tidak dikurangi.

Kenapa: portal belajar sering dibuka orang di luar kelas aslinya, misalnya peserta matrikulasi, adik kelas, atau orang yang belajar mandiri. Kalimat yang mengandaikan pembaca hadir di kelas langsung membuat mereka merasa tertinggal.

Akibatnya:

- **Jangan merujuk ke perkuliahan.** Tidak ada "seperti dibahas di kelas", "contoh dari dosen", "slide pertemuan 3", atau "penekanan dosen".
- **Jangan mengandaikan pengetahuan awal.** Setiap istilah teknis didefinisikan saat pertama muncul, di modul tempat ia muncul. Prasyarat di atas SMA diberi unit Kilas prasyarat.
- **Rumus memakai notasi yang benar**, sama dengan yang akan ditemui pembaca di soal ujian. Lihat `notasi-matematika.md`.
- **Contoh dari dunia sehari-hari.** Belanja online, antre tiket, toko roti, ojek online. Hindari contoh yang hanya dikenal orang kantoran atau orang industri tertentu.

## Pilihan kata: yang diucapkan saat ngobrol

Ujinya sederhana: **apakah kata ini diucapkan orang saat ngobrol?** Kalau tidak, cari kata yang diucapkan.

| Pakai | Hindari |
|---|---|
| online | daring |
| ngobrol, percakapan | bercakap |
| HP | ponsel, gawai |
| live | siaran langsung |
| playlist | daftar putar |
| beli, bayar | melakukan pembelian, melakukan pembayaran |

## Istilah teknis

- **Pakai bentuk Inggris bila itu yang umum dipakai praktisi.** Supply chain, dynamic pricing, bullwhip effect. Jangan memaksakan padanan Indonesia yang jarang diucapkan.
- **Definisikan saat pertama muncul**, lalu daftarkan di `glossary`.
- **Satu konsep, satu nama** di seluruh portal. Nama di judul modul, definisi, kamus, kuis, dan slide harus sama persis.
- **Jangan mengarang istilah.** Bila sebuah konsep belum punya nama di sumber, tanya pengguna dulu sebelum memberinya nama.

## Kalimat

- Kalimat pendek dan sederhana. Satu kalimat, satu gagasan.
- Kalimat afirmatif. Nyatakan apa yang terjadi, bukan apa yang tidak terjadi.
- Tanpa em dash. Pakai koma atau titik.
- Sapaan "kamu" untuk pembaca.

## Label baku

Label ini sudah disetujui dan dipakai di semua portal. Ia ditulis di `app.js`, jadi isi `content.js` cukup mengikutinya.

| Label | Tempat |
|---|---|
| Inti, Pendalaman, Cek pemahaman | Tiga bagian modul |
| Cerita, Konsep | Isi bagian Inti |
| Dari cerita ke istilah | Tabel pemetaan di Inti |
| Mindmap modul, Mindmap topik | Peta isi |
| Contoh, Definisi | Kotak di unit |
| Yang sering tertukar | Field `contrast` |
| Poin penting | Field `lecturer` |
| Cek cepat | Field `check` |
| Penjelasan dengan bahasamu | Field `inti.recall` |
| Kuis | Lima soal per modul |

## Dua gaya bahasa: Dosen dan Asdos

Bila `voices` diisi, pembaca bisa memilih gaya. Tombolnya berlabel **Dosen** (formal, bawaan, mengikuti semua aturan di atas) dan **Asdos** (santai). Nilai internalnya tetap `formal` dan `santai`. Gaya Asdos meniru asisten dosen yang menjelaskan ke adik tingkat: "Bayangin gini", "Nah, ini persis...", "Gampang kan?".

- Gaya Asdos menimpa **semua teks penjelas**: modul (`hook`, `inti.beats`, `trap`), unit (`brief`, `question`, kalimat pembuka `example`, `note`, `lecturer`, `contrast`, `mistakes`), dan Persiapan (`intro`, `usage`, `oneLine`, `mini`, `kitIntro`). Keputusan pengguna 31 Oktober 2026 (K-261031-07).
- Yang **tetap gaya Dosen** di kedua mode: definisi (`define`, `inti.concept`, kamus), kuis dan Mode Ujian, Cek cepat (`check`), langkah hitungan (`steps`), kartu dan cek bekal, serta teks di infografis dan slide. Kenapa: yang diuji adalah konsepnya, dua versi definisi atau kunci jawaban berisiko berbeda makna, dan gambar hanya dibuat satu kali.
- Rumus LaTeX di versi Asdos disalin persis dari versi Dosen. Yang berubah hanya cara bertutur. `mistakes` versi Asdos wajib sama jumlah butirnya.
- Gaya Asdos tetap sopan dan tetap benar. Tidak ada singkatan chat (yg, gmn) dan tidak ada candaan yang mengaburkan konsep.

Label baru yang baku: Persiapan, Mode Ujian, Simbol dan cara bacanya, Turunkan sendiri, Sering salah, Yang harus kamu kuasai, Data mini, Lencana.
