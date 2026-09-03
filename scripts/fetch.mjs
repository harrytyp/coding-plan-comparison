#!/usr/bin/env node
/**
 * fetch.mjs — Holt alle Quellen aus sources.yml, speichert Snapshots + Manifest.
 *
 * Deterministisch & aktualisierbar:
 *  - Jeder Fetch speichert: cache/<sourceId>.<ext> (Rohdaten) + sha256 + fetchedAt + httpStatus
 *  - manifest.json ist die einzige Wahrheit für build.mjs (nie Live-Fetch im Build)
 *  - Change-Detection: check.mjs vergleicht sha256 gegen den letzten Snapshot
 *  - Keine Mutation bestehender Snapshots bei Fehler (nur bei HTTP 200 + Parse-Erfolg)
 *
 * Nutzung:
 *   node scripts/fetch.mjs            # alle Quellen
 *   node scripts/fetch.mjs glm-coding-overview   # nur eine
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseYaml } from "./yaml.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CACHE_DIR = join(ROOT, "cache");
const MANIFEST_PATH = join(ROOT, "cache/manifest.json");

const DEFAULT_HEADERS = {
  "User-Agent": "coding-plan-compare/1.0 (+https://github.com/; deterministic fetcher)",
  Accept: "text/html,application/json,application/xhtml+xml,*/*",
};

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

