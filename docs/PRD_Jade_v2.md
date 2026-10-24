# PRD Jade (Jadi sama Claude), Versi 2

> **Status:** draf untuk diedit berdua (v2.1, sudah memuat keputusan SMP, nomor WhatsApp, dan palet warna). Nama "Jade" bersifat sementara.
> Tanda `[ ]` = belum diputuskan. Tanda `[x]` = sudah diputuskan.
> Bagian bertanda **USULAN** boleh diubah.

---

## 1. Tujuan

Web ini menghubungkan klien dengan kami sebagai admin. Fungsinya:

1. Menghitung **estimasi biaya** secara otomatis dari pilihan klien.
2. Mengirim pesanan ke **WhatsApp** dengan pesan yang sudah terisi otomatis.
3. Mencatat setiap pesanan ke **Google Sheets** dengan kode pesanan.

## 2. Pengguna

| Pengguna | Keterangan |
|---|---|
| Pelajar | SMA/sederajat. |
| Mahasiswa | D3/D4/S1 dari berbagai PTN/PTS di Indonesia |
| Admin | Kami berdua. Satu orang mengerjakan, satu orang memeriksa hasil |

## 3. Masalah yang Diselesaikan

- Klien bingung dan harus bertanya harga berulang kali di chat.
- Kebutuhan klien sering tidak lengkap, sehingga admin harus bertanya ulang.
- Pesanan tersebar di chat dan sulit dicatat.

Web ini membuat klien tahu estimasi biaya berdasarkan jenis tugas, lampiran, output, dan tenggat, serta mengirim kebutuhan yang sudah lengkap ke admin.

## 4. Ruang Lingkup Versi 1

### 4.1 Fitur wajib

1. Pilih jenjang: **Pelajar** atau **Mahasiswa**. Pilihan ini mengubah isi form berikutnya.
2. Isian konteks:
   - Mahasiswa: prodi/jurusan, mata kuliah, semester (**diketik bebas**).
   - Pelajar: kelas dan mata pelajaran (**dipilih dari daftar pendek**).
3. Pilih **jenis tugas** dari daftar sesuai jenjang, atau **"Tugas lainnya"**.
4. Isian pesanan: target output, jumlah file lampiran, total halaman lampiran, kebutuhan detail, ketentuan tugas, format output, tenggat, dan opsi tambahan.
5. **Estimasi biaya** (kisaran) muncul langsung dan berubah saat pilihan diubah.
6. Tombol **"Kirim ke WhatsApp"**: pesan otomatis berisi semua pilihan, kisaran estimasi, dan kode pesanan.
7. Saat tombol ditekan, pesanan **tercatat otomatis ke Google Sheets** dengan status "Draf".
8. Harga dan daftar tugas **dibaca dari Google Sheets** (tab Tugas dan Harga), jadi mengubah harga tidak perlu mengubah kode.

### 4.2 Di luar versi 1 (nanti saja)

- Upload lampiran langsung di web (lampiran dikirim lewat WhatsApp).
- Pembayaran online.
- Akun klien dan riwayat pesanan.
- Perhitungan ulang harga di sisi server (Apps Script).
- Pembacaan otomatis jumlah halaman dari file.

## 5. Alur Pengguna

1. Klien membuka web dan memilih **Pelajar** atau **Mahasiswa**.
2. Klien mengisi prodi/kelas/semester dan mata kuliah/pelajaran, lalu memilih **jenis tugas** atau "Tugas lainnya".
3. Klien mengisi **jumlah file lampiran** dan **total halaman semua lampiran**.
4. Klien mengisi target output, kebutuhan detail, ketentuan tugas, format output, dan tenggat.
5. Klien memilih opsi tambahan (sitasi diperiksa, penjelasan hasil).
6. **Estimasi** muncul langsung dan berubah saat pilihan diubah. Peringatan "ini estimasi awal" selalu tampil di dekat angka.
7. Klien menekan **"Kirim ke WhatsApp"**. Data masuk ke Sheets, lalu WhatsApp terbuka dengan pesan otomatis.
8. Klien mengirim lampiran lewat WhatsApp.

Jika pengiriman ke Sheets gagal, WhatsApp **tetap terbuka** supaya pesanan tidak hilang.

