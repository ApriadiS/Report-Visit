// fillGoogleForm.js
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const CONFIG = require("./config");
const randomDelay = require("./randomDelay");
const performAction = require("./performAction");
const readCsvData = require("./readCsvData");
const selectDropdownItemByName = require("./selectDropdownItemByName");


/**
 * Fungsi utama untuk mengisi Google Form secara otomatis.
 * @param {Object} options - Opsi untuk override konfigurasi (csvPath, productionMode, delay46)
 * @param {string} name - Nama pengguna
 */
async function fillGoogleForm(options = {}, name) {
   const config = { ...CONFIG, ...options };
   let data;
   try {
      data = await readCsvData(config.CSV_FILE_PATH);
      console.log("Data CSV berhasil dimuat. Memulai proses otomasi...");
   } catch (error) {
      console.error(error.message);
      return;
   }

   let browser;
   try {
      console.log(
         "Mencoba menyambung ke browser Chrome yang sudah berjalan di port 9222...",
      );
      browser = await puppeteer.connect({
         browserURL: "http://127.0.0.1:9222",
         defaultViewport: null,
      });
      console.log("Berhasil tersambung dengan browser!");

      const pages = await browser.pages();
      const page = pages.length > 0 ? pages[0] : await browser.newPage();

      for (const [index, row] of data.entries()) {
         const storeId = row["Store ID"];
         try {
            const isPM = row["PM/AM"]?.toLowerCase() === "pm";
            const clockIn = row["ClockIn/Out"]?.toLowerCase() === "in";
            const nextRow = data[index + 1];
            const nextClockIn = nextRow
               ? nextRow["ClockIn/Out"]?.toLowerCase() === "in"
               : null;
            if (clockIn) {
               console.log(
                  `\n--- Memproses baris ke-${index + 1}: Store ID '${storeId}' untuk melakukan ClockIn ---`,
               );
            } else {
               console.log(
                  `\n--- Memproses baris ke-${index + 1}: Store ID '${storeId}' untuk melakukan ClockOut ---`,
               );
            }
            console.log(`[MENCOBA] Membuka URL Google Form...`);
            await page.goto(config.FORM_URL, { waitUntil: "networkidle2" });
            console.log(`          > [BERHASIL] Halaman form berhasil dimuat.`);
            await randomDelay(100, 1000);

            // --- HALAMAN 1 ---
            const textBoxSave = await page.waitForSelector(
               "div.uHMk6b.fsHoPb",
               {
                  visible: true,
                  clickable: true,
                  timeout: CONFIG.WAIT_TIMEOUT,
               },
            );
            if (!textBoxSave) {
               throw new Error(
                  "Elemen halaman pertama tidak ditemukan. Pastikan URL form benar dan struktur halaman belum berubah.",
               );
            }
            await textBoxSave.click();
            console.log(
               `          > [BERHASIL] Klik untuk memulai mengisi form.`,
            );

            await randomDelay(1000, 1500);
            const dropdownSelector = await page.waitForSelector("div.ry3kXd", {
               visible: true,
               clickable: true,
               timeout: CONFIG.WAIT_TIMEOUT,
            });
            if (!dropdownSelector) {
               throw new Error(
                  "Dropdown untuk memilih nama tidak ditemukan. Pastikan struktur halaman belum berubah.",
               );
            }
            await dropdownSelector.click();
            console.log(`          > [BERHASIL] Dropdown nama diklik.`);

            await randomDelay(1000, 1500);
            const droplistArea = await page.waitForSelector(
               "div.OA0qNb.ncFHed.QXL7Te",
               {
                  visible: true,
                  timeout: CONFIG.WAIT_TIMEOUT,
               },
            );
            if (!droplistArea) {
               throw new Error(
                  "Area dropdown tidak muncul. Pastikan struktur halaman belum berubah.",
               );
            }
            // Pilih item dropdown berdasarkan atribut data-value
            // Gunakan nama dari CSV jika tersedia, fallback ke contoh 'APRIADI SALIM'
            await randomDelay(1000, 1500);
            const targetName = name || "APRIADI SALIM";
            console.log(
               `          > [MENCOBA] Mencari item dropdown dengan data-value='${targetName}'`,
            );
            await randomDelay(1000, 1500);
            const itemSelected = await page.evaluate(
               (area, value) => {
                  if (!area) return false;
                  const el = area.querySelector(
                     `div.MocG8c.HZ3kWc.mhLiyf.OIC90c.LMgvRb[data-value="${value}"]`,
                  );
                  if (!el) return false;
                  el.click();
                  return true;
               },
               droplistArea,
               targetName,
            );
            if (!itemSelected) {
               throw new Error(
                  `Item dropdown dengan data-value='${targetName}' tidak ditemukan.`,
               );
            }
            console.log(
               `          > [BERHASIL] Item dropdown '${targetName}' dipilih.`,
            );

            await randomDelay(1000, 1500);
            const visitDroplistSelector = await page.waitForSelector(
               "div.MocG8c.HZ3kWc.mhLiyf.LMgvRb.KKjvXb.DEh1R",
               {
                  visible: true,
                  clickable: true,
                  timeout: CONFIG.WAIT_TIMEOUT,
               },
            );
            if (!visitDroplistSelector) {
               throw new Error(
                  "Dropdown untuk memilih jenis kunjungan tidak ditemukan. Pastikan struktur halaman belum berubah.",
               );
            }
            await visitDroplistSelector.click();
            console.log(
               `          > [BERHASIL] Dropdown jenis kunjungan diklik.`,
            );

            // Pilih item dropdown berdasarkan atribut data-value
            // Gunakan nama dari CSV jika tersedia, fallback ke contoh 'Absensi Visit Store'
            const targetActivity = "Absensi Visit Store";
            console.log(
               `          > [MENCOBA] Mencari item dropdown dengan data-value='${targetActivity}'`,
            );
            await randomDelay(1000, 1500);
            const itemSelected1 = await page.evaluate((value) => {
               // Ambil semua elemen item dalam dropdown aktivitas
               const items = document.querySelectorAll(
                  "div.OA0qNb.ncFHed.QXL7Te div.MocG8c.HZ3kWc.mhLiyf.OIC90c.LMgvRb",
               );
               if (!items || items.length === 0) {
                  console.log("Tidak ada item dropdown yang ditemukan.");
                  return false;
               }
               for (let i = 0; i < items.length; i++) {
                  const el = items[i];
                  if (
                     el.getAttribute &&
                     el.getAttribute("data-value") === value
                  ) {
                     el.click();
                     return true;
                  }
               }
               // Coba query langsung sebagai fallback
               const fallback = document.querySelector(
                  `div.OA0qNb.ncFHed.QXL7Te div div.MocG8c.HZ3kWc.mhLiyf.OIC90c.LMgvRb[data-value="${value}"]`,
               );
               if (fallback) {
                  fallback.click();
                  return true;
               }
               console.log(
                  `Item dengan data-value='${value}' tidak ditemukan di dropdown aktivitas.`,
               );
               return false;
            }, targetActivity);
            if (!itemSelected1) {
               throw new Error(
                  `Item dropdown dengan data-value='${targetActivity}' tidak ditemukan.`,
               );
            }
            console.log(
               `          > [BERHASIL] Item dropdown '${targetActivity}' dipilih.`,
            );

            await randomDelay(2000, 3500);        
            await performAction(
               page,
               "click",
               "xpath=//form[@id='mG61Hd']/div[2]/div/div[3]/div/div/div/span",
               "Klik Button Next",
            );    
            
            // --- HALAMAN 2 ---
            console.log("\n--- Mengisi Halaman 2 ---");
            await randomDelay(5000, 6000);        
            await performAction(
               page,
               "type",
               "xpath=//input[@type='text']",
               "Ketik Store ID",
               row["Store ID"], true, 500, 1000
            );
            if (clockIn) {
               await performAction(
                  page,
                  "click",
                  `xpath=//div[@id='i11']/div[3]/div`,
                  "Klik ClockIn", true, 500, 1000
               );
            } else {
               await performAction(
                  page,
                  "click",
                  `xpath=//div[@id='i14']/div[3]/div`,
                  "Klik ClockOut", true, 500, 1000
               );
            }
            await performAction(
               page,
               "type",
               "xpath=//input[@type='date']",
               "Mengisi Tanggal",
               row["Date"], true, 500, 1000
            );
            await performAction(
               page,
               "type",
               "xpath=(//input[@type='text'])[2]",
               "Mengisi Jam",
               row["Hour"], true, 500, 1000
            );
            await performAction(
               page,
               "type",
               "xpath=(//input[@type='text'])[3]",
               "Mengisi Menit",
               row["Minute"], true, 500, 1000
            );
            if (isPM) {
               await performAction(
                  page,
                  "click",
                  "xpath=//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div[4]/div/div/div",
                  "Ganti PM", true, 500, 1000
               );
               await performAction(
                  page,
                  "click",
                  "xpath=//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div[4]/div[2]/div[2]",
                  "Click PM", true, 500, 1000
               );
            }
            
            // --- UPLOAD FOTO OTOMATIS ---
            console.log("\n--- Proses Upload File Otomatis ---");

            const photoPath = row["ImagePath"];
            if (!photoPath) {
               throw new Error(
                  "Path foto tidak ditemukan di CSV untuk kolom 'ImagePath'",
               );
            }
            if (!fs.existsSync(photoPath)) {
               throw new Error(`File foto tidak ditemukan: ${photoPath}`);
            }

            console.log(`[MENCOBA] Mengupload foto dari: ${photoPath}`);

            // Klik Add file untuk buka modal
            await performAction(
               page,
               "click",
               "xpath=//span/span[2]",
               "Mengklik tombol 'Add file'",
            );

            // Tunggu modal muncul (tambah jeda agar iframe benar-benar siap)
            await randomDelay(9000, 10000);

            console.log("[MENCOBA] Mencari iframe dan tombol Jelajah...");

            // 1. Cari semua iframe yang ada di halaman
            const frames = await page.frames();
            // 2. Cari iframe yang di dalamnya ada teks "Jelajah" atau "Browse"
            const uploadFrame = frames.find((f) => f.url().includes("picker"));

            if (!uploadFrame) {
               throw new Error(
                  "Iframe upload tidak ditemukan. Coba tambah durasi randomDelay.",
               );
            }

            const [fileChooser] = await Promise.all([
               page.waitForFileChooser({ timeout: 60000 }),
               uploadFrame.evaluate(() => {
                  // Kita pakai XPath asli kamu di sini tanpa perubahan selector
                  const xpath =
                     "//div[@id='yDmH0d']/div[2]/div[3]/div[2]/div[2]/div/div/div/div/div/div[2]/div/div/button/span[6]";
                  const result = document.evaluate(
                     xpath,
                     document,
                     null,
                     XPathResult.FIRST_ORDERED_NODE_TYPE,
                     null,
                  ).singleNodeValue;

                  if (result) {
                     // Klik parent-nya (tombolnya)
                     result.parentElement.click();
                  } else {
                     // Jika gagal, coba klik tombol apapun yang punya teks "Jelajah"
                     const allButtons = Array.from(
                        document.querySelectorAll('button, div[role="button"]'),
                     );
                     const jelajahBtn = allButtons.find(
                        (b) =>
                           b.innerText.includes("Jelajah") ||
                           b.innerText.includes("Browse"),
                     );
                     if (jelajahBtn) jelajahBtn.click();
                     else
                        throw new Error(
                           "Tombol Jelajah tidak ditemukan di dalam iframe",
                        );
                  }
               }),
            ]);

            console.log("[MENCOBA] Menerima file chooser...");
            await fileChooser.accept([photoPath]);
            console.log("          > [BERHASIL] File dipilih.");

            // Tunggu 5 detik untuk proses upload
            console.log(
               "[MENUNGGU] Menunggu upload gambar selesai (10 detik)...",
            );
            await new Promise((resolve) => setTimeout(resolve, 10000));

            // Tunggu hingga tombol Submit muncul (indikasi upload selesai)
            console.log("[MENUNGGU] Mencari tombol Submit...");
            await page.waitForSelector("xpath/.//span[text()='Submit']", {
               visible: true,
               timeout: CONFIG.UPLOAD_TIMEOUT,
            });
            console.log(
               "          > [BERHASIL] Tombol 'Submit' terdeteksi aktif.",
            );
            await new Promise((resolve) => setTimeout(resolve, 2500));
            if (CONFIG.PRODUCTION_MODE) {
               console.log(
                  "[MENCOBA] Mengklik tombol 'Submit' untuk mengirim form...",
               );
               const submitBtn = await page.waitForSelector(
                  "xpath/.//span[text()='Submit']",
               );
               await submitBtn.click();
               console.log("          > [BERHASIL] Tombol Submit diklik.");

               // Tunggu halaman konfirmasi
               await new Promise((resolve) => setTimeout(resolve, 10000));
            } else {
               console.log(
                  "\n[TESTING MODE] Mode testing aktif - Submit dibatalkan.",
               );
               console.log(
                  "Set CONFIG.PRODUCTION_MODE = true untuk submit otomatis.",
               );
               return;
            }
            console.log(
               `\nBERHASIL: Data untuk Store ID '${row["Store ID"]}' telah dikirim.`,
            );
            await new Promise((resolve) => setTimeout(resolve, 10000));

            if (CONFIG.DELAY_46) {
               // Delay 46 menit jika row sekarang "in" dan row berikutnya "out"
               if (clockIn && nextClockIn === false) {
                  const delayMinutes = 46;
                  console.log(
                     `\n[DELAY] Menunggu ${delayMinutes} menit sebelum ClockOut...`,
                  );
                  await new Promise((resolve) =>
                     setTimeout(resolve, delayMinutes * 60 * 1000),
                  );
                  console.log(
                     `[DELAY] Selesai menunggu. Melanjutkan ke row berikutnya.`,
                  );
               }
            }
         } catch (error) {
            console.error(
               `\nERROR: Gagal memproses data untuk Store ID '${row["Store ID"]}'. Melanjutkan ke baris berikutnya.`
            );
            console.error("Pesan Error Teknis:", error.message.split("\n")[0]);
            continue;
         }
      }
   } finally {
      console.log("\nProses otomasi selesai. Melepaskan koneksi dari browser.");
      if (browser) {
         await browser.disconnect();
      }
   }
}

module.exports = fillGoogleForm;
