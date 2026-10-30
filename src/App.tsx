import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Player, TacticalItem, DrawingStroke, AnimationFrame, TacticalPlay, PitchTheme, TacticalOverlayMode, TacticalPhase, DeviceViewMode, AndroidViewportSize, AndroidActiveTab, FormationShapeConfig, TacticalStylePreset, CustomFormationTemplate } from "./types";
import Pitch from "./components/Pitch";
import TacticalTelemetryHUD from "./components/TacticalTelemetryHUD";
import MatchBriefingSheetModal from "./components/MatchBriefingSheetModal";
import AICoach from "./components/AICoach";
import AIFormationImageGenerator from "./components/AIFormationImageGenerator";
import SponsorAcquisitionPortal from "./components/SponsorAcquisitionPortal";
import AnimationTimeline from "./components/AnimationTimeline";
import TacticalDrills from "./components/TacticalDrills";
import { TacticalDrill } from "./data/tacticalDrills";
import PlayerEditorModal from "./components/PlayerEditorModal";
import SquadImport from "./components/SquadImport";
import SquadManagement from "./components/SquadManagement";
import BroadcastTV from "./components/BroadcastTV";
import { AppTutorialSocialKit } from "./components/AppTutorialSocialKit";
import { PlaybookSaveLoadModal } from "./components/PlaybookSaveLoadModal";
import { SettingsModal } from "./components/SettingsModal";
import AndroidBottomNav from "./components/AndroidBottomNav";
import CornerKickSimulator, { generateCornerSimulationData, CornerSide, CornerSchemeId } from "./components/CornerKickSimulator";
import { soundManager } from "./utils/sound";
import { toPng } from "html-to-image";
import Interactive3DCard from "./components/Interactive3DCard";
import { NanoBananaLogo, ToolHoverTooltip, NanoBananaIconStudioModal } from "./components/NanoBananaToolIcon";
import {
  Flag,
  Play,
  Pause,
  Sparkles,
  Check,
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
  Magnet,
  Users,
  ArrowUpDown,
  Import,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";

const TRANSLATIONS = {
  id: {
    appTitle: "Tactigen Pro",
    appSubtitle: "Papan Taktik Sepakbola & Strategi Formasi",
    omniConnected: "Sistem Taktis Siap",
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
    mainJersey: "Jersey Tim Utama",
    deleteJersey: "Hapus Jersey",
    chooseJersey: "Pilihlah File Jersey...",
    jerseyRecomend: "File PNG / JPG gambar baju tim sangat direkomendasikan.",
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
    footerSubtitle: "Papan Taktik Sepakbola & Formasi Digital",
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
    appSubtitle: "Tactical Football Board & Lineup Creator",
    omniConnected: "Tactical Engine Ready",
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
    mainJersey: "Team Jersey",
    deleteJersey: "Delete Jersey",
    chooseJersey: "Upload Jersey...",
    jerseyRecomend: "Transparent PNG or JPG team shirt images are highly recommended.",
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
    footerSubtitle: "Digital Football Tactics & Formation Board",
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
  { id: "p1", name: "Player 1", number: 1, role: "GK", x: 50, y: 88, isStarting: true, photo: null },
  { id: "p2", name: "Player 2", number: 2, role: "DEF", x: 38, y: 74, isStarting: true, photo: null },
  { id: "p3", name: "Player 3", number: 3, role: "DEF", x: 62, y: 74, isStarting: true, photo: null },
  { id: "p4", name: "Player 4", number: 4, role: "DEF", x: 82, y: 68, isStarting: true, photo: null },
  { id: "p5", name: "Player 5", number: 5, role: "DEF", x: 18, y: 68, isStarting: true, photo: null },
  { id: "p6", name: "Player 6", number: 6, role: "MID", x: 50, y: 58, isStarting: true, photo: null },
  { id: "p7", name: "Player 7", number: 7, role: "MID", x: 34, y: 46, isStarting: true, photo: null },
  { id: "p8", name: "Player 8", number: 8, role: "MID", x: 66, y: 46, isStarting: true, photo: null },
  { id: "p9", name: "Player 9", number: 9, role: "FWD", x: 50, y: 22, isStarting: true, photo: null },
  { id: "p10", name: "Player 10", number: 10, role: "FWD", x: 20, y: 28, isStarting: true, photo: null },
  { id: "p11", name: "Player 11", number: 11, role: "FWD", x: 80, y: 28, isStarting: true, photo: null },
  // Substitutes
  { id: "p12", name: "Player 12", number: 12, role: "MID", x: 0, y: 0, isStarting: false, photo: null },
  { id: "p13", name: "Player 13", number: 13, role: "DEF", x: 0, y: 0, isStarting: false, photo: null },
  { id: "p14", name: "Player 14", number: 14, role: "FWD", x: 0, y: 0, isStarting: false, photo: null },
  { id: "p15", name: "Player 15", number: 15, role: "FWD", x: 0, y: 0, isStarting: false, photo: null }
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

  const [teamName, setTeamName] = useState(() => {
    try {
      const saved = localStorage.getItem("tactigen_team_name");
      if (saved && saved !== "GARUDA FC") return saved;
      return "Team A";
    } catch {
      return "Team A";
    }
  });

  const handleUpdateTeamName = (name: string) => {
    setTeamName(name);
    try {
      localStorage.setItem("tactigen_team_name", name);
    } catch (e) {
      console.warn(e);
    }
  };

  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [teamJersey, setTeamJersey] = useState<string | null>(() => {
    try {
      return localStorage.getItem("tactigen_team_jersey") || null;
    } catch {
      return null;
    }
  });

  const handleUpdateTeamJersey = (jersey: string | null) => {
    setTeamJersey(jersey);
    try {
      if (jersey) {
        localStorage.setItem("tactigen_team_jersey", jersey);
      } else {
        localStorage.removeItem("tactigen_team_jersey");
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const [managerName, setManagerName] = useState(() => {
    try {
      const saved = localStorage.getItem("tactigen_manager_name");
      if (saved && saved !== "Budi Santoso") return saved;
      return "Coach";
    } catch {
      return "Coach";
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
  const [isEnemyModeActive, setIsEnemyModeActive] = useState<boolean>(false);
  const [showEnemyDropdown, setShowEnemyDropdown] = useState<boolean>(false);
  const [opponentFormation, setOpponentFormation] = useState<string>("custom");
  const [preEnemyTeamPositions, setPreEnemyTeamPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Formation Studio: Tactical Shape Sliders, Base Anchor Coordinates & Custom Formations
  const [formationShape, setFormationShape] = useState<FormationShapeConfig>({
    lineHeight: 50,
    teamWidth: 50,
    compactness: 50,
    stylePreset: "balanced",
    autoFitRoles: true
  });
  const [baseFormationCoords, setBaseFormationCoords] = useState<{ role: string; x: number; y: number }[]>(
    () => PRESET_FORMATIONS["4-3-3"]
  );
  const [customFormations, setCustomFormations] = useState<CustomFormationTemplate[]>(() => {
    try {
      const raw = localStorage.getItem("tactigen_custom_formations_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isFormationStudioModalOpen, setIsFormationStudioModalOpen] = useState<boolean>(false);
  const [isPosterHDModalOpen, setIsPosterHDModalOpen] = useState<boolean>(false);
  const [isNanoIconStudioOpen, setIsNanoIconStudioOpen] = useState<boolean>(false);
  const [pitchZoneMode, setPitchZoneMode] = useState<"pitch" | "poster">("pitch");

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
  const [enemyColor, setEnemyColor] = useState("#2563eb"); // Royal Blue Opponent

  // Tools state
  const [activeTool, setActiveTool] = useState<"select" | "draw">("select");
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);
  const [brushStyle, setBrushStyle] = useState<"solid" | "arrow" | "eraser">("solid");
  const [isSnapToGrid, setIsSnapToGrid] = useState<boolean>(true);
  const [showDrawConfig, setShowDrawConfig] = useState(true);
  const [showColorPickerPopup, setShowColorPickerPopup] = useState(false);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);
  const [pcRightTab, setPcRightTab] = useState<"corner" | "animation" | "ai">("corner");
  const [isDrawLocked, setIsDrawLocked] = useState<boolean>(false);
  const [activeSketchLayer, setActiveSketchLayer] = useState<number>(1);
  const [visibleSketchLayers, setVisibleSketchLayers] = useState<number[]>([1, 2, 3]);
  const [sketchLayerOrder, setSketchLayerOrder] = useState<number[]>([1, 2, 3]);

  // Custom textures backdrop URL
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [pitchTheme, setPitchTheme] = useState<PitchTheme>("sporty-tosca");
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFormationMenu, setShowFormationMenu] = useState(false);
  const [isPitchFullscreen, setIsPitchFullscreen] = useState(false);
  const [activeSimulationTitle, setActiveSimulationTitle] = useState<string | null>(null);
  const [isInlineSimPlaying, setIsInlineSimPlaying] = useState<boolean>(false);

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

  // Auto-detect Device & Display Mode (PC vs HP/Android layout adaptation without manual switch)
  const detectAutoDeviceMode = (): DeviceViewMode => {
    if (typeof window === "undefined") return "pc";
    return window.innerWidth < 1024 ? "android" : "pc";
  };

  const [deviceMode, setDeviceMode] = useState<DeviceViewMode>(detectAutoDeviceMode);
  const [androidActiveTab, setAndroidActiveTab] = useState<AndroidActiveTab>("pitch");
  const [showClubIdentityBar, setShowClubIdentityBar] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      setDeviceMode(detectAutoDeviceMode());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Professional Tactical Telemetry & UEFA Matchday Sheet States
  const [tacticalOverlay, setTacticalOverlay] = useState<TacticalOverlayMode>("none");
  const [tacticalPhase, setTacticalPhase] = useState<TacticalPhase>("build-up");
  const [isMeasureMode, setIsMeasureMode] = useState<boolean>(false);
  const [isMatchSheetOpen, setIsMatchSheetOpen] = useState<boolean>(false);

  // Sequential Playbook Animation Steps
  const [frames, setFrames] = useState<AnimationFrame[]>([
    {
      id: "frame-init",
      name: "Fasa 1: Posisi Standard",
      players: DEFAULT_PLAYERS.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
      items: DEFAULT_ITEMS.map((item) => ({ id: item.id, x: item.x, y: item.y })),
      instruction: "Lakukan organisasi pemain pada posisi standard dan siapkan pola build up.",
      duration: 2.0
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

  const getSportModeLimit = (mode: string = sportMode) => {
    if (mode === "minisoccer") return 7;
    if (mode === "futsal") return 5;
    if (mode === "custom") return customCount;
    return 11;
  };

  const getDefaultFormationForSport = (mode: string): string => {
    if (mode === "minisoccer") return "2-3-1";
    if (mode === "futsal") return "1-2-1";
    if (mode === "custom") return "custom";
    return "4-3-3";
  };

  const getBalancedEnemyPositionsForCount = (count: number): { x: number; y: number; role: string }[] => {
    if (count <= 0) return [];
    const coords: { x: number; y: number; role: string }[] = [];
    
    // First player is always GK
    coords.push({ x: 50, y: 10, role: "GK" });
    if (count === 1) return coords;

    const fieldCount = count - 1;
    if (fieldCount === 1) {
      coords.push({ x: 50, y: 35, role: "FIELD" });
    } else if (fieldCount === 2) {
      coords.push({ x: 35, y: 25, role: "FIELD" });
      coords.push({ x: 65, y: 35, role: "FIELD" });
    } else if (fieldCount === 3) {
      coords.push({ x: 50, y: 22, role: "FIELD" });
      coords.push({ x: 30, y: 38, role: "FIELD" });
      coords.push({ x: 70, y: 38, role: "FIELD" });
    } else if (fieldCount === 4) {
      coords.push({ x: 30, y: 22, role: "FIELD" });
      coords.push({ x: 70, y: 22, role: "FIELD" });
      coords.push({ x: 35, y: 38, role: "FIELD" });
      coords.push({ x: 65, y: 38, role: "FIELD" });
    } else if (fieldCount === 5) {
      coords.push({ x: 30, y: 22, role: "FIELD" });
      coords.push({ x: 70, y: 22, role: "FIELD" });
      coords.push({ x: 50, y: 32, role: "FIELD" });
      coords.push({ x: 35, y: 42, role: "FIELD" });
      coords.push({ x: 65, y: 42, role: "FIELD" });
    } else if (fieldCount === 6) {
      coords.push({ x: 25, y: 22, role: "FIELD" });
      coords.push({ x: 75, y: 22, role: "FIELD" });
      coords.push({ x: 20, y: 34, role: "FIELD" });
      coords.push({ x: 50, y: 34, role: "FIELD" });
      coords.push({ x: 80, y: 34, role: "FIELD" });
      coords.push({ x: 50, y: 44, role: "FIELD" });
    } else if (fieldCount === 7) {
      coords.push({ x: 25, y: 22, role: "FIELD" });
      coords.push({ x: 75, y: 22, role: "FIELD" });
      coords.push({ x: 30, y: 32, role: "FIELD" });
      coords.push({ x: 50, y: 32, role: "FIELD" });
      coords.push({ x: 70, y: 32, role: "FIELD" });
      coords.push({ x: 35, y: 44, role: "FIELD" });
      coords.push({ x: 65, y: 44, role: "FIELD" });
    } else if (fieldCount === 8) {
      coords.push({ x: 20, y: 22, role: "FIELD" });
      coords.push({ x: 50, y: 20, role: "FIELD" });
      coords.push({ x: 80, y: 22, role: "FIELD" });
      coords.push({ x: 30, y: 32, role: "FIELD" });
      coords.push({ x: 70, y: 32, role: "FIELD" });
      coords.push({ x: 20, y: 42, role: "FIELD" });
      coords.push({ x: 50, y: 44, role: "FIELD" });
      coords.push({ x: 80, y: 42, role: "FIELD" });
    } else if (fieldCount === 9) {
      coords.push({ x: 20, y: 22, role: "FIELD" });
      coords.push({ x: 50, y: 20, role: "FIELD" });
      coords.push({ x: 80, y: 22, role: "FIELD" });
      coords.push({ x: 20, y: 32, role: "FIELD" });
      coords.push({ x: 50, y: 32, role: "FIELD" });
      coords.push({ x: 80, y: 32, role: "FIELD" });
      coords.push({ x: 30, y: 44, role: "FIELD" });
      coords.push({ x: 50, y: 44, role: "FIELD" });
      coords.push({ x: 70, y: 44, role: "FIELD" });
    } else {
      coords.push({ x: 18, y: 22, role: "FIELD" });
      coords.push({ x: 38, y: 20, role: "FIELD" });
      coords.push({ x: 62, y: 20, role: "FIELD" });
      coords.push({ x: 82, y: 22, role: "FIELD" });
      coords.push({ x: 20, y: 34, role: "FIELD" });
      coords.push({ x: 40, y: 32, role: "FIELD" });
      coords.push({ x: 60, y: 32, role: "FIELD" });
      coords.push({ x: 80, y: 34, role: "FIELD" });
      coords.push({ x: 35, y: 44, role: "FIELD" });
      coords.push({ x: 65, y: 44, role: "FIELD" });
    }

    return coords;
  };

  const handleSpawnEnemyTeam = (formationType: string) => {
    setOpponentFormation(formationType);
    setItems((prev) => prev.filter((item) => item.type !== "enemy"));

    let enemyPositions: { x: number; y: number }[] = [];

    const modeFormations = SPORT_FORMATIONS[sportMode];
    if (modeFormations && modeFormations[formationType]) {
      // Dynamic mapping by inverting the Y-coordinate from the home team's template
      enemyPositions = modeFormations[formationType].map((coord) => ({
        x: coord.x,
        y: 100 - coord.y
      }));
    } else {
      // Fallback to balanced enemy positioning matching the sport's capacity limit
      const count = getSportModeLimit();
      const coords = getBalancedEnemyPositionsForCount(count);
      enemyPositions = coords.map((pos) => ({ x: pos.x, y: pos.y }));
    }

    const newEnemies = enemyPositions.map((pos, idx) => {
      const finalY = isEnemyModeActive 
        ? parseFloat(((pos.y / 100) * 40 + 6).toFixed(1)) 
        : pos.y;
      return {
        id: `enemy-auto-${idx}-${Date.now()}`,
        type: "enemy" as const,
        x: pos.x,
        y: finalY,
        number: idx + 1,
        role: idx === 0 ? "GK" : "FIELD"
      };
    });

    setItems((prev) => {
      const combined = [...prev, ...newEnemies];
      setFrames((fPrev) => {
        const fUpdated = [...fPrev];
        if (fUpdated[activeFrameIndex]) {
          fUpdated[activeFrameIndex].items = combined.map((i) => ({ id: i.id, x: i.x, y: i.y }));
        }
        return fUpdated;
      });
      return combined;
    });
  };

  const handleRebalanceEnemies = () => {
    const currentFormation = opponentFormation || getDefaultFormationForSport(sportMode);
    const existingEnemies = items.filter((item) => item.type === "enemy");

    let enemyPositions: { x: number; y: number }[] = [];
    const modeFormations = SPORT_FORMATIONS[sportMode];

    const isStandardFormation = modeFormations && modeFormations[currentFormation];
    const standardCount = isStandardFormation ? modeFormations[currentFormation].length : 0;

    if (isStandardFormation && existingEnemies.length === standardCount) {
      enemyPositions = modeFormations[currentFormation].map((coord) => ({
        x: coord.x,
        y: 100 - coord.y
      }));
    } else {
      const count = existingEnemies.length > 0 ? existingEnemies.length : getSportModeLimit();
      const coords = getBalancedEnemyPositionsForCount(count);
      enemyPositions = coords.map((pos) => ({ x: pos.x, y: pos.y }));
    }

    if (existingEnemies.length === 0) {
      handleSpawnEnemyTeam(currentFormation);
    } else {
      const updatedItems = items.map((item) => {
        if (item.type !== "enemy") return item;
        const idx = existingEnemies.findIndex((e) => e.id === item.id);
        if (idx !== -1 && enemyPositions[idx]) {
          const pos = enemyPositions[idx];
          const finalY = isEnemyModeActive 
            ? parseFloat(((pos.y / 100) * 40 + 6).toFixed(1)) 
            : pos.y;
          return {
            ...item,
            x: pos.x,
            y: finalY
          };
        }
        return item;
      });
      setItems(updatedItems);
      setFrames((fPrev) => {
        const fUpdated = [...fPrev];
        if (fUpdated[activeFrameIndex]) {
          fUpdated[activeFrameIndex].items = updatedItems.map((i) => ({ id: i.id, x: i.x, y: i.y }));
        }
        return fUpdated;
      });
    }
  };

  const handleClearAllEnemies = () => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.type !== "enemy");
      setFrames((fPrev) => {
        const fUpdated = [...fPrev];
        if (fUpdated[activeFrameIndex]) {
          fUpdated[activeFrameIndex].items = filtered.map((i) => ({ id: i.id, x: i.x, y: i.y }));
        }
        return fUpdated;
      });
      return filtered;
    });
  };

  const handleToggleEnemyMode = (active: boolean) => {
    setIsEnemyModeActive(active);
    if (active) {
      // 1. Save current team positions
      const teamPos: Record<string, { x: number; y: number }> = {};
      players.forEach((p) => {
        if (p.isStarting) {
          teamPos[p.id] = { x: p.x, y: p.y };
        }
      });
      setPreEnemyTeamPositions(teamPos);

      // 2. Compress our players to the bottom half
      setPlayers((prev) =>
        prev.map((player) => {
          if (player.isStarting) {
            return { ...player, y: parseFloat((52 + (player.y / 100) * 38).toFixed(1)) };
          }
          return player;
        })
      );

      // 3. Spawn enemies in the correct default formation for chosen sport
      const defaultOpponentFormation = getDefaultFormationForSport(sportMode);
      setOpponentFormation(defaultOpponentFormation);
      handleSpawnEnemyTeam(defaultOpponentFormation);
    } else {
      // Remove enemies
      setItems((prev) => prev.filter((item) => item.type !== "enemy"));

      // Restore our players
      if (Object.keys(preEnemyTeamPositions).length > 0) {
        setPlayers((prev) =>
          prev.map((player) => {
            if (player.isStarting && preEnemyTeamPositions[player.id]) {
              return {
                ...player,
                x: preEnemyTeamPositions[player.id].x,
                y: preEnemyTeamPositions[player.id].y
              };
            }
            return player;
          })
        );
      }
    }
  };

  // Sync enemies if sportMode or customCount changes while enemy mode is active
  useEffect(() => {
    if (isEnemyModeActive) {
      const defaultOpponentFormation = getDefaultFormationForSport(sportMode);
      setOpponentFormation(defaultOpponentFormation);
      handleSpawnEnemyTeam(defaultOpponentFormation);
    }
  }, [sportMode, customCount, isEnemyModeActive]);

  // Live TV mode overlay full-screen preview toggle
  const [tvModeOpen, setTvModeOpen] = useState(false);

  // Help guides collapse
  const [showGuide, setShowGuide] = useState(false);

  // Mobile utility dropdown toggle
  const [showMobileUtils, setShowMobileUtils] = useState(false);

  // Squad Management & Sorting Modal
  const [isSquadManagementOpen, setIsSquadManagementOpen] = useState(false);
  const [isSquadImportModalOpen, setIsSquadImportModalOpen] = useState(false);

  // Global API Keys & MCP Settings Portal Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsKey, setSettingsKey] = useState(0);
  const [settingsInitialTab, setSettingsInitialTab] = useState<"gemini" | "mcp" | "audio" | "display">("gemini");
  const [hasConnectedAI, setHasConnectedAI] = useState(() => {
    return !!(
      (localStorage.getItem("tactigen_custom_key") || "").trim() ||
      localStorage.getItem("tactigen_mcp_enabled") === "true"
    );
  });

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
    setIsInlineSimPlaying(false);
    setActiveSimulationTitle(null);
    setTacticalOverlay("none");
    setTacticalPhase("build-up");
    const cleanItems = items.filter((item) => !item.id.startsWith("enemy-ck-"));
    setItems(cleanItems);
    setFrames([
      {
        id: "frame-init",
        name: "Fasa 1: Posisi Standard",
        players: players.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
        items: cleanItems.map((item) => ({ id: item.id, x: item.x, y: item.y })),
        instruction: "Kembali ke setelan standard awal.",
        duration: 2.0
      }
    ]);
    setActiveFrameIndex(0);
    applyPresetFormation(formation);
  };

  // Inline simulation auto-play effect (for Corner Kick & multi-phase simulations directly on the pitch)
  useEffect(() => {
    if (!isInlineSimPlaying || frames.length <= 1) return;
    const currentDur = Math.max(0.8, frames[activeFrameIndex]?.duration ?? 1.8);
    const speedMult =
      playSpeed === "slow" ? 1.4 : playSpeed === "fast" ? 0.65 : playSpeed === "superfast" ? 0.4 : 1.0;
    const delayMs = Math.round(currentDur * 1000 * speedMult);

    const timer = setTimeout(() => {
      const nextIdx = activeFrameIndex >= frames.length - 1 ? 0 : activeFrameIndex + 1;
      handleSelectFrameIndex(nextIdx);
      if (nextIdx === frames.length - 1) {
        soundManager.playCrowdCheer();
      } else {
        soundManager.playClick();
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isInlineSimPlaying, activeFrameIndex, frames, playSpeed]);

  const handleApplyCornerSimulation = (payload: {
    updatedPlayers: Player[];
    updatedItems: TacticalItem[];
    frames: AnimationFrame[];
    overlayMode: TacticalOverlayMode;
    phase: TacticalPhase;
    autoPlay: boolean;
    title: string;
  }) => {
    setSportMode("soccer");
    setPlayers(payload.updatedPlayers);
    setItems(payload.updatedItems);
    setFrames(payload.frames);
    setActiveFrameIndex(0);
    setTacticalOverlay(payload.overlayMode);
    setTacticalPhase(payload.phase);
    setShowMovementTrails(true);
    setActiveSimulationTitle(payload.title);
    if (deviceMode === "android") {
      setAndroidActiveTab("pitch");
    }
    if (payload.autoPlay) {
      setIsInlineSimPlaying(true);
    } else {
      setIsInlineSimPlaying(false);
    }
  };

  const handleQuickCornerKick = (side: CornerSide, schemeId: CornerSchemeId) => {
    const data = generateCornerSimulationData(players, side, schemeId, "hybrid", lang);
    const titleLabel =
      side === "left"
        ? lang === "id"
          ? "Corner Kiri: In-Swinger & Flick"
          : "Left Corner: In-Swinger & Flick"
        : schemeId === "short-triangle"
        ? lang === "id"
          ? "Corner Pendek 2v1 & Cutback"
          : "Short Corner 2v1 & Cutback"
        : lang === "id"
        ? "Corner Kanan: Tiang Jauh Overload"
        : "Right Corner: Far-Post Overload";

    handleApplyCornerSimulation({
      updatedPlayers: data.updatedPlayers,
      updatedItems: data.updatedItems,
      frames: data.frames,
      overlayMode: "corner-zones",
      phase: "set-piece",
      autoPlay: true,
      title: titleLabel
    });
    soundManager.playWhistle();
  };

  const handleSaveCurrentAsNewFrame = () => {
    const newFrameId = `frame-${Date.now()}`;
    const nextIndex = frames.length + 1;
    const inheritedDuration = frames[activeFrameIndex]?.duration ?? 2.0;
    const newFrame: AnimationFrame = {
      id: newFrameId,
      name: `Fasa ${nextIndex}: Gerakan Lanjutan`,
      players: players.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
      items: items.map((i) => ({ id: i.id, x: i.x, y: i.y })),
      instruction: "Tentukan gerak sirkulasi baru pada fasa taktis lanjutan ini.",
      duration: inheritedDuration
    };
    setFrames((prev) => [...prev, newFrame]);
    setActiveFrameIndex(frames.length);
  };

  const handleUpdateFrameDuration = (idx: number, duration: number) => {
    const clamped = Math.max(0.2, Math.min(10.0, Number(duration.toFixed(1))));
    setFrames((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, duration: clamped } : f))
    );
  };

  const handleUpdateAllFramesDuration = (duration: number) => {
    soundManager.playChime();
    const clamped = Math.max(0.2, Math.min(10.0, Number(duration.toFixed(1))));
    setFrames((prev) =>
      prev.map((f) => ({ ...f, duration: clamped }))
    );
  };

  const handleDeleteFrame = (idx: number) => {
    if (frames.length <= 1) return;
    const updatedFrames = frames.filter((_, i) => i !== idx);
    // Rename remaining frames so Fasa indices match correctly and look high quality
    const renamedFrames = updatedFrames.map((f, i) => {
      if (f.name.startsWith("Fasa ") || f.name.startsWith("Phase ")) {
        const colonIdx = f.name.indexOf(":");
        const rest = colonIdx !== -1 ? f.name.substring(colonIdx + 1) : "";
        return {
          ...f,
          name: lang === "id" ? `Fasa ${i + 1}:${rest}` : `Phase ${i + 1}:${rest}`
        };
      }
      return f;
    });
    setFrames(renamedFrames);
    if (activeFrameIndex >= renamedFrames.length) {
      setActiveFrameIndex(renamedFrames.length - 1);
    } else if (activeFrameIndex === idx) {
      setActiveFrameIndex(Math.max(0, idx - 1));
    } else if (activeFrameIndex > idx) {
      setActiveFrameIndex(activeFrameIndex - 1);
    }
    soundManager.playClick();
  };

  // Integrate AI responses from tactical engine
  const handleLoadGeneratedPlay = (play: TacticalPlay) => {
    const parsedFrames: AnimationFrame[] = play.frames.map((f, index) => ({
      id: `frame-ai-${index}-${Date.now()}`,
      name: f.name,
      players: f.players,
      items: f.items,
      instruction: f.instruction,
      duration: f.duration || 2.0
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

  const getAvailableFormationsForSport = (mode: string = sportMode) => {
    if (mode === "futsal") {
      return [
        { key: "1-2-1", desc: lang === "id" ? "Diamond Taktikal" : "Tactical Diamond", icon: "💎" },
        { key: "2-2", desc: lang === "id" ? "Kotak Seimbang" : "Balanced Box", icon: "📦" },
        { key: "1-1-2", desc: lang === "id" ? "Y-Menyerang" : "Attacking Y", icon: "🔱" },
        { key: "3-1", desc: lang === "id" ? "Pyramid Bertahan" : "Defensive Pyramid", icon: "📐" }
      ];
    }
    if (mode === "minisoccer") {
      return [
        { key: "2-3-1", desc: lang === "id" ? "Sayap Agresif" : "Aggressive Wings", icon: "⚡" },
        { key: "3-2-1", desc: lang === "id" ? "Piramida Kokoh" : "Solid Pyramid", icon: "⛑️" },
        { key: "3-1-2", desc: lang === "id" ? "Ganda Striker" : "Double Attackers", icon: "🏹" },
        { key: "2-2-2", desc: lang === "id" ? "Simetris Box" : "Symmetric Box", icon: "⏹️" }
      ];
    }
    return [
      { key: "4-3-3", desc: lang === "id" ? "Attack Klasik" : "Classic Attacking", icon: "⚔️" },
      { key: "4-4-2", desc: lang === "id" ? "Classic Seimbang" : "Classic Balanced", icon: "🛡️" },
      { key: "4-2-3-1", desc: lang === "id" ? "Taktis Modern" : "Modern Tactical", icon: "🎯" },
      { key: "3-5-2", desc: lang === "id" ? "Kuasai Sayap" : "Midfield Domination", icon: "⛓️" },
      { key: "3-4-3", desc: lang === "id" ? "Sangat Menyerang" : "Aggressive Attack", icon: "🔥" },
      { key: "3-2-4-1", desc: lang === "id" ? "Box Midfield Pro" : "Pro Box Midfield", icon: "💠" },
      { key: "4-1-2-1-2", desc: lang === "id" ? "Diamond Sempit" : "Narrow Diamond", icon: "💎" },
      { key: "4-1-4-1", desc: lang === "id" ? "Jangkar Tunggal" : "Single Pivot", icon: "⚓" },
      { key: "4-5-1", desc: lang === "id" ? "Blok Bertahan" : "Defensive Block", icon: "🧱" },
      { key: "5-3-2", desc: lang === "id" ? "Wingback Kokoh" : "Solid Wingbacks", icon: "🏔️" },
      { key: "5-4-1", desc: lang === "id" ? "Ultra Bertahan" : "Low Block Wall", icon: "🔒" }
    ];
  };

  const computeShapedCoordinates = (
    baseCoords: { role: string; x: number; y: number }[],
    shape: FormationShapeConfig,
    enemyActive: boolean
  ): { role: "GK" | "DEF" | "MID" | "FWD"; x: number; y: number }[] => {
    const outfield = baseCoords.filter((c, idx) => c.role !== "GK" && idx !== 0);
    const avgCenterY =
      outfield.length > 0
        ? outfield.reduce((sum, c) => sum + c.y, 0) / outfield.length
        : 48;

    const compactFactor = 1 - ((shape.compactness - 50) / 50) * 0.42;
    const yShift = -((shape.lineHeight - 50) / 50) * 16;
    const widthFactor = 1 + ((shape.teamWidth - 50) / 50) * 0.38;

    return baseCoords.map((coord, idx) => {
      const validRole = (
        ["GK", "DEF", "MID", "FWD"].includes(coord.role) ? coord.role : "MID"
      ) as "GK" | "DEF" | "MID" | "FWD";

      if (validRole === "GK" || idx === 0) {
        const gkShift = shape.lineHeight > 65 ? -((shape.lineHeight - 65) / 35) * 4 : 0;
        const rawGkY = Math.max(76, Math.min(92, coord.y + gkShift));
        const finalGkY = enemyActive
          ? parseFloat((52 + (rawGkY / 100) * 38).toFixed(1))
          : parseFloat(rawGkY.toFixed(1));
        return { role: "GK", x: coord.x, y: finalGkY };
      }

      const yAfterCompact = avgCenterY + (coord.y - avgCenterY) * compactFactor;
      const rawY = Math.max(10, Math.min(82, yAfterCompact + yShift));
      const rawX = Math.max(7, Math.min(93, 50 + (coord.x - 50) * widthFactor));

      const finalY = enemyActive
        ? parseFloat((52 + (rawY / 100) * 38).toFixed(1))
        : parseFloat(rawY.toFixed(1));

      return {
        role: validRole,
        x: parseFloat(rawX.toFixed(1)),
        y: finalY
      };
    });
  };

  const applyCoordinatesAndSyncFrames = (
    targetBaseCoords: { role: string; x: number; y: number }[],
    targetShape: FormationShapeConfig,
    forceRoleFit = false
  ) => {
    const shapedCoords = computeShapedCoordinates(targetBaseCoords, targetShape, isEnemyModeActive);
    const shouldFitRoles = forceRoleFit || targetShape.autoFitRoles;

    // Clean up any temporary corner simulation state
    setIsInlineSimPlaying(false);
    setActiveSimulationTitle(null);
    if (tacticalOverlay === "corner-zones") {
      setTacticalOverlay("none");
    }
    const cleanItems = items.filter((item) => !item.id.startsWith("enemy-ck-"));
    setItems(cleanItems);

    const roleOrder: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

    const currentStarters = players.filter((p) => p.isStarting);
    const currentSubs = players.filter((p) => !p.isStarting);

    const orderedStarters = shouldFitRoles
      ? [...currentStarters].sort((a, b) => {
          const rA = roleOrder[a.role] ?? 99;
          const rB = roleOrder[b.role] ?? 99;
          if (rA !== rB) return rA - rB;
          return (a.number || 0) - (b.number || 0);
        })
      : currentStarters;

    const updatedStarters = orderedStarters.map((player, idx) => {
      const slot = shapedCoords[idx];
      if (!slot) return player;
      return {
        ...player,
        x: slot.x,
        y: slot.y,
        role: shouldFitRoles ? slot.role : player.role
      };
    });

    const nextPlayers = [...updatedStarters, ...currentSubs];
    setPlayers(nextPlayers);

    setFrames([
      {
        id: "frame-init",
        name: lang === "id" ? "Fasa 1: Posisi Standard" : "Phase 1: Standard Positions",
        players: updatedStarters.map((p) => ({ id: p.id, x: p.x, y: p.y })),
        items: cleanItems.map((item) => ({ id: item.id, x: item.x, y: item.y })),
        instruction:
          lang === "id"
            ? "Organisasi formasi dan lini taktis telah diperbarui."
            : "Formation structure and tactical lines updated.",
        duration: 2.0
      }
    ]);
    setActiveFrameIndex(0);
  };

  // --- SQUAD MODIFICATION CODES ---
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
    setBaseFormationCoords(coords);

    const resetShape: FormationShapeConfig = {
      ...formationShape,
      lineHeight: 50,
      teamWidth: 50,
      compactness: 50,
      stylePreset: "balanced"
    };
    setFormationShape(resetShape);

    const currentStarters = players.filter((p) => p.isStarting);
    const currentSubs = players.filter((p) => !p.isStarting);

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

    const updatedStarters = nextStarters.map((p, idx) => {
      const c = coords[idx];
      if (!c) return { ...p, isStarting: true };
      const validRole = (["GK", "DEF", "MID", "FWD"].includes(c.role) ? c.role : p.role) as "GK" | "DEF" | "MID" | "FWD";
      return {
        ...p,
        isStarting: true,
        x: c.x,
        y: isEnemyModeActive ? parseFloat((52 + (c.y / 100) * 38).toFixed(1)) : c.y,
        role: formationShape.autoFitRoles ? validRole : p.role
      };
    });
    const updatedSubs = nextSubs.map((p) => ({ ...p, isStarting: false, x: 0, y: 0 }));
    const combined = [...updatedStarters, ...updatedSubs];
    setPlayers(combined);

    const cleanItems = items.filter((item) => !item.id.startsWith("enemy-ck-"));
    setItems(cleanItems);
    setIsInlineSimPlaying(false);
    setActiveSimulationTitle(null);
    setFrames([
      {
        id: "frame-init",
        name: lang === "id" ? "Fasa 1: Posisi Standard" : "Phase 1: Standard Positions",
        players: updatedStarters.map((p) => ({ id: p.id, x: p.x, y: p.y })),
        items: cleanItems.map((item) => ({ id: item.id, x: item.x, y: item.y })),
        instruction: lang === "id" ? "Mode olahraga dan formasi disesuaikan." : "Sport mode and formation updated.",
        duration: 2.0
      }
    ]);
    setActiveFrameIndex(0);
  };

  const applyPresetFormation = (formKey: string) => {
    setFormation(formKey);
    const coordinates = SPORT_FORMATIONS[sportMode]?.[formKey];
    if (!coordinates) return;

    setBaseFormationCoords(coordinates);
    const nextShape: FormationShapeConfig = {
      ...formationShape,
      lineHeight: 50,
      teamWidth: 50,
      compactness: 50,
      stylePreset: "balanced"
    };
    setFormationShape(nextShape);
    applyCoordinatesAndSyncFrames(coordinates, nextShape, false);
    soundManager.playClick();
  };

  const handleChangeFormationShape = (partialShape: Partial<FormationShapeConfig>) => {
    const nextShape: FormationShapeConfig = {
      ...formationShape,
      ...partialShape
    };
    setFormationShape(nextShape);
    applyCoordinatesAndSyncFrames(baseFormationCoords, nextShape, false);
  };

  const handleApplyTacticalStyle = (preset: TacticalStylePreset) => {
    const styleMap: Record<TacticalStylePreset, { lineHeight: number; teamWidth: number; compactness: number; phase: TacticalPhase }> = {
      balanced: { lineHeight: 50, teamWidth: 50, compactness: 50, phase: "build-up" },
      "high-press": { lineHeight: 78, teamWidth: 56, compactness: 76, phase: "high-press" },
      "mid-block": { lineHeight: 48, teamWidth: 42, compactness: 80, phase: "mid-block" },
      "low-block": { lineHeight: 22, teamWidth: 34, compactness: 84, phase: "low-block" },
      "tiki-taka": { lineHeight: 64, teamWidth: 62, compactness: 82, phase: "progression" },
      "wing-overload": { lineHeight: 60, teamWidth: 88, compactness: 52, phase: "final-third" },
      custom: {
        lineHeight: formationShape.lineHeight,
        teamWidth: formationShape.teamWidth,
        compactness: formationShape.compactness,
        phase: tacticalPhase
      }
    };
    const cfg = styleMap[preset] || styleMap.balanced;
    const nextShape: FormationShapeConfig = {
      ...formationShape,
      lineHeight: cfg.lineHeight,
      teamWidth: cfg.teamWidth,
      compactness: cfg.compactness,
      stylePreset: preset
    };
    setFormationShape(nextShape);
    setTacticalPhase(cfg.phase);
    applyCoordinatesAndSyncFrames(baseFormationCoords, nextShape, false);
    soundManager.playClick();
  };

  const handleAutoFitRoles = () => {
    applyCoordinatesAndSyncFrames(baseFormationCoords, formationShape, true);
    soundManager.playClick();
  };

  const handleSaveCustomFormation = (name: string) => {
    const starters = players.filter((p) => p.isStarting);
    const normalizedPositions = starters.map((p) => {
      const normY = isEnemyModeActive
        ? Math.max(8, Math.min(92, parseFloat((((p.y - 52) / 38) * 100).toFixed(1))))
        : p.y;
      return {
        role: p.role,
        x: p.x,
        y: normY
      };
    });

    const newTemplate: CustomFormationTemplate = {
      id: `custom-form-${Date.now()}`,
      name,
      sportMode,
      positions: normalizedPositions,
      createdAt: Date.now()
    };

    const updated = [newTemplate, ...customFormations];
    setCustomFormations(updated);
    setFormation(name);
    setBaseFormationCoords(normalizedPositions);
    try {
      localStorage.setItem("tactigen_custom_formations_v1", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    soundManager.playClick();
  };

  const handleDeleteCustomFormation = (id: string) => {
    const updated = customFormations.filter((cf) => cf.id !== id);
    setCustomFormations(updated);
    try {
      localStorage.setItem("tactigen_custom_formations_v1", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    soundManager.playClick();
  };

  const handleApplyCustomFormation = (template: CustomFormationTemplate) => {
    if (template.sportMode !== sportMode) {
      setSportMode(template.sportMode);
    }
    setFormation(template.name);
    setBaseFormationCoords(template.positions);
    const resetShape: FormationShapeConfig = {
      ...formationShape,
      lineHeight: 50,
      teamWidth: 50,
      compactness: 50,
      stylePreset: "balanced"
    };
    setFormationShape(resetShape);
    applyCoordinatesAndSyncFrames(template.positions, resetShape, false);
    soundManager.playClick();
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

  const handleSortPlayers = (
    sortBy: "role" | "number" | "name",
    order: "asc" | "desc" = "asc",
    target: "all" | "starters" | "bench" = "all"
  ) => {
    soundManager.playClick();
    setPlayers((prev) => {
      const roleOrder: Record<string, number> = { GK: 1, DEF: 2, MID: 3, FWD: 4 };

      const sortFn = (a: Player, b: Player) => {
        if (sortBy === "role") {
          const ordA = roleOrder[a.role] || 99;
          const ordB = roleOrder[b.role] || 99;
          if (ordA !== ordB) {
            return order === "asc" ? ordA - ordB : ordB - ordA;
          }
          // Secondary sort: ascending jersey number
          return (a.number || 0) - (b.number || 0);
        } else if (sortBy === "number") {
          const diff = (a.number || 0) - (b.number || 0);
          return order === "asc" ? diff : -diff;
        } else {
          const comp = a.name.localeCompare(b.name);
          return order === "asc" ? comp : -comp;
        }
      };

      if (target === "all") {
        return [...prev].sort(sortFn);
      } else if (target === "starters") {
        const starters = prev.filter((p) => p.isStarting).sort(sortFn);
        const bench = prev.filter((p) => !p.isStarting);
        return [...starters, ...bench];
      } else {
        // bench only
        const starters = prev.filter((p) => p.isStarting);
        const bench = prev.filter((p) => !p.isStarting).sort(sortFn);
        return [...starters, ...bench];
      }
    });
  };

  const handleToggleStarter = (id: string) => {
    soundManager.playClick();
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.isStarting) {
          return { ...p, isStarting: false };
        } else {
          return { ...p, isStarting: true, x: 50, y: 50 };
        }
      })
    );
  };

  const handleBulkUpdatePlayers = (updates: { id: string; changes: Partial<Player> }[]) => {
    soundManager.playClick();
    setPlayers((prev) => {
      const updateMap = new Map(updates.map((u) => [u.id, u.changes]));
      return prev.map((p) => {
        const changes = updateMap.get(p.id);
        return changes ? { ...p, ...changes } : p;
      });
    });
  };

  const handleBulkDeletePlayers = (playerIds: string[]) => {
    soundManager.playClick();
    const idSet = new Set(playerIds);
    setPlayers((prev) => prev.filter((p) => !idSet.has(p.id)));
  };

  const getBalancedEnemyPosition = (count: number, sport: string): { x: number; y: number; role: string; number: number } => {
    const isFutsal = sport === "futsal";
    if (isFutsal) {
      const futsalPresets = [
        { x: 50, y: 12, role: "GK" },    // Goalkeeper
        { x: 30, y: 32, role: "DEF" },   // Left Defender
        { x: 70, y: 32, role: "DEF" },   // Right Defender
        { x: 35, y: 68, role: "FWD" },   // Left Attacker
        { x: 65, y: 68, role: "FWD" }    // Right Attacker
      ];
      const index = count % 5;
      const preset = futsalPresets[index];
      const wrapOffsetMultiplier = Math.floor(count / 5);
      const offsetX = (wrapOffsetMultiplier * 4) % 12;
      const offsetY = (wrapOffsetMultiplier * 3) % 9;
      return {
        x: Math.max(5, Math.min(95, parseFloat((preset.x + offsetX).toFixed(1)))),
        y: Math.max(5, Math.min(80, parseFloat((preset.y + offsetY).toFixed(1)))),
        role: preset.role,
        number: count + 1
      };
    } else {
      const soccerPresets = [
        { x: 50, y: 12, role: "GK" },    // Goalkeeper
        { x: 38, y: 26, role: "DEF" },   // Center Back Left
        { x: 62, y: 26, role: "DEF" },   // Center Back Right
        { x: 35, y: 48, role: "MID" },   // Center Mid Left
        { x: 65, y: 48, role: "MID" },   // Center Mid Right
        { x: 50, y: 74, role: "FWD" },   // Striker
        { x: 18, y: 32, role: "DEF" },   // Left Back
        { x: 82, y: 32, role: "DEF" },   // Right Back
        { x: 50, y: 42, role: "MID" },   // Attacking Mid
        { x: 25, y: 72, role: "FWD" },  // Left Winger
        { x: 75, y: 72, role: "FWD" }   // Right Winger
      ];
      const index = count % 11;
      const preset = soccerPresets[index];
      const wrapOffsetMultiplier = Math.floor(count / 11);
      const offsetX = (wrapOffsetMultiplier * 4) % 12;
      const offsetY = (wrapOffsetMultiplier * 3) % 9;
      return {
        x: Math.max(5, Math.min(95, parseFloat((preset.x + offsetX).toFixed(1)))),
        y: Math.max(5, Math.min(80, parseFloat((preset.y + offsetY).toFixed(1)))),
        role: preset.role,
        number: count + 1
      };
    }
  };

  const handleAddTacticalItem = (type: "ball" | "cone" | "enemy", x?: number, y?: number) => {
    const enemyCount = items.filter((i) => i.type === "enemy").length;
    let finalX = x;
    let finalY = y;
    let role: string | undefined = undefined;
    let number: number | undefined = undefined;

    if (type === "enemy") {
      const balanced = getBalancedEnemyPosition(enemyCount, sportMode);
      finalX = x !== undefined ? x : balanced.x;
      finalY = y !== undefined ? y : balanced.y;
      role = balanced.role;
      number = balanced.number;
    } else {
      finalX = x !== undefined ? x : 50;
      finalY = y !== undefined ? y : 40;
    }

    const newItem: TacticalItem = {
      id: `item-${Date.now()}`,
      type,
      x: finalX,
      y: finalY,
      number,
      role
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

  const renderAnimationTimeline = () => (
    <AnimationTimeline
      frames={frames}
      activeFrameIndex={activeFrameIndex}
      setActiveFrameIndex={handleSelectFrameIndex}
      onPlayStateChange={setIsPlayingTactic}
      onResetFrames={handleResetFrames}
      onSaveCurrentFrameAsNew={handleSaveCurrentAsNewFrame}
      onUpdateFrameDuration={handleUpdateFrameDuration}
      onUpdateAllFramesDuration={handleUpdateAllFramesDuration}
      playSpeed={playSpeed}
      setPlaySpeed={setPlaySpeed}
      transitionType={transitionType}
      setTransitionType={setTransitionType}
      showMovementTrails={showMovementTrails}
      setShowMovementTrails={setShowMovementTrails}
      onDeleteFrame={handleDeleteFrame}
      lang={lang}
    />
  );

  const renderTacticalDrills = () => (
    <TacticalDrills
      onLoadDrill={handleLoadTacticalDrill}
      currentFrames={frames}
      currentSportMode={sportMode}
      lang={lang}
    />
  );

  const renderAIImageGen = (viewMode: "formation-only" | "poster-stage" = "formation-only") => (
    <AIFormationImageGenerator
      viewMode={viewMode}
      onSwitchToPitch={() => setPitchZoneMode("pitch")}
      isPitchFullscreen={isPitchFullscreen}
      formation={formation}
      sportMode={sportMode}
      availableFormations={getAvailableFormationsForSport(sportMode)}
      onSelectFormation={applyPresetFormation}
      formationShape={formationShape}
      onChangeFormationShape={handleChangeFormationShape}
      onApplyTacticalStyle={handleApplyTacticalStyle}
      onAutoFitRoles={handleAutoFitRoles}
      customFormations={customFormations}
      onSaveCustomFormation={handleSaveCustomFormation}
      onDeleteCustomFormation={handleDeleteCustomFormation}
      onApplyCustomFormation={handleApplyCustomFormation}
      onOpenSettings={() => {
        setSettingsInitialTab("gemini");
        setIsSettingsModalOpen(true);
      }}
      teamName={teamName}
      primaryColor={primaryColor}
      gkColor={gkColor}
      numberColor={numberColor}
      players={players}
      teamLogo={teamLogo}
      teamJersey={teamJersey}
      lang={lang}
      managerName={managerName}
      managerPhoto={managerPhoto}
      isEnemyModeActive={isEnemyModeActive}
      externalOpenStudio={isFormationStudioModalOpen}
      onExternalCloseStudio={() => setIsFormationStudioModalOpen(false)}
      externalOpenPosterStudio={isPosterHDModalOpen}
      onExternalClosePosterStudio={() => setIsPosterHDModalOpen(false)}
    />
  );

  const renderAICoach = () => (
    <AICoach
      key={settingsKey}
      players={players}
      items={items}
      currentFormation={formation}
      onLoadGeneratedPlay={handleLoadGeneratedPlay}
      onApplyFormation={applyPresetFormation}
      onOpenSettings={(tab) => {
        setSettingsInitialTab(tab);
        setIsSettingsModalOpen(true);
      }}
      lang={lang}
    />
  );

  const renderCornerKickSimulator = () => (
    <CornerKickSimulator
      players={players}
      onApplyCornerSimulation={handleApplyCornerSimulation}
      lang={lang}
    />
  );

  return (
    <div className="relative min-h-screen bg-[#061318] bg-[linear-gradient(to_right,#2dd4bf08_1px,transparent_1px),linear-gradient(to_bottom,#2dd4bf08_1px,transparent_1px)] bg-[size:28px_28px] text-white flex flex-col font-sans antialiased overflow-x-hidden">
      
      {/* Global floating button to exit presentation mode */}
      {isPitchFullscreen && (
        <button
          onClick={() => setIsPitchFullscreen(false)}
          className="fixed top-4 right-4 z-[9999] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs uppercase shadow-[0_10px_25px_rgba(239,68,68,0.4)] backdrop-blur-md border border-red-500/30 transition-all active:scale-95 cursor-pointer animate-fadeIn"
          title={lang === "id" ? "Keluar Layar Penuh (ESC)" : "Exit Fullscreen (ESC)"}
        >
          <Minimize2 className="w-4 h-4" />
          <span>{lang === "id" ? "Keluar" : "Exit"}</span>
        </button>
      )}
      
      {/* Soft Sporty Tosca ambient decorative illumination */}
      <div className="absolute top-0 left-1/4 w-[520px] h-[520px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/4 w-[480px] h-[480px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      
      {/* Header bar Navigation - Soft Sporty Tosca Frosted Glass */}
      <header className="h-16 flex items-center justify-between px-3 md:px-6 border-b border-teal-400/15 bg-[#051419]/90 backdrop-blur-md z-40 shadow-[0_4px_30px_rgba(2,10,14,0.55)] select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/25">
            <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white font-display">{t.appTitle}</h1>
            <p className="text-[10px] text-teal-200/70 font-medium tracking-wide hidden sm:block">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Global Toolbar controls - Logo-only with Hover Tooltips */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#071c22]/90 border border-teal-400/20 rounded-2xl p-1 shadow-inner">
          {/* Language Selector */}
          <div className="flex bg-[#041115] border border-teal-400/20 rounded-xl p-0.5 shrink-0" role="group" aria-label={lang === "id" ? "Pilih Bahasa" : "Choose Language"}>
            <div className="relative group">
              <button
                type="button"
                onClick={() => handleSetLang("id")}
                className={`w-7 h-7 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                  lang === "id"
                    ? "bg-teal-400 text-slate-950 font-black shadow-sm"
                    : "text-teal-100/70 hover:text-white hover:bg-white/5"
                }`}
                aria-pressed={lang === "id"}
              >
                ID
              </button>
              <ToolHoverTooltip
                category="BAHASA"
                title="Bahasa Indonesia"
                placement="bottom"
              />
            </div>
            <div className="relative group">
              <button
                type="button"
                onClick={() => handleSetLang("en")}
                className={`w-7 h-7 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                  lang === "en"
                    ? "bg-teal-400 text-slate-950 font-black shadow-sm"
                    : "text-teal-100/70 hover:text-white hover:bg-white/5"
                }`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
              <ToolHoverTooltip
                category="LANGUAGE"
                title="English Interface"
                placement="bottom"
              />
            </div>
          </div>

          <div className="w-px h-4 bg-teal-400/15" />

          {/* UI Icon Studio Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setIsNanoIconStudioOpen(true);
                soundManager.playClick();
              }}
              className="w-8 h-8 rounded-xl bg-teal-400/15 hover:bg-teal-400/25 border border-teal-400/40 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              aria-label="Icon Studio"
            >
              <NanoBananaLogo tool="nano_studio" size="sm" />
            </button>
            <ToolHoverTooltip
              category="UI"
              title="Icon Studio"
              placement="bottom"
            />
          </div>

          {/* Broadcast TV Preview Logo Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setTvModeOpen(true);
                soundManager.playClick();
              }}
              className="w-8 h-8 rounded-xl bg-[#041115] hover:bg-teal-500/15 border border-teal-400/20 hover:border-teal-400/45 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              aria-label={lang === "id" ? "Mode Siaran TV Lineup" : "Broadcast TV Lineup Mode"}
            >
              <NanoBananaLogo tool="tv" size="sm" />
            </button>
            <ToolHoverTooltip
              category={lang === "id" ? "PRESENTASI" : "BROADCAST"}
              title={lang === "id" ? "Layar Siaran TV Lineup" : "Broadcast TV Lineup View"}
              placement="bottom"
            />
          </div>

          {/* Download PNG Logo Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                handleDownloadImage();
                soundManager.playClick();
              }}
              className="w-8 h-8 rounded-xl bg-[#041115] hover:bg-teal-500/15 border border-teal-400/20 hover:border-teal-400/45 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              aria-label={lang === "id" ? "Unduh Gambar Lapangan (PNG)" : "Download Pitch Image (PNG)"}
            >
              <NanoBananaLogo tool="download" size="sm" />
            </button>
            <ToolHoverTooltip
              category={lang === "id" ? "EKSPOR GAMBAR" : "EXPORT PNG"}
              title={lang === "id" ? "Unduh Gambar Taktik (PNG)" : "Download Tactical Board (PNG)"}
              placement="bottom"
            />
          </div>

          {/* Help / Guide Logo Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setShowGuide(!showGuide);
                soundManager.playClick();
              }}
              className={`w-8 h-8 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                showGuide
                  ? "bg-teal-400 text-slate-950 border-teal-300"
                  : "bg-[#041115] border-teal-400/20 hover:bg-teal-500/15"
              }`}
              aria-label={lang === "id" ? "Buka Panduan" : "Open Guide"}
              aria-expanded={showGuide}
            >
              <NanoBananaLogo tool="guide" size="sm" active={showGuide} />
            </button>
            <ToolHoverTooltip
              category={lang === "id" ? "PANDUAN" : "GUIDE"}
              title={lang === "id" ? "Panduan Aplikasi & Kit Media Sosial" : "App Guide & Social Media Kit"}
              placement="bottom"
              align="right"
            />
          </div>

          {/* Unified AI & System Settings Logo Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setSettingsInitialTab("gemini");
                setIsSettingsModalOpen(true);
                soundManager.playClick();
              }}
              className={`relative w-8 h-8 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                hasConnectedAI
                  ? "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-400/40"
                  : "bg-[#041115] hover:bg-teal-500/15 border-teal-400/25"
              }`}
              aria-label={lang === "id" ? "Pengaturan Aplikasi & AI" : "App & AI Settings"}
            >
              <NanoBananaLogo tool="settings" size="sm" />
              <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${hasConnectedAI ? "bg-emerald-400" : "bg-amber-400"}`} />
            </button>
            <ToolHoverTooltip
              category={lang === "id" ? "KONFIGURASI" : "SETTINGS"}
              title={lang === "id" ? "Pengaturan Sistem & API AI" : "System & AI API Settings"}
              badge={hasConnectedAI ? "AI ON" : "SETUP"}
              placement="bottom"
              align="right"
            />
          </div>
        </div>

        {/* Mobile-only compact interactive toolbar (Logo-Only + Hover Tooltip) */}
        <div className="flex md:hidden items-center gap-1.5 bg-[#071c22]/90 border border-teal-400/20 rounded-2xl p-1 shadow-inner">
          {/* UI Icon Studio (mobile) */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setIsNanoIconStudioOpen(true);
                soundManager.playClick();
              }}
              className="w-8 h-8 rounded-xl bg-teal-400/15 border border-teal-400/40 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              aria-label="Icon Studio"
            >
              <NanoBananaLogo tool="nano_studio" size="sm" />
            </button>
            <ToolHoverTooltip
              category="UI"
              title="Icon Studio"
              placement="bottom"
            />
          </div>

          {/* Squad Management (mobile) */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setIsSquadManagementOpen(true);
                soundManager.playClick();
              }}
              className="w-8 h-8 rounded-xl bg-[#041115] border border-teal-400/25 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              aria-label={lang === "id" ? "Manajemen Skuad & Urutan" : "Squad Management & Sorting"}
            >
              <NanoBananaLogo tool="squad" size="sm" />
            </button>
            <ToolHoverTooltip
              category="SKUAD"
              title={lang === "id" ? "Manajemen Skuad" : "Squad Manager"}
              placement="bottom"
            />
          </div>

          {/* Settings & AI */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setSettingsInitialTab("gemini");
                setIsSettingsModalOpen(true);
                soundManager.playClick();
              }}
              className="relative w-8 h-8 rounded-xl bg-[#041115] border border-teal-400/25 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              aria-label={lang === "id" ? "Pengaturan Kredensial AI" : "AI Credentials Settings"}
            >
              <NanoBananaLogo tool="settings" size="sm" />
              <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${hasConnectedAI ? "bg-emerald-400" : "bg-amber-400"}`} />
            </button>
            <ToolHoverTooltip
              category="PENGATURAN"
              title={lang === "id" ? "Pengaturan & AI" : "Settings & AI"}
              placement="bottom"
              align="right"
            />
          </div>

          {/* More Menu Toggle */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setShowMobileUtils(!showMobileUtils);
                soundManager.playClick();
              }}
              className={`w-8 h-8 rounded-xl border transition-all cursor-pointer flex items-center justify-center relative ${
                showMobileUtils
                  ? "bg-teal-400 text-slate-950 border-teal-300"
                  : "bg-[#041115] border-teal-400/25"
              }`}
              aria-expanded={showMobileUtils}
              aria-label={lang === "id" ? "Utilitas Tambahan" : "More Utilities Menu"}
            >
              <NanoBananaLogo tool="telemetry" size="sm" active={showMobileUtils} />
            </button>
            <ToolHoverTooltip
              category="MENU"
              title={lang === "id" ? "Menu Utilitas" : "Utilities Menu"}
              placement="bottom"
              align="right"
            />
          </div>
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
              {/* Left group: Translation indicators */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{lang === "id" ? "BAHASA:" : "LANGUAGE:"}</span>
                
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

      {/* Main viewport Workspace (Auto-adaptive for Mobile/Android & PC Desktop) */}
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="w-full flex-1 flex flex-col">
          {/* Core Content Grid / Tab Layout */}
          <main
            className={
              deviceMode === "android"
                ? "flex-1 w-full p-2.5 sm:p-4 flex flex-col min-h-[580px]"
                : "flex-1 max-w-7xl w-full mx-auto p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            }
          >
            {/* LEFT COLUMN PANEL: SQUAD SETTINGS */}
            {(deviceMode === "pc" || androidActiveTab === "squad") && (
              <div
                className={
                  deviceMode === "android"
                    ? "w-full max-w-2xl mx-auto flex flex-col gap-4 animate-fadeIn"
                    : "lg:col-span-3 flex flex-col gap-5 lg:overflow-y-auto lg:max-h-[85vh] pr-1 h-auto"
                }
              >
                {/* In Android Mode, add a prominent CTA to open the full Squad Management Sheet */}
                {deviceMode === "android" && (
                  <button
                    onClick={() => {
                      setIsSquadManagementOpen(true);
                      soundManager.playClick();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>{lang === "id" ? "Buka Pengelolaan Skuad (11 Starter & Cadangan)" : "Open Squad Management & Lineup"}</span>
                  </button>
                )}

                {/* Identity & Quick Club Hub Panel (Soft Sporty Tosca) */}
                <div className="relative rounded-2xl border border-teal-400/25 bg-[#071c22]/90 backdrop-blur-xl transition-all duration-200 overflow-hidden shadow-[0_12px_32px_rgba(3,12,16,0.5)] p-4 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-teal-400/15 pb-2.5">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wide flex items-center gap-2 select-none">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      <span>{t.clubIdentity}</span>
                    </h4>
                    <span className="text-[10px] font-mono text-teal-300 font-bold">
                      {players.filter((p) => p.isStarting).length} {lang === "id" ? "Starter" : "Starters"} • {players.filter((p) => !p.isStarting).length} {lang === "id" ? "Cadangan" : "Bench"}
                    </span>
                  </div>

                  {/* Club Name, Logo & Jersey Row */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <label className="text-[9.5px] font-bold text-teal-200/75 uppercase tracking-wider mb-1 block">
                        {t.mainTeamName}
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => handleUpdateTeamName(e.target.value)}
                        placeholder="Team A"
                        aria-label={t.clubIdentity}
                        className="w-full bg-[#041217] border border-teal-400/25 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-teal-400 transition-all font-bold tracking-wide"
                      />
                    </div>

                    {/* Upload Logo */}
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[9px] font-bold text-teal-200/70 uppercase mb-1">Logo</span>
                      {teamLogo ? (
                        <div className="relative w-9 h-9 bg-[#041217] border border-teal-400/30 rounded-xl overflow-hidden flex items-center justify-center group/logo-view">
                          <img src={teamLogo} className="w-full h-full object-contain p-1" alt="Team Logo" />
                          <button
                            type="button"
                            onClick={() => setTeamLogo(null)}
                            className="absolute inset-0 bg-rose-950/90 opacity-0 group-hover/logo-view:opacity-100 flex items-center justify-center transition-all text-rose-300 font-bold text-xs cursor-pointer"
                            aria-label="Remove Team Logo"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label
                          title={t.chooseLogo}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#041217] hover:bg-[#08222a] border-teal-400/25 hover:border-teal-400/50 text-teal-300 hover:text-white active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
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

                    {/* Upload Jersey */}
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[9px] font-bold text-teal-200/70 uppercase mb-1">Jersey</span>
                      {teamJersey ? (
                        <div className="relative w-9 h-9 bg-[#041217] border border-teal-400/30 rounded-xl overflow-hidden flex items-center justify-center group/jersey-view">
                          <img src={teamJersey} className="w-full h-full object-contain p-1" alt="Team Jersey" />
                          <button
                            type="button"
                            onClick={() => handleUpdateTeamJersey(null)}
                            className="absolute inset-0 bg-rose-950/90 opacity-0 group-hover/jersey-view:opacity-100 flex items-center justify-center transition-all text-rose-300 font-bold text-xs cursor-pointer"
                            aria-label="Remove Team Jersey"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label
                          title={t.chooseJersey}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#041217] hover:bg-[#08222a] border-teal-400/25 hover:border-teal-400/50 text-emerald-300 hover:text-white active:scale-95"
                        >
                          <Shirt className="w-3.5 h-3.5" aria-hidden="true" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    handleUpdateTeamJersey(event.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="sr-only"
                            aria-label={t.chooseJersey}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Manager Profile Row */}
                  <div className="flex items-end gap-2 pt-2 border-t border-teal-400/15">
                    <div className="flex-1">
                      <label className="text-[9.5px] font-bold text-teal-200/75 uppercase tracking-wider mb-1 block">
                        {t.managerProfile}
                      </label>
                      <input
                        type="text"
                        value={managerName}
                        onChange={(e) => handleUpdateManagerName(e.target.value)}
                        placeholder="COACH"
                        aria-label={t.managerName}
                        className="w-full bg-[#041217] border border-teal-400/25 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-teal-400 transition-all font-bold tracking-wide font-mono"
                      />
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[9px] font-bold text-teal-200/70 uppercase mb-1">
                        {lang === "id" ? "Foto" : "Photo"}
                      </span>
                      {managerPhoto ? (
                        <div className="relative w-9 h-9 bg-[#041217] border border-teal-400/30 rounded-xl overflow-hidden flex items-center justify-center group/photo-view">
                          <img src={managerPhoto} className="w-full h-full object-cover" alt="Manager" />
                          <button
                            type="button"
                            onClick={() => handleUpdateManagerPhoto(null)}
                            className="absolute inset-0 bg-rose-950/90 opacity-0 group-hover/photo-view:opacity-100 flex items-center justify-center transition-all text-rose-300 font-bold text-xs cursor-pointer"
                            aria-label={t.deletePhoto}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label
                          title={t.uploadPhoto}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#041217] hover:bg-[#08222a] border-teal-400/25 hover:border-teal-400/50 text-teal-200 hover:text-white active:scale-95"
                        >
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

                  {/* Quick Club Actions Row (Logo-Only with Hover Tooltips Above) */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSquadManagementOpen(true);
                          soundManager.playClick();
                        }}
                        aria-label={lang === "id" ? "Kelola Skuad" : "Manage Squad"}
                        className="w-full h-10 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        <NanoBananaLogo tool="squad" size="md" />
                      </button>
                      <ToolHoverTooltip
                        category={lang === "id" ? "MANAJEMEN TIM" : "TEAM ROSTER"}
                        title={lang === "id" ? "Kelola Skuad & Urutkan" : "Manage & Sort Squad"}
                        align="left"
                      />
                    </div>

                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFormationStudioModalOpen(true);
                          soundManager.playClick();
                        }}
                        aria-label={lang === "id" ? "Studio Formasi" : "Formation Studio"}
                        className="w-full h-10 rounded-xl bg-[#041217] hover:bg-teal-500/15 border border-teal-400/25 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        <NanoBananaLogo tool="studio" size="md" />
                      </button>
                      <ToolHoverTooltip
                        category={lang === "id" ? "STUDIO TAKTIS" : "TACTICAL STUDIO"}
                        title={lang === "id" ? "Studio Formasi & Lini" : "Formation & Line Studio"}
                      />
                    </div>

                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setPitchZoneMode((prev) => (prev === "poster" ? "pitch" : "poster"));
                          if (deviceMode === "android") {
                            setAndroidActiveTab("pitch");
                          }
                          soundManager.playClick();
                        }}
                        aria-label={lang === "id" ? "Switch ke Studio Poster HD di Zona Lapangan" : "Switch to HD Poster Studio in Pitch Zone"}
                        className={`w-full h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                          pitchZoneMode === "poster"
                            ? "bg-teal-400 text-slate-950 border-teal-300 shadow-sm"
                            : "bg-[#041217] hover:bg-teal-500/15 border-teal-400/25"
                        }`}
                      >
                        <NanoBananaLogo tool="poster" size="md" active={pitchZoneMode === "poster"} />
                      </button>
                      <ToolHoverTooltip
                        category="ZONA LAPANGAN"
                        title={
                          pitchZoneMode === "poster"
                            ? lang === "id"
                              ? "Kembali ke Lapangan Taktis"
                              : "Switch to Tactical Pitch"
                            : lang === "id"
                            ? "Switch ke Studio Poster HD"
                            : "Switch to HD Poster Studio"
                        }
                      />
                    </div>

                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setTvModeOpen(true);
                          soundManager.playClick();
                        }}
                        aria-label={lang === "id" ? "Layar Siaran TV" : "TV Broadcast"}
                        className="w-full h-10 rounded-xl bg-[#041217] hover:bg-teal-500/15 border border-teal-400/25 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        <NanoBananaLogo tool="tv" size="md" />
                      </button>
                      <ToolHoverTooltip
                        category={lang === "id" ? "SIARAN LANGSUNG" : "TV BROADCAST"}
                        title={lang === "id" ? "Presentasi Layar Siaran TV" : "TV Broadcast Lineup Screen"}
                        align="right"
                      />
                    </div>
                  </div>
                </div>

                {/* Integrated Studio Formasi & Tactical Line Adjuster Panel in Left Column */}
                {renderAIImageGen()}
              </div>
            )}

        {/* MIDDLE COLUMN WORKSPACE: PFP PITCH & MATCH STATE TITLE OVERGAMES */}
        {(deviceMode === "pc" || androidActiveTab === "pitch") && (
          <div
            className={
              deviceMode === "android"
                ? "w-full flex flex-col gap-4 items-center animate-fadeIn"
                : "lg:col-span-6 flex flex-col gap-4 items-center h-full"
            }
          >

          {/* DIGITAL FIELD SCREEN WITH VERTICAL BALL AND CONE CONTROLS */}
          <div className={`w-full flex transition-all duration-300 ${
            isPitchFullscreen 
              ? "fixed inset-0 z-[120] bg-[#07080a] flex-row gap-4 items-center justify-center p-4 md:p-8 overflow-hidden animate-fadeIn"
              : "flex-row gap-2.5 sm:gap-4 items-start justify-center relative"
          }`}>
            <div className={`flex-1 min-w-0 w-full relative group/pitch transition-all duration-300 flex flex-col items-center ${
              isPitchFullscreen 
                ? "h-full max-h-[96vh] max-w-none justify-center gap-2 overflow-y-auto" 
                : "max-w-[580px]"
            }`}>
              {/* BAR KONTROL ATAS LUAR LAPANGAN (EXTERNAL TOP PITCH CONTROL BAR & TELEMETRY HUD) */}
              <div className="w-full flex flex-col items-center gap-2 mb-2">
                {/* Top Bar: Theme Selector (Left) | Club Identity & Live Status (Center) | Fullscreen & Reset (Right) */}
                <div
                  id="pitch-top-control-bar"
                  role="toolbar"
                  aria-label={lang === "id" ? "Bar kontrol atas luar lapangan" : "Top pitch control bar"}
                  className={`relative w-full max-w-[580px] bg-[#071c22]/95 border border-teal-400/25 rounded-2xl px-2.5 sm:px-3.5 py-2 flex items-center justify-between gap-2 shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
                    showThemeDropdown ? "z-[110]" : "z-45"
                  }`}
                >
                  {/* Left: Pitch Board Theme Selector + Nano Banana Icon Studio (Logo-Only + Hover Tooltip Above) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="relative flex items-center group shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                        className="w-9 h-9 bg-[#06151a]/90 hover:bg-[#09222a] text-teal-100 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-md border border-teal-400/30 hover:border-teal-400/60 cursor-pointer select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
                        aria-label={lang === "id" ? "Pilih Tema Lapangan" : "Choose Pitch Theme"}
                        aria-haspopup="true"
                        aria-expanded={showThemeDropdown}
                      >
                        <NanoBananaLogo tool="theme" size="md" active={showThemeDropdown} />
                      </button>

                      {!showThemeDropdown && (
                        <ToolHoverTooltip
                          category={lang === "id" ? "TEMA RUMPUT" : "PITCH THEME"}
                          title={lang === "id" ? "Ubah Tema Visual Lapangan" : "Change Pitch Visual Theme"}
                          align="left"
                        />
                      )}

                      {showThemeDropdown && (
                        <div className="absolute left-0 top-full mt-1.5 w-52 sm:w-56 bg-[#06181e]/98 border border-teal-400/35 rounded-2xl shadow-2xl z-[120] overflow-hidden flex flex-col gap-0.5 p-1.5 animate-fadeIn backdrop-blur-2xl max-h-64 overflow-y-auto" role="menu">
                          {[
                            { key: "sporty-tosca", label: lang === "id" ? "Toska Lembut Sporty" : "Soft Sporty Tosca", icon: "🌊" },
                            { key: "emerald-grass", label: lang === "id" ? "Padang Hijau" : "Classic Grass", icon: "🌿" },
                            { key: "premier-pitch", label: lang === "id" ? "Stadion Premier" : "Premier Pitch", icon: "🏟️" },
                            { key: "neon-hologram", label: lang === "id" ? "Hologram Cyber" : "Neon Hologram", icon: "⚡" },
                            { key: "dark-slate", label: lang === "id" ? "Taktis Gelap" : "Dark Slate", icon: "📓" },
                            { key: "tactical-board", label: lang === "id" ? "Papan Chalkboard" : "Tactical Board", icon: "📋" },
                            { key: "midnight-ice", label: lang === "id" ? "Frost Es Dingin" : "Midnight Ice", icon: "❄️" },
                            { key: "aurora-stadium", label: lang === "id" ? "Stadion Aurora" : "Aurora Stadium", icon: "🌌" },
                            { key: "sunset-arena", label: lang === "id" ? "Sunset Senja Emas" : "Golden Sunset", icon: "🌅" }
                          ].map((th) => {
                            const isActive = pitchTheme === th.key;
                            return (
                              <button
                                key={th.key}
                                type="button"
                                onClick={() => {
                                  setPitchTheme(th.key as PitchTheme);
                                  setShowThemeDropdown(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none ${
                                  isActive
                                    ? "bg-teal-500/25 border border-teal-400/40 text-teal-200"
                                    : "bg-transparent border border-transparent text-teal-100/70 hover:bg-white/5 hover:text-white"
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

                    {/* UI Icon Studio Trigger */}
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNanoIconStudioOpen(true);
                          soundManager.playClick();
                        }}
                        className="w-9 h-9 bg-[#06151a]/90 hover:bg-teal-500/20 rounded-xl transition-all flex items-center justify-center shadow-md border border-teal-400/35 hover:border-teal-400/70 cursor-pointer active:scale-95"
                        aria-label="Icon Studio"
                      >
                        <NanoBananaLogo tool="nano_studio" size="md" />
                      </button>
                      <ToolHoverTooltip
                        category="UI"
                        title="Icon Studio"
                        align="left"
                      />
                    </div>

                    {/* SWITCH TOGGLE ZONA LAPANGAN: LAPANGAN TAKTIS <-> STUDIO POSTER HD */}
                    <div
                      role="group"
                      aria-label={lang === "id" ? "Switch Mode Zona Lapangan" : "Pitch Zone Mode Switch"}
                      className="flex items-center bg-[#041014] p-0.5 rounded-xl border border-teal-400/30 shadow-inner"
                    >
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            setPitchZoneMode("pitch");
                            soundManager.playClick();
                          }}
                          aria-pressed={pitchZoneMode === "pitch"}
                          className={`h-8 px-2.5 rounded-lg text-[10.5px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                            pitchZoneMode === "pitch"
                              ? "bg-teal-400 text-slate-950 shadow-sm"
                              : "text-teal-100/70 hover:text-white"
                          }`}
                        >
                          <NanoBananaLogo tool="formation" size="sm" active={pitchZoneMode === "pitch"} />
                          <span>{lang === "id" ? "Lapangan" : "Pitch"}</span>
                        </button>
                        <ToolHoverTooltip
                          category={lang === "id" ? "ZONA UTAMA" : "MAIN STAGE"}
                          title={lang === "id" ? "Mode Papan Lapangan Taktis" : "Interactive Tactical Pitch"}
                          badge={pitchZoneMode === "pitch" ? "AKTIF" : undefined}
                          align="left"
                        />
                      </div>

                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            setPitchZoneMode("poster");
                            soundManager.playClick();
                          }}
                          aria-pressed={pitchZoneMode === "poster"}
                          className={`h-8 px-2.5 rounded-lg text-[10.5px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                            pitchZoneMode === "poster"
                              ? "bg-teal-400 text-slate-950 shadow-sm"
                              : "text-teal-100/70 hover:text-white"
                          }`}
                        >
                          <NanoBananaLogo tool="poster" size="sm" active={pitchZoneMode === "poster"} />
                          <span>{lang === "id" ? "Poster HD" : "Poster HD"}</span>
                        </button>
                        <ToolHoverTooltip
                          category={lang === "id" ? "ZONA UTAMA" : "MAIN STAGE"}
                          title={lang === "id" ? "Mode Studio Poster Lineup HD" : "Full-Size HD Lineup Poster Studio"}
                          badge={pitchZoneMode === "poster" ? "AKTIF" : undefined}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Center: Interactive Club Identity & Manager Trigger */}
                  <div className="relative group flex items-center min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowClubIdentityBar(!showClubIdentityBar);
                        soundManager.playClick();
                      }}
                      className={`flex items-center gap-2 min-w-0 overflow-hidden px-2.5 py-1 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                        showClubIdentityBar
                          ? "bg-teal-500/20 border-teal-400/50 text-white"
                          : "bg-[#041217]/80 hover:bg-[#08222b] border-teal-400/25 text-white"
                      }`}
                      aria-expanded={showClubIdentityBar}
                      aria-label={lang === "id" ? "Edit Nama Tim, Logo & Manajer" : "Edit Team Name, Logo & Manager"}
                    >
                      <div className="flex items-center gap-1.5 border-r border-teal-400/20 pr-2 min-w-0">
                        {teamLogo ? (
                          <img
                            src={teamLogo}
                            className="w-4.5 h-4.5 object-contain bg-black/40 p-0.5 rounded-md border border-white/10 shrink-0"
                            alt={lang === "id" ? "Logo Tim" : "Team Logo"}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="w-2.5 h-2.5 rounded-full border border-black/45 shadow-inner shrink-0"
                            style={{ backgroundColor: primaryColor }}
                          />
                        )}
                        <span className="font-extrabold tracking-wider text-white text-[10.5px] sm:text-[11px] uppercase truncate max-w-[90px] sm:max-w-[115px]">
                          {teamName || "Team A"}
                        </span>
                      </div>

                      <div className="hidden xs:flex items-center gap-1.5 shrink-0">
                        <span className="text-[9.5px] text-teal-200 font-bold truncate max-w-[75px]">
                          👔 {managerName || "COACH"}
                        </span>
                        <span className="text-[9.5px] text-teal-200 font-extrabold tracking-wider bg-teal-500/15 px-1.5 py-0.5 rounded-md border border-teal-400/25 font-mono tabular-nums uppercase">
                          {formation}
                        </span>
                      </div>
                    </button>
                    <ToolHoverTooltip
                      category={lang === "id" ? "IDENTITAS TIM & MANAJER" : "CLUB & MANAGER"}
                      title={
                        showClubIdentityBar
                          ? lang === "id"
                            ? "Sembunyikan Bar Nama Tim, Logo & Manajer"
                            : "Hide Team Name, Logo & Manager Bar"
                          : lang === "id"
                          ? "Tampilkan Input Nama Tim, Logo & Manajer"
                          : "Show Team Name, Logo & Manager Inputs"
                      }
                    />
                  </div>

                  {/* Right: Fullscreen & Reset Board Logo-Only Buttons (Hover reveals text above) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => setIsPitchFullscreen(!isPitchFullscreen)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#06151a]/90 hover:bg-[#09222a] active:scale-95 ${
                          isPitchFullscreen
                            ? "border-teal-400/60 bg-teal-400 text-slate-950"
                            : "border-teal-400/30 hover:border-teal-400/60"
                        }`}
                        aria-label={lang === "id" ? "Mode Layar Penuh" : "Fullscreen Presentation Mode"}
                      >
                        <NanoBananaLogo
                          tool={isPitchFullscreen ? "exit_fullscreen" : "fullscreen"}
                          size="md"
                          active={isPitchFullscreen}
                        />
                      </button>
                      <ToolHoverTooltip
                        category={lang === "id" ? "TAMPILAN" : "VIEWPORT"}
                        title={
                          isPitchFullscreen
                            ? lang === "id"
                              ? "Keluar Layar Penuh"
                              : "Exit Fullscreen"
                            : lang === "id"
                            ? "Mode Layar Penuh"
                            : "Fullscreen Mode"
                        }
                        align="right"
                      />
                    </div>

                    {showResetConfirm ? (
                      <div className="flex items-center gap-1 bg-[#06151a] px-2 py-1 rounded-xl border border-rose-500/45 shadow-xl text-[9px] whitespace-nowrap">
                        <span className="text-rose-300 font-extrabold uppercase">{lang === "id" ? "Reset?" : "Reset?"}</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateTeamName("Team A");
                            handleUpdateManagerName("Coach");
                            setFormation("4-3-3");
                            setPlayers(DEFAULT_PLAYERS);
                            setItems(DEFAULT_ITEMS);
                            setPrimaryColor("#dc2626");
                            setGkColor("#eab308");
                            setNumberColor("#ffffff");
                            setActiveTool("select");
                            setBrushColor("#ffffff");
                            setBrushSize(4);
                            setBrushStyle("solid");
                            setCustomBackgroundUrl(null);
                            setPitchTheme("sporty-tosca");
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
                          className="px-1.5 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black uppercase cursor-pointer"
                        >
                          {t.yes}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="px-1.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 font-bold uppercase cursor-pointer"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    ) : (
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(true)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#06151a]/90 hover:bg-rose-950/50 border-teal-400/30 hover:border-rose-500/50 active:scale-95"
                          aria-label={lang === "id" ? "Atur Ulang Papan" : "Reset Board"}
                        >
                          <NanoBananaLogo tool="reset" size="md" danger={true} />
                        </button>
                        <ToolHoverTooltip
                          category={lang === "id" ? "ATUR ULANG" : "RESET BOARD"}
                          title={lang === "id" ? "Reset Papan Taktik ke Awal" : "Reset Tactical Board"}
                          align="right"
                        />
                      </div>
                    )}
                  </div>
                </div>

                  {/* DIRECT TOOLS BAR FOR TEAM NAME, TEAM LOGO, AND MANAGER PROFILE ABOVE THE PITCH */}
                  {!isPitchFullscreen && showClubIdentityBar && (
                    <div
                      id="pitch-club-identity-bar"
                      className="w-full max-w-[580px] bg-[#071c22]/95 border border-teal-400/25 rounded-2xl px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 animate-fadeIn z-40"
                    >
                      {/* Team Logo + Team Name Input */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative group shrink-0">
                          {teamLogo ? (
                            <div className="relative w-9 h-9 bg-[#041217] border border-teal-400/35 rounded-xl overflow-hidden flex items-center justify-center group/logo-top">
                              <img src={teamLogo} className="w-full h-full object-contain p-1" alt="Team Logo" />
                              <button
                                type="button"
                                onClick={() => setTeamLogo(null)}
                                className="absolute inset-0 bg-rose-950/90 opacity-0 group-hover/logo-top:opacity-100 flex items-center justify-center transition-all text-rose-300 font-bold text-xs cursor-pointer"
                                aria-label="Hapus Logo Tim"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#041217] hover:bg-[#08222a] border-teal-400/30 hover:border-teal-400/60 text-teal-300 hover:text-white active:scale-95">
                              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
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
                          <ToolHoverTooltip
                            category={lang === "id" ? "LOGO TIM" : "TEAM LOGO"}
                            title={teamLogo ? (lang === "id" ? "Klik ✕ untuk Hapus Logo Tim" : "Remove Team Logo") : (lang === "id" ? "Unggah Logo Tim" : "Upload Team Logo")}
                            align="left"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <label className="text-[8.5px] font-extrabold text-teal-300/80 uppercase tracking-wider block mb-0.5">
                            {lang === "id" ? "Nama Tim" : "Team Name"}
                          </label>
                          <input
                            type="text"
                            value={teamName}
                            onChange={(e) => handleUpdateTeamName(e.target.value)}
                            placeholder={lang === "id" ? "Masukkan Nama Tim..." : "Enter Team Name..."}
                            aria-label={t.mainTeamName}
                            className="w-full bg-[#041217] border border-teal-400/25 focus:border-teal-400 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold uppercase tracking-wide focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="hidden sm:block w-px h-8 bg-teal-400/15 shrink-0" />

                      {/* Manager Photo + Manager Name Input */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative group shrink-0">
                          {managerPhoto ? (
                            <div className="relative w-9 h-9 bg-[#041217] border border-teal-400/35 rounded-xl overflow-hidden flex items-center justify-center group/mgr-top">
                              <img src={managerPhoto} className="w-full h-full object-cover" alt="Manager" />
                              <button
                                type="button"
                                onClick={() => handleUpdateManagerPhoto(null)}
                                className="absolute inset-0 bg-rose-950/90 opacity-0 group-hover/mgr-top:opacity-100 flex items-center justify-center transition-all text-rose-300 font-bold text-xs cursor-pointer"
                                aria-label="Hapus Foto Manajer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#041217] hover:bg-[#08222a] border-teal-400/30 hover:border-teal-400/60 text-teal-200 hover:text-white active:scale-95">
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
                          <ToolHoverTooltip
                            category={lang === "id" ? "FOTO MANAJER" : "MANAGER PHOTO"}
                            title={managerPhoto ? (lang === "id" ? "Klik ✕ untuk Hapus Foto Manajer" : "Remove Manager Photo") : (lang === "id" ? "Unggah Foto Manajer / Pelatih" : "Upload Manager Photo")}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <label className="text-[8.5px] font-extrabold text-teal-300/80 uppercase tracking-wider block mb-0.5">
                            {lang === "id" ? "Manajer / Pelatih Tim" : "Team Manager / Coach"}
                          </label>
                          <input
                            type="text"
                            value={managerName}
                            onChange={(e) => handleUpdateManagerName(e.target.value)}
                            placeholder={lang === "id" ? "Nama Manajer / Pelatih..." : "Manager / Coach Name..."}
                            aria-label={t.managerName}
                            className="w-full bg-[#041217] border border-teal-400/25 focus:border-teal-400 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold uppercase tracking-wide font-mono focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isPitchFullscreen && pitchZoneMode === "pitch" && (
                    <TacticalTelemetryHUD
                      players={players}
                      items={items}
                      sportMode={sportMode}
                      formation={formation}
                      opponentFormation={opponentFormation}
                      tacticalOverlay={tacticalOverlay}
                      onSetTacticalOverlay={(mode) => {
                        setTacticalOverlay(mode);
                        if (mode === "18-zones") setShowTacticalGrid(true);
                        else setShowTacticalGrid(false);
                      }}
                      tacticalPhase={tacticalPhase}
                      onSetTacticalPhase={setTacticalPhase}
                      isMeasureMode={isMeasureMode}
                      onToggleMeasureMode={() => setIsMeasureMode(!isMeasureMode)}
                      onOpenMatchSheet={() => setIsMatchSheetOpen(true)}
                      onOpenCornerStudio={() => {
                        if (deviceMode === "android") {
                          setAndroidActiveTab("corner");
                        } else {
                          setPcRightTab("corner");
                          handleQuickCornerKick("left", "inswing-near");
                        }
                        soundManager.playClick();
                      }}
                      onQuickCornerKick={(side, routine) => {
                        handleQuickCornerKick(side, routine);
                      }}
                      hasMultiFrames={frames.length > 1}
                      onResetFrames={handleResetFrames}
                      lang={lang}
                    />
                  )}
                </div>

              {pitchZoneMode === "poster" ? (
                <div className="w-full max-w-[580px]">
                  {renderAIImageGen("poster-stage")}
                </div>
              ) : (
              <Pitch
                players={players}
                items={items}
                primaryColor={primaryColor}
                gkColor={gkColor}
                numberColor={numberColor}
                enemyColor={enemyColor}
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
                onAddTacticalItem={handleAddTacticalItem}
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
                tacticalOverlay={tacticalOverlay}
                isMeasureMode={isMeasureMode}
                showHeatmap={showHeatmap}
                lang={lang}
                sportMode={sportMode}
                isDrawLocked={isDrawLocked}
                activeSketchLayer={activeSketchLayer}
                visibleSketchLayers={visibleSketchLayers}
                sketchLayerOrder={sketchLayerOrder}
                onChangeActiveLayer={setActiveSketchLayer}
                onChangeVisibleLayers={setVisibleSketchLayers}
                onChangeLayerOrder={setSketchLayerOrder}
                onChangeTool={setActiveTool}
                setBrushColor={setBrushColor}
                setBrushSize={setBrushSize}
                setBrushStyle={setBrushStyle}
                managerName={managerName}
                managerPhoto={managerPhoto}
                isFullscreen={isPitchFullscreen}
                onToggleFullscreen={() => setIsPitchFullscreen(!isPitchFullscreen)}
                onSortPlayers={handleSortPlayers}
                bottomControls={
                  <div
                    id="pitch-bottom-control-bar"
                    role="toolbar"
                    aria-label={lang === "id" ? "Bar kontrol bawah luar lapangan" : "Bottom pitch control bar"}
                    className={`relative w-full bg-[#071c22]/95 border border-teal-400/25 rounded-2xl px-2.5 sm:px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
                      showFormationMenu || showSportOverlay || showEnemyDropdown ? "z-[110]" : "z-45"
                    }`}
                  >
                    {/* Left Group: Formation Selector, Studio Formasi Trigger, & Match Sport Mode Rules (Logo-Only + Hover Tooltip Above) */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Formation Selector Logo Button */}
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            setShowFormationMenu(!showFormationMenu);
                            setShowSportOverlay(false);
                            setShowEnemyDropdown(false);
                          }}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none ${
                            showFormationMenu
                              ? "bg-teal-400 text-slate-950 border-teal-300"
                              : "bg-[#06151a]/90 hover:bg-[#09222a] border-teal-400/35 hover:border-teal-400/65"
                          }`}
                          aria-label={t.defaultFormation}
                          aria-haspopup="true"
                          aria-expanded={showFormationMenu}
                        >
                          <NanoBananaLogo tool="formation" size="md" active={showFormationMenu} />
                        </button>

                        {!showFormationMenu && (
                          <ToolHoverTooltip
                            category={lang === "id" ? "FORMASI TIM" : "TEAM FORMATION"}
                            title={lang === "id" ? "Pilih Template Formasi" : "Select Formation Template"}
                            badge={formation}
                            align="left"
                          />
                        )}

                        {showFormationMenu && (
                          <div
                            className="absolute bottom-full mb-2 left-0 w-60 bg-[#06181f]/98 backdrop-blur-2xl border border-teal-400/35 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[120] overflow-hidden flex flex-col divide-y divide-teal-400/15 animate-fadeIn"
                            role="menu"
                          >
                            <div className="px-3.5 py-2.5 bg-teal-500/15 flex justify-between items-center select-none">
                              <span className="text-[10px] font-extrabold tracking-wider text-teal-200 uppercase">
                                {lang === "id" ? "Pilih Formasi" : "Select Formation"}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowFormationMenu(false);
                                  setIsFormationStudioModalOpen(true);
                                }}
                                className="text-[10px] text-teal-300 hover:text-white font-bold underline cursor-pointer"
                              >
                                {lang === "id" ? "Buka Studio" : "Open Studio"}
                              </button>
                            </div>

                            <div className="max-h-60 overflow-y-auto scrollbar-thin">
                              {customFormations.length > 0 && (
                                <div className="p-1.5 border-b border-teal-400/15 bg-[#041014]/60">
                                  <span className="px-2 py-0.5 text-[9px] font-bold text-teal-300 uppercase block">
                                    {lang === "id" ? "Formasi Kustom Anda" : "Your Custom Formations"}
                                  </span>
                                  {customFormations.map((cf) => (
                                    <button
                                      key={cf.id}
                                      type="button"
                                      onClick={() => {
                                        handleApplyCustomFormation(cf);
                                        setShowFormationMenu(false);
                                      }}
                                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between hover:bg-teal-500/15 transition-colors cursor-pointer text-xs ${
                                        formation === cf.name ? "bg-teal-500/25 text-teal-200 font-bold" : "text-teal-100/80"
                                      }`}
                                    >
                                      <span className="truncate font-bold">★ {cf.name}</span>
                                      <span className="text-[9px] font-mono text-teal-300/80 uppercase">{cf.sportMode}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {getAvailableFormationsForSport(sportMode).map((item) => {
                                const isSel = formation === item.key;
                                return (
                                  <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => {
                                      applyPresetFormation(item.key);
                                      setShowFormationMenu(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-teal-500/15 active:bg-teal-500/25 transition-colors cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none ${
                                      isSel ? "bg-teal-500/25 text-teal-200 font-extrabold" : "text-gray-200"
                                    }`}
                                    role="menuitem"
                                    aria-label={item.key}
                                    aria-current={isSel ? "true" : "false"}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-xs">{item.icon}</span>
                                      <div className="flex flex-col">
                                        <span className="font-extrabold tracking-wide font-mono tabular-nums text-xs">
                                          {item.key}
                                        </span>
                                        <span className="text-[9.5px] text-teal-200/65 font-medium leading-tight">
                                          {item.desc}
                                        </span>
                                      </div>
                                    </div>
                                    {isSel && (
                                      <span className="text-[9px] text-teal-300 font-bold">
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

                      {/* Studio Formasi Trigger (Pure Logo-Only + Hover Tooltip Above) */}
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormationStudioModalOpen(true);
                            setShowFormationMenu(false);
                            soundManager.playClick();
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-teal-500/20 hover:bg-teal-500/35 border-teal-400/45 shadow-md active:scale-95"
                          aria-label={lang === "id" ? "Buka Studio Formasi & Lini" : "Open Formation Studio"}
                        >
                          <NanoBananaLogo tool="studio" size="md" />
                        </button>
                        <ToolHoverTooltip
                          category={lang === "id" ? "STUDIO TAKTIS" : "FORMATION STUDIO"}
                          title={lang === "id" ? "Studio Formasi & Lini" : "Formation & Line Studio"}
                        />
                      </div>

                      {/* Switch to Poster HD Studio in Pitch Zone (Pure Logo-Only + Hover Tooltip Above) */}
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            setPitchZoneMode("poster");
                            setShowFormationMenu(false);
                            soundManager.playClick();
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#06151a]/90 hover:bg-[#09222a] border-teal-400/35 hover:border-teal-400/65 shadow-md active:scale-95"
                          aria-label={lang === "id" ? "Switch ke Studio Poster HD" : "Switch to HD Poster Studio"}
                        >
                          <NanoBananaLogo tool="poster" size="md" />
                        </button>
                        <ToolHoverTooltip
                          category="POSTER HD"
                          title={lang === "id" ? "Switch ke Studio Poster HD" : "Switch to HD Poster Studio"}
                        />
                      </div>

                      {/* Match Sport Mode ("Aturan Tanding") Selector (Pure Logo-Only + Hover Tooltip Above) */}
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSportOverlay(!showSportOverlay);
                            setShowFormationMenu(false);
                            setShowEnemyDropdown(false);
                          }}
                          className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center shadow-md border cursor-pointer select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none ${
                            showSportOverlay
                              ? "bg-teal-400 text-slate-950 border-teal-300"
                              : "bg-[#06151a]/90 hover:bg-[#09222a] border-teal-400/30 hover:border-teal-400/60"
                          }`}
                          aria-label={lang === "id" ? "Ubah Aturan Tanding" : "Change Match Sport Mode"}
                          aria-haspopup="true"
                          aria-expanded={showSportOverlay}
                        >
                          <NanoBananaLogo tool="rules" size="md" active={showSportOverlay} />
                        </button>

                        {!showSportOverlay && (
                          <ToolHoverTooltip
                            category={lang === "id" ? "ATURAN TANDING" : "MATCH RULES"}
                            title={lang === "id" ? "Pilih Format Jumlah Pemain" : "Select Match Player Format"}
                            badge={
                              sportMode === "soccer"
                                ? "11v11"
                                : sportMode === "minisoccer"
                                ? "7v7"
                                : sportMode === "futsal"
                                ? "5v5"
                                : `${getSportModeLimit()}P`
                            }
                          />
                        )}

                        {showSportOverlay && (
                          <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#06181f]/98 border border-teal-400/35 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[120] p-3 flex flex-col gap-2.5 animate-fadeIn backdrop-blur-2xl">
                            <div className="flex items-center justify-between border-b border-teal-400/20 pb-2">
                              <div className="flex flex-col">
                                <span className="text-[9.5px] font-black tracking-wider text-teal-300 uppercase select-none">
                                  {lang === "id" ? "Aturan Tanding" : "Sport Arena Rules"}
                                </span>
                                <span className="text-[11px] font-extrabold text-white">
                                  {lang === "id" ? "Pilih Arena/Mode Baru" : "Choose Pitch Arena"}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowSportOverlay(false)}
                                className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-white/10 cursor-pointer text-gray-400 hover:text-white transition-colors"
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
                                  activeColor: "bg-teal-500/20 text-teal-200 border-teal-400/50"
                                },
                                {
                                  key: "minisoccer",
                                  label: lang === "id" ? "Mini Soccer (7 vs 7)" : "Mini Soccer (7 vs 7)",
                                  desc: lang === "id" ? "Taktik lapangan sedang & lincah" : "Medium turf and dynamic tactics",
                                  icon: "👟",
                                  activeColor: "bg-cyan-500/20 text-cyan-200 border-cyan-400/50"
                                },
                                {
                                  key: "futsal",
                                  label: lang === "id" ? "Futsal (5 vs 5)" : "Futsal (5 vs 5)",
                                  desc: lang === "id" ? "Sirkuit dalam ruangan cepat & presisi" : "High precision fast indoor game",
                                  icon: "💨",
                                  activeColor: "bg-amber-500/20 text-amber-200 border-amber-400/50"
                                },
                                {
                                  key: "custom",
                                  label: lang === "id" ? "Kustom Manual (1 - 11)" : "Custom Count (1 - 11)",
                                  desc: lang === "id" ? "Atur jumlah pemain secara bebas" : "Freely set any player capacity",
                                  icon: "🛠️",
                                  activeColor: "bg-indigo-500/20 text-indigo-200 border-indigo-400/50"
                                }
                              ].map((modeItem) => {
                                const isActive = sportMode === modeItem.key;
                                return (
                                  <div key={modeItem.key} className="flex flex-col gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSetSportMode(modeItem.key as any);
                                        if (modeItem.key !== "custom") {
                                          setShowSportOverlay(false);
                                        }
                                      }}
                                      className={`w-full text-left p-2 rounded-xl border text-[11px] cursor-pointer flex items-center gap-2.5 transition-all duration-200 ${
                                        isActive ? modeItem.activeColor : "bg-black/35 border-white/5 hover:border-white/15 text-gray-300"
                                      }`}
                                    >
                                      <span className="text-base bg-white/5 w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 border border-white/5">
                                        {modeItem.icon}
                                      </span>
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-extrabold tracking-wide uppercase text-[9.5px] leading-tight">
                                          {modeItem.label}
                                        </span>
                                        <span className="text-[8px] text-teal-100/60 font-medium leading-tight mt-0.5 truncate select-none">
                                          {modeItem.desc}
                                        </span>
                                      </div>
                                    </button>

                                    {modeItem.key === "custom" && isActive && (
                                      <div className="px-2 py-1.5 bg-black/45 rounded-xl border border-white/[0.06] mt-0.5 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-gray-400">
                                            {lang === "id" ? "JUMLAH PEMAIN" : "PLAYER COUNT"}
                                          </span>
                                          <span className="text-[10px] font-black text-teal-300 bg-teal-500/15 border border-teal-400/30 px-1.5 py-0.5 rounded">
                                            {customCount} {lang === "id" ? "Pemain" : "Players"}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            disabled={customCount <= 1}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (customCount > 1) {
                                                handleSetSportMode("custom", customCount - 1);
                                              }
                                            }}
                                            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 font-bold text-center border border-white/10 active:scale-95 transition-all text-xs text-white disabled:opacity-25 cursor-pointer"
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
                                            className="flex-1 accent-teal-400 h-1 rounded bg-white/10"
                                          />

                                          <button
                                            type="button"
                                            disabled={customCount >= 11}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (customCount < 11) {
                                                handleSetSportMode("custom", customCount + 1);
                                              }
                                            }}
                                            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 font-bold text-center border border-white/10 active:scale-95 transition-all text-xs text-white disabled:opacity-25 cursor-pointer"
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
                    </div>

                    {/* Right Group: Opponent Team Mode ("Mode Lawan") & Squad Management / Importer (Logo-Only + Hover Tooltip Above) */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Mode Tim Lawan Toggle & Opponent Formation Dropdown */}
                      <div className="relative flex items-center gap-1 group">
                        <button
                          type="button"
                          onClick={() => {
                            if (isEnemyModeActive) {
                              handleToggleEnemyMode(false);
                              setShowEnemyDropdown(false);
                            } else {
                              handleToggleEnemyMode(true);
                              setShowEnemyDropdown(true);
                            }
                          }}
                          className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border shadow-md active:scale-95 ${
                            isEnemyModeActive
                              ? "bg-gradient-to-r from-red-600 to-rose-600 border-red-400/70 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                              : "bg-[#06151a]/90 hover:bg-[#09222a] border-teal-400/30 hover:border-teal-400/60"
                          }`}
                          aria-label={lang === "id" ? "Mode Tim Lawan" : "Opponent Team Mode"}
                          aria-pressed={isEnemyModeActive}
                        >
                          <NanoBananaLogo tool="enemy" size="md" active={isEnemyModeActive} danger={isEnemyModeActive} />
                          {isEnemyModeActive && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-[#071c22]" />
                          )}
                        </button>

                        {!showEnemyDropdown && (
                          <ToolHoverTooltip
                            category={lang === "id" ? "MODE LAWAN" : "OPPONENT MODE"}
                            title={lang === "id" ? "Simulasi Taktik Tim Lawan" : "Opponent Team Tactical Sim"}
                            badge={isEnemyModeActive ? "ON" : "OFF"}
                          />
                        )}

                        {isEnemyModeActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowEnemyDropdown(!showEnemyDropdown);
                              setShowFormationMenu(false);
                              setShowSportOverlay(false);
                            }}
                            className="w-7 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#06151a]/90 hover:bg-[#09222a] border-rose-400/40 text-rose-200 hover:text-white shadow-md active:scale-95"
                            aria-label={lang === "id" ? "Pilih Formasi Lawan" : "Choose Opponent Formation"}
                          >
                            <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${showEnemyDropdown ? "rotate-180 text-rose-400" : ""}`} />
                          </button>
                        )}

                        <AnimatePresence>
                          {isEnemyModeActive && showEnemyDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.95 }}
                              transition={{ duration: 0.18, ease: "easeOut" }}
                              className="absolute bottom-full mb-2 right-0 bg-[#06181f]/98 border border-teal-400/35 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col gap-1.5 min-w-[150px] z-[120]"
                            >
                              <span className="text-[8px] font-black text-teal-300 tracking-widest text-center uppercase border-b border-teal-400/20 pb-1 block">
                                {lang === "id" ? "FORMASI LAWAN" : "OPP FORMATION"}
                              </span>

                              <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                                {(() => {
                                  const availableFormations = SPORT_FORMATIONS[sportMode] ? Object.keys(SPORT_FORMATIONS[sportMode]) : [];
                                  if (availableFormations.length > 0) {
                                    return availableFormations.map((formKey) => (
                                      <button
                                        key={formKey}
                                        type="button"
                                        onClick={() => {
                                          handleSpawnEnemyTeam(formKey);
                                          setShowEnemyDropdown(false);
                                        }}
                                        className="w-full px-2 py-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-white rounded-lg border border-white/5 hover:border-red-500/30 text-[9.5px] font-extrabold uppercase transition-all text-center cursor-pointer active:scale-95"
                                      >
                                        {formKey === "1-2-1" && sportMode === "futsal" ? "DIAMOND" :
                                         formKey === "2-2" && sportMode === "futsal" ? "2-2 BOX" :
                                         formKey}
                                      </button>
                                    ));
                                  } else {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleSpawnEnemyTeam("custom");
                                          setShowEnemyDropdown(false);
                                        }}
                                        className="w-full px-2 py-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-white rounded-lg border border-white/5 hover:border-red-500/30 text-[9.5px] font-extrabold uppercase transition-all text-center cursor-pointer active:scale-95"
                                      >
                                        {lang === "id" ? "SEIMBANG" : "BALANCED"}
                                      </button>
                                    );
                                  }
                                })()}
                              </div>

                              <div className="border-t border-teal-400/20 my-0.5" />

                              <button
                                type="button"
                                onClick={() => {
                                  handleRebalanceEnemies();
                                  setShowEnemyDropdown(false);
                                }}
                                className="w-full px-2 py-1.5 bg-teal-500/15 hover:bg-teal-500/25 text-teal-200 rounded-lg border border-teal-400/30 text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              >
                                🔄 {lang === "id" ? "SEIMBANGKAN" : "RE-BALANCE"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  handleClearAllEnemies();
                                  setShowEnemyDropdown(false);
                                }}
                                className="w-full px-2 py-1 bg-red-950/45 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-lg border border-red-500/20 text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              >
                                🗑️ {lang === "id" ? "BERSIHKAN" : "CLEAR"}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Squad Management Logo-Only Button */}
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSquadManagementOpen(true);
                            soundManager.playClick();
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border bg-[#06151a]/90 hover:bg-[#09222a] border-teal-400/30 hover:border-teal-400/60 shadow-md active:scale-95"
                          aria-label={lang === "id" ? "Manajemen Skuad & Urutkan" : "Squad Management & Sorting"}
                        >
                          <NanoBananaLogo tool="squad" size="md" />
                        </button>
                        <ToolHoverTooltip
                          category={lang === "id" ? "MANAJEMEN SKUAD" : "SQUAD MANAGER"}
                          title={lang === "id" ? "Kelola Pemain & Nomor Punggung" : "Manage Players & Jersey Numbers"}
                        />
                      </div>

                      <SquadImport
                        onImport={handleImportSquad}
                        lang={lang}
                        isOpen={isSquadImportModalOpen}
                        onOpenChange={setIsSquadImportModalOpen}
                      />
                    </div>
                    </div>
                  }
                />
              )}
              </div>

            {/* Tactical Tools Sidebar (Shown when Pitch mode is active) */}
            {pitchZoneMode === "pitch" && (
            <div className="flex flex-col gap-1.5 sm:gap-2 p-1.5 bg-[#071c22]/90 hover:bg-[#071c22] backdrop-blur-xl rounded-2xl border border-teal-400/25 shadow-[0_12px_36px_rgba(3,12,16,0.55)] select-none items-center justify-center shrink-0 transition-all duration-300 z-45 hover:z-[110]">
              
              {/* Active Tool select (Mode Geser/Drag) */}
              <div className="relative group shrink-0">
                <button
                  onClick={() => setActiveTool("select")}
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                    activeTool === "select"
                      ? "bg-teal-400 text-slate-950 border-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.35)]"
                      : "bg-[#041217] text-teal-100/75 border-teal-400/20 hover:bg-teal-500/15 hover:text-white"
                  }`}
                  aria-label={lang === "id" ? "Mode Geser & Susun" : "Drag & Drop Mode"}
                  aria-pressed={activeTool === "select"}
                >
                  <Move className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <ToolHoverTooltip
                  category={t.control}
                  title={lang === "id" ? "Mode Geser & Susun (Drag)" : "Drag & Drop Mode"}
                  placement="left"
                />
              </div>

              {/* Active Tool draw (Mode Coret/Draw) */}
              <div className="relative group shrink-0">
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => {
                      if (activeTool !== "draw") {
                        setActiveTool("draw");
                      } else {
                        setActiveTool("select");
                      }
                    }}
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                      activeTool === "draw"
                        ? "bg-teal-400 text-slate-950 border-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.35)]"
                        : "bg-[#041217] text-teal-100/75 border-teal-400/20 hover:bg-teal-500/15 hover:text-white"
                    }`}
                    aria-label={lang === "id" ? "Mode Coret Taktikal" : "Tactical Sketch Mode"}
                    aria-pressed={activeTool === "draw"}
                  >
                    <PenTool className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span 
                      className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full border border-black/45 shadow-sm"
                      style={{ backgroundColor: brushColor }}
                    />
                  </button>
                </div>

                <ToolHoverTooltip
                  category={t.control}
                  title={lang === "id" ? "Mode Coret Taktikal (Draw)" : "Tactical Sketch Mode"}
                  placement="left"
                />
              </div>

              {/* Responsive separation line (divider) */}
              <div className="w-5 sm:w-8 h-[1px] bg-teal-400/20 my-0.5 shrink-0" />

              {/* COLLAPSIBLE TOOLBAR TOGGLE BUTTON */}
              <div className="relative group shrink-0">
                <button
                  onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                    isToolbarExpanded
                      ? "bg-teal-500/25 border-teal-400/45 text-teal-200"
                      : "bg-[#041217] text-teal-100/75 border-teal-400/20 hover:bg-teal-500/15 hover:text-white"
                  }`}
                  aria-label={
                    isToolbarExpanded
                      ? lang === "id" ? "Sembunyikan Toolkit" : "Collapse Toolkit"
                      : lang === "id" ? "Buka Toolkit (Rollout)" : "Expand Toolkit (Rollout)"
                  }
                >
                  <Sliders className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 ${isToolbarExpanded ? 'rotate-90' : ''}`} />
                </button>
                <ToolHoverTooltip
                  category="TOOLBAR"
                  title={
                    isToolbarExpanded
                      ? lang === "id" ? "Sembunyikan Toolkit" : "Collapse Toolkit"
                      : lang === "id" ? "Buka Toolkit (Rollout)" : "Expand Toolkit (Rollout)"
                  }
                  placement="left"
                />
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
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", "ball");
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-emerald-600/20 text-white hover:text-emerald-400 border border-white/10 hover:border-emerald-500/20 transition-all flex items-center justify-center active:scale-95 cursor-grab active:cursor-grabbing shadow-md shrink-0"
                        aria-label={lang === "id" ? "Tambah Bola Baru" : "Spawn New Ball"}
                      >
                        <span className="text-[12px] sm:text-[14px] md:text-[19px] hover:scale-110 transition-transform">⚽</span>
                      </button>
                      <ToolHoverTooltip
                        category={t.elements}
                        title={lang === "id" ? "Tambah Bola Baru (Klik / Drag)" : "Spawn New Ball (Click / Drag)"}
                        placement="left"
                      />
                    </div>

                    {/* Add Cone Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => handleAddTacticalItem("cone")}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", "cone");
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-orange-650/20 text-white hover:text-orange-400 border border-white/10 hover:border-orange-500/20 transition-all flex items-center justify-center active:scale-95 cursor-grab active:cursor-grabbing shadow-md shrink-0"
                        aria-label={lang === "id" ? "Tambah Cone Latihan" : "Spawn Practice Cone"}
                      >
                        <div className="relative flex flex-col items-center">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-gradient-to-t from-orange-600 via-orange-500 to-amber-300 rounded-t-full border-t border-amber-200 flex items-center justify-center shadow-lg">
                            <div className="w-1 h-0.5 md:w-2 md:h-0.5 bg-white/50 rounded-full mb-0.5"></div>
                          </div>
                          <div className="w-3.5 h-0.5 sm:w-4 sm:h-0.5 md:w-5.5 md:h-1 bg-orange-700 rounded-full -mt-0.5 shadow-md"></div>
                        </div>
                      </button>
                      <ToolHoverTooltip
                        category={t.elements}
                        title={lang === "id" ? "Tambah Cone Latihan (Klik / Drag)" : "Spawn Practice Cone (Click / Drag)"}
                        placement="left"
                      />
                    </div>

                    {/* Add Enemy Player Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => handleAddTacticalItem("enemy")}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", "enemy");
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-blue-600/20 text-white hover:text-blue-400 border border-white/10 hover:border-blue-500/20 transition-all flex items-center justify-center active:scale-95 cursor-grab active:cursor-grabbing shadow-md shrink-0"
                        aria-label={lang === "id" ? "Tambah Pemain Lawan" : "Spawn Opponent Player"}
                      >
                        <div
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white/40 flex items-center justify-center shadow-md font-black text-[9px] sm:text-[10px]"
                          style={{ backgroundColor: enemyColor, color: "#ffffff" }}
                        >
                          E
                        </div>
                      </button>
                      <ToolHoverTooltip
                        category={lang === "id" ? "LAWAN" : "OPPONENT"}
                        title={lang === "id" ? "Tambah Pemain Lawan (Klik / Drag)" : "Spawn Opponent Player (Click / Drag)"}
                        placement="left"
                      />
                    </div>

                    {/* Responsive separation line (divider) */}
                    <div className="w-5 sm:w-8 h-[1px] bg-white/[0.08] my-1 sm:my-1.5 shrink-0" />

                    {/* Jersey Utama */}
                    <div className="relative group shrink-0">
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden shrink-0">
                        <div className="relative flex items-center justify-center">
                          <Shirt className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-300 transition-transform group-hover:scale-115 duration-205" style={{ fill: primaryColor, color: primaryColor === "#ffffff" ? "#cbd5e1" : "transparent" }} />
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                            aria-label={lang === "id" ? "Jersey Tim Utama" : "Primary Kit Color"}
                          />
                        </div>
                      </div>
                      <ToolHoverTooltip
                        category={t.uniform}
                        title={lang === "id" ? "Jersey Tim Utama" : "Primary Kit Color"}
                        placement="left"
                      />
                    </div>

                    {/* Jersey Keeper */}
                    <div className="relative group shrink-0">
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden shrink-0">
                        <div className="relative flex items-center justify-center">
                          <Shirt className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-300 transition-transform group-hover:scale-115 duration-205" style={{ fill: gkColor, color: gkColor === "#ffffff" ? "#cbd5e1" : "transparent" }} />
                          <input
                            type="color"
                            value={gkColor}
                            onChange={(e) => setGkColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                            aria-label={lang === "id" ? "Jersey Kiper (GK)" : "Goalkeeper Kit Color"}
                          />
                        </div>
                      </div>
                      <ToolHoverTooltip
                        category={t.uniform}
                        title={lang === "id" ? "Jersey Kiper (GK)" : "Goalkeeper Kit Color"}
                        placement="left"
                      />
                    </div>

                    {/* Warna Nomor Punggung */}
                    <div className="relative group shrink-0">
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden shrink-0">
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <span className="text-[9px] md:text-[12px] font-black tracking-tighter transition-transform group-hover:scale-115 duration-205" style={{ color: numberColor }}>10</span>
                          <input
                            type="color"
                            value={numberColor}
                            onChange={(e) => setNumberColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                            aria-label={lang === "id" ? "Warna Nomor" : "Numbers Color"}
                          />
                        </div>
                      </div>
                      <ToolHoverTooltip
                        category={t.uniform}
                        title={lang === "id" ? "Warna Nomor" : "Numbers Color"}
                        placement="left"
                      />
                    </div>

                    {/* Jersey Lawan */}
                    <div className="relative group/opponentcolor shrink-0 hover:z-[999]">
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden shrink-0">
                        <div className="relative flex items-center justify-center">
                          <Shirt className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-300 transition-transform group-hover/opponentcolor:scale-115 duration-205" style={{ fill: enemyColor, color: enemyColor === "#ffffff" ? "#cbd5e1" : "transparent" }} />
                          <input
                            type="color"
                            value={enemyColor}
                            onChange={(e) => setEnemyColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                            aria-label={lang === "id" ? "Pilih Warna Custom Lawan" : "Choose Opponent Custom Color"}
                          />
                        </div>
                      </div>
                      
                      {/* Floating Opponent Color Picker Panel */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 opacity-0 pointer-events-none group-hover/opponentcolor:opacity-100 group-hover/opponentcolor:pointer-events-auto transition-all duration-200 bg-[#0e0f13]/98 border border-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md z-[999] flex flex-col gap-2 min-w-[160px] sm:min-w-[190px]">
                        <div className="flex flex-col gap-0.5 border-b border-white/5 pb-1.5 mb-1 text-right">
                          <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-[#5e6680] uppercase">
                            {lang === "id" ? "WARNA TIM LAWAN" : "OPPONENT CLUB COLOR"}
                          </span>
                          <span className="text-white font-extrabold text-[9px] sm:text-[10px]">
                            {lang === "id" ? "Preset Klub / Custom" : "Club Presets / Custom"}
                          </span>
                        </div>

                        {/* Colors Grid */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { name: "Chelsea / Royal", hex: "#1e40af" },
                            { name: "Man City / Sky", hex: "#38bdf8" },
                            { name: "Man Utd / Bayern", hex: "#dc2626" },
                            { name: "Dortmund / Yellow", hex: "#eab308" },
                            { name: "Celtic / Green", hex: "#10b981" },
                            { name: "Madrid / White", hex: "#ffffff" },
                            { name: "Wolves / Orange", hex: "#f97316" },
                            { name: "Juve / Black", hex: "#171717" },
                          ].map((preset) => (
                            <button
                              key={preset.hex}
                              onClick={() => setEnemyColor(preset.hex)}
                              title={preset.name}
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 relative ${
                                enemyColor.toLowerCase() === preset.hex.toLowerCase()
                                  ? "border-red-500 scale-105 shadow-[0_0_10px_rgba(239,68,68,0.4)] z-10"
                                  : "border-white/10 hover:border-white/30"
                              }`}
                              style={{ backgroundColor: preset.hex }}
                            >
                              {enemyColor.toLowerCase() === preset.hex.toLowerCase() && (
                                <Check className={`w-3 h-3 ${preset.hex === "#ffffff" ? "text-slate-900" : "text-white"}`} strokeWidth={3} />
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-white/5 my-0.5" />

                        {/* Custom Color Picker Input row */}
                        <div className="flex items-center justify-between gap-1.5 bg-black/40 border border-white/5 rounded-lg p-1.5">
                          <span className="text-[8px] sm:text-[9px] font-black text-gray-400 font-mono uppercase">
                            {enemyColor.toUpperCase()}
                          </span>
                          <div className="relative w-6 h-6 rounded-md border border-white/20 overflow-hidden cursor-pointer" style={{ backgroundColor: enemyColor }}>
                            <input
                              type="color"
                              value={enemyColor}
                              onChange={(e) => setEnemyColor(e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <Palette className={`w-3 h-3 ${enemyColor === "#ffffff" ? "text-slate-950" : "text-white"}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Kit Presets Quick Palette Selector */}
                    <div className="relative group/kitpresets shrink-0 hover:z-[999]">
                      <button
                        type="button"
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md overflow-hidden shrink-0"
                        aria-label={lang === "id" ? "Preset Warna Kostum Tim" : "Team Kit Color Presets"}
                      >
                        <Palette className="w-3.5 h-3.5 md:w-5 md:h-5 text-indigo-400 group-hover/kitpresets:rotate-45 transition-transform duration-300" />
                      </button>

                      {/* Floating Team Kit Presets Panel */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 opacity-0 pointer-events-none group-hover/kitpresets:opacity-100 group-hover/kitpresets:pointer-events-auto transition-all duration-200 bg-[#0e0f13]/98 border border-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md z-[999] flex flex-col gap-2 min-w-[210px] sm:min-w-[240px]">
                        <div className="flex flex-col gap-0.5 border-b border-white/5 pb-1.5 mb-0.5 text-right">
                          <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-indigo-400 uppercase">
                            {lang === "id" ? "PRESET KOSTUM TIM" : "TEAM KIT PRESETS"}
                          </span>
                          <span className="text-white font-extrabold text-[9px] sm:text-[10px]">
                            {lang === "id" ? "Palet Warna Pro Klub" : "Pro Club Color Schemes"}
                          </span>
                        </div>

                        {/* Presets List */}
                        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-0.5">
                          {[
                            { name: "Classic Red & White", primary: "#dc2626", gk: "#eab308", num: "#ffffff", flag: "🔴" },
                            { name: "Royal Madrid", primary: "#f8fafc", gk: "#eab308", num: "#0f172a", flag: "⚪" },
                            { name: "FC Blaugrana", primary: "#1d4ed8", gk: "#10b981", num: "#facc15", flag: "🔵" },
                            { name: "Sky Citizens", primary: "#38bdf8", gk: "#f97316", num: "#ffffff", flag: "🩵" },
                            { name: "Selecao Samba", primary: "#eab308", gk: "#18181b", num: "#15803d", flag: "🟡" },
                            { name: "Bianconeri Noir", primary: "#18181b", gk: "#eab308", num: "#ffffff", flag: "⚫" },
                            { name: "Cyberpunk Neon", primary: "#9333ea", gk: "#06b6d4", num: "#ffffff", flag: "⚡" },
                            { name: "Verde Celtic", primary: "#059669", gk: "#d97706", num: "#ffffff", flag: "🟢" }
                          ].map((kit) => (
                            <button
                              key={kit.name}
                              type="button"
                              onClick={() => {
                                setPrimaryColor(kit.primary);
                                setGkColor(kit.gk);
                                setNumberColor(kit.num);
                                soundManager.playClick();
                              }}
                              className="w-full flex items-center justify-between p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 transition-all text-left group/kitbtn cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">{kit.flag}</span>
                                <span className="text-[9.5px] sm:text-[10px] font-bold text-gray-200 group-hover/kitbtn:text-white truncate">
                                  {kit.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <div className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: kit.primary }} title="Primary" />
                                <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: kit.gk }} title="GK" />
                                <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm flex items-center justify-center text-[7px] font-black" style={{ backgroundColor: "#1e293b", color: kit.num }} title="Number">#</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Responsive separation line (divider) */}
                    <div className="w-5 sm:w-8 h-[1px] bg-white/[0.08] my-1 sm:my-1.5 shrink-0" />

                    {/* Tactical Grid Overlay Toggle Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => setShowTacticalGrid(!showTacticalGrid)}
                        aria-label={lang === "id" ? "Grid Taktis" : "Tactical Grid"}
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                          showTacticalGrid
                            ? "bg-indigo-600 text-white border-indigo-400/30 shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                      </button>
                      <ToolHoverTooltip
                        category={t.tacticalGrid}
                        title={lang === "id" ? "Grid Taktis" : "Tactical Grid"}
                        badge={showTacticalGrid ? "ON" : undefined}
                        placement="left"
                      />
                    </div>

                    {/* Magnetic Grid Snapping / Free Placement Toggle Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => {
                          setIsSnapToGrid(!isSnapToGrid);
                          soundManager.playClick();
                        }}
                        aria-label={lang === "id" ? "Magnet Grid / Bebas" : "Grid Magnet / Free"}
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                          isSnapToGrid
                            ? "bg-amber-600 text-white border-amber-400/30 shadow-[0_0_12px_rgba(217,119,6,0.35)]"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Magnet className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                      </button>
                      <ToolHoverTooltip
                        category={lang === "id" ? "KONTROL PRESISI" : "PRECISION CONTROL"}
                        title={
                          isSnapToGrid
                            ? lang === "id" ? "Magnet Grid: Aktif" : "Grid Magnet: Active"
                            : lang === "id" ? "Penempatan: Bebas & Halus" : "Placement: Free & Smooth"
                        }
                        badge={isSnapToGrid ? "ON" : "FREE"}
                        placement="left"
                      />
                    </div>

                    {/* Tactical Heatmap Overlay Toggle Button */}
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        aria-label={lang === "id" ? "Peta Panas (Heatmap)" : "Heatmap Analysis"}
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md border shrink-0 ${
                          showHeatmap
                            ? "bg-red-600 text-white border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.45)]"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 md:w-4.5 md:h-4.5 ${showHeatmap ? 'animate-pulse text-orange-200' : ''}`} />
                      </button>
                      <ToolHoverTooltip
                        category={t.heatmapTitle}
                        title={t.heatmapDesc}
                        badge={showHeatmap ? "ON" : undefined}
                        placement="left"
                      />
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
                        aria-label={lang === "id" ? "Simpan Formasi & Skuad" : "Save Pitch & Squad"}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md shrink-0"
                      >
                        <Save className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                      </button>
                      <ToolHoverTooltip
                        category={lang === "id" ? "PENYIMPANAN" : "SAVE STATE"}
                        title={lang === "id" ? "Simpan Formasi & Skuad" : "Save Pitch & Squad"}
                        placement="left"
                      />
                    </div>

                    {/* Load Setup Button */}
                    <div className="relative group shrink-0" id="btn-load-playbook-wrapper">
                      <button
                        id="btn-load-playbook-trigger"
                        onClick={() => {
                          setSaveLoadMode("load");
                          setSaveLoadModalOpen(true);
                        }}
                        aria-label={lang === "id" ? "Muat Formasi Tersimpan" : "Load Saved Playbook"}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md shrink-0"
                      >
                        <FolderOpen className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                      </button>
                      <ToolHoverTooltip
                        category={lang === "id" ? "MEMORI" : "LOAD BOARD"}
                        title={lang === "id" ? "Muat Formasi Tersimpan" : "Load Saved Playbook"}
                        placement="left"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
            )}
          </div>

          {/* Inline Live Multi-Phase Simulation Player Bar (Appears whenever Corner Kick or Tactical Drill has >1 phases) */}
          {frames.length > 1 && !isPitchFullscreen && (
            <div className="w-full max-w-[580px] bg-[#071e24]/95 border border-teal-400/30 rounded-2xl p-3 shadow-lg flex flex-col gap-2.5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextPlay = !isInlineSimPlaying;
                      setIsInlineSimPlaying(nextPlay);
                      if (nextPlay) soundManager.playWhistle();
                      else soundManager.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm whitespace-nowrap ${
                      isInlineSimPlaying
                        ? "bg-amber-400 text-slate-950"
                        : "bg-teal-400 hover:bg-teal-300 text-slate-950"
                    }`}
                  >
                    {isInlineSimPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>{lang === "id" ? "Jeda Simulasi" : "Pause Sim"}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{lang === "id" ? "Putar Simulasi" : "Play Sim"}</span>
                      </>
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">
                      {activeSimulationTitle || (lang === "id" ? "Simulasi Taktis Aktif" : "Active Tactical Simulation")}
                    </span>
                    <span className="text-[10px] text-teal-300 font-medium">
                      {frames[activeFrameIndex]?.name}
                    </span>
                  </div>
                </div>

                {/* Phase Stepper Buttons */}
                <div className="flex items-center gap-1 bg-[#041115] p-1 rounded-xl border border-teal-400/20">
                  {frames.map((frame, idx) => {
                    const isCurrent = activeFrameIndex === idx;
                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => {
                          setIsInlineSimPlaying(false);
                          handleSelectFrameIndex(idx);
                          soundManager.playClick();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap font-mono tabular-nums ${
                          isCurrent
                            ? "bg-teal-500 text-slate-950 shadow-sm"
                            : "text-teal-100/70 hover:text-white"
                        }`}
                      >
                        {lang === "id" ? `Fasa ${idx + 1}` : `Phase ${idx + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Phase Coaching Instruction */}
              {frames[activeFrameIndex]?.instruction && (
                <div className="text-[11px] text-teal-100/90 bg-[#051419]/80 border border-teal-400/15 rounded-xl px-3 py-2 leading-relaxed">
                  {frames[activeFrameIndex].instruction}
                </div>
              )}
            </div>
          )}

          {/* Android Quick Action Hub (Logo-Only + Hover Tooltip Above) & Integrated Formation Studio under pitch */}
          {deviceMode === "android" && (
            <div className="w-full max-w-[580px] flex flex-col gap-3 pt-2 border-t border-teal-400/15 mt-1">
              <div className="grid grid-cols-5 gap-2">
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormationStudioModalOpen(true);
                      soundManager.playClick();
                    }}
                    aria-label={lang === "id" ? "Studio Formasi" : "Formation Studio"}
                    className="w-full h-11 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 flex items-center justify-center cursor-pointer transition-all shadow-sm active:scale-95"
                  >
                    <NanoBananaLogo tool="studio" size="md" active={true} />
                  </button>
                  <ToolHoverTooltip
                    category={lang === "id" ? "STUDIO TAKTIS" : "STUDIO"}
                    title={lang === "id" ? "Studio Formasi & Lini" : "Formation Studio"}
                    align="left"
                  />
                </div>

                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setPitchZoneMode((prev) => (prev === "poster" ? "pitch" : "poster"));
                      soundManager.playClick();
                    }}
                    aria-label={lang === "id" ? "Switch ke Poster HD" : "Switch to HD Poster"}
                    className={`w-full h-11 rounded-xl border flex items-center justify-center cursor-pointer transition-all shadow-sm active:scale-95 ${
                      pitchZoneMode === "poster"
                        ? "bg-teal-400 text-slate-950 border-teal-300"
                        : "bg-teal-500/20 hover:bg-teal-500/30 border-teal-400/40"
                    }`}
                  >
                    <NanoBananaLogo tool="poster" size="md" active={pitchZoneMode === "poster"} />
                  </button>
                  <ToolHoverTooltip
                    category="POSTER HD"
                    title={
                      pitchZoneMode === "poster"
                        ? lang === "id"
                          ? "Kembali ke Lapangan Taktis"
                          : "Back to Tactical Pitch"
                        : lang === "id"
                        ? "Switch ke Studio Poster HD"
                        : "Switch to HD Poster Studio"
                    }
                  />
                </div>

                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setAndroidActiveTab("corner");
                      soundManager.playClick();
                    }}
                    aria-label={lang === "id" ? "Studio Corner" : "Corner Studio"}
                    className="w-full h-11 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/35 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    <NanoBananaLogo tool="corner_sim" size="md" />
                  </button>
                  <ToolHoverTooltip
                    category="SET-PIECE"
                    title={lang === "id" ? "Simulasi Corner Kick" : "Corner Kick Simulator"}
                  />
                </div>

                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSquadManagementOpen(true);
                      soundManager.playClick();
                    }}
                    aria-label={lang === "id" ? "Kelola Skuad" : "Squad"}
                    className="w-full h-11 rounded-xl bg-[#082229] hover:bg-[#0b2d36] border border-teal-400/20 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    <NanoBananaLogo tool="squad" size="md" />
                  </button>
                  <ToolHoverTooltip
                    category={lang === "id" ? "SKUAD" : "SQUAD"}
                    title={lang === "id" ? "Kelola Pemain & Nomor" : "Manage Squad"}
                  />
                </div>

                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMatchSheetOpen(true);
                      soundManager.playClick();
                    }}
                    aria-label={lang === "id" ? "Lembar Laga" : "Match Sheet"}
                    className="w-full h-11 rounded-xl bg-[#082229] hover:bg-[#0b2d36] border border-teal-400/20 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    <NanoBananaLogo tool="briefing" size="md" />
                  </button>
                  <ToolHoverTooltip
                    category="BRIEFING"
                    title={lang === "id" ? "Lembar Taktik Pertandingan" : "Matchday Tactical Sheet"}
                    align="right"
                  />
                </div>
              </div>

              {/* Integrated Formation & Poster Studio Panel directly below pitch in Android mode */}
              {renderAIImageGen()}
            </div>
          )}
        </div>
      )}

        {/* RIGHT COLUMN: SEGMENTED TACTICAL COMMAND DOCK (LOGO-ONLY TABS WITH HOVER TOOLTIP ABOVE) */}
        {deviceMode === "pc" ? (
          <div className="lg:col-span-3 flex flex-col gap-3.5 lg:max-h-[88vh] pl-1 h-auto">
            {/* Clean Logo-Only Segmented Tab Switcher for Right Column */}
            <div className="bg-[#071c22]/95 border border-teal-400/25 rounded-2xl p-1.5 grid grid-cols-3 gap-1.5 shadow-[0_10px_28px_rgba(3,12,16,0.45)] shrink-0">
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    setPcRightTab("corner");
                    soundManager.playClick();
                  }}
                  aria-label={lang === "id" ? "Simulasi Corner Kick" : "Corner Kick Simulator"}
                  className={`w-full h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                    pcRightTab === "corner"
                      ? "bg-teal-400 text-slate-950 shadow-sm"
                      : "text-teal-100/75 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <NanoBananaLogo tool="corner_sim" size="md" active={pcRightTab === "corner"} />
                </button>
                <ToolHoverTooltip
                  category="SET-PIECE LAB"
                  title={lang === "id" ? "Simulasi Situasi Corner Kick" : "Corner Kick Situation Simulator"}
                  badge={pcRightTab === "corner" ? "AKTIF" : undefined}
                  align="left"
                />
              </div>

              <div className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    setPcRightTab("animation");
                    soundManager.playClick();
                  }}
                  aria-label={lang === "id" ? "Animasi & Latihan Taktis" : "Animation & Tactical Drills"}
                  className={`w-full h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                    pcRightTab === "animation"
                      ? "bg-teal-400 text-slate-950 shadow-sm"
                      : "text-teal-100/75 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <NanoBananaLogo tool="animation" size="md" active={pcRightTab === "animation"} />
                </button>
                <ToolHoverTooltip
                  category="KEYFRAME TIMELINE"
                  title={lang === "id" ? "Animasi Pergerakan & Skenario Latihan" : "Movement Animation & Tactical Drills"}
                  badge={pcRightTab === "animation" ? "AKTIF" : undefined}
                />
              </div>

              <div className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    setPcRightTab("ai");
                    soundManager.playClick();
                  }}
                  aria-label={lang === "id" ? "Pelatih Taktik AI" : "AI Tactical Coach"}
                  className={`w-full h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                    pcRightTab === "ai"
                      ? "bg-teal-400 text-slate-950 shadow-sm"
                      : "text-teal-100/75 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <NanoBananaLogo tool="ai_coach" size="md" active={pcRightTab === "ai"} />
                </button>
                <ToolHoverTooltip
                  category="GEMINI PLAYMAKER"
                  title={lang === "id" ? "Analisis & Pelatih Taktik AI" : "AI Tactical Coach & Scout"}
                  badge={pcRightTab === "ai" ? "AKTIF" : undefined}
                  align="right"
                />
              </div>
            </div>

            {/* Active Tab Content Container */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin">
              {pcRightTab === "corner" && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  {renderCornerKickSimulator()}
                </div>
              )}

              {pcRightTab === "animation" && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  {renderAnimationTimeline()}
                  {renderTacticalDrills()}
                </div>
              )}

              {pcRightTab === "ai" && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  {renderAICoach()}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {androidActiveTab === "corner" && (
              <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 animate-fadeIn">
                {renderCornerKickSimulator()}
              </div>
            )}
            {androidActiveTab === "animation" && (
              <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 animate-fadeIn">
                {renderAnimationTimeline()}
                {renderTacticalDrills()}
              </div>
            )}
            {androidActiveTab === "ai" && (
              <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 animate-fadeIn">
                {renderAIImageGen()}
                {renderAICoach()}
              </div>
            )}
          </>
        )}
      </main>

      {/* Android Bottom Navigation */}
      {deviceMode === "android" && (
        <AndroidBottomNav
          activeTab={androidActiveTab}
          onChangeTab={setAndroidActiveTab}
          onOpenSettings={() => {
            setSettingsInitialTab("audio");
            setIsSettingsModalOpen(true);
          }}
          lang={lang}
        />
      )}
    </div>
  </div>

      {/* Official Automated Sponsor Acquisition & Advertising Portal */}
      <div className="max-w-7xl w-full mx-auto px-3 md:px-6 mb-6 select-none">
        <SponsorAcquisitionPortal lang={lang} />
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

      {/* PROFESSIONAL UEFA PRO MATCHDAY BRIEFING SHEET MODAL */}
      <MatchBriefingSheetModal
        isOpen={isMatchSheetOpen}
        onClose={() => setIsMatchSheetOpen(false)}
        teamName={teamName}
        teamLogo={teamLogo}
        players={players}
        formation={formation}
        opponentFormation={opponentFormation}
        sportMode={sportMode}
        tacticalPhase={tacticalPhase}
        managerName={managerName}
        primaryColor={primaryColor}
        lang={lang}
        onDownloadPitchPng={handleDownloadImage}
      />

      {/* GLOBAL CREDENTIALS & AUDIO SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsMuted(soundManager.getMuted());
          setIsSettingsModalOpen(false);
        }}
        onSave={() => {
          setSettingsKey((prev) => prev + 1);
          setIsMuted(soundManager.getMuted());
          setHasConnectedAI(
            !!(
              (localStorage.getItem("tactigen_custom_key") || "").trim() ||
              localStorage.getItem("tactigen_mcp_enabled") === "true"
            )
          );
        }}
        lang={lang}
        initialTab={settingsInitialTab}
      />

      {/* PROFESSIONAL SQUAD MANAGEMENT & AUTO-SORTING MODAL */}
      <AnimatePresence>
        {isSquadManagementOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setIsSquadManagementOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="w-full max-w-4xl max-h-[92vh] bg-[#071912]/98 border border-emerald-500/30 ring-1 ring-emerald-400/20 rounded-3xl p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col relative text-left overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-emerald-500/20 mb-3 sm:mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                      {lang === "id" ? "Pengelolaan & Urutan Skuad" : "Squad Management & Sorting"}
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                        {players.length} {lang === "id" ? "Pemain" : "Players"}
                      </span>
                    </h2>
                    <p className="text-[10.5px] sm:text-xs text-gray-400">
                      {lang === "id"
                        ? "Atur urutan pemain otomatis berdasarkan posisi (GK, DEF, MID, FWD) atau nomor punggung"
                        : "Sort players automatically by tactical position (GK, DEF, MID, FWD) or jersey number"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsSquadImportModalOpen(true);
                      setIsSquadManagementOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Import className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === "id" ? "Impor Teks" : "Import Text"}</span>
                  </button>
                  <button
                    onClick={() => setIsSquadManagementOpen(false)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-sm font-bold border border-white/10"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto pr-1">
                <SquadManagement
                  players={players}
                  onSortPlayers={handleSortPlayers}
                  onSelectPlayer={(id) => setEditingPlayerId(id)}
                  onAddPlayer={handleAddBenchDirect}
                  onRemovePlayer={handleDeletePlayer}
                  onToggleStarter={handleToggleStarter}
                  onBulkUpdatePlayers={handleBulkUpdatePlayers}
                  onBulkDeletePlayers={handleBulkDeletePlayers}
                  onOpenImport={() => {
                    setIsSquadImportModalOpen(true);
                    setIsSquadManagementOpen(false);
                  }}
                  primaryColor={primaryColor}
                  gkColor={gkColor}
                  numberColor={numberColor}
                  lang={lang}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Nano Banana UI Tool Icon Studio Modal */}
      <NanoBananaIconStudioModal
        isOpen={isNanoIconStudioOpen}
        onClose={() => setIsNanoIconStudioOpen(false)}
        lang={lang}
      />

    </div>
  );
}
