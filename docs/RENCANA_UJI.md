# Rencana Uji

Gunanya: memastikan harga tidak salah hitung, web nyaman di HP, dan pesanan tidak hilang.

## 1. Uji hitung harga

Halaman `tests/uji-harga.html` memuat semua baris di bawah, menghitung dengan `pricing.js` dan `data/fallback.js`, lalu menampilkan **OK** atau **CEK** per baris. Semua harus OK sebelum rilis.

Nilai awal harga (Template): lampiran gratis 20 halaman, Rp3.000 per 10 halaman, faktor tenggat 0 hari ×1,5, 1-2 hari ×1,25, 3-4 hari ×1,1, 5 hari atau lebih ×1,0, format di luar standar Rp5.000, sitasi Rp15.000, penjelasan Rp10.000, pengali atas ×1,2, tugas lainnya ×0,8 sampai ×1,6, pembulatan ke atas Rp1.000.

Semua angka dihitung dengan program memakai rumus yang sama, lalu dicocokkan dengan hitungan manual.

| No | Jenjang - Tugas | Target | Lampiran (hlm) | Sisa hari | Format | Sitasi | Penjelasan | Bawah | Atas | Yang diuji |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mahasiswa - Draf makalah | 8 | 30 | 4 | PDF | Ya | Tidak | 88.000 | 106.000 | Kasus campuran, format beda standar |
| 2 | Pelajar - PPT presentasi | 12 | 10 | 6 | PPT | Tidak | Tidak | 21.000 | 26.000 | Tambahan slide, format sama standar |
| 3 | Mahasiswa - Olah data + interpretasi | 3 | 5 | 1 | Excel | Tidak | Ya | 64.000 | 77.000 | Tenggat ×1,25, penjelasan |
| 4 | Mahasiswa - Tugas lainnya | 4 | 0 | 6 | Teks | Tidak | Tidak | 30.000 | 60.000 | Kisaran tugas lainnya |
| 5 | Pelajar - Draf makalah/laporan observasi | 6 | 45 | 2 | Teks | Ya | Tidak | 70.000 | 84.000 | Lampiran 3 blok, ×1,25 |
| A | Mahasiswa - Ringkasan materi/jurnal | 2 | 20 | 5 | Teks | Tidak | Tidak | 10.000 | 12.000 | Lampiran tepat 20 = gratis |
| B | Mahasiswa - Ringkasan materi/jurnal | 2 | 21 | 5 | Teks | Tidak | Tidak | 13.000 | 16.000 | Lampiran 21 = 1 blok |
| C | Mahasiswa - Ringkasan materi/jurnal | 2 | 31 | 5 | Teks | Tidak | Tidak | 16.000 | 20.000 | Lampiran 31 = 2 blok (pembulatan ke atas) |
| D | Pelajar - Kerangka karangan/esai | 1 | 0 | 0 | Teks | Tidak | Tidak | 11.000 | 14.000 | Tenggat hari ini ×1,5 dan peringatan konfirmasi |
| E | Mahasiswa - Coding tugas kecil | 3 | 0 | 3 | Teks | Tidak | Tidak | 121.000 | 146.000 | Tarif tambahan besar, desimal ×1,1 |
| G | Mahasiswa - Draf makalah | 3 | 0 | 6 | Teks | Tidak | Tidak | 40.000 | 48.000 | Target di bawah yang termasuk = tanpa tambahan |
| H | Pelajar - Tugas lainnya | 2 | 0 | 5 | Teks | Tidak | Tidak | 16.000 | 32.000 | Kisaran tugas lainnya (pelajar) |
| I | Mahasiswa - Draf makalah | 5 | 0 | 6 | Word | Tidak | Tidak | 40.000 | 48.000 | Format sama standar = gratis |
| J | Mahasiswa - Draf makalah | 5 | 0 | 6 | PDF | Tidak | Tidak | 45.000 | 54.000 | Format beda standar = +5.000 |

Kasus tambahan **tanpa angka** (perilaku):

| No | Situasi | Hasil yang diharapkan |
|---|---|---|
| K | Total halaman lampiran 101 | Estimasi tidak tampil, pesan "hubungi kami", tombol berubah, pesan WhatsApp tanpa estimasi |
| L | Tenggat kemarin | Pesan kesalahan tenggat, tombol kirim non-aktif |
| M | Target output 0 atau 201 | Pesan kesalahan rentang |
| N | Harga di Sheets diubah (misalnya draf makalah jadi Rp45.000) lalu halaman dimuat ulang | Estimasi berubah tanpa mengubah kode |

## 2. Uji tampilan dan penggunaan

Dicoba di HP asli (minimal satu Android atau iPhone) dan di komputer.

