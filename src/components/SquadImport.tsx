import { useState } from "react";
import { Player } from "../types";
import { Import, Clipboard, Sparkles, Check } from "lucide-react";

interface SquadImportProps {
  onImport: (newPlayers: Player[]) => void;
}

export default function SquadImport({ onImport }: SquadImportProps) {
  const [text, setText] = useState("");
  const [success, setSuccess] = useState(false);

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

  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide flex items-center gap-1">
          📥 Smart Squad Importer
        </span>
        <button
          onClick={handlePasteDemo}
          className="text-[9px] font-black text-blue-400 hover:underline flex items-center gap-1"
        >
          <Clipboard className="w-3 h-3" /> Tempel Demo
        </button>
      </div>

      <p className="text-[9px] text-gray-500 leading-normal">
        Tempel daftar skuad dari Notepad / Excel. Gunakan format: <code className="text-gray-400 font-mono">[No] [Nama] [Posisi]</code>
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Contoh:&#10;10 Messi FWD&#10;7 Ronaldo FWD&#10;4 Van Dijk DEF"
        rows={3}
        className="w-full bg-black/40 border border-white/10 rounded-xl text-white font-mono text-[10px] p-2.5 focus:outline-none focus:border-blue-500 placeholder-gray-700"
      />

      <button
        onClick={handleImport}
        disabled={!text.trim()}
        className={`w-full py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 border ${
          success
            ? "bg-green-600 text-white border-green-500 font-extrabold"
            : "bg-white/5 hover:bg-white/10 text-blue-400 border-white/10 disabled:opacity-50"
        }`}
      >
        {success ? (
          <>
            <Check className="w-4 h-4" /> Import Skuad Berhasil!
          </>
        ) : (
          <>
            <Import className="w-4 h-4" /> Terapkan Skuad Baru
          </>
        )}
      </button>
    </div>

  );
}
