# Planet Miner — Economy

## Währungen
- **Minerals** — Hauptwährung (In-Game, verdient durch Mining + Sell)
- **Robux** — Premium-Währung (echtes Geld, kein Pay-to-Win)

## Erz-System
- 3 Größen pro Erz-Typ: klein, mittel, groß
- Größere Erze = längere Abbauzeit + mehr Drops
- Höhere Planeten = härtere Erze, längere Abbauzeiten

## Pickaxes (10 total)

### F2P Pickaxes (7)
| Pickaxe | Typ | Status |
|---------|-----|--------|
| Default | Starter | Implementiert |
| _TBD_ | F2P Upgrade 1-6 | Geplant |

### Premium Pickaxes (3)
| Pickaxe | Effekte | Status |
|---------|---------|--------|
| Inferno | Feuer-Effekte (ParticleEmitter) | Implementiert |
| Void | Ghost-Effekte (VoidTrail/Wisps/Souls) | Implementiert |
| Frostbite | Eis-Effekte | Implementiert |

### Spezial
| Pickaxe | Bonus | Status |
|---------|-------|--------|
| Lightning | +50% Mining Speed | Implementiert |

## Upgrades (6 Typen, via Shop/Tinker)
- **Pickaxe Damage:** Mehr Schaden pro Swing (baseCost 50, scale 1.25)
- **Mining Speed:** Schnellere Mining-Geschwindigkeit (baseCost 60, scale 1.25)
- **Walk Speed:** Schnellere Bewegung (baseCost 40, scale 1.22)
- **Jump Power:** Höherer Sprung (baseCost 40, scale 1.22)
- **Coin Bonus:** Mehr Münzen pro Verkauf (baseCost 80, scale 1.28)
- **Multi-Drop (Lucky Strike):** Chance auf 2x Drops (baseCost 100, scale 1.30)

Power Level = Summe aller Upgrade-Level

## Borders (Kosmetik)
- Premium Borders im Shop kaufbar (Tab "Borders")
- **Void Ring**, **Inferno Crown** — als erste Borders implementiert
- Equipped Border reflektiert sich im Avatar-Stroke
- Weitere Borders geplant

## Shop-System (Tab-basiert)
- **Pickaxes Tab:** F2P + Premium Pickaxes kaufen
- **Borders Tab:** Kosmetische Borders kaufen
- Sell: Materialien → Minerals
- Upgrades: Minerals → Stats
- Premium: Robux → Spezial-Pickaxes (via Drillo, geplant als NPC)

## Balance
- Zentrale Balance-Config (300+ Zeilen) für alle Werte
- Alle Preise, Abbauzeiten, Drops, XP zentral konfigurierbar
- Skalierung über Sonnensysteme: progressiv schwieriger

## Balancing-Ziele
- Kein Pay-to-Win (F2P kann alles erreichen, dauert nur länger)
- Progression fühlt sich befriedigend an (nicht zu schnell, nicht zu langsam)
- Premium-Pickaxes sind cool aber nicht mandatory

---
*Gepflegt von: world-content*
*Letztes Update: 2026-04-08*
