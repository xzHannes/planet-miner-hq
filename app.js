// ============================================================
// PLANET MINER DEV HQ – APP
// ============================================================

(function () {
  // ============================================================
  // STAR FIELD
  // ============================================================
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function initStars() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 4000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(),
        d: Math.random() * 0.02 + 0.003,
        dir: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      s.a += s.d * s.dir;
      if (s.a >= 1 || s.a <= 0.1) s.dir *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 200, 255, ${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }

  initStars();
  drawStars();
  window.addEventListener("resize", initStars);

  // ============================================================
  // PERSISTENCE (localStorage for ticket changes)
  // ============================================================
  const STORAGE_KEY = "pm_ticket_overrides";

  function loadOverrides() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch { return {}; }
  }

  function saveOverrides(overrides) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }

  function getTickets() {
    const overrides = loadOverrides();
    return TICKETS.map((t) => {
      const o = overrides[t.id];
      const merged = o ? { ...t, ...o } : { ...t };
      if (!merged.favs) merged.favs = [];
      return merged;
    });
  }

  function updateTicket(id, changes) {
    const overrides = loadOverrides();
    overrides[id] = { ...(overrides[id] || {}), ...changes };
    saveOverrides(overrides);
  }

  function toggleFav(ticketId) {
    const tickets = getTickets();
    const t = tickets.find((x) => x.id === ticketId);
    const favs = t ? [...t.favs] : [];
    const idx = favs.indexOf(currentUser);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(currentUser);
    updateTicket(ticketId, { favs });
  }

  // ============================================================
  // AUTH
  // ============================================================
  const loginScreen = document.getElementById("login-screen");
  const app = document.getElementById("app");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  let currentUser = null;
  let currentTab = "vision";

  async function sha256(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Check session
  const saved = sessionStorage.getItem("pm_user");
  if (saved && USERS[saved]) {
    currentUser = saved;
    showApp();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value.trim().toLowerCase();
    const pass = document.getElementById("password").value;
    loginError.textContent = "";

    if (!USERS[user]) {
      loginError.textContent = "Unknown user";
      return;
    }

    const hash = await sha256(pass);
    if (hash !== USERS[user].hash) {
      loginError.textContent = "Wrong password";
      return;
    }

    currentUser = user;
    sessionStorage.setItem("pm_user", user);
    showApp();
  });

  document.getElementById("btn-logout").addEventListener("click", () => {
    sessionStorage.removeItem("pm_user");
    currentUser = null;
    app.classList.add("hidden");
    loginScreen.style.display = "flex";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    loginError.textContent = "";
  });

  function showApp() {
    loginScreen.style.display = "none";
    app.classList.remove("hidden");
    document.getElementById("user-pill").textContent = USERS[currentUser].display;
    buildTabs();
    switchTab("vision");
  }

  // ============================================================
  // TABS
  // ============================================================
  const tabBar = document.getElementById("tab-bar");
  const content = document.getElementById("content");

  function buildTabs() {
    tabBar.innerHTML = "";
    TABS.forEach((t) => {
      const el = document.createElement("div");
      el.className = "tab";
      el.dataset.tab = t.id;
      el.innerHTML = t.icon + " " + t.label;
      el.addEventListener("click", () => switchTab(t.id));
      tabBar.appendChild(el);
    });
  }

  function switchTab(id) {
    currentTab = id;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
    renderTab(id);
  }

  function renderTab(id) {
    content.innerHTML = "";
    const r = { vision: renderVision, tickets: renderTickets, systeme: renderSysteme, wirtschaft: renderWirtschaft, roadmap: renderRoadmap, reise: renderReise };
    if (r[id]) r[id]();
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function h(tag, cls, html) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  // ============================================================
  // VISION TAB
  // ============================================================
  function renderVision() {
    const head = h("div", "section-head");
    head.innerHTML = `<h2>${VISION.pitch.title}</h2><p>${VISION.pitch.description}</p>`;
    content.appendChild(head);

    const quoteCard = h("div", "card card-glow-purple");
    quoteCard.innerHTML = `<div class="quote">${VISION.pitch.quote}</div>`;
    content.appendChild(quoteCard);

    const coreCard = h("div", "card");
    coreCard.innerHTML = `<h3>${VISION.coreFeeling.title}</h3><p style="margin-bottom:16px">${VISION.coreFeeling.subtitle}</p>`;
    const grid = h("div", "grid-4");
    VISION.coreFeeling.items.forEach((item) => {
      const fb = h("div", "feature-block");
      fb.innerHTML = `<span class="fb-icon">${item.icon}</span><div class="fb-label">${item.label}</div><div class="fb-desc">${item.desc}</div>`;
      grid.appendChild(fb);
    });
    coreCard.appendChild(grid);
    content.appendChild(coreCard);

    const uspCard = h("div", "card");
    uspCard.innerHTML = `<h3>${VISION.usp.title}</h3>`;
    const uspList = h("div", "");
    uspList.style.marginTop = "14px";
    VISION.usp.points.forEach((p) => {
      const item = h("div", "usp-item");
      item.innerHTML = `<div class="usp-header"><span class="usp-icon">${p.icon}</span><span class="usp-title">${p.title}</span></div><div class="usp-desc">${p.desc}</div>`;
      uspList.appendChild(item);
    });
    uspCard.appendChild(uspList);
    content.appendChild(uspCard);

    const mpCard = h("div", "card");
    mpCard.innerHTML = `<h3>${VISION.multiplayer.title}</h3>`;
    const mpGrid = h("div", "grid-2");
    mpGrid.style.marginTop = "14px";
    [VISION.multiplayer.solo, VISION.multiplayer.multi].forEach((m) => {
      const fb = h("div", "feature-block");
      fb.style.textAlign = "left";
      fb.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:1.4rem">${m.icon}</span><span class="fb-label">${m.label}</span></div><div class="fb-desc">${m.desc}</div>`;
      mpGrid.appendChild(fb);
    });
    mpCard.appendChild(mpGrid);
    content.appendChild(mpCard);
  }

  // ============================================================
  // TICKETS TAB (KANBAN) – with drag & drop + actions
  // ============================================================
  let ticketFilter = "all";
  let draggedTicketId = null;
  const expandedCols = { backlog: false, progress: false, done: false };

  function renderTickets() {
    content.innerHTML = "";
    const tickets = getTickets();

    // Filter bar
    const filterBar = h("div", "filter-bar");
    const filters = [
      { key: "all", label: "Alle" },
      { key: "my", label: "Meine Tickets" },
      { key: "unassigned", label: "Unassigned" },
    ];
    filters.forEach((f) => {
      const btn = h("button", "filter-btn" + (ticketFilter === f.key ? " active" : ""), f.label);
      btn.addEventListener("click", () => { ticketFilter = f.key; renderTickets(); });
      filterBar.appendChild(btn);
    });
    content.appendChild(filterBar);

    // Filter
    let filtered = tickets;
    if (ticketFilter === "my") filtered = tickets.filter((t) => t.assignee === currentUser);
    if (ticketFilter === "unassigned") filtered = tickets.filter((t) => !t.assignee);

    // Kanban
    const kanban = h("div", "kanban");
    const columns = [
      { key: "backlog",  label: "Backlog",      dot: "backlog" },
      { key: "progress", label: "In Progress",  dot: "progress" },
      { key: "done",     label: "Done",          dot: "done" },
    ];

    columns.forEach((col) => {
      const colTickets = filtered.filter((t) => t.status === col.key);
      const column = h("div", "kanban-column");
      column.dataset.status = col.key;

      // Drop zone events
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.style.background = "var(--bg-elevated)";
      });
      column.addEventListener("dragleave", () => {
        column.style.background = "";
      });
      column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.style.background = "";
        if (draggedTicketId) {
          const changes = { status: col.key };
          if (col.key === "done") {
            changes.completed = new Date().toISOString().split("T")[0];
          }
          updateTicket(draggedTicketId, changes);
          draggedTicketId = null;
          renderTickets();
        }
      });

      const header = h("div", "kanban-header");
      header.innerHTML = `<span class="kanban-dot ${col.dot}"></span><span class="kanban-col-title">${col.label}</span><span class="kanban-count">${colTickets.length}</span>`;
      column.appendChild(header);

      const body = h("div", "kanban-body");

      const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      colTickets.sort((a, b) => (pOrder[a.priority] || 3) - (pOrder[b.priority] || 3));

      const VISIBLE_COUNT = 3;
      const expanded = expandedCols[col.key] || false;
      const showAll = expanded || colTickets.length <= VISIBLE_COUNT + 1;

      colTickets.forEach((ticket, idx) => {
        const card = h("div", "ticket");

        // If beyond visible limit and not expanded, apply peek/hide
        if (!showAll && idx === VISIBLE_COUNT) {
          card.classList.add("ticket-peek");
        } else if (!showAll && idx > VISIBLE_COUNT) {
          card.style.display = "none";
        }

        card.draggable = true;
        card.addEventListener("dragstart", (e) => {
          draggedTicketId = ticket.id;
          card.style.opacity = "0.4";
          e.dataTransfer.effectAllowed = "move";
        });
        card.addEventListener("dragend", () => {
          card.style.opacity = "1";
          draggedTicketId = null;
        });
        card.addEventListener("click", () => openTicketModal(ticket));

        // Top row: ID + fav stars
        const topRow = h("div", "ticket-top");
        const idEl = h("span", "ticket-id", ticket.id);
        topRow.appendChild(idEl);

        if (ticket.favs.length > 0) {
          const favIndicator = h("div", "ticket-fav-icons");
          ticket.favs.forEach((u) => {
            if (USERS[u]) {
              const star = h("span", "fav-star " + USERS[u].color, "\u2605");
              star.title = USERS[u].display;
              favIndicator.appendChild(star);
            }
          });
          topRow.appendChild(favIndicator);
        }
        card.appendChild(topRow);

        const titleEl = h("div", "ticket-title", ticket.title);
        card.appendChild(titleEl);

        const footer = h("div", "ticket-footer");

        const tagsEl = h("div", "ticket-tags");
        ticket.tags.forEach((tag) => {
          const tagEl = h("span", "ticket-tag tag-" + tag, tag);
          tagsEl.appendChild(tagEl);
        });
        footer.appendChild(tagsEl);

        const right = h("div", "");
        right.style.cssText = "display:flex;align-items:center;gap:6px";

        if (ticket.priority === "critical" || ticket.priority === "high") {
          const prio = h("span", "ticket-priority priority-" + ticket.priority, ticket.priority.toUpperCase());
          right.appendChild(prio);
        }

        if (ticket.assignee && USERS[ticket.assignee]) {
          const av = h("div", "ticket-assignee " + USERS[ticket.assignee].color, USERS[ticket.assignee].initial);
          av.title = USERS[ticket.assignee].display;
          right.appendChild(av);
        } else {
          const av = h("div", "ticket-assignee assignee-none", "?");
          av.title = "Unassigned";
          right.appendChild(av);
        }

        footer.appendChild(right);
        card.appendChild(footer);
        body.appendChild(card);
      });

      // "Mehr anzeigen" / "Weniger" button
      if (colTickets.length > VISIBLE_COUNT + 1) {
        const remaining = colTickets.length - VISIBLE_COUNT;
        const toggleBtn = h("button", "kanban-expand-btn", expanded ? "Weniger anzeigen" : `+${remaining} weitere anzeigen`);
        toggleBtn.addEventListener("click", () => {
          expandedCols[col.key] = !expanded;
          renderTickets();
        });
        body.appendChild(toggleBtn);
      }

      column.appendChild(body);
      kanban.appendChild(column);
    });

    content.appendChild(kanban);
  }

  // ============================================================
  // TICKET MODAL – with interactive actions
  // ============================================================
  const modal = document.getElementById("ticket-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  function closeModal() {
    modal.classList.add("hidden");
    if (currentTab === "tickets") renderTickets();
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal(); });

  function openTicketModal(ticket) {
    // Re-read ticket with overrides
    const tickets = getTickets();
    const t = tickets.find((x) => x.id === ticket.id) || ticket;

    modalTitle.textContent = t.id + " \u2013 " + t.title;
    const assignee = t.assignee ? USERS[t.assignee].display : "Unassigned";
    const statusLabels = { backlog: "Backlog", progress: "In Progress", done: "Done" };

    // Build status buttons
    const statuses = ["backlog", "progress", "done"];
    const statusBtns = statuses.map((s) => {
      const active = t.status === s;
      const cls = active ? "filter-btn active" : "filter-btn";
      return `<button class="${cls}" data-action="status" data-value="${s}">${statusLabels[s]}</button>`;
    }).join("");

    // Build assignee buttons
    const userKeys = Object.keys(USERS);
    const assigneeBtns = userKeys.map((u) => {
      const active = t.assignee === u;
      const cls = active ? "filter-btn active" : "filter-btn";
      return `<button class="${cls}" data-action="assign" data-value="${u}">${USERS[u].display}</button>`;
    }).join("");
    const unassignBtn = `<button class="filter-btn${!t.assignee ? " active" : ""}" data-action="assign" data-value="">Niemand</button>`;

    // Fav button
    const isFaved = t.favs.includes(currentUser);
    const favBtnLabel = isFaved ? "\u2605 Favorisiert" : "\u2606 Favorit";
    const favBtnClass = isFaved ? "btn-fav active" : "btn-fav";

    // Fav indicators
    const favUsers = t.favs.filter((u) => USERS[u]).map((u) => `<span class="fav-star ${USERS[u].color}" title="${USERS[u].display}">\u2605 ${USERS[u].display}</span>`).join(" ");

    modalBody.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value">
          <div class="modal-actions">${statusBtns}</div>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Assignee</span>
        <span class="detail-value">
          <div class="modal-actions">${assigneeBtns}${unassignBtn}</div>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Favorit</span>
        <span class="detail-value">
          <div class="modal-actions">
            <button class="${favBtnClass}" data-action="fav">${favBtnLabel}</button>
            ${favUsers ? `<span class="fav-users">${favUsers}</span>` : ""}
          </div>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Priority</span>
        <span class="detail-value"><span class="ticket-priority priority-${t.priority}">${t.priority.toUpperCase()}</span></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Tags</span>
        <span class="detail-value">${t.tags.map((tag) => `<span class="ticket-tag tag-${tag}">${tag}</span>`).join(" ")}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Created</span>
        <span class="detail-value">${t.created || "\u2013"}</span>
      </div>
      ${t.completed ? `<div class="detail-row"><span class="detail-label">Completed</span><span class="detail-value">${t.completed}</span></div>` : ""}
      <div class="detail-desc">${t.desc}</div>
    `;

    // Bind action buttons
    modalBody.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const value = btn.dataset.value;

        if (action === "status") {
          const changes = { status: value };
          if (value === "done") {
            changes.completed = new Date().toISOString().split("T")[0];
          } else {
            changes.completed = null;
          }
          updateTicket(t.id, changes);
        } else if (action === "assign") {
          updateTicket(t.id, { assignee: value || null });
        } else if (action === "fav") {
          toggleFav(t.id);
        }

        // Re-render modal and board
        const updated = getTickets().find((x) => x.id === t.id);
        openTicketModal(updated);
        if (currentTab === "tickets") {
          // Re-render kanban behind modal
          const savedContent = content;
          const tmpContent = h("div", "");
          const origContent = content.innerHTML;
          // We'll just re-render when modal closes
        }
      });
    });

    modal.classList.remove("hidden");
  }

  // ============================================================
  // SYSTEME TAB
  // ============================================================
  function renderSysteme() {
    const head = h("div", "section-head");
    head.innerHTML = `<h2>Game Systems</h2><p>Alle Systeme die das Spiel antreiben</p>`;
    content.appendChild(head);

    SYSTEME.forEach((sys) => {
      const card = h("div", "system-card");
      card.innerHTML = `
        <div class="system-header">
          <div class="sys-icon ${sys.iconClass}">${sys.icon}</div>
          <span class="sys-title">${sys.title}</span>
        </div>
        <div class="system-desc">${sys.desc}</div>
        <ul class="detail-list">${sys.details.map((d) => `<li>${d}</li>`).join("")}</ul>
      `;
      content.appendChild(card);
    });
  }

  // ============================================================
  // WIRTSCHAFT TAB
  // ============================================================
  function renderWirtschaft() {
    const head = h("div", "section-head");
    head.innerHTML = `<h2>Wirtschaft & Monetarisierung</h2><p>Waehrungen, Shops und Balance</p>`;
    content.appendChild(head);

    const currCard = h("div", "card");
    currCard.innerHTML = `<h3>${WIRTSCHAFT.currency.title}</h3>`;
    const currList = h("div", "");
    currList.style.marginTop = "14px";
    WIRTSCHAFT.currency.items.forEach((c) => {
      const el = h("div", "econ-item");
      el.innerHTML = `<div class="econ-icon">${c.icon}</div><div><div class="econ-name">${c.name}</div><div class="econ-desc">${c.desc}</div></div>`;
      currList.appendChild(el);
    });
    currCard.appendChild(currList);
    content.appendChild(currCard);

    const shopCard = h("div", "card");
    shopCard.innerHTML = `<h3>${WIRTSCHAFT.shops.title}</h3>`;
    const shopList = h("div", "");
    shopList.style.marginTop = "14px";
    WIRTSCHAFT.shops.items.forEach((s) => {
      const el = h("div", "econ-item");
      el.innerHTML = `<div class="econ-icon">${s.icon}</div><div><div class="econ-name">${s.name}</div><div class="econ-desc">${s.desc}</div></div>`;
      shopList.appendChild(el);
    });
    shopCard.appendChild(shopList);
    content.appendChild(shopCard);

    const balCard = h("div", "card");
    balCard.innerHTML = `<h3>${WIRTSCHAFT.balance.title}</h3><ul class="balance-list">${WIRTSCHAFT.balance.points.map((p) => `<li>${p}</li>`).join("")}</ul>`;
    content.appendChild(balCard);
  }

  // ============================================================
  // ROADMAP TAB
  // ============================================================
  function renderRoadmap() {
    const head = h("div", "section-head");
    head.innerHTML = `<h2>Roadmap</h2><p>Der Weg zum Launch und darueber hinaus</p>`;
    content.appendChild(head);

    ROADMAP.forEach((phase) => {
      const card = h("div", "phase-card " + phase.status);
      card.innerHTML = `
        <div class="phase-header">
          <span class="phase-icon">${phase.icon}</span>
          <span class="phase-title">${phase.phase}</span>
          <span class="phase-status ${phase.status}">${phase.status === "in-progress" ? "In Arbeit" : phase.status === "done" ? "Erledigt" : "Geplant"}</span>
        </div>
        <ul class="phase-items">${phase.items.map((i) => `<li>${i}</li>`).join("")}</ul>
      `;
      content.appendChild(card);
    });
  }

  // ============================================================
  // SPIELERREISE TAB
  // ============================================================
  function renderReise() {
    const card = h("div", "card card-glow-blue");
    card.innerHTML = `<h2>${SPIELERREISE.title}</h2><p style="margin-bottom:28px">${SPIELERREISE.subtitle}</p>`;
    const tl = h("div", "timeline");
    SPIELERREISE.steps.forEach((step) => {
      const s = h("div", "timeline-step");
      s.innerHTML = `
        <div class="timeline-dot">${step.icon}</div>
        <div class="timeline-time">${step.time}</div>
        <div class="timeline-title">${step.title}</div>
        <div class="timeline-desc">${step.desc}</div>
      `;
      tl.appendChild(s);
    });
    card.appendChild(tl);
    content.appendChild(card);
  }
})();
