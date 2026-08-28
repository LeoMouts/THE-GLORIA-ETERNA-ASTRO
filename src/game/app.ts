// ============================================================
// LIBERTADORES MANAGER — APP (state, storage, screens)
// ============================================================
import * as E from "./engine";
import { GAME_DATA as DATA } from "./teams";
import { GLOBAL_MARKET as GLOBAL_MARKET_SRC } from "./market";

const GOAT_MASCOT_URI = "/images/image-1787868287812.webp";

// ---------- team crests (real club badges, with stylized SVG fallback for any team missing an image) ----------
const TEAM_LOGOS = {
  "Flamengo": "/logos/flamengo.png", "Estudiantes": "/logos/estudiantes.png", "Cusco FC": "/logos/cusco-fc.png",
  "Independiente Medellín": "/logos/independiente-medellin.png", "Nacional": "/logos/nacional.png", "Universitario": "/logos/universitario.png",
  "Coquimbo Unido": "/logos/coquimbo-unido.png", "Deportes Tolima": "/logos/deportes-tolima.png", "Fluminense": "/logos/fluminense.png",
  "Bolívar": "/logos/bolivar.png", "Deportivo La Guaira": "/logos/deportivo-la-guaira.png", "Independiente Rivadavia": "/logos/independiente-rivadavia.png",
  "Boca Juniors": "/logos/boca-juniors.png", "Cruzeiro": "/logos/cruzeiro.png", "Universidad Católica": "/logos/universidad-catolica.png",
  "Barcelona SC": "/logos/barcelona-sc.png", "Peñarol": "/logos/penarol.png", "Corinthians": "/logos/corinthians.png",
  "Independiente Santa Fe": "/logos/independiente-santa-fe.png", "Platense": "/logos/platense.png", "Palmeiras": "/logos/palmeiras.png",
  "Cerro Porteño": "/logos/cerro-porteno.png", "Junior Barranquilla": "/logos/junior-barranquilla.png", "Sporting Cristal": "/logos/sporting-cristal.png",
  "LDU Quito": "/logos/ldu-quito.png", "Lanús": "/logos/lanus.png", "Always Ready": "/logos/always-ready.png",
  "Mirassol": "/logos/mirassol.png", "Independiente del Valle": "/logos/independiente-del-valle.png", "Libertad": "/logos/libertad.png",
  "Rosario Central": "/logos/rosario-central.png", "Universidad Central": "/logos/universidad-central.png",
};
const TEAM_COLORS = {
  "Flamengo": ["#C8102E","#1A1A1A"], "Estudiantes": ["#B7161C","#FFFFFF"], "Cusco FC": ["#7A1F2B","#D4A72C"],
  "Independiente Medellín": ["#DA1A32","#FFFFFF"], "Nacional": ["#FFFFFF","#0B4DA1"], "Universitario": ["#7B2D3B","#F2E2B1"],
  "Coquimbo Unido": ["#4B2E6F","#111111"], "Deportes Tolima": ["#C8102E","#F5C400"], "Fluminense": ["#7A1F3D","#0B6E4F"],
  "Bolívar": ["#8FCBEA","#FFFFFF"], "Deportivo La Guaira": ["#1B3B6F","#D4AF37"], "Independiente Rivadavia": ["#1E7A34","#FFFFFF"],
  "Boca Juniors": ["#0A2C59","#F7D117"], "Cruzeiro": ["#003DA5","#FFFFFF"], "Universidad Católica": ["#6CACE4","#0A2145"],
  "Barcelona SC": ["#FFD400","#C8102E"], "Peñarol": ["#1A1A1A","#F5D400"], "Corinthians": ["#1A1A1A","#FFFFFF"],
  "Independiente Santa Fe": ["#C8102E","#1A1A1A"], "Platense": ["#1E7A46","#FFFFFF"], "Palmeiras": ["#006437","#FFFFFF"],
  "Cerro Porteño": ["#C8102E","#00205B"], "Junior Barranquilla": ["#C8102E","#FFFFFF"], "Sporting Cristal": ["#4FA9E0","#FFFFFF"],
  "LDU Quito": ["#FFFFFF","#F5C400"], "Lanús": ["#7A1F3D","#1A1A1A"], "Always Ready": ["#C8102E","#1A1A1A"],
  "Mirassol": ["#F5C400","#1E7A34"], "Independiente del Valle": ["#C8102E","#1A1A1A"], "Libertad": ["#FFFFFF","#C8102E"],
  "Rosario Central": ["#002D72","#F5C400"], "Universidad Central": ["#6E1E3D","#D4AF37"],
};
function crestInitials(name){
  const stop = new Set(["de","del","la","el","fc","sc","central","real"]);
  const words = name.split(/\s+/).filter(w=>!stop.has(w.toLowerCase()));
  if(words.length===1) return words[0].slice(0,3).toUpperCase();
  return words.slice(0,3).map(w=>w[0]).join("").toUpperCase();
}
function crestSVG(teamName, size){
  size = size || 40;
  const logo = TEAM_LOGOS[teamName];
  if(logo){
    return `<img src="${logo}" alt="${esc(teamName)}" width="${size}" height="${size}" loading="lazy" style="display:block;width:${size}px;height:${size}px;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45));"/>`;
  }
  const colors = TEAM_COLORS[teamName] || ["#3E8ED0","#122720"];
  const [c1,c2] = colors;
  const initials = crestInitials(teamName);
  const idSafe = "g"+Math.abs(hashStr(teamName));
  const textColor = luminance(c1) > 0.55 ? "#151515" : "#FFFFFF";
  return `<svg width="${size}" height="${size*1.12}" viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${idSafe}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <path d="M50 3 L94 16 V54 C94 82 74 100 50 109 C26 100 6 82 6 54 V16 Z" fill="url(#${idSafe})" stroke="#0006" stroke-width="2"/>
    <path d="M50 3 L94 16 V54 C94 82 74 100 50 109 C26 100 6 82 6 54 V16 Z" fill="none" stroke="#FFFFFF55" stroke-width="1.5"/>
    <circle cx="50" cy="46" r="21" fill="#00000022"/>
    <text x="50" y="54" font-family="Arial, sans-serif" font-weight="900" font-size="27" text-anchor="middle" fill="${textColor}">${esc(initials)}</text>
  </svg>`;
}
// ---------- real kit renders (Elenco tab only) — camisa 1 of each Libertadores club, line + goalkeeper ----------
const TEAM_KIT_OUTFIELD = {
  "Flamengo": "/images/kits/outfield/outfield/flamengo.png",
  "Estudiantes": "/images/kits/outfield/outfield/estudiantes.png",
  "Cusco FC": "/images/kits/outfield/outfield/cusco-fc.png",
  "Independiente Medellín": "/images/kits/outfield/outfield/independiente-medellin.png",
  "Nacional": "/images/kits/outfield/outfield/nacional.png",
  "Universitario": "/images/kits/outfield/outfield/universitario.png",
  "Coquimbo Unido": "/images/kits/outfield/outfield/coquimbo-unido.png",
  "Deportes Tolima": "/images/kits/outfield/outfield/deportes-tolima.png",
  "Fluminense": "/images/kits/outfield/outfield/fluminense.png",
  "Bolívar": "/images/kits/outfield/outfield/bolivar.png",
  "Deportivo La Guaira": "/images/kits/outfield/outfield/deportivo-la-guaira.png",
  "Independiente Rivadavia": "/images/kits/outfield/outfield/independiente-rivadavia.png",
  "Boca Juniors": "/images/kits/outfield/outfield/boca-juniors.png",
  "Cruzeiro": "/images/kits/outfield/outfield/cruzeiro.png",
  "Universidad Católica": "/images/kits/outfield/outfield/universidad-catolica.png",
  "Barcelona SC": "/images/kits/outfield/outfield/barcelona-sc.png",
  "Peñarol": "/images/kits/outfield/outfield/penarol.png",
  "Corinthians": "/images/kits/outfield/outfield/corinthians.png",
  "Independiente Santa Fe": "/images/kits/outfield/outfield/independiente-santa-fe.png",
  "Platense": "/images/kits/outfield/outfield/platense.png",
  "Palmeiras": "/images/kits/outfield/outfield/palmeiras.png",
  "Cerro Porteño": "/images/kits/outfield/outfield/cerro-porteno.png",
  "Junior Barranquilla": "/images/kits/outfield/outfield/junior-barranquilla.png",
  "Sporting Cristal": "/images/kits/outfield/outfield/sporting-cristal.png",
  "LDU Quito": "/images/kits/outfield/outfield/ldu-quito.png",
  "Lanús": "/images/kits/outfield/outfield/lanus.png",
  "Always Ready": "/images/kits/outfield/outfield/always-ready.png",
  "Mirassol": "/images/kits/outfield/outfield/mirassol.png",
  "Independiente del Valle": "/images/kits/outfield/outfield/independiente-del-valle.png",
  "Libertad": "/images/kits/outfield/outfield/libertad.png",
  "Rosario Central": "/images/kits/outfield/outfield/rosario-central.png",
  "Universidad Central": "/images/kits/outfield/outfield/universidad-central.png",
};
const TEAM_KIT_GK = {
  "Flamengo": "/images/kits/gk/gk/flamengo.png",
  "Estudiantes": "/images/kits/gk/gk/estudiantes.png",
  "Cusco FC": "/images/kits/gk/gk/cusco-fc.png",
  "Independiente Medellín": "/images/kits/gk/gk/independiente-medellin.png",
  "Nacional": "/images/kits/gk/gk/nacional.png",
  "Universitario": "/images/kits/gk/gk/universitario.png",
  "Coquimbo Unido": "/images/kits/gk/gk/coquimbo-unido.png",
  "Deportes Tolima": "/images/kits/gk/gk/deportes-tolima.png",
  "Fluminense": "/images/kits/gk/gk/fluminense.png",
  "Bolívar": "/images/kits/gk/gk/bolivar.png",
  "Deportivo La Guaira": "/images/kits/gk/gk/deportivo-la-guaira.png",
  "Independiente Rivadavia": "/images/kits/gk/gk/independiente-rivadavia.png",
  "Boca Juniors": "/images/kits/gk/gk/boca-juniors.png",
  "Cruzeiro": "/images/kits/gk/gk/cruzeiro.png",
  "Universidad Católica": "/images/kits/gk/gk/universidad-catolica.png",
  "Barcelona SC": "/images/kits/gk/gk/barcelona-sc.png",
  "Peñarol": "/images/kits/gk/gk/penarol.png",
  "Corinthians": "/images/kits/gk/gk/corinthians.png",
  "Independiente Santa Fe": "/images/kits/gk/gk/independiente-santa-fe.png",
  "Platense": "/images/kits/gk/gk/platense.png",
  "Palmeiras": "/images/kits/gk/gk/palmeiras.png",
  "Cerro Porteño": "/images/kits/gk/gk/cerro-porteno.png",
  "Junior Barranquilla": "/images/kits/gk/gk/junior-barranquilla.png",
  "Sporting Cristal": "/images/kits/gk/gk/sporting-cristal.png",
  "LDU Quito": "/images/kits/gk/gk/ldu-quito.png",
  "Lanús": "/images/kits/gk/gk/lanus.png",
  "Always Ready": "/images/kits/gk/gk/always-ready.png",
  "Mirassol": "/images/kits/gk/gk/mirassol.png",
  "Independiente del Valle": "/images/kits/gk/gk/independiente-del-valle.png",
  "Libertad": "/images/kits/gk/gk/libertad.png",
  "Rosario Central": "/images/kits/gk/gk/rosario-central.png",
  "Universidad Central": "/images/kits/gk/gk/universidad-central.png",
};
// Elenco pitch jersey: real camisa 1 render when we have one for the club (outfield vs. goalkeeper
// kit chosen by slot), falling back to the generic tinted SVG for anything missing.
function jerseyImage(teamName, isGK, size){
  size = size || 40;
  const src = isGK ? TEAM_KIT_GK[teamName] : TEAM_KIT_OUTFIELD[teamName];
  if(!src) return jerseyIconSVG(teamName, size);
  return `<img src="${src}" alt="${esc(teamName)} ${isGK?'goleiro':'linha'}" loading="lazy" style="display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));"/>`;
}
function hashStr(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h<<5)-h+s.charCodeAt(i); h|=0; } return h; }
function luminance(hex){
  const c = hex.replace('#','');
  const r=parseInt(c.substring(0,2),16)/255, g=parseInt(c.substring(2,4),16)/255, b=parseInt(c.substring(4,6),16)/255;
  return 0.299*r+0.587*g+0.114*b;
}
// ---------- generic team jersey icon (unlicensed kit template, tinted with the team's own colors) ----------
function jerseyIconSVG(teamName, size){
  size = size || 40;
  const colors = TEAM_COLORS[teamName] || ["#3E8ED0","#122720"];
  const [c1,c2] = colors;
  const trim = luminance(c1) > 0.6 ? (luminance(c2) < 0.5 ? c2 : "#241a04") : (luminance(c2) > 0.35 ? c2 : "#E3B94D");
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M24,8 L16,4 L2,12 L12,26 L12,58 L52,58 L52,26 L62,12 L48,4 L40,8 L32,18 Z" fill="${c1}" stroke="#00000055" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M24,8 L32,17 L40,8" fill="none" stroke="${trim}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12,26 L2,12" fill="none" stroke="${trim}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M52,26 L62,12" fill="none" stroke="${trim}" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="12" y="52" width="40" height="4" fill="${trim}" opacity=".9"/>
  </svg>`;
}

// ---------- Libertadores trophy render (real artwork, cut out to a transparent PNG) ----------
const TROPHY_IMG = "/images/awards/trophy.png";
const TROPHY_ASPECT = 250/609; // width/height of the source cutout
function trophyImg(height, opacity){
  height = height || 120;
  opacity = opacity==null ? 1 : opacity;
  const w = Math.round(height*TROPHY_ASPECT);
  return `<img src="${TROPHY_IMG}" alt="Taça CONMEBOL Libertadores" width="${w}" height="${height}" loading="lazy" style="display:block;height:${height}px;width:${w}px;opacity:${opacity};filter:drop-shadow(0 4px 14px rgba(0,0,0,.5));"/>`;
}
function cornerWatermarks(){
  return `
  <div style="position:fixed;top:-30px;left:-30px;pointer-events:none;z-index:0;">${trophyImg(220,0.07)}</div>
  <div style="position:fixed;bottom:-40px;right:-30px;pointer-events:none;z-index:0;transform:rotate(8deg);">${trophyImg(280,0.06)}</div>
  `;
}


// ---------- storage shim (works with real window.storage or a memory fallback for testing) ----------
const memStore = {};
const STORE = (window.storage) ? window.storage : {
  async get(k){ return (k in memStore) ? {key:k, value:memStore[k]} : null; },
  async set(k,v){ memStore[k]=v; return {key:k,value:v}; },
  async delete(k){ delete memStore[k]; return {key:k,deleted:true}; },
};

const SAVE_KEY = "libertadores_career_v1";

// ---------- name pools for youth generation / retirements ----------
const NAME_POOLS = {
  "Brasil": [["Gabriel","Rafael","Lucas","Bruno","Matheus","Pedro","André","Felipe","Thiago","Gustavo","Igor","Vinícius","Everton","Renato","Wesley","Yuri","Wendell","Marlon","Kaique","Danilo"],
             ["Silva","Souza","Oliveira","Santos","Pereira","Lima","Costa","Ribeiro","Carvalho","Gomes","Martins","Rocha","Almeida","Nunes","Barbosa","Teixeira","Correia","Cardoso","Vieira","Moraes"]],
  "Argentina": [["Franco","Nahuel","Tomás","Enzo","Santiago","Matías","Lautaro","Bautista","Ignacio","Joaquín","Agustín","Nicolás","Facundo","Gonzalo","Alejo","Bruno","Ramiro","Valentín","Julián","Thiago"],
             ["Fernández","González","Rodríguez","López","Martínez","García","Pérez","Díaz","Romero","Sosa","Torres","Acosta","Molina","Medina","Herrera","Godoy","Aguirre","Ríos","Suárez","Vega"]],
  "Uruguai": [["Diego","Sebastián","Nicolás","Federico","Gonzalo","Rodrigo","Martín","Matías","Bruno","Agustín","Facundo","Leandro","Franco","Emiliano","Joaquín","Cristian","Gastón","Kevin","Maximiliano","Guzmán"],
             ["Rodríguez","Fernández","García","Pereira","Silva","Ramírez","Núñez","Gómez","Acosta","Techera","Cáceres","Ferreira","Olivera","Pintos","Corujo","Machado","Bentancur","Recoba","Cavani","Godín"]],
  "Chile": [["Matías","Benjamín","Vicente","Cristóbal","Tomás","Ignacio","Joaquín","Diego","Felipe","Sebastián","Martín","Agustín","Maximiliano","Gaspar","Rodrigo","Nicolás","Luciano","Bastián","Emilio","Franco"],
             ["González","Muñoz","Rojas","Díaz","Contreras","Silva","Sepúlveda","Morales","Torres","Vargas","Fuentes","Espinoza","Reyes","Araya","Tapia","Castro","Bravo","Carrasco","Pizarro","Medel"]],
  "Paraguai": [["Miguel","Gustavo","Ángel","Julio","Omar","Fabián","Ramón","Antonio","Junior","Gastón","Óscar","Richard","Braian","Iván","Adam","Matías","Diego","Alejandro","Santiago","Fernando"],
             ["Almirón","Gómez","Villasanti","Alonso","Enciso","González","Sánchez","Cardozo","Piris","Duarte","Arzamendia","Sosa","Insfrán","Balbuena","Ortíz","Riveros","Amarilla","Verón","Núñez","Barreto"]],
  "Bolivia": [["Marcelo","Rodrigo","Erwin","Ramiro","Jhasmani","Henry","Moisés","Carmelo","Fernando","Diego","Roberto","Adrián","Leonel","Enzo","Boris","Miguel","Alejandro","Bruno","José","Gabriel"],
             ["Justiniano","Moreno","Vaca","Rivero","Sagredo","Melgar","Villamil","Bejarano","Rojas","Escobar","Terceros","Robles","Saucedo","Añez","Vargas","Chumacero","Suárez","Céspedes","Coimbra","Miranda"]],
  "Peru": [["Luis","Carlos","José","Renato","Christian","Yoshimar","Paolo","Edison","André","Alexander","Wilder","Sergio","Fernando","Miguel","Jefferson","Marcos","Anderson","Bryan","Kevin","Piero"],
             ["Flores","Ramos","Advíncula","Cueva","Carrillo","Lapadula","Zambrano","Trauco","Tapia","Yotún","Abram","Gallese","Peña","Callens","Rivera","Cartagena","Quispe","Aquino","Deza","López"]],
  "Equador": [["Enner","Moisés","Pervis","Piero","Ángel","Byron","Gonzalo","Alan","Michael","Jhegson","Robert","Willian","Diego","Roberto","Cristian","Jefferson","Jordy","Xavier","Leonardo","Jhon"],
             ["Valencia","Caicedo","Preciado","Estupiñán","Plata","Torres","Hincapié","Ibarra","Cifuentes","Franco","Mena","Arroyo","Angulo","Sarmiento","Quintero","Bone","Perlaza","Cazares","Alvarado","Quiñónez"]],
  "Colombia": [["Juan","Carlos","Santiago","Camilo","Andrés","Sebastián","Kevin","Yerry","Jhon","Rafael","Miguel","Édwin","Daniel","Cristian","Deiver","Alexander","Mateus","Wilmar","Luis","Faustino"],
             ["Rodríguez","Gómez","Martínez","López","García","Ramírez","Torres","Muriel","Bacca","Zapata","Mina","Cuadrado","Falcao","Uribe","Barrios","Borré","Díaz","Arias","Palacios","Córdoba"]],
  "Venezuela": [["Salomón","Tomás","Yeferson","Jhon","Ronald","Josef","Yangel","Eduard","Wuilker","Jon","Nahuel","Cristian","José","Darwin","Telasco","Adalberto","Junior","Jesús","Christian","Ricardo"],
             ["Rondón","Osorio","Martínez","Bello","Peñaranda","Rincón","Ferraresi","Murillo","González","Casseres","Otero","Chancellor","Segovia","Contreras","Rosales","Machis","Herrera","Aristigueta","Vargas","Silva"]],
};

function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }

function genYouthPlayer(nat, pos, tierOvr, rng, idGen){
  const pool = NAME_POOLS[nat] || NAME_POOLS["Brasil"];
  const nm = pick(rng,pool[0]) + " " + pick(rng,pool[1]);
  const age = 16 + Math.floor(rng()*3); // 16-18
  const base = tierOvr - 18 + Math.floor(rng()*10);
  const ovr = E.clamp(Math.round(base), 46, 68);
  const pot = E.clamp(ovr + 8 + Math.floor(rng()*22), ovr, 92);
  const isGk = pos === "GK";
  function j(spread){ return E.clamp(ovr + Math.floor((rng()-0.5)*spread), 30, 90); }
  return {
    id: idGen(), name: nm, nat, age, pos, altPos:[pos],
    ovr, pot,
    pac: j(18), sho: isGk?Math.floor(rng()*20)+15:j(16), pas: j(14),
    dri: isGk?j(20):j(14), de: j(16), phy: j(14),
    gk: isGk? j(14) : Math.floor(rng()*20)+15,
    value: E.calcValue(ovr, age, pot),
    foot: rng()<0.78?"Right foot":"Left foot",
    injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0,
  };
}

// ---------- global mutable state ----------
let ST = null;
let nextIdCounter = 5000;
function nextId(){ return ++nextIdCounter; }

function freshWorld(){
  // deep copy of DATA.teams, add per-team economy fields
  const teams = {};
  Object.keys(DATA.teams).forEach(name=>{
    const t = DATA.teams[name];
    const players = t.players.map(p=>Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0}));
    let maxId = 0; players.forEach(p=>{ if(p.id>maxId) maxId=p.id; });
    if(maxId>nextIdCounter) nextIdCounter = maxId;
    teams[name] = {
      name:t.name, country:t.country, flag:t.flag, group:t.group, source:t.source,
      players,
    };
  });
  GLOBAL_MARKET_SRC.forEach(p=>{ if(p.id>nextIdCounter) nextIdCounter=p.id; });
  return { groups: DATA.groups, teams, globalMarket: GLOBAL_MARKET_SRC.map(p=>Object.assign({}, p)) };
}

function teamAvgOvr(team){
  const arr = team.players.map(p=>p.ovr);
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

function allTeamsByStrength(world){
  return Object.values(world.teams).slice().sort((a,b)=>teamAvgOvr(b)-teamAvgOvr(a));
}

function tierOf(world, teamName){
  const ranked = allTeamsByStrength(world);
  const idx = ranked.findIndex(t=>t.name===teamName);
  const pct = idx/(ranked.length-1); // 0 = best
  if(pct<0.16) return 5;
  if(pct<0.38) return 4;
  if(pct<0.62) return 3;
  if(pct<0.84) return 2;
  return 1;
}
function tierLabel(tier){ return ["", "Modesto","Regular","Competitivo","Forte","Elite"][tier]; }

function fmtMoney(v){
  if(v>=1000000) return "US$ " + (v/1000000).toFixed(v>=10000000?1:2).replace(/\.0$/,'') + "M";
  if(v>=1000) return "US$ " + Math.round(v/1000) + "mil";
  return "US$ " + v;
}
const XFER_PRICE_MAX = 20000000;
const XFER_PRICE_STEP = 100000;
function renderPriceFilter(f){
  const cur = f.priceMax==null ? XFER_PRICE_MAX : Math.min(f.priceMax, XFER_PRICE_MAX);
  const label = f.priceMax==null ? "Sem limite" : fmtMoney(f.priceMax);
  return `<div class="price-filter">
    <span class="tiny dim">💰 Orçamento máx.:</span>
    <input id="xferPriceSlider" type="range" class="price-filter-slider" min="0" max="${XFER_PRICE_MAX}" step="${XFER_PRICE_STEP}"
      value="${cur}" oninput="Game.previewXferPrice(this.value)"
      onchange="Game.setXferFilter('priceMax', Number(this.value)>=${XFER_PRICE_MAX}?null:Number(this.value))"/>
    <input id="xferPriceInput" type="number" class="price-filter-input" min="0" step="${XFER_PRICE_STEP}"
      placeholder="Sem limite" value="${f.priceMax==null?'':f.priceMax}"
      oninput="Game.previewXferPriceInput(this.value)"
      onchange="Game.setXferFilter('priceMax', this.value.trim()===''?null:Math.max(0,Math.round(Number(this.value)||0)))"/>
    <span id="xferPriceLabel" class="tiny gold bold price-filter-value">${label}</span>
    ${f.priceMax!=null?`<button class="btn btn-sm" onclick="Game.setXferFilter('priceMax', null)">Limpar</button>`:""}
  </div>`;
}
function ovrClass(ovr){
  if(ovr>=85) return "ovr-90"; if(ovr>=78) return "ovr-80";
  if(ovr>=68) return "ovr-70"; if(ovr>=58) return "ovr-60"; return "ovr-50";
}

// ---------- persistence ----------
async function saveState(){
  if(!ST) return;
  try{
    await STORE.set(SAVE_KEY, JSON.stringify(ST), false);
  }catch(e){ console.error("save failed", e); }
}
let saveTimer=null;
function scheduleSave(){ clearTimeout(saveTimer); saveTimer=setTimeout(saveState, 500); }

async function loadState(){
  try{
    const r = await STORE.get(SAVE_KEY);
    if(r && r.value) return JSON.parse(r.value);
  }catch(e){ /* no save yet */ }
  return null;
}

function mutate(fn){
  fn(ST);
  scheduleSave();
  render();
}

// export a few things to window for inline-handler access
window.__APP__ = { get ST(){return ST;} };

// ============================================================
// INIT / NEW CAREER
// ============================================================
const SCHEMA_VERSION = 3; // bump whenever the shape of ST changes in a way older saves can't support

function newCareerState(){
  return {
    schemaVersion: SCHEMA_VERSION,
    managerName:"",
    teamId:null,
    seasonNum:1,
    seasonYear:2026,
    reputation:50,
    budget:0,
    history:[],
    world:null,
    stage:"home",
    hubTab:"elenco",
    formation:"4-3-3",
    lineup:{},
    captainId:null,
    competition:null,
    pendingMatch:null,
    transferAsking:{},
    scoutReport:null,
    scoutSeason:0,
    newsLog:[],
    jobOffers:null,
    fired:false,
    underdogOffer:false,
    lastSeasonSummary:null,
    tmpSelectedTeam:null,
    tmpManagerNameInput:"",
    xferFilter:{pos:"ALL", team:"ALL", q:"", source:"libertadores", priceMax:null, ageMin:null, ageMax:null, mode:"buy", sort:"ovr", page:1},
    matchAnimIdx:0,
    matchPlaying:false,
  };
}

async function initApp(){
  const loaded = await loadState();
  if(loaded && loaded.schemaVersion===SCHEMA_VERSION){
    ST = loaded;
    // never resume into a transient pre-career setup screen (team pick / manager name) —
    // only resume straight into the hub if a career was actually started.
    if(!ST.teamId || !ST.world){
      ST.stage = "home";
    }
    recomputeIdCounter();
  } else if(loaded){
    // an older/incompatible save from a previous version of the game — cannot be
    // safely resumed, so start fresh rather than crashing on missing fields.
    await STORE.delete(SAVE_KEY).catch(()=>{});
    ST = newCareerState();
  } else {
    ST = newCareerState();
  }
  render();
}

function recomputeIdCounter(){
  if(!ST.world) return;
  let maxId=0;
  Object.values(ST.world.teams).forEach(t=>t.players.forEach(p=>{ if(p.id>maxId) maxId=p.id; }));
  if(ST.world.globalMarket) ST.world.globalMarket.forEach(p=>{ if(p.id>maxId) maxId=p.id; });
  GLOBAL_MARKET_SRC.forEach(p=>{ if(p.id>maxId) maxId=p.id; });
  if(maxId>nextIdCounter) nextIdCounter=maxId;
  ensureGlobalMarket();
}

async function resetCareer(){
  await STORE.delete(SAVE_KEY).catch(()=>{});
  ST = newCareerState();
  render();
}
window.resetCareer = () => {
  ST.uiModal = {type:"confirm", message:"Tem certeza que quer apagar sua carreira atual e recomeçar?", action:"resetCareer"};
  render();
};
// used only by the error-recovery fallback screen: wipes state directly without
// trying to re-render (and re-crash on) whatever broke in the first place.
window.__forceReset__ = () => { resetCareer(); };

function startCareer(teamId, managerName){
  ST.world = freshWorld();
  ensureGlobalMarket();
  ST.teamId = teamId;
  ST.managerName = managerName || "Treinador";
  ST.seasonNum = 1;
  ST.seasonYear = 2026;
  ST.reputation = 50;
  const tier = tierOf(ST.world, teamId);
  ST.budget = [0, 1800000, 3800000, 7500000, 15000000, 26000000][tier];
  ST.history = [];
  ST.newsLog = [{title:"Bem-vindo!", text:`${ST.managerName} assume o comando do ${teamId} para a campanha de ${ST.seasonYear} da CONMEBOL Libertadores.`}];
  ST.stage = "hub";
  ST.hubTab = "competicao";
  setupSeasonCompetition();
  autoFillLineup();
  scheduleSave();
}

// ============================================================
// COMPETITION SETUP (group stage + knockout scaffolding)
// ============================================================
function buildGroupsForSeason(){
  // Season 1 always uses the real, official 2026 Libertadores draw.
  // From season 2 onward, the 32 clubs are redrawn into fresh random groups each year.
  if(ST.seasonNum===1){
    const clone = {};
    Object.keys(DATA.groups).forEach(g=>{ clone[g] = DATA.groups[g].slice(); });
    return clone;
  }
  const teamNames = Object.keys(ST.world.teams);
  const rng = E.makeRNG(nextSeed());
  const shuffled = teamNames.slice();
  for(let i=shuffled.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; }
  const letters = ["A","B","C","D","E","F","G","H"];
  const groups = {};
  letters.forEach((L,idx)=>{ groups[L] = shuffled.slice(idx*4, idx*4+4); });
  return groups;
}

function setupSeasonCompetition(){
  const groups = buildGroupsForSeason();
  const groupFixtures = {}; // groupLetter -> rounds[] (array of {home,away,played,hs,as})
  Object.keys(groups).forEach(g=>{
    const rounds = E.doubleRoundRobin(groups[g]);
    groupFixtures[g] = rounds.map(round => round.map(m=>({home:m.home, away:m.away, played:false, hs:null, as:null})));
  });
  ST.competition = {
    phase:"groups",
    groupsThisSeason: groups,
    groupFixtures,
    currentRound:0, // 0..5
    knockout:null,
    userEliminated:false,
    placementReached:null,
    placementLabel:null,
    scorers:{}, // "<team>#<playerId>" -> {id,name,team,goals} — season-wide "Artilheiros"
  };
}

// records one goal for the season-wide top-scorers table.
function addScorerGoal(teamName, playerId){
  const p = playerById(teamName, playerId);
  if(!p) return;
  const scorers = ST.competition.scorers || (ST.competition.scorers = {});
  const key = teamName+"#"+playerId;
  if(!scorers[key]) scorers[key] = {id:playerId, name:p.name, team:teamName, goals:0};
  scorers[key].goals++;
}

// wraps the fast (AI-vs-AI) simulator so every match — not just the user's own —
// still feeds real goalscorers into the "Artilheiros" table.
function simFast(homeTeamName, awayTeamName){
  const res = E.simulateFastMatch(ST.world.teams[homeTeamName], ST.world.teams[awayTeamName], nextSeed());
  (res.scorersHome||[]).forEach(id=>addScorerGoal(homeTeamName, id));
  (res.scorersAway||[]).forEach(id=>addScorerGoal(awayTeamName, id));
  return res;
}

function userGroup(){
  const groups = ST.competition.groupsThisSeason;
  return Object.keys(groups).find(g=>groups[g].includes(ST.teamId));
}

function groupStandingsFor(groupLetter){
  const table = {};
  const fixtures = ST.competition.groupFixtures[groupLetter];
  fixtures.forEach(round=>round.forEach(m=>{
    if(m.played) E.applyResultToStandings(table, m.home, m.away, m.hs, m.as);
  }));
  return E.sortedStandings(table, ST.competition.groupsThisSeason[groupLetter]);
}

// ============================================================
// LINEUP MANAGEMENT
// ============================================================
function slotsForFormation(){ return E.FORMATIONS[ST.formation]; }

function myTeam(){ return ST.world.teams[ST.teamId]; }

function playerById(teamName, id){
  const t = ST.world.teams[teamName];
  return t ? t.players.find(p=>p.id===id) : null;
}

function autoFillLineup(){
  const xi = E.bestAvailableXI(myTeam(), ST.formation);
  ST.lineup = xi.lineup.map(p=>p?p.id:null);
}

function setFormation(f){
  ST.formation = f;
  autoFillLineup();
}

function assignSlot(slotIndex, playerId){
  playerId = playerId ? Number(playerId) : null;
  const idx2 = ST.lineup.indexOf(playerId);
  if(playerId && idx2!==-1 && idx2!==slotIndex){
    const tmp = ST.lineup[slotIndex];
    ST.lineup[slotIndex] = playerId;
    ST.lineup[idx2] = tmp;
  } else {
    ST.lineup[slotIndex] = playerId;
  }
}

function lineupPlayers(){
  return ST.lineup.map(id => id ? playerById(ST.teamId, id) : null);
}

function lineupIsValid(){
  const lp = lineupPlayers();
  if(lp.some(p=>!p)) return false;
  if(lp.some(p=>p.injured||p.suspended)) return false;
  return true;
}

// ============================================================
// MATCH FLOW
// ============================================================
let seedCounter = 1;
function nextSeed(){ return (seedCounter = (seedCounter*48271 + Date.now()%97) % 2147483647); }

function stageLabelFor(type){
  return {group:"Fase de Grupos", r16:"Oitavas de Final", qf:"Quartas de Final", sf:"Semifinal", final:"Final"}[type] || type;
}

function decrementAvailability(){
  Object.values(ST.world.teams).forEach(t=>t.players.forEach(p=>{
    if(p.suspendedMatches>0){ p.suspendedMatches--; if(p.suspendedMatches<=0){p.suspendedMatches=0; p.suspended=false;} }
    if(p.injuredMatches>0){ p.injuredMatches--; if(p.injuredMatches<=0){p.injuredMatches=0; p.injured=false;} }
    if(p.form) p.form = Math.round(p.form*0.5*10)/10;
  }));
}

function applyDetailedResultToWorld(homeTeamName, awayTeamName, homeLineup, awayLineup, result){
  const allP = homeLineup.filter(Boolean).concat(awayLineup.filter(Boolean));
  allP.forEach(p=>{
    const rating = result.ratings[p.id];
    if(rating!=null) p.form = Math.round((rating-6.5)*10)/10;
  });
  result.events.forEach(ev=>{
    const side = ev.side==="home" ? homeLineup : awayLineup;
    const p = side.find(pp=>pp && pp.name===ev.player);
    if(!p) return;
    if(ev.type==="red"){ p.suspended=true; p.suspendedMatches=Math.max(p.suspendedMatches,1); }
    if(ev.type==="injury"){ p.injured=true; p.injuredMatches=Math.max(p.injuredMatches,ev.matchesOut); }
    if(ev.type==="goal"){ addScorerGoal(ev.side==="home"?homeTeamName:awayTeamName, p.id); }
  });
}

// -- advance the tournament by one step (called from "Avançar" button) --
function advanceTournament(){
  const comp = ST.competition;
  if(comp.phase==="groups") advanceGroupsStep();
  else if(comp.phase==="r16"||comp.phase==="qf"||comp.phase==="sf") advanceKnockoutStep();
  else if(comp.phase==="final") advanceFinalStep();
}

function advanceGroupsStep(){
  const comp = ST.competition;
  decrementAvailability();
  const round = comp.currentRound;
  const groups = ST.world.groups;
  let pendingUser = null;
  Object.keys(groups).forEach(g=>{
    const matches = comp.groupFixtures[g][round];
    matches.forEach(m=>{
      if(m.played) return;
      if(g===userGroup() && (m.home===ST.teamId||m.away===ST.teamId)){
        pendingUser = { ref:m, group:g, round };
      } else {
        const res = simFast(m.home, m.away);
        m.hs=res.homeScore; m.as=res.awayScore; m.played=true;
      }
    });
  });
  if(pendingUser){
    goToMatchDay(pendingUser.ref, {type:"group", group:pendingUser.group, round:pendingUser.round});
  } else {
    finishGroupRound();
  }
}

function finishGroupRound(){
  const comp = ST.competition;
  comp.currentRound++;
  if(comp.currentRound>=6){
    finalizeGroupStage();
  }
}

function finalizeGroupStage(){
  const comp = ST.competition;
  const groups = Object.keys(comp.groupsThisSeason);
  const winners=[], runnersUp=[];
  groups.forEach(g=>{
    const st = groupStandingsFor(g);
    winners.push({team:st[0].team, group:g});
    runnersUp.push({team:st[1].team, group:g});
  });
  // shuffle runners-up and pair avoiding same group -> fixes the R16 bracket SLOTS (0..7)
  const rng = E.makeRNG(nextSeed());
  const ru = runnersUp.slice();
  for(let i=ru.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [ru[i],ru[j]]=[ru[j],ru[i]]; }
  const usedRU = new Array(ru.length).fill(false);
  const ties = winners.map((w,i)=>{
    let idx = ru.findIndex((r,i2)=>!usedRU[i2] && r.group!==w.group);
    if(idx===-1) idx = ru.findIndex((r,i2)=>!usedRU[i2]);
    usedRU[idx]=true;
    const r = ru[idx];
    return {
      id: w.group+"-"+r.group,
      half: i<4?0:1, slot: i%4,
      teamA:w.team, teamB:r.team, // teamA = group winner (gets 2nd leg at home)
      legs: [
        {home:r.team, away:w.team, played:false, hs:null, as:null},
        {home:w.team, away:r.team, played:false, hs:null, as:null},
      ],
      winner:null, aggA:0, aggB:0, wentToPens:false,
    };
  });
  comp.knockout = { r16:{ties, legIndex:0}, qf:null, sf:null, final:null };
  comp.phase = "r16";
  ST.newsLog.unshift({title:"Fase de grupos encerrada", text:"Os 16 classificados avançam para as oitavas de final da Libertadores — o chaveamento já está definido até a final."});

  const qualified = winners.concat(runnersUp).some(x=>x.team===ST.teamId);
  if(!qualified){
    comp.userEliminated = true;
    comp.placementReached = "Fase de Grupos";
    autoFinishRest();
  }
}

function currentKnockoutRound(){
  const k = ST.competition.knockout;
  if(ST.competition.phase==="r16") return k.r16;
  if(ST.competition.phase==="qf") return k.qf;
  if(ST.competition.phase==="sf") return k.sf;
  return null;
}

function userTieInRound(round){
  return round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
}

function advanceKnockoutStep(){
  decrementAvailability();
  const round = currentKnockoutRound();
  const legIndex = round.legIndex;
  let pendingUser = null;
  round.ties.forEach(tie=>{
    const leg = tie.legs[legIndex];
    if(leg.played) return;
    if(tie.teamA===ST.teamId || tie.teamB===ST.teamId){
      pendingUser = { ref:leg, tie };
    } else {
      const res = simFast(leg.home, leg.away);
      leg.hs=res.homeScore; leg.as=res.awayScore; leg.played=true;
    }
  });
  if(pendingUser){
    goToMatchDay(pendingUser.ref, {type:ST.competition.phase, tieId:pendingUser.tie.id, legIndex});
  } else {
    finishKnockoutLeg();
  }
}

function finishKnockoutLeg(){
  const round = currentKnockoutRound();
  if(round.legIndex===0){
    round.legIndex = 1;
    return;
  }
  // both legs done -> resolve ties
  const rng = E.makeRNG(nextSeed());
  round.ties.forEach(tie=>{
    const l1=tie.legs[0], l2=tie.legs[1];
    // leg1: home=teamB(runner) away=teamA(winner) ; leg2: home=teamA away=teamB
    const aggA = l1.as + l2.hs; // teamA goals across both legs
    const aggB = l1.hs + l2.as; // teamB goals across both legs
    tie.aggA=aggA; tie.aggB=aggB;
    if(aggA>aggB) tie.winner=tie.teamA;
    else if(aggB>aggA) tie.winner=tie.teamB;
    else { tie.wentToPens=true; tie.winner = rng()<0.5?tie.teamA:tie.teamB; }
  });
  const comp = ST.competition;
  const userTie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
  if(userTie && userTie.winner!==ST.teamId && !comp.userEliminated){
    comp.userEliminated = true;
    comp.placementReached = stageLabelFor(comp.phase);
    autoFinishRest();
    return;
  }
  progressBracket();
}

// fixed-slot bracket advancement: round-robin adjacency within each half so the
// tree drawn on screen always matches who will actually meet in the next round.
function makeTie(teamA, teamB, half, slot){
  return {
    id: teamA+"-"+teamB, half, slot, teamA, teamB,
    legs: [
      {home:teamB, away:teamA, played:false, hs:null, as:null},
      {home:teamA, away:teamB, played:false, hs:null, as:null},
    ],
    winner:null, aggA:0, aggB:0, wentToPens:false,
  };
}

function progressBracket(){
  const comp = ST.competition;
  if(comp.phase==="r16"){
    const r16 = comp.knockout.r16.ties;
    const qfTies = [];
    for(let half=0; half<2; half++){
      const a = r16.find(t=>t.half===half && t.slot===0).winner;
      const b = r16.find(t=>t.half===half && t.slot===1).winner;
      const c = r16.find(t=>t.half===half && t.slot===2).winner;
      const d = r16.find(t=>t.half===half && t.slot===3).winner;
      qfTies.push(makeTie(a,b,half,0));
      qfTies.push(makeTie(c,d,half,1));
    }
    comp.knockout.qf = { ties: qfTies, legIndex:0 };
    comp.phase="qf";
    ST.newsLog.unshift({title:"Fim das oitavas", text:"Classificados para as quartas de final definidos."});
  } else if(comp.phase==="qf"){
    const qf = comp.knockout.qf.ties;
    const sfTies = [];
    for(let half=0; half<2; half++){
      const a = qf.find(t=>t.half===half && t.slot===0).winner;
      const b = qf.find(t=>t.half===half && t.slot===1).winner;
      sfTies.push(makeTie(a,b,half,0));
    }
    comp.knockout.sf = { ties: sfTies, legIndex:0 };
    comp.phase="sf";
    ST.newsLog.unshift({title:"Fim das quartas", text:"Semifinalistas da Libertadores definidos."});
  } else if(comp.phase==="sf"){
    const sf = comp.knockout.sf.ties;
    const home = sf.find(t=>t.half===0).winner;
    const away = sf.find(t=>t.half===1).winner;
    comp.knockout.final = { home, away, played:false, hs:null, as:null };
    comp.phase="final";
    ST.newsLog.unshift({title:"Finalistas definidos!", text:`${home} e ${away} disputarão o título da Libertadores.`});
  }
}

function checkUserEliminatedAfterBracket(){
  // no-op retained for backward compatibility; elimination is now detected
  // synchronously in finishKnockoutLeg() and finalizeGroupStage() at the moment it happens.
}

function advanceFinalStep(){
  decrementAvailability();
  const comp = ST.competition;
  const f = comp.knockout.final;
  if(f.home===ST.teamId || f.away===ST.teamId){
    goToMatchDay(f, {type:"final"});
  } else {
    const res = simFast(f.home, f.away);
    let hs=res.homeScore, as=res.awayScore;
    if(hs===as){ const rng=E.makeRNG(nextSeed()); if(rng()<0.5) hs++; else as++; }
    f.hs=hs; f.as=as; f.played=true;
    comp.phase="done";
    // the user was already eliminated in an earlier round when this branch runs
    // (they are never a finalist here) — keep whatever placementReached was recorded then.
    if(!comp.placementReached) comp.placementReached = "Fase de Grupos";
    endOfSeason();
  }
}

function autoFinishRest(){
  // fast-forward remaining rounds/legs without the user, all the way to the champion
  const comp = ST.competition;
  let guard=0;
  while(comp.phase!=="done" && guard<500){
    guard++;
    if(comp.phase==="groups"){
      const round = comp.currentRound;
      const groups = comp.groupsThisSeason;
      Object.keys(groups).forEach(g=>{
        comp.groupFixtures[g][round].forEach(m=>{
          if(m.played) return;
          const res = simFast(m.home, m.away);
          m.hs=res.homeScore; m.as=res.awayScore; m.played=true;
        });
      });
      comp.currentRound++;
      if(comp.currentRound>=6) finalizeGroupStage();
    } else if(comp.phase==="r16"||comp.phase==="qf"||comp.phase==="sf"){
      const round = currentKnockoutRound();
      const legIndex = round.legIndex;
      round.ties.forEach(tie=>{
        const leg = tie.legs[legIndex];
        if(leg.played) return;
        const res = simFast(leg.home, leg.away);
        leg.hs=res.homeScore; leg.as=res.awayScore; leg.played=true;
      });
      finishKnockoutLeg();
    } else if(comp.phase==="final"){
      const f = comp.knockout.final;
      const res = simFast(f.home, f.away);
      let hs=res.homeScore, as=res.awayScore;
      if(hs===as){ const rng=E.makeRNG(nextSeed()); if(rng()<0.5) hs++; else as++; }
      f.hs=hs; f.as=as; f.played=true;
      comp.phase="done";
    }
  }
  endOfSeason();
}

function goToMatchDay(matchRef, context){
  if(!lineupIsValid()) autoFillLineup();
  ST.pendingMatch = { ref:matchRef, context, result:null };
  ST.stage = "match";
  ST.matchPlaying = false;
  ST.matchAnimIdx = 0;
}

function simulatePendingMatch(){
  const pm = ST.pendingMatch;
  const home = pm.ref.home, away = pm.ref.away;
  const userIsHome = home===ST.teamId;
  const oppName = userIsHome ? away : home;
  const myXI = { lineup: lineupPlayers(), slots: slotsForFormation() };
  const oppXI = E.bestAvailableXI(ST.world.teams[oppName], "4-3-3");
  const homeXI = userIsHome ? myXI : oppXI;
  const awayXI = userIsHome ? oppXI : myXI;
  const result = E.simulateDetailedMatch(ST.world.teams[home], ST.world.teams[away], homeXI.lineup, awayXI.lineup, homeXI.slots, {seed:nextSeed()}, awayXI.slots);
  pm.result = result;
  pm.ref.hs = result.homeScore;
  pm.ref.as = result.awayScore;
  pm.ref.played = true;
  pm.homeLineup = homeXI.lineup.map(p=>p?{name:p.name, pos:p.pos, id:p.id}:null);
  pm.homeSlots = homeXI.slots;
  pm.awayLineup = awayXI.lineup.map(p=>p?{name:p.name, pos:p.pos, id:p.id}:null);
  pm.awaySlots = awayXI.slots;
  applyDetailedResultToWorld(home, away, homeXI.lineup, awayXI.lineup, result);
  ST.matchPlaying = true;
  ST.matchAnimIdx = 0;
}

// used by the "Próximo Jogo" card on the Competição tab: resolves the round's other
// fixtures, then immediately simulates the user's own match at the chosen pace —
// "slow" reveals the event ticker live, "fast" jumps straight to the final result.
function advanceWithSpeed(speed){
  advanceTournament();
  if(ST.stage==="match" && ST.pendingMatch && !ST.pendingMatch.result){
    simulatePendingMatch();
    if(speed==="fast"){
      ST.matchAnimIdx = ST.pendingMatch.result.events.length;
    }
  }
}

function finishPendingMatch(){
  const pm = ST.pendingMatch;
  const ctx = pm.context;
  ST.pendingMatch = null;
  ST.stage = "hub";
  ST.hubTab = "competicao";
  if(ctx.type==="group"){
    finishGroupRound();
  } else if(ctx.type==="final"){
    const f = ST.competition.knockout.final;
    ST.competition.phase="done";
    ST.competition.placementReached = (f.hs>f.as ? f.home : f.away)===ST.teamId ? "Campeão" : "Vice-campeão";
    endOfSeason();
    return;
  } else {
    // knockout leg (r16 / qf / sf)
    const round = currentKnockoutRound();
    if(round && round.legIndex===0 && round.ties.every(t=>t.legs[0].played)){
      finishKnockoutLeg();
    } else if(round && round.legIndex===1 && round.ties.every(t=>t.legs[1].played)){
      finishKnockoutLeg();
    }
  }
}

// ============================================================
// SEASON END / PROGRESSION
// ============================================================
const PLACEMENT_RANK = {"Fase de Grupos":1, "Oitavas de Final":2, "Quartas de Final":3, "Semifinal":4, "Vice-campeão":5, "Campeão":6};

function endOfSeason(){
  const comp = ST.competition;
  if(comp._ended) return; // safety net against double invocation
  comp._ended = true;
  const placement = comp.placementReached || "Fase de Grupos";
  const placementRank = PLACEMENT_RANK[placement] || 1;
  const tier = tierOf(ST.world, ST.teamId);
  const expectedRank = tier; // tiers 1..5 roughly map to expected rank 1..5
  const diff = placementRank - expectedRank;
  let repChange = clamp7(diff*5 + 2);
  if(placement==="Campeão") repChange += 18;
  if(placementRank<=1 && tier>=4) repChange -= 12;
  ST.reputation = E.clamp(ST.reputation + repChange, 0, 100);

  const baseByTier = [0,1800000,3800000,7500000,15000000,26000000][tier];
  const bonus = Math.pow(placementRank,1.7)*230000*(1+ST.reputation/300);
  const carry = ST.budget*0.32;
  ST.budget = Math.round(E.clamp(carry+baseByTier+bonus, 500000, 140000000)/10000)*10000;

  ST.history.push({year:ST.seasonYear, team:ST.teamId, result:placement, reputation:ST.reputation});
  ST.newsLog.unshift({title:`Temporada ${ST.seasonYear} encerrada`, text:`${ST.teamId} terminou a Libertadores em: ${placement}. Reputação: ${repChange>=0?"+":""}${repChange}.`});

  // Rei da América: the tournament's outright top scorer — only worth celebrating on the
  // championship screen when that player happens to be one of ours.
  const scorersList = Object.values(comp.scorers || {});
  const topScorer = scorersList.length ? scorersList.slice().sort((a,b)=>b.goals-a.goals)[0] : null;
  const reiDaAmerica = (placement==="Campeão" && topScorer && topScorer.team===ST.teamId) ? topScorer : null;
  if(reiDaAmerica){
    ST.newsLog.unshift({title:"Rei da América", text:`${reiDaAmerica.name} termina a Libertadores como artilheiro da competição com ${reiDaAmerica.goals} gols e leva o Rei da América para o ${ST.teamId}.`});
  }

  ageWorld();

  ST.fired = ST.reputation<=15;
  ST.underdogOffer = (placement==="Campeão" && tier<=2) || ST.reputation>=88;
  ST.jobOffers = null;
  if(ST.fired || ST.underdogOffer){
    ST.jobOffers = buildJobOffers(ST.fired ? "weaker" : "stronger");
  }

  ST.lastSeasonSummary = { placement, repChange, tier, newBudget:ST.budget, year:ST.seasonYear, reiDaAmerica };

  ST.seasonNum += 1;
  ST.seasonYear += 1;

  if(ST.seasonNum>10){
    ST.stage = "career_over";
  } else if(ST.fired || ST.underdogOffer){
    ST.stage = "job_offers";
  } else {
    setupSeasonCompetition();
    autoFillLineup();
    ST.stage = "season_end"; // brief summary screen before returning to hub
  }
}
function clamp7(v){ return Math.max(-25, Math.min(35, v)); }

function ageWorld(){
  const rng = E.makeRNG(nextSeed());
  Object.values(ST.world.teams).forEach(team=>{
    const newPlayers = [];
    team.players.forEach(p=>{
      const retireChance = p.age>=35 ? (p.age-34)*0.16 : 0;
      if(p.age>=40 || rng()<retireChance){
        // retire -> replace with a youth prospect
        const tierOvr = Math.round(teamAvgOvr(team));
        const pos = p.pos;
        newPlayers.push(genYouthPlayer(p.nat, pos, tierOvr, rng, nextId));
        return;
      }
      E.ageOnePlayer(p, rng);
      p.injured=false; p.suspended=false; p.injuredMatches=0; p.suspendedMatches=0; p.form=0;
      newPlayers.push(p);
    });
    team.players = newPlayers;
  });
}

function buildJobOffers(kind){
  const myTier = tierOf(ST.world, ST.teamId);
  const all = Object.values(ST.world.teams).filter(t=>t.name!==ST.teamId);
  let filtered;
  if(kind==="stronger"){
    // positive standout: offers must be at least as strong as the current club.
    // an elite (tier 5) club can only be approached by other elite clubs — never a step down.
    filtered = myTier>=5
      ? all.filter(t=>tierOf(ST.world,t.name)>=5)
      : all.filter(t=>tierOf(ST.world,t.name)>myTier);
  } else {
    // negative standout: offers must be a genuine step down.
    // a "bom/elite" club (tier 4-5) can only be offered clubs OUTSIDE that bracket.
    filtered = myTier>=4
      ? all.filter(t=>tierOf(ST.world,t.name)<=3)
      : all.filter(t=>tierOf(ST.world,t.name)<myTier);
  }
  if(filtered.length===0){
    // edge case: already at the very top/bottom tier — fall back to peers, never cross the boundary.
    filtered = all.filter(t=>tierOf(ST.world,t.name)===myTier);
  }
  const pool = filtered.slice();
  const rng = E.makeRNG(nextSeed());
  pool.sort((a,b)=> kind==="weaker" ? teamAvgOvr(b)-teamAvgOvr(a) : teamAvgOvr(a)-teamAvgOvr(b));
  // take a band close to the boundary rather than the extreme, then shuffle-pick 3
  const band = pool.slice(0, Math.min(10, pool.length));
  for(let i=band.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [band[i],band[j]]=[band[j],band[i]]; }
  return band.slice(0,3).map(t=>t.name);
}

function selectNewJob(teamName){
  ST.teamId = teamName;
  if(ST.fired) ST.reputation = 42;
  ST.fired = false; ST.underdogOffer = false; ST.jobOffers = null;
  // budget is rebuilt around the new club's own financial level — only a small
  // slice of personal savings carries over, so moving to a smaller club actually
  // means a smaller transfer kitty (and a bigger club means a bigger one).
  const newTier = tierOf(ST.world, teamName);
  const baseByTier = [0, 1800000, 3800000, 7500000, 15000000, 26000000][newTier];
  const carry = ST.budget * 0.15;
  ST.budget = Math.round(E.clamp(carry + baseByTier, 500000, 140000000) / 10000) * 10000;
  ST.newsLog.unshift({title:"Nova jornada", text:`${ST.managerName} assume o comando do ${teamName}.`});
  setupSeasonCompetition();
  ST.formation = "4-3-3";
  autoFillLineup();
  ST.stage = "hub"; ST.hubTab="competicao";
  scheduleSave();
}

function stayAtCurrentJob(){
  ST.fired=false; ST.underdogOffer=false; ST.jobOffers=null;
  setupSeasonCompetition();
  autoFillLineup();
  ST.stage="hub"; ST.hubTab="competicao";
  scheduleSave();
}

function continueFromSeasonEnd(){
  ST.stage = "hub"; ST.hubTab = "competicao";
  scheduleSave();
}

// ============================================================
// TRANSFERS
// ============================================================
function allPlayersList(excludeTeam){
  const out = [];
  Object.values(ST.world.teams).forEach(t=>{
    if(excludeTeam && t.name===excludeTeam) return;
    t.players.forEach(p=> out.push({p, team:t.name}));
  });
  return out;
}

function askingPrice(p, team){
  const isStarter = E.bestAvailableXI(team, "4-3-3").lineup.some(x=>x && x.id===p.id);
  let f = isStarter ? 1.35 : 1.0;
  if(p.ovr>=82) f += 0.35;
  else if(p.ovr>=76) f += 0.15;
  if(p.age<=21 && p.pot-p.ovr>=10) f += 0.25;
  return Math.round(p.value*f/5000)*5000;
}

function makeOffer(playerId, sellerTeamName, offer){
  const sellerTeam = ST.world.teams[sellerTeamName];
  const p = sellerTeam.players.find(x=>x.id===playerId);
  if(!p) return {ok:false, msg:"Jogador não encontrado."};
  if(offer>ST.budget) return {ok:false, msg:"Orçamento insuficiente."};
  const ask = askingPrice(p, sellerTeam);
  if(offer>=ask){
    sellerTeam.players = sellerTeam.players.filter(x=>x.id!==playerId);
    p.injured=false; p.suspended=false; p.form=0;
    myTeam().players.push(p);
    ST.budget -= offer;
    ST.newsLog.unshift({title:"Transferência concluída", text:`${p.name} contratado do ${sellerTeamName} por ${fmtMoney(offer)}.`});
    if(ST.lineup.length===0) autoFillLineup();
    scheduleSave();
    return {ok:true, msg:`Negócio fechado! ${p.name} é reforço do seu time.`};
  } else if(offer>=ask*0.85){
    return {ok:false, counter:ask, msg:`Proposta recusada. O ${sellerTeamName} pede ao menos ${fmtMoney(ask)}.`};
  }
  return {ok:false, msg:`Proposta recusada de imediato. Tente um valor mais próximo de ${fmtMoney(ask)}.`};
}

// ---- global market (players outside the Libertadores — from clubs that never play the competition) ----
function ensureGlobalMarket(){
  if(!ST.world.globalMarket){
    ST.world.globalMarket = GLOBAL_MARKET_SRC.map(p=>Object.assign({}, p));
  }
}
function globalMarketAskingPrice(p){
  // buying from outside the Libertadores carries a heavy import/agent premium —
  // truly elite world stars should be a stretch goal, not a season-one purchase.
  let f = 1.25;
  if(p.ovr>=88) f += 2.20;
  else if(p.ovr>=85) f += 1.60;
  else if(p.ovr>=82) f += 1.00;
  else if(p.ovr>=78) f += 0.55;
  else if(p.ovr>=74) f += 0.25;
  else f += 0.05;
  if(p.age<=21 && p.pot-p.ovr>=10) f += 0.35;
  return Math.round(p.value*f/5000)*5000;
}
function buyGlobalPlayer(playerId, offer){
  ensureGlobalMarket();
  const p = ST.world.globalMarket.find(x=>x.id===playerId);
  if(!p) return {ok:false, msg:"Jogador não encontrado no mercado."};
  if(offer>ST.budget) return {ok:false, msg:"Orçamento insuficiente."};
  const ask = globalMarketAskingPrice(p);
  if(offer>=ask){
    ST.world.globalMarket = ST.world.globalMarket.filter(x=>x.id!==playerId);
    const joined = Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0});
    delete joined.club; delete joined.league;
    myTeam().players.push(joined);
    ST.budget -= offer;
    ST.newsLog.unshift({title:"Contratação internacional!", text:`${p.name} (${p.club}) assina com o ${ST.teamId} por ${fmtMoney(offer)}.`});
    scheduleSave();
    return {ok:true, msg:`Negócio fechado! ${p.name} chega do ${p.club}.`};
  } else if(offer>=ask*0.85){
    return {ok:false, counter:ask, msg:`Proposta recusada. O estafe de ${p.name} pede ao menos ${fmtMoney(ask)}.`};
  }
  return {ok:false, msg:`Proposta recusada de imediato. Tente um valor mais próximo de ${fmtMoney(ask)}.`};
}


function quickSell(playerId){
  const t = myTeam();
  const p = t.players.find(x=>x.id===playerId);
  if(!p) return;
  const price = Math.round(p.value*0.9/5000)*5000;
  t.players = t.players.filter(x=>x.id!==playerId);
  ST.lineup = ST.lineup.map(id=> id===playerId? null : id);
  ST.budget += price;
  ST.newsLog.unshift({title:"Jogador vendido", text:`${p.name} foi vendido por ${fmtMoney(price)}.`});
  scheduleSave();
}

// ============================================================
// SCOUTING
// ============================================================
function generateScoutReport(){
  const rng = E.makeRNG(nextSeed());
  const candidates = allPlayersList(ST.teamId)
    .filter(({p})=>p.age<=23 && p.pot-p.ovr>=4)
    .sort((a,b)=> (b.p.pot-b.p.ovr)*2+b.p.pot - ((a.p.pot-a.p.ovr)*2+a.p.pot));
  const top = candidates.slice(0,16);
  // shuffle a bit within similar quality bands for variety
  ST.scoutReport = top.slice(0,12).map(c=>({playerId:c.p.id, team:c.team}));
  ST.scoutSeason = ST.seasonNum;
  scheduleSave();
}

// ============================================================
// INCOMING TRANSFER OFFERS — fictional outside clubs sometimes bid big
// money for one of your players, mid-season or between seasons.
// ============================================================
const ARAB_FICTIONAL_CLUBS = ["Al-Wasl City FC", "Desert Falcons FC", "Gulf Elite FC", "Sandstorm United", "Al-Sahra SC", "Crescent Bay FC"];
const EURO_SA_FICTIONAL_CLUBS = ["Continental FC (Europa)", "Riverside Athletic (Europa)", "Northgate United (Europa)", "Atlético del Plata (Am. do Sul)", "Estrella del Norte (Am. do Sul)", "Puerto Real FC (Am. do Sul)"];

function maybeIncomingOffer(chance){
  if(ST.uiModal) return; // don't stack on top of something else
  const rng = E.makeRNG(nextSeed());
  if(rng() >= chance) return;
  const squad = myTeam().players.filter(p=>p.ovr>=70);
  if(squad.length===0) return;
  const target = weightedPickByOvr(squad, rng);
  const roll = rng();
  let category, club, mult;
  if(roll < 0.35){
    category = "arabe";
    club = ARAB_FICTIONAL_CLUBS[Math.floor(rng()*ARAB_FICTIONAL_CLUBS.length)];
    mult = 2.2 + rng()*1.0; // 2.2x - 3.2x
  } else {
    category = "euro_sa";
    club = EURO_SA_FICTIONAL_CLUBS[Math.floor(rng()*EURO_SA_FICTIONAL_CLUBS.length)];
    mult = 1.3 + rng()*0.5; // 1.3x - 1.8x
  }
  const offer = Math.round(target.value*mult/5000)*5000;
  ST.uiModal = { type:"incomingOffer", playerId: target.id, playerName: target.name, club, category, offer, value: target.value };
  scheduleSave();
}
function weightedPickByOvr(players, rng){
  const total = players.reduce((a,p)=>a+Math.pow(1.06,p.ovr),0);
  let r = rng()*total;
  for(const p of players){
    r -= Math.pow(1.06,p.ovr);
    if(r<=0) return p;
  }
  return players[players.length-1];
}
function acceptIncomingOffer(){
  const off = ST.uiModal;
  if(!off || off.type!=="incomingOffer") return;
  const t = myTeam();
  t.players = t.players.filter(p=>p.id!==off.playerId);
  ST.lineup = ST.lineup.map(id=> id===off.playerId? null : id);
  ST.budget += off.offer;
  ST.newsLog.unshift({title:"Venda milionária!", text:`${off.playerName} foi vendido para o ${off.club} por ${fmtMoney(off.offer)}.`});
  ST.uiModal = null;
  scheduleSave();
}
function declineIncomingOffer(){
  const off = ST.uiModal;
  if(off && off.type==="incomingOffer"){
    ST.newsLog.unshift({title:"Proposta recusada", text:`Você optou por manter ${off.playerName} no elenco, recusando a oferta do ${off.club}.`});
  }
  ST.uiModal = null;
  scheduleSave();
}

// ============================================================
// FORMATION PITCH COORDINATES  (must align index-for-index with E.FORMATIONS)
// ============================================================
const FORMATION_COORDS = {
  "4-3-3": [{x:50,y:93},{x:12,y:75},{x:37,y:81},{x:63,y:81},{x:88,y:75},{x:50,y:60},{x:30,y:44},{x:70,y:44},{x:15,y:20},{x:50,y:8},{x:85,y:20}],
  "4-4-2": [{x:50,y:93},{x:12,y:75},{x:37,y:81},{x:63,y:81},{x:88,y:75},{x:15,y:48},{x:38,y:52},{x:62,y:52},{x:85,y:48},{x:38,y:12},{x:62,y:12}],
  "4-2-3-1": [{x:50,y:93},{x:12,y:75},{x:37,y:81},{x:63,y:81},{x:88,y:75},{x:38,y:62},{x:62,y:62},{x:50,y:40},{x:18,y:24},{x:82,y:24},{x:50,y:8}],
  "3-5-2": [{x:50,y:93},{x:30,y:80},{x:50,y:84},{x:70,y:80},{x:10,y:50},{x:50,y:64},{x:35,y:48},{x:65,y:40},{x:90,y:50},{x:38,y:12},{x:62,y:12}],
  "5-3-2": [{x:50,y:93},{x:8,y:74},{x:30,y:82},{x:50,y:86},{x:70,y:82},{x:92,y:74},{x:32,y:50},{x:68,y:50},{x:50,y:34},{x:38,y:12},{x:62,y:12}],
};

// ============================================================
// RENDERING
// ============================================================
function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

let tickTimer = null;

function render(){
  const app = document.getElementById("app");
  if(!app) return;
  clearTimeout(tickTimer); tickTimer=null;
  try{
    let html = "";
    if(!ST || ST.stage==="home") html = renderHome();
    else if(ST.stage==="team_select") html = renderTeamSelect();
    else if(ST.stage==="manager_name") html = renderManagerName();
    else if(ST.stage==="hub") html = renderHub();
    else if(ST.stage==="match") html = renderMatch();
    else if(ST.stage==="season_end") html = renderSeasonEndScreen();
    else if(ST.stage==="job_offers") html = renderJobOffers();
    else if(ST.stage==="career_over") html = renderCareerOver();
    else html = `<div class="empty-state">Estado desconhecido: ${esc(ST.stage)}</div>`;
    app.innerHTML = html + renderModal();
    const tickerEl = document.getElementById("ticker");
    if(tickerEl) tickerEl.scrollTop = tickerEl.scrollHeight;
    if(ST && ST.stage==="match" && ST.pendingMatch && ST.pendingMatch.result && !matchAnimDone()){
      tickTimer = setTimeout(()=>{ ST.matchAnimIdx++; render(); }, 620);
    }
  }catch(err){
    console.error("Render error, offering recovery:", err);
    app.innerHTML = `
      <div class="hero">
        <div class="hero-badge">OPS</div>
        <h1 class="hero-title" style="font-size:clamp(24px,5vw,40px);">Algo deu errado</h1>
        <p class="hero-sub">Encontramos um problema ao carregar essa tela — provavelmente uma carreira salva de uma versão anterior do jogo. Reinicie para voltar ao normal (sua carreira atual será apagada).</p>
        <button class="btn btn-gold btn-lg" onclick="window.__forceReset__()">Reiniciar jogo</button>
      </div>`;
  }
}

function matchAnimDone(){
  const pm = ST.pendingMatch;
  return !pm.result || ST.matchAnimIdx >= pm.result.events.length;
}

// ---------------- HOME ----------------
function renderInstagramIcon(){
  return `<div class="social-wrap">
    <a class="social-icon" href="https://www.instagram.com/_thefenomeno/" target="_top" rel="noopener noreferrer" aria-label="Instagram" onclick="Game.openInstagram(event)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5.5"></rect>
        <circle cx="12" cy="12" r="4.2"></circle>
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"></circle>
      </svg>
      <span class="tooltip">@_thefenomeno</span>
    </a>
  </div>`;
}

const NEWS_TICKER_ITEMS = [
  "CHAVEAMENTO DIVULGADO: OS 8 GRUPOS DA LIBERTADORES 2026 JÁ ESTÃO DEFINIDOS",
  "MERCADO GLOBAL LIBERADO: CLUBES DA LIBERTADORES JÁ PODEM CONTRATAR FORA DO CONTINENTE",
  "OLHEIROS EM ALERTA: NOVAS PROMESSAS SUL-AMERICANAS CHAMAM ATENÇÃO",
  "BASTIDORES: PRESSÃO AUMENTA SOBRE TÉCNICOS DE CLUBES TRADICIONAIS",
  "RUMO À GLÓRIA ETERNA: 10 TEMPORADAS PARA CONSTRUIR SEU LEGADO",
  "REPUTAÇÃO EM JOGO: UMA CAMPANHA RUIM PODE CUSTAR SEU CARGO",
  "ECONOMIA AQUECIDA: VALORES DE MERCADO DISPARAM PARA AS GRANDES ESTRELAS",
];
function renderNewsTicker(){
  const items = NEWS_TICKER_ITEMS.concat(NEWS_TICKER_ITEMS); // doubled for seamless loop
  return `<div class="news-ticker"><div class="news-ticker-track">
    ${items.map(t=>`<span class="news-ticker-item"><span class="dot">●</span>${esc(t)}</span>`).join("")}
  </div></div>`;
}
function renderBottomMarquee(){
  const items = Array(6).fill("THE GLÓRIA ETERNA");
  return `<div class="bottom-marquee"><div class="bottom-marquee-track">
    ${items.map(t=>`<span class="bottom-marquee-item">${esc(t)}</span>`).join("")}
  </div></div>`;
}
function renderSiteNav(hasCareer){
  return `<div class="site-nav">
    <div class="site-nav-brand">
      <img src="${GOAT_MASCOT_URI}" alt="Mascote"/>
      <span class="wordmark">THEGLORIAETERNA<span class="dot">.COM</span></span>
    </div>
    <div class="site-nav-right">
      <div class="site-nav-social">
        <a href="https://www.instagram.com/_thefenomeno/" target="_top" onclick="Game.openInstagram(event)">📷 @_thefenomeno</a>
      </div>
      <button class="nav-jogar-btn" onclick="${hasCareer?"Game.continueCareer()":"Game.goNewGame()"}">${hasCareer?"CONTINUAR":"JOGAR"}</button>
    </div>
  </div>`;
}
// glow-border hover card (Uiverse.io design by gharsh11032000, recolored to the
// site's black/gold identity) showing the "lift the trophy" art as its background.
function renderRatingCards(){
  return `<div class="hero-split-cards">
    <div class="card">
      <p class="heading">A Glória Eterna</p>
      <p>Erga a taça. Escreva sua lenda.</p>
      <p>THEGLORIAETERNA.COM</p>
    </div>
  </div>`;
}

function renderHome(){
  const hasCareer = ST && ST.teamId;
  return `
  ${cornerWatermarks()}
  <div style="position:relative;z-index:2;">
    ${renderSiteNav(hasCareer)}
    ${renderNewsTicker()}
    <div class="hero-split">
      <div class="hero-split-text">
        <div class="hero-eyebrow">Simulador de Carreira</div>
        <h1 class="hero-split-title">VOCÊ CONQUISTA<br>A <span class="gold-word">GLÓRIA ETERNA?</span></h1>
        <p class="hero-split-desc">Assuma o comando de um clube da Copa Libertadores 2026. Escale, negocie, evolua — e descubra se você tem o que é preciso para erguer a taça em 10 temporadas.</p>
        <div class="hero-split-actions">
          ${hasCareer ? `
            <button class="btn btn-gold btn-lg" onclick="Game.continueCareer()">▶ CONTINUAR CARREIRA</button>
            <button class="btn btn-ghost" onclick="Game.goNewGame()">Nova carreira</button>
          ` : `
            <button class="btn btn-gold btn-lg" onclick="Game.goNewGame()">▶ JOGAR</button>
          `}
        </div>
      </div>
      ${renderRatingCards()}
    </div>
    ${renderBottomMarquee()}
    <div class="social-wrap-center">${renderInstagramIcon()}</div>
  </div>`;
}

// ---------------- TEAM SELECT ----------------
function dataTeamAvg(name){
  const arr = DATA.teams[name].players.map(p=>p.ovr);
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}
function dataTierOf(name){
  const ranked = Object.values(DATA.teams).slice().sort((a,b)=>dataTeamAvg(b.name)-dataTeamAvg(a.name));
  const idx = ranked.findIndex(t=>t.name===name);
  const pct = idx/(ranked.length-1);
  if(pct<0.16) return 5; if(pct<0.38) return 4; if(pct<0.62) return 3; if(pct<0.84) return 2; return 1;
}

function renderTeamSelect(){
  const groups = DATA.groups;
  const sel = ST.tmpSelectedTeam;
  const groupCards = Object.keys(groups).sort().map(g=>{
    const rows = groups[g].map(name=>{
      const t = DATA.teams[name];
      const tier = dataTierOf(name);
      const isSel = sel===name;
      return `<div class="team-row ${isSel?'selected':''}" onclick="Game.pickTeam('${escJs(name)}')">
        <span style="width:22px;display:inline-flex;">${crestSVG(name, 20)}</span>
        <span class="team-name">${esc(name)}</span>
        <span class="team-tier tier-${tier}">${tierLabel(tier)}</span>
      </div>`;
    }).join("");
    return `<div class="group-card"><div class="group-label">Grupo ${g}</div>${rows}</div>`;
  }).join("");
  return `
  <div style="padding:26px 20px 10px;">
    <button class="btn btn-ghost btn-sm" onclick="Game.goHome()">← Voltar</button>
    <h2 class="panel-title" style="font-size:22px;margin-top:18px;">Escolha seu time — Libertadores 2026</h2>
    <p class="dim small">32 clubes, 8 grupos oficiais do sorteio de 2026. Times com selo "Elite" e "Forte" partem favoritos — comandar um time modesto é mais desafiador, mas mais gratificante.</p>
    <div class="group-grid">${groupCards}</div>
  </div>
  <div style="position:sticky;bottom:0;background:linear-gradient(180deg,transparent,rgba(8,16,14,.97) 30%);padding:22px 20px 26px;text-align:center;">
    <button class="btn btn-gold btn-lg" ${sel?"":"disabled"} onclick="Game.confirmTeam()">
      ${sel? "Assumir o "+esc(sel)+" →" : "Selecione um time"}
    </button>
  </div>`;
}
function escJs(s){ return String(s).replace(/'/g,"\\'"); }

// ---------------- MANAGER NAME ----------------
function renderManagerName(){
  const t = ST.tmpSelectedTeam;
  const team = DATA.teams[t];
  return `
  <div class="hero" style="min-height:80vh;">
    <div style="align-self:flex-start;margin-left:20px;"><button class="btn btn-ghost btn-sm" onclick="Game.goHome()">Início</button></div>
    <div style="margin-bottom:14px;">${crestSVG(t, 76)}</div>
    <div class="hero-badge">${team.flag} ${esc(team.country)} · GRUPO ${team.group}</div>
    <h1 class="hero-title" style="font-size:clamp(30px,6vw,54px);">${esc(t)}</h1>
    <p class="hero-sub">Como devemos chamar você, treinador(a)?</p>
    <input id="mgrNameInput" class="input-inline" style="max-width:320px;width:100%;padding:14px;font-size:16px;text-align:center;" placeholder="Seu nome" value="${esc(ST.tmpManagerNameInput||'')}" />
    <div class="mt24">
      <button class="btn btn-gold btn-lg" onclick="Game.beginCareer()">Assinar contrato e começar →</button>
    </div>
  </div>`;
}

// ---------------- HUB SHELL ----------------
function renderHub(){
  const team = myTeam();
  const rep = ST.reputation;
  return `
  <div class="hub-header">
    <div class="hub-header-inner">
      <div class="club-chip">
        <div class="club-badge" style="background:none;border:none;">${crestSVG(team.name, 40)}</div>
        <div>
          <div class="bold" style="font-size:15px;">${esc(team.name)}</div>
          <div class="faint tiny">${team.flag} ${esc(team.country)} · Temporada ${ST.seasonYear} (${ST.seasonNum}/10)</div>
        </div>
      </div>
      <div class="stat-pill">${fmtMoney(ST.budget)}</div>
      <div class="stat-pill">${esc(ST.managerName)}</div>
      <div class="stat-pill">
        Reputação
        <div class="rep-bar-wrap"><div class="rep-bar" style="width:${rep}%"></div></div>
        <span class="mono">${rep}</span>
      </div>
      <div class="grow"></div>
      <button class="btn btn-ghost btn-sm" onclick="Game.showNews()">Notícias</button>
      <button class="btn btn-ghost btn-sm" onclick="Game.goHome()" title="Voltar ao menu principal">Início</button>
    </div>
  </div>
  <div class="tabs">
    ${tabBtn("competicao","Competição")}
    ${tabBtn("elenco","Elenco")}
    ${tabBtn("transfers","Transferências")}
    ${tabBtn("scout","Olheiro")}
  </div>
  <div class="tab-content">
    ${ST.hubTab==="competicao"?renderCompeticaoTab():""}
    ${ST.hubTab==="elenco"?renderElencoTab():""}
    ${ST.hubTab==="transfers"?renderTransfersTab():""}
    ${ST.hubTab==="scout"?renderScoutTab():""}
  </div>`;
}
function tabBtn(id,label){
  return `<button class="tab-btn ${ST.hubTab===id?'active':''}" onclick="Game.setTab('${id}')">${label}</button>`;
}

// ---------------- COMPETIÇÃO TAB ----------------
function phaseLabel(phase){
  return {groups:"Fase de Grupos", r16:"Oitavas de Final", qf:"Quartas de Final", sf:"Semifinal", final:"Final", done:"Encerrada"}[phase]||phase;
}
function getNextUserMatch(){
  const comp = ST.competition;
  if(comp.phase==="groups"){
    const g = userGroup();
    const round = comp.groupFixtures[g][comp.currentRound];
    if(!round) return null;
    const m = round.find(x=>x.home===ST.teamId||x.away===ST.teamId);
    return m ? {home:m.home, away:m.away, label:`Grupo ${g} · Rodada ${comp.currentRound+1}/6`} : null;
  }
  if(comp.phase==="r16"||comp.phase==="qf"||comp.phase==="sf"){
    const round = currentKnockoutRound();
    const tie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
    if(!tie) return null;
    const leg = tie.legs[round.legIndex];
    return {home:leg.home, away:leg.away, label:`${phaseLabel(comp.phase)} · Jogo de ${round.legIndex===0?"ida":"volta"}`};
  }
  if(comp.phase==="final"){
    const f = comp.knockout.final;
    if(f.home!==ST.teamId && f.away!==ST.teamId) return null;
    return {home:f.home, away:f.away, label:"Final · Jogo único"};
  }
  return null;
}
function renderNextMatchCard(){
  const nm = getNextUserMatch();
  if(!nm) return "";
  return `<div class="panel" style="text-align:center;">
    <div class="faint tiny uc mb12">${esc(nm.label)}</div>
    <div class="row center" style="gap:28px;">
      <div style="width:90px;">
        <div style="width:64px;height:auto;margin:0 auto;">${crestSVG(nm.home,64)}</div>
        <div class="bold small mt8">${esc(nm.home)}</div>
      </div>
      <div class="faint" style="font-family:var(--font-display);font-size:22px;font-weight:800;">VS</div>
      <div style="width:90px;">
        <div style="width:64px;height:auto;margin:0 auto;">${crestSVG(nm.away,64)}</div>
        <div class="bold small mt8">${esc(nm.away)}</div>
      </div>
    </div>
    <div class="btn-row center mt24">
      <button class="btn btn-gold" onclick="Game.advanceSlow()">▶ Simulação Lenta</button>
      <button class="btn" onclick="Game.advanceFast()">⏭ Ir para o Resultado</button>
    </div>
  </div>`;
}
// four distinct boxed panels, laid out 2×2 — mirrors the reference: match card,
// standings, upcoming fixtures and top scorers each get their own separated card.
function renderCompeticaoTab(){
  const comp = ST.competition;
  const matchCell = `<div class="competicao-cell">${renderNextMatchCard()}</div>`;
  let cells;
  if(comp.phase==="groups"){
    const g = userGroup();
    const standings = groupStandingsFor(g);
    const standingsPanel = `<div class="panel">
      <div class="panel-title">Grupo ${g} — Rodada ${Math.min(comp.currentRound+1,6)}/6</div>
      ${renderStandingsTable(standings)}
    </div>`;
    cells = matchCell
      + `<div class="competicao-cell">${standingsPanel}</div>`
      + `<div class="competicao-cell">${renderUpcomingFixtures(g)}</div>`
      + `<div class="competicao-cell">${renderTopScorers()}</div>`;
  } else {
    const bracketPanel = `<div class="panel"><div class="panel-title">${phaseLabel(comp.phase)}</div>${renderKnockoutBracket()}</div>`;
    cells = matchCell
      + `<div class="competicao-cell">${renderTopScorers()}</div>`
      + `<div class="competicao-cell" style="grid-column:1 / -1;">${bracketPanel}</div>`;
  }
  return `<div class="competicao-grid">${cells}</div>`;
}
// short list of the next few unplayed fixtures in the user's group — pure lookahead,
// no scores, just who's up next (round number stands in for a real calendar date).
function renderUpcomingFixtures(g){
  const rounds = ST.competition.groupFixtures[g];
  const upcoming = [];
  for(let r=0; r<rounds.length && upcoming.length<4; r++){
    rounds[r].forEach(m=>{ if(!m.played && upcoming.length<4) upcoming.push({home:m.home, away:m.away, round:r+1}); });
  }
  if(upcoming.length===0){
    return `<div class="panel"><div class="panel-title">Próximos Jogos</div><div class="faint tiny">Sem jogos futuros no momento.</div></div>`;
  }
  return `<div class="panel">
  <div class="panel-title">Próximos Jogos</div>
  <div class="fixture-mini-list">
  ${upcoming.map(m=>`<div class="fixture-mini-row ${m.home===ST.teamId||m.away===ST.teamId?'is-user':''}">
    <span class="fixture-mini-team">${crestMini(m.home)}<span>${esc(m.home)}</span></span>
    <span class="fixture-mini-x">×</span>
    <span class="fixture-mini-team right"><span>${esc(m.away)}</span>${crestMini(m.away)}</span>
    <span class="fixture-mini-round">Rodada ${m.round}</span>
  </div>`).join("")}
  </div>
  </div>`;
}
// season-wide top scorers, tallied from every match (yours and every AI-vs-AI result).
function renderTopScorers(){
  const scorers = Object.values(ST.competition.scorers||{}).sort((a,b)=>b.goals-a.goals).slice(0,5);
  if(scorers.length===0){
    return `<div class="panel"><div class="panel-title">Artilheiros</div><div class="faint tiny">Nenhum gol registrado ainda nesta temporada.</div></div>`;
  }
  return `<div class="panel">
  <div class="panel-title">Artilheiros</div>
  <div class="scroll-x"><table class="data"><tbody>
  ${scorers.map((s,i)=>`<tr>
    <td class="dim" style="width:24px;">${i+1}</td>
    <td class="bold">${esc(s.name)} ${s.team===ST.teamId?'<span class="gold small">(você)</span>':''}</td>
    <td class="dim">${esc(s.team)}</td>
    <td class="tar gold bold mono">${s.goals}</td>
  </tr>`).join("")}
  </tbody></table></div>
  </div>`;
}
function renderStandingsTable(rows){
  return `<div class="scroll-x"><table class="data"><thead><tr>
    <th>#</th><th>Time</th><th class="tac">PJ</th><th class="tac">V</th><th class="tac">E</th><th class="tac">D</th><th class="tac">GP</th><th class="tac">GC</th><th class="tac">SG</th><th class="tac">Pts</th>
  </tr></thead><tbody>
  ${rows.map((r,i)=>`<tr style="${r.team===ST.teamId?'background:rgba(227,185,77,.08);':''}${i<2?'':''}">
    <td class="dim">${i+1}${i<2?' <span class="gold">▲</span>':''}</td>
    <td class="bold"><span class="standings-team"><span class="standings-crest">${crestMini(r.team)}</span><span>${esc(r.team)}</span>${r.team===ST.teamId?' <span class="gold small">(você)</span>':''}</span></td>
    <td class="tac">${r.played}</td><td class="tac">${r.w}</td><td class="tac">${r.d}</td><td class="tac">${r.l}</td>
    <td class="tac">${r.gf}</td><td class="tac">${r.ga}</td><td class="tac">${r.gd>0?'+':''}${r.gd}</td><td class="tac bold gold">${r.pts}</td>
  </tr>`).join("")}
  </tbody></table></div>`;
}
function renderGroupFixtureList(g){
  const rounds = ST.competition.groupFixtures[g];
  return `<div class="scroll-x"><table class="data"><tbody>
  ${rounds.map((round,ri)=>round.map(m=>`<tr>
    <td class="faint tiny" style="width:60px;">R${ri+1}</td>
    <td class="${m.home===ST.teamId||m.away===ST.teamId?'bold gold':''}">${esc(m.home)} <span class="faint">vs</span> ${esc(m.away)}</td>
    <td class="tar mono">${m.played? m.hs+" - "+m.as : "—"}</td>
  </tr>`).join("")).join("")}
  </tbody></table></div>`;
}
function crestMini(name){
  return name ? crestSVG(name,16) : `<span style="width:16px;height:18px;display:inline-block;background:#ffffff14;border-radius:3px;"></span>`;
}
function bracketScoreDisplay(tie){
  if(!tie || !tie.legs) return {a:"-", b:"-"};
  if(tie.legs[1] && tie.legs[1].played) return {a:tie.aggA, b:tie.aggB};
  if(tie.legs[0] && tie.legs[0].played) return {a:tie.legs[0].as, b:tie.legs[0].hs}; // leg0: home=teamB away=teamA
  return {a:"-", b:"-"};
}
function bracketMatchBox(tie, wide){
  const isUser = tie && (tie.teamA===ST.teamId || tie.teamB===ST.teamId);
  const sc = bracketScoreDisplay(tie);
  const aName = tie ? tie.teamA : null, bName = tie ? tie.teamB : null;
  const aWin = !!(tie && tie.winner && tie.winner===tie.teamA);
  const bWin = !!(tie && tie.winner && tie.winner===tie.teamB);
  return `<div class="bm ${isUser?'user-tie':''}" ${wide?'style="width:172px;"':''}>
    <div class="bm-row ${aWin?'winner':''} ${!aName?'tbd':''}">
      <span class="bm-crest">${crestMini(aName)}</span>
      <span class="bm-name">${aName?esc(aName):'A definir'}</span>
      <span class="bm-score">${sc.a}</span>
    </div>
    <div class="bm-row ${bWin?'winner':''} ${!bName?'tbd':''}">
      <span class="bm-crest">${crestMini(bName)}</span>
      <span class="bm-name">${bName?esc(bName):'A definir'}</span>
      <span class="bm-score">${sc.b}</span>
    </div>
  </div>`;
}
// looks up the real tie for (round,half,slot) if it has been drawn yet, otherwise
// derives a placeholder straight from the previous round's (possibly still-undecided) winners —
// this guarantees the bracket always shows exactly who a team WILL face, never a random guess.
function effectiveTie(comp, round, half, slot){
  const real = comp.knockout[round];
  if(real){
    const t = real.ties.find(t=>t.half===half && t.slot===slot);
    if(t) return t;
  }
  if(round==="qf"){
    const a = effectiveTie(comp,"r16",half,slot*2);
    const b = effectiveTie(comp,"r16",half,slot*2+1);
    return {teamA:a?a.winner:null, teamB:b?b.winner:null, winner:null, legs:null, wentToPens:false, half, slot};
  }
  if(round==="sf"){
    const a = effectiveTie(comp,"qf",half,0);
    const b = effectiveTie(comp,"qf",half,1);
    return {teamA:a?a.winner:null, teamB:b?b.winner:null, winner:null, legs:null, wentToPens:false, half, slot:0};
  }
  return null;
}
function effectiveFinal(comp){
  if(comp.knockout.final) return comp.knockout.final;
  const a = effectiveTie(comp,"sf",0,0);
  const b = effectiveTie(comp,"sf",1,0);
  return {home:a?a.winner:null, away:b?b.winner:null, played:false, hs:null, as:null};
}
function bracketHalfHtml(comp, half){
  const r16 = [0,1,2,3].map(s=>effectiveTie(comp,"r16",half,s));
  const qf = [0,1].map(s=>effectiveTie(comp,"qf",half,s));
  const sf = [effectiveTie(comp,"sf",half,0)];
  return `
    <div class="bracket-round round-r16">
      <div class="bracket-round-label">Oitavas</div>
      ${r16.map(t=>bracketMatchBox(t)).join("")}
    </div>
    <div class="bracket-round round-qf">
      <div class="bracket-round-label">Quartas</div>
      ${qf.map(t=>bracketMatchBox(t)).join("")}
    </div>
    <div class="bracket-round round-sf">
      <div class="bracket-round-label">Semifinal</div>
      ${sf.map(t=>bracketMatchBox(t)).join("")}
    </div>`;
}
function renderKnockoutBracket(){
  const comp = ST.competition;
  const finalTie = effectiveFinal(comp);
  const finalIsUser = finalTie.home===ST.teamId || finalTie.away===ST.teamId;
  const champion = (comp.phase==="done" && finalTie.played) ? (finalTie.hs>finalTie.as?finalTie.home:finalTie.away) : null;
  const finalBox = `<div class="bm ${finalIsUser?'user-tie':''}">
    <div class="bm-row ${champion&&champion===finalTie.home?'winner':''} ${!finalTie.home?'tbd':''}">
      <span class="bm-crest">${crestMini(finalTie.home)}</span>
      <span class="bm-name">${finalTie.home?esc(finalTie.home):'A definir'}</span>
      <span class="bm-score">${finalTie.played?finalTie.hs:'-'}</span>
    </div>
    <div class="bm-row ${champion&&champion===finalTie.away?'winner':''} ${!finalTie.away?'tbd':''}">
      <span class="bm-crest">${crestMini(finalTie.away)}</span>
      <span class="bm-name">${finalTie.away?esc(finalTie.away):'A definir'}</span>
      <span class="bm-score">${finalTie.played?finalTie.as:'-'}</span>
    </div>
  </div>`;
  return `<div class="bracket-wrap">
    <div class="bracket-side left">${bracketHalfHtml(comp,0)}</div>
    <div class="bracket-center-col">
      <div class="bracket-round-label gold">Final</div>
      ${trophyImg(54, champion?1:0.45)}
      ${finalBox}
      ${champion?`<div class="gold bold tiny tac mt8">CAMPEÃO</div>`:''}
    </div>
    <div class="bracket-side right">${bracketHalfHtml(comp,1)}</div>
  </div>`;
}

// ---------------- ELENCO TAB ----------------
function statusBadges(p){
  let b = "";
  if(p.injured) b += `<span class="badge badge-inj">LESIONADO ${p.injuredMatches?('· '+p.injuredMatches+'j'):''}</span> `;
  if(p.suspended) b += `<span class="badge badge-susp">SUSPENSO</span> `;
  return b;
}
// average of ratePlayerInSlot's fit multiplier across the 11 starting slots (empty
// slots count as zero fit) — a real, derived "how well does this XI fit the shape" number.
function computeChemistry(lp, slots){
  let sum=0, n=0;
  lp.forEach((p,i)=>{
    if(!p){ n++; return; }
    sum += E.ratePlayerInSlot(p, slots[i]).mult;
    n++;
  });
  return n ? Math.round((sum/n)*100) : 0;
}
function renderElencoTab(){
  const team = myTeam();
  const avgOvr = Math.round(teamAvgOvr(team));
  const totalValue = team.players.reduce((a,p)=>a+p.value,0);
  const slots = slotsForFormation();
  const coords = FORMATION_COORDS[ST.formation];
  const lp = lineupPlayers();
  const benchIds = new Set(ST.lineup.filter(Boolean));
  const bench = team.players.filter(p=>!benchIds.has(p.id)).sort((a,b)=>b.ovr-a.ovr);
  const chemistry = computeChemistry(lp, slots);
  const autoCaptainId = lp.filter(p=>p && p.pos!=="GK").sort((a,b)=>b.ovr-a.ovr)[0]?.id;
  const captainId = (ST.captainId && lp.some(p=>p && p.id===ST.captainId)) ? ST.captainId : autoCaptainId;
  const shirtLine = jerseyImage(team.name, false, 30);
  const shirtGK = jerseyImage(team.name, true, 30);

  const pitchHtml = `<div class="pitch">
    <div class="pitch-center"></div>
    ${slots.map((slot,i)=>{
      const p = lp[i];
      const c = coords[i];
      const unavailable = p && (p.injured||p.suspended);
      return `<div class="pslot ${p?'':'empty'}" style="left:${c.x}%;top:${c.y}%;" onclick="Game.openSlotPicker(${i})">
        <div class="jersey-card ${unavailable?'unavailable':''}">
          <div class="jersey-shirt">${slot==="GK"?shirtGK:shirtLine}</div>
          <div class="jersey-stats">
            <span class="jersey-pos">${slot}</span>
            <span class="jersey-ovr">${p?p.ovr:'—'}</span>
            ${p && p.id===captainId ? '<span class="jersey-cap" title="Capitão">C</span>' : ''}
          </div>
        </div>
        <div class="pname">${p?esc(p.name.split(' ').slice(-1)[0]):'Vazio ('+slot+')'}</div>
      </div>`;
    }).join("")}
  </div>`;

  return `
  <div class="row wrap between mb16">
    <div class="row wrap" style="gap:18px;">
      <div><div class="faint tiny uc">Elenco</div><div class="bold">${team.players.length} jogadores</div></div>
      <div><div class="faint tiny uc">Overall médio</div><div class="bold gold">${avgOvr}</div></div>
      <div><div class="faint tiny uc">Valor total</div><div class="bold">${fmtMoney(totalValue)}</div></div>
      <div><div class="faint tiny uc">Entrosamento</div>
        <div class="row" style="gap:8px;align-items:center;">
          <div class="rep-bar-wrap" style="width:90px;"><div class="rep-bar" style="width:${chemistry}%"></div></div>
          <span class="bold gold mono tiny">${chemistry}</span>
        </div>
      </div>
      <button class="squad-central-tile" onclick="Game.openSquadCentral()" title="Ver todos os jogadores do elenco">
        <span class="squad-central-tile-label">Central de Elenco</span>
      </button>
    </div>
    <div class="row">
      <select class="select-inline" onchange="Game.changeFormation(this.value)">
        ${Object.keys(E.FORMATIONS).map(f=>`<option value="${f}" ${ST.formation===f?"selected":""}>${f}</option>`).join("")}
      </select>
      <button class="btn btn-sm" onclick="Game.autoLineup()">⚡ Auto-escalar</button>
    </div>
  </div>
  ${pitchHtml}
  <div class="faint tiny mt8">Clique em uma posição no campo para escalar ou trocar o jogador. Lesionados e suspensos não podem ser escalados.</div>
  <div class="panel-title mt24">Banco / Reservas</div>
  ${renderPlayerTable(bench, true)}
  `;
}

function posOrder(pos){ return {GK:0,CB:1,LB:2,RB:3,DMF:4,CM:5,AM:6,LM:7,RM:8,LW:9,RW:10,SS:11,ST:12}[pos] ?? 13; }
// wingers and wide-mids are interchangeable on the same flank (RW<->RM, LW<->LM),
// on top of whatever real altPos a player already carries.
const WIDE_SWAP_POS = {RW:"RM", RM:"RW", LW:"LM", LM:"LW"};
function slotCompatible(p, slot){
  if(p.pos===slot) return true;
  if(p.altPos && p.altPos.includes(slot)) return true;
  const swap = WIDE_SWAP_POS[slot];
  if(swap && (p.pos===swap || (p.altPos && p.altPos.includes(swap)))) return true;
  return false;
}
// shared sort for every transfer-market / squad list — "pos" (posição), "value" (valor) or the default "ovr" (geral)
function sortXferList(list, sortKey){
  const arr = list.slice();
  if(sortKey==="pos") arr.sort((a,b)=> posOrder(a.pos)-posOrder(b.pos) || b.ovr-a.ovr);
  else if(sortKey==="value") arr.sort((a,b)=> b.value-a.value);
  else arr.sort((a,b)=> b.ovr-a.ovr);
  return arr;
}
// pagination for the Contratar lists — caps how many rows render at once so the
// page doesn't grow into one giant scroll; returns the current page's slice plus
// the page-nav bar HTML to place after the table.
const XFER_PAGE_SIZE = 20;
function paginateXferList(list, page){
  const totalPages = Math.max(1, Math.ceil(list.length / XFER_PAGE_SIZE));
  const cur = E.clamp(page||1, 1, totalPages);
  const start = (cur-1)*XFER_PAGE_SIZE;
  return { shown: list.slice(start, start+XFER_PAGE_SIZE), page: cur, totalPages };
}
function renderXferPagination(page, totalPages){
  if(totalPages<=1) return "";
  return `<div class="xfer-pagination">
    <button class="btn btn-sm" ${page<=1?"disabled":""} onclick="Game.setXferPage(${page-1})">◀ Anterior</button>
    <span class="faint tiny mono">Página ${page} de ${totalPages}</span>
    <button class="btn btn-sm" ${page>=totalPages?"disabled":""} onclick="Game.setXferPage(${page+1})">Próxima ▶</button>
  </div>`;
}

function renderPlayerTable(players, showSellBtn, showBuyBtn, teamNameForBuy){
  if(players.length===0) return `<div class="empty-state">Nenhum jogador aqui.</div>`;
  return `<div class="scroll-x"><table class="data"><thead><tr>
    <th>Jogador</th><th>Pos</th><th class="tac">Idade</th><th class="tac">OVR</th><th class="tac">POT</th><th class="tac">Valor</th><th>Status</th><th></th>
  </tr></thead><tbody>
  ${players.map(p=>`<tr>
    <td class="bold">${esc(p.name)} <span class="faint tiny">${p.nat}</span></td>
    <td><span class="badge badge-pos">${p.pos}</span></td>
    <td class="tac">${p.age}</td>
    <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
    <td class="tac"><span class="ovr-chip ${ovrClass(p.pot)}">${p.pot}</span></td>
    <td class="tac mono">${fmtMoney(p.value)}</td>
    <td>${statusBadges(p)||'<span class="faint tiny">Disponível</span>'}</td>
    <td>
      ${showSellBtn?`<button class="btn btn-sm btn-danger" onclick="Game.sellPlayer(${p.id})">Vender</button>`:""}
      ${showBuyBtn?`<button class="btn btn-sm btn-gold" onclick="Game.openBuyModal(${p.id},'${escJs(teamNameForBuy||p._team)}')">Propor</button>`:""}
    </td>
  </tr>`).join("")}
  </tbody></table></div>`;
}

// ---------------- TRANSFERÊNCIAS TAB ----------------
function renderXferSidebar(f, posOptions, teamOptions, searchPlaceholder){
  return `
  <div class="xfer-filter-group">
    <label class="xfer-filter-label">Buscar</label>
    <input id="xferSearchInput" class="input-inline" placeholder="${searchPlaceholder || (teamOptions?'Buscar jogador...':'Jogador, clube ou país...')}" value="${esc(f.q)}" oninput="Game.setXferFilter('q',this.value)"/>
  </div>
  <div class="xfer-filter-group">
    <label class="xfer-filter-label">Posição</label>
    <select class="select-inline" onchange="Game.setXferFilter('pos',this.value)">
      <option value="ALL">Todas posições</option>
      ${posOptions.map(p=>`<option value="${p}" ${f.pos===p?"selected":""}>${p}</option>`).join("")}
    </select>
  </div>
  ${teamOptions ? `<div class="xfer-filter-group">
    <label class="xfer-filter-label">Time</label>
    <select class="select-inline" onchange="Game.setXferFilter('team',this.value)">
      <option value="ALL">Todos os times</option>
      ${teamOptions.map(t=>`<option value="${t}" ${f.team===t?"selected":""}>${t}</option>`).join("")}
    </select>
  </div>` : ""}
  <div class="xfer-filter-group">
    <label class="xfer-filter-label">Idade</label>
    <div class="row" style="gap:8px;">
      <input type="number" class="input-inline" style="width:100%;" min="15" max="45" placeholder="Mín" value="${f.ageMin??''}" onchange="Game.setXferFilter('ageMin', this.value===''?null:Math.max(15,Math.round(Number(this.value)||15)))"/>
      <input type="number" class="input-inline" style="width:100%;" min="15" max="45" placeholder="Máx" value="${f.ageMax??''}" onchange="Game.setXferFilter('ageMax', this.value===''?null:Math.min(45,Math.round(Number(this.value)||45)))"/>
    </div>
  </div>
  <div class="xfer-filter-group">${renderPriceFilter(f)}</div>
  <div class="xfer-filter-group">
    <label class="xfer-filter-label">Ordenar por</label>
    <select class="select-inline" onchange="Game.setXferFilter('sort',this.value)">
      <option value="ovr" ${(!f.sort||f.sort==='ovr')?'selected':''}>Geral (OVR)</option>
      <option value="pos" ${f.sort==='pos'?'selected':''}>Posição</option>
      <option value="value" ${f.sort==='value'?'selected':''}>Valor</option>
    </select>
  </div>
  <button class="btn btn-sm btn-block" onclick="Game.clearXferFilters()">Limpar filtros</button>
  `;
}
function renderTransfersTab(){
  const f = ST.xferFilter;
  const mode = f.mode || "buy";
  ensureGlobalMarket();

  const modeToggle = `<div class="btn-row mb16 xfer-mode-toggle">
    <button class="btn ${mode==='buy'?'btn-gold':''}" onclick="Game.setXferFilter('mode','buy')">Contratar</button>
    <button class="btn ${mode==='sell'?'btn-gold':''}" onclick="Game.setXferFilter('mode','sell')">Vender</button>
  </div>`;

  return modeToggle + (mode==="sell" ? renderXferSellSubTab(f) : renderXferBuySubTab(f));
}
function renderXferSellSubTab(f){
  const posOptions = ["GK","CB","LB","RB","DMF","CM","AM","LM","RM","LW","RW","ST"];
  let list = myTeam().players.slice();
  if(f.pos!=="ALL") list = list.filter(p=>p.pos===f.pos);
  if(f.priceMax!=null) list = list.filter(p=>p.value<=f.priceMax);
  if(f.ageMin!=null) list = list.filter(p=>p.age>=f.ageMin);
  if(f.ageMax!=null) list = list.filter(p=>p.age<=f.ageMax);
  if(f.q) list = list.filter(p=>p.name.toLowerCase().includes(f.q.toLowerCase()));
  list = sortXferList(list, f.sort);
  return `<div class="xfer-layout">
    <aside class="xfer-sidebar">
      <div class="xfer-filter-label" style="margin-bottom:10px;">Filtros</div>
      ${renderXferSidebar(f, posOptions, null, "Buscar jogador...")}
    </aside>
    <div class="xfer-main">
      <div class="dim tiny mb8">Seu elenco — ${list.length} jogador${list.length===1?'':'es'} disponíve${list.length===1?'l':'is'} para venda.</div>
      ${renderPlayerTable(list, true, false)}
    </div>
  </div>`;
}
function renderXferBuySubTab(f){
  const source = f.source || "libertadores";
  const posOptions = ["GK","CB","LB","RB","DMF","CM","AM","LM","RM","LW","RW","ST"];
  const toggle = `<div class="btn-row mb16">
    <button class="btn btn-sm ${source==='libertadores'?'btn-gold':''}" onclick="Game.setXferFilter('source','libertadores')">Times da Libertadores</button>
    <button class="btn btn-sm ${source==='global'?'btn-gold':''}" onclick="Game.setXferFilter('source','global')">Mercado Global</button>
  </div>`;

  if(source==="global"){
    let list = ST.world.globalMarket.slice();
    if(f.pos!=="ALL") list = list.filter(p=>p.pos===f.pos);
    if(f.priceMax!=null) list = list.filter(p=>p.value<=f.priceMax);
    if(f.ageMin!=null) list = list.filter(p=>p.age>=f.ageMin);
    if(f.ageMax!=null) list = list.filter(p=>p.age<=f.ageMax);
    if(f.q){
      const q = f.q.toLowerCase();
      list = list.filter(p=>p.name.toLowerCase().includes(q) || (p.club||"").toLowerCase().includes(q) || (p.nat||"").toLowerCase().includes(q));
    }
    list = sortXferList(list, f.sort);
    const {shown, page, totalPages} = paginateXferList(list, f.page);
    return `${toggle}
    <div class="xfer-layout">
      <aside class="xfer-sidebar">
        <div class="xfer-filter-label" style="margin-bottom:10px;">Filtros</div>
        ${renderXferSidebar(f, posOptions, null)}
      </aside>
      <div class="xfer-main">
        <div class="dim tiny mb8">🌍 Jogadores de fora da Libertadores — não disputam a competição, mas podem ser contratados. Mostrando ${shown.length} de ${list.length}. Orçamento: <span class="gold bold">${fmtMoney(ST.budget)}</span></div>
        <div class="scroll-x"><table class="data"><thead><tr>
          <th>Jogador</th><th>Clube (fora da Libertadores)</th><th>Pos</th><th class="tac">Idade</th><th class="tac">OVR</th><th class="tac">Valor</th><th></th>
        </tr></thead><tbody>
        ${shown.map(p=>`<tr>
          <td class="bold">${esc(p.name)} <span class="faint tiny">${esc(p.nat)}</span></td>
          <td class="dim">${esc(p.club)}</td>
          <td><span class="badge badge-pos">${p.pos}</span></td>
          <td class="tac">${p.age}</td>
          <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
          <td class="tac mono">${fmtMoney(p.value)}</td>
          <td><button class="btn btn-sm btn-gold" onclick="Game.openBuyModal(${p.id},'global')">Propor</button></td>
        </tr>`).join("")}
        </tbody></table></div>
        ${renderXferPagination(page, totalPages)}
      </div>
    </div>
    `;
  }

  const teamOptions = Object.keys(ST.world.teams).sort();
  let list = allPlayersList(ST.teamId).map(x=>Object.assign({}, x.p, {_team:x.team}));
  if(f.pos!=="ALL") list = list.filter(p=>p.pos===f.pos);
  if(f.team!=="ALL") list = list.filter(p=>p._team===f.team);
  if(f.priceMax!=null) list = list.filter(p=>p.value<=f.priceMax);
  if(f.ageMin!=null) list = list.filter(p=>p.age>=f.ageMin);
  if(f.ageMax!=null) list = list.filter(p=>p.age<=f.ageMax);
  if(f.q) list = list.filter(p=>p.name.toLowerCase().includes(f.q.toLowerCase()));
  list = sortXferList(list, f.sort);
  const {shown, page, totalPages} = paginateXferList(list, f.page);
  return `${toggle}
  <div class="xfer-layout">
    <aside class="xfer-sidebar">
      <div class="xfer-filter-label" style="margin-bottom:10px;">Filtros</div>
      ${renderXferSidebar(f, posOptions, teamOptions)}
    </aside>
    <div class="xfer-main">
      <div class="dim tiny mb8">Mostrando ${shown.length} de ${list.length} jogadores. Orçamento disponível: <span class="gold bold">${fmtMoney(ST.budget)}</span></div>
      <div class="scroll-x"><table class="data"><thead><tr>
        <th>Jogador</th><th>Time</th><th>Pos</th><th class="tac">Idade</th><th class="tac">OVR</th><th class="tac">Valor</th><th></th>
      </tr></thead><tbody>
      ${shown.map(p=>`<tr>
        <td class="bold">${esc(p.name)} <span class="faint tiny">${p.nat}</span></td>
        <td class="dim">${esc(p._team)}</td>
        <td><span class="badge badge-pos">${p.pos}</span></td>
        <td class="tac">${p.age}</td>
        <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
        <td class="tac mono">${fmtMoney(p.value)}</td>
        <td><button class="btn btn-sm btn-gold" onclick="Game.openBuyModal(${p.id},'${escJs(p._team)}')">Propor</button></td>
      </tr>`).join("")}
      </tbody></table></div>
      ${renderXferPagination(page, totalPages)}
    </div>
  </div>
  `;
}

// ---------------- OLHEIRO TAB ----------------
// star rating from how much room a prospect has to grow (pot - ovr), 1..5 stars.
function scoutStars(p){
  const gap = p.pot - p.ovr;
  const score = E.clamp(1 + gap/4, 1, 5);
  const full = Math.round(score);
  return `<span class="star-rating" title="${score.toFixed(1)}/5">${"★".repeat(full)}${"☆".repeat(5-full)}</span>`;
}
function renderScoutTab(){
  const scoutLevel = E.clamp(1+Math.floor(ST.reputation/20), 1, 5);
  const levelBadge = `<div class="scout-level-badge">
    <div class="faint tiny uc" style="text-align:right;">Rede de Olheiros</div>
    <div class="bold gold">🌐 Nível ${scoutLevel}</div>
  </div>`;
  const needsRefresh = !ST.scoutReport || ST.scoutSeason!==ST.seasonNum;
  if(needsRefresh){
    return `<div class="row between mb16">
      <div class="panel-title" style="margin:0;">Jogadores Promissores</div>
      ${levelBadge}
    </div>
    <div class="empty-state">
      <p>Seu departamento de olheiros ainda não gerou o relatório desta temporada.</p>
      <button class="btn btn-gold" onclick="Game.generateScout()">Gerar relatório de olheiros</button>
    </div>`;
  }
  const rows = ST.scoutReport.map(r=>{
    const p = playerById(r.team, r.playerId);
    if(!p) return "";
    const t = ST.world.teams[r.team];
    const ask = askingPrice(p, t);
    return `<tr>
      <td class="bold">${esc(p.name)}</td>
      <td><span class="badge badge-pos">${p.pos}</span></td>
      <td class="tac">${p.age}</td>
      <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
      <td class="tac"><span class="ovr-chip ${ovrClass(p.pot)}">${p.pot}</span></td>
      <td>${t.flag} ${esc(p.nat)}</td>
      <td class="dim">${esc(r.team)}</td>
      <td class="tac mono">${fmtMoney(ask)}</td>
      <td class="tac">${scoutStars(p)}</td>
      <td><button class="btn btn-sm btn-gold" onclick="Game.openBuyModal(${p.id},'${escJs(r.team)}')">Propor</button></td>
    </tr>`;
  }).join("");
  return `<div class="row between mb16">
    <div>
      <div class="panel-title" style="margin:0;">Jogadores Promissores</div>
      <div class="faint tiny">Relatório da temporada ${ST.seasonYear} — jovens talentos ao redor do continente.</div>
    </div>
    ${levelBadge}
  </div>
  <div class="scroll-x"><table class="data"><thead><tr>
    <th>Jogador</th><th>Pos</th><th class="tac">Idade</th><th class="tac">Ger</th><th class="tac">Pot</th><th>Nacionalidade</th><th>Clube</th><th class="tac">Valor</th><th class="tac">Observação</th><th></th>
  </tr></thead><tbody>
  ${rows}
  </tbody></table></div>
  <div class="row mt16"><button class="btn btn-sm" onclick="Game.generateScout()">🔄 Atualizar relatório</button></div>`;
}

// ---------------- MATCH DAY ----------------
const EVENT_ICON = { goal:"⚽", miss:"🚫", save:"🧤", block:"🛑", yellow:"🟨", red:"🟥", injury:"🚑" };
function renderMomentumWave(wave, homeName, awayName, uptoMinute){
  if(!wave) return "";
  const W = 400, H = 130, midY = H/2, amp = 50;
  const n = Math.max(1, Math.min(90, uptoMinute||90));
  const step = W / 90;
  function pathFor(arr, sign){
    let d = `M 0,${midY}`;
    for(let m=0;m<n;m++){
      const x = Math.round(m*step);
      const v = arr[m]||0;
      const y = midY - sign*v*amp;
      d += ` L ${x},${y.toFixed(1)}`;
    }
    const lastX = Math.round((n-1)*step);
    d += ` L ${lastX},${midY} Z`;
    return d;
  }
  const homePath = pathFor(wave.home, 1);
  const awayPath = pathFor(wave.away, -1);
  const halftimeX = Math.round(45*step);
  return `<div class="panel-title" style="font-size:11px;margin-top:18px;">Fluxo da partida</div>
  <div class="momentum-wave-wrap">
    <div class="momentum-wave-crests">
      <span title="${esc(homeName)}">${crestSVG(homeName,20)}</span>
      <span title="${esc(awayName)}">${crestSVG(awayName,20)}</span>
    </div>
    <svg class="momentum-wave-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <line x1="0" y1="${midY}" x2="${W}" y2="${midY}" stroke="var(--line-strong)" stroke-width="1"/>
      <line x1="${halftimeX}" y1="4" x2="${halftimeX}" y2="${H-4}" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="3,3"/>
      <path d="${homePath}" fill="var(--terracotta)" fill-opacity="0.55" stroke="var(--terracotta-bright)" stroke-width="1"/>
      <path d="${awayPath}" fill="var(--marigold)" fill-opacity="0.55" stroke="var(--marigold-bright)" stroke-width="1"/>
    </svg>
  </div>`;
}
function eventText(ev, homeName, awayName){
  const team = ev.side==="home"?homeName:awayName;
  switch(ev.type){
    case "goal": return `<b>GOL!</b> ${esc(ev.player)} balança as redes${ev.assist?` (assistência de ${esc(ev.assist)})`:''} — ${esc(team)}`;
    case "miss": return `${esc(ev.player)} chuta para fora`;
    case "save": return `${esc(ev.gk)} faz grande defesa em finalização de ${esc(ev.player)}`;
    case "block": return `Finalização de ${esc(ev.player)} é bloqueada`;
    case "yellow": return `Cartão amarelo para ${esc(ev.player)} (${esc(team)})`;
    case "red": return `<b>CARTÃO VERMELHO!</b> ${esc(ev.player)} é expulso (${esc(team)})`;
    case "injury": return `${esc(ev.player)} sente lesão e sai de campo (fora por ${ev.matchesOut} jogo(s))`;
    default: return esc(ev.type);
  }
}

function renderMatch(){
  const pm = ST.pendingMatch;
  const home = pm.ref.home, away = pm.ref.away;
  const stageLbl = stageLabelFor(pm.context.type) + (pm.context.legIndex!=null ? ` — jogo de ${pm.context.legIndex===0?'ida':'volta'}` : (pm.context.type==="final"?" — jogo único":""));
  if(!pm.result){
    const lp = lineupPlayers();
    const missing = lp.filter(p=>!p).length;
    const unavailable = lp.filter(p=>p && (p.injured||p.suspended)).length;
    return `
    <div style="padding:24px 20px;max-width:760px;margin:0 auto;">
      <div class="tac faint tiny uc mb8">${esc(stageLbl)}</div>
      <div class="scoreboard">
        <div class="score-side">
          <span class="match-crest">${crestSVG(home,44)}</span>
          <div class="bold" style="font-size:16px;">${esc(home)}</div>
        </div>
        <div class="score-num">VS</div>
        <div class="score-side">
          <span class="match-crest">${crestSVG(away,44)}</span>
          <div class="bold" style="font-size:16px;">${esc(away)}</div>
        </div>
      </div>
      <div class="panel mt24">
        <div class="panel-title">Confirmar escalação (${ST.formation})</div>
        <p class="small dim">Sua escalação atual será usada nesta partida. Ajuste no campo se necessário antes de simular.</p>
        ${missing>0?`<p class="small red">⚠ Você tem ${missing} posição(ões) vazia(s) — o time será completado automaticamente.</p>`:""}
        ${unavailable>0?`<p class="small red">⚠ ${unavailable} jogador(es) escalado(s) estão suspensos/lesionados e serão substituídos.</p>`:""}
        <button class="btn btn-sm mt8" onclick="Game.setTab('elenco'); ST.stage='hub'; render();">✏️ Editar escalação</button>
      </div>
      <div class="tac mt24">
        <button class="btn btn-gold btn-lg" onclick="Game.simulateMatch()">▶ Simular Partida</button>
      </div>
    </div>`;
  }
  const res = pm.result;
  const idx = ST.matchAnimIdx;
  const visibleEvents = res.events.slice(0, idx);
  const done = idx>=res.events.length;
  const curHome = visibleEvents.filter(e=>e.side==="home"&&e.type==="goal").length;
  const curAway = visibleEvents.filter(e=>e.side==="away"&&e.type==="goal").length;
  const lastMin = visibleEvents.length? visibleEvents[visibleEvents.length-1].minute : 0;

  let ratingsHtml = "";
  let motmId = null;
  const homeT = ST.world.teams[home], awayT = ST.world.teams[away];
  if(done){
    const combined = homeT.players.concat(awayT.players)
      .filter(p=>res.ratings[p.id]!=null)
      .map(p=>({id:p.id, name:p.name, team:homeT.players.includes(p)?home:away, rating:res.ratings[p.id]}))
      .sort((a,b)=>b.rating-a.rating);
    if(combined.length) motmId = combined[0].id;
    ratingsHtml = `<div class="panel-title mt24">Melhores em campo</div>
      <div class="scroll-x"><table class="data"><tbody>
      ${combined.slice(0,6).map(r=>`<tr><td class="bold">${r.id===motmId?"⭐ ":""}${esc(r.name)}</td><td class="dim tiny">${esc(r.team)}</td><td class="tar mono gold bold">${r.rating.toFixed(1)}</td></tr>`).join("")}
      </tbody></table></div>`;
  }

  const scorers = {}, assisters = {};
  visibleEvents.forEach(ev=>{
    if(ev.type==="goal"){
      scorers[ev.player] = (scorers[ev.player]||0)+1;
      if(ev.assist) assisters[ev.assist] = (assisters[ev.assist]||0)+1;
    }
  });
  function playerIcons(name, id){
    let out = "";
    if(scorers[name]) out += " " + "⚽".repeat(scorers[name]);
    if(assisters[name]) out += " " + "🥾".repeat(assisters[name]);
    if(done && id===motmId) out += " ⭐";
    return out;
  }

  const homeLineupList = pm.homeLineup ? pm.homeLineup.map((p,i)=>p?`<div class="lineup-row"><span class="badge badge-pos">${pm.homeSlots[i]}</span><span>${esc(p.name)}${playerIcons(p.name,p.id)}</span></div>`:"").join("") : "";
  const awayLineupList = pm.awayLineup ? pm.awayLineup.map((p,i)=>p?`<div class="lineup-row"><span class="badge badge-pos">${pm.awaySlots[i]}</span><span>${esc(p.name)}${playerIcons(p.name,p.id)}</span></div>`:"").join("") : "";

  // ---- match stats (possession / shots / shots on target / momentum flow) ----
  const shotsHome = visibleEvents.filter(e=>e.side==="home"&&["goal","miss","save","block"].includes(e.type)).length;
  const shotsAway = visibleEvents.filter(e=>e.side==="away"&&["goal","miss","save","block"].includes(e.type)).length;
  const sotHome = visibleEvents.filter(e=>e.side==="home"&&["goal","save"].includes(e.type)).length;
  const sotAway = visibleEvents.filter(e=>e.side==="away"&&["goal","save"].includes(e.type)).length;
  const poss = res.possession || {home:50, away:50};
  const momentumSvg = renderMomentumWave(res.momentumWave, home, away, done?90:lastMin);
  const statsHtml = `<div class="panel mt16">
    <div class="panel-title">Estatísticas da partida</div>
    <div class="stat-compare-row"><span class="sc-val">${poss.home}%</span><span class="sc-label">Posse de bola</span><span class="sc-val">${poss.away}%</span></div>
    <div class="stat-compare-bar"><div class="scb-fill" style="width:${poss.home}%;"></div></div>
    <div class="stat-compare-row mt12"><span class="sc-val">${shotsHome}</span><span class="sc-label">Finalizações</span><span class="sc-val">${shotsAway}</span></div>
    <div class="stat-compare-row"><span class="sc-val">${sotHome}</span><span class="sc-label">No alvo</span><span class="sc-val">${sotAway}</span></div>
    ${momentumSvg}
  </div>`;

  const centerHtml = `
    <div class="tac faint tiny uc mb8">${esc(stageLbl)}</div>
    <div class="scoreboard">
      <div class="score-side">
        <span class="match-crest">${crestSVG(home,40)}</span>
        <div class="bold" style="font-size:15px;">${esc(home)}</div>
      </div>
      <div>
        <div class="score-num">${curHome} - ${curAway}</div>
        <div class="score-min tac">${done? "FIM DE JOGO" : lastMin+"'"}</div>
      </div>
      <div class="score-side">
        <span class="match-crest">${crestSVG(away,40)}</span>
        <div class="bold" style="font-size:15px;">${esc(away)}</div>
      </div>
    </div>
    <div class="ticker" id="ticker">
      ${visibleEvents.length===0?`<div class="tick-row"><span class="dim">Bola rolando...</span></div>`:""}
      ${visibleEvents.map(ev=>`<div class="tick-row ${ev.type==='goal'?'goal':''}">
        <span class="tick-min">${ev.minute}'</span><span class="tick-icon">${EVENT_ICON[ev.type]||"•"}</span>
        <span>${eventText(ev, home, away)}</span>
      </div>`).join("")}
    </div>
    <div class="tac mt16">
      ${!done? `<button class="btn" onclick="Game.skipMatch()">⏭ Pular para o final</button>` :
        `<button class="btn btn-gold btn-lg" onclick="Game.continueAfterMatch()">Continuar →</button>`}
    </div>
    ${statsHtml}
    ${ratingsHtml}`;

  return `
  <div style="padding:24px 20px;max-width:1080px;margin:0 auto;">
    <div class="match-3col">
      <div class="match-side-panel">
        <div class="lineup-col-title tac">${esc(home)}</div>
        ${homeLineupList}
      </div>
      <div class="match-center-col">${centerHtml}</div>
      <div class="match-side-panel">
        <div class="lineup-col-title tac">${esc(away)}</div>
        ${awayLineupList}
      </div>
    </div>
  </div>`;
}

// full-squad overview — every player (starters + bench) with name/pos/OVR/POT/idade/valor,
// plus an editable jersey number per player. Selling itself isn't done here: "Ir para
// Transferências" hands off to Transferências > Vender.
function renderSquadCentralModal(){
  const team = myTeam();
  const players = team.players.slice().sort((a,b)=>b.ovr-a.ovr);
  const totalValue = players.reduce((a,p)=>a+p.value,0);
  const rows = players.map(p=>`<tr>
    <td class="tac" style="width:44px;"><input type="number" class="input-inline squad-number-input" min="1" max="99" placeholder="—" value="${p.number||''}" onchange="Game.setPlayerNumber(${p.id}, this.value)"/></td>
    <td class="bold">${esc(p.name)} <span class="faint tiny">${esc(p.nat)}</span></td>
    <td><span class="badge badge-pos">${p.pos}</span></td>
    <td class="tac">${p.age}</td>
    <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
    <td class="tac"><span class="ovr-chip ${ovrClass(p.pot)}">${p.pot}</span></td>
    <td class="tac mono">${fmtMoney(p.value)}</td>
  </tr>`).join("");
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="modal modal-wide">
      <div class="row between wrap" style="gap:12px;margin-bottom:6px;">
        <div class="panel-title" style="margin:0;">Central de Elenco</div>
        <button class="btn btn-gold btn-sm" onclick="Game.goSellFromSquadCentral()">Ir para Transferências</button>
      </div>
      <div class="dim tiny mb12">${players.length} jogadores · Valor total do elenco: <span class="gold bold">${fmtMoney(totalValue)}</span></div>
      <div class="scroll-x"><table class="data"><thead><tr>
        <th class="tac">Nº</th><th>Jogador</th><th>Pos</th><th class="tac">Idade</th><th class="tac">OVR</th><th class="tac">POT</th><th class="tac">Valor</th>
      </tr></thead><tbody>${rows}</tbody></table></div>
      <button class="btn btn-block mt16" onclick="Game.closeModal()">Fechar</button>
    </div>
  </div>`;
}
// ---------------- MODAL ----------------
function renderModal(){
  const m = ST.uiModal;
  if(!m) return "";
  if(m.type==="slotPicker") return renderSlotPickerModal(m);
  if(m.type==="buyOffer") return renderBuyOfferModal(m);
  if(m.type==="news") return renderNewsModal();
  if(m.type==="confirm") return renderConfirmModal(m);
  if(m.type==="incomingOffer") return renderIncomingOfferModal(m);
  if(m.type==="squadCentral") return renderSquadCentralModal();
  return "";
}
function renderIncomingOfferModal(m){
  if(m.signing) return renderContractSigning(m.signMsg || "Venda concluída!");
  const isArab = m.category==="arabe";
  const p = playerById(ST.teamId, m.playerId);
  const pct = Math.round((m.offer/m.value-1)*100);
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="contract-doc">
      <div class="contract-panel">
        <div class="contract-panel-header">Jogador</div>
        <div class="contract-crest-row">
          <div style="font-size:28px;">${isArab?'🏆':'🌍'}</div>
          <div><div class="faint tiny uc">Time interessado</div><div class="bold">${esc(m.club)}</div></div>
        </div>
        <div class="contract-kv"><span>Tipo de transferência</span><span>Vender</span></div>
        <div class="contract-kv"><span>Categoria</span><span>${isArab?'Proposta inacreditável':'Proposta do exterior'}</span></div>
        ${p ? contractPlayerCard(p) : ""}
      </div>
      <div class="contract-divider"><span class="contract-pen">✒️</span></div>
      <div class="contract-panel">
        <div class="contract-panel-header">Proposta</div>
        <p class="contract-advisor"><b>Comentários do Gerente de Futebol:</b><br>${isArab
          ? "Um clube árabe está oferecendo uma fortuna muito acima do valor de mercado do jogador."
          : "Um clube de fora da Libertadores fez uma proposta acima do valor de mercado do jogador."}</p>
        <div class="contract-kv"><span>Valor de mercado</span><span>${fmtMoney(m.value)}</span></div>
        <div class="contract-kv"><span>Proposta recebida</span><span class="gold bold">${fmtMoney(m.offer)}</span></div>
        <div class="contract-kv"><span>Acima do valor</span><span class="green bold">+${pct}%</span></div>
        <div class="btn-row mt16">
          <button class="btn btn-gold grow" onclick="Game.acceptIncomingOffer()">✒️ Aceitar e Assinar</button>
          <button class="btn" onclick="Game.declineIncomingOffer()">Recusar</button>
        </div>
      </div>
    </div>
  </div>`;
}
function renderConfirmModal(m){
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="modal" style="max-width:380px;">
      <p class="mt8" style="line-height:1.5;">${esc(m.message)}</p>
      <div class="btn-row mt16">
        <button class="btn btn-danger grow" onclick="Game.confirmYes()">Confirmar</button>
        <button class="btn" onclick="Game.closeModal()">Cancelar</button>
      </div>
    </div>
  </div>`;
}
function renderSlotPickerModal(m){
  const team = myTeam();
  const slot = slotsForFormation()[m.slotIndex];
  const currentId = ST.lineup[m.slotIndex];
  const startersElsewhere = new Set(ST.lineup.filter((id,i)=> id!=null && i!==m.slotIndex));
  const eligible = team.players.filter(p=>slotCompatible(p, slot));
  const sorted = eligible.slice().sort((a,b)=>{
    const aExact = a.pos===slot?0:1;
    const bExact = b.pos===slot?0:1;
    if(aExact!==bExact) return aExact-bExact;
    return b.ovr-a.ovr;
  });
  const rows = sorted.map(p=>{
    const disabled = p.injured||p.suspended;
    const isCur = p.id===currentId;
    const isCap = p.id===ST.captainId;
    const isStarterElsewhere = startersElsewhere.has(p.id);
    return `<div class="slot-pick-row ${isCur?'current':''} ${disabled?'unavailable':''}">
      <div class="slot-pick-main">
        <span class="badge badge-pos">${p.pos}</span>
        <span class="bold">${esc(p.name)}</span>
        <span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span>
        ${isCur?'<span class="badge badge-titular">Nesta posição</span>':(isStarterElsewhere?'<span class="badge badge-titular">Titular</span>':'')}
        ${statusBadges(p)}
      </div>
      <div class="slot-pick-actions">
        <button class="btn btn-sm ${isCap?'btn-gold':'btn-ghost'}" title="Definir como capitão" onclick="Game.setCaptain(${p.id})">${isCap?'★ Capitão':'☆ Capitão'}</button>
        ${disabled?`<span class="faint tiny">Indisponível</span>`:`<button class="btn btn-sm ${isCur?'':'btn-gold'}" onclick="Game.assignSlot(${m.slotIndex},${p.id})">${isCur?'Escalado':'Escalar'}</button>`}
      </div>
    </div>`;
  }).join("");
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="modal">
      <div class="panel-title">Escalar para ${slot}</div>
      ${currentId?`<button class="btn btn-sm btn-danger mb12" onclick="Game.assignSlot(${m.slotIndex},null)">Deixar posição vazia</button>`:""}
      <div class="slot-pick-list">
        ${rows || `<div class="empty-state">Nenhum jogador do elenco joga em ${slot}.</div>`}
      </div>
      <button class="btn btn-block mt16" onclick="Game.closeModal()">Fechar</button>
    </div>
  </div>`;
}
// short advisor blurb (FIFA-style "his price is probably between X and Y"),
// flavored by age band — uses only real player fields, nothing invented.
function transferAdvisorLine(p, lo, hi){
  const vibe = p.age<=21 ? `${esc(p.name)} tem um futuro brilhante pela frente.`
    : p.age<=29 ? `${esc(p.name)} está no auge da carreira.`
    : `${esc(p.name)} traz muita experiência pra equipe.`;
  return `${vibe} O preço dele provavelmente está entre ${fmtMoney(lo)} e ${fmtMoney(hi)}, se quiser fazer uma proposta.`;
}
// the "contract signed" closing screen — a hand-drawn signature animates in,
// then the modal auto-closes. Shared by the outgoing and incoming offer flows.
function renderContractSigning(message){
  return `<div class="modal-backdrop">
    <div class="contract-doc contract-doc-signing">
      <div class="contract-sign-title">${esc(message)}</div>
      <div class="signature-wrap"><span class="signature-text">Grupo The Fenômeno</span></div>
      <div class="contract-sign-stamp">Contrato assinado</div>
    </div>
  </div>`;
}
function contractPlayerCard(p){
  return `<div class="contract-player-card">
    <div class="contract-player-banner"><span>${esc(p.name)}</span><span>${p.pos}</span></div>
    <div class="contract-player-body">
      <div class="contract-stat-grid">
        <div><span>Ger</span><b>${p.ovr}</b></div>
        <div><span>Idade</span><b>${p.age}</b></div>
        <div><span>Pot</span><b>${p.pot}</b></div>
      </div>
      <div class="contract-stat-row"><span>Valor de mercado</span><b class="gold">${fmtMoney(p.value)}</b></div>
    </div>
  </div>`;
}
function renderBuyOfferModal(m){
  if(m.signing) return renderContractSigning(m.signMsg || "Contrato assinado!");
  const isGlobal = m.team==="global";
  const p = isGlobal ? ST.world.globalMarket.find(x=>x.id===m.playerId) : ST.world.teams[m.team].players.find(x=>x.id===m.playerId);
  if(!p) return `<div class="modal-backdrop"><div class="modal"><p>Jogador indisponível.</p><button class="btn" onclick="Game.closeModal()">Fechar</button></div></div>`;
  const ask = isGlobal ? globalMarketAskingPrice(p) : askingPrice(p, ST.world.teams[m.team]);
  const lo = Math.round(ask*0.85/5000)*5000, hi = Math.round(ask*1.3/5000)*5000;
  const clubName = isGlobal ? p.club : m.team;
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="contract-doc">
      <div class="contract-panel">
        <div class="contract-panel-header">Jogador</div>
        <div class="contract-crest-row">
          ${isGlobal ? `<div style="font-size:28px;">🌍</div>` : `<div style="width:40px;">${crestSVG(clubName,40)}</div>`}
          <div><div class="faint tiny uc">Time</div><div class="bold">${esc(clubName)}</div>${isGlobal?'<div class="faint tiny">Fora da Libertadores</div>':''}</div>
        </div>
        <div class="contract-kv"><span>Tipo de transferência</span><span>Comprar</span></div>
        <div class="contract-kv"><span>Valor de passe estipulado</span><span class="gold bold">${fmtMoney(ask)}</span></div>
        ${contractPlayerCard(p)}
      </div>
      <div class="contract-divider"><span class="contract-pen">✒️</span></div>
      <div class="contract-panel">
        <div class="contract-panel-header">Proposta</div>
        <p class="contract-advisor"><b>Comentários do Gerente de Futebol:</b><br>${transferAdvisorLine(p, lo, hi)}</p>
        <div class="contract-kv"><span>Orç. de transferência</span><span class="gold bold">${fmtMoney(ST.budget)}</span></div>
        <label class="tiny faint mt16" style="display:block;">Valor da proposta (US$)</label>
        <input id="offerInput" type="number" class="input-inline" style="width:100%;" value="${ask}" step="10000"/>
        <div id="offerMsg" class="small mt8"></div>
        <div class="btn-row mt16">
          <button class="btn btn-gold grow" onclick="Game.submitOffer(${p.id},'${escJs(m.team)}')">✒️ Enviar Proposta</button>
          <button class="btn" onclick="Game.closeModal()">Cancelar</button>
        </div>
      </div>
    </div>
  </div>`;
}
function renderNewsModal(){
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="modal">
      <div class="panel-title">Notícias da carreira</div>
      ${ST.newsLog.slice(0,25).map(n=>`<div class="news-item"><b>${esc(n.title)}</b><br><span class="dim">${esc(n.text)}</span></div>`).join("")}
      <button class="btn btn-block mt16" onclick="Game.closeModal()">Fechar</button>
    </div>
  </div>`;
}

// ---------------- SEASON END / JOB OFFERS / CAREER OVER ----------------
function renderSeasonEndScreen(){
  const s = ST.lastSeasonSummary;
  const isChampion = s.placement === "Campeão";
  return `${cornerWatermarks()}<div class="hero" style="min-height:80vh;position:relative;z-index:1;">
    ${isChampion ? `<div class="mb16">${trophyImg(150,1)}</div>` : ""}
    <div class="hero-badge">TEMPORADA ${s.year} ENCERRADA</div>
    <h1 class="hero-title" style="font-size:clamp(30px,6vw,54px);">${esc(s.placement.toUpperCase())}</h1>
    <div class="panel mt24" style="max-width:420px;">
      <div class="kv"><span>Reputação</span><span class="${s.repChange>=0?'green':'red'} bold">${s.repChange>=0?'+':''}${s.repChange} (agora ${ST.reputation})</span></div>
      <div class="kv"><span>Novo orçamento de transferências</span><span class="gold bold">${fmtMoney(ST.budget)}</span></div>
      <div class="kv"><span>Próxima temporada</span><span class="bold">${ST.seasonYear} (${ST.seasonNum}/10)</span></div>
    </div>
    ${s.reiDaAmerica ? renderReiDaAmericaPanel(s.reiDaAmerica) : ""}
    <button class="btn btn-gold btn-lg mt24" onclick="Game.continueSeason()">Seguir para ${ST.seasonYear} →</button>
  </div>`;
}
// individual-award reveal — only shown when the tournament's outright top scorer plays for
// the club you just won the Libertadores with.
function renderReiDaAmericaPanel(r){
  return `<div class="rei-panel mt24">
    <img src="/images/awards/rei-da-america-ring.jpg" alt="Anel Rei da América" class="rei-panel-img"/>
    <div class="rei-panel-body">
      <div class="faint tiny uc" style="letter-spacing:.08em;margin-bottom:6px;">Prêmio individual</div>
      <div class="rei-panel-title">Rei da América</div>
      <p class="rei-panel-text">${esc(r.name)} foi o artilheiro da Libertadores com <b class="gold">${r.goals}</b> gol${r.goals===1?'':'s'} e leva o anel de Rei da América para o ${esc(ST.teamId)}.</p>
    </div>
  </div>`;
}
function renderJobOffers(){
  const kind = ST.fired ? "weaker" : "stronger";
  return `<div class="hero" style="min-height:88vh;">
    <div class="hero-badge">${ST.fired? "VOCÊ FOI DEMITIDO" : "PROPOSTAS DE GRANDES CLUBES"}</div>
    <h1 class="hero-title" style="font-size:clamp(26px,5vw,44px);">${ST.fired? "Hora de reconstruir" : "Sua reputação chamou atenção"}</h1>
    <p class="hero-sub">${ST.fired
      ? `Após uma temporada abaixo do esperado no ${ST.teamId}, sua reputação caiu para ${ST.reputation}. A diretoria optou por uma mudança. Escolha seu próximo desafio:`
      : `Clubes maiores estão de olho no seu trabalho. Você pode aceitar uma proposta mais ambiciosa ou permanecer no ${ST.teamId}.`}</p>
    <div class="group-grid" style="max-width:760px;">
      ${ST.jobOffers.map(name=>{
        const t = ST.world.teams[name];
        return `<div class="panel">
          <div class="row between">
            <div class="row">
              <span style="width:34px;">${crestSVG(name, 32)}</span>
              <div><div class="bold">${esc(name)}</div><div class="faint tiny">${esc(t.country)}</div></div>
            </div>
            <div class="team-tier tier-${tierOf(ST.world,name)}">${tierLabel(tierOf(ST.world,name))}</div>
          </div>
          <button class="btn btn-gold btn-block mt16" onclick="Game.acceptJob('${escJs(name)}')">Assinar contrato</button>
        </div>`;
      }).join("")}
    </div>
    ${!ST.fired?`<button class="btn btn-ghost mt24" onclick="Game.stayJob()">Permanecer no ${esc(ST.teamId)}</button>`:""}
  </div>`;
}
function renderCareerOver(){
  const titles = ST.history.filter(h=>h.result==="Campeão");
  const teams = [...new Set(ST.history.map(h=>h.team))];
  const peakRep = Math.max(50, ...ST.history.map(h=>h.reputation));
  return `${cornerWatermarks()}
  ${titles.length>0?`<img src="${GOAT_MASCOT_URI}" alt="Mascote GOAT" class="goat-mascot" style="position:absolute;left:-30px;bottom:0;height:min(48vh,380px);width:auto;z-index:1;pointer-events:none;filter:drop-shadow(0 12px 30px rgba(0,0,0,.55));" />`:""}
  <div class="hero" style="position:relative;z-index:2;">
    <div class="trophy-glow" style="background:radial-gradient(circle at 40% 30%, #F5F6F8, #ADB5BD 55%, #6B7280 100%); box-shadow:0 0 90px 10px rgba(200,205,210,.35), inset 0 -10px 30px rgba(0,0,0,.35);">${trophyImg(128, titles.length>0?1:0.55)}</div>
    <div class="hero-badge">CARREIRA ENCERRADA — 10 TEMPORADAS</div>
    <h1 class="hero-title" style="font-size:clamp(28px,6vw,54px);">${titles.length>0? titles.length+" TÍTULO"+(titles.length>1?"S":"")+" DE LIBERTADORES" : "FIM DE CICLO"}</h1>
    <div class="panel mt24" style="max-width:480px;text-align:left;">
      <div class="panel-title">Resumo de ${esc(ST.managerName)}</div>
      <div class="kv"><span>Times comandados</span><span class="bold">${teams.length} (${esc(teams.join(", "))})</span></div>
      <div class="kv"><span>Títulos de Libertadores</span><span class="bold gold">${titles.length}</span></div>
      <div class="kv"><span>Reputação de pico</span><span class="bold">${peakRep}</span></div>
      <div class="divider"></div>
      ${ST.history.map(h=>`<div class="kv"><span>${h.year} — ${esc(h.team)}</span><span>${esc(h.result)}</span></div>`).join("")}
    </div>
    <button class="btn btn-gold btn-lg mt24" onclick="Game.newCareerFromOver()">Começar nova carreira</button>
  </div>`;
}

// ============================================================
// PUBLIC HANDLERS (window.Game) — wired to onclick attributes
// ============================================================
const Game = {
  goHome(){ ST.stage="home"; render(); },
  openInstagram(ev){
    const url = "https://www.instagram.com/_thefenomeno/";
    // try every plausible escape hatch — sandboxed iframes vary in what they allow.
    try{ window.open(url, "_blank", "noopener,noreferrer"); }catch(e){}
    try{ if(window.top && window.top!==window) window.top.location.href = url; }catch(e){}
    try{ window.location.href = url; }catch(e){}
    // let the anchor's own href/target="_top" also attempt navigation natively
  },
  goNewGame(){
    if(ST.teamId && ST.world){
      ST.uiModal = {type:"confirm", message:"Você já tem uma carreira em andamento. Iniciar uma nova carreira vai apagar o progresso atual. Continuar?", action:"confirmNewGame"};
      render();
      return;
    }
    ST.tmpSelectedTeam=null; ST.tmpManagerNameInput=""; ST.stage="team_select"; render();
  },
  pickTeam(name){ ST.tmpSelectedTeam=name; render(); },
  confirmTeam(){ if(!ST.tmpSelectedTeam) return; ST.stage="manager_name"; render(); },
  beginCareer(){
    const inputEl = document.getElementById("mgrNameInput");
    const name = inputEl ? inputEl.value.trim() : "";
    startCareer(ST.tmpSelectedTeam, name || "Treinador");
    render();
  },
  continueCareer(){ ST.stage="hub"; render(); },

  setTab(id){ ST.hubTab=id; render(); },
  advance(){ advanceTournament(); if(ST.stage==="hub") maybeIncomingOffer(0.16); render(); },
  advanceSlow(){ advanceWithSpeed("slow"); if(ST.stage==="hub") maybeIncomingOffer(0.16); render(); },
  advanceFast(){ advanceWithSpeed("fast"); if(ST.stage==="hub") maybeIncomingOffer(0.16); render(); },

  openSlotPicker(idx){ ST.uiModal={type:"slotPicker", slotIndex:idx}; render(); },
  setCaptain(playerId){ ST.captainId = playerId; render(); },
  assignSlot(idx, playerId){ assignSlot(idx, playerId); ST.uiModal=null; scheduleSave(); render(); },
  closeModal(){ ST.uiModal=null; render(); },
  openSquadCentral(){ ST.uiModal={type:"squadCentral"}; render(); },
  setPlayerNumber(playerId, val){
    const p = playerById(ST.teamId, Number(playerId));
    if(!p) return;
    const raw = String(val).trim();
    p.number = raw==="" ? null : E.clamp(Math.round(Number(raw))||1, 1, 99);
    scheduleSave();
    render();
  },
  goSellFromSquadCentral(){
    ST.uiModal = null;
    ST.hubTab = "transfers";
    ST.xferFilter.mode = "sell";
    ST.xferFilter.page = 1;
    render();
  },
  autoLineup(){ autoFillLineup(); render(); },
  changeFormation(f){ setFormation(f); scheduleSave(); render(); },

  sellPlayer(id){
    const t = myTeam();
    const p = t.players.find(x=>x.id===id);
    if(!p) return;
    const price = Math.round(p.value*0.9/5000)*5000;
    ST.uiModal = {type:"confirm", message:`Vender ${p.name} agora por ${fmtMoney(price)} (90% do valor de mercado)?`, action:"quickSell", payload:id};
    render();
  },
  confirmYes(){
    const m = ST.uiModal;
    ST.uiModal = null;
    if(!m) { render(); return; }
    if(m.action==="quickSell") quickSell(m.payload);
    else if(m.action==="resetCareer") { resetCareer(); return; }
    else if(m.action==="confirmNewGame") { ST.tmpSelectedTeam=null; ST.tmpManagerNameInput=""; ST.stage="team_select"; }
    render();
  },
  openBuyModal(playerId, team){ ST.uiModal={type:"buyOffer", playerId, team}; render(); },
  acceptIncomingOffer(){
    const m = ST.uiModal;
    if(!m || m.type!=="incomingOffer" || m.signing) return;
    m.signing = true; m.signMsg = "Venda Concluída!";
    render();
    setTimeout(()=>{ acceptIncomingOffer(); render(); }, 2200);
  },
  declineIncomingOffer(){ declineIncomingOffer(); render(); },
  submitOffer(playerId, team){
    const m = ST.uiModal;
    if(!m || m.signing) return;
    const input = document.getElementById("offerInput");
    const offer = Math.max(0, Math.round(Number(input.value)||0));
    const res = team==="global" ? buyGlobalPlayer(playerId, offer) : makeOffer(playerId, team, offer);
    const msgEl = document.getElementById("offerMsg");
    if(res.ok){
      m.signing = true; m.signMsg = "Contrato Assinado!";
      render();
      setTimeout(()=>{ ST.uiModal=null; render(); }, 2200);
    } else if(msgEl){
      msgEl.innerHTML = `<span class="red">${esc(res.msg)}</span>`;
    }
  },
  setXferFilter(key, val){
    ST.xferFilter[key]=val;
    if(key!=="page") ST.xferFilter.page=1; // any real filter change jumps back to page 1
    render();
    if(key==="q"){
      const inp = document.getElementById("xferSearchInput");
      if(inp){ inp.focus(); const v=inp.value; inp.value=""; inp.value=v; }
    }
  },
  setXferPage(n){
    ST.xferFilter.page = Math.max(1, n);
    render();
    const main = document.querySelector(".xfer-main");
    if(main) main.scrollIntoView({block:"start"});
  },
  clearXferFilters(){
    const f = ST.xferFilter;
    f.pos="ALL"; f.team="ALL"; f.q=""; f.priceMax=null; f.ageMin=null; f.ageMax=null; f.sort="ovr"; f.page=1;
    render();
  },
  // Live preview while dragging the price slider — avoids a full re-render
  // (which would kill the drag) until the user releases it ("change").
  previewXferPrice(val){
    const v = Number(val);
    const label = document.getElementById("xferPriceLabel");
    const numInput = document.getElementById("xferPriceInput");
    const unlimited = v>=XFER_PRICE_MAX;
    if(label) label.textContent = unlimited ? "Sem limite" : fmtMoney(v);
    if(numInput) numInput.value = unlimited ? "" : String(v);
  },
  // Live preview while typing the exact value — keeps the slider in sync.
  previewXferPriceInput(val){
    const trimmed = String(val).trim();
    const unlimited = trimmed==="";
    const v = unlimited ? XFER_PRICE_MAX : Math.max(0, Math.min(XFER_PRICE_MAX, Math.round(Number(val)||0)));
    const slider = document.getElementById("xferPriceSlider");
    const label = document.getElementById("xferPriceLabel");
    if(slider) slider.value = String(v);
    if(label) label.textContent = unlimited ? "Sem limite" : fmtMoney(Math.round(Number(val)||0));
  },
  generateScout(){ generateScoutReport(); render(); },

  simulateMatch(){ simulatePendingMatch(); render(); },
  skipMatch(){ ST.matchAnimIdx = ST.pendingMatch.result.events.length; render(); },
  continueAfterMatch(){ finishPendingMatch(); render(); },

  showNews(){ ST.uiModal={type:"news"}; render(); },
  continueSeason(){ continueFromSeasonEnd(); maybeIncomingOffer(0.30); render(); },
  acceptJob(name){ selectNewJob(name); maybeIncomingOffer(0.30); render(); },
  stayJob(){ stayAtCurrentJob(); maybeIncomingOffer(0.30); render(); },
  newCareerFromOver(){ resetCareer(); },
};
window.Game = Game;
window.ST = null; // populated below after init for console/debug convenience

// ============================================================
// BOOT
// ============================================================
async function boot(){
  await initApp();
  window.ST = ST;
}
if(typeof document !== "undefined"){
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}

window.__APP_INTERNALS__ = { newCareerState, startCareer, advanceTournament, render, tierOf, buildJobOffers, teamAvgOvr, get ST(){return ST;}, set ST(v){ST=v;} };

