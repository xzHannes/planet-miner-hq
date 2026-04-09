# Planet Miner — UI/UX Masterplan 2026

> **Ziel:** Das beste UI/UX auf Roblox. Kein Copy-Paste von Pet Sim oder Blox Fruits — sondern ein eigenes, konsistentes Space-Design das sich sofort von allem anderen abhebt. Jede Interaktion triggert Dopamin. Jedes Element fühlt sich alive an.

**Design-Philosophie in einem Satz:**
_"Cosmic Glass" — Minimale, schwebende Panels mit Tiefe, Glow und Spring-Animationen. Wie ein Hologramm-Interface auf einer Raumstation, aber warm und einladend genug für Kids._

---

## 1. DESIGN SYSTEM: "Cosmic Glass"

### 1.1 Core Aesthetic

Das gesamte UI folgt EINEM durchgängigen Stil:

- **Panels:** Halbtransparente, abgerundete Glasflächen mit subtiler blau-violetter Tönung
- **Borders:** 1-2px Glow-Strokes in Accent-Farben (keine harten Kanten)
- **Backgrounds:** Deep Space Gradient als Basis, nie reines Schwarz
- **Depth:** Mehrere Ebenen durch Transparenz + Blur (vorne = weniger transparent)
- **Icons:** Einfache, fette Silhouetten mit Glow — keine detaillierten Illustrationen
- **Text:** Minimal. Zahlen > Wörter. Icons > Labels. Tooltips bei Bedarf.
- **Motion:** Alles bewegt sich sanft. Nichts erscheint/verschwindet abrupt.

### 1.2 Farbpalette (FINAL)

```
SPACE DARK SPECTRUM (Hintergründe)
──────────────────────────────────
Void          #08081A    RGB(8, 8, 26)       — Tiefster Hintergrund
Deep Space    #0D0E1E    RGB(13, 14, 30)     — Panel-Hintergrund
Nebula Dark   #161A32    RGB(22, 26, 50)     — Panel-Hintergrund (hover/aktiv)
Nebula Light  #1E2440    RGB(30, 36, 64)     — Erhöhte Panels, Cards

ACCENT COLORS (Highlights, Interaktionen)
──────────────────────────────────────────
Cosmic Blue   #3DAAFF    RGB(61, 170, 255)   — Primary Accent, Links, XP
Stardust      #785AE6    RGB(120, 90, 230)   — Secondary, Level-Badge, Rare
Solar Gold    #FFCF33    RGB(255, 207, 51)   — Coins, Rewards, Level-Up
Plasma Green  #50D282    RGB(80, 210, 130)   — Success, HP, Positive
Nebula Cyan   #3CC8FF    RGB(60, 200, 255)   — XP-Gradient End, Info

FEEDBACK COLORS (Zustandsmeldungen)
────────────────────────────────────
Supernova Red #E85040    RGB(232, 80, 64)    — Error, Danger, Low HP
Comet Orange  #FF9533    RGB(255, 149, 51)   — Warning, Almost-there
Pulsar White  #F0F0FF    RGB(240, 240, 255)  — Primary Text
Dust Grey     #A0A5BE    RGB(160, 165, 190)  — Secondary Text, Disabled

RARITY GLOW COLORS (Item-Rahmen)
─────────────────────────────────
Common        #B0B8C8    — Matter White/Grey
Uncommon      #50D282    — Plasma Green  
Rare          #3DAAFF    — Cosmic Blue
Epic          #785AE6    — Stardust Purple
Legendary     #FFCF33    — Solar Gold (pulsierend)
Mythic        #FF4466    — Crimson mit animiertem Particle-Glow
```

**Regel:** Maximal 2 Accent-Farben gleichzeitig auf dem Screen. Cosmic Blue + Solar Gold als Hauptpaar. Stardust Purple für Specials.

### 1.3 Typography

```
Primary Font:     Fredoka One (bereits im Einsatz — perfekt!)
Fallback:         GothamBold

Größen (Scale-basiert, NICHT Pixel!):
────────────────────────────────────
Hero Text:        0.045 (Level-Up "LEVEL UP!", Milestone-Zahlen)
Title:            0.032 (Panel-Überschriften, NPC-Namen)
Body:             0.022 (Standard-Text, Zahlen, Labels)  
Caption:          0.016 (Tooltips, Secondary Info)
Micro:            0.012 (Badge-Text, Hotkeys)

Alle Größen relativ zur Viewport-Höhe → skaliert auf allen Geräten.
```

### 1.4 Spacing & Layout Grid

```
Base Unit:        4px (alle Abstände sind Vielfache von 4)
Panel Padding:    12px (3 Units)
Panel Gap:        8px (2 Units)
Corner Radius:    12px (Standard), 8px (kleine Elemente), 20px (Pillen/Badges)
Icon Size:        28-36px (HUD), 48px (Shop Cards), 64px (Feature Icons)
Touch Target:     48px Minimum (Mobile-safe)

Safe Areas:       
- Top: 48px (Roblox topbar)
- Bottom: 24px  
- Sides: 16px
- Notch: GuiService:GetGuiInset() respected
```

