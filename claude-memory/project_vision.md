---
name: Spielvision - Planet Mining Game
description: Komplette Spielvision, Designprinzipien, Feature-Roadmap und TODO-Tracking fuer das Mining-Spiel
type: project
---

# Planet Mining Game - Vision & Roadmap

## Kernkonzept
Ein Mining-Spiel auf kugelfoermigen Planeten (Mario Galaxy / AC Wild World Prinzip).
Spieler laufen um kleine Planeten herum und bauen Erze ab, leveln auf, schalten neue Planeten und Sonnensysteme frei.

## Dev Dashboard
- GitHub Pages: https://xzhannes.github.io/planet-miner-hq/
- Repo (public): https://github.com/xzHannes/planet-miner-hq
- Logins: hannes / roblox! und lamar / roblox!
- Ticket-System, Vision, Roadmap, Systeme, Wirtschaft, Spielerreise
- Lamar (Kumpel mit Minecraft-Server-Erfahrung) soll als Collaborator mitarbeiten

## Alleinstellungsmerkmal (USP)
- **Planeten-Laufen**: Spieler koennen um sphaerische Planeten herumlaufen. Dieses Prinzip soll in ALLEN zukuenftigen Spielen beibehalten werden als Wiedererkennungsmerkmal der "Marke".

## Design-Philosophie
- **Dopamin-Loop**: Staendiges Belohnungsgefuehl durch:
  - Schadenszahlen an Erzen
  - Hitsounds beim Abbauen
  - Schwung-Sounds beim Pickaxe-Schwingen
  - Cleanes/schnelles Movement + Sprinten
  - Visuelles Feedback bei Drops/Levelups
- **Uebertriebener Aspekt**: Planetengroesse soll progressiv absurd gross werden (wie die riesigen Fische in Fisch-Games)
- **Grind-lastig**: Langer, befriedigender Progress
- **Skalierbar**: Jederzeit neue Sonnensysteme hinzufuegbar per Template
- **Balancierbar**: Werte muessen jederzeit anpassbar sein

## Spielstruktur

### Progression
1. **Planet 1** (klein): Stein abbauen - 3 Erz-Groessen (klein/mittel/gross)
2. **Planet 2** (etwas groesser): Kupfererz
3. **Planet 3-7**: Jeweils groessere Planeten, neue Erze, laengere Abbauzeiten
4. **Sonnensystem 2**: Noch groessere Planeten, haertere Erze
5. **Sonnensystem 3+**: Weiterer Schwierigkeitsanstieg

### Erz-System
- 3 Groessen pro Erz-Typ (klein, mittel, gross)
- Groessere Erze = laengere Abbauzeit + mehr Drops
- Hoehere Planeten = laengere Abbauzeit insgesamt

### Level-System
- Spieler muessen Ziele erreichen um aufzuleveln
- Hoeheres Level = laengerer Progress bis zum naechsten Level
- Levelup schaltet naechsten Planeten frei

### Hub (Raumschiff)
- Zentraler Bereich zwischen Sonnensystemen
- Shops: Materialien verkaufen, Upgrades kaufen
- Leaderboards (mehrere verschiedene)
- Socializing/Hangout Spot

### Upgrades (Shop)
- **Pickaxe-Upgrades**: Mehr Schaden an Erzen
- **Drop-Upgrades**: Mehr Materialien pro Erz
- **Player-Upgrades**: Weitere Verbesserungen
- Bezahlt mit verkauften Materialien (In-Game-Waehrung)

### Monetarisierung (Cashshop / Robux)
- Spezielle Pickaxes (kosmetisch oder staerker)
- Pets (spaeter)
- Weitere kosmetische Items

### Multiplayer
- Mehrere Spieler pro Planet sichtbar
- Limitierte Spieleranzahl pro Planet (nicht ueberladen)
  - z.B. Planet 1: 5 Spieler, Planet 2: 6 Spieler, etc.

### Retention-Mechaniken
- Verschiedene Leaderboards (zum Wettbewerb animieren)
- Taegliche Aufgaben (zum Wiederkommen animieren)
- Langfristiger Grind mit sichtbarem Fortschritt

### Lokalisierung
- Primaer Englisch
- Spaeter weitere Sprachen hinzufuegen

## Technische Anforderungen
- **Template-System**: Neue Sonnensysteme muessen schnell hinzufuegbar sein
- **Balance-Config**: Alle Werte (Abbauzeiten, Drops, Preise, XP) zentral konfigurierbar
- **Skalierbarkeit**: System muss beliebig viele Sonnensysteme unterstuetzen

---

# TODO-Tracking

