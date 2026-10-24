/** @OnlyCurrentDoc */
// Apps Script Jade. GET ?action=config mengirim tab Tugas dan Harga (tidak membuka tab Pesanan).
// POST mencatat satu pesanan ke tab Pesanan (Tahap 6). Baca dan tulis berdasarkan nama header dan label, bukan posisi.

const TAB_TUGAS = "Tugas";
const TAB_HARGA = "Harga";
const HEADER_TENGGAT = "Sisa hari (minimal)";

// Header tab Tugas -> kunci JSON, dan jenis nilainya
const KOLOM_TUGAS = [
  ["Jenjang", "jenjang", "teks"],
  ["Tugas", "tugas", "teks"],
  ["Harga dasar (Rp)", "hargaDasar", "bulat"],
  ["Unit sudah termasuk", "unit", "bulat"],
  ["Satuan", "satuan", "teks"],
  ["Tarif tambahan per unit (Rp)", "tarif", "bulat"],
  ["Format standar", "formatStandar", "teks"]
];

// Label tab Harga (kolom A) -> kunci JSON, dan jenis nilainya
const LABEL_HARGA = [
  ["Lampiran gratis (halaman)", "lampiranGratis", "bulat"],
  ["Ukuran blok lampiran berbayar (halaman)", "blokLampiran", "bulat"],
  ["Tarif per blok (Rp)", "tarifBlok", "bulat"],
  ["Batas lampiran (halaman)", "batasLampiran", "bulat"],
  ["Format file di luar standar tugas (Rp)", "tambahanFormat", "bulat"],
  ["Sitasi diperiksa manual, maks 10 referensi (Rp)", "tambahanSitasi", "bulat"],
  ["Penjelasan hasil + poin kunci (Rp)", "tambahanPenjelasan", "bulat"],
  ["Pengali batas atas (tugas biasa)", "pengaliAtas", "desimal"],
  ["Pengali batas bawah (Tugas lainnya)", "pengaliBawahLainnya", "desimal"],
  ["Pengali batas atas (Tugas lainnya)", "pengaliAtasLainnya", "desimal"],
  ["Pembulatan ke atas (Rp)", "pembulatan", "bulat"],
  ["DP (persen dari harga final)", "dp", "desimal"],
  ["Revisi gratis (kali)", "revisiGratis", "bulat"],
  ["Revisi tambahan (Rp per revisi)", "revisiTambahan", "bulat"]
];

function doGet(e) {
  try {
    const aksi = e && e.parameter ? e.parameter.action : "";
    if (aksi !== "config") throw new Error("Aksi tidak dikenal.");
    return keluar(bacaConfig());
  } catch (err) {
    return keluar({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    return keluar(catatPesanan(e));
  } catch (err) {
    // Hanya pesan yang kita tulis sendiri (tolak) yang boleh sampai ke klien; galat lain dicatat di log
    if (err && err.tampil) return keluar({ ok: false, error: err.tampil });
    console.error(err);
    return keluar({ ok: false, error: "Terjadi kesalahan di server." });
  }
}

function keluar(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function bacaConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    ok: true,
    versi: Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd'T'HH:mm:ssXXX"),
    tugas: bacaTugas(ambilTab(ss, TAB_TUGAS)),
    harga: bacaHarga(ambilTab(ss, TAB_HARGA))
  };
}

function ambilTab(ss, nama) {
  const tab = ss.getSheetByName(nama);
  if (!tab) throw new Error('Tab "' + nama + '" tidak ditemukan.');
  return tab.getDataRange().getValues();
}

// Angka harus benar-benar angka; sel kosong atau teks bukan angka ditolak dengan menyebut labelnya.
function angka(nilai, jenis, label) {
  const n = typeof nilai === "number" ? nilai : (typeof nilai === "string" && nilai.trim() !== "" ? Number(nilai.trim()) : NaN);
  if (!isFinite(n) || (jenis === "bulat" && Math.floor(n) !== n)) {
    throw new Error('Nilai "' + label + '" bukan angka' + (jenis === "bulat" ? " bulat" : "") + ".");
  }
  return n;
}

function bacaTugas(data) {
  const header = data[0] ? data[0].map((h) => String(h).trim()) : [];
  const idx = (nama) => {
    const i = header.indexOf(nama);
    if (i < 0) throw new Error('Header "' + nama + '" tidak ditemukan di tab ' + TAB_TUGAS + ".");
    return i;
  };
  const iAktif = idx("Aktif");
  const kolom = KOLOM_TUGAS.map((k) => [idx(k[0]), k[0], k[1], k[2]]);
  const hasil = [];
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][iAktif]).trim().toLowerCase() !== "ya") continue;
    const baris = {};
    kolom.forEach(([i, nama, kunci, jenis]) => {
      const v = data[r][i];
      baris[kunci] = jenis === "teks" ? String(v).trim()
        : angka(v, jenis, nama + " (tab " + TAB_TUGAS + ", baris " + (r + 1) + ")");
      if (jenis === "teks" && baris[kunci] === "") throw new Error('Isi "' + nama + '" kosong (tab ' + TAB_TUGAS + ", baris " + (r + 1) + ").");
    });
    hasil.push(baris);
  }
  return hasil;
}

