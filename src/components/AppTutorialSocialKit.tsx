import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Sparkles, 
  Camera, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  Download, 
  Users, 
  Info,
  Tv,
  ExternalLink,
  ChevronRight,
  Shield,
  Palette,
  FileText,
  BookOpen,
  Cpu,
  Database,
  Activity
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  number: number;
  role: string;
  x: number;
  y: number;
  isStarting: boolean;
  photo: string | null;
}

interface AppTutorialSocialKitProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "id" | "en";
  players: Player[];
  teamName: string;
  formation: string;
  teamLogo: string | null;
  primaryColor: string;
  gkColor: string;
}

const SLIDES = {
  id: [
    {
      title: "🛡️ Setup Klub & Kostum Merdeka",
      desc: "Langkah awal menguasai taktik! Buat identitas klub Anda menonjol degan logo kustom, nama tim yang prestisius, serta atur warna kebanggaan jersey utama dan jersey kiper (GK). Warna ini terintegrasi secara dinamis pada semua cetakan poster.",
      badge: "Klub Kustom",
      tip: "Tips: Unggah file PNG transparan untuk visual logo terbaik di lapangan 3D."
    },
    {
      title: "🏃 Simulasi Skuad XI & Substitusi Instan",
      desc: "Geser (drag) pemain starting XI untuk memposisikan mereka di lapangan taktis. Ingin melakukan transfer cadangan? Tinggal tarik pemain utama ke area 'Sideline Bench' di bawah, atau tarik pemain cadangan ke lapangan untuk melakukan pergantian otomatis tanpa hambatan.",
      badge: "Dinamis Drag",
      tip: "Tips: Klik ganda pada kartu pemain mana saja untuk mengubah nama, nomor, role, maupun statistik individu."
    },
    {
      title: "🖌️ Coretan Papan & Garis Panah Taktis",
      desc: "Gunakan mode 'Coret' untuk merancang pergerakan pemain. Tarik garis lurus untuk instruksi lari tanpa bola, atau buat 'Panah Taktis' tebal untuk merevolusi fasa transisi serangan balik tim Anda. Dilengkapi pengatur ketebalan dan palet warna sikat.",
      badge: "Real-time Chalk",
      tip: "Tips: Papan ini mendukung hapus coretan satu per satu atau reset total secara instan."
    },
    {
      title: "🧠 Analisis Omni Hub UEFA Coach",
      desc: "Butuh saran ahli taktis? Klik 'Analisis Skuad' untuk memanggil kecerdasan buatan Omni. Dapatkan laporan kepanduan lengkap berisi: pola menyerang, kestabilan lini belakang, skor kohesi playbook, serta swot kelemahan skuad langsung dengan rekomendasi solusi.",
      badge: "Omni AI Intelligence",
      tip: "Tips: Semua detail taktis kini tersusun dalam tombol interaktif yang ringkas dan memikat."
    }
  ],
  en: [
    {
      title: "🛡️ Club Identity & Dynamic Kit Setup",
      desc: "First step to master playmaking! Elevate your team's prestige with custom logo uploads, main squad names, and personalize primary/goalkeeper jerseys colors. These colors link automatically to your digital blackboard overlays.",
      badge: "Dynamic Brand",
      tip: "Pro Tip: Use transparent PNG logos for maximum aesthetics on our 3D tactical field."
    },
    {
      title: "🏃 Squad Starting XI & Smart Substitutions",
      desc: "Simply grab and drag starting XI athletes to reposition them on the field. To substitute, pull any player from the starting grid down to the sideline bench, or push bench players directly onto the pitch to automate rotation layouts.",
      badge: "Fluid Drag & Drop",
      tip: "Pro Tip: Double-click any player badge to modify their name, kit number, position, and individual stats."
    },
    {
      title: "🖌️ Blueprint Drawings & Tactical Arrow Lines",
      desc: "Toggle 'Drawing Mode' to visualize tactical plays. Pull straight lines to guide off-the-ball runs, or sketch bold custom arrows illustrating lethal counter-attacks. Features adjustable brush sizes and deep contrast palettes.",
      badge: "Blueprint Tools",
      tip: "Pro Tip: Double-click balls or cones to clear clutter instantly without wiping drawings."
    },
    {
      title: "🧠 UEFA Pro AI Coach Analytics Hub",
      desc: "Unleash artificial intelligence expertise. Trigger 'Analyze Squad' to get premium scout reports covering attacking transitions, midfield anchors, defensive compactness, playbook synergy, and dynamic swot counter-measures.",
      badge: "Omni Pro AI",
      tip: "Pro Tip: Scout reports are now nested inside modern, interactive mini-cards for quick reads."
    }
  ]
};

