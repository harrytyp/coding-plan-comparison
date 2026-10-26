#!/usr/bin/env node
/**
 * Deployt den Feedback-Worker auf vibeplan.cc (Same-Origin-Endpunkt /api/feedback).
 *
 * Ohne Argumente: Trockenlauf, zeigt nur, was passieren wuerde.
 *   node scripts/deploy-feedback-worker.mjs                      # Dry-Run
 *   node scripts/deploy-feedback-worker.mjs --apply              # KV + Worker + Route
 *   node scripts/deploy-feedback-worker.mjs --apply --email-routing   # zusaetzlich MX/DKIM, Adresse, Regel
 *   node scripts/deploy-feedback-worker.mjs --apply --verify     # Testmeldung senden und zuruecklesen
 *
 * Token: CLOUDFLARE_API_TOKEN aus /opt/data/.env, gebraucht werden
 *   Workers Scripts:Edit, Workers KV Storage:Edit, Zone DNS:Edit,
 *   Email Routing Rules:Edit, Email Routing Addresses:Edit.
 */
import { createHash, randomBytes } from "node:crypto";
import { readFile, writeFile, appendFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SCRIPT_NAME = "vibeplan-feedback";
const KV_TITLE = "vibeplan-feedback";
const ZONE_ID = "fe1f0f8bf150fc972bb26a821f3a56e8";
const ZONE_NAME = "vibeplan.cc";
const ROUTE = `${ZONE_NAME}/api/feedback*`;
const MAIL_FROM = `feedback@${ZONE_NAME}`;
const MAIL_TO = process.env.FEEDBACK_MAIL_TO || "kolja.knodel@live.de";
const API = "https://api.cloudflare.com/client/v4";
const ENV_FILE = "/opt/data/.env";

const apply = process.argv.includes("--apply");
const withEmailRouting = process.argv.includes("--email-routing");
const verify = process.argv.includes("--verify");

function envValue(text, key) {
  const hit = text.split("\n").find((l) => l.startsWith(`${key}=`));
  return hit ? hit.slice(key.length + 1).trim().replace(/^["']|["']$/g, "") : "";
}

const envFile = await readFile(ENV_FILE, "utf8").catch(() => "");
// Ein eigener Token mit den zusaetzlichen Schreibrechten, damit der bestehende
// (nur lesende) CLOUDFLARE_API_TOKEN unangetastet bleibt.
const token =
  process.env.CLOUDFLARE_API_TOKEN_WORKERS ||
  envValue(envFile, "CLOUDFLARE_API_TOKEN_WORKERS") ||
  process.env.CLOUDFLARE_API_TOKEN ||
  envValue(envFile, "CLOUDFLARE_API_TOKEN");
if (!token) {
  console.error("Kein Token gefunden: CLOUDFLARE_API_TOKEN_WORKERS (oder CLOUDFLARE_API_TOKEN) in der Umgebung oder in /opt/data/.env.");
  process.exit(2);
}

async function cf(path, { method = "GET", body, form } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { authorization: `Bearer ${token}`, ...(form ? {} : { "content-type": "application/json" }) },
    body: form ? form : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!data.success) {
    const err = (data.errors || []).map((e) => `${e.code}: ${e.message}`).join("; ") || `HTTP ${res.status}`;
    throw new Error(`${method} ${path} -> ${err}`);
  }
  return data.result;
}

function step(text) {
  console.log(`  ${apply ? "!" : "·"} ${text}`);
}

/* ---- 1) KV-Namespace ---- */
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || (await cf("/accounts?per_page=1"))[0].id;
console.log(`Konto ${accountId}, Zone ${ZONE_ID} (${ZONE_NAME}), Modus: ${apply ? "ANWENDEN" : "Trockenlauf"}`);

let namespaceId = null;
{
  const namespaces = await cf(`/accounts/${accountId}/storage/kv/namespaces?per_page=100`);
  const found = namespaces.find((n) => n.title === KV_TITLE);
  if (found) {
    namespaceId = found.id;
    step(`KV-Namespace "${KV_TITLE}" existiert (${namespaceId})`);
  } else if (apply) {
    namespaceId = (await cf(`/accounts/${accountId}/storage/kv/namespaces`, { method: "POST", body: { title: KV_TITLE } })).id;
    step(`KV-Namespace "${KV_TITLE}" angelegt (${namespaceId})`);
  } else {
    step(`KV-Namespace "${KV_TITLE}" wuerde angelegt`);
  }
}

/* ---- 2) Lese-Schluessel ---- */
let readKey = envValue(envFile, "VIBEPLAN_FEEDBACK_KEY") || process.env.VIBEPLAN_FEEDBACK_KEY || "";
if (!readKey) {
  readKey = randomBytes(24).toString("hex");
  if (apply) {
    await appendFile(ENV_FILE, `${envFile.endsWith("\n") ? "" : "\n"}VIBEPLAN_FEEDBACK_KEY=${readKey}\n`);
    step(`neuer Leseschluessel erzeugt und in ${ENV_FILE} hinterlegt (${readKey.slice(0, 6)}…, ${readKey.length} Zeichen)`);
  } else {
    step("neuer Leseschluessel wuerde erzeugt und in /opt/data/.env hinterlegt");
  }
} else {
  step(`Leseschluessel aus ${ENV_FILE} uebernommen (${readKey.slice(0, 6)}…)`);
}

/* ---- 3) Worker hochladen ---- */
const source = await readFile(join(ROOT, "worker/feedback-worker.js"), "utf8");
const bindings = [
  { type: "kv_namespace", name: "FEEDBACK", namespace_id: namespaceId || "DRY-RUN" },
  { type: "send_email", name: "MAIL" },
  { type: "plain_text", name: "MAIL_TO", text: MAIL_TO },
  { type: "plain_text", name: "MAIL_FROM", text: MAIL_FROM },
  { type: "secret_text", name: "READ_KEY", text: readKey },
];
const metadata = {
  main_module: "feedback-worker.js",
  compatibility_date: new Date().toISOString().slice(0, 10),
  bindings,
  observability: { enabled: true },
};
if (apply) {
  const form = new FormData();
  form.set("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.set("feedback-worker.js", new Blob([source], { type: "application/javascript+module" }), "feedback-worker.js");
  await cf(`/accounts/${accountId}/workers/scripts/${SCRIPT_NAME}`, { method: "PUT", form });
  step(`Worker "${SCRIPT_NAME}" hochgeladen (${source.length} Bytes, kv=${namespaceId}, mail=${MAIL_FROM} -> ${MAIL_TO})`);
} else {
  step(`Worker "${SCRIPT_NAME}" wuerde hochgeladen (${source.length} Bytes, Bindings: FEEDBACK/Mail/READ_KEY)`);
}

/* ---- 4) Route ---- */
{
  const routes = await cf(`/zones/${ZONE_ID}/workers/routes`);
  const found = routes.find((r) => r.pattern === ROUTE);
  if (found) {
    if (apply && found.script !== SCRIPT_NAME) {
      await cf(`/zones/${ZONE_ID}/workers/routes/${found.id}`, { method: "PUT", body: { pattern: ROUTE, script: SCRIPT_NAME } });
      step(`Route ${ROUTE} auf "${SCRIPT_NAME}" umgebogen`);
    } else {
      step(`Route ${ROUTE} zeigt schon auf "${SCRIPT_NAME}"`);
    }
  } else if (apply) {
    await cf(`/zones/${ZONE_ID}/workers/routes`, { method: "POST", body: { pattern: ROUTE, script: SCRIPT_NAME } });
    step(`Route ${ROUTE} angelegt`);
  } else {
    step(`Route ${ROUTE} wuerde angelegt`);
  }
}

/* ---- 5) Email Routing (nur mit --email-routing) ---- */
if (withEmailRouting) {
  const settings = await cf(`/zones/${ZONE_ID}/email/routing`);
  if (!settings.enabled) {
    if (apply) {
      await cf(`/zones/${ZONE_ID}/email/routing/dns`, { method: "POST" });   // MX/SPF/DKIM
      await cf(`/zones/${ZONE_ID}/email/routing/enable`, { method: "POST" });
      step(`Email Routing auf ${ZONE_NAME} aktiviert, MX/SPF/DKIM gesetzt`);
    } else {
      step("Email Routing wuerde aktiviert (MX/SPF/DKIM)");
    }
  } else {
    step("Email Routing ist schon aktiv");
  }

  const addresses = await cf(`/accounts/${accountId}/email/routing/addresses`);
  const known = addresses.find((a) => a.email === MAIL_TO);
  if (!known && apply) {
    await cf(`/accounts/${accountId}/email/routing/addresses`, { method: "POST", body: { email: MAIL_TO } });
    step(`Zieladresse ${MAIL_TO} angelegt: JETZT den Bestaetigungslink in der Mail anklicken`);
  } else if (!known) {
    step(`Zieladresse ${MAIL_TO} wuerde angelegt (Bestaetigungsmail folgt)`);
  } else {
    step(`Zieladresse ${MAIL_TO}: ${known.verified ? "bestaetigt" : "noch nicht bestaetigt (Link in der Mail anklicken)"}`);
  }

  const rules = await cf(`/zones/${ZONE_ID}/email/routing/rules`);
  const hasFeedbackRule = rules.some((r) => (r.matchers || []).some((m) => m.value === MAIL_FROM && m.type === "literal"));
  if (!hasFeedbackRule && apply) {
    await cf(`/zones/${ZONE_ID}/email/routing/rules`, {
      method: "POST",
      body: {
        enabled: true,
        name: "feedback to inbox",
        matchers: [{ type: "literal", field: "to", value: MAIL_FROM }],
        actions: [{ type: "forward", value: [MAIL_TO] }],
      },
    });
    step(`Regel ${MAIL_FROM} -> ${MAIL_TO} angelegt (Rueckfall, falls die Worker-Mail ausfaellt)`);
  } else if (!hasFeedbackRule) {
    step(`Regel ${MAIL_FROM} -> ${MAIL_TO} wuerde angelegt`);
  } else {
    step(`Regel ${MAIL_FROM} -> ${MAIL_TO} existiert`);
  }
} else {
  step("Email Routing uebersprungen (--email-routing nicht gesetzt)");
}

/* ---- 6) Verifikation ---- */
if (verify && apply) {
  const url = `https://${ZONE_NAME}/api/feedback`;
  const post = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Deploy-Testmeldung", context: { url: "cli", lang: "de" } }),
  });
  const created = await post.json().catch(() => ({}));
  step(`POST ${url} -> HTTP ${post.status} ${JSON.stringify(created)}`);
  const read = await fetch(`${url}?key=${encodeURIComponent(readKey)}&limit=1`, { headers: { "user-agent": "deploy-check" } });
  const data = await read.json().catch(() => ({}));
  const top = data.items?.[0];
  step(`GET  ${url} -> HTTP ${read.status}, ${data.count ?? "?"} Meldung(en)${top ? `, neueste: "${top.message}"` : ""}`);
  step(`Pruefsumme Leseschluessel: ${createHash("sha256").update(readKey).digest("hex").slice(0, 12)}`);
  if (!top || top.message !== "Deploy-Testmeldung") process.exitCode = 1;
}
if (!apply) console.log("Trockenlauf beendet. Mit --apply ausfuehren.");
