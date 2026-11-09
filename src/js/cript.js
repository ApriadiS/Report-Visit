const {
   Document,
   Packer,
   Paragraph,
   TextRun,
   AlignmentType,
   BorderStyle,
   ShadingType,
   WidthType,
   Table,
   TableRow,
   TableCell,
   LevelFormat,
   PageBreak,
} = require("docx");
const fs = require("fs");

// ── Palette ──────────────────────────────────────────────
const DARK_NAVY = "1B2A3F";
const MID_BLUE = "2E6DA4";
const LIGHT_BLUE = "D6E8F7";
const GOLD = "C8962E";
const LIGHT_GOLD = "FFF8EC";
const DARK_GRAY = "2B2B2B";
const MED_GRAY = "666666";
const LIGHT_GRAY = "F5F5F5";
const WHITE = "FFFFFF";
const DEEP_DARK = "0F1923";
const TEAL = "1A6B5A";
const LIGHT_TEAL = "E0F5F0";

// ── Helpers ───────────────────────────────────────────────

function spacer(before = 80) {
   return new Paragraph({
      children: [new TextRun("")],
      spacing: { before, after: 0 },
   });
}

function divider(color = "DDDDDD") {
   return new Paragraph({
      children: [new TextRun("")],
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color } },
      spacing: { before: 120, after: 120 },
   });
}

/** Full-width section header bar */
function sectionBar(emoji, title, subtitle, fill = DARK_NAVY) {
   const rows = [
      new Paragraph({
         children: [
            new TextRun({
               text: emoji + "  " + title,
               bold: true,
               size: 30,
               color: WHITE,
               font: "Arial",
            }),
         ],
         spacing: { before: 0, after: subtitle ? 60 : 0 },
      }),
   ];
   if (subtitle) {
      rows.push(
         new Paragraph({
            children: [
               new TextRun({
                  text: subtitle,
                  size: 20,
                  color: "BBCCDD",
                  font: "Arial",
                  italics: true,
               }),
            ],
            spacing: { before: 0, after: 0 },
         }),
      );
   }
   return new Table({
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [9200],
      rows: [
         new TableRow({
            children: [
               new TableCell({
                  width: { size: 9200, type: WidthType.DXA },
                  shading: { fill, type: ShadingType.CLEAR },
                  margins: { top: 140, bottom: 140, left: 240, right: 240 },
                  borders: {
                     top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                     bottom: {
                        style: BorderStyle.NONE,
                        size: 0,
                        color: "auto",
                     },
                     left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                     right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  },
                  children: rows,
               }),
            ],
         }),
      ],
   });
}

/** Slide reference pill */
function slideTag(slideNum) {
   return new Table({
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [9200],
      rows: [
         new TableRow({
            children: [
               new TableCell({
                  width: { size: 9200, type: WidthType.DXA },
                  shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
                  margins: { top: 60, bottom: 60, left: 180, right: 180 },
                  borders: {
                     top: {
                        style: BorderStyle.SINGLE,
                        size: 3,
                        color: MID_BLUE,
                     },
                     bottom: {
                        style: BorderStyle.SINGLE,
                        size: 3,
                        color: MID_BLUE,
                     },
                     left: {
                        style: BorderStyle.THICK,
                        size: 18,
                        color: MID_BLUE,
                     },
                     right: {
                        style: BorderStyle.SINGLE,
                        size: 3,
                        color: MID_BLUE,
                     },
                  },
                  children: [
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: "🖥  SLIDE " + slideNum + " — ",
                              bold: true,
                              size: 18,
                              color: MID_BLUE,
                              font: "Arial",
                           }),
                           new TextRun({
                              text: "klik ke slide berikutnya setelah bagian ini selesai",
                              size: 18,
                              color: MID_BLUE,
                              font: "Arial",
                              italics: true,
                           }),
                        ],
                     }),
                  ],
               }),
            ],
         }),
      ],
   });
}

/** Gold instruction / facilitator note box */
function noteBox(headerText, lines) {
   const children = [
      new Paragraph({
         children: [
            new TextRun({
               text: "📋  " + headerText,
               bold: true,
               size: 20,
               color: GOLD,
               font: "Arial",
            }),
         ],
         spacing: { before: 0, after: 80 },
      }),
      ...lines.map(
         (l) =>
            new Paragraph({
               children: [
                  new TextRun({
                     text: l,
                     size: 20,
                     font: "Arial",
                     color: DARK_GRAY,
                  }),
               ],
               numbering: { reference: "bullets", level: 0 },
               spacing: { before: 40, after: 40 },
            }),
      ),
   ];
   return new Table({
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [9200],
      rows: [
         new TableRow({
            children: [
               new TableCell({
                  width: { size: 9200, type: WidthType.DXA },
                  shading: { fill: LIGHT_GOLD, type: ShadingType.CLEAR },
                  margins: { top: 120, bottom: 120, left: 200, right: 200 },
                  borders: {
                     top: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                     bottom: {
                        style: BorderStyle.SINGLE,
                        size: 6,
                        color: GOLD,
                     },
                     left: { style: BorderStyle.THICK, size: 18, color: GOLD },
                     right: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                  },
                  children,
               }),
            ],
         }),
      ],
   });
}

