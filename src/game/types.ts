// ============================================================
// LIBERTADORES MANAGER — shared data shapes
// ============================================================

export type Position =
  | "GK" | "CB" | "LB" | "RB"
  | "DMF" | "CM" | "AM" | "LM" | "RM"
  | "LW" | "RW" | "SS" | "ST";

export type Foot = "Left foot" | "Right foot" | "Both";

export interface PlayerBase {
  id: number;
  name: string;
  nat: string;
  age: number;
  pos: Position;
  altPos: Position[];
  ovr: number;
  pot: number;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  de: number;
  phy: number;
  gk: number;
  value: number;
  foot: Foot;
}

/** A player on a club roster (Libertadores squads). */
export interface Player extends PlayerBase {
  injured: boolean;
  suspended: boolean;
  form: number;
}

/** A player in the global transfer market (outside the Libertadores field). */
export interface MarketPlayer extends PlayerBase {
  club: string;
  league: string;
}

export type GroupLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export interface Team {
  name: string;
  country: string;
  flag: string;
  group: GroupLetter;
  source: "real" | "gen";
  players: Player[];
}

export interface GameData {
  groups: Record<GroupLetter, string[]>;
  teams: Record<string, Team>;
}
