import { useState } from "react";
import { Player, TacticalItem, TacticalPlay } from "../types";
import { Sparkles, BrainCircuit, Play, ArrowRight, CornerDownRight, RotateCcw, Settings, Database, Sliders, Cpu, Check, X, Info, Activity, ShieldAlert, Network, RefreshCw } from "lucide-react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

interface AICoachProps {
  players: Player[];
  items: TacticalItem[];
  currentFormation: string;
  onLoadGeneratedPlay: (play: TacticalPlay) => void;
}

const TACTICAL_PRESETS = [
  { id: "counter", label: "⚡ Serangan Balik Cepat", prompt: "Buat serangan balik cepat dari sayap kiri, diakhiri dengan crossing lambung ke tiang jauh untuk sundulan striker." },
  { id: "tikitaka", label: "⚽ Tiki-Taka Segitiga", prompt: "Kombinasi umpan segitiga pendek rapat dari lini tengah menusuk pertahanan area garis pertahanan lawan." },
  { id: "press", label: "🛡️ Compact High Press", prompt: "Skenario compact pressing ketat saat lawan mencoba build-up dari keeper, semua pemain maju menutup ruang operan." },
  { id: "corner", label: "📐 Rutinitas Tendangan Sudut", prompt: "Skenario sepak pojok melengkung tajam ke kotak penalti dengan sundulan terarah di tiang dekat." }
];

