// Die Regeln der Schicht: Räume, Figur, Brummi, Lampe, Pfiff, Menüs und Training. Hier wird nichts gezeichnet und
// nichts abgespielt. Die Zeit kommt als Wert dt von außen herein, damit das Spiel immer gleich abläuft. fordereKlang
// merkt sich nur einen Wunsch für die Datei klang.ts. Das Bild kommt hier nur vor, um seine zwischengespeicherten
// Bilder zu verwerfen (verwerfeBilder).
namespace Nacht {
    export enum Zustand { Intro, Titel, TrainingWahl, Training, Spiel, Pause, Ergebnis }
    export enum Verhalten { Ladestation, Runde, Neugierig, Hinterher, Umschauen, Lauschen, Zurueckbringen }
    // Raumart sagt, was ein Raum ist (Raumart.Generator: der Generatorraum); Dingart sagt, was in einem Raum liegt
    // (Dingart.Generator: der Generator selbst, in den die Sicherungen kommen).
    export enum Raumart { Aufzug, Gang, Werkstatt, Halle, Generator, Lager, Ladestation }
    export enum Dingart { Sicherung, Batterie, Spind, Generator, Ausgang }
    export class RaumDaten {
        x: number; y: number; art: Raumart; raumName: string
        tueren: number[]; kacheln: Buffer; besucht: boolean
        constructor(x: number, y: number, art: Raumart, raumName: string) {
            this.x = x; this.y = y; this.art = art; this.raumName = raumName
            this.tueren = [-1, -1, -1, -1]; this.kacheln = control.createBuffer(300); this.besucht = false
        }
    }
    export class Ding {
        raum: number; x: number; y: number; art: Dingart; genommen: boolean
        constructor(raum: number, x: number, y: number, art: Dingart) {
            this.raum = raum; this.x = x; this.y = y; this.art = art; this.genommen = false
        }
    }
    export class Roboter {
        constructor() {}
        raum = 11; x = 116; y = 60; dx = -1; dy = 0
        verhalten: Verhalten = Verhalten.Ladestation; zielRaum = 11; zielX = 116; zielY = 60
        uhrMs = 0; ausserSichtMs = 0; gesehenMs = 0; weckRestMs = 0; beobachteterSpind = -1
        wegX = 0; wegY = 0; wegAlterMs = 1000; zielGrubenKachelNr = -1; wartenMs = 0
        sicherungNr = -1 // Nummer der Sicherung, die Brummi zurückbringt (-1 = keine)
    }
    // Eine Zeitleiste für Bild und Ton im Intro. Szenen zum Lesen bekommen mehr Zeit als Szenen mit Handlung:
    // filmMarkenMs sind Zeitpunkte im Film, echtMarkenMs dieselben Stellen in echter Zeit. Dazwischen wird gedehnt. Die
    // Klänge behalten ihr Tempo und ihre Tonhöhe.
    export const introDauerMs = 64000
    const filmMarkenMs = [0,4200,5500,7000,9600,12700,14500,16200,18500,23000,23900,25500,34500,38000]
    const echtMarkenMs = [0,6000,7800,12000,17000,20000,25000,27500,32000,37000,38500,43500,57000,64000]
    export function introFilmZeitMs(echtMs: number): number {
        for(let i=1;i<echtMarkenMs.length;i++)if(echtMs<echtMarkenMs[i])
            return filmMarkenMs[i-1]+(echtMs-echtMarkenMs[i-1])*
                (filmMarkenMs[i]-filmMarkenMs[i-1])/(echtMarkenMs[i]-echtMarkenMs[i-1])
        return filmMarkenMs[filmMarkenMs.length-1]
    }
    export function introEchtZeitMs(filmMs: number): number {
        for(let i=1;i<filmMarkenMs.length;i++)if(filmMs<filmMarkenMs[i])
            return echtMarkenMs[i-1]+(filmMs-filmMarkenMs[i-1])*
                (echtMarkenMs[i]-echtMarkenMs[i-1])/(filmMarkenMs[i]-filmMarkenMs[i-1])
        return introDauerMs
    }
    export let zustand = Zustand.Intro
    export let vorherZustand = Zustand.Spiel
    export let alterMs = 0
    export let zeitMs = 0
    export let grubeNr = 9137
    let zufallsWert = 9137
    export let raeume: RaumDaten[] = []
    export let dinge: Ding[] = []
    export let brummi = new Roboter()
    export let raum = 0
    export let figurX = 76
    export let figurY = 60
    export let blickX = 1
    export let blickY = 0
    export let ladung = 100
    export let lampe = false
    export let getragen = 0
    export let eingesetzt = 0
    export let versteckt = -1
    export let einsetzMs = 0
    export let setztEin = false
    export let malEntdeckt = 0
    export let pfiffe = 0
    export let pfiffEffektMs = 0
    export let pfiffPauseMs = 0
    export let bHaltenMs = 0
    export let bAusgeloest = false
    export let aGesperrt = false
    export let gewaehlt = -1
    export let schritt = 0
    export let schrittMs = 0
    export let fortschritt = 0
    export let hinweis = ""
    export let hinweisMs = 0
    // ein kleines Sicherungsbild vor dem Hinweis: Brummi hat in diesem Raum eine Sicherung zurückgelegt
    export let hinweisSymbol = false
    // Lampenwarnungen warten, solange eine Sicherung eingesetzt wird; andere Hinweise verschwinden, wenn
    // das Einsetzen beginnt
    export let hinweisWartet = false
    export let reduziert = false
    export let stumm = false
    export let gewonnen = false
    export let endGrund = ""
    export let menue = 0
    export let piepRestMs = 0
    export let piepAbstand = 999
    export let klangNr = 0
    export let klangVorrang = 0
    export let klangRestMs = 0
    export let laermRestMs = 0
    export let laermRaum = -1
    export let laermX = 0
    export let laermY = 0
    export let uebergangMs = 0
    export let warnungMs = 0
    export let vergangenMs = 0
    export let beruehrungen = 0  // wie oft Brummi die Figur in dieser Schicht erreicht hat (mit oder ohne Sicherung)
    // Sicherungen, die Brummi der Figur abgenommen und an ihren Platz zurückgebracht hat (davon hängt
    // „NICHTS VERLOREN!“ ab)
    export let sicherungenGenommen = 0
    export let schonzeitMs = 0   // Millisekunden, in denen keine zweite Berührung zählt
    export let zufriedenMs = 0   // Millisekunden, in denen Brummi zufrieden ist und nichts bemerkt
    export let tasche: number[] = [] // Nummern der getragenen Sicherungen, die älteste zuerst
    export let warnungenGegeben = 0 // schon gegebene Lampenwarnungen (0, 1 oder 2)
    // Werte zum Ausprobieren: Wer das Spiel leichter oder schwerer machen will, ändert diese Zahlen und
    // schaut, was passiert.
    export const VERBRAUCH_RUHE = 0.08   // Prozent pro Sekunde: Die Helmlampe glimmt immer ein wenig
    export const VERBRAUCH_KEGEL = 0.30  // Prozent pro Sekunde bei eingeschaltetem Lichtkegel (statt VERBRAUCH_RUHE)
    export const BATTERIE_GEWINN = 35    // Prozent pro Batterie
    export const LAMPE_WARNUNG_1 = 30    // erste Lampenwarnung bei diesem Wert in Prozent
    export const LAMPE_WARNUNG_2 = 15    // zweite Lampenwarnung in Prozent
    export const HINTERHER_TEMPO = 64    // Pixel pro Sekunde, wenn Brummi hinterherfährt (Gehen 45, Rennen 92)
    export const HINTERHER_PLUS = 2      // Pixel pro Sekunde mehr für jede eingesetzte Sicherung
    export const HINTERHER_LEER = 0      // 1 = Brummi fährt auch ohne getragene Sicherung hinterher (im Spiel ist es 0)
    export const TRAGE_TEMPO = 60        // Pixel pro Sekunde, wenn Brummi eine Sicherung zurückbringt
    export const SCHONZEIT_MS = 4000     // so lange zählt keine zweite Berührung (nicht unter 3000 stellen)
    // so lange ist Brummi zufrieden, nachdem er eine Sicherung zurückgelegt hat, und bemerkt nichts
    export const ZUFRIEDEN_MS = 10000
    // ... und 5 Sekunden länger für jede Sicherung, die er in dieser Schicht schon früher zurückgelegt hat
    export const ZUFRIEDEN_PLUS_MS = 5000
    export const ZUFRIEDEN_MAX_MS = 30000 // ... aber nie länger als 30 Sekunden
    // so lange schaut Brummi sich um, nachdem er die Figur aus den Augen verloren hat
    export const UMSCHAUEN_MS = 5000
    export const PFIFF_STOPP_MS = 2500   // so lange bleibt Brummi nach einem Pfiff stehen und lauscht
    export const PFIFF_PAUSE_MS = 6000
    export const PFIFF_REICHWEITE = 72   // Pixel; im selben Raum, in jeder Richtung, keine freie Sicht nötig
    export const PIEP_NAH_MS = 500       // Abstand zwischen zwei Pieptönen, wenn Brummi ganz nah ist
    export const PIEP_JE_KACHEL_MS = 150 // Millisekunden mehr für jede Kachel Abstand (ab zwei Kacheln)
    export const WECKEN_MS = 4000        // vom Aufsammeln der ersten Sicherung, bis Brummi die Ladestation verlässt
    // Feste Regeln, keine Werte zum Ausprobieren.
    // A und B zählen nur dann als Pausengriff, wenn sie höchstens 150 Millisekunden nacheinander gedrückt werden.
    export const PAUSE_GRIFF_MS = 150
    // hier beginnt die Studiokarte „Calliope Hacker präsentiert“ (echte Zeit im Intro)
    export const STUDIOKARTE_BEGINN_MS = 43500
    export const STUDIOKARTE_SPERRE_MS = 1500 // auf der Studiokarte öffnet A oder B nach dieser Zeit das Titelmenü
    export const TRAINING_LADUNG = 40    // Ladung der Lampe im Training bei Schritt 12, bis die Batterie genommen wird
    let letzteTasten = 0
    let griffMs = 0
    let laermUhrMs = 0
    let einsetzLaermUhrMs = 0
    let radarUhrMs = 0
    let atmosphaereMs = 0
    let aDruckMs = 0
    let bDruckMs = 0
    // 12 Räume mit je 300 Kacheln; gemeinsame Puffer mit 16-Bit-Zahlen sparen Speicher, weil nicht tausende
    // Einzelzahlen angelegt werden.
    let warteschlange = control.createBuffer(7200)
    let abstaende = control.createBuffer(7200)
    let wegAbstaende = control.createBuffer(600)
    let wegWarteschlange = control.createBuffer(600)
    let wegGrubenKachelNr = -1
    export let wegBerechnungen = 0
    let routenRaeume: number[] = []
    let routenTabelle = control.createBuffer(144)
    let routenTabelleGueltig = false
    const RAUM_X = [0,1,1,2,2,2,1,3,3,3,4,4]
    const RAUM_Y = [2,2,1,1,2,3,3,1,2,3,2,3]
    const RAUMARTEN = [Raumart.Aufzug,Raumart.Gang,
        Raumart.Werkstatt,Raumart.Halle,Raumart.Generator,Raumart.Werkstatt,
        Raumart.Halle,Raumart.Lager,Raumart.Gang,Raumart.Lager,Raumart.Gang,Raumart.Ladestation]
    const RAUMNAMEN = ["AUFZUG", "VERTEILER", "WERKSTATT", "KRANHALLE", "GENERATOR", "PUMPWERK",
        "BECKEN", "LAGER NORD", "SCHACHT", "LAGER SÜD", "FÖRDERBAND", "LADESTATION"]
    export const trainingTitel = [
        "01 / ANKOMMEN", "02 / LICHT", "03 / BEWEGUNG", "04 / EINSAMMELN", "05 / STROM",
        "06 / VERSTECKEN", "07 / BRUMMI", "08 / SEHEN", "09 / HÖREN",
        "10 / PFEIFE", "11 / ABSTAND", "12 / LAMPE", "13 / BEREIT"
    ]
    export const trainingZeilen = [
        "Gehe zum gelben Ziel.",
        "B kurz: Licht an.",
        "A + Richtung: 2 s rennen.",
        "Zur Sicherung. Stopp, A.",
        "Stopp, A halten.",
        "Am Spind A, dann wieder A.",
        "Lerne Brummi kennen.",
        "B kurz: Licht aus.",
        "A + Richtung: 1 s rennen.",
        "B halten: pfeifen.",
        "Lauf zum linken Ziel.",
        "Nimm die Batterie: A.",
        "Training fertig. A: Start"
    ]
    export function fordereKlang(nr: number, vorrang: number) {
        if (vorrang >= klangVorrang || klangRestMs <= 0) {
            klangNr = nr; klangVorrang = vorrang; klangRestMs = vorrang >= 3 ? 350 : 100
        }
    }
    export function zeigeHinweis(text: string) {
        hinweis = text; hinweisMs = 2200; hinweisSymbol = false; hinweisWartet = false
    }
    export function zufall(grenze: number): number {
        zufallsWert = (zufallsWert * 1664525 + 1013904223) | 0
        return (zufallsWert & 0x7fffffff) % grenze
    }
    export function beginneZustand(neu: Zustand) {
        zustand = neu; alterMs = 0; bHaltenMs = 0; bAusgeloest = false; einsetzMs = 0; setztEin = false
        aGesperrt = true; griffMs = 0; menue = 0
        // Eine Taste, die schon vor dem Wechsel gedrückt war, zählt erst, wenn man sie losgelassen hat:
        // B tut nichts, bis es losgelassen wird, und A+B, die über den Wechsel hinaus gehalten werden,
        // sind kein Pausengriff.
        bAusgeloest = true; aDruckMs = -1000000; bDruckMs = 1000000
    }
    function verbinde(von: number, nach: number) {
        let richtung = RAUM_X[nach] > RAUM_X[von] ? 0
            : RAUM_Y[nach] > RAUM_Y[von] ? 1 : RAUM_X[nach] < RAUM_X[von] ? 2 : 3
        raeume[von].tueren[richtung] = nach; raeume[nach].tueren[(richtung + 2) % 4] = von
    }
    export function istWand(raumNr: number, x: number, y: number): boolean {
        if (raumNr < 0 || raumNr >= raeume.length || x < 0 || y < 0 || x >= 20 || y >= 15) return true
        return raeume[raumNr].kacheln.getUint8(y * 20 + x) == 1
    }
    export function kachel(raumNr: number, x: number, y: number): number {
        if (x < 0 || y < 0 || x >= 20 || y >= 15) return 1
        return raeume[raumNr].kacheln.getUint8(y * 20 + x)
    }
    function setzeKachel(raumNr: number, x: number, y: number, wert: number) {
        raeume[raumNr].kacheln.setUint8(y * 20 + x, wert)
    }
    function setzeHindernis(raumNr: number, x: number, y: number, breite: number, hoehe: number) {
        for (let j = y; j < y + hoehe; j++) for (let i = x; i < x + breite; i++) setzeKachel(raumNr, i, j, 1)
    }
    export function baueWelt(startwert: number) {
        grubeNr = Math.max(1, startwert & 0x7fffffff); zufallsWert = grubeNr
        raeume = []; dinge = []; routenTabelleGueltig = false; wegGrubenKachelNr = -1; wegBerechnungen = 0
        for (let i = 0; i < 12; i++) raeume.push(new RaumDaten(RAUM_X[i],
            RAUM_Y[i], RAUMARTEN[i], RAUMNAMEN[i]))
        verbinde(0,1); verbinde(1,2); verbinde(1,6); verbinde(2,3); verbinde(3,4); verbinde(4,5); verbinde(5,6)
        verbinde(3,7); verbinde(7,8); verbinde(8,9); verbinde(9,5); verbinde(8,10); verbinde(10,11); verbinde(11,9)
        if (zufall(2)) verbinde(4,8)
        for (let raumNr = 0; raumNr < 12; raumNr++) {
            for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++)
                setzeKachel(raumNr,x,y,x == 0 || y == 0 || x == 19 || y == 14 ? 1 : 0)
            if (raeume[raumNr].tueren[0] >= 0) {
                setzeKachel(raumNr,19,7,0)
                setzeKachel(raumNr,19,8,0)
            }
            if (raeume[raumNr].tueren[2] >= 0) { setzeKachel(raumNr,0,7,0); setzeKachel(raumNr,0,8,0) }
            if (raeume[raumNr].tueren[1] >= 0) {
                setzeKachel(raumNr,9,14,0)
                setzeKachel(raumNr,10,14,0)
            }
            if (raeume[raumNr].tueren[3] >= 0) {
                setzeKachel(raumNr,9,0,0)
                setzeKachel(raumNr,10,0,0)
            }
            if (raumNr != 0 && raumNr != 1) {
                // Zwei Varianten (ein Hindernis ist 2 oder 3 Kacheln hoch); das Kreuz in der Mitte und die Wege zu den
                // Dingen bleiben frei.
                let variante = zufall(2)
                setzeHindernis(raumNr,5,4,2,variante ? 3 : 2)
                setzeHindernis(raumNr,13,9,2,2)
                if (RAUMARTEN[raumNr] == Raumart.Lager) {
                    setzeHindernis(raumNr,13,3,2,3)
                    setzeHindernis(raumNr,5,10,2,2)
                }
                if (RAUMARTEN[raumNr] == Raumart.Werkstatt)
                    for (let x = 11; x < 14; x++) setzeKachel(raumNr,x,5,2)
            }
            if (raumNr == 5 || raumNr == 6) for (let x = 3; x < 6; x++) for (let y = 8; y < 11; y++)
                if (!istWand(raumNr,x,y)) setzeKachel(raumNr,x,y,3)
        }
        dinge.push(new Ding(0,76,52,Dingart.Ausgang))
        dinge.push(new Ding(4,76,52,Dingart.Generator))
        dinge.push(new Ding(1,76,60,Dingart.Sicherung))
        let kandidaten = [2,3,5,6,7,8,9,10]
        for (let i = kandidaten.length - 1; i > 0; i--) {
            let j = zufall(i+1); let merker=kandidaten[i]; kandidaten[i]=kandidaten[j]; kandidaten[j]=merker
        }
        for (let i = 0; i < 4; i++) dinge.push(new Ding(kandidaten[i], i % 2 ? 124 : 28, 92, Dingart.Sicherung))
        for (let i = 0; i < 4; i++) dinge.push(new Ding([7,9,2,5][i],124,28,Dingart.Batterie))
        for (let i = 0; i < 4; i++) dinge.push(new Ding([2,5,7,9][i],28,28,Dingart.Spind))
        for(let von=0;von<12;von++)for(let nach=0;nach<12;nach++)routenTabelle.setUint8(
            von*12+nach,naechsterRaum(von,nach,true))
        routenTabelleGueltig = true
    }
    export function istWeltGueltig(): boolean {
        if(raeume.length!=12)return false
        abstaende.fill(0)
        let startFeld=9+7*20,leseStelle=0,schreibStelle=1
        warteschlange.setNumber(NumberFormat.UInt16LE,0,startFeld)
        abstaende.setNumber(NumberFormat.UInt16LE,startFeld*2,1)
        while(leseStelle<schreibStelle) {
            let feld=warteschlange.getNumber(NumberFormat.UInt16LE,leseStelle++*2)
            for(let richtung=0;richtung<4;richtung++) {
                let nachbarFeld=nachbar(feld,richtung)
                if(nachbarFeld>=0 && abstaende.getNumber(NumberFormat.UInt16LE,nachbarFeld*2)==0) {
                    abstaende.setNumber(NumberFormat.UInt16LE,nachbarFeld*2,1)
                    warteschlange.setNumber(NumberFormat.UInt16LE,schreibStelle++*2,nachbarFeld)
                }
            }
        }
        for(let raumNr=0;raumNr<12;raumNr++)for(let kachelNr=0;kachelNr<300;kachelNr++) {
            if(raeume[raumNr].kacheln.getUint8(kachelNr)!=1
                && abstaende.getNumber(NumberFormat.UInt16LE,(raumNr*300+kachelNr)*2)==0)
                return false
        }
        let sicherungsRaeume=control.createBuffer(12),sicherungen=0,batterien=0
        for(let i=0;i<dinge.length;i++) {
            let ding=dinge[i]
            if(!kannStehen(ding.raum,ding.x,ding.y))return false
            if(ding.art==Dingart.Sicherung) {
                if(sicherungsRaeume.getUint8(ding.raum))return false
                sicherungsRaeume.setUint8(ding.raum,1)
                sicherungen++
            }
            if(ding.art==Dingart.Batterie)batterien++
        }
        return sicherungen==5 && batterien==4 && kannStehen(11,116,60)
    }
    export function starte(startwert: number, training: boolean) {
        baueWelt(startwert)
        // Jede zusammengesetzte Grube wird geprüft. Ist sie nicht in Ordnung, kommt die nächste Zahl dran (höchstens 49
        // Versuche), danach die feste Zahl 9137.
        let versuche = 0
        while (!istWeltGueltig() && versuche < 49) { versuche++; baueWelt(startwert + versuche) }
        if (!istWeltGueltig()) baueWelt(9137)
        Nacht.verwerfeBilder()
        raum = 0; figurX = 76; figurY = 76; blickX = 1; blickY = 0
        ladung = 100; lampe = false; getragen = 0; eingesetzt = 0; versteckt = -1
        pfiffPauseMs = 0; pfiffEffektMs = 0; malEntdeckt = 0
        pfiffe = 0; zeitMs = 0; hinweisSymbol = false; hinweisWartet = false
        beruehrungen = 0; sicherungenGenommen = 0; schonzeitMs = 0; zufriedenMs = 0; tasche = []; warnungenGegeben = 0
        brummi = new Roboter(); hinweis = ""; hinweisMs = 0; piepAbstand = 999
        radarUhrMs = 0; laermUhrMs = 0; einsetzLaermUhrMs = 0; piepRestMs = 0; warnungMs = 0
        schritt = 0; fortschritt = 0; schrittMs = 0; gewonnen = false; endGrund = ""
        laermRestMs = 0; laermRaum = -1; uebergangMs = 0; letzteTasten = 0
        klangNr = 0; klangVorrang = 0; klangRestMs = 0; gewaehlt = -1; atmosphaereMs = 0
        if (training) {
            // Das Training ist abgetrennt: Seine Sicherung, Batterie und Brummis Verhalten gelangen nie in ein Spiel.
            // Generator und Spind stehen bei y = 32, unter der Lektionszeile der Trainingsleiste, die bei y = 23 endet.
            dinge = [new Ding(0,116,44,Dingart.Sicherung),new Ding(0,76,32,Dingart.Generator),
                new Ding(0,28,32,Dingart.Spind)]
            raeume[0].tueren[0] = -1; setzeKachel(0,19,7,1); setzeKachel(0,19,8,1)
        }
        raeume[0].besucht = true
        beginneZustand(training ? Zustand.Training : Zustand.Spiel)
        if(training)fordereKlang(21,2)
    }
    export function hatSicht(raumNr: number, vonX: number,
        vonY: number, nachX: number, nachY: number): boolean {
        let x = Math.floor(vonX/8), y = Math.floor(vonY/8),
            zielSpalte = Math.floor(nachX/8), zielZeile = Math.floor(nachY/8)
        let dx = Math.abs(zielSpalte-x), dy = -Math.abs(zielZeile-y),
            schrittX = x<zielSpalte ? 1 : -1, schrittY = y<zielZeile ? 1 : -1
        let fehler = dx + dy
        for (let durchlauf = 0; durchlauf < 40; durchlauf++) {
            if (x == zielSpalte && y == zielZeile) return true
            if (istWand(raumNr,x,y)) return false
            let doppelterFehler = 2*fehler
            if (doppelterFehler >= dy) { fehler += dy; x += schrittX }
            if (doppelterFehler <= dx) { fehler += dx; y += schrittY }
        }
        return false
    }
    export function imKegel(spitzeX: number, spitzeY: number, dx: number, dy: number,
        punktX: number, punktY: number, reichweite: number, kosinus: number): boolean {
        let abstandX = punktX-spitzeX, abstandY=punktY-spitzeY,
            abstand = Math.sqrt(abstandX*abstandX+abstandY*abstandY)
        return abstand <= reichweite && (abstand < 1 || (abstandX*dx+abstandY*dy) / abstand >= kosinus)
    }
    export function istSichtbar(x: number, y: number): boolean {
        let nah = (x-figurX)*(x-figurX)+(y-figurY)*(y-figurY) <= 144
        if (versteckt >= 0)
            return Math.abs(y-figurY) < 8 && Math.abs(x-figurX)<64 && hatSicht(raum,figurX,figurY,x,y)
        return (nah || lampe && imKegel(figurX,figurY,blickX,blickY,x,y,64,0.866))
            && hatSicht(raum,figurX,figurY,x,y)
    }
    export function siehtFigur(): boolean {
        if (brummi.verhalten == Verhalten.Ladestation
            || brummi.verhalten == Verhalten.Lauschen || brummi.verhalten == Verhalten.Zurueckbringen
            || schonzeitMs > 0 || zufriedenMs > 0 || versteckt >= 0
            || raum == 0 && zustand != Zustand.Training || brummi.raum != raum) return false
        if (!hatSicht(raum,brummi.x,brummi.y,figurX,figurY)) return false
        let dx = figurX-brummi.x, dy = figurY-brummi.y
        if (dx*dx+dy*dy <= 144) return true
        return imKegel(brummi.x,brummi.y,brummi.dx,brummi.dy,figurX,figurY,lampe ? 72 : 24,0.819)
    }
    function nachbar(feld: number, richtung: number): number {
        let raumNr = Math.floor(feld/300), kachelNr = feld%300,
            x=kachelNr%20, y=Math.floor(kachelNr/20)
        let nachbarSpalte=x+(richtung==0 ? 1 : richtung==2 ? -1 : 0),
            nachbarZeile=y+(richtung==1 ? 1 : richtung==3 ? -1 : 0)
        if (nachbarSpalte<0 || nachbarSpalte>=20 || nachbarZeile<0 || nachbarZeile>=15) {
            raumNr = raeume[raumNr].tueren[richtung]
            if (raumNr<0) return -1
            nachbarSpalte = nachbarSpalte<0 ? 19 : nachbarSpalte>=20 ? 0 : nachbarSpalte
            nachbarZeile=nachbarZeile<0 ? 14 : nachbarZeile>=15 ? 0 : nachbarZeile
        }
        if (istWand(raumNr,nachbarSpalte,nachbarZeile)) return -1
        return raumNr*300+nachbarZeile*20+nachbarSpalte
    }
    // Misst die Strecke über begehbare Kacheln, genau, aber nur bis zur Hörweite grenze (höchstens 12 Kacheln).
    export function hoerweg(raumNr: number, x: number, y: number,
        andererRaum: number, andererX: number, andererY: number, grenze: number): number {
        let startFeld = raumNr*300+Math.floor(y/8)*20+Math.floor(x/8)
        let zielFeld = andererRaum*300+Math.floor(andererY/8)*20+Math.floor(andererX/8)
        abstaende.fill(0)
        let leseStelle=0,schreibStelle=1; warteschlange.setNumber(NumberFormat.UInt16LE,0,startFeld)
        abstaende.setNumber(NumberFormat.UInt16LE,startFeld*2,1)
        while (leseStelle<schreibStelle) {
            let feld=warteschlange.getNumber(NumberFormat.UInt16LE,leseStelle++*2),
                wert=abstaende.getNumber(NumberFormat.UInt16LE,feld*2)
            if (feld==zielFeld) return wert-1
            if (wert>grenze) continue
            for (let richtung=0;richtung<4;richtung++) {
                let naechstes=nachbar(feld,richtung)
                if (naechstes>=0 && abstaende.getNumber(NumberFormat.UInt16LE,naechstes*2)==0) {
                    abstaende.setNumber(NumberFormat.UInt16LE,naechstes*2,wert+1)
                    warteschlange.setNumber(NumberFormat.UInt16LE,schreibStelle++*2,naechstes)
                }
            }
        }
        return 999
    }
    export function macheLaerm(radius: number, x: number, y: number, quellRaum: number) {
        if (kachel(quellRaum,Math.floor(x/8),Math.floor(y/8)) == 3) radius /= 2
        laermRestMs=450; laermX=x; laermY=y; laermRaum=quellRaum
        if (brummi.verhalten == Verhalten.Ladestation
            || brummi.verhalten == Verhalten.Lauschen || brummi.verhalten == Verhalten.Zurueckbringen
            || zufriedenMs > 0 || zustand == Zustand.Training) return
        if (hoerweg(quellRaum,x,y,brummi.raum,brummi.x,brummi.y,radius) <= radius) {
            brummi.wartenMs=0;brummi.zielRaum=quellRaum
            brummi.zielX=x; brummi.zielY=y; brummi.wegAlterMs=1000
            if (brummi.verhalten != Verhalten.Hinterher) {
                brummi.verhalten=Verhalten.Neugierig
                brummi.uhrMs=0
            }
        }
    }
    export function naechsterRaum(von: number, nach: number, aufzugErlaubt: boolean): number {
        if (von == nach || !aufzugErlaubt && nach == 0) return von
        if (routenTabelleGueltig) return routenTabelle.getUint8(von*12+nach)
        let vorgaenger: number[] = []; routenRaeume = []
        for(let i=0;i<raeume.length;i++) vorgaenger.push(-2)
        vorgaenger[von]=-1; routenRaeume.push(von)
        for (let leseStelle=0;leseStelle<routenRaeume.length;leseStelle++) {
            let raumNr=routenRaeume[leseStelle]
            for(let richtung=0;richtung<4;richtung++) {
                let nachbarRaum=raeume[raumNr].tueren[richtung]
                if(nachbarRaum<0 || !aufzugErlaubt && nachbarRaum==0 || vorgaenger[nachbarRaum]!=-2) continue
                vorgaenger[nachbarRaum]=raumNr; routenRaeume.push(nachbarRaum)
            }
        }
        if(vorgaenger[nach]==-2) return von
        let naechster=nach
        while(vorgaenger[naechster]>=0 && vorgaenger[naechster]!=von) naechster=vorgaenger[naechster]
        return naechster
    }
    function beginneRunde() {
        brummi.verhalten=Verhalten.Runde; brummi.uhrMs=0; brummi.beobachteterSpind=-1
        let ziel=1+zufall(11)
        if(ziel==brummi.raum) ziel=ziel%11+1
        brummi.zielRaum=ziel; brummi.zielX=76; brummi.zielY=76; brummi.wegAlterMs=1000
    }
    function fahreHinterher() {
        if(brummi.verhalten!=Verhalten.Hinterher) { malEntdeckt++; fordereKlang(5,4) }
        brummi.verhalten=Verhalten.Hinterher; brummi.ausserSichtMs=0; brummi.wartenMs=0
        brummi.zielRaum=raum; brummi.zielX=figurX; brummi.zielY=figurY
    }
    // Brummi will nur Sicherungen: Trägt die Figur keine, fährt er nicht hinterher.
    function willSicherung(): boolean { return getragen > 0 || HINTERHER_LEER > 0 }
    // Brummi hat die Figur erreicht. Er nimmt die Sicherung, die zuletzt aufgesammelt wurde, und bringt sie an ihren
    // Platz zurück. Sicherungen im Generator bleiben dort. text ist leer oder ein Hinweis für die Zeile unten.
    function raeumeAuf(text: string) {
        beruehrungen++; schonzeitMs = SCHONZEIT_MS
        brummi.gesehenMs = 0; brummi.beobachteterSpind = -1; brummi.ausserSichtMs = 0
        if (getragen > 0 && tasche.length > 0) {
            let nummer = tasche.pop(); getragen--; sicherungenGenommen++; setztEin = false; einsetzMs = 0
            brummi.verhalten = Verhalten.Zurueckbringen; brummi.sicherungNr = nummer; brummi.wartenMs = 600
            brummi.zielRaum = dinge[nummer].raum; brummi.zielX = dinge[nummer].x
            brummi.zielY = dinge[nummer].y; brummi.wegAlterMs = 1000
            zeigeHinweis(text == "" ? "BRUMMI NIMMT 1 SICHERUNG!" : text); fordereKlang(25, 4)
        } else beruehreOhneSicherung()
    }
    // Berührung ohne getragene Sicherung: Es passiert nichts, Brummi fährt weiter und ist eine Weile zufrieden.
    function beruehreOhneSicherung() {
        beginneRunde(); zufriedenMs = ZUFRIEDEN_MS; brummi.wartenMs = 800
        zeigeHinweis("NICHTS ZUM AUFRÄUMEN."); fordereKlang(26, 3)
    }
    // Brummi legt die getragene Sicherung dorthin zurück, wo sie lag, wartet und beginnt eine neue Runde. Für jede
    // Sicherung, die er früher in dieser Schicht zurückgelegt hat, bleibt er etwas länger zufrieden (wer langsam
    // spielt, verliert nicht immer wieder dieselbe Sicherung). Der Hinweis nennt den Raum, in dem die Sicherung wieder
    // liegt, außer es läuft gerade eine Lampenwarnung.
    function legeAb() {
        if (brummi.sicherungNr >= 0) {
            let ding = dinge[brummi.sicherungNr]
            ding.genommen = false
            if (!(hinweisMs > 0 && hinweisWartet)) {
                zeigeHinweis(raeume[ding.raum].raumName)
                hinweisSymbol = true
            }
        }
        brummi.sicherungNr = -1; beginneRunde(); brummi.wartenMs = 1500; fordereKlang(28, 2)
        zufriedenMs = Math.min(ZUFRIEDEN_MAX_MS,
            ZUFRIEDEN_MS + ZUFRIEDEN_PLUS_MS * Math.max(0, sicherungenGenommen - 1))
    }
    function berechneBrummiWeg(zielX: number, zielY: number) {
        let startSpalte=Math.floor(brummi.x/8),startZeile=Math.floor(brummi.y/8),
            zielSpalte=Math.floor(zielX/8),zielZeile=Math.floor(zielY/8)
        let zielGrubenKachelNr=brummi.raum*300+zielZeile*20+zielSpalte
        if(wegGrubenKachelNr!=zielGrubenKachelNr) {
        wegGrubenKachelNr=zielGrubenKachelNr;wegBerechnungen++;wegAbstaende.fill(0)
        let leseStelle=0,schreibStelle=1,zielKachelNr=zielZeile*20+zielSpalte
        wegWarteschlange.setNumber(NumberFormat.UInt16LE,0,zielKachelNr)
        wegAbstaende.setNumber(NumberFormat.UInt16LE,zielKachelNr*2,1)
        while(leseStelle<schreibStelle) {
            let feld=wegWarteschlange.getNumber(NumberFormat.UInt16LE,leseStelle++*2),
                x=feld%20,y=Math.floor(feld/20)
            let wert=wegAbstaende.getNumber(NumberFormat.UInt16LE,feld*2)
            for(let richtung=0;richtung<4;richtung++) {
                let nachbarSpalte=x+(richtung==0?1:richtung==2?-1:0),
                    nachbarZeile=y+(richtung==1?1:richtung==3?-1:0),naechstes=nachbarZeile*20+nachbarSpalte
                if(!istWand(brummi.raum,nachbarSpalte,nachbarZeile)
                    && wegAbstaende.getNumber(NumberFormat.UInt16LE,naechstes*2)==0) {
                    wegAbstaende.setNumber(NumberFormat.UInt16LE,naechstes*2,wert+1)
                    wegWarteschlange.setNumber(NumberFormat.UInt16LE,schreibStelle++*2,naechstes)
                }
            }
        }
        }
        let bester=wegAbstaende.getNumber(NumberFormat.UInt16LE,(startZeile*20+startSpalte)*2)
        brummi.wegX=brummi.x; brummi.wegY=brummi.y
        if(startSpalte==zielSpalte && startZeile==zielZeile) { brummi.wegX=zielX;brummi.wegY=zielY;return }
        for(let richtung=0;richtung<4;richtung++) {
            let nachbarSpalte=startSpalte+(richtung==0?1:richtung==2?-1:0),
                nachbarZeile=startZeile+(richtung==1?1:richtung==3?-1:0)
            if(istWand(brummi.raum,nachbarSpalte,nachbarZeile)) continue
            let wert=wegAbstaende.getNumber(NumberFormat.UInt16LE,(nachbarZeile*20+nachbarSpalte)*2)
            if(wert>0 && (wert<bester || bester==0)) {
                bester=wert
                brummi.wegX=nachbarSpalte*8+4
                brummi.wegY=nachbarZeile*8+4
            }
        }
    }
    function bewegeBrummi(dt: number) {
        if(brummi.wartenMs>0) {brummi.wartenMs-=dt;return}
        let zielX=brummi.zielX,zielY=brummi.zielY,naechster=brummi.raum,tuer=-1
        if(brummi.zielRaum!=brummi.raum) {
            naechster=naechsterRaum(brummi.raum,brummi.zielRaum,false)
            if(naechster==brummi.raum) {
                if(brummi.verhalten==Verhalten.Zurueckbringen)legeAb()
                else beginneRunde()
                return
            }
            for(let richtung=0;richtung<4;richtung++) if(raeume[brummi.raum].tueren[richtung]==naechster)
                tuer=richtung
            zielX=tuer==0?156:tuer==2?4:76;zielY=tuer==1?116:tuer==3?4:60
        }
        brummi.wegAlterMs+=dt
        let grubenKachelNr=Math.floor(zielX/8)+Math.floor(zielY/8)*20+brummi.raum*300
        if(brummi.wegAlterMs>=200 || Math.abs(brummi.x-brummi.wegX)+Math.abs(brummi.y-brummi.wegY)<1
            || brummi.zielGrubenKachelNr!=grubenKachelNr) {
            berechneBrummiWeg(zielX,zielY);brummi.wegAlterMs=0;brummi.zielGrubenKachelNr=grubenKachelNr
        }
        let dx=brummi.wegX-brummi.x,dy=brummi.wegY-brummi.y,abstand=Math.sqrt(dx*dx+dy*dy)
        let tempo=brummi.verhalten==Verhalten.Hinterher?HINTERHER_TEMPO+eingesetzt*HINTERHER_PLUS:
            brummi.verhalten==Verhalten.Zurueckbringen?TRAGE_TEMPO
                :brummi.verhalten==Verhalten.Runde?30:brummi.verhalten==Verhalten.Umschauen?50:45
        if(abstand>0.1) {
            brummi.dx=dx/abstand;brummi.dy=dy/abstand
            let strecke=Math.min(abstand,tempo*dt/1000)
            brummi.x+=brummi.dx*strecke;brummi.y+=brummi.dy*strecke
        }
        if(tuer>=0 && Math.abs(brummi.x-zielX)+Math.abs(brummi.y-zielY)<2) {
            brummi.raum=naechster;brummi.x=tuer==0?4:tuer==2?156:76
            brummi.y=tuer==1?4:tuer==3?116:60;brummi.wegAlterMs=1000
        } else if(tuer<0 && Math.abs(brummi.x-zielX)+Math.abs(brummi.y-zielY)<3) {
            if(brummi.verhalten==Verhalten.Runde) {beginneRunde();brummi.wartenMs=eingesetzt>=2?1000:2000}
            else if(brummi.verhalten==Verhalten.Neugierig) {
                brummi.uhrMs+=dt
                if(brummi.uhrMs>=3000)beginneRunde()
            }
            else if(brummi.verhalten==Verhalten.Zurueckbringen) legeAb()
        }
    }
    function aktualisiereBrummi(dt: number) {
        if(brummi.verhalten==Verhalten.Ladestation) {
            if(brummi.weckRestMs>0) {
                brummi.weckRestMs-=dt
                if(brummi.weckRestMs<=0)beginneRunde()
            }
            return
        }
        if(brummi.verhalten==Verhalten.Lauschen) {
            brummi.uhrMs-=dt
            if(brummi.uhrMs<=0) {
                brummi.verhalten=Verhalten.Neugierig
                brummi.uhrMs=0
                brummi.wegAlterMs=1000
            }
            return
        }
        // Brummi bringt eine Sicherung zurück: Er fährt nur und bemerkt nichts.
        if(brummi.verhalten==Verhalten.Zurueckbringen) {bewegeBrummi(dt);return}
        let sieht=siehtFigur(),will=willSicherung()
        if(sieht && will) {
            brummi.gesehenMs+=dt
            let dx=figurX-brummi.x,dy=figurY-brummi.y
            if(brummi.gesehenMs>=600 || dx*dx+dy*dy<=144 || brummi.verhalten==Verhalten.Hinterher)
                fahreHinterher()
        } else brummi.gesehenMs=0
        // Gibt es nichts mehr aufzuräumen (zum Beispiel weil die letzte Sicherung im Generator steckt), hört Brummi
        // sofort auf, hinterherzufahren.
        if(!will && (brummi.verhalten==Verhalten.Hinterher || brummi.verhalten==Verhalten.Umschauen))
            beginneRunde()
        // Verstecken: Brummi hat gesehen, wie die Figur in den Spind stieg, und findet sie dort.
        if(brummi.beobachteterSpind==versteckt && versteckt>=0 && brummi.raum==raum
            && Math.abs(brummi.x-figurX)+Math.abs(brummi.y-figurY)<10) {
            versteckt=-1;raeumeAuf("GEFUNDEN! BRUMMI RÄUMT AUF");return
        }
        if(brummi.verhalten==Verhalten.Hinterher && !sieht) {
            brummi.ausserSichtMs+=dt
            if(brummi.ausserSichtMs>=2000) {brummi.verhalten=Verhalten.Umschauen;brummi.uhrMs=UMSCHAUEN_MS}
        }
        if(brummi.verhalten==Verhalten.Umschauen) {
            brummi.uhrMs-=dt
            if(brummi.uhrMs<=0) beginneRunde()
            else if(brummi.raum==brummi.zielRaum
                && Math.abs(brummi.x-brummi.zielX)+Math.abs(brummi.y-brummi.zielY)<5) {
                let x=Math.max(12,Math.min(148,brummi.zielX+zufall(65)-32)),
                    y=Math.max(20,Math.min(100,brummi.zielY+zufall(65)-32))
                if(kannStehen(brummi.raum,x,y)) {brummi.zielX=x;brummi.zielY=y;brummi.wegAlterMs=1000}
            }
        }
        // Lichtflecken machen Brummi nur neugierig; er erfährt dadurch nicht, wo das Licht herkommt.
        if(lampe && zufriedenMs<=0 && brummi.raum==raum && raum!=0
            && brummi.verhalten==Verhalten.Runde && !sieht) {
            for(let abstand=16;abstand<=64;abstand+=16) {
                let x=figurX+blickX*abstand,y=figurY+blickY*abstand
                if(!istWand(raum,Math.floor(x/8),Math.floor(y/8)) && istSichtbar(x,y)
                    && imKegel(brummi.x,brummi.y,brummi.dx,brummi.dy,x,y,72,0.819)
                    && hatSicht(raum,brummi.x,brummi.y,x,y)) {
                    brummi.wartenMs=0;brummi.verhalten=Verhalten.Neugierig;brummi.zielRaum=raum
                    brummi.zielX=x;brummi.zielY=y;brummi.uhrMs=0;break
                }
            }
        }
        bewegeBrummi(dt)
        if(schonzeitMs<=0 && zufriedenMs<=0 && versteckt<0 && brummi.raum==raum && raum!=0
            && Math.abs(brummi.x-figurX)<6 && Math.abs(brummi.y-figurY)<6) raeumeAuf("")
    }
    export function findeDing(): number {
        if(versteckt>=0)return versteckt
        let bester=-1,besterAbstand=100000
        for(let i=0;i<dinge.length;i++) {
            let ding=dinge[i]
            if(ding.raum!=raum || ding.genommen)continue
            let dx=ding.x-figurX,dy=ding.y-figurY,abstandQuadrat=dx*dx+dy*dy
            // Das Bild des Generators ist 19 x 17 Pixel groß (der Kasten 17 x 14). Die Figur soll an der Schalttafel
            // einsetzen können, ohne das Bild zu überdecken oder genau auf die Mitte zu schauen.
            let reichweite=ding.art==Dingart.Generator ? 18 : 11
            let zugewandt=ding.art==Dingart.Generator || abstandQuadrat<=25 || dx*blickX+dy*blickY>=0
            if(abstandQuadrat<reichweite*reichweite && abstandQuadrat<besterAbstand && zugewandt
                && hatSicht(raum,figurX,figurY,ding.x,ding.y)) {
                besterAbstand=abstandQuadrat
                bester=i
            }
        }
        return bester
    }
    function benutze() {
        if(versteckt>=0) {
            versteckt=-1;macheLaerm(4,figurX,figurY,raum);fordereKlang(3,2)
            if(zustand==Zustand.Training && schritt==5 && fortschritt>0)schalteSchrittWeiter()
            return
        }
        gewaehlt=findeDing()
        if(gewaehlt<0)return
        // Ab Trainingsschritt 7 nimmt A nur noch die Batterie aus Schritt 12.
        if(zustand==Zustand.Training && schritt>=6 && !(schritt==11 && dinge[gewaehlt].art==Dingart.Batterie))return
        let ding=dinge[gewaehlt]
        if(zustand==Zustand.Training && (schritt<3 || schritt==3 && ding.art!=Dingart.Sicherung
            || schritt==4 && ding.art!=Dingart.Generator || schritt==5 && ding.art!=Dingart.Spind))return
        if(ding.art==Dingart.Sicherung) {
            if(getragen>=3) {zeigeHinweis("TASCHE VOLL  3/3");return}
            ding.genommen=true;getragen++;tasche.push(gewaehlt);fordereKlang(2,2)
            if(brummi.verhalten==Verhalten.Ladestation && brummi.weckRestMs==0) {
                brummi.weckRestMs=WECKEN_MS;zeigeHinweis("PIEP! BRUMMI IST WACH.");fordereKlang(7,3)
            }
            if(zustand==Zustand.Training && schritt==3)schalteSchrittWeiter()
        } else if(ding.art==Dingart.Batterie) {
            if(ladung>=100) {zeigeHinweis("BATTERIE VOLL");return}
            ladung=Math.min(100,ladung+BATTERIE_GEWINN);warnungenGegeben=0
            ding.genommen=true;fordereKlang(2,2);zeigeHinweis("BATTERIE AUFGENOMMEN")
            if(zustand==Zustand.Training && schritt==11)schalteSchrittWeiter()
        } else if(ding.art==Dingart.Spind) {
            let beobachtet=siehtFigur()
            versteckt=gewaehlt;figurX=ding.x;figurY=ding.y;lampe=false
            // Verstecken spielt nur, wenn die Figur eine Sicherung trägt; ohne eine schaut Brummi nur kurz nach („?“)
            // und zählt nichts.
            if(beobachtet && willSicherung()) {
                fahreHinterher()
                brummi.beobachteterSpind=versteckt
                brummi.wegAlterMs=1000
            }
            else if(beobachtet) {
                brummi.wartenMs=0;brummi.verhalten=Verhalten.Neugierig;brummi.zielRaum=raum
                brummi.zielX=figurX;brummi.zielY=figurY;brummi.uhrMs=0;brummi.wegAlterMs=1000
            }
            macheLaerm(4,figurX,figurY,raum);fordereKlang(3,2)
            if(zustand==Zustand.Training && schritt==5)fortschritt=1
        } else if(ding.art==Dingart.Generator) {
            if(getragen<=0)zeigeHinweis("SICHERUNGEN FINDEN")
            else {setztEin=true;einsetzMs=0;einsetzLaermUhrMs=500;if(!hinweisWartet)hinweisMs=0}
        } else zeigeHinweis(eingesetzt<5?"KEIN STROM. 5 SICHERUNGEN":"AUFZUG BEREIT")
    }
    function schalteSchrittWeiter() {
        schritt++;schrittMs=0;fortschritt=0;fordereKlang(2,2)
        if(schritt>=6 && schritt<=9) {
            // Jede sichere Vorführung wird genau einmal beim Betreten aufgebaut.
            figurX=92;figurY=76;blickX=1;blickY=0;versteckt=-1;lampe=true
            brummi.raum=0;brummi.x=124;brummi.y=76;brummi.dx=-1;brummi.dy=0
            brummi.verhalten=Verhalten.Runde;brummi.gesehenMs=0;brummi.beobachteterSpind=-1
            ladung=100;pfiffPauseMs=0;bHaltenMs=0;bAusgeloest=false
            getragen=1 // Übungssicherung: Brummi will Sicherungen (das Training nimmt sie nie weg)
        }
        if(schritt==8)lampe=false
        if(schritt==11) {
            // Lampenlektion: Die Trainingsbatterie erscheint erst jetzt, dort wo Brummi stand; er macht Platz.
            getragen=0;ladung=TRAINING_LADUNG;pfiffPauseMs=0
            dinge.push(new Ding(0,124,76,Dingart.Batterie))
            brummi.verhalten=Verhalten.Runde;brummi.x=144;brummi.y=92;brummi.dx=-1;brummi.dy=0
        }
    }
    function pfeife() {
        if(versteckt>=0) {zeigeHinweis("IM SPIND NICHT MÖGLICH");return}
        if(pfiffPauseMs>0) {zeigeHinweis("ERST LUFT HOLEN!");return}
        // Brummi bringt gerade eine Sicherung zurück und hört nichts: Der Pfiff würde nichts bewirken, darum kostet er
        // nichts und ein kurzer Ton sagt das.
        if(brummi.verhalten==Verhalten.Zurueckbringen) {fordereKlang(26,3);return}
        // Pfeifen kostet keinen Strom, braucht kein Zielen und geht um Ecken (siehe hoerweg).
        pfiffe++;pfiffEffektMs=300;pfiffPauseMs=PFIFF_PAUSE_MS;setztEin=false;einsetzMs=0
        fordereKlang(4,3)
        let abstandX=brummi.x-figurX,abstandY=brummi.y-figurY
        if(brummi.verhalten==Verhalten.Ladestation || brummi.raum!=raum
            || abstandX*abstandX+abstandY*abstandY>PFIFF_REICHWEITE*PFIFF_REICHWEITE)
            macheLaerm(6,figurX,figurY,raum)
        else {
            brummi.verhalten=Verhalten.Lauschen
            brummi.uhrMs=PFIFF_STOPP_MS;brummi.beobachteterSpind=-1
            brummi.zielRaum=raum;brummi.zielX=figurX
            brummi.zielY=figurY;brummi.gesehenMs=0;fordereKlang(8,4)
            if(zustand==Zustand.Training && schritt==9)schalteSchrittWeiter()
        }
    }
    function kannStehen(raumNr: number,x: number,y: number): boolean {
        return !istWand(raumNr,Math.floor((x-2)/8),Math.floor((y-2)/8))
            && !istWand(raumNr,Math.floor((x+2)/8),Math.floor((y-2)/8))
            && !istWand(raumNr,Math.floor((x-2)/8),Math.floor((y+2)/8))
            && !istWand(raumNr,Math.floor((x+2)/8),Math.floor((y+2)/8))
    }
    function bewegeFigur(dx: number,dy: number) {
        let neuX=figurX+dx,neuY=figurY+dy,richtung=-1
        if(neuX<3 && raeume[raum].tueren[2]>=0 && figurY>=58 && figurY<=70)richtung=2
        if(neuX>157 && raeume[raum].tueren[0]>=0 && figurY>=58 && figurY<=70)richtung=0
        if(neuY<3 && raeume[raum].tueren[3]>=0 && figurX>=74 && figurX<=86)richtung=3
        if(neuY>117 && raeume[raum].tueren[1]>=0 && figurX>=74 && figurX<=86)richtung=1
        if(richtung>=0) {
            let zielRaum=raeume[raum].tueren[richtung], zielX=richtung==0?4:richtung==2?156:figurX,
                zielY=richtung==1?4:richtung==3?116:figurY
            raum=zielRaum;figurX=zielX;figurY=zielY
            raeume[raum].besucht=true;uebergangMs=600;radarUhrMs=200
            if(raum==0 && eingesetzt==5)beende(true,"")
            return
        }
        if(kannStehen(raum,neuX,figurY))figurX=neuX
        if(kannStehen(raum,figurX,neuY))figurY=neuY
    }
    export function beende(erfolg: boolean,grund: string) {
        gewonnen=erfolg;endGrund=grund;beginneZustand(Zustand.Ergebnis);fordereKlang(erfolg?9:6,5)
    }
    // Menütaste: öffnet die Pause und schließt sie wieder. Aus dem Training startet der Zeiger
    // bei „TRAINING AUSLASSEN“ (ein Druck auf A überspringt es).
    export function schaltePause() {
        if(zustand==Zustand.Pause) {beginneZustand(vorherZustand);return}
        if(zustand==Zustand.Spiel || zustand==Zustand.Training) {
            vorherZustand=zustand;beginneZustand(Zustand.Pause);if(vorherZustand==Zustand.Training)menue=1
        }
    }
    export function aktualisiere(dt: number,tasten: number) {
        dt=Math.min(50,Math.max(0,dt));alterMs+=dt;vergangenMs+=dt
        let gedrueckt=tasten & ~letzteTasten,losgelassen=letzteTasten & ~tasten;letzteTasten=tasten
        if(gedrueckt&16)aDruckMs=vergangenMs
        if(gedrueckt&32)bDruckMs=vergangenMs
        klangRestMs-=dt;if(klangRestMs<=0)klangVorrang=0
        if(zustand==Zustand.Intro) {
            // A oder B: zuerst zur Studiokarte, von der Karte (nach 1,5 Sekunden) zum Titelmenü. Die ersten 0,5
            // Sekunden zählt kein Druck.
            if(alterMs>=introDauerMs)beginneZustand(Zustand.Titel)
            else if(alterMs>500 && (gedrueckt&48)!=0) {
                if(alterMs<STUDIOKARTE_BEGINN_MS)alterMs=STUDIOKARTE_BEGINN_MS
                else if(alterMs>=STUDIOKARTE_BEGINN_MS+STUDIOKARTE_SPERRE_MS)beginneZustand(Zustand.Titel)
            }
            return
        }
        // Menüs reagieren in den ersten 500 Millisekunden nicht, damit wildes Drücken auf A nicht
        // zufällig irgendwo landet.
        if((zustand==Zustand.Titel || zustand==Zustand.TrainingWahl) && alterMs<500)return
        if(zustand==Zustand.Titel) {
            if(gedrueckt&1 || gedrueckt&4) {menue=(menue+3)%4;fordereKlang(1,1)}
            if(gedrueckt&2 || gedrueckt&8) {menue=(menue+1)%4;fordereKlang(1,1)}
            if(gedrueckt&16) {
                if(menue==0)beginneZustand(Zustand.TrainingWahl)
                if(menue==1)starte(grubeNr,true)
                if(menue==2)reduziert=!reduziert
                if(menue==3)stumm=!stumm
            }
            return
        }
        if(zustand==Zustand.TrainingWahl) {
            if(gedrueckt&16)starte(grubeNr,true)
            else if(gedrueckt&32)starte(grubeNr,false)
            return
        }
        if(zustand==Zustand.Pause) {
            if(gedrueckt&1 || gedrueckt&4)menue=(menue+3)%4
            if(gedrueckt&2 || gedrueckt&8)menue=(menue+1)%4
            if(gedrueckt&16) {
                if(menue==0)beginneZustand(vorherZustand)
                else if(menue==1) {if(vorherZustand==Zustand.Training)starte(grubeNr,false);else reduziert=!reduziert}
                else if(menue==2)stumm=!stumm
                else beginneZustand(Zustand.Titel)
            }
            return
        }
        if(zustand==Zustand.Ergebnis) {
            if(alterMs>600 && gedrueckt&16)starte(grubeNr,false)
            else if(alterMs>600 && gedrueckt&32)starte((grubeNr+7919)%99999+1,false)
            return
        }
        // Pausengriff A+B nur, wenn beide zusammen gedrückt wurden und 0,9 Sekunden gehalten werden; sonst pfeift B,
        // während A rennt.
        let pausengriff=(tasten&48)==48 && Math.abs(aDruckMs-bDruckMs)<=PAUSE_GRIFF_MS
        if(pausengriff) {
            griffMs+=dt;setztEin=false;einsetzMs=0;bHaltenMs=0;bAusgeloest=true;aGesperrt=true
            if(griffMs>=900) {schaltePause();return}
        } else griffMs=0
        // Im Training bleibt die Lampe voll; nur die Lampenlektion (Schritt 12) zeigt eine schwache Lampe (40 Prozent).
        if(zustand==Zustand.Training && schritt<11)ladung=100
        if(!(tasten&16))aGesperrt=false
        zeitMs+=dt;pfiffEffektMs=Math.max(0,pfiffEffektMs-dt);pfiffPauseMs=Math.max(0,pfiffPauseMs-dt)
        schonzeitMs=Math.max(0,schonzeitMs-dt);zufriedenMs=Math.max(0,zufriedenMs-dt)
        // Beim Einsetzen einer Sicherung zeigt die untere Zeile den Fortschrittsbalken; eine Lampenwarnung wartet, bis
        // das Einsetzen vorbei ist.
        if(!setztEin || !hinweisWartet)hinweisMs=Math.max(0,hinweisMs-dt)
        laermRestMs=Math.max(0,laermRestMs-dt);uebergangMs=Math.max(0,uebergangMs-dt)
        let dx=(tasten&2?1:0)-(tasten&1?1:0),dy=(tasten&8?1:0)-(tasten&4?1:0)
        let bewegt=dx!=0 || dy!=0, rennt=bewegt && (tasten&16)!=0
        if(bewegt && versteckt<0) {
            let laenge=Math.sqrt(dx*dx+dy*dy);blickX=dx/laenge;blickY=dy/laenge
            let strecke=(rennt?92:45)*dt/1000
            let vorherX=figurX,vorherY=figurY,vorherRaum=raum
            bewegeFigur(blickX*strecke,blickY*strecke)
            let istGelaufen=vorherX!=figurX || vorherY!=figurY || vorherRaum!=raum
            laermUhrMs=istGelaufen?laermUhrMs+dt:0
            if(laermUhrMs>=400) {
                laermUhrMs=0
                macheLaerm(kachel(raum,Math.floor(figurX/8),Math.floor(figurY/8))==2?8:rennt?10:3,
                    figurX,figurY,raum)
                if(istGelaufen)fordereKlang(rennt?11:20,1)
            }
            if(zustand==Zustand.Training && (schritt==2 || schritt==8) && rennt && istGelaufen)fortschritt+=dt
        }
        if((zustand as number)==Zustand.Ergebnis)return
        if(!pausengriff && gedrueckt&16 && !bewegt && !aGesperrt) {aGesperrt=true;benutze()}
        if(setztEin) {
            if(!(tasten&16) || bewegt || versteckt>=0) {setztEin=false;einsetzMs=0}
            else {
                einsetzMs+=dt;einsetzLaermUhrMs+=dt
                if(einsetzLaermUhrMs>=500) {
                    einsetzLaermUhrMs=0
                    macheLaerm(12,figurX,figurY,raum)
                    fordereKlang(3,1)
                }
                if(einsetzMs>=3000) {
                    eingesetzt++;getragen--;tasche.shift();einsetzMs=0;setztEin=false;fordereKlang(12,3)
                    if(zustand==Zustand.Training && schritt==4)schalteSchrittWeiter()
                    else if(eingesetzt==5) {
                        zeigeHinweis("STROM! ZURÜCK ZUM AUFZUG!")
                        if(brummi.verhalten!=Verhalten.Hinterher
                            && brummi.verhalten!=Verhalten.Lauschen) {
                            brummi.verhalten=Verhalten.Neugierig;brummi.zielRaum=4;brummi.zielX=76
                            brummi.zielY=52;brummi.uhrMs=0;brummi.wegAlterMs=1000
                        }
                    }
                }
            }
        }
        if(!pausengriff && tasten&32) {bHaltenMs+=dt;if(bHaltenMs>=350 && !bAusgeloest) {bAusgeloest=true;pfeife()}}
        if(losgelassen&32) {
            if(!bAusgeloest && bHaltenMs>0 && versteckt<0) {lampe=!lampe;fordereKlang(1,1)}
            bHaltenMs=0;bAusgeloest=false
        }
        if(!(tasten&32) && !(losgelassen&32)) {bHaltenMs=0;bAusgeloest=false}
        // Die Lampe ist die Uhr der Schicht: Ist sie leer, ist die Schicht vorbei.
        // Stecken alle fünf Sicherungen im Generator, verbraucht die Lampe nichts mehr, denn dann gibt
        // der Generator Licht.
        if(zustand==Zustand.Spiel) {
            if(eingesetzt<5)ladung=Math.max(0,ladung-(lampe?VERBRAUCH_KEGEL:VERBRAUCH_RUHE)*dt/1000)
            if(ladung<=LAMPE_WARNUNG_1 && warnungenGegeben<1) {
                warnungenGegeben=1;zeigeHinweis("LAMPE WIRD SCHWACH.");hinweisWartet=true;fordereKlang(27,2)
            }
            if(ladung<=LAMPE_WARNUNG_2 && warnungenGegeben<2) {
                warnungenGegeben=2;zeigeHinweis("LAMPE FAST LEER! BATTERIE?");hinweisWartet=true;fordereKlang(27,3)
            }
            if(ladung<=0) {lampe=false;beende(false,"DIE LAMPE IST LEER.");return}
        }
        gewaehlt=findeDing()
        if(zustand==Zustand.Training) {
            schrittMs+=dt
            if(brummi.verhalten==Verhalten.Lauschen) {
                brummi.uhrMs=Math.max(0,brummi.uhrMs-dt)
                if(brummi.uhrMs==0)brummi.verhalten=Verhalten.Runde
            }
            // Schritt 7: Brummi piept aus festen 4 Kacheln Abstand, die Antenne in der Anzeige blinkt.
            warnungMs=Math.max(0,warnungMs-dt)
            if(schritt==6) {
                piepAbstand=4;piepRestMs-=dt
                if(piepRestMs<=0) {
                    piepRestMs=PIEP_NAH_MS+2*PIEP_JE_KACHEL_MS
                    warnungMs=160
                    fordereKlang(13,2)
                }
            }
            else piepAbstand=999
            if(schritt==0 && Math.abs(figurX-116)+Math.abs(figurY-76)<10)schalteSchrittWeiter()
            else if(schritt==1 && lampe)schalteSchrittWeiter()
            else if(schritt==2 && fortschritt>=2000)schalteSchrittWeiter()
            else if(schritt==6 && schrittMs>700 && gedrueckt&16)schalteSchrittWeiter()
            else if(schritt==7) {
                brummi.gesehenMs=lampe?Math.min(600,schrittMs):0
                if(!lampe && schrittMs>300)schalteSchrittWeiter()
            } else if(schritt==8) {
                if(laermRestMs>0)brummi.verhalten=Verhalten.Neugierig
                if(fortschritt>=1000)schalteSchrittWeiter()
            } else if(schritt==10) {
                if(figurX<48 && figurY>60 && figurY<90)schalteSchrittWeiter()
            } else if(schritt==12 && schrittMs>700 && gedrueckt&16)starte(grubeNr,false)
            return
        }
        aktualisiereBrummi(dt)
        radarUhrMs+=dt
        if(radarUhrMs>=200) {
            radarUhrMs=0
            piepAbstand=brummi.verhalten==Verhalten.Ladestation?999
                :hoerweg(raum,figurX,figurY,brummi.raum,brummi.x,brummi.y,12)
        }
        warnungMs=Math.max(0,warnungMs-dt);piepRestMs-=dt
        if(piepAbstand<=12 && piepRestMs<=0) {
            piepRestMs=PIEP_NAH_MS+Math.max(0,piepAbstand-2)*PIEP_JE_KACHEL_MS
            warnungMs=160;fordereKlang(13,2)
        }
        atmosphaereMs+=dt
        if(atmosphaereMs>=14000) {atmosphaereMs=0;fordereKlang(14,1)}
    }
}
