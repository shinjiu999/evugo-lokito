import React from "react";
import { 
  Shield, 
  Activity, 
  Compass, 
  Target, 
  FileText, 
  Ruler,
  Flag
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
  onOpenCornerStudio?: () => void;
  lang: "id" | "en";
}

export default function TacticalTelemetryHUD({
  players,
  sportMode,
  tacticalOverlay,
  onSetTacticalOverlay,
  tacticalPhase,
  onSetTacticalPhase,
  isMeasureMode,
  onToggleMeasureMode,
  onOpenMatchSheet,
  onOpenCornerStudio,
  lang
}: TacticalTelemetryHUDProps) {
  const starters = players.filter((p) => p.isStarting);
  const outfieldPlayers = starters.filter((p) => p.role !== "GK");

  // Pitch dimensions (standard soccer: 105m x 68m; futsal: 40m x 20m; minisoccer: 70m x 45m)
  const pitchLengthMeters = sportMode === "futsal" ? 40 : sportMode === "minisoccer" ? 70 : 105;
  const pitchWidthMeters = sportMode === "futsal" ? 20 : sportMode === "minisoccer" ? 45 : 68;

  let defensiveLineY = 85;
  let highestAttackerY = 25;
  let leftmostX = 50;
  let rightmostX = 50;

  if (outfieldPlayers.length > 0) {
    const defenders = outfieldPlayers.filter((p) => p.role === "DEF");
    const yValuesDef = defenders.length > 0 ? defenders.map((p) => p.y) : outfieldPlayers.map((p) => p.y);
    defensiveLineY = Math.max(...yValuesDef);

    const yValuesAll = outfieldPlayers.map((p) => p.y);
    highestAttackerY = Math.min(...yValuesAll);

    const xValues = outfieldPlayers.map((p) => p.x);
    leftmostX = Math.min(...xValues);
    rightmostX = Math.max(...xValues);
  }

  const defensiveLineMeters = Math.max(0, ((100 - defensiveLineY) / 100) * pitchLengthMeters);
  const compactnessMeters = Math.max(0, ((defensiveLineY - highestAttackerY) / 100) * pitchLengthMeters);
  const teamWidthMeters = Math.max(0, ((rightmostX - leftmostX) / 100) * pitchWidthMeters);

  const blockCategory =
    defensiveLineMeters < (pitchLengthMeters * 0.28)
      ? { label: lang === "id" ? "Blok Rendah" : "Low Block", color: "text-teal-300" }
      : defensiveLineMeters < (pitchLengthMeters * 0.45)
      ? { label: lang === "id" ? "Blok Menengah" : "Mid Block", color: "text-emerald-300" }
      : { label: lang === "id" ? "Garis Tinggi" : "High Line", color: "text-amber-300" };

  const compactnessStatus =
    compactnessMeters <= 36
      ? { text: lang === "id" ? "Kompak Ideal" : "Optimal Compact", color: "text-teal-300" }
      : compactnessMeters <= 46
      ? { text: lang === "id" ? "Cukup Rapat" : "Moderate Spread", color: "text-amber-300" }
      : { text: lang === "id" ? "Renggang" : "Stretched", color: "text-rose-300" };

  const phases: { id: TacticalPhase; labelId: string; labelEn: string }[] = [
    { id: "build-up", labelId: "Build-Up", labelEn: "Build-Up" },
    { id: "progression", labelId: "Progresi", labelEn: "Progression" },
    { id: "final-third", labelId: "Sepertiga Akhir", labelEn: "Final 3rd" },
    { id: "high-press", labelId: "High Press", labelEn: "High Press" },
    { id: "mid-block", labelId: "Mid Block", labelEn: "Mid Block" },
    { id: "low-block", labelId: "Low Block", labelEn: "Low Block" },
    { id: "counter-attack", labelId: "Transisi Cepat", labelEn: "Counter" },
    { id: "set-piece", labelId: "Corner / Set-Piece", labelEn: "Corner / Set-Piece" }
  ];

  return (
    <div className="w-full max-w-[580px] flex flex-col gap-2 select-none">
      {/* Soft Sporty Tosca Telemetry Container */}
      <div className="w-full bg-[#071c22]/90 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_28px_rgba(3,12,16,0.55)] flex flex-col gap-2.5">
        
        {/* Row 1: Live Match Telemetry Stats (Tabular Numerals, Clean Unboxed Metadata) */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Def Line */}
          <div className="bg-[#0a252d]/80 border border-teal-400/15 rounded-xl p-2 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[10px] text-teal-200/80 font-semibold">
              <Shield className="w-3 h-3 text-teal-400" />
              <span>{lang === "id" ? "Garis Bek" : "Def Line"}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5 font-mono tabular-nums">
              <span className="text-sm sm:text-base font-bold text-white">{defensiveLineMeters.toFixed(1)}</span>
              <span className="text-[10px] text-teal-400 font-semibold">m</span>
            </div>
            <span className={`text-[10px] font-medium mt-0.5 ${blockCategory.color}`}>
              {blockCategory.label}
            </span>
          </div>

          {/* Compactness */}
          <div className="bg-[#0a252d]/80 border border-teal-400/15 rounded-xl p-2 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[10px] text-teal-200/80 font-semibold">
              <Compass className="w-3 h-3 text-teal-400" />
              <span>{lang === "id" ? "Kerapatan" : "Compactness"}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5 font-mono tabular-nums">
              <span className="text-sm sm:text-base font-bold text-white">{compactnessMeters.toFixed(1)}</span>
              <span className="text-[10px] text-teal-400 font-semibold">m</span>
            </div>
            <span className={`text-[10px] font-medium mt-0.5 ${compactnessStatus.color}`}>
              {compactnessStatus.text}
            </span>
          </div>

          {/* Width */}
          <div className="bg-[#0a252d]/80 border border-teal-400/15 rounded-xl p-2 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[10px] text-teal-200/80 font-semibold">
              <Activity className="w-3 h-3 text-teal-400" />
              <span>{lang === "id" ? "Lebar Tim" : "Team Width"}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5 font-mono tabular-nums">
              <span className="text-sm sm:text-base font-bold text-white">{teamWidthMeters.toFixed(1)}</span>
              <span className="text-[10px] text-teal-400 font-semibold">m</span>
            </div>
            <span className="text-[10px] text-teal-100/60 font-mono tabular-nums mt-0.5">
              {((teamWidthMeters / pitchWidthMeters) * 100).toFixed(0)}% {lang === "id" ? "lebar" : "width"}
            </span>
          </div>
        </div>

        {/* Row 2: Tactical Phase Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="text-[10px] font-bold text-teal-300 shrink-0 mr-1 flex items-center gap-1">
            <Target className="w-3 h-3 text-teal-400" />
            <span>{lang === "id" ? "Fase:" : "Phase:"}</span>
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {phases.map((p) => {
              const isActive = tacticalPhase === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onSetTacticalPhase(p.id);
                    if (p.id === "set-piece" && onOpenCornerStudio) {
                      onSetTacticalOverlay("corner-zones");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                      : "bg-[#0a252d]/60 text-teal-100/75 hover:text-white hover:bg-[#0d303a] border border-teal-400/10"
                  }`}
                >
                  <span>{lang === "id" ? p.labelId : p.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Tactical Overlays & Quick Tools Bar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-teal-400/15">
          {/* Tactical Overlay Mode Switcher */}
          <div className="flex items-center gap-0.5 bg-[#041115] p-0.5 rounded-xl border border-teal-400/15 overflow-x-auto">
            {[
              { id: "none" as TacticalOverlayMode, label: lang === "id" ? "Polos" : "Clean" },
              { id: "corner-zones" as TacticalOverlayMode, label: lang === "id" ? "Zona Corner" : "Corner Zones" },
              { id: "18-zones" as TacticalOverlayMode, label: "18-Zones" },
              { id: "corridors" as TacticalOverlayMode, label: "5 Corridors" },
              { id: "pressing-blocks" as TacticalOverlayMode, label: lang === "id" ? "Blok" : "Blocks" }
            ].map((mode) => {
              const isSelected = tacticalOverlay === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onSetTacticalOverlay(mode.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                      : "text-teal-100/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Quick Action Tools: Corner Studio, Laser Measure & Match Sheet */}
          <div className="flex items-center gap-1.5">
            {onOpenCornerStudio && (
              <button
                onClick={onOpenCornerStudio}
                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/40 transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap"
                title={lang === "id" ? "Buka Studio Simulasi Corner Kick" : "Open Corner Kick Simulation Studio"}
              >
                <Flag className="w-3 h-3 text-teal-300" />
                <span>{lang === "id" ? "Corner Kick" : "Corner Sim"}</span>
              </button>
            )}

            <button
              onClick={onToggleMeasureMode}
              className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap ${
                isMeasureMode
                  ? "bg-amber-500/25 border-amber-400 text-amber-200"
                  : "bg-[#0a252d]/60 border-teal-400/20 text-teal-100/80 hover:text-white hover:bg-[#0d303a]"
              }`}
              title={lang === "id" ? "Ukur Jarak & Sudut Umpan" : "Measure Pass Distance & Angle"}
            >
              <Ruler className="w-3 h-3 text-teal-300" />
              <span className="hidden sm:inline">{lang === "id" ? "Ukur" : "Measure"}</span>
            </button>

            <button
              onClick={onOpenMatchSheet}
              className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap shadow-sm"
              title={lang === "id" ? "Buka Lembar Taktik Pertandingan" : "Open Matchday Tactical Sheet"}
            >
              <FileText className="w-3 h-3 text-slate-950" />
              <span>{lang === "id" ? "Briefing" : "Sheet"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
