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
Level erreichen → Neuen Planeten freischalten → Wizzle (Portal) → Neuer Planet → Loop
```

- Level-System mit Zielen pro Level
- Höheres Level = längerer Progress bis zum nächsten
- Levelup schaltet nächsten Planeten frei
- Wizzle the Wizard als Stage-Wechsel-NPC

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
*Letztes Update: 2026-04-01*
