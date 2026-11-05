// ============================================================
// COPA DO MUNDO — pure logic (nations, flags, qualification, draw, fixtures, bracket, call-up
// selection). No game state, no DOM: app.ts owns the state and the screens, this file only
// answers "who", "against whom" and "in which order".
//
// Format = the 2026 World Cup: 48 teams, 12 groups of 4 (3 matchdays), the 2 best of every group
// + the 8 best third-placed teams (32) go to a single-match knockout: 16-avos, oitavas, quartas,
// semifinais, disputa do 3º lugar e final — with the real 2026 bracket tree (M73..M104).
// ============================================================

export type Conf = "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";
export interface Nation { en: string; pt: string; code: string; conf: Conf; banned?: boolean; }

const n = (en: string, pt: string, code: string, conf: Conf, banned?: boolean): Nation => ({ en, pt, code, conf, banned });
export const NATIONS: Nation[] = [
  // CONMEBOL
  n("Brazil", "Brasil", "br", "CONMEBOL"), n("Argentina", "Argentina", "ar", "CONMEBOL"), n("Uruguay", "Uruguai", "uy", "CONMEBOL"),
  n("Colombia", "Colômbia", "co", "CONMEBOL"), n("Chile", "Chile", "cl", "CONMEBOL"), n("Paraguay", "Paraguai", "py", "CONMEBOL"),
  n("Ecuador", "Equador", "ec", "CONMEBOL"), n("Peru", "Peru", "pe", "CONMEBOL"), n("Venezuela", "Venezuela", "ve", "CONMEBOL"),
  n("Bolivia", "Bolívia", "bo", "CONMEBOL"),
  // UEFA
  n("Spain", "Espanha", "es", "UEFA"), n("England", "Inglaterra", "gb-eng", "UEFA"), n("France", "França", "fr", "UEFA"),
  n("Italy", "Itália", "it", "UEFA"), n("Netherlands", "Holanda", "nl", "UEFA"), n("Portugal", "Portugal", "pt", "UEFA"),
  n("Belgium", "Bélgica", "be", "UEFA"), n("Germany", "Alemanha", "de", "UEFA"), n("Denmark", "Dinamarca", "dk", "UEFA"),
  n("Türkiye", "Turquia", "tr", "UEFA"), n("Scotland", "Escócia", "gb-sct", "UEFA"), n("Switzerland", "Suíça", "ch", "UEFA"),
  n("Sweden", "Suécia", "se", "UEFA"), n("Croatia", "Croácia", "hr", "UEFA"), n("Norway", "Noruega", "no", "UEFA"),
  n("Poland", "Polônia", "pl", "UEFA"), n("Serbia", "Sérvia", "rs", "UEFA"), n("Republic of Ireland", "Irlanda", "ie", "UEFA"),
  n("Austria", "Áustria", "at", "UEFA"), n("Greece", "Grécia", "gr", "UEFA"), n("Czechia", "Tchéquia", "cz", "UEFA"),
  n("Ukraine", "Ucrânia", "ua", "UEFA"), n("Romania", "Romênia", "ro", "UEFA"), n("Israel", "Israel", "il", "UEFA"),
  n("Wales", "País de Gales", "gb-wls", "UEFA"), n("Albania", "Albânia", "al", "UEFA"), n("Slovenia", "Eslovênia", "si", "UEFA"),
  n("Cyprus", "Chipre", "cy", "UEFA"), n("Hungary", "Hungria", "hu", "UEFA"), n("North Macedonia", "Macedônia do Norte", "mk", "UEFA"),
  n("Bosnia and Herzegovina", "Bósnia", "ba", "UEFA"), n("Montenegro", "Montenegro", "me", "UEFA"), n("Finland", "Finlândia", "fi", "UEFA"),
  n("Slovakia", "Eslováquia", "sk", "UEFA"), n("Kosovo", "Kosovo", "xk", "UEFA"), n("Northern Ireland", "Irlanda do Norte", "gb-nir", "UEFA"),
  n("Georgia", "Geórgia", "ge", "UEFA"), n("Iceland", "Islândia", "is", "UEFA"), n("Bulgaria", "Bulgária", "bg", "UEFA"),
  n("Russia", "Rússia", "ru", "UEFA", true), n("Armenia", "Armênia", "am", "UEFA"), n("Malta", "Malta", "mt", "UEFA"),
  n("Azerbaijan", "Azerbaijão", "az", "UEFA"), n("Luxembourg", "Luxemburgo", "lu", "UEFA"), n("Andorra", "Andorra", "ad", "UEFA"),
  n("Faroe Islands", "Ilhas Faroé", "fo", "UEFA"), n("Latvia", "Letônia", "lv", "UEFA"), n("Moldova", "Moldávia", "md", "UEFA"),
  // CONCACAF
  n("United States", "Estados Unidos", "us", "CONCACAF"), n("Mexico", "México", "mx", "CONCACAF"), n("Canada", "Canadá", "ca", "CONCACAF"),
  n("Jamaica", "Jamaica", "jm", "CONCACAF"), n("Panama", "Panamá", "pa", "CONCACAF"), n("Costa Rica", "Costa Rica", "cr", "CONCACAF"),
  n("Suriname", "Suriname", "sr", "CONCACAF"), n("Haiti", "Haiti", "ht", "CONCACAF"), n("Honduras", "Honduras", "hn", "CONCACAF"),
  n("Curaçao", "Curaçao", "cw", "CONCACAF"), n("Dominican Republic", "República Dominicana", "do", "CONCACAF"),
  n("Guatemala", "Guatemala", "gt", "CONCACAF"), n("Trinidad and Tobago", "Trinidad e Tobago", "tt", "CONCACAF"),
  n("El Salvador", "El Salvador", "sv", "CONCACAF"), n("Grenada", "Granada", "gd", "CONCACAF"),
  // CAF
  n("Morocco", "Marrocos", "ma", "CAF"), n("Côte d'Ivoire", "Costa do Marfim", "ci", "CAF"), n("Senegal", "Senegal", "sn", "CAF"),
  n("Nigeria", "Nigéria", "ng", "CAF"), n("Ghana", "Gana", "gh", "CAF"), n("Cameroon", "Camarões", "cm", "CAF"), n("Mali", "Mali", "ml", "CAF"),
  n("Congo DR", "RD Congo", "cd", "CAF"), n("Algeria", "Argélia", "dz", "CAF"), n("Egypt", "Egito", "eg", "CAF"), n("Tunisia", "Tunísia", "tn", "CAF"),
  n("Angola", "Angola", "ao", "CAF"), n("Burkina Faso", "Burkina Faso", "bf", "CAF"), n("Gabon", "Gabão", "ga", "CAF"),
  n("Cabo Verde", "Cabo Verde", "cv", "CAF"), n("South Africa", "África do Sul", "za", "CAF"), n("Guinea", "Guiné", "gn", "CAF"),
  n("Kenya", "Quênia", "ke", "CAF"), n("Guinea-Bissau", "Guiné-Bissau", "gw", "CAF"), n("Equatorial Guinea", "Guiné Equatorial", "gq", "CAF"),
  n("Mozambique", "Moçambique", "mz", "CAF"), n("The Gambia", "Gâmbia", "gm", "CAF"), n("Togo", "Togo", "tg", "CAF"),
  n("Zimbabwe", "Zimbábue", "zw", "CAF"), n("Zambia", "Zâmbia", "zm", "CAF"), n("Benin", "Benin", "bj", "CAF"),
  n("Mauritania", "Mauritânia", "mr", "CAF"), n("Comoros", "Comores", "km", "CAF"), n("Congo", "Congo", "cg", "CAF"),
  n("Uganda", "Uganda", "ug", "CAF"), n("Tanzania", "Tanzânia", "tz", "CAF"), n("Central African Rep.", "República Centro-Africana", "cf", "CAF"),
  n("Sierra Leone", "Serra Leoa", "sl", "CAF"), n("Madagascar", "Madagascar", "mg", "CAF"), n("Libya", "Líbia", "ly", "CAF"),
  n("Burundi", "Burundi", "bi", "CAF"), n("Chad", "Chade", "td", "CAF"),
  // AFC
  n("Japan", "Japão", "jp", "AFC"), n("Korea Republic", "Coreia do Sul", "kr", "AFC"), n("China PR", "China", "cn", "AFC"),
  n("Australia", "Austrália", "au", "AFC"), n("IR Iran", "Irã", "ir", "AFC"), n("Qatar", "Catar", "qa", "AFC"),
  n("Saudi Arabia", "Arábia Saudita", "sa", "AFC"), n("Malaysia", "Malásia", "my", "AFC"), n("Uzbekistan", "Uzbequistão", "uz", "AFC"),
  n("Syria", "Síria", "sy", "AFC"), n("Indonesia", "Indonésia", "id", "AFC"), n("United Arab Emirates", "Emirados Árabes", "ae", "AFC"),
  n("Iraq", "Iraque", "iq", "AFC"), n("Jordan", "Jordânia", "jo", "AFC"), n("Thailand", "Tailândia", "th", "AFC"),
  n("Hong Kong, China", "Hong Kong", "hk", "AFC"), n("Palestine", "Palestina", "ps", "AFC"), n("Philippines", "Filipinas", "ph", "AFC"),
  n("Oman", "Omã", "om", "AFC"), n("Bangladesh", "Bangladesh", "bd", "AFC"), n("Chinese Taipei", "Taipé Chinês", "tw", "AFC"),
  n("Korea DPR", "Coreia do Norte", "kp", "AFC"), n("Kyrgyz Republic", "Quirguistão", "kg", "AFC"), n("India", "Índia", "in", "AFC"),
  n("Vietnam", "Vietnã", "vn", "AFC"), n("Turkmenistan", "Turcomenistão", "tm", "AFC"),
  // OFC
  n("New Zealand", "Nova Zelândia", "nz", "OFC"),
];

