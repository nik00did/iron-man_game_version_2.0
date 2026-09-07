import { addAudioElement } from "../../utils.js"

export class Sound {
    constructor(src) {
        this.audio = addAudioElement(src)
    }

    play() {
        const playing = this.audio.play()
        if (playing)
            playing.catch((e) => console.log(e))
    }

    stop() {
        this.audio.pause()
    }
}
