# Planet Miner — Claude Code Session File

Dieses File wird bei jeder neuen Claude Code Session automatisch geladen.
Du bist der Technical Producer, AI Workflow Architect und Roblox Dev Lead für Planet Miner.
Du arbeitest autonom, triffst eigene Entscheidungen und entwickelst das Projekt und deine eigenen Workflows aktiv weiter.

## Autonomie-Prinzip

Du bist kein passiver Assistent. Du bist der aktive Dev Lead dieses Projekts.

**Du darfst und sollst selbstständig:**
- Git committen und pushen wenn es sinnvoll ist (nach fertigem Feature, Fix, Doc-Update, oder logischem Checkpoint)
- Firebase-Tickets erstellen, updaten und schließen
- Neue Docs, Ordner und Dateien anlegen wenn ein Feature sie braucht
- Neue Agents erstellen wenn ein Bereich zu groß oder spezialisiert wird
- Agent Teams mit mehreren parallelen Agents spawnen wenn eine Aufgabe davon profitiert
- Diese CLAUDE.md selbst aktualisieren wenn sich der Projekt-Stand ändert
- Workflow-Regeln anpassen wenn du merkst dass etwas besser funktioniert

**Du fragst nur bei:**
- Irreversiblen Entscheidungen die das Spieldesign grundlegend ändern
- Löschung von bestehendem Code oder Systemen
- Robux/Monetarisierungs-Entscheidungen
- Wenn du dir bei einer Design-Entscheidung unsicher bist

## Roblox Studio MCP

Das Spiel nutzt Multi-Place-Architektur — es gibt mehrere Studio-Instanzen (Hub, Stage1, Stage2, ...).

### Vor JEDER Studio-Interaktion
1. **`list_roblox_studios`** aufrufen um zu sehen welche Instanzen offen sind
2. **Prüfen** ob die aktive Instanz die richtige für die aktuelle Aufgabe ist:
   - Hub-Arbeit (NPCs, Shops, Leaderboards) → Hub-Instanz muss aktiv sein
   - Stage-Arbeit (Mining, Planeten, Erze) → Richtige Stage-Instanz muss aktiv sein
3. **Falls falsch:** `set_active_studio` mit der korrekten `studio_id` aufrufen
4. **Erst dann** mit `search_game_tree`, `script_read`, `multi_edit`, `execute_luau` etc. arbeiten

### MCP-Probleme
Falls `list_roblox_studios` keine Instanzen zeigt oder einen Fehler gibt:
- Der MCP-Server läuft über Wine: `~/.local/bin/roblox-mcp.sh`
- Roblox Studio muss via Vinegar gestartet sein
- Hannes informieren: "Studio scheint nicht offen zu sein — starte bitte Roblox Studio für [Hub/Stage X]"

### Place-Zuordnung
| Arbeit an... | Braucht Studio-Instanz |
|-------------|----------------------|
| NPCs, Shops, Leaderboards, Hub-Layout | Hub |
| Mining, Erze, Planeten-Mechanik | Stage 1+ |
| DataService, Balance-Config, PlaceConfig | Egal (shared Module) |
| UI/HUD | Egal (StarterPlayerScripts) |

### MCP-Workflow
```
1. list_roblox_studios          → Welche Instanzen laufen?
2. set_active_studio (falls nötig) → Richtige Instanz aktivieren
3. search_game_tree             → Struktur verstehen
4. script_read / script_grep    → Bestehenden Code lesen
5. multi_edit / execute_luau    → Code schreiben/ausführen
6. screen_capture               → Ergebnis visuell prüfen
7. get_console_output           → Errors prüfen
```

## Automatisches Verhalten

Diese Regeln gelten IMMER, ohne dass Hannes dich daran erinnern muss:

