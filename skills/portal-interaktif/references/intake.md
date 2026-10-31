# Menerima bahan

Portal yang baik lahir dari bahan yang dibaca utuh. Bagian ini menjelaskan cara membaca tiap jenis bahan, dan peran masing-masing dalam portal.

## Peran tiap jenis bahan

Bayangkan bahan-bahan ini sebagai saksi dengan keahlian berbeda. Buku teks adalah saksi ahli untuk definisi. Transkrip adalah saksi untuk contoh dan penekanan. Slide adalah saksi untuk urutan dan diagram. Portal mengambil dari tiap saksi sesuai keahliannya.

| Bahan | Dipakai untuk | Tidak dipakai untuk |
|---|---|---|
| Buku teks, paper, standar | Definisi, nama istilah kanonik, diagram, figure | Contoh sehari-hari (biasanya terlalu asing) |
| Slide | Urutan topik, pembagian bab, diagram, bagan | Definisi lengkap (slide terlalu ringkas) |
| Transkrip kuliah atau rekaman | Contoh, analogi, penekanan, salah kaprah yang sering muncul | Angka dan klaim faktual sebelum diverifikasi |
| Video | Sama dengan transkrip, plus tangkapan layar diagram bila perlu | |
| Gambar, foto papan tulis | Bagan dan urutan yang ditulis tangan | |
| Catatan pengguna | Prioritas, bagian yang dianggap sulit | |
| Soal latihan atau ujian lama | Gaya soal kuis, tingkat kesulitan | Menyalin soal apa adanya |

## Cara membaca per format

| Format | Cara |
|---|---|
| PDF | `pdftotext -layout` untuk teks. `pdftoppm -r 150 -png -f N -l N` untuk merender halaman yang berisi diagram, lalu baca gambarnya. `pdfimages -list` untuk melihat gambar tertanam. |
| PPTX, DOCX, XLSX | `markitdown <berkas>` untuk teks. Untuk diagram, ekspor halaman ke PDF lalu render. |
| Video atau audio | Cari transkrip yang sudah ada lebih dulu, misalnya subtitle atau catatan pengguna. Bila tidak ada, ekstrak audio dengan `ffmpeg -i video -vn -ac 1 -ar 16000 audio.wav`, lalu transkripsikan dengan alat yang tersedia. Bila tidak ada alat transkripsi, minta transkripnya ke pengguna. |
| Gambar | Baca langsung. Catat apa isinya dan dari mana asalnya. |
| Halaman web | Ambil teksnya, simpan URL dan tanggal aksesnya. |

**Baca seluruhnya.** Jangan menyimpulkan isi bab dari judul atau daftar isinya. Bahan yang tidak bisa dibaca utuh dilaporkan ke pengguna, bukan dilewati diam-diam.

## Catatan asal-usul

Simpan catatan asal-usul di `<portal>/source-art/SUMBER.md` atau README portal: daftar bahan, halaman atau menit yang dipakai, dan diagram mana berasal dari figure mana. Catatan ini membuat revisi berikutnya tidak perlu membaca ulang semua bahan.

## Hal yang wajib ditanyakan sebelum menulis

1. **Folder tujuan** portal.
2. **Pembaca sasaran.** Default-nya pembaca universal (lihat `bahasa.md`). Tanyakan bila bahan jelas untuk kalangan khusus.
3. **Izin imagegen**, beserta perkiraan jumlah gambar: 1 hero, 1 ilustrasi Inti per modul, dan 1 slide per unit. Sepuluh modul dengan lima unit berarti sekitar 61 gambar.
4. **Hak pakai bahan.** Bila portal akan dibagikan di luar pengguna, diagram dari buku berhak cipta perlu dipertimbangkan.

## Batas

- Angka dan klaim yang hanya muncul di ucapan lisan tidak masuk portal sebelum diverifikasi ke sumber resmi.
- Data pribadi di bahan, misalnya nama mahasiswa di transkrip, tidak masuk portal.
- Bahan berlisensi terbatas tidak disalin ke folder portal.
