import { WA_GROUP_INVITE_URL, validateProduct } from './data/modestFashionEngine.js';

// Global state
let db = null;
let currentProduct = null;
let currentFilter = 'all';
let sizeMult = 1.0;
let qty = 1;
let selectedMods = new Set();
let canvas = null;
let ctx = null;
let drawing = false;
let currentTool = 'free';
let currentColor = '#ff0000';
let history = [];
let baseImage = null;
let currentStamp = null;

// Load database
async function loadDB() {
  try {
    const res = await fetch('/data/database_konveksi.json');
    db = await res.json();
    initApp();
  } catch (e) {
    console.error('Failed to load DB', e);
  }
}

function initApp() {
  renderFilterChips();
  renderTrenList();
  renderDirectories();
  initCalculator();
  initNavigation();
  initCanvas();
  initModals();
}

// Navigation
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      const tabId = btn.dataset.tab;
      document.getElementById(tabId).classList.add('active');
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// Filter chips
function renderFilterChips() {
  const chips = document.getElementById('filterChips');
  const moments = ['all', 'Lagi Viral Minggu Ini', 'Persiapan Lebaran & Pesta', 'Harian & Pengajian', 'Tunik & One-Set Aktif'];
  chips.innerHTML = '';
  
  moments.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip' + (m === 'all' ? ' active' : '');
    btn.textContent = m === 'all' ? 'Semua' : m;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = m;
      renderTrenList();
    });
    chips.appendChild(btn);
  });
}

// Render tren list
function renderTrenList() {
  const list = document.getElementById('trenList');
  list.innerHTML = '';
  
  let items = db.tren_baju || [];
  if (currentFilter !== 'all') {
    items = items.filter(x => x.kategori_momen === currentFilter);
  }
  
  items.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'tren-card';
    card.innerHTML = `
      <div class="tren-img-wrap">
        <img src="${prod.foto_utama}" alt="${prod.nama_model}" class="tren-img" crossorigin="anonymous" onerror="this.src='https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop'">
      </div>
      <div class="tren-body">
        <span class="tren-badge">${prod.kategori_momen} • ${prod.indikator_tren}</span>
        <h2 class="tren-title">${prod.nama_model}</h2>
        <div class="tren-info"><strong>Bahan:</strong> ${prod.spesifikasi_jahit.jenis_kain_utama}</div>
        <div class="tren-info"><strong>Kebutuhan Kain:</strong> ${prod.spesifikasi_jahit.kebutuhan_kain_standar_meter} meter (lebar 1.5m)</div>
        <div class="tren-info"><strong>Ongkos Jahit:</strong> Rp${prod.spesifikasi_jahit.ongkos_jahit_makloon.toLocaleString('id-ID')}</div>
        <div class="tren-info"><strong>Tingkat Kesulitan:</strong> ${prod.spesifikasi_jahit.tingkat_kesulitan_jahit}</div>
        <button class="big-btn" data-action="detail" data-id="${prod.id}">📋 Lihat Detail & Spesifikasi Lengkap</button>
        <button class="big-btn draw-btn" data-action="draw" data-id="${prod.id}" data-img="${prod.foto_utama}">✏️ Coret / Tandai Gambar Ini</button>
        <button class="big-btn speak-btn" data-action="speak" data-id="${prod.id}">🔊 Bacakan Info Ini</button>
      </div>
    `;
    list.appendChild(card);
  });
  
  list.querySelectorAll('[data-action="detail"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const prod = db.tren_baju.find(p => p.id === id);
      showDetail(prod);
    });
  });
  
  list.querySelectorAll('[data-action="draw"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.dataset.img;
      openCanvas(img);
    });
  });
  
  list.querySelectorAll('[data-action="speak"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const prod = db.tren_baju.find(p => p.id === id);
      speakProduct(prod);
    });
  });
}

