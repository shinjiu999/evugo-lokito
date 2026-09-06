import { useState, useEffect, useRef, useMemo } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sliders,
  Palette,
  Layers,
  Tv,
  Trophy,
  Share2,
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Player } from "../types";
import Interactive3DCard from "./Interactive3DCard";
import {
  PosterTheme,
  PosterFormat,
  renderFormationPoster
} from "../utils/formationPosterRenderer";

interface AIFormationImageGeneratorProps {
  formation: string;
  teamName: string;
  primaryColor: string;
  gkColor: string;
  numberColor: string;
  players: Player[];
  teamLogo?: string | null;
  teamJersey?: string | null;
  lang?: string;
  managerName?: string;
  managerPhoto?: string | null;
  isEnemyModeActive?: boolean;
}

export default function AIFormationImageGenerator({
  formation,
  teamName,
  primaryColor,
  gkColor,
  numberColor,
  players,
  teamLogo,
  teamJersey = null,
  lang = "id",
  managerName = "Coach",
  managerPhoto = null,
  isEnemyModeActive = false
}: AIFormationImageGeneratorProps) {
  // Theme & Format State
  const [posterTheme, setPosterTheme] = useState<PosterTheme>("stadium_neon");
  const [posterFormat, setPosterFormat] = useState<PosterFormat>("landscape");

  // Tactical & Customization Options
  const [matchTitle, setMatchTitle] = useState(lang === "id" ? "SUSUNAN PEMAIN" : "MATCHDAY SQUAD");
  const [opponentName, setOpponentName] = useState("");
  const [showTacticalLinks, setShowTacticalLinks] = useState(true);
  const [showSubstitutes, setShowSubstitutes] = useState(true);
  const [showManager, setShowManager] = useState(true);
  const [showTacticalZones, setShowTacticalZones] = useState(false);

  // Fullscreen Studio Modal State
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"instant" | "ai_imagen">("instant");

  // Clipboard copy state feedback
  const [copied, setCopied] = useState(false);

  // AI Imagen State
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("tactigen_custom_key") || "");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedAiImageUrl, setGeneratedAiImageUrl] = useState<string | null>(null);

  // Instant Vector Canvas State
  const [instantImageUrl, setInstantImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedImagesCache, setLoadedImagesCache] = useState<Record<string, HTMLImageElement>>({});

  // Compute adjusted players
  const adjustedPlayers = useMemo(() => {
    return players.map((player) => {
      if (isEnemyModeActive && player.isStarting) {
        const uncompressedY = Math.max(0, Math.min(100, ((player.y - 52) / 38) * 100));
        return { ...player, y: parseFloat(uncompressedY.toFixed(1)) };
      }
      return player;
    });
  }, [players, isEnemyModeActive]);

  // Sync API Key
  useEffect(() => {
    const handleStorageChange = () => {
      setCustomApiKey(localStorage.getItem("tactigen_custom_key") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const savedKey = localStorage.getItem("tactigen_custom_key") || "";
      if (savedKey !== customApiKey) setCustomApiKey(savedKey);
    }, 1500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [customApiKey]);

  // Preload Images (Player photos, team logo, jersey, manager)
  useEffect(() => {
    let active = true;
    const toLoad: { id: string; url: string }[] = [];

    adjustedPlayers.forEach((p) => {
      if (p.isStarting && p.photo) {
        toLoad.push({ id: p.id, url: p.photo });
      }
    });
    if (teamLogo) toLoad.push({ id: "teamLogo", url: teamLogo });
    if (teamJersey) toLoad.push({ id: "teamJersey", url: teamJersey });
    if (managerPhoto) toLoad.push({ id: "managerPhoto", url: managerPhoto });

    if (toLoad.length === 0) {
      setLoadedImagesCache({});
      return;
    }

    const loadedMap: Record<string, HTMLImageElement> = {};
    let count = 0;

    toLoad.forEach((item) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = item.url;
      img.onload = () => {
        if (!active) return;
        loadedMap[item.id] = img;
        count++;
        if (count === toLoad.length) setLoadedImagesCache(loadedMap);
      };
      img.onerror = () => {
        if (!active) return;
        count++;
        if (count === toLoad.length) setLoadedImagesCache(loadedMap);
      };
    });

    return () => {
      active = false;
    };
  }, [adjustedPlayers, teamLogo, teamJersey, managerPhoto]);

  // Render poster whenever options or loaded images change
  useEffect(() => {
    try {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvasRef.current = canvas;

      const dataUrl = renderFormationPoster(
        canvas,
        {
          theme: posterTheme,
          format: posterFormat,
          formation,
          teamName,
          matchTitle: matchTitle.trim() || undefined,
          opponentName: opponentName.trim() || undefined,
          primaryColor,
          gkColor,
          numberColor,
          players: adjustedPlayers,
          teamLogo,
          teamJersey,
          managerName,
          managerPhoto,
          lang: lang as "id" | "en",
          showTacticalLinks,
          showSubstitutes,
          showManager,
          showTacticalZones,
          isEnemyModeActive
        },
        loadedImagesCache
      );

      if (dataUrl) {
        setInstantImageUrl(dataUrl);
      }
    } catch (e) {
      console.error("Gagal merender poster formasi: ", e);
    }
  }, [
    posterTheme,
    posterFormat,
    formation,
    teamName,
    matchTitle,
    opponentName,
    primaryColor,
    gkColor,
    numberColor,
    adjustedPlayers,
    teamLogo,
    teamJersey,
    managerName,
    managerPhoto,
    lang,
    showTacticalLinks,
    showSubstitutes,
    showManager,
    showTacticalZones,
    isEnemyModeActive,
    loadedImagesCache
  ]);

  // Download Poster as PNG
  const handleDownload = (imgUrl: string | null) => {
    if (!imgUrl) return;
    const link = document.createElement("a");
    link.href = imgUrl;
    const sanitizedName = teamName.toLowerCase().replace(/\s+/g, "-");
    link.download = `poster-${sanitizedName}-${formation}-${posterTheme}-${posterFormat}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Image to Clipboard
  const handleCopyToClipboard = async (imgUrl: string | null) => {
    if (!imgUrl) return;
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Clipboard copy failed, downloading instead", err);
      handleDownload(imgUrl);
    }
  };

  // Gemini Imagen Generator
  const handleGenerateAiImage = async () => {
    if (!customApiKey.trim()) {
      setAiError(
        lang === "id"
          ? "Silakan masukkan Google AI Studio API Key di menu Setelan untuk menggunakan fitur AI Imagen."
          : "Please insert your Google AI Studio API Key in Settings to generate AI Imagen artwork."
      );
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch("/api/tactics/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formation,
          teamName,
          primaryColor,
          gkColor,
          customApiKey,
          customPrompt: customPrompt.trim() !== "" ? customPrompt : undefined
        })
      });

      if (!response.ok) {
        const text = await response.text();
        let errMsg = "Gagal membuat gambar dengan AI.";
        try {
          const parsed = JSON.parse(text);
          if (parsed.error) errMsg = typeof parsed.error === "string" ? parsed.error : parsed.error.message;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedAiImageUrl(data.imageUrl);
      } else {
        throw new Error("Format respons tidak valid.");
      }
    } catch (err: any) {
      setAiError(err?.message || "Koneksi ke AI terputus.");
    } finally {
      setAiLoading(false);
    }
  };

  const THEMES: { id: PosterTheme; label: string; tag: string; icon: any; color: string }[] = [
    {
      id: "stadium_neon",
      label: lang === "id" ? "Champions Neon" : "Champions Neon",
      tag: "3D Stadium & Spotlights",
      icon: Trophy,
      color: "from-cyan-500 to-emerald-500"
    },
    {
      id: "gold_heritage",
      label: lang === "id" ? "Gold Prestige" : "Gold Prestige",
      tag: "FUT Golden Shields & Luxury",
      icon: Trophy,
      color: "from-yellow-400 to-amber-600"
    },
    {
      id: "broadcast_pro",
      label: lang === "id" ? "Matchday TV" : "Matchday Live",
      tag: "Sky Sports & Premier Broadcast",
      icon: Tv,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "editorial_studio",
      label: lang === "id" ? "Studio Swiss" : "Studio Swiss",
      tag: "Minimalist Modern Magazine",
      icon: Palette,
      color: "from-slate-400 to-zinc-600"
    },
    {
      id: "retro_vintage",
      label: lang === "id" ? "Calcio 90s" : "Calcio 90s",
      tag: "Nostalgic Classic Striped Lawn",
      icon: Layers,
      color: "from-emerald-600 to-green-700"
    }
  ];

  const FORMATS: { id: PosterFormat; label: string; ratio: string; desc: string }[] = [
    {
      id: "landscape",
      label: lang === "id" ? "Lanskap (4:3)" : "Landscape (4:3)",
      ratio: "4/3",
      desc: "PC / Taktik / YouTube"
    },
    {
      id: "square",
      label: lang === "id" ? "Persegi (1:1)" : "Square (1:1)",
      ratio: "1/1",
      desc: "Instagram / WhatsApp"
    },
    {
      id: "portrait",
      label: lang === "id" ? "Story (9:16)" : "Story (9:16)",
      ratio: "9/16",
      desc: "Reels / WhatsApp Status"
    }
  ];

  return (
    <Interactive3DCard glowColor="rgba(16, 185, 129, 0.45)">
      <div className="p-3.5 sm:p-4 space-y-3.5">
        {/* Compact Widget Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg text-white shadow-md shadow-emerald-500/20">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                {lang === "id" ? "Studio Poster Formasi" : "Formation Poster Studio"}
                <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  PRO HD
                </span>
              </h3>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsStudioOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              title={lang === "id" ? "Buka Studio Lengkap" : "Open Full Studio"}
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden xs:inline">{lang === "id" ? "Buka Studio" : "Studio"}</span>
            </button>
          </div>
        </div>

        {/* Format Selector Pills (Landscape, Square, Portrait) */}
        <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setPosterFormat(fmt.id)}
              className={`py-1 px-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                posterFormat === fmt.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{fmt.label}</span>
              <span className="text-[8px] font-normal opacity-75">{fmt.desc}</span>
            </button>
          ))}
        </div>

        {/* Theme Selector Carousel/Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
          {THEMES.map((th) => {
            const isSelected = posterTheme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => setPosterTheme(th.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black tracking-wide shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-500/20 text-white border-emerald-400/60 ring-1 ring-emerald-400/40 shadow-sm"
                    : "bg-black/30 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${th.color}`} />
                <span>{th.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Poster Image Preview Card */}
        {instantImageUrl && (
          <div className="space-y-2.5">
            <div
              onClick={() => setIsStudioOpen(true)}
              className={`relative group overflow-hidden rounded-2xl border border-emerald-500/20 bg-black/60 flex items-center justify-center cursor-pointer shadow-2xl transition-all hover:border-emerald-400/40 ${
                posterFormat === "landscape"
                  ? "aspect-[4/3]"
                  : posterFormat === "square"
                  ? "aspect-square max-h-[300px]"
                  : "aspect-[9/16] max-h-[360px]"
              }`}
            >
              <img
                src={instantImageUrl}
                alt="Formation Poster Preview"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />

              {/* Hover Overlay Hint */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl">
                  <Maximize2 className="w-3.5 h-3.5" />
                  {lang === "id" ? "Klik untuk Mode Studio HD" : "Click for HD Studio Mode"}
                </span>
              </div>
            </div>

            {/* Action Bar (Download HD & Copy to Clipboard) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDownload(instantImageUrl)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95 uppercase tracking-wider"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === "id" ? "Unduh HD" : "Save PNG"}</span>
              </button>

              <button
                onClick={() => handleCopyToClipboard(instantImageUrl)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 tracking-wider"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === "id" ? "Disalin!" : "Copied!") : lang === "id" ? "Salin Gambar" : "Copy Image"}</span>
              </button>
            </div>
          </div>
        )}

        {/* FULLSCREEN POSTER STUDIO MODAL */}
        <AnimatePresence>
          {isStudioOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
              onClick={() => setIsStudioOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="w-full max-w-6xl max-h-[94vh] bg-[#071912]/98 border border-emerald-500/30 ring-1 ring-emerald-400/20 rounded-3xl p-4 sm:p-6 shadow-[0_30px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col relative text-left overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-emerald-500/20 mb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                      <ImageIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                        {lang === "id" ? "Studio Poster Formasi Digital" : "Digital Formation Poster Studio"}
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 uppercase">
                          {posterTheme.replace("_", " ")}
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-gray-400">
                        {lang === "id"
                          ? "Kustomisasi gaya poster grafis pertandingan berkualitas tinggi untuk media sosial dan papan taktik"
                          : "Customize high-end matchday graphic formation posters for social media and tactical briefings"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(instantImageUrl)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95 uppercase tracking-wider"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{lang === "id" ? "Unduh PNG HD" : "Download HD"}</span>
                    </button>
                    <button
                      onClick={() => setIsStudioOpen(false)}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-sm font-bold border border-white/10"
                      aria-label="Close modal"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Modal Body: Left Canvas Preview, Right Studio Controls */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto pr-1">
                  {/* Left Column: Big Image Preview */}
                  <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/60 border border-white/10 rounded-2xl p-3 relative overflow-hidden group min-h-[380px]">
                    {instantImageUrl ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={instantImageUrl}
                          alt="Poster Big Preview"
                          className="max-h-[68vh] w-auto object-contain rounded-xl shadow-2xl transition-all"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        {lang === "id" ? "Merender poster..." : "Rendering poster..."}
                      </div>
                    )}

                    {/* Format Badge Overlay */}
                    <div className="absolute top-3 left-3 bg-black/75 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-300">
                      {posterFormat.toUpperCase()} ({posterFormat === "landscape" ? "1200x900" : posterFormat === "square" ? "1080x1080" : "1080x1920"})
                    </div>
                  </div>

                  {/* Right Column: Studio Controls & Themes */}
                  <div className="lg:col-span-5 space-y-4 text-left">
                    {/* 1. Format Switcher */}
                    <div>
                      <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block mb-1.5">
                        {lang === "id" ? "Format & Rasio Kanvas" : "Canvas Format & Aspect Ratio"}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                        {FORMATS.map((fmt) => (
                          <button
                            key={fmt.id}
                            onClick={() => setPosterFormat(fmt.id)}
                            className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                              posterFormat === fmt.id
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span>{fmt.label}</span>
                            <span className="text-[8.5px] font-normal opacity-75">{fmt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Theme Selection Grid */}
                    <div>
                      <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block mb-1.5">
                        {lang === "id" ? "Tema & Gaya Visual Poster" : "Poster Theme & Visual Style"}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {THEMES.map((th) => {
                          const isSelected = posterTheme === th.id;
                          return (
                            <button
                              key={th.id}
                              onClick={() => setPosterTheme(th.id)}
                              className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer border flex items-start gap-2.5 ${
                                isSelected
                                  ? "bg-emerald-500/20 text-white border-emerald-400 ring-1 ring-emerald-400/40 shadow-lg"
                                  : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                              }`}
                            >
                              <div className={`w-3 h-3 mt-0.5 rounded-full bg-gradient-to-r ${th.color} shrink-0`} />
                              <div>
                                <div className="text-xs font-black text-white">{th.label}</div>
                                <div className="text-[9px] text-gray-400 leading-tight">{th.tag}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Matchday & Typography Customizer */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-3 space-y-2.5">
                      <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        {lang === "id" ? "Detail Pertandingan & Teks" : "Match Details & Typography"}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9.5px] font-bold text-gray-400 block mb-1">
                            {lang === "id" ? "Judul Laga / Header" : "Matchday Title / Header"}
                          </label>
                          <input
                            type="text"
                            value={matchTitle}
                            onChange={(e) => setMatchTitle(e.target.value)}
                            placeholder="MATCHDAY SQUAD"
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold focus:border-emerald-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9.5px] font-bold text-gray-400 block mb-1">
                            {lang === "id" ? "Lawan / Subtitle (Opsional)" : "Opponent / Subtitle (Optional)"}
                          </label>
                          <input
                            type="text"
                            value={opponentName}
                            onChange={(e) => setOpponentName(e.target.value)}
                            placeholder="VS RIVAL FC"
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. Tactical Layer Toggles */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-3 space-y-2">
                      <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        {lang === "id" ? "Elemen Taktis & Visual" : "Tactical & Visual Elements"}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/15">
                          <input
                            type="checkbox"
                            checked={showTacticalLinks}
                            onChange={(e) => setShowTacticalLinks(e.target.checked)}
                            className="rounded accent-emerald-500"
                          />
                          <span className="text-[10px] font-bold">
                            {lang === "id" ? "Garis Formasi" : "Tactical Links"}
                          </span>
                        </label>

                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/15">
                          <input
                            type="checkbox"
                            checked={showTacticalZones}
                            onChange={(e) => setShowTacticalZones(e.target.checked)}
                            className="rounded accent-emerald-500"
                          />
                          <span className="text-[10px] font-bold">
                            {lang === "id" ? "Zona / Half-Space" : "Tactical Zones"}
                          </span>
                        </label>

                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/15">
                          <input
                            type="checkbox"
                            checked={showSubstitutes}
                            onChange={(e) => setShowSubstitutes(e.target.checked)}
                            className="rounded accent-emerald-500"
                          />
                          <span className="text-[10px] font-bold">
                            {lang === "id" ? "Pemain Cadangan" : "Substitutes"}
                          </span>
                        </label>

                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/15">
                          <input
                            type="checkbox"
                            checked={showManager}
                            onChange={(e) => setShowManager(e.target.checked)}
                            className="rounded accent-emerald-500"
                          />
                          <span className="text-[10px] font-bold">
                            {lang === "id" ? "Badge Pelatih" : "Manager Badge"}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* 5. Quick Export Controls */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(instantImageUrl)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 uppercase tracking-wider active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        {lang === "id" ? "Unduh Gambar HD" : "Save Image (PNG)"}
                      </button>

                      <button
                        onClick={() => handleCopyToClipboard(instantImageUrl)}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? (lang === "id" ? "Tersalin!" : "Copied!") : lang === "id" ? "Salin" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Interactive3DCard>
  );
}
