#!/usr/bin/env node
// Planet Miner — Firebase Ticket CLI
// Usage:
//   node tools/tickets.mjs list [--status backlog|in-progress|done] [--priority critical|high|medium|low]
//   node tools/tickets.mjs get PM-042
//   node tools/tickets.mjs create --title "Feature X" --desc "Details" --priority medium --tags feature,mining
//   node tools/tickets.mjs update PM-042 --status in-progress --assignee hannes
//   node tools/tickets.mjs close PM-042
//   node tools/tickets.mjs next-id

import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  getDocs, getDoc, setDoc, updateDoc,
  query, orderBy
} from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyCs2wm0VNWRwYLVF06nsp_CbyKL1YV_sWw",
  authDomain: "roblox-404d7.firebaseapp.com",
  projectId: "roblox-404d7",
  storageBucket: "roblox-404d7.firebasestorage.app",
  messagingSenderId: "522618361608",
  appId: "1:522618361608:web:5b6cb2c47f538f054bbebd",
});

const db = getFirestore(app);
const ticketsCol = collection(db, "tickets");
const activityCol = collection(db, "activity_log");

// --- Helpers ---

function parseArgs(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : true;
      flags[key] = val;
    }
  }
  return flags;
}

async function logActivity(user, ticketId, changes) {
  const today = new Date().toISOString().split("T")[0];
  const docId = `${today}_${user || "claude"}`;
  try {
    await setDoc(doc(activityCol, docId), {
      date: today,
      user: user || "claude",
      count: 1, // simplified increment
    }, { merge: true });
  } catch (_) { /* ignore activity errors */ }
}

async function getAllTickets() {
  const snap = await getDocs(ticketsCol);
  const tickets = [];
  snap.forEach((d) => tickets.push({ _docId: d.id, ...d.data() }));
  tickets.sort((a, b) => {
    const numA = parseInt((a.id || "").replace("PM-", ""), 10) || 0;
    const numB = parseInt((b.id || "").replace("PM-", ""), 10) || 0;
    return numA - numB;
  });
  return tickets;
}

async function getNextId() {
  const tickets = await getAllTickets();
  let max = 0;
  for (const t of tickets) {
    const m = (t.id || "").match(/PM-(\d+)/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `PM-${String(max + 1).padStart(3, "0")}`;
}

function formatTicket(t) {
  const tags = (t.tags || []).join(", ");
  return `[${t.id}] ${t.status || "?"} | ${t.priority || "?"} | ${t.assignee || "-"} | ${t.title}\n       Tags: ${tags}\n       ${(t.desc || "").slice(0, 120)}${(t.desc || "").length > 120 ? "..." : ""}`;
}

// --- Commands ---

async function cmdList(flags) {
  let tickets = await getAllTickets();
  if (flags.status) tickets = tickets.filter((t) => t.status === flags.status);
  if (flags.priority) tickets = tickets.filter((t) => t.priority === flags.priority);
  if (flags.assignee) tickets = tickets.filter((t) => t.assignee === flags.assignee);
  if (flags.tag) tickets = tickets.filter((t) => (t.tags || []).includes(flags.tag));

  if (tickets.length === 0) {
    console.log("Keine Tickets gefunden.");
    return;
  }

  console.log(`${tickets.length} Tickets:\n`);
  for (const t of tickets) console.log(formatTicket(t) + "\n");
}

async function cmdGet(id) {
  const snap = await getDoc(doc(ticketsCol, id));
  if (!snap.exists()) {
    console.error(`Ticket ${id} nicht gefunden.`);
    process.exit(1);
  }
  const t = snap.data();
  console.log(JSON.stringify(t, null, 2));
}

async function cmdCreate(flags) {
  const id = flags.id || await getNextId();
  const ticket = {
    id,
    title: flags.title || "Untitled",
    desc: flags.desc || "",
    status: flags.status || "backlog",
    priority: flags.priority || "medium",
    assignee: flags.assignee || null,
    tags: flags.tags ? flags.tags.split(",").map((s) => s.trim()) : [],
    created: new Date().toISOString().split("T")[0],
    updated_at: new Date().toISOString(),
    created_by: flags.user || "claude",
    favs: [],
  };

  await setDoc(doc(ticketsCol, id), ticket);
  await logActivity(ticket.created_by, id, { action: "created" });
  console.log(`Ticket ${id} erstellt: ${ticket.title}`);
}

async function cmdUpdate(id, flags) {
  const changes = { updated_at: new Date().toISOString() };
  if (flags.status) changes.status = flags.status;
  if (flags.priority) changes.priority = flags.priority;
  if (flags.assignee) changes.assignee = flags.assignee;
  if (flags.title) changes.title = flags.title;
  if (flags.desc) changes.desc = flags.desc;
  if (flags.tags) changes.tags = flags.tags.split(",").map((s) => s.trim());

  await setDoc(doc(ticketsCol, id), changes, { merge: true });
  await logActivity(flags.user || "claude", id, changes);
  console.log(`Ticket ${id} aktualisiert:`, Object.keys(changes).filter((k) => k !== "updated_at").join(", "));
}

async function cmdClose(id) {
  await setDoc(doc(ticketsCol, id), {
    status: "done",
    updated_at: new Date().toISOString(),
  }, { merge: true });
  await logActivity("claude", id, { action: "closed" });
  console.log(`Ticket ${id} geschlossen.`);
}

async function cmdNextId() {
  console.log(await getNextId());
}

// --- Main ---

const [,, command, ...rest] = process.argv;

switch (command) {
  case "list":
    await cmdList(parseArgs(rest));
    break;
  case "get":
    await cmdGet(rest[0]);
    break;
  case "create":
    await cmdCreate(parseArgs(rest));
    break;
  case "update":
    await cmdUpdate(rest[0], parseArgs(rest.slice(1)));
    break;
  case "close":
    await cmdClose(rest[0]);
    break;
  case "next-id":
    await cmdNextId();
    break;
  default:
    console.log(`Planet Miner Ticket CLI

Commands:
  list [--status X] [--priority X] [--assignee X] [--tag X]   Tickets auflisten
  get PM-XXX                                                   Ticket-Details anzeigen
  create --title "..." --desc "..." --priority X --tags a,b    Neues Ticket erstellen
  update PM-XXX --status X --assignee X --priority X           Ticket aktualisieren
  close PM-XXX                                                 Ticket auf "done" setzen
  next-id                                                      Nächste freie Ticket-ID

Status:  backlog, in-progress, done
Priority: critical, high, medium, low
Tags:    mining, pickaxe, ui, audio, world, system, shop, multiplayer, bug, feature, polish`);
}

process.exit(0);
