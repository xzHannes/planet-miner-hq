// ============================================================
// PLANET MINER DEV HQ – ALL DATA
// Bearbeite diese Datei um Inhalte zu aendern.
// ============================================================

// --- LOGIN CREDENTIALS ---
// Passwort-Hashes (SHA-256). Zum Aendern: neuen Hash generieren
// via Browser-Konsole: crypto.subtle.digest('SHA-256', new TextEncoder().encode('DEIN_PASSWORT')).then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
const USERS = {
  hannes: {
    hash: "fbf32482732a420c27dd56fd83ddd42953a26f721478be25d9e4a86eeda91f2a",
    display: "Hannes",
    color: "assignee-hannes",
    initial: "H",
  },
  lamar: {
    hash: "fbf32482732a420c27dd56fd83ddd42953a26f721478be25d9e4a86eeda91f2a",
    display: "Lamar",
    color: "assignee-kumpel",
    initial: "L",
  },
};

// --- GAME INFO ---
const GAME_INFO = {
  title: "Planet Miner",
  subtitle: "Mine. Upgrade. Explore the Universe.",
};

// --- TABS ---
const TABS = [
  { id: "vision",     label: "Vision",         icon: "\uD83C\uDF0C" },
  { id: "tickets",    label: "Tickets",        icon: "\uD83C\uDFAB" },
  { id: "systeme",    label: "Systeme",        icon: "\u2699\uFE0F" },
  { id: "wirtschaft", label: "Wirtschaft",     icon: "\uD83D\uDCB0" },
  { id: "roadmap",    label: "Roadmap",        icon: "\uD83D\uDE80" },
  { id: "reise",      label: "Spielerreise",   icon: "\uD83C\uDFAE" },
];

