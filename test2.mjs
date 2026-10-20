import {isMuslimahProduct, WHITELIST_MUSLIMAH} from './src/data/modestFashionEngine.js';
const combined = "Gamis Syar'i Polos Minimalis Harian & Pengajian";
console.log(combined.toLowerCase());
console.log(WHITELIST_MUSLIMAH.some(k=>combined.toLowerCase().includes(k.toLowerCase())));
console.log(isMuslimahProduct(combined));
