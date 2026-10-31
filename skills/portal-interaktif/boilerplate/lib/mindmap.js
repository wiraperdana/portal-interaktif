/*!
 * mindmap-html v0.1.0
 * Mindmap interaktif ringan bergaya XMind, tanpa dependensi.
 * Lisensi MIT. https://github.com/wiraperdana/mindmap-html
 *
 * Pakai:
 *   const mm = MindmapHTML.render(hostElement, data, options);
 *   mm.expandAll(); mm.collapseAll(); mm.destroy();
 *
 * Bentuk data (pohon):
 *   { label, note?, num?, href?, color?, id?, open?, attrs?, kids?: [ ...node ] }
 *   - id     : kunci state lipat. Bila kosong, dibuat dari posisi node.
 *   - open   : keadaan awal untuk node yang punya anak (default false).
 *   - color  : warna cabang; diwariskan ke semua keturunan. Bila kosong, diambil dari palet.
 *   - href   : node menjadi tautan.
 *   - attrs  : atribut tambahan pada elemen node, misalnya { 'data-term': 'erp' }.
 */
(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const DEFAULTS = {
    layout: 'auto',         // 'auto' | 'both' | 'right'. auto: dua sisi, lalu satu sisi begitu ada cabang tingkat 2 terbuka
    narrow: 720,            // di bawah lebar ini (px) peta berubah menjadi kerangka bertingkat
    minScale: 0.72,         // skala terkecil sebelum wadah boleh digulir horizontal
    storageKey: null,       // kunci localStorage untuk menyimpan state lipat; null = tidak disimpan
    toolbar: true,          // satu tombol lipat/buka semua yang ikonnya mengikuti keadaan
    tipAttr: 'title',       // atribut untuk keterangan tombol, misalnya 'data-tip' bila halaman punya tooltip sendiri
    palette: ['var(--mmx-c1)', 'var(--mmx-c2)', 'var(--mmx-c3)', 'var(--mmx-c4)', 'var(--mmx-c5)', 'var(--mmx-c6)', 'var(--mmx-c7)', 'var(--mmx-c8)'],
    labels: {
      expandAll: 'Buka semua cabang',
      collapseAll: 'Lipat semua cabang',
      expand: n => `Buka ${n} cabang`,
      collapse: 'Lipat cabang',
    },
    // ikon SVG sederhana; bisa diganti HTML ikon lain
    icons: {
      expandAll: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v7M9 7l3 3 3-3M12 21v-7M9 17l3-3 3 3M4 12h16"/></svg>',
      collapseAll: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6M9 6l3 3 3-3M12 21v-6M9 18l3-3 3 3M4 12h16"/></svg>',
    },
    onRender: null,         // dipanggil setiap peta selesai digambar: (host, mindmap) => {}
    onToggle: null,         // dipanggil setiap node dilipat atau dibuka: (node, open) => {}
  };

  class Mindmap {
    constructor(host, data, options) {
      const o = options || {};
      this.o = Object.assign({}, DEFAULTS, o, {
        labels: Object.assign({}, DEFAULTS.labels, o.labels),
        icons: Object.assign({}, DEFAULTS.icons, o.icons),
      });
      this.host = host;
      this.data = data;
      this.normalize(data, 'r', 0, null);
      this.state = this.load();
      host.classList.add('mmx');
      host.setAttribute('role', 'group');
      if (!host.getAttribute('aria-label')) host.setAttribute('aria-label', `Mindmap ${data.label}`);
      this.narrowNow = host.clientWidth < this.o.narrow;
      this.draw();
      this.ro = new ResizeObserver(() => {
        const n = host.clientWidth < this.o.narrow;
        if (n !== this.narrowNow) { this.narrowNow = n; this.draw(); } else if (!n) this.fit();
      });
      this.ro.observe(host);
    }

    // ---- data dan state ----
    // Beri id dan kedalaman, lalu tentukan warna: cabang utama dari palet bila kosong, keturunan mewarisi induknya.
    normalize(n, path, depth, inherited, index) {
      n._id = n.id || path;
      n._depth = depth;
      n._color = depth === 0 ? null : (n.color || (depth === 1 ? this.o.palette[index % this.o.palette.length] : inherited));
      (n.kids || []).forEach((k, i) => this.normalize(k, `${path}.${i}`, depth + 1, n._color, i));
    }
    load() {
      if (!this.o.storageKey) return {};
      try { return JSON.parse(localStorage.getItem(this.o.storageKey)) || {}; } catch (e) { return {}; }
    }
    save() {
      if (!this.o.storageKey) return;
      try { localStorage.setItem(this.o.storageKey, JSON.stringify(this.state)); } catch (e) { /* penyimpanan tidak tersedia */ }
    }
    hasKids(n) { return !!(n.kids && n.kids.length); }
    isOpen(n) { return n._depth === 0 || !this.hasKids(n) ? true : (n._id in this.state ? this.state[n._id] : !!n.open); }
    foldables() {
      const out = [];
      const walk = n => { if (n._depth > 0 && this.hasKids(n)) out.push(n); (n.kids || []).forEach(walk); };
      walk(this.data);
      return out;
    }
    anyOpen() { return this.foldables().some(n => this.isOpen(n)); }
    toggle(n) {
      this.state[n._id] = !this.isOpen(n);
      this.save();
      if (this.o.onToggle) this.o.onToggle(n, this.state[n._id]);
      this.draw();
    }
    setAll(open) { this.foldables().forEach(n => { this.state[n._id] = open; }); this.save(); this.draw(); }
    expandAll() { this.setAll(true); }
    collapseAll() { this.setAll(false); }
    destroy() { this.ro.disconnect(); this.host.innerHTML = ''; }

    // ---- elemen ----
    nodeEl(n) {
      const tag = n.href ? 'a' : n.attrs ? 'button' : 'div';
      const el = document.createElement(tag);
      el.className = `mmx-node d${Math.min(n._depth, 3)}`;
      if (n.href) el.href = n.href;
      if (tag === 'button') el.type = 'button';
      Object.entries(n.attrs || {}).forEach(([k, v]) => { if (v != null) el.setAttribute(k, v); });
      el.innerHTML = `${n.num ? `<span class="mmx-num">${esc(n.num)}</span>` : ''}<span class="mmx-label">${esc(n.label)}</span>${n.note ? `<span class="mmx-note">${esc(n.note)}</span>` : ''}`;
      return el;
    }
    foldEl(n, open) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mmx-fold';
      b.setAttribute('aria-expanded', String(open));
      const tip = open ? this.o.labels.collapse : this.o.labels.expand(n.kids.length);
      b.setAttribute('aria-label', `${tip}: ${n.label}`);
      b.setAttribute(this.o.tipAttr, tip);
      if (this.o.tipAttr === 'data-tip') b.setAttribute('data-tip-pos', 'bottom');
      b.innerHTML = open ? '&minus;' : `+<small>${n.kids.length}</small>`;
      b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.toggle(n); });
      return b;
    }
    toolbarEl() {
      const open = this.anyOpen();
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mmx-all';
      const tip = open ? this.o.labels.collapseAll : this.o.labels.expandAll;
      b.setAttribute('aria-label', tip);
      b.setAttribute(this.o.tipAttr, tip);
      if (this.o.tipAttr === 'data-tip') b.setAttribute('data-tip-pos', 'bottom');
      b.innerHTML = open ? this.o.icons.collapseAll : this.o.icons.expandAll;
      b.addEventListener('click', () => this.setAll(!open));
      return b;
    }

    // ---- gambar ----
    draw() {
      this.host.innerHTML = '';
      if (this.narrowNow) this.drawOutline(); else this.drawMap();
      if (this.o.toolbar && this.foldables().length) this.host.prepend(this.toolbarEl());
      if (this.o.onRender) this.o.onRender(this.host, this);
    }

    // Kerangka bertingkat untuk layar sempit.
    drawOutline() {
      this.host.classList.add('is-outline');
      this.host.style.height = '';
      const wrap = document.createElement('div');
      wrap.className = 'mmo';
      wrap.append(this.nodeEl(this.data));
      const list = (kids, depth) => {
        const ul = document.createElement('ul');
        ul.className = `mmo-l${Math.min(depth, 3)}`;
        kids.forEach(k => {
          const li = document.createElement('li');
          if (k._color) li.style.setProperty('--c', k._color);
          const row = document.createElement('div');
          row.className = 'mmo-row';
          row.append(this.nodeEl(k));
          const open = this.isOpen(k);
          if (this.hasKids(k)) { const f = this.foldEl(k, open); f.classList.add('in-outline'); row.append(f); }
          li.append(row);
          if (this.hasKids(k) && open) li.append(list(k.kids, depth + 1));
          ul.append(li);
        });
        return ul;
      };
      wrap.append(list(this.data.kids || [], 1));
      this.host.append(wrap);
    }

    // Peta bergaya XMind: posisi dihitung dari ukuran node yang sudah dirender.
    drawMap() {
      const host = this.host;
      host.classList.remove('is-outline');
      const canvas = document.createElement('div');
      canvas.className = 'mmx-canvas';
      canvas.style.width = '4000px'; // lebar sementara agar node diukur dengan lebar alaminya
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'mmx-links');
      svg.setAttribute('aria-hidden', 'true');
      canvas.append(svg);
      host.append(canvas);

      // 1. render node yang terlihat untuk diukur
      const build = n => {
        const el = this.nodeEl(n);
        if (n._color) el.style.setProperty('--c', n._color);
        canvas.append(el);
        const open = this.isOpen(n);
        return { n, el, depth: n._depth, color: n._color, open, kids: open ? (n.kids || []).map(build) : [] };
      };
      const root = build(this.data);
      const all = [];
      const walk = r => { all.push(r); r.kids.forEach(walk); };
      walk(root);
      const FOLD_W = 40, FOLD_OPEN_W = 18;
      all.forEach(r => { r.w = r.el.offsetWidth; r.h = r.el.offsetHeight; r.fw = r.depth > 0 && this.hasKids(r.n) ? FOLD_W : 0; });

      // 2. tata letak: dua sisi, atau satu sisi bila ada cabang tingkat 2 ke atas yang terbuka
      const deepOpen = this.foldables().some(n => n._depth >= 2 && this.isOpen(n));
      const layout = this.o.layout === 'auto' ? (deepOpen ? 'right' : 'both') : this.o.layout;
      const GAP = [0, 22, 12, 4, 4, 4];
      const gap = d => GAP[Math.min(d, GAP.length - 1)];
      const sub = r => (r.sub = r.kids.length ? Math.max(r.h, r.kids.reduce((s, k) => s + sub(k), 0) + gap(r.depth + 1) * (r.kids.length - 1)) : r.h);
      root.kids.forEach(sub);
      const total = root.kids.reduce((s, k) => s + k.sub, 0);
      const count = root.kids.length;
      let left = 0, acc = 0;
      while (left < count - 1 && (left === 0 || acc + root.kids[left].sub / 2 <= total / 2)) { acc += root.kids[left].sub; left++; }
      if (count === 1 || layout === 'right') left = 0;
      root.kids.forEach((k, i) => { k.side = i < left ? -1 : 1; });
      const setSide = r => r.kids.forEach(k => { k.side = r.side; setSide(k); });
      root.kids.forEach(setSide);

      // 3. kolom per kedalaman, per sisi
      const HGAP = [0, 48, 44, 40, 36, 36];
      const maxDepth = Math.max(...all.map(r => r.depth));
      const colX = {};
      [-1, 1].forEach(side => {
        let x = root.w / 2;
        for (let d = 1; d <= maxDepth; d++) {
          const nodes = all.filter(r => r.depth === d && r.side === side);
          if (!nodes.length) break;
          x += HGAP[Math.min(d, HGAP.length - 1)];
          colX[`${side}:${d}`] = x;
          x += Math.max(...nodes.map(r => r.w + r.fw));
        }
      });
      const place = (r, top) => {
        r.cy = top + r.sub / 2;
        const kidsH = r.kids.reduce((s, k) => s + k.sub, 0) + gap(r.depth + 1) * Math.max(0, r.kids.length - 1);
        let y = top + (r.sub - kidsH) / 2;
        r.kids.forEach(k => { place(k, y); y += k.sub + gap(k.depth); });
      };
      [-1, 1].forEach(side => {
        const kids = root.kids.filter(k => k.side === side);
        const h = kids.reduce((s, k) => s + k.sub, 0) + gap(1) * Math.max(0, kids.length - 1);
        let y = -h / 2;
        kids.forEach(k => { place(k, y); y += k.sub + gap(1); });
      });
      root.cy = 0;
      all.forEach(r => {
        if (r.depth === 0) r.x = -r.w / 2;
        else { const c = colX[`${r.side}:${r.depth}`]; r.x = r.side > 0 ? c : -c - r.w; }
        r.y = r.cy - r.h / 2;
      });

      // 4. geser ke koordinat positif, tempatkan node, garis, dan tombol lipat
      const PAD = 12, TOP = this.o.toolbar ? 44 : 12;
      const minX = Math.min(...all.map(r => r.x - (r.side < 0 ? r.fw : 0))), minY = Math.min(...all.map(r => r.y));
      const maxX = Math.max(...all.map(r => r.x + r.w + (r.side > 0 ? r.fw : 0))), maxY = Math.max(...all.map(r => r.y + r.h));
      const W = maxX - minX + PAD * 2, H = maxY - minY + PAD + TOP;
      all.forEach(r => { r.x += PAD - minX; r.y += TOP - minY; r.el.style.left = `${r.x}px`; r.el.style.top = `${r.y}px`; });
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      // titik keluar garis: tengah untuk akar dan cabang utama (kapsul), garis bawah untuk tingkat berikutnya
      const anchorY = r => (r.depth <= 1 ? r.y + r.h / 2 : r.y + r.h - 1);
      const STROKE = [0, 3, 2, 1.25, 1, 1];
      let paths = '';
      all.forEach(p => p.kids.forEach(k => {
        const s = k.side;
        const off = p.fw && p.open ? FOLD_OPEN_W + 4 : 0; // garis anak berangkat dari ujung tombol lipat
        const x1 = s > 0 ? p.x + p.w + off : p.x - off, y1 = anchorY(p);
        const x2 = s > 0 ? k.x : k.x + k.w, y2 = anchorY(k);
        const mx = (x1 + x2) / 2;
        paths += `<path d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" stroke="${k.color}" stroke-width="${STROKE[Math.min(k.depth, STROKE.length - 1)]}" fill="none" stroke-linecap="round"/>`;
      }));
      svg.innerHTML = paths;
      all.filter(r => r.fw).forEach(r => {
        const b = this.foldEl(r.n, r.open);
        b.style.top = `${anchorY(r) - 9}px`;
        b.style.setProperty('--c', r.color);
        canvas.append(b);
        b.style.left = `${r.side > 0 ? r.x + r.w + 4 : r.x - 4 - b.offsetWidth}px`;
      });
      this.W = W; this.H = H;
      this.fit();
    }

    // Kecilkan peta agar muat lebar wadah, paling kecil minScale. Di bawah itu, wadah boleh digulir.
    fit() {
      const canvas = this.host.querySelector('.mmx-canvas');
      if (!canvas) return;
      const scale = Math.max(this.o.minScale, Math.min(1, this.host.clientWidth / this.W));
      canvas.style.transform = `scale(${scale})`;
      canvas.style.left = `${Math.max(0, (this.host.clientWidth - this.W * scale) / 2)}px`;
      this.host.style.height = `${this.H * scale}px`;
    }
  }

  global.MindmapHTML = { version: '0.1.0', render: (host, data, options) => new Mindmap(host, data, options), Mindmap };
})(typeof window !== 'undefined' ? window : globalThis);