### 1.5 Panel-Baukasten ("Cosmic Glass Panel")

Jedes Panel im Spiel wird aus diesem Baukasten zusammengesetzt:

```
┌─────────────────────────────────┐  ← UICorner: 12px
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← BackgroundColor3: Deep Space (#0D0E1E)
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← BackgroundTransparency: 0.15
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← UIStroke: 1.5px, Cosmic Blue (#3DAAFF), Transparency 0.5
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← UIGradient: subtil von links-oben nach rechts-unten
└─────────────────────────────────┘     (Deep Space → Nebula Dark, Rotation 135°)
     ↑ Glow-Schatten darunter: ImageLabel mit radialer Blur, Accent-Farbe, Transparency 0.85
```

**Varianten:**
- **Standard Panel:** Wie oben (HUD-Elemente, Info-Panels)
- **Active Panel:** Stroke Transparency 0.2, leicht heller (Hover/Selected)
- **Elevated Panel:** Nebula Light Background, stärkerer Glow (Modals, Overlays)
- **Danger Panel:** Stroke-Farbe = Supernova Red
- **Success Panel:** Stroke-Farbe = Plasma Green
- **Gold Panel:** Stroke-Farbe = Solar Gold (Rewards, Premium)

---

## 2. HUD LAYOUT

### 2.1 Philosophie

- **Corners-Only:** Bildmitte ist IMMER frei — der Spieler sieht das Spiel, nicht die UI
- **Context-Aware:** Zeige nur was gerade relevant ist
- **Breathing:** Jedes Element hat subtile Idle-Animation
- **Information Hierarchy:** Coins + Level sind King, alles andere ist sekundär

### 2.2 Layout-Map

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌─────────────┐                           ┌──────────────┐   │
│  │ 🪙 12.4K    │                           │  ⚙  🔊  ≡   │   │
│  └─────────────┘                           └──────────────┘   │
│  ┌─────────────┐                                               │
│  │ Lv.8 ██████░│                                               │
│  └─────────────┘                                               │
│                                                                │
│                                                                │
│                      [ GAMEPLAY ]                              │
│                                                                │
│                                                                │
│                                                   ┌────┐      │
│                                                   │ 🌍 │      │
│                                                   ├────┤      │
│                                                   │ 🎒 │      │
│                                                   ├────┤      │
│                                                   │ 🛒 │      │
│                                                   └────┘      │
│                                                                │
│                    ┌──────────────┐                             │
│                    │ ⛏ Inferno [G]│                             │
│                    └──────────────┘                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2.3 Element-Definitionen

#### TOP-LEFT: Currency Display
```
┌──────────────────┐
│  ◉  12.4K        │   ◉ = Goldener Coin-Icon mit Glow-Pulse
└──────────────────┘   Bounce-Animation bei Coin-Gain
                       Count-Up-Animation (Slot-Machine-Roll bei großen Beträgen)
                       Formatierung: 1K, 10K, 1.2M, 3.5B
```
- **Idle:** Coin-Icon rotiert minimal (3° hin und her, 2s Sine)
- **On Gain:** Panel bounced (scale 1.0 → 1.08 → 1.0, Spring), Zahl rollt hoch
- **Big Gain (>1000):** Zusätzlich goldener Screen-Flash (0.1s), Partikel sprühen aus dem Counter

#### TOP-LEFT (darunter): Level & XP
```
┌──────────────────┐
│ Lv.8  ████████░░ │   Level-Badge (Stardust Purple, Pill-Shape)
└──────────────────┘   XP-Bar mit Gradient (Cosmic Blue → Nebula Cyan)
                       Shimmer-Overlay läuft alle 3s durch
                       XP-Text nur on-hover/tap sichtbar (z.B. "340/500")
```
- **Idle:** Shimmer gleitet über die XP-Bar (endlos, subtle)
- **XP Gain:** Bar füllt sich smooth (0.5s), grüner Pulse am Füllende
- **Near Level-Up (>90%):** Bar pulst golden, Badge vibriert leicht
- **Level-Up:** Badge explodiert kurz (scale 1.0 → 1.5 → 1.0, Elastic), Farbe flasht Gold

#### TOP-RIGHT: Quick Actions (Icon-Only!)
```
┌────┐
│ ⚙  │   Settings (Gear-Icon)
├────┤   
│ 🔊 │   Sound Toggle (Speaker mit Wellen / durchgestrichen)
├────┤
│ ≡  │   Menu (Hamburger → öffnet Pause/Settings Overlay)
└────┘
```
- **Nur Icons, KEIN Text.** Selbsterklärend.
- Hover/Tap: Scale 1.0 → 1.1, Glow intensiviert
- Press: Scale 0.95, Farbe heller (0.1s)

