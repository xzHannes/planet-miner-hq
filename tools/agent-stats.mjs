#!/usr/bin/env node
// Planet Miner — Agent Stats CLI (Token/XP Tracking)
// Usage:
//   node tools/agent-stats.mjs add <agent> --input <tokens> --output <tokens>
//   node tools/agent-stats.mjs get <agent>
//   node tools/agent-stats.mjs list
//   node tools/agent-stats.mjs reset <agent>

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
const statsCol = collection(db, "agent-stats");

const VALID_AGENTS = ["project-ops", "studio-engine", "world-content", "ui-ux", "qa-balance"];

// ── XP / Level System ──
// 1000 tokens = 1 XP
const TOKENS_PER_XP = 1000;

// Level thresholds (cumulative XP needed)
const LEVEL_TABLE = [
  0,      // Lv 1
  30,     // Lv 2  (30K tokens)
  80,     // Lv 3  (80K tokens)
  160,    // Lv 4  (160K tokens)
  280,    // Lv 5  (280K tokens)
  450,    // Lv 6  (450K tokens)
  680,    // Lv 7  (680K tokens)
  1000,   // Lv 8  (1M tokens)
  1400,   // Lv 9  (1.4M tokens)
  2000,   // Lv 10 (2M tokens)
  2800,   // Lv 11
  3800,   // Lv 12
  5000,   // Lv 13
  6500,   // Lv 14
  8500,   // Lv 15
  11000,  // Lv 16
  14000,  // Lv 17
  18000,  // Lv 18
  23000,  // Lv 19
  30000,  // Lv 20
];

function getLevel(xp) {
  let level = 1;
  for (let i = 0; i < LEVEL_TABLE.length; i++) {
    if (xp >= LEVEL_TABLE[i]) level = i + 1;
    else break;
  }
  return level;
}

function getXpForNextLevel(level) {
  if (level >= LEVEL_TABLE.length) return null; // max level
  return LEVEL_TABLE[level]; // 0-indexed: level N needs LEVEL_TABLE[N]
}

function getXpInCurrentLevel(xp, level) {
  const base = LEVEL_TABLE[level - 1] || 0;
  return xp - base;
}

function getXpNeededForCurrentLevel(level) {
  const base = LEVEL_TABLE[level - 1] || 0;
  const next = LEVEL_TABLE[level];
  if (!next) return 0;
  return next - base;
}

// ── Cost Calculation (per 1M tokens) ──
const PRICING = {
  "opus-4":   { input: 15.00, output: 75.00, label: "Opus 4" },
  "sonnet-4": { input: 3.00,  output: 15.00, label: "Sonnet 4" },
  "haiku-3":  { input: 0.80,  output: 4.00,  label: "Haiku 3.5" },
};

