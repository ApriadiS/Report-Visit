// performAction.js
const randomDelay = require("./randomDelay");
const CONFIG = require("./config");

/**
 * Melakukan aksi pada elemen halaman dengan logging dan jeda acak.
 */
async function performAction(
   page,
   actionType,
   selector,
   description,
   textToType = "",
   _wait = false,
   _on_wait_start = 1500,
   _on_wait_end = 2500,
) {
   console.log(`[MENCOBA] ${description}...`);
   try {
      const element = await page.waitForSelector(selector, {
         visible: true,
         timeout: CONFIG.WAIT_TIMEOUT,
      });

      if (actionType === "click") {
         console.log("Sedang Mengeklik");
         await element.click();
      } else if (actionType === "type") {
         console.log("Sedang Mengetik");
         await element.evaluate((el) => (el.value = ""));
         await element.type(textToType, { delay: 50 });
      }

      console.log(`          > [BERHASIL] ${description}.`);

      // --- PENAMBAHAN JEDA ACAK ---
      // Setelah setiap aksi berhasil, skrip akan berhenti sejenak secara acak.
      if (_wait) {
         await randomDelay(_on_wait_start, _on_wait_end);
      } else {
         await randomDelay(1250, 2000);
      }
      // ----------------------------
   } catch (error) {
      console.error(`          > [GAGAL] ${description}.`);
      throw error;
   }
}

module.exports = performAction;
