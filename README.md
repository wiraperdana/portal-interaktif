# portal-interaktif

Skill agent `/portal-interaktif` untuk mengubah bahan belajar (slide, transkrip, video, gambar, catatan) menjadi portal belajar interaktif statis berbahasa Indonesia.

Portal yang dihasilkan berjalan dari `file://` tanpa server, dan berisi:

- beranda topik dengan manfaat belajar dan mindmap tiga lapis yang bisa dilipat;
- modul berpola mikro: **Inti**, **Pendalaman**, **Cek pemahaman**;
- slide infografis per sub-modul yang dibuat lewat skill `/claude-imagegen`;
- kamus istilah, kuis 5 soal x 5 opsi, dan syarat selesai modul;
- pencarian, mode gelap, sidebar yang bisa dilipat, dan tampilan HP.

## Cara kerja singkat

Kode portal sudah jadi di `boilerplate/`. Agent hanya menulis `content.js`, membuat gambar, lalu menjalankan QA. Prosedur lengkapnya di [`skills/portal-interaktif/SKILL.md`](skills/portal-interaktif/SKILL.md).

```bash
skills/portal-interaktif/scripts/new-portal.sh ./portal-saya
# tulis portal-saya/content.js
node skills/portal-interaktif/scripts/image-sizes.cjs ./portal-saya
python3 skills/portal-interaktif/scripts/qa.py ./portal-saya
```

## Pemasangan

Symlink folder skill ke `~/.claude/skills/` (Claude Code) atau `~/.agents/skills/` (Codex dan harness lain).

## Ketergantungan

- Node.js untuk skrip, Python dengan Playwright untuk QA.
- [mindmap-html](https://github.com/wiraperdana/mindmap-html), disalin di `boilerplate/lib/`.
- Phosphor Icons dan font Geist dari CDN.
