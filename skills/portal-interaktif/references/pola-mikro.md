# Struktur modul dan pola mikro

Setiap halaman modul punya tiga bagian dengan urutan tetap. Urutan ini meniru cara orang belajar hal baru: dengar ceritanya dulu, lalu pelajari rinciannya, lalu buktikan bahwa sudah paham.

Di atas ketiga bagian, kepala modul memuat judul, hook, tujuan, lalu **infografis modul** (`poster-mNN.webp`). Infografis ini merangkum seluruh penjelasan modul dalam satu gambar portrait, supaya pembaca melihat peta lengkapnya sebelum masuk cerita. Lihat `visual.md`.

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
6. **Simbol dan cara bacanya** (bila unit memperkenalkan notasi).
7. **Kartu ciri** (bila konsepnya berupa daftar).
8. **Turunkan sendiri** (bila unit berisi penurunan rumus). Pembaca memilih langkah berikutnya, dan langkah baru terbuka setelah pilihannya benar.
9. **Yang sering tertukar** (bila ada pasangan konsep yang mirip).
10. **Sering salah** (kesalahan nyata saat mengerjakan soal).
11. **Poin penting** (penekanan dari sumber, tanpa menyebut siapa yang menekankan).
12. **Cek cepat**, satu pertanyaan dengan jawaban yang bisa dibuka.
13. Diagram, ilustrasi, atau simulasi yang ditempatkan setelah unit ini.

Urutan contoh sebelum definisi itu disengaja. Pembaca yang sudah melihat kejadiannya akan membaca definisi sebagai penjelasan, bukan sebagai hafalan.

## Unit Kilas prasyarat

Bila sebuah modul memakai pengetahuan di atas SMA, misalnya perkalian matriks atau aturan logaritma, modul itu dibuka dengan unit berjudul "Kilas prasyarat: ...". Pola mikronya sama dengan unit lain. Isinya hanya yang dipakai di modul itu, dengan satu contoh angka. Pembaca yang sudah paham bisa melewatinya. Kenapa: tanpa unit ini, pembaca dari latar lain berhenti di rumus pertama yang ia tidak kenal. Lihat `standar-a.md`.

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
- Campur tiga jenis soal: konsep, hitungan, dan penalaran. Untuk topik kuantitatif, minimal dua soal hitungan.
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

## Persiapan, sebelum Modul 1

Halaman Persiapan memberi bekal sebelum belajar: cara memakai portal, peta pokok bahasan (judul pendek, tujuan, istilah tiap modul), alur cerita yang menyambungkan semua modul, satu kalimat inti, data mini, bekal pengetahuan dengan cek, dan jebakan di bahan sumber. Kenapa: pembaca yang tahu peta dan bekalnya tidak tersesat di tengah modul.

## Data mini lintas modul

Topik kuantitatif memakai satu data mini kecil yang bisa dihitung tangan, dipakai di setiap modul sebagai unit "Data mini: ...". Di atas data mini, tiap modul menambah contoh yang lebih kompleks sebanyak yang perlu, misalnya data asli dari sumber. Hitung hasil yang sama dengan semua metode yang dibahas, supaya pembaca melihat metode berbeda bertemu di jawaban yang sama.

## Simulasi per modul

Setiap modul yang punya konsep dengan variabel yang bisa diubah wajib punya simulasi. Lihat `simulasi.md`. Simulasi bukan hiasan: ia tempat pembaca membuktikan sendiri ide utama modul.

## Mode Ujian

Kuis per modul melatih pemahaman. Mode Ujian melatih kondisi ujian: paket acak dengan timer, soal isian berlapis dari generator, esai dengan rubrik, dan Simulasi ujian penuh yang meniru format ujian asli. Hasilnya menandai modul yang perlu diulang.

## Gamifikasi

XP, level, dan lencana diberikan hanya untuk tanda paham: jawaban kuis benar, langkah penurunan tanpa bantuan, modul selesai, set hitungan benar, lulus paket ujian, dan tantangan simulasi. Membuka halaman tidak memberi XP. Setiap hadiah punya id, jadi mengulang tidak memberi XP dua kali.

Halaman **Pencapaian** (`#/pencapaian`) menjelaskan semua level beserta ambang XP-nya, tabel cara mendapat XP, dan semua lencana beserta syaratnya. Kotak XP di sidebar menautkan ke halaman ini. Tabel XP diambil dari `XP_RULES` di `app.js`, jadi bila angka `award()` diubah, ubah tabel itu juga. Lencana khusus topik di `game.badges` wajib punya `desc` yang menyebut syaratnya secara konkret, misalnya "Mencapai SSE dalam 1% dari minimum di simulasi Kalahkan OLS".
