# Planet Miner — Technische Architektur

## Multi-Place Architektur

```
Hub (Start-Place)          Stage 1              Stage 2+
┌────────────────┐    ┌──────────────┐    ┌──────────────┐
│ Hub-NPCs       │    │ Mining       │    │ Mining       │
│ Shops          │◄──►│ OreTemplates │    │ OreTemplates │
│ Leaderboards   │    │ Planetlauf   │    │ Planetlauf   │
│ Socializing    │    │              │    │              │
└────────────────┘    └──────────────┘    └──────────────┘
     TeleportService (Save-before-Teleport + TeleportData)
```

## Bestehende Module (implementiert)

### Server
| Script | Funktion |
|--------|----------|
| MiningServer | Mining-Logik, Erz-Respawn, 3-Tier-System (klein/mittel/groß) |
| ShopServer | Sell, Upgrades, Pickaxe/Border-Kauf, Tab-UI |
| LeaderboardServer | 3 Leaderboards (Power Level, Top Levels, Top Balance) — Scaffolding |
| DataService | Datenpersistenz (v2), Session Locking, Stats-Tracking, forceSave() |
| ProgressionService | Spawn-Ziele, Planet/Stage Unlock, Place-Validierung |
| HubClient (Server) | Hub-spezifische Server-Logik |

### Shared (ReplicatedStorage/Shared/)
| Modul | Funktion |
|-------|----------|
| Config (Balance-Config) | Zentrale Werte (300+ Zeilen): Level-Kosten, Upgrades, System-Unlock |
| PlaceConfig | Auto-Detection (hub/stage/studio), Place ID Mapping |
| OreTemplates | Erz-Definitionen |
| PickaxeBuffs | Pickaxe-Statistiken und Effekte |
| HealthManager | HP-System für Erze |

### Client (StarterPlayerScripts)
| Script | Funktion |
|--------|----------|
| HudClient | Komplettes HUD: Level-Badge, XP-Bar, Coins, Planet, Shop-Panels |
| NotificationClient | Level-Up-Feier mit Gold-Partikeln, Toast-System |
| OrePathClient | Ore Compass Trail (Neon-Kugeln), Quest Beacon, Wrong-Planet-Erkennung |
| DimensionPortalClient | Portal-UI und Teleport-Trigger |
| Controller/Camera | Kamera für kugelförmige Planeten |
| Controller/Anim | Pickaxe-Animationen, Swing-Combos |
| Controller/Planet | Planeten-Lauf-Physik |

## Code-Prinzipien
- **Balance-Config ist heilig:** Alle Gameplay-Werte dort, nicht hardcoded
- **PlaceConfig für Multi-Place:** Jedes Script prüft ob Hub oder Stage
- **Save before Teleport:** DataService.forceSave() vor jedem Teleport
- **Place-aware Scripts:** Alle Scripts funktionieren in Hub UND Stages

## Datenmodell (DataService)

```lua
{
  level = 1,
  xp = 0,                           -- XP für Auto-Level-System
  coins = 0,
  materials = {},                    -- { Stone = 5, Copper = 3, ... }
  upgrades = {},                     -- { pickaxe_damage = 2, mining_speed = 1, ... }
  ownedPickaxes = {},                -- ["Default", "Inferno", ...]
  equippedPickaxe = "",
  ownedBorders = {},                 -- ["Void Ring", "Inferno Crown", ...]
  equippedBorder = "",
  highestStageUnlocked = 1,
  highestPlanetPerStage = {1 = 1},
  hubUnlocked = false,
  stats = {                          -- Stats-Tracking
    playtime = 0,
    totalOresMined = 0,
    oresPerMaterial = {}
  }
}
```

## Architektur-Entscheidungen

| Entscheidung | Grund |
|-------------|-------|
| Multi-Place statt Single-Place | Bessere Performance, Spieler-Isolation pro Stage |
| Zentrale Balance-Config | Alle Werte an einem Ort, schnelles Balancing |
| PlaceConfig Auto-Detection | Scripts müssen nicht wissen wo sie laufen |
| TeleportService + forceSave | Kein Datenverlust beim Teleport |
| Per-Pickaxe Grip-Offset via Attribute | Jede Pickaxe sitzt korrekt in der Hand |
| XP-basiertes Auto-Level | Spieler leveln durch Mining-XP, nicht durch Kauf |
| 3-Tier Erz-System | Größenvariation pro Planet (tier02/03/04 mit HP/Drop-Multiplikatoren) |
| Hub + Stage separate Script-Kopien | Multi-Place erfordert Sync, beide immer updaten |

---
*Gepflegt von: studio-engine*
*Letztes Update: 2026-04-08*
