# Simulasi interaktif (sims.js)

Simulasi adalah alat peraga yang bisa dicoba pembaca. Ia dipakai untuk konsep yang paling mudah dipahami lewat sebab-akibat yang bisa diubah, misalnya bullwhip effect: pembaca mengubah lead time, lalu melihat pesanan di hulu bergejolak.

Simulasi bersifat khusus topik, jadi kodenya tinggal di `sims.js` milik portal, bukan di `app.js`.

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
