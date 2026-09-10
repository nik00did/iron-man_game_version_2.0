import { GAME_CONTROLS, GAME_STATUS } from "@src/constants.js"
import { GameControls } from "@src/logic/components/gameControls.js"

type ElementMock = {
    className: string
    hidden: boolean
    type: string
    addEventListener: jest.Mock
    setAttribute: jest.Mock
}

function createEl(): ElementMock {
    return {
        className: "",
        hidden: false,
        type: "",
        addEventListener: jest.fn(),
        setAttribute: jest.fn(),
    }
}

function getClick(element: HTMLButtonElement): () => void {
    const matched = (element.addEventListener as unknown as jest.Mock).mock.calls.find(
        (call) => call[0] === "click",
    )

    return matched[1] as () => void
}

describe("GameControls", () => {
    let root: { appendChild: jest.Mock }
    let elements: ElementMock[]
    let onStart: jest.Mock
    let onPause: jest.Mock
    let onResume: jest.Mock
    let onRestart: jest.Mock

    beforeEach(() => {
        elements = []
        root = { appendChild: jest.fn() }
        onStart = jest.fn()
        onPause = jest.fn()
        onResume = jest.fn()
        onRestart = jest.fn()
        Object.defineProperty(globalThis, "document", {
            configurable: true,
            value: {
                createElement: jest.fn((): ElementMock => {
                    const element = createEl()
                    elements.push(element)

                    return element
                }),
            },
        })
    })

    afterEach(() => {
        Reflect.deleteProperty(globalThis, "document")
    })

    function createControls(): GameControls {
        return new GameControls(root as unknown as HTMLElement, {
            onStart,
            onPause,
            onResume,
            onRestart,
        })
    }

    it("creates the veil and four buttons on the root", () => {
        const controls = createControls()

        expect(document.createElement).toHaveBeenCalledWith("div")
        expect(document.createElement).toHaveBeenCalledWith("button")
        expect(root.appendChild).toHaveBeenCalledTimes(5)
        expect(controls.veil.className).toBe(GAME_CONTROLS.VEIL_CLASS)
        expect(controls.startButton.className).toBe(
            `${GAME_CONTROLS.BUTTON_CLASS} ${GAME_CONTROLS.START_CLASS}`,
        )
        expect(controls.startButton.type).toBe("button")
        expect(controls.startButton.setAttribute).toHaveBeenCalledWith(
            "aria-label",
            "Start",
        )
        expect(controls.pauseButton.setAttribute).toHaveBeenCalledWith(
            "aria-label",
            "Pause",
        )
        expect(controls.resumeButton.setAttribute).toHaveBeenCalledWith(
            "aria-label",
            "Resume",
        )
        expect(controls.restartButton.setAttribute).toHaveBeenCalledWith(
            "aria-label",
            "Restart",
        )
    })

    it("shows the veil and start button when idle", () => {
        const controls = createControls()

        expect(controls.veil.hidden).toBe(false)
        expect(controls.startButton.hidden).toBe(false)
        expect(controls.pauseButton.hidden).toBe(true)
        expect(controls.resumeButton.hidden).toBe(true)
        expect(controls.restartButton.hidden).toBe(true)
    })

    it("shows only pause when playing", () => {
        const controls = createControls()

        controls.sync(GAME_STATUS.PLAYING)

        expect(controls.veil.hidden).toBe(true)
        expect(controls.startButton.hidden).toBe(true)
        expect(controls.pauseButton.hidden).toBe(false)
        expect(controls.resumeButton.hidden).toBe(true)
        expect(controls.restartButton.hidden).toBe(true)
    })

    it("shows the veil and resume when paused", () => {
        const controls = createControls()

        controls.sync(GAME_STATUS.PAUSED)

        expect(controls.veil.hidden).toBe(false)
        expect(controls.pauseButton.hidden).toBe(true)
        expect(controls.resumeButton.hidden).toBe(false)
        expect(controls.restartButton.hidden).toBe(true)
        expect(controls.startButton.hidden).toBe(true)
    })

    it("shows the veil and restart when crashed", () => {
        const controls = createControls()

        controls.sync(GAME_STATUS.CRASHED)

        expect(controls.veil.hidden).toBe(false)
        expect(controls.restartButton.hidden).toBe(false)
        expect(controls.startButton.hidden).toBe(true)
        expect(controls.pauseButton.hidden).toBe(true)
        expect(controls.resumeButton.hidden).toBe(true)
    })

    it("calls the matching handler when a button is clicked", () => {
        const controls = createControls()

        getClick(controls.startButton)()
        getClick(controls.pauseButton)()
        getClick(controls.resumeButton)()
        getClick(controls.restartButton)()

        expect(onStart).toHaveBeenCalledTimes(1)
        expect(onPause).toHaveBeenCalledTimes(1)
        expect(onResume).toHaveBeenCalledTimes(1)
        expect(onRestart).toHaveBeenCalledTimes(1)
    })
})
