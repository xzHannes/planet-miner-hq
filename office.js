// ============================================================
// PLANET MINER – AGENT OFFICE (Pixel Art + Firebase Live)
// ============================================================

(function () {

  // ── Star Field (same as main dashboard) ──
  const starCanvas = document.getElementById("stars");
  const starCtx = starCanvas.getContext("2d");
  let stars = [];
  function initStars() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
    stars = [];
    const count = Math.floor((starCanvas.width * starCanvas.height) / 4000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(), d: Math.random() * 0.02 + 0.003,
        dir: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }
  function drawStars() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    const cols = ["rgba(180,200,255,", "rgba(255,220,180,", "rgba(200,180,255,"];
    stars.forEach(s => {
      s.a += s.d * s.dir;
      if (s.a >= 1 || s.a <= 0.1) s.dir *= -1;
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starCtx.fillStyle = cols[Math.floor(s.x * 3) % 3] + s.a + ")";
      starCtx.fill();
    });
    requestAnimationFrame(drawStars);
  }
  initStars(); drawStars();
  window.addEventListener("resize", initStars);

  // ── Agent Definitions ──
  const AGENTS = {
    "project-ops":    { label: "project-ops",    color: "#4eca6a", role: "Lead / Docs",     icon: "📋", x: 0, spritePng: "assets/sprites/geckarbor.png", spriteGif: "assets/sprites/geckarbor.gif", pokemon: "Geckarbor" },
    "studio-engine":  { label: "studio-engine",  color: "#fb923c", role: "Luau / Systems",   icon: "⚙️", x: 1, spritePng: "assets/sprites/enton.png",     spriteGif: "assets/sprites/enton.gif",     pokemon: "Enton" },
    "world-content":  { label: "world-content",  color: "#d4a056", role: "Planets / NPCs",   icon: "🌍", x: 2, spritePng: "assets/sprites/bidiza.png",    spriteGif: "assets/sprites/bidiza.gif",    pokemon: "Bidiza" },
    "ui-ux":          { label: "ui-ux",          color: "#a78bfa", role: "GUI / HUD",        icon: "🎨", x: 3, spritePng: "assets/sprites/riolu.png",     spriteGif: "assets/sprites/riolu.gif",     pokemon: "Riolu" },
    "qa-balance":     { label: "qa-balance",     color: "#22d3ee", role: "Testing / Balance", icon: "🔍", x: 4, spritePng: "assets/sprites/felino.png",   spriteGif: "assets/sprites/felino.gif",    pokemon: "Felino" },
  };

  // ── Agent Stats (from Firebase agent-stats collection) ──
  let agentStats = {}; // name -> { level, xp, totalInputTokens, totalOutputTokens, totalSessions, ... }

  // XP/Level constants (must match agent-stats.mjs)
  const TOKENS_PER_XP = 1000;
  const LEVEL_TABLE = [0, 30, 80, 160, 280, 450, 680, 1000, 1400, 2000, 2800, 3800, 5000, 6500, 8500, 11000, 14000, 18000, 23000, 30000];

  function getLevel(xp) {
    let level = 1;
    for (let i = 0; i < LEVEL_TABLE.length; i++) {
      if (xp >= LEVEL_TABLE[i]) level = i + 1; else break;
    }
    return level;
  }
  function getXpInLevel(xp, level) { return xp - (LEVEL_TABLE[level - 1] || 0); }
  function getXpForLevel(level) {
    const base = LEVEL_TABLE[level - 1] || 0;
    const next = LEVEL_TABLE[level];
    return next ? next - base : 0;
  }
  function fmtTokens(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }
  function calcCost(inp, out) { return (inp / 1e6) * 15 + (out / 1e6) * 75; }

  // ── Sprite DOM Elements ──
  const spriteOverlay = document.getElementById("sprite-overlay");
  const spriteElements = {};
  Object.keys(AGENTS).forEach(name => {
    const img = document.createElement("img");
    img.src = AGENTS[name].spritePng;
    img.alt = AGENTS[name].pokemon;
    img.dataset.agent = name;
    img.style.pointerEvents = "auto";
    img.style.cursor = "pointer";
    spriteOverlay.appendChild(img);
    spriteElements[name] = img;
  });

  // ── Sprite ↔ Card linking (hover sprite highlights card) ──
  let highlightedCard = null;

  Object.keys(AGENTS).forEach(name => {
    const el = spriteElements[name];
    el.addEventListener("mouseenter", () => {
      const card = document.querySelector(`.agent-card[data-agent="${name}"]`);
      if (card) {
        if (highlightedCard) highlightedCard.classList.remove("card-highlighted");
        card.classList.add("card-highlighted");
        highlightedCard = card;
      }
    });
    el.addEventListener("mouseleave", () => {
      if (highlightedCard) { highlightedCard.classList.remove("card-highlighted"); highlightedCard = null; }
    });
  });

  const STATUS_META = {
    working:  { label: "WORKING",  dot: "#22c55e", cls: "status-working"  },
    idle:     { label: "IDLE",     dot: "#6b7a96", cls: "status-idle"     },
    thinking: { label: "THINKING", dot: "#f0b429", cls: "status-thinking" },
    waiting:  { label: "WAITING",  dot: "#fb923c", cls: "status-waiting"  },
    done:     { label: "DONE",     dot: "#22d3ee", cls: "status-done"     },
  };

  // ── State ──
  let agentData = {};       // name -> firestore doc
  // Load persisted activity log from localStorage
  let activityLog = [];
  try {
    const saved = JSON.parse(localStorage.getItem("agent-activity-log") || "[]");
    activityLog = saved.map(e => ({ ...e, time: new Date(e.time) }));
  } catch (_) {}
  let frame = 0;

  // ── Pixel Office Canvas ──
  const canvas = document.getElementById("office");
  const ctx = canvas.getContext("2d");
  const PX = 7;  // pixel scale

  // Desk sprite (16x6)
  const DESK = [
    [0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0],
    [0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0],
    [0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0],
    [0,0,3,0,0,0,0,0,0,0,0,0,0,3,0,0],
    [0,0,3,0,0,0,0,0,0,0,0,0,0,3,0,0],
    [0,0,3,0,0,0,0,0,0,0,0,0,0,3,0,0],
  ];

  // Monitor sprite (8x6)
  const MONITOR = [
    [0,3,3,3,3,3,3,0],
    [0,3,1,1,1,1,3,0],
    [0,3,1,1,1,1,3,0],
    [0,3,1,1,1,1,3,0],
    [0,3,3,3,3,3,3,0],
    [0,0,0,3,3,0,0,0],
  ];

  function drawDesk(ox, oy) {
    for (let y = 0; y < DESK.length; y++) {
      for (let x = 0; x < DESK[y].length; x++) {
        if (DESK[y][x] === 0) continue;
        ctx.fillStyle = "#2a3552";
        ctx.fillRect((ox + x) * PX, (oy + y) * PX, PX, PX);
      }
    }
  }

  function drawMonitor(ox, oy, active) {
    for (let y = 0; y < MONITOR.length; y++) {
      for (let x = 0; x < MONITOR[y].length; x++) {
        if (MONITOR[y][x] === 0) continue;
        ctx.fillStyle = MONITOR[y][x] === 3 ? "#3d4e6a" : (active ? "#22c55e" : "#1a2540");
        ctx.fillRect((ox + x) * PX, (oy + y) * PX, PX, PX);
      }
    }
  }

  // Thought bubble
  function drawBubble(ox, oy, text) {
    const fontSize = 11;
    ctx.font = `${fontSize}px 'Press Start 2P'`;
    const tw = ctx.measureText(text).width;
    const bw = tw + 16;
    const bh = fontSize + 10;
    const bx = ox * PX;
    const by = oy * PX - 4;
    // Bubble body
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 4);
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(bx + 8, by + bh);
    ctx.lineTo(bx + 4, by + bh + 6);
    ctx.lineTo(bx + 14, by + bh);
    ctx.fill();
    // Text
    ctx.fillStyle = "#111";
    ctx.fillText(text, bx + 8, by + fontSize + 3);
  }

  // Floor pattern
  function drawFloor() {
    const floorY = 24;
    for (let x = 0; x < canvas.width / PX; x++) {
      for (let y = floorY; y < canvas.height / PX; y++) {
        if ((x + y) % 6 === 0) {
          ctx.fillStyle = "rgba(30,45,74,0.25)";
          ctx.fillRect(x * PX, y * PX, PX, PX);
        }
      }
    }
  }

  // ── Render Office ──
  function renderOffice() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width;
    const H = canvas.height;

    // Background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, W, H);

    // Wall
    const wallH = 24;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, W, wallH * PX);

    // Wall accent line
    ctx.fillStyle = "#1e2d4a";
    ctx.fillRect(0, (wallH - 1) * PX, W, PX);

    // Window 1
    const winW = 20; const winH = 12;
    ctx.fillStyle = "#060a14";
    ctx.fillRect(10 * PX, 3 * PX, winW * PX, winH * PX);
    ctx.strokeStyle = "#2a3552"; ctx.lineWidth = 3;
    ctx.strokeRect(10 * PX, 3 * PX, winW * PX, winH * PX);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
      ctx.fillRect((12 + Math.random() * 16) * PX, (5 + Math.random() * 8) * PX, PX * 0.6, PX * 0.6);
    }

    // Planet in window 1
    const planetPulse = Math.sin(frame * 0.02) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(59,158,255,${0.3 + planetPulse * 0.2})`;
    ctx.beginPath(); ctx.arc(20 * PX, 9 * PX, 4 * PX, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(167,139,250,${0.2 + planetPulse * 0.1})`;
    ctx.beginPath(); ctx.arc(20 * PX, 9 * PX, 2.5 * PX, 0, Math.PI * 2); ctx.fill();

    // "MISSION CONTROL" on wall
    ctx.fillStyle = "#2a3f66";
    ctx.font = "bold 16px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("MISSION CONTROL", W / 2, 13 * PX);
    ctx.textAlign = "left";

    // Window 2
    const canvasGridW = Math.floor(W / PX);
    ctx.fillStyle = "#060a14";
    ctx.fillRect((canvasGridW - 10 - winW) * PX, 3 * PX, winW * PX, winH * PX);
    ctx.strokeRect((canvasGridW - 10 - winW) * PX, 3 * PX, winW * PX, winH * PX);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
      ctx.fillRect(((canvasGridW - 10 - winW + 2) + Math.random() * 16) * PX, (5 + Math.random() * 8) * PX, PX * 0.6, PX * 0.6);
    }

    drawFloor();

    // Draw each agent workstation
    const names = Object.keys(AGENTS);
    const totalW = canvas.width / PX;
    const margin = 12;
    const slotW = (totalW - margin * 2) / names.length;
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / canvas.width;
    const scaleY = canvasRect.height / canvas.height;
    names.forEach((name, i) => {
      const def = AGENTS[name];
      const data = agentData[name] || { status: "idle" };
      const status = data.status || "idle";
      const cx = Math.floor(margin + i * slotW + slotW / 2 - 4);
      const deskY = 52;
      const charY = deskY - 14;

      // Desk
      drawDesk(cx - 4, deskY);

      // Monitor
      const monitorActive = status === "working" || status === "thinking";
      drawMonitor(cx, deskY - 7, monitorActive);

      // Monitor glow
      if (monitorActive) {
        ctx.fillStyle = `rgba(34,197,94,${0.06 + Math.sin(frame * 0.05) * 0.04})`;
        ctx.fillRect((cx - 2) * PX, (deskY - 9) * PX, 12 * PX, 12 * PX);
      }

      // Pokémon Sprite (DOM element, positioned over canvas)
      const spriteEl = spriteElements[name];
      if (spriteEl) {
        const isActive = status === "working" || status === "thinking";
        const wantedSrc = isActive ? def.spriteGif : def.spritePng;
        if (!spriteEl.src.endsWith(wantedSrc)) spriteEl.src = wantedSrc;

        // Use natural dimensions to preserve aspect ratio
        const spriteScale = 5;
        const natW = spriteEl.naturalWidth || 20;
        const natH = spriteEl.naturalHeight || 20;
        const sw = natW * spriteScale * scaleX;
        const sh = natH * spriteScale * scaleY;
        // Center horizontally on slot, sit on top of desk
        const sx = (cx + 4) * PX * scaleX - sw / 2;
        const deskTopPx = (deskY - 7) * PX * scaleY;  // top of monitor
        const sy = deskTopPx - sh - 2 * scaleY;
        // Add padding offset (6px from .office-canvas-wrap padding)
        spriteEl.style.left = (sx + 6) + "px";
        spriteEl.style.top = (sy + 6) + "px";
        spriteEl.style.width = sw + "px";
        spriteEl.style.height = sh + "px";
        spriteEl.style.opacity = isActive ? "1" : "0.75";
      }

      // Status dot (above sprite area)
      const meta = STATUS_META[status] || STATUS_META.idle;
      const dotY = deskY - 8 - 16;  // well above the desk/monitor
      ctx.fillStyle = meta.dot;
      ctx.beginPath();
      ctx.arc((cx + 4) * PX, dotY * PX, 5, 0, Math.PI * 2);
      ctx.fill();
      if (status === "working" || status === "thinking") {
        ctx.fillStyle = meta.dot.replace(")", ",0.3)").replace("rgb", "rgba");
        ctx.beginPath(); ctx.arc((cx + 4) * PX, dotY * PX, 9, 0, Math.PI * 2); ctx.fill();
      }

      // Thought bubble for working/thinking agents
      if (status === "working" && data.task) {
        drawBubble(cx + 7, dotY - 4, data.task);
      } else if (status === "thinking") {
        const dots = ".".repeat((Math.floor(frame / 15) % 3) + 1);
        drawBubble(cx + 7, dotY - 4, dots);
      }

      // Name label
      ctx.fillStyle = def.color;
      ctx.font = "11px 'Press Start 2P'";
      ctx.textAlign = "center";
      ctx.fillText(def.label, (cx + 4) * PX, (deskY + 11) * PX);

      // Role label
      ctx.fillStyle = "#6b7a96";
      ctx.font = "9px 'Press Start 2P'";
      ctx.fillText(def.role, (cx + 4) * PX, (deskY + 15) * PX);
      ctx.textAlign = "left";
    });

    frame++;
    requestAnimationFrame(renderOffice);
  }

  renderOffice();

  // ── Time Ago ──
  function timeAgo(ts) {
    if (!ts) return "—";
    const now = Date.now();
    const t = ts.toDate ? ts.toDate().getTime() : ts;
    const diff = Math.floor((now - t) / 1000);
    if (diff < 10) return "just now";
    if (diff < 60) return diff + "s ago";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }

  // ── Render Agent Cards ──
  function renderCards() {
    const grid = document.getElementById("agent-grid");
    grid.innerHTML = "";

    Object.keys(AGENTS).forEach(name => {
      const def = AGENTS[name];
      const data = agentData[name] || {};
      const stats = agentStats[name] || {};
      const status = data.status || "idle";
      const meta = STATUS_META[status] || STATUS_META.idle;
      const progress = data.progress || 0;

      // XP/Level from stats
      const totalInput = stats.totalInputTokens || 0;
      const totalOutput = stats.totalOutputTokens || 0;
      const totalTokens = totalInput + totalOutput;
      const xp = stats.xp || Math.floor(totalTokens / TOKENS_PER_XP);
      const level = stats.level || getLevel(xp);
      const xpInLvl = getXpInLevel(xp, level);
      const xpNeeded = getXpForLevel(level);
      const xpRatio = xpNeeded > 0 ? Math.min(xpInLvl / xpNeeded, 1) : 1;
      const cost = calcCost(totalInput, totalOutput);
      const sessions = stats.totalSessions || 0;

      const card = document.createElement("div");
      card.className = "agent-card";
      card.dataset.agent = name;
      card.style.setProperty("--agent-color", def.color);
      card.innerHTML = `
        <div class="card-header-row">
          <div>
            <div class="agent-name">${def.icon} ${def.label}</div>
            <div class="agent-status ${meta.cls}">
              <span style="width:6px;height:6px;border-radius:50%;background:${meta.dot};display:inline-block"></span>
              ${meta.label}
            </div>
          </div>
          <div class="card-level-badge">Lv.${level}</div>
        </div>
        <div class="card-xp-row">
          <div class="card-xp-track">
            <div class="card-xp-fill" style="width:${xpRatio * 100}%; background:${def.color}"></div>
          </div>
          <span class="card-xp-text">${xpInLvl}/${xpNeeded || "MAX"}</span>
        </div>
        <div class="agent-task">${data.task || "No task assigned"}</div>
        ${progress > 0 ? `
          <div class="agent-progress">
            <div class="agent-progress-fill" style="width:${progress}%"></div>
          </div>
        ` : ""}
        <div class="card-stats-row">
          <span class="card-stat-item" title="Total tokens used">${fmtTokens(totalTokens)} tok</span>
          <span class="card-stat-item" title="Sessions">${sessions} sess</span>
          <span class="card-stat-item card-cost" title="Est. cost (Opus 4)">$${cost.toFixed(2)}</span>
        </div>
        <div class="agent-time">${timeAgo(data.updatedAt)}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ── Update Stats ──
  function updateStats() {
    const all = Object.values(agentData);
    const active = all.filter(a => a.status === "working" || a.status === "thinking").length;
    const idle = Object.keys(AGENTS).length - active;
    const tasks = all.filter(a => a.task).length;

    document.getElementById("stat-active").textContent = active;
    document.getElementById("stat-idle").textContent = idle;
    document.getElementById("stat-tasks").textContent = tasks;
    document.getElementById("stat-sync").textContent = new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }

  // ── Activity Log ──
  function addLogEntry(agent, msg) {
    activityLog.unshift({
      time: new Date(),
      agent: agent,
      msg: msg,
    });
    if (activityLog.length > 50) activityLog.length = 50;
    try { localStorage.setItem("agent-activity-log", JSON.stringify(activityLog)); } catch (_) {}
    renderLog();
  }

  function renderLog() {
    const el = document.getElementById("activity-log");
    if (activityLog.length === 0) {
      el.innerHTML = '<div class="log-empty">Waiting for agent activity...</div>';
      return;
    }
    el.innerHTML = activityLog.map(e => {
      const def = AGENTS[e.agent] || { color: "#6b7a96" };
      // Extract status keyword from msg start and render as colored tag
      const statusMatch = e.msg.match(/^(WORKING|IDLE|THINKING|WAITING|DONE)/);
      let msgHtml;
      if (statusMatch) {
        const st = statusMatch[1].toLowerCase();
        const meta = STATUS_META[st] || STATUS_META.idle;
        const rest = e.msg.slice(statusMatch[1].length);
        msgHtml = `<span class="log-status-tag ${meta.cls}"><span style="width:6px;height:6px;border-radius:50%;background:${meta.dot};display:inline-block"></span>${statusMatch[1]}</span><span class="log-msg">${rest}</span>`;
      } else {
        msgHtml = `<span class="log-msg">${e.msg}</span>`;
      }
      return `<div class="log-entry">
        <span class="log-time">${e.time.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</span>
        <span class="log-agent" style="color:${def.color}">${e.agent}</span>
        ${msgHtml}
      </div>`;
    }).join("");
  }

  // ── Firebase Real-Time Listener ──
  db.collection("agents").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      const data = change.doc.data();
      const name = change.doc.id;
      const prev = agentData[name];

      agentData[name] = data;

      // Log status changes
      if (change.type === "modified" || change.type === "added") {
        if (!prev || prev.status !== data.status) {
          if (data.status === "idle") { /* skip idle spam in log */ }
          else {
            const meta = STATUS_META[data.status] || STATUS_META.idle;
            const taskInfo = data.task ? ` → ${data.task}` : "";
            addLogEntry(name, `${meta.label}${taskInfo}${data.description ? " — " + data.description : ""}`);
          }
        }
      }
    });

    renderCards();
    updateStats();
  });

  // ── Firebase: Agent Stats Listener ──
  db.collection("agent-stats").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      const data = change.doc.data();
      const name = change.doc.id;
      agentStats[name] = data;
    });
  });

  // Initial render
  renderCards();
  updateStats();
  renderLog();

})();