function bacaHarga(data) {
  const cari = (label) => {
    const baris = data.find((b) => String(b[0]).trim() === label);
    if (!baris) throw new Error('Label "' + label + '" tidak ditemukan di tab ' + TAB_HARGA + ".");
    return baris[1];
  };
  const harga = {};
  LABEL_HARGA.forEach(([label, kunci, jenis]) => (harga[kunci] = angka(cari(label), jenis, label)));

  const h = data.findIndex((b) => String(b[0]).trim() === HEADER_TENGGAT);
  if (h < 0) throw new Error('Label "' + HEADER_TENGGAT + '" tidak ditemukan di tab ' + TAB_HARGA + ".");
  const tenggat = [];
  for (let r = h + 1; r < data.length && !(String(data[r][0]).trim() === "" && String(data[r][1]).trim() === ""); r++) {
    tenggat.push({
      minHari: angka(data[r][0], "bulat", HEADER_TENGGAT + " (baris " + (r + 1) + ")"),
      pengali: angka(data[r][1], "desimal", "Pengali tenggat (baris " + (r + 1) + ")")
    });
  }
  if (!tenggat.length) throw new Error('Tabel di bawah "' + HEADER_TENGGAT + '" kosong.');
  harga.tenggat = tenggat.sort((a, b) => a.minHari - b.minHari);
  return harga;
}

// ===== Tahap 6: mencatat pesanan (POST) =====

const TAB_PESANAN = "Pesanan";
const MAKS_BADAN = 10000;
const JEDA_DUPLIKAT_MS = 60 * 1000;
const WAKTU_TUNGGU_KUNCI_MS = 10 * 1000;
const FORMAT_OUTPUT = ["Teks", "Word", "PDF", "PPT", "Excel"];
const OPSI_TAMBAHAN = ["Sitasi diperiksa", "Penjelasan hasil"];
const KELAS_PELAJAR = ["Kelas 10", "Kelas 11", "Kelas 12"];
// Kolom Pesanan yang berisi teks bebas atau teks biasa (diformat sebagai teks)
const KOLOM_TEKS = ["Kode pesanan", "Waktu masuk", "Jenjang", "Prodi / Kelas", "Mata kuliah / pelajaran", "Jenis tugas",
  "Tugas lainnya (teks)", "Format output", "Tenggat", "Opsi tambahan", "Kebutuhan detail", "Ketentuan tugas", "Status"];

function tolak(pesan) {
  throw { tampil: pesan };
}

// Awalan ' mencegah teks klien dijalankan sebagai rumus (SPEC 3.4)
function aman(teks) {
  return /^[=+\-@]/.test(teks) ? "'" + teks : teks;
}

