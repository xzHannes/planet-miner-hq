# Workflow: Neues Feature

## Schritt 1 — Ticket erstellen (project-ops)
```
Prompt: "Erstelle ein Feature-Ticket für [Feature-Name]"
```
- Ticket in `tickets/backlog/` anlegen
- Prio und Agent zuweisen
- Nach Review → `tickets/active/` verschieben

## Schritt 2 — Design (world-content / ui-ux)
```
Prompt: "Designe [Feature] basierend auf Ticket PM-XXXX"
```
- Design-Spec in zuständigem Doc ergänzen
- Handoff an studio-engine vorbereiten

## Schritt 3 — Implementierung (studio-engine)
```
Prompt: "Implementiere [Feature] nach Spec in docs/[doc].md, Ticket PM-XXXX"
```
- Code in Roblox Studio via MCP
- TECH_ARCHITECTURE.md updaten falls nötig
- Handoff an qa-balance

## Schritt 4 — Test (qa-balance)
```
Prompt: "Teste Feature PM-XXXX gegen den Spec in docs/[doc].md"
```
- Feature gegen Spec testen
- Bugs als Vorschläge dokumentieren
- Playtest-Notes ergänzen

## Schritt 5 — Abschluss (project-ops)
```
Prompt: "Schließe Ticket PM-XXXX ab"
```
- Ticket → `tickets/done/`
- Changelog-Eintrag
- Docs-Check

## Beispiel: Mining-System
```
1. project-ops: "Erstelle Feature-Ticket für Mining-System"
2. world-content: "Designe die Mining-Mechanik: Werkzeuge, Ressourcen, Progression"
3. ui-ux: "Designe das Mining-HUD mit Fortschrittsbalken und Ressourcen-Popup"
4. studio-engine: "Implementiere MiningService und MiningController nach Specs"
5. qa-balance: "Teste Mining: Funktioniert Abbau? Ressourcen korrekt? Performance?"
6. project-ops: "Mining-System abgeschlossen, Ticket PM-0001 schließen"
```
