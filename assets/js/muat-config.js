// Memuat config (tugas dan harga) dari Apps Script, dengan cadangan localStorage lalu data/fallback.js.
// Tidak menyentuh halaman (DOM) dan tidak menyimpan tarif permanen.
const KUNCI_CONFIG = "jade_config";
const UMUR_MAKS_MS = 24 * 60 * 60 * 1000;
const FORMAT_SAH = ["Teks", "Word", "PDF", "PPT", "Excel"];

// Mengembalikan "" jika config sah, atau alasan singkat jika tidak.
function validasiConfig(c) {
  const bulat = (v, min) => Number.isInteger(v) && v >= min;
  const desimal = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;
  if (!c || c.ok !== true || !Array.isArray(c.tugas) || !c.harga) return "bentuk config salah";

  for (const t of c.tugas) {
    if (!t || !["Pelajar", "Mahasiswa"].includes(t.jenjang)) return "jenjang tugas salah";
    if (typeof t.tugas !== "string" || !t.tugas || typeof t.satuan !== "string" || !t.satuan) return "nama tugas atau satuan kosong";
    if (!bulat(t.hargaDasar, 0) || !bulat(t.unit, 1) || !bulat(t.tarif, 0)) return `angka tugas "${t.tugas}" tidak valid`;
    if (!FORMAT_SAH.includes(t.formatStandar)) return `format standar "${t.tugas}" tidak sah`;
  }
  // Pasangan jenjang + tugas ganda: form hanya menemukan yang pertama, harga kedua diam-diam terbuang
  if (new Set(c.tugas.map((t) => t.jenjang + "|" + t.tugas)).size !== c.tugas.length) return "ada tugas ganda";
  for (const j of ["Pelajar", "Mahasiswa"]) {
    if (!c.tugas.some((t) => t.jenjang === j)) return `jenjang ${j} tidak punya tugas`;
  }

  const h = c.harga;
  const angkaBulat = { lampiranGratis: 0, blokLampiran: 1, tarifBlok: 0, batasLampiran: 0, tambahanFormat: 0, tambahanSitasi: 0,
    tambahanPenjelasan: 0, pembulatan: 1, revisiGratis: 0, revisiTambahan: 0 };
  for (const k in angkaBulat) if (!bulat(h[k], angkaBulat[k])) return `harga.${k} tidak valid`;
  for (const k of ["pengaliAtas", "pengaliBawahLainnya", "pengaliAtasLainnya"]) if (!desimal(h[k])) return `harga.${k} tidak valid`;
  if (typeof h.dp !== "number" || !(h.dp >= 0 && h.dp <= 1)) return "harga.dp tidak valid";

  const ten = h.tenggat;
  if (!Array.isArray(ten) || !ten.length) return "tabel tenggat kosong";
  for (let i = 0; i < ten.length; i++) {
    if (!ten[i] || !bulat(ten[i].minHari, 0) || !desimal(ten[i].pengali)) return "baris tabel tenggat tidak valid";
    if (i > 0 && ten[i].minHari <= ten[i - 1].minHari) return "tabel tenggat tidak terurut";
  }
  if (ten[0].minHari !== 0) return "baris pertama tabel tenggat harus minHari 0";
  return "";
}

async function ambilDariSheets(url) {
  const batas = new AbortController();
  const timer = setTimeout(() => batas.abort(), CONFIG.batasWaktuMs);
  try {
    const r = await fetch(url + (url.includes("?") ? "&" : "?") + "action=config", { signal: batas.signal });
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

function bacaCadangan() {
  try {
    const s = JSON.parse(localStorage.getItem(KUNCI_CONFIG));
    const umur = Date.now() - s.waktu;
    if (umur >= 0 && umur < UMUR_MAKS_MS && !validasiConfig(s.config)) return s.config;
  } catch (e) { /* tidak ada atau rusak: lanjut ke cadangan berikutnya */ }
  return null;
}

// Tidak pernah gagal: selalu mengembalikan { config, gagal }. gagal = true hanya bila terpaksa memakai data/fallback.js.
async function muatConfig() {
  if (!CONFIG.appsScriptUrl) return { config: FALLBACK_CONFIG, gagal: false }; // belum dipasang
  try {
    const c = await ambilDariSheets(CONFIG.appsScriptUrl);
    if (!validasiConfig(c)) {
      try { localStorage.setItem(KUNCI_CONFIG, JSON.stringify({ waktu: Date.now(), config: c })); } catch (e) { /* penyimpanan penuh atau diblokir */ }
      return { config: c, gagal: false };
    }
  } catch (e) { /* jaringan, batas waktu, atau bukan JSON */ }
  const simpanan = bacaCadangan();
  return simpanan ? { config: simpanan, gagal: false } : { config: FALLBACK_CONFIG, gagal: true };
}
