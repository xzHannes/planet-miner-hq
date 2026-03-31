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

## Upgrades (via Tinker)
- **Damage:** Mehr Schaden pro Swing
- **Speed:** Schnellere Mining-Geschwindigkeit
- **Luck:** Höhere Drop-Chance für seltene Materialien

## Shop-System
- Sell: Materialien → Minerals (via Chubbs)
- Upgrades: Minerals → Stats (via Tinker)
- Premium: Robux → Spezial-Pickaxes (via Drillo)

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
*Letztes Update: 2026-04-01*