// ============================================================
// TICKETS
// Status: "backlog" | "progress" | "done"
// Priority: "critical" | "high" | "medium" | "low"
// Assignee: username key from USERS or null
// Tags: array of tag keys (mining, pickaxe, ui, audio, world, system, shop, multiplayer, bug, feature, polish)
// ============================================================
const TICKETS = [
  // --- IN PROGRESS ---
  {
    id: "PM-001",
    title: "Pickaxe-Animationen fixen",
    desc: "Die 3 Test-Pickaxes haben aktuell sehr verbugte Animationen. Swing- und Hit-Animationen muessen sauber laufen und mit dem Mining-Timing synchronisiert werden.",
    status: "progress",
    priority: "critical",
    assignee: "hannes",
    tags: ["pickaxe", "bug"],
    created: "2026-03-16",
  },
  {
    id: "PM-002",
    title: "Importierte 3D-Modelle korrekt einbauen",
    desc: "Die aus dem Unity Asset Store importierten Pickaxe-Modelle sind jetzt korrekt eingebaut. Skalierung (0.07x), Motor6D-Weld an RightHand, CFrame-Rotation fixiert. Base-Pickaxe-Konflikt mit MiningClient geloest.",
    status: "done",
    priority: "critical",
    assignee: "hannes",
    tags: ["pickaxe", "bug"],
    created: "2026-03-16",
    completed: "2026-03-16",
  },

  // --- BACKLOG: Kurzfristig ---
  {
    id: "PM-003",
    title: "Erz-Groessen-System implementieren",
    desc: "3 Groessen pro Erz-Typ: klein, mittel, gross. Groessere Erze = laengere Abbauzeit + mehr Drops. Basis fuer die gesamte Mining-Progression.",
    status: "backlog",
    priority: "high",
    assignee: null,
    tags: ["mining", "feature"],
    created: "2026-03-16",
  },
  {
    id: "PM-004",
    title: "Level-/Progressions-System mit Zielen",
    desc: "Spieler muessen Ziele erreichen um aufzuleveln (z.B. 'Baue 100 Stein ab'). Hoeheres Level = laengerer Progress. Levelup schaltet naechsten Planeten frei.",
    status: "backlog",
    priority: "high",
    assignee: null,
    tags: ["system", "feature"],
    created: "2026-03-16",
  },
  {
    id: "PM-005",
    title: "Schadenszahlen-Anzeige an Erzen",
    desc: "Schadenszahlen poppen beim Abbauen ueber dem Erz auf. Zahlen erhoehen sich mit Upgrades.",
    status: "done",
    priority: "high",
    assignee: "hannes",
    tags: ["mining", "ui", "polish"],
    created: "2026-03-16",
    completed: "2026-03-16",
  },
  {
    id: "PM-006",
    title: "Hitsounds + Schwung-Sounds",
    desc: "Sound-Feedback beim Mining: Schwung-Sound beim Pickaxe-Swing, Hit-Sound beim Treffer, verschiedene Sounds je nach Erz-Typ.",
    status: "backlog",
    priority: "high",
    assignee: null,
    tags: ["audio", "polish"],
    created: "2026-03-16",
  },
  {
    id: "PM-007",
    title: "Sprint-Mechanik",
    desc: "Spieler koennen sprinten fuer cleanes, schnelles Movement auf den Planeten.",
    status: "done",
    priority: "medium",
    assignee: "hannes",
    tags: ["system", "feature"],
    created: "2026-03-16",
    completed: "2026-03-16",
  },
  {
    id: "PM-008",
    title: "Balance-Config Modul",
    desc: "Zentrale Config (300 Zeilen) mit allen Balance-Werten: 3 Sonnensysteme, 21 Planeten, 21 Erz-Typen, 6 Upgrades, Level-Kosten, Helper-Funktionen. Alles zentral anpassbar.",
    status: "done",
    priority: "high",
    assignee: "hannes",
    tags: ["system", "feature"],
    created: "2026-03-16",
    completed: "2026-03-16",
  },

  // --- BACKLOG: Mittelfristig ---
  {
    id: "PM-009",
    title: "Alle 7 Planeten fuer Sonnensystem 1 gestalten",
    desc: "7 Planeten mit progressiver Groessensteigerung. Jeder Planet hat eigenen Erz-Typ und eigenes visuelles Theme. Assets aus Unity Pack verwenden.",
    status: "backlog",
    priority: "medium",
    assignee: null,
    tags: ["world", "feature"],
    created: "2026-03-16",
  },
  {
    id: "PM-010",
    title: "Shop-UI: Materialien verkaufen + Upgrades kaufen",
    desc: "Shop-System komplett: Sell-Board fuer Materialien, Upgrade-Shop mit 6 Kategorien (Damage, Speed, Boots, Jump, Coins, Luck), Pickaxe-Shop. Proximity + Click-to-open. Auto-close Bug gefixt.",
    status: "done",
    priority: "medium",
    assignee: "hannes",
    tags: ["shop", "ui", "feature"],
    created: "2026-03-16",
    completed: "2026-03-16",
  },
  {
    id: "PM-011",
    title: "Leaderboard-UI (mehrere Kategorien)",
    desc: "3 Leaderboards im Hub: Power Level (orange), Top Levels (lila), Top Balance (gold). Server-seitig sortiert, Live-Updates alle 10 Sekunden.",
    status: "done",
    priority: "medium",
    assignee: "hannes",
    tags: ["ui", "feature"],
    created: "2026-03-16",
    completed: "2026-03-16",
  },
  {
    id: "PM-012",
    title: "Hub als Raumschiff gestalten",
    desc: "Den Hub visuell als Raumschiff gestalten. Dort befinden sich Shops, Leaderboards. Socializing-Spot zwischen Sonnensystemen.",
    status: "backlog",
    priority: "medium",
    assignee: null,
    tags: ["world", "feature"],
    created: "2026-03-16",
  },
  {
    id: "PM-013",
    title: "Sonnensystem-Template-System",
    desc: "Template zum schnellen Hinzufuegen neuer Sonnensysteme mit groesseren Planeten und schwereren Erzen. Endlos skalierbar.",
    status: "backlog",
    priority: "medium",
    assignee: null,
    tags: ["system", "feature"],
    created: "2026-03-16",
  },
  {
    id: "PM-014",
    title: "Multiplayer: Spielerlimit pro Planet",
    desc: "Begrenzung der Spieler pro Planet (z.B. Planet 1: 5, Planet 2: 6, etc.) damit Maps nicht ueberlastet werden.",
    status: "backlog",
    priority: "medium",
    assignee: null,
    tags: ["multiplayer", "system"],
    created: "2026-03-16",
  },
  {
    id: "PM-015",
    title: "Taegliche Aufgaben System",
    desc: "Daily Quests die zum Wiederkommen animieren. Z.B. 'Baue heute 500 Erze ab' fuer Bonus-Belohnungen.",
    status: "backlog",
    priority: "medium",
    assignee: null,
    tags: ["system", "feature"],
    created: "2026-03-16",
  },

  // --- BACKLOG: Langfristig ---
  {
    id: "PM-016",
    title: "Cashshop (Robux) – Spezial-Pickaxes",
    desc: "Premium-Shop mit Robux-Waehrung. Spezielle Pickaxes (kosmetisch oder mit Bonus-Stats). Pay2Progress, nicht Pay2Win.",
    status: "backlog",
    priority: "low",
    assignee: null,
    tags: ["shop", "feature"],
    created: "2026-03-16",
  },
  {
    id: "PM-017",
    title: "Pet-System",
    desc: "Pets die dem Spieler folgen. Koennen im Cashshop oder durch Achievements freigeschaltet werden.",
    status: "backlog",
    priority: "low",
    assignee: null,
    tags: ["system", "feature"],
    created: "2026-03-16",
  },
  {
    id: "PM-018",
    title: "Lokalisierung (weitere Sprachen)",
    desc: "Spiel auf Englisch ist Basis. Weitere Sprachen hinzufuegen um globale Roblox-Community anzusprechen.",
    status: "backlog",
    priority: "low",
    assignee: null,
    tags: ["system", "feature"],
    created: "2026-03-16",
  },
  {
    id: "PM-019",
    title: "Sonnensystem 2 + 3 erstellen",
    desc: "Neue Sonnensysteme mit noch groesseren Planeten und haerteren Erzen. Verwendung des Template-Systems.",
    status: "backlog",
    priority: "low",
    assignee: null,
    tags: ["world", "feature"],
    created: "2026-03-16",
  },
  {
    id: "PM-020",
    title: "Absurde Planeten-Skalierung im Endgame",
    desc: "Der uebertriebene Aspekt: Endgame-Planeten werden absurd riesig. Das ist der 'wow'-Faktor wie bei den riesigen Fischen im Fishing Game.",
    status: "backlog",
    priority: "low",
    assignee: null,
    tags: ["world", "polish"],
    created: "2026-03-16",
  },

  // --- DONE ---
  {
    id: "PM-100",
    title: "Planeten-Lauf-Mechanik (Mario Galaxy)",
    desc: "Spieler koennen um sphaerische Planeten herumlaufen. Das Kern-USP des Spiels.",
    status: "done",
    priority: "critical",
    assignee: "hannes",
    tags: ["system", "feature"],
    created: "2025-01-01",
    completed: "2025",
  },
  {
    id: "PM-101",
    title: "Mining-System Grundgeruest",
    desc: "Client- und Server-seitiges Mining mit RemoteEvents (MineNode, MaterialGiven, NodeRespawned).",
    status: "done",
    priority: "critical",
    assignee: "hannes",
    tags: ["mining", "feature"],
    created: "2025-01-01",
    completed: "2025",
  },
  {
    id: "PM-102",
    title: "3 Sonnensystem-Folder + Hub-Model",
    desc: "Workspace-Struktur mit Sonnensystem1/2/3 Foldern und Hub Model.",
    status: "done",
    priority: "high",
    assignee: "hannes",
    tags: ["world"],
    created: "2025-01-01",
    completed: "2025",
  },
  {
    id: "PM-103",
    title: "Shop & Leaderboard Grundgeruest",
    desc: "Server- und Client-Scripts fuer Shop-System und Leaderboards.",
    status: "done",
    priority: "high",
    assignee: "hannes",
    tags: ["shop", "ui"],
    created: "2025-01-01",
    completed: "2025",
  },
  {
    id: "PM-104",
    title: "Pickaxe-System + 3 Test-Pickaxes",
    desc: "PickaxeServer, PickaxeClient, PickaxeBuffs Modul. 3 Test-Pickaxes eingebaut.",
    status: "done",
    priority: "high",
    assignee: "hannes",
    tags: ["pickaxe", "feature"],
    created: "2025-01-01",
    completed: "2025",
  },
  {
    id: "PM-105",
    title: "DataService + Dimension Portals",
    desc: "Datenpersistenz und Portal-System zwischen Dimensionen/Sonnensystemen.",
    status: "done",
    priority: "high",
    assignee: "hannes",
    tags: ["system"],
    created: "2025-01-01",
    completed: "2025",
  },
  {
    id: "PM-106",
    title: "3D-Modelle + Texturen importiert",
    desc: "Mining Asset Packs aus Unity Store importiert: Erz-Modelle, Pickaxe-Modelle, Texturen.",
    status: "done",
    priority: "medium",
    assignee: "hannes",
    tags: ["world"],
    created: "2025-01-01",
    completed: "2025",
  },
  {
    id: "PM-107",
    title: "Controller-Module (Camera, Anim, Planet)",
    desc: "CameraController, AnimController, PlanetController als separate Module.",
    status: "done",
    priority: "high",
    assignee: "hannes",
    tags: ["system"],
    created: "2025-01-01",
    completed: "2025",
  },
  {
    id: "PM-108",
    title: "Health Manager + OreTemplates",
    desc: "HealthManager Script und OreTemplates Folder eingerichtet.",
    status: "done",
    priority: "medium",
    assignee: "hannes",
    tags: ["mining", "system"],
    created: "2025-01-01",
    completed: "2025",
  },
];

