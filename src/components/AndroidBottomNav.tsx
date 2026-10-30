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
      aria-label={lang === "id" ? "Navigasi Bawah Android" : "Android Bottom Navigation"}
      className="sticky bottom-0 left-0 right-0 z-50 bg-[#051419]/95 backdrop-blur-xl border-t border-teal-400/20 px-2 py-2 shadow-[0_-8px_30px_rgba(2,10,14,0.75)] select-none"
    >
      <div className="grid grid-cols-6 items-center max-w-xl mx-auto gap-1.5">
        {navItems.map((item, idx) => {
          const isActive = activeTab === item.key;
          return (
            <div key={item.key} className="relative group flex justify-center">
              <button
                type="button"
                onClick={() => {
                  onChangeTab(item.key);
                  soundManager.playClick();
                }}
                className={`w-full h-11 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer relative ${
                  isActive
                    ? "bg-teal-400 text-slate-950 shadow-[0_0_12px_rgba(45,212,191,0.35)]"
                    : "bg-[#071c22]/80 hover:bg-white/10 border border-teal-400/15"
                }`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-teal-300" />
                )}
                <NanoBananaLogo tool={item.tool} size="md" active={isActive} />
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

        {/* Settings Logo-Only Button */}
        <div className="relative group flex justify-center">
          <button
            type="button"
            onClick={() => {
              onOpenSettings();
              soundManager.playClick();
            }}
            className="w-full h-11 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer bg-[#071c22]/80 hover:bg-white/10 border border-teal-400/15"
            aria-label={lang === "id" ? "Pengaturan" : "Settings"}
          >
            <NanoBananaLogo tool="settings" size="md" />
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
