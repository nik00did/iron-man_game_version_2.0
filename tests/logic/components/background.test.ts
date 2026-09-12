import { CANVAS, SKY } from "@src/constants.js"
import { Background } from "@src/logic/components/background.js"
import { skyColorsAt } from "@src/logic/components/sky.js"

describe("Background", () => {
    describe("update", () => {
        it("fills a vertical gradient for the current sky colors", () => {
            const background = new Background()
            const addColorStop = jest.fn()
            const gradient = { addColorStop }
            const ctx = {
                canvas: { width: CANVAS.width, height: CANVAS.height },
                createLinearGradient: jest.fn(() => gradient),
                fillRect: jest.fn(),
                fillStyle: "",
            }
            const { zenith, horizon } = skyColorsAt(SKY.PERIOD_MS)

            background.update(
                ctx as unknown as CanvasRenderingContext2D,
                SKY.PERIOD_MS,
            )

            expect(ctx.createLinearGradient).toHaveBeenCalledWith(
                0,
                0,
                0,
                CANVAS.height,
            )
            expect(addColorStop).toHaveBeenCalledWith(0, zenith)
            expect(addColorStop).toHaveBeenCalledWith(1, horizon)
            expect(ctx.fillStyle).toBe(gradient)
            expect(ctx.fillRect).toHaveBeenCalledWith(
                0,
                0,
                CANVAS.width,
                CANVAS.height,
            )
        })
    })
})