const norm = (s: string) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const LOOKUP = new Map<string, Nation>();
NATIONS.forEach(x => { LOOKUP.set(norm(x.en), x); LOOKUP.set(norm(x.pt), x); });
// a few labels the squad data spells differently from the table above
[["Turkey", "Türkiye"], ["Ivory Coast", "Côte d'Ivoire"], ["Costa do Marfim", "Côte d'Ivoire"], ["South Korea", "Korea Republic"],
 ["Iran", "IR Iran"], ["USA", "United States"], ["Cape Verde", "Cabo Verde"], ["DR Congo", "Congo DR"], ["Czech Republic", "Czechia"],
 ["Gana", "Ghana"], ["Holanda", "Netherlands"], ["Países Baixos", "Netherlands"], ["Eslovaquia", "Slovakia"], ["China", "China PR"],
 ["Republica da Irlanda", "Republic of Ireland"], ["Irlanda", "Republic of Ireland"], ["Coreia", "Korea Republic"]]
  .forEach(([a, b]) => { const t = LOOKUP.get(norm(b)); if (t) LOOKUP.set(norm(a), t); });

export function nationOf(label: string): Nation | null { return LOOKUP.get(norm(label)) || null; }
export function nationByEn(en: string): Nation | null { return LOOKUP.get(norm(en)) || null; }
export const FLAG_CDN = "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/";
export function flagUrl(code: string): string { return FLAG_CDN + code + ".svg"; }

