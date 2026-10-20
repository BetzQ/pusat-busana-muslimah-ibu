import fs from 'fs';
const db = JSON.parse(fs.readFileSync('public/data/database_konveksi.json','utf-8'));
db.tren_baju = db.tren_baju.filter(x=>x.id!=='gm-013');
fs.writeFileSync('public/data/database_konveksi.json', JSON.stringify(db,null,2));
console.log(db.tren_baju.length);
