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

// Teks bebas klien dipotong 400 karakter; yang terpotong ditandai (teks lengkap ada di Sheets)
function potongTeks(teks, kode) {
  // Per karakter utuh (Array.from), agar emoji tidak terbelah dan encodeURIComponent tidak error
  const huruf = Array.from(teks.trim());
  return huruf.length > BATAS_TEKS_WA ? `${huruf.slice(0, BATAS_TEKS_WA).join("")} ... (selengkapnya di pesanan ${kode})` : huruf.join("");
}

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
  const tambahan = [d.sitasi && "Sitasi diperiksa manual", d.penjelasan && "Penjelasan hasil"].filter(Boolean);
  const baris = [
    "Halo Jade, aku mau pesan layanan pendampingan.",
    "",
    `Kode pesanan: ${d.kode}`,
    `Jenjang: ${d.jenjang}`,
    ...(mhs ? [`Prodi: ${d.prodi}`, `Semester: ${d.semester}`, `Mata kuliah: ${d.matkul}`]
      : [`Kelas: ${d.kelas}`, `Mata pelajaran: ${d.mapel}`]),
    `Jenis tugas: ${d.jenisTugas}`,
    `Target output: ${d.target} ${d.satuan}`,
    `Lampiran: ${d.jmlFile} file, total ${d.totalHlm} hlm (akan kukirim di chat ini)`,
    `Format output: ${d.format}`,
    `Tenggat: ${tanggalIndonesia(d.tenggat)} (${d.sisaHari} hari lagi)`,
    `Tambahan: ${tambahan.length ? tambahan.join(", ") : "tidak ada"}`,
    "",
    "Kebutuhan detail:",
    potongTeks(d.kebutuhan, d.kode),
    "",
    "Ketentuan tugas:",
    potongTeks(d.ketentuan, d.kode),
    "",
    d.hargaBelumTerbaca
      ? "Estimasi: tidak dihitung (data harga belum terbaca), mohon dihitung manual."
      : d.atas === null
      ? `Estimasi: tidak dihitung (lampiran lebih dari ${d.batasLampiran} hlm), mohon dihitung manual.`
      : `Estimasi: ${rupiahWA(d.bawah)} - ${rupiahWA(d.atas)}`,
    "(Estimasi awal, harga final menunggu konfirmasi dari kalian.)"
  ];
  if (d.belumTercatat) baris.push("Catatan: pesanan belum tercatat otomatis.");
  return baris.join("\n");
}
