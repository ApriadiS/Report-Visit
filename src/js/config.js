// config.js
const path = require("path");

const CONFIG = {
   FORM_URL:
      "https://docs.google.com/forms/d/e/1FAIpQLSfY1ljbXkWp-svDLkbc1UKwPoOTo5blDv1Z4eagqXSXZAV9sg/viewform?pli=1",
   CSV_FILE_PATH: path.join(__dirname, "../../data/output/Book1.csv"),
   CHROME_PROFILE_PATH:
      "C:\\Users\\MSI A12VE\\Documents\\GitHub\\Report-Visit\\data\\profile",
   PROFILE_DIRECTORY: "Adi",
   WAIT_TIMEOUT: 15000,
   UPLOAD_TIMEOUT: 60000,
   PRODUCTION_MODE: true, // Set false untuk testing
   DELAY_46: false,
};

module.exports = CONFIG;
