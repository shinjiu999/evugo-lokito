import React from "react";
import { AndroidActiveTab } from "../types";
import { soundManager } from "../utils/sound";
import { NanoBananaLogo, NanoToolId, ToolHoverTooltip } from "./NanoBananaToolIcon";

interface AndroidBottomNavProps {
  activeTab: AndroidActiveTab;
  onChangeTab: (tab: AndroidActiveTab) => void;
  onOpenSettings: () => void;
  lang: "id" | "en";
}

export default function AndroidBottomNav({
  activeTab,
  onChangeTab,
  onOpenSettings,
  lang,
}: AndroidBottomNavProps) {
  const navItems: {
    key: AndroidActiveTab;
    label: string;
    category: string;
    tool: NanoToolId;
  }[] = [
    {
      key: "pitch",
      category: lang === "id" ? "ARENA UTAMA" : "MAIN ARENA",
      label: lang === "id" ? "Papan Taktik Lapangan" : "Tactical Pitch Board",
      tool: "formation",
    },
    {
      key: "corner",
      category: "SET-PIECE",
      label: lang === "id" ? "Simulasi Situasi Corner Kick" : "Corner Kick Simulator",
      tool: "corner_sim",
    },
    {
      key: "squad",
      category: lang === "id" ? "TIM & PEMAIN" : "TEAM & SQUAD",
      label: lang === "id" ? "Manajemen Skuad & Nomor" : "Squad & Roster Manager",
      tool: "squad",
    },
    {
      key: "animation",
      category: "TIMELINE",
      label: lang === "id" ? "Animasi & Latihan Taktis" : "Animation & Tactical Drills",
      tool: "animation",
    },
    {
      key: "ai",
      category: "GEMINI AI",
      label: lang === "id" ? "Pelatih Taktik AI & Studio" : "AI Tactical Coach & Studio",
      tool: "ai_coach",
    },
  ];

  return (
    <nav
      aria-label={lang === "id" ? "Navigasi Bawah HP & Tablet" : "Mobile & Tablet Bottom Navigation"}
      className="shrink-0 w-full z-50 bg-[#051419]/95 backdrop-blur-xl border-t border-teal-400/20 px-2 sm:px-4 py-1 sm:py-1.5 shadow-[0_-8px_30px_rgba(2,10,14,0.75)] select-none"
    >
      <div className="grid grid-cols-6 items-center max-w-3xl mx-auto gap-1.5 sm:gap-2">
        {navItems.map((item, idx) => {
          const isActive = activeTab === item.key;
          const shortLabel =
            item.key === "pitch"
              ? lang === "id" ? "Lapangan" : "Pitch"
              : item.key === "corner"
              ? "Corner"
              : item.key === "squad"
              ? lang === "id" ? "Klub/Tim" : "Club"
              : item.key === "animation"
              ? lang === "id" ? "Animasi" : "Anim"
              : "AI Coach";
          return (
            <div key={item.key} className="relative group flex justify-center">
              <button
                type="button"
                onClick={() => {
                  onChangeTab(item.key);
                  soundManager.playClick();
                }}
                className={`w-full h-9.5 sm:h-10 px-1 sm:px-2 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 rounded-xl transition-all duration-150 cursor-pointer relative ${
                  isActive
                    ? "bg-teal-400 text-slate-950 shadow-[0_0_12px_rgba(45,212,191,0.35)] font-black"
                    : "bg-[#071c22]/80 hover:bg-white/10 text-teal-100/80 border border-teal-400/15"
                }`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-teal-300" />
                )}
                <NanoBananaLogo tool={item.tool} size="sm" active={isActive} />
                <span className="text-[8px] sm:text-[9.5px] font-extrabold uppercase tracking-tight leading-none truncate max-w-full">
                  {shortLabel}
                </span>
              </button>
              <ToolHoverTooltip
                category={item.category}
                title={item.label}
                badge={isActive ? (lang === "id" ? "AKTIF" : "ACTIVE") : undefined}
                align={idx === 0 ? "left" : "center"}
              />
            </div>
          );
        })}

        {/* Settings Button */}
        <div className="relative group flex justify-center">
          <button
            type="button"
            onClick={() => {
              onOpenSettings();
              soundManager.playClick();
            }}
            className="w-full h-9.5 sm:h-10 px-1 sm:px-2 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 rounded-xl transition-all duration-150 cursor-pointer bg-[#071c22]/80 hover:bg-white/10 text-teal-100/80 border border-teal-400/15"
            aria-label={lang === "id" ? "Pengaturan" : "Settings"}
          >
            <NanoBananaLogo tool="settings" size="sm" />
            <span className="text-[8px] sm:text-[9.5px] font-extrabold uppercase tracking-tight leading-none truncate">
              {lang === "id" ? "Setelan" : "Config"}
            </span>
          </button>
          <ToolHoverTooltip
            category={lang === "id" ? "SISTEM" : "SYSTEM"}
            title={lang === "id" ? "Pengaturan Tampilan & AI" : "Display & AI Settings"}
            align="right"
          />
        </div>
      </div>
    </nav>
  );
}
