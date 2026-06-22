import { useEffect, useState } from "react";
import { Player, AnimationFrame, TacticalItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, Tv, Volume2, Gamepad2, Play, Pause, Download, RefreshCw, Layers } from "lucide-react";
import { toPng } from "html-to-image";
import gifshot from "gifshot";

interface BroadcastTVProps {
  players: Player[];
  items: TacticalItem[];
  teamName: string;
  formationName: string;
  frames: AnimationFrame[];
  onClose: () => void;
  teamLogo?: string | null;
  lang?: "id" | "en";
}

export default function BroadcastTV({ players, items, teamName, formationName, frames, onClose, teamLogo, lang = "id" }: BroadcastTVProps) {
  const [isPlayingAnthem, setIsPlayingAnthem] = useState(false);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isPlayingSimulation, setIsPlayingSimulation] = useState(false);
  const [isExportingGif, setIsExportingGif] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [pitchMounted, setPitchMounted] = useState(false);

  // New manual custom music states
  const [musicUrl, setMusicUrl] = useState(() => localStorage.getItem("tactigen_custom_music_url") || "");
  const [isPlayingCustomMusic, setIsPlayingCustomMusic] = useState(false);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  const starters = players.filter((p) => p.isStarting);

  // Sorting for presentation (GK -> DEF -> MID -> FWD)
  const rolePriority = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

  // Trigger anthem sound and animation states on mount
  useEffect(() => {
    setPitchMounted(true);

    const savedUrl = localStorage.getItem("tactigen_custom_music_url") || "";
    if (savedUrl) {
      try {
        const audio = new Audio(savedUrl);
        audio.loop = true;
        audio.play()
          .then(() => {
            setIsPlayingCustomMusic(true);
            setActiveAudio(audio);
          })
          .catch(err => {
            console.log("Autoplay custom music blocked by browser context.");
          });
      } catch (e) {
        console.warn("Could not pre-play custom sound.");
      }
    } else {
      playChampionsAnthem();
    }
  }, []);

  // Stop custom sound on modal unmount
  useEffect(() => {
    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
    };
  }, [activeAudio]);

  const handleToggleMusic = () => {
    if (musicUrl) {
      if (activeAudio) {
        if (isPlayingCustomMusic) {
          activeAudio.pause();
          setIsPlayingCustomMusic(false);
        } else {
          activeAudio.play()
            .then(() => {
              setIsPlayingCustomMusic(true);
            })
            .catch(err => {
              alert("Gagal memutar audio: Pastikan URL valid dan browser mengizinkan pemutaran.");
            });
        }
      } else {
        try {
          const audio = new Audio(musicUrl);
          audio.loop = true;
          audio.play()
            .then(() => {
              setActiveAudio(audio);
              setIsPlayingCustomMusic(true);
            })
            .catch(err => {
              alert("Gagal memutar audio: Pastikan URL valid dan browser mengizinkan pemutaran.");
            });
        } catch (e) {
          alert("Gagal memutar URL audio kustom. Periksa koneksi internet & format file.");
        }
      }
    } else {
      playChampionsAnthem();
    }
  };

  const handleMusicUrlChange = (url: string) => {
    setMusicUrl(url);
    localStorage.setItem("tactigen_custom_music_url", url);
    if (activeAudio) {
      activeAudio.pause();
      setActiveAudio(null);
      setIsPlayingCustomMusic(false);
    }
  };

  // Playback timer loop for automatic tactical simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingSimulation && frames && frames.length > 1) {
      timer = setInterval(() => {
        setActiveFrameIndex((prev) => (prev + 1) % frames.length);
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isPlayingSimulation, frames]);

  const playChampionsAnthem = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();

      // Majestic orchestral fanfares (C4, E4, G4, C5, E5)
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
      setIsPlayingAnthem(true);

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.3 + idx * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.5);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 3.6);
      });

      setTimeout(() => setIsPlayingAnthem(false), 3600);
    } catch (e) {
      console.warn("Autoplay blocked sound synth.");
    }
  };

  // Compile frames into an animated GIF dynamically utilizing pixel-accurate snapshots!
  const handleExportGif = async () => {
    if (!frames || frames.length === 0) return;
    setIsExportingGif(true);
    setExportProgress(5);
    const capturedImages: string[] = [];

    // Save user's current frame to restore later
    const originalFrame = activeFrameIndex;
    setIsPlayingSimulation(false);

    try {
      // Loop through all frames and snapshot them
      for (let i = 0; i < frames.length; i++) {
        setActiveFrameIndex(i);
        // Wait for the spring transitions to complete beautifully
        await new Promise((resolve) => setTimeout(resolve, 800));

        const pitchEl = document.getElementById("broadcastTacticalPitch");
        if (pitchEl) {
          const dataUrl = await toPng(pitchEl, {
            cacheBust: true,
            pixelRatio: 1.5,
          });
          capturedImages.push(dataUrl);
        }
        // Progress reaches up to 50% for snapshots
        setExportProgress(Math.round(((i + 1) / frames.length) * 45) + 5);
      }

      setExportProgress(65);

      // Call gifshot to bundle photos together
      gifshot.createGIF(
        {
          images: capturedImages,
          gifWidth: 640,
          gifHeight: 400,
          interval: 1.2, // 1.2 seconds per keyframe
          numWorkers: 2,
        },
        function (obj) {
          if (!obj.error) {
            setExportProgress(100);
            const link = document.createElement("a");
            link.download = `Tactigen_${teamName.replace(/\s+/g, "_")}_Board_Animasi.gif`;
            link.href = obj.image;
            link.click();
          } else {
            console.error("Gifshot Error:", obj.errorMsg);
            alert("Gagal memproses GIF: " + obj.errorMsg);
          }
          setIsExportingGif(false);
          setActiveFrameIndex(originalFrame);
        }
      );
    } catch (err: any) {
      console.error("GIF export failed:", err);
      alert("Error melahirkan animasi GIF. Menyangkut kendala izin browser.");
      setIsExportingGif(false);
      setActiveFrameIndex(originalFrame);
    }
  };

  const currentFrame = frames[activeFrameIndex] || null;

  // Resolve player coordinate locations based on active keyframe
  const renderingPlayers = starters.map((starter) => {
    let x = starter.x;
    let y = starter.y;
    if (currentFrame) {
      const fPlayer = currentFrame.players.find((p) => p.id === starter.id);
      if (fPlayer) {
        x = fPlayer.x;
        y = fPlayer.y;
      }
    }
    return { ...starter, x, y };
  });

  const renderingItems = currentFrame?.items || [];

  return (
    <div className="fixed inset-0 bg-[#07070a]/99 z-200 flex flex-col items-center justify-between p-6 select-none overflow-y-auto">
      {/* Cinematic ambient background particles */}
      <div className="absolute top-1/10 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/10 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar controls */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 z-10 border-b border-white/5 pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-500/20 shadow animate-pulse">
            <Tv className="w-3.5 h-3.5" /> LIVE HD TACTICAL BROADCAST
          </div>
          
          {/* Custom Music Manual Input */}
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl w-full md:w-80 shadow">
            <span className="text-[9px] text-blue-400 font-extrabold uppercase shrink-0">
              {lang === "id" ? "🎵 MUSIK KUSTOM:" : "🎵 CUSTOM MUSIC:"}
            </span>
            <input
              type="text"
              value={musicUrl}
              onChange={(e) => handleMusicUrlChange(e.target.value)}
              placeholder={lang === "id" ? "Tempel URL Live Audio / MP3" : "Paste Live Audio / MP3 format URL"}
              className="w-full bg-transparent text-[11px] text-white placeholder-gray-600 focus:outline-none border-none outline-none focus:ring-0 p-0"
              title={lang === "id" ? "Masukkan URL musik latar pilihan Anda secara manual (.mp3/ .wav)" : "Manually enter background track music URL (.mp3 or .wav format)"}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={handleToggleMusic}
            className={`border px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-xl ${
              isPlayingCustomMusic || isPlayingAnthem
                ? "bg-blue-650 border-blue-400/50 text-white"
                : "bg-white/5 border-white/10 hover:border-blue-500/40 text-blue-400 hover:text-blue-300"
            }`}
          >
            <Volume2 className={`w-4 h-4 ${(isPlayingCustomMusic || isPlayingAnthem) ? "animate-bounce" : ""}`} /> 
            {isPlayingCustomMusic ? (lang === "id" ? "JEDA MUSIK" : "PAUSE SOUND") : (lang === "id" ? "ANTHEM / PLAY" : "PLAY ANTHEM")}
          </button>
          <button
            onClick={onClose}
            className="bg-white/5 border border-white/10 text-gray-400 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-xl hover:border-rose-500/40 active:scale-95 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" /> {lang === "id" ? "Tutup" : "Close"}
          </button>
        </div>
      </div>

      {/* Cinematic Team & Strategy Overhead Title Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-1.5 my-4 z-10 flex flex-col items-center justify-center text-center"
      >
        {teamLogo && (
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            src={teamLogo}
            className="w-16 h-16 object-contain mb-1 shadow-xl bg-black/35 p-1 rounded-xl border border-white/10"
            alt="Logo"
            referrerPolicy="no-referrer"
          />
        )}
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-wider uppercase drop-shadow-xl select-none">
          {teamName || "GARUDA FC"}
        </h2>
        <p className="text-xs text-blue-400 font-extrabold tracking-widest uppercase flex items-center justify-center gap-1.5 mt-1">
          <Layers className="w-3.5 h-3.5" /> {lang === "id" ? "FORMASI TAKTIS:" : "TACTICAL FORMATION:"} {formationName}
        </p>
      </motion.div>

      {/* CORE STAGE: Interactive Pitch Board Screen */}
      <div className="w-full max-w-3xl flex flex-col gap-4 z-10 items-center justify-center">
        
        {/* Pitch frame wrapper focused on TV monitoring quality */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative w-full aspect-[16/10] bg-gradient-to-b from-[#0a180f] via-[#09150e] to-[#060e0a] border border-white/10 rounded-2xl p-4 overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.06)]"
          id="broadcastTacticalPitch"
        >
          {/* Pitch grass vertical pattern lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_48px] pointer-events-none" />

          {/* Fully featured vector-mapped pitch line markings */}
          <div className="absolute inset-4 border border-white/10 rounded-lg pointer-events-none">
            {/* Center Line & Circle */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10" />
            <div className="absolute top-1/2 left-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 border border-white/10 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white/20 rounded-full" />
            </div>

            {/* Top Penalty Box */}
            <div className="absolute top-0 left-1/4 right-1/4 h-24 border-b border-x border-white/10 flex items-end justify-center">
              <div className="w-20 h-8 border-b border-x border-white/5 opacity-50" />
            </div>
            {/* Top Penalty Half Arc */}
            <div className="absolute top-20 left-1/2 w-16 h-10 -translate-x-1/2 border-b border-white/10 rounded-b-full opacity-60" />

            {/* Bottom Penalty Box */}
            <div className="absolute bottom-0 left-1/4 right-1/4 h-24 border-t border-x border-white/10 flex items-start justify-center">
              <div className="w-20 h-8 border-t border-x border-white/5 opacity-50" />
            </div>
            {/* Bottom Penalty Half Arc */}
            <div className="absolute bottom-20 left-1/2 w-16 h-10 -translate-x-1/2 border-t border-white/10 rounded-t-full opacity-60" />

            {/* Corner Arcs */}
            <div className="absolute top-0 left-0 w-4 h-4 border-b border-r border-white/10 rounded-br-full" />
            <div className="absolute top-0 right-0 w-4 h-4 border-b border-l border-white/10 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-t border-r border-white/10 rounded-tr-full" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-t border-l border-white/10 rounded-tl-full" />
          </div>

          {/* Players rendered dynamically onto their coordinated pitch zones */}
          {pitchMounted && renderingPlayers.map((player) => {
            // "kemunculannya dibuat sesuai formasi" -> index delayed entrance
            const roleDelay = player.role === "GK" ? 0.15 : player.role === "DEF" ? 0.35 : player.role === "MID" ? 0.55 : 0.75;
            
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.4, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 90,
                  damping: 14,
                  delay: roleDelay,
                }}
                style={{
                  position: "absolute",
                  left: `${player.x}%`,
                  top: `${player.y}%`,
                }}
                className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-20 group"
              >
                {/* Dynamic Brand Color Circle Border based on user priority roles */}
                <div className={`relative w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[11px] md:text-xs font-black text-white shadow-xl transition-all duration-500 border-2 ${
                  player.role === "GK"
                    ? "bg-amber-600 border-amber-300 shadow-amber-600/30"
                    : player.role === "DEF"
                    ? "bg-blue-600 border-blue-300 shadow-blue-600/30"
                    : player.role === "MID"
                    ? "bg-emerald-600 border-emerald-300 shadow-emerald-600/30"
                    : "bg-rose-600 border-rose-300 shadow-rose-600/30"
                }`}>
                  {/* Gentle pulsing radar outline */}
                  <span className="absolute -inset-1.5 rounded-full border border-white/15 animate-ping opacity-30" />
                  {player.number}
                </div>

                {/* Name tag with high-contrast drop shadow */}
                <span className="mt-1 bg-black/85 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-black text-gray-200 uppercase tracking-widest leading-none drop-shadow-md">
                  {player.name}
                </span>
                <span className="text-[7px] font-bold text-gray-500 tracking-wider uppercase">
                  {player.role}
                </span>
              </motion.div>
            );
          })}

          {/* Coordinated Playbook items (Balls or Cones) */}
          {pitchMounted && renderingItems.map((item) => {
            const originalItem = items.find((i) => i.id === item.id);
            const isBall = originalItem ? originalItem.type === "ball" : item.id.includes("ball");
            return (
              <motion.div
                key={item.id}
                style={{
                  position: "absolute",
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-35"
              >
                {isBall ? (
                  <div className="w-4 h-4 bg-white rounded-full border-2 border-black flex items-center justify-center shadow-2xl relative">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                    <span className="absolute -inset-2 bg-white/20 rounded-full animate-ping opacity-30" />
                  </div>
                ) : (
                  <div className="w-4 h-4 border-b-[8px] border-orange-500 border-x-4 border-x-transparent" />
                )}
              </motion.div>
            );
          })}

          {/* Active play watermark */}
          <div className="absolute bottom-3 right-4 text-[9px] font-bold text-white/10 uppercase tracking-widest font-mono">
            TACTIGEN BROADCAST v3.1
          </div>
        </motion.div>

        {/* Phase timeline & play controls bar */}
        {frames && frames.length > 0 && (
          <div className="w-full bg-[#111116] border border-white/5 rounded-xl p-3 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingSimulation(!isPlayingSimulation)}
                className={`p-2 rounded-lg text-white transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                  isPlayingSimulation ? "bg-amber-600 hover:bg-amber-500" : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {isPlayingSimulation ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlayingSimulation ? (lang === "id" ? "JEDA" : "PAUSE") : (lang === "id" ? "SIMULASI PLAYBACK" : "SIMULATE PLAYBACK")}
              </button>

              <button
                onClick={handleExportGif}
                disabled={isExportingGif}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-2 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {isExportingGif ? (lang === "id" ? "MENGEKSPOR..." : "EXPORTING...") : (lang === "id" ? "EKSPOR GIF ANIMASI" : "EXPORT ANIMATED GIF")}
              </button>
            </div>

            {/* Stages navigation indicator pills */}
            <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-lg border border-white/5">
              {frames.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveFrameIndex(idx);
                    setIsPlayingSimulation(false);
                  }}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase rounded ${
                    activeFrameIndex === idx
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {lang === "id" ? "Fase" : "Phase"} {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic prompt active instructions display */}
        {currentFrame && (
          <div className="w-full bg-blue-950/15 border border-blue-500/20 p-3.5 rounded-xl text-center shadow">
            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase block w-max mx-auto mb-1">
              {currentFrame.name}
            </span>
            <p className="text-xs text-blue-100 font-medium leading-relaxed italic">
              "{currentFrame.instruction}"
            </p>
          </div>
        )}
      </div>

      {/* FOOTER SCROLLING COACH TICKER SYSTEM */}
      <div className="w-full h-12 bg-[#050508] border-t border-white/10 flex items-center relative z-10 overflow-hidden mt-6">
        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 flex items-center font-bold text-white text-[11px] tracking-widest uppercase shrink-0 gap-1.5 shadow-lg select-none">
          <Gamepad2 className="w-4 h-4 animate-bounce" /> LIVE STRATEGIST REPORT
        </div>

        <div className="w-full overflow-hidden whitespace-nowrap relative flex items-center">
          <div className="inline-block animate-[marquee_25s_linear_infinite] pl-[100%] text-xs font-bold text-gray-300 tracking-wide">
            🔥 COACH ANALYST LIVE: Skenario pergerakan {teamName || "GARUDA FC"} dalam fase {currentFrame?.name || "Transisi"} diinstruksikan agar winger melakukan over-lap lebar. Duet bek sayap membantu sirkulasi pendek sebelum melepas umpan vertikal langsung menuju sepertiga lapangan lawan. Jaga disiplin pertahanan ketat gawang!
          </div>
        </div>
      </div>

      {/* LOADING MODAL CONTAINER FOR ANIMATED GIF RENDERING */}
      <AnimatePresence>
        {isExportingGif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-250 p-6"
          >
            <div className="bg-[#101014] border border-white/10 p-6 rounded-2xl max-w-sm text-center shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mx-auto mb-2" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Melahirkan Animasi GIF</h4>
                <p className="text-xs text-gray-400 mt-1">Mengumpulkan snapshot geometris frame koordinat...</p>
              </div>

              {/* Progress bar info layout */}
              <div className="space-y-1">
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>Merekam Canvas</span>
                  <span>{exportProgress}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
