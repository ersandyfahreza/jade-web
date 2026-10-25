# Rencana Uji

Gunanya: memastikan harga tidak salah hitung, web nyaman di HP, dan pesanan tidak hilang.

## 1. Uji hitung harga

Sitasi dan penjelasan hasil disembunyikan sementara dari form dan ringkasan; dapat ditampilkan kembali. Rumus, tarif, dan dukungan perhitungan keduanya tetap dipertahankan. Web memakai `sitasi: false`, `penjelasan: false`, dan mengirim `opsi: []` ke Sheets. Semua kasus dan angka uji harga dengan opsi aktif tetap berlaku untuk fungsi hitung.

Halaman `tests/uji-harga.html` memuat semua baris di bawah, menghitung dengan `pricing.js` dan nilai tetap Template di `tests/data-uji.js`, lalu menampilkan **OK** atau **CEK** per baris. `data/fallback.js` diperiksa terpisah lewat `validasiConfig` (struktur sah, tanpa tugas ganda, tabel tenggat valid). Semua harus OK sebelum rilis.

Uji logika server (validasi, awalan `'`, kolom jebakan, kode pesanan, duplikat): jalankan `node tests/uji-server.js`. Semua baris harus OK.

Uji pengiriman form: jalankan `node tests/uji-form.js` dengan `playwright-core` dan Chromium tersedia. Jika Playwright berada di folder alat terpisah, arahkan `NODE_PATH` ke folder `node_modules` tersebut. Uji ini membuka halaman asli pada lebar 360 px, memakai Sheets dan WhatsApp tiruan, serta mencegat semua permintaan jaringan. Kedua alur (mahasiswa berhasil, pelajar gagal mencatat ke Sheets) harus OK: satu POST dengan `opsi: []`, ringkasan dan pesan tanpa Tambahan, tanpa galat JavaScript. Tidak memerlukan server lokal dan tidak mengirim POST asli.

Uji pemetaan wizard (setiap kolom form ada di tepat satu langkah di `assets/js/langkah.js`, tidak ada `required` native) ada di bagian terakhir `tests/uji-harga.html` (baris WZ1 sampai WZ8). Halaman ini harus dibuka lewat `http://localhost:8000/tests/uji-harga.html` karena membaca `index.html`.

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
| W1 | Wizard: buka halaman, lebar 360 px | Hanya langkah 1 tampil, penunjuk "Langkah 1 dari 4", tombol bar "Lanjut", tombol Kembali tidak ada |
| W2 | Tekan Lanjut dengan kolom kosong (langkah 1, 2, 3, dan 4 lewat Kirim) | Tetap di langkah itu, pesan resmi di bawah kolom, fokus ke kolom salah pertama |
| W3 | Isi benar lalu Lanjut | Pindah langkah, fokus di judul langkah, segmen penunjuk berpindah, pembaca layar mengumumkan "Langkah X dari 4: {{judul}}" |
| W4 | Kembali dari langkah 2, 3, dan 4 | Isian tidak hilang, tidak ada pesan kesalahan baru yang muncul karena menekan Kembali |
| W5 | Tekan Enter di kolom teks langkah 1 sampai 3 | Sama dengan Lanjut, tidak mengirim |
| W6 | Di langkah 4: Enter di area teks, Enter di kotak persetujuan | Area teks membuat baris baru; kotak persetujuan tidak mengirim; kirim hanya lewat tombol |
| W7 | Di langkah 4, kosongkan prodi lewat Kembali, lalu kirim | Form pindah ke langkah 1, fokus ke prodi, tidak ada POST |
| W8 | Ukur tinggi bar di 360 x 640 pada: langkah 1, estimasi tampil, lampiran 101 halaman, tenggat hari ini | Setiap keadaan kurang dari 160 px (25% layar). Hasil terukur Tahap wizard: 120, 81 (kosong), 140, 154 px |
| W9 | Tab dengan keyboard di setiap langkah | Fokus tidak masuk ke kolom di langkah tersembunyi, tidak ada galat "invalid form control" di konsol |
| W10 | Ringkasan langkah 4 setelah mengisi prodi `<b>x</b>` | Tampil sebagai teks apa adanya, bukan tebal |
| G1 | Buka halaman dengan pengaturan sistem gerak normal | Judul, paragraf, dan tombol pembuka muncul bertahap (±0,4 detik), lalu diam |
| G2 | Aktifkan "kurangi gerak" di sistem (Windows: Efek animasi mati; Android: Hapus animasi; iPhone: Kurangi Gerakan), muat ulang, lalu isi form sampai kirim | Tidak ada gerak sama sekali, semua konten dan tombol tetap berfungsi |
| G3 | Lanjut dan Kembali antar langkah di 360 px | Isi langkah bergeser dari kanan (maju) dan dari kiri (kembali), tidak ada gulir mendatar, fokus langsung di judul, keyboard bisa mengetik tanpa menunggu |
| G4 | Pilih Mahasiswa atau Pelajar, pilih "Lainnya" di mata pelajaran, pilih "Tugas lainnya", isi jumlah file dari 0 ke angka lain | Kolom yang muncul memudar halus, kolom di bawahnya tidak melompat berlebihan saat mengetik |
| G5 | Tekan tombol Lanjut dengan jari dan mouse | Warna berubah halus, tombol mengecil sedikit saat ditekan; tombol non-aktif (abu-abu krem) tidak mengecil |
| G6 | Fokus kolom dengan Tab | Garis tepi berubah halus ke warna utama, garis fokus 3 px langsung terlihat |
| G7 | Picu pesan kesalahan (Lanjut dengan kolom kosong) | Pesan memudar masuk, tanpa getar |
| G8 | Ubah total halaman atau tenggat sampai angka kisaran berubah | Sorotan krem kekuningan memudar sebentar di belakang angka. Teks berganti seketika. Pembaca layar tidak mengumumkan dua kali |
| G9 | Gulir ke form di HP (pertama kali) | Bar bawah naik halus sekali; gulir berikutnya tidak mengulang |
| G10 | Kirim pesanan (Sheets hidup) dan kembali dari WhatsApp | Panel muncul lembut dan centang tergambar; bila Sheets gagal, panel tanpa centang |
| G11 | Gerak di HP kelas bawah atau lama | Tidak patah-patah (hanya transform dan opacity yang dipakai). Catat bila terasa berat |
| W11 | Pembaca layar sungguhan (TalkBack atau VoiceOver) saat pindah langkah | Pengumuman terdengar sekali dan jelas, tidak ganda atau memotong |

| No | Yang dicek | Lolos jika |
|---|---|---|
| O1 | Langkah 2 dan ringkasan langkah 4 | Tidak ada bagian atau baris Tambahan, sitasi, maupun penjelasan hasil |
| O2 | Uji pesan W3/W21 dan pemetaan WZ8 di halaman uji | Opsi kosong tidak menghasilkan baris Tambahan; kedua kontrol tidak ada di form maupun pemetaan |

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
| S18 | Pengiriman dengan mock (tanpa POST ke Apps Script asli) | Data tetap berbentuk sama, `opsi: []`; masukan penyusun pesan `sitasi: false`, `penjelasan: false`; WhatsApp tanpa baris Tambahan; tidak ada galat referensi elemen |


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
