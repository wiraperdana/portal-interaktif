#!/usr/bin/env python3
"""QA otomatis portal belajar hasil boilerplate /portal-interaktif.

Pakai:
  python3 qa.py <folder-portal>                      # periksa satu portal
  python3 qa.py <folder-portal> --compare <folder-b>  # bandingkan struktur dua portal, halaman demi halaman

Butuh Playwright untuk Python dan Chromium headless:
  pip install playwright && playwright install chromium-headless-shell

Yang diperiksa, dan kenapa:
- Notasi matematika: rumus KaTeX yang error atau $...$ yang tidak dirender.
  1. Error JavaScript di setiap rute. Satu error bisa membuat seluruh halaman kosong.
  2. Rasio gambar. Gambar yang tampil gepeng membuat diagram sulit dibaca.
  3. Scroll horizontal di lebar HP 390 px. Pembaca HP tidak boleh menggeser layar ke samping.
  4. Node mindmap yang saling tumpuk. Label yang bertumpuk tidak terbaca.
  5. Alur selesai modul: lima soal dijawab benar plus penjelasan 40 karakter harus menandai modul selesai.
  6. Isi wajib tiap modul: Inti, Pendalaman, Cek pemahaman, kuis 5 soal x 5 opsi.
Kode keluar 0 berarti semua lolos.
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright

SIG_JS = """() => {
  const q = s => document.querySelectorAll(s).length;
  const m = document.querySelector('#main');
  return { units: q('#main .unit'), figures: q('#main .figure'), art: q('#main .art'), slides: q('#main .unit-slide'),
    sims: q('#main .sim'), mm: q('#main .mmx-node'), parts: q('#main .part'), chips: q('#main .chip'),
    beats: q('#main .beat'), mapping: q('#main .mapping-table li'), qdots: q('#main .qdot'),
    text: (m ? m.innerText : '').replace(/\\s+/g, ' ').trim().length };
}"""
# Gambar ber-object-fit cover (ilustrasi cerita di Inti) sengaja dipotong, bukan gepeng, jadi tidak dihitung.
RATIO_JS = """() => [...document.querySelectorAll('#main img')].filter(i => i.complete && i.naturalWidth && i.clientWidth && getComputedStyle(i).objectFit !== 'cover')
  .map(i => ({ src: i.getAttribute('src'), want: i.naturalWidth / i.naturalHeight, got: i.clientWidth / i.clientHeight }))
  .filter(r => Math.abs(r.want - r.got) / r.want > 0.02)"""
# Notasi matematika: rumus KaTeX yang gagal, atau pasangan $...$ yang tidak dirender (KaTeX tidak termuat).
MATH_JS = r"""() => { const w = document.createTreeWalker(document.querySelector('#main') || document.body, NodeFilter.SHOW_TEXT);
  let raw = 0, sample = ''; for (let n; (n = w.nextNode());) { const p = n.parentElement;
    if (!p || p.closest('textarea, script, style, code, pre, .katex')) continue;
    if (/\$[^$\s][^$]*\$/.test(n.data)) { raw++; sample = sample || n.data.slice(0, 60); } }
  return { errors: document.querySelectorAll('#main .katex-error').length, raw, sample }; }"""

OVERLAP_JS = """() => { let n = 0; document.querySelectorAll('.mmx:not(.is-outline)').forEach(map => {
  const r = [...map.querySelectorAll('.mmx-node')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect());
  for (let a = 0; a < r.length; a++) for (let b = a + 1; b < r.length; b++) {
    const x = Math.min(r[a].right, r[b].right) - Math.max(r[a].left, r[b].left), y = Math.min(r[a].bottom, r[b].bottom) - Math.max(r[a].top, r[b].top);
    if (x > 2 && y > 2) n++; } }); return n; }"""


def routes(page):
    n = page.evaluate("(window.CONTENT || window.PORTAL).modules.length")
    return ['#/', '#/kursus', '#/latihan', '#/tanya'] + [f'#/modul/{i}' for i in range(1, n + 1)]


def visit(page, url, route):
    page.goto(f'{url}{route}')
    page.wait_for_timeout(350)
    # buka semua cabang mindmap supaya tumpukan label ikut terperiksa
    for _ in range(2):  # tombol tunggal: lipat dulu bila ada cabang terbuka, lalu buka semua
        page.evaluate("document.querySelectorAll('.mmx-all').forEach(b => { if (!/Buka/.test(b.getAttribute('aria-label') || '')) b.click(); })")
        page.evaluate("document.querySelectorAll('.mmx-all').forEach(b => { if (/Buka/.test(b.getAttribute('aria-label') || '')) b.click(); })")
        page.wait_for_timeout(120)


def check(folder):
    folder = pathlib.Path(folder).resolve()
    url = folder.joinpath('index.html').as_uri()
    fails, sigs = [], {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(viewport={'width': 1360, 'height': 900})
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.goto(url); page.wait_for_timeout(300)
        page.evaluate("localStorage.clear()")
        C = page.evaluate("window.CONTENT || null")
        # 6. isi wajib (hanya untuk portal berskema content.js)
        for i, m in enumerate(C['modules'] if C else []):
            tag = f'Modul {i + 1:02d}'
            if len(m.get('quiz', [])) != 5: fails.append(f'{tag}: kuis {len(m.get("quiz", []))} soal, harus 5')
            for k, q in enumerate(m.get('quiz', [])):
                if len(q['options']) != 5: fails.append(f'{tag} soal {k + 1}: {len(q["options"])} opsi, harus 5')
            for key in ('beats', 'concept', 'mapping', 'recall', 'answer'):
                if not m['inti'].get(key): fails.append(f'{tag}: inti.{key} kosong')
            for k, u in enumerate(m['sections']):
                for key in ('title', 'brief', 'question', 'example', 'define', 'check'):
                    if not u.get(key): fails.append(f'{tag} unit {k + 1}: {key} kosong')
        for r in routes(page):
            errs.clear(); visit(page, url, r)
            sigs[r] = page.evaluate(SIG_JS)
            if errs: fails.append(f'{r}: error JS {errs[0]}')
            bad = page.evaluate(RATIO_JS)
            if bad: fails.append(f'{r}: {len(bad)} gambar rasionya berubah, contoh {bad[0]["src"]}')
            ov = page.evaluate(OVERLAP_JS)
            if ov: fails.append(f'{r}: {ov} pasang node mindmap bertumpuk')
            mx = page.evaluate(MATH_JS)
            if mx['errors']: fails.append(f'{r}: {mx["errors"]} rumus KaTeX gagal dirender')
            if mx['raw']: fails.append(f'{r}: {mx["raw"]} teks $...$ tidak dirender, contoh "{mx["sample"]}"')
        # 3. lebar HP
        page.set_viewport_size({'width': 390, 'height': 844})
        for r in routes(page):
            visit(page, url, r)
            w = page.evaluate("document.documentElement.scrollWidth")
            if w > 391: fails.append(f'{r}: scroll horizontal di 390 px (lebar {w})')
        # 5. alur selesai modul 1
        quiz = C['modules'][0]['quiz'] if C else page.evaluate("window.MODULE_QUESTIONS[0]")
        page.set_viewport_size({'width': 1360, 'height': 900})
        page.goto(f'{url}#/modul/1/cek-soal'); page.wait_for_timeout(300)
        for k, q in enumerate(quiz):
            page.click(f'#quiz .qdot[data-go="{k}"]')
            page.click(f'#quiz .option[data-k="{q["key"]}"]')
        page.fill('#recall', 'Penjelasan uji otomatis yang panjangnya lebih dari empat puluh karakter.')
        page.wait_for_timeout(200)
        done = page.evaluate("document.querySelector('#completePanel')?.classList.contains('is-done')")
        if not done: fails.append('Alur selesai: Modul 01 tidak tertandai selesai setelah kuis benar dan penjelasan ditulis')
        b.close()
    return fails, sigs


def main():
    args = sys.argv[1:]
    if not args: print(__doc__); sys.exit(2)
    fails, sigs = check(args[0])
    if '--compare' in args:
        other = args[args.index('--compare') + 1]
        _, sigs_b = check(other)
        for r in sigs:
            if r in sigs_b and sigs[r] != sigs_b[r]:
                diff = {k: (sigs[r][k], sigs_b[r].get(k)) for k in sigs[r] if sigs[r][k] != sigs_b[r].get(k)}
                print(f'BEDA {r}: {json.dumps(diff, ensure_ascii=False)}')
    for f in fails: print('GAGAL', f)
    print(f'{len(fails)} masalah. {len(sigs)} rute diperiksa.')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
