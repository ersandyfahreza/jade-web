// Uji logika server (apps-script/Code.gs) tanpa Google. Jalankan: node tests/uji-server.js
// Sheets diganti tabel tiruan di memori. Keluaran: satu baris per uji, OK atau CEK. Ada CEK = keluar dengan kode 1.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Tiruan tab Pesanan: baris 1 = header, sisanya kosong
function buatTab(header, jumlahBaris) {
  const grid = [header.slice(), ...Array.from({ length: jumlahBaris }, () => header.map(() => ""))];
  return {
    grid,
    getLastColumn: () => header.length,
    getMaxRows: () => grid.length,
    getRange: (r, c, nr = 1, nc = 1) => ({
      getValues: () => Array.from({ length: nr }, (_, i) => grid[r - 1 + i].slice(c - 1, c - 1 + nc)),
      getValue: () => grid[r - 1][c - 1],
      setValue: (v) => { grid[r - 1][c - 1] = v; },
      setNumberFormat: () => {}
    })
  };
}

function muat(tab, tugas) {
  const sentuh = () => { throw new Error("Sheets tersentuh"); };
  const ctx = vm.createContext({
    SpreadsheetApp: { getActiveSpreadsheet: tab ? () => ({ getSheetByName: () => tab }) : sentuh, flush() {} },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    Utilities: { formatDate: () => "2026-10-24 10:00:00" },
    ContentService: {}, console
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "apps-script", "Code.gs"), "utf8"), ctx);
  if (tugas) vm.runInContext("bacaTugas = () => " + JSON.stringify(tugas) + "; ambilTab = () => null;", ctx);
  return (kode) => vm.runInContext(kode, ctx);
}

const TUGAS = [
  { jenjang: "Mahasiswa", tugas: "Draf makalah" }, { jenjang: "Mahasiswa", tugas: "Tugas lainnya" },
  { jenjang: "Pelajar", tugas: "Resume materi" }
];
const HEADER = ["Kode pesanan", "Waktu masuk", "Jenjang", "Prodi / Kelas", "Mata kuliah / pelajaran", "Jenis tugas",
  "Tugas lainnya (teks)", "Jumlah file lampiran", "Total hlm lampiran", "Target output", "Format output", "Tenggat",
  "Opsi tambahan", "Kebutuhan detail", "Ketentuan tugas", "Estimasi bawah (Rp)", "Estimasi atas (Rp)", "Status", "Laba (Rp)", "Semester"];
const dasar = {
  website: "", jenjang: "Mahasiswa", prodiKelas: "UJI prodi", semester: 3, matkul: "UJI matkul", tugas: "Draf makalah",
  tugasLainnya: "", jumlahFile: 2, totalHalaman: 30, target: 8, format: "PDF", tenggat: "2026-10-28",
  opsi: ["Sitasi diperiksa"], kebutuhan: "Kebutuhan uji lengkap", ketentuan: "-", estimasiBawah: 88000, estimasiAtas: 106000
};
const dengan = (o) => Object.assign({}, dasar, o);

let adaCek = false;
function uji(nama, fn) {
  let hasil;
  try { hasil = fn(); } catch (e) { hasil = "galat: " + (e.tampil || e.message); }
  const ok = hasil === true;
  if (!ok) adaCek = true;
  console.log(`${ok ? "OK " : "CEK"}  ${nama}${ok ? "" : "  -> " + hasil}`);
}
const tolakDengan = (jalan) => { try { jalan(); return "tidak ditolak"; } catch (e) { return e.tampil ? true : "galat tak terduga: " + e.message; } };

// 1. Validasi
const S = muat(null);
const cek = (o) => S("periksaPesanan")(o, TUGAS);
uji("data benar diterima", () => cek(dasar)["Jenjang"] === "Mahasiswa" && cek(dasar)["Semester"] === 3);
uji("pelajar: semester kosong", () => cek(dengan({ jenjang: "Pelajar", prodiKelas: "Kelas 11", tugas: "Resume materi", semester: "" }))["Semester"] === "");
[
  ["jenjang SMP", { jenjang: "SMP" }], ["tugas tidak ada di daftar", { tugas: "Tidak ada" }],
  ["tugas jenjang lain", { tugas: "Resume materi" }], ["semester 15", { semester: 15 }], ["semester 1,5", { semester: 1.5 }],
  ["semester teks", { semester: "3" }], ["kelas pelajar salah", { jenjang: "Pelajar", tugas: "Resume materi", prodiKelas: "Kelas 9" }],
  ["format DOC", { format: "DOC" }], ["tenggat 30 Februari", { tenggat: "2026-02-30" }], ["tenggat format salah", { tenggat: "28-10-2026" }],
  ["kebutuhan 9 karakter", { kebutuhan: "123456789" }], ["kebutuhan 1001 karakter", { kebutuhan: "a".repeat(1001) }],
  ["ketentuan kosong", { ketentuan: "  " }], ["prodi 81 karakter", { prodiKelas: "a".repeat(81) }],
  ["matkul kosong", { matkul: "" }], ["tugas lainnya tanpa nama", { tugas: "Tugas lainnya", tugasLainnya: "" }],
  ["nama tugas lainnya 101 karakter", { tugas: "Tugas lainnya", tugasLainnya: "a".repeat(101) }],
  ["opsi tak dikenal", { opsi: ["x"] }], ["opsi bukan daftar", { opsi: "Sitasi diperiksa" }],
  ["jumlah file 21", { jumlahFile: 21 }], ["total halaman 1001", { totalHalaman: 1001 }], ["target 0", { target: 0 }],
  ["target 201", { target: 201 }], ["estimasi 10.000.001", { estimasiAtas: 10000001 }], ["estimasi negatif", { estimasiBawah: -1 }]
].forEach(([nama, ubah]) => uji("ditolak: " + nama, () => tolakDengan(() => cek(dengan(ubah)))));

