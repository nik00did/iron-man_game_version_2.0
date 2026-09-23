import { addAudioElement, assetBase, publicAsset, randomInt } from "@src/utils.ts"

type AudioMock = {
    src: string
    setAttribute: jest.Mock
    style: { display?: string }
}

const SRC = "sound.mp3"

describe("addAudioElement", () => {
    let setAttribute: jest.Mock
    let appendChild: jest.Mock
    let audio: AudioMock

    beforeEach(() => {
        setAttribute = jest.fn()
        appendChild = jest.fn()
        audio = { src: "", setAttribute, style: {} }

        Object.defineProperty(globalThis, "document", {
            configurable: true,
            value: {
                createElement: jest.fn(() => audio),
                body: { appendChild },
            },
        })
    })

    afterEach(() => {
        Reflect.deleteProperty(globalThis, "document")
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

describe("assetBase", () => {
    it("falls back to / when import.meta.env.BASE_URL is missing", () => {
        expect(assetBase()).toBe("/")
    })
})

describe("publicAsset", () => {
    it("prefixes the path with the asset base", () => {
        expect(publicAsset("assets/icons")).toBe("/assets/icons")
        expect(publicAsset("assets/sounds")).toBe("/assets/sounds")
    })

    it("strips a leading slash from the path", () => {
        expect(publicAsset("/assets/icons")).toBe("/assets/icons")
    })
})

describe("randomInt", () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("returns the minimum when Math.random is 0", () => {
        jest.spyOn(Math, "random").mockReturnValue(0)

        expect(randomInt(320, 450)).toBe(320)
        expect(randomInt(-6, -3)).toBe(-6)
    })

    it("returns the maximum when Math.random is just below 1", () => {
        jest.spyOn(Math, "random").mockReturnValue(0.999999)

        expect(randomInt(320, 450)).toBe(450)
        expect(randomInt(-6, -3)).toBe(-3)
    })
})