#### RIGHT EDGE: Action Dock (Icon-Only Vertical Bar)
```
┌────┐
│ 🌍 │   Planet-Menü / Teleport-Menü
├────┤
│ 🎒 │   Inventar (wenn implementiert)
├────┤
│ 🛒 │   Shop Quick-Access
├────┤
│ 📊 │   Leaderboard
└────┘
```
- **Vertikal gestapelt** am rechten Rand, mit 8px Gap
- Jeder Button = 48x48px Cosmic Glass Panel
- **Active State:** Icon leuchtet in Accent-Farbe, Panel-Stroke wird sichtbar
- **Notification Dot:** Kleiner roter/goldener Punkt oben-rechts am Icon (bei News)
- **Tap:** Öffnet jeweiliges Full-Screen Overlay

#### BOTTOM-CENTER: Equipped Pickaxe
```
        ┌──────────────────────┐
        │  ⛏ Inferno    [G]   │   Pickaxe-Icon (32x32) + Name + Hotkey-Badge
        └──────────────────────┘
```
- **Idle:** Pickaxe-Icon hat subtilen Glow in Pickaxe-Farbe
- **Mining:** Icon schwingt leicht (Rotation -5° → 5°, schnell)
- **Swap:** Altes Icon fliegt nach unten raus, neues bounced von unten rein (Spring)

### 2.4 Kontextuelle HUD-Elemente

Diese erscheinen NUR wenn relevant:

**Mining-Modus (auf Planet):**
```
┌──────────────────┐
│  ⛏ Stone  3/5   │   Material-Progress zum nächsten Level-Up
│  ████████░░░░░░░ │   Zeigt welches Material + wie viele noch fehlen
└──────────────────┘   Position: unter dem Level-Badge
                       Erscheint mit Slide-Down (Spring), verschwindet wenn nicht auf Planet
```

**Wrong Planet Warning:**
```
        ┌─────────────────────────┐
        │  ⚠ Wrong Planet!  [→]  │   Pulsiert in Comet Orange
        └─────────────────────────┘   [→] Button teleportiert zum richtigen Planeten
                                      Bounce-In, pulsierende Animation
```

**Hub-Button (in Stages):**
```
┌────────────────┐
│  🏠 Hub   [H]  │   Oben-links, unter dem Currency Display
└────────────────┘   Locked-State: Ausgegraut, "Lv.3" Badge drauf
```

---

## 3. ANIMATION SYSTEM: "Cosmic Motion"

### 3.1 Grundprinzip

**JEDE UI-Interaktion hat eine Animation.** Nichts passiert ohne visuelle Bestätigung.

Wir nutzen **Spring-basierte Animationen** statt Standard-Tweens für organischeres Feeling:

```
SPRING PRESETS:
──────────────
Snappy:     Frequency 8,  Damping 0.8  → Buttons, kleine Interaktionen (0.15s)
Bouncy:     Frequency 5,  Damping 0.5  → Panel-Entrance, Rewards (0.4s)  
Elastic:    Frequency 3,  Damping 0.3  → Level-Up, Big Moments (0.6s)
Gentle:     Frequency 4,  Damping 0.9  → Tooltips, Info-Panels (0.3s)

EASING (für nicht-Spring Animationen):
──────────────────────────────────────
Entrance:   Back.Out (Overshoot-Bounce)
Exit:       Quad.In (schnell raus)
Fill:       Quad.Out (smooth fill)
Loop:       Sine.InOut (breathing)
Flash:      Linear (instant feedback)
```

### 3.2 Animation-Katalog

#### Entrance Animations (Panel erscheint)
```
1. SLIDE + BOUNCE:
   Panel startet 60px offset (links → links, rechts → rechts, unten → unten)
   + Opacity 0 → 1
   + Scale 0.9 → 1.0
   Spring: Bouncy (0.4s)
   Stagger: 0.1s zwischen Panels

2. POP-IN (für Modals/Overlays):
   Scale 0.7 → 1.0 (Elastic Spring)
   + Opacity 0 → 1
   + Background-Dim 0 → 0.7 (0.2s)
   Duration: 0.5s

3. REVEAL (für Listen-Items):
   Each item: Slide von rechts + Opacity
   Stagger: 0.05s pro Item
   Spring: Gentle
```

#### Exit Animations
```
1. SLIDE-OUT:
   Reverse von Entrance aber SCHNELLER (0.15s, Quad.In)
   Kein Bounce (rausgehen soll sich "decisive" anfühlen)

2. SHRINK-OUT (für Modals):
   Scale 1.0 → 0.9 + Opacity → 0 (0.15s)
   Background-Dim → 0 (0.2s)
```

