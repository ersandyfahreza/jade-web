// Salinan cadangan tab Tugas dan Harga. Isinya harus sama dengan Google Sheets.
// Perbarui file ini setiap kali harga di Sheets berubah.
const FALLBACK_CONFIG = {
  ok: true,
  versi: "2026-10-24T18:00:00+07:00",
  tugas: [
    { jenjang: "Mahasiswa", tugas: "Kerangka/outline (makalah, esai, proposal)", hargaDasar: 10000, unit: 1, satuan: "kerangka", tarif: 0, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Ringkasan materi/jurnal", hargaDasar: 10000, unit: 2, satuan: "hlm", tarif: 3000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Resume/review jurnal atau buku", hargaDasar: 20000, unit: 2, satuan: "hlm", tarif: 5000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Draf esai/opini", hargaDasar: 25000, unit: 3, satuan: "hlm", tarif: 7000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Draf makalah", hargaDasar: 40000, unit: 5, satuan: "hlm", tarif: 6000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Analisis/studi kasus", hargaDasar: 35000, unit: 3, satuan: "hlm", tarif: 8000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Laporan praktikum/kegiatan", hargaDasar: 45000, unit: 5, satuan: "hlm", tarif: 7000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Proposal (kegiatan, lomba, penelitian)", hargaDasar: 55000, unit: 8, satuan: "hlm", tarif: 6000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "PPT presentasi", hargaDasar: 25000, unit: 10, satuan: "slide", tarif: 2000, formatStandar: "PPT" },
    { jenjang: "Mahasiswa", tugas: "Olah data + interpretasi", hargaDasar: 35000, unit: 2, satuan: "hlm", tarif: 8000, formatStandar: "Excel" },
    { jenjang: "Mahasiswa", tugas: "Soal latihan + pembahasan dari materi", hargaDasar: 15000, unit: 10, satuan: "soal", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Perbaikan bahasa dan format (APA, daftar pustaka)", hargaDasar: 10000, unit: 10, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "CV, surat lamaran, motivation letter", hargaDasar: 15000, unit: 1, satuan: "dokumen", tarif: 0, formatStandar: "Word" },
    { jenjang: "Mahasiswa", tugas: "Coding tugas kecil", hargaDasar: 50000, unit: 1, satuan: "modul", tarif: 30000, formatStandar: "Teks" },
    { jenjang: "Mahasiswa", tugas: "Tugas lainnya", hargaDasar: 25000, unit: 2, satuan: "unit", tarif: 6000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Kerangka karangan/esai", hargaDasar: 7000, unit: 1, satuan: "kerangka", tarif: 0, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Ringkasan materi pelajaran", hargaDasar: 7000, unit: 2, satuan: "hlm", tarif: 2000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Resume buku/film/artikel", hargaDasar: 12000, unit: 2, satuan: "hlm", tarif: 3000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Draf karangan/esai", hargaDasar: 15000, unit: 2, satuan: "hlm", tarif: 5000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Draf makalah/laporan observasi", hargaDasar: 25000, unit: 4, satuan: "hlm", tarif: 5000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Proposal/laporan kegiatan OSIS/ekskul", hargaDasar: 25000, unit: 4, satuan: "hlm", tarif: 5000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "PPT presentasi", hargaDasar: 15000, unit: 8, satuan: "slide", tarif: 1500, formatStandar: "PPT" },
    { jenjang: "Pelajar", tugas: "Soal latihan + pembahasan", hargaDasar: 10000, unit: 10, satuan: "soal", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Perbaikan tata bahasa", hargaDasar: 8000, unit: 10, satuan: "hlm", tarif: 1000, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Surat, CV, motivasi beasiswa", hargaDasar: 12000, unit: 1, satuan: "dokumen", tarif: 0, formatStandar: "Word" },
    { jenjang: "Pelajar", tugas: "Tugas lainnya", hargaDasar: 20000, unit: 2, satuan: "unit", tarif: 5000, formatStandar: "Word" }
  ],
  harga: {
    lampiranGratis: 20, blokLampiran: 10, tarifBlok: 3000, batasLampiran: 100,
    tambahanFormat: 5000, tambahanSitasi: 15000, tambahanPenjelasan: 10000,
    pengaliAtas: 1.2, pengaliBawahLainnya: 0.8, pengaliAtasLainnya: 1.6,
    pembulatan: 1000, dp: 0.5, revisiGratis: 2, revisiTambahan: 5000,
    tenggat: [
      { minHari: 0, pengali: 1.5 }, { minHari: 1, pengali: 1.25 },
      { minHari: 3, pengali: 1.1 }, { minHari: 5, pengali: 1.0 }
    ]
  }
};
