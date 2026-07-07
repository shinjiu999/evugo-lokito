import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Player, TacticalItem, DrawingStroke, AnimationFrame, TacticalPlay } from "./types";
import Pitch from "./components/Pitch";
import AICoach from "./components/AICoach";
import AIFormationImageGenerator from "./components/AIFormationImageGenerator";
import AdSlotManager from "./components/AdSlotManager";
import AnimationTimeline from "./components/AnimationTimeline";
import TacticalDrills from "./components/TacticalDrills";
import { TacticalDrill } from "./data/tacticalDrills";
import PlayerEditorModal from "./components/PlayerEditorModal";
import SquadImport from "./components/SquadImport";
import BroadcastTV from "./components/BroadcastTV";
import { AppTutorialSocialKit } from "./components/AppTutorialSocialKit";
import { PlaybookSaveLoadModal } from "./components/PlaybookSaveLoadModal";
import { SettingsModal } from "./components/SettingsModal";
import { soundManager } from "./utils/sound";
import { toPng } from "html-to-image";
import Interactive3DCard from "./components/Interactive3DCard";
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
  Flame,
  Upload,
  FileSpreadsheet,
  Globe,
  Settings,
  HelpCircle,
  Undo,
  Shirt,
  Slash,
  ArrowUpRight,
  Eraser,
  ChevronDown,
  ChevronUp,
  Sliders,
  Save,
  FolderOpen,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Magnet
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
    heatmapTitle: "Peta Panas Taktis",
    heatmapDesc: "Visualisasi Heatmap",
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
    standardInstruction: "Lakukan organisasi pemain pada posisi standard dan siapkan pola build up.",
    managerProfile: "👔 Profil Manajer & Staf",
    managerName: "Nama Manajer / Pelatih",
    managerPhoto: "Foto Manajer",
    uploadPhoto: "Unggah Foto...",
    deletePhoto: "Hapus Foto",
    managerTitle: "Pelatih Kepala",
    managerRole: "Manajer Tim"
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
    heatmapTitle: "Tactical Heatmap",
    heatmapDesc: "Heatmap Visualization",
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
    standardInstruction: "Set up players in default formation and plan primary tactical plays.",
    managerProfile: "👔 Manager Profile",
    managerName: "Manager / Coach Name",
    managerPhoto: "Manager Photo",
    uploadPhoto: "Upload Photo...",
    deletePhoto: "Delete Photo",
    managerTitle: "Head Coach",
    managerRole: "Team Manager"
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