#### Interaction Animations
```
BUTTON TAP:
  Down: Scale 1.0 → 0.92 (0.08s, instant)
  Up:   Scale 0.92 → 1.0 (Spring: Snappy)
  + Glow flash (Accent-Farbe, 0.1s)

TOGGLE:
  Knob gleitet zur anderen Seite (Spring: Bouncy)
  + Farbe wechselt (0.2s)
  + Subtle Haptic-Feedback (wenn verfügbar)

TAB SWITCH:
  Active-Tab: Scale 1.0 → 1.05, Stroke-Glow intensiviert
  Content: Crossfade (0.15s) + Slide 20px in Tab-Richtung

SLIDER:
  Thumb folgt Finger mit Spring-Delay (Gentle)
  Fill-Bar folgt smooth
  Value-Label poppt über dem Thumb auf

CARD HOVER/SELECT:
  Scale 1.0 → 1.04 (Spring: Snappy)
  Glow-Intensität: 0.85 → 0.6
  Stroke: Transparency 0.5 → 0.1
  Shadow wird stärker
```

#### Idle / Breathing Animations (IMMER aktiv)
```
COIN ICON:
  Subtle Rotation: -2° → 2° (Sine, 3s)
  Glow Pulse: Transparency 0.8 → 0.5 (Sine, 2s)

XP BAR SHIMMER:
  Weißer Highlight-Streifen gleitet von links nach rechts (Linear, 3s, Loop)

PLANET ICON:
  Scale Pulse: 1.0 → 1.05 (Sine, 2.5s)

LEVEL BADGE (near level-up):
  Gold Glow Pulse: Sine, 1.5s
  Subtle Wobble: Rotation -1° → 1°

ACTION DOCK ICONS:
  Subtle Float: Y offset 0 → -2px → 0 (Sine, 4s, gestaggert pro Icon)

RARITY GLOW (Legendary+):
  Animated Gradient-Rotation auf dem Stroke
  + Subtle Particle Emission
```

### 3.3 Dopamin-Trigger-Matrix

| Event | Visual | Camera | Sound | Screen |
|-------|--------|--------|-------|--------|
| **Ore Hit** | Damage-Zahl poppt + Sparks | Micro-Shake (1px, 0.05s) | Crunch/Ping | - |
| **Ore Break** | Explosion-Particles + Material-Toast | Shake (3px, 0.15s) | Satisfying Break | Subtle Flash |
| **Coin Gain** | Counter Roll-Up + Bounce | - | Cha-Ching | - |
| **Big Coin Gain** | Counter + Gold-Partikel-Burst | - | Epic Cha-Ching | Gold Flash |
| **XP Gain** | XP-Bar Fill + Green Pulse | - | Soft Chime | - |
| **Near Level-Up** | Bar Gold-Pulse + Badge Wobble | - | Tension Build | - |
| **LEVEL UP!** | Full Celebration Sequence | Shake (5px, 0.3s) | Victory Fanfare | White Flash + Gold |
| **Rare Drop** | Showcase-Frame + Rainbow-Glow | Zoom (subtle) | Rare Sound | Dim + Spotlight |
| **Achievement** | Badge flies in + Confetti | - | Achievement Sound | - |
| **Shop Purchase** | Item flies to Inventory + Sparkles | - | Purchase Ding | - |
| **Pickaxe Equip** | Old out + New in (Spring) + Aura | - | Equip Sound | Color Flash |
| **Planet Unlock** | Planet zooms into view + Orbit | Camera Pan | Epic Unlock | Starfield Warp |
| **Teleport** | Warp-Tunnel Effect | Full Movement | Whoooosh | Full Warp Overlay |

### 3.4 "Level Up!" Celebration Sequence (Signature Moment)

Das Level-Up ist DER Signature-Moment im Spiel. Muss sich EPIC anfühlen:

```
TIMELINE:
─────────
0.00s  Screen Flash (White → Gold, 0.15s)
0.05s  Camera Shake (intensity 5, 0.3s, decreasing)
0.10s  Background Dim (0 → 0.7, 0.2s)
0.15s  "LEVEL UP!" Text — Elastic Spring von Scale 0 → 1 (0.6s)
       → Text hat animated Gradient (Gold → White → Gold, looping)
       → Glow dahinter pulsiert
0.30s  Level-Zahl bounced rein: "Level 8" (Spring: Bouncy)
0.40s  Star-Particles burst outward (20-30 Sterne, verschiedene Größen)
       → Farben: Gold, White, Cosmic Blue
       → Rotation + Scale-Down + Fade (0.8-1.5s)
0.50s  Unlock-Preview (falls was unlocked wurde):
       "🔓 New Planet: Mars!" — Slide von unten (Gentle Spring)
1.00s  Sound: Victory Fanfare Peak
2.50s  Alles faded aus (0.5s, Quad.In)
3.00s  Cleanup, HUD-Badge updated mit Bounce

TOTAL: 3 Sekunden — kurz genug um nicht zu nerven, lang genug um sich besonders anzufühlen
```

---

## 4. FULL-SCREEN OVERLAYS

### 4.1 Overlay-Grundstruktur

Alle Full-Screen-Menüs nutzen dasselbe Pattern:

