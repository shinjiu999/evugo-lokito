import { useState } from "react";
import { Player } from "../types";
import { Import, Clipboard, Sparkles, Check } from "lucide-react";
import { NanoBananaLogo, ToolHoverTooltip } from "./NanoBananaToolIcon";

interface SquadImportProps {
  onImport: (newPlayers: Player[]) => void;
  lang?: "id" | "en";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export default function SquadImport({
  onImport,
  lang = "id",
  isOpen: controlledIsOpen,
  onOpenChange,
  hideTrigger = false
}: SquadImportProps) {
  const [text, setText] = useState("");
  const [success, setSuccess] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setModalOpen = (open: boolean) => {
    if (onOpenChange) onOpenChange(open);
    if (controlledIsOpen === undefined) setInternalIsOpen(open);
  };

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
      `1 Player 1 GK\n2 Player 2 DEF\n3 Player 3 DEF\n4 Player 4 DEF\n5 Player 5 DEF\n6 Player 6 MID\n7 Player 7 MID\n8 Player 8 MID\n9 Player 9 FWD\n10 Player 10 FWD\n11 Player 11 FWD\n12 Player 12 DEF\n13 Player 13 MID\n14 Player 14 FWD`
    );
  };

  const t = {
    title: lang === "id" ? "📥 Pengimpor Skuad Pintar" : "📥 Smart Squad Importer",
    pasteDemo: lang === "id" ? "Tempel Demo" : "Paste Demo",
    hintText: lang === "id" ? "Tempel daftar skuad dari Notepad / Excel. Gunakan format:" : "Paste squad roster from Notepad / Excel. Use format:",
    placeholder: lang === "id" ? "Contoh:\n1 Player 1 GK\n4 Player 4 DEF\n10 Player 10 FWD" : "Example:\n1 Player 1 GK\n4 Player 4 DEF\n10 Player 10 FWD",
    importSuccess: lang === "id" ? "Impor Skuad Berhasil!" : "Squad Successfully Imported!",
    applyButton: lang === "id" ? "Terapkan Skuad Baru" : "Apply New Squad"
  };

  return (
    <div className={hideTrigger ? "" : "relative group shrink-0"}>
      {!hideTrigger && (
        <>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center transition-all cursor-pointer border bg-[#06151a]/90 hover:bg-[#09222a] border-teal-400/30 hover:border-teal-400/60 text-teal-100 hover:text-white shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
            aria-label={lang === "id" ? "Impor Skuad" : "Roster Import"}
          >
            <NanoBananaLogo tool="import" size="sm" />
          </button>

          <ToolHoverTooltip
            category={lang === "id" ? "IMPOR SKUAD" : "BULK IMPORT"}
            title={lang === "id" ? "Impor Daftar Pemain" : "Import Squad Roster"}
            align="right"
          />
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn" onClick={() => setModalOpen(false)}>
          <div 
            className="w-full max-w-md bg-[#071912]/98 border border-emerald-500/30 ring-1 ring-emerald-400/20 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-emerald-500/20">
              <span className="text-xs font-black text-emerald-200 tracking-wider uppercase flex items-center gap-2">
                <Import className="w-4 h-4 text-emerald-400" />
                {t.title}
              </span>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Instruction Banner with Demo Preset Trigger */}
            <div className="flex justify-between items-center bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/15 mb-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-emerald-400 font-black uppercase tracking-wider">
                  {lang === "id" ? "ATURAN FORMAT" : "FORMAT RULES"}
                </span>
                <p className="text-[9.5px] text-gray-300 font-medium">
                  {t.hintText} <code className="text-emerald-400 font-mono">[No] [Nama] [Posisi]</code>
                </p>
              </div>
              <button
                onClick={handlePasteDemo}
                className="text-[9px] font-black text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 rounded-lg border border-emerald-500/30 shrink-0 select-none"
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
              className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl text-white font-mono text-[10.5px] p-3 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 placeholder-gray-600 mb-4"
            />

            {/* Apply Action Trigger Button */}
            <button
              onClick={() => {
                handleImport();
                // Close modal after brief success timeout delay to let the user see the success state
                setTimeout(() => {
                  setModalOpen(false);
                }, 1200);
              }}
              disabled={!text.trim()}
              className={`w-full py-3 rounded-2xl text-xs font-black transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 border cursor-pointer ${
                success
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
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
