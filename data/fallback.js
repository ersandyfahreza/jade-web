// Salinan cadangan tab Tugas dan Harga. Isinya harus sama dengan Google Sheets.
// Perbarui file ini setiap kali harga di Sheets berubah.
const FALLBACK_CONFIG = {
  ok: true,
  versi: "2026-10-25T14:44:08+07:00",
  tugas: [
    { jenjang: "Mahasiswa", tugas: "Kerangka/outline (makalah, esai, proposal)", hargaDasar: 1000, unit: 1, satuan: "kerangka", tarif: 0, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Ringkasan materi/jurnal", hargaDasar: 2000, unit: 2, satuan: "hlm", tarif: 500, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Resume/review jurnal atau buku", hargaDasar: 3000, unit: 2, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Draf esai/opini", hargaDasar: 3000, unit: 3, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Draf makalah", hargaDasar: 5000, unit: 5, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Analisis/studi kasus", hargaDasar: 5000, unit: 3, satuan: "hlm", tarif: 1500, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Laporan praktikum/kegiatan", hargaDasar: 5000, unit: 5, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Proposal (kegiatan, lomba, penelitian)", hargaDasar: 7000, unit: 8, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "PPT presentasi", hargaDasar: 3000, unit: 10, satuan: "slide", tarif: 500, formatStandar: "PPT" },
    { jenjang: "Mahasiswa", tugas: "Olah data + interpretasi", hargaDasar: 5000, unit: 2, satuan: "hlm", tarif: 1500, formatStandar: "Excel" },
    { jenjang: "Mahasiswa", tugas: "Soal latihan + pembahasan dari materi", hargaDasar: 2000, unit: 10, satuan: "soal", tarif: 200, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Perbaikan bahasa dan format (APA, daftar pustaka)", hargaDasar: 1000, unit: 10, satuan: "hlm", tarif: 200, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "CV, surat lamaran, motivation letter", hargaDasar: 3000, unit: 1, satuan: "dokumen", tarif: 0, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Coding tugas kecil", hargaDasar: 7000, unit: 1, satuan: "modul", tarif: 3000, formatStandar: "Teks" },
    { jenjang: "Mahasiswa", tugas: "Tugas lainnya", hargaDasar: 3000, unit: 2, satuan: "unit", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Kerangka karangan/esai", hargaDasar: 1000, unit: 1, satuan: "kerangka", tarif: 0, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Ringkasan materi pelajaran", hargaDasar: 1000, unit: 2, satuan: "hlm", tarif: 500, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Resume buku/film/artikel", hargaDasar: 2000, unit: 2, satuan: "hlm", tarif: 500, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Draf karangan/esai", hargaDasar: 3000, unit: 2, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Draf makalah/laporan observasi", hargaDasar: 4000, unit: 4, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Proposal/laporan kegiatan OSIS/ekskul", hargaDasar: 4000, unit: 4, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "PPT presentasi", hargaDasar: 2000, unit: 8, satuan: "slide", tarif: 500, formatStandar: "PPT" },
    { jenjang: "Pelajar", tugas: "Soal latihan + pembahasan", hargaDasar: 1000, unit: 10, satuan: "soal", tarif: 200, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Perbaikan tata bahasa", hargaDasar: 1000, unit: 10, satuan: "hlm", tarif: 200, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Surat, CV, motivasi beasiswa", hargaDasar: 2000, unit: 1, satuan: "dokumen", tarif: 0, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Tugas lainnya", hargaDasar: 3000, unit: 2, satuan: "unit", tarif: 1000, formatStandar: "Word" }
  ],
  harga: {
    lampiranGratis: 20, blokLampiran: 10, tarifBlok: 1000, batasLampiran: 100,
    tambahanFormat: 5000, tambahanSitasi: 15000, tambahanPenjelasan: 10000,
    pengaliAtas: 1.2, pengaliBawahLainnya: 0.8, pengaliAtasLainnya: 1.6,
    pembulatan: 1000, dp: 0.5, revisiGratis: 2, revisiTambahan: 3000,
    tenggat: [
      { minHari: 0, pengali: 1.5 }, { minHari: 1, pengali: 1.25 },
      { minHari: 3, pengali: 1.1 }, { minHari: 5, pengali: 1.0 }
    ]
  }
};