```
┌────────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░ Background Dim (0.7 Opacity) ░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░ + Subtile Star-Particles ░░░░░░░░░░░░░░░░░░░░░  │
│  ░░                                                      ░░  │
│  ░░   ┌──────────────────────────────────────────────┐   ░░  │
│  ░░   │                                              │   ░░  │
│  ░░   │              CONTENT PANEL                   │   ░░  │
│  ░░   │         (Cosmic Glass, Elevated)             │   ░░  │
│  ░░   │                                              │   ░░  │
│  ░░   │                                              │   ░░  │
│  ░░   └──────────────────────────────────────────────┘   ░░  │
│  ░░                                                      ░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└────────────────────────────────────────────────────────────────┘

Entrance: POP-IN (Scale 0.7→1.0 Elastic + Dim 0→0.7)
Exit: SHRINK-OUT (Scale 1.0→0.9 + Fade)
Close: [X] Button oben-rechts (48x48) ODER Tap auf Dim-Background
```

### 4.2 Shop Overlay

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌────┐  ┌──────────────────────────────────────────┐  │
│   │ ⛏  │  │                                          │  │
│   ├────┤  │   ┌──────┐  ┌──────┐  ┌──────┐          │  │
│   │ ⬆  │  │   │      │  │      │  │      │          │  │
│   ├────┤  │   │ Item │  │ Item │  │ Item │          │  │
│   │ 🔲 │  │   │ Card │  │ Card │  │ Card │          │  │
│   ├────┤  │   │      │  │      │  │      │          │  │
│   │ ⭐ │  │   │ 500🪙│  │ 1.2K🪙│  │ R$99 │          │  │
│   │    │  │   └──────┘  └──────┘  └──────┘          │  │
│   │    │  │                                          │  │
│   │    │  │   ┌──────┐  ┌──────┐  ┌──────┐          │  │
│   │    │  │   │ LOCK │  │      │  │ LOCK │          │  │
│   │    │  │   │ 🔒   │  │ Item │  │ 🔒   │          │  │
│   │    │  │   │ Lv.5 │  │ Card │  │ Lv.10│          │  │
│   │    │  │   └──────┘  └──────┘  └──────┘          │  │
│   │    │  │                                          │  │
│   └────┘  └──────────────────────────────────────────┘  │
│                                                    [X]  │
│              ┌──────────────────────┐                    │
│              │  🪙 Balance: 12,400  │                    │
│              └──────────────────────┘                    │
└─────────────────────────────────────────────────────────┘

LEFT SIDEBAR: Icon-Only Category Tabs (vertikal)
  ⛏ = Pickaxes
  ⬆ = Upgrades  
  🔲 = Borders
  ⭐ = Premium (Robux)

GRID: 3 Spalten (Mobile), 4 Spalten (Desktop/Tablet)
BOTTOM: Aktueller Coin-Balance (immer sichtbar beim Shoppen)
```

**Item Card Aufbau:**
```
┌──────────────────┐  ← UICorner 12px
│                  │  ← Rarity-Gradient Background
│    [64x64 ICON]  │     (Common=grau, Rare=blau, Legendary=gold shimmer)
│                  │
│  Item Name       │  ← Fredoka, Body size, centered
│  ─────────────── │
│  🪙 500          │  ← Preis mit Currency-Icon
│  [BUY]           │  ← Button: Cosmic Blue, Pill-Shape
└──────────────────┘

States:
- Default: Wie oben
- Hover: Scale 1.04 (Snappy Spring), Glow stärker, Stroke sichtbar
- Owned: Grüner Checkmark-Badge oben-rechts, "OWNED" statt Preis
- Equipped: Goldener Rahmen + "EQUIPPED" Badge + pulsierender Glow
- Locked: Overlay dunkel (0.6), Lock-Icon zentriert, "Lv.X" darunter
- Insufficient Funds: Preis-Text wird rot, Button disabled (grau)

Buy-Animation:
1. Button pressed → Scale down (0.92)
2. Coins-Counter rollt runter
3. Item-Icon fliegt nach oben-rechts (zum Inventar-Icon) mit Partikel-Trail
4. "Purchased!" Toast erscheint
5. Card updated zu "Owned" State mit Bounce
```

### 4.3 Planet/Teleport Overlay

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    SOL SYSTEM                           │
│            ┌─────────────────────┐                      │
│            │ ☀ (Sun in center)   │                      │
│         ⊙  │      ⊙    ⊙        │  ⊙                   │
│            │   ⊙     ⊙          │                      │
│            │      ⊙              │                      │
│            └─────────────────────┘                      │
│                                                         │
│   ┌──────────────────────────────────────────────────┐  │
│   │ 🪨 Stone    │ ⛏ Copper  │ 🔒 Iron   │ 🔒 ???   │  │
│   │   Lv.1 ✓   │  Lv.3 ✓   │  Lv.5     │  Lv.8    │  │
│   │  [TRAVEL]  │ [TRAVEL]  │  Lv.5 🔒  │  Lv.8 🔒 │  │
│   └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

- Orbiting-Animation: Planeten kreisen langsam um die Sonne
- Tap auf Planet: Zoom-In + Info-Card poppt auf
- Unlocked: Farbig, leuchtend, name sichtbar
- Locked: Grau, Silhouette, "???" oder Name mit Lock
- Current: Pulsierender Ring drumherum
- Travel-Button: Cosmic Blue, Spring-Animation beim Tap
```