## 6. Isian Form dan Tipe Data

| Isian | Tipe | Aturan |
|---|---|---|
| Jenjang | pilihan (string) | Pelajar / Mahasiswa |
| Prodi (mahasiswa) / Kelas (pelajar) | string | Prodi: diketik bebas, maks 80 karakter. Kelas: pilih 10, 11, atau 12 |
| Mata kuliah / pelajaran | string | Maks 80 karakter |
| Semester (hanya mahasiswa) | integer | 1 sampai 14 |
| Jenis tugas | pilihan (string) | Dari tab Tugas, sesuai jenjang |
| Tugas lainnya (nama) | string | Wajib diisi jika jenis tugas = Tugas lainnya. Maks 100 karakter |
| Target output | integer | Min 1. Satuan mengikuti tugas (hlm, slide, soal, dll.) |
| Jumlah file lampiran | integer | Min 0 |
| Total halaman lampiran | integer | Min 0. Lebih dari 100 = tampil "hubungi kami" |
| Format output | pilihan (string) | Teks / Word / PDF / PPT / Excel |
| Tenggat | tanggal | Tidak boleh sebelum hari ini |
| Sisa hari ke tenggat | integer | Dihitung otomatis dari tenggat |
| Sitasi diperiksa manual | pilihan | Ya / Tidak |
| Penjelasan hasil | pilihan | Ya / Tidak |
| Kebutuhan detail | teks | Maks 1000 karakter |
| Ketentuan tugas | teks | Maks 1000 karakter |
| **Uang (semua harga)** | **integer** | Rupiah bulat, tanpa desimal |
| Faktor tenggat, pengali kisaran | desimal | Contoh 1,25 |
| Kode pesanan | string | Format `JD-0001`, bertambah otomatis |

## 7. Aturan Perhitungan

Semua angka diambil dari tab **Tugas** dan **Harga** di Google Sheets (nilai awal ada di Lampiran A).

**Urutan rumus (urutannya penting):**

1. `Tambahan unit` = maks(0, target output − unit sudah termasuk) × tarif tambahan
2. `Tambahan lampiran` = jika total halaman lampiran ≤ 20 maka 0, jika tidak maka pembulatan ke atas((halaman − 20) ÷ 10) × Rp3.000
3. `Subtotal` = harga dasar + tambahan unit + tambahan lampiran
4. `Subtotal × faktor tenggat`
5. Tambah opsi: format di luar standar tugas (Rp5.000), sitasi diperiksa (Rp15.000), penjelasan hasil (Rp10.000)
6. **Estimasi bawah** = hasil langkah 5, dibulatkan ke atas ke Rp1.000
7. **Estimasi atas** = estimasi bawah × 1,2, dibulatkan ke atas ke Rp1.000

**Untuk "Tugas lainnya":** estimasi bawah = hasil langkah 5 × 0,8 dan estimasi atas = hasil langkah 5 × 1,6, masing-masing dibulatkan ke atas ke Rp1.000.

**Faktor tenggat (dari tanggal pesan):**

| Sisa hari | Pengali |
|---|---|
| 5 atau lebih | ×1,0 |
| 3-4 | ×1,1 |
| 1-2 | ×1,25 |
| 0 (hari ini) | ×1,5 dan perlu konfirmasi admin dulu |

**Definisi "halaman" (USULAN):** 1 halaman A4, font 12, spasi 1,5 (± 300-350 kata). File Excel/CSV untuk olah data dihitung 5 halaman per file `[ ]`.

**Teks wajib di dekat angka estimasi:**
> Ini estimasi awal. Harga final dikonfirmasi setelah kebutuhanmu kami baca, dan masih bisa didiskusikan.

## 8. Aturan Bisnis

| Kategori | Contoh |
|---|---|
| **Diterima** | Kerangka, ringkasan, resume, draf esai/makalah/laporan/proposal, PPT, soal latihan, olah data, perbaikan bahasa/format, CV dan surat, coding tugas kecil |
| **Dikonfirmasi dulu** | Tenggat hari ini, lampiran lebih dari 100 halaman, tugas sangat teknis atau butuh data khusus, "Tugas lainnya" |
| **Ditolak** | Skripsi/tesis penuh, soal ujian atau kuis yang sedang berlangsung, tugas yang jelas melarang AI, permintaan memalsukan data atau referensi, parafrase untuk mengelabui cek plagiat, konten yang melanggar hukum |

