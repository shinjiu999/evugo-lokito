import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  Maximize2,
  Sliders,
  Palette,
  Layers,
  Tv,
  Trophy,
  Compass,
  RotateCcw,
  Plus,
  Trash2,
  Wand2,
  Shield,
  Zap,
  Target,
  LayoutGrid,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Player,
  FormationShapeConfig,
  TacticalStylePreset,
  CustomFormationTemplate
} from "../types";
import Interactive3DCard from "./Interactive3DCard";
import {
  PosterTheme,
  PosterFormat,
  renderFormationPoster
} from "../utils/formationPosterRenderer";

export interface FormationOptionItem {
  key: string;
  desc: string;
  icon: string;
}

interface AIFormationImageGeneratorProps {
  formation: string;
  sportMode?: "soccer" | "minisoccer" | "futsal" | "custom";
  availableFormations?: FormationOptionItem[];
  onSelectFormation?: (formationKey: string) => void;
  formationShape?: FormationShapeConfig;
  onChangeFormationShape?: (nextShape: Partial<FormationShapeConfig>) => void;
  onApplyTacticalStyle?: (preset: TacticalStylePreset) => void;
  onAutoFitRoles?: () => void;
  customFormations?: CustomFormationTemplate[];
  onSaveCustomFormation?: (name: string) => void;
  onDeleteCustomFormation?: (id: string) => void;
  onApplyCustomFormation?: (template: CustomFormationTemplate) => void;
  onOpenSettings?: () => void;
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
  externalOpenStudio?: boolean;
  onExternalCloseStudio?: () => void;
  externalOpenPosterStudio?: boolean;
  onExternalClosePosterStudio?: () => void;
  viewMode?: "formation-only" | "poster-stage";
  activeSubSection?: "all" | "presets" | "lines";
  onSwitchToPitch?: () => void;
  isPitchFullscreen?: boolean;
}

const DEFAULT_SHAPE: FormationShapeConfig = {
  lineHeight: 50,
  teamWidth: 50,
  compactness: 50,
  stylePreset: "balanced",
  autoFitRoles: true
};