// ============================================================
// VISION
// ============================================================
const VISION = {
  pitch: {
    title: "Planet Miner \u2013 Space Mining Tycoon",
    description: "Laufe um kugelfoermige Planeten wie in Mario Galaxy. Baue Erze ab, upgrade deine Pickaxe, schalte neue Welten frei. Grinde dich durch Sonnensysteme \u2013 allein oder mit Freunden.",
    quote: "\"Walk on planets. Mine everything. Become legendary.\"",
  },
  coreFeeling: {
    title: "Das Kern-Erlebnis",
    subtitle: "Was soll ein Spieler fuehlen?",
    items: [
      { icon: "\uD83E\uDD29", label: "Satisfying",  desc: "Jeder Hit fuehlt sich gut an" },
      { icon: "\uD83C\uDFAF", label: "Ziele",       desc: "Immer das naechste Level im Blick" },
      { icon: "\uD83D\uDCAA", label: "Power",       desc: "Spuerbar staerker werden" },
      { icon: "\uD83C\uDF0D", label: "Erkundung",   desc: "Neue Planeten entdecken" },
    ],
  },
  usp: {
    title: "Alleinstellungsmerkmale",
    points: [
      { icon: "\uD83C\uDF0F", title: "Planeten-Laufen", desc: "Spieler laufen um sphaerische Planeten \u2013 wie Mario Galaxy. Unser Markenzeichen fuer ALLE zukuenftigen Spiele." },
      { icon: "\uD83D\uDCC8", title: "Absurde Skalierung", desc: "Planeten werden progressiv riesig. Endgame-Planeten sind absurd gross \u2013 der uebertriebene Aspekt, den Roblox-Spieler lieben." },
      { icon: "\uD83C\uDFB5", title: "Juice & Dopamin", desc: "Schadenszahlen, Hitsounds, Schwung-Sounds, Screen-Shake \u2013 maximales Feedback bei jedem Schlag." },
    ],
  },
  multiplayer: {
    title: "Solo vs Multiplayer",
    solo:  { icon: "\uD83D\uDC64", label: "Solo-Spieler",  desc: "Alleine grinden, eigenes Tempo, voller Fokus." },
    multi: { icon: "\uD83D\uDC65", label: "Mit Freunden",  desc: "Zusammen auf Planeten abbauen, im Hub abhaengen, Leaderboards vergleichen." },
  },
};

