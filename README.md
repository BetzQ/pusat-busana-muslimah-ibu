# Pusat Busana Muslimah Ibu

Aplikasi web mobile-first yang sangat lengkap untuk pemilik usaha/konveksi baju Muslimah (khusus pengguna usia 50+). Satu pintu: Ide Tren, Hitungan Produksi, Coret Gambar Pola untuk Tukang Jahit, & Direktori Supplier Konveksi Muslimah.

## 🎯 Fitur Utama

### 1. Tren Baju Baru
- Katalog 16+ model baju Muslimah terpilih (Gamis, Abaya, Tunik, Kaftan, One-Set, Khimar, Mukena)
- Filter momen 1-klik (Lagi Viral, Persiapan Lebaran & Pesta, Harian & Pengajian, Tunik & One-Set Aktif)
- Detail spesifikasi lengkap (bahan, pola, busui/wudhu friendly, tingkat kesulitan)
- Tombol "Bacakan Info" dengan Web Speech API (Indonesia)
- Tombol "Coret / Tandai Gambar" di setiap produk

### 2. Studio Coret Gambar (Canvas Annotator)
- Coret-coret langsung di canvas dengan jari/sentuhan
- Alat: Coret Bebas, Lingkaran, Panah
- Warna spidol: Merah Terang, Kuning Stabilo, Biru, Putih
- Stempel teks instan tanpa ketik: "Ganti Resleting Busui", "Lengan Karet", "Ikuti Kerah Ini", "Lebarkan Bawah"
- Undo & Bersihkan Semua
- Upload foto dari HP untuk dicoret
- Download hasil coretan (PNG)
- Kirim ke WhatsApp (Web Share API atau download + wa.me)
- Anti-CORS untuk canvas export

### 3. Hitung Kain & Modal (Kalkulator Klak-Klik)
- Pilih model, ukuran (Standar LD 105, XL LD 115, Jumbo LD 125), jumlah (1 potong, 1 seri 4 pcs, setengah kodi 10 pcs, 1 kodi 20 pcs)
- Checklist modifikasi 1-klik
- Hitung real-time: kebutuhan kain utama & furing, HPP per potong & total, estimasi jual, estimasi untung
- 1-Click WhatsApp Note Builder
- Tombol: Kirim ke WhatsApp, Buka Grup WA, Salin Teks

### 4. Toko Bahan & Printilan (5 Direktori)
1. Toko Kain Grosir Termurah (Tanah Abang, Cipadu, Pasar Baru/Bandung)
2. Aksesoris & Printilan Jahit (Resleting, Karet, Kancing, Renda, Benang, Label, Kemasan)
3. Alat Bantu Produksi (Gunting Elektrik, Steamer, Manekin, Lampu LED, Meteran Huruf Besar, Kapur Kain)
4. Makloon Jahit Borongan & Standar QC (Jakarta, Tangerang, Bandung, Pekalongan, Tasikmalaya + Checklist QC)
5. Sewa Toko vs Jualan dari Rumah (Perbandingan & Rekomendasi PO)

### 5. Integrasi WhatsApp
- Link Grup WA: https://chat.whatsapp.com/E85pWxWFfaJCimh9vxYv1j
- Tombol besar "BUKA GRUP CATATAN WA IBU" di top bar
- Auto-generate catatan lengkap untuk grup

## 🎨 Desain Khusus Usia 50+
- Font ukuran minimal 18px, label 20-24px, judul 24-28px
- Kontras tinggi (Krem #FFFDF9, Putih #FFFFFF, Hitam #111827, Hijau Zamrud Tua #065F46, Emas #B45309)
- Tombol besar min 48-56px, thumb-friendly
- Navigasi bawah 4 tab besar
- 100% klak-klik, minim ketik
- Web Speech API untuk baca info

## 🧪 QA Testing

Jalankan semua test:
```bash
npm test
```

Test suite meliputi:
- **QA Gate 1**: Validasi data JSON, whitelist/blacklist Muslimah, validasi produk
- **QA Gate 2**: UI mobile-first, aksesibilitas, ukuran tombol & font
- **QA Gate 3**: Canvas annotator, tools, stamps, export toDataURL
- **QA Gate 4**: Kalkulator, WA integration, rumus perhitungan

## 🚀 Development

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build
npm run build

# Preview
npm run preview

# Run QA tests
npm test
```

## 📁 Struktur Project

```
├── index.html          # Main HTML dengan semua tab & modal
├── src/
│   ├── main.js         # Logic aplikasi
│   ├── style.css       # Styling mobile-first senior-friendly
│   └── data/
│       └── modestFashionEngine.js
├── public/
│   ├── data/
│   │   └── database_konveksi.json
│   └── assets/
└── tests/
    ├── qa_stage1_data.test.js
    ├── qa_stage2_mobile_ui.test.js
    ├── qa_stage3_canvas_draw.test.js
    ├── qa_stage4_calculator_wa.test.js
    └── run_all_qa.js
```

## 🔗 Link Penting
- Grup WhatsApp Catatan Resmi: [https://chat.whatsapp.com/E85pWxWFfaJCimh9vxYv1j](https://chat.whatsapp.com/E85pWxWFfaJCimh9vxYv1j)

---

**Dibuat dengan ❤️ untuk ibu-ibu pemilik konveksi Muslimah**
