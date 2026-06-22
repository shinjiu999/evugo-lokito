import { useState } from "react";
import { Player } from "../types";
import { Import, Clipboard, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";

interface SquadImportProps {
  onImport: (newPlayers: Player[]) => void;
  lang?: "id" | "en";
}

export default function SquadImport({ onImport, lang = "id" }: SquadImportProps) {
  const [text, setText] = useState("");
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleImport = () => {
    if (!text.trim()) return;

    const lines = text.split("\n");
    const parsedList: Player[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Clean characters tabs, commas, semi-colons
      const sanitized = trimmed.replace(/\t|,|;/g, " ").replace(/\s+/g, " ");
      const parts = sanitized.split(" ");

      let number = 10;
      let name = "";
      let role: "GK" | "DEF" | "MID" | "FWD" = "MID";

      // Look for a number
      const numberIdx = parts.findIndex((p) => !isNaN(parseInt(p)));
      if (numberIdx !== -1) {
        number = parseInt(parts[numberIdx]);
        parts.splice(numberIdx, 1);
      }

      // Read remaining parts
      if (parts.length > 0) {
        const lastWord = parts[parts.length - 1].toUpperCase();
        if (["GK", "DEF", "MID", "FWD", "ST", "CB", "CM", "CF"].includes(lastWord)) {
          const rawRole = parts.pop()!.toUpperCase();
          if (["ST", "CF"].includes(rawRole)) role = "FWD";
          else if (["CB", "LB", "RB"].includes(rawRole)) role = "DEF";
          else if (["CM", "CDM", "CAM"].includes(rawRole)) role = "MID";
          else role = rawRole as any;
        }
        name = parts.join(" ");
      } else {
        name = `Pemain ${idx + 1}`;
      }

      parsedList.push({
        id: `squad-player-${Date.now()}-${idx}`,
        name,
        number,
        role,
        x: 0,
        y: 0,
        isStarting: false,
        photo: null
      });
    });

    if (parsedList.length > 0) {
      // Allocate positions based on Starting XI and Bench
      parsedList.forEach((player, index) => {
        if (index < 11) {
          player.isStarting = true;
          // Grid pattern positions to prevent overlaps
          player.x = 20 + (index % 4) * 20;
          player.y = 20 + Math.floor(index / 4) * 22;
        } else {
          player.isStarting = false;
        }
      });

      onImport(parsedList);
      setText("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handlePasteDemo = () => {
    setText(
      `1 Nando GK\n4 Idzes DEF\n5 Ridho DEF\n6 Walsh DEF\n3 Pratama DEF\n8 Haye MID\n19 Hubner MID\n11 Jenner MID\n7 Marselino FWD\n9 Struick FWD\n10 Oratmangoen FWD\n12 Asnawi DEF\n22 Witan MID\n14 Sananta FWD`
    );
  };

  const t = {
    title: lang === "id" ? "📥 Pengimpor Skuad Pintar" : "📥 Smart Squad Importer",
    pasteDemo: lang === "id" ? "Tempel Demo" : "Paste Demo",
    hintText: lang === "id" ? "Tempel daftar skuad dari Notepad / Excel. Gunakan format:" : "Paste squad roster from Notepad / Excel. Use format:",
    placeholder: lang === "id" ? "Contoh:\n10 Messi FWD\n7 Ronaldo FWD\n4 Van Dijk DEF" : "Example:\n10 Messi FWD\n7 Ronaldo FWD\nvan Dijk DEF",
    importSuccess: lang === "id" ? "Impor Skuad Berhasil!" : "Squad Successfully Imported!",
    applyButton: lang === "id" ? "Terapkan Skuad Baru" : "Apply New Squad"
  };

  return (
    <div className="relative group/importer">
      <button
        onClick={() => setIsOpen(true)}
        className="h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border bg-[#0b0c10]/65 hover:bg-[#0b0c10]/85 border-white/[0.08] hover:border-emerald-500/30 text-gray-300 hover:text-white shadow-xl backdrop-blur-md active:scale-95 text-[9.5px] sm:text-[11px] font-black tracking-wide"
      >
        <Import className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
        <span>{lang === "id" ? "Impor Skuad" : "Roster Import"}</span>
      </button>
      
      {/* Tooltip Overlay help */}
      <div className="absolute right-0 bottom-full mb-2 opacity-0 scale-90 pointer-events-none group-hover/importer:opacity-100 group-hover/importer:scale-100 transition-all duration-150 bg-[#0e1017]/95 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-2xl z-50 flex flex-col items-end gap-0.5 backdrop-blur-md whitespace-nowrap">
        <span className="text-[8px] font-black tracking-widest text-[#5e6680] uppercase">ROSTER BULK IMPORT</span>
        <span className="text-white font-extrabold text-[9px]">{lang === "id" ? "Tempel draf daftar pemain" : "Paste custom roster list"}</span>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-md bg-[#0e111a]/95 border border-white/10 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.8)] relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-2">
                <Import className="w-4 h-4 text-emerald-400" />
                {t.title}
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Instruction Banner with Demo Preset Trigger */}
            <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/[0.05] mb-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-[#5e6680] font-black uppercase tracking-wider">
                  {lang === "id" ? "ATURAN FORMAT" : "FORMAT RULES"}
                </span>
                <p className="text-[9.5px] text-gray-300 font-medium">
                  {t.hintText} <code className="text-emerald-400 font-mono">[No] [Nama] [Posisi]</code>
                </p>
              </div>
              <button
                onClick={handlePasteDemo}
                className="text-[9px] font-black text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0 select-none"
              >
                <Clipboard className="w-3 h-3" /> {t.pasteDemo}
              </button>
            </div>

            {/* Core Text Input for Players */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              rows={8}
              className="w-full bg-black/45 border border-white/10 rounded-2xl text-white font-mono text-[10.5px] p-3 focus:outline-none focus:border-emerald-500/75 focus:ring-1 focus:ring-emerald-500/35 placeholder-gray-700 mb-4"
            />

            {/* Apply Action Trigger Button */}
            <button
              onClick={() => {
                handleImport();
                // Close modal after brief success timeout delay to let the user see the success state
                setTimeout(() => {
                  setIsOpen(false);
                }, 1200);
              }}
              disabled={!text.trim()}
              className={`w-full py-3 rounded-2xl text-xs font-black transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 border cursor-pointer ${
                success
                  ? "bg-green-600 text-white border-green-500"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/20 disabled:opacity-50"
              }`}
            >
              {success ? (
                <>
                  <Check className="w-4 h-4 text-white" /> {t.importSuccess}
                </>
              ) : (
                <>
                  <Import className="w-4 h-4" /> {t.applyButton}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
