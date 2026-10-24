# Rencana Pembangunan (BUILD_PLAN)

Cara pakai: kerjakan **satu tahap per sesi** di Claude Code. Setiap tahap punya tujuan, prompt siap tempel, dan **tanda berhasil**. Jangan lanjut ke tahap berikutnya sebelum tanda berhasil terpenuhi. Hemat jatah Claude: tahap kecil, hasil dicek, baru lanjut.

## Kamus kecil (istilah yang akan sering muncul)

| Istilah | Artinya |
|---|---|
| Repositori (repo) | Folder proyek yang disimpan di GitHub |
| Commit | "Simpan" perubahan dengan catatan singkat |
| Push | Mengirim commit ke GitHub |
| Deploy | Menayangkan web agar bisa dibuka orang lain |
| Apps Script | Kode kecil di dalam Google Sheets, jadi "pintu" bagi web |
| Fallback | Cadangan yang dipakai kalau sumber utama gagal |
| Server lokal | Cara membuka web di komputer sendiri untuk dicoba (`python3 -m http.server 8000`) |

## Tahap 0: Persiapan (dikerjakan pemilik, tanpa Claude Code)

| No | Yang disiapkan | Selesai jika |
|---|---|---|
| 1 | Putuskan hal terbuka di PRD Bagian 15 yang perlu untuk tahap awal | Nomor 1 dan 2 sudah `[x]`. Nomor 3 (kebijakan) boleh memakai usulan dulu, tapi harus diputuskan sebelum rilis |
| 2 | Buat repositori baru kosong di GitHub (nama contoh `jade-web`) | Repo ada, privat atau publik |
| 3 | Salin folder `jade-web` ini ke komputer, hubungkan ke repo itu | Isi folder muncul di GitHub |
| 4 | Pastikan Claude Code bisa dibuka di folder proyek | Perintah `claude` jalan di folder tersebut |
| 5 | Pastikan akun Cloudflare masuk dan terhubung ke GitHub | Bisa membuat proyek Pages |
| 6 | Impor `Template_Jade_Sheets.xlsx` ke Google Sheets dan tambah header `Semester` di AB1 tab Pesanan (lihat `SPEC_SHEETS_APPS_SCRIPT.md` Bagian 5, langkah 1-3) | Tab Contoh Uji, kolom Cocok, OK semua |
| 7 | Konfirmasi kode warna `#F2F0EF` (kode awal tertulis dengan huruf O) dan nomor WhatsApp | PRD keputusan 9 dan 2 terjawab |

**Tanda berhasil tahap 0:** semua baris di atas selesai.

## Tahap 1: Kerangka halaman dan gaya

**Tujuan:** halaman statis yang terlihat benar di HP, belum ada logika.

**Prompt:**
```
Baca CLAUDE.md, docs/SPEC_LAYAR_DAN_TEKS.md (Bagian 1 dan 8) dan docs/DESIGN.md.
Kerjakan Tahap 1 saja: buat index.html, assets/css/style.css, dan assets/js/config.js (isi
nomor WhatsApp 6289619114292 dan batas waktu 8 detik; alamat Apps Script dibiarkan kosong dulu).
Halaman berisi header, pembuka, cara kerja, kerangka form (belum berfungsi), daftar terima dan
tolak, FAQ, dan footer. Pakai teks persis dari spesifikasi. Setelah selesai, jelaskan langkah
demi langkah cara membukanya lewat server lokal.
```

**Tanda berhasil:** halaman terbuka di `http://localhost:8000`, tampil rapi di lebar 360 px, warna sesuai DESIGN.md, tidak ada gulir ke samping.

## Tahap 2: Form yang berubah sesuai pilihan

**Tujuan:** form bekerja (belum menghitung), memakai data cadangan.

**Prompt:**
```
Baca CLAUDE.md dan docs/SPEC_LAYAR_DAN_TEKS.md (Bagian 2, 3, 7, 9) serta docs/PRD_Jade_v2.md
Lampiran A. Kerjakan Tahap 2 saja: buat data/fallback.js dengan struktur persis seperti
respons config di docs/SPEC_SHEETS_APPS_SCRIPT.md Bagian 3.1, isinya dari Lampiran A PRD dan
tab Harga. Lalu buat assets/js/app.js agar jenjang mengubah isian, jenis tugas mengubah label,
satuan, nilai awal target dan format standar, dan validasi per kolom dengan pesan kesalahan
resmi. Estimasi belum dihitung.
```

**Tanda berhasil:** semua perilaku di SPEC layar Bagian 3 nomor 2-4 dan 6-7 bekerja. Uji T3, T4, T7 lolos.

## Tahap 3: Mesin hitung estimasi

**Tujuan:** estimasi muncul dan tepat.

**Prompt:**
```
Baca CLAUDE.md, docs/PRD_Jade_v2.md Bagian 7, dan docs/RENCANA_UJI.md Bagian 1.
Kerjakan Tahap 3 saja: buat assets/js/pricing.js (fungsi murni tanpa akses halaman) dan
tests/uji-harga.html yang menghitung semua baris di RENCANA_UJI Bagian 1 dan menampilkan OK
atau CEK. Sambungkan ke kartu estimasi di halaman sesuai SPEC layar Bagian 4. Jangan ubah
angka uji. Jika ada baris CEK, perbaiki fungsi hitung, jangan ubah angka.
```

