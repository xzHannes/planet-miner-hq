#!/usr/bin/env node
// Planet Miner — Agent Status CLI
// Usage:
//   node tools/agent-status.mjs update studio-engine --status working --task "PM-041" --desc "Building NPC dialog" --file "MiningServer.lua" --progress 30
//   node tools/agent-status.mjs idle studio-engine
//   node tools/agent-status.mjs list
//   node tools/agent-status.mjs reset

import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  getDoc, getDocs, setDoc, deleteDoc, serverTimestamp,
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
const agentsCol = collection(db, "agents");
const statsCol = collection(db, "agent-stats");

const VALID_AGENTS = ["project-ops", "studio-engine", "world-content", "ui-ux", "qa-balance"];
const VALID_STATUSES = ["idle", "working", "thinking", "waiting", "done"];

// XP system (must match agent-stats.mjs)
const TOKENS_PER_XP = 1000;
const LEVEL_TABLE = [0, 30, 80, 160, 280, 450, 680, 1000, 1400, 2000, 2800, 3800, 5000, 6500, 8500, 11000, 14000, 18000, 23000, 30000];
function getLevel(xp) { let l = 1; for (let i = 0; i < LEVEL_TABLE.length; i++) { if (xp >= LEVEL_TABLE[i]) l = i + 1; else break; } return l; }

async function trackTokens(name, inputTokens, outputTokens) {
  const ref = doc(statsCol, name);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : { name, totalInputTokens: 0, totalOutputTokens: 0, totalSessions: 0, history: [] };
  const totalInput = (existing.totalInputTokens || 0) + inputTokens;
  const totalOutput = (existing.totalOutputTokens || 0) + outputTokens;
  const xp = Math.floor((totalInput + totalOutput) / TOKENS_PER_XP);
  const today = new Date().toISOString().slice(0, 10);
  const history = existing.history || [];
  history.push({ date: today, input: inputTokens, output: outputTokens });
  if (history.length > 100) history.splice(0, history.length - 100);
  await setDoc(ref, { name, totalInputTokens: totalInput, totalOutputTokens: totalOutput, totalSessions: (existing.totalSessions || 0) + 1, xp, level: getLevel(xp), history, lastSessionDate: today, updatedAt: serverTimestamp() }, { merge: true });
  const cost = (totalInput / 1e6) * 15 + (totalOutput / 1e6) * 75;
  console.log(`  [Stats] +${(inputTokens/1000).toFixed(1)}K in / +${(outputTokens/1000).toFixed(1)}K out → Lv.${getLevel(xp)} (${xp} XP) | $${cost.toFixed(2)}`);
}

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

function validateAgent(name) {
  if (!VALID_AGENTS.includes(name)) {
    console.error(`Unknown agent "${name}". Valid: ${VALID_AGENTS.join(", ")}`);
    process.exit(1);
  }
}

// --- Commands ---

async function cmdUpdate(name, flags) {
  validateAgent(name);
  const data = { name, updatedAt: serverTimestamp() };

  if (flags.status) {
    if (!VALID_STATUSES.includes(flags.status)) {
      console.error(`Invalid status "${flags.status}". Valid: ${VALID_STATUSES.join(", ")}`);
      process.exit(1);
    }
    data.status = flags.status;
    if (flags.status === "working") data.startedAt = serverTimestamp();
  }
  if (flags.task) data.task = flags.task;
  if (flags.desc) data.description = flags.desc;
  if (flags.file) data.file = flags.file;
  if (flags.progress !== undefined) data.progress = parseInt(flags.progress, 10);

  // Store task tokens in agents doc for dashboard activity log
  const inputTokens = parseInt(flags.input || "0", 10);
  const outputTokens = parseInt(flags.output || "0", 10);
  if (inputTokens > 0 || outputTokens > 0) {
    data.lastTaskTokens = inputTokens + outputTokens;
  }

  await setDoc(doc(agentsCol, name), data, { merge: true });
  console.log(`Agent ${name} updated: ${Object.keys(data).filter((k) => !["name", "updatedAt"].includes(k)).join(", ") || "timestamp"}`);

  // Auto-track tokens to stats/XP system
  if (inputTokens > 0 || outputTokens > 0) {
    await trackTokens(name, inputTokens, outputTokens);
  }
}

async function cmdIdle(name) {
  validateAgent(name);
  await setDoc(doc(agentsCol, name), {
    name,
    status: "idle",
    task: "",
    description: "",
    file: "",
    progress: 0,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  console.log(`Agent ${name} set to idle.`);
}

async function cmdList() {
  const snap = await getDocs(agentsCol);
  const agents = [];
  snap.forEach((d) => agents.push(d.data()));
  agents.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  if (agents.length === 0) {
    console.log("No agents registered.");
    return;
  }

  const pad = (s, n) => String(s || "").slice(0, n).padEnd(n);
  console.log(`${pad("AGENT", 16)} ${pad("STATUS", 10)} ${pad("TASK", 10)} ${pad("PROGRESS", 9)} DESCRIPTION`);
  console.log("-".repeat(80));
  for (const a of agents) {
    const prog = a.progress != null ? `${a.progress}%` : "-";
    console.log(`${pad(a.name, 16)} ${pad(a.status, 10)} ${pad(a.task, 10)} ${pad(prog, 9)} ${(a.description || "-").slice(0, 40)}`);
  }
}

async function cmdReset() {
  const snap = await getDocs(agentsCol);
  const deletes = [];
  snap.forEach((d) => deletes.push(deleteDoc(d.ref)));
  await Promise.all(deletes);
  console.log(`Reset complete. ${deletes.length} agent(s) cleared.`);
}

// --- Main ---

const [,, command, ...rest] = process.argv;

switch (command) {
  case "update":
    await cmdUpdate(rest[0], parseArgs(rest.slice(1)));
    break;
  case "idle":
    await cmdIdle(rest[0]);
    break;
  case "list":
    await cmdList();
    break;
  case "reset":
    await cmdReset();
    break;
  default:
    console.log(`Planet Miner Agent Status CLI

Commands:
  update <agent> --status X --task X --desc X [--file X] [--progress N] [--input N --output N]
  idle <agent>
  list
  reset

--input/--output: Token counts → auto-tracked to agent-stats (XP/Level)

Agents:  ${VALID_AGENTS.join(", ")}
Status:  ${VALID_STATUSES.join(", ")}`);
}

process.exit(0);
