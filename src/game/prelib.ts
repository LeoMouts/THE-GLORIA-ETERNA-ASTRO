// Pré-Libertadores — quick 8-team knockout cup among clubs that play the Sul-Americana
// instead of the Libertadores. The champion earns a season-2027 Libertadores slot in place
// of whichever real club had the worst group-stage campaign in 2026.
import raw from "./data/prelib.json";
import type { Team } from "./types";

export const PRELIB_DATA = raw as unknown as { teams: Record<string, Team> };
