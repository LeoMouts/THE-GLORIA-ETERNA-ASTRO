// ============================================================
// LIBERTADORES MANAGER — APP (state, storage, screens)
// ============================================================
import * as E from "./engine";
import { GAME_DATA as DATA } from "./teams";
import { GLOBAL_MARKET as GLOBAL_MARKET_SRC } from "./market";
import { PRELIB_DATA } from "./prelib";

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
};
let _globalCrestSeq = 0;
function clubCrestImg(clubName, size, playerName){
  size = size || 22;
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
const TRAINING_ICON = "/images/training-icon.png"; // dumbbell + shaker + cone illustration
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
    {title:"Bem-vindo!", text:`${ST.managerName} assume o comando do ${championName} para a campanha de ${ST.seasonYear} da CONMEBOL Libertadores.`},
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
const PRECOMMIT_STAGES = new Set(["team_select","manager_name","mode_select","prelib_select","prelib_manager_name"]);
async function initApp(){
  const loaded = await loadState();
  if(loaded && loaded.schemaVersion===SCHEMA_VERSION){
    ST = loaded;
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
  if(ST.stage==="group_draw" && (ST.drawRevealed||0)<32){
    startGroupDrawAnimation();
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
  ST.careerStats = {goals:{}, assists:{}, signings:[]};
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
  return {group:"Fase de Grupos", r16:"Oitavas de Final", qf:"Quartas de Final", sf:"Semifinal", final:"Final",
    prelib_qf:"Pré-Libertadores — Quartas de Final", prelib_sf:"Pré-Libertadores — Semifinal", prelib_final:"Pré-Libertadores — Final"}[type] || type;
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
  const key = nm.home+"-"+nm.away+"-"+ST.seasonYear+"-"+(ST.competition&&ST.competition.phase)+"-"+(ST.prelib?ST.prelib.phase:"");
  if(ST.scoutedFixtureKey===key) return;
  ST.scoutedFixtureKey = key;
  const oppName = nm.home===ST.teamId ? nm.away : nm.home;
  const opp = ST.world.teams[oppName];
  if(!opp) return;
  const rng = E.makeRNG(nextSeed());
  const best = opp.players.slice().sort((a,b)=>b.ovr-a.ovr)[0];
  const topScorer = Object.values(ST.competition.scorers||{}).filter(s=>s.team===oppName).sort((a,b)=>b.goals-a.goals)[0];
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
// the negotiation "risk gauge" — every counter this club fields raises, in clean visible
// steps, the odds it just walks away from the table entirely: ~20% after the 1st push,
// ~35% after the 2nd, climbing toward the 70-80% danger zone by the 4th-5th. A greedy ask
// (well above market value) tacks on a bit more on top of that; a modest one, a bit less —
// so restraint is still rewarded, but the round count alone already tells most of the story.
function computeNegotiationRisk(pl, asked){
  const posture = offerPosture(pl);
  const valueRatio = asked/pl.value;
  const aggressiveness = Math.max(0, valueRatio-1.3)*12;
  return E.clamp(Math.round((5 + pl.round*15 + aggressiveness)*posture.angerMult), 3, 90);
}
function initialNegotiationRisk(posture){ return Math.round(5*posture.angerMult); }
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
    payload:{ playerId, playerName, club, category, value, offer, round:0, status:"pending", comebackCount:0, posture: posturePick, riskPercent: initialNegotiationRisk(postureObj) },
  });
}
const OFFER_RAISE_LINES = [
  "Certo, aceitamos subir a proposta.",
  "Conversamos com a diretoria e topamos esse valor.",
  "Fechado — vamos até esse valor.",
  "Está um pouco acima do que queríamos, mas aceitamos.",
];
const OFFER_HOLD_LINES = [
  "Esse é o nosso limite por enquanto.",
  "Não temos como subir mais que isso agora.",
  "Vamos manter a proposta como está.",
  "Precisamos pensar — por ora, mantemos o valor oferecido.",
];
const OFFER_WITHDRAW_LINES = [
  "Isso está muito acima do que consideramos razoável. Vamos retirar a proposta.",
  "Achamos que o pedido ficou exagerado. Desistimos, por ora.",
  "Não vamos continuar essa negociação nesses termos.",
  "A diretoria decidiu encerrar as conversas por aqui.",
];
const OFFER_COMEBACK_LINES = [
  "Reconsideramos e voltamos com uma proposta melhor.",
  "Depois da sua recusa, a diretoria autorizou um valor maior.",
  "Ainda temos interesse — aqui vai uma nova oferta.",
];
const OFFER_THINK_LINES = [
  "Precisamos de alguns dias para levar isso à diretoria.",
  "Vamos conversar internamente e te respondemos em breve.",
  "Deixa a gente pensar com calma sobre esse valor.",
  "Repassamos ao departamento financeiro — aguarde nossa resposta.",
];
const OFFER_COUNTER_LINES = [
  "Pensamos bastante e chegamos a um novo valor.",
  "Depois de avaliar com calma, essa é a nossa contraproposta.",
  "Não é bem o que você pediu, mas é o que conseguimos oferecer agora.",
];
// a subject only ever gets one "RE: " on it, even through a long back-and-forth thread.
function reSubject(subject){ return subject.indexOf("RE: ")===0 ? subject : "RE: "+subject; }
// the range the manager is allowed to type into the "pedir outro valor" box — can't ask for
// less than what's already on the table (that's what Aceitar is for), and capped well above
// market value so an absurd ask is possible but not infinite.
function offerAskRange(pl){
  const minAsk = Math.round(pl.offer*1.05/5000)*5000;
  const maxAsk = Math.max(minAsk+5000, Math.round(pl.value*3/5000)*5000);
  return { minAsk, maxAsk };
}
// the manager types in the exact value they want to ask for (clamped to offerAskRange). The
// risk gauge (computeNegotiationRisk) is the ONLY thing that can blow the deal up — once it
// survives that roll, the club always genuinely moves the conversation forward: either it
// needs a few days to think it over (see tickPendingOfferReplies), or it responds right now
// with a real concession (the full ask, or a real chunk of the way there — never just a flat
// "take it exactly or nothing") or, more rarely, holds the line for this round.
function negotiateOffer(mailId, askedAmountRaw){
  const mail = findMail(mailId);
  if(!mail || mail.type!=="offer" || mail.payload.status!=="pending") return;
  const pl = mail.payload;
  const rng = E.makeRNG(nextSeed());
  const {minAsk, maxAsk} = offerAskRange(pl);
  const asked = Math.round(E.clamp(Number(askedAmountRaw)||minAsk, minAsk, maxAsk)/5000)*5000;
  pl.round++;
  pl.riskPercent = computeNegotiationRisk(pl, asked);
  if(!mail.thread) mail.thread = [];
  if(rng()*100 < pl.riskPercent){
    pl.status = "withdrawn";
    mail.thread.push(OFFER_WITHDRAW_LINES[Math.floor(rng()*OFFER_WITHDRAW_LINES.length)]);
    scheduleSave();
    return;
  }
  const posture = offerPosture(pl);
  if(rng() < 0.3){
    pl.status = "awaiting_reply";
    pl.pendingAsk = asked;
    pl.pendingReplyDays = 1 + Math.floor(rng()*3);
    mail.thread.push(OFFER_THINK_LINES[Math.floor(rng()*OFFER_THINK_LINES.length)]);
  } else {
    const meetChance = E.clamp(0.55*posture.acceptMult, 0.15, 0.85);
    if(rng() < meetChance){
      // a real concession — usually most of the way to the ask, sometimes all of it — instead
      // of the old all-or-nothing jump straight to the exact number typed in.
      const concessionFrac = 0.55 + rng()*0.45;
      pl.offer = concessionFrac > 0.92 ? asked : Math.round((pl.offer + (asked-pl.offer)*concessionFrac)/5000)*5000;
      mail.thread.push(OFFER_RAISE_LINES[Math.floor(rng()*OFFER_RAISE_LINES.length)]);
    } else {
      mail.thread.push(OFFER_HOLD_LINES[Math.floor(rng()*OFFER_HOLD_LINES.length)]);
    }
  }
  scheduleSave();
}
// resolves every negotiation the club asked "a few days to think about" once its countdown
// reaches zero — a brand-new "RE: <assunto original>" mail arrives with the actual verdict,
// same as a real e-mail reply thread, instead of the answer just appearing silently. Reuses
// the exact risk percentage that was already locked in (and shown on the gauge) the moment
// the ask was made, rather than rerolling it.
function tickPendingOfferReplies(){
  const rng = E.makeRNG(nextSeed());
  inboxList().filter(m=>m.type==="offer" && m.payload.status==="awaiting_reply").forEach(mail=>{
    const pl = mail.payload;
    const posture = offerPosture(pl);
    pl.pendingReplyDays = (pl.pendingReplyDays==null?1:pl.pendingReplyDays)-1;
    if(pl.pendingReplyDays>0) return;
    const asked = pl.pendingAsk||pl.offer;
    const risk = pl.riskPercent!=null ? pl.riskPercent : computeNegotiationRisk(pl, asked);
    let newOffer = pl.offer, status = "pending", verdictLine;
    if(rng()*100 < risk){
      status = "withdrawn";
      verdictLine = OFFER_WITHDRAW_LINES[Math.floor(rng()*OFFER_WITHDRAW_LINES.length)];
    } else {
      const meetChance = E.clamp(0.6*posture.acceptMult, 0.2, 0.9);
      if(rng() < meetChance){
        const concessionFrac = 0.6 + rng()*0.4;
        newOffer = Math.round((pl.offer + (asked-pl.offer)*concessionFrac)/5000)*5000;
        verdictLine = OFFER_RAISE_LINES[Math.floor(rng()*OFFER_RAISE_LINES.length)];
      } else {
        newOffer = Math.round((pl.offer+asked)/2/5000)*5000; // still a real step, just a smaller one
        verdictLine = OFFER_COUNTER_LINES[Math.floor(rng()*OFFER_COUNTER_LINES.length)];
      }
    }
    pl.status = "answered"; // this mail is now historical — the reply below carries the live thread
    addMail({
      type:"offer",
      subject: reSubject(mail.subject),
      from: pl.club,
      preview: status==="withdrawn" ? `A negociação por ${pl.playerName} não avançou.` : `Nova posição sobre ${pl.playerName}: ${fmtMoney(newOffer)}.`,
      thread:[verdictLine],
      payload:{ playerId:pl.playerId, playerName:pl.playerName, club:pl.club, category:pl.category, value:pl.value, offer:newOffer, round:pl.round, status, comebackCount:pl.comebackCount||0, posture:pl.posture, riskPercent: initialNegotiationRisk(posture) },
    });
  });
}
function acceptMailOffer(mailId){
  const mail = findMail(mailId);
  if(!mail || mail.type!=="offer" || mail.payload.status!=="pending") return;
  const pl = mail.payload;
  const t = myTeam();
  if(!t.players.some(p=>p.id===pl.playerId)){ pl.status="void"; scheduleSave(); return; }
  t.players = t.players.filter(p=>p.id!==pl.playerId);
  ST.lineup = ST.lineup.map(id=> id===pl.playerId ? null : id);
  ST.budget += pl.offer;
  pl.status = "accepted";
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
    if(!myTeam().players.some(p=>p.id===pl.playerId)) continue; // sold/gone since
    const newOffer = Math.round(pl.offer*(1.12+rng()*0.18)/5000)*5000;
    pl.status = "superseded";
    addMail({
      type:"offer",
      subject: reSubject(mail.subject),
      from: pl.club,
      preview:`Nova proposta por ${pl.playerName}: ${fmtMoney(newOffer)}.`,
      thread:[OFFER_COMEBACK_LINES[Math.floor(rng()*OFFER_COMEBACK_LINES.length)]],
      payload:{ playerId:pl.playerId, playerName:pl.playerName, club:pl.club, category:pl.category, value:pl.value, offer:newOffer, round:0, status:"pending", comebackCount:(pl.comebackCount||0)+1, posture:pl.posture, riskPercent: initialNegotiationRisk(offerPosture(pl)) },
    });
    break; // at most one comeback mail per day, keeps the inbox from flooding
  }
}
// runs once per "AVANÇAR DIA" click — everything that can land in the inbox on a given day.
function generateDailyMail(){
  maybeGenerateScoutMail();
  tickPendingOfferReplies();
  maybeIncomingOffer(0.14);
  maybeGenerateOfferComeback();
  maybeGenerateTrainingInjury();
  tickScoutReport();
  tickObservations();
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
    const youthBonus = p.age<=21 ? 4 : p.age<=25 ? 1 : 0;
    const gain = 8 + rng()*14 + youthBonus;
    p.trainProgress = (p.trainProgress||0) + gain;
    let leveledUp = false;
    while(p.trainProgress>=100 && p.ovr<p.pot){
      p.trainProgress -= 100;
      p.ovr = Math.min(p.pot, p.ovr+1);
      leveled.push(p.name);
      leveledUp = true;
    }
    if(p.ovr>=p.pot) p.trainProgress = 0;
    result[p.id] = {gain: Math.round(gain), leveledUp};
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
function applyDetailedResultToWorld(homeTeamName, awayTeamName, homeLineup, awayLineup, result){
  const allP = homeLineup.filter(Boolean).concat(awayLineup.filter(Boolean));
  allP.forEach(p=>{
    const rating = result.ratings[p.id];
    if(rating!=null) p.form = Math.round((rating-6.5)*10)/10;
  });
  const userIsHome = homeTeamName===ST.teamId;
  const userIsAway = awayTeamName===ST.teamId;
  const myLineup = userIsHome ? homeLineup : awayLineup;
  const mySide = userIsHome ? "home" : "away";
  const clubSeason = (userIsHome || userIsAway) ? ensureClubSeason() : null;
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
      addScorerGoal(scoringTeam, p.id);
      if(scoringTeam===ST.teamId){
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
    if(teamName===ST.teamId) return lineupPlayers().filter(Boolean);
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
  applyDetailedResultToWorld(home, away, homeXI.lineup, awayXI.lineup, result);
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
    if(shooter) addScorerGoal(atkTeamName, shooter.id);
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
function advanceWithSpeed(speed){
  advanceTournament();
  if(ST.stage==="match" && ST.pendingMatch && !ST.pendingMatch.result){
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
}

function finishPendingMatch(){
  const pm = ST.pendingMatch;
  if(!pm) return; // guards against a stray double-invocation finding nothing left to finish
  generatePostMatchMail(pm); // injury recap for the user's own squad, if anyone got hurt
  ST.calendarDaysLeft = null; // the next fixture gets its own fresh 3-4 day countdown
  ST.matchesPlayedTotal = (ST.matchesPlayedTotal||0)+1; // gates the scout-report cooldown
  const ctx = pm.context;
  ST.pendingMatch = null;
  if(String(ctx.type).indexOf("prelib_")===0){
    finishPrelibMatch(ctx.tieId);
    return;
  }
  ST.stage = "hub";
  ST.hubTab = "competicao";
  if(ctx.type==="group"){
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
function ageWorld(){
  const rng = E.makeRNG(nextSeed());
  Object.values(ST.world.teams).forEach(team=>{
    const isUserTeam = team.name===ST.teamId;
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
      if(!isUserTeam) passiveDevelopmentBump(p, rng);
      p.injured=false; p.suspended=false; p.injuredMatches=0; p.suspendedMatches=0; p.form=0;
      newPlayers.push(p);
    });
    team.players = newPlayers;
  });
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
  runGlobalClubReshuffle(rng);
  // a proper "summer window" wave of Libertadores prospects leaving for Europe, on top of
  // whatever already trickled in day by day during the season via dailyTransferTick().
  const jewelSales = 2 + Math.floor(rng()*3); // 2-4 per season
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
  ST.transferFeed.push(Object.assign({}, entry, {year: ST.seasonYear}));
  if(ST.transferFeed.length>300) ST.transferFeed = ST.transferFeed.slice(-300);
}
// the core CONMEBOL recruitment pass: each AI club checks its starting XI slot by slot, and where
// its best option falls under what a club of its tier should field, tries to fix it — first by
// shopping the global market pool (weighted toward nationality fit and a realistic price band),
// then, failing that, by poaching a genuine surplus player from a lower-tier AI club (never the
// user). Every signing removes the player from wherever they came from, same as a real transfer.
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
      const globalCands = eligibleGlobalCandidates(world, pos, tier);
      if(globalCands.length){
        const picked = pickWeighted(rng, globalCands, p=>{
          let s = 10;
          if((SA_NEIGHBORS[team.country]||[]).includes(p.nat)) s += 25; // regional scouting bias
          s += Math.max(0, 20 - Math.abs(p.ovr-need)); // realistic fit over wild overkill
          return s;
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

      const fee = isGlobal ? globalMarketAskingPrice(signed) : askingPrice(signed, world.teams[fromClub]);
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
    let dest = clubNames[Math.floor(rng()*clubNames.length)];
    let guard = 0;
    while(dest===p.club && guard<5){ dest = clubNames[Math.floor(rng()*clubNames.length)]; guard++; }
    if(dest===p.club) continue;
    const fee = Math.max(20000, Math.round((p.value || E.calcValue(p.ovr,p.age,p.pot)) * (0.9+rng()*0.4) / 5000) * 5000);
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
function runEuropeanPoaching(rng){
  const world = ST.world;
  if(!world || !world.teams) return;
  const sellerName = pickJewelSellerTeam(world, rng);
  if(!sellerName) return;
  const seller = world.teams[sellerName];
  const jewel = bestJewelIn(seller);
  if(!jewel) return;
  const buyer = REAL_EURO_CLUBS[Math.floor(rng()*REAL_EURO_CLUBS.length)];
  const fee = askingPrice(jewel, seller);
  seller.players = seller.players.filter(p=>p.id!==jewel.id);
  if(!Array.isArray(world.globalMarket)) world.globalMarket = [];
  world.globalMarket.push(Object.assign({}, jewel, {club:buyer, league:"European League"}));
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
  const globalCands = eligibleGlobalCandidates(world, pos, tier);
  if(!globalCands.length) return;
  const picked = pickWeighted(rng, globalCands, p=>{
    let s = 10;
    if((SA_NEIGHBORS[team.country]||[]).includes(p.nat)) s += 25;
    s += Math.max(0, 20 - Math.abs(p.ovr-need));
    return s;
  });
  if(!picked) return;
  const fromClub = picked.club;
  const fee = globalMarketAskingPrice(picked);
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
  let dest = clubNames[Math.floor(rng()*clubNames.length)];
  let guard = 0;
  while(dest===p.club && guard<5){ dest = clubNames[Math.floor(rng()*clubNames.length)]; guard++; }
  if(dest===p.club) return;
  const fee = Math.max(20000, Math.round((p.value || E.calcValue(p.ovr,p.age,p.pot)) * (0.9+rng()*0.4) / 5000) * 5000);
  recordTransferFeed({name:p.name, price:fee, fromClub:p.club, toClub:dest, pos:p.pos, ovr:p.ovr});
  p.club = dest;
  p.value = fee;
}
// rolled once per AVANÇAR DIA (see Game.advance/advanceSlow/advanceFast) — most days are quiet,
// but on the ones that aren't, exactly one of these three fires so transfer news actually
// trickles in day by day instead of arriving all at once at the season boundary.
function dailyTransferTick(){
  if(!ST.world || !ST.world.teams) return;
  const rng = E.makeRNG(nextSeed());
  if(rng() > 0.24) return;
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
    recordCareerSigning(p.name, offer);
    recordTransferFeed({name:p.name, price:offer, fromClub:sellerTeamName, toClub:ST.teamId, pos:p.pos, ovr:p.ovr});
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
    recordCareerSigning(p.name, offer);
    recordTransferFeed({name:p.name, price:offer, fromClub:p.club, toClub:ST.teamId, pos:p.pos, ovr:p.ovr});
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
  const squad = myTeam().players.filter(p=>p.ovr>=70);
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
    else if(ST.stage==="mode_select") html = renderModeSelect();
    else if(ST.stage==="team_select") html = renderTeamSelect();
    else if(ST.stage==="manager_name") html = renderManagerName();
    else if(ST.stage==="hub") html = renderHub();
    else if(ST.stage==="match") html = renderMatch();
    else if(ST.stage==="season_end") html = renderSeasonEndScreen();
    else if(ST.stage==="group_draw") html = renderGroupDraw();
    else if(ST.stage==="job_offers") html = renderJobOffers();
    else if(ST.stage==="career_over") html = renderCareerOver();
    else if(ST.stage==="penaltyShootout") html = renderPenaltyShootoutScreen();
    else if(ST.stage==="prelib_select") html = renderPreLibSelect();
    else if(ST.stage==="prelib_manager_name") html = renderPreLibManagerName();
    else if(ST.stage==="prelib_champion") html = renderPreLibChampion();
    else html = `<div class="empty-state">Estado desconhecido: ${esc(ST.stage)}</div>`;
    app.innerHTML = html + renderModal();
    const tickerEl = document.getElementById("ticker");
    if(tickerEl) tickerEl.scrollTop = tickerEl.scrollHeight;
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
  const hasCareer = ST && ST.teamId && ST.world;
  const inPrelib = hasCareer && !!ST.prelib;
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
            <button class="btn btn-gold btn-lg" onclick="Game.continueCareer()">▶ ${inPrelib?"CONTINUAR PRÉ-LIBERTADORES":"CONTINUAR CARREIRA"}</button>
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

// ---------------- MODE SELECT ----------------
function renderModeSelect(){
  return `
  <div class="hero" style="min-height:80vh;">
    <div style="align-self:flex-start;margin-left:20px;"><button class="btn btn-ghost btn-sm" onclick="Game.goHome()">← Voltar</button></div>
    <div class="hero-eyebrow">Como você quer jogar?</div>
    <h1 class="hero-title" style="font-size:clamp(28px,6vw,48px);">ESCOLHA SEU CAMINHO</h1>
    <div class="mt24" style="display:flex;flex-direction:column;gap:14px;max-width:380px;width:100%;">
      <button class="btn btn-gold btn-lg" onclick="Game.chooseNormalCareer()">▶ Carreira Libertadores 2026</button>
      <button class="btn btn-ghost btn-lg" onclick="Game.goPreLib()">🏆 Jogar Pré-Libertadores</button>
    </div>
    <p class="dim small mt24" style="max-width:420px;">Carreira Libertadores: assuma um dos 32 clubes já classificados. Pré-Libertadores: dispute um mata-mata entre 8 clubes da Sul-Americana — vença e ganhe uma vaga direta na Libertadores do ano seguinte.</p>
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
          <div class="faint tiny">${team.flag} ${esc(team.country)} · ${ST.prelib ? `Pré-Libertadores ${ST.prelib.year}` : `Temporada ${ST.seasonYear} (${ST.seasonNum}/10)`}</div>
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
    ${tabBtn("email",iconEnvelope(13)+" E-mail"+(unreadMailCount()?` <span class="badge-mail">${unreadMailCount()}</span>`:""))}
    ${tabBtn("clube","Meu Clube")}
  </div>
  <div class="tab-content">
    ${ST.hubTab==="competicao"?renderCompeticaoTab():""}
    ${ST.hubTab==="elenco"?renderElencoTab():""}
    ${ST.hubTab==="transfers"?renderTransfersTab():""}
    ${ST.hubTab==="scout"?renderScoutTab():""}
    ${ST.hubTab==="email"?renderEmailTab():""}
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
function getNextUserMatch(){
  if(ST.prelib) return getNextUserPrelibMatch();
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
function renderCalendarStrip(oppName){
  const days = ST.calendarDaysLeft;
  const todayIdx = ST.calendarWeekdayIdx;
  // how many more AVANÇAR DIA clicks until daysSinceTraining actually hits 2 and a training
  // day interrupts the calendar — maps 1:1 onto the strip's cell index, same as "days" does
  // for the match; never shown past the match day itself, since that resolves first.
  const daysUntilTraining = 2 - (ST.daysSinceTraining||0);
  let cells = "";
  for(let i=0;i<5;i++){
    const wIdx = (todayIdx+i)%7;
    const isMatchDay = i===days;
    const isTrainingDay = !isMatchDay && i===daysUntilTraining && daysUntilTraining>0 && daysUntilTraining<days;
    let icon = "";
    if(isMatchDay) icon = crestSVG(oppName,20);
    else if(isTrainingDay) icon = `<img src="${TRAINING_ICON}" alt="Treino" style="width:100%;height:100%;object-fit:contain;"/>`;
    cells += `<div class="cal-day${isMatchDay?' cal-day-match':''}${isTrainingDay?' cal-day-training':''}${i===0?' cal-day-today':''}">
      <div class="cal-day-label">${WEEKDAYS[wIdx]}</div>
      <div class="cal-day-icon">${icon}</div>
    </div>`;
  }
  return `<div class="cal-panel mt16">
    <div class="cal-panel-title">Avançar</div>
    <div class="cal-strip">${cells}</div>
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
  const rows = squad.map(p=>{
    const maxed = p.ovr>=p.pot;
    const prog = maxed ? 100 : Math.round(p.trainProgress||0);
    const r = result && result[p.id];
    const delta = r && r.gain>0 ? `<span class="green bold train-delta">+${r.gain}%${r.leveledUp?" ↑":""}</span>` : "";
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
    <div class="train-list mt16">${rows}</div>
    ${actions}`;
}
function renderNextMatchCard(){
  const nm = getNextUserMatch();
  if(!nm) return "";
  ensureCalendarCountdown();
  const days = ST.calendarDaysLeft;
  const oppName = nm.home===ST.teamId ? nm.away : nm.home;
  // match day itself drops the calendar entirely and goes back to exactly how this card
  // worked before AVANÇAR DIA existed: simulate straight away, at whatever pace/speed.
  const actionBlock = ST.trainingPending
    ? renderTrainingBlock()
    : days<=0
    ? `<div class="gold bold uc tac mt16" style="letter-spacing:.06em;">⚽ Dia do jogo!</div>
       <div class="btn-row center mt16">
         <button class="btn btn-gold" onclick="Game.advanceSlow()">▶ Simulação Lenta</button>
         <button class="btn" onclick="Game.advanceFast()">⏭ Ir para o Resultado</button>
       </div>
       <div class="btn-row center mt8">
         <button class="btn btn-sm" onclick="Game.openTimeConfig()">CONFIGURAÇÃO DE TEMPO</button>
       </div>`
    : `${renderCalendarStrip(oppName)}
       <div class="tac dim small mt8">Próximo jogo em ${days} dia${days===1?"":"s"}</div>
       <div class="btn-row center mt16">
         <button class="btn btn-gold btn-lg" onclick="Game.advanceDay()">AVANÇAR DIA</button>
       </div>
       <div class="btn-row center mt8">
         <button class="btn btn-sm" onclick="Game.openTimeConfig()">CONFIGURAÇÃO DE TEMPO</button>
       </div>`;
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
    ${actionBlock}
  </div>`;
}
// the Pré-Libertadores flavor of the Competição tab: same "próximo jogo" card (with its
// AVANÇAR DIA calendar) as a real career, just showing the knockout bracket instead of a
// group table, plus whatever status the run is currently in.
function renderPreLibCompeticaoTab(){
  const p = ST.prelib;
  const matchCell = `<div class="competicao-cell">${renderNextMatchCard()}</div>`;
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

  const cells = matchCell
    + `<div class="competicao-cell">${statusPanel}</div>`
    + `<div class="competicao-cell" style="grid-column:1 / -1;">${bracketPanel}</div>`;
  return `<div class="competicao-grid">${cells}</div>`;
}
// four distinct boxed panels, laid out 2×2 — mirrors the reference: match card,
// standings, upcoming fixtures and top scorers each get their own separated card.
// "FABRIZIO ROMANO" — a transfer-news card on the Competição tab reading straight off
// ST.transferFeed (every AI signing plus the user's own purchases). Click it to flip between
// the 5 priciest deals in the save so far and the 5 most recent ones; each row shows the fee,
// the player, and both crests with an arrow pointing at whoever actually signed them.
function romanoRow(t){
  return `<div class="romano-row">
    <div class="romano-row-crests">
      ${clubCrestImg(t.fromClub, 22)}
      <span class="romano-arrow">→</span>
      ${clubCrestImg(t.toClub, 22)}
    </div>
    <div class="romano-row-body">
      <div class="bold">${esc(t.name)}</div>
      <div class="tiny dim">${esc(t.fromClub)} <span class="romano-arrow-inline">→</span> <span class="bold">${esc(t.toClub)}</span></div>
    </div>
    <div class="romano-row-fee gold bold mono">${fmtMoney(t.price)}</div>
  </div>`;
}
function renderFabrizioRomanoCard(){
  const feed = ST.transferFeed || [];
  if(!feed.length){
    return `<div class="panel romano-panel">
      <div class="panel-title">🗞️ FABRIZIO ROMANO</div>
      <div class="faint tiny">Mercado ainda calmo — os primeiros rumores chegam no fim da temporada. Here we go... eventually!</div>
    </div>`;
  }
  const flipped = !!ST.romanoFlip;
  const list = flipped
    ? feed.slice(-5).reverse()
    : feed.slice().sort((a,b)=>b.price-a.price).slice(0,5);
  const squeeze = ST.romanoFlipping ? "transform:scaleX(0.04);" : "transform:scaleX(1);";
  return `<div class="panel romano-panel" onclick="Game.toggleRomanoFlip()" title="Clique para virar a página" style="cursor:pointer;">
    <div class="row" style="justify-content:space-between;">
      <div class="panel-title" style="margin:0;">🗞️ FABRIZIO ROMANO</div>
      <div class="tiny faint uc">${flipped?"Mais recentes":"Mais caras"} · clique p/ virar</div>
    </div>
    <div class="romano-flip-inner" style="${squeeze}">
      ${list.map(romanoRow).join("")}
    </div>
  </div>`;
}
function renderCompeticaoTab(){
  if(ST.prelib) return renderPreLibCompeticaoTab();
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
    // explicit two-column layout (rather than a flat 4-cell auto-flow grid) so the "Últimos
    // E-mails" shortcut can sit exactly where it was asked for: right column, between the
    // group standings and the top scorers.
    const leftCol = `<div class="competicao-col">
      ${matchCell}
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
    cells = matchCell
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
// the "Potencial" cell for a market row: locked (button to start observing), in progress
// (days left), or revealed (the real Pot chip) — see the OBSERVAR mechanic above.
function renderPotCell(teamKey, p){
  if(isObserved(teamKey, p.id)) return `<span class="ovr-chip ${ovrClass(p.pot)}">${p.pot}</span>`;
  const q = queuedObservation(teamKey, p.id);
  if(q) return `<span class="tiny faint">🔎 ${q.daysLeft}d</span>`;
  return `<button class="btn btn-sm" onclick="Game.observePlayer(${p.id},'${escJs(teamKey)}')">🔒 Observar</button>`;
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
        <div class="dim tiny mb8">${iconGlobe(13)} Jogadores de fora da Libertadores — não disputam a competição, mas podem ser contratados. Mostrando ${shown.length} de ${list.length}. Orçamento: <span class="gold bold">${fmtMoney(ST.budget)}</span></div>
        <div class="scroll-x"><table class="data"><thead><tr>
          <th>Jogador</th><th>Clube (fora da Libertadores)</th><th>Pos</th><th class="tac">Idade</th><th class="tac">OVR</th><th class="tac">Potencial</th><th class="tac">Valor</th><th></th>
        </tr></thead><tbody>
        ${shown.map(p=>`<tr>
          <td class="bold">${esc(p.name)} <span class="faint tiny">${esc(p.nat)}</span></td>
          <td class="dim"><span style="display:inline-flex;align-items:center;gap:7px;">${clubCrestImg(p.club,20,p.name)}<span>${esc(p.club)}</span></span></td>
          <td><span class="badge badge-pos">${p.pos}</span></td>
          <td class="tac">${p.age}</td>
          <td class="tac"><span class="ovr-chip ${ovrClass(p.ovr)}">${p.ovr}</span></td>
          <td class="tac">${renderPotCell("global",p)}</td>
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
        <th>Jogador</th><th>Time</th><th>Pos</th><th class="tac">Idade</th><th class="tac">OVR</th><th class="tac">Potencial</th><th class="tac">Valor</th><th></th>
      </tr></thead><tbody>
      ${shown.map(p=>`<tr>
        <td class="bold">${esc(p.name)} <span class="faint tiny">${p.nat}</span></td>
        <td class="dim"><span style="display:inline-flex;align-items:center;gap:7px;">${clubCrestImg(p._team,20,p.name)}<span>${esc(p._team)}</span></span></td>
        <td><span class="badge badge-pos">${p.pos}</span></td>
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
      <td class="bold">${esc(p.name)}</td>
      <td><span class="badge badge-pos">${p.pos}</span></td>
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
      <td class="bold">${esc(p.name)}</td>
      <td><span class="badge badge-pos">${p.pos}</span></td>
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
const MAIL_ICON = { offer: iconCoin(20), injury: iconMedical(20), scout: iconMagnifier(20), job: iconBriefcase(20) };
function renderEmailTab(){
  const open = ST.openMailId ? findMail(ST.openMailId) : null;
  if(open) return renderMailDetail(open);
  const box = inboxList();
  if(!box.length){
    return `<div class="empty-state"><p>Sua caixa de entrada está vazia.</p><p class="dim small">Clique em AVANÇAR DIA na aba Competição para receber propostas, boletins médicos e relatórios de olheiro.</p></div>`;
  }
  return `<div class="mail-list">${box.map(renderMailRow).join("")}</div>`;
}
function renderMailRow(m){
  const rowIcon = (m.type==="offer" && m.payload && m.payload.club)
    ? clubCrestImg(m.payload.club, 20, m.payload.playerName)
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
  return `${header}<div class="panel mt16">${m.body}</div>`;
}
// the "risco de melar" gauge — a half-circle speedometer (styled after an oxygen-tank
// pressure gauge) with a needle that sweeps from green up through amber into red as
// pl.riskPercent climbs, so the manager can SEE exactly how close the next push is to
// blowing up the whole deal before they commit to it.
function renderRiskGauge(percent){
  const p = E.clamp(Math.round(percent||0), 0, 100);
  const r = 44, cx = 60, cy = 60;
  const circumference = Math.PI*r;
  const offset = circumference*(1-p/100);
  const angle = -90 + (p/100)*180;
  const color = p<40 ? "var(--green)" : p<70 ? "var(--marigold)" : "var(--red)";
  return `<div class="risk-gauge">
    <svg viewBox="0 0 120 68" width="150" height="86">
      <path d="M ${cx-r},${cy} A ${r},${r} 0 0 1 ${cx+r},${cy}" fill="none" stroke="#2a2620" stroke-width="10" stroke-linecap="round"/>
      <path d="M ${cx-r},${cy} A ${r},${r} 0 0 1 ${cx+r},${cy}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-r+9}" stroke="var(--chalk)" stroke-width="3" stroke-linecap="round" transform="rotate(${angle} ${cx} ${cy})"/>
      <circle cx="${cx}" cy="${cy}" r="5" fill="var(--chalk)"/>
    </svg>
    <div class="risk-gauge-label">Risco de a negociação <b>melar</b>: <span style="color:${color};font-weight:800;">${p}%</span></div>
  </div>`;
}
function offerStatusBanner(pl){
  if(pl.status==="accepted") return `<div class="mail-status mail-status-good">✅ Venda concluída — ${fmtMoney(pl.offer)} creditados ao orçamento.</div>`;
  if(pl.status==="rejected") return `<div class="mail-status">Você recusou esta proposta.</div>`;
  if(pl.status==="withdrawn") return `<div class="mail-status mail-status-bad">O clube retirou a proposta após a negociação.</div>`;
  if(pl.status==="superseded") return `<div class="mail-status">Substituída por uma proposta mais recente.</div>`;
  if(pl.status==="void") return `<div class="mail-status mail-status-bad">O jogador já não está mais disponível.</div>`;
  if(pl.status==="awaiting_reply") return `<div class="mail-status">⏳ O clube pediu um tempo para pensar — responde em até ${pl.pendingReplyDays||1} dia(s). Avance os dias em Competição para receber a resposta.</div>`;
  if(pl.status==="answered") return `<div class="mail-status">Essa negociação já teve resposta — confira o e-mail mais recente na caixa de entrada.</div>`;
  return "";
}
function renderOfferMailBody(m){
  const pl = m.payload;
  const posture = offerPosture(pl);
  const estMax = Math.round(pl.value*posture.estCeilingMult/5000)*5000;
  const pct = Math.round((pl.offer/pl.value-1)*100);
  const thread = (m.thread||[]).map(t=>`<div class="mail-thread-line">"${esc(t)}"</div>`).join("");
  const pending = pl.status==="pending";
  const range = offerAskRange(pl);
  const suggested = E.clamp(Math.round(pl.offer*1.2/5000)*5000, range.minAsk, range.maxAsk);
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
      <b>${esc(posture.label)}.</b> Estimativa: dá pra pedir com boas chances até cerca de
      <b class="gold">${fmtMoney(estMax)}</b>. Cada novo pedido aumenta o risco de a negociação melar de vez — acompanhe no medidor abaixo.
    </div>
    ${renderRiskGauge(pl.riskPercent)}`:""}
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

function renderMatch(){
  const pm = ST.pendingMatch;
  const home = pm.ref.home, away = pm.ref.away;
  const stageLbl = stageLabelFor(pm.context.type) + (pm.context.legIndex!=null ? ` — jogo de ${pm.context.legIndex===0?'ida':'volta'}` : ((pm.context.type==="final"||String(pm.context.type).indexOf("prelib_")===0)?" — jogo único":""));
  if(!pm.result){
    const lp = lineupPlayers();
    const missing = lp.filter(p=>!p).length;
    const unavailable = lp.filter(p=>p && (p.injured||p.suspended)).length;
    const speed = ST.matchSpeed || "normal";
    const speedBtn = (id,label)=>`<button class="btn btn-sm${speed===id?' btn-gold':''}" onclick="Game.setMatchSpeed('${id}')">${label}</button>`;
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
        <button class="btn btn-sm mt8" onclick="Game.goEditLineup()">✏️ Editar escalação</button>
      </div>
      <div class="tac mt24">
        <div class="tiny faint uc mb8">Velocidade da partida</div>
        <div class="btn-row center mb16">
          ${speedBtn("slow","LENTA")}
          ${speedBtn("normal","RÁPIDA")}
          ${speedBtn("fast","MUITO RÁPIDA")}
        </div>
        <button class="btn btn-gold btn-lg" onclick="Game.simulateMatch()">▶ Simular Partida</button>
      </div>
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
        <span class="tick-min">${ev.minute}'</span><span class="tick-icon">${ev.penalty?"🎯":(EVENT_ICON[ev.type]||"•")}</span>
        <span>${eventText(ev, home, away)}</span>
      </div>`).join("")}
    </div>
    ${!done? `
    <div class="tac mt16">
      <button class="btn mt8" onclick="Game.skipMatch()">PULAR PARA O FINAL</button>
    </div>` : `
    <div class="tac mt16">
      <button class="btn btn-gold btn-lg" onclick="Game.continueAfterMatch()">Continuar →</button>
    </div>`}
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
function renderModal(){
  const m = ST.uiModal;
  if(!m) return "";
  if(m.type==="slotPicker") return renderSlotPickerModal(m);
  if(m.type==="buyOffer") return renderBuyOfferModal(m);
  if(m.type==="news") return renderNewsModal();
  if(m.type==="confirm") return renderConfirmModal(m);
  if(m.type==="incomingOffer") return renderIncomingOfferModal(m);
  if(m.type==="squadCentral") return renderSquadCentralModal();
  if(m.type==="penaltyPicker") return renderPenaltyPickerModal(m);
  if(m.type==="penaltyKick") return renderPenaltyKickModal(m);
  if(m.type==="timeConfig") return renderTimeConfigModal();
  return "";
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
      <div class="signature-wrap"><span class="signature-text">${esc(ST.managerName || "Treinador")}</span></div>
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
        <input id="offerInput" type="text" inputmode="numeric" class="input-inline" style="width:100%;" value="${String(ask).replace(/\B(?=(\d{3})+(?!\d))/g,".")}" oninput="Game.updateOfferWords(this)"/>
        <div id="offerWords" class="tiny faint mt4">${esc(numberToWordsPT(ask))}</div>
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
    <button class="btn btn-gold btn-lg mt24" onclick="Game.continueSeason()">Ir para ${ST.seasonYear} →</button>
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
        <div class="panel-title">Resumo de ${esc(ST.managerName)}</div>
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
    ST.stage="mode_select"; render();
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
    ensureCalendarCountdown();
    if(ST.calendarDaysLeft>0) ST.calendarDaysLeft--;
    ST.calendarWeekdayIdx = (ST.calendarWeekdayIdx+1)%7;
    generateDailyMail();
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
    else if(m.action==="confirmNewGame") { ST.stage="mode_select"; }
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
  updateOfferWords(inputEl){ formatMoneyInputEl(inputEl, "offerWords"); },
  submitOffer(playerId, team){
    const m = ST.uiModal;
    if(!m || m.signing) return;
    const input = document.getElementById("offerInput");
    const offer = Math.max(0, digitsFromMoneyInput(input.value));
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
  generateScout(){ requestScoutReport(); render(); },
  upgradeScout(){ upgradeScoutLevel(); render(); },
  observePlayer(id, teamKey){ observePlayer(teamKey, Number(id)); render(); },

  simulateMatch(){ simulatePendingMatch(); render(); },
  openTimeConfig(){ ST.uiModal = {type:"timeConfig"}; render(); },
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
  acceptJob(name){ selectNewJob(name); maybeIncomingOffer(0.30); render(); },
  stayJob(){ stayAtCurrentJob(); maybeIncomingOffer(0.30); render(); },
  newCareerFromOver(){ resetCareer(); },
};
window.Game = Game;
window.ST = null; // populated below after init for console/debug convenience

// ============================================================
// ACCESS GATE — a simple client-side login so the site isn't playable by
// anyone who just stumbles on the URL. Asked fresh on every single visit/reload
// (nothing is remembered between page loads, on purpose). This is NOT real
// security (anyone who opens dev tools can read the credentials below or skip
// straight to boot()) — it's just a lightweight "only people I gave the login
// to" filter.
// ============================================================
const ACCESS_USER = "GonzaloPlataPenta2026";
const ACCESS_PASS = "platapontaburro";
function renderAccessGate(errorMsg){
  const app = document.getElementById("app");
  if(!app) return;
  app.innerHTML = `<div class="hero hero-home" style="min-height:100vh;">
    <div class="hero-badge">ACESSO RESTRITO</div>
    <h1 class="hero-title" style="font-size:clamp(30px,7vw,58px);">THE GLÓRIA ETERNA</h1>
    <p class="hero-sub">Esse jogo é privado. Entre com usuário e senha para jogar.</p>
    <div class="panel mt24" style="max-width:340px;width:100%;text-align:left;">
      <label class="tiny faint uc" style="display:block;margin-bottom:4px;">Usuário</label>
      <input id="gateUser" class="input-inline" style="width:100%;margin-bottom:12px;" autocomplete="off" autocapitalize="off" spellcheck="false"/>
      <label class="tiny faint uc" style="display:block;margin-bottom:4px;">Senha</label>
      <input id="gatePass" type="password" class="input-inline" style="width:100%;" autocomplete="off"/>
      ${errorMsg ? `<p class="red small mt8">${esc(errorMsg)}</p>` : ""}
      <button class="btn btn-gold btn-block mt16" onclick="window.__tryAccessLogin__()">Entrar</button>
    </div>
  </div>`;
  const passEl = document.getElementById("gatePass");
  if(passEl) passEl.addEventListener("keydown", e=>{ if(e.key==="Enter") window.__tryAccessLogin__(); });
}
window.__tryAccessLogin__ = function(){
  const u = (document.getElementById("gateUser")||{}).value || "";
  const p = (document.getElementById("gatePass")||{}).value || "";
  if(u===ACCESS_USER && p===ACCESS_PASS){
    boot();
  } else {
    renderAccessGate("Usuário ou senha incorretos.");
  }
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

window.__APP_INTERNALS__ = { newCareerState, startCareer, advanceTournament, render, tierOf, buildJobOffers, teamAvgOvr, get ST(){return ST;}, set ST(v){ST=v;} };

