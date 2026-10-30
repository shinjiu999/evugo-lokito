import React from "react";
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
  tacticalOverlay,
  onSetTacticalOverlay,
  isMeasureMode,
  onToggleMeasureMode,
  onOpenMatchSheet,
  onQuickCornerKick,
  hasMultiFrames,
  onResetFrames,
  lang
}: TacticalTelemetryHUDProps) {
  const overlayTools: {
    id: TacticalOverlayMode;
    tool: NanoToolId;
    title: string;
    shortLabel: string;
    category: string;
  }[] = [
    {
      id: "none",
      tool: "overlay_clean",
      shortLabel: lang === "id" ? "Polos" : "Clean",
      category: lang === "id" ? "OVERLAY LAPANGAN" : "PITCH OVERLAY",
      title: lang === "id" ? "Lapangan Polos (Standar)" : "Clean Pitch (Standard)"
    },
    {
      id: "corner-zones",
      tool: "overlay_corner",
      shortLabel: "Corner",
      category: lang === "id" ? "ZONA SET-PIECE" : "SET-PIECE ZONES",
      title: lang === "id" ? "Zona Target Corner Kick" : "Corner Kick Target Zones"
    },
    {
      id: "18-zones",
      tool: "overlay_18z",
      shortLabel: "18Z",
      category: lang === "id" ? "GRID ANALITIK" : "ANALYTIC GRID",
      title: lang === "id" ? "Grid 18 Zona Taktis" : "18 Tactical Zones Grid"
    },
    {
      id: "corridors",
      tool: "overlay_lanes",
      shortLabel: lang === "id" ? "Koridor" : "Lanes",
      category: lang === "id" ? "JALUR VERTIKAL" : "VERTICAL LANES",
      title: lang === "id" ? "5 Koridor & Half-Space" : "5 Corridors & Half-Spaces"
    },
    {
      id: "pressing-blocks",
      tool: "overlay_block",
      shortLabel: "Blok",
      category: lang === "id" ? "BLOK PERTAHANAN" : "DEFENSIVE BLOCKS",
      title: lang === "id" ? "3 Zona Pressing (High/Mid/Low)" : "3 Pressing Block Zones"
    }
  ];

  return (
    <div className="w-full max-w-[var(--pitch-max-w,580px)] select-none z-40">
      {/* Symmetrical Single-Row Tactical Pitch Toolbar (Overlays • Quick Set-Piece • Laser & Briefing) */}
      <div
        role="toolbar"
        aria-label={lang === "id" ? "Alat visual lapangan dan simulasi cepat" : "Pitch visual overlays and quick simulation tools"}
        className="w-full bg-[#071c22]/95 backdrop-blur-xl border border-teal-400/25 rounded-2xl p-1 shadow-[0_8px_24px_rgba(3,12,16,0.45)] flex items-center justify-between gap-1 overflow-x-auto scrollbar-none"
      >
        {/* Group 1 (Left): Pitch Visual Overlay Selector (5 Symmetrical Buttons) */}
        <div className="flex items-center gap-0.5 bg-[#041115]/95 p-0.5 rounded-xl border border-teal-400/20 shrink-0">
          <span className="hidden md:inline-block pl-2 pr-1 text-[8.5px] font-black uppercase tracking-wider text-teal-300/75 select-none">
            {lang === "id" ? "Zona" : "Grid"}
          </span>
          {overlayTools.map((item) => {
            const isSelected = tacticalOverlay === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => onSetTacticalOverlay(item.id)}
                  aria-label={item.title}
                  aria-pressed={isSelected}
                  className={`h-7 px-1.5 sm:px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-teal-400 text-slate-950 shadow-[0_0_10px_rgba(45,212,191,0.35)] font-extrabold"
                      : "text-teal-100/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <NanoBananaLogo tool={item.tool} size="xs" active={isSelected} />
                  <span
                    className={`text-[8.5px] font-extrabold tracking-tight whitespace-nowrap ${
                      isSelected ? "inline" : "hidden sm:inline opacity-80"
                    }`}
                  >
                    {item.shortLabel}
                  </span>
                </button>
                <ToolHoverTooltip
                  category={item.category}
                  title={item.title}
                  badge={isSelected ? (lang === "id" ? "AKTIF" : "ACTIVE") : undefined}
                  align="left"
                />
              </div>
            );
          })}
        </div>

        {/* Group 2 (Center): Quick Corner Kick Set-Piece Routines */}
        {onQuickCornerKick && (
          <div className="flex items-center gap-0.5 bg-[#041115]/95 p-0.5 rounded-xl border border-teal-400/20 shrink-0">
            <span className="hidden xl:inline-block pl-1.5 pr-1 text-[8.5px] font-black uppercase tracking-wider text-teal-300/75 select-none">
              Corner
            </span>

            {/* Corner Left In-Swing */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => onQuickCornerKick("left", "inswing-near")}
                aria-label={lang === "id" ? "Simulasi Corner Kiri (In-Swing)" : "Left Corner Sim (In-Swing)"}
                className="h-7 px-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/25 border border-teal-400/20 hover:border-teal-400/50 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-teal-100 hover:text-white"
              >
                <NanoBananaLogo tool="corner_left" size="xs" />
                <span className="text-[8px] font-mono font-extrabold uppercase hidden md:inline">L</span>
              </button>
              <ToolHoverTooltip
                category={lang === "id" ? "CORNER CEPAT" : "QUICK CORNER"}
                title={lang === "id" ? "Corner Kiri (In-Swing Tiang Dekat)" : "Left Corner (Near-Post In-Swing)"}
              />
            </div>

            {/* Corner Right Overload */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => onQuickCornerKick("right", "outswing-far")}
                aria-label={lang === "id" ? "Simulasi Corner Kanan (Overload)" : "Right Corner Sim (Overload)"}
                className="h-7 px-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/25 border border-teal-400/20 hover:border-teal-400/50 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-teal-100 hover:text-white"
              >
                <NanoBananaLogo tool="corner_right" size="xs" />
                <span className="text-[8px] font-mono font-extrabold uppercase hidden md:inline">R</span>
              </button>
              <ToolHoverTooltip
                category={lang === "id" ? "CORNER CEPAT" : "QUICK CORNER"}
                title={lang === "id" ? "Corner Kanan (Overload Tiang Jauh)" : "Right Corner (Far-Post Overload)"}
              />
            </div>

            {/* Corner Short 2v1 Triangle */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => onQuickCornerKick("right", "short-triangle")}
                aria-label={lang === "id" ? "Simulasi Corner Pendek 2v1" : "Short 2v1 Corner Sim"}
                className="h-7 px-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/25 border border-teal-400/20 hover:border-teal-400/50 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-teal-100 hover:text-white"
              >
                <NanoBananaLogo tool="corner_short" size="xs" />
                <span className="text-[8px] font-mono font-extrabold uppercase hidden md:inline">2v1</span>
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
                  className="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/45 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  <NanoBananaLogo tool="reset" size="xs" />
                </button>
                <ToolHoverTooltip
                  category={lang === "id" ? "RESET SIMULASI" : "RESET SIM"}
                  title={lang === "id" ? "Kembali ke Posisi Formasi Normal" : "Return to Standard Formation"}
                />
              </div>
            )}
          </div>
        )}

        {/* Group 3 (Right): Tactical Laser Distance Measure & Matchday Briefing Sheet */}
        <div className="flex items-center gap-0.5 bg-[#041115]/95 p-0.5 rounded-xl border border-teal-400/20 shrink-0">
          {/* Laser Pass Distance Measure */}
          <div className="relative group">
            <button
              type="button"
              onClick={onToggleMeasureMode}
              aria-label={lang === "id" ? "Ukur Jarak & Sudut Umpan" : "Measure Pass Distance & Angle"}
              aria-pressed={isMeasureMode}
              className={`h-7 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
                isMeasureMode
                  ? "bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.4)] font-extrabold"
                  : "bg-[#06151a]/90 border-teal-400/20 text-teal-100 hover:bg-[#09222a] hover:border-teal-400/50"
              }`}
            >
              <NanoBananaLogo tool="measure" size="xs" active={isMeasureMode} />
              <span className="text-[8.5px] font-extrabold uppercase tracking-wider hidden xs:inline">
                {lang === "id" ? "Ukur" : "Laser"}
              </span>
            </button>
            <ToolHoverTooltip
              category={lang === "id" ? "LASER TAKTIS" : "TACTICAL LASER"}
              title={lang === "id" ? "Ukur Jarak & Sudut Umpan Antar Pemain" : "Measure Pass Distance & Angle"}
              badge={isMeasureMode ? "ON" : undefined}
              align="right"
            />
          </div>

          {/* Matchday Briefing Sheet */}
          <div className="relative group">
            <button
              type="button"
              onClick={onOpenMatchSheet}
              aria-label={lang === "id" ? "Buka Lembar Briefing Taktik" : "Open Matchday Tactical Sheet"}
              className="h-7 px-2 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-sm"
            >
              <NanoBananaLogo tool="briefing" size="xs" active={true} />
              <span className="text-[8.5px] font-extrabold uppercase tracking-wider hidden xs:inline">
                Briefing
              </span>
            </button>
            <ToolHoverTooltip
              category={lang === "id" ? "DOKUMEN LAGA" : "MATCH SHEET"}
              title={lang === "id" ? "Lembar Briefing Taktik Pertandingan" : "Matchday Tactical Briefing Sheet"}
              align="right"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