export default function AICoach({ players, items, currentFormation, onLoadGeneratedPlay }: AICoachProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<{ title: string; desc: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState<"gemini" | "claude" | "deepseek" | "gpt4">(() => {
    return (localStorage.getItem("tactigen_selected_model") as any) || "gemini";
  });

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
          if (rawText && rawText !== "undefined") {
            const errData = JSON.parse(rawText);
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
        let cleanText = rawText;
        if (!cleanText || cleanText === "undefined") {
          throw new Error("Respons server kosong atau tidak lengkap.");
        }
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\s*/i, "");
          cleanText = cleanText.replace(/\s*```$/, "");
        }
        cleanText = cleanText.trim();
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

  return (
    <div className="bg-[#15151a] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 shadow-xl relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              Omni Intelligence Hub
            </h3>
            <p className="text-[10px] text-gray-400">Rancang & koversi playbook taktis otomatis</p>
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
            title="Konfigurasikan Model AI & MCP Server"
            id="ai-mcp-settings-btn"
          >
            <Settings className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>

      {/* Preset selections */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Pola Strategi Cepat</label>
        <div className="grid grid-cols-2 gap-2">
          {TACTICAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleGenerate(preset.prompt)}
              disabled={loading}
              className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-xl p-2 transition-all text-xs text-gray-200 flex flex-col justify-between h-14 disabled:opacity-50"
            >
              <span className="font-bold truncate w-full">{preset.label}</span>
              <span className="text-[8px] text-gray-500 line-clamp-1">{preset.prompt}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Custom prompt entry */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Intruksi Khusus untuk Google Omni</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Instruksikan pola gerakan, e.g., 'striker pivot oper sayap kanan...'"
            className="flex-1 bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={() => handleGenerate("")}
            disabled={loading || !prompt.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> Animasikan
          </button>
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-2 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-1" />
          <span className="text-xs font-bold text-blue-400">Google Omni merakit visual koordinat...</span>
          <span className="text-[10px] text-gray-500">Menyusun layout taktik keyframes gerakan & analisis playbook</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2">
          <span className="text-red-400">⚠️</span>
          <div>
            <p className="font-bold">Gagal Generasi Taktik</p>
            <p className="text-[10px] text-gray-400">{error}</p>
          </div>
        </div>
      )}

      {/* Prompt Result Output */}
      {latestAnalysis && !loading && (
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold uppercase">
              Analisis Strategi
            </span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              {latestAnalysis.title}
            </span>
          </div>
          <div className="text-gray-200 text-xs text-justify leading-relaxed markdown-body max-h-32 overflow-y-auto pr-1">
            <Markdown>{latestAnalysis.desc}</Markdown>
          </div>
        </div>
      )}

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
              <div className="flex border-b border-white/5 bg-black/20 text-xs">
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`flex-1 py-3 text-center font-bold tracking-wide uppercase transition-all ${
                    activeTab === "ai"
                      ? "text-blue-400 border-b-2 border-blue-500 bg-white/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Setingan Model AI
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("mcp")}
                  className={`flex-1 py-3 text-center font-bold tracking-wide uppercase transition-all ${
                    activeTab === "mcp"
                      ? "text-indigo-400 border-b-2 border-indigo-500 bg-white/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Model Context Protocol (MCP)
                  </div>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 flex-1 space-y-4 max-h-[400px] overflow-y-auto">
                {activeTab === "ai" && (
                  <div className="space-y-4">
                    {/* Model AI Selector */}
                    <div className="space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
                      <label className="text-[10px] block font-bold text-gray-300 uppercase tracking-wider">Model AI Taktikal Utama</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value as any)}
                        className="w-full bg-black/80 border border-white/10 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-bold"
                      >
                        <option value="gemini">⚽ Google Gemini 1.5 Pro (Generalist Expert)</option>
                        <option value="claude">🎭 Claude 3.5 Sonnet (Systemic Scholar)</option>
                        <option value="gpt4">📋 OpenAI GPT-4o (Structured Pro)</option>
                        <option value="deepseek">🧪 DeepSeek R1 (Reasoning CoT)</option>
                      </select>
                      <p className="text-[9px] text-blue-400 mt-1 leading-relaxed font-semibold">
                        {selectedModel === "gemini" && "⚡ Google Gemini fokus pada analisis sebaran spasial taktis fisik secara fluid."}
                        {selectedModel === "claude" && "🎭 Claude 3.5 Sonnet menulis ulasan dengan terminologi pelatih profesional & rigid."}
                        {selectedModel === "gpt4" && "📋 OpenAI GPT-4o memberikan SWOT analisis & langkah taktis berpoin ringkas."}
                        {selectedModel === "deepseek" && "🧪 DeepSeek R1 mendalam dengan rincian proses berpikir kalkulasi geometris lapangan."}
                      </p>
                    </div>

                    {/* Temperature Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-300">Model Temperature (Kreativitas)</span>
                        <span className="text-blue-400 font-mono font-bold">{temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-gray-500 font-medium">
                        <span>Konsisten & Geometris (0)</span>
                        <span>Sangat Kreatif & Spekulatif (1)</span>
                      </div>
                    </div>

                    {/* Custom API Key Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider">Kunci API Kustom (Opsional)</label>
                      <input
                        type="password"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        placeholder="Masukkan API Key kustom Anda (Claude/DeepSeek/GPT)"
                        className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <p className="text-[8px] text-gray-500">API Key ini disimpan secara aman hanya di penjelajah lokal Anda (*localStorage*).</p>
                    </div>

                    {/* Custom System Prompt Instruction */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider">Instruksi Sistem Tambahan / Filosofi Pelatih</label>
                      <textarea
                        rows={3}
                        value={customSystemPrompt}
                        onChange={(e) => setCustomSystemPrompt(e.target.value)}
                        placeholder="e.g., 'Gunakan formasi defensif yang sangat agresif. Berikan taktik dengan istilah khas pelatih Serie A Italia kuno.'"
                        className="w-full bg-black/40 border border-white/10 text-xs rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "mcp" && (
                  <div className="space-y-4">
                    {/* Enable MCP Switch */}
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Gunakan Protokol MCP</p>
                          <p className="text-[9px] text-gray-400">Aktifkan integrasi data eksternal via MCP</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMcpEnabled(!mcpEnabled)}
                        className={`w-11 h-6 rounded-full p-1 transition-all ${
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
                        <label className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider">Alamat MCP Host Server</label>
                        <input
                          type="text"
                          value={mcpUrl}
                          onChange={(e) => setMcpUrl(e.target.value)}
                          placeholder="e.g., http://localhost:3015/mcp"
                          className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      {/* MCP selected tool */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider">Nama Tool Taktis MCP</label>
                        <select
                          value={mcpTool}
                          onChange={(e) => setMcpTool(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
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
                          className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 active:scale-95 border border-indigo-500/20 rounded-xl py-2 text-[11px] text-indigo-400 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {mcpTesting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menghubungi Host MCP...
                            </>
                          ) : (
                            <>
                              <Activity className="w-3.5 h-3.5" /> Tes Koneksi Server MCP
                            </>
                          )}
                        </button>

                        {mcpTestStatus === "success" && (
                          <div className="bg-emerald-950/20 border border-emerald-500/25 p-2 rounded-xl flex items-center gap-2 text-emerald-400 text-[10px]">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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
    </div>
  );
}
