import { useEffect, useRef, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Player, TacticalItem, DrawingStroke } from "../types";
import { Trash2, AlertCircle, Sparkles, Plus, X } from "lucide-react";

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
  onAddBenchPlayer?: (name: string, number: number, role: "GK" | "DEF" | "MID" | "FWD") => void;
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
  onAddBenchPlayer,
  pitchTheme = "emerald-grass"
}: PitchProps) {
  const pitchRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<"player" | "item" | null>(null);

  // Bench substitute drag status tracking states
  const [activeSidelineDragId, setActiveSidelineDragId] = useState<string | null>(null);
  const [sidelineDragCoords, setSidelineDragCoords] = useState<{ x: number; y: number } | null>(null);
  const [pitchWidth, setPitchWidth] = useState(580);

  // Pop-up form states for adding a bench player directly via bench plus (+) button
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [subName, setSubName] = useState("");
  const [subNum, setSubNum] = useState("");
  const [subRole, setSubRole] = useState<"GK" | "DEF" | "MID" | "FWD">("MID");

  const resetSubForm = () => {
    setSubName("");
    setSubNum("");
    setSubRole("MID");
  };

  const handleCreateSub = () => {
    if (!subName.trim()) {
      alert("Masukkan nama pemain cadangan!");
      return;
    }
    const num = parseInt(subNum) || Math.floor(Math.random() * 89) + 12;
    if (onAddBenchPlayer) {
      onAddBenchPlayer(subName.trim(), num, subRole);
    }
    setIsAddSubOpen(false);
    resetSubForm();
  };

  // Active starting XI vs substitutes
  const starters = players.filter((p) => p.isStarting);

  // Calculate nearest starting player for quick swap highlight during sideline drag
  let swapTargetPlayerId: string | null = null;
  if (activeSidelineDragId && sidelineDragCoords) {
    let nearestDist = 12; // 12% coordinate units distance threshold
    starters.forEach((starter) => {
      const dist = Math.hypot(starter.x - sidelineDragCoords.x, starter.y - sidelineDragCoords.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        swapTargetPlayerId = starter.id;
      }
    });
  }

  // Reset/Resize canvas & trace width using a ResizeObserver to fit exact dimensions of pitch wrapper
  useEffect(() => {
    const container = pitchRef.current;
    if (!container) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      setPitchWidth(container.clientWidth);
      drawAllStrokes();
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPitchWidth(entry.contentRect.width);
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
          drawAllStrokes();
        }
      }
    });

    resizeObserver.observe(container);

    // Initial trigger
    const timer = setTimeout(handleResize, 100);

    return () => {
      resizeObserver.disconnect();
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
    
    // Find a previous point that is at least 12px away to resolve a stable and smooth direction vector
    let prev = points[0];
    for (let i = points.length - 2; i >= 0; i--) {
      const dx = end.x - points[i].x;
      const dy = end.y - points[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 12) {
        prev = points[i];
        break;
      }
    }
    
    // If all points are too close, fallback to a standard lookback index
    if (prev === points[0] && points.length > 4) {
      prev = points[points.length - 4];
    }
    
    const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
    // Dynamic arrowhead length tailored to line width/size for professional scaling
    const arrowLength = Math.max(14, size * 2.8 + 10);
    const arrowWidthAngle = Math.PI / 6.5; // Slightly narrower, sleeker angle for a modern tactical pointer

    // Calculate left, right, and indented inner-base anchor points for a modern "stealth/boomerang" arrowhead
    const leftX = end.x - arrowLength * Math.cos(angle - arrowWidthAngle);
    const leftY = end.y - arrowLength * Math.sin(angle - arrowWidthAngle);
    
    const rightX = end.x - arrowLength * Math.cos(angle + arrowWidthAngle);
    const rightY = end.y - arrowLength * Math.sin(angle + arrowWidthAngle);
    
    const indentX = end.x - arrowLength * 0.68 * Math.cos(angle);
    const indentY = end.y - arrowLength * 0.68 * Math.sin(angle);

    ctx.save();
    ctx.setLineDash([]);
    
    // 1. Draw a elegant dark drop-shadow for real professional depth on green pitch
    ctx.beginPath();
    ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
    ctx.moveTo(end.x, end.y + 1.5);
    ctx.lineTo(leftX, leftY + 1.5);
    ctx.lineTo(indentX, indentY + 1.5);
    ctx.lineTo(rightX, rightY + 1.5);
    ctx.closePath();
    ctx.fill();

    // 2. Draw the main solid arrowhead base
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(indentX, indentY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fill();

    // 3. Add a thin high-comfort white border to contrast beautifully from grass patterns
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
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

    if (draggedType === "player") {
      const x = Math.max(2, Math.min(98, parseFloat(rawX.toFixed(1))));
      const y = Math.max(2, Math.min(98, parseFloat(rawY.toFixed(1))));
      onUpdatePlayerPosition(draggedId, x, y);
    } else {
      // Items are allowed to go further outside for interactive trash-out functionality
      const x = Math.max(-10, Math.min(110, parseFloat(rawX.toFixed(1))));
      const y = Math.max(-10, Math.min(110, parseFloat(rawY.toFixed(1))));
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

    if (draggedType === "player") {
      const x = Math.max(2, Math.min(98, parseFloat(rawX.toFixed(1))));
      const y = Math.max(2, Math.min(98, parseFloat(rawY.toFixed(1))));
      onUpdatePlayerPosition(draggedId, x, y);
    } else {
      // Items are allowed to go further outside for interactive trash-out functionality
      const x = Math.max(-10, Math.min(110, parseFloat(rawX.toFixed(1))));
      const y = Math.max(-10, Math.min(110, parseFloat(rawY.toFixed(1))));
      onUpdateItemPosition(draggedId, x, y);
    }
  };

  const handleDragEnd = () => {
    if (draggedId) {
      if (draggedType === "player") {
        const activePlayer = players.find((p) => p.id === draggedId);
        // Auto demote to bench if dragged to bottom sidebar zone (y > 85%)
        if (activePlayer && activePlayer.isStarting && activePlayer.y > 84) {
          onDemotePlayer(draggedId);
        }
      } else if (draggedType === "item") {
        const activeItem = items.find((itm) => itm.id === draggedId);
        if (activeItem) {
          // If the item has been dragged outside the actual playing pitch boundaries:
          // Left < 3% or Right > 97% or Top < 3% or Bottom field bounds (entering dugout) > 84%
          if (
            activeItem.x < 3 ||
            activeItem.x > 97 ||
            activeItem.y < 3 ||
            activeItem.y > 84
          ) {
            onRemoveItem(draggedId);
          }
        }
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

    setActiveSidelineDragId(sidelineId);

    const handlerMove = (moveEvent: MouseEvent | TouchEvent) => {
      const container = pitchRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;

      const x = parseFloat((((clientX - rect.left) / rect.width) * 100).toFixed(1));
      const y = parseFloat((((clientY - rect.top) / rect.height) * 100).toFixed(1));

      setSidelineDragCoords({ x, y });
    };

    const handlerEnd = (endEvent: MouseEvent | TouchEvent) => {
      target.style.opacity = "";
      document.removeEventListener("mousemove", handlerMove);
      document.removeEventListener("mouseup", handlerEnd);
      document.removeEventListener("touchmove", handlerMove);
      document.removeEventListener("touchend", handlerEnd);

      // Check where the release occurred relative to the pitch bounding box
      const container = pitchRef.current;
      if (!container) {
        setActiveSidelineDragId(null);
        setSidelineDragCoords(null);
        return;
      }
      const rect = container.getBoundingClientRect();
      const clientX = 'changedTouches' in endEvent ? endEvent.changedTouches[0].clientX : (endEvent as MouseEvent).clientX;
      const clientY = 'changedTouches' in endEvent ? endEvent.changedTouches[0].clientY : (endEvent as MouseEvent).clientY;

      const finalX = parseFloat((((clientX - rect.left) / rect.width) * 100).toFixed(1));
      const finalY = parseFloat((((clientY - rect.top) / rect.height) * 100).toFixed(1));

      setActiveSidelineDragId(null);
      setSidelineDragCoords(null);

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.top + rect.height * 0.84
      ) {
        // Find if there is a starting player near the release point
        let nearestStarterId: string | null = null;
        let minDist = 12; // Swap threshold: 12% distance

        starters.forEach((starter) => {
          const dist = Math.hypot(starter.x - finalX, starter.y - finalY);
          if (dist < minDist) {
            minDist = dist;
            nearestStarterId = starter.id;
          }
        });

        if (nearestStarterId) {
          onSidelineSwap(sidelineId, nearestStarterId);
        } else {
          // Promote sideline to starting
          onPromotePlayer(sidelineId, finalX, finalY);
        }
      }
    };

    document.addEventListener("mousemove", handlerMove);
    document.addEventListener("mouseup", handlerEnd);
    document.addEventListener("touchmove", handlerMove, { passive: true });
    document.addEventListener("touchend", handlerEnd);
  };

  // Define themes styling parameters
  const theme = pitchTheme || "emerald-grass";

  // Auto sizing scale calculators based on current layout width to follow device sizes beautifully.
  // We use 540px as the normal baseline.
  const scaleFactor = Math.min(1.1, Math.max(0.65, pitchWidth / 540));
  const jerseySize = Math.max(28, Math.min(52, Math.round(48 * scaleFactor)));
  const fontSize = Math.max(9, Math.min(14, Math.round(13 * scaleFactor)));
  const nameFontSize = Math.max(7.5, Math.min(10.5, Math.round(10 * scaleFactor)));
  const ballSize = Math.max(16, Math.min(26, Math.round(24 * scaleFactor)));
  const ballEmojiSize = Math.max(8, Math.min(14, Math.round(12 * scaleFactor)));
  const coneSize = Math.max(15, Math.min(26, Math.round(24 * scaleFactor)));
  
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
              const isSwapTarget = swapTargetPlayerId === player.id;

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
                  {/* Glowing Exchange badge above the player */}
                  {isSwapTarget && (
                    <div className="absolute -top-7 px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-black text-[9px] font-black rounded-full uppercase flex items-center gap-1 shadow-[0_0_12px_rgba(52,211,153,0.8)] tracking-wider z-50 animate-bounce">
                      <span>SWAP 🔄</span>
                    </div>
                  )}

                  {/* Jersey Element or Avatar Picture */}
                  <div
                    className={`relative rounded-full border-2 border-black/50 shadow-lg flex items-center justify-center transition-all ${
                      isSelected ? "scale-115 ring-2 ring-blue-500 border-blue-500" : ""
                    } ${
                      isSwapTarget ? "scale-120 border-emerald-400 ring-4 ring-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.95)]" : "group-hover:scale-105"
                    }`}
                    style={{
                      width: `${jerseySize}px`,
                      height: `${jerseySize}px`,
                      backgroundColor: player.photo ? "#15151a" : currentBg,
                      color: player.photo ? "#fff" : numberColor
                    }}
                  >
                    {isSwapTarget && (
                      <div className="absolute inset-0 rounded-full ring-4 ring-emerald-400 animate-ping opacity-60 pointer-events-none" />
                    )}

                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full pointer-events-none"
                      />
                    ) : (
                      <span
                        className="font-extrabold pointer-events-none select-none"
                        style={{ fontSize: `${fontSize}px` }}
                      >
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
                  <div
                    className="mt-1 px-1.5 py-0.5 bg-[#0f0f12]/95 backdrop-blur-md rounded border border-white/10 text-white font-bold whitespace-nowrap shadow select-none uppercase tracking-wide leading-tight"
                    style={{ fontSize: `${nameFontSize}px` }}
                  >
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
               const isOutsideField = item.x < 3 || item.x > 97 || item.y < 3 || item.y > 84;
               const showDeleteIndicator = isSelected && isOutsideField;
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
                       <div
                         className={`bg-white border rounded-full flex items-center justify-center shadow-md text-slate-950 transition-all ${
                           showDeleteIndicator ? "border-red-500 bg-red-950/90 text-red-400 ring-2 ring-red-500 scale-90" : "border-slate-950"
                         }`}
                         style={{
                           width: `${ballSize}px`,
                           height: `${ballSize}px`
                         }}
                       >
                         {showDeleteIndicator ? (
                           <span style={{ fontSize: `${ballEmojiSize}px`, lineHeight: 1 }}>🗑️</span>
                         ) : (
                           <span style={{ fontSize: `${ballEmojiSize}px`, lineHeight: 1 }}>⚽</span>
                         )}
                       </div>
                     ) : (
                       <div
                         className={`filter drop-shadow-md leading-none flex items-center justify-center transition-all ${
                           showDeleteIndicator ? "text-red-500 scale-90" : "text-amber-500"
                         }`}
                         style={{
                           width: `${coneSize}px`,
                           height: `${coneSize}px`
                         }}
                       >
                         {showDeleteIndicator ? (
                           <span style={{ fontSize: `${coneSize}px` }}>🗑️</span>
                         ) : (
                           <span style={{ fontSize: `${coneSize}px` }}>⚠️</span>
                         )}
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

          <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-[85%] w-full items-center scrollbar-none pb-0.5">
            <AnimatePresence>
              {(() => {
                const subs = players.filter((p) => !p.isStarting);
                const numSubs = subs.length;

                // Continuously scale substitute indicators based on active headcount to make them fit perfectly
                const scale = Math.max(0.55, Math.min(1.0, 8 / Math.max(8, numSubs)));

                const btnHeight = Math.round(38 * scale);
                const avatarSize = Math.round(26 * scale);
                const padX = Math.round(10 * scale);
                const padY = Math.round(5 * scale);
                const itemGap = Math.round(7 * scale);
                const fontNameSize = Math.max(7, Math.round(10 * scale));
                const fontRoleSize = Math.max(6, Math.round(7.5 * scale));

                return subs.map((sub) => {
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
                      style={{
                        height: `${btnHeight}px`,
                        paddingLeft: `${padX}px`,
                        paddingRight: `${padX}px`,
                        paddingTop: `${padY}px`,
                        paddingBottom: `${padY}px`,
                        gap: `${itemGap}px`,
                        borderRadius: `${scale > 0.82 ? 12 : 8}px`,
                      }}
                      className="flex items-center bg-white/5 hover:bg-white/10 border border-white/5 shrink-0 cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-all select-none"
                    >
                      {sub.photo ? (
                        <img
                          src={sub.photo}
                          alt={sub.name}
                          style={{
                            width: `${avatarSize}px`,
                            height: `${avatarSize}px`
                          }}
                          className="rounded-full object-cover border border-white/10 pointer-events-none"
                        />
                      ) : (
                        <div
                          style={{
                            width: `${avatarSize}px`,
                            height: `${avatarSize}px`,
                            backgroundColor: currentBg,
                            color: numberColor,
                            fontSize: `${Math.max(6.5, Math.round(9.5 * scale))}px`
                          }}
                          className="rounded-full flex items-center justify-center font-extrabold pointer-events-none"
                        >
                          {sub.number}
                        </div>
                      )}
                      
                      <div className="flex flex-col justify-center select-none pointer-events-none">
                        <span
                          style={{ fontSize: `${fontNameSize}px` }}
                          className="font-black text-white whitespace-nowrap leading-tight"
                        >
                          {sub.name}
                        </span>
                        {scale > 0.65 && (
                          <span
                            style={{ fontSize: `${fontRoleSize}px` }}
                            className="font-extrabold text-gray-500 uppercase tracking-widest leading-none mt-0.5"
                          >
                            {sub.role}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </AnimatePresence>

            {/* Simple logo plus button with animated hover tooltip */}
            <div className="relative group shrink-0">
               <button
                 onClick={() => setIsAddSubOpen(true)}
                 className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-400 text-blue-400/80 border border-dashed border-blue-500/30 hover:border-blue-500/60 font-black cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-sm ml-1"
               >
                 <Plus className="w-3.5 h-3.5" />
               </button>
               
               {/* Tooltip on hover */}
               <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white font-extrabold text-[9px] py-1 px-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:bottom-10 transition-all duration-200 shadow-xl whitespace-nowrap z-[90] tracking-wider">
                 Tambah Pemain Cadangan
                 <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rotate-45 border-r border-b border-white/10 -mt-0.5"></div>
               </div>
            </div>

            {players.filter((p) => !p.isStarting).length === 0 && (
              <span className="text-[10px] text-gray-600 italic">Bangku cadangan kosong. Tarik pemain ke bawah untuk mencadangkan.</span>
            )}
          </div>
        </div>

        {/* Pop-up Modal overlay for adding substitute player */}
        <AnimatePresence>
          {isAddSubOpen && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#111115] border border-white/10 rounded-2xl p-5 w-full max-w-xs flex flex-col gap-4 shadow-2xl relative"
              >
                <button
                  onClick={() => {
                    setIsAddSubOpen(false);
                    resetSubForm();
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1 rounded-lg border-0 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Plus className="text-blue-400 w-4 h-4 animate-pulse" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Tambah Pemain Cadangan
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block">Nama Pemain</label>
                    <input
                      type="text"
                      placeholder="e.g., A. Santoso"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block">Nomor Punggung (Opsional)</label>
                    <input
                      type="number"
                      placeholder="Acak jika kosong"
                      value={subNum}
                      onChange={(e) => setSubNum(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Posisi Utama</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["GK", "DEF", "MID", "FWD"] as const).map((r) => {
                        const active = subRole === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSubRole(r)}
                            className={`py-1 rounded-lg text-[9px] font-black transition-all border cursor-pointer ${
                              active
                                ? "bg-blue-600/25 text-blue-400 border-blue-500/50"
                                : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddSubOpen(false);
                      resetSubForm();
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-all border-0 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSub}
                    className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white text-xs font-bold transition-all shadow-lg border-0 cursor-pointer active:scale-95"
                  >
                    Tambah
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
