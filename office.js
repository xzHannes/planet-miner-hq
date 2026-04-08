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
    "project-ops":    { label: "project-ops",    color: "#3b9eff", role: "Lead / Docs",     icon: "📋", x: 0 },
    "studio-engine":  { label: "studio-engine",  color: "#fb923c", role: "Luau / Systems",   icon: "⚙️", x: 1 },
    "world-content":  { label: "world-content",  color: "#22c55e", role: "Planets / NPCs",   icon: "🌍", x: 2 },
    "ui-ux":          { label: "ui-ux",          color: "#a78bfa", role: "GUI / HUD",        icon: "🎨", x: 3 },
    "qa-balance":     { label: "qa-balance",     color: "#22d3ee", role: "Testing / Balance", icon: "🔍", x: 4 },
  };

  const STATUS_META = {
    working:  { label: "WORKING",  dot: "#22c55e", cls: "status-working"  },
    idle:     { label: "IDLE",     dot: "#6b7a96", cls: "status-idle"     },
    thinking: { label: "THINKING", dot: "#f0b429", cls: "status-thinking" },
    waiting:  { label: "WAITING",  dot: "#fb923c", cls: "status-waiting"  },
    done:     { label: "DONE",     dot: "#22d3ee", cls: "status-done"     },
  };

  // ── State ──
  let agentData = {};       // name -> firestore doc
  let activityLog = [];     // { time, agent, msg }
  let frame = 0;

  // ── Pixel Office Canvas ──
  const canvas = document.getElementById("office");
  const ctx = canvas.getContext("2d");
  const PX = 4;  // pixel scale

  // Sprite: 8x12 pixel character (row-major, 0=transparent)
  function drawSprite(sprite, ox, oy, color) {
    for (let y = 0; y < sprite.length; y++) {
      for (let x = 0; x < sprite[y].length; x++) {
        if (sprite[y][x] === 0) continue;
        ctx.fillStyle = sprite[y][x] === 1 ? color : sprite[y][x] === 2 ? "#fff" : "#222";
        ctx.fillRect((ox + x) * PX, (oy + y) * PX, PX, PX);
      }
    }
  }

  // Character sprites
  const CHAR_IDLE = [
    [0,0,0,1,1,0,0,0],
    [0,0,1,2,2,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,0,0,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,1,1,0,0,1,1,0],
  ];

  const CHAR_TYPING = [
    [0,0,0,1,1,0,0,0],
    [0,0,1,2,2,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,0,0],
    [1,0,1,1,1,1,1,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,0,0,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,1,1,0,0,1,1,0],
  ];

  const CHAR_THINK = [
    [0,0,0,1,1,0,0,0],
    [0,0,1,2,2,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,1,1,1,1,1,0,0],
    [0,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,0,0,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,1,1,0,0,1,1,0],
  ];

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
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    const bw = text.length * 5 + 8;
    ctx.fillRect(ox * PX, oy * PX, bw, 12);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect((ox + 1) * PX, (oy + 3) * PX, PX, PX);
    ctx.fillRect(ox * PX, (oy + 2) * PX, PX * 0.7, PX * 0.7);
    ctx.fillStyle = "#111";
    ctx.font = "8px 'Press Start 2P'";
    ctx.fillText(text, ox * PX + 4, oy * PX + 9);
  }

  // Floor pattern
  function drawFloor() {
    for (let x = 0; x < canvas.width / PX; x++) {
      for (let y = 70; y < canvas.height / PX; y++) {
        if ((x + y) % 8 === 0) {
          ctx.fillStyle = "rgba(30,45,74,0.3)";
          ctx.fillRect(x * PX, y * PX, PX, PX);
        }
      }
    }
  }

  // ── Render Office ──
  function renderOffice() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Wall
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, 70 * PX);

    // Wall accent line
    ctx.fillStyle = "#1e2d4a";
    ctx.fillRect(0, 68 * PX, canvas.width, 2 * PX);

    // Window (stars)
    ctx.fillStyle = "#060a14";
    ctx.fillRect(30 * PX, 8 * PX, 40 * PX, 25 * PX);
    ctx.strokeStyle = "#2a3552";
    ctx.lineWidth = 2;
    ctx.strokeRect(30 * PX, 8 * PX, 40 * PX, 25 * PX);

    // Window stars
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
      ctx.fillRect((32 + Math.random() * 36) * PX, (10 + Math.random() * 21) * PX, PX * 0.5, PX * 0.5);
    }

    // Planet in window
    const planetPulse = Math.sin(frame * 0.02) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(59,158,255,${0.3 + planetPulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(50 * PX, 20 * PX, 6 * PX, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(167,139,250,${0.2 + planetPulse * 0.1})`;
    ctx.beginPath();
    ctx.arc(50 * PX, 20 * PX, 4 * PX, 0, Math.PI * 2);
    ctx.fill();

    // Second window
    ctx.fillStyle = "#060a14";
    ctx.fillRect(160 * PX, 8 * PX, 40 * PX, 25 * PX);
    ctx.strokeStyle = "#2a3552";
    ctx.strokeRect(160 * PX, 8 * PX, 40 * PX, 25 * PX);

    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
      ctx.fillRect((162 + Math.random() * 36) * PX, (10 + Math.random() * 21) * PX, PX * 0.5, PX * 0.5);
    }

    // "MISSION CONTROL" text on wall
    ctx.fillStyle = "#1e2d4a";
    ctx.font = "bold 10px 'Press Start 2P'";
    ctx.fillText("MISSION CONTROL", 88 * PX, 22 * PX);

    drawFloor();

    // Draw each agent workstation
    const names = Object.keys(AGENTS);
    const spacing = Math.floor(canvas.width / PX / names.length);
    const useTyping = Math.floor(frame / 20) % 2 === 0; // typing animation toggle

    names.forEach((name, i) => {
      const def = AGENTS[name];
      const data = agentData[name] || { status: "idle" };
      const status = data.status || "idle";
      const cx = 12 + i * spacing;
      const deskY = 78;
      const charY = deskY - 12;

      // Desk
      drawDesk(cx - 4, deskY);

      // Monitor
      const monitorActive = status === "working" || status === "thinking";
      drawMonitor(cx, deskY - 7, monitorActive);

      // Monitor glow
      if (monitorActive) {
        ctx.fillStyle = `rgba(34,197,94,${0.05 + Math.sin(frame * 0.05) * 0.03})`;
        ctx.fillRect((cx - 1) * PX, (deskY - 8) * PX, 10 * PX, 10 * PX);
      }

      // Character
      let sprite = CHAR_IDLE;
      if (status === "working") sprite = useTyping ? CHAR_TYPING : CHAR_IDLE;
      else if (status === "thinking") sprite = CHAR_THINK;
      drawSprite(sprite, cx, charY, def.color);

      // Status dot
      const meta = STATUS_META[status] || STATUS_META.idle;
      ctx.fillStyle = meta.dot;
      ctx.beginPath();
      ctx.arc((cx + 4) * PX, (charY - 3) * PX, 3, 0, Math.PI * 2);
      ctx.fill();

      // Thought bubble for working/thinking agents
      if (status === "working" && data.task) {
        drawBubble(cx + 6, charY - 4, data.task);
      } else if (status === "thinking") {
        const dots = ".".repeat((Math.floor(frame / 15) % 3) + 1);
        drawBubble(cx + 6, charY - 4, dots);
      }

      // Name label
      ctx.fillStyle = def.color;
      ctx.font = "6px 'Press Start 2P'";
      ctx.textAlign = "center";
      ctx.fillText(def.label, (cx + 4) * PX, (deskY + 10) * PX);
      ctx.textAlign = "left";

      // Role label
      ctx.fillStyle = "#6b7a96";
      ctx.font = "5px 'Press Start 2P'";
      ctx.textAlign = "center";
      ctx.fillText(def.role, (cx + 4) * PX, (deskY + 14) * PX);
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
      const status = data.status || "idle";
      const meta = STATUS_META[status] || STATUS_META.idle;
      const progress = data.progress || 0;

      const card = document.createElement("div");
      card.className = "agent-card";
      card.style.setProperty("--agent-color", def.color);
      card.innerHTML = `
        <div class="agent-name">${def.icon} ${def.label}</div>
        <div class="agent-status ${meta.cls}">
          <span style="width:6px;height:6px;border-radius:50%;background:${meta.dot};display:inline-block"></span>
          ${meta.label}
        </div>
        <div class="agent-task">${data.task || "No task assigned"}</div>
        <div class="agent-desc">${data.description || def.role}</div>
        ${progress > 0 ? `
          <div class="agent-progress">
            <div class="agent-progress-fill" style="width:${progress}%"></div>
          </div>
        ` : ""}
        <div class="agent-time">${data.file ? "📄 " + data.file + " · " : ""}${timeAgo(data.updatedAt)}</div>
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
      return `<div class="log-entry">
        <span class="log-time">${e.time.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</span>
        <span class="log-agent" style="color:${def.color}">${e.agent}</span>
        <span class="log-msg">${e.msg}</span>
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
          const meta = STATUS_META[data.status] || STATUS_META.idle;
          const taskInfo = data.task ? ` → ${data.task}` : "";
          addLogEntry(name, `${meta.label}${taskInfo}${data.description ? " — " + data.description : ""}`);
        }
      }
    });

    renderCards();
    updateStats();
  });

  // Initial render
  renderCards();
  updateStats();
  renderLog();

})();