**Tanda berhasil:** semua baris di halaman uji OK, dan estimasi berubah langsung saat pilihan diubah. Kasus K, L, M berperilaku sesuai.

## Tahap 4: Pesan WhatsApp

**Tujuan:** tombol kirim membuka WhatsApp dengan pesan yang benar (belum mencatat ke Sheets).

**Prompt:**
```
Baca CLAUDE.md dan docs/SPEC_LAYAR_DAN_TEKS.md (Bagian 5 dan 6). Kerjakan Tahap 4 saja: buat
pesan WhatsApp persis seperti format di Bagian 6, tombol kirim dengan keadaannya, panel setelah
kirim (kode sementara JD-OFF- dulu), tombol Buka WhatsApp lagi dan Salin pesan. Teks panjang
dipotong 400 karakter. Gunakan window.location.href untuk membuka WhatsApp.
```

**Tanda berhasil:** uji S12 dan S11 (bagian WhatsApp) lolos di HP: terbuka ke nomor yang benar, pesan terisi dan rapi.

## Tahap 5: Sambungkan ke Google Sheets (baca harga)

**Tujuan:** harga dan daftar tugas diambil dari Sheets.

**Prompt:**
```
Baca CLAUDE.md dan docs/SPEC_SHEETS_APPS_SCRIPT.md. Kerjakan Tahap 5 saja: tulis
apps-script/Code.gs yang hanya berisi aksi membaca (GET ?action=config) sesuai Bagian 2 dan 3.1
(baca berdasarkan nama header dan label, hanya baris Aktif = Ya, jangan pernah mengembalikan
data tab Pesanan). Lalu ubah web agar memuat config dari alamat Apps Script dengan batas 8
detik, simpan di localStorage, dan gunakan data/fallback.js bila gagal. Jelaskan langkah
pemasangan ke pemilik dengan sangat rinci (Bagian 5).
```

**Tanda berhasil:** uji N lolos (ubah harga di Sheets, muat ulang, estimasi berubah). Uji S9 dan S13 lolos. Uji hitung di Tahap 3 masih OK semua.

## Tahap 6: Mencatat pesanan ke Sheets

**Tujuan:** setiap pesanan tercatat dengan kode berurutan.

**Prompt:**
```
Baca CLAUDE.md dan docs/SPEC_SHEETS_APPS_SCRIPT.md. Kerjakan Tahap 6 saja: tambahkan aksi
POST di apps-script/Code.gs dengan semua validasi di Bagian 3.3, perlindungan awalan tanda ' di
Bagian 3.4, kode pesanan berkunci di Bagian 3.5. Lalu sambungkan tombol kirim di web: kirim
dulu ke Sheets (batas 8 detik), lalu buka WhatsApp walaupun gagal. Cegah klik ganda dan beri
jeda 20 detik antar pengiriman. Jelaskan cara memperbarui penerapan Apps Script.
```

**Tanda berhasil:** uji S1 sampai S11 lolos.

## Tahap 7: Polesan

**Tujuan:** aksesibilitas, kecepatan, dan detail.

**Prompt:**
```
Baca CLAUDE.md, docs/DESIGN.md, dan docs/RENCANA_UJI.md Bagian 2. Kerjakan Tahap 7 saja:
periksa dan perbaiki kontras, label, urutan tab, aria-live pada estimasi, ukuran target
sentuh, judul dan deskripsi halaman, ikon situs sederhana. Jangan menambah fitur baru.
Laporkan hasil uji T1 sampai T10 dengan jujur.
```

**Tanda berhasil:** uji T1 sampai T10 lolos. (Opsional, hanya jika diminta pemilik: tautan "Lihat rincian" pada kartu estimasi.)

## Tahap 8: Uji menyeluruh dan publikasi

1. Jalankan seluruh `RENCANA_UJI.md` (Bagian 1, 2, 3) dan centang daftar periksa Bagian 4.
2. Push ke GitHub (cabang `main`).
3. Di Cloudflare: **Workers & Pages > Create > Pages > Connect to Git**, pilih repo. Build command **kosong**, output directory **`/`**. Deploy.
4. Buka alamat `.pages.dev` yang diberikan Cloudflare dan ulangi uji S1, S12, dan T1 di HP.

**Tanda berhasil:** web terbuka dari alamat Cloudflare, pesan masuk ke Sheets dan ke WhatsApp.

## Tahap 9: Soft launch dan evaluasi

1. Tawarkan ke 5-10 teman, minta mereka mengisi sungguhan (bisa pesanan percobaan).
2. Catat masukan dan perbaiki yang membingungkan.
3. Setelah 10 pesanan pertama, ikuti `RENCANA_UJI.md` Bagian 5 untuk mengevaluasi harga.

## Tips menghemat jatah Claude

- Satu tahap per sesi. Jangan minta "buatkan semuanya".
- Sebelum menjalankan prompt, pastikan tahap sebelumnya sudah lolos uji.
- Jika Claude Code salah arah, hentikan dan minta ia membaca ulang `CLAUDE.md` dan dokumen yang relevan.
- Kalau ada hal yang tidak dipahami, minta Claude Code menjelaskan dengan bahasa sederhana sebelum melanjutkan.
