import { useEffect, useState } from "react";
import { AnimationFrame } from "../types";
import { 
  Play, 
  Pause, 
  BookmarkPlus, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Gauge, 
  Zap, 
  Settings as SettingsIcon, 
  X,
  Timer,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { soundManager } from "../utils/sound";
import Interactive3DCard from "./Interactive3DCard";

interface AnimationTimelineProps {
  frames: AnimationFrame[];
  activeFrameIndex: number;
  setActiveFrameIndex: (idx: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onResetFrames: () => void;
  onSaveCurrentFrameAsNew: () => void;
  onDeleteFrame?: (idx: number) => void;
  onUpdateFrameDuration?: (frameIndex: number, duration: number) => void;
  onUpdateAllFramesDuration?: (duration: number) => void;
  playSpeed: "slow" | "normal" | "fast" | "superfast";
  setPlaySpeed: (speed: "slow" | "normal" | "fast" | "superfast") => void;
  transitionType: "spring" | "linear" | "stealth" | "ease-in-out" | "elastic";
  setTransitionType: (type: "spring" | "linear" | "stealth" | "ease-in-out" | "elastic") => void;
  showMovementTrails: boolean;
  setShowMovementTrails: (show: boolean) => void;
  lang?: "id" | "en";
}

export default function AnimationTimeline({
  frames,
  activeFrameIndex,
  setActiveFrameIndex,
  onPlayStateChange,
  onResetFrames,
  onSaveCurrentFrameAsNew,
  onDeleteFrame,
  onUpdateFrameDuration,
  onUpdateAllFramesDuration,
  playSpeed,
  setPlaySpeed,
  transitionType,
  setTransitionType,
  showMovementTrails,
  setShowMovementTrails,
  lang = "id"
}: AnimationTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Per-frame specific time-to-complete calculation
  const currentFrame = frames[activeFrameIndex];
  const currentFrameDuration = Math.max(0.2, currentFrame?.duration ?? 2.0);

  // Playback timer cycle that respects each frame's unique time-to-complete value
  useEffect(() => {
    let timerId: any;
    if (isPlaying) {
      onPlayStateChange(true);
      const currentDuration = Math.max(0.2, frames[activeFrameIndex]?.duration ?? 2.0);

      // Multiplier from global playback rate setting
      const speedMultiplier = 
        playSpeed === "slow" ? 1.5 :
        playSpeed === "fast" ? 0.6 :
        playSpeed === "superfast" ? 0.3 : 1.0;

      const playDelayMs = Math.max(250, Math.round(currentDuration * 1000 * speedMultiplier));

      timerId = setTimeout(() => {
        const nextIdx = activeFrameIndex >= frames.length - 1 ? 0 : activeFrameIndex + 1;
        if (nextIdx === 0) {
          setIsPlaying(false);
          onPlayStateChange(false);
          soundManager.playCrowdCheer();
        }
        setActiveFrameIndex(nextIdx);
      }, playDelayMs);
    } else {
      onPlayStateChange(false);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isPlaying, activeFrameIndex, frames, playSpeed]);

  const handleTogglePlay = () => {
    if (frames.length <= 1) return;
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);
    if (nextPlay) {
      soundManager.playWhistle();
    } else {
      soundManager.playClick();
    }
  };

  const handleSelectFrame = (idx: number) => {
    setIsPlaying(false);
    setActiveFrameIndex(idx);
    soundManager.playClick();
  };

  const handleAdjustDuration = (delta: number) => {
    soundManager.playClick();
    const newDuration = Math.max(0.2, Math.min(10.0, Number((currentFrameDuration + delta).toFixed(1))));
    if (onUpdateFrameDuration) {
      onUpdateFrameDuration(activeFrameIndex, newDuration);
    }
  };

  const handleSetDuration = (val: number) => {
    soundManager.playClick();
    const newDuration = Math.max(0.2, Math.min(10.0, Number(val.toFixed(1))));
    if (onUpdateFrameDuration) {
      onUpdateFrameDuration(activeFrameIndex, newDuration);
    }
  };

  const handleApplyToAll = () => {
    soundManager.playChime();
    if (onUpdateAllFramesDuration) {
      onUpdateAllFramesDuration(currentFrameDuration);
    }
    setToastMessage(
      lang === "id"
        ? `✓ Durasi ${currentFrameDuration.toFixed(1)}s diterapkan ke seluruh ${frames.length} fasa!`
        : `✓ Duration ${currentFrameDuration.toFixed(1)}s applied to all ${frames.length} phases!`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Cumulative timeline metrics
  const frameDurations = frames.map((f) => Math.max(0.2, Number(f.duration ?? 2.0)));
  const totalDuration = Number(frameDurations.reduce((sum, d) => sum + d, 0).toFixed(1));

  const cumulativeStartTimes: number[] = [];
  let acc = 0;
  for (let i = 0; i < frameDurations.length; i++) {
    cumulativeStartTimes.push(acc);
    acc += frameDurations[i];
  }

  const currentStartTime = cumulativeStartTimes[activeFrameIndex] ?? 0;
  const currentDuration = frameDurations[activeFrameIndex] ?? 2.0;
  const currentProgressPercent = totalDuration > 0
    ? Math.min(100, Math.max(0, ((currentStartTime + currentDuration) / totalDuration) * 100))
    : 100;

  const t = {
    title: lang === "id" ? "🎭 Linimasa Simulasi Gerakan" : "🎭 Tactical Movement Timeline",
    subtitle: lang === "id" ? "Animasi pergeseran posisi pemain halus & teratur" : "Smooth & programmatic animated player keyframes",
    resetTitle: lang === "id" ? "Reset ke Formasi Standard" : "Reset to Default Formations",
    addKeyframeTitle: lang === "id" ? "Simpan Posisi Sekarang sebagai Frame Lain" : "Save current positions to a new keyframe Phase",
    phaseLabel: lang === "id" ? "Fasa" : "Phase",
    trailsLabel: lang === "id" ? "Visualisasi Lintasan Gerak (Trails)" : "Visualize Movement Trails (Pacing)",
    speedLabel: lang === "id" ? "Kecepatan Global (Rate)" : "Global Playback Rate",
    physicalModelLabel: lang === "id" ? "Model Fisik Gerakan Pemain" : "Player Movement Physical Model",
    speedSlow: lang === "id" ? "Lambat (0.7x)" : "Slow (0.7x)",
    speedNormal: lang === "id" ? "Normal (1.0x)" : "Normal (1.0x)",
    speedFast: lang === "id" ? "Cepat (1.6x)" : "Fast (1.6x)",
    speedInstant: lang === "id" ? "Kilat (3.0x)" : "Lightning (3.0x)",
    modelSpring: lang === "id" ? "Pegas" : "Spring",
    modelLinear: lang === "id" ? "Uniform" : "Linear",
    modelStealth: lang === "id" ? "Stealth" : "Stealth",
    modelEaseInOut: lang === "id" ? "Perlahan" : "Ease-in-out",
    modelElastic: lang === "id" ? "Elastis" : "Elastic",
    btnPause: lang === "id" ? "Jeda Simulasi" : "Pause Simulation",
    btnPlay: lang === "id" ? "Jalankan Playbook" : "Run Playbook simulation",
    pacingTitle: lang === "id" ? "⏱️ Waktu Selesai Fasa (Time-to-Complete)" : "⏱️ Phase Time-to-Complete (Pacing)",
    pacingSubtitle: lang === "id" ? "Kontrol durasi transisi pemain untuk fasa ini" : "Control exact transition duration for this phase",
    applyAllBtn: lang === "id" ? "Terapkan ke Semua" : "Apply to All",
    totalTimeline: lang === "id" ? "Total Durasi Playbook" : "Total Playbook Duration"
  };

  return (
    <Interactive3DCard glowColor="rgba(16, 185, 129, 0.4)">
      <div className="p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-[10px] font-black text-gray-200 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              {t.title}
            </h4>
          </div>

          {/* Action button controls */}
          <div className="flex items-center gap-2">
            {/* Total Duration Chip */}
            <div 
              className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-mono font-bold text-[9px] flex items-center gap-1 cursor-default"
              title={`${t.totalTimeline}: ${totalDuration.toFixed(1)}s`}
            >
              <Timer className="w-3 h-3 text-emerald-400" />
              <span>{totalDuration.toFixed(1)}s</span>
            </div>

            {/* Toggle details configuration */}
            <button
              onClick={() => {
                setIsConfigOpen(!isConfigOpen);
                soundManager.playClick();
              }}
              title={lang === "id" ? "Konfigurasi Simulasi & Fisika" : "Simulation & Physics Settings"}
              className={`p-1.5 rounded-xl border transition-all active:scale-95 text-xs flex items-center justify-center cursor-pointer ${
                isConfigOpen
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <SettingsIcon className={`w-3.5 h-3.5 ${isConfigOpen ? "rotate-45 text-emerald-400" : ""} transition-transform duration-300`} />
            </button>

            {/* Reset keyframes */}
            <button
              onClick={() => {
                setIsPlaying(false);
                onResetFrames();
                soundManager.playSweep();
              }}
              title={t.resetTitle}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all active:scale-[0.92] text-xs flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Add frame manually */}
            <button
              onClick={() => {
                onSaveCurrentFrameAsNew();
                soundManager.playChime();
              }}
              title={t.addKeyframeTitle}
              className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-extrabold text-[9.5px] uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <BookmarkPlus className="w-3 h-3" /> + Keyframe
            </button>
          </div>
        </div>

        {/* Section: Timeline Keyframe Track Scrubber Bar */}
        <div className="bg-[#05100c]/90 rounded-2xl border border-emerald-500/20 p-2.5 flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between text-[8px] font-mono font-bold text-gray-400 px-1 select-none">
            <span>0.0s</span>
            <span>{(totalDuration * 0.25).toFixed(1)}s</span>
            <span>{(totalDuration * 0.5).toFixed(1)}s</span>
            <span>{(totalDuration * 0.75).toFixed(1)}s</span>
            <span className="text-emerald-400 font-black">{totalDuration.toFixed(1)}s</span>
          </div>

          {/* Interactive Timeline Track with Marker Pins */}
          <div className="relative w-full h-3 bg-white/5 rounded-full overflow-visible flex items-center">
            {/* Active progress fill */}
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{
                width: `${currentProgressPercent}%`
              }}
            />

            {/* Keyframe pin markers on the track */}
            {frames.map((frame, idx) => {
              const leftPercent = totalDuration > 0 
                ? (cumulativeStartTimes[idx] / totalDuration) * 100 
                : frames.length === 1 ? 50 : (idx / (frames.length - 1)) * 100;
              const isActive = idx === activeFrameIndex;
              const duration = frameDurations[idx];
              return (
                <button
                  key={frame.id || idx}
                  onClick={() => handleSelectFrame(idx)}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 transition-all cursor-pointer z-10 flex items-center justify-center ${
                    isActive 
                      ? "bg-white border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] scale-125" 
                      : "bg-emerald-950 border-emerald-500/60 hover:scale-110 hover:border-emerald-400"
                  }`}
                  style={{ left: `${Math.min(97, Math.max(3, leftPercent))}%` }}
                  title={`${t.phaseLabel} ${idx + 1}: ${(cumulativeStartTimes[idx]).toFixed(1)}s • Pacing: ${duration.toFixed(1)}s`}
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] font-bold text-emerald-400 uppercase tracking-wide">
                {t.phaseLabel} {activeFrameIndex + 1} / {frames.length}
              </span>
              <span className="text-[8px] font-mono text-emerald-300/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                ⏱️ {currentFrameDuration.toFixed(1)}s
              </span>
            </div>
            <span className="text-[8px] text-gray-500 font-mono font-medium">
              {playSpeed.toUpperCase()} • {transitionType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Frame Selectors Tabs with Duration Pill Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none select-none">
          {frames.map((frame, idx) => {
            const isActive = idx === activeFrameIndex;
            const duration = frame.duration ?? 2.0;
            return (
              <button
                key={frame.id}
                onClick={() => handleSelectFrame(idx)}
                className={`px-3 py-1.5 rounded-xl text-[9.5px] font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0 border cursor-pointer group ${
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-400/40 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300"
                }`}
              >
                <span>{t.phaseLabel} {idx + 1}</span>
                <span className={`px-1 py-0.5 rounded text-[7.5px] font-mono font-bold flex items-center gap-0.5 ${
                  isActive ? "bg-black/30 text-emerald-200" : "bg-white/5 text-gray-400 group-hover:text-gray-300"
                }`}>
                  <Timer className="w-2 h-2" />
                  {duration.toFixed(1)}s
                </span>
                {frames.length > 1 && onDeleteFrame && (
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(false);
                      onDeleteFrame(idx);
                    }}
                    className={`p-0.5 rounded-full hover:bg-white/20 transition-all flex items-center justify-center -mr-0.5 ${
                      isActive ? "text-emerald-200 hover:text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
                    title={lang === "id" ? "Hapus Fasa" : "Delete Phase"}
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated Frame Time-to-Complete (Pacing) Control Card */}
        <div className="bg-gradient-to-br from-emerald-950/30 via-[#05100c]/80 to-teal-950/20 rounded-2xl border border-emerald-500/20 p-3 flex flex-col gap-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Timer className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-200 tracking-wider">
                    {lang === "id" ? `Pacing Fasa ${activeFrameIndex + 1}` : `Phase ${activeFrameIndex + 1} Pacing`}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentFrameDuration.toFixed(1)}s
                  </span>
                </div>
                <p className="text-[8px] text-gray-400 font-medium">
                  {t.pacingSubtitle}
                </p>
              </div>
            </div>

            {/* Apply to All Phases Button */}
            {frames.length > 1 && onUpdateAllFramesDuration && (
              <button
                onClick={handleApplyToAll}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-gray-300 hover:text-emerald-300 text-[8.5px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title={lang === "id" ? "Terapkan durasi waktu ini ke seluruh fasa dalam alur playbook" : "Apply this exact time-to-complete duration to all frames in the playbook"}
              >
                <Layers className="w-2.5 h-2.5 text-emerald-400" />
                <span>{t.applyAllBtn}</span>
              </button>
            )}
          </div>

          {/* Stepper & Smooth Slider */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => handleAdjustDuration(-0.5)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[9px] font-bold font-mono transition-all active:scale-95 cursor-pointer"
              title="-0.5s"
            >
              -0.5s
            </button>
            <button
              onClick={() => handleAdjustDuration(-0.1)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[9px] font-bold font-mono transition-all active:scale-95 cursor-pointer"
              title="-0.1s"
            >
              -0.1s
            </button>

            {/* Range Slider & Direct display */}
            <div className="flex-1 flex items-center gap-2 px-1">
              <input
                type="range"
                min="0.2"
                max="8.0"
                step="0.1"
                value={currentFrameDuration}
                onChange={(e) => handleSetDuration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[10px] font-mono font-black text-emerald-300 w-10 text-right shrink-0">
                {currentFrameDuration.toFixed(1)}s
              </span>
            </div>

            <button
              onClick={() => handleAdjustDuration(0.1)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[9px] font-bold font-mono transition-all active:scale-95 cursor-pointer"
              title="+0.1s"
            >
              +0.1s
            </button>
            <button
              onClick={() => handleAdjustDuration(0.5)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[9px] font-bold font-mono transition-all active:scale-95 cursor-pointer"
              title="+0.5s"
            >
              +0.5s
            </button>
          </div>

          {/* Quick Pacing Presets */}
          <div className="grid grid-cols-6 gap-1">
            {[
              { val: 0.5, label: "0.5s", tag: lang === "id" ? "Kilat" : "Fast" },
              { val: 1.0, label: "1.0s", tag: lang === "id" ? "Cepat" : "Quick" },
              { val: 1.5, label: "1.5s", tag: lang === "id" ? "Dinamis" : "Dynamic" },
              { val: 2.0, label: "2.0s", tag: lang === "id" ? "Normal" : "Normal" },
              { val: 3.0, label: "3.0s", tag: lang === "id" ? "Taktikal" : "Tactical" },
              { val: 4.5, label: "4.5s", tag: lang === "id" ? "Analisis" : "Analysis" },
            ].map((preset) => {
              const isCurrent = Math.abs(currentFrameDuration - preset.val) < 0.05;
              return (
                <button
                  key={preset.val}
                  onClick={() => handleSetDuration(preset.val)}
                  className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer border flex flex-col items-center ${
                    isCurrent
                      ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 font-black shadow-sm"
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10"
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold leading-tight">{preset.label}</span>
                  <span className="text-[7px] leading-none opacity-70">{preset.tag}</span>
                </button>
              );
            })}
          </div>

          {/* Inline Feedback Toast */}
          {toastMessage && (
            <div className="text-[8px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-center animate-fadeIn flex items-center justify-center gap-1.5">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Collapsible Simulation Config Accordion */}
        {isConfigOpen && (
          <div className="bg-black/35 p-3 rounded-2xl border border-white/[0.05] flex flex-col gap-3 transition-all duration-300 animate-fadeIn">
            {/* Toggle Trails */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wide">
                {showMovementTrails ? <Eye className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                {t.trailsLabel}
              </span>
              <button
                onClick={() => setShowMovementTrails(!showMovementTrails)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showMovementTrails ? "bg-emerald-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showMovementTrails ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Playback Speed Multiplier */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" /> {t.speedLabel}
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(["slow", "normal", "fast", "superfast"] as const).map((speed) => {
                  const label = speed === "slow" ? t.speedSlow : speed === "normal" ? t.speedNormal : speed === "fast" ? t.speedFast : t.speedInstant;
                  const isSelected = playSpeed === speed;
                  return (
                    <button
                      key={speed}
                      onClick={() => setPlaySpeed(speed)}
                      className={`py-1 text-[8.5px] rounded-lg font-bold border transition-all truncate cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-sm"
                          : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transition Physical Model Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> {t.physicalModelLabel}
              </label>
              <div className="grid grid-cols-5 gap-1">
                {(["spring", "linear", "stealth", "ease-in-out", "elastic"] as const).map((style) => {
                  const label = 
                    style === "spring" ? t.modelSpring : 
                    style === "linear" ? t.modelLinear : 
                    style === "stealth" ? t.modelStealth :
                    style === "ease-in-out" ? t.modelEaseInOut : t.modelElastic;
                  const isSelected = transitionType === style;

                  return (
                    <button
                      key={style}
                      onClick={() => setTransitionType(style)}
                      className={`py-1 text-[8px] rounded-lg font-bold border transition-all truncate cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-sm"
                          : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Play/Pause and Step Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Frame Button */}
          <button
            onClick={() => {
              if (activeFrameIndex > 0) {
                handleSelectFrame(activeFrameIndex - 1);
              }
            }}
            disabled={activeFrameIndex <= 0}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer"
            title={lang === "id" ? "Fasa Sebelumnya" : "Previous Phase"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Main Glowing Emerald Play Button */}
          <button
            onClick={handleTogglePlay}
            disabled={frames.length <= 1}
            className={`flex-1 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer shadow-lg ${
              frames.length <= 1
                ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                : isPlaying
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current animate-pulse text-slate-950" /> {t.btnPause}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-slate-950" /> {t.btnPlay}
              </>
            )}
          </button>

          {/* Next Frame Button */}
          <button
            onClick={() => {
              if (activeFrameIndex < frames.length - 1) {
                handleSelectFrame(activeFrameIndex + 1);
              }
            }}
            disabled={activeFrameIndex >= frames.length - 1}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer"
            title={lang === "id" ? "Fasa Berikutnya" : "Next Phase"}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Interactive3DCard>
  );
}
