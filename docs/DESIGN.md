# DESIGN.md: Panduan Tampilan Jade

> Palet diganti pada Okt 2026 (riwayat: palet awal berupa biru kehijauan tua dan cokelat dengan latar krem keabuan). Hanya warna yang berubah; keputusan lain tidak. Warna bertanda **(hiasan)** tidak boleh dipakai untuk teks, tombol berteks, atau garis kolom isian.

## Suasana

Hangat, tenang, dan rapi. Latar krem terang (goose-down) dengan cokelat tua untuk teks dan merah bata (cinnamon) untuk tombol dan judul memberi kesan tepercaya dan membumi. Lavender dan oranye hanya sebagai sentuhan kecil. Hindari gradien ungu, ikon stok yang ramai, dan banyak bayangan. Hanya mode terang.

## Warna

| Token | Kode | Nama | Dipakai untuk |
|---|---|---|---|
| `--latar` | `#fbf8e9` | goose-down | Latar halaman dan bar bawah. Juga warna teks di atas `--utama` |
| `--latar-bagian` | `#f8eed2` | dark-cream | Latar tombol non-aktif. Boleh untuk pita bagian halaman (belum dipakai) |
| `--permukaan` | `#ffffff` | putih | Kartu dan kolom isian |
| `--teks` | `#3b110c` | chocolate | Teks isi |
| `--teks-redup` | `#5d3d3a` | cocoa | Teks bantuan, keterangan, placeholder |
| `--utama` | `#8b372b` | cinnamon | Tombol utama (teks `--latar`), tautan, judul, fokus |
| `--utama-hover` | `#7f3126` | | Tombol utama saat disentuh atau di-hover |
| `--aksen` | `#a05f1a` | coffee | Angka estimasi, garis kiri kotak peringatan. Teks hanya di atas `--latar` atau `--permukaan`, bukan di dark-cream atau fresh-hay |
| `--sorot` | `#dd5013` | sunset-orange | **(hiasan)** Segmen penunjuk langkah yang sedang aktif |
| `--peringatan` | `#e9e4a6` | fresh-hay | Latar kotak peringatan (teks `--teks`) |
| `--hias` | `#bdb7fc` | lavender | **(hiasan)** Latar nomor langkah "Cara kerjanya" (teks `--teks`) |
| `--error` | `#da1c1c` | gander-red | Pesan dan garis kolom error. Hanya di atas `--latar` atau `--permukaan` |
| `--garis-input` | `#96817f` | | Garis tepi kolom isian dan segmen jenjang, garis tepi tombol non-aktif |
| `--garis` | `#d9cbb4` | | Garis pemisah dan hiasan. **Jangan dipakai untuk teks** |

Kontras hasil hitungan rumus WCAG dari kode warna (cek ulang dengan alat kontras sebelum rilis; target minimal 4,5:1 untuk teks, 3:1 untuk teks besar dan batas komponen):

| Pasangan | Rasio |
|---|---|
| `--teks` di atas `--latar` / `--permukaan` | 15,50 / 16,52 |
| `--teks-redup` di atas `--latar` / `--permukaan` | 8,98 / 9,57 |
| `--utama` di atas `--latar` / `--permukaan` | 7,36 / 7,84 |
| `--latar` di atas `--utama` / `--utama-hover` | 7,36 / 8,32 |
| `--teks-redup` di atas `--latar-bagian` (tombol non-aktif) | 8,27 |
| `--error` di atas `--permukaan` / `--latar` | 5,04 / 4,73 |
| `--aksen` di atas `--latar` / `--permukaan` (angka besar) | 4,75 / 5,06 |
| `--teks` di atas `--peringatan` | 12,67 |
| `--teks` di atas `--hias` | 8,92 |
| `--garis-input` di atas `--permukaan` / `--latar` | 3,66 / 3,43 |
| `--aksen` (garis kiri kotak peringatan) di atas `--peringatan` / `--latar` | 3,89 / 4,75 |
| `--sorot` di atas `--permukaan` | 4,01 |
| `--garis` di atas `--latar` / `--permukaan` | 1,50 / 1,60 (hanya hiasan; segmen penunjuk "belum" juga hiasan karena status ada di teks dan `aria-current`) |

