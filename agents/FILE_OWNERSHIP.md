# File Ownership — Wer darf was editieren

## Prinzip
Jeder Agent hat klar definierte Dateien. Fremde Dateien werden **nicht** editiert — stattdessen wird ein Handoff erstellt.

## Ownership-Matrix

### project-ops (Lead)
**Schreibzugriff:**
- `CLAUDE.md`
- `agents/*` (alle Agent-Konfigurationen)
- `docs/VISION.md`
- `docs/CORE_LOOP.md`
- `docs/DECISIONS.md`
- `docs/KNOWN_ISSUES.md`
- `tickets/*`
- `changelogs/*`
- `decisions/*`
- `workflows/*`

**Lesezugriff:** Alles

### studio-engine
**Schreibzugriff:**
- `docs/TECH_ARCHITECTURE.md`
- Roblox Studio Scripts (via MCP)
- Luau-Module und Services

**Lesezugriff:**
- `docs/*` (alle Design-Docs)
- `tickets/active/*` (eigene Tickets)

**Kein Zugriff:**
- `agents/*`
- `tickets/templates/*`
- Andere Agent-Ordner

### world-content
**Schreibzugriff:**
- `docs/NPCS.md`
- `docs/ECONOMY.md`
- `docs/PLANETS.md`
- `docs/LORE.md`

**Lesezugriff:**
- `docs/VISION.md`
- `docs/CORE_LOOP.md`
- `tickets/active/*` (eigene Tickets)

**Kein Zugriff:**
- `docs/TECH_ARCHITECTURE.md`
- `agents/*`
- Roblox Studio Scripts

### ui-ux
**Schreibzugriff:**
- `docs/UI_GUIDELINES.md`

**Lesezugriff:**
- `docs/VISION.md`
- `docs/CORE_LOOP.md`
- `docs/NPCS.md` (für Content-Kontext)
- `tickets/active/*` (eigene Tickets)

**Kein Zugriff:**
- `docs/TECH_ARCHITECTURE.md`
- `docs/ECONOMY.md`
- `agents/*`

### qa-balance
**Schreibzugriff:**
- `docs/PLAYTEST_NOTES.md`
- `docs/KNOWN_ISSUES.md` (gemeinsam mit project-ops)

**Lesezugriff:**
- `docs/*` (alle Docs zum Abgleich)
- `tickets/*` (zum Bug-Reporting)

**Kein Zugriff:**
- `agents/*`
- Design-Docs editieren (nur lesen + Feedback)

## Konflikte
- Wenn ein Agent eine Datei ändern muss, die ihm nicht gehört → **Handoff erstellen**
- Format: `HANDOFF: [agent-name] soll [datei] ändern weil [grund]`
- project-ops entscheidet bei unklarer Ownership