/** Teal correction/highlight box */
function correctionBox(label, lines) {
   const children = [
      new Paragraph({
         children: [
            new TextRun({
               text: label,
               bold: true,
               size: 20,
               color: TEAL,
               font: "Arial",
            }),
         ],
         spacing: { before: 0, after: 80 },
      }),
      ...lines.map(
         (l) =>
            new Paragraph({
               children: [
                  new TextRun({
                     text: l,
                     size: 20,
                     font: "Arial",
                     color: DARK_GRAY,
                  }),
               ],
               numbering: { reference: "bullets", level: 0 },
               spacing: { before: 40, after: 40 },
            }),
      ),
   ];
   return new Table({
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [9200],
      rows: [
         new TableRow({
            children: [
               new TableCell({
                  width: { size: 9200, type: WidthType.DXA },
                  shading: { fill: LIGHT_TEAL, type: ShadingType.CLEAR },
                  margins: { top: 120, bottom: 120, left: 200, right: 200 },
                  borders: {
                     top: { style: BorderStyle.SINGLE, size: 6, color: TEAL },
                     bottom: {
                        style: BorderStyle.SINGLE,
                        size: 6,
                        color: TEAL,
                     },
                     left: { style: BorderStyle.THICK, size: 18, color: TEAL },
                     right: { style: BorderStyle.SINGLE, size: 6, color: TEAL },
                  },
                  children,
               }),
            ],
         }),
      ],
   });
}

/** Main spoken script paragraph */
function spoken(text) {
   return new Paragraph({
      children: [
         new TextRun({ text, size: 23, font: "Georgia", color: DARK_GRAY }),
      ],
      spacing: { before: 80, after: 80 },
      indent: { left: 320, right: 200 },
      shading: { fill: "FAFCFF", type: ShadingType.CLEAR },
   });
}

/** Script inside hypno session — slightly different shade */
function hypnoSpoken(text) {
   return new Paragraph({
      children: [
         new TextRun({ text, size: 23, font: "Georgia", color: "1A1A2E" }),
      ],
      spacing: { before: 80, after: 80 },
      indent: { left: 320, right: 200 },
      shading: { fill: "F0F4FF", type: ShadingType.CLEAR },
   });
}

/** Countdown / numbered script line */
function countLine(text) {
   return new Paragraph({
      children: [
         new TextRun({
            text,
            size: 23,
            font: "Georgia",
            color: "1A1A2E",
            bold: text.startsWith("1...") || text.startsWith("5..."),
         }),
      ],
      spacing: { before: 60, after: 60 },
      indent: { left: 480, right: 200 },
      shading: { fill: "ECEFFE", type: ShadingType.CLEAR },
   });
}

