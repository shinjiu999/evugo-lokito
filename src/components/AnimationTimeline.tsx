import { useEffect, useState } from "react";
import { AnimationFrame } from "../types";
import { Play, Pause, BookmarkPlus, RotateCcw, AlertCircle, Eye, EyeOff, Gauge, Zap, Settings as SettingsIcon } from "lucide-react";
import { soundManager } from "../utils/sound";
import Interactive3DCard from "./Interactive3DCard";

interface AnimationTimelineProps {
  frames: AnimationFrame[];
  activeFrameIndex: number;
  setActiveFrameIndex: (idx: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onResetFrames: () => void;
  onSaveCurrentFrameAsNew: () => void;
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

  // Playback timer cycle with dynamic calculation based on speed
  useEffect(() => {
    let intervalId: any;
    if (isPlaying) {
      onPlayStateChange(true);
      const playDelayMs = 
        playSpeed === "slow" ? 3000 :
        playSpeed === "fast" ? 1200 :
        playSpeed === "superfast" ? 600 : 2000;

      intervalId = setInterval(() => {
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
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, activeFrameIndex, frames.length, playSpeed]);

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

  const t = {
    title: lang === "id" ? "🎭 Linimasa Simulasi Gerakan" : "🎭 Tactical Movement Timeline",
    subtitle: lang === "id" ? "Animasi pergeseran posisi pemain halus & teratur" : "Smooth & programmatic animated player keyframes",
    resetTitle: lang === "id" ? "Reset ke Formasi Standard" : "Reset to Default Formations",
    addKeyframeTitle: lang === "id" ? "Simpan Posisi Sekarang sebagai Frame Lain" : "Save current positions to a new keyframe Phase",
    phaseLabel: lang === "id" ? "Fasa" : "Phase",
    trailsLabel: lang === "id" ? "Visualisasi Lintasan Gerak (Trails)" : "Visualize Movement Trails (Pacing)",
    speedLabel: lang === "id" ? "Kecepatan Simulasi Fasa" : "Simulation Phase Speed",
    physicalModelLabel: lang === "id" ? "Model Fisik Gerakan Pemain" : "Player Movement Physical Model",
    speedSlow: lang === "id" ? "Lambat" : "Slow",
    speedNormal: lang === "id" ? "Normal" : "Normal",
    speedFast: lang === "id" ? "Cepat" : "Fast",
    speedInstant: lang === "id" ? "Instan" : "Instant",
    modelSpring: lang === "id" ? "Pegas" : "Spring",
    modelLinear: lang === "id" ? "Uniform" : "Linear",
    modelStealth: lang === "id" ? "Stealth" : "Stealth",
    modelEaseInOut: lang === "id" ? "Perlahan" : "Ease-in-out",
    modelElastic: lang === "id" ? "Elastis" : "Elastic",
    defaultInstruction: lang === "id" ? "Gerakkan posisi pemain sesuka Anda secara manual, atau klik '+ Keyframe' untuk menambah fasa lanjutan." : "Drag and drop players to manually tweak positions, or click '+ Keyframe' to record a sequential tactical transition phase.",
    btnPause: lang === "id" ? "Jeda Simulasi" : "Pause Simulation",
    btnPlay: lang === "id" ? "Jalankan Playbook" : "Run Playbook simulation"
  };

  return (
    <Interactive3DCard glowColor="rgba(99, 102, 241, 0.4)">
      <div className="p-5 flex flex-col gap-3.5">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            {t.title}
          </h4>
        </div>

        {/* Action button controls */}
        <div className="flex gap-2">
          {/* Toggle details configuration */}
          <button
            onClick={() => {
              setIsConfigOpen(!isConfigOpen);
              soundManager.playClick();
            }}
            title={lang === "id" ? "Konfigurasi Simulasi" : "Simulation Settings"}
            className={`p-1.5 rounded-lg border transition-all active:scale-95 text-xs flex items-center justify-center cursor-pointer ${
              isConfigOpen
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <SettingsIcon className={`w-4 h-4 ${isConfigOpen ? "rotate-45" : ""} transition-transform duration-300`} />
          </button>

          {/* Reset keyframes */}
          <button
            onClick={() => {
              setIsPlaying(false);
              onResetFrames();
              soundManager.playSweep();
            }}
            title={t.resetTitle}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-450 hover:text-white transition-all active:scale-[0.92] text-xs flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Add frame manually */}
          <button
            onClick={() => {
              onSaveCurrentFrameAsNew();
              soundManager.playChime();
            }}
            title={t.addKeyframeTitle}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 hover:text-blue-300 font-semibold text-[10px] uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5" /> + Keyframe
          </button>
        </div>
      </div>

      {/* Frame Selectors Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none select-none">
        {frames.map((frame, idx) => {
          const isActive = idx === activeFrameIndex;
          return (
            <button
              key={frame.id}
              onClick={() => handleSelectFrame(idx)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1 whitespace-nowrap shrink-0 border cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white border-blue-400/30 font-bold shadow-[0_0_10px_rgba(37,99,235,0.25)]"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300"
              }`}
            >
              {t.phaseLabel} {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Detail Kontrol Simulasi (Simulation Settings Details) Collapsible Grid */}
      {isConfigOpen && (
        <div className="bg-black/35 p-3 rounded-2xl border border-white/[0.05] flex flex-col gap-3 transition-all duration-300 animate-fadeIn">
          {/* Toggle Trails */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wide">
              {showMovementTrails ? <Eye className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
              {t.trailsLabel}
            </span>
            <button
              onClick={() => setShowMovementTrails(!showMovementTrails)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showMovementTrails ? "bg-blue-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showMovementTrails ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Playback Speed Select */}
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
                    className={`py-1 text-[9px] rounded-lg font-bold border transition-all truncate cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm"
                        : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transition Style Select */}
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

                let titleDesc = "";
                if (style === "spring") titleDesc = "Bouncing natural spring physics";
                else if (style === "linear") titleDesc = "Uniform constant velocity linear movement";
                else if (style === "stealth") titleDesc = "Tactical anticipation ease acceleration";
                else if (style === "ease-in-out") titleDesc = "Smooth quadratic acceleration and deceleration";
                else if (style === "elastic") titleDesc = "Dynamic elastic rebound overshoot effect";

                return (
                  <button
                    key={style}
                    onClick={() => setTransitionType(style)}
                    className={`py-1 text-[8px] rounded-lg font-bold border transition-all truncate cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-400 text-amber-100 shadow-sm"
                        : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                    }`}
                    title={titleDesc}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Play Controls Ticker Spacer */}
      <div className="flex gap-2">
        <button
          onClick={handleTogglePlay}
          disabled={frames.length <= 1}
          className={`flex-1 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer ${
            frames.length <= 1
              ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
              : isPlaying
              ? "bg-yellow-600 text-white font-extrabold shadow-lg shadow-yellow-900/15"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl shadow-blue-900/20"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current animate-pulse text-amber-200" /> {t.btnPause}
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-white/90" /> {t.btnPlay}
            </>
          )}
        </button>
      </div>
      </div>
    </Interactive3DCard>
  );
}
