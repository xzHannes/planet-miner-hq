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
| MiningServer | Mining-Logik, Erz-Respawn |
| ShopServer | Sell, Upgrades, Pickaxe-Kauf |
| LeaderboardServer | 3 Leaderboards (Power Level, Top Levels, Top Balance) |
| DataService | Datenpersistenz, forceSave() vor Teleport |

### Shared
| Modul | Funktion |
|-------|----------|
| Balance-Config | Zentrale Werte-Konfiguration (300+ Zeilen) |
| PlaceConfig | Auto-Detection (hub/stage/studio), Place ID Mapping |
| OreTemplates | Erz-Definitionen |
| PickaxeBuffs | Pickaxe-Statistiken und Effekte |
| HealthManager | HP-System für Erze |

### Client
| Script | Funktion |
|--------|----------|
| Controller/Camera | Kamera für kugelförmige Planeten |
| Controller/Anim | Pickaxe-Animationen, Swing-Combos |
| Controller/Planet | Planeten-Lauf-Physik |
| DimensionPortalClient | Portal-UI und Teleport-Trigger |
| HubClient | Hub-spezifische Logik |

## Code-Prinzipien
- **Balance-Config ist heilig:** Alle Gameplay-Werte dort, nicht hardcoded
- **PlaceConfig für Multi-Place:** Jedes Script prüft ob Hub oder Stage
- **Save before Teleport:** DataService.forceSave() vor jedem Teleport
- **Place-aware Scripts:** Alle Scripts funktionieren in Hub UND Stages

## Architektur-Entscheidungen

| Entscheidung | Grund |
|-------------|-------|
| Multi-Place statt Single-Place | Bessere Performance, Spieler-Isolation pro Stage |
| Zentrale Balance-Config | Alle Werte an einem Ort, schnelles Balancing |
| PlaceConfig Auto-Detection | Scripts müssen nicht wissen wo sie laufen |
| TeleportService + forceSave | Kein Datenverlust beim Teleport |
| Per-Pickaxe Grip-Offset via Attribute | Jede Pickaxe sitzt korrekt in der Hand |

---
*Gepflegt von: studio-engine*
*Letztes Update: 2026-04-01*
