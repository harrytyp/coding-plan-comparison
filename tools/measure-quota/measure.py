#!/usr/bin/env python3
"""Leitet die Token-Quote eines Abo-Plans aus eigenen Messwerten ab.

Warum dieses Werkzeug: kein Anbieter veroeffentlicht die absolute Quote. Claude
Code zeigt nur Prozentwerte (rate_limits), Codex nur Nachrichtenbereiche, Devin
Desktop nur einen Balken. Wer den Tokenverbrauch lokal mitschreibt, kann die
Quote ausrechnen:

    Quote = Summe(gewichtete Token) / (Prozent / 100)

Gewichte sind die Preisverhaeltnisse des Modells laut offizieller Preisseite
(Eingabe 1, Cache-Schreiben 1.25, Cache-Lesen 0.1, Ausgabe 5 bei Sonnet 5).
Das Ergebnis gilt fuer EIN Konto und EINE Modellmischung, deshalb wird pro
Fenster gerechnet und ueber mehrere Fenster der Median gebildet. Unter drei
Fenstern gilt das Ergebnis als nicht gemessen.

Eingabe
  --logs DIR    Verzeichnis mit Claude-Code-Transkripten (*.jsonl)
  --readings F  JSONL, je Zeile ein Prozentwert:
                {"at": "2026-09-23T10:00:00Z", "window": "five_hour",
                 "used_percentage": 42.5, "resets_at": 1758624000}
Ausgabe: JSON auf stdout (Median, Bereich, Stichprobenzahl je Fenster).
"""
import argparse
import datetime as dt
import json
import pathlib
import statistics
import sys

WINDOWS = {"five_hour": dt.timedelta(hours=5), "seven_day": dt.timedelta(days=7)}
# Standardgewichte: Preisverhaeltnis Sonnet 5 (2 / 2.5 / 0.2 / 10 USD je 1M)
DEFAULT_WEIGHTS = {"input": 1.0, "cache_write": 1.25, "cache_read": 0.1, "output": 5.0}


def parse_ts(value):
    if isinstance(value, (int, float)):
        return dt.datetime.fromtimestamp(value, dt.timezone.utc)
    text = str(value).replace("Z", "+00:00")
    stamp = dt.datetime.fromisoformat(text)
    return stamp if stamp.tzinfo else stamp.replace(tzinfo=dt.timezone.utc)


def weighted_tokens(entry, weights):
    """Ein Transkript-Eintrag -> gewichtete Token, oder None."""
    usage = (entry.get("message") or {}).get("usage") or entry.get("usage")
    if not usage:
        return None
    total = (
        (usage.get("input_tokens") or 0) * weights["input"]
        + (usage.get("cache_creation_input_tokens") or 0) * weights["cache_write"]
        + (usage.get("cache_read_input_tokens") or 0) * weights["cache_read"]
        + (usage.get("output_tokens") or 0) * weights["output"]
    )
    return total or None


def read_logs(path, weights):
    """Alle Transkripte eines Verzeichnisses -> Liste (Zeitpunkt, gewichtete Token)."""
    rows = []
    for file in sorted(pathlib.Path(path).rglob("*.jsonl")):
        for line in file.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            tokens = weighted_tokens(entry, weights)
            stamp = entry.get("timestamp") or entry.get("created_at")
            if tokens and stamp:
                rows.append((parse_ts(stamp), tokens))
    return rows


def read_readings(path):
    rows = []
    for line in pathlib.Path(path).read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        row = json.loads(line)
        if row.get("used_percentage") is None or not row.get("window"):
            continue
        rows.append(row)
    return rows


def derive(rows, readings, weights):
    """Pro Fenster: implizierte Quote = gewichtete Token im Fenster / Prozentanteil."""
    out = {}
    for name, length in WINDOWS.items():
        quotas = []
        for row in [r for r in readings if r["window"] == name]:
            end = parse_ts(row.get("at")) if row.get("resets_at") is None else parse_ts(row["resets_at"])
            start = end - length
            pct = float(row["used_percentage"])
            if pct <= 0:
                continue
            used = sum(tokens for stamp, tokens in rows if start <= stamp <= end)
            if used:
                quotas.append(used / (pct / 100.0))
        out[name] = {
            "windows": len(quotas),
            "quota_weighted_tokens_median": round(statistics.median(quotas)) if quotas else None,
            "quota_weighted_tokens_min": round(min(quotas)) if quotas else None,
            "quota_weighted_tokens_max": round(max(quotas)) if quotas else None,
            "measured": len(quotas) >= 3,
        }
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--logs", required=True, help="Verzeichnis mit Claude-Code-Transkripten")
    ap.add_argument("--readings", required=True, help="JSONL mit Prozentwerten je Fenster")
    ap.add_argument("--plan", default=None, help="Name des Plans, nur fuer die Ausgabe")
    ap.add_argument("--weights", default=None, help='JSON, z.B. {"input":1,"cache_write":1.25,"cache_read":0.1,"output":5}')
    args = ap.parse_args(argv)

    weights = dict(DEFAULT_WEIGHTS)
    if args.weights:
        weights.update(json.loads(args.weights))

    rows = read_logs(args.logs, weights)
    readings = read_readings(args.readings)
    result = {
        "plan": args.plan,
        "weights": weights,
        "logged_calls": len(rows),
        "weighted_tokens_total": round(sum(t for _, t in rows)),
        "windows": derive(rows, readings, weights),
        "note": "Ein Ergebnis gilt fuer ein Konto und eine Modellmischung. Unter drei Fenstern: nicht gemessen.",
    }
    json.dump(result, sys.stdout, indent=2, ensure_ascii=False)
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
