import { Player } from "../types";

export type PosterTheme =
  | "stadium_neon"
  | "gold_heritage"
  | "broadcast_pro"
  | "editorial_studio"
  | "retro_vintage";

export type PosterFormat = "landscape" | "square" | "portrait";

export interface PosterOptions {
  theme: PosterTheme;
  format: PosterFormat;
  formation: string;
  teamName: string;
  matchTitle?: string;
  opponentName?: string;
  venueName?: string;
  primaryColor: string;
  gkColor: string;
  numberColor: string;
  players: Player[];
  teamLogo?: string | null;
  teamJersey?: string | null;
  managerName?: string;
  managerPhoto?: string | null;
  lang?: "id" | "en";
  showTacticalLinks?: boolean;
  showSubstitutes?: boolean;
  showManager?: boolean;
  showTacticalZones?: boolean;
  isEnemyModeActive?: boolean;
}

// Utility: Adjust HEX brightness
export function adjustColorBrightness(hex: string, percent: number): string {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  let R = parseInt(cleanHex.substring(0, 2), 16) || 0;
  let G = parseInt(cleanHex.substring(2, 4), 16) || 0;
  let B = parseInt(cleanHex.substring(4, 6), 16) || 0;

  R = Math.max(0, Math.min(255, Math.round((R * (100 + percent)) / 100)));
  G = Math.max(0, Math.min(255, Math.round((G * (100 + percent)) / 100)));
  B = Math.max(0, Math.min(255, Math.round((B * (100 + percent)) / 100)));

  const rHex = R.toString(16).padStart(2, "0");
  const gHex = G.toString(16).padStart(2, "0");
  const bHex = B.toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
}

export function hexToRgb(hex: string) {
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  let fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 16, g: 185, b: 129 };
}

export function getDominantColor(img: HTMLImageElement): string | null {
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
      const toHex = (c: number) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0");
      return `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`;
    }
  } catch (e) {
    console.warn("Could not extract dominant color", e);
  }
  return null;
}

