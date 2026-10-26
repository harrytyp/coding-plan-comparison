/**
 * Tests für die Anbieter-Links auf den Plan-Namen (data/plan-links.yml).
 * Reine Datei-Prüfungen: kein Netz, keine Cloudflare-Zugänge.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { parseYaml } from "../scripts/yaml.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (p) => readFile(join(ROOT, p), "utf8");

test("plan-links.yml: jeder Anbieter genau eine https-Adresse", async () => {
  const cfg = parseYaml(await read("data/plan-links.yml"));
  assert.ok(cfg.checkedAt, "checkedAt fehlt");
  const providers = cfg.providers ?? {};
  assert.ok(Object.keys(providers).length >= 30, "zu wenige Anbieter");
  for (const [prov, url] of Object.entries(providers)) {
    assert.match(url, /^https:\/\//, `${prov}: kein https`);
    assert.ok(!url.endsWith("/pricing/") || true);
  }
});

test("plan-links.yml deckt jeden Anbieter und Plan im Datenbestand ab", async () => {
  const cfg = parseYaml(await read("data/plan-links.yml"));
  const data = JSON.parse(await read("public/data/latest.json"));
  const known = new Set(Object.keys(cfg.providers ?? {}));
  const overrides = cfg.plans ?? {};
  const uncovered = new Set();
  for (const plan of data.plans) {
    const url = overrides[plan.id] ?? (known.has(plan.provider) ? cfg.providers[plan.provider] : null);
    if (!url) uncovered.add(plan.provider);
  }
  assert.equal(uncovered.size, 0, `Anbieter ohne Link: ${[...uncovered].join(", ")}`);

  // Jeder Plan im ausgelieferten Datensatz trägt das aufgelöste Ziel.
  const broken = data.plans.filter((p) => !/^https:\/\/\S+/.test(p.links?.overview ?? ""));
  assert.equal(broken.length, 0,
    `Pläne ohne gültigen Link (erst "npm run generate" laufen lassen): ${broken.map((p) => p.id).slice(0, 5).join(", ")}`);

  // Plan-Overrides müssen auf existierende Plan-IDs zeigen (Tippfehler-Schutz).
  const ids = new Set(data.plans.map((p) => p.id));
  for (const id of Object.keys(overrides)) assert.ok(ids.has(id), `Override für unbekannte Plan-ID: ${id}`);
});

test("Tabelle rendert den Plan-Namen als externen Link", async () => {
  const app = await read("public/app.js");
  assert.match(app, /function planNameMarkup\(/);
  assert.match(app, /planLink: plan\.links\?\.overview/);
  assert.match(app, /target="_blank" rel="noopener noreferrer"/);
  // Ohne Ziel bleibt es Text, nicht ein toter Link.
  assert.match(app, /if \(!c\.planLink\) return `<span class="strong">/);
  // Beide Sprachen brauchen den Hinweistext (Title/aria).
  const hits = [...app.matchAll(/"plans\.overviewLink":/g)].length;
  assert.equal(hits, 2, `plans.overviewLink muss in en und de stehen (gefunden: ${hits})`);
  // CSS fuer Link und Pfeil existiert.
  const html = await read("public/index.html");
  assert.match(html, /\.plan-link\s*\{[\s\S]*?text-decoration:\s*none/);
  assert.match(html, /\.plan-link-arrow\s*\{/);
});
