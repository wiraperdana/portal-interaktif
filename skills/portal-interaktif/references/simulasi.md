# Simulasi interaktif (sims.js)

Simulasi adalah alat peraga yang bisa dicoba pembaca. Ia dipakai untuk konsep yang paling mudah dipahami lewat sebab-akibat yang bisa diubah, misalnya bullwhip effect: pembaca mengubah lead time, lalu melihat pesanan di hulu bergejolak.

Simulasi bersifat khusus topik, jadi kodenya tinggal di `sims.js` milik portal, bukan di `app.js`.

## Patokan: satu simulasi per modul yang membutuhkannya

Simulasi adalah kelebihan terbesar portal dibanding buku. Rancang satu simulasi untuk setiap modul yang punya konsep dengan variabel yang bisa diubah. Contoh topik regresi linear: permainan klasifikasi atau regresi, kenop bobot, tiga cara menjumlah residual dengan tantangan, peta mangkuk loss, kalkulator normal equation, simulator gradient descent, dan slider NLL.

## Kapan layak dibuat

- Konsepnya punya **variabel yang bisa diubah** dan **hasil yang bisa diamati**.
- Pembaca biasanya salah menebak hasilnya. Simulasi paling berguna saat ia membantah intuisi.
- Modelnya bisa dijelaskan jujur dalam beberapa aturan. Tulis aturan dan batas modelnya, supaya pembaca tidak mengira simulasi itu data nyata.

Bila tidak memenuhi ketiganya, contoh bertahap di unit biasanya sudah cukup.

## Kontrak

```js
window.PORTAL_SIMS = {
  nama: { mount(wadah, kit) { /* isi wadah */ } },
};
```

- Unit memasang simulasi lewat `sim: 'nama'`. Wadahnya muncul setelah unit itu.
- `wadah` adalah `<div class="sim-mount">`. Boleh diganti seluruhnya lewat `outerHTML`.
- Seluruh `sims.js` dibungkus `(() => { ... })();`. Tanpa itu, nama pembantu seperti `head` atau `fmt` bisa bentrok dengan skrip lain dan semua simulasi gagal terpasang.
- `kit.award(id, xp, label)` memberi XP sekali per id, dan `kit.badge(id)` memberi lencana yang didaftarkan di `content.js` `game.badges`. Pakai untuk tantangan yang menandakan paham, misalnya mencapai SSE dalam 1% dari minimum.
- Rumus di HTML simulasi ditulis `$...$` dan dirender KaTeX otomatis.
- Kelas bantu: `.sim-two` (dua kolom yang turun jadi satu di HP), `.sim-metrics` (tabel angka yang bisa digulir).
- `kit` berisi `$`, `$$`, `esc`, dan `text`. `text` adalah `content.js` `simulations[nama]`, jadi teks pengantar dan aturan model tetap tinggal di berkas isi.
- Nama yang tidak terdaftar diabaikan tanpa error.
- Pakai kelas CSS yang sudah ada: `.sim`, `.sim-controls`, `.field`, `.sim-predict`, `.sim-bar`, `.sim-out`, `.sim-rules`, `.btn`.

## Pola yang terbukti

Contoh lengkapnya `boilerplate/sims.js`:

1. **Prediksi dulu.** Kotak "Prediksimu sebelum menjalankan" di atas tombol. Menebak sebelum melihat hasil membuat hasilnya lebih diingat.
2. **Jalankan bertahap.** Tombol "Jalankan 1 hari" dan "Sampai akhir", supaya pembaca bisa mengikuti sebab-akibatnya.
3. **Kunci pilihan selama berjalan.** Ubah skenario hanya lewat tombol "Ubah skenario".
4. **Tafsirkan hasilnya** dalam kalimat, lalu ajak membandingkan dengan prediksi.
5. **Tabel riwayat** beberapa jalannya terakhir, supaya pembaca bisa membandingkan skenario.
6. **Aturan dan batas model** di bagian yang bisa dibuka.
