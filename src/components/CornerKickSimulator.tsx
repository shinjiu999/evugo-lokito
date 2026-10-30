import React, { useState } from "react";
import { Flag, Play, Shield, Users, Sparkles, CornerDownRight, CheckCircle2, RotateCcw, Eye } from "lucide-react";
import { Player, TacticalItem, AnimationFrame, TacticalOverlayMode, TacticalPhase } from "../types";
import { soundManager } from "../utils/sound";
import Interactive3DCard from "./Interactive3DCard";

export type CornerSide = "left" | "right";
export type CornerSchemeId =
  | "inswing-near"
  | "outswing-far"
  | "short-triangle"
  | "gk-screen-crowd"
  | "edge-volley"
  | "train-stack";
export type CornerDefenseType = "hybrid" | "zonal" | "man" | "none";

interface CornerKickSimulatorProps {
  players: Player[];
  onApplyCornerSimulation: (payload: {
    updatedPlayers: Player[];
    updatedItems: TacticalItem[];
    frames: AnimationFrame[];
    overlayMode: TacticalOverlayMode;
    phase: TacticalPhase;
    autoPlay: boolean;
    title: string;
  }) => void;
  lang: "id" | "en";
}

interface SchemeDefinition {
  id: CornerSchemeId;
  badge: string;
  title: { id: string; en: string };
  subtitle: { id: string; en: string };
  deliveryType: { id: string; en: string };
  targetZoneLabel: { id: string; en: string };
  successRate: string;
  /** Target coordinates in SVG preview (0-100) for left corner */
  previewTarget: { x: number; y: number };
  previewControl: { x: number; y: number };
}

const CORNER_SCHEMES: SchemeDefinition[] = [
  {
    id: "inswing-near",
    badge: "PRO META",
    title: { id: "In-Swinger Tiang Dekat & Flick", en: "Near-Post In-Swinger & Flick" },
    subtitle: {
      id: "Bola melengkung tajam ke tiang dekat untuk disundul lanjut (flick-on) ke tiang jauh.",
      en: "Whipped in-swinging delivery to the near post for a glancing flick-on to the back post."
    },
    deliveryType: { id: "Melengkung ke Dalam (In-Swing)", en: "In-Swinging Whip" },
    targetZoneLabel: { id: "Zona Tiang Dekat (Near Post)", en: "Near Post 6-Yard Zone" },
    successRate: "xG 0.14 · Tinggi",
    previewTarget: { x: 41, y: 8.5 },
    previewControl: { x: 24, y: 18 }
  },
  {
    id: "gk-screen-crowd",
    badge: "ARSENAL STYLE",
    title: { id: "Blokir Kiper & Overload 6-Yard", en: "GK Screen & 6-Yard Box Crowd" },
    subtitle: {
      id: "4 pemain mengunci ruang gerak kiper di kotak kecil, bola diarahkan tepat ke mulut gawang.",
      en: "4 attackers crowd the 6-yard box to pin the goalkeeper while attacking the central goalmouth."
    },
    deliveryType: { id: "Melengkung Tajam ke Gawang", en: "High-Arc Goalmouth In-Swing" },
    targetZoneLabel: { id: "Mulut Gawang (Central 6-Yard)", en: "Central Goalmouth" },
    successRate: "xG 0.16 · Sangat Efektif",
    previewTarget: { x: 49, y: 6.5 },
    previewControl: { x: 28, y: 16 }
  },
  {
    id: "outswing-far",
    badge: "AERIAL POWER",
    title: { id: "Out-Swinger Target Tiang Jauh", en: "Far-Post Out-Swinger Overload" },
    subtitle: {
      id: "Umpan melengkung menjauhi kiper menuju bek tengah jangkung yang berlari ke tiang jauh.",
      en: "Out-swinging trajectory away from the keeper toward tall center-backs charging the far post."
    },
    deliveryType: { id: "Melengkung Keluar (Out-Swing)", en: "Out-Swinging Driven Arc" },
    targetZoneLabel: { id: "Zona Tiang Jauh (Far Post)", en: "Far Post Target Zone" },
    successRate: "xG 0.12 · Stabil",
    previewTarget: { x: 59, y: 10.5 },
    previewControl: { x: 30, y: 2.5 }
  },
  {
    id: "short-triangle",
    badge: "PEP TACTIC",
    title: { id: "Corner Pendek 2v1 & Cutback", en: "Short Corner 2v1 & Cutback" },
    subtitle: {
      id: "Kombinasi pendek 2 lawan 1 di sudut untuk menarik bek keluar dan melepas umpan tarik.",
      en: "Quick 2v1 short combination to draw defenders out and deliver an angled cutback."
    },
    deliveryType: { id: "Umpan Pendek & Cutback Datar", en: "Short Pass & Low Cutback" },
    targetZoneLabel: { id: "Half-Space & Titik Penalti", en: "Half-Space & Penalty Spot" },
    successRate: "xG 0.15 · Penguasaan",
    previewTarget: { x: 46, y: 14 },
    previewControl: { x: 18, y: 12 }
  },
  {
    id: "edge-volley",
    badge: "SURPRISE",
    title: { id: "Umpan Tarik Voli Lini Kedua", en: "Edge of Box Late-Run Volley" },
    subtitle: {
      id: "Penyerang menarik semua bek ke gawang, membuka ruang tembak bebas di luar kotak penalti.",
      en: "Decoy runs drag defenders deep inside, freeing your playmaker on the edge of the D-arc."
    },
    deliveryType: { id: "Umpan Tarik Terukur (Driven Pass)", en: "Driven Low Pull-Back" },
    targetZoneLabel: { id: "Luar Kotak / Zone 14 (D-Arc)", en: "Edge of Box / Zone 14" },
    successRate: "xG 0.11 · Spektakuler",
    previewTarget: { x: 50, y: 22.5 },
    previewControl: { x: 25, y: 19 }
  },
  {
    id: "train-stack",
    badge: "DECOY RUNS",
    title: { id: "Formasi Kereta (Penalty Train)", en: "Penalty Spot Decoy Train" },
    subtitle: {
      id: "4 penyerang berbaris satu jalur di titik penalti lalu menyebar ke 4 arah saat bola ditendang.",
      en: "4 attackers stack vertically on the penalty spot then burst into 4 separate zones simultaneously."
    },
    deliveryType: { id: "Umpan Lambung Presisi", en: "Whipped Central Delivery" },
    targetZoneLabel: { id: "4 Titik Serbuan Serentak", en: "4-Point Split Zones" },
    successRate: "xG 0.14 · Sulit Dijaga",
    previewTarget: { x: 50, y: 10 },
    previewControl: { x: 26, y: 15 }
  }
];

