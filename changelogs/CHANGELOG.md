# Planet Miner — Changelog

Alle abgeschlossenen Features, Fixes und Änderungen.

## Format
```
## [YYYY-MM-DD] — [Titel]
- **Feature:** [Beschreibung]
- **Fix:** [Beschreibung]
- **Polish:** [Beschreibung]
- **Docs:** [Beschreibung]
```

## Changelog

### 2026-04-09 — Nav Trail System, Damage Numbers, Loot Fly-In, Dashboard Polish

**Nav-Button & Trail (PlanetGame_Main + OrePathClient):**
- **Fix:** Forward-Reference Bugs (togglePlanetMenu, planetBtnData, wtStroke, worldToggle)
- **Feature:** Persistentes Nav-Highlight: Gold-Border + Bouncing Arrow auf Ziel-Planet
- **Feature:** Globe-Hint bei geschlossenem Menü (Arrow + Gold-Border auf Globe-Button)
- **Feature:** Nav-State bleibt nach Teleport erhalten (restoreNavState)
- **Feature:** Trail: Dynamische Dot-Anzahl (konstantes 3.5 Stud Spacing), smooth Seitwärtsbewegung
- **Feature:** Trail: Rainbow-Glow Pulse Wave (Player→Ore, subtil, Galaxy-Style)
- **Fix:** Trail: Dot-Pool (kein Flimmern), smoothed playerDir (Idle-Animation-Filter)
- **Polish:** Idle-Pulse-Animationen von Nav + Globe Button entfernt
- **Polish:** OrePathClient pulseGlobe deaktiviert (PlanetGame_Main übernimmt)

**Damage Numbers (MiningClient + NotificationClient):**
- **Feature:** DamagePop Server→Client Event verbunden — Damage Numbers wieder sichtbar
- **Polish:** Weiß statt rot, 2 Dezimalen (string.format %.2f), größer (28px), Pop-Animation
- **Fix:** Hit-Position am Ore-Rand (Richtung Spieler) statt Ore-Mitte

**Loot Drop Popup (NotificationClient):**
- **Feature:** Material-Pickup fliegt in Bezier-Bogen zum Avatar (Inventar) oder XP-Bar (Progress)
- **Feature:** Bouncy Pop-in am Ore, Hold, Schwung-Arc mit zufälliger Kurve, Avatar-Bounce bei Landing
- **Fix:** GuiInset-Kompensation für exakte Zielposition
- **Fix:** Spread (±50px) um Ore für individuelle Flugbahnen

**Ore UI (MiningServer):**
- **Feature:** Respawn Timer als separates Label oberhalb Ore-Name (rot)
- **Feature:** HP-Bar zeigt 0/x bei abgebautem Ore (bleibt sichtbar)
- **Polish:** GUI höher positioniert (StudsOffset 6)
- **Bug:** Respawn Timer Label wird nicht angezeigt — nächste Session fixen

**Dashboard (office.js):**
- **Feature:** Kompakte scrollende Text-Bubble über Agent-Sprites
- **Feature:** Activity Log zeigt Task-Beschreibung statt Ticket-ID
- **Fix:** Token-Anzeige nur bei DONE-Einträgen
- **Fix:** Bubble Text vertikal zentriert
- **Polish:** Task-Bar aus Detail-Panel entfernt

**Infrastruktur:**
- **Docs:** CLAUDE.md optimiert: 359→72 Zeilen (-80%), Referenzmaterial in docs/CLAUDE_REFERENCE.md
- **Docs:** Live Dashboard Workflow in CLAUDE.md verankert
- **Feature:** agent-status.mjs speichert lastTaskTokens für Dashboard
- **Polish:** Memories aufgeräumt (10→8 Files, -57% Zeilen)

