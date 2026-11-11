// Zeichnet alle Bilder des Spiels als Pixelgrafik in der Größe des Bildschirms (160 x 120). Beim Zeichnen wird nie ein
// neues Bild angelegt: Die beiden Vollbilder (maske, hintergrund) entstehen nur einmal beim Start.
namespace Nacht {
    // Die Schrift font8 kennt Umlaute und Akzente. Jedes Zeichen ist sechs Pixel breit.
    let kleineSchrift = image.font8
    let maske = image.create(160,120)
    let maskeZeitMs = -999
    let maskeX = -100
    let maskeY = -100
    let maskeRaum = -1
    let maskeRichtung = 99
    let maskeLicht = false
    let maskeVersteckt = -2
    let hintergrund = image.create(160,120)
    let hintergrundRaum = -1
    let hintergrundGrubeNr = -1
    // Der Name des Spiels wird mit den 5 x 7 großen Buchstaben aus kino.ts gezeichnet (Kino.zeichneBuchstabe) und immer
    // mittig gesetzt. Er passt bis 12 Buchstaben in den Rahmen; die Schrift kennt alle Zeichen aus buchstaben.
    export const SPIELNAME = "STOLLENLICHT"
    function zeichneSchriftzug(y: number, sichtbar: number) {
        let anzahl=SPIELNAME.length,x0=Math.floor((160-(anzahl*12-2))/2)
        for(let i=0;i<Math.min(anzahl,sichtbar);i++) {
            Kino.zeichneBuchstabe(SPIELNAME.charAt(i),x0+1+i*12,y+2,2,6)
            Kino.zeichneBuchstabe(SPIELNAME.charAt(i),x0+i*12,y,2,1)
            if(SPIELNAME.charAt(i)!=" ")screen.setPixel(x0+2+i*12,y+3,12)
        }
        screen.drawLine(x0+6,y+19,x0+anzahl*12-9,y+19,10)
        screen.fillRect(69,y+18,22,3,5)
    }
    function schreibe(text: string,x: number,y: number,farbe: number) {
        screen.print(text,x,y,farbe,kleineSchrift)
    }
    function schreibeMittig(text: string,y: number,farbe: number) {
        schreibe(text,Math.floor((160-text.length*6)/2),y,farbe)
    }
    // Kleine Bilder statt Buchstaben, höchstens 7 Pixel hoch: Sicherung 7 x 5, Tasche 7 x 7, Pfeife 8 x 6, Tür 5 x 7
    // und Generatorfassung 9 x 7. Eine Sicherung, wie sie in der Grube liegt: braune Kappen, gelber
    // Körper, weiße Mitte.
    function zeichneSicherungSymbol(x: number,y: number) {
        screen.fillRect(x,y+1,7,5,13);screen.fillRect(x+1,y+2,5,3,5);screen.drawLine(x+3,y+1,x+3,y+5,1)
    }
    // Eine Sicherung im Generator (eingesetzt): graue Fassung, dunkler Schlitz, gelbe Sicherung, türkises Licht.
    function zeichneEingesetztSymbol(x: number,y: number) {
        screen.fillRect(x,y,9,7,10);screen.fillRect(x+1,y+1,7,5,14)
        screen.fillRect(x+2,y+2,5,3,5);screen.setPixel(x+4,y+3,1);screen.setPixel(x+7,y+1,9)
    }
    // Die Tasche (getragene Sicherungen): Griff und ein heller Beutel mit Klappe.
    function zeichneTaschenSymbol(x: number,y: number) {
        screen.drawLine(x+2,y,x+4,y,12);screen.setPixel(x+1,y+1,12);screen.setPixel(x+5,y+1,12)
        screen.fillRect(x,y+2,7,5,12);screen.drawLine(x+1,y+3,x+5,y+3,13)
    }
    // Die Pfeife (Zeit, bis man wieder pfeifen kann): Mundstück und runder Körper mit Loch.
    function zeichnePfeifenSymbol(x: number,y: number) {
        screen.fillRect(x,y+2,3,2,12);screen.fillCircle(x+5,y+3,2,12)
        screen.setPixel(x+5,y+3,15);screen.setPixel(x+7,y,10)
    }
    // Eine Tür (der Weg hinaus am Aufzug): Rahmen und Klinke.
    function zeichneTuerSymbol(x: number,y: number,farbe: number) {
        screen.drawRect(x,y,5,7,farbe);screen.setPixel(x+3,y+4,farbe)
    }
    function zeichneBalken(hoehe: number) {
        screen.fillRect(0,0,160,hoehe,15)
        screen.fillRect(0,120-hoehe,160,hoehe,15)
    }
    function zeichneRegen(zeitMs: number,anzahl: number) {
        for(let i=0;i<anzahl;i++) {
            let x=(i*29+Math.floor(zeitMs/60))%178-9,y=(i*47+Math.floor(zeitMs/(i%3+5)))%130-8
            screen.drawLine(x,y,x-3,y+7,i%4==0?10:8)
        }
    }
    function zeichneSkyline(zeitMs: number) {
        screen.fill(11)
        screen.fillCircle(123,30,14,8);screen.fillCircle(127,26,14,11)
        for(let i=0;i<8;i++) {
            let x=i*24-12,hoehe=12+(i*19)%24
            screen.fillRect(x,78-hoehe,23,hoehe,8)
            screen.fillRect(x+4,70-hoehe,5,8,8)
        }
        // Ferne beleuchtete Fenster und gestufte Fabrikdächer.
        for(let i=0;i<19;i++) {
            let x=(i*23+7)%158,y=57+(i*11)%18
            screen.fillRect(x,y,2,2,i%5==0?13:11)
        }
        screen.fillRect(0,78,160,42,15)
        // Förderturm, Seilscheibe, Stahlstreben und das Windenhaus.
        screen.drawLine(37,82,52,22,10);screen.drawLine(39,82,54,22,8)
        screen.drawLine(86,82,69,22,10);screen.drawLine(84,82,67,22,8)
        screen.fillRect(48,19,25,5,14);screen.drawCircle(60,18,7,10)
        screen.drawLine(49,32,75,49,8);screen.drawLine(73,32,45,49,8)
        screen.drawLine(45,49,80,67,8);screen.drawLine(76,49,40,67,8)
        screen.drawLine(60,19,60,88,10);screen.drawLine(64,19,64,88,8)
        screen.fillRect(99,67,47,16,14);screen.fillRect(112,59,21,9,14)
        for(let i=0;i<4;i++)screen.fillRect(104+i*10,71,4,4,Math.floor(zeitMs/500)%11==0?13:5)
        screen.fillRect(42,82,45,4,13)
        screen.drawLine(0,84,159,84,8)
        screen.drawLine(28,118,51,86,8);screen.drawLine(94,118,74,86,8)
        screen.drawLine(32,118,54,86,14);screen.drawLine(90,118,71,86,14)
        for(let i=0;i<5;i++) {
            let y=90+i*i
            screen.drawLine(48-i*4,y,77+i*4,y,11)
        }
        screen.drawLine(151,43,151,82,10)
        screen.fillRect(147,42,9,2,5)
        screen.drawLine(151,45,136,81,11);screen.drawLine(151,45,159,73,11)
        // Nasse Straße, tiefer treibender Nebel und gespiegelte Wartungslichter.
        for(let i=0;i<14;i++) {
            let x=(i*31+Math.floor(zeitMs/130))%180-20,y=85+(i*7)%25
            screen.drawLine(x,y,x+10+i%9,y,i%4==0?10:11)
        }
        zeichneRegen(zeitMs,38)
    }
    function zeichneTitelEinzug(zeitMs: number) {
        screen.fill(15)
        if(!reduziert)for(let i=0;i<26;i++) {
            let phase=(zeitMs/12+i*17)%160
            let dx=(i*31%101)-50,dy=(i*43%71)-35
            let x=80+dx*phase/50,y=55+dy*phase/50
            screen.drawLine(x,y,x+dx*0.08,y+dy*0.08,zeitMs<1100?10:11)
        }
        // Der schwere Titel fällt Buchstabe für Buchstabe an seinen Platz (mit reduzierten Effekten ohne Fallen);
        // danach läuft darunter eine helle Linie von links nach rechts.
        let setzen=reduziert?0:Math.max(0,1-zeitMs/650)
        let y=43-Math.floor(setzen*setzen*24)
        zeichneSchriftzug(y,Math.floor(zeitMs/75))
        if(zeitMs>850) {
            screen.drawLine(15,68,144,68,8)
            let strich=Math.min(130,(zeitMs-850)/4)
            screen.drawLine(15,68,15+strich,68,13)
        }
        if(zeitMs>1000)schreibeMittig("FINDE 5 SICHERUNGEN!",79,5)
        if(zeitMs>1400)schreibeMittig("DEINE SCHICHT BEGINNT.",96,12)
        zeichneBalken(10)
    }
    function zeichneIntro() {
        let filmZeitMs=introFilmZeitMs(alterMs)
        if(filmZeitMs>=34500)zeichneTitelEinzug(filmZeitMs-34500)
        else Kino.zeichne(filmZeitMs,reduziert,kleineSchrift)
        // Fußzeile mit einem Farbsatz für jede Palette (Farbe 13 wäre in der Studiopalette schwarz auf schwarz).
        let studio=Kino.istStudioPaletteAktiv()
        schreibeMittig("A/B: ÜBERSPRINGEN",112,studio?11:10)
        screen.fillRect(0,119,Math.min(160,alterMs*160/introDauerMs),1,studio?11:13)
    }
    function zeichneTitel() {
        zeichneSkyline(alterMs+4000)
        // Ein Rahmen umfasst alle Zeilen, mit Platz für den Balken der Auswahl.
        screen.fillRect(4,19,152,91,15)
        screen.drawRect(4,19,152,91,10)
        screen.drawRect(6,21,148,87,8)
        for(let x=8;x<154;x+=144) {
            screen.setPixel(x,23,12);screen.setPixel(x,105,10)
        }
        zeichneSchriftzug(28,SPIELNAME.length)
        schreibeMittig("5 SICHERUNGEN, 1 ROBOTER",53,12)
        for(let i=0;i<4;i++) {
            let y=63+i*9
            if(menue==i) screen.fillRect(12,y-1,136,9,8)
            let beschriftung=i==0?"SCHICHT BEGINNEN":i==1?"TRAINING":
                i==2?(reduziert?"EFFEKTE: REDUZIERT":"EFFEKTE: KINO"):
                (stumm?"TON: AUS":"TON: AN")
            schreibe(beschriftung,28,y,menue==i?1:10)
            if(menue==i)schreibe(">",17,y,5)
        }
        screen.fillRect(0,112,160,8,15)
        schreibeMittig("RICHTUNG: WAHL  A: OK",112,10)

        schreibeMittig("UNTER TAGE / -480 M",10,12)
    }
    function zeichneTrainingWahl() {
        screen.fill(15)
        screen.drawLine(12,18,147,18,10)
        schreibeMittig("WARTUNGSPROTOKOLL / 09",9,5)
        schreibeMittig("BEVOR DU HINUNTERGEHST",30,1)
        schreibeMittig("Licht, Pfeife und Brummi.",46,12)
        schreibeMittig("Lerne im sicheren Raum.",56,12)
        screen.fillRect(15,73,130,13,8);schreibeMittig("A  TRAINING STARTEN",77,1)
        schreibeMittig("B  DIREKT IN DIE SCHICHT",96,5)
        schreibeMittig("Training ist freiwillig.",112,10)
    }
    // Monitor der Leitstelle im Aufzugraum: der Calliope Hacker von hinten an seinem Schreibtisch, Kapuze auf,
    // schwarzer Pulli mit hellem Rand, türkisfarbener Stuhl und Turnschuhe. Der Bildschirm leuchtet:
    // zeichneDunkelheit lässt dort ein Loch in der Maske, darum sieht man ihn von der ersten Sekunde jeder Schicht
    // und jedes Trainings.
    export const MONITOR_X = 9
    export const MONITOR_Y = 81
    function zeichneLeitstellenMonitor() {
        let x=MONITOR_X,y=MONITOR_Y
        hintergrund.fillRect(x,y,26,18,14);hintergrund.drawRect(x,y,26,18,10);hintergrund.fillRect(x+10,y+18,6,2,13)
        hintergrund.fillRect(x+2,y+2,22,14,10)
        // sein eigener Bildschirm auf dem Tisch, mit einem gelben Punkt: Brummi auf dem Plan der Grube
        hintergrund.fillRect(x+13,y+3,9,6,8);hintergrund.fillRect(x+14,y+4,7,4,9);hintergrund.setPixel(x+17,y+5,5)
        hintergrund.fillRect(x+2,y+10,22,2,13)
        // Kapuze und Pulli in Schwarz (15) mit hellem Rand (12)
        hintergrund.drawLine(x+7,y+3,x+8,y+3,15)
        hintergrund.fillRect(x+6,y+4,4,4,15);hintergrund.fillRect(x+5,y+8,7,6,15)
        hintergrund.setPixel(x+6,y+3,12);hintergrund.drawLine(x+5,y+4,x+5,y+7,12)
        hintergrund.drawLine(x+4,y+8,x+4,y+13,12)
        hintergrund.fillRect(x+11,y+9,3,2,15)
        // Stuhl und Turnschuhe in Türkis (9)
        hintergrund.drawLine(x+4,y+14,x+12,y+14,9);hintergrund.setPixel(x+5,y+15,9);hintergrund.setPixel(x+11,y+15,9)
    }
    // Zwischengespeicherter Hintergrund des Raums. Die Formen passen genau zu den Kacheln, gegen die die Figur stößt.
    function zeichneRaumHintergrund() {
        hintergrund.fill(15)
        let raumDaten=raeume[raum]
        for(let y=0;y<15;y++)for(let x=0;x<20;x++) {
            let kachelArt=raumDaten.kacheln.getUint8(y*20+x),pixelX=x*8,pixelY=y*8
            if(kachelArt==1) {
                hintergrund.fillRect(pixelX,pixelY,8,8,14)
                hintergrund.drawLine(pixelX,pixelY,pixelX+7,pixelY,10)
                hintergrund.drawLine(pixelX,pixelY,pixelX,pixelY+7,8)
                hintergrund.drawLine(pixelX+1,pixelY+6,pixelX+7,pixelY+6,11)
                hintergrund.setPixel(pixelX+2,pixelY+2,12)
                if(!istWand(raum,x,y+1)) {
                    hintergrund.fillRect(pixelX,pixelY+4,8,4,8)
                    hintergrund.drawLine(pixelX,pixelY+4,pixelX+7,pixelY+4,10)
                    hintergrund.drawLine(pixelX,pixelY+7,pixelX+7,pixelY+7,15)
                }
                if(!istWand(raum,x+1,y))hintergrund.drawLine(pixelX+7,pixelY,pixelX+7,pixelY+7,15)
            } else {
                hintergrund.fillRect(pixelX,pixelY,8,8,(x+y)%2==0?11:15)
                hintergrund.drawLine(pixelX,pixelY,pixelX+7,pixelY,8)
                hintergrund.setPixel(pixelX+1,pixelY+1,14)
                if((x*13+y*7+raum)%5==0) {
                    hintergrund.drawLine(pixelX+3,pixelY+5,pixelX+6,pixelY+5,14)
                    hintergrund.setPixel(pixelX+2,pixelY+6,8)
                }
                if(istWand(raum,x,y-1))hintergrund.fillRect(pixelX,pixelY,8,2,15)
                if(kachelArt==2) {
                    hintergrund.fillRect(pixelX+1,pixelY+3,6,3,15)
                    hintergrund.drawLine(pixelX+1,pixelY+2,pixelX+6,pixelY+5,13)
                    hintergrund.drawLine(pixelX+3,pixelY+6,pixelX+5,pixelY+1,4)
                    hintergrund.setPixel(pixelX+2,pixelY+2,12)
                }
                if(kachelArt==3) {
                    hintergrund.fillRect(pixelX,pixelY,8,8,8)
                    hintergrund.drawLine(pixelX+1,pixelY+2,pixelX+5,pixelY+2,10)
                    hintergrund.drawLine(pixelX+3,pixelY+5,pixelX+7,pixelY+5,9)
                    hintergrund.setPixel(pixelX+1,pixelY+6,7)
                }
            }
        }
        // Rohre an der Decke, Ringe darum und ein Schild mit der Nummer des Raums.
        hintergrund.fillRect(12,12,136,5,15)
        hintergrund.fillRect(12,12,136,3,10)
        hintergrund.drawLine(12,12,147,12,12)
        for(let x=16;x<146;x+=22) {
            hintergrund.fillRect(x,11,3,5,14);hintergrund.setPixel(x+1,12,13)
        }
        hintergrund.fillRect(118,18,27,10,15)
        hintergrund.drawRect(118,18,27,10,8)
        hintergrund.print((raum<10?"0":"")+raum,124,21,10,kleineSchrift)
        // Je nach Raumart gibt es andere Umrisse.
        if(raumDaten.art==Raumart.Generator || raumDaten.art==Raumart.Aufzug) {
            hintergrund.fillRect(57,37,40,31,8)
            hintergrund.drawRect(57,37,40,31,10)
            for(let x=58;x<97;x+=6) {
                hintergrund.drawLine(x,37,x+3,40,5)
                hintergrund.drawLine(x,64,x+3,67,4)
            }
            if(raumDaten.art==Raumart.Aufzug) {
                hintergrund.fillRect(61,42,32,21,15)
                for(let x=63;x<92;x+=5)hintergrund.drawLine(x,43,x,61,10)
                hintergrund.drawLine(77,42,77,62,12)
                hintergrund.fillRect(97,45,5,12,14);hintergrund.setPixel(99,48,9)
                zeichneLeitstellenMonitor()
            } else {
                hintergrund.drawLine(76,37,76,19,13)
                hintergrund.drawLine(78,37,78,19,4)
                hintergrund.fillRect(60,70,33,6,15)
                for(let x=62;x<91;x+=3)hintergrund.drawLine(x,71,x,74,10)
            }
        }
        if(raumDaten.art==Raumart.Werkstatt || raumDaten.art==Raumart.Lager) {
            hintergrund.fillRect(13,88,13,17,15)
            hintergrund.fillRect(12,86,13,16,13)
            hintergrund.drawRect(12,86,13,16,10)
            hintergrund.drawLine(14,88,22,99,14);hintergrund.drawLine(22,88,14,99,14)
            hintergrund.drawLine(12,86,24,86,12)
            hintergrund.fillRect(130,96,14,9,8)
            for(let x=132;x<143;x+=3)hintergrund.drawLine(x,97,x,103,10)
        }
        if(raumDaten.art==Raumart.Halle) {
            hintergrund.fillRect(88,18,7,26,15)
            hintergrund.drawLine(90,18,90,41,13);hintergrund.drawLine(92,18,92,41,10)
            hintergrund.drawCircle(93,43,4,13);hintergrund.fillRect(94,38,4,4,11)
            hintergrund.drawLine(12,94,147,94,8);hintergrund.drawLine(12,97,147,97,14)
        }
        if(raumDaten.art==Raumart.Ladestation) {
            // Ladestation: Sockel unter Brummis Parkplatz (116, 60), Ladesäule mit gelber Lampe,
            // Kabel zur Wand und ein Schild mit Brummis Kopf.
            hintergrund.fillRect(106,64,21,5,13);hintergrund.drawLine(106,64,126,64,12)
            hintergrund.drawLine(107,68,125,68,14)
            hintergrund.fillRect(130,44,6,25,10);hintergrund.drawLine(130,44,135,44,12)
            hintergrund.drawLine(135,45,135,68,14)
            hintergrund.fillRect(131,47,4,3,5);hintergrund.fillRect(131,53,4,8,14)
            hintergrund.setPixel(132,55,9);hintergrund.setPixel(132,58,9)
            hintergrund.drawLine(126,66,129,66,14)
            hintergrund.drawLine(136,50,151,50,14);hintergrund.drawLine(136,51,151,51,8)
            hintergrund.fillRect(96,36,15,12,14);hintergrund.drawRect(96,36,15,12,10)
            hintergrund.fillRect(100,40,7,5,12);hintergrund.setPixel(103,38,5);hintergrund.setPixel(103,39,10)
            hintergrund.setPixel(101,42,9);hintergrund.setPixel(105,42,9);hintergrund.drawLine(102,44,104,44,10)
        }
        for(let richtung=0;richtung<4;richtung++)if(raumDaten.tueren[richtung]>=0) {
            let x=richtung==0?150:richtung==2?6:73,y=richtung==1?108:richtung==3?6:57
            if(richtung%2==0) {
                hintergrund.fillRect(x,y-3,4,3,10);hintergrund.fillRect(x,y+15,4,3,10)
                hintergrund.drawLine(x+1,y,x+1,y+13,13)
            } else {
                hintergrund.fillRect(x-3,y,3,4,10);hintergrund.fillRect(x+15,y,3,4,10)
                hintergrund.drawLine(x,y+1,x+13,y+1,13)
            }
        }
    }
    function zeichneDing(ding: Ding) {
        let x=Math.floor(ding.x),y=Math.floor(ding.y)
        screen.fillRect(x-5,y+4,12,3,15)
        if(ding.art==Dingart.Sicherung) {
            screen.fillRect(x-4,y-3,9,7,13)
            screen.fillRect(x-3,y-2,7,5,5)
            screen.fillRect(x-1,y-3,3,7,1)
            screen.drawLine(x-1,y,x+1,y,9)
            screen.setPixel(x-4,y-3,12);screen.setPixel(x+4,y+3,4)
        } else if(ding.art==Dingart.Batterie) {
            screen.fillRect(x-4,y-4,8,9,8)
            screen.fillRect(x-3,y-4,6,8,7)
            screen.drawLine(x-3,y-4,x+2,y-4,1)
            screen.fillRect(x-1,y-6,2,2,12)
            screen.drawLine(x-1,y-1,x+1,y-1,1);screen.drawLine(x,y-2,x,y,1)
            screen.drawLine(x-3,y+3,x+2,y+3,10)
        } else if(ding.art==Dingart.Spind) {
            screen.fillRect(x-6,y-8,13,17,15)
            screen.fillRect(x-6,y-8,11,15,10)
            screen.drawLine(x-6,y-8,x+4,y-8,12)
            screen.fillRect(x+4,y-7,2,14,8)
            screen.drawRect(x-4,y-6,7,12,8)
            for(let zeile=0;zeile<3;zeile++)screen.drawLine(x-3,y-4+zeile*2,x+1,y-4+zeile*2,15)
            screen.setPixel(x+1,y+3,5);screen.setPixel(x+2,y+3,4)
            screen.fillRect(x-5,y+7,2,2,13);screen.fillRect(x+3,y+7,2,2,13)
        } else if(ding.art==Dingart.Generator) {
            screen.fillRect(x-9,y-8,19,17,15)
            screen.fillRect(x-9,y-8,17,14,10)
            screen.drawLine(x-8,y-8,x+7,y-8,12)
            screen.fillRect(x-7,y-6,14,10,8)
            screen.fillRect(x+8,y-6,2,13,14)
            for(let i=0;i<5;i++) {
                screen.fillRect(x-6+i*3,y-4,2,4,i<eingesetzt?9:13)
                if(i<eingesetzt)screen.setPixel(x-6+i*3,y-4,1)
            }
            screen.drawLine(x-5,y+3,x+4,y+3,eingesetzt==5?9:4)
            screen.fillRect(x-6,y+6,3,3,13);screen.fillRect(x+4,y+6,3,3,13)
            screen.setPixel(x-8,y-6,5);screen.setPixel(x-8,y+4,12)
        }
    }
    function zeichneFigur() {
        if(versteckt>=0)return
        zeichneFigurBild(Math.floor(figurX),Math.floor(figurY),
            blickX,blickY,lampe,Math.floor((figurX+figurY)/3)%2)
    }
    function zeichneFigurBild(x: number,y: number,blickX: number,
        blickY: number,lampe: boolean,beinPhase: number) {
        screen.fillRect(x-4,y+4,9,3,15)
        screen.fillRect(x-2,y+2,2,3+beinPhase,8);screen.fillRect(x+1,y+2,2,4-beinPhase,8)
        screen.setPixel(x-2,y+5+beinPhase,13);screen.setPixel(x+2,y+6-beinPhase,13)
        screen.fillRect(x-3,y-2,7,5,10)
        screen.drawLine(x-2,y,x+2,y,5)
        screen.fillRect(x-1,y-3,3,3,13)
        screen.fillRect(x-3,y-6,6,4,4)
        screen.fillRect(x-2,y-6,4,2,5)
        screen.drawLine(x-3,y-3,x+3,y-3,5)
        screen.setPixel(x-1,y-5,1)
        let handX=x+Math.round(blickX*4),handY=y+Math.round(blickY*4)
        screen.fillRect(handX-1,handY-1,3,3,13)
        screen.setPixel(handX+Math.round(blickX),
            handY+Math.round(blickY),lampe?1:12)
    }
    // Kleine Zeichen über Brummi, 3 x 5 Pixel, Zeile für Zeile: ? ! z und eine Note.
    const SYMBOLE = ["111001010000010", "010010010000010", "111001010100111", "011010010110110"]
    function zeichneSymbol(nummer: number,x: number,y: number) {
        let muster=SYMBOLE[nummer]
        for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(muster.charAt(j*3+i)=="1")screen.setPixel(x+i,y+j,5)
    }
    // Brummi, der Wartungsroboter: heller, runder Körper, Kuppelkopf mit zwei türkisen Lampenaugen,
    // Antenne mit gelbem Licht, zwei Ketten und zwei Greifer. Nie in den Farben 2, 3 oder 6.
    // x, y: Mitte des Körpers; das Bild reicht von x-7 bis x+7 (x+8 mit getragener Sicherung) und von y-10 bis y+5;
    // die Zeichen reichen von x-8 bis x+9 und bis y-19 (das zweite z an der Ladestation).
    // licht: Farbe des Antennenlichts (5 gelb, 1 beim Piepen, 13 schwach an der Ladestation).
    // arme: 0 unten, 1 rechter Greifer oben mit Sicherung, 2 beide oben (Tanzen, Winken).
    export function zeichneBrummi(x: number,y: number,verhalten: number,
        kette: number,licht: number,arme: number) {
        // Ketten
        screen.fillRect(x-5,y+3,4,3,14);screen.fillRect(x+2,y+3,4,3,14)
        screen.setPixel(x-5+kette,y+4,10);screen.setPixel(x-3+kette,y+4,10)
        screen.setPixel(x+2+kette,y+4,10);screen.setPixel(x+4+kette,y+4,10)
        // Körper mit runden Ecken, Schatten rechts und unten, ein kleines Feld mit zwei Knöpfen
        screen.fillRect(x-4,y-3,9,7,12);screen.fillRect(x-5,y-2,11,5,12)
        screen.drawLine(x+5,y-2,x+5,y+2,10);screen.drawLine(x-4,y+3,x+4,y+3,10)
        screen.fillRect(x-2,y-1,5,3,14);screen.setPixel(x-1,y,5);screen.setPixel(x+1,y,9)
        // Kuppelkopf, Antenne und Licht
        screen.fillRect(x-3,y-7,7,4,12);screen.fillRect(x-2,y-8,5,1,12);screen.drawLine(x+3,y-6,x+3,y-4,10)
        screen.fillRect(x-1,y-10,3,2,licht)
        // Augen: zwei türkise Lampen; sie schauen hin und her, wenn er sucht, und sind an der
        // Ladestation fast geschlossen
        let augenVersatz=verhalten==Verhalten.Umschauen?(Math.floor(vergangenMs/500)%2)*2-1:0
        if(verhalten==Verhalten.Ladestation) {
            screen.drawLine(x-2,y-5,x-1,y-5,10)
            screen.drawLine(x+1,y-5,x+2,y-5,10)
        }
        else {
            screen.fillRect(x-2+augenVersatz,y-6,2,2,9);screen.fillRect(x+1+augenVersatz,y-6,2,2,9)
            screen.setPixel(x-2+augenVersatz,y-6,1);screen.setPixel(x+1+augenVersatz,y-6,1)
        }
        screen.drawLine(x-1,y-4,x+1,y-4,10)
        // Greifer
        if(arme==0) {
            screen.drawLine(x-6,y-1,x-6,y+1,12);screen.setPixel(x-7,y+1,14)
            screen.drawLine(x+6,y-1,x+6,y+1,12);screen.setPixel(x+7,y+1,14)
        } else {
            screen.drawLine(x+6,y-2,x+6,y-5,12);screen.setPixel(x+5,y-6,14);screen.setPixel(x+7,y-6,14)
            if(arme==2) {
                screen.drawLine(x-6,y-2,x-6,y-5,12)
                screen.setPixel(x-7,y-6,14);screen.setPixel(x-5,y-6,14)
            }
            else {
                screen.drawLine(x-6,y-1,x-6,y+1,12);screen.setPixel(x-7,y+1,14)
                // die Sicherung, die er zurückbringt, über dem rechten Greifer
                screen.fillRect(x+4,y-10,5,4,13);screen.fillRect(x+5,y-9,3,2,5);screen.setPixel(x+6,y-10,1)
            }
        }
        // was er gerade tut: ? neugierig, ! will aufräumen, ... sucht, zwei Noten lauscht, z lädt
        if(verhalten==Verhalten.Neugierig)zeichneSymbol(0,x-1,y-16)
        else if(verhalten==Verhalten.Hinterher)zeichneSymbol(1,x-1,y-16)
        else if(verhalten==Verhalten.Umschauen) {
            screen.setPixel(x-3,y-13,5);screen.setPixel(x,y-13,5);screen.setPixel(x+3,y-13,5)
        }
        else if(verhalten==Verhalten.Lauschen) {
            let hoch=Math.floor(vergangenMs/250)%2
            zeichneSymbol(3,x-8,y-15+hoch)
            zeichneSymbol(3,x+5,y-14-hoch)
        }
        else if(verhalten==Verhalten.Ladestation) {
            zeichneSymbol(2,x+4,y-14)
            if(Math.floor(vergangenMs/1000)%2==0)zeichneSymbol(2,x+7,y-19)
        }
    }
    // Brummi in der Welt: wird nach zeichneDunkelheit gezeichnet, ist also nie verdeckt. Wo das Licht der Figur ihn
    // nicht erreicht, zeigt ihn ein weicher Schein (Kreis in Farbe 8, dunkles Blaugrau), auch hinter Wänden und
    // an der Ladestation.
    function zeichneBrummiInWelt() {
        if(brummi.raum!=raum)return
        let verhalten=brummi.verhalten,x=Math.floor(brummi.x),y=Math.floor(brummi.y)
        if(verhalten==Verhalten.Lauschen)x+=Math.floor(vergangenMs/250)%2
        if(!istSichtbar(brummi.x,brummi.y)) {
            screen.fillCircle(x,y-2,9,8)
            // die Figur vor dem Schein lassen, wenn beide nah beieinander sind
            if(Math.abs(figurX-brummi.x)<17 && Math.abs(figurY-brummi.y)<17)zeichneFigur()
        }
        let licht=verhalten==Verhalten.Ladestation?13:warnungMs>0 && zustand==Zustand.Spiel?1:5
        zeichneBrummi(x,y,verhalten,verhalten==Verhalten.Lauschen
            || verhalten==Verhalten.Ladestation?0:Math.floor((brummi.x+brummi.y)/3)%2,licht,
            verhalten==Verhalten.Zurueckbringen && brummi.sicherungNr>=0
                ?1:verhalten==Verhalten.Lauschen?2:0)
    }
    // Antenne in der Anzeige: zwei Bögen, gelb, solange Brummi piept.
    function zeichneAntenne(x: number,y: number,piept: boolean) {
        let farbe=piept?5:10
        screen.fillRect(x-1,y,3,2,piept?5:12);screen.drawLine(x,y+2,x,y+7,10);screen.drawLine(x-2,y+8,x+2,y+8,10)
        screen.setPixel(x-3,y,farbe);screen.drawLine(x-4,y+1,x-4,y+3,farbe)
        screen.setPixel(x-3,y+4,farbe)
        screen.setPixel(x+3,y,farbe);screen.drawLine(x+4,y+1,x+4,y+3,farbe)
        screen.setPixel(x+3,y+4,farbe)
        if(piept) {screen.drawLine(x-6,y,x-6,y+4,5);screen.drawLine(x+6,y,x+6,y+4,5)}
    }
    // Neugierbalken: wie lange Brummi die Figur schon sieht, während sie eine Sicherung trägt; voll nach 600
    // Millisekunden (Rahmen 10, gelbe Füllung).
    function zeichneNeugierbalken(x: number,y: number) {
        screen.drawRect(x,y,40,4,10);screen.fillRect(x+1,y+1,38*Math.min(1,brummi.gesehenMs/600),2,5)
    }
    // Ein Fächer aus kurzen Strahlen, die an Wänden enden, ergibt weiche Lichtkanten.
    // Die eingebauten Dreiecke sparen es, jeden Bildpunkt in TypeScript einzeln zu behandeln.
    function schneideLichtfaecher(radius: number, segmente: number, voll: boolean) {
        let letzterX=figurX,letzterY=figurY
        for(let i=0;i<=segmente;i++) {
            let winkel=voll?i*Math.PI*2/segmente:-Math.PI/6+i*Math.PI/3/segmente
            let kosinus=Math.cos(winkel),sinus=Math.sin(winkel)
            let dx=voll?kosinus:blickX*kosinus-blickY*sinus,
                dy=voll?sinus:blickY*kosinus+blickX*sinus
            let endeX=figurX,endeY=figurY
            for(let abstand=2;abstand<=radius;abstand+=2) {
                endeX=figurX+dx*abstand;endeY=figurY+dy*abstand
                if(istWand(raum,Math.floor(endeX/8),Math.floor(endeY/8)))break
            }
            if(i>0)maske.fillTriangle(figurX,figurY,letzterX,letzterY,endeX,endeY,0)
            letzterX=endeX;letzterY=endeY
        }
    }
    function zeichneDunkelheit() {
        let richtung=Math.round(blickX*10)+Math.round(blickY*10)*30
        let licht=lampe
        if(maskeRaum!=raum || maskeX!=figurX || maskeY!=figurY || maskeRichtung!=richtung
            || maskeLicht!=licht || maskeVersteckt!=versteckt) {
            if(vergangenMs-maskeZeitMs>=40 || maskeRaum!=raum
                || maskeLicht!=licht || maskeVersteckt!=versteckt) {
                maske.fill(15)
                for(let y=0;y<15;y++)for(let x=0;x<20;x++) {
                    let pixelX=x*8,pixelY=y*8
                    if(istWand(raum,x,y)) {
                        maske.fillRect(pixelX,pixelY,8,7,11)
                        if(!istWand(raum,x,y+1))maske.drawLine(pixelX,pixelY+4,pixelX+7,pixelY+4,8)
                    } else if((x+y)%2==0)maske.drawLine(pixelX,pixelY,pixelX+7,pixelY,11)
                    if(versteckt>=0 && istSichtbar(pixelX+4,pixelY+4))maske.fillRect(pixelX,pixelY,8,8,0)
                }
                // Der Monitor der Leitstelle im Aufzugraum leuchtet.
                if(raum==0)maske.fillRect(MONITOR_X,MONITOR_Y,26,20,0)
                if(versteckt<0) {
                    schneideLichtfaecher(12,16,true)
                    if(licht)schneideLichtfaecher(64,32,false)
                }
                maskeX=figurX;maskeY=figurY;maskeRichtung=richtung;maskeRaum=raum
                maskeLicht=licht;maskeVersteckt=versteckt;maskeZeitMs=vergangenMs
            }
        }
        screen.drawTransparentImage(maske,0,0)
    }
    function zeichnePfeil(x: number,y: number,richtung: number,farbe: number) {
        if(richtung==0 || richtung==2) {
            let vorzeichen=richtung==0?1:-1
            screen.drawLine(x-3*vorzeichen,y,x+3*vorzeichen,y,farbe)
            screen.drawLine(x,y-3,x+3*vorzeichen,y,farbe);screen.drawLine(x,y+3,x+3*vorzeichen,y,farbe)
        } else {
            let vorzeichen=richtung==1?1:-1
            screen.drawLine(x,y-3*vorzeichen,x,y+3*vorzeichen,farbe)
            screen.drawLine(x-3,y,x,y+3*vorzeichen,farbe);screen.drawLine(x+3,y,x,y+3*vorzeichen,farbe)
        }
    }
    function zeichneWegweiser() {
        let naechster=naechsterRaum(raum,eingesetzt>=5?0:4,true)
        for(let richtung=0;richtung<4;richtung++) {
            let nachbar=raeume[raum].tueren[richtung]
            if(nachbar<0)continue
            let x=richtung==0?151:richtung==2?8:79,y=richtung==1?102:richtung==3?18:63
            if(eingesetzt>=5 || raum==0 || raum==1 || raeume[nachbar].besucht) {
                zeichnePfeil(x,y,richtung,nachbar==naechster?5:10)
                if(nachbar==naechster && (eingesetzt>=5 || raum==0 || raum==1)) {
                    // Unter dem Pfeil, außer bei der Tür unten: Dort steht das Zeichen neben dem Pfeil,
                    // damit die Leiste am unteren Bildrand es nicht verdeckt.
                    let symbolX=richtung==1?x+5:x-2,symbolY=richtung==1?y-3:y+6
                    if(eingesetzt>=5)zeichneTuerSymbol(symbolX,symbolY,5)
                    else schreibe("G",symbolX,symbolY,5)
                }
            }
        }
    }
    function zeichneTrainingLeiste() {
        screen.fillRect(0,0,160,24,15)
        screen.drawLine(0,0,159,0,8)
        screen.fillRect(0,3,2,17,5)
        schreibeMittig(trainingTitel[schritt],3,5)
        // Die Lektionszeile hält zwei Pixel Abstand zum gelben Streifen (x 0 bis 1): Sie beginnt nie links von x 4,
        // darum steht eine Zeile mit 26 Buchstaben von x 4 bis x 159; kürzere Zeilen bleiben mittig.
        let lektion=trainingZeilen[schritt]
        schreibe(lektion,Math.max(4,Math.floor((160-lektion.length*6)/2)),13,1)
        screen.fillRect(0,23,160*(schritt+1)/trainingTitel.length,1,10)
        if(schritt==0) {
            screen.drawCircle(116,76,6,5);zeichnePfeil(116,64,1,5)
        }
        // Die Ziele im Training bleiben sichtbar, damit klar ist, wohin man soll.
        let ziel=schritt==3?0:schritt==4?1:schritt==5?2:-1
        if(ziel>=0) {zeichneDing(dinge[ziel]);zeichnePfeil(dinge[ziel].x,dinge[ziel].y+13,3,5)}
        // Schritte 4 bis 6: Die Zahlen der Anzeige (sie liegt unter der Trainingsleiste) mit ihren Bildern;
        // in Schritt 4 zeigt ein Pfeil auf die Zahl der Tasche, in Schritt 5 auf die Zahl des Generators.
        if(ziel>=0) {
            screen.fillRect(94,25,65,12,15);screen.drawRect(94,25,65,12,10)
            zeichneEingesetztSymbol(97,27);schreibe(eingesetzt+"/5",108,27,9)
            zeichneTaschenSymbol(129,27);schreibe(getragen+"/3",138,27,5)
            if(schritt==3)zeichnePfeil(147,42,3,5)
            if(schritt==4)zeichnePfeil(117,42,3,5)
        }
        // Schritt 7: Brummi piept, die Antenne (sonst in der Anzeige unter dieser Leiste) blinkt hier.
        if(schritt==6)zeichneAntenne(150,2,warnungMs>0)
        // Schritt 12: die Trainingsbatterie, im Dunkeln sichtbar, mit einem Pfeil von oben.
        if(schritt==11) {
            if(dinge.length>3 && !dinge[3].genommen) {
                zeichneDing(dinge[3]);zeichnePfeil(dinge[3].x,dinge[3].y-13,1,5)
            }
            // der Lampenbalken der Anzeige liegt unter der Trainingsleiste: darum hier darunter zeigen
            screen.fillRect(4,59,46,9,15);zeichneLampenbalken(6,61)
        }
        if(schritt==4) {
            let generator=dinge[1]
            let bereit=gewaehlt==1
            if(bereit)screen.drawRect(generator.x-10,generator.y-9,20,18,9)
            screen.fillRect(4,75,152,29,15)
            if(setztEin) {
                schreibeMittig("EINSETZEN  "+Math.min(3,Math.floor(einsetzMs/1000))+
                    " / 3 SEK.",77,9)
                screen.drawRect(29,87,102,6,10)
                screen.fillRect(30,88,Math.min(100,einsetzMs/30),4,9)
                schreibeMittig("A WEITER HALTEN",96,12)
            } else {
                schreibeMittig(bereit?(aGesperrt?"A LOSLASSEN, NEU HALTEN":"BEREIT: A HALTEN"):
                    "NÄHER AN DEN GENERATOR",80,bereit?9:5)
                schreibeMittig("RICHTUNGSTASTEN LOSLASSEN",94,12)
            }
        }
        if(schritt==2) {screen.drawRect(29,98,102,4,10);screen.fillRect(30,99,Math.min(100,fortschritt/20),2,5)}
        if(schritt==5 && versteckt>=0) {
            screen.fillRect(0,89,160,11,15);schreibeMittig("GUT. A: WIEDER HERAUS.",91,5)
        }
        if(schritt>=6 && schritt<=11) {
            // Die Regel steht über der Vorführung, ohne sie zu verdecken.
            screen.fillRect(3,27,154,31,15)
            if(schritt==6) {
                schreibeMittig("ER HOLT, WAS DU TRÄGST,",29,5)
                schreibeMittig("UND BRINGT ES ZURÜCK.",39,5)
                schreibeMittig("PIEPEN: ER IST NAH. A: LOS",49,12)
            } else if(schritt==7) {
                schreibeMittig("LICHT LOCKT BRUMMI AN.",29,5)
                schreibeMittig("IM DUNKELN MERKT ER WENIG.",39,12)
                schreibeMittig("GANZ NAH MERKT ER DICH.",49,12)
                // der Neugierbalken wird in diesem Schritt immer gezeigt, direkt über Brummi
                zeichneNeugierbalken(Math.floor(brummi.x)-20,Math.floor(brummi.y)-17)
            } else if(schritt==8) {
                schreibeMittig("RENNEN LOCKT BRUMMI AN.",29,5)
                schreibeMittig("GEHEN IST LEISER.",39,12)
                schreibeMittig("ER HÖRT DEN GENERATOR.",49,12)
                screen.drawRect(29,99,102,4,10)
                screen.fillRect(30,100,Math.min(100,fortschritt/10),2,5)
            } else if(schritt==9) {
                schreibeMittig("PFEIF, WENN ER NAH IST.",29,5)
                schreibeMittig("DANN STEHT ER KURZ STILL.",39,12)
                schreibeMittig("ER LAUSCHT UND TANZT.",49,12)
                zeichnePfeil(109,76,0,5)
                screen.fillRect(4,94,152,15,15)
                schreibeMittig(pfiffPauseMs>0?
                    "PFEIFE BEREIT IN "+Math.ceil(pfiffPauseMs/1000)+" SEK.":
                    "B HALTEN",97,pfiffPauseMs>0?10:5)
            } else if(schritt==10) {
                schreibeMittig("JETZT SCHNELL WEG!",29,5)
                schreibeMittig("ER STEHT NUR 2,5 SEKUNDEN.",39,12)
                schreibeMittig("RENNEN: A + RICHTUNG",49,12)
                screen.drawCircle(40,76,6,5);zeichnePfeil(52,76,2,5)
            } else {
                schreibeMittig("DEINE LAMPE WIRD LEERER.",29,5)
                schreibeMittig("BATTERIEN LADEN SIE AUF.",39,12)
                schreibeMittig("LEER? DANN IST FEIERABEND.",49,12)
            }
            if(schritt!=8 && schritt!=9)schreibeMittig("SICHERES TRAINING",101,10)
        }
        screen.fillRect(0,112,160,8,15);schreibeMittig("MENÜ-TASTE: ÜBERSPRINGEN",112,10)
        if(schritt==12) {
            screen.fillRect(2,36,156,61,15);screen.drawRect(2,36,156,61,10)
            schreibeMittig("DU BIST BEREIT.",46,5)
            schreibeMittig("5 Sicherungen. 1 Ausgang.",62,12)
            schreibeMittig("A  SCHICHT BEGINNEN",80,1)
        }
    }
    // Lampenbalken: unter 20 % orange, sein Rahmen wechselt einmal pro Sekunde die Farbe (kein schnelles Blinken).
    function zeichneLampenbalken(x: number,y: number) {
        let schwach=ladung<20
        screen.drawRect(x,y,25,5,schwach?(Math.floor(vergangenMs/1000)%2==0?4:12):10)
        screen.fillRect(x+1,y+1,Math.max(0,23*ladung/100),3,schwach?4:5)
        schreibe(""+Math.ceil(ladung),x+28,y,12)
    }
    function zeichneAnzeige() {
        screen.fillRect(0,0,160,11,15)
        screen.drawLine(0,10,159,10,8)
        zeichneLampenbalken(3,3)
        zeichneEingesetztSymbol(53,3);schreibe(eingesetzt+"/5",64,3,9)
        zeichneTaschenSymbol(91,3);schreibe(getragen+"/3",100,3,5)
        if(piepAbstand<=12)zeichneAntenne(150,1,warnungMs>0)
        if(getragen>0 && brummi.gesehenMs>0 && brummi.verhalten!=Verhalten.Hinterher)zeichneNeugierbalken(60,13)
        if(bHaltenMs>0) {
            screen.drawRect(Math.floor(figurX)-7,Math.floor(figurY)+8,14,3,10)
            screen.fillRect(Math.floor(figurX)-6,Math.floor(figurY)+9,12*Math.min(1,bHaltenMs/350),1,5)
        }
        if(pfiffPauseMs>0) {zeichnePfeifenSymbol(137,13);schreibe(""+Math.ceil(pfiffPauseMs/1000),147,13,10)}
        screen.fillRect(0,112,160,8,15)
        if(setztEin) {
            schreibe("EINSETZEN",4,112,5);screen.drawRect(65,114,89,4,10)
            screen.fillRect(66,115,87*einsetzMs/3000,2,9)
        } else if(hinweisMs>0) {
            // Brummi hat eine Sicherung zurückgelegt: Sicherungsbild und Name des Raums, in dem sie wieder liegt.
            if(hinweisSymbol) {
                let x=Math.floor((160-hinweis.length*6-10)/2)
                zeichneSicherungSymbol(x,112)
                schreibe(hinweis,x+10,112,5)
            }
            else schreibeMittig(hinweis,112,5)
        }
        else if(gewaehlt>=0) {
            let ding=dinge[gewaehlt],beschriftung=ding.art==Dingart.Sicherung?"A: SICHERUNG":
                ding.art==Dingart.Batterie?
                    "A: BATTERIE +"+Math.min(BATTERIE_GEWINN,Math.floor(100-ladung)):
                ding.art==Dingart.Spind?(versteckt>=0?"A: SPIND VERLASSEN":"A: VERSTECKEN"):
                ding.art==Dingart.Generator?"A HALTEN: EINSETZEN":"AUFZUG / KEIN STROM"
            schreibeMittig(beschriftung,112,12)
        } else {schreibeMittig(alterMs%6000<4000?raeume[raum].raumName:"MENÜ-TASTE: PAUSE",112,10)}
        if(uebergangMs>0) {screen.fillRect(3,49,154,13,15);schreibeMittig(raeume[raum].raumName,53,5)}
    }
    function zeichneWelt() {
        if(hintergrundRaum!=raum || hintergrundGrubeNr!=grubeNr) {
            zeichneRaumHintergrund()
            hintergrundRaum=raum
            hintergrundGrubeNr=grubeNr
        }
        screen.drawImage(hintergrund,0,0)
        for(let i=0;i<dinge.length;i++)if(dinge[i].raum==raum && !dinge[i].genommen)zeichneDing(dinge[i])
        if(!reduziert && lampe)for(let i=0;i<7;i++) {
            let x=(i*37+Math.floor(vergangenMs/160))%144+8
            let y=(i*23+Math.floor(vergangenMs/240))%92+16
            if(istSichtbar(x,y))screen.setPixel(x,y,i%3==0?12:10)
        }
        zeichneFigur();zeichneDunkelheit();zeichneBrummiInWelt();zeichneWegweiser()
        // Pfiff: zwei Ringe um die Figur, Radius 6 bis 17 in 300 Millisekunden. Sie zeigen nur den Schall, am Licht
        // ändert sich nichts.
        if(pfiffEffektMs>0) {
            let ring=6+Math.floor((300-pfiffEffektMs)/25),
                mitteX=Math.floor(figurX),mitteY=Math.floor(figurY)
            screen.drawCircle(mitteX,mitteY,ring,9)
            if(ring>10)screen.drawCircle(mitteX,mitteY,ring-5,9)
        }
        zeichneAnzeige()
        if(zustand==Zustand.Training)zeichneTrainingLeiste()
    }
    function zeichnePause() {
        screen.fill(15)
        schreibeMittig("SCHICHT UNTERBROCHEN",18,5)
        screen.drawLine(15,29,145,29,10)
        for(let i=0;i<4;i++) {
            let beschriftung=i==0?"WEITER":
                i==1?(vorherZustand==Zustand.Training?"TRAINING AUSLASSEN":
                    (reduziert?"EFFEKTE: REDUZIERT":"EFFEKTE: KINO")):
                i==2?(stumm?"TON: AUS":"TON: AN"):
                "ZUM TITEL"
            schreibe(beschriftung,23,38+i*13,menue==i?1:10)
            if(menue==i)schreibe(">",13,38+i*13,5)
        }
        schreibeMittig("RICHTUNG: WAHL  A: OK",112,10)
    }
    // Ergebniskarten: Hier verliert niemand etwas. Ist die Lampe leer, ist nur die Schicht vorbei.
    function zeichneErgebnis() {
        screen.fill(15)
        let winkPhase=Math.floor(alterMs/500)%2
        let sekunden=Math.floor(zeitMs/1000),y=75
        if(gewonnen) {
            for(let i=0;i<6;i++)screen.drawLine(35+i*18,15,35+i*18,45,8)
            screen.fillRect(32,35,98,4,5)
            // Brummi winkt neben dem Aufzug
            zeichneBrummi(142,38,Verhalten.Runde,0,5,winkPhase?2:0)
            schreibeMittig("OBEN. ENDLICH.",51,1)
            schreibeMittig(malEntdeckt==0?"MAUSELEISE / NIE BEMERKT":
                sicherungenGenommen==0?"NICHTS VERLOREN!":"SCHICHT GESCHAFFT!",66,5)
        } else {
            // Brummi bringt die Figur mit seinem Licht zum Aufzug (Bild von y 8 bis 35). Das Tor steht offen:
            // seine Gitterstäbe sind zu beiden Seiten zusammengeschoben, die Kabine ist beleuchtet.
            screen.fillRect(52,8,56,27,14);screen.drawRect(52,8,56,27,10);screen.fillRect(60,10,40,23,11)
            for(let x=54;x<59;x+=2) {screen.drawLine(x,10,x,32,8);screen.drawLine(x+47,10,x+47,32,8)}
            screen.drawLine(40,35,120,35,13)
            screen.fillCircle(66,25,10,8)
            zeichneBrummi(66,29,Verhalten.Runde,winkPhase,5,winkPhase?2:0)
            zeichneFigurBild(88,28,-1,0,false,winkPhase)
            schreibeMittig("FEIERABEND FÜR HEUTE.",38,1)
            schreibeMittig(endGrund,47,5)
            schreibeMittig("BRUMMI BRINGT DICH RAUS.",56,12)
            // wie weit die Schicht kam (Sicherungen im Generator von 5) und ein Tipp
            zeichneEingesetztSymbol(65,66);schreibe(eingesetzt+"/5",77,66,9)
            schreibeMittig("TIPP: NIMM BATTERIEN MIT.",75,5)
            y=85
        }
        let zeilenAbstand=gewonnen?10:9
        schreibeMittig("ZEIT "+Math.floor(sekunden/60)+":"+(sekunden%60<10?"0":"")+sekunden%60,y,12)
        schreibeMittig("BRUMMI WAR DA: "+beruehrungen,y+zeilenAbstand,10)
        schreibeMittig("PFIFFE "+pfiffe+"  GRUBE "+grubeNr,y+2*zeilenAbstand,10)
        schreibeMittig("A: NOCHMAL B: NEUE GRUBE",gewonnen?109:112,5)
    }
    export function zeichne() {
        // Die gewünschte Palette für dieses Bild: die Studiopalette nur in der Leitstelle und auf
        // der Studiokarte (Kino.istStudioZeit).
        Kino.waehlePalette(zustand==Zustand.Intro && Kino.istStudioZeit(introFilmZeitMs(alterMs)))
        if(zustand==Zustand.Intro)zeichneIntro()
        else if(zustand==Zustand.Titel)zeichneTitel()
        else if(zustand==Zustand.TrainingWahl)zeichneTrainingWahl()
        else if(zustand==Zustand.Spiel || zustand==Zustand.Training)zeichneWelt()
        else if(zustand==Zustand.Pause)zeichnePause()
        else zeichneErgebnis()
    }
    export function verwerfeBilder() {hintergrundRaum=-1;maskeRaum=-1}
}