function teksValid(v, nama, min, maks) {
  if (typeof v !== "string") tolak(nama + " tidak valid.");
  const t = v.trim();
  if (t.length < min || t.length > maks) tolak(nama + " tidak valid.");
  return t;
}

function bulatValid(v, nama, min, maks) {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > maks) tolak(nama + " tidak valid.");
  return v;
}

function tanggalValid(v) {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) tolak("Tenggat tidak valid.");
  const d = new Date(v + "T00:00:00Z");
  if (isNaN(d) || d.toISOString().slice(0, 10) !== v) tolak("Tenggat tidak valid.");
  return v;
}

// Mengembalikan baris siap tulis: { nama header: nilai }. Server tidak menghitung ulang estimasi (PRD).
function periksaPesanan(p, daftarTugas) {
  if (p.jenjang !== "Pelajar" && p.jenjang !== "Mahasiswa") tolak("Jenjang tidak valid.");
  const mhs = p.jenjang === "Mahasiswa";
  const tugas = daftarTugas.find((t) => t.jenjang === p.jenjang && t.tugas === p.tugas);
  if (!tugas) tolak("Jenis tugas tidak valid.");

  let prodiKelas;
  let semester = "";
  if (mhs) {
    prodiKelas = teksValid(p.prodiKelas, "Prodi", 1, 80);
    semester = bulatValid(p.semester, "Semester", 1, 14);
  } else {
    if (KELAS_PELAJAR.indexOf(p.prodiKelas) < 0) tolak("Kelas tidak valid.");
    prodiKelas = p.prodiKelas;
  }
  const lainnya = p.tugas === "Tugas lainnya";
  const tugasLainnya = lainnya ? teksValid(p.tugasLainnya, "Nama tugas", 1, 100) : "";
  if (!Array.isArray(p.opsi) || p.opsi.some((o) => OPSI_TAMBAHAN.indexOf(o) < 0)) tolak("Opsi tambahan tidak valid.");
  if (FORMAT_OUTPUT.indexOf(p.format) < 0) tolak("Format output tidak valid.");

  const bawah = bulatValid(p.estimasiBawah, "Estimasi", 0, 10000000);
  const atas = bulatValid(p.estimasiAtas, "Estimasi", 0, 10000000);
  return {
    "Jenjang": p.jenjang,
    "Prodi / Kelas": aman(prodiKelas),
    "Semester": semester,
    "Mata kuliah / pelajaran": aman(teksValid(p.matkul, mhs ? "Mata kuliah" : "Mata pelajaran", 1, 80)),
    "Jenis tugas": p.tugas,
    "Tugas lainnya (teks)": aman(tugasLainnya),
    "Jumlah file lampiran": bulatValid(p.jumlahFile, "Jumlah file", 0, 20),
    "Total hlm lampiran": bulatValid(p.totalHalaman, "Total halaman", 0, 1000),
    "Target output": bulatValid(p.target, "Target output", 1, 200),
    "Format output": p.format,
    "Tenggat": tanggalValid(p.tenggat),
    "Opsi tambahan": p.opsi.join(", "),
    "Kebutuhan detail": aman(teksValid(p.kebutuhan, "Kebutuhan", 10, 1000)),
    "Ketentuan tugas": aman(teksValid(p.ketentuan, "Ketentuan", 1, 1000)),
    "Estimasi bawah (Rp)": bawah,
    "Estimasi atas (Rp)": atas
  };
}