const SPORT_FORMATIONS: Record<string, Record<string, { role: string; x: number; y: number }[]>> = {
  soccer: PRESET_FORMATIONS,
  minisoccer: {
    "2-3-1": [
      { role: "GK", x: 50, y: 88 },
      { role: "DEF", x: 30, y: 72 },
      { role: "DEF", x: 70, y: 72 },
      { role: "MID", x: 20, y: 46 },
      { role: "MID", x: 50, y: 48 },
      { role: "MID", x: 80, y: 46 },
      { role: "FWD", x: 50, y: 22 }
    ],
    "3-2-1": [
      { role: "GK", x: 50, y: 88 },
      { role: "DEF", x: 22, y: 72 },
      { role: "DEF", x: 50, y: 76 },
      { role: "DEF", x: 78, y: 72 },
      { role: "MID", x: 35, y: 48 },
      { role: "MID", x: 65, y: 48 },
      { role: "FWD", x: 50, y: 22 }
    ],
    "3-1-2": [
      { role: "GK", x: 50, y: 88 },
      { role: "DEF", x: 22, y: 72 },
      { role: "DEF", x: 50, y: 76 },
      { role: "DEF", x: 78, y: 72 },
      { role: "MID", x: 50, y: 50 },
      { role: "FWD", x: 35, y: 24 },
      { role: "FWD", x: 65, y: 24 }
    ],
    "2-2-2": [
      { role: "GK", x: 50, y: 88 },
      { role: "DEF", x: 30, y: 70 },
      { role: "DEF", x: 70, y: 70 },
      { role: "MID", x: 32, y: 46 },
      { role: "MID", x: 68, y: 46 },
      { role: "FWD", x: 35, y: 24 },
      { role: "FWD", x: 65, y: 24 }
    ]
  },
  futsal: {
    "1-2-1": [
      { role: "GK", x: 50, y: 88 },
      { role: "DEF", x: 50, y: 72 },
      { role: "MID", x: 25, y: 52 },
      { role: "MID", x: 75, y: 52 },
      { role: "FWD", x: 50, y: 28 }
    ],
    "2-2": [
      { role: "GK", x: 50, y: 88 },
      { role: "DEF", x: 32, y: 68 },
      { role: "DEF", x: 68, y: 68 },
      { role: "FWD", x: 32, y: 32 },
      { role: "FWD", x: 68, y: 32 }
    ],
    "1-1-2": [
      { role: "GK", x: 50, y: 88 },
      { role: "DEF", x: 50, y: 72 },
      { role: "MID", x: 50, y: 52 },
      { role: "FWD", x: 30, y: 26 },
      { role: "FWD", x: 70, y: 26 }
    ],
    "3-1": [
      { role: "GK", x: 50, y: 88 },
      { role: "DEF", x: 22, y: 70 },
      { role: "DEF", x: 50, y: 74 },
      { role: "DEF", x: 78, y: 70 },
      { role: "FWD", x: 50, y: 28 }
    ]
  }
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
    soundManager.playClick();
    try {
      localStorage.setItem("tactigen_lang", newLang);
    } catch (e) {
      console.warn(e);
    }
  };

  const t = TRANSLATIONS[lang];

  const [teamName, setTeamName] = useState("GARUDA FC");
  const [teamLogo, setTeamLogo] = useState<string | null>(null);

  const [managerName, setManagerName] = useState(() => {
    try {
      return localStorage.getItem("tactigen_manager_name") || "Budi Santoso";
    } catch {
      return "Budi Santoso";
    }
  });
  const [managerPhoto, setManagerPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem("tactigen_manager_photo") || null;
    } catch {
      return null;
    }
  });

  const handleUpdateManagerName = (name: string) => {
    setManagerName(name);
    try {
      localStorage.setItem("tactigen_manager_name", name);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateManagerPhoto = (photo: string | null) => {
    setManagerPhoto(photo);
    try {
      if (photo) {
        localStorage.setItem("tactigen_manager_photo", photo);
      } else {
        localStorage.removeItem("tactigen_manager_photo");
      }
    } catch (e) {
      console.warn(e);
    }
  };
  const [sportMode, setSportMode] = useState<"soccer" | "minisoccer" | "futsal" | "custom">("soccer");
  const [customCount, setCustomCount] = useState<number>(8);
  const [showSportOverlay, setShowSportOverlay] = useState<boolean>(false);
  const [formation, setFormation] = useState<any>("4-3-3");
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
  const [activeTool, setActiveTool] = useState<"select" | "draw">("select");
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);
  const [brushStyle, setBrushStyle] = useState<"solid" | "arrow" | "eraser">("solid");
  const [isSnapToGrid, setIsSnapToGrid] = useState<boolean>(true);
  const [showDrawConfig, setShowDrawConfig] = useState(true);
  const [showColorPickerPopup, setShowColorPickerPopup] = useState(false);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [isDrawLocked, setIsDrawLocked] = useState<boolean>(false);
  const [activeSketchLayer, setActiveSketchLayer] = useState<number>(1);
  const [visibleSketchLayers, setVisibleSketchLayers] = useState<number[]>([1, 2, 3]);

  // Custom textures backdrop URL
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [pitchTheme, setPitchTheme] = useState<"emerald-grass" | "neon-hologram" | "dark-slate" | "aurora-stadium">("emerald-grass");
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFormationMenu, setShowFormationMenu] = useState(false);
  const [isPitchFullscreen, setIsPitchFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPitchFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Line drawings brush strokes records
  const [drawHistory, setDrawHistory] = useState<DrawingStroke[]>([]);
  const [showTacticalGrid, setShowTacticalGrid] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

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
  const [transitionType, setTransitionType] = useState<"spring" | "linear" | "stealth" | "ease-in-out" | "elastic">("spring");

  // Selected player for Modal Editor
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // Live TV mode overlay full-screen preview toggle
  const [tvModeOpen, setTvModeOpen] = useState(false);

  // Help guides collapse
  const [showGuide, setShowGuide] = useState(false);

  // Mobile utility dropdown toggle
  const [showMobileUtils, setShowMobileUtils] = useState(false);

  // Global API Keys & MCP Settings Portal Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsKey, setSettingsKey] = useState(0);

  // Save and Load Pitch & Formation slots
  const [saveLoadModalOpen, setSaveLoadModalOpen] = useState(false);
  const [saveLoadMode, setSaveLoadMode] = useState<"save" | "load">("save");
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleLoadPlaybook = (data: {
    players: Player[];
    items: TacticalItem[];
    formation: any;
    teamName: string;
    teamLogo: string | null;
    primaryColor: string;
    gkColor: string;
    numberColor: string;
    sportMode?: any;
  }) => {
    if (data.players) setPlayers(data.players);
    if (data.items) setItems(data.items);
    if (data.formation) setFormation(data.formation);
    if (data.teamName) setTeamName(data.teamName);
    if (data.teamLogo !== undefined) setTeamLogo(data.teamLogo);
    if (data.primaryColor) setPrimaryColor(data.primaryColor);
    if (data.gkColor) setGkColor(data.gkColor);
    if (data.numberColor) setNumberColor(data.numberColor);

    if (data.sportMode) {
      setSportMode(data.sportMode);
      if (data.sportMode === "custom" && data.players) {
        const startCount = data.players.filter((p) => p.isStarting).length;
        setCustomCount(startCount || 8);
      }
    } else if (data.players) {
      const startCount = data.players.filter((p) => p.isStarting).length;
      if (startCount === 5) {
        setSportMode("futsal");
      } else if (startCount === 7) {
        setSportMode("minisoccer");
      } else {
        setSportMode("soccer");
      }
    }

    // Synchronize default frame with loaded scenario so replay works natively
    setFrames([{
      id: "frame-init",
      name: lang === "id" ? "Fasa 1: Posisi Standard" : "Phase 1: Standard Positions",
      players: data.players.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
      items: (data.items || []).map((item) => ({ id: item.id, x: item.x, y: item.y })),
      instruction: lang === "id" 
        ? "Organisasi taktik berhasil dimuat dari penyimpanan." 
        : "Tactical playground successfully loaded from memory."
    }]);
    setActiveFrameIndex(0);
  };

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

  const handleLoadTacticalDrill = (drill: TacticalDrill) => {
    if (drill.sportMode) {
      setSportMode(drill.sportMode);
    }
    
    setFrames(drill.frames);
    setActiveFrameIndex(0);

    // Apply first frame positions immediately on load
    const firstFrame = drill.frames[0];
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

  const getCustomCoordinates = (count: number): { role: string; x: number; y: number }[] => {
    switch (count) {
      case 1:
        return [{ role: "GK", x: 50, y: 88 }];
      case 2:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "FWD", x: 50, y: 28 }
        ];
      case 3:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "DEF", x: 50, y: 68 },
          { role: "FWD", x: 50, y: 28 }
        ];
      case 4:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "DEF", x: 50, y: 70 },
          { role: "MID", x: 50, y: 48 },
          { role: "FWD", x: 50, y: 26 }
        ];
      case 5:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "DEF", x: 50, y: 72 },
          { role: "MID", x: 25, y: 52 },
          { role: "MID", x: 75, y: 52 },
          { role: "FWD", x: 50, y: 28 }
        ];
      case 6:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "DEF", x: 30, y: 72 },
          { role: "DEF", x: 70, y: 72 },
          { role: "MID", x: 50, y: 50 },
          { role: "FWD", x: 33, y: 28 },
          { role: "FWD", x: 67, y: 28 }
        ];
      case 7:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "DEF", x: 30, y: 72 },
          { role: "DEF", x: 70, y: 72 },
          { role: "MID", x: 20, y: 46 },
          { role: "MID", x: 50, y: 48 },
          { role: "MID", x: 80, y: 46 },
          { role: "FWD", x: 50, y: 22 }
        ];
      case 8:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "DEF", x: 25, y: 72 },
          { role: "DEF", x: 50, y: 75 },
          { role: "DEF", x: 75, y: 72 },
          { role: "MID", x: 35, y: 50 },
          { role: "MID", x: 65, y: 50 },
          { role: "FWD", x: 35, y: 26 },
          { role: "FWD", x: 65, y: 26 }
        ];
      case 9:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "DEF", x: 25, y: 72 },
          { role: "DEF", x: 50, y: 75 },
          { role: "DEF", x: 75, y: 72 },
          { role: "MID", x: 20, y: 50 },
          { role: "MID", x: 50, y: 52 },
          { role: "MID", x: 80, y: 50 },
          { role: "FWD", x: 35, y: 26 },
          { role: "FWD", x: 65, y: 26 }
        ];
      case 10:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "DEF", x: 20, y: 72 },
          { role: "DEF", x: 40, y: 74 },
          { role: "DEF", x: 60, y: 74 },
          { role: "DEF", x: 80, y: 72 },
          { role: "MID", x: 25, y: 50 },
          { role: "MID", x: 50, y: 52 },
          { role: "MID", x: 75, y: 50 },
          { role: "FWD", x: 35, y: 26 },
          { role: "FWD", x: 65, y: 26 }
        ];
      case 11:
      default:
        return [
          { role: "GK", x: 50, y: 88 },
          { role: "DEF", x: 20, y: 72 },
          { role: "DEF", x: 40, y: 74 },
          { role: "DEF", x: 60, y: 74 },
          { role: "DEF", x: 80, y: 72 },
          { role: "MID", x: 20, y: 48 },
          { role: "MID", x: 50, y: 50 },
          { role: "MID", x: 80, y: 48 },
          { role: "FWD", x: 25, y: 24 },
          { role: "FWD", x: 50, y: 22 },
          { role: "FWD", x: 75, y: 24 }
        ];
    }
  };

  // --- SQUAD MODIFICATION CODES ---
  const getSportModeLimit = (mode: string = sportMode) => {
    if (mode === "minisoccer") return 7;
    if (mode === "futsal") return 5;
    if (mode === "custom") return customCount;
    return 11;
  };

  const handleSetSportMode = (mode: "soccer" | "minisoccer" | "futsal" | "custom", customVal?: number) => {
    setSportMode(mode);
    const activeCount = mode === "custom" ? (customVal !== undefined ? customVal : customCount) : getSportModeLimit(mode);
    if (mode === "custom" && customVal !== undefined) {
      setCustomCount(customVal);
    }
    
    // Determine default formation for chosen sport
    let nextForm = "4-3-3";
    if (mode === "minisoccer") nextForm = "2-3-1";
    else if (mode === "futsal") nextForm = "1-2-1";
    else if (mode === "custom") nextForm = `CUSTOM (${activeCount})`;
    
    setFormation(nextForm);

    const coords = mode === "custom" ? getCustomCoordinates(activeCount) : SPORT_FORMATIONS[mode][nextForm];

    setPlayers((prev) => {
      // Find starting and substitute players
      const currentStarters = prev.filter((p) => p.isStarting);
      const currentSubs = prev.filter((p) => !p.isStarting);

      let nextStarters: Player[] = [];
      let nextSubs: Player[] = [];

      if (currentStarters.length > activeCount) {
        nextStarters = currentStarters.slice(0, activeCount);
        nextSubs = [...currentStarters.slice(activeCount), ...currentSubs];
      } else if (currentStarters.length < activeCount) {
        const diff = activeCount - currentStarters.length;
        nextStarters = [...currentStarters, ...currentSubs.slice(0, diff)];
        nextSubs = currentSubs.slice(diff);
      } else {
        nextStarters = [...currentStarters];
        nextSubs = [...currentSubs];
      }

      // Re-assign status
      const updatedStarters = nextStarters.map((p) => ({ ...p, isStarting: true }));
      const updatedSubs = nextSubs.map((p) => ({ ...p, isStarting: false, x: 0, y: 0 }));

      const combined = [...updatedStarters, ...updatedSubs];

      // Map coordinates to starters
      let starterCounter = 0;
      return combined.map((player) => {
        if (player.isStarting && coords[starterCounter]) {
          const coord = coords[starterCounter];
          starterCounter++;
          return { ...player, x: coord.x, y: coord.y };
        } else if (!player.isStarting) {
          return { ...player, x: 0, y: 0 };
        }
        return player;
      });
    });

    // Sync frames with players' starting coordinates
    setTimeout(() => {
      setFrames((prev) => {
        const updated = [...prev];
        if (updated[0]) {
          setPlayers((latestPlayers) => {
            updated[0].players = latestPlayers.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y }));
            return latestPlayers;
          });
        }
        return updated;
      });
    }, 120);
  };

  const applyPresetFormation = (formKey: string) => {
    setFormation(formKey);
    const coordinates = SPORT_FORMATIONS[sportMode][formKey];
    if (!coordinates) return;

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
          setPlayers((latestPlayers) => {
            updated[0].players = latestPlayers.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y }));
            return latestPlayers;
          });
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
    const limit = getSportModeLimit();
    if (starters.length >= limit) {
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
      
      {/* Global floating button to exit presentation mode */}
      {isPitchFullscreen && (
        <button
          onClick={() => setIsPitchFullscreen(false)}
          className="fixed top-4 right-4 z-[9999] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs uppercase shadow-[0_10px_25px_rgba(239,68,68,0.4)] backdrop-blur-md border border-red-500/30 transition-all active:scale-95 cursor-pointer animate-fadeIn"
          title={lang === "id" ? "Keluar Layar Penuh (ESC)" : "Exit Fullscreen (ESC)"}
        >
          <Minimize2 className="w-4 h-4 animate-pulse" />
          <span>{lang === "id" ? "Keluar" : "Exit"}</span>
        </button>
      )}
      
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
            <h1 className="text-sm md:text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-blue-400 bg-clip-text text-transparent">{t.appTitle}</h1>
            <p className="text-[9px] text-gray-400 font-medium tracking-wide hidden sm:block">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Global Toolbar controls */}
        {/* Desktop-only full interactive dashboard toolbar */}
        <div className="hidden md:flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1 shadow-inner">
          {/* Connected Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-400 tracking-wide uppercase">{t.omniConnected}</span>
          </div>

          <div className="hidden lg:block w-px h-4 bg-white/10" />

          {/* Language Selector */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0" role="group" aria-label={lang === "id" ? "Pilih Bahasa" : "Choose Language"}>
            <button
              onClick={() => handleSetLang("id")}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                lang === "id"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105 font-black"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="Bahasa Indonesia"
              aria-pressed={lang === "id"}
            >
              ID
            </button>
            <button
              onClick={() => handleSetLang("en")}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                lang === "en"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105 font-black"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="English Translation"
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>

          <div className="w-px h-4 bg-white/10" />

          {/* Sound Control Hub */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0 items-center gap-1" id="global-sound-controller">
            <button
              onClick={() => {
                const muted = soundManager.toggleMuted();
                setIsMuted(muted);
                soundManager.playClick();
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                !isMuted 
                  ? "text-cyan-400 bg-cyan-500/10 hover:text-cyan-300 hover:bg-cyan-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title={isMuted ? (lang === "id" ? "Bunyikan Suara" : "Unmute Sounds") : (lang === "id" ? "Bisukan Suara" : "Mute Sounds")}
              aria-label={isMuted ? "Unmute Sounds" : "Mute Sounds"}
              aria-pressed={!isMuted}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            
            <button
              onClick={() => {
                soundManager.playWhistle();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none text-xs"
              title={lang === "id" ? "Tiup Peluit" : "Blow Whistle"}
              aria-label="Blow Whistle"
            >
              📢
            </button>

            <button
              onClick={() => {
                soundManager.playCrowdCheer();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none text-xs"
              title={lang === "id" ? "Sorak Penonton" : "Stadium Crowd Cheer"}
              aria-label="Stadium Crowd Cheer"
            >
              🏟️
            </button>
          </div>

          <div className="w-px h-4 bg-white/10" />

          {/* Help / Guide */}
          <button
            onClick={() => {
              setShowGuide(!showGuide);
              soundManager.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              showGuide 
                ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10"
                : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20"
            }`}
            aria-label={lang === "id" ? "Buka Panduan" : "Open Guide"}
            aria-expanded={showGuide}
            title={lang === "id" ? "Buka Panduan" : "Open Guide"}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.help}</span>
          </button>

          {/* Global AI Config Settings */}
          <button
            onClick={() => {
              setIsSettingsModalOpen(true);
              soundManager.playClick();
            }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label={lang === "id" ? "Pengaturan Kredensial AI" : "AI Credentials Settings"}
            title={lang === "id" ? "Pengaturan Kredensial AI" : "AI Credentials Settings"}
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>{lang === "id" ? "Pengaturan" : "Settings"}</span>
          </button>
        </div>

        {/* Mobile-only compact interactive toolbar */}
        <div className="flex md:hidden items-center gap-1.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1 shadow-inner">
          {/* Settings */}
          <button
            onClick={() => {
              setIsSettingsModalOpen(true);
              soundManager.playClick();
            }}
            className="p-2 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label={lang === "id" ? "Pengaturan Kredensial AI" : "AI Credentials Settings"}
            title={lang === "id" ? "Pengaturan Kredensial AI" : "AI Credentials Settings"}
          >
            <Settings className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
          </button>

          {/* More Menu Toggle */}
          <button
            onClick={() => {
              setShowMobileUtils(!showMobileUtils);
              soundManager.playClick();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none flex items-center justify-center relative ${
              showMobileUtils
                ? "bg-blue-600/20 border-blue-500/60 text-blue-300"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
            aria-expanded={showMobileUtils}
            aria-label={lang === "id" ? "Utilitas Tambahan" : "More Utilities Menu"}
            title={lang === "id" ? "Utilitas Tambahan" : "More Utilities Menu"}
          >
            <Sliders className={`w-4 h-4 transition-transform duration-300 ${showMobileUtils ? "rotate-90 text-blue-400" : ""}`} />
            {showMobileUtils && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />}
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Expandable Sub-Toolbar Panel */}
      <AnimatePresence>
        {showMobileUtils && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="md:hidden w-full bg-[#0c0c12]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 z-30 shadow-xl overflow-hidden relative"
          >
            {/* Ambient subtle decorative light trail inside the drawer */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left group: Translation & Sound indicators */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{lang === "id" ? "BHS & SUARA:" : "LANG & SOUNDS:"}</span>
                
                {/* Language selection in drawer */}
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => handleSetLang("id")}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition-all ${
                      lang === "id" ? "bg-blue-600 text-white" : "text-gray-400"
                    }`}
                  >
                    ID
                  </button>
                  <button
                    onClick={() => handleSetLang("en")}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition-all ${
                      lang === "en" ? "bg-blue-600 text-white" : "text-gray-400"
                    }`}
                  >
                    EN
                  </button>
                </div>

                {/* Sound triggers in drawer */}
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 items-center gap-1">
                  <button
                    onClick={() => {
                      const muted = soundManager.toggleMuted();
                      setIsMuted(muted);
                    }}
                    className={`p-1 rounded transition-all ${
                      !isMuted ? "text-cyan-400 bg-cyan-500/10" : "text-gray-500"
                    }`}
                  >
                    {!isMuted ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  </button>
                  <button onClick={() => soundManager.playWhistle()} className="text-[10px] p-0.5">📢</button>
                  <button onClick={() => soundManager.playCrowdCheer()} className="text-[10px] p-0.5">🏟️</button>
                </div>
              </div>

              {/* Right group: Guide & Custom Background */}
              <div className="flex items-center gap-2">
                {/* Help button */}
                <button
                  onClick={() => {
                    setShowGuide(!showGuide);
                    soundManager.playClick();
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                    showGuide
                      ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                      : "bg-white/5 border-white/10 text-gray-300"
                  }`}
                >
                  <HelpCircle className="w-3 h-3 text-emerald-400" />
                  <span>{t.help}</span>
                </button>

                {/* Custom backdrop backdrop */}
                <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-gray-300 px-2.5 py-1 rounded-lg border border-white/10 transition-all flex items-center justify-center gap-1 text-[10px] font-bold">
                  <Palette className="w-3 h-3 text-blue-400" />
                  <span>{t.customPitch}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBackground}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main viewport Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN PANEL: SQUAD SETTINGS */}
        <div className="lg:col-span-3 flex flex-col gap-5 lg:overflow-y-auto lg:max-h-[85vh] pr-1 h-auto">
          
          {/* Identity settings */}
          <Interactive3DCard glowColor="rgba(59, 130, 246, 0.45)">
            <div className="p-4 flex flex-col gap-3">
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
                    aria-label={t.clubIdentity}
                    className="w-full bg-black/45 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/35 transition-all font-bold tracking-wide focus-visible:ring-2 focus-visible:ring-blue-500"
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
                        <img src={teamLogo} className="w-full h-full object-contain p-1" alt={lang === "id" ? "Pratinjau Logo Tim" : "Team Logo Preview"} />
                        <button
                          type="button"
                          onClick={() => setTeamLogo(null)}
                          className="absolute inset-0 bg-red-950/90 opacity-0 group-hover/logo-view:opacity-100 flex items-center justify-center transition-all text-red-500 font-extrabold text-[10px] cursor-pointer focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                          aria-label={lang === "id" ? "Hapus Logo Tim" : "Remove Team Logo"}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-black/45 hover:bg-[#0b0c10]/85 border-white/10 hover:border-blue-500/30 text-gray-400 hover:text-white shadow-xl backdrop-blur-md active:scale-95 focus-within:ring-2 focus-within:ring-blue-500">
                        <Upload className="w-4 h-4 text-blue-400 animate-bounce" style={{ animationDuration: '3s' }} aria-hidden="true" />
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
                          className="sr-only"
                          aria-label={t.chooseLogo}
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

              {/* Divider */}
              <div className="border-t border-white/[0.08] my-1" />

              {/* Manager Profile Section */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-[#5e6680] uppercase tracking-wider block">
                  {t.managerProfile}
                </span>

                <div className="flex items-center gap-2">
                  {/* Manager Name Input */}
                  <div className="flex-1 relative group/manager-input">
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => handleUpdateManagerName(e.target.value)}
                      placeholder="COACH"
                      aria-label={t.managerName}
                      className="w-full bg-black/45 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white uppercase focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/35 transition-all font-bold tracking-wide focus-visible:ring-2 focus-visible:ring-blue-500 font-mono"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] font-black tracking-widest text-[#5e6680] uppercase transition-opacity opacity-40 group-hover/manager-input:opacity-85">
                      {t.managerTitle}
                    </div>
                  </div>

                  {/* Manager Photo Upload */}
                  <div className="relative group/manager-photo-upload shrink-0">
                    <div className="flex items-center gap-2">
                      {managerPhoto ? (
                        <div className="relative w-8 h-8 bg-black/50 border border-white/15 rounded-xl overflow-hidden flex items-center justify-center group/photo-view">
                          <img src={managerPhoto} className="w-full h-full object-cover" alt="Manager Photo Preview" />
                          <button
                            type="button"
                            onClick={() => handleUpdateManagerPhoto(null)}
                            className="absolute inset-0 bg-red-950/90 opacity-0 group-hover/photo-view:opacity-100 flex items-center justify-center transition-all text-red-500 font-extrabold text-xs cursor-pointer focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                            aria-label={t.deletePhoto}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-black/45 hover:bg-[#0b0c10]/85 border-white/10 hover:border-blue-500/30 text-gray-400 hover:text-white shadow-xl backdrop-blur-md active:scale-95 focus-within:ring-2 focus-within:ring-blue-500">
                          <span className="text-sm">👔</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    handleUpdateManagerPhoto(event.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="sr-only"
                            aria-label={t.uploadPhoto}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Interactive3DCard>

        </div>

        {/* MIDDLE COLUMN WORKSPACE: PFP PITCH & MATCH STATE TITLE OVERGAMES */}
        <div className="lg:col-span-6 flex flex-col gap-4 items-center h-full">

          {/* DIGITAL FIELD SCREEN WITH VERTICAL BALL AND CONE CONTROLS */}
          <div className={`w-full flex transition-all duration-300 ${
            isPitchFullscreen 
              ? "fixed inset-0 z-[120] bg-[#07080a] flex-row gap-4 items-center justify-center p-4 md:p-8 overflow-hidden animate-fadeIn"
              : "flex-row gap-2.5 sm:gap-4 items-start justify-center relative"
          }`}>
            <div className={`flex-1 min-w-0 w-full relative group/pitch transition-all duration-300 ${
              isPitchFullscreen 
                ? "h-full max-h-[92vh] max-w-[850px] lg:max-w-[950px] flex items-center justify-center" 
                : "max-w-[580px]"
            }`}>
              {/* Floating scoreboard overlay for Team Name and Formation at the top-middle of the pitch */}
              {activeTool !== "draw" && (
                <div className="absolute top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-40 bg-[#0b0c10]/85 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/[0.08] px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 sm:gap-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:border-emerald-500/20 hover:bg-[#0b0c10]/95 transition-all duration-300 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 border-r border-white/10 pr-2 sm:pr-3.5">
                    {teamLogo ? (
                      <img 
                        src={teamLogo} 
                        className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 object-contain bg-black/40 p-0.5 rounded-md border border-white/10" 
                        alt={lang === "id" ? "Logo Tim" : "Team Logo"} 
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
                    <span className="text-[9px] sm:text-[10px] text-blue-400 font-extrabold tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-550/20 uppercase">
                      {sportMode === "soccer" ? (lang === "id" ? "SEPAKBOLA" : "SOCCER") : sportMode === "minisoccer" ? "MINI SOCCER" : sportMode === "futsal" ? "FUTSAL" : (lang === "id" ? "KUSTOM" : "CUSTOM")}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-gray-200 font-extrabold tracking-wider bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 uppercase">
                      {formation}
                    </span>
                  </div>
                </div>
              )}

              {/* Floating thin overlay for Pitch Board Theme option dropdown */}
              {activeTool !== "draw" && (
                <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-40 flex flex-col items-start group/themeselect">
                  <button
                    onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                    className="w-9 h-9 sm:w-11 sm:h-11 bg-[#0b0c10]/75 hover:bg-[#0b0c10]/95 text-gray-200 hover:text-white rounded-xl sm:rounded-2xl transition-all flex items-center justify-center shadow-xl border border-white/[0.08] hover:border-emerald-500/20 backdrop-blur-md cursor-pointer select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                    aria-label={lang === "id" ? "Pilih Tema Lapangan" : "Choose Pitch Theme"}
                    aria-haspopup="true"
                    aria-expanded={showThemeDropdown}
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
                    <div className="absolute left-0 top-full mt-1.5 w-42 sm:w-48 bg-[#0b0c10]/95 border border-white/[0.12] rounded-xl sm:rounded-2xl shadow-2xl z-55 overflow-hidden flex flex-col gap-0.5 p-1 animate-fadeIn backdrop-blur-md max-h-48 overflow-y-auto" role="menu">
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
                            className={`w-full text-left px-2 py-1.5 sm:py-2 rounded-lg text-[9.5px] sm:text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                              isActive
                                ? "bg-blue-650/25 border border-blue-550/30 text-blue-300"
                                : "bg-transparent border border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                            role="menuitem"
                            aria-label={th.label}
                            aria-current={isActive ? "true" : "false"}
                          >
                            <span className="text-sm shrink-0">{th.icon}</span>
                            <span className="truncate">{th.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Floating thin overlay for Reset Board & Fullscreen buttons */}
              {activeTool !== "draw" && (
                <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-40 flex items-center gap-1.5 sm:gap-2 justify-center">
                  {/* FULLSCREEN BUTTON */}
                  <div className="relative group/fullscreen">
                    <button
                      onClick={() => setIsPitchFullscreen(!isPitchFullscreen)}
                      className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center transition-all cursor-pointer border bg-[#0b0c10]/65 hover:bg-[#0b0c10]/85 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                        isPitchFullscreen
                          ? "border-blue-550/50 text-blue-400"
                          : "border-white/[0.08] text-gray-400 hover:text-white"
                      }`}
                      aria-label={lang === "id" ? "Mode Layar Penuh" : "Fullscreen Presentation Mode"}
                    >
                      {isPitchFullscreen ? (
                        <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </button>
                    {/* Floating descriptive tooltip/overlay */}
                    <div className="absolute right-0 top-full mt-2.5 opacity-0 scale-90 pointer-events-none group-hover/fullscreen:opacity-100 group-hover/fullscreen:scale-100 transition-all duration-150 bg-[#0e1017]/95 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-2xl z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                      <span className="text-[8px] font-black tracking-widest text-[#5e6680] uppercase">
                        {lang === "id" ? "LAYAR PENUH" : "FULLSCREEN"}
                      </span>
                      <span className="text-white font-extrabold text-[9px] whitespace-nowrap">
                        {isPitchFullscreen
                          ? (lang === "id" ? "Keluar Layar Penuh" : "Exit Fullscreen")
                          : (lang === "id" ? "Mode Presentasi Taktis" : "Tactical Presentation Mode")
                        }
                      </span>
                    </div>
                  </div>

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
                        className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-xl bg-red-600 hover:bg-red-500 text-white text-[7.5px] sm:text-[9px] font-black uppercase transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                      >
                        {t.yes}
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[7.5px] sm:text-[9px] font-black uppercase transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <div className="relative group/reset">
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center transition-all cursor-pointer border bg-[#0b0c10]/65 hover:bg-[#0b0c10]/85 border-white/[0.08] hover:border-red-900/30 text-gray-400 hover:text-red-400 shadow-xl backdrop-blur-md active:scale-95 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                        aria-label={lang === "id" ? "Atur Ulang Papan" : "Reset Board"}
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
              )}

              {/* Floating Match Sport Mode Selector at the left-middle side of the pitch */}
              {activeTool !== "draw" && (
                <div className="absolute top-1/2 -translate-y-1/2 left-2.5 sm:left-4 z-45 flex flex-col items-start group/sportselect">
                  <button
                    onClick={() => setShowSportOverlay(!showSportOverlay)}
                    className="w-9 h-9 sm:w-11 sm:h-11 bg-[#0b0c10]/85 hover:bg-[#0b0c10]/95 text-gray-200 hover:text-white rounded-xl sm:rounded-2xl transition-all flex flex-col gap-0.5 items-center justify-center shadow-xl border border-white/[0.08] hover:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] backdrop-blur-md cursor-pointer select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                    aria-label={lang === "id" ? "Ubah Mode Pertandingan" : "Change Match Sport Mode"}
                    aria-haspopup="true"
                    aria-expanded={showSportOverlay}
                  >
                    <span className="text-sm sm:text-base shrink-0 select-none animate-[pulse_2s_infinite]">
                      {sportMode === "soccer" && "⚽"}
                      {sportMode === "minisoccer" && "👟"}
                      {sportMode === "futsal" && "💨"}
                      {sportMode === "custom" && "⚙️"}
                    </span>
                    <span className="text-[6.5px] font-black uppercase text-indigo-400 tracking-tighter">
                      {sportMode === "soccer" && "11v11"}
                      {sportMode === "minisoccer" && "7v7"}
                      {sportMode === "futsal" && "5v5"}
                      {sportMode === "custom" && `${getSportModeLimit()}P`}
                    </span>
                  </button>

                  {/* Floating helpful description overlay of what this button does when not open */}
                  {!showSportOverlay && (
                    <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/sportselect:opacity-100 transition-all duration-150 bg-[#0e1017]/95 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-2xl text-[9px] font-black tracking-wide text-gray-200 backdrop-blur-md whitespace-nowrap z-50 flex flex-col">
                      <span className="text-[7.5px] font-black tracking-widest text-[#5e6680] uppercase select-none">
                        {lang === "id" ? "MODE PERTANDINGAN" : "MATCH SPORT MODE"}
                      </span>
                      <span className="text-white mt-0.5 font-bold">
                        {sportMode === "soccer" && (lang === "id" ? "Sepakbola (11 vs 11)" : "Soccer (11 vs 11)")}
                        {sportMode === "minisoccer" && (lang === "id" ? "Mini Soccer (7 vs 7)" : "Mini Soccer (7 vs 7)")}
                        {sportMode === "futsal" && (lang === "id" ? "Futsal (5 vs 5)" : "Futsal (5 vs 5)")}
                        {sportMode === "custom" && (lang === "id" ? `Kustom (${getSportModeLimit()} Pemain)` : `Custom (${getSportModeLimit()} Players)`)}
                      </span>
                      <span className="text-[7.5px] text-gray-400 font-medium select-none mt-0.5">{lang === "id" ? "Klik untuk mengubah mode" : "Click to change mode"}</span>
                    </div>
                  )}

                  {/* Full overlay selector dropdown when clicked */}
                  {showSportOverlay && (
                    <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 w-64 bg-[#0c0d12]/92 border border-white/[0.12] rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-55 p-3 flex flex-col gap-2.5 animate-fadeIn backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex flex-col">
                          <span className="text-[9.5px] font-black tracking-wider text-indigo-400 uppercase select-none">
                            {lang === "id" ? "Aturan Tanding" : "Sport Arena Rules"}
                          </span>
                          <span className="text-[11px] font-extrabold text-white">
                            {lang === "id" ? "Pilih Arena/Mode Baru" : "Choose Pitch Arena"}
                          </span>
                        </div>
                        <button
                          onClick={() => setShowSportOverlay(false)}
                          className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-white/10 cursor-pointer text-gray-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                          aria-label={lang === "id" ? "Tutup Aturan Tanding" : "Close Sport Arena Rules"}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {[
                          {
                            key: "soccer",
                            label: lang === "id" ? "Sepakbola (11 vs 11)" : "Football (11 vs 11)",
                            desc: lang === "id" ? "Aturan lapangan penuh standar FIFA" : "Standard full-pitch game rules",
                            icon: "⚽",
                            activeColor: "bg-emerald-600/20 text-emerald-400 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                          },
                          {
                            key: "minisoccer",
                            label: lang === "id" ? "Mini Soccer (7 vs 7)" : "Mini Soccer (7 vs 7)",
                            desc: lang === "id" ? "Taktik lapangan sedang & lincah" : "Medium turf and dynamic tactics",
                            icon: "👟",
                            activeColor: "bg-blue-600/20 text-blue-400 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          },
                          {
                            key: "futsal",
                            label: lang === "id" ? "Futsal (5 vs 5)" : "Futsal (5 vs 5)",
                            desc: lang === "id" ? "Sirkuit dalam ruangan cepat & presis" : "High precision fast indoor game",
                            icon: "💨",
                            activeColor: "bg-amber-600/20 text-amber-400 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                          },
                          {
                            key: "custom",
                            label: lang === "id" ? "Kustom Manual (1 - 11)" : "Custom Count (1 - 11)",
                            desc: lang === "id" ? "Atur jumlah pemain secara bebas" : "Freely set any player capacity",
                            icon: "🛠️",
                            activeColor: "bg-indigo-600/20 text-indigo-400 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                          }
                        ].map((modeItem) => {
                          const isActive = sportMode === modeItem.key;
                          return (
                            <div key={modeItem.key} className="flex flex-col gap-1.5">
                              <button
                                onClick={() => {
                                  handleSetSportMode(modeItem.key as any);
                                  if (modeItem.key !== "custom") {
                                    setShowSportOverlay(false);
                                  }
                                }}
                                className={`w-full text-left p-2 rounded-xl border text-[11px] cursor-pointer flex items-center gap-2.5 transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                                  isActive ? modeItem.activeColor : "bg-black/35 border-white/5 hover:border-white/15 text-gray-300"
                                }`}
                                aria-label={modeItem.label}
                                aria-pressed={isActive}
                              >
                                <span className="text-base bg-white/5 w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 border border-white/5">
                                  {modeItem.icon}
                                </span>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-extrabold tracking-wide uppercase text-[9.5px] leading-tight">
                                    {modeItem.label}
                                  </span>
                                  <span className="text-[8px] text-[#5e6680] font-medium leading-tight mt-0.5 truncate select-none">
                                    {modeItem.desc}
                                  </span>
                                </div>
                              </button>

                              {/* If custom is active and it's this mode, show custom controls */}
                              {modeItem.key === "custom" && isActive && (
                                <div className="px-2 py-1.5 bg-black/45 rounded-xl border border-white/[0.04] mt-0.5 flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-gray-400">
                                      {lang === "id" ? "JUMLAH PEMAIN" : "PLAYER COUNT"}
                                    </span>
                                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/15 border border-indigo-500/25 px-1.5 py-0.5 rounded">
                                      {customCount} {lang === "id" ? "Pemain" : "Players"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      disabled={customCount <= 1}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (customCount > 1) {
                                          handleSetSportMode("custom", customCount - 1);
                                        }
                                      }}
                                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 font-bold text-center border border-white/10 active:scale-95 transition-all text-xs text-white disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                                      aria-label={lang === "id" ? "Kurangi jumlah pemain" : "Decrease player count"}
                                    >
                                      -
                                    </button>

                                    <input
                                      type="range"
                                      min="1"
                                      max="11"
                                      value={customCount}
                                      onChange={(e) => {
                                        const newVal = parseInt(e.target.value);
                                        handleSetSportMode("custom", newVal);
                                      }}
                                      className="flex-1 accent-indigo-500 h-1 rounded bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                                      aria-label={lang === "id" ? "Jumlah Pemain Kustom" : "Custom Player Count"}
                                    />

                                    <button
                                      disabled={customCount >= 11}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (customCount < 11) {
                                          handleSetSportMode("custom", customCount + 1);
                                        }
                                      }}
                                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 font-bold text-center border border-white/10 active:scale-95 transition-all text-xs text-white disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                                      aria-label={lang === "id" ? "Tambah jumlah pemain" : "Increase player count"}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

                {/* Floating thin overlay for Default Formation Selector at the bottom-left inside the pitch */}
              {activeTool !== "draw" && (
                <div className="absolute bottom-[29%] sm:bottom-[18.5%] left-2.5 sm:left-4 z-45">
                  <div className="relative group/formation">
                    <button
                      onClick={() => setShowFormationMenu(!showFormationMenu)}
                      className="h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border bg-[#0b0c10]/65 hover:bg-[#0b0c10]/85 border-white/[0.08] hover:border-blue-500/30 text-gray-300 hover:text-white shadow-xl backdrop-blur-md active:scale-95 text-[9.5px] sm:text-[11px] font-black tracking-wide focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                      aria-label={t.defaultFormation}
                      aria-haspopup="true"
                      aria-expanded={showFormationMenu}
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
                      <div className="absolute top-full mt-1.5 left-0 w-52 bg-[#0e1017]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col divide-y divide-white/[0.06] animate-fadeIn" role="menu">
                        <div className="px-3 py-2 bg-white/[0.02] flex justify-between items-center select-none">
                          <span className="text-[8px] font-black tracking-wider text-[#5e6680] uppercase">{lang === "id" ? "PILIHAN FORMASI" : "FORMATIONS LIST"}</span>
                          <span className="text-[8px] text-blue-400 font-bold uppercase">{lang === "id" ? "Tabel" : "Table"}</span>
                        </div>
                        <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          {(() => {
                            const formationsList = 
                              sportMode === "futsal" ? [
                                { key: "1-2-1", desc: lang === "id" ? "Diamond Taktikal" : "Tactical Diamond", icon: "💎" },
                                { key: "2-2", desc: lang === "id" ? "Kotak Seimbang" : "Balanced Box", icon: "📦" },
                                { key: "1-1-2", desc: lang === "id" ? "Y-Menyerang" : "Attacking Y", icon: "🔱" },
                                { key: "3-1", desc: lang === "id" ? "Pyramid Bertahan" : "Defensive Pyramid", icon: "📐" }
                              ] : sportMode === "minisoccer" ? [
                                { key: "2-3-1", desc: lang === "id" ? "Sayap Agresif" : "Aggressive Wings", icon: "⚡" },
                                { key: "3-2-1", desc: lang === "id" ? "Piramida Kokoh" : "Solid Pyramid", icon: "⛑️" },
                                { key: "3-1-2", desc: lang === "id" ? "Ganda Striker" : "Double Attackers", icon: "🏹" },
                                { key: "2-2-2", desc: lang === "id" ? "Simetris Box" : "Symmetric Box", icon: "⏹️" }
                              ] : [
                                { key: "4-3-3", desc: lang === "id" ? "Attack Klasik" : "Classic Attacking", icon: "⚔️" },
                                { key: "4-4-2", desc: lang === "id" ? "Classic Seimbang" : "Classic Balanced", icon: "🛡️" },
                                { key: "3-5-2", desc: lang === "id" ? "Kuasai Sayap" : "Midfield Domination", icon: "⛓️" },
                                { key: "4-2-3-1", desc: lang === "id" ? "Taktis Modern" : "Modern Tactical", icon: "🎯" },
                                { key: "3-4-3", desc: lang === "id" ? "Sangat Menyerang" : "Aggressive Attack", icon: "🔥" },
                                { key: "4-5-1", desc: lang === "id" ? "Blok Bertahan" : "Defensive Block", icon: "🧱" },
                                { key: "5-3-2", desc: lang === "id" ? "Ujung Bertahan" : "Ultra Defensive", icon: "🏔️" }
                              ];
                            return formationsList.map((item) => {
                              const isSel = formation === item.key;
                              return (
                                <button
                                  key={item.key}
                                  onClick={() => {
                                    applyPresetFormation(item.key as any);
                                    setShowFormationMenu(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                                    isSel ? "bg-blue-600/20 text-blue-400 font-black" : "text-gray-300"
                                  }`}
                                  role="menuitem"
                                  aria-label={item.key}
                                  aria-current={isSel ? "true" : "false"}
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
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                isSnapToGrid={isSnapToGrid}
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
                showHeatmap={showHeatmap}
                lang={lang}
                sportMode={sportMode}
                isDrawLocked={isDrawLocked}
                activeSketchLayer={activeSketchLayer}
                visibleSketchLayers={visibleSketchLayers}
                onChangeTool={setActiveTool}
                setBrushColor={setBrushColor}
                setBrushSize={setBrushSize}
                setBrushStyle={setBrushStyle}
                managerName={managerName}
                managerPhoto={managerPhoto}
                isFullscreen={isPitchFullscreen}
              />

              {/* Floating thin overlay for Smart Squad Importer at the bottom-right inside the pitch */}
              {activeTool !== "draw" && (
                <div className="absolute bottom-[29%] sm:bottom-[18.5%] right-2.5 sm:right-4 z-45">
                  <SquadImport onImport={handleImportSquad} lang={lang} />
                </div>
              )}
            </div>

            {/* Tactical Tools Sidebar (Always vertical at the side of the field) */}
            <div className="flex flex-col gap-1.5 sm:gap-2 p-1.5 bg-[#0b0c10]/75 hover:bg-[#0b0c10]/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] select-none items-center justify-center shrink-0 hover:border-white/15 transition-all duration-300 z-45">
              
              {/* Active Tool select (Mode Geser/Drag) */}
              <div className="relative group shrink-0">
                <button
                  onClick={() => setActiveTool("select")}
                  title={lang === "id" ? "Mode Geser & Susun (Drag-Drop)" : "Drag & Drop Mode"}
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    activeTool === "select"
                      ? "bg-blue-600 text-white border-blue-400/30 shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-label={lang === "id" ? "Mode Geser & Susun" : "Drag & Drop Mode"}
                  aria-pressed={activeTool === "select"}
                >
                  <Move className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                </button>
                {/* Floating Tooltip Help sliding leftwards securely */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                  <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.control}</span>
                  <span className="text-white font-black">{lang === "id" ? "Mode Geser & Susun (Drag)" : "Drag & Drop Mode"}</span>
                </div>
              </div>

              {/* Active Tool draw (Mode Coret/Draw) */}
              <div className="relative group/draw shrink-0">
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => {
                      if (activeTool !== "draw") {
                        setActiveTool("draw");
                      } else {
                        setActiveTool("select");
                      }
                    }}
                    title={lang === "id" ? "Mode Coret Taktikal (Draw)" : "Tactical Sketch Mode"}
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                      activeTool === "draw"
                        ? "bg-blue-600 text-white border-blue-400/30 shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                    aria-label={lang === "id" ? "Mode Coret Taktikal" : "Tactical Sketch Mode"}
                    aria-pressed={activeTool === "draw"}
                  >
                    <PenTool className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                    {/* Active Color dot indicator in the corner of draw button */}
                    <span 
                      className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full border border-black/45 shadow-sm"
                      style={{ backgroundColor: brushColor }}
                    />
                  </button>
                </div>

                {/* Floating Tooltip Help */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover/draw:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                  <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.control}</span>
                  <span className="text-white font-black">{lang === "id" ? "Mode Coret Taktikal (Draw)" : "Tactical Sketch Mode"}</span>
                </div>
              </div>

              {/* Responsive separation line (divider) */}
              <div className="w-5 sm:w-8 h-[1px] bg-white/[0.08] my-1 sm:my-1.5 shrink-0" />

              {/* COLLAPSIBLE TOOLBAR TOGGLE BUTTON */}
              <div className="relative group shrink-0">
                <button
                  onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
                  title={isToolbarExpanded 
                    ? (lang === "id" ? "Sembunyikan Toolkit" : "Collapse Toolkit")
                    : (lang === "id" ? "Buka Toolkit (Rollout)" : "Expand Toolkit (Rollout)")}
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                    isToolbarExpanded
                      ? "bg-indigo-600 border-indigo-400/40 text-white shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Sliders className={`w-3.5 h-3.5 md:w-4.5 md:h-4.5 transition-transform duration-300 ${isToolbarExpanded ? 'rotate-90' : ''}`} />
                </button>
                {/* Floating Tooltip Help */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                  <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">Toolbar</span>
                  <span className="text-white font-black">
                    {isToolbarExpanded 
                      ? (lang === "id" ? "Sembunyikan Toolkit" : "Collapse Toolkit")
                      : (lang === "id" ? "Buka Toolkit (Rollout)" : "Expand Toolkit (Rollout)")}
                  </span>
                </div>
              </div>

              {/* ROLL OUT ZONE */}
              <AnimatePresence>
                {isToolbarExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-1.5 sm:gap-2 w-full overflow-visible"
                  >
                    {/* Responsive separation line (divider) */}
                    <div className="w-5 sm:w-8 h-[1px] bg-white/[0.08] my-1 sm:my-1.5 shrink-0" />

                    {/* Add Ball Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => handleAddTacticalItem("ball")}
                        title={lang === "id" ? "Tambah Bola Baru" : "Spawn New Ball"}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-emerald-600/20 text-white hover:text-emerald-400 border border-white/10 hover:border-emerald-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md shrink-0"
                      >
                        <span className="text-[12px] sm:text-[14px] md:text-[19px] hover:scale-110 transition-transform">⚽</span>
                      </button>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.elements}</span>
                        <span className="text-white font-black">{lang === "id" ? "Tambah Bola Baru" : "Spawn New Ball"}</span>
                      </div>
                    </div>

                    {/* Add Cone Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => handleAddTacticalItem("cone")}
                        title={lang === "id" ? "Tambah Cone Latihan" : "Spawn Practice Cone"}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-orange-650/20 text-white hover:text-orange-400 border border-white/10 hover:border-orange-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md shrink-0"
                      >
                        <div className="relative flex flex-col items-center">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-gradient-to-t from-orange-600 via-orange-500 to-amber-300 rounded-t-full border-t border-amber-200 flex items-center justify-center shadow-lg">
                            <div className="w-1 h-0.5 md:w-2 md:h-0.5 bg-white/50 rounded-full mb-0.5"></div>
                          </div>
                          <div className="w-3.5 h-0.5 sm:w-4 sm:h-0.5 md:w-5.5 md:h-1 bg-orange-700 rounded-full -mt-0.5 shadow-md"></div>
                        </div>
                      </button>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.elements}</span>
                        <span className="text-white font-black">{lang === "id" ? "Tambah Cone Latihan" : "Spawn Practice Cone"}</span>
                      </div>
                    </div>

                    {/* Responsive separation line (divider) */}
                    <div className="w-5 sm:w-8 h-[1px] bg-white/[0.08] my-1 sm:my-1.5 shrink-0" />

                    {/* Jersey Utama */}
                    <div className="relative group shrink-0" title={lang === "id" ? "Jersey Tim Utama" : "Primary Kit Color"}>
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden shrink-0">
                        <div className="relative flex items-center justify-center">
                          <Shirt className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-300 transition-transform group-hover:scale-115 duration-205" style={{ fill: primaryColor, color: primaryColor === "#ffffff" ? "#cbd5e1" : "transparent" }} />
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                          />
                        </div>
                      </div>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.uniform}</span>
                        <span className="text-white font-black">{lang === "id" ? "Jersey Tim Utama" : "Primary Kit Color"}</span>
                      </div>
                    </div>

                    {/* Jersey Keeper */}
                    <div className="relative group shrink-0" title={lang === "id" ? "Warna Jersey Kiper (GK)" : "Goalkeeper Kit Color"}>
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden shrink-0">
                        <div className="relative flex items-center justify-center">
                          <Shirt className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-300 transition-transform group-hover:scale-115 duration-205" style={{ fill: gkColor, color: gkColor === "#ffffff" ? "#cbd5e1" : "transparent" }} />
                          <input
                            type="color"
                            value={gkColor}
                            onChange={(e) => setGkColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                          />
                        </div>
                      </div>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.uniform}</span>
                        <span className="text-white font-black">{lang === "id" ? "Jersey Kiper (GK)" : "Goalkeeper Kit Color"}</span>
                      </div>
                    </div>

                    {/* Warna Nomor Punggung */}
                    <div className="relative group shrink-0" title={lang === "id" ? "Warna Angka/Nomor Jersey" : "Jersey Number Color"}>
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden shrink-0">
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <span className="text-[9px] md:text-[12px] font-black tracking-tighter transition-transform group-hover:scale-115 duration-205" style={{ color: numberColor }}>10</span>
                          <input
                            type="color"
                            value={numberColor}
                            onChange={(e) => setNumberColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                          />
                        </div>
                      </div>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.uniform}</span>
                        <span className="text-white font-black">{lang === "id" ? "Warna Nomor" : "Numbers Color"}</span>
                      </div>
                    </div>

                    {/* Responsive separation line (divider) */}
                    <div className="w-5 sm:w-8 h-[1px] bg-white/[0.08] my-1 sm:my-1.5 shrink-0" />

                    {/* Tactical Grid Overlay Toggle Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => setShowTacticalGrid(!showTacticalGrid)}
                        title={lang === "id" ? "Grid Taktis" : "Tactical Grid"}
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                          showTacticalGrid
                            ? "bg-indigo-600 text-white border-indigo-400/30 shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                      </button>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.tacticalGrid}</span>
                        <span className="text-white font-black">{lang === "id" ? "Grid Taktis" : "Tactical Grid"}</span>
                      </div>
                    </div>

                    {/* Magnetic Grid Snapping / Free Placement Toggle Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => {
                          setIsSnapToGrid(!isSnapToGrid);
                          soundManager.playClick();
                        }}
                        title={lang === "id" ? "Magnet Grid / Bebas" : "Grid Magnet / Free"}
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                          isSnapToGrid
                            ? "bg-amber-600 text-white border-amber-400/30 shadow-[0_0_12px_rgba(217,119,6,0.35)]"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Magnet className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                      </button>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">
                          {lang === "id" ? "KONTROL PRESISI" : "PRECISION CONTROL"}
                        </span>
                        <span className="text-white font-black">
                          {isSnapToGrid
                            ? (lang === "id" ? "Magnet Grid: Aktif" : "Grid Magnet: Active")
                            : (lang === "id" ? "Penempatan: Bebas & Halus" : "Placement: Free & Smooth")}
                        </span>
                      </div>
                    </div>

                    {/* Tactical Heatmap Overlay Toggle Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        title={lang === "id" ? "Peta Panas (Heatmap)" : "Heatmap Analysis"}
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                          showHeatmap
                            ? "bg-red-600 text-white border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.45)]"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 md:w-4.5 md:h-4.5 ${showHeatmap ? 'animate-pulse text-orange-200' : ''}`} />
                      </button>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">{t.heatmapTitle}</span>
                        <span className="text-white font-black">{t.heatmapDesc}</span>
                      </div>
                    </div>

                    {/* Responsive separation line (divider) */}
                    <div className="w-5 sm:w-8 h-[1px] bg-white/[0.08] my-1 sm:my-1.5 shrink-0" />

                    {/* Save Playbook Button */}
                    <div className="relative group shrink-0" id="btn-save-playbook-wrapper">
                      <button
                        id="btn-save-playbook-trigger"
                        onClick={() => {
                          setSaveLoadMode("save");
                          setSaveLoadModalOpen(true);
                        }}
                        title={lang === "id" ? "Simpan Formasi & Skuad" : "Save Pitch & Squad"}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md shrink-0"
                      >
                        <Save className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                      </button>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-emerald-400 uppercase">{lang === "id" ? "PENYIMPANAN" : "SAVE STATE"}</span>
                        <span className="text-white font-black">{lang === "id" ? "Simpan Formasi & Skuad" : "Save Pitch & Squad"}</span>
                      </div>
                    </div>

                    {/* Load Setup Button */}
                    <div className="relative group shrink-0" id="btn-load-playbook-wrapper">
                      <button
                        id="btn-load-playbook-trigger"
                        onClick={() => {
                          setSaveLoadMode("load");
                          setSaveLoadModalOpen(true);
                        }}
                        title={lang === "id" ? "Muat Formasi Tersimpan" : "Load Saved Playbook"}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md shrink-0"
                      >
                        <FolderOpen className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                      </button>
                      {/* Floating Tooltip Help */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-205 bg-[#0e0f13]/95 border border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xl text-[9.5px] sm:text-[10px] whitespace-nowrap z-50 flex flex-col items-end gap-0.5 backdrop-blur-md">
                        <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-blue-400 uppercase">{lang === "id" ? "MEMORI" : "LOAD BOARD"}</span>
                        <span className="text-white font-black">{lang === "id" ? "Muat Formasi Tersimpan" : "Load Saved Playbook"}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

          {/* Tactical Drills Menu to load exercises */}
          <TacticalDrills
            onLoadDrill={handleLoadTacticalDrill}
            currentFrames={frames}
            currentSportMode={sportMode}
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
            lang={lang}
            managerName={managerName}
            managerPhoto={managerPhoto}
          />

          {/* AI Coach integration */}
          <AICoach
            key={settingsKey}
            players={players}
            items={items}
            currentFormation={formation}
            onLoadGeneratedPlay={handleLoadGeneratedPlay}
            onApplyFormation={applyPresetFormation}
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
            initialManagerName={managerName}
            initialManagerPhoto={managerPhoto}
          />
        )}
      </AnimatePresence>

      {/* PLAYBOOK SAVE AND LOAD MANAGER MODAL */}
      <AnimatePresence>
        {saveLoadModalOpen && (
          <PlaybookSaveLoadModal
            isOpen={saveLoadModalOpen}
            onClose={() => setSaveLoadModalOpen(false)}
            mode={saveLoadMode}
            lang={lang}
            players={players}
            items={items}
            formation={formation}
            teamName={teamName}
            teamLogo={teamLogo}
            primaryColor={primaryColor}
            gkColor={gkColor}
            numberColor={numberColor}
            sportMode={sportMode}
            onLoadPlaybook={handleLoadPlaybook}
          />
        )}
      </AnimatePresence>

      {/* GLOBAL CREDENTIALS SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={() => setSettingsKey((prev) => prev + 1)}
        lang={lang}
      />

    </div>
  );
}
