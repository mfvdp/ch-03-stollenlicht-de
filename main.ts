// Verbindet die Tasten und den Bildschirm des Geräts mit dem Spiel und gibt den Klängen ihre Zeit.
let letzteBildzeitMs = control.millis()
NachtKlang.richteEin()
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () { Nacht.schaltePause() })
game.onUpdate(function () {
    let jetztMs = control.millis()
    let dt = Math.min(50,jetztMs-letzteBildzeitMs)
    letzteBildzeitMs = jetztMs
    let tasten = 0
    if (controller.left.isPressed()) tasten |= 1
    if (controller.right.isPressed()) tasten |= 2
    if (controller.up.isPressed()) tasten |= 4
    if (controller.down.isPressed()) tasten |= 8
    if (controller.A.isPressed()) tasten |= 16
    if (controller.B.isPressed()) tasten |= 32
    Nacht.aktualisiere(dt,tasten)
    NachtKlang.aktualisiere(jetztMs)
})
game.onPaint(function () { Nacht.zeichne() })