Jika menolak, kami tawarkan alternatif, misalnya kerangka atau penjelasan materi.

**Cara menyebut layanan (USULAN):** kami menyebutnya **pendampingan** dan **draf bahan belajar**, bukan "kami kerjakan, tinggal kumpul". Setiap hasil disertai ajakan untuk memeriksa dan memahami isinya, dan klien bertanggung jawab atas kepatuhan pada aturan sekolah/kampusnya.

## 9. Kebijakan Layanan (USULAN, perlu diputuskan)

| Hal | Usulan | Putusan |
|---|---|---|
| DP | 50% sebelum dikerjakan | `[ ]` |
| Revisi gratis | 2 kali, sesuai kebutuhan awal | `[ ]` |
| Revisi tambahan | Rp5.000-10.000 per revisi | `[ ]` |
| Perubahan kebutuhan di tengah jalan | Dihitung sebagai pesanan baru atau tambahan biaya | `[ ]` |
| Pengembalian dana | Penuh jika kami menolak/gagal; sebagian jika sudah dikerjakan | `[ ]` |
| Negosiasi harga | Boleh, harga final tetap kami yang menentukan | `[ ]` |
| Data klien | Hanya dipakai untuk pesanan; klien diminta tidak mengirim data sensitif (KTP, rekening, password) | `[ ]` |
| Penyimpanan lampiran | Dihapus setelah pesanan selesai (usulan: 30 hari) | `[ ]` |

## 10. Alur Operasional

1. Pesan masuk lewat WhatsApp (dengan kode pesanan). Pesanan sudah tercatat di Sheets berstatus **Draf**.
2. Penanggung jawab ditulis di kolom Sheets. Kami membaca kebutuhan dan memeriksa aturan bisnis: **terima, tolak, atau konfirmasi**.
3. Kami membalas dengan **harga final** dan perkiraan selesai, baik ada negosiasi maupun tidak.
4. Klien membayar DP. Status menjadi **Dikonfirmasi**.
5. Satu orang mengerjakan dengan Claude. Satu orang lain **memeriksa hasil** (fakta, referensi, format, kesesuaian dengan ketentuan).
6. Kami mengirim hasil. Revisi dilakukan jika ada, lalu pelunasan.
7. Sheets diperbarui: harga final, DP, status bayar, biaya, waktu kerja, status **Selesai**.

**Status pesanan:** Draf, Dikonfirmasi, Dikerjakan, Revisi, Selesai, Dibatalkan, Ditolak.

## 11. Struktur Google Sheets

| Tab | Isi |
|---|---|
| **Pesanan** | Satu baris per pesanan (kolom di Lampiran B) |
| **Tugas** | Daftar tugas, harga dasar, unit termasuk, tarif tambahan, format standar |
| **Harga** | Aturan lampiran, tambahan opsional, pengali kisaran, faktor tenggat |
| **Kalkulator** | Alat uji hitung manual |
| **Contoh Uji** | Kasus uji dan hasil yang diharapkan |
| **Rekap** | Ringkasan pesanan, pemasukan, biaya, laba |

**Cara kerja teknis (nanti, saat web dibuat):** Google Apps Script yang menempel di Sheets menjadi "pintu" web. Web membaca tab Tugas dan Harga, lalu menulis ke tab Pesanan.

## 12. Ukuran Berhasil

- Klien menyelesaikan pengisian sampai WhatsApp terbuka dalam **kurang dari 3 menit**.
- **10 pesanan pertama** masuk lewat web.
- Estimasi web **sama dengan hitungan manual** pada semua contoh uji (Bagian 14).
- **Semua pesanan** dari web tercatat di Sheets.
- Web bisa dipakai dengan nyaman di HP.

## 13. Risiko dan Cara Mengurangi

