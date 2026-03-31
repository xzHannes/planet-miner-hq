# Planet Miner — Automation & Community Pipeline

## Übersicht

```
Discord Server
├── #support          ──→  n8n (Raspberry Pi)  ──→  Firebase Tickets
├── #general-chat     ──→  n8n (Chat-Analyse)  ──→  Content-Report
└── #announcements    ←──  n8n (Auto-Posts)     ←──  Ticket-Abschlüsse
                              │
                              ▼
                     Chef-Briefing (Discord DM / Telegram)
```

## Infrastruktur

| Komponente | Wo | Status |
|-----------|-----|--------|
| n8n | Raspberry Pi (192.168.178.30) | Geplant |
| Discord Bot | Raspberry Pi | Geplant |
| Firebase | Cloud (roblox-404d7) | Läuft bereits |
| Ticket CLI | Lokal (tools/tickets.mjs) | Läuft bereits |
| Claude API | Für KI-Analyse | Geplant |

## Workflows

### 1. Support → Tickets (Prio 1)
**Trigger:** Nachricht in #support Channel
**Pipeline:**
1. Discord Bot empfängt Nachricht
2. n8n Webhook wird getriggert
3. KI analysiert: Bug / Feature Request / Frage / Sonstiges
4. KI extrahiert: Titel, Beschreibung, Priorität, Tags
5. Ticket wird in Firebase erstellt
6. Bot antwortet im Channel: "Ticket PM-XXX erstellt, danke!"

**KI-Klassifikation:**
- **Bug:** Spieler beschreibt etwas das nicht funktioniert → `priority: high`, `tags: [bug]`
- **Feature Request:** Spieler wünscht sich etwas → `priority: medium`, `tags: [feature]`
- **Frage:** Spieler fragt wie etwas funktioniert → Kein Ticket, Bot antwortet direkt oder verweist auf FAQ
- **Kritisch:** Crash, Datenverlust, Exploit → `priority: critical`, Hannes wird direkt benachrichtigt

### 2. Chef-Briefing (Prio 2)
**Trigger:** Täglich morgens + wöchentlich Sonntag
**Inhalt:**
- Neue/geschlossene Tickets seit letztem Briefing
- Offene kritische Issues
- Community-Stimmung (Sentiment-Score aus #support + #general)
- Top-Themen der Woche
- Spielerzahlen wenn verfügbar

**Zustellung:** Discord DM an Hannes oder Telegram

### 3. Chat-Analyse für Content (Prio 3)
**Trigger:** Wöchentlich
**Pipeline:**
1. Letzte 7 Tage #general-chat sammeln
2. KI-Analyse:
   - Sprachstil (formal/casual/slang)
   - Häufige Wörter und Phrases
   - Trending Topics
   - Stimmung (positiv/neutral/negativ)
   - Altersgruppen-Einschätzung
3. Report generieren: "So redet deine Community — passe deinen Content darauf an"

### 4. Auto-Announcements (Prio 4)
**Trigger:** Ticket wird geschlossen (Status: done)
**Pipeline:**
1. Firebase Trigger: Ticket Status → done
2. n8n prüft: Ist es ein Feature oder wichtiger Fix?
3. Generiert Announcement-Text
4. Postet in #announcements

## Implementierungs-Reihenfolge

1. **n8n aufsetzen** auf Raspberry Pi (Docker)
2. **Discord Bot erstellen** (discord.js oder Python)
3. **Support → Tickets** Workflow bauen
4. **Chef-Briefing** Workflow
5. **Chat-Analyse** Workflow
6. **Auto-Announcements** Workflow

## Voraussetzungen
- [ ] Discord Server erstellt
- [ ] Discord Bot Application registriert
- [ ] n8n auf Raspberry Pi installiert
- [ ] Firebase Admin SDK oder REST API Zugang für n8n
- [ ] Claude API Key für KI-Analyse

---
*Gepflegt von: project-ops*
*Status: Geplant — wird relevant wenn Discord-Server steht*
*Letztes Update: 2026-04-01*
