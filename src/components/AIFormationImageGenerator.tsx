import { useState, useEffect, useRef, useMemo } from "react";
import { Image, Sparkles, AlertCircle, Download, RefreshCw, Key, HelpCircle, Eye, MonitorPlay } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Player } from "../types";
import Interactive3DCard from "./Interactive3DCard";

interface AIFormationImageGeneratorProps {
  formation: string;
  teamName: string;
  primaryColor: string;
  gkColor: string;
  numberColor: string;
  players: Player[];
  teamLogo?: string | null;
  teamJersey?: string | null;
  lang?: string;
  managerName?: string;
  managerPhoto?: string | null;
  isEnemyModeActive?: boolean;
}

export default function AIFormationImageGenerator({
  formation,
  teamName,
  primaryColor,
  gkColor,
  numberColor,
  players,
  teamLogo,
  teamJersey = null,
  lang = "en",
  managerName = "Budi Santoso",
  managerPhoto = null,
  isEnemyModeActive = false
}: AIFormationImageGeneratorProps) {
  const [activeTab, setActiveTab] = useState<"instant" | "gemini">("instant");
  const [posterTheme, setPosterTheme] = useState<"stadium" | "club_classic">("stadium");
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("tactigen_custom_key") || "");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showPromptHelp, setShowPromptHelp] = useState(false);

  // Instant Vector Canvas State
  const [instantImageUrl, setInstantImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute adjusted players by uncompressing Y coordinates if enemy mode is active
  const adjustedPlayers = useMemo(() => {
    return players.map((player) => {
      if (isEnemyModeActive && player.isStarting) {
        // Stretch Y back from the compressed [52, 90] to the original full [0, 100] range
        const uncompressedY = Math.max(0, Math.min(100, ((player.y - 52) / 38) * 100));
        return { ...player, y: parseFloat(uncompressedY.toFixed(1)) };
      }
      return player;
    });
  }, [players, isEnemyModeActive]);

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

      // Dynamic dominant color extraction from uploaded jersey
      const getDominantColor = (img: HTMLImageElement): string | null => {
        try {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = 16;
          tempCanvas.height = 16;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) return null;
          tempCtx.drawImage(img, 0, 0, 16, 16);
          const imgData = tempCtx.getImageData(0, 0, 16, 16).data;

          let rSum = 0, gSum = 0, bSum = 0, count = 0;
          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            if (a > 180) {
              rSum += r;
              gSum += g;
              bSum += b;
              count++;
            }
          }
          if (count > 0) {
            const avgR = Math.round(rSum / count);
            const avgG = Math.round(gSum / count);
            const avgB = Math.round(bSum / count);
            const toHex = (c: number) => {
              const h = Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0");
              return h;
            };
            return `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`;
          }
        } catch (e) {
          console.warn("Failed to extract dominant color:", e);
        }
        return null;
      };

      const hexToRgb = (hex: string) => {
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        let fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };

      const getThemePitchColor = (themeHex: string, isAlt: boolean) => {
        const rgb = hexToRgb(themeHex) || { r: 12, g: 25, b: 68 };
        const baseR = 10, baseG = 15, baseB = 30;
        const factor = 0.22;
        let r = Math.round(baseR * (1 - factor) + rgb.r * factor);
        let g = Math.round(baseG * (1 - factor) + rgb.g * factor);
        let b = Math.round(baseB * (1 - factor) + rgb.b * factor);
        if (isAlt) {
          r = Math.min(255, r + 5);
          g = Math.min(255, g + 8);
          b = Math.min(255, b + 12);
        }
        const toHex = (c: number) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      };

      const getGlowLineColor = (themeHex: string) => {
        const rgb = hexToRgb(themeHex) || { r: 71, g: 147, b: 247 };
        const maxVal = Math.max(rgb.r, rgb.g, rgb.b);
        let factor = 1.0;
        if (maxVal < 180) {
          factor = 180 / maxVal;
        }
        const r = Math.round(Math.min(255, rgb.r * factor));
        const g = Math.round(Math.min(255, rgb.g * factor));
        const b = Math.round(Math.min(255, rgb.b * factor));
        const toHex = (c: number) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      };

      // Determine active themeColor: Extract from uploaded team jersey, or use primaryColor as default
      let themeColor = primaryColor;
      const jerseyImg = loadedImages["teamJersey"];
      if (jerseyImg) {
        const extracted = getDominantColor(jerseyImg);
        if (extracted) {
          themeColor = extracted;
        }
      }

      const glowRgb = hexToRgb(themeColor) || { r: 56, g: 189, b: 248 };
      const glowLineColor = getGlowLineColor(themeColor);

      // ==========================================
      // 1. CLEAR & DRAW MODERN DEEP MIDNIGHT SKY
      // ==========================================
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 900);
      bgGrad.addColorStop(0, "#060913");
      bgGrad.addColorStop(0.5, "#0b1226");
      bgGrad.addColorStop(1, "#03050a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 900);

      // ==========================================
      // 2. DRAW LEFT PANEL CONTAINER BACKGROUND WITH STRIPES
      // ==========================================
      // Fill the left sidebar area
      ctx.fillStyle = "#070b17";
      ctx.fillRect(0, 0, 320, 900);

      // Draw premium subtle diagonal background lines in the sidebar
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 320, 900);
      ctx.clip();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 3;
      for (let offset = -900; offset < 1200; offset += 32) {
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset + 900, 900);
        ctx.stroke();
      }
      ctx.restore();

      // Soft vertical separator line between left sidebar and main pitch area
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(320, 0);
      ctx.lineTo(320, 900);
      ctx.stroke();

      // ==========================================
      // 3. DRAW STARTING XI HEADERS & PLAYERS LIST
      // ==========================================
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic 900 36px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("STARTING XI", 30, 42);

      // Fetch starting players and sort them by role for an official clean appearance
      const starters = adjustedPlayers.filter((p) => p.isStarting);
      const roleOrder: Record<string, number> = { "GK": 0, "DEF": 1, "MID": 2, "FWD": 3 };
      const sortedStarters = [...starters].sort((a, b) => {
        const valA = roleOrder[a.role] ?? 99;
        const valB = roleOrder[b.role] ?? 99;
        if (valA !== valB) return valA - valB;
        return a.number - b.number;
      });

      // Draw dual-badge skewed parallelogram list items for starting XI
      const itemH = 32;
      const itemGap = 42;
      const listStartY = 100;
      const skewAngle = 8; // slant offset in pixels

      sortedStarters.forEach((player, idx) => {
        if (idx >= 11) return; // Keep exactly max 11 starting players in list
        const rowY = listStartY + idx * itemGap;

        // a) Draw squad number badge (Left)
        const numBadgeW = 44;
        ctx.save();
        // Create custom gradient based on dynamic themeColor
        const badgeGrad = ctx.createLinearGradient(30, rowY, 30 + numBadgeW, rowY + itemH);
        badgeGrad.addColorStop(0, adjustColorBrightness(themeColor, -20));
        badgeGrad.addColorStop(1, adjustColorBrightness(themeColor, 15));
        ctx.fillStyle = badgeGrad;

        ctx.beginPath();
        ctx.moveTo(30 + skewAngle, rowY);
        ctx.lineTo(30 + numBadgeW + skewAngle, rowY);
        ctx.lineTo(30 + numBadgeW, rowY + itemH);
        ctx.lineTo(30, rowY + itemH);
        ctx.closePath();
        ctx.fill();

        // Stroke highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Write padded squad number
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Courier New', 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          player.number.toString().padStart(2, "0"),
          30 + (numBadgeW / 2) + (skewAngle / 2),
          rowY + (itemH / 2) + 0.5
        );

        // b) Draw name badge (Right, skewed card)
        const nameCardX = 30 + numBadgeW + 4;
        const nameCardW = 212;
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(nameCardX + skewAngle, rowY);
        ctx.lineTo(nameCardX + nameCardW + skewAngle, rowY);
        ctx.lineTo(nameCardX + nameCardW, rowY + itemH);
        ctx.lineTo(nameCardX, rowY + itemH);
        ctx.closePath();
        ctx.fill();

        // Subtle bottom border/shadow
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Write player name inside white card
        ctx.fillStyle = "#0c1221"; // very dark blue for high contrast
        ctx.font = "bold 12.5px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        let displayListName = player.name.toUpperCase();
        if (displayListName.length > 18) {
          displayListName = displayListName.substring(0, 16) + "..";
        }
        ctx.fillText(
          displayListName,
          nameCardX + 15 + (skewAngle / 2),
          rowY + (itemH / 2) + 0.5
        );

        // Position Badge (GK, DEF, MID, FWD) inside the name card on the far right
        ctx.fillStyle = "rgba(12, 18, 33, 0.4)";
        ctx.font = "900 8.5px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(
          player.role,
          nameCardX + nameCardW - 10 + (skewAngle / 2),
          rowY + (itemH / 2) + 0.5
        );
      });

      // ==========================================
      // 4. DRAW SUBSTITUTIONS LIST SECTION
      // ==========================================
      const subsStartY = 595;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const subsHeaderLabel = lang === "id" ? "PEMAIN CADANGAN" : "SUBSTITUTIONS";
      ctx.fillText(subsHeaderLabel, 30, subsStartY);

      const substitutes = adjustedPlayers.filter((p) => !p.isStarting);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";

      // Group substitute players into text lines (pairs of 2 per row)
      const subLines: string[] = [];
      for (let i = 0; i < substitutes.length; i += 2) {
        const sub1 = substitutes[i];
        const sub2 = substitutes[i + 1];
        let sLine = `${sub1.number}. ${sub1.name.toUpperCase()}`;
        if (sub2) {
          sLine += `, ${sub2.number}. ${sub2.name.toUpperCase()}`;
        }
        subLines.push(sLine);
      }

      subLines.forEach((line, idx) => {
        if (idx >= 10) return; // limit rows
        ctx.fillText(line, 30, subsStartY + 32 + idx * 22);
      });

      // ==========================================
      // 5. DRAW STADIUM GLOWS & SPOTLIGHTS
      // ==========================================
      // Radial glow on the top field
      const glowGrad = ctx.createRadialGradient(760, 100, 20, 760, 200, 500);
      glowGrad.addColorStop(0, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0.12)`);
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(760, 150, 600, 0, Math.PI * 2);
      ctx.fill();

      // Television Stadium Spotlights beams
      ctx.strokeStyle = `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0.025)`;
      ctx.lineWidth = 140;
      ctx.beginPath();
      ctx.moveTo(350, -50);
      ctx.lineTo(650, 600);
      ctx.moveTo(1150, -50);
      ctx.lineTo(850, 600);
      ctx.stroke();

      // Draw light fixture bulbs on top margins
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 12;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(360 + i * 25, 20, 3, 0, Math.PI * 2);
        ctx.arc(1140 - i * 25, 20, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0; // reset shadow state

      // ==========================================
      // 6. DRAW 3D PERSPECTIVE FIELD
      // ==========================================
      // Dynamic coordinate projection mapping (3D perspective)
      // Center of field area is at X = 760. Field is symmetric.
      const toScreen = (fx: number, fy: number) => {
        const pctX = fx / 100;
        const pctY = fy / 100;

        const topWidth = 540;
        const bottomWidth = 760;
        const topLeft = 490;
        const bottomLeft = 380;

        const widthAtY = topWidth + (bottomWidth - topWidth) * pctY;
        const leftAtY = topLeft + (bottomLeft - topLeft) * pctY;

        const x = leftAtY + widthAtY * pctX;
        const y = 215 + 600 * pctY;
        return { x, y };
      };

      // Draw beautiful alternating deep thematic pitch grass stripes
      const stripesCount = 11;
      const stripeH = 100 / stripesCount;
      for (let i = 0; i < stripesCount; i++) {
        const sy1 = i * stripeH;
        const sy2 = (i + 1) * stripeH;

        const ptL1 = toScreen(0, sy1);
        const ptR1 = toScreen(100, sy1);
        const ptR2 = toScreen(100, sy2);
        const ptL2 = toScreen(0, sy2);

        // Use custom thematic blending to produce stunning grass textures
        ctx.fillStyle = getThemePitchColor(themeColor, i % 2 !== 0);
        ctx.beginPath();
        ctx.moveTo(ptL1.x, ptL1.y);
        ctx.lineTo(ptR1.x, ptR1.y);
        ctx.lineTo(ptR2.x, ptR2.y);
        ctx.lineTo(ptL2.x, ptL2.y);
        ctx.closePath();
        ctx.fill();
      }

      // Draw glowing thematic outlines
      ctx.strokeStyle = glowLineColor;
      ctx.lineWidth = 3.5;

      // Outer boundary lines
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

      // Center circle
      ctx.beginPath();
      for (let deg = 0; deg <= 360; deg += 6) {
        const rad = deg * Math.PI / 180;
        const sx = 50 + 11 * Math.cos(rad);
        const sy = 50 + 11 * Math.sin(rad) * 1.05;
        const pt = toScreen(sx, sy);
        if (deg === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Center spot
      const pCenter = toScreen(50, 50);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(pCenter.x, pCenter.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Top penalty area box (Trapezoid)
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

      // Top goal box
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

      // Top penalty arc
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

      // Bottom penalty area box
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

      // Bottom goal box
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

      // Bottom penalty arc
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

      // Draw bottom goal net lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 3;
      const gL1 = toScreen(38, 100);
      const gR1 = toScreen(62, 100);
      const nTL = { x: gL1.x, y: gL1.y + 35 };
      const nTR = { x: gR1.x, y: gR1.y + 35 };

      ctx.beginPath();
      ctx.moveTo(gL1.x, gL1.y);
      ctx.lineTo(nTL.x, nTL.y);
      ctx.lineTo(nTR.x, nTR.y);
      ctx.lineTo(gR1.x, gR1.y);
      ctx.stroke();

      // Net grid meshlines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.2;
      for (let j = 1; j <= 5; j++) {
        const pct = j / 6;
        const lx = gL1.x + (gR1.x - gL1.x) * pct;
        const nlx = nTL.x + (nTR.x - nTL.x) * pct;
        ctx.beginPath();
        ctx.moveTo(lx, gL1.y);
        ctx.lineTo(nlx, nTL.y);
        ctx.stroke();
      }

      // ==========================================
      // 7. DRAW TEAM LOGO & TEAM NAME TITLE BANNER
      // ==========================================
      const headerX = 760;
      const headerY = 100;
      const headerSkew = 15;
      const headerW = 300;
      const headerH = 45;

      // Draw team name parallelogram
      ctx.save();
      const bannerGrad = ctx.createLinearGradient(headerX - headerW / 2, headerY, headerX + headerW / 2, headerY + headerH);
      bannerGrad.addColorStop(0, "#ffffff");
      bannerGrad.addColorStop(1, "#e2e8f0");
      ctx.fillStyle = bannerGrad;

      ctx.beginPath();
      ctx.moveTo(headerX - headerW / 2 + headerSkew, headerY);
      ctx.lineTo(headerX + headerW / 2 + headerSkew, headerY);
      ctx.lineTo(headerX + headerW / 2, headerY + headerH);
      ctx.lineTo(headerX - headerW / 2, headerY + headerH);
      ctx.closePath();
      ctx.fill();

      // Draw subtle bottom outline shadow
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Print team name inside the header banner
      ctx.fillStyle = "#0c1b40"; // Dark blue color
      ctx.font = "italic 900 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(teamName.toUpperCase(), headerX + (headerSkew / 2), headerY + headerH / 2 + 0.5);

      // Draw premium circular Team Logo on the left of team banner
      const logoCenterX = headerX - (headerW / 2) - 15;
      const logoCenterY = headerY + headerH / 2;
      const logoOuterRadius = 36;
      const logoInnerRadius = 30;

      ctx.save();
      // Outer shiny chrome ring themed with themeColor
      const logoRingGrad = ctx.createRadialGradient(logoCenterX, logoCenterY, logoInnerRadius, logoCenterX, logoCenterY, logoOuterRadius);
      logoRingGrad.addColorStop(0, "#ffffff");
      logoRingGrad.addColorStop(0.5, adjustColorBrightness(themeColor, 15));
      logoRingGrad.addColorStop(1, adjustColorBrightness(themeColor, -20));
      ctx.fillStyle = logoRingGrad;
      ctx.beginPath();
      ctx.arc(logoCenterX, logoCenterY, logoOuterRadius, 0, Math.PI * 2);
      ctx.fill();

      // Dark emblem face
      ctx.fillStyle = "#060913";
      ctx.beginPath();
      ctx.arc(logoCenterX, logoCenterY, logoInnerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw custom team logo, or beautifully detailed fallback soccer starball!
      const tLogoImg = loadedImages["teamLogo"];
      if (tLogoImg) {
        ctx.beginPath();
        ctx.arc(logoCenterX, logoCenterY, logoInnerRadius - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          tLogoImg,
          logoCenterX - (logoInnerRadius - 2),
          logoCenterY - (logoInnerRadius - 2),
          (logoInnerRadius - 2) * 2,
          (logoInnerRadius - 2) * 2
        );
      } else {
        // Draw elegant soccer starball geometry vectors
        ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 5; i++) {
          const sAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const starX = logoCenterX + 15 * Math.cos(sAngle);
          const starY = logoCenterY + 15 * Math.sin(sAngle);
          ctx.beginPath();
          ctx.arc(starX, starY, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();

      // ==========================================
      // 8. DRAW PLAYERS ON THE PITCH (JERSEY + MINI-BANNER)
      // ==========================================
      adjustedPlayers
          .filter((p) => p.isStarting)
          .forEach((player) => {
            const pt = toScreen(player.x, player.y);
            const isGK = player.role === "GK";
            const playerColor = isGK ? gkColor : themeColor;
            const cx = pt.x;
            const cy = pt.y - 14; // elevation
            const k = 1.25; // standard coordinate multiplier for jerseys

            // Draw player shadow
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 18 * k, 20 * k, 7 * k, 0, 0, Math.PI * 2);
            ctx.fill();

            const hasPhoto = !!(player.photo && loadedImages[player.id]);

            if (hasPhoto) {
              // Circle profile photo for starting player
              const radius = 22 * k;
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

              // Circular profile frame border
              ctx.strokeStyle = playerColor;
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.arc(cx, cy, radius, 0, Math.PI * 2);
              ctx.stroke();

            } else {
              // Draw regular soccer jerseys (with support for custom team jersey image upload!)
              const jerseyImg = !isGK ? loadedImages["teamJersey"] : null;

              if (jerseyImg) {
                // Custom jersey layout
                ctx.save();
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
                ctx.clip();

                ctx.drawImage(jerseyImg, cx - 31 * k, cy - 20 * k, 62 * k, 38 * k);
                ctx.restore();

                // Add subtle outline stroke
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.lineWidth = 1;
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
                ctx.stroke();

              } else {
                // Vector jersey with standard team color
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

                const shirtGrad = ctx.createLinearGradient(cx, cy - 20 * k, cx, cy + 18 * k);
                shirtGrad.addColorStop(0, playerColor);
                shirtGrad.addColorStop(1, adjustColorBrightness(playerColor, -40));
                ctx.fillStyle = shirtGrad;
                ctx.fill();

                // Cuff trims
                ctx.strokeStyle = numberColor;
                ctx.lineWidth = 2 * k;
                ctx.beginPath();
                ctx.moveTo(cx - 31 * k, cy - 6 * k);
                ctx.lineTo(cx - 22 * k, cy + 0 * k);
                ctx.moveTo(cx + 31 * k, cy - 6 * k);
                ctx.lineTo(cx + 22 * k, cy + 0 * k);
                ctx.stroke();
              }

              // Draw Jersey Number on Back
              ctx.fillStyle = numberColor;
              ctx.font = `bold ${14 * k}px 'Courier New', 'JetBrains Mono', monospace`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(player.number.toString(), cx, cy);
            }

            // ==========================================
            // DRAW DUAL-BADGE MINI SKEWED NAME TAG BELOW PLAYER
            // ==========================================
            const tagY = cy + 24 * k;
            const tagW = 90;
            const tagH = 17;
            const tagSkew = 4;

            // Number Badge on Left (Thematic skewed badge)
            ctx.fillStyle = playerColor;
            ctx.beginPath();
            ctx.moveTo(cx - 45 + tagSkew, tagY);
            ctx.lineTo(cx - 23 + tagSkew, tagY);
            ctx.lineTo(cx - 23, tagY + tagH);
            ctx.lineTo(cx - 45, tagY + tagH);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              player.number.toString().padStart(2, "0"),
              cx - 34 + (tagSkew / 2),
              tagY + (tagH / 2) + 0.5
            );

            // Name Badge on Right (White skewed card)
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(cx - 21 + tagSkew, tagY);
            ctx.lineTo(cx + 45 + tagSkew, tagY);
            ctx.lineTo(cx + 45, tagY + tagH);
            ctx.lineTo(cx - 21, tagY + tagH);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#0c1221"; // Dark charcoal blue text
            ctx.font = "bold 8.5px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            let displayPlayerName = player.name.toUpperCase();
            if (displayPlayerName.length > 10) {
              displayPlayerName = displayPlayerName.substring(0, 8) + ".";
            }
            ctx.fillText(
              displayPlayerName,
              cx + 12 + (tagSkew / 2),
              tagY + (tagH / 2) + 0.5
            );
          });

      // ==========================================
      // 9. DRAW MANAGER BANNER AT THE BOTTOM OF PITCH
      // ==========================================
      const coachCenterX = 760;
      const coachY = 840;
      const coachH = 28;
      const coachSkew = 5;

      // Draw "MANAGER" label badge themed with themeColor
      ctx.save();
      const cBadgeGrad = ctx.createLinearGradient(coachCenterX - 130, coachY, coachCenterX - 40, coachY + coachH);
      cBadgeGrad.addColorStop(0, adjustColorBrightness(themeColor, -20));
      cBadgeGrad.addColorStop(1, adjustColorBrightness(themeColor, 15));
      ctx.fillStyle = cBadgeGrad;

      ctx.beginPath();
      ctx.moveTo(coachCenterX - 130 + coachSkew, coachY);
      ctx.lineTo(coachCenterX - 40 + coachSkew, coachY);
      ctx.lineTo(coachCenterX - 40, coachY + coachH);
      ctx.lineTo(coachCenterX - 130, coachY + coachH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const mLabel = lang === "id" ? "PELATIH" : "MANAGER";
      ctx.fillText(mLabel, coachCenterX - 85 + (coachSkew / 2), coachY + coachH / 2 + 0.5);

      // Draw Coach Name badge
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(coachCenterX - 36 + coachSkew, coachY);
      ctx.lineTo(coachCenterX + 130 + coachSkew, coachY);
      ctx.lineTo(coachCenterX + 130, coachY + coachH);
      ctx.lineTo(coachCenterX - 36, coachY + coachH);
      ctx.closePath();
      ctx.fill();

      // Write head coach name inside white card
      ctx.fillStyle = "#0c1221";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let displayCoachName = (managerName || (lang === "id" ? "Budi Santoso" : "Alex Ferguson")).toUpperCase();
      if (displayCoachName.length > 20) {
        displayCoachName = displayCoachName.substring(0, 18) + "..";
      }
      ctx.fillText(displayCoachName, coachCenterX + 47 + (coachSkew / 2), coachY + coachH / 2 + 0.5);

      // Watermark indicator on lower-right corner of the canvas
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "right";
      ctx.fillText("TACTIGEN 3D BOARDS", 1160, 880);

      const dataUrl = canvas.toDataURL("image/png");
      setInstantImageUrl(dataUrl);
    } catch (e) {
      console.error("Gagal menjamin render lokal canvas: ", e);
    }
  };

  // Handle local Club Classic (wavy modern poster with custom card design) rendering
  const handleRenderClubClassicPoster = (loadedImages: Record<string, HTMLImageElement> = {}) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dominant color extractor helper
      const getDominantColor = (img: HTMLImageElement): string | null => {
        try {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = 16;
          tempCanvas.height = 16;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) return null;
          tempCtx.drawImage(img, 0, 0, 16, 16);
          const imgData = tempCtx.getImageData(0, 0, 16, 16).data;
          let rSum = 0, gSum = 0, bSum = 0, count = 0;
          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];
            if (a > 180) {
              rSum += r; gSum += g; bSum += b; count++;
            }
          }
          if (count > 0) {
            const toHex = (c: number) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0");
            return `#${toHex(Math.round(rSum / count))}${toHex(Math.round(gSum / count))}${toHex(Math.round(bSum / count))}`;
          }
        } catch (e) {
          console.warn("Failed to extract dominant color:", e);
        }
        return null;
      };

      let themeColor = primaryColor;
      const jerseyImg = loadedImages["teamJersey"];
      if (jerseyImg) {
        const extracted = getDominantColor(jerseyImg);
        if (extracted) themeColor = extracted;
      }

      // 1. Clear background & draw premium sports backdrop (Midnight blue + tiger/zebra stripes)
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 900);
      bgGrad.addColorStop(0, "#050915");
      bgGrad.addColorStop(0.5, "#0b1226");
      bgGrad.addColorStop(1, "#03040a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 900);

      // Procedural tiger/zebra stripes (overlays)
      ctx.save();
      ctx.fillStyle = "rgba(16, 80, 255, 0.09)";
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(-300 + i * 140, -100);
        ctx.bezierCurveTo(100 + i * 130, 300, -100 + i * 140, 600, 1500, 1000);
        ctx.lineTo(1600, 1000);
        ctx.lineTo(-300 + i * 140 + 90, -100);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 2. Draw Left Sidebar (Classic dark background + golden diagonal subtle stripes)
      ctx.fillStyle = "#030612";
      ctx.fillRect(0, 0, 320, 900);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 320, 900);
      ctx.clip();
      ctx.strokeStyle = "rgba(234, 179, 8, 0.04)";
      ctx.lineWidth = 3;
      for (let offset = -900; offset < 1200; offset += 32) {
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset + 900, 900);
        ctx.stroke();
      }
      ctx.restore();

      // Golden vertical dividing separator line
      ctx.strokeStyle = "rgba(234, 179, 8, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(320, 0);
      ctx.lineTo(320, 900);
      ctx.stroke();

      // 3. Draw Left sidebar text & list: STARTING XI
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic 900 36px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("STARTING XI", 30, 42);

      // Fetch starting players sorted by role
      const starters = adjustedPlayers.filter((p) => p.isStarting);
      const roleOrder: Record<string, number> = { "GK": 0, "DEF": 1, "MID": 2, "FWD": 3 };
      const sortedStarters = [...starters].sort((a, b) => {
        const valA = roleOrder[a.role] ?? 99;
        const valB = roleOrder[b.role] ?? 99;
        if (valA !== valB) return valA - valB;
        return a.number - b.number;
      });

      const itemH = 32;
      const itemGap = 42;
      const listStartY = 100;
      const skewAngle = 8;

      sortedStarters.forEach((player, idx) => {
        if (idx >= 11) return;
        const rowY = listStartY + idx * itemGap;

        // Squad number badge with golden gradient
        const numBadgeW = 44;
        ctx.save();
        const badgeGrad = ctx.createLinearGradient(30, rowY, 30 + numBadgeW, rowY + itemH);
        badgeGrad.addColorStop(0, "#855d14");
        badgeGrad.addColorStop(1, "#ebd55b");
        ctx.fillStyle = badgeGrad;

        ctx.beginPath();
        ctx.moveTo(30 + skewAngle, rowY);
        ctx.lineTo(30 + numBadgeW + skewAngle, rowY);
        ctx.lineTo(30 + numBadgeW, rowY + itemH);
        ctx.lineTo(30, rowY + itemH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Courier New', 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          player.number.toString().padStart(2, "0"),
          30 + (numBadgeW / 2) + (skewAngle / 2),
          rowY + (itemH / 2) + 0.5
        );

        // Name badge
        const nameCardX = 30 + numBadgeW + 4;
        const nameCardW = 212;
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(nameCardX + skewAngle, rowY);
        ctx.lineTo(nameCardX + nameCardW + skewAngle, rowY);
        ctx.lineTo(nameCardX + nameCardW, rowY + itemH);
        ctx.lineTo(nameCardX, rowY + itemH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = "#0c1221";
        ctx.font = "bold 12.5px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        let displayListName = player.name.toUpperCase();
        if (displayListName.length > 18) {
          displayListName = displayListName.substring(0, 16) + "..";
        }
        ctx.fillText(
          displayListName,
          nameCardX + 15 + (skewAngle / 2),
          rowY + (itemH / 2) + 0.5
        );

        ctx.fillStyle = "rgba(12, 18, 33, 0.4)";
        ctx.font = "900 8.5px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(
          player.role,
          nameCardX + nameCardW - 10 + (skewAngle / 2),
          rowY + (itemH / 2) + 0.5
        );
      });

      // Substitutions list
      const subsStartY = 595;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const subsHeaderLabel = lang === "id" ? "PEMAIN CADANGAN" : "SUBSTITUTIONS";
      ctx.fillText(subsHeaderLabel, 30, subsStartY);

      const substitutes = adjustedPlayers.filter((p) => !p.isStarting);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";

      const subLines: string[] = [];
      for (let i = 0; i < substitutes.length; i += 2) {
        const sub1 = substitutes[i];
        const sub2 = substitutes[i + 1];
        let sLine = `${sub1.number}. ${sub1.name.toUpperCase()}`;
        if (sub2) {
          sLine += `, ${sub2.number}. ${sub2.name.toUpperCase()}`;
        }
        subLines.push(sLine);
      }

      subLines.forEach((line, idx) => {
        if (idx >= 10) return;
        ctx.fillText(line, 30, subsStartY + 32 + idx * 22);
      });

      // 4. coordinate perspective projector
      const toScreen = (fx: number, fy: number) => {
        const pctX = fx / 100;
        const pctY = fy / 100;
        const topWidth = 540;
        const bottomWidth = 760;
        const topLeft = 490;
        const bottomLeft = 380;
        const widthAtY = topWidth + (bottomWidth - topWidth) * pctY;
        const leftAtY = topLeft + (bottomLeft - topLeft) * pctY;
        return { x: leftAtY + widthAtY * pctX, y: 215 + 600 * pctY };
      };

      // Draw golden pitch skeleton outlines
      ctx.strokeStyle = "rgba(234, 179, 8, 0.42)";
      ctx.lineWidth = 2.5;

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

      ctx.beginPath();
      const pHalfLeft = toScreen(0, 50);
      const pHalfRight = toScreen(100, 50);
      ctx.moveTo(pHalfLeft.x, pHalfLeft.y);
      ctx.lineTo(pHalfRight.x, pHalfRight.y);
      ctx.stroke();

      ctx.beginPath();
      for (let deg = 0; deg <= 360; deg += 6) {
        const rad = deg * Math.PI / 180;
        const sx = 50 + 11 * Math.cos(rad);
        const sy = 50 + 11 * Math.sin(rad) * 1.05;
        const pt = toScreen(sx, sy);
        if (deg === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      const pCenter = toScreen(50, 50);
      ctx.fillStyle = "rgba(234, 179, 8, 0.65)";
      ctx.beginPath();
      ctx.arc(pCenter.x, pCenter.y, 4, 0, Math.PI * 2);
      ctx.fill();

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

      // 5. Title Header
      const titleCenterX = 760;
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic 900 46px Impact, Arial Black, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("STARTING LINE UP", titleCenterX, 72);

      ctx.fillStyle = "#ebd55b";
      ctx.font = "bold 24px Impact, Arial Black, sans-serif";
      ctx.fillText(teamName.toUpperCase(), titleCenterX, 110);

      // Draw club logo at top right
      const tLogoImg = loadedImages["teamLogo"];
      if (tLogoImg) {
        const logoX = 1110;
        const logoY = 72;
        const logoRadius = 40;

        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.strokeStyle = "rgba(234, 179, 8, 0.85)";
        ctx.lineWidth = 3;
        ctx.shadowColor = "rgba(234, 179, 8, 0.5)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX, logoY, logoRadius - 1.5, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(tLogoImg, logoX - logoRadius, logoY - logoRadius, logoRadius * 2, logoRadius * 2);
        ctx.restore();
      }

      // 6. Draw FUT player cards
      starters.forEach((player) => {
        const pt = toScreen(player.x, player.y);
        const isGK = player.role === "GK";
        const playerColor = isGK ? gkColor : themeColor;
        const cx = pt.x;
        const cy = pt.y - 12;

        const cardW = 76;
        const cardH = 110;

        // Container card with gold outline
        ctx.save();
        ctx.shadowColor = playerColor;
        ctx.shadowBlur = 8;

        const cardGrad = ctx.createLinearGradient(cx - cardW / 2, cy - cardH / 2, cx + cardW / 2, cy + cardH / 2);
        cardGrad.addColorStop(0, "#0d162d");
        cardGrad.addColorStop(0.5, "#050813");
        cardGrad.addColorStop(1, adjustColorBrightness(playerColor, -55));
        ctx.fillStyle = cardGrad;

        ctx.strokeStyle = "rgba(234, 179, 8, 0.72)";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Card texture line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - cardW / 2 + 10, cy - cardH / 2);
        ctx.lineTo(cx - cardW / 2 + 25, cy + cardH / 2);
        ctx.stroke();

        // Portrait or Jersey
        const hasPhoto = !!(player.photo && loadedImages[player.id]);
        const photoRadius = 24;
        const photoY = cy - 20;

        if (hasPhoto) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, photoY, photoRadius, 0, Math.PI * 2);
          ctx.clip();

          const pImg = loadedImages[player.id];
          const size = Math.min(pImg.width, pImg.height);
          const sx = (pImg.width - size) / 2;
          const sy = (pImg.height - size) / 2;
          ctx.drawImage(pImg, sx, sy, size, size, cx - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
          ctx.restore();

          ctx.strokeStyle = "rgba(234, 179, 8, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, photoY, photoRadius, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const jY = photoY + 2;
          const k = 0.85;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(cx - 10 * k, jY - 20 * k);
          ctx.quadraticCurveTo(cx, jY - 13 * k, cx + 10 * k, jY - 20 * k);
          ctx.lineTo(cx + 21 * k, jY - 20 * k);
          ctx.lineTo(cx + 31 * k, jY - 6 * k);
          ctx.lineTo(cx + 22 * k, jY + 0 * k);
          ctx.lineTo(cx + 17 * k, jY - 8 * k);
          ctx.lineTo(cx + 17 * k, jY + 18 * k);
          ctx.lineTo(cx - 17 * k, jY + 18 * k);
          ctx.lineTo(cx - 17 * k, jY - 8 * k);
          ctx.lineTo(cx - 22 * k, jY + 0 * k);
          ctx.lineTo(cx - 31 * k, jY - 6 * k);
          ctx.lineTo(cx - 21 * k, jY - 20 * k);
          ctx.closePath();

          const shirtGrad = ctx.createLinearGradient(cx, jY - 20 * k, cx, jY + 18 * k);
          shirtGrad.addColorStop(0, playerColor);
          shirtGrad.addColorStop(1, adjustColorBrightness(playerColor, -40));
          ctx.fillStyle = shirtGrad;
          ctx.fill();

          ctx.strokeStyle = numberColor;
          ctx.lineWidth = 1.5 * k;
          ctx.beginPath();
          ctx.moveTo(cx - 31 * k, jY - 6 * k);
          ctx.lineTo(cx - 22 * k, jY + 0 * k);
          ctx.moveTo(cx + 31 * k, jY - 6 * k);
          ctx.lineTo(cx + 22 * k, jY + 0 * k);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = numberColor;
          ctx.font = `bold ${10 * k}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(player.number.toString(), cx, jY);
        }

        // Mini Badge + 5 stars
        const badgeX = cx - cardW / 2 + 13;
        const badgeY = cy - cardH / 2 + 13;
        const badgeRadius = 7.5;

        ctx.save();
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.strokeStyle = "rgba(234, 179, 8, 0.85)";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        const tLogoImg = loadedImages["teamLogo"];
        if (tLogoImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, badgeRadius - 0.5, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(tLogoImg, badgeX - badgeRadius, badgeY - badgeRadius, badgeRadius * 2, badgeRadius * 2);
          ctx.restore();
        } else {
          ctx.fillStyle = "#ebd55b";
          ctx.font = "bold 8px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("★", badgeX, badgeY + 0.5);
        }

        ctx.fillStyle = "#ebd55b";
        ctx.font = "5px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★★★★★", badgeX, badgeY - 10.5);
        ctx.restore();

        // Big squad number
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.font = "bold 13px 'Courier New', 'JetBrains Mono', monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(player.number.toString().padStart(2, "0"), cx + cardW / 2 - 8, cy - cardH / 2 + 8);

        // White position tag
        const bannerY = cy + 18;
        const bannerW = cardW - 12;
        const bannerH = 14;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - bannerW / 2, bannerY, bannerW, bannerH);

        ctx.fillStyle = "#0c1221";
        ctx.font = "900 8.5px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(player.role.toUpperCase(), cx, bannerY + bannerH / 2 + 0.5);

        // Player Name Banner
        const nameY = bannerY + bannerH;
        const nameW = bannerW;
        const nameH = 15;

        ctx.fillStyle = "#1e3a8a";
        ctx.fillRect(cx - nameW / 2, nameY, nameW, nameH);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 7.5px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let displayCardName = player.name.toUpperCase();
        if (displayCardName.length > 9) {
          displayCardName = displayCardName.substring(0, 8) + ".";
        }
        ctx.fillText(displayCardName, cx, nameY + nameH / 2 + 0.5);
      });

      // 7. Coach Banner
      const coachCenterX = 760;
      const coachY = 842;
      const coachH = 30;

      ctx.save();
      ctx.fillStyle = "#ebd55b";
      ctx.beginPath();
      ctx.roundRect(coachCenterX - 140, coachY, 80, coachH, [4, 0, 0, 4]);
      ctx.fill();

      ctx.fillStyle = "#0c1221";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const mLabel = lang === "id" ? "PELATIH" : "MANAGER";
      ctx.fillText(mLabel, coachCenterX - 100, coachY + coachH / 2 + 0.5);

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(coachCenterX - 60, coachY, 200, coachH, [0, 4, 4, 0]);
      ctx.fill();

      ctx.fillStyle = "#0c1221";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let displayCoachName = (managerName || (lang === "id" ? "Budi Santoso" : "Alex Ferguson")).toUpperCase();
      if (displayCoachName.length > 22) {
        displayCoachName = displayCoachName.substring(0, 20) + "..";
      }
      ctx.fillText(displayCoachName, coachCenterX + 40, coachY + coachH / 2 + 0.5);
      ctx.restore();

      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "right";
      ctx.fillText("TACTIGEN TIGER POSTERS", 1160, 880);

      const dataUrl = canvas.toDataURL("image/png");
      setInstantImageUrl(dataUrl);
    } catch (e) {
      console.error("Gagal menjamin render lokal canvas: ", e);
    }
  };

  // Run initial vector drawing and redraw when properties change
  useEffect(() => {
    let active = true;
    const playersWithPhotos = adjustedPlayers.filter((p) => p.isStarting && p.photo);

    // List of items to load
    const toLoad: { id: string; url: string }[] = [];

    playersWithPhotos.forEach((player) => {
      if (player.photo) {
        toLoad.push({ id: player.id, url: player.photo });
      }
    });

    if (teamLogo) {
      toLoad.push({ id: "teamLogo", url: teamLogo });
    }

    if (teamJersey) {
      toLoad.push({ id: "teamJersey", url: teamJersey });
    }

    if (managerPhoto) {
      toLoad.push({ id: "managerPhoto", url: managerPhoto });
    }

    if (toLoad.length === 0) {
      if (posterTheme === "stadium") {
        handleRenderInstantPoster({});
      } else {
        handleRenderClubClassicPoster({});
      }
      return;
    }

    const loadedImages: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;

    toLoad.forEach((item) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = item.url;
      img.onload = () => {
        if (!active) return;
        loadedImages[item.id] = img;
        loadedCount++;
        if (loadedCount === toLoad.length) {
          if (posterTheme === "stadium") {
            handleRenderInstantPoster(loadedImages);
          } else {
            handleRenderClubClassicPoster(loadedImages);
          }
        }
      };
      img.onerror = () => {
        if (!active) return;
        loadedCount++;
        if (loadedCount === toLoad.length) {
          if (posterTheme === "stadium") {
            handleRenderInstantPoster(loadedImages);
          } else {
            handleRenderClubClassicPoster(loadedImages);
          }
        }
      };
    });

    // Render immediately (it will update as files finish loading)
    if (posterTheme === "stadium") {
      handleRenderInstantPoster(loadedImages);
    } else {
      handleRenderClubClassicPoster(loadedImages);
    }

    return () => {
      active = false;
    };
  }, [adjustedPlayers, formation, teamName, primaryColor, gkColor, numberColor, teamLogo, teamJersey, lang, managerName, managerPhoto, posterTheme]);

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
    <Interactive3DCard glowColor="rgba(16, 185, 129, 0.45)">
      <div className="p-4 space-y-4">
      {/* Clean minimal Header, no description or explanations */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
            <Image className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            {lang === "id" ? "Poster Formasi 3D" : "3D Formation Poster"}
          </h3>
        </div>

        {/* Theme Selection Buttons */}
        <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
          <button
            onClick={() => setPosterTheme("stadium")}
            className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              posterTheme === "stadium"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            STADIUM
          </button>
          <button
            onClick={() => setPosterTheme("club_classic")}
            className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              posterTheme === "club_classic"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {lang === "id" ? "POSTER KLASIK" : "CLUB CLASSIC"}
          </button>
        </div>
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
    </Interactive3DCard>
  );
}
