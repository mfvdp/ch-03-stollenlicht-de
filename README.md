# Stollenlicht

Hallo! Das ist **Stollenlicht**, ein Spiel von **Calliope Hacker** für den **Calliope mini 3 mit GameKit**.

Es ist Nacht in der Grube. Der Strom ist weg, und du hast nur deine Helmlampe. Finde fünf Sicherungen, setze sie in den
Generator ein und fahre mit dem Aufzug nach oben. Pass auf deine Lampe auf: Wenn die Batterie leer ist, ist die Schicht
vorbei. Brummi, der kleine Wartungsroboter, räumt gern auf: Jedes Mal, wenn er dich erreicht, nimmt er dir eine
Sicherung ab und bringt sie an ihren Platz zurück. Der Calliope Hacker hat ihn gebaut und sitzt oben in der Leitstelle
am Schreibtisch.

## So spielst du

- **Steuerkreuz:** laufen
- **A + Richtung:** rennen (das ist laut)
- **A:** Sicherung oder Batterie aufnehmen, in den Spind steigen und wieder heraus
- **A halten am Generator:** Sicherung einsetzen
- **B kurz:** Licht an und aus
- **B halten:** pfeifen; ist Brummi nah, bleibt er kurz stehen und lauscht
- **Menü:** Pause

## Selbst weiterbauen

Der ganze Quelltext steckt in dieser Spieldatei. Öffne sie in MakeCode Arcade (arcade.makecode.com, „Importieren“).
Ändere eine Zahl, starte den Simulator und schau, was passiert:

- **Lampe hält länger:** In `regeln.ts` steht `VERBRAUCH_KEGEL = 0.30`. Das sind Prozent pro Sekunde bei
  eingeschaltetem Licht. Probier `0.1`.
- **Brummi ist schneller:** In `regeln.ts` steht `HINTERHER_TEMPO = 64`. Das sind Pixel pro Sekunde,
  wenn Brummi dir hinterherfährt. Mit `90` musst du rennen.
- **Öfter pfeifen:** In `regeln.ts` steht `PFIFF_PAUSE_MS = 6000`. Das ist die Wartezeit zwischen zwei
  Pfiffen in Millisekunden. Probier `1000`.

Die Erklärung des Quelltexts für Kinder, Eltern und Lehrkräfte steht auf calliope-hacker.de.
