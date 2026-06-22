import { useState } from "react";
import { TACTICAL_DRILLS_DATA, TacticalDrill } from "../data/tacticalDrills";
import { Play, Sparkles, BookOpen, Check, Target, Compass, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TacticalDrillsProps {
  onLoadDrill: (drill: TacticalDrill) => void;
  lang?: "id" | "en";
}

export default function TacticalDrills({ onLoadDrill, lang = "id" }: TacticalDrillsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "pressing" | "attack" | "defense">("all");
  const [loadedDrillId, setLoadedDrillId] = useState<string | null>(null);

  const t = {
    title: lang === "id" ? "🏋️ Latihan Taktis" : "🏋️ Tactical Drills",
    subtitle: lang === "id" ? "Muat skenario instruksi latihan standar ke linimasa" : "Instantly load standard drills & exercise systems",
    tabAll: lang === "id" ? "Semua" : "All",
    tabPressing: lang === "id" ? "Pressing" : "Pressing",
    tabAttack: lang === "id" ? "Menyerang" : "Attack",
    tabDefense: lang === "id" ? "Bertahan" : "Defense",
    loadBtn: lang === "id" ? "Muat Latihan" : "Load Exercise",
    loadedLabel: lang === "id" ? "Sudah Dimuat" : "Active & Loaded",
    sportModeLabel: lang === "id" ? "Format" : "Format",
    categoryLabel: lang === "id" ? "Skenario" : "Tactics",
    emptyList: lang === "id" ? "Skenario tidak ditemukan." : "Tactical exercises not found."
  };

  const filteredDrills = TACTICAL_DRILLS_DATA.filter((drill) => {
    if (activeTab === "all") return true;
    return drill.category === activeTab;
  });

  const handleLoad = (drill: TacticalDrill) => {
    onLoadDrill(drill);
    setLoadedDrillId(drill.id);
    // Auto-clear active label after 3 seconds for visual response
    setTimeout(() => {
      setLoadedDrillId(null);
    }, 4000);
  };

  return (
    <div className="bg-[#0b0c10]/85 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-5 flex flex-col gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:border-white/15 transition-all duration-300">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            {t.title}
          </h4>
          <span className="text-[10px] text-gray-400 font-medium leading-tight">
            {t.subtitle}
          </span>
        </div>
        <BookOpen className="w-4 h-4 text-indigo-400/70" />
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1 bg-black/45 p-1 rounded-xl border border-white/[0.04]">
        {([
          { key: "all", label: t.tabAll },
          { key: "pressing", label: t.tabPressing },
          { key: "attack", label: t.tabAttack },
          { key: "defense", label: t.tabDefense }
        ] as const).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-extrabold shadow-sm"
                  : "text-gray-400 border border-transparent hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Drills Grid / List */}
      <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredDrills.length > 0 ? (
          filteredDrills.map((drill) => {
            const isLoaded = loadedDrillId === drill.id;
            return (
              <div
                key={drill.id}
                className="group relative bg-black/35 hover:bg-black/55 border border-white/[0.04] hover:border-indigo-500/20 p-3.5 rounded-2xl flex flex-col gap-2 transition-all duration-200"
              >
                {/* Header line */}
                <div className="flex items-start gap-2.5 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg bg-white/5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-200">
                      {drill.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[11px] text-gray-100 group-hover:text-indigo-300 transition-colors">
                        {lang === "id" ? drill.title.id : drill.title.en}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {t.categoryLabel}: {drill.category}
                        </span>
                        <span className="text-[8px] tracking-wider uppercase font-black px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                          {t.sportModeLabel}: {drill.sportMode === "soccer" ? "11 vs 11" : drill.sportMode === "minisoccer" ? "7 vs 7" : "5 vs 5"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Load / Installed badge */}
                  <button
                    onClick={() => handleLoad(drill)}
                    className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer select-none border shrink-0 ${
                      isLoaded
                        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/30"
                        : "bg-indigo-600 text-white border-indigo-400/30 hover:bg-indigo-500 shadow-md active:scale-95"
                    }`}
                  >
                    {isLoaded ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400 fill-current animate-pulse" />
                        <span>{t.loadedLabel}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{t.loadBtn}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-[9.5px] leading-relaxed text-gray-450 font-medium">
                  {lang === "id" ? drill.description.id : drill.description.en}
                </p>

                {/* Mini steps list indicator */}
                <div className="flex items-center gap-2 border-t border-white/[0.04] pt-2 mt-0.5">
                  <span className="text-[8px] font-extrabold uppercase text-gray-500">
                    {lang === "id" ? "Alur Latihan" : "Phases flow"}:
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {drill.frames.map((frame, index) => (
                      <div
                        key={frame.id}
                        className="text-[8px] font-bold text-gray-400 bg-white/5 border border-white/[0.06] rounded px-1.5 py-0.5 flex items-center gap-1 hover:border-indigo-500/20 transition-all cursor-default"
                        title={frame.instruction}
                      >
                        <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                        <span>{index + 1}. {frame.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-[10px] text-gray-500 font-bold bg-black/20 rounded-xl border border-dashed border-white/5 mt-2">
            {t.emptyList}
          </div>
        )}
      </div>
    </div>
  );
}
