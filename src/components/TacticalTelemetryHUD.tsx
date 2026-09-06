import React from "react";
import { 
  Shield, 
  Activity, 
  Compass, 
  Target, 
  Layers, 
  FileText, 
  Ruler, 
  Flame, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Player, TacticalItem, TacticalOverlayMode, TacticalPhase } from "../types";

interface TacticalTelemetryHUDProps {
  players: Player[];
  items: TacticalItem[];
  sportMode: "soccer" | "minisoccer" | "futsal" | "custom";
  formation: string;
  opponentFormation?: string;
  tacticalOverlay: TacticalOverlayMode;
  onSetTacticalOverlay: (mode: TacticalOverlayMode) => void;
  tacticalPhase: TacticalPhase;
  onSetTacticalPhase: (phase: TacticalPhase) => void;
  isMeasureMode: boolean;
  onToggleMeasureMode: () => void;
  onOpenMatchSheet: () => void;
  lang: "id" | "en";
}

export default function TacticalTelemetryHUD({
  players,
  items,
  sportMode,
  formation,
  opponentFormation,
  tacticalOverlay,
  onSetTacticalOverlay,
  tacticalPhase,
  onSetTacticalPhase,
  isMeasureMode,
  onToggleMeasureMode,
  onOpenMatchSheet,
  lang
}: TacticalTelemetryHUDProps) {
  const starters = players.filter((p) => p.isStarting);
  const outfieldPlayers = starters.filter((p) => p.role !== "GK");

  // Pitch dimensions (standard soccer: 105m x 68m; futsal: 40m x 20m; minisoccer: 70m x 45m)
  const pitchLengthMeters = sportMode === "futsal" ? 40 : sportMode === "minisoccer" ? 70 : 105;
  const pitchWidthMeters = sportMode === "futsal" ? 20 : sportMode === "minisoccer" ? 45 : 68;

  // Defensive Line Height: distance from own goal line (y=100 is bottom goal, y=0 is top goal)
  // Our team attacks upwards, bottom is defending goal (100)
  let defensiveLineY = 85;
  let highestAttackerY = 25;
  let leftmostX = 50;
  let rightmostX = 50;

  if (outfieldPlayers.length > 0) {
    const defenders = outfieldPlayers.filter((p) => p.role === "DEF");
    const yValuesDef = defenders.length > 0 ? defenders.map((p) => p.y) : outfieldPlayers.map((p) => p.y);
    defensiveLineY = Math.max(...yValuesDef); // closest to bottom line (y=100)

    const yValuesAll = outfieldPlayers.map((p) => p.y);
    highestAttackerY = Math.min(...yValuesAll); // closest to top line (y=0)

    const xValues = outfieldPlayers.map((p) => p.x);
    leftmostX = Math.min(...xValues);
    rightmostX = Math.max(...xValues);
  }

  // Calculate real-world metrics
  const defensiveLineMeters = Math.max(0, ((100 - defensiveLineY) / 100) * pitchLengthMeters);
  const compactnessMeters = Math.max(0, ((defensiveLineY - highestAttackerY) / 100) * pitchLengthMeters);
  const teamWidthMeters = Math.max(0, ((rightmostX - leftmostX) / 100) * pitchWidthMeters);

  // Categorize block height
  const blockCategory =
    defensiveLineMeters < (pitchLengthMeters * 0.28)
      ? { label: lang === "id" ? "Blok Rendah" : "Low Block", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" }
      : defensiveLineMeters < (pitchLengthMeters * 0.45)
      ? { label: lang === "id" ? "Blok Menengah" : "Mid Block", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
      : { label: lang === "id" ? "Garis Tinggi" : "High Line", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };

  // Compactness rating (ideal soccer compactness: 26-36m)
  const compactnessStatus =
    compactnessMeters <= 36
      ? { text: lang === "id" ? "Kompak Sempurna" : "Optimal Compact", color: "text-emerald-400" }
      : compactnessMeters <= 46
      ? { text: lang === "id" ? "Cukup Rapat" : "Moderate Spread", color: "text-yellow-400" }
      : { text: lang === "id" ? "Terlalu Renggang" : "Stretched", color: "text-rose-400" };

  const phases: { id: TacticalPhase; labelId: string; labelEn: string; icon: string }[] = [
    { id: "build-up", labelId: "Build-Up Bawah", labelEn: "Build-Up", icon: "⚽" },
    { id: "progression", labelId: "Progresi Tengah", labelEn: "Progression", icon: "⚡" },
    { id: "final-third", labelId: "Sepertiga Akhir", labelEn: "Final 3rd", icon: "🎯" },
    { id: "high-press", labelId: "High Press", labelEn: "High Press", icon: "🔥" },
    { id: "mid-block", labelId: "Mid Block", labelEn: "Mid Block", icon: "🛡️" },
    { id: "low-block", labelId: "Low Block", labelEn: "Low Block", icon: "🏰" },
    { id: "counter-attack", labelId: "Serangan Balik", labelEn: "Counter", icon: "🚀" },
    { id: "set-piece", labelId: "Bola Mati", labelEn: "Set-Piece", icon: "📐" }
  ];

  return (
    <div className="w-full max-w-[580px] flex flex-col gap-2 select-none">
      {/* Top telemetry pills container with Frosted Emerald Glassmorphism */}
      <div className="w-full bg-[#051a11]/90 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col gap-2.5">
        
        {/* Row 1: Live Match Telemetry Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Def Line */}
          <div className="bg-emerald-950/40 border border-emerald-500/15 rounded-xl p-1.5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[9px] text-emerald-300/80 font-bold uppercase tracking-wider">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>{lang === "id" ? "Garis Pertahanan" : "Def Line"}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm sm:text-base font-black text-white">{defensiveLineMeters.toFixed(1)}</span>
              <span className="text-[10px] text-emerald-400 font-bold">m</span>
            </div>
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border mt-0.5 ${blockCategory.color}`}>
              {blockCategory.label}
            </span>
          </div>

          {/* Compactness */}
          <div className="bg-emerald-950/40 border border-emerald-500/15 rounded-xl p-1.5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[9px] text-emerald-300/80 font-bold uppercase tracking-wider">
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>{lang === "id" ? "Kekompakan Vertikal" : "Compactness"}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm sm:text-base font-black text-white">{compactnessMeters.toFixed(1)}</span>
              <span className="text-[10px] text-emerald-400 font-bold">m</span>
            </div>
            <span className={`text-[8px] font-bold mt-0.5 ${compactnessStatus.color}`}>
              {compactnessStatus.text}
            </span>
          </div>

          {/* Width */}
          <div className="bg-emerald-950/40 border border-emerald-500/15 rounded-xl p-1.5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[9px] text-emerald-300/80 font-bold uppercase tracking-wider">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>{lang === "id" ? "Lebar Bentangan" : "Team Width"}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm sm:text-base font-black text-white">{teamWidthMeters.toFixed(1)}</span>
              <span className="text-[10px] text-emerald-400 font-bold">m</span>
            </div>
            <span className="text-[8px] text-gray-400 font-medium mt-0.5">
              {((teamWidthMeters / pitchWidthMeters) * 100).toFixed(0)}% {lang === "id" ? "area" : "coverage"}
            </span>
          </div>
        </div>

        {/* Row 2: Tactical Phase Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="text-[9px] font-black uppercase text-emerald-400/90 tracking-widest shrink-0 mr-1 flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-400" />
            <span>FASE:</span>
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {phases.map((p) => {
              const isActive = tacticalPhase === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSetTacticalPhase(p.id)}
                  className={`px-2 py-1 rounded-lg text-[9.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 scale-102"
                      : "bg-emerald-950/30 text-gray-300 hover:text-white hover:bg-emerald-900/40 border border-emerald-500/10"
                  }`}
                  title={lang === "id" ? p.labelId : p.labelEn}
                >
                  <span className="text-xs">{p.icon}</span>
                  <span>{lang === "id" ? p.labelId : p.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Tactical Overlays & Tools Bar */}
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-emerald-500/15">
          {/* Tactical Overlay Mode Switcher */}
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-emerald-500/15">
            <span className="text-[9px] font-black uppercase text-gray-400 px-1.5 hidden sm:inline">
              {lang === "id" ? "OVERLAY:" : "GRID:"}
            </span>
            {[
              { id: "none" as TacticalOverlayMode, label: lang === "id" ? "Polos" : "Clean" },
              { id: "18-zones" as TacticalOverlayMode, label: "18-Zones" },
              { id: "corridors" as TacticalOverlayMode, label: "5 Corridors" },
              { id: "pressing-blocks" as TacticalOverlayMode, label: lang === "id" ? "Blok Taktis" : "Blocks" }
            ].map((mode) => {
              const isSelected = tacticalOverlay === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onSetTacticalOverlay(mode.id)}
                  className={`px-2 py-0.8 rounded-lg text-[9.5px] font-black transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500 text-black shadow-sm font-extrabold"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Quick Action Tools: Laser Measurement & Matchday Sheet Export */}
          <div className="flex items-center gap-1.5">
            {/* Measure Tool */}
            <button
              onClick={onToggleMeasureMode}
              className={`px-2 py-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                isMeasureMode
                  ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse"
                  : "bg-emerald-950/30 border-emerald-500/20 text-gray-300 hover:text-white hover:bg-emerald-900/30"
              }`}
              title={lang === "id" ? "Ukur Jarak & Sudut Passing Antar Pemain" : "Measure Distance & Pass Angle"}
            >
              <Ruler className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">{lang === "id" ? "Ukur Jarak" : "Measure"}</span>
            </button>

            {/* Match Briefing Sheet */}
            <button
              onClick={onOpenMatchSheet}
              className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black border border-emerald-400/50 shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title={lang === "id" ? "Buka Lembar Taktik Pertandingan (UEFA Pro Briefing)" : "Open Matchday Tactical Sheet"}
            >
              <FileText className="w-3 h-3 text-black" />
              <span>{lang === "id" ? "Briefing Taktik" : "Match Sheet"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