## Erledigt
- [x] Planeten-Lauf-Mechanik implementiert (Mario Galaxy Prinzip)
- [x] Grundlegendes Mining-System (Client + Server)
- [x] 3 Sonnensystem-Folder angelegt
- [x] Hub-Model erstellt
- [x] Shop-System komplett (Sell, Upgrades, Pickaxes, Proximity + Click)
- [x] Leaderboard-System (3 Boards: Power Level, Top Levels, Top Balance)
- [x] Pickaxe-System (4 Pickaxes: Default, Inferno, Void, Frostbite)
- [x] DataService fuer Datenpersistenz
- [x] Dimension Portal System (Client)
- [x] 3D-Modelle importiert (Erze + Pickaxes aus Unity + AI-generiert)
- [x] RemoteEvents eingerichtet
- [x] Controller-Module (Camera, Anim, Planet)
- [x] Health Manager + OreTemplates
- [x] PickaxeBuffs Modul
- [x] Balance-Config Modul (300+ Zeilen, zentral)
- [x] Schadenszahlen-Anzeige an Erzen
- [x] Sprint-Mechanik
- [x] Fredoka Font eingebaut (alle UI-Texte)
- [x] Inferno Pickaxe mit Feuer-Effekten (AI-3D-Modell + ParticleEmitter)
- [x] Void Pickaxe mit Ghost-Effekten (AI-3D-Modell + VoidTrail/Wisps/Souls)
- [x] Pickaxe-Animationen: Basis-Swing (noch nicht final, 3-Step Combo offen)
- [x] Per-Pickaxe Grip-Offset-System via Attribute
- [x] Dev Dashboard (GitHub Pages + Firebase Firestore Echtzeit-Sync)
- [x] Multi-Place Architektur: Hub als Start-Place, Stages als separate Places
- [x] TeleportService: Cross-Place Teleport mit Save-before-Teleport + TeleportData
- [x] PlaceConfig Modul: Auto-Detection (hub/stage/studio), Place ID Mapping
- [x] Alle Scripts place-aware (LeaderboardServer, MiningServer, ShopServer, HubClient, etc.)
- [x] Stage1 komplett eingerichtet (Sonnensystem1, alle Scripts, OreTemplates, Pickaxes)
- [x] DataService.forceSave() fuer sofortiges Speichern vor Teleport
- [x] DimensionPortalClient + HubClient: TeleportService im Multi-Place Modus

## NPC-System (Stand 2026-03-20)
4 zentrale NPCs definiert und im Dev Dashboard dokumentiert:
1. **Wizzle the Wizard** – Dimensionsmaster, Stage-/Portal-Wechsel-NPC
2. **Chubbs the Trader** – Haendler, ersetzt Sell-Board, Materialien verkaufen
3. **Drillo the Miner** – Premium Gear Seller, Robux-Pickaxe-Shop
4. **Tinker the Upgrader** – Ingenieur, Damage/Speed/Luck Upgrades

NPCs sind als funktionale Ankerpunkte im Hub geplant.
Gameplay-Loop: Abbauen → Chubbs (Sell) → Tinker (Upgrade) → Drillo (Premium) → Wizzle (neue Stage) → Loop.
Tickets PM-040 bis PM-048 im Dashboard angelegt.

## Offen - Kurzfristig
- [ ] NPC-System im Hub integrieren (PM-040)
- [ ] Wizzle Stage-Wechsel-NPC (PM-041)
- [ ] Chubbs Sell-NPC (PM-042)
- [ ] Drillo Premium-Pickaxe-NPC (PM-043)
- [ ] Tinker Upgrade-NPC (PM-044)
- [ ] Hub-Button in Stage-Places sichtbar machen + TeleportService zurueck zum Hub
- [ ] Start auf Planet statt Hub + Relog auf hoechsten freigeschalteten Planeten
- [ ] Sound FX Design (KI-generiert, ElevenLabs) - Swoosh, Hitsounds, Material-Sounds
- [ ] Erz-Groessen-System (3 Groessen pro Typ) implementieren
- [ ] Level-/Progressions-System mit Zielen
- [ ] Planet-Freischaltung durch Levelup
- [x] Lightning Pickaxe (+50% Mining Speed) - bereits implementiert
- [ ] Neues Default Pickaxe 3D-Modell
- [ ] Equipment UI / Pickaxe Icons ueberarbeiten
- [ ] Smarte Quest-Navigation (Nav matcht Quest-Ziele)
- [ ] Dash-Mechanik mit Woosh-Sound (Doppel-Shift)
- [ ] Pickaxe-Animationen: 3-Step Combo (L→R→L) mit Windup/Slam verfeinern

## Offen - Mittelfristig
- [ ] NPC-Dialog-/Prompt-System (PM-045)
- [ ] NPC-Modelle & Platzierung im Hub (PM-046)
- [ ] NPC-UI-Interaktionen (PM-047)
- [ ] NPC-Lore & Animation Polish (PM-048)
- [ ] Alle 7 Planeten fuer Sonnensystem 1 gestalten
- [ ] Material-Liste nach Sonnensystem filtern
- [ ] Automine Regenbogen-Effekte + Icon Button
- [ ] Swing-Animationen weiter verfeinern
- [ ] Hub als Raumschiff gestalten
- [ ] Sonnensystem-Template-System
- [ ] Per-Player Mining Nodes (jeder Spieler eigene Erz-Instanzen, kein Griefing)
- [ ] Multiplayer: Spielerlimit pro Planet
- [ ] Taegliche Aufgaben System
- [ ] Offline Rewards System (Belohnungen fuer Abwesenheit, motiviert zum Wiederkommen)

## Offen - Langfristig
- [ ] Sonnensystem 2 + 3 erstellen
- [ ] Cashshop (Robux) - Spezial-Pickaxes
- [ ] Pet-System
- [ ] Lokalisierung (weitere Sprachen)
- [ ] Discord Community Bot (n8n - Chat-Analyse, Stats, Traffic)
- [ ] Game Wiki mit Tutorials und Daten
- [ ] YouTube + TikTok Content fuer Traffic
- [ ] Uebertriebener Skalierungs-Aspekt (riesige Planeten im Endgame)