// ============================================================
// SYSTEME
// ============================================================
const SYSTEME = [
  {
    icon: "\u26CF\uFE0F",
    iconClass: "mining",
    title: "Mining-System",
    desc: "Kern-Gameplay: Erze abbauen auf Planeten",
    details: [
      "3 Erz-Groessen pro Typ (klein, mittel, gross)",
      "Groesser = laengere Abbauzeit + mehr Drops",
      "Hoehere Planeten = haertere Erze",
      "Visuelles Feedback: Schadenszahlen, Partikel, Sounds",
      "RemoteEvents: MineNode, MaterialGiven, NodeRespawned",
    ],
  },
  {
    icon: "\uD83E\uDE93",
    iconClass: "pickaxe",
    title: "Pickaxe-System",
    desc: "Werkzeuge mit Upgrades und Buffs",
    details: [
      "Verschiedene Pickaxes mit unterschiedlichen Stats",
      "Upgrade-Pfade: Mehr Schaden, mehr Drops",
      "Spezial-Pickaxes im Cashshop (Robux)",
      "PickaxeBuffs Modul fuer Stat-Berechnung",
      "Animationen fuer Schwing- und Hit-Effekte",
    ],
  },
  {
    icon: "\uD83C\uDF0D",
    iconClass: "planet",
    title: "Planeten-System",
    desc: "Progression durch immer groessere Welten",
    details: [
      "7 Planeten pro Sonnensystem",
      "Progressive Groessensteigerung",
      "Jeder Planet hat eigenen Erz-Typ",
      "Spielerlimit pro Planet (5-10 Spieler)",
      "Freischaltung durch Level-System",
    ],
  },
  {
    icon: "\u2600\uFE0F",
    iconClass: "solar",
    title: "Sonnensystem-Progression",
    desc: "Uebergeordnete Progression mit Portalen",
    details: [
      "Mehrere Sonnensysteme (aktuell 3 angelegt)",
      "Template-System fuer schnelles Hinzufuegen",
      "Dimension Portals zum Reisen",
      "Jedes System schwerer als das vorherige",
      "Endlos erweiterbar bei Bedarf",
    ],
  },
  {
    icon: "\uD83D\uDE80",
    iconClass: "hub",
    title: "Hub / Raumschiff",
    desc: "Zentraler Hangout zwischen Sonnensystemen",
    details: [
      "Socializing & Hangout Spot",
      "Shop-System: Materialien verkaufen",
      "Upgrade-Shop: Pickaxe & Player Upgrades",
      "Mehrere Leaderboards",
      "Cashshop (Robux)",
    ],
  },
  {
    icon: "\uD83D\uDCBE",
    iconClass: "data",
    title: "Daten & Persistence",
    desc: "Speicherung von Spielerfortschritt",
    details: [
      "DataService Modul auf Server",
      "Spielerdaten: Level, Inventar, Waehrung",
      "Leaderboard-Daten",
      "Taegliche Aufgaben Tracking",
    ],
  },
];

