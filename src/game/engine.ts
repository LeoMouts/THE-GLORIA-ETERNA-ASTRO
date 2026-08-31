// ============================================================
// LIBERTADORES MANAGER — CORE ENGINE (pure functions, no DOM)
// ============================================================

const POS_GROUP = {
  GK: "GK",
  CB: "DEF", LB: "DEF", RB: "DEF",
  DMF: "MID", CM: "MID", AM: "MID", LM: "MID", RM: "MID",
  LW: "ATT", RW: "ATT", SS: "ATT", ST: "ATT",
};

const FORMATIONS = {
  "4-3-3": ["GK", "LB", "CB", "CB", "RB", "DMF", "CM", "AM", "LW", "ST", "RW"],
  "4-4-2": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
  "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "DMF", "DMF", "AM", "LW", "RW", "ST"],
  "3-5-2": ["GK", "CB", "CB", "CB", "LM", "DMF", "CM", "AM", "RM", "ST", "ST"],
  "5-3-2": ["GK", "LB", "CB", "CB", "CB", "RB", "CM", "CM", "AM", "ST", "ST"],
};

function rand(seedObj) {
  // xorshift32 seeded RNG wrapper -> returns function () => [0,1)
  let x = seedObj.seed || 123456789;
  return function () {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    x = x >>> 0;
    seedObj.seed = x;
    return x / 4294967296;
  };
}

