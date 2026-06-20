import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Player, TacticalItem, DrawingStroke, AnimationFrame, TacticalPlay } from "./types";
import Pitch from "./components/Pitch";
import AICoach from "./components/AICoach";
import AIFormationImageGenerator from "./components/AIFormationImageGenerator";
import AdSlotManager from "./components/AdSlotManager";
import AnimationTimeline from "./components/AnimationTimeline";
import PlayerEditorModal from "./components/PlayerEditorModal";
import SquadImport from "./components/SquadImport";
import BroadcastTV from "./components/BroadcastTV";
import { toPng } from "html-to-image";
import {
  Sparkles,
  Download,
  Tv,
  PenTool,
  Move,
  Trash2,
  Plus,
  RotateCcw,
  Palette,
  LayoutGrid,
  FileSpreadsheet,
  Globe,
  Settings,
  HelpCircle,
  Undo
} from "lucide-react";

const DEFAULT_PLAYERS: Player[] = [
  // Starting XI
  { id: "p1", name: "M. Nando", number: 1, role: "GK", x: 50, y: 88, isStarting: true, photo: null },
  { id: "p2", name: "R. Ridho", number: 5, role: "DEF", x: 38, y: 74, isStarting: true, photo: null },
  { id: "p3", name: "J. Idzes", number: 4, role: "DEF", x: 62, y: 74, isStarting: true, photo: null },
  { id: "p4", name: "N. Walsh", number: 6, role: "DEF", x: 82, y: 68, isStarting: true, photo: null },
  { id: "p5", name: "Pratama A.", number: 12, role: "DEF", x: 18, y: 68, isStarting: true, photo: null },
  { id: "p6", name: "Thom Haye", number: 19, role: "MID", x: 50, y: 58, isStarting: true, photo: null },
  { id: "p7", name: "Ivar Jenner", number: 18, role: "MID", x: 34, y: 46, isStarting: true, photo: null },
  { id: "p8", name: "J. Hubner", number: 10, role: "MID", x: 66, y: 46, isStarting: true, photo: null },
  { id: "p9", name: "R. Struick", number: 9, role: "FWD", x: 50, y: 22, isStarting: true, photo: null },
  { id: "p10", name: "R. Oratmangoen", number: 11, role: "FWD", x: 20, y: 28, isStarting: true, photo: null },
  { id: "p11", name: "Witan S.", number: 8, role: "FWD", x: 80, y: 28, isStarting: true, photo: null },
  // Substitutes
  { id: "p12", name: "Marselino F.", number: 7, role: "MID", x: 0, y: 0, isStarting: false, photo: null },
  { id: "p13", name: "Asnawi M.", number: 14, role: "DEF", x: 0, y: 0, isStarting: false, photo: null },
  { id: "p14", name: "Y. Sayuri", number: 22, role: "FWD", x: 0, y: 0, isStarting: false, photo: null },
  { id: "p15", name: "R. Sananta", number: 21, role: "FWD", x: 0, y: 0, isStarting: false, photo: null }
];

const DEFAULT_ITEMS: TacticalItem[] = [
  { id: "item-default-ball", type: "ball", x: 50, y: 52 }
];

const PRESET_FORMATIONS = {
  "4-3-3": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 18, y: 68 },
    { role: "DEF", x: 38, y: 74 },
    { role: "DEF", x: 62, y: 74 },
    { role: "DEF", x: 82, y: 68 },
    { role: "MID", x: 34, y: 46 },
    { role: "MID", x: 50, y: 58 },
    { role: "MID", x: 66, y: 46 },
    { role: "FWD", x: 20, y: 28 },
    { role: "FWD", x: 50, y: 22 },
    { role: "FWD", x: 80, y: 28 }
  ],
  "4-4-2": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 18, y: 68 },
    { role: "DEF", x: 38, y: 74 },
    { role: "DEF", x: 62, y: 74 },
    { role: "DEF", x: 82, y: 68 },
    { role: "MID", x: 20, y: 48 },
    { role: "MID", x: 40, y: 52 },
    { role: "MID", x: 60, y: 52 },
    { role: "MID", x: 80, y: 48 },
    { role: "FWD", x: 40, y: 24 },
    { role: "FWD", x: 60, y: 24 }
  ],
  "3-5-2": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 28, y: 72 },
    { role: "DEF", x: 50, y: 76 },
    { role: "DEF", x: 72, y: 72 },
    { role: "MID", x: 15, y: 46 },
    { role: "MID", x: 36, y: 48 },
    { role: "MID", x: 50, y: 56 },
    { role: "MID", x: 64, y: 48 },
    { role: "MID", x: 85, y: 46 },
    { role: "FWD", x: 38, y: 24 },
    { role: "FWD", x: 62, y: 24 }
  ],
  "4-2-3-1": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 18, y: 68 },
    { role: "DEF", x: 38, y: 74 },
    { role: "DEF", x: 62, y: 74 },
    { role: "DEF", x: 82, y: 68 },
    { role: "MID", x: 36, y: 56 },
    { role: "MID", x: 64, y: 56 },
    { role: "MID", x: 22, y: 38 },
    { role: "MID", x: 50, y: 36 },
    { role: "MID", x: 80, y: 38 },
    { role: "FWD", x: 50, y: 18 }
  ]
};