// Main Poster Generator Function
export function renderFormationPoster(
  canvas: HTMLCanvasElement,
  options: PosterOptions,
  loadedImages: Record<string, HTMLImageElement> = {}
): string | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const {
    theme = "stadium_neon",
    format = "landscape",
    formation = "4-3-3",
    teamName = "MY TEAM",
    matchTitle = "MATCHDAY SQUAD",
    opponentName,
    venueName,
    primaryColor = "#10b981",
    gkColor = "#f59e0b",
    numberColor = "#ffffff",
    players = [],
    managerName = "Coach",
    lang = "id",
    showTacticalLinks = true,
    showSubstitutes = true,
    showManager = true,
    showTacticalZones = false,
    isEnemyModeActive = false
  } = options;

  // Determine Canvas Dimensions based on aspect ratio format
  let width = 1200;
  let height = 900;
  if (format === "square") {
    width = 1080;
    height = 1080;
  } else if (format === "portrait") {
    width = 1080;
    height = 1920;
  }

  canvas.width = width;
  canvas.height = height;

  // Theme color derivation
  let themeColor = primaryColor;
  const jerseyImg = loadedImages["teamJersey"];
  if (jerseyImg) {
    const extracted = getDominantColor(jerseyImg);
    if (extracted) themeColor = extracted;
  }
  const themeRgb = hexToRgb(themeColor);

  // Filter and adjust players coordinates
  const adjustedPlayers = players.map((player) => {
    if (isEnemyModeActive && player.isStarting) {
      const uncompressedY = Math.max(0, Math.min(100, ((player.y - 52) / 38) * 100));
      return { ...player, y: parseFloat(uncompressedY.toFixed(1)) };
    }
    return player;
  });

  const starters = adjustedPlayers.filter((p) => p.isStarting);
  const substitutes = adjustedPlayers.filter((p) => !p.isStarting);

  // Tactical Role Sorting Hierarchy
  const roleOrder: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
  const sortedStarters = [...starters].sort((a, b) => {
    const valA = roleOrder[a.role] ?? 99;
    const valB = roleOrder[b.role] ?? 99;
    if (valA !== valB) return valA - valB;
    return a.number - b.number;
  });

  // Calculate Field Projection Bounds depending on Format
  let fieldRect = { x: 340, y: 170, w: 820, h: 680 };
  let is3DPerspective = true;

  if (format === "square") {
    fieldRect = { x: 40, y: 190, w: 1000, h: 720 };
    is3DPerspective = true;
  } else if (format === "portrait") {
    // In story mode, vertical stadium flow
    fieldRect = { x: 50, y: 280, w: 980, h: 1240 };
    is3DPerspective = true;
  }

  // Perspective mapping coordinate transformer
  const toScreen = (fx: number, fy: number) => {
    const pctX = fx / 100;
    const pctY = fy / 100;

    if (is3DPerspective) {
      if (format === "landscape") {
        const topW = fieldRect.w * 0.72;
        const botW = fieldRect.w * 0.98;
        const topL = fieldRect.x + (fieldRect.w - topW) / 2;
        const botL = fieldRect.x + (fieldRect.w - botW) / 2;
        const wAtY = topW + (botW - topW) * pctY;
        const lAtY = topL + (botL - topL) * pctY;
        return {
          x: lAtY + wAtY * pctX,
          y: fieldRect.y + fieldRect.h * pctY
        };
      } else if (format === "square") {
        const topW = fieldRect.w * 0.75;
        const botW = fieldRect.w * 0.96;
        const topL = fieldRect.x + (fieldRect.w - topW) / 2;
        const botL = fieldRect.x + (fieldRect.w - botW) / 2;
        const wAtY = topW + (botW - topW) * pctY;
        const lAtY = topL + (botL - topL) * pctY;
        return {
          x: lAtY + wAtY * pctX,
          y: fieldRect.y + fieldRect.h * pctY
        };
      } else {
        // Portrait 9:16
        const topW = fieldRect.w * 0.76;
        const botW = fieldRect.w * 0.98;
        const topL = fieldRect.x + (fieldRect.w - topW) / 2;
        const botL = fieldRect.x + (fieldRect.w - botW) / 2;
        const wAtY = topW + (botW - topW) * pctY;
        const lAtY = topL + (botL - topL) * pctY;
        return {
          x: lAtY + wAtY * pctX,
          y: fieldRect.y + fieldRect.h * pctY
        };
      }
    } else {
      return {
        x: fieldRect.x + fieldRect.w * pctX,
        y: fieldRect.y + fieldRect.h * pctY
      };
    }
  };

  // =========================================================================
  // 1. DRAW BACKGROUND & ATMOSPHERE ACCORDING TO THEME
  // =========================================================================
  if (theme === "stadium_neon") {
    // Deep carbon midnight with electric stadium spotlights
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#030611");
    bgGrad.addColorStop(0.5, "#081024");
    bgGrad.addColorStop(1, "#020409");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Dynamic stadium beam spotlights
    const beamGrad1 = ctx.createRadialGradient(width * 0.25, 0, 50, width * 0.35, 600, 700);
    beamGrad1.addColorStop(0, `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.22)`);
    beamGrad1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = beamGrad1;
    ctx.fillRect(0, 0, width, height);

    const beamGrad2 = ctx.createRadialGradient(width * 0.8, 0, 50, width * 0.7, 600, 700);
    beamGrad2.addColorStop(0, "rgba(56, 189, 248, 0.2)");
    beamGrad2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = beamGrad2;
    ctx.fillRect(0, 0, width, height);

    // Stadium light bulb fixtures on top
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 15;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(60 + i * 35, 30, 3.5, 0, Math.PI * 2);
      ctx.arc(width - 60 - i * 35, 30, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  } else if (theme === "gold_heritage") {
    // Luxury Onyx Black with warm golden particle glows
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#050608");
    bgGrad.addColorStop(0.4, "#0d0f15");
    bgGrad.addColorStop(1, "#040507");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Champagne gold ambient lighting
    const goldGlow = ctx.createRadialGradient(width / 2, height * 0.45, 100, width / 2, height * 0.45, width * 0.6);
    goldGlow.addColorStop(0, "rgba(234, 179, 8, 0.12)");
    goldGlow.addColorStop(0.7, "rgba(180, 130, 20, 0.03)");
    goldGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = goldGlow;
    ctx.fillRect(0, 0, width, height);

    // Elegant subtle geometric diamond mesh lines
    ctx.save();
    ctx.strokeStyle = "rgba(234, 179, 8, 0.035)";
    ctx.lineWidth = 1;
    const meshStep = 60;
    for (let x = -height; x < width + height; x += meshStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + height, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.restore();
  } else if (theme === "broadcast_pro") {
    // Matchday TV Broadcast - high-impact dynamic split angles
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#080c17");
    bgGrad.addColorStop(0.6, "#0e182f");
    bgGrad.addColorStop(1, "#05070d");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // High energy diagonal angular broadcast slashes
    ctx.save();
    const slashColor = `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`;
    ctx.fillStyle = slashColor;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const startX = width * 0.2 + i * 220;
      ctx.moveTo(startX, -50);
      ctx.lineTo(startX + 140, -50);
      ctx.lineTo(startX - 220, height + 50);
      ctx.lineTo(startX - 360, height + 50);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (theme === "editorial_studio") {
    // Swiss Graphic Design / Contemporary Copa90 Editorial
    // Clean deep midnight charcoal with pristine mathematical layout
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#0b0e14");
    bgGrad.addColorStop(1, "#07090d");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Modern minimalist architectural grid dots
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    const dotSpacing = 32;
    for (let x = 20; x < width; x += dotSpacing) {
      for (let y = 20; y < height; y += dotSpacing) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
  } else {
    // retro_vintage: 90s Italian Calcio nostalgia
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#041b12");
    bgGrad.addColorStop(0.5, "#092e1e");
    bgGrad.addColorStop(1, "#02120a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Retro warm vignette
    const retroVignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
    retroVignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    retroVignette.addColorStop(1, "rgba(0, 0, 0, 0.55)");
    ctx.fillStyle = retroVignette;
    ctx.fillRect(0, 0, width, height);
  }

  // =========================================================================
  // 2. DRAW SIDEBAR / STARTING XI PANEL (If in Landscape format)
  // =========================================================================
  if (format === "landscape") {
    const sideW = 320;
    ctx.fillStyle = theme === "gold_heritage" ? "#07090e" : "#060a14";
    ctx.fillRect(0, 0, sideW, height);

    // Subtle sidebar texture
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, sideW, height);
    ctx.clip();
    ctx.strokeStyle = theme === "gold_heritage" ? "rgba(234, 179, 8, 0.04)" : "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 2.5;
    for (let offset = -height; offset < sideW + height; offset += 30) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + height, height);
      ctx.stroke();
    }
    ctx.restore();

    // Divider line between sidebar and pitch
    ctx.strokeStyle =
      theme === "gold_heritage"
        ? "rgba(234, 179, 8, 0.4)"
        : theme === "stadium_neon"
        ? `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.4)`
        : "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sideW, 0);
    ctx.lineTo(sideW, height);
    ctx.stroke();

    // Sidebar Header: "STARTING XI"
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 900 32px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("STARTING XI", 26, 38);

    // Format & Formation Subtitle
    ctx.fillStyle = theme === "gold_heritage" ? "#ebd55b" : themeColor;
    ctx.font = "bold 12px monospace";
    ctx.fillText(`FORMATION: ${formation}`, 28, 76);

    // Draw Starting XI Player Badges
    const itemH = 30;
    const itemGap = 39;
    const listStartY = 104;
    const skewAngle = theme === "editorial_studio" ? 0 : 7;

    sortedStarters.forEach((player, idx) => {
      if (idx >= 11) return;
      const rowY = listStartY + idx * itemGap;

      // Squad number badge
      const numBadgeW = 42;
      ctx.save();
      if (theme === "gold_heritage") {
        const bg = ctx.createLinearGradient(26, rowY, 26 + numBadgeW, rowY + itemH);
        bg.addColorStop(0, "#855d14");
        bg.addColorStop(1, "#ebd55b");
        ctx.fillStyle = bg;
      } else {
        const bg = ctx.createLinearGradient(26, rowY, 26 + numBadgeW, rowY + itemH);
        bg.addColorStop(0, adjustColorBrightness(themeColor, -25));
        bg.addColorStop(1, adjustColorBrightness(themeColor, 15));
        ctx.fillStyle = bg;
      }

      ctx.beginPath();
      ctx.moveTo(26 + skewAngle, rowY);
      ctx.lineTo(26 + numBadgeW + skewAngle, rowY);
      ctx.lineTo(26 + numBadgeW, rowY + itemH);
      ctx.lineTo(26, rowY + itemH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        player.number.toString().padStart(2, "0"),
        26 + numBadgeW / 2 + skewAngle / 2,
        rowY + itemH / 2 + 0.5
      );

      // Name Card Badge
      const nameCardX = 26 + numBadgeW + 4;
      const nameCardW = 216;
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

      // Write Name
      ctx.fillStyle = "#0c1221";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      let dName = player.name.toUpperCase();
      if (dName.length > 17) dName = dName.substring(0, 15) + "..";
      ctx.fillText(dName, nameCardX + 12 + skewAngle / 2, rowY + itemH / 2 + 0.5);

      // Role tag badge
      const roleColor =
        player.role === "GK"
          ? "#eab308"
          : player.role === "DEF"
          ? "#3b82f6"
          : player.role === "MID"
          ? "#10b981"
          : "#ef4444";
      ctx.fillStyle = roleColor;
      ctx.font = "900 8.5px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(player.role, nameCardX + nameCardW - 10 + skewAngle / 2, rowY + itemH / 2 + 0.5);
    });

    // Draw Substitutes in sidebar if space permits
    if (showSubstitutes && substitutes.length > 0) {
      const subsStartY = 580;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(lang === "id" ? "PEMAIN CADANGAN" : "SUBSTITUTES", 26, subsStartY);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 10.5px sans-serif";
      for (let i = 0; i < substitutes.length; i += 2) {
        if (i >= 12) break;
        const sub1 = substitutes[i];
        const sub2 = substitutes[i + 1];
        let line = `${sub1.number}. ${sub1.name.toUpperCase()}`;
        if (sub2) line += `  |  ${sub2.number}. ${sub2.name.toUpperCase()}`;
        ctx.fillText(line, 26, subsStartY + 28 + (i / 2) * 20);
      }
    }
  }

  // =========================================================================
  // 3. DRAW TACTICAL PITCH ON CANVAS
  // =========================================================================
  // Pitch stripes
  const stripesCount = 11;
  const stripeH = 100 / stripesCount;

  // Turf grass coloring according to theme
  for (let i = 0; i < stripesCount; i++) {
    const sy1 = i * stripeH;
    const sy2 = (i + 1) * stripeH;
    const ptL1 = toScreen(0, sy1);
    const ptR1 = toScreen(100, sy1);
    const ptR2 = toScreen(100, sy2);
    const ptL2 = toScreen(0, sy2);

    let grassColor = "#0e241b";
    let isAlt = i % 2 !== 0;

    if (theme === "stadium_neon") {
      grassColor = isAlt ? "#0a1e16" : "#0d261c";
    } else if (theme === "gold_heritage") {
      grassColor = isAlt ? "#090d14" : "#0f1522";
    } else if (theme === "broadcast_pro") {
      grassColor = isAlt ? "#0b2219" : "#0e2c20";
    } else if (theme === "editorial_studio") {
      grassColor = isAlt ? "#0d131d" : "#101826";
    } else {
      // retro_vintage
      grassColor = isAlt ? "#0b341f" : "#0f3f27";
    }

    ctx.fillStyle = grassColor;
    ctx.beginPath();
    ctx.moveTo(ptL1.x, ptL1.y);
    ctx.lineTo(ptR1.x, ptR1.y);
    ctx.lineTo(ptR2.x, ptR2.y);
    ctx.lineTo(ptL2.x, ptL2.y);
    ctx.closePath();
    ctx.fill();
  }

  // Draw optional Shaded Tactical Corridors / Half-Spaces
  if (showTacticalZones) {
    ctx.save();
    ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
    // Left Half-space (x: 18 to 36)
    const hsL1 = toScreen(18, 0);
    const hsR1 = toScreen(36, 0);
    const hsR2 = toScreen(36, 100);
    const hsL2 = toScreen(18, 100);
    ctx.beginPath();
    ctx.moveTo(hsL1.x, hsL1.y);
    ctx.lineTo(hsR1.x, hsR1.y);
    ctx.lineTo(hsR2.x, hsR2.y);
    ctx.lineTo(hsL2.x, hsL2.y);
    ctx.closePath();
    ctx.fill();

    // Right Half-space (x: 64 to 82)
    const rhsL1 = toScreen(64, 0);
    const rhsR1 = toScreen(82, 0);
    const rhsR2 = toScreen(82, 100);
    const rhsL2 = toScreen(64, 100);
    ctx.beginPath();
    ctx.moveTo(rhsL1.x, rhsL1.y);
    ctx.lineTo(rhsR1.x, rhsR1.y);
    ctx.lineTo(rhsR2.x, rhsR2.y);
    ctx.lineTo(rhsL2.x, rhsL2.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw Pitch Outline Lines
  const pitchLineColor =
    theme === "gold_heritage"
      ? "rgba(234, 179, 8, 0.55)"
      : theme === "stadium_neon"
      ? `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.7)`
      : theme === "editorial_studio"
      ? "rgba(255, 255, 255, 0.45)"
      : "rgba(255, 255, 255, 0.65)";

  ctx.strokeStyle = pitchLineColor;
  ctx.lineWidth = 2.5;

  // Boundary
  const pTL = toScreen(0, 0);
  const pTR = toScreen(100, 0);
  const pBR = toScreen(100, 100);
  const pBL = toScreen(0, 100);
  ctx.beginPath();
  ctx.moveTo(pTL.x, pTL.y);
  ctx.lineTo(pTR.x, pTR.y);
  ctx.lineTo(pBR.x, pBR.y);
  ctx.lineTo(pBL.x, pBL.y);
  ctx.closePath();
  ctx.stroke();

  // Halfway line
  const pHalfLeft = toScreen(0, 50);
  const pHalfRight = toScreen(100, 50);
  ctx.beginPath();
  ctx.moveTo(pHalfLeft.x, pHalfLeft.y);
  ctx.lineTo(pHalfRight.x, pHalfRight.y);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  for (let deg = 0; deg <= 360; deg += 6) {
    const rad = (deg * Math.PI) / 180;
    const sx = 50 + 11 * Math.cos(rad);
    const sy = 50 + 11 * Math.sin(rad) * 1.05;
    const pt = toScreen(sx, sy);
    if (deg === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // Center spot
  const pCenter = toScreen(50, 50);
  ctx.fillStyle = pitchLineColor;
  ctx.beginPath();
  ctx.arc(pCenter.x, pCenter.y, 4, 0, Math.PI * 2);
  ctx.fill();

  // Top Penalty Box
  const pBoxTL = toScreen(24, 0);
  const pBoxTR = toScreen(24, 18);
  const pBoxBR = toScreen(76, 18);
  const pBoxBL = toScreen(76, 0);
  ctx.beginPath();
  ctx.moveTo(pBoxTL.x, pBoxTL.y);
  ctx.lineTo(pBoxTR.x, pBoxTR.y);
  ctx.lineTo(pBoxBR.x, pBoxBR.y);
  ctx.lineTo(pBoxBL.x, pBoxBL.y);
  ctx.stroke();

  // Bottom Penalty Box
  const pBBoxTL = toScreen(24, 100);
  const pBBoxTR = toScreen(24, 82);
  const pBBoxBR = toScreen(76, 82);
  const pBBoxBL = toScreen(76, 100);
  ctx.beginPath();
  ctx.moveTo(pBBoxTL.x, pBBoxTL.y);
  ctx.lineTo(pBBoxTR.x, pBBoxTR.y);
  ctx.lineTo(pBBoxBR.x, pBBoxBR.y);
  ctx.lineTo(pBBoxBL.x, pBBoxBL.y);
  ctx.stroke();

  // Goal nets at bottom
  const gL1 = toScreen(38, 100);
  const gR1 = toScreen(62, 100);
  const nTL = { x: gL1.x, y: gL1.y + 25 };
  const nTR = { x: gR1.x, y: gR1.y + 25 };
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gL1.x, gL1.y);
  ctx.lineTo(nTL.x, nTL.y);
  ctx.lineTo(nTR.x, nTR.y);
  ctx.lineTo(gR1.x, gR1.y);
  ctx.stroke();

  // =========================================================================
  // 4. DRAW TACTICAL UNIT LINK LINES (If Enabled)
  // =========================================================================
  if (showTacticalLinks) {
    ctx.save();
    // Group starting players by role
    const defs = starters.filter((p) => p.role === "DEF").sort((a, b) => a.x - b.x);
    const mids = starters.filter((p) => p.role === "MID").sort((a, b) => a.x - b.x);
    const fwds = starters.filter((p) => p.role === "FWD").sort((a, b) => a.x - b.x);

    const drawUnitLinks = (unit: Player[], strokeColor: string) => {
      if (unit.length < 2) return;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i < unit.length - 1; i++) {
        const ptA = toScreen(unit[i].x, unit[i].y);
        const ptB = toScreen(unit[i + 1].x, unit[i + 1].y);
        ctx.moveTo(ptA.x, ptA.y);
        ctx.lineTo(ptB.x, ptB.y);
      }
      ctx.stroke();
    };

    drawUnitLinks(defs, "rgba(59, 130, 246, 0.4)");
    drawUnitLinks(mids, "rgba(16, 185, 129, 0.4)");
    drawUnitLinks(fwds, "rgba(239, 68, 68, 0.4)");
    ctx.restore();
  }

  // =========================================================================
  // 5. DRAW TITLE BANNER, TEAM LOGO & MATCHDAY LABELS
  // =========================================================================
  const headerCenterX = format === "landscape" ? fieldRect.x + fieldRect.w / 2 : width / 2;
  const headerY = format === "portrait" ? 70 : 42;

  // Matchday Pill Badge
  ctx.save();
  const matchPillText = matchTitle ? matchTitle.toUpperCase() : "MATCHDAY SQUAD";
  ctx.font = "900 11px sans-serif";
  const pillW = ctx.measureText(matchPillText).width + 30;
  const pillH = 22;
  const pillX = headerCenterX - pillW / 2;

  ctx.fillStyle = theme === "gold_heritage" ? "#ebd55b" : themeColor;
  ctx.beginPath();
  ctx.roundRect(pillX, headerY, pillW, pillH, 11);
  ctx.fill();

  ctx.fillStyle = "#0c1221";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(matchPillText, headerCenterX, headerY + pillH / 2 + 0.5);
  ctx.restore();

  // Team Name Main Header
  const titleY = headerY + 44;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (theme === "editorial_studio") {
    ctx.font = "900 38px sans-serif";
    ctx.letterSpacing = "2px";
  } else if (theme === "gold_heritage") {
    ctx.font = "italic 900 42px Georgia, serif";
  } else {
    ctx.font = "italic 900 42px Impact, sans-serif";
  }
  ctx.fillText(teamName.toUpperCase(), headerCenterX, titleY);
  ctx.restore();

  // Sub-header: Opponent or Formation Tag
  const subY = titleY + 30;
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const subLabel = opponentName
    ? `${opponentName.toUpperCase()}  •  FORMATION ${formation}`
    : `FORMATION ${formation}${venueName ? `  •  ${venueName.toUpperCase()}` : ""}`;
  ctx.fillText(subLabel, headerCenterX, subY);

  // Draw Team Logo Crest (Left or Center-top)
  const tLogoImg = loadedImages["teamLogo"];
  const logoRadius = format === "portrait" ? 38 : 34;
  const logoX = headerCenterX - 220;
  const logoY = titleY - 8;

  if (format === "landscape" || format === "square") {
    ctx.save();
    // Shiny Chrome Outer Ring
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0f1d";
    ctx.strokeStyle = theme === "gold_heritage" ? "#ebd55b" : themeColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = theme === "gold_heritage" ? "#ebd55b" : themeColor;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (tLogoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(tLogoImg, logoX - logoRadius + 2, logoY - logoRadius + 2, (logoRadius - 2) * 2, (logoRadius - 2) * 2);
      ctx.restore();
    } else {
      // Star geometry
      ctx.fillStyle = theme === "gold_heritage" ? "#ebd55b" : "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚽", logoX, logoY);
    }
  }

  // =========================================================================
  // 6. DRAW STARTING PLAYERS ON PITCH
  // =========================================================================
  starters.forEach((player) => {
    const pt = toScreen(player.x, player.y);
    const isGK = player.role === "GK";
    const pColor = isGK ? gkColor : themeColor;
    const cx = pt.x;
    const cy = pt.y - 12;

    const hasPhoto = !!(player.photo && loadedImages[player.id]);

    if (theme === "gold_heritage") {
      // Draw FUT Style Gold Shield Card
      const cardW = format === "portrait" ? 82 : 72;
      const cardH = format === "portrait" ? 116 : 104;

      ctx.save();
      ctx.shadowColor = "rgba(234, 179, 8, 0.4)";
      ctx.shadowBlur = 10;

      const cardGrad = ctx.createLinearGradient(cx - cardW / 2, cy - cardH / 2, cx + cardW / 2, cy + cardH / 2);
      cardGrad.addColorStop(0, "#1c170a");
      cardGrad.addColorStop(0.5, "#0b0c11");
      cardGrad.addColorStop(1, "#261d06");
      ctx.fillStyle = cardGrad;
      ctx.strokeStyle = "#ebd55b";
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.roundRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 7);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Number on top left
      ctx.fillStyle = "#ebd55b";
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(player.number.toString(), cx - cardW / 2 + 7, cy - cardH / 2 + 7);

      // Role below number
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 8px sans-serif";
      ctx.fillText(player.role, cx - cardW / 2 + 7, cy - cardH / 2 + 22);

      // Photo or Jersey
      const pY = cy - 8;
      const pR = 21;
      if (hasPhoto) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx + 6, pY, pR, 0, Math.PI * 2);
        ctx.clip();
        const pImg = loadedImages[player.id];
        const s = Math.min(pImg.width, pImg.height);
        ctx.drawImage(pImg, (pImg.width - s) / 2, (pImg.height - s) / 2, s, s, cx + 6 - pR, pY - pR, pR * 2, pR * 2);
        ctx.restore();
        ctx.strokeStyle = "#ebd55b";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx + 6, pY, pR, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pColor;
        ctx.beginPath();
        ctx.arc(cx + 6, pY, pR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = numberColor;
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(player.number.toString(), cx + 6, pY);
      }

      // Name banner on bottom
      const nameW = cardW - 8;
      const nameH = 16;
      ctx.fillStyle = "#ebd55b";
      ctx.fillRect(cx - nameW / 2, cy + cardH / 2 - 22, nameW, nameH);
      ctx.fillStyle = "#0c1221";
      ctx.font = "bold 8.5px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let shortN = player.name.toUpperCase();
      if (shortN.length > 9) shortN = shortN.substring(0, 8) + ".";
      ctx.fillText(shortN, cx, cy + cardH / 2 - 14);
    } else {
      // Modern Circular / 3D Jersey Avatar + Sleek Name Plate
      const radius = format === "portrait" ? 27 : 24;

      // Player Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + radius + 4, radius * 1.1, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      if (hasPhoto) {
        // High-definition Circular Portrait Photo
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();
        const pImg = loadedImages[player.id];
        const s = Math.min(pImg.width, pImg.height);
        ctx.drawImage(pImg, (pImg.width - s) / 2, (pImg.height - s) / 2, s, s, cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.restore();

        // Glowing border ring
        ctx.strokeStyle = pColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // 3D Vector Jersey
        const k = format === "portrait" ? 1.25 : 1.1;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - 10 * k, cy - 18 * k);
        ctx.quadraticCurveTo(cx, cy - 12 * k, cx + 10 * k, cy - 18 * k);
        ctx.lineTo(cx + 20 * k, cy - 18 * k);
        ctx.lineTo(cx + 29 * k, cy - 5 * k);
        ctx.lineTo(cx + 21 * k, cy + 1 * k);
        ctx.lineTo(cx + 16 * k, cy - 6 * k);
        ctx.lineTo(cx + 16 * k, cy + 17 * k);
        ctx.lineTo(cx - 16 * k, cy + 17 * k);
        ctx.lineTo(cx - 16 * k, cy - 6 * k);
        ctx.lineTo(cx - 21 * k, cy + 1 * k);
        ctx.lineTo(cx - 29 * k, cy - 5 * k);
        ctx.lineTo(cx - 20 * k, cy - 18 * k);
        ctx.closePath();

        const jGrad = ctx.createLinearGradient(cx, cy - 18 * k, cx, cy + 17 * k);
        jGrad.addColorStop(0, pColor);
        jGrad.addColorStop(1, adjustColorBrightness(pColor, -40));
        ctx.fillStyle = jGrad;
        ctx.fill();

        ctx.strokeStyle = numberColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Jersey Number
        ctx.fillStyle = numberColor;
        ctx.font = `bold ${12 * k}px 'Courier New', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(player.number.toString(), cx, cy);
      }

      // Dual-badge skewed player name tag below avatar
      const tagW = format === "portrait" ? 92 : 84;
      const tagH = 17;
      const tagY = cy + radius + 3;
      const tagSkew = 4;

      // Squad Number Left Badge
      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.moveTo(cx - tagW / 2 + tagSkew, tagY);
      ctx.lineTo(cx - tagW / 2 + 24 + tagSkew, tagY);
      ctx.lineTo(cx - tagW / 2 + 24, tagY + tagH);
      ctx.lineTo(cx - tagW / 2, tagY + tagH);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9.5px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(player.number.toString().padStart(2, "0"), cx - tagW / 2 + 12 + tagSkew / 2, tagY + tagH / 2 + 0.5);

      // Name Card Right Badge
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(cx - tagW / 2 + 25 + tagSkew, tagY);
      ctx.lineTo(cx + tagW / 2 + tagSkew, tagY);
      ctx.lineTo(cx + tagW / 2, tagY + tagH);
      ctx.lineTo(cx - tagW / 2 + 25, tagY + tagH);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#0c1221";
      ctx.font = "bold 8.5px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let dPName = player.name.toUpperCase();
      if (dPName.length > 9) dPName = dPName.substring(0, 8) + ".";
      ctx.fillText(dPName, cx + 13 + tagSkew / 2, tagY + tagH / 2 + 0.5);
    }
  });

  // =========================================================================
  // 7. DRAW SUBSTITUTES IN SQUARE & PORTRAIT MODES (BOTTOM TRAY)
  // =========================================================================
  if (showSubstitutes && substitutes.length > 0 && format !== "landscape") {
    const subTrayY = format === "portrait" ? 1620 : 940;
    const trayW = width - 80;
    const trayH = format === "portrait" ? 170 : 100;
    const trayX = 40;

    ctx.save();
    ctx.fillStyle = "rgba(7, 12, 23, 0.85)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(trayX, subTrayY, trayW, trayH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme === "gold_heritage" ? "#ebd55b" : themeColor;
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(lang === "id" ? "PEMAIN CADANGAN (BENCH)" : "SUBSTITUTES (BENCH)", trayX + 20, subTrayY + 14);

    // Substitutes chips
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    const maxSubs = format === "portrait" ? 14 : 10;
    const displayedSubs = substitutes.slice(0, maxSubs);

    displayedSubs.forEach((sub, idx) => {
      const col = idx % (format === "portrait" ? 2 : 4);
      const row = Math.floor(idx / (format === "portrait" ? 2 : 4));
      const chipX = trayX + 20 + col * (trayW / (format === "portrait" ? 2 : 4));
      const chipY = subTrayY + 42 + row * 24;

      let subText = `${sub.number.toString().padStart(2, "0")}  ${sub.name.toUpperCase()} (${sub.role})`;
      if (subText.length > 24) subText = subText.substring(0, 22) + "..";
      ctx.fillText(subText, chipX, chipY);
    });
    ctx.restore();
  }

  // =========================================================================
  // 8. DRAW MANAGER / COACH BADGE (If Enabled)
  // =========================================================================
  if (showManager) {
    const mY = format === "portrait" ? 1830 : format === "square" ? 850 : 844;
    const mX = format === "landscape" ? fieldRect.x + fieldRect.w / 2 : width / 2;
    const mH = 28;
    const mSkew = 4;

    ctx.save();
    ctx.fillStyle = theme === "gold_heritage" ? "#ebd55b" : themeColor;
    ctx.beginPath();
    ctx.moveTo(mX - 120 + mSkew, mY);
    ctx.lineTo(mX - 35 + mSkew, mY);
    ctx.lineTo(mX - 35, mY + mH);
    ctx.lineTo(mX - 120, mY + mH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#0c1221";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(lang === "id" ? "PELATIH" : "MANAGER", mX - 78 + mSkew / 2, mY + mH / 2 + 0.5);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(mX - 32 + mSkew, mY);
    ctx.lineTo(mX + 120 + mSkew, mY);
    ctx.lineTo(mX + 120, mY + mH);
    ctx.lineTo(mX - 32, mY + mH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#0c1221";
    ctx.font = "bold 11.5px sans-serif";
    let cName = (managerName || "Coach").toUpperCase();
    if (cName.length > 18) cName = cName.substring(0, 16) + "..";
    ctx.fillText(cName, mX + 44 + mSkew / 2, mY + mH / 2 + 0.5);
    ctx.restore();
  }

  // Watermark Brand
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.font = "bold 9.5px monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("TACTIGEN PRO STUDIOS", width - 24, height - 16);

  return canvas.toDataURL("image/png");
}