function makeRNG(seed) {
  // hash the seed first so small ints (1,2,3...) don't produce a biased first draw
  let h = (seed >>> 0) || 1;
  h ^= h << 13; h = (h * 2654435761) >>> 0;
  h ^= h >>> 16; h = (h * 2246822519) >>> 0;
  h ^= h << 5; h = h >>> 0;
  const s = { seed: h || 987654321 };
  const fn = rand(s);
  // warm up
  fn(); fn(); fn();
  return fn;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function choice(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function weightedChoice(rng, items, weightFn) {
  const total = items.reduce((a, it) => a + weightFn(it), 0);
  let r = rng() * total;
  for (const it of items) {
    r -= weightFn(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

// ------------------------------------------------------------
// Player value / aging
// ------------------------------------------------------------
function calcValue(ovr, age, pot) {
  const base = ovr <= 44 ? 25000 : Math.pow(1.20, ovr - 44) * 11000;
  let ageF;
  if (age <= 20) ageF = 1.75;
  else if (age <= 23) ageF = 1.5;
  else if (age <= 27) ageF = 1.2;
  else if (age <= 30) ageF = 0.85;
  else if (age <= 33) ageF = 0.5;
  else ageF = 0.22;
  const potF = 1 + Math.max(0, pot - ovr) * 0.05;
  const val = base * ageF * potF;
  return Math.max(20000, Math.round(val / 5000) * 5000);
}

function ageOnePlayer(p, rng) {
  p.age += 1;
  // growth/decline curve
  let delta = 0;
  if (p.age <= 20) {
    // close a real, potential-proportional chunk of the remaining gap each season —
    // a wonderkid with a big room-to-grow closes it much faster than a marginal prospect.
    const room = p.pot - p.ovr;
    delta = room > 0 ? Math.round(room * (0.18 + rng() * 0.14)) : 0;
  } else if (p.age <= 24) {
    const room = p.pot - p.ovr;
    delta = room > 0 ? Math.round(room * (0.14 + rng() * 0.12)) : 0;
  } else if (p.age <= 27) {
    // growth tapers out through the late 20s instead of hard-stopping at 23, so a late
    // bloomer still closes in on their ceiling before the prime plateau below.
    const room = p.pot - p.ovr;
    delta = room > 0 ? Math.round(room * (0.08 + rng() * 0.10)) : 0;
  } else if (p.age <= 31) {
    delta = Math.round((rng() - 0.5) * 2); // -1..1 noise — overs hold steady through the prime, up to 31
  } else if (p.age <= 34) {
    delta = -Math.round(rng() * 2); // decline starts at 32
  } else {
    delta = -Math.round(1 + rng() * 3); // faster decline from 35 onward, into the retirement window
  }
  p.ovr = clamp(p.ovr + delta, 40, 94);
  p.pot = Math.max(p.pot, p.ovr);
  p.value = calcValue(p.ovr, p.age, p.pot);
  return p;
}

// ------------------------------------------------------------
// Team strength ratings for a given lineup (array of player objs in formation order)
// ------------------------------------------------------------
function ratePlayerInSlot(p, slotPos) {
  let mult = 1;
  if (p.pos === slotPos) mult = 1;
  else if (p.altPos && p.altPos.includes(slotPos)) mult = 0.93;
  else if (POS_GROUP[p.pos] === POS_GROUP[slotPos]) mult = 0.85;
  else mult = 0.68;
  const fatigue = p.fatigue || 0;
  const formBonus = (p.form || 0) * 0.6;
  return { effOvr: clamp(p.ovr * mult - fatigue + formBonus, 20, 99), mult };
}

function teamRatings(lineupPlayers, slots) {
  // lineupPlayers: array aligned with slots (formation position order)
  let att = 0, def = 0, mid = 0, gk = 0, n = 0;
  lineupPlayers.forEach((p, i) => {
    if (!p) return;
    const slot = slots[i];
    const { effOvr } = ratePlayerInSlot(p, slot);
    const grp = POS_GROUP[slot];
    if (grp === "GK") gk = effOvr;
    else if (grp === "DEF") def += effOvr;
    else if (grp === "MID") mid += effOvr;
    else att += effOvr;
    n++;
  });
  const defCount = slots.filter(s => POS_GROUP[s] === "DEF").length || 1;
  const midCount = slots.filter(s => POS_GROUP[s] === "MID").length || 1;
  const attCount = slots.filter(s => POS_GROUP[s] === "ATT").length || 1;
  return {
    att: att / attCount,
    mid: mid / midCount,
    def: def / defCount,
    gk: gk || 55,
    overall: (att / attCount * 1.05 + mid / midCount + def / defCount * 0.95 + gk * 0.5) / 3.5,
  };
}

// ------------------------------------------------------------
// MATCH SIMULATION (detailed, event-based) — used for user's matches
// ------------------------------------------------------------
function simulateDetailedMatch(homeTeam, awayTeam, homeLineup, awayLineup, slotsHome, opts, slotsAwayArg) {
  opts = opts || {};
  // allow either simulateDetailedMatch(..., slotsHome, opts, slotsAway) or legacy single-slots call
  const slotsAway = slotsAwayArg || slotsHome;
  const slots = slotsHome; // used for home-side classification
  const rng = makeRNG(opts.seed || Math.floor(Math.random() * 1e9));
  const rA = teamRatings(homeLineup, slotsHome);
  const rB = teamRatings(awayLineup, slotsAway);

  const homeAdv = opts.neutral ? 0 : 3.5;
  const attHome = rA.att + rA.mid * 0.35 + homeAdv;
  const attAway = rB.att + rB.mid * 0.35;
  const defHome = rA.def + rA.gk * 0.4;
  const defAway = rB.def + rB.gk * 0.4;

  // expected "chances" count per team over 90 minutes
  const baseChances = 9;
  const chancesHome = clamp(baseChances * (1 + (attHome - defAway) / 60), 3, 16);
  const chancesAway = clamp(baseChances * (1 + (attAway - defHome) / 60), 2, 15);

  const events = [];
  const stats = { home: { shots: 0, onTarget: 0, goals: 0, yellow: 0, red: 0 },
                   away: { shots: 0, onTarget: 0, goals: 0, yellow: 0, red: 0 } };
  const ratingAcc = {}; // playerId -> {sum, n}
  function bump(pid, v) {
    if (!ratingAcc[pid]) ratingAcc[pid] = { sum: 6.4, n: 1 };
    ratingAcc[pid].sum += v; ratingAcc[pid].n += 1;
  }

  function slotsFor(lineup) { return lineup === homeLineup ? slotsHome : slotsAway; }
  function attackersOf(lineup) {
    const sl = slotsFor(lineup);
    return lineup.filter((p, i) => p && (POS_GROUP[sl[i]] === "ATT" || POS_GROUP[sl[i]] === "MID"));
  }
  function midfieldersOf(lineup) {
    const sl = slotsFor(lineup);
    return lineup.filter((p, i) => p && POS_GROUP[sl[i]] === "MID");
  }
  function gkOf(lineup) {
    const sl = slotsFor(lineup);
    const idx = sl.indexOf("GK");
    return lineup[idx];
  }
  function defendersOf(lineup) {
    const sl = slotsFor(lineup);
    return lineup.filter((p, i) => p && POS_GROUP[sl[i]] === "DEF");
  }

  function genMinuteList(count) {
    const mins = [];
    for (let i = 0; i < count; i++) mins.push(Math.floor(rng() * 90) + 1);
    return mins.sort((a, b) => a - b);
  }

  const homeChanceMinutes = genMinuteList(Math.round(chancesHome));
  const awayChanceMinutes = genMinuteList(Math.round(chancesAway));

  function processChance(minute, side, atkLineup, defLineup, atkOvr, defOvr, gkPlayer) {
    const atkPlayers = attackersOf(atkLineup);
    if (atkPlayers.length === 0) return;
    const shooter = weightedChoice(rng, atkPlayers, p => Math.pow(1.03, p.sho || p.ovr));
    stats[side].shots++;
    const onTargetChance = clamp(0.35 + (atkOvr - defOvr) / 140, 0.15, 0.75);
    const onTarget = rng() < onTargetChance;
    if (!onTarget) {
      events.push({ minute, side, type: "miss", player: shooter.name });
      bump(shooter.id, 0.05);
      return;
    }
    stats[side].onTarget++;
    const gkSkill = gkPlayer ? (gkPlayer.gk || gkPlayer.ovr) : 55;
    const finishSkill = shooter.sho || shooter.ovr;
    const goalChance = clamp(0.28 + (finishSkill - gkSkill) / 130, 0.10, 0.62);
    const isGoal = rng() < goalChance;
    if (isGoal) {
      stats[side].goals++;
      let assister = null;
      if (rng() < 0.68) {
        const mids = midfieldersOf(atkLineup).concat(attackersOf(atkLineup)).filter(p => p.id !== shooter.id);
        if (mids.length) assister = weightedChoice(rng, mids, p => Math.pow(1.02, p.pas || p.ovr));
      }
      events.push({ minute, side, type: "goal", player: shooter.name, assist: assister ? assister.name : null });
      bump(shooter.id, 2.4);
      if (assister) bump(assister.id, 1.1);
      if (gkPlayer) bump(gkPlayer.id, -0.5);
    } else {
      const saved = rng() < 0.55;
      if (saved && gkPlayer) {
        events.push({ minute, side, type: "save", player: shooter.name, gk: gkPlayer.name });
        bump(gkPlayer.id, 0.55);
        bump(shooter.id, -0.05);
      } else {
        events.push({ minute, side, type: "block", player: shooter.name });
        bump(shooter.id, 0.0);
      }
    }
  }

  homeChanceMinutes.forEach(m => processChance(m, "home", homeLineup, awayLineup, attHome, defAway, gkOf(awayLineup)));
  awayChanceMinutes.forEach(m => processChance(m, "away", awayLineup, homeLineup, attAway, defHome, gkOf(homeLineup)));

  // Penalties — rare, roughly matching real-world frequency. Left UNRESOLVED here on purpose:
  // the caller resolves the kick live (interactive taker pick for the human side, an immediate
  // auto-pick for the other) via resolvePenaltyKick, instead of the outcome being baked in
  // before the player ever sees the match.
  function rollPenalty(side, atkOvr, defOvr) {
    const chance = clamp(0.07 + (atkOvr - defOvr) / 900, 0.03, 0.14);
    if (rng() < chance) {
      const minute = Math.floor(rng() * 90) + 1;
      events.push({ minute, side, type: "penalty_pending" });
    }
  }
  rollPenalty("home", attHome, defAway);
  rollPenalty("away", attAway, defHome);

  // Cards
  function rollCards(side, lineup) {
    const n = lineup.filter(Boolean).length;
    for (let i = 0; i < n; i++) {
      if (rng() < 0.055) {
        const p = choice(rng, lineup.filter(Boolean));
        const minute = Math.floor(rng() * 90) + 1;
        const isRed = rng() < 0.12;
        if (isRed) {
          stats[side].red++;
          events.push({ minute, side, type: "red", player: p.name });
          bump(p.id, -1.5);
          p._sentOff = true;
        } else {
          stats[side].yellow++;
          events.push({ minute, side, type: "yellow", player: p.name });
          bump(p.id, -0.15);
          p._yellow = true;
        }
      }
    }
  }
  rollCards("home", homeLineup);
  rollCards("away", awayLineup);

  // Injuries (rare)
  function rollInjuries(side, lineup) {
    lineup.filter(Boolean).forEach(p => {
      if (rng() < 0.012) {
        const minute = Math.floor(rng() * 90) + 1;
        const severity = choice(rng, [1, 1, 2, 2, 3, 4, 6]);
        events.push({ minute, side, type: "injury", player: p.name, matchesOut: severity });
        p._injuredMatches = severity;
        bump(p.id, -0.2);
      }
    });
  }
  rollInjuries("home", homeLineup);
  rollInjuries("away", awayLineup);

  events.sort((a, b) => a.minute - b.minute);

  // clean-sheet & baseline ratings for non-eventful players
  lineupPlayersAll(homeLineup, awayLineup).forEach(p => {
    if (!ratingAcc[p.id]) ratingAcc[p.id] = { sum: 6.3 + rng() * 0.6, n: 1 };
  });
  if (stats.home.goals === 0) defendersOf(awayLineup).concat([gkOf(awayLineup)]).forEach(p => p && bump(p.id, 0.5));
  if (stats.away.goals === 0) defendersOf(homeLineup).concat([gkOf(homeLineup)]).forEach(p => p && bump(p.id, 0.5));

  const ratings = {};
  Object.keys(ratingAcc).forEach(pid => {
    const { sum, n } = ratingAcc[pid];
    ratings[pid] = clamp(Math.round((sum) * 10) / 10, 3.5, 10);
  });

  function lineupPlayersAll(a, b) { return a.filter(Boolean).concat(b.filter(Boolean)); }

  return {
    homeScore: stats.home.goals,
    awayScore: stats.away.goals,
    events,
    stats,
    ratings, // playerId -> rating
    possession: computePossession(rA, rB),
    momentum: computeMomentum(events),
    momentumWave: buildMomentumWave(events, rng),
  };
}

// ---------------- Penalty kicks (mid-match "penalty_pending" events + full shootouts) ----------------
const PENALTY_GOAL_FLAVORS = [
  "{shooter} guarda a bola no canto direito — {gk} até tentou, mas não chegou. GOL!",
  "Cavadinha! {gk} se atira e a bola passa por cima, bem no meio. Frieza total de {shooter}.",
  "{shooter} manda no ângulo esquerdo, sem chance pra {gk}. Golaço!",
  "Pancada seca no meio do gol — {gk} já tinha caído pro lado. GOL!",
  "{shooter} espera {gk} se mexer primeiro e resolve no canto oposto. Categoria.",
  "Sem dó: {shooter} bate forte embaixo, rasteira no cantinho. {gk} nem chega a tempo.",
  "{shooter} não treme — bola no ângulo, {gk} só olha. GOL!",
  "{shooter} bate colocado no canto esquerdo, quicando antes da linha. Inatingível.",
];
const PENALTY_MISS_FLAVORS = [
  "{gk} lê a intenção, vai pro canto certo e faz a defesa!",
  "{shooter} manda por cima do travessão! Perdeu a chance.",
  "Na trave! {shooter} não acredita — a bola volta em campo.",
  "{gk} espalma com os dois punhos — que defesa!",
  "{shooter} bate no meio do gol, {gk} nem precisou se jogar pra segurar.",
  "{gk} sai na cara do gol e fecha o ângulo — {shooter} não teve o que fazer.",
  "Bola na lateral da rede! {shooter} bateu mal dessa vez.",
  "{shooter} escorrega na hora da batida e manda a bola longe do gol.",
];
function fillPenaltyTemplate(tpl, shooterName, gkName) {
  return tpl.replace(/\{shooter\}/g, shooterName).replace(/\{gk\}/g, gkName || "o goleiro");
}
// Resolves one penalty kick live — used for both a mid-match "penalty_pending" event and each
// kick in a shootout. Real penalties are converted at a high rate (~75-80%); shooting skill vs
// goalkeeping skill nudges that up or down, plus a flavor line naming both players.
function resolvePenaltyKick(shooter, gkPlayer, rng) {
  const shootSkill = shooter ? (shooter.sho || shooter.ovr) : 68;
  const gkSkill = gkPlayer ? (gkPlayer.gk || gkPlayer.ovr) : 60;
  const scoreChance = clamp(0.74 + (shootSkill - gkSkill) / 220, 0.55, 0.92);
  const scored = rng() < scoreChance;
  const tpl = choice(rng, scored ? PENALTY_GOAL_FLAVORS : PENALTY_MISS_FLAVORS);
  const shooterName = shooter ? shooter.name : "O batedor";
  const gkName = gkPlayer ? gkPlayer.name : null;
  return { scored, flavor: fillPenaltyTemplate(tpl, shooterName, gkName) };
}

function computePossession(rA, rB){
  const homeMid = rA.mid + rA.att*0.3;
  const awayMid = rB.mid + rB.att*0.3;
  let pctHome = 50 + (homeMid - awayMid) * 1.1;
  pctHome = clamp(Math.round(pctHome), 32, 68);
  return { home: pctHome, away: 100 - pctHome };
}

function computeMomentum(events){
  // 6 buckets of 15 minutes: count shot attempts (goal/miss/save/block) per side
  const buckets = [0,0,0,0,0,0].map(()=>({home:0, away:0}));
  events.forEach(ev=>{
    if(!["goal","miss","save","block"].includes(ev.type)) return;
    const idx = clamp(Math.floor((ev.minute-1)/15), 0, 5);
    buckets[idx][ev.side]++;
  });
  return buckets;
}

function buildMomentumWave(events, rng){
  const home = new Array(90).fill(0).map(()=>0.10 + rng()*0.16);
  const away = new Array(90).fill(0).map(()=>0.10 + rng()*0.16);
  events.forEach(ev => {
    if (!["goal", "miss", "save", "block"].includes(ev.type)) return;
    const idx = clamp(ev.minute - 1, 0, 89);
    const boost = ev.type === "goal" ? 0.85 : ev.type === "save" ? 0.6 : 0.45;
    const arr = ev.side === "home" ? home : away;
    arr[idx] = Math.min(1, arr[idx] + boost);
    if (idx > 0) arr[idx - 1] = Math.min(1, arr[idx - 1] + boost * 0.35);
    if (idx < 89) arr[idx + 1] = Math.min(1, arr[idx + 1] + boost * 0.35);
  });
  return { home, away };
}

// ------------------------------------------------------------
// FAST SIMULATION — used for all AI-vs-AI matches (no event log)
// ------------------------------------------------------------
// picks `count` goalscorers from a lineup, favoring attackers/midfielders with
// higher finishing (mirrors the shooter weighting used in the detailed sim) —
// used so fast-simulated (AI-vs-AI) matches can still feed a real "Artilheiros" table.
function pickFastScorers(xi, count, rng) {
  if (count <= 0) return [];
  const { lineup, slots } = xi;
  const attackers = lineup.filter((p, i) => p && POS_GROUP[slots[i]] === "ATT");
  const mids = lineup.filter((p, i) => p && POS_GROUP[slots[i]] === "MID");
  const pool = attackers.length ? attackers.concat(mids) : lineup.filter(p => p && p.pos !== "GK");
  if (pool.length === 0) return [];
  const scorers = [];
  for (let i = 0; i < count; i++) {
    scorers.push(weightedChoice(rng, pool, p => Math.pow(1.03, p.sho || p.ovr)).id);
  }
  return scorers;
}

function simulateFastMatch(teamA, teamB, rngSeedNum) {
  const rng = makeRNG(rngSeedNum);
  const bestXIA = bestAvailableXI(teamA);
  const bestXIB = bestAvailableXI(teamB);
  const rA = teamRatings(bestXIA.lineup, bestXIA.slots);
  const rB = teamRatings(bestXIB.lineup, bestXIB.slots);
  const homeAdv = 3.2;
  const attA = rA.att + rA.mid * 0.35 + homeAdv;
  const attB = rB.att + rB.mid * 0.35;
  const defA = rA.def + rA.gk * 0.4;
  const defB = rB.def + rB.gk * 0.4;
  const lamA = clamp(1.15 + (attA - defB) / 32, 0.15, 4.2);
  const lamB = clamp(0.95 + (attB - defA) / 32, 0.1, 3.8);
  const golsA = poisson(rng, lamA);
  const golsB = poisson(rng, lamB);
  const scorersHome = pickFastScorers(bestXIA, golsA, rng);
  const scorersAway = pickFastScorers(bestXIB, golsB, rng);
  return { homeScore: golsA, awayScore: golsB, scorersHome, scorersAway };
}

function poisson(rng, lambda) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}

function bestAvailableXI(team, formation) {
  formation = formation || "4-3-3";
  const slots = FORMATIONS[formation];
  const available = team.players.filter(p => !p.injured && !p.suspended);
  const pool = available.length >= 11 ? available : team.players;
  const used = new Set();
  const lineup = slots.map(slot => {
    let best = null, bestScore = -1;
    pool.forEach(p => {
      if (used.has(p.id)) return;
      const { effOvr } = ratePlayerInSlot(p, slot);
      if (effOvr > bestScore) { bestScore = effOvr; best = p; }
    });
    if (best) used.add(best.id);
    return best;
  });
  return { lineup, slots, formation };
}

// ------------------------------------------------------------
// COMPETITION STRUCTURE: round robin scheduling + standings + bracket
// ------------------------------------------------------------
function doubleRoundRobin(teamNames) {
  // circle method for n=4 -> 3 rounds, then reversed home/away for 2nd leg
  const n = teamNames.length;
  const arr = teamNames.slice();
  if (n % 2 !== 0) arr.push(null);
  const rounds = [];
  const half = arr.length / 2;
  let list = arr.slice();
  for (let r = 0; r < arr.length - 1; r++) {
    const round = [];
    for (let i = 0; i < half; i++) {
      const a = list[i], b = list[list.length - 1 - i];
      if (a !== null && b !== null) {
        if (r % 2 === 0) round.push({ home: a, away: b });
        else round.push({ home: b, away: a });
      }
    }
    rounds.push(round);
    // rotate (keep first fixed)
    list = [list[0]].concat([list[list.length - 1]], list.slice(1, list.length - 1));
  }
  const firstLeg = rounds;
  const secondLeg = rounds.map(round => round.map(m => ({ home: m.away, away: m.home })));
  return firstLeg.concat(secondLeg); // 6 rounds total for n=4
}

function newStandingsRow(team) {
  return { team, pts: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, played: 0 };
}

function applyResultToStandings(table, home, away, hs, as) {
  if (!table[home]) table[home] = newStandingsRow(home);
  if (!table[away]) table[away] = newStandingsRow(away);
  const H = table[home], A = table[away];
  H.played++; A.played++;
  H.gf += hs; H.ga += as; A.gf += as; A.ga += hs;
  if (hs > as) { H.w++; H.pts += 3; A.l++; }
  else if (hs < as) { A.w++; A.pts += 3; H.l++; }
  else { H.d++; A.d++; H.pts++; A.pts++; }
  H.gd = H.gf - H.ga; A.gd = A.gf - A.ga;
}

function sortedStandings(table, teamNames) {
  return teamNames.map(t => table[t] || newStandingsRow(t))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

function pairKnockout(teamList, rng) {
  // simple randomized bracket pairing, avoids same-country pairing when possible
  const pool = teamList.slice();
  const pairs = [];
  while (pool.length) {
    const a = pool.shift();
    let idx = pool.findIndex(t => t.country !== a.country);
    if (idx === -1) idx = 0;
    const b = pool.splice(idx, 1)[0];
    pairs.push([a, b]);
  }
  return pairs;
}


export {
  FORMATIONS, POS_GROUP,
  makeRNG, clamp, choice, weightedChoice,
  calcValue, ageOnePlayer,
  teamRatings, ratePlayerInSlot,
  simulateDetailedMatch, simulateFastMatch,
  bestAvailableXI, poisson,
  doubleRoundRobin, newStandingsRow, applyResultToStandings, sortedStandings,
  pairKnockout,
  resolvePenaltyKick,
};
