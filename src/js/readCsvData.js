// readCsvData.js
const fs = require("fs");
const Papa = require("papaparse");
const CONFIG = require("./config");

function readCsvData(csvPath = CONFIG.CSV_FILE_PATH) {
   return new Promise((resolve, reject) => {
      try {
         const csvFile = fs.readFileSync(csvPath, "utf8");
         Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            delimiter: ";",
            complete: (results) => resolve(results.data),
            error: (error) =>
               reject(new Error(`Gagal mem-parsing CSV: ${error.message}`)),
         });
      } catch (error) {
         reject(new Error(`Gagal membaca file CSV di path: ${csvPath}`));
      }
   });
}

module.exports = readCsvData;
