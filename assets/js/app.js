// Form Jade: tampil/sembunyi isian, nilai awal dari jenis tugas, validasi, dan kartu estimasi.
// Harga dan daftar tugas dibaca dari config, tidak ditulis di sini. Rumus ada di pricing.js.
(function () {
  const config = FALLBACK_CONFIG; // Tahap 5: diganti config dari Apps Script
  const $ = (id) => document.getElementById(id);
  const form = document.querySelector("form.kartu");
  const tombolKirim = form.querySelector('button[type="submit"]');

  // Pesan kesalahan resmi (SPEC layar Bagian 9)
  const PESAN = {
    wajib: "Bagian ini perlu diisi.",
    rentang: (min, maks) => `Isi angka antara ${min} dan ${maks}.`,
    bulat: "Isi dengan angka bulat.",
    pendek: (n) => `Tulis minimal ${n} karakter.`,
    panjang: (n) => `Maksimal ${n} karakter.`,
    tenggat: "Tenggat tidak boleh sebelum hari ini.",
    setuju: "Centang dulu persetujuan ini untuk melanjutkan.",
    hargaGagal: "Harga terbaru belum bisa dimuat, kami pakai data cadangan. Harga final tetap kami konfirmasi lewat WhatsApp."
  };

  const jenjang = () => {
    const r = form.querySelector('input[name="jenjang"]:checked');
    return r ? r.value : "";
  };
  const tugasTerpilih = () =>
    config.tugas.find((t) => t.jenjang === jenjang() && t.tugas === $("jenis").value);
  const tugasLainnya = () => $("jenis").value === "Tugas lainnya";
  // Tanggal hari ini zona Asia/Jakarta, format YYYY-MM-DD
  const hariIni = () => tanggalJakarta(new Date());

  // ada: kapan isian tampil dan ikut diperiksa
  const FIELDS = [
    { id: "jenjang", tipe: "radio" },
    { id: "prodi", tipe: "teks", max: 80, ada: () => jenjang() === "Mahasiswa" },
    { id: "semester", tipe: "angka", min: 1, max: 14, ada: () => jenjang() === "Mahasiswa" },
    { id: "matkul", tipe: "teks", max: 80, ada: () => jenjang() === "Mahasiswa" },
    { id: "kelas", tipe: "pilih", ada: () => jenjang() === "Pelajar" },
    { id: "mapel", tipe: "pilih", ada: () => jenjang() === "Pelajar" },
    { id: "mapel-lain", tipe: "teks", max: 80, ada: () => jenjang() === "Pelajar" && $("mapel").value === "Lainnya" },
    { id: "jenis", tipe: "pilih" },
    { id: "jenis-lain", tipe: "teks", max: 100, ada: tugasLainnya },
    { id: "target", tipe: "angka", min: 1, max: 200 },
    { id: "jml-file", tipe: "angka", min: 0, max: 20 },
    { id: "total-hlm", tipe: "angka", min: 0, max: 1000, ada: () => !jmlFileNol() },
    { id: "kebutuhan", tipe: "teks", min: 10, max: 1000 },
    { id: "ketentuan", tipe: "teks", min: 1, max: 1000 },
    { id: "tenggat", tipe: "tanggal" },
    { id: "format", tipe: "pilih" },
    { id: "setuju", tipe: "centang" }
  ];
  const jmlFileNol = () => $("jml-file").value.trim() !== "" && Number($("jml-file").value) === 0;

  const adaField = (f) => (f.ada ? f.ada() : true);
  const elemen = (f) => (f.id === "jenjang" ? form.querySelector('input[name="jenjang"]') : $(f.id));
  const pembungkus = (f) => elemen(f).closest(".isian, .centang, .segmented");
  const dipakai = new Set(); // kolom yang sudah disentuh, baru boleh menampilkan error

  function periksa(f) {
    const el = elemen(f);
    if (f.tipe === "centang") return el.checked ? "" : PESAN.setuju;
    if (f.tipe === "radio") return jenjang() ? "" : PESAN.wajib;
    const v = el.value.trim();
    if (v === "") return f.tipe === "angka" && el.validity.badInput ? PESAN.bulat : PESAN.wajib;
    if (f.tipe === "angka") {
      const n = Number(v);
      if (!Number.isInteger(n)) return PESAN.bulat;
      if (n < f.min || n > f.max) return PESAN.rentang(f.min, f.max);
    }
    if (f.tipe === "teks") {
      if (f.min && v.length < f.min) return PESAN.pendek(f.min);
      if (v.length > f.max) return PESAN.panjang(f.max);
    }
    if (f.tipe === "tanggal" && v < hariIni()) return PESAN.tenggat;
    return "";
  }

  // Tempat pesan kesalahan di bawah setiap kolom (diisi dengan textContent)
  FIELDS.forEach((f) => {
    const g = document.createElement("span");
    g.className = "galat";
    g.id = f.id + "-galat";
    g.hidden = true;
    const w = pembungkus(f);
    if (f.tipe === "centang" || f.tipe === "radio") w.after(g);
    else w.append(g);
    const el = elemen(f);
    el.setAttribute("aria-describedby", ((el.getAttribute("aria-describedby") || "") + " " + g.id).trim());
  });

  function tampilkanError(f) {
    const pesan = adaField(f) ? periksa(f) : "";
    const g = $(f.id + "-galat");
    g.textContent = pesan;
    g.hidden = !pesan;
    elemen(f).setAttribute("aria-invalid", pesan ? "true" : "false");
  }

  const angkaIsian = (id) => ($(id).value.trim() !== "" ? Number($(id).value) : NaN);
  const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");
  const kartu = form.querySelector(".estimasi [aria-live]");
  let timerEstimasi;
  let isiTerakhir;

  function tampilkanEstimasi() {
    const sisa = hitungSisaHari($("tenggat").value, hariIni());
    const hasil = tugasTerpilih()
      ? hitungEstimasi(config, {
          jenjang: jenjang(), tugas: $("jenis").value, target: angkaIsian("target"),
          halaman: jmlFileNol() ? 0 : angkaIsian("total-hlm"), sisaHari: sisa,
          format: $("format").value, sitasi: $("sitasi").checked, penjelasan: $("penjelasan").checked
        })
      : null;
    // Susun teks dulu; isi kartu hanya diganti jika berbeda, agar pembaca layar tidak membacakan ulang
    const isi = [];
    if (!hasil) isi.push(["pesan", "Pilih jenis tugas untuk melihat estimasi."]);
    else if (hasil.status === "hubungi") {
      isi.push(["pesan", `Lampiranmu lebih dari ${config.harga.batasLampiran} halaman. Harganya kami hitung manual, hubungi kami lewat WhatsApp.`]);
    } else if (hasil.status === "tidakBisa" && hasil.alasan === "aturanTenggat") {
      isi.push(["pesan", PESAN.hargaGagal]);
    } else if (hasil.status === "ok") {
      isi.push(["angka", `${rupiah(hasil.bawah)} - ${rupiah(hasil.atas)}`]);
      if (hasil.lainnya) isi.push(["pesan", "Karena tugasnya di luar daftar, kisarannya lebih lebar. Harga pasti kami kabari setelah membaca kebutuhanmu."]);
      if (hasil.hariIni) isi.push(["kotak-peringatan", "Tenggat hari ini perlu kami konfirmasi dulu, belum tentu bisa. Kami kabari lewat WhatsApp."]);
    }
    const kunci = JSON.stringify(isi);
    if (kunci !== isiTerakhir) {
      isiTerakhir = kunci;
      kartu.replaceChildren(...isi.map(([kelas, teks]) => {
        const p = document.createElement("p");
        p.className = kelas;
        p.textContent = teks;
        return p;
      }));
    }
    tombolKirim.textContent = hasil && hasil.status === "hubungi" ? "Hubungi kami lewat WhatsApp" : "Kirim ke WhatsApp";

    $("tenggat-bantuan").textContent = labelTenggat(config, sisa);
  }

  function perbarui(tunda) {
    FIELDS.forEach((f) => {
      if (f.tipe === "radio") return;
      const w = pembungkus(f);
      const tadiSembunyi = w.hidden;
      w.hidden = !adaField(f);
      // Tanpa lampiran, total halaman dianggap 0; saat muncul lagi dikosongkan
      if (f.id === "total-hlm") {
        if (w.hidden) $(f.id).value = "0";
        else if (tadiSembunyi) $(f.id).value = "";
      }
    });
    FIELDS.forEach((f) => (dipakai.has(f.id) ? tampilkanError(f) : null));
    form.querySelectorAll(".hitung").forEach((h) => {
      const ta = h.parentNode.querySelector("textarea");
      h.textContent = `${ta.value.length}/${ta.maxLength}`;
    });
    tombolKirim.setAttribute("aria-disabled", FIELDS.every((f) => !adaField(f) || !periksa(f)) ? "false" : "true");
    // Ketikan ditunda 150 ms agar tidak berat dan pembaca layar tidak kebanjiran
    clearTimeout(timerEstimasi);
    if (tunda === true) timerEstimasi = setTimeout(tampilkanEstimasi, 150);
    else tampilkanEstimasi();
  }

  function isiJenis() {
    const sel = $("jenis");
    sel.length = 1; // sisakan "Pilih jenis tugas"
    const daftar = config.tugas.filter((t) => t.jenjang === jenjang());
    // "Tugas lainnya" selalu paling bawah
    [...daftar.filter((t) => t.tugas !== "Tugas lainnya"), ...daftar.filter((t) => t.tugas === "Tugas lainnya")]
      .forEach((t) => sel.append(new Option(t.tugas, t.tugas)));
    sel.disabled = !jenjang();
  }

  // Label, satuan, nilai awal target, dan format standar mengikuti jenis tugas
  function aturDariTugas() {
    const t = tugasTerpilih();
    form.querySelector('label[for="target"]').textContent = t ? `Target output (${t.satuan})` : "Target output";
    $("target").value = t ? t.unit : "";
    $("target-bantuan").textContent = t ? `Sudah termasuk ${t.unit} ${t.satuan}. Kelebihannya dihitung tambahan.` : "";
    if (t) $("format").value = t.formatStandar;
    ["target", "format"].forEach((id) => dipakai.delete(id));
  }

  function gantiJenjang() {
    ["prodi", "semester", "matkul", "kelas", "mapel", "mapel-lain", "jenis", "jenis-lain", "target"].forEach((id) => {
      $(id).value = "";
      dipakai.delete(id);
    });
    isiJenis();
    aturDariTugas();
  }

  form.addEventListener("change", (e) => {
    if (e.target.name === "jenjang") gantiJenjang();
    else if (e.target.id === "jenis") {
      $("jenis-lain").value = "";
      dipakai.delete("jenis-lain");
      aturDariTugas();
    }
    if (e.target.id) dipakai.add(e.target.id);
    perbarui();
  });
  form.addEventListener("input", () => perbarui(true));
  form.addEventListener("focusout", (e) => {
    if (e.target.id) dipakai.add(e.target.id);
    perbarui();
  });

  // Tombol terlihat non-aktif, tetapi tetap bisa ditekan agar fokus pindah ke kolom salah pertama
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    FIELDS.forEach((f) => dipakai.add(f.id));
    perbarui();
    const salah = FIELDS.find((f) => adaField(f) && periksa(f));
    if (salah) elemen(salah).focus();
    // Mengirim ke WhatsApp dikerjakan di Tahap 4
  });

  // Angka harga di teks halaman diisi dari config
  document.querySelectorAll("[data-harga]").forEach((s) => {
    const kunci = s.dataset.harga;
    const nilai = kunci === "dp" ? Math.round(config.harga.dp * 100) : config.harga[kunci];
    s.textContent = nilai.toLocaleString("id-ID");
  });

  isiJenis();
  perbarui();
})();
