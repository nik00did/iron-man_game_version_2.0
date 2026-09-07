type AudioMock = {
    play: jest.Mock
    pause: jest.Mock
    currentTime: number
}

const addAudioElement = jest.fn()

jest.unstable_mockModule("@src/utils.js", (): { addAudioElement: jest.Mock } => ({
    addAudioElement,
}))

const { Sound } = await import("@src/logic/components/sound.js")

const SRC = "fight.mp3"

describe("Sound", () => {
    let play: jest.Mock
    let pause: jest.Mock
    let audio: AudioMock

    beforeEach(() => {
        play = jest.fn()
        pause = jest.fn()
        audio = { play, pause, currentTime: 12 }
        addAudioElement.mockReset()
        addAudioElement.mockReturnValue(audio)
    })

    it("creates audio via addAudioElement", () => {
        const sound = new Sound(SRC)

        expect(addAudioElement).toHaveBeenCalledWith(SRC)
        expect(sound.audio).toBe(audio)
    })

    it("play() calls the audio play method", () => {
        const sound = new Sound(SRC)

        sound.play()

        expect(play).toHaveBeenCalledTimes(1)
    })

    it("play() attaches catch when audio.play returns a thenable", () => {
        const catchFn = jest.fn()
        play.mockReturnValue({ catch: catchFn })
        const sound = new Sound(SRC)

        sound.play()

        expect(catchFn).toHaveBeenCalledTimes(1)
        expect(catchFn).toHaveBeenCalledWith(expect.any(Function))
    })

    it("play() does not throw when audio.play returns a falsy value", () => {
        play.mockReturnValue(undefined)
        const sound = new Sound(SRC)

        expect(() => sound.play()).not.toThrow()
        expect(play).toHaveBeenCalledTimes(1)
    })

    it("stop() pauses the audio", () => {
        const sound = new Sound(SRC)

        sound.stop()

        expect(pause).toHaveBeenCalledTimes(1)
    })

    it("playFromStart() rewinds then plays", () => {
        const sound = new Sound(SRC)

        sound.playFromStart()

        expect(audio.currentTime).toBe(0)
        expect(play).toHaveBeenCalledTimes(1)
    })
})
