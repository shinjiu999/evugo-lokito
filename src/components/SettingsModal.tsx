import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Settings, Key, Network, Check, HelpCircle, Eye, EyeOff, Volume2, VolumeX, Sparkles, Sliders, Smartphone, Monitor, Tablet } from "lucide-react";
import { soundManager } from "../utils/sound";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  lang?: "id" | "en";
  initialTab?: "gemini" | "mcp" | "audio" | "display";
}

export function SettingsModal({ isOpen, onClose, onSave, lang = "id", initialTab = "gemini" }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"gemini" | "mcp" | "audio" | "display">(initialTab);
  
  // Local state initialized from localStorage
  const [customApiKey, setCustomApiKey] = useState("");
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [mcpUrl, setMcpUrl] = useState("http://localhost:3015/mcp");
  const [mcpTool, setMcpTool] = useState("pitch-scout-analyzer");
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiTestStatus, setApiTestStatus] = useState<"idle" | "valid" | "warning">("idle");
  const [mcpTestStatus, setMcpTestStatus] = useState<"idle" | "testing" | "success" | "warning">("idle");

  // Audio settings state
  const [soundVolume, setSoundVolume] = useState<number>(soundManager.getVolume());
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(soundManager.getMuted());
  const [recentSoundPlayed, setRecentSoundPlayed] = useState<string | null>(null);

  // Display & Device Mode settings
  const [deviceMode, setDeviceMode] = useState<"android" | "pc">("android");
  const [androidViewport, setAndroidViewport] = useState<"phone" | "tablet" | "fluid">("fluid");

  // Load values from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setCustomApiKey(localStorage.getItem("tactigen_custom_key") || "");
      setMcpEnabled(localStorage.getItem("tactigen_mcp_enabled") === "true");
      setMcpUrl(localStorage.getItem("tactigen_mcp_url") || "http://localhost:3015/mcp");
      setMcpTool(localStorage.getItem("tactigen_mcp_tool") || "pitch-scout-analyzer");
      setSoundVolume(soundManager.getVolume());
      setIsAudioMuted(soundManager.getMuted());
      setDeviceMode((localStorage.getItem("tactigen_device_mode") as any) || "android");
      setAndroidViewport((localStorage.getItem("tactigen_android_viewport") as any) || "fluid");
      setSaveSuccess(false);
      setApiTestStatus("idle");
      setMcpTestStatus("idle");
      setRecentSoundPlayed(null);
    }
  }, [isOpen, initialTab]);

  const testApiKeyFormat = () => {
    const key = customApiKey.trim();
    if (!key) {
      setApiTestStatus("warning");
      return;
    }
    if (key.startsWith("AIzaSy") || key.length >= 30) {
      setApiTestStatus("valid");
    } else {
      setApiTestStatus("warning");
    }
  };

  const testMcpConnection = () => {
    setMcpTestStatus("testing");
    setTimeout(() => {
      if (mcpUrl.trim().startsWith("http://") || mcpUrl.trim().startsWith("https://")) {
        setMcpTestStatus("success");
      } else {
        setMcpTestStatus("warning");
      }
    }, 500);
  };

  const handleSave = () => {
    localStorage.setItem("tactigen_custom_key", customApiKey.trim());
    localStorage.setItem("tactigen_mcp_enabled", String(mcpEnabled));
    localStorage.setItem("tactigen_mcp_url", mcpUrl.trim());
    localStorage.setItem("tactigen_mcp_tool", mcpTool.trim());
    localStorage.setItem("tactigen_device_mode", deviceMode);
    localStorage.setItem("tactigen_android_viewport", androidViewport);
    
    // Play lush success chime for settings save
    try {
      soundManager.playChime();
    } catch (e) {}

    setSaveSuccess(true);
    onSave();
    
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleVolumeChange = (newVol: number) => {
    setSoundVolume(newVol);
    soundManager.setVolume(newVol);
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMuted();
    setIsAudioMuted(muted);
  };

  const playPreviewSound = (name: string, fn: () => void) => {
    setRecentSoundPlayed(name);
    fn();
    setTimeout(() => setRecentSoundPlayed(null), 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-[6000] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0f0f13] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-gradient-to-r from-blue-950/20 to-indigo-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 flex items-center justify-center">
                <Settings className="w-4 h-4 animate-spin" style={{ animationDuration: "8s" }} aria-hidden="true" />
              </div>
              <div>
                <h3 id="settings-modal-title" className="text-sm font-black text-white tracking-wide uppercase font-sans">
                  {lang === "id" ? "Pengaturan Sistem & Audio Taktis" : "System & Tactical Audio Settings"}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium font-mono">
                  {lang === "id" ? "Konfigurasi Kunci API AI, MCP, atau Efek Suara Profesional" : "Configure AI Key, MCP Server, or Professional Sound FX"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              aria-label={lang === "id" ? "Tutup pengaturan" : "Close settings"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/5 bg-black/20 p-1" role="tablist">
            <button
              id="tab-gemini"
              role="tab"
              aria-selected={activeTab === "gemini"}
              aria-controls="panel-gemini"
              onClick={() => {
                setActiveTab("gemini");
                soundManager.playClick();
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer ${
                activeTab === "gemini"
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Key className="w-3.5 h-3.5" aria-hidden="true" />
              <span>AI API Key</span>
            </button>
            <button
              id="tab-mcp"
              role="tab"
              aria-selected={activeTab === "mcp"}
              aria-controls="panel-mcp"
              onClick={() => {
                setActiveTab("mcp");
                soundManager.playClick();
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none cursor-pointer ${
                activeTab === "mcp"
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Network className="w-3.5 h-3.5" aria-hidden="true" />
              <span>MCP</span>
            </button>
            <button
              id="tab-audio"
              role="tab"
              aria-selected={activeTab === "audio"}
              aria-controls="panel-audio"
              onClick={() => {
                setActiveTab("audio");
                soundManager.playClick();
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none cursor-pointer ${
                activeTab === "audio"
                  ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{lang === "id" ? "Audio & Suara" : "Sound FX"}</span>
            </button>
            <button
              id="tab-display"
              role="tab"
              aria-selected={activeTab === "display"}
              aria-controls="panel-display"
              onClick={() => {
                setActiveTab("display");
                soundManager.playClick();
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none cursor-pointer ${
                activeTab === "display"
                  ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{lang === "id" ? "Tampilan" : "Display"}</span>
            </button>
          </div>

          {/* Official AI Recommendation Callout */}
          <div className="px-5 pt-4 pb-0">
            <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent border border-emerald-500/20 rounded-xl flex items-start gap-2.5">
              <span className="text-base leading-none mt-0.5">💡</span>
              <div className="space-y-0.5">
                <span className="text-[11px] font-black text-emerald-300 block uppercase tracking-wide">
                  {lang === "id" ? "Rekomendasi Mode AI Mandiri" : "Recommended: Bring Your Own AI / MCP"}
                </span>
                <p className="text-[10px] text-gray-300 leading-relaxed">
                  {lang === "id"
                    ? "Untuk mengaktifkan seluruh fitur AI taktis secara maksimal, bebas antrean kuota, dan menjaga privasi strategi klub Anda, kami menyarankan untuk menghubungkan Kunci API AI atau server MCP milik Anda sendiri."
                    : "For optimal tactical performance, zero shared quota limits, and private team strategy protection, we recommend connecting your personal AI API Key or your own local/remote MCP server."}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            
            {/* 1. AI Key Tab */}
            {activeTab === "gemini" && (
              <div 
                id="panel-gemini" 
                role="tabpanel" 
                aria-labelledby="tab-gemini"
                className="space-y-4 animate-fadeIn"
              >
                {/* Instructions Box */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    {lang === "id" ? "Cara Mendapatkan Kunci API AI:" : "How to get your AI API Key:"}
                  </h4>
                  <ol className="list-decimal list-inside text-[10.5px] text-gray-300 space-y-1.5 leading-relaxed">
                    <li>
                      {lang === "id" ? "Buka platform resmi " : "Go to "}
                      <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-bold inline-flex items-center gap-0.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
                        Google AI Studio ↗
                      </a>
                    </li>
                    <li>{lang === "id" ? "Masuk atau login menggunakan Akun Google Anda." : "Sign in using your default Google Account."}</li>
                    <li>{lang === "id" ? "Klik tombol berwarna biru bertuliskan 'Get API Key'." : "Click the prominent 'Get API Key' button in the dashboard."}</li>
                    <li>{lang === "id" ? "Buat kunci API kustom baru, salin, dan rekatkan di kolom bawah ini." : "Create a new custom API Key, copy it, and paste it into the input below."}</li>
                  </ol>
                  <p className="text-[9px] text-gray-500 font-medium">
                    {lang === "id" 
                      ? "💡 Mengapa ini disarankan? Untuk memastikan respons instan bebas kuota secara eksklusif bagi kebutuhan taktis Anda."
                      : "💡 Why is this recommended? To ensure uninterrupted, rate-limit-free video and tactical analytics customized just for you."}
                  </p>
                </div>

                {/* API Key Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="gemini-api-key-input" className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                      {lang === "id" ? "🔑 Kunci API AI Anda" : "🔑 Your AI API Key"}
                    </label>
                    <button
                      type="button"
                      onClick={testApiKeyFormat}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/20 transition-all cursor-pointer"
                    >
                      {lang === "id" ? "🧪 Uji Kunci API" : "🧪 Test Key Format"}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="gemini-api-key-input"
                      type={showApiKey ? "text" : "password"}
                      value={customApiKey}
                      onChange={(e) => {
                        setCustomApiKey(e.target.value);
                        setApiTestStatus("idle");
                      }}
                      placeholder="AIzaSy..."
                      className="w-full bg-black/40 border border-white/10 text-xs rounded-xl pl-3 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded cursor-pointer"
                      aria-label={showApiKey ? (lang === "id" ? "Sembunyikan Kunci API" : "Hide API Key") : (lang === "id" ? "Tampilkan Kunci API" : "Show API Key")}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Feedback Status */}
                  {apiTestStatus === "valid" && (
                    <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === "id" ? "Format Kunci API Valid & Siap Digunakan!" : "Valid API Key format ready to save!"}</span>
                    </div>
                  )}
                  {apiTestStatus === "warning" && (
                    <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>{lang === "id" ? "Kunci API kosong atau format tampak tidak sesuai (biasanya diawali dengan 'AIzaSy...')." : "Key is empty or format does not match expected Google AI key."}</span>
                    </div>
                  )}

                  <span className="text-[9px] text-gray-500 block leading-normal">
                    {lang === "id" 
                      ? "⚠️ Kunci API Anda disimpan secara lokal dan aman di penjelajah Anda (localStorage) dan tidak pernah dikirimkan ke server kami." 
                      : "⚠️ Your API key is stored locally and securely within your browser's localStorage and is never transmitted anywhere else."}
                  </span>
                </div>
              </div>
            )}

            {/* 2. MCP Tab */}
            {activeTab === "mcp" && (
              <div 
                id="panel-mcp" 
                role="tabpanel" 
                aria-labelledby="tab-mcp"
                className="space-y-4 animate-fadeIn"
              >
                {/* Instructions Box */}
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5" aria-hidden="true" />
                    {lang === "id" ? "Apa itu Model Context Protocol (MCP)?" : "What is Model Context Protocol (MCP)?"}
                  </h4>
                  <p className="text-[10.5px] text-gray-300 leading-relaxed">
                    {lang === "id"
                      ? "MCP adalah standar terbuka yang memungkinkan asisten AI terhubung secara lokal ke server khusus Anda. Aktifkan fitur ini jika Anda memiliki server scout taktis lokal atau penganalisis video pertandingan kustom sendiri."
                      : "MCP is an open standard enabling secure connections from local AI systems to custom external tools. Enable this to hook Tactigen Pro directly to your custom local playbook generators or team analytics server."}
                  </p>
                </div>

                {/* Configuration Fields */}
                <div className="space-y-3.5 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                  {/* Enable switch */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-white block">
                        {lang === "id" ? "Aktifkan Integrasi MCP" : "Enable MCP Integration"}
                      </span>
                      <span className="text-[9px] text-gray-500 block">
                        {lang === "id" ? "Gunakan server MCP untuk fitur pencarian taktis" : "Leverage local MCP hosts for tactical scanning features"}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={mcpEnabled}
                      onClick={() => setMcpEnabled(!mcpEnabled)}
                      className={`w-12 h-6.5 rounded-full p-1 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none cursor-pointer ${
                        mcpEnabled ? "bg-indigo-600" : "bg-white/10"
                      }`}
                      aria-label={lang === "id" ? "Aktifkan Integrasi MCP" : "Enable MCP Integration"}
                    >
                      <div
                        className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-all ${
                          mcpEnabled ? "translate-x-5.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {mcpEnabled && (
                    <div className="space-y-3 pt-3 border-t border-white/5 animate-slideDown">
                      {/* Server URL */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="mcp-server-url-input" className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider">
                            {lang === "id" ? "Alamat Endpoint Server MCP" : "MCP Server Endpoint URL"}
                          </label>
                          <button
                            type="button"
                            onClick={testMcpConnection}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/20 transition-all cursor-pointer"
                          >
                            {mcpTestStatus === "testing" ? "Menguji..." : (lang === "id" ? "🧪 Uji Sambungan" : "🧪 Test URL")}
                          </button>
                        </div>
                        <input
                          id="mcp-server-url-input"
                          type="text"
                          value={mcpUrl}
                          onChange={(e) => {
                            setMcpUrl(e.target.value);
                            setMcpTestStatus("idle");
                          }}
                          placeholder="e.g., http://localhost:3015/mcp"
                          className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                      </div>

                      {/* Feedback Status */}
                      {mcpTestStatus === "success" && (
                        <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === "id" ? "Format URL Server MCP Valid & Siap Digunakan!" : "Valid MCP Server URL format ready to connect!"}</span>
                        </div>
                      )}
                      {mcpTestStatus === "warning" && (
                        <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-center gap-1.5">
                          <span>⚠️</span>
                          <span>{lang === "id" ? "Format URL tidak valid. Gunakan awalan http:// atau https://" : "Invalid URL format. Use http:// or https://"}</span>
                        </div>
                      )}

                      {/* Tool identifier */}
                      <div className="space-y-1.5">
                        <label htmlFor="mcp-tool-name-input" className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider">
                          {lang === "id" ? "Nama Tool MCP" : "MCP Tool Name"}
                        </label>
                        <input
                          id="mcp-tool-name-input"
                          type="text"
                          value={mcpTool}
                          onChange={(e) => setMcpTool(e.target.value)}
                          placeholder="pitch-scout-analyzer"
                          className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Audio & Sound FX Tab */}
            {activeTab === "audio" && (
              <div 
                id="panel-audio" 
                role="tabpanel" 
                aria-labelledby="tab-audio"
                className="space-y-4 animate-fadeIn"
              >
                {/* Volume & Mute Controller Card */}
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {lang === "id" ? "Volume Master Audio" : "Master Audio Volume"}
                        </h4>
                        <p className="text-[10px] text-gray-400">
                          {lang === "id" 
                            ? "Sintesis Web Audio API beresolusi tinggi dengan kompresi analog lembut" 
                            : "High-resolution Web Audio API synthesis with soft analog limiting"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleMute}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAudioMuted
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                      }`}
                    >
                      {isAudioMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>{lang === "id" ? "Suara Bisu" : "Muted"}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{lang === "id" ? "Suara Aktif" : "Active"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10.5px] font-mono text-gray-300">
                      <span>0%</span>
                      <span className="font-bold text-emerald-400">{Math.round(soundVolume * 100)}%</span>
                      <span>100%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      onMouseUp={() => soundManager.playClick()}
                      onTouchEnd={() => soundManager.playClick()}
                      className="w-full accent-emerald-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Sound FX Interactive Showcase Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                      {lang === "id" ? "Uji Efek Suara Profesional" : "Test Professional Sound FX"}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      {lang === "id" ? "Klik kartu untuk mendengarkan" : "Click card to preview"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: "click",
                        title: lang === "id" ? "Haptic Click" : "Haptic Click",
                        desc: lang === "id" ? "Klik tombol, tab & navigasi" : "Button clicks & tabs",
                        icon: "🔔",
                        fn: () => soundManager.playClick(),
                      },
                      {
                        id: "kick",
                        title: lang === "id" ? "Tendangan Kulit Bola" : "Leather Ball Kick",
                        desc: lang === "id" ? "Geser & lepas pemain lapangan" : "Player pitch placement",
                        icon: "⚽",
                        fn: () => soundManager.playKick(),
                      },
                      {
                        id: "whistle",
                        title: lang === "id" ? "Peluit Wasit Sonik" : "Referee Whistle",
                        desc: lang === "id" ? "Fox 40 Sonik peluit lapangan" : "Authentic match whistle",
                        icon: "📢",
                        fn: () => soundManager.playWhistle(),
                      },
                      {
                        id: "whistleDouble",
                        title: lang === "id" ? "Peluit Ganda (Jeda)" : "Double Whistle",
                        desc: lang === "id" ? "Transisi babak & strategi" : "Phase & tactical change",
                        icon: "🎺",
                        fn: () => soundManager.playWhistleDouble(),
                      },
                      {
                        id: "chime",
                        title: lang === "id" ? "Melodi Sukses Kaca" : "Celesta Glass Chime",
                        desc: lang === "id" ? "Simpan formasi & eksekusi AI" : "Save playbook & AI success",
                        icon: "✨",
                        fn: () => soundManager.playChime(),
                      },
                      {
                        id: "crowd",
                        title: lang === "id" ? "Sorak Riuh Stadion" : "Stadium Crowd Roar",
                        desc: lang === "id" ? "Selesai simulasi tayangan TV" : "Broadcast simulation finish",
                        icon: "🏟️",
                        fn: () => soundManager.playCrowdCheer(),
                      },
                      {
                        id: "sweep",
                        title: lang === "id" ? "Sapu Bersih Papan" : "Board Air Sweep",
                        desc: lang === "id" ? "Reset formasi & hapus garis" : "Reset pitch & clear drawing",
                        icon: "🧹",
                        fn: () => soundManager.playSweep(),
                      },
                      {
                        id: "scribble",
                        title: lang === "id" ? "Spidol Papan Tulis" : "Dry-Erase Marker",
                        desc: lang === "id" ? "Menggambar panah & anotasi" : "Drawing arrows & zones",
                        icon: "🖊️",
                        fn: () => soundManager.playScribble(),
                      },
                      {
                        id: "anthem",
                        title: lang === "id" ? "Fanfare Orkestra" : "Champions Fanfare",
                        desc: lang === "id" ? "Lagu megah Broadcast TV" : "Majestic orchestral fanfare",
                        icon: "🏆",
                        fn: () => soundManager.playChampionsAnthem(),
                      },
                      {
                        id: "pop",
                        title: lang === "id" ? "Micro Pop" : "Micro Haptic Pop",
                        desc: lang === "id" ? "Toggle switch & menu kecil" : "Mini switches & toggles",
                        icon: "🫧",
                        fn: () => soundManager.playPop(),
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => playPreviewSound(item.id, item.fn)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          recentSoundPlayed === item.id
                            ? "bg-emerald-500/20 border-emerald-400/50 scale-[1.02] shadow-lg shadow-emerald-500/10"
                            : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-white truncate flex items-center justify-between">
                            <span>{item.title}</span>
                            {recentSoundPlayed === item.id && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            )}
                          </div>
                          <p className="text-[9.5px] text-gray-400 line-clamp-1 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DISPLAY / DEVICE MODE */}
            {activeTab === "display" && (
              <div id="panel-display" role="tabpanel" aria-labelledby="tab-display" className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      {lang === "id" ? "Mode Tampilan Aplikasi (PC & Windows)" : "App Display Mode (PC & Windows)"}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {deviceMode === "android" ? (lang === "id" ? "Mode Android Aktif" : "Android Mode Active") : (lang === "id" ? "Mode PC Aktif" : "PC Mode Active")}
                    </span>
                  </label>
                  <p className="text-[11px] text-gray-400 mb-3">
                    {lang === "id"
                      ? "Sesuaikan tata letak pada PC/Windows agar menyerupai tampilan aplikasi di Android dengan navigasi tab bawah yang ringkas dan nyaman."
                      : "Adapt layout on PC/Windows to match Android app presentation with compact, comfortable bottom navigation."}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Android Mode Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeviceMode("android");
                        soundManager.playClick();
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                        deviceMode === "android"
                          ? "bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                          : "bg-white/5 border-white/10 hover:border-white/20 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-extrabold text-white">
                            {lang === "id" ? "📱 Mode Android (Disarankan)" : "📱 Android Mode (Recommended)"}
                          </span>
                        </div>
                        {deviceMode === "android" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        )}
                      </div>
                      <p className="text-[10.5px] text-gray-400 leading-relaxed">
                        {lang === "id"
                          ? "Tampilan terpusat dengan bar status Android, navigasi tab bawah (Lapangan, Skuad, Animasi, AI), dan tata letak bebas distraksi."
                          : "Centered view with Android status bar, bottom navigation tabs (Pitch, Squad, Animation, AI), and distraction-free flow."}
                      </p>
                    </button>

                    {/* PC Mode Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeviceMode("pc");
                        soundManager.playClick();
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                        deviceMode === "pc"
                          ? "bg-blue-500/15 border-blue-500/50 shadow-md shadow-blue-500/10"
                          : "bg-white/5 border-white/10 hover:border-white/20 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-extrabold text-white">
                            {lang === "id" ? "💻 Mode PC (Multi-Kolom)" : "💻 PC Mode (Multi-Column)"}
                          </span>
                        </div>
                        {deviceMode === "pc" && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                        )}
                      </div>
                      <p className="text-[10.5px] text-gray-400 leading-relaxed">
                        {lang === "id"
                          ? "Tampilan desktop multi-kolom berdampingan untuk monitor lebar (Klub di kiri, Lapangan di tengah, Animasi & AI di kanan)."
                          : "Side-by-side desktop multi-column layout for wide monitors (Club left, Pitch center, Animation & AI right)."}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Viewport Width Preset (when in Android Mode) */}
                <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-xl space-y-2.5">
                  <span className="text-xs font-bold text-gray-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Tablet className="w-3.5 h-3.5 text-indigo-400" />
                    {lang === "id" ? "Format Lebar Layar Android di PC" : "Android Screen Width Preset on PC"}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAndroidViewport("phone");
                        soundManager.playClick();
                      }}
                      className={`p-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        androidViewport === "phone"
                          ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                          : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{lang === "id" ? "HP (440px)" : "Phone (440px)"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAndroidViewport("tablet");
                        soundManager.playClick();
                      }}
                      className={`p-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        androidViewport === "tablet"
                          ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                          : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                      <span>{lang === "id" ? "Tablet (780px)" : "Tablet (780px)"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAndroidViewport("fluid");
                        soundManager.playClick();
                      }}
                      className={`p-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        androidViewport === "fluid"
                          ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                          : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>{lang === "id" ? "Penuh (100%)" : "Fluid (100%)"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] text-gray-500 font-medium">
              Tactigen Pro Settings Portal v2
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl hover:border-white/20 transition-all font-bold text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                {lang === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={saveSuccess}
                className={`px-5 py-2 rounded-xl text-white font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                  saveSuccess
                    ? "bg-emerald-600 shadow-emerald-500/10"
                    : activeTab === "gemini"
                      ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/10 font-bold"
                      : activeTab === "audio"
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10 font-bold"
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/10 font-bold"
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{lang === "id" ? "Tersimpan!" : "Saved!"}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{lang === "id" ? "Simpan Pengaturan" : "Save Settings"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
