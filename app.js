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
  // PERSISTENCE (Firebase Firestore – full tickets in DB)
  // ============================================================
  let firestoreTickets = [];
  let firestoreReady = false;

  // Status toast for user feedback
  function showToast(msg, isError) {
    const existing = document.getElementById("fb-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "fb-toast";
    toast.textContent = msg;
    toast.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:10px;font-size:0.88rem;font-weight:600;z-index:9999;color:#fff;background:${isError ? "#e84c3d" : "#00d146"};box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:fadeIn 0.2s`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function initFirestore() {
    return new Promise((resolve) => {
      // No orderBy to avoid index requirement
      db.collection("tickets").onSnapshot((snapshot) => {
        firestoreTickets = [];
        snapshot.forEach((doc) => {
          firestoreTickets.push({ ...doc.data(), _docId: doc.id });
        });
        // Sort client-side: backlog/progress first, then by created date
        firestoreTickets.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
        firestoreReady = true;
        if (currentTab === "tickets" && currentUser) {
          renderTickets();
        }
        resolve();
      }, (err) => {
        console.error("[Firebase] Snapshot error:", err);
        showToast("Firebase-Verbindung fehlgeschlagen! Pruefe Firestore Rules.", true);
        // Fallback: use SEED_TICKETS if Firestore fails
        firestoreTickets = (typeof SEED_TICKETS !== "undefined" ? SEED_TICKETS : []).map((t) => ({
          ...t,
          favs: t.favs || [],
        }));
        firestoreReady = true;
        resolve();
      });
    });
  }
  initFirestore();

  function getTickets() {
    return firestoreTickets.map((t) => {
      const ticket = { ...t };
      if (!ticket.favs) ticket.favs = [];
      return ticket;
    });
  }

  function updateTicket(id, changes) {
    changes.updated_at = new Date().toISOString();
    // Use set with merge to avoid "document not found" errors
    db.collection("tickets").doc(id).set(changes, { merge: true })
      .then(() => console.log("[Firebase] Updated:", id))
      .catch((err) => {
        console.error("[Firebase] Update error:", err);
        showToast("Speichern fehlgeschlagen: " + err.message, true);
      });
    logActivity(currentUser, id, changes);
  }

  function createTicket(ticketData) {
    const id = ticketData.id;
    ticketData.created = new Date().toISOString().split("T")[0];
    ticketData.updated_at = new Date().toISOString();
    ticketData.created_by = currentUser;
    if (!ticketData.favs) ticketData.favs = [];

    db.collection("tickets").doc(id).set(ticketData)
      .then(() => showToast("Ticket " + id + " erstellt"))
      .catch((err) => {
        console.error("[Firebase] Create error:", err);
        showToast("Erstellen fehlgeschlagen: " + err.message, true);
      });
    logActivity(currentUser, id, { action: "created" });
  }

  function deleteTicket(id) {
    db.collection("tickets").doc(id).delete()
      .then(() => showToast("Ticket " + id + " geloescht"))
      .catch((err) => {
        console.error("[Firebase] Delete error:", err);
        showToast("Loeschen fehlgeschlagen: " + err.message, true);
      });
    logActivity(currentUser, id, { action: "deleted" });
  }

  function getNextTicketId() {
    const tickets = getTickets();
    let maxNum = 0;
    tickets.forEach((t) => {
      const match = (t.id || "").match(/PM-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return "PM-" + String(maxNum + 1).padStart(3, "0");
  }

  // One-time migration: push SEED_TICKETS to Firestore
  async function migrateTicketsToFirestore() {
    if (typeof SEED_TICKETS === "undefined") return;
    const batch = db.batch();
    SEED_TICKETS.forEach((t) => {
      const ref = db.collection("tickets").doc(t.id);
      batch.set(ref, {
        ...t,
        favs: t.favs || [],
        updated_at: new Date().toISOString(),
        created_by: "hannes",
      }, { merge: true });
    });
    await batch.commit();
    console.log("[Migration] " + SEED_TICKETS.length + " tickets migrated to Firestore.");
    alert("Migration abgeschlossen! " + SEED_TICKETS.length + " Tickets in Firestore gespeichert.");
  }

  // Expose migration to console
  window.migrateTickets = migrateTicketsToFirestore;

  // ============================================================
  // ACTIVITY TRACKING (GitHub-style contribution calendar)
  // ============================================================
  function logActivity(user, ticketId, changes) {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const docId = `${today}_${user}`;
    db.collection("activity_log").doc(docId).set({
      date: today,
      user,
      count: firebase.firestore.FieldValue.increment(1),
    }, { merge: true }).catch((err) => console.error("[Activity] Write error:", err));
  }

  let activityData = {};

  function loadActivityData() {
    return new Promise((resolve) => {
      db.collection("activity_log").onSnapshot((snapshot) => {
        activityData = {};
        snapshot.forEach((doc) => {
          const d = doc.data();
          if (!activityData[d.date]) activityData[d.date] = {};
          activityData[d.date][d.user] = d.count;
        });
        if (currentTab === "activity" && currentUser) renderActivity();
        resolve();
      }, () => resolve());
    });
  }
  loadActivityData();

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
  // DOM REFS (must be before auth to avoid TDZ on session restore)
  // ============================================================
  const tabBar = document.getElementById("tab-bar");
  const content = document.getElementById("content");

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
    const r = { vision: renderVision, tickets: renderTickets, activity: renderActivity, systeme: renderSysteme, wirtschaft: renderWirtschaft, roadmap: renderRoadmap, reise: renderReise };
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
  // TICKETS TAB (KANBAN) – with drag & drop + actions + CRUD
  // ============================================================
  let ticketFilter = "all";
  let draggedTicketId = null;
  const expandedCols = { backlog: false, progress: false, done: false };

  const ALL_TAGS = ["mining", "pickaxe", "ui", "audio", "world", "system", "shop", "multiplayer", "bug", "feature", "polish"];

  function renderTickets() {
    content.innerHTML = "";
    const tickets = getTickets();

    // Filter bar with create button
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

    // Spacer
    const spacer = h("div", "");
    spacer.style.flex = "1";
    filterBar.appendChild(spacer);

    // Create ticket button
    const createBtn = h("button", "btn-create-ticket", "+ Neues Ticket");
    createBtn.addEventListener("click", () => openCreateModal());
    filterBar.appendChild(createBtn);

    // Migration button (only visible, useful for first-time setup)
    if (tickets.length === 0 && typeof SEED_TICKETS !== "undefined" && SEED_TICKETS.length > 0) {
      const migrateBtn = h("button", "btn-migrate", "Tickets migrieren");
      migrateBtn.addEventListener("click", () => {
        if (confirm("Alle " + SEED_TICKETS.length + " Seed-Tickets nach Firestore migrieren?")) {
          migrateTicketsToFirestore();
        }
      });
      filterBar.appendChild(migrateBtn);
    }

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
          } else {
            changes.completed = null;
          }
          updateTicket(draggedTicketId, changes);
          draggedTicketId = null;
        }
      });

      const header = h("div", "kanban-header");
      header.innerHTML = `<span class="kanban-dot ${col.dot}"></span><span class="kanban-col-title">${col.label}</span><span class="kanban-count">${colTickets.length}</span>`;
      column.appendChild(header);

      const body = h("div", "kanban-body");

      const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      colTickets.sort((a, b) => {
        const aFavCount = (a.favs || []).length;
        const bFavCount = (b.favs || []).length;
        if (aFavCount !== bFavCount) return bFavCount - aFavCount;
        return (pOrder[a.priority] || 3) - (pOrder[b.priority] || 3);
      });

      const VISIBLE_COUNT = 3;
      const expanded = expandedCols[col.key] || false;
      const showAll = expanded || colTickets.length <= VISIBLE_COUNT + 1;

      colTickets.forEach((ticket, idx) => {
        const card = h("div", "ticket");

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
        (ticket.tags || []).forEach((tag) => {
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
  // TICKET MODAL – view + edit + delete
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
    const tickets = getTickets();
    const t = tickets.find((x) => x.id === ticket.id) || ticket;

    modalTitle.textContent = t.id + " \u2013 " + t.title;
    const statusLabels = { backlog: "Backlog", progress: "In Progress", done: "Done" };

    const statuses = ["backlog", "progress", "done"];
    const statusBtns = statuses.map((s) => {
      const active = t.status === s;
      const cls = active ? "filter-btn active" : "filter-btn";
      return `<button class="${cls}" data-action="status" data-value="${s}">${statusLabels[s]}</button>`;
    }).join("");

    const userKeys = Object.keys(USERS);
    const assigneeBtns = userKeys.map((u) => {
      const active = t.assignee === u;
      const cls = active ? "filter-btn active" : "filter-btn";
      return `<button class="${cls}" data-action="assign" data-value="${u}">${USERS[u].display}</button>`;
    }).join("");
    const unassignBtn = `<button class="filter-btn${!t.assignee ? " active" : ""}" data-action="assign" data-value="">Niemand</button>`;

    const isFaved = t.favs.includes(currentUser);
    const favBtnLabel = isFaved ? "\u2605 Favorisiert" : "\u2606 Favorit";
    const favBtnClass = isFaved ? "btn-fav active" : "btn-fav";

    const favUsers = t.favs.filter((u) => USERS[u]).map((u) => `<span class="fav-star ${USERS[u].color}" title="${USERS[u].display}">\u2605 ${USERS[u].display}</span>`).join(" ");

    const priorities = ["critical", "high", "medium", "low"];
    const prioBtns = priorities.map((p) => {
      const active = t.priority === p;
      const cls = active ? "filter-btn active" : "filter-btn";
      return `<button class="${cls}" data-action="priority" data-value="${p}">${p.toUpperCase()}</button>`;
    }).join("");

    const tagBtns = ALL_TAGS.map((tag) => {
      const active = (t.tags || []).includes(tag);
      const cls = active ? "filter-btn active" : "filter-btn";
      return `<button class="${cls}" data-action="tag" data-value="${tag}">${tag}</button>`;
    }).join("");

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
        <span class="detail-label">Priority</span>
        <span class="detail-value">
          <div class="modal-actions">${prioBtns}</div>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Tags</span>
        <span class="detail-value">
          <div class="modal-actions modal-tags-wrap">${tagBtns}</div>
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
        <span class="detail-label">Titel</span>
        <span class="detail-value" style="flex:1">
          <input type="text" class="modal-input" data-field="title" value="${escHtml(t.title)}">
        </span>
      </div>
      <div class="detail-row" style="align-items:flex-start">
        <span class="detail-label">Beschreibung</span>
        <span class="detail-value" style="flex:1">
          <textarea class="modal-textarea" data-field="desc" rows="4">${escHtml(t.desc || "")}</textarea>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Erstellt</span>
        <span class="detail-value">${t.created || "\u2013"}</span>
      </div>
      ${t.completed ? `<div class="detail-row"><span class="detail-label">Erledigt</span><span class="detail-value">${t.completed}</span></div>` : ""}
      <div class="modal-footer-actions">
        <button class="btn-save-ticket" data-action="save">Speichern</button>
        <button class="btn-delete-ticket" data-action="delete">Ticket loeschen</button>
      </div>
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
        } else if (action === "priority") {
          updateTicket(t.id, { priority: value });
        } else if (action === "tag") {
          const currentTags = [...(t.tags || [])];
          const idx = currentTags.indexOf(value);
          if (idx >= 0) currentTags.splice(idx, 1);
          else currentTags.push(value);
          updateTicket(t.id, { tags: currentTags });
        } else if (action === "fav") {
          toggleFav(t.id);
        } else if (action === "save") {
          const titleInput = modalBody.querySelector('[data-field="title"]');
          const descInput = modalBody.querySelector('[data-field="desc"]');
          const changes = {};
          if (titleInput && titleInput.value !== t.title) changes.title = titleInput.value;
          if (descInput && descInput.value !== (t.desc || "")) changes.desc = descInput.value;
          if (Object.keys(changes).length > 0) {
            updateTicket(t.id, changes);
          }
          closeModal();
          return;
        } else if (action === "delete") {
          if (confirm("Ticket " + t.id + " wirklich loeschen?")) {
            deleteTicket(t.id);
            closeModal();
          }
          return;
        }

        // Re-render modal with updated data (wait briefly for Firestore)
        setTimeout(() => {
          const updated = getTickets().find((x) => x.id === t.id);
          if (updated) openTicketModal(updated);
        }, 300);
      });
    });

    modal.classList.remove("hidden");
  }

  function escHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ============================================================
  // CREATE TICKET MODAL
  // ============================================================
  function openCreateModal() {
    const newId = getNextTicketId();
    modalTitle.textContent = "Neues Ticket";

    const priorityBtns = ["low", "medium", "high", "critical"].map((p) =>
      `<button class="filter-btn${p === "medium" ? " active" : ""}" data-prio="${p}">${p.toUpperCase()}</button>`
    ).join("");

    const assigneeBtns = Object.keys(USERS).map((u) =>
      `<button class="filter-btn" data-assign="${u}">${USERS[u].display}</button>`
    ).join("") + `<button class="filter-btn active" data-assign="">Niemand</button>`;

    const tagBtns = ALL_TAGS.map((tag) =>
      `<button class="filter-btn" data-tag="${tag}"><span class="ticket-tag tag-${tag}" style="pointer-events:none">${tag}</span></button>`
    ).join("");

    modalBody.innerHTML = `
      <div class="create-form">
        <div class="create-id-badge">${newId}</div>
        <input type="text" class="modal-input create-title-input" id="create-title" placeholder="Titel eingeben..." autofocus>
        <textarea class="modal-textarea" id="create-desc" rows="3" placeholder="Beschreibung (optional)..."></textarea>
        <div class="create-section">
          <div class="create-section-label">Priority</div>
          <div class="modal-actions" id="create-prio-bar">${priorityBtns}</div>
        </div>
        <div class="create-section">
          <div class="create-section-label">Assignee</div>
          <div class="modal-actions" id="create-assign-bar">${assigneeBtns}</div>
        </div>
        <div class="create-section">
          <div class="create-section-label">Tags</div>
          <div class="modal-actions modal-tags-wrap" id="create-tags-bar">${tagBtns}</div>
        </div>
        <div class="modal-footer-actions">
          <button class="btn-save-ticket" id="create-submit">Erstellen</button>
        </div>
      </div>
    `;

    // Interactive button toggles
    let selectedPrio = "medium";
    let selectedAssignee = "";
    const selectedTags = [];

    modalBody.querySelectorAll("#create-prio-bar .filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedPrio = btn.dataset.prio;
        modalBody.querySelectorAll("#create-prio-bar .filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    modalBody.querySelectorAll("#create-assign-bar .filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedAssignee = btn.dataset.assign;
        modalBody.querySelectorAll("#create-assign-bar .filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    modalBody.querySelectorAll("#create-tags-bar .filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tag = btn.dataset.tag;
        const idx = selectedTags.indexOf(tag);
        if (idx >= 0) { selectedTags.splice(idx, 1); btn.classList.remove("active"); }
        else { selectedTags.push(tag); btn.classList.add("active"); }
      });
    });

    document.getElementById("create-submit").addEventListener("click", () => {
      const title = document.getElementById("create-title").value.trim();
      if (!title) {
        document.getElementById("create-title").style.borderColor = "var(--roblox-red)";
        return;
      }

      createTicket({
        id: newId,
        title,
        desc: document.getElementById("create-desc").value.trim(),
        status: "backlog",
        priority: selectedPrio,
        assignee: selectedAssignee || null,
        tags: selectedTags,
      });

      closeModal();
    });

    modal.classList.remove("hidden");
  }

  // ============================================================
  // ACTIVITY TAB (GitHub-style contribution calendar)
  // ============================================================
  function renderActivity() {
    content.innerHTML = "";
    const head = h("div", "section-head");
    head.innerHTML = `<h2>Activity Tracker</h2><p>Wann wurde wie viel am Projekt gearbeitet</p>`;
    content.appendChild(head);

    const userKeys = Object.keys(USERS);
    userKeys.forEach((userKey) => {
      const card = h("div", "card");
      const userLabel = h("div", "activity-user-header");
      userLabel.innerHTML = `<div class="ticket-assignee ${USERS[userKey].color}">${USERS[userKey].initial}</div><span class="activity-user-name">${USERS[userKey].display}</span>`;
      card.appendChild(userLabel);
      card.appendChild(buildCalendar(userKey));
      content.appendChild(card);
    });

    const combinedCard = h("div", "card card-glow-blue");
    const combinedLabel = h("div", "activity-user-header");
    combinedLabel.innerHTML = `<span class="activity-user-name">Gesamt</span>`;
    combinedCard.appendChild(combinedLabel);
    combinedCard.appendChild(buildCalendar(null));
    content.appendChild(combinedCard);

    const statsCard = h("div", "card");
    statsCard.innerHTML = `<h3>Statistiken</h3>`;
    const statsGrid = h("div", "grid-4");
    const tickets = getTickets();
    const done = tickets.filter((t) => t.status === "done").length;
    const progress = tickets.filter((t) => t.status === "progress").length;
    const backlog = tickets.filter((t) => t.status === "backlog").length;
    const total = tickets.length;

    const stats = [
      { label: "Erledigt", value: done, color: "var(--roblox-green)" },
      { label: "In Arbeit", value: progress, color: "var(--roblox-yellow)" },
      { label: "Backlog", value: backlog, color: "var(--text-dim)" },
      { label: "Fortschritt", value: total > 0 ? Math.round((done / total) * 100) + "%" : "0%", color: "var(--roblox-blue)" },
    ];

    stats.forEach((s) => {
      const block = h("div", "feature-block");
      block.innerHTML = `<div class="stat-value" style="color:${s.color}">${s.value}</div><div class="fb-label">${s.label}</div>`;
      statsGrid.appendChild(block);
    });
    statsCard.appendChild(statsGrid);
    content.appendChild(statsCard);
  }

  function buildCalendar(userKey) {
    const wrapper = h("div", "activity-calendar-wrapper");

    const dayLabels = h("div", "activity-day-labels");
    ["", "Mo", "", "Mi", "", "Fr", ""].forEach((d) => {
      const lbl = h("div", "activity-day-label", d);
      dayLabels.appendChild(lbl);
    });
    wrapper.appendChild(dayLabels);

    const calendarEl = h("div", "activity-calendar");

    const today = new Date();
    const weeks = 26;
    const totalDays = weeks * 7;

    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    const startDate = new Date(endOfWeek);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    const monthBar = h("div", "activity-months");
    let lastMonth = -1;
    for (let w = 0; w < weeks; w++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + w * 7);
      const m = d.getMonth();
      if (m !== lastMonth) {
        const mLabel = h("div", "activity-month-label");
        mLabel.textContent = d.toLocaleString("de-DE", { month: "short" });
        mLabel.style.gridColumnStart = w + 1;
        monthBar.appendChild(mLabel);
        lastMonth = m;
      }
    }
    monthBar.style.gridTemplateColumns = `repeat(${weeks}, 1fr)`;
    wrapper.appendChild(monthBar);

    const grid = h("div", "activity-grid");
    grid.style.gridTemplateColumns = `repeat(${weeks}, 1fr)`;
    grid.style.gridTemplateRows = "repeat(7, 1fr)";

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + w * 7 + d);
        const dateStr = cellDate.toISOString().split("T")[0];
        const cell = h("div", "activity-cell");

        let count = 0;
        if (activityData[dateStr]) {
          if (userKey) {
            count = activityData[dateStr][userKey] || 0;
          } else {
            count = Object.values(activityData[dateStr]).reduce((a, b) => a + b, 0);
          }
        }

        const tickets = getTickets();
        tickets.forEach((t) => {
          if (t.completed === dateStr) {
            if (!userKey || t.assignee === userKey) count += 3;
          }
        });

        if (cellDate > today) {
          cell.classList.add("activity-future");
        } else if (count === 0) {
          cell.classList.add("activity-0");
        } else if (count <= 2) {
          cell.classList.add("activity-1");
        } else if (count <= 5) {
          cell.classList.add("activity-2");
        } else if (count <= 10) {
          cell.classList.add("activity-3");
        } else {
          cell.classList.add("activity-4");
        }

        cell.title = `${dateStr}: ${count} Aktivitaeten`;
        grid.appendChild(cell);
      }
    }

    const calContainer = h("div", "activity-cal-container");
    calContainer.appendChild(dayLabels);
    calContainer.appendChild(grid);
    wrapper.appendChild(monthBar);
    wrapper.appendChild(calContainer);

    const legend = h("div", "activity-legend");
    legend.innerHTML = `<span class="activity-legend-label">Weniger</span>
      <div class="activity-cell activity-0"></div>
      <div class="activity-cell activity-1"></div>
      <div class="activity-cell activity-2"></div>
      <div class="activity-cell activity-3"></div>
      <div class="activity-cell activity-4"></div>
      <span class="activity-legend-label">Mehr</span>`;
    wrapper.appendChild(legend);

    return wrapper;
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
