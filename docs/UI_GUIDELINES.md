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

## HUD-Layout

```
┌──────────────────────────────────────────┐
│ [HP]  [Tool]              [Planet-Name]  │
│                                          │
│                                          │
│                                    [Map] │
│                                          │
│                                          │
│ [Quick-Slots 1-5]        [Credits: XXX] │
└──────────────────────────────────────────┘
```

- HP und Tool oben links
- Planet-Name oben rechts
- Minimap rechts
- Quick-Slots unten links
- Credits unten rechts
- Inventar per Taste/Button öffnen (Overlay)

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

---
*Gepflegt von: ui-ux*
*Letztes Update: 2026-04-01*
