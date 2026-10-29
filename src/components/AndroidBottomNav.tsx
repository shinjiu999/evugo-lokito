import React from "react";
import { LayoutGrid, Flag, Users, Film, Sparkles, Settings } from "lucide-react";
import { AndroidActiveTab } from "../types";
import { soundManager } from "../utils/sound";

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
    icon: React.ReactNode;
  }[] = [
    {
      key: "pitch",
      label: lang === "id" ? "Lapangan" : "Pitch",
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      key: "corner",
      label: lang === "id" ? "Corner Kick" : "Corner",
      icon: <Flag className="w-5 h-5" />,
    },
    {
      key: "squad",
      label: lang === "id" ? "Skuad" : "Squad",
      icon: <Users className="w-5 h-5" />,
    },
    {
      key: "animation",
      label: lang === "id" ? "Animasi" : "Timeline",
      icon: <Film className="w-5 h-5" />,
    },
    {
      key: "ai",
      label: "AI Coach",
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      aria-label={lang === "id" ? "Navigasi Bawah Android" : "Android Bottom Navigation"}
      className="sticky bottom-0 left-0 right-0 z-50 bg-[#051419]/95 backdrop-blur-xl border-t border-teal-400/20 px-2 py-1.5 shadow-[0_-8px_30px_rgba(2,10,14,0.75)] select-none"
    >
      <div className="grid grid-cols-6 items-center max-w-xl mx-auto gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                onChangeTab(item.key);
                soundManager.playClick();
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 cursor-pointer relative whitespace-nowrap ${
                isActive
                  ? "text-teal-300 bg-teal-500/15 font-bold"
                  : "text-teal-100/60 hover:text-white hover:bg-white/5 font-medium"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-teal-400" />
              )}
              {item.icon}
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Settings button */}
        <button
          onClick={() => {
            onOpenSettings();
            soundManager.playClick();
          }}
          className="min-h-[44px] flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 cursor-pointer text-teal-100/60 hover:text-white hover:bg-white/5 font-medium whitespace-nowrap"
          aria-label={lang === "id" ? "Pengaturan" : "Settings"}
        >
          <Settings className="w-5 h-5 text-teal-400" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {lang === "id" ? "Setelan" : "Settings"}
          </span>
        </button>
      </div>
    </nav>
  );
}