export default function AIFormationImageGenerator({
  formation,
  sportMode = "soccer",
  availableFormations = [],
  onSelectFormation,
  formationShape = DEFAULT_SHAPE,
  onChangeFormationShape,
  onApplyTacticalStyle,
  onAutoFitRoles,
  customFormations = [],
  onSaveCustomFormation,
  onDeleteCustomFormation,
  onApplyCustomFormation,
  onOpenSettings,
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
  isEnemyModeActive = false,
  externalOpenStudio = false,
  onExternalCloseStudio,
  externalOpenPosterStudio = false,
  onExternalClosePosterStudio,
  viewMode = "formation-only",
  activeSubSection = "all",
  onSwitchToPitch,
  isPitchFullscreen = false
}: AIFormationImageGeneratorProps) {
  const [internalStudioTab, setInternalStudioTab] = useState<"presets" | "lines">("presets");
  const effectiveSubTab = activeSubSection === "all" ? internalStudioTab : activeSubSection;
  // Theme & Format State (Default to Soft Sporty Tosca)
  const [posterTheme, setPosterTheme] = useState<PosterTheme>("sporty_tosca");
  const [posterFormat, setPosterFormat] = useState<PosterFormat>("landscape");

  // Tactical & Customization Options for Poster
  const [matchTitle, setMatchTitle] = useState(
    lang === "id" ? "SUSUNAN PEMAIN UTAMA" : "MATCHDAY STARTING XI"
  );
  const [opponentName, setOpponentName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [showTacticalLinks, setShowTacticalLinks] = useState(true);
  const [showSubstitutes, setShowSubstitutes] = useState(true);
  const [showManager, setShowManager] = useState(true);
  const [showTacticalZones, setShowTacticalZones] = useState(false);

  // Custom Formation Name Input
  const [customFormName, setCustomFormName] = useState("");
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Separate Modal States:
  // 1) Studio Formasi Modal (Tactical Formation & Line Adjuster)
  // 2) Studio Poster HD Fullscreen Zoom Modal (optional zoom inside poster stage)
  const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [posterModalTab, setPosterModalTab] = useState<"poster" | "ai_imagen">("poster");

  useEffect(() => {
    if (externalOpenStudio) {
      setIsFormationModalOpen(true);
    }
  }, [externalOpenStudio]);

  useEffect(() => {
    if (externalOpenPosterStudio) {
      setIsPosterModalOpen(true);
    }
  }, [externalOpenPosterStudio]);

  const handleCloseFormationModal = () => {
    setIsFormationModalOpen(false);
    if (onExternalCloseStudio) onExternalCloseStudio();
  };

  const handleClosePosterModal = () => {
    setIsPosterModalOpen(false);
    if (onExternalClosePosterStudio) onExternalClosePosterStudio();
  };

  // Clipboard copy state feedback
  const [copied, setCopied] = useState(false);

  // AI Imagen State
  const [customApiKey, setCustomApiKey] = useState(
    () => localStorage.getItem("tactigen_custom_key") || ""
  );
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedAiImageUrl, setGeneratedAiImageUrl] = useState<string | null>(null);

  // Instant Vector Canvas State
  const [instantImageUrl, setInstantImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedImagesCache, setLoadedImagesCache] = useState<Record<string, HTMLImageElement>>({});

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
    if (viewMode !== "poster-stage" && !isPosterModalOpen) return;
    let active = true;
    const toLoad: { id: string; url: string }[] = [];

    players.forEach((p) => {
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
  }, [players, teamLogo, teamJersey, managerPhoto, viewMode, isPosterModalOpen]);

  const TACTICAL_STYLES: {
    id: TacticalStylePreset;
    label: string;
    shortDesc: string;
    lineHeight: number;
    teamWidth: number;
    compactness: number;
  }[] = [
    {
      id: "balanced",
      label: lang === "id" ? "Seimbang" : "Balanced",
      shortDesc: lang === "id" ? "Struktur standar proporsional" : "Standard balanced shape",
      lineHeight: 50,
      teamWidth: 50,
      compactness: 50
    },
    {
      id: "high-press",
      label: lang === "id" ? "High Press" : "High Press",
      shortDesc: lang === "id" ? "Garis tinggi & rapat menekan lawan" : "High line & compact pressing",
      lineHeight: 78,
      teamWidth: 56,
      compactness: 76
    },
    {
      id: "mid-block",
      label: lang === "id" ? "Mid Block" : "Mid Block",
      shortDesc: lang === "id" ? "Rapat di tengah lapangan" : "Compact midfield block",
      lineHeight: 48,
      teamWidth: 42,
      compactness: 80
    },
    {
      id: "low-block",
      label: lang === "id" ? "Low Block" : "Low Block",
      shortDesc: lang === "id" ? "Pertahanan dalam & sempit" : "Deep & narrow defensive block",
      lineHeight: 22,
      teamWidth: 34,
      compactness: 84
    },
    {
      id: "tiki-taka",
      label: lang === "id" ? "Tiki-Taka" : "Tiki-Taka",
      shortDesc: lang === "id" ? "Jarak antar lini dekat untuk umpan pendek" : "Close support triangles",
      lineHeight: 64,
      teamWidth: 62,
      compactness: 82
    },
    {
      id: "wing-overload",
      label: lang === "id" ? "Sayap Lebar" : "Wide Wings",
      shortDesc: lang === "id" ? "Buka lebar lapangan maksimal" : "Maximum pitch width stretch",
      lineHeight: 60,
      teamWidth: 88,
      compactness: 52
    }
  ];

  const activeStyleObj = TACTICAL_STYLES.find((s) => s.id === formationShape.stylePreset);
  const tacticalStyleLabel =
    formationShape.stylePreset === "custom"
      ? lang === "id"
        ? "Taktik Kustom"
        : "Custom Shape"
      : activeStyleObj?.label;

  // Render poster whenever options or loaded images change (only when poster-stage or modal is active)
  useEffect(() => {
    if (viewMode !== "poster-stage" && !isPosterModalOpen) return;
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
          venueName: venueName.trim() || undefined,
          tacticalStyleLabel,
          primaryColor,
          gkColor,
          numberColor,
          players,
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
    viewMode,
    isPosterModalOpen,
    posterTheme,
    posterFormat,
    formation,
    teamName,
    matchTitle,
    opponentName,
    venueName,
    tacticalStyleLabel,
    primaryColor,
    gkColor,
    numberColor,
    players,
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

  // Save Custom Formation Handler
  const handleSaveCustomClick = () => {
    if (!onSaveCustomFormation) return;
    const trimmed = customFormName.trim() || `${formation} Pro`;
    onSaveCustomFormation(trimmed);
    setCustomFormName("");
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2200);
  };

  // AI Stadium Artwork Generator
  const handleGenerateAiImage = async () => {
    if (!customApiKey.trim()) {
      setAiError(
        lang === "id"
          ? "Silakan masukkan Google AI Studio API Key di menu Pengaturan untuk merender poster AI Stadium."
          : "Please insert your Google AI Studio API Key in Settings to generate AI Stadium artwork."
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
          if (parsed.error)
            errMsg = typeof parsed.error === "string" ? parsed.error : parsed.error.message;
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
      id: "sporty_tosca",
      label: lang === "id" ? "Tosca Sporty" : "Sporty Tosca",
      tag: "Soft Teal Turf & Modern HUD",
      icon: Compass,
      color: "from-teal-400 to-emerald-400"
    },
    {
      id: "stadium_neon",
      label: lang === "id" ? "Champions Neon" : "Champions Neon",
      tag: "3D Stadium & Spotlights",
      icon: Trophy,
      color: "from-cyan-500 to-blue-500"
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

  const FORMATS: { id: PosterFormat; label: string; shortLabel: string; ratio: string; desc: string }[] = [
    {
      id: "landscape",
      label: lang === "id" ? "Lanskap (4:3)" : "Landscape (4:3)",
      shortLabel: "4:3",
      ratio: "4/3",
      desc: "PC / Taktik / YouTube"
    },
    {
      id: "square",
      label: lang === "id" ? "Persegi (1:1)" : "Square (1:1)",
      shortLabel: "1:1",
      ratio: "1/1",
      desc: "Instagram / WhatsApp"
    },
    {
      id: "portrait",
      label: lang === "id" ? "Story (9:16)" : "Story (9:16)",
      shortLabel: "9:16",
      ratio: "9/16",
      desc: "Reels / Status WA"
    }
  ];

  const startingPlayers = players.filter((p) => p.isStarting);
  const roleCounts = {
    GK: startingPlayers.filter((p) => p.role === "GK").length,
    DEF: startingPlayers.filter((p) => p.role === "DEF").length,
    MID: startingPlayers.filter((p) => p.role === "MID").length,
    FWD: startingPlayers.filter((p) => p.role === "FWD").length
  };

  const renderTacticalAdjusterControls = (isModal = false) => {
    const showPresets = isModal || effectiveSubTab === "presets";
    const showLines = isModal || effectiveSubTab === "lines";

    return (
      <div className="space-y-2.5">
        {/* Internal Sub-Tab Switcher when not in modal and activeSubSection is "all" */}
        {!isModal && activeSubSection === "all" && (
          <div className="grid grid-cols-2 gap-1 bg-[#041014] p-1 rounded-xl border border-teal-400/20">
            <button
              type="button"
              onClick={() => setInternalStudioTab("presets")}
              className={`py-1.5 px-2 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                internalStudioTab === "presets"
                  ? "bg-teal-400 text-slate-950 shadow-sm"
                  : "text-teal-100/70 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>{lang === "id" ? "1. Formasi & Rakitan" : "1. Formations"}</span>
            </button>
            <button
              type="button"
              onClick={() => setInternalStudioTab("lines")}
              className={`py-1.5 px-2 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                internalStudioTab === "lines"
                  ? "bg-teal-400 text-slate-950 shadow-sm"
                  : "text-teal-100/70 hover:text-white"
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>{lang === "id" ? "2. Lini & Gaya Taktis" : "2. Lines & Style"}</span>
            </button>
          </div>
        )}

        {/* 1. Formation Preset Grid */}
        {showPresets && availableFormations.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-teal-200/90">
                {lang === "id" ? "Pilih Bentuk Formasi Dasar" : "Select Base Formation"}
              </span>
              <span className="text-[10.5px] font-mono tabular-nums text-teal-300 font-semibold">
                {formation} · {sportMode.toUpperCase()}
              </span>
            </div>

            <div
              className={`grid ${
                isModal ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-3"
              } gap-1.5`}
            >
              {availableFormations.map((item) => {
                const isSelected = formation === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelectFormation && onSelectFormation(item.key)}
                    className={`min-h-[36px] px-2 py-1 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                      isSelected
                        ? "bg-teal-500/25 border-teal-400 text-white shadow-sm"
                        : "bg-[#051419]/80 border-teal-400/15 text-teal-100/80 hover:border-teal-400/35 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-extrabold font-mono tabular-nums tracking-tight whitespace-nowrap">
                        {item.key}
                      </span>
                      <span className="text-[10px] shrink-0">{item.icon}</span>
                    </div>
                    <span className="text-[8.5px] text-teal-200/65 truncate leading-tight">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Formations Saved by User */}
        {showPresets && customFormations.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-teal-400/15">
            <span className="text-[10px] font-bold text-teal-300 block">
              {lang === "id" ? "Formasi Kustom Tersimpan" : "Saved Custom Formations"}
            </span>
            <div className="flex flex-wrap gap-1">
              {customFormations.map((cf) => {
                const isSel = formation === cf.name;
                return (
                  <div
                    key={cf.id}
                    className={`inline-flex items-center rounded-xl border transition-all ${
                      isSel
                        ? "bg-teal-500/25 border-teal-400 text-white"
                        : "bg-[#051419]/90 border-teal-400/20 text-teal-100/85 hover:border-teal-400/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onApplyCustomFormation && onApplyCustomFormation(cf)}
                      className="px-2 py-1 text-[10px] font-bold cursor-pointer whitespace-nowrap"
                    >
                      ★ {cf.name}
                    </button>
                    {onDeleteCustomFormation && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomFormation(cf.id)}
                        className="pr-1.5 pl-1 py-1 text-teal-200/50 hover:text-rose-400 cursor-pointer"
                        title={lang === "id" ? "Hapus formasi kustom" : "Delete custom formation"}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Save Current Pitch Positions as Custom Formation (shown under Presets tab) */}
        {showPresets && onSaveCustomFormation && (
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={customFormName}
              onChange={(e) => setCustomFormName(e.target.value)}
              placeholder={
                lang === "id"
                  ? `Simpan rakitan (cth: ${formation} Attack)...`
                  : `Save custom layout (e.g. ${formation} Pro)...`
              }
              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-[#051419] border border-teal-400/20 text-white text-[11px] placeholder:text-teal-200/40 focus:border-teal-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveCustomClick}
              className="min-h-[34px] px-2.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === "id" ? "Tersimpan" : "Saved"}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === "id" ? "Simpan" : "Save"}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 2. 1-Click Tactical Style Presets */}
        {showLines && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-teal-200/90 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-teal-400" />
                {lang === "id" ? "Gaya Taktis Instan (1-Klik)" : "1-Click Tactical Style"}
              </span>
              <button
                type="button"
                onClick={() => onApplyTacticalStyle && onApplyTacticalStyle("balanced")}
                className="text-[10px] font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === "id" ? "Reset 50%" : "Reset 50%"}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {TACTICAL_STYLES.map((style) => {
                const isSelected = formationShape.stylePreset === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onApplyTacticalStyle && onApplyTacticalStyle(style.id)}
                    title={style.shortDesc}
                    className={`min-h-[34px] px-2 py-1 rounded-xl border text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center text-center whitespace-nowrap ${
                      isSelected
                        ? "bg-teal-400 text-slate-950 border-teal-300 shadow-sm font-extrabold"
                        : "bg-[#051419]/80 border-teal-400/15 text-teal-100/80 hover:border-teal-400/35 hover:text-white"
                    }`}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Real-Time Tactical Shape Sliders (Line Height, Team Width, Compactness) */}
        {showLines && (
          <div className="bg-[#051419]/90 border border-teal-400/20 rounded-2xl p-2.5 space-y-2.5">
            {/* Defensive Line Height */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="font-semibold text-teal-100 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-teal-400" />
                  {lang === "id" ? "Garis Pertahanan" : "Defensive Line"}
                </span>
                <span className="font-mono tabular-nums font-bold text-teal-300">
                  {formationShape.lineHeight}% ·{" "}
                  {formationShape.lineHeight >= 65
                    ? lang === "id"
                      ? "Tinggi"
                      : "High"
                    : formationShape.lineHeight <= 35
                    ? lang === "id"
                      ? "Dalam"
                      : "Deep"
                    : lang === "id"
                    ? "Normal"
                    : "Med"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={formationShape.lineHeight}
                onChange={(e) =>
                  onChangeFormationShape &&
                  onChangeFormationShape({
                    lineHeight: parseInt(e.target.value, 10),
                    stylePreset: "custom"
                  })
                }
                className="w-full accent-teal-400 h-1.5 rounded-lg bg-teal-950 cursor-pointer"
              />
            </div>

            {/* Team Width */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="font-semibold text-teal-100 flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-teal-400" />
                  {lang === "id" ? "Lebar Tim" : "Team Width"}
                </span>
                <span className="font-mono tabular-nums font-bold text-teal-300">
                  {formationShape.teamWidth}% ·{" "}
                  {formationShape.teamWidth >= 65
                    ? lang === "id"
                      ? "Lebar"
                      : "Wide"
                    : formationShape.teamWidth <= 35
                    ? lang === "id"
                      ? "Sempit"
                      : "Narrow"
                    : lang === "id"
                    ? "Seimbang"
                    : "Balanced"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={formationShape.teamWidth}
                onChange={(e) =>
                  onChangeFormationShape &&
                  onChangeFormationShape({
                    teamWidth: parseInt(e.target.value, 10),
                    stylePreset: "custom"
                  })
                }
                className="w-full accent-teal-400 h-1.5 rounded-lg bg-teal-950 cursor-pointer"
              />
            </div>

            {/* Vertical Compactness */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="font-semibold text-teal-100 flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-teal-400" />
                  {lang === "id" ? "Kerapatan Lini" : "Compactness"}
                </span>
                <span className="font-mono tabular-nums font-bold text-teal-300">
                  {formationShape.compactness}% ·{" "}
                  {formationShape.compactness >= 65
                    ? lang === "id"
                      ? "Rapat"
                      : "Tight"
                    : formationShape.compactness <= 35
                    ? lang === "id"
                      ? "Renggang"
                      : "Stretched"
                    : lang === "id"
                    ? "Ideal"
                    : "Standard"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={formationShape.compactness}
                onChange={(e) =>
                  onChangeFormationShape &&
                  onChangeFormationShape({
                    compactness: parseInt(e.target.value, 10),
                    stylePreset: "custom"
                  })
                }
                className="w-full accent-teal-400 h-1.5 rounded-lg bg-teal-950 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 4. Auto-Fit Role & Smart Position Alignment */}
        {showLines && (
          <div className="flex items-center justify-between gap-2 bg-[#051419]/80 border border-teal-400/15 rounded-2xl p-2">
            <label className="flex items-center gap-2 cursor-pointer select-none min-w-0">
              <input
                type="checkbox"
                checked={formationShape.autoFitRoles}
                onChange={(e) =>
                  onChangeFormationShape &&
                  onChangeFormationShape({ autoFitRoles: e.target.checked })
                }
                className="rounded accent-teal-400 w-3.5 h-3.5 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[10.5px] font-bold text-white truncate">
                  {lang === "id" ? "Auto-Fit Role" : "Auto-Fit Roles"}
                </span>
                <span className="text-[9px] text-teal-200/65 truncate">
                  {lang === "id" ? "Sinkron GK/DEF/MID/FWD" : "Sync GK/DEF/MID/FWD"}
                </span>
              </div>
            </label>

            {onAutoFitRoles && (
              <button
                type="button"
                onClick={onAutoFitRoles}
                className="min-h-[34px] px-2.5 py-1 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/35 text-teal-200 text-[10.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5 text-teal-300" />
                <span>{lang === "id" ? "Rapikan" : "Snap Fit"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // MODE A: POSTER-STAGE (DITEMPATKAN DI ZONA LAPANGAN DENGAN UKURAN MAKSIMAL)
  // =========================================================================
  if (viewMode === "poster-stage") {
    const activePosterUrl =
      posterModalTab === "ai_imagen" && generatedAiImageUrl
        ? generatedAiImageUrl
        : instantImageUrl;

    return (
      <div className="w-full flex flex-col items-center gap-2.5 animate-fadeIn">
        {/* 1. BAR KONTROL RINGKAS ATAS POSTER (TEMA, RASIO KANVAS, & TAB AI STADION) */}
        <div
          id="poster-top-control-bar"
          role="toolbar"
          aria-label={lang === "id" ? "Bar pengaturan atas poster HD" : "Poster HD top control bar"}
          className="w-full bg-[#071c22]/95 border border-teal-400/25 rounded-2xl p-2.5 flex flex-col gap-2 shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          {/* Row 1: Mode Render (Vektor Instan vs AI Stadion) + Rasio Kanvas (4:3, 1:1, 9:16) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Render Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#041014] p-1 rounded-xl border border-teal-400/20">
              <button
                type="button"
                onClick={() => setPosterModalTab("poster")}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  posterModalTab === "poster"
                    ? "bg-teal-400 text-slate-950 font-extrabold shadow-sm"
                    : "text-teal-100/75 hover:text-white"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{lang === "id" ? "Poster Lineup HD" : "Lineup Poster HD"}</span>
              </button>

              <button
                type="button"
                onClick={() => setPosterModalTab("ai_imagen")}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  posterModalTab === "ai_imagen"
                    ? "bg-teal-400 text-slate-950 font-extrabold shadow-sm"
                    : "text-teal-100/75 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === "id" ? "AI Stadion" : "AI Stadium"}</span>
              </button>
            </div>

            {/* Aspect Ratio Selector (4:3 | 1:1 | 9:16) */}
            <div className="flex items-center gap-1 bg-[#041014] p-1 rounded-xl border border-teal-400/20">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setPosterFormat(fmt.id)}
                  title={`${fmt.label} — ${fmt.desc}`}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono tabular-nums font-bold transition-all cursor-pointer whitespace-nowrap ${
                    posterFormat === fmt.id
                      ? "bg-teal-500 text-slate-950 font-extrabold shadow-sm"
                      : "text-teal-100/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {fmt.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Theme Carousel (when in Vector Poster mode) or AI Prompt Bar (when in AI Stadium mode) */}
          {posterModalTab === "poster" ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {THEMES.map((th) => {
                const isSelected = posterTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setPosterTheme(th.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? "bg-teal-500/25 text-white border-teal-400 shadow-sm"
                        : "bg-[#041014]/90 text-teal-100/75 border-teal-400/15 hover:border-teal-400/40 hover:text-white"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${th.color}`} />
                    <span>{th.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={
                    lang === "id"
                      ? "Instruksi atmosfer stadion AI (opsional, cth: Stadion malam lampu sorot toska)..."
                      : "Custom AI stadium prompt (optional, e.g. Night stadium with teal floodlights)..."
                  }
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-[#041014] border border-teal-400/25 text-white text-xs placeholder:text-teal-200/40 focus:border-teal-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleGenerateAiImage}
                  className="min-h-[34px] px-3 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {aiLoading
                      ? lang === "id"
                        ? "Merender..."
                        : "Rendering..."
                      : lang === "id"
                      ? "Render AI"
                      : "Generate AI"}
                  </span>
                </button>
              </div>
              {aiError && (
                <div className="px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-200 text-[11px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{aiError}</span>
                  </div>
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="px-2 py-0.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/40 text-white font-bold text-[10px] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {lang === "id" ? "Atur API Key" : "API Settings"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. PANGGUNG KANVAS POSTER HD (AUTO-RESIZE MENGIKUTI LAYAR PC TANPA SCROLL) */}
        <div
          id="tacticalPitchWrapper"
          className={`relative w-full rounded-3xl border-2 border-teal-400/35 bg-[#041014] shadow-[0_22px_60px_rgba(0,0,0,0.75)] overflow-hidden flex items-center justify-center transition-all duration-300 ${
            isPitchFullscreen
              ? "max-h-[76vh] min-h-[320px]"
              : posterFormat === "landscape"
              ? "aspect-[4/3] max-h-[calc(100vh-265px)]"
              : posterFormat === "square"
              ? "aspect-square max-h-[calc(100vh-265px)]"
              : "aspect-[3/4] sm:aspect-[9/14] max-h-[calc(100vh-265px)]"
          }`}
        >
          {/* Subtle Stadium Grid Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.1)_0%,transparent_70%)] pointer-events-none" />

          {activePosterUrl ? (
            <img
              src={activePosterUrl}
              alt={`${teamName} ${formation} Poster HD`}
              className="w-full h-full object-contain select-none"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-teal-200/80 text-xs flex flex-col items-center gap-2 py-16">
              <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span>
                {lang === "id"
                  ? "Merender Studio Poster Lineup HD..."
                  : "Rendering HD Lineup Poster Studio..."}
              </span>
            </div>
          )}
        </div>

        {/* 3. BAR KONTROL RINGKAS BAWAH POSTER (TEKS LAGA, TOGGLE ELEMEN, & UNDUH/SALIN) */}
        <div
          id="poster-bottom-control-bar"
          role="toolbar"
          aria-label={lang === "id" ? "Bar pengaturan bawah poster HD" : "Poster HD bottom control bar"}
          className="w-full bg-[#071c22]/95 border border-teal-400/25 rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          {/* Compact Match Info Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <input
              type="text"
              value={matchTitle}
              onChange={(e) => setMatchTitle(e.target.value)}
              placeholder={lang === "id" ? "Judul (cth: STARTING XI)" : "Matchday Title"}
              aria-label={lang === "id" ? "Judul Pertandingan" : "Matchday Title"}
              className="w-full px-2.5 py-1.5 rounded-xl bg-[#041014] border border-teal-400/20 text-white text-[11px] font-bold placeholder:text-teal-200/40 focus:border-teal-400 focus:outline-none"
            />
            <input
              type="text"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder={lang === "id" ? "Lawan (cth: VS RIVAL FC)" : "Opponent (e.g. VS RIVAL FC)"}
              aria-label={lang === "id" ? "Nama Tim Lawan" : "Opponent Name"}
              className="w-full px-2.5 py-1.5 rounded-xl bg-[#041014] border border-teal-400/20 text-white text-[11px] font-bold placeholder:text-teal-200/40 focus:border-teal-400 focus:outline-none"
            />
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder={lang === "id" ? "Stadion / Venue Laga" : "Stadium / Venue"}
              aria-label={lang === "id" ? "Nama Stadion" : "Stadium Venue"}
              className="w-full px-2.5 py-1.5 rounded-xl bg-[#041014] border border-teal-400/20 text-white text-[11px] font-bold placeholder:text-teal-200/40 focus:border-teal-400 focus:outline-none"
            />
          </div>

          {/* Visual Layer Toggles + Primary Export Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-teal-400/15">
            {/* Layer Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                {
                  key: "links",
                  active: showTacticalLinks,
                  toggle: () => setShowTacticalLinks(!showTacticalLinks),
                  label: lang === "id" ? "Garis Lini" : "Line Links"
                },
                {
                  key: "zones",
                  active: showTacticalZones,
                  toggle: () => setShowTacticalZones(!showTacticalZones),
                  label: lang === "id" ? "Zona Taktis" : "Zones"
                },
                {
                  key: "subs",
                  active: showSubstitutes,
                  toggle: () => setShowSubstitutes(!showSubstitutes),
                  label: lang === "id" ? "Cadangan" : "Bench"
                },
                {
                  key: "coach",
                  active: showManager,
                  toggle: () => setShowManager(!showManager),
                  label: lang === "id" ? "Pelatih" : "Coach"
                }
              ].map((layer) => (
                <button
                  key={layer.key}
                  type="button"
                  onClick={layer.toggle}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    layer.active
                      ? "bg-teal-500/25 border-teal-400/60 text-teal-100"
                      : "bg-[#041014] border-teal-400/15 text-teal-200/50 hover:text-white"
                  }`}
                >
                  {layer.active ? "✓ " : ""}
                  {layer.label}
                </button>
              ))}
            </div>

            {/* Action Buttons: Copy & Download HD */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => handleCopyToClipboard(activePosterUrl)}
                className="min-h-[38px] px-3 py-1.5 bg-[#041014] hover:bg-teal-500/15 text-teal-100 border border-teal-400/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-teal-300" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-teal-300" />
                )}
                <span>
                  {copied
                    ? lang === "id"
                      ? "Tersalin!"
                      : "Copied!"
                    : lang === "id"
                    ? "Salin"
                    : "Copy"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload(activePosterUrl)}
                className="min-h-[38px] px-3.5 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === "id" ? "Unduh PNG HD" : "Download HD"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODE B: FORMATION-ONLY (PANEL STUDIO FORMASI & LINI DI KOLOM SAMPING)
  // =========================================================================
  return (
    <div className="flex flex-col gap-4">
      {/* CARD: STUDIO FORMASI & LINI TAKTIS (MURNI FUNGSI TAKTIS LAPANGAN) */}
      <Interactive3DCard glowColor="rgba(45, 212, 191, 0.35)">
        <div className="p-3.5 sm:p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-teal-400/15 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl text-slate-950 flex items-center justify-center shadow-sm">
                <Sliders className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight font-display">
                  {lang === "id" ? "Studio Formasi & Lini" : "Formation & Line Studio"}
                </h3>
                <p className="text-[10px] text-teal-200/70">
                  {formation} · {tacticalStyleLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFormationModalOpen(true)}
              className="min-h-[34px] px-2.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-200 border border-teal-400/30 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title={lang === "id" ? "Buka Studio Formasi Layar Penuh" : "Open Full Formation Studio"}
            >
              <Maximize2 className="w-3.5 h-3.5 text-teal-300" />
              <span>{lang === "id" ? "Buka Studio" : "Open Studio"}</span>
            </button>
          </div>

          {renderTacticalAdjusterControls(false)}
        </div>
      </Interactive3DCard>

      {/* MODAL: STUDIO FORMASI & LINI TAKTIS (MURNI REKAYASA FORMASI) */}
      <AnimatePresence>
        {isFormationModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
            onClick={handleCloseFormationModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-5xl max-h-[92vh] bg-[#06181f] border border-teal-400/30 rounded-3xl p-4 sm:p-6 shadow-[0_28px_70px_rgba(0,0,0,0.85)] flex flex-col relative text-left overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-teal-400/20 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                    <Sliders className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-display">
                      {lang === "id"
                        ? "Studio Formasi & Lini Taktis"
                        : "Tactical Formation & Line Studio"}
                    </h2>
                    <p className="text-xs text-teal-200/75">
                      {teamName} · {formation} · {tacticalStyleLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onAutoFitRoles && (
                    <button
                      type="button"
                      onClick={onAutoFitRoles}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>{lang === "id" ? "Rapikan Posisi" : "Auto-Fit Roles"}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseFormationModal}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-teal-100 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-sm font-bold border border-teal-400/20"
                    aria-label="Close Formation Studio"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body: Left Live Formation Diagram & Telemetry, Right Adjuster Controls */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto pr-1 items-start">
                {/* Left Column: Live Tactical Pitch Shape Diagram & Role Distribution */}
                <div className="lg:col-span-5 flex flex-col gap-3.5 bg-[#041014] border border-teal-400/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between border-b border-teal-400/15 pb-2">
                    <span className="text-xs font-extrabold text-teal-200 uppercase tracking-wider">
                      {lang === "id" ? "Peta Struktur Lini" : "Live Line Structure"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-teal-400/20 border border-teal-400/40 text-teal-200 font-mono text-xs font-extrabold">
                      {formation}
                    </span>
                  </div>

                  {/* Mini Interactive Tactical Pitch Visualizer */}
                  <div className="relative w-full aspect-[3/4] max-h-[340px] mx-auto rounded-2xl bg-gradient-to-b from-[#07262e] via-[#09303a] to-[#07262e] border border-teal-400/30 overflow-hidden shadow-inner">
                    {/* Pitch markings */}
                    <div className="absolute inset-2.5 border border-teal-300/25 rounded-lg pointer-events-none" />
                    <div className="absolute left-2.5 right-2.5 top-1/2 h-px bg-teal-300/25 pointer-events-none" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-teal-300/25 pointer-events-none" />
                    {/* Defensive Line Indicator */}
                    <div
                      className="absolute left-2.5 right-2.5 border-t-2 border-dashed border-teal-400/60 transition-all duration-200 pointer-events-none flex items-center justify-end pr-2"
                      style={{ top: `${Math.max(15, Math.min(85, 88 - formationShape.lineHeight * 0.55))}%` }}
                    >
                      <span className="text-[8.5px] font-mono font-bold text-teal-200 bg-[#041014]/90 px-1.5 py-0.5 rounded -mt-4 border border-teal-400/30">
                        LINE {formationShape.lineHeight}%
                      </span>
                    </div>

                    {/* Starting Players Nodes */}
                    {startingPlayers.map((p) => {
                      const normX = p.x <= 1.2 ? p.x * 100 : p.x;
                      const normY = p.y <= 1.2 ? p.y * 100 : p.y;
                      return (
                        <div
                          key={p.id}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-200"
                          style={{
                            left: `${Math.max(8, Math.min(92, normX))}%`,
                            top: `${Math.max(8, Math.min(92, normY))}%`
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shadow-md border border-white/80"
                            style={{
                              backgroundColor: p.role === "GK" ? gkColor : primaryColor,
                              color: numberColor
                            }}
                          >
                            {p.number}
                          </div>
                          <span className="mt-0.5 px-1 rounded bg-black/75 text-[8px] font-bold text-white truncate max-w-[54px]">
                            {p.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Role Distribution Summary */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[
                      { role: "GK", count: roleCounts.GK, color: "text-amber-300 border-amber-400/30 bg-amber-500/10" },
                      { role: "DEF", count: roleCounts.DEF, color: "text-teal-300 border-teal-400/30 bg-teal-500/10" },
                      { role: "MID", count: roleCounts.MID, color: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10" },
                      { role: "FWD", count: roleCounts.FWD, color: "text-cyan-300 border-cyan-400/30 bg-cyan-500/10" }
                    ].map((r) => (
                      <div
                        key={r.role}
                        className={`rounded-xl border p-2 flex flex-col items-center justify-center ${r.color}`}
                      >
                        <span className="text-[9px] font-black uppercase">{r.role}</span>
                        <span className="text-sm font-extrabold font-mono">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Full Formation & Line Adjuster Controls */}
                <div className="lg:col-span-7">
                  {renderTacticalAdjusterControls(true)}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


