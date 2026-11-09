// selectDropdownItemByName.js
const randomDelay = require("./randomDelay");

/**
 * Memilih item pada droplist Google Form berdasarkan nama (teks pada span).
 * Mencari dahulu di overlay dropdown (listbox) untuk menghindari salah pilih,
 * lalu klik menggunakan ElementHandle dan konfirmasi bila pembungkusSelector diberikan.
 */
async function selectDropdownItemByName(
   page,
   nama,
   pembungkusSelector,
   opts = {},
) {
   const attempts = opts.attempts || 4;
   const timeout = opts.timeout || 4000;
   const nameNorm = nama.trim().toLowerCase();

   if (pembungkusSelector) {
      try {
         await page.waitForSelector(pembungkusSelector, {
            visible: true,
            timeout: Math.min(1500, timeout),
         });
      } catch (e) {
         // continue, wrapper may appear later
      }
   }

   for (let attempt = 1; attempt <= attempts; attempt++) {
      await new Promise((r) => setTimeout(r, 150));

      // try clicking within the page context: scrollIntoView, click, and report metadata
      const clickResult = await page.evaluate(async (targetLower) => {
         const overlaySelectors = [
            'div[role="listbox"]',
            'div[role="presentation"]',
            "div.MocG8c",
            "div.kRoyt",
            'div[role="menu"]',
         ];

         const isVisible = (el) => {
            const r = el.getBoundingClientRect();
            const s = window.getComputedStyle(el);
            return (
               r.width > 0 &&
               r.height > 0 &&
               s.visibility !== "hidden" &&
               s.display !== "none"
            );
         };

         for (const sel of overlaySelectors) {
            const overlays = Array.from(document.querySelectorAll(sel)).filter(
               isVisible,
            );
            for (const ov of overlays) {
               const options = Array.from(
                  ov.querySelectorAll('div[role="option"], div[jsname]'),
               ).map((o) => o.closest('div[role="option"]') || o);
               for (const opt of options) {
                  const spans = Array.from(opt.querySelectorAll("span"));
                  for (const s of spans) {
                     const txt = s.textContent && s.textContent.trim();
                     if (!txt) continue;
                     if (txt.toLowerCase() === targetLower) {
                        try {
                           opt.scrollIntoView({
                              block: "center",
                              inline: "nearest",
                           });
                        } catch (e) {}
                        const child =
                           opt.querySelector(
                              "div[jsname], button, label, span",
                           ) || opt;
                        try {
                           child.click();
                        } catch (err) {
                           try {
                              child.dispatchEvent(
                                 new MouseEvent("mousedown", { bubbles: true }),
                              );
                           } catch (e) {}
                           try {
                              child.dispatchEvent(
                                 new MouseEvent("mouseup", { bubbles: true }),
                              );
                           } catch (e) {}
                           try {
                              child.dispatchEvent(
                                 new MouseEvent("click", { bubbles: true }),
                              );
                           } catch (e) {}
                        }
                        const rect = opt.getBoundingClientRect();
                        return {
                           found: true,
                           clicked: true,
                           role: opt.getAttribute("role") || null,
                           jsname: opt.getAttribute("jsname") || null,
                           classes: opt.className || "",
                           text: (
                              opt.innerText ||
                              opt.textContent ||
                              ""
                           ).trim(),
                           dataValue: opt.getAttribute("data-value") || null,
                           rect: {
                              x: rect.x,
                              y: rect.y,
                              width: rect.width,
                              height: rect.height,
                           },
                        };
                     }
                  }
               }
            }
         }

         // fallback: global search by role=option or data-value
         const globalOptions = Array.from(
            document.querySelectorAll('div[role="option"]'),
         );
         for (const opt of globalOptions) {
            const txtAll = (opt.innerText || opt.textContent || "").trim();
            if (txtAll && txtAll.toLowerCase().includes(targetLower)) {
               try {
                  opt.scrollIntoView({ block: "center", inline: "nearest" });
               } catch (e) {}
               const child =
                  opt.querySelector("div[jsname], button, label, span") || opt;
               try {
                  child.click();
               } catch (err) {
                  try {
                     child.dispatchEvent(
                        new MouseEvent("mousedown", { bubbles: true }),
                     );
                  } catch (e) {}
                  try {
                     child.dispatchEvent(
                        new MouseEvent("mouseup", { bubbles: true }),
                     );
                  } catch (e) {}
                  try {
                     child.dispatchEvent(
                        new MouseEvent("click", { bubbles: true }),
                     );
                  } catch (e) {}
               }
               const rect = opt.getBoundingClientRect();
               return {
                  found: true,
                  clicked: true,
                  role: opt.getAttribute("role") || null,
                  jsname: opt.getAttribute("jsname") || null,
                  classes: opt.className || "",
                  text: txtAll,
                  dataValue: opt.getAttribute("data-value") || null,
                  rect: {
                     x: rect.x,
                     y: rect.y,
                     width: rect.width,
                     height: rect.height,
                  },
               };
            }
            const dv = (opt.getAttribute("data-value") || "").trim();
            if (dv && dv.toLowerCase() === targetLower) {
               try {
                  opt.scrollIntoView({ block: "center", inline: "nearest" });
               } catch (e) {}
               const child =
                  opt.querySelector("div[jsname], button, label, span") || opt;
               try {
                  child.click();
               } catch (err) {
                  try {
                     child.dispatchEvent(
                        new MouseEvent("mousedown", { bubbles: true }),
                     );
                  } catch (e) {}
                  try {
                     child.dispatchEvent(
                        new MouseEvent("mouseup", { bubbles: true }),
                     );
                  } catch (e) {}
                  try {
                     child.dispatchEvent(
                        new MouseEvent("click", { bubbles: true }),
                     );
                  } catch (e) {}
               }
               const rect = opt.getBoundingClientRect();
               return {
                  found: true,
                  clicked: true,
                  role: opt.getAttribute("role") || null,
                  jsname: opt.getAttribute("jsname") || null,
                  classes: opt.className || "",
                  text: txtAll,
                  dataValue: dv,
                  rect: {
                     x: rect.x,
                     y: rect.y,
                     width: rect.width,
                     height: rect.height,
                  },
               };
            }
         }

         return {
            found: false,
            clicked: false,
            candidates: globalOptions
               .slice(0, 10)
               .map((o) => (o.innerText || o.textContent || "").trim()),
         };
      }, nameNorm);

      if (!clickResult || !clickResult.found) {
         const candidates = (clickResult && clickResult.candidates) || [];
         console.log(
            `          > [DEBUG] selectDropdownItemByName attempt ${attempt} - no exact match in overlays. Candidates:`,
            candidates.slice(0, 5),
         );
         await new Promise((r) => setTimeout(r, 200));
         continue;
      }

      try {
         console.log(
            "          > [DEBUG] selectDropdownItemByName: candidate element metadata:",
            {
               role: clickResult.role,
               jsname: clickResult.jsname,
               classes: clickResult.classes,
               text: clickResult.text,
               pointerEvents: "auto",
               rect: clickResult.rect,
            },
         );

         // after clicking inside page, wait a short bit then confirm
         await randomDelay(200, 600);

         let confirmed = false;
         if (pembungkusSelector) {
            try {
               await page.waitForFunction(
                  (sel, wanted) => {
                     const el = document.querySelector(sel);
                     if (!el) return false;
                     const txt = (el.innerText || el.textContent || "")
                        .trim()
                        .toLowerCase();
                     return txt.includes(wanted);
                  },
                  { timeout: Math.min(timeout, 3000) },
                  pembungkusSelector,
                  nameNorm,
               );
               confirmed = true;
            } catch (e) {
               // not confirmed by wrapper text
            }
         }

         if (!confirmed) {
            try {
               const overlaySelectors = [
                  'div[role="listbox"]',
                  'div[role="presentation"]',
                  "div.MocG8c",
                  "div.kRoyt",
                  'div[role="menu"]',
               ];
               await page.waitForFunction(
                  (selectors) => {
                     const sel = selectors.join(",");
                     const els = Array.from(document.querySelectorAll(sel));
                     return !els.some((o) => {
                        const r = o.getBoundingClientRect();
                        const s = window.getComputedStyle(o);
                        return (
                           r.width > 0 &&
                           r.height > 0 &&
                           s.visibility !== "hidden" &&
                           s.display !== "none"
                        );
                     });
                  },
                  { timeout: 2000 },
                  overlaySelectors,
               );
               confirmed = true;
            } catch (e) {
               // overlay still present
            }
         }

         if (confirmed) {
            console.log(
               `          > [INFO] selectDropdownItemByName: selected '${nama}'`,
            );
            return;
         }

         console.log(
            `          > [DEBUG] selectDropdownItemByName: clicked but not confirmed (attempt ${attempt})`,
         );
         await new Promise((r) => setTimeout(r, 200));
         continue;
      } catch (err) {
         console.log(
            `          > [DEBUG] selectDropdownItemByName: click handling error: ${err.message}`,
         );
         await new Promise((r) => setTimeout(r, 200));
         continue;
      }
   }

   throw new Error(
      `Item droplist dengan nama '${nama}' tidak ditemukan setelah ${attempts} percobaan`,
   );
}

module.exports = selectDropdownItemByName;