| Risiko | Cara mengurangi |
|---|---|
| Klien mengira estimasi = harga pasti, atau harga tidak bisa nego | Teks peringatan wajib, estimasi berbentuk kisaran, ada kalimat "bisa didiskusikan" |
| Harga salah hitung | Contoh uji, hitung manual sebelum rilis, harga diambil dari satu sumber (Sheets) |
| AI salah atau mengarang referensi | Pemeriksaan oleh orang kedua, opsi sitasi diperiksa manual |
| Jatah pemakaian Claude Pro habis | Pantau di Settings > Usage, batasi pesanan per hari, kolom waktu dan biaya di Sheets |
| Klien melanggar aturan akademik | Aturan bisnis, penyebutan layanan sebagai pendampingan, daftar tolak |
| Spam atau data sampah masuk ke Sheets | Batas panjang isian, validasi, pengecekan berkala |
| Data pribadi masuk di kolom bebas | Peringatan di web, tidak menyimpan nomor HP dan identitas di Sheets |
| Pesanan tercatat tapi klien batal | Status awal "Draf" |
| Dua admin membalas pesanan yang sama | Kolom penanggung jawab per pesanan |
| Harga di browser bisa diubah orang yang paham kode | Aman untuk tahap awal karena harga final dikonfirmasi admin |

## 14. Contoh Uji (hitung manual)

| No | Kasus | Hasil yang diharapkan |
|---|---|---|
| 1 | Mahasiswa, draf makalah 8 hlm, lampiran 30 hlm, tenggat 4 hari, minta PDF, sitasi diperiksa | **Rp88.000-106.000** |
| 2 | Pelajar, PPT 12 slide, lampiran 10 hlm, tenggat 6 hari, PPT | **Rp21.000-26.000** |
| 3 | Mahasiswa, olah data 3 hlm interpretasi, lampiran 5 hlm, tenggat 1 hari, Excel, penjelasan hasil | **Rp64.000-77.000** |
| 4 | Mahasiswa, tugas lainnya 4 unit, tanpa lampiran, tenggat 6 hari | **Rp30.000-60.000** |
| 5 | Pelajar, draf makalah 6 hlm, lampiran 45 hlm, tenggat 2 hari, teks, sitasi diperiksa | **Rp70.000-84.000** |

Cara cek: masukkan kasus yang sama ke tab **Kalkulator** di spreadsheet dan bandingkan. Kasus uji tambahan (batas lampiran, tenggat hari ini, dan lain-lain) ada di `RENCANA_UJI.md`.

## 15. Keputusan Terbuka

1. `[x]` Pelajar **SMP**: **ditutup dulu**. Layanan untuk SMA/SMK/MA (kelas 10-12) dan mahasiswa D3/D4/S1.
2. `[x]` Nomor WhatsApp: **satu nomor bersama, 089619114292**. Untuk tautan WhatsApp ditulis `6289619114292`. Nomor ini akan terlihat publik di web.
3. `[ ]` Kebijakan di Bagian 9 (DP, revisi, pengembalian dana, penyimpanan lampiran).
4. `[ ]` Hitungan file Excel/CSV untuk olah data (usulan: 5 halaman per file).
5. `[ ]` Harga: pakai dulu lalu evaluasi setelah 10 pesanan pertama (usulan: ya).
6. `[ ]` Nama bisnis final dan alamat web.
7. `[ ]` Menghindari logo atau nama Claude di tampilan bisnis (usulan: ya; cukup tulis "dibantu AI").
8. `[ ]` Cara berdua mengakses satu nomor WhatsApp (WhatsApp Business di dua perangkat, atau bergantian) dan siapa yang menjaga nomor itu tiap hari.
9. `[x]` Palet warna (peran tiap warna di `DESIGN.md`). Catatan: pada Okt 2026 palet awal dari tim (biru kehijauan dan cokelat) diganti palet krem-cinnamon; hanya warna yang berubah, keputusan lain tidak.

---

## Lampiran A: Daftar Tugas dan Harga Awal (USULAN)

### Mahasiswa

