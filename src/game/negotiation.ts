// ============================================================
// NEGOTIATION ENGINE — pure maths, no game state, no DOM.
//
// Every transfer negotiation (the manager buying a player, or another club bidding for one of
// the manager's players) is decided HERE, by numbers. The text the director "says" is only a
// rendering of the decision (see composeReply) — it can never contradict it.
//
// The AI side always has:
//   target  T   what it hopes to get (seller: the asking price; buyer: its current bid)
//   limit   L   the worst price it would still close at (seller: reservation price; buyer: its ceiling)
// and the user's number x is scored on a normalised scale:
//   u = (x - L) / (T - L)       u>=1: at least the target · u=0: exactly the limit · u<0: past the limit
//   e = distance past the limit, as a fraction of the price (0 while still inside the limit)
// ============================================================

export const NEG_CONFIG = {
  startMood: 70,          // every negotiation opens with the director at 70/100
  maxRounds: 8,           // counter-offer rounds before the club makes a final call (configurable)
  nearFraction: 0.004,    // |x - target| below this share of the price is "the same number"
  nearMin: 15000,         // ...and never less than this many dollars of slack
  absurdGap: 0.4,         // past-the-limit gap that counts as an absurd lowball / overreach
};

export type Role = "seller" | "buyer";     // role of the AI club in this negotiation
export type Verdict = "accept" | "accept_conditions" | "counter_small" | "counter_moderate" | "counter_high" | "refuse" | "end";

export interface NegState {
  mood: number;           // 0..100, persists for the whole negotiation
  round: number;          // user proposals made so far
  prevX: number | null;   // user's previous number
  now: number;            // AI's current position (seller: its ask; buyer: its bid)
  lastVerdict: Verdict | null;
  lastClosePrice: number | null;
  absurd: number;         // how many absurd proposals so far
  stalled: number;        // consecutive proposals that did not move toward the AI
  ended: boolean;
}
export function newNegState(now: number): NegState {
  return { mood: NEG_CONFIG.startMood, round: 0, prevX: null, now, lastVerdict: null, lastClosePrice: null, absurd: 0, stalled: 0, ended: false };
}

// ---------- flexibility ----------
export interface FlexInput {
  financeNeed: number;     // -1 (rich, no need to sell) .. +1 (in debt, must sell)
  keyPlayer: boolean;      // the club's main man / clear starter
  substitutes: number;     // how many equivalent players cover his position
  age: number;
  ovr: number;
  pot: number;
  contractYears: number;   // years left on his contract
  rivalInterest: number;   // 0..1: other clubs chasing him
  mustSell?: number;       // 0..1 extra urgency (e.g. squad-clearing)
}
export interface FlexResult { flex: number; parts: Record<string, number>; }
// Not a fixed percentage: each club/player gets its own tolerance, between 3% and 24% of the asking price.
export function computeFlex(i: FlexInput): FlexResult {
  const parts: Record<string, number> = {};
  parts.base = 0.09;
  parts.finance = 0.05 * i.financeNeed;                       // indebted clubs bend, rich clubs hold out
  parts.urgency = 0.04 * (i.mustSell || 0);
  parts.key = i.keyPlayer ? -0.025 : 0;                       // depends on him: asks more
  parts.depth = i.keyPlayer ? 0 : Math.min(0.045, i.substitutes * 0.02);   // reserve with cover: accepts less
  parts.age = i.age >= 33 ? 0.045 : i.age >= 30 ? 0.03 : i.age >= 28 ? 0.01 : (i.age <= 21 && i.pot - i.ovr >= 10) ? -0.035 : i.age <= 23 && i.pot - i.ovr >= 8 ? -0.015 : 0;
  parts.quality = i.ovr >= 84 ? -0.02 : i.ovr >= 80 ? -0.01 : 0;
  parts.contract = i.contractYears <= 1 ? 0.045 : i.contractYears === 2 ? 0.015 : i.contractYears >= 4 ? -0.025 : 0;
  parts.rivals = -0.03 * Math.max(0, Math.min(1, i.rivalInterest));
  let flex = 0; for (const k in parts) flex += parts[k];
  return { flex: Math.max(0.03, Math.min(0.24, flex)), parts };
}

