#!/usr/bin/env node
// Planet Miner — Agent Mission Control Dashboard
// Live terminal dashboard showing AI agent status from Firebase
// Usage: node tools/agent-monitor.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyCs2wm0VNWRwYLVF06nsp_CbyKL1YV_sWw",
  authDomain: "roblox-404d7.firebaseapp.com",
  projectId: "roblox-404d7",
  storageBucket: "roblox-404d7.firebasestorage.app",
  messagingSenderId: "522618361608",
  appId: "1:522618361608:web:5b6cb2c47f538f054bbebd",
});
const db = getFirestore(app);

const AGENTS = ["project-ops", "studio-engine", "world-content", "ui-ux", "qa-balance"];
const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m",
  gray: "\x1b[90m", white: "\x1b[97m", orange: "\x1b[38;5;208m",
  bgBlack: "\x1b[40m", magenta: "\x1b[35m",
};
const STATUS_COLOR = {
  working: C.green, idle: C.gray, thinking: C.yellow,
  waiting: C.orange, done: C.cyan,
};

let agentData = new Map();
let unsubscribe = null;
let lastSync = new Date();

function timeAgo(ts) {
  if (!ts) return "unknown";
  const sec = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

function progressBar(pct, width = 10) {
  const filled = Math.round((pct / 100) * width);
  return "\u2588".repeat(filled) + "\u2591".repeat(width - filled) + ` ${pct}%`;
}

function renderCard(agent, boxW = 28) {
  const d = agentData.get(agent) || {};
  const status = (d.status || "idle").toLowerCase();
  const sc = STATUS_COLOR[status] || C.gray;
  const label = status.toUpperCase();
  const task = d.task || "\u2014";
  const desc = d.description || "";
  const ago = d.updatedAt ? timeAgo(d.updatedAt) : "";
  const inner = boxW - 4;

  const pad = (s, w) => {
    const vis = s.replace(/\x1b\[[0-9;]*m/g, "");
    return vis.length >= w ? s : s + " ".repeat(w - vis.length);
  };

  const lines = [];
  const header = `\u2500 ${C.bold}${sc}${agent}${C.reset} `;
  const headerVis = agent.length + 3;
  const topRule = "\u250C" + header + "\u2500".repeat(Math.max(0, boxW - 2 - headerVis)) + "\u2510";
  lines.push(topRule);

  const figColor = sc;
  lines.push(`\u2502  ${figColor}  \u25CB  ${C.reset}` + " ".repeat(Math.max(0, inner - 6)) + " \u2502");
  lines.push(`\u2502  ${figColor} /|\\ ${C.reset}\u25C4 ${sc}${pad(label, Math.max(0, inner - 9))}${C.reset} \u2502`);
  lines.push(`\u2502  ${figColor} / \\ ${C.reset} ${pad(task, Math.max(0, inner - 7))}${C.reset}  \u2502`);

  if (desc) {
    const truncDesc = desc.length > inner ? desc.slice(0, inner - 1) + "\u2026" : desc;
    lines.push(`\u2502  ${C.dim}${pad("    " + truncDesc, inner)}${C.reset} \u2502`);
  } else {
    lines.push(`\u2502  ${pad("", inner)} \u2502`);
  }

  if (d.progress != null) {
    const bar = progressBar(d.progress);
    lines.push(`\u2502  ${sc}${pad("    " + bar, inner)}${C.reset} \u2502`);
  } else {
    lines.push(`\u2502  ${pad("", inner)} \u2502`);
  }

  if (ago) {
    lines.push(`\u2502  ${C.dim}${pad("    " + ago, inner)}${C.reset} \u2502`);
  } else {
    lines.push(`\u2502  ${pad("", inner)} \u2502`);
  }

  lines.push("\u2514" + "\u2500".repeat(boxW - 2) + "\u2518");
  return lines;
}

function mergeRows(cardSets, gap = 2) {
  const maxH = Math.max(...cardSets.map(c => c.length));
  const spacer = " ".repeat(gap);
  const out = [];
  for (let i = 0; i < maxH; i++) {
    out.push(cardSets.map(c => {
      if (i < c.length) return c[i];
      const vis = (c[0] || "").replace(/\x1b\[[0-9;]*m/g, "");
      return " ".repeat(vis.length);
    }).join(spacer));
  }
  return out;
}

function render() {
  const clear = "\x1b[2J\x1b[H";
  const now = lastSync.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const title = [
    `  ${C.cyan}\u2554${ "\u2550".repeat(70)}\u2557${C.reset}`,
    `  ${C.cyan}\u2551${C.reset}  ${C.bold}${C.white}\uD83D\uDE80  P L A N E T   M I N E R  \u2014  M I S S I O N   C O N T R O L   ${C.reset}${C.cyan}\u2551${C.reset}`,
    `  ${C.cyan}\u255A${"\u2550".repeat(70)}\u255D${C.reset}`,
  ];

  let output = clear + "\n" + title.join("\n") + "\n";

  if (agentData.size === 0) {
    output += `\n  ${C.dim}No agents online \u2014 waiting for Firebase data...${C.reset}\n`;
  } else {
    const boxW = 28;
    const row1 = AGENTS.slice(0, 3).map(a => renderCard(a, boxW));
    const row2 = AGENTS.slice(3).map(a => renderCard(a, boxW));

    output += "\n";
    mergeRows(row1).forEach(l => output += "  " + l + "\n");
    output += "\n";
    mergeRows(row2).forEach(l => output += "  " + l + "\n");
  }

  output += `\n  ${C.dim}[Ctrl+C to exit]  Live updates via Firebase  Last sync: ${now}${C.reset}\n`;
  process.stdout.write(output);
}

function start() {
  unsubscribe = onSnapshot(collection(db, "agents"), (snap) => {
    snap.forEach(doc => {
      const d = doc.data();
      if (d.name) agentData.set(d.name, d);
    });
    lastSync = new Date();
    render();
  }, (err) => {
    console.error("Firebase error:", err.message);
  });
}

process.on("SIGINT", () => {
  if (unsubscribe) unsubscribe();
  process.stdout.write(`\n${C.dim}Mission Control offline.${C.reset}\n`);
  process.exit(0);
});

process.stdout.on("resize", () => render());

start();
