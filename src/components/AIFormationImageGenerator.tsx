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
  const handleRenderInstantPoster = (loadedImages: Record<string, HTMLImageElement> = {}) => {
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

      // 7. DRAW STARTING PLAYERS IN HIGH FIDELITY 3D JERSEY DECALS OR AVATAR PHOTOS
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

          const cx = pt.x;
          const cy = pt.y - 10; // offset up so player looks standing
          const k = 0.95; // scaling jerseys

          const hasPhoto = !!(player.photo && loadedImages[player.id]);

          if (hasPhoto) {
            // High fidelity round profile photo rendering
            const radius = 25 * k;

            // Soft glowing disc shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 5;

            ctx.fillStyle = "#15151a";
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Crop image within the profile circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.clip();

            const pImg = loadedImages[player.id];
            const size = Math.min(pImg.width, pImg.height);
            const sx = (pImg.width - size) / 2;
            const sy = (pImg.height - size) / 2;
            ctx.drawImage(
              pImg,
              sx,
              sy,
              size,
              size,
              cx - radius,
              cy - radius,
              radius * 2,
              radius * 2
            );
            ctx.restore();

            // Premium frame Border
            ctx.strokeStyle = teamColor;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Overlay squad number badge at the bottom-right of the disc
            const numBadgeX = cx + 18 * k;
            const numBadgeY = cy + 14 * k;
            const numRadius = 9 * k;

            ctx.fillStyle = "#0c0c0e";
            ctx.strokeStyle = numberColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(numBadgeX, numBadgeY, numRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9.5px 'Courier New', 'JetBrains Mono', monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(player.number.toString(), numBadgeX, numBadgeY + 0.5);

          } else {
            // Drawing vector jersi body
            ctx.shadowColor = "rgba(0,0,0,0.3)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            ctx.beginPath();
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
          }

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
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
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
    let active = true;
    const playersWithPhotos = players.filter((p) => p.isStarting && p.photo);

    if (playersWithPhotos.length === 0) {
      handleRenderInstantPoster({});
      return;
    }

    const loadedImages: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;

    playersWithPhotos.forEach((player) => {
      if (!player.photo) return;
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = player.photo;
      img.onload = () => {
        if (!active) return;
        loadedImages[player.id] = img;
        loadedCount++;
        if (loadedCount === playersWithPhotos.length) {
          handleRenderInstantPoster(loadedImages);
        }
      };
      img.onerror = () => {
        if (!active) return;
        loadedCount++;
        if (loadedCount === playersWithPhotos.length) {
          handleRenderInstantPoster(loadedImages);
        }
      };
    });

    // Render immediately (it will update as photos finish loading)
    handleRenderInstantPoster(loadedImages);

    return () => {
      active = false;
    };
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
        responseText = (await response.text() || "").trim();
      } catch (ignored) {}

      if (!response.ok) {
        let errMessage = "Gagal menjana imej menggunakan model Gemini.";
        try {
          const trimmedText = (responseText || "").trim();
          if (trimmedText && trimmedText.toLowerCase() !== "undefined" && trimmedText.toLowerCase() !== "null") {
            const errData = JSON.parse(trimmedText);
            if (errData && errData.error) {
              if (typeof errData.error === "object" && errData.error !== null && errData.error.message) {
                errMessage = errData.error.message;
              } else if (typeof errData.error === "string") {
                errMessage = errData.error;
              } else {
                errMessage = JSON.stringify(errData.error);
              }
            }
          }
        } catch (jErr) {}
        throw new Error(errMessage);
      }

      let data: any;
      try {
        const trimmedText = (responseText || "").trim();
        const normText = trimmedText.toLowerCase();
        if (!trimmedText || normText === "undefined" || normText === "null") {
          throw new Error("Respons pelayan kosong.");
        }
        data = JSON.parse(trimmedText);
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
      {/* Clean minimal Header, no description or explanations */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
          <Image className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black text-white uppercase tracking-wider">
          Poster Formasi 3D
        </h3>
      </div>

      {instantImageUrl && (
        <div className="space-y-3">
          <div className="relative group overflow-hidden rounded-xl border border-white/10 aspect-[4/3] bg-zinc-950 flex items-center justify-center">
            <img
              src={instantImageUrl}
              alt="Poster Formasi 3D"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
          </div>

          <button
            onClick={() => handleDownload(instantImageUrl)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/10 border-0 uppercase tracking-wider active:scale-95"
          >
            <Download className="w-4 h-4" /> Save Formation (PNG)
          </button>
        </div>
      )}
    </div>
  );
}
