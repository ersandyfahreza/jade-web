// Uji browser tanpa server atau jaringan asli. Perlu playwright-core dan Chromium terpasang.
// Jalankan: node tests/uji-form.js
const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const base = "http://jade.test";
const config = vm.runInNewContext(fs.readFileSync(path.join(root, "data/fallback.js"), "utf8") + ";FALLBACK_CONFIG");

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [jenjang, gagal] of [["Mahasiswa", false], ["Pelajar", true]]) {
      const context = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
      try {
        const page = await context.newPage();
        const galat = [];
        const kiriman = [];
        let pesan;
        page.on("pageerror", (e) => galat.push(e.message));
        await context.route("**/*", async (route) => {
          const request = route.request();
          const url = new URL(request.url());
          if (url.origin === base) {
            const file = path.resolve(root, "." + (url.pathname === "/" ? "/index.html" : url.pathname));
            if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.abort();
            return route.fulfill({ path: file });
          }
          if (url.hostname === "script.google.com") {
            if (request.method() === "POST") {
              kiriman.push(request.postDataJSON());
              return gagal ? route.abort() : route.fulfill({ json: { ok: true, kode: "JD-0123" } });
            }
            return route.fulfill({ json: config });
          }
          if (url.hostname === "wa.me") {
            pesan = url.searchParams.get("text");
            return route.fulfill({ contentType: "text/html", body: "WhatsApp tiruan" });
          }
          return route.abort();
        });

        await page.goto(base);
        await page.waitForFunction(() => !document.querySelector("form").inert);
        assert.equal(await page.locator("#sitasi, #penjelasan").count(), 0);
        await page.locator(`label[for="jenjang-${jenjang.toLowerCase()}"]`).click();
        if (jenjang === "Mahasiswa") {
          await page.locator("#prodi").fill("Ekonomi");
          await page.locator("#semester").fill("3");
          await page.locator("#matkul").fill("Ekonomi");
        } else {
          await page.locator("#kelas").selectOption("11");
          await page.locator("#mapel").selectOption("Fisika");
        }
        const lanjut = page.locator('button[type="submit"]');
        await lanjut.click();
        assert.ok(!(await page.locator('[data-langkah="1"]').innerText()).includes("Tambahan (opsional)"));
        await page.locator("#jenis").selectOption({ index: 1 });
        await lanjut.click();
        await page.locator("#jml-file").fill("0");
        await page.locator("#tenggat").fill("2099-12-31");
        await lanjut.click();
        assert.ok(!(await page.locator("#ringkasan").innerText()).includes("Tambahan"));
        await page.locator("#kebutuhan").fill("Kebutuhan pengujian dengan mock");
        await page.locator("#ketentuan").fill("-");
        await page.locator("#setuju").check();
        await lanjut.click();
        await page.waitForURL("https://wa.me/**");
        assert.equal(kiriman.length, 1);
        assert.deepEqual(kiriman[0].opsi, []);
        assert.ok(pesan && !/^Tambahan:/m.test(pesan));
        assert.equal(pesan.includes("pesanan belum tercatat otomatis"), gagal);
        assert.deepEqual(galat, []);
        console.log(`OK ${jenjang}: opsi kosong, tanpa Tambahan/galat JS, Sheets tiruan ${gagal ? "gagal" : "berhasil"}`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
