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

## Gemessene Datensaetze (Dritte, auf GitHub veroeffentlicht)

Es gibt sie, die geteilten Messungen. Gefunden ueber die GitHub-Suche nach
Proxy-Telemetrie (`anthropic-ratelimit-unified`, `q5h_pct`) und die Bug-Threads
in anthropics/claude-code (#16157, #41930):

- **ArkNill, claude-code-hidden-problem-analysis** (119 Sterne, 2026-05-13):
  Proxy auf TLS-Ebene (`cc-relay`), **45.884 Requests, davon 37.363 mit
  Rate-Limit-Headern**, ein **Max-20x-Konto**, 1. bis 22. April 2026,
  **5,22 Mrd sichtbare Token**, davon 96,96 % Cache-Read. Kernzahl: **1 % des
  5h-Fensters kostet 1,6 bis 2,1 Mio sichtbare Token**. Die Woche 7. bis
  13. April erreichte **99 % des Wochenlimits** nach rund 1,95 Mrd sichtbaren
  Token. Dokumente: `02_RATELIMIT-HEADERS.md`, `DATASET-ARKNILL-20260422.md`,
  `CROSS-VALIDATION-20260422.md`.
- **seanGSISG** (215K Calls, Max 20x, Dez bis Apr, JSONL): per-1 % 1,62 bis
  1,72 Mio Token, unabhaengig derselbe Bereich.
- **cnighswonger, claude-code-cache-fix** (433 Sterne): 101K Calls auf **Max 5x**,
  Interceptor, `quota-analysis.mjs` testet die Gewichte (Cache-Read 0x/0,1x/1x)
  und waehlt die Hypothese mit der kleinsten Streuung ueber die Fenster. Dasselbe
  Verfahren wie unser Messwerkzeug, unabhaengig entstanden.
- **fgrosswig** (Max 5x, Gateway, Maerz bis April): 88 Mio Token an einem Tag
  bei 90 % Auslastung, 3,2 Mrd Token am 26. Maerz ohne Limit (vor der
  Gewichtsumstellung). Nur als Randnotiz brauchbar, Einzeltag.
- **Commandershadow9** (Max 5x, JSONL, Maerz bis April): 34- bis 143-fache
  Kapazitaetsreduktion nach dem Cache-Fix, keine absolute Quote.

Die drei Hauptdatensaetze konvergieren auf denselben per-1 %-Wert, obwohl
Konten, Tarife (5x und 20x), Regionen und Erfassungsmethoden verschieden sind.
Das ist die belastbarste Zahl, die es gibt, und sie ist gemessen, nicht geraten.

## Was daraus im Katalog steht

**Claude Max 20x** (200 $) ist als gemessener Plan drin (`disclosure: measured`,
Tier M): Monatsmenge 8,44 Mrd sichtbare Token, das ist die gemessene Woche
(1,95 Mrd) mal 4,33. Requests pro Monat = gemessene Token geteilt durch unser
Muster (50.962 Token pro Request, 98 % davon Cache-Read) = **165.682**, also
**828 Requests pro Dollar**. Modellzeilen mit Anthropics eigenen Listenpreisen
(Opus 5.5, Opus 5, Sonnet 5, Haiku 4.5, Fable 5.1), gelesen am 2026-09-23.

Grenzen, die dabeistehen: ein Konto, April 2026, Messung waehrend der
Cache-Regression (die Zahlen sind nach dem Fix v2.1.91, aber der Zeitraum war
von der Regression gepraegt), 97 % Cache-Read-Anteil. Deshalb steht der Plan mit
Chip "measured" in der Liste, nicht als offizielle Quote.

Fuer **Max 5x** und **Pro** gibt es keine Wochenmessung (die 5h-Fenstergroesse
ist ueber die Tarife hinweg gleich gemessen, die Wochenskalierung nicht), sie
bleiben Referenzplaene ohne Rate. Wer ein Konto hat, kann mit
`tools/measure-quota/` nachmessen und die Zahl beisteuern.

## Messverfahren (fuer eigene Messungen)

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
