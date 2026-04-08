#!/bin/bash
# Planet Miner — Dev Session Launcher
# Öffnet das Agent Office Dashboard und startet Claude Code

# Dashboard im Browser öffnen (lokale Datei, Live via Firebase)
xdg-open "$(dirname "$0")/office.html" 2>/dev/null &

echo "🚀 Planet Miner — Agent Office geöffnet"
echo "   Dashboard: office.html (Live via Firebase)"
echo "   Terminal Monitor: node tools/agent-monitor.mjs"
echo ""

# Claude Code starten
exec claude
