// Penyusun pesan WhatsApp Jade (SPEC layar Bagian 6). Murni: tidak menyentuh halaman (tanpa document/window).
// Dipakai oleh web (app.js) dan halaman uji (tests/uji-harga.html).

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const BATAS_TEKS_WA = 400;

// "2026-10-28" -> "28 Okt 2026"
function tanggalIndonesia(ymd) {
  const [t, b, h] = ymd.split("-").map(Number);
  return `${h} ${BULAN[b - 1]} ${t}`;
}

const rupiahWA = (n) => "Rp" + n.toLocaleString("id-ID");

// Pecah per karakter utuh (grafem), agar emoji tidak terbelah dan encodeURIComponent tidak error.
// Cadangan: Array.from bila Intl.Segmenter tidak ada.
const pecahHuruf = (t) => (typeof Intl !== "undefined" && Intl.Segmenter
  ? Array.from(new Intl.Segmenter().segment(t), (x) => x.segment) : Array.from(t));

// Teks bebas klien dipotong 400 karakter; yang terpotong ditandai (teks lengkap ada di Sheets)
function potongTeks(teks, kode) {
  const huruf = pecahHuruf(teks.replace(/\r\n?/g, "\n").trim());
  return huruf.length > BATAS_TEKS_WA ? `${huruf.slice(0, BATAS_TEKS_WA).join("")} ... (selengkapnya di pesanan ${kode})` : huruf.join("");
}

// Netralisasi format WhatsApp di teks klien: karakter lebar-nol (U+200B) memutus pasangan penanda dan awal daftar/kutipan.
// shortcut: belum teruji di semua versi WhatsApp; bila masih terformat, ganti ke karakter lebar penuh.
const LN = "​";
const netralInline = (t) => t.replace(/[*_~`]/g, `${LN}$&${LN}`);
const netralBaris = (b) => netralInline(/^\s*(?:[-*]\s|\d+\.\s|>)/.test(b) ? LN + b : b);

// Teks banyak baris -> satu kutipan: tiap baris diawali "> ", baris kosong jadi "> " + lebar-nol
const kutipan = (teks, kode) =>
  potongTeks(teks, kode).split("\n").map((b) => "> " + (b.trim() ? netralBaris(b) : LN)).join("\n");

// Kode sementara bila Sheets gagal: JD-OFF- + 4 huruf besar/angka
function buatKodeSementara() {
  const huruf = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let akhir = "";
  for (let i = 0; i < 4; i++) akhir += huruf[Math.floor(Math.random() * huruf.length)];
  return "JD-OFF-" + akhir;
}

const tautanWA = (nomor, pesan) => `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

// d: { kode, jenjang, prodi, semester, matkul (Mahasiswa) | kelas, mapel (Pelajar), jenisTugas, target, satuan,
//      jmlFile, totalHlm, format, tenggat (YYYY-MM-DD), sisaHari, sitasi, penjelasan, kebutuhan, ketentuan,
//      bawah, atas (null jika lampiran melebihi batas), hargaBelumTerbaca, batasLampiran, belumTercatat }
function susunPesanWA(d) {
  const mhs = d.jenjang === "Mahasiswa";
  const tambahan = [d.sitasi && "Sitasi diperiksa", d.penjelasan && "Penjelasan hasil"].filter(Boolean);
  const estimasi = d.hargaBelumTerbaca
    ? "tidak dihitung (data harga belum terbaca), mohon dihitung manual."
    : d.atas === null
    ? `tidak dihitung (lampiran lebih dari ${d.batasLampiran} hlm), mohon dihitung manual.`
    : `${rupiahWA(d.bawah)} - ${rupiahWA(d.atas)}`;
  const baris = [
    "Halo Jade, aku mau pesan layanan pendampingan.",
    "",
    `*KODE PESANAN: ${d.kode}*`,
    "",
    "*Identitas*",
    `Jenjang: ${d.jenjang}`,
    ...(mhs ? [`Prodi: ${netralInline(d.prodi)}`, `Semester: ${d.semester}`, `Mata kuliah: ${netralInline(d.matkul)}`]
      : [`Kelas: ${d.kelas}`, `Mata pelajaran: ${netralInline(d.mapel)}`]),
    "",
    "*Tugas*",
    `Jenis tugas: ${netralInline(d.jenisTugas)}`,
    `Target output: ${d.target} ${d.satuan}`,
    `Format output: ${d.format}`,
    `Tenggat: ${tanggalIndonesia(d.tenggat)} (${d.sisaHari} hari lagi)`,
    ...(tambahan.length ? [`Tambahan: ${tambahan.join(", ")}`] : []),
    `Lampiran: ${d.jmlFile} file, total ${d.totalHlm} hlm (akan kukirim di chat ini)`,
    "",
    "*Kebutuhan detail*",
    kutipan(d.kebutuhan, d.kode),
    "",
    "*Ketentuan tugas*",
    kutipan(d.ketentuan, d.kode),
    "",
    `*ESTIMASI: ${estimasi}*`,
    "_Estimasi awal, harga final menunggu konfirmasi dari kalian._"
  ];
  if (d.belumTercatat) baris.push("", "_Catatan: pesanan belum tercatat otomatis._");
  return baris.join("\n");
}