| Tugas | Harga dasar | Sudah termasuk | Tambahan | Format standar |
|---|---|---|---|---|
| Kerangka/outline (makalah, esai, proposal) | Rp10.000 | 1 kerangka | - | Word |
| Ringkasan materi/jurnal | Rp10.000 | 2 hlm | Rp3.000/hlm | Word |
| Resume/review jurnal atau buku | Rp20.000 | 2 hlm | Rp5.000/hlm | Word |
| Draf esai/opini | Rp25.000 | 3 hlm | Rp7.000/hlm | Word |
| Draf makalah | Rp40.000 | 5 hlm | Rp6.000/hlm | Word |
| Analisis/studi kasus | Rp35.000 | 3 hlm | Rp8.000/hlm | Word |
| Laporan praktikum/kegiatan | Rp45.000 | 5 hlm | Rp7.000/hlm | Word |
| Proposal (kegiatan, lomba, penelitian) | Rp55.000 | 8 hlm | Rp6.000/hlm | Word |
| PPT presentasi | Rp25.000 | 10 slide | Rp2.000/slide | PPT |
| Olah data + interpretasi | Rp35.000 | 2 hlm | Rp8.000/hlm | Excel |
| Soal latihan + pembahasan dari materi | Rp15.000 | 10 soal | Rp1.000/soal | Word |
| Perbaikan bahasa dan format (APA, daftar pustaka) | Rp10.000 | 10 hlm | Rp1.000/hlm | Word |
| CV, surat lamaran, motivation letter | Rp15.000 | 1 dokumen | - | Word |
| Coding tugas kecil | Rp50.000 | 1 modul | Rp30.000/modul | Teks |
| Tugas lainnya | Rp25.000 | 2 unit | Rp6.000/unit | Word |

### Pelajar

| Tugas | Harga dasar | Sudah termasuk | Tambahan | Format standar |
|---|---|---|---|---|
| Kerangka karangan/esai | Rp7.000 | 1 kerangka | - | Word |
| Ringkasan materi pelajaran | Rp7.000 | 2 hlm | Rp2.000/hlm | Word |
| Resume buku/film/artikel | Rp12.000 | 2 hlm | Rp3.000/hlm | Word |
| Draf karangan/esai | Rp15.000 | 2 hlm | Rp5.000/hlm | Word |
| Draf makalah/laporan observasi | Rp25.000 | 4 hlm | Rp5.000/hlm | Word |
| Proposal/laporan kegiatan OSIS/ekskul | Rp25.000 | 4 hlm | Rp5.000/hlm | Word |
| PPT presentasi | Rp15.000 | 8 slide | Rp1.500/slide | PPT |
| Soal latihan + pembahasan | Rp10.000 | 10 soal | Rp1.000/soal | Word |
| Perbaikan tata bahasa | Rp8.000 | 10 hlm | Rp1.000/hlm | Word |
| Surat, CV, motivasi beasiswa | Rp12.000 | 1 dokumen | - | Word |
| Tugas lainnya | Rp20.000 | 2 unit | Rp5.000/unit | Word |

### Tambahan dan lainnya

| Hal | Nilai |
|---|---|
| Lampiran gratis | 20 halaman pertama |
| Lampiran berbayar | Rp3.000 per 10 halaman (dibulatkan ke atas) |
| Lampiran lebih dari 100 halaman | Tampil "hubungi kami" |
| Format file di luar standar tugas | Rp5.000 |
| Sitasi diperiksa manual (maks 10 referensi) | Rp15.000 |
| Penjelasan hasil + poin kunci | Rp10.000 |

## Lampiran B: Kolom Tab Pesanan

Kode pesanan, Waktu masuk, Jenjang, Prodi/Kelas, Mata kuliah/pelajaran, Jenis tugas, Tugas lainnya (teks), Jumlah file lampiran, Total halaman lampiran, Target output, Format output, Tenggat, Opsi tambahan, Kebutuhan detail, Ketentuan tugas, Estimasi bawah, Estimasi atas, Status, Harga final, DP diterima, Status bayar, Penanggung jawab, Pemeriksa hasil, Biaya (Rp), Waktu kerja (menit), Laba, Catatan, **Semester** (kolom baru, ditambahkan di paling kanan; web menulis ke kolom berdasarkan **nama header**, bukan urutan).

## Riwayat Revisi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1 | 24 Okt 2026 | Draf awal oleh tim |
| 2 | 24 Okt 2026 | Perbaikan, harga, aturan bisnis, kebijakan layanan, struktur Sheets, contoh uji |
| 2.1 | 24 Okt 2026 | Tambahan tim (semester, D4, SMP dihapus dari pengguna). Keputusan: SMP ditutup, nomor WhatsApp, palet warna. Bagian 6 dan Lampiran B disesuaikan (kolom Semester) |
