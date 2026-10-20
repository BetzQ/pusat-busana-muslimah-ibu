import fs from 'fs';
try {
  const raw = fs.readFileSync('public/data/database_konveksi.json','utf-8');
  const d = JSON.parse(raw);
  console.log('ok', d.tren_baju.length);
} catch(e) {
  console.error(e.toString());
}