### 2026-04-09 — UI Cleanup & Navigation Redesign
- **Feature:** Hub-Button in Planet-Teleport-Liste integriert (Cyan-Accent, Raketen-Emoji, über Lv.7)
- **Feature:** Nav-Button (Kompass 🧭) rechts neben XP-Bar — toggelt Ore Trail oder öffnet Planet-Menü mit Highlight
- **Fix:** "Go to Hub" Button aus Bildschirmmitte entfernt (war redundant mit Planet-Liste)
- **Fix:** [G] Equip-Button versteckt (Profile über Avatar-Click erreichbar)
- **Fix:** Crystal-Tracking oben mitte deaktiviert (doppelte Info, steht in XP-Bar)
- **Fix:** TravelClient + PickaxeClient Overlap mit XP-Bar behoben
- **Polish:** CosmicUI Viewport-Fix für Wine/Vinegar (ViewportSize starts at 1,1 statt 0,0)
- **Docs:** UI/UX Masterplan "Cosmic Glass" — Cosmic Glass HudClient erstellt aber zurückgestellt (screen-by-screen Ansatz)

### 2026-04-04 — XP-basiertes Auto-Level-System
- **Feature:** XP-basiertes Auto-Level-System — Spieler sammeln XP durch Mining, Level-Up automatisch (PM-004)
- **Feature:** XP-Bar im HUD mit animiertem Fill und Shimmer-Effekt
- **Feature:** Level-Up-Flash-Animation (Gold-Burst auf Level-Badge)

### 2026-04-03 — Ore Compass Trail + Smart Navigation
- **Feature:** Ore compass trail auf Planetenoberfläche zum nächsten Level-Up Erz (PM-121)
- **Feature:** HUD Tracker mit Material-Progress, Toggle Pin, zentrierter Text
- **Feature:** Wrong-Planet-Erkennung: Globe-Icon + Ziel-Planetenname + Globe-Button pulsiert (PM-122)
- **Polish:** Studs-Distanz-Anzeige entfernt, Trail redesigned: Neon-Kugeln mit Size-Gradient (PM-123)
- **Feature:** Spherical great-circle pathing mit Slerp-Interpolation
- **Feature:** Quest Beacon: Klick auf HUD öffnet Planeten-Menü + highlightet Ziel-Planet (PM-124)
- **Feature:** OrePathClient im Hub: "Go to Silver Moon" mit Beacon-Interaktion (PM-124)

### 2026-04-02 — UI Fixes, Border Shop, Stats Tracking
- **Fix:** Damage-Zahlen zeigten "Label" statt Schadenswerte in Stage1 (PM-113)
- **Fix:** Planet-Slide-In-Menü funktionierte nicht im Hub (PM-119)
- **Fix:** Shop-Coin-Anzeige aktualisierte sich nicht live nach Kauf (PM-120)
- **Fix:** Borders im Profil nicht als owned angezeigt + Equip kaputt (PM-117)
- **Feature:** Hub-Button in Stages immer sichtbar, ausgegraut mit "Unlock at Lv. 3" (PM-114)
- **Feature:** Level-Up-Button zeigt Material-Progress (z.B. "Stone 3/5") (PM-114)
- **Feature:** Shop umbenannt zu "SHOP" mit Tab-System: Pickaxes | Borders (PM-115)
- **Feature:** Premium Borders (Void Ring, Inferno Crown) im Shop kaufbar (PM-115)
- **Feature:** Stats-Tracking: Playtime, Total Ores Mined, Ores pro Material (PM-116)
- **Feature:** Avatar-Border spiegelt equipped Border wider (PM-118)

### 2026-04-01 — Projekt-Setup
- **Docs:** Agent-Team-System aufgesetzt (5 Agents)
- **Docs:** Zentrale Design-Docs erstellt (Vision, Core Loop, Economy, Tech Architecture)
- **Docs:** Ticket-Templates angelegt (Feature, Bug, Polish, Research)
- **Docs:** Workflow-Regeln und Handoff-Protokoll definiert

---
*Gepflegt von: project-ops*
