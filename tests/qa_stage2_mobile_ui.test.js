import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('QA Gate 2 - Mobile UI meets accessibility requirements', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const doc = dom.window.document;
  
  // Check viewport meta
  const viewport = doc.querySelector('meta[name="viewport"]');
  assert.ok(viewport, 'viewport meta exists');
  
  // Check critical buttons exist
  const waTop = doc.getElementById('btnWaGroupTop');
  assert.ok(waTop, 'WA Group top button exists');
  assert.ok(waTop.textContent.includes('BUKA GRUP CATATAN WA IBU'), 'WA button has correct text');
  
  // Check 4 main tabs
  const navBtns = doc.querySelectorAll('.nav-btn');
  assert.ok(navBtns.length >= 4, `Need >=4 nav buttons, got ${navBtns.length}`);
  
  // Check speak button exists in some form
  const speakBtn = doc.querySelector('.speak-btn');
  assert.ok(speakBtn, 'Speak button exists');
  
  // Check draw button
  const drawBtn = doc.querySelector('.draw-btn');
  assert.ok(drawBtn, 'Draw button exists');
  
  // Check CSS has jumbo fonts
  const css = fs.readFileSync(path.join(__dirname, '../src/style.css'), 'utf-8');
  assert.ok(css.includes('font-size: 18px'), 'Base font >= 18px exists');
  assert.ok(css.includes('min-height: 56px') || css.includes('min-height: 48px'), 'Large buttons exist');
});
