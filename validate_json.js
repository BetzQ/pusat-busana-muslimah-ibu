const fs = require('fs');
try {
  const d = JSON.parse(fs.readFileSync('public/data/database_konveksi.json','utf8'));
  console.log('ok');
} catch(e) {
  console.log('ERR');
}