function catatPesanan(e) {
  const isi = e && e.postData ? e.postData.contents : "";
  if (!isi || isi.length > MAKS_BADAN) tolak("Data tidak valid.");
  let p;
  try { p = JSON.parse(isi); } catch (err) { tolak("Data tidak valid."); }
  if (!p || typeof p !== "object" || Array.isArray(p)) tolak("Data tidak valid.");

  // Kolom jebakan terisi: pura-pura berhasil, tulis apa pun tidak
  if (p.website !== undefined && p.website !== "") return { ok: true, kode: "JD-0000" };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const baris = periksaPesanan(p, bacaTugas(ambilTab(ss, TAB_TUGAS)));

  const kunci = LockService.getScriptLock();
  if (!kunci.tryLock(WAKTU_TUNGGU_KUNCI_MS)) tolak("Server sedang sibuk, coba lagi.");
  try {
    return tulisPesanan(ss, baris);
  } finally {
    kunci.releaseLock();
  }
}

// Dipanggil di dalam kunci
function tulisPesanan(ss, baris) {
  const tab = ss.getSheetByName(TAB_PESANAN);
  if (!tab) tolak('Tab "' + TAB_PESANAN + '" tidak ditemukan.');
  const header = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0].map((h) => String(h).trim());
  const kolom = (nama) => {
    const i = header.indexOf(nama);
    if (i < 0) tolak('Header "' + nama + '" tidak ditemukan di tab ' + TAB_PESANAN + ".");
    return i + 1;
  };
  // Semua header yang akan ditulis harus ada sebelum menulis apa pun
  const kolomTulis = ["Kode pesanan", "Waktu masuk", "Status", ...Object.keys(baris).filter((k) => k !== "Semester" || baris[k] !== "")];
  kolomTulis.forEach(kolom);

  const cKode = kolom("Kode pesanan");
  const jumlah = tab.getMaxRows() - 1;
  const kodeSemua = jumlah > 0 ? tab.getRange(2, cKode, jumlah, 1).getValues().map((r) => String(r[0]).trim()) : [];
  let maks = 0;
  let baruKosong = -1;
  let terakhirAda = -1;
  kodeSemua.forEach((k, i) => {
    if (k === "") { if (baruKosong < 0) baruKosong = i; return; }
    terakhirAda = i;
    const m = /^JD-(\d+)$/.exec(k);
    if (m && k !== "JD-0000") maks = Math.max(maks, Number(m[1]));
  });
  if (baruKosong < 0) tolak("Tabel pesanan penuh");
  const barisTulis = baruKosong + 2;

  // Duplikat: baris terbaru identik (jenjang, tugas, kebutuhan) dan masuk < 60 detik lalu
  if (terakhirAda >= 0) {
    const barisTerakhir = tab.getRange(terakhirAda + 2, 1, 1, header.length).getValues()[0];
    const nilai = (nama) => barisTerakhir[kolom(nama) - 1];
    const waktu = nilai("Waktu masuk");
    const ms = waktu instanceof Date ? waktu.getTime() : new Date(String(waktu).replace(" ", "T") + "+07:00").getTime();
    if (Date.now() - ms < JEDA_DUPLIKAT_MS &&
        String(nilai("Jenjang")) === baris["Jenjang"] && String(nilai("Jenis tugas")) === baris["Jenis tugas"] &&
        String(nilai("Kebutuhan detail")) === baris["Kebutuhan detail"]) {
      tolak("Terlalu banyak percobaan");
    }
  }

  const kode = "JD-" + String(maks + 1).padStart(4, "0"); // maks >= 0, jadi tidak pernah JD-0000
  const penuh = Object.assign({}, baris, {
    "Kode pesanan": kode,
    "Waktu masuk": Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss"),
    "Status": "Draf"
  });
  // Tulis per kolom berdasarkan nama header. Kolom lain (termasuk rumus Laba) tidak disentuh.
  Object.keys(penuh).forEach((nama) => {
    if (nama === "Semester" && penuh[nama] === "") return;
    const sel = tab.getRange(barisTulis, kolom(nama));
    if (KOLOM_TEKS.indexOf(nama) >= 0) sel.setNumberFormat("@");
    sel.setValue(penuh[nama]);
  });
  SpreadsheetApp.flush();
  return { ok: true, kode: kode };
}
