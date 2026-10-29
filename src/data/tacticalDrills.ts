import { AnimationFrame } from "../types";

export interface TacticalDrill {
  id: string;
  title: { id: string; en: string };
  description: { id: string; en: string };
  category: "pressing" | "attack" | "defense";
  icon: string;
  sportMode: "soccer" | "minisoccer" | "futsal";
  frames: AnimationFrame[];
}

export const TACTICAL_DRILLS_DATA: TacticalDrill[] = [
  {
    id: "pressing-trap",
    title: {
      id: "Jebakan Pressing Tengah",
      en: "Midfield Pressing Trap"
    },
    description: {
      id: "Taktik menjepit penguasaan bola lawan di sayap tengah untuk melakukan transisi menyerang cepat.",
      en: "Isolate the opponent ball carrier on the wing to trigger a high-pace counter-attack opportunity."
    },
    category: "pressing",
    icon: "🪤",
    sportMode: "soccer",
    frames: [
      {
        id: "drill-press-f1",
        name: "Fasa 1: Setelan Perangkap",
        instruction: "Biarkan lawan mengalirkan bola ke area sayap kiri. Tutup celah tengah untuk menjebak mereka.",
        players: [
          { id: "p1", x: 50, y: 86 },
          { id: "p5", x: 25, y: 65 },
          { id: "p2", x: 40, y: 67 },
          { id: "p3", x: 60, y: 67 },
          { id: "p4", x: 75, y: 65 },
          { id: "p6", x: 50, y: 52 },
          { id: "p7", x: 35, y: 45 },
          { id: "p8", x: 65, y: 47 },
          { id: "p10", x: 22, y: 30 },
          { id: "p9", x: 50, y: 28 },
          { id: "p11", x: 78, y: 30 }
        ],
        items: [
          { id: "item-default-ball", x: 26, y: 41 }
        ]
      },
      {
        id: "drill-press-f2",
        name: "Fasa 2: Jepitan Sayap",
        instruction: "Winger kiri (p10) dan gelandang kiri (p7) bergerak serentak mengurung ruang gerak bola lawan.",
        players: [
          { id: "p1", x: 50, y: 86 },
          { id: "p5", x: 24, y: 55 },
          { id: "p2", x: 40, y: 65 },
          { id: "p3", x: 60, y: 67 },
          { id: "p4", x: 75, y: 65 },
          { id: "p6", x: 44, y: 48 },
          { id: "p7", x: 26, y: 43 },
          { id: "p8", x: 63, y: 47 },
          { id: "p10", x: 28, y: 39 },
          { id: "p9", x: 44, y: 34 },
          { id: "p11", x: 76, y: 31 }
        ],
        items: [
          { id: "item-default-ball", x: 27, y: 40 }
        ]
      },
      {
        id: "drill-press-f3",
        name: "Fasa 3: Intersepsi & Serbu",
        instruction: "Bola berhasil direbut! Berikan umpan vertikal instan kepada Striker (p9) yang berlari ke ruang kosong.",
        players: [
          { id: "p1", x: 50, y: 86 },
          { id: "p5", x: 26, y: 52 },
          { id: "p2", x: 41, y: 62 },
          { id: "p3", x: 58, y: 65 },
          { id: "p4", x: 73, y: 64 },
          { id: "p6", x: 46, y: 41 },
          { id: "p7", x: 29, y: 37 },
          { id: "p8", x: 58, y: 33 },
          { id: "p10", x: 34, y: 28 },
          { id: "p9", x: 48, y: 18 },
          { id: "p11", x: 78, y: 22 }
        ],
        items: [
          { id: "item-default-ball", x: 48, y: 18 }
        ]
      }
    ]
  },
  {
    id: "counter-attack",
    title: {
      id: "Transisi Serang Cepat",
      en: "Rapid Counter-Attack"
    },
    description: {
      id: "Blok kompak zona rendah, merebut bola di area penalti, lalu meluncurkan umpan diagonal membongkar pertahanan lawan.",
      en: "Secure low defensive block, recover position, and immediately spray diagonal passes to sprinting wingers."
    },
    category: "attack",
    icon: "⚡",
    sportMode: "soccer",
    frames: [
      {
        id: "drill-counter-f1",
        name: "Fasa 1: Blok Pertahanan Rendah",
        instruction: "Pemain bertahan mundur merapatkan barisan. Lawan membawa bola mendekati garis penalti.",
        players: [
          { id: "p1", x: 50, y: 88 },
          { id: "p5", x: 20, y: 76 },
          { id: "p2", x: 38, y: 79 },
          { id: "p3", x: 62, y: 79 },
          { id: "p4", x: 80, y: 76 },
          { id: "p6", x: 50, y: 68 },
          { id: "p7", x: 34, y: 64 },
          { id: "p8", x: 66, y: 64 },
          { id: "p9", x: 50, y: 45 },
          { id: "p10", x: 25, y: 48 },
          { id: "p11", x: 75, y: 48 }
        ],
        items: [
          { id: "item-default-ball", x: 50, y: 61 }
        ]
      },
      {
        id: "drill-counter-f2",
        name: "Fasa 2: Rebut & Umpan Keluar",
        instruction: "Gelandang tengah (p6) memotong bola. Bek sayap kiri dan kanan langsung menusuk maju meluaskan ruang permainan.",
        players: [
          { id: "p1", x: 50, y: 88 },
          { id: "p5", x: 16, y: 62 },
          { id: "p2", x: 38, y: 78 },
          { id: "p3", x: 62, y: 78 },
          { id: "p4", x: 84, y: 62 },
          { id: "p6", x: 50, y: 68 },
          { id: "p7", x: 32, y: 55 },
          { id: "p8", x: 68, y: 55 },
          { id: "p9", x: 48, y: 30 },
          { id: "p10", x: 15, y: 38 },
          { id: "p11", x: 85, y: 38 }
        ],
        items: [
          { id: "item-default-ball", x: 50, y: 68 }
        ]
      },
      {
        id: "drill-counter-f3",
        name: "Fasa 3: Lepas Umpan Lapangan",
        instruction: "Gelandang p6 melepaskan umpan lambung melintang ke sayap kanan p11 yang bebas. Striker p9 menusuk ke dalam kotak penalti.",
        players: [
          { id: "p1", x: 50, y: 88 },
          { id: "p5", x: 20, y: 50 },
          { id: "p2", x: 40, y: 74 },
          { id: "p3", x: 60, y: 74 },
          { id: "p4", x: 82, y: 48 },
          { id: "p6", x: 50, y: 64 },
          { id: "p7", x: 35, y: 42 },
          { id: "p8", x: 65, y: 42 },
          { id: "p9", x: 52, y: 15 },
          { id: "p10", x: 22, y: 18 },
          { id: "p11", x: 84, y: 20 }
        ],
        items: [
          { id: "item-default-ball", x: 84, y: 20 }
        ]
      }
    ]
  },
  {
    id: "defensive-transition",
    title: {
      id: "Transisi Bertahan Cepat",
      en: "Defensive Transition"
    },
    description: {
      id: "Kehilangan bola di lini depan, langsung lakukan Gegenpressing demi menahan laju serangan balik lawan.",
      en: "Loss of ball deep in opponent block. Execute immediate counter-pressing to retard opponent forward lanes."
    },
    category: "defense",
    icon: "🛡️",
    sportMode: "soccer",
    frames: [
      {
        id: "drill-def-f1",
        name: "Fasa 1: Kehilangan Penguasaan",
        instruction: "Pemain menyerang kita kehilangan bola di tepian daerah penalti lawan. Lawan mulai bersiap mengalirkan bola.",
        players: [
          { id: "p1", x: 50, y: 78 },
          { id: "p5", x: 30, y: 48 },
          { id: "p2", x: 45, y: 52 },
          { id: "p3", x: 58, y: 52 },
          { id: "p4", x: 70, y: 48 },
          { id: "p6", x: 50, y: 38 },
          { id: "p7", x: 38, y: 32 },
          { id: "p8", x: 64, y: 34 },
          { id: "p9", x: 52, y: 16 },
          { id: "p10", x: 26, y: 20 },
          { id: "p11", x: 74, y: 18 }
        ],
        items: [
          { id: "item-default-ball", x: 55, y: 14 }
        ]
      },
      {
        id: "drill-def-f2",
        name: "Fasa 2: Pembatasan Cepat",
        instruction: "Pemain paling dekat (p9 dan p11) memberikan pressing instan. Gelandang dan bek sayap berlari turun mengamankan wilayah.",
        players: [
          { id: "p1", x: 50, y: 84 },
          { id: "p5", x: 28, y: 58 },
          { id: "p2", x: 45, y: 64 },
          { id: "p3", x: 55, y: 64 },
          { id: "p4", x: 72, y: 58 },
          { id: "p6", x: 50, y: 45 },
          { id: "p7", x: 41, y: 38 },
          { id: "p8", x: 60, y: 40 },
          { id: "p9", x: 53, y: 15 },
          { id: "p10", x: 32, y: 28 },
          { id: "p11", x: 60, y: 16 }
        ],
        items: [
          { id: "item-default-ball", x: 54, y: 15 }
        ]
      },
      {
        id: "drill-def-f3",
        name: "Fasa 3: Formasi Bertahan Kokoh",
        instruction: "Lawan dipaksa melakukan umpan jauh tidak efektif yang langsung dibersihkan oleh bek tengah p3. Blok bertahan kembali aman.",
        players: [
          { id: "p1", x: 50, y: 88 },
          { id: "p5", x: 18, y: 72 },
          { id: "p2", x: 38, y: 74 },
          { id: "p3", x: 62, y: 74 },
          { id: "p4", x: 82, y: 72 },
          { id: "p7", x: 32, y: 54 },
          { id: "p6", x: 50, y: 56 },
          { id: "p8", x: 68, y: 54 },
          { id: "p9", x: 50, y: 35 },
          { id: "p10", x: 24, y: 38 },
          { id: "p11", x: 76, y: 38 }
        ],
        items: [
          { id: "item-default-ball", x: 62, y: 74 }
        ]
      }
    ]
  },
  {
    id: "corner-inswing-near",
    title: {
      id: "Corner Kick: In-Swinger Tiang Dekat",
      en: "Corner Kick: Near-Post In-Swinger"
    },
    description: {
      id: "Simulasi tendangan sudut melengkung ke tiang dekat dengan skema flick-on menuju penyerang di tiang jauh.",
      en: "Whipped corner kick delivery to the near post for a glancing flick-on toward the back post runner."
    },
    category: "attack",
    icon: "🚩",
    sportMode: "soccer",
    frames: [
      {
        id: "drill-ck-near-f1",
        name: "Fasa 1: Persiapan Sudut Kiri",
        instruction: "Eksekutor (#10) bersiap di sudut kiri. Penyerang berkumpul di titik penalti dan mengunci kiper lawan.",
        duration: 1.8,
        players: [
          { id: "p1", x: 50, y: 82 },
          { id: "p10", x: 3.5, y: 3.5 },
          { id: "p11", x: 46, y: 6.2 },
          { id: "p9", x: 42, y: 14.5 },
          { id: "p2", x: 50, y: 15.5 },
          { id: "p3", x: 58, y: 15.5 },
          { id: "p7", x: 35, y: 18 },
          { id: "p8", x: 48, y: 23.5 },
          { id: "p6", x: 32, y: 28 },
          { id: "p4", x: 42, y: 42 },
          { id: "p5", x: 58, y: 44 }
        ],
        items: [
          { id: "item-default-ball", x: 3.8, y: 3.8 }
        ]
      },
      {
        id: "drill-ck-near-f2",
        name: "Fasa 2: Umpan Melengkung & Flick",
        instruction: "Bola dikirim melengkung ke tiang dekat. Striker (#9) menyambar bola untuk diteruskan ke tiang jauh (#3).",
        duration: 2.0,
        players: [
          { id: "p1", x: 50, y: 82 },
          { id: "p10", x: 6, y: 5.5 },
          { id: "p11", x: 48, y: 5.2 },
          { id: "p9", x: 40.5, y: 7.5 },
          { id: "p2", x: 49, y: 8.5 },
          { id: "p3", x: 57, y: 7.5 },
          { id: "p7", x: 34, y: 12 },
          { id: "p8", x: 49, y: 21 },
          { id: "p6", x: 32, y: 26 },
          { id: "p4", x: 42, y: 42 },
          { id: "p5", x: 58, y: 44 }
        ],
        items: [
          { id: "item-default-ball", x: 40.5, y: 7.5 }
        ]
      },
      {
        id: "drill-ck-near-f3",
        name: "Fasa 3: Penyelesaian Tiang Jauh",
        instruction: "Bek tengah (#3) menyundul bola hasil flick-on masuk ke sudut kanan gawang!",
        duration: 1.8,
        players: [
          { id: "p1", x: 50, y: 82 },
          { id: "p10", x: 8, y: 7 },
          { id: "p11", x: 48, y: 5.0 },
          { id: "p9", x: 42, y: 6.5 },
          { id: "p2", x: 49, y: 6.0 },
          { id: "p3", x: 55, y: 5.0 },
          { id: "p7", x: 36, y: 10 },
          { id: "p8", x: 49, y: 19 },
          { id: "p6", x: 34, y: 25 },
          { id: "p4", x: 42, y: 42 },
          { id: "p5", x: 58, y: 44 }
        ],
        items: [
          { id: "item-default-ball", x: 53, y: 2.5 }
        ]
      }
    ]
  },
  {
    id: "corner-short-overload",
    title: {
      id: "Corner Kick: Short 2v1 & Cutback",
      en: "Corner Kick: Short 2v1 & Cutback"
    },
    description: {
      id: "Kombinasi corner pendek 2 lawan 1 di sudut kanan untuk menarik bek lawan keluar dan mengirim umpan tarik ke Zone 14.",
      en: "Short 2v1 corner routine on the right side to draw defenders out and deliver a low cutback."
    },
    category: "attack",
    icon: "📐",
    sportMode: "soccer",
    frames: [
      {
        id: "drill-ck-short-f1",
        name: "Fasa 1: Pancingan Corner Pendek",
        instruction: "Winger (#11) mendekat ke sudut kanan untuk membuka opsi umpan pendek dari eksekutor (#10).",
        duration: 1.8,
        players: [
          { id: "p1", x: 50, y: 82 },
          { id: "p10", x: 96.5, y: 3.5 },
          { id: "p11", x: 88, y: 8.5 },
          { id: "p6", x: 82, y: 18 },
          { id: "p9", x: 55, y: 10 },
          { id: "p2", x: 48, y: 10 },
          { id: "p3", x: 42, y: 11 },
          { id: "p7", x: 58, y: 16 },
          { id: "p8", x: 50, y: 21.5 },
          { id: "p4", x: 58, y: 42 },
          { id: "p5", x: 42, y: 44 }
        ],
        items: [
          { id: "item-default-ball", x: 96.2, y: 3.8 }
        ]
      },
      {
        id: "drill-ck-short-f2",
        name: "Fasa 2: Segitiga Half-Space",
        instruction: "Bola diumpan pendek ke #11 lalu diteruskan ke #6 yang menusuk ke tepi kotak penalti kanan.",
        duration: 2.0,
        players: [
          { id: "p1", x: 50, y: 82 },
          { id: "p10", x: 91, y: 13 },
          { id: "p11", x: 86, y: 7.5 },
          { id: "p6", x: 78, y: 14 },
          { id: "p9", x: 55, y: 8 },
          { id: "p2", x: 48, y: 8 },
          { id: "p3", x: 43, y: 8.5 },
          { id: "p7", x: 54, y: 13.5 },
          { id: "p8", x: 50, y: 18.5 },
          { id: "p4", x: 58, y: 42 },
          { id: "p5", x: 42, y: 44 }
        ],
        items: [
          { id: "item-default-ball", x: 78, y: 14 }
        ]
      },
      {
        id: "drill-ck-short-f3",
        name: "Fasa 3: Umpan Cutback & Tembakan",
        instruction: "#6 melepaskan umpan tarik mendatar ke titik penalti yang langsung disambar oleh gelandang (#7) menjadi gol!",
        duration: 1.8,
        players: [
          { id: "p1", x: 50, y: 82 },
          { id: "p10", x: 88, y: 11 },
          { id: "p11", x: 82, y: 8 },
          { id: "p6", x: 76, y: 12 },
          { id: "p9", x: 54, y: 6.5 },
          { id: "p2", x: 48, y: 6.5 },
          { id: "p3", x: 43, y: 7 },
          { id: "p7", x: 53, y: 11.5 },
          { id: "p8", x: 50, y: 16.5 },
          { id: "p4", x: 58, y: 42 },
          { id: "p5", x: 42, y: 44 }
        ],
        items: [
          { id: "item-default-ball", x: 49, y: 2.5 }
        ]
      }
    ]
  }
];
