# Technik: Stollenlicht

Hier steht kurz, wie der Quelltext aufgebaut ist und wie du ihn baust. Die Begrüßung und die ersten Ideen zum Umbauen
stehen in `README.md`.

## Aufbau

Das ist ein Projekt für MakeCode Arcade, geschrieben in TypeScript. `pxt.json` nennt den Projektnamen `stollenlicht`,
die Palette mit den 16 Farben und alle Dateien in der Reihenfolge, in der MakeCode sie liest. `mkc.json` sagt, für
welches Gerät gebaut wird: den Calliope mini 3 mit GameKit (Variante „n3“).

Die Dateien des Spiels:

- `regeln.ts`: Die Regeln der Schicht: Räume, Figur, Brummi, Lampe, Pfiff, Menüs und Training.
- `bild.ts`: Zeichnet alle Bilder des Spiels als Pixelgrafik in der Größe des Bildschirms (160 x 120).
- `kino.ts`: Das Intro mit einer gemeinsamen Zeitleiste, die zum Lesen Zeit lässt.
- `klang.ts`: Freundliche Musik und leise Geräusche der Grube; jede Stimme klingt am Ende aus.
- `main.ts`: Verbindet die Tasten und den Bildschirm des Geräts mit dem Spiel und gibt den Klängen ihre Zeit.

Das Spiel ist in drei Namensräume geteilt: `Nacht` (Regeln und Bild, auf `regeln.ts` und `bild.ts` verteilt),
`NachtKlang` (Musik und Geräusche) und `Kino` (das Intro).

## So läuft das Spiel

1. `main.ts` richtet den Klang ein (`NachtKlang.richteEin`) und hängt die Menütaste an `Nacht.schaltePause`.
2. Das Spiel beginnt im Zustand `Zustand.Intro`: das Intro mit der Studiokarte des Calliope Hackers. A oder B
   überspringt es.
3. Danach kommen das Titelmenü (`Zustand.Titel`), das Angebot für das Training (`Zustand.TrainingWahl`) und das Training
   in 13 Schritten (`Zustand.Training`).
4. `main.ts` ruft bei jedem Durchlauf `Nacht.aktualisiere` mit der vergangenen Zeit und den gedrückten Tasten auf. Im
   Zustand `Zustand.Spiel` laufen dort die Regeln: Figur bewegen, Lampe, Pfiff, Brummi (`aktualisiereBrummi`),
   Sicherungen.
5. `Nacht.zeichne` malt jedes Bild neu: Raum, Dunkelheit mit dem Lichtkegel, Brummi, Anzeige und, je nach Zustand,
   Titel, Training, Pause oder Ergebnis.
6. `NachtKlang.aktualisiere` spielt die Klänge, die die Regeln mit `fordereKlang` bestellt haben.

Die Grube hat 12 Räume mit je 20 × 15 Kacheln, jede Kachel 8 × 8 Pixel. Jede Kachel ist eine Zahl: 0 Boden, 1 Wand, 2
Metall und 3 Wasser. Die Räume stehen in `RAUM_X` und `RAUM_Y`, ihre Namen in `RAUMNAMEN`.

## Bauen

- **Im Browser:** Öffne arcade.makecode.com, wähle „Importieren“ und öffne die Spieldatei `stollenlicht.hex`. In der
  Spieldatei steckt der ganze Quelltext. Der Simulator zeigt das Spiel sofort.
- **Am Computer:** Mit dem Kommandozeilenwerkzeug von MakeCode (npm-Paket `makecode`) rufst du in diesem Ordner
  `makecode build` auf. Die Spieldatei für das Gerät liegt danach in `built/n3/binary.hex`.

## Auf das Gerät

Steck den Calliope mini 3 mit dem USB-Kabel an den Computer. Er erscheint als Laufwerk. Zieh die Spieldatei (`.hex`)
auf dieses Laufwerk; danach startet das Spiel von selbst. Der Bildschirm des GameKit hat 160 × 120 Pixel und 16 Farben.
Dieses Spiel speichert nichts.

Dieses Spiel gibt es auch auf Englisch, Französisch und Spanisch. Alle vier Fassungen entstehen aus demselben
Ausgangsprojekt.
