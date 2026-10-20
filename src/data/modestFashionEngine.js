export const WA_GROUP_INVITE_URL = "https://chat.whatsapp.com/E85pWxWFfaJCimh9vxYv1j";

export const WHITELIST_MUSLIMAH = [
  "Gamis", "Abaya", "Tunik", "Long Tunik", "Kaftan", "One-Set Muslimah",
  "Setelan Rok Hijab", "Dress Kondangan Muslimah", "Gamis Syar'i", "Khimar", "Mukena"
];

export const BLACKLIST = [
  "Mini", "Midi", "Short", "Crop", "Sleeveless", "Tanpa Lengan", "Tanktop",
  "Backless", "Bikini", "Sexy", "Hotpants", "Pria", "Koko"
];

export function isMuslimahProduct(text) {
  const t = (text || "").toLowerCase();
  const hasWhitelist = WHITELIST_MUSLIMAH.some(k => t.includes(k.toLowerCase()));
  const hasBlacklist = BLACKLIST.some(k => {
    const bk = k.toLowerCase();
    // Avoid false positives like "minimalis" containing "mini"
    const regex = new RegExp('\\b' + bk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return regex.test(t) || (bk === 'mini' && t.includes('mini ') || t.includes(' mini'));
  });
  return hasWhitelist && !hasBlacklist;
}

export function validateProduct(p) {
  const errors = [];
  if (!p.id) errors.push("id required");
  if (!p.nama_model) errors.push("nama_model required");
  const combined = `${p.nama_model} ${p.kategori_momen || ""}`;
  if (!isMuslimahProduct(combined)) errors.push("must pass muslimah whitelist and blacklist");
  if (!p.spesifikasi_jahit) errors.push("spesifikasi_jahit required");
  if (typeof p.spesifikasi_jahit.kebutuhan_kain_standar_meter !== "number" || p.spesifikasi_jahit.kebutuhan_kain_standar_meter < 1.5) errors.push("kebutuhan_kain_standar_meter >= 1.5");
  if (typeof p.spesifikasi_jahit.harga_kain_per_meter_grosir !== "number" || p.spesifikasi_jahit.harga_kain_per_meter_grosir <= 0) errors.push("harga_kain_per_meter_grosir > 0");
  return { valid: errors.length === 0, errors };
}