function calcCost(inputTokens, outputTokens, model = "opus-4") {
  const p = PRICING[model] || PRICING["opus-4"];
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

// ── Helpers ──
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

function fmtTokens(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// ── Commands ──

async function cmdAdd(name, flags) {
  validateAgent(name);
  const inputTokens = parseInt(flags.input || "0", 10);
  const outputTokens = parseInt(flags.output || "0", 10);
  if (inputTokens === 0 && outputTokens === 0) {
    console.error("Provide --input and/or --output token counts");
    process.exit(1);
  }

  const ref = doc(statsCol, name);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : {
    name,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalSessions: 0,
    history: [],
  };

  const totalInput = (existing.totalInputTokens || 0) + inputTokens;
  const totalOutput = (existing.totalOutputTokens || 0) + outputTokens;
  const totalTokens = totalInput + totalOutput;
  const xp = Math.floor(totalTokens / TOKENS_PER_XP);
  const level = getLevel(xp);
  const today = new Date().toISOString().slice(0, 10);

  // Append to history (keep last 100 entries)
  const history = existing.history || [];
  history.push({ date: today, input: inputTokens, output: outputTokens });
  if (history.length > 100) history.splice(0, history.length - 100);

  const data = {
    name,
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalSessions: (existing.totalSessions || 0) + 1,
    xp,
    level,
    history,
    lastSessionDate: today,
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, data, { merge: true });

  const xpInLevel = getXpInCurrentLevel(xp, level);
  const xpNeeded = getXpNeededForCurrentLevel(level);
  const cost = calcCost(totalInput, totalOutput);

  console.log(`${name} updated:`);
  console.log(`  +${fmtTokens(inputTokens)} input, +${fmtTokens(outputTokens)} output`);
  console.log(`  Total: ${fmtTokens(totalTokens)} tokens (${fmtTokens(totalInput)} in / ${fmtTokens(totalOutput)} out)`);
  console.log(`  Level ${level} | XP: ${xp} (${xpInLevel}/${xpNeeded || "MAX"})`);
  console.log(`  Est. cost (Opus 4): $${cost.toFixed(2)}`);
}

async function cmdGet(name) {
  validateAgent(name);
  const ref = doc(statsCol, name);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.log(`No stats for ${name} yet.`);
    return;
  }
  const d = snap.data();
  const totalTokens = (d.totalInputTokens || 0) + (d.totalOutputTokens || 0);
  const xp = d.xp || Math.floor(totalTokens / TOKENS_PER_XP);
  const level = d.level || getLevel(xp);
  const xpInLevel = getXpInCurrentLevel(xp, level);
  const xpNeeded = getXpNeededForCurrentLevel(level);
  const cost = calcCost(d.totalInputTokens || 0, d.totalOutputTokens || 0);

  console.log(`${name}:`);
  console.log(`  Level ${level} | XP: ${xp} (${xpInLevel}/${xpNeeded || "MAX"})`);
  console.log(`  Total: ${fmtTokens(totalTokens)} tokens`);
  console.log(`    Input:  ${fmtTokens(d.totalInputTokens || 0)}`);
  console.log(`    Output: ${fmtTokens(d.totalOutputTokens || 0)}`);
  console.log(`  Sessions: ${d.totalSessions || 0}`);
  console.log(`  Est. cost (Opus 4): $${cost.toFixed(2)}`);
  console.log(`  Last session: ${d.lastSessionDate || "—"}`);
}

async function cmdList() {
  const snap = await getDocs(statsCol);
  const agents = [];
  snap.forEach(d => agents.push(d.data()));
  agents.sort((a, b) => (b.xp || 0) - (a.xp || 0));

  if (agents.length === 0) {
    console.log("No agent stats yet. Use 'add' to track tokens.");
    return;
  }

  const pad = (s, n) => String(s || "").slice(0, n).padEnd(n);
  console.log(`${pad("AGENT", 16)} ${pad("LEVEL", 6)} ${pad("XP", 8)} ${pad("TOKENS", 10)} ${pad("SESSIONS", 9)} EST. COST`);
  console.log("-".repeat(72));
  for (const d of agents) {
    const total = (d.totalInputTokens || 0) + (d.totalOutputTokens || 0);
    const cost = calcCost(d.totalInputTokens || 0, d.totalOutputTokens || 0);
    console.log(`${pad(d.name, 16)} ${pad("Lv." + (d.level || 1), 6)} ${pad(d.xp || 0, 8)} ${pad(fmtTokens(total), 10)} ${pad(d.totalSessions || 0, 9)} $${cost.toFixed(2)}`);
  }
}

async function cmdReset(name) {
  if (name) {
    validateAgent(name);
    await deleteDoc(doc(statsCol, name));
    console.log(`Stats for ${name} reset.`);
  } else {
    const snap = await getDocs(statsCol);
    const deletes = [];
    snap.forEach(d => deletes.push(deleteDoc(d.ref)));
    await Promise.all(deletes);
    console.log(`All agent stats reset. (${deletes.length} cleared)`);
  }
}

// ── Main ──
const [,, command, ...rest] = process.argv;

switch (command) {
  case "add":
    await cmdAdd(rest[0], parseArgs(rest.slice(1)));
    break;
  case "get":
    await cmdGet(rest[0]);
    break;
  case "list":
    await cmdList();
    break;
  case "reset":
    await cmdReset(rest[0]);
    break;
  default:
    console.log(`Planet Miner Agent Stats CLI (Token/XP Tracking)

Commands:
  add <agent> --input N --output N   Add token usage for a session
  get <agent>                        Show agent stats
  list                               List all agent stats (ranked by XP)
  reset [agent]                      Reset stats (all or specific agent)

Agents:  ${VALID_AGENTS.join(", ")}

XP System:
  1000 tokens = 1 XP
  Levels: 1-20 with increasing XP thresholds

Cost Models:
  Opus 4:   $15/MTok input, $75/MTok output
  Sonnet 4: $3/MTok input, $15/MTok output
  Haiku 3.5: $0.80/MTok input, $4/MTok output`);
}

process.exit(0);
