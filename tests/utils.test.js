import { addAudioElement } from "@src/utils.js"

const SRC = "sound.mp3"

describe("addAudioElement", () => {
    let setAttribute
    let appendChild
    let audio

    beforeEach(() => {
        setAttribute = jest.fn()
        appendChild = jest.fn()
        audio = { src: "", setAttribute, style: {} }

        globalThis.document = {
            createElement: jest.fn(() => audio),
            body: { appendChild },
        }
    })

    afterEach(() => {
        delete globalThis.document
    })

    it("creates a hidden audio element, configures it, and appends it to the body", () => {
        const result = addAudioElement(SRC)

        expect(document.createElement).toHaveBeenCalledWith("audio")
        expect(audio.src).toBe(SRC)
        expect(setAttribute).toHaveBeenCalledTimes(2)
        expect(setAttribute).toHaveBeenCalledWith("preload", "auto")
        expect(setAttribute).toHaveBeenCalledWith("controls", "none")
        expect(audio.style.display).toBe("none")
        expect(appendChild).toHaveBeenCalledWith(audio)
        expect(result).toBe(audio)
    })
})
