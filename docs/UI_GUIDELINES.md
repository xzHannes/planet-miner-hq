# Planet Miner — UI Guidelines

## Visueller Stil
- **Tone:** Charmant, klar, einladend
- **Farben:** Helle, satte Pastelltöne (kein Pink/Rosa)
- **Fonts:** Lesbar, charaktervoll, keine Standard-Fonts
- **Icons:** Einfach, sofort verständlich

## Farbpalette

| Verwendung | Farbe | Hex |
|-----------|-------|-----|
| Primary | Warmes Blau | #4A90D9 |
| Secondary | Soft Grün | #5CB85C |
| Accent | Gold/Amber | #F5A623 |
| Background | Dunkles Spacegrau | #1A1A2E |
| Text | Helles Weiß | #F0F0F0 |
| Error/Warning | Echtes Rot | #E85040 |
| Success | Smaragd | #2ECC71 |
| Disabled | Grau | #7F8C8D |

_Palette wird bei Bedarf erweitert_

## HUD-Layout (aktuell implementiert)

```
┌──────────────────────────────────────────┐
│ [Avatar] System > Planet    [Teleport→]  │
│ [Name · Lv.X]                            │
│ [🪙 Coins]                               │
│                                          │
│                                          │
│                                          │
│                          [Planet-Liste]  │
│ Auto-Mine: OFF                           │
│ [Lv.X] XP: XX/XXX ████████░░░           │
│ [Pickaxe-Icon] [Hub/Mining Button] [🌍]  │
└──────────────────────────────────────────┘
```

- **Oben links:** Avatar mit Power-Level-Badge, System > Planet Breadcrumb, Name + Level, Coins
- **Oben rechts:** Teleport-Button (Go to Hub / Go to Stage)
- **Unten mitte:** Level-Badge + XP-Bar mit Shimmer-Animation
- **Unten links:** Pickaxe-Icon (equipped)
- **Unten rechts:** Planeten-Menü-Button (Globe)
- **Rechts:** Planet-Liste mit Level-Lock-Anzeige (nur in Stages)
- **Auto-Mine Toggle** unten links

## UI-Prinzipien
1. **Weniger ist mehr:** Nur zeigen was gerade relevant ist
2. **44px Minimum:** Alle Touch-Targets mindestens 44px
3. **Kein Hover-Only:** Alles muss ohne Hover funktionieren (Mobile)
4. **Animiert aber nicht nervig:** Smooth Transitions, keine Bounce-Orgien
5. **Konsistent:** Gleiche Aktionen = gleiche UI-Patterns
6. **Zugänglich:** Ausreichend Kontrast, klare Hierarchie

## Menü-Struktur
- **Hauptmenü:** Play, Settings, Shop, Credits
- **Pause-Menü:** Resume, Settings, Quit
- **Inventar:** Grid-View, Sortierung, Drag&Drop
- **Shop (NPC):** Liste mit Preisen, Buy/Sell Tabs
- **Dialog:** Textbox unten, Portrait links, Optionen

## HUD-Farbpalette (HudClient)

| Element | Farbe | RGB |
|---------|-------|-----|
| Panel Background | Dark Space | 12, 14, 30 |
| Panel BG Light | Lighter Space | 22, 26, 50 |
| Accent (Level-Badge, XP) | Purple | 120, 90, 230 |
| Gold (Level-Up Flash) | Gold | 255, 210, 50 |
| Green (Positive) | Emerald | 80, 210, 130 |
| Cyan (XP Gradient) | Cyan | 60, 200, 255 |
| Text Primary | White-ish | 240, 240, 255 |
| Text Secondary | Muted | 160, 165, 190 |

---
*Gepflegt von: ui-ux*
*Letztes Update: 2026-04-08*
