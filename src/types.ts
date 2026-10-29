export interface Player {
  id: string;
  name: string;
  number: number;
  role: "GK" | "DEF" | "MID" | "FWD";
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  isStarting: boolean;
  photo: string | null;
  notes?: string;
  stats?: {
    speed: number;
    stamina: number;
    passing: number;
    defending: number;
    dribbling: number;
  };
}

export interface TacticalItem {
  id: string;
  type: "ball" | "cone" | "enemy";
  x: number;
  y: number;
  number?: number;
  role?: string;
}

export interface AnimationFrame {
  id: string;
  name: string;
  players: { id: string; x: number; y: number }[];
  items: { id: string; x: number; y: number }[];
  instruction: string;
  duration?: number; // Time-to-complete value in seconds (e.g. 0.5s, 1.5s, 2.0s, 3.0s)
}

export interface DrawingStroke {
  color: string;
  size: number;
  style: "solid" | "arrow" | "eraser";
  points: { x: number; y: number }[];
  layer?: number; // 1, 2, or 3 for multi-layer drawings
}

export type PitchTheme =
  | "sporty-tosca"
  | "emerald-grass"
  | "premier-pitch"
  | "neon-hologram"
  | "dark-slate"
  | "tactical-board"
  | "midnight-ice"
  | "aurora-stadium"
  | "sunset-arena";

export interface TacticalPlay {
  title: string;
  description: string;
  frames: {
    name: string;
    instruction: string;
    players: { id: string; x: number; y: number }[];
    items: { id: string; x: number; y: number }[];
    duration?: number;
  }[];
}

export type TacticalOverlayMode = "none" | "18-zones" | "corridors" | "pressing-blocks" | "corner-zones";

export type TacticalPhase =
  | "build-up"
  | "progression"
  | "final-third"
  | "high-press"
  | "mid-block"
  | "low-block"
  | "counter-attack"
  | "set-piece";

export interface PassMeasurement {
  sourceId: string;
  targetId: string;
  sourceType: "player" | "item";
  targetType: "player" | "item";
  distanceMeters: number;
  angleDegrees: number;
  isObstructed: boolean;
  obstructingEnemyId?: string;
}

export type DeviceViewMode = "android" | "pc";
export type AndroidViewportSize = "phone" | "tablet" | "fluid";
export type AndroidActiveTab = "pitch" | "corner" | "squad" | "animation" | "ai";

export type TacticalStylePreset =
  | "balanced"
  | "high-press"
  | "mid-block"
  | "low-block"
  | "tiki-taka"
  | "wing-overload"
  | "custom";

export interface FormationShapeConfig {
  lineHeight: number; // 0-100 (50 = standard)
  teamWidth: number; // 0-100 (50 = standard)
  compactness: number; // 0-100 (50 = standard)
  stylePreset: TacticalStylePreset;
  autoFitRoles: boolean;
}

export interface CustomFormationTemplate {
  id: string;
  name: string;
  sportMode: "soccer" | "minisoccer" | "futsal" | "custom";
  positions: { role: "GK" | "DEF" | "MID" | "FWD"; x: number; y: number }[];
  createdAt: number;
}

