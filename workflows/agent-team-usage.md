# Workflow: Agent Teams nutzen

## Voraussetzungen
- Claude Code installiert und konfiguriert
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in Settings
- Im Verzeichnis `~/Projects/planet-miner/` arbeiten

## Team starten

### Option 1: Einzelnen Agent nutzen
Starte Claude Code im Projektverzeichnis und gib dem Agent seinen Kontext:

```
cd ~/Projects/planet-miner
claude

> Lies agents/studio-engine/prompt.md und implementiere dann [Aufgabe]
```

### Option 2: Agent Team erstellen
```
> Erstelle ein Agent-Team mit folgenden Rollen:
> - studio-engine (Luau-Implementierung)
> - qa-balance (Testing)
> Aufgabe: Implementiere und teste das Mining-System
```

### Option 3: Sequentiell mit Handoffs
```
Session 1 (world-content):
> Lies agents/world-content/prompt.md
> Designe den Starter-Planeten

Session 2 (studio-engine):
> Lies agents/studio-engine/prompt.md
> Implementiere den Starter-Planeten nach docs/PLANETS.md

Session 3 (qa-balance):
> Lies agents/qa-balance/prompt.md
> Teste den Starter-Planeten
```

## Best Practices

### Kontext geben
Immer den Agent-Prompt zuerst laden lassen:
```
> Lies agents/[agent-name]/prompt.md und dann [Aufgabe]
```

### Ticket referenzieren
```
> Arbeite an Ticket PM-0001 (siehe tickets/active/PM-0001.md)
```

### Handoff dokumentieren
Nach Abschluss einer Agent-Session:
```
> Erstelle einen Handoff-Eintrag im Ticket für [nächster-agent]
```

### Parallele Arbeit
Für unabhängige Tasks können mehrere Agents parallel arbeiten:
- studio-engine: Feature A implementieren
- world-content: Feature B designen
- Nie: Zwei Agents am selben Feature gleichzeitig

## Anti-Patterns
- Agent ohne Prompt-Kontext starten
- Zwei Agents die gleiche Datei editieren lassen
- Handoffs vergessen
- Tickets nicht updaten
