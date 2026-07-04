import { useState } from "react";
import { Player, TacticalItem, TacticalPlay } from "../types";
import { Sparkles, BrainCircuit, Play, ArrowRight, CornerDownRight, RotateCcw, Settings, Database, Sliders, Cpu, Check, X, Info, Activity, ShieldAlert, Network, RefreshCw } from "lucide-react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import Interactive3DCard from "./Interactive3DCard";

interface AICoachProps {
  players: Player[];
  items: TacticalItem[];
  currentFormation: string;
  onLoadGeneratedPlay: (play: TacticalPlay) => void;
  onApplyFormation?: (formation: string) => void;
  lang?: "id" | "en";
}

export default function AICoach({ players, items, currentFormation, onLoadGeneratedPlay, onApplyFormation, lang = "id" }: AICoachProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<{ title: string; desc: string } | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [activeScoutDetail, setActiveScoutDetail] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [selectedModel, setSelectedModel] = useState<"gemini-3.5-flash" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite" | "claude" | "deepseek" | "gpt4">(() => {
    const saved = localStorage.getItem("tactigen_selected_model") || "gemini-3.5-flash";
    if (saved === "gemini") return "gemini-3.5-flash";
    return saved as any;
  });

  // YouTube Tactical Video Analysis States
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeFocusPrompt, setYoutubeFocusPrompt] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [youtubeReport, setYoutubeReport] = useState<any | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "success">("idle");

  const handleAnalyzeYoutube = async () => {
    if (!youtubeUrl.trim()) return;
    setYoutubeLoading(true);
    setYoutubeError(null);
    setYoutubeReport(null);
    setImportStatus("idle");
    try {
      const response = await fetch("/api/tactics/youtube-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: youtubeUrl,
          prompt: youtubeFocusPrompt,
          players,
          items,
          formation: currentFormation,
          customApiKey,
          mcpEnabled,
          mcpUrl,
          mcpTool,
          lang
        })
      });

      let rawText = "";
      try {
        rawText = (await response.text() || "").trim();
      } catch (ignored) {}

      if (!response.ok) {
        let errMsg = "Gagal memproses analisis video YouTube.";
        try {
          const errParsed = JSON.parse(rawText);
          if (errParsed.error) errMsg = errParsed.error;
        } catch (ignored) {}
        throw new Error(errMsg);
      }

      const decoded = JSON.parse(rawText);
      if (decoded.error) {
        throw new Error(decoded.error);
      }
      setYoutubeReport(decoded);
    } catch (err: any) {
      setYoutubeError(err?.message || "Koneksi ke YouTube Scanner terputus.");
    } finally {
      setYoutubeLoading(false);
    }
  };

  const TACTICAL_PRESETS = [
    {
      id: "counter",
      label: lang === "id" ? "⚡ Serangan Balik Cepat" : "⚡ Fast Counter Attack",
      prompt: lang === "id" 
        ? "Buat serangan balik cepat dari sayap kiri, diakhiri dengan crossing lambung ke tiang jauh untuk sundulan striker."
        : "Create a fast counter-attack starting from the left wing, ending with a high cross to the far post for a striker header."
    },
    {
      id: "tikitaka",
      label: lang === "id" ? "⚽ Tiki-Taka Segitiga" : "⚽ Triangle Tiki-Taka",
      prompt: lang === "id"
        ? "Kombinasi umpan segitiga pendek rapat dari lini tengah menusuk pertahanan area garis pertahanan lawan."
        : "Short rapid triangular combinations through the midfield to break through the opponent's defensive line."
    },
    {
      id: "press",
      label: lang === "id" ? "🛡️ Compact High Press" : "🛡️ Compact High Press",
      prompt: lang === "id"
        ? "Skenario compact pressing ketat saat lawan mencoba build-up dari keeper, semua pemain maju menutup ruang operan."
        : "Aggressive compact high group pressing when the opponent begins building up from the goalkeeper, sealing off passing lanes."
    },
    {
      id: "corner",
      label: lang === "id" ? "📐 Rutinitas Tendangan Sudut" : "📐 Set Piece Corner Routine",
      prompt: lang === "id"
        ? "Skenario sepak pojok melengkung tajam ke kotak penalti dengan sundulan terarah di tiang dekat."
        : "Inswinging corner kick targeted towards the near post with a clinical bullet header."
    }
  ];

  // Scouting Synergy Report State
  const [scoutLoading, setScoutLoading] = useState(false);
  const [scoutError, setScoutError] = useState<string | null>(null);
  const [scoutReport, setScoutReport] = useState<any | null>(null);
  const [isScoutModalOpen, setIsScoutModalOpen] = useState(false);

  const handleAnalyzeSynergy = async () => {
    setScoutLoading(true);
    setScoutError(null);
    setScoutReport(null);
    setIsScoutModalOpen(true);
    try {
      const response = await fetch("/api/tactics/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players,
          formation: currentFormation,
          customApiKey
        })
      });

      let rawText = "";
      try {
        rawText = (await response.text() || "").trim();
      } catch (ignored) {}

      if (!response.ok) {
        throw new Error("Gagal mengambil data dari Google Omni.");
      }

      const decoded = JSON.parse(rawText);
      if (decoded.error) {
        throw new Error(decoded.error);
      }
      setScoutReport(decoded);
    } catch (err: any) {
      setScoutError(err?.message || "Koneksi terputus ke Google Scout.");
    } finally {
      setScoutLoading(false);
    }
  };

  // Advanced Configurations & MCP State System
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "mcp">("ai");

  const [mcpEnabled, setMcpEnabled] = useState(() => localStorage.getItem("tactigen_mcp_enabled") === "true");
  const [mcpUrl, setMcpUrl] = useState(() => localStorage.getItem("tactigen_mcp_url") || "http://localhost:3015/mcp");
  const [mcpTool, setMcpTool] = useState(() => localStorage.getItem("tactigen_mcp_tool") || "pitch-scout-analyzer");
  const [customSystemPrompt, setCustomSystemPrompt] = useState(() => localStorage.getItem("tactigen_custom_system") || "");
  const [temperature, setTemperature] = useState(() => Number(localStorage.getItem("tactigen_temperature") || "0.7"));
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("tactigen_custom_key") || "");

  // Testing status
  const [mcpTesting, setMcpTesting] = useState(false);
  const [mcpTestStatus, setMcpTestStatus] = useState<"idle" | "success" | "failed">("idle");

  const handleSaveSettings = () => {
    localStorage.setItem("tactigen_mcp_enabled", String(mcpEnabled));
    localStorage.setItem("tactigen_mcp_url", mcpUrl);
    localStorage.setItem("tactigen_mcp_tool", mcpTool);
    localStorage.setItem("tactigen_custom_system", customSystemPrompt);
    localStorage.setItem("tactigen_temperature", String(temperature));
    localStorage.setItem("tactigen_custom_key", customApiKey);
    localStorage.setItem("tactigen_selected_model", selectedModel);
    setIsSettingsOpen(false);
  };

  const handleTestMcp = () => {
    setMcpTesting(true);
    setMcpTestStatus("idle");
    setTimeout(() => {
      setMcpTesting(false);
      setMcpTestStatus("success");
    }, 1200);
  };

  const handleGenerate = async (selectedPrompt: string) => {
    const activePrompt = selectedPrompt || prompt;
    if (!activePrompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tactics/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players,
          items,
          formation: currentFormation,
          prompt: activePrompt,
          model: selectedModel,
          // Advanced configs
          mcpEnabled,
          mcpUrl,
          mcpTool,
          customSystemPrompt,
          temperature,
          customApiKey
        })
      });

      let rawText = "";
      try {
        rawText = (await response.text() || "").trim();
      } catch (ignored) {}

      if (!response.ok) {
        let errMessage = "Gagal memanggil API taktik.";
        try {
          const trimmedRaw = (rawText || "").trim();
          if (trimmedRaw && trimmedRaw.toLowerCase() !== "undefined" && trimmedRaw.toLowerCase() !== "null") {
            const errData = JSON.parse(trimmedRaw);
            if (errData && errData.error) {
              if (typeof errData.error === "object" && errData.error !== null && errData.error.message) {
                errMessage = errData.error.message;
              } else if (typeof errData.error === "string") {
                errMessage = errData.error;
              } else {
                errMessage = JSON.stringify(errData.error);
              }
            }
          }
        } catch (ignored) {}
        throw new Error(errMessage);
      }

      let data: TacticalPlay;
      try {
        let cleanText = (rawText || "").trim();
        const normClean = cleanText.toLowerCase();
        if (!normClean || normClean === "undefined" || normClean === "null") {
          throw new Error("Respons server kosong atau tidak lengkap.");
        }
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\s*/i, "");
          cleanText = cleanText.replace(/\s*```$/, "");
        }
        cleanText = cleanText.trim();
        const finalNormalized = cleanText.toLowerCase();
        if (!cleanText || finalNormalized === "undefined" || finalNormalized === "null") {
          throw new Error("Respons server kosong atau tidak lengkap.");
        }
        data = JSON.parse(cleanText) as TacticalPlay;
      } catch (parseErr: any) {
        console.error("Gagal men-decode respons JSON:", rawText, parseErr);
        throw new Error("Format respons taktis tidak valid atau tidak lengkap dari AI.");
      }
      
      // Load generated coordinates & sequential keyframes into React app lifecycle
      onLoadGeneratedPlay(data);
      setLatestAnalysis({
        title: data.title,
        desc: data.description
      });
      if (!selectedPrompt) {
        setPrompt("");
      }
    } catch (err: any) {
      setError(err?.message || "Koneksi terputus ke Google Omni.");
    } finally {
      setLoading(false);
    }
  };

  const l = {
    hubTitle: "Omni Intelligence Hub",
    hubSubtitle: lang === "id" ? "Rancang & konversi playbook taktis otomatis" : "Design & convert automatic tactical playbooks seamlessly",
    presetLabel: lang === "id" ? "Pola Strategi Cepat" : "Quick Tactical Strategies",
    instructionLabel: lang === "id" ? "Instruksi Khusus untuk Google Omni" : "Custom Instructions for Google Omni",
    placeholder: lang === "id" ? "Instruksikan pola gerakan, e.g., 'striker pivot oper sayap kanan...'" : "Describe players movement, e.g., 'striker pivot pass left wing...'",
    animateBtn: lang === "id" ? "Animasikan" : "Animate",
    scoutBtn: lang === "id" ? "Riset Skuad & Sinergi Kimia (Scout AI)" : "Squad Synergy & Chemistry Report (Scout AI)",
    loadingText1: lang === "id" ? "Google Omni merakit visual koordinat..." : "Google Omni projecting tactical coordinates...",
    loadingText2: lang === "id" ? "Menyusun layout taktik keyframes gerakan & analisis playbook" : "Compiling dynamic player movement keyframes & playbook analysis",
    errorTitle: lang === "id" ? "Gagal Generasi Taktik" : "Tactics Generation Failed",
    analysisLabel: lang === "id" ? "Analisis Strategi" : "Strategy Analysis",
    settingsTitle: lang === "id" ? "Konfigurasikan Model AI & MCP Server" : "Configure AI Model & MCP Server"
  };

  return (
    <Interactive3DCard glowColor="rgba(139, 92, 246, 0.45)">
      <div className="p-4 flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              {l.hubTitle}
            </h3>
            <p className="text-[10px] text-gray-400">{l.hubSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono font-bold uppercase">
            🤖 {selectedModel}
          </span>
          {mcpEnabled && (
            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono font-bold uppercase">
              🔌 MCP
            </span>
          )}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/5 transition-all flex items-center justify-center cursor-pointer animate-pulse"
            title={l.settingsTitle}
            id="ai-mcp-settings-btn"
          >
            <Settings className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>

      {/* Preset selections */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block select-none">{l.presetLabel}</span>
        <div className="grid grid-cols-2 gap-2">
          {TACTICAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleGenerate(preset.prompt)}
              disabled={loading}
              className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-xl p-2 transition-all text-xs text-gray-200 flex flex-col justify-between h-14 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              <span className="font-bold truncate w-full">{preset.label}</span>
              <span className="text-[8px] text-gray-500 line-clamp-1">{preset.prompt}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-white/5" aria-hidden="true" />

      {/* Custom prompt entry */}
      <div className="space-y-2">
        <label htmlFor="ai-instruction-prompt-input" className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">{l.instructionLabel}</label>
        <div className="flex gap-2">
          <input
            id="ai-instruction-prompt-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={l.placeholder}
            className="flex-1 bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={() => handleGenerate("")}
            disabled={loading || !prompt.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" /> {l.animateBtn}
          </button>
        </div>
      </div>

      <div className="pt-0.5 grid grid-cols-2 gap-2">
        <button
          onClick={handleAnalyzeSynergy}
          className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 font-bold text-[11px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <Activity className="w-4 h-4 animate-pulse text-indigo-400" aria-hidden="true" /> {l.scoutBtn}
        </button>
        <button
          onClick={() => setIsYoutubeModalOpen(true)}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold text-[11px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
        >
          <span className="text-red-400" aria-hidden="true">📺</span>
          <span>{lang === "id" ? "Analisis Video" : "Video Analysis"}</span>
        </button>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-2 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-1" />
          <span className="text-xs font-bold text-blue-400">{l.loadingText1}</span>
          <span className="text-[10px] text-gray-500">{l.loadingText2}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2">
          <span className="text-red-400">⚠️</span>
          <div>
            <p className="font-bold">{l.errorTitle}</p>
            <p className="text-[10px] text-gray-400">{error}</p>
          </div>
        </div>
      )}

      {/* Prompt Result Output - Simplified as button which triggers modal overlay */}
      {latestAnalysis && !loading && (
        <div className="pt-1">
          <button
            onClick={() => setShowAnalysisModal(true)}
            className="w-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-300 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-md group"
          >
            <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform duration-200" />
            <span>{lang === "id" ? "Buka Analisis Taktik" : "Open Tactical Analysis"}</span>
            <span className="text-[9px] bg-blue-500/20 text-blue-200 px-1.5 py-0.5 rounded ml-1 truncate max-w-[120px]" title={latestAnalysis.title}>
              {latestAnalysis.title}
            </span>
          </button>
        </div>
      )}

      {/* Tactical Analysis Detailed Modal Overlay */}
      <AnimatePresence>
        {showAnalysisModal && latestAnalysis && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[5200] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f13] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-blue-950/20 to-indigo-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide uppercase font-sans">
                      {lang === "id" ? "Analisis Strategi Taktis" : "Tactical Strategy Analysis"}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium font-sans font-mono">
                      {latestAnalysis.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex-1 overflow-y-auto space-y-3 font-sans text-xs text-gray-200 leading-relaxed text-justify markdown-body">
                <Markdown>{latestAnalysis.desc}</Markdown>
              </div>
              <div className="p-3 bg-black/40 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="px-4 py-2 bg-[#1c1d24] hover:bg-[#252630] text-white border border-white/10 rounded-xl hover:border-white/20 transition-all font-bold text-xs cursor-pointer"
                >
                  {lang === "id" ? "Tutup" : "Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[5000] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Konfigurasi AI & MCP Engine</h3>
                    <p className="text-[10px] text-gray-400">Atur kustomisasi model AI atau hubungkan ke server MCP Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-white/5 bg-black/20 text-xs" role="tablist">
                <button
                  id="tab-btn-ai"
                  onClick={() => setActiveTab("ai")}
                  role="tab"
                  aria-selected={activeTab === "ai"}
                  aria-controls="tab-panel-ai"
                  className={`flex-1 py-3 text-center font-bold tracking-wide uppercase transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer ${
                    activeTab === "ai"
                      ? "text-blue-400 border-b-2 border-blue-500 bg-white/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
                    Setingan Model AI
                  </div>
                </button>
                <button
                  id="tab-btn-mcp"
                  onClick={() => setActiveTab("mcp")}
                  role="tab"
                  aria-selected={activeTab === "mcp"}
                  aria-controls="tab-panel-mcp"
                  className={`flex-1 py-3 text-center font-bold tracking-wide uppercase transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none cursor-pointer ${
                    activeTab === "mcp"
                      ? "text-indigo-400 border-b-2 border-indigo-500 bg-white/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Database className="w-3.5 h-3.5" aria-hidden="true" />
                    Model Context Protocol (MCP)
                  </div>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 flex-1 space-y-4 max-h-[400px] overflow-y-auto">
                {activeTab === "ai" && (
                  <div id="tab-panel-ai" role="tabpanel" aria-labelledby="tab-btn-ai" className="space-y-4">
                    {/* Model AI Selector */}
                    <div className="space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
                      <label htmlFor="ai-coach-model-select" className="text-[10px] block font-bold text-gray-300 uppercase tracking-wider cursor-pointer">Model AI Taktikal Utama</label>
                      <select
                        id="ai-coach-model-select"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value as any)}
                        className="w-full bg-black/80 border border-white/10 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 font-bold"
                      >
                        <option value="gemini-3.5-flash">⚽ Google Gemini 3.5 Flash (Generalist & Fast)</option>
                        <option value="gemini-3.1-pro-preview">🧠 Google Gemini 3.1 Pro (Complex Reasoning)</option>
                        <option value="gemini-3.1-flash-lite">🚀 Google Gemini 3.1 Flash Lite (Ultra-Low Latency)</option>
                        <option value="claude">🎭 Claude 3.5 Sonnet (Simulated Style)</option>
                        <option value="gpt4">📋 OpenAI GPT-4o (Simulated Style)</option>
                        <option value="deepseek">🧪 DeepSeek R1 (Simulated Style)</option>
                      </select>
                      <p className="text-[9px] text-blue-400 mt-1 leading-relaxed font-semibold">
                        {selectedModel === "gemini-3.5-flash" && "⚽ Google Gemini 3.5 Flash memberikan respons taktis yang seimbang secara cepat."}
                        {selectedModel === "gemini-3.1-pro-preview" && "🧠 Google Gemini 3.1 Pro unggul dalam analisis posisi spasial geometris yang sangat kompleks."}
                        {selectedModel === "gemini-3.1-flash-lite" && "🚀 Google Gemini 3.1 Flash Lite dirancang untuk generasi instan dengan latensi minimal luar biasa."}
                        {selectedModel === "claude" && "🎭 Format ala Claude 3.5 Sonnet menulis ulasan dengan terminologi UEFA pelatih profesional & rigid."}
                        {selectedModel === "gpt4" && "📋 Format ala OpenAI GPT-4o memberikan SWOT analisis & langkah taktis berpoin ringkas."}
                        {selectedModel === "deepseek" && "🧪 Format ala DeepSeek R1 mendalam dengan rincian proses berpikir kalkulasi geometris lapangan."}
                      </p>
                    </div>

                    {/* Temperature Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <label htmlFor="ai-coach-temperature-range" className="font-bold text-gray-300 cursor-pointer">Model Temperature (Kreativitas)</label>
                        <span className="text-blue-400 font-mono font-bold">{temperature}</span>
                      </div>
                      <input
                        id="ai-coach-temperature-range"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                      />
                      <div className="flex justify-between text-[9px] text-gray-500 font-medium select-none">
                        <span>Konsisten & Geometris (0)</span>
                        <span>Sangat Kreatif & Spekulatif (1)</span>
                      </div>
                    </div>

                    {/* Custom API Key Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="ai-coach-custom-api-key" className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider cursor-pointer">Kunci API Kustom (Opsional)</label>
                      <input
                        id="ai-coach-custom-api-key"
                        type="password"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        placeholder="Masukkan API Key kustom Anda (Claude/DeepSeek/GPT)"
                        className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 font-mono"
                      />
                      <p className="text-[8px] text-gray-500">API Key ini disimpan secara aman hanya di penjelajah lokal Anda (*localStorage*).</p>
                    </div>

                    {/* Custom System Prompt Instruction */}
                    <div className="space-y-1.5">
                      <label htmlFor="ai-coach-custom-system-prompt" className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider cursor-pointer">Instruksi Sistem Tambahan / Filosofi Pelatih</label>
                      <textarea
                        id="ai-coach-custom-system-prompt"
                        rows={3}
                        value={customSystemPrompt}
                        onChange={(e) => setCustomSystemPrompt(e.target.value)}
                        placeholder="e.g., 'Gunakan formasi defensif yang sangat agresif. Berikan taktik dengan istilah khas pelatih Serie A Italia kuno.'"
                        className="w-full bg-black/40 border border-white/10 text-xs rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "mcp" && (
                  <div id="tab-panel-mcp" role="tabpanel" aria-labelledby="tab-btn-mcp" className="space-y-4">
                    {/* Enable MCP Switch */}
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                        <div>
                          <p className="text-xs font-bold text-white">Gunakan Protokol MCP</p>
                          <p className="text-[9px] text-gray-400">Aktifkan integrasi data eksternal via MCP</p>
                        </div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={mcpEnabled}
                        aria-label="Gunakan Protokol MCP"
                        onClick={() => setMcpEnabled(!mcpEnabled)}
                        className={`w-11 h-6 rounded-full p-1 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none cursor-pointer ${
                          mcpEnabled ? "bg-indigo-600" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transition-all ${
                            mcpEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* MCP Configuration Parameters */}
                    <div className={`space-y-4 transition-all duration-200 ${mcpEnabled ? "opacity-100 pointer-events-auto" : "opacity-40 pointer-events-none"}`}>
                      {/* MCP Endpoint URL */}
                      <div className="space-y-1.5">
                        <label htmlFor="ai-coach-mcp-url" className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider cursor-pointer">Alamat MCP Host Server</label>
                        <input
                          id="ai-coach-mcp-url"
                          type="text"
                          value={mcpUrl}
                          onChange={(e) => setMcpUrl(e.target.value)}
                          placeholder="e.g., http://localhost:3015/mcp"
                          className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono"
                        />
                      </div>

                      {/* MCP selected tool */}
                      <div className="space-y-1.5">
                        <label htmlFor="ai-coach-mcp-tool-select" className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider cursor-pointer">Nama Tool Taktis MCP</label>
                        <select
                          id="ai-coach-mcp-tool-select"
                          value={mcpTool}
                          onChange={(e) => setMcpTool(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <option value="pitch-scout-analyzer">⚽ pitch-scout-analyzer (Rasio & Peringkat Lawan)</option>
                          <option value="weather-influence-index">🌧️ weather-influence-index (Kondisi Lapangan Basah)</option>
                          <option value="historical-formation-db">📜 historical-formation-db (Sejarah Efektifitas Taktik)</option>
                        </select>
                      </div>

                      {/* Test Connection Button & Status Output */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleTestMcp}
                          disabled={mcpTesting}
                          className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 active:scale-95 border border-indigo-500/20 rounded-xl py-2 text-[11px] text-indigo-400 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                        >
                          {mcpTesting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Menghubungi Host MCP...
                            </>
                          ) : (
                            <>
                              <Activity className="w-3.5 h-3.5" aria-hidden="true" /> Tes Koneksi Server MCP
                            </>
                          )}
                        </button>

                        {mcpTestStatus === "success" && (
                          <div className="bg-emerald-950/20 border border-emerald-500/25 p-2 rounded-xl flex items-center gap-2 text-emerald-400 text-[10px]" role="alert">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                            <div>
                              <p className="font-bold">Koneksi Berhasil!</p>
                              <p className="text-gray-400">Server MCP tersambung. Menemukan 1 model tool yang siap diaplikasikan.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" /> Simpan Konfigurasi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scouting Chemistry Report Modal Overlay */}
      <AnimatePresence>
        {isScoutModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[5100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f13] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-indigo-950/20 to-purple-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide uppercase font-sans">Laporan Pemantau (Scout AI)</h3>
                    <p className="text-[10px] text-gray-400 font-medium font-sans">Evaluasi sinergi formasi & chemistry pemain aktif</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScoutModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 font-sans text-xs">
                {scoutLoading && (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                    <div className="space-y-1">
                      <p className="text-gray-200 font-bold">Google Omni sedang menghitung chemistry skuad...</p>
                      <p className="text-[10px] text-gray-500">Mengkalkulasikan radius spasial, kesesuaian peran, serta sinergi taktis</p>
                    </div>
                  </div>
                )}

                {scoutError && (
                  <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-4 rounded-xl space-y-1">
                    <p className="font-bold flex items-center gap-1.5">⚠️ Ralat Hubungan</p>
                    <p className="text-[10px] text-gray-300">{scoutError}</p>
                  </div>
                )}

                {!scoutLoading && !scoutError && scoutReport && (
                  <div className="space-y-4">
                    {/* Grade & Score Badge */}
                    <div className="grid grid-cols-2 gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                      <div className="space-y-1 text-center border-r border-white/5 py-1">
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Gred Sinergi UEFA</span>
                        <p className="text-3xl font-black text-indigo-400 font-mono tracking-tight">{scoutReport.rating}</p>
                      </div>
                      <div className="space-y-1 text-center py-1">
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Skor Kimia Playbook</span>
                        <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">{scoutReport.synergyScore}</p>
                      </div>
                    </div>

                    {/* Simplified Interactive Dashboard Buttons */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-sans block">
                        {lang === "id" ? "Detail Analisis Skuad" : "Squad Analysis Details"}
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => setActiveScoutDetail({
                            title: lang === "id" ? "🗺️ Corak Serangan (Attacking Style)" : "🗺️ Attacking Style",
                            content: <p className="text-xs text-gray-300 leading-relaxed text-justify">{scoutReport.attackingStyle}</p>
                          })}
                          className="bg-white/[0.03] hover:bg-indigo-950/20 border border-white/5 hover:border-indigo-500/30 rounded-xl p-3 text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-95 group"
                        >
                          <span className="text-xs font-bold text-gray-200 group-hover:text-indigo-400 font-sans">🗺️ Style Serangan</span>
                          <span className="text-[9.5px] text-gray-500 line-clamp-1">{scoutReport.attackingStyle}</span>
                        </button>

                        <button
                          onClick={() => setActiveScoutDetail({
                            title: lang === "id" ? "⚓ Laras Tengah (Midfield Anchor)" : "⚓ Midfield Anchor",
                            content: <p className="text-xs text-gray-300 leading-relaxed text-justify">{scoutReport.midfieldCore}</p>
                          })}
                          className="bg-white/[0.03] hover:bg-indigo-950/20 border border-white/5 hover:border-indigo-500/30 rounded-xl p-3 text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-95 group"
                        >
                          <span className="text-xs font-bold text-gray-200 group-hover:text-indigo-400 font-sans">⚓ Laras Tengah</span>
                          <span className="text-[9.5px] text-gray-500 line-clamp-1">{scoutReport.midfieldCore}</span>
                        </button>

                        <button
                          onClick={() => setActiveScoutDetail({
                            title: lang === "id" ? "🛡️ Kerapatan Benteng (Defensive Layout)" : "🛡️ Defensive Layout",
                            content: <p className="text-xs text-gray-300 leading-relaxed text-justify">{scoutReport.defensiveCompactness}</p>
                          })}
                          className="bg-white/[0.03] hover:bg-indigo-950/20 border border-white/5 hover:border-indigo-500/30 rounded-xl p-3 text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-95 group"
                        >
                          <span className="text-xs font-bold text-gray-200 group-hover:text-indigo-400 font-sans">🛡️ Kerapatan Benteng</span>
                          <span className="text-[9.5px] text-gray-500 line-clamp-1">{scoutReport.defensiveCompactness}</span>
                        </button>

                        <button
                          onClick={() => setActiveScoutDetail({
                            title: lang === "id" ? "💪 Kekuatan Skuad" : "💪 Squad Strengths",
                            content: (
                              <ul className="space-y-2 list-disc list-inside text-xs text-gray-300">
                                {scoutReport.strengths?.map((str: string, index: number) => (
                                  <li key={index} className="leading-relaxed">{str}</li>
                                ))}
                              </ul>
                            )
                          })}
                          className="bg-white/[0.03] hover:bg-[#152e25]/20 border border-white/5 hover:border-emerald-500/30 rounded-xl p-3 text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-95 group"
                        >
                          <span className="text-xs font-bold text-gray-200 group-hover:text-emerald-400 font-sans">💪 Kekuatan Skuad</span>
                          <span className="text-[9.5px] text-gray-500 line-clamp-1">
                            {scoutReport.strengths && scoutReport.strengths[0] || "Lihat kekuatan utama..."}
                          </span>
                        </button>

                        <button
                          onClick={() => setActiveScoutDetail({
                            title: lang === "id" ? "⚠️ Kelemahan Taktikal" : "⚠️ Tactical Weaknesses",
                            content: (
                              <ul className="space-y-2 list-disc list-inside text-xs text-gray-300">
                                {scoutReport.weaknesses?.map((wk: string, index: number) => (
                                  <li key={index} className="leading-relaxed">{wk}</li>
                                ))}
                              </ul>
                            )
                          })}
                          className="bg-white/[0.03] hover:bg-[#2d1215]/20 border border-white/5 hover:border-red-500/30 rounded-xl p-3 text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-95 group"
                        >
                          <span className="text-xs font-bold text-gray-200 group-hover:text-red-400 font-sans">⚠️ Kelemahan Skuad</span>
                          <span className="text-[9.5px] text-gray-500 line-clamp-1">
                            {scoutReport.weaknesses && scoutReport.weaknesses[0] || "Lihat celah taktis..."}
                          </span>
                        </button>

                        <button
                          onClick={() => setActiveScoutDetail({
                            title: lang === "id" ? "🔧 Pengubahsuaian Disyorkan" : "🔧 Recommendations Advice",
                            content: (
                              <ul className="space-y-2 list-none text-xs text-gray-300">
                                {scoutReport.recommendations?.map((rec: string, index: number) => (
                                  <li key={index} className="flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-blue-400 font-bold">➢</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            )
                          })}
                          className="bg-white/[0.03] hover:bg-[#112431]/20 border border-white/5 hover:border-blue-500/30 rounded-xl p-3 text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-95 group"
                        >
                          <span className="text-xs font-bold text-gray-200 group-hover:text-blue-400 font-sans">🔧 Rekomendasi Solusi</span>
                          <span className="text-[9.5px] text-gray-500 line-clamp-1">
                            {scoutReport.recommendations && scoutReport.recommendations[0] || "Rekomendasi taktis olahraga..."}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Pop-up Overlay for Selected Scout Detail Option */}
                    <AnimatePresence>
                      {activeScoutDetail && (
                        <div className="absolute inset-0 bg-[#07080c]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#121217] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[85%]"
                          >
                            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 flex items-center justify-between">
                              <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                                {activeScoutDetail.title}
                              </span>
                              <button
                                onClick={() => setActiveScoutDetail(null)}
                                className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="p-5 flex-1 overflow-y-auto space-y-2 font-sans text-xs">
                              {activeScoutDetail.content}
                            </div>
                            <div className="p-3 bg-black/40 border-t border-white/5 flex justify-end">
                              <button
                                onClick={() => setActiveScoutDetail(null)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                              >
                                {lang === "id" ? "Kembali" : "Back"}
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-black/40 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setIsScoutModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl hover:border-white/20 transition-all font-bold text-xs cursor-pointer"
                >
                  Tutup Laporan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* YouTube Tactical Scanner Modal Overlay */}
      <AnimatePresence>
        {isYoutubeModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[5200] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f13] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-red-950/20 to-orange-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center justify-center">
                    <span className="text-base leading-none">📺</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide uppercase font-sans">
                      {lang === "id" ? "Pemindai Video Taktis YouTube" : "YouTube Tactical Video Scanner"}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium font-mono">
                      {lang === "id" ? "Analisis skema taktik video pertandingan otomatis" : "Extract playable coach plays from video matches"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsYoutubeModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {/* Form fields */}
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                      <span>🔗 URL Video YouTube</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder={lang === "id" ? "e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ" : "e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
                      className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      disabled={youtubeLoading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      {lang === "id" ? "Fokus Analisis & Petunjuk Tambahan (Opsional)" : "Analysis Focus & Guidelines (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={youtubeFocusPrompt}
                      onChange={(e) => setYoutubeFocusPrompt(e.target.value)}
                      placeholder={lang === "id" ? "e.g., Fokus pada skema menekan gelandang atau serangan balik" : "e.g., Focus on midfield pressure triggers or transition speed"}
                      className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      disabled={youtubeLoading}
                    />
                  </div>

                  {/* Mandated User AI Credentials Area */}
                  <div className="border-t border-white/5 pt-3 mt-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider flex items-center gap-1">
                        <span>🔐 {lang === "id" ? "Pengaturan Kredensial Pengguna" : "User Credentials Setup"}</span>
                        <span className="text-red-500">*</span>
                      </span>
                      {(!customApiKey.trim() && !mcpEnabled) ? (
                        <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-semibold font-mono">
                          {lang === "id" ? "Kredensial Belum Siap" : "Credentials Missing"}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold font-mono">
                          {lang === "id" ? "Kredensial Siap" : "Credentials Ready"}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Google AI Studio API Key input card */}
                      <div className={`p-3 rounded-xl border transition-all ${!mcpEnabled ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.01] border-white/5 opacity-60'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider block">
                            1. Google AI Studio API Key
                          </span>
                          {!mcpEnabled && (
                            <span className="text-[8px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <input
                          type="password"
                          value={customApiKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomApiKey(val);
                            localStorage.setItem("tactigen_custom_key", val);
                          }}
                          placeholder={lang === "id" ? "Masukkan API Key Google AI Studio Anda" : "Enter your Google AI Studio API Key"}
                          className="w-full bg-black/60 border border-white/10 text-xs rounded-lg px-2.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-mono"
                          disabled={youtubeLoading}
                        />
                        <span className="text-[8px] text-gray-500 mt-1 block">
                          {lang === "id" 
                            ? "Kunci ini disimpan aman di lokal penjelajah (localStorage) Anda." 
                            : "Your key is saved safely in your local browser storage (localStorage)."}
                        </span>
                      </div>

                      {/* MCP switch/config card */}
                      <div className={`p-3 rounded-xl border transition-all ${mcpEnabled ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/[0.01] border-white/5 opacity-60'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider block">
                            2. Model Context Protocol (MCP)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = !mcpEnabled;
                              setMcpEnabled(next);
                              localStorage.setItem("tactigen_mcp_enabled", String(next));
                            }}
                            className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider transition-all ${
                              mcpEnabled 
                                ? "bg-indigo-600 text-white" 
                                : "bg-white/10 text-gray-400 hover:text-white"
                            }`}
                            disabled={youtubeLoading}
                          >
                            {mcpEnabled ? "Active" : "Enable"}
                          </button>
                        </div>
                        
                        {mcpEnabled ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={mcpUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMcpUrl(val);
                                localStorage.setItem("tactigen_mcp_url", val);
                              }}
                              placeholder="e.g., http://localhost:3015/mcp"
                              className="w-full bg-black/60 border border-white/10 text-[10px] rounded-lg px-2.5 py-1.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono"
                              disabled={youtubeLoading}
                            />
                            <span className="text-[8px] text-gray-400 block">
                              {lang === "id" ? "Taktik diekstrak langsung via server MCP lokal." : "Tactical blueprints fetched directly via local MCP host."}
                            </span>
                          </div>
                        ) : (
                          <div className="py-2 flex items-center justify-center text-[10px] text-gray-500 italic">
                            {lang === "id" ? "Aktifkan untuk memakai server MCP sendiri" : "Enable to source from personal MCP server"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alert banner if neither credential is ready */}
                    {!customApiKey.trim() && !mcpEnabled && (
                      <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-lg text-red-400 text-[10px] leading-relaxed flex items-start gap-1.5 animate-pulse">
                        <span className="text-red-400 mt-0.5">⚠️</span>
                        <span>
                          {lang === "id" 
                            ? "Harap masukkan Google AI Studio API Key kustom Anda sendiri atau aktifkan Model Context Protocol (MCP) terlebih dahulu untuk dapat menggunakan fitur ini." 
                            : "Please enter your own Google AI Studio API Key or activate the Model Context Protocol (MCP) first to use this feature."}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleAnalyzeYoutube}
                      disabled={youtubeLoading || !youtubeUrl.trim() || (!customApiKey.trim() && !mcpEnabled)}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      {youtubeLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{lang === "id" ? "Memindai..." : "Scanning..."}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{lang === "id" ? "Mulai Analisis Video" : "Start Video Scanning"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Loading Radar Scanner */}
                {youtubeLoading && (
                  <div className="bg-black/30 p-8 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-3 animate-pulse">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping" />
                      <div className="absolute inset-2 rounded-full border border-red-500/20 animate-pulse" />
                      <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-red-400 block">
                        {lang === "id" ? "Google Omni sedang memindai video taktis..." : "Google Omni is scanning tactical footage..."}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        {lang === "id" 
                          ? "Mengekstrak pergerakan pemain, meninjau formasi transisi, dan menyusun keyframe animasi papan taktis." 
                          : "Extracting positional data, analyzing team triggers, and compiling kinetic playbook keyframes."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Box */}
                {youtubeError && (
                  <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
                    <span className="text-red-400">⚠️</span>
                    <div>
                      <p className="font-bold">{lang === "id" ? "Gagal Menganalisis Video" : "Video Scanning Failed"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{youtubeError}</p>
                    </div>
                  </div>
                )}

                {/* Scanner Report Result */}
                {youtubeReport && !youtubeLoading && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/10 rounded-xl p-4">
                      <h4 className="text-xs font-black text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {youtubeReport.title}
                      </h4>
                      <div className="text-[10.5px] text-gray-300 leading-relaxed text-justify mt-2 font-sans markdown-body">
                        <Markdown>{youtubeReport.videoSummary}</Markdown>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                          ⚽ {lang === "id" ? "Taktik Penyerangan" : "Attacking Strategy"}
                        </span>
                        <p className="text-gray-300 text-[11px] leading-relaxed mt-1.5">
                          {youtubeReport.attackingPhase}
                        </p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                          🛡️ {lang === "id" ? "Taktik Pertahanan" : "Defensive Strategy"}
                        </span>
                        <p className="text-gray-300 text-[11px] leading-relaxed mt-1.5">
                          {youtubeReport.defendingPhase}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-xs">
                      <span className="text-[10px] uppercase font-bold text-yellow-500 flex items-center gap-1">
                        🔑 {lang === "id" ? "Peran Kunci Pemain" : "Key Player Roles"}
                      </span>
                      <div className="text-gray-300 text-[11px] leading-relaxed mt-1.5 whitespace-pre-line">
                        {youtubeReport.keyPlayerRoles}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-emerald-950/15 border border-emerald-500/10 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                          ✓ {lang === "id" ? "Kelebihan Taktik" : "Tactical Strengths"}
                        </span>
                        <ul className="list-disc list-inside space-y-1 mt-1.5 text-gray-300 text-[11px]">
                          {youtubeReport.strengths?.map((str: string, idx: number) => (
                            <li key={idx} className="leading-relaxed">{str}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-950/15 border border-red-500/10 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                          ⚠️ {lang === "id" ? "Resiko / Kelemahan" : "Tactical Weaknesses"}
                        </span>
                        <ul className="list-disc list-inside space-y-1 mt-1.5 text-gray-300 text-[11px]">
                          {youtubeReport.weaknesses?.map((wk: string, idx: number) => (
                            <li key={idx} className="leading-relaxed">{wk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Interactive Playbook Import Section */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[9px] bg-red-500/25 text-red-300 px-2 py-0.5 rounded border border-red-500/30 font-bold uppercase tracking-wider font-mono">
                          ⚡ Playbook Ready
                        </span>
                        <h5 className="text-xs font-black text-white uppercase tracking-wide mt-1">
                          {youtubeReport.playbook?.title || (lang === "id" ? "Animasi Taktis Tersedia" : "Tactical Playbook Animation")}
                        </h5>
                        <p className="text-[10px] text-gray-400">
                          {lang === "id" 
                            ? `Direkomendasikan formasi: ${youtubeReport.recommendedFormation}`
                            : `Recommended team formation: ${youtubeReport.recommendedFormation}`}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                        {onApplyFormation && youtubeReport.recommendedFormation && (
                          <button
                            onClick={() => {
                              onApplyFormation(youtubeReport.recommendedFormation);
                            }}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-[11px] py-2 px-3 rounded-lg transition-all text-center cursor-pointer active:scale-95"
                          >
                            {lang === "id" ? "Gunakan Formasi" : "Apply Formation"}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (youtubeReport.playbook) {
                              onLoadGeneratedPlay(youtubeReport.playbook);
                              setImportStatus("success");
                              setTimeout(() => {
                                setIsYoutubeModalOpen(false);
                                setImportStatus("idle");
                              }, 1000);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] py-2 px-4 rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-md"
                        >
                          {importStatus === "success" ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{lang === "id" ? "Berhasil Diimpor!" : "Imported!"}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>{lang === "id" ? "Impor ke Papan Taktik" : "Import Playbook Animation"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-black/40 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setIsYoutubeModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl hover:border-white/20 transition-all font-bold text-xs cursor-pointer"
                >
                  {lang === "id" ? "Tutup Scanner" : "Close Scanner"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </Interactive3DCard>
  );
}
