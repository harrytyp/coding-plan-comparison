#!/usr/bin/env bash
# Claude-Code-Statusline, die die offiziellen Rate-Limits mitschreibt.
#
# Einbau: in ~/.claude/settings.json
#   {"statusLine": {"type": "command", "command": "~/.claude/statusline-capture.sh"}}
#
# Claude Code schickt den Session-JSON auf stdin. Darin steht rate_limits mit
# used_percentage (0-100) und resets_at je Fenster. Dieses Skript haengt beide
# Fenster an ~/.claude/usage-readings.jsonl an und zeigt eine kurze Statuszeile.
#
# Gemessen wird damit nichts, nur mitgeschrieben: die Auswertung macht
# tools/measure-quota/measure.py, die Quoten kommen aus Token-Log plus Prozent.
# Braucht nur python3, kein jq.

set -euo pipefail
readings="${HOME}/.claude/usage-readings.jsonl"
mkdir -p "$(dirname "$readings")"

# stdin zuerst lesen: das Heredoc unten belegt stdin von python3 selbst.
payload="$(cat)"

PAYLOAD="$payload" python3 - "$readings" <<'PY'
import datetime as dt
import json
import os
import sys

path = sys.argv[1]
try:
    payload = json.loads(os.environ.get("PAYLOAD") or "{}")
except Exception:
    payload = {}

limits = payload.get("rate_limits") or {}
now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
rows = []
for name in ("five_hour", "seven_day"):
    window = limits.get(name) or {}
    if window.get("used_percentage") is not None:
        rows.append({
            "at": now,
            "window": name,
            "used_percentage": window["used_percentage"],
            "resets_at": window.get("resets_at"),
        })
if rows:
    with open(path, "a", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row) + "\n")

model = (payload.get("model") or {}).get("display_name") or "claude"
parts = [model]
for name, label in (("five_hour", "5h"), ("seven_day", "week")):
    value = (limits.get(name) or {}).get("used_percentage")
    if value is not None:
        parts.append(f"{label} {value}%")
print("  ".join(parts))
PY
