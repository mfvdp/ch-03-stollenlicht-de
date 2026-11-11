// Das Intro mit einer gemeinsamen Zeitleiste, die zum Lesen Zeit lässt. Alles wird in der echten Bildschirmgröße
// gezeichnet; beim Zeichnen wird nie ein neues Bild angelegt, der Zufall der Spielregeln wird nicht benutzt, und es
// gibt keine fremden Bilddateien.
namespace Kino {
    // Gemeinsame 5 x 7 große Buchstaben für den Namen des Spiels (bild.ts) und die Studiokarte „CALLIOPE HACKER“.
    // Die Schrift hat die Zeichen aus buchstaben: A bis Z und 13 Sonderbuchstaben wie É, Ç oder Ü; ein anderes Zeichen
    // bleibt leer. Für ein neues Zeichen braucht man sein Muster in buchstabenMuster (35 Nullen und Einsen, 5 je Zeile)
    // und das Zeichen in buchstaben.
    const buchstaben = "ACEHIKLOPRNTSBDFGJMQUVWXYZÀÁÈÉÊÍÓÚÇÑÄÖÜ"
    const buchstabenMuster = [
        "01110100011000111111100011000110001",
        "01111100001000010000100001000001111",
        "11111100001000011110100001000011111",
        "10001100011000111111100011000110001",
        "11111001000010000100001000010011111",
        "10001100101010011000101001001010001",
        "10000100001000010000100001000011111",
        "01110100011000110001100011000101110",
        "11110100011000111110100001000010000",
        "11110100011000111110101001001010001",
        "10001110011010110011100011000110001",
        "11111001000010000100001000010000100",
        "01111100001000001110000010000111110",
        "11110100011000111110100011000111110",
        "11110100011000110001100011000111110",
        "11111100001000011110100001000010000",
        "01111100001000010111100011000101111",
        "00001000010000100001000011000101110",
        "10001110111010110101100011000110001",
        "01110100011000110001101011001001101",
        "10001100011000110001100011000101110",
        "10001100011000110001100010101000100",
        "10001100011000110101101011010101010",
        "10001100010101000100010101000110001",
        "10001100010101000100001000010000100",
        "11111000010001000100010001000011111",
        "01000001000111010001111111000110001",
        "00010001000111010001111111000110001",
        "01000001001111110000111101000011111",
        "00010001001111110000111101000011111",
        "00100010101111110000111101000011111",
        "00010001001111100100001000010011111",
        "00010001000111010001100011000101110",
        "00010001001000110001100011000101110",
        "01111100001000010000011110010001100",
        "01101100101000111001101011001110001",
        "01010000000111010001111111000110001",
        "01010000000111010001100011000101110",
        "01010000001000110001100011000101110"
    ]
    // Der Calliope Hacker: ein Bild mit 64 x 40 Pixeln, Farbe 0 ist durchsichtig, gezeichnet nur mit STUDIO_PALETTE.
    // HACKER nie beschreiben oder kopieren (es liegt als feste Zahlenfolge im Programmspeicher).
    // GRUBEN_PALETTE ist die Spielpalette der Grube (dieselbe wie in pxt.json).
    export const STUDIO_PALETTE = hex`000000ffffffffd23f2ee6d613998f7fd4ff2f6fe0ef3b45c58a4c7a4a26a7b0c6565d782b396607070be8a07a1a2038`
    export const HACKER = img`
        . . . . . . . . . . . . . . . . d d d d d . . . . . . . . . . . . . . . c . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . d d d d d d d 5 . . . . . c . c . b b b b b b b b b b b b b b b b b b b b b b . . . . . . . . . . .
        . . . . . . . . . . . . . d b b d d d d d d 5 . c . c . c . c d d d d d d d d d d d d d d d d d d d d d d . . . . . . . . . . .
        . . . . . . . . . . . . d b d d d d d d d d d 5 . c . c c c c d d f f f f f f f f f f f f f f f f f f d d . . . . . . . . . . .
        . . . . . . . . . . . . d b d d d d d d d d d 5 c c c c c c c d d f 5 5 5 5 5 5 f f f f f f f f f f f d d . c . . . . . . . . .
        . . . . . . . . . . . d b d d d d d d d d d d d 5 c c c c c c d d f f f f f f f f f f f f f f f f f f d d c . c . . . . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f 2 2 2 2 2 2 2 2 2 f f f f f f d d . c . c . . . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f f f f f f f f f f f f f f f f d d c c c . c . . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f 3 3 3 3 3 f f f f f f f f f f d d c c c c . c . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f f f f f f f f f f f f f f f f d d c c 2 2 c . c 2 2 . .
        . . . . . . . . . . . b d d d d d d d d d d d d 5 c c c c c c d d f f f f f 7 7 7 7 7 7 7 7 f f f f f d d c c 2 6 6 6 6 6 2 . .
        . . . . . . . . . . d d b d d d d d d d d d d d d 5 c c c c c d d f f f f f f f f f f f f f f f f f f d d c 6 6 6 6 6 6 6 6 6 .
        . . . . . . . . . d d d d b b d d d d d d d d d d d 5 c c c c d d f f f 5 5 5 5 5 5 5 5 5 5 5 f f f f d d 2 6 6 6 7 6 7 6 6 6 2
        . . . . . . d d d d d d d d d b b b b d d d d d d d d 5 c c c d d f f f f f f f f f f f f f f f f f f d d 2 6 6 6 7 7 7 6 6 6 2
        . . . . . d 3 3 3 3 3 3 d d d d d d d d d d d d d d d d 5 c c d d f 6 6 6 6 f f f f f f f f f f f f f d d c 6 6 6 6 7 6 6 6 6 .
        . . . . d 3 3 3 3 3 3 3 3 d d d d d d d d d d d d d d d d 5 c d d d d d d d d d d d d d d d d d d d d d d c c 2 6 6 6 6 6 2 . c
        . . . . d 3 3 3 3 3 3 3 4 d d d d d d d d d d d d b d d d d 5 d d d d d d d d d d d d d d d d d d d d d d c c 2 2 c d c 2 2 c .
        . . . . d 3 3 3 3 3 3 3 4 d d d d d d d d d d d d d b d d d d 5 c c c c c c c c c b b b c c c c c c c c c c c c c c c c . c . .
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d b d d d d d e e c c c b b b b b b b b b c c c c c c c c c c c c . c . c .
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d d b d d d d e e d d d 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d d d 6 b 5 b 3 b 7 b d 8 8 8 8 8 8 8 8 8 8 d d d d d d d d d d d d 8 8 8 8
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d d 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 d d 1 d d a b a d 7 d 7 d d 8 8 8
        . . . . d 4 4 3 3 3 3 4 4 d d d d d d d d d d d d d d d 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 d 1 1 1 d d d d d 7 d 7 d d 8 8 8
        . . . . d 4 4 3 3 3 3 4 4 d d d d d d d d d d d d d d d d 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 d 1 d d d d d d d d d d 8 8 8 8
        . . . . . d 4 4 3 3 4 4 d d d d d d d d d d d d d d d d d d d d 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        . . . . . d 4 4 4 4 4 4 4 d d d d d d d d d d d d d d d d d d d d b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        . . . . . . d 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 d d d d d d d d d d d d c c c c c c c c c c c b b c c . c . c . c . . b a a a a a a
        . . . . . . . d d d d d d d d d d d d d d d d d d d d d d d d d d d c c c c c c c c c c c b b c . c . c . . . . . b a a a a a a
        . . . . . . . . . . . . . . . . . d d . d d d d d . c d d d d d b . c . c . c . c . c . c b b . c . . . . . . . . b a a a a a a
        . . . . . . . . . . . . . . . . . d d . d d d d d . . c d d d d b c . c . c . c . c . c . b b . . 4 3 3 3 4 . . . b a b b b b a
        . . . . . . . . . . . . . . . . . d d . d d d d d . . . d d d d b . . . c . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        . . . . . . . . . . . . . . . . . d d 3 3 3 3 3 3 3 . . d d d d b . . . . . . . . . . . . b b . 4 3 d d d 3 4 . . b a a a a a a
        . . d . . . d . . . . . . . . . . d d 3 1 3 3 3 3 3 . . d d d d b . . . . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        . . d d . d d . . . . . . . . . . d d 1 1 1 1 1 1 1 . . d d d d b . . . . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a b b b b a
        . d 1 1 1 1 1 d 1 1 . . . . . . . d d . . . . . . . . 3 3 3 3 3 3 3 3 . . . . . . . . . . b b . 4 3 b b b 3 4 . . b a a a a a a
        . 1 1 d 1 1 1 1 1 1 1 d d d d d d d d d d d d d d . 3 3 1 3 3 3 3 3 3 3 . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        d 1 1 1 1 1 1 d d 1 1 . . . . d d . . . . . . d d . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        4 3 3 3 3 3 3 3 3 3 4 . . . . b b . . . . . . b b . . . . . . . . . . . . . . . . . . . . b b . . 4 4 4 4 4 . . . b a b b b b a
        . 4 4 4 4 4 4 4 4 4 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b a a a a a a
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b a a a a a a
    `
    export const GRUBEN_PALETTE = hex`000000eaf3dde65042a92d3fdd8b45f1cf7c49395378a29725384377c5c443616a151f2ba3b5a0625958353e40080c13`
    // Studiopalette für die Leitstelle (szeneLeitstelle) und die Studiokarte (szeneStudio): Filmzeit 23000 bis 34500
    // (echte Zeit 37 bis 57 Sekunden).
    export function istStudioZeit(filmMs: number): boolean {return filmMs>=23000 && filmMs<34500}
    // Nacht.zeichne ruft waehlePalette in jedem Bild mit der gewünschten Palette auf; sie wechselt nur, wenn sich der
    // Wunsch ändert. So stimmt nach jedem Sprung, Überspringen oder jeder Pause im nächsten Bild wieder
    // die richtige Palette.
    let studioPaletteAktiv = false
    export function waehlePalette(studio: boolean) {
        if(studio!=studioPaletteAktiv) {
            studioPaletteAktiv=studio
            image.setPalette(studio?STUDIO_PALETTE:GRUBEN_PALETTE)
        }
    }
    export function istStudioPaletteAktiv(): boolean {return studioPaletteAktiv}
    let schrift: image.Font
    let istReduziert = false
    function begrenze(x: number): number {return Math.max(0,Math.min(1,x))}
    function glaette(x: number): number {x=begrenze(x);return x*x*(3-2*x)}
    function beschrifte(text: string,y: number,farbe: number) {
        screen.print(text,Math.floor((160-text.length*6)/2),y,farbe,schrift)
    }
    export function zeichneBuchstabe(zeichen: string,x: number,y: number,groesse: number,farbe: number) {
        let nr=buchstaben.indexOf(zeichen)
        if(nr<0)return
        let muster=buchstabenMuster[nr]
        for(let j=0;j<7;j++)for(let i=0;i<5;i++)
            if(muster.charAt(j*5+i)=="1")
                screen.fillRect(Math.round(x+i*groesse),Math.round(y+j*groesse),
                    Math.ceil(groesse),Math.ceil(groesse),farbe)
    }
    function zeichneKinoBalken() {
        screen.fillRect(0,0,160,9,15);screen.fillRect(0,111,160,9,15)
    }
    // Ein Farbsatz für jede Palette: Die erste Zeile hat immer Farbe 1. Im Studio hat die Trennlinie Farbe 3 und die
    // zweite Zeile Farbe 5, in der Grube die Trennlinie Farbe 8 und die zweite Zeile Farbe 12.
    function zeigeUntertitel(zeile1: string,zeile2: string) {
        screen.fillRect(5,90,150,21,15);screen.drawLine(32,90,127,90,studioPaletteAktiv?3:8)
        beschrifte(zeile1,94,1);beschrifte(zeile2,103,studioPaletteAktiv?5:12)
    }
    function zeichneFlecken(zeitMs: number,anzahl: number,farbe: number) {
        if(istReduziert)return
        for(let i=0;i<anzahl;i++) {
            let x=(i*47+zeitMs/80)%172-6,y=(i*29+zeitMs/(28+i%5))%99+9
            screen.drawLine(x,y,x-1,y+2,farbe)
        }
    }
    function zeichneGlanz(x: number,y: number,radius: number,farbe: number) {
        screen.drawLine(x-radius,y,x+radius,y,farbe);screen.drawLine(x,y-radius/3,x,y+radius/3,farbe)
        screen.fillRect(x-1,y-1,3,3,1)
    }
    function zeichneFunkenregen(zeitMs: number,x: number,y: number,anzahl: number) {
        if(istReduziert || zeitMs<0 || zeitMs>1400)return
        for(let i=0;i<anzahl;i++) {
            let winkel=i*2.3999,sekunden=zeitMs/1000,tempo=16+i%7*7
            let dx=Math.cos(winkel)*tempo,dy=Math.sin(winkel)*tempo
            let funkeX=x+dx*sekunden,funkeY=y+dy*sekunden+24*sekunden*sekunden
            screen.drawLine(funkeX,funkeY,funkeX-dx*0.04,funkeY-dy*0.04,zeitMs<450?5:i%3==0?4:13)
        }
    }
    function szeneAussen(zeitMs: number) {
        screen.fill(11)
        let schwenk=istReduziert?0:glaette(zeitMs/4200)*13
        // Der Mond hinter Wolkenbänken; die ferne Skyline bewegt sich viel langsamer.
        screen.fillCircle(123-schwenk/5,29,15,10)
        screen.fillCircle(128-schwenk/5,25,14,11)
        for(let i=0;i<7;i++) {
            let x=i*29-10-schwenk/4,hoehe=13+i*17%23
            screen.fillRect(x,77-hoehe,25,hoehe,8)
            for(let j=0;j<3;j++)screen.fillRect(x+5+j*6,69-hoehe,2,2,j==1?13:11)
        }
        // Fester Förderturm mit Querstreben, Seiltrommel und Seil.
        let x=57-schwenk
        screen.fillTriangle(x-28,86,x-6,21,x-1,21,14)
        screen.fillTriangle(x+32,86,x+9,21,x+4,21,14)
        screen.drawLine(x-27,85,x-5,22,10)
        screen.drawLine(x+31,85,x+8,22,10)
        for(let i=0;i<4;i++) {
            let y=30+i*14,breite=9+i*5
            screen.drawLine(x-breite,y,x+breite+4,y+14,10)
            screen.drawLine(x+breite,y,x-breite-4,y+14,8)
        }
        screen.fillRect(x-13,18,33,7,8);screen.drawLine(x-13,18,x+19,18,12)
        screen.drawCircle(x+2,18,8,10);screen.drawCircle(x+2,18,5,8)
        screen.drawLine(x+1,25,x+1,87,13);screen.drawLine(x+5,25,x+5,87,10)
        screen.fillRect(95-schwenk,61,65,26,14)
        screen.fillTriangle(89-schwenk,62,116-schwenk,48,151-schwenk,62,8)
        for(let i=0;i<5;i++)screen.fillRect(99-schwenk+i*12,69,5,7,5)
        screen.fillRect(0,87,160,24,15)
        // Nasser Beton fängt lange Spiegelungen ein.
        for(let i=0;i<22;i++) {
            let spiegelX=(i*31)%160,spiegelY=90+i*7%18
            screen.drawLine(spiegelX,spiegelY,spiegelX+3+i%8,spiegelY,i%6==0?13:8)
        }
        screen.drawLine(17-schwenk,110,49-schwenk,87,10)
        screen.drawLine(95-schwenk,110,70-schwenk,87,8)
        let strahlX=istReduziert?30:28+Math.sin(zeitMs/1600)*21
        screen.drawLine(144,77,strahlX,12,10);screen.drawLine(145,77,strahlX+12,12,8)
        // Dunkle Formen im Vordergrund ziehen vor den Gebäuden vorbei.
        for(let i=0;i<7;i++) {
            let formX=i*32-schwenk*2
            screen.fillRect(formX,83,3,28,14);screen.drawLine(formX,87,formX+32,104,8)
        }
        zeichneFlecken(zeitMs,32,10)
        zeichneKinoBalken()
        if(zeitMs>700) {beschrifte("GRUBE 09",15,1);beschrifte("23:47 / NACHTSCHICHT",100,5)}
        // Eine Blende öffnet sich aus Schwarz, statt dass der ganze Bildschirm auf einmal hell wird.
        let abdeckung=istReduziert?0:80*(1-glaette(zeitMs/1000))
        screen.fillRect(0,9,abdeckung,102,15);screen.fillRect(160-abdeckung,9,abdeckung,102,15)
    }
    function szeneSchluessel(zeitMs: number) {
        screen.fill(15)
        screen.fillRect(13,14,134,95,8)
        screen.drawRect(13,14,134,95,10);screen.drawRect(17,18,126,87,14)
        for(let x=21;x<144;x+=119)for(let y=22;y<105;y+=78) {
            screen.fillCircle(x,y,2,13);screen.drawLine(x-1,y,x+1,y,15)
        }
        screen.fillRect(20,27,74,29,15);screen.drawRect(20,27,74,29,10)
        screen.print("FÖRDERKORB",23,32,12,schrift)
        screen.print(zeitMs<1100?"VERRIEGELT":"ABFAHRT",23,44,zeitMs<1100?3:9,schrift)
        screen.drawCircle(111,43,12,14);screen.fillCircle(111,43,9,zeitMs<1100?6:9)
        screen.drawCircle(111,43,6,15)
        screen.drawLine(111,43,111+(zeitMs<1100?-5:5),38,1)
        screen.fillRect(30,64,98,6,15)
        for(let i=0;i<14;i++)screen.fillRect(32+i*7,65,4,4,zeitMs>1100+i*40?5:14)
        // Eine Hand mit Handschuh dreht den Schlüssel im Takt der Musik.
        let greifen=glaette(zeitMs/900),drehung=glaette((zeitMs-950)/500)
        let handX=114,handY=110-greifen*26
        screen.fillRect(handX-11,handY,30,31,14)
        screen.fillRect(handX-13,handY-9,24,17,13)
        for(let i=0;i<4;i++)screen.drawLine(handX-10+i*5,handY-7,handX-10+i*5,handY+1,8)
        screen.drawLine(111,43,111-drehung*10,57,12)
        screen.fillRect(105-drehung*8,55,13,4,10)
        zeichneKinoBalken()
        if(zeitMs>1300)zeigeUntertitel("LEITSTELLE AN WARTUNG:","BITTE GENERATOR PRÜFEN.")
    }
    function szeneAbstieg(zeitMs: number) {
        screen.fill(15)
        let fahrt=istReduziert?90:zeitMs/18+zeitMs*zeitMs/180000
        let fluchtpunktX=istReduziert?80:80+Math.sin(zeitMs/1300)*2,fluchtpunktY=47
        // Ausgefüllte Flächen geben dem Schacht Masse, nicht nur Linien.
        screen.fillTriangle(0,9,fluchtpunktX,fluchtpunktY,0,111,8)
        screen.fillTriangle(160,9,fluchtpunktX,fluchtpunktY,160,111,11)
        screen.fillTriangle(0,9,fluchtpunktX,fluchtpunktY,160,9,14)
        for(let i=8;i>=0;i--) {
            let tiefe=((i*23+fahrt)%207)/207,breite=8+190*tiefe*tiefe,hoehe=breite*0.65
            let x=fluchtpunktX-breite/2,y=fluchtpunktY-hoehe/2
            screen.drawRect(x,y,breite,hoehe,10)
            screen.drawRect(x+2,y+2,breite-4,hoehe-4,8)
            screen.drawLine(x,y+hoehe,x+breite,y+hoehe,13)
            screen.fillRect(x+4,y+3,3,2,i%3==0?5:14)
            screen.drawLine(x+4,y+hoehe-2,x+4,y+hoehe-6,12)
        }
        for(let i=0;i<4;i++)screen.drawLine(i*53,110,fluchtpunktX,fluchtpunktY,i%2==0?14:8)
        // Tor, Schrauben und eine feste Schalttafel im Vordergrund.
        screen.fillRect(0,9,7,102,14);screen.fillRect(153,9,7,102,14)
        screen.drawLine(7,9,7,110,12);screen.drawLine(152,9,152,110,10)
        for(let i=0;i<8;i++) {
            let x=14+i*19
            screen.fillRect(x,9,2,81,14);screen.drawLine(x+1,10,x+1,89,10)
        }
        screen.fillRect(43,63,74,24,15);screen.drawRect(43,63,74,24,10)
        screen.print("TIEFE",49,68,12,schrift)
        screen.print("-"+Math.min(480,Math.floor(zeitMs*480/7500))+" M",49,77,5,schrift)
        for(let i=0;i<3;i++)screen.fillRect(98+i*5,70,3,3,zeitMs<5500?9:3)
        if(zeitMs>3600 && zeitMs<5700)zeichneFunkenregen((zeitMs-3600)%1100,147,18,21)
        zeichneKinoBalken()
        if(zeitMs<2600)zeigeUntertitel("DANN WIEDER NACH OBEN.","ALLES KLAR!")
        if(zeitMs>5700)zeigeUntertitel("HOPPLA! WAS WAR DAS?","DER STROM IST WEG.")
    }
    // Die dunkle Halle aus szeneDunkleHalle. szeneBrummi benutzt sie noch einmal, mit allen Deckenlampen aus.
    // farbeAus: Farbe der ausgeschalteten Deckenlampen (3, solange sie in szeneDunkleHalle ausgehen, 14 in szeneBrummi)
    function zeichneHalle(zeitMs: number, farbeAus: number) {
        screen.fill(15)
        screen.fillTriangle(0,9,80,48,0,111,8)
        screen.fillTriangle(160,9,80,48,160,111,11)
        screen.fillTriangle(0,111,80,48,160,111,14)
        for(let i=0;i<7;i++) {
            let groesse=18+i*i*4,x=80-groesse/2,y=48-groesse/3
            screen.drawRect(x,y,groesse,groesse*0.7,zeitMs>1100+i*130?8:10)
            screen.drawLine(x,y+groesse*0.7,x+groesse,y+groesse*0.7,15)
            let leuchtet=zeitMs<700+(6-i)*210
            screen.fillRect(76,y+3,8,2,leuchtet?5:farbeAus)
            if(leuchtet) {
                screen.drawLine(76,y+5,x+5,y+groesse*0.7,10)
                screen.drawLine(84,y+5,x+groesse-5,y+groesse*0.7,10)
            }
        }
        for(let i=0;i<5;i++)screen.drawLine(80,48,i*40,111,8)
        screen.fillRect(6,34,17,10,14);screen.print("09",9,37,12,schrift)
        // Werkzeugkisten rechts
        if(zeitMs>1800) {
            screen.fillRect(115,86,38,25,8);screen.fillRect(110,81,23,16,13)
            screen.fillRect(102,72,22,13,14);screen.drawLine(103,72,122,72,12)
            screen.fillRect(100,74,3,9,5)
        }
    }
    function szeneDunkleHalle(zeitMs: number) {
        zeichneHalle(zeitMs,3)
        zeichneFunkenregen(zeitMs-1000,133,22,28)
        zeichneKinoBalken()
        if(zeitMs>1700)zeigeUntertitel("5 SICHERUNGEN FEHLEN.","DER AUFZUG STEHT STILL.")
    }
    // Brummi in jeder Größe: gleich gebaut wie Nacht.zeichneBrummi (bild.ts), jeder Teil wird um (x, y)
    // mit massstab vergrößert.
    function zeichneTeil(x: number,y: number,massstab: number,dx: number,
        dy: number,breite: number,hoehe: number,farbe: number) {
        screen.fillRect(Math.round(x+dx*massstab),Math.round(y+dy*massstab),
            Math.ceil(breite*massstab),Math.ceil(hoehe*massstab),farbe)
    }
    function zeichneGrossBrummi(x: number,y: number,massstab: number,
        kette: number,licht: number,arme: number) {
        // Ketten mit laufenden Nieten
        zeichneTeil(x,y,massstab,-5,3,4,3,14);zeichneTeil(x,y,massstab,2,3,4,3,14)
        for(let i=0;i<4;i++)zeichneTeil(x,y,massstab,i*2+(i>1?-2:-5)+kette,4,1,1,10)
        // Körper mit runden Ecken, Schatten, ein kleines Feld mit zwei Knöpfen
        zeichneTeil(x,y,massstab,-4,-3,9,7,12);zeichneTeil(x,y,massstab,-5,-2,11,5,12)
        zeichneTeil(x,y,massstab,5,-2,1,5,10);zeichneTeil(x,y,massstab,-4,3,9,1,10)
        zeichneTeil(x,y,massstab,-2,-1,5,3,14)
        zeichneTeil(x,y,massstab,-1,0,1,1,5);zeichneTeil(x,y,massstab,1,0,1,1,9)
        // Kuppelkopf, sein gelbes Licht, zwei türkise Lampen als Augen und ein kleines Lächeln
        zeichneTeil(x,y,massstab,-3,-7,7,4,12)
        zeichneTeil(x,y,massstab,-2,-8,5,1,12);zeichneTeil(x,y,massstab,3,-6,1,3,10)
        zeichneTeil(x,y,massstab,-1,-10,3,2,licht)
        zeichneTeil(x,y,massstab,-2,-6,2,2,9);zeichneTeil(x,y,massstab,1,-6,2,2,9)
        zeichneTeil(x,y,massstab,-2,-6,1,1,1);zeichneTeil(x,y,massstab,1,-6,1,1,1)
        zeichneTeil(x,y,massstab,-1.5,-4,0.5,0.5,10)
        zeichneTeil(x,y,massstab,2,-4,0.5,0.5,10);zeichneTeil(x,y,massstab,-1,-3.5,3,0.5,10)
        // Greifer: 0 beide unten, 1 der rechte oben, 2 beide oben
        if(arme==0)zeichneTeil(x,y,massstab,6,-1,1,3,12)
        else {
            zeichneTeil(x,y,massstab,6,-5,1,4,12)
            zeichneTeil(x,y,massstab,5,-6,1,1,14)
            zeichneTeil(x,y,massstab,7,-6,1,1,14)
        }
        if(arme==2) {
            zeichneTeil(x,y,massstab,-6,-5,1,4,12)
            zeichneTeil(x,y,massstab,-7,-6,1,1,14)
            zeichneTeil(x,y,massstab,-5,-6,1,1,14)
        }
        else zeichneTeil(x,y,massstab,-6,-1,1,3,12)
        if(arme==0)zeichneTeil(x,y,massstab,7,1,1,1,14)
        if(arme<2)zeichneTeil(x,y,massstab,-7,1,1,1,14)
    }
    // szeneBrummi: Brummi wacht in der dunklen Halle auf. Sein gelbes Licht geht in etwa 0,7 Sekunden sanft an (ein
    // kleiner Kreis wächst), er rollt von rechts in die Mitte, wird nur wenig größer (von 1,0 auf 1,3), hebt beide
    // Greifer und winkt; sein Licht blinkt einmal (ein kleiner weißer Punkt).
    function szeneBrummi(zeitMs: number) {
        zeichneHalle(9999,14)
        let rollen=istReduziert?1:glaette((zeitMs-720)/2180),massstab=2.4*(1+0.3*rollen)
        let x=Math.round(148-68*rollen),y=Math.round(88-6*massstab)
        let schein=istReduziert?1:begrenze(zeitMs/720)
        let arme=zeitMs<2950?0:zeitMs<3400?2:Math.floor((zeitMs-3400)/400)%2+1
        zeichneGrossBrummi(x,y,massstab,rollen>0 && rollen<1?Math.floor(zeitMs/150)%2:0,schein<1?14:5,arme)
        if(schein<1)screen.fillCircle(x,y-9*massstab,Math.round(schein*1.4*massstab),5)
        if(zeitMs>2790 && zeitMs<3060)screen.fillCircle(x,y-9*massstab,2,1)
        zeichneKinoBalken()
        if(zeitMs>630)beschrifte("PIEP! PIEP! AUFRÄUMEN!",101,12)
    }
    // szeneLeitstelle, in der Studiopalette: Der Calliope Hacker sitzt an seinem Schreibtisch (von hinten gesehen) und
    // hat Brummi gebaut. Der Monitor an der Wand schaltet sich Kästchen für Kästchen ein und zeigt den Plan der Grube:
    // Ein gelber Punkt, Brummi, bringt eine Sicherung an ihren Platz zurück (das gelbe Kästchen).
    function szeneLeitstelle(zeitMs: number) {
        screen.fill(12)
        screen.fillRect(0,83,160,28,15);screen.drawLine(0,83,159,83,11)
        screen.drawTransparentImage(HACKER,4,44)
        screen.fillRect(82,13,74,60,13);screen.drawRect(82,13,74,60,11)
        screen.fillRect(116,73,6,6,11);screen.fillRect(108,78,22,2,11)
        for(let i=0;i<12;i++) {
            if(!istReduziert && zeitMs<i*60)continue
            let spalte=i%4,zeile=Math.floor(i/4),x=89+spalte*15,y=19+zeile*13
            if(spalte<3)screen.drawLine(x+11,y+4,x+14,y+4,4)
            if(zeile<2)screen.drawLine(x+5,y+8,x+5,y+12,4)
            screen.drawRect(x,y,11,8,i==0?2:3)
        }
        if(zeitMs>800) {
            // am unteren Rand nach links (45 Pixel), dann nach oben (26 Pixel)
            let weg=glaette((zeitMs-800)/1500)*71,
                punktX=139-Math.min(45,weg),punktY=weg>45?49-(weg-45):49
            screen.fillRect(punktX-1,punktY-1,3,3,2);screen.setPixel(punktX+2,punktY-2,1)
        }
        screen.fillRect(89,62,3,3,2);screen.print("BRUMMI",95,60,5,schrift)
        zeichneKinoBalken()
        if(zeitMs>900)zeigeUntertitel("ICH HABE BRUMMI GEBAUT.","ER RÄUMT ALLES ZURÜCK.")
    }
    // szeneStudio: die Studiokarte „Calliope Hacker präsentiert“ in der Studiopalette mit festen Farbnummern (Grund 15,
    // Buchstaben 1 mit Schatten 4 und 13, Linie 3, „präsentiert“ 2, Glanz 1 und 2): Der Calliope Hacker steigt in 0,4
    // Sekunden aus der Bühne, die Buchstaben fliegen ein, dann kommen eine Linie, ein Glanz und „präsentiert“; am Ende
    // blendet die Karte sanft in den Titel über.
    function szeneStudio(zeitMs: number) {
        screen.fill(15)
        if(!istReduziert)for(let i=0;i<6;i++) {
            let winkel=zeitMs/2200+i*1.047,dx=Math.cos(winkel)*83,dy=Math.sin(winkel)*43
            screen.fillTriangle(80,43,80+dx,43+dy,80+dx+4,43+dy+3,i%2==0?12:11)
        }
        let aufstieg=istReduziert?0:1-glaette(zeitMs/400)
        screen.drawTransparentImage(HACKER,48,18+Math.round(aufstieg*42))
        // die Bühne vor ihm, damit er aus ihr herauszusteigen scheint
        screen.fillRect(0,58,160,53,15)
        for(let i=0;i<7;i++)screen.drawLine(80,58,i*27,111,12)
        for(let i=0;i<4;i++)screen.drawLine(10,81+i*i*2,150,81+i*i*2,12)
        // Die Buchstaben fliegen einzeln ein und bleiben dann etwa fünf Sekunden lesbar.
        const studioName="CALLIOPE HACKER"
        for(let i=0;i<studioName.length;i++) {
            let ankunft=istReduziert?1:glaette((zeitMs-1500-i*65)/650)
            let x=13+i*9,y=66+(1-ankunft)*(i%2==0?-54:58)
            if(zeitMs<1500+i*65 && !istReduziert)continue
            zeichneBuchstabe(studioName.charAt(i),x+2,y+3,1.5,13)
            zeichneBuchstabe(studioName.charAt(i),x+1,y+1,1.5,4)
            zeichneBuchstabe(studioName.charAt(i),x,y,1.5,1)
        }
        if(zeitMs>2550) {
            let breite=59*glaette((zeitMs-2550)/600)
            screen.drawLine(80-breite,86,80+breite,86,3)
            screen.fillRect(77,85,6,3,2)
        }
        if(zeitMs>3200)beschrifte("präsentiert",96,2)
        // Ein wandernder Glanz.
        if(!istReduziert && zeitMs>3000 && zeitMs<4000)zeichneGlanz(13+(zeitMs-3000)*0.134,64,7,2)
        if(!istReduziert && zeitMs>2200)for(let i=0;i<22;i++) {
            let partikelMs=(zeitMs-2200+i*191)%2400,anteil=partikelMs/2400
            let x=(i*37)%150+5,y=107-anteil*88
            screen.setPixel(x,y,i%3==0?3:5)
        }
        // Sanft in den Titel überblenden; kein harter Sprung vom hellen Bild der Karte zum nächsten Bild.
        if(zeitMs>8300) {
            let abdeckung=istReduziert?0:80*glaette((zeitMs-8300)/700)
            screen.fillRect(0,9,abdeckung,102,15);screen.fillRect(160-abdeckung,9,abdeckung,102,15)
        }
        zeichneKinoBalken()
    }
    export function zeichne(zeitMs: number,reduziert: boolean,kleineSchrift: image.Font) {
        schrift=kleineSchrift;istReduziert=reduziert
        if(zeitMs<4200)szeneAussen(zeitMs)
        else if(zeitMs<7000)szeneSchluessel(zeitMs-4200)
        else if(zeitMs<14500)szeneAbstieg(zeitMs-7000)
        else if(zeitMs<18500)szeneDunkleHalle(zeitMs-14500)
        else if(zeitMs<23000)szeneBrummi(zeitMs-18500)
        else if(zeitMs<25500)szeneLeitstelle(zeitMs-23000)
        else szeneStudio(zeitMs-25500)
        // Den Titel des Spiels zeichnet Nacht im Bereich von 34,5 bis 38 Sekunden (Filmzeit).
    }
}
