# Workflow-Regeln — Agent-Zusammenarbeit

## Grundprinzipien

1. **Single Responsibility:** Jeder Agent arbeitet nur in seinem Bereich
2. **Design First:** Erst Design-Doc, dann Implementierung
3. **Ticket-Driven:** Keine Arbeit ohne Ticket
4. **Review Required:** Features werden von qa-balance geprüft bevor sie als "done" gelten

## Feature-Workflow

```
1. project-ops erstellt Feature-Ticket
   ↓
2. world-content / ui-ux erstellt Design-Spec
   ↓
3. project-ops reviewed Spec → Ticket auf "active"
   ↓
4. studio-engine implementiert nach Spec
   ↓
5. qa-balance testet
   ↓
6. Fixes durch studio-engine (bei Bugs)
   ↓
7. project-ops → Ticket "done", Changelog-Eintrag
```

## Bug-Workflow

```
1. qa-balance findet Bug → erstellt Bug-Ticket
   ↓
2. project-ops priorisiert
   ↓
3. studio-engine fixt
   ↓
4. qa-balance verifiziert Fix
   ↓
5. project-ops → Ticket "done"
```

## Ticket-Regeln

- **Erstellen:** project-ops, qa-balance (nur Bugs)
- **Zuweisen:** project-ops
- **Status ändern:** Zugewiesener Agent + project-ops
- **Schließen:** Nur project-ops

### Status-Flow
```
idea → planned → active → review → done
                    ↓
                 blocked (mit Grund)
```

## Dokumentations-Regeln

- Nach jeder Feature-Implementierung: zuständiger Agent updated sein Design-Doc
- project-ops prüft wöchentlich, ob Docs aktuell sind
- Changelog wird bei jedem abgeschlossenen Ticket aktualisiert
- Entscheidungen werden in `decisions/` protokolliert

## Git-Regeln

- Commits in Englisch
- Branch-Format: `feature/PM-0001-planet-gravity` oder `fix/PM-0042-npc-dialog`
- Ein Ticket = ein Branch = ein PR
- project-ops erstellt PRs und managed Merges

## Collision Prevention

- **Kein Agent editiert Dateien eines anderen Agents** (siehe FILE_OWNERSHIP.md)
- Bei paralleler Arbeit: verschiedene Bereiche/Dateien
- Bei Abhängigkeiten: sequentiell arbeiten, Handoff nutzen
- Roblox Studio: Ein Agent gleichzeitig im Studio (MCP-Limit)

## Daily Workflow (für Hannes)

1. `project-ops` briefen: "Was steht an?"
2. Tickets prüfen und priorisieren
3. Agent für höchste Prio-Aufgabe starten
4. Nach Abschluss: nächsten Agent oder Review
5. Am Ende: Changelog + Ticket-Status updaten
