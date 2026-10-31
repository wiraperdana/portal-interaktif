# Standar A: portal ini cukup untuk mendapat nilai A

Patokan mutu portal adalah satu kalimat: **siapa pun yang mengikuti portal ini sampai selesai harus bisa mendapat nilai A di mata kuliah aslinya, apa pun latar belakang, skill, atau pengalamannya.** Untuk materi dari kuliah universitas, patokannya adalah nilai A di mata kuliah yang setara di Fasilkom UI.

Ada dua bagian di kalimat itu, dan keduanya sama-sama mengikat.

- **"Apa pun latar belakangnya"** berarti portal tidak mengandaikan pengetahuan awal di atas SMA. Pembaca yang lupa turunan, belum pernah melihat matriks, atau belum pernah menulis Python tetap harus bisa mengikuti.
- **"Nilai A"** berarti portal tidak boleh mengencerkan materi. Semua rumus, penurunan, dan kasus yang bisa keluar di ujian harus ada, dan pembaca harus bisa mengerjakannya sendiri.

Analoginya guru les privat yang baik. Ia tidak melompati bab sulit, dan ia juga tidak menyuruh muridnya "belajar sendiri dulu" untuk bagian dasar. Ia menambal dasar yang bolong, lalu membawa murid sampai bisa mengerjakan soal ujian.

## Daftar periksa

Kerjakan saat merancang peta modul (langkah 2) dan periksa lagi sebelum menyerahkan (langkah 7).

### 1. Cakupan penuh

- [ ] Setiap slide, bagian buku, dan penekanan di sumber punya tempat di portal. Catat pemetaannya di `source-art/SUMBER.md`: butir sumber, lalu modul dan unit tujuannya.
- [ ] Tidak ada bagian sumber yang dilewati karena "terlalu teknis". Bagian yang sulit justru diberi unit sendiri.
- [ ] Latihan yang di sumber ditandai "exercise" atau "buktikan sendiri" dikerjakan sampai selesai di portal, di `note` atau `check`.

### 2. Prasyarat ditambal

- [ ] Untuk tiap modul, daftar pengetahuan awal yang dipakainya, misalnya turunan, perkalian matriks, logaritma, atau peluang bersyarat.
- [ ] Prasyarat yang melampaui SMA diberi unit **Kilas prasyarat** di modul pertama yang memakainya. Isinya cukup untuk dipakai di modul itu, dengan satu contoh angka.
- [ ] Unit Kilas prasyarat ditulis judulnya dengan awalan "Kilas prasyarat:", supaya pembaca yang sudah paham bisa melewatinya.

### 3. Kedalaman ujian

- [ ] Setiap rumus diturunkan langkah demi langkah, tanpa "dapat ditunjukkan bahwa". Lihat `notasi-matematika.md`.
- [ ] Setiap rumus punya **contoh angka kecil** yang bisa dihitung dengan tangan, dan hasilnya sudah dihitung ulang dengan skrip.
- [ ] Setiap asumsi dan syarat berlaku sebuah metode disebut, beserta akibatnya bila dilanggar.
- [ ] Salah kaprah yang umum diberi `contrast` atau `trap`.

### 4. Latihan setara ujian

- [ ] Kuis tiap modul mencampur tiga jenis soal: konsep, hitungan, dan penalaran ("kenapa langkah ini sah?" atau "apa yang terjadi bila asumsi X dilanggar?").
- [ ] Untuk topik kuantitatif, minimal dua dari lima soal kuis adalah soal hitungan.
- [ ] `why` di kuis dan jawaban `check` menunjukkan cara mengerjakan, bukan hanya jawabannya.
- [ ] Pengecoh kuis diambil dari kesalahan hitung yang nyata, misalnya lupa kolom angka 1 atau lupa membagi dua.

### 5. Kejujuran

- [ ] Angka di portal sudah dicek ulang. Kekeliruan di sumber dikoreksi dan diberi catatan, bukan disalin diam-diam.
- [ ] Contoh buatan sendiri ditandai sebagai contoh buatan di `footNote` atau `note`.

## Bagaimana standar ini mengubah keputusan lain

| Keputusan | Tanpa Standar A | Dengan Standar A |
|---|---|---|
| Rumus rumit di sumber | Diringkas jadi satu kalimat | Diturunkan lengkap, plus contoh angka |
| Pembaca belum tahu matriks | Diandaikan tahu | Unit Kilas prasyarat |
| Kuis | Lima soal definisi | Campuran konsep, hitungan, dan penalaran |
| Bahasa | Sederhana | Tetap sederhana. Sederhana dan dalam bisa berjalan bersama. |
