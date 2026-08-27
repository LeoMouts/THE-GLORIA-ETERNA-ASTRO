import raw from "./data/teams.json";
import type { GameData } from "./types";

export const GAME_DATA = raw as unknown as GameData;
