// Fungsi hitung estimasi Jade. Murni: tidak menyentuh halaman (tanpa document/window).
// Dipakai oleh web (app.js) dan halaman uji (tests/uji-harga.html). Semua tarif dari config.

// Bulatkan ke 2 desimal dulu (meniru ROUND(x,2) di Sheets), lalu ke atas ke kelipatan `kelipatan`.
function bulatkanAtas(x, kelipatan) {
  return Math.ceil(Math.round(x * 100) / 100 / kelipatan) * kelipatan;
}

// Rentang tenggat yang berlaku untuk `sisa` hari: { minHari, maksHari (null = tanpa batas atas), pengali }, atau null
function cariTenggat(config, sisa) {
  const urut = [...config.harga.tenggat].sort((a, b) => a.minHari - b.minHari);
  const cocok = urut.filter((x) => x.minHari <= sisa);
  const band = cocok.pop();
  if (!band) return null;
  const berikut = urut[cocok.length + 1];
  return { minHari: band.minHari, maksHari: berikut ? berikut.minHari - 1 : null, pengali: band.pengali };
}

// Tanggal `waktu` di zona Asia/Jakarta, format YYYY-MM-DD
function tanggalJakarta(waktu) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(waktu);
}

// Selisih hari antara dua tanggal YYYY-MM-DD; NaN jika tenggat kosong
function hitungSisaHari(tenggat, hariIni) {
  return tenggat ? Math.round((Date.parse(tenggat + "T00:00:00Z") - Date.parse(hariIni + "T00:00:00Z")) / 864e5) : NaN;
}

// Teks bantuan di bawah tenggat, contoh "Sisa 2 hari. Tenggat 1-2 hari: biaya x1,25". Faktor x1 tidak ditulis.
function labelTenggat(config, sisa) {
  if (!(sisa >= 0)) return "";
  const teks = `Sisa ${sisa} hari`;
  const band = cariTenggat(config, sisa);
  if (!band || band.pengali === 1) return teks;
  const rentang = band.maksHari === null ? `${band.minHari} hari atau lebih`
    : band.maksHari === band.minHari ? `${band.minHari} hari` : `${band.minHari}-${band.maksHari} hari`;
  return `${teks}. Tenggat ${rentang}: biaya x${String(band.pengali).replace(".", ",")}`;
}

// isian: { jenjang, tugas, target, halaman, sisaHari, format, sitasi, penjelasan }
// Hasil: { status: "ok", bawah, atas, lainnya, hariIni, faktor }
//     atau { status: "hubungi" }  (lampiran melebihi batas, tanpa angka)
//     atau { status: "tidakBisa", alasan: "tugas" | "target" | "halaman" | "tenggat" | "aturanTenggat" }
function hitungEstimasi(config, isian) {
  const h = config.harga;
  const t = config.tugas.find((x) => x.jenjang === isian.jenjang && x.tugas === isian.tugas);
  if (!t) return { status: "tidakBisa", alasan: "tugas" };
  if (!Number.isInteger(isian.target) || isian.target < 1 || isian.target > 200) return { status: "tidakBisa", alasan: "target" };
  if (!Number.isInteger(isian.sisaHari) || isian.sisaHari < 0) return { status: "tidakBisa", alasan: "tenggat" };
  if (!Number.isInteger(isian.halaman) || isian.halaman < 0) return { status: "tidakBisa", alasan: "halaman" };
  if (isian.halaman > h.batasLampiran) return { status: "hubungi" };

  const tambahanUnit = Math.max(0, isian.target - t.unit) * t.tarif;
  const tambahanLampiran = isian.halaman <= h.lampiranGratis
    ? 0
    : Math.ceil((isian.halaman - h.lampiranGratis) / h.blokLampiran) * h.tarifBlok;
  const subtotal = t.hargaDasar + tambahanUnit + tambahanLampiran;

  const band = cariTenggat(config, isian.sisaHari);
  if (!band) return { status: "tidakBisa", alasan: "aturanTenggat" }; // tabel tenggat di Harga kosong/tidak punya baris 0
  const faktor = band.pengali;

  // shortcut: "Teks" (chat WhatsApp) bebas tambahan format sesuai RENCANA_UJI kasus 4, 5, A-H; pindahkan ke tab Harga bila aturannya berubah
  const opsi = (isian.format !== t.formatStandar && isian.format !== "Teks" ? h.tambahanFormat : 0)
    + (isian.sitasi ? h.tambahanSitasi : 0)
    + (isian.penjelasan ? h.tambahanPenjelasan : 0);
  const langkah5 = Math.round(subtotal * faktor * 100) / 100 + opsi;

  const lainnya = t.tugas === "Tugas lainnya";
  const bawah = bulatkanAtas(lainnya ? langkah5 * h.pengaliBawahLainnya : langkah5, h.pembulatan);
  const atas = bulatkanAtas(lainnya ? langkah5 * h.pengaliAtasLainnya : bawah * h.pengaliAtas, h.pembulatan);
  return { status: "ok", bawah, atas, lainnya, hariIni: isian.sisaHari === 0, faktor };
}