// Show detail modal
function showDetail(prod) {
  currentProduct = prod;
  document.getElementById('modalTitle').textContent = prod.nama_model;
  const img = document.getElementById('modalImg');
  img.src = prod.foto_utama;
  img.crossOrigin = 'anonymous';
  
  const spec = document.getElementById('modalSpec');
  const s = prod.spesifikasi_jahit;
  spec.innerHTML = `
    <div class="spec-item"><strong>Kategori Momen:</strong> ${prod.kategori_momen}</div>
    <div class="spec-item"><strong>Indikator Tren:</strong> ${prod.indikator_tren}</div>
    <div class="spec-item"><strong>Jenis Kain Utama:</strong> ${s.jenis_kain_utama}</div>
    <div class="spec-item"><strong>Sifat Kain:</strong> ${s.sifat_kain}</div>
    <div class="spec-item"><strong>Perlu Furing:</strong> ${s.perlu_furing ? 'Ya - ' + s.penjelasan_furing : 'Tidak'}</div>
    <div class="spec-item"><strong>Potongan Pola:</strong> ${s.potongan_pola}</div>
    <div class="spec-item"><strong>Detail Busui:</strong> ${s.detail_busui}</div>
    <div class="spec-item"><strong>Detail Wudhu:</strong> ${s.detail_wudhu}</div>
    <div class="spec-item"><strong>Tingkat Kesulitan:</strong> ${s.tingkat_kesulitan_jahit}</div>
    <div class="spec-item"><strong>Kebutuhan Kain Standar:</strong> ${s.kebutuhan_kain_standar_meter} meter (lebar 1.5m)</div>
    <div class="spec-item"><strong>Kebutuhan Furing:</strong> ${s.kebutuhan_furing_meter} meter</div>
    <div class="spec-item"><strong>Harga Kain per Meter Grosir:</strong> Rp${s.harga_kain_per_meter_grosir.toLocaleString('id-ID')}</div>
    <div class="spec-item"><strong>Ongkos Jahit Makloon:</strong> Rp${s.ongkos_jahit_makloon.toLocaleString('id-ID')}</div>
    <div class="spec-item"><strong>Biaya Aksesoris/Resleting/Kancing:</strong> Rp${s.biaya_aksesoris_resleting_kancing.toLocaleString('id-ID')}</div>
    <div class="spec-item"><strong>Harga Jual Pasaran:</strong> Rp${s.harga_jual_pasaran_min.toLocaleString('id-ID')} - Rp${s.harga_jual_pasaran_max.toLocaleString('id-ID')}</div>
  `;
  
  document.getElementById('modalDetail').classList.add('active');
}

// Speak product
function speakProduct(prod) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const s = prod.spesifikasi_jahit;
    const text = `Model ${prod.nama_model}. Kategori ${prod.kategori_momen}. Bahan ${s.jenis_kain_utama}. Sifat kain ${s.sifat_kain}. Kebutuhan kain ${s.kebutuhan_kain_standar_meter} meter. Ongkos jahit ${s.ongkos_jahit_makloon} rupiah. Tingkat kesulitan ${s.tingkat_kesulitan_jahit}.`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'id-ID';
    utter.rate = 0.9;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  } else {
    alert('Browser tidak mendukung fitur baca suara');
  }
}

// Init modals
function initModals() {
  document.getElementById('modalBackdrop').addEventListener('click', () => {
    document.getElementById('modalDetail').classList.remove('active');
  });
  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('modalDetail').classList.remove('active');
  });
  
  document.getElementById('btnDrawFromModal').addEventListener('click', () => {
    if (currentProduct) {
      document.getElementById('modalDetail').classList.remove('active');
      openCanvas(currentProduct.foto_utama);
    }
  });
  
  document.getElementById('btnSpeak').addEventListener('click', () => {
    if (currentProduct) speakProduct(currentProduct);
  });
  
  document.getElementById('canvasBackdrop').addEventListener('click', () => {
    document.getElementById('modalCanvas').classList.remove('active');
  });
  document.getElementById('canvasClose').addEventListener('click', () => {
    document.getElementById('modalCanvas').classList.remove('active');
  });
}