// ============================================================
// WIRTSCHAFT
// ============================================================
const WIRTSCHAFT = {
  currency: {
    title: "Waehrungs-System",
    items: [
      { icon: "\uD83E\uDE99", name: "Mineralien",        desc: "Hauptwaehrung \u2013 durch Erz-Verkauf im Shop verdient" },
      { icon: "\uD83D\uDCB5", name: "Robux (Echtgeld)",  desc: "Premium-Waehrung fuer Cashshop-Items" },
    ],
  },
  shops: {
    title: "Shop-Systeme",
    items: [
      { icon: "\uD83C\uDFEA", name: "Material-Shop",    desc: "Abgebaute Erze verkaufen fuer Mineralien" },
      { icon: "\u2B06\uFE0F",  name: "Upgrade-Shop",     desc: "Pickaxe-Damage, Drop-Rate, Player-Buffs" },
      { icon: "\uD83D\uDC8E", name: "Cashshop (Robux)", desc: "Premium-Pickaxes, Pets, Kosmetik" },
    ],
  },
  balance: {
    title: "Balance-Prinzipien",
    points: [
      "Alle Werte zentral in Config \u2013 jederzeit anpassbar",
      "Exponentielle Kurven: Spaetere Level dauern deutlich laenger",
      "Free-to-Play muss alles erreichen koennen (Pay2Progress, nicht Pay2Win)",
      "Cashshop-Items duerfen Vorteil geben, aber nicht zwingend sein",
    ],
  },
};

