import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Save, 
  FolderOpen, 
  Trash2, 
  Copy, 
  Plus, 
  Calendar, 
  RefreshCw, 
  Check, 
  Upload, 
  AlertCircle
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  number: number;
  role: "FWD" | "MID" | "DEF" | "GK" | string;
  x: number;
  y: number;
  isStarting: boolean;
  photo: string | null;
}

interface TacticalItem {
  id: string;
  type: "ball" | "cone" | "enemy";
  x: number;
  y: number;
  number?: number;
  role?: string;
}

interface SavedPlaybook {
  id: string;
  name: string;
  date: string;
  formation: string;
  teamName: string;
  teamLogo: string | null;
  primaryColor: string;
  gkColor: string;
  numberColor: string;
  players: Player[];
  items: TacticalItem[];
  sportMode?: string;
}

interface PlaybookSaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "save" | "load";
  lang: "id" | "en";
  players: Player[];
  items: TacticalItem[];
  formation: string;
  teamName: string;
  teamLogo: string | null;
  primaryColor: string;
  gkColor: string;
  numberColor: string;
  sportMode?: string;
  onLoadPlaybook: (data: {
    players: Player[];
    items: TacticalItem[];
    formation: any;
    teamName: string;
    teamLogo: string | null;
    primaryColor: string;
    gkColor: string;
    numberColor: string;
    sportMode?: any;
  }) => void;
}