// ---------- helpers ----------
export function roundMoney(v: number): number {
  const step = v >= 2_000_000 ? 5000 : v >= 200_000 ? 1000 : 500;
  return Math.max(step, Math.round(v / step) * step);
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function moodBand(m: number): { id: string; label: string; color: string } {
  if (m >= 81) return { id: "great", label: "Muito satisfeito", color: "#4ade80" };
  if (m >= 61) return { id: "calm", label: "Tranquilo", color: "#a3e635" };
  if (m >= 41) return { id: "unhappy", label: "Insatisfeito", color: "#facc15" };
  if (m >= 21) return { id: "angry", label: "Irritado", color: "#fb923c" };
  return { id: "furious", label: "Furioso", color: "#ef4444" };
}

// ---------- the decision ----------
export interface DecideInput {
  role: Role;
  x: number;              // the user's number (an offer when the AI sells, an ask when the AI buys)
  target: number;         // T — seller: asking price · buyer: current bid
  limit: number;          // L — seller: reservation price (ask minus tolerance) · buyer: ceiling
  flexMood?: boolean;     // let the director's mood tighten/loosen the limit slightly (default true)
  angerMult?: number;     // personality: >1 gets angry faster
  acceptMult?: number;    // personality: >1 pleased faster
  maxRounds?: number;
}
export interface Decision {
  verdict: Verdict;
  accepted: boolean;      // the deal closes now
  price: number | null;   // the price it closes at (accept / accept_conditions via closePrice)
  counter: number | null; // AI's new position
  closePrice: number | null; // accept_conditions: the price the club will sign at right now
  mood: number; moodDelta: number;
  u: number; e: number;
  ended: boolean;
  state: NegState;
}

export function decide(inp: DecideInput, st0: NegState): Decision {
  const st: NegState = { ...st0 };
  const cfg = NEG_CONFIG;
  const sign = inp.role === "seller" ? 1 : -1;            // +1: higher x is better for the AI
  const T = inp.target;
  const mf = inp.flexMood === false ? 1 : 0.8 + 0.4 * (st.mood / 100);     // an irritated director is a bit stingier
  // the limit moves with mood: stretch the gap between target and limit by `mf`
  const L = T - (T - inp.limit) * mf;
  const span = Math.max(Math.abs(T - L), T * 0.02);
  const x = inp.x;
  const u = sign * (x - L) / span;
  const e = Math.max(0, sign * (L - x)) / Math.max(1, inp.role === "seller" ? T : L);   // how far past the limit, as a share of the price
  const near = Math.max(T * cfg.nearFraction, cfg.nearMin);
  const anger = inp.angerMult || 1, pleased = inp.acceptMult || 1;
  const maxRounds = inp.maxRounds || cfg.maxRounds;
  st.round += 1;

  // meeting the club's standing position (its opening number, or its latest counter) closes the deal
  const atOrBetterThanTarget = sign * (x - st.now) >= -near || sign * (x - T) >= -near;

  let verdict: Verdict;
  if (atOrBetterThanTarget || u >= 0.95) verdict = "accept";
  else if (st.lastVerdict === "accept_conditions" && st.prevX != null && sign * (x - st.prevX) >= 0 && u >= 0.3) verdict = "accept"; // insisted on a number the club had already liked
  else if (u >= 0.5) verdict = "accept_conditions";
  else if (u >= 0) verdict = "counter_small";
  else if (e <= 0.10) verdict = "counter_moderate";
  else if (e <= 0.30) verdict = "counter_high";
  else verdict = "refuse";

  // movement of the user's number since last round, toward what the AI wants
  const moved = st.prevX == null ? 0 : sign * (x - st.prevX) / Math.max(1, T);
  const absurd = e > cfg.absurdGap;

  // ---- mood ----
  let d: number;
  switch (verdict) {
    case "accept": d = 10; break;
    case "accept_conditions": d = 6; break;
    case "counter_small": d = 2; break;
    case "counter_moderate": d = -1 - e * 30; break;
    case "counter_high": d = -5 - (e - 0.10) * 40; break;
    default: d = -12 - Math.max(0, e - 0.30) * 35 - (absurd ? 5 : 0);
  }
  if (moved > 0) d += Math.min(10, moved * 100 * 1.2);                    // a better proposal wins the director back
  else if (st.prevX != null && verdict !== "accept" && verdict !== "accept_conditions") d -= 4 + 3 * Math.min(3, st.stalled);   // insisting on the same bad number
  if (d < 0) d = Math.max(-50, d * anger); else d = d * pleased;   // one proposal can sour the director a lot, never wipe the bar out
  if (u >= 0 || e <= 0.02) d = Math.max(d, -2);                            // small differences never cause a big drop
  d = Math.round(d);
  st.mood = clamp(Math.round(st.mood + d), 0, 100);
  st.stalled = moved > 0 || st.prevX == null ? 0 : st.stalled + 1;
  if (absurd) st.absurd += 1;

  // ---- ending: only for a real reason ----
  let ended = false;
  if ((st.mood <= 8 && st.absurd >= 3) || (st.mood <= 4 && st.stalled >= 3 && verdict !== "accept" && verdict !== "accept_conditions")) ended = true;
  else if (st.round > maxRounds && verdict !== "accept" && verdict !== "accept_conditions") {
    // last round: a close number still closes; a far one ends the talks politely
    if (u >= -0.35 || e <= 0.03) verdict = "accept_conditions"; else ended = true;
  }
  if (ended) verdict = "end";

  // ---- the club's new position ----
  const round5 = roundMoney;
  let counter: number | null = null, closePrice: number | null = null, price: number | null = null;
  const nowPos = st.now;
  if (verdict === "accept") { price = Math.round(inp.role === "seller" ? Math.min(x, nowPos) : x); }   // never charges above what the club itself asked
  else if (verdict === "accept_conditions") {
    // signs now, but wants a small adjustment (instalments / performance bonus) that nudges the price toward its position
    closePrice = round5(x + (nowPos - x) * 0.15);
    if (inp.role === "seller") closePrice = Math.min(closePrice, nowPos); else closePrice = Math.max(closePrice, nowPos);
    counter = closePrice;
    st.now = closePrice;
  } else if (verdict === "counter_small" || verdict === "counter_moderate" || verdict === "counter_high") {
    const k = verdict === "counter_small" ? 0.55 : verdict === "counter_moderate" ? 0.75 : 0.9;     // how much of the way it keeps
    if (inp.role === "seller") counter = round5(Math.max(L, x + (nowPos - x) * k));
    else counter = round5(Math.min(L, nowPos + (Math.min(x, L) - nowPos) * (1 - k)));
    // the club never moves backwards — and if the user just repeated (or worsened) his number, it holds its position
    if (inp.role === "seller") counter = Math.min(counter, nowPos); else counter = Math.max(counter, nowPos);
    if (st.prevX != null && moved <= 0) counter = nowPos;
    st.now = counter;
  }
  st.prevX = x;
  st.lastVerdict = verdict;
  st.lastClosePrice = closePrice;
  st.ended = ended;
  return { verdict, accepted: verdict === "accept", price, counter, closePrice, mood: st.mood, moodDelta: d, u, e, ended, state: st };
}

// ---------- director's words — only ever a rendering of the decision ----------
const pick = (arr: string[], n: number) => arr[Math.abs(n) % arr.length];
export interface ReplyCtx { player: string; club: string; fmt: (v: number) => string; role: Role; seed?: number; }

export function moodLine(m: number, ended?: boolean): string {
  if (m < 10 && !ended) return "Estamos perdendo a paciência com essa negociação.";   // "no more interest" is only said when the talks really end
  if (m >= 90) return "Excelente, estamos chegando a um acordo!";
  if (m >= 65) return "Estamos satisfeitos com sua proposta.";
  if (m >= 45) return "Esperávamos um pouco mais.";
  if (m >= 25) return "Essa oferta está distante do que queremos.";
  if (m >= 10) return "Estamos perdendo a paciência com essa negociação.";
  return "Não temos mais interesse em continuar conversando.";
}
export function moodSummary(m: number): string {
  if (m >= 81) return "O diretor está muito satisfeito com o andamento da negociação.";
  if (m >= 61) return "O diretor está satisfeito com o andamento da negociação.";
  if (m >= 41) return "O diretor está insatisfeito, mas ainda quer conversar.";
  if (m >= 21) return "O diretor está irritado — melhore a proposta.";
  return "O diretor está furioso e perto de abandonar a mesa.";
}

export function composeReply(dec: Decision, c: ReplyCtx): string {
  const n = (c.seed || 0) + dec.state.round;
  const f = c.fmt;
  const ml = moodLine(dec.mood, dec.verdict === "end");
  switch (dec.verdict) {
    case "accept":
      return pick(c.role === "seller"
        ? [`Fechado. ${f(dec.price!)} por ${c.player} é um bom negócio — vamos formalizar.`, `Negócio feito: ${c.player} por ${f(dec.price!)}.`]
        : [`Aceitamos: ${c.player} por ${f(dec.price!)}. Vamos preparar o contrato.`, `Combinado, ${f(dec.price!)} está bom para nós. ${c.player} é seu.`], n);
    case "accept_conditions":
      return pick([`Estamos praticamente de acordo. Para fechar, pedimos pagamento com bônus por metas e um pequeno ajuste: ${f(dec.closePrice!)}.`, `A proposta é boa. Só precisamos ajustar parcelas e bônus — fechamos por ${f(dec.closePrice!)}.`], n);
    case "counter_small":
      return pick([`Estamos perto. ${ml} Que tal ${f(dec.counter!)}?`, `Falta pouco para um acordo. Chegamos a ${f(dec.counter!)}.`], n);
    case "counter_moderate":
      return pick([`${ml} Podemos conversar a partir de ${f(dec.counter!)}.`, `Está um pouco abaixo do que esperávamos. Nossa contraproposta: ${f(dec.counter!)}.`], n);
    case "counter_high":
      return pick([`${ml} Para continuar, precisamos de algo próximo de ${f(dec.counter!)}.`, `A proposta ainda está distante. Só avançamos perto de ${f(dec.counter!)}.`], n);
    case "refuse":
      return pick([`${ml} Esse valor é incompatível com o que consideramos razoável — apresente algo mais sério.`, `Não conseguimos trabalhar com esse número. Faça uma nova proposta.`], n);
    default:
      return pick([`${ml} Encerramos as conversas por aqui.`, `A diretoria decidiu encerrar a negociação por ${c.player}.`], n);
  }
}
