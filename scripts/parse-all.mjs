#!/usr/bin/env node
/**
 * parse-all.mjs — Parst alle gespeicherten Snapshots (cache/) → parsed/<sourceId>.json
 *
 * Deterministisch: nutzt NUR cache/ (von fetch.mjs gefüllt), nie Live-Fetch.
 * build.mjs liest dann die parsed/*.json — die eigentliche Datenwahrheit.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseYaml } from "./yaml.mjs";
import { PARSERS } from "./parsers.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CACHE_DIR = join(ROOT, "cache");
const PARSED_DIR = join(ROOT, "parsed");

async function main() {
  const yml = await readFile(join(ROOT, "sources.yml"), "utf8");
  const sources = parseYaml(yml).sources ?? [];
  await mkdir(PARSED_DIR, { recursive: true });
  const report = [];
  for (const s of sources) {
    if (!PARSERS[s.parser]) { report.push(`${s.id}: kein Parser (${s.parser})`); continue; }
    const ext = s.typ === "json-api" ? "json" : "html";
    const cachePath = join(CACHE_DIR, `${s.id}.${ext}`);
    try {
      const raw = await readFile(cachePath, "utf8");
      const parsed = PARSERS[s.parser](raw);
      await writeFile(join(PARSED_DIR, `${s.id}.json`), JSON.stringify(parsed, null, 2) + "\n");
      report.push(`${s.id}: ✓ (${Object.keys(parsed).join(", ")})`);
    } catch (e) {
      report.push(`${s.id}: FEHLER ${e.message}`);
    }
  }
  console.log(report.join("\n"));
}

main().catch((e) => { console.error(e); process.exit(1); });
