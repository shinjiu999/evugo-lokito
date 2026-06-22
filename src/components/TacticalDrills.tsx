import { useState } from "react";
import { TACTICAL_DRILLS_DATA, TacticalDrill } from "../data/tacticalDrills";
import { Play, Sparkles, BookOpen, Check, Target, Compass, Zap, X, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TacticalDrillsProps {
  onLoadDrill: (drill: TacticalDrill) => void;
  currentFrames?: any[]; // AnimationFrame[] from App.tsx
  currentSportMode?: "soccer" | "minisoccer" | "futsal" | "custom";
  lang?: "id" | "en";
}

export default function TacticalDrills({ 
  onLoadDrill, 
  currentFrames = [], 
  currentSportMode = "soccer", 
  lang = "id" 
}: TacticalDrillsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "pressing" | "attack" | "defense" | "custom">("all");
  const [loadedDrillId, setLoadedDrillId] = useState<string | null>(null);
  const [selectedDrill, setSelectedDrill] = useState<TacticalDrill | null>(null);

  // Load Custom Drills State from LocalStorage
  const [customDrills, setCustomDrills] = useState<TacticalDrill[]>(() => {
    try {
      const saved = localStorage.getItem("custom_tactical_drills");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed loading custom drills from localStorage:", e);
      return [];
    }
  });

  // Saving Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDrillTitle, setNewDrillTitle] = useState("");
  const [newDrillDescription, setNewDrillDescription] = useState("");
  const [newDrillCategory, setNewDrillCategory] = useState<"pressing" | "attack" | "defense">("attack");
  const [newDrillIcon, setNewDrillIcon] = useState("📋");

  const t = {
    title: lang === "id" ? "🏋️ Latihan & Taktis" : "🏋️ Exercises & Tactics",
    subtitle: lang === "id" ? "Muat skenario latihan standar atau simpan skenario kustom Anda" : "Load standard pitch exercises or save your custom tactics",
    tabAll: lang === "id" ? "Semua" : "All",
    tabPressing: lang === "id" ? "Pressing" : "Pressing",
    tabAttack: lang === "id" ? "Menyerang" : "Attack",
    tabDefense: lang === "id" ? "Bertahan" : "Defense",
    tabCustom: lang === "id" ? "Kustom ⭐" : "Custom ⭐",
    loadBtn: lang === "id" ? "Muat" : "Load",
    loadedLabel: lang === "id" ? "Dimuat" : "Loaded",
    sportModeLabel: lang === "id" ? "Format" : "Format",
    categoryLabel: lang === "id" ? "Skenario" : "Tactics",
    emptyList: lang === "id" ? "Skenario kustom kosong. Gambar formasi & tambah fasa linimasa di kanan lalu simpan!" : "No custom exercises found. Position players on the board, save it, and it will list here!",
    
    // Form translations
    btnCreateNew: lang === "id" ? "📋 Simpan Papan Saat Ini" : "📋 Save Current Board",
    formHeading: lang === "id" ? "Simpan Sebagai Latihan Kustom" : "Save Current Board Active Playbook",
    labelTitle: lang === "id" ? "Nama Skenario Latihan" : "Scenario / Drill Name",
    labelDesc: lang === "id" ? "Instruki / Catatan Pelatih" : "Coaching Instructions / Notes",
    labelIcon: lang === "id" ? "Simbol / Ikon" : "Symbol / Icon",
    labelCategory: lang === "id" ? "Kategori Taktikal" : "Tactics Category",
    placeholderTitle: lang === "id" ? "Contoh: Pressing Sayap 1-2 Kontra..." : "e.g., Wing Press Trap & 1-2 Overlap",
    placeholderDesc: lang === "id" ? "Tuliskan instruksi langkah demi langkah di sini..." : "Write step-by-step coaching notes here...",
    btnSave: lang === "id" ? "Simpan Latihan" : "Save Exercise",
    btnCancel: lang === "id" ? "Batal" : "Cancel",
    alertEmpty: lang === "id" ? "Harap tulis nama latihan terlebih dulu!" : "Please write a title for the exercise!",
    alertNoFrames: lang === "id" ? "Linimasa kosong! Buat setidaknya 1 fasa gerakan/squad pada linimasa kanan terlebih dulu." : "Your timeline is empty! Please create at least 1 phase on the right timeline first."
  };

  // Merge presets with custom drills
  const allAvailableDrills = [...TACTICAL_DRILLS_DATA, ...customDrills];

  const filteredDrills = allAvailableDrills.filter((drill) => {
    if (activeTab === "all") return true;
    if (activeTab === "custom") {
      return drill.id.startsWith("custom-drill-");
    }
    return drill.category === activeTab && !drill.id.startsWith("custom-drill-");
  });

  const handleLoad = (drill: TacticalDrill) => {
    onLoadDrill(drill);
    setLoadedDrillId(drill.id);
    // Auto-clear active label after 3 seconds for visual response
    setTimeout(() => {
      setLoadedDrillId(null);
    }, 4000);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrillTitle.trim()) {
      alert(t.alertEmpty);
      return;
    }

    if (!currentFrames || currentFrames.length === 0) {
      alert(t.alertNoFrames);
      return;
    }

    // Prepare custom drill object
    const customId = "custom-drill-" + Date.now();
    const newDrill: TacticalDrill = {
      id: customId,
      title: { id: newDrillTitle, en: newDrillTitle },
      description: { id: newDrillDescription || (lang === "id" ? "Latihan kustom buatan Anda" : "User saved gameplay exercise"), en: newDrillDescription || "User saved gameplay exercise" },
      category: newDrillCategory,
      icon: newDrillIcon || "📝",
      sportMode: (currentSportMode === "custom" ? "soccer" : currentSportMode) as any,
      frames: JSON.parse(JSON.stringify(currentFrames)) // deep copy frames state
    };

    const updated = [newDrill, ...customDrills];
    setCustomDrills(updated);
    try {
      localStorage.setItem("custom_tactical_drills", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed saving to local storage:", err);
    }

    // Reset Form
    setNewDrillTitle("");
    setNewDrillDescription("");
    setNewDrillCategory("attack");
    setNewDrillIcon("📋");
    setShowCreateForm(false);
    setActiveTab("custom"); // Switch to custom filter tab instantly
  };

  const handleDeleteCustom = (drillId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(lang === "id" ? "Hapus latihan kustom ini dari memori?" : "Delete this custom drill permanently?");
    if (!confirmed) return;

    const updated = customDrills.filter(d => d.id !== drillId);
    setCustomDrills(updated);
    try {
      localStorage.setItem("custom_tactical_drills", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
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
        <BookOpen className="w-4 h-4 text-indigo-400/70 shrink-0" />
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap items-center gap-1 bg-black/45 p-1 rounded-xl border border-white/[0.04]">
        {([
          { key: "all", label: t.tabAll },
          { key: "pressing", label: t.tabPressing },
          { key: "attack", label: t.tabAttack },
          { key: "defense", label: t.tabDefense },
          { key: "custom", label: t.tabCustom }
        ] as const).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setShowCreateForm(false);
              }}
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

      {/* Custom Drills Header trigger (Save New) */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase font-bold text-gray-400">
          {filteredDrills.length} {lang === "id" ? "Skenario Tersedia" : "Exercises listed"}
        </span>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border ${
            showCreateForm 
              ? "bg-red-950/25 text-red-300 border-red-900/30 hover:bg-red-950/45"
              : "bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-300 border-indigo-500/25 active:scale-95 shadow-sm"
          }`}
        >
          {showCreateForm ? (
            <>
              <X className="w-2.5 h-2.5" />
              <span>{t.btnCancel}</span>
            </>
          ) : (
            <>
              <Plus className="w-2.5 h-2.5" />
              <span>{t.btnCreateNew}</span>
            </>
          )}
        </button>
      </div>

      {/* Save Drill Form Block */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveCustom}
            className="bg-[#0e0f14]/80 border border-indigo-500/20 p-3 rounded-2xl flex flex-col gap-3 overflow-hidden select-none"
          >
            <div className="border-b border-white/[0.04] pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-bounce" />
                {t.formHeading}
              </span>
              <span className="text-[8px] bg-indigo-505/10 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/20 font-mono">
                {currentFrames.length} {lang === "id" ? "fasa" : "phases"}
              </span>
            </div>

            {/* Title Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[8.5px] font-bold text-gray-400 tracking-wider uppercase">
                {t.labelTitle}
              </label>
              <input
                type="text"
                required
                value={newDrillTitle}
                onChange={(e) => setNewDrillTitle(e.target.value)}
                placeholder={t.placeholderTitle}
                className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/50 rounded-lg py-1 px-2.5 text-[10.5px] text-gray-200 outline-none placeholder-gray-500"
              />
            </div>

            {/* Description Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[8.5px] font-bold text-gray-400 tracking-wider uppercase">
                {t.labelDesc}
              </label>
              <textarea
                value={newDrillDescription}
                onChange={(e) => setNewDrillDescription(e.target.value)}
                placeholder={t.placeholderDesc}
                rows={2}
                className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/50 rounded-lg py-1.5 px-2.5 text-[10.5px] text-gray-300 outline-none placeholder-gray-500 resize-none font-medium text-left"
              />
            </div>

            {/* Group category and icon selection */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[8.5px] font-bold text-gray-400 tracking-wider uppercase">
                  {t.labelCategory}
                </label>
                <select
                  value={newDrillCategory}
                  onChange={(e) => setNewDrillCategory(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/50 rounded-lg p-1 text-[10px] text-gray-200 outline-none uppercase font-black"
                >
                  <option value="attack">{lang === "id" ? "⚽ MENYERANG" : "⚽ ATTACK"}</option>
                  <option value="defense">{lang === "id" ? "🛡️ BERTAHAN" : "🛡️ DEFENSE"}</option>
                  <option value="pressing">{lang === "id" ? "🕸️ PRESSING" : "🕸️ PRESSING"}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8.5px] font-bold text-gray-400 tracking-wider uppercase">
                  {t.labelIcon}
                </label>
                <div className="flex items-center gap-1 bg-black/40 border border-white/[0.08] rounded-lg p-0.5">
                  {(["📋", "⚽", "🥅", "📢", "⚡", "🏋️", "🏃"] as const).map((sym) => (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => setNewDrillIcon(sym)}
                      className={`w-6 h-6 flex items-center justify-center rounded text-xs cursor-pointer transition-all ${
                        newDrillIcon === sym 
                          ? "bg-indigo-600/30 text-white border border-indigo-500/40" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Save Button */}
            <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-white/[0.03]">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1 rounded-lg text-[9px] font-bold text-gray-400 hover:text-white bg-white/5 transition-all cursor-pointer"
              >
                {t.btnCancel}
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 rounded-lg text-[9px] font-black uppercase text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-md"
              >
                <span>{t.btnSave}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Drills Grid / List */}
      <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredDrills.length > 0 ? (
          filteredDrills.map((drill) => {
            const isLoaded = loadedDrillId === drill.id;
            const isCustom = drill.id.startsWith("custom-drill-");
            return (
              <div
                key={drill.id}
                onDoubleClick={() => setSelectedDrill(drill)}
                className="group relative bg-[#0d0e12]/70 hover:bg-indigo-500/[0.04] border border-white/[0.04] hover:border-indigo-500/25 p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all duration-200 cursor-pointer"
                title={lang === "id" ? "Klik ganda untuk detail, klik tunggal Muat Latihan" : "Double-click for details, single-click to Load"}
              >
                {/* Left Side: Icon & Title */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-base bg-white/5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-200">
                    {drill.icon}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-[10.5px] text-gray-200 group-hover:text-indigo-300 transition-colors truncate">
                      {lang === "id" ? drill.title.id : drill.title.en}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[7.5px] uppercase font-black px-1.5 py-0.2 bg-indigo-500/10 text-indigo-400 rounded">
                        {drill.category}
                      </span>
                      <span className="text-[7.5px] uppercase font-bold px-1.5 py-0.2 bg-white/5 text-gray-400 rounded">
                        {drill.sportMode === "soccer" ? "11v11" : drill.sportMode === "minisoccer" ? "7v7" : "5v5"}
                      </span>
                      {isCustom && (
                        <span className="text-[7.5px] uppercase font-black px-1.5 py-0.2 bg-yellow-500/10 text-yellow-500 rounded">
                          {lang === "id" ? "Kustom" : "Custom"}
                        </span>
                      )}
                      <span className="text-[7px] text-indigo-400/70 font-semibold italic hidden sm:inline ml-1">
                        {lang === "id" ? "💡 Klik 2x" : "💡 Double-click"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Delete Button for Custom Drills */}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustom(drill.id, e)}
                      className="w-6.5 h-6.5 bg-red-950/20 hover:bg-red-950/55 border border-red-900/30 text-rose-405 hover:text-rose-400 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm"
                      title={lang === "id" ? "Hapus Latihan Kustom" : "Delete Custom Exercise"}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  )}

                  {/* Load Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoad(drill);
                    }}
                    className={`px-2 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all flex items-center gap-0.5 cursor-pointer border shrink-0 select-none ${
                      isLoaded
                        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/25"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/25 shadow-sm active:scale-95"
                    }`}
                  >
                    {isLoaded ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span>{t.loadedLabel}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-1.5 h-1.5 fill-current shrink-0" />
                        <span>{t.loadBtn}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Elegant hover quick tooltip overlay */}
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[115%] mb-1 w-64 bg-[#090a0f]/98 border border-indigo-500/30 p-2.5 rounded-xl shadow-2xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-[999] backdrop-blur-md">
                  <div className="flex items-center gap-1.5 mb-1 shrink-0 pb-1 border-b border-white/[0.06]">
                    <span className="text-xs">{drill.icon}</span>
                    <span className="text-[9.5px] font-black text-gray-100 truncate">
                      {lang === "id" ? drill.title.id : drill.title.en}
                    </span>
                  </div>
                  <p className="text-[9px] leading-relaxed text-gray-300 font-medium">
                    {lang === "id" ? drill.description.id : drill.description.en}
                  </p>
                  <div className="text-[7.5px] text-indigo-400 mt-1.5 font-extrabold flex items-center gap-1">
                    <span>✨</span>
                    <span>{lang === "id" ? "Klik ganda untuk membuka detail fasa" : "Double-click to open active phase flow info"}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-[10px] text-gray-500 font-bold bg-black/20 rounded-xl border border-dashed border-white/5 mt-2 px-4 leading-relaxed">
            {t.emptyList}
          </div>
        )}
      </div>

      {/* Modal Popup for Drill Details on Double Click */}
      <AnimatePresence>
        {selectedDrill && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#0e0f14] border border-white/10 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 text-left select-none max-h-[85vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDrill(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 pb-3 border-b border-white/[0.08]">
                <span className="text-3xl bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                  {selectedDrill.icon}
                </span>
                <div className="flex flex-col pr-8">
                  <span className="text-[9.5px] font-black uppercase text-indigo-400 tracking-wider">
                    {lang === "id" ? "Detail Transisi & Latihan" : "Tactical Drill System"}
                  </span>
                  <h3 className="font-extrabold text-base text-gray-100 leading-tight">
                    {lang === "id" ? selectedDrill.title.id : selectedDrill.title.en}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[8.5px] tracking-wider uppercase font-black px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      {lang === "id" ? "Skenario" : "Tactics"}: {selectedDrill.category}
                    </span>
                    <span className="text-[8.5px] tracking-wider uppercase font-black px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5">
                      {lang === "id" ? "Format" : "Format"}: {selectedDrill.sportMode === "soccer" ? "11 vs 11" : selectedDrill.sportMode === "minisoccer" ? "7 vs 7" : "5 vs 5"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-wide">
                  {lang === "id" ? "Deskripsi Skenario" : "Tactics Description"}:
                </span>
                <p className="text-xs text-gray-300 leading-relaxed font-semibold bg-black/20 p-3 rounded-xl border border-white/[0.03]">
                  {lang === "id" ? selectedDrill.description.id : selectedDrill.description.en}
                </p>
              </div>

              {/* Detailed Animated Phases Flow */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-wide">
                  {lang === "id" ? "Alur & Fasa Pola Gerakan" : "Movement Phases & Timesteps"}:
                </span>
                <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {selectedDrill.frames?.map((frame, index) => (
                    <div
                      key={frame.id}
                      className="bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl flex gap-3 items-start hover:border-indigo-500/20 transition-all duration-200"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-[9.5px] shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-[10.5px] text-gray-100">
                          {frame.name}
                        </span>
                        <p className="text-[9.5px] leading-relaxed text-gray-400 font-medium">
                          {frame.instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="mt-2 pt-3 border-t border-white/[0.08] flex items-center gap-2 justify-end">
                <button
                  onClick={() => setSelectedDrill(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  {lang === "id" ? "Tutup" : "Close"}
                </button>
                <button
                  onClick={() => {
                    handleLoad(selectedDrill);
                    setSelectedDrill(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border border-indigo-400/30"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{lang === "id" ? "Muat ke Lapangan" : "Load to Pitch"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