export default function App() {
  const [teamName, setTeamName] = useState("GARUDA FC");
  const [formation, setFormation] = useState<keyof typeof PRESET_FORMATIONS>("4-3-3");
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [items, setItems] = useState<TacticalItem[]>(DEFAULT_ITEMS);

  // States for adding substitute player form
  const [benchName, setBenchName] = useState("");
  const [benchNumber, setBenchNumber] = useState("");
  const [benchRole, setBenchRole] = useState<"GK" | "DEF" | "MID" | "FWD">("MID");

  const handleAddBenchPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!benchName.trim()) {
      alert("Masukkan nama pemain cadangan!");
      return;
    }
    const num = parseInt(benchNumber) || Math.floor(Math.random() * 89) + 12;
    
    const newPlayer: Player = {
      id: `p-bench-${Date.now()}`,
      name: benchName.trim(),
      number: num,
      role: benchRole,
      x: 0,
      y: 0,
      isStarting: false,
      photo: null
    };

    setPlayers((prev) => [...prev, newPlayer]);
    setBenchName("");
    setBenchNumber("");
  };

  // Styling properties
  const [primaryColor, setPrimaryColor] = useState("#dc2626"); // Red
  const [gkColor, setGkColor] = useState("#eab308"); // Yellow
  const [numberColor, setNumberColor] = useState("#ffffff");

  // Tools state
  const [activeTool, setActiveTool] = useState<"select" | "draw">("draw");
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);
  const [brushStyle, setBrushStyle] = useState<"solid" | "arrow">("solid");

  // Custom textures backdrop URL
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [pitchTheme, setPitchTheme] = useState<"emerald-grass" | "neon-hologram" | "dark-slate" | "aurora-stadium">("emerald-grass");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Line drawings brush strokes records
  const [drawHistory, setDrawHistory] = useState<DrawingStroke[]>([]);

  // Sequential Playbook Animation Steps
  const [frames, setFrames] = useState<AnimationFrame[]>([
    {
      id: "frame-init",
      name: "Fasa 1: Posisi Standard",
      players: DEFAULT_PLAYERS.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
      items: DEFAULT_ITEMS.map((item) => ({ id: item.id, x: item.x, y: item.y })),
      instruction: "Lakukan organisasi pemain pada posisi standard dan siapkan pola build up."
    }
  ]);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isPlayingTactic, setIsPlayingTactic] = useState(false);

  // Selected player for Modal Editor
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // Live TV mode overlay full-screen preview toggle
  const [tvModeOpen, setTvModeOpen] = useState(false);

  // Help guides collapse
  const [showGuide, setShowGuide] = useState(false);

  // --- TRANSITION POSITIONS WHEN MANUAL DRAGGING ---
  const handleUpdatePlayerPosition = (id: string, x: number, y: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x, y } : p))
    );

    // Live update coordinates of currently edited index frame so that manual frame tweaks works!
    setFrames((prev) => {
      const updated = [...prev];
      if (updated[activeFrameIndex]) {
        const pIdx = updated[activeFrameIndex].players.findIndex((cp) => cp.id === id);
        if (pIdx !== -1) {
          updated[activeFrameIndex].players[pIdx] = { id, x, y };
        } else {
          updated[activeFrameIndex].players.push({ id, x, y });
        }
      }
      return updated;
    });
  };

  const handleUpdateItemPosition = (id: string, x: number, y: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );

    setFrames((prev) => {
      const updated = [...prev];
      if (updated[activeFrameIndex]) {
        const itemIdx = updated[activeFrameIndex].items.findIndex((ci) => ci.id === id);
        if (itemIdx !== -1) {
          updated[activeFrameIndex].items[itemIdx] = { id, x, y };
        } else {
          updated[activeFrameIndex].items.push({ id, x, y });
        }
      }
      return updated;
    });
  };

  // --- INTERACTION CODES FOR TIMELINE FRAMES ---
  const handleSelectFrameIndex = (idx: number) => {
    setActiveFrameIndex(idx);
    const targetFrame = frames[idx];
    if (targetFrame) {
      // Shifting visual coordinates instantly
      setPlayers((prev) =>
        prev.map((player) => {
          const matchedCoordinate = targetFrame.players.find((p) => p.id === player.id);
          if (matchedCoordinate) {
            return { ...player, x: matchedCoordinate.x, y: matchedCoordinate.y, isStarting: true };
          }
          return player;
        })
      );
      setItems((prev) =>
        prev.map((item) => {
          const matchedItem = targetFrame.items.find((i) => i.id === item.id);
          if (matchedItem) {
            return { ...item, x: matchedItem.x, y: matchedItem.y };
          }
          return item;
        })
      );
    }
  };

  const handleResetFrames = () => {
    setFrames([
      {
        id: "frame-init",
        name: "Fasa 1: Posisi Standard",
        players: players.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
        items: items.map((item) => ({ id: item.id, x: item.x, y: item.y })),
        instruction: "Kembali ke setelan standard awal."
      }
    ]);
    setActiveFrameIndex(0);
    applyPresetFormation(formation);
  };

  const handleSaveCurrentAsNewFrame = () => {
    const newFrameId = `frame-${Date.now()}`;
    const nextIndex = frames.length + 1;
    const newFrame: AnimationFrame = {
      id: newFrameId,
      name: `Fasa ${nextIndex}: Gerakan Lanjutan`,
      players: players.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
      items: items.map((i) => ({ id: i.id, x: i.x, y: i.y })),
      instruction: "Tentukan gerak sirkulasi baru pada fasa taktis lanjutan ini."
    };
    setFrames((prev) => [...prev, newFrame]);
    setActiveFrameIndex(frames.length);
  };

  // Integrate AI responses from Express Google Omni client
  const handleLoadGeneratedPlay = (play: TacticalPlay) => {
    const parsedFrames: AnimationFrame[] = play.frames.map((f, index) => ({
      id: `frame-ai-${index}-${Date.now()}`,
      name: f.name,
      players: f.players,
      items: f.items,
      instruction: f.instruction
    }));

    setFrames(parsedFrames);
    setActiveFrameIndex(0);

    // Apply first frame positions immediately on load
    const firstFrame = parsedFrames[0];
    if (firstFrame) {
      setPlayers((prev) =>
        prev.map((player) => {
          const matched = firstFrame.players.find((p) => p.id === player.id);
          if (matched) {
            return { ...player, x: matched.x, y: matched.y, isStarting: true };
          }
          return player;
        })
      );
      setItems((prev) =>
        prev.map((item) => {
          const matched = firstFrame.items.find((i) => i.id === item.id);
          if (matched) {
            return { ...item, x: matched.x, y: matched.y };
          }
          return item;
        })
      );
    }
  };

  // --- SQUAD MODIFICATION CODES ---
  const applyPresetFormation = (formKey: keyof typeof PRESET_FORMATIONS) => {
    setFormation(formKey);
    const coordinates = PRESET_FORMATIONS[formKey];

    setPlayers((prev) => {
      let starterCounter = 0;
      return prev.map((player) => {
        if (player.isStarting && coordinates[starterCounter]) {
          const coord = coordinates[starterCounter];
          starterCounter++;
          return { ...player, x: coord.x, y: coord.y };
        }
        return player;
      });
    });

    // Reset frames to sync with new formation selection
    setTimeout(() => {
      setFrames((prev) => {
        const updated = [...prev];
        if (updated[0]) {
          updated[0].players = players.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y }));
        }
        return updated;
      });
    }, 100);
  };

  const handleSidelineSwap = (sidelinePlayerId: string, starterPlayerId: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === sidelinePlayerId) {
          const starter = prev.find((sp) => sp.id === starterPlayerId);
          return { ...p, isStarting: true, x: starter?.x || 50, y: starter?.y || 50 };
        }
        if (p.id === starterPlayerId) {
          return { ...p, isStarting: false };
        }
        return p;
      })
    );
  };

  const handlePromotePlayer = (sidelinePlayerId: string, x: number, y: number) => {
    const starters = players.filter((p) => p.isStarting);
    if (starters.length >= 11) {
      // Locate nearest player to swap out automatically
      let nearestId = "";
      let minDist = Infinity;
      starters.forEach((starter) => {
        const dist = Math.hypot(starter.x - x, starter.y - y);
        if (dist < minDist) {
          minDist = dist;
          nearestId = starter.id;
        }
      });
      if (nearestId) {
        handleSidelineSwap(sidelinePlayerId, nearestId);
      }
    } else {
      setPlayers((prev) =>
        prev.map((p) => (p.id === sidelinePlayerId ? { ...p, isStarting: true, x, y } : p))
      );
    }
  };

  const handleDemotePlayer = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isStarting: false } : p))
    );
  };

  const handleImportSquad = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
  };

  const handleAddTacticalItem = (type: "ball" | "cone") => {
    const newItem: TacticalItem = {
      id: `item-${Date.now()}`,
      type,
      x: 50,
      y: 40
    };
    setItems((prev) => [...prev, newItem]);
    setActiveTool("select");
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSavePlayerEdit = (id: string, updated: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    setEditingPlayerId(null);
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setEditingPlayerId(null);
  };

  // --- BACKGROUND UPLOADS ---
  const handleUploadBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomBackgroundUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- EXPORT TO IMAGE CODES ---
  const handleDownloadImage = () => {
    const pitchElement = document.getElementById("tacticalPitchWrapper");
    if (!pitchElement) return;

    const originalBorderRadius = pitchElement.style.borderRadius;
    pitchElement.style.borderRadius = "0px";

    toPng(pitchElement, {
      cacheBust: true,
      pixelRatio: 2,
    })
      .then((dataUrl) => {
        pitchElement.style.borderRadius = originalBorderRadius || "1.5rem";
        const link = document.createElement("a");
        link.download = `Tactigen_${teamName.replace(/\s+/g, "_")}_Taktik.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Failed to generate image", error);
        pitchElement.style.borderRadius = originalBorderRadius || "1.5rem";
      });
  };

  const handleUndoDraw = () => {
    setDrawHistory((prev) => prev.slice(0, prev.length - 1));
  };

  const activeEditingPlayer = players.find((p) => p.id === editingPlayerId) || null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans antialiased">
      
      {/* Header bar Navigation */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0f0f12] z-40 shadow-xl select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight">Tactigen <span className="text-blue-400 font-bold">Pro</span></span>
            <p className="text-[10px] text-gray-400 hidden sm:block">Google Omni Powered Football Board</p>
          </div>
        </div>

        {/* Global Toolbar controls */}
        <div className="flex items-center gap-3">
          
          {/* Connected badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-medium text-green-400">Google Omni Connected</span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden lg:block"></div>

          {/* Guide guide */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center gap-1.5 font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Bantuan
          </button>

          {/* Upload BG */}
          <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium">
            <Palette className="w-3.5 h-3.5 text-blue-400" /> Lapangan Kustom
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadBackground}
              className="hidden"
            />
          </label>

          {/* TV Presentation mode toggle */}
          <button
            onClick={() => setTvModeOpen(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> TV Preview
          </button>

          {/* Capture pitch */}
          <button
            onClick={handleDownloadImage}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-transform flex items-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-white" /> Unduh PNG
          </button>
        </div>
      </header>

      {/* Main viewport Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-hidden">
        
        {/* LEFT COLUMN PANEL: SQUAD SETTINGS */}
        <div className="lg:col-span-3 flex flex-col gap-5 overflow-y-auto max-h-[85vh] pr-1">
          
          {/* Guide popup info */}
          {showGuide && (
            <div className="bg-blue-950/20 border border-blue-500/20 p-4 rounded-2xl space-y-2 text-xs leading-relaxed">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-blue-400">💡 PANDUAN PENGGUNAAN</span>
                <button onClick={() => setShowGuide(false)} className="text-[10px] text-gray-400 hover:text-white uppercase">Tutup</button>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                <li>Geser (Drag) pemain starting XI untuk mengubah formasi taktis.</li>
                <li>Geser starting ke bangku bawah (Sideline) untuk memindahkannya ke cadangan.</li>
                <li>Geser cadangan ke atas lapangan untuk melakukan substitusi pemain otomatis.</li>
                <li>Klik ganda (Double Click) pada pemain untuk mengubah nama, nomor, atau foto wajah!</li>
                <li>Klik ganda (Double Click) bola/cone untuk menghapusnya.</li>
              </ul>
            </div>
          )}

          {/* Identity settings */}
          <div className="bg-[#15151a] border border-white/5 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              🛡️ Identitas Klub
            </h4>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-extrabold uppercase block">Nama Tim Utama</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="GARUDA FC"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Uniform customization */}
          <div className="bg-[#15151a] border border-white/5 rounded-2xl p-4 space-y-3.5 shadow-xl">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              👕 Kostumisasi Uniform
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-black/40 p-2 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-400 font-bold mb-1 block">Tim Utama</span>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>
              <div className="flex flex-col items-center bg-black/40 p-2 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-400 font-bold mb-1 block">Keeper GK</span>
                <input
                  type="color"
                  value={gkColor}
                  onChange={(e) => setGkColor(e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>
              <div className="flex flex-col items-center bg-black/40 p-2 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-400 font-bold mb-1 block">Nomor</span>
                <input
                  type="color"
                  value={numberColor}
                  onChange={(e) => setNumberColor(e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Preset formations selector */}
          <div className="bg-[#15151a] border border-white/5 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-blue-400" /> Formasi Default
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PRESET_FORMATIONS) as Array<keyof typeof PRESET_FORMATIONS>).map((key) => {
                const isActive = formation === key;
                return (
                  <button
                    key={key}
                    onClick={() => applyPresetFormation(key)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-400/30 shadow-md shadow-blue-500/10"
                        : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick add substitute player form */}
          <div className="bg-[#15151a] border border-white/5 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-400" /> Tambah Pemain Cadangan
            </h4>
            <form onSubmit={handleAddBenchPlayer} className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase">Nama Pemain</label>
                  <input
                    type="text"
                    value={benchName}
                    onChange={(e) => setBenchName(e.target.value)}
                    placeholder="e.g., A. Santoso"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase">No. Punggung</label>
                  <input
                    type="number"
                    value={benchNumber}
                    onChange={(e) => setBenchNumber(e.target.value)}
                    placeholder="17"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-bold uppercase block">Posisi Utama</label>
                <div className="grid grid-cols-4 gap-1">
                  {(["GK", "DEF", "MID", "FWD"] as const).map((r) => {
                    const active = benchRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setBenchRole(r)}
                        className={`py-1 rounded-lg text-[9px] font-extrabold transition-all border ${
                          active
                            ? "bg-blue-600/25 text-blue-400 border-blue-500/50"
                            : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-blue-600/10 active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Cadangan
              </button>
            </form>
          </div>

          {/* Bulk roster text-format copy paster */}
          <SquadImport onImport={handleImportSquad} />
        </div>

        {/* MIDDLE COLUMN WORKSPACE: PFP PITCH & MATCH STATE TITLE OVERGAMES */}
        <div className="lg:col-span-6 flex flex-col gap-4 items-center h-full">
          {/* Match Scoreboard Title HUD */}
          <div className="w-full flex justify-between items-center bg-[#15151a] border border-white/5 px-5 py-3 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-3 h-3 rounded-full border border-black/50 shadow" 
                style={{ backgroundColor: primaryColor }}
              />
              <span className="font-bold tracking-wide text-white text-sm uppercase">
                {teamName}
              </span>
            </div>
            
            <span className="text-[10px] text-gray-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 font-bold tracking-wider uppercase">
              Formasi standard: {formation}
            </span>
          </div>

          {/* Dynamic Board Theme Selector and Modern Inline Reset All Widget */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#15151a] border border-white/10 p-4 rounded-2xl shadow-xl">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider block">🎨 Tema Lapangan Modern</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: "emerald-grass", label: "🌿 Classic", color: "bg-emerald-500" },
                  { key: "neon-hologram", label: "⚡ Neon Holo", color: "bg-cyan-400" },
                  { key: "dark-slate", label: "📓 Dark Slate", color: "bg-slate-400" },
                  { key: "aurora-stadium", label: "🌌 Aurora", color: "bg-violet-500" }
                ].map((th) => {
                  const isActive = pitchTheme === th.key;
                  return (
                    <button
                      key={th.key}
                      onClick={() => setPitchTheme(th.key as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-md"
                          : "bg-black/30 text-gray-400 hover:bg-black/50 border-white/5"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${th.color} ${isActive ? "animate-pulse" : "opacity-60"}`} />
                      {th.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full sm:w-auto shrink-0 flex justify-end">
              {showResetConfirm ? (
                <div className="flex items-center gap-1.5 bg-red-950/20 px-2 py-1.5 rounded-xl border border-red-500/40">
                  <span className="text-[9px] text-red-400 font-bold">Yakin reset?</span>
                  <button
                    onClick={() => {
                      // Execute full reset
                      setTeamName("GARUDA FC");
                      setFormation("4-3-3");
                      setPlayers(DEFAULT_PLAYERS);
                      setItems(DEFAULT_ITEMS);
                      setPrimaryColor("#dc2626");
                      setGkColor("#eab308");
                      setNumberColor("#ffffff");
                      setActiveTool("draw");
                      setBrushColor("#ffffff");
                      setBrushSize(4);
                      setBrushStyle("solid");
                      setCustomBackgroundUrl(null);
                      setPitchTheme("emerald-grass");
                      setDrawHistory([]);
                      setFrames([
                        {
                          id: "frame-init",
                          name: "Fasa 1: Posisi Standard",
                          players: DEFAULT_PLAYERS.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
                          items: DEFAULT_ITEMS.map((item) => ({ id: item.id, x: item.x, y: item.y })),
                          instruction: "Lakukan organisasi pemain pada posisi standard dan siapkan pola build up."
                        }
                      ]);
                      setActiveFrameIndex(0);
                      setShowResetConfirm(false);
                    }}
                    className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[9px] font-extrabold uppercase transition-colors cursor-pointer"
                  >
                    Ya
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[9px] font-extrabold uppercase transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-300 border border-red-900/30 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset All
                </button>
              )}
            </div>
          </div>

          {/* DIGITAL FIELD SCREEN */}
          <Pitch
            players={players}
            items={items}
            primaryColor={primaryColor}
            gkColor={gkColor}
            numberColor={numberColor}
            activeTool={activeTool}
            brushColor={brushColor}
            brushSize={brushSize}
            brushStyle={brushStyle}
            customBackgroundUrl={customBackgroundUrl}
            drawHistory={drawHistory}
            setDrawHistory={setDrawHistory}
            onUpdatePlayerPosition={handleUpdatePlayerPosition}
            onUpdateItemPosition={handleUpdateItemPosition}
            onRemoveItem={handleRemoveItem}
            onDblClickPlayer={(id) => setEditingPlayerId(id)}
            onSidelineSwap={handleSidelineSwap}
            onPromotePlayer={handlePromotePlayer}
            onDemotePlayer={handleDemotePlayer}
            pitchTheme={pitchTheme}
          />

          {/* Ad Slot Manager (AdSense/AdMob Integration) */}
          <AdSlotManager />
        </div>

        {/* RIGHT COLUMN COLUMN: BRUSH CONTROLS & ANIMATION TIMELINE */}
        <div className="lg:col-span-3 flex flex-col gap-5 overflow-y-auto max-h-[85vh] pl-1">
          
          {/* Drawing brush settings */}
          <div className="bg-[#15151a] border border-white/5 rounded-2xl p-4 space-y-4 shadow-xl">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              ✍️ Alat Coret &amp; Marker Taktik
            </h4>

            {/* Brush styles solid vs arrow */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTool("select")}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
                  activeTool === "select"
                    ? "bg-blue-600 text-white border-blue-400/30"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 border-white/10"
                }`}
              >
                <Move className="w-4 h-4" /> Geser
              </button>
              <button
                onClick={() => setActiveTool("draw")}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
                  activeTool === "draw"
                    ? "bg-blue-600 text-white border-blue-400/30"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 border-white/10"
                }`}
              >
                <PenTool className="w-4 h-4" /> Coret
              </button>
            </div>

            <hr className="border-white/5" />

            <div className="space-y-3">
              {/* Stroke type select */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Gaya Garis</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setBrushStyle("solid");
                      setActiveTool("draw");
                    }}
                    className={`px-2.5 py-1 text-[10px] rounded border font-semibold transition-all ${
                      brushStyle === "solid"
                        ? "bg-blue-600 text-white border-blue-400/30"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    Lurus
                  </button>
                  <button
                    onClick={() => {
                      setBrushStyle("arrow");
                      setActiveTool("draw");
                    }}
                    className={`px-2.5 py-1 text-[10px] rounded border font-semibold transition-all ${
                      brushStyle === "arrow"
                        ? "bg-blue-600 text-white border-blue-400/30"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    Panah
                  </button>
                </div>
              </div>

              {/* Color swatches */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Warna Papan</span>
                <div className="flex gap-1.5">
                  {["#ffffff", "#eab308", "#3b82f6", "#dc2626"].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setBrushColor(color);
                        setActiveTool("draw");
                      }}
                      className={`w-6 h-6 rounded-full border border-black/40 transition-all ${
                        brushColor === color ? "scale-110 ring-2 ring-blue-500" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Brush size slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-semibold uppercase">Ketebalan Garis</span>
                  <span className="text-white font-mono">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-black/40 h-1 rounded-lg"
                />
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Clear and undo draw buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleUndoDraw}
                disabled={drawHistory.length === 0}
                className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 disabled:opacity-40 text-xs font-semibold uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Undo className="w-3.5 h-3.5" /> Undo Draw
              </button>
              <button
                onClick={() => setDrawHistory([])}
                disabled={drawHistory.length === 0}
                className="py-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 text-red-300 disabled:opacity-40 text-xs font-semibold uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          </div>

          {/* Draggable items append controls */}
          <div className="bg-[#15151a] border border-white/5 rounded-2xl p-4 space-y-3.5 shadow-xl">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              ⚽ Elemen Lapangan Tambahan
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddTacticalItem("ball")}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-[#15151a] border border-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                ⚽ Tambah Bola
              </button>
              <button
                onClick={() => handleAddTacticalItem("cone")}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-[#15151a] border border-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                ⚠️ Tambah Cone
              </button>
            </div>
          </div>

          {/* Playbook Animated Keyframes timeline */}
          <AnimationTimeline
            frames={frames}
            activeFrameIndex={activeFrameIndex}
            setActiveFrameIndex={handleSelectFrameIndex}
            onPlayStateChange={setIsPlayingTactic}
            onResetFrames={handleResetFrames}
            onSaveCurrentFrameAsNew={handleSaveCurrentAsNewFrame}
          />

          {/* AI Formation Image Generator (Gemini Imagen) */}
          <AIFormationImageGenerator
            formation={formation}
            teamName={teamName}
            primaryColor={primaryColor}
            gkColor={gkColor}
            numberColor={numberColor}
            players={players}
          />

          {/* AI Coach integration */}
          <AICoach
            players={players}
            items={items}
            currentFormation={formation}
            onLoadGeneratedPlay={handleLoadGeneratedPlay}
          />
        </div>
      </main>

      {/* FOOTER CLUBS CREATER */}
      <footer className="bg-slate-950/60 border-t border-slate-900 py-3.5 px-6 flex justify-between items-center text-xs text-slate-500 mt-auto select-none">
        <span>⚽ Tactigen Football Playmaker &amp; Lineups Board</span>
        <span>Google Omni Intelligence AI Integration Active</span>
      </footer>

      {/* INDIVIDUAL PLAYER EDITOR MODAL */}
      <AnimatePresence>
        {editingPlayerId && (
          <PlayerEditorModal
            player={activeEditingPlayer}
            onSave={handleSavePlayerEdit}
            onClose={() => setEditingPlayerId(null)}
            onDelete={handleDeletePlayer}
          />
        )}
      </AnimatePresence>

      {/* FULL SCREEN CINEMATIC TV LINEUP PREVIEW */}
      <AnimatePresence>
        {tvModeOpen && (
          <BroadcastTV
            players={players}
            items={items}
            teamName={teamName}
            formationName={formation}
            frames={frames}
            onClose={() => setTvModeOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
