import { ICONS, SOUNDS, COMPONENT_TYPE, CANVAS } from "../constants.js"
import { Area } from "./area.js"
import { Component } from "./component.js"
import { Sound } from "./sound.js"

export function initSceen(sceen) {
    sceen.area = new Area()

    sceen.myMusic = new Sound(SOUNDS.FIRST_FIGHT)
    sceen.mySound = new Sound(SOUNDS.LOVE_ME_AGAIN)

    sceen.myPiece = new Component({
        width: 50,
        height: 50,
        color: ICONS.IRON_MAN,
        x: 0,
        y: CANVAS.height / 2,
        type: COMPONENT_TYPE.IMAGE,
    })
    sceen.myBackground = new Component({
        width: CANVAS.width,
        height: CANVAS.height,
        color: ICONS.BACKGROUND,
        x: 0,
        y: 0,
        type: COMPONENT_TYPE.BACKGROUND,
    })

    sceen.area.start()
}
