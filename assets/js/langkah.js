// Pemetaan kolom ke langkah wizard (SPEC layar Bagian 2 dan 8). Setiap kolom ada di tepat satu langkah.
// "jenjang" = kelompok radio; yang lain = id kolom di index.html. Kolom jebakan "website" sengaja tidak ada di sini.
const LANGKAH = [
  {
    judul: "Tentang kamu",
    penjelas: "Pilih jenjang dan isi data singkat agar kami bisa menyesuaikan layanan.",
    kolom: ["jenjang", "prodi", "semester", "matkul", "kelas", "mapel", "mapel-lain"]
  },
  {
    judul: "Tugasmu",
    penjelas: "Pilih jenis tugas dan hasil yang kamu butuhkan.",
    kolom: ["jenis", "jenis-lain", "target", "format"]
  },
  {
    judul: "Lampiran dan tenggat",
    penjelas: "Beri tahu bahan yang akan kamu kirim dan kapan hasilnya dibutuhkan.",
    kolom: ["jml-file", "total-hlm", "tenggat"]
  },
  {
    judul: "Tinjau dan kirim",
    penjelas: "Periksa ringkasan dan estimasi, lalu kirim lewat WhatsApp.",
    kolom: ["kebutuhan", "ketentuan", "setuju"]
  }
];
