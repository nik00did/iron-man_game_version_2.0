import { SCORE_HUD } from "@src/constants.js"
import { ScoreHud } from "@src/logic/components/scoreHud.js"

type HudCtx = {
    canvas: { width: number }
    save: jest.Mock
    restore: jest.Mock
    fillText: jest.Mock
    font: string
    textBaseline: string
    fillStyle: string
    textAlign: string
}

function createCtx(): HudCtx {
    return {
        canvas: { width: 1000 },
        save: jest.fn(),
        restore: jest.fn(),
        fillText: jest.fn(),
        font: "",
        textBaseline: "",
        fillStyle: "",
        textAlign: "",
    }
}

describe("ScoreHud", () => {
    describe("drawScore", () => {
        it("draws the labeled score at the top center", () => {
            const hud = new ScoreHud()
            const ctx = createCtx()

            hud.drawScore(ctx as unknown as CanvasRenderingContext2D, 11.23)

            expect(ctx.font).toBe(SCORE_HUD.FONT)
            expect(ctx.textBaseline).toBe("top")
            expect(ctx.fillStyle).toBe(SCORE_HUD.SCORE_COLOR)
            expect(ctx.textAlign).toBe("center")
            expect(ctx.fillText).toHaveBeenCalledWith(
                "Your score: 11.23s",
                500,
                SCORE_HUD.SCORE_Y,
            )
        })
    })

    describe("drawRating", () => {
        it("draws ranked scores top-left with rank colors", () => {
            const hud = new ScoreHud()
            const ctx = createCtx()
            const topScores = [10, 8, 3]
            const lineHeight = SCORE_HUD.FONT_SIZE + SCORE_HUD.RANK_GAP

            hud.drawRating(ctx as unknown as CanvasRenderingContext2D, topScores)

            expect(ctx.textAlign).toBe("left")
            expect(ctx.fillText).toHaveBeenCalledTimes(3)
            expect(ctx.fillText).toHaveBeenNthCalledWith(
                1,
                "1. 10.00s",
                SCORE_HUD.RANK_X,
                SCORE_HUD.RANK_Y,
            )
            expect(ctx.fillText).toHaveBeenNthCalledWith(
                2,
                "2. 8.00s",
                SCORE_HUD.RANK_X,
                SCORE_HUD.RANK_Y + lineHeight,
            )
            expect(ctx.fillText).toHaveBeenNthCalledWith(
                3,
                "3. 3.00s",
                SCORE_HUD.RANK_X,
                SCORE_HUD.RANK_Y + lineHeight * 2,
            )
            expect(ctx.fillStyle).toBe(SCORE_HUD.RANK_COLORS[2])
        })

        it("does not draw when there are no scores", () => {
            const hud = new ScoreHud()
            const ctx = createCtx()

            hud.drawRating(ctx as unknown as CanvasRenderingContext2D, [])

            expect(ctx.fillText).not.toHaveBeenCalled()
        })
    })

    describe("draw", () => {
        let drawScore: jest.SpyInstance
        let drawRating: jest.SpyInstance

        afterEach(() => {
            drawScore.mockRestore()
            drawRating.mockRestore()
        })

        it("saves context, draws score and rating, then restores", () => {
            const hud = new ScoreHud()
            const ctx = createCtx()
            const topScores = [10, 8]
            drawScore = jest.spyOn(hud, "drawScore").mockImplementation((): void => {})
            drawRating = jest
                .spyOn(hud, "drawRating")
                .mockImplementation((): void => {})

            hud.draw(
                ctx as unknown as CanvasRenderingContext2D,
                11.23,
                topScores,
            )

            expect(ctx.save).toHaveBeenCalledTimes(1)
            expect(drawScore).toHaveBeenCalledWith(ctx, 11.23)
            expect(drawRating).toHaveBeenCalledWith(ctx, topScores)
            expect(ctx.restore).toHaveBeenCalledTimes(1)
        })
    })
})
