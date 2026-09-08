// Brasileirão Série A 2026 — the 8 real Série A clubs that never had a squad anywhere in this
// game (they don't play the Libertadores or the Pré-Libertadores, so nothing generated one for
// them). Rosters here are procedurally generated ("gen", same convention as Cusco FC/Nacional/
// Universitario etc. elsewhere in teams.json) — placeholders to be replaced with real 2026
// squads later, exactly as planned. The other 12 of the 20 confirmed Série A 2026 clubs already
// have real rosters: 6 from the main Libertadores world (Flamengo, Fluminense, Cruzeiro,
// Corinthians, Palmeiras, Mirassol) and 6 from the Pré-Libertadores pool (Vasco da Gama, São
// Paulo, Grêmio, Santos, Botafogo, Atlético Mineiro).
import raw from "./data/serieA_extra_teams.json";
import type { Team } from "./types";

export const SERIE_A_EXTRA_TEAMS = raw as unknown as Record<string, Team>;

// the full confirmed 20-club 2026 Série A lineup, regardless of which data source each
// club's roster actually comes from.
export const SERIE_A_2026 = [
  "Flamengo", "Fluminense", "Cruzeiro", "Corinthians", "Palmeiras", "Mirassol",
  "Vasco da Gama", "São Paulo", "Grêmio", "Santos", "Botafogo", "Atlético Mineiro",
  "Red Bull Bragantino", "Internacional", "Bahia", "Vitória",
  "Athletico Paranaense", "Coritiba", "Chapecoense", "Remo",
];