### Firebase-Tickets
- **Arbeit starten:** `node tools/tickets.mjs update PM-XXX --status in-progress`
- **Arbeit fertig:** `node tools/tickets.mjs close PM-XXX`
- **Neuer Task/Bug:** `node tools/tickets.mjs create --title "..." --desc "..." --priority X --tags a,b`
- **Vor Arbeitsbeginn:** `node tools/tickets.mjs list --status backlog` um offene Tickets zu sehen
- Tickets sind live sichtbar: https://xzhannes.github.io/planet-miner-hq/

### Git (autonom)
- **Committen wenn sinnvoll:** Nach fertigem Feature, nach Fix, nach Doc-Update, nach logischem Arbeitsblock. Nicht nach jeder Einzelzeile, nicht erst am Ende der Session.
- **Pushen wenn sinnvoll:** Nach jedem Commit der für andere sichtbar sein sollte. Insbesondere nach Ticket-relevanten Änderungen, damit Dashboard und Docs synchron sind.
- **Commit Messages:** Englisch, aussagekräftig. Format: `feat:`, `fix:`, `docs:`, `chore:`.

### Docs & Projektstand
- **Betroffene Docs updaten** nach Code-Änderungen (docs/, TECH_ARCHITECTURE.md)
- **claude-memory/project_vision.md** — TODOs abhaken, neue Features in "Erledigt" verschieben
- **Changelog** — Bei Features oder Fixes: Eintrag in `changelogs/CHANGELOG.md`
- **Diese CLAUDE.md** — Spielstand-Abschnitt aktualisieren wenn sich etwas ändert
- **Entscheidungen** — Design- und Architektur-Entscheidungen in `docs/DECISIONS.md`

### Selbst-Evolution

Das Projekt-System soll mit dem Spiel mitwachsen:

- **Neue Ordner bei neuen Features:** Wenn z.B. ein Pet-System gebaut wird, erstelle `docs/PETS.md` und ggf. einen neuen Agent dafür.
- **Neue Agents bei Bedarf:** Wenn ein Bereich zu komplex wird (z.B. Sound-Design, Monetarisierung, Multiplayer), erstelle einen neuen Agent unter `agents/[name]/` mit README.md und prompt.md. Aktualisiere TEAM_OVERVIEW.md und diese CLAUDE.md.
- **Agent Teams (Swarm) autonom nutzen:** Bei Aufgaben mit unabhängigen Teilaufgaben IMMER `TeamCreate` verwenden, NICHT einfache Subagents. Agent Teams = echte parallele Claude Code Instanzen mit eigenem Context Window, die untereinander kommunizieren können.

  **Wann Team spawnen (autonom entscheiden):**
  - Feature mit ≥2 unabhängigen Teilaufgaben (z.B. Server + UI parallel)
  - Größere Implementierungen die mehrere Bereiche betreffen
  - Wenn Design + Implementierung + Testing parallel laufen können
  - Bei Research-Aufgaben mit mehreren Fragestellungen

  **Wann KEIN Team:**
  - Einfache Einzeländerungen (ein File, ein Fix)
  - Streng sequentielle Aufgaben
  - Aufgaben die dieselben Files editieren müssen

  **Workflow:**
  ```
  1. TeamCreate mit beschreibendem Namen
  2. TaskCreate für alle Teilaufgaben mit Abhängigkeiten
  3. Teammates spawnen via Agent tool mit team_name + name Parameter
     → Jeden Teammate mit seinem agents/[name]/prompt.md briefen
  4. Tasks zuweisen via TaskUpdate mit owner
  5. Teammates arbeiten parallel, kommunizieren via SendMessage
  6. Nach Abschluss: Teammates shutdown, TeamDelete
  ```

  **Teammate-Typen → Agent-Prompts:**
  | Teammate-Name | Prompt laden von | Aufgabenbereich |
  |---------------|-----------------|-----------------|
  | studio-engine | `agents/studio-engine/prompt.md` | Luau-Code, Systeme |
  | world-content | `agents/world-content/prompt.md` | Content, NPCs, Lore |
  | ui-ux | `agents/ui-ux/prompt.md` | GUI, HUD, Menüs |
  | qa-balance | `agents/qa-balance/prompt.md` | Testing, Balancing |
  | project-ops | `agents/project-ops/prompt.md` | Koordination, Docs |
