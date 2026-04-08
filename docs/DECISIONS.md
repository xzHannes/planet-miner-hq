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

### 2026-04-02 — Tab-basierter Shop statt separater Panels
**Entscheidung:** Shop mit Tabs (Pickaxes | Borders) statt einzelner Panels
**Alternativen:** Separate Shop-Fenster pro Kategorie
**Grund:** Übersichtlicher, weniger UI-Chaos, skaliert besser für zukünftige Tabs
**Auswirkungen:** ShopServer und HudClient angepasst, Border-Kauf integriert

### 2026-04-03 — Ore Compass Trail als Neon-Kugeln
**Entscheidung:** Spherical great-circle pathing mit Slerp-Interpolation statt 2D-Kompass
**Alternativen:** Minimap-Pfeil, Screen-Edge-Indicator
**Grund:** Passiert auf der Planetenoberfläche, immersiver als UI-Overlay, nutzt Kugelplaneten-USP
**Auswirkungen:** OrePathClient als neues Script, Quest Beacon Feature

### 2026-04-04 — XP-basiertes Auto-Level statt Kauf-basiert
**Entscheidung:** Spieler sammeln XP durch Mining und leveln automatisch auf
**Alternativen:** Material/Coins investieren zum Leveln (altes System)
**Grund:** Intuitiverer Progress, Spieler müssen nicht aktiv leveln, Mining selbst fühlt sich belohnender an
**Auswirkungen:** Level-Kosten-System durch XP-System ersetzt, HudClient XP-Bar hinzugefügt

---
*Gepflegt von: project-ops*
*Letztes Update: 2026-04-08*
