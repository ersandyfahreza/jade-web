# SPEC Layar dan Teks

Semua teks di sini adalah **teks resmi** untuk tampilan. Claude Code memakainya apa adanya. Tanda `{{...}}` = nilai yang diisi dari Sheets atau kode. Gaya bahasa: Indonesia santai-sopan, memakai "kamu".

## 1. Susunan halaman (satu halaman, bagian dari atas ke bawah)

| No | Bagian | Isi |
|---|---|---|
| 1 | Header | Nama "Jade" dan tautan jangkar "Pesan sekarang" |
| 2 | Pembuka | Judul, subjudul, tombol "Mulai pesan" (menuju form) |
| 3 | Cara kerja | 4 langkah singkat |
| 4 | **Form pesanan** | Bagian inti (Bagian 2 dokumen ini) |
| 5 | Yang kami terima dan tidak kami terima | Dua daftar ringkas |
| 6 | Pertanyaan umum | 5-6 tanya-jawab |
| 7 | Footer | Catatan "dibantu AI", privasi singkat, kontak WhatsApp |

Di HP, kartu estimasi dan tombol kirim **menempel di bawah layar** selama form terlihat.

## 2. Form pesanan

Urutan isian dari atas ke bawah. "Wajib" berarti tombol kirim tidak aktif sebelum terisi.

### A. Jenjang

| Isian | Jenis | Pilihan |
|---|---|---|
| Jenjang | Dua tombol besar | **Pelajar** (SMA/SMK/MA) dan **Mahasiswa** (D3/D4/S1) |

Memilih jenjang **mengosongkan** isian di bawahnya (konteks, jenis tugas, target output) dan mengganti daftar yang tampil.

### B. Tentang tugasmu

| Isian | Jenjang | Jenis | Wajib | Aturan | Placeholder / bantuan |
|---|---|---|---|---|---|
| Prodi/jurusan | Mahasiswa | Teks | Ya | Maks 80 karakter | Contoh: Ekonomi Pertanian dan Agribisnis |
| Semester | Mahasiswa | Angka | Ya | Bulat 1 sampai 14 | Contoh: 3 |
| Mata kuliah | Mahasiswa | Teks | Ya | Maks 80 karakter | Contoh: Pengantar Ilmu Ekonomi |
| Kelas | Pelajar | Pilihan | Ya | 10, 11, 12 | |
| Mata pelajaran | Pelajar | Pilihan + "Lainnya" | Ya | Daftar di Bagian 7. "Lainnya" memunculkan kolom teks (maks 80) | |
| Jenis tugas | Keduanya | Pilihan | Ya | Dari data Sheets, sesuai jenjang. "Tugas lainnya" selalu paling bawah | Bantuan: "Tidak ada yang cocok? Pilih Tugas lainnya." |
| Nama/jenis tugas | Jika memilih "Tugas lainnya" | Teks | Ya | Maks 100 karakter | Contoh: Resume film dokumenter |
| Target output | Keduanya | Angka | Ya | Bulat, 1 sampai 200. Label memakai satuan tugas, contoh "Target output (hlm)". Nilai awal = jumlah yang sudah termasuk | Bantuan: "Sudah termasuk {{unit}} {{satuan}}. Kelebihannya dihitung tambahan." |

### C. Lampiran atau bahan

| Isian | Jenis | Wajib | Aturan | Bantuan |
|---|---|---|---|---|
| Jumlah file lampiran | Angka | Ya | Bulat 0 sampai 20 | "Lampiran dikirim lewat WhatsApp setelah kamu menekan tombol kirim." |
| Total halaman semua lampiran | Angka | Ya (tersembunyi jika jumlah file = 0, nilai dianggap 0) | Bulat 0 sampai 1000 | "{{lampiranGratis}} halaman pertama gratis. Selebihnya Rp{{tarifBlok}} per {{blokLampiran}} halaman." |

