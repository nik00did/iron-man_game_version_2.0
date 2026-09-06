import { addAudioElement } from "../utils.js"

export class Sound {
    constructor(src) {
        this.sound = addAudioElement(src)
    }

    Play() {
        this.sound.play()
    }

    stop() {
        this.sound.pause()
    }
}
