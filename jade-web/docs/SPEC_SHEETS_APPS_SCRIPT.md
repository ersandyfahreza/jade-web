# SPEC Google Sheets dan Apps Script

## 1. Gambaran

- **Google Sheets** menyimpan harga, daftar tugas, dan pesanan. Dibuat dari `Template_Jade_Sheets.xlsx`.
- **Apps Script** adalah kode kecil yang menempel di file Sheets. Ia menjadi "pintu" web: web **membaca** harga dan daftar tugas, dan **menulis** pesanan baru.
- Web hanya bicara dengan Apps Script. Web tidak pernah membuka Sheets langsung.

```
Browser klien  <-->  Apps Script Web App (satu URL)  <-->  Google Sheets (privat)
```

## 2. Tab dan kolom

Nama tab **harus persis**: `Pesanan`, `Tugas`, `Harga`. Tab lain (Petunjuk, Kalkulator, Contoh Uji, Rekap) tidak dipakai kode.

**Aturan penting: kode membaca dan menulis berdasarkan NAMA HEADER (baris 1) dan label, bukan posisi kolom atau baris.** Dengan begitu menambah atau menggeser kolom tidak merusak kode.

### Tab `Tugas` (dibaca)

Header baris 1: `Kunci (otomatis)`, `Jenjang`, `Tugas`, `Harga dasar (Rp)`, `Unit sudah termasuk`, `Satuan`, `Tarif tambahan per unit (Rp)`, `Format standar`, `Aktif`.

Hanya baris dengan `Aktif` = `Ya` dikirim ke web. Pemetaan ke JSON:

| Header | Kunci JSON | Tipe |
|---|---|---|
| Jenjang | `jenjang` | string ("Pelajar" / "Mahasiswa") |
| Tugas | `tugas` | string |
| Harga dasar (Rp) | `hargaDasar` | integer |
| Unit sudah termasuk | `unit` | integer |
| Satuan | `satuan` | string |
| Tarif tambahan per unit (Rp) | `tarif` | integer |
| Format standar | `formatStandar` | string (Teks/Word/PDF/PPT/Excel) |

### Tab `Harga` (dibaca)

Tata letak: label di kolom A, nilai di kolom B. Kode mencari berdasarkan **teks label persis**:

| Label di kolom A | Kunci JSON | Tipe |
|---|---|---|
| Lampiran gratis (halaman) | `lampiranGratis` | integer |
| Ukuran blok lampiran berbayar (halaman) | `blokLampiran` | integer |
| Tarif per blok (Rp) | `tarifBlok` | integer |
| Batas lampiran (halaman) | `batasLampiran` | integer |
| Format file di luar standar tugas (Rp) | `tambahanFormat` | integer |
| Sitasi diperiksa manual, maks 10 referensi (Rp) | `tambahanSitasi` | integer |
| Penjelasan hasil + poin kunci (Rp) | `tambahanPenjelasan` | integer |
| Pengali batas atas (tugas biasa) | `pengaliAtas` | desimal |
| Pengali batas bawah (Tugas lainnya) | `pengaliBawahLainnya` | desimal |
| Pengali batas atas (Tugas lainnya) | `pengaliAtasLainnya` | desimal |
| Pembulatan ke atas (Rp) | `pembulatan` | integer |
| DP (persen dari harga final) | `dp` | desimal pecahan (0,5 = 50%) |
| Revisi gratis (kali) | `revisiGratis` | integer |
| Revisi tambahan (Rp per revisi) | `revisiTambahan` | integer |

Tabel **faktor tenggat**: baris-baris tepat di bawah header `Sisa hari (minimal)` / `Pengali`, sampai baris kosong pertama. Jadi `tenggat`: daftar `{ "minHari": integer, "pengali": desimal }`, diurutkan naik berdasarkan `minHari`. Aturan pakai: ambil baris dengan `minHari` terbesar yang **≤ sisa hari**. Jika sisa hari kurang dari nilai terkecil (negatif), pakai pengali baris pertama.

Jika label tidak ditemukan atau nilainya bukan angka, Apps Script mengembalikan `ok:false` dengan pesan menyebut label yang bermasalah (agar mudah diperbaiki).

### Tab `Pesanan` (ditulis, tidak pernah dibaca web)

Header baris 1 (persis): `Kode pesanan`, `Waktu masuk`, `Jenjang`, `Prodi / Kelas`, `Mata kuliah / pelajaran`, `Jenis tugas`, `Tugas lainnya (teks)`, `Jumlah file lampiran`, `Total hlm lampiran`, `Target output`, `Format output`, `Tenggat`, `Opsi tambahan`, `Kebutuhan detail`, `Ketentuan tugas`, `Estimasi bawah (Rp)`, `Estimasi atas (Rp)`, `Status`, `Harga final (Rp)`, `DP diterima (Rp)`, `Status bayar`, `Penanggung jawab`, `Pemeriksa hasil`, `Biaya (Rp)`, `Waktu kerja (menit)`, `Laba (Rp)`, `Catatan`, **`Semester`**.

