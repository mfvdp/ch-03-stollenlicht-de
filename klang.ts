// Freundliche Musik und leise Geräusche der Grube; jede Stimme klingt am Ende aus.
// Befehle für den Mischer von Arcade: 1 = Dreieck, 3 = Sinus, 18 = Rauschen (WaveShape.Noise, ein Zyklusrauschen des
// Synthesizers; weißes Rauschen wäre 5). Die Lautstärken gehen von 0 bis 1023.
// Regel gegen Erschrecken: Eine Spitze über 400 braucht einen Anstieg von mindestens 100 Millisekunden;
// Trommeln bleiben bei 400 oder darunter.
namespace NachtKlang {
    let klaenge: Buffer[] = []
    let laengenMs: number[] = []
    let besetztBisMs = 0
    let vorrang = 0
    let vorherZustand = -1
    let vorherAlterMs = -1
    let verstummt = false
    let introKlangNr = 0
    // Schnitte, Handlungspunkte und die Studiokarte teilen sich eine Zeitleiste (Filmzeit).
    // Wind, Riegel, Förderkorb, Funken, leises Ausschalten, Piepton, steigende Pieptöne, Monitor an,
    // Studio-Anschwellen, kleine Glocke, Studioakkord, Titel.
    const klangZeitenMs = [700, 5300, 7200, 10800, 15500, 19000, 21300, 23400, 25600, 26950, 28500, 34600]
    const klangNummern = [15, 3, 16, 17, 19, 13, 30, 22, 23, 29, 24, 18]
    let musikNr = 0
    // Im Speicher liegt immer nur der nächste Abschnitt der Musik.
    let musik: Buffer[] = []
    let fertigerAbschnitt = -1
    // 180 Schläge pro Minute: 36 Achtelnoten pro Abschnitt von sechs Sekunden. Die Bildzeiten bleiben fest.
    const achtelMs = 1000 / 6
    // Fünf Stimmen lassen drei Kanäle für den Studioakkord frei.
    const musikZeitenMs = [500,6500,12500,18500,24500,30500,36500,42500,48500,54500,60500]
    const musikLaengenMs = [6000,6000,6000,6000,6000,6000,6000,6000,6000,6000,3000]
    let atmosphaeren: Buffer[] = []
    let summen: Buffer[] = []
    let naechsteAtmosphaereMs = 0
    let naechstesSummenMs = 0
    let atmosphaerenNr = 0
    let trittWasser: Buffer
    let trittMetall: Buffer
    let trittWasserRennen: Buffer
    let trittMetallRennen: Buffer
    let akkordTief: Buffer
    let akkordHoch: Buffer

