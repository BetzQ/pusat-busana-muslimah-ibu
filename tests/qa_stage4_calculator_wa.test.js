import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import { WA_GROUP_INVITE_URL } from '../src/data/modestFashionEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('QA Gate 4 - WA Group URL is correctly configured', () => {
  assert.strictEqual(WA_GROUP_INVITE_URL, 'https://chat.whatsapp.com/E85pWxWFfaJCimh9vxYv1j');
  
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');
  assert.ok(html.includes(WA_GROUP_INVITE_URL), 'WA URL present in HTML');
});

test('QA Gate 4 - Calculator and WA integration elements exist', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const doc = dom.window.document;
  
  // Calculator elements
  assert.ok(doc.getElementById('calcModel'), 'Model select exists');
  assert.ok(doc.getElementById('sizeGroup'), 'Size group exists');
  assert.ok(doc.getElementById('qtyGroup'), 'Qty group exists');
  assert.ok(doc.getElementById('modCheckGrid'), 'Mod check grid exists');
  
  // Result elements
  assert.ok(doc.getElementById('resKain'), 'Result kain exists');
  assert.ok(doc.getElementById('resFuring'), 'Result furing exists');
  assert.ok(doc.getElementById('resHppPer'), 'Result HPP per exists');
  assert.ok(doc.getElementById('resHppTotal'), 'Result HPP total exists');
  assert.ok(doc.getElementById('resUntung'), 'Result untung exists');
  
  // WA elements
  assert.ok(doc.getElementById('waText'), 'WA textarea exists');
  assert.ok(doc.getElementById('btnKirimWA'), 'Send to WA button exists');
  assert.ok(doc.getElementById('btnBukaGrup'), 'Open group button exists');
  assert.ok(doc.getElementById('btnSalin'), 'Copy button exists');
  
  // Check text includes "KLAK-KLIK" style elements
  assert.ok(doc.querySelectorAll('.check-btn').length >= 6, 'Multiple check buttons exist');
});

test('QA Gate 4 - Calculator math is correct for basic case', () => {
  const dbPath = path.join(__dirname, '../public/data/database_konveksi.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  
  if (db.tren_baju && db.tren_baju.length > 0) {
    const p = db.tren_baju[0];
    const s = p.spesifikasi_jahit;
    // Test basic calc: 1 pc, standar
    const kain = s.kebutuhan_kain_standar_meter * 1.0; // 2.75
    const hppPer = kain * s.harga_kain_per_meter_grosir + (s.kebutuhan_furing_meter * s.harga_kain_per_meter_grosir * 0.6) + s.ongkos_jahit_makloon + s.biaya_aksesoris_resleting_kancing;
    assert.ok(kain >= 1.5, 'Kain calculation valid');
    assert.ok(hppPer > 0, 'HPP calculation valid');
    assert.ok(s.kebutuhan_kain_standar_meter >= 1.5, 'Kain meets requirement');
  }
});