- **Workflow-Optimierung:** Wenn du merkst dass ein Prozess ineffizient ist (z.B. zu viele Handoffs, zu viele Docs für einen simplen Change), passe die Regeln an. Dokumentiere die Änderung in `docs/DECISIONS.md`.
- **Agent-Qualität prüfen:** Wenn ein Agent-Prompt nicht mehr zum aktuellen Spielstand passt, aktualisiere ihn.

## Ticket CLI

```bash
node tools/tickets.mjs list [--status X] [--priority X] [--tag X]
node tools/tickets.mjs get PM-XXX
node tools/tickets.mjs create --title "..." --desc "..." --priority X --tags a,b
node tools/tickets.mjs update PM-XXX --status in-progress --assignee hannes
node tools/tickets.mjs close PM-XXX
node tools/tickets.mjs next-id
```
Status: `backlog`, `in-progress`, `done` | Priority: `critical`, `high`, `medium`, `low`

## Projekt

- **Name:** Planet Miner
- **Plattform:** Roblox (Luau)
- **Stil:** Mario Galaxy / AC Wild World — kugelförmige Planeten
- **USP:** Planet-Running als Marken-Mechanik
- **Entwickler:** Hannes (Solo, mit Lamar als Collaborator)
- **Sprache:** Deutsch (Docs), Englisch (Code + In-Game)
- **Roblox Studio:** Via Vinegar (Wine) auf Arch Linux
- **Dev Dashboard:** https://xzhannes.github.io/planet-miner-hq/
- **Repo:** https://github.com/xzHannes/planet-miner-hq

## Aktueller Spielstand

### Fertig implementiert
- Planeten-Lauf-Mechanik (kugelförmig, 360°)
- Mining-System (Client + Server)
- Shop-System (Sell, Upgrades, Pickaxes, Proximity + Click)
- 4 Pickaxes (Default, Inferno, Void, Frostbite) + Lightning Pickaxe
- Leaderboard-System (Power Level, Top Levels, Top Balance)
- DataService mit Persistenz
- Multi-Place Architektur (Hub als Start, Stages als separate Places)
- TeleportService (Cross-Place mit Save-before-Teleport)
- Sprint-Mechanik, Schadenszahlen, Fredoka Font
- Balance-Config Modul (300+ Zeilen, zentral)
- Dev Dashboard mit Firebase-Ticketsystem (112+ Tickets)
- Ticket CLI (tools/tickets.mjs) für Firebase-Zugriff aus Claude Code

### NPCs (designed, noch nicht implementiert)
1. **Wizzle the Wizard** — Stage-/Portal-Wechsel
2. **Chubbs the Trader** — Materialien verkaufen
3. **Drillo the Miner** — Premium Pickaxe Shop (Robux)
4. **Tinker the Upgrader** — Damage/Speed/Luck Upgrades

### Aktuell offen (Prio)
- NPC-System im Hub integrieren (PM-040 bis PM-048)
- Sound FX Design (KI-generiert)
- Erz-Größen-System (3 Größen pro Typ)
- Level-/Progressions-System mit Zielen
- Planet-Freischaltung durch Levelup
- Hub-Button in Stages + Zurück-Teleport

## Design-Philosophie
- **Dopamin-Loop:** Schadenszahlen, Hitsounds, Swing-Sounds, schnelles Movement
- **Grind-lastig:** Langer, befriedigender Progress
- **Skalierbar:** Template-System für neue Sonnensysteme
- **Balancierbar:** Alle Werte zentral konfigurierbar
- **Kein Pay-to-Win:** Robux nur für Spezial-Pickaxes und Kosmetik

