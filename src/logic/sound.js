import { addAudioElement } from "../utils.js"

export function Sound(src) {
    this.sound = addAudioElement(src)

    this.Play = function () {
        this.sound.play()
    }
    this.stop = function () {
        this.sound.pause()
    }
}
