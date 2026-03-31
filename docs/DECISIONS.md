# Planet Miner — Entscheidungen

Hier werden alle wichtigen Design- und Architektur-Entscheidungen dokumentiert, damit nachvollziehbar ist, warum etwas so gemacht wurde.

## Format

```markdown
### [YYYY-MM-DD] [Titel]
**Entscheidung:** Was wurde entschieden?
**Alternativen:** Was wurde verworfen?
**Grund:** Warum diese Wahl?
**Auswirkungen:** Was ändert sich dadurch?
```

## Entscheidungen

### 2026-04-01 — Agent-Team-Struktur
**Entscheidung:** 5 spezialisierte Agents statt 7
**Alternativen:** 7 einzelne Agents (je einer für Code, Systems, Gameplay, UI, Content, Docs, QA)
**Grund:** Solo-Entwicklung braucht weniger Overhead. Documentation + Tickets → project-ops. Systems + Gameplay → studio-engine. Weniger Handoffs = schneller.
**Auswirkungen:** Jeder Agent hat breiteren Scope, dafür weniger Koordinations-Overhead.

### 2026-04-01 — Service-Pattern statt OOP
**Entscheidung:** Singleton-Services statt klassische OOP-Hierarchie für Roblox
**Alternativen:** Knit Framework, OOP mit Metatables
**Grund:** Einfacher, besser testbar, idiomatisch für Roblox/Luau
**Auswirkungen:** Jeder Service ist ein ModuleScript mit Init/Start Pattern.

---
*Gepflegt von: project-ops*
*Letztes Update: 2026-04-01*