**Tindakan manual pemilik (sekali saja):** tab Pesanan versi template belum punya kolom Semester. Ketik `Semester` di sel header kolom paling kanan (tepat setelah `Catatan`, yaitu AB1).

Saat pesanan baru masuk, kode mengisi hanya kolom yang datang dari web. Kolom `Laba (Rp)` berisi rumus, **jangan ditimpa** (tulis ke baris baru tanpa menyentuh kolom itu). Kolom yang tidak diisi dibiarkan kosong.

## 3. Kontrak data (API)

Satu alamat (URL) Web App dengan dua aksi.

### 3.1 Membaca: `GET {URL}?action=config`

Respons JSON:

```json
{
  "ok": true,
  "versi": "2026-10-24T18:00:00+07:00",
  "tugas": [
    { "jenjang": "Mahasiswa", "tugas": "Draf makalah", "hargaDasar": 40000, "unit": 5,
      "satuan": "hlm", "tarif": 6000, "formatStandar": "Word" }
  ],
  "harga": {
    "lampiranGratis": 20, "blokLampiran": 10, "tarifBlok": 3000, "batasLampiran": 100,
    "tambahanFormat": 5000, "tambahanSitasi": 15000, "tambahanPenjelasan": 10000,
    "pengaliAtas": 1.2, "pengaliBawahLainnya": 0.8, "pengaliAtasLainnya": 1.6,
    "pembulatan": 1000, "dp": 0.5, "revisiGratis": 2, "revisiTambahan": 5000,
    "tenggat": [ {"minHari":0,"pengali":1.5}, {"minHari":1,"pengali":1.25},
                 {"minHari":3,"pengali":1.1}, {"minHari":5,"pengali":1.0} ]
  }
}
```

**Aturan keras:** respons ini **tidak boleh** memuat data dari tab Pesanan atau tab lain.

### 3.2 Menulis: `POST {URL}`

- Badan permintaan: teks JSON dikirim dengan `Content-Type: text/plain;charset=utf-8` (agar browser tidak melakukan *preflight* yang tidak didukung Apps Script).
- Contoh dari web: `fetch(URL, { method: "POST", body: JSON.stringify(data), redirect: "follow" })`. Respons dibaca sebagai JSON.

Badan:

```json
{
  "website": "",
  "jenjang": "Mahasiswa",
  "prodiKelas": "Ekonomi Pertanian dan Agribisnis",
  "semester": 3,
  "matkul": "Pengantar Ilmu Ekonomi",
  "tugas": "Draf makalah",
  "tugasLainnya": "",
  "jumlahFile": 2,
  "totalHalaman": 30,
  "target": 8,
  "format": "PDF",
  "tenggat": "2026-10-28",
  "opsi": ["Sitasi diperiksa"],
  "kebutuhan": "…",
  "ketentuan": "…",
  "estimasiBawah": 88000,
  "estimasiAtas": 106000
}
```

Respons berhasil: `{ "ok": true, "kode": "JD-0012" }`
Respons gagal: `{ "ok": false, "error": "pesan singkat" }`

### 3.3 Validasi di Apps Script (wajib, jangan hanya mengandalkan web)

| Pemeriksaan | Aturan |
|---|---|
| Kolom jebakan | `website` harus kosong. Jika terisi: balas `ok:true` palsu dengan kode `JD-0000`, **jangan tulis apa pun** |
| Jenjang | Hanya `Pelajar` atau `Mahasiswa` |
| Tugas | Harus ada di tab Tugas, jenjang cocok, `Aktif` = `Ya` |
| Teks | Panjang sesuai Bagian 2 SPEC layar (prodi/kelas, mata kuliah maks 80; tugas lainnya maks 100; kebutuhan 10 sampai 1000; ketentuan 1 sampai 1000) |
| Angka | Bulat dan dalam rentang (semester 1 sampai 14, jumlah file 0 sampai 20, total halaman 0 sampai 1000, target 1 sampai 200, estimasi 0 sampai 10.000.000) |
| Format | Salah satu dari Teks, Word, PDF, PPT, Excel |
| Tenggat | Format `YYYY-MM-DD` |
| Duplikat | Jika baris terbaru berisi data identik (jenjang, tugas, kebutuhan) dan masuk kurang dari 60 detik lalu, balas `ok:false` "Terlalu banyak percobaan" |
| Ukuran | Seluruh badan maksimal 10.000 karakter |

Server **tidak** menghitung ulang estimasi di versi 1 (sesuai PRD). Estimasi dari web dicatat apa adanya.

### 3.4 Keamanan data masuk (wajib)

Teks dari klien yang akan ditulis ke Sheets, **jika diawali `=`, `+`, `-`, atau `@`, diawali dengan tanda `'`**. Ini mencegah "formula injection" (klien menulis rumus yang dijalankan Sheets). Format sel kolom teks diset sebagai teks biasa.