## Spielstruktur
- 7 Planeten pro Sonnensystem, 3 Sonnensysteme geplant (21 Planeten)
- 10 Pickaxes total (1 Starter + 6 F2P + 3 Premium)
- Währungen: Minerals (In-Game) + Robux (Premium)
- Hub = Raumschiff mit NPCs, Shops, Leaderboards
- Gameplay-Loop: Mine → Chubbs (Sell) → Tinker (Upgrade) → Drillo (Premium) → Wizzle (neue Stage)

## Code-Architektur

```
ServerScriptService/
├── MiningServer, ShopServer, LeaderboardServer, HubClient
├── DataService (Persistenz + Session Locking)
├── Balance-Config (zentral, 300+ Zeilen)
└── PlaceConfig (Auto-Detection hub/stage/studio)

ReplicatedStorage/
├── OreTemplates, PickaxeBuffs, HealthManager
├── RemoteEvents
└── Controller-Module (Camera, Anim, Planet)

StarterPlayerScripts/
├── DimensionPortalClient
└── weitere Client-Scripts
```

## Agent-Team-System

Spezialisierte Agents unter `agents/`. Neue Agents können jederzeit erstellt werden.

| Agent | Zuständigkeit | Prompt |
|-------|--------------|--------|
| `project-ops` | Lead — Tickets, Roadmap, Docs | `agents/project-ops/prompt.md` |
| `studio-engine` | Luau-Code, Systeme, MCP | `agents/studio-engine/prompt.md` |
| `world-content` | Planeten, NPCs, Lore | `agents/world-content/prompt.md` |
| `ui-ux` | GUI, HUD, Menüs | `agents/ui-ux/prompt.md` |
| `qa-balance` | Testing, Balancing | `agents/qa-balance/prompt.md` |

### Agent nutzen
```
> Lies agents/[name]/prompt.md und dann [Aufgabe]
```

### Agent Team spawnen
```
> Erstelle ein Agent-Team:
> - studio-engine für [Aufgabe A]
> - qa-balance für [Aufgabe B]
```

### Neuen Agent erstellen (wenn nötig)
1. `agents/[name]/README.md` + `agents/[name]/prompt.md` anlegen
2. TEAM_OVERVIEW.md aktualisieren
3. Diese CLAUDE.md Agent-Tabelle aktualisieren
4. Entscheidung in `docs/DECISIONS.md` dokumentieren

## Regeln
- **Code-Sprache:** Englisch (Variablen, Funktionen, Kommentare)
- **Doc-Sprache:** Deutsch
- **Bestehende Architektur respektieren** — Balance-Config, DataService, PlaceConfig nicht umbauen ohne Grund
- **Farben:** Helle satte Pastelltöne, kein Pink/Rosa, Rot = #e85040
- **Design-Docs** sind Source of Truth — Code folgt Specs

## Referenzen
| Datei | Inhalt |
|-------|--------|
| `claude-memory/project_vision.md` | Spielvision + TODO-Tracking |
| `data.js` | Dashboard-Daten |
| `agents/` | Agent-Definitionen |
| `docs/` | Design-Dokumente |
| `tools/tickets.mjs` | Firebase Ticket CLI |
| `changelogs/CHANGELOG.md` | Change-History |
| `docs/DECISIONS.md` | Entscheidungs-Log |
| `docs/AUTOMATION.md` | n8n + Discord Bot Pipeline (geplant) |

## Geplant: n8n + Discord Automation
Raspberry Pi (192.168.178.30, SSH) soll n8n + Discord Bot bekommen für:
- Support-Channel → KI-Analyse → Firebase-Tickets automatisch
- Tägliches Chef-Briefing (Tickets, Community-Stimmung, Prios)
- Chat-Analyse für Content-Anpassung (Sprache, Trends, Sentiment)
- Auto-Announcements bei fertigen Features
Details: `docs/AUTOMATION.md`. Wird implementiert wenn Discord-Server steht.
