# Planet Miner — Core Gameplay Loop

## Primärer Loop (Minute-to-Minute)

```
Mine Erze → Materialien sammeln → Chubbs (Sell) → Tinker (Upgrade) → Besser minen
```

### Mining
- 3 Erz-Größen pro Typ (klein/mittel/groß)
- Größere Erze = längere Abbauzeit + mehr Drops
- Schadenszahlen an Erzen als visuelles Feedback
- Verschiedene Pickaxes mit unterschiedlicher Stärke und Effekten

### Verkaufen & Upgraden
- **Chubbs the Trader:** Materialien gegen Währung verkaufen
- **Tinker the Upgrader:** Damage/Speed/Luck Upgrades kaufen
- **Drillo the Miner:** Premium Pickaxes (Robux)

## Sekundärer Loop (Session-to-Session)

```
XP durch Mining sammeln → Auto-Level-Up → Neuer Planet freigeschaltet → Ore Compass zeigt Weg → Loop
```

- **XP-basiertes Auto-Level-System** — Spieler sammeln XP durchs Mining, Level-Up passiert automatisch
- 21 Level definiert, an 3 Sonnensysteme gebunden (1-7, 8-14, 15-21)
- Ore Compass Trail zeigt Weg zum nächsten Level-Up-Erz (Neon-Kugeln auf Oberfläche)
- Quest Beacon: HUD-Klick öffnet Planeten-Menü mit Ziel-Highlight
- Wrong-Planet-Erkennung warnt wenn Spieler auf falschem Planet ist
- Levelup schaltet nächsten Planeten frei (via ProgressionService)

## Tertiärer Loop (Langzeit)

```
Sonnensystem 1 abschließen → Sonnensystem 2 → ... → Endgame
```

- 3 Sonnensysteme mit je 7 Planeten
- Jedes System: größere Planeten, härtere Erze
- Endgame: Absurd große Planeten, legendäre Pickaxes

## Hub (Raumschiff)
- Zentraler Bereich zwischen Stages
- 4 NPCs: Wizzle, Chubbs, Drillo, Tinker
- Leaderboards (Power Level, Top Levels, Top Balance)
- Socializing Spot

## Multi-Place Architektur
- Hub als Start-Place
- Jede Stage als separater Place
- TeleportService mit Save-before-Teleport
- PlaceConfig: Auto-Detection (hub/stage/studio)

## Session-Design
- **Erste 5 Minuten:** Tutorial, Planet 1, erstes Mining + Sell
- **30 Minuten:** 1-2 Planeten abfarmen, erstes Upgrade
- **Langzeit:** Neue Sonnensysteme, Premium Pickaxes, Leaderboard-Jagd

---
*Gepflegt von: project-ops*
*Letztes Update: 2026-04-08*
