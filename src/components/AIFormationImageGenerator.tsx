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
  onExternalCloseStudio
}: AIFormationImageGeneratorProps) {
  // Widget Card Mode: "adjuster" (Pengatur Formasi & Lini) vs "poster" (Poster & Grafis HD)
  const [widgetMode, setWidgetMode] = useState<"adjuster" | "poster">("adjuster");

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

  // Fullscreen Studio Modal State
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState<"tactics" | "poster" | "ai_imagen">("tactics");

  useEffect(() => {
    if (externalOpenStudio) {
      setIsStudioOpen(true);
    }
  }, [externalOpenStudio]);

  const handleCloseStudio = () => {
    setIsStudioOpen(false);
    if (onExternalCloseStudio) onExternalCloseStudio();
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
  }, [players, teamLogo, teamJersey, managerPhoto]);

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

  // Render poster whenever options or loaded images change
  // NOTE: Pass `players` directly so `renderFormationPoster` performs single-pass coordinate normalization
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

  // Gemini Imagen Generator
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
      desc: "Reels / Status WA"
    }
  ];

  const renderTacticalAdjusterControls = (isModal = false) => (
    <div className="space-y-3.5">
      {/* 1. Formation Preset Grid */}
      {availableFormations.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-200/90">
              {lang === "id" ? "Pilih Bentuk Formasi Dasar" : "Select Base Formation"}
            </span>
            <span className="text-[11px] font-mono tabular-nums text-teal-300 font-semibold">
              {formation} · {sportMode.toUpperCase()}
            </span>
          </div>

          <div
            className={`grid ${
              isModal ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-3"
            } gap-1.5 max-h-44 overflow-y-auto pr-0.5`}
          >
            {availableFormations.map((item) => {
              const isSelected = formation === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectFormation && onSelectFormation(item.key)}
                  className={`min-h-[42px] px-2 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                    isSelected
                      ? "bg-teal-500/25 border-teal-400 text-white shadow-sm"
                      : "bg-[#051419]/80 border-teal-400/15 text-teal-100/80 hover:border-teal-400/35 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold font-mono tabular-nums tracking-tight whitespace-nowrap">
                      {item.key}
                    </span>
                    <span className="text-[11px] shrink-0">{item.icon}</span>
                  </div>
                  <span className="text-[9.5px] text-teal-200/65 truncate leading-tight">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Formations Saved by User */}
      {customFormations.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-teal-400/15">
          <span className="text-[10.5px] font-bold text-teal-300 block">
            {lang === "id" ? "Formasi Kustom Tersimpan" : "Saved Custom Formations"}
          </span>
          <div className="flex flex-wrap gap-1.5">
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
                    className="px-2.5 py-1.5 text-[11px] font-bold cursor-pointer whitespace-nowrap"
                  >
                    ★ {cf.name}
                  </button>
                  {onDeleteCustomFormation && (
                    <button
                      type="button"
                      onClick={() => onDeleteCustomFormation(cf.id)}
                      className="pr-2 pl-1 py-1.5 text-teal-200/50 hover:text-rose-400 cursor-pointer"
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

      {/* 2. 1-Click Tactical Style Presets */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-teal-200/90 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            {lang === "id" ? "Gaya Taktis Instan (1-Klik)" : "1-Click Tactical Style"}
          </span>
          <button
            type="button"
            onClick={() => onApplyTacticalStyle && onApplyTacticalStyle("balanced")}
            className="text-[10.5px] font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
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
                className={`min-h-[40px] px-2 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center text-center whitespace-nowrap ${
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

      {/* 3. Real-Time Tactical Shape Sliders (Line Height, Team Width, Compactness) */}
      <div className="bg-[#051419]/90 border border-teal-400/20 rounded-2xl p-3 space-y-3">
        {/* Defensive Line Height */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-teal-100 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              {lang === "id" ? "Garis Pertahanan (Line Height)" : "Defensive Line Height"}
            </span>
            <span className="font-mono tabular-nums font-bold text-teal-300">
              {formationShape.lineHeight}% ·{" "}
              {formationShape.lineHeight >= 65
                ? lang === "id"
                  ? "Garis Tinggi"
                  : "High Line"
                : formationShape.lineHeight <= 35
                ? lang === "id"
                  ? "Bertahan Dalam"
                  : "Deep Line"
                : lang === "id"
                ? "Normal"
                : "Medium"}
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
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-teal-100 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              {lang === "id" ? "Lebar Tim (Team Width)" : "Team Width"}
            </span>
            <span className="font-mono tabular-nums font-bold text-teal-300">
              {formationShape.teamWidth}% ·{" "}
              {formationShape.teamWidth >= 65
                ? lang === "id"
                  ? "Melebar"
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
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-teal-100 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-teal-400" />
              {lang === "id" ? "Kerapatan Lini (Compactness)" : "Line Compactness"}
            </span>
            <span className="font-mono tabular-nums font-bold text-teal-300">
              {formationShape.compactness}% ·{" "}
              {formationShape.compactness >= 65
                ? lang === "id"
                  ? "Sangat Rapat"
                  : "Tight"
                : formationShape.compactness <= 35
                ? lang === "id"
                  ? "Merenggang"
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

      {/* 4. Auto-Fit Role & Smart Position Alignment */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#051419]/80 border border-teal-400/15 rounded-2xl p-2.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formationShape.autoFitRoles}
            onChange={(e) =>
              onChangeFormationShape &&
              onChangeFormationShape({ autoFitRoles: e.target.checked })
            }
            className="rounded accent-teal-400 w-4 h-4"
          />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white">
              {lang === "id" ? "Auto-Fit Role Otomatis" : "Auto-Fit Player Roles"}
            </span>
            <span className="text-[9.5px] text-teal-200/65">
              {lang === "id"
                ? "Sesuaikan GK, DEF, MID, FWD saat ganti formasi"
                : "Sync GK, DEF, MID, FWD roles on formation change"}
            </span>
          </div>
        </label>

        {onAutoFitRoles && (
          <button
            type="button"
            onClick={onAutoFitRoles}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/35 text-teal-200 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5 text-teal-300" />
            <span>{lang === "id" ? "Rapikan Posisi" : "Snap & Fit Roles"}</span>
          </button>
        )}
      </div>

      {/* 5. Save Current Pitch Positions as Custom Formation */}
      {onSaveCustomFormation && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <input
            type="text"
            value={customFormName}
            onChange={(e) => setCustomFormName(e.target.value)}
            placeholder={
              lang === "id"
                ? `Simpan rakitan (cth: ${formation} Attack)...`
                : `Save custom layout (e.g. ${formation} Pro)...`
            }
            className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#051419] border border-teal-400/20 text-white text-xs placeholder:text-teal-200/40 focus:border-teal-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSaveCustomClick}
            className="min-h-[38px] px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap shrink-0"
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
    </div>
  );

  return (
    <Interactive3DCard glowColor="rgba(45, 212, 191, 0.35)">
      <div className="p-3.5 sm:p-4 space-y-3.5">
        {/* Compact Widget Header */}
        <div className="flex items-center justify-between border-b border-teal-400/15 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl text-slate-950 flex items-center justify-center shadow-sm">
              <LayoutGrid className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight font-display">
                {lang === "id" ? "Studio Formasi & Poster HD" : "Formation & Poster Studio"}
              </h3>
              <p className="text-[10px] text-teal-200/70">
                {formation} · {tacticalStyleLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsStudioOpen(true)}
            className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-200 border border-teal-400/30 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title={lang === "id" ? "Buka Studio Layar Penuh" : "Open Full Studio"}
          >
            <Maximize2 className="w-3.5 h-3.5 text-teal-300" />
            <span>{lang === "id" ? "Studio Penuh" : "Full Studio"}</span>
          </button>
        </div>

        {/* Mode Switcher Tabs inside Widget: Pengatur Formasi vs Poster HD */}
        <div className="grid grid-cols-2 gap-1 bg-[#051419] p-1 rounded-xl border border-teal-400/20">
          <button
            type="button"
            onClick={() => setWidgetMode("adjuster")}
            className={`min-h-[38px] py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              widgetMode === "adjuster"
                ? "bg-teal-400 text-slate-950 shadow-sm font-extrabold"
                : "text-teal-100/75 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{lang === "id" ? "Atur Formasi & Lini" : "Formation & Lines"}</span>
          </button>

          <button
            type="button"
            onClick={() => setWidgetMode("poster")}
            className={`min-h-[38px] py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              widgetMode === "poster"
                ? "bg-teal-400 text-slate-950 shadow-sm font-extrabold"
                : "text-teal-100/75 hover:text-white"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{lang === "id" ? "Poster & Grafis HD" : "HD Poster"}</span>
          </button>
        </div>

        {/* WIDGET TAB 1: TACTICAL FORMATION & LINE ADJUSTER */}
        {widgetMode === "adjuster" ? (
          renderTacticalAdjusterControls(false)
        ) : (
          /* WIDGET TAB 2: POSTER & GRAPHIC PREVIEW */
          <div className="space-y-3">
            {/* Format Selector Buttons (Landscape, Square, Portrait) */}
            <div className="grid grid-cols-3 gap-1 bg-[#051419] p-1 rounded-xl border border-teal-400/20">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setPosterFormat(fmt.id)}
                  className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center text-center whitespace-nowrap ${
                    posterFormat === fmt.id
                      ? "bg-teal-500 text-slate-950 font-extrabold shadow-sm"
                      : "text-teal-100/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{fmt.label}</span>
                  <span className="text-[8.5px] font-normal opacity-80">{fmt.desc}</span>
                </button>
              ))}
            </div>

            {/* Theme Selector Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
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
                        : "bg-[#051419]/80 text-teal-100/70 border-teal-400/15 hover:border-teal-400/35 hover:text-white"
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
                  className={`relative group overflow-hidden rounded-2xl border border-teal-400/25 bg-[#041014] flex items-center justify-center cursor-pointer shadow-xl transition-all hover:border-teal-400/50 ${
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
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <span className="px-3.5 py-2 rounded-xl bg-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-xl">
                      <Maximize2 className="w-3.5 h-3.5" />
                      {lang === "id" ? "Buka Studio Formasi HD" : "Open HD Formation Studio"}
                    </span>
                  </div>
                </div>

                {/* Action Bar (Download HD & Copy to Clipboard) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(instantImageUrl)}
                    className="min-h-[42px] w-full py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === "id" ? "Unduh PNG HD" : "Save PNG"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(instantImageUrl)}
                    className="min-h-[42px] w-full py-2 bg-[#051419] hover:bg-teal-500/15 text-teal-100 border border-teal-400/25 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-teal-300" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-teal-300" />
                    )}
                    <span>
                      {copied
                        ? lang === "id"
                          ? "Disalin!"
                          : "Copied!"
                        : lang === "id"
                        ? "Salin Gambar"
                        : "Copy Image"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FULLSCREEN FORMATION & POSTER STUDIO MODAL */}
        <AnimatePresence>
          {isStudioOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
              onClick={handleCloseStudio}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-6xl max-h-[94vh] bg-[#06181f] border border-teal-400/30 rounded-3xl p-4 sm:p-6 shadow-[0_28px_70px_rgba(0,0,0,0.85)] flex flex-col relative text-left overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-teal-400/20 mb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                      <LayoutGrid className="w-5 h-5 stroke-[2.4]" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-display">
                        {lang === "id"
                          ? "Studio Formasi Taktis & Poster Digital HD"
                          : "Tactical Formation & HD Poster Studio"}
                      </h2>
                      <p className="text-xs text-teal-200/75">
                        {teamName} · {formation} · {tacticalStyleLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(
                          studioTab === "ai_imagen" && generatedAiImageUrl
                            ? generatedAiImageUrl
                            : instantImageUrl
                        )
                      }
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === "id" ? "Unduh PNG HD" : "Download HD"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseStudio}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-teal-100 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-sm font-bold border border-teal-400/20"
                      aria-label="Close modal"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Modal Body: Left Live Preview, Right Tabbed Controls */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto pr-1 items-stretch">
                  {/* Left Column: Big Interactive Preview */}
                  <div className="lg:col-span-7 flex flex-col justify-between bg-[#041014] border border-teal-400/20 rounded-2xl p-3.5 relative overflow-hidden min-h-[380px]">
                    <div className="flex items-center justify-between gap-2 mb-2 z-10">
                      <span className="text-xs font-mono tabular-nums text-teal-300">
                        {posterFormat.toUpperCase()} ·{" "}
                        {posterFormat === "landscape"
                          ? "1200×900"
                          : posterFormat === "square"
                          ? "1080×1080"
                          : "1080×1920"}{" "}
                        · {formation}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {onAutoFitRoles && (
                          <button
                            type="button"
                            onClick={onAutoFitRoles}
                            className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>{lang === "id" ? "Rapikan Role" : "Auto-Fit Roles"}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyToClipboard(
                              studioTab === "ai_imagen" && generatedAiImageUrl
                                ? generatedAiImageUrl
                                : instantImageUrl
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-teal-300" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>
                            {copied
                              ? lang === "id"
                                ? "Tersalin"
                                : "Copied"
                              : lang === "id"
                              ? "Salin"
                              : "Copy"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center py-1">
                      {studioTab === "ai_imagen" && generatedAiImageUrl ? (
                        <img
                          src={generatedAiImageUrl}
                          alt="AI Generated Formation Artwork"
                          className="max-h-[62vh] w-auto object-contain rounded-xl shadow-2xl"
                          referrerPolicy="no-referrer"
                        />
                      ) : instantImageUrl ? (
                        <img
                          src={instantImageUrl}
                          alt="Poster Big Preview"
                          className="max-h-[62vh] w-auto object-contain rounded-xl shadow-2xl transition-all"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-teal-200/70 text-xs flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                          {lang === "id" ? "Merender poster formasi..." : "Rendering formation poster..."}
                        </div>
                      )}
                    </div>

                    {/* Bottom status bar inside preview */}
                    <div className="mt-2 pt-2 border-t border-teal-400/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-teal-200/75 font-mono tabular-nums">
                      <span>
                        {lang === "id" ? "Garis:" : "Line:"} {formationShape.lineHeight}% ·{" "}
                        {lang === "id" ? "Lebar:" : "Width:"} {formationShape.teamWidth}% ·{" "}
                        {lang === "id" ? "Rapat:" : "Compact:"} {formationShape.compactness}%
                      </span>
                      <span>
                        {players.filter((p) => p.isStarting).length} Starter ·{" "}
                        {players.filter((p) => !p.isStarting).length}{" "}
                        {lang === "id" ? "Cadangan" : "Bench"}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Studio Controls with 3 Tabs */}
                  <div className="lg:col-span-5 flex flex-col gap-4 text-left">
                    {/* Studio Navigation Tabs */}
                    <div className="grid grid-cols-3 gap-1 bg-[#041014] p-1 rounded-2xl border border-teal-400/20 shrink-0">
                      <button
                        type="button"
                        onClick={() => setStudioTab("tactics")}
                        className={`min-h-[40px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                          studioTab === "tactics"
                            ? "bg-teal-400 text-slate-950 font-extrabold shadow-sm"
                            : "text-teal-100/75 hover:text-white"
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{lang === "id" ? "Taktik & Lini" : "Tactics"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudioTab("poster")}
                        className={`min-h-[40px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                          studioTab === "poster"
                            ? "bg-teal-400 text-slate-950 font-extrabold shadow-sm"
                            : "text-teal-100/75 hover:text-white"
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>{lang === "id" ? "Desain Poster" : "Poster Style"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudioTab("ai_imagen")}
                        className={`min-h-[40px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                          studioTab === "ai_imagen"
                            ? "bg-teal-400 text-slate-950 font-extrabold shadow-sm"
                            : "text-teal-100/75 hover:text-white"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Art</span>
                      </button>
                    </div>

                    {/* TAB 1: TACTICS & FORMATION ADJUSTER */}
                    {studioTab === "tactics" && renderTacticalAdjusterControls(true)}

                    {/* TAB 2: POSTER DESIGN & DETAILS */}
                    {studioTab === "poster" && (
                      <div className="space-y-4">
                        {/* 1. Format Switcher */}
                        <div>
                          <label className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block mb-1.5">
                            {lang === "id" ? "Format & Rasio Kanvas" : "Canvas Format & Aspect Ratio"}
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 bg-[#041014] p-1.5 rounded-2xl border border-teal-400/20">
                            {FORMATS.map((fmt) => (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => setPosterFormat(fmt.id)}
                                className={`py-2 px-2 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center text-center whitespace-nowrap ${
                                  posterFormat === fmt.id
                                    ? "bg-teal-400 text-slate-950 font-extrabold shadow-sm"
                                    : "text-teal-100/70 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <span>{fmt.label}</span>
                                <span className="text-[8.5px] font-normal opacity-80">{fmt.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Theme Selection Grid */}
                        <div>
                          <label className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block mb-1.5">
                            {lang === "id" ? "Tema & Gaya Visual Poster" : "Poster Visual Theme"}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {THEMES.map((th) => {
                              const isSelected = posterTheme === th.id;
                              return (
                                <button
                                  key={th.id}
                                  type="button"
                                  onClick={() => setPosterTheme(th.id)}
                                  className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer border flex items-start gap-2.5 ${
                                    isSelected
                                      ? "bg-teal-500/25 text-white border-teal-400 shadow-sm"
                                      : "bg-[#041014]/90 text-teal-100/75 border-teal-400/15 hover:border-teal-400/35 hover:text-white"
                                  }`}
                                >
                                  <div
                                    className={`w-3 h-3 mt-0.5 rounded-full bg-gradient-to-r ${th.color} shrink-0`}
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white truncate">
                                      {th.label}
                                    </div>
                                    <div className="text-[9.5px] text-teal-200/65 truncate">
                                      {th.tag}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. Matchday & Typography Customizer */}
                        <div className="bg-[#041014]/90 border border-teal-400/20 rounded-2xl p-3 space-y-2.5">
                          <div className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" />
                            {lang === "id" ? "Detail Pertandingan & Teks" : "Match Details & Labels"}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-teal-200/80 block mb-1">
                                {lang === "id" ? "Judul Laga / Header" : "Matchday Title"}
                              </label>
                              <input
                                type="text"
                                value={matchTitle}
                                onChange={(e) => setMatchTitle(e.target.value)}
                                placeholder="MATCHDAY SQUAD"
                                className="w-full px-2.5 py-1.5 rounded-xl bg-[#06181f] border border-teal-400/20 text-white text-xs font-bold focus:border-teal-400 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold text-teal-200/80 block mb-1">
                                {lang === "id" ? "Lawan (Opsional)" : "Opponent (Optional)"}
                              </label>
                              <input
                                type="text"
                                value={opponentName}
                                onChange={(e) => setOpponentName(e.target.value)}
                                placeholder="VS RIVAL FC"
                                className="w-full px-2.5 py-1.5 rounded-xl bg-[#06181f] border border-teal-400/20 text-white text-xs font-bold focus:border-teal-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-teal-200/80 block mb-1">
                              {lang === "id" ? "Stadion / Venue (Opsional)" : "Stadium / Venue (Optional)"}
                            </label>
                            <input
                              type="text"
                              value={venueName}
                              onChange={(e) => setVenueName(e.target.value)}
                              placeholder="GELORA BUNG KARNO"
                              className="w-full px-2.5 py-1.5 rounded-xl bg-[#06181f] border border-teal-400/20 text-white text-xs font-bold focus:border-teal-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 4. Tactical Layer Toggles */}
                        <div className="bg-[#041014]/90 border border-teal-400/20 rounded-2xl p-3 space-y-2">
                          <div className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            {lang === "id" ? "Elemen Taktis & Visual" : "Tactical & Visual Layers"}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <label className="flex items-center gap-2 text-teal-100 cursor-pointer bg-[#06181f] p-2 rounded-xl border border-teal-400/15 hover:border-teal-400/35">
                              <input
                                type="checkbox"
                                checked={showTacticalLinks}
                                onChange={(e) => setShowTacticalLinks(e.target.checked)}
                                className="rounded accent-teal-400"
                              />
                              <span className="text-[10.5px] font-semibold">
                                {lang === "id" ? "Garis Antar Lini" : "Tactical Links"}
                              </span>
                            </label>

                            <label className="flex items-center gap-2 text-teal-100 cursor-pointer bg-[#06181f] p-2 rounded-xl border border-teal-400/15 hover:border-teal-400/35">
                              <input
                                type="checkbox"
                                checked={showTacticalZones}
                                onChange={(e) => setShowTacticalZones(e.target.checked)}
                                className="rounded accent-teal-400"
                              />
                              <span className="text-[10.5px] font-semibold">
                                {lang === "id" ? "Koridor Half-Space" : "Half-Space Zones"}
                              </span>
                            </label>

                            <label className="flex items-center gap-2 text-teal-100 cursor-pointer bg-[#06181f] p-2 rounded-xl border border-teal-400/15 hover:border-teal-400/35">
                              <input
                                type="checkbox"
                                checked={showSubstitutes}
                                onChange={(e) => setShowSubstitutes(e.target.checked)}
                                className="rounded accent-teal-400"
                              />
                              <span className="text-[10.5px] font-semibold">
                                {lang === "id" ? "Pemain Cadangan" : "Substitutes"}
                              </span>
                            </label>

                            <label className="flex items-center gap-2 text-teal-100 cursor-pointer bg-[#06181f] p-2 rounded-xl border border-teal-400/15 hover:border-teal-400/35">
                              <input
                                type="checkbox"
                                checked={showManager}
                                onChange={(e) => setShowManager(e.target.checked)}
                                className="rounded accent-teal-400"
                              />
                              <span className="text-[10.5px] font-semibold">
                                {lang === "id" ? "Badge Pelatih" : "Manager Badge"}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: AI STADIUM ARTWORK GENERATOR */}
                    {studioTab === "ai_imagen" && (
                      <div className="bg-[#041014]/90 border border-teal-400/20 rounded-2xl p-4 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-teal-400" />
                            {lang === "id"
                              ? "Generator Ilustrasi Stadion AI"
                              : "AI Stadium Artwork Generator"}
                          </span>
                          <span className="text-[10px] font-mono text-teal-200/70">
                            {customApiKey.trim()
                              ? lang === "id"
                                ? "API Key Siap"
                                : "API Key Ready"
                              : lang === "id"
                              ? "Butuh API Key"
                              : "API Key Needed"}
                          </span>
                        </div>

                        <p className="text-xs text-teal-100/75 leading-relaxed">
                          {lang === "id"
                            ? "Buat visualisasi atmosfer stadion sinematik sesuai formasi dan warna kebanggaan klub Anda menggunakan Gemini Imagen."
                            : "Generate cinematic stadium atmosphere artwork tailored to your club's formation and kit colors."}
                        </p>

                        <div>
                          <label className="text-[10.5px] font-semibold text-teal-200 block mb-1">
                            {lang === "id"
                              ? "Instruksi Gaya Visual Tambahan (Opsional)"
                              : "Custom Visual Prompt (Optional)"}
                          </label>
                          <textarea
                            rows={3}
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder={
                              lang === "id"
                                ? "Contoh: Stadion malam hari dengan lampu sorot toska, koreografi suporter..."
                                : "Example: Night stadium with teal floodlights, dramatic rain..."
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#06181f] border border-teal-400/20 text-white text-xs focus:border-teal-400 focus:outline-none"
                          />
                        </div>

                        {aiError && (
                          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-200 text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1.5">
                              <p>{aiError}</p>
                              {onOpenSettings && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleCloseStudio();
                                    onOpenSettings();
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/25 hover:bg-rose-500/35 text-white font-bold text-[11px] cursor-pointer"
                                >
                                  {lang === "id" ? "Buka Pengaturan API Key" : "Open API Key Settings"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={aiLoading}
                            onClick={handleGenerateAiImage}
                            className="flex-1 min-h-[42px] py-2.5 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>
                              {aiLoading
                                ? lang === "id"
                                  ? "Merender Gambar AI..."
                                  : "Generating AI Image..."
                                : lang === "id"
                                ? "Buat Ilustrasi AI"
                                : "Generate AI Artwork"}
                            </span>
                          </button>

                          {generatedAiImageUrl && (
                            <button
                              type="button"
                              onClick={() => setGeneratedAiImageUrl(null)}
                              className="min-h-[42px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-teal-400/20 text-teal-200 text-xs font-bold cursor-pointer whitespace-nowrap"
                            >
                              {lang === "id" ? "Lihat Poster Vektor" : "Show Vector Poster"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
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
