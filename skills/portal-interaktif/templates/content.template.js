// Isi portal belajar. Satu-satunya berkas yang perlu ditulis untuk topik baru.
// Skema lengkap dan alasan tiap field: references/content-schema.md.
// Aturan isi (pola mikro, bahasa, label): references/pola-mikro.md dan references/bahasa.md.
//
// Markup di dalam teks:
//   **istilah**  ditebalkan. Di field define dan concept, istilah tebal yang ada di glossary jadi tombol kamus.
//   "Awalan: isi" di steps  awalan pendek sebelum titik dua ditampilkan tebal sebagai penanda waktu.
// Nama gambar ditulis tanpa ekstensi. Berkasnya assets/<nama>.webp, ukurannya di images.js.
window.CONTENT = {
  storageKey: 'portal-contoh-topik-1', // unik per portal, supaya progres dua portal tidak tercampur
  quizSeed: 60,                         // ubah bila posisi kunci jawaban menumpuk di satu huruf

  // Mata kuliah atau program. Dipakai di pemilih topik dan halaman Semua topik.
  course: {
    code: 'KODE-01', name: 'Nama Mata Kuliah', short: 'MK', term: 'Semester',
    current: 1,
    halves: [{ title: 'Paruh pertama', exam: 'Jadwal ujian', topics: [1, 2] }],
    topics: {
      1: { title: 'Judul topik ini', chapter: 'Bab 1', status: 'portal', href: '#/' },
      2: { title: 'Topik berikutnya', chapter: 'Bab 2', status: 'slide' }, // status: portal | slide | none
    },
  },

  // Beranda topik.
  topic: {
    num: 1, mark: '1', short: 'Topik 1',
    title: 'Judul topik ini',
    titleHtml: 'Judul <span>topik</span> ini', // opsional, <span> tampil lebih redup
    lead: 'Dua kalimat: topik ini tentang apa, dan apa manfaatnya bagi pembaca.',
    heroArt: '', heroAlt: '',                 // opsional, ilustrasi utama dari /claude-imagegen
    gains: [                                   // tiga manfaat, ikon dari Phosphor Icons tanpa awalan ph-
      { icon: 'lightbulb', title: 'Manfaat pertama', text: 'Apa yang bisa pembaca jelaskan setelah menguasai topik ini.' },
      { icon: 'compass', title: 'Manfaat kedua', text: 'Situasi sehari-hari yang jadi lebih mudah dipahami.' },
      { icon: 'briefcase', title: 'Manfaat ketiga', text: 'Peran kerja atau keputusan yang memakai topik ini.' },
    ],
    askSuggestions: ['Pertanyaan contoh untuk Tanya AI?'],
  },

  // Kelompok modul, maksimal empat (warna --ch1 sampai --ch4).
  chapters: [{ label: 'Bab 1', title: 'Nama bab', sub: 'Subjudul bab' }],

  source: 'Rujukan: Penulis, A. (Tahun). <em>Judul buku</em>. Penerbit.',
  footNote: 'Portal pendamping belajar. Hasil latihan tersimpan di browser ini saja.',

  // Gaya slide infografis untuk scripts/slide-briefs.cjs.
  visual: { accent: 'burnt orange', second: 'muted teal', setting: 'Indonesian characters and setting, soft natural light' },

  // Kamus istilah. Kunci huruf kecil. Dibuka saat istilah tebal atau chip istilah diklik.
  glossary: {
    'istilah utama': 'Definisi satu sampai dua kalimat dalam bahasa sehari-hari.',
  },

  // Diagram dari materi sumber. Ditempatkan di unit lewat unit.diagrams: [indeks].
  diagrams: [],

  // Teks untuk simulasi di sims.js, dikirim ke mount() sebagai kit.text.
  simulations: {},

  // Opsional, lihat references/content-schema.md: prep (halaman Persiapan), traps, essays, examFormat,
  // voices (gaya Formal dan Santai), game.badges (lencana khusus topik).

  modules: [
    {
      title: 'Judul modul',               // istilah kunci, boleh Inggris bila itu bentuk yang umum
      short: 'Pokok bahasan',              // judul pendek untuk menu dan peta pokok bahasan
      hook: 'Satu kalimat cerita yang membuat orang penasaran.',
      goal: 'Menjelaskan ... (satu tujuan belajar yang bisa diuji).',
      trap: 'Batas atau salah kaprah yang perlu diingat.',
      chapter: 0,                          // indeks di chapters
      terms: ['istilah utama'],            // chip istilah di bagian Inti

      // Bagian 1: Inti. Satu cerita sehari-hari, lalu konsepnya, lalu peta cerita ke istilah.
      inti: {
        art: '',                           // opsional, ilustrasi cerita
        beats: [['Situasi', 'Kalimat situasi.'], ['Yang terjadi', 'Kalimat kejadian.'], ['Mengapa penting', 'Kalimat alasan.']],
        concept: '**Istilah utama** adalah definisi singkat yang memakai cerita di atas.',
        mapping: [['Unsur cerita', 'Istilah teknis']],
        recall: 'Dengan bahasamu sendiri: pertanyaan yang meminta pembaca menjelaskan ulang cerita memakai istilahnya.',
        answer: 'Contoh penjelasan yang baik, dua sampai tiga kalimat.',
      },

      // Bagian 2: Pendalaman. Tiap unit memakai pola mikro yang sama.
      sections: [
        {
          title: 'Judul sub-modul',
          brief: 'Satu kalimat ringkasan, juga tampil sebagai catatan di mindmap.',
          slide: {                         // opsional, gambar slide-mMM-KK dibuat lewat /claude-imagegen
            points: [['eye', 'Sebelum: ...'], ['arrow-right', 'Lalu: ...'], ['check', 'Sesudah: ...']],
            takeaway: '**Istilah utama**: inti satu kalimat.',
            scenes: ['scene for panel 1 in English', 'scene for panel 2', 'scene for panel 3'],
          },
          question: 'Pertanyaan pemantik dari situasi sehari-hari?',
          example: 'Satu kalimat pembuka contoh.',
          steps: ['Sebelum: ...', 'Lalu: ...', 'Hasilnya: ...'],
          note: '',                        // opsional, catatan kecil di bawah contoh
          define: '**Istilah utama** adalah ...',
          contrast: '',                    // opsional, tampil sebagai "Yang sering tertukar"
          lecturer: '',                    // opsional, tampil sebagai "Poin penting"
          check: { q: 'Pertanyaan cek cepat?', a: 'Jawaban singkat beserta alasannya.' },
          // opsional: symbols: [['$h$', 'hipotesis']], mistakes: ['Kesalahan yang sering terjadi.'],
          // derive: { intro, steps: [{ prompt, options: [...], key, show, why, hint }] }, informal: { question }
          // opsional: diagrams: [0], art: { name, alt, caption }, sim: 'nama', tiles: [['Nama', 'Keterangan']]
        },
      ],

      // Bagian 3: Cek pemahaman. Lima soal, lima opsi, key = indeks opsi benar (0 sampai 4).
      quiz: [1, 2, 3, 4, 5].map(n => ({
        text: `Soal ${n}: ganti dengan soal kasus singkat.`,
        options: ['Jawaban benar', 'Pengecoh 1', 'Pengecoh 2', 'Pengecoh 3', 'Pengecoh 4'],
        key: 0,
        why: 'Kenapa jawaban benar itu benar, dan kenapa pengecoh terkuat keliru.',
      })),
    },
  ],
};
