# Handoff-Protokoll — Übergaben zwischen Agents

## Was ist ein Handoff?

Ein Handoff ist eine strukturierte Übergabe von Arbeit oder Information zwischen zwei Agents. Er stellt sicher, dass Kontext nicht verloren geht und der nächste Agent sofort weiterarbeiten kann.

## Wann wird ein Handoff benötigt?

- Agent hat seine Aufgabe abgeschlossen und der nächste Agent soll weitermachen
- Agent braucht Input von einem anderen Agent
- Agent muss eine Datei ändern, die ihm nicht gehört
- Feature durchläuft mehrere Agent-Bereiche

## Handoff-Format

Jeder Handoff wird als Abschnitt im zugehörigen Ticket dokumentiert:

```markdown
## Handoff: [Quell-Agent] → [Ziel-Agent]
**Datum:** YYYY-MM-DD
**Ticket:** PM-XXXX
**Status:** bereit / in Arbeit / abgeschlossen

### Was wurde gemacht
- [Konkrete Ergebnisse]

### Was der nächste Agent tun soll
- [Klare Aufgabenbeschreibung]

### Relevante Dateien
- [Pfade zu geänderten/relevanten Dateien]

### Offene Fragen
- [Falls vorhanden]
```

## Typische Handoff-Ketten

### Neues Feature
```
project-ops → world-content: "Designe Planet X"
world-content → ui-ux: "Planet X braucht diese UI-Elemente"
world-content → studio-engine: "Implementiere Planet X nach diesem Spec"
studio-engine → qa-balance: "Planet X ist implementiert, bitte testen"
qa-balance → project-ops: "Test abgeschlossen, hier die Ergebnisse"
```

### Neuer NPC
```
project-ops → world-content: "Designe NPC Y"
world-content → ui-ux: "NPC Y braucht Dialog-UI mit diesen Anforderungen"
world-content → studio-engine: "Implementiere NPC Y nach Spec"
studio-engine → qa-balance: "NPC Y testen"
qa-balance → studio-engine: "Bug bei Dialog-Trigger" (falls nötig)
qa-balance → project-ops: "NPC Y abgenommen"
```

### Bug-Fix
```
qa-balance → project-ops: "Bug gefunden: [Beschreibung]"
project-ops → studio-engine: "Fix Bug PM-XXXX"
studio-engine → qa-balance: "Fix implementiert, bitte verifizieren"
qa-balance → project-ops: "Fix verifiziert"
```

## Regeln

1. **Kein Handoff ohne Kontext:** Der Ziel-Agent muss alle Infos haben, um sofort loszulegen
2. **Ein Handoff pro Übergabe:** Nicht mehrere Dinge in einen Handoff packen
3. **Dateien referenzieren:** Immer Pfade angeben, nie "die Datei von vorhin"
4. **Status tracken:** Handoff-Status im Ticket aktuell halten