export function generateCornerSimulationData(
  players: Player[],
  side: CornerSide,
  schemeId: CornerSchemeId,
  defenseType: CornerDefenseType,
  lang: "id" | "en"
) {
  const mirrorX = (x: number) => (side === "left" ? x : Number((100 - x).toFixed(1)));

  // Ensure we have 11 starting players sorted sensibly
  const starters = players.filter((p) => p.isStarting);
  const getPlayerId = (idx: number, fallbackId: string) => starters[idx]?.id || fallbackId;

  // Player Role Mapping (assuming standard 11 starters: p1=GK, p2..p5=DEF, p6..p8=MID, p9..p11=FWD)
  const gkId = starters.find((p) => p.role === "GK")?.id || getPlayerId(0, "p1");
  const outfield = starters.filter((p) => p.id !== gkId);

  const pTaker = outfield[8]?.id || "p10";       // Corner Taker
  const pShortSupport = outfield[9]?.id || "p11"; // Short option / GK Blocker
  const pStriker = outfield[7]?.id || "p9";      // Near Post / Primary Striker
  const pCB1 = outfield[0]?.id || "p2";          // Tall CB 1 (Aerial target)
  const pCB2 = outfield[1]?.id || "p3";          // Tall CB 2 (Far post target)
  const pMidRunner = outfield[5]?.id || "p7";    // Box crasher
  const pEdgeShooter = outfield[6]?.id || "p8";  // Edge of box / Zone 14
  const pPivot = outfield[4]?.id || "p6";        // Rebound / Second ball security
  const pRestDef1 = outfield[2]?.id || "p4";     // Rest defense right/left
  const pRestDef2 = outfield[3]?.id || "p5";     // Rest defense center-back

  const cornerBallPos = { x: mirrorX(3.8), y: 3.8 };

  // Base Phase 1, Phase 2, Phase 3 coordinates (Left side baseline, mirrored if Right)
  let p1Coords: Record<string, { x: number; y: number }> = {};
  let p2Coords: Record<string, { x: number; y: number }> = {};
  let p3Coords: Record<string, { x: number; y: number }> = {};
  let ballP1 = { ...cornerBallPos };
  let ballP2 = { x: mirrorX(42), y: 8.5 };
  let ballP3 = { x: mirrorX(50), y: 3.2 };

  if (schemeId === "inswing-near") {
    p1Coords = {
      [gkId]: { x: 50, y: 82 },
      [pTaker]: { x: mirrorX(3.2), y: 3.5 },
      [pShortSupport]: { x: mirrorX(45), y: 6.5 }, // Screens GK
      [pStriker]: { x: mirrorX(42), y: 14.5 },     // Starts at penalty spot, darts to near post
      [pCB1]: { x: mirrorX(50), y: 15.5 },         // Central runner
      [pCB2]: { x: mirrorX(58), y: 15.5 },         // Far post runner
      [pMidRunner]: { x: mirrorX(36), y: 18 },     // Near-edge decoy
      [pEdgeShooter]: { x: mirrorX(48), y: 23.5 }, // Edge of box
      [pPivot]: { x: mirrorX(32), y: 28 },         // Recycle option
      [pRestDef1]: { x: mirrorX(42), y: 42 },      // Rest defense
      [pRestDef2]: { x: mirrorX(58), y: 44 }       // Rest defense
    };
    p2Coords = {
      ...p1Coords,
      [pTaker]: { x: mirrorX(5.5), y: 5.5 },
      [pShortSupport]: { x: mirrorX(47), y: 5.5 },
      [pStriker]: { x: mirrorX(40), y: 7.5 },      // Reaches near post!
      [pCB1]: { x: mirrorX(49), y: 8.5 },
      [pCB2]: { x: mirrorX(57), y: 7.5 },          // Attacks far post!
      [pMidRunner]: { x: mirrorX(34), y: 12 },
      [pEdgeShooter]: { x: mirrorX(49), y: 21 }
    };
    ballP2 = { x: mirrorX(40.5), y: 7.5 };
    p3Coords = {
      ...p2Coords,
      [pStriker]: { x: mirrorX(42), y: 6.5 },
      [pCB2]: { x: mirrorX(55), y: 5.2 },          // Taps in flicked ball at far post!
      [pCB1]: { x: mirrorX(49), y: 6.0 }
    };
    ballP3 = { x: mirrorX(53), y: 2.5 };
  } else if (schemeId === "gk-screen-crowd") {
    p1Coords = {
      [gkId]: { x: 50, y: 82 },
      [pTaker]: { x: mirrorX(3.2), y: 3.5 },
      [pShortSupport]: { x: mirrorX(46), y: 5.2 }, // Front of GK
      [pStriker]: { x: mirrorX(43), y: 6.8 },      // Crowding 6-yard box
      [pCB1]: { x: mirrorX(51), y: 5.8 },          // Behind GK
      [pCB2]: { x: mirrorX(55), y: 7.2 },          // Back post cluster
      [pMidRunner]: { x: mirrorX(48), y: 12.5 },   // Late central crasher
      [pEdgeShooter]: { x: mirrorX(46), y: 22 },
      [pPivot]: { x: mirrorX(28), y: 24 },
      [pRestDef1]: { x: mirrorX(40), y: 42 },
      [pRestDef2]: { x: mirrorX(58), y: 44 }
    };
    p2Coords = {
      ...p1Coords,
      [pTaker]: { x: mirrorX(5.5), y: 5.2 },
      [pShortSupport]: { x: mirrorX(48), y: 4.8 },
      [pStriker]: { x: mirrorX(43), y: 5.5 },
      [pCB1]: { x: mirrorX(50), y: 5.5 },
      [pCB2]: { x: mirrorX(56), y: 5.8 },
      [pMidRunner]: { x: mirrorX(49), y: 7.5 }
    };
    ballP2 = { x: mirrorX(49.5), y: 5.5 };
    p3Coords = {
      ...p2Coords,
      [pCB1]: { x: mirrorX(50), y: 4.2 },
      [pMidRunner]: { x: mirrorX(49), y: 5.5 }
    };
    ballP3 = { x: mirrorX(50), y: 2.2 };
  } else if (schemeId === "outswing-far") {
    p1Coords = {
      [gkId]: { x: 50, y: 82 },
      [pTaker]: { x: mirrorX(3.2), y: 3.5 },
      [pShortSupport]: { x: mirrorX(48), y: 6.0 },
      [pStriker]: { x: mirrorX(42), y: 11 },       // Near post decoy run
      [pCB1]: { x: mirrorX(52), y: 17 },           // Deep start for momentum
      [pCB2]: { x: mirrorX(60), y: 18 },           // Deep far-post power runner
      [pMidRunner]: { x: mirrorX(46), y: 15 },
      [pEdgeShooter]: { x: mirrorX(48), y: 23 },
      [pPivot]: { x: mirrorX(32), y: 26 },
      [pRestDef1]: { x: mirrorX(42), y: 42 },
      [pRestDef2]: { x: mirrorX(58), y: 44 }
    };
    p2Coords = {
      ...p1Coords,
      [pStriker]: { x: mirrorX(38), y: 7.5 },      // Pulls near-post defenders away
      [pCB1]: { x: mirrorX(55), y: 9.5 },
      [pCB2]: { x: mirrorX(59), y: 9.0 },          // Meets out-swinger at far post!
      [pMidRunner]: { x: mirrorX(49), y: 11 }
    };
    ballP2 = { x: mirrorX(58.5), y: 9.2 };
    p3Coords = {
      ...p2Coords,
      [pCB2]: { x: mirrorX(57), y: 7.5 },
      [pCB1]: { x: mirrorX(52), y: 6.5 }
    };
    ballP3 = { x: mirrorX(52), y: 2.5 };
  } else if (schemeId === "short-triangle") {
    p1Coords = {
      [gkId]: { x: 50, y: 82 },
      [pTaker]: { x: mirrorX(3.2), y: 3.5 },
      [pShortSupport]: { x: mirrorX(12), y: 8.5 }, // Comes short for 2v1!
      [pPivot]: { x: mirrorX(18), y: 18 },         // Triangle 3rd man at corner of box
      [pStriker]: { x: mirrorX(45), y: 10 },
      [pCB1]: { x: mirrorX(52), y: 10 },
      [pCB2]: { x: mirrorX(58), y: 11 },
      [pMidRunner]: { x: mirrorX(42), y: 16 },
      [pEdgeShooter]: { x: mirrorX(49), y: 21 },
      [pRestDef1]: { x: mirrorX(42), y: 42 },
      [pRestDef2]: { x: mirrorX(58), y: 44 }
    };
    p2Coords = {
      ...p1Coords,
      [pTaker]: { x: mirrorX(9), y: 13 },          // Overlaps after passing!
      [pShortSupport]: { x: mirrorX(14), y: 7.5 },
      [pPivot]: { x: mirrorX(22), y: 14 },         // Enters half-space pocket
      [pStriker]: { x: mirrorX(44), y: 8.0 },
      [pMidRunner]: { x: mirrorX(45), y: 13.5 },   // Cutback target!
      [pEdgeShooter]: { x: mirrorX(50), y: 18.5 }
    };
    ballP2 = { x: mirrorX(22), y: 14 };
    p3Coords = {
      ...p2Coords,
      [pMidRunner]: { x: mirrorX(46), y: 12 },
      [pStriker]: { x: mirrorX(45), y: 6.5 },
      [pCB2]: { x: mirrorX(55), y: 7.5 }
    };
    ballP3 = { x: mirrorX(48), y: 2.5 };
  } else if (schemeId === "edge-volley") {
    p1Coords = {
      [gkId]: { x: 50, y: 82 },
      [pTaker]: { x: mirrorX(3.2), y: 3.5 },
      [pShortSupport]: { x: mirrorX(44), y: 8.0 },
      [pStriker]: { x: mirrorX(40), y: 11 },
      [pCB1]: { x: mirrorX(48), y: 11 },
      [pCB2]: { x: mirrorX(54), y: 11 },
      [pMidRunner]: { x: mirrorX(42), y: 16 },     // Blocker creating screen
      [pEdgeShooter]: { x: mirrorX(52), y: 28 },   // Starts deep, sprints to D-arc!
      [pPivot]: { x: mirrorX(32), y: 27 },
      [pRestDef1]: { x: mirrorX(42), y: 44 },
      [pRestDef2]: { x: mirrorX(58), y: 44 }
    };
    p2Coords = {
      ...p1Coords,
      [pStriker]: { x: mirrorX(39), y: 6.5 },      // Drags defenders to 6-yard line
      [pCB1]: { x: mirrorX(48), y: 6.5 },
      [pCB2]: { x: mirrorX(56), y: 6.5 },
      [pMidRunner]: { x: mirrorX(45), y: 14 },
      [pEdgeShooter]: { x: mirrorX(49), y: 21.5 }  // Arrives unmarked at edge of box!
    };
    ballP2 = { x: mirrorX(49), y: 21.5 };
    p3Coords = {
      ...p2Coords,
      [pEdgeShooter]: { x: mirrorX(49), y: 19.5 }
    };
    ballP3 = { x: mirrorX(51), y: 2.5 };
  } else {
    // train-stack
    p1Coords = {
      [gkId]: { x: 50, y: 82 },
      [pTaker]: { x: mirrorX(3.2), y: 3.5 },
      [pShortSupport]: { x: mirrorX(48), y: 5.5 }, // GK screen
      [pStriker]: { x: mirrorX(50), y: 12 },       // Train car 1
      [pCB1]: { x: mirrorX(50), y: 14.5 },         // Train car 2
      [pCB2]: { x: mirrorX(50), y: 17 },           // Train car 3
      [pMidRunner]: { x: mirrorX(50), y: 19.5 },   // Train car 4
      [pEdgeShooter]: { x: mirrorX(46), y: 25 },
      [pPivot]: { x: mirrorX(30), y: 26 },
      [pRestDef1]: { x: mirrorX(42), y: 42 },
      [pRestDef2]: { x: mirrorX(58), y: 44 }
    };
    p2Coords = {
      ...p1Coords,
      [pStriker]: { x: mirrorX(41), y: 7.5 },      // Bursts to near post
      [pCB1]: { x: mirrorX(49), y: 8.5 },          // Bursts central
      [pCB2]: { x: mirrorX(58), y: 8.5 },          // Bursts to far post
      [pMidRunner]: { x: mirrorX(44), y: 13.5 }    // Bursts to penalty spot
    };
    ballP2 = { x: mirrorX(49), y: 8.5 };
    p3Coords = {
      ...p2Coords,
      [pCB1]: { x: mirrorX(50), y: 6.0 },
      [pCB2]: { x: mirrorX(56), y: 6.0 }
    };
    ballP3 = { x: mirrorX(50), y: 2.5 };
  }

  // Generate Opponent Defenders inside the penalty box if defenseType !== "none"
  const createEnemiesForPhase = (phaseNum: 1 | 2 | 3): TacticalItem[] => {
    if (defenseType === "none") return [];

    // Opponent GK + 7 box defenders + 1 short tracker + 1 counter outlet
    let rawEnemies: { id: string; x: number; y: number; number: number; role: string }[] = [];

    if (defenseType === "zonal") {
      rawEnemies = [
        { id: "enemy-ck-gk", x: mirrorX(50), y: 3.5, number: 1, role: "GK" },
        { id: "enemy-ck-2", x: mirrorX(41), y: 6.5, number: 2, role: "DEF" },
        { id: "enemy-ck-3", x: mirrorX(46), y: 6.8, number: 4, role: "DEF" },
        { id: "enemy-ck-4", x: mirrorX(51), y: 6.8, number: 5, role: "DEF" },
        { id: "enemy-ck-5", x: mirrorX(56), y: 6.5, number: 3, role: "DEF" },
        { id: "enemy-ck-6", x: mirrorX(43), y: 11.5, number: 6, role: "MID" },
        { id: "enemy-ck-7", x: mirrorX(52), y: 11.5, number: 8, role: "MID" },
        { id: "enemy-ck-8", x: mirrorX(22), y: 11, number: 7, role: "MID" },
        { id: "enemy-ck-9", x: mirrorX(47), y: 17.5, number: 10, role: "MID" },
        { id: "enemy-ck-10", x: mirrorX(50), y: 36, number: 9, role: "FWD" }
      ];
    } else if (defenseType === "man") {
      const targetCoords = phaseNum === 1 ? p1Coords : phaseNum === 2 ? p2Coords : p3Coords;
      rawEnemies = [
        { id: "enemy-ck-gk", x: mirrorX(50), y: 3.5, number: 1, role: "GK" },
        { id: "enemy-ck-2", x: (targetCoords[pStriker]?.x ?? 42) + (side === "left" ? 1.5 : -1.5), y: Math.max(4.5, (targetCoords[pStriker]?.y ?? 10) - 1.5), number: 4, role: "DEF" },
        { id: "enemy-ck-3", x: (targetCoords[pCB1]?.x ?? 50) + (side === "left" ? 1.2 : -1.2), y: Math.max(4.5, (targetCoords[pCB1]?.y ?? 12) - 1.5), number: 5, role: "DEF" },
        { id: "enemy-ck-4", x: (targetCoords[pCB2]?.x ?? 56) + (side === "left" ? -1.2 : 1.2), y: Math.max(4.5, (targetCoords[pCB2]?.y ?? 12) - 1.5), number: 3, role: "DEF" },
        { id: "enemy-ck-5", x: (targetCoords[pMidRunner]?.x ?? 45) + 1, y: Math.max(5, (targetCoords[pMidRunner]?.y ?? 14) - 1.5), number: 6, role: "MID" },
        { id: "enemy-ck-6", x: mirrorX(40), y: 6.2, number: 2, role: "DEF" },
        { id: "enemy-ck-7", x: mirrorX(48), y: 16, number: 8, role: "MID" },
        { id: "enemy-ck-8", x: mirrorX(18), y: 9.5, number: 7, role: "MID" },
        { id: "enemy-ck-9", x: mirrorX(46), y: 20, number: 10, role: "MID" },
        { id: "enemy-ck-10", x: mirrorX(50), y: 38, number: 9, role: "FWD" }
      ];
    } else {
      // Hybrid (Near post guard + 3 zonal 6-yard + 4 man-markers + 1 edge + 1 counter striker)
      const shiftY = phaseNum === 1 ? 0 : -1.2;
      rawEnemies = [
        { id: "enemy-ck-gk", x: mirrorX(50), y: 3.4, number: 1, role: "GK" },
        { id: "enemy-ck-2", x: mirrorX(39.5), y: 4.2, number: 2, role: "DEF" }, // Near post guard
        { id: "enemy-ck-3", x: mirrorX(44), y: 7.2 + shiftY, number: 4, role: "DEF" },
        { id: "enemy-ck-4", x: mirrorX(50), y: 7.5 + shiftY, number: 5, role: "DEF" },
        { id: "enemy-ck-5", x: mirrorX(55.5), y: 8.0 + shiftY, number: 3, role: "DEF" },
        { id: "enemy-ck-6", x: mirrorX(45), y: 12.5 + shiftY, number: 6, role: "MID" },
        { id: "enemy-ck-7", x: mirrorX(52), y: 13.0 + shiftY, number: 8, role: "MID" },
        { id: "enemy-ck-8", x: mirrorX(19), y: 10.5, number: 7, role: "MID" }, // Short corner guard
        { id: "enemy-ck-9", x: mirrorX(47), y: 18.5, number: 10, role: "MID" }, // Edge of box blocker
        { id: "enemy-ck-10", x: mirrorX(50), y: 37, number: 9, role: "FWD" }
      ];
    }

    return rawEnemies.map((e) => ({
      id: e.id,
      type: "enemy" as const,
      x: Number(e.x.toFixed(1)),
      y: Number(e.y.toFixed(1)),
      number: e.number,
      role: e.role
    }));
  };

  const enemiesP1 = createEnemiesForPhase(1);
  const enemiesP2 = createEnemiesForPhase(2);
  const enemiesP3 = createEnemiesForPhase(3);

  const updatedPlayers: Player[] = players.map((p) => {
    if (p.isStarting && p1Coords[p.id]) {
      return { ...p, x: p1Coords[p.id].x, y: p1Coords[p.id].y };
    }
    return p;
  });

  const ballItem: TacticalItem = {
    id: "item-default-ball",
    type: "ball",
    x: ballP1.x,
    y: ballP1.y
  };

  const updatedItems: TacticalItem[] = [ballItem, ...enemiesP1];

  const schemeMeta = CORNER_SCHEMES.find((s) => s.id === schemeId) || CORNER_SCHEMES[0];
  const sideLabel = side === "left" ? (lang === "id" ? "Sudut Kiri" : "Left Corner") : (lang === "id" ? "Sudut Kanan" : "Right Corner");

  const frames: AnimationFrame[] = [
    {
      id: `ck-${schemeId}-${side}-f1`,
      name: lang === "id" ? `Fasa 1: Setup ${sideLabel}` : `Phase 1: ${sideLabel} Setup`,
      instruction:
        lang === "id"
          ? `Posisi awal ${schemeMeta.title.id} dari ${sideLabel}. Eksekutor bersiap di busur sudut, penyerang mengambil posisi awal dan membuka ruang.`
          : `Initial setup for ${schemeMeta.title.en} from ${sideLabel}. Taker sets the ball while runners hold starting positions.`,
      duration: 1.8,
      players: updatedPlayers.filter((p) => p.isStarting).map((p) => ({ id: p.id, x: p.x, y: p.y })),
      items: [{ id: "item-default-ball", x: ballP1.x, y: ballP1.y }, ...enemiesP1.map((e) => ({ id: e.id, x: e.x, y: e.y }))]
    },
    {
      id: `ck-${schemeId}-${side}-f2`,
      name: lang === "id" ? "Fasa 2: Eksekusi & Serbuan" : "Phase 2: Delivery & Box Runs",
      instruction:
        lang === "id"
          ? `${schemeMeta.subtitle.id} Perhatikan timing lari penyerang menuju ${schemeMeta.targetZoneLabel.id}.`
          : `${schemeMeta.subtitle.en} Watch the synchronized runs into the ${schemeMeta.targetZoneLabel.en}.`,
      duration: 2.0,
      players: updatedPlayers
        .filter((p) => p.isStarting)
        .map((p) => ({
          id: p.id,
          x: p2Coords[p.id]?.x ?? p.x,
          y: p2Coords[p.id]?.y ?? p.y
        })),
      items: [{ id: "item-default-ball", x: ballP2.x, y: ballP2.y }, ...enemiesP2.map((e) => ({ id: e.id, x: e.x, y: e.y }))]
    },
    {
      id: `ck-${schemeId}-${side}-f3`,
      name: lang === "id" ? "Fasa 3: Finishing & Second Ball" : "Phase 3: Finishing & Rebound",
      instruction:
        lang === "id"
          ? "Penyelesaian akhir ke gawang! Gelandang lini kedua dan bek Rest Defense siap mengantisipasi bola liar atau transisi lawan."
          : "Final strike on goal! Edge midfielders and Rest Defense lock down the second ball and prevent counter-attacks.",
      duration: 1.8,
      players: updatedPlayers
        .filter((p) => p.isStarting)
        .map((p) => ({
          id: p.id,
          x: p3Coords[p.id]?.x ?? p.x,
          y: p3Coords[p.id]?.y ?? p.y
        })),
      items: [{ id: "item-default-ball", x: ballP3.x, y: ballP3.y }, ...enemiesP3.map((e) => ({ id: e.id, x: e.x, y: e.y }))]
    }
  ];

  return {
    updatedPlayers,
    updatedItems,
    frames,
    roles: {
      taker: players.find((p) => p.id === pTaker),
      nearPost: players.find((p) => p.id === pStriker),
      farPost: players.find((p) => p.id === pCB2),
      gkScreen: players.find((p) => p.id === pShortSupport),
      edgeShooter: players.find((p) => p.id === pEdgeShooter),
      restDefense: players.find((p) => p.id === pRestDef1)
    }
  };
}