// 2. Awalan '
uji("awalan ' untuk = + - @", () => ["=1+1", "+1", "-1", "@x"].every((t) => S("aman")(t) === "'" + t));
uji("teks biasa tanpa awalan '", () => S("aman")("Halo =1+1") === "Halo =1+1");
uji("kebutuhan, ketentuan, prodi, matkul, tugas lainnya diberi '", () => {
  const b = cek(dengan({ tugas: "Tugas lainnya", tugasLainnya: "=a", prodiKelas: "+b", matkul: "@c", kebutuhan: "-kebutuhan uji", ketentuan: "=d" }));
  return b["Tugas lainnya (teks)"] === "'=a" && b["Prodi / Kelas"] === "'+b" && b["Mata kuliah / pelajaran"] === "'@c" &&
    b["Kebutuhan detail"] === "'-kebutuhan uji" && b["Ketentuan tugas"] === "'=d";
});

// 3. Kolom jebakan: tidak boleh menyentuh Sheets sama sekali (muat(null) melempar galat bila disentuh)
uji("kolom jebakan: ok:true JD-0000, tanpa menulis", () => {
  const r = S("catatPesanan")({ postData: { contents: JSON.stringify(dengan({ website: "bot" })) } });
  return r.ok === true && r.kode === "JD-0000";
});

// 4. Kode pesanan dan duplikat (tabel tiruan)
function cek2(tab, o) {
  const m = muat(tab, TUGAS);
  return m("tulisPesanan")({ getSheetByName: () => tab }, m("periksaPesanan")(o, TUGAS));
}
uji("kode pertama JD-0001, JD-0000 dan JD-OFF- diabaikan", () => {
  const tab = buatTab(HEADER, 5);
  tab.grid[1][0] = "JD-0000"; tab.grid[2][0] = "JD-OFF-AB12";
  return cek2(tab, dasar).kode === "JD-0001" && tab.grid[3][0] === "JD-0001";
});
uji("kode berikutnya = terbesar + 1, bukan nol 4 digit", () => {
  const tab = buatTab(HEADER, 5);
  tab.grid[1][0] = "JD-0012"; tab.grid[2][0] = "JD-0007";
  return cek2(tab, dasar).kode === "JD-0013";
});
uji("kode 5 digit tidak kembali ke JD-0000", () => {
  const tab = buatTab(HEADER, 3);
  tab.grid[1][0] = "JD-9999";
  const kode = cek2(tab, dasar).kode;
  return kode === "JD-10000" && kode !== "JD-0000";
});
uji("kolom Laba dan kolom lain tidak ditimpa, Status Draf", () => {
  const tab = buatTab(HEADER, 3);
  tab.grid[1][HEADER.indexOf("Laba (Rp)")] = "=RUMUS";
  cek2(tab, dasar);
  return tab.grid[1][HEADER.indexOf("Laba (Rp)")] === "=RUMUS" && tab.grid[1][HEADER.indexOf("Status")] === "Draf";
});
uji("tabel penuh ditolak tanpa menulis", () => {
  const tab = buatTab(HEADER, 2);
  tab.grid[1][0] = "JD-0001"; tab.grid[2][0] = "JD-0002";
  const sebelum = JSON.stringify(tab.grid);
  return tolakDengan(() => cek2(tab, dasar)) === true && JSON.stringify(tab.grid) === sebelum;
});
uji("duplikat dalam 60 detik ditolak", () => {
  const tab = buatTab(HEADER, 5);
  tab.grid[1][0] = "JD-0001";
  // Kode membaca "Waktu masuk" sebagai WIB (+07:00), jadi isi dengan waktu WIB sekarang
  tab.grid[1][1] = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 19).replace("T", " ");
  tab.grid[1][HEADER.indexOf("Jenjang")] = "Mahasiswa";
  tab.grid[1][HEADER.indexOf("Jenis tugas")] = "Draf makalah";
  tab.grid[1][HEADER.indexOf("Kebutuhan detail")] = dasar.kebutuhan;
  try { cek2(tab, dasar); return "tidak ditolak"; } catch (e) { return e.tampil === "Terlalu banyak percobaan" || e.tampil; }
});
uji("isi sama tapi sudah lewat 60 detik diterima", () => {
  const tab = buatTab(HEADER, 5);
  tab.grid[1][0] = "JD-0001"; tab.grid[1][1] = "2020-01-01 00:00:00";
  tab.grid[1][HEADER.indexOf("Jenjang")] = "Mahasiswa";
  tab.grid[1][HEADER.indexOf("Jenis tugas")] = "Draf makalah";
  tab.grid[1][HEADER.indexOf("Kebutuhan detail")] = dasar.kebutuhan;
  return cek2(tab, dasar).kode === "JD-0002";
});

process.exit(adaCek ? 1 : 0);
