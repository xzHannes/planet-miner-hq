# Claude Reference — Planet Miner

Dieses File wird NICHT automatisch geladen. Nur bei Bedarf lesen.

## Projekt-Info

- **Name:** Planet Miner | **Plattform:** Roblox (Luau)
- **Stil:** Mario Galaxy / AC Wild World — kugelförmige Planeten
- **USP:** Planet-Running als Marken-Mechanik
- **Entwickler:** Hannes (Solo, Lamar als Collaborator)
- **Roblox Studio:** Vinegar (Wine) auf Arch Linux
- **Dashboard:** https://xzhannes.github.io/planet-miner-hq/
- **Repo:** https://github.com/xzHannes/planet-miner-hq

## Code-Architektur

```
ServerScriptService/
  MiningServer, ShopServer, LeaderboardServer, DataService, ProgressionService, HubClient

ReplicatedStorage/Shared/
  Config (Balance, 300+ Zeilen), PlaceConfig, OreTemplates, PickaxeBuffs, HealthManager

StarterPlayerScripts/
  HudClient, PlanetGame_Main, NotificationClient, OrePathClient, DimensionPortalClient
  Controller/ (Camera, Anim, Planet)
```

## Spielstruktur

- 7 Planeten pro Sonnensystem, 3 Sonnensysteme geplant (21 Planeten)
- 10 Pickaxes (1 Starter + 6 F2P + 3 Premium)
- Währungen: Minerals (In-Game) + Robux (Premium)
- Hub = Raumschiff mit NPCs, Shops, Leaderboards
- Loop: Mine → Sell → Upgrade → Premium → nächste Stage

## Design-Philosophie

- Dopamin-Loop: Schadenszahlen, Hitsounds, schnelles Movement
- Grind-lastig, skalierbar (Template-System), zentral balancierbar
- Kein Pay-to-Win: Robux nur für Spezial-Pickaxes und Kosmetik

## NPCs (designed, noch nicht implementiert)

1. Wizzle the Wizard — Stage-/Portal-Wechsel
2. Chubbs the Trader — Materialien verkaufen
3. Drillo the Miner — Premium Pickaxe Shop
4. Tinker the Upgrader — Upgrades

## Agent-Team Details

| Agent | Pokémon | Prompt |
|-------|---------|--------|
| project-ops (CEO) | Geckarbor | agents/project-ops/prompt.md |
| studio-engine | Enton | agents/studio-engine/prompt.md |
| world-content | Bidiza | agents/world-content/prompt.md |
| ui-ux | Riolu | agents/ui-ux/prompt.md |
| qa-balance | Felino | agents/qa-balance/prompt.md |

Team-Workflow: TeamCreate → TaskCreate → Agent tool (mit team_name + name) → Review → TeamDelete

Token-Schätzung für XP: Klein ~8K/3K, Mittel ~25K/8K, Groß ~50K/15K (input/output)

## Referenz-Dateien

| Datei | Inhalt |
|-------|--------|
| claude-memory/project_vision.md | Spielvision + TODO-Tracking |
| agents/ | Agent-Definitionen + Prompts |
| docs/ | Design-Dokumente |
| tools/tickets.mjs | Firebase Ticket CLI |
| tools/agent-stats.mjs | Agent Token/XP Tracking |
| changelogs/CHANGELOG.md | Change-History |
| docs/DECISIONS.md | Entscheidungs-Log |
| docs/AUTOMATION.md | n8n + Discord Pipeline (geplant) |
