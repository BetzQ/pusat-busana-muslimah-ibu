const t = "gamis syar'i polos minimalis harian & pengajian";
const BLACKLIST = ['Mini', 'Midi', 'Short', 'Crop', 'Sleeveless', 'Tanpa Lengan', 'Tanktop', 'Backless', 'Bikini', 'Sexy', 'Hotpants', 'Pria', 'Koko'];
const hasBlacklist = BLACKLIST.some(k => {
  const bk = k.toLowerCase();
  const regex = new RegExp('\\b' + bk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
  return regex.test(t);
});
console.log(hasBlacklist);
