import { addAudioElement } from "../../utils.js"

export class Sound {
    constructor(src) {
        this.sound = addAudioElement(src)
    }

    play() {
        const playing = this.sound.play()
        if (playing)
            playing.catch((e) => console.log(e))
    }

    stop() {
        this.sound.pause()
    }
}