// ------------------------------------------------------------
// calendar of the tournament, in "days" since the whole league calendar stopped
// ------------------------------------------------------------
export function isWorldCupYear(year: number): boolean { return year >= 2026 && (year - 2026) % 4 === 0; }
export function nextWorldCupYear(fromYear: number): number { let y = Math.max(2026, fromYear); while (!isWorldCupYear(y)) y++; return y; }
export const WC_BREAK_ROUND = 16;            // the Brasileirão stops after this many rounds in a World Cup year
export const WC_SCHEDULE = [
  { key: "g1",    day: 1,  phase: "groups", md: 0, label: "Fase de Grupos · Rodada 1" },
  { key: "g2",    day: 4,  phase: "groups", md: 1, label: "Fase de Grupos · Rodada 2" },
  { key: "g3",    day: 6,  phase: "groups", md: 2, label: "Fase de Grupos · Rodada 3" },
  { key: "r32",   day: 9,  phase: "r32",    md: -1, label: "16-avos de final" },
  { key: "r16",   day: 11, phase: "r16",    md: -1, label: "Oitavas de final" },
  { key: "qf",    day: 14, phase: "qf",     md: -1, label: "Quartas de final" },
  { key: "sf",    day: 16, phase: "sf",     md: -1, label: "Semifinais" },
  { key: "third", day: 19, phase: "third",  md: -1, label: "Disputa do 3º lugar" },
  { key: "final", day: 21, phase: "final",  md: -1, label: "Final" },
];
export const WC_STAGE_LABEL: Record<string, string> = {
  g1: "Copa do Mundo — Fase de Grupos", g2: "Copa do Mundo — Fase de Grupos", g3: "Copa do Mundo — Fase de Grupos",
  r32: "Copa do Mundo — 16-avos de final", r16: "Copa do Mundo — Oitavas de final", qf: "Copa do Mundo — Quartas de final",
  sf: "Copa do Mundo — Semifinal", third: "Copa do Mundo — Disputa do 3º lugar", final: "Copa do Mundo — Final",
};
export const WC_PLACEMENT_RANK: Record<string, number> = { "Fase de Grupos": 1, "16-avos de final": 2, "Oitavas de final": 3, "Quartas de final": 4, "Semifinal": 5, "4º lugar": 6, "3º lugar": 6, "Vice-campeão": 7, "Campeão": 8 };
export const WC_REP: Record<string, number> = { "Campeão": 18, "Vice-campeão": 10, "3º lugar": 7, "4º lugar": 5, "Quartas de final": 3, "Oitavas de final": 1, "16-avos de final": 0, "Fase de Grupos": -3 };
export const WC_PRIZE: Record<string, number> = { "Campeão": 20_000_000, "Vice-campeão": 12_000_000, "3º lugar": 8_000_000, "4º lugar": 6_000_000, "Quartas de final": 4_000_000, "Oitavas de final": 2_000_000, "16-avos de final": 1_000_000, "Fase de Grupos": 0 };