### 4.4 Leaderboard Overlay

```
┌─────────────────────────────────────────┐
│                                         │
│   ┌──────┐ ┌──────┐ ┌──────┐          │
│   │Power │ │Level │ │Coins │  ← Tabs   │
│   └──────┘ └──────┘ └──────┘          │
│                                         │
│   🥇  PlayerName        Lv. 42         │
│   🥈  PlayerName        Lv. 38         │
│   🥉  PlayerName        Lv. 35         │
│    4   PlayerName        Lv. 31         │
│    5   PlayerName        Lv. 28         │
│   ...                                   │
│   ─────────────────────────────────     │
│   📍 YOU: #127   PlayerName   Lv. 8    │  ← Immer sichtbar, sticky unten
│                                         │
└─────────────────────────────────────────┘

- Top 3: Gold/Silber/Bronze Medaillen mit Glow
- Eigene Position: Immer unten sichtbar, hervorgehoben (Gold-Stroke)
- Stagger-Animation: Zeilen fliegen nacheinander rein (0.05s pro Zeile)
- Tab-Switch: Content slide-animiert in Tab-Richtung
```

---

## 5. NOTIFICATION & FEEDBACK SYSTEM

### 5.1 Layer-Hierarchie

```
Layer 10:  HUD (immer sichtbar)
Layer 20:  Material Toasts (bottom-right, stackend)
Layer 30:  Coin Popups (center, float up)
Layer 40:  Info Toasts (top-center)
Layer 50:  Full-Screen Overlays (Shop, Planet, Leaderboard)
Layer 60:  Level-Up Celebration
Layer 70:  Screen Effects (Flash, Shake)
Layer 80:  Critical Notifications (Disconnect, Error)
```

### 5.2 Notification Types

#### Damage Numbers (beim Mining)
```
Erscheinen am Hit-Point des Erzes:
- Zahl: "-15" (Supernova Red Text, fett)
- Animation: Float up (30px) + Scale 1.2→0.8 + Fade (0.6s)
- Random horizontal offset (-10 bis +10px) → sieht natürlich aus
- Crit-Hits: Größere Zahl, Gold-Farbe, "CRIT!" Text, Screen-Shake

Camera Micro-Shake bei jedem Hit:
- Intensity: 1-2px
- Duration: 0.05s
- Richtung: Random
```

#### Material Pickup Toast (Bottom-Right Stack)
```
┌──────────────────────┐
│ ▮ +3 Copper Ore      │   ▮ = Farbiger Seitenstreifen (Material-Farbe)
└──────────────────────┘   Slide-In von rechts (Spring: Bouncy)
                           Max 5 sichtbar, älteste werden nach oben gepusht
                           Auto-Dismiss nach 2.5s (Slide-Out rechts, 0.15s)
                           
Duplikate: Wenn selbes Material nochmal reinkommt,
           existierender Toast UPDATED sich (Zahl pulst hoch)
           statt neuen Toast zu spawnen → cleaner!
```

#### Coin Gain Popup (Center, Float Up)
```
        +250 🪙
    ↑ floats up + fades

- Position: Center-Screen, leicht versetzt
- Scale Bounce-In: 0→1 (Spring: Snappy, 0.2s)
- Float Up: 80px über 1.2s + Opacity→0
- Big Amount (>1000): 
  → Größerer Text
  → Gold-Partikel sprühen
  → Coin-Icon rotiert
```

#### Info Toast (Top-Center)
```
        ┌──────────────────────────┐
        │  ℹ Planet unlocked!     │   Slide von oben (Spring: Gentle)
        └──────────────────────────┘   3s sichtbar, dann Slide-Out nach oben
                                       Icon-Circle links (farbcodiert: info=blau, warn=orange, error=rot)
                                       Max 3 gestapelt
```

#### Rare Drop Showcase (Signature Moment)
```
Wenn ein seltenes Material gedroppt wird:

1. Screen Dim (0.5)
2. Material-Chunk 3D-Modell fliegt zur Kamera
3. Spotlight-Effekt + Rarity-Glow
4. Name + Rarity-Text erscheint:
   ┌────────────────────────┐
   │   ★ EPIC DROP! ★       │
   │                        │
   │      [3D ORE ICON]     │
   │                        │
   │    Diamond Ore x1      │
   │   ──────────────────   │
   │   "A rare cosmic gem"  │
   └────────────────────────┘
5. Confetti + Partikel-Burst
6. Auto-Dismiss nach 2s

→ Kann per Settings deaktiviert werden (für Grinder die nicht unterbrochen werden wollen)
```

