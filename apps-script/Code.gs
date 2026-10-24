/** @OnlyCurrentDoc */
// Apps Script Jade, Tahap 5: hanya MEMBACA. GET ?action=config mengirim tab Tugas dan Harga.
// Tab Pesanan tidak pernah dibuka. Baca berdasarkan nama header dan label, bukan posisi.

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
