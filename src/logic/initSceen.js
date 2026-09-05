import { ICONS, SOUNDS } from "../constants.js"
import { initArea } from "./area.js"
import { component } from "./component.js"
import { Sound } from "./sound.js"

export function initSceen(sceen) {
    sceen.area = initArea()

    sceen.myMusic = new Sound(`${SOUNDS}/First fight.mp3`)
    sceen.mySound = new Sound(`${SOUNDS}/love me again.mp3`)

    sceen.myPiece = new component({
        width: 50,
        height: 50,
        color: `${ICONS}/iron-man.png`,
        x: 0,
        y: sceen.area.canvas.height / 2,
        type: "image",
    })
    sceen.myBackground = new component({
        width: 1000,
        height: 500,
        color: `${ICONS}/bluesky4.png`,
        x: 0,
        y: 0,
        type: "background",
    })

    sceen.area.start()
}
