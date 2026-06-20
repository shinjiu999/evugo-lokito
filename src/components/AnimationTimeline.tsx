import { useEffect, useState } from "react";
import { AnimationFrame } from "../types";
import { Play, Pause, ChevronRight, BookmarkPlus, RotateCcw, AlertCircle } from "lucide-react";

interface AnimationTimelineProps {
  frames: AnimationFrame[];
  activeFrameIndex: number;
  setActiveFrameIndex: (idx: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onResetFrames: () => void;
  onSaveCurrentFrameAsNew: () => void;
}

export default function AnimationTimeline({
  frames,
  activeFrameIndex,
  setActiveFrameIndex,
  onPlayStateChange,
  onResetFrames,
  onSaveCurrentFrameAsNew
}: AnimationTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Playback timer cycle
  useEffect(() => {
    let intervalId: any;
    if (isPlaying) {
      onPlayStateChange(true);
      intervalId = setInterval(() => {
        const nextIdx = activeFrameIndex >= frames.length - 1 ? 0 : activeFrameIndex + 1;
        if (nextIdx === 0) {
          setIsPlaying(false);
          onPlayStateChange(false);
        }
        setActiveFrameIndex(nextIdx);
      }, 2000); // 2 seconds per frame transition
    } else {
      onPlayStateChange(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, activeFrameIndex, frames.length]);

  const handleTogglePlay = () => {
    if (frames.length <= 1) return;
    setIsPlaying(!isPlaying);
  };

  const handleSelectFrame = (idx: number) => {
    setIsPlaying(false);
    setActiveFrameIndex(idx);
  };

  return (
    <div className="bg-[#15151a] border border-white/5 rounded-2xl p-4 flex flex-col gap-3.5 shadow-xl">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            🎭 Linimasa Simulasi Gerakan
          </h4>
          <p className="text-[10px] text-gray-500">Animasi pergeseran posisi pemain halus &amp; teratur</p>
        </div>

        {/* Action button controls */}
        <div className="flex gap-2">
          {/* Reset keyframes */}
          <button
            onClick={() => {
              setIsPlaying(false);
              onResetFrames();
            }}
            title="Reset ke Formasi Standard"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all active:scale-95 text-xs flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Add frame manually */}
          <button
            onClick={onSaveCurrentFrameAsNew}
            title="Simpan Posisi Sekarang sebagai Frame Lain"
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 hover:text-blue-300 font-semibold text-[10px] uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1"
          >
            <BookmarkPlus className="w-3.5 h-3.5" /> + Keyframe
          </button>
        </div>
      </div>

      {/* Frame Selectors Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {frames.map((frame, idx) => {
          const isActive = idx === activeFrameIndex;
          return (
            <button
              key={frame.id}
              onClick={() => handleSelectFrame(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center gap-1 whitespace-nowrap shrink-0 border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-400/30 font-bold"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
              }`}
            >
              Fasa {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Active Stage Instructional Ticker */}
      <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex gap-2.5 items-start">
        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold uppercase text-blue-400 tracking-wider">
            {frames[activeFrameIndex]?.name || `Fasa ${activeFrameIndex + 1}`}
          </span>
          <p className="text-[11px] text-gray-200 leading-normal">
            {frames[activeFrameIndex]?.instruction ||
              "Gerakkan posisi pemain sesuka Anda secara manual, atau klik '+ Keyframe' untuk menambah fasa lanjutan."}
          </p>
        </div>
      </div>

      {/* Play Controls Ticker Spacer */}
      <div className="flex gap-2">
        <button
          onClick={handleTogglePlay}
          disabled={frames.length <= 1}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
            frames.length <= 1
              ? "bg-[#15151a]/40 text-gray-600 cursor-not-allowed border border-white/5"
              : isPlaying
              ? "bg-yellow-600 text-white font-extrabold"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl shadow-blue-900/20"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current animate-pulse" /> Jeda Simulasi
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Jalankan Playbook
            </>
          )}
        </button>
      </div>
    </div>
  );
}