// Init canvas
function initCanvas() {
  canvas = document.getElementById('drawCanvas');
  ctx = canvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    const wrap = document.getElementById('canvasWrap');
    canvas.width = wrap.clientWidth;
    canvas.height = 400;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Color buttons
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentColor = btn.dataset.color;
      currentStamp = null;
    });
  });
  
  // Tool buttons
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = btn.dataset.tool;
      currentStamp = null;
    });
  });
  
  // Stamp buttons
  document.querySelectorAll('.stamp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStamp = btn.dataset.stamp;
      currentTool = 'stamp';
    });
  });
  
  // Undo
  document.getElementById('btnUndo').addEventListener('click', () => {
    if (history.length > 0) {
      history.pop();
      redrawCanvas();
    }
  });
  
  // Clear
  document.getElementById('btnClear').addEventListener('click', () => {
    history = [];
    redrawCanvas();
  });
  
  // Download
  document.getElementById('btnDownload').addEventListener('click', () => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Catatan_Jahit_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      alert('✅ Gambar berhasil diunduh!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
  });
  
  // Share to WA
  document.getElementById('btnShareWA').addEventListener('click', async () => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'Catatan_Jahit.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Catatan Jahit - Pusat Busana Muslimah Ibu',
          text: 'Ini gambar hasil coretan untuk tukang jahit'
        });
      } else {
        const link = document.createElement('a');
        link.download = 'Catatan_Jahit.png';
        link.href = dataUrl;
        link.click();
        const text = encodeURIComponent('Ini gambar hasil coretan untuk tukang jahit - ' + WA_GROUP_INVITE_URL);
        window.open('https://wa.me/?text=' + text, '_blank');
        alert('Gambar diunduh. Silakan kirim manual ke Grup WA');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  });
  
  // Drawing events
  canvas.addEventListener('pointerdown', startDraw);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', endDraw);
  canvas.addEventListener('pointerleave', endDraw);
  
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('pointerdown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, { passive: false });
  
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('pointermove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, { passive: false });
  
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('pointerup', {});
    canvas.dispatchEvent(mouseEvent);
  }, { passive: false });
}

function openCanvas(imgUrl) {
  baseImage = new Image();
  baseImage.crossOrigin = 'anonymous';
  baseImage.src = imgUrl;
  baseImage.onload = () => {
    history = [];
    redrawCanvas();
    document.getElementById('modalCanvas').classList.add('active');
    
    // Switch to studio tab
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-btn')[1].classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-studio').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  baseImage.onerror = () => {
    baseImage = new Image();
    baseImage.src = imgUrl;
    baseImage.onload = () => {
      history = [];
      redrawCanvas();
      document.getElementById('modalCanvas').classList.add('active');
    };
  };
}

function redrawCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (baseImage) {
    const scale = Math.min(canvas.width / baseImage.width, canvas.height / baseImage.height);
    const w = baseImage.width * scale;
    const h = baseImage.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.drawImage(baseImage, x, y, w, h);
  }
  
  history.forEach(item => {
    ctx.save();
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (item.type === 'free') {
      ctx.beginPath();
      item.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    } else if (item.type === 'circle') {
      ctx.beginPath();
      const r = Math.sqrt(Math.pow(item.end.x - item.start.x, 2) + Math.pow(item.end.y - item.start.y, 2));
      ctx.arc(item.start.x, item.start.y, r, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (item.type === 'arrow') {
      const headlen = 15;
      const dx = item.end.x - item.start.x;
      const dy = item.end.y - item.start.y;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(item.start.x, item.start.y);
      ctx.lineTo(item.end.x, item.end.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(item.end.x, item.end.y);
      ctx.lineTo(item.end.x - headlen * Math.cos(angle - Math.PI/6), item.end.y - headlen * Math.sin(angle - Math.PI/6));
      ctx.lineTo(item.end.x - headlen * Math.cos(angle + Math.PI/6), item.end.y - headlen * Math.sin(angle + Math.PI/6));
      ctx.closePath();
      ctx.fill();
    } else if (item.type === 'stamp') {
      ctx.font = 'bold 28px Inter';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(item.text, item.x, item.y);
      ctx.fillText(item.text, item.x, item.y);
    }
    ctx.restore();
  });
}

let currentPath = [];
let startPos = null;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function startDraw(e) {
  const pos = getPos(e);
  drawing = true;
  
  if (currentTool === 'stamp' && currentStamp) {
    history.push({
      type: 'stamp',
      text: currentStamp,
      x: pos.x,
      y: pos.y,
      color: currentColor
    });
    redrawCanvas();
    drawing = false;
    return;
  }
  
  if (currentTool === 'free') {
    currentPath = [pos];
  } else if (currentTool === 'circle' || currentTool === 'arrow') {
    startPos = pos;
  }
}

function draw(e) {
  if (!drawing) return;
  const pos = getPos(e);
  
  if (currentTool === 'free') {
    currentPath.push(pos);
    // Draw current path preview
    ctx.save();
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (currentPath.length > 0) {
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
    }
    ctx.stroke();
    ctx.restore();
  }
}

function endDraw(e) {
  if (!drawing) return;
  const pos = getPos(e);
  
  if (currentTool === 'free' && currentPath.length > 0) {
    history.push({
      type: 'free',
      points: [...currentPath],
      color: currentColor
    });
    currentPath = [];
    redrawCanvas();
  } else if (currentTool === 'circle' && startPos) {
    history.push({
      type: 'circle',
      start: startPos,
      end: pos,
      color: currentColor
    });
    startPos = null;
    redrawCanvas();
  } else if (currentTool === 'arrow' && startPos) {
    history.push({
      type: 'arrow',
      start: startPos,
      end: pos,
      color: currentColor
    });
    startPos = null;
    redrawCanvas();
  }
  
  drawing = false;
}

// Calculator
function initCalculator() {
  // Populate model select
  const select = document.getElementById('calcModel');
  if (db) {
    db.tren_baju.forEach(prod => {
      const opt = document.createElement('option');
      opt.value = prod.id;
      opt.textContent = prod.nama_model;
      select.appendChild(opt);
    });
  }
  select.addEventListener('change', updateCalc);
  
  // Size buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sizeMult = parseFloat(btn.dataset.mult);
      updateCalc();
    });
  });
  
  // Qty buttons
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      qty = parseInt(btn.dataset.qty);
      updateCalc();
    });
  });
  
  // Mod buttons
  document.querySelectorAll('.check-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mod = btn.dataset.mod;
      if (selectedMods.has(mod)) {
        selectedMods.delete(mod);
        btn.classList.remove('active');
      } else {
        selectedMods.add(mod);
        btn.classList.add('active');
      }
      updateCalc();
    });
  });
  
  // WA buttons
  document.getElementById('btnKirimWA').addEventListener('click', () => {
    const text = document.getElementById('waText').value;
    const url = 'https://wa.me/?text=' + encodeURIComponent(text + '\n\n' + WA_GROUP_INVITE_URL);
    window.open(url, '_blank');
  });
  
  document.getElementById('btnBukaGrup').addEventListener('click', () => {
    window.open(WA_GROUP_INVITE_URL, '_blank');
  });
  
  document.getElementById('btnSalin').addEventListener('click', () => {
    const text = document.getElementById('waText').value;
    navigator.clipboard.writeText(text + '\n\nGrup WA: ' + WA_GROUP_INVITE_URL).then(() => {
      alert('✅ BERHASIL DISALIN! Sekarang buka Grup WA dan Tempel');
    });
  });
  
  updateCalc();
}