Jika total halaman > `batasLampiran` (100): estimasi tidak ditampilkan, lihat Bagian 4.

### D. Kebutuhanmu

| Isian | Jenis | Wajib | Aturan | Placeholder |
|---|---|---|---|---|
| Kebutuhan detail | Area teks | Ya | 10 sampai 1000 karakter, ada penghitung | "Ceritakan yang kamu butuhkan: topik, sudut pandang, hal yang harus ada, contoh yang kamu suka." |
| Ketentuan tugas | Area teks | Ya | 1 sampai 1000 karakter | "Contoh: format APA 7, font Times 12, maksimal 5 halaman. Kalau tidak ada, tulis tanda minus (-)." |

### E. Tenggat dan format

| Isian | Jenis | Wajib | Aturan |
|---|---|---|---|
| Tenggat | Tanggal | Ya | Tidak boleh sebelum hari ini (zona Asia/Jakarta) |
| Format output | Pilihan | Ya | Teks (di chat WhatsApp), Word, PDF, PPT, Excel. Nilai awal otomatis = format standar tugas |

Di bawah tenggat tampil: "Sisa {{n}} hari" dan, bila ada, faktor yang berlaku ("Tenggat 1-2 hari: biaya x{{faktor}}").

### F. Tambahan (opsional)

| Isian | Jenis | Teks |
|---|---|---|
| Sitasi diperiksa manual | Kotak centang | "Sitasi dan referensi kami periksa satu per satu (maks 10 referensi). +Rp{{tambahanSitasi}}" |
| Penjelasan hasil | Kotak centang | "Kami jelaskan isi hasilnya dan poin kuncinya supaya kamu paham. +Rp{{tambahanPenjelasan}}" |

### G. Persetujuan

| Isian | Jenis | Wajib | Teks |
|---|---|---|---|
| Persetujuan | Kotak centang | Ya | "Aku paham ini estimasi awal, dan aku bertanggung jawab memeriksa isi hasilnya serta mengikuti aturan sekolah atau kampusku." |

### H. Kolom jebakan (anti-spam)

Satu kolom teks bernama `website`, **disembunyikan** dari manusia (CSS, `tabindex="-1"`, `aria-hidden`). Jika terisi, pesanan ditolak diam-diam.

## 3. Perilaku dinamis

1. Mengubah apa pun menghitung ulang estimasi (tunda 150 ms setelah mengetik agar tidak berat).
2. Memilih jenis tugas: label dan satuan target output berubah, nilai awal target output diisi, format output diisi format standar.
3. "Tugas lainnya" memunculkan kolom Nama/jenis tugas.
4. Jumlah file lampiran = 0 menyembunyikan kolom Total halaman.
5. Tenggat hari ini memunculkan kotak peringatan (Bagian 4).
6. Semua pesan kesalahan muncul **di bawah kolomnya**, dan fokus pindah ke kolom salah pertama saat tombol ditekan.
7. Tombol kirim non-aktif sampai semua isian wajib benar dan persetujuan dicentang.

## 4. Kartu estimasi (keadaan dan teks)

| Keadaan | Tampilan |
|---|---|
| Belum memilih tugas | "Pilih jenis tugas untuk melihat estimasi." |
| Normal | Judul "Estimasi biaya". Angka: **Rp{{bawah}} - Rp{{atas}}**. Di bawahnya teks peringatan wajib (Bagian 6) |
| Tugas lainnya | Sama seperti normal, ditambah: "Karena tugasnya di luar daftar, kisarannya lebih lebar. Harga pasti kami kabari setelah membaca kebutuhanmu." |
| Tenggat hari ini | Normal, ditambah kotak peringatan: "Tenggat hari ini perlu kami konfirmasi dulu, belum tentu bisa. Kami kabari lewat WhatsApp." |
| Lampiran melebihi batas | Angka diganti: "Lampiranmu lebih dari {{batasLampiran}} halaman. Harganya kami hitung manual, hubungi kami lewat WhatsApp." Tombol berubah jadi "Hubungi kami lewat WhatsApp" (pesan tetap berisi isian, tanpa estimasi) |
| Data belum lengkap/salah | Angka tetap tampil jika masih bisa dihitung. Tombol kirim non-aktif |

