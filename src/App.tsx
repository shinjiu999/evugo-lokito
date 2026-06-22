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
import { AppTutorialSocialKit } from "./components/AppTutorialSocialKit";
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
  Upload,
  FileSpreadsheet,
  Globe,
  Settings,
  HelpCircle,
  Undo,
  Shirt,
  Slash,
  ArrowUpRight,
  ChevronDown
} from "lucide-react";

const TRANSLATIONS = {
  id: {
    appTitle: "Tactigen Pro",
    appSubtitle: "Google Omni Powered Football Board",
    omniConnected: "Google Omni Terhubung",
    help: "Bantuan",
    customPitch: "Lapangan Kustom",
    tvPreview: "TV Preview",
    downloadPng: "Unduh PNG",
    guideTitle: "💡 PANDUAN NAVIGATION PENGGUNA",
    guideClose: "Tutup",
    guideLine1: "Geser (Drag) pemain starting XI untuk mengubah formasi taktis.",
    guideLine2: "Geser starting ke bangku bawah (Sideline) untuk memindahkannya ke cadangan.",
    guideLine3: "Geser cadangan ke atas lapangan untuk melakukan substitusi pemain otomatis.",
    guideLine4: "Klik ganda pada pemain untuk mendelegasi kustomisasi (nama, nomor, statistik, cetak, dll)!",
    guideLine5: "Klik ganda pada bola / cone untuk menghapusnya dari papan taktis.",
    clubIdentity: "🛡️ Identitas Klub",
    mainLogo: "Logo Tim Utama",
    deleteLogo: "Hapus",
    chooseLogo: "Pilihlah File Logo...",
    logoRecomend: "File PNG / JPG transparan sangat direkomendasikan.",
    mainTeamName: "Nama Tim Utama",
    defaultFormation: "Formasi Default",
    standardFormation: "Formasi standar",
    boardTheme: "🎨 Tema Lapangan Modern",
    resetConfirm: "Apakah Anda yakin ingin mereset layout sekarang?",
    yes: "Ya",
    cancel: "Batal",
    resetAll: "Reset Papan",
    brushStyle: "Gaya Coretan Lapangan",
    straightLine: "Garis Lurus",
    arrowLine: "Panah Taktis",
    brushColor: "Warna coretan",
    brushThickness: "Tingkat ketebalan",
    tacticalGrid: "Grid Taktis",
    show: "Tampil",
    hide: "Sembunyi",
    control: "Metode Kontrol",
    drag: "Geser",
    draw: "Coret",
    elements: "Elemen Lapangan",
    ball: "Bola",
    cone: "Cone",
    uniform: "Kostum Atlet",
    jersey: "Jersey",
    gk: "GK",
    number: "Nomor",
    footerTitle: "⚽ Tactigen Football Playmaker & Lineups Board",
    footerSubtitle: "Integrasi Kecerdasan AI Google Omni Aktif",
    standardPhase: "Fasa 1: Posisi Standard",
    standardInstruction: "Lakukan organisasi pemain pada posisi standard dan siapkan pola build up."
  },
  en: {
    appTitle: "Tactigen Pro",
    appSubtitle: "Google Omni Powered Football Board",
    omniConnected: "Google Omni Connected",
    help: "Help",
    customPitch: "Custom Pitch",
    tvPreview: "TV Preview",
    downloadPng: "Download PNG",
    guideTitle: "💡 NAVIGATION GUIDE",
    guideClose: "Close",
    guideLine1: "Drag and drop starting XI players to dynamically adjust tactical formations.",
    guideLine2: "Drag any starting player down to the sideline bench to substitute them out.",
    guideLine3: "Drag bench players up onto the pitch to make an instant swap or substitution.",
    guideLine4: "Double click any player to open custom options (stats, numbers, print diagram, etc.)!",
    guideLine5: "Double click static balls or cones to remove them from the tactical canvas.",
    clubIdentity: "🛡️ Club Identity",
    mainLogo: "Team Logo",
    deleteLogo: "Delete",
    chooseLogo: "Upload Logo...",
    logoRecomend: "Transparent PNG or JPG formats are highly recommended.",
    mainTeamName: "Main Team Name",
    defaultFormation: "Default Formations",
    standardFormation: "Standard formation",
    boardTheme: "🎨 Modern Pitch Themes",
    resetConfirm: "Are you sure you want to restore default positions?",
    yes: "Yes",
    cancel: "Cancel",
    resetAll: "Reset Board",
    brushStyle: "Brush Drawing Style",
    straightLine: "Straight",
    arrowLine: "Tactical Arrow",
    brushColor: "Brush color",
    brushThickness: "Stroke thickness",
    tacticalGrid: "Tactical Grid Overlay",
    show: "Show",
    hide: "Hide",
    control: "Control Mode",
    drag: "Drag",
    draw: "Draw",
    elements: "Field Objects",
    ball: "Ball",
    cone: "Cone",
    uniform: "Kit Setup",
    jersey: "Jersey",
    gk: "GK",
    number: "Number",
    footerTitle: "⚽ Tactigen Football Playmaker & Lineups Board",
    footerSubtitle: "Google Omni Intelligence AI Integration Active",
    standardPhase: "Phase 1: Standard Positions",
    standardInstruction: "Set up players in default formation and plan primary tactical plays."
  }
};

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
  ],
  "3-4-3": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 25, y: 72 },
    { role: "DEF", x: 50, y: 76 },
    { role: "DEF", x: 75, y: 72 },
    { role: "MID", x: 18, y: 52 },
    { role: "MID", x: 38, y: 54 },
    { role: "MID", x: 62, y: 54 },
    { role: "MID", x: 82, y: 52 },
    { role: "FWD", x: 22, y: 28 },
    { role: "FWD", x: 50, y: 22 },
    { role: "FWD", x: 78, y: 28 }
  ],
  "4-5-1": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 18, y: 68 },
    { role: "DEF", x: 38, y: 74 },
    { role: "DEF", x: 62, y: 74 },
    { role: "DEF", x: 82, y: 68 },
    { role: "MID", x: 15, y: 48 },
    { role: "MID", x: 33, y: 50 },
    { role: "MID", x: 50, y: 56 },
    { role: "MID", x: 67, y: 50 },
    { role: "MID", x: 85, y: 48 },
    { role: "FWD", x: 50, y: 20 }
  ],
  "5-3-2": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 15, y: 68 },
    { role: "DEF", x: 32, y: 72 },
    { role: "DEF", x: 50, y: 75 },
    { role: "DEF", x: 68, y: 72 },
    { role: "DEF", x: 85, y: 68 },
    { role: "MID", x: 32, y: 48 },
    { role: "MID", x: 50, y: 55 },
    { role: "MID", x: 68, y: 48 },
    { role: "FWD", x: 38, y: 24 },
    { role: "FWD", x: 62, y: 24 }
  ],
  "5-4-1": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 15, y: 68 },
    { role: "DEF", x: 32, y: 72 },
    { role: "DEF", x: 50, y: 75 },
    { role: "DEF", x: 68, y: 72 },
    { role: "DEF", x: 85, y: 68 },
    { role: "MID", x: 20, y: 48 },
    { role: "MID", x: 40, y: 52 },
    { role: "MID", x: 60, y: 52 },
    { role: "MID", x: 80, y: 48 },
    { role: "FWD", x: 50, y: 22 }
  ],
  "4-1-2-1-2": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 18, y: 68 },
    { role: "DEF", x: 38, y: 74 },
    { role: "DEF", x: 62, y: 74 },
    { role: "DEF", x: 82, y: 68 },
    { role: "MID", x: 50, y: 60 },
    { role: "MID", x: 30, y: 48 },
    { role: "MID", x: 70, y: 48 },
    { role: "MID", x: 50, y: 36 },
    { role: "FWD", x: 38, y: 22 },
    { role: "FWD", x: 62, y: 22 }
  ],
  "4-1-4-1": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 18, y: 68 },
    { role: "DEF", x: 38, y: 74 },
    { role: "DEF", x: 62, y: 74 },
    { role: "DEF", x: 82, y: 68 },
    { role: "MID", x: 50, y: 62 },
    { role: "MID", x: 20, y: 44 },
    { role: "MID", x: 38, y: 44 },
    { role: "MID", x: 62, y: 44 },
    { role: "MID", x: 80, y: 44 },
    { role: "FWD", x: 50, y: 20 }
  ],
  "3-2-4-1": [
    { role: "GK", x: 50, y: 88 },
    { role: "DEF", x: 28, y: 72 },
    { role: "DEF", x: 50, y: 76 },
    { role: "DEF", x: 72, y: 72 },
    { role: "MID", x: 38, y: 58 },
    { role: "MID", x: 62, y: 58 },
    { role: "MID", x: 18, y: 42 },
    { role: "MID", x: 38, y: 38 },
    { role: "MID", x: 62, y: 38 },
    { role: "MID", x: 82, y: 42 },
    { role: "FWD", x: 50, y: 20 }
  ]
};