function updateCalc() {
  if (!db) return;
  const select = document.getElementById('calcModel');
  const prod = db.tren_baju.find(p => p.id === select.value);
  if (!prod) return;
  
  const s = prod.spesifikasi_jahit;
  let kainUtama = s.kebutuhan_kain_standar_meter * sizeMult;
  let kainFuring = s.kebutuhan_furing_meter * sizeMult;
  
  // Adjust for mods (simple)
  if (selectedMods.has('bahan_adem')) kainUtama = kainUtama * 0.95;
  if (selectedMods.has('ambil_atasan')) kainUtama = kainUtama * 0.6;
  
  kainUtama = Math.round(kainUtama * 100) / 100;
  kainFuring = Math.round(kainFuring * 100) / 100;
  
  const totalKain = kainUtama * qty;
  const totalFuring = kainFuring * qty;
  
  const biayaKain = kainUtama * s.harga_kain_per_meter_grosir;
  const biayaFuring = kainFuring * (s.harga_kain_per_meter_grosir * 0.6);
  const hppPer = biayaKain + biayaFuring + s.ongkos_jahit_makloon + s.biaya_aksesoris_resleting_kancing;
  const hppTotal = hppPer * qty;
  
  const jualAvg = (s.harga_jual_pasaran_min + s.harga_jual_pasaran_max) / 2;
  const untungPer = jualAvg - hppPer;
  const untungTotal = untungPer * qty;
  
  document.getElementById('resKain').textContent = kainUtama.toFixed(2) + ' m x ' + qty + ' = ' + totalKain.toFixed(2) + ' m';
  document.getElementById('resFuring').textContent = kainFuring > 0 ? (kainFuring.toFixed(2) + ' m x ' + qty + ' = ' + totalFuring.toFixed(2) + ' m') : '0 m (Tidak Perlu)';
  document.getElementById('resHppPer').textContent = 'Rp' + Math.round(hppPer).toLocaleString('id-ID');
  document.getElementById('resHppTotal').textContent = 'Rp' + Math.round(hppTotal).toLocaleString('id-ID');
  document.getElementById('resJual').textContent = 'Rp' + Math.round(jualAvg).toLocaleString('id-ID');
  document.getElementById('resUntung').textContent = 'Rp' + Math.round(untungPer).toLocaleString('id-ID');
  document.getElementById('resUntungTotal').textContent = 'Rp' + Math.round(untungTotal).toLocaleString('id-ID');
  
  // Build WA text
  let modText = [];
  if (selectedMods.has('resleting_busui')) modText.push('- Tambah Resleting Depan (Busui Friendly)');
  if (selectedMods.has('manset_karet')) modText.push('- Lengan Manset Karet (Wudhu Friendly)');
  if (selectedMods.has('saku_dalam')) modText.push('- Tambah Saku Kanan Dalam');
  if (selectedMods.has('bahan_adem')) modText.push('- Ganti Bahan Lebih Adem / Ekonomis');
  if (selectedMods.has('ambil_atasan')) modText.push('- Ambil Model Kerah/Atasannya Saja');
  if (selectedMods.has('jumbo_ld120')) modText.push('- Buat Ukuran Jumbo (LD 120)');
  if (selectedMods.has('gambar_coretan')) modText.push('- Sudah Ada Gambar Coretan untuk Tukang Jahit');
  if (modText.length === 0) modText.push('- Tidak ada modifikasi khusus');
  
  const wa = `CATATAN KONVEKSI - PUSAT BUSANA MUSLIMAH IBU

Model: ${prod.nama_model}
Bahan: ${s.jenis_kain_utama}
Kategori: ${prod.kategori_momen}

UKURAN & JUMLAH:
- Ukuran: ${document.querySelector('.size-btn.active').textContent}
- Jumlah: ${qty} ${qty === 1 ? 'Potong' : qty === 20 ? 'Kodi' : 'Pcs'}

METERAN KAIN:
- Kain Utama: ${kainUtama.toFixed(2)} m x ${qty} = ${totalKain.toFixed(2)} m
- Kain Furing: ${kainFuring > 0 ? kainFuring.toFixed(2) + ' m x ' + qty + ' = ' + totalFuring.toFixed(2) + ' m' : 'Tidak Perlu'}

HPP:
- HPP per Potong: Rp${Math.round(hppPer).toLocaleString('id-ID')}
- Total HPP: Rp${Math.round(hppTotal).toLocaleString('id-ID')}

HARGA PASAR:
- Estimasi Jual per Potong: Rp${Math.round(jualAvg).toLocaleString('id-ID')}
- Estimasi Untung per Potong: Rp${Math.round(untungPer).toLocaleString('id-ID')}
- Estimasi Untung Total: Rp${Math.round(untungTotal).toLocaleString('id-ID')}

MODIFIKASI:
${modText.join('\n')}

LINK GRUP WA CATATAN: ${WA_GROUP_INVITE_URL}`;
  
  document.getElementById('waText').value = wa;
}

