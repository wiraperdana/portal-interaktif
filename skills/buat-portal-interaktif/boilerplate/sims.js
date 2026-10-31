// Simulasi interaktif portal. Berkas ini KHUSUS TOPIK: ganti atau kosongkan untuk topik baru.
//
// Kontrak: window.PORTAL_SIMS = { nama: { mount(wadah, kit) } }.
// - Unit di content.js memanggilnya lewat field sim: 'nama'.
// - wadah adalah <div class="sim-mount"> yang boleh diganti seluruhnya (outerHTML).
// - kit berisi $, $$, esc, dan text, yaitu content.js simulations[nama] (teks pengantar dan aturan model).
// Unit yang menyebut nama simulasi yang tidak terdaftar tidak menampilkan apa pun.
(() => {
'use strict';

// Contoh: simulasi bullwhip effect pada rantai pasok empat level, dua belas hari.
const bullwhipModel = function(c){const count=4,lead=c.lead,stocks=Array(count).fill(20),backlogs=Array(count).fill(0),forecast=Array(count).fill(10),previous=Array(count).fill(10),pipes=Array.from({length:count},()=>Array(lead).fill(10)),demands=[10,10,10,16,16,10,10,10,10,10,10,10],days=[];let cost=0;for(let t=0;t<demands.length;t++){const incoming=[demands[t],...previous.slice(0,3)],ships=[],orders=[];for(let i=0;i<count;i++){stocks[i]+=pipes[i].shift();backlogs[i]+=incoming[i];ships[i]=Math.min(stocks[i],backlogs[i]);stocks[i]-=ships[i];backlogs[i]-=ships[i];forecast[i]=c.alpha*(c.shared?demands[t]:incoming[i])+(1-c.alpha)*forecast[i];const position=stocks[i]+pipes[i].reduce((a,b)=>a+b,0)-backlogs[i];orders[i]=Math.max(0,Math.min(100,Math.round(forecast[i]*(lead+1+c.buffer)-position)));cost+=stocks[i]+backlogs[i]*4;}for(let i=0;i<count;i++){pipes[i].push(i===3?Math.min(24,orders[i]):ships[i+1]);previous[i]=orders[i];}days.push({day:t+1,demand:demands[t],stocks:[...stocks],backlogs:[...backlogs],orders:[...orders],ships:[...ships],pipeline:pipes.map(p=>[...p]),cost});}return days;};

const LEVELS = ['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer'];
function mountBullwhip(root, kit) {
  const { $, esc } = kit, txt = { intro: '', rules: [], ...kit.text };
  const sel = (id, label, opts) => `<div class="field"><label for="${id}">${label}</label><select id="${id}">${opts.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>`;
  root.outerHTML = `<section class="sim" id="simulasi">
    <header><small>Simulasi</small><h3>Jalankan supply chain selama dua belas hari</h3><p>${esc(txt.intro)} Demand customer naik dari 10 ke 16 pada hari 4 dan 5, lalu kembali ke 10.</p></header>
    <div class="sim-controls">
      ${sel('simData', 'Dasar forecast tiap level', [[0, 'Pesanan level berikutnya'], [1, 'Penjualan customer']])}
      ${sel('simLead', 'Lead time antarlevel', [[2, '2 hari'], [1, '1 hari'], [3, '3 hari']])}
      ${sel('simBuffer', 'Tambahan target persediaan', [[1, '1 × forecast harian'], [0, 'Tanpa tambahan'], [2, '2 × forecast harian']])}
      ${sel('simAlpha', 'Kecepatan forecast bereaksi', [[0.5, 'Sedang (α 0,5)'], [0.2, 'Lambat (α 0,2)'], [1, 'Langsung (α 1,0)']])}
    </div>
    <div class="sim-predict"><label for="simPredict">Prediksimu sebelum menjalankan</label><textarea id="simPredict" placeholder="Level mana yang pesanannya paling bergejolak? Mengapa?"></textarea></div>
    <div class="sim-bar">
      <button class="btn accent small" id="simStep" type="button"><i class="ph ph-play" aria-hidden="true"></i>Jalankan 1 hari</button>
      <button class="btn ghost small" id="simAll" type="button">Sampai hari 12</button>
      <button class="btn ghost small" id="simReset" type="button">Ubah skenario</button>
      <span class="day" id="simDay">Hari 0 dari 12</span>
    </div>
    <div class="sim-out" id="simOut"></div>
    <div class="sim-rules"><details class="reveal"><summary><i class="ph ph-caret-right" aria-hidden="true"></i>Aturan dan batas model</summary><div class="inner">${txt.rules.map(r => `<p>${esc(r)}</p>`).join('')}</div></details></div>
  </section>`;

  const ids = ['simData', 'simLead', 'simBuffer', 'simAlpha'];
  let days = null, shown = 0, cfg = null;
  const runs = [];
  const config = () => ({ shared: +$('#simData').value, lead: +$('#simLead').value, buffer: +$('#simBuffer').value, alpha: +$('#simAlpha').value });
  const lock = on => ids.forEach(id => { $('#' + id).disabled = on; });

  function advance(n) {
    if (!days) { cfg = config(); days = bullwhipModel(cfg); lock(true); }
    const before = shown;
    shown = Math.min(12, shown + n);
    if (shown === 12 && before < 12) {
      const peak = Math.max(...days.map(d => d.orders[3]));
      runs.unshift({ cfg, peak, cost: days[11].cost });
      runs.length = Math.min(runs.length, 5);
    }
    render();
  }
  function reset() { days = null; shown = 0; lock(false); render(); }

  function render() {
    $('#simDay').textContent = `Hari ${shown} dari 12`;
    $('#simStep').disabled = $('#simAll').disabled = shown === 12;
    const out = $('#simOut');
    if (!days || shown === 0) {
      out.innerHTML = `<p class="sim-empty">Pilih skenario, tulis prediksi, lalu jalankan. Pilihan dikunci selama satu percobaan supaya hasilnya bisa dibandingkan.</p>${runsTable()}`;
      return;
    }
    const seen = days.slice(0, shown);
    const pd = Math.max(...seen.map(d => d.demand));
    const pm = Math.max(...seen.map(d => d.orders[3]));
    const dm = seen.findIndex(d => d.orders[3] === pm) + 1;
    const last = seen[seen.length - 1];
    out.innerHTML = `
      <div class="stats">
        <div class="stat"><small>Puncak demand customer</small><strong>${pd}</strong> <span>unit/hari</span></div>
        <div class="stat"><small>Puncak pesanan manufacturer</small><strong>${pm}</strong> <span>hari ${dm}</span></div>
        <div class="stat"><small>Biaya kumulatif</small><strong>${last.cost.toLocaleString('id-ID')}</strong> <span>satuan hipotetis</span></div>
      </div>
      <div class="legend" aria-hidden="true"><span><i class="dash"></i>Demand customer</span>${LEVELS.map((l, k) => `<span><i style="background:var(--s${k + 1})"></i>${l}</span>`).join('')}</div>
      <div class="chart-wrap" id="chartWrap">${chart(days, shown)}</div>
      ${shown === 12 ? `<p class="sim-explain">${explain(pd, pm, dm)}</p>` : ''}
      <details class="reveal"><summary><i class="ph ph-caret-right" aria-hidden="true"></i>Lihat sebagai tabel</summary><div class="inner" style="overflow-x:auto"><table class="runs"><thead><tr><th>Hari</th><th>Demand</th>${LEVELS.map(l => `<th>${l}</th>`).join('')}<th>Biaya</th></tr></thead><tbody>${seen.map(d => `<tr><td class="num">${d.day}</td><td class="num">${d.demand}</td>${d.orders.map(o => `<td class="num">${o}</td>`).join('')}<td class="num">${d.cost}</td></tr>`).join('')}</tbody></table></div></details>
      ${runsTable()}`;
    bindHover(seen);
  }
  function explain(pd, pm, dm) {
    const ratio = (pm / pd).toLocaleString('id-ID', { maximumFractionDigits: 1 });
    const base = `Demand customer paling tinggi ${pd} unit per hari. Pesanan manufacturer memuncak di ${pm} unit pada hari ${dm}, sekitar ${ratio} kali puncak demand.`;
    const why = cfg.shared
      ? ' Setiap level memperbarui forecast dari penjualan customer yang sama. Sisa gejolak datang dari lead time dan target persediaan, yang tetap berlaku walau data dibagikan.'
      : ' Setiap level hanya melihat pesanan dari level di bawahnya, lalu menambah cadangannya sendiri. Tambahan itu terbaca sebagai permintaan oleh level berikutnya.';
    return esc(base + why + ' Bandingkan hasil ini dengan prediksimu, lalu ubah satu pilihan saja dan jalankan lagi.');
  }
  function runsTable() {
    if (!runs.length) return '';
    return `<div style="overflow-x:auto"><table class="runs"><caption class="sr">Perbandingan percobaan</caption><thead><tr><th>Dasar forecast</th><th>Lead time</th><th>Tambahan</th><th>α</th><th>Puncak manufacturer</th><th>Biaya</th></tr></thead><tbody>${runs.map(r => `<tr><td>${r.cfg.shared ? 'Penjualan customer' : 'Pesanan level berikutnya'}</td><td class="num">${r.cfg.lead} hari</td><td class="num">${r.cfg.buffer}×</td><td class="num">${String(r.cfg.alpha).replace('.', ',')}</td><td class="num">${r.peak}</td><td class="num">${r.cost.toLocaleString('id-ID')}</td></tr>`).join('')}</tbody></table></div>`;
  }

  // Grafik garis: sumbu x 12 hari tetap, sumbu y 0 sampai 100 (batas order model).
  const W = 720, H = 260, L = 36, R = 12, T = 12, B = 28, YMAX = 100;
  const x = d => L + (d - 1) * (W - L - R) / 11;
  const y = v => T + (1 - v / YMAX) * (H - T - B);
  function chart(all, n) {
    const seen = all.slice(0, n);
    const path = vals => vals.map((v, k) => `${k ? 'L' : 'M'}${x(k + 1).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const ticks = [0, 25, 50, 75, 100];
    const series = LEVELS.map((_, s) => `<path d="${path(seen.map(d => d.orders[s]))}" fill="none" stroke="var(--s${s + 1})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik pesanan harian empat level dan demand customer, hari 1 sampai ${n}">
      <g class="grid">${ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/>`).join('')}</g>
      <g class="axis">${ticks.map(t => `<text x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join('')}${Array.from({ length: 12 }, (_, k) => `<text x="${x(k + 1)}" y="${H - 8}" text-anchor="middle">${k + 1}</text>`).join('')}</g>
      <line class="base" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>
      ${series}
      <path d="${path(seen.map(d => d.demand))}" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="4 3"/>
      <line id="cross" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="var(--line-strong)" visibility="hidden"/>
      <rect id="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent"/>
    </svg><div class="tip" id="tip" hidden></div>`;
  }
  function bindHover(seen) {
    const wrap = $('#chartWrap'), svg = wrap.querySelector('svg'), tip = $('#tip'), cross = svg.querySelector('#cross');
    const move = e => {
      const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * W / r.width;
      const d = Math.max(1, Math.min(seen.length, Math.round((px - L) / ((W - L - R) / 11)) + 1));
      const row = seen[d - 1];
      cross.setAttribute('x1', x(d)); cross.setAttribute('x2', x(d)); cross.setAttribute('visibility', 'visible');
      tip.hidden = false;
      tip.innerHTML = `<div><strong>Hari ${d}</strong></div><div><span>Demand</span><b>${row.demand}</b></div>${LEVELS.map((l, k) => `<div><span>${l}</span><b>${row.orders[k]}</b></div>`).join('')}`;
      const left = x(d) * r.width / W;
      tip.style.left = `${Math.min(left + 12, r.width - tip.offsetWidth)}px`;
      tip.style.top = '8px';
    };
    svg.querySelector('#hit').addEventListener('pointermove', move);
    svg.querySelector('#hit').addEventListener('pointerleave', () => { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); });
  }

  $('#simStep').onclick = () => advance(1);
  $('#simAll').onclick = () => advance(12);
  $('#simReset').onclick = reset;
  render();
}

window.PORTAL_SIMS = { bullwhip: { mount: mountBullwhip } };
})();