    function schreibeSegment(puffer: Buffer, versatz: number, welle: number, dauerMs: number,
        vonHz: number, bisHz: number, vonLautstaerke: number, bisLautstaerke: number) {
        puffer.setUint8(versatz, welle)
        puffer.setNumber(NumberFormat.UInt16LE, versatz + 2, vonHz)
        puffer.setNumber(NumberFormat.UInt16LE, versatz + 4, dauerMs)
        puffer.setNumber(NumberFormat.UInt16LE, versatz + 6, vonLautstaerke)
        puffer.setNumber(NumberFormat.UInt16LE, versatz + 8, bisLautstaerke)
        puffer.setNumber(NumberFormat.UInt16LE, versatz + 10, bisHz)
    }
    function baueHuellkurve(welle: number, vonHz: number, bisHz: number,
        spitze: number, anstiegMs: number, dauerMs: number): Buffer {
        let daten = control.createBuffer(36)
        let mitte = Math.round(vonHz + (bisHz - vonHz) * anstiegMs / dauerMs)
        schreibeSegment(daten, 0, welle, anstiegMs, vonHz, mitte, 0, spitze)
        schreibeSegment(daten, 12, welle, dauerMs - anstiegMs, mitte, bisHz, spitze, 0)
        // Die letzte Anweisung mit Null beendet den Puffer. Kein Ton dauert länger als sein Klang.
        return daten
    }
    function fuegeKlangHinzu(welle: number, vonHz: number,
        bisHz: number, spitze: number, anstiegMs: number, dauerMs: number) {
        klaenge.push(baueHuellkurve(welle, vonHz, bisHz, spitze, anstiegMs, dauerMs))
        laengenMs.push(dauerMs)
    }
    // Eine kurze Tonfolge auf einem Kanal: Dreiergruppen aus Starttonhöhe, Endtonhöhe und Länge, je Note eine Spitze.
    // Eine Starttonhöhe 0 ist eine Pause. Jede Note steigt von null an und fällt wieder auf null.
    function fuegeMelodieHinzu(welle: number, noten: number[], spitzen: number[], anstiegMs: number) {
        let anzahl = noten.length / 3
        let daten = control.createBuffer((anzahl * 2 + 1) * 12)
        let gesamtMs = 0
        for (let i = 0; i < anzahl; i++) {
            let vonHz = noten[i * 3], bisHz = noten[i * 3 + 1], dauerMs = noten[i * 3 + 2], versatz = i * 24
            gesamtMs += dauerMs
            if (vonHz == 0) {
                schreibeSegment(daten, versatz, welle, dauerMs - 1, 1, 1, 0, 0)
                schreibeSegment(daten, versatz + 12, welle, 1, 1, 1, 0, 0)
                continue
            }
            let mitte = Math.round(vonHz + (bisHz - vonHz) * anstiegMs / dauerMs)
            schreibeSegment(daten, versatz, welle, anstiegMs, vonHz, mitte, 0, spitzen[i])
            schreibeSegment(daten, versatz + 12, welle, dauerMs - anstiegMs, mitte, bisHz, spitzen[i], 0)
        }
        klaenge.push(daten)
        laengenMs.push(gesamtMs)
    }
    function fuegeTonfolgeHinzu(welle: number, noten: number[], spitze: number, anstiegMs: number) {
        let spitzen: number[] = []
        for (let i = 0; i < noten.length / 3; i++) spitzen.push(spitze)
        fuegeMelodieHinzu(welle, noten, spitzen, anstiegMs)
    }
    // Der Studioakkord ist D-Dur, dreimal gespielt, jedes Mal eine Lage höher (D Fis A, Fis A D, A D Fis):
    // Jeder Puffer ist eine Stimme, die durch die drei Lagen steigt; drei Stimmen klingen zusammen.
    function baueStudioAkkord(ton1: number,ton2: number,ton3: number,spitze: number): Buffer {
        let daten=control.createBuffer(84)
        schreibeSegment(daten,0,3,120,ton1,ton1,0,spitze)
        schreibeSegment(daten,12,3,530,ton1,ton1,spitze,0)
        schreibeSegment(daten,24,3,120,ton2,ton2,0,spitze)
        schreibeSegment(daten,36,3,530,ton2,ton2,spitze,0)
        schreibeSegment(daten,48,3,220,ton3,ton3,0,spitze)
        schreibeSegment(daten,60,3,1580,ton3,ton3,spitze,0)
        return daten
    }
    // Jedes Ereignis bringt seine eigene Dauer mit: gehaltene Melodienoten über leichten, sich wiederholenden
    // Begleitnoten. Eine kleine, langsame Veränderung der Tonhöhe hält lange Töne lebendig.
    // einblendMs verlängert den Anstieg der ersten Note (die Musik beginnt nach Stille).
    function baueStimme(noten: number[], achtel: number[], welle: number,
        pegel: number, gezupft: boolean, einblendMs: number): Buffer {
        let daten=control.createBuffer((noten.length*4+1)*12)
        let achtelSumme=0
        for(let i=0;i<noten.length;i++) {
            // Die Grenzen werden aus der Summe gerundet, nicht Note für Note: So gerät das Tempo nicht aus dem Takt.
            let ende=Math.round((achtelSumme+achtel[i])*achtelMs)
            let hz=Math.max(1,noten[i]), dauerMs=ende-Math.round(achtelSumme*achtelMs), versatz=i*48
            achtelSumme+=achtel[i]
            let spitze=noten[i]==0 ? 0 : Math.floor(pegel*(i%3==0 ? 1 : 0.84))
            let anstiegMs=gezupft ? 12 : 32
            let ausklingMs=gezupft ? 62 : Math.min(120,Math.floor(dauerMs/3))
            let pauseMs=gezupft ? 28 : 24
            if(i==0 && einblendMs>anstiegMs) anstiegMs=Math.min(einblendMs,dauerMs-ausklingMs-pauseMs-1)
            let haltenMs=dauerMs-anstiegMs-ausklingMs-pauseMs
            schreibeSegment(daten,versatz,welle,anstiegMs,hz,hz,0,spitze)
            schreibeSegment(daten,versatz+12,welle,haltenMs,hz,hz+1,spitze,Math.floor(spitze*0.72))
            schreibeSegment(daten,versatz+24,welle,ausklingMs,hz+1,hz,Math.floor(spitze*0.72),0)
            schreibeSegment(daten,versatz+36,welle,pauseMs,hz,hz,0,0)
        }
        return daten
    }
    function baueSchlagzeug(abschnitt: number, achtelAnzahl: number): Buffer {
        let daten=control.createBuffer((achtelAnzahl*3+1)*12)
        for(let i=0;i<achtelAnzahl;i++) {
            // Leichte Bassdrum, leise Snare und leise Ticks; kein Wirbel vor den Schnitten.
            // Abschnitt 5 hat nur Ticks.
            let nurTicks=abschnitt==5
            // In Abschnitt 0 fehlt in den ersten vier Achteln die Bassdrum: Die Musik blendet ein.
            let bassdrum=!nurTicks && !(abschnitt==0 && i<4) && (i%8==0 || i%8==3 || i%8==6)
            let kleineTrommel=!nurTicks && (i%8==2 || i%8==7)
            let pegel=bassdrum ? 378 : kleineTrommel ? 189 : nurTicks ? 45 : 59
            if(abschnitt==0) pegel=Math.floor(pegel*(i%2!=0 ? 0.4 : 0.6))
            if(abschnitt==4) pegel=Math.floor(pegel*0.75)
            if(abschnitt==7 || abschnitt==8) pegel=Math.floor(pegel*0.65)
            let welle=bassdrum ? 3 : 18, hz=bassdrum ? 160 : kleineTrommel ? 900 : 1800
            let endeHz=bassdrum ? 48 : 200, versatz=i*36
            schreibeSegment(daten,versatz,welle,8,hz,hz,0,pegel)
            let abklingMs=bassdrum ? 118 : kleineTrommel ? 88 : 42
            let dauerMs=Math.round((i+1)*achtelMs)-Math.round(i*achtelMs)
            schreibeSegment(daten,versatz+12,welle,abklingMs,hz,endeHz,pegel,0)
            schreibeSegment(daten,versatz+24,welle,dauerMs-8-abklingMs,endeHz,endeHz,0,0)
        }
        return daten
    }
    // Baut die fünf Stimmen EINES Abschnitts in musik (etwa 5 KB). Die ganze Musik auf einmal brauchte etwa 55 KB,
    // mehr als der Calliope mini 3 neben dem Bildschirm und dem Bergwerk frei hat (dann blieb der Bildschirm schwarz).
    function komponiere(abschnitt: number) {
        musik=[]
        fertigerAbschnitt=abschnitt
        // Töne aus D-Dur. Grundtöne der Akkorde je Abschnitt: D D G A D H G A D A D.
        const grundtoene=[147,147,196,220,147,247,196,220,147,220,147]
        const terzen=[185,185,247,277,185,294,247,277,185,277,185]
        const quinten=[220,220,294,330,220,370,294,330,220,330,220]
        if(abschnitt>=0 && abschnitt<musikZeitenMs.length) {
            let grundton=grundtoene[abschnitt], terz=terzen[abschnitt], quinte=quinten[abschnitt]
            let achtelAnzahl=Math.round(musikLaengenMs[abschnitt]/achtelMs)
            let bass: number[]=[], bassLaengen: number[]=[], arpeggio: number[]=[], ticks: number[]=[]
            for(let i=0;i<achtelAnzahl;i++) {
                // Arpeggio aus Grundton, Terz und Quinte (für D ist das Brummis Motiv).
                arpeggio.push(abschnitt==0 && i%2!=0 ? 0 : [grundton*2,terz*2,quinte*2,terz*2][i%4])
                ticks.push(1)
            }
            // Ein hüpfender Bass auf Grundton und Quinte hält den Puls leicht.
            for(let i=0;i<achtelAnzahl/6;i++) {
                bass.push(grundton); bass.push(grundton); bass.push(quinte); bass.push(grundton)
                bassLaengen.push(2); bassLaengen.push(1); bassLaengen.push(1); bassLaengen.push(2)
            }
            // Kleine Bögen auf und ab; Abschnitt 5 ist Brummis Motiv D, Fis, A, Fis.
            let melodie=[294,370,440,370,494,440,370,330]
            let laengen=[3,1,2,3,1,2,3,3]
            if(abschnitt==0) { melodie=[294,0,370,0,440,0]; laengen=[3,3,3,3,3,3] }
            if(abschnitt==2) melodie=[494,587,494,440,370,440,494,440]
            if(abschnitt==3) melodie=[440,494,440,330,370,330,440,494]
            if(abschnitt==4) { melodie=[370,330,294,0,330,294]; laengen=[3,3,3,3,3,3] }
            if(abschnitt==5) { melodie=[294,370,440,370,294,370,440,370]; laengen=[2,2,2,3,2,2,2,3] }
            if(abschnitt==6) melodie=[494,587,659,587,494,440,494,587]
            if(abschnitt==7) melodie=[440,494,659,494,440,370,330,440]
            if(abschnitt==8) melodie=[587,494,440,370,440,494,587,440]
            if(abschnitt==9) melodie=[659,587,494,440,494,587,659,740]
            if(abschnitt==10) { melodie=[370,440,587]; laengen=[2,2,14] }
            if(abschnitt!=10) {
                let anzahl=melodie.length
                for(let i=0;i<anzahl;i++) { melodie.push(melodie[i]); laengen.push(laengen[i]) }
            }
            let studioTeil=abschnitt==7 || abschnitt==8, erster=abschnitt==0,
                brummiTeil=abschnitt==5, einblendMs=erster ? 400 : 0
            musik.push(baueStimme(bass,bassLaengen,3,
                erster ? 200 : studioTeil ? 290 : 380,true,einblendMs))
            musik.push(baueStimme([terz,quinte,terz],
                [achtelAnzahl/3,achtelAnzahl/3,achtelAnzahl/3],1,
                brummiTeil ? 0 : erster ? 200 : studioTeil ? 180 : 260,false,einblendMs))
            musik.push(baueStimme(melodie,laengen,1,
                erster ? 240 : studioTeil ? 300 : abschnitt>=9 ? 400 : 360,false,einblendMs))
            musik.push(baueStimme(arpeggio,ticks,1,
                brummiTeil ? 0 : erster ? 110 : studioTeil ? 140 : 210,true,einblendMs))
            musik.push(baueSchlagzeug(abschnitt,achtelAnzahl))
        }
    }
    // Eine Tonfolge aus gleichen Sinustönen (0 = Pause): Brummis Summen (sein Motiv D, Fis, A, Fis) und die Tropfen der
    // Grubenluft. Pausen sind ausdrückliche Anweisungen mit Lautstärke null; keine Uhren und keine wartenden Noten
    // überleben ein Überspringen.
    function baueMotiv(noten: number[], dauerMs: number, pegel: number): Buffer {
        let daten = control.createBuffer((noten.length * 3 + 1) * 12)
        let notenMs = Math.floor(dauerMs / noten.length)
        for (let i = 0; i < noten.length; i++) {
            let versatz = i * 36, note = noten[i]
            let spitze = note == 0 ? 0 : pegel
            schreibeSegment(daten, versatz, 3, 110, Math.max(1,note), Math.max(1,note), 0, spitze)
            schreibeSegment(daten, versatz + 12, 3, notenMs - 210,
                Math.max(1,note), Math.max(1,note), spitze, 0)
            schreibeSegment(daten, versatz + 24, 3, 100, 1, 1, 0, 0)
        }
        return daten
    }
    function spieleAtmosphaere(jetztMs: number) {
        // Das Training behält seine klaren, einzelnen Aktionsklänge. Im Aufzugraum bleibt es still.
        if (Nacht.zustand != Nacht.Zustand.Spiel || Nacht.raum == 0 || Nacht.versteckt >= 0) return
        if (jetztMs < besetztBisMs && vorrang >= 2) return
        if (jetztMs >= naechsteAtmosphaereMs) {
            let raumart = Nacht.raeume[Nacht.raum].art
            let nr = (raumart + atmosphaerenNr++) % atmosphaeren.length
            music.playInstructions(0, atmosphaeren[nr])
            naechsteAtmosphaereMs = jetztMs + 7200 + (raumart % 3) * 900
        }
        // Brummi summt sein Motiv, wenn er nah ist; schneller, solange er der Figur hinterherfährt.
        if (Nacht.piepAbstand <= 12 && Nacht.brummi.verhalten != Nacht.Verhalten.Ladestation
            && jetztMs >= naechstesSummenMs) {
            let eifrig = Nacht.brummi.verhalten == Nacht.Verhalten.Hinterher
            music.playInstructions(0, summen[eifrig ? 1 : 0])
            naechstesSummenMs = jetztMs + (eifrig ? 2100 : 4200)
        }
    }
    export function richteEin() {
        klaenge = []; laengenMs = []
        fuegeKlangHinzu(18, 90, 60, 0, 8, 24)      // 0: unbenutzt
        fuegeKlangHinzu(18, 700, 240, 260, 15, 100) // 1: leiser Schalter
        fuegeTonfolgeHinzu(1, [988,988,60, 1319,1319,90], 240, 8) // 2: Aufsammeln, helles Pling
        fuegeKlangHinzu(18, 600, 160, 280, 20, 190) // 3: Riegel / Arbeit am Generator
        fuegeTonfolgeHinzu(3, [1400,1900,180, 1700,1700,120], 300, 20) // 4: Pfiff, zwei Töne, ohne Rauschen
        // 5: Brummi fährt der Figur hinterher (drei steigende Töne)
        fuegeTonfolgeHinzu(1, [587,587,80, 740,740,80, 880,880,140], 260, 10)
        // 6: Ende der Schicht, leise und fallend
        fuegeTonfolgeHinzu(1, [392,392,240, 330,330,240, 262,262,420], 300, 50)
        fuegeTonfolgeHinzu(1, [880,880,70, 0,0,60, 1175,1175,90], 220, 8) // 7: Brummi wacht auf (piep piep)
        // 8: ein Pfiff, der Brummi erreicht: dieselben zwei Töne wie bei 4, dann sein Triller
        // (Nacht.pfeife schickt 8 statt 4 im selben Bild, damit der Pfiff hörbar bleibt).
        fuegeMelodieHinzu(3, [1400,1900,180, 1700,1700,120, 0,0,80,
            1175,1175,50, 1319,1319,50, 1175,1175,50, 1319,1319,50, 1175,1175,50, 1480,1480,90],
            [300,300,0,200,200,200,200,200,200], 20)
        // 9: Schicht geschafft, steigendes D-Dur
        fuegeTonfolgeHinzu(1, [587,587,130, 740,740,130, 880,880,130, 1175,1175,700], 300, 15)
        // 10: frei (wird nie gesendet; die Nummer bleibt, damit die anderen ihre behalten)
        klaenge.push(klaenge[0]); laengenMs.push(0)
        fuegeKlangHinzu(18, 360, 100, 150, 12, 100) // 11: gedämpfter Schritt
        fuegeKlangHinzu(18, 800, 180, 340, 20, 220) // 12: Sicherung rastet ein
        fuegeKlangHinzu(1, 880, 1175, 170, 10, 90) // 13: Piepton (Brummi ist nah)
        fuegeTonfolgeHinzu(3, [1320,880,70, 0,0,120, 990,660,70], 110, 6) // 14: Wassertropfen
        fuegeKlangHinzu(18, 320, 180, 110, 350, 1500) // 15: Wind draußen
        fuegeKlangHinzu(18, 240, 120, 160, 250, 1400) // 16: Förderkorb bewegt sich
        fuegeKlangHinzu(18, 440, 110, 200, 20, 260) // 17: verstreute Funken
        fuegeKlangHinzu(1, 294, 440, 260, 500, 1600) // 18: Titel schwillt an, dann Stille
        fuegeKlangHinzu(1, 523, 262, 200, 80, 650) // 19: leises Ausschalten im Intro
        fuegeKlangHinzu(18, 300, 120, 95, 12, 90)  // 20: Gehen, leiser als Rennen
        fuegeTonfolgeHinzu(1, [659,659,90, 880,880,130], 240, 10) // 21: Training bereit
        fuegeKlangHinzu(3, 523, 1047, 300, 140, 520) // 22: Monitor schaltet sich leise ein
        fuegeKlangHinzu(1, 294, 587, 240, 600, 1050) // 23: Studio schwillt an
        klaenge.push(baueStudioAkkord(294,370,440,480));laengenMs.push(3100) // 24: Studioakkord
        fuegeTonfolgeHinzu(1, [880,880,80, 1175,1175,80, 880,880,160], 260, 10) // 25: Brummi nimmt eine Sicherung
        fuegeTonfolgeHinzu(1, [784,659,140], 160, 10) // 26: Brummi findet nichts
        fuegeTonfolgeHinzu(1, [784,784,90, 0,0,70, 784,784,110], 220, 10) // 27: Lampe wird schwach (Doppelton)
        fuegeTonfolgeHinzu(1, [1175,1175,80, 880,880,140], 200, 10) // 28: Brummi legt die Sicherung zurück
        fuegeTonfolgeHinzu(3, [1760,1760,450, 2637,2637,650], 220, 5) // 29: kleine Glocke (Intro)
        // 30: steigende Pieptöne (Intro)
        fuegeTonfolgeHinzu(1, [880,880,80, 0,0,60, 1175,1175,80, 0,0,60, 1480,1480,140], 200, 8)
        akkordTief=baueStudioAkkord(370,440,587,400)
        akkordHoch=baueStudioAkkord(440,587,740,340)
        besetztBisMs = 0; vorrang = 0; vorherZustand = -1; vorherAlterMs = -1
        introKlangNr = 0; musikNr = 0; verstummt = false; musik=[]; fertigerAbschnitt=-1
        naechsteAtmosphaereMs=0; naechstesSummenMs=0; atmosphaerenNr=0
        // Leises Summen, hohe Tropfen, sanfte Luft, ein zweites Tropfenmuster; nichts unter 100 Hertz.
        atmosphaeren = [baueHuellkurve(3,220,220,80,900,2600),
            baueMotiv([1175,0,880,0],2400,100),
            baueHuellkurve(18,420,260,90,1000,3000),
            baueMotiv([988,0,0,740],2800,90)]
        summen = [baueMotiv([587,740,880,740],1600,120),
            baueMotiv([587,740,880,740],1200,150)]
        trittWasser=baueHuellkurve(18,820,170,130,18,160)
        trittMetall=baueHuellkurve(18,1200,220,155,12,130)
        trittWasserRennen=baueHuellkurve(18,980,140,190,18,190)
        trittMetallRennen=baueHuellkurve(18,1400,180,220,12,160)
        // Die Musik entsteht Abschnitt für Abschnitt, während das Intro läuft.
    }