---

## 6. MOBILE RESPONSIVENESS

### 6.1 Scaling-Strategie

**KEIN Pixel-basiertes Layout mehr.** Alles über relative Units:

```lua
-- SCALING SYSTEM
-- Alle Größen relativ zur kleineren Screen-Dimension
local camera = workspace.CurrentCamera
local viewportSize = camera.ViewportSize
local baseUnit = math.min(viewportSize.X, viewportSize.Y) / 100

-- Beispiel: Panel ist 20 Units breit, 5 Units hoch
-- Auf 1080p: 20 * 10.8 = 216px
-- Auf Mobile (720p): 20 * 7.2 = 144px → proportional kleiner
```

### 6.2 Breakpoints

```
MOBILE (< 600px Breite):
  - Shop Grid: 2 Spalten
  - HUD Panels: Kleinere Fonts (Caption statt Body)
  - Action Dock: Icons 40px statt 48px
  - Tooltips: Tap-and-Hold statt Hover

TABLET (600-1024px):
  - Shop Grid: 3 Spalten
  - Standard HUD
  - Touch-optimiert

DESKTOP (> 1024px):
  - Shop Grid: 4 Spalten
  - Hover-States aktiv
  - Keyboard-Shortcuts sichtbar ([G], [H], etc.)
```

### 6.3 Touch-Spezifisch
- **Long-Press** = Hover/Tooltip (0.5s hold → Info erscheint)
- **Swipe** auf Overlays = Dismiss (Slide-Out in Swipe-Richtung)
- **Double-Tap** auf Item = Quick-Buy/Equip
- **Drag** im Planet-Menü = Orbit drehen
- **Pinch** = Kein Zoom (Roblox Standard)

---

## 7. NPC DIALOG SYSTEM

### 7.1 Dialog-UI Design

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                      [ GAMEPLAY sichtbar ]                     │
│                                                                │
│                                                                │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  ┌────────┐                                              │  │
│  │  │  NPC   │   Wizzle the Wizard                         │  │
│  │  │ SPRITE │   ────────────────────                      │  │
│  │  │ (96px) │   "Ready to explore a new                   │  │
│  │  │        │    planet, young miner?"                     │  │
│  │  └────────┘                                              │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Travel     │  │    Shop      │  │   Bye! 👋    │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

- Panel: Am unteren Bildschirmrand (30% der Höhe)
- NPC-Sprite: Links, groß (96x96), leicht bounce-animiert
- Dialog-Text: Typewriter-Effekt (Buchstabe für Buchstabe, 30ms/char)
- Tap anywhere / Space: Kompletten Text sofort zeigen
- Options: Horizontal, Icon+Text, jeweils ein Cosmic Glass Button
- Entrance: Slide von unten (Spring: Bouncy)
- Exit: Slide nach unten (0.2s)
```

### 7.2 NPC Interaction Trigger
```
Approach-Radius um NPC (10 studs):
→ Kleiner Interact-Hint erscheint über NPC:
  ┌─────┐
  │  E  │   oder Touch-Icon auf Mobile
  └─────┘
  (Floating, bounce-animiert)

→ NPC dreht sich zum Spieler
→ Tap/E → Dialog-Panel erscheint
```

---

## 8. SOUND DESIGN INTEGRATION

Jedes UI-Element braucht Sound. Hier die Sound-Map:

```
INTERACTIONS:
  button_hover:      Soft whoosh (50ms)
  button_press:      Satisfying click (80ms)
  button_release:    Soft pop (60ms)
  tab_switch:        Slide whoosh (100ms)
  menu_open:         Cosmic whoosh + chime (200ms)
  menu_close:        Reverse whoosh (150ms)
  toggle_on:         Rising chime (100ms)
  toggle_off:        Falling chime (100ms)

FEEDBACK:
  ore_hit:           Crunch/Ping (varies by material)
  ore_break:         Satisfying shatter (300ms)
  coin_gain:         Cha-ching (150ms)
  coin_gain_big:     Epic cha-ching + sparkle (300ms)
  xp_gain:           Soft rising tone (100ms)
  material_pickup:   Soft collect sound (100ms)
  
CELEBRATIONS:
  level_up:          Victory fanfare (2s)
  rare_drop:         Epic discovery chord (1.5s)
  achievement:       Achievement unlock jingle (1s)
  planet_unlock:     Cosmic reveal (2s)
  
AMBIENT:
  menu_background:   Soft space ambience (loop)
  hub_ambience:      Station hum + distant stars (loop)