### 3.5 Kode pesanan

- Format `JD-` diikuti angka 4 digit (contoh `JD-0012`).
- Dibuat di Apps Script, **di dalam kunci** (`LockService.getScriptLock()`, tunggu maksimal 10 detik) supaya dua pesanan serentak tidak mendapat kode yang sama.
- Nomor = angka terbesar pada kolom `Kode pesanan` + 1. Abaikan kode `JD-0000` (baris contoh) dan kode berawalan `JD-OFF-`.
- Status awal pesanan: `Draf`. `Waktu masuk` diisi waktu server zona Asia/Jakarta, format `yyyy-MM-dd HH:mm:ss`.
- `Opsi tambahan` ditulis sebagai teks digabung koma. `Prodi / Kelas` diisi prodi (mahasiswa) atau "Kelas 10/11/12" (pelajar). `Semester` hanya diisi untuk mahasiswa.

## 4. Sisi web

- Alamat Web App dan nomor WhatsApp ada di `assets/js/config.js`.
- Saat halaman dibuka: ambil `?action=config` dengan batas waktu 8 detik. Jika berhasil, simpan salinan di `localStorage` (kunci `jade_config`, dengan cap waktu) dan pakai. Jika gagal: pakai salinan `localStorage` yang usianya kurang dari 24 jam. Jika tidak ada: pakai `data/fallback.js`, dan tampilkan pesan "Data harga gagal dimuat" (SPEC layar Bagian 9).
- `data/fallback.js` berisi struktur yang **sama persis** dengan respons `config` di atas, diisi dari nilai awal Template. **Ingatkan pemilik memperbarui file ini setiap kali harga di Sheets berubah.**
- Saat kirim: batas waktu 8 detik. Gagal atau lambat: ikuti aturan "Sheets gagal" di SPEC layar Bagian 5.
- Jeda antar pengiriman dari satu browser: 20 detik (cegah klik berulang), pesan "Terlalu banyak percobaan".

## 5. Langkah pemasangan untuk pemilik (pemula)

Dikerjakan **setelah Tahap 4** di `BUILD_PLAN.md` (saat web sudah bisa menghitung). Kode `Code.gs` ditulis Claude Code di folder `apps-script/`.

1. Buka Google Drive, unggah `Template_Jade_Sheets.xlsx`, buka dengan Google Sheets, lalu **File > Simpan sebagai Google Spreadsheet**. Beri nama "Jade - Database".
2. Di tab **Pesanan**, ketik `Semester` di sel header paling kanan (AB1).
3. Periksa tab **Contoh Uji**: kolom Cocok harus OK semua. Kalau CEK, hentikan dan laporkan.
4. Di Google Sheets: **Ekstensi > Apps Script**. Hapus isi bawaan, tempel seluruh isi `apps-script/Code.gs`, lalu **Simpan**.
5. Klik **Terapkan > Penerapan baru** (Deploy > New deployment). Jenis: **Aplikasi web** (Web app).
   - Jalankan sebagai: **Saya** (Execute as: Me).
   - Pengguna yang punya akses: **Siapa saja** (Anyone).
6. Klik **Terapkan**. Jika muncul peringatan "Google belum memverifikasi aplikasi ini", pilih **Lanjutan** lalu **Buka (nama proyek)**, lalu **Izinkan**. Ini normal untuk script buatan sendiri.
7. Salin **URL Aplikasi web** (berakhiran `/exec`). Tempel ke `assets/js/config.js` pada kunci `ALAMAT_APPS_SCRIPT`.
8. Cek di browser: buka `URL?action=config`. Harus tampil teks JSON dengan `"ok": true`.
9. **Setiap kali kode Apps Script diubah:** Terapkan > **Kelola penerapan** > ikon pensil > Versi: **Versi baru** > Terapkan. URL tetap sama. Jika lupa langkah ini, perubahan tidak aktif.

## 6. Risiko khusus bagian ini

| Risiko | Penanganan |
|---|---|
| Siapa pun yang tahu URL bisa mengirim data sampah | Kolom jebakan, validasi ketat, batas panjang, penolakan duplikat, pemeriksaan Sheets berkala. Nanti bisa ditambah pemeriksaan tambahan |
| Rumus berbahaya lewat teks klien | Aturan awalan `'` (Bagian 3.4) |
| Dua pesanan serentak berkode sama | Kunci (Bagian 3.5) |
| Kuota harian Apps Script habis | Cukup untuk skala awal. Jika sering gagal, web tetap membuka WhatsApp |
| Pemilik menggeser atau mengganti nama tab, header, atau label | Kode mengembalikan pesan kesalahan yang menyebut apa yang hilang. Jangan ganti nama tab dan label |
| Data pribadi masuk ke kolom bebas | Peringatan di web dan pemeriksaan berkala. Tidak ada kolom khusus data pribadi |
| File Sheets dibagikan terlalu luas | Bagikan **hanya** ke dua admin. URL Web App tidak membuka file Sheets |
