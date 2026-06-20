import { useEffect, useRef, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Player, TacticalItem, DrawingStroke } from "../types";
import { Trash2, AlertCircle, Sparkles } from "lucide-react";

interface PitchProps {
  players: Player[];
  items: TacticalItem[];
  primaryColor: string;
  gkColor: string;
  numberColor: string;
  activeTool: "select" | "draw";
  brushColor: string;
  brushSize: number;
  brushStyle: "solid" | "arrow";
  customBackgroundUrl: string | null;
  drawHistory: DrawingStroke[];
  setDrawHistory: (history: DrawingStroke[] | ((prev: DrawingStroke[]) => DrawingStroke[])) => void;
  onUpdatePlayerPosition: (id: string, x: number, y: number) => void;
  onUpdateItemPosition: (id: string, x: number, y: number) => void;
  onRemoveItem: (id: string) => void;
  onDblClickPlayer: (id: string) => void;
  onSidelineSwap: (sidelinePlayerId: string, starterPlayerId: string) => void;
  onPromotePlayer: (sidelinePlayerId: string, x: number, y: number) => void;
  onDemotePlayer: (id: string) => void;
  pitchTheme?: "emerald-grass" | "neon-hologram" | "dark-slate" | "aurora-stadium";
}

export default function Pitch({
  players,
  items,
  primaryColor,
  gkColor,
  numberColor,
  activeTool,
  brushColor,
  brushSize,
  brushStyle,
  customBackgroundUrl,
  drawHistory,
  setDrawHistory,
  onUpdatePlayerPosition,
  onUpdateItemPosition,
  onRemoveItem,
  onDblClickPlayer,
  onSidelineSwap,
  onPromotePlayer,
  onDemotePlayer,
  pitchTheme = "emerald-grass"
}: PitchProps) {
  const pitchRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<"player" | "item" | null>(null);

  // Active starting XI vs substitutes
  const starters = players.filter((p) => p.isStarting);

  // Reset/Resize canvas to fit exact dimensions of pitch wrapper
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = pitchRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawAllStrokes();
    };

    // Delay slight bit to ensure DOM elements layout
    const timer = setTimeout(handleResize, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [drawHistory]);

  const drawAllStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawHistory.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.style === "arrow") {
        ctx.setLineDash([8, 8]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();

      if (stroke.style === "arrow") {
        // Draw standard proportional arrowhead
        drawArrowhead(ctx, stroke.points, stroke.color, stroke.size);
      }
    });
  };

  const drawArrowhead = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    color: string,
    size: number
  ) => {
    if (points.length < 2) return;
    const end = points[points.length - 1];
    const prev = points[Math.max(0, points.length - 4)]; // Smooth vector anchor points
    const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
    const arrowLength = size * 3 + 8;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.setLineDash([]);
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle - Math.PI / 6),
      end.y - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle + Math.PI / 6),
      end.y - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  // --- DRAW EVENTS ---
  const handleMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "draw") return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setLastPoint({ x, y });
    setDrawHistory((prev) => [
      ...prev,
      {
        color: brushColor,
        size: brushSize,
        style: brushStyle,
        points: [{ x, y }]
      }
    ]);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== "draw" || !lastPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawHistory((prev) => {
      const updated = [...prev];
      if (updated.length === 0) return prev;
      const current = { ...updated[updated.length - 1] };
      current.points = [...current.points, { x, y }];
      updated[updated.length - 1] = current;
      return updated;
    });

    setLastPoint({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  // --- TOUCH SUPPORT DRAWING ---
  const handleTouchStart = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    if (activeTool !== "draw" || e.touches.length !== 1) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    setLastPoint({ x, y });
    setDrawHistory((prev) => [
      ...prev,
      {
        color: brushColor,
        size: brushSize,
        style: brushStyle,
        points: [{ x, y }]
      }
    ]);
  };

  const handleTouchMove = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== "draw" || !lastPoint || e.touches.length !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    setDrawHistory((prev) => {
      const updated = [...prev];
      if (updated.length === 0) return prev;
      const current = { ...updated[updated.length - 1] };
      current.points = [...current.points, { x, y }];
      updated[updated.length - 1] = current;
      return updated;
    });

    setLastPoint({ x, y });
  };

  // Re-draw on stroke update
  useEffect(() => {
    drawAllStrokes();
  }, [drawHistory]);

  // --- DRAGGING CODES ---
  const handleDragStart = (id: string, type: "player" | "item") => {
    if (activeTool !== "select") return;
    setDraggedId(id);
    setDraggedType(type);
  };

  const handleContainerMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!draggedId || !draggedType || activeTool !== "select") return;
    const container = pitchRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Convert to percentage coordinate limits
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;

    const x = Math.max(2, Math.min(98, parseFloat(rawX.toFixed(1))));
    const y = Math.max(2, Math.min(98, parseFloat(rawY.toFixed(1))));

    if (draggedType === "player") {
      onUpdatePlayerPosition(draggedId, x, y);
    } else {
      onUpdateItemPosition(draggedId, x, y);
    }
  };

  const handleContainerTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (!draggedId || !draggedType || activeTool !== "select" || e.touches.length !== 1) return;
    const container = pitchRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;

    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;

    const x = Math.max(2, Math.min(98, parseFloat(rawX.toFixed(1))));
    const y = Math.max(2, Math.min(98, parseFloat(rawY.toFixed(1))));

    if (draggedType === "player") {
      onUpdatePlayerPosition(draggedId, x, y);
    } else {
      onUpdateItemPosition(draggedId, x, y);
    }
  };

  const handleDragEnd = () => {
    if (draggedId && draggedType === "player") {
      const activePlayer = players.find((p) => p.id === draggedId);
      // Auto demote to bench if dragged to bottom sidebar zone (y > 85%)
      if (activePlayer && activePlayer.isStarting && activePlayer.y > 84) {
        onDemotePlayer(draggedId);
      }
    }
    setDraggedId(null);
    setDraggedType(null);
  };

  // Drag sideline substitute to the pitch
  const handleSidelineDragStart = (e: ReactMouseEvent | ReactTouchEvent, sidelineId: string) => {
    // Save info of we're dragging a sideline substitute
    e.stopPropagation();
    const touch = 'touches' in e ? e.touches[0] : e;
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.6";

    const handlerMove = (moveEvent: MouseEvent | TouchEvent) => {
      // Intentionally empty logic, standard mouse and touch tracking is handled on target drops
    };

    const handlerEnd = (endEvent: MouseEvent | TouchEvent) => {
      target.style.opacity = "";
      document.removeEventListener("mousemove", handlerMove);
      document.removeEventListener("mouseup", handlerEnd);
      document.removeEventListener("touchmove", handlerMove);
      document.removeEventListener("touchend", handlerEnd);

      // Check where the release occurred relative to the pitch bounding box
      const container = pitchRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clientX = 'changedTouches' in endEvent ? endEvent.changedTouches[0].clientX : (endEvent as MouseEvent).clientX;
      const clientY = 'changedTouches' in endEvent ? endEvent.changedTouches[0].clientY : (endEvent as MouseEvent).clientY;

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.top + rect.height * 0.84
      ) {
        const x = parseFloat((((clientX - rect.left) / rect.width) * 100).toFixed(1));
        const y = parseFloat((((clientY - rect.top) / rect.height) * 100).toFixed(1));

        // Promote sideline to starting
        onPromotePlayer(sidelineId, x, y);
      }
    };

    document.addEventListener("mousemove", handlerMove);
    document.addEventListener("mouseup", handlerEnd);
    document.addEventListener("touchmove", handlerMove, { passive: true });
    document.addEventListener("touchend", handlerEnd);
  };

  // Define themes styling parameters
  const theme = pitchTheme || "emerald-grass";
  
  let lineStroke = "#ffffff";
  let lineOpacity = 0.5;
  let useGlow = false;
  let pitchWrapperClass = "border-slate-900 bg-emerald-950 shadow-2xl";

  if (theme === "emerald-grass") {
    lineStroke = "#ffffff";
    lineOpacity = 0.55;
    pitchWrapperClass = "border-slate-800 shadow-2xl bg-[#0b2b14]";
  } else if (theme === "neon-hologram") {
    lineStroke = "#22d3ee";
    lineOpacity = 0.85;
    useGlow = true;
    pitchWrapperClass = "border-cyan-500/80 ring-2 ring-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.2)] bg-[#020617]";
  } else if (theme === "dark-slate") {
    lineStroke = "#cbd5e1";
    lineOpacity = 0.35;
    pitchWrapperClass = "border-zinc-700 shadow-xl bg-[#0f172a]";
  } else if (theme === "aurora-stadium") {
    lineStroke = "#f472b6";
    lineOpacity = 0.7;
    pitchWrapperClass = "border-purple-600/80 ring-2 ring-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-[#090518]";
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      
      {/* Visual Canvas Wrapper representing standard soccer green pitch */}
      <div
        id="tacticalPitchWrapper"
        ref={pitchRef}
        onMouseMove={handleContainerMouseMove}
        onTouchMove={handleContainerTouchMove}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        className={`relative w-full max-w-[580px] aspect-[4/5] rounded-3xl overflow-hidden border-4 transition-all select-none ${pitchWrapperClass}`}
        style={{
          backgroundImage: customBackgroundUrl ? `url(${customBackgroundUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Animated, High-Stakes Theme Background Graphics */}
        {!customBackgroundUrl && (
          <>
            {theme === "emerald-grass" && (
              <div className="absolute inset-0 opacity-95 pointer-events-none z-0">
                <div
                  className="w-full h-full"
                  style={{
                    background: "repeating-linear-gradient(90deg, #114320, #114320 8%, #165329 8%, #165329 16%)"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.12),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.12),transparent_40%)]" />
              </div>
            )}

            {theme === "neon-hologram" && (
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                  className="w-full h-full opacity-15"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #22d3ee 1px, transparent 1px),
                      linear-gradient(to bottom, #22d3ee 1px, transparent 1px)
                    `,
                    backgroundSize: "22px 22px"
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.12),transparent_80%)]" />
                <motion.div
                  animate={{ y: ["-100%", "200%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.7)] opacity-40"
                />
                <div className="absolute top-2.5 left-3.5 font-mono text-[7px] text-cyan-400/30 uppercase tracking-widest">SYS: ONLINE</div>
                <div className="absolute bottom-2.5 right-3.5 font-mono text-[7px] text-cyan-400/30">HOLO // SENSORS OK</div>
              </div>
            )}

            {theme === "dark-slate" && (
              <div className="absolute inset-0 pointer-events-none z-0">
                <div
                  className="w-full h-full opacity-5"
                  style={{
                    backgroundImage: `radial-gradient(circle_at_center, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "18px 18px"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#151f32] to-[#0f172a]" />
                <div className="absolute top-4 left-4 border border-zinc-500/5 w-8 h-8 rounded opacity-20" />
                <div className="absolute bottom-4 right-4 border border-zinc-500/5 w-8 h-8 rounded opacity-20" />
              </div>
            )}

            {theme === "aurora-stadium" && (
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c0528] via-[#020010] to-[#030005]" />
                <div 
                  className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_25%,#6d28d9,transparent_65%),radial-gradient(circle_at_20%_75%,#db2777,transparent_65%)] filter blur-3xl animate-pulse" 
                  style={{ animationDuration: "9s" }} 
                />
                <div
                  className="w-full h-full opacity-[0.03]"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #db2777 1px, transparent 1px),
                      linear-gradient(to bottom, #6d28d9 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px"
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Stadium tactical markings standard overlay SVG */}
        <svg
          className="absolute inset-0 w-full h-[84%] pointer-events-none z-10"
          style={{ opacity: lineOpacity }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {useGlow && (
            <defs>
              <filter id="neon-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}
          
          {/* Pitch borders */}
          <rect x="3" y="3" width="94" height="94" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
          
          {/* Halfway line */}
          <line x1="3" y1="50" x2="97" y2="50" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
          <circle cx="50" cy="50" r="12" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
          <circle cx="50" cy="50" r="0.8" fill={lineStroke} />

          {/* Top Penalty Box */}
          <rect x="25" y="3" width="50" height="18" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
          <rect x="38" y="3" width="24" height="6" fill="none" stroke={lineStroke} strokeWidth="0.5" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
          <circle cx="50" cy="14" r="0.6" fill={lineStroke} />
          <path d="M 40 21 A 12 12 0 0 0 60 21" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />

          {/* Bottom Penalty Box */}
          <rect x="25" y="79" width="50" height="18" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
          <rect x="38" y="91" width="24" height="6" fill="none" stroke={lineStroke} strokeWidth="0.5" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
          <circle cx="50" cy="86" r="0.6" fill={lineStroke} />
          <path d="M 40 79 A 12 12 0 0 1 60 79" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
        </svg>

        {/* DRAWING CANVAS FOR COUCH ROUTINES */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className={`absolute inset-0 w-full h-[84%] z-20 ${
            activeTool === "draw" ? "cursor-pencil pointer-events-auto" : "pointer-events-none"
          }`}
        />

        {/* INTERACTIVE PLAYERS AND DRAGGABLE BALLS & CONES */}
        <div className="absolute inset-0 w-full h-[84%] z-30 pointer-events-none">
          <AnimatePresence>
            {starters.map((player) => {
              const isGK = player.role === "GK";
              const currentBg = isGK ? gkColor : primaryColor;
              const isSelected = draggedId === player.id;

              return (
                <motion.div
                  key={player.id}
                  layoutId={`player-node-${player.id}`}
                  animate={{
                    left: `${player.x}%`,
                    top: `${player.y}%`
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 24,
                    layout: { duration: 0.2 }
                  }}
                  onMouseDown={() => handleDragStart(player.id, "player")}
                  onTouchStart={() => handleDragStart(player.id, "player")}
                  onDoubleClick={() => onDblClickPlayer(player.id)}
                  className={`absolute pointer-events-auto flex flex-col items-center justify-center -translate-x-[50%] -translate-y-[50%] origin-center group ${
                    activeTool === "select" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                  }`}
                  style={{
                    position: "absolute",
                    touchAction: "none"
                  }}
                >
                  {/* Jersey Element or Avatar Picture */}
                  <div
                    className={`relative w-12 h-12 rounded-full border-2 border-black/50 shadow-lg flex items-center justify-center transition-all ${
                      isSelected ? "scale-115 ring-2 ring-blue-500 border-blue-500" : "group-hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: player.photo ? "#15151a" : currentBg,
                      color: player.photo ? "#fff" : numberColor
                    }}
                  >
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full pointer-events-none"
                      />
                    ) : (
                      <span className="font-extrabold text-sm pointer-events-none select-none">
                        {player.number}
                      </span>
                    )}

                    {/* Small number overlay badge if profile image avatar exists */}
                    {player.photo && (
                      <span className="absolute -bottom-1 -right-1 text-[8px] font-black w-4.5 h-4.5 bg-[#0a0a0c] border border-white/10 text-blue-400 rounded-full flex items-center justify-center select-none shadow">
                        {player.number}
                      </span>
                    )}
                  </div>

                  {/* Player Name Tag */}
                  <div className="mt-1.5 px-2 py-0.5 bg-[#0f0f12]/95 backdrop-blur-md rounded-md border border-white/10 text-[10px] text-white font-bold whitespace-nowrap shadow select-none uppercase tracking-wide">
                    {player.name}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* DRAGGABLE TACTICAL ITEMS */}
          <AnimatePresence>
            {items.map((item) => {
              const isSelected = draggedId === item.id;
              return (
                <motion.div
                  key={item.id}
                  animate={{
                    left: `${item.x}%`,
                    top: `${item.y}%`
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 24
                  }}
                  onMouseDown={() => handleDragStart(item.id, "item")}
                  onTouchStart={() => handleDragStart(item.id, "item")}
                  onDoubleClick={() => onRemoveItem(item.id)}
                  className={`absolute pointer-events-auto flex items-center justify-center -translate-x-[50%] -translate-y-[50%] ${
                    activeTool === "select" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                  }`}
                  style={{
                    position: "absolute",
                    touchAction: "none"
                  }}
                >
                  <div
                    className={`relative flex items-center justify-center transition-all ${
                      isSelected ? "scale-120" : "hover:scale-110"
                    }`}
                  >
                    {item.type === "ball" ? (
                      <div className="w-6 h-6 bg-white border border-slate-950 rounded-full flex items-center justify-center shadow-md text-slate-950">
                        <span className="text-[12px] font-black">⚽</span>
                      </div>
                    ) : (
                      <div className="text-amber-500 filter drop-shadow-md leading-none">
                        <span className="text-2xl">⚠️</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* BOTTOM SECTION: DETACH RECTANGLE ZONE AS THE SQUAD BENCH (16% HEIGHT) */}
        <div className="absolute bottom-0 left-0 right-0 h-[16%] bg-[#0f0f12]/95 backdrop-blur-md border-t border-white/10 flex flex-col justify-start p-2.5 z-40">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-black text-gray-400 tracking-wider uppercase flex items-center gap-1">
              👥 Bangku Cadangan (Dugout)
            </span>
            <span className="text-[8px] text-gray-500 italic">
              Seret pemain ke atas untuk memasukkannya ke lapangan
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto overflow-y-hidden py-1 h-full scrollbar-none items-center pr-12">
            <AnimatePresence>
              {players
                .filter((p) => !p.isStarting)
                .map((sub) => {
                  const currentBg = sub.role === "GK" ? gkColor : primaryColor;
                  return (
                    <motion.div
                      key={sub.id}
                      layoutId={`player-node-${sub.id}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onMouseDown={(e) => handleSidelineDragStart(e, sub.id)}
                      onTouchStart={(e) => handleSidelineDragStart(e, sub.id)}
                      onDoubleClick={() => onDblClickPlayer(sub.id)}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-2.5 py-1.5 h-11 shrink-0 cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-all select-none"
                    >
                      {sub.photo ? (
                        <img
                          src={sub.photo}
                          alt={sub.name}
                          className="w-7 h-7 rounded-full object-cover border border-white/10 pointer-events-none"
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[10px] pointer-events-none"
                          style={{ backgroundColor: currentBg, color: numberColor }}
                        >
                          {sub.number}
                        </div>
                      )}
                      
                      <div className="flex flex-col justify-center select-none pointer-events-none">
                        <span className="text-[10px] font-black text-white whitespace-nowrap leading-tight">
                          {sub.name}
                        </span>
                        <span className="text-[8px] font-extrabold text-gray-500 uppercase tracking-widest leading-none">
                          {sub.role}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
            {players.filter((p) => !p.isStarting).length === 0 && (
              <span className="text-[10px] text-gray-600 italic">Bangku cadangan kosong. Tarik pemain ke bawah untuk mencadangkan.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
