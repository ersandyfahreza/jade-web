# CLAUDE.md: Proyek Jade (web estimasi biaya dan pemesanan)

## Apa ini

Web satu halaman untuk klien (pelajar SMA/SMK/MA kelas 10-12 dan mahasiswa D3/D4/S1) yang menghitung **estimasi biaya** jasa pendampingan tugas, lalu mengirim pesanan ke **WhatsApp** admin. Pesanan juga dicatat ke **Google Sheets**. Nama "Jade" bersifat sementara. SMP tidak dilayani.

## Cara bekerja dengan pemilik proyek

- Pemilik proyek adalah **pemula** (belum paham coding). Jelaskan dalam **bahasa Indonesia sederhana**, dari langkah pertama sampai terakhir. Beri arti singkat untuk setiap istilah teknis baru.
- Kerjakan **satu tahap** dari `docs/BUILD_PLAN.md` per permintaan. Berhenti setelah "tanda berhasil" tahap itu terpenuhi, lalu jelaskan: apa yang dibuat, file apa yang berubah, dan cara pemilik mengeceknya sendiri.
- **Jangan menambah fitur** di luar `docs/PRD_Jade_v2.md`. Kalau ada ide, usulkan dulu dan tunggu persetujuan.
- Kalau dokumen saling bertentangan atau ada hal yang belum jelas, **tanya**. Jangan menebak.
- Sebelum menyatakan tahap selesai, jalankan pengujian yang relevan dari `docs/RENCANA_UJI.md` dan laporkan hasilnya apa adanya, termasuk yang gagal.
- Jangan mengubah isi Google Sheets pemilik tanpa diminta. Hanya sarankan perubahan.

## Dokumen (baca sesuai kebutuhan tahap)

| Dokumen | Isi |
|---|---|
| `docs/PRD_Jade_v2.md` | Tujuan, fitur, rumus, aturan bisnis, kebijakan, daftar tugas dan harga awal |
| `docs/BUILD_PLAN.md` | Tahap pembangunan dan tanda berhasil tiap tahap |
| `docs/SPEC_LAYAR_DAN_TEKS.md` | Susunan halaman, isian form, perilaku, format pesan WhatsApp, semua teks tampilan |
| `docs/SPEC_SHEETS_APPS_SCRIPT.md` | Struktur Google Sheets, kontrak data (API) Apps Script, langkah deploy |
| `docs/DESIGN.md` | Warna, huruf, jarak, komponen |
| `docs/RENCANA_UJI.md` | Kasus uji harga dan daftar periksa sebelum rilis |

## Teknologi

HTML, CSS, JavaScript biasa. **Tanpa framework dan tanpa langkah build.** Hosting statis di Cloudflare Pages. Database: Google Sheets lewat Google Apps Script Web App.

## Struktur folder

```
jade-web/
  CLAUDE.md
  index.html
  assets/
    css/style.css
    js/config.js        (URL Apps Script, nomor WhatsApp, batas waktu)
    js/pricing.js       (fungsi hitung estimasi, tanpa akses ke halaman)
    js/app.js           (form, tampilan, WhatsApp, kirim ke Sheets)
  data/fallback.js      (salinan tugas dan harga untuk cadangan)
  apps-script/Code.gs   (salinan kode Apps Script, untuk dokumentasi)
  tests/uji-harga.html  (halaman uji hitung, buka di browser)
  docs/                 (dokumen di atas)
```

## Aturan yang tidak boleh dilanggar

1. **Uang = bilangan bulat Rupiah.** Faktor desimal (tenggat, pengali kisaran) dibulatkan ke 2 desimal dulu (`Math.round(x * 100) / 100`), baru dibulatkan **ke atas** ke kelipatan Rp1.000. Ini meniru `ROUND(x,2)` lalu `CEILING` di Sheets.
2. **Harga dan daftar tugas tidak ditulis permanen di kode.** Dibaca dari Sheets (tab Tugas dan Harga) lewat Apps Script. Satu-satunya salinan di kode adalah `data/fallback.js` untuk cadangan, dan isinya harus sama dengan Sheets.
3. **Satu fungsi hitung** di `assets/js/pricing.js`. Fungsi ini tidak menyentuh halaman (DOM), dan dipakai oleh web dan halaman uji.
4. **WhatsApp harus tetap terbuka** walau Sheets gagal atau lambat (batas waktu 8 detik).
5. **Tidak menyimpan data pribadi sensitif.** Tidak ada isian nomor HP, KTP, rekening, atau alamat. Tidak ada pelacak iklan.
6. **Semua teks untuk klien** diambil dari `docs/SPEC_LAYAR_DAN_TEKS.md`. Jangan mengarang teks sendiri. Layanan disebut "pendampingan" dan "draf bahan belajar".
7. **Estimasi selalu berupa kisaran**, dengan teks peringatan di dekatnya.
8. **Teks bebas dari klien tidak tepercaya.** Tampilkan sebagai teks (`textContent`), bukan HTML. Di Apps Script, awali dengan tanda `'` bila teks diawali `=`, `+`, `-`, atau `@`.
9. **Tidak ada kunci rahasia atau token** di repositori. URL Apps Script dan nomor WhatsApp memang publik.
10. **Mobile first** (uji di lebar 360 px). Target sentuh minimal 44 px. Warna dan kontras mengikuti `docs/DESIGN.md`.
11. Estimasi dihitung dengan tanggal hari ini zona **Asia/Jakarta**.

## Perintah

- Menjalankan di komputer sendiri: `python3 -m http.server 8000`, lalu buka `http://localhost:8000`
- Uji hitung: buka `http://localhost:8000/tests/uji-harga.html`. Semua baris harus bertuliskan OK.
- Publikasi: push ke GitHub (cabang `main`). Cloudflare Pages menayangkan otomatis.

## Git

Commit kecil per tahap dengan pesan Indonesia singkat. Jangan commit file rahasia.