    function stoppe() {
        music.stopAllSounds()
        besetztBisMs = 0; vorrang = 0
    }
    function spiele(nr: number, neuerVorrang: number, jetztMs: number) {
        if (nr <= 0 || nr >= klaenge.length) return
        // Klänge im Vordergrund unterbrechen schwächere sofort; sie werden nie in eine Schlange gestellt.
        if (jetztMs < besetztBisMs && neuerVorrang <= vorrang) return
        if (jetztMs < besetztBisMs) stoppe()
        let puffer=klaenge[nr]
        if ((nr==11 || nr==20) && Nacht.raeume.length>0) {
            let boden=Nacht.kachel(Nacht.raum,Math.floor(Nacht.figurX/8),Math.floor(Nacht.figurY/8))
            if(boden==3) puffer=nr==11 ? trittWasserRennen : trittWasser
            if(boden==2) puffer=nr==11 ? trittMetallRennen : trittMetall
        }
        music.playInstructions(0, puffer)
        if(nr==24) {
            music.playInstructions(0,akkordTief)
            music.playInstructions(0,akkordHoch)
        }
        besetztBisMs = jetztMs + ((nr==11 || nr==20) ? 190 : laengenMs[nr]); vorrang = neuerVorrang
    }
    export function aktualisiere(jetztMs: number) {
        let letztesAlterMs = vorherAlterMs
        let zustandGeaendert = vorherZustand != Nacht.zustand || Nacht.alterMs < letztesAlterMs
        vorherZustand = Nacht.zustand; vorherAlterMs = Nacht.alterMs
        if (zustandGeaendert) {
            stoppe()
            introKlangNr = 0
            musikNr = 0
            musik = []; fertigerAbschnitt = -1
            naechsteAtmosphaereMs=jetztMs+1200
            naechstesSummenMs=jetztMs+600
        }
        // Ein Überspringen im Intro (zur Karte) schneidet die laufende Musik einmal ab; die Karte spielt dann
        // ihre eigenen Klänge.
        else if (Nacht.zustand == Nacht.Zustand.Intro && Nacht.alterMs - letztesAlterMs > 1000) stoppe()
        if (Nacht.stumm || Nacht.zustand == Nacht.Zustand.Pause) {
            if (!verstummt) stoppe()
            verstummt = true; Nacht.klangNr = 0
            return
        }
        if (verstummt) { verstummt = false; Nacht.klangNr = 0 }
        if (Nacht.zustand == Nacht.Zustand.Intro) {
            Nacht.klangNr = 0
            while(musikNr<musikZeitenMs.length && Nacht.alterMs>=musikZeitenMs[musikNr]) {
                let nr=musikNr++
                if(Nacht.alterMs-musikZeitenMs[nr]<150) {
                    if(fertigerAbschnitt!=nr) komponiere(nr)
                    // Der Mischer hält jeden Puffer fest, solange er spielt; musik darf schon zum
                    // nächsten Abschnitt weitergehen.
                    for(let stimme=0;stimme<5;stimme++) music.playInstructions(0,musik[stimme])
                    musik=[]; fertigerAbschnitt=-1
                }
            }
            // Den nächsten Abschnitt gleich nach dem vorigen Einsatz bauen, Sekunden vor seiner Zeit; sein Einsatz
            // startet dann nur den Ton.
            if(musikNr<musikZeitenMs.length && fertigerAbschnitt!=musikNr) komponiere(musikNr)
            // Springt die Zeit, werden alte Klänge verworfen, statt sie alle auf einmal nachzuspielen.
            while (introKlangNr < klangZeitenMs.length
                && Nacht.alterMs >= Nacht.introEchtZeitMs(klangZeitenMs[introKlangNr])) {
                let nr = introKlangNr++
                if (Nacht.alterMs - Nacht.introEchtZeitMs(klangZeitenMs[nr]) < 150)
                    spiele(klangNummern[nr], 1, jetztMs)
            }
            return
        }
        if (Nacht.klangNr > 0) {
            let nr = Nacht.klangNr, neuerVorrang = Nacht.klangVorrang
            Nacht.klangNr = 0
            spiele(nr, neuerVorrang, jetztMs)
        }
        spieleAtmosphaere(jetztMs)
    }
}
