import { useState, useEffect, useRef } from "react";
import { Image, Sparkles, AlertCircle, Download, RefreshCw, Key, HelpCircle, Eye, MonitorPlay } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Player } from "../types";

interface AIFormationImageGeneratorProps {
  formation: string;
  teamName: string;
  primaryColor: string;
  gkColor: string;
  numberColor: string;
  players: Player[];
}

export default function AIFormationImageGenerator({
  formation,
  teamName,
  primaryColor,
  gkColor,
  numberColor,
  players
}: AIFormationImageGeneratorProps) {
  const [activeTab, setActiveTab] = useState<"instant" | "gemini">("instant");
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("tactigen_custom_key") || "");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showPromptHelp, setShowPromptHelp] = useState(false);

  // Instant Vector Canvas State
  const [instantImageUrl, setInstantImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync with localStorage periodically
  useEffect(() => {
    const handleStorageChange = () => {
      setCustomApiKey(localStorage.getItem("tactigen_custom_key") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const savedKey = localStorage.getItem("tactigen_custom_key") || "";
      if (savedKey !== customApiKey) {
        setCustomApiKey(savedKey);
      }
    }, 1500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [customApiKey]);

  // Handle local 3D vector poster rendering
  const handleRenderInstantPoster = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. CLEAR & DRAW COSMIC NIGHT STADIUM SKY
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 900);
      bgGrad.addColorStop(0, "#080614");
      bgGrad.addColorStop(0.5, "#0d0a21");
      bgGrad.addColorStop(1, "#030208");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 900);

      // 2. DRAW GLOWING STADIUM FLOODLIGHTS
      // Top Left Spot
      const lGlowLeft = ctx.createRadialGradient(100, -100, 50, 200, 200, 450);
      lGlowLeft.addColorStop(0, "rgba(224, 242, 254, 0.28)");
      lGlowLeft.addColorStop(0.6, "rgba(56, 189, 248, 0.05)");
      lGlowLeft.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = lGlowLeft;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(100, -100, 600, 0, Math.PI / 2);
      ctx.fill();

      // Top Right Spot
      const lGlowRight = ctx.createRadialGradient(1100, -100, 50, 1000, 200, 450);
      lGlowRight.addColorStop(0, "rgba(224, 242, 254, 0.28)");
      lGlowRight.addColorStop(0.6, "rgba(56, 189, 248, 0.05)");
      lGlowRight.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = lGlowRight;
      ctx.beginPath();
      ctx.moveTo(1200, 0);
      ctx.arc(1100, -100, 600, Math.PI / 2, Math.PI);
      ctx.fill();

      // Spotlight beams drawing (television styling)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
      ctx.lineWidth = 140;
      ctx.beginPath();
      ctx.moveTo(50, -50);
      ctx.lineTo(400, 600);
      ctx.moveTo(1150, -50);
      ctx.lineTo(800, 600);
      ctx.stroke();

      // Draw light fixture bulbs on top margins
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 20;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(40 + i * 25, 10, 4, 0, Math.PI * 2);
        ctx.arc(1160 - i * 25, 10, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0; // reset shadows

      // 3. DRAW 3D FIELD METALLIC CONTAINER BORDER SHADOW
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.moveTo(40, 860);
      ctx.lineTo(300, 205);
      ctx.lineTo(900, 205);
      ctx.lineTo(1160, 860);
      ctx.closePath();
      ctx.fill();

      // 4. DRAW 3D PERSPECTIVE GREEN PITCH
      const getXCoords = (y: number) => {
        // maps the pitch bounds trapezoid width based on current Y
        const pct = (y - 200) / 650;
        const left = 300 - 250 * pct;
        const right = 900 + 250 * pct;
        return { left, right };
      };

      // Alternating grass stripes in 3D scale
      const steps = 11;
      const stepY = 650 / steps;
      for (let i = 0; i < steps; i++) {
        const y1 = 200 + i * stepY;
        const y2 = 200 + (i + 1) * stepY;

        const { left: l1, right: r1 } = getXCoords(y1);
        const { left: l2, right: r2 } = getXCoords(y2);

        ctx.fillStyle = i % 2 === 0 ? "#115222" : "#156c2d";
        ctx.beginPath();
        ctx.moveTo(l1, y1);
        ctx.lineTo(r1, y1);
        ctx.lineTo(r2, y2);
        ctx.lineTo(l2, y2);
        ctx.closePath();
        ctx.fill();
      }

      // Projection mapping: maps (0-100%, 0-100%) to (screenX, screenY) in perspective
      const toScreen = (fx: number, fy: number) => {
        const pctX = fx / 100;
        const pctY = fy / 100;
        const widthAtY = 600 + (1100 - 600) * pctY;
        const leftAtY = 300 - (300 - 50) * pctY;
        const x = leftAtY + widthAtY * pctX;
        const y = 200 + (850 - 200) * pctY;
        return { x, y };
      };

      // 5. DRAW WHITE LINES & OUTLINES IN 3D PERSPECTIVE
      ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
      ctx.lineWidth = 4.5;

      // Outer border
      ctx.beginPath();
      const pTL = toScreen(0, 0);
      const pTR = toScreen(100, 0);
      const pBR = toScreen(100, 100);
      const pBL = toScreen(0, 100);
      ctx.moveTo(pTL.x, pTL.y);
      ctx.lineTo(pTR.x, pTR.y);
      ctx.lineTo(pBR.x, pBR.y);
      ctx.lineTo(pBL.x, pBL.y);
      ctx.closePath();
      ctx.stroke();

      // Halfway line
      ctx.beginPath();
      const pHalfLeft = toScreen(0, 50);
      const pHalfRight = toScreen(100, 50);
      ctx.moveTo(pHalfLeft.x, pHalfLeft.y);
      ctx.lineTo(pHalfRight.x, pHalfRight.y);
      ctx.stroke();

      // Center Circle (warped perspective ellipse)
      ctx.beginPath();
      for (let deg = 0; deg <= 360; deg += 6) {
        const rad = deg * Math.PI / 180;
        const sx = 50 + 11 * Math.cos(rad);
        const sy = 50 + 11 * Math.sin(rad) * 1.08;
        const pt = toScreen(sx, sy);
        if (deg === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Center spot
      const pCenter = toScreen(50, 50);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(pCenter.x, pCenter.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Top Penalty Box (Trapezoid mapped)
      ctx.beginPath();
      const pBoxTL = toScreen(25, 0);
      const pBoxTR = toScreen(25, 18);
      const pBoxBR = toScreen(75, 18);
      const pBoxBL = toScreen(75, 0);
      ctx.moveTo(pBoxTL.x, pBoxTL.y);
      ctx.lineTo(pBoxTR.x, pBoxTR.y);
      ctx.lineTo(pBoxBR.x, pBoxBR.y);
      ctx.lineTo(pBoxBL.x, pBoxBL.y);
      ctx.stroke();

      // Top Goal Box
      ctx.beginPath();
      const pGoalTL = toScreen(38, 0);
      const pGoalTR = toScreen(38, 6);
      const pGoalBR = toScreen(62, 6);
      const pGoalBL = toScreen(62, 0);
      ctx.moveTo(pGoalTL.x, pGoalTL.y);
      ctx.lineTo(pGoalTR.x, pGoalTR.y);
      ctx.lineTo(pGoalBR.x, pGoalBR.y);
      ctx.lineTo(pGoalBL.x, pGoalBL.y);
      ctx.stroke();

      // Penalty Arc Top
      ctx.beginPath();
      for (let deg = 0; deg <= 180; deg += 6) {
        const rad = deg * Math.PI / 180;
        const sx = 50 + 11 * Math.cos(rad);
        const sy = 18 + 11 * Math.sin(rad) * 0.7;
        const pt = toScreen(sx, sy);
        if (deg === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Bottom Penalty Box (Trapezoid mapped)
      ctx.beginPath();
      const pBBoxTL = toScreen(25, 100);
      const pBBoxTR = toScreen(25, 82);
      const pBBoxBR = toScreen(75, 82);
      const pBBoxBL = toScreen(75, 100);
      ctx.moveTo(pBBoxTL.x, pBBoxTL.y);
      ctx.lineTo(pBBoxTR.x, pBBoxTR.y);
      ctx.lineTo(pBBoxBR.x, pBBoxBR.y);
      ctx.lineTo(pBBoxBL.x, pBBoxBL.y);
      ctx.stroke();

      // Bottom Goal Box
      ctx.beginPath();
      const pBGoalTL = toScreen(38, 100);
      const pBGoalTR = toScreen(38, 94);
      const pBGoalBR = toScreen(62, 94);
      const pBGoalBL = toScreen(62, 100);
      ctx.moveTo(pBGoalTL.x, pBGoalTL.y);
      ctx.lineTo(pBGoalTR.x, pBGoalTR.y);
      ctx.lineTo(pBGoalBR.x, pBGoalBR.y);
      ctx.lineTo(pBGoalBL.x, pBGoalBL.y);
      ctx.stroke();

      // Penalty Arc Bottom
      ctx.beginPath();
      for (let deg = 180; deg <= 360; deg += 6) {
        const rad = deg * Math.PI / 180;
        const sx = 50 + 11 * Math.cos(rad);
        const sy = 82 + 11 * Math.sin(rad) * 0.7;
        const pt = toScreen(sx, sy);
        if (deg === 180) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // 6. DRAW BOTTOM GOAL NET DETAILS (Spectacular volumetric depth!)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 3;
      const gL1 = toScreen(38, 100);
      const gR1 = toScreen(62, 100);
      // Net top projection (slightly extruded back and slightly down)
      const nTL = { x: gL1.x, y: gL1.y + 40 };
      const nTR = { x: gR1.x, y: gR1.y + 40 };

      ctx.beginPath();
      ctx.moveTo(gL1.x, gL1.y);
      ctx.lineTo(nTL.x, nTL.y);
      ctx.lineTo(nTR.x, nTR.y);
      ctx.lineTo(gR1.x, gR1.y);
      ctx.stroke();

      // Net grid meshlines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      for (let j = 1; j <= 5; j++) {
        const pct = j / 6;
        const lx = gL1.x + (gR1.x - gL1.x) * pct;
        const nlx = nTL.x + (nTR.x - nTL.x) * pct;
        ctx.beginPath();
        ctx.moveTo(lx, gL1.y);
        ctx.lineTo(nlx, nTL.y);
        ctx.stroke();
      }

      // 7. DRAW STARTING PLAYERS IN HIGH FIDELITY 3D JERSEY DECALS
      players
        .filter((p) => p.isStarting)
        .forEach((player) => {
          const pt = toScreen(player.x, player.y);

          // Shadow for player
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y + 14, 25, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          // Get appropriate colors
          const isGK = player.role === "GK";
          const teamColor = isGK ? gkColor : primaryColor;

          // Drawing vector jersi body
          ctx.shadowColor = "rgba(0,0,0,0.3)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 4;

          // Draw premium shirt path
          ctx.beginPath();
          const cx = pt.x;
          const cy = pt.y - 10; // offset up so player looks standing
          const k = 0.95; // scaling jerseys

          ctx.moveTo(cx - 10 * k, cy - 20 * k);
          ctx.quadraticCurveTo(cx, cy - 13 * k, cx + 10 * k, cy - 20 * k);
          ctx.lineTo(cx + 21 * k, cy - 20 * k);
          ctx.lineTo(cx + 31 * k, cy - 6 * k);
          ctx.lineTo(cx + 22 * k, cy + 0 * k);
          ctx.lineTo(cx + 17 * k, cy - 8 * k);
          ctx.lineTo(cx + 17 * k, cy + 18 * k);
          ctx.lineTo(cx - 17 * k, cy + 18 * k);
          ctx.lineTo(cx - 17 * k, cy - 8 * k);
          ctx.lineTo(cx - 22 * k, cy + 0 * k);
          ctx.lineTo(cx - 31 * k, cy - 6 * k);
          ctx.lineTo(cx - 21 * k, cy - 20 * k);
          ctx.closePath();

          // Jersey Gradient
          const shirtGrad = ctx.createLinearGradient(cx, cy - 20, cx, cy + 18);
          shirtGrad.addColorStop(0, teamColor);
          // Darken the hem for 3D depth
          shirtGrad.addColorStop(1, adjustColorBrightness(teamColor, -40));
          ctx.fillStyle = shirtGrad;
          ctx.fill();

          // Reset shadows for details
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

          // White or black lines/trims on sleeves
          ctx.strokeStyle = numberColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          // left cuff
          ctx.moveTo(cx - 31 * k, cy - 6 * k);
          ctx.lineTo(cx - 22 * k, cy + 0 * k);
          // right cuff
          ctx.moveTo(cx + 31 * k, cy - 6 * k);
          ctx.lineTo(cx + 22 * k, cy + 0 * k);
          ctx.stroke();

          // White collar trim
          ctx.strokeStyle = "rgba(255,255,255,0.25)";
          ctx.beginPath();
          ctx.arc(cx, cy - 16 * k, 7 * k, 0, Math.PI);
          ctx.stroke();

          // Draw Jersey Number on back/chest
          ctx.fillStyle = numberColor;
          ctx.font = "bold 15px 'Courier New', 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(player.number.toString(), cx, cy + 1 * k);

          // Draw position code bubble under jersey
          const badgeY = cy + 28 * k;
          ctx.fillStyle = "#111116";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(cx - 20, badgeY - 7, 40, 14, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "900 8.5px sans-serif";
          ctx.fillText(player.role, cx, badgeY + 1.2);

          // Player Name Label below
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12.5px sans-serif";
          ctx.fillText(player.name.toUpperCase(), cx, badgeY + 18);
        });

      // 8. WRITE HEADER INFOGRAPHIC SPORTS TELECAST OVERLAYS
      // Core Title
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;
      ctx.font = "900 48px sans-serif";
      ctx.fillText(`${formation.toUpperCase()} FORMATION`, 600, 75);

      // Accent Golden Highlight Underline Bar
      const bGrad = ctx.createLinearGradient(400, 0, 800, 0);
      bGrad.addColorStop(0, "rgba(234, 179, 8, 0)");
      bGrad.addColorStop(0.3, "rgba(234, 179, 8, 0.95)");
      bGrad.addColorStop(0.7, "rgba(234, 179, 8, 0.95)");
      bGrad.addColorStop(1, "rgba(234, 179, 8, 0)");
      ctx.fillStyle = bGrad;
      ctx.fillRect(400, 95, 400, 4);

      // Team Title name label
      ctx.fillStyle = "#eab308";
      ctx.shadowBlur = 0;
      ctx.font = "800 21px sans-serif";
      ctx.fillText(teamName.toUpperCase(), 600, 126);

      // Watermark indicator on lower-right
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "right";
      ctx.fillText("TACTIGEN 3D BOARDS", 1150, 885);

      const dataUrl = canvas.toDataURL("image/png");
      setInstantImageUrl(dataUrl);
    } catch (e) {
      console.error("Gagal menjamin render lokal canvas: ", e);
    }
  };

  // Run initial vector drawing and redraw when properties change
  useEffect(() => {
    handleRenderInstantPoster();
  }, [players, formation, teamName, primaryColor, gkColor, numberColor]);

  // Helper utility to adjust HEX brightness for shadow curves
  const adjustColorBrightness = (hex: string, percent: number): string => {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt(((R * (100 + percent)) / 100).toString());
    G = parseInt(((G * (100 + percent)) / 100).toString());
    B = parseInt(((B * (100 + percent)) / 100).toString());

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    R = R > 0 ? R : 0;
    G = G > 0 ? G : 0;
    B = B > 0 ? B : 0;

    const rHex = R.toString(16).padStart(2, "0");
    const gHex = G.toString(16).padStart(2, "0");
    const bHex = B.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  };

  const handleGenerateImage = async () => {
    if (!customApiKey.trim()) {
      setError("Sila masukkan Google AI Studio API Key anda di menu Setingan (ikon gear biru) terlebih dahulu untuk membolehkan penjanaan imej.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tactics/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formation,
          teamName,
          primaryColor,
          gkColor,
          customApiKey,
          customPrompt: customPrompt.trim() !== "" ? customPrompt : undefined
        })
      });

      let responseText = "";
      try {
        responseText = await response.text();
      } catch (ignored) {}

      if (!response.ok) {
        let errMessage = "Gagal menjana imej menggunakan model Gemini.";
        try {
          if (responseText) {
            const errData = JSON.parse(responseText);
            if (errData && errData.error) {
              errMessage = errData.error;
            }
          }
        } catch (jErr) {}
        throw new Error(errMessage);
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Respons daripada server tidak berada dalam bentuk JSON yang sah.");
      }

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        throw new Error("Papan imej tidak mengandungi url data visual.");
      }
    } catch (err: any) {
      console.error(err);
      
      let systemErrMessage = err?.message || "Koneksi terputus ke Google Imagen.";
      
      // If it is a quota or 429 issue, explain clearly and recommend the instant local renderer!
      if (systemErrMessage.includes("429") || systemErrMessage.includes("quota") || systemErrMessage.includes("RESOURCE_EXHAUSTED")) {
        systemErrMessage = "Had kuota Google AI Studio (Free Tier) anda telah tercapai atau telah melebihi had seminit. Sila bertukar ke mod 'Pro 3D Digital Renderer (Instan)' untuk menjana dan memuat turun imej poster 3D tercanggih tanpa had secara percuma!";
      }
      
      setError(systemErrMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imgUrl: string | null) => {
    if (!imgUrl) return;
    const link = document.createElement("a");
    link.href = imgUrl;
    link.download = `tactigen-3d-${formation}-${teamName.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#15151a] border border-white/5 rounded-2xl p-4 shadow-xl space-y-4">
      
      {/* Tab Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg text-white">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Poster Formasi 3D Studio
            </h3>
            <p className="text-[10px] text-gray-400">Jana visualisasi jersi dan stadium taktis mewah</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("instant")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "instant"
                ? "bg-blue-600 text-white shadow-md font-extrabold"
                : "text-gray-400 hover:text-white bg-transparent border-0"
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5" /> Instan 3D Vector
          </button>
          <button
            onClick={() => setActiveTab("gemini")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "gemini"
                ? "bg-purple-600 text-white shadow-md font-extrabold"
                : "text-gray-400 hover:text-white bg-transparent border-0"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Gemini Imagen AI
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: INSTANT VECTOR GRAPHIC GENERATOR */}
      {activeTab === "instant" && (
        <div className="space-y-4">
          <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-3 text-[11px] leading-relaxed text-gray-400">
            <p className="font-semibold text-emerald-400 flex items-center gap-1 mb-1">
              🎉 Mod Poster Digital 3D Aktif (Percuma & Sepatutnya Seminit!)
            </p>
            Mod ini melukis secara dinamik seluruh formasi anda secara digital 3D mengikut susunan jersi pada padang malam premium. Sebarang rombakan pemain atau pertukaran nama pasukan akan dikemaskini dalam masa nyata!
          </div>

          {instantImageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/60 rounded-2xl overflow-hidden border border-emerald-500/20 p-3 space-y-3"
            >
              <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 font-mono uppercase tracking-wider border-b border-white/5 pb-2">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Eye className="w-3.5 h-3.5" /> Sedia Dimuatturun (Vector Render)
                </span>
                <span>1200 x 900px</span>
              </div>

              <div className="relative group overflow-hidden rounded-xl border border-white/10 aspect-[4/3] bg-zinc-950 flex items-center justify-center">
                <img
                  src={instantImageUrl}
                  alt="Poster Formasi 3D Instan"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <button
                onClick={() => handleDownload(instantImageUrl)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/10"
              >
                <Download className="w-4 h-4" /> Download Poster Formasi 3D (PNG)
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* RENDER TAB 2: GEMINI IMAGEN CLOUD GENERATOR */}
      {activeTab === "gemini" && (
        <div className="space-y-4">
          {!customApiKey.trim() ? (
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 text-xs space-y-2.5">
              <div className="flex gap-2 text-amber-400 font-bold items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                <span>Kunci API Studio Diperlukan</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Ciri penjanaan imej kecerdasan buatan Gemini Imagen memerlukan **Google AI Studio API Key** anda sendiri. Masukkan API Key anda dalam kotak di bawah untuk memulakan rekaan seni lukis stadium hibrid.
              </p>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Key className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="password"
                    placeholder="Masukkan AI Studio API Key anda..."
                    value={customApiKey}
                    onChange={(e) => {
                      setCustomApiKey(e.target.value);
                      localStorage.setItem("tactigen_custom_key", e.target.value);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 placeholder-gray-600"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-950/20 border border-blue-500/15 rounded-xl px-3 py-2 text-[10px] text-blue-300 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>API Key Kustom Dimuatkan</span>
              </div>
              <button
                onClick={() => {
                  setCustomApiKey("");
                  localStorage.removeItem("tactigen_custom_key");
                }}
                className="text-red-400 hover:text-red-300 font-bold uppercase hover:underline text-[9px] bg-transparent cursor-pointer border-0"
              >
                Alih Keluar
              </button>
            </div>
          )}

          {/* Generation Input Panel */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                Prompt Kustomisasi <span className="text-gray-600 font-normal">(Opsional)</span>
              </label>
              <button
                onClick={() => setShowPromptHelp(!showPromptHelp)}
                className="p-1 hover:bg-white/5 text-gray-500 hover:text-gray-300 rounded cursor-pointer border-0 bg-transparent"
                title="Panduan Prompt"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {showPromptHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-[10px] text-gray-400 leading-relaxed"
              >
                Secara lalai, Gemini Imagen akan menjana diagram 3D formasi {formation} dengan stadium di malam hari berserta jersi bola sepak bewarna **{primaryColor}**. Anda boleh memasukkan butiran tambahan seperti: *"stadium bersalji", "stadium di bawah langit aurora ungu merah jambu"* dsb.
              </motion.div>
            )}

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`Contoh: Cinematic neon esports style background for ${formation} soccer layout...`}
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
            />

            <button
              onClick={handleGenerateImage}
              disabled={loading || !customApiKey.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-90 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-40 select-none cursor-pointer border-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Menggambar AI Formasi...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Jana 3D Formasi via Gemini Imagen
                </>
              )}
            </button>
          </div>

          {/* Error and suggestion alert panel */}
          {error && (
            <div className="bg-red-950/35 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs space-y-1.5">
              <div className="flex gap-2 items-center text-red-400 font-bold">
                <span>⚠️</span>
                <p className="font-bold text-[12px]">Pengehadan Quota Gemini Dilanggar</p>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">{error}</p>
              
              {/* Proactively offer the user to swap to the free instant renderer */}
              <div className="pt-2 border-t border-red-900/20 flex justify-end">
                <button
                  onClick={() => {
                    setActiveTab("instant");
                    setError(null);
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer border-0"
                >
                  Guna Mod Instan (Percuma & Cepat!) →
                </button>
              </div>
            </div>
          )}

          {/* Visual Result Preview */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-purple-500/15 bg-purple-950/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 animate-pulse"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                  <Sparkles className="w-5 h-5 text-purple-400 absolute inset-0 m-auto animate-ping" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-300">Sila tunggu sebentar...</span>
                  <p className="text-[10.5px] text-gray-400 leading-relaxed max-w-xs mx-auto">
                    Menjana set jersi bola sepak {formation}, merancang bayangan 3D mengikut rujukan imej dimuatnaik pada grid, dan melakukan rendering visual stadium.
                  </p>
                </div>
              </motion.div>
            )}

            {generatedImageUrl && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] space-y-3 p-3 text-center"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 font-mono uppercase tracking-wider border-b border-white/5 pb-2">
                  <span className="flex items-center gap-1 text-purple-400 font-bold">
                    <Eye className="w-3.5 h-3.5" /> Output Rendering Imagen
                  </span>
                  <span>1024 x 768px</span>
                </div>

                <div className="relative group overflow-hidden rounded-xl border border-white/10 aspect-[4/3] bg-zinc-950 flex items-center justify-center">
                  <img
                    src={generatedImageUrl}
                    alt="Hasil Formasi 3D"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-[10px] bg-black/60 text-white px-2.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1 font-bold">
                      Google Gemini AI Model active
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-center pt-1.5">
                  <button
                    onClick={() => handleDownload(generatedImageUrl)}
                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/10 border-0"
                  >
                    <Download className="w-4 h-4" /> Download Imej (AI)
                  </button>
                  <button
                    onClick={handleGenerateImage}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-white/10 cursor-pointer"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
