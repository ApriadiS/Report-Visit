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
 */
async function fillGoogleForm(options = {}) {
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
            // console.log("\n--- Mengisi Halaman 1 ---");
            // await performAction(
            //    page,
            //    "click",
            //    "xpath=//div[@id='i5']/div[2]",
            //    "Klik Check Box",
            // );

            // await performAction(
            //    page,
            //    "click",
            //    "xpath=//div[2]/div/div/div[2]/div/div/div/div/span",
            //    "Memilih Nama MDO",
            // );

            // --- HALAMAN 1 ---
            console.log("\n--- Mengisi Halaman 1 ---");
            await performAction(
               page,
               "click",
               "xpath=//div[@id='i5']/div[2]",
               "Klik Check Box",
            );
            await performAction(
               page,
               "click",
               "xpath=//div[2]/div/div/div[2]/div/div/div/div/span",
               "Memilih Nama MDO",
            );
            await selectDropdownItemByName(
               page,
               "APRIADI SALIM",
               "div.OA0qNb.ncFHed.QXL7Te",
            );
            await performAction(
               page,
               "click",
               "xpath=//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div/span",
               "Memilih Activity MDO",
            );
            await performAction(
               page,
               "click",
               "xpath=//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div[2]/div[3]/span",
               "Pilih Absensi Visit Store",
            );
            console.log(
               "\n[TESTING MODE] Menunggu 99 detik sebelum lanjut ke halaman berikutnya...",
            );
            await new Promise((resolve) => setTimeout(resolve, 99999));
            await performAction(
               page,
               "click",
               "xpath=//form[@id='mG61Hd']/div[2]/div/div[3]/div/div/div/span",
               "Klik Button Next",
            );
            await randomDelay(500, 1500);

            // --- HALAMAN 2 ---
            console.log("\n--- Mengisi Halaman 2 ---");
            await performAction(
               page,
               "type",
               "xpath=//input[@type='text']",
               "Ketik Store ID",
               row["Store ID"],
            );
            if (clockIn) {
               await performAction(
                  page,
                  "click",
                  `xpath=//div[@id='i11']/div[3]/div`,
                  "Klik ClockIn",
               );
            } else {
               await performAction(
                  page,
                  "click",
                  `xpath=//div[@id='i14']/div[3]/div`,
                  "Klik ClockOut",
               );
            }
            await performAction(
               page,
               "type",
               "xpath=//input[@type='date']",
               "Mengisi Tanggal",
               row["Date"],
            );
            await performAction(
               page,
               "type",
               "xpath=(//input[@type='text'])[2]",
               "Mengisi Jam",
               row["Hour"],
            );
            await performAction(
               page,
               "type",
               "xpath=(//input[@type='text'])[3]",
               "Mengisi Menit",
               row["Minute"],
            );
            if (isPM) {
               await performAction(
                  page,
                  "click",
                  "xpath=//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div[4]/div/div/div",
                  "Ganti PM",
               );
               await performAction(
                  page,
                  "click",
                  "xpath=//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div[4]/div[2]/div[2]",
                  "Click PM",
               );
            }

            // --- UPLOAD FOTO OTOMATIS ---
            console.log("\n--- Proses Upload File Otomatis ---");
            const photoPath = row["ImagePath"];
            if (!photoPath)
               throw new Error(
                  "Path foto tidak ditemukan di CSV untuk kolom 'ImagePath'",
               );
            if (!fs.existsSync(photoPath))
               throw new Error(`File foto tidak ditemukan: ${photoPath}`);
            console.log(`[MENCOBA] Mengupload foto dari: ${photoPath}`);
            await performAction(
               page,
               "click",
               "xpath/.//span[text()='Add file']",
               "Mengklik tombol 'Add file'",
            );
            await randomDelay(3000, 4000);
            console.log("[MENCOBA] Mengklik tombol Browse di iframe...");
            const [fileChooser] = await Promise.all([
               page.waitForFileChooser({ timeout: 60000 }),
               page.evaluate(() => {
                  const iframe = document.querySelectorAll("iframe")[1];
                  if (!iframe) throw new Error("Iframe tidak ditemukan");
                  const iframeDoc =
                     iframe.contentDocument || iframe.contentWindow.document;
                  const browseBtn = iframeDoc.evaluate(
                     "//div[@id='yDmH0d']/div[2]/div[3]/div[2]/div[2]/div/div/div/div/div/div[2]/div/div/button/span[6]",
                     iframeDoc,
                     null,
                     XPathResult.FIRST_ORDERED_NODE_TYPE,
                     null,
                  ).singleNodeValue;
                  if (!browseBtn)
                     throw new Error("Tombol Browse tidak ditemukan");
                  browseBtn.parentElement.click();
               }),
            ]);
            console.log("[MENCOBA] Menerima file chooser...");
            await fileChooser.accept([photoPath]);
            console.log("          > [BERHASIL] File dipilih.");
            console.log(
               "[MENUNGGU] Menunggu upload gambar selesai (7 detik)...",
            );
            await new Promise((resolve) => setTimeout(resolve, 7000));
            console.log("[MENUNGGU] Mencari tombol Submit...");
            await page.waitForSelector("xpath/.//span[text()='Submit']", {
               visible: true,
               timeout: config.UPLOAD_TIMEOUT,
            });
            console.log(
               "          > [BERHASIL] Tombol 'Submit' terdeteksi aktif.",
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (config.PRODUCTION_MODE) {
               console.log(
                  "[MENCOBA] Mengklik tombol 'Submit' untuk mengirim form...",
               );
               const submitBtn = await page.waitForSelector(
                  "xpath/.//span[text()='Submit']",
               );
               await submitBtn.click();
               console.log("          > [BERHASIL] Tombol Submit diklik.");
               await new Promise((resolve) => setTimeout(resolve, 5000));
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
            await new Promise((resolve) => setTimeout(resolve, 3000));
            if (config.DELAY_46) {
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
               `\nERROR: Gagal memproses data untuk Store ID '${row["Store ID"]}'. Melanjutkan ke baris berikutnya.`,
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