export const PlaybookSaveLoadModal: React.FC<PlaybookSaveLoadModalProps> = ({
  isOpen,
  onClose,
  mode,
  lang,
  players,
  items,
  formation,
  teamName,
  teamLogo,
  primaryColor,
  gkColor,
  numberColor,
  sportMode,
  onLoadPlaybook
}) => {
  const [playbooks, setPlaybooks] = useState<SavedPlaybook[]>([]);
  const [newSaveName, setNewSaveName] = useState("");
  const [importCode, setImportCode] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showImportArea, setShowImportArea] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const isId = lang === "id";

  // Load playbooks from localStorage on mount & when open
  useEffect(() => {
    if (isOpen) {
      loadSavedPlaybooks();
      const defaultName = isId 
        ? `Taktik ${formation} ${teamName} - ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`
        : `Playbook ${formation} ${teamName} - ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" })}`;
      setNewSaveName(defaultName);
      setImportError(null);
      setImportCode("");
    }
  }, [isOpen]);

  const loadSavedPlaybooks = () => {
    try {
      const stored = localStorage.getItem("tactigen_saved_playbooks");
      if (stored) {
        setPlaybooks(JSON.parse(stored));
      } else {
        setPlaybooks([]);
      }
    } catch (e) {
      console.error("Failed to load saved templates", e);
    }
  };

  const handleCreateSave = (nameOverride?: string) => {
    const finalName = (nameOverride || newSaveName || `Tactigen ${formation}`).trim();
    const newPlaybook: SavedPlaybook = {
      id: `tb-${Date.now()}`,
      name: finalName,
      date: new Date().toLocaleString(isId ? "id-ID" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      formation,
      teamName,
      teamLogo,
      primaryColor,
      gkColor,
      numberColor,
      players,
      items,
      sportMode
    };

    const updated = [newPlaybook, ...playbooks];
    try {
      localStorage.setItem("tactigen_saved_playbooks", JSON.stringify(updated));
      setPlaybooks(updated);
      setNewSaveName("");
      // Flash temporary success action
      if (isId) {
        alert(`Berhasil menyimpan taktik: "${finalName}"`);
      } else {
        alert(`Successfully saved playbook: "${finalName}"`);
      }
    } catch (e) {
      console.error(e);
      alert(isId ? "Penyimpanan gagal. Memori penuh." : "Saving failed. Store capacity exceeded.");
    }
  };

  const handleOverwrite = (id: string, name: string) => {
    if (!window.confirm(isId ? `Apakah Anda yakin ingin menimpa data di slot "${name}" dengan formasi & skuad saat ini?` : `Are you sure you want to overwrite slot "${name}" with current formation & squad?`)) {
      return;
    }

    const updated = playbooks.map((pb) => {
      if (pb.id === id) {
        return {
          ...pb,
          date: new Date().toLocaleString(isId ? "id-ID" : "en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          formation,
          teamName,
          teamLogo,
          primaryColor,
          gkColor,
          numberColor,
          players,
          items,
          sportMode
        };
      }
      return pb;
    });

    try {
      localStorage.setItem("tactigen_saved_playbooks", JSON.stringify(updated));
      setPlaybooks(updated);
      alert(isId ? "Berhasil diperbarui!" : "Overwritten successfully!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(isId ? `Hapus slot taktik "${name}"?` : `Delete blueprint "${name}"?`)) {
      return;
    }
    const updated = playbooks.filter((p) => p.id !== id);
    try {
      localStorage.setItem("tactigen_saved_playbooks", JSON.stringify(updated));
      setPlaybooks(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoad = (pb: SavedPlaybook) => {
    onLoadPlaybook({
      players: pb.players,
      items: pb.items || [],
      formation: pb.formation,
      teamName: pb.teamName,
      teamLogo: pb.teamLogo,
      primaryColor: pb.primaryColor,
      gkColor: pb.gkColor,
      numberColor: pb.numberColor,
      sportMode: pb.sportMode
    });
    onClose();
  };

  // Modern Export / Import Clipboard Code
  const handleCopyCode = (pb: SavedPlaybook) => {
    try {
      const json = JSON.stringify(pb);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      navigator.clipboard.writeText(b64);
      setCopiedId(pb.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("Export copy failed", e);
    }
  };

  const handleImportCodeAction = () => {
    setImportError(null);
    if (!importCode.trim()) {
      setImportError(isId ? "Kode import tidak boleh kosong." : "Import code cannot be empty.");
      return;
    }

    try {
      const decoded = decodeURIComponent(escape(atob(importCode.trim())));
      const parsed = JSON.parse(decoded);
      
      // Basic validations
      if (!parsed.players || !parsed.formation || !parsed.teamName) {
        throw new Error("Invalid structure");
      }

      // Generate unique ID
      const importedPlaybook: SavedPlaybook = {
        ...parsed,
        id: `tb-import-${Date.now()}`,
        name: `[IMPORTED] ${parsed.name || parsed.formation}`
      };

      const updated = [importedPlaybook, ...playbooks];
      localStorage.setItem("tactigen_saved_playbooks", JSON.stringify(updated));
      setPlaybooks(updated);
      setImportCode("");
      setShowImportArea(false);
      alert(isId ? "Taktik berhasil di-import masuk ke list!" : "Tactics successfully imported into slot list!");
    } catch (e) {
      setImportError(isId ? "Kode salah atau format tidak kompatibel!" : "Invalid checkout cryptcode or corrupted file!");
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-[5600] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="playbook-modal-title"
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        className="bg-[#0b0c10] border border-white/[0.08] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Header bar */}
        <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-emerald-950/20 via-[#0a0b0e] to-blue-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              mode === "save" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            }`}>
              {mode === "save" ? <Save className="w-4.5 h-4.5" aria-hidden="true" /> : <FolderOpen className="w-4.5 h-4.5" aria-hidden="true" />}
            </div>
            <div>
              <h3 id="playbook-modal-title" className="text-sm sm:text-base font-black text-white tracking-wide uppercase font-sans">
                {mode === "save" 
                  ? (isId ? "💾 Simpan Skuad & Formasi" : "💾 Save Squad & Formation")
                  : (isId ? "📂 Muat Taktik Tersimpan" : "📂 Load Saved Formation")
                }
              </h3>
              <p className="text-[10px] text-gray-400 font-sans">
                {isId 
                  ? "Kelola blueprint taktik, susunan starting XI, jersey, serta kustomisasi logo"
                  : "Pick a saved strategy blueprint, starting lineups, kit colors & customized logos"
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            aria-label={isId ? "Tutup panel" : "Close panel"}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Dynamic Save Section */}
        {mode === "save" && (
          <div className="p-4 sm:p-5 bg-emerald-950/5 border-b border-white/5 space-y-3">
            <label htmlFor="playbook-save-name-input" className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block cursor-pointer">
              {isId ? "📝 BUAT SLOT PENYIMPANAN BARU" : "📝 CREATE NEW PLAYBOOK SLOT"}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="playbook-save-name-input"
                type="text"
                value={newSaveName}
                onChange={(e) => setNewSaveName(e.target.value)}
                placeholder={isId ? "Contoh: Taktik Agresif Semifinal" : "e.g. Semifinal Ultra Offensive"}
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors font-bold"
              />
              <button
                onClick={() => handleCreateSave()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-emerald-950/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{isId ? "Simpan Sekarang" : "Save Now"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Content View list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Quick Import Share toggle */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
            <button
              onClick={() => setShowImportArea(!showImportArea)}
              className="w-full flex items-center justify-between text-[11px] font-black tracking-wider text-gray-400 hover:text-white uppercase transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-lg"
              aria-expanded={showImportArea}
              aria-controls="import-area-content"
            >
              <span className="flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                {isId ? "📲 Punya Kode Share? Import Skuad" : "📲 Have a Share Code? Import Tactics"}
              </span>
              <span className="text-[10px] text-indigo-400">{showImportArea ? "✕ Close" : "+ Expand"}</span>
            </button>

            {showImportArea && (
              <div id="import-area-content" className="mt-3 pt-3 border-t border-white/5 space-y-2">
                <p className="text-[10px] text-gray-400 font-medium pb-1">
                  {isId 
                    ? "Masukkan kode serial (Base64) yang disalin dari tim kawan untuk merekonstruksi posisi taktik secara instan."
                    : "Paste the copied tactical cryptographic string from your companion to unlock the playbook line-ups."
                  }
                </p>
                <textarea
                  id="playbook-import-code-textarea"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder={isId ? "Paste kode share di sini..." : "Paste share code string here..."}
                  rows={2}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-[10px] text-white focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono tracking-tighter"
                  aria-label={isId ? "Masukkan kode share taktik" : "Enter tactical share code"}
                />
                
                {importError && (
                  <div className="flex items-center gap-1.5 text-[9.5px] text-rose-400 bg-rose-950/20 px-2.5 py-1.5 rounded-lg border border-rose-500/15" role="alert">
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{importError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={handleImportCodeAction}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                    {isId ? "Proses Import" : "Apply Code"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* List display */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest block select-none">
                {isId ? `📋 SEMUA SLOT TAKTIK (${playbooks.length})` : `📋 SAVED BLUEPRINTS (${playbooks.length})`}
              </h4>
              <button
                onClick={loadSavedPlaybooks}
                className="p-1 hover:bg-white/5 text-gray-500 hover:text-white rounded transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                aria-label={isId ? "Segarkan daftar" : "Refresh list"}
                title="Refresh slots"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>

            {playbooks.length === 0 ? (
              <div className="p-10 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center text-gray-500 select-none space-y-2">
                <span className="text-3xl" role="img" aria-label="Inbox empty">📭</span>
                <p className="text-xs font-bold">{isId ? "Tidak ada formasi tersimpan." : "No tactics discovered in storage."}</p>
                <p className="text-[10px] text-gray-600 leading-relaxed max-w-xs">
                  {isId 
                    ? "Gunakan input di atas untuk menyimpan rancangan skema Anda saat ini agar bisa dibuka kapan saja."
                    : "Draw lineups, adjust jersey patterns and hit Save to populate storage lists fast!"
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pr-1">
                {playbooks.map((pb) => {
                  const startingXI = pb.players?.filter(p => p.isStarting).length || 0;
                  const sideline = pb.players?.filter(p => !p.isStarting).length || 0;

                  return (
                    <div 
                      key={pb.id}
                      className="bg-white/[0.02] border border-white/5 hover:border-white/12 rounded-2xl p-4.5 flex flex-col justify-between transition-colors space-y-3.5 relative overflow-hidden group shadow-lg"
                    >
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-black tracking-widest font-mono">
                            {pb.formation}
                          </span>
                          <span className="text-[9px] text-[#5e6680] font-bold flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-zinc-650" aria-hidden="true" />
                            {pb.date.split(",")[0]}
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-white leading-snug line-clamp-1">{pb.name}</h5>
                        <p className="text-[9px] text-gray-500 leading-none">
                          {pb.teamName} • {startingXI} XI / {sideline} Bench
                        </p>
                      </div>

                      {/* Visual metadata color tags */}
                      <div className="flex items-center gap-3 bg-black/35 rounded-xl px-2.5 py-1.5 w-fit border border-white/5">
                        <div className="flex gap-1.5 items-center">
                          <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: pb.primaryColor }} title="Primary Jersey" role="img" aria-label="Primary kit color" />
                          <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: pb.gkColor }} title="GK Jersey" role="img" aria-label="GK kit color" />
                          <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center bg-black/60" title="Number color" role="img" aria-label="Backnumber color">
                            <span className="text-[6.5px] font-black" style={{ color: pb.numberColor }}>10</span>
                          </div>
                        </div>
                        {pb.items && pb.items.length > 0 && (
                          <div className="text-[8px] text-gray-400 font-bold border-l border-white/10 pl-2">
                            ⚽ x{pb.items.filter(i => i.type === "ball").length} • Cone x{pb.items.filter(i => i.type === "cone").length}
                          </div>
                        )}
                      </div>

                      {/* Interactive Buttons footer bar */}
                      <div className="flex gap-1.5 items-center pt-2.5 border-t border-white/[0.04]">
                        <button
                          onClick={() => handleLoad(pb)}
                          className="flex-1 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-[10px] py-1.5 rounded-lg text-center transition-all cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                        >
                          {isId ? "Muat" : "Load"}
                        </button>

                        <button
                          onClick={() => handleOverwrite(pb.id, pb.name)}
                          className="p-1.5 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 text-gray-400 border border-transparent rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                          aria-label={isId ? `Timpa slot ${pb.name} dengan taktik saat ini` : `Overwrite slot ${pb.name} with current state`}
                          title={isId ? "Timpa dengan taktik saat ini" : "Overwrite with current state"}
                        >
                          <Save className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        </button>

                        <button
                          onClick={() => handleCopyCode(pb)}
                          className={`p-1.5 border rounded-lg transition-all cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                            copiedId === pb.id
                              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                              : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                          aria-label={isId ? `Salin Kode Share Taktik ${pb.name}` : `Copy Shared Code for ${pb.name}`}
                          title={isId ? "Salin Kode Share Taktik" : "Copy Shared Code"}
                        >
                          {copiedId === pb.id ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />}
                        </button>

                        <button
                          onClick={() => handleDelete(pb.id, pb.name)}
                          className="p-1.5 bg-rose-950/20 hover:bg-rose-950/45 text-rose-400 hover:text-rose-300 border border-rose-900/10 hover:border-rose-900/30 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                          aria-label={isId ? `Hapus slot taktik ${pb.name}` : `Delete blueprint ${pb.name}`}
                          title={isId ? "Hapus playbook" : "Delete playbook"}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer info line */}
        <div className="p-4 bg-[#08090c] border-t border-white/5 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4.5 py-2 bg-[#17181f] hover:bg-[#20212b] border border-white/5 hover:border-white/15 text-gray-300 hover:text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            {isId ? "Tutup" : "Close"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
