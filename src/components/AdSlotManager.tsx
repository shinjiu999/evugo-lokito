import { useState, useEffect } from "react";
import { Sparkles, ExternalLink, Trophy } from "lucide-react";

export default function AdSlotManager() {
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // Mock advertisements rotation list (Football theme)
  const mockAds = [
    {
      title: "PREMIUM SOCCER COACHING BOOTCAMP",
      desc: "Pelajari formula taktikal 4-3-3 & 3-5-2 bertaraf dunia dari bekas jurulatih professional UEFA Pro. Nikmati diskaun 40% hari ini!",
      cta: "Daftar Sekarang",
      tag: "Kelas Pro",
      bgImg: "linear-gradient(135deg, rgba(8, 6, 20, 0.95) 0%, rgba(26, 20, 64, 0.95) 100%)"
    },
    {
      title: "KASUT BOLA Rasmi BRAND 'ELITE'",
      desc: "Kawalan bola muktamad, rekabentuk berteknologi strikethrough getah premium, dan kelajuan kilat di atas padang. Klik untuk lihat tawaran.",
      cta: "Beli Sekarang",
      tag: "Peralatan Skuad",
      bgImg: "linear-gradient(135deg, rgba(14, 10, 5, 0.95) 0%, rgba(45, 30, 8, 0.95) 100%)"
    },
    {
      title: "TACTIGEN PRO UPGRADE VIP MEMBERSHIP",
      desc: "Aktifkan storan Cloud, muat turun diagram resolusi ultra-tinggi 4K, dan latih pemain anda dengan modul kecerdasan buatan VIP kustom.",
      cta: "Langgan VIP",
      tag: "Esklusif",
      bgImg: "linear-gradient(135deg, rgba(12, 5, 20, 0.95) 0%, rgba(46, 12, 56, 0.95) 100%)"
    }
  ];

  // Rotate mock ads every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % mockAds.length);
    }, 10005);
    return () => clearInterval(interval);
  }, []);

  const activeAd = mockAds[activeAdIndex];

  return (
    <div className="w-full bg-[#111115] border border-white/5 rounded-2xl p-4 shadow-xl space-y-3">
      {/* HEADER BAR */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
        <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wide">
            Sponsor Taktikal & Rakan Kerjasama
          </h4>
          <p className="text-[10px] text-gray-400">Tawaran istimewa dan latihan eksklusif kelab</p>
        </div>
      </div>

      {/* MOCK ROTATING LUXURY SPONSORSHIP BANNER (DEMO ADS) WITH NO AD SENSE / NO REVENUE */}
      <div
        style={{ backgroundImage: activeAd.bgImg }}
        className="relative border border-white/5 hover:border-amber-500/20 rounded-xl p-4 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 overflow-hidden shadow-inner select-none"
      >
        {/* Animated Glow Grid behind advertisement banner */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-500 via-transparent to-blue-550 opacity-60" />

        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> {activeAd.tag}
            </span>
          </div>
          <h5 className="text-xs font-black text-white tracking-wide">
            {activeAd.title}
          </h5>
          <p className="text-[10px] text-gray-400 leading-relaxed font-sans pr-4">
            {activeAd.desc}
          </p>
        </div>

        <div className="shrink-0">
          <span className="px-3.5 py-2 bg-gradient-to-r from-amber-650 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white rounded-xl text-[10px] font-black transition-transform duration-200 shadow-md flex items-center gap-1 cursor-pointer">
            {activeAd.cta} <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
