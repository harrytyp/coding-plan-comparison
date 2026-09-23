# Limits der grossen Coding-Plaene: was veroeffentlicht wird, was messbar ist

Stand 2026-09-23. Frage: finden wir echte, moeglichst automatisch aktualisierte Zahlen
zu den Limits der gaengigen Plaene (Claude, Codex, Cursor, Kiro, Windsurf, Devin, Replit)?

## Ergebnis in einem Satz

Kein Anbieter veroeffentlicht eine absolute Token-Quote, und keine Quelle misst sie
laufend. Was es gibt, sind (a) offizielle Bereiche in anderen Einheiten
(Nachrichten pro 5 Stunden, Credits pro Monat, Multiplikatoren), (b) drittseitige
Messungen mit Datum, (c) Tracker, die nur Resets zaehlen.

## Was die Anbieter selbst veroeffentlichen

| Anbieter | Veroeffentlicht | Nicht veroeffentlicht |
| --- | --- | --- |
| OpenAI (Codex) | lokale Nachrichten pro 5-Stunden-Fenster je Modell und Tarif, als Bereiche; Pro = 5x/20x Plus | Token-Zahl, Wochenlimit-Hoehe |
| Anthropic (Claude) | 5-Stunden-Fenster + Wochenlimit, "5x/20x des Pro-Kontingents", geteilt von Claude Code, claude.ai, Cowork | Token-Zahl, Prompt-Zahl, Stunden |
| Cursor | zwei Monats-Pools (Cursor Models / Other Models zu Anbieterpreisen), Preis | enthaltene Menge |
| Kiro | Credits je Tarif (50/1.000/2.000/5.000/10.000), Zusatz-Credit 0,04 $, Multiplikatoren je Modell relativ zu Auto | Kurs Credit zu Token |

Quellen: developers.openai.com/codex/pricing, support.claude.com (Pro-/Max-Artikel),
cursor.com/pricing, kiro.dev/pricing und kiro.dev/docs/billing (Seite aktualisiert 2026-08-04).

OpenAI ist damit der einzige grosse Anbieter mit einer offiziellen, modellgenauen
Limit-Tabelle. Sie steht im Katalog als Referenzplan mit 5h-Bereich (GPT-6 Sol 15-150,
GPT-6 Luna 350-3.000 bei Plus; Pro 5x und 20x entsprechend).

## Was Dritte messen

- **truefoundry.com/blog/claude-code-limits-explained** (gelesen 2026-09-23): Pro etwa
  10-45 Prompts pro 5h und 40-80 Sonnet-Stunden pro Woche, Max 5x 50-225 Prompts und
  140-240 Sonnet- plus 15-35 Opus-Stunden, Max 20x 200-900 Prompts und 240-480
  Sonnet- plus 24-40 Opus-Stunden. Eigene Kennzeichnung: "ranges from independent testing".
- **Claude-Code-Usage-Monitor** (github.com/Maciek-roboblog/Claude-Code-Usage-Monitor,
  rund 8.700 Sterne): fuehrt eine Tabelle mit Token-Limits pro 5h-Fenster, Pro 19.000,
  Max 5x 88.000, Max 20x 220.000, Kennzeichnung `local_estimate`, Datei zuletzt
  2026-07-05 angefasst. Das ist die einzige maschinenlesbare Token-Tabelle, die ich
  gefunden habe, und sie ist als Schaetzung markiert.
- **cctally** (github.com/omrikais/cctally): kalibriert die Quote pro Konto aus lokalen
  Logs plus dem Nutzungssignal des Anbieters. Der Code sagt ausdruecklich, dass es keine
  allgemeine Budget-Konstante gibt, weil die Quote von der Modellmischung abhaengt.
  Das ist der Beleg dafuer, dass eine universelle Token-Zahl nicht existiert.
- **Reset-Tracker**, laufend aktualisiert, aber ohne Limit-Hoehe: limitreset.net,
  agentresets.com, codex-resets.com (dort auch die Original-Ankuendigungen mit X-Link,
  z.B. "usage goes 10% to 50% further").

## Warum keine Rate pro Dollar daraus wird

Unsere Rate ist Requests pro Monat geteilt durch den Monatspreis, berechnet aus
veroeffentlichten Token-Quoten. Fuer Claude, Cursor, Kiro, Windsurf, Devin und Replit
fehlt die Menge. Eine Umrechnung von "Prompts pro 5h" oder "Stunden pro Woche" in Token
waere eine Annahme, und eine Annahme ist keine Zahl. Deshalb stehen diese Plaene im
Katalog als Referenzplaene mit Preis, offizieller Quote (wo es eine gibt) und der
drittseitigen Messung als Zitat im Notizfeld, aber ohne Ranglistenplatz.

## Wenn wir doch selbst messen wollten

Der einzige Weg zu einer absoluten Zahl ist die Kalibrierung: Tokenverbrauch aus den
lokalen Logs gegen die Prozentanzeige des Anbieters stellen (`/usage` bei Claude,
Rate-Limit-Header bei Codex). Dafuer braucht es je Plan ein Abo und einen
definierten Verbrauch. Das liefert eine Zahl fuer genau ein Konto und eine
Modellmischung, nicht fuer den Plan an sich. Voraussetzung waere ausserdem, dass der
Anbieter die Prozentanzeige exponiert, was Kiro, Devin und Replit nicht tun.