/** Pause marker */
function jedaTag(text) {
   return new Paragraph({
      children: [
         new TextRun({
            text: "[ " + text + " ]",
            bold: true,
            size: 20,
            color: GOLD,
            font: "Arial",
         }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
   });
}

/** Sub-label inside a section */
function subLabel(text) {
   return new Paragraph({
      children: [
         new TextRun({
            text,
            bold: true,
            size: 20,
            color: MID_BLUE,
            font: "Arial",
            italics: true,
         }),
      ],
      spacing: { before: 180, after: 60 },
      border: {
         bottom: { style: BorderStyle.SINGLE, size: 3, color: LIGHT_BLUE },
      },
   });
}

/** Bold emphasis quote */
function bigQuote(text) {
   return new Paragraph({
      children: [
         new TextRun({
            text: "\u201C" + text + "\u201D",
            bold: true,
            size: 26,
            color: DARK_NAVY,
            font: "Georgia",
            italics: true,
         }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      shading: { fill: LIGHT_GOLD, type: ShadingType.CLEAR },
      indent: { left: 320, right: 320 },
   });
}

// ── PAGE BREAK ────────────────────────────────────────────
function pageBreak() {
   return new Paragraph({ children: [new PageBreak()] });
}

// ═══════════════════════════════════════════════════════════
//  DOCUMENT
// ═══════════════════════════════════════════════════════════
const doc = new Document({
   numbering: {
      config: [
         {
            reference: "bullets",
            levels: [
               {
                  level: 0,
                  format: LevelFormat.BULLET,
                  text: "•",
                  alignment: AlignmentType.LEFT,
                  style: { paragraph: { indent: { left: 540, hanging: 360 } } },
               },
            ],
         },
      ],
   },
   styles: {
      default: {
         document: { run: { font: "Arial", size: 22, color: DARK_GRAY } },
      },
   },
   sections: [
      {
         properties: {
            page: {
               size: { width: 11906, height: 16838 },
               margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
            },
         },
         children: [
            // ══ COVER ══════════════════════════════════════════
            spacer(400),
            new Paragraph({
               children: [
                  new TextRun({
                     text: "SKRIP LENGKAP MONTHLY MEETING",
                     bold: true,
                     size: 48,
                     color: DARK_NAVY,
                     font: "Arial",
                  }),
               ],
               alignment: AlignmentType.CENTER,
               spacing: { before: 0, after: 80 },
            }),
            new Paragraph({
               children: [
                  new TextRun({
                     text: "Refresh & Recharge — Tim Banjarbaru",
                     size: 34,
                     color: MID_BLUE,
                     font: "Arial",
                  }),
               ],
               alignment: AlignmentType.CENTER,
               spacing: { before: 0, after: 60 },
            }),
            new Paragraph({
               children: [
                  new TextRun({
                     text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                     size: 24,
                     color: GOLD,
                     font: "Arial",
                  }),
               ],
               alignment: AlignmentType.CENTER,
               spacing: { before: 0, after: 60 },
            }),
            new Paragraph({
               children: [
                  new TextRun({
                     text: "Juni 2026  •  SMDO Area Banjarbaru  •  Akulaku Indonesia",
                     size: 22,
                     color: MED_GRAY,
                     font: "Arial",
                  }),
               ],
               alignment: AlignmentType.CENTER,
               spacing: { before: 0, after: 400 },
            }),

            // Info table
            new Table({
               width: { size: 9200, type: WidthType.DXA },
               columnWidths: [2400, 6800],
               rows: [
                  ["🎯 Tema", "Apresiasi Diri & Pengelolaan Stres Pasca-Mei"],
                  [
                     "⏳ Total Durasi",
                     "±2 Jam (termasuk makan siang & sesi foto)",
                  ],
                  ["👤 Fasilitator", "SMDO Area Banjarbaru"],
                  [
                     "📍 Konteks",
                     "Capaian 112.2% — All Time High di tengah gangguan sistem Akulaku",
                  ],
                  [
                     "🎤 Peralatan",
                     "Mic / pengeras suara — gunakan nada bass, lambat, berwibawa",
                  ],
               ].map(
                  ([label, val]) =>
                     new TableRow({
                        children: [
                           new TableCell({
                              width: { size: 2400, type: WidthType.DXA },
                              shading: {
                                 fill: DARK_NAVY,
                                 type: ShadingType.CLEAR,
                              },
                              margins: {
                                 top: 80,
                                 bottom: 80,
                                 left: 120,
                                 right: 120,
                              },
                              borders: {
                                 top: {
                                    style: BorderStyle.SINGLE,
                                    size: 1,
                                    color: "444444",
                                 },
                                 bottom: {
                                    style: BorderStyle.SINGLE,
                                    size: 1,
                                    color: "444444",
                                 },
                                 left: {
                                    style: BorderStyle.SINGLE,
                                    size: 1,
                                    color: "444444",
                                 },
                                 right: {
                                    style: BorderStyle.SINGLE,
                                    size: 1,
                                    color: "444444",
                                 },
                              },
                              children: [
                                 new Paragraph({
                                    children: [
                                       new TextRun({
                                          text: label,
                                          bold: true,
                                          size: 19,
                                          color: WHITE,
                                          font: "Arial",
                                       }),
                                    ],
                                 }),
                              ],
                           }),
                           new TableCell({
                              width: { size: 6800, type: WidthType.DXA },
                              shading: {
                                 fill: LIGHT_GRAY,
                                 type: ShadingType.CLEAR,
                              },
                              margins: {
                                 top: 80,
                                 bottom: 80,
                                 left: 120,
                                 right: 120,
                              },
                              borders: {
                                 top: {
                                    style: BorderStyle.SINGLE,
                                    size: 1,
                                    color: "CCCCCC",
                                 },
                                 bottom: {
                                    style: BorderStyle.SINGLE,
                                    size: 1,
                                    color: "CCCCCC",
                                 },
                                 left: {
                                    style: BorderStyle.SINGLE,
                                    size: 1,
                                    color: "CCCCCC",
                                 },
                                 right: {
                                    style: BorderStyle.SINGLE,
                                    size: 1,
                                    color: "CCCCCC",
                                 },
                              },
                              children: [
                                 new Paragraph({
                                    children: [
                                       new TextRun({
                                          text: val,
                                          size: 19,
                                          color: DARK_GRAY,
                                          font: "Arial",
                                       }),
                                    ],
                                 }),
                              ],
                           }),
                        ],
                     }),
               ),
            }),
            spacer(200),

            // Legend
            new Paragraph({
               children: [
                  new TextRun({
                     text: "PANDUAN MEMBACA SKRIP INI",
                     bold: true,
                     size: 20,
                     color: DARK_NAVY,
                     font: "Arial",
                  }),
               ],
               spacing: { before: 120, after: 80 },
            }),
            new Table({
               width: { size: 9200, type: WidthType.DXA },
               columnWidths: [1400, 3700, 1400, 2700],
               rows: [
                  new TableRow({
                     children: [
                        ...[
                           [
                              LIGHT_GOLD,
                              GOLD,
                              "Kotak Emas",
                              "Panduan/instruksi fasilitator",
                           ],
                           [
                              LIGHT_BLUE,
                              MID_BLUE,
                              "Kotak Biru",
                              "Tanda klik slide berikutnya",
                           ],
                        ].map(
                           ([fill, color, label, desc]) =>
                              new TableCell({
                                 shading: { fill, type: ShadingType.CLEAR },
                                 margins: {
                                    top: 80,
                                    bottom: 80,
                                    left: 120,
                                    right: 120,
                                 },
                                 borders: {
                                    top: {
                                       style: BorderStyle.SINGLE,
                                       size: 1,
                                       color,
                                    },
                                    bottom: {
                                       style: BorderStyle.SINGLE,
                                       size: 1,
                                       color,
                                    },
                                    left: {
                                       style: BorderStyle.THICK,
                                       size: 12,
                                       color,
                                    },
                                    right: {
                                       style: BorderStyle.SINGLE,
                                       size: 1,
                                       color,
                                    },
                                 },
                                 children: [
                                    new Paragraph({
                                       children: [
                                          new TextRun({
                                             text: label,
                                             bold: true,
                                             size: 18,
                                             color,
                                             font: "Arial",
                                          }),
                                       ],
                                    }),
                                    new Paragraph({
                                       children: [
                                          new TextRun({
                                             text: desc,
                                             size: 18,
                                             color: DARK_GRAY,
                                             font: "Arial",
                                          }),
                                       ],
                                    }),
                                 ],
                              }),
                        ),
                     ],
                  }),
                  new TableRow({
                     children: [
                        ...[
                           [
                              "ECEFFE",
                              "1A1A2E",
                              "Background Abu Biru",
                              "Teks skrip sesi hipnoterapi",
                           ],
                           [
                              "FAFCFF",
                              DARK_GRAY,
                              "Background Putih",
                              "Teks skrip bicara biasa",
                           ],
                        ].map(
                           ([fill, color, label, desc]) =>
                              new TableCell({
                                 shading: { fill, type: ShadingType.CLEAR },
                                 margins: {
                                    top: 80,
                                    bottom: 80,
                                    left: 120,
                                    right: 120,
                                 },
                                 borders: {
                                    top: {
                                       style: BorderStyle.SINGLE,
                                       size: 1,
                                       color: "AAAAAA",
                                    },
                                    bottom: {
                                       style: BorderStyle.SINGLE,
                                       size: 1,
                                       color: "AAAAAA",
                                    },
                                    left: {
                                       style: BorderStyle.THICK,
                                       size: 12,
                                       color: "999999",
                                    },
                                    right: {
                                       style: BorderStyle.SINGLE,
                                       size: 1,
                                       color: "AAAAAA",
                                    },
                                 },
                                 children: [
                                    new Paragraph({
                                       children: [
                                          new TextRun({
                                             text: label,
                                             bold: true,
                                             size: 18,
                                             color,
                                             font: "Arial",
                                          }),
                                       ],
                                    }),
                                    new Paragraph({
                                       children: [
                                          new TextRun({
                                             text: desc,
                                             size: 18,
                                             color: DARK_GRAY,
                                             font: "Arial",
                                          }),
                                       ],
                                    }),
                                 ],
                              }),
                        ),
                     ],
                  }),
               ],
            }),

            pageBreak(),

            // ══ BAGIAN 1: PEMBUKAAN ════════════════════════════
            sectionBar(
               "👋",
               "BAGIAN 1 — PEMBUKAAN & APRESIASI",
               "Slide 1 → 2  |  ±8 Menit  |  Nada: Hangat, Ramah, Bersemangat",
            ),
            spacer(120),

            noteBox("SEBELUM MULAI", [
               "Pastikan semua sudah duduk, musik latar bisa diputar pelan saat peserta masuk.",
               "Berdiri di depan dengan postur terbuka — jangan duduk.",
               "Slideshow sudah terbuka di Slide 1 (cover: REFRESH & RECHARGE).",
            ]),
            spacer(120),

            subLabel("[ SLIDE 1 — COVER: REFRESH & RECHARGE ]"),
            spoken(
               "Halo teman-teman, akhirnya kita punya acara bareng hari ini.",
            ),
            spoken(
               "Thanks ya sudah datang tepat waktu, sudah mau iklas ngumpul di ruangan ini. Kalian pasti bertanya-tanya, acara apa ini?",
            ),
            spoken(
               "Dari judulnya kalian sudah bisa lihat — Refresh & Recharge. Artinya hari ini aku mau sedikit ngomongin pencapaian kita bersama sebagai Tim Banjarbaru. Dan kita akan lakuin lebih dari sekedar review angka.",
            ),

            spacer(80),
            slideTag(2),
            spacer(60),

            subLabel("[ SLIDE 2 — MONTHLY TARGET: 112.2% ]"),
            spoken(
               "Kalian ingat Mei kemarin? Kita berhasil tutup di angka 1.9M. Angka yang luar biasa. Kita masih di All Time High — belum ada penurunan. April kita tutup di 1.8M, artinya kita naik 100 juta.",
            ),
            spoken(
               "Angka 112.2%... mungkin ada tim lain yang capai di atas 150%. Aku tau itu. Tapi bukan itu yang mau aku bahas hari ini.",
            ),
            spoken(
               "Aku mau berterima kasih sebesar-besarnya untuk tim ini — bukan karena angkanya, tapi karena apa yang ada di balik angka itu. Aku yang turun langsung ke lapangan, aku yang diskusi langsung sama kalian — dan aku tahu persis betapa beratnya bulan Mei untuk kita semua.",
            ),

            spacer(120),

            // ══ BAGIAN 2: VALIDASI PERJUANGAN ═════════════════
            pageBreak(),
            sectionBar(
               "💪",
               "BAGIAN 2 — DI BALIK ANGKA 112.2%",
               "Slide 3 → 4  |  ±7 Menit  |  Nada: Serius, Empatik, Tulus",
            ),
            spacer(120),

            slideTag(3),
            spacer(60),
            subLabel("[ SLIDE 3 — DI BALIK ANGKA 112.2% ]"),
            spoken(
               "Bulan Mei, kita kehilangan lebih dari 300 juta. Bukan karena kalian tidak kerja keras. Tapi karena sistem Akulaku di GSK Central dan GSK Martapura terlambat aktif — dari tanggal 1 sampai tanggal 20 Mei tidak bisa beroperasi.",
            ),
            spoken(
               "Di awal bulan, reject massal terjadi. RO langganan kita tiba-tiba di-acc di kompetitor. Kalian sudah capek-capek followup, sudah siapkan semuanya untuk sambut awal bulan — tapi kalian digempur habis-habisan dengan reject yang bukan salah kalian.",
            ),
            spoken(
               "SA M0 juga merasakan pahitnya approval yang turun. Dan itu berat sekali.",
            ),

            spacer(100),
            subLabel("[ CERITA INDIVIDUAL TIM ]"),
            spoken(
               "Dari Syihab Premium, ada SA kita — Salehudin — yang dari awal bulan cuma punya GMV 2 juta, padahal dia sudah create user atau cek limit lebih dari 15 orang di awal bulan. Bayangkan itu.",
            ),
            spoken(
               "Ada Bula yang stay di QMall, tidak dapat GMV dari areanya karena dikunci kompetitor — tapi dia tidak menyerah, malah dapat GMV dari area lain.",
            ),
            spoken(
               "Di Martapura ada Agus — dia mengusahakan apapun agar bisa dapat GMV, total create user-nya sampai lebih dari 40 orang di akhir bulan.",
            ),
            spoken("Badai pasti berlalu."),

            spacer(100),
            slideTag(4),
            spacer(60),
            subLabel(
               "[ SLIDE 4 — BADAI PASTI BERLALU: REJECT >300JT & RO LARI ]",
            ),
            spoken(
               "Di sini aku mau mengingatkan satu hal. Kita semua berjuang. Kita semua berusaha. Dan kita sebagai tim yang solid akan selalu berdiri kokoh — apapun rintangannya.",
            ),
            spoken(
               "Ada filosofi yang selalu aku pegang dan selalu aku sampaikan ke semua SA:",
            ),

            spacer(80),
            bigQuote(
               "Jika angin bertiup ke selatan dan kamu tertiup olehnya, sementara tujuanmu adalah ke utara — kamu tidak bisa menyalahkan anginnya. Yang bisa kamu lakukan adalah putar layar kapalmu, agar kamu tetap bisa melaju ke utara.",
            ),
            spacer(80),

            spoken(
               "Artinya apa? Cara kalian mengendalikan situasi saat terkena masalah — adalah bagaimana kalian bereaksi atas masalah itu. Saat ada sesuatu yang membuat kalian kecewa, kendalikan reaksinya. Kalian tidak bisa memaksakan hal-hal yang di luar kendali kalian. Kalian hanya bisa membuat rencana terbaik. Tapi hasil akhirnya — itu di tangan yang lebih besar.",
            ),
            spoken(
               "Tim kita pasti akan terus berkembang. Kita akan jadi tim dan keluarga yang saling support, apapun yang terjadi.",
            ),

            spacer(120),

            // ══ BAGIAN 3: MENEMUKAN WHY ════════════════════════
            pageBreak(),
            sectionBar(
               "❤️",
               "BAGIAN 3 — MENEMUKAN WHY",
               "Slide 5  |  ±5 Menit  |  Nada: Dalam, Personal, Emosional",
            ),
            spacer(120),

            slideTag(5),
            spacer(60),
            subLabel("[ SLIDE 5 — MENEMUKAN KEMBALI JANGKAR DIRI / WHY ]"),
            spoken(
               "Dari semua masalah yang kalian hadapi... pasti ada satu hal yang membuat kalian tetap bertahan. Keluarga. Suami. Istri. Anak. Orang tua. Atau cita-cita kalian sendiri.",
            ),
            spoken(
               "Kalian bekerja di Akulaku — pasti ada yang kalian perjuangkan. Tidak ada manusia di muka bumi ini yang menjalani rutinitas tanpa ada yang diperjuangkan. Semua orang punya alasannya.",
            ),
            spoken(
               "Istri, anak, suami, orang tua, keluarga — mereka menunggu di rumah. Bayangkan mereka tahu kalian berjuang untuk mereka. Tidak ada hal yang lebih berharga dari melihat mereka tersenyum dan bangga punya kalian.",
            ),

            spacer(120),

            // ══ BAGIAN 4: TRANSISI KE HIPNOTERAPI ════════════
            pageBreak(),
            sectionBar(
               "🧘",
               "BAGIAN 4 — INTRO SESI DEFRAGMENTASI MENTAL",
               "Slide 6 → 8  |  ±5 Menit  |  Nada: Mulai Melambat, Tenang",
            ),
            spacer(120),

            slideTag(6),
            spacer(60),
            subLabel("[ SLIDE 6 — SESI DEFRAGMENTASI MENTAL ]"),
            spoken(
               "Di acara ini, aku ingin kita merefresh pikiran kalian — mereset batin kalian yang sudah tersiksa di bulan Mei.",
            ),
            spoken(
               "Kita akan lakukan sesi hipnoterapi. Terakhir aku melakukan hal ini waktu aku masih SMP — karena papaku seorang Budha yang punya perpustakaan sendiri di rumah, aku belajar tentang hipnoterapi sejak kecil.",
            ),
            spoken(
               "Apa itu hipnoterapi? Apakah berbahaya? Apakah ini ilmu hitam?",
            ),
            spoken(
               "Hipnosis adalah kegiatan untuk memasukkan sugesti ke dalam alam bawah sadar. Sugesti itu apa? Sugesti adalah instruksi positif yang kita masukkan ke dalam pikiran kita sendiri.",
            ),
            spoken(
               "Pernah nggak kalian berdoa dengan sangat khusyuk sekali? Nah, kita akan merasakan sensasi itu. Karena Tuhan akan selalu mengabulkan keinginan hamba-Nya yang khusyuk memohon kepada-Nya. Jadi secara tidak langsung, hipnoterapi ini juga proses untuk mengubah kebiasaan atau sifat yang sudah tertanam dalam pikiran kalian.",
            ),

            spacer(80),
            slideTag(7),
            spacer(60),
            subLabel("[ SLIDE 7 — PANDUAN MEMULAI RELAKSASI ]"),
            spoken(
               "Sekarang aku minta kalian ikuti aturan ini demi kelancaran sesi. Karena proses masuk ke alam bawah sadar itu panjang — sekali ada distraksi, semuanya bisa berantakan.",
            ),
            spoken(
               "Silakan heningkan ponsel kalian. Atur posisi duduk yang nyaman. Lepaskan kacamata atau hal-hal yang bisa jadi gangguan. Dan yang paling penting — aku perlu kalian berpasrah dan ikuti tuntunan yang akan aku berikan.",
            ),

            spacer(80),
            slideTag(8),
            spacer(60),
            subLabel("[ SLIDE 8 — PEJAMKAN MATA... ]"),

            noteBox("PERSIAPAN MASUK KE SESI — LAKUKAN INI SEBELUM MULAI", [
               "Berdiri atau duduk dengan tenang di depan mic.",
               "Turunkan volume bicara — tidak perlu keras, mic yang bekerja.",
               "Perlambat tempo napasmu sendiri dulu sebelum mulai bicara.",
               "Tunggu sampai ruangan benar-benar hening.",
            ]),
            spacer(100),

            spoken(
               "Sesi ini sepenuhnya hadiah untuk kalian sendiri. Hipnoterapi adalah metode ilmiah untuk menurunkan gelombang otak kalian ke gelombang Alfa hingga Theta — di mana kondisi fisik kalian sangat rileks, namun kalian tetap memegang kendali penuh atas kesadaran kalian.",
            ),
            spoken(
               "Gelombang Alfa dan Theta bukan membuat kalian tidur — justru sebaliknya, kalian akan lebih fokus dan penuh imajinasi. Semakin kalian pasrah dan menikmatinya, semakin bersih pikiran kalian dari stres.",
            ),
            spoken(
               "Sekarang... siap-siap. Letakkan tangan dengan rileks di atas paha. Sandarkan tubuh ke kursi. Dan bila kalian sudah siap...",
            ),

            spacer(60),
            // JEMBATAN — koreksi baru
            correctionBox(
               "✨ JEMBATAN — TRANSISI KE SESI (bagian baru, penting)",
               [
                  "Ini adalah jembatan dari suasana percakapan ke relaksasi mendalam.",
                  "Suarakan dengan sangat pelan, lebih lambat dari segalanya yang sebelumnya.",
                  "Beri ruang hening 2-3 detik setelah kalimat ini sebelum lanjut ke induksi.",
               ],
            ),
            spacer(80),
            spoken("Biarkan kita berhenti sejenak dari semua kata-kata..."),
            spoken("Tarik satu napas perlahan saja dulu... lewat hidung..."),
            spoken("...dan lepaskan pelan-pelan lewat mulut..."),
            spoken(
               "Bagus. Sekarang, ikuti ritme suaraku. Perlahan-lahan... tutup mata kalian... dengan lembut.",
            ),

            spacer(120),

            // ══ BAGIAN 5: SESI HIPNOTERAPI ════════════════════
            pageBreak(),
            sectionBar(
               "🌙",
               "BAGIAN 5 — SESI HIPNOTERAPI",
               "Slide 8 (tetap)  |  ±30 Menit  |  MATA PESERTA TERTUTUP — GUNAKAN MIC",
               DEEP_DARK,
            ),
            spacer(100),

            noteBox("PANDUAN SUARA SELAMA SESI", [
               "Setelah peserta menutup mata — gunakan kata 'kamu' dan 'Anda', bukan 'kalian'.",
               "Feel-nya one-on-one. Bayangkan kamu berbicara langsung ke satu orang di depanmu.",
               "Jeda di setiap titik-titik (...) adalah jeda nyata — hitungan 2-3 detik.",
               "Jangan terburu-buru. Keheningan adalah bagian dari skrip.",
            ]),
            spacer(120),

            subLabel("[ INDUKSI RELAKSASI FISIK ]"),
            hypnoSpoken(
               "Tarik napas yang dalam lewat hidung... hembuskan perlahan lewat mulut... Bagus sekali...",
            ),
            hypnoSpoken(
               "Sekali lagi... tarik napas yang dalam... rasakan udara segar memenuhi dada kamu... dan hembuskan perlahan... bersama dengan semua ketegangan yang kamu rasakan hari ini...",
            ),
            hypnoSpoken(
               "Mulai saat ini, izinkan kelopak mata kamu untuk menjadi sangat santai... sangat rileks... Bayangkan rasa rileks itu seperti air hangat yang mengalir dari atas kepala kamu... perlahan turun merilekskan otot-otot di sekitar dahi... Lepaskan semua kerutan di dahi kamu...",
            ),
            hypnoSpoken(
               "Rasakan otot-otot kecil di sekitar mata kamu menjadi sangat lemas... sangat malas... hingga rasanya kelopak mata kamu terkunci dengan nyaman... malas sekali untuk terbuka. Dan biarkan saja seperti itu...",
            ),
            jedaTag("JEDA 3 DETIK"),
            hypnoSpoken(
               "Kini alirkan rasa rileks itu turun menuju rahang dan leher kamu... Bagi kamu yang lehernya terasa kaku karena berkendara di lapangan — biarkan leher kamu lemas sepenuhnya sekarang... rileks... dan santai...",
            ),
            hypnoSpoken(
               "Biarkan pundak kamu turun... lepaskan beban berat tak terlihat yang selama ini kamu pikul di pundak kiri dan kanan kamu... lepaskan sepenuhnya... Biarkan otot tangan, jari-jemari, hingga kaki kamu menjadi sangat lemas... seperti sehelai kain basah yang jatuh tergeletak dengan santai di atas paha kamu...",
            ),

            spacer(100),
            subLabel("[ DEEPENING — MENYELAM LEBIH DALAM ]"),
            hypnoSpoken(
               "Sekarang, untuk membawa tubuh dan pikiran kamu masuk ke tingkat relaksasi yang jauh lebih dalam... aku akan menghitung mundur dari 10 ke 1. Di setiap hitungan mundur, bayangkan kamu sedang menuruni anak tangga kelembutan... dan di setiap anak tangga yang kamu turuni, buatlah tubuh dan batin kamu menjadi dua kali lipat lebih rileks... lebih damai dari sebelumnya...",
            ),
            spacer(40),
            countLine("10... rasakan tubuh semakin ringan, semakin pasrah..."),
            countLine(
               "9... setiap suara yang kamu dengar di sekitar ruangan ini, selain suara aku, justru membuat kamu masuk semakin dalam menuju kedamaian kamu...",
            ),
            countLine(
               "8... abaikan pikiran-pikiran lain... biarkan pikiran itu lewat seperti awan... dan kembali fokus pada hembusan napas kamu...",
            ),
            countLine(
               "7... semakin dalam... setiap hembusan napas kamu membuat kamu lebih rileks... lebih santai... lebih lemas... dan semakin dalam...",
            ),
            countLine(
               "6... rasakan kenyamanan yang luar biasa mengalir di seluruh batin kamu...",
            ),
            countLine(
               "5... perlahan, seluruh tubuh kamu beristirahat dengan sangat sempurna...",
            ),
            countLine("4..."),
            countLine("3..."),
            countLine("2... dan..."),
            countLine(
               "1... Sekarang, kamu berada di kondisi relaksasi total yang sangat nyaman... sangat aman... dan sangat damai...",
            ),

            spacer(100),
            subLabel("[ SUGESTI INTI — PEMBUKA ]"),
            jedaTag(
               "JEDA 3 DETIK — beri ruang hening penuh sebelum mulai sugesti",
            ),
            hypnoSpoken(
               "Kawan... pikiran bawah sadar kamu saat ini sangat cerdas... sangat bersih... dan siap menerima kebenaran yang akan membuat hidupmu lebih maju dan lebih bahagia...",
            ),

            spacer(80),
            subLabel("[ VALIDASI PERJUANGAN & EKSTERNALISASI MASALAH ]"),
            hypnoSpoken(
               "Bulan Mei kemarin, kamu telah mencapai prestasi yang luar biasa: 112.2%. Itu bukan sekadar angka. Itu adalah bukti nyata siapa diri kamu.",
            ),
            hypnoSpoken(
               "Tapi di balik angka itu, aku tahu betul... kamu lelah. Bulan lalu, kamu menghadapi sesuatu yang bukan kesalahan kamu. Sistem yang bermasalah, pengajuan yang terganjal — bukan karena kurang usaha... tapi karena ada hal yang berada di luar kendali kamu.",
            ),
            hypnoSpoken(
               "Dan meskipun semua itu menghalangi jalanmu... kamu tetap berdiri. Kamu tetap bergerak. Kamu tetap berjuang. Dan kamu menang.",
            ),
            jedaTag("JEDA 3 DETIK"),

            spacer(80),
            subLabel("[ PELEPASAN FRUSTRASI ]"),
            hypnoSpoken(
               "Hari ini... izinkan pikiran bawah sadar kamu untuk melepaskan semua kekecewaan itu. Setiap rasa frustrasi karena sistem yang gagal... itu bukan cerminan nilai dirimu. Itu bukan kegagalanmu.",
            ),
            hypnoSpoken(
               "Dan hari ini... kamu berhak melepaskannya. Bayangkan semua kekecewaan itu perlahan mengabur... memudar... seperti asap yang tertiup angin... pergi... sepenuhnya pergi...",
            ),
            jedaTag("JEDA 4 DETIK — beri ruang untuk melepaskan"),

            spacer(80),
            subLabel("[ ANCHOR KEMENANGAN 112.2% ]"),
            hypnoSpoken(
               "Kini... ingat-ingatlah perasaan saat angka itu tercapai. Di tengah semua rintangan itu... di tengah sistem yang bermasalah dan tekanan yang tidak adil... kamu tidak menyerah. Kamu memilih untuk terus melangkah.",
            ),
            hypnoSpoken(
               "Simpan perasaan itu. Kunci ia erat-erat di dadamu sekarang. Rasakan ia mengalir hangat di seluruh tubuhmu... Karena perasaan itulah — bukan sistem, bukan kondisi luar — tapi KAMU sendiri... itulah senjata terbesarmu.",
            ),
            jedaTag("JEDA 3 DETIK"),

            spacer(80),
            subLabel("[ PROYEKSI KE BULAN JUNI ]"),
            hypnoSpoken(
               "Di bulan Juni ini... kamu hadir sebagai versi yang jauh lebih kuat. Bukan karena kondisinya sempurna. Tapi karena kamu sudah terbukti mampu menang bahkan di kondisi yang tidak sempurna. Mental itu sudah ada di dalam dirimu.",
            ),
            hypnoSpoken(
               "Setiap tantangan baru yang datang di Juni... akan kamu sambut dengan kepala tegak dan senyum yang tulus. Penolakan bukan lagi sebuah kegagalan — melainkan hanya sebuah batu loncatan kecil menuju nasabah berikutnya yang akan menyambut kamu dengan hangat.",
            ),

            spacer(80),
            subLabel("[ JANGKAR JIWA — WHY ]"),
            hypnoSpoken(
               "Sekarang... bayangkanlah wajah orang-orang yang paling kamu sayangi di rumah. Bayangkan wajah ibu kamu... ayah kamu... atau pasangan kamu... atau anak kamu... Atau bayangkan dirimu sendiri beberapa tahun ke depan — versi dirimu yang sudah berhasil.",
            ),
            jedaTag("JEDA 4 DETIK — beri ruang penuh untuk visualisasi"),
            hypnoSpoken(
               "Mereka adalah alasan mengapa kamu bangun setiap hari. Setiap kali kamu menahan lelah di lapangan... setiap kali kamu tersenyum menghadapi nasabah yang sulit... sadarilah... bahwa kamu sedang menenun masa depan yang lebih baik untuk mereka yang kamu sayangi.",
            ),
            hypnoSpoken(
               "Mereka bangga memiliki kamu. Mereka bersyukur atas setiap keringat yang kamu teteskan. Dan lelahmu... adalah kehormatanmu.",
            ),

            spacer(80),
            subLabel("[ TANAMKAN KEYAKINAN BARU ]"),
            hypnoSpoken(
               "Mulai hari ini, kamu bekerja dengan senyum yang tulus. Bukan karena terpaksa oleh angka — tapi karena kamu sadar... kamu adalah pahlawan bagi orang-orang tersayang di rumahmu.",
            ),
            hypnoSpoken(
               "Rasakan motivasi itu mengalir deras di dadamu sekarang... rasakan energi kemenangan kemarin mengunci keyakinan baru di dalam dirimu... bahwa kamu adalah seorang pemenang yang tangguh... mandiri... dan berharga.",
            ),

            spacer(120),
            subLabel("[ TERMINASI — WAKING UP ]"),
            jedaTag(
               "SLIDE 9 — minta operator klik ke slide quote SEBELUM hitungan 5 selesai",
            ),
            spacer(60),
            hypnoSpoken(
               "Bagus sekali... simpan semua perasaan positif ini... simpan keyakinan baru ini erat-erat di dalam dadamu.",
            ),
            hypnoSpoken(
               "Sekarang, aku akan membangunkan kamu dengan hitungan maju dari 1 sampai 5. Di setiap angka naik, rasakan aliran darahmu mengalirkan energi kesegaran baru ke seluruh tubuhmu. Dan pada hitungan kelima nanti, kamu akan membuka mata dengan tubuh yang sangat segar, pikiran yang sangat terang, dan senyuman terbaik yang siap menaklukkan hari ini.",
            ),
            spacer(40),
            countLine(
               "1... rasakan kesadaranmu mulai kembali ke ruangan ini... gerakkan sedikit jari-jari tanganmu...",
            ),
            countLine(
               "2... rasakan energi positif mengalir di punggung, leher, dan wajahmu... kamu merasa jauh lebih sehat dan bertenaga...",
            ),
            countLine(
               "3... tarik napas yang dalam... dan hembuskan perlahan... bawa pulang kebahagiaan batin yang luar biasa ini...",
            ),
            countLine(
               "4... rasakan senyuman pemenang mulai terbentuk di wajahmu... kamu hadir di bulan Juni sebagai versi terkuat dirimu...",
            ),
            countLine(
               "5... buka matamu secara perlahan... regangkan tubuhmu... dan ucapkan syukur di dalam hatimu.",
            ),

            spacer(120),

            // ══ BAGIAN 6: PASCA-HIPNOTERAPI ══════════════════
            pageBreak(),
            sectionBar(
               "☀️",
               "BAGIAN 6 — PASCA-SESI & GROUNDING",
               "Slide 10  |  ±3 Menit  |  Kembali ke nada normal — hangat, ceria",
            ),
            spacer(120),

            correctionBox(
               "✨ GROUNDING SEBELUM BICARA (bagian baru, penting)",
               [
                  "Jangan langsung tanya 'gimana rasanya?' begitu peserta membuka mata.",
                  "Beri waktu 5-7 detik. Otak butuh kembali ke gelombang Beta dulu.",
                  "Sambil menunggu, kamu bisa senyum dan angguk kepala pelan.",
                  "Baru mulai dengan kalimat grounding di bawah ini.",
               ],
            ),
            spacer(100),

            slideTag(10),
            spacer(60),
            subLabel("[ SLIDE 10 — BANGKIT DENGAN ENERGI BARU ]"),
            spoken(
               "Silakan gerakkan tangan dan kaki kalian pelan-pelan... regangkan bahu... ambil satu napas terakhir... dan selamat datang kembali.",
            ),
            spoken(
               "Terimakasih teman-teman. Gimana rasanya? Enak? Rileks? Santai? Ngantuk?",
            ),
            spoken(
               "Tadi kita melakukan hipnoterapi. Saat ini kalian berada di gelombang otak Alfa — kalian fokus, kalian merasakan segarnya seperti bangun di pagi hari setelah tidur yang sangat nyenyak.",
            ),
            spoken(
               "Sekarang aku minta kalian nikmati dulu sensasi santai ini. Silakan minum air mineral bagi yang mau minum dulu.",
            ),
            spoken(
               "Dan ketahuilah — kita sekarang siap untuk fight lagi di bulan Juni. Dengan ketulusan, pantang menyerah, dan hati yang damai. Kalian tau siapa yang kalian perjuangkan!",
            ),

            spacer(120),

            // ══ BAGIAN 7: MAKAN SIANG & CLOSING ══════════════
            sectionBar(
               "🍽️",
               "BAGIAN 7 — MAKAN SIANG, FOTO & PENUTUP",
               "Slide 11 → 12  |  ±30+ Menit",
            ),
            spacer(120),

            slideTag(11),
            spacer(60),
            subLabel("[ SLIDE 11 — MAKAN SIANG & SESI KEBERSAMAAN ]"),
            spoken(
               "Kita mengakhiri sesi hipnoterapi kita. Sekarang waktunya makan siang — ada yang lapar?",
            ),

            noteBox("SELA MAKAN SIANG ±30 MENIT", [
               "Biarkan suasana mengalir natural — tawa, cerita, ngobrol santai.",
               "Ini bagian penting: bonding tim yang terjadi dalam kondisi gelombang Alfa masih berdampak.",
               "Setelah makan siang selesai, kumpulkan semua untuk sesi foto.",
            ]),

            spacer(100),
            slideTag(12),
            spacer(60),
            subLabel("[ SLIDE 12 — TERIMA KASIH! ]"),
            spoken("Boleh kita berfoto dulu semuanya!"),
            spoken(
               "Thank you teman-teman yang sudah mau dengan tulus berkumpul di tempat ini. Ini bukan cuma meeting — ini adalah bukti bahwa kita bukan sekadar rekan kerja. Kita keluarga.",
            ),
            spoken(
               "Pak Resza selaku ASL, ada yang ingin ditambahkan sebelum kita tutup?",
            ),
            spacer(60),
            noteBox("SETELAH ASL BERBICARA", [
               "Tutup dengan kalimat penutup di bawah ini.",
               "Jangan terburu-buru — biarkan momen ini terasa penuh.",
            ]),
            spacer(80),
            spoken(
               "Terimakasih semuanya. Mari kita terus melangkah dengan penuh kesadaran diri, merawat pikiran kita, dan memberikan hasil terbaik — demi kebahagiaan orang-orang yang kita cintai.",
            ),

            spacer(80),
            bigQuote("Bekerja dengan Bahagia, Berkarya untuk Keluarga."),
            spacer(200),

            new Paragraph({
               children: [
                  new TextRun({
                     text: "— Tamat —",
                     bold: true,
                     size: 22,
                     color: MED_GRAY,
                     font: "Arial",
                  }),
               ],
               alignment: AlignmentType.CENTER,
               spacing: { before: 80, after: 80 },
            }),
            new Paragraph({
               children: [
                  new TextRun({
                     text: "Tim Hebat Banjarbaru  •  Akulaku Indonesia  •  Juni 2026",
                     size: 20,
                     color: MED_GRAY,
                     font: "Arial",
                  }),
               ],
               alignment: AlignmentType.CENTER,
               spacing: { before: 40, after: 200 },
            }),
         ],
      },
   ],
});

Packer.toBuffer(doc).then((buf) => {
   // Ensure the output directory exists
   const outputDir = "data/output";
   if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
   }

   fs.writeFileSync(`${outputDir}/Skrip_Monthly_Meeting_Full.docx`, buf);
   console.log(
      "Done! File saved to data/output/Skrip_Monthly_Meeting_Full.docx",
   );
});
