# Token-Quote messen statt raten

Kein Anbieter veroeffentlicht die absolute Token-Quote eines Abo-Plans. Das ist
das Ergebnis einer Quellenpruefung ueber die offiziellen Seiten (Anthropic,
OpenAI, Cursor, Kiro, Devin/Windsurf), die Vergleichsportale (rankllms,
creditsplan, codingplans, kingy, truefoundry) und die Tracker-Repos
(Claude-Code-Usage-Monitor, cctally, token-monitor) sowie die Reset-Tracker.
Ueberall dasselbe Bild: die Quote ist ein internes Budget, veroeffentlicht wird
nur ein Prozentwert, ein Credit-Kontingent oder ein Nachrichtenbereich.

Beispiel Claude: die offizielle Statusline liefert `rate_limits.five_hour` und
`rate_limits.seven_day`, jeweils nur `used_percentage` und `resets_at`
(docs.claude.com/en/docs/claude-code/statusline). Beispiel Devin Desktop: die
Quota ist laut Doku tokenbasiert, die Hoehe steht nirgends
(docs.windsurf.com/windsurf/accounts/quota).

Deshalb dieses Werkzeug. Es rechnet die Quote aus zwei Dingen aus, die man
selbst hat: dem lokalen Tokenverbrauch und dem offiziellen Prozentwert.

    Quote = Summe(gewichtete Token im Fenster) / (Prozent / 100)

## Ablauf

1. Aufzeichnen: `statusline-capture.sh` als Claude-Code-Statusline eintragen.
   Sie haengt bei jedem Render beide Fenster an `~/.claude/usage-readings.jsonl`.
2. Arbeiten wie immer. Pro 5h-Fenster entsteht mindestens ein Messpunkt.
3. Auswerten, sobald mindestens drei Fenster aufgezeichnet sind:

       python3 measure.py --logs ~/.claude/projects --readings ~/.claude/usage-readings.jsonl --plan "Claude Pro"

   Ausgabe: gewichtete Token je Fenster (Median, Bereich), Stichprobenzahl und
   ein Feld `measured`, das erst ab drei Fenstern wahr ist.

## Was das Ergebnis ist und was nicht

- Gewichtete Token: Eingabe, Cache-Schreiben, Cache-Lesen und Ausgabe werden mit
  den Preisverhaeltnissen des Modells gewichtet (Standard: Sonnet 5, also
  1 / 1.25 / 0.1 / 5). Das ist dieselbe Rechnung, die auch die Preisseite des
  Anbieters benutzt, damit die Zahl in unser Kostenmodell passt.
- Ein Ergebnis gilt fuer ein Konto und eine Modellmischung. Ein anderer Nutzer
  mit anderem Modellmix bekommt eine andere Zahl. Deshalb: Stichprobenzahl und
  Bereich immer mitveroeffentlichen, nie nur den Median.
- Unter drei Fenstern ist das Ergebnis nicht gemessen, sondern eine Einzelmessung.

## Ergebnis beitragen

Ausgabe als JSON an ein Issue im Repository haengen, mit Planname, Datum,
Modellmischung und Stichprobenzahl. Aus mehreren Konten wird daraus ein
Bereich pro Plan, der mit Methode und Datum in den Katalog wandert. Zahlen ohne
Stichprobe kommen nicht in die Rangliste.
