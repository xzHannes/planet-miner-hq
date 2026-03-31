# Workflow: Tägliche Entwicklung

## Morgen-Routine (5 min)

1. **Claude Code starten** im `Projects/planet-miner/` Verzeichnis
2. **project-ops fragen:** "Was steht heute an?"
3. **Tickets prüfen:** Offene Tickets in `tickets/active/` durchgehen
4. **Prio setzen:** Wichtigste 1-3 Tasks für heute auswählen

## Arbeits-Session

### Feature entwickeln
```
1. Ticket aus tickets/active/ öffnen
2. Design-Doc lesen (docs/)
3. Agent starten:
   - Content-Design → world-content Agent
   - UI-Design → ui-ux Agent
   - Implementierung → studio-engine Agent
4. Nach Abschluss: qa-balance Agent für Test
5. project-ops: Ticket Status updaten
```

### Bug fixen
```
1. Bug-Ticket lesen
2. studio-engine Agent starten
3. Fix implementieren
4. qa-balance: Fix verifizieren
5. project-ops: Ticket schließen
```

## Abend-Routine (2 min)

1. **Ticket-Status updaten**
2. **Changelog ergänzen** (falls Features/Fixes abgeschlossen)
3. **Git commit** mit aussagekräftiger Message

## Wöchentlich
- Backlog groomen: Neue Tickets priorisieren
- Docs-Check: Sind die Design-Docs aktuell?
- Playtest: Mindestens 1x pro Woche das Spiel selbst spielen
