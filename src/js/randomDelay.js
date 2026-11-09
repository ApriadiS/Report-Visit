// randomDelay.js
/**
 * Memberikan jeda dengan durasi acak antara min dan max dalam milidetik.
 * @param {number} min - Waktu jeda minimum.
 * @param {number} max - Waktu jeda maksimum.
 */
function randomDelay(min, max) {
   const delayTime = Math.floor(Math.random() * (max - min + 1) + min);
   console.log(`          ... jeda acak selama ${delayTime} ms ...`);
   return new Promise((resolve) => setTimeout(resolve, delayTime));
}

module.exports = randomDelay;