Rincian (harga dasar, tambahan, lampiran, tenggat, opsi) **boleh** dibuat sebagai tautan "Lihat rincian" di Tahap 7. Bukan syarat versi 1.

## 5. Tombol kirim

| Keadaan | Teks tombol |
|---|---|
| Siap | **Kirim ke WhatsApp** |
| Mengirim | **Mencatat pesananmu...** (tombol non-aktif, mencegah klik ganda) |
| Berhasil | Panel "Pesananmu tercatat" (lihat di bawah), lalu WhatsApp dibuka |
| Sheets gagal atau lebih dari 8 detik | Tetap buka WhatsApp, panel: "Pesananmu belum tercatat otomatis, tapi tetap bisa kamu kirim lewat WhatsApp. Kode sementara: {{kode}}" |

**Panel setelah kirim (tetap ada di halaman jika klien kembali):**
- Berhasil: "Pesananmu tercatat dengan kode **{{kode}}**. WhatsApp akan terbuka. Kirim pesannya, lalu kirim lampiranmu di chat yang sama."
- Dua tombol: **Buka WhatsApp lagi** (tautan wa.me) dan **Salin pesan** (menyalin isi pesan).
- Kode sementara (Sheets gagal) berformat `JD-OFF-` diikuti 4 karakter acak huruf besar/angka.

Setelah Sheets berhasil, halaman membuka WhatsApp dengan `window.location.href` (bukan `window.open`, karena bisa diblokir setelah menunggu jaringan).

## 6. Format pesan WhatsApp

Tautan: `https://wa.me/6289619114292?text=` + isi pesan yang di-*encode* (`encodeURIComponent`). Nomor tujuan diambil dari `config.js`.

```
Halo Jade, aku mau pesan layanan pendampingan.

*KODE PESANAN: {{kode}}*

*Identitas*
Jenjang: {{jenjang}}
{{Prodi: ... / Kelas: ...}}
{{Semester: ... (hanya mahasiswa)}}
{{Mata kuliah / Mata pelajaran}}: {{...}}

*Tugas*
Jenis tugas: {{jenis_tugas}}
Target output: {{target}} {{satuan}}
Format output: {{format}}
Tenggat: {{tanggal, contoh 28 Okt 2026}} ({{n}} hari lagi)
Tambahan: {{daftar opsi, atau "tidak ada"}}
Lampiran: {{jumlah_file}} file, total {{total_halaman}} hlm (akan kukirim di chat ini)

*Kebutuhan detail*
> {{teks klien, dipotong 400 karakter, tiap baris diawali "> "}}

*Ketentuan tugas*
> {{teks klien, dipotong 400 karakter, tiap baris diawali "> "}}

*ESTIMASI: Rp{{bawah}} - Rp{{atas}}*
_Estimasi awal, harga final menunggu konfirmasi dari kalian._
```

Gaya: satu baris kosong antar bagian. Tebal (*...*) hanya untuk judul bagian, baris kode pesanan, dan baris estimasi. Miring (_..._) hanya untuk keterangan estimasi dan catatan. Untuk Pelajar, baris "Kelas" menggantikan "Prodi" dan tidak ada baris "Semester".

