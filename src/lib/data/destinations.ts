import type { StopKind } from "../types";

// Curated places with real coordinates. Costs are rough per-person USD
// estimates and the UI always labels them as estimates.

export interface Place {
  name: string;
  kind: StopKind;
  lat: number;
  lng: number;
  cost: number;
  durationMin: number;
  blurb: string;
}

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** mid-range room per night, USD */
  lodging: number;
  /** meals not covered by food stops, per person per day, USD */
  foodPerDay: number;
  aliases?: string[];
  places: Place[];
}

export interface Country {
  id: string;
  name: string;
  aliases: string[];
  /** fast rail network (shinkansen, frecciarossa) */
  fastRail?: boolean;
  /** road trip country: legs between cities are driven */
  drive?: boolean;
  /** no useful intercity rail: buses and shared taxis instead */
  busOnly?: boolean;
  /** legs longer than this many km are flown */
  flightAbove?: number;
  route: string[];
  cities: City[];
}

const p = (
  name: string,
  kind: StopKind,
  lat: number,
  lng: number,
  cost: number,
  durationMin: number,
  blurb: string,
): Place => ({ name, kind, lat, lng, cost, durationMin, blurb });

export const COUNTRIES: Country[] = [
  {
    id: "japan",
    name: "Japan",
    aliases: ["japan", "nippon", "japanese"],
    fastRail: true,
    route: ["tokyo", "hakone", "kyoto", "nara", "osaka"],
    cities: [
      {
        id: "tokyo",
        name: "Tokyo",
        lat: 35.6812,
        lng: 139.7671,
        lodging: 110,
        foodPerDay: 30,
        places: [
          p("Senso-ji Temple", "culture", 35.7148, 139.7967, 0, 90, "Tokyo's oldest temple, lanterns and incense at dawn."),
          p("Tsukiji Outer Market", "food", 35.6655, 139.7707, 30, 90, "Tamagoyaki, tuna skewers and strawberry daifuku on the move."),
          p("Shibuya Crossing", "sight", 35.6595, 139.7005, 0, 45, "A thousand people cross at once. Watch from above, then join in."),
          p("Meiji Jingu", "culture", 35.6764, 139.6993, 0, 75, "A forest shrine hiding in the middle of the city."),
          p("teamLab Planets", "sight", 35.6491, 139.7898, 28, 120, "Wade barefoot through rooms of light and water."),
          p("Omoide Yokocho", "food", 35.693, 139.6996, 25, 90, "Smoky yakitori alley with six-seat counters."),
          p("Golden Gai", "night", 35.694, 139.7046, 30, 120, "Two hundred tiny bars, each with its own personality."),
          p("Shinjuku Gyoen", "relax", 35.6852, 139.7101, 4, 90, "Lawns, cherry trees and a greenhouse full of orchids."),
          p("Akihabara", "shop", 35.6984, 139.7731, 20, 120, "Retro games, capsule toys and eight-floor arcades."),
          p("Mount Takao", "hike", 35.6251, 139.2437, 8, 300, "Easy mountain trail an hour from Shinjuku, Fuji on clear days."),
          p("Tokyo Ramen Street", "food", 35.6803, 139.769, 12, 60, "Eight famous ramen shops under Tokyo Station."),
          p("Ueno Park & National Museum", "culture", 35.7188, 139.7765, 8, 120, "Samurai armor, woodblock prints and a lotus pond."),
        ],
      },
      {
        id: "hakone",
        name: "Hakone",
        lat: 35.2324,
        lng: 139.1069,
        lodging: 140,
        foodPerDay: 35,
        places: [
          p("Hakone Open-Air Museum", "culture", 35.2446, 139.0507, 13, 120, "Giant sculptures on hillsides, plus a foot bath."),
          p("Owakudani", "sight", 35.244, 139.0196, 10, 75, "Steaming volcanic valley and black eggs said to add seven years."),
          p("Lake Ashi Cruise", "sight", 35.2049, 139.0247, 9, 60, "A pirate ship across the lake with Fuji peeking over."),
          p("Hakone Shrine", "culture", 35.2047, 139.0254, 0, 45, "The red torii gate standing in the lake."),
          p("Mount Kintoki Trail", "hike", 35.2856, 139.0003, 0, 240, "Steep, rooty, and the best Fuji view in Hakone."),
          p("Old Tokaido Road", "hike", 35.2006, 139.033, 0, 150, "Mossy stone path once walked by samurai."),
          p("Onsen Soak", "relax", 35.2253, 139.0935, 12, 120, "Outdoor hot spring baths under the maples."),
        ],
      },
      {
        id: "kyoto",
        name: "Kyoto",
        lat: 35.0116,
        lng: 135.7681,
        lodging: 100,
        foodPerDay: 28,
        places: [
          p("Fushimi Inari Taisha", "hike", 34.9671, 135.7727, 0, 150, "Ten thousand orange gates up a mountain. Go early."),
          p("Kiyomizu-dera", "culture", 34.9949, 135.785, 3, 90, "Wooden stage over the treetops, city spread below."),
          p("Arashiyama Bamboo Grove", "sight", 35.017, 135.6713, 0, 60, "Tall green stalks that creak in the wind."),
          p("Kinkaku-ji", "culture", 35.0394, 135.7292, 4, 60, "The golden pavilion reflected in a mirror pond."),
          p("Nishiki Market", "food", 35.005, 135.7649, 25, 90, "Kyoto's kitchen: pickles, mochi, baby octopus."),
          p("Gion & Hanamikoji", "night", 35.0037, 135.7752, 0, 75, "Lantern-lit lanes of teahouses at dusk."),
          p("Philosopher's Path", "relax", 35.027, 135.7944, 0, 75, "Canal-side stroll under cherry branches."),
          p("Daimonji Hike", "hike", 35.0242, 135.8005, 0, 120, "Short climb to the giant kanji above the city."),
          p("Pontocho Dinner", "food", 35.0058, 135.7707, 40, 90, "Riverside dining in a narrow alley."),
        ],
      },
      {
        id: "nara",
        name: "Nara",
        lat: 34.6851,
        lng: 135.8048,
        lodging: 80,
        foodPerDay: 25,
        places: [
          p("Todai-ji", "culture", 34.689, 135.8398, 4, 75, "A fifteen-meter bronze Buddha in a vast wooden hall."),
          p("Nara Park Deer", "sight", 34.6851, 135.843, 2, 60, "Polite deer that bow for crackers."),
          p("Kasuga Taisha", "culture", 34.6813, 135.8484, 4, 60, "Three thousand stone and bronze lanterns."),
          p("Mount Wakakusa", "hike", 34.688, 135.852, 1, 90, "Grassy hill with a view over the whole valley."),
        ],
      },
      {
        id: "osaka",
        name: "Osaka",
        lat: 34.6937,
        lng: 135.5023,
        lodging: 85,
        foodPerDay: 25,
        places: [
          p("Dotonbori", "food", 34.6687, 135.5013, 25, 120, "Takoyaki, neon and the running man sign."),
          p("Kuromon Market", "food", 34.6655, 135.5065, 20, 75, "Grilled scallops and wagyu skewers."),
          p("Osaka Castle", "culture", 34.6873, 135.5262, 4, 90, "Green-and-gold keep above stone walls."),
          p("Shinsekai", "food", 34.6525, 135.5063, 15, 90, "Retro district famous for kushikatsu."),
          p("Umeda Sky Building", "sight", 34.7053, 135.4906, 10, 60, "Open-air floating garden 170 meters up."),
        ],
      },
    ],
  },
  {
    id: "italy",
    name: "Italy",
    aliases: ["italy", "italia", "italian"],
    fastRail: true,
    route: ["rome", "florence", "cinque-terre", "venice"],
    cities: [
      {
        id: "rome",
        name: "Rome",
        lat: 41.9028,
        lng: 12.4964,
        lodging: 130,
        foodPerDay: 35,
        places: [
          p("Colosseum", "culture", 41.8902, 12.4922, 20, 120, "Stand where 50,000 Romans roared."),
          p("Roman Forum", "culture", 41.8925, 12.4853, 0, 90, "Temples and arches of the ancient city center."),
          p("Pantheon", "culture", 41.8986, 12.4769, 6, 45, "A 2,000-year-old dome with a hole to the sky."),
          p("Trevi Fountain", "sight", 41.9009, 12.4833, 0, 30, "Toss a coin over your shoulder to come back."),
          p("Vatican Museums", "culture", 41.9065, 12.4536, 22, 180, "Miles of art ending at the Sistine ceiling."),
          p("Trastevere Dinner", "food", 41.8897, 12.47, 35, 120, "Cacio e pepe under ivy and string lights."),
          p("Campo de' Fiori", "food", 41.8956, 12.4722, 15, 60, "Morning market, then pizza bianca."),
          p("Gianicolo Hill Walk", "hike", 41.8919, 12.4614, 0, 75, "Climb for a sweeping view of the domes."),
          p("Testaccio Market", "food", 41.8768, 12.4752, 15, 75, "Where Romans actually eat lunch."),
        ],
      },
      {
        id: "florence",
        name: "Florence",
        lat: 43.7696,
        lng: 11.2558,
        lodging: 120,
        foodPerDay: 32,
        places: [
          p("Duomo Climb", "sight", 43.7731, 11.256, 30, 90, "463 steps inside Brunelleschi's dome."),
          p("Uffizi Gallery", "culture", 43.7678, 11.2553, 27, 150, "Botticelli's Venus and the whole Renaissance."),
          p("Ponte Vecchio", "sight", 43.768, 11.2531, 0, 30, "Goldsmiths' shops on a medieval bridge."),
          p("Piazzale Michelangelo", "hike", 43.7629, 11.265, 0, 75, "Walk up for sunset over terracotta roofs."),
          p("Mercato Centrale", "food", 43.7764, 11.2534, 18, 75, "Lampredotto sandwiches and truffle everything."),
          p("Oltrarno Trattoria", "food", 43.7655, 11.249, 35, 120, "Bistecca for two in the artisans' quarter."),
          p("Fiesole Walk", "hike", 43.807, 11.2919, 3, 180, "Hill town with Roman ruins and olive groves."),
        ],
      },
      {
        id: "cinque-terre",
        name: "Cinque Terre",
        lat: 44.135,
        lng: 9.6847,
        lodging: 140,
        foodPerDay: 35,
        aliases: ["cinque terre", "vernazza"],
        places: [
          p("Monterosso to Vernazza Trail", "hike", 44.1405, 9.667, 15, 150, "Cliffside path between two pastel villages."),
          p("Manarola at Sunset", "sight", 44.1066, 9.729, 0, 60, "The postcard view, live."),
          p("Riomaggiore", "sight", 44.0991, 9.738, 0, 60, "Tower houses tumbling to a tiny harbor."),
          p("Focaccia in Monterosso", "food", 44.146, 9.6545, 8, 30, "Warm, oily, salty perfection."),
          p("Corniglia Steps", "hike", 44.1197, 9.7104, 0, 75, "382 steps up to the village on the cliff."),
        ],
      },
      {
        id: "venice",
        name: "Venice",
        lat: 45.4408,
        lng: 12.3155,
        lodging: 150,
        foodPerDay: 40,
        places: [
          p("St Mark's Basilica", "culture", 45.4345, 12.3397, 3, 60, "Golden mosaics on every ceiling."),
          p("Doge's Palace", "culture", 45.4337, 12.3404, 30, 120, "Gilded halls and the Bridge of Sighs."),
          p("Rialto Market", "food", 45.4385, 12.3348, 15, 60, "Fish market by the Grand Canal."),
          p("Cicchetti in Cannaregio", "night", 45.4442, 12.327, 30, 120, "Bar-hop for small bites and spritz."),
          p("Burano", "sight", 45.4853, 12.4167, 15, 180, "Rainbow island of lace makers."),
          p("Gondola Ride", "sight", 45.437, 12.333, 90, 30, "Pricey, cheesy, completely worth it once."),
        ],
      },
    ],
  },
  {
    id: "peru",
    name: "Peru",
    aliases: ["peru", "machu picchu", "inca"],
    flightAbove: 300,
    route: ["lima", "cusco", "sacred-valley", "machu-picchu"],
    cities: [
      {
        id: "lima",
        name: "Lima",
        lat: -12.0464,
        lng: -77.0428,
        lodging: 70,
        foodPerDay: 25,
        places: [
          p("Miraflores Malecón", "relax", -12.1236, -77.0369, 0, 75, "Clifftop parks and paragliders over the Pacific."),
          p("Barranco", "night", -12.1497, -77.0213, 15, 120, "Murals, bohemian bars and the Bridge of Sighs."),
          p("Surquillo Market Ceviche", "food", -12.1129, -77.0279, 15, 75, "Lime-cured fish at a market counter."),
          p("Huaca Pucllana", "culture", -12.1108, -77.0337, 5, 60, "Adobe pyramid older than the Incas."),
          p("Larco Museum", "culture", -12.0722, -77.0705, 12, 120, "Pre-Columbian gold and gardens."),
        ],
      },
      {
        id: "cusco",
        name: "Cusco",
        lat: -13.532,
        lng: -71.9675,
        lodging: 60,
        foodPerDay: 20,
        places: [
          p("Plaza de Armas", "sight", -13.5167, -71.9787, 0, 45, "Colonial arcades on Inca foundations."),
          p("Sacsayhuamán", "culture", -13.5094, -71.9817, 20, 120, "Zigzag walls of stones the size of vans."),
          p("San Pedro Market", "food", -13.5222, -71.985, 8, 60, "Fresh juices, soup stalls and twenty kinds of corn."),
          p("Rainbow Mountain", "hike", -13.87, -71.3029, 40, 600, "Striped peak at 5,200 m. Tough and unforgettable."),
          p("San Blas Workshops", "shop", -13.5155, -71.9752, 10, 75, "Artisans' quarter up steep cobbled lanes."),
          p("Qorikancha", "culture", -13.5199, -71.975, 6, 60, "The Inca sun temple under a convent."),
        ],
      },
      {
        id: "sacred-valley",
        name: "Sacred Valley",
        lat: -13.258,
        lng: -72.2632,
        lodging: 55,
        foodPerDay: 20,
        aliases: ["sacred valley", "ollantaytambo"],
        places: [
          p("Ollantaytambo Ruins", "culture", -13.2576, -72.2683, 20, 90, "Terraces climbing a mountainside fortress."),
          p("Pisac Ruins Hike", "hike", -13.4083, -71.8488, 20, 150, "Hike down through terraces to the market town."),
          p("Moray Terraces", "culture", -13.329, -72.1971, 15, 60, "Circular Inca crop laboratory."),
          p("Maras Salt Pans", "sight", -13.304, -72.155, 4, 60, "Thousands of white pools on a hillside."),
        ],
      },
      {
        id: "machu-picchu",
        name: "Machu Picchu",
        lat: -13.1547,
        lng: -72.5254,
        lodging: 90,
        foodPerDay: 30,
        aliases: ["machu picchu", "aguas calientes"],
        places: [
          p("Machu Picchu Citadel", "culture", -13.1631, -72.545, 62, 240, "The lost city in the clouds."),
          p("Huayna Picchu Climb", "hike", -13.1575, -72.5463, 75, 180, "The steep peak behind every famous photo."),
          p("Aguas Calientes Hot Springs", "relax", -13.153, -72.522, 8, 75, "Soak your legs after the climb."),
        ],
      },
    ],
  },
  {
    id: "iceland",
    name: "Iceland",
    aliases: ["iceland", "ring road", "reykjavik"],
    drive: true,
    route: ["reykjavik", "golden-circle", "vik", "jokulsarlon"],
    cities: [
      {
        id: "reykjavik",
        name: "Reykjavík",
        lat: 64.1466,
        lng: -21.9426,
        lodging: 150,
        foodPerDay: 45,
        aliases: ["reykjavik"],
        places: [
          p("Hallgrímskirkja", "sight", 64.1417, -21.9266, 10, 45, "Basalt-column church with a tower view."),
          p("Harpa Concert Hall", "culture", 64.1503, -21.9327, 0, 45, "Glass honeycomb on the harbor."),
          p("Sky Lagoon", "relax", 64.1157, -21.944, 80, 120, "Infinity pool on the edge of the ocean."),
          p("Harbor Hot Dog Stand", "food", 64.1483, -21.9399, 5, 15, "One with everything, the local way."),
          p("Grandi Food Hall", "food", 64.1567, -21.948, 25, 60, "Fish soup and lamb by the old harbor."),
          p("Laugavegur Evening", "night", 64.1446, -21.9265, 30, 120, "Main street bars in the midnight sun or under aurora."),
        ],
      },
      {
        id: "golden-circle",
        name: "Golden Circle",
        lat: 64.215,
        lng: -20.73,
        lodging: 140,
        foodPerDay: 40,
        aliases: ["golden circle"],
        places: [
          p("Þingvellir Rift Walk", "hike", 64.2559, -21.1299, 0, 120, "Walk between two tectonic plates."),
          p("Geysir", "sight", 64.3104, -20.3024, 0, 60, "Strokkur erupts every few minutes."),
          p("Gullfoss", "sight", 64.3271, -20.1199, 0, 60, "Two-step waterfall into a canyon."),
          p("Secret Lagoon", "relax", 64.1378, -20.3093, 25, 90, "Iceland's oldest natural pool."),
          p("Kerið Crater", "hike", 64.0413, -20.8853, 5, 45, "Red crater around a blue lake."),
        ],
      },
      {
        id: "vik",
        name: "Vík",
        lat: 63.4186,
        lng: -19.006,
        lodging: 160,
        foodPerDay: 40,
        aliases: ["vik"],
        places: [
          p("Seljalandsfoss", "sight", 63.6156, -19.9886, 0, 45, "Walk behind the waterfall. Bring a raincoat."),
          p("Skógafoss Trail", "hike", 63.5321, -19.5114, 0, 90, "Stairs up the falls, then a canyon trail."),
          p("Reynisfjara Beach", "sight", 63.4044, -19.044, 0, 60, "Black sand, basalt columns, wild waves."),
          p("Glacier Walk", "hike", 63.53, -19.37, 110, 180, "Crampons on blue ice with a guide."),
          p("Dyrhólaey Arch", "sight", 63.402, -19.13, 0, 45, "Sea arch and puffins in summer."),
        ],
      },
      {
        id: "jokulsarlon",
        name: "Jökulsárlón",
        lat: 64.0784,
        lng: -16.2306,
        lodging: 180,
        foodPerDay: 40,
        aliases: ["jokulsarlon", "glacier lagoon"],
        places: [
          p("Glacier Lagoon", "sight", 64.0784, -16.2306, 0, 75, "Icebergs drifting out to sea, seals between them."),
          p("Diamond Beach", "sight", 64.044, -16.178, 0, 45, "Ice chunks glittering on black sand."),
          p("Zodiac Boat Tour", "sight", 64.079, -16.228, 75, 75, "Weave up close to the glacier face."),
          p("Svartifoss Hike", "hike", 64.0275, -16.975, 0, 150, "Waterfall framed by dark basalt columns."),
        ],
      },
    ],
  },
  {
    id: "morocco",
    name: "Morocco",
    aliases: ["morocco", "maroc", "sahara"],
    busOnly: true,
    route: ["marrakech", "atlas", "merzouga", "fes"],
    cities: [
      {
        id: "marrakech",
        name: "Marrakech",
        lat: 31.6295,
        lng: -7.9811,
        lodging: 70,
        foodPerDay: 18,
        places: [
          p("Jemaa el-Fnaa", "night", 31.6258, -7.9891, 15, 120, "Storytellers, snail soup and smoke at sundown."),
          p("Jardin Majorelle", "sight", 31.6417, -8.0033, 16, 60, "Cobalt-blue villa in a cactus garden."),
          p("Bahia Palace", "culture", 31.6216, -7.9833, 8, 60, "Painted cedar ceilings and courtyards."),
          p("Souks of the Medina", "shop", 31.63, -7.987, 25, 120, "Lanterns, leather and haggling."),
          p("Hammam", "relax", 31.628, -7.99, 30, 90, "Steam, black soap and a serious scrub."),
          p("Le Jardin Secret", "relax", 31.631, -7.989, 9, 45, "Quiet riad garden in the busy medina."),
        ],
      },
      {
        id: "atlas",
        name: "Atlas Mountains",
        lat: 31.137,
        lng: -7.919,
        lodging: 60,
        foodPerDay: 15,
        aliases: ["atlas", "imlil", "toubkal"],
        places: [
          p("Toubkal Valley Hike", "hike", 31.1, -7.915, 0, 300, "Mule trails between Berber villages."),
          p("Berber Family Lunch", "food", 31.135, -7.92, 15, 75, "Tagine cooked on a rooftop."),
          p("Mint Tea with a View", "relax", 31.1328, -7.918, 5, 45, "Sweet tea poured from a height."),
        ],
      },
      {
        id: "merzouga",
        name: "Merzouga",
        lat: 31.0802,
        lng: -4.0133,
        lodging: 90,
        foodPerDay: 18,
        aliases: ["merzouga", "erg chebbi"],
        places: [
          p("Camel Trek into Erg Chebbi", "hike", 31.15, -3.98, 45, 180, "Ride the dunes as the sand turns orange."),
          p("Desert Camp Night", "night", 31.12, -3.97, 60, 240, "Drums, stars, and absolute silence."),
          p("Sandboarding", "sight", 31.14, -3.97, 15, 60, "Surf a 150-meter dune."),
        ],
      },
      {
        id: "fes",
        name: "Fes",
        lat: 34.0181,
        lng: -5.0078,
        lodging: 65,
        foodPerDay: 16,
        aliases: ["fes", "fez"],
        places: [
          p("Fes el-Bali Medina", "culture", 34.065, -4.975, 0, 180, "9,000 car-free alleys. Get gloriously lost."),
          p("Chouara Tannery", "sight", 34.0661, -4.9706, 3, 45, "Dye pits like a painter's palette."),
          p("Al-Attarine Madrasa", "culture", 34.0646, -4.9737, 3, 45, "Carved plaster and zellige tile."),
          p("Bou Inania Madrasa", "culture", 34.0619, -4.983, 3, 45, "Cedar, marble and a water clock."),
          p("Bab Boujloud Street Food", "food", 34.0617, -4.984, 8, 60, "Bissara soup and msemen from carts."),
        ],
      },
    ],
  },
  {
    id: "portugal",
    name: "Portugal",
    aliases: ["portugal", "portuguese"],
    route: ["lagos", "lisbon", "sintra", "porto"],
    cities: [
      {
        id: "lisbon",
        name: "Lisbon",
        lat: 38.7223,
        lng: -9.1393,
        lodging: 110,
        foodPerDay: 30,
        aliases: ["lisboa"],
        places: [
          p("Alfama & Santa Luzia", "sight", 38.7118, -9.1302, 0, 90, "Tiled terraces over red roofs and the river."),
          p("Belém Tower", "culture", 38.6916, -9.216, 8, 60, "Lace-stone fort where explorers set sail."),
          p("Pastéis de Belém", "food", 38.6975, -9.2032, 6, 30, "The original custard tart, warm and cinnamon-dusted."),
          p("Jerónimos Monastery", "culture", 38.6979, -9.2068, 12, 75, "Manueline cloisters carved like coral."),
          p("Time Out Market", "food", 38.7069, -9.1459, 25, 75, "The city's best chefs under one roof."),
          p("Bairro Alto", "night", 38.7136, -9.1453, 25, 150, "Street-party bar hopping until late."),
          p("LX Factory", "shop", 38.7033, -9.1786, 15, 90, "Bookshops and studios in an old mill."),
          p("Fado Night", "night", 38.711, -9.129, 35, 120, "Mournful songs in a candlelit tavern."),
        ],
      },
      {
        id: "sintra",
        name: "Sintra",
        lat: 38.7979,
        lng: -9.3877,
        lodging: 120,
        foodPerDay: 30,
        places: [
          p("Pena Palace", "culture", 38.7876, -9.3906, 20, 120, "A candy-colored castle on a misty peak."),
          p("Quinta da Regaleira", "culture", 38.7963, -9.3961, 15, 90, "Spiral initiation well and secret tunnels."),
          p("Moorish Castle Walls", "hike", 38.7924, -9.3893, 12, 75, "Ramparts snaking across the ridge."),
          p("Cabo da Roca", "sight", 38.7804, -9.4989, 0, 45, "Europe's westernmost point."),
          p("Travesseiro Pastries", "food", 38.7977, -9.3906, 4, 20, "Almond-cream pillows of puff pastry."),
        ],
      },
      {
        id: "porto",
        name: "Porto",
        lat: 41.1579,
        lng: -8.6291,
        lodging: 95,
        foodPerDay: 28,
        places: [
          p("Ribeira", "sight", 41.1406, -8.6132, 0, 60, "Stacked houses on the Douro waterfront."),
          p("Livraria Lello", "culture", 41.1469, -8.6149, 10, 30, "A carved staircase in a storybook shop."),
          p("Port Lodges in Gaia", "food", 41.1372, -8.6136, 25, 90, "Cellar tour and a tawny tasting."),
          p("Francesinha Lunch", "food", 41.149, -8.61, 15, 60, "Porto's gloriously excessive sandwich."),
          p("Dom Luís I Bridge", "hike", 41.1399, -8.6094, 0, 45, "Walk the top deck for the view."),
          p("Douro Six Bridges Cruise", "sight", 41.14, -8.612, 18, 60, "Rabelo boat under all six bridges."),
        ],
      },
      {
        id: "lagos",
        name: "Lagos",
        lat: 37.1028,
        lng: -8.673,
        lodging: 100,
        foodPerDay: 28,
        aliases: ["algarve"],
        places: [
          p("Ponta da Piedade", "sight", 37.0809, -8.6693, 0, 60, "Golden sea stacks and grottoes."),
          p("Seven Hanging Valleys Trail", "hike", 37.088, -8.42, 0, 180, "Clifftop trail along the Algarve's best coast."),
          p("Benagil Cave Boat", "sight", 37.087, -8.426, 30, 75, "Sea cave with a hole in the roof."),
          p("Praia Dona Ana", "relax", 37.0915, -8.6705, 0, 180, "A cove beach made for doing nothing."),
        ],
      },
    ],
  },
  {
    id: "mexico",
    name: "Mexico",
    aliases: ["mexico", "méxico", "mexican"],
    flightAbove: 350,
    route: ["cdmx", "oaxaca", "tulum"],
    cities: [
      {
        id: "cdmx",
        name: "Mexico City",
        lat: 19.4326,
        lng: -99.1332,
        lodging: 80,
        foodPerDay: 18,
        aliases: ["mexico city", "cdmx"],
        places: [
          p("Templo Mayor & Zócalo", "culture", 19.4352, -99.1314, 5, 90, "Aztec temple ruins beside the cathedral."),
          p("Museo de Antropología", "culture", 19.426, -99.1863, 6, 150, "The Aztec sun stone and so much more."),
          p("Frida Kahlo Museum", "culture", 19.3551, -99.1625, 15, 75, "The cobalt Casa Azul in Coyoacán."),
          p("Xochimilco Trajinera", "sight", 19.2572, -99.103, 30, 150, "Painted boats, mariachis, floating snacks."),
          p("Roma Norte Taco Crawl", "food", 19.415, -99.162, 15, 120, "Al pastor sliced straight off the trompo."),
          p("Teotihuacan Pyramids", "hike", 19.6925, -98.8438, 5, 240, "Climb the Pyramid of the Sun."),
          p("Bosque de Chapultepec", "relax", 19.4204, -99.1817, 0, 90, "A castle in a giant park."),
          p("Mezcal Bar in Condesa", "night", 19.412, -99.173, 25, 120, "Smoky mezcal with orange and chili salt."),
        ],
      },
      {
        id: "oaxaca",
        name: "Oaxaca",
        lat: 17.0732,
        lng: -96.7266,
        lodging: 60,
        foodPerDay: 16,
        places: [
          p("Monte Albán", "culture", 17.0436, -96.7678, 5, 150, "Zapotec city on a flattened mountaintop."),
          p("Mercado 20 de Noviembre", "food", 17.0587, -96.7262, 10, 60, "The smoke-filled grill hall of tasajo."),
          p("Hierve el Agua", "hike", 16.8656, -96.276, 5, 240, "Petrified waterfalls and cliff-edge pools."),
          p("Santo Domingo", "culture", 17.0657, -96.7234, 4, 60, "Gold-leaf church and a cactus garden."),
          p("Mezcal Distillery Visit", "food", 16.865, -96.382, 20, 120, "Watch agave roast in an earth pit."),
        ],
      },
      {
        id: "tulum",
        name: "Tulum",
        lat: 20.2114,
        lng: -87.4654,
        lodging: 120,
        foodPerDay: 25,
        places: [
          p("Tulum Ruins", "culture", 20.2149, -87.4291, 6, 90, "Maya temple on a turquoise cliff."),
          p("Gran Cenote", "relax", 20.2465, -87.4642, 25, 90, "Snorkel crystal water with turtles."),
          p("Beach Afternoon", "relax", 20.199, -87.45, 0, 180, "White sand and a hammock."),
          p("Cobá Pyramid", "hike", 20.495, -87.736, 5, 180, "Bike the jungle to a climbable pyramid."),
        ],
      },
    ],
  },
  {
    id: "thailand",
    name: "Thailand",
    aliases: ["thailand", "thai", "siam"],
    flightAbove: 400,
    route: ["bangkok", "chiang-mai", "krabi"],
    cities: [
      {
        id: "bangkok",
        name: "Bangkok",
        lat: 13.7563,
        lng: 100.5018,
        lodging: 60,
        foodPerDay: 14,
        places: [
          p("Grand Palace", "culture", 13.75, 100.4913, 15, 120, "Glittering spires and the Emerald Buddha."),
          p("Wat Pho", "culture", 13.7465, 100.4927, 8, 60, "A 46-meter reclining Buddha."),
          p("Wat Arun", "sight", 13.7437, 100.4889, 3, 45, "Porcelain-studded tower by the river."),
          p("Yaowarat Street Food", "food", 13.74, 100.509, 12, 120, "Chinatown's neon noodle night."),
          p("Chatuchak Market", "shop", 13.7999, 100.55, 15, 150, "15,000 stalls of everything."),
          p("Rooftop Bar", "night", 13.721, 100.517, 25, 90, "Cocktails sixty floors above the traffic."),
          p("Lumphini Park", "relax", 13.7314, 100.5414, 0, 60, "Monitor lizards and morning tai chi."),
        ],
      },
      {
        id: "chiang-mai",
        name: "Chiang Mai",
        lat: 18.7883,
        lng: 98.9853,
        lodging: 40,
        foodPerDay: 12,
        aliases: ["chiang mai"],
        places: [
          p("Doi Suthep Monk's Trail", "hike", 18.8048, 98.9216, 1, 150, "Jungle path up to a golden temple."),
          p("Wat Chedi Luang", "culture", 18.7869, 98.9865, 1, 60, "Crumbling brick giant in the old city."),
          p("Night Bazaar", "night", 18.785, 99.0, 10, 120, "Khao soi, crafts and live music."),
          p("Thai Cooking Class", "food", 18.79, 98.98, 30, 240, "Market shop, then cook five dishes."),
          p("Elephant Nature Park", "sight", 19.215, 98.858, 70, 420, "Ethical sanctuary for rescued elephants."),
        ],
      },
      {
        id: "krabi",
        name: "Krabi",
        lat: 8.03,
        lng: 98.8236,
        lodging: 55,
        foodPerDay: 15,
        aliases: ["ao nang", "railay"],
        places: [
          p("Railay Beach", "relax", 8.011, 98.838, 4, 180, "Limestone cliffs, boat-only beach."),
          p("Four Islands Boat Trip", "sight", 7.99, 98.8, 25, 300, "Long-tail boat between snorkel spots."),
          p("Tiger Cave Temple", "hike", 8.124, 98.925, 0, 150, "1,260 steps to a summit Buddha."),
          p("Emerald Pool", "relax", 7.925, 99.268, 6, 120, "Jungle hot spring in jade water."),
          p("Ao Nang Night Market", "food", 8.033, 98.822, 10, 75, "Grilled squid and mango sticky rice."),
        ],
      },
    ],
  },
];