Tidak boleh dipakai (di bawah 4,5:1 untuk teks): `--aksen` atau `--error` di atas `--latar-bagian` atau `--peringatan`, serta `--sorot` dengan teks `--teks` (4,11) atau `--latar` (3,77).

Mode gelap tidak dibuat. Halaman mengunci mode terang lewat `<meta name="color-scheme" content="light">` dan `color-scheme: light` di `:root`.

## Huruf

- Keluarga: **Plus Jakarta Sans** (Google Fonts) untuk judul dan isi **(usulan)**. Cadangan: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Isi: 16 px, tinggi baris 1,55. Kolom isian **minimal 16 px** (supaya tidak diperbesar otomatis di iPhone).
- Judul halaman 28-32 px (tebal). Judul bagian 20-22 px. Angka estimasi 28 px (tebal).
- Teks keterangan minimal 14 px.

## Jarak dan bentuk

- Satuan jarak: 4, 8, 16, 24, 32, 48 px.
- Lebar isi maksimal **640 px**, satu kolom, di tengah. Gutter kiri-kanan 16 px di HP.
- Sudut membulat: 10 px untuk kolom isian dan tombol, 14 px untuk kartu.
- Bayangan: hampir tidak ada. Pakai garis `--garis` 1 px.

## Komponen

| Komponen | Aturan |
|---|---|
| Pilihan jenjang | Dua tombol besar berdampingan (segmented). Yang terpilih: latar `--utama`, teks `--latar` |
| Kolom isian | Latar putih, garis `--garis-input` 1 px, tinggi minimal 44 px. Label **selalu di atas** kolom, tidak hanya placeholder |
| Fokus | Garis tebal 3 px `--utama` dengan jarak 2 px. Tidak boleh dihilangkan |
| Penunjuk langkah | Bilah 4 segmen (tinggi 4 px, jarak 4 px, sudut membulat) di atas teks "Langkah X dari 4" (14 px, `--teks-redup`) dan judul langkah (20 px, tebal, `--utama`). Segmen yang sudah lewat berwarna `--utama`, segmen aktif `--sorot`, sisanya `--garis`. Segmen aktif lebih tebal (8 px) supaya tidak hanya bergantung pada warna. Tidak bisa diklik, tidak ada animasi |
| Bar tunggal (estimasi + tombol) | Satu-satunya bar, **menempel di bawah layar HP**: angka kisaran warna `--aksen` (24 px tebal di HP, 28 px di layar lebar), peringatan ringkas 14 px, lalu tombol Lanjut atau Kirim. Latar `--latar`, garis atas 1 px `--garis`, tanpa bingkai kartu. Tinggi di 360 x 640 harus kurang dari 25% layar. Catatan panjang (tugas lainnya, tenggat hari ini) tidak masuk bar |
| Kembali | Tombol bergaya tautan: teks `--utama` tebal bergaris bawah, tinggi sentuh 44 px, di dalam kartu di bawah isi langkah |
| Ringkasan | Daftar label (14 px, `--teks-redup`) dan nilai (tebal) dengan garis pemisah 1 px `--garis`, nilai boleh turun baris |
| Tanda wajib | Tanda * setelah label kolom wajib (dibuat CSS, tidak dibaca pembaca layar; kolom diberi `aria-required`) |
| Tombol utama | "Lanjut" dan "Kirim ke WhatsApp": latar `--utama`, teks `--latar`, tinggi 48 px, lebar penuh di HP |
| Tombol non-aktif | Latar `--latar-bagian`, teks `--teks-redup`, garis tepi 1 px `--garis-input` (agar bentuknya terlihat), kursor tidak boleh. Tetap bisa difokus dan ditekan |
| Kotak peringatan | Latar `--peringatan`, garis kiri 4 px `--aksen`, teks `--teks` |
| Nomor langkah "Cara kerjanya" | Lingkaran 32 px latar `--hias`, angka `--teks` tebal |
| Pesan error | Teks `--error` di bawah kolom, dengan ikon tanda seru. Warna **bukan satu-satunya** penanda |

