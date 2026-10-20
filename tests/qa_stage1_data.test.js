import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateProduct, isMuslimahProduct, WHITELIST_MUSLIMAH, BLACKLIST } from '../src/data/modestFashionEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('QA Gate 1 - Data JSON valid', () => {
  const dbPath = path.join(__dirname, '../public/data/database_konveksi.json');
  const raw = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(raw);
  
  assert.ok(db.tren_baju, 'tren_baju exists');
  assert.ok(db.direktori_printilan, 'direktori_printilan exists');
  assert.ok(db.tren_baju.length >= 12, `Need >=12 products, got ${db.tren_baju.length}`);
  
  const dirs = db.direktori_printilan;
  assert.ok(dirs.toko_kain_grosir && dirs.toko_kain_grosir.length >= 1, 'toko_kain_grosir exists');
  assert.ok(dirs.aksesoris_printilan && dirs.aksesoris_printilan.length >= 1, 'aksesoris_printilan exists');
  assert.ok(dirs.alat_bantu_produksi && dirs.alat_bantu_produksi.length >= 1, 'alat_bantu_produksi exists');
  assert.ok(dirs.makloon_jahit_qc && dirs.makloon_jahit_qc.length >= 1, 'makloon_jahit_qc exists');
  assert.ok(dirs.sewa_toko_vs_rumah, 'sewa_toko_vs_rumah exists');
});

test('QA Gate 1 - All products pass muslimah whitelist, no blacklist', () => {
  const dbPath = path.join(__dirname, '../public/data/database_konveksi.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  
  db.tren_baju.forEach((p, idx) => {
    const combined = p.nama_model + ' ' + (p.kategori_momen || '');
    assert.ok(isMuslimahProduct(combined), `Product ${idx} (${p.nama_model}) must pass whitelist`);
    
    const lower = combined.toLowerCase();
    BLACKLIST.forEach(b => {
      assert.ok(!lower.includes(b.toLowerCase()), `Product ${idx} contains blacklist word: ${b}`);
    });
  });
});

test('QA Gate 1 - Product validation', () => {
  const dbPath = path.join(__dirname, '../public/data/database_konveksi.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  
  db.tren_baju.forEach((p, idx) => {
    const v = validateProduct(p);
    assert.ok(v.valid, `Product ${idx} (${p.nama_model}) invalid: ${v.errors.join(', ')}`);
    assert.ok(p.spesifikasi_jahit.harga_kain_per_meter_grosir > 0, `Product ${idx} harga_kain_per_meter_grosir > 0`);
    assert.ok(p.spesifikasi_jahit.kebutuhan_kain_standar_meter >= 1.5, `Product ${idx} kebutuhan_kain_standar_meter >= 1.5`);
  });
});