// ============================================================
// ROADMAP
// ============================================================
const ROADMAP = [
  {
    phase: "Phase 1 \u2013 Foundation",
    icon: "\uD83C\uDFD7\uFE0F",
    status: "in-progress",
    items: [
      "Core Mining Loop perfektionieren",
      "Pickaxe-Animationen fixen",
      "Sound-Design (Hit, Swing, Ambient)",
      "Balance-Config System",
      "Erz-Groessen implementieren",
      "Level-System mit Zielen",
    ],
  },
  {
    phase: "Phase 2 \u2013 Content",
    icon: "\uD83C\uDF0D",
    status: "planned",
    items: [
      "Alle 7 Planeten fuer Sonnensystem 1",
      "Erz-Typen & Texturen pro Planet",
      "Hub/Raumschiff gestalten",
      "Shop-UI komplett",
      "Leaderboard-UI (mehrere Kategorien)",
      "Weltengestaltung mit Asset-Pack",
    ],
  },
  {
    phase: "Phase 3 \u2013 Polish & Multiplayer",
    icon: "\u2728",
    status: "planned",
    items: [
      "Multiplayer: Spielerlimit pro Planet",
      "Taegliche Aufgaben",
      "Schadenszahlen & Screen-Shake",
      "Sonnensystem-Template-System",
    ],
  },
  {
    phase: "Phase 4 \u2013 Monetarisierung & Launch",
    icon: "\uD83D\uDCB0",
    status: "planned",
    items: [
      "Cashshop mit Robux",
      "Premium-Pickaxes",
      "Sonnensystem 2 & 3",
      "Marketing & Community",
    ],
  },
  {
    phase: "Phase 5 \u2013 Post-Launch",
    icon: "\uD83D\uDE80",
    status: "planned",
    items: [
      "Pet-System",
      "Lokalisierung (weitere Sprachen)",
      "Weitere Sonnensysteme nach Bedarf",
      "Events & saisonale Inhalte",
      "Zweites Spiel mit Planeten-Prinzip",
    ],
  },
];

// ============================================================
// SPIELERREISE
// ============================================================
const SPIELERREISE = {
  title: "Die Spielerreise",
  subtitle: "Was erlebt ein neuer Spieler von Minute 1 bis Endgame?",
  steps: [
    { time: "0\u20132 Min",   icon: "\uD83C\uDF1F", title: "Erster Kontakt",     desc: "Spawn auf Planet 1. Kleiner Planet, Stein ueberall. Tutorial zeigt: Klick = Abbauen. Sofort Drops & Feedback." },
    { time: "2\u201310 Min",  icon: "\u26CF\uFE0F",  title: "Erster Grind",       desc: "3 Stein-Groessen entdecken. Ziele erscheinen: 'Baue 50 Stein ab'. Erste Waehrung verdienen." },
    { time: "10\u201330 Min", icon: "\u2B06\uFE0F",  title: "Erster Upgrade",     desc: "Zum Hub fliegen. Materialien verkaufen. Erste Pickaxe-Upgrades kaufen. Unterschied spueren!" },
    { time: "30\u201360 Min", icon: "\uD83C\uDF1D",  title: "Planet 2",           desc: "Level 2 erreicht! Groesserer Planet, Kupfererz. Neue Farben, haertere Erze, mehr Drops." },
    { time: "1\u20135 Std",   icon: "\uD83C\uDF0D",  title: "Sonnensystem 1",     desc: "Planet fuer Planet durcharbeiten. Immer groesser, immer cooler. Leaderboard-Rankings steigen." },
    { time: "5+ Std",         icon: "\u2600\uFE0F",  title: "Neues Sonnensystem", desc: "Sonnensystem 2 freigeschaltet! Alles wird nochmal groesser und epischer." },
    { time: "Endgame",        icon: "\uD83C\uDF0C",  title: "Legende",            desc: "Top-Leaderboards, absurd grosse Planeten, beste Pickaxes. Taeglich wiederkommen fuer Daily Quests." },
  ],
};
