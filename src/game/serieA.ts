// Brasileirão Série A 2026 — the 8 real Série A clubs that never had a squad anywhere in this
// game (they don't play the Libertadores or the Pré-Libertadores, so nothing generated one for
// them). Rosters started fully procedurally generated ("gen", same convention as Cusco FC/
// Nacional/Universitario etc. elsewhere in teams.json), then got a real-player pass: any of
// these clubs' actual 2026 squad members that were already sitting in market.json (tagged
// league:"Brasileirão Betano" but with no real roster to belong to) replaced a generated
// player in the same position — 7 of the 8 clubs are now "mixed" (real + generated depth);
// only Remo had zero matches in our data and stays fully generated for now. The other 12 of
// the 20 confirmed Série A 2026 clubs already have real rosters: 6 from the main Libertadores
// world (Flamengo, Fluminense, Cruzeiro, Corinthians, Palmeiras, Mirassol) and 6 from the
// Pré-Libertadores pool (Vasco da Gama, São Paulo, Grêmio, Santos, Botafogo, Atlético Mineiro)
// — those 6 also picked up a few extra real Brasileirão-tagged players as squad depth.
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
