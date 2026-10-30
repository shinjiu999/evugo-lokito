import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, X, Palette } from "lucide-react";

export type NanoToolId =
  | "formation"
  | "studio"
  | "poster"
  | "rules"
  | "enemy"
  | "squad"
  | "import"
  | "theme"
  | "fullscreen"
  | "exit_fullscreen"
  | "reset"
  | "tv"
  | "download"
  | "guide"
  | "settings"
  | "android"
  | "pc"
  | "corner_sim"
  | "corner_left"
  | "corner_right"
  | "corner_short"
  | "animation"
  | "ai_coach"
  | "overlay_clean"
  | "overlay_corner"
  | "overlay_18z"
  | "overlay_lanes"
  | "overlay_block"
  | "measure"
  | "briefing"
  | "telemetry"
  | "drag"
  | "draw"
  | "toolkit"
  | "nano_studio"
  | "sort_role"
  | "sort_number"
  | "sort_name";

export type NanoIconSkin = "tosca_glass" | "emerald_cyber" | "cyan_holo" | "gold_pro";

const STORAGE_KEY_ICONS = "nano_banana_tool_icons_v1";
const STORAGE_KEY_SKIN = "nano_banana_icon_skin_v1";

export function getSavedNanoToolIcons(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ICONS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSavedNanoSkin(): NanoIconSkin {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SKIN) as NanoIconSkin;
    if (raw && ["tosca_glass", "emerald_cyber", "cyan_holo", "gold_pro"].includes(raw)) {
      return raw;
    }
  } catch {}
  return "tosca_glass";
}

interface ToolHoverTooltipProps {
  title: string;
  category?: string;
  badge?: string;
  align?: "center" | "left" | "right";
  placement?: "top" | "bottom" | "left";
}

/**
 * Portal-rendered floating tooltip that appears when hovering over any tool button.
 * Rendered directly in document.body with position: fixed and z-index: 999999
 * so it NEVER gets stacked behind or clipped by any button, bar, or container.
 */
