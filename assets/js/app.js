// Form Jade: tampil/sembunyi isian, nilai awal dari jenis tugas, validasi, dan kartu estimasi.
// Harga dan daftar tugas dibaca dari config, tidak ditulis di sini. Rumus ada di pricing.js.
(async function () {
  // Form menunggu config (maks 8 detik, lihat muat-config.js); sampai itu form dikunci lewat atribut inert
  const { config, gagal } = await muatConfig();
  const $ = (id) => document.getElementById(id);
  const form = document.querySelector("form.kartu");
  const tombolKirim = form.querySelector('button[type="submit"]');
  $("memuat").remove();

  // Tinggi bar menempel dipakai CSS (scroll-padding-bottom) agar kolom yang difokus tidak tertutup
  const bar = form.querySelector(".bar");
  // Browser tidak menggulir kolom yang hanya setengah tertutup bar; paksa sampai terlihat penuh
  form.addEventListener("focusin", (e) => {
    if (innerWidth <= 640 && !bar.contains(e.target)) e.target.scrollIntoView({ block: "nearest" });
  });
  new ResizeObserver(() => document.documentElement.style.setProperty("--tinggi-bar", bar.offsetHeight + "px")).observe(bar);

  // Pesan kesalahan resmi (SPEC layar Bagian 9)
  const PESAN = {
    wajib: "Bagian ini perlu diisi.",
    rentang: (min, maks) => `Isi angka antara ${min} dan ${maks}.`,
    bulat: "Isi dengan angka bulat.",
    pendek: (n) => `Tulis minimal ${n} karakter.`,
    panjang: (n) => `Maksimal ${n} karakter.`,
    tenggat: "Tenggat tidak boleh sebelum hari ini.",
    setuju: "Centang dulu persetujuan ini untuk melanjutkan.",
    terlaluBanyak: "Tunggu sebentar, lalu coba lagi.",
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

  let kini = 0; // indeks langkah wizard yang tampil (daftar kolom per langkah ada di langkah.js)

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
    if (f.tipe !== "radio") el.setAttribute("aria-required", "true");
  });

  function tampilkanError(f) {
    const pesan = adaField(f) ? periksa(f) : "";
    const g = $(f.id + "-galat");
    g.textContent = pesan;
    g.hidden = !pesan;
    elemen(f).setAttribute("aria-invalid", pesan ? "true" : "false");
  }

  const angkaIsian = (id) => ($(id).value.trim() !== "" ? Number($(id).value) : NaN);
  const kartu = form.querySelector(".estimasi [aria-live]");
  let timerEstimasi;
  let isiTerakhir;

  function hitungSekarang() {
    const sisa = hitungSisaHari($("tenggat").value, hariIni());
    const hasil = tugasTerpilih()
      ? hitungEstimasi(config, {
          jenjang: jenjang(), tugas: $("jenis").value, target: angkaIsian("target"),
          halaman: jmlFileNol() ? 0 : angkaIsian("total-hlm"), sisaHari: sisa,
          format: $("format").value, sitasi: $("sitasi").checked, penjelasan: $("penjelasan").checked
        })
      : null;
    return { sisa, hasil };
  }

  function tampilkanEstimasi() {
    const { sisa, hasil } = hitungSekarang();
    // Susun teks dulu; isi kartu hanya diganti jika berbeda, agar pembaca layar tidak membacakan ulang
    const isi = [];
    const belumSampai3 = "Estimasi muncul setelah kamu mengisi sampai langkah 3.";
    if (!hasil) isi.push(["pesan", kini <= 1 ? belumSampai3 : "Pilih jenis tugas untuk melihat estimasi."]);
    else if (hasil.status === "hubungi") {
      isi.push(["pesan", `Lampiranmu lebih dari ${config.harga.batasLampiran} halaman. Harganya kami hitung manual, hubungi kami lewat WhatsApp.`]);
    } else if (hasil.status === "tidakBisa" && hasil.alasan === "aturanTenggat") {
      isi.push(["pesan", PESAN.hargaGagal]);
    } else if (hasil.status === "ok") {
      isi.push(["angka", `${rupiahWA(hasil.bawah)} - ${rupiahWA(hasil.atas)}`]);
    }
    // Di langkah 1-2 tenggat dan lampiran belum terisi, jadi angka belum bisa dihitung
    if (!isi.length && kini <= 1) isi.push(["pesan", belumSampai3]);
    // Catatan panjang tidak masuk bar yang menempel (tinggi dibatasi); tampil di langkah 4 dan, untuk tenggat hari ini, di langkah 3
    const ok = hasil && hasil.status === "ok";
    const catat = (id, teks) => { $(id).textContent = teks; $(id).hidden = !teks; };
    catat("catatan-lainnya", ok && hasil.lainnya ? "Karena tugasnya di luar daftar, kisarannya lebih lebar. Harga pasti kami kabari setelah membaca kebutuhanmu." : "");
    const teksHariIni = ok && hasil.hariIni ? "Tenggat hari ini perlu kami konfirmasi dulu, belum tentu bisa. Kami kabari lewat WhatsApp." : "";
    catat("catatan-hari-ini", teksHariIni);
    catat("catatan-hari-ini-3", teksHariIni);
    // Peringatan hanya berarti di dekat angka kisaran
    form.querySelectorAll(".estimasi .peringatan").forEach((p) => (p.hidden = !ok));
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
    tombolKirim.textContent = kini < LANGKAH.length - 1 ? "Lanjut"
      : hasil && hasil.status === "hubungi" ? "Hubungi kami lewat WhatsApp" : "Kirim ke WhatsApp";

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
    // Lanjut (langkah 1-3) selalu tampak aktif: tombol itulah yang memunculkan pesan kesalahan
    tombolKirim.setAttribute("aria-disabled", kini < LANGKAH.length - 1 || FIELDS.every((f) => !adaField(f) || !periksa(f)) ? "false" : "true");
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

  // Wizard: tiap langkah hanya tampil sendiri; kolom yang salah pertama (urutan tampil) mendapat fokus
  const penunjuk = $("penunjuk");
  LANGKAH.forEach((l) => {
    const li = document.createElement("li");
    const s = document.createElement("span");
    s.className = "sr-only";
    s.textContent = l.judul;
    li.append(s);
    penunjuk.append(li);
  });
  const salahPertama = (i) => FIELDS.find((f) => LANGKAH[i].kolom.includes(f.id) && adaField(f) && periksa(f));

  function isiRingkasan() {
    const lab = (id) => form.querySelector(`label[for="${id}"]`).textContent;
    const mhs = jenjang() === "Mahasiswa";
    const baris = [
      ["Jenjang", jenjang()],
      ...(mhs ? [[lab("prodi"), $("prodi").value.trim()], [lab("semester"), $("semester").value], [lab("matkul"), $("matkul").value.trim()]]
        : [[lab("kelas"), $("kelas").value], [lab("mapel"), $("mapel").value === "Lainnya" ? $("mapel-lain").value.trim() : $("mapel").value]]),
      [lab("jenis"), tugasLainnya() ? `Tugas lainnya (${$("jenis-lain").value.trim()})` : $("jenis").value],
      [lab("target"), $("target").value],
      [lab("format"), $("format").value],
      ["Tambahan", [$("sitasi").checked && "Sitasi diperiksa", $("penjelasan").checked && "Penjelasan hasil"].filter(Boolean).join(", ") || "Tidak ada"],
      [lab("jml-file"), $("jml-file").value],
      ...(jmlFileNol() ? [] : [[lab("total-hlm"), $("total-hlm").value]]),
      [lab("tenggat"), tanggalIndonesia($("tenggat").value)]
    ];
    $("ringkasan").replaceChildren(...baris.map(([k, v]) => {
      const d = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = k;
      dd.textContent = v;
      d.append(dt, dd);
      return d;
    }));
  }

  function tampilLangkah(i, awal = false) {
    kini = i;
    form.querySelectorAll("[data-langkah]").forEach((s) => (s.hidden = Number(s.dataset.langkah) !== i));
    [...penunjuk.children].forEach((li, n) => {
      li.className = n < i ? "selesai" : "";
      if (n === i) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
    const l = LANGKAH[i];
    $("langkah-ke").textContent = `Langkah ${i + 1} dari ${LANGKAH.length}`;
    $("judul-langkah").textContent = l.judul;
    $("penjelas-langkah").textContent = l.penjelas;
    $("kembali").hidden = i === 0;
    if (i === LANGKAH.length - 1) isiRingkasan();
    perbarui();
    if (awal) return;
    $("umum-langkah").textContent = `Langkah ${i + 1} dari ${LANGKAH.length}: ${l.judul}`;
    form.scrollIntoView({ block: "start" });
    $("judul-langkah").focus({ preventScroll: true });
  }

  function lanjut() {
    LANGKAH[kini].kolom.forEach((id) => dipakai.add(id));
    perbarui();
    const salah = salahPertama(kini);
    if (salah) return elemen(salah).focus();
    tampilLangkah(kini + 1);
  }

  $("kembali").addEventListener("click", () => tampilLangkah(kini - 1));

  // Di langkah terakhir, Enter di luar textarea dan tombol tidak boleh mengirim
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && kini === LANGKAH.length - 1 && !["TEXTAREA", "BUTTON", "A"].includes(e.target.tagName)) e.preventDefault();
  });

  // Tombol terlihat non-aktif di langkah terakhir, tetapi tetap bisa ditekan agar fokus pindah ke kolom salah pertama
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (kini < LANGKAH.length - 1) return lanjut();
    FIELDS.forEach((f) => dipakai.add(f.id));
    perbarui();
    const i = LANGKAH.findIndex((_, n) => salahPertama(n));
    if (i >= 0) {
      if (i !== kini) tampilLangkah(i);
      return elemen(salahPertama(i)).focus();
    }
    kirim();
  });

  let pesanTerakhir = "";

  let sedangKirim = false;
  const KUNCI_JEDA = "jade_kirim_terakhir";
  const waktuKirimTerakhir = () => {
    try { return Number(localStorage.getItem(KUNCI_JEDA)) || 0; } catch (err) { return 0; }
  };

  // Mengembalikan kode dari server, atau null bila gagal, ditolak, atau lewat batas waktu
  async function catatKeSheets(data) {
    const batal = new AbortController();
    const timer = setTimeout(() => batal.abort(), CONFIG.batasWaktuMs);
    try {
      const r = await fetch(CONFIG.appsScriptUrl, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data), redirect: "follow", signal: batal.signal
      });
      const j = await r.json();
      return j.ok && /^JD-\d{4,}$/.test(j.kode) ? j.kode : null;
    } catch (err) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async function kirim() {
    if (sedangKirim) return;
    const galatKirim = $("kirim-galat");
    galatKirim.hidden = true;
    if (Date.now() - waktuKirimTerakhir() < CONFIG.jedaKirimMs) {
      galatKirim.textContent = PESAN.terlaluBanyak;
      galatKirim.hidden = false;
      return;
    }
    sedangKirim = true;
    form.inert = true; // kunci form selama mengirim agar isian dan tombol tidak bisa diubah
    tombolKirim.textContent = "Mencatat pesananmu...";
    tombolKirim.setAttribute("aria-disabled", "true");
    // Cadangan bila penyusunan pesan error tak terduga: WhatsApp tetap terbuka (CLAUDE.md aturan 4)
    let tautan = tautanWA(CONFIG.nomorWhatsApp, "Halo Jade, aku mau pesan layanan pendampingan.");
    try {
      const { sisa, hasil } = hitungSekarang();
      const tugas = tugasTerpilih();
      const mhs = jenjang() === "Mahasiswa";
      const ok = hasil.status === "ok";
      try { localStorage.setItem(KUNCI_JEDA, String(Date.now())); } catch (err) { /* tanpa penyimpanan, jeda hanya berlaku di server */ }
      const kodeServer = await catatKeSheets({
        website: form.elements.website.value,
        jenjang: jenjang(),
        prodiKelas: mhs ? $("prodi").value.trim() : `Kelas ${$("kelas").value}`,
        semester: mhs ? Number($("semester").value) : "",
        matkul: mhs ? $("matkul").value.trim() : ($("mapel").value === "Lainnya" ? $("mapel-lain").value.trim() : $("mapel").value),
        tugas: $("jenis").value,
        tugasLainnya: tugasLainnya() ? $("jenis-lain").value.trim() : "",
        jumlahFile: Number($("jml-file").value),
        totalHalaman: jmlFileNol() ? 0 : Number($("total-hlm").value),
        target: Number($("target").value),
        format: $("format").value,
        tenggat: $("tenggat").value,
        opsi: [$("sitasi").checked && "Sitasi diperiksa", $("penjelasan").checked && "Penjelasan hasil"].filter(Boolean),
        kebutuhan: $("kebutuhan").value.trim(),
        ketentuan: $("ketentuan").value.trim(),
        // Estimasi tidak ditampilkan (lampiran > batas atau data harga belum terbaca): dicatat 0
        estimasiBawah: ok ? hasil.bawah : 0,
        estimasiAtas: ok ? hasil.atas : 0
      });
      const kode = kodeServer || buatKodeSementara();
      pesanTerakhir = susunPesanWA({
        kode, jenjang: jenjang(),
        prodi: $("prodi").value.trim(), semester: Number($("semester").value), matkul: $("matkul").value.trim(),
        kelas: $("kelas").value, mapel: $("mapel").value === "Lainnya" ? $("mapel-lain").value.trim() : $("mapel").value,
        jenisTugas: tugasLainnya() ? `Tugas lainnya (${$("jenis-lain").value.trim()})` : $("jenis").value,
        target: Number($("target").value), satuan: tugas.satuan,
        jmlFile: Number($("jml-file").value), totalHlm: jmlFileNol() ? 0 : Number($("total-hlm").value),
        format: $("format").value, tenggat: $("tenggat").value, sisaHari: sisa,
        sitasi: $("sitasi").checked, penjelasan: $("penjelasan").checked,
        kebutuhan: $("kebutuhan").value, ketentuan: $("ketentuan").value,
        bawah: hasil.bawah, atas: hasil.status === "ok" ? hasil.atas : null,
        hargaBelumTerbaca: hasil.status !== "ok" && hasil.status !== "hubungi",
        batasLampiran: config.harga.batasLampiran, belumTercatat: !kodeServer
      });
      if (kodeServer) {
        const tebal = document.createElement("strong");
        tebal.textContent = kode;
        $("panel-teks").replaceChildren("Pesananmu tercatat dengan kode ", tebal,
          ". WhatsApp akan terbuka. Kirim pesannya, lalu kirim lampiranmu di chat yang sama.");
      } else {
        $("panel-teks").textContent = `Pesananmu belum tercatat otomatis, tapi tetap bisa kamu kirim lewat WhatsApp. Kode sementara: ${kode}`;
      }
      tautan = tautanWA(CONFIG.nomorWhatsApp, pesanTerakhir);
      $("wa-lagi").href = tautan;
      $("salin-status").textContent = "";
      $("salin-manual").hidden = true;
      $("panel-kirim").hidden = false;
    } finally {
      window.location.href = tautan;
      sedangKirim = false;
      form.inert = false;
      perbarui(); // mengembalikan teks dan keadaan tombol
      tombolKirim.focus(); // inert tadi melepas fokus; kembalikan agar keyboard dan pembaca layar tidak kehilangan posisi
    }
  }

  $("salin").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pesanTerakhir);
      $("salin-manual").hidden = true;
      $("salin-status").textContent = "Pesan disalin.";
    } catch (err) {
      $("salin-manual").value = pesanTerakhir;
      $("salin-manual").hidden = false;
      $("salin-manual").select();
      $("salin-status").textContent = "Pesan belum bisa disalin otomatis. Salin dari kotak di bawah ini.";
    }
  });

  // Angka harga di teks halaman diisi dari config
  document.querySelectorAll("[data-harga]").forEach((s) => {
    const kunci = s.dataset.harga;
    const nilai = kunci === "dp" ? Math.round(config.harga.dp * 100) : config.harga[kunci];
    s.textContent = nilai.toLocaleString("id-ID");
  });

  if (gagal) {
    $("data-gagal").textContent = PESAN.hargaGagal;
    $("data-gagal").hidden = false;
  }
  isiJenis();
  tampilLangkah(0, true);
  form.inert = false;
})();
