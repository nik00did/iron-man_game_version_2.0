import { GAME_STATUS } from "@src/constants.ts"
import type { GameControlHandlers } from "@src/logic/components/gameControls.ts"

const ScoreHud = jest.fn()
const GameControls = jest.fn()

jest.unstable_mockModule(
    "@src/logic/components/scoreHud",
    (): { default: jest.Mock } => ({
        default: ScoreHud,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/gameControls.ts",
    (): { GameControls: jest.Mock } => ({
        GameControls,
    }),
)

const { GameDisplay } = await import("@src/logic/components/gameDisplay.ts")

describe("GameDisplay", () => {
    let hud: { draw: jest.Mock }
    let controls: { sync: jest.Mock; setRunStats: jest.Mock }
    let handlers: GameControlHandlers
    let root: HTMLElement

    beforeEach(() => {
        hud = { draw: jest.fn() }
        controls = { sync: jest.fn(), setRunStats: jest.fn() }
        handlers = {
            onStart: jest.fn(),
            onPause: jest.fn(),
            onResume: jest.fn(),
            onRestart: jest.fn(),
        }
        root = {} as HTMLElement
        ScoreHud.mockReset()
        GameControls.mockReset()
        ScoreHud.mockImplementation(() => hud)
        GameControls.mockImplementation(() => controls)
    })

    it("creates the canvas hud and overlay controls", () => {
        const display = new GameDisplay(root, handlers)

        expect(ScoreHud).toHaveBeenCalledTimes(1)
        expect(GameControls).toHaveBeenCalledWith(root, handlers)
        expect(display.hud).toBe(hud)
        expect(display.controls).toBe(controls)
    })

    it("syncs overlay status and run stats together", () => {
        const display = new GameDisplay(root, handlers)

        display.sync(GAME_STATUS.PAUSED, 11.8, 2)

        expect(controls.sync).toHaveBeenCalledWith(GAME_STATUS.PAUSED)
        expect(controls.setRunStats).toHaveBeenCalledWith(11.8, 2)
    })

    it("draws the canvas hud", () => {
        const display = new GameDisplay(root, handlers)
        const ctx = {} as CanvasRenderingContext2D

        display.draw(ctx, 11, [12, 8, 3], 2, 40)

        expect(hud.draw).toHaveBeenCalledWith(ctx, 11, [12, 8, 3], 2, 40)
    })
})