export function ToolHoverTooltip({
  title,
  category,
  badge,
  align = "center",
  placement = "top"
}: ToolHoverTooltipProps) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    const parent = anchorRef.current?.parentElement;
    if (!parent) return;
    setRect(parent.getBoundingClientRect());
  }, []);

  useEffect(() => {
    const parent = anchorRef.current?.parentElement;
    if (!parent) return;

    const handleEnter = () => {
      setRect(parent.getBoundingClientRect());
      setIsVisible(true);
    };
    const handleLeave = () => {
      setIsVisible(false);
    };
    const handlePointerDown = () => {
      setIsVisible(false);
    };

    parent.addEventListener("mouseenter", handleEnter);
    parent.addEventListener("mouseleave", handleLeave);
    parent.addEventListener("focusin", handleEnter);
    parent.addEventListener("focusout", handleLeave);
    parent.addEventListener("mousedown", handlePointerDown);
    parent.addEventListener("touchstart", handleLeave, { passive: true });

    return () => {
      parent.removeEventListener("mouseenter", handleEnter);
      parent.removeEventListener("mouseleave", handleLeave);
      parent.removeEventListener("focusin", handleEnter);
      parent.removeEventListener("focusout", handleLeave);
      parent.removeEventListener("mousedown", handlePointerDown);
      parent.removeEventListener("touchstart", handleLeave);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const handleScrollOrResize = () => {
      updateRect();
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isVisible, updateRect]);

  if (!isVisible || !rect || typeof document === "undefined") {
    return <span ref={anchorRef} className="hidden" aria-hidden="true" />;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Smart placement flip if too close to viewport edges
  let resolvedPlacement = placement;
  if (placement === "left" && rect.left < 190) {
    resolvedPlacement = rect.top > 64 ? "top" : "bottom";
  } else if (placement === "top" && rect.top < 56) {
    resolvedPlacement = "bottom";
  } else if (placement === "bottom" && vh - rect.bottom < 56) {
    resolvedPlacement = "top";
  }

  let portalNode: React.ReactNode = null;

  if (resolvedPlacement === "left") {
    const topPx = Math.max(16, Math.min(vh - 16, rect.top + rect.height / 2));
    const rightPx = Math.max(8, vw - rect.left + 10);

    portalNode = (
      <div
        style={{
          position: "fixed",
          top: `${topPx}px`,
          right: `${rightPx}px`,
          transform: "translateY(-50%)",
          zIndex: 999999,
          pointerEvents: "none"
        }}
        className="bg-[#041318] border border-teal-400/60 px-2.5 py-1.5 rounded-xl shadow-[0_14px_34px_rgba(0,0,0,0.95)] text-[10px] whitespace-nowrap flex flex-col items-end gap-0.5 ring-1 ring-black/80 animate-fadeIn"
      >
        {category && (
          <span className="text-[7.5px] font-black tracking-widest text-teal-300 uppercase leading-none">
            {category}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-white font-extrabold tracking-tight">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.2 rounded bg-teal-400/20 border border-teal-400/45 text-teal-200 font-mono tabular-nums text-[8.5px] font-black">
              {badge}
            </span>
          )}
        </div>
        <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-[#041318] rotate-45 border-t border-r border-teal-400/60" />
      </div>
    );
  } else {
    // Resolved horizontal alignment with automatic viewport edge protection
    let resolvedAlign = align;
    const centerX = rect.left + rect.width / 2;
    if (centerX < 110) resolvedAlign = "left";
    else if (vw - centerX < 110) resolvedAlign = "right";

    const posStyle: React.CSSProperties = {
      position: "fixed",
      zIndex: 999999,
      pointerEvents: "none"
    };

    if (resolvedPlacement === "bottom") {
      posStyle.top = `${Math.min(vh - 38, rect.bottom + 9)}px`;
    } else {
      posStyle.bottom = `${Math.min(vh - 10, vh - rect.top + 9)}px`;
    }

    let arrowAlignClass = "left-1/2 -translate-x-1/2";
    if (resolvedAlign === "left") {
      posStyle.left = `${Math.max(8, rect.left)}px`;
      arrowAlignClass = "left-3.5";
    } else if (resolvedAlign === "right") {
      posStyle.right = `${Math.max(8, vw - rect.right)}px`;
      arrowAlignClass = "right-3.5";
    } else {
      posStyle.left = `${centerX}px`;
      posStyle.transform = "translateX(-50%)";
      arrowAlignClass = "left-1/2 -translate-x-1/2";
    }

    portalNode = (
      <div
        style={posStyle}
        className="bg-[#041318] border border-teal-400/60 px-2.5 py-1.5 rounded-xl shadow-[0_14px_34px_rgba(0,0,0,0.95)] text-[10px] whitespace-nowrap flex flex-col items-center gap-0.5 ring-1 ring-black/80 animate-fadeIn"
      >
        {resolvedPlacement === "bottom" && (
          <div
            className={`absolute bottom-full ${arrowAlignClass} -mb-1 w-2 h-2 bg-[#041318] rotate-45 border-l border-t border-teal-400/60`}
          />
        )}
        {category && (
          <span className="text-[7.5px] font-black tracking-widest text-teal-300 uppercase leading-none">
            {category}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-white font-extrabold tracking-tight">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.2 rounded bg-teal-400/20 border border-teal-400/45 text-teal-200 font-mono tabular-nums text-[8.5px] font-black">
              {badge}
            </span>
          )}
        </div>
        {resolvedPlacement === "top" && (
          <div
            className={`absolute top-full ${arrowAlignClass} -mt-1 w-2 h-2 bg-[#041318] rotate-45 border-r border-b border-teal-400/60`}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <span ref={anchorRef} className="hidden" aria-hidden="true" />
      {createPortal(portalNode, document.body)}
    </>
  );
}

interface NanoBananaLogoProps {
  tool: NanoToolId;
  size?: "xs" | "sm" | "md" | "lg";
  active?: boolean;
  danger?: boolean;
}

/**
 * Bespoke Nano Banana 3D-styled glassmorphic vector/AI emblem for UI tools.
 * Renders custom Gemini 2.5 Flash Image icon if generated by user, or procedural
 * multi-layered Soft Sporty Tosca Nano Banana vector badge.
 */
export function NanoBananaLogo({
  tool,
  size = "md",
  active = false,
  danger = false
}: NanoBananaLogoProps) {
  const [customIcons, setCustomIcons] = useState<Record<string, string>>(() => getSavedNanoToolIcons());
  const [skin, setSkin] = useState<NanoIconSkin>(() => getSavedNanoSkin());

  useEffect(() => {
    const sync = () => {
      setCustomIcons(getSavedNanoToolIcons());
      setSkin(getSavedNanoSkin());
    };
    window.addEventListener("nano-banana-icons-updated", sync);
    return () => window.removeEventListener("nano-banana-icons-updated", sync);
  }, []);

  const dimClass =
    size === "xs"
      ? "w-4 h-4"
      : size === "sm"
      ? "w-5 h-5"
      : size === "lg"
      ? "w-7 h-7"
      : "w-6 h-6";

  const customUrl = customIcons[tool];
  if (customUrl) {
    return (
      <img
        src={customUrl}
        alt={tool}
        className={`${dimClass} rounded-lg object-cover shadow-sm pointer-events-none select-none`}
      />
    );
  }

  // Skin palette tokens
  const palette =
    danger
      ? { c1: "#fb7185", c2: "#e11d48", glow: "rgba(244,63,94,0.35)" }
      : active
      ? { c1: "#042f2e", c2: "#0f172a", glow: "rgba(15,23,42,0.25)" }
      : skin === "emerald_cyber"
      ? { c1: "#34d399", c2: "#059669", glow: "rgba(16,185,129,0.35)" }
      : skin === "cyan_holo"
      ? { c1: "#38bdf8", c2: "#0284c7", glow: "rgba(56,189,248,0.35)" }
      : skin === "gold_pro"
      ? { c1: "#fbbf24", c2: "#d97706", glow: "rgba(245,158,11,0.35)" }
      : { c1: "#2dd4bf", c2: "#10b981", glow: "rgba(45,212,191,0.35)" };

  const uid = `nb-${tool}-${skin}-${active ? "a" : "n"}`;

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={`${dimClass} shrink-0 pointer-events-none select-none transition-transform duration-150 group-hover:scale-110`}
      style={{ filter: active ? "none" : `drop-shadow(0 0 5px ${palette.glow})` }}
    >
      <defs>
        <linearGradient id={uid} x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.c1} />
          <stop offset="100%" stopColor={palette.c2} />
        </linearGradient>
      </defs>

      {/* Subtle glassmorphic inner ring */}
      <rect
        x="2"
        y="2"
        width="24"
        height="24"
        rx="7"
        stroke={`url(#${uid})`}
        strokeWidth="1.35"
        strokeOpacity={active ? "0.45" : "0.35"}
        fill={active ? "rgba(255,255,255,0.12)" : "rgba(6,24,31,0.55)"}
      />

      {/* Tool-specific Nano Banana Vector Emblem */}
      {tool === "formation" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <line x1="14" y1="7" x2="8" y2="15" strokeOpacity="0.6" />
          <line x1="14" y1="7" x2="20" y2="15" strokeOpacity="0.6" />
          <line x1="8" y1="15" x2="20" y2="15" strokeOpacity="0.6" />
          <line x1="8" y1="15" x2="14" y2="21" strokeOpacity="0.6" />
          <line x1="20" y1="15" x2="14" y2="21" strokeOpacity="0.6" />
          <circle cx="14" cy="7" r="2.3" fill={palette.c1} />
          <circle cx="8" cy="15" r="2.1" fill={palette.c1} />
          <circle cx="20" cy="15" r="2.1" fill={palette.c1} />
          <circle cx="14" cy="21" r="2.1" fill={palette.c2} />
        </g>
      )}

      {tool === "studio" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="6" width="16" height="16" rx="3" strokeOpacity="0.8" />
          <line x1="6" y1="14" x2="22" y2="14" strokeDasharray="2 2" />
          <circle cx="14" cy="14" r="3" />
          <path d="M19 6.5L21.5 9M19 9L21.5 6.5" strokeWidth="1.5" />
        </g>
      )}

      {tool === "poster" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="5.5" width="16" height="17" rx="2.8" fill={palette.c1} fillOpacity="0.16" />
          <circle cx="10.5" cy="10" r="1.6" fill={palette.c1} />
          <path d="M6.5 18.5L11.2 13.8L14.8 17.2L17.8 14.5L21.5 18.5" />
          <line x1="9.5" y1="20" x2="18.5" y2="20" strokeOpacity="0.7" />
        </g>
      )}

      {tool === "rules" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="14" r="7.5" />
          <polygon points="14,10.5 17.2,12.8 16,16.5 12,16.5 10.8,12.8" fill={palette.c1} fillOpacity="0.3" />
          <path d="M14 6.5V10.5M21 11.5L17.2 12.8M18.8 19.8L16 16.5M9.2 19.8L12 16.5M7 11.5L10.8 12.8" />
        </g>
      )}

      {tool === "enemy" && (
        <g stroke={danger || active ? "#fda4af" : `url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 5.5L21 8.5V13.8C21 18.2 18 21.4 14 22.8C10 21.4 7 18.2 7 13.8V8.5L14 5.5Z" fill="rgba(244,63,94,0.18)" />
          <path d="M11 11L17 17M17 11L11 17" strokeWidth="2.1" />
        </g>
      )}

      {tool === "squad" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 7L12 8.5H16L18.5 7L21.5 10.2L19.5 12.5L18 11.2V20.5H10V11.2L8.5 12.5L6.5 10.2L9.5 7Z" fill={palette.c1} fillOpacity="0.2" />
          <path d="M12.5 14.5H15.5M14 13V16" strokeWidth="1.7" />
        </g>
      )}

      {tool === "import" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 6.5V16.5M14 16.5L10.5 13M14 16.5L17.5 13" />
          <path d="M7.5 17.5V19.5C7.5 20.6 8.4 21.5 9.5 21.5H18.5C19.6 21.5 20.5 20.6 20.5 19.5V17.5" />
        </g>
      )}

      {tool === "theme" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 6C9.5 6 6 9.5 6 14C6 18.4 9.6 22 14 22C15.4 22 16.5 20.9 16.5 19.5C16.5 18.8 16.2 18.2 15.8 17.8C15.4 17.4 15.2 16.9 15.2 16.3C15.2 15 16.3 14 17.6 14H19C20.7 14 22 12.7 22 11C22 7.9 18.4 6 14 6Z" fill={palette.c1} fillOpacity="0.16" />
          <circle cx="10.2" cy="11.5" r="1.2" fill={palette.c1} />
          <circle cx="14" cy="9.5" r="1.2" fill={palette.c1} />
          <circle cx="17.5" cy="11" r="1.2" fill={palette.c2} />
        </g>
      )}

      {tool === "fullscreen" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 11V8H11M20 11V8H17M8 17V20H11M20 17V20H17" />
          <circle cx="14" cy="14" r="1.8" fill={palette.c1} />
        </g>
      )}

      {tool === "exit_fullscreen" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 8V11H8M17 8V11H20M11 20V17H8M17 20V17H20" />
        </g>
      )}

      {tool === "reset" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 11.5C8.6 8.6 11.4 6.8 14.6 7C18.5 7.2 21.5 10.5 21.3 14.4C21.1 18.3 17.8 21.2 13.9 21C11 20.9 8.6 19.1 7.6 16.6" />
          <path d="M7 7.5V12H11.5" />
        </g>
      )}

      {tool === "tv" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="8.5" width="16" height="11" rx="2.5" fill={palette.c1} fillOpacity="0.15" />
          <path d="M10.5 5.5L14 8.5L17.5 5.5" />
          <path d="M10 22H18" />
          <circle cx="14" cy="14" r="2" fill={palette.c1} />
        </g>
      )}

      {tool === "download" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 7V16.5M14 16.5L10.5 13M14 16.5L17.5 13" />
          <path d="M8 20.5H20" />
        </g>
      )}

      {tool === "guide" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="14" r="7.5" />
          <path d="M11.8 11.5C12.1 10.2 13.3 9.5 14.5 9.8C15.7 10.1 16.4 11.2 16 12.3C15.6 13.2 14 13.6 14 15" />
          <circle cx="14" cy="18" r="0.9" fill={palette.c1} />
        </g>
      )}

      {tool === "settings" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="14" r="3.2" fill={palette.c1} fillOpacity="0.25" />
          <path d="M14 6.5V8.5M14 19.5V21.5M6.5 14H8.5M19.5 14H21.5M8.7 8.7L10.1 10.1M17.9 17.9L19.3 19.3M19.3 8.7L17.9 10.1M10.1 17.9L8.7 19.3" />
        </g>
      )}

      {tool === "android" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="5.5" width="10" height="17" rx="2.5" fill={palette.c1} fillOpacity="0.15" />
          <line x1="12.5" y1="19.5" x2="15.5" y2="19.5" />
        </g>
      )}

      {tool === "pc" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5.5" y="7" width="17" height="11" rx="2" fill={palette.c1} fillOpacity="0.15" />
          <path d="M10.5 21H17.5M14 18V21" />
        </g>
      )}

      {(tool === "corner_sim" || tool === "corner_left") && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 21V7.5L15.5 10.2L8 13" fill={palette.c1} fillOpacity="0.35" />
          <path d="M11 19.5C15.5 19.2 19 16 20 11" strokeDasharray="2 2" />
          <path d="M18 12.2L20 10.5L21.3 12.7" />
        </g>
      )}

      {tool === "corner_right" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21V7.5L12.5 10.2L20 13" fill={palette.c1} fillOpacity="0.35" />
          <path d="M17 19.5C12.5 19.2 9 16 8 11" strokeDasharray="2 2" />
          <path d="M10 12.2L8 10.5L6.7 12.7" />
        </g>
      )}

      {tool === "corner_short" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="8,20 20,20 14,9" fill={palette.c1} fillOpacity="0.2" />
          <circle cx="8" cy="20" r="1.8" fill={palette.c1} />
          <circle cx="20" cy="20" r="1.8" fill={palette.c1} />
          <circle cx="14" cy="9" r="1.8" fill={palette.c2} />
        </g>
      )}

      {tool === "animation" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="10.5,8.5 20,14 10.5,19.5" fill={palette.c1} fillOpacity="0.35" />
        </g>
      )}

      {tool === "ai_coach" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M14 6.2L15.9 11.6L21.3 13.5L15.9 15.4L14 20.8L12.1 15.4L6.7 13.5L12.1 11.6L14 6.2Z"
            fill={palette.c1}
            fillOpacity="0.3"
          />
          <circle cx="19.5" cy="8.5" r="1.1" fill={palette.c1} />
        </g>
      )}

      {tool === "overlay_clean" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6.5" y="7.5" width="15" height="13" rx="2" />
          <line x1="14" y1="7.5" x2="14" y2="20.5" strokeOpacity="0.5" />
          <circle cx="14" cy="14" r="2.2" strokeOpacity="0.6" />
        </g>
      )}

      {tool === "overlay_corner" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 20V8H19" />
          <path d="M7 13C10.5 13 13 10.5 13 8" />
          <rect x="11" y="11" width="8" height="6" rx="1" fill={palette.c1} fillOpacity="0.25" strokeDasharray="2 1.5" />
        </g>
      )}

      {tool === "overlay_18z" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6.5" y="6.5" width="15" height="15" rx="2" />
          <line x1="11.5" y1="6.5" x2="11.5" y2="21.5" />
          <line x1="16.5" y1="6.5" x2="16.5" y2="21.5" />
          <line x1="6.5" y1="11.5" x2="21.5" y2="11.5" />
          <line x1="6.5" y1="16.5" x2="21.5" y2="16.5" />
        </g>
      )}

      {tool === "overlay_lanes" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6.5" y="6.5" width="15" height="15" rx="2" />
          <line x1="10.2" y1="6.5" x2="10.2" y2="21.5" strokeDasharray="2 2" />
          <line x1="14" y1="6.5" x2="14" y2="21.5" strokeDasharray="2 2" />
          <line x1="17.8" y1="6.5" x2="17.8" y2="21.5" strokeDasharray="2 2" />
        </g>
      )}

      {tool === "overlay_block" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6.5" y="7" width="15" height="4" rx="1" fill={palette.c1} fillOpacity="0.18" />
          <rect x="6.5" y="12" width="15" height="4" rx="1" fill={palette.c1} fillOpacity="0.35" />
          <rect x="6.5" y="17" width="15" height="4" rx="1" fill={palette.c2} fillOpacity="0.2" />
        </g>
      )}

      {tool === "measure" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 19.5L19.5 7.5" />
          <circle cx="8" cy="19" r="2" fill={palette.c1} />
          <circle cx="19" cy="8" r="2" fill={palette.c2} />
          <path d="M11 16L13 18M14 13L16 15" />
        </g>
      )}

      {tool === "briefing" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7.5" y="6.5" width="13" height="15" rx="2" fill={palette.c1} fillOpacity="0.18" />
          <line x1="10.5" y1="11" x2="17.5" y2="11" />
          <line x1="10.5" y1="14.5" x2="17.5" y2="14.5" />
          <line x1="10.5" y1="18" x2="14.5" y2="18" />
        </g>
      )}

      {tool === "telemetry" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="10" x2="20" y2="10" />
          <line x1="8" y1="14" x2="20" y2="14" />
          <line x1="8" y1="18" x2="20" y2="18" />
          <circle cx="11" cy="10" r="1.8" fill={palette.c1} />
          <circle cx="16.5" cy="14" r="1.8" fill={palette.c1} />
          <circle cx="13" cy="18" r="1.8" fill={palette.c2} />
        </g>
      )}

      {tool === "nano_studio" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6.5" y="6.5" width="6" height="6" rx="1.8" fill={palette.c1} fillOpacity="0.3" />
          <rect x="15.5" y="6.5" width="6" height="6" rx="1.8" />
          <rect x="6.5" y="15.5" width="6" height="6" rx="1.8" />
          <rect x="15.5" y="15.5" width="6" height="6" rx="1.8" fill={palette.c2} fillOpacity="0.3" />
        </g>
      )}

      {tool === "sort_role" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 6.5L19.5 9V13.5C19.5 17.2 17 20 14 21.2C11 20 8.5 17.2 8.5 13.5V9L14 6.5Z" fill={palette.c1} fillOpacity="0.2" />
        </g>
      )}

      {tool === "sort_number" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <line x1="11" y1="7.5" x2="9.5" y2="20.5" />
          <line x1="17.5" y1="7.5" x2="16" y2="20.5" />
          <line x1="7.5" y1="11.5" x2="20.5" y2="11.5" />
          <line x1="7" y1="16.5" x2="20.5" y2="16.5" />
        </g>
      )}

      {tool === "sort_name" && (
        <g stroke={`url(#${uid})`} strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 18.5L12 8.5L15.5 18.5M9.7 15.5H14.3" />
          <path d="M18.5 9.5V18.5M18.5 18.5L16.5 16.5M18.5 18.5L20.5 16.5" />
        </g>
      )}
    </svg>
  );
}

interface NanoBananaIconStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "id" | "en";
}

const CUSTOMIZABLE_TOOLS: { id: NanoToolId; labelId: string; labelEn: string }[] = [
  { id: "formation", labelId: "Pemilih Formasi", labelEn: "Formation Picker" },
  { id: "studio", labelId: "Studio Formasi", labelEn: "Formation Studio" },
  { id: "poster", labelId: "Poster HD", labelEn: "HD Poster Studio" },
  { id: "rules", labelId: "Aturan Tanding", labelEn: "Match Rules" },
  { id: "enemy", labelId: "Mode Tim Lawan", labelEn: "Opponent Mode" },
  { id: "squad", labelId: "Manajemen Skuad", labelEn: "Squad Manager" },
  { id: "import", labelId: "Impor Skuad", labelEn: "Squad Import" },
  { id: "theme", labelId: "Tema Lapangan", labelEn: "Pitch Theme" },
  { id: "corner_sim", labelId: "Simulasi Corner", labelEn: "Corner Simulator" },
  { id: "animation", labelId: "Animasi Taktis", labelEn: "Tactical Animation" },
  { id: "ai_coach", labelId: "Pelatih AI", labelEn: "AI Tactical Coach" },
  { id: "measure", labelId: "Laser Pengukur", labelEn: "Laser Measure" }
];

export function NanoBananaIconStudioModal({
  isOpen,
  onClose,
  lang
}: NanoBananaIconStudioModalProps) {
  const [skin, setSkin] = useState<NanoIconSkin>(() => getSavedNanoSkin());

  if (!isOpen) return null;

  const notifyIconUpdate = () => {
    window.dispatchEvent(new Event("nano-banana-icons-updated"));
  };

  const handleSelectSkin = (nextSkin: NanoIconSkin) => {
    setSkin(nextSkin);
    localStorage.setItem(STORAGE_KEY_SKIN, nextSkin);
    notifyIconUpdate();
  };

  return (
    <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-lg bg-[#06181f] border border-teal-400/35 rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header (No explanation below logo, no Nano Banana or Gemini 2.5 Flash Image text) */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#07222b] via-[#092b36] to-[#07222b] border-b border-teal-400/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-400/15 border border-teal-400/40 flex items-center justify-center">
              <NanoBananaLogo tool="nano_studio" size="md" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-teal-400/20 border border-teal-400/40 text-teal-200 text-[10px] font-black uppercase tracking-wider">
                UI
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Icon Studio
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-teal-100 hover:text-white cursor-pointer transition-colors"
            aria-label="Close Icon Studio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5 scrollbar-thin">
          {/* Instant 3D Vector Skin Switcher */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-extrabold text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-teal-400" />
              {lang === "id" ? "Tema Skin Ikon UI" : "UI Icon Skin Theme"}
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "tosca_glass" as NanoIconSkin, label: "Tosca Sporty Glass", dot: "bg-teal-400" },
                { id: "emerald_cyber" as NanoIconSkin, label: "Cyber Emerald 3D", dot: "bg-emerald-400" },
                { id: "cyan_holo" as NanoIconSkin, label: "Arctic Cyan Holo", dot: "bg-sky-400" },
                { id: "gold_pro" as NanoIconSkin, label: "Championship Gold", dot: "bg-amber-400" }
              ].map((s) => {
                const isSelected = skin === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSkin(s.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-teal-500/20 border-teal-400 text-white shadow-md"
                        : "bg-[#041217] border-teal-400/15 text-teal-100/75 hover:border-teal-400/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                      <span className="text-[11px] font-bold truncate">{s.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pure Logo Preview Grid (No text explanation below logos, hover reveals tooltip above) */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-1">
            {CUSTOMIZABLE_TOOLS.map((item) => {
              const label = lang === "id" ? item.labelId : item.labelEn;
              return (
                <div
                  key={item.id}
                  className="relative group bg-[#071c22] border border-teal-400/20 hover:border-teal-400/50 rounded-2xl p-3 flex items-center justify-center transition-all"
                >
                  <NanoBananaLogo tool={item.id} size="lg" />
                  <ToolHoverTooltip category="UI" title={label} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

