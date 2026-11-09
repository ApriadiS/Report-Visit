// main.js
const fillGoogleForm = require("./fillGoogleForm");
const path = require("path");

// Ambil input dari argumen CLI (node main.js --csv=... --prod --delay46)
const args = process.argv.slice(2);
const options = {};
const name = "APRIADI SALIM"; // Ganti dengan nama yang sesuai jika diperlukan
// const name = "MUHAMMAD ZENNUR"; // Ganti dengan nama yang sesuai jika diperlukan

args.forEach((arg) => {
   if (arg.startsWith("--csv=")) {
      options.CSV_FILE_PATH = path.resolve(arg.replace("--csv=", ""));
   } else if (arg === "--prod") {
      options.PRODUCTION_MODE = true;
   } else if (arg === "--test") {
      options.PRODUCTION_MODE = false;
   } else if (arg === "--delay46") {
      options.DELAY_46 = true;
   }
});

console.log("\n=== Otomasi Google Form Absensi ===");
console.log("Opsi:", options);

if (name === "APRIADI SALIM") {
   fillGoogleForm(options, name);
}else if (name === "MUHAMMAD ZENNUR") {
   const fillGoogleFormZennur = require("./fillGoogleForm_Zennur");
   fillGoogleFormZennur(options,name);
} else {
   console.error("Nama tidak dikenali. Silakan periksa kembali.");
}