async function fetchSource(source) {
  const { id, url, typ, parser } = source;
  const ext = typ === "json-api" ? "json" : "html";
  const outPath = join(CACHE_DIR, `${id}.${ext}`);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    // Manche JSON-APIs (z.B. Kimi GoodsService) brauchen POST + leeren Body
    const method = source.method ?? "GET";
    const body = source.body ?? null;
    const headers = { ...DEFAULT_HEADERS, Accept: typ === "json-api" ? "application/json" : "text/html,application/xhtml+xml" };
    // Per-Source-Header aus sources.yml mit ${ENV_VAR}-Substitution
    if (source.headers) {
      for (const [k, v] of Object.entries(source.headers)) {
        headers[k] = v.replace(/\$\{(\w+)\}/g, (_, name) => process.env[name] ?? "");
      }
    }
    if (method === "POST") headers["Content-Type"] = "application/json; charset=utf-8";
    const resp = await fetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers,
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    let buf = Buffer.from(await resp.arrayBuffer());

    // Pagination: wenn die Quelle paginiert ist, alle Seiten fetchen und data-Arrays mergen
    if (source.paginate && resp.ok) {
      try {
        const first = JSON.parse(buf.toString("utf-8"));
        if (first?.pagination?.has_more) {
          const totalPages = first.pagination.total_pages ?? 4;
          const allData = [...(first.data ?? [])];
          for (let page = 2; page <= totalPages; page++) {
            const pageUrl = new URL(url);
            pageUrl.searchParams.set("page", String(page));
            const pc = new AbortController();
            const pt = setTimeout(() => pc.abort(), 30000);
            const pr = await fetch(pageUrl.toString(), {
              method,
              headers,
              signal: pc.signal,
              redirect: "follow",
            });
            clearTimeout(pt);
            if (pr.ok) {
              const pb = await pr.json();
              allData.push(...(pb.data ?? []));
            } else {
              console.log(`  ⚠ pagination page ${page}: HTTP ${pr.status} (übersprungen)`);
            }
          }
          // Merged response: first page body, aber mit allen Daten
          const merged = { ...first, data: allData, pagination: { ...first.pagination, has_more: false } };
          buf = Buffer.from(JSON.stringify(merged));
        }
      } catch (e) {
        console.log(`  ⚠ pagination error: ${e.message} (fahre mit erster Seite fort)`);
      }
    }

    const hash = sha256(buf);
    // Stabiler Hash: für parsebare Quellen den strukturierten Output hashen
    // (robust gegen HTML-Nonces/Cache-Buster). Für unparsbare SPA-Quellen (kein Parser)
    // KEIN contentHash — der Roh-HTML-sha ist volatil (Nonces) → nur HTTP-Status zählt.
    let contentHash = null;
    let parsedPreview = null;
    try {
      const { PARSERS } = await import("./parsers.mjs");
      if (PARSERS[parser]) {
        const raw = buf.toString("utf-8");
        const parsed = PARSERS[parser](raw);
        parsedPreview = Object.keys(parsed ?? {});
        contentHash = sha256(Buffer.from(JSON.stringify(parsed)));
      }
    } catch { /* kein Parser → contentHash bleibt null */ }
    const entry = {
      id,
      url,
      typ,
      parser: parser ?? null,
      fetchedAt: new Date().toISOString(),
      httpStatus: resp.status,
      contentType: resp.headers.get("content-type") ?? null,
      sha256: hash,
      contentHash, // stabiler Vergleichswert
      parsedFields: parsedPreview,
      bytes: buf.length,
      ok: resp.ok,
      prevSha256: null, // wird vom Manifest übernommen
      prevContentHash: null,
      changed: false,
    };

    // Manifest laden (bestehende History)
    let manifest = { sources: {} };
    try { manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8")); } catch { /* first run */ }
    const prev = manifest.sources?.[id];
    if (prev) {
      entry.prevSha256 = prev.sha256 ?? null;
      entry.prevContentHash = prev.contentHash ?? null;
      // changed = stabiler Inhalt hat sich geändert.
      // - parsebare Quelle: contentHash-Vergleich (beide gesetzt)
      // - unparsbare Quelle (contentHash null): nur HTTP-Status zählt → kein changed-Flag
      entry.changed = contentHash !== null && (prev.contentHash ?? prev.sha256) !== contentHash;
    }

    if (resp.ok) {
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(outPath, buf);
      manifest.sources = manifest.sources ?? {};
      manifest.sources[id] = entry;
      await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
      const changeMark = entry.changed ? " CHANGED" : " (unchanged)";
      console.log(`✓ ${id}: HTTP ${resp.status}, ${buf.length} bytes, sha256=${hash.slice(0, 12)}${changeMark}`);
    } else {
      console.log(`✗ ${id}: HTTP ${resp.status} (kein Snapshot aktualisiert)`);
      if (!prev) {
        // Kein vorheriger Snapshot → Fehler ist fatal
        throw new Error(`${id}: HTTP ${resp.status}, kein vorheriger Snapshot`);
      }
    }
    return entry;
  } catch (e) {
    console.log(`✗ ${id}: ${e.message}`);
    // Bestehenden Snapshot behalten (kein Bruch)
    let manifest = { sources: {} };
    try { manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8")); } catch {}
    if (!manifest.sources?.[id]) {
      if (source.optional) {
        console.log(`  (optional, kein Snapshot — übersprungen, kein Fehler)`);
        return null;
      }
      throw new Error(`${id}: fetch fehlgeschlagen und kein Snapshot vorhanden: ${e.message}`);
    }
    console.log(`  (behalte letzten Snapshot von ${manifest.sources[id].fetchedAt})`);
    return manifest.sources[id];
  }
}

async function main() {
  const only = process.argv[2];
  const yml = await readFile(join(ROOT, "sources.yml"), "utf8");
  const parsed = parseYaml(yml);
  const sources = parsed.sources ?? [];
  if (!sources.length) throw new Error("sources.yml: keine Quellen gefunden");
  console.log(`Fetching ${sources.length} Quellen...`);
  const targets = only ? sources.filter((s) => s.id === only) : sources;
  if (!targets.length) throw new Error(`Quelle '${only}' nicht gefunden`);
  const results = [];
  for (const s of targets) {
    results.push(await fetchSource(s));
  }
  const ok = results.filter(Boolean); // optionale Quellen können null liefern
  const changed = ok.filter((r) => r.changed).length;
  console.log(`\nFertig: ${ok.length} Quellen, ${changed} geändert.`);
  if (changed) console.log("Nächster Schritt: node scripts/check.mjs (Diff-Report)");
}

main().catch((e) => { console.error(e); process.exit(1); });