export default function App() {
  const [lang, setLang] = useState<"id" | "en">(() => {
    try {
      const saved = localStorage.getItem("tactigen_lang");
      return (saved === "id" || saved === "en") ? saved : "id";
    } catch {
      return "id";
    }
  });

  const handleSetLang = (newLang: "id" | "en") => {
    setLang(newLang);
    try {
      localStorage.setItem("tactigen_lang", newLang);
    } catch (e) {
      console.warn(e);
    }
  };

  const t = TRANSLATIONS[lang];

  const [teamName, setTeamName] = useState("GARUDA FC");
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [formation, setFormation] = useState<keyof typeof PRESET_FORMATIONS>("4-3-3");
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [items, setItems] = useState<TacticalItem[]>(DEFAULT_ITEMS);

  const handleAddBenchDirect = (name: string, num: number, role: "GK" | "DEF" | "MID" | "FWD") => {
    const newPlayer: Player = {
      id: `p-bench-${Date.now()}`,
      name: name.trim(),
      number: num,
      role: role,
      x: 0,
      y: 0,
      isStarting: false,
      photo: null
    };

    setPlayers((prev) => [...prev, newPlayer]);
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
  const [showDrawConfig, setShowDrawConfig] = useState(true);
  const [showColorPickerPopup, setShowColorPickerPopup] = useState(false);

  // Custom textures backdrop URL
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [pitchTheme, setPitchTheme] = useState<"emerald-grass" | "neon-hologram" | "dark-slate" | "aurora-stadium">("emerald-grass");
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFormationMenu, setShowFormationMenu] = useState(false);

  // Line drawings brush strokes records
  const [drawHistory, setDrawHistory] = useState<DrawingStroke[]>([]);
  const [showTacticalGrid, setShowTacticalGrid] = useState<boolean>(false);

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

  // Detailed Movement Simulation States
  const [showMovementTrails, setShowMovementTrails] = useState(true);
  const [playSpeed, setPlaySpeed] = useState<"slow" | "normal" | "fast" | "superfast">("normal");
  const [transitionType, setTransitionType] = useState<"spring" | "linear" | "stealth">("spring");

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

  const handleSwapPlayers = (
    id1: string,
    id2: string,
    id1OriginalCoords: { x: number; y: number },
    id2OriginalCoords: { x: number; y: number }
  ) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === id1) {
          return { ...p, x: id2OriginalCoords.x, y: id2OriginalCoords.y };
        }
        if (p.id === id2) {
          return { ...p, x: id1OriginalCoords.x, y: id1OriginalCoords.y };
        }
        return p;
      })
    );

    setFrames((prev) => {
      const updated = [...prev];
      if (updated[activeFrameIndex]) {
        // Player 1 update in current frame
        const p1Idx = updated[activeFrameIndex].players.findIndex((cp) => cp.id === id1);
        if (p1Idx !== -1) {
          updated[activeFrameIndex].players[p1Idx] = { id: id1, x: id2OriginalCoords.x, y: id2OriginalCoords.y };
        } else {
          updated[activeFrameIndex].players.push({ id: id1, x: id2OriginalCoords.x, y: id2OriginalCoords.y });
        }

        // Player 2 update in current frame
        const p2Idx = updated[activeFrameIndex].players.findIndex((cp) => cp.id === id2);
        if (p2Idx !== -1) {
          updated[activeFrameIndex].players[p2Idx] = { id: id2, x: id1OriginalCoords.x, y: id1OriginalCoords.y };
        } else {
          updated[activeFrameIndex].players.push({ id: id2, x: id1OriginalCoords.x, y: id1OriginalCoords.y });
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
    setFrames((prev) =>
      prev.map((frame) => ({
        ...frame,
        items: frame.items.filter((item) => item.id !== id)
      }))
    );
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
    <div className="relative min-h-screen bg-[#07070a] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] text-white flex flex-col font-sans antialiased overflow-x-hidden">
      
      {/* Premium ambient decorative glowing blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none z-0" />
      
      {/* Header bar Navigation - Transparent Frosted Glass effect */}
      <header className="h-16 flex items-center justify-between px-3 md:px-6 border-b border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-md z-40 shadow-[0_4px_30px_rgba(0,0,0,0.4)] select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-550 via-blue-600 to-indigo-650 flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform duration-300 hover:rotate-6">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-sm md:text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-blue-400 bg-clip-text text-transparent">{t.appTitle}</span>
            <p className="text-[9px] text-gray-400 font-medium tracking-wide hidden sm:block">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Global Toolbar controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Connected badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-medium text-green-400">{t.omniConnected}</span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden lg:block"></div>

          {/* Language Selector Toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 shrink-0" id="global-lang-selector">
            <button
              onClick={() => handleSetLang("id")}
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                lang === "id"
                  ? "bg-blue-650 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Bahasa Indonesia"
            >
              ID
            </button>
            <button
              onClick={() => handleSetLang("en")}
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-blue-650 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
              title="English Translation"
            >
              EN
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 hidden md:block"></div>

          {/* Guide guide */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.help}</span>
          </button>

          {/* Upload BG */}
          <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-gray-300 px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium">
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">{t.customPitch}</span>
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
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="hidden md:inline">{t.tvPreview}</span>
          </button>

          {/* Capture pitch */}
          <button
            onClick={handleDownloadImage}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-transform flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">{t.downloadPng}</span>
          </button>
        </div>
      </header>

      {/* Main viewport Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN PANEL: SQUAD SETTINGS */}
        <div className="lg:col-span-3 flex flex-col gap-5 lg:overflow-y-auto lg:max-h-[85vh] pr-1 h-auto">
          
          {/* Identity settings */}
          <div className="bg-[#0b0c10]/85 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:border-white/15 transition-all duration-300">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-[#5e6680] uppercase tracking-widest flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> {t.clubIdentity}
                </h4>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Name Input */}
                <div className="flex-1 relative group/name-input">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="GARUDA FC"
                    className="w-full bg-black/45 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/35 transition-all font-bold tracking-wide"
                  />
                  {/* Floating helpful description/label inside input bar on hover */}
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] font-black tracking-widest text-[#5e6680] uppercase transition-opacity opacity-40 group-hover/name-input:opacity-85">
                    {t.mainTeamName}
                  </div>
                </div>

                {/* Upload Logo area is highly compact */}
                <div className="relative group/logo-upload shrink-0">
                  <div className="flex items-center gap-2">
                    {teamLogo ? (
                      <div className="relative w-10 h-10 bg-black/50 border border-white/15 rounded-xl overflow-hidden flex items-center justify-center group/logo-view">
                        <img src={teamLogo} className="w-full h-full object-contain p-1" alt="Logo Preview" />
                        <button
                          type="button"
                          onClick={() => setTeamLogo(null)}
                          className="absolute inset-0 bg-red-950/90 opacity-0 group-hover/logo-view:opacity-100 flex items-center justify-center transition-all text-red-500 font-extrabold text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-black/45 hover:bg-[#0b0c10]/85 border-white/10 hover:border-blue-500/30 text-gray-400 hover:text-white shadow-xl backdrop-blur-md active:scale-95">
                        <Upload className="w-4 h-4 text-blue-400 animate-bounce" style={{ animationDuration: '3s' }} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setTeamLogo(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Descriptions overlay as modern tooltip */}
                  <div className="absolute right-0 bottom-full mb-2.5 opacity-0 scale-90 pointer-events-none group-hover/logo-upload:opacity-100 group-hover/logo-upload:scale-100 transition-all duration-150 bg-[#0e1017]/95 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-2xl z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                    <span className="text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.mainLogo}</span>
                    <span className="text-white font-extrabold text-[9px] whitespace-nowrap">
                      {teamLogo ? t.deleteLogo : t.chooseLogo}
                    </span>
                    <span className="text-[7.5px] text-gray-400 font-medium whitespace-nowrap">{t.logoRecomend}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* MIDDLE COLUMN WORKSPACE: PFP PITCH & MATCH STATE TITLE OVERGAMES */}
        <div className="lg:col-span-6 flex flex-col gap-4 items-center h-full">

          {/* DIGITAL FIELD SCREEN WITH VERTICAL BALL AND CONE CONTROLS */}
          <div className="w-full flex flex-col md:flex-row gap-4 items-stretch relative">
            <div className="flex-1 min-w-0 w-full max-w-[580px] mx-auto relative group/pitch">
              {/* Floating scoreboard overlay for Team Name and Formation at the top-middle of the pitch */}
              <div className="absolute top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-40 bg-[#0b0c10]/85 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/[0.08] px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 sm:gap-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:border-emerald-500/20 hover:bg-[#0b0c10]/95 transition-all duration-300 whitespace-nowrap">
                <div className="flex items-center gap-1.5 sm:gap-2.5 border-r border-white/10 pr-2 sm:pr-3.5">
                  {teamLogo ? (
                    <img 
                      src={teamLogo} 
                      className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 object-contain bg-black/40 p-0.5 rounded-md border border-white/10" 
                      alt="Logo" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div 
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-black/45 shadow-inner animate-[pulse_1.8s_infinite] shrink-0" 
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                  <span className="font-extrabold tracking-wider text-white text-[9.5px] sm:text-[11.5px] uppercase bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {teamName || "GARUDA FC"}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[7px] sm:text-[8px] text-[#22c55e] bg-green-500/10 px-1 py-0.5 rounded border border-green-500/20 font-black tracking-widest uppercase animate-pulse select-none">
                    LIVE
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-gray-200 font-extrabold tracking-wider bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 uppercase">
                    {formation}
                  </span>
                </div>
              </div>

              {/* Floating thin overlay for Pitch Board Theme option dropdown */}
              <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-40 flex flex-col items-start group/themeselect">
                <button
                  onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                  className="w-9 h-9 sm:w-11 sm:h-11 bg-[#0b0c10]/75 hover:bg-[#0b0c10]/95 text-gray-200 hover:text-white rounded-xl sm:rounded-2xl transition-all flex items-center justify-center shadow-xl border border-white/[0.08] hover:border-emerald-500/20 backdrop-blur-md cursor-pointer select-none active:scale-95"
                >
                  <span className="text-sm sm:text-base shrink-0">
                    {pitchTheme === "emerald-grass" && "🌿"}
                    {pitchTheme === "neon-hologram" && "⚡"}
                    {pitchTheme === "dark-slate" && "📓"}
                    {pitchTheme === "aurora-stadium" && "🌌"}
                  </span>
                </button>

                {/* Floating tooltip showing the current active style name */}
                {!showThemeDropdown && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover/themeselect:opacity-100 transition-all duration-150 bg-[#0e1017]/95 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-2xl text-[9px] font-black tracking-wide text-gray-200 backdrop-blur-md whitespace-nowrap z-50">
                    {pitchTheme === "emerald-grass" && (lang === "id" ? "Padang Klasik" : "Classic Grass")}
                    {pitchTheme === "neon-hologram" && (lang === "id" ? "Hologram Neon" : "Neon Hologram")}
                    {pitchTheme === "dark-slate" && (lang === "id" ? "Taktis Gelap" : "Dark Tactical Slate")}
                    {pitchTheme === "aurora-stadium" && (lang === "id" ? "Stadion Aurora" : "Aurora Stadium")}
                  </div>
                )}

                {showThemeDropdown && (
                  <div className="absolute left-0 top-full mt-1.5 w-42 sm:w-48 bg-[#0b0c10]/95 border border-white/[0.12] rounded-xl sm:rounded-2xl shadow-2xl z-55 overflow-hidden flex flex-col gap-0.5 p-1 animate-fadeIn backdrop-blur-md max-h-48 overflow-y-auto">
                    {[
                      { key: "emerald-grass", label: lang === "id" ? "Padang Klasik" : "Classic Grass", icon: "🌿" },
                      { key: "neon-hologram", label: lang === "id" ? "Hologram Neon" : "Neon Hologram", icon: "⚡" },
                      { key: "dark-slate", label: lang === "id" ? "Taktis Gelap" : "Dark Tactical Slate", icon: "📓" },
                      { key: "aurora-stadium", label: lang === "id" ? "Stadion Aurora" : "Aurora Stadium", icon: "🌌" }
                    ].map((th) => {
                      const isActive = pitchTheme === th.key;
                      return (
                        <button
                          key={th.key}
                          onClick={() => {
                            setPitchTheme(th.key as any);
                            setShowThemeDropdown(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 sm:py-2 rounded-lg text-[9.5px] sm:text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                            isActive
                              ? "bg-blue-600/25 border border-blue-500/30 text-blue-300"
                              : "bg-transparent border border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className="text-sm shrink-0">{th.icon}</span>
                          <span className="truncate">{th.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Floating thin overlay for Reset Board button */}
              <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-40 flex items-center justify-center">
                {showResetConfirm ? (
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-[#0e0f13]/95 backdrop-blur-md px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-2xl border border-red-500/40 shadow-2xl transition-all duration-300 animate-fadeIn text-[8px] sm:text-[10px] whitespace-nowrap">
                    <span className="text-[7.5px] sm:text-[9px] text-red-400 font-extrabold uppercase tracking-wide">{t.resetConfirm}</span>
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
                            name: t.standardPhase,
                            players: DEFAULT_PLAYERS.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
                            items: DEFAULT_ITEMS.map((item) => ({ id: item.id, x: item.x, y: item.y })),
                            instruction: t.standardInstruction
                          }
                        ]);
                        setActiveFrameIndex(0);
                        setShowResetConfirm(false);
                      }}
                      className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-xl bg-red-600 hover:bg-red-500 text-white text-[7.5px] sm:text-[9px] font-black uppercase transition-colors cursor-pointer"
                    >
                      {t.yes}
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[7.5px] sm:text-[9px] font-black uppercase transition-colors cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <div className="relative group/reset">
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center transition-all cursor-pointer border bg-[#0b0c10]/65 hover:bg-[#0b0c10]/85 border-white/[0.08] hover:border-red-900/30 text-gray-400 hover:text-red-400 shadow-xl backdrop-blur-md active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/reset:rotate-45" />
                    </button>
                    {/* Floating descriptive tooltip/overlay */}
                    <div className="absolute right-0 top-full mt-2.5 opacity-0 scale-90 pointer-events-none group-hover/reset:opacity-100 group-hover/reset:scale-100 transition-all duration-150 bg-[#0e1017]/95 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-2xl z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                      <span className="text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{lang === "id" ? "SET SEMULA" : "RESET BOARD"}</span>
                      <span className="text-white font-extrabold text-[9px] whitespace-nowrap">{t.resetAll}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating thin overlay for Default Formation Selector at the bottom-left inside the pitch */}
              <div className="absolute bottom-[18%] sm:bottom-[18.5%] left-2.5 sm:left-4 z-45">
                <div className="relative group/formation">
                  <button
                    onClick={() => setShowFormationMenu(!showFormationMenu)}
                    className="h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border bg-[#0b0c10]/65 hover:bg-[#0b0c10]/85 border-white/[0.08] hover:border-blue-500/30 text-gray-300 hover:text-white shadow-xl backdrop-blur-md active:scale-95 text-[9.5px] sm:text-[11px] font-black tracking-wide"
                  >
                    <LayoutGrid className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-400" />
                    <span>{formation}</span>
                  </button>
                  
                  {/* Floating helpful description overlay */}
                  {!showFormationMenu && (
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 scale-90 pointer-events-none group-hover/formation:opacity-100 group-hover/formation:scale-100 transition-all duration-150 bg-[#0e1017]/95 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-2xl z-50 flex flex-col gap-0.5 backdrop-blur-md whitespace-nowrap">
                      <span className="text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.defaultFormation}</span>
                      <span className="text-white font-extrabold text-[9px]">{lang === "id" ? "Klik ganti formasi" : "Click to change lineup"}</span>
                    </div>
                  )}

                  {/* Dropdown list table descending downwards */}
                  {showFormationMenu && (
                    <div className="absolute top-full mt-1.5 left-0 w-52 bg-[#0e1017]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col divide-y divide-white/[0.06] animate-fadeIn">
                      <div className="px-3 py-2 bg-white/[0.02] flex justify-between items-center select-none">
                        <span className="text-[8px] font-black tracking-wider text-[#5e6680] uppercase">{lang === "id" ? "PILIHAN FORMASI" : "FORMATIONS LIST"}</span>
                        <span className="text-[8px] text-blue-400 font-bold uppercase">{lang === "id" ? "Tabel" : "Table"}</span>
                      </div>
                      <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {[
                          { key: "4-3-3", desc: lang === "id" ? "Attack Klasik" : "Classic Attacking", icon: "⚔️" },
                          { key: "4-4-2", desc: lang === "id" ? "Classic Seimbang" : "Classic Balanced", icon: "🛡️" },
                          { key: "3-5-2", desc: lang === "id" ? "Kuasai Sayap" : "Midfield Domination", icon: "⛓️" },
                          { key: "4-2-3-1", desc: lang === "id" ? "Taktis Modern" : "Modern Tactical", icon: "🎯" },
                          { key: "3-4-3", desc: lang === "id" ? "Sangat Menyerang" : "Aggressive Attack", icon: "🔥" },
                          { key: "4-5-1", desc: lang === "id" ? "Blok Bertahan" : "Defensive Block", icon: "🧱" },
                          { key: "5-3-2", desc: lang === "id" ? "Ujung Bertahan" : "Ultra Defensive", icon: "🏔️" }
                        ].map((item) => {
                          const isSel = formation === item.key;
                          return (
                            <button
                              key={item.key}
                              onClick={() => {
                                applyPresetFormation(item.key as any);
                                setShowFormationMenu(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer text-xs ${
                                isSel ? "bg-blue-600/20 text-blue-400 font-black" : "text-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs">{item.icon}</span>
                                <div className="flex flex-col">
                                  <span className="font-extrabold tracking-wide uppercase text-[10.5px]">{item.key}</span>
                                  <span className="text-[8px] text-[#5e6680] font-medium leading-none">{item.desc}</span>
                                </div>
                              </div>
                              {isSel && (
                                <span className="text-[7.5px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-black animate-pulse uppercase">
                                  {lang === "id" ? "Aktif" : "Active"}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
                onAddBenchPlayer={handleAddBenchDirect}
                onSwapPlayers={handleSwapPlayers}
                pitchTheme={pitchTheme}
                frames={frames}
                activeFrameIndex={activeFrameIndex}
                showMovementTrails={showMovementTrails}
                playSpeed={playSpeed}
                transitionType={transitionType}
                showTacticalGrid={showTacticalGrid}
                lang={lang}
              />

              {/* Floating thin overlay for Tactical Tools Sidebar at the right edge */}
              <div className="absolute right-2 sm:right-3 md:-right-16 md:top-1 z-45 top-14 sm:top-18 flex flex-col gap-1.5 sm:gap-2.5 p-1.5 sm:p-2.5 bg-[#0b0c10]/75 hover:bg-[#0b0c10]/90 backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] select-none items-center justify-center shrink-0 hover:border-white/15 transition-all duration-300">
                
                {/* Active Tool select (Mode Geser/Drag) */}
                <div className="relative group">
                  <button
                    onClick={() => setActiveTool("select")}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border ${
                      activeTool === "select"
                        ? "bg-blue-600 text-white border-blue-400/30 shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Move className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>
                  {/* Floating Tooltip Help sliding leftwards securely */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 md:mr-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                    <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.control}</span>
                    <span className="text-white font-black">{lang === "id" ? "Mode Geser & Susun (Drag)" : "Drag & Drop Mode"}</span>
                  </div>
                </div>

                {/* Active Tool draw (Mode Coret/Draw) dengan Overlay & Dropdown Warna Pop-up */}
                <div className="relative group/draw">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (activeTool !== "draw") {
                          setActiveTool("draw");
                          setShowDrawConfig(true);
                        } else {
                          setShowDrawConfig(!showDrawConfig);
                        }
                      }}
                      className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border ${
                        activeTool === "draw"
                          ? "bg-blue-600 text-white border-blue-400/30 shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <PenTool className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      {/* Active Color dot indicator in the corner of draw button */}
                      <span 
                        className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-black/45 shadow-sm"
                        style={{ backgroundColor: brushColor }}
                      />
                    </button>
                  </div>

                  {/* Floating Tooltip Help (when config overlay is closed) */}
                  {(!showDrawConfig || activeTool !== "draw") && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 md:mr-3 opacity-0 pointer-events-none group-hover/draw:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                      <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.control}</span>
                      <span className="text-white font-black">{lang === "id" ? "Mode Coret Taktikal (Draw)" : "Tactical Sketch Mode"}</span>
                    </div>
                  )}

                  {/* GORGEOUS SKETCH SETUP OVERLAY (Anchored next to Draw Button) */}
                  {activeTool === "draw" && showDrawConfig && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 z-50 w-52 p-3 sm:p-4 bg-[#0d0e14]/98 border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl animate-fadeIn flex flex-col gap-3 text-left">
                      
                      {/* Sub-header inside overlay with minimize toggle control */}
                      <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.06]">
                        <span className="text-[9.5px] text-gray-300 font-extrabold uppercase tracking-widest flex items-center gap-1.5 matches-draft">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          {lang === "id" ? "CORETAN TAKTIS" : "TACTICAL INK"}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDrawConfig(false);
                          }}
                          className="text-[9px] font-bold text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 w-4.5 h-4.5 rounded flex items-center justify-center transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* 1. GAYA CORETAN (Logo buttons choices) */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[8.5px] text-gray-400 font-extrabold uppercase tracking-wide">
                          {lang === "id" ? "PILIHAN GAYA" : "LINE STYLE"}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setBrushStyle("solid")}
                            className={`flex-1 py-1 px-1.5 rounded-lg border flex items-center justify-center gap-1 transition-all cursor-pointer text-[10px] font-bold ${
                              brushStyle === "solid"
                                ? "bg-blue-600/25 border-blue-500/70 text-blue-300 shadow-inner"
                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            }`}
                            title={lang === "id" ? "Garis Lurus" : "Straight Line"}
                          >
                            <Slash className="w-3 h-3 text-blue-400" />
                            <span>{lang === "id" ? "Lurus" : "Line"}</span>
                          </button>
                          
                          <button
                            onClick={() => setBrushStyle("arrow")}
                            className={`flex-1 py-1 px-1.5 rounded-lg border flex items-center justify-center gap-1 transition-all cursor-pointer text-[10px] font-bold ${
                              brushStyle === "arrow"
                                ? "bg-blue-600/25 border-blue-500/70 text-blue-300 shadow-inner"
                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            }`}
                            title={lang === "id" ? "Garis Panah" : "Arrow Line"}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                            <span>{lang === "id" ? "Panah" : "Arrow"}</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. WARNA CORETAN (Popup palette / trigger) */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] text-gray-400 font-extrabold uppercase tracking-wide">
                            {lang === "id" ? "WARNA CORET" : "DRAW COLOR"}
                          </span>
                          <span className="text-[8.5px] font-mono font-bold text-gray-300 uppercase shrink-0">{brushColor}</span>
                        </div>

                        <div className="relative">
                          {/* Main Trigger as custom selectable active palette */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setShowColorPickerPopup(!showColorPickerPopup)}
                              className="w-full h-8 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between active:scale-95 cursor-pointer text-[10px] transition-all"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner flex shrink-0" style={{ backgroundColor: brushColor }} />
                                <span className="text-gray-300 font-bold">{lang === "id" ? "Ubah Warna" : "Select Color"}</span>
                              </div>
                              <Palette className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                          </div>

                          {/* Animated Dropdown Pop-up Palette */}
                          {showColorPickerPopup && (
                            <div className="absolute right-0 bottom-full mb-1.5 w-max max-w-[180px] z-55 p-2 bg-[#08090d]/95 border border-white/15 rounded-xl shadow-2xl flex flex-col gap-2 backdrop-blur-md animate-fadeIn">
                              {/* Standard High Contrast Palette Presets Grid */}
                              <div className="grid grid-cols-5 gap-1.5 justify-items-center">
                                {[
                                  "#ffffff", // White
                                  "#ef4444", // Red
                                  "#facc15", // Neon Yellow
                                  "#22c55e", // Neon Green
                                  "#3b82f6", // Neon Blue
                                  "#fb923c", // Neon Orange
                                  "#a855f7", // Violet Purple
                                  "#2dd4bf", // Teal
                                  "#ec4899", // Pink
                                  "#000000"  // Black
                                ].map((colorHex) => {
                                  const isSelected = brushColor.toLowerCase() === colorHex.toLowerCase();
                                  return (
                                    <button
                                      key={colorHex}
                                      onClick={() => {
                                        setBrushColor(colorHex);
                                        setShowColorPickerPopup(false);
                                      }}
                                      style={{ backgroundColor: colorHex }}
                                      className={`w-5 h-5 rounded-full border cursor-pointer hover:scale-110 active:scale-95 transition-all ${
                                        isSelected 
                                          ? "border-white ring-2 ring-blue-500/50 scale-105" 
                                          : colorHex === "#000000" ? "border-white/25" : "border-transparent"
                                      }`}
                                      title={colorHex}
                                    />
                                  );
                                })}
                              </div>

                              {/* Custom Infinite Palette Picker Option */}
                              <div className="border-t border-white/[0.08] pt-1.5 flex items-center justify-between">
                                <span className="text-[8px] text-gray-500 font-bold uppercase">{lang === "id" ? "Kustom" : "Custom"}</span>
                                <div className="relative w-5 h-5 rounded-md bg-white/5 hover:bg-white/10 border border-white/15 cursor-pointer flex items-center justify-center transition-all overflow-hidden shrink-0">
                                  <Palette className="w-3 h-3 text-gray-300" />
                                  <input
                                    type="color"
                                    value={brushColor}
                                    onChange={(e) => setBrushColor(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. KETEBALAN CORETAN */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[8.5px] text-gray-400 font-extrabold uppercase tracking-wide">
                          <span>{lang === "id" ? "UKURAN CORET" : "BRUSH SIZE"}</span>
                          <span className="text-white font-mono text-[9px]">{brushSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={10}
                          value={brushSize}
                          onChange={(e) => setBrushSize(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      {/* 4. ACTIONS (Undo & Clear) inside pop-up */}
                      <div className="flex gap-1.5 border-t border-white/[0.06] pt-2">
                        <button
                          onClick={handleUndoDraw}
                          disabled={drawHistory.length === 0}
                          className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 disabled:opacity-40 text-[9px] font-extrabold uppercase flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                        >
                          <Undo className="w-2.5 h-2.5" />
                          <span>Undo</span>
                        </button>
                        <button
                          onClick={() => setDrawHistory([])}
                          disabled={drawHistory.length === 0}
                          className="flex-1 py-1 rounded-lg bg-red-950/25 hover:bg-red-950/45 border border-red-900/30 text-red-300 disabled:opacity-40 text-[9px] font-extrabold uppercase flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mini subtle Divider */}
                <div className="w-6 sm:w-8 h-[1px] bg-white/[0.08] my-0.5 sm:my-1 shrink-0" />

                {/* Add Ball Button */}
                <div className="relative group">
                  <button
                    onClick={() => handleAddTacticalItem("ball")}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/5 hover:bg-emerald-600/20 text-white hover:text-emerald-400 border border-white/10 hover:border-emerald-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md"
                  >
                    <span className="text-[15px] sm:text-[19px] hover:scale-110 transition-transform">⚽</span>
                  </button>
                  {/* Floating Tooltip Help */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 md:mr-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                    <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.elements}</span>
                    <span className="text-white font-black">{lang === "id" ? "Tambah Bola Baru" : "Spawn New Ball"}</span>
                  </div>
                </div>

                {/* Add Cone Button */}
                <div className="relative group">
                  <button
                    onClick={() => handleAddTacticalItem("cone")}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/5 hover:bg-orange-650/20 text-white hover:text-orange-400 border border-white/10 hover:border-orange-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gradient-to-t from-orange-600 via-orange-500 to-amber-300 rounded-t-full border-t border-amber-200 flex items-center justify-center shadow-lg">
                        <div className="w-1.5 h-0.5 sm:w-2 sm:h-0.5 bg-white/50 rounded-full mb-0.5"></div>
                      </div>
                      <div className="w-4.5 h-0.5 sm:w-5.5 sm:h-1 bg-orange-700 rounded-full -mt-0.5 shadow-md"></div>
                    </div>
                  </button>
                  {/* Floating Tooltip Help */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 md:mr-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                    <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.elements}</span>
                    <span className="text-white font-black">{lang === "id" ? "Tambah Cone Latihan" : "Spawn Practice Cone"}</span>
                  </div>
                </div>

                {/* Mini subtle Divider */}
                <div className="w-6 sm:w-8 h-[1px] bg-white/[0.08] my-0.5 sm:my-1 shrink-0" />

                {/* Jersey Utama */}
                <div className="relative group">
                  <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden">
                    <div className="relative flex items-center justify-center">
                      <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 transition-transform group-hover:scale-115 duration-205" style={{ fill: primaryColor, color: primaryColor === "#ffffff" ? "#cbd5e1" : "transparent" }} />
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                      />
                    </div>
                  </div>
                  {/* Floating Tooltip Help */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 md:mr-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                    <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.uniform}</span>
                    <span className="text-white font-black">{lang === "id" ? "Jersey Tim Utama" : "Primary Kit Color"}</span>
                  </div>
                </div>

                {/* Jersey Keeper */}
                <div className="relative group">
                  <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden">
                    <div className="relative flex items-center justify-center">
                      <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 transition-transform group-hover:scale-115 duration-205" style={{ fill: gkColor, color: gkColor === "#ffffff" ? "#cbd5e1" : "transparent" }} />
                      <input
                        type="color"
                        value={gkColor}
                        onChange={(e) => setGkColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                      />
                    </div>
                  </div>
                  {/* Floating Tooltip Help */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 md:mr-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                    <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.uniform}</span>
                    <span className="text-white font-black">{lang === "id" ? "Jersey Kiper (GK)" : "Goalkeeper Kit Color"}</span>
                  </div>
                </div>

                {/* Warna Nomor Punggung */}
                <div className="relative group">
                  <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <span className="text-[10px] sm:text-[12px] font-black tracking-tighter transition-transform group-hover:scale-115 duration-205" style={{ color: numberColor }}>10</span>
                      <input
                        type="color"
                        value={numberColor}
                        onChange={(e) => setNumberColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                      />
                    </div>
                  </div>
                  {/* Floating Tooltip Help */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 md:mr-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                    <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.uniform}</span>
                    <span className="text-white font-black">{lang === "id" ? "Warna Nomor" : "Numbers Color"}</span>
                  </div>
                </div>

                {/* Mini subtle Divider */}
                <div className="w-6 sm:w-8 h-[1px] bg-white/[0.08] my-0.5 sm:my-1 shrink-0" />

                {/* Tactical Grid Overlay Toggle Button */}
                <div className="relative group">
                  <button
                    onClick={() => setShowTacticalGrid(!showTacticalGrid)}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border ${
                      showTacticalGrid
                        ? "bg-indigo-600 text-white border-indigo-400/30 shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>
                  {/* Floating Tooltip Help */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 md:mr-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                    <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.tacticalGrid}</span>
                    <span className="text-white font-black">{lang === "id" ? "Grid Taktis" : "Tactical Grid"}</span>
                  </div>
                </div>

              </div>

              {/* Floating thin overlay for Smart Squad Importer at the bottom-right inside the pitch */}
              <div className="absolute bottom-[18%] sm:bottom-[18.5%] right-2.5 sm:right-4 z-45">
                <SquadImport onImport={handleImportSquad} lang={lang} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN COLUMN: BRUSH CONTROLS & ANIMATION TIMELINE */}
        <div className="lg:col-span-3 flex flex-col gap-5 lg:overflow-y-auto lg:max-h-[85vh] pl-1 h-auto">

          {/* Playbook Animated Keyframes timeline */}
          <AnimationTimeline
            frames={frames}
            activeFrameIndex={activeFrameIndex}
            setActiveFrameIndex={handleSelectFrameIndex}
            onPlayStateChange={setIsPlayingTactic}
            onResetFrames={handleResetFrames}
            onSaveCurrentFrameAsNew={handleSaveCurrentAsNewFrame}
            playSpeed={playSpeed}
            setPlaySpeed={setPlaySpeed}
            transitionType={transitionType}
            setTransitionType={setTransitionType}
            showMovementTrails={showMovementTrails}
            setShowMovementTrails={setShowMovementTrails}
            lang={lang}
          />

          {/* AI Formation Image Generator (Gemini Imagen) */}
          <AIFormationImageGenerator
            formation={formation}
            teamName={teamName}
            primaryColor={primaryColor}
            gkColor={gkColor}
            numberColor={numberColor}
            players={players}
            teamLogo={teamLogo}
          />

          {/* AI Coach integration */}
          <AICoach
            players={players}
            items={items}
            currentFormation={formation}
            onLoadGeneratedPlay={handleLoadGeneratedPlay}
            lang={lang}
          />
        </div>
      </main>

      {/* Ad Slot Sponsor Banner placed centrally at the very bottom of the page */}
      <div className="max-w-7xl w-full mx-auto px-3 md:px-6 mb-6 select-none">
        <AdSlotManager />
      </div>

      {/* FOOTER CLUBS CREATER */}
      <footer className="bg-slate-950/60 border-t border-slate-900 py-3.5 px-6 flex justify-between items-center text-xs text-slate-500 mt-auto select-none">
        <span>{t.footerTitle}</span>
        <span>{t.footerSubtitle}</span>
      </footer>

      {/* INDIVIDUAL PLAYER EDITOR MODAL */}
      <AnimatePresence>
        {editingPlayerId && (
          <PlayerEditorModal
            player={activeEditingPlayer}
            allPlayers={players}
            onSave={handleSavePlayerEdit}
            onClose={() => setEditingPlayerId(null)}
            onDelete={handleDeletePlayer}
            lang={lang}
            setLang={setLang}
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
            teamLogo={teamLogo}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* INTERACTIVE GUIDE & INSTAGRAM SOCIAL MEDIA GENERATOR */}
      <AnimatePresence>
        {showGuide && (
          <AppTutorialSocialKit
            isOpen={showGuide}
            onClose={() => setShowGuide(false)}
            lang={lang}
            players={players}
            teamName={teamName}
            formation={formation}
            teamLogo={teamLogo}
            primaryColor={primaryColor}
            gkColor={gkColor}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
