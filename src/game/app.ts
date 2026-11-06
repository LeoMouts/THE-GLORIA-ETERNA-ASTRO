// ============================================================
// LIBERTADORES MANAGER — APP (state, storage, screens)
// build marker: force-fresh-deploy-2026-09-04
// ============================================================
import * as E from "./engine";
import * as WC from "./worldcup";
import NAT_FIX from "./data/natFix.json";
import DUP_REMOVED from "./data/dupRemoved.json";
import { decide as negDecide, newNegState, computeFlex, composeReply, moodBand, moodLine, moodSummary, NEG_CONFIG, roundMoney } from "./negotiation";
import { GAME_DATA as DATA } from "./teams";
import { GLOBAL_MARKET as GLOBAL_MARKET_SRC } from "./market";
import { PRELIB_DATA } from "./prelib"; import FACE_RAW from "./data/faces.json"; import FACE_ALT_RAW from "./data/faces_alt.json"; import TP_RAW from "./data/transferProfile.json"; import POSX_RAW from "./data/positions.json";
import { SERIE_B_2026, SERIE_C_POOL, EXTRA_CREST_SLUGS, serieBTeamsFromData, isSerieBSeedPlayer } from "./serieB";
import { SERIE_A_EXTRA_TEAMS, SERIE_A_2026 } from "./serieA"; import { SULAMERICANA_EXTRA_TEAMS, SULAMERICANA_2026 } from "./sulamericana";

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
  // Pré-Libertadores (Sul-Americana) clubs
  "Vasco da Gama": "/logos/vasco-da-gama.png", "São Paulo": "/logos/sao-paulo.png", "Grêmio": "/logos/gremio.png",
  "Santos": "/logos/santos.png", "River Plate": "/logos/river-plate.png", "Botafogo": "/logos/botafogo.png",
  "Atlético Mineiro": "/logos/atletico-mineiro.png", "Racing": "/logos/racing.png",
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
  // Pré-Libertadores (Sul-Americana) clubs
  "Vasco da Gama": ["#1A1A1A","#FFFFFF"], "São Paulo": ["#B3122A","#1A1A1A"], "Grêmio": ["#0F3F8C","#1A1A1A"],
  "Santos": ["#1A1A1A","#FFFFFF"], "River Plate": ["#FFFFFF","#D2122E"], "Botafogo": ["#1A1A1A","#FFFFFF"],
  "Atlético Mineiro": ["#1A1A1A","#FFFFFF"], "Racing": ["#7EC1E8","#1A1A1A"],
};
// a small set of hand-drawn line icons (stroke-based, currentColor) standing in for emoji
// glyphs in a few specific spots — a real PNG asset isn't something this tool can generate on
// its own (unlike the earlier training icon, which the user supplied), so these are inline
// SVG instead, styled to match the rest of the game's gold/line-art visual language.
function svgIcon(paths, size, viewBox){
  size = size || 16;
  return `<svg viewBox="${viewBox||"0 0 24 24"}" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-3px;flex:0 0 auto;">${paths}</svg>`;
}
function iconGlobe(size){ return svgIcon(`<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>`, size); }
function iconRadar(size){ return svgIcon(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>`, size); }
function iconEnvelope(size){ return svgIcon(`<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/>`, size); }
function iconCoin(size){ return svgIcon(`<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.3 9.3c0-1.4 1.3-2.3 2.7-2.3s2.7.9 2.7 2c0 2.6-5.4 1.5-5.4 4 0 1.1 1.3 2 2.7 2s2.7-.9 2.7-2.3"/>`, size); }
function iconMedical(size){ return svgIcon(`<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7.5v9M7.5 12h9"/>`, size); }
function iconMagnifier(size){ return svgIcon(`<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>`, size); }
function iconBriefcase(size){ return svgIcon(`<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>`, size); }
function crestInitials(name){
  const stop = new Set(["de","del","la","el","fc","sc","central","real"]);
  const words = name.split(/\s+/).filter(w=>!stop.has(w.toLowerCase()));
  if(words.length===1) return words[0].slice(0,3).toUpperCase();
  return words.slice(0,3).map(w=>w[0]).join("").toUpperCase();
}
// Série B / Série C clubs: badges from the SMF crest repository (same CDN as the global-market crests)
function extraCrestUrl(name){ const sl = EXTRA_CREST_SLUGS[name]; return sl ? FENOMENO_CREST_CDN + sl + ".webp" : null; }
function crestSVG(teamName, size){
  size = size || 40;
  const wcI = wcInfo(teamName);
  if(wcI) return wcCrest(wcI.code, size); // seleções da Copa do Mundo: bandeira (sem emoji)
  const logo = TEAM_LOGOS[teamName] || extraCrestUrl(teamName);
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
// ---------- Mercado Global crests (real clubs outside the Libertadores) ----------
// Badges sourced from thefenomeno's public crest CDN (TheSMF-Group/thefenomeno-assets, served via
// jsDelivr — that repo exists specifically to be linked to like this, so no local asset upload needed).
// Covers every club we could confidently match a real crest for; anything not in this map still gets
// the same initials-badge fallback used elsewhere (crestSVG), so every row always has *some* crest.
const FENOMENO_CREST_CDN = "https://cdn.jsdelivr.net/gh/TheSMF-Group/thefenomeno-assets@main/crests/";
const GLOBAL_TEAM_CRESTS = {
  "AC Milan":"ac-milan", "AJ Auxerre":"auxerre", "AS Monaco":"monaco", "AS Saint-Étienne":"saint-etienne",
  "AZ":"az-alkmaar", "Aberdeen FC":"aberdeen", "Ajax":"ajax", "Al Ahli SC":"al-ahli-sa",
  "Al Ahli Saudi FC":"al-ahli-sa", "Al Duhail SC":"al-duhail", "Al Gharafa SC":"al-gharafa", "Al Hilal SFC":"al-hilal",
  "Al Ittihad Club":"al-ittihad", "Al Nassr FC":"al-nassr", "Al Sadd SC":"al-sadd", "Albirex Niigata":"albirex-niigata",
  "Angers SCO":"angers", "Antalyaspor":"antalyaspor", "Arsenal":"arsenal", "Aston Villa":"aston-villa",
  "Atalanta BC":"atalanta", "Athletic Club":"athletic", "Avispa Fukuoka":"avispa-fukuoka", "Bayer 04 Leverkusen":"leverkusen",
  "Borussia Dortmund":"dortmund", "Brighton & Hove Albion":"brighton", "Burnley":"burnley", "CA Boca Juniors":"boca",
  "CA River Plate":"river", "CR Vasco da Gama":"vasco", "Casa Pia AC":"casa-pia", "Celtic FC":"celtic",
  "Cerezo Osaka":"cerezo-osaka", "Chelsea":"chelsea", "Club América":"america", "Como 1907":"como",
  "Consadole Sapporo":"consadole-sapporo", "Corendon Alanyaspor":"alanyaspor", "Crystal Palace":"crystal-palace", "Cádiz CF":"cadiz",
  "Deportivo Alavés":"alaves", "Dundee FC":"dundee-fc", "Dundee United FC":"dundee-utd", "EC Bahia":"bahia",
  "Eintracht Frankfurt":"frankfurt", "Esteghlal FC":"esteghlal", "Everton":"everton", "FC Arouca":"arouca",
  "FC Barcelona":"barcelona", "FC Famalicão":"famalicao", "FC Machida Zelvia":"machida-zelvia", "FC Nantes":"nantes",
  "FC Porto":"porto", "FC Seoul":"fc-seoul", "FC TOKYO":"fc-tokyo", "FC Twente":"twente",
  "FC Utrecht":"utrecht", "Feyenoord":"feyenoord", "Fortuna Sittard":"fortuna-sittard", "GD Estoril Praia":"estoril",
  "Gamba Osaka":"gamba-osaka", "Gaziantep FK":"gaziantep", "Getafe CF":"getafe", "Gil Vicente FC":"gil-vicente",
  "Go Ahead Eagles":"go-ahead-eagles", "Heart of Midlothian FC":"hearts", "Hellas Verona FC":"verona", "Heracles Almelo":"heracles",
  "Hibernian FC":"hibernian", "Internazionale Milano":"inter", "Jubilo Iwata":"jubilo-iwata", "Kashima Antlers":"kashima-antlers",
  "Kashiwa Reysol":"kashiwa-reysol", "Kawasaki Frontale":"kawasaki-frontale", "Kilmarnock FC":"kilmarnock", "Konyaspor":"konyaspor",
  "Kyoto Sanga F.C.":"kyoto-sanga", "LOSC Lille":"lille", "Leeds United":"leeds", "Leicester City":"leicester",
  "Liverpool":"liverpool", "Macarthur FC":"macarthur-fc", "Manchester City":"man-city", "Manchester United":"man-utd",
  "Melbourne City FC":"melbourne-city", "Montpellier Hérault SC":"montpellier", "Moreirense FC":"moreirense", "Motherwell FC":"motherwell",
  "Nagoya Grampus":"nagoya-grampus", "Napoli":"napoli", "Newcastle United":"newcastle", "OGC Nice":"nice",
  "Olympique Lyonnais":"lyon", "Olympique de Marseille":"marseille", "PEC Zwolle":"pec-zwolle", "PSV":"psv",
  "Paris Saint-Germain":"psg", "Parma Calcio 1913":"parma", "RAMS Başakşehir FK":"basaksehir", "RC Lens":"lens",
  "RC Strasbourg Alsace":"strasbourg", "Rangers FC":"rangers", "Real Madrid":"real-madrid", "Real Valladolid":"valladolid",
  "Red Bull Bragantino":"bragantino", "Rio Ave FC":"rio-ave", "S.S. Lazio":"lazio", "SC Internacional":"internacional",
  "SL Benfica":"benfica", "Samsunspor":"samsunspor", "Sanfrecce Hiroshima":"sanfrecce-hiroshima", "Santos FC":"santos",
  "Sepahan SC":"sepahan", "Sevilla FC":"sevilla", "Sheffield United":"sheff-utd", "Shimizu S-Pulse":"shimizu-s-pulse",
  "Southampton":"southampton", "Sparta Rotterdam":"sparta-rotterdam", "Sporting Braga":"braga", "Sporting CP":"sporting",
  "St. Mirren FC":"st-mirren", "Stade Brestois 29":"brest", "Stade Rennais FC":"rennes", "Stade de Reims":"reims",
  "São Paulo F.C.":"sao-paulo", "Tokyo Verdy":"tokyo-verdy", "Torino FC":"torino", "Tottenham Hotspur":"tottenham",
  "Toulouse FC":"toulouse", "Trabzonspor":"trabzonspor", "Tractor FC":"tractor", "Udinese Calcio":"udinese",
  "Ulsan HD FC":"ulsan-hd", "Valencia CF":"valencia", "Villarreal CF":"villarreal", "Vissel Kobe":"vissel-kobe",
  "Vitória SC":"vitoria-sc", "West Bromwich Albion":"west-brom", "West Ham United":"west-ham", "Wolverhampton Wanderers":"wolves",
  "Yokohama F. Marinos":"yokohama-f-marinos", "Zecorner Kayserispor":"kayserispor", "sc Heerenveen":"heerenveen",
  // market.json now carries every club under its real name (the old placeholder names — "Miami BP",
  // "Madrid Rosas RB" etc — were renamed in the data itself), but these placeholder keys stay here too
  // so a save from before that rename still resolves its crests correctly.
  "Miami BP":"inter-miami", "Madrid Rosas RB":"atletico", "Napoli A":"napoli", "Galatasaray SK":"galatasaray",
  "Fenerbahçe SK":"fenerbahce", "Piemonte BN":"juventus", "Firenze V":"fiorentina", "Sunderland RWB":"sunderland",
  "Los Angeles BY":"lafc", "Roma GR":"roma", "Vasco Gipuzkoa AB":"sociedad", "Sevilla Triana VB":"sevilla",
  "Nottingham RW":"nottm-forest", "Atlanta RB":"atlanta-utd", "Fulham":"fulham", "Pamplona RA":"osasuna",
  "Bologna RB":"bologna", "Bournemouth RB":"bournemouth", "Beşiktaş JK":"besiktas",
  // the real names those placeholders now resolve to in the data:
  "Inter Miami":"inter-miami", "Atlético de Madrid":"atletico", "Galatasaray":"galatasaray",
  "Fenerbahçe":"fenerbahce", "Juventus":"juventus", "Fiorentina":"fiorentina",
  "Sunderland":"sunderland", "LAFC":"lafc", "Roma":"roma",
  "Real Sociedad":"sociedad", "Sevilla":"sevilla", "Nottingham Forest":"nottm-forest",
  "Atlanta United":"atlanta-utd", "Osasuna":"osasuna", "Bologna":"bologna", "Bournemouth":"bournemouth",
  "Beşiktaş":"besiktas", "Besiktas":"besiktas",
  // Bayern Munich's real first-team squad, previously dumped into the generic "Free Agents" pool —
  // their club field now literally says "Bayern de Munique", and Mateo Retegui's now says "Al-Qadsiah".
  "Bayern de Munique":"bayern", "Al-Qadsiah":"al-qadsiah",
  // second batch of generic "City + code" placeholders identified and renamed to their real
  // club — Botafogo, Grêmio, Independiente Medellín, Independiente Rivadavia and Atlético Mineiro
  // aren't repeated here since those exact names already resolve via the Libertadores TEAM_LOGOS
  // fallback inside crestSVG().
  "Aldosivi":"aldosivi", "América de Cali":"america-cali", "Argentinos Juniors":"argentinos-jrs", "Atlético Bucaramanga":"bucaramanga",
  "Austin FC":"austin-fc", "Barracas Central":"barracas", "Belgrano":"belgrano", "Blackburn Rovers":"blackburn",
  "Brentford":"brentford", "Bristol City":"bristol-city", "Brøndby IF":"brondby", "CF Montréal":"cf-montreal",
  "Cagliari":"cagliari", "Ceará":"ceara", "Cercle Brugge":"cercle-brugge", "Chapecoense":"chapecoense",
  "Charleroi":"charleroi", "Charlotte FC":"charlotte-fc", "Chicago Fire":"chicago-fire", "Club Brugge":"brugge",
  "Colorado Rapids":"colorado-rapids", "Columbus Crew":"columbus", "Coritiba":"coritiba", "Coventry City":"coventry",
  "Daejeon Hana Citizen":"daejeon-hana-citizen", "Defensa y Justicia":"defensa-justicia", "Deportes Limache":"deportes-limache", "Deportivo Cali":"deportivo-cali",
  "Empoli":"empoli", "Espanyol":"espanyol", "FC Basel":"basel", "FC Cincinnati":"fc-cincinnati",
  "FC Midtjylland":"midtjylland", "Fortaleza":"fortaleza", "Gangwon FC":"gangwon-fc", "Genk":"genk",
  "Genoa":"genoa", "Gent":"gent", "Gimcheon Sangmu":"gimcheon-sangmu", "Houston Dynamo":"houston-dynamo",
  "Hull City":"hull", "Incheon United":"incheon-united", "Independiente":"independiente", "Instituto":"instituto",
  "Ipswich Town":"ipswich", "Jeju SK":"jeju-united", "Juventude":"juventude", "KV Mechelen":"mechelen",
  "Kasımpaşa":"kasimpasa", "LA Galaxy":"la-galaxy", "La Equidad":"la-equidad", "Las Palmas":"las-palmas",
  "Lausanne-Sport":"lausanne-sport", "Lecce":"lecce", "Lugano":"lugano", "Luzern":"luzern",
  "Mallorca":"mallorca", "Middlesbrough":"middlesbrough", "Millonarios":"millonarios", "Millwall":"millwall",
  "Minnesota United":"minnesota-utd", "Monza":"monza", "Nashville SC":"nashville-sc", "New England Revolution":"new-england",
  "New York Red Bulls":"ny-red-bulls", "Once Caldas":"once-caldas", "RSC Anderlecht":"anderlecht", "Racing Club":"racing",
  "Royal Antwerp":"antwerp", "San Lorenzo":"san-lorenzo", "Sporting Kansas City":"sporting-kc", "Standard Liège":"standard",
  "Talleres":"talleres", "Unión La Calera":"union-la-calera", "Vélez Sarsfield":"velez", "Young Boys":"young-boys",
  "Ñublense":"nublense",
  // third batch of generic-name identifications — Rosario RN (Rosario Central) and Vicente López M
  // (Platense) aren't repeated here either, same Libertadores-fallback reason as above.
  "Alianza FC":"alianza-fc", "Audax Italiano":"audax-italiano", "Central Córdoba":"central-cordoba", "Colo-Colo":"colo-colo",
  "D.C. United":"dc-united", "Deportivo Pasto":"pasto", "Deportivo Pereira":"deportivo-pereira", "Everton de Viña del Mar":"everton-vina",
  "FC Nordsjælland":"nordsjaelland", "FC Sion":"sion", "FC St. Gallen":"st-gallen",
  "FC Winterthur":"winterthur", "FC Zürich":"zurich", "Grasshopper Club Zürich":"grasshopper", "Huachipato":"huachipato",
  "Huracán":"huracan", "KVC Westerlo":"westerlo", "Norwich City":"norwich", "Orlando City SC":"orlando-city",
  "Oxford United":"oxford", "Palestino":"palestino", "Philadelphia Union":"philadelphia", "Pohang Steelers":"pohang-steelers",
  "Portland Timbers":"portland-timbers", "Preston North End":"preston", "Queens Park Rangers":"qpr", "Randers FC":"randers",
  "Rayo Vallecano":"rayo-vallecano", "Real Salt Lake":"real-salt-lake", "San Diego FC":"san-diego-fc", "San Jose Earthquakes":"san-jose",
  "Seattle Sounders":"seattle", "Servette FC":"servette", "Sheffield Wednesday":"sheff-wed", "Silkeborg IF":"silkeborg",
  "Sint-Truiden":"sint-truiden", "Sport Recife":"sport-recife", "St. Louis City SC":"st-louis-city", "Stoke City":"stoke",
  "Swansea City":"swansea", "Tigre":"tigre", "Toronto FC":"toronto-fc", "Ulsan HD":"ulsan-hd",
  "Union Saint-Gilloise":"union-sg", "Universidad de Chile":"u-de-chile", "Unión de Santa Fe":"santa-fe", "Vancouver Whitecaps":"vancouver",
  "Vejle BK":"vejle", "Venezia FC":"venezia", "Viborg FF":"viborg", "Watford":"watford",
  "Águilas Doradas":"aguilas-doradas",
  // final 5 — completes all 210 generic "City + code" placeholder names identified in the data.
  "FCV Dender EH":"dender", "Cobresal":"cobresal", "Jeonbuk Hyundai Motors":"jeonbuk-hyundai-motors",
  "Sarmiento de Junín":"sarmiento",
  // re-checked the full 811-file crest repo once more for anything missed on the first pass:
  "Athletico Paranaense":"athletico-pr", "EC Vitória":"vitoria-ba", "Havre AC":"le-havre",
  // "Free Agents" reassigned to their real, current (Sept 2026) club per the user-supplied
  // spreadsheet — Boca Juniors, Cerro Porteño, Flamengo, Santos and Talleres aren't repeated
  // here either, same Libertadores-fallback reason as the batches above.
  "Al-Ahly":"al-ahly", "Al-Arabi SC":"al-arabi-qatar", "Al-Ettifaq":"al-ettifaq", "Al-Fateh":"al-fateh",
  "Al-Hilal":"al-hilal", "Al-Nassr":"al-nassr", "Al-Riyadh":"al-riyadh", "Al-Shamal":"al-shamal",
  "Aris":"aris", "Atlas":"atlas", "Barcelona":"barcelona", "Bodrum FK":"bodrum-fk",
  "Borussia Mönchengladbach":"gladbach", "Dinamo Zagreb":"dinamo-zagreb", "Estrela Vermelha":"red-star-belgrade", "Freiburg":"freiburg",
  "Hoffenheim":"hoffenheim", "Legia Varsóvia":"legia-warsaw", "León":"leon", "Los Angeles FC":"lafc",
  "Mainz 05":"mainz", "Marseille":"marseille", "Monaco":"monaco", "Monterrey":"monterrey",
  "Olimpia":"olimpia", "Olympiacos":"olympiacos", "PAOK":"paok", "Pachuca":"pachuca",
  "Panathinaikos":"panathinaikos", "Pumas UNAM":"pumas", "RB Leipzig":"leipzig", "RB Salzburg":"salzburg",
  "Real Betis":"betis", "Santos Laguna":"santos-laguna", "Shakhtar Donetsk":"shakhtar", "Slavia Praga":"slavia-prague",
  "St. Pauli":"st-pauli", "VfB Stuttgart":"stuttgart", "Villarreal":"villarreal", "Werder Bremen":"werder",
  "Wolfsburg":"wolfsburg", "Wolverhampton":"wolves",
  // the 4 of the 8 new Série A placeholder clubs (serieA.ts) with a real crest available —
  // Bragantino, Athletico-PR, Coritiba and Chapecoense already had one from earlier batches.
  "Internacional":"internacional", "Bahia":"bahia", "Vitória":"vitoria-ba", "Remo":"remo", /* Sul-Americana 2026 field (sulamericana.ts) — 19 of the 25 non-Brasileirão clubs have a real crest; the other 6 (Juventud, O'Higgins, Recoleta, Independiente Petrolero, Deportivo Riestra, Blooming) fall back to the usual initials badge. Olimpia, América de Cali, Tigre, Millonarios, San Lorenzo, Palestino, Audax Italiano and Barracas Central were already mapped above (foreign transfer-market clubs) — same real club, no need to repeat them. */ "Macará":"macara", "Alianza Atlético":"alianza-atletico", "Cienciano":"cienciano", "Puerto Cabello":"academia-puerto-cabello", "Boston River":"boston-river", "Deportivo Cuenca":"deportivo-cuenca", "Racing":"racing", "Caracas":"caracas-fc", "Montevideo City Torque":"montevideo-ct", "River Plate":"river", "Carabobo":"carabobo",
};
let _globalCrestSeq = 0;
function clubCrestImg(clubName, size, playerName){
  size = size || 22;
  const wcI = wcInfo(clubName);
  if(wcI) return wcCrest(wcI.code, size);
  const slug = GLOBAL_TEAM_CRESTS[clubName];
  const fallback = crestSVG(clubName, size);
  if(!slug) return fallback;
  const fbId = "fb"+Math.abs(hashStr(clubName+"|"+slug))+"_"+(_globalCrestSeq++);
  return `<span style="display:inline-flex;width:${size}px;height:${size}px;flex:0 0 auto;">
    <img src="${FENOMENO_CREST_CDN}${slug}.webp" alt="${esc(clubName)}" width="${size}" height="${size}" loading="lazy"
      style="display:block;width:${size}px;height:${size}px;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45));"
      onerror="this.style.display='none';document.getElementById('${fbId}').style.display='block';"/>
    <span id="${fbId}" style="display:none;width:${size}px;height:${size}px;">${fallback}</span>
  </span>`;
}
// ---------- real kit renders (Elenco tab only) — camisa 1 of each Libertadores club, line + goalkeeper ----------
/* ---------- player portraits: Transfermarkt retratos from TheSMF-Group/assets (faces/<tm_id>.png), matched to game players by data/faces.json ({gameId: tm_id}). A player without a portrait renders nothing here, so every caller just falls back to its old name-and-crest look. ---------- */
const FACE_CDN = "https://cdn.jsdelivr.net/gh/TheSMF-Group/assets@main/faces/";
const FACE_BY_ID = FACE_RAW as unknown as Record<string, number>;
/* portraits not (yet) in the assets repo: tail of the Transfermarkt portrait URL, tried once when the CDN copy 404s. Dropping a <tm_id>.png into TheSMF-Group/assets/faces makes the CDN copy win with no code change. */
const FACE_TM_BASE = "https://img.a.transfermarkt.technology/portrait/medium/";
const FACE_ALT = FACE_ALT_RAW as unknown as Record<string, string>;
(window as any).__faceAlt = FACE_ALT; (window as any).__faceAltBase = FACE_TM_BASE;
let _faceNameTm: Record<string, number> | null = null;
let _faceNamePosTm: Record<string, number> | null = null;
let _faceIdName: Record<string, string> | null = null;
function buildFaceIndex(){
  const nameTm: Record<string, number> = {};
  const namePosTm: Record<string, number> = {};
  const idName: Record<string, string> = {};
  const eat = (p: any) => {
    if(!p || p.id==null || !p.name) return;
    const tm = FACE_BY_ID[p.id] || 0;
    if(tm) idName[p.id] = p.name;
    const prev = nameTm[p.name];
    nameTm[p.name] = (prev===undefined || prev===tm) ? tm : -1;
    const k2 = p.name + "|" + p.pos;
    const prev2 = namePosTm[k2];
    namePosTm[k2] = (prev2===undefined || prev2===tm) ? tm : -1;
  };
  const eatTeams = (obj: any) => { for(const k in obj){ const pl = obj[k] && obj[k].players; if(pl) pl.forEach(eat); } };
  GLOBAL_MARKET_SRC.forEach(eat);
  eatTeams((DATA as any).teams); eatTeams(SERIE_A_EXTRA_TEAMS); eatTeams(SULAMERICANA_EXTRA_TEAMS); eatTeams((PRELIB_DATA as any).teams);
  _faceNameTm = nameTm; _faceNamePosTm = namePosTm; _faceIdName = idName;
}
/* by id, but only when the stored name still matches - a runtime-generated player that happens to reuse an id never borrows someone else's face */
function faceTmFor(p: any){
  if(!p || p.id==null) return 0;
  if(!_faceNameTm) buildFaceIndex();
  const tm = FACE_BY_ID[p.id] || 0;
  return (tm && (_faceIdName as any)[p.id]===p.name) ? tm : 0;
}
/* by name only (the Fabrizio Romano feed has no ids) - names shared by two different game players with different faces are skipped */
function faceTmByName(name: string, pos?: string){
  if(!_faceNameTm) buildFaceIndex();
  const tm = (_faceNameTm as any)[name];
  if(tm>0) return tm;
  const tm2 = pos ? (_faceNamePosTm as any)[name + "|" + pos] : 0;
  return tm2>0 ? tm2 : 0;
}
function faceImgTag(tm: number, w: number, h: number, cls?: string){
  if(!tm) return "";
  // CDN copy -> Transfermarkt copy (once) -> the anonymous silhouette, never an empty gap
  return `<img class="pface ${cls||''}" src="${FACE_CDN}${tm}.png" alt="" width="${w}" height="${h}" loading="lazy" style="width:${w}px;height:${h}px;" onerror="var a=window.__faceAlt&&window.__faceAlt['${tm}'];if(a&&!this.dataset.fb){this.dataset.fb=1;this.src=window.__faceAltBase+a;}else{this.outerHTML=window.__anonFace(${w},${h},this.className);}"/>`;
}
/* no portrait: a black anonymous-person silhouette on a light disc, same size and round shape as a real photo (an inline SVG, not an emoji) */
function anonFaceTag(size: number, cls?: string){
  return `<span class="pface pface-round pface-anon ${cls||''}" style="width:${size}px;height:${size}px;"><svg viewBox="0 0 24 24" width="${Math.round(size*0.72)}" height="${Math.round(size*0.72)}" aria-hidden="true"><circle cx="12" cy="8.6" r="4.3" fill="#111"/><path d="M3.6 23c0-5 3.7-8.4 8.4-8.4s8.4 3.4 8.4 8.4z" fill="#111"/></svg></span>`;
}
function playerFaceImg(p: any, size: number, cls?: string){ return faceImgTag(faceTmFor(p), size, size, "pface-round " + (cls||"")) || anonFaceTag(size, cls); }
function playerFaceByName(name: string, size: number, cls?: string, pos?: string){ return faceImgTag(faceTmByName(name, pos), size, size, "pface-round " + (cls||"")) || anonFaceTag(size, cls); }
function playerFolderPhoto(p: any){
  const img = faceImgTag(faceTmFor(p), 78, 101, "pface-folder");
  if(img) return img;
  return `<span class="pface pface-folder pface-anon" style="width:78px;height:101px;"><svg viewBox="0 0 24 24" width="62" height="62" aria-hidden="true"><circle cx="12" cy="8.6" r="4.3" fill="#111"/><path d="M3.6 23c0-5 3.7-8.4 8.4-8.4s8.4 3.4 8.4 8.4z" fill="#111"/></svg></span>`;
}
(window as any).__anonFace = (w: number, h: number, cls: string) => (cls||"").indexOf("pface-folder")>=0
  ? `<span class="pface pface-folder pface-anon" style="width:${w}px;height:${h}px;"><svg viewBox="0 0 24 24" width="62" height="62" aria-hidden="true"><circle cx="12" cy="8.6" r="4.3" fill="#111"/><path d="M3.6 23c0-5 3.7-8.4 8.4-8.4s8.4 3.4 8.4 8.4z" fill="#111"/></svg></span>`
  : anonFaceTag(w, (cls||"").replace(/\bpface-anon\b|\bpface\b/g,"").trim());
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
  // Pré-Libertadores (Sul-Americana) clubs
  "Vasco da Gama": "/images/kits/outfield/outfield/vasco-da-gama.png", "São Paulo": "/images/kits/outfield/outfield/sao-paulo.png",
  "Grêmio": "/images/kits/outfield/outfield/gremio.png", "Santos": "/images/kits/outfield/outfield/santos.png",
  "River Plate": "/images/kits/outfield/outfield/river-plate.png", "Botafogo": "/images/kits/outfield/outfield/botafogo.png",
  "Atlético Mineiro": "/images/kits/outfield/outfield/atletico-mineiro.png", "Racing": "/images/kits/outfield/outfield/racing.png",
  // Brasileirão clubs that never had a real kit render before (the 8 with no Libertadores/Pré-Lib squad)
  "Red Bull Bragantino": "/images/kits/outfield/outfield/red-bull-bragantino.png", "Internacional": "/images/kits/outfield/outfield/internacional.png",
  "Bahia": "/images/kits/outfield/outfield/bahia.png", "Vitória": "/images/kits/outfield/outfield/vitoria.png",
  "Athletico Paranaense": "/images/kits/outfield/outfield/athletico-paranaense.png", "Coritiba": "/images/kits/outfield/outfield/coritiba.png",
  "Chapecoense": "/images/kits/outfield/outfield/chapecoense.png", "Remo": "/images/kits/outfield/outfield/remo.png",
  // Sul-Americana 2026 field — the 23 non-Brasileirão clubs that aren't already Libertadores/transfer-market sides
  "América de Cali": "/images/kits/outfield/outfield/america-de-cali.png", "Tigre": "/images/kits/outfield/outfield/tigre.png",
  "Macará": "/images/kits/outfield/outfield/macara.png", "Alianza Atlético": "/images/kits/outfield/outfield/alianza-atletico.png",
  "Cienciano": "/images/kits/outfield/outfield/cienciano.png", "Puerto Cabello": "/images/kits/outfield/outfield/puerto-cabello.png",
  "Juventud": "/images/kits/outfield/outfield/juventud.png", "Millonarios": "/images/kits/outfield/outfield/millonarios.png",
  "Boston River": "/images/kits/outfield/outfield/boston-river.png", "O'Higgins": "/images/kits/outfield/outfield/ohiggins.png",
  "San Lorenzo": "/images/kits/outfield/outfield/san-lorenzo.png", "Deportivo Cuenca": "/images/kits/outfield/outfield/deportivo-cuenca.png",
  "Recoleta": "/images/kits/outfield/outfield/recoleta.png", "Caracas": "/images/kits/outfield/outfield/caracas.png",
  "Independiente Petrolero": "/images/kits/outfield/outfield/independiente-petrolero.png", "Palestino": "/images/kits/outfield/outfield/palestino.png",
  "Montevideo City Torque": "/images/kits/outfield/outfield/montevideo-city-torque.png", "Deportivo Riestra": "/images/kits/outfield/outfield/deportivo-riestra.png",
  "Olimpia": "/images/kits/outfield/outfield/olimpia.png", "Audax Italiano": "/images/kits/outfield/outfield/audax-italiano.png",
  "Barracas Central": "/images/kits/outfield/outfield/barracas-central.png", "Blooming": "/images/kits/outfield/outfield/blooming.png",
  "Carabobo": "/images/kits/outfield/outfield/carabobo.png",
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
  // Pré-Libertadores (Sul-Americana) clubs
  "Vasco da Gama": "/images/kits/gk/gk/vasco-da-gama.png", "São Paulo": "/images/kits/gk/gk/sao-paulo.png",
  "Grêmio": "/images/kits/gk/gk/gremio.png", "Santos": "/images/kits/gk/gk/santos.png",
  "River Plate": "/images/kits/gk/gk/river-plate.png", "Botafogo": "/images/kits/gk/gk/botafogo.png",
  "Atlético Mineiro": "/images/kits/gk/gk/atletico-mineiro.png", "Racing": "/images/kits/gk/gk/racing.png",
  // Brasileirão clubs that never had a real kit render before (the 8 with no Libertadores/Pré-Lib squad)
  "Red Bull Bragantino": "/images/kits/gk/gk/red-bull-bragantino.png", "Internacional": "/images/kits/gk/gk/internacional.png",
  "Bahia": "/images/kits/gk/gk/bahia.png", "Vitória": "/images/kits/gk/gk/vitoria.png",
  "Athletico Paranaense": "/images/kits/gk/gk/athletico-paranaense.png", "Coritiba": "/images/kits/gk/gk/coritiba.png",
  "Chapecoense": "/images/kits/gk/gk/chapecoense.png", "Remo": "/images/kits/gk/gk/remo.png",
  // Sul-Americana 2026 field — the 23 non-Brasileirão clubs that aren't already Libertadores/transfer-market sides
  "América de Cali": "/images/kits/gk/gk/america-de-cali.png", "Tigre": "/images/kits/gk/gk/tigre.png",
  "Macará": "/images/kits/gk/gk/macara.png", "Alianza Atlético": "/images/kits/gk/gk/alianza-atletico.png",
  "Cienciano": "/images/kits/gk/gk/cienciano.png", "Puerto Cabello": "/images/kits/gk/gk/puerto-cabello.png",
  "Juventud": "/images/kits/gk/gk/juventud.png", "Millonarios": "/images/kits/gk/gk/millonarios.png",
  "Boston River": "/images/kits/gk/gk/boston-river.png", "O'Higgins": "/images/kits/gk/gk/ohiggins.png",
  "San Lorenzo": "/images/kits/gk/gk/san-lorenzo.png", "Deportivo Cuenca": "/images/kits/gk/gk/deportivo-cuenca.png",
  "Recoleta": "/images/kits/gk/gk/recoleta.png", "Caracas": "/images/kits/gk/gk/caracas.png",
  "Independiente Petrolero": "/images/kits/gk/gk/independiente-petrolero.png", "Palestino": "/images/kits/gk/gk/palestino.png",
  "Montevideo City Torque": "/images/kits/gk/gk/montevideo-city-torque.png", "Deportivo Riestra": "/images/kits/gk/gk/deportivo-riestra.png",
  "Olimpia": "/images/kits/gk/gk/olimpia.png", "Audax Italiano": "/images/kits/gk/gk/audax-italiano.png",
  "Barracas Central": "/images/kits/gk/gk/barracas-central.png", "Blooming": "/images/kits/gk/gk/blooming.png",
  "Carabobo": "/images/kits/gk/gk/carabobo.png",
};
// Elenco pitch jersey: real camisa 1 render when we have one for the club (outfield vs. goalkeeper
// kit chosen by slot), falling back to the generic tinted SVG for anything missing.
/* real playing positions (primary + up to two secondary, from the SMF Arena base, mapped to this game's position codes): merged into each known player's altPos so lineups, match strength and the AI squads all use them */
const POSX = POSX_RAW as unknown as Record<string, string[]>;
function applyRealPositions(p: any){
  const x = p && p.id!=null ? POSX[p.id] : null;
  if(!x) return;
  const merged = (p.altPos && p.altPos.length) ? p.altPos.slice() : [p.pos];
  x.forEach((c: string) => { if(!merged.includes(c)) merged.push(c); });
  p.altPos = merged;
}
function applyRealPositionsAll(){
  const eatTeams = (obj: any) => { for(const k in obj){ const pl = obj[k] && obj[k].players; if(pl) pl.forEach(applyRealPositions); } };
  GLOBAL_MARKET_SRC.forEach(applyRealPositions);
  eatTeams((DATA as any).teams); eatTeams(SERIE_A_EXTRA_TEAMS); eatTeams(SULAMERICANA_EXTRA_TEAMS); eatTeams((PRELIB_DATA as any).teams);
}
applyRealPositionsAll();
/* old saves carry their own copies of every player, so they get the same merge once on load */
function applyRealPositionsToWorld(world: any){
  if(!world) return;
  for(const k in (world.teams||{})){ const pl = world.teams[k] && world.teams[k].players; if(pl) pl.forEach(applyRealPositions); }
  (world.globalMarket||[]).forEach(applyRealPositions);
  (world.prelibMarket||[]).forEach(applyRealPositions);
}
function posList(p: any){
  const out: string[] = [p.pos];
  (p.altPos||[]).forEach((c: string) => { if(!out.includes(c)) out.push(c); });
  return out;
}
function posBadges(p: any){
  const [main, ...rest] = posList(p);
  return `<span class="badge badge-pos">${main}</span>${rest.map(c=>`<span class="badge badge-pos badge-pos2">${c}</span>`).join("")}`;
}
/* shirts from the SMF kit repo for every club that has no local kit of its own: only the transparent cutouts (the repo also holds photos with a person wearing the shirt, which would look wrong in a jersey slot), keyed by the same slug the crest uses */
const FENOMENO_KIT_CDN = "https://cdn.jsdelivr.net/gh/TheSMF-Group/thefenomeno-assets@main/kits/";
const KIT_CUTOUT_SLUGS = new Set(["aberdeen","ac-milan","ajax","al-ahli-sa","alaves","aldosivi","alianza-fc","america","america-cali","anderlecht","angers","antwerp","argentinos-jrs","arouca","arsenal","aston-villa","atalanta","athletic","athletico-pr","atlanta-utd","atlas","atletico","audax-italiano","auxerre","avispa-fukuoka","az-alkmaar","bahia","barcelona","basaksehir","basel","bayern","belgrano","benfica","besiktas","betis","blackburn","boca","bologna","bournemouth","braga","bragantino","brentford","brest","brighton","bristol-city","brondby","brugge","bucaramanga","burnley","cagliari","ceara","cercle-brugge","chapecoense","charleroi","chelsea","chicago-fire","colorado-rapids","columbus","como","coritiba","coventry","crystal-palace","dc-united","defensa-justicia","deportivo-pereira","dinamo-zagreb","dortmund","empoli","espanyol","estoril","everton","fc-cincinnati","fc-seoul","fenerbahce","feyenoord","fiorentina","fortaleza","frankfurt","freiburg","fulham","galatasaray","gangwon-fc","genk","genoa","gent","getafe","gil-vicente","gladbach","heerenveen","heracles","hoffenheim","houston-dynamo","hull","huracan","independiente","inter","internacional","ipswich","jeju-united","jeonbuk-hyundai-motors","juventus","kasimpasa","konyaspor","la-galaxy","lafc","las-palmas","lazio","le-havre","lecce","leeds","legia-warsaw","leicester","leipzig","lens","leon","leverkusen","lille","liverpool","lyon","mainz","mallorca","man-city","man-utd","marseille","mechelen","melbourne-city","middlesbrough","midtjylland","millwall","minnesota-utd","monaco","monterrey","montpellier","monza","moreirense","nantes","napoli","new-england","newcastle","nice","nordsjaelland","nottm-forest","ny-red-bulls","orlando-city","osasuna","pachuca","panathinaikos","paok","pec-zwolle","philadelphia","pohang-steelers","portland-timbers","porto","preston","psg","psv","pumas","qpr","racing","randers","rayo-vallecano","real-madrid","real-salt-lake","red-star-belgrade","reims","rennes","rio-ave","river","roma","san-jose","san-lorenzo","santos","sao-paulo","sarmiento","sevilla","shakhtar","sheff-utd","sheff-wed","silkeborg","sint-truiden","sociedad","southampton","sport-recife","sporting","sporting-kc","st-pauli","standard","stoke","strasbourg","stuttgart","sunderland","swansea","tigre","torino","toronto-fc","tottenham","toulouse","trabzonspor","twente","udinese","utrecht","valencia","valladolid","vancouver","vasco","velez","venezia","verona","villarreal","vitoria-ba","vitoria-sc","watford","werder","west-brom","west-ham","westerlo","wolfsburg"]);
function jerseyImage(teamName, isGK, size){
  size = size || 40;
  const src = isGK ? TEAM_KIT_GK[teamName] : TEAM_KIT_OUTFIELD[teamName];
  const cdnSlug = !isGK && !src ? GLOBAL_TEAM_CRESTS[teamName] : null;
  if(cdnSlug && KIT_CUTOUT_SLUGS.has(cdnSlug)) return `<img src="${FENOMENO_KIT_CDN}${cdnSlug}.png" alt="${esc(teamName)} linha" loading="lazy" style="display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));"/>`;
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
const TRAINING_ICON = "/images/training-icon.png"; // dumbbell + shaker + cone illustration
const SOFASCORE_LOGO = "/images/press/sofascore_logo_transparent.png"; // "Seleção da Semana" e-mails are sent under this brand — see closeRatingRound()/renderTotwMailBody()
const TROPHY_ASPECT = 250/609; // width/height of the source cutout
function trophyImg(height, opacity){
  height = height || 120;
  opacity = opacity==null ? 1 : opacity;
  const w = Math.round(height*TROPHY_ASPECT);
  return `<img src="${TROPHY_IMG}" alt="Taça CONMEBOL Libertadores" width="${w}" height="${height}" loading="lazy" style="display:block;height:${height}px;width:${w}px;opacity:${opacity};filter:drop-shadow(0 4px 14px rgba(0,0,0,.5));"/>`;
}
// real trophy art for every OTHER competition — same "thefenomeno" asset repo the crest CDN
// already pulls from, just its trophies/ folder. Never reuse the Libertadores cutout above for
// these: each competition gets its own actual trophy, not a stand-in.
const TROPHY_CDN = "https://cdn.jsdelivr.net/gh/TheSMF-Group/thefenomeno-assets@main/trophies/";
const COMPETITION_TROPHIES = {
  brasileirao: {url:TROPHY_CDN+"LG_BRA1.png", alt:"Taça Brasileirão"},
  brasileiraoB: {url:TROPHY_CDN+"LG_BRA2.png", alt:"Taça Brasileirão Série B"},
  copa: {url:TROPHY_CDN+"DOM_BRA.png", alt:"Taça Copa do Brasil"},
  libertadores: {url:TROPHY_CDN+"LIB.png", alt:"Taça CONMEBOL Libertadores"},
  sulamericana: {url:TROPHY_CDN+"SUD.png", alt:"Taça CONMEBOL Sul-Americana"},
  intercontinental: {url:TROPHY_CDN+"ICC.png", alt:"Taça Intercontinental FIFA"},
  worldcup: {url:TROPHY_CDN+"WC.png", alt:"Taça da Copa do Mundo"},
};
function competitionTrophyImg(compType, height, opacity){
  if(compType==="brasileirao" && ST && ST.mode==="brasileirao" && ST.brasileirao && ST.brasileirao.division==="B") compType = "brasileiraoB";
  const t = COMPETITION_TROPHIES[compType] || COMPETITION_TROPHIES.brasileirao;
  height = height || 120;
  opacity = opacity==null ? 1 : opacity;
  return `<img src="${t.url}" alt="${esc(t.alt)}" height="${height}" loading="lazy" style="display:block;height:${height}px;width:auto;max-width:${Math.round(height*0.88)}px;opacity:${opacity};filter:drop-shadow(0 4px 14px rgba(0,0,0,.5));"/>`;
}
function cornerWatermarks(){
  return `
  <div style="position:fixed;top:-30px;left:-30px;pointer-events:none;z-index:0;">${trophyImg(220,0.07)}</div>
  <div style="position:fixed;bottom:-40px;right:-30px;pointer-events:none;z-index:0;transform:rotate(8deg);">${trophyImg(280,0.06)}</div>
  `;
}


// ---------- storage shim (works with real window.storage or a memory fallback for testing) ----------
// falls back to localStorage (durable across reloads/tab closes in this browser) when no
// window.storage bridge is present — a pure in-memory object here would silently lose every
// save the instant the page reloads, which is exactly the scenario "carreira salva" promises to survive.
const memStore = {};
let lsOk = true;
try{ const t="__ls_test__"; window.localStorage.setItem(t,"1"); window.localStorage.removeItem(t); }catch(e){ lsOk=false; }
const STORE = (window.storage) ? window.storage : {
  async get(k){
    if(lsOk){ try{ const v=window.localStorage.getItem(k); return v==null?null:{key:k,value:v}; }catch(e){} }
    return (k in memStore) ? {key:k, value:memStore[k]} : null;
  },
  async set(k,v){
    if(lsOk){ try{ window.localStorage.setItem(k,v); return {key:k,value:v}; }catch(e){} }
    memStore[k]=v; return {key:k,value:v};
  },
  async delete(k){
    if(lsOk){ try{ window.localStorage.removeItem(k); }catch(e){} }
    delete memStore[k]; return {key:k,deleted:true};
  },
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

// ============================================================
// BRASILEIRÃO — full 20-club Série A career (see serieA.ts). Rosters come from three different
// places depending on which project phase first generated that club — 6 from the main
// Libertadores world (DATA.teams), 6 from the Pré-Libertadores pool (PRELIB_DATA.teams), and 8
// brand-new placeholder squads (SERIE_A_EXTRA_TEAMS) — this just needs to find whichever one
// actually has a given club, transparently, everywhere else in the file.
// ============================================================
function serieATeamSource(name){
  return DATA.teams[name] || PRELIB_DATA.teams[name] || SERIE_A_EXTRA_TEAMS[name] || null;
} /* same idea for the Sul-Americana 2026 field — River Plate and Racing already have real, fully-fleshed rosters in prelib.json (the Pré-Libertadores pool), so serieATeamSource() already finds those two; only the other 23 clubs (never in this game before) need SULAMERICANA_EXTRA_TEAMS's generated squads. */ function sulamericanaTeamSource(name){ return serieATeamSource(name) || SULAMERICANA_EXTRA_TEAMS[name] || null; }
function freshBrasaWorld(){
  const teams = {};
  SERIE_A_2026.forEach(name=>{
    const t = serieATeamSource(name);
    if(!t) return; // shouldn't happen — SERIE_A_2026 is exactly the union of the 3 sources
    const players = t.players.map(p=>Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0}));
    let maxId = 0; players.forEach(p=>{ if(p.id>maxId) maxId=p.id; });
    if(maxId>nextIdCounter) nextIdCounter = maxId;
    teams[name] = { name, country:"Brasil", flag:"🇧🇷", group:null, source:t.source||"gen", players };
  });
  // the 20 Série B clubs play for real too: their squads (the real ones that sat in the market data) become teams of the world
  const bTeams = serieBTeamsFromData();
  SERIE_B_2026.forEach(name=>{
    const t = bTeams[name];
    t.players.forEach(p=>{ if(p.id>nextIdCounter) nextIdCounter = p.id; });
    teams[name] = t;
  });
  GLOBAL_MARKET_SRC.forEach(p=>{ if(p.id>nextIdCounter) nextIdCounter=p.id; });
  return { groups:null, teams, globalMarket: GLOBAL_MARKET_SRC.filter(p=>!isSerieBSeedPlayer(p)).map(p=>Object.assign({}, p)) };
}
// ---------- the Brazilian pyramid: Série A + Série B play every season; 4 go down, 4 come up ----------
function serieANames(){ return (ST.divisions && ST.divisions.A) || SERIE_A_2026; }
function serieBNames(){ return (ST.divisions && ST.divisions.B) || SERIE_B_2026; }
function divisionLabel(d){ return d==="B" ? "Série B" : "Série A"; }
function buildLeague(division, names, year){
  const order = shuffled(E.makeRNG(nextSeed()), names);
  return { year, division, teams: names.slice(), rounds: E.doubleRoundRobin(order), currentRound: 0, standings: {}, scorers: {}, assisters: {} };
}
// the league the user is NOT in still plays every round alongside (quiet fast sims) so promotion/relegation is real
function playOtherLeagueRound(){
  const b = ST.brasileirao;
  if(b) playOtherRoundsUpTo(b.currentRound+1);
}
function playOtherRoundsUpTo(limit){
  const o = ST.otherLeague;
  if(!o) return;
  while(o.currentRound < limit && o.currentRound < o.rounds.length){
    o.rounds[o.currentRound].forEach(m=>{
      if(m.played) return;
      const res = simFast(m.home, m.away, "other", true);
      m.hs = res.homeScore; m.as = res.awayScore; m.played = true;
      E.applyResultToStandings(o.standings, m.home, m.away, m.hs, m.as);
    });
    o.currentRound++;
  }
}
// careers saved before the Série B existed: build the 20 Série B squads from what is still in the saved market (the real
// players tagged with their club), complete thin squads with the original rosters, and catch the Série B up to the current round
function ensureDivisions(){
  if(ST.mode!=="brasileirao" || !ST.world || !ST.brasileirao) return;
  const b = ST.brasileirao;
  if(!b.division) b.division = "A";
  if(!b.teams) b.teams = SERIE_A_2026.slice();
  if(ST.divisions && ST.otherLeague) return;
  const world = ST.world;
  const seed = serieBTeamsFromData();
  const used = new Set();
  Object.values(world.teams).forEach(t=>t.players.forEach(p=>used.add(p.id)));
  const byClub = {};
  (world.globalMarket||[]).forEach(p=>{ if(p.league==="Brazilian 2nd Division" && SERIE_B_2026.includes(p.club)) (byClub[p.club]=byClub[p.club]||[]).push(p); });
  const taken = new Set();
  SERIE_B_2026.forEach(name=>{
    if(world.teams[name]) return;
    const clean = p=>{ const c = Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0}); delete c.club; delete c.league; return c; };
    const players = (byClub[name]||[]).map(p=>{ taken.add(p.id); return clean(p); });
    if(players.length<24){
      seed[name].players.forEach(p=>{ if(players.length<28 && !used.has(p.id) && !taken.has(p.id) && !players.some(x=>x.id===p.id)){ players.push(p); taken.add(p.id); } });
    }
    world.teams[name] = { name, country:"Brasil", flag:"🇧🇷", group:null, source:"real", players };
  });
  if(Array.isArray(world.globalMarket)) world.globalMarket = world.globalMarket.filter(p=>!taken.has(p.id));
  ST.divisions = { A: SERIE_A_2026.slice(), B: SERIE_B_2026.slice() };
  ST.serieCPool = SERIE_C_POOL.slice();
  ST.otherLeague = buildLeague("B", ST.divisions.B, b.year || ST.seasonYear);
  playOtherRoundsUpTo(b.currentRound);
}
// every foreign club of the Libertadores / Sul-Americana fields has its real squad in the world from the start (not only when the
// user's own club qualifies), so the whole continental market — Boca, River, Peñarol... — is always there to scout and buy from
function ensureForeignClubs(){
  if(ST.mode!=="brasileirao" || !ST.world) return;
  const names = new Set();
  try{ Object.values(libertadoresGroupsForYear(2026)).flat().forEach(n=>names.add(n)); }catch(e){}
  Object.values(SULAMERICANA_2026).flat().forEach(n=>names.add(n));
  names.forEach(name=>{
    if(ST.world.teams[name] || isBrazilianClubName(name)) return;
    const src = sulamericanaTeamSource(name);
    if(!src || !src.country || src.country==="Brasil") return;
    const players = src.players.map(p=>Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0}));
    players.forEach(p=>{ if(p.id>nextIdCounter) nextIdCounter = p.id; });
    ST.world.teams[name] = { name, country: src.country||"", flag: src.flag||"", group:null, source: src.source||"gen", players };
    if(Array.isArray(ST.world.prelibMarket)) ST.world.prelibMarket = ST.world.prelibMarket.filter(p=>p.club!==name); // saved careers: drop the old duplicate listing
  });
}
// squad for a Série C club that has just come up (there are no real rosters for them): ~26 generated players around Série B level
function ensureSerieCTeam(name){
  if(ST.world.teams[name]) return;
  const rng = E.makeRNG(nextSeed());
  const layout = ["GK","GK","GK","CB","CB","CB","CB","CB","LB","LB","RB","RB","DMF","DMF","DMF","CM","CM","CM","AM","AM","LW","LW","RW","RW","ST","ST","ST","ST"];
  const pool = NAME_POOLS["Brasil"];
  const players = layout.map(pos=>{
    const age = 19 + Math.floor(rng()*15);
    const ovr = E.clamp(54 + Math.floor(rng()*13) - (pos==="GK"?1:0), 46, 68);
    const pot = E.clamp(ovr + (age<=22 ? 4+Math.floor(rng()*10) : Math.floor(rng()*3)), ovr, 80);
    const isGk = pos==="GK";
    const j = spread => E.clamp(ovr + Math.floor((rng()-0.5)*spread), 30, 90);
    return {id:nextId(), name:pick(rng,pool[0])+" "+pick(rng,pool[1]), nat:"Brasil", age, pos, altPos:[pos], ovr, pot,
      pac:j(18), sho:isGk?Math.floor(rng()*20)+15:j(16), pas:j(14), dri:isGk?j(20):j(14), de:j(16), phy:j(14), gk:isGk?j(14):Math.floor(rng()*20)+15,
      value:E.calcValue(ovr, age, pot), foot:rng()<0.78?"Right foot":"Left foot", injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0};
  });
  ST.world.teams[name] = { name, country:"Brasil", flag:"🇧🇷", group:null, source:"gen", players };
}
// moves clubs between the divisions at the end of a season (4 down from A, 4 up from B, 4 down from B to the Série C pool, 4 up from it)
function applyDivisionMovement(tableA, tableB){
  const rel = tableA.slice(16).map(r=>r.team), prom = tableB.slice(0,4).map(r=>r.team), drop = tableB.slice(16).map(r=>r.team);
  const rng = E.makeRNG(nextSeed());
  const pool = (ST.serieCPool || SERIE_C_POOL.slice()).filter(n=>!(ST.world.teams[n] && (ST.divisions.A.includes(n)||ST.divisions.B.includes(n))));
  const risen = shuffled(rng, pool).slice(0,4);
  ST.divisions = {
    A: ST.divisions.A.filter(n=>!rel.includes(n)).concat(prom),
    B: ST.divisions.B.filter(n=>!prom.includes(n) && !drop.includes(n)).concat(rel, risen),
  };
  ST.serieCPool = pool.filter(n=>!risen.includes(n)).concat(drop);
  risen.forEach(ensureSerieCTeam);
  return {rel, prom, drop, risen};
}
// prize money by final league position — champion earns roughly what a season-long Libertadores
// run pays out; last place still gets something (real broadcast-revenue floor), so a rough year
// never fully wipes out next season's transfer budget.
function brasaPrizeForPosition(pos){
  const top = 24000000, bottom = 3500000;
  const frac = (20-pos)/19;
  return Math.round((bottom + (top-bottom)*frac)/50000)*50000;
}
function startBrasileiraoCareer(teamId, managerName){
  ST.prelib = null;
  ST.mode = "brasileirao";
  ST.careerStats = {goals:{}, assists:{}, signings:[]};
  ST.world = freshBrasaWorld();
  ensureGlobalMarket();
  ST.teamId = teamId;
  ensureForeignClubs();
  ensurePrelibMarket();
  ST.teamId = teamId;
  ST.managerName = managerName || "Treinador";
  ST.seasonNum = 1;
  ST.seasonYear = 2026;
  ST.reputation = 50;
  ST.budget = [0, 1800000, 3800000, 7500000, 15000000, 26000000][tierOf(ST.world, teamId)]; // starting kitty follows the club's own level
  ST.history = [];
  ST.newsLog = [{title:"Bem-vindo!", text:`${mgrName(ST.managerName)} assume o comando do ${teamId} para a campanha de ${ST.seasonYear} do Brasileirão Série A.`}];
  ST.stage = "hub";
  ST.hubTab = "competicao";
  ST.formation = "4-3-3";
  ST.lineup = [];
  ST.captainId = null;
  ST.pendingMatch = null;
  ST.uiModal = null;
  ST.matchAnimIdx = 0;
  ST.matchPlaying = false;
  ST.matchClockMinute = 0;
  ST.jobOffers = null;
  ST.fired = false;
  ST.underdogOffer = false;
  ST.lastSeasonSummary = null;
  ST.calendarDaysLeft = null;
  ST.calendarWeekdayIdx = 1;
  ST.inbox = [];
  ST.mailSeq = 0;
  ST.openMailId = null;
  ST.scoutedFixtureKey = null;
  ST.scoutLevel = 1;
  ST.scoutReport = null;
  ST.scoutReportETA = null;
  ST.scoutSeason = 0;
  ST.scoutLastReportMatchCount = 0;
  ST.matchesPlayedTotal = 0;
  ST.observationQueue = [];
  ST.observedKeys = [];
  ST.daysSinceTraining = 0;
  ST.trainingPending = false;
  ST.trainingResult = null;
  ST.transferFeed = [];
  ST.dayCounter = 0;
  ST.xferFilter = {pos:"ALL", team:"ALL", q:"", source:"libertadores", priceMax:null, ageMin:null, ageMax:null, mode:"buy", sort:"ovr", page:1};
  ensureForeignClubs();
  ST.divisions = { A: SERIE_A_2026.slice(), B: SERIE_B_2026.slice() };
  ST.serieCPool = SERIE_C_POOL.slice();
  ST.brasileirao = buildLeague("A", ST.divisions.A, 2026);
  ST.otherLeague = buildLeague("B", ST.divisions.B, 2026);
  ST.brasaStandingsHistory = {};
  ST.brasaZonesHistory = {};
  ST.sulamericana = null;
  ST.libertadoresCompleto = null;
  ST.intercontinental = null;
  ST.lastUserMatchType = null;
  ST.desempenhoFilter = "brasileirao";
  ST.seasonPrizeTotals = {brasileirao:0, copa:0, sula:0, lib:0};
  startCopaDoBrasil();
  startSulamericanaIfEligible(); // the 7 real 2026 Sul-Americana entrants play it from season 1 — everyone else only reaches it via a future season's own table position
  startLibertadoresCompletoIfEligible(); // same idea for the 6 real 2026 Libertadores entrants
  autoFillLineup();
  scheduleSave();
}
function brasaSortedStandings(){
  return E.sortedStandings(ST.brasileirao.standings, ST.brasileirao.teams || SERIE_A_2026);
}
function otherLeagueTable(){
  const o = ST.otherLeague;
  return o ? E.sortedStandings(o.standings, o.teams) : [];
}
// true once the Brasileirão itself has no rounds left to play — the point past which a cup's
// own "roundsUntilNextLeg" pacing (spaced out across Brasileirão rounds so legs don't all land
// on the same day) has nothing left to count down against. Without accounting for this, a leg
// finishing post-season re-arms that same multi-round delay for the NEXT leg (see tickCopaDoBrasil()
// et al.) with no more Brasileirão rounds ever coming to tick it back down to 0 — the "próximo
// jogo" card then has nothing to preview (copa/sula/libPendingUserMatch() all gate on that same
// counter) and goes permanently blank, with no button left to click at all: the exact softlock
// checkForPostSeasonDeadEnd() was built to prevent, just reached through the pacing counter
// instead of through elimination/completion. Every place that counter is read or re-armed treats
// "league's over" as "the counter is already 0", so a live cup always plays straight through to
// its actual conclusion once there's no more Brasileirão calendar left to pace it against.
function brasaLeagueOver(){
  const b = ST.brasileirao;
  return !!(b && b.currentRound>=b.rounds.length);
}
// never let two cup/continental match days land back-to-back — the user's last actual match
// always has to have been a Brasileirão league game before another Copa/Sul-Americana/
// Libertadores one is allowed to trigger. Read by BOTH advanceBrasileiraoStep() (to decide
// whether a cup tick is even allowed to fire this round) AND every copa/sula/libPendingUserMatch()
// preview (so the calendar/"próximo jogo" card never shows a cup match that's actually about to
// be skipped this round) — the two have to agree, or the preview lies about what plays next.
function cupMatchesBlockedByInterleaving(){
  // once the league itself has no rounds left, there's no more Brasileirão calendar left to
  // protect a cup preview against — the whole point of this rule was making sure a cup match
  // day never looked like it was coming up next when a plain league round was actually next
  // (or vice versa). With the league over, any continental campaign still mid-run just plays
  // straight through to its conclusion — see finishBrasaRound()/advanceBrasileiraoStep().
  if(brasaLeagueOver()) return false;
  return ST.lastUserMatchType==="copa" || ST.lastUserMatchType==="sula" || ST.lastUserMatchType==="lib";
}
function allCupsFinished(){
  return (!ST.copaDoBrasil || ST.copaDoBrasil.phase==="copa_done")
    && (!ST.sulamericana || ST.sulamericana.phase==="sula_done")
    && (!ST.libertadoresCompleto || ST.libertadoresCompleto.phase==="lib_done");
}
// the hard-softlock bug: once the Brasileirão itself is over, getNextUserMatch() only ever
// shows something when the user has a personal match still ahead in Copa/Sul-Americana/
// Libertadores — the instant they're eliminated from every one of those (or were never in
// them), that card goes permanently blank, with no "avançar dia" button left to click. But the
// AI side of whichever competition(s) still haven't crowned a champion carries on regardless —
// so without this, the game just sits there forever with nothing left for the user to do.
// Called from every spot a user can either run out of Brasileirão rounds or get eliminated from
// a competition (finishBrasaRound() and every finishXLeg()/finishXGroupRound()/applyShootoutResult()
// elimination branch) — the moment NONE of the three could ever hand the user another personal
// match again, this either finalizes the season right away (everything's actually already
// wrapped up) or fast-forwards whatever's left of the AI side first.
function checkForPostSeasonDeadEnd(){
  const b = ST.brasileirao;
  if(!b || b.currentRound<b.rounds.length) return; // the league itself still has personal matches ahead — nothing to do yet
  const copaClear = !ST.copaDoBrasil || ST.copaDoBrasil.phase==="copa_done" || ST.copaDoBrasil.userEliminated;
  const sulaClear = !ST.sulamericana || ST.sulamericana.phase==="sula_done" || ST.sulamericana.userEliminated;
  const libClear = !ST.libertadoresCompleto || ST.libertadoresCompleto.phase==="lib_done" || ST.libertadoresCompleto.userEliminated;
  if(!(copaClear && sulaClear && libClear)) return; // could still hand the user a personal match somewhere — let the normal calendar keep driving it
  if(allCupsFinished()){ checkForIntercontinental(); return; }
  autoFinishBackgroundCups();
}
// fast-forwards whatever's left of Copa/Sul-Americana/Libertadores straight to a real
// conclusion — only ever reached once checkForPostSeasonDeadEnd() has confirmed the user has
// no personal match left in any of them, so goToMatchDay() can never fire during this loop.
function autoFinishBackgroundCups(){
  let guard = 0;
  while(!allCupsFinished() && guard<2000){
    guard++;
    if(ST.copaDoBrasil) ST.copaDoBrasil.roundsUntilNextLeg = 0;
    if(ST.sulamericana) ST.sulamericana.roundsUntilNextLeg = 0;
    if(ST.libertadoresCompleto) ST.libertadoresCompleto.roundsUntilNextLeg = 0;
    tickCopaDoBrasil();
    tickSulamericana();
    tickLibertadoresCompleto();
  }
  checkForIntercontinental();
}

// ============================================================
// MUNDIAL DE CLUBES (INTERCONTINENTAL) — the last competition of the year, only reachable when
// this club actually won the Libertadores. Semifinal 1 pits the Libertadores champion against a
// simplified stand-in for the AFC Champions League winner; semifinal 2 (never involving this
// club) is a UEFA Champions League stand-in against a CONCACAF Champions Cup stand-in, resolved
// silently by strength comparison alone — those three foreign competitions are simulated in the
// background, never shown to the user. The final pits the two semifinal winners. Every match this
// club actually plays is a real match day, same as any other cup — including against a foreign
// opponent, which needs a one-off generated squad since foreign clubs otherwise only exist as
// flavor names (see REAL_EURO_CLUBS) with no roster of their own.
// ============================================================
const IC_CONCACAF_CLUBS = ["Club América","Monterrey","Pachuca","León","Los Angeles FC","Santos Laguna","Toronto FC"];
const IC_ASIA_CLUBS = ["Al Hilal SFC","Al Nassr FC","Al Ittihad Club","Al Ahli Saudi FC","Al Sadd SC","Al Duhail SC","Kashima Antlers","Kawasaki Frontale","Yokohama F. Marinos","Vissel Kobe","Ulsan HD FC","Jeonbuk Hyundai Motors","Pohang Steelers","FC Seoul"];
const IC_TIER_OVR = {euro:87, concacaf:79, asia:81};
const IC_NAME_POOLS = {
  euro: [["Kevin","Erik","Marco","Julian","Antoine","Thiago","Pablo","Nico","Leon","Mathis","Diego","Sander","Bruno","Rafael"], ["Novak","Berg","Rossi","Keller","Dubois","Fischer","Moreau","Alonso","Weber","Lindqvist","Ferreira","Haas","Costa","Silveira"]],
  concacaf: [["Carlos","Jesús","Erick","Uriel","Alan","Roberto","Diego","Sebastián","Jordan","Tyler","Emerson","Julián"], ["Hernández","Domínguez","Aguirre","Antuna","Reyes","Gallardo","Vega","Chávez","Salcedo","Córdova","Araujo","Peralta"]],
  asia: [["Hiroshi","Minjae","Yusuke","Sung","Faisal","Takumi","Jae","Khalid","Ryo","Dae","Salman","Kenta"], ["Sato","Kim","Tanaka","Park","Al-Otaibi","Suzuki","Lee","Al-Dawsari","Watanabe","Choi","Nakamura","Yamamoto"]],
};
// one-off ~20-man squad for whichever foreign club this club actually has to play — generated,
// not authored, since these clubs are otherwise just names (see REAL_EURO_CLUBS et al.); good
// enough for a single cup run, never touched again once the season ends.
function genConfederationSquad(tierOvr, natLabel, namePool, rng, idGen){
  const positions = ["GK","GK","CB","CB","CB","LB","LB","RB","RB","DMF","DMF","CM","CM","CM","AM","LW","RW","ST","ST","LM"];
  return positions.map(pos=>{
    const nm = pick(rng,namePool[0])+" "+pick(rng,namePool[1]);
    const age = 22+Math.floor(rng()*10);
    const isGk = pos==="GK";
    const ovr = E.clamp(tierOvr + Math.floor((rng()-0.5)*10), 50, 92);
    const pot = ovr;
    function j(spread){ return E.clamp(ovr+Math.floor((rng()-0.5)*spread),30,95); }
    return {id:idGen(), name:nm, nat:natLabel, age, pos, altPos:[pos], ovr, pot, pac:j(16), sho:isGk?Math.floor(rng()*20)+15:j(14), pas:j(12), dri:isGk?j(18):j(12), de:j(14), phy:j(12), gk:isGk?j(12):Math.floor(rng()*20)+15, value:E.calcValue(ovr,age,pot), foot:rng()<0.78?"Right foot":"Left foot", injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0};
  });
}
function ensureIcOpponentSquad(clubName, tier){
  if(ST.world.teams[clubName]) return;
  const rng = E.makeRNG(nextSeed());
  const natLabel = tier==="euro"?"Europa":tier==="concacaf"?"Concacaf":"Ásia";
  const players = genConfederationSquad(IC_TIER_OVR[tier]||80, natLabel, IC_NAME_POOLS[tier]||IC_NAME_POOLS.euro, rng, nextId);
  ST.world.teams[clubName] = {name:clubName, country:"", flag:"", group:null, source:"ic_gen", players};
}
// abstract strength used ONLY for the two matches this club never plays (sf2 always, and sf1
// when some other club won the Libertadores) — a real match day would need a real squad for
// both sides, which foreign clubs don't have; a plain strength comparison is the "forma
// simplificada" the background continental cups were always meant to get.
function icMatchStrength(teamName, ic){
  if(teamName===ic.euroChampion) return IC_TIER_OVR.euro;
  if(teamName===ic.concacafChampion) return IC_TIER_OVR.concacaf;
  if(teamName===ic.asiaChampion) return IC_TIER_OVR.asia;
  return (ST.world.teams[teamName] && teamAvgOvr(ST.world.teams[teamName])) || 75;
}
function resolveSimulatedIcMatch(match){
  const rng = E.makeRNG(nextSeed());
  const sA = icMatchStrength(match.home, ST.intercontinental);
  const sB = icMatchStrength(match.away, ST.intercontinental);
  const aWins = rng() < 1/(1+Math.pow(10,(sB-sA)/9));
  const winnerGoals = 1+Math.floor(rng()*3);
  const loserGoals = Math.floor(rng()*winnerGoals);
  match.hs = aWins?winnerGoals:loserGoals;
  match.as = aWins?loserGoals:winnerGoals;
  match.played = true;
  match.winner = aWins?match.home:match.away;
}
function icPrizeForStage(stage){ return {ic_semi:8000000, ic_final:30000000}[stage] || 0; }
function payIntercontinentalPrize(stage){
  const prize = icPrizeForStage(stage);
  if(!prize) return;
  ST.budget += prize;
  addSeasonPrize("ic", prize);
  ST.newsLog.unshift({title:"Premiação do Mundial de Clubes", text:`Classificação rende ${fmtMoney(prize)} aos cofres do ${ST.teamId}.`});
}
function startIntercontinental(){
  const rng = E.makeRNG(nextSeed());
  const libChampion = ST.libertadoresCompleto.champion;
  const euroChampion = pick(rng, REAL_EURO_CLUBS);
  const concacafChampion = pick(rng, IC_CONCACAF_CLUBS);
  const asiaChampion = pick(rng, IC_ASIA_CLUBS);
  const userInvolved = libChampion===ST.teamId;
  ST.intercontinental = {
    year: ST.seasonYear, phase: userInvolved?"ic_announce":"ic_semi",
    libChampion, euroChampion, concacafChampion, asiaChampion,
    semis: {
      sf1: {home:asiaChampion, away:libChampion, played:false, hs:null, as:null, winner:null},
      sf2: {home:euroChampion, away:concacafChampion, played:false, hs:null, as:null, winner:null},
    },
    final: null, champion:null, placementReached:null, userInvolved, scorers:{}, assisters:{},
  };
  ST.newsLog.unshift({title:"Mundial de Clubes definido!", text:`${libChampion} representa a Libertadores no Mundial de Clubes ${ST.seasonYear}, ao lado de ${euroChampion} (Champions League), ${concacafChampion} (Concacaf) e ${asiaChampion} (Ásia). Semifinais: ${asiaChampion} x ${libChampion} — ${euroChampion} x ${concacafChampion}.`});
  if(userInvolved){ ST.stage = "ic_announce"; return; }
  advanceIntercontinentalStep();
}
function progressIntercontinentalBracket(){
  const ic = ST.intercontinental;
  const sf1 = ic.semis.sf1, sf2 = ic.semis.sf2;
  if(!sf1.played || !sf2.played) return;
  const w1 = sf1.winner || (sf1.hs>sf1.as?sf1.home:sf1.away);
  const w2 = sf2.winner || (sf2.hs>sf2.as?sf2.home:sf2.away);
  ic.final = {home:w1, away:w2, played:false, hs:null, as:null, winner:null};
  ic.phase = "ic_final";
  ST.newsLog.unshift({title:"Final do Mundial de Clubes definida!", text:`${w1} e ${w2} disputam o título do Mundial de Clubes ${ic.year}.`});
}
function finishIntercontinental(champion){
  const ic = ST.intercontinental;
  ic.champion = champion;
  ic.phase = "ic_done";
  if(ic.userInvolved){
    if(champion===ST.teamId) payIntercontinentalPrize("ic_final");
    else ic.placementReached = ic.semis.sf1.winner===ST.teamId ? "Vice-campeão" : "Semifinal";
  }
  ST.newsLog.unshift({title:"Campeão do Mundo!", text:`${champion} conquista o Mundial de Clubes ${ic.year}.`});
  checkForPostSeasonDeadEnd();
}
// drives the whole thing to completion in one go — sf2 never involves this club, so it always
// resolves instantly; sf1 and the final each either hand the user a real match day (returning
// true so the caller stops and waits for it) or resolve instantly too, exactly like every other
// cup final's advanceXFinalStep().
function advanceIntercontinentalStep(){
  const ic = ST.intercontinental;
  if(ic.phase==="ic_semi"){
    if(!ic.semis.sf2.played) resolveSimulatedIcMatch(ic.semis.sf2);
    const sf1 = ic.semis.sf1;
    if(!sf1.played){
      if(sf1.away===ST.teamId){
        ensureIcOpponentSquad(sf1.home, "asia");
        startRatingRound();
        goToMatchDay(sf1, {type:"ic_semi"});
        return true;
      }
      resolveSimulatedIcMatch(sf1);
    }
    progressIntercontinentalBracket();
    return advanceIntercontinentalStep();
  }
  if(ic.phase==="ic_final"){
    const f = ic.final;
    if(!f.played){
      if(f.home===ST.teamId || f.away===ST.teamId){
        const oppName = f.home===ST.teamId ? f.away : f.home;
        const tier = oppName===ic.euroChampion?"euro":oppName===ic.concacafChampion?"concacaf":"asia";
        ensureIcOpponentSquad(oppName, tier);
        startRatingRound();
        goToMatchDay(f, {type:"ic_final"});
        return true;
      }
      resolveSimulatedIcMatch(f);
    }
    finishIntercontinental(f.winner || (f.hs>f.as?f.home:f.away));
  }
  return false;
}
// called from advanceBrasileiraoStep() every round, same as tickCopaDoBrasil() et al. — needed
// for a real "AVANÇAR DIA" case advanceIntercontinentalStep()'s own single kickoff call (from
// Game.continueIntercontinental()) can't cover on its own: the player reaches the match-confirm
// screen for their semi/final, then navigates away from it (e.g. "✏️ Editar escalação" back to
// Elenco) before actually simulating it. ST.pendingMatch is still sitting there unresolved, but
// nothing was left to bring the player back to it — the "próximo jogo" card had no idea an
// Intercontinental match could ever be pending (see icPendingUserMatch()), and advancing the
// calendar never re-drove the Mundial forward either. Re-entering advanceIntercontinentalStep()
// here re-issues the exact same goToMatchDay() call for that still-unplayed match — same
// self-healing idea tickCopaDoBrasil()'s own leg search already relies on.
function tickIntercontinental(){
  const ic = ST.intercontinental;
  if(!ic || ic.year!==ST.seasonYear || ic.phase==="ic_done" || ic.phase==="ic_announce") return false;
  return advanceIntercontinentalStep();
}
// mirrors copa/sula/libPendingUserMatch() — previews the Mundial de Clubes semifinal/final
// instead of the Brasileirão fixture whenever one is actually pending for this club, so the
// "próximo jogo" card never goes blank just because the player stepped away from the match-confirm
// screen (see tickIntercontinental() above) or checked another hub tab in between.
function icPendingUserMatch(){
  const ic = ST.intercontinental;
  if(!ic || ic.year!==ST.seasonYear || !ic.userInvolved || ic.phase==="ic_done" || ic.phase==="ic_announce") return null;
  if(ic.phase==="ic_semi"){
    const f = ic.semis.sf1;
    if(f.played || f.away!==ST.teamId) return null;
    return {home:f.home, away:f.away, label:`Mundial de Clubes ${ic.year} · Semifinal · Jogo único`, compType:"intercontinental"};
  }
  if(ic.phase==="ic_final"){
    const f = ic.final;
    if(!f || f.played || (f.home!==ST.teamId && f.away!==ST.teamId)) return null;
    return {home:f.home, away:f.away, label:`Mundial de Clubes ${ic.year} · Final · Jogo único`, compType:"intercontinental"};
  }
  return null;
}
function icSeasonResult(){
  const ic = ST.intercontinental;
  if(!ic || !ic.userInvolved || ic.year!==ST.seasonYear) return null;
  if(ic.champion===ST.teamId) return "Campeão";
  return ic.placementReached || "Em andamento";
}
function icRepReward(resultLabel){ return {"Campeão":12, "Vice-campeão":5, "Semifinal":2}[resultLabel] || 0; }
// the actual gate reached once every domestic/continental cup is fully resolved — either starts
// the Mundial de Clubes (only when this club just won that year's Libertadores) or, if it's
// already running, either advances it or — once it's genuinely done — finally lets the season
// end. checkForPostSeasonDeadEnd()/autoFinishBackgroundCups() both route here now instead of
// calling finalizeBrasaSeason() directly.
function checkForIntercontinental(){
  const ic = ST.intercontinental;
  if(ic && ic.year===ST.seasonYear){
    if(ic.phase==="ic_done") finalizeBrasaSeason();
    return;
  }
  if(!ST.libertadoresCompleto || ST.libertadoresCompleto.phase!=="lib_done"){
    finalizeBrasaSeason();
    return;
  }
  startIntercontinental();
}
// advances exactly one Brasileirão round per call — every AI-vs-AI game in the round is
// simulated immediately, and if the user's own club has a fixture that round it's the only
// thing that stops here (handed to the normal match screen); everything else plays through.
function advanceBrasileiraoStep(){
  const b = ST.brasileirao;
  if(!b) return;
  decrementAvailability();
  // skipping the tick calls entirely (rather than just not acting on them) leaves every counter
  // exactly where it was, so nothing is lost — the same competition simply gets its turn one
  // Brasileirão round later than it otherwise would have.
  if(!cupMatchesBlockedByInterleaving()){
    if(tickCopaDoBrasil()) return; // a Copa do Brasil match day was triggered this turn — wait for it
    if(tickSulamericana()) return; // same idea for the Sul-Americana campaign, when the user's club is in it
    if(tickLibertadoresCompleto()) return; // ...and for the real Libertadores, when the user's club is in it instead
    if(tickIntercontinental()) return; // ...and for the Mundial de Clubes, once this club actually reached it — see tickIntercontinental()
  }
  if(b.currentRound>=b.rounds.length){
    // the league is done and every cup tick above came up empty this call — if a continental
    // campaign was still going, finishBrasaRound() already zeroed its countdown the moment the
    // league ended, so it would have fired above already; nothing firing means everything has
    // genuinely finished (or the user is out of all of them), so re-check whether the season
    // can truly end now.
    checkForPostSeasonDeadEnd();
    return;
  }
  const round = b.rounds[b.currentRound];
  playOtherLeagueRound(); // the other division plays this same round in the background
  startRatingRound();
  let pendingUser = null;
  round.forEach(m=>{
    if(m.played) return;
    if(m.home===ST.teamId || m.away===ST.teamId){
      pendingUser = m;
    } else {
      const res = simFast(m.home, m.away);
      m.hs=res.homeScore; m.as=res.awayScore; m.played=true;
      E.applyResultToStandings(b.standings, m.home, m.away, m.hs, m.as);
    }
  });
  if(pendingUser){
    goToMatchDay(pendingUser, {type:"brasileirao", round:b.currentRound});
  } else {
    finishBrasaRound();
  }
}
function finishBrasaRound(){
  const b = ST.brasileirao;
  closeRatingRound("brasileirao", "Brasileirão");
  b.currentRound++;
  if(wcBreakDue()){ wcStartBreak(); return; } // ano de Copa do Mundo: o campeonato para aqui
  if(b.currentRound<b.rounds.length) return;
  // the league itself is done — zero any still-unfinished continental campaign's own countdown
  // right now, so the calendar/"próximo jogo" card picks it up on the very next render instead
  // of waiting out its normal multi-round spacing (which might otherwise never get the chance
  // to elapse once there are no more Brasileirão rounds left to drive it down tick by tick).
  if(ST.copaDoBrasil && ST.copaDoBrasil.phase!=="copa_done") ST.copaDoBrasil.roundsUntilNextLeg = 0;
  if(ST.sulamericana && ST.sulamericana.phase!=="sula_done") ST.sulamericana.roundsUntilNextLeg = 0;
  if(ST.libertadoresCompleto && ST.libertadoresCompleto.phase!=="lib_done") ST.libertadoresCompleto.roundsUntilNextLeg = 0;
  checkForPostSeasonDeadEnd();
}
// ============================================================
// SEASON-END COMPETITION CARDS — one card per competition the club actually played this season
// (Brasileirão always; Copa do Brasil unless one of the handful of excluded clubs; Sul-Americana/
// Libertadores only when ST.sulamericana/ST.libertadoresCompleto exist, i.e. the club qualified),
// each with its own trophy, final result, reputation swing and prize money earned — instead of
// one generic trophy and a single pooled reputation number that never said which competition it
// actually came from.
// ============================================================
// how far the club got in a knockout-with-a-final competition, from ST.teamId's point of view:
// "Campeão"/"Vice-campeão" once the final is decided one way or the other, cb.placementReached
// for an earlier elimination, "Em andamento" if the season somehow ended before it finished
// (the pacing keeps this from happening in practice), or null if the club was never in the
// bracket at all this year (so no card gets shown for it).
function knockoutSeasonResult(comp, doneVal, finalKey, championKey){
  if(!comp) return null;
  if(comp[championKey]===ST.teamId) return "Campeão";
  const f = comp.knockout && comp.knockout[finalKey];
  if(comp.phase===doneVal && f && (f.home===ST.teamId||f.away===ST.teamId)) return "Vice-campeão";
  // comp.placementReached comes from stageLabelFor(), which prefixes it with the competition's
  // own name ("Copa do Brasil — Oitavas de Final") — redundant on a card already titled with
  // that same name, and it wouldn't match cupRepReward()'s plain-stage lookup table below either.
  if(comp.placementReached) return comp.placementReached.replace(/^.*? — /, "");
  if(comp.phase!==doneVal) return "Em andamento";
  return null;
}
function copaSeasonResult(){
  if(!ST.copaDoBrasil) return null;
  if(!copaSeedTeams().includes(ST.teamId)) return null; // one of the few clubs excluded from this year's Copa — no card for it
  return knockoutSeasonResult(ST.copaDoBrasil, "copa_done", "copa_final", "champion");
}
function sulaSeasonResult(){ return knockoutSeasonResult(ST.sulamericana, "sula_done", "sula_final", "champion"); }
function libSeasonResult(){ return knockoutSeasonResult(ST.libertadoresCompleto, "lib_done", "lib_final", "champion"); }
// reputation swing for how far a cup run went — same increasing-with-the-stage idea as the
// Brasileirão's own position-based reward below, just for a knockout shape instead of a table.
function cupRepReward(resultLabel){
  return {"Campeão":5, "Vice-campeão":2, "Semifinal":1, "Quartas de Final":0, "Oitavas de Final":-1, "Fase de Grupos":-2}[resultLabel] || 0; // "Em andamento" (or no campaign at all) swings nothing — there's no final result yet to judge
}
function addSeasonPrize(compKey, amount){
  if(!amount) return;
  if(!ST.seasonPrizeTotals) ST.seasonPrizeTotals = {brasileirao:0, copa:0, sula:0, lib:0};
  ST.seasonPrizeTotals[compKey] = (ST.seasonPrizeTotals[compKey]||0) + amount;
}
// season wrap-up: prize money by final position, a news item, and — for now — a simplified,
// narrative-only relegation/promotion note (the real Série B doesn't have squads in this game
// yet, so nobody's roster actually changes hands; that's the next piece of this project).
function brasaPrizeForPositionB(pos){
  const top = 9000000, bottom = 1500000;
  const frac = (20-pos)/19;
  return Math.round((bottom + (top-bottom)*frac)/50000)*50000;
}
function finalizeBrasaSeason(){
  // a competition finishing inside its own tick can reach this twice in a row (tick → dead-end check → tick's caller → dead-end check
  // again): the second call must never close another year, or the calendar would skip a season (and a World Cup)
  if(ST.stage==="season_end" && ST.lastSeasonSummary && ST.lastSeasonSummary.year===ST.seasonYear-1) return;
  const division = ST.brasileirao.division || "A";
  const tableMine = brasaSortedStandings();
  const tableOther = ST.otherLeague ? otherLeagueTable() : null;
  const tableA = division==="A" ? tableMine : tableOther;
  const tableB = division==="B" ? tableMine : tableOther;
  const pos = tableMine.findIndex(r=>r.team===ST.teamId)+1;
  const prize = division==="A" ? brasaPrizeForPosition(pos) : brasaPrizeForPositionB(pos);
  ST.budget += prize;
  addSeasonPrize("brasileirao", prize);
  const champion = tableMine[0].team;
  const relegated = (tableA||tableMine).slice(16).map(r=>r.team);   // Série A -> Série B
  const promotedUp = tableB ? tableB.slice(0,4).map(r=>r.team) : [];   // Série B -> Série A
  const droppedC = tableB ? tableB.slice(16).map(r=>r.team) : [];      // Série B -> Série C
  const championA = tableA ? tableA[0].team : champion, championB = tableB ? tableB[0].team : null;
  if(!ST.brasaStandingsHistory) ST.brasaStandingsHistory = {};
  if(tableA) ST.brasaStandingsHistory[ST.seasonYear] = tableA.map(r=>r.team); // feeds next year's Copa do Brasil seeding (always the Série A table)
  const copaChampion = (ST.copaDoBrasil && ST.copaDoBrasil.phase==="copa_done") ? ST.copaDoBrasil.champion : null;
  const sulaChampion = (ST.sulamericana && ST.sulamericana.phase==="sula_done" && ST.sulamericana.year===ST.seasonYear) ? ST.sulamericana.champion : null;
  const libChampion = (ST.libertadoresCompleto && ST.libertadoresCompleto.phase==="lib_done" && ST.libertadoresCompleto.year===ST.seasonYear) ? ST.libertadoresCompleto.champion : null;
  const wonAnyTrophy = champion===ST.teamId || copaChampion===ST.teamId || sulaChampion===ST.teamId || libChampion===ST.teamId;
  const zones = tableA ? computeNextSeasonZones(tableA, copaChampion, sulaChampion) : null;
  if(!ST.brasaZonesHistory) ST.brasaZonesHistory = {};
  if(zones) ST.brasaZonesHistory[ST.seasonYear] = zones; // feeds next year's Sul-Americana (and, eventually, Libertadores) qualification
  // minApps:10 keeps a single-cameo outlier (a youth-team debutant who happened to score once)
  // out of the season XI — by round 38 every real regular has cleared that bar many times over.
  const teamOfSeason = pickBestXIFromPool(ST.brasileirao.seasonRatings||{}, 10);
  // one card per competition actually played this season — each with its own trophy, result,
  // reputation swing and prize money, instead of one pooled reputation number that never said
  // which competition it actually came from (see the SEASON-END COMPETITION CARDS block above).
  const brasaRep = division==="A"
    ? (pos===1 ? 6 : pos<=6 ? 3 : pos<=13 ? 0 : pos<=16 ? -3 : -6)
    : (pos===1 ? 5 : pos<=4 ? 3 : pos<=12 ? 0 : pos<=16 ? -2 : -6);
  const userRelegated = division==="A" && pos>=17, userPromoted = division==="B" && pos<=4, userDroppedC = division==="B" && pos>=17;
  const copaResult = copaSeasonResult();
  const sulaResult = sulaSeasonResult();
  const libResult = libSeasonResult();
  const icResult = icSeasonResult();
  const copaRep = cupRepReward(copaResult);
  const sulaRep = cupRepReward(sulaResult);
  const libRep = cupRepReward(libResult);
  const icRep = icRepReward(icResult);
  const prizeTotals = ST.seasonPrizeTotals || {brasileirao:0, copa:0, sula:0, lib:0};
  const placeTxt = (pos===1 ? "Campeão" : `${pos}º lugar`) + (userPromoted ? " · Promovido" : userRelegated||userDroppedC ? " · Rebaixado" : "");
  const compCards = [
    {key:"brasileirao", label: division==="A" ? "Brasileirão" : "Brasileirão Série B", trophyKey: division==="A" ? "brasileirao" : "brasileiraoB", result: placeTxt, repChange:brasaRep, prize:prizeTotals.brasileirao||0, won: pos===1},
  ];
  if(copaResult) compCards.push({key:"copa", label:"Copa do Brasil", trophyKey:"copa", result:copaResult, repChange:copaRep, prize:prizeTotals.copa||0, won:copaResult==="Campeão"});
  if(sulaResult) compCards.push({key:"sula", label:"Sul-Americana", trophyKey:"sulamericana", result:sulaResult, repChange:sulaRep, prize:prizeTotals.sula||0, won:sulaResult==="Campeão"});
  if(libResult) compCards.push({key:"lib", label:"Libertadores", trophyKey:"libertadores", result:libResult, repChange:libRep, prize:prizeTotals.lib||0, won:libResult==="Campeão"});
  if(icResult) compCards.push({key:"ic", label:"Mundial de Clubes", trophyKey:"intercontinental", result:icResult, repChange:icRep, prize:prizeTotals.ic||0, won:icResult==="Campeão"});
  const wcr = (ST.wcSeasonResult && ST.wcSeasonResult.year===ST.seasonYear) ? ST.wcSeasonResult : null;
  if(wcr) compCards.push({key:"wc", label:`Copa do Mundo · ${wcr.nation}`, trophyKey:"worldcup", result:wcr.label, repChange:wcr.rep, prize:wcr.prize, won:wcr.label==="Campeão"});
  const totalRepChange = brasaRep + copaRep + sulaRep + libRep + icRep + (wcr ? wcr.rep : 0);
  ST.lastSeasonSummary = {
    year: ST.seasonYear,
    placement: pos===1 ? "Campeão" : `${pos}º lugar`,
    repChange: totalRepChange,
    isBrasileirao: true,
    division, champion, championA, championB, relegated, promotedUp, droppedC, position: pos, zones, teamOfSeason, compCards,
    userMove: userPromoted ? "promoted" : userRelegated ? "relegated" : userDroppedC ? "droppedC" : null,
  };
  ST.reputation = E.clamp(ST.reputation + totalRepChange, 5, 99);
  if(wcr) ST.wcSeasonResult = null;
  ST.newsLog.unshift({title:`Fim de temporada — Brasileirão ${divisionLabel(division)}`, text:`${champion} é o campeão. Você terminou em ${pos}º lugar e recebeu ${fmtMoney(prize)} em premiação.`});
  applyDynamicPotentialGrowth(wonAnyTrophy);
  ageWorld();
  ST.lastSeasonSummary.development = ST.lastDevelopmentReport; // who leveled up / retired — feeds the season-end screen's animated reveal
  // the real movement between divisions: 4 down from Série A, 4 up from Série B, 4 down to Série C, 4 up from it
  if(tableA && tableB && ST.divisions){
    const mv = applyDivisionMovement(tableA, tableB);
    ST.lastSeasonSummary.risenC = mv.risen;
    if(userRelegated) ST.newsLog.unshift({title:"Rebaixamento", text:`O ${ST.teamId} foi rebaixado para a Série B.`});
    if(userPromoted) ST.newsLog.unshift({title:"Acesso!", text:`O ${ST.teamId} está de volta à Série A.`});
    if(userDroppedC){
      // there is no playable Série C: the board lets the manager go and other clubs call
      ST.fired = true;
      ST.lastSeasonSummary.firedForRelegation = true;
      ST.newsLog.unshift({title:"Demitido", text:`O ${ST.teamId} caiu para a Série C e a diretoria encerrou seu contrato.`});
    }
  }
  // bump year/num here (not in startNewBrasaSeason) so the season-end screen itself already
  // shows the upcoming season — same order the Libertadores flow's endOfSeason() uses.
  ST.seasonNum += 1;
  ST.seasonYear += 1;
  ST.stage = "season_end";
  scheduleSave();
}
// next season — both divisions get a fresh double round-robin and a clean table, built from the NEW division lists
// (the clubs that went up/down already moved), and the user's league becomes whichever division the club is in now.
function startNewBrasaSeason(){
  const divs = ST.divisions;
  const myDiv = divs && divs.B.includes(ST.teamId) ? "B" : "A";
  if(divs){
    ST.brasileirao = buildLeague(myDiv, myDiv==="A" ? divs.A : divs.B, ST.seasonYear);
    ST.otherLeague = buildLeague(myDiv==="A" ? "B" : "A", myDiv==="A" ? divs.B : divs.A, ST.seasonYear);
  } else {
    const order = shuffled(E.makeRNG(nextSeed()), SERIE_A_2026);
    ST.brasileirao = { year: ST.seasonYear, rounds: E.doubleRoundRobin(order), currentRound: 0, standings: {}, scorers: {}, assisters: {} };
  }
  ST.seasonPrizeTotals = {brasileirao:0, copa:0, sula:0, lib:0}; // reset now that last season's totals have already been folded into its season-end cards
  ST.stage = "hub";
  ST.hubTab = "competicao";
  startCopaDoBrasil(); // may override ST.stage to "copa_draw" (2027+) for the round-of-16 reveal
  startSulamericanaIfEligible();
  startLibertadoresCompletoIfEligible();
}

// ============================================================
// PRÉ-LIBERTADORES — quick 8-team knockout among Sul-Americana clubs. The player is stuck
// with their chosen team until they win it (each failed attempt rolls the year forward).
// Winning earns a Libertadores slot the following season, in place of whoever had the
// worst group-stage campaign that year (fewest points, then worst SG, then fewest wins).
// ============================================================
// standard seeded bracket (1v8 / 4v5 / 3v6 / 2v7) built from each squad's average OVR,
// so the two strongest sides can only meet in the final.
const PRELIB_QF_PAIRS = [
  {half:0, slot:0, teamA:"River Plate", teamB:"Racing"},
  {half:0, slot:1, teamA:"Santos", teamB:"Grêmio"},
  {half:1, slot:0, teamA:"Botafogo", teamB:"Vasco da Gama"},
  {half:1, slot:1, teamA:"São Paulo", teamB:"Atlético Mineiro"},
];
// the player is stuck with whichever team they pick — a failed campaign doesn't send them back
// to team select, it just rolls the Sul-Americana forward a year for another shot. Two attempts
// total: if the second one also falls short, the run doesn't dead-end — the team's Campeonato
// Nacional form is judged strong enough to earn the same Libertadores slot a different way.
const PRELIB_START_YEAR = 2026;
const PRELIB_MAX_YEAR = PRELIB_START_YEAR + 1; // 2 attempts total (2026, 2027)

function freshPrelibWorld(){
  const teams = {};
  Object.keys(PRELIB_DATA.teams).forEach(name=>{
    const t = PRELIB_DATA.teams[name];
    const players = t.players.map(p=>Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0}));
    let maxId = 0; players.forEach(p=>{ if(p.id>maxId) maxId=p.id; });
    if(maxId>nextIdCounter) nextIdCounter = maxId;
    teams[name] = { name:t.name, country:t.country, flag:t.flag, group:t.group, source:t.source, players };
  });
  GLOBAL_MARKET_SRC.forEach(p=>{ if(p.id>nextIdCounter) nextIdCounter=p.id; });
  // full hub access (same as a real career) means a real transfer market too — buying reinforcements
  // is one of the levers that makes the Sul-Americana actually winnable instead of a pure dice roll.
  return { groups:{A:[],B:[],C:[],D:[],E:[],F:[],G:[],H:[]}, teams, globalMarket: GLOBAL_MARKET_SRC.map(p=>Object.assign({}, p)) };
}

function makePrelibTie(teamA, teamB, half, slot){
  return { id:teamA+"__"+teamB, half, slot, teamA, teamB, home:teamA, away:teamB, played:false, hs:null, as:null, winner:null, wentToPens:false };
}

function currentPrelibTies(){
  const p = ST.prelib;
  if(!p) return [];
  if(p.phase==="qf") return p.qf;
  if(p.phase==="sf") return p.sf;
  if(p.phase==="final") return [p.final];
  return [];
}

function startPreLib(teamName, managerName){
  ST.world = freshPrelibWorld();
  ST.teamId = teamName;
  ST.managerName = managerName || "Treinador";
  ST.careerStats = {goals:{}, assists:{}, signings:[]}; // a fresh managerial journey starts here too — goals/assists/signings from the Sul-Americana onward all count toward "under your command"
  const tier = tierOf(ST.world, teamName);
  ST.budget = [0, 1800000, 3800000, 7500000, 15000000, 26000000][tier];
  ST.reputation = 50;
  ST.formation = ST.formation || "4-3-3";
  autoFillLineup();
  ST.competition = { scorers:{} }; // lightweight stub: only .scorers is touched by the reused match engine
  const qf = PRELIB_QF_PAIRS.map(pr=>makePrelibTie(pr.teamA, pr.teamB, pr.half, pr.slot));
  ST.prelib = { userTeam:teamName, year:PRELIB_START_YEAR, phase:"qf", qf, sf:null, final:null, champion:null };
  // runs through the exact same hub used by a real career — Elenco, Transferências e Olheiro
  // all work out of the box (they only ever touch ST.world/myTeam(), never ST.competition);
  // only the Competição tab needs to know it's showing a bracket instead of groups.
  ST.stage = "hub";
  ST.hubTab = "competicao";
  scheduleSave();
}

// a failed campaign doesn't reset the player's team choice — it just refreshes every prelib
// squad (clean of injuries/suspensions/form from the last attempt) and rolls the Sul-Americana
// forward a year for another shot, same team, until they either break through or run out of years.
function retryPreLibSameTeam(){
  const p = ST.prelib;
  if(!p || p.phase!=="eliminated") return;
  p.year += 1;
  // a full year passes — squads age, develop toward potential, and (rarely) retire into a
  // fresh youth prospect, exactly like a real season; this also clears the injuries/suspensions
  // /form left over from the last attempt.
  ageWorld();
  // a new Sul-Americana season also means a fresh budget injection on top of whatever's left —
  // the club's finances grow year over year, same idea as a real season's income, just simpler
  // since there's no group-stage prize money to factor in for a campaign that fell short.
  const tier = tierOf(ST.world, p.userTeam);
  const seasonInjection = [0, 900000, 1900000, 3800000, 7500000, 13000000][tier];
  ST.budget = Math.min(140000000, ST.budget + seasonInjection);
  const qf = PRELIB_QF_PAIRS.map(pr=>makePrelibTie(pr.teamA, pr.teamB, pr.half, pr.slot));
  p.qf = qf; p.sf = null; p.final = null; p.champion = null; p.phase = "qf";
  ST.stage = "hub"; ST.hubTab = "competicao";
  scheduleSave();
}

function resolvePrelibTieAuto(tie){
  const res = simFast(tie.home, tie.away);
  let hs=res.homeScore, as=res.awayScore;
  if(hs===as){
    tie.wentToPens = true;
    const rng = E.makeRNG(nextSeed());
    if(rng()<0.5) hs++; else as++;
  }
  tie.hs=hs; tie.as=as; tie.played=true;
  tie.winner = hs>as ? tie.home : tie.away;
}

function stepPreLib(){
  const p = ST.prelib;
  if(!p || p.phase==="done" || p.phase==="eliminated") return;
  decrementAvailability();
  const ties = currentPrelibTies();
  let pendingUser = null;
  ties.forEach(tie=>{
    if(tie.played) return;
    if(tie.teamA===p.userTeam || tie.teamB===p.userTeam) pendingUser = tie;
    else resolvePrelibTieAuto(tie);
  });
  if(pendingUser){
    goToMatchDay(pendingUser, {type:"prelib_"+p.phase, tieId:pendingUser.id});
  }
  scheduleSave();
}

function finishPrelibMatch(tieId){
  const tie = currentPrelibTies().find(t=>t.id===tieId);
  if(!tie) { ST.stage = "hub"; ST.hubTab = "competicao"; return; }
  if(tie.hs===tie.as){
    tie.wentToPens = true;
    startShootout(tie.teamA, tie.teamB, {type:"prelibTie", tieId:tie.id});
    return;
  }
  tie.winner = tie.hs>tie.as ? tie.home : tie.away;
  ST.stage = "hub"; ST.hubTab = "competicao";
  checkPrelibElimination();
}

function checkPrelibElimination(){
  const p = ST.prelib;
  const userTie = currentPrelibTies().find(t=>t.teamA===p.userTeam || t.teamB===p.userTeam);
  if(userTie && userTie.winner && userTie.winner!==p.userTeam){
    if(p.year>=PRELIB_MAX_YEAR){
      // last shot at the Sul-Americana itself didn't work out, but the team's form in the
      // Campeonato Nacional is judged strong enough to earn the same Libertadores slot anyway —
      // nobody is left permanently stuck outside the real career.
      p.champion = p.userTeam;
      p.viaNational = true;
      p.phase = "done";
      ST.stage = "prelib_champion";
    } else {
      p.phase = "eliminated";
    }
    scheduleSave();
    return;
  }
  progressPrelibBracket();
  scheduleSave();
}

function progressPrelibBracket(){
  const p = ST.prelib;
  if(p.phase==="qf"){
    const qf = p.qf;
    const sfTies = [];
    for(let half=0; half<2; half++){
      const a = qf.find(t=>t.half===half && t.slot===0).winner;
      const b = qf.find(t=>t.half===half && t.slot===1).winner;
      sfTies.push(makePrelibTie(a,b,half,0));
    }
    p.sf = sfTies;
    p.phase = "sf";
  } else if(p.phase==="sf"){
    const sf = p.sf;
    const a = sf.find(t=>t.half===0).winner;
    const b = sf.find(t=>t.half===1).winner;
    p.final = makePrelibTie(a,b,0,0);
    p.phase = "final";
  } else if(p.phase==="final"){
    p.champion = p.final.winner;
    p.phase = "done";
    ST.stage = "prelib_champion";
  }
}

// simulates a full, independent group stage across the real 32 Libertadores clubs (official
// draw) purely to find whoever had the worst campaign — fewest points, then worst goal
// difference, then fewest wins — so the Pré-Libertadores champion has someone concrete to replace.
function simulateReferenceGroupStage(){
  const world = freshWorld();
  const groups = {};
  Object.keys(DATA.groups).forEach(g=>{ groups[g] = DATA.groups[g].slice(); });
  let worst = null;
  Object.keys(groups).forEach(g=>{
    const rounds = E.doubleRoundRobin(groups[g]);
    const table = {};
    rounds.forEach(round=>round.forEach(m=>{
      const res = E.simulateFastMatch(world.teams[m.home], world.teams[m.away], nextSeed());
      E.applyResultToStandings(table, m.home, m.away, res.homeScore, res.awayScore);
    }));
    E.sortedStandings(table, groups[g]).forEach(row=>{
      if(!worst || row.pts<worst.pts ||
         (row.pts===worst.pts && row.gd<worst.gd) ||
         (row.pts===worst.pts && row.gd===worst.gd && row.w<worst.w)){
        worst = row;
      }
    });
  });
  return worst.team;
}

function crownPreLibChampion(managerName){
  const p = ST.prelib;
  const championName = p.champion;
  const championMeta = ST.world.teams[championName];
  const championRoster = championMeta.players.map(pl=>Object.assign({}, pl));
  const worstTeamName = simulateReferenceGroupStage();
  const wonYear = p.year;
  const promotionYear = wonYear + 1;

  const world = freshWorld();
  const keptGroup = (world.teams[worstTeamName] && world.teams[worstTeamName].group) || "A";
  delete world.teams[worstTeamName];
  world.teams[championName] = {
    name: championMeta.name, country: championMeta.country, flag: championMeta.flag,
    group: keptGroup, source: championMeta.source, players: championRoster,
  };
  // the champion's players may share ids with the global transfer market pool — pull them
  // out so nobody can "buy" a player who is already under contract at their own club.
  const championIds = new Set(championRoster.map(pl=>pl.id));
  world.globalMarket = world.globalMarket.filter(pl=>!championIds.has(pl.id));

  const prelibBudget = ST.budget; // whatever the club actually earned across the Sul-Americana run
  ST.world = world;
  ST.teamId = championName;
  ST.managerName = managerName || "Treinador";
  ST.seasonYear = promotionYear;
  ST.seasonNum = Math.min(10, promotionYear - 2025);
  ST.reputation = 50;
  const tier = tierOf(ST.world, championName);
  const tierBudget = [0, 1800000, 3800000, 7500000, 15000000, 26000000][tier];
  // promotion never wipes out money the club actually earned — keep the higher of the two,
  // just capped so a huge Pré-Libertadores war chest doesn't break the Libertadores economy.
  ST.budget = Math.min(26000000, Math.max(prelibBudget, tierBudget));
  ST.history = [];
  const promoNews = p.viaNational
    ? {title:"Vaga pelo Campeonato Nacional!", text:`${championName} não venceu a Sul-Americana, mas sua campanha no Campeonato Nacional de ${wonYear} garantiu vaga na Libertadores ${promotionYear} no lugar do ${worstTeamName}, dona da pior campanha na fase de grupos de ${wonYear}.`}
    : {title:"Campeão da Pré-Libertadores!", text:`${championName} venceu o torneio classificatório de ${wonYear} e garantiu vaga na Libertadores ${promotionYear} no lugar do ${worstTeamName}, dona da pior campanha na fase de grupos de ${wonYear}.`};
  ST.newsLog = [
    promoNews,
    {title:"Bem-vindo!", text:`${mgrName(ST.managerName)} assume o comando do ${championName} para a campanha de ${ST.seasonYear} da CONMEBOL Libertadores.`},
  ];
  ST.prelib = null;
  ST.stage = "hub";
  ST.hubTab = "competicao";
  setupSeasonCompetition();
  autoFillLineup();
  scheduleSave();
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
// the full, non-abbreviated figure with "." as the thousands separator (1.550.000 instead of
// 1.55M) — used in e-mail bodies alongside fmtMoney so the exact number is always spelled out.
function fmtMoneyFull(v){
  return "US$ " + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
// the abbreviated figure plus the full one in parentheses — the standard way money shows up
// anywhere in the E-mail tab, so the exact number is never more than a glance away.
function fmtMoneyBoth(v){
  return `${fmtMoney(v)} (${fmtMoneyFull(v)})`;
}
// spells a number out in Portuguese ("1460000" -> "um milhão e quatrocentos e sessenta mil") —
// a live caption under free-typed money fields so a stray/missing zero jumps out immediately,
// instead of the user having to count digits to tell a mil from a milhão.
const PT_UNITS = ["", "um","dois","três","quatro","cinco","seis","sete","oito","nove"];
const PT_TEENS = ["dez","onze","doze","treze","catorze","quinze","dezesseis","dezessete","dezoito","dezenove"];
const PT_TENS = ["", "", "vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
const PT_HUNDREDS = ["", "cento","duzentos","trezentos","quatrocentos","quinhentos","seiscentos","setecentos","oitocentos","novecentos"];
function pt999(v){
  if(v===0) return "";
  if(v===100) return "cem";
  const h = Math.floor(v/100), rest = v%100;
  const parts = [];
  if(h>0) parts.push(PT_HUNDREDS[h]);
  if(rest>0){
    if(rest<10) parts.push(PT_UNITS[rest]);
    else if(rest<20) parts.push(PT_TEENS[rest-10]);
    else {
      const t = Math.floor(rest/10), u = rest%10;
      parts.push(PT_TENS[t] + (u>0 ? " e " + PT_UNITS[u] : ""));
    }
  }
  return parts.join(" e ");
}
function numberToWordsPT(nRaw){
  let n = Math.round(Number(nRaw) || 0);
  if(n===0) return "zero";
  if(n<0) return "menos " + numberToWordsPT(-n);
  if(n>=1e12) return n.toLocaleString('pt-BR'); // absurdly large — just show the digits, grouped
  let rem = n;
  const billions = Math.floor(rem/1e9); rem -= billions*1e9;
  const millions = Math.floor(rem/1e6); rem -= millions*1e6;
  const thousands = Math.floor(rem/1e3); rem -= thousands*1e3;
  const units = rem;
  const parts = [];
  if(billions>0) parts.push(billions===1 ? "um bilhão" : pt999(billions)+" bilhões");
  if(millions>0) parts.push(millions===1 ? "um milhão" : pt999(millions)+" milhões");
  if(thousands>0) parts.push(thousands===1 ? "mil" : pt999(thousands)+" mil");
  if(units>0) parts.push(pt999(units));
  if(parts.length===1) return parts[0];
  return parts.slice(0,-1).join(", ") + " e " + parts[parts.length-1];
}
// live currency mask for every free-typed money field: as the user types, the digits get
// re-grouped with "." thousand separators right there in the input (not just on values
// already sitting on screen), and the words caption underneath stays in sync.
function digitsFromMoneyInput(v){ return parseInt(String(v||"").replace(/\D/g,""),10) || 0; }
function formatMoneyInputEl(el, wordsElId){
  const n = digitsFromMoneyInput(el.value);
  el.value = n ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
  if(wordsElId){
    const wordsEl = document.getElementById(wordsElId);
    if(wordsEl) wordsEl.textContent = numberToWordsPT(n);
  }
  return n;
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
    mode:"libertadores",
    brasileirao:null,
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
    careerStats:{goals:{}, assists:{}, signings:[]},
    transferFeed:[], // league-wide transfer news (AI signings + the user's own) — see runAITransferWindow()
    dayCounter:0, // ticks once per calendar day (see dailyTransferTick()) — stamped on every transferFeed entry so FABRIZIO ROMANO can show "hoje"/"ontem"/"há N dias"
    romanoFlip:false, // FABRIZIO ROMANO widget: false = top 5 most expensive, true = 5 most recent
    romanoFlipping:false, // true for the brief squeeze-frame beat while the card is turning
    matchSpeed:"normal", // "slow" | "normal" | "fast" — how quickly live events tick across the screen
    matchClockMinute:0, // only actually driven in "slow" mode's minute-by-minute clock
    calendarDaysLeft:null, // days left until the next match — see ensureCalendarCountdown()
    calendarWeekdayIdx:1, // 0=SEG..6=DOM — which weekday "today" currently is
    inbox:[], // E-mail tab: [{id,type,subject,from,dayLabel,read,preview,body?,payload?,thread?}]
    mailSeq:0, // increasing counter used to mint unique inbox mail ids
    openMailId:null, // id of the inbox mail currently open in the E-mail tab, if any
    scoutedFixtureKey:null, // guards against sending the same opponent scouting report twice
    scoutLevel:1, // 1-5, paid for out of the club budget — see SCOUT_LEVEL_COST
    scoutReportETA:null, // {daysLeft} while a requested "Jogadores Promissores" report is in progress
    scoutLastReportMatchCount:0, // matchesPlayedTotal at the last delivered report — enforces the "at least 1 match between reports" cooldown
    matchesPlayedTotal:0, // incremented every time a match actually finishes (see finishPendingMatch)
    observationQueue:[], // players currently being watched in the transfer market: [{key,playerId,team,playerName,daysLeft}]
    observedKeys:[], // "team#playerId" keys whose true potential has been revealed
    daysSinceTraining:0, // ticks up on every AVANÇAR DIA; hits 2 -> a training day interrupts the calendar
    trainingPending:false, // true while the hub card is showing "DIA DE TREINO" awaiting a choice
    trainingResult:null, // {playerId:{gain,leveledUp}} — shown as a green "+X%" after Simular Treino
    trainingAnimating:false, // true for the 3s "training in progress" beat right after clicking Simular Treino
    drawRevealed:0, // how many of the 32 group-draw slots the "group_draw" screen has revealed so far
    clubCareer:null, // {club, seasons:{[year]:{players:{[id]:{...}}}}} — "Meu Clube" stats, reset whenever the club changes (see ensureClubCareer)
    clubStatsScope:"season", // "season" | "career" — which the "Meu Clube" tab is currently showing
    clubStatsYear:null, // which season year is picked while scope==="season" (defaults to the current one)
  };
}

// stages with no committed data yet — never worth resuming straight into these on reload.
const PRECOMMIT_STAGES = new Set(["team_select","manager_name","mode_select","alt_mode_select","prelib_select","prelib_manager_name","brasa_team_select","brasa_manager_name"]);
async function initApp(){
  const loaded = await loadState();
  if(loaded && loaded.schemaVersion===SCHEMA_VERSION){
    ST = loaded;
    applyRealPositionsToWorld(ST.world);
    try{ ensureDivisions(); ensureForeignClubs(); }catch(err){ console.warn("ensureDivisions failed", err); }
    if(ST.world && Array.isArray(ST.world.globalMarket)){ // carreiras salvas: tira do mercado os cadastros duplicados removidos da base
      const dup = new Set(DUP_REMOVED);
      ST.world.globalMarket = ST.world.globalMarket.filter(p=>!dup.has(p.id));
    }
    // carreiras salvas: "Club Estudiantes de La Plata" passou a ser só "Estudiantes" (mesmo clube, mesmo escudo)
    if(ST.world){
      ["globalMarket","prelibMarket"].forEach(k=>{ if(Array.isArray(ST.world[k])) ST.world[k].forEach(p=>{ if(p.club==="Club Estudiantes de La Plata") p.club = "Estudiantes"; }); });
    }
    // never resume into a transient pre-career setup screen (team pick / manager name / mode
    // pick) — only resume straight into the hub (or an in-progress Pré-Libertadores run) if
    // something was actually committed.
    if(!ST.teamId || !ST.world || PRECOMMIT_STAGES.has(ST.stage)){
      ST.stage = "home";
    }
    // "prelib_bracket" was a standalone screen from an earlier build — the bracket now lives
    // inside the normal hub's Competição tab, so an old save pointing at it just resumes there.
    if(ST.stage==="prelib_bracket"){ ST.stage="hub"; ST.hubTab="competicao"; }
    // backfill for saves from before the day-calendar / e-mail inbox existed — lets an
    // older save resume normally instead of needing a full reset.
    if(!Array.isArray(ST.inbox)) ST.inbox = [];
    if(ST.calendarWeekdayIdx==null) ST.calendarWeekdayIdx = 1;
    if(ST.mailSeq==null) ST.mailSeq = 0;
    if(ST.scoutLevel==null) ST.scoutLevel = 1;
    if(ST.matchesPlayedTotal==null) ST.matchesPlayedTotal = 0;
    if(ST.scoutLastReportMatchCount==null) ST.scoutLastReportMatchCount = 0;
    if(!Array.isArray(ST.observationQueue)) ST.observationQueue = [];
    if(!Array.isArray(ST.observedKeys)) ST.observedKeys = [];
    if(ST.daysSinceTraining==null) ST.daysSinceTraining = 0;
    if(ST.trainingPending==null) ST.trainingPending = false;
    if(ST.trainingResult===undefined) ST.trainingResult = null;
    if(!Array.isArray(ST.transferFeed)) ST.transferFeed = [];
    if(ST.romanoFlip==null) ST.romanoFlip = false;
    if(ST.romanoFlipping==null) ST.romanoFlipping = false;
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
  // a penalty shootout drives itself via its own setTimeout chain, which a page reload
  // wipes — restart it so a save captured mid-shootout doesn't resume frozen.
  if(ST.stage==="penaltyShootout" && ST.penaltyShootout && ST.penaltyShootout.phase==="kicking"){
    setTimeout(()=>{ Game.tickShootout(); }, 700);
  }
  // same idea for the group-draw animation's setInterval — a reload mid-draw otherwise
  // resumes frozen with no way forward except SKIP.
  if(ST.stage==="wc_draw" && ST.worldCup && (ST.worldCup.drawRevealed||0)<48){
    startWcDrawAnimation();
  }
  if(ST.stage==="group_draw" && (ST.drawRevealed||0)<32){
    startGroupDrawAnimation();
  }
  if(ST.stage==="copa_draw" && ST.copaDoBrasil && (ST.copaDoBrasil.drawRevealed||0)<16){
    startCopaDrawAnimation();
  }
  if(ST.stage==="copa_qf_draw" && ST.copaDoBrasil && (ST.copaDoBrasil.qfDrawRevealed||0)<8){
    startCopaQfDrawAnimation();
  }
  // a reload mid-training-animation has no timer to resume — clear the flag rather than
  // leaving the screen stuck on the 3s "Treinando..." beat forever.
  if(ST.trainingAnimating) ST.trainingAnimating = false;
}

function recomputeIdCounter(){
  if(!ST.world) return;
  let maxId=0;
  Object.values(ST.world.teams).forEach(t=>t.players.forEach(p=>{ if(p.id>maxId) maxId=p.id; }));
  if(ST.world.globalMarket) ST.world.globalMarket.forEach(p=>{ if(p.id>maxId) maxId=p.id; });
  GLOBAL_MARKET_SRC.forEach(p=>{ if(p.id>maxId) maxId=p.id; });
  if(maxId>nextIdCounter) nextIdCounter=maxId;
  ensureGlobalMarket();
  ensurePrelibMarket();
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
  ST.prelib = null; // a real career always fully replaces any in-progress Pré-Libertadores run —
  // without this, the hub keeps thinking it's still showing the Sul-Americana bracket.
  ST.mode = "libertadores";
  ST.brasileirao = null;
  ST.copaDoBrasil = null;
  ST.sulamericana = null; // Modo Completo's Sul-Americana campaign is unrelated to this classic mode
  ST.libertadoresCompleto = null; // ...same for Modo Completo's own Libertadores campaign
  ST.intercontinental = null; // ...and this season-finale competition too
  ST.careerStats = {goals:{}, assists:{}, signings:[]};
  ST.world = freshWorld();
  ensureGlobalMarket();
  ensurePrelibMarket();
  ST.teamId = teamId;
  ST.managerName = managerName || "Treinador";
  ST.seasonNum = 1;
  ST.seasonYear = 2026;
  ST.reputation = 50;
  const tier = tierOf(ST.world, teamId);
  ST.budget = [0, 1800000, 3800000, 7500000, 15000000, 26000000][tier];
  ST.history = [];
  ST.newsLog = [{title:"Bem-vindo!", text:`${mgrName(ST.managerName)} assume o comando do ${teamId} para a campanha de ${ST.seasonYear} da CONMEBOL Libertadores.`}];
  ST.stage = "hub";
  ST.hubTab = "competicao";
  ST.formation = "4-3-3";
  ST.captainId = null;
  ST.pendingMatch = null;
  ST.uiModal = null;
  ST.matchAnimIdx = 0;
  ST.matchPlaying = false;
  ST.matchClockMinute = 0;
  ST.jobOffers = null;
  ST.fired = false;
  ST.underdogOffer = false;
  ST.lastSeasonSummary = null;
  // e-mail inbox, calendar and scouting are all per-career progress — a brand-new career
  // (under any club) always starts these completely fresh, never carrying over whatever
  // was sitting in the previous save.
  ST.calendarDaysLeft = null;
  ST.calendarWeekdayIdx = 1;
  ST.inbox = [];
  ST.mailSeq = 0;
  ST.openMailId = null;
  ST.scoutedFixtureKey = null;
  ST.scoutLevel = 1;
  ST.scoutReport = null;
  ST.scoutReportETA = null;
  ST.scoutSeason = 0;
  ST.scoutLastReportMatchCount = 0;
  ST.matchesPlayedTotal = 0;
  ST.observationQueue = [];
  ST.observedKeys = [];
  ST.daysSinceTraining = 0;
  ST.trainingPending = false;
  ST.trainingResult = null;
  setupSeasonCompetition();
  autoFillLineup();
  scheduleSave();
}

// ============================================================
// COMPETITION SETUP (group stage + knockout scaffolding)
// ============================================================
const DRAW_GROUP_LETTERS = ["A","B","C","D","E","F","G","H"];
// the official CONMEBOL Libertadores 2026 seeding pots ("Potes Definidos") — pot 0 is the 8
// seeded giants ("cabeças de chave"), pot 3 the weakest 8. This exact hierarchy, not a
// recomputed-by-squad-strength one, is what every group_draw redraw from 2027 onward pulls
// from — only which letter each team lands in gets reshuffled each season.
const DRAW_POTS = [
  ["Flamengo","Palmeiras","Fluminense","Boca Juniors","Peñarol","Nacional","LDU Quito","Independiente del Valle"],
  ["Corinthians","Cruzeiro","Estudiantes","Lanús","Cerro Porteño","Libertad","Bolívar","Universitario"],
  ["Rosario Central","Junior Barranquilla","Independiente Santa Fe","Universidad Católica","Coquimbo Unido","Sporting Cristal","Deportivo La Guaira","Cusco FC"],
  ["Independiente Medellín","Deportes Tolima","Independiente Rivadavia","Barcelona SC","Platense","Always Ready","Mirassol","Universidad Central"],
];
function buildDrawPots(){
  // guards against a roster mismatch (a future data change, a renamed club, an added/removed
  // team) silently dropping someone from the draw — falls back to a strength-ranked split
  // instead of ever crashing or leaving a team out of every pot.
  const allTeams = Object.keys(ST.world.teams);
  const knownFlat = DRAW_POTS.flat();
  const knownSet = new Set(knownFlat);
  const matchesRoster = knownFlat.length===allTeams.length && allTeams.every(t=>knownSet.has(t));
  if(matchesRoster) return DRAW_POTS.map(p=>p.slice());
  const ranked = allTeams.slice().sort((a,b)=>teamAvgOvr(ST.world.teams[b])-teamAvgOvr(ST.world.teams[a]));
  const potSize = Math.ceil(ranked.length/4);
  return [0,1,2,3].map(i=>ranked.slice(i*potSize, (i+1)*potSize));
}
function buildGroupsForSeason(){
  // Season 1 always uses the real, official 2026 Libertadores draw.
  // From season 2 onward, the 32 clubs are reseeded into fresh pots every year and redrawn —
  // one team per pot per group, exactly the order the "group_draw" animation reveals them in.
  if(ST.seasonNum===1){
    const clone = {};
    Object.keys(DATA.groups).forEach(g=>{ clone[g] = DATA.groups[g].slice(); });
    return clone;
  }
  const pots = buildDrawPots();
  const rng = E.makeRNG(nextSeed());
  const groups = {};
  DRAW_GROUP_LETTERS.forEach(L=>{ groups[L] = []; });
  pots.forEach(pot=>{
    const shuffledPot = pot.slice();
    for(let i=shuffledPot.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [shuffledPot[i],shuffledPot[j]]=[shuffledPot[j],shuffledPot[i]]; }
    DRAW_GROUP_LETTERS.forEach((L,idx)=>{ if(shuffledPot[idx]) groups[L].push(shuffledPot[idx]); });
  });
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
    scorers:{}, // "<playerId>" -> {id,name,team,goals} — season-wide "Artilheiros"
  };
}

// which competition's {scorers,assisters} a goal/assist should land in. Modo Completo runs four
// competitions off the same ST.mode==="brasileirao", so an explicit compKey ("copa"/"sula"/"lib")
// is how a Copa/Sul-Americana/Libertadores goal avoids landing in the Brasileirão table instead —
// leaving compKey out keeps every pre-existing call site's behavior byte-for-byte the same.
function competitionStatsStore(compKey){
  if(compKey==="copa") return ST.copaDoBrasil;
  if(compKey==="sula") return ST.sulamericana;
  if(compKey==="lib") return ST.libertadoresCompleto;
  if(compKey==="ic") return ST.intercontinental;
  if(compKey==="wc") return ST.worldCup;
  if(compKey==="other") return ST.otherLeague;
  return ST.mode==="brasileirao" ? ST.brasileirao : ST.competition;
}
// derives that same compKey from a match's own context object (ST.pendingMatch.context) —
// shared by simulatePendingMatch() and resolvePendingPenaltyEvent(), the two places a detailed
// (user-involved) match's goals get recorded.
function compKeyForContext(ctx){
  if(!ctx) return undefined;
  if(ctx.type==="copa") return "copa";
  if(ctx.type==="sula") return "sula";
  if(ctx.type==="lib") return "lib";
  if(ctx.type==="ic_semi"||ctx.type==="ic_final") return "ic";
  if(ctx.type==="wc") return "wc";
  return undefined;
}
// Season stat tables are keyed by PLAYER (not by "club#player"), so a player who changes club mid-season keeps ONE
// line with all his goals/assists, shown under the club he plays for now. Old saves (keys "Club#id") are merged on first touch.
function migrateStatMap(map, field){
  const keys = Object.keys(map||{});
  if(!keys.some(k=>k.indexOf("#")>=0)) return map||{};
  const out = {};
  keys.forEach(k=>{
    const e = map[k]; const id = String(e.id);
    if(!out[id]) out[id] = Object.assign({}, e);
    else { out[id][field] += e[field]; out[id].team = e.team; }
  });
  return out;
}
// records one goal for the season-wide top-scorers table.
function addScorerGoal(teamName, playerId, compKey){
  const p = playerById(teamName, playerId);
  if(!p) return;
  const store = competitionStatsStore(compKey);
  if(!store) return;
  if(!store.scorersV2){ store.scorers = migrateStatMap(store.scorers, "goals"); store.scorersV2 = true; }
  const scorers = store.scorers || (store.scorers = {});
  const key = String(playerId);
  if(!scorers[key]) scorers[key] = {id:playerId, name:p.name, team:teamName, goals:0};
  scorers[key].team = teamName;
  scorers[key].goals++;
}
// same idea, for the season-wide "Assistências" table (Desempenho tab).
function addAssistPoint(teamName, playerId, compKey){
  const p = playerById(teamName, playerId);
  if(!p) return;
  const store = competitionStatsStore(compKey);
  if(!store) return;
  if(!store.assistersV2){ store.assisters = migrateStatMap(store.assisters, "assists"); store.assistersV2 = true; }
  const assisters = store.assisters || (store.assisters = {});
  const key = String(playerId);
  if(!assisters[key]) assisters[key] = {id:playerId, name:p.name, team:teamName, assists:0};
  assisters[key].team = teamName;
  assisters[key].assists++;
}
// where every player plays RIGHT NOW (squads first, then the global/prelib markets) — so tables always show the new club after a transfer
function currentClubIndex(){
  const idx = new Map();
  const w = ST.world;
  if(!w) return idx;
  (w.globalMarket||[]).forEach(p=>{ if(p.club) idx.set(String(p.id), p.club); });
  (w.prelibMarket||[]).forEach(p=>{ if(p.club) idx.set(String(p.id), p.club); });
  Object.values(w.teams||{}).forEach(t=>{ if(t.isNation) return; (t.players||[]).forEach(p=>idx.set(String(p.id), t.name)); });
  return idx;
}
// rows of a season stat table (one per player, current club, sorted) — `field` is "goals" or "assists"
function statRows(store, mapName, field, n){
  if(!store) return [];
  const flag = mapName+"V2";
  if(!store[flag]){ store[mapName] = migrateStatMap(store[mapName], field); store[flag] = true; }
  const isWc = ST.worldCup && store===ST.worldCup;   // national teams keep the nation as "club"
  const idx = isWc ? null : currentClubIndex();
  const rows = Object.values(store[mapName]||{}).map(e=>{
    const club = idx && idx.get(String(e.id));
    return club && club!=="Free Agents" ? Object.assign({}, e, {team:club}) : e;
  });
  return rows.sort((a,b)=>b[field]-a[field] || a.name.localeCompare(b.name)).slice(0, n||25);
}

// wraps the fast (AI-vs-AI) simulator so every match — not just the user's own —
// still feeds real goalscorers (and assisters) into the "Artilheiros"/"Assistências" tables.
// compKey routes a Copa/Sul-Americana/Libertadores match's stats into that competition's own
// table instead of the Brasileirão one — see competitionStatsStore().
function simFast(homeTeamName, awayTeamName, compKey, quiet){
  const res = E.simulateFastMatch(ST.world.teams[homeTeamName], ST.world.teams[awayTeamName], nextSeed());
  (res.scorersHome||[]).forEach(id=>addScorerGoal(homeTeamName, id, compKey));
  (res.scorersAway||[]).forEach(id=>addScorerGoal(awayTeamName, id, compKey));
  (res.assistsHome||[]).forEach(id=>{ if(id!=null) addAssistPoint(homeTeamName, id, compKey); });
  (res.assistsAway||[]).forEach(id=>{ if(id!=null) addAssistPoint(awayTeamName, id, compKey); });
  if(!quiet) collectFastRatings(res, homeTeamName, awayTeamName);
  return res;
}

// ============================================================
// TIME DA SEMANA / TIME DA TEMPORADA — a real, ratings-based best 4-3-3 XI, picked from every
// club across whichever round of matches just finished. Ratings come from BOTH the user's own
// detailed matches AND the fast (AI-vs-AI) sim, which now produces an approximate per-player
// rating too (buildFastRatings() in engine.ts) — without that, only the user's own XI would ever
// carry a rating, and a league-wide "team of the week" wouldn't mean anything.
// startRatingRound()/closeRatingRound() bracket a single round/leg's worth of matches (called
// from wherever that round starts being simulated and wherever it's considered finished — the
// same points that already exist for advancing each competition's own state).
// ============================================================
let roundRatingPool = null; // {playerId: {id,name,team,pos,ratingSum,ratingCount}} — the round/leg currently being collected
function startRatingRound(){
  roundRatingPool = {}; // starting fresh silently discards anything left from a round whose close() was missed — never crashes, that round's reveal is just lost
}
function collectRating(playerId, name, teamName, pos, rating){
  if(!roundRatingPool) return;
  if(!roundRatingPool[playerId]) roundRatingPool[playerId] = {id:playerId, name, team:teamName, pos, ratingSum:0, ratingCount:0};
  const rec = roundRatingPool[playerId];
  rec.ratingSum += rating; rec.ratingCount++;
}
function collectFastRatings(res, homeTeamName, awayTeamName){
  (res.ratingsHome||[]).forEach(r=>collectRating(r.id, r.name, homeTeamName, r.pos, r.rating));
  (res.ratingsAway||[]).forEach(r=>collectRating(r.id, r.name, awayTeamName, r.pos, r.rating));
}
// picks the best 4-3-3 XI (E.FORMATIONS["4-3-3"]'s 11 slots) from a {playerId:{ratingSum,
// ratingCount,...}} pool — one player per slot, preferring an exact natural-position match and
// falling back to the same broad position group (E.POS_GROUP) if a slot has no exact candidate
// left. minApps gates a season-long pool against a one-cameo outlier; a single round's pool
// never needs it (everyone in it only has 1 appearance that round anyway).
function pickBestXIFromPool(pool, minApps){
  const slots = E.FORMATIONS["4-3-3"];
  const clubNow = currentClubIndex();
  const candidates = Object.values(pool).filter(r=>r.ratingCount>=(minApps||1)).map(r=>{ const c = clubNow.get(String(r.id)); return {...r, team: c && c!=="Free Agents" ? c : r.team, avgRating: r.ratingSum/r.ratingCount}; });
  const used = new Set();
  return slots.map(slot=>{
    let pool1 = candidates.filter(c=>!used.has(c.id) && c.pos===slot);
    if(!pool1.length) pool1 = candidates.filter(c=>!used.has(c.id) && E.POS_GROUP[c.pos]===E.POS_GROUP[slot]);
    if(!pool1.length) return null;
    const best = pool1.sort((a,b)=>b.avgRating-a.avgRating)[0];
    used.add(best.id);
    return best;
  });
}
// closes out whichever round/leg was being collected: folds it into the Brasileirão's own
// season-long pool (feeds "Seleção da Temporada" at year's end — Brasileirão only, that's how
// this was asked for), picks that round's own Time da Semana, and — only when the user's own
// club actually has someone in it — drops a mail with the full XI. compLabel is how the e-mail
// names the competition ("Brasileirão", "Copa do Brasil", "Sul-Americana", "Libertadores").
function closeRatingRound(compKey, compLabel){
  const pool = roundRatingPool;
  roundRatingPool = null;
  if(!pool || !Object.keys(pool).length) return;
  if(compKey==="brasileirao" && ST.brasileirao){
    const season = ST.brasileirao.seasonRatings || (ST.brasileirao.seasonRatings = {});
    Object.values(pool).forEach(r=>{
      if(!season[r.id]) season[r.id] = {id:r.id, name:r.name, team:r.team, pos:r.pos, ratingSum:0, ratingCount:0};
      const rec = season[r.id];
      rec.name = r.name; rec.team = r.team; rec.pos = r.pos; // keep fresh in case of a mid-season transfer
      rec.ratingSum += r.ratingSum; rec.ratingCount += r.ratingCount;
    });
  }
  const xi = pickBestXIFromPool(pool, 1);
  if(xi.some(p=>p && p.team===ST.teamId)){
    addMail({
      type:"totw",
      subject:"Seleção da Semana",
      from:"Sofascore",
      preview:`Você tem jogador(es) na Seleção da Semana da ${compLabel}!`,
      payload:{compLabel, xi},
    });
  }
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

const WC_LABELS = Object.fromEntries(Object.entries(WC.WC_STAGE_LABEL).map(([k,v])=>["wc_"+k, v]));
function stageLabelFor(type){
  return {group:"Fase de Grupos", r16:"Oitavas de Final", qf:"Quartas de Final", sf:"Semifinal", final:"Final",
    prelib_qf:"Pré-Libertadores — Quartas de Final", prelib_sf:"Pré-Libertadores — Semifinal", prelib_final:"Pré-Libertadores — Final",
    copa_r16:"Copa do Brasil — Oitavas de Final", copa_qf:"Copa do Brasil — Quartas de Final",
    copa_sf:"Copa do Brasil — Semifinal", copa_final:"Copa do Brasil — Final", copa_done:"Copa do Brasil — Encerrada",
    sula_groups:"Sul-Americana — Fase de Grupos", sula_r16:"Sul-Americana — Oitavas de Final", sula_qf:"Sul-Americana — Quartas de Final",
    sula_sf:"Sul-Americana — Semifinal", sula_final:"Sul-Americana — Final", sula_done:"Sul-Americana — Encerrada",
    lib_groups:"Libertadores — Fase de Grupos", lib_r16:"Libertadores — Oitavas de Final", lib_qf:"Libertadores — Quartas de Final",
    lib_sf:"Libertadores — Semifinal", lib_final:"Libertadores — Final", lib_done:"Libertadores — Encerrada",
    ic_semi:"Mundial de Clubes — Semifinal", ic_final:"Mundial de Clubes — Final", ic_done:"Mundial de Clubes — Encerrado",
    brasileirao:"Brasileirão"}[type] || WC_LABELS[type] || type;
}

function decrementAvailability(){
  Object.values(ST.world.teams).forEach(t=>t.players.forEach(p=>{
    if(p.suspendedMatches>0){ p.suspendedMatches--; if(p.suspendedMatches<=0){p.suspendedMatches=0; p.suspended=false;} }
    if(p.injuredMatches>0){ p.injuredMatches--; if(p.injuredMatches<=0){p.injuredMatches=0; p.injured=false;} }
    if(p.form) p.form = Math.round(p.form*0.5*10)/10;
  }));
}

// ============================================================
// CALENDAR ("AVANÇAR DIA") + E-MAIL INBOX
// ============================================================
// A lightweight day-by-day pacing layer sitting on top of the existing round-based
// tournament advance: the hub's next-match card now counts down 3-4 days (instead of
// jumping straight into the match), and every day advanced has a chance to drop new
// mail — transfer offers, injury updates, opponent scouting — into the inbox. When the
// countdown reaches zero, advanceTournament() runs exactly as it always did, landing on
// the existing pre-match "Confirmar escalação" screen (with its own speed picker).
const WEEKDAYS = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"];
function ensureCalendarCountdown(){
  if(ST.calendarDaysLeft==null){
    const rng = E.makeRNG(nextSeed());
    ST.calendarDaysLeft = 3 + Math.floor(rng()*2); // 3 or 4 days until the next match
  }
}
function mintMailId(){ ST.mailSeq = (ST.mailSeq||0)+1; return "mail"+ST.mailSeq; }
function inboxList(){ return Array.isArray(ST.inbox) ? ST.inbox : (ST.inbox=[]); }
function findMail(id){ return inboxList().find(m=>m.id===id); }
function unreadMailCount(){ return inboxList().filter(m=>!m.read).length; }
function markAllMailRead(){ inboxList().forEach(m=>{ m.read = true; }); scheduleSave(); }
function clearInbox(){ ST.inbox = []; ST.openMailId = null; scheduleSave(); }
// every new mail lands with today's weekday stamped on it and unread — callers only
// need to supply {type, subject, from, preview, body?, payload?}.
function addMail(mail){
  mail.id = mintMailId();
  mail.dayLabel = WEEKDAYS[ST.calendarWeekdayIdx];
  mail.read = false;
  inboxList().unshift(mail);
  scheduleSave();
}

const MEDICAL_SUBJECTS = ["Boletim médico","Departamento Médico informa","Atualização do DM","Informe do fisioterapeuta"];
const INJURY_KINDS = [
  "lesão muscular na coxa","entorse no tornozelo","lesão no joelho","desgaste na panturrilha",
  "contusão no ombro","lesão na virilha","dores lombares","corte no supercílio (levou pontos)",
  "luxação no dedo","estiramento no posterior de coxa","pancada no tornozelo","fadiga muscular",
];
// summarizes any of the user's own players hurt in the match that just finished — pulled
// straight from that match's own injury events, so it never invents anything the engine
// didn't already simulate.
function generatePostMatchMail(pm){
  if(!pm || !pm.result) return;
  const mySide = pm.ref.home===ST.teamId ? "home" : "away";
  const injuries = pm.result.events.filter(ev=>ev.type==="injury" && ev.side===mySide);
  if(!injuries.length) return;
  const rng = E.makeRNG(nextSeed());
  const lines = injuries.map(ev=>{
    const kind = INJURY_KINDS[Math.floor(rng()*INJURY_KINDS.length)];
    const days = Math.round(ev.matchesOut*(3+rng()));
    return `<b>${esc(ev.player)}</b> sofreu ${kind} e deve desfalcar o time por cerca de ${ev.matchesOut} jogo(s) (~${days} dias).`;
  });
  addMail({
    type:"injury",
    subject: MEDICAL_SUBJECTS[Math.floor(rng()*MEDICAL_SUBJECTS.length)],
    from:"Departamento Médico",
    preview: injuries.length===1 ? `${injuries[0].player} está fora por lesão.` : `${injuries.length} jogadores machucados na partida.`,
    body: lines.join("<br><br>"),
  });
}
const TRAINING_INJURY_LINES = [
  "sentiu um desconforto durante o treino de hoje",
  "torceu o tornozelo em um treino de finalização",
  "precisou ser poupado após sentir a coxa",
  "levou uma pancada no treino tático e passa por avaliação",
];
// a small, independent chance of a training knock on a rest day — separate from
// match-day injuries, purely to give the days between matches some real content.
function maybeGenerateTrainingInjury(){
  const squad = myTeam().players.filter(p=>!p.injured && !p.suspended);
  if(!squad.length) return;
  const rng = E.makeRNG(nextSeed());
  if(rng() >= 0.05) return; // ~5% per day
  const p = squad[Math.floor(rng()*squad.length)];
  const days = 1 + Math.floor(rng()*3); // out for 1-3 games — this is the number shown in the email
  p.injured = true;
  // decrementAvailability() ticks once on the very next match-day advance, BEFORE that
  // match's lineup is even built (it's counting "this round is happening", not "the player
  // actually sat one out") — a match-day injury only ever gets ticked starting the round
  // AFTER it happens, so it naturally survives long enough to cost a real game. A training
  // injury has no such head start, so without the +1 buffer here it heals itself the instant
  // the next match rolls around and the player never actually misses anything — exactly the
  // bug being fixed: the email said they were hurt, but it cost them zero games in practice.
  p.injuredMatches = Math.max(p.injuredMatches||0, days+1);
  addMail({
    type:"injury",
    subject: MEDICAL_SUBJECTS[Math.floor(rng()*MEDICAL_SUBJECTS.length)],
    from:"Departamento Médico",
    preview:`${p.name} desfalca o time.`,
    body:`<b>${esc(p.name)}</b> ${TRAINING_INJURY_LINES[Math.floor(rng()*TRAINING_INJURY_LINES.length)]} e vai desfalcar o time por cerca de ${days} jogo(s).`,
  });
}
function oppStrengthWord(avg){
  return avg>=82 ? "um elenco de altíssimo nível" : avg>=76 ? "um elenco forte" : avg>=70 ? "um elenco equilibrado" : "um elenco mais modesto";
}
const SCOUT_OPENERS = [
  "Fica o alerta antes do jogo:",
  "Relatório do olheiro:",
  "Nosso olheiro voltou da viagem com boas informações:",
  "Antes de enfrentá-los, vale a pena saber:",
];
// sends one scouting report per fixture, a couple of days out — guarded by
// scoutedFixtureKey so it never fires twice for the same match.
function maybeGenerateScoutMail(){
  const nm = getNextUserMatch();
  if(!nm || ST.calendarDaysLeft!==2) return;
  const key = nm.home+"-"+nm.away+"-"+ST.seasonYear+"-"+(ST.competition&&ST.competition.phase)+"-"+(ST.prelib?ST.prelib.phase:"")+"-"+(ST.mode==="brasileirao"?ST.brasileirao.currentRound:"");
  if(ST.scoutedFixtureKey===key) return;
  ST.scoutedFixtureKey = key;
  const oppName = nm.home===ST.teamId ? nm.away : nm.home;
  const opp = ST.world.teams[oppName];
  if(!opp) return;
  const rng = E.makeRNG(nextSeed());
  const best = opp.players.slice().sort((a,b)=>b.ovr-a.ovr)[0];
  const topScorer = statRows(ST.mode==="brasileirao" ? ST.brasileirao : ST.competition, "scorers", "goals", 400).filter(s=>s.team===oppName)[0];
  const avg = teamAvgOvr(opp);
  const lines = [
    SCOUT_OPENERS[Math.floor(rng()*SCOUT_OPENERS.length)],
    `${esc(oppName)} tem ${oppStrengthWord(avg)} (média ${avg.toFixed(0)} de overall) e costuma jogar no 4-3-3.`,
    best ? `Fique de olho em <b>${esc(best.name)}</b> (${esc(best.pos)}, ${best.ovr} de overall) — é o melhor jogador deles.` : "",
    topScorer ? `${esc(topScorer.name)} é o artilheiro do time na temporada, com ${topScorer.goals} gol(s).` : "Ainda não têm um artilheiro destacado nesta temporada.",
  ].filter(Boolean);
  addMail({
    type:"scout",
    subject:`Análise: ${oppName}`,
    from:"Olheiro-chefe",
    preview:`Relatório sobre o ${oppName} antes do próximo jogo.`,
    body: lines.join("<br><br>"),
  });
}

const OFFER_SUBJECTS_ARAB = ["Proposta inacreditável chegou","Oferta chocante de fora da Libertadores","Um clube árabe fez uma fortuna por ele"];
const OFFER_SUBJECTS_EURO = ["Proposta pelo seu atleta","Sondagem de um clube de fora","Interesse por um dos seus titulares"];
function offerPosture(pl){ return OFFER_POSTURES.find(p=>p.id===pl.posture) || OFFER_POSTURES[1]; }
// ---------- negotiation context ----------
// Every club has its own tolerance (computeFlex in negotiation.ts) built from its finances, how much it
// depends on the player, how many equivalents it has, his age/rating/potential, his contract and the interest
// other clubs show. Nothing here is a fixed percentage and nothing is a "take it exactly or nothing" rule.
function strHash(s){ let h=0; s=String(s); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); }
function posFamily(pos){ return pos==="GK"?"G" : (pos==="CB"||pos==="LB"||pos==="RB")?"D" : (pos==="LW"||pos==="RW"||pos==="ST"||pos==="SS")?"A" : "M"; }
// how badly a club needs cash: its size group plus a stable per-club "books" factor (some are tight, some comfortable)
function clubFinanceNeed(club){
  const grp = clubGroupOf(club, ST&&ST.world);
  const base = ({EUR_ELITE:-0.7, EUR_BIG:-0.4, SA_TOP:-0.35, EUR_MID:-0.1, SA_MID:0.1, EUR_SMALL:0.2, SA_SMALL:0.35} as any)[grp] || 0;
  const stress = (strHash(club)%100)/100 - 0.5;
  return E.clamp(base + stress*0.9, -1, 1);
}
// the game has no contract field on players yet — derive a stable, plausible "years left" so the factor can still weigh in
function derivedContractYears(p){
  if(p.age>=34) return 1;
  if(p.age<=21) return 3 + (p.id%3);
  return 1 + ((p.id*7 + p.age*3) % 5);
}
function negFlexInputFor(p, squad, club, isKey){
  const subs = (squad||[]).filter(q=>q.id!==p.id && posFamily(q.pos)===posFamily(p.pos) && q.ovr>=p.ovr-3).length;
  const fin = clubFinanceNeed(club);
  return {
    financeNeed: fin, keyPlayer: !!isKey, substitutes: subs, age: p.age, ovr: p.ovr, pot: p.pot||p.ovr,
    contractYears: derivedContractYears(p),
    rivalInterest: Math.min(1, (p.ovr>=80?0.5:p.ovr>=76?0.25:0) + ((p.age<=24 && (p.pot||0)>=82)?0.4:0)),
    mustSell: fin>0.35 ? (fin-0.35)*1.5 : 0,
  };
}
// the club's temperament (how fast it loses patience / warms up) — stable per club
function clubPosture(club){
  const r = (strHash("posture:"+club)%100)/100;
  return r<0.32 ? OFFER_POSTURES[0] : r<0.72 ? OFFER_POSTURES[1] : OFFER_POSTURES[2];
}
// the most a bidding club would really pay: well above market value only for the flexible/rich ones
function offerNegCeiling(pl){
  if(pl.W) return pl.W;
  const posture = offerPosture(pl);
  // how far above its opening bid this club is willing to stretch: a real share of the number on the table
  // (so a 15M offer can go to 17-19M and a 70M one to 80M+), different per club and per posture
  const baseRoom = posture.id==="flexivel" ? 0.30 : posture.id==="durao" ? 0.12 : 0.20;
  const jitter = 0.7 + (strHash(pl.playerId+":"+pl.club)%100)/100*0.6;       // 0.7 .. 1.3 of that room
  let W = pl.offer*(1+baseRoom*jitter*(pl.category==="arabe"?1.15:1));
  pl.W = Math.round(Math.max(W, pl.offer*1.05)/50000)*50000;
  return pl.W;
}
function fmtNeg(v){ return fmtMoney(v); }
function queueOfferMail(playerId, playerName, club, category, value, offer, rng, posture){
  const isArab = category==="arabe";
  const subjects = isArab ? OFFER_SUBJECTS_ARAB : OFFER_SUBJECTS_EURO;
  const posturePick = posture||OFFER_POSTURES[1].id;
  const postureObj = OFFER_POSTURES.find(p=>p.id===posturePick) || OFFER_POSTURES[1];
  addMail({
    type:"offer",
    subject: subjects[Math.floor(rng()*subjects.length)],
    from: club,
    preview: `Proposta por ${playerName}: ${fmtMoney(offer)}.`,
    payload:{ playerId, playerName, club, category, value, offer, round:0, status:"pending", comebackCount:0, posture: posturePick, mood: NEG_CONFIG.startMood, neg: newNegState(offer), userReplyDaysLeft:7 },
  });
}
const OFFER_COMEBACK_LINES = [
  "Reconsideramos e voltamos com uma proposta melhor.",
  "Depois da sua recusa, a diretoria autorizou um valor maior.",
  "Ainda temos interesse — aqui vai uma nova oferta.",
];
// a subject only ever gets one "RE: " on it, even through a long back-and-forth thread.
function reSubject(subject){ return subject.indexOf("RE: ")===0 ? subject : "RE: "+subject; }
// the range the manager is allowed to type into the "pedir outro valor" box — can't ask for
// less than what's already on the table (that's what Aceitar is for), and capped well above
// market value so an absurd ask is possible but not infinite.
function offerAskRange(pl){
  const minAsk = Math.max(pl.offer+5000, Math.round(pl.offer*1.005/5000)*5000);   // can come all the way down to just above the bid on the table
  const maxAsk = Math.max(minAsk+5000, Math.round(pl.value*3/5000)*5000, Math.round(pl.offer*1.5/50000)*50000);   // room above the bid is a share of the bid itself (a 70M offer can be asked up to 105M), not just 3x the value
  return { minAsk, maxAsk };
}
// the manager types in the value they want to ask for (clamped to offerAskRange). The decision is made by the
// negotiation engine (negotiation.ts) — pure numbers: how far the ask is from what the club would really pay, how
// patient the director still is, how the last few proposals went. The club never walks away over a small gap:
// it accepts, accepts with conditions, or counters; only a real reason (repeated absurd asks, or running out of
// rounds with a far-apart number) ends the talks. The director's text is just the decision put into words.
function negotiateOffer(mailId, askedAmountRaw){
  const mail = findMail(mailId);
  if(!mail || mail.type!=="offer" || mail.payload.status!=="pending") return;
  const pl = mail.payload;
  if(myTeam().players.some(p=>p.id===pl.playerId && sellLocked(p))) return;
  const {minAsk, maxAsk} = offerAskRange(pl);
  const asked = Math.round(E.clamp(Number(askedAmountRaw)||minAsk, minAsk, maxAsk)/5000)*5000;
  runOfferNegotiation(mail, asked);
}
// shared by the live click and the legacy "awaiting reply" ticks
function runOfferNegotiation(mail, asked){
  const pl = mail.payload;
  const posture = offerPosture(pl);
  if(!pl.neg) pl.neg = newNegState(pl.offer);
  pl.neg.now = pl.offer;                       // the club's standing bid is the current offer
  const W = offerNegCeiling(pl);
  const dec = negDecide({role:"buyer", x:asked, target:pl.offer, limit:W, angerMult:posture.angerMult, acceptMult:posture.acceptMult}, pl.neg);
  pl.neg = dec.state; pl.mood = dec.mood; pl.moodDelta = dec.moodDelta; pl.round = (pl.round||0)+1;
  if(!mail.thread) mail.thread = [];
  mail.thread.push("Você pediu "+fmtMoney(asked)+".");
  mail.thread.push(composeReply(dec, {player:pl.playerName, club:pl.club, fmt:fmtNeg, role:"buyer", seed:strHash(pl.playerId+pl.club)}));
  pl.userReplyDaysLeft = 7;                    // a fresh 7-day window on this round's number
  if(dec.verdict==="accept"){
    pl.offer = dec.price; acceptMailOffer(mail.id); return;
  }
  if(dec.verdict==="accept_conditions" || dec.verdict.indexOf("counter")===0){
    if(dec.counter!=null && dec.counter>pl.offer) pl.offer = dec.counter;       // the club only ever raises its bid
  } else if(dec.verdict==="end"){
    pl.status = "withdrawn";
  }
  scheduleSave();
}
// resolves a negotiation an OLD save left "awaiting reply" (the club used to ask a few days to think it over — that
// random delay no longer exists, but a career saved in that state still resolves, through the same engine)
function tickPendingOfferReplies(){
  inboxList().filter(m=>m.type==="offer" && m.payload.status==="awaiting_reply").forEach(mail=>{
    const pl = mail.payload;
    pl.pendingReplyDays = (pl.pendingReplyDays==null?1:pl.pendingReplyDays)-1;
    if(pl.pendingReplyDays>0) return;
    pl.status = "pending";
    runOfferNegotiation(mail, pl.pendingAsk||pl.offer);
  });
}
function acceptMailOffer(mailId){
  const mail = findMail(mailId);
  if(!mail || mail.type!=="offer" || mail.payload.status!=="pending") return;
  const pl = mail.payload;
  const t = myTeam();
  if(!t.players.some(p=>p.id===pl.playerId && !sellLocked(p))){ pl.status="void"; scheduleSave(); return; }
  const sold = t.players.find(p=>p.id===pl.playerId);
  t.players = t.players.filter(p=>p.id!==pl.playerId);
  ST.lineup = ST.lineup.map(id=> id===pl.playerId ? null : id);
  ST.budget += pl.offer;
  pl.status = "accepted";
  if(sold){ moveSoldPlayer(sold, pl.club); openSaleDone(sold, pl.club, pl.offer); }
  ST.newsLog.unshift({title:"Venda concluída!", text:`${pl.playerName} foi vendido para o ${pl.club} por ${fmtMoney(pl.offer)}.`});
  scheduleSave();
}
function rejectMailOffer(mailId){
  const mail = findMail(mailId);
  if(!mail || mail.type!=="offer" || mail.payload.status!=="pending") return;
  mail.payload.status = "rejected";
  scheduleSave();
}
// a declined offer sometimes isn't the end of it — the buying club can come back days
// later with a noticeably better number, up to twice per player, before giving up for good.
function maybeGenerateOfferComeback(){
  const rng = E.makeRNG(nextSeed());
  const candidates = inboxList().filter(m=>m.type==="offer" && m.payload.status==="rejected" && (m.payload.comebackCount||0)<2);
  for(const mail of candidates){
    if(rng() >= 0.25) continue;
    const pl = mail.payload;
    if(!myTeam().players.some(p=>p.id===pl.playerId && !sellLocked(p))) continue; // sold/gone since
    const newOffer = Math.round(pl.offer*(1.12+rng()*0.18)/5000)*5000;
    pl.status = "superseded";
    addMail({
      type:"offer",
      subject: reSubject(mail.subject),
      from: pl.club,
      preview:`Nova proposta por ${pl.playerName}: ${fmtMoney(newOffer)}.`,
      thread:[OFFER_COMEBACK_LINES[Math.floor(rng()*OFFER_COMEBACK_LINES.length)]],
      payload:{ playerId:pl.playerId, playerName:pl.playerName, club:pl.club, category:pl.category, value:pl.value, offer:newOffer, round:0, status:"pending", comebackCount:(pl.comebackCount||0)+1, posture:pl.posture, mood: NEG_CONFIG.startMood, neg: newNegState(newOffer), userReplyDaysLeft:7 },
    });
    break; // at most one comeback mail per day, keeps the inbox from flooding
  }
}
// runs once per "AVANÇAR DIA" click — everything that can land in the inbox on a given day.
function generateDailyMail(){
  if(wcActive()) return;
  tickNationalOfferExpiry();
  maybeNationalOffers();
  maybeGenerateScoutMail();
  tickPendingOfferReplies();
  tickPendingOfferExpiry();
  maybeIncomingOffer(0.14);
  maybeGenerateOfferComeback();
  maybeGenerateTrainingInjury();
  tickScoutReport();
  tickObservations();
}
// a "pending" offer (the ball is in the manager's own court — accept it, counter it, or let it
// sit) is only ever live for 7 days: every day it goes untouched counts down, and once it hits
// 0 the club assumes the silence is a no and pulls the offer, same "withdrawn" status a failed
// negotiation risk-roll produces, just flagged separately (expiredNoReply) so the mail explains
// WHY it's gone — the manager missed the window, not that the number itself scared the club off.
function tickPendingOfferExpiry(){
  inboxList().filter(m=>m.type==="offer" && m.payload.status==="pending").forEach(mail=>{
    const pl = mail.payload;
    if(pl.userReplyDaysLeft==null) pl.userReplyDaysLeft = 7; // safety net for a save from before this existed
    pl.userReplyDaysLeft--;
    if(pl.userReplyDaysLeft>0) return;
    pl.status = "withdrawn";
    pl.expiredNoReply = true;
  });
}

// ============================================================
// TRAINING ("DIA DE TREINO") — every 2 days advanced (outside match day), the calendar
// interrupts itself with a training day: each squad player carries their own 0-100 progress
// bar (p.trainProgress) that "Simular Treino" fills in — once it fills past 100 the player
// gains an overall point (capped at their potential) and the bar carries the remainder into
// the next bar. "Pular Dia de Treino" skips it outright: progress backslides and there's a
// real chance a player's potential itself gets knocked down a point for the neglect.
// ============================================================
// runs the session and records each player's gain in ST.trainingResult ({playerId:{gain,
// leveledUp}}) so the training screen can show a green "+X%" next to whoever improved,
// instead of just silently updating the bars — trainingPending stays true so the card keeps
// showing this result until the manager clicks through with finishTrainingDay().
function runSquadTraining(){
  const rng = E.makeRNG(nextSeed());
  const squad = myTeam().players;
  const leveled = [];
  const result = {};
  squad.forEach(p=>{
    if(p.ovr>=p.pot){ result[p.id] = {gain:0, leveledUp:false}; return; } // already maxed out
    // Modo Completo's full 38-round season packs in roughly 5x as many training days as the
    // classic Libertadores-only career — at the old 8-22%+youth-bonus rate that meant a young
    // prospect could blow straight through their whole potential gap in a single season, years
    // before a real footballer peaks. Recalibrated so the season-long total (training days here
    // PLUS the age-curve jump in ageOnePlayer(), which already lands most players near their
    // ceiling around 26-28 on its own) reads as a gradual, multi-season development arc instead.
    const youthBonus = p.age<=21 ? 0.6 : p.age<=25 ? 0.2 : 0;
    const gain = 1.1 + rng()*2.0 + youthBonus;
    const fromOvr = p.ovr;
    p.trainProgress = (p.trainProgress||0) + gain;
    let leveledUp = false;
    while(p.trainProgress>=100 && p.ovr<p.pot){
      p.trainProgress -= 100;
      p.ovr = Math.min(p.pot, p.ovr+1);
      leveled.push(p.name);
      leveledUp = true;
    }
    if(p.ovr>=p.pot) p.trainProgress = 0;
    result[p.id] = {gain: Math.round(gain), leveledUp, fromOvr, toOvr:p.ovr, name:p.name, pos:p.pos};
  });
  ST.trainingResult = result;
  if(leveled.length){
    ST.newsLog.unshift({title:"Treino em dia!", text:`${leveled.join(", ")} evoluiu${leveled.length>1?"ram":""} de overall após o treino.`});
  }
  scheduleSave();
}
function finishTrainingDay(){
  ST.trainingPending = false;
  ST.trainingResult = null;
  scheduleSave();
}
function skipSquadTraining(){
  const rng = E.makeRNG(nextSeed());
  const squad = myTeam().players;
  squad.forEach(p=>{
    p.trainProgress = Math.max(0, (p.trainProgress||0) - (10+rng()*10));
    if(p.pot>p.ovr && rng()<0.12){ p.pot = Math.max(p.ovr, p.pot-1); }
  });
  ST.trainingPending = false;
  ST.trainingResult = null;
  ST.newsLog.unshift({title:"Treino pulado", text:"O elenco perdeu ritmo de treino — o desenvolvimento de alguns jogadores foi prejudicado."});
  scheduleSave();
}

// career-long goal/assist ledger, spanning every club the manager has been in charge of —
// unlike ST.competition.scorers (which is league-wide and resets every season), this only ever
// grows across the whole 10-season career and only counts a player's team when it's ST.teamId,
// i.e. strictly "while under this manager's command".
function ensureCareerStats(){
  // lazy-init so a save from before this feature existed still starts tracking from here on,
  // instead of never getting a summary at all.
  if(!ST.careerStats) ST.careerStats = {goals:{}, assists:{}, signings:[]};
  return ST.careerStats;
}
function recordCareerStat(bucket, name){
  const b = ensureCareerStats()[bucket];
  b[name] = (b[name]||0) + 1;
}
function recordCareerSigning(name, price){
  ensureCareerStats().signings.push({name, price, team:ST.teamId, year:ST.seasonYear});
}
// ============================================================
// "MEU CLUBE" STATS — every player's apps/goals/assists/cards/rating/injuries, broken down
// by season and rolled up into a "career at this club" total. Strictly scoped to whichever
// club is CURRENT: the moment ST.teamId changes (a new job), ensureClubCareer() below throws
// the old block away and starts fresh — this is deliberately NOT the same ledger as
// ST.careerStats above, which instead follows the manager across every club they've had.
// ============================================================
function ensureClubCareer(){
  if(!ST.clubCareer || ST.clubCareer.club!==ST.teamId){
    ST.clubCareer = { club: ST.teamId, seasons: {} };
  }
  return ST.clubCareer;
}
function ensureClubSeason(){
  const cc = ensureClubCareer();
  const key = String(ST.seasonYear);
  if(!cc.seasons[key]) cc.seasons[key] = { players: {} };
  return cc.seasons[key];
}
function ensureClubSeasonPlayer(season, p){
  const key = String(p.id);
  if(!season.players[key]){
    season.players[key] = { id:p.id, name:p.name, pos:p.pos, apps:0, goals:0, assists:0, yellow:0, red:0, ratingSum:0, ratingCount:0, injuries:[] };
  }
  const rec = season.players[key];
  rec.name = p.name; rec.pos = p.pos; // keep the label fresh even if it drifts mid-career
  return rec;
}
// aggregates every recorded season into one "career at this club" total per player.
function clubCareerTotals(){
  const cc = ensureClubCareer();
  const agg = {};
  Object.values(cc.seasons).forEach(season=>{
    Object.values(season.players).forEach(rec=>{
      const key = String(rec.id);
      if(!agg[key]) agg[key] = {id:rec.id, name:rec.name, pos:rec.pos, apps:0, goals:0, assists:0, yellow:0, red:0, ratingSum:0, ratingCount:0, injuries:[]};
      const a = agg[key];
      a.apps+=rec.apps; a.goals+=rec.goals; a.assists+=rec.assists; a.yellow+=rec.yellow; a.red+=rec.red;
      a.ratingSum+=rec.ratingSum; a.ratingCount+=rec.ratingCount;
      a.injuries = a.injuries.concat(rec.injuries);
      a.name = rec.name; a.pos = rec.pos;
    });
  });
  return agg;
}
function applyDetailedResultToWorld(homeTeamName, awayTeamName, homeLineup, awayLineup, result, compKey){
  const allP = homeLineup.filter(Boolean).concat(awayLineup.filter(Boolean));
  allP.forEach(p=>{
    const rating = result.ratings[p.id];
    if(rating!=null) p.form = Math.round((rating-6.5)*10)/10;
  });
  // feeds the same Time da Semana/Temporada pool the fast sim does (see collectFastRatings()) —
  // this is the ONE detailed (event-by-event) match in an otherwise fast-simulated round, so it
  // needs its own explicit hookup rather than going through simFast().
  homeLineup.forEach(p=>{ if(p && result.ratings[p.id]!=null) collectRating(p.id, p.name, homeTeamName, p.pos, result.ratings[p.id]); });
  awayLineup.forEach(p=>{ if(p && result.ratings[p.id]!=null) collectRating(p.id, p.name, awayTeamName, p.pos, result.ratings[p.id]); });
  const userIsHome = homeTeamName===ST.teamId;
  const userIsAway = awayTeamName===ST.teamId;
  const myLineup = userIsHome ? homeLineup : awayLineup;
  const mySide = userIsHome ? "home" : "away";
  const clubSeason = (!ST.natDuty && (userIsHome || userIsAway)) ? ensureClubSeason() : null;
  if(clubSeason){
    myLineup.forEach(p=>{
      if(!p) return;
      const rec = ensureClubSeasonPlayer(clubSeason, p);
      rec.apps++;
      const rating = result.ratings[p.id];
      if(rating!=null){ rec.ratingSum += rating; rec.ratingCount++; }
    });
  }
  result.events.forEach(ev=>{
    const side = ev.side==="home" ? homeLineup : awayLineup;
    const p = side.find(pp=>pp && pp.name===ev.player);
    if(!p) return;
    if(ev.type==="red"){ p.suspended=true; p.suspendedMatches=Math.max(p.suspendedMatches,1); }
    if(ev.type==="injury"){ p.injured=true; p.injuredMatches=Math.max(p.injuredMatches,ev.matchesOut); }
    if(ev.type==="goal"){
      const scoringTeam = ev.side==="home"?homeTeamName:awayTeamName;
      addScorerGoal(scoringTeam, p.id, compKey);
      if(ev.assist){
        const assisterP = side.find(pp=>pp && pp.name===ev.assist);
        if(assisterP) addAssistPoint(scoringTeam, assisterP.id, compKey);
      }
      if(scoringTeam===ST.teamId && !ST.natDuty){
        recordCareerStat("goals", p.name);
        if(ev.assist) recordCareerStat("assists", ev.assist);
      }
    }
    if(clubSeason && ev.side===mySide){
      const rec = ensureClubSeasonPlayer(clubSeason, p);
      if(ev.type==="goal"){
        rec.goals++;
        if(ev.assist){
          const assister = myLineup.find(pp=>pp && pp.name===ev.assist);
          if(assister) ensureClubSeasonPlayer(clubSeason, assister).assists++;
        }
      }
      if(ev.type==="yellow") rec.yellow++;
      if(ev.type==="red") rec.red++;
      if(ev.type==="injury"){
        rec.injuries.push({days: Math.round((ev.matchesOut||1)*3.5), games: ev.matchesOut||1, seasonYear: ST.seasonYear});
      }
    }
  });
}

// -- advance the tournament by one step (called from "Avançar" button) --
function advanceTournament(){
  if(wcActive()){ advanceWorldCupStep(); return; } // Copa do Mundo: todos os campeonatos parados
  if(ST.mode==="brasileirao"){ advanceBrasileiraoStep(); return; }
  if(ST.prelib){ stepPreLib(); return; }
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
  let drawnUserTie = null;
  round.ties.forEach(tie=>{
    const l1=tie.legs[0], l2=tie.legs[1];
    // leg1: home=teamB(runner) away=teamA(winner) ; leg2: home=teamA away=teamB
    const aggA = l1.as + l2.hs; // teamA goals across both legs
    const aggB = l1.hs + l2.as; // teamB goals across both legs
    tie.aggA=aggA; tie.aggB=aggB;
    const isUserTie = tie.teamA===ST.teamId || tie.teamB===ST.teamId;
    if(aggA>aggB) tie.winner=tie.teamA;
    else if(aggB>aggA) tie.winner=tie.teamB;
    else if(isUserTie){
      // resolved once the interactive shootout below finishes, not here
      tie.wentToPens = true;
      drawnUserTie = tie;
    } else {
      tie.wentToPens=true; tie.winner = rng()<0.5?tie.teamA:tie.teamB;
    }
  });
  if(drawnUserTie){
    startShootout(drawnUserTie.teamA, drawnUserTie.teamB, {type:"knockoutTie", tieId:drawnUserTie.id});
    return;
  }
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

// ============================================================
// PENALTY SHOOTOUT — interactive, animated, name-by-name reveal
// ============================================================
// best takers first (by shooting skill), goalkeeper never in the rotation; cycles back through
// the outfield order if a shootout somehow runs past everyone once (extended sudden death).
function pickShootoutOrder(lineup, teamObj){
  const pool = (lineup && lineup.length ? lineup : teamObj.players).filter(Boolean);
  const gk = pool.find(p=>p.pos==="GK") || teamObj.players.find(p=>p.pos==="GK");
  const outfield = pool.filter(p=>p.pos!=="GK");
  const sorted = outfield.slice().sort((a,b)=>(b.sho||b.ovr)-(a.sho||a.ovr));
  return { gk, kickers: sorted.length ? sorted : (gk?[gk]:[]) };
}
function buildShootoutKick(team, shooter, gkPlayer, rng){
  const {scored, flavor} = E.resolvePenaltyKick(shooter, gkPlayer, rng);
  return { team, playerId: shooter?shooter.id:null, name: shooter?shooter.name:"—", scored, flavor };
}
// standard shootout stopping rule: in the first 5 rounds, stop as soon as the trailing side
// can no longer catch up even if they score every remaining kick; after 5-5, sudden death ends
// the instant the two sides' tallies differ with equal kicks taken.
function shootoutDecided(s){
  const kicksA = s.kicks.slice(0, s.revealIdx+1).filter(k=>k.team==="A").length;
  const kicksB = s.kicks.slice(0, s.revealIdx+1).filter(k=>k.team==="B").length;
  if(kicksA<5 || kicksB<5){
    const remA = 5-kicksA, remB = 5-kicksB;
    if(s.scoreA > s.scoreB + remB) return true;
    if(s.scoreB > s.scoreA + remA) return true;
    return false;
  }
  if(kicksA===kicksB && s.scoreA!==s.scoreB) return true;
  return false;
}
// kicks off an interactive shootout screen — pass what to do once it resolves via resolveCtx
// ({type:"knockoutTie", tieId} or {type:"final"}).
function startShootout(teamAName, teamBName, resolveCtx){
  const rng = E.makeRNG(nextSeed());
  const teamAObj = ST.world.teams[teamAName];
  const teamBObj = ST.world.teams[teamBName];
  function lineupFor(teamObj, teamName){
    if(teamName===ST.teamId) return lineupPlayers().filter(p=>p && !p.injured && !p.suspended);
    return E.bestAvailableXI(teamObj, "4-3-3").lineup.filter(Boolean);
  }
  const orderA = pickShootoutOrder(lineupFor(teamAObj, teamAName), teamAObj);
  const orderB = pickShootoutOrder(lineupFor(teamBObj, teamBName), teamBObj);

  const kicks = [];
  const ROUNDS = 15; // far more than any realistic shootout needs
  for(let r=0;r<ROUNDS;r++){
    const shooterA = orderA.kickers.length ? orderA.kickers[r % orderA.kickers.length] : null;
    const shooterB = orderB.kickers.length ? orderB.kickers[r % orderB.kickers.length] : null;
    kicks.push(buildShootoutKick("A", shooterA, orderB.gk, rng));
    kicks.push(buildShootoutKick("B", shooterB, orderA.gk, rng));
  }

  ST.penaltyShootout = {
    teamAName, teamBName, kicks,
    revealIdx: 0, nameShown: [], resultShown: [],
    scoreA: 0, scoreB: 0,
    phase: "kicking",
    resolveCtx,
  };
  ST.stage = "penaltyShootout";
  ST.uiModal = null;
  setTimeout(()=>{ Game.tickShootout(); }, 700);
}
// applies the shootout's winner into the actual tie/final it was resolving, then continues
// exactly the flow that would have run if the score had never been level.
function applyShootoutResult(ctx, winner){
  if(ctx.type==="knockoutTie"){
    const round = currentKnockoutRound();
    if(!round){ ST.stage = "hub"; ST.hubTab = "competicao"; return; }
    const tie = round.ties.find(t=>t.id===ctx.tieId);
    if(tie) tie.winner = winner;
    const comp = ST.competition;
    const userTie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
    ST.stage = "hub"; ST.hubTab = "competicao";
    if(userTie && userTie.winner!==ST.teamId && !comp.userEliminated){
      comp.userEliminated = true;
      comp.placementReached = stageLabelFor(comp.phase);
      autoFinishRest();
      return;
    }
    progressBracket();
  } else if(ctx.type==="final"){
    ST.competition.phase = "done";
    ST.competition.placementReached = winner===ST.teamId ? "Campeão" : "Vice-campeão";
    ST.stage = "hub"; ST.hubTab = "competicao";
    endOfSeason();
  } else if(ctx.type==="prelibTie"){
    const tie = currentPrelibTies().find(t=>t.id===ctx.tieId);
    if(tie) tie.winner = winner;
    ST.stage = "hub"; ST.hubTab = "competicao";
    checkPrelibElimination();
  } else if(ctx.type==="copaTie"){
    const round = currentCopaRound();
    const tie = round.ties.find(t=>t.id===ctx.tieId);
    if(tie) tie.winner = winner;
    ST.stage = "hub"; ST.hubTab = "competicao";
    const cb = ST.copaDoBrasil;
    const userTie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
    if(userTie){
      if(userTie.winner===ST.teamId) payCopaStagePrize(cb.phase);
      else if(!cb.userEliminated){
        cb.userEliminated = true;
        cb.placementReached = stageLabelFor(cb.phase);
        ST.newsLog.unshift({title:"Eliminado na Copa do Brasil", text:`O ${ST.teamId} caiu na ${stageLabelFor(cb.phase)} da Copa do Brasil ${cb.year} nos pênaltis. O torneio segue sem você.`});
      }
    }
    progressCopaBracket();
    if(cb.phase==="copa_qf_draw_pending") startCopaQfDraw();
    checkForPostSeasonDeadEnd(); // in case that elimination just now was the last personal match the user could ever get in any competition this season
  } else if(ctx.type==="copaFinal"){
    const cb = ST.copaDoBrasil;
    cb.champion = winner;
    cb.phase = "copa_done";
    closeRatingRound("copa", "Copa do Brasil");
    ST.stage = "hub"; ST.hubTab = "competicao";
    if(winner===ST.teamId) payCopaStagePrize("copa_final");
    ST.newsLog.unshift({title:"Campeão da Copa do Brasil!", text:`${winner} conquista a Copa do Brasil ${cb.year} nos pênaltis.`});
    checkForPostSeasonDeadEnd(); // the Copa final itself may have been the last thing keeping the season open
  } else if(ctx.type==="sulaTie"){
    const round = currentSulaKORound();
    const tie = round.ties.find(t=>t.id===ctx.tieId);
    if(tie) tie.winner = winner;
    ST.stage = "hub"; ST.hubTab = "competicao";
    const s = ST.sulamericana;
    const userTie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
    if(userTie){
      if(userTie.winner===ST.teamId) paySulaStagePrize(s.phase);
      else if(!s.userEliminated){
        s.userEliminated = true;
        s.placementReached = stageLabelFor(s.phase);
        ST.newsLog.unshift({title:"Eliminado na Sul-Americana", text:`O ${ST.teamId} caiu na ${stageLabelFor(s.phase)} da Sul-Americana ${s.year} nos pênaltis. O torneio segue sem você.`});
      }
    }
    progressSulaBracket();
    checkForPostSeasonDeadEnd(); // in case that elimination just now was the last personal match the user could ever get in any competition this season
  } else if(ctx.type==="sulaFinal"){
    const s = ST.sulamericana;
    s.champion = winner;
    s.phase = "sula_done";
    closeRatingRound("sula", "Sul-Americana");
    ST.stage = "hub"; ST.hubTab = "competicao";
    if(winner===ST.teamId) paySulaStagePrize("sula_final");
    ST.newsLog.unshift({title:"Campeão da Sul-Americana!", text:`${winner} conquista a Sul-Americana ${s.year} nos pênaltis.`});
    checkForPostSeasonDeadEnd(); // the Sul-Americana final itself may have been the last thing keeping the season open
  } else if(ctx.type==="libTie"){
    const round = currentLibKORound();
    const tie = round.ties.find(t=>t.id===ctx.tieId);
    if(tie) tie.winner = winner;
    ST.stage = "hub"; ST.hubTab = "competicao";
    const l = ST.libertadoresCompleto;
    const userTie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
    if(userTie){
      if(userTie.winner===ST.teamId) payLibStagePrize(l.phase);
      else if(!l.userEliminated){
        l.userEliminated = true;
        l.placementReached = stageLabelFor(l.phase);
        ST.newsLog.unshift({title:"Eliminado na Libertadores", text:`O ${ST.teamId} caiu na ${stageLabelFor(l.phase)} da Libertadores ${l.year} nos pênaltis. O torneio segue sem você.`});
      }
    }
    progressLibBracket();
    checkForPostSeasonDeadEnd(); // in case that elimination just now was the last personal match the user could ever get in any competition this season
  } else if(ctx.type==="libFinal"){
    const l = ST.libertadoresCompleto;
    l.champion = winner;
    l.phase = "lib_done";
    closeRatingRound("lib", "Libertadores");
    ST.stage = "hub"; ST.hubTab = "competicao";
    if(winner===ST.teamId) payLibStagePrize("lib_final");
    ST.newsLog.unshift({title:"Campeão da Libertadores!", text:`${winner} conquista a Libertadores ${l.year} nos pênaltis.`});
    checkForPostSeasonDeadEnd(); // the Libertadores final itself may have been the last thing keeping the season open
  } else if(ctx.type==="wcKO"){
    wcAfterShootout(ctx, winner);
  } else if(ctx.type==="icSemi"){
    const ic = ST.intercontinental;
    ic.semis.sf1.winner = winner;
    closeRatingRound("ic", "Mundial de Clubes");
    ST.stage = "hub"; ST.hubTab = "competicao";
    if(winner===ST.teamId) payIntercontinentalPrize("ic_semi");
    ST.newsLog.unshift(winner===ST.teamId
      ? {title:"Classificado para a final do Mundial de Clubes!", text:`O ${ST.teamId} vence nos pênaltis e vai à final do Mundial de Clubes ${ic.year}.`}
      : {title:"Eliminado no Mundial de Clubes", text:`O ${ST.teamId} cai nos pênaltis na semifinal do Mundial de Clubes ${ic.year}.`});
    progressIntercontinentalBracket();
    advanceIntercontinentalStep();
  } else if(ctx.type==="icFinal"){
    const ic = ST.intercontinental;
    ic.final.winner = winner;
    closeRatingRound("ic", "Mundial de Clubes");
    ST.stage = "hub"; ST.hubTab = "competicao";
    finishIntercontinental(winner);
  }
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

// ============================================================
// COPA DO BRASIL — knockout starting at the round of 16, running alongside the Brasileirão
// season (Carreira Brasileirão / Modo Completo only). 2026 seeds from a hand-picked list of 16
// (no real prior-season table exists yet to rank by); from 2027 on it seeds from the previous
// year's final Brasileirão standings. Losing here never ends the user's Brasileirão season —
// it just means the Copa keeps going without them, auto-simulated the rest of the way to a
// champion, while the league campaign carries on untouched.
// ============================================================
const COPA_2026_EXCLUDED = new Set(["Chapecoense","Remo","Coritiba","Red Bull Bragantino"]);
function copaSeedTeams(){
  if(ST.seasonYear<=2026) return SERIE_A_2026.filter(n=>!COPA_2026_EXCLUDED.has(n));
  const prevTable = (ST.brasaStandingsHistory||{})[ST.seasonYear-1];
  if(prevTable && prevTable.length>=16) return prevTable.slice(0,16);
  return SERIE_A_2026.filter(n=>!COPA_2026_EXCLUDED.has(n)); // safety net, shouldn't trigger
}
// prize money for REACHING each stage (paid once, the moment the user's tie/match is won) —
// gradual, on top of whatever the Brasileirão table position pays at season's end.
function copaPrizeForStage(stageJustWon){
  return {copa_r16:900000, copa_qf:1600000, copa_sf:2800000, copa_final:5000000}[stageJustWon] || 0;
}
function payCopaStagePrize(stageJustWon){
  const prize = copaPrizeForStage(stageJustWon);
  if(!prize) return;
  ST.budget += prize;
  addSeasonPrize("copa", prize);
  ST.newsLog.unshift({title:"Premiação da Copa do Brasil", text:`Classificação na ${stageLabelFor(stageJustWon)} rende ${fmtMoney(prize)} aos cofres do ${ST.teamId}.`});
}
function startCopaDoBrasil(){
  const teams = copaSeedTeams();
  const rng = E.makeRNG(nextSeed());
  const shuffled16 = shuffled(rng, teams);
  const pairs = E.pairKnockout(shuffled16.map(n=>({name:n, country:"Brasil"})), rng);
  const ties = pairs.map((pair,i)=>makeTie(pair[0].name, pair[1].name, i<4?0:1, i%4));
  ST.copaDoBrasil = {
    year: ST.seasonYear,
    phase: "copa_r16",
    knockout: { copa_r16:{ties, legIndex:0}, copa_qf:null, copa_sf:null, copa_final:null },
    champion: null,
    userEliminated: !teams.includes(ST.teamId), // a club outside this year's Copa (e.g. a Série B side) just watches it run in the background
    placementReached: null,
    drawRevealed: 0,
    pendingQfWinners: null,
    roundsUntilNextLeg: 3, // paces Copa legs out across the Brasileirão calendar, see advanceBrasileiraoStep()
  };
  if(ST.seasonYear>=2027){
    ST.stage = "copa_draw";
    startCopaDrawAnimation();
  } else {
    ST.newsLog.unshift({title:"Copa do Brasil definida", text:"O chaveamento das oitavas de final da Copa do Brasil "+ST.seasonYear+" já está definido."});
  }
}
function startCopaDrawAnimation(){
  if(drawTimer){ clearInterval(drawTimer); drawTimer = null; }
  drawTimer = setInterval(()=>{
    if(ST.stage!=="copa_draw"){ clearInterval(drawTimer); drawTimer = null; return; }
    ST.copaDoBrasil.drawRevealed = (ST.copaDoBrasil.drawRevealed||0)+1;
    if(ST.copaDoBrasil.drawRevealed>=16){ clearInterval(drawTimer); drawTimer = null; }
    render();
  }, 550);
}
// the quarterfinal pairing is a FRESH random draw among the 8 oitavas winners (not fixed
// bracket-slot progression like every round after it) — gets its own short animation, same
// mechanics as the round-of-16 draw, just 4 confrontos instead of 8.
function startCopaQfDraw(){
  const cb = ST.copaDoBrasil;
  const winners = cb.pendingQfWinners;
  const rng = E.makeRNG(nextSeed());
  const shuffled8 = shuffled(rng, winners);
  const pairs = E.pairKnockout(shuffled8.map(n=>({name:n, country:"Brasil"})), rng);
  const qfTies = pairs.map((pair,i)=>makeTie(pair[0].name, pair[1].name, i<2?0:1, i%2));
  cb.knockout.copa_qf = { ties: qfTies, legIndex:0 };
  cb.phase = "copa_qf";
  cb.pendingQfWinners = null;
  cb.qfDrawRevealed = 0;
  if(ST.seasonYear>=2027){
    ST.stage = "copa_qf_draw";
    startCopaQfDrawAnimation();
  } else {
    ST.newsLog.unshift({title:"Quartas de final definidas", text:"Sorteio das quartas de final da Copa do Brasil realizado."});
  }
}
function startCopaQfDrawAnimation(){
  if(drawTimer){ clearInterval(drawTimer); drawTimer = null; }
  drawTimer = setInterval(()=>{
    if(ST.stage!=="copa_qf_draw"){ clearInterval(drawTimer); drawTimer = null; return; }
    ST.copaDoBrasil.qfDrawRevealed = (ST.copaDoBrasil.qfDrawRevealed||0)+1;
    if(ST.copaDoBrasil.qfDrawRevealed>=8){ clearInterval(drawTimer); drawTimer = null; }
    render();
  }, 550);
}
function currentCopaRound(){
  const k = ST.copaDoBrasil.knockout;
  return k[ST.copaDoBrasil.phase];
}
function advanceCopaLeg(){
  const round = currentCopaRound();
  const legIndex = round.legIndex;
  startRatingRound();
  let pendingUser = null;
  round.ties.forEach(tie=>{
    const leg = tie.legs[legIndex];
    if(leg.played) return;
    if(tie.teamA===ST.teamId || tie.teamB===ST.teamId){
      pendingUser = { ref:leg, tie };
    } else {
      const res = simFast(leg.home, leg.away, "copa");
      leg.hs=res.homeScore; leg.as=res.awayScore; leg.played=true;
    }
  });
  if(pendingUser){
    goToMatchDay(pendingUser.ref, {type:"copa", phase:ST.copaDoBrasil.phase, tieId:pendingUser.tie.id, legIndex});
    return true; // a real match day was triggered — caller should stop and wait for it
  }
  finishCopaLeg();
  return ST.stage==="copa_qf_draw"; // a mid-season QF draw also needs the caller to stop and wait
}
function finishCopaLeg(){
  const round = currentCopaRound();
  closeRatingRound("copa", "Copa do Brasil"); // closes the ida round here, or the volta round below — both paths land at this same top-of-function point
  if(round.legIndex===0){
    round.legIndex = 1;
    return;
  }
  const rng = E.makeRNG(nextSeed());
  let drawnUserTie = null;
  round.ties.forEach(tie=>{
    const l1=tie.legs[0], l2=tie.legs[1];
    const aggA = l1.as + l2.hs;
    const aggB = l1.hs + l2.as;
    tie.aggA=aggA; tie.aggB=aggB;
    const isUserTie = tie.teamA===ST.teamId || tie.teamB===ST.teamId;
    if(aggA>aggB) tie.winner=tie.teamA;
    else if(aggB>aggA) tie.winner=tie.teamB;
    else if(isUserTie){
      tie.wentToPens = true;
      drawnUserTie = tie;
    } else {
      tie.wentToPens=true; tie.winner = rng()<0.5?tie.teamA:tie.teamB;
    }
  });
  if(drawnUserTie){
    startShootout(drawnUserTie.teamA, drawnUserTie.teamB, {type:"copaTie", tieId:drawnUserTie.id});
    return;
  }
  const cb = ST.copaDoBrasil;
  const userTie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
  if(userTie){
    if(userTie.winner===ST.teamId) payCopaStagePrize(cb.phase);
    else if(!cb.userEliminated){
      cb.userEliminated = true;
      cb.placementReached = stageLabelFor(cb.phase);
      ST.newsLog.unshift({title:"Eliminado na Copa do Brasil", text:`O ${ST.teamId} caiu na ${stageLabelFor(cb.phase)} da Copa do Brasil ${cb.year}. O torneio segue sem você.`});
    }
  }
  progressCopaBracket();
  if(cb.phase==="copa_qf_draw_pending") startCopaQfDraw();
  checkForPostSeasonDeadEnd(); // in case that elimination just now was the last personal match the user could ever get in any competition this season
}
function progressCopaBracket(){
  const cb = ST.copaDoBrasil;
  if(cb.phase==="copa_r16"){
    // NOT built here — the quarterfinal pairing is a fresh draw, resolved by startCopaQfDraw()
    // right after this (see finishCopaLeg()). This phase is just a transient marker.
    cb.pendingQfWinners = cb.knockout.copa_r16.ties.map(t=>t.winner);
    cb.phase = "copa_qf_draw_pending";
    ST.newsLog.unshift({title:"Fim das oitavas da Copa do Brasil", text:"Sorteio das quartas de final será realizado."});
  } else if(cb.phase==="copa_qf"){
    const qf = cb.knockout.copa_qf.ties;
    const sfTies = [];
    for(let half=0; half<2; half++){
      const a = qf.find(t=>t.half===half && t.slot===0).winner;
      const b = qf.find(t=>t.half===half && t.slot===1).winner;
      sfTies.push(makeTie(a,b,half,0));
    }
    cb.knockout.copa_sf = { ties: sfTies, legIndex:0 };
    cb.phase = "copa_sf";
    ST.newsLog.unshift({title:"Fim das quartas da Copa do Brasil", text:"Semifinalistas definidos."});
  } else if(cb.phase==="copa_sf"){
    const sf = cb.knockout.copa_sf.ties;
    const home = sf.find(t=>t.half===0).winner;
    const away = sf.find(t=>t.half===1).winner;
    cb.knockout.copa_final = { home, away, played:false, hs:null, as:null };
    cb.phase = "copa_final";
    ST.newsLog.unshift({title:"Final da Copa do Brasil definida!", text:`${home} e ${away} disputarão o título da Copa do Brasil ${cb.year}.`});
  }
}
function advanceCopaFinalStep(){
  const cb = ST.copaDoBrasil;
  const f = cb.knockout.copa_final;
  startRatingRound();
  if(f.home===ST.teamId || f.away===ST.teamId){
    goToMatchDay(f, {type:"copa", phase:"copa_final"});
    return true;
  }
  const res = simFast(f.home, f.away, "copa");
  let hs=res.homeScore, as=res.awayScore;
  if(hs===as){ const rng=E.makeRNG(nextSeed()); if(rng()<0.5) hs++; else as++; }
  f.hs=hs; f.as=as; f.played=true;
  cb.champion = hs>as ? f.home : f.away;
  cb.phase = "copa_done";
  closeRatingRound("copa", "Copa do Brasil");
  ST.newsLog.unshift({title:"Campeão da Copa do Brasil!", text:`${cb.champion} conquista a Copa do Brasil ${cb.year}.`});
  return false;
}
// called from advanceBrasileiraoStep() every round — paces Copa legs out across the season
// instead of dumping the whole knockout on one day, and quietly finishes the tournament once
// the user's own team is out of it (or once the final itself is done).
function tickCopaDoBrasil(){
  const cb = ST.copaDoBrasil;
  if(!cb || cb.phase==="copa_done") return false;
  const leagueOver = brasaLeagueOver();
  if(!leagueOver && cb.roundsUntilNextLeg>0){ cb.roundsUntilNextLeg--; return false; }
  cb.roundsUntilNextLeg = leagueOver ? 0 : 3; // no Brasileirão rounds left post-season to ever count this back down — see brasaLeagueOver()
  if(cb.phase==="copa_final") return advanceCopaFinalStep();
  return advanceCopaLeg();
}

// ============================================================
// CASCADING QUALIFICATION — who plays continental football next season, straight off this
// season's final Brasileirão table (positions 1-6 Libertadores, 7-13 Sul-Americana), with the
// Copa do Brasil champion and the Sul-Americana champion each guaranteed a Libertadores berth.
// A guaranteed berth only bumps someone if the champion didn't already qualify by table position:
// the club that WOULD have taken the last Libertadores spot slides down into the Sul-Americana
// zone instead, and if that pushes the Sul-Americana zone past 7 clubs, whoever's lowest there
// (by table position) drops out of continental football entirely for the year — exactly the real
// CONMEBOL cascade, just without a Série B to also shuffle (that still doesn't exist in this game).
// ============================================================
function computeNextSeasonZones(table, copaChampion, sulaChampion){
  const order = table.map(r=>r.team); // full 20 clubs, by final position
  let liber = order.slice(0,6);
  let sula = order.slice(6,13);
  [copaChampion, sulaChampion].forEach(champ=>{
    // a foreign Sul-Americana champion (Racing, River Plate, etc.) doesn't compete for a
    // Brazilian Libertadores berth at all — only cascade for a club that's actually in this
    // Brasileirão table. Copa do Brasil's champion always is one; Sul-Americana's often isn't.
    if(!champ || !order.includes(champ) || liber.includes(champ)) return; // no cascade needed — already in by table position, or not a Brazilian club
    liber.push(champ);
    sula = sula.filter(t=>t!==champ);
    let worst=null, worstPos=-1;
    liber.forEach(t=>{ if(t===champ) return; const p=order.indexOf(t); if(p>worstPos){ worstPos=p; worst=t; } });
    if(worst){ liber = liber.filter(t=>t!==worst); sula.unshift(worst); }
    if(sula.length>7){
      sula.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
      sula.pop(); // lowest-positioned Sul-Americana slot misses out this cycle
    }
  });
  return { liber, sula };
}

// ============================================================
// CONMEBOL SUL-AMERICANA — group stage (8 groups of 4, real 2026 draw) then knockout from the
// oitavas on, running alongside the Brasileirão season exactly like the Copa do Brasil above
// (see tickSulamericana(), paced out over the calendar). Only actually simulated for a season
// when the user's own club is part of that year's 32-club field — for 2026 that's the 7 real
// entrants hardcoded in SULAMERICANA_2026; for 2027+ it's whoever the previous season's table
// (plus the cascade above) put in the Sul-Americana zone. Every other club never gets a
// ST.sulamericana object at all — there's no user reason to fully simulate a campaign nobody
// is watching, and it keeps this feature's cost proportional to how often it's actually used.
// ============================================================
// the 7 clubs the fixed 2026 template hardcodes into Brazilian slots, in the exact order
// sulamericanaGroupsForYear() swaps in that season's real 7 qualifiers — same simplification
// Copa do Brasil already makes for its own foreign-opponent-free bracket: no real future-year
// draw exists for the other 25 (non-Brasileirão) clubs, so they stay fixed across seasons.
const SULAMERICANA_BR_SLOTS = ["Atlético Mineiro","São Paulo","Santos","Botafogo","Grêmio","Vasco da Gama","Red Bull Bragantino"];
// {group, idx} for each of the 7 slots above, resolved once against the fixed 2026 template —
// NEVER re-searched against the mutated copy below, which is what a naive name-based
// search-and-replace would do; since some slot's REPLACEMENT name can collide with a later
// slot's SEARCH name (e.g. one year's zone hands "Vasco da Gama" the Botafogo slot, but "Vasco
// da Gama" is itself also one of the 7 original slot names), that would cascade into the same
// club landing in multiple groups. Resolving positions up front against the untouched template
// avoids that entirely — each of the 7 slots is a fixed (group, index) coordinate, full stop.
function sulamericanaBrSlotPositions(){
  return SULAMERICANA_BR_SLOTS.map(name=>{
    for(const g of Object.keys(SULAMERICANA_2026)){
      const idx = SULAMERICANA_2026[g].indexOf(name);
      if(idx!==-1) return {group:g, idx};
    }
    return null;
  });
}
function sulamericanaGroupsForYear(year){
  if(year<=2026) return SULAMERICANA_2026;
  const zones = (ST.brasaZonesHistory||{})[year-1];
  if(!zones || !zones.sula || zones.sula.length<7) return SULAMERICANA_2026; // safety net before any season has completed
  const groups = {};
  Object.keys(SULAMERICANA_2026).forEach(g=>{ groups[g] = SULAMERICANA_2026[g].slice(); });
  sulamericanaBrSlotPositions().forEach((pos,i)=>{
    if(!pos) return;
    const newClub = zones.sula[i];
    if(!newClub) return;
    groups[pos.group][pos.idx] = newClub;
  });
  return groups;
}
function sulaUserGroup(){
  const s = ST.sulamericana;
  return s ? Object.keys(s.groups).find(g=>s.groups[g].includes(ST.teamId)) : null;
}
function startSulamericanaIfEligible(){
  const groups = sulamericanaGroupsForYear(ST.seasonYear);
  const flat = Object.values(groups).flat();
  if(!flat.includes(ST.teamId)){ ST.sulamericana = null; return; }
  flat.forEach(name=>{
    if(ST.world.teams[name]) return;
    const src = sulamericanaTeamSource(name);
    if(!src) return;
    const players = src.players.map(p=>Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0}));
    let maxId=0; players.forEach(p=>{ if(p.id>maxId) maxId=p.id; });
    if(maxId>nextIdCounter) nextIdCounter = maxId;
    ST.world.teams[name] = { name, country: src.country||"", flag: src.flag||"", group:null, source: src.source||"gen", players };
  });
  const groupFixtures = {};
  Object.keys(groups).forEach(g=>{
    const rounds = E.doubleRoundRobin(groups[g]);
    groupFixtures[g] = rounds.map(round=>round.map(m=>({home:m.home, away:m.away, played:false, hs:null, as:null})));
  });
  ST.sulamericana = {
    year: ST.seasonYear,
    phase: "sula_groups",
    groups, groupFixtures,
    currentRound: 0,
    knockout: { sula_r16:null, sula_qf:null, sula_sf:null, sula_final:null },
    champion: null, userEliminated: false, placementReached: null,
    roundsUntilNextLeg: 2, // paces Sul-Americana match days out across the Brasileirão calendar, see advanceBrasileiraoStep()
  };
  const g = sulaUserGroup();
  ST.newsLog.unshift({title:"Sul-Americana "+ST.seasonYear, text:`O ${ST.teamId} está na fase de grupos da CONMEBOL Sul-Americana ${ST.seasonYear} — Grupo ${g}.`});
}
function sulaGroupStandingsFor(groupLetter){
  const table = {};
  ST.sulamericana.groupFixtures[groupLetter].forEach(round=>round.forEach(m=>{
    if(m.played) E.applyResultToStandings(table, m.home, m.away, m.hs, m.as);
  }));
  return E.sortedStandings(table, ST.sulamericana.groups[groupLetter]);
}
function sulaPrizeForStage(stage){
  return {sula_groups:700000, sula_r16:1300000, sula_qf:2200000, sula_sf:3800000, sula_final:7000000}[stage] || 0;
}
function paySulaStagePrize(stage){
  const prize = sulaPrizeForStage(stage);
  if(!prize) return;
  ST.budget += prize;
  addSeasonPrize("sula", prize);
  ST.newsLog.unshift({title:"Premiação da Sul-Americana", text:`Classificação rende ${fmtMoney(prize)} aos cofres do ${ST.teamId}.`});
}
function advanceSulaGroupRound(){
  const s = ST.sulamericana;
  startRatingRound();
  let pendingUser = null;
  Object.keys(s.groupFixtures).forEach(g=>{
    const round = s.groupFixtures[g][s.currentRound];
    if(!round) return;
    round.forEach(m=>{
      if(m.played) return;
      if(m.home===ST.teamId || m.away===ST.teamId){ pendingUser = m; }
      else { const res = simFast(m.home, m.away, "sula"); m.hs=res.homeScore; m.as=res.awayScore; m.played=true; }
    });
  });
  if(pendingUser){
    goToMatchDay(pendingUser, {type:"sula", phase:"sula_groups", round:s.currentRound});
    return true;
  }
  finishSulaGroupRound();
  return false;
}
function finishSulaGroupRound(){
  const s = ST.sulamericana;
  closeRatingRound("sula", "Sul-Americana");
  s.currentRound++;
  if(s.currentRound<6) return;
  const winners=[], runnersUp=[];
  Object.keys(s.groups).forEach(g=>{
    const table = sulaGroupStandingsFor(g);
    winners.push({team:table[0].team, group:g});
    runnersUp.push({team:table[1].team, group:g});
  });
  const userGroupLetter = sulaUserGroup();
  const userTable = sulaGroupStandingsFor(userGroupLetter);
  const userPos = userTable.findIndex(r=>r.team===ST.teamId)+1;
  if(userPos>2){
    s.userEliminated = true;
    s.placementReached = "Fase de Grupos";
    ST.newsLog.unshift({title:"Eliminado na Sul-Americana", text:`O ${ST.teamId} terminou em ${userPos}º no Grupo ${userGroupLetter} e está fora da Sul-Americana ${s.year} já na fase de grupos.`});
  } else {
    paySulaStagePrize("sula_groups");
  }
  const rng = E.makeRNG(nextSeed());
  const shuffledRunners = shuffled(rng, runnersUp);
  const winnersShuffled = shuffled(rng, winners);
  const usedRunner = new Set();
  const pairs = winnersShuffled.map(w=>{
    let idx = shuffledRunners.findIndex((r,i)=>!usedRunner.has(i) && r.group!==w.group);
    if(idx===-1) idx = shuffledRunners.findIndex((r,i)=>!usedRunner.has(i));
    usedRunner.add(idx);
    return [w, shuffledRunners[idx]];
  });
  const ties = pairs.map((pair,i)=>makeTie(pair[0].team, pair[1].team, i<4?0:1, i%4));
  s.knockout.sula_r16 = { ties, legIndex:0 };
  s.phase = "sula_r16";
  ST.newsLog.unshift({title:"Fase de grupos da Sul-Americana encerrada", text:"Classificados para as oitavas de final definidos."});
  checkForPostSeasonDeadEnd(); // in case group-stage elimination just now was the last personal match the user could ever get this season
}
function currentSulaKORound(){ return ST.sulamericana.knockout[ST.sulamericana.phase]; }
function advanceSulaLeg(){
  const round = currentSulaKORound();
  const legIndex = round.legIndex;
  startRatingRound();
  let pendingUser = null;
  round.ties.forEach(tie=>{
    const leg = tie.legs[legIndex];
    if(leg.played) return;
    if(tie.teamA===ST.teamId || tie.teamB===ST.teamId){ pendingUser = { ref:leg, tie }; }
    else { const res = simFast(leg.home, leg.away, "sula"); leg.hs=res.homeScore; leg.as=res.awayScore; leg.played=true; }
  });
  if(pendingUser){
    goToMatchDay(pendingUser.ref, {type:"sula", phase:ST.sulamericana.phase, tieId:pendingUser.tie.id, legIndex});
    return true;
  }
  finishSulaLeg();
  return false;
}
function finishSulaLeg(){
  const round = currentSulaKORound();
  closeRatingRound("sula", "Sul-Americana"); // closes the ida round here, or the volta round below — both paths land at this same top-of-function point
  if(round.legIndex===0){ round.legIndex = 1; return; }
  const rng = E.makeRNG(nextSeed());
  let drawnUserTie = null;
  round.ties.forEach(tie=>{
    const l1=tie.legs[0], l2=tie.legs[1];
    const aggA = l1.as + l2.hs;
    const aggB = l1.hs + l2.as;
    tie.aggA=aggA; tie.aggB=aggB;
    const isUserTie = tie.teamA===ST.teamId || tie.teamB===ST.teamId;
    if(aggA>aggB) tie.winner=tie.teamA;
    else if(aggB>aggA) tie.winner=tie.teamB;
    else if(isUserTie){ tie.wentToPens=true; drawnUserTie=tie; }
    else { tie.wentToPens=true; tie.winner = rng()<0.5?tie.teamA:tie.teamB; }
  });
  if(drawnUserTie){
    startShootout(drawnUserTie.teamA, drawnUserTie.teamB, {type:"sulaTie", tieId:drawnUserTie.id});
    return;
  }
  const s = ST.sulamericana;
  const userTie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
  if(userTie){
    if(userTie.winner===ST.teamId) paySulaStagePrize(s.phase);
    else if(!s.userEliminated){
      s.userEliminated = true;
      s.placementReached = stageLabelFor(s.phase);
      ST.newsLog.unshift({title:"Eliminado na Sul-Americana", text:`O ${ST.teamId} caiu na ${stageLabelFor(s.phase)} da Sul-Americana ${s.year}. O torneio segue sem você.`});
    }
  }
  progressSulaBracket();
  checkForPostSeasonDeadEnd(); // in case that elimination just now was the last personal match the user could ever get in any competition this season
}
function progressSulaBracket(){
  const s = ST.sulamericana;
  if(s.phase==="sula_r16"){
    const r16 = s.knockout.sula_r16.ties;
    const qfTies = [];
    for(let half=0; half<2; half++){
      const a = r16.find(t=>t.half===half && t.slot===0).winner;
      const b = r16.find(t=>t.half===half && t.slot===1).winner;
      const c = r16.find(t=>t.half===half && t.slot===2).winner;
      const d = r16.find(t=>t.half===half && t.slot===3).winner;
      qfTies.push(makeTie(a,b,half,0));
      qfTies.push(makeTie(c,d,half,1));
    }
    s.knockout.sula_qf = { ties: qfTies, legIndex:0 };
    s.phase = "sula_qf";
    ST.newsLog.unshift({title:"Fim das oitavas da Sul-Americana", text:"Classificados para as quartas de final definidos."});
  } else if(s.phase==="sula_qf"){
    const qf = s.knockout.sula_qf.ties;
    const sfTies = [];
    for(let half=0; half<2; half++){
      const a = qf.find(t=>t.half===half && t.slot===0).winner;
      const b = qf.find(t=>t.half===half && t.slot===1).winner;
      sfTies.push(makeTie(a,b,half,0));
    }
    s.knockout.sula_sf = { ties: sfTies, legIndex:0 };
    s.phase = "sula_sf";
    ST.newsLog.unshift({title:"Fim das quartas da Sul-Americana", text:"Semifinalistas definidos."});
  } else if(s.phase==="sula_sf"){
    const sf = s.knockout.sula_sf.ties;
    const home = sf.find(t=>t.half===0).winner;
    const away = sf.find(t=>t.half===1).winner;
    s.knockout.sula_final = { home, away, played:false, hs:null, as:null };
    s.phase = "sula_final";
    ST.newsLog.unshift({title:"Final da Sul-Americana definida!", text:`${home} e ${away} disputarão o título da Sul-Americana ${s.year}.`});
  }
}
function advanceSulaFinalStep(){
  const s = ST.sulamericana;
  const f = s.knockout.sula_final;
  startRatingRound();
  if(f.home===ST.teamId || f.away===ST.teamId){
    goToMatchDay(f, {type:"sula", phase:"sula_final"});
    return true;
  }
  const res = simFast(f.home, f.away, "sula");
  let hs=res.homeScore, as=res.awayScore;
  if(hs===as){ const rng=E.makeRNG(nextSeed()); if(rng()<0.5) hs++; else as++; }
  f.hs=hs; f.as=as; f.played=true;
  s.champion = hs>as ? f.home : f.away;
  s.phase = "sula_done";
  closeRatingRound("sula", "Sul-Americana");
  if(s.champion===ST.teamId) paySulaStagePrize("sula_final");
  ST.newsLog.unshift({title:"Campeão da Sul-Americana!", text:`${s.champion} conquista a Sul-Americana ${s.year}.`});
  return false;
}
// called from advanceBrasileiraoStep() every round — same pacing idea as tickCopaDoBrasil(),
// just a tighter 2-round spacing (13 legs/matchdays total vs. the Copa's 8, over the same
// 38-round season) and with a group-stage phase to page through before the knockout starts.
function tickSulamericana(){
  const s = ST.sulamericana;
  if(!s || s.phase==="sula_done") return false;
  const leagueOver = brasaLeagueOver();
  if(!leagueOver && s.roundsUntilNextLeg>0){ s.roundsUntilNextLeg--; return false; }
  s.roundsUntilNextLeg = leagueOver ? 0 : 2; // see brasaLeagueOver() — post-season, nothing left to count this back down
  if(s.phase==="sula_groups") return advanceSulaGroupRound();
  if(s.phase==="sula_final") return advanceSulaFinalStep();
  return advanceSulaLeg();
}
// mirrors copaPendingUserMatch() — if the very next AVANÇAR DIA is the one where
// tickSulamericana() actually fires and it involves the user's own team, preview THAT instead
// of the Brasileirão fixture, so the calendar/crests shown during the countdown never lie about
// what match is actually coming up.
function sulaPendingUserMatch(){
  const s = ST.sulamericana;
  if(!s || s.userEliminated || s.phase==="sula_done" || (s.roundsUntilNextLeg>0 && !brasaLeagueOver())) return null;
  if(cupMatchesBlockedByInterleaving()) return null; // same interleaving rule as copaPendingUserMatch()
  if(s.phase==="sula_groups"){
    const g = sulaUserGroup();
    const round = s.groupFixtures[g][s.currentRound];
    if(!round) return null;
    const m = round.find(x=>x.home===ST.teamId||x.away===ST.teamId);
    if(!m || m.played) return null;
    return {home:m.home, away:m.away, label:`Sul-Americana ${s.year} · Fase de Grupos · Rodada ${s.currentRound+1}/6`, compType:"sulamericana"};
  }
  if(s.phase==="sula_final"){
    const f = s.knockout.sula_final;
    if(f.played || (f.home!==ST.teamId && f.away!==ST.teamId)) return null;
    return {home:f.home, away:f.away, label:`Sul-Americana ${s.year} · Final · Jogo único`, compType:"sulamericana"};
  }
  const round = s.knockout[s.phase];
  const tie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
  if(!tie) return null;
  const leg = tie.legs[round.legIndex];
  if(leg.played) return null;
  return {home:leg.home, away:leg.away, label:`${stageLabelFor(s.phase)} · Jogo de ${round.legIndex===0?'ida':'volta'}`, compType:"sulamericana"};
}

// ============================================================
// CONMEBOL LIBERTADORES (MODO COMPLETO) — the real, full Libertadores (DATA.groups' actual
// 2026 draw: 32 clubs, 6 of them Brazilian), running alongside the Brasileirão career exactly
// like the Sul-Americana campaign above — same group-stage-then-knockout shape, same tick
// pacing, same "only exists for a season the user's own club is actually in" scoping. This is
// entirely separate from the classic standalone Libertadores mode's ST.competition (which still
// works exactly as it always did, under ST.mode==="libertadores") — no shared state between the
// two, so nothing here can disturb that mode's own season-end/reputation/budget flow.
// ============================================================
// the 6 Brazilian clubs DATA.groups' fixed 2026 draw hardcodes, in the order libertadoresBrSlotPositions()
// resolves them (A,C,D,E,F,G) — same substitution trick as SULAMERICANA_BR_SLOTS above, and for
// the same reason: no real future-year foreign-club draw exists, so the other 26 clubs stay fixed.
const LIBERTADORES_BR_SLOTS = ["Flamengo","Fluminense","Cruzeiro","Corinthians","Palmeiras","Mirassol"];
function libertadoresBrSlotPositions(){
  return LIBERTADORES_BR_SLOTS.map(name=>{
    for(const g of Object.keys(DATA.groups)){
      const idx = DATA.groups[g].indexOf(name);
      if(idx!==-1) return {group:g, idx};
    }
    return null;
  });
}
function libertadoresGroupsForYear(year){
  if(year<=2026) return DATA.groups;
  const zones = (ST.brasaZonesHistory||{})[year-1];
  if(!zones || !zones.liber || zones.liber.length<6) return DATA.groups; // safety net before any season has completed
  const groups = {};
  Object.keys(DATA.groups).forEach(g=>{ groups[g] = DATA.groups[g].slice(); });
  libertadoresBrSlotPositions().forEach((pos,i)=>{
    if(!pos) return;
    const newClub = zones.liber[i];
    if(!newClub) return;
    groups[pos.group][pos.idx] = newClub;
  });
  return groups;
}
function libUserGroup(){
  const l = ST.libertadoresCompleto;
  return l ? Object.keys(l.groups).find(g=>l.groups[g].includes(ST.teamId)) : null;
}
function startLibertadoresCompletoIfEligible(){
  const groups = libertadoresGroupsForYear(ST.seasonYear);
  const flat = Object.values(groups).flat();
  if(!flat.includes(ST.teamId)){ ST.libertadoresCompleto = null; return; }
  flat.forEach(name=>{
    if(ST.world.teams[name]) return;
    // covers all 32 real Libertadores clubs (DATA.teams) plus any Brasileirão club swapped into
    // a Brazilian slot (already resolves through PRELIB_DATA/SERIE_A_EXTRA_TEAMS/SULAMERICANA_EXTRA_TEAMS)
    const src = sulamericanaTeamSource(name);
    if(!src) return;
    const players = src.players.map(p=>Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0}));
    let maxId=0; players.forEach(p=>{ if(p.id>maxId) maxId=p.id; });
    if(maxId>nextIdCounter) nextIdCounter = maxId;
    ST.world.teams[name] = { name, country: src.country||"", flag: src.flag||"", group:null, source: src.source||"gen", players };
  });
  const groupFixtures = {};
  Object.keys(groups).forEach(g=>{
    const rounds = E.doubleRoundRobin(groups[g]);
    groupFixtures[g] = rounds.map(round=>round.map(m=>({home:m.home, away:m.away, played:false, hs:null, as:null})));
  });
  ST.libertadoresCompleto = {
    year: ST.seasonYear,
    phase: "lib_groups",
    groups, groupFixtures,
    currentRound: 0,
    knockout: { lib_r16:null, lib_qf:null, lib_sf:null, lib_final:null },
    champion: null, userEliminated: false, placementReached: null,
    roundsUntilNextLeg: 2, // paces Libertadores match days out across the Brasileirão calendar, see advanceBrasileiraoStep()
  };
  const g = libUserGroup();
  ST.newsLog.unshift({title:"Libertadores "+ST.seasonYear, text:`O ${ST.teamId} está na fase de grupos da CONMEBOL Libertadores ${ST.seasonYear} — Grupo ${g}.`});
}
function libGroupStandingsFor(groupLetter){
  const table = {};
  ST.libertadoresCompleto.groupFixtures[groupLetter].forEach(round=>round.forEach(m=>{
    if(m.played) E.applyResultToStandings(table, m.home, m.away, m.hs, m.as);
  }));
  return E.sortedStandings(table, ST.libertadoresCompleto.groups[groupLetter]);
}
function libPrizeForStage(stage){
  return {lib_groups:2000000, lib_r16:3500000, lib_qf:6000000, lib_sf:10000000, lib_final:20000000}[stage] || 0;
}
function payLibStagePrize(stage){
  const prize = libPrizeForStage(stage);
  if(!prize) return;
  ST.budget += prize;
  addSeasonPrize("lib", prize);
  ST.newsLog.unshift({title:"Premiação da Libertadores", text:`Classificação rende ${fmtMoney(prize)} aos cofres do ${ST.teamId}.`});
}
function advanceLibGroupRound(){
  const l = ST.libertadoresCompleto;
  startRatingRound();
  let pendingUser = null;
  Object.keys(l.groupFixtures).forEach(g=>{
    const round = l.groupFixtures[g][l.currentRound];
    if(!round) return;
    round.forEach(m=>{
      if(m.played) return;
      if(m.home===ST.teamId || m.away===ST.teamId){ pendingUser = m; }
      else { const res = simFast(m.home, m.away, "lib"); m.hs=res.homeScore; m.as=res.awayScore; m.played=true; }
    });
  });
  if(pendingUser){
    goToMatchDay(pendingUser, {type:"lib", phase:"lib_groups", round:l.currentRound});
    return true;
  }
  finishLibGroupRound();
  return false;
}
function finishLibGroupRound(){
  const l = ST.libertadoresCompleto;
  closeRatingRound("lib", "Libertadores");
  l.currentRound++;
  if(l.currentRound<6) return;
  const winners=[], runnersUp=[];
  Object.keys(l.groups).forEach(g=>{
    const table = libGroupStandingsFor(g);
    winners.push({team:table[0].team, group:g});
    runnersUp.push({team:table[1].team, group:g});
  });
  const userGroupLetter = libUserGroup();
  const userTable = libGroupStandingsFor(userGroupLetter);
  const userPos = userTable.findIndex(r=>r.team===ST.teamId)+1;
  if(userPos>2){
    l.userEliminated = true;
    l.placementReached = "Fase de Grupos";
    ST.newsLog.unshift({title:"Eliminado na Libertadores", text:`O ${ST.teamId} terminou em ${userPos}º no Grupo ${userGroupLetter} e está fora da Libertadores ${l.year} já na fase de grupos.`});
  } else {
    payLibStagePrize("lib_groups");
  }
  const rng = E.makeRNG(nextSeed());
  const shuffledRunners = shuffled(rng, runnersUp);
  const winnersShuffled = shuffled(rng, winners);
  const usedRunner = new Set();
  const pairs = winnersShuffled.map(w=>{
    let idx = shuffledRunners.findIndex((r,i)=>!usedRunner.has(i) && r.group!==w.group);
    if(idx===-1) idx = shuffledRunners.findIndex((r,i)=>!usedRunner.has(i));
    usedRunner.add(idx);
    return [w, shuffledRunners[idx]];
  });
  const ties = pairs.map((pair,i)=>makeTie(pair[0].team, pair[1].team, i<4?0:1, i%4));
  l.knockout.lib_r16 = { ties, legIndex:0 };
  l.phase = "lib_r16";
  ST.newsLog.unshift({title:"Fase de grupos da Libertadores encerrada", text:"Classificados para as oitavas de final definidos."});
  checkForPostSeasonDeadEnd(); // in case group-stage elimination just now was the last personal match the user could ever get this season
}
function currentLibKORound(){ return ST.libertadoresCompleto.knockout[ST.libertadoresCompleto.phase]; }
function advanceLibLeg(){
  const round = currentLibKORound();
  const legIndex = round.legIndex;
  startRatingRound();
  let pendingUser = null;
  round.ties.forEach(tie=>{
    const leg = tie.legs[legIndex];
    if(leg.played) return;
    if(tie.teamA===ST.teamId || tie.teamB===ST.teamId){ pendingUser = { ref:leg, tie }; }
    else { const res = simFast(leg.home, leg.away, "lib"); leg.hs=res.homeScore; leg.as=res.awayScore; leg.played=true; }
  });
  if(pendingUser){
    goToMatchDay(pendingUser.ref, {type:"lib", phase:ST.libertadoresCompleto.phase, tieId:pendingUser.tie.id, legIndex});
    return true;
  }
  finishLibLeg();
  return false;
}
function finishLibLeg(){
  const round = currentLibKORound();
  closeRatingRound("lib", "Libertadores"); // closes the ida round here, or the volta round below — both paths land at this same top-of-function point
  if(round.legIndex===0){ round.legIndex = 1; return; }
  const rng = E.makeRNG(nextSeed());
  let drawnUserTie = null;
  round.ties.forEach(tie=>{
    const l1=tie.legs[0], l2=tie.legs[1];
    const aggA = l1.as + l2.hs;
    const aggB = l1.hs + l2.as;
    tie.aggA=aggA; tie.aggB=aggB;
    const isUserTie = tie.teamA===ST.teamId || tie.teamB===ST.teamId;
    if(aggA>aggB) tie.winner=tie.teamA;
    else if(aggB>aggA) tie.winner=tie.teamB;
    else if(isUserTie){ tie.wentToPens=true; drawnUserTie=tie; }
    else { tie.wentToPens=true; tie.winner = rng()<0.5?tie.teamA:tie.teamB; }
  });
  if(drawnUserTie){
    startShootout(drawnUserTie.teamA, drawnUserTie.teamB, {type:"libTie", tieId:drawnUserTie.id});
    return;
  }
  const l = ST.libertadoresCompleto;
  const userTie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
  if(userTie){
    if(userTie.winner===ST.teamId) payLibStagePrize(l.phase);
    else if(!l.userEliminated){
      l.userEliminated = true;
      l.placementReached = stageLabelFor(l.phase);
      ST.newsLog.unshift({title:"Eliminado na Libertadores", text:`O ${ST.teamId} caiu na ${stageLabelFor(l.phase)} da Libertadores ${l.year}. O torneio segue sem você.`});
    }
  }
  progressLibBracket();
  checkForPostSeasonDeadEnd(); // in case that elimination just now was the last personal match the user could ever get in any competition this season
}
function progressLibBracket(){
  const l = ST.libertadoresCompleto;
  if(l.phase==="lib_r16"){
    const r16 = l.knockout.lib_r16.ties;
    const qfTies = [];
    for(let half=0; half<2; half++){
      const a = r16.find(t=>t.half===half && t.slot===0).winner;
      const b = r16.find(t=>t.half===half && t.slot===1).winner;
      const c = r16.find(t=>t.half===half && t.slot===2).winner;
      const d = r16.find(t=>t.half===half && t.slot===3).winner;
      qfTies.push(makeTie(a,b,half,0));
      qfTies.push(makeTie(c,d,half,1));
    }
    l.knockout.lib_qf = { ties: qfTies, legIndex:0 };
    l.phase = "lib_qf";
    ST.newsLog.unshift({title:"Fim das oitavas da Libertadores", text:"Classificados para as quartas de final definidos."});
  } else if(l.phase==="lib_qf"){
    const qf = l.knockout.lib_qf.ties;
    const sfTies = [];
    for(let half=0; half<2; half++){
      const a = qf.find(t=>t.half===half && t.slot===0).winner;
      const b = qf.find(t=>t.half===half && t.slot===1).winner;
      sfTies.push(makeTie(a,b,half,0));
    }
    l.knockout.lib_sf = { ties: sfTies, legIndex:0 };
    l.phase = "lib_sf";
    ST.newsLog.unshift({title:"Fim das quartas da Libertadores", text:"Semifinalistas definidos."});
  } else if(l.phase==="lib_sf"){
    const sf = l.knockout.lib_sf.ties;
    const home = sf.find(t=>t.half===0).winner;
    const away = sf.find(t=>t.half===1).winner;
    l.knockout.lib_final = { home, away, played:false, hs:null, as:null };
    l.phase = "lib_final";
    ST.newsLog.unshift({title:"Final da Libertadores definida!", text:`${home} e ${away} disputarão o título da Libertadores ${l.year}.`});
  }
}
function advanceLibFinalStep(){
  const l = ST.libertadoresCompleto;
  const f = l.knockout.lib_final;
  startRatingRound();
  if(f.home===ST.teamId || f.away===ST.teamId){
    goToMatchDay(f, {type:"lib", phase:"lib_final"});
    return true;
  }
  const res = simFast(f.home, f.away, "lib");
  let hs=res.homeScore, as=res.awayScore;
  if(hs===as){ const rng=E.makeRNG(nextSeed()); if(rng()<0.5) hs++; else as++; }
  f.hs=hs; f.as=as; f.played=true;
  l.champion = hs>as ? f.home : f.away;
  l.phase = "lib_done";
  closeRatingRound("lib", "Libertadores");
  if(l.champion===ST.teamId) payLibStagePrize("lib_final");
  ST.newsLog.unshift({title:"Campeão da Libertadores!", text:`${l.champion} conquista a Libertadores ${l.year}.`});
  return false;
}
// called from advanceBrasileiraoStep() every round — same pacing idea as tickSulamericana().
// Never fires the same season as tickSulamericana() for the user's own club: the Libertadores
// and Sul-Americana zones computed by computeNextSeasonZones() are always disjoint, so a given
// club is eligible for at most one of ST.libertadoresCompleto / ST.sulamericana in any season.
function tickLibertadoresCompleto(){
  const l = ST.libertadoresCompleto;
  if(!l || l.phase==="lib_done") return false;
  const leagueOver = brasaLeagueOver();
  if(!leagueOver && l.roundsUntilNextLeg>0){ l.roundsUntilNextLeg--; return false; }
  l.roundsUntilNextLeg = leagueOver ? 0 : 2; // see brasaLeagueOver() — post-season, nothing left to count this back down
  if(l.phase==="lib_groups") return advanceLibGroupRound();
  if(l.phase==="lib_final") return advanceLibFinalStep();
  return advanceLibLeg();
}
// mirrors sulaPendingUserMatch() — previews the Libertadores fixture instead of the Brasileirão
// one whenever it's the match actually coming up next on the calendar.
function libPendingUserMatch(){
  const l = ST.libertadoresCompleto;
  if(!l || l.userEliminated || l.phase==="lib_done" || (l.roundsUntilNextLeg>0 && !brasaLeagueOver())) return null;
  if(cupMatchesBlockedByInterleaving()) return null; // same interleaving rule as copaPendingUserMatch()
  if(l.phase==="lib_groups"){
    const g = libUserGroup();
    const round = l.groupFixtures[g][l.currentRound];
    if(!round) return null;
    const m = round.find(x=>x.home===ST.teamId||x.away===ST.teamId);
    if(!m || m.played) return null;
    return {home:m.home, away:m.away, label:`Libertadores ${l.year} · Fase de Grupos · Rodada ${l.currentRound+1}/6`, compType:"libertadores"};
  }
  if(l.phase==="lib_final"){
    const f = l.knockout.lib_final;
    if(f.played || (f.home!==ST.teamId && f.away!==ST.teamId)) return null;
    return {home:f.home, away:f.away, label:`Libertadores ${l.year} · Final · Jogo único`, compType:"libertadores"};
  }
  const round = l.knockout[l.phase];
  const tie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
  if(!tie) return null;
  const leg = tie.legs[round.legIndex];
  if(leg.played) return null;
  return {home:leg.home, away:leg.away, label:`${stageLabelFor(l.phase)} · Jogo de ${round.legIndex===0?'ida':'volta'}`, compType:"libertadores"};
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

// starters who can't play today (injured / suspended) — the lineup itself is NOT touched by this
function unavailableStarterSlots(){
  const out = [];
  lineupPlayers().forEach((p,i)=>{ if(p && (p.injured||p.suspended)) out.push(i); });
  return out;
}
// the XI that actually takes the pitch: the saved lineup, or this match's own substitutions (ST.matchLineupOverride)
function matchLineupPlayers(){
  const base = (ST.matchLineupOverride && ST.matchLineupOverride.length===ST.lineup.length) ? ST.matchLineupOverride : ST.lineup;
  return base.map(id => id ? playerById(ST.teamId, id) : null);
}
// best available replacement for each unavailable slot, for THIS match only
function buildAutoSubstitutes(){
  const slots = slotsForFormation();
  const ids = ST.lineup.slice();
  const used = new Set(ids.filter(Boolean));
  unavailableStarterSlots().forEach(i=>{
    const slot = slots[i];
    const pool = myTeam().players.filter(p=>!p.injured && !p.suspended && !used.has(p.id));
    const compat = pool.filter(p=>slotCompatible(p, slot));
    const pick = (compat.length ? compat : pool.filter(p=>(slot==="GK")===(p.pos==="GK"))).sort((a,b)=>((b.pos===slot)-(a.pos===slot)) || (b.ovr-a.ovr))[0];
    if(pick){ ids[i] = pick.id; used.add(pick.id); }
  });
  return ids;
}
function goToMatchDay(matchRef, context){
  ST.matchLineupOverride = null;
  if(ST.lineup.length===0 || lineupPlayers().some(p=>!p)) autoFillLineup(); // only an EMPTY slot rebuilds the XI
  ST.pendingMatch = { ref:matchRef, context, result:null };
  ST.stage = "match";
  ST.matchPlaying = false;
  ST.matchAnimIdx = 0;
  // injured/suspended starters: ask what to do instead of silently reshuffling the whole team
  if(unavailableStarterSlots().length) ST.uiModal = {type:"injuredStarters"};
}

function simulatePendingMatch(){
  const pm = ST.pendingMatch;
  const home = pm.ref.home, away = pm.ref.away;
  const userIsHome = home===ST.teamId;
  const oppName = userIsHome ? away : home;
  if(!ST.matchLineupOverride && unavailableStarterSlots().length) ST.matchLineupOverride = buildAutoSubstitutes();
  const myXI = { lineup: matchLineupPlayers(), slots: slotsForFormation() };
  const oppXI = E.bestAvailableXI(ST.world.teams[oppName], "4-3-3");
  const homeXI = userIsHome ? myXI : oppXI;
  const awayXI = userIsHome ? oppXI : myXI;
  const seed = nextSeed();
  const result = E.simulateDetailedMatch(ST.world.teams[home], ST.world.teams[away], homeXI.lineup, awayXI.lineup, homeXI.slots, {seed}, awayXI.slots);
  pm.result = result;
  pm.seed = seed;
  pm.ref.hs = result.homeScore;
  pm.ref.as = result.awayScore;
  pm.ref.played = true;
  pm.homeLineup = homeXI.lineup.map(p=>p?{name:p.name, pos:p.pos, id:p.id}:null);
  pm.homeSlots = homeXI.slots;
  pm.awayLineup = awayXI.lineup.map(p=>p?{name:p.name, pos:p.pos, id:p.id}:null);
  pm.awaySlots = awayXI.slots;
  applyDetailedResultToWorld(home, away, homeXI.lineup, awayXI.lineup, result, compKeyForContext(pm.context));
  ST.matchPlaying = true;
  ST.matchAnimIdx = 0;
  ST.matchClockMinute = 0; // only actually driven in "slow" mode — see matchTickDelay/matchAnimDone
}

// a stable-but-cosmetic "energia" reading for the penalty-taker picker — deterministic per
// player+match (so it doesn't jump around on re-render) without a full stamina system.
// a stamina reading that actually tracks the match: ~100% near kickoff, draining toward full
// time, and draining FASTER the older the player is (young legs hold up better; past ~30 the
// drop-off steepens) — plus a small per-player personal variance so it's not identical twins.
function pseudoFatigue(player, minute, seed){
  const m = E.clamp(minute||0, 0, 90);
  const age = (player && player.age) || 26;
  const ageFactor = E.clamp(1 + (age-26)*0.035, 0.7, 1.6);
  const baseDrop = 42 * ageFactor;
  const drop = baseDrop * (m/90);
  const h = Math.abs(hashStr((player?player.id:0)+"_"+(seed||0)));
  const variance = (h % 9) - 4;
  return E.clamp(Math.round(100 - drop + variance), 28, 100);
}

// Resolves one "penalty_pending" event in place — turns it into a real goal/miss event with a
// flavor line, updates the live score, and feeds the scorer tally. Pass a playerId to let the
// user's own pick take the kick; pass null/undefined for an auto-picked (weighted) taker, used
// for the opponent's penalties and for fast-forwarding through the match.
function resolvePendingPenaltyEvent(pm, idx, takerPlayerId){
  const ev = pm.result.events[idx];
  if(!ev || ev.type!=="penalty_pending") return null;
  const isHomeSide = ev.side==="home";
  const atkTeamName = isHomeSide ? pm.ref.home : pm.ref.away;
  const defTeamName = isHomeSide ? pm.ref.away : pm.ref.home;
  const atkLineupLite = isHomeSide ? pm.homeLineup : pm.awayLineup;
  const atkSlots = isHomeSide ? pm.homeSlots : pm.awaySlots;
  const defLineupLite = isHomeSide ? pm.awayLineup : pm.homeLineup;
  const defSlots = isHomeSide ? pm.awaySlots : pm.homeSlots;

  const rng = E.makeRNG(nextSeed());
  let shooter = null;
  if(takerPlayerId){
    shooter = playerById(atkTeamName, Number(takerPlayerId));
  }
  if(!shooter){
    const candidates = atkLineupLite
      .map((p,i)=> p && atkSlots[i]!=="GK" ? playerById(atkTeamName, p.id) : null)
      .filter(Boolean);
    if(candidates.length) shooter = E.weightedChoice(rng, candidates, p=>Math.pow(1.03, p.sho||p.ovr));
  }
  const gkIdx = defSlots.indexOf("GK");
  const gkLite = gkIdx>=0 ? defLineupLite[gkIdx] : null;
  const gkPlayer = gkLite ? playerById(defTeamName, gkLite.id) : null;

  const {scored, flavor} = E.resolvePenaltyKick(shooter, gkPlayer, rng);

  ev.type = scored ? "goal" : "miss";
  ev.player = shooter ? shooter.name : "Cobrador";
  ev.penalty = true;
  ev.flavor = flavor;
  ev.assist = null;

  if(scored){
    pm.result.stats[ev.side].goals++;
    if(shooter) addScorerGoal(atkTeamName, shooter.id, compKeyForContext(pm.context));
  }
  pm.result.homeScore = pm.result.stats.home.goals;
  pm.result.awayScore = pm.result.stats.away.goals;
  pm.ref.hs = pm.result.homeScore;
  pm.ref.as = pm.result.awayScore;

  return { scored, flavor, playerName: ev.player };
}
// fast-forward safety net: any penalty still unresolved when the match is skipped/instantly
// finished gets auto-resolved (never left dangling as an uncounted goal).
function resolveAllPendingPenalties(pm){
  if(!pm || !pm.result) return;
  pm.result.events.forEach((ev,idx)=>{
    if(ev.type==="penalty_pending") resolvePendingPenaltyEvent(pm, idx, null);
  });
}

// used by the "Próximo Jogo" card on the Competição tab: resolves the round's other
// fixtures, then immediately simulates the user's own match at the chosen pace —
// "slow" reveals the event ticker live, "fast" jumps straight to the final result.
function runPendingSimulation(speed){
  simulatePendingMatch();
  if(speed==="fast"){
    resolveAllPendingPenalties(ST.pendingMatch);
    ST.matchAnimIdx = ST.pendingMatch.result.events.length;
    // matchAnimDone() checks matchClockMinute (not matchAnimIdx) whenever the persisted
    // ST.matchSpeed is "slow" — without this, "Ir para o Resultado" would still fall through
    // to the minute-by-minute ticker (stuck at minute 0) instead of landing on the result
    // instantly, if the user had "LENTA" selected in CONFIGURAÇÃO DE TEMPO.
    ST.matchClockMinute = 90;
  }
}
function advanceWithSpeed(speed){
  advanceTournament();
  if(ST.stage==="match" && ST.pendingMatch && !ST.pendingMatch.result){
    // injured/suspended starters: the pop-up asks first, the match is simulated once the user has chosen
    if(ST.uiModal && ST.uiModal.type==="injuredStarters"){ ST.pendingSpeed = speed; return; }
    runPendingSimulation(speed);
  }
}
// once the user has decided who replaces the unavailable starters, carry on with the match they asked for
function resumeAfterLineupChoice(){
  const sp = ST.pendingSpeed; ST.pendingSpeed = null;
  if(sp && ST.stage==="match" && ST.pendingMatch && !ST.pendingMatch.result) runPendingSimulation(sp);
}

function finishPendingMatch(){
  const pm = ST.pendingMatch;
  if(!pm) return; // guards against a stray double-invocation finding nothing left to finish
  ST.matchLineupOverride = null; // this match's substitutions were one-off; the saved XI is untouched
  generatePostMatchMail(pm); // injury recap for the user's own squad, if anyone got hurt
  ST.calendarDaysLeft = null; // the next fixture gets its own fresh 3-4 day countdown
  ST.matchesPlayedTotal = (ST.matchesPlayedTotal||0)+1; // gates the scout-report cooldown
  const ctx = pm.context;
  ST.lastUserMatchType = ctx.type; // Modo Completo reads this to make sure a cup match day is always followed by a Brasileirão one — see advanceBrasileiraoStep()
  ST.pendingMatch = null;
  if(String(ctx.type).indexOf("prelib_")===0){
    finishPrelibMatch(ctx.tieId);
    return;
  }
  ST.stage = "hub";
  ST.hubTab = "competicao";
  if(ctx.type==="brasileirao"){
    E.applyResultToStandings(ST.brasileirao.standings, pm.ref.home, pm.ref.away, pm.ref.hs, pm.ref.as);
    finishBrasaRound();
  } else if(ctx.type==="copa"){
    if(ctx.phase==="copa_final"){
      const f = pm.ref;
      if(f.hs===f.as){
        startShootout(f.home, f.away, {type:"copaFinal"});
        return;
      }
      const cb = ST.copaDoBrasil;
      cb.champion = f.hs>f.as ? f.home : f.away;
      cb.phase = "copa_done";
      closeRatingRound("copa", "Copa do Brasil");
      if(cb.champion===ST.teamId) payCopaStagePrize("copa_final");
      checkForPostSeasonDeadEnd(); // the Copa final itself may have been the last thing keeping the season open
      ST.newsLog.unshift({title:"Campeão da Copa do Brasil!", text:`${cb.champion} conquista a Copa do Brasil ${cb.year}.`});
    } else {
      finishCopaLeg();
    }
  } else if(ctx.type==="sula"){
    if(ctx.phase==="sula_groups"){
      finishSulaGroupRound();
    } else if(ctx.phase==="sula_final"){
      const f = pm.ref;
      if(f.hs===f.as){
        startShootout(f.home, f.away, {type:"sulaFinal"});
        return;
      }
      const s = ST.sulamericana;
      s.champion = f.hs>f.as ? f.home : f.away;
      s.phase = "sula_done";
      closeRatingRound("sula", "Sul-Americana");
      if(s.champion===ST.teamId) paySulaStagePrize("sula_final");
      checkForPostSeasonDeadEnd(); // the Sul-Americana final itself may have been the last thing keeping the season open
      ST.newsLog.unshift({title:"Campeão da Sul-Americana!", text:`${s.champion} conquista a Sul-Americana ${s.year}.`});
    } else {
      finishSulaLeg();
    }
  } else if(ctx.type==="lib"){
    if(ctx.phase==="lib_groups"){
      finishLibGroupRound();
    } else if(ctx.phase==="lib_final"){
      const f = pm.ref;
      if(f.hs===f.as){
        startShootout(f.home, f.away, {type:"libFinal"});
        return;
      }
      const l = ST.libertadoresCompleto;
      l.champion = f.hs>f.as ? f.home : f.away;
      l.phase = "lib_done";
      closeRatingRound("lib", "Libertadores");
      if(l.champion===ST.teamId) payLibStagePrize("lib_final");
      checkForPostSeasonDeadEnd(); // the Libertadores final itself may have been the last thing keeping the season open
      ST.newsLog.unshift({title:"Campeão da Libertadores!", text:`${l.champion} conquista a Libertadores ${l.year}.`});
    } else {
      finishLibLeg();
    }
  } else if(ctx.type==="wc"){
    wcAfterUserMatch(pm);
  } else if(ctx.type==="ic_semi"){
    const ic = ST.intercontinental;
    const f = ic.semis.sf1;
    if(f.hs===f.as){ startShootout(f.home, f.away, {type:"icSemi"}); return; }
    f.winner = f.hs>f.as ? f.home : f.away;
    closeRatingRound("ic", "Mundial de Clubes");
    if(f.winner===ST.teamId) payIntercontinentalPrize("ic_semi");
    ST.newsLog.unshift(f.winner===ST.teamId
      ? {title:"Classificado para a final do Mundial de Clubes!", text:`O ${ST.teamId} vence e vai à final do Mundial de Clubes ${ic.year}.`}
      : {title:"Eliminado no Mundial de Clubes", text:`O ${ST.teamId} cai na semifinal do Mundial de Clubes ${ic.year} diante do ${f.home}.`});
    progressIntercontinentalBracket();
    advanceIntercontinentalStep();
  } else if(ctx.type==="ic_final"){
    const ic = ST.intercontinental;
    const f = ic.final;
    if(f.hs===f.as){ startShootout(f.home, f.away, {type:"icFinal"}); return; }
    f.winner = f.hs>f.as ? f.home : f.away;
    closeRatingRound("ic", "Mundial de Clubes");
    finishIntercontinental(f.winner);
  } else if(ctx.type==="group"){
    finishGroupRound();
  } else if(ctx.type==="final"){
    const f = ST.competition.knockout.final;
    if(f.hs===f.as){
      // a level final goes to penalties too — previously this silently defaulted to the away
      // team, which was a real bug as well as skipping the whole shootout experience.
      startShootout(f.home, f.away, {type:"final"});
      return;
    }
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
  // the manager never loses a cent of what's already in the bank moving into a new season —
  // this only ever ADDS the season's earnings on top, whatever ST.budget already is.
  ST.budget = Math.round((ST.budget+baseByTier+bonus)/10000)*10000;

  ST.history.push({year:ST.seasonYear, team:ST.teamId, result:placement, reputation:ST.reputation});
  ST.newsLog.unshift({title:`Temporada ${ST.seasonYear} encerrada`, text:`${ST.teamId} terminou a Libertadores em: ${placement}. Reputação: ${repChange>=0?"+":""}${repChange}.`});

  // Rei da América: the tournament's outright top scorer — only worth celebrating on the
  // championship screen when that player happens to be one of ours.
  const scorersList = statRows(comp, "scorers", "goals", 400);
  const topScorer = scorersList.length ? scorersList[0] : null;
  const reiDaAmerica = (placement==="Campeão" && topScorer && topScorer.team===ST.teamId) ? topScorer : null;
  if(reiDaAmerica){
    ST.newsLog.unshift({title:"Rei da América", text:`${reiDaAmerica.name} termina a Libertadores como artilheiro da competição com ${reiDaAmerica.goals} gols e leva o Rei da América para o ${ST.teamId}.`});
  }

  applyDynamicPotentialGrowth(placement==="Campeão");
  ageWorld();

  ST.fired = ST.reputation<=15;
  ST.underdogOffer = (placement==="Campeão" && tier<=2) || ST.reputation>=88;
  ST.jobOffers = null;
  if(ST.fired || ST.underdogOffer){
    ST.jobOffers = buildJobOffers(ST.fired ? "weaker" : "stronger");
    // job interest also lands in the inbox as a record of who reached out — the actual
    // decision still happens on the dedicated "job_offers" screen right after this summary.
    const clubLines = ST.jobOffers.map(name=>`<b>${esc(name)}</b> (${esc(ST.world.teams[name].country)})`).join(", ");
    addMail({
      type:"job",
      subject: ST.fired ? "Propostas após sua saída" : "Clubes de olho no seu trabalho",
      from:"Agente / Mercado da bola",
      preview: ST.fired ? "Você recebeu propostas para o próximo desafio." : "Clubes maiores estão de olho em você.",
      body: (ST.fired
        ? `Depois da saída do ${esc(ST.teamId)}, alguns clubes já entraram em contato: ${clubLines}.`
        : `Sua reputação chamou atenção fora do ${esc(ST.teamId)}: ${clubLines}.`)
        + ` Vá até a tela de propostas para decidir — aceitar um contrato ou permanecer.`,
    });
  }

  ST.lastSeasonSummary = { placement, repChange, tier, newBudget:ST.budget, year:ST.seasonYear, reiDaAmerica, development: ST.lastDevelopmentReport };

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

// every AI-controlled player under 27 gets a small extra nudge on top of the normal aging curve —
// a stand-in for their OWN club's training staff, so a squad the user never touches still develops
// at a pace comparable to the user's team (which instead gets that boost through active "Simular
// Treino" clicks). Without this, only the user's players would ever meaningfully close in on their
// potential, and every AI team would slowly fall behind purely from being left on manual.
function passiveDevelopmentBump(p, rng){
  if(p.age>26 || p.ovr>=p.pot) return;
  const room = p.pot - p.ovr;
  if(room<=0) return;
  const bump = Math.round(rng()*3); // 0-3, ~1.5 average — a season's worth of unattended coaching
  if(bump>0) p.ovr = E.clamp(p.ovr+bump, p.ovr, p.pot);
}
// ============================================================
// POTENCIAL DINÂMICO — a player who's genuinely outperforming their ceiling (a real average
// match rating this season, not a guess) can have their POTENTIAL itself revised upward, same
// as a real breakout prospect forcing scouts to raise their grade — winning a trophy that same
// season makes it even more likely, on the idea that title-winning form tends to come with real
// growth, not just a lucky run. Only checked for the user's own squad: it's the only side of the
// game with match-by-match ratings actually tracked (ST.clubCareer, via ensureClubSeason()) —
// AI squads only ever age through the ordinary curve above.
// ============================================================
function applyDynamicPotentialGrowth(wonTrophyThisSeason){
  const season = ensureClubSeason(); // this season's ratingSum/ratingCount per player, already fully populated by now
  const rng = E.makeRNG(nextSeed());
  const risers = [];
  myTeam().players.forEach(p=>{
    const rec = season.players[String(p.id)];
    if(!rec || rec.ratingCount<10) return; // needs a real sample of minutes this season, not a cameo
    const avgRating = rec.ratingSum/rec.ratingCount;
    if(avgRating<7.2 && !wonTrophyThisSeason) return; // has to actually be playing above expectations, or the club has to be winning silverware
    let chance = 0;
    if(avgRating>=7.6) chance += 0.35;
    else if(avgRating>=7.2) chance += 0.18;
    if(wonTrophyThisSeason) chance += 0.20;
    if(p.age<=24) chance *= 1.3; // a breakout reads as more plausible while still this young
    if(rng()>=chance) return;
    const bump = rng()<0.3 ? 2 : 1;
    p.pot = Math.min(94, p.pot + bump);
    risers.push(p.name);
  });
  if(risers.length){
    ST.newsLog.unshift({title:"Potencial em alta!", text:`${risers.join(", ")} ${risers.length>1?"surpreenderam":"surpreendeu"} pelo rendimento${wonTrophyThisSeason?" numa temporada de título":""} e ${risers.length>1?"tiveram":"teve"} o potencial revisado para cima pelo departamento de scouts.`});
  }
}
function ageWorld(){
  const rng = E.makeRNG(nextSeed());
  // only the user's own squad is worth reporting on the season-end screen — the manager cares
  // about who broke out and who hung up the boots at THEIR club, not the other 19 combined.
  const developmentReport = { leveledUp: [], retired: [] };
  Object.values(ST.world.teams).forEach(team=>{
    const isUserTeam = team.name===ST.teamId;
    const newPlayers = [];
    team.players.forEach(p=>{
      const retireChance = p.age>=35 ? (p.age-34)*0.16 : 0;
      if(p.age>=40 || rng()<retireChance){
        // retire -> replace with a youth prospect
        const tierOvr = Math.round(teamAvgOvr(team));
        const pos = p.pos;
        if(isUserTeam) developmentReport.retired.push({name:p.name, pos:p.pos, age:p.age, ovr:p.ovr});
        newPlayers.push(genYouthPlayer(p.nat, pos, tierOvr, rng, nextId));
        return;
      }
      const preOvr = p.ovr;
      E.ageOnePlayer(p, rng);
      if(!isUserTeam) passiveDevelopmentBump(p, rng);
      if(isUserTeam && p.ovr>preOvr) developmentReport.leveledUp.push({name:p.name, pos:p.pos, age:p.age, from:preOvr, to:p.ovr});
      p.injured=false; p.suspended=false; p.injuredMatches=0; p.suspendedMatches=0; p.form=0;
      newPlayers.push(p);
    });
    team.players = newPlayers;
  });
  ST.lastDevelopmentReport = developmentReport; // consumed by the season-end screen's animated reveal
  // players outside the Libertadores (the global market pool — foreign clubs like Barcelona,
  // Real Madrid etc.) never play a competition of their own in this game, but they still need
  // to develop under the EXACT same rules as everyone else. Without this, a real wonderkid
  // sitting in that pool stays frozen at his starting OVR forever while our own prospects
  // (correctly) grow toward their potential every season — so a lesser talent we develop
  // ends up passing a far bigger one who simply never ages in-game.
  if(ST.world.globalMarket && ST.world.globalMarket.length){
    const survivors = [];
    ST.world.globalMarket.forEach(p=>{
      const retireChance = p.age>=35 ? (p.age-34)*0.16 : 0;
      if(p.age>=40 || rng()<retireChance) return; // retires out of the market, same as everyone else
      E.ageOnePlayer(p, rng);
      passiveDevelopmentBump(p, rng);
      survivors.push(p);
    });
    ST.world.globalMarket = survivors;
  }
  // now that every squad has aged/retired/developed for the new season, let every club the user
  // ISN'T managing go into the transfer market and actually reinforce itself — otherwise an AI
  // team's only way to change is losing players to retirement, while the user actively buys and
  // trains their way further and further ahead every year.
  runAITransferWindow(rng);
  runSquadRenewal(rng);
  runGlobalClubReshuffle(rng);
  for(let i=0;i<22;i++) runFreeAgentSigning(rng); // summer wave: a good share of the free agents find a club
  // a proper "summer window" wave of Libertadores prospects leaving for Europe, on top of
  // whatever already trickled in day by day during the season via dailyTransferTick().
  const jewelSales = 3 + Math.floor(rng()*3); // 3-5 per season
  for(let i=0;i<jewelSales;i++) runEuropeanPoaching(rng);
}

// ============================================================
// AI TRANSFER ENGINE — every club the user isn't managing gets a realistic recruitment cycle
// once a season, right after ageWorld()'s aging/retirement pass. Bigger/stronger (higher-tier)
// clubs sign more often, chase better players, and can reach higher up the price ladder; small
// clubs make cheaper, younger, closer-to-home signings — same idea as real transfer windows.
// Every executed move (plus the user's own purchases, wired in separately) lands in
// ST.transferFeed for the "FABRIZIO ROMANO" widget on the Competição tab.
// ============================================================
// which neighboring/CONMEBOL nationalities a club from each country realistically scouts first —
// South American recruitment leans heavily regional before it goes further afield.
const SA_NEIGHBORS = {
  "Brasil": ["Brasil","Argentina","Uruguai","Paraguai","Bolivia"],
  "Argentina": ["Argentina","Brasil","Uruguai","Paraguai","Chile","Bolivia"],
  "Uruguai": ["Uruguai","Argentina","Brasil","Paraguai"],
  "Paraguai": ["Paraguai","Argentina","Brasil","Bolivia","Uruguai"],
  "Chile": ["Chile","Argentina","Peru","Bolivia"],
  "Bolivia": ["Bolivia","Argentina","Brasil","Paraguai","Peru","Chile"],
  "Colombia": ["Colombia","Venezuela","Equador","Peru"],
  "Equador": ["Equador","Colombia","Peru","Chile"],
  "Peru": ["Peru","Chile","Bolivia","Colombia","Equador"],
  "Venezuela": ["Venezuela","Colombia","Brasil"],
};
// minimum OVR a club of this tier is comfortable fielding at a given slot before it's a "need"
function positionNeedThreshold(tier){ return {1:56,2:62,3:68,4:74,5:80}[tier] || 60; }
// the highest OVR a club of this tier will realistically stretch to sign — keeps a tier-1 side
// from suddenly landing an 85-rated player just because one happened to be available
function aiSignerBudgetCeiling(tier){ return {1:60,2:68,3:76,4:84,5:92}[tier] || 70; }
// kept out of AI reach entirely — global superstars sitting in "Free Agents"/"Bayern de Munique"
// aren't realistic CONMEBOL signings regardless of what a tier-5 club could otherwise stretch to.
const AI_EXCLUDED_CLUBS = new Set(["Free Agents","Bayern de Munique"]);
// the old placeholder club names kept in GLOBAL_TEAM_CRESTS purely for legacy-save crest lookups —
// never valid as a "real" destination when simulating global-club transfer activity.
const LEGACY_PLACEHOLDER_CLUBS = new Set([
  "Miami BP","Madrid Rosas RB","Napoli A","Galatasaray SK","Fenerbahçe SK","Piemonte BN","Firenze V",
  "Sunderland RWB","Los Angeles BY","Roma GR","Vasco Gipuzkoa AB","Sevilla Triana VB","Nottingham RW",
  "Atlanta RB","Pamplona RA","Bologna RB","Bournemouth RB","Beşiktaş JK","Besiktas",
]);
SERIE_B_2026.concat(SERIE_C_POOL).forEach(n=>LEGACY_PLACEHOLDER_CLUBS.add(n)); // Série B/C clubs are real teams of the world now, never "global market" destinations
const AI_SIGNING_POS = ["GK","CB","LB","RB","DMF","CM","AM","LW","RW","ST"];
function shuffled(rng, arr){
  const out = arr.slice();
  for(let i=out.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [out[i],out[j]]=[out[j],out[i]]; }
  return out;
}
function pickWeighted(rng, arr, scoreFn){
  if(!arr.length) return null;
  const scored = arr.map(x=>({x, s: Math.max(0.01, scoreFn(x))}));
  const total = scored.reduce((a,b)=>a+b.s,0);
  let r = rng()*total;
  for(const it of scored){ r -= it.s; if(r<=0) return it.x; }
  return scored[scored.length-1].x;
}
function eligibleGlobalCandidates(world, pos, tier){
  const ceiling = aiSignerBudgetCeiling(tier);
  const floor = positionNeedThreshold(tier) - 8;
  return world.globalMarket.filter(p=>
    !AI_EXCLUDED_CLUBS.has(p.club) && p.ovr<=ceiling && p.ovr>=floor &&
    (p.pos===pos || (p.altPos && p.altPos.includes(pos)))
  );
}
function recordTransferFeed(entry){
  if(!Array.isArray(ST.transferFeed)) ST.transferFeed = [];
  ST.transferFeed.push(Object.assign({}, entry, {year: ST.seasonYear, day: ST.dayCounter||0}));
  if(ST.transferFeed.length>300) ST.transferFeed = ST.transferFeed.slice(-300);
}
// "hoje" / "ontem" / "há N dias" — reads a transfer's stamped day (recordTransferFeed()) against
// the current one, same idea as a real social feed's relative timestamps. A signing from a
// previous save (no day stamp yet, or from before this counter existed) just falls back to 0,
// so it reads as "há muito tempo" rather than crashing.
function romanoDayLabel(entryDay){
  const diff = Math.max(0, (ST.dayCounter||0) - (entryDay||0));
  if(diff===0) return "Hoje";
  if(diff===1) return "Ontem";
  if(diff<7) return `há ${diff} dias`;
  if(diff<60) return `há ${Math.floor(diff/7)} sem.`;
  return "há muito tempo";
}
// the core CONMEBOL recruitment pass: each AI club checks its starting XI slot by slot, and where
// its best option falls under what a club of its tier should field, tries to fix it — first by
// shopping the global market pool (weighted toward nationality fit and a realistic price band),
// then, failing that, by poaching a genuine surplus player from a lower-tier AI club (never the
// user). Every signing removes the player from wherever they came from, same as a real transfer.
/* ---------- realistic transfer profiles ----------
   data/transferProfile.json is built from Transfermarkt's own transfer pages (every arrival of the last two
   windows at ~280 clubs: Premier League, LaLiga, Serie A, Bundesliga, Ligue 1, Portugal, Netherlands, Belgium,
   Turkey, Brasileirão, Argentina, Colombia, Chile, Uruguay, Ecuador). Clubs are bucketed by what they actually
   spend; each bucket carries the age mix, the fee bands, the fee/market-value premium and the origin->destination
   flows of its signings, so who buys whom follows real behaviour (elite clubs pay big fees for young high-potential
   players; a veteran or a 1M player never lands at a top club). */
const TP = TP_RAW as any;
function tpAgeBucket(a){ return a<=20?0:a<=23?1:a<=26?2:a<=29?3:4; }
function tpFeeBin(f){ const e=TP.feeEdges; for(let i=0;i<e.length;i++){ if(f<e[i]) return i; } return e.length; }
// what Transfermarkt would roughly value this game player at, in euros (fitted on ~6.7k matched players)
function tmValueEstimate(p){
  const c = TP.valueModel, age=p.age, ovr=p.ovr, pot=p.pot||p.ovr;
  const x = c[0]+c[1]*ovr+c[2]*(age<=25?(pot-ovr):0)+c[3]*age+c[4]*age*age+c[5]*Math.max(0,26-age)*(pot-ovr)*0.1+c[6]*(age>=31?age-30:0);
  return Math.exp(x);
}
function clubGroupOf(name, world){
  if(!name || name==="Free Agents") return "OTHER";
  if(world && world.teams && world.teams[name]){
    const tier = tierOf(world, name);
    return tier>=4 ? "SA_TOP" : tier>=3 ? "SA_MID" : "SA_SMALL";
  }
  return TP.clubGroup[name] || "EUR_SMALL";
}
function transitionShare(ab, origGrp, destGrp){
  const row = (TP.T[ab]||{})[origGrp] || (TP.T[ab]||{}).OTHER || {};
  let tot = 0; for(const k in row) tot += row[k];
  return tot>0 ? (row[destGrp]||0)/tot : 0.14;
}
// how likely a club of group `grp` is to sign this player, 0..1-ish (relative weights only)
// South American clubs sign South Americans: in the real data ~98% of everything Flamengo, Palmeiras, Cruzeiro, River,
// Boca & co. bring in is South American, and the expensive ones are usually players already formed at European clubs
// (Samuel Lino from Atlético de Madrid, Danilo from Nottingham Forest). Other nationalities are a rare exception.
const SA_NATS = new Set(["Brasil","Brazil","Argentina","Uruguai","Uruguay","Paraguai","Paraguay","Colombia","Colômbia","Chile","Equador","Ecuador","Peru","Perú","Bolivia","Bolívia","Venezuela"]);
function isSouthAmerican(p){ return SA_NATS.has(p.nat); }
// market players carry English country names, the club rosters Portuguese ones — SA_NEIGHBORS speaks Portuguese
function natPt(n){ return ({Brazil:"Brasil",Uruguay:"Uruguai",Paraguay:"Paraguai",Ecuador:"Equador",Colombia:"Colombia","Colômbia":"Colombia","Bolívia":"Bolivia","Perú":"Peru"} as any)[n] || n; }
function buyerFit(grp, p, origGrp){
  const gp = TP.groups[grp];
  if(!gp) return 0.001;
  const ab = tpAgeBucket(p.age);
  const v = tmValueEstimate(p);
  const bin = tpFeeBin(v * (gp.feeRatio[ab] || 1.1)), fb = gp.feeBins;
  const feeShare = fb[bin]*0.6 + (fb[bin-1]||0)*0.2 + (fb[bin+1]||0)*0.2;
  // rumours: who the club is actually being linked with (market value, age) — same idea, from the rumour mill
  const rb = gp.rumValBins, vbin = tpFeeBin(v);
  const rumShare = rb ? rb[vbin]*0.6 + (rb[vbin-1]||0)*0.2 + (rb[vbin+1]||0)*0.2 : feeShare;
  const ageW = (gp.rumAge ? (gp.ageShare[ab]+gp.rumAge[ab])/2 : gp.ageShare[ab])*0.5 + 0.03;
  const quality = Math.pow((feeShare+rumShare)/2 + 0.008, 1.5);
  let w = ageW * quality * (transitionShare(ab, origGrp, grp)+0.003);
  const sa = TP.saProfile && TP.saProfile[grp];
  if(sa){
    if(!isSouthAmerican(p)) w *= sa.nonSA;
    else if(String(origGrp).indexOf("EUR")===0 && p.age>=23 && p.age<=31) w *= (origGrp==="EUR_SMALL" ? 1+(sa.euroExp-1)*0.4 : sa.euroExp); // already formed at a European club
  }
  return Math.max(0.00001, w);
}
// price paid, in the game's own money scale: the group's real fee/market-value premium for that age
function premiumFee(p, grp, rng){
  const gp = TP.groups[grp];
  const base = p.value || E.calcValue(p.ovr,p.age,p.pot);
  const r = (gp && gp.feeRatio[tpAgeBucket(p.age)]) || 1.1;
  return Math.max(20000, Math.round(base * r * (0.88+rng()*0.3) / 5000) * 5000);
}
// a club's starters (best ~11 by rating) rarely leave, and when they do it is for well above market value
// (a Matheus Cunha at a big club is not a 10M deal — it takes the price of a starter, if he is sold at all)
const KEY_PLAYER_PREMIUM = 1.35;
let _keyCache = {arr:null, len:-1, ids:new Set()};
function keyMarketIds(world){
  const arr = world && world.globalMarket;
  if(!arr) return _keyCache.ids;
  if(_keyCache.arr===arr && _keyCache.len===arr.length) return _keyCache.ids;
  const byClub = {};
  for(let i=0;i<arr.length;i++){ const q=arr[i]; if(!q.club || q.club==="Free Agents") continue; (byClub[q.club]||(byClub[q.club]=[])).push(q); }
  const ids = new Set();
  for(const c in byClub){ byClub[c].sort((a,b)=>b.ovr-a.ovr || a.id-b.id).slice(0,11).forEach(q=>{ if(q.ovr>=72) ids.add(q.id); }); }
  _keyCache = {arr, len:arr.length, ids};
  return ids;
}
function isKeyMarketPlayer(world, p){ return keyMarketIds(world).has(p.id); }
function isKeyTeamPlayer(team, p){ return team.players.filter(q=>q.id!==p.id && (q.ovr>p.ovr || (q.ovr===p.ovr && q.id<p.id))).length < 11; }
// what an AI club pays for a player from the global pool: starters cost the full import price, bench players the group's real premium
function aiGlobalFee(p, grp, rng){
  const ask = globalMarketAskingPrice(p);
  if(ST.world && isKeyMarketPlayer(ST.world, p)) return Math.round(ask*(0.95+rng()*0.2)/5000)*5000;
  return Math.max(ask*0.6, premiumFee(p, grp, rng));
}
// buyers a European/global side can be, with their bucket
const TP_BUYERS = Object.keys(TP.clubGroup);
function pickBuyer(rng, p, origGrp, names, excludeName, minRatio){
  const scored = names.filter(n=>n!==excludeName).map(n=>({n, w: buyerFit(clubGroupOf(n, ST.world), p, origGrp)}));
  if(!scored.length) return null;
  const best = scored.reduce((m,x)=>Math.max(m,x.w),0);
  if(best < (minRatio||0)) return null;
  const total = scored.reduce((a,b)=>a+b.w,0);
  let r = rng()*total;
  for(const it of scored){ r -= it.w; if(r<=0) return it.n; }
  return scored[scored.length-1].n;
}
function runAITransferWindow(rng){
  const world = ST.world;
  if(!world || !world.teams) return;
  const teamNames = shuffled(rng, Object.keys(world.teams).filter(n=>n!==ST.teamId));
  teamNames.forEach(name=>{
    const team = world.teams[name];
    const tier = tierOf(world, name);
    let signingSlots = tier>=4 ? 2+Math.floor(rng()*2) : tier>=2 ? 1+Math.floor(rng()*2) : (rng()<0.55?1:0);
    if(signingSlots<=0) return;
    const need = positionNeedThreshold(tier);
    for(const pos of shuffled(rng, AI_SIGNING_POS)){
      if(signingSlots<=0) break;
      const inSlot = team.players.filter(p=>p.pos===pos || (p.altPos && p.altPos.includes(pos)));
      const best = inSlot.reduce((b,p)=> (!b||p.ovr>b.ovr)?p:b, null);
      if(best && best.ovr>=need) continue; // slot's already good enough for this tier

      let signed = null, fromClub = null, isGlobal = false;
      let globalCands = eligibleGlobalCandidates(world, pos, tier);
      { const saOnly = globalCands.filter(isSouthAmerican); if(saOnly.length && rng()>0.03) globalCands = saOnly; } // CONMEBOL clubs scout South Americans
      { const sap = TP.saProfile && TP.saProfile[clubGroupOf(name, world)]; if(sap){ const afford = globalCands.filter(p=>tmValueEstimate(p) <= sap.maxValue); if(afford.length) globalCands = afford; } } // a South American club never pays a European superstar's price
      if(globalCands.length){
        const grp = clubGroupOf(name, world);
        const maxFit = globalCands.reduce((m,p)=>Math.max(m,buyerFit(grp,p,clubGroupOf(p.club,world))),0.0001);
        const picked = pickWeighted(rng, globalCands, p=>{
          let s = 10;
          if((SA_NEIGHBORS[team.country]||[]).includes(natPt(p.nat))) s += 25; // regional scouting bias
          s += Math.max(0, 20 - Math.abs(p.ovr-need)); // realistic fit over wild overkill
          return s * (0.03 + buyerFit(grp,p,clubGroupOf(p.club,world))/maxFit) * (isKeyMarketPlayer(world,p)?0.12:1); // real signing profile of this kind of club; starters rarely leave
        });
        if(picked){ signed = picked; fromClub = picked.club; isGlobal = true; }
      }
      if(!signed){
        // poach from a weaker AI club, but only where they have real depth (3+) at that slot —
        // never strip a smaller club down to nothing just to fill a bigger one's need. Brazilian
        // clubs get an extra pass at the front of the queue — they trade their own squads far
        // more actively than the rest of the confederation in real life, so they end up as the
        // seller here noticeably more often than a plain random order would give them.
        const brazilFirst = teamNames.filter(n=>world.teams[n].country==="Brasil").concat(teamNames);
        for(const donorName of brazilFirst){
          if(donorName===name || tierOf(world, donorName)>=tier) continue;
          const donor = world.teams[donorName];
          const cands = donor.players.filter(p=>
            (p.pos===pos || (p.altPos && p.altPos.includes(pos))) &&
            p.ovr>=need-6 && p.ovr<=aiSignerBudgetCeiling(tier)
          );
          if(cands.length>=3){
            signed = cands.slice().sort((a,b)=>b.ovr-a.ovr)[0];
            fromClub = donorName;
            break;
          }
        }
      }
      if(!signed) continue;

      const fee = isGlobal ? aiGlobalFee(signed, clubGroupOf(name, world), rng) : askingPrice(signed, world.teams[fromClub]);
      if(isGlobal){
        world.globalMarket = world.globalMarket.filter(p=>p.id!==signed.id);
      } else {
        world.teams[fromClub].players = world.teams[fromClub].players.filter(p=>p.id!==signed.id);
      }
      const joined = Object.assign({}, signed, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0, value:fee});
      delete joined.club; delete joined.league;
      team.players.push(joined);
      recordTransferFeed({name:signed.name, price:fee, fromClub: fromClub || "Free Agents", toClub:name, pos:signed.pos, ovr:signed.ovr});
      signingSlots--;
    }
  });
}
// ------------------------------------------------------------
// SQUAD RENEWAL — the "need threshold" pass above only fires when a slot is below what the tier
// expects, so once everyone clears that bar a club stays frozen for years (only retirements,
// replaced by youth, changed anything). This is the real recruitment turnover: every season each
// AI club upgrades its weakest/oldest starting slots with players who are clearly better (or
// simply younger replacements for 33+ starters), Brazilian clubs most of all, and releases the
// squad's dead weight so rosters don't just keep growing.
// ------------------------------------------------------------
const RENEWAL_SLOTS = [["GK",1],["CB",2],["LB",1],["RB",1],["DMF",1],["CM",2],["AM",1],["LW",1],["RW",1],["ST",2]];
function runSquadRenewal(rng){
  const world = ST.world;
  if(!world || !world.teams) return;
  const names = shuffled(rng, Object.keys(world.teams).filter(n=>n!==ST.teamId && !world.teams[n].isNation));
  names.forEach(name=>{
    const team = world.teams[name];
    const tier = tierOf(world, name);
    const br = team.country==="Brasil";
    const range = br ? {5:[4,6],4:[4,5],3:[3,5],2:[3,4],1:[3,4]}[tier] : {5:[3,4],4:[3,4],3:[2,4],2:[2,3],1:[2,3]}[tier];
    let slots = range[0] + Math.floor(rng()*(range[1]-range[0]+1));
    const asp = positionNeedThreshold(tier) + 3;
    const ceiling = aiSignerBudgetCeiling(tier);
    const plan = RENEWAL_SLOTS.map(([pos,n])=>{
      const here = team.players.filter(p=>p.pos===pos).sort((a,b)=>b.ovr-a.ovr).slice(0,n);
      while(here.length<n) here.push({ovr:45, age:30, pot:45, missing:true});
      const avg = here.reduce((a,p)=>a+p.ovr,0)/n;
      const olds = here.filter(p=>p.age>=33).length;
      return {pos, n, here, weakest: here[n-1], gap: (asp-avg) + olds*3.5 + rng()*5};
    }).sort((a,b)=>b.gap-a.gap);
    for(let k=0; k<plan.length && slots>0; k++){
      const {pos, weakest} = plan[k];
      const minOvr = weakest.missing ? 50 : (weakest.age>=33 ? weakest.ovr-3 : weakest.ovr);
      let signed = null, fromClub = null, isGlobal = false;
      let cands = world.globalMarket.filter(c=>
        !AI_EXCLUDED_CLUBS.has(c.club) && c.ovr<=ceiling && c.ovr>=minOvr &&
        (c.pos===pos || (c.altPos && c.altPos.includes(pos))) && (c.age<=weakest.age+(weakest.age>=33?0:6) || c.ovr>=weakest.ovr+4)
      );
      { const sa = cands.filter(isSouthAmerican); if(sa.length && rng()>0.04) cands = sa; }
      { const sap = TP.saProfile && TP.saProfile[clubGroupOf(name, world)]; if(sap){ const afford = cands.filter(c=>tmValueEstimate(c) <= sap.maxValue); if(afford.length) cands = afford; } }
      if(cands.length){
        const grp = clubGroupOf(name, world);
        const maxFit = cands.reduce((m,c)=>Math.max(m,buyerFit(grp,c,clubGroupOf(c.club,world))),0.0001);
        signed = pickWeighted(rng, cands, c=>{
          let sc = 10;
          if((SA_NEIGHBORS[team.country]||[]).includes(natPt(c.nat))) sc += 25;
          sc += Math.min(25, Math.max(0, c.ovr-weakest.ovr)*3);
          sc += c.age<=26 ? 6 : 0;
          return sc * (0.03 + buyerFit(grp,c,clubGroupOf(c.club,world))/maxFit) * (isKeyMarketPlayer(world,c)?0.12:1);
        });
        if(signed){ fromClub = signed.club; isGlobal = true; }
      }
      if(!signed){
        // domestic move: a club of the same level or lower with real depth at the slot sells one
        const donors = shuffled(rng, Object.keys(world.teams).filter(n=>n!==name && n!==ST.teamId && !world.teams[n].isNation && tierOf(world,n)<=tier && (!br || world.teams[n].country==="Brasil")));
        for(const dn of donors){
          const donor = world.teams[dn];
          const here = donor.players.filter(c=>(c.pos===pos || (c.altPos && c.altPos.includes(pos))) && c.ovr>=minOvr && c.ovr<=ceiling);
          const depth = donor.players.filter(c=>c.pos===pos).length;
          if(here.length && depth>=3){ signed = here.slice().sort((a,b)=>b.ovr-a.ovr)[0]; fromClub = dn; break; }
        }
      }
      if(!signed) continue;
      const fee = isGlobal ? aiGlobalFee(signed, clubGroupOf(name, world), rng) : askingPrice(signed, world.teams[fromClub]);
      if(isGlobal) world.globalMarket = world.globalMarket.filter(c=>c.id!==signed.id);
      else world.teams[fromClub].players = world.teams[fromClub].players.filter(c=>c.id!==signed.id);
      const joined = Object.assign({}, signed, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0, value:fee});
      delete joined.club; delete joined.league;
      team.players.push(joined);
      if(signed.ovr>=68) recordTransferFeed({name:signed.name, price:fee, fromClub: fromClub || "Free Agents", toClub:name, pos:signed.pos, ovr:signed.ovr});
      slots--;
    }
    // squad clean-up: the ones nobody needs (old and low, no potential) leave for free
    const MAX_SQUAD = 31;
    if(team.players.length > MAX_SQUAD){
      const posCount = {}; team.players.forEach(p=>posCount[p.pos]=(posCount[p.pos]||0)+1);
      const worth = p => p.ovr + Math.max(0,(p.pot||p.ovr)-p.ovr)*0.6*(p.age<=23?1:0) - Math.max(0,p.age-30)*1.2;
      const out = team.players.slice().sort((a,b)=>worth(a)-worth(b));
      const minPos = pos => pos==="GK" ? 2 : 3;
      const released = [];
      for(const p of out){
        if(team.players.length - released.length <= MAX_SQUAD-1) break;
        if((posCount[p.pos]||0) <= minPos(p.pos)) continue;
        if(p.ovr >= asp+2) continue;
        released.push(p); posCount[p.pos]--;
      }
      if(released.length){
        const ids = new Set(released.map(p=>p.id));
        team.players = team.players.filter(p=>!ids.has(p.id));
        released.forEach(p=>world.globalMarket.push(Object.assign({}, p, {club:"Free Agents", league:"Free Agent", injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0})));
      }
    }
  });
}
// clubs OUTSIDE the Libertadores don't have real rosters in this game (the "global market" is a
// flat player pool, not per-club squads) — so their "transfer activity" is simulated by
// periodically reassigning a handful of pool players to a different real club under the same
// crest system. Cosmetic, but it's also what feeds the "FABRIZIO ROMANO" widget real news on
// seasons where CONMEBOL activity alone would otherwise be quiet.
function runGlobalClubReshuffle(rng){
  const pool = ST.world.globalMarket;
  if(!pool || !pool.length) return;
  const clubNames = Object.keys(GLOBAL_TEAM_CRESTS).filter(n=>!AI_EXCLUDED_CLUBS.has(n) && !LEGACY_PLACEHOLDER_CLUBS.has(n));
  if(!clubNames.length) return;
  const moves = 10 + Math.floor(rng()*10);
  for(let i=0;i<moves;i++){
    const p = pool[Math.floor(rng()*pool.length)];
    if(!p || !p.club || AI_EXCLUDED_CLUBS.has(p.club)) continue;
    const keyP = isKeyMarketPlayer(ST.world, p);
    if(keyP && rng()>0.25) continue; // starters rarely move
    const dest = pickBuyer(rng, p, clubGroupOf(p.club, ST.world), clubNames, p.club, 0.0);
    if(!dest) continue;
    const fee = Math.max(Math.round(premiumFee(p, clubGroupOf(dest, ST.world), rng) * (keyP ? 1.6 : 1) / 5000) * 5000, keyP ? Math.round((p.value||0)*1.3/5000)*5000 : 0); // a starter never goes below ~1.3x his value
    recordTransferFeed({name:p.name, price:fee, fromClub:p.club, toClub:dest, pos:p.pos, ovr:p.ovr});
    p.club = dest;
    p.value = fee;
  }
}
// which AI Libertadores club sells its next prospect abroad — Brazilian clubs are weighted
// noticeably heavier than the rest of the confederation (real academies feeding Europe's
// market), never the user's own team.
function pickJewelSellerTeam(world, rng){
  const names = Object.keys(world.teams).filter(n=>n!==ST.teamId);
  if(!names.length) return null;
  const weighted = names.map(n=>({n, w: world.teams[n].country==="Brasil" ? 2.5 : 1}));
  const total = weighted.reduce((a,b)=>a+b.w,0);
  let r = rng()*total;
  for(const it of weighted){ r -= it.w; if(r<=0) return it.n; }
  return weighted[weighted.length-1].n;
}
// the best actual "joia" on a squad — young, with either a real OVR already or serious room
// left to grow toward potential. Returns null rather than force a sale when nobody qualifies.
function bestJewelIn(team){
  const cands = team.players.filter(p=>p.age<=23 && (p.ovr>=68 || (p.pot||p.ovr)>=78));
  if(!cands.length) return null;
  let best = null, bestScore = -1;
  cands.forEach(p=>{
    const score = p.ovr + Math.max(0,(p.pot||p.ovr)-p.ovr)*0.5;
    if(score>bestScore){ bestScore=score; best=p; }
  });
  return best;
}
// a European (or other global) club comes in for a Libertadores prospect — the reverse flow
// from runAITransferWindow: talent LEAVING the confederation instead of reinforcing it. Never
// touches the user's own squad.
let _euroPool = null;
function euroBuyerPool(){
  if(_euroPool) return _euroPool;
  const names = new Set(REAL_EURO_CLUBS);
  Object.keys(GLOBAL_TEAM_CRESTS).forEach(n=>{ if(!AI_EXCLUDED_CLUBS.has(n) && !LEGACY_PLACEHOLDER_CLUBS.has(n) && String(TP.clubGroup[n]||"").indexOf("EUR")===0) names.add(n); });
  _euroPool = Array.from(names).filter(n=>!AI_EXCLUDED_CLUBS.has(n));
  return _euroPool;
}
function runEuropeanPoaching(rng){
  const world = ST.world;
  if(!world || !world.teams) return;
  const sellerName = pickJewelSellerTeam(world, rng);
  if(!sellerName) return;
  const seller = world.teams[sellerName];
  const jewel = bestJewelIn(seller);
  if(!jewel) return;
  const keyJewel = isKeyTeamPlayer(seller, jewel);
  if(keyJewel && rng()>0.35) return; // a starter is rarely sold
  // who actually buys a player like this: weighted by the real age / fee / origin profile of each kind of club
  // (a 22-year-old worth ~4M goes to a Portuguese, Dutch, Belgian or mid-table side — not to Liverpool)
  const buyer = pickBuyer(rng, jewel, clubGroupOf(sellerName, world), euroBuyerPool(), null, 0.0015);
  if(!buyer) return; // nobody abroad is interested in this profile right now
  const fee = Math.max(askingPrice(jewel, seller), premiumFee(jewel, clubGroupOf(buyer, world), rng) * (keyJewel ? 1.8 : 1));
  seller.players = seller.players.filter(p=>p.id!==jewel.id);
  if(!Array.isArray(world.globalMarket)) world.globalMarket = [];
  world.globalMarket.push(Object.assign({}, jewel, {club:buyer, league:(TP.clubLeague&&TP.clubLeague[buyer])||"European League"}));
  recordTransferFeed({name:jewel.name, price:fee, fromClub:sellerName, toClub:buyer, pos:jewel.pos, ovr:jewel.ovr});
}
// lighter single-transaction versions of the season-end sweeps above, rolled from
// dailyTransferTick() on every AVANÇAR DIA so FABRIZIO ROMANO has fresh news trickling in
// through the season instead of one big dump at year-end.
function runSingleAISigning(rng){
  const world = ST.world;
  if(!world || !world.teams) return;
  const teamNames = Object.keys(world.teams).filter(n=>n!==ST.teamId);
  if(!teamNames.length) return;
  const name = teamNames[Math.floor(rng()*teamNames.length)];
  const team = world.teams[name];
  const tier = tierOf(world, name);
  const need = positionNeedThreshold(tier);
  const pos = AI_SIGNING_POS[Math.floor(rng()*AI_SIGNING_POS.length)];
  const inSlot = team.players.filter(p=>p.pos===pos || (p.altPos && p.altPos.includes(pos)));
  const best = inSlot.reduce((b,p)=> (!b||p.ovr>b.ovr)?p:b, null);
  if(best && best.ovr>=need) return;
  let globalCands = eligibleGlobalCandidates(world, pos, tier);
  { const saOnly = globalCands.filter(isSouthAmerican); if(saOnly.length && rng()>0.03) globalCands = saOnly; } // CONMEBOL clubs scout South Americans
  { const sap = TP.saProfile && TP.saProfile[clubGroupOf(name, world)]; if(sap){ const afford = globalCands.filter(p=>tmValueEstimate(p) <= sap.maxValue); if(afford.length) globalCands = afford; } } // a South American club never pays a European superstar's price
  if(!globalCands.length) return;
  const grp = clubGroupOf(name, world);
  const maxFit = globalCands.reduce((m,p)=>Math.max(m,buyerFit(grp,p,clubGroupOf(p.club,world))),0.0001);
  const picked = pickWeighted(rng, globalCands, p=>{
    let s = 10;
    if((SA_NEIGHBORS[team.country]||[]).includes(natPt(p.nat))) s += 25;
    s += Math.max(0, 20 - Math.abs(p.ovr-need));
    return s * (0.03 + buyerFit(grp,p,clubGroupOf(p.club,world))/maxFit) * (isKeyMarketPlayer(world,p)?0.12:1);
  });
  if(!picked) return;
  const fromClub = picked.club;
  const fee = aiGlobalFee(picked, grp, rng);
  world.globalMarket = world.globalMarket.filter(p=>p.id!==picked.id);
  const joined = Object.assign({}, picked, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0, value:fee});
  delete joined.club; delete joined.league;
  team.players.push(joined);
  recordTransferFeed({name:picked.name, price:fee, fromClub: fromClub || "Free Agents", toClub:name, pos:picked.pos, ovr:picked.ovr});
}
function runSingleGlobalReshuffle(rng){
  const pool = ST.world.globalMarket;
  if(!pool || !pool.length) return;
  const clubNames = Object.keys(GLOBAL_TEAM_CRESTS).filter(n=>!AI_EXCLUDED_CLUBS.has(n) && !LEGACY_PLACEHOLDER_CLUBS.has(n));
  if(!clubNames.length) return;
  const p = pool[Math.floor(rng()*pool.length)];
  if(!p || !p.club || AI_EXCLUDED_CLUBS.has(p.club)) return;
  const keyP = isKeyMarketPlayer(ST.world, p);
  if(keyP && rng()>0.25) return; // starters rarely move
  const dest = pickBuyer(rng, p, clubGroupOf(p.club, ST.world), clubNames, p.club, 0.0);
  if(!dest) return;
  const fee = Math.max(Math.round(premiumFee(p, clubGroupOf(dest, ST.world), rng) * (keyP ? 1.6 : 1) / 5000) * 5000, keyP ? Math.round((p.value||0)*1.3/5000)*5000 : 0); // a starter never goes below ~1.3x his value
  recordTransferFeed({name:p.name, price:fee, fromClub:p.club, toClub:dest, pos:p.pos, ovr:p.ovr});
  p.club = dest;
  p.value = fee;
}
// rolled once per calendar day — every rest day (Game.advanceDay()) AND every match day
// (Game.advance/advanceSlow/advanceFast) each get their own roll, so news actually trickles in
// day by day (not just once per match, 3-4 real calendar days apart) instead of arriving all at
// once at the season boundary. Most days are quiet, but on the ones that aren't, exactly one of
// these three fires.
function dailyTransferTick(){
  if(!ST.world || !ST.world.teams) return;
  if(wcActive()) return; // mercado parado durante a Copa do Mundo
  // every calendar day gets its own tick of the day counter (see recordTransferFeed()) — this is
  // what lets the FABRIZIO ROMANO feed actually show "hoje"/"ontem"/"há N dias" per deal, instead
  // of every deal in a save just carrying the same season year. Ticks even on a quiet day (no
  // signing), so the counter always reflects real calendar time, not just "days with news".
  ST.dayCounter = (ST.dayCounter||0)+1;
  const rng = E.makeRNG(nextSeed());
  if(rng() < 0.07) runFreeAgentSigning(rng); // the free-agent pool keeps shrinking all career long
  if(rng() > 0.32) return;
  const roll = rng();
  if(roll < 0.45) runSingleAISigning(rng);
  else if(roll < 0.85) runEuropeanPoaching(rng);
  else runSingleGlobalReshuffle(rng);
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

// entry point every season transition funnels through on its way to the hub — real
// Libertadores careers (never Pré-Libertadores) from 2027 onward get the animated group-draw
// screen first, since setupSeasonCompetition() just reseeded fresh groups for this season.
let drawTimer = null;
function maybeEnterGroupDraw(){
  if(!ST.prelib && ST.seasonYear>=2027){
    ST.stage = "group_draw";
    ST.drawRevealed = 0;
    startGroupDrawAnimation();
  } else {
    ST.stage = "hub"; ST.hubTab = "competicao";
  }
}
function startGroupDrawAnimation(){
  if(drawTimer){ clearInterval(drawTimer); drawTimer = null; }
  drawTimer = setInterval(()=>{
    if(ST.stage!=="group_draw"){ clearInterval(drawTimer); drawTimer = null; return; }
    ST.drawRevealed = (ST.drawRevealed||0)+1;
    if(ST.drawRevealed>=32){ clearInterval(drawTimer); drawTimer = null; }
    render();
  }, 550);
}

// clubs that call a manager let go after a drop to Série C: Série B clubs and the weaker Série A ones
function buildBrasaJobOffers(){
  const rng = E.makeRNG(nextSeed());
  const bNames = serieBNames().filter(n=>n!==ST.teamId && ST.world.teams[n]);
  const aWeak = serieANames().filter(n=>n!==ST.teamId && ST.world.teams[n]).sort((a,b)=>teamAvgOvr(ST.world.teams[a])-teamAvgOvr(ST.world.teams[b])).slice(0,4);
  const strongB = bNames.sort((a,b)=>teamAvgOvr(ST.world.teams[b])-teamAvgOvr(ST.world.teams[a])).slice(0,8);
  return shuffled(rng, aWeak.concat(strongB)).slice(0,3);
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
  ST.newsLog.unshift({title:"Nova jornada", text:`${mgrName(ST.managerName)} assume o comando do ${teamName}.`});
  if(ST.mode==="brasileirao"){
    ST.formation = "4-3-3";
    ST.lineup = [];
    autoFillLineup();
    startNewBrasaSeason();
    scheduleSave();
    return;
  }
  setupSeasonCompetition();
  ST.formation = "4-3-3";
  autoFillLineup();
  maybeEnterGroupDraw();
  scheduleSave();
}

function stayAtCurrentJob(){
  ST.fired=false; ST.underdogOffer=false; ST.jobOffers=null;
  setupSeasonCompetition();
  autoFillLineup();
  maybeEnterGroupDraw();
  scheduleSave();
}

function continueFromSeasonEnd(){
  if(ST.mode==="brasileirao"){
    if(ST.fired){ // dropped to a division that doesn't exist for the player: other clubs call
      ST.jobOffers = buildBrasaJobOffers();
      ST.stage = "job_offers"; scheduleSave(); return;
    }
    startNewBrasaSeason(); scheduleSave(); return;
  }
  maybeEnterGroupDraw();
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

// ---------- BUYING: a real negotiation with the selling club's director ----------
// The asking price (askingPrice / globalMarketAskingPrice / prelibMarketAskingPrice, unchanged) is a REFERENCE, not a wall:
// each club gets a tolerance (computeFlex) that depends on its finances, the player's role in the squad, his age, rating,
// contract and the interest around him. The negotiation engine turns every proposal into accept / accept-with-conditions /
// small-moderate-high counter / refuse — and ends the talks only for a real reason (see negotiation.ts). The session
// (mood, rounds, standing counter, thread) persists in ST.negs until the deal closes.
function buyContext(team, playerId){
  ensureGlobalMarket(); ensurePrelibMarket();
  let p, ask, squad, club, key, source;
  if(team==="global"){
    p = ST.world.globalMarket.find(x=>x.id===playerId); if(!p) return null;
    ask = globalMarketAskingPrice(p); club = p.club; source = "global";
    squad = ST.world.globalMarket.filter(q=>q.club===club); key = isKeyMarketPlayer(ST.world, p);
  } else if(!ST.world.teams[team]){
    p = ST.world.prelibMarket.find(x=>x.id===playerId); if(!p) return null;
    ask = prelibMarketAskingPrice(p); club = p.club; source = "prelib";
    squad = ST.world.prelibMarket.filter(q=>q.club===club);
    key = squad.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,11).some(q=>q.id===p.id);
  } else {
    const t = ST.world.teams[team];
    p = t.players.find(x=>x.id===playerId); if(!p) return null;
    ask = askingPrice(p, t); club = team; source = "team"; squad = t.players;
    key = E.bestAvailableXI(t, "4-3-3").lineup.some(x=>x && x.id===p.id);
  }
  const fx = negFlexInputFor(p, squad, club, key);
  const fr = computeFlex(fx);
  return { p, ask, club, source, team, flex: fr.flex, flexParts: fr.parts, limit: ask*(1-fr.flex), posture: clubPosture(club), key };
}
function buyNegSession(team, playerId, ask){
  if(!ST.negs) ST.negs = {};
  const k = team+":"+playerId;
  if(!ST.negs[k]) ST.negs[k] = { neg:newNegState(ask), thread:[], status:"open", endedDay:null };
  return ST.negs[k];
}
const NEG_COOLDOWN_DAYS = 5;
function buyCooldownLeft(sess){
  if(sess.status!=="ended") return 0;
  return Math.max(0, NEG_COOLDOWN_DAYS - ((ST.dayCounter||0) - (sess.endedDay||0)));
}
// moves the player into the manager's squad — the one place a purchase is actually carried out
function finalizeBuy(ctx, price){
  const {p, source, team, club} = ctx;
  if(source==="team"){
    const sellerTeam = ST.world.teams[team];
    sellerTeam.players = sellerTeam.players.filter(x=>x.id!==p.id);
    p.injured=false; p.suspended=false; p.form=0;
    myTeam().players.push(p);
    ST.newsLog.unshift({title:"Transferência concluída", text:`${p.name} contratado do ${team} por ${fmtMoney(price)}.`});
  } else if(source==="global"){
    ST.world.globalMarket = ST.world.globalMarket.filter(x=>x.id!==p.id);
    const joined = Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0});
    delete joined.club; delete joined.league;
    myTeam().players.push(joined);
    ST.newsLog.unshift({title:"Contratação internacional!", text:`${p.name} (${club}) assina com o ${ST.teamId} por ${fmtMoney(price)}.`});
  } else {
    ST.world.prelibMarket = ST.world.prelibMarket.filter(x=>x.id!==p.id);
    const joined = Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0});
    delete joined.club;
    myTeam().players.push(joined);
    ST.newsLog.unshift({title:"Transferência concluída", text:`${p.name} contratado do ${club} por ${fmtMoney(price)}.`});
  }
  ST.budget -= price;
  recordCareerSigning(p.name, price);
  recordTransferFeed({name:p.name, price, fromClub:club, toClub:ST.teamId, pos:p.pos, ovr:p.ovr});
  if(source!=="global" && ST.lineup.length===0) autoFillLineup();
  if(ST.negs) delete ST.negs[team+":"+p.id];
  scheduleSave();
}
// one proposal from the manager. Returns {deal, verdict, reply, mood, ended, ...} — the screen just shows it.
function submitBuyProposal(team, playerId, offer){
  const ctx = buyContext(team, playerId);
  if(!ctx) return {ok:false, deal:false, msg:"Jogador não encontrado."};
  const sess = buyNegSession(team, playerId, ctx.ask);
  if(sess.status==="ended"){
    const left = buyCooldownLeft(sess);
    if(left>0) return {ok:false, deal:false, blocked:true, msg:`A diretoria encerrou as conversas por ${ctx.p.name}. Tente de novo em ${left} dia${left===1?"":"s"}.`};
    sess.neg = newNegState(ctx.ask); sess.status = "open"; sess.thread.push({who:"sys", text:"As conversas foram retomadas."});
  }
  offer = Math.round(Number(offer)||0);
  if(offer<=0) return {ok:false, deal:false, msg:"Informe um valor para a proposta."};
  if(offer>ST.budget) return {ok:false, deal:false, msg:"Orçamento insuficiente."};
  const dec = negDecide({role:"seller", x:offer, target:ctx.ask, limit:ctx.limit, angerMult:ctx.posture.angerMult, acceptMult:ctx.posture.acceptMult}, sess.neg);
  sess.neg = dec.state;
  sess.thread.push({who:"you", text:`Você ofereceu ${fmtMoney(offer)}.`});
  const reply = composeReply(dec, {player:ctx.p.name, club:ctx.club, fmt:fmtNeg, role:"seller", seed:strHash(ctx.p.id+ctx.club)});
  sess.thread.push({who:"club", text:reply, verdict:dec.verdict});
  if(sess.thread.length>14) sess.thread = sess.thread.slice(-14);
  if(dec.verdict==="end"){ sess.status = "ended"; sess.endedDay = ST.dayCounter||0; }
  scheduleSave();
  if(dec.verdict==="accept"){
    if(dec.price>ST.budget) return {ok:false, deal:false, msg:"Orçamento insuficiente."};
    finalizeBuy(ctx, dec.price);
    return {ok:true, deal:true, price:dec.price, verdict:dec.verdict, reply, mood:dec.mood};
  }
  return {ok:false, deal:false, verdict:dec.verdict, reply, mood:dec.mood, moodDelta:dec.moodDelta, counter:dec.counter, ended:dec.ended, msg:reply};
}

// ---- global market (players outside the Libertadores — from clubs that never play the competition) ----
// ---------- free agents ----------
// A free agent costs only the signing fee + his first-year salary — never the market value — but the pool is
// contested: AI clubs keep signing them all career long, and a player won't join a club far below his level.
function isFreeAgent(p){ return p && p.club==="Free Agents"; }
function freeAgentCost(p){
  const v = p.value || E.calcValue(p.ovr, p.age, p.pot);
  const fee = Math.max(25000, Math.round(v*0.10/5000)*5000);
  const wage = Math.max(40000, Math.round(v*(p.age>=31?0.28:p.age<=23?0.18:0.22)/5000)*5000);
  return {fee, wage, total: fee+wage};
}
function freeAgentWillSign(p){
  const tier = tierOf(ST.world, ST.teamId);
  return p.ovr <= aiSignerBudgetCeiling(tier) + 4;
}
// 80+ rated players never start a career unattached: they belong to a club (only 79 and below float around
// and get picked up as the seasons go by)
function placeTopFreeAgents(world){
  if(world._faPlaced) return;
  world._faPlaced = true;
  const rng = E.makeRNG(20260);
  const pool = euroBuyerPool();
  world.globalMarket.forEach(p=>{
    if(isFreeAgent(p) && p.ovr>=80){
      const dest = pickBuyer(rng, p, "OTHER", pool, null, 0) || pool[Math.floor(rng()*pool.length)];
      p.club = dest; p.league = (TP.clubLeague&&TP.clubLeague[dest]) || "European League";
    }
  });
}
function runFreeAgentSigning(rng){
  const world = ST.world;
  if(!world || !world.globalMarket) return;
  const pool = world.globalMarket.filter(isFreeAgent);
  if(!pool.length) return;
  // the better and younger ones go first
  const p = pickWeighted(rng, pool, x=>Math.max(1, x.ovr-62) * (x.age<=31 ? 1.5 : 1));
  if(!p) return;
  const fee = freeAgentCost(p).fee;
  const sa = isSouthAmerican(p);
  const needy = Object.keys(world.teams).filter(n=>{
    if(n===ST.teamId) return false;
    const t = world.teams[n], tier = tierOf(world, n);
    if(p.ovr > aiSignerBudgetCeiling(tier)+2 || p.ovr < positionNeedThreshold(tier)-10) return false;
    const best = t.players.filter(q=>q.pos===p.pos || (q.altPos && q.altPos.includes(p.pos))).reduce((m,q)=>Math.max(m,q.ovr),0);
    return best < p.ovr+4;
  });
  if(needy.length && rng() < (sa ? 0.7 : 0.25)){
    const dest = needy[Math.floor(rng()*needy.length)];
    world.globalMarket = world.globalMarket.filter(x=>x.id!==p.id);
    const joined = Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0});
    delete joined.club; delete joined.league;
    world.teams[dest].players.push(joined);
    recordTransferFeed({name:p.name, price:fee, fromClub:"Free Agents", toClub:dest, pos:p.pos, ovr:p.ovr});
    return;
  }
  const clubNames = Object.keys(GLOBAL_TEAM_CRESTS).filter(n=>!AI_EXCLUDED_CLUBS.has(n) && !LEGACY_PLACEHOLDER_CLUBS.has(n));
  const dest = pickBuyer(rng, p, "OTHER", clubNames, null, 0);
  if(!dest) return;
  p.club = dest; p.league = (TP.clubLeague&&TP.clubLeague[dest]) || "European League";
  recordTransferFeed({name:p.name, price:fee, fromClub:"Free Agents", toClub:dest, pos:p.pos, ovr:p.ovr});
}
// a free agent signed this season can't be flipped for cash: he is sellable (and draws offers) only from the next season on
function sellLocked(p){ return !!p && p.faLockSeason!=null && p.faLockSeason===ST.seasonNum; }
function sellLockMsg(p){ return `${p.name} foi contratado como free agent nesta temporada — só poderá ser vendido a partir da próxima.`; }
function signFreeAgent(playerId){
  ensureGlobalMarket();
  const p = ST.world.globalMarket.find(x=>x.id===playerId);
  if(!p || !isFreeAgent(p)) return {ok:false, msg:"Esse jogador já assinou com outro clube."};
  if(!freeAgentWillSign(p)) return {ok:false, msg:`${p.name} não aceita o projeto do ${ST.teamId} — procura um clube do nível dele.`};
  const c = freeAgentCost(p);
  if(c.total>ST.budget) return {ok:false, msg:"Orçamento insuficiente."};
  ST.world.globalMarket = ST.world.globalMarket.filter(x=>x.id!==playerId);
  const joined = Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0, faLockSeason:ST.seasonNum});
  delete joined.club; delete joined.league;
  myTeam().players.push(joined);
  ST.budget -= c.total;
  ST.newsLog.unshift({title:"Contratação sem custo de transferência!", text:`${p.name} (free agent) assina com o ${ST.teamId}: taxa ${fmtMoney(c.fee)} + salário ${fmtMoney(c.wage)}.`});
  recordCareerSigning(p.name, c.total);
  recordTransferFeed({name:p.name, price:c.fee, fromClub:"Free Agents", toClub:ST.teamId, pos:p.pos, ovr:p.ovr});
  scheduleSave();
  return {ok:true, msg:`${p.name} assinou como free agent.`};
}
function ensureGlobalMarket(){
  if(!ST.world.globalMarket){
    ST.world.globalMarket = GLOBAL_MARKET_SRC.map(p=>Object.assign({}, p));
  }
  placeTopFreeAgents(ST.world);
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
  if(ST && ST.world && isKeyMarketPlayer(ST.world, p)) f *= KEY_PLAYER_PREMIUM; // a starter never leaves at market value
  return Math.round(p.value*f/5000)*5000;
}
// ---- Pré-Libertadores market — these 8 clubs (Sul-Americana side) never get a real squad in
// ST.world.teams (they only exist as opponents inside the standalone Pré-Libertadores mini-cup),
// so without this their entire rosters were invisible everywhere. Surfaced as a flat pool, same
// shape as the global market, but shown inside "Times da Libertadores" since that's where the
// user asked for them — their crests already exist in TEAM_LOGOS under the real club name.
// first wave of the Brasileirão overhaul: the 8 real Série A 2026 clubs that had no squad
// anywhere in the game (see serieA.ts) ride the same flat "extra teams" market pool as the
// Pré-Libertadores clubs — same buy/price/lookup plumbing, just a second source feeding it —
// until the full league/calendar rework gives them (and everyone else) a real fixture list.
const PRELIB_MARKET_TEAM_NAMES = Object.keys(PRELIB_DATA.teams).concat(Object.keys(SERIE_A_EXTRA_TEAMS));
function ensurePrelibMarket(){
  if(!ST.world.prelibMarket){
    const out = [];
    // in a Brasileirão career all 20 Série A clubs already have a REAL, AI-controlled roster
    // in ST.world.teams (see freshBrasaWorld) — skip them here so their players don't also
    // show up as a separate, duplicate-id "buy from the market" listing.
    const skip = ST.mode==="brasileirao" ? new Set(SERIE_A_2026.concat(Object.keys(ST.world.teams))) : new Set(); // clubs that already have a real squad in the world never get a second, duplicate listing
    Object.values(PRELIB_DATA.teams).forEach(t=>{
      if(skip.has(t.name)) return;
      t.players.forEach(p=> out.push(Object.assign({}, p, {club:t.name})));
    });
    Object.values(SERIE_A_EXTRA_TEAMS).forEach(t=>{
      if(skip.has(t.name)) return;
      t.players.forEach(p=> out.push(Object.assign({}, p, {club:t.name})));
    });
    ST.world.prelibMarket = out;
  }
}
function prelibMarketAskingPrice(p){
  let f = 1.1;
  if(p.ovr>=82) f += 0.35;
  else if(p.ovr>=76) f += 0.15;
  if(p.age<=21 && p.pot-p.ovr>=10) f += 0.25;
  return Math.round(p.value*f/5000)*5000;
}
// a sold player doesn't vanish: he joins the buying club's real squad (or, for clubs without a squad of their
// own in this game, the global market under that club's name), keeps playing, ageing and developing, and can
// be bought back later at whatever his price has become.
function moveSoldPlayer(p, clubName){
  const world = ST.world;
  const moved = Object.assign({}, p, {injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0});
  delete moved.faLockSeason;
  const team = world.teams[clubName];
  if(team && !team.isNation && clubName!==ST.teamId){
    delete moved.club; delete moved.league;
    team.players.push(moved);
    return;
  }
  if(!Array.isArray(world.globalMarket)) world.globalMarket = [];
  moved.club = clubName;
  moved.league = (TP.clubLeague && TP.clubLeague[clubName]) || (REAL_ARAB_CLUBS.includes(clubName) ? "Saudi Pro League" : "European League");
  world.globalMarket.push(moved);
}
// who buys a player sold on the spot: a club that actually needs him, mostly from the user's own country so he
// can turn up against the user afterwards
function pickQuickSellBuyer(p){
  const world = ST.world;
  const rng = E.makeRNG(nextSeed());
  const names = Object.keys(world.teams).filter(n=>n!==ST.teamId && !world.teams[n].isNation);
  if(!names.length) return null;
  const mine = myTeam();
  return pickWeighted(rng, names, n=>{
    const t = world.teams[n], tier = tierOf(world, n);
    const best = t.players.filter(q=>q.pos===p.pos || (q.altPos && q.altPos.includes(p.pos))).reduce((m,q)=>Math.max(m,q.ovr),0);
    let w = 1;
    if(t.country===mine.country) w *= 8;
    if(best < p.ovr+2) w *= 3;
    w *= p.ovr <= aiSignerBudgetCeiling(tier)+4 ? 2 : 0.3;
    w *= Math.max(0.25, 1 - Math.abs(teamAvgOvr(t) - (p.ovr-4))/14);   // clubs of his own level
    return w;
  });
}
function openSaleDone(p, club, price){ ST.uiModal = {type:"saleDone", playerName:p.name, pos:p.pos, ovr:p.ovr, club, price}; }
function quickSell(playerId){
  const t = myTeam();
  const p = t.players.find(x=>x.id===playerId);
  if(!p || sellLocked(p)) return;
  const price = Math.round(p.value*0.9/5000)*5000;
  const buyer = pickQuickSellBuyer(p);
  t.players = t.players.filter(x=>x.id!==playerId);
  ST.lineup = ST.lineup.map(id=> id===playerId? null : id);
  ST.budget += price;
  if(buyer){
    moveSoldPlayer(p, buyer);
    openSaleDone(p, buyer, price);
    recordTransferFeed({name:p.name, price, fromClub:ST.teamId, toClub:buyer, pos:p.pos, ovr:p.ovr});
    ST.newsLog.unshift({title:"Jogador vendido", text:`${p.name} foi vendido para o ${buyer} por ${fmtMoney(price)}.`});
  } else {
    ST.newsLog.unshift({title:"Jogador vendido", text:`${p.name} foi vendido por ${fmtMoney(price)}.`});
  }
  scheduleSave();
}

// ============================================================
// SCOUTING
// ============================================================
// cost (in budget) to reach a given level, and days a requested report takes at that level —
// both indexed by level (1-5); every career starts at level 1 and pays gradually more to
// climb toward 5, which also means faster, wider reports.
const SCOUT_LEVEL_COST = [null, 2000000, 5000000, 8000000, 10000000, 15000000];
const SCOUT_REPORT_DAYS = [null, 5, 4, 3, 2, 1];
const SCOUT_LEVEL_LABELS = ["", "Iniciante", "Regional", "Nacional", "Continental", "Global"];
// hard potential ceiling per level — a level-1 network genuinely never turns up anyone above
// 80 potential; the ceiling climbs with the level, and level 5 has none at all.
const SCOUT_LEVEL_POT_CAP = [null, 80, 83, 84, 85, 999];
function generateScoutReport(){
  const level = ST.scoutLevel||1;
  const potCap = SCOUT_LEVEL_POT_CAP[level];
  const rng = E.makeRNG(nextSeed());
  // a bigger network doesn't just work faster — it also casts a wider net, surfacing a few
  // more (and slightly older, still-promising) prospects than a level-1 network ever would.
  const ageMax = Math.min(23+(level-1), 27);
  const candidates = allPlayersList(ST.teamId)
    .filter(({p})=>p.age<=ageMax && p.pot-p.ovr>=4 && p.pot<=potCap);
  const n = Math.min(6+level*2, candidates.length);
  if(n===0){
    ST.scoutReport = [];
    ST.scoutSeason = ST.seasonNum;
    ST.scoutLastReportMatchCount = ST.matchesPlayedTotal||0;
    ST.scoutReportETA = null;
    scheduleSave();
    return;
  }
  // every report guarantees its 2 best finds: the highest-potential prospects this level's
  // network can actually see (right up against the ceiling above). The rest of the slots
  // still come from the usual weighted random sample, favoring higher upside but never
  // deterministic, so the report doesn't just list the same names every time.
  const sortedByPot = candidates.slice().sort((a,b)=>b.p.pot-a.p.pot);
  const guaranteed = sortedByPot.slice(0, Math.min(2, n));
  const guaranteedIds = new Set(guaranteed.map(c=>c.p.id));
  const pool = candidates.filter(c=>!guaranteedIds.has(c.p.id))
    .map(c=>({c, score: Math.max(1, (c.p.pot-c.p.ovr)*2 + c.p.pot)}));
  const picked = guaranteed.slice();
  const remainingSlots = n - picked.length;
  for(let i=0;i<remainingSlots && pool.length;i++){
    const total = pool.reduce((a,it)=>a+it.score, 0);
    let r = rng()*total;
    let idx = pool.length-1;
    for(let j=0;j<pool.length;j++){
      r -= pool[j].score;
      if(r<=0){ idx=j; break; }
    }
    picked.push(pool[idx].c);
    pool.splice(idx,1);
  }
  // shuffle so the 2 guaranteed top prospects aren't always pinned to the first rows
  for(let i=picked.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [picked[i],picked[j]]=[picked[j],picked[i]]; }
  ST.scoutReport = picked.map(c=>({playerId:c.p.id, team:c.team}));
  ST.scoutSeason = ST.seasonNum;
  ST.scoutLastReportMatchCount = ST.matchesPlayedTotal||0;
  ST.scoutReportETA = null;
  scheduleSave();
}
// kicks off a new report request — it isn't delivered instantly: it takes
// SCOUT_REPORT_DAYS[level] days, ticked down by tickScoutReport() on every AVANÇAR DIA.
function requestScoutReport(){
  if(ST.scoutReportETA) return; // already in progress
  const level = ST.scoutLevel||1;
  ST.scoutReportETA = { daysLeft: SCOUT_REPORT_DAYS[level] };
  scheduleSave();
}
function tickScoutReport(){
  if(!ST.scoutReportETA) return;
  ST.scoutReportETA.daysLeft--;
  if(ST.scoutReportETA.daysLeft>0) return;
  generateScoutReport();
  addMail({
    type:"scout", subject:"Relatório de olheiros pronto",
    from:"Departamento de Olheiros",
    preview:"Nova lista de jogadores promissores disponível.",
    body:"Seu relatório de olheiros está pronto — confira a aba Olheiro para ver os nomes.",
  });
}
// leveling up is a paid, deliberate upgrade — it pays off immediately with a fresh report
// built around the new (higher) potential ceiling, no waiting and no cooldown gate.
function upgradeScoutLevel(){
  const level = ST.scoutLevel||1;
  if(level>=5) return;
  const cost = SCOUT_LEVEL_COST[level+1];
  if(ST.budget < cost) return;
  ST.budget -= cost;
  ST.scoutLevel = level+1;
  ST.scoutReportETA = null; // a paid upgrade always wins over a report already in progress
  const hadReport = !!ST.scoutReport;
  generateScoutReport();
  ST.newsLog.unshift({title:"Rede de olheiros ampliada", text:`Sua rede de olheiros subiu para o nível ${ST.scoutLevel} (${SCOUT_LEVEL_LABELS[ST.scoutLevel]}), por ${fmtMoney(cost)}.`});
  addMail({
    type:"scout", subject:`Olheiros nível ${ST.scoutLevel}: novo relatório`,
    from:"Departamento de Olheiros",
    preview:`Rede ampliada para o nível ${ST.scoutLevel} — relatório ${hadReport?"atualizado":"gerado"} na hora.`,
    body:`Com a rede de olheiros no nível ${ST.scoutLevel} (${SCOUT_LEVEL_LABELS[ST.scoutLevel]}), já preparamos um relatório novo — e melhor — pra você. Confira a aba Olheiro.`,
  });
  scheduleSave();
}

// ---- "OBSERVAR" — market players' true potential stays locked until watched ----
// a transfer-market player's Potencial column is hidden (🔒) until the manager spends a
// few days observing him; a bigger scout network (ST.scoutLevel) watches faster.
function marketPlayerLookup(teamKey, id){
  if(teamKey==="global") return (ST.world.globalMarket||[]).find(p=>p.id===id);
  if(!ST.world.teams[teamKey]) return (ST.world.prelibMarket||[]).find(p=>p.id===id);
  return playerById(teamKey, id);
}
function observationKey(teamKey, id){ return teamKey+"#"+id; }
function isObserved(teamKey, id){ return (ST.observedKeys||[]).includes(observationKey(teamKey,id)); }
function queuedObservation(teamKey, id){
  const key = observationKey(teamKey,id);
  return (ST.observationQueue||[]).find(o=>o.key===key);
}
function observePlayer(teamKey, id){
  if(isObserved(teamKey,id) || queuedObservation(teamKey,id)) return;
  const p = marketPlayerLookup(teamKey, id);
  if(!p) return;
  const level = ST.scoutLevel||1;
  const days = Math.max(1, 5-level); // level1=4d, level2=3d, level3=2d, level4/5=1d
  if(!Array.isArray(ST.observationQueue)) ST.observationQueue = [];
  ST.observationQueue.push({ key:observationKey(teamKey,id), playerId:id, team:teamKey, playerName:p.name, daysLeft:days });
  scheduleSave();
}
function tickObservations(){
  if(!Array.isArray(ST.observationQueue) || !ST.observationQueue.length) return;
  const done = [];
  ST.observationQueue.forEach(o=>{
    o.daysLeft--;
    if(o.daysLeft<=0) done.push(o);
  });
  if(!done.length){ scheduleSave(); return; }
  ST.observationQueue = ST.observationQueue.filter(o=>o.daysLeft>0);
  if(!Array.isArray(ST.observedKeys)) ST.observedKeys = [];
  done.forEach(o=> ST.observedKeys.push(o.key));
  const names = done.map(o=>o.playerName).join(", ");
  addMail({
    type:"scout", subject: done.length===1 ? `Observação concluída: ${done[0].playerName}` : "Observações concluídas",
    from:"Departamento de Olheiros",
    preview:`O potencial de ${names} foi revelado.`,
    body:`Seu olheiro terminou de observar ${esc(names)} — o potencial real já aparece no mercado de transferências.`,
  });
  scheduleSave();
}

// ============================================================
// INCOMING TRANSFER OFFERS — real clubs from outside the Libertadores (pulled straight
// from the same global market data the transfer window uses) sometimes bid big money for
// one of your players, mid-season or between seasons.
// ============================================================
const REAL_ARAB_CLUBS = ["Al Hilal SFC","Al Nassr FC","Al Ittihad Club","Al Ahli Saudi FC","Al Ahli SC","Al Sadd SC","Al Duhail SC","Al Gharafa SC","Al Wahda FC","Al Wasl FC"];
const REAL_EURO_CLUBS = ["Real Madrid","FC Barcelona","Manchester United","Manchester City","Liverpool","Chelsea","Arsenal","Tottenham Hotspur","AC Milan","Internazionale Milano","Napoli","S.S. Lazio","Atalanta BC","Paris Saint-Germain","Olympique de Marseille","Olympique Lyonnais","AS Monaco","Ajax","PSV","Feyenoord","FC Porto","SL Benfica","Sporting CP","Borussia Dortmund"];
// how hard-nosed a given offer's club is about negotiating — picked once per offer and
// carried forward through every counter/comeback/reply on that same thread. "estCeilingMult"
// is only the SAFE estimate shown to the manager as a hint — the actual accept/anger math
// (see negotiateOffer/tickPendingOfferReplies) always keeps a small chance of working even
// well above that number, and a real chance of blowing up the deal if pushed too far.
const OFFER_POSTURES = [
  { id:"flexivel", label:"Flexível — parece disposto a pagar bem", angerMult:0.65, acceptMult:1.25, estCeilingMult:2.3 },
  { id:"equilibrado", label:"Equilibrado — negocia dentro do razoável", angerMult:1.0, acceptMult:1.0, estCeilingMult:1.8 },
  { id:"durao", label:"Durão — não gosta de ser pressionado", angerMult:1.45, acceptMult:0.75, estCeilingMult:1.35 },
];
function pickPosture(rng){
  const roll = rng();
  return roll<0.32 ? OFFER_POSTURES[0] : roll<0.72 ? OFFER_POSTURES[1] : OFFER_POSTURES[2];
}
// rolls for a new incoming transfer offer and, if one lands, drops it straight into the
// inbox as a negotiable "offer" mail (see queueOfferMail/negotiateOffer) instead of
// popping a blocking modal — the manager reads and negotiates it on their own time from
// the E-mail tab.
function maybeIncomingOffer(baseChance){
  if(wcActive()) return; // durante a Copa do Mundo o mercado fica parado
  const squad = myTeam().players.filter(p=>p.ovr>=70 && !sellLocked(p));
  if(squad.length===0) return;
  // a squad playing well draws more attention from other clubs — recent match form (already
  // tracked per player, decaying back toward 0 over time) pushes the offer chance up, never down,
  // so a hot streak means noticeably more approaches without ever punishing a rough patch.
  const avgForm = squad.reduce((a,p)=>a+(p.form||0),0) / squad.length;
  const formBoost = E.clamp(Math.max(0, avgForm) * 0.15, 0, 0.35);
  const chance = E.clamp(baseChance + formBoost, 0, 0.6);
  const rng = E.makeRNG(nextSeed());
  if(rng() >= chance) return;
  const target = weightedPickByOvr(squad, rng);
  const roll = rng();
  let category, club, mult;
  if(roll < 0.35){
    category = "arabe";
    club = REAL_ARAB_CLUBS[Math.floor(rng()*REAL_ARAB_CLUBS.length)];
    mult = 2.2 + rng()*1.0; // 2.2x - 3.2x
  } else {
    category = "euro_sa";
    club = REAL_EURO_CLUBS[Math.floor(rng()*REAL_EURO_CLUBS.length)];
    mult = 1.3 + rng()*0.5; // 1.3x - 1.8x
  }
  const offer = Math.round(target.value*mult/5000)*5000;
  queueOfferMail(target.id, target.name, club, category, target.value, offer, rng, pickPosture(rng).id);
}
// real prospects draw outsized interest from abroad — a Brazilian "joia" with real room to
// grow gets chased far harder than a solid-but-finished veteran of the same OVR.
function jewelWeight(p){
  let w = Math.pow(1.06, p.ovr);
  if(p.nat==="Brasil") w *= 2.2;
  if(p.age<=23){
    const room = Math.max(0, (p.pot||p.ovr) - p.ovr);
    w *= 1 + room*0.12;
  }
  return w;
}
function weightedPickByOvr(players, rng){
  const total = players.reduce((a,p)=>a+jewelWeight(p),0);
  let r = rng()*total;
  for(const p of players){
    r -= jewelWeight(p);
    if(r<=0) return p;
  }
  return players[players.length-1];
}
function acceptIncomingOffer(){
  const off = ST.uiModal;
  if(!off || off.type!=="incomingOffer") return;
  const t = myTeam();
  const sold = t.players.find(p=>p.id===off.playerId);
  t.players = t.players.filter(p=>p.id!==off.playerId);
  ST.lineup = ST.lineup.map(id=> id===off.playerId? null : id);
  ST.budget += off.offer;
  ST.newsLog.unshift({title:"Venda milionária!", text:`${off.playerName} foi vendido para o ${off.club} por ${fmtMoney(off.offer)}.`});
  ST.uiModal = null;
  if(sold){ moveSoldPlayer(sold, off.club); openSaleDone(sold, off.club, off.offer); }
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

// ---- flicker-free re-rendering for the screens that redraw on a timer (match minutes/events, shootouts, draws):
// instead of swapping the whole page (which re-creates every image and flashes), the new markup is diffed against
// the current DOM and only what actually changed is touched. Elements with data-k are matched by key (feed rows). ----
function morphNode(o, n){
  if(o.nodeType!==1){ if(o.nodeValue!==n.nodeValue) o.nodeValue = n.nodeValue; return; }
  const names = new Set();
  for(const a of Array.from(n.attributes)){ names.add(a.name); if(o.getAttribute(a.name)!==a.value) o.setAttribute(a.name, a.value); }
  for(const a of Array.from(o.attributes)){ if(!names.has(a.name)) o.removeAttribute(a.name); }
  morphChildren(o, n);
}
function morphChildren(oldP, newP){
  const nk = Array.from(newP.childNodes);
  if(nk.some(c=>c.nodeType===1 && c.hasAttribute("data-k"))){
    const olds = new Map();
    Array.from(oldP.children).forEach(c=>{ const k = c.getAttribute("data-k"); if(k!=null) olds.set(k, c); });
    let ref = oldP.firstChild;
    nk.forEach(n=>{
      const k = n.nodeType===1 ? n.getAttribute("data-k") : null;
      let node = k!=null ? olds.get(k) : null;
      if(node){ olds.delete(k); morphNode(node, n); } else node = document.importNode(n, true);
      if(node===ref) ref = ref.nextSibling; else oldP.insertBefore(node, ref);
    });
    olds.forEach(c=>{ if(c.parentNode===oldP) oldP.removeChild(c); });
    while(ref){ const nx = ref.nextSibling; if(ref.parentNode===oldP) oldP.removeChild(ref); ref = nx; }
    return;
  }
  const ok = Array.from(oldP.childNodes);
  nk.forEach((n,i)=>{
    const o = ok[i];
    if(!o){ oldP.appendChild(document.importNode(n, true)); return; }
    if(o.nodeType!==n.nodeType || o.nodeName!==n.nodeName){ oldP.replaceChild(document.importNode(n, true), o); return; }
    morphNode(o, n);
  });
  for(let j=nk.length; j<ok.length; j++) oldP.removeChild(ok[j]);
}
const MORPH_STAGES = new Set(["match","penaltyShootout","group_draw","copa_draw","copa_qf_draw","wc_draw"]);
function paintApp(app, html){
  const stage = ST && ST.stage;
  if(stage && MORPH_STAGES.has(stage) && app.dataset.rs===stage && app.firstChild){
    try{
      const tpl = document.createElement("template");
      tpl.innerHTML = html;
      morphChildren(app, tpl.content);
      return;
    }catch(e){ console.warn("morph failed, full repaint", e); }
  }
  app.innerHTML = html;
  app.dataset.rs = stage || "";
}

function render(){
  const app = document.getElementById("app");
  if(!app) return;
  clearTimeout(tickTimer); tickTimer=null;
  // end of the first season: invite the player to send feedback on Instagram and follow on TikTok (once, never blocks)
  if(ST && ST.stage==="season_end" && !ST.feedbackShown && !ST.uiModal){ ST.feedbackShown = true; ST.uiModal = {type:"feedback"}; }
  try{
    let html = "";
    if(!ST || ST.stage==="home") html = renderHome();
    else if(ST.stage==="team_select") html = renderTeamSelect();
    else if(ST.stage==="manager_name") html = renderManagerName();
    else if(ST.stage==="brasa_team_select") html = renderBrasaTeamSelect();
    else if(ST.stage==="brasa_manager_name") html = renderBrasaManagerName();
    else if(ST.stage==="hub") html = renderHub();
    else if(ST.stage==="match") html = renderMatch();
    else if(ST.stage==="season_end") html = renderSeasonEndScreen();
    else if(ST.stage==="group_draw") html = renderGroupDraw();
    else if(ST.stage==="copa_draw") html = renderCopaDraw();
    else if(ST.stage==="copa_qf_draw") html = renderCopaQfDraw();
    else if(ST.stage==="ic_announce") html = renderIcAnnounce();
    else if(ST.stage==="wc_callup") html = renderWcCallup();
    else if(ST.stage==="wc_draw") html = renderWcDraw();
    else if(ST.stage==="wc_end") html = renderWcEnd();
    else if(ST.stage==="job_offers") html = renderJobOffers();
    else if(ST.stage==="career_over") html = renderCareerOver();
    else if(ST.stage==="penaltyShootout") html = renderPenaltyShootoutScreen();
    else if(ST.stage==="prelib_select") html = renderPreLibSelect();
    else if(ST.stage==="prelib_manager_name") html = renderPreLibManagerName();
    else if(ST.stage==="prelib_champion") html = renderPreLibChampion();
    else html = `<div class="empty-state">Estado desconhecido: ${esc(ST.stage)}</div>`;
    paintApp(app, html + renderModal());
    animateMoodBars();
    const tickerEl = document.getElementById("ticker");
    if(tickerEl) tickerEl.scrollTop = tickerEl.dataset.rev ? 0 : tickerEl.scrollHeight;
    if(ST && ST.stage==="match" && ST.pendingMatch && ST.pendingMatch.result && !matchAnimDone()
       && !(ST.uiModal && ST.uiModal.type==="penaltyKick")){
      // that last guard matters: for the full "penaltyKick" card (suspense beat + result beat),
      // the event at matchAnimIdx is deliberately left as "penalty_pending" — without excluding
      // it here, this block would see that same pending event on every re-render and stomp the
      // card straight back to the penaltyPicker modal. Once the kick resolves it flips to a
      // real goal/miss event anyway, so this guard is only ever needed while the card is up.
      const pm = ST.pendingMatch;
      const nextEvent = pm.result.events[ST.matchAnimIdx];
      // "Lenta" runs its own minute-by-minute clock (1', 2', 3'...) instead of jumping straight
      // event-to-event like the other speeds — an event only gets revealed once the clock has
      // actually reached its minute; until then the clock just keeps advancing on its own, one
      // quiet minute at a time, with nothing written to the ticker.
      const clockReady = ST.matchSpeed!=="slow" || !nextEvent || nextEvent.minute<=(ST.matchClockMinute||0);
      if(nextEvent && nextEvent.type==="penalty_pending" && clockReady){
        const atkTeam = nextEvent.side==="home" ? pm.ref.home : pm.ref.away;
        if(atkTeam===ST.teamId){
          // the user's own penalty — pause the ticker and let them pick the taker
          if(!ST.uiModal || ST.uiModal.type!=="penaltyPicker"){
            ST.uiModal = {type:"penaltyPicker", eventIndex: ST.matchAnimIdx};
            tickTimer = setTimeout(()=>{ render(); }, 0); // re-render once more so the modal paints
          }
        } else {
          // the opponent's penalty — resolve it live but without pausing for input
          resolvePendingPenaltyEvent(pm, ST.matchAnimIdx, null);
          tickTimer = setTimeout(()=>{ ST.matchAnimIdx++; render(); }, 900);
        }
      } else if(nextEvent && clockReady){
        const delay = ST.matchSpeed==="slow" ? 120 : matchTickDelay(pm, ST.matchAnimIdx);
        tickTimer = setTimeout(()=>{ ST.matchAnimIdx++; render(); }, delay);
      } else {
        // nothing left to reveal at the current minute — just tick the clock forward (only
        // reachable in "slow" mode; every other speed always has clockReady===true above).
        tickTimer = setTimeout(()=>{ ST.matchClockMinute = Math.min(90, (ST.matchClockMinute||0)+1); render(); }, 450);
      }
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
  if(!pm.result) return true;
  // "Lenta" runs its own minute-by-minute clock all the way to 90' even through quiet stretches
  // with no event to show, so it isn't "done" the instant the last event happens to be revealed —
  // only once the clock itself gets there (every event's minute is <=90, so by then everything
  // has necessarily been revealed too).
  if(ST.matchSpeed==="slow") return (ST.matchClockMinute||0) >= 90;
  return ST.matchAnimIdx >= pm.result.events.length;
}
// how long to hold the next event on screen before advancing — used for "Rápida" (the game's
// original pace) and "Muito rápida" (a snappier fixed tick). "Lenta" no longer uses this: it
// runs a real minute-by-minute clock (see matchClockMinute / matchAnimDone / render()'s tick
// block) instead of jumping event-to-event with a scaled delay.
function matchTickDelay(pm, idx){
  const speed = ST.matchSpeed || "normal";
  if(speed==="fast") return 150;
  return 620;
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
  "BRASILEIRÃO 2026: 20 CLUBES DISPUTAM O TÍTULO E AS VAGAS NA LIBERTADORES",
  "MERCADO GLOBAL ABERTO: MAIS DE 7 MIL JOGADORES PARA CONTRATAR",
  "OLHEIROS EM ALERTA: NOVAS PROMESSAS CHAMAM ATENÇÃO",
  "PRESSÃO NO BANCO: UMA CAMPANHA RUIM PODE CUSTAR O SEU CARGO",
  "REPUTAÇÃO EM JOGO: RESULTADOS ABREM AS PORTAS DOS GRANDES CLUBES",
  "ECONOMIA AQUECIDA: VALORES DE MERCADO DISPARAM PARA AS GRANDES ESTRELAS",
  "10 TEMPORADAS PARA CONSTRUIR O SEU LEGADO",
];
function renderNewsTicker(){
  const items = NEWS_TICKER_ITEMS.concat(NEWS_TICKER_ITEMS); // doubled for seamless loop
  return `<div class="news-ticker"><div class="news-ticker-track">
    ${items.map(t=>`<span class="news-ticker-item"><span class="dot">●</span>${esc(t)}</span>`).join("")}
  </div></div>`;
}
function renderBottomMarquee(){
  const items = Array(8).fill("THE MANAGER");
  return `<div class="mgr-band" aria-hidden="true"><div class="mgr-band-track">
    ${items.map(t=>`<span class="mgr-band-item">${esc(t)}<i>★</i></span>`).join("")}
  </div></div>`;
}
function renderSiteNav(hasCareer){
  return `<header class="mgr-top">
    <button class="mgr-brand" onclick="Game.goHome()" aria-label="THE MANAGER — início">
      <img class="mgr-brand-logo" src="/images/the-manager-logo.png" alt="THE MANAGER" width="1000" height="514" decoding="async"/>
    </button>
    <div class="mgr-top-right">
      <div class="mgr-social">
        <a href="https://www.instagram.com/_thefenomeno/" target="_blank" rel="noopener noreferrer" aria-label="Instagram @_thefenomeno" title="Instagram @_thefenomeno" onclick="Game.openExternal(event,'https://www.instagram.com/_thefenomeno/')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"></circle></svg>
        </a>
        <a href="https://www.tiktok.com/@_thefenomeno" target="_blank" rel="noopener noreferrer" aria-label="TikTok @_thefenomeno" title="TikTok @_thefenomeno" onclick="Game.openExternal(event,'https://www.tiktok.com/@_thefenomeno')">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
        </a>
      </div>
      <button class="nav-jogar-btn mgr-nav-btn" onclick="${hasCareer?"Game.continueCareer()":"Game.goNewGame()"}">${hasCareer?"CONTINUAR":"JOGAR"}</button>
    </div>
  </header>`;
}
function renderPitchMarks(){
  return `<svg class="mgr-pitch" viewBox="0 0 600 600" fill="none" stroke="#f2f4ef" stroke-width="3" aria-hidden="true">
    <circle cx="300" cy="300" r="150"/><circle cx="300" cy="300" r="6" fill="#f2f4ef"/><line x1="0" y1="300" x2="600" y2="300"/>
    <rect x="130" y="0" width="340" height="110"/><rect x="215" y="0" width="170" height="44"/>
    <path d="M230 110 A80 80 0 0 0 370 110"/>
  </svg>`;
}
function renderHome(){
  const hasCareer = ST && ST.teamId && ST.world;
  const inPrelib = hasCareer && !!ST.prelib;
  return `
  <div class="mgr-home">
    ${renderNewsTicker()}
    ${renderSiteNav(hasCareer)}
    <section class="mgr-hero">
      <div class="mgr-hero-logo"><img src="/images/the-manager-logo.png" alt="THE MANAGER" width="1000" height="514" decoding="async"/></div>
      <div class="mgr-hero-copy">
      <div class="mgr-eyebrow">Simulador de carreira · Brasileirão 2026</div>
      <h1 class="mgr-title">THE MANAGER,<span>11 EM CAMPO e 1 NO COMANDO.</span></h1>
      <p class="mgr-desc">Assuma um dos 20 clubes da Série A. Escale, negocie, contrate e faça o elenco evoluir — e descubra se você aguenta 10 temporadas no comando sem ser demitido.</p>
      <div class="mgr-cta">
        ${hasCareer ? `
          <button class="mgr-play" onclick="Game.continueCareer()">▶ ${inPrelib?"CONTINUAR PRÉ-LIBERTADORES":"CONTINUAR CARREIRA"}</button>
          <button class="mgr-ghost" onclick="Game.goNewGame()">Nova carreira</button>
        ` : `
          <button class="mgr-play" onclick="Game.goNewGame()">CRIAR CARREIRA COMO TÉCNICO</button>
        `}
      </div>
      <div class="mgr-comps">Brasileirão · Copa do Brasil · Libertadores · Intercontinental</div>
      <div class="mgr-stats">
        <div class="mgr-stat"><b>20</b><span>clubes da Série A</span></div>
        <div class="mgr-stat"><b>+9 MIL</b><span>jogadores</span></div>
        <div class="mgr-stat"><b>10</b><span>temporadas</span></div>
      </div>
      </div>
    </section>
    ${renderBottomMarquee()}
    <section class="mgr-section">
      <h2>Até onde vai a sua carreira?</h2>
      <p class="lead">Todo técnico começa igual. O que separa um interino de uma lenda é o que ele faz com o elenco, o mercado e a pressão.</p>
      <div class="mgr-tiers">
        <div class="mgr-tier"><div class="tag">Nível 1</div><h3>Interino</h3><p>Escala no feeling, contrata sem olhar o caixa e vê a diretoria perder a paciência.</p><div class="quote">Onde muita gente termina</div></div>
        <div class="mgr-tier"><div class="tag">Nível 2</div><h3>Técnico consagrado</h3><p>Segura o cargo, monta um time competitivo e briga por títulos nacionais e vaga na Libertadores.</p><div class="quote">Uma carreira sólida</div></div>
        <div class="mgr-tier top"><div class="tag">Nível 3</div><h3>THE MANAGER</h3><p>Domina o Brasil, conquista a América e vai ao Mundial. Dez temporadas de domínio.</p><div class="quote">O sonho · THE MANAGER ★★★★★</div></div>
      </div>
    </section>
    <section class="mgr-section">
      <h2>O que você comanda</h2>
      <p class="lead">Tudo o que um técnico decide, numa carreira só.</p>
      <div class="mgr-tiles">
        <div class="mgr-tile"><h3>Escalação</h3><p>Formação, titulares e substituições. Quem joga mal perde a vaga.</p></div>
        <div class="mgr-tile"><h3>Mercado global</h3><p>Mais de 7 mil jogadores de clubes do mundo todo para contratar ou vender.</p></div>
        <div class="mgr-tile"><h3>Olheiro</h3><p>Descubra promessas antes da concorrência e traga o próximo craque.</p></div>
        <div class="mgr-tile"><h3>Campeonatos</h3><p>Brasileirão, Copa do Brasil, Libertadores e Intercontinental na mesma carreira.</p></div>
        <div class="mgr-tile"><h3>Reputação</h3><p>Resultados abrem portas. Campanha ruim custa o cargo.</p></div>
        <div class="mgr-tile"><h3>10 temporadas</h3><p>O elenco envelhece, as promessas evoluem e o seu legado é construído ano a ano.</p></div>
      </div>
    </section>
    <section class="mgr-section mgr-more">
      <h2>Conheça nossos outros jogos</h2>
      <div class="mgr-more-grid">
        ${[
          ["THE FENÔMENO","Simulador de carreira no futebol: roube dos craques, viva uma carreira e descubra onde você fica entre os maiores.","www.thefenomeno.com","the-fenomeno"],
          ["ARENA THE FENÔMENO","Vinte e dois mini games de futebol num lugar só: Draft, Leilão, Maleta, Forca, Bingo, Top 10 e muito mais.","jogue.thefenomeno.com","arena"],
          ["MAIS OU MENOS","Qual é maior? Acerte em sequência e compartilhe o placar.","maisoumenos.thefenomeno.com","mais-ou-menos"],
          ["CONECTE OS FENÔMENOS","Ligue dois craques pelos clubes que os dois vestiram. Um confronto novo todo dia.","conecte.thefenomeno.com","conecte"],
          ["RECONSTRUINDO","Monte o XI ideal do seu time: decida quem fica, quem sai e quem chega.","reconstruindo.thefenomeno.com","reconstruindo"],
        ].map(g=>`<a class="mgr-more-card" href="https://${g[2]}" target="_blank" rel="noopener noreferrer" onclick="Game.openExternal(event,'https://${g[2]}')">
          <img src="/images/jogos/${g[3]}.webp" alt="${g[0]}" width="520" height="273" loading="lazy" decoding="async"/>
          <b>${g[0]}</b><p>${g[1]}</p><small>${g[2].replace(/^www\./,"")}</small><span class="go">ABRIR →</span>
        </a>`).join("")}
      </div>
    </section>
    <footer class="mgr-foot">
      <p>THE MANAGER é um jogo de fãs e não tem afiliação com ligas, federações, clubes ou jogadores. Nomes e escudos são usados apenas para identificação.</p>
      <div class="social-wrap-center" style="padding:0;">${renderInstagramIcon()}</div>
    </footer>
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

// ---------------- BRASILEIRÃO TEAM SELECT ----------------
function brasaTeamAvg(name){
  const t = serieATeamSource(name);
  const arr = t.players.map(p=>p.ovr);
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}
function brasaTierOf(name){
  const ranked = SERIE_A_2026.slice().sort((a,b)=>brasaTeamAvg(b)-brasaTeamAvg(a));
  const idx = ranked.indexOf(name);
  const pct = idx/(ranked.length-1);
  if(pct<0.16) return 5; if(pct<0.38) return 4; if(pct<0.62) return 3; if(pct<0.84) return 2; return 1;
}
function renderBrasaTeamSelect(){
  const sel = ST.tmpSelectedTeam;
  // same visual shape as the Libertadores team-select (several short group-cards side by
  // side in a grid, instead of one long scrolling list) — split alphabetically into 4 even
  // columns since Brasileirão has no real "group" concept to split by.
  const alpha = SERIE_A_2026.slice().sort();
  const chunkSize = Math.ceil(alpha.length/4);
  const chunks = [];
  for(let i=0;i<alpha.length;i+=chunkSize) chunks.push(alpha.slice(i,i+chunkSize));
  const groupCards = chunks.map(chunk=>{
    const rows = chunk.map(name=>{
      const tier = brasaTierOf(name);
      const isSel = sel===name;
      return `<div class="team-row ${isSel?'selected':''}" onclick="Game.pickBrasaTeam('${escJs(name)}')">
        <span style="width:22px;display:inline-flex;">${clubCrestImg(name, 20, null)}</span>
        <span class="team-name">${esc(name)}</span>
        <span class="team-tier tier-${tier}">${tierLabel(tier)}</span>
      </div>`;
    }).join("");
    const label = chunk[0][0]+"–"+chunk[chunk.length-1][0];
    return `<div class="group-card"><div class="group-label">${label}</div>${rows}</div>`;
  }).join("");
  return `
  <div style="padding:26px 20px 10px;">
    <button class="btn btn-ghost btn-sm" onclick="Game.goHome()">← Voltar</button>
    <h2 class="panel-title" style="font-size:22px;margin-top:18px;">Escolha seu time — Brasileirão Série A 2026</h2>
    <p class="dim small">Os 20 clubes da Série A 2026, em ordem alfabética. Times com selo "Elite" e "Forte" partem favoritos — comandar um time modesto é mais desafiador, mas mais gratificante.</p>
    <div class="group-grid">${groupCards}</div>
  </div>
  <div style="position:sticky;bottom:0;background:linear-gradient(180deg,transparent,rgba(8,16,14,.97) 30%);padding:22px 20px 26px;text-align:center;">
    <button class="btn btn-gold btn-lg" ${sel?"":"disabled"} onclick="Game.confirmBrasaTeam()">
      ${sel? "Assumir o "+esc(sel)+" →" : "Selecione um time"}
    </button>
  </div>`;
}
function renderBrasaManagerName(){
  const t = ST.tmpSelectedTeam;
  return `
  <div class="hero" style="min-height:80vh;">
    <div style="align-self:flex-start;margin-left:20px;"><button class="btn btn-ghost btn-sm" onclick="Game.goHome()">Início</button></div>
    <div style="margin-bottom:14px;">${clubCrestImg(t, 76, null)}</div>
    <div class="hero-badge">🇧🇷 Brasileirão Série A 2026</div>
    <h1 class="hero-title" style="font-size:clamp(30px,6vw,54px);">${esc(t)}</h1>
    <p class="hero-sub">Como devemos chamar você, treinador(a)?</p>
    <input id="mgrNameInput" class="input-inline" style="max-width:320px;width:100%;padding:14px;font-size:16px;text-align:center;" placeholder="Seu nome" value="${esc(ST.tmpManagerNameInput||'')}" />
    <div class="mt24">
      <button class="btn btn-gold btn-lg" onclick="Game.beginBrasaCareer()">Assinar contrato e começar →</button>
    </div>
  </div>`;
}

// ---------------- PRÉ-LIBERTADORES ----------------
const PRELIB_BY_COUNTRY = [
  {label:"Brasil", teams:["Vasco da Gama","São Paulo","Grêmio","Santos","Botafogo","Atlético Mineiro"]},
  {label:"Argentina", teams:["River Plate","Racing"]},
];
function renderPreLibSelect(){
  const sel = ST.tmpPrelibTeam;
  const groupCards = PRELIB_BY_COUNTRY.map(({label,teams})=>{
    const rows = teams.map(name=>{
      const isSel = sel===name;
      return `<div class="team-row ${isSel?'selected':''}" onclick="Game.pickPreLibTeam('${escJs(name)}')">
        <span style="width:22px;display:inline-flex;">${crestSVG(name, 20)}</span>
        <span class="team-name">${esc(name)}</span>
      </div>`;
    }).join("");
    return `<div class="group-card"><div class="group-label">${esc(label)}</div>${rows}</div>`;
  }).join("");
  return `
  <div style="padding:26px 20px 10px;">
    <button class="btn btn-ghost btn-sm" onclick="Game.goHome()">← Voltar</button>
    <h2 class="panel-title" style="font-size:22px;margin-top:18px;">🏆 Pré-Libertadores</h2>
    <p class="dim small">8 clubes da Sul-Americana disputam um mata-mata rápido (jogo único, com pênaltis em caso de empate). Escolha seu time do coração: se ele for campeão em ${PRELIB_START_YEAR}, assume a vaga do pior time da fase de grupos da Libertadores e você já começa a carreira em ${PRELIB_START_YEAR+1} no comando dele. Você tem ${PRELIB_MAX_YEAR-PRELIB_START_YEAR+1} tentativas (${PRELIB_START_YEAR} e ${PRELIB_MAX_YEAR}), com acesso total ao elenco, transferências e olheiro pra se reforçar entre uma e outra. Se não vencer em nenhuma delas, a vaga vem mesmo assim — pela campanha do time no Campeonato Nacional.</p>
    <div class="group-grid">${groupCards}</div>
  </div>
  <div style="position:sticky;bottom:0;background:linear-gradient(180deg,transparent,rgba(8,16,14,.97) 30%);padding:22px 20px 26px;text-align:center;">
    <button class="btn btn-gold btn-lg" ${sel?"":"disabled"} onclick="Game.confirmPreLibTeam()">
      ${sel? "Torcer pelo "+esc(sel)+" →" : "Selecione um time"}
    </button>
  </div>`;
}

// ---------------- PRÉ-LIBERTADORES · NOME DO TREINADOR ----------------
function renderPreLibManagerName(){
  const t = ST.tmpPrelibTeam;
  return `
  <div class="hero" style="min-height:80vh;">
    <div style="align-self:flex-start;margin-left:20px;"><button class="btn btn-ghost btn-sm" onclick="Game.goPreLib()">← Voltar</button></div>
    <div style="margin-bottom:14px;">${crestSVG(t, 76)}</div>
    <div class="hero-badge">🏆 PRÉ-LIBERTADORES ${PRELIB_START_YEAR}</div>
    <h1 class="hero-title" style="font-size:clamp(30px,6vw,54px);">${esc(t)}</h1>
    <p class="hero-sub">Como devemos chamar você, treinador(a)?</p>
    <input id="mgrNameInput" class="input-inline" style="max-width:320px;width:100%;padding:14px;font-size:16px;text-align:center;" placeholder="Seu nome" value="${esc(ST.tmpManagerNameInput||'')}" />
    <div class="mt24">
      <button class="btn btn-gold btn-lg" onclick="Game.beginPreLibRun()">Assinar contrato e começar →</button>
    </div>
  </div>`;
}

function prelibTieCard(tie, userTeam){
  if(!tie) return `<div class="panel" style="opacity:.4;padding:12px;text-align:center;">a definir</div>`;
  const decided = tie.winner!=null;
  const rowFor = (name)=>{
    const score = tie.played ? (name===tie.home?tie.hs:tie.as) : null;
    const isWinner = decided && tie.winner===name;
    const isUser = name===userTeam;
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;${isWinner?'font-weight:800;':''}${isUser?'color:var(--gold,#D4AF37);':''}">
      <span style="width:20px;display:inline-flex;">${crestSVG(name,18)}</span>
      <span style="flex:1;font-size:13px;">${esc(name)}</span>
      <span class="mono">${score==null?"–":score}</span>
    </div>`;
  };
  return `<div class="panel" style="padding:4px 0;${decided?'border-color:var(--gold,#D4AF37);':''}">
    ${rowFor(tie.teamA)}${rowFor(tie.teamB)}
    ${tie.wentToPens && tie.played ? '<div class="tiny dim tac" style="padding:2px 0 4px;">(pênaltis)</div>' : ''}
  </div>`;
}

// shared 3-column QF/SF/Final tree, reused by the Competição tab during a Pré-Libertadores run.
function renderPreLibBracketColumns(p){
  const userTeam = p.userTeam;
  const qfHtml = p.qf.map(t=>prelibTieCard(t,userTeam)).join("");
  const sfHtml = p.sf ? p.sf.map(t=>prelibTieCard(t,userTeam)).join("") : [0,1].map(()=>prelibTieCard(null)).join("");
  const finalHtml = p.final ? prelibTieCard(p.final,userTeam) : prelibTieCard(null);
  return `<div class="scroll-x">
    <div style="display:flex;gap:18px;min-width:560px;">
      <div style="flex:1;"><div class="panel-title tac" style="font-size:13px;">Quartas</div>${qfHtml}</div>
      <div style="flex:1;align-self:center;"><div class="panel-title tac" style="font-size:13px;">Semifinal</div>${sfHtml}</div>
      <div style="flex:1;align-self:center;"><div class="panel-title tac" style="font-size:13px;">Final</div>${finalHtml}</div>
    </div>
  </div>`;
}

function renderPreLibChampion(){
  const p = ST.prelib;
  const t = p.champion;
  const meta = ST.world.teams[t];
  const viaNational = !!p.viaNational;
  return `
  <div class="hero" style="min-height:80vh;">
    ${trophyImg(90,0.9)}
    <div class="hero-badge" style="margin-top:10px;">${viaNational ? "🏅 CLASSIFICADO PELO CAMPEONATO NACIONAL" : `🏆 CAMPEÃO DA PRÉ-LIBERTADORES ${p.year}`}</div>
    <div style="margin:14px 0;">${crestSVG(t, 76)}</div>
    <h1 class="hero-title" style="font-size:clamp(28px,6vw,48px);">${esc(t)}</h1>
    <p class="hero-sub">${viaNational
      ? `A Sul-Americana não saiu, mas a campanha do ${esc(t)} no Campeonato Nacional garantiu vaga direta na Libertadores ${p.year+1}, ${esc(ST.managerName)}!`
      : `${esc(meta.flag)} ${esc(meta.country)} garantiu vaga direta na Libertadores ${p.year+1}, ${esc(ST.managerName)}!`}</p>
    <div class="mt24">
      <button class="btn btn-gold btn-lg" onclick="Game.beginPreLibCareer()">Assinar contrato e começar a Libertadores ${p.year+1} →</button>
    </div>
  </div>`;
}

// ---------------- HUB SHELL ----------------
function hubSubline(team){
  if(team.isNation) return `${wcFlagOf(team.name,16)} Seleção · Copa do Mundo ${ST.worldCup.year}`;
  if(wcActive()) return `${team.flag} ${esc(team.country)} · Copa do Mundo ${ST.worldCup.year} (campeonatos parados)`;
  return `${team.flag} ${esc(team.country)} · ${ST.prelib ? `Pré-Libertadores ${ST.prelib.year}` : `Temporada ${ST.seasonYear} (${ST.seasonNum}/10)`}`;
}
function renderHub(){
  if(ST.natDuty && (ST.hubTab==="transfers"||ST.hubTab==="scout"||ST.hubTab==="clube")) ST.hubTab = "competicao";
  const team = myTeam();
  const rep = ST.reputation;
  return `
  <div class="hub-header">
    <div class="hub-header-inner">
      <div class="club-chip">
        <div class="club-badge" style="background:none;border:none;">${clubCrestImg(team.name, 40, null)}</div>
        <div>
          <div class="bold" style="font-size:15px;">${esc(team.name)}</div>
          <div class="faint tiny">${hubSubline(team)}</div>
        </div>
      </div>
      <div class="stat-pill">${fmtMoney(ST.budget)}</div>
      <div class="stat-pill vip-pill">${mgrNameHtml(ST.managerName)}</div>
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
    ${ST.natDuty?"":tabBtn("transfers","Transferências")}
    ${ST.natDuty?"":tabBtn("scout","Olheiro")}
    ${tabBtn("email",iconEnvelope(13)+" E-mail"+(unreadMailCount()?` <span class="badge-mail">${unreadMailCount()}</span>`:""))}
    ${ST.mode==="brasileirao"?tabBtn("desempenho","Desempenho"):""}
    ${ST.natDuty?"":tabBtn("clube","Meu Clube")}
  </div>
  <div class="tab-content">
    ${ST.hubTab==="competicao"?renderCompeticaoTab():""}
    ${ST.hubTab==="elenco"?renderElencoTab():""}
    ${ST.hubTab==="transfers"?renderTransfersTab():""}
    ${ST.hubTab==="scout"?renderScoutTab():""}
    ${ST.hubTab==="email"?renderEmailTab():""}
    ${ST.hubTab==="desempenho"?renderDesempenhoTab():""}
    ${ST.hubTab==="clube"?renderMeuClubeTab():""}
  </div>`;
}
function tabBtn(id,label){
  return `<button class="tab-btn ${ST.hubTab===id?'active':''}" onclick="Game.setTab('${id}')">${label}</button>`;
}

// ---------------- COMPETIÇÃO TAB ----------------
function phaseLabel(phase){
  return {groups:"Fase de Grupos", r16:"Oitavas de Final", qf:"Quartas de Final", sf:"Semifinal", final:"Final", done:"Encerrada"}[phase]||phase;
}
function getNextUserPrelibMatch(){
  const p = ST.prelib;
  if(!p || p.phase==="done" || p.phase==="eliminated") return null;
  const tie = currentPrelibTies().find(t=>t.teamA===p.userTeam || t.teamB===p.userTeam);
  if(!tie || tie.played) return null;
  const roundLabel = {qf:"Quartas de Final", sf:"Semifinal", final:"Final"}[p.phase] || p.phase;
  return {home:tie.home, away:tie.away, label:`Pré-Libertadores ${p.year} · ${roundLabel} · Jogo único`};
}
// if the very next AVANÇAR DIA is the one where tickCopaDoBrasil() actually fires (rather than
// just counting down), and it would involve the user's own team, preview THAT instead of the
// Brasileirão fixture — otherwise the opponent shown during the whole countdown wouldn't match
// what actually plays out on match day, which is exactly what read as "bugged" before this.
function copaPendingUserMatch(){
  const cb = ST.copaDoBrasil;
  /* once you're out, the Copa keeps going without you — no calendar highlight, no bracket takeover — until it starts fresh next season and you're actually in it again. */ if(!cb || cb.userEliminated || cb.phase==="copa_done" || (cb.roundsUntilNextLeg>0 && !brasaLeagueOver())) return null;
  if(cupMatchesBlockedByInterleaving()) return null; // the interleaving rule will skip this round's tick anyway — a Brasileirão match plays first, so don't preview the Copa one yet
  if(cb.phase==="copa_final"){
    const f = cb.knockout.copa_final;
    if(f.played || (f.home!==ST.teamId && f.away!==ST.teamId)) return null;
    return {home:f.home, away:f.away, label:`Copa do Brasil ${cb.year} · Final · Jogo único`, compType:"copa"};
  }
  const round = cb.knockout[cb.phase];
  const tie = round.ties.find(t=>t.teamA===ST.teamId||t.teamB===ST.teamId);
  if(!tie) return null;
  const leg = tie.legs[round.legIndex];
  if(leg.played) return null;
  return {home:leg.home, away:leg.away, label:`${stageLabelFor(cb.phase)} · Jogo de ${round.legIndex===0?'ida':'volta'}`, compType:"copa"};
}
function getNextUserBrasaMatch(){
  const copaPreview = copaPendingUserMatch();
  if(copaPreview) return copaPreview;
  const sulaPreview = sulaPendingUserMatch();
  if(sulaPreview) return sulaPreview;
  const libPreview = libPendingUserMatch();
  if(libPreview) return libPreview;
  const icPreview = icPendingUserMatch();
  if(icPreview) return icPreview;
  const b = ST.brasileirao;
  if(!b || b.currentRound>=b.rounds.length) return null;
  const round = b.rounds[b.currentRound];
  const m = round.find(x=>x.home===ST.teamId||x.away===ST.teamId);
  return m ? {home:m.home, away:m.away, label:`Brasileirão${b.division==="B"?" Série B":""} · Rodada ${b.currentRound+1}/${b.rounds.length}`, compType:"brasileirao"} : null;
}
function getNextUserMatch(){
  if(ST.prelib) return getNextUserPrelibMatch();
  if(ST.mode==="brasileirao") return getNextUserBrasaMatch();
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
// builds the 5-cell weekday strip for the "AVANÇAR DIA" widget — today plus the next 4
// days, with a ball icon dropped on whichever cell the next match actually falls on
// (nothing is shown on the strip itself once the match is more than 4 days out; the
// caption line below it still says exactly how many days remain).
// the match-day cell shows the actual opponent's crest (not a generic ball icon) — a tiny
// preview of who's up, right on the calendar itself.
function renderCalendarStrip(oppName, compType, wide, opts){
  const days = (opts && opts.days!=null) ? opts.days : ST.calendarDaysLeft;
  const todayIdx = ST.calendarWeekdayIdx;
  // how many more AVANÇAR DIA clicks until daysSinceTraining actually hits 2 and a training
  // day interrupts the calendar — maps 1:1 onto the strip's cell index, same as "days" does
  // for the match; never shown past the match day itself, since that resolves first.
  const daysUntilTraining = (opts && opts.noTraining) ? 99 : 2 - (ST.daysSinceTraining||0);
  let cells = "";
  for(let i=0;i<5;i++){
    const wIdx = (todayIdx+i)%7;
    const isMatchDay = i===days;
    const isTrainingDay = !isMatchDay && i===daysUntilTraining && daysUntilTraining>0 && daysUntilTraining<days;
    let icon = "";
    // the match-day square carries the competition's own trophy — not the opponent's crest
    // (already shown up top in the VS header) and not a placeholder ball.
    if(isMatchDay) icon = competitionTrophyImg(compType, wide?74:54, 1);
    else if(isTrainingDay) icon = `<img src="${TRAINING_ICON}" alt="Treino" style="height:${wide?74:54}px;width:auto;max-width:100%;object-fit:contain;"/>`;
    const matchClass = isMatchDay ? (compType==="copa" ? " cal-day-match cal-day-copa" : compType==="libertadores" ? " cal-day-match cal-day-liberta" : compType==="sulamericana" ? " cal-day-match cal-day-sula" : compType==="worldcup" ? " cal-day-match cal-day-wc" : " cal-day-match") : "";
    cells += `<div class="cal-day${matchClass}${isTrainingDay?' cal-day-training':''}${i===0?' cal-day-today':''}">
      <div class="cal-day-label">${WEEKDAYS[wIdx]}</div>
      <div class="cal-day-icon${isMatchDay||isTrainingDay?' cal-day-icon-trophy':''}">${icon}</div>
    </div>`;
  }
  return `<div class="cal-panel mt16${wide?' cal-panel-wide':''}">
    <div class="cal-panel-title">Avançar</div>
    <div class="cal-strip${wide?' cal-strip-wide':''}">${cells}</div>
  </div>`;
}
// "DIA DE TREINO" — interrupts the calendar every 2 days to show the squad's individual
// training bars and let the manager choose to actually run the session or skip it. Simular
// Treino spends a real 3-second beat (icon + filling bar, no emoji) before the result lands —
// Pular stays instant, so the two choices actually feel different, not just cosmetically.
function renderTrainingBlock(){
  if(ST.trainingAnimating){
    return `<div class="train-anim">
      <img src="${TRAINING_ICON}" alt="Treinando" class="train-anim-icon"/>
      <div class="train-anim-bar"><div class="train-anim-bar-fill"></div></div>
      <div class="train-anim-label">Treinando o elenco...</div>
    </div>`;
  }
  const squad = myTeam().players.slice().sort((a,b)=>b.ovr-a.ovr);
  const result = ST.trainingResult;
  const leveledUpCards = result
    ? Object.values(result).filter(r=>r.leveledUp).map((r,i)=>renderLevelUpCard(r.name, r.pos, r.fromOvr, r.toOvr, i*250)).join("")
    : "";
  const rows = squad.map(p=>{
    const maxed = p.ovr>=p.pot;
    const prog = maxed ? 100 : Math.round(p.trainProgress||0);
    const r = result && result[p.id];
    const delta = r && r.gain>0 ? `<span class="green bold train-delta">+${r.gain}%</span>` : "";
    return `<div class="train-row">
      <span class="train-name">${esc(p.name)} <span class="faint tiny">${p.pos}</span></span>
      <span class="train-bar-wrap"><span class="train-bar-fill${maxed?" train-bar-maxed":""}" style="width:${prog}%;"></span></span>
      <span class="tiny mono train-pct">${maxed?"MÁX":prog+"%"}</span>
      ${delta}
    </div>`;
  }).join("");
  const actions = result
    ? `<div class="btn-row center mt16"><button class="btn btn-gold" onclick="Game.finishTrainingDay()">Continuar →</button></div>`
    : `<div class="btn-row center mt16">
        <button class="btn btn-gold" onclick="Game.simulateTraining()">Simular Treino</button>
        <button class="btn btn-danger" onclick="Game.skipTraining()">Pular Dia de Treino</button>
      </div>`;
  return `<div class="row center mt16" style="gap:10px;">
      <img src="${TRAINING_ICON}" alt="" style="width:28px;height:28px;object-fit:contain;"/>
      <span class="gold bold uc" style="letter-spacing:.06em;">Dia de Treino!</span>
    </div>
    <p class="dim small tac mt8">${result
      ? "Treino concluído! Ganhos de hoje em verde — quem completou a barra subiu de overall."
      : "Simular o treino desenvolve o elenco aos poucos — cada jogador enche sua barra e sobe de overall (até o potencial). Pular o treino atrapalha o desenvolvimento e pode até custar potencial."}</p>
    ${leveledUpCards ? `<div class="levelup-deck mt16">${leveledUpCards}</div>` : ""}
    <div class="train-list mt16">${rows}</div>
    ${actions}`;
}
// the "quadrado que sobe" level-up celebration: a card that rises in, a track bar that fills
// left-to-right from the old OVR to the new one, and a "+N GER" that lands right after the bar
// finishes — shared between the Dia de Treino result screen and the season-end Desenvolvimento
// do Elenco panel, since both are fundamentally the same moment (a player just gained OVR).
function renderLevelUpCard(name, pos, fromOvr, toOvr, delayMs){
  delayMs = delayMs||0;
  const gain = toOvr - fromOvr;
  return `<div class="levelup-card" style="animation-delay:${delayMs}ms;">
    <div class="levelup-name">${esc(name)} <span class="faint tiny">${esc(pos)}</span></div>
    <div class="levelup-bar-track">
      <span class="levelup-bar-num">${fromOvr}</span>
      <span class="levelup-bar-rail"><span class="levelup-bar-fill" style="animation-delay:${delayMs+150}ms;"></span></span>
      <span class="levelup-bar-num">${toOvr}</span>
    </div>
    <div class="levelup-plus" style="animation-delay:${delayMs+1350}ms;">+${gain} GER</div>
  </div>`;
}
// the "próximo jogo" card — lives inside the Competição tab (below the tabs, part of its own
// grid), not the persistent header. compact:true is the small square-ish version used in the
// Brasileirão career's left column (smaller crests, tighter spacing, no time-config shortcut)
// so the table still owns most of the row and the page fits without scrolling.
function renderNextMatchCard(compact, wide){
  const nm = getNextUserMatch();
  if(!nm){
    // safety valve: the Brasileirão itself is already done and there's genuinely no personal
    // match left anywhere, but the season still hasn't wrapped up on its own — this should always
    // be caught automatically (see brasaLeagueOver() and checkForPostSeasonDeadEnd()), so this is
    // only a last-resort escape hatch for whatever edge case still slips past that. Never leave
    // the player staring at an empty card with nothing left to click at all.
    if(ST.mode==="brasileirao" && brasaLeagueOver() && ST.stage==="hub"){
      return `<div class="panel" style="text-align:center;${compact?'padding:14px;':''}">
        <div class="faint tiny uc mb12">Temporada ${ST.seasonYear}</div>
        <p class="dim small">Todos os seus compromissos da temporada terminaram.</p>
        <div class="btn-row center ${compact?'mt8':'mt16'}">
          <button class="btn btn-gold ${compact?'':'btn-lg'}" onclick="Game.forceEndSeason()">IR PARA ${ST.seasonYear+1} →</button>
        </div>
      </div>`;
    }
    return "";
  }
  ensureCalendarCountdown();
  const days = ST.calendarDaysLeft;
  const oppName = nm.home===ST.teamId ? nm.away : nm.home;
  const crestSize = compact ? 40 : wide ? 92 : 64;
  const timeConfigBtn = `<div class="btn-row center mt8">
         <button class="btn btn-sm" onclick="Game.openTimeConfig()">CONFIGURAÇÃO DE TEMPO</button>
       </div>`;
  // match day itself drops the calendar entirely and goes back to exactly how this card
  // worked before AVANÇAR DIA existed: simulate straight away, at whatever pace/speed.
  const actionBlock = ST.trainingPending
    ? renderTrainingBlock()
    : days<=0
    ? `<div class="gold bold uc tac ${compact?'mt8 tiny':'mt16'}" style="letter-spacing:.06em;">⚽ Dia do jogo!</div>
       <div class="btn-row center ${compact?'mt8':'mt16'}">
         <button class="btn btn-gold ${compact?'btn-sm':''}" onclick="Game.advanceSlow()">▶ Partida Completa</button>
         <button class="btn ${compact?'btn-sm':''}" onclick="Game.advanceFast()">⏭ ${compact?'Resultado':'Ir para o Resultado'}</button>
       </div>
       ${timeConfigBtn}`
    : `${renderCalendarStrip(oppName, nm.compType, wide)}
       ${nm.compType==="copa"?'<div class="tac gold bold tiny uc mt8" style="letter-spacing:.06em;color:#4ee14e;">Copa do Brasil</div>':nm.compType==="sulamericana"?'<div class="tac gold bold tiny uc mt8" style="letter-spacing:.06em;color:#4ee14e;">CONMEBOL Sul-Americana</div>':nm.compType==="libertadores"?'<div class="tac gold bold tiny uc mt8" style="letter-spacing:.06em;color:#4ee14e;">CONMEBOL Libertadores</div>':''}
       <div class="tac dim small mt8">Próximo jogo em ${days} dia${days===1?"":"s"}</div>
       <div class="btn-row center ${compact?'mt8':'mt16'}">
         <button class="btn btn-gold ${compact?'':'btn-lg'}" onclick="Game.advanceDay()">AVANÇAR DIA</button>
       </div>
       ${timeConfigBtn}`;
  return `<div class="panel${wide?' next-match-wide':''}" style="text-align:center;${compact?'padding:14px;':''}">
    <div class="faint tiny uc mb12">${esc(nm.label)}</div>
    <div class="row center" style="gap:${compact?'16px':wide?'clamp(28px,9vw,120px)':'28px'};">
      <div style="width:${crestSize+26}px;">
        <div style="width:${crestSize}px;height:auto;margin:0 auto;">${clubCrestImg(nm.home,crestSize,null)}</div>
        <div class="bold small mt8">${esc(nm.home)}</div>
      </div>
      <div class="faint" style="font-family:var(--font-display);font-size:${compact?'16px':wide?'38px':'22px'};font-weight:800;">VS</div>
      <div style="width:${crestSize+26}px;">
        <div style="width:${crestSize}px;height:auto;margin:0 auto;">${clubCrestImg(nm.away,crestSize,null)}</div>
        <div class="bold small mt8">${esc(nm.away)}</div>
      </div>
    </div>
    ${actionBlock}
  </div>`;
}
// the Pré-Libertadores flavor of the Competição tab: same "próximo jogo" card (with its
// AVANÇAR DIA calendar) as a real career, just showing the knockout bracket instead of a
// group table, plus whatever status the run is currently in.
function renderPreLibCompeticaoTab(){
  const p = ST.prelib;
  const bracketPanel = `<div class="panel"><div class="panel-title">🏆 Pré-Libertadores ${p.year}</div>${renderPreLibBracketColumns(p)}</div>`;

  let statusPanel;
  if(p.phase==="eliminated"){
    const isLastChance = (p.year+1)>=PRELIB_MAX_YEAR;
    statusPanel = `<div class="panel tac">
      <div class="bold" style="font-size:15px;margin-bottom:8px;">${esc(p.userTeam)} foi eliminado da Sul-Americana ${p.year}.</div>
      <p class="dim small">Reforce o elenco em Transferências e tente de novo — a próxima chance é ${p.year+1}${isLastChance?" (última tentativa; se não der, a vaga vem pelo Campeonato Nacional)":""}.</p>
      <button class="btn btn-gold mt8" onclick="Game.retryPreLib()">🔁 Tentar novamente (${p.year+1})</button>
    </div>`;
  } else {
    statusPanel = renderTopScorers();
  }

  const cells = `<div class="competicao-cell">${renderNextMatchCard()}</div>`
    + `<div class="competicao-cell">${statusPanel}</div>`
    + `<div class="competicao-cell" style="grid-column:1 / -1;">${bracketPanel}</div>`;
  return `<div class="competicao-grid">${cells}</div>`;
}
// four distinct boxed panels, laid out 2×2 — mirrors the reference: match card,
// standings, upcoming fixtures and top scorers each get their own separated card.
// "FABRIZIO ROMANO" — a transfer-news card on the Competição tab reading straight off
// ST.transferFeed (every AI signing plus the user's own purchases). Click it to flip between
// the 5 priciest deals in the save so far and EVERY recent one, newest first, each stamped with
// how long ago it happened (romanoDayLabel()) — real day-by-day news, not a season-end dump.
function romanoRow(t){
  return `<div class="romano-row">${playerFaceByName(t.name,38,"",t.pos)}
    <div class="romano-row-crests">
      ${clubCrestImg(t.fromClub, 22)}
      <span class="romano-arrow">→</span>
      ${clubCrestImg(t.toClub, 22)}
    </div>
    <div class="romano-row-body">
      <div class="bold">${esc(t.name)}</div>
      <div class="tiny dim">${esc(t.fromClub)} <span class="romano-arrow-inline">→</span> <span class="bold">${esc(t.toClub)}</span></div>
    </div>
    <div class="romano-row-side">
      <div class="romano-row-fee gold bold mono">${fmtMoney(t.price)}</div>
      <div class="tiny faint">${esc(romanoDayLabel(t.day))}</div>
    </div>
  </div>`;
}
function renderFabrizioRomanoCard(){
  const feed = ST.transferFeed || [];
  if(!feed.length){
    return `<div class="panel romano-panel">
      <div class="panel-title">🗞️ FABRIZIO ROMANO</div>
      <div class="faint tiny">Mercado ainda calmo — os primeiros rumores chegam nos próximos dias. Here we go... eventually!</div>
    </div>`;
  }
  const flipped = !!ST.romanoFlip;
  // "mais recentes" now shows the WHOLE feed, newest first, scrolling inside the card instead of
  // being capped at 5 — see .romano-flip-inner's max-height in global.css. "mais caras" stays a
  // top-5 leaderboard on purpose, that one was never meant to be exhaustive.
  const list = flipped
    ? feed.slice().reverse()
    : feed.slice().sort((a,b)=>b.price-a.price).slice(0,5);
  const squeeze = ST.romanoFlipping ? "transform:scaleX(0.04);" : "transform:scaleX(1);";
  return `<div class="panel romano-panel" onclick="Game.toggleRomanoFlip()" title="Clique para virar a página" style="cursor:pointer;">
    <div class="row" style="justify-content:space-between;">
      <div class="panel-title" style="margin:0;">🗞️ FABRIZIO ROMANO</div>
      <div class="tiny faint uc">${flipped?`Mais recentes (${list.length})`:"Mais caras"} · clique p/ virar</div>
    </div>
    <div class="romano-flip-inner${flipped?' romano-flip-scroll':''}" style="${squeeze}" onclick="event.stopPropagation();">
      ${list.map(romanoRow).join("")}
    </div>
  </div>`;
}
// ---------------- BRASILEIRÃO TAB ----------------
// zone stripe by final table position — real Série A convention: top 6 go straight into next
// year's Libertadores, 7-13 into the Sul-Americana (7 real 2026 Brazilian entrants), 17-20 get relegated.
function brasaZoneClass(pos, division){
  if(division==="B"){ // Série B: 4 clubs go up, 4 go down
    if(pos<=4) return "brasa-zone-liberta";
    if(pos>=17) return "brasa-zone-rebaixamento";
    return "";
  }
  if(pos<=6) return "brasa-zone-liberta";
  if(pos<=13) return "brasa-zone-sula";
  if(pos>=17) return "brasa-zone-rebaixamento";
  return "";
}
// opts.cap: show only the top N rows (Competição tab's compact view) with a fade + a "ver
// tabela completa" shortcut into the Desempenho tab — if the user's own club falls outside
// that cut, its row gets pinned right below the fade instead of just vanishing off-screen.
function renderBrasaTable(rows, opts){
  opts = opts || {};
  const division = opts.division || (ST.brasileirao && ST.brasileirao.division) || "A";
  const cap = opts.cap;
  const capped = !!(cap && rows.length>cap);
  const shown = capped ? rows.slice(0, cap) : rows;
  const userIdx = rows.findIndex(r=>r.team===ST.teamId);
  const pinnedUser = capped && userIdx>=cap ? {row:rows[userIdx], pos:userIdx+1} : null;
  const rowHtml = (r,pos)=>`<tr class="${brasaZoneClass(pos, division)} ${r.team===ST.teamId?'brasa-row-user':''}">
    <td class="dim">${pos}</td>
    <td class="bold"><span class="standings-team"><span class="standings-crest">${clubCrestImg(r.team,18,null)}</span><span>${esc(r.team)}</span>${r.team===ST.teamId?' <span class="brasa-you">(você)</span>':''}</span></td>
    <td class="tac bold brasa-pts">${r.pts}</td>
    <td class="tac">${r.played}</td><td class="tac">${r.w}</td><td class="tac">${r.d}</td><td class="tac">${r.l}</td>
    <td class="tac">${r.gf}</td><td class="tac">${r.ga}</td><td class="tac">${r.gd>0?'+':''}${r.gd}</td>
  </tr>`;
  return `<div class="brasa-table-card">
    <div class="brasa-table-head">
      <img src="/images/brasileirao-logo.png" alt="" class="brasa-logo" onerror="this.style.display='none';"/>
      <div class="brasa-table-title">Tabela ${divisionLabel(division)}</div>
      <div class="brasa-table-sub">Brasileirão ${divisionLabel(division)} · ${ST.seasonYear}</div>
    </div>
    <div class="brasa-table-scroll${capped?' is-capped':''}">
      <div class="scroll-x"><table class="data brasa-table">
        <thead><tr>
          <th>#</th><th>Time</th><th class="tac">P</th><th class="tac">J</th><th class="tac">V</th>
          <th class="tac">E</th><th class="tac">D</th><th class="tac">GP</th><th class="tac">GC</th><th class="tac">SG</th>
        </tr></thead>
        <tbody>${shown.map((r,i)=>rowHtml(r,i+1)).join("")}</tbody>
      </table></div>
      ${capped?'<div class="brasa-table-fade"></div>':''}
    </div>
    ${pinnedUser?`<div class="scroll-x"><table class="data brasa-table brasa-table-pinned"><tbody>${rowHtml(pinnedUser.row,pinnedUser.pos)}</tbody></table></div>`:''}
    ${capped?`<div class="tac mt8"><button class="btn btn-sm btn-ghost" onclick="Game.setTab('desempenho')">Ver tabela completa →</button></div>`:''}
    <div class="brasa-legend">
      ${division==="B"
        ? `<span><i class="brasa-dot brasa-zone-liberta"></i> Acesso à Série A</span><span><i class="brasa-dot brasa-zone-rebaixamento"></i> Rebaixamento</span>`
        : `<span><i class="brasa-dot brasa-zone-liberta"></i> Libertadores</span><span><i class="brasa-dot brasa-zone-sula"></i> Sul-Americana</span><span><i class="brasa-dot brasa-zone-rebaixamento"></i> Rebaixamento</span>`}
    </div>
  </div>`;
}
// top scorers / top assisters, league-wide — used on the Desempenho tab (top 25 of each).
// generic top-scorers/assisters readers — used for whichever competition the Desempenho tab's
// filter currently has selected (see desempenhoAvailableComps()/renderDesempenhoTab()).
function compTopScorersFull(store, n){ return statRows(store, "scorers", "goals", n); }
function compTopAssistersFull(store, n){ return statRows(store, "assisters", "assists", n); }
function renderStatLeaderboard(title, rows, statKey, emptyMsg){
  if(rows.length===0){
    return `<div class="panel"><div class="panel-title">${esc(title)}</div><div class="faint tiny">${esc(emptyMsg||"Nenhum registro ainda nesta temporada.")}</div></div>`;
  }
  return `<div class="panel">
  <div class="panel-title">${esc(title)}</div>
  <div class="scroll-x"><table class="data"><tbody>
  ${rows.map((s,i)=>`<tr>
    <td class="dim" style="width:24px;">${i+1}</td>
    <td class="bold">${esc(s.name)} ${s.team===ST.teamId?'<span class="gold small">(você)</span>':''}</td>
    <td class="dim">${wcFlagOf(s.team,16)} ${esc(s.team)}</td>
    <td class="tac gold bold">${s[statKey]}</td>
  </tr>`).join("")}
  </tbody></table></div>
  </div>`;
}
// compact tie row for the Copa do Brasil panel — both legs' scores (or the aggregate once
// both are in), user's own tie highlighted, "a definir" placeholder for a not-yet-known side.
function copaTieRow(tie){
  const isUser = tie.teamA===ST.teamId || tie.teamB===ST.teamId;
  const l1 = tie.legs[0], l2 = tie.legs[1];
  const scoreTxt = tie.winner
    ? (tie.wentToPens ? `${tie.aggA}-${tie.aggB} (pên.)` : `${tie.aggA}-${tie.aggB}`)
    : (l1.played ? `${l1.hs}-${l1.as} (ida)` : "—");
  return `<div class="fixture-mini-row ${isUser?'is-user':''}">
    <span class="fixture-mini-team">${clubCrestImg(tie.teamB,16,null)}<span>${esc(tie.teamB)}</span></span>
    <span class="fixture-mini-x">${tie.winner===tie.teamB?'✓':tie.winner===tie.teamA?'':'×'}</span>
    <span class="fixture-mini-team right"><span>${esc(tie.teamA)}</span>${clubCrestImg(tie.teamA,16,null)}</span>
    <span class="fixture-mini-round">${scoreTxt}</span>
  </div>`;
}
function renderCopaDoBrasilPanel(){
  const cb = ST.copaDoBrasil;
  if(!cb) return "";
  if(cb.phase==="copa_done"){
    return `<div class="panel"><div class="panel-title">Copa do Brasil ${cb.year}</div>
      <div class="row" style="align-items:center;gap:10px;">
        ${clubCrestImg(cb.champion,32,null)}
        <div><div class="faint tiny uc">Campeão</div><div class="bold gold">${esc(cb.champion)}</div></div>
      </div>
    </div>`;
  }
  if(cb.phase==="copa_final"){
    const f = cb.knockout.copa_final;
    return `<div class="panel"><div class="panel-title">Copa do Brasil ${cb.year} — Final</div>
      ${copaTieRow({teamA:f.away, teamB:f.home, legs:[f,f], winner:f.played?(f.hs>f.as?f.home:f.away):null, wentToPens:false, aggA:f.as, aggB:f.hs})}
    </div>`;
  }
  const round = cb.knockout[cb.phase];
  return `<div class="panel"><div class="panel-title">${esc(stageLabelFor(cb.phase))} ${cb.year}${cb.userEliminated?' <span class="faint tiny">(você já caiu)</span>':''}</div>
    ${round.ties.map(copaTieRow).join("")}
  </div>`;
}
// the "próximo jogo" card (compact) anchors the left column here; the tab otherwise sticks to
// what's actually happening, contratações and the latest e-mails, sized to fit in one view.
// Artilheiros/assistências (top 25 each) and the full 20-team table moved to DESEMPENHO.
// which competition the NEXT match belongs to decides whose top scorers the home screen shows —
// a Libertadores week shows the Libertadores table, a Copa do Brasil week the Copa's, and so on.
function nextCompetitionStats(){
  const nm = getNextUserMatch();
  const t = nm ? nm.compType : "brasileirao";
  if(t==="copa" && ST.copaDoBrasil) return {store:ST.copaDoBrasil, title:"Copa do Brasil"};
  if(t==="libertadores" && ST.libertadoresCompleto) return {store:ST.libertadoresCompleto, title:"Libertadores"};
  if(t==="sulamericana" && ST.sulamericana) return {store:ST.sulamericana, title:"Sul-Americana"};
  if(t==="intercontinental" && ST.intercontinental) return {store:ST.intercontinental, title:"Mundial de Clubes"};
  return {store:ST.brasileirao, title: ST.brasileirao && ST.brasileirao.division==="B" ? "Brasileirão Série B" : "Brasileirão"};
}
// scorers <-> assisters: one card, click to flip (shared by every competition's home screen and the World Cup)
function renderStatFlipCard(store, title){
  const assists = ST.compStatView==="assisters";
  const rows = assists ? compTopAssistersFull(store, 8) : compTopScorersFull(store, 8);
  const head = `<div class="row" style="justify-content:space-between;align-items:baseline;">
      <div class="panel-title" style="margin:0;">${assists?"🎯 ASSISTÊNCIAS":"⚽ ARTILHEIROS"}</div>
      <div class="tiny faint uc">${esc(title)} · clique para ${assists?"ver artilheiros":"ver assistências"}</div>
    </div>`;
  const open = `<div class="panel stat-flip-panel" onclick="Game.toggleCompStat()" title="Clique para alternar entre artilheiros e assistências">`;
  if(!rows.length){
    return `${open}${head}<div class="faint tiny mt8">${assists?"Nenhuma assistência registrada ainda nesta competição.":"Nenhum gol registrado ainda nesta competição. Os artilheiros aparecem aqui assim que a bola rolar."}</div></div>`;
  }
  return `${open}${head}
    <div class="comp-scorers-list">
    ${rows.map((r,i)=>{
      const pl = playerById(r.team, r.id) || {id:r.id, name:r.name};
      return `<div class="comp-scorer-row ${r.team===ST.teamId?'is-user':''}">
        <span class="comp-scorer-rank">${i+1}</span>
        ${playerFaceImg(pl,30)}
        <div class="comp-scorer-body"><div class="bold">${esc(r.name)}</div><div class="tiny dim">${clubCrestImg(r.team,14,null)} ${esc(r.team)}</div></div>
        <span class="comp-scorer-goals gold bold mono">${assists?r.assists:r.goals}</span>
      </div>`;
    }).join("")}
    </div>
  </div>`;
}
function renderWeekScorersCard(){
  const info = nextCompetitionStats();
  return renderStatFlipCard(info.store, info.title);
}
function renderBrasileiraoCompeticaoTab(){
  /* the home screen is deliberately static: a wide "próximo jogo" card on top, then three equal square boxes (Fabrizio Romano, the artilheiros of whichever competition the next match belongs to, last e-mail) - only the text inside changes. No tables or brackets here; those all live in the Desempenho tab. */
  const card = renderNextMatchCard(false, true) || `<div class="panel" style="text-align:center;"><div class="faint tiny uc mb12">Temporada ${ST.seasonYear}</div><p class="dim small">Nenhuma partida marcada no momento.</p></div>`;
  return `${renderWcBanner()}<div class="comp-home2">
    <div class="comp-home2-match">${card}</div>
    <div class="comp-home2-boxes">
      <div class="comp-box">${renderFabrizioRomanoCard()}</div>
      <div class="comp-box">${renderWeekScorersCard()}</div>
      <div class="comp-box">${renderLatestEmailCard()}</div>
    </div>
  </div>`;
}
// last N rounds' results for a club, most recent first — read straight off the fixed
// double round-robin schedule (ST.brasileirao.rounds), no separate history log needed.
function brasaRecentForm(teamName, n){
  const b = ST.brasileirao;
  if(!b) return [];
  const out = [];
  const lastRound = Math.min(b.currentRound, b.rounds.length);
  for(let r=0; r<lastRound; r++){
    const m = b.rounds[r].find(x=>(x.home===teamName||x.away===teamName) && x.played);
    if(!m) continue;
    const isHome = m.home===teamName;
    const gf = isHome?m.hs:m.as, ga = isHome?m.as:m.hs;
    out.push({round:r+1, opp:isHome?m.away:m.home, home:isHome, gf, ga, res: gf>ga?"V":gf<ga?"D":"E"});
  }
  return out.slice(-n).reverse();
}
// which competitions the Desempenho tab can filter to — Brasileirão is always there; the other
// three only show up once ST.teamId is actually in them this season (Copa always exists once the
// season starts, Sul-Americana/Libertadores only exist at all when the club qualified for them —
// see startSulamericanaIfEligible()/startLibertadoresCompletoIfEligible()).
function desempenhoAvailableComps(){
  if(ST.natDuty) return [{key:"wc", label:"Copa do Mundo"}]; // comandando uma seleção: só a Copa interessa
  const opts = [{key:"brasileirao", label: ST.brasileirao && ST.brasileirao.division==="B" ? "Brasileirão Série B" : "Brasileirão"}];
  if(ST.otherLeague) opts.push({key:"other", label: `Brasileirão ${divisionLabel(ST.otherLeague.division)}`});
  if(ST.worldCup && ST.worldCup.year===ST.seasonYear) opts.unshift({key:"wc", label:"Copa do Mundo"});
  if(ST.copaDoBrasil) opts.push({key:"copa", label:"Copa do Brasil"});
  if(ST.sulamericana) opts.push({key:"sula", label:"Sul-Americana"});
  if(ST.libertadoresCompleto) opts.push({key:"lib", label:"Libertadores"});
  if(ST.intercontinental && ST.intercontinental.year===ST.seasonYear && ST.intercontinental.phase!=="ic_announce") opts.push({key:"ic", label:"Mundial de Clubes"});
  return opts;
}
function renderDesempenhoFilterBar(opts, active){
  if(opts.length<=1) return "";
  return `<div class="btn-row mb16">${opts.map(o=>`<button class="btn btn-sm ${active===o.key?'btn-gold':''}" onclick="Game.setDesempenhoFilter('${o.key}')">${esc(o.label)}</button>`).join("")}</div>`;
}
// full 20-team table + the user's recent form guide — everything the compact Competição
// tab's capped table leaves out, one click away via "Ver tabela completa →". Only shown while
// the filter bar above is set to "Brasileirão" — the other three competitions show their own
// chaveamento/group table instead (see renderDesempenhoTab()).
function renderDesempenhoBrasileiraoBlock(){
  const table = brasaSortedStandings();
  const form = brasaRecentForm(ST.teamId, 10);
  const formPills = form.map(f=>`<span class="form-pill form-pill-${f.res.toLowerCase()}" title="${f.home?'vs.':'@'} ${esc(f.opp)} (${f.gf}-${f.ga})">${f.res}</span>`).join("")
    || `<span class="faint tiny">Nenhuma partida disputada ainda nesta temporada.</span>`;
  const formList = form.map(f=>`<div class="form-row">
    <span class="form-row-res form-pill-${f.res.toLowerCase()}">${f.res}</span>
    <span class="form-row-round faint tiny mono">R${f.round}</span>
    <span class="form-row-opp">${f.home?'vs.':'@'} ${clubCrestImg(f.opp,16,null)}<span>${esc(f.opp)}</span></span>
    <span class="form-row-score mono bold">${f.gf}-${f.ga}</span>
  </div>`).join("");
  const scorers = compTopScorersFull(ST.brasileirao, 25);
  const assisters = compTopAssistersFull(ST.brasileirao, 25);
  return `<div class="desempenho-grid">
    <div class="desempenho-col">
      <div class="panel">
        <div class="panel-title">Sequência recente — ${esc(ST.teamId)}</div>
        <div class="form-pills">${formPills}</div>
        <div class="form-list mt12">${formList}</div>
      </div>
    </div>
    <div class="desempenho-col desempenho-col-wide">${renderBrasaTable(table)}</div>
  </div>
  <div class="competicao-grid mt16">
    <div class="competicao-cell">${renderStatLeaderboard("Artilheiros — Top 25", scorers, "goals")}</div>
    <div class="competicao-cell">${renderStatLeaderboard("Assistências — Top 25", assisters, "assists")}</div>
  </div>`;
}
// the Copa do Brasil / Sul-Americana / Libertadores flavor: reuses the exact same
// chaveamento/group-table panel already shown in the Competição tab (renderCopaBracket() etc.),
// plus that competition's OWN top-scorers/assists — separate from the Brasileirão-wide ones,
// via the compKey routing simFast()/applyDetailedResultToWorld() already do at match time.
function renderIcDesempenhoBlock(){
  const ic = ST.intercontinental;
  const row = (f, label) => {
    if(!f) return `<div class="fixture-mini-row"><span class="fixture-mini-team"><span class="faint tiny">${esc(label)} - a definir</span></span></div>`;
    const score = f.played ? `${f.hs} x ${f.as}${f.pens?` (${f.pens})`:""}` : "x";
    return `<div class="fixture-mini-row ${f.home===ST.teamId||f.away===ST.teamId?'is-user':''}">
      <span class="fixture-mini-team">${crestMini(f.home)}<span>${esc(f.home)}</span></span>
      <span class="fixture-mini-x">${score}</span>
      <span class="fixture-mini-team right"><span>${esc(f.away)}</span>${crestMini(f.away)}</span>
      <span class="fixture-mini-round">${esc(label)}</span>
    </div>`;
  };
  return `<div class="panel"><div class="panel-title">Mundial de Clubes ${ic.year}</div>
    <div class="fixture-mini-list">${row(ic.semis.sf1,"Semifinal 1")}${row(ic.semis.sf2,"Semifinal 2")}${row(ic.final,"Final")}</div>
    ${ic.champion?`<div class="tac gold bold mt16">Campeão: ${esc(ic.champion)}</div>`:""}
  </div>`;
}
// the division the user is not in: its table and its own top scorers/assisters
function renderDesempenhoOtherBlock(){
  const o = ST.otherLeague;
  const table = otherLeagueTable();
  const scorers = compTopScorersFull(o, 25);
  const assisters = compTopAssistersFull(o, 25);
  return `<div class="desempenho-grid"><div class="desempenho-col desempenho-col-wide">${renderBrasaTable(table, {division:o.division})}</div></div>
  <div class="competicao-grid mt16">
    <div class="competicao-cell">${renderStatLeaderboard("Artilheiros — Top 25", scorers, "goals", "Nenhum gol registrado ainda nesta competição.")}</div>
    <div class="competicao-cell">${renderStatLeaderboard("Assistências — Top 25", assisters, "assists", "Nenhuma assistência registrada ainda nesta competição.")}</div>
  </div>`;
}
function renderDesempenhoCompBlock(key){
  if(key==="other") return renderDesempenhoOtherBlock();
  if(key==="wc") return renderWcDesempenhoBlock();
  if(key==="ic") return renderIcDesempenhoBlock();
  const store = key==="copa" ? ST.copaDoBrasil : key==="sula" ? ST.sulamericana : ST.libertadoresCompleto;
  const title = key==="copa" ? `Copa do Brasil ${store.year}` : key==="sula" ? `Sul-Americana ${store.year}` : `Libertadores ${store.year}`;
  const panelHtml = key==="copa" ? renderCopaBracket() : key==="sula" ? renderSulaCompetitionPanel() : renderLibCompletoCompetitionPanel();
  const scorers = compTopScorersFull(store, 25);
  const assisters = compTopAssistersFull(store, 25);
  return `<div class="panel"><div class="panel-title">${esc(title)}</div>${panelHtml}</div>
  <div class="competicao-grid mt16">
    <div class="competicao-cell">${renderStatLeaderboard("Artilheiros — Top 25", scorers, "goals", "Nenhum gol registrado ainda nesta competição.")}</div>
    <div class="competicao-cell">${renderStatLeaderboard("Assistências — Top 25", assisters, "assists", "Nenhuma assistência registrada ainda nesta competição.")}</div>
  </div>`;
}
function renderDesempenhoTab(){
  const opts = desempenhoAvailableComps();
  if(!opts.some(o=>o.key===ST.desempenhoFilter)) ST.desempenhoFilter = opts[0].key; // guards against a stale pick — e.g. the Sul-Americana campaign it pointed at is over and gone
  const filter = ST.desempenhoFilter;
  const filterBar = renderDesempenhoFilterBar(opts, filter);
  const body = filter==="brasileirao" ? renderDesempenhoBrasileiraoBlock() : renderDesempenhoCompBlock(filter);
  return filterBar + body;
}
function renderCompeticaoTab(){
  if(wcActive()) return renderWorldCupTab();
  if(ST.prelib) return renderPreLibCompeticaoTab();
  if(ST.mode==="brasileirao") return renderBrasileiraoCompeticaoTab();
  const comp = ST.competition;
  let cells;
  if(comp.phase==="groups"){
    const g = userGroup();
    const standings = groupStandingsFor(g);
    const standingsPanel = `<div class="panel">
      <div class="panel-title">Grupo ${g} — Rodada ${Math.min(comp.currentRound+1,6)}/6</div>
      ${renderStandingsTable(standings)}
    </div>`;
    // explicit two-column layout (rather than a flat 4-cell auto-flow grid) so the "Últimos
    // E-mails" shortcut can sit exactly where it was asked for: right column, between the
    // group standings and the top scorers.
    const leftCol = `<div class="competicao-col">
      <div class="competicao-cell">${renderNextMatchCard()}</div>
      <div class="competicao-cell">${renderUpcomingFixtures(g)}</div>
    </div>`;
    const rightCol = `<div class="competicao-col">
      <div class="competicao-cell">${standingsPanel}</div>
      <div class="competicao-cell">${renderLatestEmailCard()}</div>
      <div class="competicao-cell">${renderTopScorers()}</div>
      <div class="competicao-cell">${renderFabrizioRomanoCard()}</div>
    </div>`;
    return `<div class="competicao-grid">${leftCol}${rightCol}</div>`;
  } else {
    const bracketPanel = `<div class="panel"><div class="panel-title">${phaseLabel(comp.phase)}</div>${renderKnockoutBracket()}</div>`;
    cells = `<div class="competicao-cell">${renderNextMatchCard()}</div>`
      + `<div class="competicao-cell">${renderTopScorers()}</div>`
      + `<div class="competicao-cell">${renderFabrizioRomanoCard()}</div>`
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
  const scorers = statRows(ST.competition, "scorers", "goals", 5);
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
// a one-row preview of the newest inbox mail, sitting between the group standings and the
// top scorers — click it (or its empty-inbox state) to jump straight into the full E-mail tab.
function renderLatestEmailCard(){
  const box = inboxList();
  const unread = unreadMailCount();
  const latest = box[0];
  const header = `<div class="row" style="justify-content:space-between;margin-bottom:${latest?"10px":"0"};">
      <div class="panel-title" style="margin:0;">${iconEnvelope(14)} Últimos E-mails</div>
      ${unread?`<span class="badge-mail">${unread}</span>`:""}
    </div>`;
  if(!latest){
    return `<div class="panel latest-mail-panel" onclick="Game.setTab('email')">
      ${header}
      <div class="faint tiny">Sua caixa de entrada está vazia — avance os dias para receber novidades.</div>
    </div>`;
  }
  return `<div class="panel latest-mail-panel" onclick="Game.openLatestMail('${latest.id}')">
    ${header}
    <div class="latest-mail-row">
      <div class="mail-row-icon">${MAIL_ICON[latest.type]||iconEnvelope(20)}</div>
      <div class="mail-row-body">
        <div class="mail-row-top"><span class="bold${latest.read?"":" latest-mail-unread"}">${esc(latest.subject)}</span><span class="tiny faint">${esc(latest.dayLabel)}</span></div>
        <div class="tiny dim mail-row-preview">${esc(latest.from)} — ${esc(latest.preview||"")}</div>
      </div>
    </div>
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
  return name ? clubCrestImg(name,16,null) : `<span style="width:16px;height:18px;display:inline-block;background:#ffffff14;border-radius:3px;"></span>`;
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
// reuses the same bracket primitives as renderKnockoutBracket() above — the Copa do Brasil
// knockout object just uses "copa_"-prefixed keys, so it's adapted into the {knockout:{r16,qf,sf,final}}
// shape those primitives expect rather than duplicating the whole rendering path.
function renderCopaBracket(){
  const cb = ST.copaDoBrasil;
  const comp = { knockout: { r16: cb.knockout.copa_r16, qf: cb.knockout.copa_qf, sf: cb.knockout.copa_sf, final: cb.knockout.copa_final } };
  const finalTie = effectiveFinal(comp);
  const finalIsUser = finalTie.home===ST.teamId || finalTie.away===ST.teamId;
  const champion = (cb.phase==="copa_done" && finalTie.played) ? (finalTie.hs>finalTie.as?finalTie.home:finalTie.away) : null;
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
  // the Copa do Brasil's own trophy — not the Libertadores cutout trophyImg() reaches for.
  return `<div class="bracket-wrap">
    <div class="bracket-side left">${bracketHalfHtml(comp,0)}</div>
    <div class="bracket-center-col">
      <div class="bracket-round-label gold">Final</div>
      ${competitionTrophyImg("copa", 54, champion?1:0.45)}
      ${finalBox}
      ${champion?`<div class="gold bold tiny tac mt8">CAMPEÃO</div>`:''}
    </div>
    <div class="bracket-side right">${bracketHalfHtml(comp,1)}</div>
  </div>`;
}
// the Sul-Americana panel — group table while s.phase is "sula_groups", otherwise the same
// bracket primitives renderCopaBracket() and renderKnockoutBracket() already use, just adapted
// into the {knockout:{r16,qf,sf,final}} shape those expect (identical 16-team/8-tie oitavas
// shape as both of those, so nothing about bracketHalfHtml/effectiveFinal needs to change).
function renderSulaCompetitionPanel(){
  const s = ST.sulamericana;
  if(s.phase==="sula_groups"){
    const g = sulaUserGroup();
    const standings = sulaGroupStandingsFor(g);
    return `<div class="faint tiny uc mb8">Grupo ${g} — Rodada ${Math.min(s.currentRound+1,6)}/6</div>${renderStandingsTable(standings)}`;
  }
  if(s.phase==="sula_done"){
    return `<div class="row" style="align-items:center;gap:10px;">
      ${clubCrestImg(s.champion,32,null)}
      <div><div class="faint tiny uc">Campeão</div><div class="bold gold">${esc(s.champion)}</div></div>
    </div>`;
  }
  const comp = { knockout: { r16: s.knockout.sula_r16, qf: s.knockout.sula_qf, sf: s.knockout.sula_sf, final: s.knockout.sula_final } };
  const finalTie = effectiveFinal(comp);
  const finalIsUser = finalTie.home===ST.teamId || finalTie.away===ST.teamId;
  const champion = (s.phase==="sula_final" && finalTie.played) ? (finalTie.hs>finalTie.as?finalTie.home:finalTie.away) : null;
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
      ${competitionTrophyImg("sulamericana", 54, champion?1:0.45)}
      ${finalBox}
      ${champion?`<div class="gold bold tiny tac mt8">CAMPEÃO</div>`:''}
    </div>
    <div class="bracket-side right">${bracketHalfHtml(comp,1)}</div>
  </div>`;
}
// same idea, for the Modo Completo Libertadores campaign — identical shape to renderSulaCompetitionPanel(),
// just reading ST.libertadoresCompleto and its own "lib_"-prefixed phases/trophy.
function renderLibCompletoCompetitionPanel(){
  const l = ST.libertadoresCompleto;
  if(l.phase==="lib_groups"){
    const g = libUserGroup();
    const standings = libGroupStandingsFor(g);
    return `<div class="faint tiny uc mb8">Grupo ${g} — Rodada ${Math.min(l.currentRound+1,6)}/6</div>${renderStandingsTable(standings)}`;
  }
  if(l.phase==="lib_done"){
    return `<div class="row" style="align-items:center;gap:10px;">
      ${clubCrestImg(l.champion,32,null)}
      <div><div class="faint tiny uc">Campeão</div><div class="bold gold">${esc(l.champion)}</div></div>
    </div>`;
  }
  const comp = { knockout: { r16: l.knockout.lib_r16, qf: l.knockout.lib_qf, sf: l.knockout.lib_sf, final: l.knockout.lib_final } };
  const finalTie = effectiveFinal(comp);
  const finalIsUser = finalTie.home===ST.teamId || finalTie.away===ST.teamId;
  const champion = (l.phase==="lib_final" && finalTie.played) ? (finalTie.hs>finalTie.as?finalTie.home:finalTie.away) : null;
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
      ${competitionTrophyImg("libertadores", 54, champion?1:0.45)}
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
      return `<div class="pslot ${p?'':'empty'}" style="left:${c.x}%;top:${c.y}%;--y:${c.y};" onclick="Game.openSlotPicker(${i})">
        <div class="jersey-card ${unavailable?'unavailable':''}${p?' has-face':''}">
          <div class="jersey-shirt">${slot==="GK"?shirtGK:shirtLine}${p?playerFaceImg(p,40,"pface-over"):""}</div>
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
    <td class="bold"><span class="pface-cell">${playerFaceImg(p,30)}<span>${esc(p.name)} <span class="faint tiny">${p.nat}</span></span></span></td>
    <td>${posBadges(p)}</td>
    <td class="tac">${p.age}</td>
    <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
    <td class="tac"><span class="ovr-chip ${ovrClass(p.pot)}">${p.pot}</span></td>
    <td class="tac mono">${fmtMoney(p.value)}</td>
    <td>${statusBadges(p)||'<span class="faint tiny">Disponível</span>'}</td>
    <td>
      ${showSellBtn?(sellLocked(p)?`<button class="btn btn-sm" disabled title="${esc(sellLockMsg(p))}">🔒 Próx. temporada</button>`:`<button class="btn btn-sm btn-danger" onclick="Game.sellPlayer(${p.id})">Vender</button>`):""}
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
  ensurePrelibMarket();

  const modeToggle = `<div class="btn-row xfer-mode-toggle">
    <button class="btn ${mode==='buy'?'btn-gold':''}" onclick="Game.setXferFilter('mode','buy')">Contratar</button>
    <button class="btn ${mode==='sell'?'btn-gold':''}" onclick="Game.setXferFilter('mode','sell')">Vender</button>
  </div>`;

  return `<div class="xfer-page">${modeToggle}${mode==="sell" ? renderXferSellSubTab(f) : renderXferBuySubTab(f)}</div>`;
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
// the "Potencial" cell for a market row: locked (button to start observing), in progress
// (days left), or revealed (the real Pot chip) — see the OBSERVAR mechanic above.
function renderPotCell(teamKey, p){
  if(isObserved(teamKey, p.id)) return `<span class="ovr-chip ${ovrClass(p.pot)}">${p.pot}</span>`;
  const q = queuedObservation(teamKey, p.id);
  if(q) return `<span class="tiny faint">🔎 ${q.daysLeft}d</span>`;
  return `<button class="btn btn-sm" onclick="Game.observePlayer(${p.id},'${escJs(teamKey)}')">🔒 Observar</button>`;
}
// a club of the Brazilian pyramid (squad in the world with country "Brasil", or listed in the Brazilian data sets)
function isBrazilianClubName(name){
  const t = ST.world && ST.world.teams && ST.world.teams[name];
  if(t) return t.country==="Brasil";
  return SERIE_A_2026.indexOf(name)>=0;
}
function renderXferBuySubTab(f){
  const source = f.source || "libertadores";
  const posOptions = ["GK","CB","LB","RB","DMF","CM","AM","LM","RM","LW","RW","ST"];
  const toggle = `<div class="btn-row xfer-source-toggle">
    <button class="btn btn-sm ${source==='libertadores'?'btn-gold':''}" onclick="Game.setXferFilter('source','libertadores')">${ST.mode==="brasileirao"?"Times do Brasileirão":"Times da Libertadores"}</button>
    <button class="btn btn-sm ${source==='global'?'btn-gold':''}" onclick="Game.setXferFilter('source','global')">${ST.mode==="brasileirao"?"Mercado Internacional":"Mercado Global"}</button>
    <button class="btn btn-sm ${source==='fa'?'btn-gold':''}" onclick="Game.setXferFilter('source','fa')">Free Agents</button>
  </div>`;

  if(source==="fa"){
    ensureGlobalMarket();
    let list = ST.world.globalMarket.filter(isFreeAgent);
    if(f.pos!=="ALL") list = list.filter(p=>p.pos===f.pos);
    if(f.ageMin!=null) list = list.filter(p=>p.age>=f.ageMin);
    if(f.ageMax!=null) list = list.filter(p=>p.age<=f.ageMax);
    if(f.q){ const q = f.q.toLowerCase(); list = list.filter(p=>p.name.toLowerCase().includes(q) || (p.nat||"").toLowerCase().includes(q)); }
    list = sortXferList(list, f.sort);
    const {shown, page, totalPages} = paginateXferList(list, f.page);
    return `${toggle}
    <div class="xfer-layout">
      <aside class="xfer-sidebar">
        <div class="xfer-filter-label" style="margin-bottom:10px;">Filtros</div>
        ${renderXferSidebar(f, posOptions, null)}
      </aside>
      <div class="xfer-main">
        <div class="dim tiny mb8">Jogadores sem clube: você paga só a <b>taxa de contratação + o salário</b>, não o valor de mercado — o salário aparece ao abrir a contratação. Os clubes também contratam: quem demora, perde. Mostrando ${shown.length} de ${list.length}. Orçamento: <span class="gold bold">${fmtMoney(ST.budget)}</span></div>
        <div class="scroll-x"><table class="data data-fit data-fa"><thead><tr>
          <th>Jogador</th><th>Pos</th><th class="tac">Idade</th><th class="tac">OVR</th><th class="tac">Potencial</th><th class="tac">Taxa</th><th></th>
        </tr></thead><tbody>
        ${shown.map(p=>{ const c = freeAgentCost(p), ok = freeAgentWillSign(p); return `<tr>
          <td class="bold"><span class="pface-cell">${playerFaceImg(p,30)}<span>${esc(p.name)} <span class="faint tiny">${esc(p.nat)}</span></span></span></td>
          <td>${posBadges(p)}</td>
          <td class="tac">${p.age}</td>
          <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
          <td class="tac">${renderPotCell("global",p)}</td>
          <td class="tac mono gold bold">${fmtMoney(c.fee)}</td>
          <td>${ok ? `<button class="btn btn-sm btn-gold" onclick="Game.openFaModal(${p.id})">Contratar</button>` : `<span class="faint tiny" title="Não aceita um clube desse nível">Recusa</span>`}</td>
        </tr>`; }).join("")}
        </tbody></table></div>
        ${renderXferPagination(page, totalPages)}
      </div>
    </div>`;
  }

  if(source==="global"){
    let list = ST.world.globalMarket.filter(p=>!isFreeAgent(p));
    let intlTeams = null;
    if(ST.mode==="brasileirao"){
      // the foreign Libertadores / Sul-Americana clubs (and the Pré-Libertadores pool) are INTERNATIONAL market: they live here, not under "Times do Brasileirão"
      ensurePrelibMarket();
      const foreign = [];
      Object.values(ST.world.teams).forEach(t=>{ if(t.isNation || t.country==="Brasil" || t.name===ST.teamId) return; t.players.forEach(p=>foreign.push(Object.assign({}, p, {club:t.name, _team:t.name}))); });
      (ST.world.prelibMarket||[]).forEach(p=>{ if(!isBrazilianClubName(p.club)) foreign.push(Object.assign({}, p, {_team:p.club})); });
      list = list.concat(foreign);
      // club picker: every club that has a squad here (Boca, River, Peñarol...) — pick one to see its whole team
      intlTeams = Array.from(new Set(foreign.map(p=>p._team))).sort();
      if(f.team && f.team!=="ALL" && intlTeams.includes(f.team)) list = list.filter(p=>p._team===f.team || p.club===f.team); // market players listed under the same club name (e.g. Estudiantes) show up with the squad too
    }
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
        ${renderXferSidebar(f, posOptions, intlTeams, "Jogador, clube ou país...")}
      </aside>
      <div class="xfer-main">
        <div class="dim tiny mb8">${iconGlobe(13)} ${ST.mode==="brasileirao"?"Clubes e jogadores de fora do Brasil — inclui os times da Libertadores e da Sul-Americana.":"Jogadores de fora da Libertadores — não disputam a competição, mas podem ser contratados."} Mostrando ${shown.length} de ${list.length}. Orçamento: <span class="gold bold">${fmtMoney(ST.budget)}</span></div>
        <div class="scroll-x"><table class="data data-fit"><thead><tr>
          <th>Jogador</th><th>Clube</th><th>Pos</th><th class="tac">Idade</th><th class="tac">OVR</th><th class="tac">Potencial</th><th class="tac">Valor</th><th></th>
        </tr></thead><tbody>
        ${shown.map(p=>`<tr>
          <td class="bold"><span class="pface-cell">${playerFaceImg(p,30)}<span>${esc(p.name)} <span class="faint tiny">${esc(p.nat)}</span></span></span></td>
          <td class="dim"><span style="display:inline-flex;align-items:center;gap:7px;">${clubCrestImg(p.club,20,p.name)}<span>${esc(p.club)}</span></span></td>
          <td>${posBadges(p)}</td>
          <td class="tac">${p.age}</td>
          <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
          <td class="tac">${renderPotCell("global",p)}</td>
          <td class="tac mono">${fmtMoney(p.value)}</td>
          <td><button class="btn btn-sm btn-gold" onclick="Game.openBuyModal(${p.id},'${p._team?escJs(p._team):"global"}')">Propor</button></td>
        </tr>`).join("")}
        </tbody></table></div>
        ${renderXferPagination(page, totalPages)}
      </div>
    </div>
    `;
  }

  ensurePrelibMarket();
  const brMode = ST.mode==="brasileirao";
  // in a Brasileirão career this tab is the BRAZILIAN market only; the foreign clubs are under "Mercado Internacional"
  const teamOptions = (brMode ? Object.keys(ST.world.teams).filter(n=>isBrazilianClubName(n)) : Array.from(new Set(Object.keys(ST.world.teams).concat(PRELIB_MARKET_TEAM_NAMES)))).sort();
  let list = allPlayersList(ST.teamId).filter(x=>!brMode || isBrazilianClubName(x.team)).map(x=>Object.assign({}, x.p, {_team:x.team}))
    .concat(brMode ? [] : ST.world.prelibMarket.map(p=>Object.assign({}, p, {_team:p.club})));
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
      <div class="scroll-x"><table class="data data-fit"><thead><tr>
        <th>Jogador</th><th>Time</th><th>Pos</th><th class="tac">Idade</th><th class="tac">OVR</th><th class="tac">Potencial</th><th class="tac">Valor</th><th></th>
      </tr></thead><tbody>
      ${shown.map(p=>`<tr>
        <td class="bold"><span class="pface-cell">${playerFaceImg(p,30)}<span>${esc(p.name)} <span class="faint tiny">${p.nat}</span></span></span></td>
        <td class="dim"><span style="display:inline-flex;align-items:center;gap:7px;">${clubCrestImg(p._team,20,p.name)}<span>${esc(p._team)}</span></span></td>
        <td>${posBadges(p)}</td>
        <td class="tac">${p.age}</td>
        <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
        <td class="tac">${renderPotCell(p._team,p)}</td>
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
  const level = ST.scoutLevel||1;
  const nextCost = level<5 ? SCOUT_LEVEL_COST[level+1] : null;
  const levelBadge = `<div class="scout-level-badge">
    <div class="faint tiny uc" style="text-align:right;">Rede de Olheiros</div>
    <div class="bold gold">${iconRadar(14)} Nível ${level} — ${SCOUT_LEVEL_LABELS[level]}</div>
    ${nextCost!=null
      ? `<button class="btn btn-sm mt8" ${ST.budget<nextCost?"disabled":""} onclick="Game.upgradeScout()">Subir p/ nível ${level+1} (${fmtMoney(nextCost)})</button>`
      : `<div class="tiny faint mt8">Nível máximo</div>`}
  </div>`;
  const canRequest = !ST.scoutReportETA && (!ST.scoutReport || ST.matchesPlayedTotal>ST.scoutLastReportMatchCount);
  let statusPanel = "";
  if(ST.scoutReportETA){
    statusPanel = `<div class="empty-state">
      <p>🔎 Seu olheiro está em campo — o relatório fica pronto em <b class="gold">${ST.scoutReportETA.daysLeft}</b> dia(s).</p>
      <p class="dim small">Avance os dias na aba Competição para o tempo passar.</p>
    </div>`;
  } else if(!ST.scoutReport){
    statusPanel = `<div class="empty-state">
      <p>Seu departamento de olheiros ainda não gerou nenhum relatório.</p>
      <button class="btn btn-gold" onclick="Game.generateScout()">Pedir relatório de olheiros (${SCOUT_REPORT_DAYS[level]} dia${SCOUT_REPORT_DAYS[level]===1?"":"s"})</button>
    </div>`;
  }
  const rows = ST.scoutReport ? ST.scoutReport.map(r=>{
    const p = playerById(r.team, r.playerId);
    if(!p) return "";
    const t = ST.world.teams[r.team];
    const ask = askingPrice(p, t);
    return `<tr>
      <td class="bold"><span class="pface-cell">${playerFaceImg(p,30)}<span>${esc(p.name)}</span></span></td>
      <td>${posBadges(p)}</td>
      <td class="tac">${p.age}</td>
      <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
      <td class="tac"><span class="ovr-chip ${ovrClass(p.pot)}">${p.pot}</span></td>
      <td>${t.flag} ${esc(p.nat)}</td>
      <td class="dim"><span style="display:inline-flex;align-items:center;gap:7px;">${clubCrestImg(r.team,20,p.name)}<span>${esc(r.team)}</span></span></td>
      <td class="tac mono">${fmtMoney(ask)}</td>
      <td class="tac">${scoutStars(p)}</td>
      <td><button class="btn btn-sm btn-gold" onclick="Game.openBuyModal(${p.id},'${escJs(r.team)}')">Propor</button></td>
    </tr>`;
  }).join("") : "";
  return `<div class="row between mb16">
    <div>
      <div class="panel-title" style="margin:0;">Jogadores Promissores</div>
      <div class="faint tiny">Jovens talentos ao redor do continente — cada relatório novo custa dias e pelo menos 1 partida desde o anterior.</div>
    </div>
    ${levelBadge}
  </div>
  ${statusPanel}
  ${ST.scoutReport ? `
  <div class="scroll-x"><table class="data"><thead><tr>
    <th>Jogador</th><th>Pos</th><th class="tac">Idade</th><th class="tac">Ger</th><th class="tac">Pot</th><th>Nacionalidade</th><th>Clube</th><th class="tac">Valor</th><th class="tac">Observação</th><th></th>
  </tr></thead><tbody>
  ${rows}
  </tbody></table></div>
  <div class="row mt16">
    <button class="btn btn-sm" ${canRequest?"":"disabled"} onclick="Game.generateScout()">🔄 Pedir novo relatório (${SCOUT_REPORT_DAYS[level]}d)</button>
    ${!canRequest && !ST.scoutReportETA ? `<span class="tiny faint">Jogue pelo menos mais 1 partida antes de pedir outro.</span>` : ""}
  </div>` : ""}`;
}

// ---------------- MEU CLUBE TAB ----------------
// average rating, formatted, or an em-dash when the player never actually took the pitch
// in the selected scope.
function fmtAvgRating(rec){ return rec.ratingCount>0 ? (rec.ratingSum/rec.ratingCount).toFixed(1) : "—"; }
function fmtInjurySummary(rec){
  if(!rec.injuries.length) return `<span class="faint">—</span>`;
  const days = rec.injuries.reduce((a,i)=>a+i.days,0);
  const games = rec.injuries.reduce((a,i)=>a+i.games,0);
  return `${rec.injuries.length} · ~${days}d/${games}j`;
}
function renderStatLeaders(rows, key, label){
  const top = rows.filter(r=>r[key]>0).sort((a,b)=>b[key]-a[key]).slice(0,5);
  if(!top.length) return `<div class="panel"><div class="panel-title">${label}</div><div class="faint tiny">Nenhum registro neste recorte.</div></div>`;
  return `<div class="panel">
    <div class="panel-title">${label}</div>
    ${top.map((r,i)=>`<div class="kv"><span>${i+1}. ${esc(r.name)}</span><span class="bold gold">${r[key]}</span></div>`).join("")}
  </div>`;
}
function renderMeuClubeTab(){
  const cc = ensureClubCareer();
  const seasonYears = Object.keys(cc.seasons).map(Number).sort((a,b)=>b-a);
  const scope = ST.clubStatsScope==="career" ? "career" : "season";
  const selectedYear = seasonYears.includes(ST.clubStatsYear) ? ST.clubStatsYear : ST.seasonYear;
  const statsMap = scope==="career" ? clubCareerTotals() : ((cc.seasons[String(selectedYear)]||{players:{}}).players);
  const rows = Object.values(statsMap);

  const scopeToggle = `<div class="btn-row mb16">
    <button class="btn ${scope==="season"?"btn-gold":""}" onclick="Game.setClubStatsScope('season')">Temporada</button>
    <button class="btn ${scope==="career"?"btn-gold":""}" onclick="Game.setClubStatsScope('career')">Carreira no ${esc(ST.teamId)}</button>
  </div>`;
  const yearPicker = (scope==="season" && seasonYears.length>1)
    ? `<select class="input-inline mb16" onchange="Game.setClubStatsYear(this.value)">
        ${seasonYears.map(y=>`<option value="${y}" ${y===selectedYear?"selected":""}>Temporada ${y}</option>`).join("")}
      </select>`
    : "";

  if(!seasonYears.length){
    return `${scopeToggle}<div class="empty-state">Ainda não há partidas registradas nesta temporada — as estatísticas aparecem aqui assim que você jogar.</div>`;
  }

  // "todos os jogadores": the current squad, each row pulling whatever record exists for the
  // selected scope (0s for anyone who hasn't played yet, e.g. a signing made mid-season).
  const squad = myTeam().players.slice().sort((a,b)=>b.ovr-a.ovr);
  const playerRows = squad.map(p=>{
    const rec = statsMap[String(p.id)] || {apps:0, goals:0, assists:0, yellow:0, red:0, ratingSum:0, ratingCount:0, injuries:[]};
    return `<tr>
      <td class="bold"><span class="pface-cell">${playerFaceImg(p,30)}<span>${esc(p.name)}</span></span></td>
      <td>${posBadges(p)}</td>
      <td class="tac">${rec.apps}</td>
      <td class="tac gold bold">${rec.goals}</td>
      <td class="tac">${rec.assists}</td>
      <td class="tac mono">${fmtAvgRating(rec)}</td>
      <td class="tac"><span class="card-chip card-yellow">${rec.yellow}</span></td>
      <td class="tac"><span class="card-chip card-red">${rec.red}</span></td>
      <td class="tac tiny">${fmtInjurySummary(rec)}</td>
    </tr>`;
  }).join("");

  return `${scopeToggle}${yearPicker}
  <div class="competicao-grid mb16">
    <div class="competicao-cell">${renderStatLeaders(rows,"goals","Artilheiros")}</div>
    <div class="competicao-cell">${renderStatLeaders(rows,"assists","Líderes de Assistência")}</div>
  </div>
  <div class="panel">
    <div class="panel-title">Elenco — ${scope==="career"?`Carreira no ${esc(ST.teamId)}`:`Temporada ${selectedYear}`}</div>
    <div class="scroll-x"><table class="data"><thead><tr>
      <th>Jogador</th><th>Pos</th><th class="tac">J</th><th class="tac">Gols</th><th class="tac">Assist.</th><th class="tac">Nota</th><th class="tac">CA</th><th class="tac">CV</th><th class="tac">Lesões</th>
    </tr></thead><tbody>
    ${playerRows}
    </tbody></table></div>
  </div>`;
}

// ---------------- E-MAIL TAB ----------------
const MAIL_ICON = { offer: iconCoin(20), injury: iconMedical(20), scout: iconMagnifier(20), job: iconBriefcase(20), nacional: iconBriefcase(20) };
function renderEmailTab(){
  const open = ST.openMailId ? findMail(ST.openMailId) : null;
  if(open) return renderMailDetail(open);
  const box = inboxList();
  if(!box.length){
    return `<div class="empty-state"><p>Sua caixa de entrada está vazia.</p><p class="dim small">Clique em AVANÇAR DIA na aba Competição para receber propostas, boletins médicos e relatórios de olheiro.</p></div>`;
  }
  const toolbar = `<div class="btn-row mail-toolbar">
    <button class="btn btn-sm" onclick="Game.markAllMailRead()">✓ Marcar tudo como lido</button>
    <button class="btn btn-sm btn-danger" onclick="Game.clearInboxConfirm()">🗑 Limpar caixa de entrada</button>
  </div>`;
  return `${toolbar}<div class="mail-list">${box.map(renderMailRow).join("")}</div>`;
}
function renderMailRow(m){
  const rowIcon = (m.type==="offer" && m.payload && m.payload.club)
    ? clubCrestImg(m.payload.club, 20, m.payload.playerName)
    : (m.type==="nacional" && m.payload && m.payload.code) ? wcFlagImg(m.payload.code, 22)
    : (MAIL_ICON[m.type]||iconEnvelope(20));
  return `<div class="mail-row${m.read?"":" unread"}" onclick="Game.openMail('${m.id}')">
    <div class="mail-row-icon">${rowIcon}</div>
    <div class="mail-row-body">
      <div class="mail-row-top"><span class="bold">${esc(m.subject)}</span><span class="tiny faint">${esc(m.dayLabel)}</span></div>
      <div class="tiny dim mail-row-preview">${esc(m.from)} — ${esc(m.preview||"")}</div>
    </div>
    ${!m.read?'<div class="mail-dot"></div>':""}
  </div>`;
}
function renderMailDetail(m){
  const header = `<div class="mail-detail-head">
    <button class="btn btn-sm" onclick="Game.closeMail()">← Voltar</button>
    <div class="mail-detail-meta">
      <div class="bold">${esc(m.subject)}</div>
      <div class="tiny faint">${esc(m.from)} · ${esc(m.dayLabel)}</div>
    </div>
  </div>`;
  if(m.type==="offer") return header + renderOfferMailBody(m);
  if(m.type==="nacional") return header + renderNationalMailBody(m);
  if(m.type==="totw") return header + renderTotwMailBody(m.payload);
  return `${header}<div class="panel mt16">${m.body}</div>`;
}
// "Time da Semana" e-mail body — the same mixed-club 4-3-3 pitch used for "Seleção da
// Temporada" (see renderMixedXIPitch()), just for one round/leg instead of a whole season.
function renderTotwMailBody(payload){
  return `<div class="panel mt16">
    <img src="${SOFASCORE_LOGO}" alt="Sofascore" class="totw-brand-logo"/>
    <div class="panel-title">Seleção da Semana — ${esc(payload.compLabel)}</div>
    <p class="dim small mt8">O Sofascore escolheu os destaques da rodada. Você tem representante(s) nessa seleção!</p>
    <div class="mt16">${renderMixedXIPitch(payload.xi)}</div>
  </div>`;
}
// generic "pitch of 11 players, possibly from different clubs" renderer — reused for Time da
// Semana (the e-mail above) and Time da Temporada (season-end modal). xi is an array of 11
// entries aligned with E.FORMATIONS["4-3-3"]/FORMATION_COORDS["4-3-3"], each either null or
// {id,name,team,pos,rating|avgRating} — same jersey/pitch look as the Elenco tab's own lineup,
// just with each slot wearing ITS player's own club shirt instead of one team's kit throughout.
function renderMixedXIPitch(xi){
  const slots = E.FORMATIONS["4-3-3"];
  const coords = FORMATION_COORDS["4-3-3"];
  return `<div class="pitch">
    <div class="pitch-center"></div>
    ${slots.map((slot,i)=>{
      const p = xi[i];
      const c = coords[i];
      const shirt = p ? jerseyImage(p.team, slot==="GK", 30) : "";
      const rating = p ? (p.avgRating!=null ? p.avgRating : p.rating) : null;
      return `<div class="pslot ${p?'':'empty'}" style="left:${c.x}%;top:${c.y}%;--y:${c.y};cursor:default;">
        <div class="jersey-card${p?' has-face':''}">
          <div class="jersey-shirt">${shirt}${p?playerFaceImg(p,40,"pface-over"):""}</div>
          <div class="jersey-stats">
            <span class="jersey-pos">${slot}</span>
            <span class="jersey-ovr">${rating!=null?rating.toFixed(1):'—'}</span>
          </div>
        </div>
        <div class="pname">${p?esc(p.name.split(' ').slice(-1)[0]):'Vazio ('+slot+')'}</div>
        ${p?`<div class="totw-club">${clubCrestImg(p.team,12,null)}<span>${esc(p.team)}</span></div>`:''}
      </div>`;
    }).join("")}
  </div>`;
}
// ---------- DIRECTOR'S MOOD BAR ----------
// One persistent bar per negotiation (key). The number comes straight from the negotiation engine's mood (0-100);
// the bar only SHOWS it. The previous value shown for each key is remembered so that, after every re-render, the
// fill glides from the old level to the new one and the score counts up/down (animateMoodBars below).
const MOOD_SHOWN = {};
function renderMoodBar(key, mood, ended){
  const m = E.clamp(Math.round(mood==null ? NEG_CONFIG.startMood : mood), 0, 100);
  const from = MOOD_SHOWN[key]==null ? m : MOOD_SHOWN[key];
  const band = moodBand(m);
  return `<div class="mood-card" data-key="${esc(key)}" data-from="${from}" data-to="${m}" data-band="${band.id}">
    <div class="mood-title">Humor do diretor</div>
    <div class="mood-row"><span class="mood-state" style="color:${band.color}">${esc(band.label.toUpperCase())}</span><span class="mood-score" style="color:${band.color}"><b class="mood-num">${from}</b>/100</span></div>
    <div class="mood-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m}" aria-label="Humor do diretor"><div class="mood-fill" style="clip-path:inset(0 ${100-from}% 0 0)"></div></div>
    <div class="mood-legend"><span>0 — Furioso</span><span>100 — Muito satisfeito</span></div>
    <div class="mood-face">“${esc(moodLine(m, ended))}”</div>
    <div class="mood-summary">${esc(moodSummary(m))}</div>
  </div>`;
}
function animateMoodBars(){
  if(typeof document==="undefined") return;
  document.querySelectorAll(".neg-thread").forEach(t=>{ t.scrollTop = t.scrollHeight; });
  document.querySelectorAll(".mood-card").forEach(card=>{
    const el = card as HTMLElement;
    const key = el.dataset.key||"", from = Number(el.dataset.from), to = Number(el.dataset.to);
    MOOD_SHOWN[key] = to;
    const fill = el.querySelector(".mood-fill") as HTMLElement, num = el.querySelector(".mood-num") as HTMLElement;
    if(!fill || !num) return;
    const apply = ()=>{ fill.style.clipPath = `inset(0 ${100-to}% 0 0)`; };
    if(from===to){ apply(); num.textContent = String(to); return; }
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      apply();
      const t0 = performance.now(), dur = 750;
      const step = (t)=>{ const k = Math.min(1,(t-t0)/dur); num.textContent = String(Math.round(from+(to-from)*(1-Math.pow(1-k,3)))); if(k<1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      const delta = to-from;
      if(delta<=-15){ el.classList.add("mood-shake"); setTimeout(()=>el.classList.remove("mood-shake"), 650); }
      if(delta>=10){ el.classList.add("mood-boost"); setTimeout(()=>el.classList.remove("mood-boost"), 1100); }
    }));
  });
}
function offerStatusBanner(pl){
  if(pl.status==="accepted") return `<div class="mail-status mail-status-good">✅ Venda concluída — ${fmtMoney(pl.offer)} creditados ao orçamento.</div>`;
  if(pl.status==="rejected") return `<div class="mail-status">Você recusou esta proposta.</div>`;
  if(pl.status==="withdrawn") return pl.expiredNoReply
    ? `<div class="mail-status mail-status-bad">⏰ Você não respondeu à proposta dentro do prazo de 7 dias — o clube retirou a oferta.</div>`
    : `<div class="mail-status mail-status-bad">O clube retirou a proposta após a negociação.</div>`;
  if(pl.status==="superseded") return `<div class="mail-status">Substituída por uma proposta mais recente.</div>`;
  if(pl.status==="void") return `<div class="mail-status mail-status-bad">O jogador já não está mais disponível.</div>`;
  if(pl.status==="awaiting_reply") return `<div class="mail-status">⏳ O clube pediu um tempo para pensar — responde em até ${pl.pendingReplyDays||1} dia(s). Avance os dias em Competição para receber a resposta.</div>`;
  if(pl.status==="answered") return `<div class="mail-status">Essa negociação já teve resposta — confira o e-mail mais recente na caixa de entrada.</div>`;
  return "";
}
function renderOfferMailBody(m){
  const pl = m.payload;
  const posture = offerPosture(pl);
  const estMax = Math.round(offerNegCeiling(pl)/5000)*5000;
  const pct = Math.round((pl.offer/pl.value-1)*100);
  const thread = (m.thread||[]).map(t=>`<div class="mail-thread-line">"${esc(t)}"</div>`).join("");
  const pending = pl.status==="pending";
  const range = offerAskRange(pl);
  const lastAsk = pl.neg && pl.neg.prevX ? pl.neg.prevX : null;     // after the first round, suggest meeting the club a bit of the way
  const suggested = E.clamp(Math.round((lastAsk ? pl.offer+(lastAsk-pl.offer)*0.6 : pl.offer*1.2)/5000)*5000, range.minAsk, range.maxAsk);
  return `<div class="panel mt16">
    <div class="row" style="justify-content:space-between;align-items:flex-start;">
      <div class="row" style="gap:10px;align-items:center;">
        ${clubCrestImg(pl.club, 36, pl.playerName)}
        <div><div class="faint tiny uc">Clube interessado</div><div class="bold">${esc(pl.club)}</div></div>
      </div>
      <div class="tar"><div class="faint tiny uc">Jogador</div><div class="bold">${esc(pl.playerName)}</div></div>
    </div>
    <div class="contract-kv mt12"><span>Valor de mercado</span><span>${fmtMoney(pl.value)}</span></div>
    <div class="contract-kv"><span>Proposta atual</span><span class="gold bold">${fmtMoney(pl.offer)}</span></div>
    <div class="contract-kv"><span>Acima do valor</span><span class="${pct>=0?"green":"red"} bold">${pct>=0?"+":""}${pct}%</span></div>
    ${pending?`<div class="mail-posture-hint mt12">
      <b>${esc(posture.label)}.</b> Estimativa: dá pra chegar a cerca de
      <b class="gold">${fmtMoney(estMax)}</b>. Contrapropostas razoáveis fazem parte da conversa — o diretor só perde a paciência se você insistir em valores muito acima do que o clube pode pagar.
    </div>
    ${renderMoodBar("mail-"+m.id, pl.mood, pl.status==="withdrawn")}
    ${pl.userReplyDaysLeft!=null?`<div class="tiny faint uc mt8" style="letter-spacing:.04em;">⏰ Expira em ${pl.userReplyDaysLeft} dia${pl.userReplyDaysLeft===1?"":"s"} se não for respondida</div>`:""}`:""}
    ${thread?`<div class="mt12">${thread}</div>`:""}
    ${offerStatusBanner(pl)}
    ${pending?`
    <div class="btn-row mt16">
      <button class="btn btn-gold grow" onclick="Game.acceptMailOffer('${m.id}')">✒️ Aceitar (${fmtMoney(pl.offer)})</button>
    </div>
    <div class="mt16">
      <div class="tiny faint uc mb8">Pedir outro valor — entre ${fmtMoney(range.minAsk)} e ${fmtMoney(range.maxAsk)}</div>
      <div class="row" style="gap:8px;">
        <input id="askInput_${m.id}" type="text" inputmode="numeric" class="input-inline grow" value="${String(suggested).replace(/\B(?=(\d{3})+(?!\d))/g,".")}" oninput="Game.updateAskWords(this,'${m.id}')"/>
        <button class="btn btn-sm" onclick="Game.negotiateOfferFromInput('${m.id}')">Pedir esse valor</button>
      </div>
      <div id="askWords_${m.id}" class="tiny faint mt4">${esc(numberToWordsPT(suggested))}</div>
    </div>
    <div class="btn-row mt16">
      <button class="btn btn-sm btn-danger" onclick="Game.rejectMailOffer('${m.id}')">Recusar</button>
    </div>`:""}
  </div>`;
}

// ---------------- MATCH DAY ----------------
const EVENT_ICON = { goal:"⚽", miss:"🚫", save:"🧤", block:"🛑", yellow:"🟨", red:"🟥", injury:"🚑", penalty_pending:"🎯" };
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
      <span title="${esc(homeName)}">${clubCrestImg(homeName,20,null)}</span>
      <span title="${esc(awayName)}">${clubCrestImg(awayName,20,null)}</span>
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
  if(ev.penalty){
    const verb = ev.type==="goal" ? "GOL DE PÊNALTI!" : "PÊNALTI PERDIDO!";
    return `<b>${verb}</b> ${esc(ev.flavor||ev.player)} — ${esc(team)}`;
  }
  switch(ev.type){
    case "goal": return `<b>GOL!</b> ${esc(ev.player)} balança as redes${ev.assist?` (assistência de ${esc(ev.assist)})`:''} — ${esc(team)}`;
    case "miss": return `${esc(ev.player)} chuta para fora`;
    case "save": return `${esc(ev.gk)} faz grande defesa em finalização de ${esc(ev.player)}`;
    case "block": return `Finalização de ${esc(ev.player)} é bloqueada`;
    case "yellow": return `Cartão amarelo para ${esc(ev.player)} (${esc(team)})`;
    case "red": return `<b>CARTÃO VERMELHO!</b> ${esc(ev.player)} é expulso (${esc(team)})`;
    case "injury": return `${esc(ev.player)} sente lesão e sai de campo (fora por ${ev.matchesOut} jogo(s))`;
    case "penalty_pending": return `Pênalti será cobrado por ${esc(team)}...`;
    default: return esc(ev.type);
  }
}

// ---- match screen, "Arena" look: rounded dark cards, big yellow score with a minute pill, feed of rounded rows,
// and the two line-ups on green striped pitches on the SIDES of the match ----
function mxFormationKey(slots){
  for(const k in E.FORMATIONS){ if(E.FORMATIONS[k].join()===slots.join()) return k; }
  return "4-3-3";
}
function mxShortName(n){ const t = String(n||"").trim().split(/\s+/); return t.length>1 ? t[t.length-1] : (t[0]||""); }
// strengths of a line-up (average overall per line), like the "ATA · MEI · DEF · GOL" tag of the Arena
function mxLines(teamName, lineup, slots){
  const t = ST.world.teams[teamName];
  const ovr = p => { if(!p) return 0; const f = t && t.players.find(x=>x.id===p.id); return f ? f.ovr : (p.ovr||0); };
  const avg = g => { const a = lineup.map((p,i)=>p && E.POS_GROUP[slots[i]]===g ? ovr(p) : null).filter(v=>v); return a.length ? Math.round(a.reduce((x,y)=>x+y,0)/a.length) : 0; };
  return {att:avg("ATT"), mid:avg("MID"), def:avg("DEF"), gk:avg("GK")};
}
function renderMxPitch(lineup, slots, opts){
  opts = opts || {};
  const coords = FORMATION_COORDS[mxFormationKey(slots)] || FORMATION_COORDS["4-3-3"];
  return `<div class="mx-pitch"><i class="mx-box"></i><i class="mx-mid"></i>${lineup.map((p,i)=>{
    const c = coords[i]; if(!c) return "";
    if(!p) return `<div class="mx-pl empty" style="left:${c.x}%;top:${c.y}%"><span class="mx-face mx-plus">+</span><small>${slots[i]}</small></div>`;
    const ic = opts.icons ? opts.icons(p) : "";
    return `<div class="mx-pl${opts.sentOff&&opts.sentOff(p)?' off':''}" style="left:${c.x}%;top:${c.y}%" title="${esc(p.name)} · ${slots[i]}"><span class="mx-face">${playerFaceImg(p,32)}${ic?`<em class="mx-ic">${ic}</em>`:""}</span><b>${esc(mxShortName(p.name))}</b><small>${slots[i]}</small></div>`;
  }).join("")}</div>`;
}
function renderMxSide(teamName, pitchHtml, tag){
  return `<section class="mx-side mx-card">
    <h4 class="mx-h">${clubCrestImg(teamName,22,null)}<span>${esc(teamName)}</span></h4>
    ${tag?`<div class="mx-rt">${tag}</div>`:""}
    ${pitchHtml}
  </section>`;
}
function renderMatch(){
  const pm = ST.pendingMatch;
  const home = pm.ref.home, away = pm.ref.away;
  const stageLblType = (pm.context.type==="copa"||pm.context.type==="sula"||pm.context.type==="lib") ? pm.context.phase : pm.context.type==="wc" ? "wc_"+pm.context.evKey : pm.context.type;
  const stageLbl = stageLabelFor(stageLblType) + (pm.context.legIndex!=null ? ` — jogo de ${pm.context.legIndex===0?'ida':'volta'}` : ((stageLblType==="final"||stageLblType==="copa_final"||stageLblType==="sula_final"||stageLblType==="lib_final"||stageLblType==="ic_semi"||stageLblType==="ic_final"||String(stageLblType).indexOf("wc_")===0||String(stageLblType).indexOf("prelib_")===0)?" — jogo único":""));
  if(!pm.result){
    const lp = lineupPlayers();
    const missing = lp.filter(p=>!p).length;
    const unavailable = lp.filter(p=>p && (p.injured||p.suspended)).length;
    const speed = ST.matchSpeed || "normal";
    const speedBtn = (id,label)=>`<button class="btn btn-sm${speed===id?' btn-gold':''}" onclick="Game.setMatchSpeed('${id}')">${label}</button>`;
    const userIsHomePre = home===ST.teamId;
    const mySlots = E.FORMATIONS[ST.formation] || E.FORMATIONS["4-3-3"];
    const rt = mxLines(ST.teamId, lp, mySlots);
    const myTag = `ATA ${rt.att} · MEI ${rt.mid} · DEF ${rt.def} · GOL ${rt.gk} · ${esc(ST.formation)}`;
    const myPitch = renderMxSide(ST.teamId, renderMxPitch(lp, mySlots, {}), myTag);
    const oppName = userIsHomePre ? away : home;
    const oppSide = `<section class="mx-side mx-card"><h4 class="mx-h">${clubCrestImg(oppName,22,null)}<span>${esc(oppName)}</span></h4>
      <div class="mx-rt">&nbsp;</div>
      <div class="mx-pitch mx-hidden"><i class="mx-box"></i><i class="mx-mid"></i><div class="mx-hidden-msg">A escalação do adversário só aparece quando a bola rolar.</div></div></section>`;
    return `
    <div class="mx-wrap">
      ${userIsHomePre ? myPitch : oppSide}
      <div class="mx-center mx-card">
        <div class="mx-stage">${esc(stageLbl)}</div>
        <div class="mx-score">
          <div class="mx-team">${clubCrestImg(home,44,null)}<b>${esc(home)}</b></div>
          <div class="mx-mid-score"><b class="mx-n">0</b><span class="mx-min">VS</span><b class="mx-n">0</b></div>
          <div class="mx-team">${clubCrestImg(away,44,null)}<b>${esc(away)}</b></div>
        </div>
        <div class="mx-box-info">
          <div class="panel-title">Confirmar escalação (${esc(ST.formation)})</div>
          <p class="small dim">Sua escalação atual será usada nesta partida. Ajuste no campo se necessário antes de simular.</p>
          ${missing>0?`<p class="small red">⚠ Você tem ${missing} posição(ões) vazia(s) — o time será completado automaticamente.</p>`:""}
          ${unavailable>0?`<p class="small red">⚠ ${unavailable} jogador(es) escalado(s) estão suspensos/lesionados e serão substituídos.</p>`:""}
          <button class="btn btn-sm mt8" onclick="Game.goEditLineup()">✏️ Editar escalação</button>
        </div>
        <div class="tac mt16">
          <div class="tiny faint uc mb8">Velocidade da partida</div>
          <div class="btn-row center mb16">
            ${speedBtn("slow","LENTA")}
            ${speedBtn("normal","RÁPIDA")}
            ${speedBtn("fast","MUITO RÁPIDA")}
          </div>
          <button class="btn btn-gold btn-lg" onclick="Game.simulateMatch()">▶ Simular Partida</button>
        </div>
      </div>
      ${userIsHomePre ? oppSide : myPitch}
    </div>`;
  }
  const res = pm.result;
  const idx = ST.matchAnimIdx;
  const visibleEvents = res.events.slice(0, idx);
  const done = matchAnimDone();
  const curHome = visibleEvents.filter(e=>e.side==="home"&&e.type==="goal").length;
  const curAway = visibleEvents.filter(e=>e.side==="away"&&e.type==="goal").length;
  // "Lenta" shows its own running minute clock even through quiet stretches; the other speeds
  // still show the last revealed event's own minute, exactly as before.
  const lastMin = ST.matchSpeed==="slow" ? (ST.matchClockMinute||0)
    : (visibleEvents.length? visibleEvents[visibleEvents.length-1].minute : 0);

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
  const redCards = new Set(), yellowCards = new Set();
  visibleEvents.forEach(ev=>{
    if(ev.type==="red") redCards.add(ev.side+"|"+ev.player);
    if(ev.type==="yellow") yellowCards.add(ev.side+"|"+ev.player);
  });
  function playerIcons(name, id, side){
    let out = "";
    if(scorers[name]) out += " " + "⚽".repeat(scorers[name]);
    if(assisters[name]) out += " " + "🥾".repeat(assisters[name]);
    if(redCards.has(side+"|"+name)) out += " 🟥";
    else if(yellowCards.has(side+"|"+name)) out += " 🟨";
    if(done && id===motmId) out += " ⭐";
    return out;
  }
  const sentOff = (name, side) => redCards.has(side+"|"+name) ? " sent-off" : "";

  // icons next to a player on the pitch: goals, assists, cards, man of the match
  const mxIcons = side => p => {
    let out = "";
    if(scorers[p.name]) out += "⚽" + (scorers[p.name]>1 ? "×"+scorers[p.name] : "");
    if(assisters[p.name]) out += "🥾" + (assisters[p.name]>1 ? "×"+assisters[p.name] : "");
    if(redCards.has(side+"|"+p.name)) out += "🟥";
    else if(yellowCards.has(side+"|"+p.name)) out += "🟨";
    if(done && p.id===motmId) out += "⭐";
    return out;
  };
  const tagFor = (name, lineup, slots) => { const r = mxLines(name, lineup, slots); return `ATA ${r.att} · MEI ${r.mid} · DEF ${r.def} · GOL ${r.gk}`; };
  const homeSide = pm.homeLineup ? renderMxSide(home, renderMxPitch(pm.homeLineup, pm.homeSlots, {icons:mxIcons("home"), sentOff:p=>redCards.has("home|"+p.name)}), tagFor(home, pm.homeLineup, pm.homeSlots)) : "";
  const awaySide = pm.awayLineup ? renderMxSide(away, renderMxPitch(pm.awayLineup, pm.awaySlots, {icons:mxIcons("away"), sentOff:p=>redCards.has("away|"+p.name)}), tagFor(away, pm.awayLineup, pm.awaySlots)) : "";

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

  const winnerTxt = curHome>curAway ? `${esc(home)} venceu!` : curAway>curHome ? `${esc(away)} venceu!` : "Empate!";
  const centerHtml = `
    <div class="mx-stage">${esc(stageLbl)}</div>
    <div class="mx-score">
      <div class="mx-team">${clubCrestImg(home,44,null)}<b>${esc(home)}</b></div>
      <div class="mx-mid-score"><b class="mx-n">${curHome}</b><span class="mx-min">${done? "FIM" : lastMin+"'"}</span><b class="mx-n">${curAway}</b></div>
      <div class="mx-team">${clubCrestImg(away,44,null)}<b>${esc(away)}</b></div>
    </div>
    <ol class="mx-feed" id="ticker" data-rev="1">
      ${visibleEvents.length===0?`<li class="idle"><span class="dim">Bola rolando...</span></li>`:""}
      ${visibleEvents.map((ev,ei)=>({ev,ei})).reverse().map(({ev,ei})=>`<li data-k="e${ei}" class="${ev.type==='goal'?'gol':''} ${ev.type==='red'?'red':''} ${ev.side==='away'?'o':''}">
        <span class="mn">${ev.minute}'</span><span class="ic">${ev.penalty?"🎯":(EVENT_ICON[ev.type]||"•")}</span>
        <span class="tx">${eventText(ev, home, away)}</span>
      </li>`).join("")}
    </ol>
    ${done ? `<div class="mx-final"><b>${winnerTxt}</b><span>${curHome} x ${curAway}</span></div>` : ""}
    ${!done? `
    <div class="tac mt16">
      <button class="btn" onclick="Game.skipMatch()">PULAR PARA O FINAL</button>
    </div>` : `
    <div class="tac mt16">
      <button class="btn btn-gold btn-lg" onclick="Game.continueAfterMatch()">Continuar →</button>
    </div>`}`;

  return `
  <div class="mx-wrap">
    ${homeSide}
    <div class="mx-center-col">
      <div class="mx-center mx-card">${centerHtml}</div>
      ${statsHtml}
      ${ratingsHtml}
    </div>
    ${awaySide}
  </div>`;
}

// two-column, name-by-name shootout reveal: kickers alternate A/B, each row's name appears
// first and — after the reveal pause — a green GOL or red ERROU lands next to it.
function renderPenaltyShootoutScreen(){
  const s = ST.penaltyShootout;
  if(!s) return renderHub();
  const teamA = s.teamAName, teamB = s.teamBName;
  const maxRounds = Math.ceil((s.revealIdx+1)/2);
  function rowFor(idx){
    if(idx>=s.kicks.length || !s.nameShown[idx]) return `<div class="pen-shoot-row empty"></div>`;
    const k = s.kicks[idx];
    const shown = s.resultShown[idx];
    return `<div class="pen-shoot-row">
      <span class="pen-shoot-name">${esc(k.name)}</span>
      <span class="pen-shoot-result ${shown?(k.scored?'goal':'miss'):'pending'}">${shown?(k.scored?'GOL':'ERROU'):'···'}</span>
    </div>`;
  }
  let bodyRows = "";
  for(let r=0;r<maxRounds;r++){
    bodyRows += `<div class="pen-shoot-round">
      <div class="pen-shoot-side">${rowFor(r*2)}</div>
      <div class="pen-shoot-side right">${rowFor(r*2+1)}</div>
    </div>`;
  }
  const done = s.phase==="done";
  const curKick = s.kicks[s.revealIdx];
  const statusText = done
    ? `${esc(s.scoreA>s.scoreB?teamA:teamB)} vence a disputa de pênaltis!`
    : (curKick && s.nameShown[s.revealIdx] && !s.resultShown[s.revealIdx] ? `${esc(curKick.name)} vai para a cobrança...` : `Preparando a próxima cobrança...`);
  return `<div class="hero pen-shoot-screen" style="min-height:88vh;">
    <div class="hero-badge">DISPUTA DE PÊNALTIS</div>
    <div class="pen-shoot-scoreboard">
      <div class="pen-shoot-team">
        <span class="match-crest">${crestSVG(teamA,44)}</span>
        <div class="bold">${esc(teamA)}</div>
      </div>
      <div class="score-num">${s.scoreA} - ${s.scoreB}</div>
      <div class="pen-shoot-team">
        <span class="match-crest">${crestSVG(teamB,44)}</span>
        <div class="bold">${esc(teamB)}</div>
      </div>
    </div>
    <div class="pen-shoot-status ${done?'gold bold':''}">${statusText}</div>
    <div class="pen-shoot-list">
      <div class="pen-shoot-round pen-shoot-header-row">
        <div class="pen-shoot-side"><span class="faint tiny uc">${esc(teamA)}</span></div>
        <div class="pen-shoot-side right"><span class="faint tiny uc">${esc(teamB)}</span></div>
      </div>
      ${bodyRows}
    </div>
    ${!done?`<div class="tac mt16"><button class="btn" onclick="Game.skipShootout()">PULAR DISPUTA DE PÊNALTIS</button></div>`:""}
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
    <td class="bold"><span class="pface-cell">${playerFaceImg(p,30)}<span>${esc(p.name)} <span class="faint tiny">${esc(p.nat)}</span></span></span></td>
    <td>${posBadges(p)}</td>
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
// mid-match penalty — pauses the ticker on the user's own award and lets them pick who takes
// it, showing overall and a stable-per-match "energia" (fatigue) reading per candidate.
function renderPenaltyPickerModal(m){
  const pm = ST.pendingMatch;
  const ev = pm.result.events[m.eventIndex];
  const isHomeSide = ev.side==="home";
  const atkTeamName = isHomeSide ? pm.ref.home : pm.ref.away;
  const atkLineupLite = isHomeSide ? pm.homeLineup : pm.awayLineup;
  const atkSlots = isHomeSide ? pm.homeSlots : pm.awaySlots;
  const candidates = atkLineupLite.map((lp,i)=>{
    if(!lp || atkSlots[i]==="GK") return null;
    const p = playerById(atkTeamName, lp.id);
    return p ? {p, slot:atkSlots[i]} : null;
  }).filter(Boolean).sort((a,b)=>b.p.ovr-a.p.ovr);
  const rows = candidates.map(({p,slot})=>{
    const fatigue = pseudoFatigue(p, ev.minute, pm.seed);
    return `<div class="pen-pick-row" onclick="Game.takePenalty(${p.id})">
      <span class="badge badge-pos">${slot}</span>
      <span class="bold pen-pick-name">${esc(p.name)}</span>
      <span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span>
      <span class="pen-pick-fatigue">
        <span class="faint tiny">Energia ${fatigue}%</span>
        <div class="rep-bar-wrap"><div class="pen-pick-fatigue-fill" style="width:${fatigue}%;"></div></div>
      </span>
      <button class="btn btn-sm btn-gold">Bater</button>
    </div>`;
  }).join("");
  return `<div class="modal-backdrop">
    <div class="modal modal-wide pen-pick-modal">
      <div class="hero-badge" style="margin:0 auto 10px;">PÊNALTI!</div>
      <div class="panel-title" style="margin:0 0 12px;text-align:center;">Escolha o batedor — ${esc(atkTeamName)}</div>
      <div class="pen-pick-list">${rows}</div>
    </div>
  </div>`;
}
// one continuous card for a mid-match penalty — an empty goal frame (no ball) stays on
// screen throughout. It opens on "{PLAYER} COBRA..." for a brief, light suspense beat, then
// the same line swaps in place for the actual outcome sentence (from engine.ts's own goal/
// miss flavor pools — real variety, from a clean finish to a save or a shot over the bar),
// colored green if it went in and red if it didn't.
function renderPenaltyKickModal(m){
  const isResult = m.phase==="result";
  const text = isResult ? m.flavor : `${m.playerName.toUpperCase()} COBRA...`;
  const textClass = isResult ? (m.scored ? "green" : "red") : "";
  return `<div class="modal-backdrop">
    <div class="modal pen-kick-modal">
      <div class="hero-badge" style="margin:0 auto 10px;">PÊNALTI!</div>
      <div class="pen-kick-stage">
        <div class="pen-kick-goal${isResult?"":" pen-kick-goal-pulse"}"></div>
      </div>
      <div class="pen-kick-text bold${textClass?" "+textClass:""}">${esc(text)}</div>
    </div>
  </div>`;
}
// ---------------- MODAL ----------------
function renderInjuredStartersModal(m){
  const slots = slotsForFormation();
  const bad = unavailableStarterSlots().map(i=>({i, p:lineupPlayers()[i], slot:slots[i]}));
  return `<div class="modal-backdrop">
    <div class="modal">
      <div class="hero-badge" style="margin:0 auto 10px;">DIA DE JOGO</div>
      <div class="panel-title">Você tem atleta(s) fora no time titular</div>
      <div class="slot-pick-list" style="margin-bottom:12px;">
        ${bad.map(b=>`<div class="slot-pick-row unavailable"><div class="slot-pick-main">${playerFaceImg(b.p,34)}<span class="badge badge-pos">${b.slot}</span><span class="bold">${esc(b.p.name)}</span>${statusBadges(b.p)}</div></div>`).join("")}
      </div>
      <p class="dim small" style="margin:0 0 14px;">Gostaria de:</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button class="btn btn-gold btn-lg" onclick="Game.injuredAuto()">Substituir automaticamente para você</button>
        <button class="btn btn-lg" onclick="Game.injuredManual()">Você substitui por atleta da sua preferência</button>
      </div>
      <p class="faint tiny" style="margin:14px 0 0;">A troca vale só para ESTE jogo. O atleta continua na escalação e só sai dela se você trocar na aba Elenco.</p>
    </div>
  </div>`;
}
function renderInjuredPickModal(m){
  const slots = slotsForFormation();
  const used = new Set(ST.lineup.filter(Boolean));
  const rows = unavailableStarterSlots().map(i=>{
    const slot = slots[i], out = lineupPlayers()[i];
    const chosen = (m.picks||{})[i];
    const taken = new Set(Object.entries(m.picks||{}).filter(([k,v])=>Number(k)!==i && v).map(([k,v])=>Number(v)));
    const opts = myTeam().players.filter(p=>!p.injured && !p.suspended && !used.has(p.id) && !taken.has(p.id) && slotCompatible(p, slot))
      .sort((a,b)=>((b.pos===slot)-(a.pos===slot)) || (b.ovr-a.ovr));
    return `<div class="slot-pick-row">
      <div class="slot-pick-main"><span class="badge badge-pos">${slot}</span><span class="bold">${esc(out.name)}</span><span class="faint tiny">sai</span></div>
      <div class="slot-pick-actions" style="width:100%;">
        <select class="select-inline" style="width:100%;" onchange="Game.injuredPick(${i}, this.value)">
          <option value="">Escolha o substituto…</option>
          ${opts.map(p=>`<option value="${p.id}" ${Number(chosen)===p.id?"selected":""}>${esc(p.name)} · ${p.pos} · OVR ${p.ovr}</option>`).join("")}
        </select>
      </div>
    </div>`;
  }).join("");
  const ready = unavailableStarterSlots().every(i=>(m.picks||{})[i]);
  return `<div class="modal-backdrop">
    <div class="modal">
      <div class="panel-title">Escolha os substitutos deste jogo</div>
      <div class="slot-pick-list">${rows}</div>
      <div class="btn-row mt16">
        <button class="btn btn-gold" ${ready?"":"disabled"} onclick="Game.injuredConfirm()">Confirmar escalação</button>
        <button class="btn" onclick="Game.injuredAuto()">Deixar automático</button>
      </div>
    </div>
  </div>`;
}
function renderFaSignModal(m){
  const p = ST.world.globalMarket.find(x=>x.id===m.playerId);
  if(m.done) return `<div class="modal-backdrop"><div class="modal tac"><div class="hero-badge" style="margin:0 auto 10px;">CONTRATO ASSINADO!</div><div class="bold">${esc(m.msg)}</div></div></div>`;
  if(!p) return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()"><div class="modal"><p class="dim">Esse jogador já assinou com outro clube.</p><button class="btn btn-block mt16" onclick="Game.closeModal()">Fechar</button></div></div>`;
  const c = freeAgentCost(p);
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="modal">
      <div class="panel-title">Contratar free agent</div>
      <div class="row" style="gap:12px;align-items:center;margin-bottom:12px;">${playerFaceImg(p,48)}<div><div class="bold">${esc(p.name)}</div><div class="tiny dim">${p.pos} · ${p.age} anos · OVR ${p.ovr}</div></div></div>
      <div class="contract-kv"><span>Taxa de contratação</span><span class="mono">${fmtMoney(c.fee)}</span></div>
      <div class="contract-kv"><span>Salário (1ª temporada)</span><span class="mono">${fmtMoney(c.wage)}</span></div>
      <div class="contract-kv"><span class="bold">Total</span><span class="mono gold bold">${fmtMoney(c.total)}</span></div>
      <div class="contract-kv"><span>Seu orçamento</span><span class="mono">${fmtMoney(ST.budget)}</span></div>
      <p class="faint tiny" style="margin:10px 0 0;">Sem valor de mercado: ele é um jogador livre. Se esperar, outro clube pode contratá-lo antes.</p>
      ${m.err?`<p class="red small mt8">${esc(m.err)}</p>`:""}
      <div class="btn-row mt16">
        <button class="btn btn-gold" ${c.total>ST.budget?"disabled":""} onclick="Game.signFreeAgent(${p.id})">Assinar contrato</button>
        <button class="btn" onclick="Game.closeModal()">Cancelar</button>
      </div>
    </div>
  </div>`;
}
function renderModal(){
  const m = ST.uiModal;
  if(!m) return "";
  if(m.type==="faSign") return renderFaSignModal(m);
  if(m.type==="injuredStarters") return renderInjuredStartersModal(m);
  if(m.type==="injuredPick") return renderInjuredPickModal(m);
  if(m.type==="slotPicker") return renderSlotPickerModal(m);
  if(m.type==="buyOffer") return renderBuyOfferModal(m);
  if(m.type==="news") return renderNewsModal();
  if(m.type==="confirm") return renderConfirmModal(m);
  if(m.type==="incomingOffer") return renderIncomingOfferModal(m);
  if(m.type==="squadCentral") return renderSquadCentralModal();
  if(m.type==="penaltyPicker") return renderPenaltyPickerModal(m);
  if(m.type==="penaltyKick") return renderPenaltyKickModal(m);
  if(m.type==="timeConfig") return renderTimeConfigModal();
  if(m.type==="seasonTOTY") return renderSeasonTOTYModal();
  if(m.type==="feedback") return renderFeedbackModal();
  if(m.type==="saleDone") return renderSaleDoneModal(m);
  return "";
}
function renderSaleDoneModal(m){
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="modal sale-modal" style="max-width:380px;text-align:center;">
      <div class="faint tiny uc">Venda concluída</div>
      <div style="margin:14px 0 6px;display:flex;justify-content:center;">${clubCrestImg(m.club, 72, null)}</div>
      <p class="mt8" style="line-height:1.5;"><b>${esc(m.playerName)}</b> foi vendido para o <b>${esc(m.club)}</b> por</p>
      <div class="gold bold mono" style="font-size:28px;margin-top:4px;">${fmtMoney(m.price)}</div>
      <p class="tiny faint mt8">Ele segue a carreira no novo clube e pode ser recomprado mais para frente.</p>
      <div class="btn-row mt16"><button class="btn btn-gold grow" onclick="Game.closeModal()">Ok</button></div>
    </div>
  </div>`;
}
function renderFeedbackModal(){
  const ig = "https://www.instagram.com/_thefenomeno/", tk = "https://www.tiktok.com/@_thefenomeno";
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="modal fb-modal" style="max-width:420px;">
      <div class="faint tiny uc">Fim da 1ª temporada</div>
      <div class="panel-title mt8">Está curtindo o jogo?</div>
      <p class="small dim mt8" style="line-height:1.55;">Sua opinião ajuda a construir o THE MANAGER. Manda pra gente no direct do Instagram <b>@_thefenomeno</b>:</p>
      <ul class="fb-list small">
        <li>o que você mais gostou;</li>
        <li>bugs ou problemas que encontrou;</li>
        <li>melhorias e novidades que gostaria de ver.</li>
      </ul>
      <a class="btn btn-gold btn-block mt16" href="${ig}" target="_blank" rel="noopener noreferrer" onclick="Game.openExternal(event,'${ig}')">Enviar feedback no Instagram</a>
      <a class="btn btn-block mt8" href="${tk}" target="_blank" rel="noopener noreferrer" onclick="Game.openExternal(event,'${tk}')">Seguir a gente no TikTok</a>
      <div class="btn-row mt16">
        <button class="btn grow" onclick="Game.closeModal()">Agora não</button>
      </div>
    </div>
  </div>`;
}
function renderTimeConfigModal(){
  const speed = ST.matchSpeed || "normal";
  const speedBtn = (id,label)=>`<button class="btn${speed===id?' btn-gold':''}" style="width:100%;" onclick="Game.setMatchSpeed('${id}')">${label}</button>`;
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="modal" style="max-width:380px;">
      <div class="panel-title">Configuração de tempo</div>
      <p class="small dim mt8">Escolha a velocidade das partidas. Vale para a Simulação Lenta e para a tela da partida, até você mudar de novo.</p>
      <div class="mt16" style="display:flex;flex-direction:column;gap:8px;">
        ${speedBtn("slow","LENTA")}
        ${speedBtn("normal","RÁPIDA")}
        ${speedBtn("fast","MUITO RÁPIDA")}
      </div>
      <div class="btn-row mt16">
        <button class="btn grow" onclick="Game.closeModal()">Fechar</button>
      </div>
    </div>
  </div>`;
}
// "Seleção da Temporada" — the Brasileirão's own best 4-3-3 XI across the WHOLE season just
// finished (ST.lastSeasonSummary.teamOfSeason, computed in finalizeBrasaSeason() from
// ST.brasileirao.seasonRatings), same mixed-club pitch as the weekly e-mail.
function renderSeasonTOTYModal(){
  const s = ST.lastSeasonSummary;
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="modal" style="max-width:640px;">
      <div class="panel-title">🏆 Seleção da Temporada — Brasileirão ${s.year}</div>
      <p class="small dim mt8">Os 11 que mais se destacaram na média de nota ao longo da temporada inteira, um por posição.</p>
      <div class="mt16">${renderMixedXIPitch(s.teamOfSeason)}</div>
      <div class="btn-row mt16">
        <button class="btn btn-gold grow" onclick="Game.closeModal()">Fechar</button>
      </div>
    </div>
  </div>`;
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
          ${clubCrestImg(m.club, 32, p?p.name:null)}
          <div><div class="faint tiny uc">Time interessado</div><div class="bold">${esc(m.club)}</div></div>
        </div>
        <div class="contract-kv"><span>Tipo de transferência</span><span>Vender</span></div>
        <div class="contract-kv"><span>Categoria</span><span>${isArab?'Proposta inacreditável':'Proposta do exterior'}</span></div>
        ${p ? contractPlayerCard(p, ST.teamId) : ""}
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
        ${playerFaceImg(p,38)}
        ${posBadges(p)}
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
      <div class="signature-wrap"><span class="signature-text">${esc(mgrName(ST.managerName))}</span></div>
      <div class="contract-sign-stamp">Contrato assinado</div>
    </div>
  </div>`;
}
function contractPlayerCard(p, clubName){
  const photo = playerFolderPhoto(p);
  const crest = clubName ? `<span class="contract-player-crest">${clubCrestImg(clubName,22,null)}</span>` : "";
  return `<div class="contract-player-card">
    <div class="contract-player-banner"><span class="contract-player-name">${crest}<span>${esc(p.name)}</span></span><span>${p.pos}</span></div>
    <div class="contract-player-body${photo?' has-photo':''}">
      ${photo}
      <div class="contract-player-data">
      <div class="contract-stat-grid">
        <div><span>Ger</span><b>${p.ovr}</b></div>
        <div><span>Idade</span><b>${p.age}</b></div>
        <div><span>Pot</span><b>${p.pot}</b></div>
      </div>
      <div class="contract-stat-row"><span>Posições</span><b>${posList(p).join(" · ")}</b></div>
      <div class="contract-stat-row"><span>Valor de mercado</span><b class="gold">${fmtMoney(p.value)}</b></div>
      </div>
    </div>
  </div>`;
}
function renderBuyOfferModal(m){
  if(m.signing) return renderContractSigning(m.signMsg || "Contrato assinado!");
  const isGlobal = m.team==="global";
  const ctx = buyContext(m.team, m.playerId);
  if(!ctx) return `<div class="modal-backdrop"><div class="modal"><p>Jogador indisponível.</p><button class="btn" onclick="Game.closeModal()">Fechar</button></div></div>`;
  const p = ctx.p, ask = ctx.ask, clubName = ctx.club;
  const sess = buyNegSession(m.team, p.id, ask);
  const cool = buyCooldownLeft(sess);
  const started = sess.neg.round>0;
  const standing = started ? sess.neg.now : ask;
  const lastV = sess.neg.lastVerdict;
  const canTakeCounter = started && sess.status!=="ended" && lastV && lastV!=="refuse" && lastV!=="end" && standing<=ST.budget;
  const lo = Math.round(ctx.limit*0.97/5000)*5000, hi = Math.round(ask*1.05/5000)*5000;
  const money = n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,".");
  const thread = sess.thread.slice(-4).map(t=>`<div class="neg-line ${t.who}"><span>${esc(t.text)}</span></div>`).join("");
  return `<div class="modal-backdrop" onclick="if(event.target===this)Game.closeModal()">
    <div class="contract-doc">
      <div class="contract-panel">
        <div class="contract-panel-header">Jogador</div>
        <div class="contract-crest-row">
          ${isGlobal ? `<div style="font-size:28px;">🌍</div>` : `<div style="width:40px;">${clubCrestImg(clubName,40,null)}</div>`}
          <div><div class="faint tiny uc">Time</div><div class="bold">${esc(clubName)}</div>${isGlobal?'<div class="faint tiny">Fora da Libertadores</div>':''}</div>
        </div>
        <div class="contract-kv"><span>Tipo de transferência</span><span>Comprar</span></div>
        <div class="contract-kv"><span>Valor de passe estipulado</span><span class="gold bold">${fmtMoney(ask)}</span></div>
        ${started?`<div class="contract-kv"><span>Posição atual do clube</span><span class="gold bold">${fmtMoney(standing)}</span></div>`:""}
        ${contractPlayerCard(p, clubName)}
      </div>
      <div class="contract-divider"><span class="contract-pen">✒️</span></div>
      <div class="contract-panel">
        <div class="contract-panel-header">Negociação</div>
        <p class="contract-advisor"><b>Comentários do Gerente de Futebol:</b><br>${transferAdvisorLine(p, lo, hi)} O valor pedido é uma referência: contrapropostas fazem parte do jogo.</p>
        ${renderMoodBar("buy-"+m.team+":"+p.id, sess.neg.mood, sess.status==="ended")}
        ${thread?`<div class="neg-thread">${thread}</div>`:""}
        <div class="contract-kv"><span>Orç. de transferência</span><span class="gold bold">${fmtMoney(ST.budget)}</span></div>
        ${sess.status==="ended" && cool>0 ? `<div class="mail-status mail-status-bad mt12">A diretoria encerrou as conversas. Tente de novo em ${cool} dia${cool===1?"":"s"} (avance os dias na aba Competição).</div>` : `
        <label class="tiny faint mt12" style="display:block;">${started?"Sua próxima proposta (US$)":"Valor da proposta (US$)"}</label>
        <input id="offerInput" type="text" inputmode="numeric" class="input-inline" style="width:100%;" value="${money(standing)}" oninput="Game.updateOfferWords(this)"/>
        <div id="offerWords" class="tiny faint mt4">${esc(numberToWordsPT(standing))}</div>`}
        <div id="offerMsg" class="small mt8"></div>
        <div class="neg-actions mt12">
          ${sess.status==="ended" && cool>0 ? "" : `<button class="btn" onclick="Game.submitOffer(${p.id},'${escJs(m.team)}')">✒️ Nova proposta</button>`}
          ${canTakeCounter ? `<button class="btn btn-gold neg-take" onclick="Game.acceptCounter(${p.id},'${escJs(m.team)}')">✔ Aceitar · ${fmtMoney(standing)}</button>` : ""}
          <button class="btn" onclick="Game.closeModal()">${started?"Fechar":"Cancelar"}</button>
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
// one card per competition actually played this season (see the compCards built in
// finalizeBrasaSeason()) — each with its OWN trophy on top (dimmed unless actually won, same
// convention as the Competição tab's bracket panels), its own result, reputation swing and
// prize money, laid out in a row instead of the old single generic trophy + one pooled number.
function renderSeasonCompCards(cards){
  if(!cards || !cards.length) return "";
  return `<div class="season-comp-cards">${cards.map(c=>`<div class="season-comp-card">
    ${competitionTrophyImg(c.trophyKey, 60, c.won?1:0.45)}
    <div class="season-comp-card-label">${esc(c.label)}</div>
    <div class="season-comp-card-result ${c.won?'gold bold':'bold'}">${esc(c.result)}</div>
    <div class="season-comp-card-row"><span>Reputação</span><span class="${c.repChange>=0?'green':'red'} bold">${c.repChange>=0?'+':''}${c.repChange}</span></div>
    <div class="season-comp-card-row"><span>Premiação</span><span class="gold bold">${fmtMoney(c.prize)}</span></div>
  </div>`).join("")}</div>`;
}
function renderSeasonEndScreen(){
  const s = ST.lastSeasonSummary;
  const isChampion = s.placement === "Campeão";
  return `${cornerWatermarks()}<div class="hero" style="min-height:80vh;position:relative;z-index:1;">
    ${!s.compCards ? (isChampion ? `<div class="mb16">${trophyImg(150,1)}</div>` : "") : ""}
    <div class="hero-badge">TEMPORADA ${s.year} ENCERRADA</div>
    <h1 class="hero-title" style="font-size:clamp(30px,6vw,54px);">${esc(s.placement.toUpperCase())}</h1>
    ${renderSeasonCompCards(s.compCards)}
    <div class="panel mt24" style="max-width:420px;">
      <div class="kv"><span>Reputação</span><span class="${s.repChange>=0?'green':'red'} bold">${s.repChange>=0?'+':''}${s.repChange} (agora ${ST.reputation})</span></div>
      <div class="kv"><span>Novo orçamento de transferências</span><span class="gold bold">${fmtMoney(ST.budget)}</span></div>
      <div class="kv"><span>Próxima temporada</span><span class="bold">${ST.seasonYear} (${ST.seasonNum}/10)</span></div>
    </div>
    ${s.isBrasileirao ? `<div class="panel mt16" style="max-width:420px;">
      <div class="panel-title">Campeão — ${esc(s.champion)}</div>
      ${s.userMove==="promoted" ? `<div class="gold bold mt8">🎉 Acesso! Você sobe para a Série A.</div>` : s.userMove==="relegated" ? `<div class="red bold mt8">Rebaixado — você disputa a Série B em ${ST.seasonYear}.</div>` : s.userMove==="droppedC" ? `<div class="red bold mt8">Rebaixado para a Série C — a diretoria encerrou seu contrato.</div>` : ""}
      ${s.division==="B" && s.championA ? `<div class="faint tiny uc mt8">Campeão da Série A</div><div class="row" style="gap:8px;align-items:center;margin-top:4px;">${clubCrestImg(s.championA,20,null)}<span class="bold">${esc(s.championA)}</span></div>` : ""}
      ${s.division==="A" && s.championB ? `<div class="faint tiny uc mt8">Campeão da Série B</div><div class="row" style="gap:8px;align-items:center;margin-top:4px;">${clubCrestImg(s.championB,20,null)}<span class="bold">${esc(s.championB)}</span></div>` : ""}
      <div class="faint tiny uc mt8">Rebaixados da Série A para a Série B</div>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:6px;">
        ${s.relegated.map(name=>`<span class="row" style="gap:5px;align-items:center;">${clubCrestImg(name,18,null)}<span class="tiny red bold">${esc(name)}</span></span>`).join("")}
      </div>
      ${(s.promotedUp||[]).length ? `<div class="faint tiny uc mt8">Sobem da Série B para a Série A</div>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:6px;">
        ${s.promotedUp.map(name=>`<span class="row" style="gap:5px;align-items:center;">${clubCrestImg(name,18,null)}<span class="tiny bold" style="color:#3ddc84;">${esc(name)}</span></span>`).join("")}
      </div>` : ""}
      ${(s.droppedC||[]).length ? `<div class="faint tiny uc mt8">Rebaixados da Série B para a Série C</div>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:6px;">
        ${s.droppedC.map(name=>`<span class="row" style="gap:5px;align-items:center;">${clubCrestImg(name,18,null)}<span class="tiny red bold">${esc(name)}</span></span>`).join("")}
      </div>` : ""}
      ${(s.risenC||[]).length ? `<div class="faint tiny uc mt8">Sobem da Série C para a Série B</div>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:6px;">
        ${s.risenC.map(name=>`<span class="row" style="gap:5px;align-items:center;">${clubCrestImg(name,18,null)}<span class="tiny bold">${esc(name)}</span></span>`).join("")}
      </div>` : ""}
      ${ST.copaDoBrasil && ST.copaDoBrasil.champion ? `<div class="faint tiny uc mt12">Campeão da Copa do Brasil ${ST.copaDoBrasil.year}</div><div class="row" style="gap:8px;align-items:center;margin-top:4px;">${clubCrestImg(ST.copaDoBrasil.champion,20,null)}<span class="bold gold">${esc(ST.copaDoBrasil.champion)}</span></div>` : ""}
      ${ST.sulamericana && ST.sulamericana.champion ? `<div class="faint tiny uc mt12">Campeão da Sul-Americana ${ST.sulamericana.year}</div><div class="row" style="gap:8px;align-items:center;margin-top:4px;">${clubCrestImg(ST.sulamericana.champion,20,null)}<span class="bold gold">${esc(ST.sulamericana.champion)}</span></div>` : ""}
      ${ST.libertadoresCompleto && ST.libertadoresCompleto.champion ? `<div class="faint tiny uc mt12">Campeão da Libertadores ${ST.libertadoresCompleto.year}</div><div class="row" style="gap:8px;align-items:center;margin-top:4px;">${clubCrestImg(ST.libertadoresCompleto.champion,20,null)}<span class="bold gold">${esc(ST.libertadoresCompleto.champion)}</span></div>` : ""}
    </div>` : ""}
    ${s.zones ? `<div class="panel mt16" style="max-width:420px;">
      <div class="panel-title">Classificados para ${ST.seasonYear}</div>
      <div class="faint tiny uc mt8">Libertadores</div>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:6px;">${s.zones.liber.map(name=>`<span class="row" style="gap:5px;align-items:center;">${clubCrestImg(name,18,null)}<span class="tiny bold">${esc(name)}</span></span>`).join("")}</div>
      <div class="faint tiny uc mt12">Sul-Americana</div>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:6px;">${s.zones.sula.map(name=>`<span class="row" style="gap:5px;align-items:center;">${clubCrestImg(name,18,null)}<span class="tiny bold">${esc(name)}</span></span>`).join("")}</div>
    </div>` : ""}
    ${renderDevelopmentReportPanel(s.development)}
    ${s.reiDaAmerica ? renderReiDaAmericaPanel(s.reiDaAmerica) : ""}
    ${s.teamOfSeason && s.teamOfSeason.some(Boolean) ? `<button class="btn btn-lg mt16" onclick="Game.openSeasonTOTY()">🏆 SELEÇÃO DA TEMPORADA</button>` : ""}
    <button class="btn btn-gold btn-lg mt24" onclick="Game.continueSeason()">Ir para ${ST.seasonYear} →</button>
  </div>`;
}
// who leveled up (age-curve growth crossing an OVR point, see ageWorld()) and who retired this
// off-season, for the user's own squad only — each row fades/slides in with a small stagger
// (see .dev-row in global.css) so growth actually reads as a beat instead of a silent stat change.
function renderDevelopmentReportPanel(dev){
  if(!dev || (!dev.leveledUp.length && !dev.retired.length)) return "";
  // the biggest jumps get the full rise-and-fill card treatment (capped at 6 so the screen isn't
  // a wall of them); anyone else who leveled up this season still gets a quick, plain mention.
  const sorted = dev.leveledUp.slice().sort((a,b)=>(b.to-b.from)-(a.to-a.from));
  const cardPlayers = sorted.slice(0,6);
  const restPlayers = sorted.slice(6);
  const upCards = cardPlayers.map((p,i)=>renderLevelUpCard(p.name, p.pos, p.from, p.to, i*220)).join("");
  const restLine = restPlayers.length ? `<p class="faint tiny mt8">${restPlayers.map(p=>`${esc(p.name)} (${p.from}→${p.to})`).join(", ")} também evoluíram.</p>` : "";
  const retiredRows = dev.retired.map((p,i)=>`<div class="dev-row dev-row-retire" style="animation-delay:${i*70}ms;">
    <span class="dev-row-icon">👋</span>
    <span class="dev-row-name">${esc(p.name)} <span class="faint tiny">${esc(p.pos)} · ${p.age} anos</span></span>
    <span class="dev-row-ovr faint">aposentou-se · ${p.ovr} OVR</span>
  </div>`).join("");
  return `<div class="panel mt16" style="max-width:420px;">
    <div class="panel-title">Desenvolvimento do Elenco</div>
    ${cardPlayers.length?`<div class="faint tiny uc mb8">Evoluíram</div><div class="levelup-deck">${upCards}</div>${restLine}`:""}
    ${dev.retired.length?`<div class="faint tiny uc mt12">Aposentadorias</div>${retiredRows}`:""}
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
// the animated group-draw ceremony (real Libertadores only, 2027 onward) — reveals the 32
// slots pot-by-pot, group-by-group (TIME 1 grupo A, TIME 1 grupo B, ... TIME 2 grupo A, ...),
// each one unrolling like a paper slip pulled from the draw pot. ST.drawRevealed (ticked by
// startGroupDrawAnimation's timer, or jumped straight to 32 by SKIP) drives how many show.
// the Mundial de Clubes announcement screen — only ever reached once, the moment this club wins
// the Libertadores: shows who else made the field (all three simulated in the background, see
// startIntercontinental()) and both semifinal pairings, no incremental reveal needed since
// there's no suspense here — the club is already in it, the only question left is winning it.
function renderIcAnnounce(){
  const ic = ST.intercontinental;
  const slot = (teamName)=>{
    const isUser = teamName===ST.teamId;
    return `<div class="draw-slot draw-slot-reveal${isUser?" draw-slot-user":""}">
      <span class="draw-slot-crest">${clubCrestImg(teamName,20,null)}</span>
      <span class="draw-slot-name">${esc(teamName)}</span>
    </div>`;
  };
  const boxes = `<div class="draw-group">
      <div class="draw-group-title">Semifinal 1 — Ásia x Libertadores</div>
      ${slot(ic.asiaChampion)}${slot(ic.libChampion)}
    </div>
    <div class="draw-group">
      <div class="draw-group-title">Semifinal 2 — Champions League x Concacaf</div>
      ${slot(ic.euroChampion)}${slot(ic.concacafChampion)}
    </div>`;
  return `${cornerWatermarks()}<div class="draw-screen">
    <div class="draw-header">
      <div class="draw-trophy">${competitionTrophyImg("intercontinental",90,1)}</div>
      <div class="draw-title-badge">FIFA</div>
      <h1 class="draw-title">Mundial de Clubes</h1>
      <div class="draw-year">${esc(ic.libChampion)} — CAMPEÃO DA LIBERTADORES ${ic.year}</div>
    </div>
    <div class="draw-grid">${boxes}</div>
    <div class="btn-row center mt24">
      <button class="btn btn-gold btn-lg" onclick="Game.continueIntercontinental()">Encarar o mundo →</button>
    </div>
  </div>`;
}
function renderCopaDraw(){
  const cb = ST.copaDoBrasil;
  const ties = cb.knockout.copa_r16.ties;
  const revealed = cb.drawRevealed||0;
  const done = revealed>=16;
  const boxes = ties.map((tie,tIdx)=>{
    const pairNames = [tie.teamB, tie.teamA]; // legs[0].home/away order — teamB shown first, matches the tie's own leg order
    const slots = pairNames.map((teamName, i)=>{
      const step = tIdx*2 + i;
      if(step>=revealed){
        return `<div class="draw-slot draw-slot-empty"><span class="draw-slot-roll"></span></div>`;
      }
      const isUser = teamName===ST.teamId;
      const isNew = step===revealed-1;
      return `<div class="draw-slot${isNew?" draw-slot-reveal":""}${isUser?" draw-slot-user":""}">
        <span class="draw-slot-crest">${clubCrestImg(teamName,20,null)}</span>
        <span class="draw-slot-name">${esc(teamName)}</span>
      </div>`;
    }).join("");
    return `<div class="draw-group">
      <div class="draw-group-title">Confronto ${tIdx+1}</div>
      ${slots}
    </div>`;
  }).join("");
  return `${cornerWatermarks()}<div class="draw-screen">
    <div class="draw-header">
      <div class="draw-trophy">${trophyImg(90,1)}</div>
      <div class="draw-title-badge">CBF</div>
      <h1 class="draw-title">Copa do Brasil</h1>
      <div class="draw-year">SORTEIO DAS OITAVAS DE FINAL · ${cb.year}</div>
    </div>
    <div class="draw-grid">${boxes}</div>
    <div class="btn-row center mt24">
      ${done
        ? `<button class="btn btn-gold btn-lg" onclick="Game.finishCopaDraw()">Continuar →</button>`
        : `<button class="btn btn-ghost" onclick="Game.skipCopaDraw()">Pular animação (SKIP)</button>`}
    </div>
  </div>`;
}
// the quarterfinal draw ceremony — same mechanics as renderCopaDraw() above but for the 4
// confrontos pulled from the 8 round-of-16 winners (ST.copaDoBrasil.qfDrawRevealed drives it).
function renderCopaQfDraw(){
  const cb = ST.copaDoBrasil;
  const ties = cb.knockout.copa_qf.ties;
  const revealed = cb.qfDrawRevealed||0;
  const done = revealed>=8;
  const boxes = ties.map((tie,tIdx)=>{
    const pairNames = [tie.teamB, tie.teamA];
    const slots = pairNames.map((teamName, i)=>{
      const step = tIdx*2 + i;
      if(step>=revealed){
        return `<div class="draw-slot draw-slot-empty"><span class="draw-slot-roll"></span></div>`;
      }
      const isUser = teamName===ST.teamId;
      const isNew = step===revealed-1;
      return `<div class="draw-slot${isNew?" draw-slot-reveal":""}${isUser?" draw-slot-user":""}">
        <span class="draw-slot-crest">${clubCrestImg(teamName,20,null)}</span>
        <span class="draw-slot-name">${esc(teamName)}</span>
      </div>`;
    }).join("");
    return `<div class="draw-group">
      <div class="draw-group-title">Confronto ${tIdx+1}</div>
      ${slots}
    </div>`;
  }).join("");
  return `${cornerWatermarks()}<div class="draw-screen">
    <div class="draw-header">
      <div class="draw-trophy">${trophyImg(90,1)}</div>
      <div class="draw-title-badge">CBF</div>
      <h1 class="draw-title">Copa do Brasil</h1>
      <div class="draw-year">SORTEIO DAS QUARTAS DE FINAL · ${cb.year}</div>
    </div>
    <div class="draw-grid">${boxes}</div>
    <div class="btn-row center mt24">
      ${done
        ? `<button class="btn btn-gold btn-lg" onclick="Game.finishCopaQfDraw()">Continuar →</button>`
        : `<button class="btn btn-ghost" onclick="Game.skipCopaQfDraw()">Pular animação (SKIP)</button>`}
    </div>
  </div>`;
}
function renderGroupDraw(){
  const groups = ST.competition.groupsThisSeason;
  const revealed = ST.drawRevealed||0;
  const done = revealed>=32;
  const boxes = DRAW_GROUP_LETTERS.map((L, gIdx)=>{
    const slots = (groups[L]||[]).map((teamName, potIdx)=>{
      const step = potIdx*8 + gIdx;
      if(step>=revealed){
        return `<div class="draw-slot draw-slot-empty"><span class="draw-slot-roll"></span></div>`;
      }
      const isUser = teamName===ST.teamId;
      const isNew = step===revealed-1;
      return `<div class="draw-slot${isNew?" draw-slot-reveal":""}${isUser?" draw-slot-user":""}">
        <span class="draw-slot-crest">${crestSVG(teamName,20)}</span>
        <span class="draw-slot-name">${esc(teamName)}</span>
      </div>`;
    }).join("");
    return `<div class="draw-group">
      <div class="draw-group-title">Grupo ${L}</div>
      ${slots}
    </div>`;
  }).join("");
  return `${cornerWatermarks()}<div class="draw-screen">
    <div class="draw-header">
      <div class="draw-trophy">${trophyImg(90,1)}</div>
      <div class="draw-title-badge">CONMEBOL</div>
      <h1 class="draw-title">Libertadores</h1>
      <div class="draw-year">SORTEIO DOS GRUPOS · ${ST.seasonYear}</div>
    </div>
    <div class="draw-grid">${boxes}</div>
    <div class="btn-row center mt24">
      ${done
        ? `<button class="btn btn-gold btn-lg" onclick="Game.finishGroupDraw()">Continuar →</button>`
        : `<button class="btn btn-ghost" onclick="Game.skipGroupDraw()">Pular animação (SKIP)</button>`}
    </div>
  </div>`;
}
function renderJobOffers(){
  const kind = ST.fired ? "weaker" : "stronger";
  return `<div class="hero" style="min-height:88vh;">
    <div class="hero-badge">${ST.fired? "VOCÊ FOI DEMITIDO" : "PROPOSTAS DE GRANDES CLUBES"}</div>
    <h1 class="hero-title" style="font-size:clamp(26px,5vw,44px);">${ST.fired? "Hora de reconstruir" : "Sua reputação chamou atenção"}</h1>
    <p class="hero-sub">${ST.fired
      ? (ST.mode==="brasileirao" ? `O ${ST.teamId} caiu para a Série C e a diretoria optou por uma mudança. Alguns clubes ligaram — escolha seu próximo desafio:` : `Após uma temporada abaixo do esperado no ${ST.teamId}, sua reputação caiu para ${ST.reputation}. A diretoria optou por uma mudança. Escolha seu próximo desafio:`)
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
// ranked "#N name — value" rows shared by the three career-stats lists below.
function renderStatRankList(rows, valueFmt){
  if(rows.length===0) return `<div class="faint tiny">Nenhum registro nesta carreira.</div>`;
  return rows.map((r,i)=>`<div class="kv"><span>${i+1}. ${esc(r.name)}</span><span class="bold gold">${valueFmt(r.value)}</span></div>`).join("");
}
function renderCareerOver(){
  const titles = ST.history.filter(h=>h.result==="Campeão");
  const teams = [...new Set(ST.history.map(h=>h.team))];
  const peakRep = Math.max(50, ...ST.history.map(h=>h.reputation));
  const cs = ST.careerStats || {goals:{}, assists:{}, signings:[]};
  const topGoals = Object.entries(cs.goals).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,3);
  const topAssists = Object.entries(cs.assists).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,3);
  const topSignings = cs.signings.slice().sort((a,b)=>b.price-a.price).slice(0,5).map(s=>({name:s.name, value:s.price}));
  return `${cornerWatermarks()}
  ${titles.length>0?`<img src="${GOAT_MASCOT_URI}" alt="Mascote GOAT" class="goat-mascot" style="position:absolute;left:-30px;bottom:0;height:min(38vh,300px);width:auto;z-index:1;pointer-events:none;filter:drop-shadow(0 12px 30px rgba(0,0,0,.55));" />`:""}
  <div class="hero" style="position:relative;z-index:2;padding-top:24px;">
    <div class="trophy-glow" style="width:84px;height:84px;background:radial-gradient(circle at 40% 30%, #F5F6F8, #ADB5BD 55%, #6B7280 100%); box-shadow:0 0 60px 8px rgba(200,205,210,.35), inset 0 -8px 22px rgba(0,0,0,.35);">${trophyImg(84, titles.length>0?1:0.55)}</div>
    <div class="hero-badge" style="margin-top:8px;">CARREIRA ENCERRADA — 10 TEMPORADAS</div>
    <h1 class="hero-title" style="font-size:clamp(24px,5vw,40px);margin:4px 0 16px;">${titles.length>0? titles.length+" TÍTULO"+(titles.length>1?"S":"")+" DE LIBERTADORES" : "FIM DE CICLO"}</h1>
    <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:flex-start;width:100%;max-width:760px;">
      <div class="panel" style="flex:1 1 320px;max-width:360px;text-align:left;">
        <div class="panel-title">Resumo de ${esc(mgrName(ST.managerName))}</div>
        <div class="kv"><span>Times comandados</span><span class="bold">${teams.length} (${esc(teams.join(", "))})</span></div>
        <div class="kv"><span>Títulos de Libertadores</span><span class="bold gold">${titles.length}</span></div>
        <div class="kv"><span>Reputação de pico</span><span class="bold">${peakRep}</span></div>
      </div>
      <div class="panel" style="flex:1 1 320px;max-width:360px;text-align:left;">
        <div class="panel-title">Estatísticas da carreira</div>
        <div class="tiny faint uc" style="margin-top:2px;">⚽ Top 3 artilheiros</div>
        ${renderStatRankList(topGoals, v=>v+(v===1?" gol":" gols"))}
        <div class="divider"></div>
        <div class="tiny faint uc">🥾 Top 3 garçons</div>
        ${renderStatRankList(topAssists, v=>v+(v===1?" assistência":" assistências"))}
        <div class="divider"></div>
        <div class="tiny faint uc">💰 Top 5 contratações mais caras</div>
        ${renderStatRankList(topSignings, v=>fmtMoney(v))}
      </div>
    </div>
    <div class="panel mt16" style="max-width:760px;width:100%;text-align:left;">
      <div class="panel-title">Temporada a temporada</div>
      <div style="max-height:150px;overflow-y:auto;">
        ${ST.history.map(h=>`<div class="kv"><span>${h.year} — ${esc(h.team)}</span><span>${esc(h.result)}</span></div>`).join("")}
      </div>
    </div>
    <button class="btn btn-gold btn-lg mt16" onclick="Game.newCareerFromOver()">Começar nova carreira</button>
  </div>`;
}

// ============================================================
// PUBLIC HANDLERS (window.Game) — wired to onclick attributes
// ============================================================
const Game = {
  goHome(){ ST.stage="home"; render(); },
  openExternal(ev, url){
    // same escape hatches as the Instagram link — the game may run inside a sandboxed iframe
    try{ window.open(url, "_blank", "noopener,noreferrer"); }catch(e){}
    try{ if(window.top && window.top!==window) window.top.location.href = url; }catch(e){}
    if(ev && ev.preventDefault) ev.preventDefault();
  },
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
      const msg = ST.prelib
        ? "Você já tem uma tentativa de Pré-Libertadores em andamento. Iniciar algo novo agora vai apagar esse progresso. Continuar?"
        : "Você já tem uma carreira em andamento. Iniciar uma nova carreira vai apagar o progresso atual. Continuar?";
      ST.uiModal = {type:"confirm", message:msg, action:"confirmNewGame"};
      render();
      return;
    }
    ST.tmpSelectedTeam=null; ST.tmpManagerNameInput=""; ST.stage="brasa_team_select"; render();
  },
  chooseNormalCareer(){ ST.tmpSelectedTeam=null; ST.tmpManagerNameInput=""; ST.stage="team_select"; render(); },
  pickTeam(name){ ST.tmpSelectedTeam=name; render(); },
  confirmTeam(){ if(!ST.tmpSelectedTeam) return; ST.stage="manager_name"; render(); },
  beginCareer(){
    const inputEl = document.getElementById("mgrNameInput");
    const name = inputEl ? inputEl.value.trim() : "";
    startCareer(ST.tmpSelectedTeam, name || "Treinador");
    render();
  },
  chooseBrasileiraoCareer(){ ST.tmpSelectedTeam=null; ST.tmpManagerNameInput=""; ST.stage="brasa_team_select"; render(); },
  pickBrasaTeam(name){ ST.tmpSelectedTeam=name; render(); },
  confirmBrasaTeam(){ if(!ST.tmpSelectedTeam) return; ST.stage="brasa_manager_name"; render(); },
  beginBrasaCareer(){
    const inputEl = document.getElementById("mgrNameInput");
    const name = inputEl ? inputEl.value.trim() : "";
    startBrasileiraoCareer(ST.tmpSelectedTeam, name || "Treinador");
    render();
  },
  continueCareer(){
    ST.stage = ["match","penaltyShootout","prelib_champion"].includes(ST.stage) ? ST.stage : "hub";
    render();
  },

  goPreLib(){ ST.tmpPrelibTeam=null; ST.stage="prelib_select"; render(); },
  pickPreLibTeam(name){ ST.tmpPrelibTeam=name; render(); },
  confirmPreLibTeam(){ if(!ST.tmpPrelibTeam) return; ST.stage="prelib_manager_name"; render(); },
  beginPreLibRun(){
    const inputEl = document.getElementById("mgrNameInput");
    const name = inputEl ? inputEl.value.trim() : "";
    startPreLib(ST.tmpPrelibTeam, name || "Treinador");
    render();
  },
  retryPreLib(){ retryPreLibSameTeam(); render(); },
  beginPreLibCareer(){ crownPreLibChampion(ST.managerName); render(); },

  setTab(id){ ST.hubTab=id; render(); },
  setDesempenhoFilter(key){ ST.desempenhoFilter=key; render(); },
  toggleRomanoFlip(){
    // a quick two-frame "page turn": squeeze the card edge-on, swap which 5 deals are showing,
    // then open back up — same discrete-timed-render trick the training/penalty beats use,
    // since a full-string re-render can't rely on a CSS transition to animate the swap.
    ST.romanoFlipping = true;
    render();
    setTimeout(()=>{
      ST.romanoFlip = !ST.romanoFlip;
      ST.romanoFlipping = false;
      render();
    }, 160);
  },
  setClubStatsScope(scope){ ST.clubStatsScope = scope; render(); },
  setClubStatsYear(year){ ST.clubStatsYear = Number(year); render(); },
  // "Editar escalação" on the match-confirm screen: jump back to the hub's Elenco tab.
  // (previously this button's onclick called bare ST/render() directly in the HTML attribute —
  // those aren't real globals in the bundled output, so the click silently threw and could
  // leave the screen stuck mid-transition; routing through a proper Game method fixes that.)
  goEditLineup(){ ST.hubTab='elenco'; ST.stage='hub'; render(); },
  advance(){ advanceTournament(); dailyTransferTick(); if(ST.stage==="hub") maybeIncomingOffer(0.16); render(); },
  // match-day buttons — back to their pre-AVANÇAR-DIA behavior: simulate right away, at
  // whichever pace, once the calendar has actually counted down to the day of the match.
  advanceSlow(){ advanceWithSpeed("slow"); dailyTransferTick(); if(ST.stage==="hub") maybeIncomingOffer(0.16); render(); },
  advanceFast(){ advanceWithSpeed("fast"); dailyTransferTick(); if(ST.stage==="hub") maybeIncomingOffer(0.16); render(); },
  // "AVANÇAR DIA": ticks the calendar forward one day, rolls whatever mail that day
  // brings, and — once the countdown hits zero — swaps this card over to the match-day
  // buttons above instead of jumping into the match itself.
  advanceDay(){
    if(wcActive()){ wcAdvanceDay(); scheduleSave(); render(); return; } // Copa do Mundo: um dia por clique
    ensureCalendarCountdown();
    if(ST.calendarDaysLeft>0) ST.calendarDaysLeft--;
    ST.calendarWeekdayIdx = (ST.calendarWeekdayIdx+1)%7;
    generateDailyMail();
    dailyTransferTick(); // every rest day rolls for transfer news too, not just match days — see dailyTransferTick()
    // calendarDaysLeft hitting 0 just flips the card over to "DIA DO JOGO" — the actual
    // advanceTournament() call happens when the player clicks one of those buttons, exactly
    // like it always did before AVANÇAR DIA existed. A training day never interrupts match
    // day itself — only the rest days in between.
    if(ST.calendarDaysLeft>0){
      ST.daysSinceTraining = (ST.daysSinceTraining||0)+1;
      if(ST.daysSinceTraining>=2){
        ST.trainingPending = true;
        ST.daysSinceTraining = 0;
      }
    }
    scheduleSave();
    render();
  },
  // safety-valve button on the empty-card fallback (see renderNextMatchCard()) — forces every
  // still-unfinished cup straight to its real conclusion, same fast-forward autoFinishBackgroundCups()
  // already uses for the AI-only remainder once the player is confirmed to have no personal match
  // left, then lands on the normal season-end recap (troféus, reputação, artilheiros, colocação em
  // cada campeonato). Only ever reachable when the Brasileirão itself is already done, so there's no
  // league round left to skip — this can't cut short anything the player hadn't already finished.
  wcSimPhase(){
    if(!wcActive()) return;
    const ph = (wcNextEvent()||{}).phase;
    let g = 0;
    while(wcActive() && g++<60){ const ev = wcNextEvent(); if(!ev || ev.phase!==ph || wcMatchToday()) break; wcAdvanceDay(); }
    scheduleSave(); render();
  },
  wcSimAll(){
    let g = 0;
    while(wcActive() && g++<80){ if(wcMatchToday()) break; wcAdvanceDay(); }
    scheduleSave(); render();
  },
  setWcView(v){ if(ST.worldCup) ST.worldCup.view = v; render(); },
  toggleCompStat(){ ST.compStatView = ST.compStatView==="assisters" ? "scorers" : "assisters"; render(); },
  acceptNationalJob(id){ acceptNationalJob(id); render(); },
  declineNationalJob(id){ declineNationalJob(id); render(); },
  openCallup(){ wcOpenCallup(false); render(); },
  callupToggle(id){ wcCallupToggle(Number(id)); render(); },
  callupSlot(id){ wcCallupSlot(Number(id)); render(); },
  callupTab(id){ if(ST.wcCallup){ ST.wcCallup.tab = id; ST.wcCallup.more = false; } render(); },
  callupMore(){ if(ST.wcCallup) ST.wcCallup.more = !ST.wcCallup.more; render(); },
  callupAuto(){ const c = ST.wcCallup; if(!c) return; const a = WC.autoSelectSquad(wcCallupPool()); c.ids = a.ids; c.slots = a.slots; c.msg = ""; render(); },
  callupClear(){ const c = ST.wcCallup; if(!c) return; c.ids = []; c.slots = {}; c.msg = ""; render(); },
  callupConfirm(){ wcCallupConfirm(); render(); },
  callupClose(){ wcCallupClose(); render(); },
  skipWcDraw(){
    if(!ST.worldCup) return;
    if(drawTimer){ clearInterval(drawTimer); drawTimer = null; }
    ST.worldCup.drawRevealed = 48; render();
  },
  finishWcDraw(){
    if(drawTimer){ clearInterval(drawTimer); drawTimer = null; }
    ST.stage = "hub"; ST.hubTab = "competicao"; scheduleSave(); render();
  },
  finishWcEnd(){ ST.stage = "hub"; ST.hubTab = "competicao"; ST.calendarDaysLeft = null; ST.desempenhoFilter = "brasileirao"; scheduleSave(); render(); },
  forceEndSeason(){
    autoFinishBackgroundCups();
    scheduleSave();
    render();
  },
  simulateTraining(){
    ST.trainingAnimating = true;
    render();
    setTimeout(()=>{
      ST.trainingAnimating = false;
      runSquadTraining();
      render();
    }, 3000);
  },
  finishTrainingDay(){ finishTrainingDay(); render(); },
  skipTraining(){ skipSquadTraining(); render(); },
  openMail(id){ const m=findMail(id); if(m) m.read=true; ST.openMailId=id; scheduleSave(); render(); },
  // same as openMail, but also jumps the hub over to the E-mail tab first — used by the
  // "Últimos E-mails" shortcut on the Competição tab.
  openLatestMail(id){ ST.hubTab="email"; const m=findMail(id); if(m) m.read=true; ST.openMailId=id; scheduleSave(); render(); },
  closeMail(){ ST.openMailId=null; render(); },
  negotiateOffer(id, askedAmount){ negotiateOffer(id, askedAmount); render(); },
  updateAskWords(inputEl, mailId){ formatMoneyInputEl(inputEl, "askWords_"+mailId); },
  negotiateOfferFromInput(mailId){
    const el = document.getElementById("askInput_"+mailId);
    negotiateOffer(mailId, el ? digitsFromMoneyInput(el.value) : null);
    render();
  },
  acceptMailOffer(id){ acceptMailOffer(id); render(); },
  rejectMailOffer(id){ rejectMailOffer(id); render(); },

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
    if(sellLocked(p)) return;
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
    else if(m.action==="confirmNewGame") { ST.tmpSelectedTeam=null; ST.tmpManagerNameInput=""; ST.stage="brasa_team_select"; }
    else if(m.action==="clearInbox") clearInbox();
    render();
  },
  markAllMailRead(){ markAllMailRead(); render(); },
  clearInboxConfirm(){
    ST.uiModal = {type:"confirm", message:"Tem certeza que quer limpar a caixa de entrada? Todos os e-mails serão apagados — isso não pode ser desfeito.", action:"clearInbox"};
    render();
  },
  openFaModal(playerId){ ST.uiModal = {type:"faSign", playerId}; render(); },
  signFreeAgent(playerId){
    const res = signFreeAgent(playerId);
    if(res.ok){ ST.uiModal = {type:"faSign", playerId, done:true, msg:res.msg}; render(); setTimeout(()=>{ if(ST.uiModal && ST.uiModal.type==="faSign" && ST.uiModal.done){ ST.uiModal=null; render(); } }, 1800); }
    else { ST.uiModal = {type:"faSign", playerId, err:res.msg}; render(); }
  },
  injuredAuto(){ ST.matchLineupOverride = buildAutoSubstitutes(); ST.uiModal = null; resumeAfterLineupChoice(); render(); },
  injuredManual(){ ST.uiModal = {type:"injuredPick", picks:{}}; render(); },
  injuredPick(slotIdx, playerId){ if(ST.uiModal && ST.uiModal.type==="injuredPick"){ ST.uiModal.picks[slotIdx] = playerId ? Number(playerId) : null; render(); } },
  injuredConfirm(){
    const m = ST.uiModal; if(!m || m.type!=="injuredPick") return;
    const ids = ST.lineup.slice();
    unavailableStarterSlots().forEach(i=>{ if(m.picks[i]) ids[i] = m.picks[i]; });
    ST.matchLineupOverride = ids; ST.uiModal = null; resumeAfterLineupChoice(); render();
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
  updateOfferWords(inputEl){ formatMoneyInputEl(inputEl, "offerWords"); },
  submitOffer(playerId, team){
    const m = ST.uiModal;
    if(!m || m.signing) return;
    const input = document.getElementById("offerInput");
    const offer = Math.max(0, digitsFromMoneyInput(input ? input.value : ""));
    const res = submitBuyProposal(team, playerId, offer);
    if(res.deal){
      m.signing = true; m.signMsg = "Contrato Assinado!";
      render();
      setTimeout(()=>{ ST.uiModal=null; render(); }, 2200);
    } else if(!res.verdict){
      const msgEl = document.getElementById("offerMsg");           // a plain validation message (budget, empty value, cooldown)
      if(msgEl) msgEl.innerHTML = `<span class="red">${esc(res.msg)}</span>`;
    } else render();                                                // a real answer from the director: redraw the mood bar and thread
  },
  acceptCounter(playerId, team){
    const m = ST.uiModal; if(!m || m.signing) return;
    const sess = ST.negs && ST.negs[team+":"+playerId]; if(!sess) return;
    const res = submitBuyProposal(team, playerId, sess.neg.now);
    if(res.deal){
      m.signing = true; m.signMsg = "Contrato Assinado!";
      render();
      setTimeout(()=>{ ST.uiModal=null; render(); }, 2200);
    } else {
      const msgEl = document.getElementById("offerMsg");
      if(msgEl) msgEl.innerHTML = `<span class="red">${esc(res.msg||"Não foi possível fechar agora.")}</span>`;
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
  generateScout(){ requestScoutReport(); render(); },
  upgradeScout(){ upgradeScoutLevel(); render(); },
  observePlayer(id, teamKey){ observePlayer(teamKey, Number(id)); render(); },

  simulateMatch(){ simulatePendingMatch(); render(); },
  openTimeConfig(){ ST.uiModal = {type:"timeConfig"}; render(); },
  openSeasonTOTY(){ ST.uiModal = {type:"seasonTOTY"}; render(); },
  setMatchSpeed(speed){
    ST.matchSpeed = speed;
    if(ST.uiModal && ST.uiModal.type==="timeConfig") ST.uiModal = null;
    render();
  },
  skipMatch(){
    resolveAllPendingPenalties(ST.pendingMatch);
    ST.uiModal = null;
    ST.matchAnimIdx = ST.pendingMatch.result.events.length;
    // "slow" mode's matchAnimDone() checks the minute clock, not matchAnimIdx — without this
    // the skip button revealed every event immediately but the clock kept grinding forward
    // 1 minute at a time until it reached 90, making the skip look like it did nothing.
    ST.matchClockMinute = 90;
    render();
  },
  // picking the taker doesn't resolve the kick right away — the card opens on "{PLAYER}
  // COBRA..." over an empty goal for a brief, light suspense beat, then the same line swaps
  // to the actual (randomly-flavored, green/red) outcome sentence once it's computed.
  takePenalty(playerId){
    const pm = ST.pendingMatch;
    const m = ST.uiModal;
    if(!pm || !m || m.type!=="penaltyPicker") return;
    const eventIndex = m.eventIndex;
    const ev = pm.result.events[eventIndex];
    const atkTeamName = ev.side==="home" ? pm.ref.home : pm.ref.away;
    const shooter = playerById(atkTeamName, Number(playerId));
    ST.uiModal = {type:"penaltyKick", phase:"waiting", playerName: shooter ? shooter.name : "Cobrador"};
    render();
    setTimeout(()=>{
      if(!ST.uiModal || ST.uiModal.type!=="penaltyKick" || ST.uiModal.phase!=="waiting") return; // guards a stray double-fire
      const outcome = resolvePendingPenaltyEvent(pm, eventIndex, Number(playerId));
      if(!outcome){ ST.uiModal = null; ST.matchAnimIdx = eventIndex + 1; render(); return; }
      ST.uiModal = {type:"penaltyKick", phase:"result", scored:outcome.scored, flavor:outcome.flavor, playerName:outcome.playerName};
      scheduleSave();
      render();
      setTimeout(()=>{
        if(ST.uiModal && ST.uiModal.type==="penaltyKick" && ST.uiModal.phase==="result"){
          ST.uiModal = null;
          ST.matchAnimIdx = eventIndex + 1;
          render();
        }
      }, 2600);
    }, 1800); // "poucos segundos, leve suspense" — shorter than a real kick, just enough tension
  },
  continueAfterMatch(){ finishPendingMatch(); render(); },

  // drives the penalty-shootout reveal, one beat at a time: name first, then (after a pause)
  // the result — exactly like a real shootout broadcast graphic.
  tickShootout(){
    const s = ST.penaltyShootout;
    if(!s || s.phase!=="kicking") return;
    const i = s.revealIdx;
    if(!s.nameShown[i]){
      s.nameShown[i] = true;
      render();
      setTimeout(()=>Game.tickShootout(), 2000);
      return;
    }
    if(!s.resultShown[i]){
      s.resultShown[i] = true;
      const k = s.kicks[i];
      if(k.scored){ if(k.team==="A") s.scoreA++; else s.scoreB++; }
      // decide BEFORE painting, so a decisive kick's render already shows the "vence a
      // disputa" banner instead of sitting one frame behind on "preparando a próxima".
      if(shootoutDecided(s)){
        s.phase = "done";
        render();
        setTimeout(()=>Game.finishShootout(), 2400);
      } else {
        render();
        setTimeout(()=>{ s.revealIdx++; Game.tickShootout(); }, 1300);
      }
    }
  },
  // resolves every remaining kick instantly, using the exact same scoring/stopping rule as the
  // live reveal, then hands off to finishShootout() to apply the result — for players who just
  // want the outcome instead of watching each kick land.
  skipShootout(){
    const s = ST.penaltyShootout;
    if(!s || s.phase!=="kicking") return;
    for(let i=s.revealIdx; i<s.kicks.length; i++){
      s.revealIdx = i;
      s.nameShown[i] = true;
      if(!s.resultShown[i]){
        s.resultShown[i] = true;
        const k = s.kicks[i];
        if(k.scored){ if(k.team==="A") s.scoreA++; else s.scoreB++; }
      }
      if(shootoutDecided(s)) break;
    }
    s.phase = "done";
    Game.finishShootout();
  },
  finishShootout(){
    const s = ST.penaltyShootout;
    if(!s) return;
    const winner = s.scoreA>s.scoreB ? s.teamAName : s.teamBName;
    const ctx = s.resolveCtx;
    ST.penaltyShootout = null;
    applyShootoutResult(ctx, winner);
    scheduleSave();
    render();
  },

  showNews(){ ST.uiModal={type:"news"}; render(); },
  continueSeason(){ continueFromSeasonEnd(); maybeIncomingOffer(0.30); render(); },
  skipGroupDraw(){
    if(drawTimer){ clearInterval(drawTimer); drawTimer = null; }
    ST.drawRevealed = 32;
    render();
  },
  finishGroupDraw(){
    ST.stage = "hub"; ST.hubTab = "competicao";
    scheduleSave();
    render();
  },
  skipCopaDraw(){
    if(drawTimer){ clearInterval(drawTimer); drawTimer = null; }
    ST.copaDoBrasil.drawRevealed = 16;
    render();
  },
  finishCopaDraw(){
    ST.stage = "hub"; ST.hubTab = "competicao";
    scheduleSave();
    render();
  },
  skipCopaQfDraw(){
    if(drawTimer){ clearInterval(drawTimer); drawTimer = null; }
    ST.copaDoBrasil.qfDrawRevealed = 8;
    render();
  },
  finishCopaQfDraw(){
    ST.stage = "hub"; ST.hubTab = "competicao";
    scheduleSave();
    render();
  },
  continueIntercontinental(){
    ST.intercontinental.phase = "ic_semi";
    advanceIntercontinentalStep();
    scheduleSave();
    render();
  },
  acceptJob(name){ selectNewJob(name); maybeIncomingOffer(0.30); render(); },
  stayJob(){ stayAtCurrentJob(); maybeIncomingOffer(0.30); render(); },
  newCareerFromOver(){ resetCareer(); },
};
window.Game = Game;
window.ST = null; // populated below after init for console/debug convenience

// ============================================================
// COPA DO MUNDO (formato 2026: 48 seleções, 12 grupos de 4, 16-avos → final)
//
// Em ano de Copa (2026, 2030, 2034...) o Brasileirão (e todas as copas) PARA depois da rodada
// WC_BREAK_ROUND e o torneio inteiro é jogado dia a dia (jogos a cada 2/3 dias). O treinador só
// recebe convite de seleção UM ANO ANTES (ver maybeNationalOffers): aceitando, convoca 26
// jogadores nascidos no país e comanda a seleção durante a Copa — para isso o jogo troca
// temporariamente ST.teamId pela seleção (ST.natDuty guarda o clube) e reaproveita TODO o fluxo de
// partida/escalação/pênaltis dos clubes. Sem convite (ou recusando) a Copa é só acompanhada.
// A lógica pura (nações, sorteio, chaveamento, convocação) está em worldcup.ts.
// ============================================================
const WC_NAME_POOLS = { // nomes de apoio para completar elencos de seleções com poucos jogadores na base
  UEFA: IC_NAME_POOLS.euro, CONMEBOL: IC_NAME_POOLS.concacaf, CONCACAF: IC_NAME_POOLS.concacaf,
  CAF: IC_NAME_POOLS.asia, AFC: IC_NAME_POOLS.asia, OFC: IC_NAME_POOLS.asia,
};
let wcPoolCache = null; // índice jogadores-por-país, montado sob demanda (a tela de convocação reusa)

function wcActive(){ return !!(ST && ST.worldCup && ST.worldCup.active); }
function wcInfo(key){ return (ST && ST.worldCup && ST.worldCup.info) ? (ST.worldCup.info[key] || null) : null; }
function wcFlagImg(code, w){
  w = w || 22;
  const h = Math.round(w*0.75);
  return `<img class="wc-flag" src="${WC.flagUrl(code)}" alt="" width="${w}" height="${h}" style="width:${w}px;height:${h}px;"/>`;
}
function wcFlagOf(key, w){ const i = wcInfo(key); return i ? wcFlagImg(i.code, w) : ""; }
function wcCrest(code, size){
  return `<span class="wc-crest" style="width:${size}px;height:${size}px;"><img src="${WC.flagUrl(code)}" alt="" width="${size}" height="${Math.round(size*0.75)}" style="width:${size}px;height:${Math.round(size*0.75)}px;"/></span>`;
}
function wcTeamLabel(key, w){ return `<span class="wc-team">${wcFlagOf(key, w||20)}<span class="wc-team-name">${esc(key)}</span></span>`; }

// ---------- players by country ----------
function wcPoolIndex(){
  ensureGlobalMarket();
  const byNat = new Map(), club = new Map(), seen = new Set();
  const add = (p, clubName)=>{
    if(!p || seen.has(p.id)) return;
    seen.add(p.id);
    const nn = WC.nationOf((p.nat==="Brasil" && NAT_FIX[p.name]) || p.nat); // estrangeiros que jogam em clubes brasileiros não são brasileiros
    if(!nn) return;
    if(!byNat.has(nn.en)) byNat.set(nn.en, []);
    byNat.get(nn.en).push(p);
    club.set(p.id, clubName || p.club || "");
  };
  Object.values(ST.world.teams).forEach(t=>{ if(t.isNation) return; t.players.forEach(p=>add(p, t.name)); });
  (ST.world.globalMarket||[]).forEach(p=>add(p, p.club));
  (ST.world.prelibMarket||[]).forEach(p=>add(p, p.club));
  return {byNat, club};
}
function wcNormalizePlayer(p){
  if(p.injured==null) p.injured = false;
  if(p.suspended==null) p.suspended = false;
  if(p.form==null) p.form = 0;
  if(!(p.suspendedMatches>0)) p.suspendedMatches = 0;
  if(!(p.injuredMatches>0)) p.injuredMatches = 0;
  if(!Array.isArray(p.altPos)) p.altPos = [p.pos];
}
function wcFiller(nat, pos, baseOvr, rng){
  const pool = WC_NAME_POOLS[nat.conf] || WC_NAME_POOLS.CAF;
  const age = 22 + Math.floor(rng()*10);
  const isGk = pos==="GK";
  const ovr = E.clamp(Math.round(baseOvr + (rng()-0.5)*8), 44, 78);
  const j = spread => E.clamp(ovr + Math.floor((rng()-0.5)*spread), 30, 90);
  return {id:nextId(), name:pick(rng,pool[0])+" "+pick(rng,pool[1]), nat:nat.en, age, pos, altPos:[pos], ovr, pot:ovr,
    pac:j(16), sho:isGk?Math.floor(rng()*20)+15:j(14), pas:j(12), dri:isGk?j(18):j(12), de:j(14), phy:j(12), gk:isGk?j(12):Math.floor(rng()*20)+15,
    value:E.calcValue(ovr,age,ovr), foot:rng()<0.78?"Right foot":"Left foot", club:"", generated:true,
    injured:false, suspended:false, form:0, suspendedMatches:0, injuredMatches:0};
}
function wcStrengthOf(en, byNat){
  const players = byNat.get(en) || [];
  const sel = WC.autoSelectSquad(players);
  const byId = new Map(players.map(p=>[p.id, p]));
  const objs = sel.ids.map(id=>byId.get(id)).filter(Boolean);
  const top = objs.slice().sort((a,b)=>b.ovr-a.ovr).slice(0, 11);
  const base = Math.max(48, (top.length ? top.reduce((a,p)=>a+p.ovr,0)/top.length : 58) - 9);
  return WC.squadStrength(objs.concat(sel.fillers.map(pos=>({pos, ovr:Math.round(base)}))));
}
// the 26-man squad of one nation (real players where they exist, local fillers otherwise)
function wcBuildSquad(en, byNat, rng, keepIds){
  const nat = WC.nationByEn(en);
  const players = byNat.get(en) || [];
  const sel = WC.autoSelectSquad(players, keepIds||[]);
  const byId = new Map(players.map(p=>[p.id, p]));
  const out = sel.ids.map(id=>byId.get(id)).filter(Boolean);
  out.forEach(wcNormalizePlayer);
  const top = out.slice().sort((a,b)=>b.ovr-a.ovr).slice(0, 11);
  const base = Math.max(48, (top.length ? top.reduce((a,p)=>a+p.ovr,0)/top.length : 58) - 9);
  sel.fillers.forEach(pos=> out.push(wcFiller(nat, pos, base, rng)));
  return out;
}
// who qualifies for a given World Cup (computed once and remembered — the offers a year earlier
// and the tournament itself must agree on the field)
function wcPlanFor(year){
  if(!ST.wcPlan) ST.wcPlan = {};
  if(ST.wcPlan[year]) return ST.wcPlan[year];
  const idx = wcPoolIndex();
  const rng = E.makeRNG(nextSeed());
  const strength = {}, cands = [];
  WC.NATIONS.forEach(nn=>{
    if(nn.banned) return;
    const s = wcStrengthOf(nn.en, idx.byNat);
    strength[nn.en] = Math.round(s*10)/10;
    cands.push({en:nn.en, conf:nn.conf, strength:s});
  });
  const qualified = WC.qualify(year, cands, rng);
  const ranking = qualified.slice().sort((a,b)=>strength[b]-strength[a]);
  ST.wcPlan[year] = {year, qualified, ranking, strength:Object.fromEntries(qualified.map(en=>[en, strength[en]]))};
  return ST.wcPlan[year];
}

// ---------- proposals (only the year BEFORE a World Cup) ----------
function wcPerformanceScore(){
  let s = ST.reputation || 50;
  if(ST.brasileirao && ST.brasileirao.division==="B") s -= 10; // a Série B manager is a harder sell to a national team
  try{
    const t = brasaSortedStandings();
    const row = t.find(r=>r.team===ST.teamId);
    if(row && row.played>=4){
      const pos = t.findIndex(r=>r.team===ST.teamId)+1;
      s += pos<=2 ? 12 : pos<=4 ? 8 : pos<=8 ? 3 : pos<=14 ? 0 : -8;
    }
  }catch(e){ /* standings not ready */ }
  const last = ST.lastSeasonSummary;
  if(last && last.compCards) last.compCards.forEach(c=>{ if(c.won) s += (c.key==="lib"||c.key==="ic") ? 8 : 5; });
  return E.clamp(s, 0, 120);
}
function wcTierLabel(rank){
  return rank<=4 ? "Candidata ao título" : rank<=12 ? "Favorita ao título" : rank<=24 ? "Seleção de bom nível" : rank<=36 ? "Zebra em potencial" : "Aposta de longo prazo";
}
function maybeNationalOffers(){
  if(ST.mode!=="brasileirao" || ST.natDuty || wcActive() || ST.natJob) return;
  const year = ST.seasonYear + 1;
  if(!WC.isWorldCupYear(year)) return;           // seleção só convida no ANO ANTERIOR à Copa
  const b = ST.brasileirao;
  if(!b) return;
  if(!ST.wcOffers) ST.wcOffers = {};
  const rec = ST.wcOffers[year] || (ST.wcOffers[year] = {tries:0, sent:0});
  const when = rec.tries===0 ? 10 : rec.tries===1 ? 26 : 99;
  if(b.currentRound < when) return;
  rec.tries++;
  const plan = wcPlanFor(year);
  const perf = wcPerformanceScore();
  const rng = E.makeRNG(nextSeed());
  let band, count;
  if(perf>=90){ band=[1,8]; count = 2 + (rng()<0.5?1:0); }
  else if(perf>=80){ band=[3,14]; count = 2 + (rng()<0.4?1:0); }
  else if(perf>=70){ band=[8,24]; count = 1 + (rng()<0.5?1:0); }
  else if(perf>=60){ band=[16,34]; count = 1 + (rng()<0.3?1:0); }
  else if(perf>=48){ band=[28,46]; count = rng()<0.7 ? 1 : 0; }
  else { band=[36,48]; count = rng()<0.3 ? 1 : 0; }   // mal nos resultados: seleções piores — ou nenhuma proposta
  if(!count || rec.sent>0) return;
  const pool = shuffled(rng, plan.ranking.slice(band[0]-1, band[1]));
  pool.slice(0, count).forEach(en=>{
    const nat = WC.nationByEn(en);
    const rank = plan.ranking.indexOf(en)+1;
    addMail({
      type:"nacional",
      subject:`Convite: seleção ${nat.pt} — Copa do Mundo ${year}`,
      from:`Federação de Futebol — ${nat.pt}`,
      preview:`A ${nat.pt} quer você no comando para a Copa do Mundo ${year}.`,
      payload:{year, nation:en, pt:nat.pt, code:nat.code, rank, tier:wcTierLabel(rank), status:"pending", daysLeft:30},
    });
    rec.sent++;
  });
  ST.newsLog.unshift({title:"Convite de seleção!", text:`Você recebeu ${rec.sent>1?"propostas":"uma proposta"} para comandar uma seleção na Copa do Mundo ${year}. Veja no E-mail.`});
}
function tickNationalOfferExpiry(){
  inboxList().filter(m=>m.type==="nacional" && m.payload.status==="pending").forEach(m=>{
    m.payload.daysLeft--;
    if(m.payload.daysLeft<=0) m.payload.status = "expired";
  });
}
function acceptNationalJob(mailId){
  const mail = findMail(mailId);
  if(!mail || mail.type!=="nacional" || mail.payload.status!=="pending" || ST.natJob) return;
  const pl = mail.payload;
  pl.status = "accepted";
  inboxList().forEach(m=>{ if(m.type==="nacional" && m!==mail && m.payload.status==="pending") m.payload.status = "withdrawn"; });
  ST.natJob = {year:pl.year, nation:pl.nation, pt:pl.pt, code:pl.code, squadIds:[], done:false};
  ST.newsLog.unshift({title:`Novo técnico da seleção ${pl.pt}!`, text:`Você aceitou comandar a ${pl.pt} na Copa do Mundo ${pl.year}. A convocação abre na temporada ${pl.year}.`});
  scheduleSave();
}
function declineNationalJob(mailId){
  const mail = findMail(mailId);
  if(!mail || mail.type!=="nacional" || mail.payload.status!=="pending") return;
  mail.payload.status = "declined";
  scheduleSave();
}
function wcOfferStatusLabel(s){
  return {pending:"Aguardando sua resposta", accepted:"Convite aceito", declined:"Convite recusado", expired:"Convite expirado", withdrawn:"Convite retirado (você aceitou outra seleção)"}[s] || s;
}
function renderNationalMailBody(m){
  const pl = m.payload;
  const pending = pl.status==="pending";
  return `<div class="panel mt16 wc-offer">
    <div class="wc-offer-head">
      ${wcFlagImg(pl.code, 64)}
      <div>
        <div class="faint tiny uc">Convite oficial</div>
        <div class="wc-offer-title">Seleção ${esc(pl.pt)}</div>
        <div class="dim small">${esc(pl.tier)} · ${pl.rank}ª força entre as 48 seleções da Copa</div>
      </div>
      <div class="wc-offer-trophy">${competitionTrophyImg("worldcup", 70, 1)}</div>
    </div>
    <p class="small dim mt16">A federação acompanhou o seu trabalho e quer você no comando da seleção na <b>Copa do Mundo ${pl.year}</b>. Você continua no seu clube: a seleção só joga durante o torneio, quando todos os campeonatos fazem uma pausa.</p>
    <ul class="wc-offer-list small">
      <li>Convocação de <b>26 jogadores nascidos em ${esc(pl.pt)}</b> (3 goleiros, 4 zagueiros, 4 laterais, 3 volantes, 4 meias, 3 pontas, 3 atacantes e 2 vagas livres)</li>
      <li>Formato 2026: 48 seleções, 12 grupos, os 2 melhores de cada + os 8 melhores terceiros avançam</li>
      <li>Jogos a cada 2 ou 3 dias, em jogo único no mata-mata</li>
    </ul>
    ${pending ? `<div class="btn-row mt16">
      <button class="btn btn-gold" onclick="Game.acceptNationalJob('${m.id}')">Aceitar a seleção ${esc(pl.pt)}</button>
      <button class="btn" onclick="Game.declineNationalJob('${m.id}')">Recusar</button>
    </div><div class="tiny faint mt8">O convite vale por mais ${pl.daysLeft} dia${pl.daysLeft===1?"":"s"}.</div>`
    : `<div class="wc-offer-status mt16 ${pl.status==="accepted"?'green':'dim'} bold">${esc(wcOfferStatusLabel(pl.status))}</div>`}
  </div>`;
}

// ---------- tournament setup ----------
function wcKeyFor(nat){
  let key = nat.pt;
  if(ST.world.teams[key] && !ST.world.teams[key].isNation) key = nat.pt+" (Seleção)";
  return key;
}
// the Brasileirão (and every cup) stops here — see finishBrasaRound()
function wcBreakDue(){
  return ST.mode==="brasileirao" && WC.isWorldCupYear(ST.seasonYear) && !wcActive()
    && !(ST.wcDone && ST.wcDone[ST.seasonYear]) && ST.brasileirao && ST.brasileirao.currentRound===WC.WC_BREAK_ROUND;
}
function wcStartBreak(){
  const job = ST.natJob;
  if(job && job.year===ST.seasonYear && !job.done){ wcOpenCallup(true); return; }   // a convocação é obrigatória antes do apito inicial
  beginWorldCup();
}
function beginWorldCup(){
  const year = ST.seasonYear;
  if(!ST.wcDone) ST.wcDone = {};
  ST.wcDone[year] = true;
  const idx = wcPoolIndex();
  const plan = wcPlanFor(year);
  const rng = E.makeRNG(nextSeed());
  const job = (ST.natJob && ST.natJob.year===year && plan.qualified.includes(ST.natJob.nation)) ? ST.natJob : null;
  const info = {}, keyOf = {}, strength = {};
  plan.qualified.forEach(en=>{
    const nat = WC.nationByEn(en);
    const key = wcKeyFor(nat);
    keyOf[en] = key;
    info[key] = {en, pt:nat.pt, code:nat.code, conf:nat.conf};
    const players = wcBuildSquad(en, idx.byNat, rng, job && job.nation===en ? job.squadIds : []);
    strength[key] = WC.squadStrength(players);
    ST.world.teams[key] = {name:key, country:nat.pt, flag:"", group:null, source:"wc", isNation:true, nationEn:en, players};
  });
  const drawn = WC.drawGroups(plan.qualified.map(en=>({en, conf:WC.nationByEn(en).conf, strength:plan.strength[en]})), WC.hostsOf(year), rng);
  const groups = {}, fixtures = {};
  let mid = 0;
  Object.keys(drawn).forEach(g=>{
    groups[g] = drawn[g].map(en=>keyOf[en]);
    fixtures[g] = WC.groupMatchdays(groups[g]).map(md=>md.map(([h,a])=>({id:"G"+(++mid), group:g, home:h, away:a, hs:null, as:null, played:false})));
  });
  ST.worldCup = {
    year, active:true, day:0, phase:"groups", view:"grupos",
    info, groups, fixtures, table:{}, ko:{r32:[], r16:[], qf:[], sf:[], third:[], final:[]},
    events: WC.WC_SCHEDULE.map(e=>Object.assign({}, e, {done:false})),
    strength, reached:{}, userKey:null, userSettled:false, userResult:null,
    champion:null, runnerUp:null, third:null, fourth:null,
    scorers:{}, assisters:{}, lastEvent:null, thirdsQual:[], groupRank:{},
    hosts: WC.hostsOf(year).map(en=>keyOf[en]).filter(Boolean),
  };
  if(job){
    const key = keyOf[job.nation];
    ST.worldCup.userKey = key;
    ST.natDuty = {club:ST.teamId, lineup:ST.lineup, formation:ST.formation, captainId:ST.captainId, key, nation:job.nation, year};
    ST.teamId = key; ST.formation = "4-3-3"; ST.lineup = []; ST.captainId = null;
    autoFillLineup();
    if(ST.hubTab==="transfers" || ST.hubTab==="scout" || ST.hubTab==="clube" || ST.hubTab==="desempenho") ST.hubTab = "competicao";
  }
  ST.stage = "wc_draw"; ST.hubTab = "competicao"; ST.uiModal = null;   // first the draw ceremony, then the tournament
  ST.worldCup.drawRevealed = 0;
  startWcDrawAnimation();
  ST.desempenhoFilter = "wc";
  ST.calendarDaysLeft = null; ST.trainingPending = false;
  ST.newsLog.unshift({title:`Começa a Copa do Mundo ${year}!`, text: job ? `Todos os campeonatos pararam. Você comanda a seleção ${job.pt}: grupo ${Object.keys(groups).find(g=>groups[g].includes(ST.worldCup.userKey))}.` : `Todos os campeonatos pararam: 48 seleções disputam a Copa do Mundo ${year}.`});
  scheduleSave();
}
// ceremony: 48 slots revealed pot by pot (pot 1 for groups A..L, then pot 2, ...)
function startWcDrawAnimation(){
  if(drawTimer){ clearInterval(drawTimer); drawTimer = null; }
  drawTimer = setInterval(()=>{
    if(ST.stage!=="wc_draw" || !ST.worldCup){ clearInterval(drawTimer); drawTimer = null; return; }
    ST.worldCup.drawRevealed = (ST.worldCup.drawRevealed||0)+1;
    if(ST.worldCup.drawRevealed>=48){ clearInterval(drawTimer); drawTimer = null; }
    render();
  }, 380);
}
function renderWcDraw(){
  const wc = ST.worldCup;
  const letters = Object.keys(wc.groups);
  const revealed = wc.drawRevealed||0;
  const done = revealed>=48;
  const pot = Math.min(4, Math.floor(Math.max(0, revealed-1)/12)+1);
  const boxes = letters.map((L, gIdx)=>{
    const slots = wc.groups[L].map((key, potIdx)=>{
      const step = potIdx*12 + gIdx;
      if(step>=revealed) return `<div class="draw-slot draw-slot-empty"><span class="wc-pot">P${potIdx+1}</span><span class="draw-slot-roll"></span></div>`;
      const isNew = step===revealed-1;
      return `<div class="draw-slot${isNew?" draw-slot-reveal":""}${key===wc.userKey?" draw-slot-user":""}">
        <span class="wc-pot">P${potIdx+1}</span>
        <span class="draw-slot-crest wc-draw-flag">${wcFlagOf(key, 22)}</span>
        <span class="draw-slot-name">${esc(key)}</span>
      </div>`;
    }).join("");
    return `<div class="draw-group"><div class="draw-group-title">Grupo ${L}</div>${slots}</div>`;
  }).join("");
  const potTxt = done ? "Sorteio concluído" : `Sorteando o pote ${pot} de 4`;
  return `${cornerWatermarks()}<div class="draw-screen wc-draw">
    <div class="draw-header">
      <div class="draw-trophy">${renderWcTrophy(110)}</div>
      <div class="draw-title-badge">FIFA</div>
      <h1 class="draw-title">Copa do Mundo ${wc.year}</h1>
      <div class="draw-year">SORTEIO DOS GRUPOS · 48 SELEÇÕES · ${potTxt.toUpperCase()}</div>
    </div>
    <div class="draw-grid wc-draw-grid">${boxes}</div>
    <div class="tiny faint mt16 tac">Quatro potes de 12 seleções (anfitriãs no pote 1). Nenhum grupo tem duas seleções da mesma confederação — exceto a UEFA, que pode ter duas.</div>
    <div class="btn-row center mt24">
      ${done
        ? `<button class="btn btn-gold btn-lg" onclick="Game.finishWcDraw()">Começar a Copa →</button>`
        : `<button class="btn btn-ghost" onclick="Game.skipWcDraw()">Pular animação (SKIP)</button>`}
    </div>
  </div>`;
}
function wcEvent(key){ return ST.worldCup.events.find(e=>e.key===key); }
function wcNextEvent(){ return ST.worldCup.events.find(e=>!e.done) || null; }
function wcEventMatches(ev){
  const wc = ST.worldCup;
  if(ev.phase==="groups"){ const out = []; Object.keys(wc.fixtures).forEach(g=>wc.fixtures[g][ev.md].forEach(m=>out.push(m))); return out; }
  return wc.ko[ev.phase] || [];
}
function wcUserMatchIn(ev){
  const wc = ST.worldCup;
  if(!wc.userKey || !ST.natDuty) return null;
  return wcEventMatches(ev).find(m=>!m.played && (m.home===wc.userKey || m.away===wc.userKey)) || null;
}
// the user's next match, wherever it falls in the calendar
function wcNextUserMatch(){
  const wc = ST.worldCup;
  if(!wc.userKey || !ST.natDuty) return null;
  for(const ev of wc.events){
    if(ev.done) continue;
    const m = wcUserMatchIn(ev);
    if(m) return {m, ev};
  }
  return null;
}
function wcMatchToday(){
  const ev = wcNextEvent();
  return !!(ev && ST.worldCup.day>=ev.day && wcUserMatchIn(ev));
}
function wcStageName(phase){
  return {groups:"Fase de Grupos", r32:"16-avos de final", r16:"Oitavas de final", qf:"Quartas de final", sf:"Semifinal", third:"Disputa do 3º lugar", final:"Final"}[phase] || phase;
}
function wcWinnerOf(m){ return m.winner || (m.hs>m.as ? m.home : m.as>m.hs ? m.away : null); }
function wcPenWinner(m){
  const wc = ST.worldCup, rng = E.makeRNG(nextSeed());
  const p = E.clamp(0.5 + ((wc.strength[m.home]||60) - (wc.strength[m.away]||60))/70, 0.38, 0.62);
  return rng()<p ? m.home : m.away;
}
function wcNoteResult(m, ev){
  const wc = ST.worldCup;
  wc.reached[m.home] = wcStageName(ev.phase); wc.reached[m.away] = wcStageName(ev.phase);
  if(!wc.lastEvent || wc.lastEvent.key!==ev.key) wc.lastEvent = {key:ev.key, label:ev.label, results:[]};
  wc.lastEvent.results.push({home:m.home, away:m.away, hs:m.hs, as:m.as, pens:!!m.pens, winner:m.winner||null, group:m.group||null});
}
function wcSimMatch(m, ev){
  const wc = ST.worldCup;
  const res = simFast(m.home, m.away, "wc");
  m.hs = res.homeScore; m.as = res.awayScore; m.played = true;
  if(ev.phase==="groups") E.applyResultToStandings(wc.table, m.home, m.away, m.hs, m.as);
  else { m.winner = m.hs>m.as ? m.home : m.as>m.hs ? m.away : wcPenWinner(m); if(m.hs===m.as) m.pens = true; }
  wcNoteResult(m, ev);
}
function wcAdvanceDay(){
  const wc = ST.worldCup;
  if(!wc || !wc.active) return;
  const ev = wcNextEvent();
  if(!ev){ finishWorldCup(); return; }
  if(wc.day < ev.day){
    wc.day++;
    ST.calendarWeekdayIdx = (ST.calendarWeekdayIdx+1)%7;
    ST.dayCounter = (ST.dayCounter||0)+1;
  }
  if(wc.day>=ev.day && !wcUserMatchIn(ev)){
    startRatingRound();
    wcEventMatches(ev).forEach(m=>{ if(!m.played) wcSimMatch(m, ev); });
    wcFinishEvent(ev);
  }
}
// "match day" buttons (advanceSlow/Fast → advanceTournament): everyone else plays first, then the user's own match is handed to the normal match screen
function advanceWorldCupStep(){
  const wc = ST.worldCup;
  const ev = wcNextEvent();
  if(!ev){ finishWorldCup(); return; }
  if(wc.day<ev.day){ wcAdvanceDay(); return; }
  const um = wcUserMatchIn(ev);
  startRatingRound();
  wcEventMatches(ev).forEach(m=>{ if(!m.played && m!==um) wcSimMatch(m, ev); });
  if(um){ goToMatchDay(um, {type:"wc", evKey:ev.key, phase:ev.phase, matchId:um.id}); return; }
  wcFinishEvent(ev);
}
function wcFindMatch(id){
  const wc = ST.worldCup;
  for(const g of Object.keys(wc.fixtures)) for(const md of wc.fixtures[g]) for(const m of md) if(m.id===id) return m;
  for(const k of Object.keys(wc.ko)) for(const m of wc.ko[k]) if(m.id===id) return m;
  return null;
}
// called after the user's own match (finishPendingMatch) — or after its penalty shootout
function wcAfterUserMatch(pm){
  const wc = ST.worldCup, ctx = pm.context;
  const ev = wcEvent(ctx.evKey), m = pm.ref;
  wcNoteResult(m, ev);
  if(ev.phase==="groups"){
    E.applyResultToStandings(wc.table, m.home, m.away, m.hs, m.as);
  } else {
    if(m.hs===m.as){ startShootout(m.home, m.away, {type:"wcKO", matchId:m.id, evKey:ev.key}); return; }
    m.winner = m.hs>m.as ? m.home : m.away;
  }
  wcFinishEvent(ev);
}
function wcAfterShootout(ctx, winner){
  const m = wcFindMatch(ctx.matchId);
  if(m){ m.winner = winner; m.pens = true; }
  ST.stage = "hub"; ST.hubTab = "competicao";
  wcFinishEvent(wcEvent(ctx.evKey));
}
function wcRank(letter){
  const wc = ST.worldCup;
  return E.sortedStandings(wc.table, wc.groups[letter]).map(r=>r.team);
}
function wcMk(id, label, home, away){ return {id, label, home, away, hs:null, as:null, played:false, winner:null, pens:false}; }
function wcBuildR32(){
  const wc = ST.worldCup;
  const letters = Object.keys(wc.groups);
  const rank = {}; letters.forEach(l=>{ rank[l] = wcRank(l); });
  wc.groupRank = rank;
  const thirds = letters.map(l=>{ const r = wc.table[rank[l][2]] || {pts:0, gd:0, gf:0}; return {l, pts:r.pts||0, gd:r.gd||0, gf:r.gf||0}; })
    .sort((a,b)=>b.pts-a.pts || b.gd-a.gd || b.gf-a.gf).slice(0, 8);
  wc.thirdsQual = thirds.map(t=>t.l);
  const assign = WC.assignThirds(wc.thirdsQual);
  const ref = (code, slotId)=>{
    if(code.startsWith("3:")) return rank[assign[slotId]][2];
    return rank[code[1]][Number(code[0])-1];
  };
  wc.ko.r32 = WC.R32_SLOTS.map(s=>wcMk("M"+s.id, "16-avos", ref(s.a, s.id), ref(s.b, s.id)));
  letters.forEach(l=>{ rank[l].forEach((t, i)=>{ const advanced = i<2 || (i===2 && wc.thirdsQual.includes(l)); if(!advanced) wc.reached[t] = "Fase de Grupos"; }); });
}
function wcBuildNext(phase){
  const wc = ST.worldCup;
  const all = {}; Object.keys(wc.ko).forEach(k=>wc.ko[k].forEach(m=>{ all[m.id] = m; }));
  const label = {r16:"Oitavas", qf:"Quartas", sf:"Semifinal", final:"Final"}[phase];
  wc.ko[phase] = WC.KO_TREE[phase].map(([id, a, b])=>wcMk("M"+id, label, wcWinnerOf(all["M"+a]), wcWinnerOf(all["M"+b])));
  if(phase==="final"){
    const loser = m => wcWinnerOf(m)===m.home ? m.away : m.home;
    wc.ko.third = [wcMk("M"+WC.THIRD_MATCH_ID, "3º lugar", loser(all["M101"]), loser(all["M102"]))];
  }
}
function wcUserAlive(){
  const wc = ST.worldCup;
  if(!wc.userKey) return false;
  return wc.events.some(ev=>!ev.done && wcEventMatches(ev).some(m=>!m.played && (m.home===wc.userKey || m.away===wc.userKey)));
}
function wcFinishEvent(ev){
  const wc = ST.worldCup;
  ev.done = true;
  wc.phase = ev.phase;
  if(ev.key==="g3") wcBuildR32();
  else if(ev.key==="r32") wcBuildNext("r16");
  else if(ev.key==="r16") wcBuildNext("qf");
  else if(ev.key==="qf") wcBuildNext("sf");
  else if(ev.key==="sf") wcBuildNext("final");
  else if(ev.key==="third"){ const m = wc.ko.third[0]; wc.third = wcWinnerOf(m); wc.fourth = wc.third===m.home ? m.away : m.home; }
  else if(ev.key==="final"){ const m = wc.ko.final[0]; wc.champion = wcWinnerOf(m); wc.runnerUp = wc.champion===m.home ? m.away : m.home; }
  if(wc.userKey && !wc.userSettled && !wcUserAlive() && !(ev.key==="final")) wcSettleUser();
  if(!wcNextEvent()) finishWorldCup();
  scheduleSave();
}
function wcUserLabel(){
  const wc = ST.worldCup, u = wc.userKey;
  if(wc.champion===u) return "Campeão";
  if(wc.runnerUp===u) return "Vice-campeão";
  const t = wc.ko.third[0];
  if(t && t.played && (t.home===u || t.away===u)) return wcWinnerOf(t)===u ? "3º lugar" : "4º lugar";
  return wc.reached[u] || "Fase de Grupos";
}
// pays the federation's bonus, books the reputation swing for the season-end card and hands the club back
function wcSettleUser(){
  const wc = ST.worldCup;
  if(!wc.userKey || wc.userSettled) return;
  wc.userSettled = true;
  const label = wcUserLabel();
  const rep = WC.WC_REP[label] || 0, prize = WC.WC_PRIZE[label] || 0;
  wc.userResult = {label, rep, prize};
  if(prize){ ST.budget += prize; addSeasonPrize("wc", prize); }
  ST.wcSeasonResult = {year:wc.year, nation:wc.info[wc.userKey].pt, code:wc.info[wc.userKey].code, label, rep, prize};
  const pt = wc.info[wc.userKey].pt;
  ST.newsLog.unshift({title: label==="Campeão" ? `Campeão do Mundo com a ${pt}!` : `Fim da Copa para a ${pt}`, text: label==="Campeão" ? `Você levou a ${pt} ao título da Copa do Mundo ${wc.year}!` : `A ${pt} terminou a Copa do Mundo ${wc.year} em: ${label}.`});
  wcEndNatDuty();
}
function wcEndNatDuty(){
  const d = ST.natDuty;
  if(!d) return;
  ST.teamId = d.club; ST.lineup = d.lineup; ST.formation = d.formation; ST.captainId = d.captainId;
  ST.natDuty = null;
  ST.natJob = null;
  if(ST.hubTab==="elenco" || ST.hubTab==="email") { /* stays */ }
}
function finishWorldCup(){
  const wc = ST.worldCup;
  if(!wc.champion){ const f = wc.ko.final[0]; if(f && f.played){ wc.champion = wcWinnerOf(f); wc.runnerUp = wc.champion===f.home ? f.away : f.home; } }
  if(wc.userKey && !wc.userSettled) wcSettleUser();
  wc.active = false; wc.phase = "done";
  Object.keys(ST.world.teams).forEach(k=>{ if(ST.world.teams[k].isNation) delete ST.world.teams[k]; });
  if(!ST.wcHistory) ST.wcHistory = [];
  ST.wcHistory.push({year:wc.year, champion:wc.champion, runnerUp:wc.runnerUp, third:wc.third, fourth:wc.fourth, user:wc.userResult||null});
  ST.lastUserMatchType = null; ST.calendarDaysLeft = null; ST.pendingMatch = null; ST.matchLineupOverride = null;
  ST.newsLog.unshift({title:`${wc.champion} é campeão do mundo!`, text:`${wc.champion} vence a Copa do Mundo ${wc.year}. Os campeonatos voltam.`});
  ST.stage = "wc_end";
  scheduleSave();
}
function wcTopScorers(n){
  const wc = ST.worldCup;
  return Object.values(wc.scorers||{}).sort((a,b)=>b.goals-a.goals || a.name.localeCompare(b.name)).slice(0, n||10);
}

// ---------- call-up ----------
function wcOpenCallup(fromBreak){
  const job = ST.natJob;
  if(!job) return;
  wcPoolCache = wcPoolIndex();
  const pool = wcPoolCache.byNat.get(job.nation) || [];
  const auto = job.squadIds.length ? null : WC.autoSelectSquad(pool);
  const ids = auto ? auto.ids : job.squadIds.slice();
  const slots = auto ? auto.slots : Object.assign({}, job.squadSlots||{});
  ST.wcCallup = {ids, slots, tab:"gk", more:false, fromBreak:!!fromBreak, msg:""};
  ST.stage = "wc_callup";
}
function wcCallupPool(){
  const job = ST.natJob;
  if(!wcPoolCache) wcPoolCache = wcPoolIndex();
  return (wcPoolCache.byNat.get(job.nation) || []).slice().sort((a,b)=>b.ovr-a.ovr || (b.pot||0)-(a.pot||0));
}
// room left in a group: its quota plus the shared free places
function wcGroupRoom(sel, slots, gid, ignoreId){
  const rest = sel.filter(x=>x.id!==ignoreId);
  const cnt = WC.countByGroup(rest, slots);
  const extras = WC.POS_GROUPS.reduce((a,x)=>a+Math.max(0, cnt[x.id]-x.need), 0);
  const g = WC.POS_GROUPS.find(x=>x.id===gid);
  return cnt[gid] < g.need || extras < WC.FREE_SLOTS;
}
function wcCallupToggle(id){
  const c = ST.wcCallup; if(!c) return;
  const pool = wcCallupPool();
  const p = pool.find(x=>x.id===id);
  if(!p) return;
  c.msg = "";
  if(!c.slots) c.slots = {};
  if(c.ids.includes(id)){ c.ids = c.ids.filter(x=>x!==id); delete c.slots[id]; return; }
  if(c.ids.length>=WC.SQUAD_SIZE){ c.msg = `A lista já tem ${WC.SQUAD_SIZE} jogadores — remova alguém antes.`; return; }
  const sel = c.ids.map(i=>pool.find(x=>x.id===i)).filter(Boolean);
  // the tab being looked at wins when the player can play there; otherwise any group he can fill
  const elig = WC.eligibleGroups(p);
  const order = (elig.includes(c.tab) ? [c.tab] : []).concat(elig.filter(g=>g!==c.tab));
  const gid = order.find(g=>wcGroupRoom(sel, c.slots, g, -1));
  if(!gid){
    const g = WC.POS_GROUPS.find(x=>x.id===order[0]);
    c.msg = `${g.label}: as ${g.need} vagas e as ${WC.FREE_SLOTS} vagas livres já foram usadas.`; return;
  }
  c.ids.push(id); c.slots[id] = gid;
}
// move a called-up player to another position he can play (LAT ⇄ ZAG, MEI ⇄ VOL...)
function wcCallupSlot(id){
  const c = ST.wcCallup; if(!c || !c.ids.includes(id)) return;
  const pool = wcCallupPool();
  const p = pool.find(x=>x.id===id); if(!p) return;
  if(!c.slots) c.slots = {};
  const sel = c.ids.map(i=>pool.find(x=>x.id===i)).filter(Boolean);
  const elig = WC.eligibleGroups(p);
  if(elig.length<2) return;
  const cur = WC.slotOf(p, c.slots);
  const start = elig.indexOf(cur);
  for(let k=1;k<=elig.length;k++){
    const g = elig[(start+k)%elig.length];
    if(g!==cur && wcGroupRoom(sel, c.slots, g, id)){ c.slots[id] = g; c.msg = ""; return; }
  }
  c.msg = "Não há vaga em outra posição desse jogador.";
}
function wcCallupConfirm(){
  const c = ST.wcCallup, job = ST.natJob; if(!c || !job) return;
  const pool = wcCallupPool();
  const sel = c.ids.map(i=>pool.find(x=>x.id===i)).filter(Boolean);
  const problems = WC.callupProblems(sel, pool, c.slots);
  if(problems.length){ c.msg = problems.join(" · "); return; }
  job.squadIds = sel.map(p=>p.id);
  job.squadSlots = Object.assign({}, c.slots||{});
  job.done = true;
  const fromBreak = c.fromBreak;
  ST.wcCallup = null; wcPoolCache = null;
  if(fromBreak){ beginWorldCup(); }
  else { ST.stage = "hub"; ST.hubTab = "competicao"; }
  ST.newsLog.unshift({title:"Convocação fechada!", text:`Você convocou os ${sel.length} jogadores da seleção ${job.pt}.`});
  scheduleSave();
}
function wcCallupClose(){
  const c = ST.wcCallup;
  if(c && c.fromBreak) return;       // na pausa da Copa a convocação é obrigatória
  ST.wcCallup = null; wcPoolCache = null;
  ST.stage = "hub"; ST.hubTab = "competicao";
}

// ============================================================
// COPA DO MUNDO — telas
// ============================================================
function renderWcTrophy(h, op){ return competitionTrophyImg("worldcup", h, op==null?1:op); }

// banner at the top of the league's Competição tab
function renderWcBanner(){
  const job = ST.natJob;
  const year = ST.seasonYear;
  if(job){
    const open = job.year===year;
    return `<div class="panel wc-banner">
      <div class="wc-banner-flag">${wcFlagImg(job.code, 46)}</div>
      <div class="wc-banner-body">
        <div class="faint tiny uc">Seleção · Copa do Mundo ${job.year}</div>
        <div class="bold">Você é o técnico da seleção ${esc(job.pt)}</div>
        <div class="dim small">${!open ? `A convocação abre na temporada ${job.year}.` : job.done ? `Convocação fechada (${job.squadIds.length} jogadores). O Brasileirão para após a rodada ${WC.WC_BREAK_ROUND}.` : `Convoque seus 26 jogadores antes da pausa do Brasileirão (após a rodada ${WC.WC_BREAK_ROUND}).`}</div>
      </div>
      ${open ? `<button class="btn btn-gold btn-sm" onclick="Game.openCallup()">${job.done?"Rever convocação":"Convocar"}</button>` : ""}
    </div>`;
  }
  if(WC.isWorldCupYear(year) && !(ST.wcDone && ST.wcDone[year])){
    return `<div class="panel wc-banner wc-banner-soft">
      <div class="wc-banner-flag">${renderWcTrophy(44)}</div>
      <div class="wc-banner-body">
        <div class="faint tiny uc">Copa do Mundo ${year}</div>
        <div class="dim small">Todos os campeonatos param após a rodada ${WC.WC_BREAK_ROUND} do Brasileirão para a Copa do Mundo.</div>
      </div>
    </div>`;
  }
  return "";
}

function wcDaysTo(){
  const wc = ST.worldCup;
  const nu = wcNextUserMatch();
  const ev = nu ? nu.ev : wcNextEvent();
  return ev ? {ev, days:Math.max(0, ev.day - wc.day), nu} : null;
}
function renderWcNextCard(){
  const wc = ST.worldCup;
  const t = wcDaysTo();
  if(!t) return "";
  const {ev, days, nu} = t;
  const timeConfigBtn = `<div class="btn-row center mt8"><button class="btn btn-sm" onclick="Game.openTimeConfig()">CONFIGURAÇÃO DE TEMPO</button></div>`;
  const opp = nu ? (nu.m.home===wc.userKey ? nu.m.away : nu.m.home) : null;
  const matchDay = nu && days<=0;
  let action;
  if(matchDay){
    action = `<div class="gold bold uc tac mt16" style="letter-spacing:.06em;">⚽ Dia do jogo!</div>
      <div class="btn-row center mt16">
        <button class="btn btn-gold" onclick="Game.advanceSlow()">▶ Partida Completa</button>
        <button class="btn" onclick="Game.advanceFast()">⏭ Ir para o Resultado</button>
      </div>${timeConfigBtn}`;
  } else {
    action = `${renderCalendarStrip(opp, "worldcup", true, {days:Math.max(days,1), noTraining:true})}
      <div class="tac dim small mt8">${nu ? `Próximo jogo da ${esc(wc.info[wc.userKey].pt)} em ${days} dia${days===1?"":"s"}` : `${esc(ev.label)} em ${days} dia${days===1?"":"s"}`}</div>
      <div class="btn-row center mt16">
        <button class="btn btn-gold btn-lg" onclick="Game.advanceDay()">AVANÇAR DIA</button>
        ${nu ? "" : `<button class="btn" onclick="Game.wcSimPhase()">⏩ Simular fase</button><button class="btn" onclick="Game.wcSimAll()">⏭ Simular Copa inteira</button>`}
      </div>${nu ? timeConfigBtn : ""}`;
  }
  const head = nu
    ? `<div class="faint tiny uc mb12">${esc(ev.label)} · Dia ${wc.day}</div>
       <div class="row center" style="gap:clamp(28px,9vw,120px);">
         <div style="width:118px;"><div style="margin:0 auto;width:92px;">${clubCrestImg(nu.m.home,92,null)}</div><div class="bold small mt8">${esc(nu.m.home)}</div></div>
         <div class="faint" style="font-family:var(--font-display);font-size:38px;font-weight:800;">VS</div>
         <div style="width:118px;"><div style="margin:0 auto;width:92px;">${clubCrestImg(nu.m.away,92,null)}</div><div class="bold small mt8">${esc(nu.m.away)}</div></div>
       </div>`
    : `<div class="faint tiny uc mb12">Copa do Mundo ${wc.year} · Dia ${wc.day}</div>
       <div class="row center" style="gap:18px;">${renderWcTrophy(96)}<div style="text-align:left;"><div class="wc-big">${esc(ev.label)}</div><div class="dim small">${wc.userKey||ST.worldCup.userResult ? "Sua seleção já está fora da Copa." : "Você acompanha o torneio como espectador."}</div></div></div>`;
  return `<div class="panel next-match-wide" style="text-align:center;">${head}${action}</div>`;
}

function renderWcResultsPanel(){
  const wc = ST.worldCup, le = wc.lastEvent;
  if(!le || !le.results.length) return `<div class="panel wc-panel"><div class="panel-title">Resultados</div><p class="dim small">Os jogos começam no dia 1. Clique em AVANÇAR DIA.</p></div>`;
  return `<div class="panel wc-panel"><div class="panel-title">Resultados — ${esc(le.label)}</div>
    <div class="wc-results">${le.results.map(r=>`<div class="wc-res${(wc.userKey && (r.home===wc.userKey||r.away===wc.userKey))?' is-user':''}">
      <span class="wc-res-g">${r.group||""}</span>
      <span class="wc-res-t wc-res-home">${esc(r.home)} ${wcFlagOf(r.home,18)}</span>
      <span class="wc-res-score">${r.hs} – ${r.as}${r.pens?'<small> (pên.)</small>':''}</span>
      <span class="wc-res-t wc-res-away">${wcFlagOf(r.away,18)} ${esc(r.away)}</span>
    </div>`).join("")}</div></div>`;
}
function renderWcGroupCard(letter){
  const wc = ST.worldCup;
  const rows = E.sortedStandings(wc.table, wc.groups[letter]);
  const done = wc.groupRank && wc.groupRank[letter];
  return `<div class="wc-group panel">
    <div class="wc-group-title">Grupo ${letter}</div>
    <table class="wc-tbl"><thead><tr><th></th><th>Seleção</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr></thead><tbody>
    ${rows.map((r,i)=>{
      const adv = done ? (i<2 || (i===2 && wc.thirdsQual.includes(letter))) : false;
      const cls = (wc.userKey===r.team?"is-user ":"") + (done ? (adv?"adv ":"out ") : (i<2 && r.played>0?"lead ":""));
      return `<tr class="${cls}"><td class="pos">${i+1}</td><td class="nm">${wcTeamLabel(r.team,20)}</td><td>${r.played}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd>0?'+':''}${r.gd}</td><td class="pts">${r.pts}</td></tr>`;
    }).join("")}
    </tbody></table>
  </div>`;
}
function renderWcGroups(noFixtures){
  const wc = ST.worldCup;
  const letters = Object.keys(wc.groups);
  const ug = (wc.userKey && !noFixtures) ? letters.find(l=>wc.groups[l].includes(wc.userKey)) : null;
  const fx = ug ? `<div class="panel wc-panel mt16"><div class="panel-title">Jogos do Grupo ${ug}</div><div class="wc-results">${wc.fixtures[ug].map((md,i)=>md.map(m=>`<div class="wc-res${(m.home===wc.userKey||m.away===wc.userKey)?' is-user':''}">
      <span class="wc-res-g">R${i+1}</span><span class="wc-res-t wc-res-home">${esc(m.home)} ${wcFlagOf(m.home,18)}</span>
      <span class="wc-res-score">${m.played?`${m.hs} – ${m.as}`:"x"}</span><span class="wc-res-t wc-res-away">${wcFlagOf(m.away,18)} ${esc(m.away)}</span></div>`).join("")).join("")}</div></div>` : "";
  return `<div class="wc-groups">${letters.map(renderWcGroupCard).join("")}</div>${fx}
    <div class="tiny faint mt8">Avançam os 2 primeiros de cada grupo e os 8 melhores terceiros colocados (32 seleções).</div>`;
}
function wcBracketBox(m, fallback){
  const wc = ST.worldCup;
  if(!m) return `<div class="wc-bm wc-bm-empty">${fallback||"A definir"}</div>`;
  const row = (t, s)=>{
    const win = m.played && wcWinnerOf(m)===t;
    return `<div class="wc-bm-row${win?' win':''}${wc.userKey===t?' is-user':''}"><span class="wc-bm-t">${t?wcTeamLabel(t,18):'<span class="dim">A definir</span>'}</span><span class="wc-bm-s">${m.played?s:""}</span></div>`;
  };
  return `<div class="wc-bm">${row(m.home, m.hs+(m.pens?(wcWinnerOf(m)===m.home?" ✓":""):""))}${row(m.away, m.as+(m.pens?(wcWinnerOf(m)===m.away?" ✓":""):""))}</div>`;
}
function renderWcKnockout(){
  const wc = ST.worldCup;
  if(!wc.ko.r32.length) return `<div class="panel wc-panel"><p class="dim small">O mata-mata começa depois da fase de grupos: 32 seleções, jogo único.</p></div>`;
  // each column lists its matches in the order their feeders appear in the column before, so the tree reads left to right
  const ORDER = {r32:[74,77,73,75,83,84,81,82,76,78,79,80,86,88,85,87], r16:[89,90,93,94,91,92,95,96], qf:[97,98,99,100], sf:[101,102]};
  const col = (title, arr, key)=>`<div class="wc-col"><div class="wc-col-title">${title}</div><div class="wc-col-body">${ORDER[key].map(id=>wcBracketBox(arr.find(m=>m.id==="M"+id))).join("")}</div></div>`;
  return `<div class="wc-bracket">
    ${col("16-avos", wc.ko.r32, "r32")}${col("Oitavas", wc.ko.r16, "r16")}${col("Quartas", wc.ko.qf, "qf")}${col("Semifinais", wc.ko.sf, "sf")}
    <div class="wc-col"><div class="wc-col-title">Final</div><div class="wc-col-body">${wcBracketBox(wc.ko.final[0])}<div class="wc-col-title mt16">3º lugar</div>${wcBracketBox(wc.ko.third[0])}</div></div>
  </div>`;
}
function renderWcScorers(){
  const list = wcTopScorers(12);
  if(!list.length) return `<div class="panel wc-panel"><p class="dim small">Nenhum gol ainda.</p></div>`;
  return `<div class="panel wc-panel"><div class="panel-title">Artilharia da Copa</div>
    <div class="wc-scorers">${list.map((s,i)=>`<div class="wc-scorer"><span class="wc-scorer-rank">${i+1}</span>${wcFlagOf(s.team,20)}<span class="bold">${esc(s.name)}</span><span class="dim tiny">${esc(s.team)}</span><span class="wc-scorer-goals">${s.goals}</span></div>`).join("")}</div></div>`;
}
function wcFocusGroup(){
  const wc = ST.worldCup;
  const letters = Object.keys(wc.groups);
  const mine = wc.userKey ? letters.find(l=>wc.groups[l].includes(wc.userKey)) : null;
  if(mine) return mine;
  const home = letters.find(l=>wc.groups[l].some(k=>wc.info[k] && wc.info[k].en==="Brazil"));   // sem seleção: grupo do Brasil
  return home || letters[0];
}
function renderWcGroupFixtures(letter){
  const wc = ST.worldCup;
  return `<div class="wc-results wc-results-one">${wc.fixtures[letter].map((md,i)=>md.map(m=>`<div class="wc-res${(m.home===wc.userKey||m.away===wc.userKey)?' is-user':''}">
      <span class="wc-res-g">R${i+1}</span><span class="wc-res-t wc-res-home">${esc(m.home)} ${wcFlagOf(m.home,18)}</span>
      <span class="wc-res-score">${m.played?`${m.hs} – ${m.as}`:"x"}</span><span class="wc-res-t wc-res-away">${wcFlagOf(m.away,18)} ${esc(m.away)}</span></div>`).join("")).join("")}</div>`;
}
function renderWorldCupTab(){
  const wc = ST.worldCup;
  const g = wcFocusGroup();
  const sub = `${esc(wcStageName((wcNextEvent()||{phase:wc.phase}).phase))} · 48 seleções${wc.hosts.length?` · Sede: ${wc.hosts.map(h=>wc.info[h]?esc(wc.info[h].pt):"").filter(Boolean).join(", ")}`:""}`;
  return `<div class="wc-wrap">
    <div class="wc-hero panel">
      <div class="wc-hero-trophy">${renderWcTrophy(78)}</div>
      <div class="wc-hero-text">
        <div class="faint tiny uc">Todos os campeonatos estão parados</div>
        <div class="wc-hero-title">COPA DO MUNDO ${wc.year}</div>
        <div class="dim small">${sub}</div>
      </div>
      ${wc.userKey ? `<div class="wc-hero-user">${wcFlagImg(wc.info[wc.userKey].code, 40)}<div><div class="faint tiny uc">Você comanda</div><div class="bold">${esc(wc.info[wc.userKey].pt)}</div></div></div>` : ""}
    </div>
    <div class="wc-next">${renderWcNextCard()}</div>
    <div class="wc-bottom">
      <div class="wc-bottom-l">
        ${renderWcGroupCard(g)}
        <div class="panel wc-panel mt16"><div class="panel-title">Jogos do Grupo ${g}</div>${renderWcGroupFixtures(g)}</div>
      </div>
      <div class="wc-bottom-r">${renderStatFlipCard(wc, "Copa do Mundo")}</div>
    </div>
    <div class="tiny faint tac">Os outros grupos, o mata-mata, os resultados e o Top 25 de artilheiros e assistências estão na aba <b>Desempenho</b>.</div>
  </div>`;
}
// Desempenho › Copa do Mundo: everything the Competição tab leaves out
function renderWcDesempenhoBlock(){
  const wc = ST.worldCup;
  if(!wc) return `<div class="panel"><p class="dim small">A Copa do Mundo ainda não começou.</p></div>`;
  const scorers = compTopScorersFull(wc, 25);
  const assisters = compTopAssistersFull(wc, 25);
  return `<div class="wc-wrap">
    ${renderWcResultsPanel()}
    <div><div class="wc-sec-title">Fase de grupos</div>${renderWcGroups(true)}</div>
    <div><div class="wc-sec-title">Mata-mata</div>${renderWcKnockout()}</div>
    <div class="competicao-grid">
      <div class="competicao-cell">${renderStatLeaderboard("Artilheiros — Top 25", scorers, "goals", "Nenhum gol registrado ainda nesta competição.")}</div>
      <div class="competicao-cell">${renderStatLeaderboard("Assistências — Top 25", assisters, "assists", "Nenhuma assistência registrada ainda nesta competição.")}</div>
    </div>
  </div>`;
}

function renderWcEnd(){
  const wc = ST.worldCup;
  const ur = wc.userResult;
  const podium = [[wc.champion,"Campeão",1],[wc.runnerUp,"Vice-campeão",2],[wc.third,"3º lugar",3],[wc.fourth,"4º lugar",4]];
  return `<div class="hero wc-end" style="min-height:80vh;position:relative;z-index:1;">
    <div class="mb16">${renderWcTrophy(170)}</div>
    <div class="hero-badge">COPA DO MUNDO ${wc.year}</div>
    <h1 class="hero-title" style="font-size:clamp(30px,6vw,54px);">${esc((wc.champion||"").toUpperCase())}</h1>
    <div class="wc-champ-flag">${wcFlagOf(wc.champion, 96)}</div>
    <p class="hero-sub">${esc(wc.champion)} é campeão do mundo.</p>
    <div class="wc-podium">${podium.map(([t,l,n])=>`<div class="wc-podium-item p${n}"><div class="tiny faint uc">${l}</div>${wcFlagOf(t,40)}<div class="bold small">${esc(t||"—")}</div></div>`).join("")}</div>
    ${ur ? `<div class="panel mt24" style="max-width:420px;">
      <div class="panel-title">Sua seleção — ${esc(wc.info[wc.userKey].pt)}</div>
      <div class="kv"><span>Campanha</span><span class="${ur.label==='Campeão'?'gold':''} bold">${esc(ur.label)}</span></div>
      <div class="kv"><span>Reputação</span><span class="${ur.rep>=0?'green':'red'} bold">${ur.rep>=0?'+':''}${ur.rep} (entra no fechamento da temporada)</span></div>
      <div class="kv"><span>Bônus da federação</span><span class="gold bold">${fmtMoney(ur.prize)}</span></div>
    </div>` : ""}
    ${wcTopScorers(5).length ? `<div class="panel mt16" style="max-width:420px;"><div class="panel-title">Artilharia</div>
      ${wcTopScorers(5).map((s,i)=>`<div class="wc-scorer"><span class="wc-scorer-rank">${i+1}</span>${wcFlagOf(s.team,20)}<span class="bold">${esc(s.name)}</span><span class="wc-scorer-goals">${s.goals}</span></div>`).join("")}</div>` : ""}
    <button class="btn btn-gold btn-lg mt24" onclick="Game.finishWcEnd()">Retomar o Brasileirão →</button>
  </div>`;
}

function renderWcCallup(){
  const c = ST.wcCallup, job = ST.natJob;
  const pool = wcCallupPool();
  const club = (wcPoolCache && wcPoolCache.club) || new Map();
  const sel = c.ids.map(i=>pool.find(x=>x.id===i)).filter(Boolean);
  const slots = c.slots || {};
  const cnt = WC.countByGroup(sel, slots);
  const extras = WC.POS_GROUPS.reduce((a,x)=>a+Math.max(0, cnt[x.id]-x.need), 0);
  const problems = WC.callupProblems(sel, pool, slots);
  const tabG = WC.POS_GROUPS.find(g=>g.id===c.tab) || WC.POS_GROUPS[0];
  // everyone who can play the position (main or secondary), best overall first (pool is already sorted)
  const inGroup = pool.filter(p=>WC.eligibleGroups(p).includes(tabG.id));
  const shown = inGroup.slice(0, c.more ? 160 : 40);
  const chip = g => {
    const have = cnt[g.id], need = g.need;
    const st = have>=need ? "ok" : "low";
    return `<button class="wc-chip ${st}${c.tab===g.id?' on':''}" onclick="Game.callupTab('${g.id}')"><span class="wc-chip-s">${g.short}</span><span class="wc-chip-n">${have}/${need}${have>need?` <small>+${have-need}</small>`:""}</span></button>`;
  };
  const row = p=>{
    const on = c.ids.includes(p.id);
    const cl = club.get(p.id) || p.club || "";
    const sec = WC.posGroupOf(p.pos)!==tabG.id;
    const elsewhere = on && WC.slotOf(p, slots)!==tabG.id ? (WC.POS_GROUPS.find(g=>g.id===WC.slotOf(p, slots))||{}).short : "";
    return `<div class="wc-prow${on?' on':''}">
      <span class="wc-prow-face">${playerFaceImg(p,30)}</span>
      <div class="wc-prow-main"><div class="bold">${esc(p.name)}${p.injured?' <span class="red tiny">lesionado</span>':''}</div><div class="tiny faint">${esc(!cl||cl==="Free Agents"?"Sem clube":cl)} · ${p.age} anos${sec?' · <span class="gold">posição secundária</span>':''}${elsewhere?` · <span class="gold">convocado como ${elsewhere}</span>`:''}</div></div>
      <span class="wc-prow-pos">${posBadges(p)}</span>
      <span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span>
      <button class="btn btn-sm${on?' btn-danger':' btn-gold'}" onclick="Game.callupToggle(${p.id})">${on?"Remover":"Convocar"}</button>
    </div>`;
  };
  const selByGroup = WC.POS_GROUPS.map(g=>({g, list:sel.filter(p=>WC.slotOf(p, slots)===g.id).sort((a,b)=>b.ovr-a.ovr)}));
  return `<div class="wc-callup">
    <div class="wc-callup-head">
      ${wcFlagImg(job.code, 64)}
      <div>
        <div class="faint tiny uc">Convocação · Copa do Mundo ${job.year}</div>
        <div class="wc-callup-title">Seleção ${esc(job.pt)}</div>
        <div class="dim small">Só jogadores nascidos em ${esc(job.pt)} · ${WC.SQUAD_SIZE} convocados: ${WC.POS_GROUPS.map(g=>`${g.need} ${g.label.toLowerCase()}`).join(", ")} e ${WC.FREE_SLOTS} vagas livres.</div>
      </div>
      <div class="wc-callup-count ${sel.length===Math.min(WC.SQUAD_SIZE,pool.length)?'ok':''}"><b>${sel.length}</b>/${Math.min(WC.SQUAD_SIZE,pool.length)}<small>${extras}/${WC.FREE_SLOTS} livres</small></div>
    </div>
    <div class="wc-chips">${WC.POS_GROUPS.map(chip).join("")}</div>
    <div class="wc-callup-grid">
      <div class="panel wc-callup-list">
        <div class="panel-title">${tabG.label} <span class="dim tiny">(${inGroup.length} disponíveis)</span></div>
        ${shown.length ? shown.map(row).join("") : `<p class="dim small">Nenhum jogador dessa posição na base de dados — completaremos com jogadores locais.</p>`}
        ${inGroup.length>40 ? `<div class="tac mt8"><button class="btn btn-sm" onclick="Game.callupMore()">${c.more?"Mostrar menos":`Mostrar mais (${Math.min(160,inGroup.length)})`}</button></div>` : ""}
      </div>
      <div class="panel wc-callup-sel">
        <div class="panel-title">Convocados</div>
        ${selByGroup.map(({g,list})=>`<div class="wc-sel-g"><div class="tiny faint uc">${g.label} ${list.length}/${g.need}</div>${list.length?list.map(p=>`<div class="wc-sel-p"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span><span>${esc(p.name)}</span><span class="faint tiny">${p.pos}</span>${WC.eligibleGroups(p).length>1?`<button class="wc-swap" onclick="Game.callupSlot(${p.id})" title="Trocar de posição" aria-label="Trocar de posição">⇄</button>`:""}<button class="wc-x" onclick="Game.callupToggle(${p.id})" aria-label="Remover">×</button></div>`).join(""):'<div class="dim tiny">—</div>'}</div>`).join("")}
      </div>
    </div>
    ${c.msg || problems.length ? `<div class="wc-callup-msg red small">${esc(c.msg || problems.join(" · "))}</div>` : ""}
    <div class="btn-row wc-callup-actions">
      <button class="btn" onclick="Game.callupAuto()">✨ Convocação automática</button>
      <button class="btn" onclick="Game.callupClear()">Limpar lista</button>
      ${c.fromBreak ? "" : `<button class="btn" onclick="Game.callupClose()">← Voltar</button>`}
      <button class="btn btn-gold btn-lg" ${problems.length?'disabled':''} onclick="Game.callupConfirm()">Confirmar convocação</button>
    </div>
    ${c.fromBreak ? `<div class="tac faint tiny mt8">A Copa do Mundo vai começar — feche a lista para apitar o início.</div>` : ""}
  </div>`;
}

// ---- verified user (only the Renato Vicente code sets window.__VIP_RENATO__) ----
const VIP_NAME = "orenatovicente";
function isVip(){ return !!window.__VIP_RENATO__; }
function mgrName(name){ return isVip() ? VIP_NAME : (name || "Treinador"); }
function verifiedBadge(size){
  size = size || 15;
  return `<svg class="vbadge" width="${size}" height="${size}" viewBox="0 0 24 24" role="img" aria-label="Conta verificada"><title>Conta verificada</title><path fill="#1d9bf0" d="M22.5 12.5c0-1.6-.9-3-2.2-3.7.4-1.4.1-3-.9-4.1-1.1-1.1-2.7-1.4-4.1-1C14.6 2.4 13.3 1.5 12 1.5S9.4 2.4 8.7 3.7c-1.4-.4-3 0-4.1 1-1.1 1.1-1.4 2.7-1 4.1C2.4 9.5 1.5 10.9 1.5 12.5s.9 3 2.1 3.7c-.4 1.4-.1 3 1 4.1 1.1 1.1 2.7 1.4 4.1 1 .7 1.3 2 2.2 3.3 2.2s2.6-.9 3.3-2.2c1.4.4 3 .1 4.1-1 1.1-1.1 1.4-2.7 1-4.1 1.2-.7 2.1-2.1 2.1-3.7z"/><path fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M7.6 12.6l3 3 5.9-6.2"/></svg>`;
}
function mgrNameHtml(name){ return esc(mgrName(name)) + (isVip() ? `<span class="vbadge-wrap">${verifiedBadge(15)}</span>` : ""); }
function showVipWelcome(){
  if(document.getElementById("vipWelcome")) return;
  const d = document.createElement("div");
  d.id = "vipWelcome"; d.className = "vip-welcome";
  d.innerHTML = `<div class="vip-rays"></div>
    <div class="vip-card">
      <div class="vip-photo-wrap"><img class="vip-photo" src="/images/renato-welcome.webp" alt="Renatinho"/></div>
      <div class="vip-title">SEJA BEM VINDO <span class="vip-name">Renatinho!</span></div>
      <div class="vip-user">${esc(VIP_NAME)}${verifiedBadge(22)}</div>
      <div class="vip-chat">Boa noite Chat!</div>
      <button class="btn btn-gold btn-lg vip-go" onclick="window.__closeVipWelcome__()">BORA JOGAR →</button>
    </div>
    <div class="vip-confetti">${Array.from({length:36},(_,i)=>`<i style="left:${(i*97)%100}%;animation-delay:${(i%12)*0.18}s;background:${["#ffd21f","#ffffff","#1d9bf0","#3ddc84","#ff5a5f"][i%5]}"></i>`).join("")}</div>`;
  document.body.appendChild(d);
  window.__closeVipWelcome__ = function(){ d.classList.add("out"); setTimeout(()=>d.remove(), 450); };
}
// ============================================================
// ACCESS GATE — a simple client-side login so the site isn't playable by
// anyone who just stumbles on the URL. Asked fresh on every single visit/reload
// (nothing is remembered between page loads, on purpose). This is NOT real
// security (anyone who opens dev tools can read the credentials below or skip
// straight to boot()) — it's just a lightweight "only people I gave the login
// to" filter.
// ============================================================
// access codes: only the SHA-256 of each code lives in the source, so the codes themselves can't be read from the bundle
// the one code that opens the game as the verified "orenatovicente" (badge + welcome animation) — nobody else gets either
const VIP_RENATO_HASH = "623aa5ba7124bfb4eb49e4cd5a849d12a6f754b726ebfabce8643337d63412a9";
const ACCESS_CODE_HASHES = [
  "4e84072c9a5dd6e68701837444d180c439816dd4a0e1c545f79f3d564ff1ad2f",
  "439cb9b573d641f07981f13a6804d2dc03a285d03b72af278732ff7e24735a4a",
  "1f40d1bd08b6f4423608b7392b1e99a7148cde30beeb1d24f842235e8a56d7f2",
  "bb97e9fb41f3180d5b1428bd1f92ef9ce4ee7d3da2629e588db3f14da8a1744f",
  "43075b4a71d5efe2b471bf61d78b6a1ed3b7e4f175d498ef6fa53904c3dcf677",
  "90485ccc43b5edfc4b0f9510a2fa546fafdad062aa6bd64fe74177a5c6366497",
  "de19d772d38de8f69496ed24f53a83bfccfcf2d06e7145d910639fc351a58267",
  "073a7b1b294c8eefb7897ed4807169903d245168d363634766b3a1441019664b",
  "fb92cde7720c3f30cc948e5c79488b09cad401dccf5a197d3035e38106dd2257",
  "e91f714e6915c1b7b0b4994e57859f21b5f8abb92cd0bf8fcb5abde2e79b9020",
  "0b22e93e63830f59eb9871d6a9d3de80d4c43228d4cde2b8875cfdf2e734937c",
  "80f4544963dd620791a5bd086d15c51d740a5e38fdcf0d9d1beae51112ff0e1e",
  "fe5bf879bb4e47f7172efe8ee0ccd75a60151ce3af364b46951ffa17ae8afa3d",
  "beb48e13c778161ca552332a4fc983b8046b2b2738a64f64ba125b053eccfeb7",
  "6264f20a6cf17eeeadbd64b00ddf8d457deb6c765b1731054eb107f4b7325b83",
  "fe258233f4fdc765d756621d7566cedf424d599dbaabd8b7c6a8d4f49ef67aaf",
  "62072ebac12690cc91ff4089d0c5cf21f21c34c2c95204e95a968f552db9a816",
  "538cef4a538963ae3eec18098da0aa8c1706806f7447dae0208971f0377ce691",
  "0324a55a90c2dff1fc6125f4664358c7796f8d3a3ec1a6ab0723904b9fd03c7f",
  "4d29e49e70f5774b0835273d80fd01b17e5e6ea6d95dd41c86b6add18c8deeae",
  "12d391dd5b98b180802898c1f2896628a34a2e8e73d85bd2b8104e78c3007ae3",
  "0d69e1342354b24c7a3ff1b822f5ff7c1f86d7d1a0bdcc56f1ba3ba15f2da1f9",
  "5fb119e6de9da91daf48dffb66b891566b2e7fd28212056a2df6af56840eeb6f",
  "0be2bf8ad544d31f2aa21a002defd680acfe1064e5685e2ec6a034ceb1c3699f",
  "e02fba8efa56b4e65914b80cdd3de517aa385c6220cbbfbe9b91ccf81a3a9176",
  "1af57eafebb6523debca435b820f1f8b72cd28bc1825d48472db7a58a659e340",
  "ac144c9f7f69ba605e78a41c601f115698265531880ec9a2150138f8d2ba51e0",
  "1e9e434f0c8421e55ff413c685820beead1b0b0cc7f5faa65e07a50e1c28cd62",
  "026a64dbb92e8bde7037910e869e153e78fa34a3eadcec26830abdc9cd4e45b4",
  "c0d6e6e89dc17a5fb4f46f7e4a03bcb26e0f3e34df970e3799654244495242ad",
  "c9d3bbfc14271b3a552c13f82160978822d348e7ad1ddb2f775b7e89b70a68f4",
  "d1e6643da7d3439f20d193da6bbbb4a008305c4d85abab1545aa3b0a406e7eb5",
  "79d2bf943b0036cb6670cdb14827b1b092825d6e32b555124c336bd9c5573696",
  "f30bb9f8a864d12cbc9db0803dc72b339470c2ef862d70de031645a11a39b523",
  "1b86c772bbd45228e622e995de7d2de9f75d78621674c39415f182e94d0320ba",
  "7566f5feefa15b1f0bb7c6ca102c5d3f17adb54aec2d25530f48cb0e108231cb",
  "0282ea1286affa9a3f2964b776412a3490316e46aeea160c70fb901b75479320",
  "3633a61d71b9b19ed3d9b7672e7772b43362bbc62c42e5102c4c5c624adac7b9",
  "04c675fb54af7eb2495995a8dbfc27cc1c2dbe11be4e7485ae82ed0c07cf7e3e",
  "fbf66bb6c0f87c74396aeb8380e14657d59f9432b6b271e4a79c35c7095ead1f",
  "cdcd64c6153d965da0225f9f1d3dc42bc50a5935dc676da96c51257c961fc92e",
  "916073fadbf6984737b68cc5d18178f0e7825f126517a2261c92f0c1a5eb988e",
  "e4f4b8a2d9ccdbb61586c60c53381a28916faf87a75ef904f394e331c3d5f8f1",
  "350635f4caeeea8d4168a42d7d7c6b8c14a25cdee5dbd19f8635f534661e2d8d",
  "edf36a7c28d02fe5a2725257492d4ea5d67f96dc6b6459ca62ba425ef7e8a3a0",
  "d0506aa69a1f64f9cff56d03de933c290fac3a1d1cd2d49aca425c28e3394cc1",
  "fa6d863eff03a4fabede36e3611762d251294ccae284cb0c99b0c51cc507642b",
  "e23326b15c1eccb06cce213958f4425eccf20dd12e45a3b7cc07c2b02e1feeba",
  "6bc89eaa47a2c29b6a1d03720c48f0035e3928990b12b92cd6bbfc6877f204f8",
  "cb4c7ce2767360c9a03f05eff6b35aa3c15eda5b8d8f4a211080a2fc83b43b89",
  "63c9738bbbc15f7b89888dd8b43289bc99d028d1d9d6c7daa55d188634bd3abd",
  "7e0f06471c31029106dcf83d8c3051b21332a69e185b9568161446d4ef0f6b9f",
  "4026ec8e9ae47ec7929d573f76c641c7d6d35342af0c38e4e4e6bdd42373a1f1",
  "2bd00206469ad939b120fab3c332b8eabe2278727a08fc6c984e5aabff85b661",
  "c91f4d99f75ca805db413086bf6bcbb79c90f24dc7935d9ed7d235585688e34e",
  "1e3c9136fec4e40958a58dfedac0638ccfa4c187ad369cd060f870bb0c0ee657",
  "75264fd8f364a19e8f615beabb79e41c034c4d9d7236fd435441f9030a47204f",
  "eadff0c3a3fa6f33c88262ad5834e2e59ced4631dbad04672ea3a9d9555d4e4f",
  "e604709068286a6afd17576d371d9ee77cd637c2b39e174b51ea8269202092fa",
  "08482d13faea807c2283201b0cac314930f7fbc2b97b1735fdbe3cf555f97d21",
  "cbb60045cdbc273a866a950b10a56ced1459069ebd0a8e47931d681e269bef90",
  "c8bfb1a2a8c998c07d3a99b7026b2f320fcd5bd18345ce7539485934ab84d651",
  "4b5ca6d32c970f162201705a7c2d9a974217d8e235c91aff72e3b5d48a8329a7",
  "da5e0d93184cfd0c765608a12227b1f2b2b299aa0942948c028c8e658d3e72da",
  "71d4c8bba951f0b595b54cb1e23f8658e6cbd7b50be5a007a6b6271c818eeba4",
  "9468b9e1f425b166ab33449276c59f282f59687c5c120bad2126c53a1d8f0bf7",
  "08a7b6fc16123b6dfd8e8aa7a331786254836ba860e16208eb70ba548459aae8",
  "ffbcaea199636cb815902abac7bb9c932f53ed2e0219f78aa40baa1a3bb5599f",
  "1bc8386c10ff90966a6b90f5b9112e0e48707a0cf41199dc1281921545ea398d",
  "5b494af57acc5af82c27ce44761106de5be2fc7a00ca204c81a8b5a93f304d08",
  "4629090cd794dcc57e5f5200dd57a72b93de69f1f43c3ae8d3736d6de1b75859",
  "f0473318685ee74a3f3adc2ce7782bccb485760f18577821ebab3e30a3dffb26",
  "bb4750dc91cd67e9d7e625ae97d5f3af4d8aca94288eaf4877512924eb391d5a",
  "135e7a55290f5d9d291a0d6028dc41aade21a2bc49b4983aa2e876ef14551c77",
  "3cd2858aaf1b8298978bb683c63d2cccc60582cf5dd47ace67b1a6643cb9e548",
  "25b8a53a7b8b5e0fe3eda0dad3da7f04fa1b9438ab5b64f582dd192481bca5e6",
  "bea71ebd53217373b129394db021ef59ba5036ce6d6ca22f7fe2f6d6f58acbdd",
  "c13d32ada946ca54b2be00b707da66eb084f07abe7f0ebf7b3ce760ec28a5b2b",
  "00b276da9d655ab1a472890a63c640d022e5b56698558972a52e9823e6a52350",
  "7ca9efe92f156f5ba5b1ee28e7af3a28e7a5538e6b7ea3813cd0f8ff3d35292f",
  "54dc3423fb87b8f4a137fe973d1652466e2fe724c00ba13ac90a3bf88c66a09c",
  "3ae9261a164decbcc800b38d8f85255ee91e9c03eea88f7be19378bc9fd6c876",
  "e92cc17f8537077fec05665631e2badcdc107b39f25092026742f5ba8298da43",
  "9be9b81a21133483e535ae1bb3f41a76b8874910b7c31593e643cd71e25f82a9",
  "e7ba48b50564caca959c06166a9caf4c6d7c12bf3d2c28e33e3d5bce25f108ea",
  "bf3303bef53be43567362427c3efbbd960797bc3a577ad7f957b658c2ddf7872",
  "98012ddc9c1bc7a12bd0a685ce4882baf3ee3f824090d01725dcd32f02375b02",
  "1784566c9611400b60fa0dd802fa8f9fe0e1c3e2cc54b9a470df252cd6bc487d",
  "4a435e607bd019cc4f7ddad61dc1f3bdf50ac95293dedba8f0db0df5212639f3",
  "371b52996d9d34179f12e53da292fd062ec442cf44cf8870449f007c4aab2e4c",
  "d22131a9647dd16cb81ebd203fe9da4c0dd43cb107cc454e3c3e67b24e86ea3f",
  "329a6da6afbb04a0ec55bcc201f2dd21b3b9fb5cc4d05b1abfefd12cb9df7295",
  "15d9275fbef1bfb2bd2a277b3c0107da4ff914db9b50f8d2536cb4f0e9521095",
  "011cc6ebb11a90c8c9395a3e21a0708482ea6545f4b95e6ae6c19287fe1488c2",
  "71530e5abfe425158e5843224d3e4e137c0ab6159d962d2adfb4504b53af9aca",
  "9c13c43e83f473a4f3cbe5370ae565edb4fe54fdef44e7a2d7c5e39f6f8c2691",
  "35c72f2ffd8b24bd10f8940c083a33c84dd56ba85c916d4416d8ff68f3afd654",
  "5d91b9c9862d0dce7dfc0873064269c00ae9f8cd20e5e88278725c9d17c51e79",
  "a0d9d99badb3ab1344ebbe8d50e7b975867ca16a2c9ca179746c06222aec0156",
  "6e31ae1a6396c0785c354ad60830a5c74a4e925e4fa1f37621174d9a1a7fa965",
  "58db79df172a2d15523a2bf376f851c2edfbb0e1175bdcea67cb6c5ae0625d38",
  "3a517578ec20e0e4240e607950c640a2d939c1c6e4f312975ebc7cd88c4bd286",
  "9a6522456d1cd994884b6e3fb27619d0f583bbfe6098d97127782582c6f92321",
  "aff3319a07b2bb63ab2852ba17acebdc2d18ea661a6c7fe953fe6e41d3012754",
  "bf4dfdf612a5a0bffc84154cd4b85c22ee3f7d3fcbb1fa88d9c597ae2eabfb02",
  "f3862b35eb3575240f12eed210d7d6b9ead074cb1459d3380158ef43925ebaaf",
  "d3151f8fad585f6ec0db41c63c987fc4a08fd858fcf2a28c1ca7682d9a9575aa",
  "cb045c13dcb29b9e619617ccd2385f59ea4238fdd45249f4824e624299f22933",
  "10955fe1340489a8f90a1f3afc513c02d6553fa0279930273c18794da97b7861",
  "08b1d28a27e8ac65a5a1c4d79e2fd9fa07e1384401d0a3f78882ea13558ee826",
  "1317cbaa8538abda49a2ea31d45196a01fdf3eebc235bd51d5f5c87104d7c23f",
  "9a99ca9b3a0401aaf5d2452dfebe2462a7661518a44e674ba6f682cc9fdb44ba",
  "865e995855c75dfea8c56d7c76f1f4280606d308f50ffbc2ebdd86cb32004520",
  "7a6300c699f4f6fa0ef659e43ac57c5d0bf6ef9a48757b1b4781e0dd367a1051",
  "2eff8c8535ad992f8d5aaf88343c548c21427be4a3fab313232ff21457cae85a",
  "3c4e3e83d553d1d33b8211cf80e47903dbf267bdce349f3b1c3ae42c26155fad",
  "c654ab2fbbaa51969b4a9068b14cf3f5d48032489fe2cb5a14f65177d6a19058",
  "a18b3d9901872afa4afedbc543a1ae0caa3b0713d14bfce41eb7be7ac05933c1",
  "219f56640c11d91113e9264b4b8d52720dd9ba77d892f136c62d68848cda7e01",
  "8305c6fe7a84ad4c1e155369ba8f0d635762f111425be701c2c8fcf3cde8cbac",
  "d91a61cb0983198dd84a7464ac016c79d1cf3ca4923aaba1231e3e0a0b9a9182",
  "99702287465a23699523e9ce310c88d0396744fe7c5ca18ac89a37816da4c215",
  "bd1efd7cf76f891c52d15027474cddbb6b60bc36736167b5488b8fa122e6f23b",
  "5de4a7e65256e610e58ba372f1f01025db94229771708b5d2c703f8c35234211",
  "345aa17df3d55f856feb7b1f95b6fd47b24651aa1ab7ef1dbfeb1e0c5fcec786",
  "7a5a8f25eb0870bf8c71e7a51fa825c2fd3bc8d5f138a5d8cdc6a9df75fe46e4",
  "d803bc90e6d427b1929602a9d661f2ac51887dd153b9a47f865fe21a8a551c92",
  "aaf9a1d4b8f183c5e80b1f0ad269c01b3d9d27f05c0734fbfffb4166ede257d8",
  "cd673313f9756fc33823a8bff0eaa996f3d271f3b9e68fc0c845ca09089ea932",
  "414c29a807852b61f446b731dea664ac3c360e1969329ff66aec47c1cc92ddc9",
  "f258a2958f0f31689493279aa57a7b0b18951231e4b63c6ec95a3a211a21abeb",
  "1c76d06cbbbbb6d74c4b24d652dab327a8821770c8d2e29649744231294671c4",
  "9f8273e695f45a8ecfce539a203fe82ae1e70aa1fb072c5a9ce8041bf6fb0908",
  "26662bf4b858a0a037ec2d76fe32bc3fa3a16360441d845b45766f8684c7a353",
  "43d61a16fc75c52c29bc219275bd6ae90fb37a91c0b66e06af800f4556511757",
  "81bdf32441f77ce283e382859c01389ae2eb5e3fce454e351cca03a9c6f77353",
  "71028a4d16acfb2efe9ff5667849a617a45dd1e49553a361fa069e839119c6d1",
  "ff59f1fd528d2158275c780b309103ee010ea200eb4bd54583c9c81d52522e76",
  "32470ff0b6ed33b32a0cf05902d2784423790183371340bd276cbeeea0b83986",
  "296fe95efdedd6585cfab0bdc48984c45f1d494155aa7ae7a35f9d9b5b177ca7",
  "787d0fe43403cf4ec7cc59e44045eea78a20697b46ad39b1fa645091b2a2b780",
  "a07e3fc05c8ffc525319b43caf9c9695f6390e77bc2f454f0058725d8be5074e",
  "abeb8f1aedd1ceadfd4bd58d374094a37afea3613fb2812ab4ae6a30cec3d0a6",
  "75c7c80a21596ef1673c095e0047f3f7cac320a3077a14c2d2f4122c65c7c1b5",
  "7cae53daea81249882dbc2335e371223793f5256999dde9d289ac2fbe17d2713",
  "ede408a885593bda64db469120dba712814a5992f5e5de51cd28088ac04c94e9",
  "9327f1c923caaef524fd7d016fb9279d807a94fb40083da0f527e9d638e329de",
  "58cb0586144335ab09259caeb74e87b2d25a507e5bb6536c37e5363984b1254f",
  "8f1ba7e297457c3d584ad3ba46837aa951d7f6339fa4e0ea19dee7308725fb6e",
  "f29e40324635977d3a83ce753f8901457ca1d6b214b83c58ed4e72a064c0e46d",
  "54aa7dd66243114f96641e5415438fb42b3e7f5c276ae26bcccfae8b991ccebc",
  "87c782f7a2cfe1e961cbed6836bdbc00eed3e61f16d125a35c315a2d98cf5f22",
  "28a286a43f1a490a74bdf6aa67965c3d0df03dc6211e54ccd52d0675d83b53d6",
  "733efd2c2466bdea577cea125e1a5fd2d0ce7c3275c77aa1a049c301fdba8955",
  "f7b7459cc150bcc9394341901ed033f71a0ac98cc371fe270c835b1c5d2c31ab",
  "62e23b0d6c0e04c3c2f73fc8e4e671706497aa1582968a7cdc55765c2a64e84d",
  "389f3a9fff6cc266ade563bc9a9eb735462dda504f79652f33ff6f5e2009544c",
  "8ec237aa2270b3ba4e96107ab96fbd0c391bdac0ab34b7c39f2214ebfa13ad96",
  "87c5ffee487c4d1cb988671f56e849e778c883f2807cff6cc941eccc82ef66c2",
  "cd2f093bcb01f5cbce8576ea28840329dbef501aa802c030aeef1c1ad8c3a735",
  "57b7a7453091935fd0b6f7a91e9d4015471dab1ff2c2cdccd11a6be23eb0d6f2",
  "45dbbff84da79cf47c3c469347e3a26b830dce7c1b654c9ce530714125996e88",
  "ced9e1ba0c1b4e40f6b0ab64324d7abf8d06b44423a65ad81d692cf6ba13d773",
  "d36a3713bed3e9cd0689bfe3bd8b4d44cd268cdc84d1920c0f8f64192f9ad96a",
  "d29ee2a1e13a37d8fe3e5df06882124bb78dfc2f1d06c4e75f0ae3be5e3ea567",
  "b476329ca22f367b34f5d32385a8e2e0b3bae190bb53de95259c3e4727132df5",
  "84ce151f7eeb4a05b24219b7f97248a24342cb36968412424ecaab77abe10d29",
  "da4035272e21fb7b0af650f804a3c429953e5a8a930d32f91f79bb8efcf4229e",
  "d24003fb14512b253a39551e9c669bc154ad4200fee9d7a78d8d467555b29207",
  "c2774e2479013f73ca1e85838ab9ab64f136727af5762770b6580ae06e3145db",
  "14f4109a6b239f6a25d8f408a4f20390db063cb2dbeb5df6882cc8b1ba0b9173",
  "ef20ab6afa5e52f7543807334f80324bfc10ba0404813c914f7c621b1232c4af",
  "d94c50b31d5f788ca5946a6299b8fd878522156392cb5a000579ee924ef0eb6b",
  "e557e40c6402ad66bcea678b5cbaefadba3d434df4cacaf4b9b7a6b4b4c71f50",
  "bf1f2ff1d0e99fa3c3f7f4aaddf0d07bff3c684264ef8d3714633d82dc237685",
  "6dfe12e4c30fb9fcbe56c0c97290c8538f837ab68bcdfa7941eebf5ebf2a410f",
  "8f4502a0f5ffa0fffe70be0a8f413425bb5f897629f5bbcee275a3bf1fd57d1a",
  "8ab7d35688af08450b779387d8578f83fb106088f58cc1ab02daf1ab3556fb5b",
  "f3114df503bba177e6d5080b7529cabca46672dd0946b292682fa4970e686f82",
  "3dda429a98ba3aeea581d42cad4d95ebaef54eac1f7c75f7e62266d2b1db4ef3",
  "a605e0c828955b2b986dd4a19ca29cf08fed2fdb90ec79974fd45bf4ac8c9831",
  "aa611c51e2785c670c4761ca46aa68f656dc0e2a3d27a8e4a161a25ab2217fb7",
  "4c2f41ab1e9802ba3b10d040a7267f58e4412f0d84c540f20190a0d5b208fb76",
  "d438c6354fd55f9a1fe0944269334573242177e81a97b9f76d1e582db2e8cb0b",
  "667e9cff9a11ec26ab81c61695480f0a80055f941aaf156c1e8ef8d8475bbe43",
  "d556442c70ced054f98691b26578d27c52eaa6b82648d5bd92ef9b9caa48d5ea",
  "5d21cd988c2e98107f4ef32b956452efcc99d834ad85e0768b0a3670a43684f6",
  "9be0ead32a83a45408cef30619ed1284328cd64b48b4c2f0e6ec5b51ca78bd2d",
  "f7eb59ece8037c132a1e22c04ea9becb7dd7b5335ca16068a2f164f7ff83f9fe",
  "94485881538c314a4474e7fb0323c84af1f2c70b75732219070f225af37cd32b",
  "7a27af06261a77037ec6f3d3529a0678e2facc39371bcb3e3999544258617fc4",
  "4af18f8ef2dcb930a2356c60cd5aeacf2a6ad8e805faa9e61fde3f594010a94c",
  "26bee3449b8f9617fb03b3ab1a0385cd2499f0541f9fdbb5b811403c53a2abc2",
  "bf303b78ec4c67842eb8b46e4f8c07432d81b6449df10da86302331dfabcce1e",
  "c0cdcd850148c17843c09b06d1388af7ce0b7473d5a67df773de2d0eefb5fac6",
  "0e4c47d20fed39ad2385b09823f6443a0065026c58186f986e1d30e9f26db8d2",
  "9b0326175237be88290525b64bb201e8bbe86a2155a8922ef31783106440eb7c",
  "b8e2ab54c0b12d1bd728f89639a19eb11404c17d115ac1bf9eeb7e787311b0f8",
  "0e48855d40c63cd24fe0093857952595c1e6c91fd8485a955f270cf080d1662d",
  "edb5e54f050081ed1100902cf5676f8a030c2d992f400983513f798ab0d9d318",
  "e44be43d0004c30ac4efd066b74f5d8a3c090c438c538f6fe97ac4cc4bacbb71",
  "424d21bd0b82ab411ab57a69b76208429f87acae313b53b3df5629976e583476",
  "74aae46c9aee0095869a0bda17cd75f3b30f1abdce3e63f5b43bbf796ff09fd2",
  "9439b1f26dcf62f4b2361da92b2e59dd13e30cd9e812ed09c760c1340b246590",
  "db619d794808244ae3d189029402b1fcc74baf75314d8b9f458bb8d8bd4f214d",
  "5a469ee766734e08d48964fe45b137217fbda3ddfae97945d40e98f65885befe",
  "03c22c775f1e576583373bb28a88a4098520d02681c8be3d34ee55917ec461f6",
  "ca1b63fd8d8459c0100d3d03bca12333baaa967114006d976f26c9b6f59fbc78",
  "78a82217fa057c5b1b071a70e347e88ff1fd91b60be0bdcf0584c883eb7c6e0d",
  "2e0161b3d50e020935a7069767a007b1d1e4f7ee1ac9606727466746c3f6963e",
  "84db25035021227975ab683d0a4239a319705f4174d6a069ed17016c02f94d4b",
  "79f4b2dcfd318016f82da5803a3bebac25ef2fef54a518d16cb903c03fbb37aa",
  "bdcccc0d292ef61e2f31457a5e00bb5435bb8aab653690535e60b18779ac33f6",
  "8339baf732d8f52d08ebf2d0625b369b257624d37ce1a35bb152b10bc12bcecc",
  "9766ac02e5babd66b3b3bc0d5d79f8cd5afd343d4ea4f4f5b49768878737e246",
  "43b20d213521963778b0561eac5fca5b5d786155ff9ff21dffd1252418ca9d5b",
  "5574a2f0d3e442effe8e66455949b6f7a90a6823086e405a49b2a5487b15cfbe",
  "40fbc9df2c769d65146063aca77b6fb40c7273bf177dad49b1fc5340e5cbbf72",
  "8dca56294fefc7cc04790bd946de20c5a3ed11fb23c87f0b959021115eeede2c",
  "b368c28ebe6fb97f97b3e63c57dc8fb2d6a9daec2dec8a088d60677e6e6006a5",
  "cca74d9da1474793bad0ae5d24f35cb0f3d608c51b7385bdae157b8c528adfae",
  "66248a933cb3edd1de709f860c5c73329651f755332c4145350c15a4be183fec",
  "118acd31fd0d595f8157c2235b4b0f68cc8af60e38c9015931ad11be68741919",
  "14a9cab42eacf0c4a6406bf60b732baed84ccc2a2d253291df1b2c69f965e442",
  "08c9a8b3729690a3ba57beedc956b3b85349ec07e5da44ca49d1d2e3a618566b",
  "ad98db27459fb9e1abd46269bebe8cfc49a0e08667bbab619a2e1754d9930114",
  "bedbb97aa1044762c98eca6bd45f0888b69bd470034d6765cbd989c4dd2a8339",
  "705d65eb47983e17cc6794ac37ce82f80b2503ca9d1127be96210b4459e174e5",
  "6c83082309c509f6eb15b016a4b47c5428242151ebe18c2648decbadae356234",
  "38b727a31f915fd25ea46245ac1cdce012b641fc3907afd3523a395765680420",
  "22f82478b574f5bc4139ee39837252b20dd66b3966b0ef349ad95cdff7fd19cc",
  "8ef047d4e0ea3fb5091732dd83f82f969ec445b44c14c00a71f7e0553f24e446",
  "905bd75eeea21acb11e916c679e1d90fae6fd53fccd90b697e93ee5424e56afe",
  "1188e067d516426a8159b7fc831cb71a0bd4c6b703e8fe203ae11fd966634c87",
  "68e91ec6e8f049c091572e0baea8d0588fa4088881b6bfcc9250629c1d5fec4c",
  "945252e62a666f2cd20abea8b6fb6be224f66fc6af1f0d02cad557a2a284ef30",
  "0b5124381c95b534788a1ac079fe507b503c89f510a9398180d08341d9c0c9bb",
  "f087170230a051394f66a0dd2aed1b443ea209d4115273b1438205f9ed4e1374",
  "530bebde62ea3b77067563853885bba105d5acf91796d16820acf2d464ffcfde",
  "812981188465754747b9739a5159e860e4c0ab2dea8a1ddc30403916ef5f1cb4",
  "0ee73984a36927d15cd04db9009e75a21e43c9e4b62bdb5ce874b590f306d90f",
  "26f90973975c383f7545e50b2bb07a9aa4b1ce0579103e289319a68e6fdc5ade",
  "5b6c7778b44e82040b06c2db6fd00d1c229964ce3e6d73741b9fecf55e8bcd7e",
  "cc3b265bd2d8e0b1ee82a3d3471f309de42c4ffdf9182d75a346a23d95a4d072",
  "3097e56d857238cd042e26ebb92ae392a8afe54e645a4fcabbe00f07008933f2",
  "5fd25ae985caabf4944bcd3b314bd563ad732f38e78631415ca9e761f93a382b",
  "1014221154cd8e2c99dbb40bf3d7d5d6056065160b194f06d61cb4ce008267be",
  "a0cecb1670ffd0e3743797b324ad4e81a4b1235390ed8fd562c468eb34363a6f",
  "13ef0c488d928cd94999a281c514dab07d2260673d164aec7e3bcbd44eaadfa2",
  "8e41145c4fcad4f25e754a23ff4f7d75d2943c62837bc842b06075912a196a10",
  "9815be44c69312c99069570fc961b8c4950be3534aefb2993cf789fd1e29a616",
  "6c89950b5a2d4ce68a69ec2ef98b6273d22c963db8e7720ac812adf23eb6a2f1",
  "32bf24251ff0c9c17371e0d1f414919dc3bcfbd0afe5ed8afb5dd4088ea19c83",
  "4db6af32715f070b3cbb3fb22440bd29c4c47cdfa407d24379828369659c9321",
  "67630fa39340d0d066e8b0f2bcebf088a6c7737fde87a6f300a51a00d15ed26c",
  "0a9dccb4821aae5c8a92d0a0a349d5da0402b7e4c8417a058fc062e28796f16c",
  "de522c0d85c70a37be4eeb8640d1506bb7fa93ebba7fc272f01ccd6138960169",
  "585031d5f3a012ac54448f0e5a36450f1803fc3db1168c696ba608d02f933f36",
  "e4e09b2490b941ad5b85ae87e3d969f27a66be43fb20bb435c94741ac752c40f",
  "1cbf07a73059beaf01a361781dda6be9a98c14077db6f3c7e951f1bdc5ed426a",
  "50057f87166b10a692c82929ce30d450e1817ac22e576b6e685ae787a4b8ba49",
  "5723578f0b0e3204985c97bbf4110b009623039cf5b474c8c01ed50d49eafb8a",
  "030f7de8cc456ba8825fac153b599de4c7b6844cf648282be642a5c5b6afa487",
  "cb6091d6bcb300c3c2fe61bbedc3ee411200e701abacf15d41897419d983e755",
  "661694b862ee18299263c7c1bfbba82bb8d0d80a7414dcfc46d39d0cd0e9d879",
  "aaaa2f737bd547a3dc03dc21e898827d2c9c3217c050534ef739f19029c31ff0",
  "8c185bd8e791df9fa575532e3616a15cd87cd6cfdd78f1aff23af7674872fb0b",
  "fb37209b652d976eac72b72d0a60526bac5a7c9af0767fc72ac3b99b5dddeff4",
  "4648bf171e0705e517146390941f71fe07e27fd52f379d50d72384f7d9f9dc57",
  "f8de1af25d2d4eb1a2bc4075a93204a1a2a6fcb2daaca0540c799e10bc0f8446",
  "39ae11fbcc3c4d6d4fa1459123c5ee554e5f01d62e63adf0192e57ff55299d4e",
  "6ffa4c540b17318f5900b87e88a88b9711e2a206e5508eb8635e16b7c74ab256",
  "4ab1f83e1ec431bbec5867c38b8b0f63db438a8fa57f67c9c97f0992cceb6413",
  "8fa4291f02e7133fc27d9bf4956ece6d1e71883bf09b60a7d39f7fb162a416a1",
  "a26b598dc2395160960a4b2b2304ba650585bad8819558063a35bf36b9e062fc",
  "64d4b602eab465e8edb2e1793525c41fa63d27e8033efd4ad279d17cb3be5fca",
  "b54f4fdff6b8738d09e888f898e8ae3c18b87f900771d579b90650cb5e0adaa9",
  "ce50472fa04c0389473e8a607bc2dd73ebc95ddbb50561a0adc3598c4ddafd56",
  "64dc5e60d355aeea555464c019a5febf8a214ad217b8529fd3cc6cbd74d9eb47",
  "0bdc5452d45218fdd2f98f640aa0fda4fe555e1657a269d5e896ac390b853b5a",
  "433ade02908143fd373c98254d835ac8db932b08e6dab77ce9afedaefe8c0d3b",
  "292e314c1223b82ce730dd7d54f0dc4600ab80652928aee2cbabf9788271210f",
  "0e6793cde9559ab5b8d3c2d49d17f37ec76a8f254a978fbe0f7ffeeffda86299",
  "24654b08b0d22e71aba2059de6400e50826eba3880bcd7698cf0d293c91eaa5c",
  "0bc87200c03c32f2497b147305aebfd81fa4c6f5d3ec204ed19e240af7c69492",
  "b8022de6bcdb3306232f885969d35ca28faa3e55137831b277c5f3bb4af9d826",
  "332952b219128270a99d4539dbbc426d0894c5a0564bce478d6da095e03158fd",
  "338c8e4aa0d2823cb923109c8e533154031edd8c60a4f6e228e6cf5fe2f38674",
  "dc1b65d3fab6e63d36c0b6eb4c239b019472e0a7a4db4a8f0545855aff78d67f",
  "6e117ad2cb3f3174a442c45df2adf5e68ade2b46adee7de3bbe55e92e8103fbc",
  "98c80d96a38a50aa27b6a1bfed5b1fc2c19f80a146f34b53ed8e9f841c39cc42",
  "d7465b3dc5762c78ae4480ea53e0a017bd7375458dacd90f61c14dbc72abfbaa",
  "9b826cda60ffba2a7650fff7d755d93b91400d4bc678beb77b96be9052216246",
  "5b1584bdcec19fe6e9bdaaa9ea61c4a85f5da31eff292a9b182d35572cc7e76b",
  "d9819855109296b36596a7a9864d8e8ef18fdcf004bec0822e95011070047113",
  "3254b610b337b7730bb878b694f2b37141e07486498c8e5739240cace951cb30",
  "9f666f886402b902d1b5ed6a1e32a95877e13c7b15e4a522d6b213c5640677f2",
  "11b49ed4d7204b0cf781aae3f552cd84728639e689920b8dc3e097134ae6d91b",
  "1cd3d27fda3fb5ba4f1bb238e826ade3f5b76cd32211bfb53df773236b18d284",
  "9935af2f0b5462dca789ebb12715bb047332d91fd8bea80cf6421509e840b888",
  "770dec3f80303574bb85b8c53e02de1ee9cc085a99e8895e51463136c122fdfb",
  "69b3c6f7bec50d91cae0c6735e6b58b63618ed4aa186547239e2875293dd49a8",
  "b60b92b9530a59ec5c5efef4e173adaaa5ada9124e99d897877b61339eef59e8",
  "0313069c1bc170ff8570f1f298926ad4ff314b6b341d93668216007d86255df9",
  "2abaf2ad0ba130a4250d9de76092cb858eaa572d0d8d4d1ddfb5793eac47e648",
  "35fe609ad96e8e22a69f75efead4f8ebaf2228c8e9e5a9cc70695eab7df46bf4",
  "8ced40f7cbdd1e189df7462dbd06a18fde94f73d677b7a5e8522cd8c94760503",
  "cffb5cc2213b87feda5cfaeff852a660a2fd4ea3c70532a07152871347d3d7bf",
  "59775408164a8b673055cfe4f9d26d6cd005789c3ebc002296edcd1e691b4e75",
  "c0a207123725d1cb1f51519eabdee7f6d7b2bc944e436a360650271e98d9913a",
  "4cb451c52822fee1b36fbd018153c138bd7a965a86cba961752313c45d41d37d",
  "0d1f0aeb5175c36c0b655d620f2585be0986f965ad93a52dcef9557d4c18868e",
  "b50722ffccc105c8bc0b036b064421bdc486d1a164b7254e05d653f969f783b1",
  "f3cf08f36b859a27b05d0c5ffb9c66d119a1e1f508f22e9abeba7537c5677c00",
  "79b04ca571caac27b25bc38a744f9caddc09ada271f8630ae0e71b1664f20d02",
  "e9ae6ad9fe116caa415b639a5a75515466fdd8fcf4307fe3cba7e8f123ee159b",
  "8f9f689cd2d63baf8333f0ab742d6c701f79e2af288594b4a962015aa3653c5b",
  "0f9326b9a3e0cee5003f653c8127e9fb418213bc012aacda22654957054208c0",
  "ff3aa62b048a692440bf159f5e7abf1b7de371bdf3f6be094967bf59dcdfdb26",
  "7996f723f302fd4091f1aa0cbb6b8bd78eb022bd28d868575c0793602f564141",
  "6ec7c24487a84c7bf43475c3a225210d35f3426aefad9595e7bddc0b4c52d328",
  "b739ec3f14fb15a30bf8fd19d336f23d0a88d8b56fdfb551d29bd2a2db52cdf4",
  "49ba08e1eca4dd672a7b2fbec04ad639b50b7de5647d2c560781c6e8bbd5c5e7",
  "fcab0b1410498f845955dd478fd484df36c391e8a5153d7357e4a54868997f20",
  "8cd4d5604fc321d2428703ba983920cd95c7c5c45479ec40999cb4b929bf97b1",
  "2a2c08a27ea4fa4c48f0c6a128ab8fc57161eed93b612a7f4dd1730537ba187b",
  "36600454d0db71f4a87af0fd8854b9d2ba34a727df1fdc582b5140791fcd0249",
  "1c5ef29781f24db9b48e490bc4de8ba2f6caca5d818f52db8cb1ba84efda872a",
  "fec60de6317b5aa876e02fa58538972bf6c8bf1e266d1a8c120e89736761e457",
  "550364c6a70f3e99957802507c6a8122b6f1b82d3c24a9b6f63525ff1bb0459d",
  "5f692c2f5563b97ac7e0791a9bd3b9e112587b5ab671f55fb12f594927094e2d",
  "80443bd8260a54262685e5f909b084806929f9d140d670f65ea5bcb8bd22dc81",
  "eadabd0db14bdd52c0b189bfb38c3cd6cc26c76f29b783acc0eb9190d3ed8184",
  "90b1ca405b2b1a28f3f23d3b5e6fca48a8bc47dad506ce05e23e747ea608cb29",
  "6e83e3b530b146ba160df994cfdd734ced5594270b1be0c7f6a71e1d6baf6c2f",
  "83d477e3a7aa212822bc9d737a6a801b492297ec0e89fa71eddaa5a264732cdf",
  "b50664c040bda006ddac6d008bc5ae053fc4e345a9a4030d909d2e67289ac152",
  "be31dd841abd30bed4ed404a0c54f16f1e6b0495b91a13d7c31490447262e626",
  "a3aac636d11e03b32feeddf2d6b55aa6363147b8abcf0d64fa51db0f2e179b34",
  "bfb796b29ed723ea23a1e83fbdd653f09bc997b4d37251df883775c4052e6781",
  "3055601b090b207541081be49b481b85e61a3e66587ad5fb702482119afa9f1e",
  "3e1082003ac2f35b534208ca679fc335ad774cba7abc29655d8a103d37730328",
  "c913a6e0b2703341eb248ef228c60abe044f56bc4f93cfb0732db64a774eb33f",
  "4f97f2635219da334696a563f5280a7d7d3457ac7088382c45824ad2759d67b4",
  "ebcf306c1d194b0fefe98c2b19f26f6ddcb17b25daabe4eae6af6d77a04c0e1c",
  "ca69a8a557ec4743a5f350383cacc49de1785ae8980ddd8c6f25bb0a3ae2985a",
  "ba982769d494c0e291f67a917183e970b164660f996376a3516a5a933d84bd9d",
  "9f2a27684fecd8c99c5561bf6a4e9695268bae050336b06d0069e3113fb7fb88",
  "afe753a44ebce0ea5bf87da9a53b1631397567156c18e684248ef77a4d664b43",
  "388d67c4875dfb77f0788e60816a045b97741b9a5a4afb9c3961ac1402406d3a",
  "d1ac2c764a072846148333ab14973e823f2a061f8f7b9bf4f4d630c75d3c9cba",
  "69f33af88ae70debfe9b5fbb67fdb392b58e435c568d5a000349997f1f13694e",
  "1ff11c6a7b52c75d110464551bddec946605964980df267ece1dcfd286255891",
  "010331f4f4d91df989f790c6b2012b3075f9fe24ccae974bcd19a1e2396a1269",
  "d86fae731badd63bb13cbd9fcbbaf4bc03c795c5f2ad9b71fd29e36ee5084ac4",
  "b70a900cc8f40719822bf5d4699270edf19998dd6f1b7bd7fde87767cb9bf8f7",
  "4b2e65d315f2c4220fb94cf2997e484d323eeca4d4cfc01e36864acb3ab5c152",
  "61a99c5ecb0f6ca6bcc8b3aad0cf5c8d4687795117ef624d6ac183aee27e4f63",
  "f8f941e5dfe4081a9fa3f07e855e5cd7519912e08bb3d8caa4780c1f59842827",
  "26506a905812669f5da842b4f7b68d9ec62630aa445e2862edb63cba8eb1b358",
  "1e7723e98bd9c616f104ebb85e6301dc04befd3fe777e0576a339c23d7cfe468",
  "78c4caa851ed8c3cdf8de43215758c4bc9978df47408823659d7b8adee47188f",
  "f0b83ea2104d4f626dde5eb2421ba2dcae2165fda1db845c8537f72749d9c587",
  "19b93ebf5506e1311778c0b116e3a50709358affceb53679c53080d760ae7711",
  "1335865789263d171b8337535343d82aab1ba2f8f2c3c913b2f31f8884bfb296",
  "9ebd572ccf30e922f3d03a164f8b292f3336dd5c536cf31557eb5244ecc96d3a",
  "12bef72d13e250e8ca0b1732380889e0ea8427b22f73dc9a31c51141e60b6343",
  "27345d6c4ae59bec112a18be5010c7495342349d866da09fc12c733ab3ac97aa",
  "45d1deb49924d8a6bde3d30335dff439eda700416cedc6887f5fa5cec41b3bbd",
  "258066a170039e85530489339b6d91b690465dc670f407f4905b675ee2da944d",
  "49359c6751d1bce6d357977e6728ab607bbf43dc5f512583b8c3cc506b9e5b4d",
  "f8ce509be5a5b84a4bf31efb29ad9278aa932ef0b63392ef612801a79fdda55b",
  "c98af73a08caeb231b02177d65e500918a03dbab83bd3409c434deb282f19559",
  "75326b2310c74fa661fd83fa49975214c75a3fbbff38d802d901f220a3c080d8",
  "587be2280208e1475cb2b354aafac098f16cf1a27f6f4cd47d21d8b77040c5f5",
  "41943e803f93a464cad65599247e94e50668ffdc6d15e14b608fcaebfddce3fa",
  "e1643d62179f5da3fee43ae3800de40ee0bf565ea7b939e3272e25ccffe5442b",
  "340afcd6ee941acfe5e74b899cbe47c939d5ad895d34bdbb85dde8d1b10af292",
  "860b3aaaf0fbd9d5fa5c0779514bc98cd1394553085d5f89ac3a71ecec02c940",
  "af83e1a9ac8cebf98340b2976f7dff1ee58eb3e91711bd0c6c41b68488216e9d",
  "bb2004bffa937708ab51a07f6048d886a78c9199a10ae6737fe2cfddd3d6cc53",
  "228fd684c47932bbe629e9b5276fa363f5cc09c552d71cb254c63a9a847c291a",
  "f990ed7af00c26b6584cea5c79cab7821310cb269b3b95552df09e0590fb33e3",
  "317de7e3c8b5dbb46d0b1fc3818e777a90cc12e462e3462d7e601b618f3f9a23",
  "cc7243f469f1dc834f7d55df7538b0d44694cf13f9007700431b7b238aef8882",
  "0928731ab0c4e5fac629710e975f97891bf0c704d4d2d5682cfa917e3ab00270",
  "7aca1a6c610017de7616b36d96244ca043aa6b1dda3143a1d65e736a5105db88",
  "88d384df46d9eac24f24b6c01b55ea04ce1aa081a686d1c92b11ddecc00efd9d",
  "5bff31a8458944125cbfea63b33b148b0bd12fa5d8ca24644fe3ca449349af25",
  "c016d6e0aa05074b53c5bc1a8325c0bbd84904b009fad557c226be3e0e79942d",
  "002d98280e8fedbc582e21a58e5f6a5c996199f9b26e3e5ffcb1d4b9a5033e2c",
  "9a23a13b59014b036c3d46725900511a7af4e47f95d365b7d5c3dc1d0c60a17c",
  "de20f7bfd6a47b2e277764ddcd9925e0c2f9626aaa6041c6855e10ff7dc90d9f",
  "34d46239a7e064dba7b34951678b73cc9436c1202740e1d2f45b40cf44d68c65",
  "d0ae7b381738524488c3c4413ef9bafb8f6bfc27255eef566fa602360b7e6994",
  "19e704afc971f0dc47109e15702303ccc741310e9b8f46a5bcd674d06f16436a",
  "488bba465aa7b4a6f17ea78fbc4bd040fecd25c04cbb0c20e049bc5f30195118",
  "23fb5edad7bbb70021f3df2c5e5b076295785fc60cc831b7fdea10765eb4acd4",
  "2d032e6a4667d4e003c98dc890d357e20303b8e72e5eda78b0d3862c9b1698a2",
  "069d994834c7ba4c02daa060ed137aa7811d8f990f34ba006227d9a6b7add0e6",
  "cf5bc07dcdc76aefaa189a0da780153f2cc1d890ba75e230ff84bcd12ecdf989",
  "4e3dc4555f876431f65671bbdf3aa24c8a9eca6af683dcc495240c30e4a661b1",
  "e63caea9a3f311b7cf15b8be5d9a43fbc43732d815de8265a58c9861c8d4d9e2",
  "74d02c1193957e02b1b318dcaaf8a35c323f188f1a0892b09b52fd9494110963",
  "216c32efd44ef6ff0ce9445910896c7e89f3da53770be10c8541c9bf77f05e57",
  "ad9c000b4b44a5ca66e6ed9f189d221baab61758011c6b7177556a2177f1c014",
  "9294ca74104bfde2711e56d605cea53d98156483f2f25b1cbb1ceb6d3ee5ec87",
  "e3cf7693f1281ff6b795283e2fc281c22bec7046f2d404997f50e858656bbc20",
  "0eda8ceea214368100c616663e87f9b08949ca0c51e57efb8a7740c7bef9404c",
  "4abb9de7561de5729dde61ee3c0de7421c559eecfd6753e03d7db66b123d178e",
  "82cfdb0b402f7716d0426e4cf7339ed6238699c00aedb9e624b48402adcfa7fc",
  "7f707a8b733655f3e274f8f8964fcf8bd1ff1f9e5f96cf039b895486b7fc1007",
  "dd4a82baf801b0acef3fb81ff6fca7ecef62d5cba4a5415ebdac383f8b694558",
  "b33a70366295761ed2d88e6bf2a9b67b66b733df8bd76e5bc37250c16004f2df",
  "9ee9b7bd7b62de4d49cf4daf30a56635bfdb1e083857e31c30841dc3526e4d40",
  "046bae5ff39c1bd8b314806c50fd751c0026a472d26aef52982547800b8fd659",
  "cb55ee8568c994c38a03591f0dcaae7e1cb4c49e6308f063be17a747e26cf1a9",
  "183a0eba8cad309bec27aa495495d02494864909594e4b45e5fd9f476773f1fe",
  "df87d66fb9c15562b08e8ba394c29ccfed3d7c321a6a98f7608524a365027c9a",
  "6e78bbfeb008cc35720ab12513b8b4ffd39c03b1b7f4b1cc65bbe231a0652caa",
  "75bab2095d6c9e804bd253d1e5011d9ff41c75a1a2c5d100513da2c496ec7e5e",
  "2683f0d772e3709bd15ba83bc319c34aee9c06b152f374b5d18517e67688e724",
  "b0daa7afb125707605ccf3e6f119dc23727b5d143ca0f8a6d3e73cf0e1ebe07b",
  "41b6ca96bcac27f6be47624b2b927f21d8ccbaece893910a07391fb1a7aabba1",
  "ab1e9cd4dca06f15e449e03db1a794d8b784a71a7ec54ba234b023e2b361bde0",
  "3216ccf7fd6e3a64e0f4b1cca6ad47383b99f16c98f0c24b77aa7905556f48fb",
  "48d62d2372dbfbfb4c1d40fee5e89309d9aa8c51633c1c3d1b54e4e2208001cf",
  "82d213e60b0f0e832212fd931e2c211a23c9ce58edd0e818f565dea4948bb517",
  "c753682365f884f2ccf81149a25039f422a976605ee987779b55a315172f158e",
  "ac70726d3b3d6f470d0d913f0092b649e42f6e8dcbb2f50debdd68516401161e",
  "c79733a8e5f69d73f7baafd492bc97babf242e43f37b07920e181554a3673998",
  "9515bc53e6f4f61e304acca6cf193e0dde894718dd220cc45e7d8146ff2611a9",
  "8e004ed7578e9aa18fbfb65c5e2b9de5f67c4255a3e582b0ec207cc6e5b8e739",
  "aa8205bf4e18f651d1be6ea234d7fbc2128145756d6189cf05efcee9cb47ef5f",
  "c41e918741473864904122addd1536c3455089aa9512fd05677134fa0640246b",
  "d9c576d99fda0aeb2a709c6230ab98c6bcd57da56bef1ceb8a088d2635819ea4",
  "a7ef58f4f3443679403296d261d144e00c86d582af483eaf1ded58977489b3ed",
  "3aa8d872ef26c9a24161d9c500b8b1c299ee6bc96c27750de58d357ea51b2ae5",
  "8802a87fe37502901155ad7a7b99fa63d9d729708c79c66b2204bbce5b334d54",
  "2e2393b0f324b5ebe30985c12063604fdf21c5dd4686a12330bcdc15b10f731e",
  "e7e2f14e8aa5faf42d64d907856005702497694e513f83c6e61532e6fedf98f1",
  "de8bd28dd76a764f728e78de36536882f2fe4d0c2cb96df38339b85fb3b107f3",
  "5341577250a68a9ca216c9b5d86aaa15ec1384a9404cfd7caf9b4f3cac6210a7",
  "1dcaf3edcb588c77ed4bfa11e43f689900a0b021fd2d2506e730cf4f3ddf585f",
  "4349af0aeba70a0e18031635f9d5d529a610dc495f4b76c5ebd53e11f6893fdc",
  "4f8d04af99e8d74b726b47b911e309f74587295fbdc4441d89874c3ca0a4c5bc",
  "3168b75640649ad1eb7927dd3bcd6a305d8eb3f861a5646230fda3cb0a730df9",
  "782f5ae0f7191dd8a391e236a322f78ab9a0dee9b8ab91bc5b7bdb63504edb8d",
  "1f4d14d3fa12af2c92f93748a566f1b59607cc2c18b6138c4903c7d033492149",
  "cb7085ad01baef2f872ecc976c9b7a6387e210da235ab774550413b9f173be48",
  "0dc557b31ee6626223f758cf0714aebeaaa8d42b49839dd878f27cbe9e4005ee",
  "034558d2afba52ec665a0964f60521dbaa1ade712d1fa99a5a6eee72a2b695fe",
  "2b2c5943eb18a7f1367e2c46b460ca295ad2ef7d03193a08dd0b3ef72963e87b",
  "7db2e4235f10589b7f80002412b997d8613b99261a41a099113ffddfae27cc51",
  "18470e4214c6e640ce691e74d4e50941ae3fe5ed21c332dd7c60aff578d6a972",
  "0450a06c97150c99052baa2d386e189d3b7a533b767b56c710b0b701945dfee5",
  "a95097e60b8c40bbe1fc73a5f4af39e97f9a7c5794d819bc679839b606bf8cf1",
  "889c1f3a468d824b7aba6efcc36c3bfe3c41753d936cee54a1f51f3a9894cf25",
  "ebe3fafe724a4d691d919498f3c044297b54c40f97e9b4fecc4c6b7cc3a5067a",
  "171ee2b5597f5438656922dfcbbcd0bed30423f692b7c21be58b91091dd6d3eb",
  "e4137b593ce9c83a15e0efb767c13394379f2599a722eafb457ec2925d124d86",
  "e335f75491fdb81863abadca2d58b26ce0a5d0f162172cf8542cea3ff3313e82",
  "28c5f459bbd172eb6f2ccb19818b2f25fd7c535a3021125cf4c858a30c5e39f5",
  "2dc91d18ad157c95f35ebeedb920bf30f6c238ed55039beb2ee2d8fb5d994030",
  "e7dd06cb69fcb0e90afeb7cfc34b694b27ff950adb61d5d3d2be09370d2bec38",
  "2c12ddb1b640355fd9176745a0fcbbee007b2e7fc8bdb3f9b2376a27c443af07",
  "f466b071d068da0f59edcec43c4d2d7be21932b2dde89579b6239b0256613717",
  "cda34f93e18ae5e6514a6e5e4ee5538dcc3fbfe1d62322c7a9075d937eb1edd9",
  "8d795ab0b3f00221095a920bc855bbc2569a1658626b9422f9c30098d8eaa5ab",
  "076b8fe398e5fdaedc642e9e096c044affad30fde97140a04b2859bf894df55a",
  "94dd9158bc706a0362bced7c65c3043ccf35d8e3db3afaa2cf7adc0ee4184ee3",
  "e2f07b42b46f2c28b056473f2ec4b8c61744eb8480a766becff6f753d3a6c547",
  "9815aad59389c9bf86d7dcbf7a91f11559cfb1214da16447fc11d7162721cd83",
  "35f26a576ce43221ab8ee0594b33049b2dc7f270dd70c6b21f8eccc9e44c90d1",
  "cf0b78b923930e61b800d75d2efca946a33e8272b5d94cd005f8818ab1bea704",
  "cce754d1a785ec73f338086f5a73676a49f08b08f0291ea6f5b8591bea3bcc00",
  "2405ac713fbd8f7bf2673050367f290a29b105f90490cbc880e5a51c7452bd2a",
  "3c445b7a32cd59b12dea23822ab66ef75e3c70ec6253548a571663830475e8b3",
  "254ecd70ff744553088f1d680d06296b0dcdaf430e89878d11541c4a9520300a",
  "94e467a19eb01827571a5c130b06a04979035d0cedfd1de3a9487629f0a0ef21",
  "fde52aeb90868f5d22f3768ca4b8f3ec59a2b896a11a77e33c1743be02fadcce",
  "17167fa312d15c3a8b74188c6f81ca45c84d8548bd28cd9ae081e83f17a9c70f",
  "dbefa8c1d0e97e304a5f4c69d5a11eac3ba782db9e68d852fc56bb2ef3c39cc0",
  "da1f3565224d45e9aaca8a5b0a3f7864b98a82395393d6f6657b417fb9acd0b0",
  "10c46462fa3b169bfa49d9d3ca1eb2e3967647f3847cc0f9c1aece90ec936ef1",
  "895502679daccc136b0ba53ed3e300edb2cb10d42cf42524e6712462a0a42620",
  "52df151596d2e65011f5e8dd6e1f645d4007bfc894d45ffa0c0d6cdd1215a98f",
  "cf42d85ce1dd12ec170be5bdddb839c72cadd0748c5e57af0392a1c816ac529c",
  "9114553987de7ad449df6e18709fed7100fc4c083f2dd8cc20598ce2cc7c0787",
  "7c3ba11b5dfda65c53681cff0c6f888a0d5d479f4b0b4902a9fb879b23a676c5",
  "6a2a980911ac967330d1ec3ab766eec21929803bdf44eacf99234ce5e1fd90c3",
  "c5faed4e90c953c2ca4e8b689a80df5e0873b78d33be9c74c7c34dc47342248e",
  "7bd592eecf290b5b2a30dfffad28163c4b310eec6725fc32189e87d3d2f9cf6f",
  "0b34532d9aa48a999114c39b1a21b0f4016255df40e84393780de4186c01c7fc",
  "ed74faad8dacbc5acce72c50c85117c3ff700ec7871cf9062807ac86f49f9580",
  "f24766ad1e13b987a457529d3b3b535e4926913f1417c3ff1cc16e690ae9cf9c",
  "51dc6a2b3e93ed10986717a351d261d65780c8a75b7a218454f3f72b75aa68b4",
  "e7de4f78dd2b083096af6bafbe4b824d62452e765f7d2fd69854c7d8841a3336",
  "eddb0d4dcb25fe75a246da10edfaf823b5939b7891bda25eae37111b912c2f90",
  "bfb3e1f35064d928c4accb24484508c2a87b905a54add03b8c51289dbc87f88c",
  "2c7827f3299d615df837299d773c65c17acda9a3588c2e3786886bf44803b110",
  "eb3600a37f04a1248847e92e5bf4a35a67e61173cb643e20ca66d69d3c5c0155",
  "9540d97212a6d720852771d66cbddc84acd95a871b79224928bdfffd759f1206",
  "0bc014e9acad8ba8c06f238368a0560559468e5a06007f7f7c01bf566f1011e1",
  "90a88a09f005be4b063c2890559d379b8fa2d3d8cef3abd530dacd18c06b1d4f",
  "bbd7ec72690c68094633e6d713a0df61fa9cec971a34dc5a5f6d4e5b55b27d94",
  "bde46452dc0ab9cb6319567b0ea10d5a86f449051f50a250a5f8dd783e9e2b5d",
  "d410c76dec20cb2213428b714ffb55ebc278c538034504f7221bbe77eaa95f63",
  "180972fc98148cd70eff4014a091c3b4b41ebd7f943d46a7a6bf205973f632ec",
  "30575129a464265e1d9bba994f3537ef31ebfb2f3cfad4f41d442a1806c4605b",
  "60ce1a52ef36405a0f3970ebe6ac031bc8c87b7932970456c15871d32ed8fdfd",
  "fc49459fef47224741a6099115476fc63bf54afe4ca2841192e058ddedfd2805",
  "dca2ae67de64084d5630757ad38375c3d637ab0731bb83b97a6e378caa68899d",
  "3c5d41db17b0bd16fd9661864b7a07d2b07869255a79607ab9844b5b4a695742",
  "1f9698ed7cb3197bf70c6f9642c8028bb75f467ae6533df149bf958791b6755c",
  "e6cbe1e9bb44b73341bf602754be3be8e41f221518cba0ccabd3bc5a40b44c2e",
  "2c5f24a508afc5b6eae6e59041958f305f6e54588414f131f80261ec336294e0",
  "f1d24a9265b6fe0a8cee316143e69ca483363bee54f1bde2f53945a2cc0dfdbc",
  "c71ac082bae883d63ea497bdb8934b031bbb805f6e811fcb8bbfdda96cd64e6a",
  "efa995972e49eeb056c1d3b3fb9e98ea5160d6343973c0628c7d01d6bba294e1",
  "0fdafb735b09f79476ed14cc63c2e25b6b8d074d7998edb877326c6f1cf6c744",
  "1a9d8b80236cafccd65d9e26c1275ee635f20b2237baa3760c59e270538232c3",
  "0a56db12d6658fe5dc0deffbffae19f7b0a60f1ebb3fcf568725266f8746d2c3",
  "b36cd8cd29e484f7e2a86160fdf85e9be6e37bf10baebc42ac1ffe63021522c5",
  "bf823c4084d80c76cba0c4aa9af630e5ec4656820427a7aa4ab8cfe864912a42",
  "d42d72c1f6ed9cb8fa4a771824fdc5b2c6fb1ca9935465df512f1625a1bfe191",
  "e5eb04301e882d24aa4d8abaa396747e88cf80278620bc60c88ab832f813ca20",
  "4849a4139b3863561087d0fef4d6827a9770a9a1633e2030d36989ace41b24b8",
  "0316073b8a37b4694b24aee33fbe60b204e06f2b99840ba3689dbf096a89b70a",
  "ac7fa9898994377d58c7bf0743d7b912fcb1ca2c76e17b06045ac16fb3701d6e",
  "0c63a4a29066fc05fa89f74eb3cd7c3e67393bd8adaf5d2d53a3665240504f9a",
  "3541fffed499cb03c6142375b8a8521ca6699ca340d0fcac1d938bf95af05029",
  "1f568dca832ae421db158b0e527eba98175db714b782f9b072e7a38040f8e8bb",
  "6557eb3cd1e863b86394142544884daeb21c297fa73cfecef8666f6860e2c8fe",
  "f4698288337faf81bfe497963a2325e325e35065cea2778013e5f7a241bf4134",
  "83c486573c16e7cf20cd53b630d71530b85048d60a16b1d0f623f731d7688ad9",
  "be7e1b629b9d2d9819c7bf63e87529a70e6e6b961b5627e2295500c11f4645ba",
  "ea01b9ba944aa953483351d0eeeecbf2669c538f571c80258d743d7cd028196e",
  "bd95bd371a4a849d534b9f4afa29ab7e4786920a60d7519933218fe4370b961a",
  "a73eade1a694c9a1b49d6b0a407ec2351766ecb980711d1fdfae2ed0ae8534b9",
  "ff7a5ac66123ce64e48c979b05148286d572038c3dad728b8f70a0f0e24dd632",
  "219b520695f477bd4847cde0abc2455c9639f8e34bc60964a5b4e2b23fd4c80b",
  "f7c13448bb814bf049725ab2792a1b9e99ad2602a9819bf630575365276246f0",
  "dc6a0eadd9e3eec142c79ea99269e50870d544c12f1f9f325feaea0549e4cd32",
  "42d5408594f645d511b355ebadd73e7e16cce52fa4fe06ca9b100c9cd9c818bc",
  "faff07bd0af5740f52d0cb48bb3ab7dafbf5863c14788636b80c35aaa3d742a0",
  "647f772ae72ffa18e2562f48a4c56b9cc64c3976860713560a3d7a3fd4a6e23a",
  "5808fead3333ae470819c84d82b387eadd14c05bedb09e892db8dd888c53ddad",
  "3e137a8280568c91fda2baeec52d7e71c9005bfb81178bd073e29dfe28402178",
  "93f129c5506ead3255d688163b1c3f0206186b71ea2af55f1614212db8f25f66",
  "8ad85ca0aeff7b81cce2d8f51f24013313edc4b4a1de2ce70f4eee9239e5ba62",
  "4ba8b3e58c3637e99b58c3522afd1f969d786f4eec8ca5cf5a747ea4e25db4a8",
  "78bfe958795eaa224a088e3e7c7510f73ff953953c277d674db564db1ad515b6",
  "b78eeb05a06c597968b205a65fcb3405ebec8d30e1e7f8a0cb02e3cf6cd9e5e7",
  "871b66f51eb84fd030f3bcb0a00d4efea4872a2a521aa1dc097b58910a229c81",
  "7bcc1126e1915e1637d9bc64281297b6ec3bfcb3a8b274570139a1a2eca820ad",
  "7ce6ee492aedc6aaa352271251674e91b8ad667f14af818ce15e07ba7c86c17d",
  "73162da695aa79b6f12da40b7703c20ceb54ea1ff7ebdc2c988307801efd0069",
  "61f8e67f9c06453674526626e6471899e3eba2d810193e99eb978845b1c5fae4",
  "ad0889b7ff68ab79e86c5a3872e310b90f8913a2100d9ee9552c23d26d479065",
  "7dfddca772303309bea0c2b5b5398c9f213e398e421d8bdfc36180f041baf984",
  "422676639e3fae07444a7fee615e96d50359c046bde725760361e0ac1c4e8ea7",
  "5cbcc221198edbe5e9ba36f054067353a9dec7f4b56e4d8263e04d88692f49f8",
  "c0c5c9c70b7a8b8ca2e048f36b0fd0f52d7e9f8bd77e7e6974b95213fabc0dfc",
  "20883ef6c9572d294b31330d034faf90344f025427570f81968bc86547cb89c1",
  "1fab53c4f1c27ab9be2bfb6035eb5bc57dc2e0920faddfe0556dbe454cfd1a83",
  "e76c420f755fefbbc7f6fdb782b2f6b38b71e8443bbf8a8693c7921845c9fa16",
  "b43c1778c130e884b5685056995bbea256561b92f6e529b5b294840059707cad",
  "4b23d553c449cb4325efc88e79ca4c2c41be1e244fcb42c22630065349ae0535",
  "5388f537bb1a656585217a68143872b14bf9c47ecdb8a9ae3eb67b2268ec7c06",
  "c51b8417875071bdb8226e1f30983a5dc15074c8c5f6d2c7175bf29c9c794fa9",
  "a3aa1318af1869a26080e2265c4e10197c3c482fed32880d641faa2aca247131",
  "c23123e36c30b7daa12420912a515d5b18a60031632f2e0d532a5afde9176652",
  "306df40117987402ffe8085cb8b7d39fdf77f1edc732293f69f65e4ae0740066",
  "0abc833766848ddd065c60c6c51f0f530f342c31e5b459871fd469a0f8ae7802",
  "ef2ba3781f5e02f4fab4ba2aa652017adfa05ef581cf88e11de0ded328e16e1a",
  "a784a6b96b1d9a7fa612b795e37d39cd12103a8f4546641c02aa3e206cd87dc3",
  "6aebba47146d0bf3d78edcd9133b222c385cb55154344fc2746e5c07d6361ab8",
  "90a0fc42eee69368b365aa14547bb862480330ac4ffc8c0dc3d1d9ad22e195db",
  "dde269bd46a6ec8ff8ae9104fff341c6cbb95b7e18dab2be933b16d4044efde6",
  "7c300f5b63fcb1971ef996fe009ddcc859b850efe2c00d80dff1e9120342798a",
  "93611e11ba32c54b52d429a7ab18f4b5164b889a8030ea9f404f27632993cb32",
  "e1a9c1d69ec8f2a5936b2913771a6f9897f166191c9fa4882136a338747a0473",
  "2b5285ef7104ba146f16296b401ec61885ea2a7957dcb233198cd686bc4b9a4e",
  "fbcefbe6639bc9ce580d836b168d43bdef832fd60a32fa0d43bdb2a98c7fd602",
  "c4ded9c07faaeb6b93cea66a761a9496e8f58a70c48f1af9836caad809763692",
  "38250ec5d3e9ab1b3f68486cb2db21e3dfea8e77eda6c7cf2183e8a508b1848e",
  "c855fb7472eeebcde8cdf2c541e8ed7afaa4051ea183d4a7ba5155a03aa04c47",
  "bdc8c9d9f30562822c71570cd22e753a389303df42d887a7e00bcf1f7eb3b9f0",
  "b71f20ecb026d7580af977bd37eec72095826c8ec4f2026ecdd03a87ec8d887e",
  "68147835342eaa2986e38f31d520d4d73c1df6a21ed6ced5d220f00648752127",
  "206ecad7f9c806ab2dd02ea2d9b4c0d5cf847263cd6477918508cd8ca162d92b",
  "05323c39252ccdcccb13be7111a1cd49bccc8ab79b2ea31d3d483739ef12bbea",
  "c53314ee66ee752ff5339dc83efdd5e7ef4545364edb166cf54a278634916755",
  "9defb947e11be62ef2b63b40fab61f1d16574b03ab0a0e5e3b20f568974197b7",
  "cd97d52a896313e7de43d94909e21422035470f0dd35d87ea6cd684f2abd16e5",
  "b38d4db66fe1751886b4711db23c69086b70bc2e34724a012c1b61bad687810b",
  "57b5d666091c139a8c69808c52178794ca2d5a5c6db47968935fc77394ca0a20",
  "73471858de1b63c306449be531b8a88cf93eb92491562efdbccae8c591acea6a",
  "ae529a0cf8c3f0eeabefebe2fa8d6c0e689ee3b102de9eaff85e2cab43f72c9b",
  "dab4b703b4c713b4f77669ce7c7aed90d44f2e19d97bed82999069b86547d790",
  "0753b93b1176e9b1318f113a394222b09436ed7c94c7fdf833940f8dd01bd830",
  "93374b6700a8ae2c68f37783cd7c1d81ae1b9f367a0d90c43f8c50524695d433",
  "a050608462a885a5e08f7ccc4906b80416db3b960326ee93855a9a98ea9d86f8",
  "0ca5618bc880e592c76b5b2a1595aaaab2ba0b91b1b29ec7a44caae874618adc",
  "92f996c008054715a53d1b6a921f12bb55ada46a34116b944c22ee508118ed79",
  "7f0c19886153cb7b38f9c7ffdb575e819286baea02441015789da916e8238e0e",
  "aa16b7d8225f35f3d4a5c83f0e8080f27e89f77c3dcac55bb7d54636d569cb85",
  "660aa0a2a6130064f3f9be29c2bc63b8c88cc6c85000e60ab47fc002755a6d23",
  "a80b79f2e112f577cce01d823c25eac358625707062f1304e967d0497c5b200e",
  "f9f8056dafb7e4987bc0aa01786d1dbc88a195ac046d26322b57d294f4f63f3f",
  "70239efbed44f7a773aa04ae3d07247f81f9a42d7c3212af4e56d63bfa8ce705",
  "a00f3e31884e0a2423971192b8c3bf5d88d6be68d5ffbd51b08f6fa414844d42",
  "607ea250d95886ca840500748ec3ee6c1aef42ceb99185a0f4ba317d0715b2f9",
  "b971f72a61d98c5b29f3274a688caffb5c79e030685e50e9795f73c3859a2ec6",
  "065d81103b045b093ac1290a65dd198cd82d295c97e62e260e38908288d954fd",
  "0c2fa5ad5b70e09eacbad0f4f367e37d366845abb1f5d8f5b791960e1d295c12",
  "f27e91c0fbb7eff5a68ee70e158f9e069b974cd0e55b5f239748178390a53869",
  "d90e7bbb422f3388f347ed05e1ab5ad528ef2aa1f5943a22de2a7a81e7cfc89c",
  "cb0e8e7703e13a43250eb757be41a94df19d4eec9f12c9972aadde8c29cbfb93",
  "83cf33ae841b74437de4a30a852833da6c4ee249259a14a904ba4b07049596b7",
  "c31d2813a6374a5a96a509a88859d7cdc43d59280a8ac28002320a5ac634cdf9",
  "a37738474a25dd67b3547fcdf7bdb565df5751ee030040ffbbf6c43b19bb2faa",
  "98d7a0643f0578f2192ed629170d62bd8745286c76032cdc1ff5ab2593a9ab1e",
  "b06c4f9074169750c1df99a29e90a545c236457a37692e99e3d0e8c933fbbcf2",
  "5a3176def6e3b21a3e4ef7c52dc347f821f0eb8dd8e93a5992d4e1a94d2946ad",
  "865ea097d145f82d87534c79bc41542fa59162cb1d4fa4184424ce78f9828ad9",
  "5696ea73de9934089a95c54ecd78745e2acbc5a9b1d73dd8117496bc6f44ada0",
  "84de1a7d524e198127a3623e30a2270f135502cdf2c0c6de51fc2e328e66e2c4",
  "43fcc1c8fa05018bfb663504442afe546063e8550654542149344fde47862ffb",
  "253ef052678d67ad792b5854905600e6dcd72b380f08111fff0b5af43128b926",
  "9354bab93afbd9476d819efb2610d9ffa5e7b5d3fbd37a1c9f232c74f72b1f58",
  "78c60f07274f1230011a9db2080e1cc837fe6770516969e0f6f352e75336dcc8",
  "d92cb8222885004b3df7ab368f84dd2cd45c7c5a188f0a7326bc1c19b295b8fc",
  "c5071e469a0cc9f36982ad184c9e9e51ef0f546066c39565e86924108fd5a3fb",
  "dd59e94da1801f0c80c2622ba37cbdc7a85c5b24c3a15a7edd5ae9f024cc43e4",
  "dc9a728780ed92e49370712d90901e793081ffa34415bd299a9076abe5f7f5cc",
  "deda9f074600ce8296c2bded3dabb19267fd2259cd4df3b9bcdcfb4f9dac5a64",
  "d84872e61885cb8209153778a6d59ebaa01752b2665196463126ee2cd7bfd8e4",
  "a7422223466e9fca1db5937c1fdd77aee562886a57901f910468d971a7fa346a",
  "10242b3705927a90298c08803321572b27518738cf2c5c3a3bf5d0a191c206fb",
  "4a124e3a370700ffcf1581b1300d3529be6b2ded627d97f0c512fc98e1b51277",
  "2181a89a9ea31ca3052b9a31cafedb94a78a5d5d1662b9fddcfd80f7074691a5",
  "492e1cd15b3e5dba3161a8be4016d8a2a1b33ebaa0acb4b5c41d22f238b5cc5b",
  "25fe383801ccdbe3f0a8fc0d3de8c1eac15b51e35e81306e4d683ee4b661ad22",
  "c4b427081d57409365d6e71b7fd5dd2d46f2b8a71b00ccc90259c29d219cb490",
  "c6aa54d78f2f5074c6707c27a19b2746490b9da2c3eac42634d4681b32c6e477",
  "4110dae6e41d51f144773f9f80c7f4376d58c63b46c223725d56ead1c748aad5",
  "19c2633fd0bd9cc73c6235b31e6e35459ccada800f6d48500a2b1ae3c606ea2f",
  "f386193af663890f62df68851c006463a6541db6559e13c02cb094325ff98382",
  "2976ddcd78c16aa7e2d0324cc883cfefbb19e915ef948a3c62b5902a7978ad5a",
  "9090548f2acb1315495b9e458c31c28110cbb492a81da7eb5e7fb2e5a29b5300",
  "7a1606e55a818c0d0a83f9466dfdbe1062b8bdb8c5638b4672c7499a5ce3830d",
  "34e800e29787141334e0f2f1932dbb715c367f332bc479d5daf31287c3a75d95",
  "ca8e0836a2657d8bd427855a3d2e64e79f664fb80b4084947e5fa5133f68db92",
  "adec16245fe93af2efeb6de9b16de7defe03ab04b8fb614aef4c2031224b0770",
  "f46856f22f256e703b1382a9c3c8f898eb6a33465c60789f793c76a7d2077bf7",
  "cc5166066e578bc64376a568856d67119909fd0d33d4f456a76b2b5c18ac1a38",
  "88b4a68d3938fd878d12420bb4da3bc1b62781393968c796b8e1d681bbd8d8ca",
  "a1a029beb06b6f2ac5e83a183fe982cdd5caf17b93129d8f0e22907308b5a77f",
  "af14ff9f677c10b65f664edb6f0aa0e2a8271bf12f4592c556d5709d169ac3e5",
  "1c54ed1e4cc8ba449112a85205d4ea59409e0333de69fa987c34084122deb010",
  "3936d5818483a7123ee72143664426b7f00e39930db45a16e203b04133af0ec2",
  "4517474722d1035a9d7595db207a211685255aa3c209d3dcd76281ba7a155959",
  "1ee45ac41c5dfd9f1f9e475e14d440bed39db07f839a20b281a31775d8dad868",
  "d25893913860e1702c6c0acaf365cd8aacc1eea331f33ef9985507ece87097ff",
  "d62a8a7ee3a8357f2d4396c8ab3f93dab7ac5bd2a09aacc65418b5bda92a08da",
  "faefb043bafc98ccb4775947e22350b48491961d109f275360a217774048fe87",
  "cd18d6d34d72a2d4a30f65b0d2540c5a4139fdd694679b76055e9c65cf0a24a6",
  "ea76fd2c9eaf553f00358fee8fea3076c04d97085bfb5371dd546ae4d5fbf80a",
  "e41d533f4423e584178479bc99fdbe902095027545da177772a840756174cc8c",
  "8ddf3a18d0ab8f1793a17a553b73894cf7e7de66043578ab051150b9e7f92c85",
  "2ddb34a6b6fcd76611d532e9742944fec64d12ac6a642876cd4e4dbf68dc5c79",
  "70b8bf7da9455c3fef4bd02dece83a2135fc0ee72205af5225c87e0f4affb6f1",
  "d691812d8fa6f87be3f6b979df19bf1905c338942d20118d50a09f8b56d5d341",
  "c908ef6c39bc02ba77295409bbc3d7b97158af245df1dd63e67618014b8c594a",
  "23a44cb82b6491e5e6327d0288ba9f8781757bbe5234ca615268170d3face171",
  "73a55953e06ac13e1dfe6ee6b19f5d4d19821a8207e2641aa1def4b2f72bc932",
  "43ac2fcb187ee144f02c78bb6124eb0bb7d1178c842a7d84c077a6cdb070d7de",
  "5f134c2d8dabb2ef1c35b08127ee7f58d1f55ae74eb09198f6f39024f9fda032",
  "4310f3771560bc5b6c1f842bc6192894f1667479ef2eb5697ef41e438b92d9dd",
  "02a35d2571261a488b264a3fa48b736c8e8fa8e76ec5d199b5eab815dc72012d",
  "2254e80c24116de97515c6703fdcc2be1032b03b06d0cf7c907f722b9dc2e66e",
  "4a00255b34f08e7143f9bed1503cf3075ec8b02455d3fa7072015035ba8cc442",
  "274b2c419c66c81d9d301938ebc7ab140f64f68794a22ec0c97db343d88b24ed",
  "86c3b682dab4505522889afd1089e4a9c4c78e8e1c900e3c81bd9c5cd46d305b",
  "fcbc6a5eccc83e9bf4c5a44ea3f3a504d3e3de28d85400a1fd7afcc611f8f5bb",
  "32f35e5c2cd7a3ba712b7e3c536c1c1340142252058d60916d34b79d2b99bef2",
  "686e6646a0c475b6b33116cf8843134b7118068b03082e66cd8b4c30c4ed1e0e",
  "4fedc5966c01de9a5dfa8a942e199fddb391e29b6fedd1fa451352b6d72545ec",
  "658515d6c646f7bc52243a99f2dca38fb0e97877173e9151cdfdbcc6972ab2aa",
  "11e7d19abd21687b9bf96c275ef0962fcf537028f8dd016aa798c19b2cc47fa9",
  "cf65d7074b204165a60fb17f080db4a006ac2494c74f93526c41ce114fa48eeb",
  "ff75b6e979b897470f5b915cd47f792c8eb156b1ceb27a31d1702684f3dc2c9e",
  "0987bd977f41ed7a5058548264b9b687bddfbab50f5039f60b37aeb3e0963efd",
  "649695fa8efc555f2823858cc824bfa3eef4ba9d3fc46b0d678a01d1c66acdfb",
  "68586199495f190f7a58df8753ec919505aeb66fe4c06997e56b774ca2b504a4",
  "592f0798e538917cc8621521c4c9e263eb8a797a0988e27b9c884da1ff9e7c7f",
  "1aadaf55307cafcaa1eabe3564320baa4d55db38c71cfdddfc095299a260e92e",
  "612b60300c146f53255633d34c85a0ea365f528a235f7a911ae977ad97c7f415",
  "4ba5ced978e6a52e84d77d9195ec7bbc154e8ca20603f53b95ca2070a8e2c337",
  "7fda811ae65d25cf89ff6d75f89664cc19aa587d1d1c42640bef6a49f299d9da",
  "33aab97357e737c3167478430ec96bf622e743145967bab572eb33bdc39649a6",
  "591efe2f90f0679158536672586792d34d477c693e19c4caa0adf46511bc5910",
  "a9c818936560191cd678226220fec7d87b7bf4298e278cc940bb3ee505cd113b",
  "409cf7e14357ecd50ddec9e3ac106fae9d0a1f331706af2d1458f146a98ab9ac",
  "9470ea710200b4ded7b356cd0f5a2b8821bbede976bcdd3f32811b0ce8cd96b2",
  "656a970f19fa3187c05d0d4e214dd2b208eb55a82ad8b099f29c8cc20dfc8566",
  "dee9afb4b0e49a40880869fd3121616d97ab3cce4dfa8665c6031417d6046e69",
  "edd95f4fca1dd3968c6c0d2149b3c60ff90475622d7d12ae0d89b751b14765ce",
  "edf0f21e549cdb957818f7ac19fc9ee656d816cd43ad771ebd24379805a2db06",
  "cf7486ac344a70ca891de5a5821c4a68970a06e57c5b390a74f2b1a43d76b01c",
  "a6fe971047b4b7a19781334110f8b17df1661bccfd3040f18325a5b06a05c8d1",
  "ad28a7c78b428fedea9ae2d093d0e29fb2d1b2883bd403131061891757d62b6a",
  "916f4e8715d88670735ab6282f8aa82c4ca460765b84a13e946986eb47fb361f",
  "a0950afcd8fed50a95a63891b68f7d6bb0fa0e54bf232d7c6cf5bb04e7984bbb",
  "e7bb42227b0e9f64f6929e6edbb5888e5ac117e45c0ec939c096d403461dae03",
  "1d2291c0525a260eeca0c1edf43543f89cc21bbaf0b1c93167b3b6faf02385dc",
  "9be8978fc0edadccac835a86461fd3e8f28742a70579f87e87cc56d403f1e9fe",
  "134452bd260d725c78d8020ff79eb323d564f2361dd778327f310ce4ec5bac27",
  "734d835a3dbf603e99f42e2402ae7faf67d3d2fbf0e7388005eb1b473c5c5fda",
  "244770e5a8893c9683ef1218724f9936bc36d9e4e927c8e2d63ed7887e128775",
  "7e1fc426ccc6b511cb3893c76fe1362507725f1c1a11b764f12e3b533ceaeb7c",
  "21fbcabe32ce0a533af37819fcb75e0623868cec1d64cb5c490a58bd69315164",
  "60bb1d4e1e3e5c6c2403c7dd960d746ca88929ff1143861503b180b11059bce4",
  "fea3aa2644be42d9ba3f4d50edecea18b59bec72724f1673adb6b8e95f744e0c",
  "29342e70f809b83fb7982416d746daa6e6891d91e7612f7cb5b99c14d2abcd4f",
  "a6224337cf9aafbf0b43e2818b2fef6455666cbe9c8c27d2012ad126ab300cba",
  "cebac52c8d2661ce2e3121ebfdd5483b2dd92fc3ad44d73cc84bd10b56850017",
  "5b47921b8e7557c8a10965764d1f1ff2445d0c7e1a8190728870188177ada58a",
  "7dbbe6fd83385fffdfaf55dc47689ab9788e6c839bd2de6a9d369828d62ef534",
  "41d8b119917b3fc72bbe252e775bf8728583697690e158441c0b00c683926a23",
  "31f7e86121d51b9f318346c338c60b0526942c7e4c80bc93db6b62e57d934cf0",
  "acbb4e74d3bbf1165453ffd9118778ed0967494a3edce3dd983588e2bfafe8fc",
  "9caa030cc2fd84d2fce4c65b4b2ce8c03274102b3a4ff0d20ce3620d698711ef",
  "1733937d321158bdf25c91e0c8f9eed4ebc66f7962441824dd595a9b2b11b3cb",
  "76cd048c3ba33f3f3d6315c0d272e8fd8d3471b556584c9143fd8861f4fae4a8",
  "c60609876fa03d79fea292c91d095ebf8c7e0be9ad278c4ffea39621cc704f79",
  "a5e89717286a27fe80058cf76e5c946622c050cdc5b95dd860c42b51b246fca7",
  "08f06af35d07209f3fde89b03c901bce76a5be30e64ef2d1d83d45f75af61646",
  "72045d2939b0df80381edcdbba7e4fe8dabc53e710137f7ecc51c5a843e0a9b7",
  "9487065a752e60a2f333359a0f66591cf248f8f3c608e6cb8f206a16f27b0448",
  "323c700605c79e1daaec801527adba4cc763c54554baa0debeba0b287e0a0482",
  "34a1c4382a704d2291d46c01bc8c753c9a4e4097ecdd1f66db4af972d5c893d7",
  "25c20631346689e01875b70c39f739d13afe42966be52bdddfc5477e91e95253",
  "644b9b9e27f44e99a2d7ef7ed4601b829837072d3cfdc7669de1282c870828ed",
  "f21d452ed2669bfe3b0e42d17aefe1f26299be8079d465f69e9611e001790e3d",
  "6dc45cb6a8c7efa0e0ca843a2f757ff8825513d305863acb333093aae04b5ab3",
  "d5ded2ccb7dc5d559b3106f8d6fffbc3c56fe2f2094898a375ab3f1e7b0117ff",
  "dd3b30e66f0d3072c3d5a37a34084aca93e856859088e9ea853a77a4c590a55f",
  "7a7c4bb90bc539cf749877af7b224622ab7d4f8e966d737d4e8a94b6d8de0a7a",
  "f0959d8e4b4b97dd7e753de7a9a3bbfb8542819e3fe9bc6d0f6855a799a65091",
  "0a3a226dac498136bfb0966e96756aee5a1e05db56e3ed1f3d632b807e28170f",
  "76582fb0198191980fec4d87a802f5450a8cfe4f1d3669b61d098ddbfd1c6b60",
  "c0a1077832a981de5106af367c19a0f51dc9fe89cc49c715b588222bc7dfa86d",
  "8052da25e61e2761e48b2c19fe60c543650790d563aacacb0a059b22542a7159",
  "95bc5057b61e6c36eea4d964218b2aa03587c5396b89d0fab9c0cd873f989737",
  "f59a16aee23daabbe80a4c72ff9272b735e98c869fbe80c90e8b09a6632924d5",
  "cddf75dc69ca4c3bf8746d396f3112ae4e70f870adaf03f1b8c00bb27d627e17",
  "aa303e1039946250ab7b489cd7628a955ea5a76f194c82c5245c0308e85c03b2",
  "5be289081d62d5002b6774ec5b3bb61037f76e42b7f1ab8f1777d85fad757489",
  "8330bb3ccffcec31291ca566eceff1c7acba224c7595a19eaa7f196f4f6883db",
  "67310182c438b9aa12ea936d07e070dd7ef5b21068862a4d2aae1b008dbfc10c",
  "333efdbf09e1b399049ef46b18d11bd6af20e47fed8a5b0e8790321d13babcf4",
  "cdb69e3bf040eb464b4d3d188363b479011ad9d7c0e52c592b9400bf74559a66",
  "ec372d3942b3616cd6420cc8aed8db36e593767be1547d0ad5a5cb3acd1b0859",
  "902386cfd3ccae115420d4c39c86b3f21c79c341c71b22b3a77c8cb7b63db07a",
  "6bbebdac05b4301f51c841a3321416b7a2d597d11b30cfcc733285e8428eab19",
  "62ddfca6ecfef003c323ed453e01f45b3a822b0b8a41600c8518939900423ebd",
  "7d401a7e56997026d922f40edc3f84d5e35b685597396f55863574f175b11c76",
  "97d63a9e49e52ea667aff53fbb4808193becc58ec17050e3f053a9266121c335",
  "1420d9d1eab041f02011df8524770e8f2dd25851fa4422d14c44178531b30b1f",
  "31afbc9461cdccb17987102e683354bacef401a66ac851ccb6ffdf70cc8e84e6",
  "20eebf7dcaeb695dea42e3e9174dd2902825b39bd1bfcd10ad0c7df2e92ebc8a",
  "d55bc6d4d378f6c9ae5fbc55e84e254dcaffd2e3186bcd2cd03538f31e70891b",
  "92d5d3dc414926af9c135f3d349b84e7282264be8da772839dd19035c1e001ba",
  "9717cec9a02d4d1fdb01785764fb4f3d7203402738babb4ec9f1abe175185c50",
  "33cb23cd249b08dd30d7b5ab55ee79a27937a8fa0acb94a935eef853b30dadf9",
  "bc5700146342dc810defe18a7dd9986f1e64ba147918ef329a699ed966bbcd42",
  "e36711188cedc6648a1c080802855d3b94d18f932dd43365426f4651f621a730",
  "84e78e776f51d07b30f3ef7ea33dbb41bc5c0d5c57edae3fb081d154451fb880",
  "ef7d45ddad8b749b837580b2d9d67fe24af26b9e909c94b6417f0291ddf1a294",
  "94613153286cac66e42c66b0b86e99803f6243974ff7a1438a421fd2e8e1d629",
  "ecca5ef4491f798b263aa9c88533b0daa31198ef5d9009fd2bbf8338288b5c7d",
  "b0338aace85518eea6a3e48f7a0b1c27be6cd6b3a7df7409c7f3766e47ea31de",
  "ec081c1cc0243eb3afd836e0390e8bf86af1315c93dc931d36dbd3ea58ce1ddd",
  "512268b553908bcaa2b6716cda69e04e1dc2f3e9c181e71e68bf24be13b86468",
  "f5caed383d4e80e7c069b77bd3a4a30b4c9c00c0a7fd453fb5758e7065c80216",
  "277d1736284e1695baf40e83f94b45f05636a1448aa44e040928057c24ed885d",
  "286911d383f6c735c0bb189c50aafefbad856901a2b32ef337cf945810d70cac",
  "6d76862cc0eba1fe183992b87a7b4f7eeaa52adecbb5afea6c89c1a4048fa0c7",
  "d0025fd77d9be7ad73b6717d1abe464114b2bcc8ac3a72d0c7fcf5d84e3879ab",
  "e1ef36d743a7654d33d74f464fbdc5dc5342dd2bfdf262f83469588747081140",
  "f20bef2f14bf2125475905c10d6d4d9087543ae8aaca678172bf204b65c0d37e",
  "cdb45cd3f318e996a74f6006a21a7b8b8b9a0328496015496bd6b45168a5d74e",
  "55178e50c7b54911652bd175559666a48069dedee989fbf51abb96a0857722ed",
  "ff3f1d290965a87ab67a6bf911e01beeb36b776ea927030778dba478066af905",
  "b29124cccba034a866d0ffa8adeabf816b3f7e38618814f166eaddc0c86b1d49",
  "eb2c1e6e576a75ec5739b14c04a0307018443513d4f512bf36ae599a909feefe",
  "668ee7984c163c0e73d321dbb71e5b53a3d1cecba89f88bfad158e1bd5dbe3a9",
  "cdb24434adb2a47aff59c477f346334e8a02e2721e5511d598a3c4818bb004ef",
  "46c2b4aebb33ba000421b0d40239b4309cfef99d1e4af1779b431ef7b96224c9",
  "406c69d223ec7b48b0762dd18d76d871ad5cde86cd075b7e7160d13885b8de72",
  "7d9cb90d4a4fdd8a0f59f4d4aa97bdf8360feb786ea9e55896a2f135e15f3e87",
  "58c027a62eaf4f600862dc860bac3f1c87b3c278a9c6d2d8a006099d1caeadeb",
  "fcc3c8104e059f02b868b552fb077ac6fc934def50dfac89e3f36954afe87d0c",
  "6db711f9d61f7faa51f7e601b804335156a410082cd009542c757dd03a27e324",
  "5016b097314e1eb03e831485e1d8774a8e968bfa70f297d549db7cd75169354c",
  "9a3fd12f918e31854cc6b8855a082b1bcd18df6f4888e721b2e0845b2589bbda",
  "6a5cfe8f2013b49a9653276bc1bf2fc2c3cf89c3b35d42bf0e23b1045bff2ca6",
  "87b4e09a5c7f321ee524cc29d4436bc2f3f670c1ab709ce6e75eeaafeecb6d03",
  "daa921184a8766bb16bb662c0a91a0aa793698df8000d02913764e28318fd97e",
];
async function sha256Hex(txt){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function renderAccessGate(errorMsg){
  const app = document.getElementById("app");
  if(!app) return;
  app.innerHTML = `<div class="hero hero-home" style="min-height:100vh;">
    <div class="hero-badge">ACESSO RESTRITO · BETA</div>
    <h1 class="hero-title" style="font-size:clamp(30px,7vw,58px);">THE MANAGER</h1>
    <p class="hero-sub">Esse jogo está em fase de testes. Digite seu código de acesso para jogar.</p>
    <div class="panel mt24" style="max-width:340px;width:100%;text-align:left;">
      <label class="tiny faint uc" style="display:block;margin-bottom:4px;">Código de acesso</label>
      <input id="gateCode" class="input-inline" style="width:100%;text-transform:uppercase;letter-spacing:.08em;" placeholder="BETA-XXXX-XXXX" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false"/>
      ${errorMsg ? `<p class="red small mt8">${esc(errorMsg)}</p>` : ""}
      <button class="btn btn-gold btn-block mt16" onclick="window.__tryAccessLogin__()">Entrar</button>
    </div>
  </div>`;
  const codeEl = document.getElementById("gateCode");
  if(codeEl){ codeEl.addEventListener("keydown", e=>{ if(e.key==="Enter") window.__tryAccessLogin__(); }); codeEl.focus(); }
}
window.__tryAccessLogin__ = async function(){
  // tolerant to phone keyboards: smart dashes, spaces, lower case, zero-width characters, a missing hyphen
  let raw = ((document.getElementById("gateCode")||{}).value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if(raw.length===12 && raw.indexOf("BETA")===0) raw = raw.slice(0,4)+"-"+raw.slice(4,8)+"-"+raw.slice(8);
  let ok = false;
  let hash = "";
  try { hash = await sha256Hex(raw); ok = ACCESS_CODE_HASHES.includes(hash) || hash===VIP_RENATO_HASH; } catch(e){ ok = false; }
  window.__VIP_RENATO__ = ok && hash===VIP_RENATO_HASH;
  if(ok){ await boot(); if(window.__VIP_RENATO__) showVipWelcome(); } else { renderAccessGate("Código inválido."); }
};

// ============================================================
// BOOT
// ============================================================
async function boot(){
  await initApp();
  window.ST = ST;
}
// the login is never remembered — every fresh visit or reload starts back at the gate.
function startBoot(){
  renderAccessGate();
}
if(typeof document !== "undefined"){
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", startBoot);
  else startBoot();
}

window.__APP_INTERNALS__ = { startNewBrasaSeason, autoFillLineup, ensureDivisions, selectNewJob, buildBrasaJobOffers, otherLeagueTable, brasaSortedStandings, wcActive, wcPlanFor, wcPoolIndex, beginWorldCup, wcAdvanceDay, wcNextEvent, wcUserMatchIn, wcOpenCallup, wcCallupConfirm, maybeNationalOffers, acceptNationalJob, wcPerformanceScore, wcBuildSquad, wcStrengthOf, finishWorldCup, renderWorldCupTab, renderWcCallup, renderWcEnd, renderHub, renderWcBanner, inboxList, startBrasileiraoCareer, submitBuyProposal, buyContext, buyNegSession, negotiateOffer, queueOfferMail, findMail, runOfferNegotiation, offerNegCeiling, newCareerState, startCareer, advanceTournament, render, tierOf, buildJobOffers, teamAvgOvr, globalMarketAskingPrice, isKeyMarketPlayer, dailyTransferTick, runEuropeanPoaching, runSingleAISigning, runSingleGlobalReshuffle, nextSeed, E, get ST(){return ST;}, set ST(v){ST=v;} };

