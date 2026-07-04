import { useEffect, useRef, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Player, TacticalItem, DrawingStroke, AnimationFrame } from "../types";
import { Trash2, AlertCircle, Sparkles, Plus, X } from "lucide-react";
import { soundManager } from "../utils/sound";

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
  onSwapPlayers?: (
    id1: string,
    id2: string,
    id1OriginalCoords: { x: number; y: number },
    id2OriginalCoords: { x: number; y: number }
  ) => void;
  pitchTheme?: "emerald-grass" | "neon-hologram" | "dark-slate" | "aurora-stadium";
  frames?: AnimationFrame[];
  activeFrameIndex?: number;
  showMovementTrails?: boolean;
  playSpeed?: "slow" | "normal" | "fast" | "superfast";
  transitionType?: "spring" | "linear" | "stealth" | "ease-in-out" | "elastic";
  showTacticalGrid?: boolean;
  showHeatmap?: boolean;
  lang?: "id" | "en";
  sportMode?: "soccer" | "minisoccer" | "futsal" | "custom";
  isDrawLocked?: boolean;
  activeSketchLayer?: number;
  visibleSketchLayers?: number[];
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
  onSwapPlayers,
  pitchTheme = "emerald-grass",
  frames = [],
  activeFrameIndex = 0,
  showMovementTrails = true,
  playSpeed = "normal",
  transitionType = "spring",
  showTacticalGrid = false,
  showHeatmap = false,
  lang = "id",
  sportMode = "soccer",
  isDrawLocked = false,
  activeSketchLayer = 1,
  visibleSketchLayers = [1, 2, 3]
}: PitchProps) {
  const pitchRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<"player" | "item" | null>(null);
  
  // Track starting position & swap target for on-field player swapping
  const [dragStartCoords, setDragStartCoords] = useState<{ x: number; y: number } | null>(null);
  const [activeSwapTargetId, setActiveSwapTargetId] = useState<string | null>(null);

  // Bench substitute drag status tracking states
  const [activeSidelineDragId, setActiveSidelineDragId] = useState<string | null>(null);
  const [sidelineDragCoords, setSidelineDragCoords] = useState<{ x: number; y: number } | null>(null);
  const [pitchWidth, setPitchWidth] = useState(580);

  // Grab offset and long-press timer for smooth/accurate dragging and mobile selection
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const longPressTimerRef = useRef<any>(null);

  // Pop-up form states for adding a bench player directly via bench plus (+) button
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [subName, setSubName] = useState("");
  const [subNum, setSubNum] = useState("");
  const [subRole, setSubRole] = useState<"GK" | "DEF" | "MID" | "FWD">("MID");

  // Click-to-Substitute state variables
  const [selectedSubPlayerId, setSelectedSubPlayerId] = useState<string | null>(null);
  const [clickStartInfo, setClickStartInfo] = useState<{ id: string; time: number; x: number; y: number } | null>(null);

  const handlePlayerClick = (playerId: string) => {
    const clickedPlayer = players.find((p) => p.id === playerId);
    if (!clickedPlayer) return;

    if (!selectedSubPlayerId) {
      setSelectedSubPlayerId(playerId);
      soundManager.playClick();
    } else {
      if (selectedSubPlayerId === playerId) {
        setSelectedSubPlayerId(null);
        soundManager.playClick();
      } else {
        const firstPlayer = players.find((p) => p.id === selectedSubPlayerId);
        if (!firstPlayer) {
          setSelectedSubPlayerId(playerId);
          soundManager.playClick();
          return;
        }

        // Perform swap
        if (firstPlayer.isStarting && clickedPlayer.isStarting) {
          // Both are starters: perform position swap
          if (onSwapPlayers) {
            onSwapPlayers(
              firstPlayer.id,
              clickedPlayer.id,
              { x: firstPlayer.x, y: firstPlayer.y },
              { x: clickedPlayer.x, y: clickedPlayer.y }
            );
          }
          soundManager.playChime();
          setSelectedSubPlayerId(null);
        } else if (firstPlayer.isStarting !== clickedPlayer.isStarting) {
          // One starter, one bench: perform substitution swap
          const starter = firstPlayer.isStarting ? firstPlayer : clickedPlayer;
          const sub = firstPlayer.isStarting ? clickedPlayer : firstPlayer;

          onSidelineSwap(sub.id, starter.id);
          soundManager.playChime();
          setSelectedSubPlayerId(null);
        } else {
          // Both are bench players: shift selection to the newly clicked player
          setSelectedSubPlayerId(playerId);
          soundManager.playClick();
        }
      }
    }
  };

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

  // Set transition dynamically based on playSpeed and transitionType
  let dynamicTransition: any = { type: "spring", stiffness: 180, damping: 24 };
  if (transitionType === "linear") {
    const duration = playSpeed === "slow" ? 2.5 : playSpeed === "fast" ? 0.8 : playSpeed === "superfast" ? 0.4 : 1.6;
    dynamicTransition = {
      type: "tween",
      ease: "linear",
      duration: duration
    };
  } else if (transitionType === "stealth") {
    const duration = playSpeed === "slow" ? 2.5 : playSpeed === "fast" ? 0.8 : playSpeed === "superfast" ? 0.4 : 1.6;
    dynamicTransition = {
      type: "tween",
      ease: "anticipate",
      duration: duration
    };
  } else if (transitionType === "ease-in-out") {
    const duration = playSpeed === "slow" ? 2.5 : playSpeed === "fast" ? 0.8 : playSpeed === "superfast" ? 0.4 : 1.6;
    dynamicTransition = {
      type: "tween",
      ease: "easeInOut",
      duration: duration
    };
  } else if (transitionType === "elastic") {
    const stiffness = playSpeed === "slow" ? 60 : playSpeed === "fast" ? 250 : playSpeed === "superfast" ? 400 : 150;
    const damping = playSpeed === "slow" ? 7 : playSpeed === "fast" ? 11 : playSpeed === "superfast" ? 13 : 9;
    dynamicTransition = {
      type: "spring",
      stiffness,
      damping,
      mass: 0.85
    };
  } else {
    // spring
    const stiffness = playSpeed === "slow" ? 50 : playSpeed === "fast" ? 245 : playSpeed === "superfast" ? 420 : 130;
    const damping = playSpeed === "slow" ? 16 : playSpeed === "fast" ? 22 : playSpeed === "superfast" ? 28 : 19;
    dynamicTransition = {
      type: "spring",
      stiffness,
      damping
    };
  }

  const getRoleThemeColor = (role: string) => {
    if (pitchTheme === "neon-hologram") return "#22d3ee";
    if (pitchTheme === "aurora-stadium") return "#f472b6";
    if (role === "GK") return "#f59e0b";
    if (role === "DEF") return "#10b981";
    if (role === "MID") return "#3b82f6";
    return "#f43f5e";
  };

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
  } else if (draggedType === "player" && draggedId) {
    swapTargetPlayerId = activeSwapTargetId;
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
  }, [drawHistory, showHeatmap, players]);

  const drawAllStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- HEATMAP RENDERING ENGINE ---
    if (showHeatmap) {
      // Gather points from all strokes
      const pts: { x: number; y: number }[] = [];
      drawHistory.forEach((stroke) => {
        stroke.points.forEach((pt) => {
          pts.push(pt);
        });
      });

      // Calculate dynamic heatmap point radius proportional to width
      const heatRadius = Math.max(18, Math.min(45, Math.round(30 * (canvas.width / 540))));

      if (pts.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "screen"; // screen blending merges soft radial glow beautifully

        pts.forEach((pt) => {
          const grad = ctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, heatRadius);
          grad.addColorStop(0, "rgba(239, 68, 68, 0.28)");    // Intensive Red Core
          grad.addColorStop(0.35, "rgba(249, 115, 22, 0.16)"); // Warm orange density
          grad.addColorStop(0.7, "rgba(234, 179, 8, 0.06)");  // Subtle yellow tail
          grad.addColorStop(1, "rgba(234, 179, 8, 0)");        // Outer bounds transition
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, heatRadius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      } else {
        // Fallback: If drawHistory is empty, construct starting-player visual heat concentrations
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        starters.forEach((player) => {
          const px = (player.x / 100) * canvas.width;
          const actualPy = (player.y / 100) * canvas.height;
          
          const playerRadius = heatRadius * 1.35;
          const grad = ctx.createRadialGradient(px, actualPy, 2, px, actualPy, playerRadius);

          if (player.role === "FWD") {
            // FWD high fire energy hot points
            grad.addColorStop(0, "rgba(239, 68, 68, 0.22)");    // Red
            grad.addColorStop(0.4, "rgba(249, 115, 22, 0.12)"); // Orange
            grad.addColorStop(0.8, "rgba(234, 179, 8, 0.04)");  // Yellow
            grad.addColorStop(1, "rgba(234, 179, 8, 0)");
          } else if (player.role === "MID") {
            // Midfield high circulation orange-heavy energy
            grad.addColorStop(0, "rgba(249, 115, 22, 0.20)");   // Orange
            grad.addColorStop(0.5, "rgba(234, 179, 8, 0.10)");  // Yellow
            grad.addColorStop(1, "rgba(234, 179, 8, 0)");
          } else {
            // Defense and GK safe green-blue structural control
            grad.addColorStop(0, "rgba(59, 130, 246, 0.18)");   // Cyan
            grad.addColorStop(0.5, "rgba(16, 185, 129, 0.08)");  // Emerald
            grad.addColorStop(1, "rgba(16, 185, 129, 0)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, actualPy, playerRadius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
    }

    // --- ANNOTATION LINES RENDERING ---
    drawHistory.forEach((stroke) => {
      const strokeLayer = stroke.layer || 1;
      if (!visibleSketchLayers.includes(strokeLayer)) return;
      if (stroke.points.length < 2) return;

      ctx.save();
      
      // Dim inactive layers to help visually organize defense/offense layouts
      if (strokeLayer !== activeSketchLayer) {
        ctx.globalAlpha = 0.35;
      }

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

      ctx.restore();
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

  // Helper to snap a canvas pixel coordinate to the nearest starting player's center if close enough
  const snapToNearestPlayer = (x: number, y: number, canvasWidth: number, canvasHeight: number) => {
    const scaleFactor = Math.min(1.1, Math.max(0.65, pitchWidth / 540));
    const snapThreshold = Math.max(25, Math.min(52, Math.round(45 * scaleFactor)));
    
    let closestPlayer: Player | null = null;
    let minDistance = Infinity;
    let snappedX = x;
    let snappedY = y;

    starters.forEach((player) => {
      const px = (player.x / 100) * canvasWidth;
      const py = (player.y / 100) * canvasHeight;
      const dist = Math.hypot(px - x, py - y);
      if (dist < minDistance) {
        minDistance = dist;
        closestPlayer = player;
        snappedX = px;
        snappedY = py;
      }
    });

    if (minDistance < snapThreshold) {
      return { x: snappedX, y: snappedY, player: closestPlayer };
    }
    return { x, y, player: null };
  };

  // --- DRAW EVENTS ---
  const handleMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "draw" || isDrawLocked) return;
    setIsDrawing(true);
    soundManager.playScribble();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const { x, y } = snapToNearestPlayer(rawX, rawY, canvas.width, canvas.height);

    setLastPoint({ x, y });
    setDrawHistory((prev) => [
      ...prev,
      {
        color: brushColor,
        size: brushSize,
        style: brushStyle,
        points: [{ x, y }],
        layer: activeSketchLayer
      }
    ]);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== "draw" || !lastPoint || isDrawLocked) return;
    if (Math.random() < 0.22) {
      soundManager.playScribble();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const { x, y } = snapToNearestPlayer(rawX, rawY, canvas.width, canvas.height);

    setDrawHistory((prev) => {
      const updated = [...prev];
      if (updated.length === 0) return prev;
      const current = { ...updated[updated.length - 1] };
      
      const lastPt = current.points[current.points.length - 1];
      if (lastPt && lastPt.x === x && lastPt.y === y) {
        return prev;
      }

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
    if (activeTool !== "draw" || e.touches.length !== 1 || isDrawLocked) return;
    setIsDrawing(true);
    soundManager.playScribble();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rawX = e.touches[0].clientX - rect.left;
    const rawY = e.touches[0].clientY - rect.top;

    const { x, y } = snapToNearestPlayer(rawX, rawY, canvas.width, canvas.height);

    setLastPoint({ x, y });
    setDrawHistory((prev) => [
      ...prev,
      {
        color: brushColor,
        size: brushSize,
        style: brushStyle,
        points: [{ x, y }],
        layer: activeSketchLayer
      }
    ]);
  };

  const handleTouchMove = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== "draw" || !lastPoint || e.touches.length !== 1 || isDrawLocked) return;
    if (Math.random() < 0.22) {
      soundManager.playScribble();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rawX = e.touches[0].clientX - rect.left;
    const rawY = e.touches[0].clientY - rect.top;

    const { x, y } = snapToNearestPlayer(rawX, rawY, canvas.width, canvas.height);

    setDrawHistory((prev) => {
      const updated = [...prev];
      if (updated.length === 0) return prev;
      const current = { ...updated[updated.length - 1] };

      const lastPt = current.points[current.points.length - 1];
      if (lastPt && lastPt.x === x && lastPt.y === y) {
        return prev;
      }

      current.points = [...current.points, { x, y }];
      updated[updated.length - 1] = current;
      return updated;
    });

    setLastPoint({ x, y });
  };

  // Re-draw on stroke update
  useEffect(() => {
    drawAllStrokes();
  }, [drawHistory, showHeatmap, players, activeSketchLayer, visibleSketchLayers]);

  // --- DRAGGING CODES ---
  const handleDragStart = (e: ReactMouseEvent | ReactTouchEvent, id: string, type: "player" | "item") => {
    if (activeTool !== "select") return;
    setDraggedId(id);
    setDraggedType(type);

    const container = pitchRef.current;
    const touch = 'touches' in e ? e.touches[0] : e;

    if (type === "player") {
      const p = players.find((player) => player.id === id);
      if (p) {
        setDragStartCoords({ x: p.x, y: p.y });

        // Calculate drag grab offset in percentage coordinates to ensure 100% accurate, smooth, non-snapping drag-and-drop
        if (container) {
          const rect = container.getBoundingClientRect();
          const currentCursorX = ((touch.clientX - rect.left) / rect.width) * 100;
          const currentCursorY = ((touch.clientY - rect.top) / rect.height) * 100;
          setDragOffset({
            x: p.x - currentCursorX,
            y: p.y - currentCursorY
          });
        }
      }
      setClickStartInfo({
        id,
        time: Date.now(),
        x: touch.clientX,
        y: touch.clientY
      });

      // --- TOUCH LONG PRESS (HOLD) DETECTION FOR MOBILE ---
      if ('touches' in e) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
        }
        longPressTimerRef.current = setTimeout(() => {
          // Select player for swap/sub & play feedback
          handlePlayerClick(id);
          // Cancel active dragging immediately to stay focused in swap mode
          setDraggedId(null);
          setDraggedType(null);
          setDragStartCoords(null);
          setActiveSwapTargetId(null);
          if (navigator.vibrate) {
            try {
              navigator.vibrate(50);
            } catch (err) {}
          }
        }, 350); // 350ms hold time is highly responsive on mobile
      }
    } else {
      // Items drag offset
      if (container) {
        const rect = container.getBoundingClientRect();
        const currentCursorX = ((touch.clientX - rect.left) / rect.width) * 100;
        const currentCursorY = ((touch.clientY - rect.top) / rect.height) * 100;
        const activeItem = items?.find(itm => itm.id === id);
        if (activeItem) {
          setDragOffset({
            x: activeItem.x - currentCursorX,
            y: activeItem.y - currentCursorY
          });
        }
      }
    }
    soundManager.playClick();
  };

  const handleContainerMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!draggedId || !draggedType || activeTool !== "select") return;
    const container = pitchRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Clear hold timer if moved significantly
    if (clickStartInfo && draggedId === clickStartInfo.id && longPressTimerRef.current) {
      const dist = Math.hypot(clientX - clickStartInfo.x, clientY - clickStartInfo.y);
      if (dist > 8) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    // Convert to percentage coordinate limits
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;

    if (draggedType === "player") {
      // Apply the precise grab offset
      const adjustedX = rawX + dragOffset.x;
      const adjustedY = rawY + dragOffset.y;

      const x = Math.max(2, Math.min(98, parseFloat(adjustedX.toFixed(1))));
      const y = Math.max(2, Math.min(98, parseFloat(adjustedY.toFixed(1))));

      // Find nearest starting player (different from current dragged player)
      let targetId: string | null = null;
      let nearestDist = 9; // distance threshold in percentage coordinates
      starters.forEach((starter) => {
        if (starter.id !== draggedId) {
          const dist = Math.hypot(starter.x - x, starter.y - y);
          if (dist < nearestDist) {
            nearestDist = dist;
            targetId = starter.id;
          }
        }
      });
      setActiveSwapTargetId(targetId);

      onUpdatePlayerPosition(draggedId, x, y);
    } else {
      const adjustedX = rawX + dragOffset.x;
      const adjustedY = rawY + dragOffset.y;
      const x = Math.max(-10, Math.min(110, parseFloat(adjustedX.toFixed(1))));
      const y = Math.max(-10, Math.min(110, parseFloat(adjustedY.toFixed(1))));
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

    // Clear hold timer if moved significantly
    if (clickStartInfo && draggedId === clickStartInfo.id && longPressTimerRef.current) {
      const dist = Math.hypot(clientX - clickStartInfo.x, clientY - clickStartInfo.y);
      if (dist > 8) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;

    if (draggedType === "player") {
      // Apply the precise grab offset
      const adjustedX = rawX + dragOffset.x;
      const adjustedY = rawY + dragOffset.y;

      const x = Math.max(2, Math.min(98, parseFloat(adjustedX.toFixed(1))));
      const y = Math.max(2, Math.min(98, parseFloat(adjustedY.toFixed(1))));

      // Find nearest starting player (different from current dragged player)
      let targetId: string | null = null;
      let nearestDist = 9; // distance threshold in percentage coordinates
      starters.forEach((starter) => {
        if (starter.id !== draggedId) {
          const dist = Math.hypot(starter.x - x, starter.y - y);
          if (dist < nearestDist) {
            nearestDist = dist;
            targetId = starter.id;
          }
        }
      });
      setActiveSwapTargetId(targetId);

      onUpdatePlayerPosition(draggedId, x, y);
    } else {
      const adjustedX = rawX + dragOffset.x;
      const adjustedY = rawY + dragOffset.y;
      const x = Math.max(-10, Math.min(110, parseFloat(adjustedX.toFixed(1))));
      const y = Math.max(-10, Math.min(110, parseFloat(adjustedY.toFixed(1))));
      onUpdateItemPosition(draggedId, x, y);
    }
  };

  const handleDragEnd = (e?: ReactMouseEvent | ReactTouchEvent | MouseEvent | TouchEvent) => {
    // Always clear the mobile long-press timer on drag end
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (draggedId) {
      if (clickStartInfo && draggedId === clickStartInfo.id && draggedType === "player") {
        const duration = Date.now() - clickStartInfo.time;
        let clientX = clickStartInfo.x;
        let clientY = clickStartInfo.y;
        if (e) {
          const touch = 'changedTouches' in e ? e.changedTouches[0] : ('touches' in e && e.touches[0] ? e.touches[0] : e);
          if (touch && 'clientX' in touch) {
            clientX = touch.clientX;
            clientY = touch.clientY;
          }
        }
        const dist = Math.hypot(clientX - clickStartInfo.x, clientY - clickStartInfo.y);

        if (duration < 250 && dist < 12) {
          handlePlayerClick(clickStartInfo.id);
          setDraggedId(null);
          setDraggedType(null);
          setDragStartCoords(null);
          setActiveSwapTargetId(null);
          setClickStartInfo(null);
          return;
        }
      }

      soundManager.playKick();
      if (draggedType === "player") {
        if (activeSwapTargetId && dragStartCoords && onSwapPlayers) {
          const swapTarget = players.find((p) => p.id === activeSwapTargetId);
          if (swapTarget) {
            onSwapPlayers(draggedId, activeSwapTargetId, dragStartCoords, { x: swapTarget.x, y: swapTarget.y });
          }
        } else {
          const activePlayer = players.find((p) => p.id === draggedId);
          // Auto demote to bench if dragged to bottom sidebar zone (y > 85%)
          if (activePlayer && activePlayer.isStarting && activePlayer.y > 84) {
            onDemotePlayer(draggedId);
          }
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
    setDragStartCoords(null);
    setActiveSwapTargetId(null);
    setClickStartInfo(null);
  };

  // Drag sideline substitute to the pitch
  const handleSidelineDragStart = (e: ReactMouseEvent | ReactTouchEvent, sidelineId: string) => {
    // Save info of we're dragging a sideline substitute
    e.stopPropagation();
    const touch = 'touches' in e ? e.touches[0] : e;
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.6";

    setActiveSidelineDragId(sidelineId);
    soundManager.playClick();

    const clickTime = Date.now();
    const clickX = touch.clientX;
    const clickY = touch.clientY;

    let benchLongPressTimer: any = null;

    if ('touches' in e) {
      benchLongPressTimer = setTimeout(() => {
        // Trigger select/swap mode
        handlePlayerClick(sidelineId);

        // Clean up immediately and cancel normal drag behavior since hold-selection is activated
        target.style.opacity = "";
        document.removeEventListener("mousemove", handlerMove);
        document.removeEventListener("mouseup", handlerEnd);
        document.removeEventListener("touchmove", handlerMove);
        document.removeEventListener("touchend", handlerEnd);
        setActiveSidelineDragId(null);
        setSidelineDragCoords(null);

        if (navigator.vibrate) {
          try {
            navigator.vibrate(50);
          } catch (err) {}
        }
      }, 350); // 350ms hold
    }

    const handlerMove = (moveEvent: MouseEvent | TouchEvent) => {
      const container = pitchRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;

      // Cancel hold timer if finger has moved significantly (more than 8 pixels)
      const moveDist = Math.hypot(clientX - clickX, clientY - clickY);
      if (moveDist > 8 && benchLongPressTimer) {
        clearTimeout(benchLongPressTimer);
        benchLongPressTimer = null;
      }

      const x = parseFloat((((clientX - rect.left) / rect.width) * 100).toFixed(1));
      const y = parseFloat((((clientY - rect.top) / rect.height) * 100).toFixed(1));

      setSidelineDragCoords({ x, y });
    };

    const handlerEnd = (endEvent: MouseEvent | TouchEvent) => {
      if (benchLongPressTimer) {
        clearTimeout(benchLongPressTimer);
        benchLongPressTimer = null;
      }

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

      // Check if it's a single click (tap) instead of a drag
      const duration = Date.now() - clickTime;
      const moveDist = Math.hypot(clientX - clickX, clientY - clickY);
      if (duration < 250 && moveDist < 12) {
        handlePlayerClick(sidelineId);
        return; // skip actual drag-swap/promote logic!
      }

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
          soundManager.playChime();
        } else {
          // Promote sideline to starting
          onPromotePlayer(sidelineId, finalX, finalY);
          soundManager.playChime();
        }
      } else {
        soundManager.playKick();
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
        onClick={(e) => {
          // Deselect if we clicked on empty space (pitch wrapper or svg/canvas element)
          const target = e.target as HTMLElement;
          if (
            target.id === "tacticalPitchWrapper" ||
            target.tagName === "svg" ||
            target.tagName === "line" ||
            target.tagName === "rect" ||
            target.tagName === "circle" ||
            target.tagName === "path" ||
            target.tagName === "canvas"
          ) {
            setSelectedSubPlayerId(null);
          }
        }}
        className={`relative w-full max-w-[580px] aspect-[4/6.5] sm:aspect-[4/5] rounded-3xl overflow-hidden border-4 transition-all select-none ${pitchWrapperClass}`}
        style={{
          backgroundImage: customBackgroundUrl ? `url(${customBackgroundUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Floating Instruction Banner for Click-to-Swap / Substitution */}
        {selectedSubPlayerId && (() => {
          const selPlayer = players.find((p) => p.id === selectedSubPlayerId);
          if (!selPlayer) return null;
          return (
            <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border bg-[#090d16]/95 border-amber-500/40 shadow-[0_8px_32px_rgba(245,158,11,0.25)] backdrop-blur-md">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 animate-pulse">
                  <span className="text-[10px] font-black uppercase">🔄</span>
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-400/80">
                    {lang === "id" ? "Proses Swap Aktif" : "Active Swap Process"}
                  </span>
                  <span className="text-white text-xs font-bold truncate">
                    {lang === "id" 
                      ? `Pilih pengganti untuk ${selPlayer.name}`
                      : `Select swap partner for ${selPlayer.name}`}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSubPlayerId(null);
                  soundManager.playClick();
                }}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all shrink-0 border border-transparent hover:border-white/10"
                title={lang === "id" ? "Batalkan" : "Cancel"}
              >
                <X size={14} className="stroke-[2.5]" />
              </button>
            </div>
          );
        })()}

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
          className="absolute inset-0 w-full h-[72%] sm:h-[84%] pointer-events-none z-10"
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
          
           {/* Halfway line & sports markings dynamically adjusted based on active arena (sportMode) */}
          {sportMode === "futsal" ? (
            <>
              {/* Futsal center circle (smaller) */}
              <line x1="3" y1="50" x2="97" y2="50" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
              <circle cx="50" cy="50" r="8" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
              <circle cx="50" cy="50" r="0.8" fill={lineStroke} />

              {/* Futsal Top Penalty Area (D-style arcs) */}
              <path d="M 32 3 A 18 15 0 0 0 68 3" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
              {/* Penalty spot (6m) */}
              <circle cx="50" cy="15" r="0.6" fill={lineStroke} />
              {/* Double penalty marks (10m) */}
              <line x1="48.5" y1="25" x2="51.5" y2="25" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />

              {/* Futsal Bottom Penalty Area (D-style arcs) */}
              <path d="M 32 97 A 18 15 0 0 1 68 97" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
              {/* Penalty spot (6m) */}
              <circle cx="50" cy="85" r="0.6" fill={lineStroke} />
              {/* Double penalty marks (10m) */}
              <line x1="48.5" y1="75" x2="51.5" y2="75" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />

              {/* Goal nets (futsal-sized) */}
              <rect x="42" y="0.5" width="16" height="2.5" rx="0.5" fill="none" stroke={lineStroke} strokeWidth="0.5" strokeDasharray="1,1" opacity="0.6" />
              <rect x="42" y="97" width="16" height="2.5" rx="0.5" fill="none" stroke={lineStroke} strokeWidth="0.5" strokeDasharray="1,1" opacity="0.6" />

              {/* Substitution zones */}
              <line x1="1.5" y1="42" x2="3" y2="42" stroke={lineStroke} strokeWidth="0.5" />
              <line x1="1.5" y1="48" x2="3" y2="48" stroke={lineStroke} strokeWidth="0.5" />
              <line x1="1.5" y1="52" x2="3" y2="52" stroke={lineStroke} strokeWidth="0.5" />
              <line x1="1.5" y1="58" x2="3" y2="58" stroke={lineStroke} strokeWidth="0.5" />
            </>
          ) : sportMode === "minisoccer" ? (
            <>
              {/* Mini Soccer halfway & circle (medium) */}
              <line x1="3" y1="50" x2="97" y2="50" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
              <circle cx="50" cy="50" r="10" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
              <circle cx="50" cy="50" r="0.8" fill={lineStroke} />

              {/* Mini Soccer Top Penalty Box (compact rectangular) */}
              <rect x="28" y="3" width="44" height="15" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
              {/* Penalty spot */}
              <circle cx="50" cy="11.5" r="0.6" fill={lineStroke} />
              {/* Penalty arc */}
              <path d="M 42 18 A 8 8 0 0 0 58 18" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />

              {/* Mini Soccer Bottom Penalty Box */}
              <rect x="28" y="82" width="44" height="15" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />
              {/* Penalty spot */}
              <circle cx="50" cy="88.5" r="0.6" fill={lineStroke} />
              {/* Penalty arc */}
              <path d="M 42 82 A 8 8 0 0 1 58 82" fill="none" stroke={lineStroke} strokeWidth="0.6" filter={useGlow ? "url(#neon-line-glow)" : "none"} />

              {/* Intermediate goal nets */}
              <rect x="40" y="0.5" width="20" height="2.5" rx="0.5" fill="none" stroke={lineStroke} strokeWidth="0.5" strokeDasharray="1,1" opacity="0.6" />
              <rect x="40" y="97" width="20" height="2.5" rx="0.5" fill="none" stroke={lineStroke} strokeWidth="0.5" strokeDasharray="1,1" opacity="0.6" />
            </>
          ) : (
            <>
              {/* Standard Soccer halfway & circle (large) */}
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

              {/* Goal nets (large) */}
              <rect x="38" y="0.5" width="24" height="2.5" rx="0.5" fill="none" stroke={lineStroke} strokeWidth="0.5" strokeDasharray="1,1" opacity="0.6" />
              <rect x="38" y="97" width="24" height="2.5" rx="0.5" fill="none" stroke={lineStroke} strokeWidth="0.5" strokeDasharray="1,1" opacity="0.6" />
            </>
          )}

          {/* Tactical 18-Zone Grid Overlay */}
          {showTacticalGrid && (
            <g id="tactical-18-grid" style={{ transition: "all 0.3s ease-in-out" }}>
              {/* Vertical outer alignment lines */}
              <line x1="25" y1="3" x2="25" y2="97" stroke={lineStroke} strokeWidth="0.3" strokeDasharray="1, 1.5" opacity="0.35" />
              <line x1="75" y1="3" x2="75" y2="97" stroke={lineStroke} strokeWidth="0.3" strokeDasharray="1, 1.5" opacity="0.35" />

              {/* Horizontal outer grid lines matching tactical divisions */}
              <line x1="3" y1="21" x2="97" y2="21" stroke={lineStroke} strokeWidth="0.3" strokeDasharray="1, 1.5" opacity="0.35" />
              <line x1="3" y1="35.5" x2="97" y2="35.5" stroke={lineStroke} strokeWidth="0.3" strokeDasharray="1, 1.5" opacity="0.35" />
              <line x1="3" y1="50" x2="97" y2="50" stroke={lineStroke} strokeWidth="0.3" strokeDasharray="1, 1.5" opacity="0.25" />
              <line x1="3" y1="64.5" x2="97" y2="64.5" stroke={lineStroke} strokeWidth="0.3" strokeDasharray="1, 1.5" opacity="0.35" />
              <line x1="3" y1="79" x2="97" y2="79" stroke={lineStroke} strokeWidth="0.3" strokeDasharray="1, 1.5" opacity="0.35" />

              {/* Zone Labels for high precision spacing (Malaysia / Malay literal coach layout) */}
              {/* Row 1 (Bawah / Gawang Sendiri) */}
              <text x="14" y="88" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z1</text>
              <text x="50" y="88" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z2</text>
              <text x="86" y="88" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z3</text>

              {/* Row 2 (Kawasan Bertahan) */}
              <text x="14" y="71.7" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z4</text>
              <text x="50" y="71.7" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z5</text>
              <text x="86" y="71.7" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z6</text>

              {/* Row 3 (Tengah Bertahan) */}
              <text x="14" y="57.25" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z7</text>
              <text x="50" y="57.25" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z8</text>
              <text x="86" y="57.25" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z9</text>

              {/* Row 4 (Tengah Menyerang) */}
              <text x="14" y="42.75" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z10</text>
              <text x="50" y="42.75" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z11</text>
              <text x="86" y="42.75" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z12</text>

              {/* Row 5 (Zon Kreatif / Sepertiga Akhir) */}
              <text x="14" y="28.25" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z13</text>
              <text x="50" y="28.25" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z14</text>
              <text x="86" y="28.25" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z15</text>

              {/* Row 6 (Kawasan Kotak Penalti Lawan / Atas) */}
              <text x="14" y="12" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z16</text>
              <text x="50" y="12" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z17</text>
              <text x="86" y="12" textAnchor="middle" dominantBaseline="middle" fill={lineStroke} opacity="0.35" fontSize="3" fontWeight="900" fontFamily="monospace">Z18</text>
            </g>
          )}
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
          className={`absolute inset-0 w-full h-[72%] sm:h-[84%] z-20 ${
            activeTool === "draw"
              ? isDrawLocked
                ? "cursor-not-allowed pointer-events-auto"
                : "cursor-pencil pointer-events-auto"
              : "pointer-events-none"
          }`}
        />

        {/* DYNAMIC TACTICAL MOVEMENT TRAILS */}
        {showMovementTrails && activeFrameIndex > 0 && frames && frames[activeFrameIndex - 1] && (
          <svg
            className="absolute inset-0 w-full h-[72%] sm:h-[84%] pointer-events-none z-15"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="movement-trail-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="rgba(255, 255, 255, 0.85)" />
              </marker>
              <filter id="trail-glowing-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Players movement trajectories */}
            {starters.map((player) => {
              if (draggedId === player.id) return null;
              const prevFrame = frames[activeFrameIndex - 1];
              if (!prevFrame || !prevFrame.players) return null;
              const prevPos = prevFrame.players.find((p) => p.id === player.id);
              if (!prevPos) return null;

              const dx = player.x - prevPos.x;
              const dy = player.y - prevPos.y;
              const dist = Math.hypot(dx, dy);

              if (dist > 2.5) {
                // Curved flow calculations
                const midX = (prevPos.x + player.x) / 2;
                const midY = (prevPos.y + player.y) / 2;
                
                const len = dist || 1;
                const nx = -dy / len;
                const ny = dx / len;
                
                const curvature = Math.min(6, len * 0.18);
                const controlX = midX + nx * curvature;
                const controlY = midY + ny * curvature;

                const pathData = `M ${prevPos.x} ${prevPos.y} Q ${controlX} ${controlY} ${player.x} ${player.y}`;
                const trailColor = getRoleThemeColor(player.role);

                return (
                  <g key={`trail-player-${player.id}`}>
                    {/* Shadow/Backing line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth="1.2"
                    />
                    {/* Pulsing trail path */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={trailColor}
                      strokeWidth="0.8"
                      strokeDasharray="2, 2.5"
                      markerEnd="url(#movement-trail-arrow)"
                      filter={pitchTheme !== "emerald-grass" ? "url(#trail-glowing-glow)" : "none"}
                      className="opacity-80"
                    />
                    {/* Animated running dot representing phase progress */}
                    <circle r="0.75" fill="#ffffff" filter="url(#trail-glowing-glow)">
                      <animateMotion
                        dur={playSpeed === "slow" ? "2.4s" : playSpeed === "fast" ? "0.8s" : playSpeed === "superfast" ? "0.4s" : "1.5s"}
                        repeatCount="indefinite"
                        path={pathData}
                      />
                    </circle>
                  </g>
                );
              }
              return null;
            })}

            {/* Ball movement trajectory */}
            {items
              .filter((item) => item.type === "ball")
              .map((ball) => {
                if (draggedId === ball.id) return null;
                const prevFrame = frames[activeFrameIndex - 1];
                if (!prevFrame || !prevFrame.items) return null;
                const prevPos = prevFrame.items.find((i) => i.id === ball.id);
                if (!prevPos) return null;

                const dx = ball.x - prevPos.x;
                const dy = ball.y - prevPos.y;
                const dist = Math.hypot(dx, dy);

                if (dist > 3) {
                  const midX = (prevPos.x + ball.x) / 2;
                  const midY = (prevPos.y + ball.y) / 2;
                  const len = dist || 1;
                  const nx = -dy / len;
                  const ny = dx / len;
                  const curvature = Math.min(8, len * 0.22);
                  const controlX = midX + nx * curvature;
                  const controlY = midY + ny * curvature;

                  const pathData = `M ${prevPos.x} ${prevPos.y} Q ${controlX} ${controlY} ${ball.x} ${ball.y}`;

                  return (
                    <g key={`trail-ball-${ball.id}`}>
                      {/* Orange glowing trajectory path */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="1.0"
                        strokeDasharray="4, 2"
                        markerEnd="url(#movement-trail-arrow)"
                        filter="url(#trail-glowing-glow)"
                      />
                      {/* Little ball-running dot */}
                      <circle r="0.9" fill="#facc15" stroke="#7c2d12" strokeWidth="0.25">
                        <animateMotion
                          dur={playSpeed === "slow" ? "1.8s" : playSpeed === "fast" ? "0.6s" : playSpeed === "superfast" ? "0.3s" : "1.1s"}
                          repeatCount="indefinite"
                          path={pathData}
                        />
                      </circle>
                    </g>
                  );
                }
                return null;
              })}
          </svg>
        )}

        {/* INTERACTIVE PLAYERS AND DRAGGABLE BALLS & CONES */}
        <div className="absolute inset-0 w-full h-[72%] sm:h-[84%] z-30 pointer-events-none">
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
                    ...dynamicTransition,
                    layout: { duration: 0.2 }
                  }}
                  onMouseDown={(e) => handleDragStart(e, player.id, "player")}
                  onTouchStart={(e) => handleDragStart(e, player.id, "player")}
                  onDoubleClick={() => onDblClickPlayer(player.id)}
                  className={`absolute flex flex-col items-center justify-center -translate-x-[50%] -translate-y-[50%] origin-center group ${
                    activeTool === "select" ? "pointer-events-auto cursor-grab active:cursor-grabbing" : "pointer-events-none cursor-default"
                  }`}
                  style={{
                    position: "absolute",
                    touchAction: "none"
                  }}
                >
                  {/* Glowing Selected badge above the player for click substitution */}
                  {selectedSubPlayerId === player.id && (
                    <div className="absolute -top-7 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[9px] font-black rounded-full uppercase flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.8)] tracking-wider z-50 animate-pulse">
                      <span>{lang === "id" ? "TERPILIH 🔄" : "SELECTED 🔄"}</span>
                    </div>
                  )}

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
                      selectedSubPlayerId === player.id
                        ? "scale-120 border-amber-400 ring-4 ring-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.95)]"
                        : isSwapTarget
                        ? "scale-120 border-emerald-400 ring-4 ring-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.95)]"
                        : "group-hover:scale-105"
                    }`}
                    style={{
                      width: `${jerseySize}px`,
                      height: `${jerseySize}px`,
                      backgroundColor: player.photo ? "#15151a" : currentBg,
                      color: player.photo ? "#fff" : numberColor
                    }}
                  >
                    {selectedSubPlayerId === player.id && (
                      <div className="absolute inset-0 rounded-full ring-4 ring-amber-400 animate-ping opacity-60 pointer-events-none" />
                    )}

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
                    className="mt-1 px-1.5 py-0.5 bg-[#0f0f12]/95 backdrop-blur-md rounded border border-white/10 text-white font-bold whitespace-nowrap shadow select-none uppercase tracking-wide leading-tight animate-fade-in"
                    style={{ fontSize: `${nameFontSize}px` }}
                  >
                    {player.name}
                  </div>

                  {/* Floating Mini Stats HUD on Hover */}
                  <div className="absolute top-[108%] z-50 bg-[#0f0f12]/95 border border-white/10 p-2 rounded-xl shadow-2xl opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 w-36 flex flex-col gap-1 select-none backdrop-blur-md">
                    <div className="text-[8px] font-black uppercase text-indigo-400 tracking-wider mb-1 text-center border-b border-white/5 pb-1 flex justify-between items-center px-1">
                      <span>Kemampuan</span>
                      <span className="text-emerald-400 font-extrabold font-mono">
                        OVR {Math.round(((player.stats?.speed ?? (player.role === "FWD" ? 85 : player.role === "MID" ? 78 : player.role === "DEF" ? 72 : 65)) +
                          (player.stats?.stamina ?? (player.role === "MID" ? 85 : player.role === "DEF" ? 80 : player.role === "FWD" ? 75 : 70)) +
                          (player.stats?.passing ?? (player.role === "MID" ? 84 : player.role === "FWD" ? 72 : player.role === "DEF" ? 68 : 55)) +
                          (player.stats?.dribbling ?? (player.role === "FWD" ? 84 : player.role === "MID" ? 78 : player.role === "DEF" ? 60 : 30)) +
                          (player.stats?.defending ?? (player.role === "DEF" ? 86 : player.role === "GK" ? 80 : player.role === "MID" ? 70 : 35))) / 5)}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-0.5 text-[8px] font-sans text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-bold">SPD</span>
                        <span className="font-extrabold text-blue-400">{player.stats?.speed ?? (player.role === "FWD" ? 85 : player.role === "MID" ? 78 : player.role === "DEF" ? 72 : 65)}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-bold">STM</span>
                        <span className="font-extrabold text-emerald-400">{player.stats?.stamina ?? (player.role === "MID" ? 85 : player.role === "DEF" ? 80 : player.role === "FWD" ? 75 : 70)}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-bold">PAS</span>
                        <span className="font-extrabold text-amber-400">{player.stats?.passing ?? (player.role === "MID" ? 84 : player.role === "FWD" ? 72 : player.role === "DEF" ? 68 : 55)}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-bold">DRI</span>
                        <span className="font-extrabold text-pink-400">{player.stats?.dribbling ?? (player.role === "FWD" ? 84 : player.role === "MID" ? 78 : player.role === "DEF" ? 60 : 30)}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-bold">DEF</span>
                        <span className="font-extrabold text-purple-400">{player.stats?.defending ?? (player.role === "DEF" ? 86 : player.role === "GK" ? 80 : player.role === "MID" ? 70 : 35)}</span>
                      </div>
                    </div>
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
                   transition={dynamicTransition}
                   onMouseDown={(e) => handleDragStart(e, item.id, "item")}
                   onTouchStart={(e) => handleDragStart(e, item.id, "item")}
                   onDoubleClick={() => onRemoveItem(item.id)}
                   className={`absolute flex items-center justify-center -translate-x-[50%] -translate-y-[50%] ${
                     activeTool === "select" ? "pointer-events-auto cursor-grab active:cursor-grabbing" : "pointer-events-none cursor-default"
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

        {/* BOTTOM REFERENCE MEASUREMENT RULER (ALIGNED WITH FIELD TOUCHLINES) */}
        <div
          id="pitch-measurement-ruler"
          className="absolute bottom-[28%] sm:bottom-[16%] left-[3%] right-[3%] h-9 z-[35] pointer-events-none select-none flex flex-col justify-end"
          style={{
            background: "linear-gradient(to top, rgba(11, 12, 16, 0.45) 0%, rgba(11, 12, 16, 0) 100%)",
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 500 32"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {useGlow && (
              <defs>
                <filter id="ruler-line-glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="0.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            )}

            {/* Main Baseline */}
            <line
              x1="0"
              y1="14"
              x2="500"
              y2="14"
              stroke={lineStroke}
              strokeWidth="0.8"
              opacity="0.35"
              filter={useGlow ? "url(#ruler-line-glow)" : "none"}
            />

            {!showTacticalGrid ? (
              // --- STANDARD METRIC SCALING (GRID INACTIVE) ---
              <>
                {/* Major Ticks at every 10m */}
                {[
                  { m: 0, x: 0, label: "0m" },
                  { m: 10, x: 73.5, label: "10m" },
                  { m: 20, x: 147.1, label: "20m" },
                  { m: 30, x: 220.6, label: "30m" },
                  { m: 40, x: 294.1, label: "40m" },
                  { m: 50, x: 367.6, label: "50m" },
                  { m: 60, x: 441.2, label: "60m" },
                  { m: 68, x: 500, label: "68m" }
                ].map((tick, idx) => (
                  <g key={`standard-major-${idx}`}>
                    <line
                      x1={tick.x}
                      y1="14"
                      x2={tick.x}
                      y2="6"
                      stroke={lineStroke}
                      strokeWidth="0.75"
                      opacity="0.5"
                      filter={useGlow ? "url(#ruler-line-glow)" : "none"}
                    />
                    <text
                      x={tick.x}
                      y="1"
                      textAnchor={tick.m === 0 ? "start" : tick.m === 68 ? "end" : "middle"}
                      dominantBaseline="hanging"
                      fill={lineStroke}
                      opacity="0.65"
                      fontSize="7"
                      fontWeight="700"
                      fontFamily="monospace, sans-serif"
                    >
                      {tick.label}
                    </text>
                  </g>
                ))}

                {/* Minor Ticks at every 5m */}
                {[36.8, 110.3, 183.8, 257.4, 330.9, 404.4, 477.9].map((mx, idx) => (
                  <line
                    key={`standard-minor-${idx}`}
                    x1={mx}
                    y1="14"
                    x2={mx}
                    y2="10"
                    stroke={lineStroke}
                    strokeWidth="0.5"
                    opacity="0.25"
                    filter={useGlow ? "url(#ruler-line-glow)" : "none"}
                  />
                ))}

                {/* Label description standard scale */}
                <text
                  x="250"
                  y="24"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={lineStroke}
                  opacity="0.45"
                  fontSize="6.5"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  letterSpacing="0.05em"
                >
                  {lang === "id"
                    ? "📏 Lebar Lapangan Standar (68m)"
                    : "📏 Standard Field Width (68m)"}
                </text>
              </>
            ) : (
              // --- TACTICAL COLLABORATION CORRIDOR SCALING (GRID ACTIVE) ---
              <>
                {/* Major Corridor Boundary Ticks */}
                {[
                  { x: 0, m: "0m", sub: lang === "id" ? "SAYAP KIRI" : "LEFT WING", textAnchor: "start" },
                  { x: 117, m: "15.9m", sub: "LINE A", textAnchor: "middle" },
                  { x: 250, m: "34.0m", sub: lang === "id" ? "G-TENGAH" : "CENTRE", textAnchor: "middle" },
                  { x: 383, m: "52.1m", sub: "LINE B", textAnchor: "middle" },
                  { x: 500, m: "68.0m", sub: lang === "id" ? "SAYAP KANAN" : "RIGHT WING", textAnchor: "end" }
                ].map((tick, idx) => (
                  <g key={`tactical-major-${idx}`}>
                    <line
                      x1={tick.x}
                      y1="14"
                      x2={tick.x}
                      y2="4"
                      stroke={tick.x === 117 || tick.x === 383 ? "#3b82f6" : lineStroke}
                      strokeWidth={tick.x === 117 || tick.x === 383 ? "1.0" : "0.75"}
                      opacity="0.65"
                      strokeDasharray={tick.x === 117 || tick.x === 383 ? "1,1" : "none"}
                      filter={useGlow ? "url(#ruler-line-glow)" : "none"}
                    />
                    <text
                      x={tick.x}
                      y="1"
                      textAnchor={tick.textAnchor as any}
                      dominantBaseline="hanging"
                      fill={tick.x === 117 || tick.x === 383 ? "#60a5fa" : lineStroke}
                      opacity="0.85"
                      fontSize="7"
                      fontWeight="900"
                      fontFamily="monospace, sans-serif"
                    >
                      {tick.m}
                    </text>
                  </g>
                ))}

                {/* Sub annotations with colored channels */}
                {/* Left wing region: centers around X=58.5 */}
                <text
                  x="58.5"
                  y="24"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={lineStroke}
                  opacity="0.5"
                  fontSize="6.5"
                  fontWeight="900"
                  fontFamily="sans-serif"
                  letterSpacing="0.05em"
                >
                  {lang === "id" ? "SAYAP KIRI (15.9m)" : "LEFT WING (15.9m)"}
                </text>

                {/* Center field corridor region: centers around X=250 */}
                <text
                  x="250"
                  y="24"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#60a5fa"
                  opacity="0.6"
                  fontSize="6.5"
                  fontWeight="900"
                  fontFamily="sans-serif"
                  letterSpacing="0.08em"
                >
                  {lang === "id" ? "CORRIDOR TENGAH (36.2m)" : "CENTRAL CORRIDOR (36.2m)"}
                </text>

                {/* Right wing region: centers around X=441.5 */}
                <text
                  x="441.5"
                  y="24"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={lineStroke}
                  opacity="0.5"
                  fontSize="6.5"
                  fontWeight="900"
                  fontFamily="sans-serif"
                  letterSpacing="0.05em"
                >
                  {lang === "id" ? "SAYAP KANAN (15.9m)" : "RIGHT WING (15.9m)"}
                </text>
              </>
            )}
          </svg>
        </div>

        {/* BOTTOM SECTION: DETACH RECTANGLE ZONE AS THE SQUAD BENCH (28% HEIGHT ON MOBILE, 16% ON LAPTOPS) */}
        <div className="absolute bottom-0 left-0 right-0 h-[28%] sm:h-[16%] bg-[#0f0f12]/95 backdrop-blur-md border-t border-white/10 flex flex-col justify-start p-1.5 sm:p-2.5 z-40">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-0.5 sm:gap-1.5 mb-1.5 select-none shrink-0">
            <span className="text-[8px] sm:text-[9.5px] font-black text-gray-400 tracking-wider uppercase flex items-center gap-1 select-none">
              👥 {lang === "id" ? "Bangku Cadangan (Dugout)" : "Squad Bench (Dugout)"}
            </span>
            <span className="text-gray-500 italic text-[7.2px] sm:text-[8px] leading-none shrink-0">
              {lang === "id" ? "Klik sekali atau seret pemain ke lapangan" : "Click once or drag players onto field"}
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
                      className={`group relative flex items-center shrink-0 cursor-grab active:cursor-grabbing transition-all select-none ${
                        selectedSubPlayerId === sub.id
                          ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.35)] font-black"
                          : "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50"
                      }`}
                    >
                      {/* Floating Mini Stats HUD for Bench on Hover */}
                      <div className="absolute bottom-[115%] left-[50%] -translate-x-[50%] z-50 bg-[#0f0f12]/95 border border-white/10 p-2 rounded-xl shadow-2xl opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 w-36 flex flex-col gap-1 select-none backdrop-blur-md">
                        <div className="text-[8px] font-black uppercase text-indigo-400 tracking-wider mb-1 text-center border-b border-white/5 pb-1 flex justify-between items-center px-1">
                          <span>Kemampuan</span>
                          <span className="text-emerald-400 font-extrabold font-mono">
                            OVR {Math.round(((sub.stats?.speed ?? (sub.role === "FWD" ? 85 : sub.role === "MID" ? 78 : sub.role === "DEF" ? 72 : 65)) +
                              (sub.stats?.stamina ?? (sub.role === "MID" ? 85 : sub.role === "DEF" ? 80 : sub.role === "FWD" ? 75 : 70)) +
                              (sub.stats?.passing ?? (sub.role === "MID" ? 84 : sub.role === "FWD" ? 72 : sub.role === "DEF" ? 68 : 55)) +
                              (sub.stats?.dribbling ?? (sub.role === "FWD" ? 84 : sub.role === "MID" ? 78 : sub.role === "DEF" ? 60 : 30)) +
                              (sub.stats?.defending ?? (sub.role === "DEF" ? 86 : sub.role === "GK" ? 80 : sub.role === "MID" ? 70 : 35))) / 5)}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-0.5 text-[8px] font-sans text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 font-bold">SPD</span>
                            <span className="font-extrabold text-blue-400">{sub.stats?.speed ?? (sub.role === "FWD" ? 85 : sub.role === "MID" ? 78 : sub.role === "DEF" ? 72 : 65)}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 font-bold">STM</span>
                            <span className="font-extrabold text-emerald-400">{sub.stats?.stamina ?? (sub.role === "MID" ? 85 : sub.role === "DEF" ? 80 : sub.role === "FWD" ? 75 : 70)}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 font-bold">PAS</span>
                            <span className="font-extrabold text-amber-400">{sub.stats?.passing ?? (sub.role === "MID" ? 84 : sub.role === "FWD" ? 72 : sub.role === "DEF" ? 68 : 55)}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 font-bold">DRI</span>
                            <span className="font-extrabold text-pink-400">{sub.stats?.dribbling ?? (sub.role === "FWD" ? 84 : sub.role === "MID" ? 78 : sub.role === "DEF" ? 60 : 30)}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 font-bold">DEF</span>
                            <span className="font-extrabold text-purple-400">{sub.stats?.defending ?? (sub.role === "DEF" ? 86 : sub.role === "GK" ? 80 : sub.role === "MID" ? 70 : 35)}</span>
                          </div>
                        </div>
                      </div>

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
