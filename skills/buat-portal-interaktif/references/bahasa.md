# Bahasa dan pembaca

## Pembaca sasaran: universal

Tulis untuk orang yang tidak pernah ikut kelasnya. Patokannya: **lulusan SMA harus bisa paham dan mendapat nilai A** hanya dari portal ini.

Kenapa: portal belajar sering dibuka orang di luar kelas aslinya, misalnya peserta matrikulasi, adik kelas, atau orang yang belajar mandiri. Kalimat yang mengandaikan pembaca hadir di kelas langsung membuat mereka merasa tertinggal.

Akibatnya:

- **Jangan merujuk ke perkuliahan.** Tidak ada "seperti dibahas di kelas", "contoh dari dosen", "slide pertemuan 3", atau "penekanan dosen".
- **Jangan mengandaikan pengetahuan awal.** Setiap istilah teknis didefinisikan saat pertama muncul, di modul tempat ia muncul.
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
