// Brasileirão Série B 2026 — the 20 real clubs, with the real squads that already sat in market.json
// (tagged league:"Brazilian 2nd Division"), plus the Série C clubs that can come up when a Série B club
// goes down. Crests come from the SMF crest repository (TheSMF-Group/thefenomeno-assets) through the
// same CDN the rest of the game uses.
import MARKET from "./data/market.json";
import DUP_REMOVED from "./data/dupRemoved.json";
import type { Team } from "./types";

export const SERIE_B_2026 = [
  "Fortaleza", "Ceará", "Sport Recife", "Juventude", "Goiás", "América Mineiro",
  "Atlético Goianiense", "Criciúma", "Cuiabá", "Athletic Club", "CRB", "Avaí",
  "Vila Nova", "Novorizontino", "Operário-PR", "Botafogo-SP", "Ponte Preta", "Londrina",
  "Náutico", "São Bernardo",
];

// Série C clubs (and recent Série B ones) that supply the 4 clubs that go up each year; their squads are generated when they first rise
export const SERIE_C_POOL = [
  "ABC", "Águia de Marabá", "Aparecidense", "Botafogo-PB", "Brasiliense", "Confiança", "Costa Rica-MS",
  "Ferroviária", "Figueirense", "Humaitá-AC", "Luverdense", "Manaus FC", "Rio Branco-ES", "Sampaio Corrêa",
  "São Raimundo-RR", "Volta Redonda", "Ypiranga", "Amazonas", "Brusque", "Guarani", "Ituano", "Paysandu", "Santa Cruz",
];

// club name -> crest file in thefenomeno-assets/crests (only clubs the crest repository actually has)
export const EXTRA_CREST_SLUGS: Record<string, string> = {
  "Londrina":"londrina", "Novorizontino":"novorizontino", "São Bernardo":"sao-bernardo", "Náutico":"nautico",
  "Criciúma":"criciuma", "Cuiabá":"cuiaba", "América Mineiro":"america-mg", "CRB":"crb", "Operário-PR":"operario-pr",
  "Avaí":"avai", "Vila Nova":"vila-nova", "Botafogo-SP":"botafogo-sp", "Ponte Preta":"ponte-preta", "Goiás":"goias",
  "Fortaleza":"fortaleza", "Ceará":"ceara", "Juventude":"juventude", "Sport Recife":"sport-recife", "Athletic Club":"athletic",
  "ABC":"abc", "Águia de Marabá":"aguia-de-maraba", "Aparecidense":"aparecidense", "Botafogo-PB":"botafogo-pb",
  "Brasiliense":"brasiliense", "Confiança":"confianca", "Costa Rica-MS":"costa-rica-ms", "Ferroviária":"ferroviaria",
  "Figueirense":"figueirense", "Humaitá-AC":"humaita-ac", "Luverdense":"luverdense", "Manaus FC":"manaus-fc",
  "Rio Branco-ES":"rio-branco-es", "Sampaio Corrêa":"sampaio-correa", "São Raimundo-RR":"sao-raimundo-rr",
  "Volta Redonda":"volta-redonda", "Ypiranga":"ypiranga", "Amazonas":"amazonas", "Brusque":"brusque", "Guarani":"guarani",
  "Ituano":"ituano", "Paysandu":"paysandu", "Santa Cruz":"santa-cruz",
};

const BNAMES = new Set(SERIE_B_2026);
const DUP = new Set<number>(DUP_REMOVED as unknown as number[]);

// the real Série B players from the market data, grouped by club (copies, never the raw objects)
export function serieBSeedPlayers(): Record<string, any[]> {
  const out: Record<string, any[]> = {};
  SERIE_B_2026.forEach(n => out[n] = []);
  (MARKET as any[]).forEach(p => {
    if (p.league !== "Brazilian 2nd Division" || !BNAMES.has(p.club) || DUP.has(p.id)) return;
    const c: any = Object.assign({}, p, { injured: false, suspended: false, form: 0, suspendedMatches: 0, injuredMatches: 0 });
    delete c.club; delete c.league;
    out[p.club].push(c);
  });
  return out;
}
export function serieBTeamsFromData(): Record<string, Team> {
  const seed = serieBSeedPlayers();
  const teams: Record<string, Team> = {};
  SERIE_B_2026.forEach(name => {
    teams[name] = { name, country: "Brasil", flag: "🇧🇷", group: null, source: "real", players: seed[name] } as unknown as Team;
  });
  return teams;
}
export function isSerieBSeedPlayer(p: any): boolean {
  return p && p.league === "Brazilian 2nd Division" && BNAMES.has(p.club);
}
