import React, { useState } from "react";
import {
  Shield,
  Activity,
  Compass,
  Target,
  ChevronDown
} from "lucide-react";
import { Player, TacticalItem, TacticalOverlayMode, TacticalPhase } from "../types";
import { NanoBananaLogo, NanoToolId, ToolHoverTooltip } from "./NanoBananaToolIcon";

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
  onQuickCornerKick?: (side: "left" | "right", routine: "inswing-near" | "outswing-far" | "short-triangle") => void;
  hasMultiFrames?: boolean;
  onResetFrames?: () => void;
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
  onQuickCornerKick,
  hasMultiFrames,
  onResetFrames,
  lang
}: TacticalTelemetryHUDProps) {
  const [showExpandedDetails, setShowExpandedDetails] = useState(false);

  const starters = players.filter((p) => p.isStarting);
  const outfieldPlayers = starters.filter((p) => p.role !== "GK");

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
    defensiveLineMeters < pitchLengthMeters * 0.28
      ? { label: lang === "id" ? "Blok Rendah" : "Low Block", color: "text-teal-300" }
      : defensiveLineMeters < pitchLengthMeters * 0.45
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

  const overlayTools: {
    id: TacticalOverlayMode;
    tool: NanoToolId;
    title: string;
    category: string;
  }[] = [
    {
      id: "none",
      tool: "overlay_clean",
      category: lang === "id" ? "OVERLAY LAPANGAN" : "PITCH OVERLAY",
      title: lang === "id" ? "Lapangan Polos (Standar)" : "Clean Pitch (Standard)"
    },
    {
      id: "corner-zones",
      tool: "overlay_corner",
      category: lang === "id" ? "ZONA SET-PIECE" : "SET-PIECE ZONES",
      title: lang === "id" ? "Zona Target Corner Kick" : "Corner Kick Target Zones"
    },
    {
      id: "18-zones",
      tool: "overlay_18z",
      category: lang === "id" ? "GRID ANALITIK" : "ANALYTIC GRID",
      title: lang === "id" ? "Grid 18 Zona Taktis" : "18 Tactical Zones Grid"
    },
    {
      id: "corridors",
      tool: "overlay_lanes",
      category: lang === "id" ? "JALUR VERTIKAL" : "VERTICAL LANES",
      title: lang === "id" ? "5 Koridor & Half-Space" : "5 Corridors & Half-Spaces"
    },
    {
      id: "pressing-blocks",
      tool: "overlay_block",
      category: lang === "id" ? "BLOK PERTAHANAN" : "DEFENSIVE BLOCKS",
      title: lang === "id" ? "3 Zona Pressing (High/Mid/Low)" : "3 Pressing Block Zones"
    }
  ];

  return (
    <div className="w-full max-w-[var(--pitch-max-w,580px)] flex flex-col gap-1 select-none z-40">
      {/* Unified Logo-Only Telemetry & Tactical Tool Dock (Hover reveals text above each tool) */}
      <div className="w-full bg-[#071c22]/95 backdrop-blur-xl border border-teal-400/20 rounded-2xl px-2 py-1 shadow-[0_8px_24px_rgba(3,12,16,0.45)] flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          {/* Left: Compact Icon + Number Telemetry Pill (No text words; hover shows explanation above) */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setShowExpandedDetails(!showExpandedDetails)}
              className="h-8 px-2.5 rounded-xl bg-[#041217]/90 hover:bg-[#08222a] border border-teal-400/25 hover:border-teal-400/55 transition-all cursor-pointer flex items-center gap-2"
              aria-label={lang === "id" ? "Telemetri Lini & Fase Taktis" : "Line Telemetry & Tactical Phases"}
            >
              <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums">
                <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-bold text-white">{defensiveLineMeters.toFixed(0)}m</span>
              </div>

              <span className="w-px h-3 bg-teal-400/20" />

              <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums">
                <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold text-white">{compactnessMeters.toFixed(0)}m</span>
              </div>

              <span className="w-px h-3 bg-teal-400/20" />

              <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums">
                <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-bold text-white">{teamWidthMeters.toFixed(0)}m</span>
              </div>

              <ChevronDown
                className={`w-3 h-3 text-teal-300 transition-transform duration-200 ${
                  showExpandedDetails ? "rotate-180" : ""
                }`}
              />
            </button>

            <ToolHoverTooltip
              category={lang === "id" ? "TELEMETRI LINI LIVE" : "LIVE LINE TELEMETRY"}
              title={
                lang === "id"
                  ? `Garis Bek ${defensiveLineMeters.toFixed(0)}m • Rapat ${compactnessMeters.toFixed(0)}m • Lebar ${teamWidthMeters.toFixed(0)}m`
                  : `Def Line ${defensiveLineMeters.toFixed(0)}m • Compact ${compactnessMeters.toFixed(0)}m • Width ${teamWidthMeters.toFixed(0)}m`
              }
              badge={blockCategory.label}
              align="left"
            />
          </div>

          {/* Center: 5 Logo-Only Overlay Mode Tools */}
          <div className="flex items-center gap-1 bg-[#041115] p-1 rounded-xl border border-teal-400/15">
            {overlayTools.map((item) => {
              const isSelected = tacticalOverlay === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => onSetTacticalOverlay(item.id)}
                    aria-label={item.title}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-teal-400 text-slate-950 shadow-[0_0_10px_rgba(45,212,191,0.4)]"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <NanoBananaLogo tool={item.tool} size="sm" active={isSelected} />
                  </button>
                  <ToolHoverTooltip
                    category={item.category}
                    title={item.title}
                    badge={isSelected ? (lang === "id" ? "AKTIF" : "ACTIVE") : undefined}
                  />
                </div>
              );
            })}
          </div>

          {/* Right: Quick Corner Logos + Laser Measure Logo + Briefing Logo + Phase Toggle Logo */}
          <div className="flex items-center gap-1">
            {onQuickCornerKick && (
              <div className="flex items-center gap-1 bg-[#041115] p-1 rounded-xl border border-teal-400/15">
                {/* Corner Left In-Swing Logo Button */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => onQuickCornerKick("left", "inswing-near")}
                    aria-label={lang === "id" ? "Simulasi Corner Kiri (In-Swing)" : "Left Corner Sim (In-Swing)"}
                    className="w-7 h-7 rounded-lg bg-teal-500/10 hover:bg-teal-500/25 border border-teal-400/25 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    <NanoBananaLogo tool="corner_left" size="sm" />
                  </button>
                  <ToolHoverTooltip
                    category={lang === "id" ? "CORNER CEPAT" : "QUICK CORNER"}
                    title={lang === "id" ? "Corner Kiri (In-Swing Tiang Dekat)" : "Left Corner (Near-Post In-Swing)"}
                  />
                </div>

                {/* Corner Right Overload Logo Button */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => onQuickCornerKick("right", "outswing-far")}
                    aria-label={lang === "id" ? "Simulasi Corner Kanan (Overload)" : "Right Corner Sim (Overload)"}
                    className="w-7 h-7 rounded-lg bg-teal-500/10 hover:bg-teal-500/25 border border-teal-400/25 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    <NanoBananaLogo tool="corner_right" size="sm" />
                  </button>
                  <ToolHoverTooltip
                    category={lang === "id" ? "CORNER CEPAT" : "QUICK CORNER"}
                    title={lang === "id" ? "Corner Kanan (Overload Tiang Jauh)" : "Right Corner (Far-Post Overload)"}
                  />
                </div>

                {/* Corner Short 2v1 Triangle Logo Button */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => onQuickCornerKick("right", "short-triangle")}
                    aria-label={lang === "id" ? "Simulasi Corner Pendek 2v1" : "Short 2v1 Corner Sim"}
                    className="w-7 h-7 rounded-lg bg-teal-500/10 hover:bg-teal-500/25 border border-teal-400/25 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    <NanoBananaLogo tool="corner_short" size="sm" />
                  </button>
                  <ToolHoverTooltip
                    category={lang === "id" ? "CORNER CEPAT" : "QUICK CORNER"}
                    title={lang === "id" ? "Corner Pendek Segitiga 2v1" : "Short 2v1 Triangle Corner"}
                  />
                </div>

                {hasMultiFrames && onResetFrames && (
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={onResetFrames}
                      aria-label={lang === "id" ? "Reset ke Formasi Normal" : "Reset to Standard Lineup"}
                      className="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      <NanoBananaLogo tool="reset" size="sm" />
                    </button>
                    <ToolHoverTooltip
                      category={lang === "id" ? "RESET SIMULASI" : "RESET SIM"}
                      title={lang === "id" ? "Kembali ke Posisi Formasi Normal" : "Return to Standard Formation"}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Laser Pass Distance Measure Logo Button */}
            <div className="relative group">
              <button
                type="button"
                onClick={onToggleMeasureMode}
                aria-label={lang === "id" ? "Ukur Jarak & Sudut Umpan" : "Measure Pass Distance & Angle"}
                className={`w-8 h-8 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                  isMeasureMode
                    ? "bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                    : "bg-[#041217]/90 border-teal-400/25 hover:bg-[#08222a] hover:border-teal-400/55"
                }`}
              >
                <NanoBananaLogo tool="measure" size="sm" active={isMeasureMode} />
              </button>
              <ToolHoverTooltip
                category={lang === "id" ? "LASER TAKTIS" : "TACTICAL LASER"}
                title={lang === "id" ? "Ukur Jarak & Sudut Umpan" : "Measure Pass Distance & Angle"}
                badge={isMeasureMode ? "ON" : undefined}
              />
            </div>

            {/* Matchday Briefing Sheet Logo Button */}
            <div className="relative group">
              <button
                type="button"
                onClick={onOpenMatchSheet}
                aria-label={lang === "id" ? "Buka Lembar Briefing Taktik" : "Open Matchday Tactical Sheet"}
                className="w-8 h-8 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-sm"
              >
                <NanoBananaLogo tool="briefing" size="sm" active={true} />
              </button>
              <ToolHoverTooltip
                category={lang === "id" ? "DOKUMEN LAGA" : "MATCH SHEET"}
                title={lang === "id" ? "Lembar Briefing Taktik Pertandingan" : "Matchday Tactical Briefing Sheet"}
                align="right"
              />
            </div>

            {/* Expand Phases & Telemetry Stats Logo Button */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setShowExpandedDetails(!showExpandedDetails)}
                aria-label={lang === "id" ? "Panel Fase & Statistik Telemetri" : "Phases & Telemetry Panel"}
                className={`w-8 h-8 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                  showExpandedDetails
                    ? "bg-teal-400 text-slate-950 border-teal-300"
                    : "bg-[#041217]/90 border-teal-400/25 hover:bg-[#08222a] hover:border-teal-400/55"
                }`}
              >
                <NanoBananaLogo tool="telemetry" size="sm" active={showExpandedDetails} />
              </button>
              <ToolHoverTooltip
                category={lang === "id" ? "ANALISIS" : "ANALYTICS"}
                title={lang === "id" ? "Detail Fase Permainan & Telemetri" : "Game Phases & Telemetry Details"}
                align="right"
              />
            </div>
          </div>
        </div>

        {/* Collapsible Expanded Details: Full 3-Card Telemetry & Tactical Phase Switcher */}
        {showExpandedDetails && (
          <div className="flex flex-col gap-2 pt-2 border-t border-teal-400/15 animate-fadeIn">
            {/* 3 Telemetry Cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0a252d]/85 border border-teal-400/15 rounded-xl p-2 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[10px] text-teal-200/80 font-semibold">
                  <Shield className="w-3 h-3 text-teal-400" />
                  <span>{lang === "id" ? "Garis Bek" : "Def Line"}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5 font-mono tabular-nums">
                  <span className="text-sm font-bold text-white">{defensiveLineMeters.toFixed(1)}</span>
                  <span className="text-[10px] text-teal-400 font-semibold">m</span>
                </div>
                <span className={`text-[9.5px] font-semibold mt-0.5 ${blockCategory.color}`}>
                  {blockCategory.label}
                </span>
              </div>

              <div className="bg-[#0a252d]/85 border border-teal-400/15 rounded-xl p-2 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[10px] text-teal-200/80 font-semibold">
                  <Compass className="w-3 h-3 text-teal-400" />
                  <span>{lang === "id" ? "Kerapatan" : "Compactness"}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5 font-mono tabular-nums">
                  <span className="text-sm font-bold text-white">{compactnessMeters.toFixed(1)}</span>
                  <span className="text-[10px] text-teal-400 font-semibold">m</span>
                </div>
                <span className={`text-[9.5px] font-semibold mt-0.5 ${compactnessStatus.color}`}>
                  {compactnessStatus.text}
                </span>
              </div>

              <div className="bg-[#0a252d]/85 border border-teal-400/15 rounded-xl p-2 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[10px] text-teal-200/80 font-semibold">
                  <Activity className="w-3 h-3 text-teal-400" />
                  <span>{lang === "id" ? "Lebar Tim" : "Team Width"}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5 font-mono tabular-nums">
                  <span className="text-sm font-bold text-white">{teamWidthMeters.toFixed(1)}</span>
                  <span className="text-[10px] text-teal-400 font-semibold">m</span>
                </div>
                <span className="text-[9.5px] text-teal-100/65 font-mono tabular-nums mt-0.5">
                  {((teamWidthMeters / pitchWidthMeters) * 100).toFixed(0)}% {lang === "id" ? "lebar" : "width"}
                </span>
              </div>
            </div>

            {/* Tactical Phase Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[10px] font-bold text-teal-300 shrink-0 mr-1 flex items-center gap-1">
                <Target className="w-3 h-3 text-teal-400" />
                <span>{lang === "id" ? "Fase Taktis:" : "Phase:"}</span>
              </span>

              {phases.map((p) => {
                const isSelected = tacticalPhase === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSetTacticalPhase(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? "bg-teal-400/20 border-teal-400 text-teal-200 shadow-sm"
                        : "bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.07]"
                    }`}
                  >
                    <span>{lang === "id" ? p.labelId : p.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