const hasWord = (text: string, word: string) =>
  new RegExp(`(^|[^\\p{L}])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "u").test(text);

export function findCountry(text: string) {
  const t = text.toLowerCase();
  return COUNTRIES.find((c) => c.aliases.some((a) => hasWord(t, a)));
}

export function findCity(text: string) {
  const t = text.toLowerCase();
  for (const country of COUNTRIES) {
    for (const city of country.cities) {
      const names = [city.name.toLowerCase(), city.id.replace("-", " "), ...(city.aliases ?? [])];
      if (names.some((n) => hasWord(t, n))) return { country, city };
    }
  }
  return undefined;
}

export const SUGGESTED_TRIPS = [
  { code: "JPN", dest: "TOKYO KYOTO", time: "10D", label: "10 days in Japan in April, I love food and hiking, budget 2000 dollars" },
  { code: "ITA", dest: "ROME VENICE", time: "7D", label: "A week in Italy in June for art, pasta and coastal walks, $2500" },
  { code: "PER", dest: "CUSCO", time: "8D", label: "8 days in Peru, Machu Picchu and markets, budget $1500" },
  { code: "ISL", dest: "RING ROAD", time: "6D", label: "6 day road trip in Iceland in September, waterfalls and hot springs, $2200" },
  { code: "MAR", dest: "MARRAKECH", time: "7D", label: "Morocco for 7 days, desert, souks and mountains, $1200" },
  { code: "THA", dest: "BANGKOK", time: "9D", label: "9 days in Thailand, street food, beaches and temples, $1100" },
];
