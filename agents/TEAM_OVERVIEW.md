# Planet Miner — Agent Team

## Teamstruktur

```
                    ┌──────────────┐
                    │ project-ops  │  ← Lead / Koordination
                    │  (Ops Lead)  │
                    └──────┬───────┘
                           │
          ┌────────┬───────┼────────┬──────────┐
          ▼        ▼       ▼        ▼          ▼
    ┌──────────┐ ┌─────┐ ┌─────┐ ┌──────────┐
    │ studio-  │ │world│ │ ui- │ │   qa-    │
    │ engine   │ │cont.│ │ ux  │ │ balance  │
    └──────────┘ └─────┘ └─────┘ └──────────┘
```

## Agents

### project-ops (Lead)
- **Rolle:** Projektleitung, Dokumentation, Tickets, Roadmap
- **Entscheidet:** Prioritäten, Reihenfolge, Releases
- **Koordiniert:** Handoffs zwischen allen Agents
- **Pflegt:** docs/, tickets/, changelogs/, decisions/

### studio-engine
- **Rolle:** Luau-Entwicklung, Gameplay-Systeme, Architektur
- **Baut:** Scripts, Module, DataStores, Networking
- **Input von:** world-content (was bauen), ui-ux (Interfaces), project-ops (Prio)
- **Output an:** qa-balance (zum Testen), project-ops (Doku-Updates)

### world-content
- **Rolle:** Worldbuilding, Content-Design, NPCs, Lore
- **Designed:** Planeten, NPCs, Dialoge, Items, Biome
- **Input von:** project-ops (Roadmap), qa-balance (Balancing-Feedback)
- **Output an:** studio-engine (zur Implementierung), ui-ux (UI-relevanter Content)

### ui-ux
- **Rolle:** Interface-Design, HUD, Menüs, Player-Feedback
- **Designed:** GUI-Layouts, Animationen, Farbpaletten, UX-Flows
- **Input von:** world-content (Content-Kontext), project-ops (Anforderungen)
- **Output an:** studio-engine (zur Implementierung), qa-balance (zum Testen)

### qa-balance
- **Rolle:** Testing, Balancing, Performance-Analyse
- **Prüft:** Bugs, Spielbalance, Economy, Performance
- **Input von:** Alle Agents (fertige Features)
- **Output an:** project-ops (Bug-Tickets), studio-engine (Fixes)

## Kommunikationsfluss

1. **project-ops** erstellt Tickets und weist sie zu
2. **world-content** / **ui-ux** erstellen Design-Specs
3. **studio-engine** implementiert nach Specs
4. **qa-balance** testet und gibt Feedback
5. **project-ops** dokumentiert und schließt Tickets

## Eskalation
- Bei Konflikten zwischen Agents entscheidet **project-ops**
- Bei technischen Konflikten hat **studio-engine** das letzte Wort
- Bei Design-Konflikten wird Hannes direkt gefragt
