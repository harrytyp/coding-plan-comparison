#!/usr/bin/env python3
"""Selbsttest: aus bekannten Tokenmengen und Prozentwerten muss die Quote zurueckkommen.

Der Test erzeugt Transkripte mit einer bekannten gewichteten Tokenmenge und
Prozentwerte, die zu einer bekannten Quote gehoeren. Erwartung: measure.py
rechnet genau diese Quote aus, und unter drei Fenstern meldet es "nicht gemessen".
"""
import datetime as dt
import io
import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

HERE = pathlib.Path(__file__).resolve().parent
QUOTA = 20_000_000  # gewichtete Token je 5h-Fenster (Grundwahrheit)
WINDOW = dt.timedelta(hours=5)
RESET = dt.datetime(2026, 9, 23, 12, 0, tzinfo=dt.timezone.utc)


def write_case(root, shares):
    """shares: Liste von Prozentwerten. Jede bekommt ein eigenes Fenster."""
    logs = pathlib.Path(root) / "logs"
    logs.mkdir(parents=True, exist_ok=True)
    readings = pathlib.Path(root) / "readings.jsonl"
    entries, lines = [], []
    for index, pct in enumerate(shares):
        end = RESET + index * dt.timedelta(days=1)
        start = end - WINDOW
        # gewichtete Token laut Prozentwert, aufgeteilt in vier Aufrufe
        wanted = QUOTA * pct / 100.0
        per_call = wanted / 4
        for step in range(4):
            stamp = start + (step + 1) * dt.timedelta(minutes=30)
            # Ausgabe traegt Gewicht 5, also 20 % der gewichteten Menge
            entries.append({
                "timestamp": stamp.isoformat().replace("+00:00", "Z"),
                "message": {"usage": {
                    "input_tokens": 0,
                    "cache_creation_input_tokens": 0,
                    "cache_read_input_tokens": 0,
                    "output_tokens": per_call / 5.0,
                }},
            })
        lines.append(json.dumps({
            "at": end.isoformat().replace("+00:00", "Z"),
            "window": "five_hour",
            "used_percentage": pct,
            "resets_at": end.timestamp(),
        }))
    (logs / "session.jsonl").write_text("\n".join(json.dumps(e) for e in entries), encoding="utf-8")
    readings.write_text("\n".join(lines), encoding="utf-8")
    return logs, readings


class MeasureQuotaTest(unittest.TestCase):
    def run_measure(self, logs, readings):
        out = subprocess.run(
            [sys.executable, str(HERE / "measure.py"), "--logs", str(logs),
             "--readings", str(readings), "--plan", "test"],
            capture_output=True, text=True, check=True,
        )
        return json.loads(out.stdout)

    def test_recovers_known_quota(self):
        with tempfile.TemporaryDirectory() as root:
            logs, readings = write_case(root, [25.0, 50.0, 40.0])
            result = self.run_measure(logs, readings)
            window = result["windows"]["five_hour"]
            self.assertEqual(window["windows"], 3)
            self.assertTrue(window["measured"])
            self.assertAlmostEqual(window["quota_weighted_tokens_median"], QUOTA, delta=QUOTA * 0.01)

    def test_single_window_is_not_measured(self):
        with tempfile.TemporaryDirectory() as root:
            logs, readings = write_case(root, [50.0])
            result = self.run_measure(logs, readings)
            window = result["windows"]["five_hour"]
            self.assertEqual(window["windows"], 1)
            self.assertFalse(window["measured"])
            self.assertAlmostEqual(window["quota_weighted_tokens_median"], QUOTA, delta=QUOTA * 0.01)

    def test_ignores_entries_outside_the_window(self):
        with tempfile.TemporaryDirectory() as root:
            logs, readings = write_case(root, [25.0, 25.0, 25.0])
            # Ein Aufruf weit vor dem ersten Fenster darf die Quote nicht verzerren
            extra = logs / "old.jsonl"
            old = (RESET - dt.timedelta(days=30)).isoformat().replace("+00:00", "Z")
            extra.write_text(json.dumps({"timestamp": old, "message": {"usage": {"output_tokens": 1_000_000}}}), encoding="utf-8")
            result = self.run_measure(logs, readings)
            window = result["windows"]["five_hour"]
            self.assertAlmostEqual(window["quota_weighted_tokens_median"], QUOTA, delta=QUOTA * 0.01)


if __name__ == "__main__":
    unittest.main(verbosity=2)
