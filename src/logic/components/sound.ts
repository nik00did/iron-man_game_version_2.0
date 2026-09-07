import { addAudioElement } from "../../utils.js"

export class Sound {
    audio: HTMLAudioElement

    constructor(src: string) {
        this.audio = addAudioElement(src)
    }

    play(): void {
        const playing = this.audio.play()
        if (playing)
            playing.catch((e: unknown): void => console.log(e))
    }

    stop(): void {
        this.audio.pause()
    }
}
