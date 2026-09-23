# Limits der grossen Coding-Plaene: Quellenlage und Messverfahren

Stand 2026-09-23. Frage: gibt es echte, moeglichst automatisch aktualisierte
Token-Zahlen zu den Limits der gaengigen Plaene, und wenn nicht, wie kommen wir
selbst an sie?

## Ergebnis

Kein Anbieter veroeffentlicht die absolute Token-Quote. Die Quote ist ueberall
ein internes Budget; veroeffentlicht wird ein Prozentwert, ein Credit-Kontingent,
ein Nachrichtenbereich oder gar nichts. Nachgeprueft an den offiziellen Seiten:

| Anbieter | Offiziell veroeffentlicht | Fehlt |
| --- | --- | --- |
| Anthropic (Claude) | Mechanik: 5h-Fenster plus Woche, geteilt von Claude Code, claude.ai, Cowork; Max = 5x/20x Pro. Statusline liefert `rate_limits.five_hour` und `.seven_day`, jeweils nur `used_percentage` und `resets_at` (docs.claude.com/en/docs/claude-code/statusline) | Tokenzahl, Promptzahl, Stunden |
| OpenAI (Codex) | lokale Nachrichten pro 5h je Modell und Tarif als Bereiche (developers.openai.com/codex/pricing); Pro = 5x/20x Plus | Tokenzahl, Wochenhoehe |
| Cursor | vollstaendige Token-Preistabelle je Modell fuer beide Pools, Plaene Pro 20 / Pro Plus 60 / Ultra 200 (cursor.com/docs/account/pricing) | enthaltene Menge (steht nur als "Included") |
| Kiro | Credits je Tarif 50/1.000/2.000/5.000/10.000, Zusatz-Credit 0,04 $ (kiro.dev/docs/billing, 2026-08-04) | Kurs Credit zu Token |
| Devin / Windsurf | Quota ist ausdruecklich tokenbasiert, taeglich und woechentlich, Extra-Nutzung zu API-Preisen; Preise Free/Pro 20/Max 200/Teams 80+40 (docs.windsurf.com/windsurf/accounts/quota, devin.ai/pricing) | Hoehe der Quota |
| GitHub Copilot | 1 AI-Credit = 0,01 $ plus Modellpreise (github.com/features/copilot/plans) | nichts, wird schon genutzt |

## Geprueft und verworfen

- **Die Token-Tabelle 19.000 / 88.000 / 220.000 pro 5h** aus dem Tracker
  Claude-Code-Usage-Monitor (rund 8.700 Sterne) ist im Quelltext ein
  fest verdrahteter Rueckfallwert (`PLAN_LIMITS`, `confidence: local_estimate`,
  `COMMON_TOKEN_LIMITS = [19_000, 88_000, 220_000, 880_000]`) ohne dokumentierte
  Herleitung. Das Werkzeug bevorzugt inzwischen selbst die offiziellen
  Prozentwerte aus der Statusline. Die Zahlen sind damit keine gemessenen Limits
  und kommen nicht in den Katalog.
- **cctally** (github.com/omrikais/cctally) hat als einziges Projekt ein
  dokumentiertes Modell: eine gewichtete Einheit je Prozentpunkt, angepasst pro
  Konto. Im Modul steht ausdruecklich, dass es keine allgemeine Konstante gibt.
  Die Zahlen in den Testfixtures (`unitsPerPoint` 2.442.620 und 1.685.000) sind
  vom Fixture-Builder gesetzt, nicht gemessen.
- **Vergleichsportale** (rankllms, creditsplan, codingplans, kingy, truefoundry,
  claudelab, didreset) nennen Bereiche ohne Messmethode und ohne Stichprobe.
- **Reset-Tracker** (limitreset.net, agentresets.com, codex-resets.com) zaehlen
  Resets und archivieren Ankuendigungen, keine Limit-Hoehen.
- **token-monitor** (2.300 Sterne) liest die Limits zur Laufzeit aus den
  Anbieter-Endpunkten und liefert keine Tabelle mit.

## Messverfahren (das ist der Weg zu echten Zahlen)

Weil der Anbieter den Nenner verbirgt, den Zaehler aber zeigt, laesst sich die
Quote aus zwei eigenen Groessen rechnen:

    Quote = Summe(gewichtete Token im Fenster) / (Prozent / 100)

- Zaehler: lokale Tokenlogs (Claude Code schreibt je Aufruf Eingabe,
  Cache-Schreiben, Cache-Lesen und Ausgabe mit).
- Gewichte: Preisverhaeltnisse des Modells laut offizieller Preisseite, damit die
  Zahl in unser Kostenmodell passt (Sonnet 5: 1 / 1.25 / 0.1 / 5).
- Nenner: offizieller Prozentwert je Fenster.

Werkzeug: `tools/measure-quota/` (Capture-Skript fuer die Statusline,
Auswertung `measure.py`, Selbsttest mit bekannter Grundwahrheit). Das Ergebnis
gilt fuer ein Konto und eine Modellmischung, deshalb immer Median, Bereich und
Stichprobenzahl; unter drei Fenstern gilt es als nicht gemessen.

Sobald Meldungen aus mehreren Konten vorliegen, wird daraus je Plan ein Bereich
mit Methode, Datum und Stichprobenzahl. Erst dann bekommen Claude, Codex und
Cursor eine Rate pro Dollar in der Rangliste, vorher nicht.
