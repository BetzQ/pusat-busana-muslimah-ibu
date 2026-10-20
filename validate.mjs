import fs from 'fs';
try {
  const d = JSON.parse(fs.readFileSync('public/data/database_konveksi.json','utf-8'));
  console.log('ok');
} catch(e) {
  console.log('ERR');
}