// Render directories
function renderDirectories() {
  if (!db) return;
  const d = db.direktori_printilan;
  
  // Kain
  const dirKain = document.getElementById('dirKain');
  dirKain.innerHTML = '';
  d.toko_kain_grosir.forEach(item => {
    const div = document.createElement('div');
    div.className = 'dir-item';
    div.innerHTML = `
      <div class="dir-item-title">${item.nama}</div>
      <div class="dir-item-text">📍 ${item.lokasi}</div>
      <div class="dir-item-text">🏷️ Spesialisasi: ${item.spesialisasi.join(', ')}</div>
      <div class="dir-item-text">💰 ${item.kisaran_harga}</div>
      <div class="dir-item-text">💡 Tips: ${item.tips}</div>
    `;
    dirKain.appendChild(div);
  });
  
  // Aksesoris
  const dirAksesoris = document.getElementById('dirAksesoris');
  dirAksesoris.innerHTML = '';
  d.aksesoris_printilan.forEach(item => {
    const div = document.createElement('div');
    div.className = 'dir-item';
    div.innerHTML = `
      <div class="dir-item-title">${item.nama}</div>
      <div class="dir-item-text">💰 ${item.harga_grosir}</div>
      <div class="dir-item-text">📝 ${item.keterangan}</div>
    `;
    dirAksesoris.appendChild(div);
  });
  
  // Alat
  const dirAlat = document.getElementById('dirAlat');
  dirAlat.innerHTML = '';
  d.alat_bantu_produksi.forEach(item => {
    const div = document.createElement('div');
    div.className = 'dir-item';
    div.innerHTML = `
      <div class="dir-item-title">${item.nama}</div>
      <div class="dir-item-text">💰 ${item.harga_estimasi}</div>
      <div class="dir-item-text">🎯 ${item.kegunaan}</div>
    `;
    dirAlat.appendChild(div);
  });
  
  // Makloon
  const dirMakloon = document.getElementById('dirMakloon');
  dirMakloon.innerHTML = '';
  d.makloon_jahit_qc.forEach((item, idx) => {
    if (item.sentra) {
      const div = document.createElement('div');
      div.className = 'dir-item';
      div.innerHTML = `
        <div class="dir-item-title">${item.sentra}</div>
        <div class="dir-item-text">💰 Ongkos Jahit: ${item.ongkos_jahit_per_potong}</div>
        <div class="dir-item-text">📝 ${item.catatan}</div>
      `;
      dirMakloon.appendChild(div);
    }
  });
  
  const qcList = document.getElementById('qcList');
  qcList.innerHTML = '';
  if (d.makloon_jahit_qc.find(x => x.qc_checklist)) {
    d.makloon_jahit_qc.find(x => x.qc_checklist).qc_checklist.forEach(item => {
      const li = document.createElement('li');
      li.textContent = '✓ ' + item;
      qcList.appendChild(li);
    });
  }
  
  // Compare
  document.getElementById('sewaList').innerHTML = d.sewa_toko_vs_rumah.sewa_toko.rincian.map(x => `<li>• ${x}</li>`).join('');
  document.getElementById('sewaCost').textContent = 'Estimasi Modal Awal: ' + d.sewa_toko_vs_rumah.sewa_toko.estimasi_modal_awal;
  document.getElementById('poList').innerHTML = d.sewa_toko_vs_rumah.jual_dari_rumah_po.keunggulan.map(x => `<li>• ${x}</li>`).join('');
  document.getElementById('poCost').textContent = 'Estimasi Modal Awal: ' + d.sewa_toko_vs_rumah.jual_dari_rumah_po.estimasi_modal_awal;
  document.getElementById('poReco').textContent = 'Rekomendasi: ' + d.sewa_toko_vs_rumah.jual_dari_rumah_po.rekomendasi;
}

// Init upload
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        openCanvas(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
});

// Start app
loadDB();