```

---

## 9. IMPLEMENTIERUNGS-ROADMAP

### Phase 1: Foundation (Cosmic Glass Design System)
**Agent: ui-ux (Riolu) + studio-engine (Enton)**

- [ ] `CosmicUI` Modul erstellen — Panel-Factory, Animation-Presets, Color Constants
- [ ] Spring-Tween-System implementieren (oder Quantum Library integrieren)
- [ ] Responsive Scaling-System (weg von Pixel, hin zu relative Units)
- [ ] Icon-Set erstellen/sourcing (einheitlicher Stil, ~30 Icons)

### Phase 2: HUD Overhaul
**Agent: ui-ux (Riolu)**

- [ ] HudClient komplett refactoren auf CosmicUI-Basis
- [ ] Neue Layout-Struktur (Corners-Only)
- [ ] Action Dock (rechte Seite, vertikal)
- [ ] Kontextuelle Elemente (Mining Progress, Wrong Planet)
- [ ] Alle Idle-Breathing-Animationen
- [ ] Responsive Breakpoints implementieren

### Phase 3: Overlays
**Agent: ui-ux (Riolu) + studio-engine (Enton)**

- [ ] Shop Overlay (Full-Screen, Tab-System, Item Cards)
- [ ] Planet/Teleport Overlay (Solar System View)
- [ ] Leaderboard Overlay
- [ ] Settings Overlay
- [ ] Shared: Overlay-Manager (stacking, transitions, input blocking)

### Phase 4: Notifications & Juice
**Agent: ui-ux (Riolu)**

- [ ] NotificationClient refactoren auf CosmicUI
- [ ] Damage Numbers System (am Hit-Point)
- [ ] Material Toast Stacking (mit Duplikat-Merge!)
- [ ] Level-Up Celebration Sequence (komplett neu)
- [ ] Rare Drop Showcase
- [ ] Screen Effects (Flash, Shake, Dim)

### Phase 5: NPC & Dialog
**Agent: ui-ux (Riolu) + world-content (Bidiza)**

- [ ] NPC Dialog Panel
- [ ] Typewriter-Effekt
- [ ] NPC Interaction Trigger (Approach + Hint)
- [ ] Dialog-Flow-System (Choices, Branching)

### Phase 6: Sound Integration
**Agent: studio-engine (Enton)**

- [ ] Sound-Asset-Sourcing (KI-generiert oder Marketplace)
- [ ] SoundManager Modul
- [ ] Alle Interactions mit Sound versehen
- [ ] Celebration Sounds
- [ ] Ambient Sounds

### Phase 7: Polish & Testing
**Agent: qa-balance (Felino)**

- [ ] Mobile Testing (verschiedene Auflösungen)
- [ ] Performance-Profiling (zu viele Tweens?)
- [ ] A/B Testing der Dopamin-Trigger (zu viel? zu wenig?)
- [ ] Accessibility-Check (Kontrast, Touch-Targets)

---

## 10. DESIGN TOKENS (für Code-Referenz)

```lua
-- CosmicUI Design Tokens
local Cosmic = {
    Colors = {
        Void         = Color3.fromRGB(8, 8, 26),
        DeepSpace    = Color3.fromRGB(13, 14, 30),
        NebulaDark   = Color3.fromRGB(22, 26, 50),
        NebulaLight  = Color3.fromRGB(30, 36, 64),
        CosmicBlue   = Color3.fromRGB(61, 170, 255),
        Stardust     = Color3.fromRGB(120, 90, 230),
        SolarGold    = Color3.fromRGB(255, 207, 51),
        PlasmaGreen  = Color3.fromRGB(80, 210, 130),
        NebulaCyan   = Color3.fromRGB(60, 200, 255),
        SupernovaRed = Color3.fromRGB(232, 80, 64),
        CometOrange  = Color3.fromRGB(255, 149, 51),
        PulsarWhite  = Color3.fromRGB(240, 240, 255),
        DustGrey     = Color3.fromRGB(160, 165, 190),
    },
    
    Rarity = {
        Common    = Color3.fromRGB(176, 184, 200),
        Uncommon  = Color3.fromRGB(80, 210, 130),
        Rare      = Color3.fromRGB(61, 170, 255),
        Epic      = Color3.fromRGB(120, 90, 230),
        Legendary = Color3.fromRGB(255, 207, 51),
        Mythic    = Color3.fromRGB(255, 68, 102),
    },
    
    Spring = {
        Snappy  = {frequency = 8,  damping = 0.8},
        Bouncy  = {frequency = 5,  damping = 0.5},
        Elastic = {frequency = 3,  damping = 0.3},
        Gentle  = {frequency = 4,  damping = 0.9},
    },
    
    Radius = {
        Small  = UDim.new(0, 8),
        Normal = UDim.new(0, 12),
        Large  = UDim.new(0, 20),
    },
    
    Stroke = {
        Thin   = 1,
        Normal = 1.5,
        Bold   = 2.5,
    },
}
```

---

_Erstellt von: Geckarbor (project-ops) | Stand: 2026-04-09_
_Research: Roblox Top-Games Trends 2025-2026, Pet Sim 99, Blox Fruits, Anime Defenders, DevForum Best Practices_
_Next: Team-Kickoff für Phase 1 nach Hannes' Freigabe_
