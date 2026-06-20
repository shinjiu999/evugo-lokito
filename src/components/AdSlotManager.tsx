import { useState, useEffect } from "react";
import { DollarSign, Eye, Settings2, HelpCircle, CheckCircle2, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdSlotManager() {
  const [adClient, setAdClient] = useState(() => localStorage.getItem("tactigen_ad_client") || "");
  const [adSlot, setAdSlot] = useState(() => localStorage.getItem("tactigen_ad_slot") || "");
  const [showConfig, setShowConfig] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [adClickCount, setAdClickCount] = useState(() => Number(localStorage.getItem("tactigen_ad_clicks") || "0"));
  const [earnedEstimate, setEarnedEstimate] = useState(() => Number(localStorage.getItem("tactigen_ad_earnings") || "0.00"));

  // Mock advertisements rotation list (Football theme)
  const mockAds = [
    {
      title: "PREMIUM SOCCER COACHING BOOTCAMP",
      desc: "Pelajari formula taktikal 4-3-3 & 3-5-2 bertaraf dunia dari bekas jurulatih professional UEFA Pro. Nikmati diskaun 40% hari ini!",
      cta: "Daftar Sekarang (Disponsori)",
      tag: "Sponsor Kelas",
      colorFrom: "from-blue-600",
      colorTo: "to-indigo-600",
      accent: "text-blue-400",
      bgImg: "linear-gradient(135deg, rgba(8, 6, 20, 0.95) 0%, rgba(26, 20, 64, 0.95) 100%)"
    },
    {
      title: "KASUT BOLA ADIDAS PREDATOR 'ELITE'",
      desc: "Kawalan bola muktamad, rekabentuk berteknologi strikethrough getah premium, dan kelajuan kilat di atas padang. Klik untuk beli di kedai rasmi.",
      cta: "Beli Sekarang (Disponsori)",
      tag: "Sponsor Peralatan",
      colorFrom: "from-amber-600",
      colorTo: "to-yellow-500",
      accent: "text-amber-400",
      bgImg: "linear-gradient(135deg, rgba(14, 10, 5, 0.95) 0%, rgba(45, 30, 8, 0.95) 100%)"
    },
    {
      title: "TACTIGEN PRO UPGRADE VIP MEMBERSHIP",
      desc: "Aktifkan storan Cloud, muat turun diagram resolusi ultra-tinggi 4K, dan latih pemain anda dengan modul kecerdasan buatan VIP kustom.",
      cta: "Langgan VIP (Sponsor)",
      tag: "Sponsor Terbina",
      colorFrom: "from-purple-600",
      colorTo: "to-pink-600",
      accent: "text-purple-400",
      bgImg: "linear-gradient(135deg, rgba(12, 5, 20, 0.95) 0%, rgba(46, 12, 56, 0.95) 100%)"
    }
  ];

  // Rotate mock ads every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % mockAds.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Save AdSense fields to localStorage
  const handleSaveConfig = () => {
    localStorage.setItem("tactigen_ad_client", adClient.trim());
    localStorage.setItem("tactigen_ad_slot", adSlot.trim());
    setShowConfig(false);
  };

  // Simulate revenue on mock click to show the user how they gets paid!
  const handleMockClick = (e: React.MouseEvent) => {
    const newCount = adClickCount + 1;
    // Assume average CPC (Cost Per Click) is $0.45 USD per click
    const newEarnings = earnedEstimate + 0.45;
    
    setAdClickCount(newCount);
    setEarnedEstimate(newEarnings);
    
    localStorage.setItem("tactigen_ad_clicks", String(newCount));
    localStorage.setItem("tactigen_ad_earnings", newEarnings.toFixed(2));
  };

  const handleResetSimulatedEarnings = () => {
    setAdClickCount(0);
    setEarnedEstimate(0);
    localStorage.setItem("tactigen_ad_clicks", "0");
    localStorage.setItem("tactigen_ad_earnings", "0.00");
  };

  // Google AdSense live script injection once credentials exist!
  useEffect(() => {
    if (adClient.trim() && adSlot.trim()) {
      try {
        // Inject AdSense client main JS file
        const scriptId = "adsbygoogle-main-script";
        if (!document.getElementById(scriptId)) {
          const script = document.createElement("script");
          script.id = scriptId;
          script.async = true;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient.trim()}`;
          script.crossOrigin = "anonymous";
          document.head.appendChild(script);
        }

        // Initialize Adsbygoogle sequence push safely with a timeout to allow DOM to commit
        const timer = setTimeout(() => {
          try {
            const unfilledIns = document.querySelectorAll("ins.adsbygoogle:not([data-adsbygoogle-status='done'])");
            if (unfilledIns.length > 0) {
              // @ts-ignore
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          } catch (err) {
            console.warn("AdSense push safely bypassed:", err);
          }
        }, 300);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("AdSense initialization failed due to frame policy: ", err);
      }
    }
  }, [adClient, adSlot]);

  const activeAd = mockAds[activeAdIndex];

  return (
    <div className="w-full bg-[#111115] border border-white/5 rounded-2xl p-4 shadow-xl space-y-4">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              Slot Iklan Penjana Wang <span className="text-[10px] text-emerald-400 lowercase font-mono">($0.45 average cpc)</span>
            </h4>
            <p className="text-[10px] text-gray-400">Google AdSense / AdMob Terintegrasi</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors cursor-pointer border-0"
            title="Klik untuk tetapan parameter AdSense"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ADSENSE INTEGRATION INPUT FORM */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-3.5"
          >
            <h5 className="text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center gap-1.5">
              ⚙️ Konfigurasi Kode Google AdSense
            </h5>

            <p className="text-[10px] text-gray-400 leading-relaxed">
              Apabila anda bersedia untuk mempublikasi aplikasi standard ini ke Google Studio atau domain web persendirian anda, masukkan data pencawang Google AdSense anda di sini untuk memuatkan iklan langsung secara percuma seminit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-500">AdSense Publisher ID (ca-pub)</label>
                <input
                  type="text"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  value={adClient}
                  onChange={(e) => setAdClient(e.target.value)}
                  className="w-full bg-[#15151a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-500">Google Ad Slot ID</label>
                <input
                  type="text"
                  placeholder="XXXXXXXXXX"
                  value={adSlot}
                  onChange={(e) => setAdSlot(e.target.value)}
                  className="w-full bg-[#15151a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
              <span className="text-[9px] text-gray-500 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> Perlukan pertolongan dengan iklan?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 text-[10px] font-bold uppercase transition-colors border-0 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase transition-colors border-0 cursor-pointer"
                >
                  Simpan Pelayan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE ADSENSE BANNER DISPLAY AREA OR PREMIUM MOCK ROTATOR BANNER */}
      {adClient.trim() && adSlot.trim() ? (
        <div className="bg-[#0c0c0f] border border-emerald-500/20 rounded-xl p-3 text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded uppercase font-bold tracking-widest font-mono">
            LIVE ADSENSE
          </div>
          
          <p className="text-[9px] text-gray-500 font-mono">Memuatkan unit iklan Google AdSense ...</p>
          
          {/* Authentic Google AdSense HTML Insertion */}
          <div className="w-full flex justify-center py-2 overflow-hidden">
            <ins
              className="adsbygoogle"
              style={{ display: "block", width: "100%", height: "90px" }}
              data-ad-client={adClient.trim()}
              data-ad-slot={adSlot.trim()}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>

          <div className="text-[9px] text-gray-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Klip iklan sebenar akan dijanakan secara langsung setelah domain disahkan oleh Google.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* MOCK ROTATING LUXURY SPONSORSHIP BANNER (DEMO ADS) */}
          <div
            onClick={handleMockClick}
            style={{ backgroundImage: activeAd.bgImg }}
            className={`cursor-pointer group relative border border-white/5 hover:border-emerald-500/30 rounded-2xl p-4 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 overflow-hidden shadow-inner select-none`}
          >
            {/* Animated Glow Grid behind advertisement banner */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-500 via-transparent to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> {activeAd.tag}
                </span>
                <span className="text-[9px] text-gray-500">Penjana Wang Demo (Klik untuk simulasi untung)</span>
              </div>
              <h5 className="text-xs font-black text-white tracking-wide group-hover:text-amber-400 transition-colors">
                {activeAd.title}
              </h5>
              <p className="text-[10px] text-gray-400 leading-relaxed font-sans pr-4">
                {activeAd.desc}
              </p>
            </div>

            <div className="shrink-0">
              <span className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-[10.5px] font-black transition-transform duration-200 group-hover:scale-[1.03] shadow-md shadow-emerald-600/10 flex items-center gap-1">
                {activeAd.cta} <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* SIMULATED REVENUE EARNINGS HUD FOR DEMONSTRATION */}
          <div className="bg-[#15151a] border border-white/5 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold block">Simulasi Pendapatan Iklan</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-white">${earnedEstimate.toFixed(2)} USD</span>
                  <span className="text-[10px] text-gray-400 font-mono">({adClickCount} kliks)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={handleResetSimulatedEarnings}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-[9px] font-bold uppercase transition-colors border-0 cursor-pointer"
              >
                Reset Simulasi
              </button>
              <a
                href="https://adsense.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg text-[9px] font-black uppercase transition-colors flex items-center gap-1 cursor-pointer no-underline border border-blue-500/20"
              >
                Daftar Google AdSense <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* AD EDUCATION COLLAPSIBLE */}
      <div className="bg-blue-950/20 border border-blue-500/15 rounded-xl p-3 text-[10.5px] text-gray-400 space-y-2 leading-relaxed">
        <p className="font-extrabold text-blue-400 flex items-center gap-1">
          <ShieldAlert className="w-4 h-4 shrink-0" /> Bagaimanakah cara pengiklanan menjana uang?
        </p>
        <ul className="list-decimal pl-4 space-y-1">
          <li><strong>Pembayaran CPC (Cost Per Click)</strong>: Setiap kali pengguna berminat dengan tajuk atau sponsor di atas padang dan melakukan klik, anda mendapat purata <strong>$0.15 hingga $1.50 USD</strong> bergantung kepada negara penonton mereka.</li>
          <li><strong>Publikasi Google</strong>: Apabila anda menekan icon **Gear Biru** atau eksport zip di AI Studio, host kod ini pada web server persendirian (contoh: Vercel, Netlify, atau Cloudflare) lalu serahkan pautan untuk disemak oleh Google AdSense.</li>
        </ul>
      </div>
    </div>
  );
}
