import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Settings, Key, Network, Check, HelpCircle, Eye, EyeOff } from "lucide-react";
import { soundManager } from "../utils/sound";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  lang?: "id" | "en";
}

export function SettingsModal({ isOpen, onClose, onSave, lang = "id" }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"gemini" | "mcp">("gemini");
  
  // Local state initialized from localStorage
  const [customApiKey, setCustomApiKey] = useState("");
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [mcpUrl, setMcpUrl] = useState("http://localhost:3015/mcp");
  const [mcpTool, setMcpTool] = useState("pitch-scout-analyzer");
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load values from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomApiKey(localStorage.getItem("tactigen_custom_key") || "");
      setMcpEnabled(localStorage.getItem("tactigen_mcp_enabled") === "true");
      setMcpUrl(localStorage.getItem("tactigen_mcp_url") || "http://localhost:3015/mcp");
      setMcpTool(localStorage.getItem("tactigen_mcp_tool") || "pitch-scout-analyzer");
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("tactigen_custom_key", customApiKey.trim());
    localStorage.setItem("tactigen_mcp_enabled", String(mcpEnabled));
    localStorage.setItem("tactigen_mcp_url", mcpUrl.trim());
    localStorage.setItem("tactigen_mcp_tool", mcpTool.trim());
    
    // Play sound effect for successful change
    try {
      soundManager.playWhistle();
    } catch (e) {}

    setSaveSuccess(true);
    onSave();
    
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[6000] flex items-center justify-center p-4">
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
                <Settings className="w-4 h-4 animate-spin" style={{ animationDuration: "8s" }} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide uppercase font-sans">
                  {lang === "id" ? "Pengaturan Akses AI & MCP kustom" : "Custom AI & MCP Access Settings"}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium font-mono">
                  {lang === "id" ? "Konfigurasi API Google Gemini atau Model Context Protocol" : "Configure Google Gemini API or Model Context Protocol"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/5 bg-black/20 p-1">
            <button
              onClick={() => setActiveTab("gemini")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-lg ${
                activeTab === "gemini"
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Google Gemini API Key</span>
            </button>
            <button
              onClick={() => setActiveTab("mcp")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-lg ${
                activeTab === "mcp"
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Model Context Protocol (MCP)</span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            
            {/* 1. Google Gemini Key Tab */}
            {activeTab === "gemini" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Instructions Box */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {lang === "id" ? "Cara Mendapatkan Kunci API Google Gemini:" : "How to get your Google Gemini API Key:"}
                  </h4>
                  <ol className="list-decimal list-inside text-[10.5px] text-gray-300 space-y-1.5 leading-relaxed">
                    <li>
                      {lang === "id" ? "Buka platform resmi " : "Go to "}
                      <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-bold inline-flex items-center gap-0.5">
                        Google AI Studio ↗
                      </a>
                    </li>
                    <li>{lang === "id" ? "Masuk atau login menggunakan Akun Google Anda." : "Sign in using your default Google Account."}</li>
                    <li>{lang === "id" ? "Klik tombol berwarna biru bertuliskan 'Get API Key'." : "Click the prominent 'Get API Key' button in the dashboard."}</li>
                    <li>{lang === "id" ? "Buat kunci API kustom baru, salin, dan rekatkan di kolom bawah ini." : "Create a new custom API Key, copy it, and paste it into the input below."}</li>
                  </ol>
                  <p className="text-[9px] text-gray-500 font-medium">
                    {lang === "id" 
                      ? "💡 Mengapa ini wajib? Untuk memastikan keamanan penggunaan bebas kuota secara eksklusif bagi kebutuhan taktis Anda."
                      : "💡 Why is this needed? To ensure uninterrupted, rate-limit-free video and tactical analytics customized just for you."}
                  </p>
                </div>

                {/* API Key Input */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    {lang === "id" ? "🔑 Kunci API Google Gemini Anda" : "🔑 Your Google Gemini API Key"}
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-black/40 border border-white/10 text-xs rounded-xl pl-3 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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
              <div className="space-y-4 animate-fadeIn">
                {/* Instructions Box */}
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5" />
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
                      onClick={() => setMcpEnabled(!mcpEnabled)}
                      className={`w-12 h-6.5 rounded-full p-1 transition-all ${
                        mcpEnabled ? "bg-indigo-600" : "bg-white/10"
                      }`}
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
                        <label className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider">
                          {lang === "id" ? "Alamat Endpoint Server MCP" : "MCP Server Endpoint URL"}
                        </label>
                        <input
                          type="text"
                          value={mcpUrl}
                          onChange={(e) => setMcpUrl(e.target.value)}
                          placeholder="e.g., http://localhost:3015/mcp"
                          className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Tool identifier */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider">
                          {lang === "id" ? "Nama Tool MCP" : "MCP Tool Name"}
                        </label>
                        <input
                          type="text"
                          value={mcpTool}
                          onChange={(e) => setMcpTool(e.target.value)}
                          placeholder="pitch-scout-analyzer"
                          className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}
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
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl hover:border-white/20 transition-all font-bold text-xs cursor-pointer"
              >
                {lang === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={saveSuccess}
                className={`px-5 py-2 rounded-xl text-white font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-lg ${
                  saveSuccess
                    ? "bg-emerald-600 shadow-emerald-500/10"
                    : activeTab === "gemini"
                      ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/10"
                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/10"
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === "id" ? "Tersimpan!" : "Saved!"}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
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