| No | Yang dicek | Lolos jika |
|---|---|---|
| T1 | Lebar layar 360 px | Tidak ada gulir ke samping, teks terbaca, tombol mudah ditekan |
| T2 | Kartu estimasi dan tombol kirim di HP | Tetap terlihat saat mengisi form, tidak menutupi kolom yang sedang diisi |
| T3 | Berpindah jenjang | Isian turunan terkosongkan, daftar tugas berganti |
| T4 | Memilih tugas | Satuan, nilai awal target, dan format standar berubah |
| T5 | Mengisi semua kolom dengan benar | Waktu pengisian kurang dari 3 menit sampai WhatsApp terbuka |
| T6 | Keyboard saja (Tab, Enter, spasi) | Seluruh form bisa diisi dan dikirim |
| T7 | Kolom salah lalu tekan kirim | Pesan kesalahan di bawah kolom, fokus pindah ke kolom salah pertama |
| T8 | Kontras warna | Semua teks minimal 4,5:1 (cek dengan alat kontras) |
| T9 | Pembaca layar atau cek cepat | Setiap kolom punya label, perubahan estimasi diumumkan |
| T10 | Kecepatan di jaringan seluler biasa | Halaman terbuka dan bisa diisi dalam beberapa detik |

## 3. Uji pesanan dan Sheets

| No | Yang dicek | Lolos jika |
|---|---|---|
| S1 | Kirim pesanan normal | Baris baru di tab Pesanan, kode berurutan, status Draf, semua kolom benar |
| S2 | Kolom Semester | Terisi untuk mahasiswa, kosong untuk pelajar |
| S3 | Kolom Laba | Rumusnya tidak tertimpa |
| S4 | Dua pesanan hampir bersamaan | Kode berbeda, tidak ada yang hilang |
| S5 | Teks klien diawali `=`, `+`, `-`, atau `@` (contoh `=1+1`) | Tersimpan sebagai teks, **tidak** dihitung sebagai rumus |
| S6 | Kolom jebakan `website` diisi (lewat alat pengembang) | Tidak ada baris baru |
| S7 | Kirim ulang isi yang sama dalam 60 detik | Ditolak dengan pesan "Terlalu banyak percobaan" |
| S8 | Alamat Apps Script sengaja dibuat salah | WhatsApp tetap terbuka, kode `JD-OFF-xxxx`, pesan "belum tercatat otomatis" |
| S9 | Internet dimatikan saat memuat halaman | Data cadangan dipakai, pesan "data harga gagal dimuat" tampil |
| S10 | Klik tombol kirim berkali-kali cepat | Hanya satu pesanan tercatat |
| S11 | Kebutuhan 1000 karakter dan ketentuan 1000 karakter | Tercatat penuh di Sheets, pesan WhatsApp dipotong 400 karakter dengan keterangan "selengkapnya di pesanan {{kode}}", WhatsApp tetap terbuka |
| S12 | Tautan WhatsApp | Terbuka ke nomor 6289619114292 dengan pesan terisi, format sesuai SPEC layar Bagian 6 |
| S13 | `?action=config` di browser | Hanya tugas dan harga, tidak ada data pesanan |
| S14 | Isi kebutuhan dengan emoji di sekitar karakter ke-400, lalu kirim | Tombol tidak macet, WhatsApp terbuka, pesan terpotong dengan keterangan |
| S15 | Tekan "Salin pesan" di alamat tanpa HTTPS atau saat izin clipboard ditolak | Kotak teks berisi pesan muncul dan terpilih, bisa disalin manual |
| S16 | Total halaman lampiran 101 | Estimasi tidak tampil, tombol "Hubungi kami lewat WhatsApp", baris Estimasi di pesan memakai kalimat "lampiran lebih dari 100 hlm" |
| S17 | Hapus baris tenggat hari 0 dari tab Harga (atau dari `data/fallback.js` saat uji), muat ulang, lalu kirim | Pesanan tetap terkirim, baris Estimasi di pesan: "tidak dihitung (data harga belum terbaca)", bukan kalimat lampiran |

## 4. Daftar periksa sebelum rilis (soft launch)

- [ ] Semua baris di Bagian 1 bertuliskan OK.
- [ ] Uji T1-T10 dan S1-S13 lolos (catat yang gagal dan perbaikannya).
- [ ] Nomor WhatsApp benar dan bisa dihubungi dua admin (keputusan 8 di PRD terjawab).
- [ ] Baris contoh `JD-0000` dan data uji di tab Pesanan sudah dihapus atau berstatus Contoh.
- [ ] `data/fallback.js` sama dengan isi tab Tugas dan Harga.
- [ ] Kebijakan di Bagian 9 PRD sudah diputuskan, dan FAQ di web sesuai.
- [ ] Teks footer dan persetujuan tampil jelas.
- [ ] File Sheets hanya dibagikan ke dua admin.
- [ ] Tidak ada kunci rahasia di repositori (hanya URL Apps Script dan nomor WhatsApp yang memang publik).
- [ ] Judul dan deskripsi halaman terisi, ikon situs (favicon) ada.
- [ ] Dicoba oleh 3-5 teman yang belum pernah melihatnya. Catat bagian yang membingungkan.

## 5. Setelah 10 pesanan pertama

Catat: berapa pesanan masuk lewat web, berapa menit rata-rata pengisian (tanya klien), harga final dibanding estimasi (berapa sering di luar kisaran), tugas "Tugas lainnya" yang berulang, dan jumlah revisi. Gunakan untuk menyesuaikan harga dan menambah daftar tugas.