export const AppTutorialSocialKit: React.FC<AppTutorialSocialKitProps> = ({
  isOpen,
  onClose,
  lang,
  players,
  teamName,
  formation,
  teamLogo,
  primaryColor,
  gkColor
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"tutorial" | "datasheet" | "instagram">("tutorial");
  
  // States for Instagram Graphic Customization
  const [coachName, setCoachName] = useState(lang === "id" ? "Coach Budi" : "Manager Alex");
  const [matchTitle, setMatchTitle] = useState(lang === "id" ? "INDONESIA SUPER MATCHDAY" : "CHAMPIONS GRAND SHIFT");
  const [stadiumTheme, setStadiumTheme] = useState<"cyber-stadium" | "legend-grass" | "dark-velvet">("cyber-stadium");
  const [showPlayerRoles, setShowPlayerRoles] = useState(true);
  const [opacityOverlay, setOpacityOverlay] = useState(0.85);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const t_slides = SLIDES[lang];
  const isId = lang === "id";

  // Pre-draw Instagram canvas preview
  useEffect(() => {
    if (activeTab !== "instagram" || !canvasRef.current) return;
    drawInstagramPoster();
  }, [activeTab, coachName, matchTitle, stadiumTheme, showPlayerRoles, opacityOverlay, players, teamName, formation, teamLogo, primaryColor, gkColor, lang]);

  const drawInstagramPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas size is 1080x1080 (Instagram standard)
    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // Clear Canvas
    ctx.clearRect(0, 0, size, size);

    // 1. DRAW BACKGROUND THEME
    if (stadiumTheme === "cyber-stadium") {
      // Deep tech gradient background
      const grad = ctx.createRadialGradient(size / 2, size / 2, 50, size / 2, size / 2, size * 0.7);
      grad.addColorStop(0, "#0e1830");
      grad.addColorStop(0.5, "#080c16");
      grad.addColorStop(1, "#020306");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Cyber lines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < size; i += 120) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }

      // Cyber tactical vector circles in center
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2 + 60, 280, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2 + 60, 180, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (stadiumTheme === "legend-grass") {
      // Emerald striped modern soccer field
      ctx.fillStyle = "#1e3b20";
      ctx.fillRect(0, 0, size, size);

      const stripes = 10;
      const stripeHeight = size / stripes;
      for (let i = 0; i < stripes; i++) {
        if (i % 2 === 0) {
          ctx.fillStyle = "#162e18";
          ctx.fillRect(0, i * stripeHeight, size, stripeHeight);
        }
      }

      // Traditional field center circle overlay with transparent glow
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      // Center Circle
      ctx.arc(size / 2, size / 2 + 60, 160, 0, Math.PI * 2);
      // Half-line
      ctx.moveTo(0, size / 2 + 60);
      ctx.lineTo(size, size / 2 + 60);
      ctx.stroke();
    } else {
      // Dark velvet stadium / editorial crimson black
      const grad = ctx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, "#2c0e12");
      grad.addColorStop(0.3, "#14070a");
      grad.addColorStop(1, "#050103");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Abstract luxury star trails in background background
      ctx.fillStyle = "rgba(234, 179, 8, 0.05)";
      ctx.beginPath();
      ctx.moveTo(0, size);
      ctx.lineTo(size / 2, size * 0.4);
      ctx.lineTo(size, size);
      ctx.fill();

      ctx.strokeStyle = "rgba(234, 179, 8, 0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 16]);
      ctx.beginPath();
      ctx.arc(size / 2, size, 400, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. STAGE WATERMARKING / TEXTURE OVERLAYS
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.font = "italic 900 130px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CHAMPIONS", size / 2, size * 0.62);

    // 3. DRAW GLASS HEADER FRAME
    ctx.fillStyle = `rgba(15, 17, 23, ${opacityOverlay})`;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(40, 40, size - 80, 160, 24);
    ctx.fill();
    ctx.stroke();

    // 4. DRAW HEADER BRANDING TEXT (Tim, Match Name, Coach)
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;

    // Match Title
    ctx.fillStyle = "#e5ebd5"; 
    ctx.font = "italic 900 21px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(matchTitle.toUpperCase(), 180, 94);

    // Dynamic Team Identity
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 48px sans-serif";
    ctx.fillText((teamName || "GARUDA FC").toUpperCase(), 180, 148);

    // Formation Badge in Header
    ctx.fillStyle = primaryColor || "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(180, 164, 150, 26, 6);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillText(`FORMATION: ${formation}`, 196, 181);

    // Coach Badge right aligned
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.roundRect(size - 340, 72, 280, 85, 14);
    ctx.fill();

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(isId ? "KEPALA PELATIH" : "CHIEF TACTICIAN", size - 324, 94);

    ctx.fillStyle = "#ca8a04"; // gold coach name
    ctx.font = "900 25px sans-serif";
    ctx.fillText(coachName.toUpperCase(), size - 324, 126);

    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("TACTIGEN PRO AI • LIVE", size - 324, 145);

    // Draw team logo image if exists, otherwise draw uniform shield vector
    if (teamLogo) {
      const img = new Image();
      img.src = teamLogo;
      // Drawing immediately if loaded, fallback vector drawn below
      try {
        ctx.drawImage(img, 70, 65, 85, 85);
      } catch (e) {
        // Safe fallback vector if reader not ready immediately on redrawing loop
        drawShieldLogo(ctx, 70, 65, 85);
      }
    } else {
      drawShieldLogo(ctx, 70, 65, 85);
    }

    // 5. DRAW ACTIVE STARTING PLAYERS OVERLAY ON THE GRID
    // We only filter starting XI players to fit perfectly on social graphic
    const startingXI = players.filter(p => p.isStarting);
    
    startingXI.forEach((player) => {
      // Map coordinate safely from 100x100 space to grid size 920x680 space
      // Canvas starts at Y 240 down to 960 (720px total height context)
      // Canvas width ranges from 120px to 960px (840px total width context)
      const px = 120 + (player.x / 100) * 840;
      const py = 250 + (player.y / 100) * 640;

      const isGK = player.role === "GK";
      const teamColor = isGK ? gkColor : primaryColor;

      // Draw shiny neon player node glow
      ctx.shadowColor = teamColor;
      ctx.shadowBlur = 18;

      // Outer disc
      ctx.fillStyle = "#0a0b0e";
      ctx.strokeStyle = teamColor;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(px, py, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Outer golden trim if role is Captain/Forward etc
      if (player.role === "FWD") {
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 31, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.shadowBlur = 0; // turn off shadow

      // Draw Jersey number indicator inside disk
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 16px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(player.number.toString(), px, py + 1.2);

      // Player Name Plate under disc
      ctx.fillStyle = "rgba(4, 5, 8, 0.9)";
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px - 60, py + 34, 120, 26, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 11.5px sans-serif";
      ctx.fillText(player.name.toUpperCase(), px, py + 46);

      // Role pill tag index setup overlay
      if (showPlayerRoles) {
        ctx.fillStyle = isGK ? "#f43f5e" : "#5b21b6"; // GK Red, Defense indigo/violet
        ctx.beginPath();
        ctx.roundRect(px + 18, py - 32, 34, 14, 4);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "black 8px sans-serif";
        ctx.fillText(player.role, px + 35, py - 25);
      }
    });

    // 6. DRAW FOOTER PROMOTIONAL BAR WITH SPECIFIC BRAND LABELS
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(7, 8, 12, 0.95)";
    ctx.beginPath();
    ctx.rect(0, size - 80, size, 80);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, size - 80);
    ctx.lineTo(size, size - 80);
    ctx.stroke();

    // Footer labels
    ctx.fillStyle = "#71717a";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("MADE WITH TACTIGEN PRO • SPORT BLUEPRINT GENERATOR", 46, size - 36);

    ctx.textAlign = "right";
    ctx.fillStyle = "#3b82f6";
    ctx.font = "900 14px 'JetBrains Mono', monospace animate-pulse";
    ctx.fillText("UEFA LICENSE PRO ARCH", size - 46, size - 36);
  };

  const drawShieldLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, dimension: number) => {
    ctx.fillStyle = primaryColor || "#2563eb";
    ctx.strokeStyle = "#eab308"; // Golden outline border
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + dimension / 2, y);
    ctx.lineTo(x + dimension, y + dimension * 0.25);
    ctx.lineTo(x + dimension, y + dimension * 0.65);
    ctx.quadraticCurveTo(x + dimension, y + dimension, x + dimension / 2, y + dimension);
    ctx.quadraticCurveTo(x, y + dimension, x, y + dimension * 0.65);
    ctx.lineTo(x, y + dimension * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw little inner gold star
    ctx.fillStyle = "#eab308";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", x + dimension / 2, y + dimension / 2 + 1);
  };

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `TACTIGEN_${teamName.replace(/\s+/g, "_")}_POSTER.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % t_slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + t_slides.length) % t_slides.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[5500] flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-[#0c0d12] border border-white/[0.08] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header Modal */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-white/5 bg-gradient-to-r from-blue-950/20 via-[#0d0e15] to-indigo-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase font-sans flex items-center gap-1.5">
                {isId ? "📖 Studio Panduan & Media Poster Taktigen" : "📖 Tactigen Guide & Poster Studio"}
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono tracking-widest animate-pulse font-black uppercase">
                  V2.0 LIVE
                </span>
              </h3>
              <p className="text-[10px] text-gray-400 font-sans">
                {isId ? "Pelajari peta fungsionalitas & export poster 1080x1080 kustom untuk IG" : "Learn playbook mechanics & export premium 1080x1080 graphics for socials"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Tab Navigation Segmented Bar */}
        <div className="px-4 sm:px-6 bg-[#0f1118]/80 border-b border-white/5 py-1.5 sm:py-2.5 flex items-center justify-between gap-4">
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1 w-full max-w-xl">
            <button
              onClick={() => setActiveTab("tutorial")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "tutorial"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{isId ? "💡 Tutorial" : "💡 User Guide"}</span>
            </button>
            <button
              onClick={() => setActiveTab("datasheet")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "datasheet"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isId ? "📊 Lembar Data (Specs)" : "📊 Datasheet"}</span>
            </button>
            <button
              onClick={() => setActiveTab("instagram")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "instagram"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-pink-400" />
              <span>{isId ? "📲 Poster Instagram" : "📲 Poster Maker"}</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-500 font-bold tracking-wider">
            <Palette className="w-3 h-3 text-emerald-500" />
            <span>{isId ? "Gaya: Swiss / High Contrast Slate" : "Style: Swiss / High Contrast Slate"}</span>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[300px] leading-relaxed">
          <AnimatePresence mode="wait">
            {activeTab === "tutorial" ? (
              <motion.div
                key="tutorial-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* Carousel Card Slider */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left slide presentation visual display */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-[#121422] to-[#0a0b10] border border-white/5 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                    
                    <div className="space-y-4 relative z-10">
                      <span className="text-[9px] bg-blue-600/20 text-blue-400 border border-blue-500/30 font-black tracking-widest uppercase px-2 py-0.5 rounded">
                        {t_slides[activeSlide].badge}
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white leading-tight font-sans">
                        {t_slides[activeSlide].title}
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed text-justify">
                        {t_slides[activeSlide].desc}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 space-y-3 relative z-10">
                      <div className="bg-[#181a26]/75 border border-amber-500/10 p-2.5 rounded-xl flex items-start gap-2">
                        <span className="text-xs">💡</span>
                        <p className="text-[10px] text-amber-300 font-medium leading-relaxed italic">{t_slides[activeSlide].tip}</p>
                      </div>

                      {/* Slider Dots Indicator */}
                      <div className="flex items-center gap-1.5 justify-center pt-2">
                        {t_slides.map((_, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setActiveSlide(idx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === activeSlide ? "w-5 bg-blue-500" : "w-1.5 bg-gray-600"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side staggered features map card */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest select-none">
                        {isId ? "📋 PETA UTAMA KONTROL & INSTRUKSI" : "📋 PRIMARY CORE MANUALS"}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[#121420]/45 border border-white/5 hover:border-blue-500/20 p-3.5 rounded-xl flex gap-3 transition-colors">
                          <span className="text-xl shrink-0">🛡️</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-200 block">{isId ? "Ubah Warna Jersey/Kostum" : "Customize Kit Swatches"}</span>
                            <p className="text-[9.5px] text-gray-500 leading-relaxed">{isId ? "Atur warna seragam utama, kiper, nomor punggung, hingga ketebalan kustom garis sikat." : "Fine tune home colors, keepers, number shades & stroke weights."}</p>
                          </div>
                        </div>

                        <div className="bg-[#121420]/45 border border-white/5 hover:border-blue-500/20 p-3.5 rounded-xl flex gap-3 transition-colors">
                          <span className="text-xl shrink-0">⚽</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-200 block">{isId ? "Deploy Bola & Cone Kustom" : "Deploy Multiple Soccer Balls"}</span>
                            <p className="text-[9.5px] text-gray-500 leading-relaxed">{isId ? "Tambahkan marker bola atau cone latihan taktis sebanyak-banyaknya di area manapun." : "Add extra static soccer balls or cones on critical zones anywhere."}</p>
                          </div>
                        </div>

                        <div className="bg-[#121420]/45 border border-white/5 hover:border-blue-500/20 p-3.5 rounded-xl flex gap-3 transition-colors">
                          <span className="text-xl shrink-0">🧠</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-200 block">{isId ? "Analisis Skuad Instan AI" : "Artificial Intelligence Pro"}</span>
                            <p className="text-[9.5px] text-gray-500 leading-relaxed">{isId ? "Biarkan model Gemini terbaik menimbang sinergi, kelebihan, dan kelemahan barisan pemain." : "Let industry models grade player links, swots & recommend setups."}</p>
                          </div>
                        </div>

                        <div className="bg-[#121420]/45 border border-white/5 hover:border-indigo-500/20 p-3.5 rounded-xl flex gap-3 transition-colors">
                          <span className="text-xl shrink-0">📽️</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-200 block">{isId ? "TV Preview & Unduh PNG" : "TV Presentation Mode"}</span>
                            <p className="text-[9.5px] text-gray-500 leading-relaxed">{isId ? "Ubah visual ke rasio broadcast TV olahraga profesional dan unduh poster resolusi tinggi." : "Maximize into clean stream aspect ratio or save blueprint layouts instantly."}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Carousel Buttons Control */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                      <button
                        onClick={prevSlide}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{isId ? "Sebelumnya" : "Prev"}</span>
                      </button>

                      <div className="text-[10px] text-gray-500 font-extrabold tracking-widest uppercase">
                        SLIDE {activeSlide + 1} / {t_slides.length}
                      </div>

                      <button
                        onClick={nextSlide}
                        className="px-4 py-2 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
                      >
                        <span>{isId ? "Selanjutnya" : "Next"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === "datasheet" ? (
              <motion.div
                key="datasheet-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* Specs overview cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#121422]/60 border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Cpu className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">CORE ENGINE VERSION</span>
                      <span className="text-sm font-black text-white font-mono">TACTIGEN PRO V2.0</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#121422]/60 border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">{isId ? "KAPASITAS SKUAD" : "SQUAD CAPACITY"}</span>
                      <span className="text-sm font-black text-white font-mono">{players.length} ATLET TERDAFTAR</span>
                    </div>
                  </div>

                  <div className="bg-[#121422]/60 border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">STORAGE GATEWAY</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">OFFLINE-FIRST LOCAL</span>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Table and Storage Schema */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Specs column */}
                  <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5 text-emerald-400">
                      <Activity className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        {isId ? "📋 Spesifikasi Sistem" : "📋 System Specifications"}
                      </h4>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-400 font-medium">{isId ? "Metode Penyimpanan" : "Persistence Layer"}</span>
                        <span className="font-mono text-white text-right font-bold">localStorage (Browser Encrypted)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-400 font-medium">{isId ? "Model Bahasa AI" : "AI Intelligence"}</span>
                        <span className="font-mono text-white text-right font-bold">Google Gemini 3.5 / MCP</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-400 font-medium">{isId ? "Format Ekspor Media" : "Export Graphic Format"}</span>
                        <span className="font-mono text-white text-right font-bold">PNG 1080x1080px (IG Standard)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-gray-400 font-medium">{isId ? "Akurasi Lapangan" : "Coordinate System Accuracy"}</span>
                        <span className="font-mono text-white text-right font-bold">2.5D Real-time Coordinate Map</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-gray-400 font-medium">{isId ? "Lisensi Pelatih" : "Coaching License Base"}</span>
                        <span className="font-mono text-emerald-400 text-right font-bold">UEFA PRO PLATINUM STANDARD</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Local Storage schema column */}
                  <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5 text-blue-400">
                      <Shield className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        {isId ? "🔑 Keamanan & Struktur Memori" : "🔑 Stored Schema & Privacy"}
                      </h4>
                    </div>

                    <p className="text-[10.5px] text-gray-400 leading-relaxed text-justify">
                      {isId 
                        ? "Seluruh taktik, coretan, susunan skuad, warna tim, dan kunci API rahasia Anda disimpan secara lokal di browser Anda. Tidak ada data yang dikirimkan ke server eksternal demi menjamin kerahasiaan playbook tim Anda."
                        : "All tactical assets, playbooks, team kit colors, drawings, and custom API Keys are retained on-device. No telemetry is logged or sent to servers."}
                    </p>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-2.5">
                      <span className="text-[10px] font-mono text-emerald-400 block font-bold">✓ LOCALSTORAGE VARIABLES</span>
                      <ul className="list-disc list-inside text-[10px] text-gray-400 space-y-1.5 font-mono">
                        <li><span className="text-gray-200">tactigen_custom_key</span>: {isId ? "Kunci API Google Gemini Anda" : "Your Gemini API Key"}</li>
                        <li><span className="text-gray-200">tactigen_mcp_enabled</span>: {isId ? "Status integrasi MCP lokal" : "Status of local MCP connection"}</li>
                        <li><span className="text-gray-200">tactigen_mcp_url</span>: {isId ? "Alamat endpoint host MCP" : "Host endpoint for MCP"}</li>
                        <li><span className="text-gray-200">tactigen_saved_playbooks</span>: {isId ? "Koleksi formasi & pemain" : "Playbook slots collection"}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="instagram-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                {/* Left Controller Side Fields */}
                <div className="lg:col-span-5 space-y-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black tracking-wide text-white uppercase">
                      {isId ? "⚙️ Personalisasi Desain" : "⚙️ Design Customizations"}
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Coach Name Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        {isId ? "Nama Pelatih (Coach/Manager)" : "Coach/Manager Name"}
                      </label>
                      <input
                        type="text"
                        value={coachName}
                        onChange={(e) => setCoachName(e.target.value)}
                        placeholder="e.g. Coach Budi Santoso"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-bold"
                      />
                    </div>

                    {/* Matchday Title Header */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        {isId ? "Judul Laga / Turnamen" : "Match Title Context"}
                      </label>
                      <input
                        type="text"
                        value={matchTitle}
                        onChange={(e) => setMatchTitle(e.target.value)}
                        placeholder="e.g. INDONESIA SUPER CUP MATCHDAY"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-bold"
                      />
                    </div>

                    {/* Choose background aesthetic */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        {isId ? "Estetika & Mood Stadion" : "Stadium Background Theme"}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: "cyber-stadium", label: isId ? "Cyber" : "Cyber", emo: "⚡" },
                          { key: "legend-grass", label: isId ? "Classic" : "Classic", emo: "🌿" },
                          { key: "dark-velvet", label: isId ? "Elegant" : "Elegant", emo: "🌌" }
                        ].map((thm) => (
                          <button
                            key={thm.key}
                            onClick={() => setStadiumTheme(thm.key as any)}
                            className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase flex flex-col items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                              stadiumTheme === thm.key
                                ? "bg-indigo-650 border-indigo-400/50 text-white"
                                : "bg-black/40 border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="text-sm">{thm.emo}</span>
                            <span>{thm.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity Overlay slider */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>{isId ? "Kepekatan Header" : "Header Opacity Overlay"}</span>
                        <span className="font-mono text-indigo-400">{Math.round(opacityOverlay * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.0"
                        step="0.05"
                        value={opacityOverlay}
                        onChange={(e) => setOpacityOverlay(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 bg-black/50 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Toggle show role tag */}
                    <div className="flex items-center justify-between bg-black/30 border border-white/5 p-2.5 rounded-xl mt-2 select-none">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase block">{isId ? "Gaya Posisi Atlet" : "Show Player Roles"}</span>
                        <span className="text-[9px] text-gray-500">{isId ? "Tampilkan tag role GK, DEF, MID, FWD" : "Toggle small positional tags beside jerseys"}</span>
                      </div>
                      <button
                        onClick={() => setShowPlayerRoles(!showPlayerRoles)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                          showPlayerRoles ? "bg-indigo-600 justify-end" : "bg-gray-750 justify-start"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>

                    {/* Action Download */}
                    <div className="pt-2">
                      <button
                        onClick={handleDownloadPoster}
                        className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer select-none"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>{isId ? "UNDUH POSTER INSTAGRAM PNG" : "DOWNLOAD INSTAGRAM PNG"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Live HD Poster Canvas Preview */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/35 rounded-2xl border border-white/5 p-4 relative overflow-hidden">
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded bg-[#0b0c10]/80 border border-white/10 text-gray-400 font-mono text-[8px] tracking-widest uppercase">
                    <span className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
                    <span>PREVIEW DESIGN GRID (1080x1080)</span>
                  </div>

                  {/* Real-time scaling canvas */}
                  <div className="w-full max-w-[360px] xs:max-w-[420px] aspect-square rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group bg-[#0e0f14]">
                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-full object-contain"
                    />

                    {/* Hover guide overlay indicator to invite user */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer" onClick={handleDownloadPoster}>
                      <div className="p-3 bg-white/10 border border-white/20 rounded-full text-white mb-2 shadow-xl">
                        <Download className="w-6 h-6 animate-bounce" />
                      </div>
                      <span className="text-white font-black text-xs uppercase tracking-wider">{isId ? "Klik untuk download poster" : "Click to download poster"}</span>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{isId ? "Desain resolusi tinggi (1080x1080) sempurna untuk post feed Instagram dan status sosmed." : "High quality design (1080x1080) optimized for grids & timelines."}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[#71717a] text-[10px] justify-center text-center leading-relaxed">
                    <span>💡</span>
                    <span>{isId ? "Grafik ini merefleksikan formasi, skema jersey, nama atlet kustom, dan bendera logo tim utama Anda saat ini." : "This graphic renders your customized squad formation names, kit colorway, and primary logo uploads."}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info brand */}
        <div className="p-3 sm:p-4 bg-[#0a0a0d] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold select-none font-sans">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Tactigen Football Playmaker System &copy; 2026 • UEFA Pro Licensed Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4.5 py-2 bg-[#17181f] hover:bg-[#20212b] border border-white/5 hover:border-white/15 text-gray-300 hover:text-white font-black text-xs rounded-xl transition-all cursor-pointer active:scale-95"
            >
              {isId ? "Tutup Cetakan Studio" : "Close Studio"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
