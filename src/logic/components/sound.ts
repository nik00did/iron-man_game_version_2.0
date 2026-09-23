import { isSoundEnabled } from "../../constants.ts"
import { addAudioElement } from "../../utils.ts"

export class Sound {
    audio: HTMLAudioElement

    constructor(src: string) {
        this.audio = addAudioElement(src)
    }

    play(): void {
        if (!isSoundEnabled())
            return

        const playing = this.audio.play()

        if (playing)
            playing.catch((e: unknown): void => console.log(e))
    }

    playFromStart(): void {
        this.audio.currentTime = 0
        this.play()
    }

    stop(): void {
        this.audio.pause()
    }
}