## Gerak

Gerak halus hanya sebagai umpan balik, bukan syarat untuk melihat konten.

- Semua `animation` dan `transition` berada di dalam `@media (prefers-reduced-motion: no-preference)`. Di luar itu tidak ada gerak. Semua keyframe hanya punya `from`, jadi tanpa animasi elemen tampil normal.
- Hanya `transform`, `opacity`, `stroke-dashoffset` (SVG), dan transisi warna singkat. Tidak ada animasi tinggi, lebar, atau bayangan. Durasi 120 sampai 250 ms, `ease-out`. Jeda hanya pada pembukaan (0/50/100 ms) dan centang panel (120 ms).
- Tidak ada animasi yang menghalangi mengetik atau mengetuk. Garis fokus (`outline` 3 px, jarak 2 px) tidak diberi transisi. Fokus pindah seketika, tidak menunggu animasi.
- Area `aria-live` tidak diubah demi animasi. JavaScript hanya menambah atau menghapus kelas dan atribut tampilan (`data-arah`, `.baru`, `.bar-masuk`, `.belum-tercatat`).

| Gerak | Cara | Durasi |
|---|---|---|
| Pembukaan halaman | Judul, paragraf, tombol naik 12 px sambil muncul, bertahap | 250 ms |
| Pindah langkah | Isi langkah geser 16 px dan muncul, maju dari kanan, kembali dari kiri (`data-arah` di form). Langkah 1 saat halaman dibuka tidak bergerak. Judul langkah berganti seketika | 200 ms |
| Bilah kemajuan | Isi segmen lewat `scaleX` (0 ke 1). Segmen aktif `--sorot`, yang selesai berubah ke `--utama` | transform 250 ms, warna 200 ms |
| Kolom dinamis | Kelas `.baru` pada kolom yang baru muncul: fade dan turun 6 px | 180 ms |
| Tombol | Warna berubah halus, tekan `scale(.98)` (bukan untuk tombol non-aktif). Berlaku juga untuk Kembali dan segmen jenjang | 120 ms |
| Kolom isian | Garis tepi berubah ke `--utama` saat fokus (kecuali sedang error) | 150 ms |
| Pesan kesalahan | Fade, tanpa getar | 150 ms |
| Kisaran estimasi | Sorotan `--peringatan` memudar di belakang angka yang baru. Teks diganti seketika, tanpa hitung naik. Puncak sorotan 0,8 agar teks coffee tetap terbaca (kontras teks besar minimal 3:1) | 250 ms |
| Bar HP | Naik 16 px sambil muncul, sekali, saat bar pertama terlihat penuh | 220 ms |
| Panel tercatat | Panel muncul lembut; centang SVG tergambar lewat `stroke-dashoffset`. Centang disembunyikan bila pesanan belum tercatat | panel 220 ms, centang 250 ms |

`.kartu` memakai `overflow-x: clip` agar geseran langkah tidak menimbulkan gulir mendatar. Berbeda dari `hidden`, `clip` tidak membuat kontainer gulir, jadi bar yang menempel tetap berfungsi.

## Aksesibilitas

- Atribut bahasa halaman `lang="id"`.
- Setiap kolom punya `<label>`. Error dihubungkan dengan `aria-describedby`.
- Angka estimasi berada di area `aria-live="polite"` supaya pembaca layar mengumumkan perubahannya.
- Semua bisa dioperasikan dengan keyboard. Urutan tab mengikuti urutan visual.
- Hormati pengaturan `prefers-reduced-motion`: tanpa preferensi gerak, tidak ada animasi sama sekali (lihat bagian Gerak).