export default function CornerKickSimulator({
  players,
  onApplyCornerSimulation,
  lang
}: CornerKickSimulatorProps) {
  const [cornerSide, setCornerSide] = useState<CornerSide>("left");
  const [selectedScheme, setSelectedScheme] = useState<CornerSchemeId>("inswing-near");
  const [defenseType, setDefenseType] = useState<CornerDefenseType>("hybrid");
  const [justApplied, setJustApplied] = useState(false);
  const [cornerSubTab, setCornerSubTab] = useState<"schemes" | "roles">("schemes");

  const currentScheme = CORNER_SCHEMES.find((s) => s.id === selectedScheme) || CORNER_SCHEMES[0];
  const simPreview = generateCornerSimulationData(players, cornerSide, selectedScheme, defenseType, lang);

  const handleTriggerSimulation = (autoPlay: boolean) => {
    const data = generateCornerSimulationData(players, cornerSide, selectedScheme, defenseType, lang);
    onApplyCornerSimulation({
      updatedPlayers: data.updatedPlayers,
      updatedItems: data.updatedItems,
      frames: data.frames,
      overlayMode: "corner-zones",
      phase: "set-piece",
      autoPlay,
      title: lang === "id" ? currentScheme.title.id : currentScheme.title.en
    });
    soundManager.playWhistle();
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 3000);
  };

  // Mirror helper for the live mini-SVG tactical preview
  const mx = (x: number) => (cornerSide === "left" ? x : 100 - x);
  const startX = mx(4);
  const startY = 4;
  const ctrlX = mx(currentScheme.previewControl.x);
  const ctrlY = currentScheme.previewControl.y;
  const endX = mx(currentScheme.previewTarget.x);
  const endY = currentScheme.previewTarget.y;

  return (
    <Interactive3DCard glowColor="rgba(45, 212, 191, 0.25)">
      <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-teal-400/15 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Flag className="w-4 h-4 text-teal-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight font-display truncate">
              {lang === "id" ? "Studio Simulasi Corner Kick" : "Corner Kick Set-Piece Studio"}
            </h3>
          </div>
          <span className="text-[10.5px] font-mono tabular-nums text-teal-300 shrink-0">
            {currentScheme.successRate}
          </span>
        </div>

        {/* High-Contrast Interactive Isometric SVG Tactical Preview Banner */}
        <div className="relative w-full h-24 xl:h-28 rounded-2xl overflow-hidden border border-teal-400/25 bg-gradient-to-b from-[#07262d] via-[#093038] to-[#061c21] shadow-inner shrink-0">
          <svg
            viewBox="0 0 100 45"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="toscaTurfStripes" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#093038" />
                <stop offset="50%" stopColor="#0c3b44" />
                <stop offset="100%" stopColor="#093038" />
              </linearGradient>
              <radialGradient id="targetZoneGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(45, 212, 191, 0.45)" />
                <stop offset="100%" stopColor="rgba(45, 212, 191, 0.0)" />
              </radialGradient>
            </defs>

            {/* Pitch Penalty Box Geometry */}
            <rect x="0" y="0" width="100" height="45" fill="url(#toscaTurfStripes)" />
            <rect x="3" y="2" width="94" height="42" fill="none" stroke="#99f6e4" strokeWidth="0.4" strokeOpacity="0.45" />
            {/* Goal */}
            <rect x="40" y="0.4" width="20" height="1.6" fill="rgba(204,251,241,0.15)" stroke="#ccfbf1" strokeWidth="0.4" />
            {/* 6-Yard Box */}
            <rect x="36" y="2" width="28" height="7.5" fill="rgba(20, 184, 166, 0.08)" stroke="#99f6e4" strokeWidth="0.4" strokeOpacity="0.6" />
            {/* 18-Yard Penalty Box */}
            <rect x="22" y="2" width="56" height="22" fill="none" stroke="#99f6e4" strokeWidth="0.45" strokeOpacity="0.65" />
            {/* Penalty Spot & Arc */}
            <circle cx="50" cy="14" r="0.7" fill="#5eead4" />
            <path d="M 40 24 A 10 8 0 0 0 60 24" fill="none" stroke="#99f6e4" strokeWidth="0.4" strokeOpacity="0.55" />

            {/* Highlighted Target Zone in Penalty Box */}
            <circle cx={endX} cy={endY} r="6.5" fill="url(#targetZoneGlow)" />
            <circle
              cx={endX}
              cy={endY}
              r="3.2"
              fill="rgba(45, 212, 191, 0.18)"
              stroke="#2dd4bf"
              strokeWidth="0.45"
              strokeDasharray="1.2, 1"
            />

            {/* Curved Ball Flight Trajectory Arc */}
            <path
              d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="0.85"
              strokeDasharray="1.8, 1.2"
            />
            {/* Animated Ball along the trajectory */}
            <circle r="1.2" fill="#ffffff" stroke="#14b8a6" strokeWidth="0.4">
              <animateMotion
                dur="2.2s"
                repeatCount="indefinite"
                path={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
              />
            </circle>

            {/* Corner Flag Marker */}
            <circle cx={startX} cy={startY} r="1.4" fill="#2dd4bf" />
          </svg>

          {/* Scrim Overlay with Scheme Metadata */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#041217]/95 via-[#041217]/65 to-transparent px-3 py-1.5 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[9.5px] font-medium text-teal-300 flex items-center gap-1 truncate">
                <span>{lang === "id" ? currentScheme.deliveryType.id : currentScheme.deliveryType.en}</span>
                <span aria-hidden="true">·</span>
                <span>{lang === "id" ? currentScheme.targetZoneLabel.id : currentScheme.targetZoneLabel.en}</span>
              </div>
              <div className="text-[11px] font-bold text-white truncate">
                {lang === "id" ? currentScheme.title.id : currentScheme.title.en}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTriggerSimulation(true)}
              className="px-2.5 py-1 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-[10.5px] flex items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{lang === "id" ? "Putar" : "Play"}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Switcher: Skema & Sisi vs Penugasan Pemain */}
        <div className="grid grid-cols-2 gap-1 bg-[#041014] p-1 rounded-xl border border-teal-400/20">
          <button
            type="button"
            onClick={() => setCornerSubTab("schemes")}
            className={`py-1 px-2 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
              cornerSubTab === "schemes"
                ? "bg-teal-400 text-slate-950 shadow-sm"
                : "text-teal-100/70 hover:text-white"
            }`}
          >
            {lang === "id" ? "1. Skema & Sisi" : "1. Schemes & Side"}
          </button>
          <button
            type="button"
            onClick={() => setCornerSubTab("roles")}
            className={`py-1 px-2 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
              cornerSubTab === "roles"
                ? "bg-teal-400 text-slate-950 shadow-sm"
                : "text-teal-100/70 hover:text-white"
            }`}
          >
            {lang === "id" ? "2. Tugas Pemain & Lawan" : "2. Player Roles & Def"}
          </button>
        </div>

        {cornerSubTab === "schemes" ? (
          <>
            {/* Corner Side Switcher */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#040f13] p-1 rounded-xl border border-teal-400/15">
              <button
                type="button"
                onClick={() => {
                  setCornerSide("left");
                  soundManager.playClick();
                }}
                className={`py-1 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  cornerSide === "left"
                    ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                    : "text-teal-100/70 hover:text-white"
                }`}
              >
                🚩 {lang === "id" ? "Sudut Kiri" : "Left Corner"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCornerSide("right");
                  soundManager.playClick();
                }}
                className={`py-1 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  cornerSide === "right"
                    ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                    : "text-teal-100/70 hover:text-white"
                }`}
              >
                🚩 {lang === "id" ? "Sudut Kanan" : "Right Corner"}
              </button>
            </div>

            {/* Select Corner Kick Tactical Scheme (Compact 2-column grid) */}
            <div className="grid grid-cols-2 gap-1.5">
              {CORNER_SCHEMES.map((scheme) => {
                const isSelected = selectedScheme === scheme.id;
                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => {
                      setSelectedScheme(scheme.id);
                      soundManager.playClick();
                    }}
                    className={`text-left p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? "bg-teal-500/20 border-teal-400/60 text-white shadow-sm"
                        : "bg-[#06151a]/70 border-teal-400/10 text-teal-100/80 hover:border-teal-400/30 hover:bg-[#081c22]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-white truncate">
                        {lang === "id" ? scheme.title.id : scheme.title.en}
                      </span>
                      <span className="text-[9px] font-mono text-teal-300 shrink-0">
                        {scheme.badge}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-teal-100/65 line-clamp-1 leading-tight">
                      {lang === "id" ? scheme.subtitle.id : scheme.subtitle.en}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Opponent Defense Setup */}
            <div className="bg-[#06151a]/80 border border-teal-400/15 rounded-xl p-2 flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-teal-200/75">
                {lang === "id" ? "Pertahanan Lawan di Kotak Penalti" : "Opponent Box Defense"}
              </span>
              <div className="grid grid-cols-4 gap-1 bg-[#040f13] p-1 rounded-lg">
                {(
                  [
                    { id: "hybrid", label: "Hybrid" },
                    { id: "zonal", label: "Zonal" },
                    { id: "man", label: "Man" },
                    { id: "none", label: lang === "id" ? "Polos" : "None" }
                  ] as const
                ).map((def) => (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => {
                      setDefenseType(def.id);
                      soundManager.playClick();
                    }}
                    className={`py-1 px-1.5 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      defenseType === def.id
                        ? "bg-teal-500/25 text-teal-200 border border-teal-400/40 font-bold"
                        : "text-teal-100/60 hover:text-white"
                    }`}
                  >
                    {def.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assigned Key Roles Summary */}
            <div className="bg-[#06151a]/90 border border-teal-400/15 rounded-xl p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10.5px] text-teal-200/80 font-semibold">
                <span>{lang === "id" ? "Penugasan Otomatis Pemain Kunci" : "Key Player Assignments"}</span>
                <span className="font-mono text-[9.5px] text-teal-300">11v11</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                <div className="bg-[#092027] rounded-lg px-2 py-1 border border-teal-400/10">
                  <div className="text-[9px] text-teal-300/70">{lang === "id" ? "Eksekutor" : "Taker"}</div>
                  <div className="font-bold text-white truncate font-mono tabular-nums">
                    #{simPreview.roles.taker?.number ?? 10} {simPreview.roles.taker?.name ?? "Playmaker"}
                  </div>
                </div>
                <div className="bg-[#092027] rounded-lg px-2 py-1 border border-teal-400/10">
                  <div className="text-[9px] text-teal-300/70">{lang === "id" ? "Tiang Dekat" : "Near-Post"}</div>
                  <div className="font-bold text-white truncate font-mono tabular-nums">
                    #{simPreview.roles.nearPost?.number ?? 9} {simPreview.roles.nearPost?.name ?? "Striker"}
                  </div>
                </div>
                <div className="bg-[#092027] rounded-lg px-2 py-1 border border-teal-400/10">
                  <div className="text-[9px] text-teal-300/70">{lang === "id" ? "Tiang Jauh" : "Far-Post"}</div>
                  <div className="font-bold text-white truncate font-mono tabular-nums">
                    #{simPreview.roles.farPost?.number ?? 3} {simPreview.roles.farPost?.name ?? "Center Back"}
                  </div>
                </div>
                <div className="bg-[#092027] rounded-lg px-2 py-1 border border-teal-400/10">
                  <div className="text-[9px] text-teal-300/70">{lang === "id" ? "Blokir Kiper" : "GK Screen"}</div>
                  <div className="font-bold text-white truncate font-mono tabular-nums">
                    #{simPreview.roles.gkScreen?.number ?? 11} {simPreview.roles.gkScreen?.name ?? "Winger"}
                  </div>
                </div>
                <div className="bg-[#092027] rounded-lg px-2 py-1 border border-teal-400/10">
                  <div className="text-[9px] text-teal-300/70">{lang === "id" ? "Lini Kedua" : "Edge Volley"}</div>
                  <div className="font-bold text-white truncate font-mono tabular-nums">
                    #{simPreview.roles.edgeShooter?.number ?? 8} {simPreview.roles.edgeShooter?.name ?? "Midfielder"}
                  </div>
                </div>
                <div className="bg-[#092027] rounded-lg px-2 py-1 border border-teal-400/10">
                  <div className="text-[9px] text-teal-300/70">{lang === "id" ? "Rest Defense" : "Rest Defense"}</div>
                  <div className="font-bold text-white truncate font-mono tabular-nums">
                    #{simPreview.roles.restDefense?.number ?? 4} {simPreview.roles.restDefense?.name ?? "Defender"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => handleTriggerSimulation(false)}
            className="py-2 px-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/35 text-teal-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span className="truncate">{lang === "id" ? "Posisi Fasa 1" : "Set Phase 1"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerSimulation(true)}
            className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/20 transition-all cursor-pointer active:scale-98 whitespace-nowrap"
          >
            {justApplied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span className="truncate">{lang === "id" ? "Aktif!" : "Active!"}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-slate-950 shrink-0" />
                <span className="truncate">{lang === "id" ? "Putar 3 Fasa" : "Play 3 Phases"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Interactive3DCard>
  );
}
