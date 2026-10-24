# Uji langsung ke Apps Script (S5, S6, S7). Jalankan dari folder proyek: .\tests\perintah-uji-sheets.ps1
# Data uji bertanda "UJI-HAPUS". Setelah selesai, hapus baris bertanda itu dari tab Pesanan secara manual.
$url = "https://script.google.com/macros/s/AKfycbyww3JgXQhC1MooRmzsF947vcKeMbkm2M1yd1CU-_gbtiF_TtyymB9iS8Tl5pZcsd1TJA/exec"

function Kirim($data) {
  $badan = [System.Text.Encoding]::UTF8.GetBytes(($data | ConvertTo-Json -Compress))
  Invoke-RestMethod -Uri $url -Method Post -ContentType "text/plain;charset=utf-8" -Body $badan
}

$dasar = @{
  website = ""; jenjang = "Mahasiswa"; prodiKelas = "UJI-HAPUS prodi"; semester = 3; matkul = "UJI-HAPUS matkul"
  tugas = "Draf makalah"; tugasLainnya = ""; jumlahFile = 0; totalHalaman = 0; target = 5; format = "Word"
  tenggat = "2026-12-31"; opsi = @(); kebutuhan = "UJI-HAPUS kebutuhan uji"; ketentuan = "-"
  estimasiBawah = 40000; estimasiAtas = 48000
}

Write-Host "`n[S6] Kolom jebakan terisi. Harapan: ok=True, kode=JD-0000, TIDAK ada baris baru"
Kirim ($dasar + @{ website = "bot" })

Write-Host "`n[S5] Teks diawali '='. Harapan: ok=True dan kode baru. Di Sheets, kolom Kebutuhan detail menampilkan teks (bukan hasil hitung 2)"
$s5 = $dasar.Clone(); $s5.kebutuhan = "=1+1 UJI-HAPUS"
Kirim $s5

Write-Host "`n[S7] Kirim ulang isi yang sama dalam 60 detik. Harapan: pengiriman pertama ok=True, kedua ok=False 'Terlalu banyak percobaan'"
$s7 = $dasar.Clone(); $s7.kebutuhan = "UJI-HAPUS kirim ulang " + (Get-Date -Format "HHmmss")
Kirim $s7
Kirim $s7