Aturan:
1. Jika teks dipotong, tambahkan " ... (selengkapnya di pesanan {{kode}})". Teks lengkap sudah tersimpan di Sheets. Pemotongan dihitung per karakter utuh (grafem, lewat `Intl.Segmenter`; cadangan `Array.from`), bukan per unit, agar emoji tidak rusak. Hitungan memakai teks asli, sebelum karakter lebar-nol disisipkan.
2. Jika lampiran melebihi batas, baris estimasi diganti: "*ESTIMASI: tidak dihitung (lampiran lebih dari {{batasLampiran}} hlm), mohon dihitung manual.*"
3. Jika Sheets gagal, tambahkan setelah satu baris kosong: "_Catatan: pesanan belum tercatat otomatis._"
4. Tanggal ditulis format Indonesia (contoh "28 Okt 2026"). Angka uang memakai pemisah titik (contoh Rp88.000).
5. Tidak ada nomor HP, alamat, atau data pribadi lain di pesan.
6. Jika harga tidak bisa dihitung karena data harga bermasalah (bukan karena lampiran), baris estimasi diganti: "*ESTIMASI: tidak dihitung (data harga belum terbaca), mohon dihitung manual.*"
7. **Netralisasi teks klien.** Teks klien tampil apa adanya tetapi tidak boleh memicu format WhatsApp (tebal, miring, coret, monospasi, daftar, kutipan). Caranya, dengan karakter lebar-nol (U+200B, tidak terlihat):
   - Setiap karakter `*`, `_`, `~`, `` ` `` diapit karakter lebar-nol di kiri dan kanan. Berlaku juga untuk isian satu baris dari klien (prodi, mata kuliah, mata pelajaran, jenis tugas lainnya).
   - Baris teks klien yang diawali "- ", "* ", "angka. ", atau ">" diberi karakter lebar-nol di depannya (setelah awalan "> ").
   - Teks banyak baris tetap satu kutipan: tiap baris diawali "> ". Baris kosong ditulis "> " + karakter lebar-nol.
   - Akhir baris `\r\n` diseragamkan menjadi `\n`.
   - Risiko yang diterima: perilaku karakter lebar-nol belum diuji di semua versi WhatsApp (Android, iPhone, Web), dan karakter itu ikut tersalin bila admin menyalin teks klien. Bila masih ada yang terformat, ganti ke karakter lebar penuh (contoh ＊).
8. Tombol "Salin pesan" menyalin teks yang sama persis dengan yang dikirim ke WhatsApp (variabel `pesanTerakhir`).

## 7. Daftar pilihan Pelajar

- **Kelas:** 10, 11, 12.
- **Mata pelajaran:** Bahasa Indonesia, Bahasa Inggris, Matematika, Fisika, Kimia, Biologi, Ekonomi, Geografi, Sosiologi, Sejarah, PPKn, Informatika, Seni Budaya, Lainnya (ketik sendiri).

Daftar ini disimpan di `assets/js/config.js` (bukan di Sheets).

## 8. Daftar teks (copy deck)

| Tempat | Teks |
|---|---|
| Judul halaman (`<title>`) | Jade: Estimasi Biaya Pendampingan Tugas |
| Deskripsi (meta) | Hitung estimasi biaya pendampingan tugas untuk pelajar SMA dan mahasiswa. Isi form, lihat estimasinya, kirim lewat WhatsApp. |
| Judul pembuka | Estimasi biaya pendampingan tugasmu, dalam 3 menit |
| Subjudul | Pilih jenis tugas, isi kebutuhanmu, lihat estimasinya, lalu kirim ke kami lewat WhatsApp. Kami bantu menyusun draf bahan belajar, kamu yang memeriksa dan memahaminya. |
| Tombol pembuka | Mulai pesan |
| Status memuat data (form terkunci, hilang saat data selesai atau 8 detik habis; `role="status"`) | Sebentar ya, sedang memuat daftar tugas dan harga terbaru... |
| Cara kerja, judul | Cara kerjanya |
| Langkah 1 | **Isi form.** Pilih tugas dan ceritakan kebutuhanmu. |
| Langkah 2 | **Kirim ke WhatsApp.** Pesan terisi otomatis, tinggal kirim, lalu kirim lampiranmu. |
| Langkah 3 | **Kami konfirmasi.** Kami baca kebutuhanmu, lalu kabari harga final dan perkiraan selesai. |
| Langkah 4 | **Bayar DP, kami kerjakan.** Kamu terima hasilnya, boleh revisi, lalu pelunasan. |
| Peringatan estimasi (wajib dekat angka) | Ini estimasi awal. Harga final dikonfirmasi setelah kebutuhanmu kami baca, dan masih bisa didiskusikan. |
| Peringatan ringkas (di bar HP yang menempel; teks penuh tetap tampil di atas bar) | Estimasi awal, harga final menunggu konfirmasi dari kami. |
| Catatan privasi (dekat lampiran dan footer) | Jangan kirim KTP, nomor rekening, atau password. Lampiran hanya dipakai untuk pesananmu. |
| Footer | Dibantu AI dan diperiksa oleh tim kami. Kamu tetap bertanggung jawab memeriksa isinya dan mengikuti aturan sekolah atau kampusmu. |
| Daftar "Kami terima" | Kerangka dan outline, ringkasan dan resume, draf esai, makalah, laporan, dan proposal, PPT, soal latihan dan pembahasan, olah data, perbaikan bahasa dan format, CV dan surat, coding tugas kecil |
| Daftar "Tidak kami terima" | Skripsi atau tesis penuh, soal ujian atau kuis yang sedang berlangsung, tugas yang melarang penggunaan AI, memalsukan data atau referensi, mengakali pengecekan plagiat |
| FAQ: Harganya bisa nego? | Bisa didiskusikan. Angka di web adalah estimasi awal, harga final kami tentukan setelah membaca kebutuhanmu. |
| FAQ: Bayarnya bagaimana? | DP {{dp}}% setelah harga final disepakati, pelunasan setelah hasil kamu terima. |
| FAQ: Boleh revisi? | Ya, {{revisiGratis}} kali revisi gratis sesuai kebutuhan awal. Revisi tambahan Rp{{revisiTambahan}} per kali. |
| FAQ: Lampiranku aman? | Lampiran hanya dipakai untuk pesananmu dan dihapus setelah pesanan selesai. Jangan kirim data pribadi sensitif. |
| FAQ: Apakah hasilnya pasti benar? | Hasil dibantu AI lalu diperiksa tim kami, tapi tetap periksa isinya sebelum dipakai. Kami tidak menjamin hasil bebas dari kesalahan. |
| FAQ: Tugasku tidak ada di daftar | Pilih "Tugas lainnya" dan ceritakan kebutuhanmu. Kami kabari harga pastinya. |

> Catatan: isi FAQ tentang DP, revisi, penghapusan lampiran, dan pengembalian dana mengikuti **Bagian 9 PRD yang belum diputuskan**. Nilainya dibaca dari tab Harga, jadi cukup diubah di Sheets. Kalimat penghapusan lampiran ("dihapus setelah pesanan selesai") harus disesuaikan jika keputusan berbeda.

## 9. Pesan kesalahan

| Situasi | Teks |
|---|---|
| Isian wajib kosong | Bagian ini perlu diisi. |
| Angka di luar batas | Isi angka antara {{min}} dan {{maks}}. |
| Angka bukan bilangan bulat | Isi dengan angka bulat. |
| Teks terlalu pendek | Tulis minimal {{n}} karakter. |
| Teks terlalu panjang | Maksimal {{n}} karakter. |
| Tenggat sebelum hari ini | Tenggat tidak boleh sebelum hari ini. |
| Persetujuan belum dicentang | Centang dulu persetujuan ini untuk melanjutkan. |
| Data harga gagal dimuat | Harga terbaru belum bisa dimuat, kami pakai data cadangan. Harga final tetap kami konfirmasi lewat WhatsApp. |
| Sheets gagal saat kirim | Pesananmu belum tercatat otomatis, tapi tetap bisa kamu kirim lewat WhatsApp. |
| Terlalu banyak percobaan | Tunggu sebentar, lalu coba lagi. |
