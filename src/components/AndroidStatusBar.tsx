import React, { useState, useEffect } from "react";
import { Wifi, Battery, Smartphone, Tablet, Monitor, Volume2, VolumeX } from "lucide-react";
import { AndroidViewportSize, DeviceViewMode } from "../types";
import { soundManager } from "../utils/sound";

interface AndroidStatusBarProps {
  viewportSize: AndroidViewportSize;
  onChangeViewportSize: (size: AndroidViewportSize) => void;
  deviceMode: DeviceViewMode;
  onChangeDeviceMode: (mode: DeviceViewMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  lang: "id" | "en";
  onSetLang: (lang: "id" | "en") => void;
}

export default function AndroidStatusBar({
  viewportSize,
  onChangeViewportSize,
  deviceMode,
  onChangeDeviceMode,
  isMuted,
  onToggleMute,
  lang,
  onSetLang,
}: AndroidStatusBarProps) {
  const [timeStr, setTimeStr] = useState<string>("12:00");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#051318] border-b border-teal-400/15 select-none text-xs">
      {/* Simulated Android System Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 text-[11px] text-teal-100/80 font-mono tabular-nums border-b border-teal-400/10 bg-[#030d11]/80">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-wider">{timeStr}</span>
          <span aria-hidden="true" className="text-teal-400/50">·</span>
          <span className="text-[10px] font-sans font-semibold text-teal-300 tracking-wide">
            Tactigen Android UI
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-teal-200/70">
          <span className="text-[10px] font-bold text-teal-400">5G</span>
          <Wifi className="w-3.5 h-3.5 text-teal-300" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-teal-100 font-mono tabular-nums">98%</span>
            <Battery className="w-3.5 h-3.5 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Android Mode Controls & Viewport Sizer */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 gap-2 bg-gradient-to-r from-[#071c22] via-[#092229] to-[#071c22]">
        {/* Left: Device Viewport Mode Selection */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-teal-200/70 hidden sm:inline">
            {lang === "id" ? "Ukuran Layar:" : "Viewport:"}
          </span>
          <div className="flex bg-[#041115] border border-teal-400/20 rounded-xl p-0.5">
            <button
              onClick={() => {
                onChangeViewportSize("phone");
                soundManager.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                viewportSize === "phone"
                  ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                  : "text-teal-100/70 hover:text-white"
              }`}
              title={lang === "id" ? "Format HP Android (460px)" : "Android Phone Format (460px)"}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === "id" ? "HP" : "Phone"}</span>
            </button>
            <button
              onClick={() => {
                onChangeViewportSize("tablet");
                soundManager.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                viewportSize === "tablet"
                  ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                  : "text-teal-100/70 hover:text-white"
              }`}
              title={lang === "id" ? "Format Tablet Android (820px)" : "Android Tablet Format (820px)"}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => {
                onChangeViewportSize("fluid");
                soundManager.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                viewportSize === "fluid"
                  ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                  : "text-teal-100/70 hover:text-white"
              }`}
              title={lang === "id" ? "Adaptif Layar Penuh" : "Full Fluid Screen"}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{lang === "id" ? "Penuh" : "Full"}</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Switcher to PC Desktop Mode + Lang + Audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onToggleMute();
              soundManager.playClick();
            }}
            className="p-1.5 rounded-lg bg-[#041115] hover:bg-teal-500/15 border border-teal-400/20 text-teal-200 hover:text-white transition-all cursor-pointer"
            title={isMuted ? (lang === "id" ? "Nyalakan Suara" : "Unmute") : (lang === "id" ? "Bisukan" : "Mute")}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-teal-200/50" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
          </button>

          <div className="flex bg-[#041115] border border-teal-400/20 rounded-lg p-0.5">
            <button
              onClick={() => {
                onSetLang("id");
                soundManager.playClick();
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                lang === "id" ? "bg-teal-500 text-slate-950" : "text-teal-200/70 hover:text-white"
              }`}
            >
              ID
            </button>
            <button
              onClick={() => {
                onSetLang("en");
                soundManager.playClick();
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                lang === "en" ? "bg-teal-500 text-slate-950" : "text-teal-200/70 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => {
              onChangeDeviceMode("pc");
              soundManager.playClick();
            }}
            className="px-2.5 py-1 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/35 text-teal-200 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title={lang === "id" ? "Beralih ke Tampilan Desktop PC (Multi-Kolom)" : "Switch to Desktop PC View (Multi-Column)"}
          >
            <Monitor className="w-3.5 h-3.5 text-teal-400" />
            <span>{lang === "id" ? "Mode PC" : "PC Mode"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
