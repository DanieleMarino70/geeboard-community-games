// Checks every manifest in this repository: Geeboard's own checker, then this repository's rules.
//
//   node scripts/check.mjs
//
// Needs a checkout of Geeboard, next to this one as ../Geeboard or wherever GEEBOARD_DIR says, with
// `npm install` run once in its web folder. REGISTRIES (a comma-separated list) widens the registries
// an image may come from, for a repository whose owner has allowed more than docker.io and ghcr.io.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const geeboard = path.resolve(process.env.GEEBOARD_DIR ?? path.join(root, "..", "Geeboard"));
const web = path.join(geeboard, "web");
const checker = path.join(web, "scripts", "check-manifest.mts");

if (!existsSync(checker)) {
  console.error(`Geeboard's checker is not at ${checker}.`);
  console.error("Put a checkout of Geeboard v0.8.0 or later (the checker is newer than v0.6.0) next to this repository, or set GEEBOARD_DIR to it,");
  console.error("and run `npm install` once in its web folder.");
  process.exit(2);
}
if (!existsSync(path.join(web, "node_modules", "tsx"))) {
  console.error(`Run \`npm install\` once in ${web}: the checker needs the packages there.`);
  process.exit(2);
}

/* ── This repository's own rules ──────────────────────────────────── */

const problems = [];
const games = path.join(root, "games");
const ids = new Map();

for (const entry of readdirSync(games, { withFileTypes: true })) {
  const where = `games/${entry.name}`;
  if (!entry.isDirectory()) {
    problems.push(`${where}: a game is a folder, and nothing else belongs in games/`);
    continue;
  }
  for (const needed of ["manifest.json", "README.md"]) {
    if (!existsSync(path.join(games, entry.name, needed))) problems.push(`${where}: has no ${needed}`);
  }
  const file = path.join(games, entry.name, "manifest.json");
  if (!existsSync(file) || !statSync(file).isFile()) continue;
  let id;
  try {
    id = JSON.parse(readFileSync(file, "utf8")).id;
  } catch {
    continue; // the checker below says what is wrong with it
  }
  if (typeof id !== "string") continue;
  if (id !== `community-${entry.name}`) problems.push(`${where}: the folder is called ${entry.name} and the id is ${id}; the id has to be community-${entry.name}`);
  if (ids.has(id)) problems.push(`${where}: the id ${id} is also used by ${ids.get(id)}`);
  else ids.set(id, where);
}

/* ── Geeboard's checker ───────────────────────────────────────────── */

const args = ["--import", "tsx", checker, games, path.join(root, "template")];
if (process.env.REGISTRIES) args.push("--registries", process.env.REGISTRIES);
const result = spawnSync(process.execPath, args, { cwd: web, stdio: "inherit" });

if (problems.length > 0) {
  console.log("\nThis repository's rules:");
  for (const p of problems) console.log(`  FAIL  ${p}`);
}
if (result.status === null) {
  console.error("The checker did not run to the end.");
  process.exit(2);
}
process.exit(result.status === 0 && problems.length === 0 ? 0 : result.status || 1);
