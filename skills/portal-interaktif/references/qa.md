# Pemeriksaan sebelum diserahkan

QA dikerjakan dua lapis. Lapis otomatis menangkap kerusakan teknis. Lapis manual menangkap hal yang hanya terlihat oleh mata, misalnya salah eja di gambar atau contoh yang membingungkan.

## Lapis 1: otomatis

```bash
python3 scripts/qa.py <portal>
```

Butuh `pip install playwright` dan `playwright install chromium-headless-shell`.

| Pemeriksaan | Kenapa |
|---|---|
| Error JavaScript di tiap rute | Satu error bisa mengosongkan halaman |
| Rasio gambar | Diagram gepeng sulit dibaca. Ilustrasi cerita ber-`object-fit: cover` sengaja dipotong dan tidak dihitung. |
| Scroll horizontal di 390 px | Pembaca HP tidak boleh menggeser layar ke samping |
| Node mindmap bertumpuk | Label yang bertumpuk tidak terbaca |
| Alur selesai modul | Lima jawaban benar plus penjelasan harus menandai modul selesai |
| Notasi matematika | Rumus yang gagal dirender KaTeX, atau `$...$` yang tertinggal mentah |
| Simulasi dan ujian | Wadah simulasi yang tidak terpasang, kunci penurunan di luar opsi, generator soal yang menghasilkan bukan angka |
| Isi wajib | Kuis 5 x 5, field Inti lengkap, field wajib unit terisi |

Untuk membandingkan dua versi portal, misalnya sebelum dan sesudah memperbarui boilerplate:

```bash
python3 scripts/qa.py <portal-baru> --compare <portal-lama>
```

Mode ini mencetak rute yang jumlah unit, diagram, slide, simulasi, node mindmap, atau panjang teksnya berbeda.

## Lapis 2: manual

Rute tambahan: `#/persiapan` dan `#/ujian`. Rute modul adalah `#/modul/N`, unit `#/modul/N/p-K` (K mulai 0), kuis `#/modul/N/cek-soal`. Ambil tangkapan layar desktop (1360 px) dan HP (390 px) untuk beranda, satu modul utuh, kuis, dan Tanya AI. Lalu periksa:

- [ ] Beranda menjelaskan topiknya dan manfaatnya dalam bahasa sehari-hari.
- [ ] Mindmap topik terbaca saat semua cabang dibuka. Daun unit berdaftar (misalnya delapan ciri) tampil lengkap.
- [ ] Satu modul dibaca utuh dari atas ke bawah: ceritanya runtut, contoh mendahului definisi, dan tidak ada rujukan ke kuliah atau dosen.
- [ ] Setiap istilah tebal yang penting bisa diklik ke kamus.
- [ ] Setiap slide sudah lolos pemeriksaan visual di `visual.md`.
- [ ] Sebaran kunci kuis tidak menumpuk di satu huruf.
- [ ] Mode gelap terbaca, termasuk mindmap dan slide.
- [ ] Sidebar bisa dilipat, rail ikon punya tooltip, dan tombol `[` melipat sidebar.
- [ ] Satu unit berumus dibuka di 390 px: rumus blok terbaca, tidak terpotong.
- [ ] Daftar periksa `standar-a.md` terpenuhi: cakupan penuh, Kilas prasyarat, contoh angka per rumus, dan kuis berisi soal hitungan.
- [ ] Jalankan satu Simulasi ujian penuh sampai dikumpulkan, dan satu penurunan sampai tuntas.
- [ ] Ganti ke gaya Asdos dan baca satu modul: naratif berubah, definisi tetap.
- [ ] Tidak ada em dash di `content.js`: `grep -c $'\u2014' content.js` harus 0.
- [ ] Istilah di judul, definisi, kamus, kuis, dan slide konsisten.

## Setelah memperbarui boilerplate

Perubahan di `boilerplate/` belum sampai ke portal yang sudah ada. Salin `app.js`, `style.css`, `index.html`, dan `lib/` ke tiap portal, lalu jalankan QA dengan `--compare` terhadap versi sebelumnya.
