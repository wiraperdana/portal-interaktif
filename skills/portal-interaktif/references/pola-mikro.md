# Struktur modul dan pola mikro

Setiap halaman modul punya tiga bagian dengan urutan tetap. Urutan ini meniru cara orang belajar hal baru: dengar ceritanya dulu, lalu pelajari rinciannya, lalu buktikan bahwa sudah paham.

| Bagian | Label | Isi | Kenapa |
|---|---|---|---|
| 1 dari 3 | **Inti** | Cerita, Konsep, Dari cerita ke istilah, chip istilah | Memberi gantungan. Istilah baru lebih mudah diingat bila menempel pada cerita. |
| 2 dari 3 | **Pendalaman** | Mindmap modul, lalu unit-unit berpola mikro | Rincian dipecah jadi potongan kecil yang masing-masing selesai dalam satu tarikan baca. |
| 3 dari 3 | **Cek pemahaman** | Penjelasan dengan bahasamu, lalu Kuis | Mengingat ulang dan menjawab soal lebih menguatkan ingatan daripada membaca ulang. |

## Pola mikro satu unit

Pola mikro adalah urutan tetap di dalam satu unit Pendalaman. Bayangkan resep masakan: bahannya beda-beda, tapi urutan langkahnya selalu sama, jadi pembaca tidak perlu menebak di mana mencari apa.

1. **Judul** dan **brief**, satu kalimat ringkasan.
2. **Slide infografis** (bila ada), tepat di bawah brief. Bisa dibuka layar penuh.
3. **Pertanyaan pemantik**, situasi sehari-hari yang membuat konsepnya terasa perlu.
4. **Contoh**: satu kalimat pembuka, lalu langkah berurutan (`steps`) dengan penanda waktu, lalu catatan kecil bila perlu.
5. **Definisi**, dengan istilah tebal yang bisa diklik ke kamus.
6. **Kartu ciri** (bila konsepnya berupa daftar).
7. **Yang sering tertukar** (bila ada pasangan konsep yang mirip).
8. **Poin penting** (penekanan dari sumber, tanpa menyebut siapa yang menekankan).
9. **Cek cepat**, satu pertanyaan dengan jawaban yang bisa dibuka.
10. Diagram, ilustrasi, atau simulasi yang ditempatkan setelah unit ini.

Urutan contoh sebelum definisi itu disengaja. Pembaca yang sudah melihat kejadiannya akan membaca definisi sebagai penjelasan, bukan sebagai hafalan.

## Satu benang cerita

Bagian Inti memakai satu tokoh dan satu situasi. Unit Pendalaman boleh memakai contoh lain, tetapi tetap di dunia yang mirip, supaya pembaca tidak berganti konteks terus-menerus. Contoh yang baik: toko roti untuk rantai pasok, belanja sepatu di marketplace untuk pasar digital.

## Ukuran

| Hal | Patokan |
|---|---|
| Modul per topik | sekitar 10 |
| Unit per modul | 3 sampai 8 |
| Langkah contoh | 2 sampai 4 |
| Soal kuis | tepat 5, masing-masing tepat 5 opsi |
| Penjelasan dengan bahasamu | minimal 40 karakter untuk dianggap ditulis |
| Syarat selesai | kuis minimal 4 benar dan penjelasan sudah ditulis |

## Kuis

- Soal berupa kasus singkat yang menuntut penerapan konsep, bukan menebak definisi.
- Pengecoh diambil dari konsep yang sering tertukar di modul yang sama.
- `why` menjelaskan kenapa jawaban benar itu benar, dan kenapa pengecoh terkuat keliru.
- Kuis tampil satu soal per layar, dengan nomor soal, tombol Sebelumnya dan Berikutnya, dan layar Hasil.

## Mindmap

- **Mindmap topik** di beranda: akar topik, lalu bab, lalu modul, lalu unit. Lapis pertama terbuka di awal.
- **Mindmap modul** di awal Pendalaman: Inti, Pendalaman, Cek pemahaman, lalu unit, lalu istilah.
- Keduanya punya satu tombol dinamis untuk lipat atau buka semua, dan tidak diberi keterangan di bawahnya.
- Di layar sempit, mindmap berubah jadi kerangka bertingkat.

## Hal yang sudah diputuskan dan jangan dikembalikan

- Tidak ada perkiraan waktu baca ("sekitar 5 menit").
- Tidak ada subjudul di bawah label Pendalaman, dan tidak ada keterangan di bawah mindmap.
- Tidak ada tombol "Tanya AI tentang modul ini" di halaman modul. Tanya AI tersedia lewat tombol melayang dan halaman penuh.
- Label tidak memakai kalimat perintah. "Dari cerita ke istilah", bukan "Hubungkan dengan cerita".
- Slide infografis berupa gambar dari imagegen, bukan slide HTML.