// ------------------------------------------------------------
// hosts, qualification, draw
// ------------------------------------------------------------
export function hostsOf(year: number): string[] {
  if (year === 2026) return ["United States", "Mexico", "Canada"];
  if (year === 2030) return ["Spain", "Portugal", "Morocco", "Argentina", "Uruguay", "Paraguay"];
  if (year === 2034) return ["Saudi Arabia"];
  return [];
}
export const CONF_SLOTS: Record<Conf, number> = { UEFA: 16, CAF: 9, AFC: 8, CONMEBOL: 6, CONCACAF: 6, OFC: 1 };   // 46 + 2 playoff places = 48
export const FIELD_SIZE = 48;
export interface Cand { en: string; conf: Conf; strength: number; }
// nations with real World Cup pedigree get a head start in the qualifiers — the squad database is thin
// for some of them (few players on record), which would otherwise hand their places to minnows
const PEDIGREE = new Set([
  "Japan", "Korea Republic", "IR Iran", "Australia", "Saudi Arabia", "Qatar", "Uzbekistan", "Jordan", "Iraq", "United Arab Emirates",
  "Morocco", "Senegal", "Egypt", "Algeria", "Nigeria", "Côte d'Ivoire", "Tunisia", "Cameroon", "Ghana", "Mali", "Cabo Verde", "South Africa", "Congo DR", "Burkina Faso",
  "United States", "Mexico", "Canada", "Panama", "Jamaica", "Costa Rica", "Haiti", "Curaçao", "Honduras",
  "Brazil", "Argentina", "Uruguay", "Colombia", "Ecuador", "Paraguay", "Chile", "Peru",
  "New Zealand",
]);
function gauss(rng: () => number): number { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

// confederation slots + hosts + two playoff places, with a little noise so a favourite can stumble
export function qualify(year: number, cands: Cand[], rng: () => number): string[] {
  const pool = cands.filter(c => { const nn = nationByEn(c.en); return nn && !nn.banned; });
  const score = new Map<string, number>(); pool.forEach(c => score.set(c.en, c.strength + gauss(rng) * 2.0 + (PEDIGREE.has(c.en) ? 4 : 0)));
  const out: string[] = [];
  hostsOf(year).forEach(h => { if (pool.some(c => c.en === h) && !out.includes(h)) out.push(h); });
  (Object.keys(CONF_SLOTS) as Conf[]).forEach(conf => {
    const have = out.filter(en => pool.find(c => c.en === en)!.conf === conf).length;
    let left = CONF_SLOTS[conf] - have;
    pool.filter(c => c.conf === conf && !out.includes(c.en)).sort((a, b) => score.get(b.en)! - score.get(a.en)!).forEach(c => { if (left > 0) { out.push(c.en); left--; } });
  });
  pool.filter(c => !out.includes(c.en)).sort((a, b) => score.get(b.en)! - score.get(a.en)!).forEach(c => { if (out.length < FIELD_SIZE) out.push(c.en); });
  return out.slice(0, FIELD_SIZE);
}

export const GROUP_LETTERS = "ABCDEFGHIJKL".split("");
export interface DrawTeam { en: string; conf: Conf; strength: number; }
// 4 pots of 12 (hosts always in pot 1), one team per pot per group, never two teams of the same
// confederation in a group — except UEFA, which may have two.
export function drawGroups(teams: DrawTeam[], hosts: string[], rng: () => number): Record<string, string[]> {
  const byStrength = teams.slice().sort((a, b) => b.strength - a.strength);
  const isHost = (t: DrawTeam) => hosts.includes(t.en);
  const pot1 = byStrength.filter(isHost).concat(byStrength.filter(t => !isHost(t))).slice(0, 12);
  const rest = byStrength.filter(t => !pot1.includes(t));
  const pots = [pot1, rest.slice(0, 12), rest.slice(12, 24), rest.slice(24, 36)];
  const shuffle = <T,>(a: T[]) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  for (let attempt = 0; attempt < 400; attempt++) {
    const groups: DrawTeam[][] = GROUP_LETTERS.map(() => []);
    let ok = true;
    const relaxed = attempt >= 350;
    for (let p = 0; p < pots.length && ok; p++) {
      for (const t of shuffle(pots[p])) {
        const cand = groups.map((g, i) => i).filter(i => groups[i].length === p && (relaxed || groups[i].filter(x => x.conf === t.conf).length < (t.conf === "UEFA" ? 2 : 1)));
        if (!cand.length) { ok = false; break; }
        groups[cand[Math.floor(rng() * cand.length)]].push(t);
      }
    }
    if (ok) { const res: Record<string, string[]> = {}; groups.forEach((g, i) => { res[GROUP_LETTERS[i]] = shuffle(g).map(t => t.en); }); return res; }
  }
  const res: Record<string, string[]> = {};   // unreachable in practice: plain snake draw
  GROUP_LETTERS.forEach((l, i) => { res[l] = pots.map(p => p[i]).filter(Boolean).map(t => t.en); });
  return res;
}

// 4 teams -> 3 matchdays of 2 matches
export function groupMatchdays(g: string[]): [string, string][][] {
  return [[[g[0], g[1]], [g[2], g[3]]], [[g[0], g[2]], [g[3], g[1]]], [[g[3], g[0]], [g[1], g[2]]]];
}

// ------------------------------------------------------------
// knockout tree (the real 2026 one)
// ------------------------------------------------------------
// "1E" = winner of group E, "2B" = runner-up of group B, "3:ABCDF" = a third-placed team from one of those groups
export const R32_SLOTS: { id: number; a: string; b: string }[] = [
  { id: 73, a: "2A", b: "2B" }, { id: 74, a: "1E", b: "3:ABCDF" }, { id: 75, a: "1F", b: "2C" }, { id: 76, a: "1C", b: "2F" },
  { id: 77, a: "1I", b: "3:CDFGH" }, { id: 78, a: "2E", b: "2I" }, { id: 79, a: "1A", b: "3:CEFHI" }, { id: 80, a: "1L", b: "3:EHIJK" },
  { id: 81, a: "1D", b: "3:BEFIJ" }, { id: 82, a: "1G", b: "3:AEHIJ" }, { id: 83, a: "2K", b: "2L" }, { id: 84, a: "1H", b: "2J" },
  { id: 85, a: "1B", b: "3:EFGIJ" }, { id: 86, a: "1J", b: "2H" }, { id: 87, a: "1K", b: "3:DEIJL" }, { id: 88, a: "2D", b: "2G" },
];
// [match id, feeder A, feeder B] — winners of the feeders play
export const KO_TREE: Record<string, [number, number, number][]> = {
  r16: [[89, 74, 77], [90, 73, 75], [91, 76, 78], [92, 79, 80], [93, 83, 84], [94, 81, 82], [95, 86, 88], [96, 85, 87]],
  qf: [[97, 89, 90], [98, 93, 94], [99, 91, 92], [100, 95, 96]],
  sf: [[101, 97, 98], [102, 99, 100]],
  final: [[104, 101, 102]],
};
export const THIRD_MATCH_ID = 103;

// assigns the 8 qualified third-placed groups to the 8 slots that take a third (a perfect matching;
// FIFA's own table guarantees one exists)
export function assignThirds(groups: string[]): Record<number, string> {
  const slots = R32_SLOTS.filter(s => s.b.startsWith("3:"));
  const res: Record<number, string> = {};
  const used = new Set<string>();
  const go = (i: number): boolean => {
    if (i === slots.length) return true;
    const allowed = slots[i].b.slice(2).split("");
    for (const g of groups) {
      if (used.has(g) || !allowed.includes(g)) continue;
      used.add(g); res[slots[i].id] = g;
      if (go(i + 1)) return true;
      used.delete(g); delete res[slots[i].id];
    }
    return false;
  };
  if (!go(0)) {   // never expected — fall back to any free group
    const free = groups.slice(); slots.forEach(s => { res[s.id] = free.shift() || groups[0]; });
  }
  return res;
}

// ------------------------------------------------------------
// squads: 26 players, born in the country
// ------------------------------------------------------------
export const SQUAD_SIZE = 26;
export interface PosGroup { id: string; label: string; short: string; need: number; pos: string[]; }
export const POS_GROUPS: PosGroup[] = [
  { id: "gk",  label: "Goleiros",  short: "GOL", need: 3, pos: ["GK"] },
  { id: "cb",  label: "Zagueiros", short: "ZAG", need: 4, pos: ["CB"] },
  { id: "fb",  label: "Laterais",  short: "LAT", need: 4, pos: ["LB", "RB"] },
  { id: "dm",  label: "Volantes",  short: "VOL", need: 3, pos: ["DMF"] },
  { id: "mid", label: "Meias",     short: "MEI", need: 4, pos: ["CM", "AM"] },
  { id: "wg",  label: "Pontas",    short: "PON", need: 3, pos: ["LW", "RW", "LM", "RM"] },
  { id: "st",  label: "Atacantes", short: "ATA", need: 3, pos: ["ST", "SS"] },
];
export const FREE_SLOTS = SQUAD_SIZE - POS_GROUPS.reduce((a, g) => a + g.need, 0);   // 2 "coringas"
export function posGroupOf(pos: string): string {
  const g = POS_GROUPS.find(x => x.pos.includes(pos));
  return g ? g.id : "mid";
}
export function countByGroup(players: any[]): Record<string, number> {
  const c: Record<string, number> = {}; POS_GROUPS.forEach(g => c[g.id] = 0);
  players.forEach(p => { c[posGroupOf(p.pos)]++; });
  return c;
}
// the call-up is valid when every position group has at least its quota (or every available
// player of that group) and the list has 26 players (or the whole pool, for tiny nations)
export function callupProblems(selected: any[], pool: any[]): string[] {
  const out: string[] = [];
  const have = countByGroup(selected), avail = countByGroup(pool);
  POS_GROUPS.forEach(g => { const need = Math.min(g.need, avail[g.id]); if (have[g.id] < need) out.push(`${g.label}: faltam ${need - have[g.id]}`); });
  const total = Math.min(SQUAD_SIZE, pool.length);
  if (selected.length < total) out.push(`Faltam ${total - selected.length} jogador(es) para fechar os ${total}`);
  if (selected.length > SQUAD_SIZE) out.push(`Máximo de ${SQUAD_SIZE} convocados`);
  return out;
}
// best squad from a pool: quotas first (best of each group — keeping the laterais balanced between
// left and right), then the best remaining outfield players for the free places. `keep` = players
// already picked by the manager. `fillers` lists the positions the pool couldn't cover.
export function autoSelectSquad(pool: any[], keep: number[] = []): { ids: number[]; fillers: string[] } {
  const byOvr = (a: any, b: any) => (b.ovr - a.ovr) || ((b.pot || 0) - (a.pot || 0));
  const sorted = pool.slice().sort(byOvr);
  const chosen: any[] = [];
  const has = new Set<number>();
  const take = (p: any) => { if (p && !has.has(p.id) && chosen.length < SQUAD_SIZE) { chosen.push(p); has.add(p.id); } };
  keep.forEach(id => take(sorted.find(p => p.id === id)));
  const fillers: string[] = [];
  POS_GROUPS.forEach(g => {
    let have = chosen.filter(p => posGroupOf(p.pos) === g.id).length;
    while (have < g.need) {
      const cands = sorted.filter(p => !has.has(p.id) && posGroupOf(p.pos) === g.id);
      let pick = cands[0];
      if (g.id === "fb" && cands.length) {   // balance LB / RB
        const lb = chosen.filter(p => p.pos === "LB").length, rb = chosen.filter(p => p.pos === "RB").length;
        const want = lb <= rb ? "LB" : "RB";
        pick = cands.find(p => p.pos === want) || cands[0];
      }
      if (!pick) { fillers.push(g.id === "fb" ? (chosen.filter(p => p.pos === "LB").length <= chosen.filter(p => p.pos === "RB").length ? "LB" : "RB") : g.pos[0]); have++; continue; }
      take(pick); have++;
    }
  });
  sorted.filter(p => !has.has(p.id) && p.pos !== "GK").forEach(p => take(p));
  while (chosen.length + fillers.length < SQUAD_SIZE) fillers.push("CM");   // pool too small: pad with local players
  return { ids: chosen.map(p => p.id), fillers };
}
// strength of a 26-man list: the number one goalkeeper + the ten best outfielders
export function squadStrength(players: any[]): number {
  const gk = players.filter(p => p.pos === "GK").map(p => p.ovr).sort((a, b) => b - a)[0] || 55;
  const out = players.filter(p => p.pos !== "GK").map(p => p.ovr).sort((a, b) => b - a).slice(0, 10);
  while (out.length < 10) out.push(52);
  return (gk + out.reduce((a, b) => a + b, 0)) / 11;
}
