import { BLAST, CANVAS, SKY } from "@src/constants.ts"
import { Blast } from "@src/logic/components/shooting"

describe("Blast", () => {
    describe("constructor", () => {
        it("stores position and uses blast size and speed", () => {
            const blast = new Blast({ x: 100, y: 80 })

            expect(blast).toMatchObject({
                x: 100,
                y: 80,
                width: BLAST.SIZE,
                height: BLAST.SIZE,
                speedX: BLAST.SPEED,
            })
        })

        it("uses the given speedX", () => {
            const blast = new Blast({ x: 0, y: 0, speedX: 4 })

            expect(blast.speedX).toBe(4)
        })
    })

    describe("update", () => {
        it("fills a gold square on a dark sky", () => {
            const blast = new Blast({ x: 8, y: 12 })
            const ctx = {
                canvas: { height: CANVAS.height },
                fillRect: jest.fn(),
                fillStyle: "",
            }

            blast.update(ctx as unknown as CanvasRenderingContext2D, SKY.PERIOD_MS * 3)

            expect(ctx.fillStyle).toBe(BLAST.COLOR)
            expect(ctx.fillRect).toHaveBeenCalledWith(8, 12, BLAST.SIZE, BLAST.SIZE)
        })

        it("fills a dark square on a light horizon", () => {
            const blast = new Blast({ x: 8, y: CANVAS.height })
            const ctx = {
                canvas: { height: CANVAS.height },
                fillRect: jest.fn(),
                fillStyle: "",
            }

            blast.update(ctx as unknown as CanvasRenderingContext2D, 0)

            expect(ctx.fillStyle).toBe(BLAST.COLOR_DARK)
        })
    })

    describe("move", () => {
        it("adds speedX to x and keeps y", () => {
            const blast = new Blast({ x: 10, y: 20, speedX: 10 })

            blast.move()

            expect(blast.x).toBe(20)
            expect(blast.y).toBe(20)
        })
    })

    describe("isOffScreen", () => {
        it("returns false while the blast is inside the canvas", () => {
            const blast = new Blast({ x: 10, y: 20 })

            expect(blast.isOffScreen(CANVAS)).toBe(false)
        })

        it("returns true when the blast has fully left the right edge", () => {
            const blast = new Blast({ x: CANVAS.width, y: 20 })

            expect(blast.isOffScreen(CANVAS)).toBe(true)
        })

        it("returns true when the blast has fully left the left edge", () => {
            const blast = new Blast({ x: -BLAST.SIZE, y: 20 })

            expect(blast.isOffScreen(CANVAS)).toBe(true)
        })

        it("returns true when the blast has fully left the top or bottom", () => {
            expect(new Blast({ x: 10, y: -BLAST.SIZE }).isOffScreen(CANVAS)).toBe(
                true,
            )
            expect(new Blast({ x: 10, y: CANVAS.height }).isOffScreen(CANVAS)).toBe(
                true,
            )
        })
    })
})
