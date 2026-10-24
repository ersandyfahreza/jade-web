# DESIGN.md: Panduan Tampilan Jade

> Warna utama dari tim. Warna bertanda **(usulan)** ditambahkan karena dibutuhkan untuk teks, kolom isian, dan pesan error. Boleh diubah.

## Suasana

Tenang, rapi, dan hangat. Kombinasi biru kehijauan tua dan cokelat memberi kesan tepercaya dan membumi. Latar terang berwarna krem keabuan. Hindari gradien ungu, ikon stok yang ramai, dan banyak bayangan.

## Warna

| Token | Kode | Dipakai untuk |
|---|---|---|
| `--latar` | `#F2F0EF` | Latar halaman (dari tim) |
| `--garis` | `#BBBDBC` | Garis pemisah dan hiasan. **Jangan dipakai untuk teks** (kontras rendah) (dari tim) |
| `--utama` | `#245F73` | Tombol utama, tautan, judul, fokus (dari tim) |
| `--aksen` | `#733E24` | Angka estimasi, kotak peringatan, penekanan (dari tim) |
| `--permukaan` | `#FFFFFF` | Kartu dan kolom isian **(usulan)** |
| `--teks` | `#1E2B30` | Teks isi **(usulan)** |
| `--teks-redup` | `#4A5A60` | Teks bantuan dan keterangan **(usulan)** |
| `--garis-input` | `#8A8D8C` | Garis tepi kolom isian, agar terlihat jelas **(usulan)** |
| `--utama-hover` | `#1B4A5A` | Tombol utama saat disentuh atau di-hover **(usulan)** |
| `--error` | `#B3261E` | Pesan kesalahan isian **(usulan)** |

Perkiraan kontras (hitungan manual, cek ulang dengan alat kontras sebelum rilis; target minimal 4,5:1 untuk teks):

| Pasangan | Perkiraan |
|---|---|
| `--teks` di atas `--latar` | ± 12:1 |
| `--utama` di atas `--latar` | ± 6:1 |
| `--aksen` di atas `--latar` atau putih | ± 7,5-8,5:1 |
| Putih di atas `--utama` | ± 7:1 |
| `--teks-redup` di atas `--latar` | ± 6:1 |
| `--error` di atas `--latar` | ± 5,7:1 |
| `--garis` di atas `--latar` | ± 1,7:1 (hanya untuk garis hiasan, bukan teks) |

Mode gelap tidak dibuat di versi 1.

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
| Pilihan jenjang | Dua tombol besar berdampingan (segmented). Yang terpilih: latar `--utama`, teks putih |
| Kolom isian | Latar putih, garis `--garis-input` 1 px, tinggi minimal 44 px. Label **selalu di atas** kolom, tidak hanya placeholder |
| Fokus | Garis tebal 3 px `--utama` dengan jarak 2 px. Tidak boleh dihilangkan |
| Kartu estimasi | Latar putih, garis `--utama` 2 px. Angka kisaran warna `--aksen`. Di HP tampil **menempel di bawah layar** (sticky) bersama tombol kirim |
| Tombol utama | "Kirim ke WhatsApp": latar `--utama`, teks putih, tinggi 48 px, lebar penuh di HP |
| Tombol non-aktif | Latar `--garis`, teks `--teks-redup`, kursor tidak boleh |
| Kotak peringatan | Latar putih, garis kiri 4 px `--aksen`, teks `--teks` |
| Pesan error | Teks `--error` di bawah kolom, dengan ikon tanda seru. Warna **bukan satu-satunya** penanda |

## Aksesibilitas

- Atribut bahasa halaman `lang="id"`.
- Setiap kolom punya `<label>`. Error dihubungkan dengan `aria-describedby`.
- Angka estimasi berada di area `aria-live="polite"` supaya pembaca layar mengumumkan perubahannya.
- Semua bisa dioperasikan dengan keyboard. Urutan tab mengikuti urutan visual.
- Hormati pengaturan `prefers-reduced-motion` (tidak ada animasi besar).
