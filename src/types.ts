export interface Player {
  id: string;
  name: string;
  number: number;
  role: "GK" | "DEF" | "MID" | "FWD";
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  isStarting: boolean;
  photo: string | null;
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
  type: "ball" | "cone";
  x: number;
  y: number;
}

export interface AnimationFrame {
  id: string;
  name: string;
  players: { id: string; x: number; y: number }[];
  items: { id: string; x: number; y: number }[];
  instruction: string;
}

export interface DrawingStroke {
  color: string;
  size: number;
  style: "solid" | "arrow";
  points: { x: number; y: number }[];
}

export interface TacticalPlay {
  title: string;
  description: string;
  frames: {
    name: string;
    instruction: string;
    players: { id: string; x: number; y: number }[];
    items: { id: string; x: number; y: number }[];
  }[];
}
